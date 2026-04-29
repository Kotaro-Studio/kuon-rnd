'use client';

/**
 * KUON CLASSICAL LAB (BETA) — 音大生のための美しい分析環境
 * =========================================================
 * Pyodide + music21 がブラウザ内で動くが、ユーザーには楽譜と分析結果しか見えない設計。
 *
 * UX 思想:
 *   - 楽曲を選ぶ → 自動で分析 → 美しい楽譜が描画される
 *   - Python コードは完全に裏で実行（デフォルトで非表示）
 *   - 興味のある上級ユーザーは "🔬 コードを表示" で展開可能
 *   - 音大生（特に非エンジニア）が楽しく使える
 *
 * 技術 (CLAUDE.md §44.11 準拠):
 *   - 静的ページ → エッジワーカー消費ゼロ
 *   - Pyodide は CDN ロード → バンドル増加ゼロ
 *   - 楽譜は既存 API から取得 → 新規ルートなし
 *   - ScoreViewer コンポーネントを再利用（/classical と同じ描画品質）
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AuthGate } from '@/components/AuthGate';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const ScoreViewer = dynamic(() => import('@/components/ScoreViewer'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
      Loading score renderer…
    </div>
  ),
});

const ACCENT = '#5b21b6';
const BG_CREAM = '#fafaf7';
const GOLD = '#b45309';
const PLAY_GREEN = '#059669';
const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

const PYODIDE_VERSION = 'v0.29.3';
const PYODIDE_BASE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;
const SCRIPT_LOAD_TIMEOUT_MS = 30000;

type L6 = { ja: string; en: string; es: string; ko: string; pt: string; de: string };
const t = (m: L6, lang: Lang): string => (m as Record<Lang, string>)[lang] ?? m.en;

// 楽曲インターフェース：/api/classical/library から取得する形式と一致させる
interface LibraryPiece {
  id: string;
  composer: string;
  composer_key: string;
  title: string;
  key: string;
  measures: number;
  era: string;
  source: string;
}

interface ComposerOption {
  key: string;
  display: string;
  era: string;
  count: number;
}

// 作曲家リスト：/classical/page.tsx と同じ静的定数
// （CLAUDE.md §44.11 永続性原則：静的データはフロントにインライン化）
const STATIC_COMPOSERS: ComposerOption[] = [
  // Renaissance
  { key: 'palestrina', display: 'G.P. da Palestrina', era: 'renaissance', count: 1018 },
  { key: 'josquin', display: 'Josquin des Prez', era: 'renaissance', count: 8 },
  { key: 'luca', display: 'Luca Marenzio', era: 'renaissance', count: 1 },
  // Baroque
  { key: 'bach', display: 'J.S. Bach', era: 'baroque', count: 433 },
  { key: 'cpebach', display: 'C.P.E. Bach', era: 'baroque', count: 1 },
  { key: 'monteverdi', display: 'C. Monteverdi', era: 'baroque', count: 97 },
  { key: 'corelli', display: 'A. Corelli', era: 'baroque', count: 1 },
  { key: 'handel', display: 'G.F. Handel', era: 'baroque', count: 1 },
  // Classical
  { key: 'haydn', display: 'F.J. Haydn', era: 'classical', count: 9 },
  { key: 'mozart', display: 'W.A. Mozart', era: 'classical', count: 16 },
  { key: 'beethoven', display: 'L.v. Beethoven', era: 'classical', count: 26 },
  // Romantic
  { key: 'schubert', display: 'F. Schubert', era: 'romantic', count: 1 },
  { key: 'chopin', display: 'F. Chopin', era: 'romantic', count: 1 },
  { key: 'weber', display: 'C.M. von Weber', era: 'romantic', count: 1 },
  { key: 'verdi', display: 'G. Verdi', era: 'romantic', count: 1 },
  { key: 'beach', display: 'Amy Beach', era: 'romantic', count: 1 },
  // Modern / Early Jazz
  { key: 'schoenberg', display: 'A. Schoenberg', era: 'modern', count: 2 },
  { key: 'joplin', display: 'S. Joplin', era: 'early-jazz', count: 1 },
  // Folk
  { key: 'ryansMammoth', display: "Ryan's Mammoth (Folk Dance)", era: 'folk', count: 1059 },
  { key: 'oneills1850', display: "O'Neill's 1850 (Irish)", era: 'folk', count: 39 },
  { key: 'essenFolksong', display: 'Essen Folksong (German)', era: 'folk', count: 31 },
  { key: 'airdsAirs', display: "Aird's Airs (Scottish)", era: 'folk', count: 6 },
  { key: 'miscFolk', display: 'Miscellaneous Folk', era: 'folk', count: 2 },
];

interface ChordData { measure: number; beat: number; chord: string; roman: string; function: string; }
interface CadenceData { measure: number; beat: number; type: string; progression: string[]; }
interface ModulationData { from_measure: number; to_measure: number; key: string; }

interface AnalysisResult {
  key: string;
  key_confidence: number;
  chords: ChordData[];
  cadences: CadenceData[];
  modulations: ModulationData[];
  chord_count: number;
  midi_b64: string | null;
}

const ANALYSIS_PYTHON_SCRIPT = `
import json, base64, tempfile, os
from music21 import converter, roman, analysis

def _function(roman_str):
    rs = roman_str.upper().replace('7','').replace('6','').replace('4','').replace('2','')
    if rs.startswith('I') and not rs.startswith('II') and not rs.startswith('III') and not rs.startswith('IV'):
        return 'tonic'
    if rs.startswith('V') or rs.startswith('VII'):
        return 'dominant'
    if rs.startswith('II') or rs.startswith('IV') or rs.startswith('VI'):
        return 'predominant'
    return 'other'

score = converter.parseData(score_xml, format='musicxml')
detected_key = score.analyze('key')
raw_conf = detected_key.tonalCertainty() if hasattr(detected_key, 'tonalCertainty') else 0.85
confidence = max(0.0, min(1.0, float(raw_conf)))

chords_data = []
chordified = score.chordify()
for c in chordified.recurse().getElementsByClass('Chord'):
    try:
        m_num = int(c.measureNumber) if c.measureNumber else 0
        b_val = float(c.beat) if c.beat else 1.0
        try:
            rn = roman.romanNumeralFromChord(c, detected_key)
            r_str = rn.figure
            func = _function(r_str)
        except Exception:
            r_str = "?"
            func = "unknown"
        chords_data.append({
            'measure': m_num,
            'beat': round(b_val, 2),
            'chord': str(c.pitchedCommonName),
            'roman': r_str,
            'function': func,
        })
    except Exception:
        pass

cadences_data = []
for i in range(len(chords_data) - 1):
    cur = chords_data[i]['roman'].upper()
    nxt = chords_data[i+1]['roman'].upper()
    cad_type = None
    if cur.startswith('V') and nxt.startswith('I') and not (nxt.startswith('II') or nxt.startswith('III') or nxt.startswith('IV')):
        cad_type = 'authentic'
    elif cur.startswith('IV') and nxt.startswith('I') and not nxt.startswith('II'):
        cad_type = 'plagal'
    elif cur.startswith('V') and nxt.startswith('VI'):
        cad_type = 'deceptive'
    elif nxt.startswith('V') and not cur.startswith('V'):
        cad_type = 'half'
    if cad_type:
        cadences_data.append({
            'measure': chords_data[i+1]['measure'],
            'beat': chords_data[i+1]['beat'],
            'type': cad_type,
            'progression': [chords_data[i]['roman'], chords_data[i+1]['roman']],
        })

modulations_data = []
try:
    windowed = analysis.windowed.WindowedAnalysis(score, analysis.discrete.KrumhanslSchmuckler())
    keys_arr, _ = windowed.process(8)
    prev_k = None
    start_m = 1
    for i, k in enumerate(keys_arr):
        ks = str(k)
        m = i + 1
        if prev_k is None:
            prev_k = ks
            start_m = m
        elif prev_k != ks:
            modulations_data.append({'from_measure': int(start_m), 'to_measure': int(m - 1), 'key': prev_k})
            prev_k = ks
            start_m = m
    if prev_k is not None:
        modulations_data.append({'from_measure': int(start_m), 'to_measure': int(len(keys_arr)), 'key': prev_k})
except Exception:
    pass

midi_b64_str = None
try:
    fd, path = tempfile.mkstemp(suffix='.mid')
    os.close(fd)
    score.write('midi', fp=path)
    with open(path, 'rb') as f:
        midi_b64_str = base64.b64encode(f.read()).decode('ascii')
    os.unlink(path)
except Exception:
    pass

_kuon_lab_result = json.dumps({
    'key': str(detected_key),
    'key_confidence': confidence,
    'chords': chords_data,
    'cadences': cadences_data,
    'modulations': modulations_data,
    'chord_count': len(chords_data),
    'midi_b64': midi_b64_str,
})
`;

const LABELS = {
  hero: {
    eyebrow: { ja: 'KUON CLASSICAL LAB · BETA', en: 'KUON CLASSICAL LAB · BETA', es: 'KUON CLASSICAL LAB · BETA', ko: 'KUON CLASSICAL LAB · BETA', pt: 'KUON CLASSICAL LAB · BETA', de: 'KUON CLASSICAL LAB · BETA' } as L6,
    title: {
      ja: 'ブラウザの中の\n音楽分析室。',
      en: 'A music analysis room\ninside your browser.',
      es: 'Una sala de análisis musical\nen su navegador.',
      ko: '브라우저 안의\n음악 분석실.',
      pt: 'Uma sala de análise musical\nno seu navegador.',
      de: 'Ein Musikanalyse-Raum\nin Ihrem Browser.',
    } as L6,
    sub: {
      ja: '楽曲を選ぶだけで、調性・ローマ数字・カデンツ・転調が一瞬で。サーバー不要、すべてあなたのブラウザの中で完結します。',
      en: 'Pick a piece. Get key, Roman numerals, cadences, modulations — instantly. Everything runs in your browser, no server needed.',
      es: 'Elija una pieza. Obtenga tonalidad, números romanos, cadencias y modulaciones al instante.',
      ko: '곡을 선택하면 조성·로마 숫자·종지·전조가 즉시 분석됩니다.',
      pt: 'Escolha uma peça. Tonalidade, algarismos romanos, cadências e modulações instantaneamente.',
      de: 'Wählen Sie ein Werk. Tonart, Stufen, Kadenzen, Modulationen — sofort.',
    } as L6,
  },
  warning: {
    title: { ja: '📡 初回ロードについて', en: '📡 First-time load notice', es: '📡 Primera carga', ko: '📡 첫 로딩 안내', pt: '📡 Primeira carga', de: '📡 Erstmaliges Laden' } as L6,
    body: {
      ja: '初回のみ、ブラウザに分析エンジン（約 30MB）を読み込みます。WiFi 環境を推奨（30 秒〜1 分）。2 回目以降はキャッシュから即起動します。スマートフォン非対応・PC/Mac 推奨。',
      en: 'First-time only: ~30MB analysis engine loads to your browser. WiFi recommended (30s–1min). Subsequent visits load instantly from cache. PC/Mac required.',
      es: 'Primera vez: ~30MB del motor de análisis se carga en su navegador. Se recomienda WiFi.',
      ko: '첫 로딩 시 분석 엔진(약 30MB)을 브라우저에 로드합니다. WiFi 권장.',
      pt: 'Primeira vez: ~30MB do motor de análise carrega no seu navegador. WiFi recomendado.',
      de: 'Beim ersten Mal lädt eine ~30MB Analyse-Engine in Ihren Browser. WiFi empfohlen.',
    } as L6,
  },
  loading: {
    pyodideScript: { ja: '分析エンジンをダウンロード中…', en: 'Downloading analysis engine…', es: 'Descargando motor…', ko: '분석 엔진 다운로드 중…', pt: 'Baixando motor…', de: 'Analyse-Engine wird heruntergeladen…' } as L6,
    pyodideRuntime: { ja: 'エンジンを起動中…', en: 'Initializing engine…', es: 'Inicializando motor…', ko: '엔진 초기화 중…', pt: 'Inicializando motor…', de: 'Engine wird initialisiert…' } as L6,
    micropip: { ja: '音楽分析ライブラリを準備中…', en: 'Preparing music analysis library…', es: 'Preparando biblioteca…', ko: '음악 분석 라이브러리 준비 중…', pt: 'Preparando biblioteca…', de: 'Musikanalyse-Bibliothek wird vorbereitet…' } as L6,
    music21: { ja: 'music21 を読み込み中…', en: 'Loading music21…', es: 'Cargando music21…', ko: 'music21 로딩 중…', pt: 'Carregando music21…', de: 'music21 wird geladen…' } as L6,
    ready: { ja: '準備完了', en: 'Ready', es: 'Listo', ko: '준비 완료', pt: 'Pronto', de: 'Bereit' } as L6,
  },
  ui: {
    pickPiece: { ja: '楽曲を選んで、分析を始めましょう', en: 'Pick a piece to start analyzing', es: 'Elija una pieza para empezar', ko: '곡을 선택하여 분석을 시작하세요', pt: 'Escolha uma peça', de: 'Wählen Sie ein Werk' } as L6,
    searchPlaceholder: { ja: '作曲家・曲名・管理番号で検索（例：BWV 66, K. 155, Op.18）', en: 'Search by composer, title, or catalog number (BWV 66, K. 155, Op.18)', es: 'Buscar por compositor, título o número', ko: '작곡가·곡명·관리번호로 검색', pt: 'Buscar por compositor, título ou número', de: 'Nach Komponist, Titel oder Werknummer suchen' } as L6,
    composerFilter: { ja: 'すべての作曲家', en: 'All composers', es: 'Todos los compositores', ko: '모든 작곡가', pt: 'Todos compositores', de: 'Alle Komponisten' } as L6,
    eraFilter: { ja: 'すべての時代', en: 'All eras', es: 'Todas las épocas', ko: '모든 시대', pt: 'Todas as épocas', de: 'Alle Epochen' } as L6,
    libraryLoading: { ja: 'ライブラリを読み込み中…', en: 'Loading library…', es: 'Cargando biblioteca…', ko: '라이브러리 로딩 중…', pt: 'Carregando biblioteca…', de: 'Bibliothek wird geladen…' } as L6,
    noResults: { ja: '一致する楽曲が見つかりません', en: 'No matching pieces found', es: 'No se encontraron piezas', ko: '일치하는 곡이 없습니다', pt: 'Nenhuma peça encontrada', de: 'Keine Werke gefunden' } as L6,
    pieceCount: { ja: '曲', en: 'pieces', es: 'piezas', ko: '곡', pt: 'peças', de: 'Werke' } as L6,
    measureWord: { ja: '小節', en: 'measures', es: 'compases', ko: '마디', pt: 'compassos', de: 'Takte' } as L6,
    fetchingPiece: { ja: '楽譜を取得しています…', en: 'Fetching the score…', es: 'Obteniendo partitura…', ko: '악보를 가져오는 중…', pt: 'Obtendo partitura…', de: 'Werk wird geladen…' } as L6,
    analyzing: { ja: '和声分析中… (Python が裏で動いています)', en: 'Analyzing harmony… (Python running silently)', es: 'Analizando armonía…', ko: '화성 분석 중…', pt: 'Analisando harmonia…', de: 'Harmonik-Analyse läuft…' } as L6,
    backToClassical: { ja: '← Classical に戻る', en: '← Back to Classical', es: '← Volver', ko: '← 돌아가기', pt: '← Voltar', de: '← Zurück' } as L6,
    errorTitle: { ja: 'エンジンのロードに失敗', en: 'Failed to load engine', es: 'Error al cargar motor', ko: '엔진 로딩 실패', pt: 'Falha ao carregar motor', de: 'Engine konnte nicht geladen werden' } as L6,
    devModeShow: { ja: '🔬 内部の Python コードを表示する', en: '🔬 Show internal Python code', es: '🔬 Mostrar código Python interno', ko: '🔬 내부 Python 코드 표시', pt: '🔬 Mostrar código Python', de: '🔬 Internen Python-Code anzeigen' } as L6,
    devModeHide: { ja: '🔬 コードを隠す', en: '🔬 Hide code', es: '🔬 Ocultar código', ko: '🔬 코드 숨기기', pt: '🔬 Ocultar código', de: '🔬 Code verbergen' } as L6,
    devModeIntro: { ja: 'これはあなたが選んだ楽曲を分析している、実際の Python コードです。バックグラウンドで自動実行されています。興味があればコピーして、ご自分のローカル環境でも実行できます。', en: 'This is the actual Python code analyzing your selected piece. It runs automatically in the background. Copy it to use in your own Python environment.', es: 'Este es el código Python real que analiza su pieza.', ko: '이것은 선택한 곡을 분석하는 실제 Python 코드입니다.', pt: 'Este é o código Python real que analisa sua peça.', de: 'Dies ist der echte Python-Code, der Ihr Werk analysiert.' } as L6,
    analysisFailed: { ja: '分析に失敗しました', en: 'Analysis failed', es: 'Análisis falló', ko: '분석 실패', pt: 'Análise falhou', de: 'Analyse fehlgeschlagen' } as L6,
  },
  era: {
    medieval: { ja: '中世', en: 'Medieval', es: 'Medieval', ko: '중세', pt: 'Medieval', de: 'Mittelalter' } as L6,
    renaissance: { ja: 'ルネサンス', en: 'Renaissance', es: 'Renacimiento', ko: '르네상스', pt: 'Renascimento', de: 'Renaissance' } as L6,
    baroque: { ja: 'バロック', en: 'Baroque', es: 'Barroco', ko: '바로크', pt: 'Barroco', de: 'Barock' } as L6,
    classical: { ja: '古典派', en: 'Classical', es: 'Clásico', ko: '고전파', pt: 'Clássico', de: 'Klassik' } as L6,
    romantic: { ja: 'ロマン派', en: 'Romantic', es: 'Romántico', ko: '낭만파', pt: 'Romântico', de: 'Romantik' } as L6,
    modern: { ja: '近現代', en: 'Modern', es: 'Moderno', ko: '근현대', pt: 'Moderno', de: 'Moderne' } as L6,
    earlyJazz: { ja: 'ラグタイム', en: 'Ragtime', es: 'Ragtime', ko: '래그타임', pt: 'Ragtime', de: 'Ragtime' } as L6,
    folk: { ja: '民俗音楽', en: 'Folk', es: 'Folk', ko: '민속음악', pt: 'Folk', de: 'Volksmusik' } as L6,
  },
};

export default function ClassicalLabPage() {
  return (
    <AuthGate appName="classical-lab">
      <LabInner />
    </AuthGate>
  );
}

function LabInner() {
  const { lang } = useLang();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pyodideRef = useRef<any>(null);
  const startedRef = useRef(false);
  const [pyodideStatus, setPyodideStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [loadProgress, setLoadProgress] = useState({ message: '', pct: 0 });

  const [selectedPiece, setSelectedPiece] = useState<LibraryPiece | null>(null);
  const [musicxml, setMusicxml] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzePhase, setAnalyzePhase] = useState<'idle' | 'fetching' | 'analyzing' | 'done' | 'error'>('idle');
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  // 楽曲ライブラリ（music21 corpus 全体・3500+ 曲）
  const [pieces, setPieces] = useState<LibraryPiece[]>([]);
  const [pieceLoading, setPieceLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [composerFilter, setComposerFilter] = useState('');
  const [eraFilter, setEraFilter] = useState('');

  const [showDevMode, setShowDevMode] = useState(false);

  // ライブラリ取得（検索 / 作曲家 / 時代フィルタが変わったら再取得）
  const fetchLibrary = useCallback(async () => {
    setPieceLoading(true);
    try {
      const params = new URLSearchParams();
      if (composerFilter) params.set('composer', composerFilter);
      if (eraFilter) params.set('era', eraFilter);
      if (search) params.set('search', search);
      params.set('limit', '200');

      const res = await fetch(`/api/classical/library?${params.toString()}`);
      if (!res.ok) {
        setPieces([]);
        return;
      }
      const data = await res.json();
      if (data._stub) {
        setPieces([]);
      } else {
        setPieces(data.pieces || []);
      }
    } catch {
      setPieces([]);
    } finally {
      setPieceLoading(false);
    }
  }, [composerFilter, eraFilter, search]);

  // Pyodide が ready になってから（または検索条件変化時に）ライブラリを取得
  useEffect(() => {
    if (pyodideStatus === 'ready') {
      fetchLibrary();
    }
  }, [pyodideStatus, fetchLibrary]);

  // Pyodide ロード（マウント時に 1 回だけ）
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setPyodideStatus('loading');

    (async () => {
      try {
        setLoadProgress({ message: t(LABELS.loading.pyodideScript, lang), pct: 5 });
        await loadPyodideScript();

        setLoadProgress({ message: t(LABELS.loading.pyodideRuntime, lang), pct: 25 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const py = await (window as any).loadPyodide({ indexURL: PYODIDE_BASE_URL });

        setLoadProgress({ message: t(LABELS.loading.micropip, lang), pct: 45 });
        await py.loadPackage(['micropip', 'numpy']);

        setLoadProgress({ message: t(LABELS.loading.music21, lang), pct: 65 });
        await py.runPythonAsync(`
import micropip, warnings
warnings.filterwarnings('ignore')
await micropip.install('music21')
        `);

        pyodideRef.current = py;
        setLoadProgress({ message: t(LABELS.loading.ready, lang), pct: 100 });
        setPyodideStatus('ready');
      } catch (e) {
        console.error('Pyodide load failed', e);
        setPyodideStatus('error');
        setLoadProgress({ message: e instanceof Error ? e.message : String(e), pct: 0 });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 楽曲選択 → 自動で分析実行
  const handlePieceSelect = useCallback(async (piece: LibraryPiece) => {
    setSelectedPiece(piece);
    setAnalysisResult(null);
    setAnalyzeError(null);
    setMusicxml(null);
    setAnalyzePhase('fetching');

    try {
      // 1. MusicXML を取得
      const res = await fetch('/api/classical/analyze-from-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ piece_id: piece.id }),
      });
      if (!res.ok) throw new Error('Failed to fetch piece');
      const data = await res.json();
      const mxml = data.musicxml;
      if (!mxml) throw new Error('No MusicXML in response');
      setMusicxml(mxml);

      // 2. Pyodide で分析実行
      setAnalyzePhase('analyzing');
      const py = pyodideRef.current;
      if (!py) throw new Error('Pyodide not ready');

      py.globals.set('score_xml', mxml);
      await py.runPythonAsync(ANALYSIS_PYTHON_SCRIPT);
      const jsonStr = py.runPython('_kuon_lab_result') as string;
      const result: AnalysisResult = JSON.parse(jsonStr);
      setAnalysisResult(result);
      setAnalyzePhase('done');
    } catch (e) {
      setAnalyzePhase('error');
      setAnalyzeError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  // ScoreViewer 用のローカライズラベル
  const scoreLabels = {
    rendering: t({ ja: '楽譜を描画中…', en: 'Rendering score…', es: 'Renderizando…', ko: '악보 렌더링 중…', pt: 'Renderizando…', de: 'Notenbild wird erstellt…' }, lang),
    renderError: t({ ja: '楽譜の描画に失敗', en: 'Score rendering failed', es: 'Error', ko: '실패', pt: 'Falha', de: 'Fehlgeschlagen' }, lang),
    cadenceLegend: t({ ja: 'カデンツ', en: 'Cadences', es: 'Cadencias', ko: '종지', pt: 'Cadências', de: 'Kadenzen' }, lang),
    modulationLegend: t({ ja: '転調', en: 'Modulations', es: 'Modulaciones', ko: '전조', pt: 'Modulações', de: 'Modulationen' }, lang),
    romanTrack: t({ ja: '小節別ローマ数字', en: 'Roman numerals by measure', es: 'Por compás', ko: '마디별', pt: 'Por compasso', de: 'Pro Takt' }, lang),
    measure: t({ ja: '小節', en: 'M.', es: 'C.', ko: '마디', pt: 'C.', de: 'T.' }, lang),
    cadenceTypes: {
      authentic: t({ ja: '完全終止', en: 'Authentic', es: 'Auténtica', ko: '완전 종지', pt: 'Autêntica', de: 'Authentisch' }, lang),
      plagal: t({ ja: '変格終止', en: 'Plagal', es: 'Plagal', ko: '변격', pt: 'Plagal', de: 'Plagal' }, lang),
      deceptive: t({ ja: '偽終止', en: 'Deceptive', es: 'De engaño', ko: '거짓', pt: 'Decetiva', de: 'Trugschluss' }, lang),
      half: t({ ja: '半終止', en: 'Half', es: 'Semicadencia', ko: '반종지', pt: 'Suspensiva', de: 'Halbschluss' }, lang),
    },
    functions: {
      tonic: t({ ja: '主和音', en: 'Tonic', es: 'Tónica', ko: '으뜸화음', pt: 'Tônica', de: 'Tonika' }, lang),
      predominant: t({ ja: '下属', en: 'Pre-dom', es: 'Subdom', ko: '버금딸림', pt: 'Subdom', de: 'Subdom' }, lang),
      dominant: t({ ja: '属', en: 'Dominant', es: 'Dominante', ko: '딸림', pt: 'Dominante', de: 'Dominante' }, lang),
      other: t({ ja: 'その他', en: 'Other', es: 'Otro', ko: '기타', pt: 'Outro', de: 'Sonstige' }, lang),
      unknown: '?',
    },
    playback: {
      title: t({ ja: '再生', en: 'Playback', es: 'Reproducción', ko: '재생', pt: 'Reprodução', de: 'Wiedergabe' }, lang),
      play: t({ ja: '再生', en: 'Play', es: 'Reproducir', ko: '재생', pt: 'Reproduzir', de: 'Abspielen' }, lang),
      pause: t({ ja: '一時停止', en: 'Pause', es: 'Pausar', ko: '일시정지', pt: 'Pausar', de: 'Pause' }, lang),
      restart: t({ ja: '最初から', en: 'Restart', es: 'Reiniciar', ko: '처음부터', pt: 'Reiniciar', de: 'Neu' }, lang),
      tempo: t({ ja: 'テンポ', en: 'Tempo', es: 'Tempo', ko: '템포', pt: 'Tempo', de: 'Tempo' }, lang),
      voices: t({ ja: '声部', en: 'Voices', es: 'Voces', ko: '성부', pt: 'Vozes', de: 'Stimmen' }, lang),
      loadingMidi: t({ ja: 'MIDI を読み込み中…', en: 'Loading MIDI…', es: 'Cargando…', ko: '로딩 중…', pt: 'Carregando…', de: 'Wird geladen…' }, lang),
      midiError: t({ ja: 'MIDI 再生不可', en: 'MIDI unavailable', es: 'No disponible', ko: '재생 불가', pt: 'Indisponível', de: 'Nicht verfügbar' }, lang),
      mute: t({ ja: 'ミュート', en: 'Mute', es: 'Silenciar', ko: '음소거', pt: 'Silenciar', de: 'Stumm' }, lang),
      solo: t({ ja: 'ソロ', en: 'Solo', es: 'Solo', ko: '솔로', pt: 'Solo', de: 'Solo' }, lang),
    },
  };

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

      {/* 警告（ロード前のみ） */}
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
            <div style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.8rem', fontFamily: serif }}>
              {loadProgress.message}
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: ACCENT, width: `${loadProgress.pct}%`, transition: 'width 0.4s ease' }} />
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

      {/* メイン UI（Pyodide 準備完了後のみ） */}
      {pyodideStatus === 'ready' && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* 楽曲ピッカー (music21 corpus 全 3500+ 曲アクセス) */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 'clamp(1.5rem, 3vw, 2rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)', fontWeight: 400, color: '#0f172a', margin: '0 0 1.2rem 0', letterSpacing: '0.02em' }}>
              📚 {t(LABELS.ui.pickPiece, lang)}
            </h2>

            {/* 検索 + 作曲家 + 時代フィルタ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.2rem' }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(LABELS.ui.searchPlaceholder, lang)}
                disabled={analyzePhase === 'fetching' || analyzePhase === 'analyzing'}
                style={{
                  width: '100%', padding: '0.7rem 1rem', fontSize: '0.95rem',
                  border: '1px solid #cbd5e1', borderRadius: 8, outline: 'none',
                  fontFamily: sans, background: '#fff', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
                <select
                  value={composerFilter}
                  onChange={(e) => setComposerFilter(e.target.value)}
                  disabled={analyzePhase === 'fetching' || analyzePhase === 'analyzing'}
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', background: '#fff', fontFamily: sans }}
                >
                  <option value="">{t(LABELS.ui.composerFilter, lang)}</option>
                  {STATIC_COMPOSERS.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.display} ({c.count})
                    </option>
                  ))}
                </select>
                <select
                  value={eraFilter}
                  onChange={(e) => setEraFilter(e.target.value)}
                  disabled={analyzePhase === 'fetching' || analyzePhase === 'analyzing'}
                  style={{ padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', background: '#fff', fontFamily: sans }}
                >
                  <option value="">{t(LABELS.ui.eraFilter, lang)}</option>
                  <option value="medieval">{t(LABELS.era.medieval, lang)}</option>
                  <option value="renaissance">{t(LABELS.era.renaissance, lang)}</option>
                  <option value="baroque">{t(LABELS.era.baroque, lang)}</option>
                  <option value="classical">{t(LABELS.era.classical, lang)}</option>
                  <option value="romantic">{t(LABELS.era.romantic, lang)}</option>
                  <option value="modern">{t(LABELS.era.modern, lang)}</option>
                  <option value="early-jazz">{t(LABELS.era.earlyJazz, lang)}</option>
                  <option value="folk">{t(LABELS.era.folk, lang)}</option>
                </select>
              </div>
            </div>

            {/* ライブラリの状態表示 */}
            {pieceLoading && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem', fontFamily: serif }}>
                {t(LABELS.ui.libraryLoading, lang)}
              </div>
            )}
            {!pieceLoading && pieces.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                {t(LABELS.ui.noResults, lang)}
              </div>
            )}

            {/* 楽曲グリッド (スクロール可能) */}
            {!pieceLoading && pieces.length > 0 && (
              <>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.6rem', fontFamily: mono }}>
                  {pieces.length} {t(LABELS.ui.pieceCount, lang)}
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '0.6rem',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  padding: '0.4rem',
                  border: '1px solid #f1f5f9',
                  borderRadius: 10,
                }}>
                  {pieces.map((p) => {
                    const isSelected = selectedPiece?.id === p.id;
                    const disabled = analyzePhase === 'fetching' || analyzePhase === 'analyzing';
                    return (
                      <button
                        key={p.id}
                        onClick={() => handlePieceSelect(p)}
                        disabled={disabled}
                        style={{
                          background: isSelected ? '#ede9fe' : '#f8fafc',
                          border: isSelected ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
                          borderRadius: 10, padding: '0.85rem 1rem', textAlign: 'left',
                          cursor: disabled ? 'wait' : 'pointer',
                          fontFamily: sans, transition: 'all 0.15s ease',
                          opacity: disabled && !isSelected ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected && !disabled) {
                            e.currentTarget.style.borderColor = ACCENT;
                            e.currentTarget.style.background = '#fff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#f8fafc';
                          }
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.03em' }}>{p.composer}</div>
                        <div style={{ fontFamily: serif, fontSize: '0.95rem', fontWeight: 500, color: '#0f172a', marginTop: 4, lineHeight: 1.3 }}>{p.title}</div>
                        {p.measures > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: mono, marginTop: 4 }}>
                            {p.key !== '—' ? `${p.key} · ` : ''}{p.measures} {t(LABELS.ui.measureWord, lang)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 分析中の状態表示 */}
          {(analyzePhase === 'fetching' || analyzePhase === 'analyzing') && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, margin: '0 auto 1rem', border: '3px solid #e2e8f0', borderTopColor: ACCENT, borderRadius: '50%', animation: 'lab-spin 0.8s linear infinite' }} />
              <style>{`@keyframes lab-spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontFamily: serif, fontSize: '1rem', color: '#475569' }}>
                {analyzePhase === 'fetching' ? t(LABELS.ui.fetchingPiece, lang) : t(LABELS.ui.analyzing, lang)}
              </div>
              {selectedPiece && (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.6rem', fontFamily: mono }}>
                  {selectedPiece.composer} — {selectedPiece.title}
                </div>
              )}
            </div>
          )}

          {/* 分析エラー */}
          {analyzePhase === 'error' && (
            <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 12, padding: '1.2rem 1.4rem', color: '#92400e' }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>⚠️ {t(LABELS.ui.analysisFailed, lang)}</div>
              {analyzeError && (
                <pre style={{ fontSize: '0.78rem', fontFamily: mono, whiteSpace: 'pre-wrap', margin: 0, opacity: 0.7 }}>
                  {analyzeError}
                </pre>
              )}
            </div>
          )}

          {/* 分析結果（ScoreViewer で楽譜 + 全分析を美しく表示） */}
          {analyzePhase === 'done' && analysisResult && musicxml && (
            <>
              {/* サマリーカード */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                <SummaryCard
                  label={t({ ja: '判定された調性', en: 'Detected key', es: 'Tonalidad', ko: '판정된 조성', pt: 'Tonalidade', de: 'Erkannte Tonart' }, lang)}
                  value={analysisResult.key}
                  color={ACCENT}
                />
                <SummaryCard
                  label={t({ ja: '確信度', en: 'Confidence', es: 'Confianza', ko: '신뢰도', pt: 'Confiança', de: 'Sicherheit' }, lang)}
                  value={`${Math.round(Math.max(0, Math.min(1, analysisResult.key_confidence)) * 100)}%`}
                  color="#0284c7"
                />
                <SummaryCard
                  label={t({ ja: '抽出した和音', en: 'Chords', es: 'Acordes', ko: '화음', pt: 'Acordes', de: 'Akkorde' }, lang)}
                  value={String(analysisResult.chord_count)}
                  color={PLAY_GREEN}
                />
                <SummaryCard
                  label={t({ ja: 'カデンツ', en: 'Cadences', es: 'Cadencias', ko: '종지', pt: 'Cadências', de: 'Kadenzen' }, lang)}
                  value={String(analysisResult.cadences.length)}
                  color={GOLD}
                />
              </div>

              {/* ScoreViewer 統合 — 楽譜 + ローマ数字 + カデンツ + 転調 + 再生 */}
              <ScoreViewer
                musicxml={musicxml}
                midiB64={analysisResult.midi_b64 ?? undefined}
                chords={analysisResult.chords}
                cadences={analysisResult.cadences}
                modulations={analysisResult.modulations}
                labels={scoreLabels}
              />
            </>
          )}

          {/* 開発者モード（デフォルト非表示・興味ある人だけ展開） */}
          {pyodideStatus === 'ready' && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <button
                onClick={() => setShowDevMode(!showDevMode)}
                style={{
                  background: 'transparent', border: 'none', color: '#94a3b8',
                  fontSize: '0.78rem', cursor: 'pointer', fontFamily: sans,
                  padding: '0.4rem 0', textDecoration: 'underline', textUnderlineOffset: 4,
                }}
              >
                {showDevMode ? t(LABELS.ui.devModeHide, lang) : t(LABELS.ui.devModeShow, lang)}
              </button>

              {showDevMode && (
                <div style={{ marginTop: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.2rem 1.4rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.8, margin: '0 0 1rem 0' }}>
                    {t(LABELS.ui.devModeIntro, lang)}
                  </p>
                  <pre style={{
                    background: '#0f172a', color: '#e2e8f0', padding: '1.2rem',
                    borderRadius: 8, fontFamily: mono, fontSize: '0.78rem',
                    lineHeight: 1.65, overflow: 'auto', maxHeight: 500,
                    margin: 0, whiteSpace: 'pre',
                  }}>
{ANALYSIS_PYTHON_SCRIPT.trim()}
                  </pre>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.8rem', fontFamily: mono }}>
                    Pyodide {PYODIDE_VERSION} · music21 (CPython on WebAssembly)
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
      padding: '1rem 1.2rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontFamily: serif, fontSize: '1.4rem', fontWeight: 600, color }}>
        {value}
      </div>
    </div>
  );
}

function loadPyodideScript(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).loadPyodide) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pyodide-loader]') as HTMLScriptElement | null;
    if (existing) {
      const onSuccess = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).loadPyodide) resolve();
        else reject(new Error('Script loaded but window.loadPyodide is not defined'));
      };
      existing.addEventListener('load', onSuccess);
      existing.addEventListener('error', () => reject(new Error('Existing script tag fired error event')));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).loadPyodide) resolve();
      return;
    }

    const url = `${PYODIDE_BASE_URL}pyodide.js`;
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.dataset.pyodideLoader = 'true';

    const timeoutId = setTimeout(() => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).loadPyodide) {
        resolve();
      } else {
        reject(new Error('Script loaded but window.loadPyodide is undefined.'));
      }
    };
    s.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Pyodide script load failed: ${url}`));
    };

    document.head.appendChild(s);
  });
}
