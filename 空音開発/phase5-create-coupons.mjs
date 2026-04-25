#!/usr/bin/env node
// Phase 5: Kuon サブスクリプション用 7 Coupon 作成スクリプト
//
// 動作内容:
//   1. FIRST100 系 3 件 (percent_off で全通貨対応、各プランの applies_to で限定)
//   2. REFERRAL_1MONTH_FREE 1 件 (100% off, once)
//   3. TIER_A_PARTNER_50 / TIER_C_GRADUATE_25 (固定割引, forever)
//   4. RETENTION_50_3MONTHS (50% off, 3ヶ月のみ)
//
// 実行方法:
//   cd /Users/kotaro/kuon-rnd/空音開発
//   STRIPE_SECRET_KEY=rk_live_xxxx node phase5-create-coupons.mjs
//
// 注意:
//   - Live mode 想定
//   - 冪等性: 同じ ID で既に存在する場合は skip
//   - FIRST100 / RETENTION は monthly プランのみアプリ側で attach する設計

import Stripe from 'stripe';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('❌ STRIPE_SECRET_KEY が設定されていません');
  console.error('実行例: STRIPE_SECRET_KEY=rk_live_xxxx node phase5-create-coupons.mjs');
  process.exit(1);
}
if (!key.startsWith('rk_live_') && !key.startsWith('sk_live_')) {
  console.error(`⚠️  WARNING: Live mode キーではないように見えます (prefix: ${key.slice(0, 8)}...)`);
  console.error('続行する場合は 5 秒以内に Ctrl+C で停止しなければ実行します');
  await new Promise((r) => setTimeout(r, 5000));
}

const stripe = new Stripe(key, { apiVersion: '2024-06-20' });

// ============================================================
// Product IDs (stripe-ids.md と同期済み)
// ============================================================

const PRODUCTS = {
  prelude: 'prod_UOiR1Snq8PFuW2',
  concerto: 'prod_UOiikPTpBHObTp',
  symphony: 'prod_UOiko0uQYNp6Cu',
  opus: 'prod_UOiuFKs8gHaSQk',
};

// ============================================================
// Coupon 定義
// ============================================================
//
// percent_off の根拠 (¥100 を目標に逆算):
//   Prelude  ¥780  → 100/780  = 12.8205% remaining → 87.18% off  (¥780 - ¥680 = ¥100)
//   Concerto ¥1,480 → 100/1480 = 6.7568% remaining → 93.24% off  (¥1,480 - ¥1,380 = ¥100)
//   Symphony ¥2,480 → 100/2480 = 4.0323% remaining → 95.97% off  (¥2,480 - ¥2,380 = ¥100)
//
// 注意: Stripe percent_off は小数点以下 2 桁までしか受け付けない
//
// JPY 以外の通貨では Stripe が自動で percentage を適用するため、
// USD/EUR/GBP 等は ~$1.0 / ~€1.0 / ~£1.0 相当の "essentially free" になる。
// LatAm USD は元々 PPP 割引価格のため、さらに深い割引（~$0.51）になる。

const COUPONS = [
  // ---- FIRST100 系 (3件) — 初月 ¥100 / $1 相当 ----
  {
    id: 'FIRST100_PRELUDE',
    name: 'Prelude First Month ¥100',
    percent_off: 87.18,
    duration: 'once',
    applies_to: { products: [PRODUCTS.prelude] },
    metadata: {
      plan_tier: 'prelude',
      campaign: 'first100',
      target_amount: '100 JPY equivalent',
      monthly_only: 'true',
    },
  },
  {
    id: 'FIRST100_CONCERTO',
    name: 'Concerto First Month ¥100',
    percent_off: 93.24,
    duration: 'once',
    applies_to: { products: [PRODUCTS.concerto] },
    metadata: {
      plan_tier: 'concerto',
      campaign: 'first100',
      target_amount: '100 JPY equivalent',
      monthly_only: 'true',
    },
  },
  {
    id: 'FIRST100_SYMPHONY',
    name: 'Symphony First Month ¥100',
    percent_off: 95.97,
    duration: 'once',
    applies_to: { products: [PRODUCTS.symphony] },
    metadata: {
      plan_tier: 'symphony',
      campaign: 'first100',
      target_amount: '100 JPY equivalent',
      monthly_only: 'true',
    },
  },

  // ---- 紹介報酬 (1件) ----
  {
    id: 'REFERRAL_1MONTH_FREE',
    name: 'Referral Reward — 1 Month Free',
    percent_off: 100,
    duration: 'once',
    metadata: {
      campaign: 'referral',
      reward_for: 'referrer',
      monthly_only: 'true',
    },
  },

  // ---- パートナー / 卒業生 (2件) ----
  {
    id: 'TIER_A_PARTNER_50',
    name: 'Tier A Partner — 50% Forever',
    percent_off: 50,
    duration: 'forever',
    metadata: {
      campaign: 'partner',
      tier: 'A',
      note: 'Argentina/partner deals — manually issued',
    },
  },
  {
    id: 'TIER_C_GRADUATE_25',
    name: 'Tier C Graduate — 25% Forever',
    percent_off: 25,
    duration: 'forever',
    metadata: {
      campaign: 'graduate',
      tier: 'C',
      note: 'Post-graduation continuation discount',
    },
  },

  // ---- 解約抑止 (1件) ----
  {
    id: 'RETENTION_50_3MONTHS',
    name: 'Retention — 50% Off for 3 Months',
    percent_off: 50,
    duration: 'repeating',
    duration_in_months: 3,
    metadata: {
      campaign: 'retention',
      use_case: 'cancellation flow',
      monthly_only: 'true',
    },
  },
];

// ============================================================
// 実行
// ============================================================

function summarize(spec) {
  if (spec.percent_off != null) {
    const dur = spec.duration === 'repeating'
      ? `repeating ${spec.duration_in_months}mo`
      : spec.duration;
    return `${spec.percent_off}% off (${dur})`;
  }
  return `${spec.currency.toUpperCase()} ${spec.amount_off} off (${spec.duration})`;
}

async function createCoupon(spec) {
  console.log(`\n➕ Creating Coupon: ${spec.id}`);
  try {
    const coupon = await stripe.coupons.create(spec);
    console.log(`   ✅ Created: ${coupon.id}  ${summarize(spec)}`);
    if (spec.applies_to?.products) {
      console.log(`      applies_to: ${spec.applies_to.products.join(', ')}`);
    }
    return { id: spec.id, status: 'created', stripeId: coupon.id };
  } catch (err) {
    if (
      err.code === 'resource_already_exists' ||
      (err.message && err.message.toLowerCase().includes('already exists'))
    ) {
      console.log(`   ⚠️  既存: ${spec.id} (skip)`);
      return { id: spec.id, status: 'exists' };
    }
    console.error(`   ❌ Failed: ${err.message}`);
    if (err.raw) console.error(`      raw: ${JSON.stringify(err.raw)}`);
    return { id: spec.id, status: 'failed', error: err.message };
  }
}

async function main() {
  console.log('🚀 Phase 5: Kuon サブスクリプション用 7 Coupon 作成\n');
  console.log(`Mode: ${key.startsWith('rk_live_') || key.startsWith('sk_live_') ? 'LIVE' : 'TEST'}`);
  console.log('='.repeat(70));

  const results = [];
  for (const spec of COUPONS) {
    results.push(await createCoupon(spec));
  }

  // ============================================================
  // 結果出力
  // ============================================================
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ Phase 5 完了');
  console.log('='.repeat(70));

  const summary = {
    timestamp: new Date().toISOString(),
    mode: key.startsWith('rk_live_') || key.startsWith('sk_live_') ? 'live' : 'test',
    coupons: results,
  };

  // JSON 出力 (URL エンコードバグ対策: fileURLToPath を使用)
  try {
    const outputPath = fileURLToPath(new URL('./phase5-output.json', import.meta.url));
    writeFileSync(outputPath, JSON.stringify(summary, null, 2));
    console.log(`\n📄 結果を保存: ${outputPath}`);
  } catch (e) {
    console.error(`\n⚠️  JSON 保存失敗 (続行): ${e.message}`);
  }

  // サマリ集計
  const created = results.filter((r) => r.status === 'created').length;
  const exists = results.filter((r) => r.status === 'exists').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  console.log(`\nSummary: ${created} created / ${exists} already exists / ${failed} failed`);

  // TypeScript 定数出力
  console.log('\n📋 kuon-rnd-auth-worker/src/stripe-prices.ts 用の Coupon 定数:');
  console.log('-'.repeat(70));
  console.log(`// Phase 5 で作成済み (${summary.timestamp})
export const COUPON_IDS = {
  first100: {
    prelude:  'FIRST100_PRELUDE',
    concerto: 'FIRST100_CONCERTO',
    symphony: 'FIRST100_SYMPHONY',
    // Opus は対象外
  },
  referral_1month:      'REFERRAL_1MONTH_FREE',
  tier_a_partner:       'TIER_A_PARTNER_50',
  tier_c_graduate:      'TIER_C_GRADUATE_25',
  retention_50_3months: 'RETENTION_50_3MONTHS',
} as const;

// アプリ側ロジック制約:
//   - FIRST100_* / REFERRAL_1MONTH_FREE / RETENTION_50_3MONTHS は
//     Checkout Session 作成時に cycle === 'monthly' の場合のみ attach する
//   - TIER_A_PARTNER_50 / TIER_C_GRADUATE_25 は手動発行 (Promotion Code 経由)
`);

  console.log('\n' + '='.repeat(70));
  console.log('次のステップ:');
  console.log('  1. phase5-output.json を確認');
  console.log('  2. Claude にこのファイルを読ませて stripe-ids.md を更新');
  console.log('  3. Stripe Dashboard で目視確認 (商品 → クーポン)');
  console.log('  4. 実行に使った Restricted Key を削除 (キーを期限切れにする)');
}

main().catch((err) => {
  console.error('\n❌ 致命的エラー:', err.message);
  if (err.raw) console.error('Stripe 詳細:', err.raw);
  process.exit(1);
});
