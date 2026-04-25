#!/usr/bin/env node
// Phase 5b: 初月 50% オフ キャンペーン Coupons 作成 (4 件)
//
// 動作内容:
//   全 4 プラン (Prelude / Concerto / Symphony / Opus) に対して
//   初月 50% off の Coupon を新規作成。
//   既存 FIRST100 系 Coupon は legacy として残す (将来別キャンペーンで使用可能)。
//
// 採算性:
//   全プランで初月から黒字 (FIRST100 は Concerto/Symphony が赤字だった)
//
// 実行方法:
//   cd /Users/kotaro/kuon-rnd/空音開発
//   STRIPE_SECRET_KEY=rk_live_xxxx node phase5b-create-half50-coupons.mjs
//
// 使用キー: 制限付きキー (権限: Coupons Write)
//   Phase 5 で使った旧キーが期限切れの場合、新規発行 → 実行 → 期限切れ

import Stripe from 'stripe';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('❌ STRIPE_SECRET_KEY が設定されていません');
  console.error('実行例: STRIPE_SECRET_KEY=rk_live_xxxx node phase5b-create-half50-coupons.mjs');
  process.exit(1);
}
if (!key.startsWith('rk_live_') && !key.startsWith('sk_live_')) {
  console.error(`⚠️  WARNING: Live mode キーではないように見えます (prefix: ${key.slice(0, 8)}...)`);
  console.error('続行する場合は 5 秒以内に Ctrl+C で停止しなければ実行します');
  await new Promise((r) => setTimeout(r, 5000));
}

const stripe = new Stripe(key, { apiVersion: '2024-06-20' });

const PRODUCTS = {
  prelude:  'prod_UOiR1Snq8PFuW2',
  concerto: 'prod_UOiikPTpBHObTp',
  symphony: 'prod_UOiko0uQYNp6Cu',
  opus:     'prod_UOiuFKs8gHaSQk',
};

const COUPONS = [
  {
    id: 'HALF50_PRELUDE',
    name: 'Prelude First Month 50% Off',
    percent_off: 50,
    duration: 'once',
    applies_to: { products: [PRODUCTS.prelude] },
    metadata: {
      plan_tier: 'prelude',
      campaign: 'half50',
      target: '50% of monthly price',
      monthly_only: 'true',
      replaces: 'FIRST100_PRELUDE (legacy, kept)',
    },
  },
  {
    id: 'HALF50_CONCERTO',
    name: 'Concerto First Month 50% Off',
    percent_off: 50,
    duration: 'once',
    applies_to: { products: [PRODUCTS.concerto] },
    metadata: {
      plan_tier: 'concerto',
      campaign: 'half50',
      target: '50% of monthly price',
      monthly_only: 'true',
      replaces: 'FIRST100_CONCERTO (legacy, kept)',
    },
  },
  {
    id: 'HALF50_SYMPHONY',
    name: 'Symphony First Month 50% Off',
    percent_off: 50,
    duration: 'once',
    applies_to: { products: [PRODUCTS.symphony] },
    metadata: {
      plan_tier: 'symphony',
      campaign: 'half50',
      target: '50% of monthly price',
      monthly_only: 'true',
      replaces: 'FIRST100_SYMPHONY (legacy, kept)',
    },
  },
  {
    id: 'HALF50_OPUS',
    name: 'Opus First Month 50% Off',
    percent_off: 50,
    duration: 'once',
    applies_to: { products: [PRODUCTS.opus] },
    metadata: {
      plan_tier: 'opus',
      campaign: 'half50',
      target: '50% of monthly price',
      monthly_only: 'true',
      note: 'NEW - Opus was excluded from FIRST100; HALF50 covers all 4 plans',
    },
  },
];

function summarize(spec) {
  const dur = spec.duration === 'repeating'
    ? `repeating ${spec.duration_in_months}mo`
    : spec.duration;
  return `${spec.percent_off}% off (${dur})`;
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
  console.log('🚀 Phase 5b: 初月 50% オフ Coupons 作成 (4 件)\n');
  console.log(`Mode: ${key.startsWith('rk_live_') || key.startsWith('sk_live_') ? 'LIVE' : 'TEST'}`);
  console.log('='.repeat(70));

  const results = [];
  for (const spec of COUPONS) {
    results.push(await createCoupon(spec));
  }

  console.log('\n\n' + '='.repeat(70));
  console.log('✅ Phase 5b 完了');
  console.log('='.repeat(70));

  const summary = {
    timestamp: new Date().toISOString(),
    mode: key.startsWith('rk_live_') || key.startsWith('sk_live_') ? 'live' : 'test',
    coupons: results,
  };

  // JSON 出力
  try {
    const outputPath = fileURLToPath(new URL('./phase5b-output.json', import.meta.url));
    writeFileSync(outputPath, JSON.stringify(summary, null, 2));
    console.log(`\n📄 結果を保存: ${outputPath}`);
  } catch (e) {
    console.error(`\n⚠️  JSON 保存失敗: ${e.message}`);
  }

  const created = results.filter((r) => r.status === 'created').length;
  const exists = results.filter((r) => r.status === 'exists').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  console.log(`\nSummary: ${created} created / ${exists} already exists / ${failed} failed`);

  console.log('\n📋 stripe-prices.ts に追加する定数:');
  console.log('-'.repeat(70));
  console.log(`half50: {
  prelude:  'HALF50_PRELUDE',
  concerto: 'HALF50_CONCERTO',
  symphony: 'HALF50_SYMPHONY',
  opus:     'HALF50_OPUS',
},`);

  console.log('\n' + '='.repeat(70));
  console.log('次のステップ:');
  console.log('  1. Claude にこのファイルを読ませて stripe-ids.md を更新');
  console.log('  2. Restricted Key を期限切れに (キーを期限切れにする)');
  console.log('  3. Claude にコード更新を依頼 (auth worker + page.tsx + CLAUDE.md)');
}

main().catch((err) => {
  console.error('\n❌ 致命的エラー:', err.message);
  if (err.raw) console.error('Stripe 詳細:', err.raw);
  process.exit(1);
});
