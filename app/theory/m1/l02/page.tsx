'use client';

/**
 * /theory/m1/l02 — M1-02「音符の記譜と五線」
 * =========================================================
 * OMT v2 Part I 第 2 章前半 (Notation of Notes, Staff Notation, Placing Notes on a Staff)
 * 著者: Chelsey Hamm
 *
 * 章の Key Takeaways (該当部分):
 *   1. 音符は高さ (pitch) と リズム (rhythm) の両方を表す
 *   2. 五線は等間隔に水平に並ぶ 5 本の線。高い音は上に、低い音は下に
 *   3. 符頭 (notehead) は楕円形 (円ではない)、右上にやや傾く
 *   4. 線上の音符は線の上下の半分を埋める。間の音符は上下の線に触れる
 *
 * §49 整合性:
 *   - 「高い = 上」も実は文化的選択 (古代ギリシャ理論家は高音を下に書いた)
 *   - これを Living Score でトグルして体感させる
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

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
const ACCENT_RED = '#a43b3b';
const ACCENT_GREEN = '#3a6b3a';

type L6 = { ja?: string; en: string; es?: string; ko?: string; pt?: string; de?: string };
const t = (m: L6, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

// ─────────────────────────────────────────────────────────────
// Web Audio (sine + triangle, single note)
// ─────────────────────────────────────────────────────────────
const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function playNote(midi: number) {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc2.type = 'sine';
  osc.frequency.value = midiToFreq(midi);
  osc2.frequency.value = midiToFreq(midi) * 2;
  const t0 = ctx.currentTime;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.18, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.85);
  osc.connect(g);
  osc2.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc2.start(t0);
  osc.stop(t0 + 0.9);
  setTimeout(() => ctx.close(), 1000);
}

// ─────────────────────────────────────────────────────────────
// Layer 3 フラッシュカード
// ─────────────────────────────────────────────────────────────
const FLASHCARDS: { q: L6; a: L6 }[] = [
  {
    q: { ja: '1 つの音符は何を伝えているか?', en: 'What does a single note convey?', es: '¿Qué transmite una nota?', ko: '한 음표가 전하는 것은?', pt: 'O que transmite uma nota?', de: 'Was übermittelt eine Note?' },
    a: { ja: '高さ (pitch) と リズム (rhythm) の両方。西洋記譜法は、この 2 つの情報を縦軸 (高さ) と横軸 (時間) に配置することで一つの記号にまとめる。', en: 'Both pitch and rhythm. Western notation encodes both into one symbol by placing pitch on the vertical (y) axis and time on the horizontal (x) axis.', es: 'Tanto la altura como el ritmo. La notación occidental codifica ambos en un solo símbolo: altura en el eje vertical, tiempo en el horizontal.', ko: '높이 (pitch) 와 리듬 (rhythm) 양쪽. 서양 기보는 두 정보를 세로축 (높이) 과 가로축 (시간) 에 배치하여 하나의 기호로 통합.', pt: 'Tanto a altura quanto o ritmo. A notação ocidental codifica ambos em um símbolo: altura no eixo vertical, tempo no horizontal.', de: 'Sowohl Tonhöhe als auch Rhythmus. Westliche Notation vereint beides in einem Symbol — Tonhöhe auf der Vertikalen, Zeit auf der Horizontalen.' },
  },
  {
    q: { ja: '符頭 (notehead) の正しい形は?', en: 'What is the correct shape of a notehead?', es: '¿Cuál es la forma correcta de la cabeza de nota?', ko: '음표 머리의 올바른 모양은?', pt: 'Qual a forma correta da cabeça de nota?', de: 'Welche Form hat ein korrekter Notenkopf?' },
    a: { ja: '楕円形 (円ではない)、右上にやや傾ける。大きすぎても小さすぎてもならない。線上ではその線の上下の空間を半分ずつ埋め、間 (スペース) では上下の線に触れる。', en: 'Oval (not round), tilted slightly upward to the right. Neither too large nor too small. On a line, fills half the space above and below; in a space, touches the lines above and below.', es: 'Ovalada (no redonda), inclinada ligeramente hacia arriba a la derecha. Ni demasiado grande ni pequeña.', ko: '타원형 (원형이 아님), 오른쪽 위로 약간 기울어짐. 크지도 작지도 않게.', pt: 'Oval (não redonda), levemente inclinada para cima à direita.', de: 'Oval (nicht rund), leicht nach rechts oben geneigt.' },
  },
  {
    q: { ja: '「高い音は上に書く」は世界共通の慣習か?', en: 'Is "higher pitch = higher on staff" a universal convention?', es: '¿"Más agudo = más arriba" es universal?', ko: '"높은 음 = 위" 는 세계 공통인가?', pt: '"Mais agudo = mais acima" é universal?', de: 'Ist „höherer Ton = höher im System" universell?' },
    a: { ja: 'いいえ。古代ギリシャの一部の理論家は、高音を譜表上で「下」に書いた。これは弦楽器の物理的な弦の配置に基づく感覚 (バイオリンを構えたとき高音弦が下に来る) で、文化と楽器が記譜の方向を決めた一例。「上が高い」は西洋の選択である。', en: 'No. Some ancient Greek theorists placed higher-sounding notes visually below lower-sounding ones, drawing on string-instrument intuition (the high strings sit lower when you hold a violin or lyre). Direction is a cultural choice. "Up = high" is a Western convention.', es: 'No. Algunos teóricos griegos antiguos colocaban las notas más agudas visualmente debajo, basándose en la lógica de los instrumentos de cuerda. La dirección es una elección cultural.', ko: '아니다. 일부 고대 그리스 이론가는 높은 음을 시각적으로 아래에 두었다 — 현악기의 직관 (바이올린을 들었을 때 고음현이 아래) 에 따른 것. 방향은 문화적 선택이다.', pt: 'Não. Alguns teóricos gregos antigos colocavam as notas mais agudas visualmente abaixo. A direção é uma escolha cultural.', de: 'Nein. Manche antiken griechischen Theoretiker setzten höhere Töne tiefer im Bild — basierend auf Saiteninstrumenten. Die Richtung ist kulturell gewählt.' },
  },
  {
    q: { ja: '五線 (staff) は何で構成されているか?', en: 'What constitutes the staff?', es: '¿De qué consta el pentagrama?', ko: '오선은 무엇으로 구성되는가?', pt: 'Do que se compõe a pauta?', de: 'Woraus besteht das Notensystem?' },
    a: { ja: '5 本の水平な線、等間隔で並ぶ。線の上、または線と線の間 (スペース) に音符を置く。複数形は staves。', en: '5 horizontal lines, evenly spaced. Notes are placed on lines or in spaces between them. Plural: staves.', es: '5 líneas horizontales equidistantes. Las notas se colocan sobre las líneas o en los espacios entre ellas. Plural: staves.', ko: '5 개의 수평선이 등간격으로 배치. 음표는 선 위 또는 선과 선 사이 (간) 에 둠. 복수형: staves.', pt: '5 linhas horizontais equidistantes. As notas ficam nas linhas ou nos espaços entre elas. Plural: staves.', de: 'Fünf gleichmäßig waagerechte Linien. Noten stehen auf Linien oder in Zwischenräumen. Plural: Notensysteme.' },
  },
  {
    q: { ja: '線上の符頭と、間 (スペース) の符頭の置き方の違いは?', en: 'How do noteheads on lines vs in spaces differ in placement?', es: '¿Cómo difieren las cabezas en líneas vs espacios?', ko: '선 위 음표와 간 음표의 배치 차이?', pt: 'Como diferem cabeças em linhas e em espaços?', de: 'Notenköpfe auf Linien vs. in Zwischenräumen?' },
    a: { ja: '線上: 符頭がその線の上下の半分ずつのスペースを埋める (線が符頭を貫通)。スペース: 符頭が上下の線に「ちょうど触れる」よう収まる。隙間がないことが正確に書く鍵。', en: 'On a line: the notehead fills half the space above and half below (the line passes through it). In a space: the notehead just touches the lines above and below. No gaps is the key to clean notation.', es: 'En línea: la cabeza llena la mitad del espacio arriba y abajo (la línea la atraviesa). En espacio: toca las líneas arriba y abajo, sin huecos.', ko: '선 위: 머리가 선 위아래 공간을 절반씩 메움 (선이 머리를 관통). 간: 위아래 선에 정확히 닿음. 틈이 없는 것이 핵심.', pt: 'Em linha: a cabeça preenche metade do espaço acima e abaixo (a linha a atravessa). Em espaço: toca as linhas acima e abaixo, sem folgas.', de: 'Auf einer Linie: Der Notenkopf füllt halben Raum darüber und darunter (Linie geht durch). Im Zwischenraum: berührt die Linien oben und unten, ohne Lücken.' },
  },
];

// ─────────────────────────────────────────────────────────────
// Living Score モード
// ─────────────────────────────────────────────────────────────
type Mode = 'anatomy' | 'shapes' | 'pitch';
type PyodideState = 'idle' | 'loading' | 'ready' | 'failed';

export default function LessonM1L02() {
  const { lang } = useLang();
  const [mode, setMode] = useState<Mode>('anatomy');
  const [pyodideState, setPyodideState] = useState<PyodideState>('idle');
  const startedRef = useRef(false);

  // Bravura
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

  // Pyodide
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
        if (!window.loadPyodide) throw new Error('loadPyodide not available');
        const pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/' });
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

      {/* パンくず + タイトル */}
      <div style={{
        maxWidth: 880, margin: '0 auto',
        padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2rem)',
      }}>
        <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, letterSpacing: '0.05em', marginBottom: '1.4rem' }}>
          <Link href="/theory" style={{ color: INK_SOFT, textDecoration: 'none' }}>
            ← {t({ ja: '目次へ戻る', en: 'Back to contents', es: 'Volver al índice', ko: '목차로', pt: 'Voltar', de: 'Zum Inhalt' }, lang)}
          </Link>
        </div>
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.28em', marginBottom: '0.7rem' }}>
          M1 · LESSON 02
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(1.85rem, 4.5vw, 2.85rem)',
          fontWeight: 400, letterSpacing: '0.04em', lineHeight: 1.4, margin: 0, color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '音符の記譜と五線',
            en: 'Notation of Notes and the Staff',
            es: 'Notación de las notas y el pentagrama',
            ko: '음표의 기보와 오선',
            pt: 'Notação das notas e a pauta',
            de: 'Notenschrift und das System',
          }, lang)}
        </h1>
      </div>

      {/* ═══════ Layer 1: STORY ═══════ */}
      <section style={{
        maxWidth: 720, margin: '0 auto',
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)',
      }}>
        <LayerLabel num="I" name={t({ ja: '物語', en: 'Story', es: 'Historia', ko: '이야기', pt: 'História', de: 'Geschichte' }, lang)} />
        <div style={{
          fontFamily: serif, fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          color: INK, lineHeight: 2.05, letterSpacing: '0.03em',
          wordBreak: 'keep-all' as const,
        }}>
          <p style={{ margin: '0 0 1.6rem 0', whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `1 つの音符は、2 つの情報を同時に伝えています。
高さ (pitch) と、長さ (rhythm)。
西洋記譜法はこの 2 つを、譜面の 2 つの軸に分けて配置しました。
縦軸 (上下) が音の高さ、横軸 (左右) が時間。
本のページのように左から右、上から下へ読む — それが西洋音楽の慣習です。`,
              en: `A single note carries two pieces of information at once.
Pitch and rhythm.
Western notation places these on two axes of the page.
The vertical axis (up and down) carries pitch; the horizontal axis (left and right) carries time.
Like reading a book in English: left-to-right, top-to-bottom — that is the convention of Western notation.`,
              es: `Una nota transmite dos informaciones a la vez.
Altura y ritmo.
La notación occidental las coloca en dos ejes de la página.
El eje vertical lleva la altura; el horizontal, el tiempo.
Como leer en inglés: de izquierda a derecha, de arriba abajo.`,
              ko: `한 음표는 두 가지 정보를 동시에 전합니다.
높이와 리듬.
서양 기보는 이 두 가지를 페이지의 두 축에 배치했습니다.
세로축은 높이, 가로축은 시간.
영어 책처럼 왼쪽에서 오른쪽으로, 위에서 아래로 — 그것이 서양 기보의 관습입니다.`,
              pt: `Uma nota transmite duas informações ao mesmo tempo.
Altura e ritmo.
A notação ocidental as coloca em dois eixos da página.
Vertical: altura; horizontal: tempo.
Como ler em inglês: da esquerda à direita, de cima para baixo.`,
              de: `Eine einzelne Note trägt zwei Informationen zugleich.
Tonhöhe und Rhythmus.
Westliche Notation verteilt diese auf zwei Achsen der Seite.
Vertikal: Tonhöhe; horizontal: Zeit.
Wie ein englisches Buch: links nach rechts, oben nach unten — das ist die Konvention.`,
            }, lang)}
          </p>
          <p style={{ margin: '0 0 1.6rem 0', whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `しかしここで、Chelsey Hamm 教授は重要な指摘をしています。
「高い音を上に書く」というルールも、実は文化的選択です。
古代ギリシャの一部の理論家は、高い音を譜面上で「下」に書いていました。
バイオリンや古代の竪琴 (リラ) を構えたとき、高音弦は身体の下に来る — その物理的な感覚が記譜の向きを決めたのです。
楽器が記譜法を形作る、その 1 例です。`,
              en: `Yet here, Professor Chelsey Hamm makes an important observation.
Even the rule "higher pitches go up" is a cultural choice.
Some ancient Greek theorists drew higher-sounding notes visually below.
When you hold a violin or an ancient lyre, the high strings sit lower toward your body — and that physical intuition shaped how they wrote.
An example of how instruments shape notation.`,
              es: `Pero aquí, la profesora Chelsey Hamm hace una observación clave.
Incluso "lo agudo va arriba" es una elección cultural.
Algunos teóricos griegos antiguos dibujaban las notas agudas visualmente debajo.
Al sostener una lira o un violín, las cuerdas agudas quedan más abajo, hacia el cuerpo. Esa intuición física moldeó su escritura.`,
              ko: `그러나 Chelsey Hamm 교수는 여기서 중요한 지적을 합니다.
"높은 음은 위에 쓴다" 는 규칙조차 문화적 선택입니다.
일부 고대 그리스 이론가는 높은 음을 시각적으로 아래에 두었습니다.
바이올린이나 고대 리라를 들면 고음현이 몸 쪽 아래에 위치 — 그 물리적 감각이 기보의 방향을 결정했습니다.`,
              pt: `Mas aqui, a Profa. Chelsey Hamm faz uma observação importante.
Mesmo "agudo vai acima" é uma escolha cultural.
Alguns teóricos gregos antigos desenhavam notas agudas visualmente abaixo.
Ao segurar uma lira ou violino, as cordas agudas ficam abaixo, perto do corpo — e essa intuição física moldou a escrita.`,
              de: `Doch hier macht Prof. Chelsey Hamm eine wichtige Beobachtung.
Selbst „hohe Töne stehen oben" ist eine kulturelle Wahl.
Manche antiken griechischen Theoretiker zeichneten hohe Töne sichtbar unten.
Wenn man eine Violine oder eine antike Leier hält, liegen die hohen Saiten unten zum Körper hin — diese körperliche Intuition prägte ihre Schreibweise.`,
            }, lang)}
          </p>
          <p style={{ margin: '0 0 1.6rem 0', whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `では、現代の西洋記譜法の具体的なルールを確認していきます。
五線 (staff) は等間隔に並んだ 5 本の水平線。線の上、または線と線の間 (スペース) に音符を置きます。
符頭 (notehead) は楕円形 — 円ではなく、右上にやや傾けて書く。
線上に置く符頭は、その線が中心を貫くように、上下の空間を半分ずつ埋める。
スペースに置く符頭は、上下の線にちょうど触れるように収める。
この精度が、書かれた音符の読みやすさを決めます。`,
              en: `Now, the concrete rules of modern Western notation.
The staff consists of five evenly-spaced horizontal lines. Notes go on the lines or in the spaces between them.
The notehead is oval — not round — and tilts slightly upward to the right.
A notehead on a line: the line passes through its center; the head fills half the space above and half below.
A notehead in a space: the head just touches the lines above and below.
This precision determines how readable the notation will be.`,
              es: `Las reglas concretas de la notación occidental moderna.
El pentagrama consta de cinco líneas horizontales equidistantes. Las notas van en las líneas o en los espacios.
La cabeza es ovalada — no redonda — inclinada ligeramente arriba a la derecha.
Cabeza en línea: la línea pasa por su centro, llena la mitad del espacio arriba y abajo.
Cabeza en espacio: toca las líneas arriba y abajo.
La precisión determina la legibilidad.`,
              ko: `이제 현대 서양 기보법의 구체적 규칙입니다.
오선은 등간격의 다섯 수평선. 음표는 선 위 또는 선과 선 사이 (간) 에 놓습니다.
머리는 타원형 — 원이 아니며 — 오른쪽 위로 약간 기울어집니다.
선 위 머리: 선이 중심을 관통, 위아래 공간을 절반씩 채움.
간의 머리: 위아래 선에 정확히 닿음.
이 정확성이 가독성을 결정합니다.`,
              pt: `As regras concretas da notação ocidental moderna.
A pauta tem cinco linhas horizontais equidistantes. As notas vão nas linhas ou espaços.
A cabeça é oval — não redonda — levemente inclinada para cima à direita.
Cabeça em linha: a linha atravessa o centro, preenche metade do espaço acima e abaixo.
Cabeça em espaço: toca as linhas acima e abaixo.
A precisão determina a legibilidade.`,
              de: `Nun zu den konkreten Regeln moderner westlicher Notation.
Das System hat fünf gleichmäßig abständige Linien. Noten stehen auf Linien oder in Zwischenräumen.
Der Kopf ist oval — nicht rund — leicht nach rechts oben geneigt.
Kopf auf einer Linie: Die Linie durchquert das Zentrum, halben Raum oben und unten.
Kopf im Zwischenraum: Berührt die Linien oben und unten.
Diese Präzision bestimmt die Lesbarkeit.`,
            }, lang)}
          </p>

          {/* 前方参照 */}
          <aside style={{
            marginTop: 'clamp(1.5rem, 3vw, 2rem)',
            padding: 'clamp(0.9rem, 2vw, 1.2rem) clamp(1.1rem, 2.5vw, 1.5rem)',
            background: PAPER_DEEP,
            border: `1px solid ${STAFF_LINE_COLOR}`,
            borderLeft: `2px solid ${ACCENT_INDIGO}`,
            borderRadius: 4,
            fontFamily: serif,
            fontSize: '0.88rem',
            color: INK_SOFT,
            lineHeight: 1.85,
            letterSpacing: '0.02em',
            whiteSpace: 'pre-line' as const,
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: `※ 本レッスンは OMT v2 第 2 章の前半 (音符・五線・配置) を扱います。
次の M1-03 で符尾 (stems) と連桁 (beams) と 2 度の書き方、M1-04 で 4 つの音部記号 (clefs) と加線 (ledger lines) を学びます。
合わせて 1 つの章を完成させる構成です。`,
              en: `Note: this lesson covers the first half of OMT v2 Chapter 2 (notes, staff, placement).
M1-03 will cover stems, beams, and writing seconds. M1-04 will cover the four clefs and ledger lines.
Together, the three lessons complete one chapter.`,
              es: `Nota: esta lección cubre la primera mitad del Cap. 2 (notas, pentagrama, colocación).
M1-03 cubrirá plicas, ligaduras y segundas. M1-04 cubrirá las cuatro claves y las líneas adicionales.`,
              ko: `※ 이 레슨은 OMT v2 2 장 전반 (음표·오선·배치) 을 다룹니다.
M1-03 에서 기둥과 빔과 2 도 표기, M1-04 에서 4 개 음자리표와 가선을 배웁니다.`,
              pt: `Nota: esta lição cobre a primeira metade do Cap. 2 (notas, pauta, colocação).
M1-03 cobrirá hastes, barras e segundas. M1-04 cobrirá as quatro claves e linhas suplementares.`,
              de: `Hinweis: Diese Lektion behandelt die erste Hälfte von OMT v2 Kapitel 2.
M1-03 behandelt Hälse, Balken und Sekunden. M1-04 behandelt die vier Schlüssel und Hilfslinien.`,
            }, lang)}
          </aside>
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
          <LayerLabel num="II" name={t({ ja: 'Living Score (音符と五線を観察する)', en: 'Living Score (observe notes and staff)', es: 'Living Score (observa notas y pauta)', ko: 'Living Score (음표와 오선 관찰)', pt: 'Living Score (observe notas e pauta)', de: 'Living Score (Noten und System beobachten)' }, lang)} />
          <PyodideBadge state={pyodideState} lang={lang} />

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'clamp(1.4rem, 3vw, 2rem)', flexWrap: 'wrap' as const }}>
            <ModeButton active={mode === 'anatomy'} onClick={() => setMode('anatomy')}
              label={t({ ja: '音符の解剖', en: 'Note anatomy', es: 'Anatomía de la nota', ko: '음표 해부', pt: 'Anatomia da nota', de: 'Anatomie einer Note' }, lang)} />
            <ModeButton active={mode === 'shapes'} onClick={() => setMode('shapes')}
              label={t({ ja: '正しい符頭・誤った符頭', en: 'Correct vs incorrect noteheads', es: 'Cabezas correctas / incorrectas', ko: '올바른 머리·잘못된 머리', pt: 'Cabeças corretas e incorretas', de: 'Richtige & falsche Notenköpfe' }, lang)} />
            <ModeButton active={mode === 'pitch'} onClick={() => setMode('pitch')}
              label={t({ ja: '高さと位置 — 西洋 vs 古代ギリシャ', en: 'Pitch & position — Western vs ancient Greek', es: 'Altura y posición', ko: '높이와 위치', pt: 'Altura e posição', de: 'Tonhöhe und Position' }, lang)} />
          </div>

          {mode === 'anatomy' && <AnatomyMode lang={lang} />}
          {mode === 'shapes' && <ShapesMode lang={lang} />}
          {mode === 'pitch' && <PitchMode lang={lang} />}
        </div>
      </section>

      {/* ═══════ Layer 3: MEMORY ═══════ */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <LayerLabel num="III" name={t({ ja: '記憶 (フラッシュカード)', en: 'Memory (Flashcards)', es: 'Memoria (Tarjetas)', ko: '기억 (플래시카드)', pt: 'Memória (Cartões)', de: 'Erinnern (Karten)' }, lang)} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '0.9rem' }}>
          {FLASHCARDS.map((c, i) => <FlashcardItem key={i} card={c} lang={lang} />)}
        </div>
      </section>

      {/* ═══════ RELATED KUON TOOLS ═══════ */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) 0' }}>
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.22em', textTransform: 'uppercase' as const, marginBottom: '1.2rem' }}>
          {t({ ja: '関連するツール', en: 'Related tools', es: 'Herramientas relacionadas', ko: '관련 도구', pt: 'Ferramentas relacionadas', de: 'Verwandte Werkzeuge' }, lang)}
        </div>
        <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.9rem', color: INK_SOFT, lineHeight: 1.85, margin: '0 0 1.4rem 0' }}>
          {t({
            ja: '音符を「見て理解する」段階から「読んで反応する」段階へ。Kuon の譜読みツールは、本レッスンで学んだ規則を実戦で身体化する場所です。',
            en: 'From "see and understand" to "read and react." Kuon\'s sight-reading tools turn the rules from this lesson into reflexes.',
            es: 'De "ver y entender" a "leer y reaccionar." Las herramientas convierten las reglas en reflejos.',
            ko: '"보고 이해" 에서 "읽고 반응" 으로. 도구가 규칙을 반사로 만듭니다.',
            pt: 'De "ver e entender" para "ler e reagir." As ferramentas transformam regras em reflexos.',
            de: 'Vom „Sehen und Verstehen" zum „Lesen und Reagieren". Die Werkzeuge machen Regeln zu Reflexen.',
          }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.9rem' }}>
          <RelatedTool href="/sight-reading-lp" title="KUON SIGHT READING" desc={t({
            ja: '譜読み訓練。譜表上のランダムな音をすぐに識別する反射神経を鍛える。',
            en: 'Sight-reading drills. Build the reflex to name pitches on the staff instantly.',
            es: 'Lectura a primera vista. Reflejos para identificar notas.',
            ko: '시창 훈련. 오선상 음을 즉시 식별.',
            pt: 'Leitura à primeira vista. Identificar notas instantaneamente.',
            de: 'Blattlesen. Tonhöhen sofort benennen.',
          }, lang)} />
          <RelatedTool href="/ear-training-lp" title="KUON EAR TRAINING" desc={t({
            ja: '聴音訓練。譜表で見た音と、実際に聴いた音を結びつける。',
            en: 'Ear training. Connect notes you see on the staff with the sounds you hear.',
            es: 'Entrenamiento auditivo. Conecta notas escritas y sonidos.',
            ko: '청음 훈련. 보이는 음과 들리는 음의 연결.',
            pt: 'Treino auditivo. Conecta notas vistas e sons ouvidos.',
            de: 'Gehörbildung. Verknüpft notierte Noten mit gehörten Klängen.',
          }, lang)} />
          <RelatedTool href="/classical-lp" title="KUON CLASSICAL ANALYSIS" desc={t({
            ja: 'Bach・Mozart の本物の楽譜を見ながら、本レッスンの符頭の規則がどう守られているかを観察できる。',
            en: 'View real Bach and Mozart scores. See how the notehead rules from this lesson are honored in practice.',
            es: 'Ve partituras reales de Bach y Mozart, viendo cómo se aplican las reglas.',
            ko: '바흐·모차르트 실제 악보로 규칙 적용 관찰.',
            pt: 'Veja partituras reais de Bach e Mozart, vendo as regras aplicadas.',
            de: 'Echte Bach- und Mozart-Partituren ansehen — die Regeln in Aktion.',
          }, lang)} />
        </div>
      </section>

      {/* ═══════ FOOTER NAV ═══════ */}
      <footer style={{
        maxWidth: 880, margin: '0 auto',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)',
        borderTop: `1px solid ${STAFF_LINE_COLOR}`,
        marginTop: 'clamp(2rem, 5vw, 4rem)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '1rem' }}>
          <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, letterSpacing: '0.04em' }}>
            <Link href="/theory/m1/l01" style={{ color: INK_SOFT, textDecoration: 'none' }}>
              ← M1-01 {t({ ja: '記譜法の導入', en: 'Intro to Notation', es: 'Intro a la notación', ko: '기보법 도입', pt: 'Intro à notação', de: 'Einführung in die Notation' }, lang)}
            </Link>
            <span style={{ margin: '0 0.6rem', color: STAFF_LINE_COLOR }}>·</span>
            <span>{t({ ja: 'M1 楽典基礎 · Lesson 2 / 60', en: 'M1 Fundamentals · Lesson 2 / 60', es: 'M1 Fundamentos · 2 / 60', ko: 'M1 악전 기초 · 레슨 2 / 60', pt: 'M1 Fundamentos · Lição 2 / 60', de: 'M1 Grundlagen · Lektion 2 / 60' }, lang)}</span>
          </div>
          <Link href="/theory" style={{
            fontFamily: sans, fontSize: '0.85rem', color: INK,
            textDecoration: 'none', padding: '0.7rem 1.4rem',
            border: `1px solid ${INK}`, borderRadius: 999, letterSpacing: '0.06em',
          }}>
            {t({ ja: '目次へ戻る', en: 'Back to contents', es: 'Volver', ko: '목차로', pt: 'Voltar', de: 'Zum Inhalt' }, lang)}
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AnatomyMode — 音符の解剖図 (notehead, stem, beam, flag)
// ─────────────────────────────────────────────────────────────
function AnatomyMode({ lang }: { lang: Lang }) {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const PARTS = [
    { id: 'notehead', label: { ja: '符頭 (notehead)', en: 'Notehead', es: 'Cabeza', ko: '음표 머리', pt: 'Cabeça', de: 'Notenkopf' }, desc: { ja: '楕円形の本体。音の高さを示す。', en: 'The oval body. Indicates pitch.', es: 'Cuerpo ovalado. Indica la altura.', ko: '타원형 본체. 음의 높이를 나타냄.', pt: 'Corpo oval. Indica a altura.', de: 'Der ovale Körper. Zeigt die Tonhöhe an.' } },
    { id: 'stem', label: { ja: '符尾 (stem)', en: 'Stem', es: 'Plica', ko: '기둥', pt: 'Haste', de: 'Hals' }, desc: { ja: '符頭から伸びる縦線。リズム値の構成要素。', en: 'The vertical line extending from the head. Part of the rhythmic value.', es: 'Línea vertical desde la cabeza. Parte del valor rítmico.', ko: '머리에서 뻗는 세로선. 리듬값의 구성 요소.', pt: 'Linha vertical desde a cabeça. Parte do valor rítmico.', de: 'Die senkrechte Linie vom Kopf. Teil des Rhythmuswerts.' } },
    { id: 'beam', label: { ja: '連桁 (beam)', en: 'Beam', es: 'Barra', ko: '빔', pt: 'Barra', de: 'Balken' }, desc: { ja: '隣接する音符の符尾を繋ぐ太い横線。複数の 8 分音符以上を視覚的にグループ化。', en: 'A thick horizontal line connecting stems. Groups multiple eighth notes or shorter visually.', es: 'Línea horizontal gruesa que conecta plicas. Agrupa corcheas o más cortas.', ko: '인접 음표의 기둥을 잇는 굵은 가로선. 8 분음표 이상을 시각적으로 묶음.', pt: 'Linha horizontal grossa conectando hastes. Agrupa colcheias ou menores.', de: 'Dicker waagerechter Strich, der Hälse verbindet. Gruppiert Achtelnoten und kürzere.' } },
    { id: 'flag', label: { ja: '旗 (flag)', en: 'Flag', es: 'Corchete', ko: '꼬리', pt: 'Colchete', de: 'Fähnchen' }, desc: { ja: '単独の 8 分音符以下の符尾に付く飾り。リズム値が短いほど旗の数が増える。', en: 'A decoration on the stem of a single eighth note or shorter. More flags = shorter duration.', es: 'Adorno en la plica de una corchea o más corta. Más banderas = menor duración.', ko: '단독 8 분음표 이하의 기둥에 붙는 장식. 깃발 수 늘수록 짧음.', pt: 'Decoração na haste de colcheia ou menor. Mais bandeiras = menor duração.', de: 'Verzierung am Hals einer einzelnen Achtelnote oder kürzer. Mehr Fähnchen = kürzere Dauer.' } },
  ];

  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85, whiteSpace: 'pre-line' as const, wordBreak: 'keep-all' as const }}>
        {t({
          ja: `音符は最大 4 つの部分から構成されます。
下の図の色の付いた部分にカーソルを合わせると、各部の名前と役割が表示されます。`,
          en: `A note may have up to four parts.
Hover the colored regions in the diagram to see their names and roles.`,
          es: `Una nota puede tener hasta cuatro partes.
Pasa el cursor por las regiones coloreadas para ver nombres y funciones.`,
          ko: `음표는 최대 4 부분으로 구성됩니다.
색깔 부분에 커서를 올리면 명칭과 역할이 표시됩니다.`,
          pt: `Uma nota pode ter até quatro partes.
Passe o cursor pelas regiões coloridas para ver nomes e funções.`,
          de: `Eine Note hat bis zu vier Teile.
Bewegen Sie den Cursor auf farbige Bereiche, um Namen und Funktionen zu sehen.`,
        }, lang)}
      </p>

      <NoteAnatomySvg highlighted={highlighted} onHover={setHighlighted} />

      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.7rem' }}>
        {PARTS.map(p => (
          <div
            key={p.id}
            onMouseEnter={() => setHighlighted(p.id)}
            onMouseLeave={() => setHighlighted(null)}
            style={{
              padding: 'clamp(0.85rem, 1.5vw, 1rem) clamp(1rem, 2vw, 1.2rem)',
              background: highlighted === p.id ? PAPER_DEEP : '#fff',
              border: `1px solid ${highlighted === p.id ? INK : STAFF_LINE_COLOR}`,
              borderRadius: 4,
              transition: 'all 0.2s ease',
              cursor: 'default',
            }}
          >
            <div style={{ fontFamily: serif, fontSize: '0.95rem', fontWeight: 500, color: INK, marginBottom: '0.4rem', letterSpacing: '0.02em' }}>
              {t(p.label, lang)}
            </div>
            <p style={{ fontFamily: serif, fontSize: '0.82rem', color: INK_SOFT, lineHeight: 1.7, margin: 0, letterSpacing: '0.01em' }}>
              {t(p.desc, lang)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteAnatomySvg({ highlighted, onHover }: { highlighted: string | null; onHover: (id: string | null) => void }) {
  // Two beamed eighth notes + a single eighth note with flag
  // SVG dimensions
  const W = 480, H = 200;
  const STAFF_TOP = 60, GAP = 12;
  const trebleY = (line: number) => STAFF_TOP + (4 - line) * GAP;

  const head1X = 130, head1Y = trebleY(2); // G4
  const head2X = 200, head2Y = trebleY(2); // G4
  const head3X = 350, head3Y = trebleY(3); // B4

  const stemBottom = trebleY(2);
  const stemTop = trebleY(8); // 4 line spaces above middle line

  const highlight = (id: string) => highlighted === id ? ACCENT_GOLD : INK;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 480, background: PAPER, borderRadius: 4, display: 'block', margin: '0 auto' }}>
      {/* Staff lines */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1={20} x2={W - 20} y1={trebleY(i)} y2={trebleY(i)} stroke={STAFF_LINE_COLOR} strokeWidth={1} />
      ))}

      {/* Note 1: notehead + stem (left of pair) */}
      <g
        onMouseEnter={() => onHover('notehead')}
        onMouseLeave={() => onHover(null)}
        style={{ cursor: 'pointer' }}
      >
        <ellipse
          cx={head1X} cy={head1Y}
          rx={GAP * 0.85} ry={GAP * 0.6}
          fill={highlight('notehead')}
          transform={`rotate(-20 ${head1X} ${head1Y})`}
        />
      </g>
      <g
        onMouseEnter={() => onHover('stem')}
        onMouseLeave={() => onHover(null)}
        style={{ cursor: 'pointer' }}
      >
        <line x1={head1X + GAP * 0.7} x2={head1X + GAP * 0.7} y1={stemBottom} y2={stemTop} stroke={highlight('stem')} strokeWidth={1.5} />
      </g>

      {/* Note 2: notehead + stem (right of pair) */}
      <g onMouseEnter={() => onHover('notehead')} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
        <ellipse
          cx={head2X} cy={head2Y}
          rx={GAP * 0.85} ry={GAP * 0.6}
          fill={highlight('notehead')}
          transform={`rotate(-20 ${head2X} ${head2Y})`}
        />
      </g>
      <g onMouseEnter={() => onHover('stem')} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
        <line x1={head2X + GAP * 0.7} x2={head2X + GAP * 0.7} y1={stemBottom} y2={stemTop} stroke={highlight('stem')} strokeWidth={1.5} />
      </g>

      {/* Beam connecting note 1 and 2 */}
      <g onMouseEnter={() => onHover('beam')} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
        <rect
          x={head1X + GAP * 0.6} y={stemTop - 2}
          width={head2X - head1X + 4} height={6}
          fill={highlight('beam')}
        />
      </g>

      {/* Note 3: single eighth note with flag */}
      <g onMouseEnter={() => onHover('notehead')} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
        <ellipse
          cx={head3X} cy={head3Y}
          rx={GAP * 0.85} ry={GAP * 0.6}
          fill={highlight('notehead')}
          transform={`rotate(-20 ${head3X} ${head3Y})`}
        />
      </g>
      <g onMouseEnter={() => onHover('stem')} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
        <line x1={head3X + GAP * 0.7} x2={head3X + GAP * 0.7} y1={head3Y} y2={head3Y - GAP * 4.5} stroke={highlight('stem')} strokeWidth={1.5} />
      </g>
      {/* Flag (curved) */}
      <g onMouseEnter={() => onHover('flag')} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
        <path
          d={`M ${head3X + GAP * 0.7} ${head3Y - GAP * 4.5} Q ${head3X + GAP * 2.5} ${head3Y - GAP * 4} ${head3X + GAP * 2.0} ${head3Y - GAP * 2.5}`}
          stroke={highlight('flag')}
          strokeWidth={2}
          fill="none"
        />
      </g>

      {/* Subtle labels */}
      <text x={head1X + 10} y={H - 15} fontFamily={mono} fontSize={9} fill={INK_FAINT} letterSpacing={1}>
        eighth + eighth (beamed)
      </text>
      <text x={head3X - 30} y={H - 15} fontFamily={mono} fontSize={9} fill={INK_FAINT} letterSpacing={1}>
        eighth (flagged)
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// ShapesMode — 正しい符頭 / 誤った符頭の比較
// ─────────────────────────────────────────────────────────────
function ShapesMode({ lang }: { lang: Lang }) {
  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85, whiteSpace: 'pre-line' as const, wordBreak: 'keep-all' as const }}>
        {t({
          ja: `符頭の形は厳密に決まっています。
楕円形 (円ではない)、右上にやや傾く、線の半分ずつを埋めるか上下の線にちょうど触れる大きさ。
下の比較で、正しい形と典型的な誤りを並べて確認してください。`,
          en: `Notehead shape follows strict conventions.
Oval (not round), tilted slightly upward to the right, sized to fill half each side of a line or just touch the lines of a space.
The comparison below shows the correct shape alongside common errors.`,
          es: `La forma de la cabeza tiene reglas estrictas.
Ovalada (no redonda), inclinada arriba a la derecha, dimensionada con precisión.
La comparación muestra correcto y errores típicos.`,
          ko: `머리 모양에는 엄밀한 규칙이 있습니다.
타원형, 오른쪽 위로 약간 기울어지며, 정확한 크기.
아래 비교로 올바른 형태와 일반적 오류를 확인하세요.`,
          pt: `A forma da cabeça tem regras estritas.
Oval, levemente inclinada para cima à direita, dimensionada com precisão.
Compare correto e erros comuns abaixo.`,
          de: `Die Kopfform folgt strengen Konventionen.
Oval, leicht nach rechts oben geneigt, präzise dimensioniert.
Unten finden Sie korrekt vs. häufige Fehler.`,
        }, lang)}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem' }}>
        <NoteCompareCard
          isCorrect
          label={t({ ja: '正しい形', en: 'Correct', es: 'Correcto', ko: '올바름', pt: 'Correto', de: 'Korrekt' }, lang)}
          desc={t({ ja: '楕円・右上に傾く・適切な大きさ', en: 'Oval, tilted up-right, properly sized', es: 'Oval, inclinada, tamaño adecuado', ko: '타원·기울어짐·적정 크기', pt: 'Oval, inclinada, tamanho certo', de: 'Oval, geneigt, passende Größe' }, lang)}
          drawNotehead={(cx, cy, gap, color) => (
            <ellipse cx={cx} cy={cy} rx={gap * 0.85} ry={gap * 0.6} fill={color} transform={`rotate(-20 ${cx} ${cy})`} />
          )}
        />
        <NoteCompareCard
          isCorrect={false}
          label={t({ ja: '誤り: 円形', en: 'Wrong: round', es: 'Mal: redonda', ko: '오류: 원형', pt: 'Errado: redonda', de: 'Falsch: rund' }, lang)}
          desc={t({ ja: '完全に円形 — 傾きがない', en: 'Perfectly circular — no tilt', es: 'Perfectamente circular', ko: '완전 원형 — 기울기 없음', pt: 'Perfeitamente circular', de: 'Perfekt rund — keine Neigung' }, lang)}
          drawNotehead={(cx, cy, gap, color) => (
            <circle cx={cx} cy={cy} r={gap * 0.7} fill={color} />
          )}
        />
        <NoteCompareCard
          isCorrect={false}
          label={t({ ja: '誤り: 大きすぎる', en: 'Wrong: too large', es: 'Mal: demasiado grande', ko: '오류: 너무 큼', pt: 'Errado: muito grande', de: 'Falsch: zu groß' }, lang)}
          desc={t({ ja: '上下の線をはみ出す', en: 'Spills past the lines above and below', es: 'Sobresale las líneas', ko: '위아래 선을 벗어남', pt: 'Ultrapassa as linhas', de: 'Überragt die Linien' }, lang)}
          drawNotehead={(cx, cy, gap, color) => (
            <ellipse cx={cx} cy={cy} rx={gap * 1.4} ry={gap * 0.95} fill={color} transform={`rotate(-20 ${cx} ${cy})`} />
          )}
        />
        <NoteCompareCard
          isCorrect={false}
          label={t({ ja: '誤り: 小さすぎる', en: 'Wrong: too small', es: 'Mal: demasiado pequeña', ko: '오류: 너무 작음', pt: 'Errado: muito pequena', de: 'Falsch: zu klein' }, lang)}
          desc={t({ ja: '線に届かず曖昧', en: 'Falls short of the lines, ambiguous', es: 'No alcanza las líneas', ko: '선에 미치지 못함', pt: 'Não alcança as linhas', de: 'Erreicht die Linien nicht' }, lang)}
          drawNotehead={(cx, cy, gap, color) => (
            <ellipse cx={cx} cy={cy} rx={gap * 0.4} ry={gap * 0.3} fill={color} transform={`rotate(-20 ${cx} ${cy})`} />
          )}
        />
      </div>
    </div>
  );
}

function NoteCompareCard({
  isCorrect, label, desc, drawNotehead,
}: {
  isCorrect: boolean;
  label: string;
  desc: string;
  drawNotehead: (cx: number, cy: number, gap: number, color: string) => React.ReactNode;
}) {
  const W = 160, H = 110;
  const STAFF_TOP = 30, GAP = 11;
  const trebleY = (line: number) => STAFF_TOP + (4 - line) * GAP;
  const cx = W / 2;
  const cy = trebleY(2); // middle line (B4 in treble)

  return (
    <div style={{
      background: isCorrect ? PAPER : '#fff',
      border: `1px solid ${isCorrect ? ACCENT_GREEN : STAFF_LINE_COLOR}`,
      borderRadius: 4,
      padding: 'clamp(0.9rem, 2vw, 1.2rem)',
      textAlign: 'center' as const,
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 160, marginBottom: '0.6rem' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <line key={i} x1={15} x2={W - 15} y1={trebleY(i)} y2={trebleY(i)} stroke={STAFF_LINE_COLOR} strokeWidth={1} />
        ))}
        {drawNotehead(cx, cy, GAP, INK)}
      </svg>
      <div style={{
        fontFamily: sans,
        fontSize: '0.7rem',
        fontWeight: 600,
        color: isCorrect ? ACCENT_GREEN : ACCENT_RED,
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        marginBottom: '0.4rem',
      }}>
        {isCorrect ? '✓ ' : '✗ '} {label}
      </div>
      <div style={{
        fontFamily: serif,
        fontSize: '0.78rem',
        color: INK_SOFT,
        lineHeight: 1.65,
        letterSpacing: '0.01em',
      }}>
        {desc}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PitchMode — 西洋 vs 古代ギリシャの方向性比較
// ─────────────────────────────────────────────────────────────
function PitchMode({ lang }: { lang: Lang }) {
  const [convention, setConvention] = useState<'western' | 'greek'>('western');
  const [picked, setPicked] = useState<number | null>(null);

  // Treble clef positions (line 0 = E4 bottom; line 4 = F5 top)
  // staffPos -2 = middle C, -1 = D4, 0 = E4 (line 1), 1 = F4 (space 1) ...
  const POSITIONS = [
    { staffPos: 0, midi: 64 },  // E4
    { staffPos: 1, midi: 65 },  // F4
    { staffPos: 2, midi: 67 },  // G4
    { staffPos: 3, midi: 69 },  // A4
    { staffPos: 4, midi: 71 },  // B4
    { staffPos: 5, midi: 72 },  // C5
    { staffPos: 6, midi: 74 },  // D5
    { staffPos: 7, midi: 76 },  // E5
    { staffPos: 8, midi: 77 },  // F5
  ];

  const W = 480, H = 200;
  const STAFF_TOP = 50, GAP = 14;
  const stafflineY = (line: number) => STAFF_TOP + (4 - line) * GAP;

  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85, whiteSpace: 'pre-line' as const, wordBreak: 'keep-all' as const }}>
        {t({
          ja: `「高い音は上に書く」と「高い音は下に書く」を切り替えてみましょう。
譜面のどこかをクリックすると、その位置の音が鳴ります。
高音と低音の身体感覚は、楽器によって変わります — 古代ギリシャの選択も道理に適っているのが分かります。`,
          en: `Toggle between "higher = up" and "higher = down" conventions.
Click anywhere on the staff to hear the pitch.
The bodily intuition of high and low depends on the instrument — you'll see why the ancient Greek choice has its own logic.`,
          es: `Alterna entre "agudo = arriba" y "agudo = abajo".
Haz clic donde quieras para oír la altura.
La intuición corporal depende del instrumento — verás por qué la elección griega tiene lógica.`,
          ko: `"높은 음 = 위" 와 "높은 음 = 아래" 를 전환해 보세요.
오선의 아무 곳이나 클릭하면 그 음이 울립니다.
높낮이의 신체 감각은 악기에 따라 달라집니다.`,
          pt: `Alterne entre "agudo = cima" e "agudo = baixo".
Clique em qualquer lugar para ouvir.
A intuição corporal depende do instrumento — a escolha grega tem sua lógica.`,
          de: `Wechseln Sie zwischen „hoch = oben" und „hoch = unten".
Klicken Sie irgendwo, um die Tonhöhe zu hören.
Das Körpergefühl hängt vom Instrument ab.`,
        }, lang)}
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.4rem', flexWrap: 'wrap' as const }}>
        <button
          onClick={() => setConvention('western')}
          style={{
            fontFamily: sans, fontSize: '0.82rem',
            color: convention === 'western' ? PAPER : INK_SOFT,
            background: convention === 'western' ? INK : 'transparent',
            border: `1px solid ${convention === 'western' ? INK : STAFF_LINE_COLOR}`,
            borderRadius: 999, padding: '0.55rem 1.2rem', cursor: 'pointer',
            letterSpacing: '0.05em', fontWeight: 500,
          }}
        >
          {t({ ja: '西洋 (高 = 上)', en: 'Western (high = up)', es: 'Occidental (agudo = arriba)', ko: '서양 (높음 = 위)', pt: 'Ocidental (agudo = cima)', de: 'Westlich (hoch = oben)' }, lang)}
        </button>
        <button
          onClick={() => setConvention('greek')}
          style={{
            fontFamily: sans, fontSize: '0.82rem',
            color: convention === 'greek' ? PAPER : INK_SOFT,
            background: convention === 'greek' ? INK : 'transparent',
            border: `1px solid ${convention === 'greek' ? INK : STAFF_LINE_COLOR}`,
            borderRadius: 999, padding: '0.55rem 1.2rem', cursor: 'pointer',
            letterSpacing: '0.05em', fontWeight: 500,
          }}
        >
          {t({ ja: '古代ギリシャ (高 = 下)', en: 'Ancient Greek (high = down)', es: 'Grecia antigua (agudo = abajo)', ko: '고대 그리스 (높음 = 아래)', pt: 'Grécia antiga (agudo = baixo)', de: 'Antikes Griechenland (hoch = unten)' }, lang)}
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 480, background: PAPER, borderRadius: 4, display: 'block', margin: '0 auto', cursor: 'pointer' }}
        transform={convention === 'greek' ? 'scale(1, -1)' : undefined}
        onClick={(e) => {
          const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
          let y = ((e.clientY - rect.top) / rect.height) * H;
          if (convention === 'greek') y = H - y; // flip
          const pos = Math.round(4 - (y - STAFF_TOP) / GAP * 2);
          const found = POSITIONS.find(p => p.staffPos === pos);
          if (found) {
            setPicked(found.midi);
            playNote(found.midi);
          }
        }}
      >
        {/* Staff lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <line key={i} x1={20} x2={W - 20} y1={stafflineY(i)} y2={stafflineY(i)} stroke={STAFF_LINE_COLOR} strokeWidth={1} />
        ))}
        {/* Treble clef */}
        <text x={30} y={stafflineY(2) + 28} fontFamily="Bravura, serif" fontSize={GAP * 4} fill={INK}>
          {String.fromCodePoint(0xE050)}
        </text>
        {/* Note positions as gentle dots */}
        {POSITIONS.map(p => {
          const cx = 100 + (p.midi - 64) * 35;
          const cy = stafflineY(p.staffPos / 2);
          const isPicked = picked === p.midi;
          return (
            <ellipse
              key={p.midi}
              cx={cx} cy={cy}
              rx={GAP * 0.7} ry={GAP * 0.5}
              fill={isPicked ? ACCENT_GOLD : 'transparent'}
              stroke={isPicked ? INK : INK_FAINT}
              strokeWidth={1}
              transform={`rotate(-20 ${cx} ${cy})`}
            />
          );
        })}
      </svg>

      <div style={{
        marginTop: '1rem',
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: '0.85rem',
        color: convention === 'greek' ? ACCENT_INDIGO : INK_FAINT,
        textAlign: 'center' as const,
        lineHeight: 1.85,
        letterSpacing: '0.02em',
        wordBreak: 'keep-all' as const,
      }}>
        {convention === 'western'
          ? t({
              ja: '現代の標準 — 五線の上方が高音、下方が低音。Bach・Mozart・現代音楽家全員が共有する慣習。',
              en: 'The modern standard — high pitches up, low pitches down. The convention shared by Bach, Mozart, and every modern musician.',
              es: 'El estándar moderno — agudos arriba, graves abajo.',
              ko: '현대 표준 — 높은 음은 위, 낮은 음은 아래.',
              pt: 'O padrão moderno — agudos acima, graves abaixo.',
              de: 'Der moderne Standard — hoch oben, tief unten.',
            }, lang)
          : t({
              ja: '古代ギリシャの一部の理論家の選択 — 高音を下に書く。リラやキタラを構えたとき、高音弦が身体の下に来る感覚に基づく。',
              en: 'The choice of some ancient Greek theorists — high pitches drawn down. Based on the bodily sense of holding a lyre or kithara, where high strings sit below.',
              es: 'Elección de algunos teóricos griegos — agudos abajo. Basado en cómo se sostiene la lira.',
              ko: '일부 고대 그리스 이론가의 선택 — 높은 음을 아래에. 리라나 키타라를 들 때의 신체 감각에 기반.',
              pt: 'Escolha de alguns teóricos gregos — agudos para baixo. Baseado em como se segura a lira.',
              de: 'Wahl mancher antiker griechischer Theoretiker — hohe Töne nach unten. Basierend auf der Haltung der Leier.',
            }, lang)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 共通サブコンポーネント
// ─────────────────────────────────────────────────────────────
function LayerLabel({ num, name }: { num: string; name: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: '0.85rem',
      marginBottom: 'clamp(1.4rem, 3vw, 1.8rem)',
      paddingBottom: '0.7rem', borderBottom: `1px solid ${STAFF_LINE_COLOR}`,
    }}>
      <span style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 2.5vw, 1.7rem)', color: ACCENT_GOLD, letterSpacing: '0.04em', lineHeight: 1 }}>{num}</span>
      <span style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, letterSpacing: '0.18em', textTransform: 'uppercase' as const, fontWeight: 600 }}>{name}</span>
    </div>
  );
}

function PyodideBadge({ state, lang }: { state: PyodideState; lang: Lang }) {
  const messages: Record<PyodideState, L6> = {
    idle: { ja: '', en: '' },
    loading: { ja: '音楽環境を準備中…', en: 'Preparing the music environment…', es: 'Preparando…', ko: '음악 환경 준비 중…', pt: 'Preparando…', de: 'Vorbereitung…' },
    ready: { ja: '✓ 準備完了', en: '✓ Ready', es: '✓ Listo', ko: '✓ 준비 완료', pt: '✓ Pronto', de: '✓ Bereit' },
    failed: { ja: '基本機能で動作中', en: 'Running with core features', es: 'Funciones básicas', ko: '기본 기능', pt: 'Funções básicas', de: 'Mit Kernfunktionen' },
  };
  const message = t(messages[state], lang);
  if (!message) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      fontFamily: mono, fontSize: '0.68rem',
      color: state === 'ready' ? ACCENT_INDIGO : INK_FAINT,
      letterSpacing: '0.08em', marginBottom: '1.4rem',
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
      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
      background: INK_FAINT, animation: 'kuonPulse 1.4s ease-in-out infinite',
    }}>
      <style>{`@keyframes kuonPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>
    </span>
  );
}

function ModeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: sans, fontSize: '0.82rem',
      color: active ? PAPER : INK_SOFT,
      background: active ? INK : 'transparent',
      border: `1px solid ${active ? INK : STAFF_LINE_COLOR}`,
      borderRadius: 999, padding: '0.55rem 1.2rem', cursor: 'pointer',
      letterSpacing: '0.05em', fontWeight: 500, transition: 'all 0.2s ease',
    }}>
      {label}
    </button>
  );
}

function FlashcardItem({ card, lang }: { card: { q: L6; a: L6 }; lang: Lang }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button onClick={() => setFlipped(f => !f)} style={{
      background: flipped ? PAPER_DEEP : '#fff',
      border: `1px solid ${STAFF_LINE_COLOR}`, borderRadius: 4,
      padding: 'clamp(1.2rem, 2.5vw, 1.5rem)', cursor: 'pointer',
      textAlign: 'left' as const, fontFamily: serif, fontSize: '0.92rem',
      color: INK, lineHeight: 1.85, letterSpacing: '0.02em',
      transition: 'all 0.3s ease', minHeight: 120,
      display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-start' as const,
    }}>
      <div style={{ fontFamily: mono, fontSize: '0.65rem', color: INK_FAINT, letterSpacing: '0.16em', textTransform: 'uppercase' as const, marginBottom: '0.7rem' }}>
        {flipped ? t({ ja: '答え', en: 'Answer', es: 'Respuesta', ko: '답', pt: 'Resposta', de: 'Antwort' }, lang) : t({ ja: '問い', en: 'Question', es: 'Pregunta', ko: '질문', pt: 'Pergunta', de: 'Frage' }, lang)}
      </div>
      <div style={{ wordBreak: 'keep-all' as const, whiteSpace: 'pre-line' as const }}>
        {flipped ? t(card.a, lang) : t(card.q, lang)}
      </div>
    </button>
  );
}

function RelatedTool({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        background: '#fff', border: `1px solid ${STAFF_LINE_COLOR}`, borderRadius: 4,
        padding: 'clamp(1.1rem, 2vw, 1.4rem)', height: '100%',
        transition: 'all 0.25s ease', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = INK; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = STAFF_LINE_COLOR; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{ fontFamily: sans, fontSize: '0.78rem', fontWeight: 600, color: INK, letterSpacing: '0.06em', marginBottom: '0.55rem' }}>{title}</div>
        <p style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, lineHeight: 1.7, margin: 0, letterSpacing: '0.01em' }}>{desc}</p>
        <div style={{ fontFamily: sans, fontSize: '0.7rem', color: ACCENT_INDIGO, marginTop: '0.85rem', letterSpacing: '0.04em' }}>{'→'}</div>
      </div>
    </Link>
  );
}
