# Stripe Product / Price / Coupon ID 管理台帳

> このファイルは Stripe Dashboard で作成した全ての ID を記録する唯一の情報源。
>
> **絶対ルール**:
> - コード側（`kuon-rnd-auth-worker/src/stripe-prices.ts` 等）が参照する ID は必ずこのファイルから取得する
> - Dashboard で ID を変更・追加した場合は同時にこのファイルを更新する
> - Live mode の ID のみ記録（Test mode ID は別管理）
> - 既存のマイク商品（P-86S, X-86S）は本ファイルの対象外（絶対に触らない）

最終更新: 2026-04-25（Phase 7 Stage A-E + Phase 8 完全完了 = バックエンド完成）
Mode: **Live**

---

## Phase 3: Products（4件 / 進捗 4/4 ✅完了）

### ✅ Kuon Prelude

| 項目 | 値 |
|------|-----|
| Product ID | `prod_UOiR1Snq8PFuW2` |
| Name | Kuon Prelude |
| Status | 有効 |
| Statement descriptor | `KUON PRELUDE` |
| Metadata `plan_tier` | `prelude` |
| Metadata `product_type` | `subscription` |

### ✅ Kuon Concerto

| 項目 | 値 |
|------|-----|
| Product ID | `prod_UOiikPTpBHObTp` |
| Name | Kuon Concerto |
| Status | 有効 |
| Statement descriptor | `KUON CONCERTO` |
| Metadata `plan_tier` | `concerto` |
| Metadata `product_type` | `subscription` |

### ✅ Kuon Symphony

| 項目 | 値 |
|------|-----|
| Product ID | `prod_UOiko0uQYNp6Cu` |
| Name | Kuon Symphony |
| Status | 有効 |
| Statement descriptor | `KUON SYMPHONY` |
| Metadata `plan_tier` | `symphony` |
| Metadata `product_type` | `subscription` |

### ✅ Kuon Opus

| 項目 | 値 |
|------|-----|
| Product ID | `prod_UOiuFKs8gHaSQk` |
| Name | Kuon Opus |
| Status | 有効 |
| Statement descriptor | `KUON OPUS` |
| Metadata `plan_tier` | `opus` |
| Metadata `product_type` | `subscription` |

---

## Phase 4: Prices（14件 / 進捗 14/14 ✅完了）

全 Price は `tax_behavior: 'inclusive'` 設定済み（免税事業者対応）。
月額/年額 Global Price には `currency_options` で USD/EUR/GBP/CAD/AUD/CHF を内包。
LatAm USD は Prelude/Concerto/Symphony のみ別 Price で作成（Opus LatAm なし）。

### Prelude (¥780/月, ¥7,800/年, LatAm $3.99/月, $39.90/年)

| タイプ | Price ID | Lookup Key | Amount |
|-------|----------|-----------|--------|
| 月額 Global | `price_1TPv0sGbZ5gwwaLkF775xLSJ` | `prelude_monthly_global` | ¥780 + USD/EUR/GBP/CAD/AUD/CHF |
| 年額 Global | `price_1TPvqlGbZ5gwwaLkeF54VNMp` | `prelude_annual_global` | ¥7,800 + USD/EUR/GBP/CAD/AUD/CHF |
| 月額 LatAm USD | `price_1TPvqmGbZ5gwwaLklmCHByQ2` | `prelude_monthly_latam` | $3.99 |
| 年額 LatAm USD | `price_1TPvqnGbZ5gwwaLkVwtEBDon` | `prelude_annual_latam` | $39.90 |

### Concerto (¥1,480/月, ¥14,800/年, LatAm $7.99/月, $79.90/年)

| タイプ | Price ID | Lookup Key | Amount |
|-------|----------|-----------|--------|
| 月額 Global | `price_1TPvGfGbZ5gwwaLkTs1SfcXx` | `concerto_monthly_global` | ¥1,480 + USD/EUR/GBP/CAD/AUD/CHF |
| 年額 Global | `price_1TPvqlGbZ5gwwaLksHXiYo9b` | `concerto_annual_global` | ¥14,800 + USD/EUR/GBP/CAD/AUD/CHF |
| 月額 LatAm USD | `price_1TPvqnGbZ5gwwaLkySlg2LNt` | `concerto_monthly_latam` | $7.99 |
| 年額 LatAm USD | `price_1TPvqnGbZ5gwwaLkQtiYIP34` | `concerto_annual_latam` | $79.90 |

### Symphony (¥2,480/月, ¥24,800/年, LatAm $12.99/月, $129.90/年)

| タイプ | Price ID | Lookup Key | Amount |
|-------|----------|-----------|--------|
| 月額 Global | `price_1TPvJ3GbZ5gwwaLk0pGUYw4a` | `symphony_monthly_global` | ¥2,480 + USD/EUR/GBP/CAD/AUD/CHF |
| 年額 Global | `price_1TPvqmGbZ5gwwaLkWVUsfwgS` | `symphony_annual_global` | ¥24,800 + USD/EUR/GBP/CAD/AUD/CHF |
| 月額 LatAm USD | `price_1TPvqoGbZ5gwwaLkQxyvdCHd` | `symphony_monthly_latam` | $12.99 |
| 年額 LatAm USD | `price_1TPvqoGbZ5gwwaLkUrkCOmLW` | `symphony_annual_latam` | $129.90 |

### Opus (¥5,980/月, ¥59,800/年 — LatAm 対象外)

| タイプ | Price ID | Lookup Key | Amount |
|-------|----------|-----------|--------|
| 月額 Global | `price_1TPvT5GbZ5gwwaLkMNUon9gc` | `opus_monthly_global` | ¥5,980 + USD/EUR/GBP/CAD/AUD/CHF |
| 年額 Global | `price_1TPvqmGbZ5gwwaLkjpdIvHvL` | `opus_annual_global` | ¥59,800 + USD/EUR/GBP/CAD/AUD/CHF |

---

## Phase 5: Coupons（7 件 / 進捗 7/7 ✅完了）

設計判断: 当初 28 件想定だったが `percent_off` ベース設計に切り替え 7 件に圧縮。
- LatAm USD は別 Coupon 不要（percent_off は通貨非依存、PPP 価格にさらに深い割引が乗る設計意図と整合）
- 通貨ごとに別 Coupon 不要（1 つの percent_off で全通貨に均等適用）
- Stripe `percent_off` の精度上限は小数点以下 2 桁

### FIRST100 系（初月 ¥100 / $1 相当・3 件）

| Coupon ID | percent_off | duration | applies_to | JPY 着地 |
|-----------|------------|----------|-----------|---------|
| `FIRST100_PRELUDE` | 87.18% | once | Prelude (`prod_UOiR1Snq8PFuW2`) | ¥780 → ¥100 |
| `FIRST100_CONCERTO` | 93.24% | once | Concerto (`prod_UOiikPTpBHObTp`) | ¥1,480 → ¥100 |
| `FIRST100_SYMPHONY` | 95.97% | once | Symphony (`prod_UOiko0uQYNp6Cu`) | ¥2,480 → ¥100 |

各通貨着地:
- USD: ~$1.00-$1.02（Global）/ ~$0.51-$0.54（LatAm USD でさらに深い割引）
- EUR/GBP/CAD/AUD/CHF: ~1.0 単位前後

Opus は対象外（個人向け FIRST100 フックを設定しない方針）。

### 紹介・パートナー・解約抑止（4 件）

| Coupon ID | percent_off | duration | applies_to | 用途 |
|-----------|------------|----------|-----------|------|
| `REFERRAL_1MONTH_FREE` | 100% | once | 全プラン | 紹介者報酬 |
| `TIER_A_PARTNER_50` | 50% | forever | 全プラン | 提携パートナー永年（Argentina 等） |
| `TIER_C_GRADUATE_25` | 25% | forever | 全プラン | 卒業生継続割引 |
| `RETENTION_50_3MONTHS` | 50% | repeating (3mo) | 全プラン | 解約抑止フロー |

### Phase 5b 追加: 初月キャンペーン HALF50 (2026-04-25)

**重要**: FIRST100 系 (¥100 ベース) は Concerto/Symphony で赤字発生のため不採用化。代替として **HALF50 系 (50% オフ・全プラン黒字)** を新規作成。

| Coupon ID | percent_off | duration | applies_to | 顧客支払 | 初月純利 |
|-----------|------------|----------|-----------|---------|---------|
| `HALF50_PRELUDE` | 50% | once | Prelude | ¥390 | +¥296 |
| `HALF50_CONCERTO` | 50% | once | Concerto | ¥740 | +¥433 |
| `HALF50_SYMPHONY` | 50% | once | Symphony | ¥1,240 | +¥515 |
| `HALF50_OPUS` | 50% | once | Opus | ¥2,990 | +¥1,352 |

**コード上の attach ルール (Auth Worker)**:
- Checkout Session 作成時に `cycle === 'monthly'` の場合のみ HALF50 を attach
- 年額には attach しない (50% off は深すぎる)
- FIRST100 系は Stripe には残るがコード側からは attach しない (legacy)

### アプリ側ロジック制約（重要）

Stripe の Coupon 自体は cycle 制約を持たないため、以下はアプリ側で enforce:

1. `FIRST100_*` / `REFERRAL_1MONTH_FREE` / `RETENTION_50_3MONTHS` は **Checkout Session 作成時に `cycle === 'monthly'` の場合のみ attach** する。年額に attach するとオーバーディスカウントになる
2. `TIER_A_PARTNER_50` / `TIER_C_GRADUATE_25` は **手動発行**（Promotion Code 経由でユーザーに付与）

---

## Phase 6: Customer Portal（1 設定 / 進捗 1/1 ✅完了）

### 設定 ID

| 項目 | 値 |
|------|-----|
| Portal Configuration ID | `bpc_1TPy1rGbZ5gwwaLkKegFAY2z` |
| Mode | Live |
| Status | アクティブ（リンク有効化済み） |

### 有効化済み機能

#### 請求書
- メイントグル: ON（インボイス履歴表示）

#### 顧客情報
- メイントグル: ON
- 名前 / メールアドレス / 請求先住所 / 電話番号 / **納税者番号**: すべて ON
- 配送先住所: OFF（デジタルサブスクのため不要）

#### 決済手段
- メイントグル: ON（カード期限切れ自己解決）

#### キャンセル
- メイントグル: ON
- キャンセルモード: **「請求期間の終了時にキャンセル」**（即時ではなく期末）
- キャンセル理由: 収集する（ON）
- **顧客維持クーポン: `RETENTION_50_3MONTHS`**（§40.1 ⑦ 解約抑止装置稼働）

#### サブスク
- 「顧客がプランを切り替えられるようにする」: ON
- 「顧客がプランの数量を変更できるようにする」: OFF（個人向け単一席プラン）
- プロレーション: 「料金とクレジットを日割り計算する」
- 請求のタイミング: 更新時点で直ちに日割り請求
- ダウングレード（両方とも）: **「請求期間の終了時まで待ってから更新する」**
- **プロモーションコード**: ON（リファラル装置 + 教育機関向け Promotion Code 発行可能）

### Portal で切り替え可能な Price（全 8 件・Global のみ）

| プラン | 月額 Global | 年額 Global |
|--------|-----------|-----------|
| Prelude | `price_1TPv0sGbZ5gwwaLkF775xLSJ` (¥780) | `price_1TPvqlGbZ5gwwaLkeF54VNMp` (¥7,800) |
| Concerto | `price_1TPvGfGbZ5gwwaLkTs1SfcXx` (¥1,480) | `price_1TPvqlGbZ5gwwaLksHXiYo9b` (¥14,800) |
| Symphony | `price_1TPvJ3GbZ5gwwaLk0pGUYw4a` (¥2,480) | `price_1TPvqmGbZ5gwwaLkWVUsfwgS` (¥24,800) |
| Opus | `price_1TPvT5GbZ5gwwaLkMNUon9gc` (¥5,980) | `price_1TPvqmGbZ5gwwaLkjpdIvHvL` (¥59,800) |

**LatAm Price は Portal に含めない**: Global 顧客が誤って LatAm 価格に切り替えて PPP を悪用するリスクを避けるため。LatAm 顧客のプラン切替は Phase 7 で実装するアプリ独自フローで処理。

### Phase 7 で必要な追加 Webhook イベント

ダウングレードで「請求期間の終了時まで待ってから更新」を選択したことにより、Stripe 側で **Subscription Schedule** が生成されるため、Webhook ハンドラで以下も処理する必要あり:

- `subscription_schedule.created`
- `subscription_schedule.updated`
- `subscription_schedule.released`
- `subscription_schedule.canceled`

### Customer Portal セッション作成 API（Phase 7 実装予定）

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: 'https://kuon-rnd.com/mypage',
  configuration: 'bpc_1TPy1rGbZ5gwwaLkKegFAY2z',
});
return Response.redirect(session.url);
```

---

## Phase 7: Webhook ハンドラ実装（コード / 進捗 完了 ✅）

実装済みファイル:
- `kuon-rnd-auth-worker/src/stripe-prices.ts` — 145 行（定数 + 型 + ヘルパー）
- `kuon-rnd-auth-worker/src/index.ts` — +430 行（Webhook エンドポイント + 6 ハンドラ + 8 ヘルパー）

実装済みエンドポイント:
- `POST /api/auth/stripe/webhook` — 署名検証 + 12 イベントディスパッチ

実装済みハンドラ:
| ハンドラ | 対応イベント |
|---------|-------------|
| `handleCheckoutCompleted` | `checkout.session.completed` |
| `handleSubscriptionEvent` | `customer.subscription.created/updated/paused/resumed` |
| `handleSubscriptionDeleted` | `customer.subscription.deleted` |
| `handleInvoicePaid` | `invoice.paid` |
| `handleInvoicePaymentFailed` | `invoice.payment_failed` |
| `handleSubscriptionSchedule` | `subscription_schedule.created/updated/released/canceled` |

デプロイ済み Version ID:
- Stage B: `bee85a53-246f-40b5-aa4d-55a2bd64e958`
- Stage C+D: `73b66cc7-00fa-497e-a0ad-e313e5a527e2`
- Stage E + KV キーバグ修正: `422b36cd-bbde-49ae-b58a-85f46f460661`

実装済みエンドポイント (Stage E 追加分):
- `POST /api/auth/stripe/checkout` — Checkout Session 作成 (LatAm 自動判定 + FIRST100 自動付与)
- `POST /api/auth/stripe/portal` — Customer Portal Session 作成 (PORTAL_CONFIG_ID 使用)

Stage B バグ修正 (2026-04-25 同日):
- KV USERS のキー命名規則 `user:${email}` を `getUserByStripeCustomerId` / `updateUserStripe` に反映 (本番影響ゼロで先行修正)

---

## Phase 8: 本番運用 Restricted Key + Webhook 登録（進捗 1/3）

### Step 1: ✅ Webhook 登録完了 (2026-04-25)

| 項目 | 値 |
|------|-----|
| Webhook Endpoint ID | `we_1TPzQhGbZ5gwwaLktNVvM6EF` |
| 名前 | Kuon Auth Worker - サブスク |
| URL | `https://kuon-rnd-auth-worker.369-1d5.workers.dev/api/auth/stripe/webhook` |
| API バージョン | `2024-09-30.acacia` |
| ステータス | アクティブ |
| リッスン対象 | 12 イベント |
| 署名シークレット | `whsec_xxx` (オーナー保管・未だ Cloudflare 未配置) |

リッスン対象 12 イベント:
- checkout.session.completed
- customer.subscription.created / updated / deleted / paused / resumed
- invoice.paid / invoice.payment_failed
- subscription_schedule.created / updated / released / canceled

### Step 2: ✅ 本番運用 Restricted API Key 発行完了

| 項目 | 値 |
|------|-----|
| キー名 | `Kuon-Auth-Worker-Runtime-Production` |
| プレフィックス | `rk_live_...` |
| 有効スコープ | 6 リソース（下記） |

有効スコープ:
- **Customers: Write**
- **Subscriptions: Write**（Subscription Schedules も包含）
- **Checkout Sessions: Write**
- **Customer portal: Write**（Billing Portal Sessions の Dashboard 表記）
- **Promotion Codes: Write**
- **Invoices: Read**

それ以外の全リソース: なし（最小権限の原則）

### Step 3: ✅ Cloudflare Worker Secret 配置完了

| Secret 名 | 値の種類 | 状態 |
|----------|--------|------|
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ✅ 登録済み |
| `STRIPE_SECRET_KEY` | `rk_live_...` | ✅ 登録済み |

### Step 4: ✅ 接続確認スモークテスト完了 (2026-04-25 15:43 JST)

curl 接続確認:
```
curl -i -X POST https://kuon-rnd-auth-worker.369-1d5.workers.dev/api/auth/stripe/webhook
→ HTTP/2 400
→ Missing stripe-signature header
```

wrangler tail 観測:
```
POST .../api/auth/stripe/webhook - Ok @ 2026/4/25 15:43:42
```

検証された配管: Internet → Cloudflare CDN → Workers → Hono → webhook ハンドラ → 署名検証 → 400 レスポンス（全 5 段クリア）

---

## Phase 7 用コードマッピング（完成版）

`kuon-rnd-auth-worker/src/stripe-prices.ts` に以下を配置予定：

```typescript
// Source of Truth: /Users/kotaro/kuon-rnd/空音開発/stripe-ids.md
// 最終同期: 2026-04-25 Phase 5 完了時点

export const PRODUCT_IDS = {
  prelude:  'prod_UOiR1Snq8PFuW2',
  concerto: 'prod_UOiikPTpBHObTp',
  symphony: 'prod_UOiko0uQYNp6Cu',
  opus:     'prod_UOiuFKs8gHaSQk',
} as const;

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
    // LatAm 対象外
  },
} as const;

export const COUPON_IDS = {
  // active: 初月 50% オフ (全プラン黒字)
  half50: {
    prelude:  'HALF50_PRELUDE',
    concerto: 'HALF50_CONCERTO',
    symphony: 'HALF50_SYMPHONY',
    opus:     'HALF50_OPUS',
  },
  // legacy: 初月 ¥100 (Concerto/Symphony 赤字のため未使用、Stripe には残存)
  first100: {
    prelude:  'FIRST100_PRELUDE',
    concerto: 'FIRST100_CONCERTO',
    symphony: 'FIRST100_SYMPHONY',
  },
  referral_1month:      'REFERRAL_1MONTH_FREE',
  tier_a_partner:       'TIER_A_PARTNER_50',
  tier_c_graduate:      'TIER_C_GRADUATE_25',
  retention_50_3months: 'RETENTION_50_3MONTHS',
} as const;

export const PORTAL_CONFIG_ID = 'bpc_1TPy1rGbZ5gwwaLkKegFAY2z';

export type PlanTier = 'free' | 'prelude' | 'concerto' | 'symphony' | 'opus';
export type BillingCycle = 'monthly' | 'annual';
export type PricingRegion = 'global' | 'latam';

// Reverse lookup: Product ID → PlanTier
const PRODUCT_TO_PLAN: Record<string, PlanTier> = {
  [PRODUCT_IDS.prelude]:  'prelude',
  [PRODUCT_IDS.concerto]: 'concerto',
  [PRODUCT_IDS.symphony]: 'symphony',
  [PRODUCT_IDS.opus]:     'opus',
};

export function planFromProductId(productId: string): PlanTier {
  return PRODUCT_TO_PLAN[productId] ?? 'free';
}
```

**Coupon 適用ルール（アプリ側 enforce）**:
- `FIRST100_*` / `REFERRAL_1MONTH_FREE` / `RETENTION_50_3MONTHS` は cycle === 'monthly' のみ attach
- `TIER_A_PARTNER_50` / `TIER_C_GRADUATE_25` は手動発行（Promotion Code 経由）

**Webhook ハンドラの plan 判定ロジック**:
`subscription.items[0].price.product` から Product ID を取得し、
Product の `metadata.plan_tier` を Source of Truth として plan を判定する。
Price ID のハードコードは Checkout Session 作成時にのみ必要。

**LatAm 判定**:
Checkout Session 作成時、顧客 IP の国コードが MX/CL/CO/PE/UY のいずれかなら `monthly_latam` / `annual_latam` Price を使用。それ以外（Argentina 含む）は `monthly_global` / `annual_global` に `currency_options` で自動通貨選択。
