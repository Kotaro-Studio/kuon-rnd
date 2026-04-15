# CLAUDE.md — 空音開発 (Kuon R&D) プロジェクト完全仕様書

> このファイルは Claude Code（AIエージェント）がプロジェクトを正確に理解し、
> ヒューマンエラーなく作業を進めるための唯一の情報源です。
> 作業前に必ずこのファイルを読み込んでください。

---

## 1. オーナー情報

| 項目 | 内容 |
|------|------|
| 本名 | 服部 洸太郎（Kotaro Hattori）ただしこの情報は公開することはありません |
| 活動名 | 朝比奈 幸太郎（Kotaro Asahina） |
| 拠点 | 〒080-2476 北海道帯広市自由が丘5丁目16番地35 こちらも法律上の記載義務のあるページを作成するとき以外に公開することはありません|
| メール | 369@kotaroasahina.com |
| YouTube | 朝比奈幸太郎の音響実験室 |
| 職能 | 音響エンジニア・マイク設計者・GPS/RTK開発者・Webエンジニア・音楽家 |

---

## 2. ブランド全体マップ

### コアブランド（収益の柱）

#### 空音開発 / Kuon R&D
- URL: https://kuon-rnd.com
- ローカルパス: /Users/kotaro/kuon-rnd
- 役割: マイク設計・製造・販売、オーディオアプリ開発、GPS/RTK研究
- ブランドコンセプト: 「空と音」= GPS x オーディオ の2軸に完全特化
- 収益目標: マイク販売 月300,000円
- 技術スタック: Next.js App Router + TypeScript + Cloudflare Pages + Stripe

#### Curanz Sounds / クランツサウンズ(空音開発と交流することはないが、オーナーが持っている別のブランドとして知っておいて欲しい)

- URL: https://curanzsounds.com
- ローカルパス: /Users/kotaro/curanz-sounds（別リポジトリ・絶対に触らない）
- プラットフォーム: Next.js + Cloudflare Pages（WordPressではない）
- 音声配信: Cloudflare Workers（curanz-api）+ R2（curanz-files）
- 役割: ヒーリングオーディオ商品、ライセンス販売、サブスクリプション
- 収益目標: 月2,000,000円（長期目標18,000,000円）
- 現行商品:
  - 432Hz クラシカル睡眠音楽 1,480円
  - ピュアトーン・ソルフェジオセット 2,400円
  - 528Hz バイタリティ 3,800円（近日公開）

### サポートブランド

#### 朝比奈幸太郎 個人サイト
- URL: https://kotaroasahina.com
- CMS: WordPress（ブログ更新あり・当面Next.js化しない）
- DNS: エックスサーバー管理（Cloudflareには未移行）
- 役割:
  - 個人ブログ（日常・音響実験の記録）継続
  - ウェブサイト制作サービスLP → service.kotaroasahina.com（サブドメイン・将来実装）
  - 録音サービスLP → recording.kotaroasahina.com（サブドメイン・将来実装）
- 集客方針: SEOではなくYouTube・SNS・口コミから直リンク
- 録音依頼先: https://academy.kotarohattori.com（タイムマシンレコード）




#### Kotaro Studio（放置・アフィリエイト収益のみ回収）
- URL: https://kotarohattori.com
- 役割: 音響アフィリエイトサイト。月約30,000円の収益を維持。
- 方針: 一切触らない。マイク販売リンクのみ将来 kuon-rnd.com/microphone に変更予定。
- ドメイン: エックスサーバー永久無料ドメイン・解約予定なし・移管不要
---

## 3. kuon-rnd.com 技術仕様

### 開発環境

ローカルパス : /Users/kotaro/kuon-rnd
Node.js     : システムデフォルト
パッケージ  : npm
Dev server  : npm run dev（http://localhost:3000）
デプロイ    : Cloudflare Pages（git push → 自動ビルド）
DNS管理     : Cloudflare（104.21.69.156 / 172.67.209.165 確認済み）
ドメイン管理 : エックスサーバー（移管不要・このまま運用）

### 技術スタック

フレームワーク : Next.js App Router（TypeScript）
スタイリング   : CSS-in-JS（インラインスタイル）+ globals.css
決済          : Stripe Payment Links（P-86S）→ 将来 Checkout Session に移行
音声配信      : Cloudflare Workers（kuon-rnd-audio-worker）+ R2（kuon-rnd-audio）
画像          : /public/ 配下に配置
フォント      : Helvetica Neue / システムフォント（メインサイト）

### 絶対ルール（必ず守ること）

NG: export const runtime = 'edge'
    → 通常のページ・コンポーネントでは禁止
    → 例外：Cloudflare Workers 連携の API Route のみ使用可
       （Curanz Sounds で本番動作確認済み）

OK: import パス → 必ず @/ エイリアスを使用
OK: globals.css → app/layout.tsx 内で './globals.css' のみ import
NG: .env.local  → Git にコミット禁止・絶対
NG: curanz-sounds リポジトリ → 絶対に触らない（参照のみ可）
NG: kotaro-studio リポジトリ → 絶対に触らない
NG: 既存本番ページ → オーナー確認なしに変更しない

---

## 4. ディレクトリ構成（現在）

/Users/kotaro/kuon-rnd/
├── app/
│   ├── audio-apps/page.tsx
│   ├── declipper/page.tsx
│   ├── dual-mono/page.tsx
│   ├── geocode-viewer/
│   ├── gps/page.tsx
│   ├── gps-elevation/
│   ├── gps-heatmap/
│   ├── gps-plot/
│   ├── itadaki-lp/page.tsx
│   ├── microphone/            ← P-86S メイン販売LP（リデザイン対象）
│   ├── noise-reduction/page.tsx
│   ├── normalize/page.tsx
│   ├── normalize-lp/page.tsx
│   ├── piano-declipper/page.tsx
│   ├── profile/page.tsx
│   ├── proposal-catone/
│   ├── radar/
│   ├── revox/
│   ├── rtk-base/
│   ├── web/
│   ├── webapp/
│   ├── api/
│   │   └── audio/
│   │       └── [...fileKey]/route.ts  ← 音声配信プロキシ（実装予定）
│   ├── globals.css
│   ├── layout.tsx             ← メインサイトレイアウト（絶対に触らない）
│   └── page.module.css
├── components/
│   ├── Header.tsx
│   └── Footer.tsx
├── context/
│   └── LangContext.tsx
├── public/
│   ├── mic01.jpeg
│   ├── mic02.jpeg
│   └── mic03.jpeg
├── kuon-rnd-audio-worker/     ← Cloudflare Workers（音声配信・デプロイ済み）
│   ├── src/
│   │   └── index.ts
│   ├── wrangler.toml
│   └── package.json
├── CLAUDE.md
├── next.config.js
├── tsconfig.json
└── package.json
---

## 5. 音声配信アーキテクチャ（確定版）

### Curanz Sounds（参考・絶対に触らない）

ブラウザ
  ↓
Next.js API Route（app/api/preview または stream/[...fileKey]/route.ts）
  ↓
Cloudflare Workers（curanz-api.369-1d5.workers.dev）
  ↓
R2 バケット（curanz-files）

エンドポイント一覧:
- GET /api/preview/:fileKey → 無料試聴（固定トークン preview-token）
- GET /api/stream/:fileKey  → 購入者フル再生（JWT必須）
- GET /api/download/:trackId → ダウンロード（JWT・lifetime/businessのみ）

### 空音開発 kuon-rnd.com（実装済み・使用予定）

ブラウザ（<audio>タグ）
  ↓
Next.js API Route（app/api/audio/[...fileKey]/route.ts）※実装予定
  ↓
Cloudflare Workers（kuon-rnd-audio-worker.369-1d5.workers.dev）デプロイ済み
  ↓
R2 バケット（kuon-rnd-audio）作成済み

エンドポイント:
- GET /api/audio/:fileKey → 音声サンプル再生（認証不要・全員無料）

方針: マイク試聴サンプルは購入前に全員が聴ける無料コンテンツ。
      認証不要のシンプル構成。

### Workers 構成（確定版）

| Worker名                  | URL                                               | R2バケット     | 権限       |
|--------------------------|---------------------------------------------------|--------------|------------|
| curanz-api               | curanz-api.369-1d5.workers.dev                    | curanz-files | 触らない   |
| kuon-rnd-audio-worker    | kuon-rnd-audio-worker.369-1d5.workers.dev         | kuon-rnd-audio | 操作可   |

---

## 6. Cloudflare R2 バケット構成

アカウント: 369@kotaroasahina.com

| バケット名      | 用途                        | 使用プロジェクト     | 権限     |
|---------------|-----------------------------|--------------------|----------|
| curanz-files  | Curanz Sounds 音声・画像     | curanzsounds.com のみ | 触らない |
| kuon-rnd-audio | 空音開発 音声サンプル        | kuon-rnd.com のみ   | 操作可   |

絶対ルール:
- NG: curanz-files に他プロジェクトのファイルをアップロードしない
- NG: kuon-rnd-audio に curanz-sounds 用ファイルをアップロードしない
- OK: バケットは必ずプロジェクトごとに完全分離

kuon-rnd-audio ファイル構成:
kuon-rnd-audio/
├── p-86s/
│   ├── piano.mp3
│   ├── violin.mp3
│   ├── cello.mp3
│   ├── flute.mp3           ← 随時追加
│   └── （その他楽器）
└── x-86s/
    └── （後日追加）

命名ルール:
- 英語小文字・ハイフン区切り・スペース禁止
- 例: flute.mp3 / acoustic-guitar.mp3 / flute-fx.mp3

アクセスURL形式:
https://kuon-rnd-audio-worker.369-1d5.workers.dev/api/audio/p-86s/piano.mp3

---

## 7. 商品情報

### P-86S（ベストセラー）

商品名（日）: P-86S ステレオマイクロフォン
商品名（英）: P-86S Stereo Microphone
価格        : 16,900円（税込）旧価格 13,900円
バッジ      : BESTSELLER
特徴        :
  - プラグインパワー対応（スマホ・タブレット直結可）
  - 1本で AB 方式ステレオ録音
  - 朝比奈幸太郎が一本一本ハンドメイド・手はんだ
  - 無指向性カプセル
  - 数十万円の高級マイクと同等以上の録音クオリティ
対象        : アコースティック楽器専門（ロック・エレキ系は対象外）
商品ページ  : kuon-rnd.com/microphone

### X-86S（プロ仕様）

商品名（日）: X-86S プロフェッショナルステレオマイクロフォン
商品名（英）: X-86S Professional Stereo Microphone
価格        : 39,600円（税込）
バッジ      : PRO
特徴        :
  - ミニ XLR 端子（バランス出力）
  - 48V ファンタム電源対応
  - スタジオ品質の AB 方式ステレオ録音
  - 朝比奈幸太郎が一本一本ハンドメイド・手はんだ
対象        : アコースティック楽器専門
商品ページ  : kuon-rnd.com/shop/x-86s（実装予定）
---

## 8. /microphone ページ リデザイン仕様（最優先タスク）

### ページの目的

kuon-rnd.com/microphone/
→ P-86S のメイン販売 LP
→ kotarohattori.com（Kotaro Studio版）と定性的 AB テスト

### コアストーリー

「音大生だった朝比奈幸太郎が、自分自身のために開発したマイク」

音大生時代に自分の演奏を録音したかった
→ 市販の高級マイク（数十万円）は買えない
→ なら自分で作ろう
→ 完成したのが P-86S（16,900円）
→ 数十万円の高級マイクと同等以上の録音クオリティ
→ 学生でも買える価格で提供

朝比奈幸太郎が一本一本手はんだで製作。
はんだの質が音の個性を決める。
（金田明彦氏の言葉を引用）

### ターゲット

メイン : 音大生・音楽系学生・アコースティック楽器奏者
サブ   : アマチュア演奏家・フィールドレコーディング愛好家
除外   : ロック系・エレキ系・バンド系

### ページ構成

1. ヒーロー
   キャッチ：「音大生だった私が、自分のために作ったマイク。」
   サブ：市販の高級マイク数十万円と同等以上のクオリティ
   CTA：今すぐ試聴する（アンカーリンク）

2. ストーリー
   音大生時代のエピソード
   朝比奈幸太郎の手はんだへのこだわり
   金田明彦氏の引用（はんだと音の関係）

3. 試聴セクション（最重要）
   アコースティック楽器のジャンル別サンプル音源
   各ジャンルに解説テキスト付き
   ファイルは kuon-rnd-audio バケットから随時追加

4. 製作哲学
   一本一本手作りする理由
   音への妥協のなさ

5. スペック・価格
   P-86S 16,900円（税込）
   Stripe Payment Link ボタン

6. 製作者プロフィール
   朝比奈幸太郎 / 空音開発

7. 最終 CTA
   購入ボタン（Stripe Payment Link）× 3箇所

### 言語対応

- 日本語デフォルト
- 英語切り替えボタン設置
- useLang() を使用（@/context/LangContext）
- const t = (ja: string, en: string) => lang === 'ja' ? ja : en

### レスポンシブ対応

- スマートフォン（320px〜）完全対応
- flex レイアウトは max-width: 767px で column に切り替え
- fontSize は clamp() 使用
- padding は clamp() 使用
- 画像は max-width: 100%
- 音声プレーヤーは width: 100%

### 決済

方式    : Stripe Payment Links（推奨）
理由    : 今すぐ販売開始できる・コード不要・Apple Pay/Google Pay 自動対応
URL形式 : https://buy.stripe.com/xxxxxxxx（Stripe ダッシュボードで取得）
設置箇所: ヒーロー CTA・スペックセクション・ページ末尾 の 3 箇所
将来    : 販売実績が出たら Stripe Checkout API に移行検討

---

## 9. Stripe 設定

商品名  : P-86S ステレオマイクロフォン
価格    : 16,900円（税込・JPY）
方式    : Payment Links
取得手順:
  1. https://dashboard.stripe.com にログイン
  2. 「Payment Links」→「+ 新規作成」
  3. 商品を追加（P-86S 16,900円）
  4. 発行された URL を /microphone ページの購入ボタンの href に設定

将来実装（Checkout Session）:
  STRIPE_SECRET_KEY=sk_live_xxxxx
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
  STRIPE_WEBHOOK_SECRET=whsec_xxxxx
  NEXT_PUBLIC_BASE_URL=https://kuon-rnd.com
  → .env.local に記載・Git にコミット禁止

---

## 10. 事業者情報（特定商取引法）

販売事業者名   : 屋号 Curanz Sounds（決済表記：Kotaro Studio Mic）
運営統括責任者 : 朝比奈 幸太郎（本名：服部 洸太郎）
所在地        : 〒080-2476 北海道帯広市自由が丘5丁目16番地35
メール        : 432@kotarohattori.com
お支払い方法   : クレジットカード、Apple Pay、Google Pay
配送          : 決済確認後 1〜3 営業日以内（受注生産品は製作完了後）
返品          : 初期不良のみ 3 日以内に連絡・良品交換または返金
購入制限      : お一人様 3 点まで（ハンドメイドのため）
---

## 11. ブランド戦略・ロードマップ

現在:
  kotarohattori.com（Kotaro Studio）でマイク販売継続
  → 月 5 台程度・アフィリエイト収益と共存

近期（〜6ヶ月）:
  kuon-rnd.com/microphone/ を完全リデザイン → P-86S 販売 LP 完成
  音声サンプルをジャンル別に追加（随時）
  Stripe Payment Links で即日販売開始
  YouTube・SNS から直リンクで集客

中期（〜1年）:
  「空音開発 × Kotaro Studio」の併記でブランド移行
  YouTube 動画説明欄のリンクを全て kuon-rnd.com/microphone に統一
  X-86S の商品ページ実装

長期（1年以降）:
  完全に「空音開発」ブランドへ移行
  kotarohattori.com → アフィリエイト専用サイトとして維持
  kotaroasahina.com サブドメイン展開:
    service.kotaroasahina.com   → ウェブ制作サービス LP（Next.js）
    recording.kotaroasahina.com → 録音サービス LP（Next.js）

---

## 12. 朝比奈幸太郎サブドメイン展開計画（将来）

kotaroasahina.com（WordPress・ブログ継続）
  ↓ 直リンク
  ├── service.kotaroasahina.com   → ウェブ制作サービス LP（Next.js・Cloudflare Pages）
  └── recording.kotaroasahina.com → 録音サービス LP（Next.js・Cloudflare Pages）

集客方法: SEO ではなく YouTube・SNS・ブログからの直リンク
理由    : ウェブ制作・録音サービスはSEOがレッドオーシャンすぎる
実装時期: 空音開発の収益が安定してから着手

---

## 13. 関連 URL 一覧

| サービス | URL |
|---------|-----|
| 空音開発（本番） | https://kuon-rnd.com |
| Curanz Sounds | https://curanzsounds.com |
| 朝比奈幸太郎 個人サイト | https://kotaroasahina.com |
| タイムマシンレコード（録音依頼） | https://academy.kotarohattori.com |
| Kotaro Studio（放置） | https://kotarohattori.com |
| eBay（海外販売） | https://www.ebay.com |
| kuon-rnd-audio Worker | https://kuon-rnd-audio-worker.369-1d5.workers.dev |

---

## 14. 実装ステータス

| ページ | パス | 状態 |
|--------|------|------|
| メイン TOP | / | 完成・本番稼働中 |
| プロフィール | /profile | 完成 |
| GPS | /gps | 完成 |
| オーディオアプリ | /audio-apps | 完成 |
| ノーマライザー | /normalize | 完成 |
| デクリッパー | /declipper | 完成 |
| マイク LP | /microphone | リデザイン対象（最優先） |
| X-86S 商品詳細 | /shop/x-86s | 未実装 |
| 購入完了 | /shop/thanks | 未実装 |
| Stripe API | /api/checkout | 未実装（Payment Links で代替） |
| 音声配信 API | /api/audio/[...fileKey] | 未実装 |
| Workers | kuon-rnd-audio-worker | デプロイ済み |
| R2 バケット | kuon-rnd-audio | 作成済み・ファイル未投入 |
---

## 15. 重要な失敗記録と再発防止策

### 失敗①：Next.js レイアウト分離の誤案内（2026年4月）

何が起きたか:
app/shop/layout.tsx を作成すれば app/layout.tsx（空音開発）を
完全に上書きして独立したショップサイトのように振る舞えると案内した。
実際には空音開発のヘッダーとショップのヘッダーが両方表示された。

正しい仕組み:
Next.js App Router のレイアウトはネスト（入れ子）で動作する。
app/layout.tsx        → 全ページに必ず適用されるルートレイアウト
app/shop/layout.tsx   → app/layout.tsx の内側に追加されるだけ
                        上書きではなく「重ねて表示」される

完全独立させる正しい方法:
方法A：Route Groups を使う（既存ページをすべて移動する必要あり）
方法B：別リポジトリ・別デプロイ（今回採用）
  kuon-rnd.com      ← 空音開発（既存）
  shop.kuon-rnd.com ← ショップ（新規リポジトリ・将来実装）

再発防止策:
- 「できます」と断言する前に前提条件と制約を必ず伝える
- 既存の本番稼働ページに影響する変更は必ずオーナーに確認してから提案する
- Next.js のレイアウト構造は「ネストで動作する」を必ず最初に明示する
- 作業指示冒頭に必ず記載：「app/layout.tsx および既存ページは一切変更しないこと」

### 失敗②：export const runtime = 'edge' の誤ったルール設定

何が起きたか:
「全ファイルで禁止」としていたが、
Curanz Sounds の Workers 連携 API Route で実際に使用・本番動作していた。

正しいルール:
- 通常のページ・コンポーネント → 禁止
- Cloudflare Workers 連携の API Route → 使用可（本番動作確認済み）

---

## 16. 音声配信 新規プロジェクト追加手順

新しいプロジェクトで音声配信を追加する場合の手順:

1. Cloudflare R2 バケット作成
   https://dash.cloudflare.com → R2 → Create bucket
   バケット名: {project-name}-audio
   バケットはプロジェクトごとに必ず分離

2. Workers プロジェクト作成（ターミナル）
   mkdir -p /Users/kotaro/{project-name}-worker/src
   cd /Users/kotaro/{project-name}-worker
   npm init -y
   npm install hono
   npm install --save-dev wrangler typescript @cloudflare/workers-types

3. wrangler.toml を作成
   name = "{project-name}-worker"
   main = "src/index.ts"
   compatibility_date = "2024-01-01"
   compatibility_flags = ["nodejs_compat"]

   [[r2_buckets]]
   binding = "AUDIO"
   bucket_name = "{bucket-name}"

   [vars]
   ENVIRONMENT = "production"

4. src/index.ts を作成
   認証不要の場合 → kuon-rnd-audio-worker の index.ts をベースにする
   認証必要の場合 → curanz-api の index.ts をベースにする

5. デプロイ
   cd /Users/kotaro/{project-name}-worker
   npx wrangler deploy

6. 動作確認
   ブラウザで https://{worker-name}.{account}.workers.dev/ にアクセス
   {"status":"ok"} が返れば成功

---

## 17. Claude Code への作業指示テンプレート

CLAUDE.md を読み込んでください。
次のタスクを実行してください：
[タスク内容をここに記述]

禁止事項（必ず守ること）:
- app/layout.tsx および既存の本番ページは一切変更しない
- export const runtime = 'edge' は通常ページでは書かない
- import パスは必ず @/ エイリアスを使う
- .env.local をコミットしない
- curanz-sounds・kotaro-studio リポジトリに触れない
- 作業前に影響範囲を必ず報告してからコードを書く

---

## 18. 次のアクション（優先順）

STEP 1: kuon-rnd-audio バケットに音声サンプルをアップロード
         → Cloudflare ダッシュボード → R2 → kuon-rnd-audio → Upload
         → ファイル名はスペースなし・ハイフン区切り（例: flute.mp3）

STEP 2: Stripe で P-86S の Payment Link を作成・URL を取得
         → https://dashboard.stripe.com
         → Payment Links → 新規作成 → P-86S 16,900円

STEP 3: /microphone ページを完全リデザイン
         → スマホ完全対応
         → 日英切り替え（useLang）
         → 試聴プレーヤー（ジャンル別・随時追加）
         → Stripe Payment Link ボタン × 3箇所
         → 朝比奈幸太郎のストーリー
         → 金田明彦氏の引用

STEP 4: ローカルで確認（npm run dev）

STEP 5: git push → Cloudflare Pages 自動デプロイ → 本番確認

---

最終更新: 2026年4月
次のアクション: 音声サンプルのアップロード → Stripe Payment Link 取得 → /microphone リデザイン
