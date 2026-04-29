'use client';

/**
 * /theory/m0/l01 — M0-01「五線と音名」
 * =========================================================
 * Music Theory Suite MVP 第 1 弾。
 * Layer 1 + Layer 2 + Layer 3 の 3 層構造を実証。
 * Pyodide ロード戦略 (Layer 1 を読みながら裏で準備) を実証。
 *
 * 設計原則:
 *   - CLAUDE.md §47 (5 セクション → 3 レイヤーへ統合)
 *   - CLAUDE.md §48 (余白の知性)
 *   - CLAUDE.md §49 (正解/不正解の二項対立を排する・前衛即興哲学)
 *
 * Layer 1 (Story): 明朝で書かれた短いエッセイ。Pyodide ロード中も完全に読める。
 * Layer 2 (Living Score): 譜表 SVG + Web Audio API で本物の音と対話。
 *                          Pyodide が裏でロード完了後、生成練習モードが解放される。
 * Layer 3 (Memory): フラッシュカード placeholder (FSRS は Phase 2)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─── Pyodide global type (declared in CDN script) ───
declare global {
  interface Window {
    loadPyodide?: (config?: Record<string, unknown>) => Promise<unknown>;
    __kuonPyodide?: unknown;
  }
}

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE_COLOR = '#d4d0c4';
const ACCENT_INDIGO = '#3a3a5e';
const ACCENT_GOLD = '#9c7c3a';

type L6 = { ja?: string; en: string; es?: string; ko?: string; pt?: string; de?: string };
const t = (m: L6, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

// ─────────────────────────────────────────────────────────────
// 音名データ (treble clef・middle C 周辺の白鍵 7 音 + middle C)
// ─────────────────────────────────────────────────────────────
interface NoteDef {
  pitch: string;       // 'C4', 'D4' ...
  letter: string;      // 'C', 'D' ...
  ja: string;          // ハニホヘトイロ
  fixedDo: string;     // do, re, mi (固定ド)
  // staff position: 0 = bottom line (E4), 1 = F4 space, 2 = G4 line, ...
  // -2 = middle C ledger line (below staff), -1 = D4 space below staff
  staffPos: number;
  freq: number;        // Hz (A4 = 440)
}

const NOTES: NoteDef[] = [
  { pitch: 'C4', letter: 'C', ja: 'ハ', fixedDo: 'do',  staffPos: -2, freq: 261.63 },
  { pitch: 'D4', letter: 'D', ja: 'ニ', fixedDo: 're',  staffPos: -1, freq: 293.66 },
  { pitch: 'E4', letter: 'E', ja: 'ホ', fixedDo: 'mi',  staffPos: 0,  freq: 329.63 },
  { pitch: 'F4', letter: 'F', ja: 'ヘ', fixedDo: 'fa',  staffPos: 1,  freq: 349.23 },
  { pitch: 'G4', letter: 'G', ja: 'ト', fixedDo: 'sol', staffPos: 2,  freq: 392.00 },
  { pitch: 'A4', letter: 'A', ja: 'イ', fixedDo: 'la',  staffPos: 3,  freq: 440.00 },
  { pitch: 'B4', letter: 'B', ja: 'ロ', fixedDo: 'si',  staffPos: 4,  freq: 493.88 },
  { pitch: 'C5', letter: 'C', ja: 'ハ', fixedDo: 'do',  staffPos: 5,  freq: 523.25 },
];

// ─────────────────────────────────────────────────────────────
// Layer 3: フラッシュカード (FSRS placeholder)
// ─────────────────────────────────────────────────────────────
interface Flashcard {
  q: L6;
  a: L6;
}

const FLASHCARDS: Flashcard[] = [
  {
    q: { ja: 'ト音記号の譜表で、第 3 線にある音は?', en: 'On a treble-clef staff, what note sits on the 3rd line?', es: '¿Qué nota está en la 3ª línea de la clave de sol?', ko: '높은음자리표 제 3 선의 음은?', pt: 'Que nota fica na 3ª linha da clave de sol?', de: 'Welche Note liegt auf der 3. Linie im Violinschlüssel?' },
    a: { ja: 'B (シ・ロ)', en: 'B', es: 'B (si)', ko: 'B (시)', pt: 'B (si)', de: 'H (B)' },
  },
  {
    q: { ja: 'ミドル C (中央のド) は譜表のどこにある?', en: 'Where is middle C on the treble-clef staff?', es: '¿Dónde está el do central en la clave de sol?', ko: '가운데 C 는 어디?', pt: 'Onde está o dó central?', de: 'Wo liegt das eingestrichene C im Violinschlüssel?' },
    a: { ja: '譜表の下、加線 1 本上に置かれる', en: 'Below the staff, on the first ledger line.', es: 'Bajo el pentagrama, en la primera línea adicional.', ko: '오선 아래 첫 번째 가선.', pt: 'Abaixo da pauta, na primeira linha suplementar.', de: 'Unter dem System, auf der ersten Hilfslinie.' },
  },
  {
    q: { ja: '譜表の 5 本の線、下から順に読むと?', en: 'The 5 lines of the staff, from bottom to top?', es: 'Las 5 líneas del pentagrama, de abajo arriba?', ko: '오선 다섯 줄, 아래부터?', pt: 'As 5 linhas da pauta, de baixo para cima?', de: 'Die 5 Linien des Notensystems, von unten nach oben?' },
    a: { ja: 'E - G - B - D - F (ミ・ソ・シ・レ・ファ)', en: 'E - G - B - D - F', es: 'E - G - B - D - F', ko: 'E - G - B - D - F', pt: 'E - G - B - D - F', de: 'E - G - H - D - F' },
  },
  {
    q: { ja: '日本式音名で「ハ」は西洋式で何?', en: 'In Japanese, "ha" (ハ) corresponds to what Western letter?', es: '¿La "ha" japonesa corresponde a qué nota occidental?', ko: '일본식 음명 "ハ" 는 서양식으로 무엇?', pt: 'Em japonês, "ha" (ハ) corresponde a qual nota ocidental?', de: 'Japanisch „ha" (ハ) entspricht welcher westlichen Note?' },
    a: { ja: 'C', en: 'C', es: 'C', ko: 'C', pt: 'C', de: 'C' },
  },
  {
    q: { ja: '固定ドのソルフェージュで「sol」は何?', en: 'In fixed-do solfège, what letter is "sol"?', es: 'En solfeo fijo, ¿qué nota es "sol"?', ko: '고정도 솔페지오에서 "sol" 은?', pt: 'No solfejo fixo, "sol" é qual nota?', de: 'Im festen Do-System: welche Note ist "sol"?' },
    a: { ja: 'G', en: 'G', es: 'G', ko: 'G', pt: 'G', de: 'G' },
  },
];

// ─────────────────────────────────────────────────────────────
// Web Audio で音を鳴らす (シンプルなサイン + AD エンベロープ)
// ─────────────────────────────────────────────────────────────
function playNote(freq: number) {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.9);
  setTimeout(() => ctx.close(), 950);
}

// ─────────────────────────────────────────────────────────────
// メイン
// ─────────────────────────────────────────────────────────────
type PracticeMode = 'identify' | 'listen' | 'free';
type PyodideState = 'idle' | 'loading' | 'ready' | 'failed';

export default function LessonM0L01() {
  const { lang } = useLang();
  const [mode, setMode] = useState<PracticeMode>('identify');
  const [pyodideState, setPyodideState] = useState<PyodideState>('idle');
  const startedRef = useRef(false);

  // ─── Bravura SMuFL フォントの非同期ロード (ト音記号描画用) ───
  // 247KB を /public/fonts/Bravura.woff2 から自ホスト
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const styleId = 'kuon-bravura-face';
    if (!document.getElementById(styleId)) {
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = `@font-face { font-family: 'Bravura'; src: url('/fonts/Bravura.woff2') format('woff2'); font-display: swap; }`;
      document.head.appendChild(s);
    }
  }, []);

  // ─── Pyodide バックグラウンドロード戦略 ───
  // Layer 1 を読んでいる間に裏でロードを開始する。
  // 失敗してもアプリは止まらない (生成モードが使えないだけ)。
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // 既に他のページで読み込み済みなら再利用
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
        if (!window.loadPyodide) throw new Error('loadPyodide not available');
        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
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

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>

      {/* ═══════ パンくず + タイトル ═══════ */}
      <div style={{
        maxWidth: 880,
        margin: '0 auto',
        padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2rem)',
      }}>
        <div style={{
          fontFamily: sans,
          fontSize: '0.78rem',
          color: INK_SOFT,
          letterSpacing: '0.05em',
          marginBottom: '1.4rem',
        }}>
          <Link href="/theory" style={{ color: INK_SOFT, textDecoration: 'none' }}>
            ← {t({ ja: '目次へ戻る', en: 'Back to contents', es: 'Volver al índice', ko: '목차로 돌아가기', pt: 'Voltar ao índice', de: 'Zum Inhalt zurück' }, lang)}
          </Link>
        </div>
        <div style={{
          fontFamily: mono,
          fontSize: '0.7rem',
          color: INK_FAINT,
          letterSpacing: '0.28em',
          marginBottom: '0.7rem',
        }}>
          M0 · LESSON 01
        </div>
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.85rem, 4.5vw, 2.85rem)',
          fontWeight: 400,
          letterSpacing: '0.04em',
          lineHeight: 1.4,
          margin: 0,
          color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '五線と音名',
            en: 'The Staff and Pitch Names',
            es: 'El pentagrama y los nombres de las notas',
            ko: '오선과 음이름',
            pt: 'A pauta e os nomes das notas',
            de: 'Notensystem und Tonnamen',
          }, lang)}
        </h1>
      </div>

      {/* ═══════ Layer 1: STORY ═══════ */}
      <section style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)',
      }}>
        <LayerLabel num="I" name={t({ ja: '物語', en: 'Story', es: 'Historia', ko: '이야기', pt: 'História', de: 'Geschichte' }, lang)} />
        <div style={{
          fontFamily: serif,
          fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          color: INK,
          lineHeight: 2.05,
          letterSpacing: '0.03em',
          wordBreak: 'keep-all' as const,
        }}>
          <p style={{ margin: '0 0 1.6rem 0' }}>
            {t({
              ja: '11 世紀のイタリアの修道士グイド・ダレッツォは、歌い手たちが旋律を覚える方法を変えました。彼は 4 本の平行線を引き、その上に音符を置いた。これが現代の五線の原型です。',
              en: 'In 11th-century Italy, the monk Guido of Arezzo changed the way singers learned melodies. He drew four parallel lines and placed notes upon them. This was the ancestor of the modern five-line staff.',
              es: 'En la Italia del siglo XI, el monje Guido de Arezzo transformó la forma en que los cantantes aprendían melodías. Trazó cuatro líneas paralelas y colocó notas sobre ellas — el ancestro del pentagrama moderno.',
              ko: '11 세기 이탈리아의 수도사 귀도 다레초는 노래꾼들이 선율을 익히는 방법을 바꾸었습니다. 그는 평행한 네 개의 줄을 긋고 그 위에 음표를 올렸습니다 — 현대 오선의 선조.',
              pt: 'Na Itália do século XI, o monge Guido d\'Arezzo transformou como os cantores aprendiam melodias. Traçou quatro linhas paralelas e colocou notas sobre elas — o ancestral da pauta moderna.',
              de: 'Im Italien des 11. Jahrhunderts veränderte der Mönch Guido von Arezzo, wie Sänger Melodien erlernten. Er zog vier parallele Linien und setzte Noten darauf — der Ahn des modernen Notensystems.',
            }, lang)}
          </p>
          <p style={{ margin: '0 0 1.6rem 0' }}>
            {t({
              ja: '1000 年経った今も、私たちは 5 本の線と 4 つのスペースの上で、音楽の高さを記録しています。下から E・G・B・D・F の線、F・A・C・E のスペース。これがト音記号 (高音部譜表) の世界です。',
              en: 'A thousand years later, we still notate pitch on five lines and four spaces. The lines from bottom up — E, G, B, D, F. The spaces — F, A, C, E. This is the world of the treble clef.',
              es: 'Mil años después, seguimos anotando la altura en cinco líneas y cuatro espacios. Las líneas, de abajo arriba: E, G, B, D, F. Los espacios: F, A, C, E. Este es el mundo de la clave de sol.',
              ko: '천 년이 지난 지금도, 우리는 다섯 줄과 네 칸 위에 음의 높이를 기록합니다. 아래부터 줄은 E·G·B·D·F, 칸은 F·A·C·E. 이것이 높은음자리표의 세계입니다.',
              pt: 'Mil anos depois, ainda anotamos a altura em cinco linhas e quatro espaços. As linhas, de baixo para cima: E, G, B, D, F. Os espaços: F, A, C, E. Este é o mundo da clave de sol.',
              de: 'Tausend Jahre später notieren wir Tonhöhen noch immer auf fünf Linien und vier Zwischenräumen. Linien von unten: E, G, H, D, F. Zwischenräume: F, A, C, E. Das ist die Welt des Violinschlüssels.',
            }, lang)}
          </p>
          <p style={{ margin: 0 }}>
            {t({
              ja: '音の名前は、文化によって違います。西洋式は C・D・E・F・G・A・B。日本式はハ・ニ・ホ・ヘ・ト・イ・ロ。固定ドのソルフェージュは do・re・mi・fa・sol・la・si。どれも正しく、どれも一つの選択です。',
              en: 'The names of pitches differ by culture. The Western letters: C, D, E, F, G, A, B. The Japanese: ha, ni, ho, he, to, i, ro. The fixed-do solfège: do, re, mi, fa, sol, la, si. All are correct. Each is one choice among many.',
              es: 'Los nombres de las notas varían entre culturas. Letras occidentales: C, D, E, F, G, A, B. Japonés: ha, ni, ho, he, to, i, ro. Solfeo fijo: do, re, mi, fa, sol, la, si. Todos son correctos — cada uno es una elección entre varias.',
              ko: '음의 이름은 문화마다 다릅니다. 서양식 C·D·E·F·G·A·B. 일본식 ハ·ニ·ホ·ヘ·ト·イ·ロ. 고정도 솔페지오 do·re·mi·fa·sol·la·si. 모두 맞으며, 각각이 하나의 선택입니다.',
              pt: 'Os nomes das notas variam por cultura. Letras ocidentais: C, D, E, F, G, A, B. Japonês: ha, ni, ho, he, to, i, ro. Solfejo fixo: do, re, mi, fa, sol, la, si. Todos corretos — cada um é uma escolha.',
              de: 'Tonnamen variieren je nach Kultur. Westlich: C, D, E, F, G, A, H. Japanisch: ha, ni, ho, he, to, i, ro. Festes Do: do, re, mi, fa, sol, la, si. Alle sind richtig — jede ist eine Wahl unter vielen.',
            }, lang)}
          </p>
        </div>
      </section>

      {/* ═══════ Layer 2: LIVING SCORE ═══════ */}
      <section style={{
        background: '#fff',
        borderTop: `1px solid ${STAFF_LINE_COLOR}`,
        borderBottom: `1px solid ${STAFF_LINE_COLOR}`,
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <LayerLabel
            num="II"
            name={t({ ja: 'Living Score (本物の譜と対話する)', en: 'Living Score (dialogue with real notation)', es: 'Living Score (diálogo con la notación)', ko: 'Living Score (악보와 대화)', pt: 'Living Score (diálogo com a pauta)', de: 'Living Score (Dialog mit Notation)' }, lang)}
          />

          {/* Pyodide ステータス (微小・装飾的) */}
          <PyodideBadge state={pyodideState} lang={lang} />

          {/* モード切替 */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: 'clamp(1.4rem, 3vw, 2rem)',
            flexWrap: 'wrap',
          }}>
            <ModeButton active={mode === 'identify'} onClick={() => setMode('identify')}
              label={t({ ja: '読む (見て答える)', en: 'Identify', es: 'Identificar', ko: '읽기', pt: 'Identificar', de: 'Erkennen' }, lang)} />
            <ModeButton active={mode === 'listen'} onClick={() => setMode('listen')}
              label={t({ ja: '聴く (聴いて答える)', en: 'Listen', es: 'Escuchar', ko: '듣기', pt: 'Ouvir', de: 'Hören' }, lang)} />
            <ModeButton active={mode === 'free'} onClick={() => setMode('free')}
              label={t({ ja: '自由探索', en: 'Free play', es: 'Exploración libre', ko: '자유 탐색', pt: 'Exploração livre', de: 'Freie Erkundung' }, lang)} />
          </div>

          {/* モードに応じた本体 */}
          {mode === 'identify' && <IdentifyMode lang={lang} />}
          {mode === 'listen' && <ListenMode lang={lang} />}
          {mode === 'free' && <FreePlayMode lang={lang} />}
        </div>
      </section>

      {/* ═══════ Layer 3: MEMORY ═══════ */}
      <section style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)',
      }}>
        <LayerLabel num="III" name={t({ ja: '記憶 (フラッシュカード)', en: 'Memory (Flashcards)', es: 'Memoria (Tarjetas)', ko: '기억 (플래시카드)', pt: 'Memória (Cartões)', de: 'Erinnern (Karten)' }, lang)} />
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: '0.9rem',
          color: INK_SOFT,
          marginBottom: '1.5rem',
          lineHeight: 1.85,
        }}>
          {t({
            ja: 'カードをクリックして答えを確認します。本実装では FSRS (Free Spaced Repetition Scheduler) によって最適タイミングで再出題されます。',
            en: 'Click any card to flip and reveal the answer. In production, the FSRS algorithm will resurface cards at scientifically optimal intervals.',
            es: 'Haz clic en cualquier tarjeta para ver la respuesta. En producción, el algoritmo FSRS reaparecerá las tarjetas en intervalos óptimos.',
            ko: '카드를 클릭하여 답을 확인하세요. 본 구현에서는 FSRS 알고리즘이 최적 간격으로 재출제합니다.',
            pt: 'Clique em qualquer cartão para ver a resposta. Em produção, o algoritmo FSRS reapresentará os cartões em intervalos ótimos.',
            de: 'Klicken Sie eine Karte, um die Antwort zu sehen. Im Vollbetrieb präsentiert der FSRS-Algorithmus Karten in optimalen Intervallen erneut.',
          }, lang)}
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '0.9rem',
        }}>
          {FLASHCARDS.map((c, i) => <FlashcardItem key={i} card={c} lang={lang} />)}
        </div>
      </section>

      {/* ═══════ RELATED KUON TOOLS ═══════ */}
      <section style={{
        maxWidth: 880,
        margin: '0 auto',
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) 0',
      }}>
        <div style={{
          fontFamily: mono,
          fontSize: '0.7rem',
          color: INK_FAINT,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          marginBottom: '1.2rem',
        }}>
          {t({
            ja: '関連するツール',
            en: 'Related tools',
            es: 'Herramientas relacionadas',
            ko: '관련 도구',
            pt: 'Ferramentas relacionadas',
            de: 'Verwandte Werkzeuge',
          }, lang)}
        </div>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: '0.9rem',
          color: INK_SOFT,
          lineHeight: 1.85,
          margin: '0 0 1.4rem 0',
          letterSpacing: '0.02em',
        }}>
          {t({
            ja: 'このレッスンと相補的に使える Kuon の無料アプリ。譜読みの実践、聴音の継続、楽器の調律 — 学んだことを身体に染み込ませてください。',
            en: 'Free Kuon apps that complement this lesson. Sight-reading practice, ongoing ear training, instrument tuning — embody what you have just learned.',
            es: 'Apps gratuitas de Kuon que complementan esta lección. Lectura, audición continua, afinación.',
            ko: '이 레슨을 보완하는 Kuon 무료 앱. 시창·청음·튜닝.',
            pt: 'Apps gratuitos do Kuon que complementam esta lição. Leitura, percepção, afinação.',
            de: 'Kostenlose Kuon-Apps, die diese Lektion ergänzen. Blattlesen, Gehörbildung, Stimmen.',
          }, lang)}
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '0.9rem',
        }}>
          <RelatedTool
            href="/sight-reading-lp"
            title={t({ ja: 'KUON SIGHT READING', en: 'KUON SIGHT READING', es: 'KUON SIGHT READING', ko: 'KUON SIGHT READING', pt: 'KUON SIGHT READING', de: 'KUON SIGHT READING' }, lang)}
            desc={t({
              ja: '譜読み訓練。譜表上のランダムな音をすぐに識別する反射神経を鍛える。',
              en: 'Sight-reading drills. Build the reflex to name any pitch on the staff instantly.',
              es: 'Lectura a primera vista. Reflejos para identificar cualquier nota.',
              ko: '시창 훈련. 오선상 음을 즉시 식별.',
              pt: 'Leitura à primeira vista. Identificar notas instantaneamente.',
              de: 'Blattlesen. Tonhöhen sofort benennen.',
            }, lang)}
          />
          <RelatedTool
            href="/ear-training-lp"
            title={t({ ja: 'KUON EAR TRAINING', en: 'KUON EAR TRAINING', es: 'KUON EAR TRAINING', ko: 'KUON EAR TRAINING', pt: 'KUON EAR TRAINING', de: 'KUON EAR TRAINING' }, lang)}
            desc={t({
              ja: '聴音訓練。音程・和音・カデンツを耳で識別する基礎力を継続的に磨く。',
              en: 'Ear training. Build lasting skills in interval, chord, and cadence recognition.',
              es: 'Entrenamiento auditivo. Intervalos, acordes, cadencias.',
              ko: '청음 훈련. 음정·화음·카덴츠 식별.',
              pt: 'Treino auditivo. Intervalos, acordes, cadências.',
              de: 'Gehörbildung. Intervalle, Akkorde, Kadenzen.',
            }, lang)}
          />
          <RelatedTool
            href="/tuner-lp"
            title={t({ ja: 'KUON TUNER PRO', en: 'KUON TUNER PRO', es: 'KUON TUNER PRO', ko: 'KUON TUNER PRO', pt: 'KUON TUNER PRO', de: 'KUON TUNER PRO' }, lang)}
            desc={t({
              ja: 'YIN アルゴリズムによる高精度チューナー。実楽器で「今学んだ音」を実際に出してみる。',
              en: 'High-precision YIN-algorithm tuner. Sing or play the pitch you just learned.',
              es: 'Afinador de alta precisión (YIN). Toca o canta la nota aprendida.',
              ko: 'YIN 알고리즘 고정밀 튜너. 방금 배운 음을 직접 내보세요.',
              pt: 'Afinador de alta precisão (YIN). Toque ou cante a nota aprendida.',
              de: 'Präzisions-Stimmgerät (YIN). Spielen Sie den gelernten Ton.',
            }, lang)}
          />
        </div>
      </section>

      {/* ═══════ FOOTER NAV ═══════ */}
      <footer style={{
        maxWidth: 880,
        margin: '0 auto',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)',
        borderTop: `1px solid ${STAFF_LINE_COLOR}`,
        marginTop: 'clamp(2rem, 5vw, 4rem)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, letterSpacing: '0.04em' }}>
            {t({ ja: '前のレッスン', en: 'Previous', es: 'Anterior', ko: '이전', pt: 'Anterior', de: 'Vorherige' }, lang)}
            <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>
              {t({ ja: '— なし (ここが最初です)', en: '— none (this is the first)', es: '— ninguno (esta es la primera)', ko: '— 없음 (여기가 시작)', pt: '— nenhuma (esta é a primeira)', de: '— keine (dies ist die erste)' }, lang)}
            </span>
          </div>
          <Link href="/theory" style={{
            fontFamily: sans, fontSize: '0.85rem', color: INK,
            textDecoration: 'none', padding: '0.7rem 1.4rem',
            border: `1px solid ${INK}`, borderRadius: 999,
            letterSpacing: '0.06em',
          }}>
            {t({ ja: '目次へ戻る', en: 'Back to contents', es: 'Volver al índice', ko: '목차로', pt: 'Voltar ao índice', de: 'Zum Inhalt' }, lang)}
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LayerLabel (各レイヤー見出し)
// ─────────────────────────────────────────────────────────────
function LayerLabel({ num, name }: { num: string; name: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: '0.85rem',
      marginBottom: 'clamp(1.4rem, 3vw, 1.8rem)',
      paddingBottom: '0.7rem',
      borderBottom: `1px solid ${STAFF_LINE_COLOR}`,
    }}>
      <span style={{
        fontFamily: serif,
        fontSize: 'clamp(1.4rem, 2.5vw, 1.7rem)',
        color: ACCENT_GOLD,
        letterSpacing: '0.04em',
        lineHeight: 1,
      }}>
        {num}
      </span>
      <span style={{
        fontFamily: sans,
        fontSize: '0.78rem',
        color: INK_SOFT,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}>
        {name}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PyodideBadge (背景ロード状況の控えめな表示)
// ─────────────────────────────────────────────────────────────
function PyodideBadge({ state, lang }: { state: PyodideState; lang: Lang }) {
  const messages: Record<PyodideState, L6> = {
    idle: { ja: '', en: '' },
    loading: {
      ja: '音楽環境を準備中…',
      en: 'Preparing the music environment…',
      es: 'Preparando el entorno musical…',
      ko: '음악 환경 준비 중…',
      pt: 'Preparando o ambiente musical…',
      de: 'Musikumgebung wird vorbereitet…',
    },
    ready: {
      ja: '✓ 準備完了',
      en: '✓ Ready',
      es: '✓ Listo',
      ko: '✓ 준비 완료',
      pt: '✓ Pronto',
      de: '✓ Bereit',
    },
    failed: {
      ja: '基本機能で動作中',
      en: 'Running with core features',
      es: 'Ejecutando con funciones básicas',
      ko: '기본 기능으로 동작',
      pt: 'Executando com funções básicas',
      de: 'Läuft mit Kernfunktionen',
    },
  };
  const message = t(messages[state], lang);
  if (!message) return null;
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: mono,
      fontSize: '0.68rem',
      color: state === 'ready' ? ACCENT_INDIGO : INK_FAINT,
      letterSpacing: '0.08em',
      marginBottom: '1.4rem',
      padding: '0.3rem 0.85rem',
      background: state === 'ready' ? `${ACCENT_INDIGO}10` : PAPER_DEEP,
      borderRadius: 999,
    }}>
      {state === 'loading' && <PulseDot />}
      <span>{message}</span>
    </div>
  );
}

function PulseDot() {
  return (
    <span style={{
      display: 'inline-block',
      width: 6, height: 6, borderRadius: '50%',
      background: INK_FAINT,
      animation: 'kuonPulse 1.4s ease-in-out infinite',
    }}>
      <style>{`
        @keyframes kuonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// ModeButton
// ─────────────────────────────────────────────────────────────
function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: sans,
      fontSize: '0.82rem',
      color: active ? PAPER : INK_SOFT,
      background: active ? INK : 'transparent',
      border: `1px solid ${active ? INK : STAFF_LINE_COLOR}`,
      borderRadius: 999,
      padding: '0.55rem 1.2rem',
      cursor: 'pointer',
      letterSpacing: '0.05em',
      fontWeight: 500,
      transition: 'all 0.2s ease',
    }}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Staff SVG コンポーネント (五線 + ト音記号 + 任意位置の音符)
// ─────────────────────────────────────────────────────────────
const STAFF_W = 600;
const STAFF_H = 220;
const STAFF_TOP = 70;     // F5 line
const STAFF_GAP = 12;     // 各線の間隔
// staffPos → y座標: 0 = bottom line (E4), 4 = top line (F5)
function staffPosY(pos: number): number {
  return STAFF_TOP + (4 - pos) * STAFF_GAP;
}

function Staff({ noteIdx, onClickStaff }: { noteIdx: number | null; onClickStaff?: (pos: number) => void }) {
  const note = noteIdx !== null ? NOTES[noteIdx] : null;
  return (
    <svg
      viewBox={`0 0 ${STAFF_W} ${STAFF_H}`}
      style={{
        width: '100%',
        maxWidth: 600,
        background: PAPER,
        borderRadius: 4,
        cursor: onClickStaff ? 'crosshair' : 'default',
      }}
      onClick={(e) => {
        if (!onClickStaff) return;
        const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
        const y = ((e.clientY - rect.top) / rect.height) * STAFF_H;
        // y → staffPos の逆算
        const pos = Math.round(4 - (y - STAFF_TOP) / STAFF_GAP);
        if (pos >= -3 && pos <= 7) onClickStaff(pos);
      }}
    >
      {/* 5 staff lines */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i}
          x1={45} x2={STAFF_W - 30}
          y1={staffPosY(i)} y2={staffPosY(i)}
          stroke={STAFF_LINE_COLOR} strokeWidth={1}
        />
      ))}

      {/* Treble clef (Bravura SMuFL U+E050) */}
      <text
        x={56}
        y={staffPosY(2) + 28}
        fontFamily="Bravura, serif"
        fontSize={STAFF_GAP * 4 + 4}
        fill={INK}
      >
        {String.fromCodePoint(0xE050)}
      </text>

      {/* Note (when set) */}
      {note && (() => {
        const cx = 280;
        const cy = staffPosY(note.staffPos);
        const needLedger = note.staffPos < 0;
        return (
          <g>
            {/* Ledger line for middle C */}
            {needLedger && note.staffPos === -2 && (
              <line x1={cx - 14} x2={cx + 14} y1={cy} y2={cy} stroke={INK} strokeWidth={1.2} />
            )}
            {/* Note head (filled ellipse, slightly tilted) */}
            <ellipse
              cx={cx} cy={cy}
              rx={STAFF_GAP * 0.85} ry={STAFF_GAP * 0.6}
              fill={INK}
              transform={`rotate(-20 ${cx} ${cy})`}
            />
          </g>
        );
      })()}

      {/* Note name label (clean text below) */}
      {note && (
        <text
          x={STAFF_W / 2}
          y={STAFF_H - 12}
          textAnchor="middle"
          fontFamily={mono}
          fontSize={11}
          fill={INK_FAINT}
          letterSpacing={2}
        >
          {note.pitch}
        </text>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// IdentifyMode — 譜面に音符が現れる、学習者が音名を選ぶ
// ─────────────────────────────────────────────────────────────
function IdentifyMode({ lang }: { lang: Lang }) {
  const [currentIdx, setCurrentIdx] = useState<number>(() => Math.floor(Math.random() * NOTES.length));
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const next = useCallback(() => {
    let idx = Math.floor(Math.random() * NOTES.length);
    if (idx === currentIdx) idx = (idx + 1) % NOTES.length;
    setCurrentIdx(idx);
    setPicked(null);
    setFeedback('');
  }, [currentIdx]);

  const onPick = (idx: number) => {
    setPicked(idx);
    const target = NOTES[currentIdx];
    const chosen = NOTES[idx];

    // §49 準拠フィードバック: 正解/不正解の二項対立を排する
    if (chosen.letter === target.letter) {
      setFeedback(t({
        ja: `定番の答えは ${target.letter} です。Bach・Mozart 全員がこの音を ${target.letter} と呼びます。あなたの選択もこれです。`,
        en: `The textbook answer is ${target.letter}. Bach, Mozart, and Beethoven all call this pitch ${target.letter}. Your choice matches.`,
        es: `La respuesta convencional es ${target.letter}. Bach, Mozart y Beethoven llaman a este sonido ${target.letter}. Tu elección coincide.`,
        ko: `정답은 ${target.letter} 입니다. 바흐·모차르트 모두 이 음을 ${target.letter} 라 부릅니다. 당신의 선택도 같습니다.`,
        pt: `A resposta convencional é ${target.letter}. Bach, Mozart e Beethoven chamam este som de ${target.letter}. Sua escolha coincide.`,
        de: `Die Lehrbuchantwort ist ${target.letter}. Bach, Mozart und Beethoven nennen diesen Ton ${target.letter}. Ihre Wahl stimmt überein.`,
      }, lang));
    } else {
      // §49: 「不正解」とは絶対に言わない。学習者の選択にも意味があると伝える。
      const interval = Math.abs(chosen.staffPos - target.staffPos);
      const intervalText = interval === 1 ? '完全 2 度' : interval === 2 ? '長 3 度' : interval === 3 ? '完全 4 度' : interval === 4 ? '完全 5 度' : `${interval} 度`;
      setFeedback(t({
        ja: `定番の答えは ${target.letter} です。あなたの ${chosen.letter} は ${intervalText} 離れた音で、同じスケール内で隣接して使われることがよくあります。両方とも音楽的に意味のある音です。`,
        en: `The textbook answer is ${target.letter}. Your ${chosen.letter} sits ${interval} steps away on the staff — frequently used adjacent within the same scale. Both are musically meaningful.`,
        es: `La respuesta convencional es ${target.letter}. Tu ${chosen.letter} está a ${interval} pasos en el pentagrama — se usan a menudo juntos en la misma escala. Ambos tienen sentido musical.`,
        ko: `교과서 답은 ${target.letter} 입니다. 당신의 ${chosen.letter} 는 오선상 ${interval} 단계 떨어진 음으로, 같은 스케일 내에서 이웃하여 자주 쓰입니다. 둘 다 음악적으로 의미 있는 음입니다.`,
        pt: `A resposta convencional é ${target.letter}. Seu ${chosen.letter} está a ${interval} passos na pauta — frequentemente usados juntos na mesma escala. Ambos têm sentido musical.`,
        de: `Die Lehrbuchantwort ist ${target.letter}. Ihr ${chosen.letter} liegt ${interval} Stufen entfernt — oft als Nachbartöne in derselben Tonleiter verwendet. Beide haben musikalische Bedeutung.`,
      }, lang));
    }

    // 音を鳴らす
    playNote(target.freq);
  };

  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85 }}>
        {t({
          ja: '譜面に現れた音の名前は何でしょうか? 直感で 1 つを選んでください。',
          en: 'What is the name of the note shown? Pick whichever feels right.',
          es: '¿Cuál es el nombre de la nota? Elige el que te parezca.',
          ko: '오선에 나타난 음의 이름은? 직감으로 하나를 선택하세요.',
          pt: 'Qual o nome da nota? Escolha o que parecer correto.',
          de: 'Wie heißt diese Note? Wählen Sie nach Gefühl.',
        }, lang)}
      </p>
      <Staff noteIdx={currentIdx} />

      {/* 音名選択ボタン */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.4rem',
        marginTop: '1.5rem',
      }}>
        {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((letter) => {
          const idx = NOTES.findIndex(n => n.letter === letter);
          const isPickedHere = picked !== null && NOTES[picked].letter === letter;
          return (
            <button key={letter}
              onClick={() => onPick(idx)}
              disabled={picked !== null}
              style={{
                fontFamily: serif,
                fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                fontWeight: 400,
                background: isPickedHere ? INK : '#fff',
                color: isPickedHere ? PAPER : INK,
                border: `1px solid ${isPickedHere ? INK : STAFF_LINE_COLOR}`,
                borderRadius: 4,
                padding: '0.85rem 0',
                cursor: picked !== null ? 'default' : 'pointer',
                letterSpacing: '0.05em',
                transition: 'all 0.2s ease',
                opacity: picked !== null && !isPickedHere ? 0.55 : 1,
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* §49 フィードバック */}
      {feedback && (
        <div style={{
          marginTop: '1.5rem',
          padding: 'clamp(1.2rem, 2.5vw, 1.6rem)',
          background: PAPER_DEEP,
          border: `1px solid ${STAFF_LINE_COLOR}`,
          borderLeft: `3px solid ${ACCENT_GOLD}`,
          borderRadius: 4,
          fontFamily: serif,
          fontSize: 'clamp(0.92rem, 1.6vw, 1.05rem)',
          color: INK,
          lineHeight: 1.95,
          letterSpacing: '0.02em',
          wordBreak: 'keep-all' as const,
        }}>
          {feedback}
        </div>
      )}

      {picked !== null && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' as const }}>
          <button onClick={next} style={{
            fontFamily: sans,
            fontSize: '0.9rem',
            background: INK,
            color: PAPER,
            border: 'none',
            borderRadius: 999,
            padding: '0.85rem 2rem',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}>
            {t({ ja: '次の音 →', en: 'Next note →', es: 'Siguiente →', ko: '다음 음 →', pt: 'Próxima nota →', de: 'Nächste →' }, lang)}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ListenMode — 音を聴いて、譜面のどこかを選ぶ
// ─────────────────────────────────────────────────────────────
function ListenMode({ lang }: { lang: Lang }) {
  const [currentIdx, setCurrentIdx] = useState<number>(() => Math.floor(Math.random() * NOTES.length));
  const [picked, setPicked] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [hasPlayedFirst, setHasPlayedFirst] = useState(false);

  const playCurrent = () => {
    playNote(NOTES[currentIdx].freq);
    setHasPlayedFirst(true);
  };

  const next = useCallback(() => {
    let idx = Math.floor(Math.random() * NOTES.length);
    if (idx === currentIdx) idx = (idx + 1) % NOTES.length;
    setCurrentIdx(idx);
    setPicked(null);
    setFeedback('');
    setHasPlayedFirst(false);
  }, [currentIdx]);

  const onPick = (idx: number) => {
    setPicked(idx);
    const target = NOTES[currentIdx];
    const chosen = NOTES[idx];
    if (chosen.letter === target.letter) {
      setFeedback(t({
        ja: `この音は ${target.letter} (${target.ja}・${target.fixedDo})。あなたの耳が捉えたとおりです。`,
        en: `This pitch is ${target.letter} (${target.fixedDo}). Your ear caught it.`,
        es: `Este sonido es ${target.letter} (${target.fixedDo}). Tu oído lo captó.`,
        ko: `이 음은 ${target.letter} (${target.fixedDo}) 입니다. 당신의 귀가 잘 잡았습니다.`,
        pt: `Este som é ${target.letter} (${target.fixedDo}). Seu ouvido captou.`,
        de: `Dieser Ton ist ${target.letter} (${target.fixedDo}). Ihr Ohr hat ihn erkannt.`,
      }, lang));
    } else {
      setFeedback(t({
        ja: `定番の答えは ${target.letter} (${target.ja}) です。あなたの ${chosen.letter} もメロディーで隣接することの多い音で、聴き分けの感覚は近いところにあります。`,
        en: `The textbook answer is ${target.letter}. Your ${chosen.letter} is often adjacent in melodies — your ear is near the right neighborhood.`,
        es: `La respuesta convencional es ${target.letter}. Tu ${chosen.letter} suele aparecer junto en melodías — tu oído está cerca.`,
        ko: `정답은 ${target.letter} 입니다. 당신의 ${chosen.letter} 도 멜로디에서 자주 인접하는 음으로, 귀의 감각은 가까운 곳에 있습니다.`,
        pt: `A resposta convencional é ${target.letter}. Seu ${chosen.letter} aparece frequentemente próximo em melodias — seu ouvido está perto.`,
        de: `Die Lehrbuchantwort ist ${target.letter}. Ihr ${chosen.letter} ist oft Nachbar in Melodien — Ihr Ohr ist nahe dran.`,
      }, lang));
    }
  };

  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85 }}>
        {t({
          ja: '音を再生して、聴こえた音の名前を選んでください。',
          en: 'Play the sound, then pick the name you hear.',
          es: 'Reproduce el sonido y elige el nombre que escuches.',
          ko: '소리를 재생하고 들리는 음의 이름을 선택하세요.',
          pt: 'Toque o som e escolha o nome que ouviu.',
          de: 'Hören Sie den Ton und wählen Sie den Namen.',
        }, lang)}
      </p>
      <div style={{ textAlign: 'center' as const, padding: '2rem 0' }}>
        <button onClick={playCurrent} style={{
          fontFamily: sans,
          fontSize: '1rem',
          background: INK,
          color: PAPER,
          border: 'none',
          borderRadius: 999,
          padding: '1rem 2.4rem',
          cursor: 'pointer',
          letterSpacing: '0.06em',
        }}>
          {hasPlayedFirst
            ? t({ ja: 'もう一度聴く', en: 'Play again', es: 'Reproducir de nuevo', ko: '다시 듣기', pt: 'Tocar de novo', de: 'Erneut anhören' }, lang)
            : t({ ja: '♪ 音を再生', en: '♪ Play the note', es: '♪ Reproducir', ko: '♪ 재생', pt: '♪ Tocar', de: '♪ Abspielen' }, lang)}
        </button>
      </div>

      {/* 音名選択 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.4rem',
      }}>
        {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((letter) => {
          const idx = NOTES.findIndex(n => n.letter === letter);
          const isPickedHere = picked !== null && NOTES[picked].letter === letter;
          return (
            <button key={letter}
              onClick={() => onPick(idx)}
              disabled={picked !== null || !hasPlayedFirst}
              style={{
                fontFamily: serif,
                fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                background: isPickedHere ? INK : '#fff',
                color: isPickedHere ? PAPER : INK,
                border: `1px solid ${isPickedHere ? INK : STAFF_LINE_COLOR}`,
                borderRadius: 4,
                padding: '0.85rem 0',
                cursor: picked !== null || !hasPlayedFirst ? 'default' : 'pointer',
                letterSpacing: '0.05em',
                opacity: !hasPlayedFirst ? 0.4 : (picked !== null && !isPickedHere ? 0.55 : 1),
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* 答えが出たら譜面で見せる */}
      {picked !== null && (
        <div style={{ marginTop: '1.5rem' }}>
          <Staff noteIdx={currentIdx} />
        </div>
      )}

      {feedback && (
        <div style={{
          marginTop: '1.5rem',
          padding: 'clamp(1.2rem, 2.5vw, 1.6rem)',
          background: PAPER_DEEP,
          border: `1px solid ${STAFF_LINE_COLOR}`,
          borderLeft: `3px solid ${ACCENT_GOLD}`,
          borderRadius: 4,
          fontFamily: serif,
          fontSize: 'clamp(0.92rem, 1.6vw, 1.05rem)',
          color: INK,
          lineHeight: 1.95,
          letterSpacing: '0.02em',
          wordBreak: 'keep-all' as const,
        }}>
          {feedback}
        </div>
      )}

      {picked !== null && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' as const }}>
          <button onClick={next} style={{
            fontFamily: sans,
            fontSize: '0.9rem',
            background: INK,
            color: PAPER,
            border: 'none',
            borderRadius: 999,
            padding: '0.85rem 2rem',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}>
            {t({ ja: '次の音 →', en: 'Next →', es: 'Siguiente →', ko: '다음 →', pt: 'Próxima →', de: 'Nächste →' }, lang)}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FreePlayMode — 自由探索: 譜面のどこでもクリックして音を確認
// ─────────────────────────────────────────────────────────────
function FreePlayMode({ lang }: { lang: Lang }) {
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);

  const onClickStaff = (pos: number) => {
    const idx = NOTES.findIndex(n => n.staffPos === pos);
    if (idx >= 0) {
      setPickedIdx(idx);
      playNote(NOTES[idx].freq);
    }
  };

  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85 }}>
        {t({
          ja: '譜面の任意の場所をクリックすると、その音が鳴り、音名と日本式・固定ドの呼称が表示されます。何度でも自由に試してください。',
          en: 'Click anywhere on the staff. The note will sound, and you\'ll see its letter, Japanese, and fixed-do names. Explore freely.',
          es: 'Haz clic donde quieras en el pentagrama. La nota sonará y verás su letra, nombre japonés y solfeo fijo. Explora libremente.',
          ko: '오선의 아무 곳이나 클릭하면 음이 울리고 이름·일본식·고정도 명칭이 표시됩니다. 자유롭게 탐색하세요.',
          pt: 'Clique em qualquer lugar da pauta. A nota toca e mostra letra, nome japonês e solfejo fixo. Explore livremente.',
          de: 'Klicken Sie irgendwo aufs System. Die Note erklingt mit Buchstaben, japanischem und festem-Do-Namen. Frei erkunden.',
        }, lang)}
      </p>
      <Staff noteIdx={pickedIdx} onClickStaff={onClickStaff} />
      {pickedIdx !== null && (
        <div style={{
          marginTop: '1.5rem',
          padding: 'clamp(1.2rem, 2.5vw, 1.6rem)',
          background: PAPER_DEEP,
          border: `1px solid ${STAFF_LINE_COLOR}`,
          borderRadius: 4,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          textAlign: 'center' as const,
        }}>
          <NameCell label={t({ ja: '西洋式', en: 'Western', es: 'Occidental', ko: '서양식', pt: 'Ocidental', de: 'Westlich' }, lang)} value={NOTES[pickedIdx].letter} />
          <NameCell label={t({ ja: '日本式', en: 'Japanese', es: 'Japonés', ko: '일본식', pt: 'Japonês', de: 'Japanisch' }, lang)} value={NOTES[pickedIdx].ja} />
          <NameCell label={t({ ja: '固定ド', en: 'Fixed do', es: 'Do fijo', ko: '고정도', pt: 'Dó fixo', de: 'Festes do' }, lang)} value={NOTES[pickedIdx].fixedDo} />
          <NameCell label={t({ ja: '科学的記譜', en: 'Scientific', es: 'Científica', ko: '과학적', pt: 'Científica', de: 'Wissenschaftl.' }, lang)} value={NOTES[pickedIdx].pitch} />
        </div>
      )}
    </div>
  );
}

function NameCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: sans, fontSize: '0.66rem', color: INK_FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
        {label}
      </div>
      <div style={{ fontFamily: serif, fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', color: INK, letterSpacing: '0.04em' }}>
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FlashcardItem (Layer 3)
// ─────────────────────────────────────────────────────────────
function RelatedTool({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        background: '#fff',
        border: `1px solid ${STAFF_LINE_COLOR}`,
        borderRadius: 4,
        padding: 'clamp(1.1rem, 2vw, 1.4rem)',
        height: '100%',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = INK;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = STAFF_LINE_COLOR;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      >
        <div style={{
          fontFamily: sans,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: INK,
          letterSpacing: '0.06em',
          marginBottom: '0.55rem',
        }}>
          {title}
        </div>
        <p style={{
          fontFamily: sans,
          fontSize: '0.78rem',
          color: INK_SOFT,
          lineHeight: 1.7,
          margin: 0,
          letterSpacing: '0.01em',
        }}>
          {desc}
        </p>
        <div style={{
          fontFamily: sans,
          fontSize: '0.7rem',
          color: ACCENT_INDIGO,
          marginTop: '0.85rem',
          letterSpacing: '0.04em',
        }}>
          {'→'}
        </div>
      </div>
    </Link>
  );
}

function FlashcardItem({ card, lang }: { card: Flashcard; lang: Lang }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped(f => !f)}
      style={{
        background: flipped ? PAPER_DEEP : '#fff',
        border: `1px solid ${STAFF_LINE_COLOR}`,
        borderRadius: 4,
        padding: 'clamp(1.2rem, 2.5vw, 1.5rem)',
        cursor: 'pointer',
        textAlign: 'left' as const,
        fontFamily: serif,
        fontSize: '0.92rem',
        color: INK,
        lineHeight: 1.85,
        letterSpacing: '0.02em',
        transition: 'all 0.3s ease',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <div style={{
        fontFamily: mono,
        fontSize: '0.65rem',
        color: INK_FAINT,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        marginBottom: '0.7rem',
      }}>
        {flipped
          ? t({ ja: '答え', en: 'Answer', es: 'Respuesta', ko: '답', pt: 'Resposta', de: 'Antwort' }, lang)
          : t({ ja: '問い', en: 'Question', es: 'Pregunta', ko: '질문', pt: 'Pergunta', de: 'Frage' }, lang)
        }
      </div>
      <div style={{ wordBreak: 'keep-all' as const }}>
        {flipped ? t(card.a, lang) : t(card.q, lang)}
      </div>
    </button>
  );
}
