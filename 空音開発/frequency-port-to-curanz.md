# KUON FREQUENCY → Curanz Sounds 移植仕様書

> このドキュメントは、Curanz Sounds (curanzsounds.com) の AI セッションが
> KUON FREQUENCY のバイノーラルビート機能を Curanz の有料プラン機能として
> 移植する際の引き継ぎ資料です。
>
> 作成日: 2026-04-30
> 作成元: 空音開発 (kuon-rnd.com) AI セッション
> 移植元コード: /Users/kotaro/kuon-rnd/app/frequency/page.tsx
> 移植先: /Users/kotaro/curanz-sounds (別リポジトリ)

---

## 1. 移植の目的

Curanz Sounds の有料プラン (lifetime / business 等) のユーザー向けに、
**ブラウザ完結・ファイルなしの周波数プレーヤー機能**を追加する。

特にバイノーラルビート機能は Curanz の「ヒーリングオーディオ」ブランドと完全に整合し、
既存商品 (432Hz クラシカル睡眠音楽 / ピュアトーン・ソルフェジオセット / 528Hz バイタリティ)
との相互補強関係を作れる。

**販売形式の想定**:
- 有料会員専用ページ (例: curanzsounds.com/members/frequency-tool)
- 既存商品 (買切ダウンロード) との抱き合わせ訴求
- 単体サブスク機能としても展開可能

---

## 2. KUON FREQUENCY の機能概要

### 2.1 9 つのソルフェジオ周波数 + 432Hz

| Hz | 効果 | 推奨シーン |
|---|---|---|
| 174 | 基盤・安心感 | 長旅の前・心の整え |
| 285 | 組織再生・修復 | 練習後のクールダウン |
| 396 | 罪悪感・恐怖の解放 | 本番後の自己批判リセット |
| 417 | 変化を促す | 新曲に取り組む前 |
| **432** | 自然調和・深い集中 | 練習開始時の集中導入 (デフォルト) |
| 528 | 愛・修復・DNA 修復 | 本番直前のメンタルリセット |
| 639 | 人間関係・調和 | アンサンブル前・共演前 |
| 741 | 表現力・自由 | ソロ演奏・即興前 |
| 852 | 直感・スピリチュアル | 即興演奏・創作活動 |
| 963 | 一体感・覚醒 | 深い瞑想・宇宙との繋がり |

> **Curanz 移植時の注意**: シーン文言は Kuon が「音楽家向け」に書いたもの。
> Curanz では「ヒーリング・睡眠・瞑想・ヨガ」文脈に書き換えること。
> 例: 「練習後のクールダウン」 → 「ヨガ後のシャバアーサナ」「就寝前の入眠儀式」

### 2.2 バイノーラルビート機能 (核心機能)

**仕組み**: 左耳と右耳に異なる周波数を流し、その差分を脳が「うなり」として知覚する現象。
脳波同期を誘発するとされる (科学的根拠は限定的だが、リラックス効果は多数報告あり)。

**実装**:
- 左チャンネル = 基音 (例: 432 Hz)
- 右チャンネル = 基音 + offset (例: 432 + 7 = 439 Hz)
- offset の差分 (2-20 Hz) が「バイノーラルビート周波数」として脳波帯域に対応

| Offset | 脳波帯域 | 効果 |
|---|---|---|
| 0.5-4 Hz | デルタ波 | 深い瞑想・睡眠 |
| 4-8 Hz | シータ波 | 創造性・夢見・浅い睡眠 (デフォルト 7 Hz) |
| 8-13 Hz | アルファ波 | リラックス・集中前 |
| 13-30 Hz | ベータ波 | 通常意識・集中 |
| 30+ Hz | ガンマ波 | 高度な集中・洞察 |

**Curanz 移植時の重要な変更**:
- Kuon 版は offset を 2-20 Hz の単一スライダーで提供
- Curanz 版では「目的別プリセット」を前面に出すべき:
  - 🛌 深い睡眠 (デルタ 2 Hz)
  - 🌙 入眠補助 (シータ 5 Hz)
  - 🧘 瞑想 (シータ 7 Hz)
  - 😌 リラックス (アルファ 10 Hz)
  - 🎯 集中 (ベータ 15 Hz)
  - 詳細設定として offset スライダーは残す

### 2.3 その他の機能

- **音量スライダー** (0-50%・linearRampToValueAtTime で滑らかに変化)
- **セッションタイマー** (再生開始から経過時間を表示)
- **累計再生時間カウンター** (localStorage に保存・「あなたは Kuon と共に X 時間 周波数に浸りました」)
- **サイン波ビジュアライザー** (Canvas API で波形描画・選択周波数で色変化)
- **背景グラデーション** (選択周波数の色で動的に変化)

---

## 3. 技術実装の核心 — Web Audio API

完全にブラウザ内合成・ファイル不要・音源 R2 にアクセスしない実装。

### 3.1 ステレオ独立周波数の作り方

```typescript
const Ctx = window.AudioContext || (window as any).webkitAudioContext;
const ctx = new Ctx();
const merger = ctx.createChannelMerger(2);

// 左右独立のオシレーター
const oscL = ctx.createOscillator();
const oscR = ctx.createOscillator();
const gain = ctx.createGain();

oscL.type = 'sine';
oscR.type = 'sine';
oscL.frequency.value = baseFreq;                              // 例: 432
oscR.frequency.value = binaural ? baseFreq + offset : baseFreq;  // 例: 432 + 7 = 439

// 重要: ChannelMerger で左右に分離
oscL.connect(merger, 0, 0);  // 左チャンネル (input 0)
oscR.connect(merger, 0, 1);  // 右チャンネル (input 1)
merger.connect(gain);
gain.connect(ctx.destination);

// 音量を 0 から目的値に滑らかにフェードイン (クリック音防止)
gain.gain.value = 0;
oscL.start();
oscR.start();
gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5);
```

### 3.2 周波数の動的変更 (再生中の切り替え)

```typescript
// 再生中に周波数を変える場合は setValueAtTime を使う
const now = audioCtxRef.current.currentTime;
oscLeftRef.current.frequency.setValueAtTime(newFreq, now);
oscRightRef.current.frequency.setValueAtTime(
  binaural ? newFreq + offset : newFreq,
  now,
);
```

### 3.3 停止時のクリーンアップ

```typescript
function stop() {
  if (oscLeftRef.current) { try { oscLeftRef.current.stop(); } catch {} oscLeftRef.current = null; }
  if (oscRightRef.current) { try { oscRightRef.current.stop(); } catch {} oscRightRef.current = null; }
  if (gainRef.current) { gainRef.current.disconnect(); gainRef.current = null; }
  if (audioCtxRef.current) {
    audioCtxRef.current.close();  // 必須: メモリリーク防止
    audioCtxRef.current = null;
  }
}

// React unmount 時にもクリーンアップ
useEffect(() => {
  return () => {
    if (oscLeftRef.current) try { oscLeftRef.current.stop(); } catch {}
    if (oscRightRef.current) try { oscRightRef.current.stop(); } catch {}
    if (audioCtxRef.current) audioCtxRef.current.close();
  };
}, []);
```

### 3.4 サイン波ビジュアライザー (オプション)

```typescript
// requestAnimationFrame で 60fps 描画
const draw = () => {
  const visualFreq = Math.log10(freq) * 1.2; // 視覚的に見やすい周期に変換
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let x = 0; x < w; x++) {
    const t = x / w;
    const y = h / 2 + Math.sin(2 * Math.PI * visualFreq * t + phase) * (h / 3);
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // グロー効果
  ctx.shadowBlur = 14;
  ctx.shadowColor = color;
  ctx.stroke();
  ctx.shadowBlur = 0;
  phase += 0.04;
};
```

注意: 実際の周波数 (174-963 Hz) をそのまま描画するとピクセル単位以下の波になり見えない。
`Math.log10(freq) * 1.2` で対数スケールに変換し視覚的に滑らかな波形にする。

---

## 4. Curanz Sounds への組み込み方針

### 4.1 ブランド整合性の調整

| 観点 | Kuon (元) | Curanz (移植先) |
|---|---|---|
| ターゲット | 音楽家・音大生 | ヒーリング愛好家・睡眠の質改善者・ヨガ実践者 |
| 文言トーン | 「練習開始時の集中」 | 「就寝前の入眠儀式」「瞑想セッションの導入」 |
| カラーパレット | 紫青系 (#0284c7 等) | Curanz 既存ブランドカラーに合わせる |
| フォント | Hiragino Mincho | Curanz 既存フォントに合わせる |
| 「効果」表現 | 心理学風 | スピリチュアル × ウェルネス風 |

### 4.2 課金ゲート (Curanz の有料プラン構造に合わせる)

CLAUDE.md §5 と §13 を参照すると、Curanz は以下のサブスクモデル:
- 1,480 円買切 (432Hz クラシカル睡眠音楽)
- 2,400 円買切 (ピュアトーン・ソルフェジオセット)
- 3,800 円買切 (528Hz バイタリティ・近日)
- 月商目標 200 万円・長期 1,800 万円

**FREQUENCY ツールの位置づけ提案**:

**選択肢 A**: 既存商品 (ピュアトーン・ソルフェジオセット) の付属機能
- 同セット購入者 → このツールも使える権利付与
- 「録音音源 + ブラウザツール」のハイブリッド価値

**選択肢 B**: 単体プレミアム機能 (月額 980 円程度)
- バイノーラル機能のみ Pro 化・基本周波数再生は無料体験

**選択肢 C**: 既存全商品の購入者特典
- ロイヤリティ醸成・複数購入の動機

オーナー判断が必要な部分なので、選択肢を提示して相談する形が適切。

### 4.3 既存 Curanz 認証機構との連携

Curanz は既に JWT 認証 + curanz-api Worker + R2 バケットを運用 (CLAUDE.md §5):
- このツールは音源 R2 (curanz-files) にアクセスしない
- ただし**有料会員判定**で curanz-api の `/api/verify-purchase` 等を呼ぶ必要がある
- 実装時は Curanz の既存 JWT フローに合わせる

### 4.4 重要: 触ってはいけないもの

CLAUDE.md §4 ルールに従う:
- `app/layout.tsx` (Curanz の) ・ 既存本番ページは一切変更しない
- 既存音源配信フロー (curanz-api / preview-token / stream JWT) は触らない
- 新しいページとして `/members/frequency` 等で独立追加するのが安全

---

## 5. 実装時のファイル構成 (推奨)

Curanz リポジトリ内 (新規作成):

```
curanz-sounds/
└── app/
    └── members/
        └── frequency/
            ├── page.tsx       ← Kuon の page.tsx をベースに移植
            └── layout.tsx     ← Curanz ブランド SEO メタ
```

または既存構造に合わせて:
```
curanz-sounds/
└── app/
    └── tools/
        └── frequency/
            ├── page.tsx
            └── layout.tsx
```

(Curanz の既存ディレクトリ構造を最初に把握してから決定)

### 5.1 page.tsx の改造ポイント

1. **import 文の調整**: `@/context/LangContext` 等の Kuon パスを Curanz の対応するものに差し替え
2. **ブランドカラー変数の置換**: `ACCENT = '#0284c7'` を Curanz ブランドカラーに
3. **目的別プリセット UI 追加**: バイノーラル offset の単一スライダーから「睡眠/瞑想/集中」プリセット先行 UI へ
4. **会員ゲートの追加**: 非会員には体験版 (基本周波数のみ・バイノーラル無効) を表示
5. **ロード時の認証チェック**: localStorage / cookie の Curanz トークンを検証
6. **文言の全面書き換え**: 音楽家向け → ヒーリング向け
7. **背景・装飾の Curanz 統一**: グラデーション・ボタンスタイルを既存商品ページに合わせる

### 5.2 そのままコピーで OK な部分

- Web Audio API のコア実装 (ChannelMerger / Oscillator / Gain ロジック)
- バイノーラル offset の数学
- セッションタイマー / 累計時間カウンター (localStorage キー名を Curanz 用に変更)
- サイン波ビジュアライザー (Canvas API)
- 停止時クリーンアップ処理

---

## 6. 法的注意事項

### 6.1 ソルフェジオ周波数の科学的位置づけ

ソルフェジオ周波数の医学的効果は **科学的に立証されていない**。Curanz の販売文言で
「DNA 修復」「がん治療」等を断言すると薬機法・景品表示法に抵触する可能性がある。

**推奨される表現**:
- ✅ 「リラックスのための」「瞑想のための」「インスピレーション源として」
- ✅ 「古来から○○とされている」「○○の伝統がある」 (歴史的事実は表現可)
- ❌ 「治療する」「治癒する」「病気を治す」
- ❌ 「医学的効果がある」 (証明されていない)

### 6.2 バイノーラル効果の表現

- ✅ 「リラクゼーション体験のための」
- ✅ 「メディテーションを補助するとされている」
- ❌ 「脳波を変える」「不眠症を治す」 (薬機法違反の可能性)

### 6.3 イヤホン推奨の明示

バイノーラル効果は L/R チャンネル分離のため**イヤホン/ヘッドホン必須**。スピーカー再生では効果なし。これは UI 上明確に表示する必要あり (ユーザーの誤解防止)。

### 6.4 心拍ペースメーカー使用者への警告

特定の脳波周波数 (特にデルタ・シータ域) は、心臓ペースメーカーや てんかん発作の既往がある人には影響する可能性がある。Curanz 商品の利用規約に記載があれば再利用、なければ追加が必要。

---

## 7. 確認事項チェックリスト (Curanz セッション着手時)

着手前に以下を確認:

- [ ] Curanz リポジトリ `/Users/kotaro/curanz-sounds` の構造を `ls` で確認
- [ ] 既存の `package.json` で React / Next.js のバージョンを確認
- [ ] 既存 LangContext (多言語切替) がある場合はそれを使用
- [ ] Curanz のブランドカラー・フォントを CLAUDE.md または既存ファイルから抽出
- [ ] 認証 (有料会員判定) の既存実装を `app/api/verify-*` 等で確認
- [ ] CLAUDE.md (Kuon 側) §5 の「絶対ルール」を遵守
- [ ] Curanz 内の既存 CLAUDE.md があればそれを最優先で読む

---

## 8. 想定 MVP 期間と工数

- 移植コア実装 (page.tsx + layout.tsx): **4-6 時間**
- ブランド調整 (文言・カラー・フォント): **2-3 時間**
- 会員ゲート組み込み (認証連携): **2-4 時間**
- 商品ページからの導線追加: **1 時間**
- テスト + デプロイ: **1-2 時間**

**合計: 1-2 営業日で完了可能**

---

## 9. 既知の制約・注意点

### 9.1 ブラウザ互換性

- Web Audio API は全モダンブラウザ対応
- iOS Safari は AudioContext を user gesture 後にしか作成できない (PLAY ボタン押下後 OK)
- Chrome / Edge / Firefox / Safari すべてで動作確認済み (Kuon 側で実証)

### 9.2 サンプリングレート

- Web Audio API のデフォルトは通常 44.1 kHz / 48 kHz
- 174 Hz - 963 Hz の純粋正弦波なので、サンプリングレートに影響されない
- ただし高周波 (1 kHz 以上) を扱う場合は要注意

### 9.3 メモリリーク

- AudioContext を `close()` し忘れるとメモリリーク
- React unmount 時のクリーンアップ必須 (Kuon 版に実装済み)

### 9.4 モバイル時の挙動

- バックグラウンド遷移時は AudioContext が suspended になることがある
- 「再生中にアプリ切り替え → 戻ってきたら無音」を防ぐため `visibilitychange` イベントで resume 処理を入れることを推奨

---

## 10. 移植後の Curanz 側追加機能 (Phase 2 アイデア)

Phase 1 (コア移植) 完了後の発展可能性:

1. **複数周波数同時再生**: 432 Hz + 528 Hz 等のレイヤー機能
2. **タイマー機能**: 「20 分後に自動停止」 (睡眠用途)
3. **環境音重ね合わせ**: 既存 Curanz 音源 (雨音・波等) との同時再生
4. **プリセット保存**: ユーザーごとの「お気に入りモード」保存
5. **進捗バッジ**: 累計時間で「100 時間達成」「1000 時間達成」等のゲーミフィケーション
6. **シェア画像生成**: 「私は 432 Hz を 50 時間聴きました」の Canvas 画像

---

## 11. 質問・問い合わせ

このドキュメントに関する質問や、Kuon 側の元コードの追加情報が必要な場合は、
オーナー (369@kotaroasahina.com) 経由で Kuon 側 AI セッションに相談可能。

---

**ドキュメント終了**

このファイルを Curanz Sounds AI セッションの最初に Read することで、
KUON FREQUENCY のバイノーラル機能を正しく Curanz に移植できます。
