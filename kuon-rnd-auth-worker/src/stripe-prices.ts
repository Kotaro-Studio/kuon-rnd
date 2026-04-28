// Source of Truth: /Users/kotaro/kuon-rnd/空音開発/stripe-ids.md
// 最終同期: 2026-04-25 Phase 6 完了時点
//
// このファイルは Stripe Live mode で実際に作成された ID の唯一の参照点。
// Stripe Dashboard で ID を変更・追加した場合は stripe-ids.md と本ファイルの両方を更新する。

// ============================================================
// Products (Phase 3)
// ============================================================

export const PRODUCT_IDS = {
  prelude:  'prod_UOiR1Snq8PFuW2',
  concerto: 'prod_UOiikPTpBHObTp',
  symphony: 'prod_UOiko0uQYNp6Cu',
  opus:     'prod_UOiuFKs8gHaSQk',
} as const;

// ============================================================
// Prices (Phase 4)
// ============================================================

export const PRICE_IDS = {
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
    // Opus は LatAm 対象外
  },
} as const;

// ============================================================
// Coupons (Phase 5)
// ============================================================

export const COUPON_IDS = {
  // ❗ 現役 (アクティブ): 初月 50% オフ — 全プラン対応・全プランで黒字
  // 2026-04-25 切り替え: FIRST100 系 → HALF50 系
  // 理由: FIRST100 は Concerto/Symphony で赤字だったため健全な収益構造に変更
  half50: {
    prelude:  'HALF50_PRELUDE',
    concerto: 'HALF50_CONCERTO',
    symphony: 'HALF50_SYMPHONY',
    opus:     'HALF50_OPUS',
  },

  // ⚠️ legacy (現在未使用): 初月 ¥100 ベース
  // Stripe には残存しているが、コードからは attach しない (赤字発生のため)
  // 将来 Prelude 単体での集客キャンペーン等で再利用可能
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

  // ❗ 教師経由学生割引 (2026-04-28 追加)
  // 30% off × 12 months × Prelude+Concerto only (Symphony は格式維持のため除外)
  // 教師ごとに Promotion Code (TANAKA-30 等) を量産する。Coupon 自体は再利用される。
  // 詳細: §44 教師経由学生クーポンシステム
  student_30_12mo: 'STUDENT_30_12MO',
} as const;

// ============================================================
// Customer Portal (Phase 6)
// ============================================================

export const PORTAL_CONFIG_ID = 'bpc_1TPy1rGbZ5gwwaLkKegFAY2z';

// ============================================================
// 型定義
// ============================================================

export type PlanTier = 'free' | 'prelude' | 'concerto' | 'symphony' | 'opus';
export type BillingCycle = 'monthly' | 'annual';
export type PricingRegion = 'global' | 'latam';
export type SubscriptionStatus =
  | 'none'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

// ============================================================
// LatAm 判定
// ============================================================

// Argentina は Global Price + Tier A Coupon で対応 (LatAm グループには入れない)
export const LATAM_COUNTRIES = ['MX', 'CL', 'CO', 'PE', 'UY'] as const;

export function isLatamCountry(countryCode: string): boolean {
  return (LATAM_COUNTRIES as readonly string[]).includes(countryCode.toUpperCase());
}

// ============================================================
// プラン判定ヘルパー
// ============================================================

// Reverse lookup: Product ID → PlanTier
const PRODUCT_TO_PLAN: Record<string, PlanTier> = {
  [PRODUCT_IDS.prelude]:  'prelude',
  [PRODUCT_IDS.concerto]: 'concerto',
  [PRODUCT_IDS.symphony]: 'symphony',
  [PRODUCT_IDS.opus]:     'opus',
};

/**
 * Stripe の Product ID から PlanTier を判定する。
 * Webhook イベントで subscription.items[0].price.product を渡すと plan が分かる。
 */
export function planFromProductId(productId: string): PlanTier {
  return PRODUCT_TO_PLAN[productId] ?? 'free';
}

/**
 * Checkout Session 作成時に使う Price ID を取得する。
 * region は IP 国コードから判定 (isLatamCountry を使う)。
 * Opus は LatAm 対象外なので region='latam' でも global が返る。
 */
export function getPriceId(
  plan: Exclude<PlanTier, 'free'>,
  cycle: BillingCycle,
  region: PricingRegion,
): string {
  const key = `${cycle}_${region}` as keyof typeof PRICE_IDS.prelude;
  const priceMap = PRICE_IDS[plan];
  // Opus は LatAm Price 無し → fallback to global
  if (plan === 'opus' && region === 'latam') {
    return priceMap[`${cycle}_global` as 'monthly_global' | 'annual_global'];
  }
  return (priceMap as Record<string, string>)[key];
}

/**
 * cycle が monthly のときのみ FIRST100 / REFERRAL / RETENTION クーポンを attach 可能。
 * 年額に attach するとオーバーディスカウントになるためアプリ側で enforce する。
 */
export function canAttachMonthlyOnlyCoupon(cycle: BillingCycle): boolean {
  return cycle === 'monthly';
}
