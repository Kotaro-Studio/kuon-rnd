'use client';

/**
 * /theory/m4/l01 — M4-01「カデンツの種類 — 機能和声への導入」
 * =========================================================
 * Living Score の力を最も発揮するレッスン。
 * Bach が選んだ音楽の句読点 — 完全終止・不完全終止・半終止・偽終止。
 *
 * OMT v2 マッピング:
 *   - Part IV 第 1 章 (Introduction to Harmony, Cadences, and Phrase Endings)
 *   - M4 機能和声の最初のレッスン
 *   - 前提: M1 (Fundamentals) を完了していること
 *
 * 設計原則 (CLAUDE.md §47, §48, §49):
 *   - Norton Critical Edition の品位
 *   - 4 つのカデンツを SATB 風に表示し、本物の和声を聴く
 *   - §49: 「定番の答えは X」「Bach は Y を選んだ」「あなたの選択も成立する」
 */

import { useEffect, useRef, useState, useCallback } from 'react';
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

type L6 = { ja?: string; en: string; es?: string; ko?: string; pt?: string; de?: string };
const t = (m: L6, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

// ─────────────────────────────────────────────────────────────
// カデンツ定義 — C 長調・SATB 4 声体
// 各音は MIDI ノート番号で表現 (60 = middle C)
// ─────────────────────────────────────────────────────────────
type CadenceType = 'PAC' | 'IAC' | 'HC' | 'Deceptive';

interface Voice4 {
  s: number;  // soprano
  a: number;  // alto
  ten: number; // tenor (treble clef +8 でも記譜上は bass clef)
  b: number;  // bass
}

interface CadenceDef {
  type: CadenceType;
  name: L6;
  rn: string;          // ローマ数字進行
  chord1: Voice4;
  chord2: Voice4;
  description: L6;
  bachExample: L6;     // Bach の引用
}

// MIDI helpers
const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const CADENCES: CadenceDef[] = [
  {
    type: 'PAC',
    name: { ja: '完全終止 (PAC)', en: 'Perfect Authentic Cadence (PAC)', es: 'Cadencia auténtica perfecta', ko: '완전 종지', pt: 'Cadência autêntica perfeita', de: 'Vollkommene Ganzschluss' },
    rn: 'V⁷ → I',
    // V7 (G B D F → 67 71 74 77) → I (C E G C → 60 64 67 72)
    chord1: { s: 74, a: 71, ten: 65, b: 55 }, // G7: D5 / B4 / F4 / G3
    chord2: { s: 72, a: 67, ten: 64, b: 48 }, // I:  C5 / G4 / E4 / C3
    description: {
      ja: '最も強い終止。V⁷ → I で両和音とも基本形、ソプラノが主音 (do) に到着する。最大の終結感を生む。',
      en: 'The strongest cadence. V⁷ → I, both in root position, soprano landing on the tonic. Maximum finality.',
      es: 'La cadencia más fuerte. V⁷ → I en estado fundamental, soprano sobre la tónica.',
      ko: '가장 강한 종지. V⁷ → I, 두 화음 모두 기본형, 소프라노가 으뜸음에 도달.',
      pt: 'A cadência mais forte. V⁷ → I, ambos em estado fundamental, soprano na tônica.',
      de: 'Der stärkste Schluss. V⁷ → I, beide in Grundstellung, Sopran auf der Tonika.',
    },
    bachExample: {
      ja: 'Bach BWV 269 (Aus meines Herzens Grunde) 終結部 — 教科書的な完全終止の典型例。',
      en: 'Bach BWV 269 (Aus meines Herzens Grunde), final cadence — the textbook example.',
      es: 'Bach BWV 269, cadencia final — ejemplo de manual.',
      ko: '바흐 BWV 269 종결 — 교과서적 예시.',
      pt: 'Bach BWV 269, cadência final — exemplo clássico.',
      de: 'Bach BWV 269, Schlusskadenz — der Lehrbuchfall.',
    },
  },
  {
    type: 'IAC',
    name: { ja: '不完全終止 (IAC)', en: 'Imperfect Authentic Cadence (IAC)', es: 'Cadencia auténtica imperfecta', ko: '불완전 종지', pt: 'Cadência autêntica imperfeita', de: 'Unvollkommene Ganzschluss' },
    rn: 'V → I (3 度)',
    chord1: { s: 71, a: 67, ten: 62, b: 55 }, // V: B4 / G4 / D4 / G3
    chord2: { s: 64, a: 67, ten: 60, b: 48 }, // I: E4 / G4 / C4 / C3 — soprano on 3rd
    description: {
      ja: 'V → I だが、ソプラノが第 3 音 (mi) で着地する、または転回形を含む。終結感はあるが、PAC より柔らかい。',
      en: 'V → I, but soprano lands on the 3rd (or chord is inverted). Resolution is felt, but softer than PAC.',
      es: 'V → I, pero la soprano cae en la 3ª. Resuelve, pero más suave que PAC.',
      ko: 'V → I 이지만 소프라노가 제 3 음에 착지. 종결감은 있으나 PAC 보다 부드러움.',
      pt: 'V → I, mas soprano cai na 3ª. Resolve, mais suave que PAC.',
      de: 'V → I, doch der Sopran landet auf der 3. Stufe. Schluss spürbar, aber weicher als PAC.',
    },
    bachExample: {
      ja: 'Bach コラールの中間カデンツに頻出。文章の途中の読点のような役割。',
      en: 'Common at internal cadence points in Bach chorales — like a comma rather than a period.',
      es: 'Frecuente en cadencias internas de los corales de Bach — como una coma.',
      ko: '바흐 코랄 중간 카덴츠에 빈번. 문장 중간의 쉼표 역할.',
      pt: 'Comum em cadências internas dos corais de Bach — como uma vírgula.',
      de: 'Häufig in inneren Kadenzen Bach\'scher Choräle — eher ein Komma als Punkt.',
    },
  },
  {
    type: 'HC',
    name: { ja: '半終止 (HC)', en: 'Half Cadence (HC)', es: 'Semicadencia', ko: '반종지', pt: 'Cadência suspensiva', de: 'Halbschluss' },
    rn: '... → V',
    chord1: { s: 72, a: 65, ten: 60, b: 53 }, // IV: C5 / F4 / C4 / F3
    chord2: { s: 74, a: 67, ten: 62, b: 55 }, // V: D5 / G4 / D4 / G3
    description: {
      ja: 'V で終わる。終結ではなく「中休み」「次への期待」を生む。質問のような開いた響き。',
      en: 'Ends on V. Not a conclusion but a pause — a question, an opening to what comes next.',
      es: 'Termina en V. No conclusión sino pausa — una pregunta, abierta al siguiente movimiento.',
      ko: 'V 로 끝남. 종결이 아닌 휴지·다음에 대한 기대.',
      pt: 'Termina em V. Não conclui — pausa, pergunta, abertura para o próximo.',
      de: 'Endet auf V. Kein Schluss, sondern Pause — eine Frage, eine Öffnung.',
    },
    bachExample: {
      ja: '楽句の前半終わりに頻出。Mozart のソナタ K.545 第 1 楽章 第 2 小節も典型。',
      en: 'Found at the end of antecedent phrases. Mozart K.545, mvt 1, m. 2 is typical.',
      es: 'Al final de antecedentes. Mozart K.545, 1er mov., c. 2 es típico.',
      ko: '악구의 전반부 종결에 빈번. 모차르트 K.545 1악장 2마디도 전형.',
      pt: 'No fim de antecedentes. Mozart K.545, 1º mov., c. 2 é típico.',
      de: 'Am Ende des Vordersatzes. Mozart KV 545, Satz 1, T. 2 ist typisch.',
    },
  },
  {
    type: 'Deceptive',
    name: { ja: '偽終止', en: 'Deceptive Cadence', es: 'Cadencia engañosa / rota', ko: '위종지', pt: 'Cadência interrompida', de: 'Trugschluss' },
    rn: 'V → vi',
    chord1: { s: 74, a: 71, ten: 65, b: 55 }, // V7: D5 / B4 / F4 / G3
    chord2: { s: 72, a: 69, ten: 64, b: 57 }, // vi (Am): C5 / A4 / E4 / A3
    description: {
      ja: 'V → I を期待した耳が、V → vi で裏切られる。物語が続くという合図。聴き手の予測を意図的に外す技法。',
      en: 'The ear expects V → I but receives V → vi. A signal that the story continues. A deliberate subversion of expectation.',
      es: 'El oído espera V → I pero recibe V → vi. Señal de que la historia continúa.',
      ko: 'V → I 를 기대한 귀가 V → vi 로 배신당함. 이야기가 계속된다는 신호.',
      pt: 'O ouvido espera V → I mas recebe V → vi. Sinal de que a história continua.',
      de: 'Das Ohr erwartet V → I, bekommt aber V → vi. Ein Zeichen, dass die Geschichte weitergeht.',
    },
    bachExample: {
      ja: 'Bach BWV 248 (クリスマス・オラトリオ) や BWV 21 で物語の継続に頻用。Beethoven も交響曲第 9 番終楽章で印象的に使用。',
      en: 'Used by Bach in BWV 248 (Christmas Oratorio) and BWV 21 for narrative continuation. Beethoven uses it memorably in Symphony 9, finale.',
      es: 'Bach lo usa en BWV 248 y BWV 21. Beethoven, memorable en la 9ª sinfonía, finale.',
      ko: '바흐 BWV 248·BWV 21 에서 빈용. 베토벤 9번 교향곡 종악장에도 인상적.',
      pt: 'Bach o usa em BWV 248 e BWV 21. Beethoven, memorável na 9ª sinfonia, finale.',
      de: 'Bach in BWV 248 und BWV 21. Beethoven setzt ihn eindrucksvoll im Finale der 9. Sinfonie ein.',
    },
  },
];

// ─────────────────────────────────────────────────────────────
// Web Audio: 4 声体の和音を再生 (簡易 organ-like)
// ─────────────────────────────────────────────────────────────
function playCadence(c1: Voice4, c2: Voice4) {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.15;
  masterGain.connect(ctx.destination);

  const playChord = (voices: Voice4, t0: number, dur: number) => {
    [voices.s, voices.a, voices.ten, voices.b].forEach((midi) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const g = ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.value = midiToFreq(midi);
      osc2.frequency.value = midiToFreq(midi) * 2; // octave overtone
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.22, t0 + 0.025);
      g.gain.setValueAtTime(0.22, t0 + dur - 0.15);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc1.connect(g);
      osc2.connect(g);
      g.connect(masterGain);
      osc1.start(t0);
      osc2.start(t0);
      osc1.stop(t0 + dur);
      osc2.stop(t0 + dur);
    });
  };

  const start = ctx.currentTime + 0.05;
  playChord(c1, start, 1.0);
  playChord(c2, start + 1.0, 1.4);
  setTimeout(() => ctx.close(), 2700);
}

// ─────────────────────────────────────────────────────────────
// 4 声体グランドステーブを SVG で描画
// ─────────────────────────────────────────────────────────────
const GS_W = 360;
const GS_H = 240;
const GS_GAP = 8;            // line gap
const TREBLE_TOP = 30;       // F5 line y
const BASS_TOP = 130;        // A3 line y
const CHORD_X1 = 130;
const CHORD_X2 = 260;

// MIDI → staff y (treble clef, F5 line = y0)
// treble: F5=77, E5=76, D5=74... each step = 0.5 staff position
function midiToTrebleY(midi: number): number {
  // treble clef reference: middle line (B4=71)
  // each diatonic step (e.g. C → D) is half a line gap visually
  const middleLine = TREBLE_TOP + 2 * GS_GAP;  // B4
  const stepFromB4 = diatonicStep(midi) - diatonicStep(71);
  return middleLine - stepFromB4 * (GS_GAP / 2);
}

function midiToBassY(midi: number): number {
  // bass clef reference: middle line (D3=50)
  const middleLine = BASS_TOP + 2 * GS_GAP;
  const stepFromD3 = diatonicStep(midi) - diatonicStep(50);
  return middleLine - stepFromD3 * (GS_GAP / 2);
}

// diatonicStep: count of white keys from C0
function diatonicStep(midi: number): number {
  const octave = Math.floor(midi / 12);
  const pc = midi % 12;
  // C=0, D=1, E=2, F=3, G=4, A=5, B=6
  const map: Record<number, number> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
  const step = map[pc] !== undefined ? map[pc] : 0;
  return octave * 7 + step;
}

function GrandStaffCadence({ chord1, chord2, label }: { chord1: Voice4; chord2: Voice4; label?: string }) {
  // 5 staff lines for treble + 5 for bass
  const trebleLines = [0, 1, 2, 3, 4].map(i => TREBLE_TOP + i * GS_GAP);
  const bassLines = [0, 1, 2, 3, 4].map(i => BASS_TOP + i * GS_GAP);

  const renderNote = (midi: number, x: number, isBass: boolean) => {
    const y = isBass ? midiToBassY(midi) : midiToTrebleY(midi);
    return (
      <ellipse
        key={`${x}-${midi}-${isBass}`}
        cx={x} cy={y}
        rx={GS_GAP * 0.85} ry={GS_GAP * 0.6}
        fill={INK}
        transform={`rotate(-20 ${x} ${y})`}
      />
    );
  };

  return (
    <svg viewBox={`0 0 ${GS_W} ${GS_H}`} style={{ width: '100%', maxWidth: 360, background: PAPER, borderRadius: 4 }}>
      {/* Staff lines */}
      {trebleLines.map((y, i) => <line key={`t${i}`} x1={40} x2={GS_W - 20} y1={y} y2={y} stroke={STAFF_LINE_COLOR} strokeWidth={1} />)}
      {bassLines.map((y, i) => <line key={`b${i}`} x1={40} x2={GS_W - 20} y1={y} y2={y} stroke={STAFF_LINE_COLOR} strokeWidth={1} />)}

      {/* Treble clef */}
      <text x={48} y={TREBLE_TOP + 2 * GS_GAP + 18} fontFamily="Bravura, serif" fontSize={GS_GAP * 4} fill={INK}>
        {String.fromCodePoint(0xE050)}
      </text>
      {/* Bass clef */}
      <text x={48} y={BASS_TOP + GS_GAP + 6} fontFamily="Bravura, serif" fontSize={GS_GAP * 4} fill={INK}>
        {String.fromCodePoint(0xE062)}
      </text>

      {/* Chord 1: soprano + alto in treble, tenor + bass in bass clef */}
      {renderNote(chord1.s, CHORD_X1, false)}
      {renderNote(chord1.a, CHORD_X1, false)}
      {renderNote(chord1.ten, CHORD_X1, true)}
      {renderNote(chord1.b, CHORD_X1, true)}
      {/* Chord 2 */}
      {renderNote(chord2.s, CHORD_X2, false)}
      {renderNote(chord2.a, CHORD_X2, false)}
      {renderNote(chord2.ten, CHORD_X2, true)}
      {renderNote(chord2.b, CHORD_X2, true)}

      {/* RN label below */}
      {label && (
        <text x={GS_W / 2} y={GS_H - 8} textAnchor="middle" fontFamily={mono} fontSize={11} fill={INK_FAINT} letterSpacing={3}>
          {label}
        </text>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Layer 3 フラッシュカード
// ─────────────────────────────────────────────────────────────
const FLASHCARDS: { q: L6; a: L6 }[] = [
  {
    q: { ja: '完全終止 (PAC) を構成する 3 条件は?', en: 'What are the three requirements of a Perfect Authentic Cadence?', es: '¿Cuáles son los 3 requisitos de la cadencia auténtica perfecta?', ko: '완전 종지의 3 조건?', pt: 'Os 3 requisitos da cadência autêntica perfeita?', de: 'Drei Bedingungen einer vollkommenen Ganzschluss?' },
    a: { ja: '① V → I の進行 ② 両和音とも基本形 ③ ソプラノが主音 (do) に着地', en: '(1) V → I motion (2) both chords in root position (3) soprano lands on tonic.', es: '(1) V → I (2) ambos en estado fundamental (3) soprano en la tónica.', ko: '① V → I ② 두 화음 기본형 ③ 소프라노가 으뜸음에', pt: '(1) V → I (2) ambos em estado fundamental (3) soprano na tônica.', de: '(1) V → I, (2) beide Grundstellung, (3) Sopran auf der Tonika.' },
  },
  {
    q: { ja: '半終止 (HC) はどの和音で終わる?', en: 'On which chord does a Half Cadence end?', es: '¿En qué acorde termina una semicadencia?', ko: '반종지는 어느 화음으로 끝나는가?', pt: 'Em qual acorde termina a cadência suspensiva?', de: 'Auf welchem Akkord endet ein Halbschluss?' },
    a: { ja: 'V (属和音) で終わる。終結ではなく開いた響きを残す。', en: 'V (the dominant). It leaves an open sound, not a conclusion.', es: 'En V. Deja un sonido abierto.', ko: 'V (딸림화음). 열린 음향을 남김.', pt: 'Em V. Deixa um som aberto.', de: 'Auf V. Bleibt offen.' },
  },
  {
    q: { ja: '偽終止の最も典型的な進行は?', en: 'What is the most typical deceptive-cadence progression?', es: '¿Cuál es la progresión más típica de la cadencia engañosa?', ko: '위종지의 가장 전형적 진행은?', pt: 'Qual a progressão mais típica da cadência interrompida?', de: 'Typischste Trugschluss-Progression?' },
    a: { ja: 'V → vi (長調) または V → VI (短調)。期待された I の代わりに 6 度上の和音へ。', en: 'V → vi (in major) or V → VI (in minor). Instead of the expected I, the music moves a step up.', es: 'V → vi (mayor) o V → VI (menor).', ko: 'V → vi (장조) 또는 V → VI (단조).', pt: 'V → vi (maior) ou V → VI (menor).', de: 'V → vi (Dur) oder V → VI (Moll).' },
  },
  {
    q: { ja: 'カデンツが文章の「句読点」である理由は?', en: 'Why are cadences called the "punctuation" of music?', es: '¿Por qué se llaman las cadencias "puntuación" de la música?', ko: '카덴츠가 음악의 "구두점"이라 불리는 이유?', pt: 'Por que as cadências são chamadas de "pontuação" da música?', de: 'Warum sind Kadenzen die „Interpunktion" der Musik?' },
    a: { ja: '楽句の終わりを区切り、聴き手に「ここで一息つける」「まだ続く」を伝える機能を担うため。完全終止 = 句点、半終止 = 読点、偽終止 = ダッシュ、のように対応する。', en: 'They mark phrase endings and tell the listener "rest here" or "more is coming." PAC = period, HC = comma, deceptive = dash.', es: 'Marcan finales de frase y avisan al oyente. PAC = punto, HC = coma, engañosa = guion.', ko: '악구의 끝을 구분하고 청자에게 휴지·계속을 전달. PAC=마침표, HC=쉼표, 위종지=대시.', pt: 'Marcam fins de frases. PAC = ponto, HC = vírgula, interrompida = travessão.', de: 'Sie markieren Phrasenenden. PAC = Punkt, HC = Komma, Trugschluss = Gedankenstrich.' },
  },
  {
    q: { ja: '不完全終止 (IAC) と完全終止 (PAC) の違いは?', en: 'How does an Imperfect Authentic Cadence differ from a Perfect one?', es: '¿En qué se diferencia la IAC de la PAC?', ko: 'IAC 와 PAC 의 차이는?', pt: 'Como IAC difere de PAC?', de: 'Worin unterscheidet sich IAC von PAC?' },
    a: { ja: 'IAC は (a) ソプラノが主音以外で着地する、または (b) どちらかの和音が転回形である、いずれかを含む。終結感は弱まり、内的なカデンツに使われる。', en: 'In IAC either (a) the soprano lands on a non-tonic note, or (b) one of the chords is inverted. Resolution feels softer; used at internal cadence points.', es: 'IAC: o la soprano cae fuera de la tónica, o uno de los acordes está invertido. Más suave; usada en cadencias internas.', ko: 'IAC 는 (a) 소프라노가 으뜸음 외에 착지하거나 (b) 어느 한 화음이 전회형. 종결감이 약함, 내부 카덴츠에 사용.', pt: 'IAC: a soprano não cai na tônica, ou um dos acordes está invertido. Mais suave.', de: 'IAC: Sopran landet nicht auf der Tonika, oder ein Akkord ist umgekehrt. Weicher, intern.' },
  },
];

// ─────────────────────────────────────────────────────────────
// メイン
// ─────────────────────────────────────────────────────────────
type PracticeMode = 'gallery' | 'quiz';
type PyodideState = 'idle' | 'loading' | 'ready' | 'failed';

export default function LessonM4L01() {
  const { lang } = useLang();
  const [mode, setMode] = useState<PracticeMode>('gallery');
  const [pyodideState, setPyodideState] = useState<PyodideState>('idle');
  const startedRef = useRef(false);

  // Bravura font
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

  // Pyodide background load
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

      {/* ═══════ パンくず + タイトル ═══════ */}
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
          M4 · LESSON 01
        </div>
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.85rem, 4.5vw, 2.85rem)',
          fontWeight: 400, letterSpacing: '0.04em', lineHeight: 1.4, margin: 0,
          color: INK, wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: 'カデンツの種類',
            en: 'Types of Cadence',
            es: 'Tipos de cadencia',
            ko: '카덴츠의 종류',
            pt: 'Tipos de cadência',
            de: 'Arten der Kadenz',
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
          fontFamily: serif,
          fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          color: INK, lineHeight: 2.05, letterSpacing: '0.03em',
          wordBreak: 'keep-all' as const,
        }}>
          <p style={{ margin: '0 0 1.6rem 0' }}>
            {t({
              ja: '楽曲は呼吸する。終止形 (カデンツ) は音楽の句読点である。完全終止は文の終わりの句点、半終止は読点、偽終止は予期せぬダッシュ — 聴き手に「続く」を告げる。',
              en: 'Music breathes. The cadence is its punctuation. The Perfect Authentic Cadence is the period at the end of a sentence; the Half Cadence, a comma; the Deceptive Cadence, an unexpected dash — telling the listener "more is coming."',
              es: 'La música respira. La cadencia es su puntuación. PAC = punto, HC = coma, engañosa = guion inesperado.',
              ko: '음악은 호흡합니다. 카덴츠는 그 구두점. PAC = 마침표, HC = 쉼표, 위종지 = 예상 못한 대시.',
              pt: 'A música respira. A cadência é sua pontuação. PAC = ponto, HC = vírgula, interrompida = travessão inesperado.',
              de: 'Musik atmet. Die Kadenz ist ihre Interpunktion. PAC = Punkt, HC = Komma, Trugschluss = unerwarteter Gedankenstrich.',
            }, lang)}
          </p>
          <p style={{ margin: '0 0 1.6rem 0' }}>
            {t({
              ja: 'バッハは BWV 269「Aus meines Herzens Grunde」の終結部で完全終止 (V⁷ → I) を選びました。最も強い終結。文の最後の句点に相当します。しかし同じ作曲家が別の場面では偽終止 (V → vi) を選び、聴き手の予測を意図的に裏切ることで、物語の継続を示しました。',
              en: 'Bach chose a Perfect Authentic Cadence (V⁷ → I) at the close of BWV 269. The strongest possible ending — a final period. Yet elsewhere the same composer chose Deceptive Cadences (V → vi), deliberately subverting expectation to signal that the story continues.',
              es: 'Bach eligió PAC al cierre de BWV 269. El final más fuerte. Pero en otros pasajes optó por cadencias engañosas (V → vi).',
              ko: '바흐는 BWV 269 종결에서 완전 종지 (V⁷ → I) 를 택했습니다. 가장 강한 종결. 그러나 다른 곳에서는 위종지 (V → vi) 를 택해 청자의 예측을 깼습니다.',
              pt: 'Bach escolheu PAC no final de BWV 269. O fim mais forte. Mas em outras passagens preferiu interrompidas (V → vi).',
              de: 'Bach wählte am Schluss von BWV 269 eine PAC (V⁷ → I) — den stärksten Schluss. Anderswo aber griff er zu Trugschlüssen (V → vi).',
            }, lang)}
          </p>
          <p style={{ margin: 0 }}>
            {t({
              ja: '「正解」は一つではありません。完全終止が定番ですが、文脈によっては不完全終止・半終止・偽終止のいずれもが正しい選択になり得ます。本物の作曲家は、4 つの型を知った上で、その瞬間に最も生きている選択を選び取ってきました。',
              en: 'There is no single "right" answer. The PAC is the textbook choice, but depending on context, IAC, HC, or Deceptive can each be the correct one. Real composers know all four and choose what is most alive in the moment.',
              es: 'No hay una sola respuesta "correcta". PAC es la elección de manual, pero según el contexto, IAC, HC o engañosa pueden serlo. Los compositores reales conocen las cuatro y eligen lo más vivo.',
              ko: '"정답"은 하나가 아닙니다. PAC 는 정석이지만 문맥에 따라 IAC·HC·위종지 모두 옳은 선택이 될 수 있습니다. 진정한 작곡가는 네 가지를 모두 알고 그 순간에 가장 살아있는 선택을 합니다.',
              pt: 'Não há uma única resposta "correta". PAC é o padrão, mas dependendo do contexto, IAC, HC ou interrompida pode ser. Compositores reais conhecem as quatro.',
              de: 'Es gibt nicht die eine „richtige" Antwort. PAC ist die Lehrbuchwahl, aber je nach Kontext kann jeder der vier Typen der richtige sein.',
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
          <LayerLabel num="II" name={t({ ja: 'Living Score (4 つのカデンツを聴く)', en: 'Living Score (hear the four cadences)', es: 'Living Score (escucha las cuatro)', ko: 'Living Score (네 종류 듣기)', pt: 'Living Score (ouvir as quatro)', de: 'Living Score (vier Kadenzen hören)' }, lang)} />
          <PyodideBadge state={pyodideState} lang={lang} />

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'clamp(1.4rem, 3vw, 2rem)', flexWrap: 'wrap' }}>
            <ModeButton active={mode === 'gallery'} onClick={() => setMode('gallery')}
              label={t({ ja: '4 つを並べて聴く', en: 'Compare the four', es: 'Comparar las cuatro', ko: '네 가지 비교', pt: 'Comparar as quatro', de: 'Vier vergleichen' }, lang)} />
            <ModeButton active={mode === 'quiz'} onClick={() => setMode('quiz')}
              label={t({ ja: '聴いて識別する', en: 'Identify by ear', es: 'Identificar de oído', ko: '듣고 식별', pt: 'Identificar de ouvido', de: 'Nach Gehör erkennen' }, lang)} />
          </div>

          {mode === 'gallery' && <GalleryMode lang={lang} />}
          {mode === 'quiz' && <QuizMode lang={lang} />}
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
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '1.2rem' }}>
          {t({ ja: '関連するツール', en: 'Related tools', es: 'Herramientas relacionadas', ko: '관련 도구', pt: 'Ferramentas relacionadas', de: 'Verwandte Werkzeuge' }, lang)}
        </div>
        <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.9rem', color: INK_SOFT, lineHeight: 1.85, margin: '0 0 1.4rem 0' }}>
          {t({
            ja: 'カデンツを学んだら、本物の楽曲で確認したくなるはずです。Kuon の和声分析ツール群が、Bach や Mozart の楽曲全体でカデンツを自動検出してくれます。',
            en: 'Once you know the cadences, you will want to find them in real music. Kuon\'s analysis tools detect cadences across whole pieces by Bach, Mozart, and beyond.',
            es: 'Una vez que conoces las cadencias, querrás encontrarlas en la música real.',
            ko: '카덴츠를 배웠으면 실제 곡에서 확인하고 싶어집니다.',
            pt: 'Depois de aprender, você vai querer encontrá-las em peças reais.',
            de: 'Wenn Sie die Kadenzen kennen, wollen Sie sie in echter Musik finden.',
          }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.9rem' }}>
          <RelatedTool href="/classical-lp" title="KUON CLASSICAL ANALYSIS" desc={t({
            ja: 'バッハ・モーツァルトの楽曲全体をローマ数字で自動分析。カデンツも自動検出。',
            en: 'Whole-piece Roman numeral analysis of Bach, Mozart, with automatic cadence detection.',
            es: 'Análisis con números romanos de obras enteras, detección automática de cadencias.',
            ko: '바흐·모차르트 전곡 로마 숫자 분석, 카덴츠 자동 검출.',
            pt: 'Análise por números romanos de obras inteiras, detecção automática de cadências.',
            de: 'Werkanalyse mit Stufenbezeichnung, automatische Kadenz-Erkennung.',
          }, lang)} />
          <RelatedTool href="/classical/lab-lp" title="KUON CLASSICAL LAB" desc={t({
            ja: 'ブラウザ内 Pyodide + music21 で自分のカデンツを分析・検証。世界初の研究環境。',
            en: 'Pyodide + music21 in your browser. Analyze and verify your own cadences. World first.',
            es: 'Pyodide + music21 en el navegador. Analiza tus propias cadencias.',
            ko: '브라우저 내 Pyodide + music21. 자신의 카덴츠 분석.',
            pt: 'Pyodide + music21 no navegador. Analise suas cadências.',
            de: 'Pyodide + music21 im Browser. Eigene Kadenzen prüfen.',
          }, lang)} />
          <RelatedTool href="/harmony" title="KUON HARMONY" desc={t({
            ja: 'SATB 4 声体の和音をリアルタイムでチェック。連続 5/8 度・声部進行違反を即座に検出。',
            en: 'Real-time SATB checker. Catches parallel 5ths/8ves and voice-leading errors as you write.',
            es: 'Comprobador SATB en tiempo real. Detecta paralelas y errores de conducción.',
            ko: 'SATB 실시간 체커. 연속 5/8도·성부 진행 위반 즉시 검출.',
            pt: 'Verificador SATB em tempo real. Detecta paralelas e erros de condução.',
            de: 'Echtzeit-SATB-Checker. Quint/Oktavparallelen sofort erkannt.',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, letterSpacing: '0.04em' }}>
            {t({ ja: 'M4 機能和声 · Lesson 1', en: 'M4 Diatonic Harmony · Lesson 1', es: 'M4 Armonía diatónica · Lección 1', ko: 'M4 기능 화성 · 레슨 1', pt: 'M4 Harmonia diatônica · Lição 1', de: 'M4 Diatonische Harmonik · Lektion 1' }, lang)}
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
// GalleryMode — 4 つのカデンツを並列表示
// ─────────────────────────────────────────────────────────────
function GalleryMode({ lang }: { lang: Lang }) {
  const [hovered, setHovered] = useState<CadenceType | null>(null);

  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85 }}>
        {t({
          ja: '4 つのカデンツを順に聴き比べてください。各カードの再生ボタンを押すと、4 声体で和声が鳴ります。違いは耳で覚えるのが一番です。',
          en: 'Listen to the four cadences in turn. Press play on each card; you will hear them in four voices. The difference is best learned by ear.',
          es: 'Escucha las cuatro cadencias. Toca cada tarjeta para oírlas a 4 voces.',
          ko: '네 카덴츠를 순서대로 들어보세요. 각 카드의 재생 버튼을 누르면 4 성부로 울립니다.',
          pt: 'Ouça as quatro cadências. Toque cada cartão para ouvir em 4 vozes.',
          de: 'Hören Sie die vier Kadenzen nacheinander. Drücken Sie auf jeder Karte „Abspielen".',
        }, lang)}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
        gap: '1.2rem',
      }}>
        {CADENCES.map(c => (
          <div key={c.type} style={{
            background: PAPER,
            border: `1px solid ${hovered === c.type ? INK : STAFF_LINE_COLOR}`,
            borderRadius: 4,
            padding: 'clamp(1.4rem, 2.5vw, 1.8rem)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={() => setHovered(c.type)}
          onMouseLeave={() => setHovered(null)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.7rem' }}>
              <h3 style={{
                fontFamily: serif,
                fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
                fontWeight: 500, color: INK,
                margin: 0, letterSpacing: '0.03em', lineHeight: 1.4,
                wordBreak: 'keep-all' as const,
              }}>
                {t(c.name, lang)}
              </h3>
              <span style={{ fontFamily: mono, fontSize: '0.78rem', color: ACCENT_GOLD, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                {c.rn}
              </span>
            </div>
            <GrandStaffCadence chord1={c.chord1} chord2={c.chord2} label={c.rn} />
            <p style={{ fontFamily: serif, fontSize: '0.92rem', color: INK_SOFT, lineHeight: 1.85, margin: '1rem 0 0.9rem 0', letterSpacing: '0.02em', wordBreak: 'keep-all' as const }}>
              {t(c.description, lang)}
            </p>
            <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.85rem', color: INK_FAINT, lineHeight: 1.8, margin: '0 0 1.2rem 0', letterSpacing: '0.02em', wordBreak: 'keep-all' as const }}>
              {t(c.bachExample, lang)}
            </p>
            <button onClick={() => playCadence(c.chord1, c.chord2)} style={{
              fontFamily: sans, fontSize: '0.85rem', color: PAPER,
              background: INK, border: 'none', borderRadius: 999,
              padding: '0.6rem 1.4rem', cursor: 'pointer', letterSpacing: '0.06em',
            }}>
              ♪ {t({ ja: '再生', en: 'Play', es: 'Reproducir', ko: '재생', pt: 'Tocar', de: 'Abspielen' }, lang)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QuizMode — 聴いて識別
// ─────────────────────────────────────────────────────────────
function QuizMode({ lang }: { lang: Lang }) {
  const [currentIdx, setCurrentIdx] = useState<number>(() => Math.floor(Math.random() * CADENCES.length));
  const [picked, setPicked] = useState<CadenceType | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [hasPlayed, setHasPlayed] = useState(false);

  const current = CADENCES[currentIdx];

  const playCurrent = () => {
    playCadence(current.chord1, current.chord2);
    setHasPlayed(true);
  };

  const next = useCallback(() => {
    let idx = Math.floor(Math.random() * CADENCES.length);
    if (idx === currentIdx) idx = (idx + 1) % CADENCES.length;
    setCurrentIdx(idx);
    setPicked(null);
    setFeedback('');
    setHasPlayed(false);
  }, [currentIdx]);

  const onPick = (type: CadenceType) => {
    setPicked(type);
    if (type === current.type) {
      setFeedback(t({
        ja: `これは${t(current.name, lang)} (${current.rn})。あなたの耳が捉えたとおりです。${t(current.bachExample, lang)}`,
        en: `This is ${t(current.name, lang)} (${current.rn}). Your ear caught it. ${t(current.bachExample, lang)}`,
        es: `Es ${t(current.name, lang)} (${current.rn}). Tu oído lo captó.`,
        ko: `이것은 ${t(current.name, lang)} (${current.rn}) 입니다. 당신의 귀가 잘 잡았습니다.`,
        pt: `Esta é ${t(current.name, lang)} (${current.rn}). Seu ouvido captou.`,
        de: `Das ist ${t(current.name, lang)} (${current.rn}). Ihr Ohr hat ihn erkannt.`,
      }, lang));
    } else {
      const chosen = CADENCES.find(c => c.type === type)!;
      setFeedback(t({
        ja: `定番の答えは ${t(current.name, lang)} (${current.rn}) でした。あなたの選んだ ${t(chosen.name, lang)} は ${chosen.rn} の進行で、別の文脈ではこちらが選ばれることもあります。両方とも音楽的に意味のある選択です。`,
        en: `The textbook answer is ${t(current.name, lang)} (${current.rn}). Your choice — ${t(chosen.name, lang)} (${chosen.rn}) — is also valid in different contexts. Both are musically meaningful.`,
        es: `La respuesta convencional es ${t(current.name, lang)} (${current.rn}). Tu elección, ${t(chosen.name, lang)}, también es válida en otros contextos.`,
        ko: `정석 답은 ${t(current.name, lang)} (${current.rn}) 였습니다. 당신이 선택한 ${t(chosen.name, lang)} 도 다른 문맥에서는 옳을 수 있습니다.`,
        pt: `A resposta convencional é ${t(current.name, lang)} (${current.rn}). Sua escolha, ${t(chosen.name, lang)}, também é válida em outros contextos.`,
        de: `Die Lehrbuchantwort ist ${t(current.name, lang)} (${current.rn}). Ihre Wahl ${t(chosen.name, lang)} ist in anderem Kontext ebenfalls richtig.`,
      }, lang));
    }
  };

  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85 }}>
        {t({
          ja: '再生ボタンを押し、聴こえたカデンツの種類を選んでください。',
          en: 'Play the cadence, then identify which type you heard.',
          es: 'Toca y luego identifica el tipo de cadencia.',
          ko: '재생하고 들리는 카덴츠 종류를 선택하세요.',
          pt: 'Toque e identifique o tipo.',
          de: 'Spielen Sie ab und erkennen Sie den Typ.',
        }, lang)}
      </p>

      <div style={{ textAlign: 'center' as const, padding: '1.5rem 0' }}>
        <button onClick={playCurrent} style={{
          fontFamily: sans, fontSize: '1rem',
          background: INK, color: PAPER, border: 'none', borderRadius: 999,
          padding: '1rem 2.4rem', cursor: 'pointer', letterSpacing: '0.06em',
        }}>
          {hasPlayed
            ? t({ ja: 'もう一度聴く', en: 'Play again', es: 'Reproducir de nuevo', ko: '다시 듣기', pt: 'Tocar de novo', de: 'Erneut abspielen' }, lang)
            : t({ ja: '♪ カデンツを再生', en: '♪ Play the cadence', es: '♪ Reproducir', ko: '♪ 재생', pt: '♪ Tocar', de: '♪ Abspielen' }, lang)}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: '0.6rem',
      }}>
        {CADENCES.map(c => {
          const isPickedHere = picked === c.type;
          return (
            <button key={c.type}
              onClick={() => onPick(c.type)}
              disabled={picked !== null || !hasPlayed}
              style={{
                fontFamily: serif,
                fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
                background: isPickedHere ? INK : '#fff',
                color: isPickedHere ? PAPER : INK,
                border: `1px solid ${isPickedHere ? INK : STAFF_LINE_COLOR}`,
                borderRadius: 4,
                padding: '1rem 0.8rem',
                cursor: picked !== null || !hasPlayed ? 'default' : 'pointer',
                letterSpacing: '0.04em',
                opacity: !hasPlayed ? 0.4 : (picked !== null && !isPickedHere ? 0.55 : 1),
                wordBreak: 'keep-all' as const,
              }}
            >
              {t(c.name, lang)}
            </button>
          );
        })}
      </div>

      {/* 答えが出たら譜面で見せる */}
      {picked !== null && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <GrandStaffCadence chord1={current.chord1} chord2={current.chord2} label={current.rn} />
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
          color: INK, lineHeight: 1.95, letterSpacing: '0.02em',
          wordBreak: 'keep-all' as const,
        }}>
          {feedback}
        </div>
      )}

      {picked !== null && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' as const }}>
          <button onClick={next} style={{
            fontFamily: sans, fontSize: '0.9rem',
            background: INK, color: PAPER, border: 'none', borderRadius: 999,
            padding: '0.85rem 2rem', cursor: 'pointer', letterSpacing: '0.06em',
          }}>
            {t({ ja: '次のカデンツ →', en: 'Next cadence →', es: 'Siguiente →', ko: '다음 →', pt: 'Próxima →', de: 'Nächste →' }, lang)}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 共通サブコンポーネント (M0-01 と同じパターン)
// ─────────────────────────────────────────────────────────────
function LayerLabel({ num, name }: { num: string; name: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: '0.85rem',
      marginBottom: 'clamp(1.4rem, 3vw, 1.8rem)',
      paddingBottom: '0.7rem', borderBottom: `1px solid ${STAFF_LINE_COLOR}`,
    }}>
      <span style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 2.5vw, 1.7rem)', color: ACCENT_GOLD, letterSpacing: '0.04em', lineHeight: 1 }}>{num}</span>
      <span style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>{name}</span>
    </div>
  );
}

function PyodideBadge({ state, lang }: { state: PyodideState; lang: Lang }) {
  const messages: Record<PyodideState, L6> = {
    idle: { ja: '', en: '' },
    loading: { ja: '音楽環境を準備中…', en: 'Preparing the music environment…', es: 'Preparando el entorno…', ko: '음악 환경 준비 중…', pt: 'Preparando o ambiente…', de: 'Musikumgebung wird vorbereitet…' },
    ready: { ja: '✓ 準備完了', en: '✓ Ready', es: '✓ Listo', ko: '✓ 준비 완료', pt: '✓ Pronto', de: '✓ Bereit' },
    failed: { ja: '基本機能で動作中', en: 'Running with core features', es: 'Funciones básicas', ko: '기본 기능으로 동작', pt: 'Funções básicas', de: 'Mit Kernfunktionen' },
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
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
    }}>
      <div style={{ fontFamily: mono, fontSize: '0.65rem', color: INK_FAINT, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
        {flipped ? t({ ja: '答え', en: 'Answer', es: 'Respuesta', ko: '답', pt: 'Resposta', de: 'Antwort' }, lang) : t({ ja: '問い', en: 'Question', es: 'Pregunta', ko: '질문', pt: 'Pergunta', de: 'Frage' }, lang)}
      </div>
      <div style={{ wordBreak: 'keep-all' as const }}>
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
