#!/usr/bin/env node
// Phase 6b: Customer Portal Config 検証 + 修正
//
// 動作内容:
//   現在の Portal Config (bpc_1TPy1rGbZ5gwwaLkKegFAY2z) を取得し、
//   subscription_update.products に全 4 プラン × 14 Price が登録されているか検証。
//   不足があれば自動で更新する。
//
// 目的:
//   顧客が Customer Portal から Symphony 月額 → Prelude 年額 などへ
//   自由にプラン乗換できるようにする。
//   現在の Coupon HALF50 は初回のみ (Auth Worker で抜け道塞ぎ済み) のため、
//   乗換時に再度 HALF50 が乗ることはない。
//
// 実行方法:
//   cd /Users/kotaro/kuon-rnd/空音開発
//   STRIPE_SECRET_KEY=rk_live_xxxx node phase6b-verify-portal.mjs
//
// 使用キー権限:
//   Billing Portal Configurations: Read + Write
//   Products: Read

import Stripe from 'stripe';

const PORTAL_CONFIG_ID = 'bpc_1TPy1rGbZ5gwwaLkKegFAY2z';

const PRODUCT_IDS = {
  prelude:  'prod_UOiR1Snq8PFuW2',
  concerto: 'prod_UOiikPTpBHObTp',
  symphony: 'prod_UOiko0uQYNp6Cu',
  opus:     'prod_UOiuFKs8gHaSQk',
};

const PRICE_IDS = {
  prelude: {
    monthly_global: 'price_1TPv0sGbZ5gwwaLkF775xLSJ',
    annual_global:  'price_1TPvqlGbZ5gwwaLkeF54VNMp',
    monthly_latam:  'price_1TPvqmGbZ5gwwaLklmCHByQ2',
    annual_latam:   'price_1TPvqnGbZ5gwwaLkVwtEBDon',
  },
  concerto: {
    monthly_global: 'price_1TPvGfGbZ5gwwaLkTs1SfcXx',
    annual_global:  'price_1TPvqlGbZ5gwwaLksHXiYo9b',
    monthly_latam:  'price_1TPvqnGbZ5gwwaLkySlg2LNt',
    annual_latam:   'price_1TPvqnGbZ5gwwaLkQtiYIP34',
  },
  symphony: {
    monthly_global: 'price_1TPvJ3GbZ5gwwaLk0pGUYw4a',
    annual_global:  'price_1TPvqmGbZ5gwwaLkWVUsfwgS',
    monthly_latam:  'price_1TPvqoGbZ5gwwaLkQxyvdCHd',
    annual_latam:   'price_1TPvqoGbZ5gwwaLkUrkCOmLW',
  },
  opus: {
    monthly_global: 'price_1TPvT5GbZ5gwwaLkMNUon9gc',
    annual_global:  'price_1TPvqmGbZ5gwwaLkjpdIvHvL',
  },
};

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('❌ STRIPE_SECRET_KEY env var が設定されていません');
  process.exit(1);
}

const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' });

// 期待される subscription_update.products: 全 4 プラン x 全 Prices
const expectedProducts = [
  { product: PRODUCT_IDS.prelude,  prices: Object.values(PRICE_IDS.prelude) },
  { product: PRODUCT_IDS.concerto, prices: Object.values(PRICE_IDS.concerto) },
  { product: PRODUCT_IDS.symphony, prices: Object.values(PRICE_IDS.symphony) },
  { product: PRODUCT_IDS.opus,     prices: Object.values(PRICE_IDS.opus) },
];

console.log('\n[Phase 6b] Customer Portal Config 検証開始\n');

const config = await stripe.billingPortal.configurations.retrieve(PORTAL_CONFIG_ID);

console.log('▼ 現在の Portal Config:');
console.log('  ID:', config.id);
console.log('  active:', config.active);
console.log('  features.subscription_update.enabled:', config.features?.subscription_update?.enabled);
console.log('  features.subscription_update.proration_behavior:',
  config.features?.subscription_update?.proration_behavior);
console.log('  features.subscription_update.default_allowed_updates:',
  config.features?.subscription_update?.default_allowed_updates);

const currentProducts = config.features?.subscription_update?.products ?? [];
console.log('  現在登録された Products 数:', currentProducts.length);
for (const p of currentProducts) {
  console.log(`    • ${p.product} (${p.prices.length} prices)`);
}

// 不足を検出
let needsUpdate = false;
const expectedProductIds = expectedProducts.map((p) => p.product);
const currentProductIds = currentProducts.map((p) => p.product);

const missingProducts = expectedProductIds.filter((id) => !currentProductIds.includes(id));
if (missingProducts.length > 0) {
  needsUpdate = true;
  console.log('\n⚠️  Products 不足:', missingProducts.join(', '));
}

for (const expected of expectedProducts) {
  const current = currentProducts.find((p) => p.product === expected.product);
  if (!current) continue;
  const missingPrices = expected.prices.filter((p) => !current.prices.includes(p));
  if (missingPrices.length > 0) {
    needsUpdate = true;
    console.log(`⚠️  ${expected.product} で Prices 不足:`, missingPrices.join(', '));
  }
}

if (!needsUpdate
    && config.features?.subscription_update?.enabled === true
    && config.features?.subscription_update?.proration_behavior === 'create_prorations') {
  console.log('\n✅ Portal Config は正しく設定されています。乗換可能。');
  process.exit(0);
}

// 修正: subscription_update.products を全 4 プラン × 全 Prices で上書き
console.log('\n▶ Portal Config を更新します...');

const updated = await stripe.billingPortal.configurations.update(PORTAL_CONFIG_ID, {
  features: {
    subscription_update: {
      enabled: true,
      default_allowed_updates: ['price', 'quantity', 'promotion_code'],
      proration_behavior: 'create_prorations',
      products: expectedProducts,
    },
  },
});

console.log('\n✅ 更新完了:');
console.log('  features.subscription_update.enabled:', updated.features?.subscription_update?.enabled);
console.log('  features.subscription_update.proration_behavior:',
  updated.features?.subscription_update?.proration_behavior);
console.log('  Products 数:', updated.features?.subscription_update?.products?.length);
for (const p of updated.features?.subscription_update?.products ?? []) {
  console.log(`    • ${p.product} (${p.prices.length} prices)`);
}

console.log('\n顧客は Customer Portal から自由にプラン乗換可能になりました。');
