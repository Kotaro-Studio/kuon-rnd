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
    → 例外①：Cloudflare Workers 連携の API Route → 使用可（本番動作確認済み）
    → 例外②：動的ルート（[id] 等）の layout.tsx → Cloudflare Pages ビルドに必須
       （/player/[id]/layout.tsx で確認済み）

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
│   ├── microphone/
│   │   ├── page.tsx            ← P-86S メイン販売LP（リデザイン済み・ギャラリー投稿フォーム付き）
│   │   └── layout.tsx          ← SEOメタデータ（OGP・Twitter Card・keywords）
│   ├── noise-reduction/page.tsx
│   ├── normalize/page.tsx
│   ├── normalize-lp/page.tsx
│   ├── piano-declipper/page.tsx
│   ├── profile/page.tsx
│   ├── proposal-catone/
│   ├── radar/
│   ├── revox/
│   ├── rtk-base/
│   ├── shop/
│   │   └── thanks/
│   │       ├── page.tsx        ← 購入完了ページ（パスワード表示・ギャラリー案内）
│   │       └── layout.tsx      ← noindex 設定
│   ├── web/
│   ├── webapp/
│   ├── player/
│   │   ├── upload/
│   │   │   ├── page.tsx        ← MP3アップロードページ（名前・曲名・パスワード→URL生成）
│   │   │   └── layout.tsx      ← SEOメタデータ
│   │   └── [id]/
│   │       ├── page.tsx        ← プレーヤーページ（パスワード認証→再生→削除）
│   │       └── layout.tsx      ← SEO + runtime='edge'（動的ルート）
│   ├── player-lp/
│   │   ├── page.tsx            ← KUON PLAYER LP（24時間で消えるMP3共有）
│   │   └── layout.tsx          ← SEOメタデータ
│   ├── api/
│   │   ├── checkout/route.ts   ← Stripe Checkout Session 作成（runtime='edge'）
│   │   ├── webhook/route.ts    ← Stripe Webhook 受信・メール送信（runtime='edge'）
│   │   ├── submit-recording/route.ts ← 録音投稿受付・R2アップロード（runtime='edge'）
│   │   ├── player/
│   │   │   ├── upload/route.ts       ← MP3アップロード→Worker PUT（runtime='edge'）
│   │   │   ├── meta/[id]/route.ts    ← メタデータ取得プロキシ（runtime='edge'）
│   │   │   ├── play/[id]/route.ts    ← パスワード認証→再生開始（runtime='edge'）
│   │   │   └── delete/[id]/route.ts  ← ユーザー自身による削除（runtime='edge'）
│   │   └── audio/
│   │       └── [...fileKey]/route.ts  ← 音声配信プロキシ（未実装）
│   ├── globals.css
│   ├── header.tsx              ← サイト共通ヘッダー
│   ├── layout.tsx              ← メインサイトレイアウト（絶対に触らない）
│   ├── providers.tsx           ← ClientProviders（LangContext 等）
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
├── kuon-rnd-audio-worker/     ← Cloudflare Workers（音声配信＋アップロード受付）
│   ├── src/
│   │   └── index.ts            ← GET /api/audio/:fileKey + PUT /api/upload/:fileKey
│   ├── wrangler.toml
│   └── package.json
├── kuon-rnd-player-worker/    ← Cloudflare Workers（24時間MP3プレーヤー）
│   ├── src/
│   │   └── index.ts            ← POST /api/upload + GET /api/meta/:id + POST /api/play/:id + GET /api/stream/:id + POST /api/delete/:id + Cron削除
│   ├── wrangler.toml           ← R2: kuon-rnd-player + KV: kuon-rnd-player-meta + Cron: 毎時
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

| Worker名                  | URL                                               | R2バケット     | KV           | 権限       |
|--------------------------|---------------------------------------------------|--------------|--------------|------------|
| curanz-api               | curanz-api.369-1d5.workers.dev                    | curanz-files | —            | 触らない   |
| kuon-rnd-audio-worker    | kuon-rnd-audio-worker.369-1d5.workers.dev         | kuon-rnd-audio | —          | 操作可     |
| kuon-rnd-player-worker   | kuon-rnd-player-worker.369-1d5.workers.dev        | kuon-rnd-player | kuon-rnd-player-meta | 操作可 |

---

## 6. Cloudflare R2 バケット構成

アカウント: 369@kotaroasahina.com

| バケット名      | 用途                        | 使用プロジェクト     | 権限     |
|---------------|-----------------------------|--------------------|----------|
| curanz-files  | Curanz Sounds 音声・画像     | curanzsounds.com のみ | 触らない |
| kuon-rnd-audio | 空音開発 音声サンプル        | kuon-rnd.com のみ   | 操作可   |
| kuon-rnd-player | 24時間MP3プレーヤー一時保存 | kuon-rnd.com のみ   | 操作可   |

### KV Namespace 構成

| Namespace名           | ID                                 | 用途                           | 権限     |
|----------------------|------------------------------------|---------------------------------|----------|
| kuon-rnd-player-meta | e3129d71873e421c874b529c15812c24   | プレーヤーのトラックメタデータ    | 操作可   |

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
| マイク LP | /microphone | リデザイン完了・オーナーズギャラリー投稿フォーム設置済み |
| X-86S 商品詳細 | /shop/x-86s | 未実装 |
| 購入完了 | /shop/thanks | 実装済み・パスワード表示・ギャラリー案内リンク付き |
| Stripe Checkout API | /api/checkout | 実装済み・`runtime = 'edge'` |
| Stripe Webhook | /api/webhook | 実装済み・パスワードメール＋ギャラリー案内＋SoftBank警告 |
| 録音投稿 API | /api/submit-recording | 実装済み・パスワード認証付き・`runtime = 'edge'` |
| 音声配信 API | /api/audio/[...fileKey] | 未実装（Worker直接アクセスで代替中） |
| KUON PLAYER アップロード | /player/upload | 完成・本番稼働中 |
| KUON PLAYER 再生 | /player/[id] | 完成・本番稼働中（Edge Runtime） |
| KUON PLAYER LP | /player-lp | 完成・本番稼働中 |
| Player アップロードAPI | /api/player/upload | 実装済み・`runtime = 'edge'` |
| Player メタ取得API | /api/player/meta/[id] | 実装済み・`runtime = 'edge'` |
| Player 再生認証API | /api/player/play/[id] | 実装済み・`runtime = 'edge'` |
| Player 削除API | /api/player/delete/[id] | 実装済み・`runtime = 'edge'` |
| Workers | kuon-rnd-audio-worker | デプロイ済み・音声配信＋アップロード受付 |
| Workers | kuon-rnd-player-worker | デプロイ済み・24時間MP3プレーヤー（Cron毎時） |
| R2 バケット | kuon-rnd-audio | 作成済み・試聴サンプル投入済み・submissions/ フォルダ作成済み |
| R2 バケット | kuon-rnd-player | 作成済み・24時間一時ファイル保存用 |
| KV Namespace | kuon-rnd-player-meta | 作成済み・トラックメタデータ保存用 |
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
- 動的ルート（[id] 等）の layout.tsx → Cloudflare Pages ビルドに必須（§15 失敗③参照）

### 失敗③：動的ルートの Edge Runtime 未設定によるビルド失敗（2026年4月）

何が起きたか:
`/player/[id]` を実装した際、`layout.tsx` に `export const runtime = 'edge'` を入れ忘れた。
ローカルの `npm run dev` と `npx tsc --noEmit` は通るが、
Cloudflare Pages のビルド（`@cloudflare/next-on-pages`）で以下のエラー:
「The following routes were not configured to run with the Edge Runtime: /player/[id]」

正しい対処:
動的ルート（`[id]`、`[slug]` 等のパラメータを含むパス）の layout.tsx に
`export const runtime = 'edge'` を追加する必要がある。
静的ページ（パラメータなし）には不要。

再発防止策:
- 動的ルートを作成する際は必ず layout.tsx に `export const runtime = 'edge'` を入れる
- `npx tsc --noEmit` では検出できないため、本番 push 前にエラーの可能性を意識する

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

## 19. 【最重要】アプリ系ページに関する絶対ルール

> このセクションは最優先。他のルールと矛盾した場合、こちらを優先する。

### 背景

`/audio-apps` および配下のアプリ群（`/declipper`, `/normalize`, `/piano-declipper`, `/itadaki-lp`, `/normalize-lp`, `/noise-reduction`, `/dual-mono` など）は、空音開発のマイクを購入した顧客に対して**現在進行形で提供されている現役のプロダクション機能**である。音声処理のコア機能が止まる・壊れることは、顧客との信頼を直接損ねる事故となる。

### 絶対条件

以下はアプリ系ページに関して Claude（および全ての開発者）が守るべき不可侵ルール:

1. **音声処理ロジックには絶対に触れない**
   - Web Audio API の呼び出し、AudioBuffer 操作、FFT / 畳み込み / フィルタなどの DSP コード
   - ファイル I/O、ドラッグ&ドロップ、書き出し（WAV / MP3 エンコード）処理
   - State フロー（`useState` / `useReducer` の更新ロジック）、`useEffect` の依存配列
   - イベントハンドラーの中身

2. **データ構造・API・URL は維持**
   - ページのルーティングパス（`/declipper` 等）は変更しない
   - 既存の query string、localStorage キー、URL hash は維持
   - 既存 API エンドポイントとリクエスト/レスポンス形式を変更しない

3. **変更を許可するのは "表示レイヤー" のみ**
   - CSS / インラインスタイル（レスポンシブ、色、余白、タイポグラフィ）
   - 表示テキストの多言語化（`useLang()` による切り替え、既存の日本語文言を 3 言語対応に）
   - セクション見出し、ボタンラベル、説明文などの静的テキスト

4. **変更手順（必須）**
   - 変更前に必ず当該ページをブラウザで動作確認し、何が動いているか把握する
   - 変更は最小差分で、1 コミット 1 機能
   - 型チェック (`npx tsc --noEmit`) 実行
   - ローカル（`npm run dev`）でアプリが動作することを目視確認してから push
   - 不安があれば別ブランチで検証してから main にマージ

5. **やってはいけないこと（具体例）**
   - NG: `page.tsx` を丸ごと書き直す
   - NG: 独自のアプリ内言語トグルを削除するついでに state 管理を変更する
   - NG: AudioContext の初期化タイミングを変える
   - NG: Web Worker のメッセージ形式を変える
   - NG: 依存パッケージ（`@types/*` 除く）の追加・削除
   - NG: Cloudflare の環境変数を変えずに env 依存のコードを追加

### 独自言語トグルの扱い

各アプリページに独自の日英トグルが実装されているが、サイト全体で `useLang()` による 3 言語切り替えに統一する方針となった。独自トグルは**表示レイヤーのみ**で以下のように置き換える:

- 独自トグルボタンの UI を削除（表示レイヤーのみ）
- 文言切り替えの参照元を `useLang()` の `lang` に差し替え
- **`useState('ja' | 'en')` のような状態がアプリロジックに使われていないことを確認してから**削除する。アプリ動作に影響していた場合はその state は維持し、`useLang()` と同期させる

---

## 20. （欠番 → §22 作業履歴 に統合）

---

## 21. 購入→パスワード配布 自動化システム（実装済み）

### 全体フロー

顧客が kuon-rnd.com/microphone で「購入する」を押してから、パスワードが届くまでの流れ:

```
顧客がブラウザで「購入する」ボタンを押す
  │
  ▼
kuon-rnd.com /api/checkout（Next.js API Route）
  │ → Stripe API に Checkout Session 作成をリクエスト
  │ → success_url: /shop/thanks?product=p-86s（または x-86s）
  ▼
Stripe Checkout ページ（Stripe がホスト）
  │ → 顧客がカード情報・メールアドレスを入力し決済完了
  │
  ├──────────────────────────────────────────────────────
  │                    同時に 3 つ発火
  ├──────────────────────────────────────────────────────
  │
  ▼ ① ブラウザリダイレクト（即時）
  /shop/thanks?product=p-86s
  → パスワード「kuon」を画面に表示
  → KUON NORMALIZE へのリンク
  → 商品名は ?product= パラメータで P-86S / X-86S を自動切替
  │
  ▼ ② Stripe Webhook → Resend メール送信（数秒〜数分）
  Stripe が kuon-rnd.com/api/webhook に POST 送信
  → 署名検証（HMAC-SHA256、whsec_ シークレット使用）
  → 顧客メールアドレスと商品名を抽出
  → Resend API で noreply@kotaroasahina.com からパスワードメール送信
  → メール内容: 商品名・パスワード「kuon」・KUON NORMALIZE リンク
  → オーナーズ・ギャラリー案内（投稿パスワード「kuon041755」）
  → ソフトバンクメールアドレスへの注意喚起
  │
  ▼ ③ Stripe → Zapier → HubSpot CRM（数分）
  Zapier が Stripe の新規顧客を検出
  → HubSpot にコンタクトとして自動登録（名前・メールアドレス）
```

### パスワード設計思想

- 固定パスワード「kuon」を全購入者で共有
- 意図: 「商売っけの少ない人だな」という好印象 + オーナー同士の仲間意識
- パスワードは 2 重に届く: サンクスページ（即時）+ メール（バックアップ）

### 関連ファイル

| ファイル | 役割 |
|---------|------|
| `app/api/checkout/route.ts` | Stripe Checkout Session 作成。`success_url` に `?product=` を付与。`runtime = 'edge'` |
| `app/shop/thanks/page.tsx` | 購入完了ページ。`?product=p-86s` or `x-86s` で商品名を切替。パスワード表示。ギャラリー投稿案内リンク。3 言語対応 |
| `app/shop/thanks/layout.tsx` | SEO: `robots: { index: false, follow: false }`（検索エンジンに非公開） |
| `app/api/webhook/route.ts` | Stripe Webhook 受信。署名検証 → 商品名判定 → Resend でメール送信（パスワード＋ギャラリー案内＋SoftBank注意）。`runtime = 'edge'` |
| `app/api/submit-recording/route.ts` | 録音投稿受付。パスワード検証 → Worker経由R2アップロード → Resendでオーナー通知。`runtime = 'edge'` |

### 環境変数（Cloudflare Pages に登録済み）

| 変数名 | 値の形式 | 用途 |
|--------|---------|------|
| `STRIPE_SECRET_KEY` | `rk_live_...` | Stripe Restricted Key（Checkout Session 作成用） |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Webhook 署名検証用シークレット |
| `RESEND_API_KEY` | `re_...` | Resend メール送信用 API キー |
| `UPLOAD_SECRET` | hex 文字列 | 録音投稿の R2 アップロード認証トークン（Pages と Worker の両方に同一値を登録） |

登録方法:
- Pages: `npx wrangler pages secret put <変数名> --project-name kuon-rnd`
- Worker: `cd kuon-rnd-audio-worker && npx wrangler secret put <変数名>`

### 外部サービス設定

| サービス | 設定内容 | 状態 |
|---------|---------|------|
| Stripe Webhook | エンドポイント `https://kuon-rnd.com/api/webhook`、イベント `checkout.session.completed` | 設定済み・アクティブ |
| Resend ドメイン | `kotaroasahina.com`（Tokyo リージョン）、DKIM/SPF/DMARC 検証済み | Verified |
| DNS（エックスサーバー サーバーパネル） | `resend._domainkey` TXT / `send` MX / `send` TXT / `_dmarc` TXT | 設定済み |
| Zapier | Stripe → HubSpot コンタクト自動登録 | 設定済み |
| HubSpot | CRM コンタクト管理 | 設定済み |

### Stripe 商品・価格 ID

| 商品 | Price ID | 価格 |
|------|----------|------|
| P-86S | `price_1SuT6IGbZ5gwwaLkc7rjciqU` | ¥13,900（税込） |
| X-86S | `price_1SuTKHGbZ5gwwaLkR6ew580Z` | ¥39,600（税込） |

### Kotaro Studio との共存

- Kotaro Studio（kotarohattori.com）は Stripe **Payment Links** で販売継続中
- 空音開発（kuon-rnd.com）は Stripe **Checkout Session API** で販売
- 両方とも同じ Stripe アカウント内で独立して動作
- 片方を変更しても、もう片方には一切影響しない

### DNS 設定の注意点（エックスサーバー）

エックスサーバーには 2 つの DNS 管理画面がある:
1. **サーバーパネル → DNSレコード設定**（こちらが正しい・実際に DNS に反映される）
2. **Xserverドメイン → DNSレコード設定**（こちらに追加しても反映されない）

DNS レコードは必ず**サーバーパネル**側で追加すること。
ホスト名にはサブドメイン部分のみ入力（例: `resend._domainkey`）。
`.kotaroasahina.com` はエックスサーバーが自動付与する。

---

## 23. オーナーズ・ギャラリー投稿システム（実装済み）

### 概要

P-86S / X-86S の購入者が自分の録音を投稿し、空音開発のサイトで紹介する仕組み。
購入者のみが投稿できるようパスワード保護されている。

### 目的

- 購入者の承認欲求を満たす（自分の録音がプロのサイトに掲載される）
- P-86S / X-86S の実際の録音クオリティを見込み客に訴求（社会的証明）
- 朝比奈幸太郎のマスタリング処理という付加価値で購入後の満足度を向上
- コミュニティ形成によるブランドロイヤリティ強化

### 全体フロー

```
購入者が /microphone#gallery-submit の投稿フォームにアクセス
  │
  │ ※ サンクスページ or 購入確認メールからリンク
  │
  ▼
投稿フォーム入力（名前、メール、楽器、曲名、コメント、MP3ファイル）
  │
  │ 投稿パスワード「kuon041755」を入力（購入者のみが知っている）
  │ マスタリング許可チェック（任意）
  │
  ▼
/api/submit-recording（Next.js API Route, Edge Runtime）
  │ ① パスワード検証（kuon041755）
  │ ② バリデーション（MP3のみ、20MB以下、必須項目チェック）
  │ ③ ファイル名生成: submissions/YYYYMMDD-名前-曲名.mp3
  │
  ├──────────────────────────────────────────────────────
  │                    2 つの処理を実行
  ├──────────────────────────────────────────────────────
  │
  ▼ ① Worker 経由で R2 にアップロード
  PUT https://kuon-rnd-audio-worker.369-1d5.workers.dev/api/upload/submissions/...
  → Authorization: Bearer <UPLOAD_SECRET>
  → Worker が submissions/ プレフィックスを検証
  → R2 バケット（kuon-rnd-audio）に保存
  │
  ▼ ② Resend でオーナーに通知メール送信
  → 宛先: 369@kotaroasahina.com
  → 投稿者情報（名前・メール・楽器・曲名・コメント・マスタリング希望・サイズ）
  → 試聴リンク付き
```

### パスワード設計

| パスワード | 用途 | 知っている人 |
|-----------|------|------------|
| `kuon` | KUON NORMALIZE アプリ利用 | 全購入者 |
| `kuon041755` | オーナーズ・ギャラリー投稿 | 全購入者（メール＋サンクスページで案内） |

- 投稿パスワードは購入確認メール内に記載
- サンクスページにもギャラリーへのリンクを表示
- パスワードが一致しないと API が 403 を返す

### 関連ファイル

| ファイル | 役割 |
|---------|------|
| `app/microphone/page.tsx` | 投稿フォーム（`SubmissionForm` コンポーネント、`#gallery-submit` アンカー） |
| `app/api/submit-recording/route.ts` | 投稿受付 API（パスワード検証 → Worker PUT → Resend 通知） |
| `kuon-rnd-audio-worker/src/index.ts` | PUT `/api/upload/:fileKey` エンドポイント（Bearer 認証、submissions/ 強制） |
| `app/api/webhook/route.ts` | 購入確認メールにギャラリー案内＋投稿パスワードを含む |
| `app/shop/thanks/page.tsx` | サンクスページにギャラリー投稿リンクを表示 |

### R2 バケット構成（更新）

```
kuon-rnd-audio/
├── p-86s/               ← マイク試聴サンプル
│   ├── piano.mp3
│   ├── violin.mp3
│   └── ...
├── x-86s/               ← X-86S 試聴サンプル（後日追加）
├── hikaku/              ← 比較試聴用音源
├── submissions/          ← 投稿された録音（API経由で自動保存）
│   └── 20260417-山田太郎-ショパンノクターン.mp3
└── recordings/           ← オーナー承認済み・掲載用に移動した音源
    └── （朝比奈がマスタリング後に配置）
```

### Worker エンドポイント一覧（kuon-rnd-audio-worker）

| メソッド | パス | 認証 | 用途 |
|---------|------|------|------|
| GET | `/api/audio/:fileKey` | なし | 音声ファイル配信（ストリーミング・Range対応） |
| PUT | `/api/upload/:fileKey` | Bearer `UPLOAD_SECRET` | 録音投稿アップロード（submissions/ のみ） |

### 環境変数

| 変数名 | 登録先 | 用途 |
|--------|--------|------|
| `UPLOAD_SECRET` | Cloudflare Pages + Worker の両方 | Worker アップロード認証 |
| `RESEND_API_KEY` | Cloudflare Pages | 通知メール送信 |

### 投稿後のオーナー作業（手動）

1. 369@kotaroasahina.com に通知メールが届く
2. 試聴リンクで音源を確認
3. マスタリング希望の場合 → DAW でマスタリング処理
4. R2 ダッシュボードで `recordings/` に掲載用ファイルをアップロード
5. ギャラリーページに掲載（将来的にページ実装予定）

### ギャラリー掲載ページ（将来実装）

現時点では投稿受付の仕組みのみ完成。掲載用のギャラリーページは投稿が集まり次第実装予定。
UIデザインコンセプト:
- カード型レイアウト（投稿者名・楽器・曲名・コメント・再生プレーヤー）
- 朝比奈幸太郎マスタリング済みバッジ表示
- グリッドレイアウト（レスポンシブ、auto-fill minmax(280px, 1fr)）

### 購入確認メールの内容（Webhook 経由で送信）

メールには以下のセクションが含まれる（上から順に）:
1. 商品名＋お礼メッセージ
2. 発送案内（1〜3営業日）
3. KUON NORMALIZE パスワード「kuon」（青グラデーションボックス）
4. 「KUON NORMALIZE を開く」ボタン
5. オーナーズ・ギャラリー案内＋投稿パスワード「kuon041755」
6. 「録音を投稿する」ボタン
7. ソフトバンクメール注意書き（黄色警告ボックス）
8. フッター（kuon-rnd.com リンク・問い合わせメール）

### ソフトバンクメール問題への対処

ソフトバンク系メールアドレス（@softbank.ne.jp, @i.softbank.jp 等）では迷惑メールフィルタにより
当社からのメールが届かない場合がある。メール内に以下の注意書きを記載:
- 別のメールアドレス（Gmail 等）を添えて `kuon-rnd.com/#contact` のお問い合わせフォームから連絡するよう案内
- パスワードを再送する旨を明記

---

## 22. 作業履歴

### 2026-04-15 セッション（大規模改修）

| カテゴリ | 変更内容 |
|---|---|
| 音声配信 | `kuon-rnd-audio-worker/src/index.ts` の Range リクエストバグ修正（R2 の `.get()` に `range` オプションを渡していなかった問題）。`wrangler deploy` で本番反映済み。 |
| /microphone | LP 全面リデザイン（試聴プレーヤー、購入 CTA の浮遊ボタン、マウス追従パララックス、登場アニメーション `buyCtaIn` キーフレームで transform 衝突解消）。フィールド録音セクション削除。Mic D = Earthworks QTC30 に修正。製作者名を `/profile` へリンク化。ヘンデル音源ファイル名を `ヘンデル組曲ニ短調.mp3` に統一。価格表示を ¥13,900 に戻す。 |
| Stripe 決済 | `/api/checkout/route.ts` 実装（Restricted Key 対応、オリジン自動検出で `NEXT_PUBLIC_BASE_URL` 不要）。Price ID: `p-86s`=`price_1SuT6IGbZ5gwwaLkc7rjciqU`, `x-86s`=`price_1SuTKHGbZ5gwwaLkR6ew580Z`。Cloudflare Pages に `STRIPE_SECRET_KEY`（Restricted `rk_live_...`）を登録済み。 |
| 言語システム | 5 言語（ja/en/es/pt/de）→ **3 言語（ja/en/es）** に縮小。`context/LangContext.tsx` の Lang 型更新、`detectLang()` のフォールバック簡略化。サイト全体を `useLang()` に統一中。 |
| /profile | 独自 3 言語トグルを削除し、サイト共通の `useLang()` に統合。pt/de ブロック削除。 |
| ヘッダー | `app/header.tsx` 新設。明朝×サンセリフの統一タイポグラフィ、レスポンシブ、スクロール連動のガラスモーフィズム、モバイルはハンバーガー → 全画面オーバーレイ（明朝フォントで大きめメニュー、番号付き、スクロールロック）。IntersectionObserver による scroll-spy でトップページのアンダーライン誤表示を解消。 |
| /（Top） | `useLang()` に統合し 3 言語対応（ja/en/es）。Technology カードを `grid auto-fit minmax` で確実な折返し。全セクションを `clamp()` で完全レスポンシブ化。`wordBreak: keep-all` で日本語の不自然な改行防止。 |
| ビルド対応 | `tsconfig.json` に `"kuon-rnd-audio-worker"` を exclude 追加（Next.js ビルド時に Worker の型を拾ってしまう問題を解消）。.gitignore に `node_modules/`（recursive）、`.claude/`、`.wrangler/`、`.dev.vars` を追加。 |

### 2026-04-16 セッション（パスワード自動配布システム構築）

| カテゴリ | 変更内容 |
|---|---|
| Resend 設定 | kotaroasahina.com ドメイン認証完了（Tokyo リージョン）。DNS レコード 4 件をエックスサーバー**サーバーパネル**に追加（当初 Xserverドメイン側に追加して失敗→サーバーパネルに移行で解決）。API キー発行済み。 |
| Webhook | `app/api/webhook/route.ts` 新規作成。Stripe 署名検証（Edge 互換 HMAC-SHA256）、商品名自動判定（Price ID / amount_total）、Resend API でパスワードメール送信。 |
| サンクスページ | `app/shop/thanks/page.tsx` 新規作成。`?product=p-86s` / `?product=x-86s` で商品名を切替表示。パスワード「kuon」+ KUON NORMALIZE リンク。3 言語対応。 |
| Checkout API 更新 | `success_url` を `/shop/thanks?product={product}` に変更。 |
| Stripe Webhook | ダッシュボードで `https://kuon-rnd.com/api/webhook` を登録、`checkout.session.completed` イベント。 |
| Cloudflare 環境変数 | `RESEND_API_KEY`、`STRIPE_WEBHOOK_SECRET` を `wrangler pages secret put` で登録。 |
| HubSpot + Zapier | Stripe → Zapier → HubSpot コンタクト自動登録を設定（オーナーが手動設定）。 |

### 2026-04-17 セッション（オーナーズ・ギャラリー投稿システム構築）

| カテゴリ | 変更内容 |
|---|---|
| Worker 更新 | `kuon-rnd-audio-worker/src/index.ts` に PUT `/api/upload/:fileKey` エンドポイント追加。Bearer トークン認証、`submissions/` プレフィックス強制、20MB 制限。CORS に PUT・Authorization を追加。 |
| 録音投稿 API | `app/api/submit-recording/route.ts` 新規作成。FormData 受信 → パスワード検証（`kuon041755`） → Worker PUT で R2 アップロード → Resend でオーナー通知メール。`runtime = 'edge'`。 |
| /microphone 更新 | ページ末尾に「オーナーズ・ギャラリー」セクション追加（`#gallery-submit`）。`SubmissionForm` コンポーネント: 名前・メール・楽器選択・曲名・コメント・MP3アップロード・投稿パスワード・マスタリング許可チェック。 |
| /shop/thanks 更新 | ギャラリー投稿への案内カード追加（`/microphone#gallery-submit` へのリンク）。 |
| Webhook メール更新 | `app/api/webhook/route.ts` の購入確認メールにオーナーズ・ギャラリー案内（投稿パスワード `kuon041755`）、ソフトバンクメール注意書き（`/#contact` フォームへの誘導）を追加。 |
| SEO | `app/microphone/layout.tsx` 新規作成（title, description, keywords, OGP, Twitter Card）。`app/layout.tsx` に metadataBase・title template・OGP・Twitter Card 追加。`/microphone` に JSON-LD Product structured data 追加。 |
| R2 フォルダ | `kuon-rnd-audio` バケットに `submissions/` および `recordings/` フォルダ作成。 |
| CLAUDE.md | §4 ディレクトリ構成更新、§14 実装ステータス更新、§21 関連ファイル・環境変数追加、§23 オーナーズ・ギャラリー投稿システム新規セクション追加。 |

## 24. オーナーズ・ギャラリー掲載ページ（実装済み）

### 仕組み

- ページ: `kuon-rnd.com/gallery`
- データソース: `data/recordings.json`（JSONファイル1つで管理）
- 表示順: 新しい順（自動）
- マスタリング済みバッジ: `mastered: true` のエントリに自動表示

### ファイル構成

| ファイル | 役割 |
|---------|------|
| `data/recordings.json` | 掲載する録音の一覧データ（これだけ編集する） |
| `app/gallery/page.tsx` | ギャラリーページ（JSONを読み込みカード型で表示） |
| `app/gallery/layout.tsx` | SEOメタデータ |

### recordings.json のエントリ形式

```json
{
  "id": "001",
  "name": "投稿者のお名前",
  "instrument": "楽器名",
  "title": "曲名",
  "comment": "投稿者のコメント",
  "file": "recordings/ファイル名.mp3",
  "mic": "P-86S または X-86S",
  "mastered": true または false,
  "date": "YYYY-MM-DD"
}
```

### オーナーの掲載作業手順

1. 通知メールで投稿内容を確認
2. マスタリング許可がある場合は DAW で処理
3. R2 ダッシュボード → `kuon-rnd-audio` → `recordings/` にファイルをアップロード
4. `data/recordings.json` にエントリを追加
5. `cd ~/kuon-rnd && git add -A && git commit -m "ギャラリー追加" && git push`

### Claude にギャラリー掲載を依頼するためのプロンプト

以下をコピペして、【】内を書き換えて伝えるだけで掲載作業が完了します:

```
CLAUDE.md を読み込んでください。
ギャラリーに新しい録音を掲載してください。

投稿者: 【佐藤 美咲】
楽器: 【ピアノ】
曲名: 【ショパン ノクターン Op.9 No.2】
コメント: 【自宅のアップライトピアノで録りました】
R2ファイル名: 【recordings/sato-misaki-chopin-nocturne.mp3】
使用マイク: 【P-86S】
マスタリング済み: 【はい】

data/recordings.json にエントリを追加し、型チェックを通してください。
```

※ R2 へのファイルアップロードはオーナーが事前に行う（Claude はR2に直接アップロードできない）。
※ Claude は recordings.json への追記 → 型チェック → git push 用コマンドの提示まで行う。

---

## 22. 作業履歴

（以下は既存の作業履歴セクションの続き）

### 2026-04-17 セッション 続き（ギャラリー掲載ページ構築）

| カテゴリ | 変更内容 |
|---|---|
| ギャラリーページ | `app/gallery/page.tsx` 新規作成。`data/recordings.json` を読み込みカード型グリッドで表示。新しい順。マスタリング済みバッジ自動表示。3言語対応。投稿CTAリンク付き。 |
| ギャラリーSEO | `app/gallery/layout.tsx` 新規作成（title, description, OGP, canonical）。 |
| データファイル | `data/recordings.json` 新規作成。サンプルエントリ1件。 |
| CLAUDE.md | §24 ギャラリー掲載ページ仕様・運用ガイド・Claudeへの依頼プロンプト追加。 |

### 2026-04-17 セッション 続き②（MASTER CHECK 自動調整 + DDP Gap Listen + KUON CONVERTER）

| カテゴリ | 変更内容 |
|---|---|
| MASTER CHECK 自動調整 | `app/master-check/page.tsx` にプラットフォーム別ラウドネス自動調整＋WAVダウンロード機能追加。tanh ソフトクリップリミッター（-0.1 dBTP ceiling）、16bit PCM WAV エンコーダー搭載。各プラットフォーム行に「調整してダウンロード」ボタン追加。 |
| MASTER CHECK LP 更新 | `app/master-check-lp/page.tsx` にワンクリック調整の EXCLUSIVE 機能カード追加、比較表に自動調整＋リミッター行追加、ステップ4追加、モック UI 更新。 |
| MASTER CHECK SEO | `app/master-check-lp/layout.tsx` のタイトル・説明・キーワードに自動調整関連を追加。 |
| DDP Gap Listen | `app/ddp-checker/page.tsx` に曲間試聴（Gap Listen）機能追加。前トラック末尾15秒→曲間→次トラック冒頭5秒を連続再生。紫色の「⏮ 曲間を聴く」ボタン（トラック2以降）。`playingMode: 'track' | 'gap'` で再生モード管理。 |
| DDP LP 更新 | `app/ddp-checker-lp/page.tsx` に Gap Listen EXCLUSIVE カード追加、比較表に曲間試聴＋リードイン表示行追加、モック UI に紫 Gap ボタン追加。JSON-LD 更新。 |
| DDP SEO | `app/ddp-checker-lp/layout.tsx` のタイトル・説明・キーワードに曲間試聴関連（ja/en/es）追加。 |
| KUON CONVERTER | `app/converter/page.tsx` 新規作成。WAV → MP3 コンバーター（160kbps / 320kbps 選択）。lamejs 使用。Turbopack ESM 互換性問題のため `public/lamejs/lame.all.js` をスクリプトタグで読み込む方式を採用。3言語対応。 |
| CONVERTER SEO | `app/converter/layout.tsx` 新規作成（title, description, keywords, OGP, Twitter Card, canonical）。 |
| CONVERTER 型定義 | `types/lamejs.d.ts` 新規作成。 |
| audio-apps 更新 | `app/audio-apps/page.tsx` に MASTER CHECK の説明文更新（自動調整言及）、KUON CONVERTER カード追加（`isNew: true`）。 |

---

## 25. オーナーの Rust / Wasm 開発環境

### 確認済み環境（2026-04-17）

| ツール | バージョン | 状態 |
|--------|-----------|------|
| rustc | 1.81.0 (2024-09-04) | ✅ インストール済み |
| cargo | 1.81.0 (2024-08-20) | ✅ インストール済み |
| wasm-pack | 0.13.0 | ✅ インストール済み |

マシン: Kotaros-MacBook-Air（Apple Silicon）

### Wasm ビルドフロー（確定）

```
Rust ソースコード（Claude が作成）
  ↓
wasm-pack build --target web（オーナーが Mac で実行・1回だけ）
  ↓
.wasm ファイル + JS グルーコード生成
  ↓
public/wasm/ に配置
  ↓
git push → Cloudflare Pages 自動デプロイ
  ↓
世界中のユーザーがブラウザでアクセス可能
```

### 重要な理解

- Rust のビルドはオーナーの Mac で一度実行するだけ
- 生成された .wasm ファイルは静的ファイル（JPEG や JS と同じ）
- Cloudflare Pages にデプロイすれば Mac を閉じてもアプリは動き続ける
- コードの更新があれば再ビルド → git push するだけ

---

## 27. KUON PLAYER — 24時間で消えるMP3共有システム（実装済み）

### 概要

MP3ファイルをアップロードし、パスワード付き共有リンクを生成。再生開始から24時間後に自動削除。
ストリーミング再生のみ（ダウンロード不可）。ユーザーがパスワードで即時削除も可能。

### 全体フロー

```
アップロード者が /player/upload にアクセス
  │
  │ 名前・曲名・パスワード・MP3ファイル（最大99MB）を入力
  │
  ▼
/api/player/upload（Next.js API Route, Edge Runtime）
  │ ① パスワードを SHA-256 ハッシュ化
  │ ② メタデータを X-Meta ヘッダに付与
  │ ③ Worker に POST でファイルアップロード
  ▼
kuon-rnd-player-worker POST /api/upload
  │ ① Bearer トークン検証（PLAYER_SECRET）
  │ ② ユニークID生成（12文字 hex）
  │ ③ R2 にファイル保存（kuon-rnd-player/{id}.mp3）
  │ ④ KV にメタデータ保存（kuon-rnd-player-meta/{id}、TTL 48h）
  │ ⑤ ID を返す
  ▼
フロントで共有URL生成: https://kuon-rnd.com/player/{id}
  │
  │ リンクとパスワードを相手に送信
  │
  ▼
受信者が /player/{id} にアクセス
  │
  │ パスワードを入力
  │
  ▼
/api/player/play/{id} → Worker POST /api/play/{id}
  │ ① SHA-256 ハッシュ検証
  │ ② 初回再生日時を記録（ここから24時間カウントダウン開始）
  │ ③ KV TTL を25時間に更新
  ▼
Worker GET /api/stream/{id}?h={hash}
  │ ストリーミング再生（Range リクエスト対応）
  │ Cache-Control: no-store
  ▼
24時間経過 → Cron Trigger（毎時）が自動削除
  または
ユーザーが「削除」ボタン → POST /api/delete/{id} で即時削除
```

### セキュリティ設計

| 項目 | 実装 |
|------|------|
| パスワード保存 | SHA-256 ハッシュ（平文保存なし） |
| ストリーミング | Range リクエスト対応、`Cache-Control: no-store` |
| ダウンロード | 不可（ダウンロードボタンなし、ストリーミングのみ） |
| 自動削除 | 初回再生から24時間後（Cron Trigger 毎時実行） |
| 手動削除 | パスワード認証で即時削除可能 |
| ファイル上限 | 99MB |
| 内部通信 | Worker ↔ Pages 間は Bearer トークン（PLAYER_SECRET）で認証 |

### 関連ファイル

| ファイル | 役割 |
|---------|------|
| `kuon-rnd-player-worker/src/index.ts` | Worker 本体（全エンドポイント + Cron） |
| `kuon-rnd-player-worker/wrangler.toml` | R2 + KV バインディング + Cron 設定 |
| `app/api/player/upload/route.ts` | アップロードプロキシ（FormData → Worker） |
| `app/api/player/meta/[id]/route.ts` | メタデータ取得プロキシ |
| `app/api/player/play/[id]/route.ts` | 再生認証プロキシ |
| `app/api/player/delete/[id]/route.ts` | 削除プロキシ |
| `app/player/upload/page.tsx` | アップロードUI |
| `app/player/[id]/page.tsx` | プレーヤーUI（シークバー・カウントダウン・削除） |
| `app/player/[id]/layout.tsx` | `runtime = 'edge'`（動的ルート必須） |
| `app/player-lp/page.tsx` | LP |

### 環境変数

| 変数名 | 登録先 | 用途 |
|--------|--------|------|
| `PLAYER_SECRET` | Cloudflare Pages + kuon-rnd-player-worker | Worker アップロード認証（同一値） |

### Worker エンドポイント一覧（kuon-rnd-player-worker）

| メソッド | パス | 認証 | 用途 |
|---------|------|------|------|
| POST | `/api/upload` | Bearer `PLAYER_SECRET` | MP3アップロード + ID生成 + KV保存 |
| GET | `/api/meta/:id` | なし | 公開メタデータ取得（パスワードハッシュ除く） |
| POST | `/api/play/:id` | passwordHash | パスワード認証 + 初回再生日時記録 |
| GET | `/api/stream/:id?h=` | クエリパラメータ | ストリーミング配信（Range対応） |
| POST | `/api/delete/:id` | passwordHash | ユーザーによる即時削除 |
| Cron | `0 * * * *` | — | 期限切れトラックの自動削除（毎時） |

---

## 26. Rust Wasm アプリ開発ロードマップ

### 基盤技術

空音開発の全 Wasm アプリは以下の2つの Rust コアライブラリを共有する構想:

```
kuon-audio-core (Rust → Wasm)
├── LUFS 計算（EBU R128 / ITU-R BS.1770）
├── True Peak 検出
├── FFT / スペクトラム解析
├── ピッチ検出（YIN / autocorrelation）
├── MP3 / FLAC エンコード
├── DDP パーサー
├── DSD デシメーションフィルタ
└── リサンプラー（sinc 補間）

kuon-geo-core (Rust → Wasm)
├── NMEA / UBX パーサー
├── RTK 測位エンジン
├── 座標変換（WGS84 ↔ 平面直角座標系）
├── ジオイド補正（GSIGEO2024 / EGM2008）
└── GPX / KML 読み書き
```

### 開発予定アプリ（全10本）

#### 音声系（6本）

| # | アプリ名 | 概要 | 技術的核心 | 優先度 |
|---|---------|------|-----------|--------|
| 1 | DSD コンバーター | DSD → WAV（サンプリング周波数選択） | DSF/DFF パーサー + デシメーションフィルタ（dsd2pcm 移植） | ✅ 完了 |
| 2 | リアルタイムラウドネスメーター | Momentary / Short-term / Integrated LUFS をリアルタイム表示 | AudioWorklet + Wasm、K-weighting フィルタ、ゲート処理 | ★★★★ |
| 3 | スペクトラムアナライザー | リファレンス比較 + 楽器テンプレート + MASTER CHECK 連携 | 8192点 FFT リアルタイム、Canvas 描画 | ★★★★★ |
| 4 | 高精度リサンプラー | 44.1k ↔ 48k ↔ 88.2k ↔ 96k ↔ 192k 相互変換 | sinc 補間フィルタ | ★★★ |
| 5 | ステレオイメージアナライザー | ゴニオメーター（リサージュ図形）でステレオ位相を可視化 | リアルタイム L/R 位相解析 | ★★★ |
| 6 | オーディオフォレンジックツール | 録音の真正性検証・編集痕跡検出 | 高精度 FFT + ケプストラム分析 | ★★ |

#### GPS / 空系（4本）

| # | アプリ名 | 概要 | 技術的核心 | 優先度 |
|---|---------|------|-----------|--------|
| 7 | RTK 測位エンジン | ブラウザ版 RTKLIB（世界初） | Web Serial API + 搬送波位相 Ambiguity Resolution | ★★★★ |
| 8 | RINEX / UBX ビューアー | GNSS 観測データの可視化・変換 | バイナリパーサー + 衛星仰角/方位角プロット | ★★★ |
| 9 | GPX 大規模トラックレンダラー | 数十万ポイントの GPS ログ高速描画 | Wasm パース + Canvas 直接描画 + データ間引き | ★★ |
| 10 | ジオイド高計算エンジン | 楕円体高 → 標高変換（全世界対応） | GSIGEO2024 / EGM2008 モデル計算 | ★★ |

### 開発順序の方針

1. まず JavaScript で作れるアプリを先に出す（集客・SEO 効果を早期に得る）
2. Rust Wasm は DSD コンバーターで初の実戦投入（ビルドパイプライン構築）
3. その基盤を使ってリアルタイムメーター → スペクトラムアナライザーへ展開
4. GPS 系は RTK 測位エンジンから着手（最もインパクトが大きい）

---

## 22. 作業履歴（続き）

最終更新: 2026年4月18日

### 2026-04-17〜18 セッション（DSD コンバーター完成 + KUON PLAYER 構築）

| カテゴリ | 変更内容 |
|---|---|
| DSD コンバーター | `kuon-dsd-converter/src/lib.rs` Rust Wasm DSD処理エンジン完成。DSFパーサーオフセットバグ修正（channel_num +24, sample_rate +28, bits_per_sample +32）。Blackman窓sinc FIR ローパスフィルタ実装（-74dB ストップバンド）。バイトレベルLUT最適化。DFF対応。 |
| DSD プレーヤー | `app/dsd/page.tsx` にシークバー＋AudioBufferキャッシュ（2回目再生は即時）実装。非対応サンプルレートの理由表示追加。 |
| DSD LP | `app/dsd-lp/page.tsx` + `layout.tsx` 新規作成。世界初ブラウザDSDプレーヤーのLP。比較表・技術仕様・6機能カード。3言語対応。 |
| KUON PLAYER Worker | `kuon-rnd-player-worker/` 新規作成・デプロイ済み。R2（kuon-rnd-player）+ KV（kuon-rnd-player-meta）。アップロード・メタ取得・パスワード認証再生・ストリーミング（Range対応）・ユーザー削除・Cron自動削除（毎時）。 |
| KUON PLAYER API | `app/api/player/` に4本のAPI Route新規作成（upload, meta/[id], play/[id], delete/[id]）。全て `runtime = 'edge'`。 |
| KUON PLAYER アップロード | `app/player/upload/page.tsx` + `layout.tsx` 新規作成。名前・曲名・パスワード入力→MP3ドラッグ&ドロップ→共有URL生成。99MB上限。3言語対応。 |
| KUON PLAYER 再生 | `app/player/[id]/page.tsx` + `layout.tsx` 新規作成。パスワード認証→ストリーミング再生→シークバー→24時間カウントダウン→ユーザー削除ボタン。3言語対応。`layout.tsx` に `runtime = 'edge'`（動的ルート必須）。 |
| KUON PLAYER LP | `app/player-lp/page.tsx` + `layout.tsx` 新規作成。ペインポイント→5つの安心→3ステップ→ユースケース→テクノロジー。3言語対応。 |
| Cloudflare インフラ | R2バケット `kuon-rnd-player` 作成。KV Namespace `kuon-rnd-player-meta`（ID: e3129d71873e421c874b529c15812c24）作成。環境変数 `PLAYER_SECRET` をWorker + Pagesの両方に登録。 |
| audio-apps 更新 | KUON PLAYERカード追加（先頭、`isNew: true`）。DSDカードのhrefを `/dsd-lp` に変更。 |
| tsconfig.json | `exclude` に `kuon-rnd-player-worker` 追加。 |
| ビルドエラー修正 | `/player/[id]/layout.tsx` に `export const runtime = 'edge'` 追加（Cloudflare Pages ビルド失敗の原因）。LP の絵文字をHTMLエンティティからUnicode直接記述に修正。 |

### 未完了タスク（次回セッション向け）

1. **UPLOAD_SECRET の登録** — kuon-rnd-audio-worker（ギャラリー投稿用）にまだ未登録
   - Worker: `cd kuon-rnd-audio-worker && npx wrangler secret put UPLOAD_SECRET`
   - Pages: `npx wrangler pages secret put UPLOAD_SECRET --project-name kuon-rnd`
2. **kuon-rnd-audio-worker の再デプロイ** — アップロードエンドポイント追加分を本番反映
   - `cd kuon-rnd-audio-worker && npx wrangler deploy`
3. **購入フロー E2E テスト** — テスト決済 → サンクスページ → メール受信 → 投稿フォーム動作確認
4. **アプリ系ページの独自言語トグル撤廃** — サイト共通 `useLang()` への統一（§19 の絶対条件を遵守）
5. **DSD コンバーター Wasm リビルド** — `cd ~/kuon-rnd/kuon-dsd-converter && wasm-pack build --target web --release` → `public/wasm/` にコピー → push
6. **Rust Wasm 次期アプリ開発** — §26 ロードマップ参照。DSD完了済み、次はリアルタイムラウドネスメーターまたはスペクトラムアナライザー
7. **5月サブスク化準備** — 全アプリのLP書き換え（価格・サブスク表記追加）
