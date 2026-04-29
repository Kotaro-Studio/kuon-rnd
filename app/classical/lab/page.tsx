'use client';

/**
 * KUON CLASSICAL LAB (BETA)
 * =========================================================
 * Pyodide (CPython on WebAssembly) + music21 をブラウザ内で動かす音楽分析環境。
 *
 * 設計思想:
 *   - 30MB ロード（Pyodide 10MB + music21 20MB）は PC/Mac/WiFi 環境前提で許容
 *   - 起動後はサーバー完全不要、無限スケール、月額コストゼロ
 *   - コードジェネレーターで music21 を学ぶ環境にもなる（音楽情報学教育）
 *   - 出力は標準出力のみ（楽譜描画は OSMD、音声再生は Tone.js が別途担当）
 *
 * 永続性 (CLAUDE.md §44.11 準拠):
 *   - 静的ページ（Next.js プレレンダー）→ エッジワーカー消費ゼロ
 *   - Pyodide は CDN (jsdelivr) からランタイム読み込み → バンドル増加ゼロ
 *   - 楽譜は既存の /api/classical/analyze-from-library から取得 → 新規ルートなし
 *
 * UX:
 *   - 初回ロード: ~30-60 秒（WiFi 推奨）
 *   - 2 回目以降: ブラウザキャッシュから即起動
 *   - スマートフォン非対応（明示・LP で告知）
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/AuthGate';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const ACCENT = '#5b21b6';
const BG_CREAM = '#fafaf7';
const PLAY_GREEN = '#059669';
const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

// Pyodide の最新安定版 (2026-01 リリース)
const PYODIDE_VERSION = 'v0.29.3';
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;
// バックアップ CDN：jsdelivr が落ちている場合に備えて
const PYODIDE_FALLBACK_URL = `https://pyodide-cdn2.iodide.io/${PYODIDE_VERSION}/full/`;
// スクリプトロードのタイムアウト
const SCRIPT_LOAD_TIMEOUT_MS = 30000;

type L6 = { ja: string; en: string; es: string; ko: string; pt: string; de: string };
const t = (m: L6, lang: Lang): string => (m as Record<Lang, string>)[lang] ?? m.en;

interface LabPiece {
  id: string;
  title: string;
  composer: string;
}

// MVP: 動作確認済みの代表曲を厳選してクイックピック
const QUICK_PICKS: LabPiece[] = [
  { id: 'bach/bwv1.6', title: 'BWV 1.6 (Choral)', composer: 'J.S. Bach' },
  { id: 'bach/bwv66.6', title: 'BWV 66.6 (Choral)', composer: 'J.S. Bach' },
  { id: 'bach/bwv112.5', title: 'BWV 112.5 (Choral)', composer: 'J.S. Bach' },
  { id: 'bach/bwv227.7', title: 'BWV 227.7 (Choral)', composer: 'J.S. Bach' },
  { id: 'beethoven/opus18no1/movement1', title: 'Op.18 No.1 Mvt.1 (Quartet)', composer: 'L.v. Beethoven' },
  { id: 'beethoven/opus18no3/movement1', title: 'Op.18 No.3 Mvt.1 (Quartet)', composer: 'L.v. Beethoven' },
  { id: 'mozart/k155/movement1', title: 'K.155 Mvt.1 (Quartet)', composer: 'W.A. Mozart' },
  { id: 'mozart/k156/movement1', title: 'K.156 Mvt.1 (Quartet)', composer: 'W.A. Mozart' },
  { id: 'haydn/opus20no1/movement1', title: 'Op.20 No.1 Mvt.1 (Quartet)', composer: 'F.J. Haydn' },
  { id: 'palestrina/Agnus_01', title: 'Agnus Dei I (Mass)', composer: 'G.P. da Palestrina' },
  { id: 'monteverdi/madrigal.3.1', title: 'Madrigal Book 3 No.1', composer: 'C. Monteverdi' },
  { id: 'schoenberg/opus19/movement2', title: 'Op.19 Mvt.2 (Atonal)', composer: 'A. Schoenberg' },
];

// 4 つのコードテンプレート — 教育的価値の高い順
const CODE_TEMPLATES: Record<string, { label: L6; code: string; description: L6 }> = {
  basic: {
    label: { ja: '① 基本：調性 + ローマ数字', en: '1. Basic: key + Roman numerals', es: '1. Básico: tonalidad + números romanos', ko: '① 기본: 조성 + 로마 숫자', pt: '1. Básico: tonalidade + algarismos romanos', de: '1. Basis: Tonart + Stufen' },
    description: { ja: 'music21 の基礎：調性判定とローマ数字分析', en: 'music21 basics: key detection + Roman numeral analysis', es: 'Lo básico: detección de tonalidad + análisis con números romanos', ko: 'music21 기초: 조성 판정 + 로마 숫자 분석', pt: 'Básico do music21: detecção de tonalidade + análise', de: 'music21 Grundlagen: Tonart + Stufenanalyse' },
    code: `from music21 import converter, roman

# score_xml は Kuon Lab があなたの選んだ楽曲の MusicXML を自動で渡しています
score = converter.parseData(score_xml, format='musicxml')

# 調性判定 (Krumhansl-Schmuckler アルゴリズム)
detected_key = score.analyze('key')
print(f"Detected key: {detected_key}")
print(f"Confidence: {detected_key.tonalCertainty():.1%}")
print()

# 全和音にローマ数字を付与
print("=== Roman Numeral Analysis ===")
chordified = score.chordify()
count = 0
for c in chordified.recurse().getElementsByClass('Chord'):
    if count >= 40:
        print("... (showing first 40 chords)")
        break
    rn = roman.romanNumeralFromChord(c, detected_key)
    print(f"M{c.measureNumber:>3} beat {c.beat:.1f}: {c.pitchedCommonName:<28} → {rn.figure}")
    count += 1
`,
  },

  voiceLeading: {
    label: { ja: '② 連続 5 度・8 度の検出', en: '2. Parallel 5ths/8ves detection', es: '2. Detección de quintas/octavas paralelas', ko: '② 병행 5도·8도 검출', pt: '2. Quintas/oitavas paralelas', de: '2. Quint-/Oktavparallelen finden' },
    description: { ja: '声部進行違反を全自動検出。和声学の宿題チェッカー', en: 'Auto-detect voice leading violations. Harmony homework checker.', es: 'Detección automática de errores de conducción de voces.', ko: '성부 진행 위반 자동 검출. 화성학 숙제 검사.', pt: 'Detecção automática de erros de condução de vozes.', de: 'Automatische Stimmführungsprüfung.' },
    code: `from music21 import converter, interval

score = converter.parseData(score_xml, format='musicxml')
parts = score.parts
voice_names = ['Soprano', 'Alto', 'Tenor', 'Bass']

print("=== Parallel 5th / 8ve detection ===")
violations = 0

for i in range(min(len(parts), 4) - 1):
    for j in range(i + 1, min(len(parts), 4)):
        v1 = [n for n in parts[i].recurse().notes if n.isNote]
        v2 = [n for n in parts[j].recurse().notes if n.isNote]
        for n in range(min(len(v1), len(v2)) - 1):
            try:
                int1 = interval.Interval(v2[n], v1[n])
                int2 = interval.Interval(v2[n+1], v1[n+1])
                if int1.simpleName == 'P5' and int2.simpleName == 'P5':
                    if v1[n].pitch != v1[n+1].pitch and v2[n].pitch != v2[n+1].pitch:
                        print(f"⚠️ M{v1[n+1].measureNumber}: parallel 5th between {voice_names[i]} & {voice_names[j]}")
                        print(f"    {voice_names[i]}: {v1[n].name}→{v1[n+1].name}, {voice_names[j]}: {v2[n].name}→{v2[n+1].name}")
                        violations += 1
                if int1.simpleName in ('P8', 'P1') and int2.simpleName in ('P8', 'P1'):
                    if v1[n].pitch != v1[n+1].pitch and v2[n].pitch != v2[n+1].pitch:
                        print(f"⚠️ M{v1[n+1].measureNumber}: parallel 8ve between {voice_names[i]} & {voice_names[j]}")
                        violations += 1
            except Exception:
                pass

print()
print(f"Total violations: {violations}")
`,
  },

  modulation: {
    label: { ja: '③ 転調マップ（窓関数解析）', en: '3. Modulation map (windowed)', es: '3. Mapa de modulaciones', ko: '③ 전조 맵 (윈도우 분석)', pt: '3. Mapa de modulações', de: '3. Modulationskarte (Fensteranalyse)' },
    description: { ja: '8 小節ウィンドウで局所キーを連続解析。転調の場所が一目で', en: '8-bar windowed key analysis. See exactly where the piece modulates.', es: 'Análisis de tonalidad con ventana de 8 compases.', ko: '8마디 윈도우로 국소 조성 분석.', pt: 'Análise de tonalidade com janela de 8 compassos.', de: '8-Takt-Fensteranalyse der lokalen Tonart.' },
    code: `from music21 import converter, analysis

score = converter.parseData(score_xml, format='musicxml')

# 8 小節ウィンドウでキー解析を実行
windowed = analysis.windowed.WindowedAnalysis(
    score,
    analysis.discrete.KrumhanslSchmuckler()
)
keys, coefficients = windowed.process(8)  # 8 小節幅

print("=== Modulation map (8-bar windows) ===")
prev_key = None
start_measure = 1
for i, k in enumerate(keys):
    measure_num = i + 1
    key_str = str(k)
    if prev_key is None:
        prev_key = key_str
        start_measure = measure_num
    elif prev_key != key_str:
        print(f"M{start_measure:>3}-M{measure_num-1:>3}: {prev_key}")
        prev_key = key_str
        start_measure = measure_num
if prev_key:
    print(f"M{start_measure:>3}-M{len(keys):>3}: {prev_key}")

print()
print(f"Total windows analyzed: {len(keys)}")
print(f"Unique keys detected: {len(set(str(k) for k in keys))}")
`,
  },

  custom: {
    label: { ja: '④ 自由実験（白紙）', en: '4. Free playground (blank)', es: '4. Experimento libre', ko: '④ 자유 실험', pt: '4. Experimentação livre', de: '4. Freie Experimente' },
    description: { ja: 'music21 を自由に書く。score_xml 変数が使える', en: 'Write music21 freely. score_xml variable is available.', es: 'Escriba music21 libremente.', ko: '자유롭게 music21 작성.', pt: 'Escreva music21 livremente.', de: 'music21 frei schreiben.' },
    code: `from music21 import converter, roman, key, interval, chord, note, stream

# score_xml: 選んだ楽曲の MusicXML 文字列
score = converter.parseData(score_xml, format='musicxml')

# ここから自由に書いてみてください ──
# たとえば...

# 全パートの音域を調べる
print("=== Pitch ranges per part ===")
for i, part in enumerate(score.parts):
    notes = [n for n in part.recurse().notes if n.isNote]
    if notes:
        lowest = min(notes, key=lambda n: n.pitch.midi)
        highest = max(notes, key=lambda n: n.pitch.midi)
        print(f"Part {i+1}: {lowest.nameWithOctave} - {highest.nameWithOctave}")
`,
  },
};

const LABELS = {
  hero: {
    eyebrow: { ja: 'KUON CLASSICAL LAB · BETA', en: 'KUON CLASSICAL LAB · BETA', es: 'KUON CLASSICAL LAB · BETA', ko: 'KUON CLASSICAL LAB · BETA', pt: 'KUON CLASSICAL LAB · BETA', de: 'KUON CLASSICAL LAB · BETA' } as L6,
    title: {
      ja: 'ブラウザの中で\nmusic21 を動かす。',
      en: 'Run music21\ninside your browser.',
      es: 'Ejecute music21\ndentro de su navegador.',
      ko: '브라우저 안에서\nmusic21을 실행.',
      pt: 'Execute music21\nno seu navegador.',
      de: 'music21\nim Browser ausführen.',
    } as L6,
    sub: {
      ja: 'サーバー不要、Python の本物の music21 をブラウザ内で起動。コードを編集・実行して、和声分析を「ブラックボックス」から「学べる対象」に変える。',
      en: 'No server. Real music21 Python running in your browser. Edit and run code to turn analysis from a black box into something you can learn from.',
      es: 'Sin servidor. music21 Python real corriendo en su navegador.',
      ko: '서버 불필요. 실제 music21 Python이 브라우저 안에서 동작.',
      pt: 'Sem servidor. music21 Python real rodando no seu navegador.',
      de: 'Kein Server. Echtes music21 Python läuft in Ihrem Browser.',
    } as L6,
  },
  warning: {
    title: { ja: '📡 初回ロードについて', en: '📡 First-time load notice', es: '📡 Primera carga', ko: '📡 첫 로딩 안내', pt: '📡 Primeira carga', de: '📡 Erstmaliges Laden' } as L6,
    body: {
      ja: 'Music Lab は Python ランタイム + music21（合計約 30MB）をブラウザに読み込んで動作します。初回は WiFi 環境を推奨（30 秒〜1 分）。2 回目以降はキャッシュから即起動。スマートフォン非対応・PC/Mac 推奨。',
      en: 'Music Lab loads Python runtime + music21 (~30MB total) into your browser. WiFi recommended for first load (30s–1min). Subsequent loads are instant from cache. PC/Mac required, smartphones not supported.',
      es: 'Music Lab carga Python + music21 (~30MB) en su navegador. Se recomienda WiFi para la primera carga.',
      ko: 'Music Lab은 Python + music21 (약 30MB) 을 브라우저에 로드합니다. 첫 로딩은 WiFi 권장.',
      pt: 'Music Lab carrega Python + music21 (~30MB) no seu navegador. WiFi recomendado para a primeira carga.',
      de: 'Music Lab lädt Python + music21 (~30MB) in Ihren Browser. WiFi empfohlen beim ersten Mal.',
    } as L6,
  },
  loading: {
    pyodideScript: { ja: 'Pyodide スクリプトをダウンロード中…', en: 'Downloading Pyodide script…', es: 'Descargando Pyodide…', ko: 'Pyodide 스크립트 다운로드 중…', pt: 'Baixando Pyodide…', de: 'Pyodide-Skript wird heruntergeladen…' } as L6,
    pyodideRuntime: { ja: 'Python ランタイムを起動中…', en: 'Initializing Python runtime…', es: 'Inicializando Python…', ko: 'Python 런타임 초기화 중…', pt: 'Inicializando Python…', de: 'Python-Laufzeit wird initialisiert…' } as L6,
    music21: { ja: 'music21 を読み込み中… (約 20MB) — 初回のみ時間がかかります', en: 'Loading music21… (~20MB) — first time only', es: 'Cargando music21… (~20MB)', ko: 'music21 로딩 중… (약 20MB)', pt: 'Carregando music21… (~20MB)', de: 'music21 wird geladen… (~20MB)' } as L6,
    ready: { ja: '準備完了', en: 'Ready', es: 'Listo', ko: '준비 완료', pt: 'Pronto', de: 'Bereit' } as L6,
  },
  ui: {
    pickPiece: { ja: '📚 楽曲を選ぶ', en: '📚 Pick a piece', es: '📚 Elige una pieza', ko: '📚 곡 선택', pt: '📚 Escolha uma peça', de: '📚 Werk auswählen' } as L6,
    template: { ja: '💡 コードテンプレート', en: '💡 Code template', es: '💡 Plantilla de código', ko: '💡 코드 템플릿', pt: '💡 Modelo de código', de: '💡 Code-Vorlage' } as L6,
    pythonCode: { ja: '💻 Python コード（編集可）', en: '💻 Python code (editable)', es: '💻 Código Python (editable)', ko: '💻 Python 코드 (편집 가능)', pt: '💻 Código Python (editável)', de: '💻 Python-Code (bearbeitbar)' } as L6,
    output: { ja: '🖥️ 出力', en: '🖥️ Output', es: '🖥️ Salida', ko: '🖥️ 출력', pt: '🖥️ Saída', de: '🖥️ Ausgabe' } as L6,
    run: { ja: '▶ 実行', en: '▶ Run', es: '▶ Ejecutar', ko: '▶ 실행', pt: '▶ Executar', de: '▶ Ausführen' } as L6,
    running: { ja: '⏳ 実行中…', en: '⏳ Running…', es: '⏳ Ejecutando…', ko: '⏳ 실행 중…', pt: '⏳ Executando…', de: '⏳ Wird ausgeführt…' } as L6,
    pickFirst: { ja: '楽曲を選んで「実行」を押すと結果が表示されます', en: 'Pick a piece and press Run to see results', es: 'Elige una pieza y presiona Ejecutar', ko: '곡을 선택하고 실행을 누르세요', pt: 'Escolha uma peça e pressione Executar', de: 'Werk auswählen und Ausführen drücken' } as L6,
    pieceLoading: { ja: '楽曲ロード中…', en: 'Loading piece…', es: 'Cargando pieza…', ko: '곡 로딩 중…', pt: 'Carregando peça…', de: 'Werk wird geladen…' } as L6,
    pieceReady: { ja: 'score_xml に読み込み完了', en: 'Loaded into score_xml', es: 'Cargado en score_xml', ko: 'score_xml에 로드됨', pt: 'Carregado em score_xml', de: 'In score_xml geladen' } as L6,
    backToClassical: { ja: '← Classical に戻る', en: '← Back to Classical', es: '← Volver a Classical', ko: '← Classical로 돌아가기', pt: '← Voltar', de: '← Zurück' } as L6,
    errorTitle: { ja: 'Pyodide のロードに失敗', en: 'Failed to load Pyodide', es: 'Error al cargar Pyodide', ko: 'Pyodide 로딩 실패', pt: 'Falha ao carregar Pyodide', de: 'Pyodide konnte nicht geladen werden' } as L6,
  },
};

export default function ClassicalLabPage() {
  return (
    <AuthGate appName="classical">
      <LabInner />
    </AuthGate>
  );
}

function LabInner() {
  const { lang } = useLang();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pyodideRef = useRef<any>(null);
  const [pyodideStatus, setPyodideStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [loadProgress, setLoadProgress] = useState({ message: '', pct: 0 });

  const [selectedPiece, setSelectedPiece] = useState<LabPiece | null>(null);
  const [musicxml, setMusicxml] = useState<string | null>(null);
  const [pieceLoading, setPieceLoading] = useState(false);

  const [templateKey, setTemplateKey] = useState<keyof typeof CODE_TEMPLATES>('basic');
  const [code, setCode] = useState(CODE_TEMPLATES.basic.code);

  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [errorOut, setErrorOut] = useState('');

  // Pyodide ロード（マウント時に 1 回だけ）
  useEffect(() => {
    if (pyodideStatus !== 'idle') return;
    setPyodideStatus('loading');

    let cancelled = false;
    (async () => {
      try {
        setLoadProgress({ message: t(LABELS.loading.pyodideScript, lang), pct: 5 });
        await loadPyodideScript();
        if (cancelled) return;

        setLoadProgress({ message: t(LABELS.loading.pyodideRuntime, lang), pct: 25 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const py = await (window as any).loadPyodide({
          indexURL: PYODIDE_BASE_URL,
        });
        if (cancelled) return;

        setLoadProgress({ message: t(LABELS.loading.music21, lang), pct: 55 });
        await py.loadPackage('music21');
        if (cancelled) return;

        pyodideRef.current = py;
        setLoadProgress({ message: t(LABELS.loading.ready, lang), pct: 100 });
        setPyodideStatus('ready');
      } catch (e) {
        if (!cancelled) {
          console.error('Pyodide load failed', e);
          setPyodideStatus('error');
          setLoadProgress({ message: e instanceof Error ? e.message : String(e), pct: 0 });
        }
      }
    })();

    return () => { cancelled = true; };
  }, [pyodideStatus, lang]);

  // テンプレート切替
  const handleTemplateChange = useCallback((key: keyof typeof CODE_TEMPLATES) => {
    setTemplateKey(key);
    setCode(CODE_TEMPLATES[key].code);
  }, []);

  // 楽曲選択
  const handlePieceSelect = useCallback(async (piece: LabPiece) => {
    setSelectedPiece(piece);
    setMusicxml(null);
    setPieceLoading(true);
    try {
      const res = await fetch('/api/classical/analyze-from-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ piece_id: piece.id }),
      });
      const data = await res.json();
      if (data.musicxml) {
        setMusicxml(data.musicxml);
      }
    } catch (e) {
      console.error('Piece fetch failed', e);
    } finally {
      setPieceLoading(false);
    }
  }, []);

  // 実行
  const handleRun = useCallback(async () => {
    const py = pyodideRef.current;
    if (!py || !musicxml) return;

    setRunning(true);
    setOutput('');
    setErrorOut('');

    let stdout = '';
    let stderr = '';

    try {
      py.globals.set('score_xml', musicxml);
      py.setStdout({ batched: (s: string) => { stdout += s; } });
      py.setStderr({ batched: (s: string) => { stderr += s; } });

      await py.runPythonAsync(code);

      setOutput(stdout || '(no output)');
      if (stderr) setErrorOut(stderr);
    } catch (e) {
      const msg = e instanceof Error ? (e.message || String(e)) : String(e);
      setErrorOut(`${msg}${stderr ? '\n' + stderr : ''}`);
      if (stdout) setOutput(stdout);
    } finally {
      setRunning(false);
    }
  }, [code, musicxml]);

  return (
    <div style={{ minHeight: '100vh', background: BG_CREAM, fontFamily: sans, color: '#0f172a' }}>
      {/* Hero */}
      <section style={{ padding: 'clamp(2rem, 5vw, 4rem) 1.5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/classical" style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
          {t(LABELS.ui.backToClassical, lang)}
        </Link>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: ACCENT, fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase' }}>
          {t(LABELS.hero.eyebrow, lang)}
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, margin: 0, marginBottom: '1rem', whiteSpace: 'pre-line', letterSpacing: '0.02em', lineHeight: 1.4 }}>
          {t(LABELS.hero.title, lang)}
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.85, maxWidth: 720, margin: 0, wordBreak: 'keep-all' }}>
          {t(LABELS.hero.sub, lang)}
        </p>
      </section>

      {/* 警告（ロード前に表示） */}
      {pyodideStatus !== 'ready' && (
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
          <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 12, padding: '1.2rem 1.4rem', fontSize: '0.85rem', color: '#92400e' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{t(LABELS.warning.title, lang)}</div>
            <p style={{ margin: 0, lineHeight: 1.7, wordBreak: 'keep-all' }}>{t(LABELS.warning.body, lang)}</p>
          </div>
        </section>
      )}

      {/* ロード中 */}
      {pyodideStatus === 'loading' && (
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.8rem', fontFamily: mono }}>
              {loadProgress.message}
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: ACCENT, width: `${loadProgress.pct}%`, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.6rem', fontFamily: mono }}>
              {loadProgress.pct}%
            </div>
          </div>
        </section>
      )}

      {/* エラー */}
      {pyodideStatus === 'error' && (
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: 12, padding: '1.5rem', color: '#991b1b' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>⚠️ {t(LABELS.ui.errorTitle, lang)}</div>
            <pre style={{ fontSize: '0.78rem', marginTop: 8, opacity: 0.7, fontFamily: mono, whiteSpace: 'pre-wrap' }}>{loadProgress.message}</pre>
          </div>
        </section>
      )}

      {/* メイン UI */}
      {pyodideStatus === 'ready' && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* 楽曲ピッカー */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.2rem 1.4rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
              {t(LABELS.ui.pickPiece, lang)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
              {QUICK_PICKS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePieceSelect(p)}
                  style={{
                    background: selectedPiece?.id === p.id ? '#ede9fe' : '#f8fafc',
                    border: selectedPiece?.id === p.id ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
                    borderRadius: 8, padding: '0.7rem 0.9rem', textAlign: 'left',
                    cursor: 'pointer', fontFamily: sans, transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{p.composer}</div>
                  <div style={{ fontFamily: serif, fontSize: '0.92rem', fontWeight: 500, color: '#0f172a', marginTop: 2 }}>{p.title}</div>
                </button>
              ))}
            </div>
            {selectedPiece && (
              <div style={{ marginTop: '0.8rem', fontSize: '0.78rem', color: pieceLoading ? '#94a3b8' : (musicxml ? '#059669' : '#94a3b8'), fontFamily: mono }}>
                {pieceLoading
                  ? `⏳ ${t(LABELS.ui.pieceLoading, lang)} (${selectedPiece.id})`
                  : musicxml
                    ? `✓ ${t(LABELS.ui.pieceReady, lang)}: ${selectedPiece.id} (${musicxml.length.toLocaleString()} bytes)`
                    : `⚠️ Failed to load: ${selectedPiece.id}`
                }
              </div>
            )}
          </div>

          {/* テンプレート */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.2rem 1.4rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
              {t(LABELS.ui.template, lang)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
              {(Object.keys(CODE_TEMPLATES) as Array<keyof typeof CODE_TEMPLATES>).map((k) => (
                <button
                  key={k}
                  onClick={() => handleTemplateChange(k)}
                  style={{
                    background: templateKey === k ? ACCENT : 'transparent',
                    color: templateKey === k ? '#fff' : ACCENT,
                    border: `1px solid ${ACCENT}`, borderRadius: 999,
                    padding: '0.4rem 1rem', fontSize: '0.78rem', fontWeight: 500,
                    cursor: 'pointer', fontFamily: sans,
                  }}
                >
                  {t(CODE_TEMPLATES[k].label, lang)}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
              {t(CODE_TEMPLATES[templateKey].description, lang)}
            </div>
          </div>

          {/* コード + 実行ボタン */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.2rem 1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {t(LABELS.ui.pythonCode, lang)}
              </div>
              <button
                onClick={handleRun}
                disabled={running || !musicxml}
                style={{
                  background: running ? '#94a3b8' : (musicxml ? PLAY_GREEN : '#cbd5e1'),
                  color: '#fff', border: 'none', borderRadius: 999,
                  padding: '0.55rem 1.6rem', fontSize: '0.9rem', fontWeight: 600,
                  cursor: running || !musicxml ? 'not-allowed' : 'pointer', fontFamily: sans,
                }}
              >
                {running ? t(LABELS.ui.running, lang) : t(LABELS.ui.run, lang)}
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              style={{
                width: '100%', minHeight: 280, padding: '1rem',
                fontFamily: mono, fontSize: '0.85rem', lineHeight: 1.65,
                border: '1px solid #cbd5e1', borderRadius: 8,
                background: '#0f172a', color: '#e2e8f0',
                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                tabSize: 4,
              }}
            />
          </div>

          {/* 出力 */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.2rem 1.4rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
              {t(LABELS.ui.output, lang)}
            </div>
            {!output && !errorOut && (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontFamily: mono }}>
                {t(LABELS.ui.pickFirst, lang)}
              </div>
            )}
            {output && (
              <pre style={{
                background: '#f8fafc', padding: '1rem', borderRadius: 6,
                fontFamily: mono, fontSize: '0.78rem', lineHeight: 1.65,
                color: '#0f172a', overflow: 'auto', maxHeight: 500,
                whiteSpace: 'pre-wrap', margin: 0, border: '1px solid #e2e8f0',
              }}>{output}</pre>
            )}
            {errorOut && (
              <pre style={{
                background: '#fee2e2', padding: '1rem', borderRadius: 6,
                fontFamily: mono, fontSize: '0.78rem', lineHeight: 1.65,
                color: '#991b1b', overflow: 'auto', maxHeight: 250,
                whiteSpace: 'pre-wrap', margin: '0.5rem 0 0', border: '1px solid #fecaca',
              }}>{errorOut}</pre>
            )}
          </div>

          {/* フッター情報 */}
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', padding: '1rem', fontFamily: mono }}>
            Pyodide {PYODIDE_VERSION} · music21 (CPython on WebAssembly) · score_xml is auto-injected
          </div>
        </section>
      )}
    </div>
  );
}

function loadPyodideScript(): Promise<void> {
  // 既にロード済みなら即解決
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).loadPyodide) {
    console.log('[Lab] Pyodide already loaded, skipping');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // 既存タグがあれば再利用
    const existing = document.querySelector('script[data-pyodide-loader]') as HTMLScriptElement | null;
    if (existing) {
      console.log('[Lab] Reusing existing Pyodide script tag');
      const onSuccess = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).loadPyodide) resolve();
        else reject(new Error('Script loaded but window.loadPyodide is not defined'));
      };
      existing.addEventListener('load', onSuccess);
      existing.addEventListener('error', () => reject(new Error('Existing script tag fired error event')));
      // 念のため、既に load 完了している可能性を確認
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).loadPyodide) resolve();
      return;
    }

    const url = `${PYODIDE_BASE_URL}pyodide.js`;
    console.log('[Lab] Loading Pyodide script from:', url);
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.dataset.pyodideLoader = 'true';

    const timeoutId = setTimeout(() => {
      console.error('[Lab] Script load timeout after', SCRIPT_LOAD_TIMEOUT_MS, 'ms');
      reject(new Error(
        `Pyodide スクリプトのロードが ${SCRIPT_LOAD_TIMEOUT_MS / 1000} 秒以内に完了しませんでした。\n` +
        `URL: ${url}\n\n` +
        `考えられる原因:\n` +
        `1. ブラウザ拡張機能 (uBlock Origin 等) が cdn.jsdelivr.net をブロックしている\n` +
        `2. ネットワークが CDN へのアクセスを拒否している (会社/学校 Proxy)\n` +
        `3. Service Worker のキャッシュが破損している\n\n` +
        `対処: シークレットウィンドウで開く / 拡張機能を一時無効化 / 別ネットワーク`
      ));
    }, SCRIPT_LOAD_TIMEOUT_MS);

    s.onload = () => {
      clearTimeout(timeoutId);
      console.log('[Lab] pyodide.js script loaded successfully');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).loadPyodide) {
        resolve();
      } else {
        reject(new Error('Script loaded but window.loadPyodide is undefined. Possibly a CSP or version mismatch issue.'));
      }
    };
    s.onerror = (event) => {
      clearTimeout(timeoutId);
      console.error('[Lab] Script onerror:', event);
      reject(new Error(`Pyodide script load failed: ${url}`));
    };

    document.head.appendChild(s);
  });
}
