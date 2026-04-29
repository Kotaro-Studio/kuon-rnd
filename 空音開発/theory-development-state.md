# KUON Music Theory Suite — 開発状況メモ

> **このファイルは開発中断・再開のための完全な引き継ぎ資料です。**
> 開発を再開する際は、まずこのファイルを読み、次に CLAUDE.md §47-§49 を確認してから着手してください。
>
> 最終更新: 2026-04-29 (M1-12 完成・LP 開講状態に切替後)

---

## 1. 一行サマリー

KUON Music Theory Suite は世界最高峰のオンライン音楽理論プラットフォームを目指す Kuon の中核プロダクト。553 レッスンのうち **3 レッスンが MVP として公開済み**、LP は開講状態 (CTA active)、見切り発車戦略でリリースしながら磨き続ける段階。

---

## 2. 現在の進捗 (2026-04-29 時点)

### 2.1 公開済みレッスン (5/553) — OMT v2 章順準拠

| ID | URL | タイトル | OMT v2 出典 | 状態 |
|---|---|---|---|---|
| **M0-01** | `/theory/m0/l01` | 音とは何か | Kuon オリジナル M0 (Pre-notational・OMT 範囲外) | ✅ 公開 (2026-04-29 再設計) |
| **M1-01** | `/theory/m1/l01` | 西洋音楽記譜法の導入 | Part I 第 1 章 (Introduction to Western Musical Notation, Chelsey Hamm) | ✅ 公開 |
| **M1-02** | `/theory/m1/l02` | 音符の記譜と五線 | Part I 第 2 章前半 (Notation of Notes, Staff, Placing Notes, Chelsey Hamm) | ✅ 公開 |
| **M1-40** | `/theory/m1/l40` | 三和音の基本形と転回形 | Part I 第 17+19 章 (Triads + Inversion) | ✅ MVP 公開 |
| **M4-01** | `/theory/m4/l01` | カデンツの種類 | Part IV 第 1 章 (Intro to Harmony, Cadences) | ✅ MVP 公開 |

### 2.1.1 M0 の新しいアイデンティティ (2026-04-29 確定)

M0 は「Pre-notational」(記譜以前) ブロック。OMT v2 と内容重複しないよう、譜面を一切扱わない 15 レッスン構成:

| # | タイトル | 内容 |
|---|---------|------|
| M0-01 | 音とは何か | 空気の振動・耳の仕組み・周波数と音色 ✅ 公開 |
| M0-02 | リズムを身体で感じる | 手拍子・歩く・呼吸 |
| M0-03 | 高さの直感 | 歌う・ハミング |
| M0-04 | 強弱と色合い | 体感的に |
| M0-05 | 速さの感覚 | テンポ・歩行・心拍 |
| M0-06 | 沈黙の役割 | 4'33" |
| M0-07 | メロディーとは | 単旋律 |
| M0-08 | ハーモニーとは | 同時音 |
| M0-09 | 楽器の家族 | 弦・管・打・鍵盤 |
| M0-10 | 声の仕組み | 声帯・共鳴・息 |
| M0-11 | 世界の音楽システム | 西洋・インド・中国・アフリカ |
| M0-12 | 音楽史の地図 | 古代〜近現代 |
| M0-13 | 音楽と感情 | 心を動かす理由 |
| M0-14 | 音楽と数学 | 倍音・整数比 |
| M0-15 | 楽典への橋渡し | M1 への導入 |

戦略意義: 「音楽は気になるが楽典は怖い」層 (世界数千万人規模) を取り込む唯一の入口。CLAUDE.md §47.2 に明記済み。

### 2.2 公開済みインフラ

| URL | 役割 | 状態 |
|---|---|---|
| `/theory-lp` | 公開 LP (200+ keywords, JSON-LD × 3, 6 言語) | ✅ 開講中 (CTA active) |
| `/theory` | 総合ハブ (Norton Critical Edition 型 16 モジュール目次) | ✅ 公開 |
| `/theory/m{N}/l{K}` | 個別レッスン (3 つ稼働中) | ✅ |

### 2.3 ハブの状態

3 モジュールが「受講可能 →」状態:
- **M0 Foundation** (1/15 レッスン公開) ← l01
- **M1 Foundation** (1/60 レッスン公開) ← l12
- **M4 Intermediate** (1/55 レッスン公開) ← l04

残り 13 モジュール (M2, M3, M5-M15) は「準備中」。

### 2.4 残り作業

- **550 レッスンの量産** (テンプレート確立済み・コンテンツを埋めるだけ)
- **M0-01 / M4-04 への遡及適用** (タイポグラフィ原則 A: 「。」ごと改行、原則 B: 学術的精密性 + 前方参照)
- **M1 内の音程レッスンの新設** (M1-12 から「音程の種類」を前方参照しているため、近いうちに作る必要あり)
- 診断テスト (placeholder のまま・Phase 2)
- FSRS フラッシュカードエンジン (placeholder のまま・Phase 2)
- スキルツリー UI 強化 (現状はカード型・Phase 2)
- 進捗ダッシュボード本実装 (現状は静的・Phase 2)

---

## 3. 確立した設計パターン (再利用テンプレート)

### 3.0 タイポグラフィの 2 つの絶対原則 (2026-04-29 後段で確定)

#### 原則 A: 「。」ごとに改行する

Layer 1 の本文は「。」で改行し、テンポ良く読めるようにする。実装は:

```tsx
<p style={{ margin: '0 0 1.6rem 0', whiteSpace: 'pre-line' as const }}>
  {t({
    ja: `第一文。
第二文。
第三文。`,
    ...
  }, lang)}
</p>
```

`whiteSpace: 'pre-line'` を style に追加し、文字列にバックティック (テンプレートリテラル) で `\n` を入れる。
6 言語すべてに適用 (英語・スペイン語等でも sentence-per-line で読みやすい)。

**M1-12 では 2026-04-29 後段で適用済み。M0-01 / M4-04 にも次回適用するべき。**

#### 原則 B: 学術的精密性 + 前方参照

Kuon は世界最高峰の楽典スクールを名乗る以上、用語の精密さを犠牲にしない。
ただし学習者が圧倒されないよう、「正確な定義 → 後のレッスンで詳しく」という構造を取る。

例 (M1-12 三和音の物語パラグラフ 1):

> ❌ 旧: 「3 度ずつ重ねた 3 つの音」
> ✅ 新: 「3 度ずつ重ねた 3 つの音 — 正確には、長三和音は『長 3 度 + 短 3 度』、短三和音は『短 3 度 + 長 3 度』の積み重ねで...」

Layer 1 の末尾に `<aside>` で前方参照ノートを挿入:

```tsx
<aside style={{
  marginTop: 'clamp(1.5rem, 3vw, 2rem)',
  padding: 'clamp(0.9rem, 2vw, 1.2rem) clamp(1.1rem, 2.5vw, 1.5rem)',
  background: PAPER_DEEP,
  border: `1px solid ${STAFF_LINE_COLOR}`,
  borderLeft: `2px solid ${ACCENT_INDIGO}`,
  borderRadius: 4,
  fontFamily: serif,
  fontSize: '0.88rem',
  ...
}}>
  ※ 長 3 度・短 3 度の精密分類は M1 の「音程の種類」レッスンで詳しく扱います (近日公開)。
  本レッスンでは「3 度ずつ重ねた響き」のレベルで先に進みます。
</aside>
```

このパターンにより、学術的精密性とアクセシビリティを両立できる。

### 3.1 レッスンの 3 レイヤー構造

```
Layer 1: Story (理解)
  - 明朝で組まれた 3 段落エッセイ (300-500 字)
  - 「なぜこの概念が重要か」を物語として
  - 必ず最終段落で §49 哲学に接続 (「正解は一つではない」)
  - Pyodide ロード中も完全に読める設計

Layer 2: Living Score (観察 + 実技 + 聴く)
  - 本物の楽曲・楽譜と対話する
  - Gallery Mode (並列表示・聴き比べ) + Quiz Mode (聴いて識別)
  - Web Audio API で 4 声体和音を再生 (triangle + sine, organ-like)
  - SVG staff with Bravura SMuFL ト音記号 (U+E050) / バス記号 (U+E062)
  - §49 フィードバック (定番の答えは X / Bach は Y を選んだ / あなたの選択も成立する)

Layer 3: Memory (理解度確認)
  - 5 枚のフラッシュカード (クリックでフリップ)
  - Phase 2 で FSRS (Free Spaced Repetition Scheduler) 実装予定
  - 現状は placeholder
```

### 3.2 ファイル構造

```
app/theory/
  page.tsx              # 総合ハブ (Norton Critical Edition 型)
  layout.tsx            # メタデータ (canonical, OG)

  m{N}/
    l{K}/
      page.tsx          # レッスン本体
      layout.tsx        # レッスン専用メタデータ
```

### 3.3 全レッスンに共通する要素

各レッスン page.tsx に必ず含めるもの:

1. **'use client' 宣言**
2. **Pyodide global type 宣言** (window.loadPyodide, __kuonPyodide)
3. **色彩定数** (INK, INK_SOFT, INK_FAINT, PAPER, PAPER_DEEP, STAFF_LINE_COLOR, ACCENT_INDIGO, ACCENT_GOLD)
4. **フォント定数** (serif = Shippori Mincho, sans = Helvetica Neue, mono = SF Mono)
5. **L6 type と t() ヘルパー** (6 言語対応)
6. **Bravura font 自動ロード useEffect** (`@font-face` を style タグで動的注入)
7. **Pyodide background load useEffect** (CDN から v0.29.3, 失敗してもアプリは動く)
8. **3 層構造** (Layer 1 / Layer 2 / Layer 3)
9. **関連ツールセクション** (Kuon の他アプリへの導線)
10. **Footer nav** (目次へ戻るリンク)

### 3.4 共通サブコンポーネント (各レッスンで再利用)

- `LayerLabel({ num, name })` — I / II / III の見出し
- `PyodideBadge({ state, lang })` — ロード状態を控えめに表示
- `PulseDot()` — ロード中のアニメーション点
- `ModeButton({ active, onClick, label })` — モード切替ボタン
- `FlashcardItem({ card, lang })` — Layer 3 のカード
- `RelatedTool({ href, title, desc })` — 関連ツールリンクカード
- `GrandStaffCadence` / `GrandStaffTriad` — SVG 楽譜 (各レッスンでカスタマイズ)

### 3.5 必須ヘルパー関数

```typescript
// MIDI → 周波数
const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// MIDI → 譜表上の Y 座標 (treble clef)
function diatonicStep(midi: number): number {
  const octave = Math.floor(midi / 12);
  const pc = midi % 12;
  const map: Record<number, number> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
  return octave * 7 + (map[pc] ?? 0);
}

// Web Audio で 4 声体和音 (triangle + sine, organ-like)
function playChord(voices: number[], duration = 1.6) {
  // 実装は m1/l12 や m4/l04 を参照
}
```

---

## 4. 鉄の掟 (絶対遵守)

### 4.1 CLAUDE.md §45 — 教師経由学生クーポン制度の機密 (最優先)

公開ファイル (LP, FAQ, JSON-LD, OGP, ホームページ等) で以下に絶対言及しない:
- 教師は Symphony 永久無償
- 学生は教師経由クーポンで初月 50% + 12 ヶ月 30% off
- STUDENT_30_12MO の存在
- /for-teachers の URL やパスワード

OK な公開言及: HALF50 (公開キャンペーン)、年額プラン 2 ヶ月分お得、Prelude プランの存在。

### 4.2 CLAUDE.md §49 — 創業者の創作哲学 (Theory 全体の DNA)

**「正解」と「不正解」の二項対立を排する。**

許可される表現:
- 「定番の答えは X です」
- 「入試では Y が期待されます」
- 「Bach は Z を選びました — その理由は…」
- 「あなたの選択 W も成立する音楽です」
- 「この場面での選択肢は複数あります」

**絶対禁止:**
- 「不正解」「間違い」「ダメ」「違います」「正しくありません」
- 学習者の選択を否定する表現
- 「これしかない」「正解は X だけ」式の単一解答主義

### 4.2.5 CLAUDE.md §51 — 西洋五線譜記述の絶対正確性 (新)

**Unicode 文字 (𝄞 ♩ ♪ 等) や Bravura グリフ単独で旋律を表現することは絶対に禁止。**

代わりに必ず以下のいずれか:
- SVG による真の五線譜 (5 線・clef・加線・楕円符頭)
- OSMD による MusicXML レンダリング
- Bravura SMuFL 単独グリフは音部記号・臨時記号など単一記号のみ

§45 / §49 と同等の最重要ルール。違反は即時修正対象。詳細は CLAUDE.md §51 参照。

### 4.3 CLAUDE.md §48 — 余白の知性

- マスコット・キャラクター禁止
- 感嘆符・派手な祝賀演出禁止 (「Awesome!!!」「Great Job!」禁止)
- 子供っぽいイラスト禁止
- Mincho 主体・Helvetica 補助
- Apple Music / Linear / Notion / iA Writer 級の品位
- 静寂と余白を大切にする

---

## 5. 戦略的文脈 (ルータイス・コーチング観点)

### 5.1 確定した目標構造

| ゴール種別 | 推奨設定 | 確率 (24-36ヶ月) | 役割 |
|---|---|---|---|
| **コーチング・ゴール** (現状の外) | ¥18M MRR / 100 万人 | 5-15% | 自己像書き換えのエンジン |
| **マイルストーン** (現状の上端) | ¥5M MRR | 45-65% | 進捗確認・キャッシュフロー安定 |
| **足元の実行目標** (現状の内) | ¥3M MRR | 高 | 月次オペレーション基準 |

### 5.2 ¥18M MRR 達成に必要な 5 つの自己像転換

1. ソロクリエイター → プラットフォーム経営者
2. プロダクトを作る人 → 流通を設計する人
3. 日本のニッチ職人 → グローバル教育プラットフォーム創業者
4. 自分の作品を売る → 朝比奈幸太郎という名前をマーケティング資産に
5. キャッシュフロー経営 → 投資的判断

### 5.3 確率を押し上げる主要レバー (現時点)

1. **教師経由学生コードのセルフサーブ化** — CAC = 0 の永久流入
2. **コンテンツクリエイター道具化** (§46.4) — Adobe / Loom モデル
3. **OMT 学術コミュニティへの参画** — Mark Gotham 教授に直接コンタクト

### 5.4 現在地の正確なマップ

「**プロダクトはほぼ完成、流通はゼロ近傍**」の橋頭堡。
必要条件 (CLAUDE.md / 30+ アプリ / サブスク基盤 / 多言語) はほぼ完了。
欠けているのは十分条件 (上記 5 つの自己像転換) のみ。

---

## 6. レッスン量産の優先順位 (議論待ち)

オーナーは「**基礎編から完成させる**」方針を明示。次の選択肢から決定する必要あり:

### 選択肢 A: M0 残り 14 レッスン優先
**M0「音楽との最初の出会い」(完全初心者向け)**
- l02 リズムと拍 (Beat & Rhythm)
- l03 拍子記号 (Time Signatures)
- l04 音符の長さ (Note Values)
- l05 休符 (Rests)
- l06 タイとスラー
- l07 付点音符・三連符
- l08 音名 (西洋・日本・固定ド)
- l09 半音と全音
- l10 シャープ・フラット・ナチュラル
- l11 オクターブと音域
- l12 ヘ音記号 (Bass Clef)
- l13 ハ音記号 (C Clef)
- l14 ピアノ鍵盤
- l15 譜面の読み方総合

**メリット**: 入口が広がる、初心者の流入を捉えられる、最も SEO に効きやすい
**デメリット**: 上級者の興味を引きにくい

### 選択肢 B: M1 残り 59 レッスン優先
**M1「楽典基礎」(音大入試レベル)**
- 音程・音階・三和音・七の和音・ローマ数字・SATB

**メリット**: 音大受験対策・音楽学生の心を掴む、Bach コラール解析の前提を完成させる
**デメリット**: 初心者を取りこぼす可能性

### 選択肢 C: M11 (コールユーブンゲン世界初インタラクティブ化) を先行
**M11「コールユーブンゲンと聴音」(90 レッスン・最大の差別化要素)**

**メリット**: 世界に存在しないものを作る、決定的な差別化、音大予備校市場を独占できる
**デメリット**: マイク+ピッチ検出の技術実装が重い、量産より深掘り型

### 選択肢 D: ハイブリッド
**M0 を主軸にしながら M11 の最初の数レッスンを先行公開**

**推奨**: 選択肢 D。M0 で広く受け入れ、M11 で「これは普通じゃない」と認知させる。

→ **次回オーナーに確認すべき**。

---

## 7. 技術的参照

### 7.1 重要なライブラリ・API

| 用途 | 採用技術 | 理由 |
|---|---|---|
| 楽譜描画 (個別音符) | カスタム SVG | 完全制御・軽量 |
| 楽譜描画 (楽曲全体) | OpenSheetMusicDisplay (OSMD) + MusicXML | 既存 /classical で実証済み |
| 音楽記号フォント | Bravura (SMuFL, SIL OFL 1.1) 自ホスト | 247KB, /public/fonts/Bravura.woff2 |
| 音再生 | Web Audio API (生 OscillatorNode) | 軽量・依存ゼロ・3 layer 構成と相性良 |
| Python 環境 | Pyodide v0.29.3 (CDN) | music21 を browser で動かす |
| 音楽分析 | music21 (MIT) | 業界標準・600+ 曲 corpus 内蔵 |
| 多言語化 | useLang() + L6 type | 既存パターン |
| FSRS (将来) | ts-fsrs npm package | 科学的間隔反復 |

### 7.2 Pyodide ロードパターン (確立済み)

```typescript
// 失敗してもアプリは止まらない設計
useEffect(() => {
  if (startedRef.current) return;
  startedRef.current = true;

  if (window.__kuonPyodide) {
    setPyodideState('ready');
    return;
  }

  setPyodideState('loading');
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js';
  script.async = true;
  script.onload = async () => {
    try {
      const pyodide = await window.loadPyodide!({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/'
      });
      window.__kuonPyodide = pyodide;
      setPyodideState('ready');
    } catch {
      setPyodideState('failed');
    }
  };
  script.onerror = () => setPyodideState('failed');
  document.head.appendChild(script);
}, []);
```

### 7.3 Bravura font 動的注入

```typescript
useEffect(() => {
  if (typeof document === 'undefined') return;
  const styleId = 'kuon-bravura-face';
  if (!document.getElementById(styleId)) {
    const s = document.createElement('style');
    s.id = styleId;
    s.textContent = `@font-face {
      font-family: 'Bravura';
      src: url('/fonts/Bravura.woff2') format('woff2');
      font-display: swap;
    }`;
    document.head.appendChild(s);
  }
}, []);
```

SMuFL コードポイント:
- ト音記号: `U+E050` (`` / `String.fromCodePoint(0xE050)`)
- バス記号: `U+E062`
- ハ音記号 (アルト/テナー): `U+E05C`
- フラット: `U+E260`
- シャープ: `U+E262`
- ナチュラル: `U+E261`

### 7.4 デザイントークン

```typescript
const INK = '#1a1a1a';            // 墨 (主テキスト)
const INK_SOFT = '#475569';        // やわらかい墨 (副テキスト)
const INK_FAINT = '#94a3b8';       // 薄い墨 (ラベル)
const PAPER = '#fafaf7';           // 和紙 (背景)
const PAPER_DEEP = '#f5f4ed';      // 深い和紙 (副背景)
const STAFF_LINE_COLOR = '#d4d0c4'; // 譜表線色 (区切り線にも使用)
const ACCENT_INDIGO = '#3a3a5e';    // 藍墨 (リンク)
const ACCENT_GOLD = '#9c7c3a';      // 茶金 (アクセント・引用枠)

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace';
```

### 7.5 OMT v2 教科書参照

骨格として使用しているテキスト:
- **タイトル**: Open Music Theory v2
- **著者**: Mark Gotham (Cambridge), Megan Lavengood (GMU), Brian Jarvis, Chelsey Hamm, Bryn Hughes, Kyle Gullings, John Peterson
- **ライセンス**: CC BY-SA 4.0
- **オーナー手元のローカルパス**: `/Volumes/ASAHINA/OPEN-MUSIC-THEORY-1688414869.pdf`
- **Kuon 改変版の公開予定**: GitHub `kuon-music-theory-curriculum` リポジトリ (CC BY-SA 4.0)

各レッスンの Layer 1 は OMT v2 の該当章を骨格にしつつ、§49 哲学で語り直す。

---

## 8. レッスン量産プロセス (1 レッスンあたりの作業フロー)

新レッスンを 1 つ作るのに必要な作業 (テンプレート完成済みのため約 30-60 分):

1. **OMT v2 該当章の確認** (オーナーが PDF 参照、Claude が骨格を提案)
2. **データ定義** (例: 音符ペア、和音、リズムパターン等)
3. **Layer 1 エッセイ作成** (3 段落・6 言語・最後は §49 接続)
4. **Layer 2 設計** (Gallery / Quiz / Free Play 等のモード)
5. **SVG 楽譜定義** (m0/l01 や m4/l04 のパターンを再利用)
6. **Web Audio 再生関数** (パターン再利用)
7. **Layer 3 フラッシュカード作成** (5 枚・6 言語)
8. **関連ツールリンク** (該当アプリを 3 つ)
9. **layout.tsx 作成** (タイトル・description・canonical)
10. **ハブの availableLessons に追加**
11. **sitemap.ts に登録**
12. **型チェック** (`npx tsc --noEmit`)
13. **git commit + push**

---

## 9. 開発再開時のチェックリスト

オーナーが「開発再開」を指示したら、Claude は以下を順に実行:

### 9.1 状況把握 (必ず最初に)

- [ ] このファイル (`空音開発/theory-development-state.md`) を読む
- [ ] CLAUDE.md §45, §47, §48, §49 を確認
- [ ] 直近のコミット履歴を確認: `git log --oneline -20`
- [ ] 公開済みレッスン 3 つの URL を確認

### 9.2 オーナーへの質問 (必須)

開発再開時、Claude は以下をオーナーに質問する:

1. 「次に作るレッスンの優先順位は決まりましたか? (M0 残り / M1 残り / M11 / ハイブリッド)」
2. 「公開済みの 3 レッスンに何か修正点はありましたか?」
3. 「新しい戦略的決定 (例: §47 ロードマップの変更) はありましたか?」

### 9.3 着手前の確認

- [ ] 該当モジュールの OMT v2 該当章をオーナーに確認
- [ ] 1 レッスンあたりの Living Score モード設計を Claude が提案・オーナーが承認
- [ ] 量産モードに入る場合、最初の 3-5 レッスンは慎重にレビュー

---

## 10. 重要な意思決定の履歴

### 2026-04-29 のセッションで確定したこと

| 番号 | 決定事項 | 根拠 |
|---|---|---|
| 1 | レッスン時間 15-25 分 | 日次習慣に最適 |
| 2 | Bach を中心軸に | 初心者から専門家まで全層に通じる |
| 3 | 完全自由探索 | 上級者を退屈させない (英語学習アプリの教訓) |
| 4 | 「あなたの選択も成立する」式フィードバック | §49 朝比奈幸太郎ポリシー |
| 5 | ルールベース AI チューター (まずは) | コスト + §49 整合性 |
| 6 | Layer 1 を読みながら Pyodide 裏ロード | プログラマー的設計思想 |
| 7 | MVP 3 レッスン (M0-01, M1-12, M4-04) で実証 | Living Score の力を証明 |
| 8 | 楽譜描写は美しく正確に | 第一優先 |
| 9 | 革新的 UI、女性アーティスト含む全層への配慮 | Norton Critical Edition 路線で実装 |
| 10 | IQ180 視点の改善は事後報告 | 議論コスト最小化 |
| 11 | ハブ → 個別レッスンの hub-and-spoke | 全レッスン固定 URL でいつでも復習可 |
| 12 | LP CTA 開講状態 + MVP バッジ | 見切り発車・誠実な期待設定 |
| 13 | 「。」ごとに改行する (`whiteSpace: pre-line` + `\n`) | テンポ良く読める Mincho プロース体験 |
| 14 | 学術的精密性 + `<aside>` による前方参照 | 世界最高峰楽典スクール標準 + 学習者への配慮 |
| 15 | M0-01 / M4-04 にも 13・14 を遡及適用すべき | 全レッスンの一貫性 (次回タスク) |
| 16 | OMT v2 PDF を読み、レッスン番号を章順に再番号化 | M1-12→M1-40、M4-04→M4-01。世界一の楽典スクールには TOC 完全準拠が必須 |
| 17 | OMT v2 PDF を `空音開発/OPEN-MUSIC-THEORY-v2.pdf` に永久保存 | 今後すべてのレッスン執筆前に該当章を直接参照する |
| 18 | **CLAUDE.md §51 五線譜正確性ルール追加 (絶対遵守)** | Unicode 文字で旋律を表現するのは禁止・必ず SVG/OSMD で本物の五線譜を描画。M1-01 違反を発見し即修正 |
| 19 | ハブの ModuleCard を「公開済みレッスン一覧」式に改修 | 各モジュール内の全公開レッスンを直接クリック可能に。M1-02 が見えなかったバグ解消 |
| 20 | ヘッダーに「音楽理論学習コース」「音楽研究室」追加 | 3 大プロダクト構造 (アプリ / 理論コース / 研究室) を顧客に明示 |
| 21 | `/for-schools` 廃止 (リダイレクト化) | 機能していなかったため。フッター・サイトマップから削除 |

---

## 11. このプロジェクトのビジョン (再確認)

**KUON Music Theory Suite は、世界に存在しなかった「現代的 UI + ブラウザネイティブ + 多言語 + 月額サブスク + 楽典基礎から音大卒業レベルまでの完全カリキュラム + ゲーミフィケーション + SRS + SNS 映え + プロ音楽家への敬意」を 1 つにまとめた製品**である。

これは Auralia / EarMaster / musictheory.net / Yousician / Tonara / MuseScore / Flat.io / YouTube のいずれもが実現できなかった空白市場を埋める。

ターゲットは **「真剣な大人のアマチュア音楽家」(数千万人規模・隠れた巨大市場)** + **音大生・音楽志望者** + **プロのフリーランス音楽家**。

100 万人ユーザー到達確率は 5-15% (5-7 年)。これはルータイス的に正しいストレッチゾーンであり、達成のためには 5 つの自己像転換が必要 (§5.2)。

短期マイルストーンは ¥5M MRR (24 ヶ月以内・確率 45-65%)。これは現状の延長で届く範囲。

---

## 11.5 OMT v2 完全マッピング (絶対遵守の TOC)

> **PDF: `空音開発/OPEN-MUSIC-THEORY-v2.pdf` (18MB) に永久保存済み**
> 著者: Mark Gotham (Cambridge), Megan Lavengood (GMU), Brian Jarvis, Chelsey Hamm, Bryn Hughes, Kyle Gullings, John Peterson — CC BY-SA 4.0
>
> **新レッスンを作る前に必ず PDF の該当章を確認すること。**

### Module ↔ OMT v2 Part 対応表

| Kuon Module | OMT v2 Part | レッスン数 |
|---|---|---|
| M0 (Kuon オリジナル) | — (OMT 前段・初心者導入) | 15 |
| M1 (Foundation) | **Part I** Fundamentals | 60 |
| M2 (Intermediate) | **Part II** Counterpoint and Galant Schemas | 35 |
| M3 (Intermediate) | **Part III** Form | 25 |
| M4 (Intermediate) | **Part IV** Diatonic Harmony, Tonicization, Modulation | 55 |
| M5 (Advanced) | **Part V** Chromaticism | 35 |
| M6 (Advanced) | **Part VI** Jazz | 35 |
| M7 (Advanced) | **Part VII** Popular Music | 30 |
| M8 (Graduate) | **Part VIII** 20th- and 21st-Century Techniques | 25 |
| M9 (Graduate) | **Part IX** Twelve-Tone Music | 18 |
| M10 (Advanced) | **Part X** Orchestration | 15 |
| M11 (Foundation) | Kuon オリジナル: Coleübungen + 聴音 | 90 |
| M12 (Intermediate) | Kuon オリジナル: ソルフェージュ + 視唱 | 70 |
| M13 (Advanced) | Kuon オリジナル: 音楽史と様式 | 20 |
| M14 (Graduate) | Kuon 拡張: 上級理論 (Schenker, Caplin, Riemann, microtonality) | 30 |
| M15 (Graduate) | Kuon オリジナル: 作曲実技 | 25 |

**合計: 553 レッスン**

### M1 (Part I Fundamentals) 60 レッスン詳細マッピング

OMT v2 Part I は 21 章。これを 60 レッスンに展開:

| OMT 章 | 章名 | Kuon レッスン番号 |
|---|---|---|
| 1 | Introduction to Western Musical Notation | M1-01 |
| 2 | Notation of Notes, Clefs, Ledger Lines | M1-02 〜 M1-04 |
| 3 | Reading Clefs (treble, bass, alto, tenor) | M1-05 〜 M1-06 |
| 4 | Keyboard and Grand Staff | M1-07 〜 M1-09 |
| 5 | Half Steps, Whole Steps, Accidentals | M1-10 〜 M1-11 |
| 6 | American Standard Pitch Notation (ASPN) | M1-12 |
| 7 | Other Aspects of Notation (dynamics, articulations, tempo) | M1-13 〜 M1-15 |
| 8 | Rhythmic and Rest Values | M1-16 〜 M1-18 |
| 9 | Simple Meter and Time Signatures | M1-19 〜 M1-21 |
| 10 | Compound Meter and Time Signatures | M1-22 〜 M1-23 |
| 11 | Other Rhythmic Essentials (borrowed div., hypermeter, syncopation) | M1-24 〜 M1-25 |
| 12 | Major Scales, Scale Degrees, Key Signatures | M1-26 〜 M1-28 |
| 13 | Minor Scales, Scale Degrees, Key Signatures | M1-29 〜 M1-31 |
| 14 | Diatonic Modes / Chromatic Scale | M1-32 〜 M1-33 |
| 15 | Sight-Singing and Dictation Basics | M1-34 |
| 16 | **Intervals** | M1-35 〜 M1-39 |
| 17 | **Triads** | **M1-40 〜 M1-42** ← 公開済み |
| 18 | Seventh Chords | M1-43 〜 M1-45 |
| 19 | **Inversion and Figured Bass** | **M1-46 〜 M1-49** ← M1-40 に統合済み |
| 20 | Roman Numerals and SATB Chord Construction | M1-50 〜 M1-57 |
| 21 | Texture (Mono/Hetero/Homo/Polyphony) | M1-58 〜 M1-60 |

### M4 (Part IV Diatonic Harmony) 55 レッスン詳細マッピング

| OMT 章 | 章名 | Kuon レッスン番号 |
|---|---|---|
| 1 | **Introduction to Harmony, Cadences, and Phrase Endings** | **M4-01** ← 公開済み |
| 2 | Strengthening Endings with V7 | M4-02 〜 M4-03 |
| 3 | Strengthening Endings with Strong Predominants | M4-04 〜 M4-05 |
| 4 | Embellishing Tones | M4-06 〜 M4-07 |
| 5 | Strengthening Endings with Cadential 6/4 | M4-08 〜 M4-09 |
| 6 | Prolonging Tonic with V6 and Inverted V7s | M4-10 〜 M4-12 |
| 7 | Performing Harmonic Analysis Using Phrase Model | M4-13 〜 M4-14 |
| 8 | Prolongation with Leading-Tone Chord | M4-15 〜 M4-17 |
| 9 | 6/4 Chords as Forms of Prolongation | M4-18 〜 M4-19 |
| 10 | Plagal Motion as a Form of Prolongation | M4-20 〜 M4-21 |
| 11 | La (Scale Degree 6) in the Bass | M4-22 〜 M4-24 |
| 12 | The Mediant Harmonizing Mi | M4-25 〜 M4-26 |
| 13 | Predominant Seventh Chords | M4-27 〜 M4-29 |
| 14 | Tonicization | M4-30 〜 M4-40 |
| 15 | Extended Tonicization and Modulation to Closely Related Keys | M4-41 〜 M4-55 |

### Part II (Counterpoint) 35 レッスン詳細

| OMT 章 | 章名 | Kuon レッスン番号 |
|---|---|---|
| 1 | Introduction to Species Counterpoint | M2-01 |
| 2 | First-Species Counterpoint | M2-02 〜 M2-04 |
| 3 | Second-Species Counterpoint | M2-05 〜 M2-07 |
| 4 | Third-Species Counterpoint | M2-08 〜 M2-10 |
| 5 | Fourth-Species Counterpoint | M2-11 〜 M2-13 |
| 6 | Fifth-Species Counterpoint | M2-14 〜 M2-16 |
| 7 | Gradus ad Parnassum Exercises | M2-17 〜 M2-19 |
| 8 | 16th-Century Contrapuntal Style | M2-20 〜 M2-22 |
| 9 | High Baroque Fugal Exposition | M2-23 〜 M2-26 |
| 10 | Ground Bass | M2-27 〜 M2-28 |
| 11 | Galant Schemas | M2-29 〜 M2-31 |
| 12 | Galant Schemas Summary | M2-32 |
| 13 | Sequences (Rule of Octave, Harmonizing Scale) | M2-33 〜 M2-35 |

### Part III (Form) 25 レッスン詳細

| OMT 章 | 章名 | Kuon レッスン番号 |
|---|---|---|
| 1 | Foundational Concepts for Phrase-Level Forms | M3-01 〜 M3-02 |
| 2 | The Phrase, Archetypes, and Unique Forms | M3-03 〜 M3-05 |
| 3 | Hybrid Phrase-Level Forms | M3-06 〜 M3-07 |
| 4 | Expansion and Contraction at the Phrase Level | M3-08 〜 M3-10 |
| 5 | Formal Sections in General | M3-11 〜 M3-13 |
| 6 | Binary Form | M3-14 〜 M3-16 |
| 7 | Ternary Form | M3-17 〜 M3-19 |
| 8 | Sonata Form | M3-20 〜 M3-23 |
| 9 | Rondo | M3-24 〜 M3-25 |

### Part V (Chromaticism) 35 レッスン詳細

| OMT 章 | 章名 | Kuon レッスン番号 |
|---|---|---|
| 1 | Modal Mixture | M5-01 〜 M5-04 |
| 2 | Neapolitan 6th (♭II6) | M5-05 〜 M5-06 |
| 3 | Augmented Sixth Chords | M5-07 〜 M5-09 |
| 4 | Common-Tone Chords (CT°7 & CT+6) | M5-10 〜 M5-12 |
| 5 | Harmonic Elision | M5-13 〜 M5-14 |
| 6 | Chromatic Modulation | M5-15 〜 M5-17 |
| 7 | Reinterpreting Diminished Seventh Chords | M5-18 〜 M5-19 |
| 8 | Augmented Options | M5-20 〜 M5-21 |
| 9 | Equal Divisions of the Octave | M5-22 〜 M5-23 |
| 10 | Chromatic Sequences (descending 5ths, asc 5-6, desc 5-6) | M5-24 〜 M5-26 |
| 11 | Parallel Chromatic Sequences | M5-27 〜 M5-28 |
| 12 | The Omnibus Progression | M5-29 〜 M5-30 |
| 13 | Altered and Extended Dominant Chords | M5-31 〜 M5-32 |
| 14 | Neo-Riemannian Triadic Progressions | M5-33 〜 M5-35 |

### Part VI-X 概略 (詳細は実装時に PDF 直接参照)

- **Part VI Jazz** (35 レッスン): Swing / Chord Symbols / Voicings / ii-V-I / Embellishing Chords / Substitutions / Chord-Scale Theory / Blues
- **Part VII Popular** (30 レッスン): Rhythm / Phrasing / Form / AABA / Verse-Chorus / Schemas (Blues/Four-Chord/Classical/Puff/Modal) / Pentatonic / Fragile Tonics
- **Part VIII 20th-21st Century** (25 レッスン): Pitch Class / Integer Notation / Set Theory / Set Class / Modes / Collections
- **Part IX Twelve-Tone** (18 レッスン): Basics / Naming / Row Properties / Webern Op. 21 & 24 / Composing
- **Part X Orchestration** (15 レッスン): Core Principles / Subtle Color Changes / Transcription from Piano

### M11-M15 Kuon オリジナル (詳細設計待ち)

実装着手時に章立てを決定:
- **M11 Coleübungen + 聴音** (90 レッスン) — コールユーブンゲン全 87 番 + 聴音種別
- **M12 Solfège + 視唱** (70 レッスン) — Pozzoli, Bona, Kodály, Hindemith
- **M13 Music History** (20 レッスン) — スタイル時代
- **M14 Advanced Theory** (30 レッスン) — Schenker, Caplin, Riemann, microtonality, spectralism
- **M15 Composition Practice** (25 レッスン) — Chorale, quartet, lied, miniature

---

## 12. 緊急参照 — もし全部忘れたら

このファイルを読み直す。さらに:

1. CLAUDE.md §47-§49 を読む
2. `app/theory/m0/l01/page.tsx` を読む (テンプレートの完成形)
3. `app/theory/m4/l04/page.tsx` を読む (Living Score の最高峰)
4. `app/theory-lp/page.tsx` を読む (戦略の全体像)

これだけで、開発を即座に再開できる。

---

最終確認: このメモを書いた時点で、型チェックは通過済み (exit 0)、3 レッスンが本番反映済み、LP は開講状態。次のアクションは「オーナーが開発再開を指示する」のみ。
