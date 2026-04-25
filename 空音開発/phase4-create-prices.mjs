#!/usr/bin/env node
// Phase 4: Kuon サブスクリプション用 14 Price 作成スクリプト
//
// 動作内容:
//   1. 既存の月額 JPY Price 4 件を update:
//      - lookup_key / metadata / tax_behavior='inclusive' を付与
//      - currency_options で USD/EUR/GBP/CAD/AUD/CHF を追加
//   2. 年額 Global Price 4 件を新規作成 (JPY primary + 6 通貨 currency_options)
//   3. LatAm 専用 USD Price 6 件を新規作成 (Prelude/Concerto/Symphony × 月額/年額)
//      ※ Opus は LatAm 対象外
//
// 実行方法:
//   cd /Users/kotaro/kuon-rnd/空音開発
//   npm install stripe
//   STRIPE_SECRET_KEY=rk_live_xxxx node phase4-create-prices.mjs
//
// 注意:
//   - Live mode での実行を想定
//   - 冪等性: 既に currency_options が設定済みの場合は Stripe がエラーを返す
//     → 失敗したらログを確認しスキップまたは手動修正

import Stripe from 'stripe';
import { writeFileSync } from 'node:fs';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('❌ STRIPE_SECRET_KEY が設定されていません');
  console.error('実行例: STRIPE_SECRET_KEY=rk_live_xxxx node phase4-create-prices.mjs');
  process.exit(1);
}
if (!key.startsWith('rk_live_') && !key.startsWith('sk_live_')) {
  console.error(`⚠️  WARNING: Live mode キーではないように見えます (prefix: ${key.slice(0, 8)}...)`);
  console.error('続行する場合は 5 秒以内に Ctrl+C で停止しなければ実行します');
  await new Promise((r) => setTimeout(r, 5000));
}

const stripe = new Stripe(key, { apiVersion: '2024-06-20' });

// ============================================================
// 既知のデータ
// ============================================================

const PRODUCTS = {
  prelude: 'prod_UOiR1Snq8PFuW2',
  concerto: 'prod_UOiikPTpBHObTp',
  symphony: 'prod_UOiko0uQYNp6Cu',
  opus: 'prod_UOiuFKs8gHaSQk',
};

// Phase 3 で商品作成時に同時作成された月額 JPY Price（default）
const EXISTING_MONTHLY_JPY = {
  prelude: 'price_1TPv0sGbZ5gwwaLkF775xLSJ',
  concerto: 'price_1TPvGfGbZ5gwwaLkTs1SfcXx',
  symphony: 'price_1TPvJ3GbZ5gwwaLk0pGUYw4a',
  opus: 'price_1TPvT5GbZ5gwwaLkMNUon9gc',
};

// stripe-setup-guide-v2.md §4.3 より抜粋
// JPY は整数そのまま、その他通貨はセント単位 (USD $7.99 = 799)
const PRICING = {
  prelude: {
    monthly: {
      jpy: 780,
      usd: 799, eur: 749, gbp: 649, cad: 999, aud: 1099, chf: 899,
      latam_usd: 399,
    },
    annual: {
      jpy: 7800,
      usd: 7990, eur: 7490, gbp: 6490, cad: 9990, aud: 10990, chf: 8990,
      latam_usd: 3990,
    },
  },
  concerto: {
    monthly: {
      jpy: 1480,
      usd: 1499, eur: 1399, gbp: 1199, cad: 1899, aud: 2099, chf: 1699,
      latam_usd: 799,
    },
    annual: {
      jpy: 14800,
      usd: 14990, eur: 13990, gbp: 11990, cad: 18990, aud: 20990, chf: 16990,
      latam_usd: 7990,
    },
  },
  symphony: {
    monthly: {
      jpy: 2480,
      usd: 2499, eur: 2299, gbp: 1999, cad: 3199, aud: 3499, chf: 2799,
      latam_usd: 1299,
    },
    annual: {
      jpy: 24800,
      usd: 24990, eur: 22990, gbp: 19990, cad: 31990, aud: 34990, chf: 27990,
      latam_usd: 12990,
    },
  },
  opus: {
    monthly: {
      jpy: 5980,
      usd: 5999, eur: 5499, gbp: 4999, cad: 7999, aud: 8499, chf: 6499,
      // Opus は LatAm 対象外
    },
    annual: {
      jpy: 59800,
      usd: 59990, eur: 54990, gbp: 49990, cad: 79990, aud: 84990, chf: 64990,
    },
  },
};

// ============================================================
// ヘルパー
// ============================================================

function buildCurrencyOptions(prices) {
  const keys = ['usd', 'eur', 'gbp', 'cad', 'aud', 'chf'];
  const opts = {};
  for (const k of keys) {
    if (prices[k] != null) {
      opts[k] = {
        unit_amount: prices[k],
        tax_behavior: 'inclusive',
      };
    }
  }
  return opts;
}

function planLabel(plan) {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

// ============================================================
// 実行関数
// ============================================================

async function updateExistingMonthlyJpy(plan) {
  const priceId = EXISTING_MONTHLY_JPY[plan];
  const p = PRICING[plan].monthly;
  console.log(`\n📝 Updating ${planLabel(plan)} Monthly Global (existing ${priceId})`);

  // 現在の tax_behavior を確認
  const current = await stripe.prices.retrieve(priceId);
  const updateParams = {
    lookup_key: `${plan}_monthly_global`,
    nickname: `${planLabel(plan)} Monthly Global (JPY base + 6 currencies)`,
    metadata: {
      plan_tier: plan,
      interval: 'monthly',
      region: 'global',
    },
    currency_options: buildCurrencyOptions(p),
    transfer_lookup_key: true,
  };
  if (current.tax_behavior === 'unspecified') {
    updateParams.tax_behavior = 'inclusive';
  } else {
    console.log(`   (tax_behavior already=${current.tax_behavior}, skip update)`);
  }

  const updated = await stripe.prices.update(priceId, updateParams);
  console.log(`   ✅ OK: ${updated.id}  tax_behavior=${updated.tax_behavior}  lookup_key=${updated.lookup_key}`);
  return updated.id;
}

async function createAnnualGlobal(plan) {
  const p = PRICING[plan].annual;
  console.log(`\n➕ Creating ${planLabel(plan)} Annual Global`);

  const price = await stripe.prices.create({
    product: PRODUCTS[plan],
    unit_amount: p.jpy,
    currency: 'jpy',
    recurring: { interval: 'year' },
    tax_behavior: 'inclusive',
    lookup_key: `${plan}_annual_global`,
    nickname: `${planLabel(plan)} Annual Global (JPY base + 6 currencies)`,
    metadata: {
      plan_tier: plan,
      interval: 'annual',
      region: 'global',
    },
    currency_options: buildCurrencyOptions(p),
    transfer_lookup_key: true,
  });
  console.log(`   ✅ Created: ${price.id}  JPY ¥${p.jpy.toLocaleString()}/年`);
  return price.id;
}

async function createLatam(plan, interval) {
  if (plan === 'opus') return null;
  const p = PRICING[plan][interval];
  if (p.latam_usd == null) return null;

  console.log(`\n➕ Creating ${planLabel(plan)} ${interval} LatAm USD`);

  const price = await stripe.prices.create({
    product: PRODUCTS[plan],
    unit_amount: p.latam_usd,
    currency: 'usd',
    recurring: { interval: interval === 'monthly' ? 'month' : 'year' },
    tax_behavior: 'inclusive',
    lookup_key: `${plan}_${interval}_latam`,
    nickname: `${planLabel(plan)} ${interval === 'monthly' ? 'Monthly' : 'Annual'} LatAm USD`,
    metadata: {
      plan_tier: plan,
      interval,
      region: 'latam',
    },
    transfer_lookup_key: true,
  });
  console.log(`   ✅ Created: ${price.id}  $${(p.latam_usd / 100).toFixed(2)}`);
  return price.id;
}

// ============================================================
// メイン
// ============================================================

async function main() {
  console.log('🚀 Phase 4: Kuon サブスクリプション用 14 Price 作成\n');
  console.log(`Mode: ${key.startsWith('rk_live_') || key.startsWith('sk_live_') ? 'LIVE' : 'TEST'}`);
  console.log('='.repeat(70));

  const results = {
    prelude: { monthly: { global: null, latam: null }, annual: { global: null, latam: null } },
    concerto: { monthly: { global: null, latam: null }, annual: { global: null, latam: null } },
    symphony: { monthly: { global: null, latam: null }, annual: { global: null, latam: null } },
    opus: { monthly: { global: null, latam: null }, annual: { global: null, latam: null } },
  };

  // Step 1: 既存月額 JPY Price に currency_options + lookup_key + tax_behavior を追加
  console.log('\n━━━ STEP 1: 既存月額 JPY Price を update ━━━');
  for (const plan of ['prelude', 'concerto', 'symphony', 'opus']) {
    try {
      results[plan].monthly.global = await updateExistingMonthlyJpy(plan);
    } catch (e) {
      console.error(`   ❌ Failed: ${e.message}`);
      results[plan].monthly.global = EXISTING_MONTHLY_JPY[plan] + ' (update_failed)';
    }
  }

  // Step 2: 年額 Global Price を新規作成
  console.log('\n━━━ STEP 2: 年額 Global Price を作成 ━━━');
  for (const plan of ['prelude', 'concerto', 'symphony', 'opus']) {
    try {
      results[plan].annual.global = await createAnnualGlobal(plan);
    } catch (e) {
      console.error(`   ❌ Failed: ${e.message}`);
    }
  }

  // Step 3: LatAm Price を新規作成 (Opus 除く)
  console.log('\n━━━ STEP 3: LatAm Price を作成 (Prelude/Concerto/Symphony) ━━━');
  for (const plan of ['prelude', 'concerto', 'symphony']) {
    try {
      results[plan].monthly.latam = await createLatam(plan, 'monthly');
    } catch (e) {
      console.error(`   ❌ ${plan} monthly latam Failed: ${e.message}`);
    }
    try {
      results[plan].annual.latam = await createLatam(plan, 'annual');
    } catch (e) {
      console.error(`   ❌ ${plan} annual latam Failed: ${e.message}`);
    }
  }

  // ============================================================
  // 結果出力
  // ============================================================
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ Phase 4 完了');
  console.log('='.repeat(70));

  const summary = {
    timestamp: new Date().toISOString(),
    mode: key.startsWith('rk_live_') || key.startsWith('sk_live_') ? 'live' : 'test',
    products: PRODUCTS,
    prices: results,
  };

  // JSON 出力ファイル (Claude が読み取るため)
  const outputPath = new URL('./phase4-output.json', import.meta.url).pathname;
  writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  console.log(`\n📄 結果を保存: ${outputPath}`);

  // TypeScript 定数形式も出力
  console.log('\n📋 kuon-rnd-auth-worker/src/stripe-prices.ts 用の定数:');
  console.log('-'.repeat(70));
  console.log(`// Auto-generated by phase4-create-prices.mjs at ${summary.timestamp}
export const STRIPE_PRODUCTS = {
  prelude: '${PRODUCTS.prelude}',
  concerto: '${PRODUCTS.concerto}',
  symphony: '${PRODUCTS.symphony}',
  opus: '${PRODUCTS.opus}',
} as const;

export const STRIPE_PRICES = {
  prelude: {
    monthly: {
      global: '${results.prelude.monthly.global}',
      latam:  '${results.prelude.monthly.latam}',
    },
    annual: {
      global: '${results.prelude.annual.global}',
      latam:  '${results.prelude.annual.latam}',
    },
  },
  concerto: {
    monthly: {
      global: '${results.concerto.monthly.global}',
      latam:  '${results.concerto.monthly.latam}',
    },
    annual: {
      global: '${results.concerto.annual.global}',
      latam:  '${results.concerto.annual.latam}',
    },
  },
  symphony: {
    monthly: {
      global: '${results.symphony.monthly.global}',
      latam:  '${results.symphony.monthly.latam}',
    },
    annual: {
      global: '${results.symphony.annual.global}',
      latam:  '${results.symphony.annual.latam}',
    },
  },
  opus: {
    monthly: {
      global: '${results.opus.monthly.global}',
      latam:  null, // Opus は LatAm 対象外
    },
    annual: {
      global: '${results.opus.annual.global}',
      latam:  null,
    },
  },
} as const;

export const LATAM_COUNTRIES = ['MX', 'CL', 'CO', 'PE', 'UY'] as const;
// Argentina は Global Price + Tier A Coupon で対応 (LatAm グループには入れない)
`);

  console.log('\n' + '='.repeat(70));
  console.log('次のステップ:');
  console.log('  1. phase4-output.json を確認 (失敗項目がないか)');
  console.log('  2. Claude にこのファイルを読ませて stripe-ids.md を更新');
  console.log('  3. Stripe Dashboard で目視確認 (Product catalog → 各プラン)');
  console.log('  4. 実行に使った Restricted Key を削除 (セキュリティ)');
}

main().catch((err) => {
  console.error('\n❌ 致命的エラー:', err.message);
  if (err.raw) console.error('Stripe 詳細:', err.raw);
  process.exit(1);
});
