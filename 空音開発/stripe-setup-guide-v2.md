# Stripe セットアップガイド v2（2026-04-24 確定版）

> 本ガイドは `subscription-design-spec.md` に基づく Stripe Dashboard 実装手順です。
> 全 7 Phase、推定所要時間 90-120 分。各 Phase 末に検証ポイントを設けています。
> **失敗しないために、必ず Phase 順に実行し、次 Phase に進む前に検証を完了してください。**

---

## 0. 事前確認（所要 5 分）

実行前に以下をすべて確認してください。

| 項目 | 状態 | 備考 |
|------|------|------|
| Stripe アカウント Live mode 有効 | ✅ 要確認 | マイク販売で既に稼働中のはず |
| Business profile 完了 | ✅ 要確認 | 会社情報・住所登録済み |
| Bank account 登録済み | ✅ 要確認 | 日本円口座（Curanz Sounds 名義） |
| 既存 Webhook `/api/webhook`（マイク用） | ✅ **絶対に触らない** | 聖域 |
| 新 Webhook は `/api/auth/stripe/webhook` に作成 | ⬜ 未作成 | Phase 6 で作成 |
| Restricted API Key（現行マイク用） | ✅ 稼働中 | 触らない |
| Restricted API Key（サブスク用） | ⬜ 未発行 | Phase 7 で発行 |

### 聖域原則（絶対遵守）

- 既存の Products（P-86S、X-86S マイク）は **一切変更しない**
- 既存の Payment Links、Checkout Session は **変更禁止**
- 既存 Webhook `/api/webhook` は **変更禁止**
- 新 Product は metadata に `plan_tier: prelude|concerto|symphony|opus` を**必ず**付与し、既存マイク Product と論理的に分離する

---

## 1. Phase 1 — Stripe Tax 有効化（所要 10 分）

### 1.1 Dashboard アクセス

1. https://dashboard.stripe.com/ にログイン
2. 右上の **Live mode** が ON であることを確認
3. 左メニュー → **Settings**（歯車アイコン）→ **Tax**

### 1.2 Origin address（拠点住所）登録

1. **"Set up tax collection"** をクリック
2. 拠点住所を入力：
   - Country: **Japan**
   - Postal code: **080-2476**
   - 住所: 北海道帯広市自由が丘5丁目16番地35
3. **Save**

### 1.3 Tax registrations（税務登録地域）

以下を登録します（自動徴収対象国）。**"Add registration"** を押して 1 つずつ追加：

| 国/地域 | Tax ID Type | 備考 |
|---------|------------|------|
| Japan | JCT（消費税）登録番号 | 個人事業主で未登録なら Skip（年商 1,000 万円未満は免税） |
| European Union | One Stop Shop (OSS) | EU 圏はまとめて OSS で管理 |
| United Kingdom | UK VAT number | 将来登録義務発生時に追加 |
| United States | — | 州ごとに異なるため売上発生後に state を追加 |
| Canada | GST/HST | 売上発生後に追加 |
| Australia | GST | 売上発生後に追加 |
| Switzerland | VAT | 売上発生後に追加 |

**IQ180 ポイント：** 各国には「税務登録義務発生基準（registration threshold）」がある。日本→EU であれば EU 域内売上が年 €10,000 を超えてから OSS 登録でも遅くない。**初期は Japan のみ登録 + Stripe Tax に "Collect tax only where registered" を設定**すれば、未登録地域では税金徴収しない安全運用が可能。

### 1.4 Default tax behavior

1. **Settings → Tax → Defaults**
2. Default tax behavior: **Inclusive**（税込表示）
3. **Save**

※ JP は税込表示が商慣習。EU/UK も Display tax inclusive を推奨。

### ✅ 検証 1

- [ ] Dashboard 左下 Tax セクションに "Japan" が緑チェックで表示されている
- [ ] Origin address が自分の住所になっている
- [ ] Default tax behavior が Inclusive

---

## 2. Phase 2 — Radar 詐欺防止ルール設定（所要 10 分）

### 2.1 Radar ルール有効化

1. **Dashboard → Radar → Rules**
2. **"Add custom rule"** で以下を追加：

#### ルール A: 国と IP のミスマッチをブロック

```
Block if :card_country: does not match :ip_country: AND :amount: > 1000
```

**意味：** カード発行国と IP 国が異なり、かつ 1,000 円以上の決済をブロック（VPN 経由の PPP 裁定防止）。

#### ルール B: 短時間の複数同一カード失敗をブロック

```
Block if :card_funding: = 'prepaid' AND :velocity_hour: > 3
```

**意味：** プリペイドカードでの 1 時間 3 回以上の試行をブロック（テスト犯罪対策）。

#### ルール C: 高額決済の 3D Secure 強制

```
Require 3D Secure if :amount: >= 5000
```

**意味：** 5,000 円相当以上（SYMPHONY/OPUS/年額）で 3DS 必須化（チャージバック対策）。

### ✅ 検証 2

- [ ] Radar Rules に 3 件のカスタムルールが Active 状態で表示される

---

## 3. Phase 3 — Products 作成（所要 20 分）

### 3.1 PRELUDE Product 作成

1. **Dashboard → Product catalog → "+ Add product"**
2. 以下を入力：

| フィールド | 値 |
|-----------|---|
| Name | **Kuon Prelude** |
| Description | The starting point for musicians. Full access to all learning tools, practice logs, and 30+ browser-based music apps. |
| Image | Phase 4 で生成・アップロード（後でOK） |
| Statement descriptor | `KUON PRELUDE` |
| Unit label | 空欄 |
| Tax code | **`txcd_10103001` (Software as a service — cloud-based)** |
| Metadata | Key: `plan_tier` / Value: `prelude` |
| Metadata | Key: `product_type` / Value: `subscription` |

3. **"Add product"** で作成
4. **Product ID をメモ**（`prod_xxx` の形式）

### 3.2 CONCERTO Product 作成

同じ手順で作成。値のみ変更：

| フィールド | 値 |
|-----------|---|
| Name | **Kuon Concerto** |
| Description | For dedicated musicians. Everything in Prelude, plus full server-side AI tools (Separator, Transcriber, Intonation Analyzer), event posting, and priority gallery placement. |
| Statement descriptor | `KUON CONCERTO` |
| Tax code | `txcd_10103001` |
| Metadata | `plan_tier` / `concerto`, `product_type` / `subscription` |

### 3.3 SYMPHONY Product 作成

| フィールド | 値 |
|-----------|---|
| Name | **Kuon Symphony** |
| Description | For professional musicians. Maximum quotas, 6-stem separation, early access to new tools, monthly clinic with Kotaro Asahina, and guest invitation rights. |
| Statement descriptor | `KUON SYMPHONY` |
| Tax code | `txcd_10103001` |
| Metadata | `plan_tier` / `symphony`, `product_type` / `subscription` |

### 3.4 OPUS Product 作成

| フィールド | 値 |
|-----------|---|
| Name | **Kuon Opus** |
| Description | For institutions, studios, and music schools. Enterprise-grade quotas, priority processing, dedicated support, and commercial usage rights. |
| Statement descriptor | `KUON OPUS` |
| Tax code | `txcd_10103001` |
| Metadata | `plan_tier` / `opus`, `product_type` / `subscription` |

### ✅ 検証 3

- [ ] Product catalog に 4 つの Kuon Prelude / Concerto / Symphony / Opus が表示される
- [ ] 既存のマイク Product（P-86S、X-86S）が変わらず存在している
- [ ] 各 Product に `plan_tier` metadata が正しく設定されている
- [ ] 4 つの Product ID をメモした（Phase 4 で使用）

---

## 4. Phase 4 — Prices 作成（所要 30 分）— **最重要 Phase**

### 4.1 設計思想：currency_options を使って 14 Prices で完結

Stripe の `currency_options` 機能により、**1 つの Price オブジェクトに複数通貨の金額を格納**できます。これにより：

- 62 Prices → **14 Prices** に削減（Dashboard 管理負荷 78% 減）
- Checkout 時の通貨選択が Stripe 側で自動化
- LatAm USD は "別の USD 金額" のため、別 Price として作成

### 4.2 Price 構成全体像

| Product | Global Price（JPY+USD+EUR+GBP+CAD+AUD+CHF を 1 Price に） | LatAm USD Price（USD 単独・LatAm 専用） | 合計 |
|---------|----------------|----------------|------|
| PRELUDE | Monthly + Annual = 2 Prices | Monthly + Annual = 2 Prices | 4 |
| CONCERTO | Monthly + Annual = 2 Prices | Monthly + Annual = 2 Prices | 4 |
| SYMPHONY | Monthly + Annual = 2 Prices | Monthly + Annual = 2 Prices | 4 |
| OPUS | Monthly + Annual = 2 Prices | — （LatAm 除外） | 2 |
| **合計** | **8 Prices** | **6 Prices** | **14** |

### 4.3 Prices 一覧表（事前に全金額を確定）

#### PRELUDE

| Price | Currency | Unit amount | Interval | Lookup key |
|-------|----------|-------------|----------|-----------|
| Monthly Global | JPY (primary) | 780 | month | `prelude_monthly_global` |
|   ↑ currency_options | USD | 799 | — | — |
|   ↑ | EUR | 749 | — | — |
|   ↑ | GBP | 649 | — | — |
|   ↑ | CAD | 999 | — | — |
|   ↑ | AUD | 1099 | — | — |
|   ↑ | CHF | 899 | — | — |
| Annual Global | JPY (primary) | 7800 | year | `prelude_annual_global` |
|   ↑ | USD | 7990 | — | — |
|   ↑ | EUR | 7490 | — | — |
|   ↑ | GBP | 6490 | — | — |
|   ↑ | CAD | 9990 | — | — |
|   ↑ | AUD | 10990 | — | — |
|   ↑ | CHF | 8990 | — | — |
| Monthly LatAm | USD | 399 | month | `prelude_monthly_latam` |
| Annual LatAm | USD | 3990 | year | `prelude_annual_latam` |

**※ 単位に注意**：JPY は整数そのまま（780円 = `780`）、USD/EUR/GBP/CAD/AUD/CHF はセント単位（$7.99 = `799`）

#### CONCERTO

| Price | Currency | Unit amount | Interval | Lookup key |
|-------|----------|-------------|----------|-----------|
| Monthly Global | JPY | 1480 | month | `concerto_monthly_global` |
|   ↑ | USD | 1499 | — | — |
|   ↑ | EUR | 1399 | — | — |
|   ↑ | GBP | 1199 | — | — |
|   ↑ | CAD | 1899 | — | — |
|   ↑ | AUD | 2099 | — | — |
|   ↑ | CHF | 1699 | — | — |
| Annual Global | JPY | 14800 | year | `concerto_annual_global` |
|   ↑ | USD | 14990 | — | — |
|   ↑ | EUR | 13990 | — | — |
|   ↑ | GBP | 11990 | — | — |
|   ↑ | CAD | 18990 | — | — |
|   ↑ | AUD | 20990 | — | — |
|   ↑ | CHF | 16990 | — | — |
| Monthly LatAm | USD | 799 | month | `concerto_monthly_latam` |
| Annual LatAm | USD | 7990 | year | `concerto_annual_latam` |

#### SYMPHONY

| Price | Currency | Unit amount | Interval | Lookup key |
|-------|----------|-------------|----------|-----------|
| Monthly Global | JPY | 2480 | month | `symphony_monthly_global` |
|   ↑ | USD | 2499 | — | — |
|   ↑ | EUR | 2299 | — | — |
|   ↑ | GBP | 1999 | — | — |
|   ↑ | CAD | 3199 | — | — |
|   ↑ | AUD | 3499 | — | — |
|   ↑ | CHF | 2799 | — | — |
| Annual Global | JPY | 24800 | year | `symphony_annual_global` |
|   ↑ | USD | 24990 | — | — |
|   ↑ | EUR | 22990 | — | — |
|   ↑ | GBP | 19990 | — | — |
|   ↑ | CAD | 31990 | — | — |
|   ↑ | AUD | 34990 | — | — |
|   ↑ | CHF | 27990 | — | — |
| Monthly LatAm | USD | 1299 | month | `symphony_monthly_latam` |
| Annual LatAm | USD | 12990 | year | `symphony_annual_latam` |

#### OPUS

| Price | Currency | Unit amount | Interval | Lookup key |
|-------|----------|-------------|----------|-----------|
| Monthly Global | JPY | 5980 | month | `opus_monthly_global` |
|   ↑ | USD | 5999 | — | — |
|   ↑ | EUR | 5499 | — | — |
|   ↑ | GBP | 4999 | — | — |
|   ↑ | CAD | 7999 | — | — |
|   ↑ | AUD | 8499 | — | — |
|   ↑ | CHF | 6499 | — | — |
| Annual Global | JPY | 59800 | year | `opus_annual_global` |
|   ↑ | USD | 59990 | — | — |
|   ↑ | EUR | 54990 | — | — |
|   ↑ | GBP | 49990 | — | — |
|   ↑ | CAD | 79990 | — | — |
|   ↑ | AUD | 84990 | — | — |
|   ↑ | CHF | 64990 | — | — |
| — | — | — | — | (LatAm 対象外) |

### 4.4 Price 作成手順（PRELUDE Monthly Global を例に詳細解説）

1. Dashboard → Product catalog → **Kuon Prelude** をクリック
2. Pricing セクション → **"+ Add another price"**
3. 以下を入力：

#### 基本設定

| フィールド | 値 |
|-----------|---|
| Pricing model | **Standard pricing** |
| Price | `780` |
| Currency | **JPY** |
| Billing period | **Monthly** |
| Tax behavior | Inclusive |
| Lookup key | `prelude_monthly_global` |
| Nickname（内部メモ） | PRELUDE Monthly Global（JPY base, 7 currency_options） |

4. **"+ More options"** をクリック → **Metadata** を追加：
   - `plan_tier`: `prelude`
   - `interval`: `monthly`
   - `region`: `global`

5. **currency_options の設定** — Dashboard UI では "Additional currencies" セクションが表示される：
   - **"Add currency"** をクリック
   - 以下を 1 つずつ追加：

| Currency | Amount |
|----------|--------|
| USD | `7.99` |
| EUR | `7.49` |
| GBP | `6.49` |
| CAD | `9.99` |
| AUD | `10.99` |
| CHF | `8.99` |

※ Dashboard UI では**小数点つき**で入力（7.99）。セント単位（799）ではない点に注意。

6. **"Save price"** をクリック
7. **Price ID をメモ**（`price_xxx` の形式）

### 4.5 残り 13 Prices の作成

**上記 4.4 と同じ手順**を、4.3 の表を参照しながら繰り返します。

**IQ180 の作業効率化：**
- 同じ Product の Monthly → Annual は金額だけ変えて作成（ `10x` の関係）
- LatAm Price は currency_options 不要・USD 単独で作成
- 各 Price 作成後に Price ID を表計算ソフトに記録する習慣をつける

### 4.6 Price ID 記録テンプレート

以下の形式でメモ（後で Auth Worker のコードに埋め込む）：

```
PRELUDE_MONTHLY_GLOBAL   = price_xxxxxxxxxxxxx
PRELUDE_ANNUAL_GLOBAL    = price_xxxxxxxxxxxxx
PRELUDE_MONTHLY_LATAM    = price_xxxxxxxxxxxxx
PRELUDE_ANNUAL_LATAM     = price_xxxxxxxxxxxxx

CONCERTO_MONTHLY_GLOBAL  = price_xxxxxxxxxxxxx
CONCERTO_ANNUAL_GLOBAL   = price_xxxxxxxxxxxxx
CONCERTO_MONTHLY_LATAM   = price_xxxxxxxxxxxxx
CONCERTO_ANNUAL_LATAM    = price_xxxxxxxxxxxxx

SYMPHONY_MONTHLY_GLOBAL  = price_xxxxxxxxxxxxx
SYMPHONY_ANNUAL_GLOBAL   = price_xxxxxxxxxxxxx
SYMPHONY_MONTHLY_LATAM   = price_xxxxxxxxxxxxx
SYMPHONY_ANNUAL_LATAM    = price_xxxxxxxxxxxxx

OPUS_MONTHLY_GLOBAL      = price_xxxxxxxxxxxxx
OPUS_ANNUAL_GLOBAL       = price_xxxxxxxxxxxxx
```

### ✅ 検証 4

- [ ] 14 Prices すべてが作成されている
- [ ] 各 Global Price に 7 通貨（JPY + 6 additional）が設定されている
- [ ] LatAm Prices は USD 単独で $3.99 / $7.99 / $12.99 + 年額 10x
- [ ] 全 Price ID をテンプレートに転記済み
- [ ] Lookup key がすべて命名規則通り

---

## 5. Phase 5 — Coupons 作成（所要 15 分）

### 5.1 Coupon 全体像

| Coupon ID | Duration | Off | 用途 |
|-----------|----------|-----|------|
| `FIRST100_PRELUDE` | once | ¥680 off | 初月 PRELUDE を ¥100 に |
| `FIRST100_CONCERTO` | once | ¥1,380 off | 初月 CONCERTO を ¥100 に |
| `FIRST100_SYMPHONY` | once | ¥2,380 off | 初月 SYMPHONY を ¥100 に |
| `REFERRAL_1MONTH_FREE` | once | 100% off | リファラル報酬（紹介者に月額分付与） |
| `TIER_A_PARTNER_50` | repeating 12 months | 50% off | 提携音大/教室 初年度 |
| `TIER_A_PARTNER_25` | repeating 12 months | 25% off | 提携音大/教室 2 年目以降 |
| `TIER_C_GRADUATE_25` | repeating 6 months | 25% off | 卒業生ブリッジ（自動適用） |
| `FOUNDING_MEMBER_LOCK` | forever | — （特別 Price 使用） | Founding Member 永久ロック（運用メモ） |

**※ `FOUNDING_MEMBER_LOCK` は Coupon ではなく別 Price で実装**（4.3 とは別の Founding Member 専用 Price を後から作成）。Phase 5 完了後、MRR 安定段階で追加する。

### 5.2 FIRST100_PRELUDE 作成（手順）

1. **Dashboard → Product catalog → Coupons → "+ New"**
2. 以下を入力：

| フィールド | 値 |
|-----------|---|
| ID | `FIRST100_PRELUDE` |
| Type | **Amount off** |
| Amount | `680` |
| Currency | **JPY** |
| Duration | **Once** |
| Max redemptions | **無制限**（空欄） |
| Redeem by | 2027-12-31 23:59 JST |
| Metadata | `coupon_type` / `first_month_promo`, `plan_tier` / `prelude` |

**IQ180 の落とし穴：** Coupon の `Amount off` は JPY 建てで設定すると、USD/EUR ユーザーが適用した場合に換算されない可能性があります。**多通貨対応のため、次の代替案が推奨されます：**

#### 推奨: Percent off で多通貨対応

| フィールド | 値 |
|-----------|---|
| ID | `FIRST100_PRELUDE` |
| Type | **Percent off** |
| Percent | `87.18`% |
| Duration | **Once** |

※ `780 × (1 - 0.8718) = 100` → 初月 ¥100 達成
※ USD の場合 `$7.99 × 0.1282 = $1.02` で初月 $1.02 に（近似値）

**判断：** Percent off だと多通貨に一律適用でき、管理が単純。ただし「初月 ¥100」のマーケティング訴求が USD/EUR では「初月 $1.02」になり、訴求力が薄れる。

**IQ180 最適解：** **通貨別に別 Coupon を作成**して Checkout で通貨判定後に適用する。

#### 最終確定: 通貨別 FIRST100 Coupon セット

| Coupon ID | Currency | Amount off | Duration |
|-----------|----------|-----------|----------|
| `FIRST100_PRELUDE_JPY` | JPY | 680 | once |
| `FIRST100_PRELUDE_USD` | USD | 6.99 | once |
| `FIRST100_PRELUDE_EUR` | EUR | 6.49 | once |
| `FIRST100_PRELUDE_GBP` | GBP | 5.49 | once |
| `FIRST100_PRELUDE_CAD` | CAD | 8.99 | once |
| `FIRST100_PRELUDE_AUD` | AUD | 9.99 | once |
| `FIRST100_PRELUDE_CHF` | CHF | 7.99 | once |
| `FIRST100_PRELUDE_LATAM_USD` | USD | 2.99 | once |

→ 初月が ¥100 / $1 / €1 / £1 / C$1 / A$1 / CHF 1 / $1 (LatAm) に揃う

**作成数：** PRELUDE 8 個 + CONCERTO 8 個 + SYMPHONY 8 個 = **24 個の FIRST100 Coupon**

### 5.3 REFERRAL_1MONTH_FREE 作成

| フィールド | 値 |
|-----------|---|
| ID | `REFERRAL_1MONTH_FREE` |
| Type | **Percent off** |
| Percent | `100`% |
| Duration | **Once**（1 回のみ適用） |
| Max redemptions | 無制限 |
| Metadata | `coupon_type` / `referral_reward` |

**用途：** 紹介者（referrer）側に無料月をプレゼントする際、この Coupon を適用した新規 Subscription を作成するか、既存 Subscription に 1 ヶ月の trial_end 延長を API で付与する。

### 5.4 TIER_A_PARTNER_50 作成

| フィールド | 値 |
|-----------|---|
| ID | `TIER_A_PARTNER_50` |
| Type | **Percent off** |
| Percent | `50`% |
| Duration | **Repeating** |
| Duration in months | `12` |
| Max redemptions | `500` |
| Metadata | `coupon_type` / `tier_a_partner`, `discount_phase` / `year_one` |

### 5.5 TIER_A_PARTNER_25 作成

| フィールド | 値 |
|-----------|---|
| ID | `TIER_A_PARTNER_25` |
| Type | **Percent off** |
| Percent | `25`% |
| Duration | **Forever** |
| Max redemptions | `500` |
| Metadata | `coupon_type` / `tier_a_partner`, `discount_phase` / `year_two_onwards` |

**運用：** 初年度は `TIER_A_PARTNER_50` を適用 → 12 ヶ月経過後に Subscription を update して `TIER_A_PARTNER_25` に切替（Auth Worker の Cron で自動化可能）。

### 5.6 TIER_C_GRADUATE_25 作成

| フィールド | 値 |
|-----------|---|
| ID | `TIER_C_GRADUATE_25` |
| Type | **Percent off** |
| Percent | `25`% |
| Duration | **Repeating** |
| Duration in months | `6` |
| Max redemptions | 無制限 |
| Metadata | `coupon_type` / `graduate_bridge` |

**運用：** 学生ユーザーがマイページで「卒業しました」を申告 → Auth Worker が Subscription 更新時に自動適用（CONCERTO へのアップグレードと同時に）。

### 5.7 Promotion Codes 作成

**Coupon は内部 ID、Promotion Code は顧客が入力する公開コード。**

#### リファラル用 Promotion Code テンプレート（ユーザー別に発行）

- ベース Coupon: `REFERRAL_1MONTH_FREE`
- コード形式: `REF-{8文字ランダム英数字}` 例: `REF-A7K2X9MQ`
- 発行タイミング: ユーザーがマイページで「リファラルコードを発行」を押下 → Auth Worker が Stripe API で Promotion Code を発行

#### Tier A 用 Promotion Code（パートナー機関別）

- `PARTNER-TOKYOGEIDAI-2026`（東京藝大用）→ TIER_A_PARTNER_50 に紐付け
- `PARTNER-KUNITACHI-2026`（国立音大用）→ TIER_A_PARTNER_50 に紐付け
- ※ パートナー機関との契約成立後にオーナーが手動発行

### ✅ 検証 5

- [ ] FIRST100_* Coupons を 24 個作成（3 plans × 8 currencies）
- [ ] REFERRAL_1MONTH_FREE 作成済み
- [ ] TIER_A_PARTNER_50 / TIER_A_PARTNER_25 作成済み
- [ ] TIER_C_GRADUATE_25 作成済み
- [ ] 全 Coupon の Metadata が正しく設定されている

---

## 6. Phase 6 — Customer Portal 設定（所要 10 分）

### 6.1 Customer Portal 有効化

1. **Dashboard → Settings → Billing → Customer portal**
2. **"Activate portal"** をクリック

### 6.2 ブランディング

| フィールド | 値 |
|-----------|---|
| Business name | **空音開発 (Kuon R&D)** |
| Website URL | `https://kuon-rnd.com` |
| Terms of service URL | `https://kuon-rnd.com/legal/terms` |
| Privacy policy URL | `https://kuon-rnd.com/legal/privacy` |
| Logo | （Phase 8 でアップロード） |

### 6.3 Features の有効化

以下を **すべて ON**：

| Feature | 設定 |
|---------|------|
| Customers can update payment methods | ON |
| Customers can update billing addresses | ON |
| Customers can update billing information | ON |
| Customers can view invoice history | ON |
| Customers can cancel subscriptions | ON |
| Cancellation mode | **At end of billing period**（期間末解約） |
| Show cancellation reason survey | ON |
| Customers can pause subscriptions | ON（利用可能な場合） |
| Pause duration | Maximum 3 months |
| Customers can switch plans | ON |
| Allowed Products | Kuon Prelude / Concerto / Symphony / Opus（全 4 つ） |
| Proration behavior | **Always prorate** |

### 6.4 解約時の挽留設定

1. **Features → Cancellation → "Show retention offer"** を ON
2. オファー内容：
   - "50% off for 3 months" を表示（別 Coupon `RETENTION_50_3MONTHS` を事前作成）
   - Coupon 詳細：
     - ID: `RETENTION_50_3MONTHS`
     - Type: Percent off 50%
     - Duration: Repeating 3 months
     - Metadata: `coupon_type` / `retention`

### ✅ 検証 6

- [ ] Customer Portal が Active 状態
- [ ] Allowed Products に 4 プランすべてが表示される
- [ ] Cancellation mode が "At end of billing period"
- [ ] Pause subscription が ON（3 ヶ月上限）

---

## 7. Phase 7 — Webhook Endpoint 追加（所要 10 分）

### 7.1 既存 Webhook との分離確認

1. **Dashboard → Developers → Webhooks**
2. 既存の `https://kuon-rnd.com/api/webhook`（マイク用）が Active であることを確認
3. **これは絶対に変更しない**

### 7.2 新 Webhook 追加

1. **"+ Add endpoint"** をクリック
2. 以下を入力：

| フィールド | 値 |
|-----------|---|
| Endpoint URL | `https://kuon-rnd.com/api/auth/stripe/webhook` |
| Description | Subscription events for Kuon plans (separated from microphone webhook) |
| Version | Latest API version |

3. **Events to listen to** で以下をすべて選択：

**Subscription lifecycle（必須）:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `customer.subscription.trial_will_end`

**Invoice（必須）:**
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.payment_action_required`
- `invoice.upcoming`

**Checkout（必須）:**
- `checkout.session.completed`
- `checkout.session.expired`

**Customer（推奨）:**
- `customer.created`
- `customer.updated`
- `customer.deleted`

**合計 15 events**

4. **"Add endpoint"** で保存
5. **Webhook Signing Secret（`whsec_xxx`）をコピー** → 次 Phase で Cloudflare に登録

### ✅ 検証 7

- [ ] 2 つの Webhook endpoint が Active（既存 `/api/webhook` + 新 `/api/auth/stripe/webhook`）
- [ ] 新 Webhook の 15 events が選択されている
- [ ] Signing Secret をメモ済み

---

## 8. Phase 8 — Restricted API Key 発行（所要 5 分）

### 8.1 サブスク専用 API Key を新規発行

1. **Dashboard → Developers → API keys**
2. 既存の Restricted Key（マイク用）は変更しない
3. **"+ Create restricted key"** をクリック
4. Key name: `Kuon Subscription Key`
5. 権限設定：

| Resource | Permission |
|----------|-----------|
| Customers | Write |
| Subscriptions | Write |
| Checkout Sessions | Write |
| Billing portal | Write |
| Invoices | Read |
| Prices | Read |
| Products | Read |
| Coupons | Read |
| Promotion codes | Write |
| Webhooks endpoints | Read |
| Payment methods | Read |
| Subscription items | Write |
| 他すべて | **None** |

6. **"Create key"** → Secret を**一度だけ**表示されるので即座にコピー（`rk_live_xxxxx`）
7. **絶対に Git にコミットしない**

### 8.2 Cloudflare 環境変数登録

ターミナルで以下を実行：

```bash
cd /Users/kotaro/kuon-rnd

# Stripe サブスク用 Restricted Key
npx wrangler pages secret put STRIPE_SUBSCRIPTION_KEY --project-name kuon-rnd
# → 貼り付け（rk_live_xxxxx）

# 新 Webhook Signing Secret
npx wrangler pages secret put STRIPE_SUBSCRIPTION_WEBHOOK_SECRET --project-name kuon-rnd
# → 貼り付け（whsec_xxxxx）

# Auth Worker にも同じものを登録
cd kuon-rnd-auth-worker
npx wrangler secret put STRIPE_SUBSCRIPTION_KEY
npx wrangler secret put STRIPE_SUBSCRIPTION_WEBHOOK_SECRET
```

### ✅ 検証 8

- [ ] 新 Restricted Key が発行され、rk_live_xxx が Cloudflare に登録済み
- [ ] Webhook Signing Secret も Cloudflare に登録済み
- [ ] 既存のマイク用 Key は変更されていない
- [ ] `.env.local` には**絶対に書かない**（wrangler secret のみ使用）

---

## 9. Phase 9 — Test mode での E2E 検証（所要 20 分）

### 9.1 Test mode に切替

Dashboard 右上のトグルで **Test mode** に切替。

### 9.2 Test mode にも同じ構成を複製

**IQ180 重要：Live mode で作成した Products / Prices / Coupons は Test mode には反映されない**。同じ手順を Test mode でも 1 回実行する必要がある。

ただし、Phase 3-5 の手順を再実行するのは重労働なので、**Stripe CLI を使って Live → Test に複製する方法**もある：

```bash
# Stripe CLI インストール（Homebrew）
brew install stripe/stripe-cli/stripe

# ログイン
stripe login

# Live mode の Product を Test mode にコピー（例）
stripe products retrieve prod_LIVE_PRELUDE_ID --live | \
  stripe products create \
    --name "Kuon Prelude (test)" \
    --metadata plan_tier=prelude
```

※ 完全自動化には `stripe-cli` のシェルスクリプトが必要。初回は Test mode で手動作成してもよい（負荷は Live と同じ）。

### 9.3 E2E テスト手順

1. Test Product の Price ID をコピー
2. 以下のテストカードで Checkout Session を呼び出し（`/api/auth/stripe/checkout` 実装後）：

| テストカード | 挙動 |
|------------|------|
| `4242 4242 4242 4242` | 成功 |
| `4000 0025 0000 3155` | 3DS 要求 |
| `4000 0000 0000 9995` | 残高不足で失敗 |
| `4000 0027 6000 3184` | チャージバック |

3. Webhook が `/api/auth/stripe/webhook` に正しく届くか Dashboard の Webhook logs で確認
4. Customer Portal にログインできるか確認
5. Subscription の pause / resume / cancel が動作するか確認

### ✅ 検証 9

- [ ] Test mode で 4 Products + 14 Prices + Coupons が複製されている
- [ ] テストカードで Subscription 作成が成功する
- [ ] Webhook events がすべて受信される
- [ ] Customer Portal が動作する
- [ ] 失敗系（3DS、残高不足）も正しく処理される

---

## 10. Phase 10 — Live mode 最終チェック（所要 5 分）

### 10.1 最終チェックリスト

- [ ] Live mode に切替済み
- [ ] 4 Products 稼働中（PRELUDE / CONCERTO / SYMPHONY / OPUS）
- [ ] 14 Prices 稼働中（Global 8 + LatAm 6）
- [ ] 24 個の FIRST100 Coupons 稼働中
- [ ] REFERRAL_1MONTH_FREE、TIER_A_PARTNER_50/25、TIER_C_GRADUATE_25、RETENTION_50_3MONTHS すべて稼働中
- [ ] Customer Portal 有効化済み
- [ ] 新 Webhook endpoint `/api/auth/stripe/webhook` Active
- [ ] 既存マイク Webhook `/api/webhook` **変更されていない**
- [ ] Restricted Key（サブスク用）が Cloudflare に登録済み
- [ ] Stripe Tax 有効化（Japan のみ or 必要国）
- [ ] Radar ルール 3 件 Active

### 10.2 聖域遵守の最終確認

- [ ] 既存マイク Products（P-86S、X-86S）が Live mode で変更なく稼働
- [ ] 既存マイク Payment Links が変更なし
- [ ] 既存マイク Webhook が変更なし
- [ ] 既存マイク用 Restricted Key が変更なし

### ✅ 検証 10

すべての項目にチェックが入ったら **Phase 完了**。次は実装 Phase に進む。

---

## 11. 次ステップ（実装 Phase の予告）

Stripe Dashboard 側の設定が完了したら、次は以下のコード実装に進みます：

1. **画像生成** — nano-banana-pro で 4 Product の catalog 画像を生成・Stripe にアップロード
2. **Auth Worker 拡張** — `/api/auth/stripe/*` エンドポイント実装（checkout / portal / webhook / usage / referral / pause / resume）
3. **マイページ GUI** — プランカード、使用量ダッシュボード、アプリ一覧、リファラルカード、Founding Member バッジ
4. **LP 刷新** — `/plans`、`/plans/[plan]`、`/compare`、`/faq/subscription`
5. **SEO + GEO** — JSON-LD Schema.org Product、Q&A 構造化、多言語 canonical

これらは別ガイド（`implementation-guide.md`）で順次提供します。

---

## 付録 A: Price ID 記録用スプレッドシート

Phase 4 で作成した Price ID を以下の形式で保管してください。Auth Worker 実装時にコピペで使用します。

```typescript
// kuon-rnd-auth-worker/src/stripe-prices.ts
export const STRIPE_PRICES = {
  prelude: {
    monthly: {
      global: 'price_xxxxxxxxxxxxx',  // 要記入
      latam:  'price_xxxxxxxxxxxxx',  // 要記入
    },
    annual: {
      global: 'price_xxxxxxxxxxxxx',  // 要記入
      latam:  'price_xxxxxxxxxxxxx',  // 要記入
    },
  },
  concerto: {
    monthly: { global: '', latam: '' },
    annual:  { global: '', latam: '' },
  },
  symphony: {
    monthly: { global: '', latam: '' },
    annual:  { global: '', latam: '' },
  },
  opus: {
    monthly: { global: '', latam: null },  // LatAm 対象外
    annual:  { global: '', latam: null },
  },
} as const;

export const LATAM_COUNTRIES = ['MX', 'CL', 'CO', 'PE', 'UY'] as const;
// ※ Argentina は米国価格 (global) + Tier A Coupon で対応
```

---

## 付録 B: トラブルシューティング

### Q1: Price 作成時に currency_options が表示されない

**A:** Stripe の旧 UI では非対応。右上の "Try the new product catalog" に切替える。

### Q2: Coupon が多通貨で正しく適用されない

**A:** `Amount off` 型の Coupon は Price の primary currency でしか機能しない。通貨別 Coupon を作成して Checkout で通貨判定後に適用する（5.2 参照）。

### Q3: Webhook events が届かない

**A:** (1) Endpoint URL が正しいか確認、(2) Signing Secret が Cloudflare に登録されているか、(3) Events が選択されているか、(4) 署名検証が正しく実装されているか。

### Q4: Test mode と Live mode を間違えた

**A:** Dashboard 右上の切替トグルを必ず確認。Products / Prices / Coupons は**それぞれ独立**。

### Q5: LatAm 価格が Argentina ユーザーに適用されてしまう

**A:** Auth Worker 側で Billing Country を判定し、`AR` なら `global` Price を返す実装にする。`/api/auth/stripe/checkout` の実装で以下の分岐：

```typescript
const LATAM_COUNTRIES = ['MX', 'CL', 'CO', 'PE', 'UY']; // AR 含まず
const priceKey = LATAM_COUNTRIES.includes(billingCountry) ? 'latam' : 'global';
```

---

## 付録 C: Founding Member Price（別 Price で実装）

Phase 4 完了後、安定運用に入ってから以下を追加：

1. 各 Product で「Founding Member」限定 Price を別途作成
2. Lookup key: `{plan}_monthly_founding`, `{plan}_annual_founding`
3. 価格: 標準価格の 50% 固定（`forever` 扱い）
4. Max redemptions: 500（設計書 §5）
5. Promotion Code `FOUNDING500` を発行し、マイページで先着 500 名のみ適用可能
6. 適用後は Price 自体が永久ロック → 将来の値上げ影響を受けない

---

**ガイド終わり。Phase 1 から順に実行し、各 Phase の検証ポイントをクリアしながら進めてください。**
