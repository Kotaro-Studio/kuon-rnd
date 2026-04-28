'use client';

/**
 * KUON CLASSICAL ANALYSIS
 * =========================================================
 * Common Practice (1600-1900) 楽曲をローマ数字で自動分析するツール。
 *
 * バックエンド：Cloud Run / Python / music21（CLAUDE.md §44.11 🟢 safe zone）
 * 600+ 曲のキュレーションライブラリ内蔵（music21 corpus + 後日 OpenScore Lieder 等を統合）。
 *
 * 機能：
 *   1. 楽曲ライブラリ検索 (作曲家・時代・キーワード)
 *   2. ワンクリック楽曲ロード → ローマ数字分析
 *   3. ファイルアップロード (MusicXML / MIDI) → 同様の分析
 *   4. 声部進行違反検出 (連続 5 度・8 度等)
 *   5. 転調マップ可視化
 *   6. カデンツ自動判定
 *
 * 注：このアプリは既存の /harmony (SATB リアルタイムチェッカー) とは別物。
 * /harmony = 4 音手入力の即時チェック
 * /classical = 楽曲全体の構造分析 (今ココ)
 */

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { AuthGate } from '@/components/AuthGate';

// OSMD は client-only で SSR 不可。next/dynamic で client side のみロード
// (CLAUDE.md §44.11 安全領域：score 描画は OSMD で堅牢実装)
const ScoreViewer = dynamic(() => import('@/components/ScoreViewer'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
      Loading score renderer…
    </div>
  ),
});

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

const ACCENT = '#5b21b6';      // 紫 — 学術的・知的な色合い
const GOLD = '#b45309';
const BG_CREAM = '#fafaf7';

type L6 = Partial<Record<Lang, string>> & { en: string };
const t = (m: L6, lang: Lang): string => m[lang] ?? m.en;

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

interface ChordData {
  measure: number;
  beat: number;
  chord: string;
  roman: string;
  function: string;
}

interface CadenceData {
  measure: number;
  beat: number;
  type: string;
  progression: string[];
}

interface ModulationData {
  from_measure: number;
  to_measure: number;
  key: string;
}

interface AnalysisResult {
  piece_id?: string;
  key: string;
  key_confidence: number;
  chords: ChordData[];
  cadences: CadenceData[];
  modulations: ModulationData[];
  chord_count: number;
  musicxml?: string; // バックエンドが描画用に echo back する MusicXML 文字列
}

const LABELS = {
  hero: {
    eyebrow: { ja: 'KUON CLASSICAL ANALYSIS', en: 'KUON CLASSICAL ANALYSIS', es: 'KUON CLASSICAL ANALYSIS', ko: 'KUON CLASSICAL ANALYSIS', pt: 'KUON CLASSICAL ANALYSIS', de: 'KUON CLASSICAL ANALYSIS' } as L6,
    title: {
      ja: 'Western art music を、\n科学的に読み解く。',
      en: 'Read Western art music\nwith scientific clarity.',
      es: 'Lea la música clásica\ncon claridad científica.',
      ko: '서양 클래식 음악을\n과학적으로 분석합니다.',
      pt: 'Leia música clássica\ncom clareza científica.',
      de: 'Klassische Musik wissenschaftlich\nverstehen — sofort.',
    } as L6,
    sub: {
      ja: 'バッハ・モーツァルト・ベートーベン・シューマン — 600+ 曲を内蔵。\nワンクリックでローマ数字分析・転調マップ・カデンツ検出。',
      en: 'Bach, Mozart, Beethoven, Schumann — 600+ pieces built-in.\nOne click for Roman numeral analysis, modulation map, cadence detection.',
      es: 'Bach, Mozart, Beethoven, Schumann — 600+ piezas integradas.\nUn clic para análisis con números romanos, mapa de modulaciones, detección de cadencias.',
      ko: '바흐·모차르트·베토벤·슈만 — 600+ 곡 내장.\n클릭 한 번으로 로마 숫자 분석·전조 맵·종지형 검출.',
      pt: 'Bach, Mozart, Beethoven, Schumann — 600+ peças incluídas.\nUm clique para análise por algarismos romanos, mapa de modulações, detecção de cadências.',
      de: 'Bach, Mozart, Beethoven, Schumann — 600+ Werke integriert.\nEin Klick für Stufenanalyse, Modulationskarte, Kadenz-Erkennung.',
    } as L6,
  },
  search: {
    placeholder: { ja: '作曲家・曲名で検索 (例: バッハ、Mozart, BWV 1)', en: 'Search by composer or title (e.g., Bach, Mozart, BWV 1)', es: 'Buscar por compositor o título', ko: '작곡가 또는 제목으로 검색', pt: 'Buscar por compositor ou título', de: 'Nach Komponist oder Titel suchen' } as L6,
    composer: { ja: '作曲家', en: 'Composer', es: 'Compositor', ko: '작곡가', pt: 'Compositor', de: 'Komponist' } as L6,
    era: { ja: '時代', en: 'Era', es: 'Época', ko: '시대', pt: 'Era', de: 'Epoche' } as L6,
    all: { ja: 'すべて', en: 'All', es: 'Todos', ko: '전체', pt: 'Todos', de: 'Alle' } as L6,
    baroque: { ja: 'バロック', en: 'Baroque', es: 'Barroco', ko: '바로크', pt: 'Barroco', de: 'Barock' } as L6,
    classical: { ja: '古典派', en: 'Classical', es: 'Clásico', ko: '고전파', pt: 'Clássico', de: 'Klassik' } as L6,
    romantic: { ja: 'ロマン派', en: 'Romantic', es: 'Romántico', ko: '낭만파', pt: 'Romântico', de: 'Romantik' } as L6,
  },
  picks: {
    selectPiece: { ja: '楽曲を選んで分析', en: 'Pick a piece to analyze', es: 'Elija una pieza para analizar', ko: '분석할 곡을 선택', pt: 'Escolha uma peça para analisar', de: 'Werk zur Analyse auswählen' } as L6,
    libraryCount: { ja: '内蔵ライブラリ', en: 'Built-in library', es: 'Biblioteca integrada', ko: '내장 라이브러리', pt: 'Biblioteca integrada', de: 'Integrierte Bibliothek' } as L6,
    pieces: { ja: '曲', en: 'pieces', es: 'piezas', ko: '곡', pt: 'peças', de: 'Werke' } as L6,
    measures: { ja: '小節', en: 'measures', es: 'compases', ko: '마디', pt: 'compassos', de: 'Takte' } as L6,
    analyze: { ja: '分析する', en: 'Analyze', es: 'Analizar', ko: '분석', pt: 'Analisar', de: 'Analysieren' } as L6,
    loading: { ja: 'ライブラリを読み込み中…', en: 'Loading library…', es: 'Cargando biblioteca…', ko: '라이브러리 로딩 중…', pt: 'Carregando biblioteca…', de: 'Bibliothek wird geladen…' } as L6,
    notReady: { ja: 'バックエンドサービスがまだ展開されていません。デプロイ後にご利用いただけます。', en: 'Backend service not yet deployed. Available after deployment.', es: 'Servicio backend aún no desplegado.', ko: '백엔드 서비스가 아직 배포되지 않았습니다.', pt: 'Serviço de backend ainda não implantado.', de: 'Backend-Dienst noch nicht bereitgestellt.' } as L6,
  },
  result: {
    heading: { ja: '分析結果', en: 'Analysis Result', es: 'Resultado del análisis', ko: '분석 결과', pt: 'Resultado da análise', de: 'Analyse-Ergebnis' } as L6,
    detectedKey: { ja: '判定された調性', en: 'Detected key', es: 'Tonalidad detectada', ko: '판정된 조성', pt: 'Tonalidade detectada', de: 'Erkannte Tonart' } as L6,
    confidence: { ja: '確信度', en: 'Confidence', es: 'Confianza', ko: '신뢰도', pt: 'Confiança', de: 'Sicherheit' } as L6,
    chordCount: { ja: '抽出した和音数', en: 'Chords extracted', es: 'Acordes extraídos', ko: '추출된 화음 수', pt: 'Acordes extraídos', de: 'Erfasste Akkorde' } as L6,
    cadences: { ja: 'カデンツ', en: 'Cadences', es: 'Cadencias', ko: '종지', pt: 'Cadências', de: 'Kadenzen' } as L6,
    modulations: { ja: '転調', en: 'Modulations', es: 'Modulaciones', ko: '전조', pt: 'Modulações', de: 'Modulationen' } as L6,
    chordList: { ja: '和音リスト', en: 'Chord progression', es: 'Progresión de acordes', ko: '화음 진행', pt: 'Progressão de acordes', de: 'Akkordfolge' } as L6,
    measure: { ja: '小節', en: 'M.', es: 'C.', ko: '마디', pt: 'C.', de: 'T.' } as L6,
    beat: { ja: '拍', en: 'Beat', es: 'Tiempo', ko: '박', pt: 'Tempo', de: 'Schlag' } as L6,
    chord: { ja: '和音', en: 'Chord', es: 'Acorde', ko: '화음', pt: 'Acorde', de: 'Akkord' } as L6,
    roman: { ja: 'ローマ数字', en: 'Roman', es: 'Romano', ko: '로마 숫자', pt: 'Romano', de: 'Stufe' } as L6,
    func: { ja: '機能', en: 'Function', es: 'Función', ko: '기능', pt: 'Função', de: 'Funktion' } as L6,
    cadenceTypes: {
      authentic: { ja: '完全終止', en: 'Authentic', es: 'Auténtica', ko: '완전 종지', pt: 'Autêntica', de: 'Authentisch' } as L6,
      plagal: { ja: '変格終止', en: 'Plagal', es: 'Plagal', ko: '변격 종지', pt: 'Plagal', de: 'Plagal' } as L6,
      deceptive: { ja: '偽終止', en: 'Deceptive', es: 'De engaño', ko: '거짓 종지', pt: 'Decetiva', de: 'Trugschluss' } as L6,
      half: { ja: '半終止', en: 'Half', es: 'Semicadencia', ko: '반종지', pt: 'Suspensiva', de: 'Halbschluss' } as L6,
    },
  },
  cta: {
    upgrade: { ja: 'プランをアップグレード', en: 'Upgrade plan', es: 'Mejorar plan', ko: '플랜 업그레이드', pt: 'Atualizar plano', de: 'Plan upgraden' } as L6,
    learnMore: { ja: '詳しく見る', en: 'Learn more', es: 'Más información', ko: '자세히 보기', pt: 'Saiba mais', de: 'Mehr erfahren' } as L6,
  },
};

const COMPOSER_OPTIONS = [
  { value: '', label: { ja: 'すべての作曲家', en: 'All composers', es: 'Todos los compositores', ko: '모든 작곡가', pt: 'Todos compositores', de: 'Alle Komponisten' } as L6 },
  { value: 'bach', label: { ja: 'J.S. バッハ', en: 'J.S. Bach', es: 'J.S. Bach', ko: 'J.S. 바흐', pt: 'J.S. Bach', de: 'J.S. Bach' } as L6 },
  { value: 'mozart', label: { ja: 'モーツァルト', en: 'Mozart', es: 'Mozart', ko: '모차르트', pt: 'Mozart', de: 'Mozart' } as L6 },
  { value: 'haydn', label: { ja: 'ハイドン', en: 'Haydn', es: 'Haydn', ko: '하이든', pt: 'Haydn', de: 'Haydn' } as L6 },
  { value: 'beethoven', label: { ja: 'ベートーベン', en: 'Beethoven', es: 'Beethoven', ko: '베토벤', pt: 'Beethoven', de: 'Beethoven' } as L6 },
  { value: 'palestrina', label: { ja: 'パレストリーナ', en: 'Palestrina', es: 'Palestrina', ko: '팔레스트리나', pt: 'Palestrina', de: 'Palestrina' } as L6 },
];

export default function ClassicalAnalysisPage() {
  return (
    <AuthGate appName="classical">
      <ClassicalAnalysisInner />
    </AuthGate>
  );
}

function ClassicalAnalysisInner() {
  const { lang } = useLang();
  const [pieces, setPieces] = useState<LibraryPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [composerFilter, setComposerFilter] = useState('');
  const [eraFilter, setEraFilter] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [serviceReady, setServiceReady] = useState(true);

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (composerFilter) params.set('composer', composerFilter);
      if (eraFilter) params.set('era', eraFilter);
      if (search) params.set('search', search);
      params.set('limit', '50');

      const res = await fetch(`/api/classical/library?${params.toString()}`);
      if (!res.ok) {
        setServiceReady(false);
        setPieces([]);
        return;
      }
      const data = await res.json();
      if (data._stub) {
        setServiceReady(false);
        setPieces([]);
      } else {
        setPieces(data.pieces || []);
        setServiceReady(true);
      }
    } catch {
      setServiceReady(false);
      setPieces([]);
    } finally {
      setLoading(false);
    }
  }, [composerFilter, eraFilter, search]);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const handleAnalyze = async (piece: LibraryPiece) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch('/api/classical/analyze-from-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ piece_id: piece.id }),
      });
      if (!res.ok) {
        alert('Analysis failed. Service may not be deployed yet.');
        return;
      }
      const data = await res.json();
      setAnalysisResult(data);
    } catch {
      alert('Network error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG_CREAM, fontFamily: sans, color: '#0f172a' }}>
      {/* Hero */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) 1.5rem clamp(2rem, 5vw, 3rem)', maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: ACCENT, fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase' }}>
          {t(LABELS.hero.eyebrow, lang)}
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 400, lineHeight: 1.4, color: '#0f172a', marginBottom: '1.2rem', whiteSpace: 'pre-line', letterSpacing: '0.02em' }}>
          {t(LABELS.hero.title, lang)}
        </h1>
        <p style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1.05rem)', color: '#475569', lineHeight: 1.85, maxWidth: 720, margin: '0 auto', whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
          {t(LABELS.hero.sub, lang)}
        </p>
      </section>

      {/* Library + Filter Section */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 'clamp(1.5rem, 3vw, 2.5rem)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>

          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 400, color: '#0f172a', margin: '0 0 1.5rem 0', letterSpacing: '0.02em' }}>
            📚 {t(LABELS.picks.selectPiece, lang)}
          </h2>

          {/* Search + Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(LABELS.search.placeholder, lang)}
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
                style={{ padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', background: '#fff', fontFamily: sans }}
              >
                {COMPOSER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.label, lang)}</option>
                ))}
              </select>
              <select
                value={eraFilter}
                onChange={(e) => setEraFilter(e.target.value)}
                style={{ padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.9rem', background: '#fff', fontFamily: sans }}
              >
                <option value="">{t(LABELS.search.all, lang)} ({t(LABELS.search.era, lang)})</option>
                <option value="baroque">{t(LABELS.search.baroque, lang)}</option>
                <option value="classical">{t(LABELS.search.classical, lang)}</option>
                <option value="romantic">{t(LABELS.search.romantic, lang)}</option>
              </select>
            </div>
          </div>

          {/* Loading / Empty */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
              {t(LABELS.picks.loading, lang)}
            </div>
          )}

          {!loading && !serviceReady && (
            <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 10, padding: '1.5rem', fontSize: '0.9rem', color: '#92400e', lineHeight: 1.7 }}>
              ⚠️ {t(LABELS.picks.notReady, lang)}
              <br /><br />
              <code style={{ fontSize: '0.78rem', fontFamily: mono, color: '#7c2d12' }}>
                Cloud Run service: kuon-classical-service<br />
                Required env: CLASSICAL_URL, CLASSICAL_SECRET
              </code>
            </div>
          )}

          {!loading && serviceReady && pieces.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              No matching pieces found.
            </div>
          )}

          {/* Piece Grid */}
          {!loading && serviceReady && pieces.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto', padding: '0.5rem' }}>
              {pieces.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAnalyze(p)}
                  disabled={analyzing}
                  style={{
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                    padding: '1rem', textAlign: 'left', cursor: analyzing ? 'wait' : 'pointer',
                    fontFamily: sans, transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!analyzing) {
                      e.currentTarget.style.borderColor = ACCENT;
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>{p.composer}</div>
                  <div style={{ fontFamily: serif, fontSize: '1rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 500 }}>{p.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: mono }}>
                    {p.key} · {p.measures} {t(LABELS.picks.measures, lang)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Result Section */}
        {analyzing && (
          <div style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 40, height: 40, margin: '0 auto 1rem', border: '3px solid #e2e8f0', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Analyzing…</div>
          </div>
        )}

        {analysisResult && (
          <ResultPanel result={analysisResult} lang={lang} />
        )}
      </section>
    </div>
  );
}

function ResultPanel({ result, lang }: { result: AnalysisResult; lang: Lang }) {
  // 確信度の防御的キャップ：Cloud Run 側でも clamp しているが、古いバージョンが
  // デプロイ中の過渡期や手動 MusicXML 入力時の保険として、フロントでも 0-100% に制限
  const confidencePct = Math.round(Math.max(0, Math.min(1, result.key_confidence)) * 100);

  // ScoreViewer に渡すローカライズラベル
  const scoreLabels = {
    rendering: t({ ja: '楽譜を描画中…', en: 'Rendering score…', es: 'Renderizando partitura…', ko: '악보 렌더링 중…', pt: 'Renderizando partitura…', de: 'Notenbild wird erstellt…' }, lang),
    renderError: t({ ja: '楽譜の描画に失敗', en: 'Score rendering failed', es: 'Error al renderizar partitura', ko: '악보 렌더링 실패', pt: 'Falha na renderização', de: 'Notenbild fehlgeschlagen' }, lang),
    cadenceLegend: t(LABELS.result.cadences, lang),
    modulationLegend: t(LABELS.result.modulations, lang),
    romanTrack: t({ ja: '小節別ローマ数字', en: 'Roman numerals by measure', es: 'Números romanos por compás', ko: '마디별 로마 숫자', pt: 'Algarismos romanos por compasso', de: 'Stufen pro Takt' }, lang),
    measure: t(LABELS.result.measure, lang),
    cadenceTypes: {
      authentic: t(LABELS.result.cadenceTypes.authentic, lang),
      plagal: t(LABELS.result.cadenceTypes.plagal, lang),
      deceptive: t(LABELS.result.cadenceTypes.deceptive, lang),
      half: t(LABELS.result.cadenceTypes.half, lang),
    },
    functions: {
      tonic: t({ ja: '主和音', en: 'Tonic', es: 'Tónica', ko: '으뜸화음', pt: 'Tônica', de: 'Tonika' }, lang),
      predominant: t({ ja: '下属', en: 'Pre-dom', es: 'Subdominante', ko: '버금딸림', pt: 'Subdominante', de: 'Subdominante' }, lang),
      dominant: t({ ja: '属', en: 'Dominant', es: 'Dominante', ko: '딸림', pt: 'Dominante', de: 'Dominante' }, lang),
      other: t({ ja: 'その他', en: 'Other', es: 'Otro', ko: '기타', pt: 'Outro', de: 'Sonstige' }, lang),
      unknown: '?',
    },
  };

  return (
    <div style={{ marginTop: '2rem', background: '#fff', borderRadius: 16, padding: 'clamp(1.5rem, 3vw, 2.5rem)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 400, color: '#0f172a', margin: '0 0 1.5rem 0' }}>
        🎼 {t(LABELS.result.heading, lang)}
      </h2>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        <SummaryCard label={t(LABELS.result.detectedKey, lang)} value={result.key} accent={ACCENT} />
        <SummaryCard label={t(LABELS.result.confidence, lang)} value={`${confidencePct}%`} accent="#0284c7" />
        <SummaryCard label={t(LABELS.result.chordCount, lang)} value={String(result.chord_count)} accent="#10b981" />
        <SummaryCard label={t(LABELS.result.cadences, lang)} value={String(result.cadences.length)} accent={GOLD} />
      </div>

      {/* OSMD で楽譜描画（IQ190 の核心）：MusicXML がレスポンスに含まれていれば描画 */}
      {result.musicxml && (
        <div style={{ marginBottom: '2.5rem' }}>
          <ScoreViewer
            musicxml={result.musicxml}
            chords={result.chords}
            cadences={result.cadences}
            modulations={result.modulations}
            labels={scoreLabels}
          />
        </div>
      )}

      {/* Cadences */}
      {result.cadences.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 500, marginBottom: '0.8rem', color: '#0f172a' }}>
            🎵 {t(LABELS.result.cadences, lang)}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {result.cadences.map((c, i) => {
              const cadenceLabel = LABELS.result.cadenceTypes[c.type as keyof typeof LABELS.result.cadenceTypes];
              return (
                <div key={i} style={{ background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: 8, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>
                    {t(LABELS.result.measure, lang)} {c.measure}.{c.beat}
                  </span>
                  <span style={{ fontWeight: 600, color: ACCENT }}>
                    {cadenceLabel ? t(cadenceLabel, lang) : c.type}
                  </span>
                  <span style={{ fontFamily: mono, color: '#475569' }}>
                    {c.progression.join(' → ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modulations */}
      {result.modulations.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 500, marginBottom: '0.8rem', color: '#0f172a' }}>
            🔀 {t(LABELS.result.modulations, lang)}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {result.modulations.map((m, i) => (
              <div key={i} style={{ background: '#fef3c7', border: '1px solid #fbbf24', padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.8rem', color: '#92400e', fontFamily: mono }}>
                {t(LABELS.result.measure, lang)} {m.from_measure}-{m.to_measure}: <strong>{m.key}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chord progression */}
      {result.chords.length > 0 && (
        <div>
          <h3 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 500, marginBottom: '0.8rem', color: '#0f172a' }}>
            🎶 {t(LABELS.result.chordList, lang)}
          </h3>
          <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>{t(LABELS.result.measure, lang)}</th>
                  <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>{t(LABELS.result.beat, lang)}</th>
                  <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>{t(LABELS.result.chord, lang)}</th>
                  <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: ACCENT, letterSpacing: '0.05em' }}>{t(LABELS.result.roman, lang)}</th>
                  <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>{t(LABELS.result.func, lang)}</th>
                </tr>
              </thead>
              <tbody>
                {result.chords.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.5rem', fontFamily: mono, color: '#64748b' }}>{c.measure}</td>
                    <td style={{ padding: '0.5rem', fontFamily: mono, color: '#94a3b8' }}>{c.beat}</td>
                    <td style={{ padding: '0.5rem', color: '#0f172a' }}>{c.chord}</td>
                    <td style={{ padding: '0.5rem', fontFamily: serif, fontSize: '1rem', fontWeight: 600, color: ACCENT }}>{c.roman}</td>
                    <td style={{ padding: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>{c.function}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: serif, fontSize: '1.4rem', fontWeight: 600, color: accent }}>{value}</div>
    </div>
  );
}
