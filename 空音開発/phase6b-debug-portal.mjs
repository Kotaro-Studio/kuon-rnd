#!/usr/bin/env node
// Phase 6b デバッグ版: Customer Portal Config の products フィールドが更新されない原因を特定
//
// 仮説:
//   1. Node SDK が products を正しくシリアライズできていない
//   2. Prices ID のいずれかが Invalid (削除済み・archived) だが silent fail
//   3. retrieve で products フィールドが expand されていない
//
// 戦略:
//   raw HTTP API を直接叩いて、リクエストとレスポンスを完全に可視化

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

// ─────────────────────────────────────────────
// Step 1: 全 Price の存在 + active 状態を検証
// ─────────────────────────────────────────────
console.log('\n[Step 1] 全 14 Price の存在検証\n');

const allPrices = [
  ...Object.values(PRICE_IDS.prelude),
  ...Object.values(PRICE_IDS.concerto),
  ...Object.values(PRICE_IDS.symphony),
  ...Object.values(PRICE_IDS.opus),
];

let allPricesValid = true;
for (const priceId of allPrices) {
  const res = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
    headers: { Authorization: `Bearer ${stripeKey}` },
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`  ❌ ${priceId}: ${res.status}`, err.slice(0, 100));
    allPricesValid = false;
    continue;
  }
  const price = await res.json();
  const tag = price.active ? '✅' : '⚠️ inactive';
  console.log(`  ${tag} ${priceId} → product=${price.product} active=${price.active} type=${price.type}`);
  if (!price.active) allPricesValid = false;
}

if (!allPricesValid) {
  console.error('\n❌ 一部の Price が無効です。Portal に登録できません。');
  process.exit(1);
}

console.log('\n✅ 全 Price 有効\n');

// ─────────────────────────────────────────────
// Step 2: 全 Product の存在検証
// ─────────────────────────────────────────────
console.log('[Step 2] 全 4 Product の存在検証\n');

for (const [plan, productId] of Object.entries(PRODUCT_IDS)) {
  const res = await fetch(`https://api.stripe.com/v1/products/${productId}`, {
    headers: { Authorization: `Bearer ${stripeKey}` },
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`  ❌ ${plan} (${productId}): ${err.slice(0, 100)}`);
    process.exit(1);
  }
  const product = await res.json();
  const tag = product.active ? '✅' : '⚠️ inactive';
  console.log(`  ${tag} ${plan}: ${productId} (active=${product.active})`);
}

// ─────────────────────────────────────────────
// Step 3: raw HTTP API で Portal Config を更新
// ─────────────────────────────────────────────
console.log('\n[Step 3] raw HTTP API で Portal Config を更新\n');

// Stripe API は form-encoded で送る必要がある (JSON ではない)
// ネストされた配列は features[subscription_update][products][0][product]=xxx 形式
const formParams = new URLSearchParams();

formParams.append('features[subscription_update][enabled]', 'true');
formParams.append('features[subscription_update][proration_behavior]', 'create_prorations');
formParams.append('features[subscription_update][default_allowed_updates][0]', 'price');
formParams.append('features[subscription_update][default_allowed_updates][1]', 'promotion_code');

const productsList = [
  { product: PRODUCT_IDS.prelude,  prices: Object.values(PRICE_IDS.prelude) },
  { product: PRODUCT_IDS.concerto, prices: Object.values(PRICE_IDS.concerto) },
  { product: PRODUCT_IDS.symphony, prices: Object.values(PRICE_IDS.symphony) },
  { product: PRODUCT_IDS.opus,     prices: Object.values(PRICE_IDS.opus) },
];

productsList.forEach((item, idx) => {
  formParams.append(`features[subscription_update][products][${idx}][product]`, item.product);
  item.prices.forEach((priceId, pidx) => {
    formParams.append(`features[subscription_update][products][${idx}][prices][${pidx}]`, priceId);
  });
});

console.log('▼ 送信するパラメータ (一部抜粋):');
console.log('  Total params count:', [...formParams].length);
console.log('  Products:', productsList.map((p) => `${p.product} (${p.prices.length} prices)`).join(', '));

const updateRes = await fetch(
  `https://api.stripe.com/v1/billing_portal/configurations/${PORTAL_CONFIG_ID}`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2026-04-22.dahlia',
    },
    body: formParams.toString(),
  }
);

const updateBody = await updateRes.json();

if (!updateRes.ok) {
  console.error('\n❌ 更新失敗:', updateRes.status);
  console.error(JSON.stringify(updateBody, null, 2));
  process.exit(1);
}

console.log('\n✅ Update API レスポンス受領');

// ─────────────────────────────────────────────
// Step 4: 直後に retrieve して実際に保存されたか確認
// ─────────────────────────────────────────────
console.log('\n[Step 4] 直後に retrieve して保存状態を確認\n');

const verifyRes = await fetch(
  `https://api.stripe.com/v1/billing_portal/configurations/${PORTAL_CONFIG_ID}`,
  { headers: { Authorization: `Bearer ${stripeKey}` } }
);
const verifyBody = await verifyRes.json();

const products = verifyBody.features?.subscription_update?.products;
console.log('▼ 保存後の状態:');
console.log('  enabled:', verifyBody.features?.subscription_update?.enabled);
console.log('  proration_behavior:', verifyBody.features?.subscription_update?.proration_behavior);
console.log('  default_allowed_updates:', verifyBody.features?.subscription_update?.default_allowed_updates);
console.log('  products is null?:', products === null);
console.log('  products is array?:', Array.isArray(products));
console.log('  products count:', Array.isArray(products) ? products.length : 'N/A');

if (Array.isArray(products) && products.length === 4) {
  console.log('\n🎉 SUCCESS: Products 4 件が正しく登録されました');
  for (const p of products) {
    console.log(`  • ${p.product} (${p.prices.length} prices)`);
  }
} else {
  console.error('\n❌ products がまだ反映されていません');
  console.error('完全な features.subscription_update:');
  console.error(JSON.stringify(verifyBody.features?.subscription_update, null, 2));
}
