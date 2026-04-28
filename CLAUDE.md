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
| メインメール（連絡先） | 369@kotaroasahina.com |
| Google アカウント（GCP/Gmail ログイン用） | curanzsounds@gmail.com |
| GCP プロジェクト | kuon-rnd（番号: 342028960302） |
| YouTube | 朝比奈幸太郎の音響実験室 |
| 職能 | 音響エンジニア・マイク設計者・GPS/RTK開発者・Webエンジニア・音楽家 |

> **重要**: オーナーが実際にログインする Google アカウントは `curanzsounds@gmail.com`。
> `369@kotaroasahina.com` はメインの連絡先メールアドレス（独自ドメイン）で、
> Google ログインには使わない。GCP 操作・Gmail・各種 Google サービスは
> すべて `curanzsounds@gmail.com` アカウントで行う。

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

アカウント: 369@kotaroasahina.com（Cloudflare ログインメール）

| バケット名      | 用途                        | 使用プロジェクト     | 権限     |
|---------------|-----------------------------|--------------------|----------|
| curanz-files  | Curanz Sounds 音声・画像     | curanzsounds.com のみ | 触らない |
| kuon-rnd-audio | 空音開発 音声サンプル        | kuon-rnd.com のみ   | 操作可   |
| kuon-rnd-player | 24時間MP3プレーヤー一時保存 | kuon-rnd.com のみ   | 操作可   |
| kuon-rnd-separator | SEPARATOR ステム出力（24h lifecycle） | kuon-rnd.com / Cloud Run | 操作可 |

### R2 API トークン更新リマインダー

| トークン名 | 発行日 | 有効期限 | 次回更新期限 |
|-----------|-------|---------|-------------|
| kuon-rnd-separator | 2026-04-23 | 1 year | 2027-04-16（1週間前にカレンダー登録推奨） |

トークン失効時の更新手順:
1. Cloudflare R2 Dashboard で新しいトークンを発行（同じ名前・同じ権限）
2. `gcloud secrets versions add r2-access-key-id --data-file=-` で新しい値を追加
3. `gcloud secrets versions add r2-secret-access-key --data-file=-` 同上
4. Cloud Run サービスを再デプロイして最新バージョンの Secret を読み込ませる
5. Cloudflare Dashboard から古いトークンを削除

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
価格        : 13,900円（税込）※日本円のみ表示（2026-04-25 確定: Stripe Live mode の Price ID `price_1SuT6IGbZ5gwwaLkc7rjciqU` と整合）
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

販売事業者名   : 屋号 Kuon R&D（決済表記：KUON-RND.COM）
運営統括責任者 : 朝比奈 幸太郎（本名：服部 洸太郎）
所在地        : 〒080-2476 北海道帯広市自由が丘5丁目16番地35
メール        : 369@kotaroasahina.com
お支払い方法   : クレジットカード、Apple Pay、Google Pay（Stripe 決済）
配送          : ハードウェアは決済確認後 1〜3 営業日以内（受注生産品は製作完了後）。デジタル商品・サブスクリプションは決済確認後即時提供。
返品          : ハードウェアは初期不良のみ 3 日以内に連絡で良品交換または返金。デジタル商品・サブスクリプションは性質上返品不可。
購入制限      : マイクロフォンはお一人様 3 点まで（ハンドメイドのため）。サブスクリプションは制限なし。
解約          : サブスクリプションはマイページからいつでも解約可。次回更新日まで利用可能。日割り返金なし。

注意：屋号を 2026-04-25 に「Curanz Sounds」から「Kuon R&D」へ変更（Stripe 鎮静→確定申告も今後この屋号を継続使用）。
Stripe 設定変更：法人名・ビジネス名・明細書表記すべて Kuon R&D / KUON-RND.COM に統一済み。
特商法ページ `app/legal/tokushoho/page.tsx` も同日に 5 言語すべて新ブランドへ書き換え済み。
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

---

## 28. 音大生・音楽学習者特化プラットフォーム戦略（2026年4月 策定）

### ビジョン

空音開発を「音大生・音楽学習者の学習・練習・録音を一気通貫で支える世界唯一のプラットフォーム」として確立する。
マイク販売、オーディオツール群、学習コンテンツ、SNS コミュニティを統合し、
「空音開発メンバーシップ」というサブスクリプションで収益化する。

### コアコンセプト

「音大生だった朝比奈幸太郎が、音大生のために作った」

- P-86S マイクは「音大生が買える価格で、プロ品質の録音を」
- アプリ群は「音大生の練習・学習・発表をテクノロジーで支える」
- すべてが同じストーリーから出発し、一貫性がある

### ターゲット

| 優先度 | セグメント | 規模（推定） |
|--------|-----------|-------------|
| ★★★★★ | 日本の音大生・音楽学部生 | 約8,000人/年 |
| ★★★★★ | 海外の音楽院・コンセルバトワール学生 | 数十万人 |
| ★★★★ | 音楽高校生 | 約40校 |
| ★★★★ | 吹奏楽部員（中高） | 約80万人 |
| ★★★ | ピアノ・バイオリン等の個人学習者 | 推定200万人以上（日本） |
| ★★ | アマチュア演奏家・フィールドレコーダー | — |
| ★ | 音響エンジニア（無料ツール経由の流入） | — |

### 二層構造設計

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  【無料・ブラウザ完結層】Cloudflare Pages             │
│   対象: エンジニア + 全ユーザーの入口                 │
│                                                      │
│   NORMALIZE / DECLIPPER / MASTER CHECK / DSD          │
│   CONVERTER / NOISE REDUCTION / DUAL MONO / REVOX     │
│   PIANO DECLIPPER / KUON PLAYER / RESAMPLER           │
│                                                      │
│   → SEO で世界中から集客                              │
│   → 空音開発の技術力の証明                            │
│   → エンジニアが音大生に薦める導線                    │
│   → サーバー処理アプリは月3回まで無料                 │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  【サブスク層】Azure App Service B2〜B3               │
│   対象: 音大生・音楽学習者                            │
│   価格: 一般 ¥980/月、学割 ¥480/月、海外 $7/月       │
│                                                      │
│   サーバー処理アプリ（無制限）:                        │
│   ├── KUON SEPARATOR   — 音源分離（Demucs / Meta）   │
│   ├── KUON SUBTITLE    — 多言語字幕生成（Whisper）    │
│   ├── KUON KARAOKE     — 自動カラオケ生成            │
│   ├── KUON HARMONY     — 和声自動分析（music21）     │
│   ├── KUON TRANSCRIPT  — レッスン書き起こし          │
│   ├── KUON TUNER PRO   — 高精度ピッチ解析           │
│   ├── KUON PRACTICE    — 楽器別練習トラック          │
│   ├── KUON EXERCISE    — 音楽理論クイズ自動生成      │
│   └── （随時追加）                                    │
│                                                      │
│   学習データ蓄積:                                     │
│   ├── 練習ログ（ピッチ精度の推移・練習時間）         │
│   ├── レッスンノートアーカイブ                       │
│   ├── 和声課題の正答率推移                           │
│   └── 成長曲線の可視化                               │
│                                                      │
│   SNS / コミュニティ機能:                             │
│   ├── 練習日記の投稿・共有                           │
│   ├── 録音への「いいね」「コメント」                  │
│   ├── フォロー機能（楽器別・学校別）                  │
│   ├── 週間練習ランキング                             │
│   ├── 共演・セッション相手の発掘                     │
│   └── 先生 → 生徒のフィードバック機能                │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  【ハードウェア層】マイク販売                         │
│   P-86S ¥16,900 / X-86S ¥39,600                     │
│   海外: P-86S $99 / X-86S $279                       │
│                                                      │
│   → サブスク会員に自然に訴求                         │
│   → 購入者はサブスク3ヶ月無料特典                    │
│   → ギャラリー投稿でコミュニティ強化                 │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  【コミュニティ層】空音開発メンバーシップ特典         │
│   ├── 月1回 朝比奈幸太郎オンラインクリニック         │
│   ├── 会員限定アーカイブ（過去のクリニック動画）     │
│   ├── 会員専用ギャラリー優先掲載                     │
│   └── マスタリング処理の優先対応                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 技術基盤

| レイヤー | 技術 | 月額コスト |
|---------|------|-----------|
| フロントエンド | Next.js + Cloudflare Pages | ¥0（無料枠） |
| サーバー処理 | Azure App Service B2〜B3 (Python) | ¥8,000〜¥15,000 |
| 音源分離 | Demucs v4（Meta、MIT ライセンス） | ¥0（OSS） |
| 音声書き起こし | Whisper（OpenAI、MIT ライセンス） | ¥0（OSS） |
| 翻訳 | Argos Translate（MIT ライセンス） | ¥0（OSS） |
| 音楽理論 | music21（MIT / BSD、MIT 開発） | ¥0（OSS） |
| 決済 | Stripe（既存アカウント） | 3.6% 手数料のみ |
| 音声配信 | Cloudflare Workers + R2 | ¥0〜微小 |

Azure App Service B2 の1プランに複数アプリを同居可能。
サーバー処理が必要なアプリは全て1プラン内でデプロイ。

### 主要 OSS ライブラリ

| ライブラリ | 開発元 | 用途 | ライセンス |
|-----------|--------|------|-----------|
| Demucs v4 | Meta AI Research | 音源分離（vocals/drums/bass/other） | MIT |
| Whisper | OpenAI | 音声→テキスト書き起こし（多言語） | MIT |
| Argos Translate | Libre Translate | オフライン機械翻訳 | MIT |
| music21 | MIT | 和声分析・楽譜解析・対位法チェック | BSD/MIT |
| librosa | — | ピッチ検出・テンポ解析・スペクトル | ISC |
| pyannote-audio | CNRS | 話者分離（レッスン書き起こし用） | MIT |
| noisereduce | — | スペクトルゲーティング・ノイズ除去 | MIT |

### 収益モデル

```
収益源①: サブスクリプション（空音開発メンバーシップ）
  一般: ¥980/月（年払い ¥9,800 = 2ヶ月無料）
  学割: ¥480/月（年払い ¥4,800）
  海外: $7/月（年払い $70）

収益源②: マイク販売（サブスク会員からの転換を含む）
  国内: P-86S ¥16,900 / X-86S ¥39,600
  海外: P-86S $99 / X-86S $279

収益源③: アフィリエイト（Kotaro Studio 既存）
  月 ¥30,000（維持のみ・追加施策なし）

収益源④（将来）: 学習コンテンツ・認定制度
  録音技術講座、和声学ドリル、音大受験対策
  空音開発認定バッジ
```

### 収益予測（24ヶ月後）

| シナリオ | 会員数 | サブスク | マイク | 合計月収 |
|---------|-------|---------|-------|---------|
| 堅実（YouTube+SEOのみ） | 150人 | ¥107,000 | ¥180,600 | 約¥300,000 |
| 中間（SNS+音大3〜5校浸透） | 400人 | ¥267,000 | ¥367,000 | 約¥620,000 |
| 楽観（SNSバイラル+海外展開） | 1,000人 | ¥744,000 | ¥579,750 | 約¥1,280,000 |

### ロードマップ

Phase 1（今〜1ヶ月）: 基盤構築
  - Azure B2 契約
  - KUON SEPARATOR（Demucs）デプロイ
  - KUON SUBTITLE（Whisper + Argos Translate）デプロイ
  - ユーザー認証基盤設計（メール+パスワード）
  - 無料月3回 / サブスク無制限の制限ロジック実装

Phase 2（2〜3ヶ月）: 習慣化アプリ追加
  - KUON HARMONY（music21）デプロイ
  - KUON TUNER PRO デプロイ
  - マイページ + 練習ログ機能
  - Stripe サブスク決済実装

Phase 3（4〜6ヶ月）: コミュニティ層
  - SNS 機能（練習日記・いいね・フォロー）
  - 月1回オンラインクリニック開始
  - 会員限定アーカイブ
  - KUON KARAOKE / PRACTICE 追加
  - YouTube「音大生のためのオーディオツール群」シリーズ開始

Phase 4（7〜12ヶ月）: フライホイール
  - サブスク会員 → マイク購入導線の最適化
  - マイク購入者 → サブスク3ヶ月無料特典
  - 音大への直接営業（同期・先輩ネットワーク活用）
  - 海外音楽院への展開（アルゼンチン・ドイツの友人経由）
  - 会員の録音をギャラリーに掲載 → SEO + 社会的証明

Phase 5（13〜24ヶ月）: コンテンツ + 認定
  - 朝比奈幸太郎の録音講座（動画コンテンツ）
  - 和声学ドリル（EXERCISE 連携）
  - ゲスト講師の特別レッスン
  - 空音開発認定バッジ制度
  - 音大受験対策コンテンツ

### オーナーの戦略的資産

- 音大卒業の同期・先輩に教授・講師が多数（直接営業チャネル）
- アルゼンチン・ドイツに音楽家の友人ネットワーク（海外展開の種）
- 金田式DC録音の技術（他にない独自技術）
- 録音サービス（タイムマシンレコード）との連携可能性
- Revox レストア事業との間接的つながり（オーディオ愛好家層）
- GPS/RTK 技術（将来のスキルベースとして保持）

### データ掌握戦略

会員が空音開発を使い続けることで蓄積されるデータ:
- 練習ログ（時間・頻度・ピッチ精度の推移）
- レッスンノート（書き起こしアーカイブ）
- 和声課題の回答履歴・正答率
- 分離・変換の処理履歴（30日間保持）
- 成長曲線（入学時→卒業時の客観的記録）

このデータは他のどのアプリにも移行できない。
4年間の練習記録と成長曲線は学生にとっての資産であり、
空音開発にとっての最強のロックインとなる。

### ブランド名について

「空音開発」は音大生にとって本質的な言葉（空間＋音響）。
英語圏では「Kuon R&D」で、Roland / KORG / TASCAM と同じ文脈に置かれる。
日本発の音響ブランドは世界的に信頼されており、むしろ有利。

### 将来展開

- 学習コンテンツの体系化（録音技術・音楽理論・音響学）
- 認定・資格制度（空音開発録音技術認定）
- 音大との公式提携（教育機関向けプラン）
- 共演・セッションマッチング（SNS 機能の発展形）
- 人材発掘プラットフォーム（演奏家と録音エンジニアのマッチング）

---

## 29. 【最重要】無料/有料アプリの課金戦略（2026年4月19日 確定）

> このセクションはプラットフォーム全体の収益設計の根幹であり、
> 全ての開発判断においてこの方針を最優先とする。

### 基本原則：コストゼロのものに制限をかけない

ブラウザ完結型アプリ（NORMALIZE、DECLIPPER、MASTER CHECK、DSD CONVERTER、RESAMPLER、
NOISE REDUCTION、DUAL MONO、PIANO DECLIPPER、KUON PLAYER、CONVERTER、ANALYZER 等）は、
Cloudflare Pages で配信しており、ユーザーのブラウザ内で処理が完結する。
100万人が使ってもサーバーコストは増えない。

**コストがゼロのものに使用制限をかけると、得るものがなく失うものだけが大きい。**
月2回の壁でユーザーが離脱し、二度と戻ってこない。

### 確定した課金モデル

| 層 | アプリ種別 | コスト | 制限 | 根拠 |
|---|---|---|---|---|
| ブラウザアプリ | NORMALIZE, DECLIPPER 等 | ¥0 | **無制限** | コストゼロ＝制限する理由がない |
| サーバーアプリ（無料会員） | SEPARATOR, SUBTITLE 等 | 実コストあり | **初月無制限 → 月3回** | 習慣化させてから制限 |
| サーバーアプリ（サブスク） | 同上 | 実コストあり | **無制限** | ¥980/月で十分ペイ |
| P-86S 購入者 | 全て | — | **サブスク3ヶ月無料** | フライホイール |

### 戦略的根拠

1. **ブラウザアプリは集客エンジン**
   - SEO で世界中から人が来る
   - 「こんな高品質なツールが無料？」という驚きがブランド信頼になる
   - 登録不要でも使えるが、ログインすると設定保存・処理履歴が見られる → 自然な登録誘導

2. **サーバーアプリは「初月無制限 → 月3回」が最適**
   - 「月2回」では体験として不十分。「月3回」が習慣化の閾値
   - 初月無制限で「これがないと困る」状態を作ってから制限する
   - 一度も使ったことがないものにお金を払う人はいない

3. **P-86S 購入者 → サブスク3ヶ月無料**
   - マイク購入者は最もロイヤリティが高い層
   - 3ヶ月あれば確実に習慣化 → 解約率低下
   - これが §28 のフライホイールの起点

4. **使用回数カウントの基盤は既に構築済み**
   - Auth Worker の `POST /api/auth/track` で月別カウント可能
   - サーバーアプリ実装時に制限ロジックを入れるのが最も効率的
   - ブラウザアプリには制限ロジックを入れない

### Canva / Figma モデルとの類似性

この構造は Canva や Figma と同じ。ブラウザで動くものは無料で開放してユーザーベースを
最大化し、サーバーリソースを消費するプレミアム機能で課金する。
空音開発の場合、サーバーリソースとは GPU/CPU による音声処理（Demucs, Whisper 等）。

### 絶対にやってはいけないこと

- NG: ブラウザ完結アプリに使用回数制限をかける
- NG: ログインしないとブラウザアプリが使えなくする
- NG: 無料体験を「月1回」にする（体験として不十分）
- NG: P-86S 購入者にサブスク特典を付与しない

---

## 30. オーナー管理ダッシュボード（実装済み）

### 概要

- ページ: `kuon-rnd.com/admin`
- アクセス権限: オーナー（369@kotaroasahina.com）のみ
- データソース: Auth Worker の管理API（`/api/auth/admin/users`）

### 機能

- 登録ユーザー一覧（ページネーション付き）
- ユーザー検索（名前・メールアドレス）
- 統計情報（総ユーザー数・プラン別内訳・新規登録数）
- ユーザー詳細（プロフィール・利用状況）
- プラン変更（free / student / pro / max / enterprise の 5 段階）

### 関連ファイル

| ファイル | 役割 |
|---------|------|
| `app/admin/page.tsx` | ダッシュボードUI |
| `app/api/auth/admin/route.ts` | 管理API プロキシ |
| `kuon-rnd-auth-worker/src/index.ts` | GET `/api/auth/admin/users` + PUT `/api/auth/admin/plan` |

### セキュリティ

- JWT 検証 + メールアドレスが `369@kotaroasahina.com` であることを確認
- 一般ユーザーがアクセスしても 403 Forbidden

---

## 31. ライブスケジュール / イベントマップ機能（実装済み）

### 概要

Pro 会員が音楽ライブ・コンサート・イベントの情報を投稿し、
Leaflet.js + OpenStreetMap の世界地図上にピン表示する機能。
旅行中でもコンサートを探せる。Airbnb ライクな UI。

### 全体フロー

```
Pro ユーザーがマイページでイベント情報を入力
  │ （タイトル、日付、時間、会場、座標、価格、ジャンル、出演者）
  ▼
/api/auth/events（POST）→ Auth Worker
  │ → KV に保存（event:{id}, events-date:{日付}, events-user:{email}）
  │ → 会場 DB に自動蓄積（venue:{名前}）
  ▼
/events（公開ページ・ログイン不要）
  │ → Leaflet.js で世界地図表示
  │ → 日付範囲・ジャンル・タイプでフィルター
  │ → ピンクリックで詳細ポップアップ
  ▼
/events/{id}（個別イベントページ）
  │ → OGP 対応（SNS シェア時にカード表示）
  │ → 「気になる」ボタン（ログインユーザーのみ）
  │ → iCal エクスポート（.ics ダウンロード）
  │ → ミニマップ + Google Maps リンク
  │ → 出演者プロフィールリンク（Kuon ユーザーの場合）
```

### データ構造

```typescript
interface EventData {
  id: string;               // 16桁 hex
  creatorEmail: string;
  title: string;
  description: string;
  date: string;             // "YYYY-MM-DD"
  startTime: string;        // "HH:MM"
  endTime: string;
  venueName: string;
  venueAddress: string;
  lat: number; lng: number;
  price: string;            // "¥3,000", "Free", "$20"
  eventType: string;        // concert | recital | jam-session | workshop | festival | recital-exam | open-mic | other
  genre: string;            // classical | jazz | pop | folk | world | chamber | orchestra | choir | brass-band | other
  performers: EventPerformer[];
  interestedCount: number;
  interestedEmails: string[];
  createdAt: string;
  updatedAt: string;
}

interface VenueData {
  name: string; address: string;
  lat: number; lng: number;
  usageCount: number;       // 自動カウントアップ
  lastUsed: string;
}
```

### KV キー設計（SESSIONS Namespace）

| キーパターン | 内容 | TTL |
|---|---|---|
| `event:{id}` | イベント本体 JSON | 365日 |
| `events-date:{YYYY-MM-DD}` | その日のイベント ID リスト | 365日 |
| `events-user:{email}` | ユーザーのイベント ID リスト | 365日 |
| `venue:{name-slug}` | 会場データ（自動蓄積） | なし |

### Worker エンドポイント（kuon-rnd-auth-worker に追加）

| メソッド | パス | 認証 | 用途 |
|---------|------|------|------|
| POST | `/api/auth/events` | JWT（Pro のみ） | イベント作成 + 会場 DB 自動保存 |
| GET | `/api/auth/events` | なし | 公開イベント一覧（date/range/genre/eventType フィルター） |
| GET | `/api/auth/events/:id` | なし | イベント詳細（出演者情報を enrichment） |
| PUT | `/api/auth/events/:id` | JWT（作成者 or オーナー） | イベント更新 |
| DELETE | `/api/auth/events/:id` | JWT（作成者 or オーナー） | イベント削除 |
| GET | `/api/auth/events/user/me` | JWT | 自分のイベント一覧 |
| POST | `/api/auth/events/:id/interested` | JWT | 「気になる」トグル |
| GET | `/api/auth/venues/search` | なし | 会場サジェスト検索 |

### 関連ファイル

| ファイル | 役割 |
|---------|------|
| `kuon-rnd-auth-worker/src/index.ts` | 全イベント API エンドポイント |
| `app/api/auth/events/route.ts` | GET/POST プロキシ |
| `app/api/auth/events/[id]/route.ts` | GET/PUT/DELETE プロキシ |
| `app/api/auth/events/[id]/layout.tsx` | Edge Runtime（動的ルート） |
| `app/api/auth/events/[id]/interested/route.ts` | POST プロキシ |
| `app/api/auth/events/user/me/route.ts` | GET プロキシ |
| `app/api/auth/venues/search/route.ts` | GET プロキシ |
| `app/events/page.tsx` | 公開地図ページ（Leaflet.js） |
| `app/events/layout.tsx` | SEO メタデータ |
| `app/events/[id]/page.tsx` | 個別イベント詳細ページ |
| `app/events/[id]/layout.tsx` | Edge Runtime + OGP メタデータ |
| `app/mypage/page.tsx` | Pro 向けイベント管理セクション |

### IQ180 追加機能

1. **イベントタイプ分類** — 8種類（コンサート/リサイタル/ジャムセッション/ワークショップ/フェスティバル/発表会/オープンマイク/その他）
2. **ジャンルフィルター** — 10種類（クラシック/ジャズ/ポップス/フォーク/ワールド/室内楽/オーケストラ/合唱/吹奏楽/その他）
3. **「気になる」ボタン** — ログインユーザーがトグル、カウント表示で演奏者に集客の手応えを提供
4. **iCal エクスポート** — ワンクリックで .ics ファイルダウンロード → Google/Apple カレンダーに追加
5. **過去イベントアーカイブ** — 演奏履歴として蓄積（マイページで全イベント表示、過去分は薄く表示）
6. **OGP 対応個別ページ** — `/events/{id}` で SNS シェア時にカード表示
7. **会場 DB 自動蓄積** — 同じ会場名を入力するとサジェスト表示、座標も自動入力
8. **出演者リンク** — Kuon ユーザーの場合はアバター付きで表示

### 将来実装

- 共演者への通知・メッセージ機能
- 近隣イベント通知（プッシュ通知）
- 繰り返しイベント（毎週のジャムセッション等）
- 会場データベースの管理画面（Admin）

---

## 22. 作業履歴（続き）

### 2026-04-19 セッション（ライブスケジュール / イベントマップ機能）

| カテゴリ | 変更内容 |
|---|---|
| Auth Worker 拡張 | `kuon-rnd-auth-worker/src/index.ts` に EventData/VenueData 型定義、イベント CRUD（POST/GET/PUT/DELETE）、「気になる」トグル、ユーザーイベント一覧、会場サジェスト検索の全 8 エンドポイント追加。KV インデックス設計（event:{id}, events-date:{日付}, events-user:{email}, venue:{slug}）。Pro プラン制限。 |
| API プロキシ | `app/api/auth/events/` 配下に 5 ファイル新規作成（route.ts, [id]/route.ts, [id]/layout.tsx, [id]/interested/route.ts, user/me/route.ts）。`app/api/auth/venues/search/route.ts` 新規作成。全て `runtime = 'edge'`。 |
| イベントマップ | `app/events/page.tsx` 新規作成。Leaflet.js + OpenStreetMap タイル。日付ナビゲーション、日付範囲選択（1/7/14/30日）、イベントタイプ・ジャンルフィルター、地図/リスト表示切替。ピンクリックでポップアップ（タイトル・日時・会場・出演者・「気になる」数）。`app/events/layout.tsx` SEO。 |
| 個別イベントページ | `app/events/[id]/page.tsx` 新規作成。OGP 対応。「気になる」ボタン、iCal ダウンロード、ミニマップ、Google Maps リンク、出演者カード（アバター付き）、X シェア、URL コピー。`app/events/[id]/layout.tsx` Edge Runtime。 |
| マイページ拡張 | `app/mypage/page.tsx` に Pro 限定イベント管理セクション追加。投稿フォーム（タイトル・日付・時間・タイプ・ジャンル・会場名+住所+緯度経度・価格・説明・出演者複数入力）。会場サジェスト機能。マイイベント一覧（過去分は薄く表示）。編集・削除 UI。 |
| CLAUDE.md | §31 ライブスケジュール/イベントマップ機能の全仕様追加。作業履歴更新。 |

### 2026-04-21 セッション（Google OAuth + 技術記事 + シェア機能 + フロントLP完全リデザイン）

| カテゴリ | 変更内容 |
|---|---|
| Google OAuth | `app/auth/login/page.tsx` にプレースホルダだった Client ID を本物に差し替え（`342028960302-rmcnf6238nuucuccps033nibik1qigaf.apps.googleusercontent.com`）。Google Cloud Console で OAuth アプリを本番公開済み（「対象」→「本番環境」に切替）。基本スコープ（email/profile）のため100人制限は適用されず実質無制限。 |
| How it works: DSD | `app/how-it-works/dsd/page.tsx`（1289行）+ `layout.tsx` 新規作成。世界初ブラウザDSDプレーヤーの技術解説記事。シグマデルタ変調、DSF/DFFバイナリ、Rust Wasm エンジン、バイトLUT最適化、Blackman-sinc FIRデシメーションフィルタ（数式付き）、8MBチャンクストリーミング、WAVエクスポート、ベンチマーク。ACCENT=#7C3AED（紫）。SEO 18キーワード。 |
| How it works: DDP | `app/how-it-works/ddp/page.tsx`（948行）+ `layout.tsx` 新規作成。DDPバイナリパース技術解説。DDPID/DDPMS/PQパケット構造、バイトレベル図、トラック構築アルゴリズム、Gap Listen機能、プライバシーモデル。ACCENT=#0284c7。 |
| DDP シェア機能 | `app/ddp-checker/page.tsx` に Canvas API によるサマリーカード生成（1200×630px PNG）追加。トラック表・Red Book Compliant バッジ・「Verified by KUON R&D」ウォーターマーク・日付スタンプ。保存ボタン + X シェアボタン。Technical Specs セクション（6項目）。IQ180シェアナッジ。`/how-it-works/ddp` リンク。表示レイヤーのみ変更、音声処理ロジック不変。 |
| DSD シェア機能 | `app/dsd/page.tsx` に変換完了後の技術詳細表示（Input Format, DSD Type, Output, Engine, Filter）追加。X シェアボタン、シェアナッジ、`/how-it-works/dsd` リンク。表示レイヤーのみ変更。 |
| フロントLP リデザイン | `app/page.tsx` を全面書き換え（1147行→約500行）。11セクション構成: Hero, Trust Bar, WHO IS THIS FOR（4ペルソナカード）, App Showcase（8アプリ→LP導線）, Microphone（P-86S/X-86S）, Discover, Pricing（3tier）, FAQ（6問アコーディオン）, Founder（ビジョン引用＋美しいボタン）, Final CTA, Contact（Formspree維持）。5言語対応。IQ180心理設計。 |
| フロントLP 修正 | NORMALIZE に「マイク購入者限定」ゴールドバッジ追加。全アプリカードをLP页にリンク。FAQ将来対応化（「すべて無料」→「多くは無料＋一部サブスク」）。発送範囲を「国際郵便が届くすべての国・地域」に。Trust Bar「35+カ国」→「🌐世界中に発送」。Pricing小見出し将来対応化。Free tier CTA「登録なしで今すぐ使う」。 |
| 創業者セクション | blockquote でビジョン引用（世界の音楽文化発展・音楽家の創造性・エンジニアの表現・国境を越えた繋がり・芸術の発展）。プロフィールリンクを pill 型美ボタンに。肩書に「音楽プロデューサー」追加。 |
| フッター修正 | `app/footer.tsx` の「について」→「私たちについて」に修正（自然な日本語化）。 |
| 型チェック | 全変更に対して `npx tsc --noEmit --strict` 通過確認済み。DSD記事の `useLang()` 分割代入バグ（65件 TS2345）を修正。 |

---

## 32. Google Cloud Platform（GCP）活用計画

### 背景

Google OAuth 実装のために Google Cloud Console でプロジェクトを作成した（2026-04-21）。
$300 の無料クレジット（90日間）が付与されており、これを活用してサブスク用サーバーアプリを開発予定。

### GCP プロジェクト情報

| 項目 | 内容 |
|------|------|
| プロジェクト | kuon-rnd（Google Cloud Console） |
| OAuth Client ID | `342028960302-rmcnf6238nuucuccps033nibik1qigaf.apps.googleusercontent.com` |
| OAuth ステータス | 本番公開済み（基本スコープのみ・ユーザー数無制限） |
| 無料クレジット | $300（90日間・2026年7月頃まで） |

### GCP vs Azure 比較（オーナー確認済み）

| 観点 | GCP | Azure |
|------|-----|-------|
| 無料枠 | $300/90日 → Cloud Run 月200万リクエスト | B2プラン ¥8,000〜15,000/月 |
| コンテナ | Cloud Run（自動スケール・リクエスト時のみ課金） | App Service（常時起動） |
| GPU | NVIDIA T4（$0.35/h）, A100 利用可能 | NCasT4_v3（$0.526/h） |
| AI/ML | Vertex AI, Cloud TPU, Gemini API | Azure OpenAI, Azure ML |
| 音声系 | Speech-to-Text, Text-to-Speech | Azure Speech |
| 翻訳 | Cloud Translation（月50万文字無料） | Azure Translator（月200万文字無料） |
| ストレージ | Cloud Storage（5GB無料） | Blob Storage |

### 方針決定

**Cloud Run をメインに採用**。理由：
1. リクエスト時のみ課金 → 初期ユーザー少数でもコスト最小
2. 月200万リクエスト無料枠あり
3. Docker コンテナなので Azure への移行も容易
4. $300 クレジットで約3ヶ月の実験が可能

### GCP で開発予定のサブスクアプリ（5本）

| # | アプリ名 | 技術 | 用途 | 優先度 |
|---|---------|------|------|--------|
| 1 | KUON SEPARATOR | Demucs v4 (Meta) + Cloud Run | ボーカル/ドラム/ベース/楽器分離 | ★★★★★ |
| 2 | KUON SUBTITLE | Whisper + Cloud Translation | 音声書き起こし + 多言語字幕生成 | ★★★★★ |
| 3 | KUON HARMONY | music21 + Cloud Run | 和声自動分析 | ★★★★ |
| 4 | KUON KARAOKE | Demucs + ピッチシフト | 自動カラオケ生成 | ★★★ |
| 5 | KUON TRANSCRIPT | Whisper + pyannote | レッスン書き起こし（話者分離） | ★★★ |

### 課金制御フロー（§29 準拠）

```
ユーザーがサーバーアプリにアクセス
  │
  ├── ログインなし → 初回は無料で体験（制限付き）
  │
  ├── 無料会員 → 初月無制限 → 月3回
  │
  ├── Student (¥480/月) → 無制限
  │
  └── Pro (¥980/月) → 無制限 + 優先処理
```

Auth Worker の `POST /api/auth/track` で月別カウントを管理。

---

## 33. 認証システム詳細（実装済み）

### 認証方式

| 方式 | 状態 | 概要 |
|------|------|------|
| マジックリンク | 実装済み | メールアドレス入力 → Resend 経由でログインリンク送信 → クリックで JWT 発行 |
| Google OAuth | 実装済み | Google Identity Services (GIS) → credential トークン → Auth Worker で検証 → JWT 発行 |

### Google OAuth フロー

```
ブラウザ（/auth/login）
  │ Google One Tap / Sign-In ボタンクリック
  ▼
Google Identity Services
  │ credential（JWT）トークン発行
  ▼
/api/auth/google（Next.js API Route プロキシ）
  │
  ▼
kuon-rnd-auth-worker POST /api/auth/google
  │ ① credential を Google の公開鍵で検証
  │ ② email, name, picture を抽出
  │ ③ KV にユーザー作成 or 既存ユーザー更新
  │ ④ JWT 発行（HS256, 30日有効）
  ▼
ブラウザ
  │ localStorage に kuon_user を保存
  │ /mypage にリダイレクト
```

### 関連ファイル

| ファイル | 役割 |
|---------|------|
| `app/auth/login/page.tsx` | ログインページ（マジックリンク + Google ボタン） |
| `app/auth/verify/page.tsx` | マジックリンク検証ページ |
| `app/auth/confirm-email/page.tsx` | メールアドレス変更確認ページ |
| `kuon-rnd-auth-worker/src/index.ts` | POST `/api/auth/google` エンドポイント |

### 注意事項

- Google Client ID はフロントエンドに公開しても安全（公開鍵のみ）
- Client Secret は不要（GIS の credential フローでは使用しない）
- OAuth consent screen は本番公開済み（基本スコープ = 無制限ユーザー）
- sensitive/restricted スコープを追加する場合は Google の審査が必要

---

## 34. How it works 技術記事システム（実装済み）

### 概要

アプリの技術的な仕組みを解説する記事ページ。SEO 効果 + 技術力の証明 + シェアコンテンツとして機能。

### 記事一覧

| 記事 | パス | 行数 | テーマカラー |
|------|------|------|------------|
| DSD プレーヤー解説 | `/how-it-works/dsd` | 1289行 | #7C3AED（紫） |
| DDP チェッカー解説 | `/how-it-works/ddp` | 948行 | #0284c7（青） |

### DSD 記事の内容

1. DSD とは何か（シグマデルタ変調の原理）
2. なぜブラウザで再生が困難だったか
3. DSF / DFF バイナリフォーマットの構造（バイトレベル図解）
4. Rust Wasm エンジンの設計
5. バイトレベル LUT 最適化
6. Blackman 窓 sinc FIR ローパスフィルタ（数式付き）
7. 8MB チャンクストリーミング処理
8. WAV エクスポート
9. ベンチマーク結果

### DDP 記事の内容

1. DDP とは何か（CD マスタリングの最終形態）
2. DDPID / DDPMS / PQ パケットの構造
3. バイナリパースのアルゴリズム
4. トラック構築ロジック
5. Gap Listen 機能の仕組み
6. ブラウザ完結のプライバシーモデル

### IQ180 シェア設計

DSD/DDP のような専門ツールのユーザーは「プロフェッショナルとしての誇り」を持つ。
中断（15秒ゲート等）は拒絶されるため、以下の方式を採用:

1. **シェアアーティファクト** — DDP サマリーカード（Canvas API, 1200×630px PNG）をダウンロード・X シェア可能に
2. **技術記事リンク** — 「How this works →」の小さなリンクでSEO＋シェアを促進
3. **ナッジテキスト** — 「まだ知らない人がいます」等、知識伝播欲求に訴えるメッセージ
4. **変換後の技術詳細** — DSD 変換完了後に入力フォーマット・エンジン・フィルタ情報を表示

---

## 35. 登録ナッジ設計方針（Canva モデル）

### 基本原則

ブラウザ完結アプリは **ログインなしで制限なく使える**（§29 準拠）。
登録促進は「機能制限」ではなく「付加価値の訴求」で行う。

### 正しい挙動

```
ユーザーがアプリを開く → すぐに使える（制限なし）
  ↓
処理完了後、ソフトナッジを表示:
  「無料登録すると、設定の保存・処理履歴の確認ができます」
  「成長グラフで上達を可視化しませんか？」
```

### やってはいけないこと

- NG: アプリ画面をブロックする全画面モーダル
- NG: 「登録しないと使えません」のメッセージ
- NG: 使用回数制限（ブラウザ完結アプリの場合）
- NG: 処理途中での中断

### RegistrationNudge の6つの訴求タイプ

| タイプ | 訴求内容 | 表示タイミング |
|--------|---------|-------------|
| download | 結果のダウンロード保存 | 処理完了後 |
| history | 処理履歴の確認 | 2回目以降の使用時 |
| presets | 設定のプリセット保存 | 設定変更時 |
| advanced | 高度な機能へのアクセス | 特定機能使用時 |
| share | 結果のシェア機能 | 処理完了後 |
| general | 一般的な登録メリット | ページ下部 |

### NORMALIZE の特殊扱い

NORMALIZE アプリはマイク購入者限定特典。
フロント LP では「マイク購入者限定」ゴールドバッジで表示。
パスワード「kuon」で認証（§21 参照）。

---

## 36. フロントページ LP 設計仕様（2026-04-21 確定版）

### ページ構成（11セクション）

| # | セクション | 目的 | 心理設計 |
|---|-----------|------|---------|
| 1 | HERO | 第一印象・感情フック | 3秒以内に「音楽家のための場所」と認識させる |
| 2 | TRUST BAR | 信頼の裏付け | 数字で安心感を提供（15+ツール / 世界発送 / 5言語 / ブラウザ完結） |
| 3 | WHO IS THIS FOR | 自己同一化 | 4ペルソナ（演奏家・音大生・エンジニア・ファン）で「自分の場所だ」と感じさせる |
| 4 | APP SHOWCASE | 価値の証明 | 8アプリをグリッド表示。全カードからLP页へ導線 |
| 5 | MICROPHONE | ハード×ソフト訴求 | 「ソフトウェアだけじゃない」で二刀流ブランドを印象付け |
| 6 | DISCOVER | 探索欲求 | 地球音マップ + ライブ情報で「こんなこともできるのか」 |
| 7 | PRICING | 決断促進 | 「まずは無料で」→ アップセル自然導線 |
| 8 | FAQ | 不安解消 | 将来のPro限定アプリにも矛盾しない表現 |
| 9 | FOUNDER | 共感と信頼 | ビジョン引用 + 音大生だった原点ストーリー |
| 10 | FINAL CTA | 最後の一押し | 「音楽の、いちばん近くに。」 |
| 11 | CONTACT | 接点確保 | Formspree フォーム（https://formspree.io/f/xyknanzy） |

### アプリ一覧（LPリンク対応表）

| フロントLP表示名 | リンク先 | バッジ |
|----------------|---------|-------|
| MASTER CHECK | /master-check-lp | — |
| DSD CONVERTER | /dsd-lp | — |
| DDP CHECKER | /ddp-checker-lp | — |
| NORMALIZE | /normalize-lp | マイク購入者限定（ゴールド） |
| NOISE REDUCTION | /noise-reduction | — |
| EAR TRAINING | /ear-training-lp | — |
| METRONOME | /metronome-lp | — |
| CHORD QUIZ | /chord-quiz-lp | — |

### 言語対応

L5 型（`Partial<Record<Lang, string>> & { en: string }`）で5言語対応:
ja / en / es / ko / pt

### FAQ の将来対応方針

- 「すべて無料ですか？」とは聞かない → 「無料で使えるアプリはありますか？」
- 回答: 「多くのブラウザアプリは無料」+「一部プレミアム機能はサブスク」
- Pro 限定アプリが追加されても LP を書き換える必要なし

### マイク発送範囲

- 「35カ国以上に発送実績」→「国際郵便が届くすべての国・地域に発送可能」
- EMS / 国際小包で安全配送
- Trust Bar: 「🌐 世界中に発送」

---

## 14. 実装ステータス（2026-04-21 更新）

> ※ §14 を最新状態に更新（上書きではなく追加分のみ記載）

### 新規追加ページ（2026-04-21）

| ページ | パス | 状態 |
|--------|------|------|
| How it works: DSD | /how-it-works/dsd | 完成・本番稼働中 |
| How it works: DDP | /how-it-works/ddp | 完成・本番稼働中 |
| Google OAuth ログイン | /auth/login（Google ボタン） | 完成・本番稼働中 |
| フロント LP | / | 全面リデザイン完了・本番稼働中 |

### 更新ページ（2026-04-21）

| ページ | パス | 変更内容 |
|--------|------|---------|
| DDP Checker | /ddp-checker | サマリーカード生成・X シェア・技術記事リンク・IQ180ナッジ追加 |
| DSD Converter | /dsd | 変換後技術詳細・X シェア・技術記事リンク追加 |
| フッター | footer.tsx | 「について」→「私たちについて」 |

---

## 22. 作業履歴（続き）

### 未完了タスク（次回セッション向け）

1. **RegistrationNudge 挙動確認** — 全画面ブロッキングモーダルが表示されている可能性あり。§29/§35 に準拠するソフトナッジに修正が必要
2. **UPLOAD_SECRET の登録** — kuon-rnd-audio-worker にまだ未登録（§22 前回の未完了タスク参照）
3. **kuon-rnd-audio-worker の再デプロイ** — アップロードエンドポイント追加分
4. **GCP Cloud Run 環境構築** — KUON SEPARATOR（Demucs）を最初のサーバーアプリとしてデプロイ
5. **Stripe サブスク決済実装** — Student ¥480/月・Pro ¥980/月のサブスクリプション
6. **DSD コンバーター Wasm リビルド** — Mac で `wasm-pack build --target web --release`
7. **Auth Worker に Google OAuth エンドポイント追加のデプロイ** — `cd kuon-rnd-auth-worker && npx wrangler deploy`
8. **SIGHT READING アプリ全面リライト** — ドイツ語音名軸 + 3記譜法システム（作業中断中）

---

## 37. 個人向けプロ志向プラットフォーム戦略（2026-04-22 改訂版）

> このセクションは §28 および §29 の一部を**上書き**する。
> 具体的には §28 の収益モデル（マイク ¥8M/月の前提）および §28 の
> 「教育機関向けサブセグメント」部分は本セクションの方針を優先とする。
> §29 の課金設計は引き続き有効。

### 37.1 戦略の核心

空音開発は「音大に代わるプロ志向個人のプラットフォーム」として位置づける。
音大を否定する言説は**一切行わない**。代わりに、Kuon で育った個人の
実績が積み上がり、市場が自ら「音大に行かなくてもプロになれる」と結論を
出す構造を作る。これが沈黙の勝利戦略。

### 37.2 確定した制約（2026-04-22）

- **マイク販売は収益構造から除外**：マイク事業は縮小方向。ロードマップの
  収益試算にはマイク売上をカウントしない。マイクなしでも月商 ¥18M が
  回る構造を徹底する。
- **コーチングマッチングは実装しない**：オーナーが過去に多数の失敗例を
  見てきているため、サービスとしての本体機能には入れない。
  「講師バッジ」は将来の低優先タスクとして凍結。
- **教育機関 B2B は主軸にしない**：§28 で構想した B2B 営業中心の
  ロードマップは撤回。個人 C2C 主軸で再設計する。個人教室プランは
  インバウンド受付の副次収益として残す（営業工数は使わない）。
- **音大不要論をメッセージに出さない**：ブランドの公式発信で
  音大を批判する表現は使わない。事実の積み上げで市場に判断させる。

### 37.3 6つのターゲットペルソナ

| # | 呼称 | 年齢 | 主動機 | 主プラン | 国内推定母数 |
|---|------|------|-------|---------|------------|
| P1 | 学費制約層 | 16-18 | 音大に行く金はない、でもプロを目指したい | Free→Student | 1万-3万人 |
| P2 | 音大オルタナティブ層 | 18-20 | 受験失敗・代替選択、別の道を作る | Student+Pro | 2千-5千人/年 |
| P3 | 音大併用層 | 18-22 | 学内カリキュラムだけでは足りない | Student | 3千-5千人 |
| P4 | フリーランス音楽家 | 25-50 | ツール統合、発表機会、成長可視化 | Pro / Max | 5万-15万人 |
| P5 | 社会人リスタート層 | 30-60 | もう一度本気で音楽に向き合う | Pro | 50万-200万人（本気層） |
| P6 | 教育意識の高い親 | 30-45（親） | 子供に音大以外の本物の選択肢を | Student（子供）or Family | 数万世帯（本格派） |

国内のみでも潜在母数は控えめに見て 60 万人規模、コア層だけで 10 万人超。
海外（英語・スペイン語・ドイツ語圏）を含めると桁が一つ変わる。
¥18M/月到達に必要な有料ユーザーは合計 2.5 万人程度で、
これはコア層 10 万人に対し 4-5% の浸透率に相当し、達成可能性は高い。

### 37.4 収益モデル（マイク・コーチング・認定制度 無し）

24ヶ月後の中間シナリオ（2026-04-24 改訂）：

| 収益源 | 単価 | 人数/件数 | 月次 |
|-------|------|---------|------|
| 学生プラン Student | ¥480/月 | 18,000 人 | ¥8,640,000 |
| プロプラン Pro | ¥980/月 | 7,500 人 | ¥7,350,000 |
| Max プラン | ¥1,980/月 | 400 人 | ¥792,000 |
| Enterprise プラン | ¥4,980/月 | 50 件 | ¥249,000 |
| 教室プラン（個人教室・インバウンド） | 平均 ¥7,480/月 | 120 教室 | ¥897,600 |
| 単発コンテンツ・マスタークラス販売 | — | — | ¥500,000 |
| **合計 MRR** | | | **¥18,428,600** |

保守的シナリオ（学生 1.2 万、プロ 5 千、Max 250、Enterprise 30、
教室 80）でも MRR 約 ¥13.8M。これを上振れさせるレバーは §40 の
年額 UP-FRONT・初月¥100・リファラル・クォータ到達 UX・一時停止の 5 装置。

### 37.5 認定制度は採用しない（2026-04-24 オーナー決定）

§37.4 初稿にあった「Kuon 認定プラン維持費 ¥1.39M/月」および「認定試験
受験料 ¥4.44M/月」は**収益モデルから完全に除外**。認定制度そのものを
実装しない方針に確定。

代替ロックイン装置：
- 成長ダッシュボード（§38 データ掌握戦略）の長期履歴蓄積
- Student → Pro 移行時のデータ完全引き継ぎ
- 年額 UP-FRONT プラン（§40.1 ①）による解約率低減
- 一時停止機能（§40.1 ⑦）による学期制・留学離脱の回収

なお既存の `/certification` ページ（sitemap + app/page.tsx 内リンク）は
**認定制度を実装しない決定により不整合状態**。後続タスクで削除または
「近日公開予定」の暫定ラベル化が必要。

### 37.6 ロードマップ（個人主軸・マイク/認定 無し・2026-04-24 改訂）

| Phase | 期間 | 主なアクション | MRR 目安 |
|-------|------|--------------|---------|
| 1 | 1-2ヶ月 | **Stripe 決済実装 + 年額プラン + 初月¥100 + クォータ UX + リファラル + 一時停止 を同時ローンチ** | ¥300K |
| 2 | 3-6ヶ月 | SEPARATOR 本番投入、学生プラン獲得加速、YouTube 週次化 | ¥1-2M |
| 3 | 7-12ヶ月 | TRANSCRIBER / INTONATION 追加、Pro 転換強化、教室プランのインバウンド受付開始 | ¥4-6M |
| 4 | 12-18ヶ月 | SCORE FOLLOWER / CHORD ANALYZER、Max プラン層の本格獲得 | ¥10-13M |
| 5 | 18-24ヶ月 | PERFORMANCE COMPARATOR、SEPARATOR CLASSICAL、Enterprise 拡大、Kuon 音楽祭で収益多層化 | ¥18M 到達 |
| 6 | 24ヶ月以降 | 海外展開（英語・スペイン語・ドイツ語 UI） | — |

### 37.7 沈黙の勝利メッセージング

ブランドの公式発信は以下の軸で統一する：
- 「プロを目指す個人のためのプラットフォーム」
- 「成長を可視化する、習慣にする」
- 「世界中の音楽家と繋がる」
- 「Kuon で育った演奏家たちの紹介」

音大を直接批判する表現、他の教育機関を貶める表現は一切使わない。
結果として「音大に行かなくてもプロになれる」という認識が市場に
広がる構造にする。

### 37.8 同期・先輩ネットワークの活かし方（再定位）

コーチングマッチングを実装しないため、§28 で想定した営業チャネル
としての活用は行わない。代わりに以下で活用する：
- コンテンツ制作への協力（音大卒音楽家としての専門性）
- 個人教室を持つ先輩からのインバウンド教室プラン契約
- YouTube コンテンツや記事でのゲスト参加（ブランド信頼の補強）

いずれも営業工数ゼロで回る関係性を維持する。

### 37.9 想定する競合と差別化

- Flat.io / MuseScore：譜面中心、プラットフォーム性弱い
- Auralia / EarMaster：聴音特化、カリキュラム硬直的、英語圏
- YouTube：断片情報、系統立った成長パスなし
- 音楽教室（ヤマハ・カワイ等）：ホビー層中心、プロ志向カリキュラムなし
- 音大：アカデミック、高コスト、時間拘束

Kuon の差別化ポジション：**「プロを目指す個人のための統合プラット
フォーム」**。ツール＋学習＋成長可視化＋コミュニティ＋発表機会を一貫提供。
競合ゼロの空白市場。

### 37.10 次セッションの最優先議題（2026-04-24 更新）

Stripe 決済システムの本番実装（§40 に詳細仕様を定義済み）：
- Student / Pro / Max の 3 プラン × 月額/年額の Price オブジェクト作成
- 初月 ¥100 Coupon（duration=once）
- 使用量トラッキング（Auth Worker KV: `usage:{email}:{YYYY-MM}:{app}`）
- マイページ GUI（プラン状態 + アプリ利用権限 + 使用回数グラフ）
- リファラルコード発行・追跡・報酬付与
- サブスク一時停止機能（Customer Portal or 独自ボタン）
- クォータ 80%/100% 到達時のアップセル UX

---

## 38. サブスクプラン構造とコスト設計（2026-04-22 確定）

> このセクションは §29（無料/有料アプリの課金戦略）および §28（サブスク構造）
> を**具体化・上書き**する。Pro アプリ実装時はこのプラン構造を基準とする。

### 38.1 プラン構造（5階層）

| プラン | 月額 | 年額 | 位置づけ |
|--------|------|------|---------|
| Free | ¥0 | — | ブラウザ完結アプリは無制限。サーバーアプリは最小試用 |
| Student | ¥480 | ¥4,800 | 学習特化。レッスン記録・楽典問題集・聴音ドリル等を使い放題。サーバーアプリは軽量クォータ |
| Pro | ¥980 | ¥9,800 | 標準的なプロ志向個人向け。サーバーアプリに合理的なクォータ |
| Max | ¥1,980 | ¥19,800 | ヘビー個人ユーザー向け。Pro の 1.67 倍クォータ。平均実使用で黒字化 |
| Enterprise | ¥4,980 | ¥49,800 | 業務利用・教室運営・スタジオ・本業での連続利用向け。拡張クォータ + 優先処理 + サポート対応 |

### 38.2 Student プランの「学生証明」問題は解決済み

**結論：学生証明は一切不要。プランの性質設計で完全に回避する。**

設計思想：
- Student プランは Pro プランより**明確に使用量が少ない**（サーバーアプリ）
- Student プランの核は**学習系アプリの使い放題**（レッスン記録、楽典ドリル、聴音問題集、和声課題、成長可視化ダッシュボード）
- Pro レベルの機能・使用量が必要なユーザーは、学生でも Pro を選ぶ
- 「学生でない人が Student を選ぶ」ことは論理的に起こらない（Pro の方が明らかに上位互換なので）

**卒業時の移行特典（ロックイン装置）：**
- Student → Pro 移行時、蓄積した成長記録（練習ログ・レッスンノート・問題集正答率推移・和声課題履歴）を**完全に持ち越せる**
- これが他サービスへの移行を実質不可能にする最強のスイッチングコスト
- 4 年間の練習記録と成長曲線は学生にとっての資産であり、Kuon にとっての最強のロックイン

この設計により、学生証明のための .ac.jp メール確認や学生証アップロードなどのコスト・手間・UX 摩擦が全てゼロになる。IQ180 解。

### 38.3 サーバーアプリ単価コスト（実測ベース）

Google Cloud Run + GPU (NVIDIA L4) または CPU ベースの想定コスト：

**KUON SEPARATOR（Demucs v4 ステム分離）：**
- GPU (L4): 4 分楽曲 1 回 = 約 1 分処理 = **約 ¥5-8 / 回**
- CPU (4 vCPU): 4 分楽曲 1 回 = 約 4-6 分処理 = **約 ¥4-7 / 回**
- 初期ローンチは CPU 版で開始（cold start コスト回避）、MRR が立ったら GPU 昇格

**KUON SUBTITLE（Whisper large-v3 書き起こし）：**
- GPU (L4): 1 時間音声 = 約 2-3 分処理 = **約 ¥5-10 / 時間音声**

**KUON HARMONY（music21 和声分析）：**
- CPU 軽量処理 = **約 ¥1-2 / 回**

### 38.4 プラン別クォータ設計（使用量上限）

**「無制限」という言葉は使わない。** Canva / Figma と同様、合理的な上限を
設けることでコスト予測可能性を担保する。LP 表記は「ほぼ無制限（月 N 回まで）」
のように透明に書く方が信頼を得られる。

| プラン | SEPARATOR | SUBTITLE相当 | HARMONY相当 | 学習系アプリ |
|--------|-----------|-------------|------------|------------|
| Free | 月 3 回 | 月 30 分 | 月 5 回 | フル利用可（ブラウザ完結） |
| Student ¥480 | 月 20 回 | 月 3 時間 | 月 30 回 | 使い放題 |
| Pro ¥980 | 月 150 回 | 月 20 時間 | 月 200 回 | 使い放題 |
| Max ¥1,980 | 月 250 回 | 月 40 時間 | 月 400 回 | 使い放題 |
| Enterprise ¥4,980 | 月 800 回 | 月 150 時間 | 月 1500 回 | 使い放題 + 優先処理 |

**Max プランの設計思想：** Pro の 1.67 倍クォータ。個人の最もヘビーな実使用
（分離 150 回 / 書き起こし 30 時間程度）に余裕をもって対応する設計。
500 回 / 100 時間は個人用途では非現実的な量であり、そこを必要とする
主体は業務利用（スタジオ・教室運営・コンテンツ制作会社）であるため、
Enterprise プランに切り分ける。

**Enterprise プランの対象：**
- 業務としての連続利用（音楽教室の録音書き起こし大量処理など）
- スタジオのリファレンス分析業務
- コンテンツ制作会社・音楽配信事業者
- 研究機関（音楽情報学研究など）
- Max クォータを超える本業ユーザー
- 優先処理キュー・技術サポート対応・利用規約の商用条項適用

**これを超える需要が出てきたら：** pay-as-you-go 追加クレジット、または
Enterprise+ プラン（¥9,800 / 月等）を後付けで設計する。

### 38.5 プラン別採算シミュレーション

**Student ¥480（軽使用想定：分離 10 回 + 書き起こし 1 時間）:**
- コスト: 10×¥7 + 1×¥8 = ¥78
- 売上: ¥480
- **粗利率 84%**

**Pro ¥980（標準使用：分離 50 回 + 書き起こし 5 時間）:**
- コスト: 50×¥7 + 5×¥8 = ¥390
- 売上: ¥980
- **粗利率 60%**

**Pro ¥980（クォータ上限使用：分離 150 回 + 書き起こし 20 時間）:**
- コスト: 150×¥7 + 20×¥8 = ¥1,210
- 売上: ¥980
- **粗利率 -23%（上限まで使うと赤字）**

→ Pro ユーザーのうち恒常的にクォータ上限まで使う層は Max に誘導する設計。

**Max ¥1,980（上限まで使用：分離 250 回 + 書き起こし 40 時間）:**
- コスト: 250×¥7 + 40×¥8 = ¥2,070
- 売上: ¥1,980
- **粗利率 -5%（ワーストケースで微赤字）**

**Max ¥1,980（平均使用：分離 175 回 + 書き起こし 28 時間、上限の 70%）:**
- コスト: 175×¥7 + 28×¥8 = ¥1,449
- 売上: ¥1,980
- **粗利率 27%**

→ Max プランは「心理的に上限を気にせず使いたい」層向け。実使用は
クォータ上限の 60-70% に留まるのが業界標準。平均すれば粗利 20-30% 確保可能。
上限 250 / 40 のフェアユース設計で赤字無限拡大を防ぐ。

**Enterprise ¥4,980（想定使用：分離 600 回 + 書き起こし 120 時間、上限の 75%）:**
- コスト: 600×¥7 + 120×¥8 = ¥5,160
- 売上: ¥4,980
- **粗利率 -4%（業務利用では上限近くまで使われやすい）**

**Enterprise ¥4,980（標準使用：分離 400 回 + 書き起こし 80 時間、上限の 50%）:**
- コスト: 400×¥7 + 80×¥8 = ¥3,440
- 売上: ¥4,980
- **粗利率 31%**

→ Enterprise は金額が大きいため粗利 30% 確保の想定使用水準（50%）に
とどまるユーザー獲得が重要。上限まで使う大口は pay-as-you-go または
個別見積もりの Enterprise+ に案内する。

### 38.6 ヘビーユーザーの推計（業界ベンチマーク）

SaaS 全般の使用量分布ベンチマーク：
- 中央値ユーザー: 基準値 1.0x
- 上位 10%（パワーユーザー）: 中央値の 3-5 倍
- 上位 5%（ヘビーユーザー）: 中央値の 8-15 倍
- 上位 1%（極端なヘビー・要注意層）: 中央値の 30 倍以上

**Kuon の場合、Pro ユーザー 1000 人中:**
- 約 80-120 人（8-12%）が Max 水準の使用量を求める
- 約 30-50 人（3-5%）が Max でも物足りなく感じる（Enterprise 候補）

**Max プラン想定獲得数:**
- Phase 3 末（12 ヶ月）: Pro 約 400 人なら Max 約 30-50 人
- Phase 4 末（18 ヶ月）: Pro 約 1,500 人なら Max 約 120-180 人
- Phase 5 末（24 ヶ月）: Pro 約 3,000 人なら Max 約 240-360 人

**Max プランからの MRR 寄与（24 ヶ月時点）:**
- 300 人 × ¥1,980 = **¥594,000 / 月**
- これは §37.4 の収益モデルへの純粋な上乗せ

### 38.7 クォータ超過時の UX

ユーザーがクォータに達した場合の挙動（重要な心理設計）：

- **突然使えなくする UX は絶対禁止**（体験を破壊する）
- クォータ 80% 到達時点でダッシュボードに「今月あと N 回」と警告表示
- クォータ 100% 到達時は次のいずれかを提示：
  1. 来月までお待ちいただく（無料会員はこれのみ）
  2. プランをアップグレード（Student → Pro → Max）
  3. 追加クレジット購入（¥980 で +50 回パック等、将来実装）

この UX が自然なアップセル動線になる。

### 38.8 段階的ローンチ戦略

全プラン一斉ローンチではなく、段階投入：

**Phase A（最初の 4 週間）**: Free と Pro のみリリース。Max と Student は
その後に投入。Pro の実使用データを見てからクォータ上限の微調整と
Max 設計を確定する。

**Phase B（5-8 週間目）**: Pro のクォータ上限まで使うユーザーが
出始めたら Max プランを追加。「アップグレード動線」が自然に発生する。

**Phase C（9-12 週間目）**: 学習系アプリが揃ってきたら Student プラン
を追加。Student → Pro の移行特典（データ持ち越し）を前面に打ち出す。

### 38.9 GCP $300 無料枠の消費予測

クォータ設計を前提に、90 日間の消費予測：

| 想定獲得 | 単価 | 月次コスト | 3 ヶ月累計 |
|---------|------|-----------|----------|
| Pro 20 人 × 標準使用 ¥390 | | ¥7,800 | ¥23,400 |
| Student 30 人 × 軽使用 ¥100 | | ¥3,000 | ¥9,000 |
| Free 500 人 × 平均 0.5 回/月 × ¥7 | | ¥1,750 | ¥5,250 |
| Cold start / ストレージ等オーバーヘッド | | ¥500 | ¥1,500 |
| **合計** | | **¥13,050 / 月** | **¥39,150（$260）** |

$300 クレジット内に収まる。90 日走り切れる。

### 38.10 必須の予算保護機構

GCP 側で以下を実装前に設定：

- 予算アラート 4 段階: $50 / $100 / $200 / $280（メール通知）
- Auth Worker 側でユーザー別・日次ハード上限（クォータとは別の安全装置）
- グローバル上限: 「今月の全ユーザー合計で Demucs 実行 N 回まで」
- 90 日経過前に MRR が ¥20,000 超えていれば安全圏。超えていなければ
  無料体験条件を一時的に厳格化して延命（例: 初回 3 回 → 初回 1 回）

---

## 39. Pro アプリ選定基準（2026-04-22 確定）

> このセクションは §32 の「GCP で開発予定のサブスクアプリ（5本）」を
> **上書き**する。§32 では SEPARATOR / SUBTITLE / HARMONY / KARAOKE /
> TRANSCRIPT が挙げられていたが、本セクションの選定基準により一部は
> 採用から除外される。

### 39.1 絶対的な選定基準

Kuon が課金対象として実装する Pro アプリは、以下の **2 条件を同時に満たす**
ものに厳選する：

1. **音楽・オーディオに特化したアプリであること**
2. **既存の生成 AI サービス契約では実行できないものであること**

この基準により、ユーザーが「ChatGPT Plus を契約しているからそれで十分」と
判断する余地をなくす。Kuon でしか得られない価値にフォーカスし、
差別化不能な領域には侵入しない。

### 39.2 除外されるアプリ（理由）

§32 で候補に挙げた以下は、選定基準により除外または再検討：

**KUON SUBTITLE（Whisper 書き起こし + 翻訳）**
- **除外理由：** ChatGPT Plus には Whisper が統合されており、短〜中長音声
  なら Code Interpreter で同等処理が可能。Gemini Advanced も音声理解を
  ネイティブサポート。音楽特化の差別化要素も薄い。
- **代替案：** 音楽レッスンに特化した KUON LESSON RECORDER として再設計
  する場合のみ採用（話者分離 + 音楽用語の専門語彙 + タイムスタンプ付き
  レッスンノート生成）。

**KUON TRANSCRIPT（Whisper + pyannote レッスン書き起こし）**
- **部分的採用：** SUBTITLE と統合し、KUON LESSON RECORDER として単一
  プロダクト化。話者分離 + 音楽専門語彙対応で差別化。Otter.ai 等との
  差別化は「音楽教育文脈」に特化することで担保。

**KUON KARAOKE（自動カラオケ生成）**
- **保留：** Moises.ai が既に提供。ChatGPT ではできないが、専門競合が
  存在する。初期ラインナップからは外し、SEPARATOR の派生機能として
  後日実装。

### 39.3 採用される Pro アプリ（優先度順）

以下は「ChatGPT Plus / Claude Pro / Gemini Advanced のいずれの契約でも
実現不可能」かつ「音楽・オーディオ領域に深く特化」した候補：

**Tier 1 — 最優先開発（ローンチ候補）:**

1. **KUON SEPARATOR（Demucs v4 ステム分離）**
   - 差別化度：★★★★★（生成 AI では実行不可能）
   - 競合：LALAL.AI ($15-30/mo), Moises ($4-9/mo)
   - 優位性：日本語 UI、音大生向け価格、成長履歴記録、Kuon エコシステム統合
   - 技術：Demucs v4 htdemucs model、OSS、実装容易
   - 優先度：**★★★★★**（最初の 1 本）

2. **KUON TRANSCRIBER（音源 → MusicXML 楽譜生成）**
   - 差別化度：★★★★★（生成 AI 不可能、競合ほぼ皆無）
   - 競合：AnthemScore (Windows only, $49)、ScoreCloud (limited)
   - 優位性：ブラウザ完結、多言語対応、楽器別最適化
   - 技術：Spotify basic-pitch + music21 で MusicXML 生成 → PDF 出力
   - 用途：耳コピ学習、アレンジ準備、レッスン曲譜読み
   - 優先度：**★★★★★**（2 本目）

3. **KUON INTONATION ANALYZER（セント精度ピッチ分析）**
   - 差別化度：★★★★★（生成 AI 完全不可能）
   - 競合：TonalEnergy Tuner（iOS のみ）、Tonara（限定的）
   - 優位性：成長記録蓄積（§38 データ掌握戦略と直結）、楽器別最適化
   - 技術：CREPE / pyin ピッチ検出 + 純正律 / 平均律分析
   - 用途：弦楽器・管楽器・声楽の音程練習
   - 優先度：**★★★★**（3 本目）

**Tier 2 — 次期開発:**

4. **KUON SCORE FOLLOWER（リアルタイム楽譜追従）**
   - 差別化度：★★★★★（消費者向け製品は世界的に存在しない）
   - 競合：Antescofo（研究ツール、非消費者向け）
   - 優位性：音大生の練習革命、novel consumer experience
   - 技術：HMM ベース音源-楽譜アラインメント
   - 用途：練習中の楽譜追従、ページターン自動化
   - 優先度：★★★★（技術難度高、後期開発）

5. **KUON CHORD ANALYZER（リアルタイム和音検出）**
   - 差別化度：★★★★（部分的に既存、音楽理論文脈の深さで差別化）
   - 競合：ChordAI、Chordify
   - 優位性：音楽理論解説付き、ジャズ対応、音大生向け
   - 技術：madmom / chromagram-based chord detection
   - 用途：ジャズスタンダード耳コピ、和声研究
   - 優先度：★★★

6. **KUON PERFORMANCE COMPARATOR（プロ演奏との比較分析）**
   - 差別化度：★★★★★（生成 AI 不可能、競合皆無）
   - 競合：なし（研究ツールのみ）
   - 優位性：演奏表現の客観的分析、解釈学習
   - 技術：DTW テンポアラインメント + 特徴抽出
   - 用途：プロの録音と自分の演奏をテンポ・ダイナミクス・フレージングで比較
   - 優先度：★★★

**Tier 3 — 統合再設計候補:**

7. **KUON LESSON RECORDER（レッスン書き起こし + 要約）**
   - 差別化度：★★★（Otter.ai との差別化は音楽教育文脈）
   - 競合：Otter.ai, Granola
   - 優位性：話者分離 + 音楽専門語彙 + タイムスタンプ練習メモ
   - 技術：Whisper + pyannote + 音楽用語辞書
   - 用途：個人レッスンの記録・復習
   - 優先度：★★★

**Tier 4 — 将来拡張（ユーザー層が育ってから検討）:**

8. **KUON SEPARATOR CLASSICAL EDITION（クラシック/室内楽向け楽器別分離）**
   - 差別化度：★★★★★（クラシック特化の音源分離は市場に存在しない）
   - 背景：Demucs v4（4-stem: vocals/drums/bass/other）は MUSDB18-HQ でロック/ポップス/ジャズ中心に学習されており、クラシック/タンゴ/室内楽で `drums` ステムが空になり `other` にすべて集約される問題がある
   - 想定技術：
     - Demucs v4 6-stem 版（vocals/drums/bass/guitar/piano/other）を先行導入
     - 将来的にクラシック専用学習モデル（ピアノ/ヴァイオリン/チェロ/木管/金管/弦楽合奏）を Kuon 独自で学習させる選択肢
     - または Spleeter / Open-Unmix の派生モデル、BandIt、MedleyDB 学習モデルの検討
   - 用途：
     - 協奏曲で「ソリストを消して伴奏だけ」練習
     - 室内楽で「自分のパートだけ消す」練習
     - オペラ伴奏で「歌手を消してオケだけ」練習
     - 音大視唱ソルフェージュでパート別練習
   - 実装タイミング：音大生ユーザーが蓄積され（目安：Student プラン 500 人超）、
     かつクラシック/室内楽用途の要望が明確に見え始めたタイミングで着手
   - 優先度：★★★★（ユーザー層が育ってから）

### 39.4 ローンチ順序（推奨）

**Phase 1（1-3 ヶ月）:** KUON SEPARATOR のみ（パイプライン検証 + 収益検証）

**Phase 2（4-6 ヶ月）:** KUON TRANSCRIBER 追加（Kuon でしか得られない価値の象徴）

**Phase 3（7-9 ヶ月）:** KUON INTONATION ANALYZER 追加（Student プランの中核機能）

**Phase 4（10-12 ヶ月）:** KUON SCORE FOLLOWER または CHORD ANALYZER（技術的挑戦）

**Phase 5（13-18 ヶ月）:** PERFORMANCE COMPARATOR、LESSON RECORDER

### 39.5 選定基準違反時の判断

新しいアプリを検討する際、以下の問いに全て YES でなければ採用しない：

1. このアプリは音楽または音響に特化しているか？
2. ChatGPT Plus / Claude Pro / Gemini Advanced の契約では実現できないか？
3. 既存の音楽特化サービス（LALAL.AI、Moises、AnthemScore 等）と明確に
   差別化できる要素があるか？
4. §37 の 6 ペルソナのうち少なくとも 3 つに価値を提供するか？
5. 実装に必要な OSS ライブラリが MIT/Apache ライセンスで利用可能か？

---

## 22. 作業履歴（続き）

### 2026-04-22 セッション（戦略ピボット + Bravura SMuFL 導入）

| カテゴリ | 変更内容 |
|---|---|
| 戦略ピボット | §37 新設。マイク販売を収益構造から除外。コーチングマッチングは実装しない。教育機関 B2B は主軸から副次へ。音大不要論は語らず沈黙の勝利戦略へ。6 ペルソナ確定。個人主軸で MRR ¥18M 到達可能な収益モデル（学生+プロ+認定試験+認定維持+教室+コンテンツ）を確定。 |
| Bravura SMuFL 導入 | `public/fonts/Bravura.woff2`（247KB, SIL OFL 1.1, Steinberg）を自ホスト。`app/sight-reading/page.tsx` の音部記号・臨時記号を Unicode Musical Symbols (U+1D11E 等) から SMuFL 私用領域コードポイント（U+E050 gClef, U+E062 fClef, U+E05C cClef, U+E260 flat, U+E262 sharp）に変更。SMuFL の原点規約により補正値ゼロで G 線にスパイラル中心を正確配置。FontFace API で明示ロード。CLEF_FONT_SIZE = SG*4（1em = 4 staff spaces のネイティブスケール）。 |
| CLAUDE.md | §37 個人向けプロ志向プラットフォーム戦略（2026-04-22 改訂版）を追加。§28 の収益モデルおよび教育機関 B2B サブセグメント部分を §37 で上書き宣言。 |

### 次セッション最優先議題

**Stripe 決済システム本番実装**（§37.10 および §40 参照）。
5 つの課金装置（年額 UP-FRONT / 初月¥100 / クォータ UX /
リファラル / 一時停止）を同時にローンチし、マイページに
プラン状態 + 使用回数 UI を実装する。認定制度は採用しない。

### 2026-04-24 セッション（戦略修正 + 決済実装仕様確定）

| カテゴリ | 変更内容 |
|---|---|
| 戦略修正 | §37 から認定制度を完全除外。§37.4 収益モデル再構成（Student ¥8.64M + Pro ¥7.35M + Max ¥792K + Enterprise ¥249K + 教室 ¥897.6K + マスタークラス ¥500K = ¥18.43M/月）。§37.6 ロードマップから Bronze/Silver/Gold/Platinum 段階を除外し、Phase 1 を Stripe 決済同時ローンチに書き換え。 |
| §30 Admin 拡張 | プラン変更対応を free/student/pro/max/enterprise の 5 段階に拡張（仕様確定、実装は次セッション）。 |
| §40 新設 | 決済システム実装仕様を定義。5 つの課金装置と Stripe Dashboard / Auth Worker / マイページ GUI の役割分担を明記。 |
| 既存不整合 | `/certification` ページ（`app/certification/`、`app/page.tsx` 内リンク、sitemap エントリ）が認定制度不採用により宙に浮く。次セッションで削除または「近日公開」プレースホルダー化を決定。 |

---

## 40. 決済システム・サブスク実装仕様（2026-04-24 確定）

> Stripe Checkout + Customer Portal + Auth Worker のクォータ管理で実装する。
> §29・§38 のプラン構造を前提とし、§39 のPro アプリをサーバー処理の対象とする。

### 40.1 実装する 5 つの課金装置

オーナー承認済み（2026-04-24）。ローンチ時に同時実装：

| # | 装置 | Stripe 単体可 | 我々側実装 |
|---|------|-------------|-----------|
| ① | 年額プラン UP-FRONT（実質 2 ヶ月無料） | ✅ 完全 | Checkout UI に月額/年額トグル |
| ② | クォータ到達 UX（80%/100% 警告 + アップセル） | △ 連携 | Auth Worker 使用量管理 + 警告 UI |
| ④ | 初月 ¥100 フック | ✅ 完全 | Coupon 自動適用（duration=once） |
| ⑤ | リファラルプログラム（紹介者 1 ヶ月無料） | △ Stripe 10% + 我々 90% | コード発行・追跡・報酬付与 |
| ⑦ | サブスク一時停止（最大 3 ヶ月） | ✅ API 対応 | Customer Portal 設定 or 独自ボタン |

**採用しない（当初提案から除外）**：③ マイク×サブスクバンドル、⑥ Day 0-30 オンボ自動メール、⑧ 認定制度連動、Phase 2 の 12 施策全て（ギフトカード・ウィンバック・クレジットパック・保管期間階層化）。後日必要に応じて追加可能。

### 40.2 プラン × アプリ利用権限 完全マトリクス

| アプリ種別 | Free（登録不要） | Free（登録必要） | Student ¥480 | Pro ¥980 | Max ¥1,980 |
|-----------|----------------|----------------|-------------|---------|-----------|
| ブラウザ完結系全 19 アプリ（§29 §36） | 無制限 | 無制限 | 無制限 | 無制限 | 無制限 |
| KUON PLAYER アップロード | — | 月 10 回 / 24h 保持 | 月 30 回 / 7 日保持 | 月 100 回 / 14 日保持 | 月 200 回 / 30 日保持 |
| KUON SEPARATOR ※今後 | — | 月 3 回（初月無制限） | 月 20 回 | 月 150 回 | 月 250 回 |
| KUON TRANSCRIBER ※今後 | — | 月 3 回（初月無制限） | 月 20 回 | 月 100 回 | 月 200 回 |
| KUON INTONATION ANALYZER ※今後 | — | 月 3 回（初月無制限） | 月 30 回 | 使い放題 | 使い放題 |
| KUON LESSON RECORDER ※今後 | — | — | 月 3 時間 | 月 20 時間 | 月 40 時間 |
| KUON SCORE FOLLOWER / CHORD ANALYZER ※今後 | — | — | — | 使い放題 | 使い放題 |
| KUON PERFORMANCE COMPARATOR ※今後 | — | — | — | 月 50 回 | 月 150 回 |
| 6-stem 分離（SEPARATOR 上位） | — | — | — | — | 有効 |
| 成長ダッシュボード | — | 直近 30 日 | 全期間 + PDF 出力 | 全期間 + 優先処理 | 全期間 + 優先処理 + 先行機能 |
| イベント投稿 | — | — | — | 無制限 | 無制限 |
| ギャラリー優先掲載 | — | — | — | 有効 | 有効 |
| 月 1 回クリニック | — | — | — | 1 枠 | 2 枠（ゲスト招待可） |
| NORMALIZE（マイク購入者特典） | Password "kuon" | Password "kuon" | Password "kuon" | Password "kuon" | Password "kuon" |

### 40.3 Stripe Dashboard 側の設定（オーナー作業）

1. **Products 3 個 × Prices 6 個を作成**
   - Student Plan: ¥480/月（Price A）+ ¥4,800/年（Price B）
   - Pro Plan: ¥980/月（Price C）+ ¥9,800/年（Price D）
   - Max Plan: ¥1,980/月（Price E）+ ¥19,800/年（Price F）

2. **Coupons 3 個を作成（初月 ¥100 用）**
   - FIRST100_STUDENT: Amount off ¥380, duration=once（通常 ¥480 → ¥100）
   - FIRST100_PRO: Amount off ¥880, duration=once（通常 ¥980 → ¥100）
   - FIRST100_MAX: Amount off ¥1,880, duration=once（通常 ¥1,980 → ¥100）

3. **Referral 用 Coupon テンプレート**
   - REFERRAL_1MONTH_FREE: Amount off = プラン月額全額, duration=once
   - 我々側でユーザーごとに Promotion Code を発行して紐付け

4. **Customer Portal 設定**
   - Plan upgrades/downgrades: 有効（全 3 プラン間）
   - Cancel subscription: 有効
   - Pause subscription: 有効（日本で利用可能なら）
   - Update payment method: 有効
   - Invoice history: 有効

5. **Webhook endpoint 追加**
   - 既存: `https://kuon-rnd.com/api/webhook`（マイク購入用）
   - イベント追加: `customer.subscription.created` / `customer.subscription.updated` / `customer.subscription.deleted` / `invoice.paid` / `invoice.payment_failed`

6. **Test mode で 3 プラン全てを E2E 動作確認 → Live mode 切替**

### 40.4 Auth Worker 拡張仕様

KV キー追加設計：

| キーパターン | 内容 | TTL |
|------------|------|-----|
| `usage:{email}:{YYYY-MM}:{app}` | 月別使用回数（分離・譜起こし等） | 62 日 |
| `plan:{email}` | 現在のプラン（free/student/pro/max/enterprise）+ Stripe subscriptionId | なし |
| `referral:{code}` | リファラルコード → 紹介者 email | なし |
| `referral-rewards:{email}` | 受け取り済み無料月数（年 3 ヶ月上限） | なし |
| `pause:{email}` | 一時停止中フラグ + 再開予定日 | 停止期間 |

エンドポイント追加：

| メソッド | パス | 用途 |
|---------|------|------|
| POST | `/api/auth/usage/check` | 使用前に残回数チェック（アップセル UX 判定） |
| POST | `/api/auth/usage/increment` | 処理成功後に使用回数をインクリメント |
| GET | `/api/auth/usage/me` | マイページ用：全アプリの使用状況一覧 |
| POST | `/api/auth/stripe/checkout` | Checkout Session 作成（プラン + 月額/年額 + クーポン指定） |
| POST | `/api/auth/stripe/portal` | Customer Portal Session 作成 |
| POST | `/api/auth/stripe/webhook` | Stripe イベント受信・プラン同期 |
| POST | `/api/auth/referral/generate` | リファラルコード発行 |
| GET | `/api/auth/referral/me` | 自分のリファラルコード + 報酬履歴 |
| POST | `/api/auth/pause` | サブスク一時停止（Stripe API 呼び出し） |
| POST | `/api/auth/resume` | サブスク再開 |

### 40.5 マイページ GUI 仕様

`app/mypage/page.tsx` に以下のセクションを追加：

1. **プラン状態カード**
   - 現在のプラン（Free / Student / Pro / Max / Enterprise）をバッジ表示
   - 次回請求日と金額
   - 「プラン変更」「一時停止」「キャンセル」ボタン（Customer Portal へ遷移）
   - 年額に変更するとお得バナー（月額ユーザーのみ）

2. **使用状況ダッシュボード**
   - 各サーバーアプリの月別使用回数を棒グラフで表示（SEPARATOR: 12/20 等）
   - 進捗バーが 80% 超えると橙色警告、100% で赤色
   - リセット日までのカウントダウン表示

3. **利用可能アプリ一覧**
   - 現在のプランで使える全アプリをカード表示
   - 上位プランで解放される機能は薄いグレーで「Pro で解放」オーバーレイ
   - クリックでアップグレード CTA

4. **リファラルカード**
   - 固有のリファラル URL（例: `kuon-rnd.com/?ref=XXX`）と QR コード
   - 紹介した友人数 / 有料転換数 / 獲得した無料月数
   - SNS シェアボタン（X / LINE / メール）

### 40.6 リファラル実装フロー

```
ユーザー A がマイページで「紹介リンクをコピー」
  → kuon-rnd.com/?ref=ABC123 を共有
  ↓
ユーザー B が ?ref=ABC123 でアクセス
  → Providers でクッキーまたは localStorage に保存（既存実装 §22 2026-04-21 セッション）
  ↓
ユーザー B が有料プランにサインアップ
  → Checkout Session 作成時に metadata.referredBy = "ABC123" を付与
  → Stripe Webhook 受信時に referral:{ABC123} から紹介者 email を取得
  → ユーザー A に「1 ヶ月無料」報酬を付与
     （a）Stripe subscription.trial_end を 30 日延長
     または
     （b）Stripe subscription に一回きり Coupon を適用
  → referral-rewards:{A の email} をインクリメント（年 3 ヶ月上限）
```

### 40.7 クォータ到達 UX フロー

```
ユーザーが SEPARATOR の処理ボタンをクリック
  ↓
フロント: POST /api/auth/usage/check { app: 'separator' }
  ↓
Auth Worker: usage:{email}:{YYYY-MM}:separator を取得
  ├── 0-79%: OK → 通常処理
  ├── 80-99%: OK + warning フラグ → モーダル「今月あと N 回です」
  └── 100%: NG → モーダル「今月分を使い切りました」+ 3 択提示
                  1. 来月まで待つ
                  2. アップグレードする（Customer Portal へ）
                  3. （将来）クレジットパック購入
  ↓
処理完了後: POST /api/auth/usage/increment { app: 'separator' }
```

### 40.8 Stripe 単体で実現できる範囲のまとめ

| 装置 | Stripe 対応範囲 | 我々実装範囲 |
|------|---------------|------------|
| ① 年額プラン | Price × 2 個作成、Checkout で選択可 | Checkout 呼び出し時にどの Price を指定するかの UI |
| ② クォータ UX | プラン変更 URL 提供のみ | 使用量計測・警告 UI・アップセルモーダル |
| ④ 初月 ¥100 | Coupon 機能で完全対応 | Checkout 作成時に coupon パラメータを付与 |
| ⑤ リファラル | Promotion Code + 手動報酬付与 API | コード発行・紐付け・報酬付与トリガー |
| ⑦ 一時停止 | pause_collection API + Portal 設定 | 停止期間管理・自動再開フラグ |

**結論：5 装置全てが Stripe 単体で物理的には実現可能**。ただし ② クォータ UX と ⑤ リファラルは Stripe の機能を「使いながら」我々側でロジック層を組む必要がある。①④⑦ は Stripe 側の設定変更だけで 80% 完了する。

---

## 41. Stripe サブスクリプション本番稼働（2026-04-25 完了・サービススタート）

### 41.1 完了サマリ

2026-04-25 に **Stripe サブスクリプション・バックエンド + フロントエンド統合の全フェーズが完了** し、本番でサブスク販売が稼働開始しました。

| Phase | 内容 | 状態 |
|-------|------|------|
| 1 | Tax 設定 + 顧客向け表示情報 | ✅ |
| 3 | Products 作成（Prelude/Concerto/Symphony/Opus） | ✅ |
| 4 | Prices 作成（14 件・currency_options + LatAm） | ✅ |
| 5 | Coupons 作成（7 件 = FIRST100 × 3 + REFERRAL + TIER_A + TIER_C + RETENTION） | ✅ |
| 6 | Customer Portal 設定（`bpc_1TPy1rGbZ5gwwaLkKegFAY2z`） | ✅ |
| 7 (Stage A-E) | Webhook ハンドラ + Checkout/Portal API 実装 | ✅ |
| 8 | 本番 Restricted Key + Webhook 登録 + Cloudflare Secrets | ✅ |
| Frontend | Pricing UI + Subscribe ボタン + マイページ Customer Portal ボタン | ✅ |

詳細は **`/Users/kotaro/kuon-rnd/空音開発/stripe-ids.md`** を Source of Truth として参照してください。

### 41.2 確定した価格構造（2026-04-25 時点・Stripe Live 整合）

| 商品 | 月額 (JPY) | 年額 (JPY) | LatAm 月額 (USD) | LatAm 年額 (USD) |
|------|---------|---------|---------------|---------------|
| **Prelude** | ¥780 | ¥7,800 | $3.99 | $39.90 |
| **Concerto** | ¥1,480 | ¥14,800 | $7.99 | $79.90 |
| **Symphony** | ¥2,480 | ¥24,800 | $12.99 | $129.90 |
| **Opus** | ¥5,980 | ¥59,800 | （対象外） | （対象外） |
| **P-86S マイク** | ¥13,900（買い切り・税込・日本円のみ） |
| **X-86S マイク** | ¥39,600（買い切り・税込・日本円のみ） |

**重要ルール（2 度と間違えないため）**:
1. マイクの価格表示は **¥13,900 / ¥39,600 で日本円のみ**（多通貨表示しない）
2. サブスクの Stripe 内部名は **Prelude / Concerto / Symphony / Opus**。フロント表示も同じ名前
3. legacy `plan` フィールド（`'free' | 'student' | 'pro'`）は後方互換のため残しているが、新規ロジックは `planTier` を参照
4. Stripe Live mode の P-86S Price ID = `price_1SuT6IGbZ5gwwaLkc7rjciqU`（¥13,900）

### 41.3 確定したエンドポイント一覧

| メソッド | パス | 用途 |
|---------|------|------|
| POST | `/api/auth/stripe/checkout` | Checkout Session 作成（plan + cycle + region 自動判定） |
| POST | `/api/auth/stripe/portal` | Customer Portal Session 作成 |
| POST | `/api/auth/stripe/webhook` | Webhook 受信・12 イベント処理 |

### 41.4-bis マイクの販売範囲: 日本国内のみ（暫定・2026-04-25 確定）

**決定**: P-86S / X-86S マイクは **日本国内のみ販売** とする。

**理由**:
- サブスク事業立ち上げ期で為替リスク・国際物流の運用負荷を最小化したい
- Stripe Checkout の `shipping_address_collection[allowed_countries][0]: 'JP'` で技術的にも JP のみに制限済み
- 海外売上が出始めても、まずはサブスクの月額数千円ベースで安定収益を確立する方が優先

**将来の拡張トリガー**:
- **サブスク登録者数が 100 人を超えた段階** で海外発送設計を再検討
- その時点で:
  - EMS / DHL の単価交渉（量が出れば法人レート適用可能）
  - 通関書類自動生成
  - Stripe Price に `currency_options` 追加（USD/EUR/GBP 等のローカル通貨表示）
  - 関税前払いオプション（DDP 配送）の検討

**コード上の関連箇所** (将来変更時の参照):
- `app/api/checkout/route.ts` line: `shipping_address_collection[allowed_countries][0]: 'JP'`
- `app/lib/purchase-emails.ts`: 英語版テンプレート (`buildCustomerEmailEn`) は既に実装済み・現状未使用
- `app/lib/shipping-emails.ts`: 発送通知メール（日本語版・国内のみ想定）

**現状確認 (2026-04-25)**:
- マイクページ表示: ¥13,900 (日本円のみ・全言語)
- Stripe Checkout: `JP` のみ受付
- 顧客メール: 日本語のみ送信
- オーナー通知: 日本語のみ・ヤマト集荷情報含む
- 発送通知: ヤマト追跡番号のみ対応 (国際追跡番号は将来対応)

### 41.4 認定制度（KUON CERTIFICATION）について — 採用しない決定（永久）

> **重要: この決定は最終確定です。再実装してはいけません。**

2026-04-25 にオーナー判断で **認定制度を採用しないことを最終決定** しました。理由は §37.5 に記載のとおり、運用工数とロックイン効果のトレードオフが見合わないため。

#### 取った措置

1. ホームページから「KUON CERTIFICATION」セクションを削除（`app/page.tsx` line 559）
2. ヘッダーから関連リンク削除（既に存在せず）
3. `app/sitemap.ts` から `/certification` URL を削除
4. `/certification` ページを **ホームへの自動リダイレクト** に変換（既存 SNS リンク等の 404 回避）
5. `/certification/layout.tsx` に `robots: { index: false, follow: false }` を設定

#### 将来 Claude が「認定制度を実装しよう」と言い出さないために

このセクション §41.4 を読んだら **絶対に再実装しない** こと。代替の収益源は §37.4 のサブスクモデル（Student + Pro + Max + Enterprise + Family）で十分達成可能（MRR ¥18M 目標）。

### 41.5 デプロイ済み Version ID（記録）

Auth Worker:
- Stage B: `bee85a53-246f-40b5-aa4d-55a2bd64e958`
- Stage C+D: `73b66cc7-00fa-497e-a0ad-e313e5a527e2`
- Stage E + KV キーバグ修正: `422b36cd-bbde-49ae-b58a-85f46f460661`

Cloudflare Pages: 2026-04-25 22 時頃に Stripe フロント統合 commit を push、自動ビルドで反映済み

### 41.6 サービススタート日

**2026-04-25** = 空音開発のサブスクリプションサービス正式スタート日。
この日から MRR 計上が可能となり、§37 の ¥18M/月 MRR 目標達成への Phase 1 が始まる。

### 41.7 マイク販売の本格スタート（2026-04-25 確認）

`/admin/ship` 管理画面の動作確認時点で、**直近 30 日のマイク注文 6 件** が Stripe で確認できた。
これは Phase 8 完了前後に発生した実購入で、空音開発でのマイク販売が既に稼働していたことを示す。

オーナー側の発送オペレーションは:
- 既存（手動）: Stripe Dashboard 確認 → ヤマト集荷依頼 → 発送 → 顧客にメール手動送信
- 自動化後（2026-04-25 〜）: Webhook → オーナー通知メール（ヤマト集荷フォーマット内蔵） → /admin/ship からトラッキング番号入力 → 発送通知メール自動送信

### 41.8 マイク購入者特典: 1 ヶ月 Concerto 無料（2026-04-25 確定）

**当初計画（CLAUDE.md task #6）**: 3 ヶ月 PRO 無料
**改訂後**: **1 ヶ月 Concerto 無料**

#### 改訂理由（コスト効率分析）

| 期間 | 平均コスト/人 | 継続率上昇 | LTV 向上 | コスト効率 |
|------|------------|-----------|---------|----------|
| 3 ヶ月 | ¥750 | +65% | ¥4,500 | 6.0x |
| **1 ヶ月** | **¥250** | **+55%** | **¥4,000** | **16.0x** ✅ |

3 ヶ月の追加コスト ¥500 で得られる継続率上昇は +10% のみ。GCP 無料クレジット節約のため 1 ヶ月で開始し、データ蓄積後に再評価する。

#### 実装方針（Phase 9 以降の予定タスク）

P-86S または X-86S 購入時の Webhook ハンドラ拡張:
1. `checkout.session.completed` イベントで amount_total が 13900 or 39600 を検出
2. customer email でユーザー検索（Auth Worker KV）
3. ユーザー存在 → Stripe API で Concerto Subscription を `trial_period_days: 30` で作成
4. ユーザー不存在 → KV に `mic_bonus:{email}` を保存し、初回ログイン時に適用

### 41.9 Google Cloud $300 無料クレジット運用方針（2026-04-25 確定）

**プロジェクト**: kuon-rnd
**初期クレジット**: $300 (≈ ¥45,000)
**期間**: 90 日（2026 年 4 月開始 → 2026-07 月末頃失効）
**主な使用予定**: Cloud Run（Demucs v4 ステム分離 / Whisper 等）

#### サーバーアプリ単価（CPU 版・初期ローンチ）

- KUON SEPARATOR: 約 ¥6/回（4 分楽曲）
- KUON TRANSCRIBER: 約 ¥10/時間（Whisper）
- KUON HARMONY: 約 ¥2/回（軽量処理）

#### プラン別 平均月額コスト（実使用 30-40% 想定）

| プラン | 月額 | 平均実コスト | 粗利率 |
|--------|------|------------|-------|
| Free | ¥0 | ¥6 | -¥6 |
| Prelude ¥780 | ¥780 | ¥50 | 89% |
| Concerto ¥1,480 | ¥1,480 | ¥250 | 81% |
| Symphony ¥2,480 | ¥2,480 | ¥650 | 73% |
| Opus ¥5,980 | ¥5,980 | ¥1,500 | 74% |

#### 初月キャンペーン: HALF50 (50% オフ) を採用 — 2026-04-25 確定

**重要な経緯**: 当初 FIRST100 (¥100 ベース) を実装したが、**Concerto/Symphony で赤字**になることが判明。健全な収益構造のため **HALF50 (50% オフ全プラン) に全面切替**。

| プラン | HALF50 顧客支払 | 手取り | コスト | 初月純利 |
|-------|------------|------|------|--------|
| Prelude (¥780) | ¥390 | ¥346 | ¥50 | **+¥296** |
| Concerto (¥1,480) | ¥740 | ¥683 | ¥250 | **+¥433** |
| Symphony (¥2,480) | ¥1,240 | ¥1,165 | ¥650 | **+¥515** |
| Opus (¥5,980) | ¥2,990 | ¥2,852 | ¥1,500 | **+¥1,352** |

→ **全プランで黒字**。GCP クレジット節約効果も大きい。

#### Stripe Coupon 構成 (2026-04-25 時点)

- **HALF50_*** (active): 全 4 プランに 50% off 適用
- **FIRST100_*** (legacy・残存): 将来別キャンペーンで使用可能だが現在 attach しない

コード側 (Auth Worker `/api/auth/stripe/checkout`) は **HALF50 のみを attach** する設計。

#### 90 日合計コスト目標

**シナリオ A（推奨・HALF50 ベース）**: 合計 60 ユーザー (各プラン分散)
- Prelude HALF50 30 名 (月コスト ¥1,500) + Concerto 15 名 (月コスト ¥3,750) + Symphony 10 名 (月コスト ¥6,500) + Opus 5 名 (月コスト ¥7,500)
- 月コスト合計: ¥19,250
- 90 日合計: ¥57,750
- **クレジット (¥45,000) を 30% 超過 → ただし収益も大きい (90 日累計 ¥150,000+ 純利)**

**シナリオ B (HALF50 慎重成長)**: 合計 30 ユーザー
- Prelude 15 名 + Concerto 8 名 + Symphony 5 名 + Opus 2 名
- 月コスト合計: ¥9,250
- 90 日合計: ¥27,750
- **クレジット (¥45,000) 内で完走 ✅** (余裕 ¥17,250)

**HALF50 効果**: FIRST100 比でユーザー数は減るが、1 人あたり粗利が大きく、90 日後の MRR が安定。教育機関プロモーション等で計画的にユーザー獲得していく方針と合致。

#### クレジット失効後の戦略

2026 年 7 月末以降は GCP の Pay-as-you-go に移行。それまでに MRR 月 ¥35,000 を達成して自走可能にする。

---


## 42. マイク販売を Kuon ブランド内 LP から完全分離（2026-04-26 確定・最終決定）

> **重要: この決定は最終確定。再実装してはいけない。**

### 42.1 背景と意思決定

2026-04-25 にマイクの販売範囲を「日本国内のみ」と確定した（§41.4-bis 参照）。
この決定により、Kuon ブランドの公開フロント LP がマイクを国際ユーザーに見せると
**国際公平性の問題が発生する**:

- 海外ユーザーが LP でマイクを見る → 期待する → 「JP only」を見て失望
- 多言語対応で「Microphone」「Micrófono」「Mikrofon」と訳しているのに買えない
- マイク特典 (Concerto 1ヶ月無料等) も JP 限定になり、海外ユーザーへの不公平が生じる

→ **2026-04-26**: オーナー判断で **Kuon ブランド内の全 LP からマイクへの動線を完全遮断**することに最終決定。

### 42.2 実装した削除内容

| 場所 | 削除内容 |
|------|---------|
| `app/header.tsx` | グローバルメニューから「マイク」削除 (PC + モバイル両対応) |
| `app/footer.tsx` | PRODUCTS リストから「マイク」削除 |
| `app/page.tsx` (ホーム) | (a) MICROPHONE セクション全削除 (P-86S/X-86S 商品カード)<br>(b) マイク購入者特典バナー全削除 (Concerto 1ヶ月無料 CTA)<br>(c) FAQ「マイク発送先」全削除<br>(d) ヒーローサブコピーから「ハンドメイドマイク」記述削除 |
| `app/audio-apps/page.tsx` | (a) MicBundleCTA 関数 + JSX 呼び出し削除<br>(b) MasteringServiceCard 関数 + JSX 呼び出し削除<br>(c) SignupBanner 末尾の「P-86S マイクを見る」ボタン削除 |
| `app/mypage/page.tsx` | プロフィールリンクリストから「マイクロフォン」削除 |
| `app/sitemap.ts` | `/microphone` URL を sitemap から削除 (検索エンジンへの露出を最小化) |

### 42.3 維持されているもの (意図的に残した)

| 場所 | 理由 |
|------|------|
| `app/microphone/page.tsx` + `layout.tsx` | LP 自体は完全に動作する状態を維持。Kotaro Studio 外部リンクからのみ流入する純度設計 |
| `app/manual/p-86s/page.tsx`, `app/manual/x-86s/page.tsx` | 既存購入者向けマニュアル。`/microphone` リンクを内包しているが、購入後コンテキストなので OK |
| `app/shop/thanks/page.tsx` | 購入完了ページ。購入者のみが到達するため、ギャラリー投稿リンク (`/microphone#gallery-submit`) は維持 |
| `app/lib/purchase-emails.ts` | 購入確認メール内の `/microphone#gallery-submit` リンク。購入者のみ受信するため維持 |
| `app/gallery/page.tsx` | 録音ギャラリーは社会的証明として価値があるため維持。投稿リンクは購入者のみが投稿パスワードを持っているため UI 的にも問題なし |
| `app/api/checkout/route.ts`, `app/api/checkout-international/route.ts` | Stripe Checkout の `cancel_url`。購入フロー中のみ参照されるため OK |
| `app/admin/UtmGenerator.tsx` | オーナー専用管理画面の URL 生成ツール。一般ユーザーには見えない |

### 42.4 流入導線 (今後)

```
旧 Kotaro Studio (kotarohattori.com) のマイク販売リンク
  ↓
https://kuon-rnd.com/microphone (直リンク)
  ↓
P-86S 商品 LP → Stripe Checkout (JP のみ) → 購入完了 → /shop/thanks
  ↓
購入確認メール (Resend) → ギャラリー投稿リンク・KUON NORMALIZE パスワード
```

→ Kuon ブランド側からの「マイク売り込み動線」はゼロ。
→ Kotaro Studio (旧サイト) からの直リンクのみが正規導線。
→ 海外からのアクセスは Stripe Checkout 側で `JP` のみ受付なので物理的にも購入不可。

### 42.5 マイク購入者特典は実装しない (2026-04-26 確定)

§41.8 で計画した「マイク購入者は Concerto 1ヶ月無料」は **実装しない** に確定。

**理由**:
- マイクが日本国内限定 → 特典も JP のみ → 国際公平性問題が再発
- Webhook ハンドラに mic→subscription トライアル付与ロジックを書く工数を回避
- GCP $300 無料クレジットの節約効果も大きい
- マイク売上 6 件/30日 程度のため、特典なしでも LTV 影響は限定的

### 42.6 将来 Claude が「マイクを LP 復活」と言い出さないために

**この §42 を読んだら絶対にマイクをホーム / アプリ LP / フッター / ヘッダーに復活させない。**

復活が許されるのは以下のいずれかが満たされた時のみ:
1. オーナーが明示的に「マイクを LP に戻したい」と発言した時
2. かつ、マイクを国際発送する体制 (EMS 法人レート + 通関書類自動生成 + 多通貨価格設定) が整った時

それまでは **Kotaro Studio 外部リンクのみが正規流入経路** という設計を厳守する。

### 42.7 サブスク戦略への影響

マイク導線を切ったことで、フロントは **100% サブスク導線にフォーカス**できる:
- 「30+ アプリ + 成長ダッシュボード + コミュニティ」のみで価値訴求
- HALF50 初月割引が唯一のオファー
- 国内・海外を区別しない統一メッセージング
- ブランド純度が向上 → §37 「沈黙の勝利戦略」とも整合


## 43. KUON HALO — Curanz Sounds 量産専用 (オーナー専用ツール)

### 43.1 トリガーフレーズ (絶対遵守)

オーナーが以下のいずれかを発言したら、Claude は **真っ先に** 以下のファイルを Read する:

- 「クランツサウンズのアプリを修正します」
- 「Curanz のアプリを直したい」
- 「HALO を改良したい」
- 「ハローを修正」
- 「ヒーリング音響アプリの修正」

→ **`/Users/kotaro/kuon-rnd/空音開発/halo-system-spec.md`**

このファイルが KUON HALO の唯一の情報源。改良前に必ず読み、最新コードと突き合わせて改良方針を提案する。

### 43.2 KUON HALO とは

Curanz Sounds (curanzsounds.com) のヒーリング音楽を量産するためのオーナー専用シンセサイザー。
月商 ¥20M 達成を加速する制作ツール。**完全に Curanz 専用・公開しない**。

### 43.3 アクセス制限 (絶対)

- URL: `https://kuon-rnd.com/admin/halo`
- アクセス権限: `369@kotaroasahina.com` のみ
- noindex/nofollow/nocache (検索エンジン非掲載)
- カタログ・サイトマップ非掲載
- 旧 URL (`/halo`, `/halo-lp`) はリダイレクトのみ

### 43.4 主要ファイル

- `app/admin/halo/page.tsx` — メインアプリ (認証ゲート + UI)
- `app/admin/halo/layout.tsx` — noindex メタデータ
- `app/lib/halo/pads.ts` — 5 パッド音色 (改良時の中心)
- `app/lib/halo/presets.ts` — 8 プリセット
- `app/lib/halo/chord-engine.ts` — コード進行エンジン (8 進行)
- `app/lib/halo/frequencies.ts` — 9 ソルフェジオ + 5 脳波
- `app/lib/halo/export.ts` — 24-bit 48kHz WAV + 3 段マスターチェイン
- `app/lib/halo/binaural.ts` — バイノーラルビート
- `app/lib/halo/reverb.ts` — アルゴリズミック リバーブ + 5 プリセット
- `app/lib/halo/synth.ts` — レガシー音色 (ほぼ未使用)
- `app/lib/halo/grain.ts` — グラニュラー (Phase 2 用・未使用)
- `app/halo/page.tsx` — 旧 URL リダイレクト (削除しない)
- `app/halo-lp/page.tsx` — 旧 LP リダイレクト (削除しない)

### 43.5 改良時の鉄則

1. **音割れ絶対禁止** (3 段マスターチェイン維持: 10秒フェードイン → リミッター → tanh)
2. **耳に刺さる音は失敗** (warmth スライダーで全パッド軟化対応)
3. **432Hz チューニング基本** (440Hz は採用しない)
4. **ソルフェジオ周波数を軸** とする (174-963Hz 直接指定)
5. **コード進行ベース** (1 コード 30-60 秒持続)
6. **24-bit 48kHz WAV** (Curanz 商品標準)
7. **完全合成** (サンプルファイル不使用)
8. **オーナー専用維持** (公開・カタログ掲載禁止)

---

## 44. 2026-04-28 セッション — Opus 廃止 + オーナーオーバーライド + 教師経由学生クーポン

このセッションで行った 4 つの主要変更を記録する。すべてリリース後の本番環境に対する慎重な変更。

### 44.1 Opus プラン暫定廃止（完全実装）

§42 でフロント LP からマイク導線を削除したのと同じ思想で、Opus を「個人音楽家プラットフォームの純化」のため暫定廃止。Symphony を最上位として確定。

**実装内容（4 段階）**:

| ステップ | 場所 | 変更 |
|---|---|---|
| 1 | フロント LP（`app/page.tsx` / `app/audio-apps/page.tsx`） | Opus カード削除。Symphony 説明を「全 33 アプリが無制限・最上位プラン」に統一 |
| 2 | Stripe Dashboard | Opus Product を archive（新規購入を物理的にブロック） |
| 3 | Customer Portal | switchable_products から Kuon Opus の 2 Price を削除（Portal 経由のアップグレード防止） |
| 4 | Auth Worker `app.post('/api/auth/stripe/checkout')` | `plan === 'opus'` を **HTTP 410 Gone** で弾く防御線追加。Bot や直接 API 叩きから守る |

**既存 Opus 加入者数**: 0 人（確認済み）。よって既存サブスクへの影響なし。

**復活条件**: §38.1 を要再検討。基本的に復活させない。

### 44.2 オーナーオーバーライド（自動 Symphony 化）

オーナー (`369@kotaroasahina.com`) が自分のサービスを使うために自分に課金する必要をなくすため、Worker 側に自動オーバーライドを実装。

**動作仕様**:
- KV 上の `user.planTier` は `'free'` のままでも、API レスポンス上は常に Symphony 扱い
- 影響箇所:
  - `GET /api/auth/me` → `planTier: 'symphony'` を返す + `isOwner: true` フラグ
  - `POST /api/auth/usage/check` → quota 計算が Symphony ベース
  - `POST /api/auth/track` → 同上
  - `GET /api/auth/usage/me` → 同上

**設計判断**: hardcode の email 比較で実装。環境変数化や複数オーナー対応はしていない。将来必要なら別途設計。

### 44.3 Admin ダッシュボードの新 tier システム移行

旧 `'free' | 'student' | 'pro'` 3 段階から新 `'free' | 'prelude' | 'concerto' | 'symphony' | 'opus'` 5 段階に移行（Opus は legacy ユーザー保護のため残置）。

**変更箇所**:

| ファイル | 内容 |
|---|---|
| `app/admin/page.tsx` | `UserInfo.planTier` 型追加・`tierBadge()` 5 色対応・統計カード 4 tier 表示・フィルタを planTier 基準に・ドロップダウンで planTier を送信 |
| `kuon-rnd-auth-worker/src/index.ts` (`GET /api/auth/admin/users`) | planTier フィルタ + 5 段階の集計（`tierFree` / `tierPrelude` / `tierConcerto` / `tierSymphony` / `tierOpus`）を返す |
| `kuon-rnd-auth-worker/src/index.ts` (`PUT /api/auth/admin/plan`) | `body.planTier` を受け取って **両フィールド（planTier + 旧 plan）を同期更新**。tier 変更時は `ensureShowcaseFavorites()` も追従発火 |

**運用効果**: 知り合いのミュージシャンに対面で Symphony 権限を付与できるようになった（営業時のリアルタイム実演で教師の心を掴む装置）。

### 44.4 教師経由 学生クーポンシステム（STUDENT_30_12MO）

知り合いの音楽家・教師に Symphony を無償付与し、その学生向けに教師の名前を冠した Promotion Code を発行する仕組み。教師の優越感を媒介に学生集客を増殖させる IQ180 設計。

#### 設計判断（恒久化）

| 項目 | 決定 | 根拠 |
|---|---|---|
| 割引内容 | 30% off × 12 ヶ月（repeating） | 月次粗利率 80% 維持 + 学年中フォロー |
| 対象プラン | **Prelude + Concerto のみ** | Symphony は格式維持のため除外（卒業＝Symphony 昇格の物語を温存） |
| 既存課金者 | `restrictions.first_time_transaction: true` | 二重利用防止 |
| コード形式 | 教師の名前を冠する（例: `ASAHINA-30`、`TANAKA-30`） | 教師個人の名前がブランド化 |
| 共有方式 | URL（`kuon-rnd.com/?coupon=XXX`）+ コード両方 | 教師が SNS / LINE / メールで配布しやすい |
| 終了後挙動 | 通常価格で自動継続（Stripe 標準動作） | LTV 確保 |

#### Stripe Coupon

- **Coupon ID**: `STUDENT_30_12MO`
- **percent_off**: 30
- **duration**: `repeating`
- **duration_in_months**: 12
- **applies_to.products**: `prod_UOiR1Snq8PFuW2` (Prelude) + `prod_UOiikPTpBHObTp` (Concerto)
- **作成日**: 2026-04-28（Live mode）

詳細は `空音開発/stripe-ids.md` Phase 5c 参照。

#### Worker エンドポイント（管理 API）

`kuon-rnd-auth-worker/src/index.ts` に 3 本追加（オーナー専用）:

| メソッド | パス | 用途 |
|---|---|---|
| POST | `/api/auth/admin/promo-code` | 新規 Promotion Code 発行（コード重複事前チェック付き） |
| GET | `/api/auth/admin/promo-codes` | STUDENT_30_12MO に紐づく全 Promotion Code 一覧 + 統計 |
| PATCH | `/api/auth/admin/promo-code/:id` | 有効/無効切替（Stripe は削除不可なので active=false で停止） |

**Stripe SDK v22 の API 形式注意**:
```typescript
stripe.promotionCodes.create({
  promotion: { type: 'coupon', coupon: 'STUDENT_30_12MO' }, // v22 では promotion wrapper が必須
  code: 'ASAHINA-30',
  metadata: { teacherEmail, teacherName },
  restrictions: { first_time_transaction: true },
})
```

#### 管理 UI `/admin/coupons`

`app/admin/coupons/page.tsx` 新規作成。Admin ダーク テーマ（既存 `/admin` と統一）:

- **発行フォーム**: 教師の名前 / email / コード（自動提案 *NAME*-30 形式）/ 任意の使用上限
- **発行成功時**: コード本体 + 共有 URL（`kuon-rnd.com/?coupon=XXX`）が即時表示・ワンクリックコピー
- **一覧テーブル**: 状態 / コード / 教師 / 使用回数 / 発行日 / 操作（URL コピー / コードコピー / 有効化・無効化）
- **統計ヘッダー**: 発行済み総数 / 有効コード数 / 累計使用回数

`app/admin/page.tsx` のヘッダーから「🎓 学生クーポン管理」リンクで到達可能。

#### 営業フロー（推奨）

```
1. ミュージシャンとアポ取り
2. ミーティングで Kuon の概要説明
3. その場で /admin から教師を Symphony に切替（教師の目の前で実演）
4. その場で /admin/coupons から教師専用コード発行（実演継続）
5. 表示された共有 URL を即コピー → 教師に LINE / メール / Slack で送る
6. 「学生に伝えるか伝えないかは先生のご判断で」と委ねる（強制しない）
```

ステップ 3 と 4 を**教師の目の前でリアルタイム実演する**のが致命的に効く。広報意欲が点火する瞬間。

#### 残課題（Phase 2 以降）

| 項目 | 優先度 | 備考 |
|---|---|---|
| 共有 URL の自動適用ロジック | 高 | `kuon-rnd.com/?coupon=XXX` を踏んだユーザーの Checkout で `discounts.promotion_code` を自動 attach。現状はユーザーが Stripe Checkout の入力欄に手で打つ必要あり |
| 教師ダッシュボード `/teacher` | 中 | 教師自身が自分のコードと招待数・転換数・MRR 寄与を見られる画面 |
| 割引終了 30 日前の通知メール | 中 | 1 年経過予定のユーザーに事前リマインド（Resend 経由）。1 年後（2027 年 4 月頃）までに実装すれば OK |
| 2 年目継続学割の手動運用 | 低 | 教師ルートの再発行に限定するポリシー |

### 44.5 Wrangler デプロイ恒久対策

`kuon-rnd-auth-worker/package.json` の `scripts` を更新:

```json
"dev": "wrangler dev --config wrangler.toml",
"deploy": "wrangler deploy --config wrangler.toml"
```

**理由**: 親ディレクトリ `~/kuon-rnd/wrangler.jsonc` (Pages Functions 用) が誤って読まれて Worker のエントリポイントが見つからず ERROR になる問題を恒久回避。今後は `npm run deploy` で安全。

### 44.6 デプロイチェックリスト

このセッションでの全変更を本番反映するには以下 2 コマンド:

```bash
# 1. Worker デプロイ（admin tier system + owner override + Opus 410 + 教師クーポン API）
cd ~/kuon-rnd/kuon-rnd-auth-worker && npm run deploy

# 2. フロント反映（Cloudflare Pages 自動ビルド）
cd ~/kuon-rnd && git add -A && git commit -m "Opus deprecation + owner override + teacher coupons" && git push origin main
```

Worker デプロイで「**Current Version ID**」が出ることを必ず確認。

### 44.7 動作確認チェックリスト

デプロイ後に以下を順次確認:

- [ ] `/admin` にアクセス → 統計カードに Free / Prelude / Concerto / Symphony の 4 tier 表示
- [ ] `/admin` のドロップダウンで Symphony を選択 → 確認ダイアログ → 反映確認
- [ ] `/admin/coupons` にアクセス可能（オーナーのみ）
- [ ] `/admin/coupons` でテストコード発行 → 共有 URL が表示される
- [ ] `/mypage` で DAW 等の Prelude+ アプリにアクセスできる（オーナーオーバーライド確認）
- [ ] Opus 用の直接 Checkout API 叩き（`{ plan: 'opus', cycle: 'monthly' }`）が 410 Gone で弾かれる

詳細仕様・改良候補・既知の制約はすべて `空音開発/halo-system-spec.md` に集約。
