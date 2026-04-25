# Stripe 学生プラン 実装ガイド（2026-04-24）

> このドキュメントを Stripe Dashboard と並べて開いてください。
> 失敗しないよう、**必ず上から順に**進めます。
> マイク購入フローは「聖域」として一切触りません（既存 Products / Prices / Webhooks はそのまま残します）。

---

## 目次

1. [画像生成プロンプト（nano-banana-pro 用）](#1-画像生成プロンプトnano-banana-pro-用)
2. [Stripe クーポン解説（理解編）](#2-stripe-クーポン解説理解編)
3. [学生プラン Stripe 設定ステップ（実行編）](#3-学生プラン-stripe-設定ステップ実行編)
4. [聖域ルール（絶対遵守）](#4-聖域ルール絶対遵守)

---

## 1. 画像生成プロンプト（nano-banana-pro 用）

3 プラン共通の視覚言語：
- **背景**：深い黒（obsidian） → 宇宙空間的な広がり
- **素材**：プラチナ／ブラッシュドシルバー／温かいゴールドのアクセント
- **余白**：空間を大きくとった静寂
- **文字は一切入れない**（全世界共通で理解可能にするため）
- **構図**：階層が一目で分かるよう Student → Pro → Max で段階的に豪華さを増す

すべて 1:1 正方形、高解像度で出力してください。

### Student プラン画像（見習いの誇り・可能性）

```
A serene, minimalist still life composition on a soft matte black surface. Centered: a polished silver microphone base cradles a small, translucent glass sphere containing a single glowing musical note made of warm golden light. Surrounding the sphere at precise angles: three thin, elegant brass tuning forks arranged like a celestial constellation, each catching subtle amber highlights. Behind the composition: a faded silver bloom of frequency ripples radiating outward, barely visible, suggesting the invisible architecture of sound. Lighting: single top-left studio source, cinematic, gentle chiaroscuro. Mood: apprenticeship, potential, focused curiosity. Color palette: obsidian black, brushed silver, warm gold accents only. Style: hyper-realistic product photography, shallow depth of field, ultra-sharp micro-details, Steinway & Sons brand sophistication. Square 1:1, high resolution. Absolutely no text, no letters, no numbers, no language-specific symbols.
```

### Pro プラン画像（職人の静かな権威）

```
A cinematic still life on polished obsidian glass. Centered: a pristine, precision-engineered ribbon microphone stands vertical like a monolith, its condenser mesh glowing with a soft internal warm-white light. Suspended in midair around it: five radiant harmonic spheres of varying sizes in warm gold and platinum, arranged along a golden ratio spiral. Beneath: a fine mist of sub-audible sound waves made visible as translucent silk-like ribbons. Background: deepest midnight tones fading to a faint horizon of dawn-cream light, suggesting mastery achieved and craft refined. Lighting: dramatic studio chiaroscuro with rim-light on the microphone edge, controlled bloom. Mood: professional confidence, quiet authority, craftsmanship. Color palette: obsidian, platinum, warm gold accents, rare cream highlights. Style: Leica luxury advertising, hyper-realistic product photography, ultra-sharp, museum-quality lighting. Square 1:1, high resolution. Absolutely no text, no letters, no numbers, no language-specific symbols.
```

### Max プラン画像（無限の創造空間・超越）

```
A grand, symphonic still life on a floating black marble slab in a vast dark studio space. Centered: an impossibly pristine constellation of three ribbon microphones in perfect triadic arrangement, rising from the marble like architectural columns, each crowned with a glowing platinum orb. Surrounding them: a luminous torus of infinite, overlapping harmonic waves rendered as translucent gold mesh, suggesting limitless resonance. Above: a single suspended brass conductor's baton catches a beam of warm celestial light. Background: deep cosmic black with a faint, distant nebula of diffused golden particles, evoking unbounded creative space. Lighting: grand cinematic studio with rim lights, deep atmospheric haze, dramatic volumetric rays. Mood: transcendence, abundance, unlimited creative power, studio mastery. Color palette: cosmic black, platinum, rich gold, subtle iridescent highlights. Style: high-end perfume advertising meets musical instrument luxury catalog, ultra-hyper-realistic, museum masterpiece grade, 8K detail. Square 1:1, high resolution. Absolutely no text, no letters, no numbers, no language-specific symbols.
```

### 使い方

1. nano-banana-pro に上記英文プロンプトをそのまま投入
2. 3 つとも 1024×1024 以上で生成
3. 気に入った 1 枚ずつを選び、ファイル名を以下に統一：
   - `plan-student.jpg`
   - `plan-pro.jpg`
   - `plan-max.jpg`
4. 一旦ローカル（`/Users/kotaro/kuon-rnd/空音開発/`）に保存
5. Stripe の Product 作成ステップで使用（後述）

---

## 2. Stripe クーポン解説（理解編）

### 2.1 クーポンとは何か

クーポンは**「割引の定義そのもの」**です。商品（Product）でも価格（Price）でもありません。
一度作ると、どの Checkout セッション・どのサブスクにでも付けられる独立した部品です。

```
Stripe の料金体系の構造
┌──────────────────────────────────────┐
│ Product（商品）                      │
│   例：Kuon Student Plan              │
│   └── Price（価格）                  │
│         例：¥480/月、¥4,800/年       │
└──────────────────────────────────────┘
                  ↑
                  │ Checkout / Subscription が参照
                  │
Coupon（独立した割引）━━━ Checkout / Subscription に付与
   例：「初月 ¥380 OFF」
```

### 2.2 クーポンの 2 種類

| 種類 | 挙動 | 多通貨対応 |
|------|------|-----------|
| **Amount off（金額割引）** | 通貨ごとに「¥380 OFF」のような固定額を設定 | 通貨ごとに額を指定する必要あり |
| **Percent off（比率割引）** | 「20% OFF」のような割合を設定 | 通貨非依存（どの通貨にも自動で適用） |

### 2.3 期間（duration）の 3 モード

| 値 | 挙動 | 典型例 |
|----|------|--------|
| `once` | 次回請求（初回請求）1 回だけ適用 | 初月 ¥100 キャンペーン |
| `repeating` | 指定した N ヶ月間だけ継続適用 | 3 ヶ月間半額キャンペーン |
| `forever` | 解約するまで永久に適用 | マイク購入者への永続 10% OFF（今回は使わない） |

空音開発で**今回実装する「初月 ¥100 フック」は `once` を使います**。

### 2.4 Amount off で多通貨に対応する方法

クーポンには `currency_options` という欄があり、通貨ごとに違う金額を設定できます。
例：Student プラン「初月 ¥100 フック」を 5 通貨対応にする場合：

| 通貨 | 通常月額 | 初月目標 | Amount off（割引額） |
|------|---------|---------|-------------------|
| JPY | ¥480 | ¥100 | ¥380 |
| USD | $3.99 | $0.99 | $3.00 |
| EUR | €3.99 | €0.99 | €3.00 |
| GBP | £2.99 | £0.99 | £2.00 |
| BRL | R$19.90 | R$4.90 | R$15.00 |

**1 つのクーポン**に 5 通貨分の金額を設定 → Checkout の通貨に合わせて自動で正しい割引額が適用されます。

### 2.5 なぜ Amount off を選ぶのか

Percent off で近似することもできますが（例：79.2% OFF ≒ ¥480→¥99.84）、端数が出て心理価格（¥100 / $0.99 / €0.99）にピタリと合いません。
**「ゾロ目の心理価格」のインパクトを最大化するため、Amount off を使います。**

### 2.6 実際にユーザーに適用される流れ

```
ユーザーがマイページで「学生プランに登録」ボタンをクリック
  ↓
我々の Auth Worker → Stripe Checkout Session を作成
  リクエスト本文：{
    line_items: [{ price: "price_XXX_student_monthly" }],
    discounts: [{ coupon: "FIRST100_STUDENT" }],  ← ここでクーポン適用
    mode: "subscription"
  }
  ↓
Stripe Checkout ページ
  → 通常価格 ¥480/月
  → 割引 -¥380（初回のみ）
  → 初回請求合計 ¥100
  → 次回以降 ¥480/月
  ↓
ユーザーが支払い完了
  ↓
2 回目の請求からは自動で ¥480/月に戻る（once 指定のため）
```

### 2.7 クーポン命名規則（今回採用）

| クーポン ID | 用途 | duration |
|------------|------|----------|
| `FIRST100_STUDENT` | 学生プラン初月割引 | once |
| `FIRST100_PRO` | Pro プラン初月割引（今回は未作成） | once |
| `FIRST100_MAX` | Max プラン初月割引（今回は未作成） | once |
| `REFERRAL_1MONTH_STUDENT` | 紹介報酬（学生プラン 1 ヶ月無料） | once |

**今回のステップでは `FIRST100_STUDENT` のみを作成します。**
Pro / Max は後日、学生プランが安定してから同じ要領で追加します。

---

## 3. 学生プラン Stripe 設定ステップ（実行編）

> **前提**：https://dashboard.stripe.com にログイン済み。アカウントは空音開発（Curanz Sounds）の Live mode を最終的に使いますが、**まず Test mode で全工程を通します**。

### STEP 0：Test mode に切り替え

1. Dashboard 右上の切替スイッチを確認
2. **「テスト環境（Test mode）」** に切り替わっていることを確認
3. 以降すべての操作はこの状態で行う
4. 最後に Live mode で同じ作業を繰り返します（オーナー実行時にガイドします）

---

### STEP A：商品（Product）を作成

1. 左サイドバー **商品カタログ** → **商品を追加** をクリック
2. 基本情報を入力：

| 項目 | 入力値 |
|------|--------|
| 商品名 | `Kuon Student Plan` |
| 説明 | `空音開発 学生プラン — 学習アプリ使い放題、サーバー処理 軽量枠、成長記録フル保存` |
| 画像 | 先ほど nano-banana-pro で生成した `plan-student.jpg` をアップロード |
| 商品タグ（Metadata） | Key: `plan_tier`、Value: `student` を追加 |
| 商品タグ（Metadata） | Key: `region`、Value: `global` を追加 |
| 税区分 | `デフォルト（課税対象）` のまま |
| 単位ラベル | 空欄のまま |

3. **価格を追加（Add Price）** セクションはまだ触らない（STEP B で扱う）
4. 商品情報欄だけ埋めた状態で **保存** を押下 → 商品 ID（`prod_XXXXXXX` の形式）が発行される
5. この商品 ID を手元にメモしてください

---

### STEP B：月額価格（Monthly Price）を作成

1. 作成した `Kuon Student Plan` 商品のページに戻る
2. **価格を追加** をクリック
3. 価格設定：

| 項目 | 入力値 |
|------|--------|
| 料金モデル | **「標準価格」** を選択 |
| 請求 | **「継続的」** を選択 |
| 価格（デフォルト通貨） | `480 JPY` |
| 請求期間 | **「月次」** |
| 説明ラベル | `Student - Monthly` |

4. **「他の通貨を追加」** をクリックし、以下 4 通貨を追加：

| 通貨 | 金額 |
|------|------|
| USD | `3.99` |
| EUR | `3.99` |
| GBP | `2.99` |
| BRL | `19.90` |

5. 税挙動：**「税込み」** を選択（日本・欧州の標準）
6. 価格タグ（Metadata） を追加：
   - Key: `billing_interval`、Value: `monthly`
   - Key: `plan_tier`、Value: `student`

7. **この価格を保存** をクリック → 価格 ID（`price_XXXXXXX`）が発行される
8. この価格 ID を手元にメモしてください（後で Auth Worker から参照します）

---

### STEP C：年額価格（Annual Price）を作成

1. 同じ商品ページで **もう一度「価格を追加」** をクリック
2. 価格設定：

| 項目 | 入力値 |
|------|--------|
| 料金モデル | **「標準価格」** |
| 請求 | **「継続的」** |
| 価格（デフォルト通貨） | `4800 JPY` |
| 請求期間 | **「年次」** |
| 説明ラベル | `Student - Annual` |

3. **「他の通貨を追加」** で 4 通貨を追加：

| 通貨 | 金額 |
|------|------|
| USD | `39.99` |
| EUR | `39.99` |
| GBP | `29.99` |
| BRL | `199.00` |

4. 税挙動：**「税込み」**
5. 価格タグ（Metadata）：
   - Key: `billing_interval`、Value: `annual`
   - Key: `plan_tier`、Value: `student`

6. **この価格を保存** → 年額価格 ID をメモ

この段階で、1 つの商品に 2 つの価格（月額・年額）、それぞれ 5 通貨対応が作成されました。

---

### STEP D：初月 ¥100 クーポン（FIRST100_STUDENT）を作成

1. 左サイドバー **商品カタログ** → **クーポン** → **クーポンを新規作成**
2. 基本情報：

| 項目 | 入力値 |
|------|--------|
| 名前 | `First Month ¥100 - Student` |
| ID | `FIRST100_STUDENT`（**必ず手動で入力**、自動生成は使わない） |
| タイプ | **「金額」**（Amount off） |
| 金額（デフォルト通貨） | `380 JPY` |
| 期間 | **「1 回限り（once）」** を選択 |
| 最大利用回数 | 空欄（無制限に設定） |
| 有効期限 | 空欄（恒常キャンペーン） |

3. **「他の通貨を追加」** をクリックし、4 通貨の割引額を追加：

| 通貨 | 割引額 |
|------|-------|
| USD | `3.00` |
| EUR | `3.00` |
| GBP | `2.00` |
| BRL | `15.00` |

4. **適用対象商品** の欄で、**「特定の商品」** を選択 → `Kuon Student Plan` を指定
5. **クーポンを作成** をクリック

### STEP D の動作確認（重要）

Dashboard で Test mode の Checkout を手動で起動し、動作を検証：

1. 商品ページ右上の **「支払いリンク」** を一時的に作成 → 月額価格を選択
2. **割引を有効化** → `FIRST100_STUDENT` を指定
3. 支払いリンクを開くと、Checkout 画面で以下が表示されることを確認：
   - 商品名：Kuon Student Plan
   - 通常価格：¥480/月
   - 割引：-¥380（初回のみ）
   - 初回請求：¥100
4. 通貨を USD に切り替えると $3.99 → -$3.00 → $0.99 になることも確認
5. 確認後、一時的な支払いリンクは削除

**ここまでで学生プランの商品カタログは完成です。**

---

### STEP E：Customer Portal の設定

STEP E は**プラン変更・解約・一時停止をユーザー自身が行うためのポータル**を有効化する作業です。

1. Dashboard 左下の歯車 **（設定）** → **お支払い** → **顧客ポータル** を開く
2. 各機能スイッチを以下の通りに設定：

| 機能 | 設定 |
|------|------|
| 支払い方法の更新 | **有効** |
| 請求書履歴の表示 | **有効** |
| 請求先情報の更新 | **有効** |
| サブスクリプションのキャンセル | **有効**、キャンセルのタイミングは **「請求期間の末日」** を選択 |
| サブスクリプションの一時停止 | **有効**、最大 3 ヶ月（※「設定 → ポータル → サブスクリプション管理」内のオプション） |
| サブスクリプションのプラン変更 | **有効**、対象商品に `Kuon Student Plan` の月額・年額両方を登録 |
| プロモーションコードの適用 | **有効**（後でリファラル機能で使用） |

3. 戻るページとして、**「https://kuon-rnd.com/mypage」** を指定
4. **利用規約 URL**：`https://kuon-rnd.com/terms`（未実装なら空欄で可、後で追加）
5. **プライバシーポリシー URL**：`https://kuon-rnd.com/privacy`（同上）
6. **保存** をクリック

---

### STEP F：Webhook エンドポイントの追加

既存の Webhook（マイク購入用）は**絶対に触りません**。**新しいエンドポイントを追加**します。

1. Dashboard 左下の歯車 **（設定）** → **開発者** → **Webhooks** を開く
2. **既存のエンドポイント `https://kuon-rnd.com/api/webhook` は一切変更しない**（聖域ルール）
3. **エンドポイントを追加** をクリック
4. 入力：

| 項目 | 入力値 |
|------|--------|
| エンドポイント URL | `https://kuon-rnd.com/api/auth/stripe/webhook` |
| 説明 | `Subscription events - Auth Worker` |
| 送信するイベント | 下記の 5 種類を個別選択 |

5. 送信するイベントを以下 5 つだけ選択：

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

6. **エンドポイントを追加** をクリック
7. 作成されたエンドポイントの詳細ページで **署名シークレット（Signing secret）** を表示 → `whsec_...` を安全な場所にコピー
8. このシークレットは Auth Worker の環境変数として後日登録します（登録コマンドは後のセッションで案内）

---

### STEP G：API キーの確認（我々が後で使う）

1. 歯車 **（設定）** → **開発者** → **API キー** を開く
2. Test mode で以下 2 つのキーが既に存在することを確認：
   - **公開可能キー（Publishable key）**：`pk_test_...`（マイク販売で既に使用中）
   - **シークレットキー（Secret key）**：`sk_test_...` または **制限付きキー（Restricted key）** `rk_test_...`

3. **新規で Restricted Key を発行**（Auth Worker 専用）：
   - **新しい制限付きキーを作成** をクリック
   - 名前：`Auth Worker - Subscription`
   - 権限を以下の通り設定：

| リソース | 権限 |
|---------|------|
| Checkout Sessions | **書き込み（Write）** |
| Customers | **書き込み（Write）** |
| Subscriptions | **書き込み（Write）** |
| Products | **読み取り（Read）** |
| Prices | **読み取り（Read）** |
| Coupons | **読み取り（Read）** |
| Promotion Codes | **書き込み（Write）**（リファラル用） |
| Billing Portal Sessions | **書き込み（Write）** |
| Webhook Endpoints | **読み取り（Read）** |
| すべてのその他権限 | **なし（None）** のまま |

4. **作成** → 発行されたキー（`rk_test_...`）をコピーし、安全な場所に保管
5. このキーは今セッションでは使いません（次セッションで Auth Worker に登録する時に案内します）

---

### STEP H：すべてをメモ

ここまで完了したら、以下 7 つの値を手元のメモ帳にまとめて記録してください：

```
学生プラン Stripe 設定 — 記録用メモ

[1] 商品 ID: prod_XXXXXXXXXXXXXX
[2] 月額価格 ID: price_XXXXXXXXXXXXXX
[3] 年額価格 ID: price_XXXXXXXXXXXXXX
[4] クーポン ID: FIRST100_STUDENT
[5] Webhook エンドポイント署名シークレット: whsec_XXXXXXXXXXXXXXXXXXXXXXXX
[6] Restricted Key（Auth Worker用）: rk_test_XXXXXXXXXXXXXX
[7] （公開可能キーは既存のまま、マイク側で使用中のものを流用）
```

この情報が次セッションで Auth Worker にコード実装する際に必要になります。

---

### STEP I：Test mode で Checkout を E2E 動作確認

1. Dashboard 商品ページ → **Kuon Student Plan** → 月額価格の右端の「…」メニュー → **支払いリンクを作成**
2. オプション：
   - 割引を有効化 → `FIRST100_STUDENT` を指定
   - サブスクリプションとして販売 → 有効
   - 数量 1 固定
3. **作成** → 支払いリンク URL が発行される
4. このリンクをブラウザで開き、**Stripe テスト用カード**で決済：
   - カード番号：`4242 4242 4242 4242`
   - 有効期限：任意の未来日付（例 `12/30`）
   - CVC：任意 3 桁（例 `123`）
   - メールアドレス：自分のテスト用メール
5. 決済完了後、Dashboard の以下 3 箇所で結果を確認：
   - **顧客** → 新規顧客が作成されている
   - **サブスクリプション** → 新規サブスクが作成され、Status が `active` になっている
   - **イベント** → `customer.subscription.created` と `invoice.paid` が発生している
6. 請求金額が **¥100（or $0.99 など）** になっていれば成功
7. 確認が取れたら、一時的な支払いリンクを削除
8. テスト顧客・サブスクはそのままでも OK（テストデータなので本番に影響なし）

---

### STEP J：完了報告 → 次セッションへ

STEP A〜I がすべて完了したら、次セッション開始時に以下を報告してください：

- 「学生プランの Test mode セットアップ完了しました」
- STEP H でメモした 7 つの値を貼り付け

次セッションでは以下を一気に実装します：

1. Auth Worker に Stripe 環境変数を登録
2. `/api/auth/stripe/checkout` エンドポイント実装
3. `/api/auth/stripe/portal` エンドポイント実装
4. `/api/auth/stripe/webhook` エンドポイント実装
5. マイページ GUI（プラン状態カード・使用状況ダッシュボード）
6. 使用量トラッキング API
7. ローカル + Test mode で結合テスト
8. Live mode で同じ設定を複製（STEP A〜I の Live 版）
9. 本番リリース

---

## 4. 聖域ルール（絶対遵守）

### マイク購入フローは一切変更しない

以下の既存リソースは**読むことも最小限に、書き換えは絶対禁止**：

| カテゴリ | リソース |
|---------|---------|
| Stripe Products | P-86S / X-86S の既存商品 |
| Stripe Prices | `price_1SuT6IGbZ5gwwaLkc7rjciqU`（P-86S）, `price_1SuTKHGbZ5gwwaLkR6ew580Z`（X-86S） |
| Stripe Webhook | 既存の `https://kuon-rnd.com/api/webhook`（マイク購入用） |
| Next.js コード | `app/api/checkout/route.ts`, `app/api/checkout-international/route.ts`, `app/api/webhook/route.ts` |
| サンクスページ | `app/shop/thanks/page.tsx`, `app/shop/thanks/layout.tsx` |
| R2 / Worker | `kuon-rnd-audio-worker` の既存エンドポイント |

**新規追加するもの**は全て `/api/auth/stripe/*` の名前空間に置き、マイク側とは完全に分離します。
Stripe Dashboard 側も、商品メタデータ `plan_tier: student` で区別できます。

### 事故防止のチェックリスト

- [ ] STEP A〜I は **Test mode でのみ** 実行する
- [ ] 既存の Webhook エンドポイント（`/api/webhook`）は触らない
- [ ] 既存の Product（P-86S / X-86S）は触らない
- [ ] 既存の API ルート（checkout / checkout-international / webhook）は開かない
- [ ] 新規 Webhook は **新しい URL（`/api/auth/stripe/webhook`）** に作る
- [ ] 新規 Restricted Key は **マイク用とは別の新しいキー** を作る
- [ ] 疑問が出たら、次セッションを開いて相談（独断で進めない）

---

## 付録：想定所要時間

| ステップ | 目安 |
|---------|------|
| 1. nano-banana-pro 画像生成 | 10〜20 分（3 枚分） |
| 2. STEP 0：Test mode 確認 | 30 秒 |
| 3. STEP A：商品作成 | 5 分 |
| 4. STEP B：月額価格作成 | 5 分 |
| 5. STEP C：年額価格作成 | 5 分 |
| 6. STEP D：クーポン作成 + 確認 | 10 分 |
| 7. STEP E：Customer Portal 設定 | 10 分 |
| 8. STEP F：Webhook 追加 | 3 分 |
| 9. STEP G：Restricted Key 作成 | 5 分 |
| 10. STEP H：メモまとめ | 3 分 |
| 11. STEP I：E2E 動作確認 | 10 分 |
| **合計** | **約 1 時間〜1 時間 30 分** |

---

**準備が整ったら、上から順に進めてください。各ステップ完了ごとにメモを更新し、STEP J で次セッションにバトンを渡します。**
