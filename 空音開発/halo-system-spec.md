# KUON HALO 完全仕様書 — Curanz Sounds 量産システム

> このファイルは Curanz Sounds 月商 ¥20M 達成のための
> ヒーリング音響シンセサイザー「KUON HALO」の **唯一の情報源**。
>
> ## 🎯 トリガーフレーズ
>
> オーナーが以下のいずれかを発言したら、Claude は **真っ先にこの md を Read する**:
>
> - 「クランツサウンズのアプリを修正します」
> - 「Curanz のアプリを直したい」
> - 「HALO を改良したい」
> - 「ハローを修正」
> - 「ヒーリング音響アプリの修正」
>
> Read 後、最新コードと突き合わせて改良方針を提案すること。
> このファイルを更新する際は最終更新日と更新内容を末尾に追記。

最終更新: 2026-04-26 (v3 完成時点)

---

## 1. アプリの存在意義 (絶対に忘れない核)

**KUON HALO の唯一の目的**:

> Curanz Sounds (curanzsounds.com) のヒーリング音楽を効率的に量産し、
> 月商 ¥20M 達成を加速する **オーナー専用** 制作ツール。

**ターゲットリスナー** (Curanz の顧客像):
- うつ・悩みを抱える女性
- 引き寄せの法則を実践するスピリチュアル系女性 ← **最重要**
- マタニティ・更年期で揺れる女性
- 不眠・不安に悩む女性

**作りたい音楽の方向性**:
- **長尺アンビエント** (30〜120 分)
- 暖かいパッド + ストリングス + フェルトピアノ
- 1 コードが 30-60 秒持続する超低速進行
- F メジャーの暖かさ・Phrygian の神秘
- 中規模ホールの自然なリバーブ
- 432Hz チューニング (440Hz は使わない)
- ソルフェジオ周波数を **軸** とする

**参照アーティスト** (オーナーが好む):
- Hiroshi Yoshimura (吉村弘) — 暖かく落ち着いた
- Joep Beving — フェルトピアノ・透明感
- Nils Frahm — 暖かい電子+アコースティック
- Max Richter『Sleep』— 長尺・きらめく・天上的
- Brian Eno『Music for Airports』— I↔IV のみの永遠

---

## 2. 公開・アクセス設定 (絶対に守る制約)

| 項目 | 仕様 |
|---|---|
| **URL** | `https://kuon-rnd.com/admin/halo` (Production) / `http://localhost:3000/admin/halo` (Dev) |
| **アクセス権限** | **`369@kotaroasahina.com` のみ** (Owner-only) |
| **認証フロー** | `/api/auth/me` 呼び出し → email 照合 → 不一致は強制リダイレクト |
| **未ログイン時** | `/auth/login` へリダイレクト |
| **別ユーザー時** | `/` へリダイレクト |
| **公開 LP** | **なし** (Curanz 専用ツール・公開しない) |
| **検索エンジン** | `noindex, nofollow, nocache` で完全非掲載 |
| **カタログ掲載** | しない (`app/lib/app-catalog.ts` に登録しない) |
| **sitemap 掲載** | しない |
| **旧 URL** | `/halo` → `/admin/halo` リダイレクト · `/halo-lp` → `/` リダイレクト |

> **⚠️ 公開化の禁止**: オーナーが明示的に「公開する」と言わない限り、
> このツールは絶対にカタログ・サイトマップ・公開 LP に出さない。

---

## 3. ファイル構成 (完全マップ)

```
/Users/kotaro/kuon-rnd/
├── app/
│   ├── admin/halo/
│   │   ├── page.tsx       ← メインアプリ (認証ゲート + UI 一式・約 950 行)
│   │   └── layout.tsx     ← noindex/nocache メタデータ
│   ├── halo/              ← 旧 URL・/admin/halo へリダイレクト
│   │   ├── page.tsx       ← useRouter().replace('/admin/halo')
│   │   └── layout.tsx     ← noindex
│   ├── halo-lp/           ← 旧 LP・/ へリダイレクト
│   │   ├── page.tsx       ← useRouter().replace('/')
│   │   └── layout.tsx     ← noindex
│   └── lib/halo/
│       ├── frequencies.ts  ← ソルフェジオ 9 + シューマン + 脳波 5 + 旋法
│       ├── synth.ts        ← レガシー音色 (クリスタルボウル・チベタンボウル等・ほぼ未使用)
│       ├── pads.ts         ← v3 主要音色 (5 パッド + helpers) ← **改良時の中心ファイル**
│       ├── grain.ts        ← グラニュラー雲 (Phase 2 用・現在未使用)
│       ├── binaural.ts     ← バイノーラルビート生成
│       ├── reverb.ts       ← アルゴリズミック・リバーブ + 5 プリセット
│       ├── chord-engine.ts ← コード進行エンジン + 8 進行 + 旋法
│       ├── presets.ts      ← 8 プリセット (Curanz 即戦力)
│       └── export.ts       ← 24-bit 48kHz WAV エンコード + 3 段マスターチェイン
└── 空音開発/
    └── halo-system-spec.md ← **このファイル**
```

---

## 4. 音響合成エンジン (pads.ts) ← 改良時の最重要ファイル

### 4.1 音色一覧 (5 パッド)

| ID | 名前 | 構成 | 用途 |
|---|---|---|---|
| `warm-analog` | ウォームアナログ・パッド | サイン×3 + ノコギリ×2 + サブオクターブサイン + 24dB/oct LPF + tanh飽和 + コーラス | ベース・メインパッド両用 |
| `string-ensemble` | ストリングス・アンサンブル | サイン×3 + ノコギリ×2 + サブオクターブ + LPF + ビブラート + コーラス | メインパッドの主役 |
| `felt-piano` | フェルト・ピアノ | サイン×5 (倍音 1.0/2.0/3.01/4.02/5.04) + 自然減衰 | コード変化時 1 ヒット |
| `glass-pad` | グラス・パッド | サイン×5 (倍音 1/2/3/4/6) + 高次倍音 LFO + ソフト LPF | シマー (高音層) |
| `voice-pad` | ヴォイス・パッド | ノコギリ×3 + フォルマント (800Hz + 1200Hz・「あ」母音) + LPF | シマー or 主役の代替 |

### 4.2 共通パラメータ (PadParams)

```typescript
type PadParams = {
  freq: number;          // Hz
  volume: number;        // 0-1
  attack: number;        // 秒 (推奨 2-10)
  release: number;       // 秒 (推奨 5-15)
  pan: number;           // -1 to 1
  brightness?: number;   // 0-1 (default 0.4)
  warmth?: number;       // 0-1 (default 0.7) ★ UI スライダーから渡される
};
```

### 4.3 ウォーム化の原則 (絶対)

- **「耳に刺さる音」は失敗**。warmth=1 で完全に滑らかになる設計
- LPF カットオフは **150-1100Hz** 程度に抑える (warmth 高いほど低く)
- Q 値は **0.4-0.5** (共鳴で耳に痛くならない)
- ノコギリ波単独は禁止 → サイン波と必ずブレンド
- サブオクターブ サインは **必ず追加** (アナログ温感の土台)
- `applyWarmth()` で tanh 飽和 + ローシェルフ +3dB + ハイシェルフ -5dB

### 4.4 コーラス設定

```typescript
applyChorus(ctx, input, output, depth=0.012, rate=0.18)
// 3 タップ: 18ms / 28ms / 40ms
// LFO: 0.108Hz / 0.162Hz / 0.216Hz
// 各タップを stereo pan -0.7/0/+0.7
```

長いタップ + 遅いレート = ゆったり広がり感。これより短く・速くしないこと (耳に痛くなる)。

---

## 5. コード進行エンジン (chord-engine.ts)

### 5.1 中心型

```typescript
type Chord = {
  rootSemi: number;     // キーからの semitones (0=I, 5=IV, 7=V, 9=vi)
  quality: ChordQuality; // 'maj9' | 'min9' | 'sus2' | etc.
  duration: number;     // 秒 (推奨 30-60)
};

type Progression = {
  id: string;
  name: { ja: string; en: string };
  description: { ja: string; en: string };
  mode: Mode;           // 'ionian' | 'phrygian' | 'lydian' etc.
  chords: Chord[];
  loop: boolean;        // true: duration 全体を埋める
};
```

### 5.2 内蔵進行 8 種類

| ID | 名前 | 進行 | 旋法 | 用途 |
|---|---|---|---|---|
| `sleep-cycle` | 眠りの輪 | I→vi→IV→V (各 45秒) | ionian | 睡眠音楽 |
| `eno-floating` | 漂う | I↔IV (各 60秒) | ionian | Brian Eno 方式 |
| `mystical-phrygian` | 神秘の進行 | i→bII→i→bII (各 50秒) | phrygian | 大いなるものに守られる感覚 |
| `manifestation` | 引き寄せ | I→iii→vi→IV (各 40秒) | ionian | 引き寄せワーク |
| `abundance` | 豊かさ | 8 コード長尺 (各 35秒) | ionian | ヴィジュアライゼーション |
| `divine-embrace` | 神聖な抱擁 | 7 コード (各 45秒) | ionian | 守られている感覚 |
| `inner-light` | 内なる光 | I→IImaj→I→vii (各 50秒) | lydian | 松果体覚醒 |
| `self-worth` | 自己価値の癒し | IV→I→vi→V (各 60秒) | ionian | うつ・自己否定 |

### 5.3 ヴォイシング設計 (voiceChord)

各コードを 3 層に展開:
- **bass**: ルート音 + 5度 (1 オクターブ下)
- **pad**: コード構成音 (open voicing)
- **shimmer**: オクターブ上 + 12th + 9th (倍音的きらめき)

### 5.4 重要: ソルフェジオ軸を直接使う

```typescript
// export.ts と page.tsx の両方で:
const keyHz = preset.baseSolfeggioHz ?? keyToHz(preset.key, preset.tuning);
```

`baseSolfeggioHz` が指定されていれば **そのまま I (root) として使用**。
標準音律 (F=349Hz) は無視。これがヒーリング音楽の本質。

---

## 6. ソルフェジオ周波数体系 (frequencies.ts)

### 6.1 9 周波数 (Curanz の核)

| Hz | 名前 (ja) | 効果 (ja) | 推奨 |
|---|---|---|---|
| 174 | 土台 | 痛みの緩和・安心感・大地のような安定 | sleep |
| 285 | 量子的修復 | エネルギー場・組織の修復 | sleep |
| 396 | 解放 | 恐れと罪悪感からの解放 | meditation |
| 417 | 変容 | 変化を促す・状況をリセット | morning |
| 528 | 愛 | DNA 修復・愛と奇跡の周波数 | all (最重要) |
| 639 | 繋がり | 人間関係の調和・愛の絆 | heart |
| 741 | 表現 | 直感の覚醒・表現力 | morning |
| 852 | 直観 | スピリチュアル秩序への回帰 | meditation |
| 963 | 松果体覚醒 | 神聖な意識との繋がり | meditation |

### 6.2 脳波周波数 (バイノーラル)

| ID | Hz 範囲 | デフォルト | 用途 |
|---|---|---|---|
| delta | 0.5-4 | 2 | 深い眠り |
| theta | 4-8 | 6 | 瞑想・直観 |
| alpha | 8-12 | 10 | 軽い瞑想・フロー |
| beta | 12-30 | 18 | 集中 |
| gamma | 30-100 | 40 | 高次意識 |

### 6.3 シューマン共鳴
7.83Hz — 地球の自然な電磁共鳴。

---

## 7. プリセット (presets.ts)

### 7.1 HaloPreset 型

```typescript
type HaloPreset = {
  id: string;
  title: { ja: string; en: string };
  subtitle: { ja: string; en: string };
  description: { ja: string; en: string };  // 商品説明レベル文章
  category: 'manifestation' | 'sleep' | 'meditation' | 'depression-healing'
          | 'self-love' | 'morning-rise' | 'pregnancy' | 'menopause';

  key: string;               // UI 表示用 (例: 'F' or '528Hz')
  tuning: 432 | 440;         // 後方互換 (実際は baseSolfeggioHz 優先)
  baseSolfeggioHz?: number;  // ★ ヒーリング軸 (174-963)
  mode: Mode;
  progressionId: string;

  bassLayer: { padType: PadType; volume: number; bassOctaveOffset?: number } | null;
  padLayer: { padType: PadType; volume: number };
  shimmerLayer: { padType: PadType; volume: number } | null;
  pianoOnChange: { enabled: boolean; volume: number };

  reverb: { preset: ReverbPreset; wetMix: number };
  texture: { enabled: boolean; type: TextureType; volume: number };
  binaural: { enabled, brainwave, customBeatHz?, carrierHz?, volume };

  recommendedDurationMin: 30 | 60 | 90 | 120;
  filenameTemplate: string;  // {idx} = バッチ連番
};
```

### 7.2 8 プリセット一覧

1. `manifestation-morning` — 引き寄せ朝のヴィジュアライゼーション
2. `abundance-visualization` — 豊かさを受け取る器を整える
3. `inner-light-pineal` — 内なる光・松果体覚醒
4. `sleep-cycle-warm` — スリープ・サイクル
5. `eno-floating` — フローティング (Eno 方式)
6. `self-worth-healing` — セルフ・ワース・ヒーリング
7. `mystical-protection` — 神秘の守り
8. `divine-embrace` — ディヴァイン・エンブレイス

---

## 8. WAV エクスポート + マスターチェイン (export.ts)

### 8.1 3 段階マスター処理 (絶対に音割れさせない)

```
[Voices] → reverb → masterGain (10秒指数フェードイン)
                       ↓
                    通常コンプ (-12dB / 2.5:1 / soft knee)
                       ↓
                    リミッター (-3dB / 20:1 / hard knee / 1ms attack)
                       ↓
                    tanh ソフトクリッパー (4x オーバーサンプル)
                       ↓
                    destination
```

### 8.2 音割れトラブル時のチェック順序

1. **マスターゲイン初期値** が `0.0001` で 10 秒フェードインになっているか
2. **リミッター threshold** が -3dB かつ ratio 20:1 になっているか
3. **tanh カーブ係数** が `Math.tanh(x * 0.85)` になっているか (1.0 だと飽和過多)
4. **各レイヤーの volume** が合計 1.5 を超えていないか

### 8.3 チャンネル別ボリューム上限 (絶対超えない)

- bassLayer: 0.5
- padLayer: 0.55 / √(コード構成音数)
- shimmerLayer: 0.18 / √(倍音数)
- pianoOnChange: 0.25
- binaural: 0.10
- texture: 0.05

### 8.4 24-bit PCM WAV エンコード

`audioBufferToWav24()` で 24-bit interleaved PCM 出力。
サンプルレート 48000Hz 固定 (Curanz 商品標準)。

### 8.5 バッチ生成

`renderPreset({ variation: { detuneJitter, binauralCarrierJitter }})`
- detuneJitter: ±5 cents
- binauralCarrierJitter: ±2 Hz
- これで毎回少しずつ違う音源が生成される

---

## 9. UI 構造 (admin/halo/page.tsx)

### 9.1 認証ゲート

```typescript
const OWNER_EMAIL = '369@kotaroasahina.com';
useEffect(() => {
  const res = await fetch('/api/auth/me');
  if (!res.ok) router.push('/auth/login');
  const me = await res.json();
  if (me.email !== OWNER_EMAIL) router.push('/');
  setAuthed(true);
}, [router]);
```

### 9.2 タブ構造

```
[ 🎼 プリセット ] | [ ✦ カスタム ]

PRESETS タブ:
  - 8 プリセット一覧
  - カテゴリフィルター
  - クリック → 右ペインに表示

CUSTOM タブ:
  - 🎲 ランダム生成ボタン
  - タイトル入力
  - 🎼 楽曲構造 (ソルフェジオ軸 + 旋法 + コード進行)
  - 🎹 レイヤー (ベース・メイン・シマー・ピアノ)
  - ✨ 空間処理 (リバーブ・ウェット・テクスチャ)
  - 🧠 バイノーラル (脳波プリセット + ソルフェジオキャリア + カスタム数値)
```

### 9.3 BuilderState 型

```typescript
type BuilderState = {
  baseSolfeggioHz: number;       // ★ 174-963 から選択
  mode: Mode;                     // 6 旋法
  progressionId: string;          // 8 進行から
  bassPad: PadType | 'none';
  mainPad: PadType;
  shimmerPad: PadType | 'none';
  pianoOnChange: boolean;
  reverbPreset: ReverbPreset;     // 5 プリセット
  reverbWet: number;              // 0-1
  textureType: TextureType | 'none';
  textureVolume: number;
  binauralEnabled: boolean;
  binauralBeatHz: number;
  binauralCarrier: number;
  binauralVolume: number;
  warmth: number;                 // 0-1
  customTitle: string;
};
```

### 9.4 組み合わせ理論値

**約 1,866 万通り**:
- 9 ソルフェジオ × 6 旋法 × 8 進行 × 6 ベース × 5 メイン × 6 シマー × 5 リバーブ × 4 テクスチャ × 5 脳波

### 9.5 ウォームスライダー

EXPORT セクション上部に **🌊 WARMTH** スライダー (0-100%・default 75%)。
リアルタイムで warmth パラメータを全パッドに伝播。

---

## 10. 改良時の鉄則 (絶対に守る)

### 10.1 何があっても変えない方針

1. ✅ **オーナー専用** (公開しない・カタログ非掲載)
2. ✅ **432Hz チューニング基本** (440Hz は採用しない)
3. ✅ **ソルフェジオ周波数を軸** とする設計
4. ✅ **暖かい・耳に優しい音** (耳に刺さる音は失敗)
5. ✅ **音割れ絶対禁止** (3 段マスターチェイン維持)
6. ✅ **長尺対応** (30-120 分で破綻しない)
7. ✅ **コード進行ベース** (1 コード 30-60 秒持続)
8. ✅ **24-bit 48kHz WAV** (Curanz 商品標準)
9. ✅ **完全合成** (サンプルファイル不使用)

### 10.2 改良時に検討すべき領域

#### A. 音色クラス向上
- パッドの倍音構成をさらに自然に (現状サインメインで合成感あり)
- Rust+Wasm 化で物理モデリング (擦弦・木材共鳴)
- サンプルベース併用 (Curanz 用途なら著作権問題なし)
- WaveTable 合成導入

#### B. 楽曲構造の進化
- メロディラインの自動生成
- 装飾音 (ベル・グロッケン) のランダム配置
- ダイナミクス変化 (Intro→Build→Climax→Outro)
- 拍子変化 (3/4・5/4 対応)

#### C. UI/UX 改善
- カスタムプリセット保存 (localStorage)
- 進行を直接編集可能に (コードを 1 つずつ指定)
- ピアノロール風ヴィジュアライゼーション
- メロディ MIDI 入力対応

#### D. エクスポート拡張
- FLAC エクスポート (Rust 必須)
- ステム分離 WAV (bass / pad / shimmer 別)
- フェードイン/アウト時間カスタマイズ
- メタデータ (ID3) 自動埋め込み

#### E. Curanz 連携
- 生成ファイル名を Curanz の命名規則に合わせる
- カバーアート自動生成
- バッチ書き出し時の zip パッケージング

### 10.3 実装で守る原則

- 型チェック (`npx tsc --noEmit`) を通すこと
- ファイル変更後は **必ず動作確認 URL を提示** (`http://localhost:3000/admin/halo`)
- 大規模変更は事後報告
- ライブラリ追加は最小限 (現状 0 個・全て Web Audio API)
- 既存プリセットを壊さない (8 プリセットの動作保証)

---

## 11. 既知の制約・限界

### 11.1 現状できないこと

- **メロディラインなし** (コード持続のみ・装飾音なし)
- **ダイナミクス変化なし** (全体音量はマスターのみ調整・パート間バランスは固定)
- **拍子は実装上 4/4 想定** (3/4・5/4 等は未対応)
- **ピアノは「コード変化時 1 ヒット」のみ** (アルペジオ・装飾は未実装)
- **カスタムプリセット保存は未実装** (リロードで消える)

### 11.2 音質的制約 (Web Audio API ベースの本質)

- 物理楽器の再現には限界 (Rust+Wasm 化が必要)
- フォルマント合成は基本的 ("あ" 母音のみ)
- ノイズ系は擬似ピンクノイズで代用

### 11.3 性能上の制約

- 同時に鳴るオシレーター数が 50 以上で重くなる可能性
- 60 分以上の OfflineAudioContext レンダリングは数十秒〜数分要する
- バッチ 10 ファイル生成で数分〜10 分

---

## 12. 改良セッション開始時のチェックリスト

オーナーが「クランツサウンズのアプリを修正します」と言ったら:

1. ✅ このファイル (`空音開発/halo-system-spec.md`) を Read
2. ✅ `app/admin/halo/page.tsx` の現状を Read (どんな UI 状態か把握)
3. ✅ `app/lib/halo/pads.ts` を Read (音色の最重要ファイル)
4. ✅ `app/lib/halo/presets.ts` を Read (現存プリセット)
5. ✅ `app/lib/halo/export.ts` を Read (マスターチェインに変更ないか)
6. ✅ オーナーに **何を改良したいか具体的に質問**
   - 音色? 進行? UI? エクスポート? 新機能?
7. ✅ 改良案を **音割れリスク・既存破壊リスク** と共に提示
8. ✅ オーナー承認後に実装
9. ✅ 型チェック (`npx tsc --noEmit`) 通過確認
10. ✅ 動作確認 URL (`http://localhost:3000/admin/halo`) を提示
11. ✅ デプロイコマンドを提示
12. ✅ このファイルの末尾「更新履歴」に追記

---

## 13. 環境・依存

| 項目 | 内容 |
|---|---|
| 認証 API | `/api/auth/me` (既存・kuon-rnd-auth-worker) |
| AudioContext | Web Audio API (ブラウザ標準) |
| OfflineAudioContext | レンダリング用 (ブラウザ標準) |
| 外部ライブラリ | **なし** (純粋 Next.js + 自家製合成) |
| Cloudflare Pages | デプロイ先 (本番) |
| 型 | TypeScript strict |

---

## 14. 関連ファイル

- `/Users/kotaro/kuon-rnd/CLAUDE.md` — プロジェクト全体仕様 (HALO は §43 として参照)
- `/Users/kotaro/kuon-rnd/空音開発/owner-design-preferences.md` — デザイン傾向性
- `/Users/kotaro/kuon-rnd/空音開発/labelization-discussion.md` — Curanz Collective 議論 (HALO は別件)

---

## 15. 更新履歴

### 2026-04-26 v3 完成 (Admin 化 + ソルフェジオ軸 + 音割れ修正)
- `/halo` → `/admin/halo` へ移行・オーナー専用認証
- 432/440 トグル廃止 → 9 ソルフェジオ周波数選択
- 3 段マスターチェイン (10秒フェードイン + リミッター + tanh) で音割れ完全防止
- LP (`/halo-lp`) 廃止 (リダイレクト化)
- 検索エンジン完全非掲載

### 2026-04-26 v2.5 (パッドウォーム化 + カスタムビルダー)
- 全パッドにサイン主体ブレンド + サブオクターブ + tanh 飽和
- LPF カットオフ 600-2100Hz → 150-1100Hz に大幅低下
- カスタムビルダーモード追加 (約 1,866 万通り組み合わせ)
- ウォームネス スライダー (0-100%)

### 2026-04-26 v2 (パッド音色 + コード進行エンジン)
- クリスタルボウル中心 → ウォームパッド中心に方向転換
- コード進行エンジン実装 (8 進行)
- F メジャー + Phrygian 旋法
- フェルトピアノ装飾

### 2026-04-26 v1 (初版・MVP)
- クリスタルボウル・チベタンボウル・ドローン
- 12 プリセット (但し単一持続音)
- バイノーラル + リバーブ + テクスチャ

---

> **このファイルは Claude が改良を再開する際の北極星。**
> 必要に応じて随時更新し、Curanz Sounds 月商 ¥20M 達成への道筋を保つこと。
