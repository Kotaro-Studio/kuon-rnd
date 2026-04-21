# Curanz Sounds 管理ダッシュボード構築プロンプト

> このドキュメントは、空音開発（kuon-rnd.com）で運用中のオーナー専用管理ダッシュボードの
> アーキテクチャと実装詳細をまとめたものです。
> Curanz Sounds プロジェクトを担当する AI に渡して、同等のダッシュボードを構築してもらうために作成しました。

---

## 背景

空音開発（kuon-rnd.com）には、オーナー（369@kotaroasahina.com）のみがアクセスできる管理ダッシュボードが `/admin` に実装されている。このダッシュボードはオーナーのモチベーション維持に非常に効果的で、Curanz Sounds でも同様のものを導入したい。

オーナーは「自分のサービスがどれだけ使われているか」をリアルタイムで確認できることに大きな価値を感じている。数字が見えると、次の開発へのモチベーションが段違いに上がる。

---

## 空音開発ダッシュボードの全体像

### アクセス制御

- `/admin` にアクセス → `/api/auth/me` で JWT 検証 → メールが `369@kotaroasahina.com` でなければリダイレクト
- 一般ユーザーがアクセスしても 403 Forbidden（API側）またはリダイレクト（フロント側）
- JWT は httpOnly Cookie（`kuon_token`）に格納されている

### 画面構成（上から順に）

#### 1. ヘッダーバー
- ダークネイビー背景（`#0f172a`）
- ブランド名「空音開発」+ 「ADMIN DASHBOARD」ラベル
- 「マイページに戻る」リンク

#### 2. 統計カード（6枚グリッド）
- **全ユーザー数** — 全登録者の合計
- **Free** — 無料プランのユーザー数
- **Student** — 学割プランのユーザー数
- **Pro** — プロプランのユーザー数
- **今日のPV** — 本日のページビュー数
- **14日間PV** — 過去14日間の合計ページビュー数

各カードは白背景・角丸12px・薄いシャドウ。数字は大きく（2rem, 700 weight）、ラベルは小さく下に表示。`grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))` でレスポンシブ。

#### 3. ページビューチャート（2カラム）

**左: 14日間棒グラフ**
- 日付ラベル（MM-DD形式）を横軸に
- 各日のPV数を棒で表示、当日分は緑色、過去分は青色グラデーション
- 棒の上に数字ラベル（0の日は非表示）
- 高さは最大値に対する比率で計算

**右: アクセス国分布**
- 国旗絵文字（ISO country code → Unicode Regional Indicator変換）
- 国名 + プログレスバー + 数値
- 上位10カ国を表示
- 国旗はコードポイント `0x1F1E6 - 65` のオフセットで算出

モバイル（767px以下）では1カラムにスタック。

#### 4. 人気ページ TOP 10
- タグ風の横並びレイアウト（`flexWrap: wrap`）
- パス名（太字）+ PV数

#### 5. 検索・フィルター
- テキスト検索（メール、名前、楽器で検索）
- プランフィルター（All / Free / Student / Pro のボタン切り替え）

#### 6. ユーザーテーブル
テーブルのカラム（左から）:
1. **国** — 国旗絵文字（ホバーで国名・都市名ツールチップ）
2. **メール** — ユーザーのメールアドレス
3. **名前** — 表示名
4. **楽器** — 演奏楽器
5. **プラン** — Free/Student/Pro のカラーバッジ
6. **登録日** — YYYY-MM-DD 形式
7. **最終ログイン** — YYYY-MM-DD HH:MM 形式
8. **今月使用** — アプリごとの使用回数（タグ表示: `normalize: 3`, `declipper: 1` のように）
9. **操作** — プラン変更ドロップダウン（selectタグ、変更前に confirm ダイアログ）

#### 7. ページネーション
- 「← 前」「次 →」ボタン + 現在ページ / 総ページ数

---

## バックエンド API 設計

空音開発では Cloudflare Workers + KV をバックエンドとして使用している。
Curanz Sounds の技術スタックに合わせて適宜置き換えてほしい。

### 管理者用 API エンドポイント（3本）

#### GET `/api/auth/admin/users`
- 認証: JWT 必須 + オーナーメールチェック
- クエリパラメータ: `search`, `plan`, `page`, `limit`
- レスポンス:
```json
{
  "users": [
    {
      "email": "user@example.com",
      "name": "山田太郎",
      "instrument": "ピアノ",
      "region": "",
      "plan": "free",
      "badges": [],
      "createdAt": "2026-04-15T10:00:00Z",
      "lastLoginAt": "2026-04-19T08:30:00Z",
      "appUsage": { "normalize": 5, "declipper": 2 },
      "appUsageMonth": "2026-04",
      "country": "JP",
      "city": "Tokyo"
    }
  ],
  "stats": {
    "total": 150,
    "free": 120,
    "student": 20,
    "pro": 10,
    "filtered": 150
  },
  "page": 1,
  "totalPages": 3,
  "limit": 50
}
```

#### PUT `/api/auth/admin/plan`
- 認証: JWT 必須 + オーナーメールチェック
- ボディ: `{ "email": "user@example.com", "plan": "pro" }`
- 用途: ユーザーのプランを変更する

#### GET `/api/auth/admin/pageviews`
- 認証: JWT 必須 + オーナーメールチェック
- クエリパラメータ: `days`（デフォルト14）
- レスポンス:
```json
{
  "days": [
    {
      "date": "2026-04-19",
      "total": 45,
      "countries": { "JP": 30, "US": 10, "DE": 5 },
      "pages": { "/": 15, "/microphone": 12, "/audio-apps": 8 }
    }
  ],
  "summary": {
    "totalViews": 580,
    "countries": { "JP": 400, "US": 100, "DE": 80 },
    "topPages": [["/", 200], ["/microphone", 150], ["/audio-apps", 80]]
  }
}
```

### ページビュー記録の仕組み

空音開発では、各ページの `useEffect` で `/api/auth/pageview` に POST リクエストを送信している。
Worker 側で Cloudflare の `CF-IPCountry` ヘッダーから国コードを取得し、KV に日付別で集計。

KV キー設計:
- `pv:{YYYY-MM-DD}` → `{ total: number, countries: { [code]: number }, pages: { [path]: number } }`

Curanz Sounds でも同様の仕組みを導入すれば、アクセス解析がダッシュボードに統合される。
外部ツール（Google Analytics等）では得られない「自分だけのダッシュボード」感がモチベーションにつながる。

---

## フロントエンド実装のポイント

### 技術スタック（空音開発の場合）
- Next.js App Router（TypeScript）
- CSS-in-JS（インラインスタイル、Tailwind不使用）
- `'use client'` コンポーネント（全てクライアントサイド）

### デザイン原則
- 背景: `#f8fafc`（薄いグレー）
- カード: 白背景 + `border-radius: 12px` + `box-shadow: 0 1px 3px rgba(0,0,0,0.06)`
- フォント: `"Helvetica Neue", Arial, sans-serif`（数値・UI）/ 明朝体（ブランド名のみ）
- アクセントカラー: `#0284c7`（空音開発ブルー）
- テーブルは `overflowX: auto` でモバイル横スクロール対応

### 国旗絵文字の変換関数
```typescript
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return '';
  const offset = 0x1F1E6 - 65;
  return String.fromCodePoint(
    code.charCodeAt(0) + offset,
    code.charCodeAt(1) + offset
  );
}
```

### プランバッジのカラーリング
- Free: グレー背景（`#f1f5f9`）+ グレーテキスト（`#64748b`）
- Student: 青背景（`#dbeafe`）+ 青テキスト（`#1d4ed8`）
- Pro: 黄背景（`#fef3c7`）+ オレンジテキスト（`#d97706`）

---

## Curanz Sounds への適用ガイド

### 変更すべき点

1. **ブランド名** — 「空音開発」→「Curanz Sounds」/ 「クランツサウンズ」
2. **オーナーメール** — `369@kotaroasahina.com` はそのまま（同じオーナー）
3. **アクセントカラー** — Curanz Sounds のブランドカラーに合わせる
4. **ユーザー属性** — 空音開発は「楽器」だが、Curanz Sounds では「関心ジャンル」や「購入商品」など適切な属性に変更
5. **アプリ使用統計** — Curanz Sounds で提供しているサービス（試聴、ダウンロード等）に合わせる
6. **プラン体系** — Curanz Sounds のプラン名に合わせる

### 維持すべき点

1. **統計カードの6枚構成** — 一目で全体像を把握できるこのレイアウトは秀逸
2. **14日間棒グラフ** — 日々の成長が見える。これがモチベーションの源泉
3. **国旗絵文字付き国別分布** — 海外からのアクセスが可視化されると世界に広がっている実感が湧く
4. **人気ページ TOP 10** — どのコンテンツが刺さっているか一目瞭然
5. **ユーザーテーブルの一覧性** — 誰がいつ登録し、何を使っているかが全て見える

### 実装の優先順位

1. まずページビュー記録の仕組みを入れる（各ページから POST）
2. 管理 API を3本実装する
3. `/admin` ページを構築する
4. 国旗・プランバッジなどの装飾を追加する

---

## オーナーからのメッセージ

このダッシュボードは非常に気に入っています。毎日確認しており、
新規ユーザーが増えたり、海外からのアクセスがあったりすると、
次の開発のモチベーションが大きく上がります。

Curanz Sounds でも同様の体験を得たいので、
技術スタックの違いを考慮しつつ、同等の機能を実装してください。
デザインは空音開発に寄せてもらって構いません（一貫性があると嬉しい）。

---

*Generated: 2026-04-19*
