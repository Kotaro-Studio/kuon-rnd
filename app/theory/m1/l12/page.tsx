'use client';

/**
 * /theory/m1/l12 — M1-12「三和音の基本形と転回形」
 * =========================================================
 * 三和音 (triad) は和声の構成単位。同じ 3 音でもバスを変えることで色が変わる。
 *
 * 設計原則 (CLAUDE.md §47, §48, §49):
 *   - 基本形・第 1 転回・第 2 転回を並列に提示
 *   - 各々を 4 声体 SATB 風に表示し聴ける
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
// 三和音の 3 つの転回形 (C 長調)
// SATB 4 声体: bass (B), tenor (T), alto (A), soprano (S)
// MIDI: 60 = C4 (middle C)
// ─────────────────────────────────────────────────────────────
type Position = 'root' | 'first' | 'second';

interface Voice4 {
  s: number;
  a: number;
  ten: number;
  b: number;
}

interface InversionDef {
  id: Position;
  name: L6;
  rn: string;
  figured: string;     // figured bass notation
  voicing: Voice4;
  bassNote: L6;        // どの音がバスにあるか
  description: L6;
  bachExample: L6;
}

const INVERSIONS: InversionDef[] = [
  {
    id: 'root',
    name: { ja: '基本形', en: 'Root Position', es: 'Estado fundamental', ko: '기본형', pt: 'Estado fundamental', de: 'Grundstellung' },
    rn: 'I',
    figured: '5/3',
    // C-E-G with bass C3, close-position triad on top
    voicing: { s: 72, a: 67, ten: 64, b: 48 },
    bassNote: { ja: 'バスに根音 (C・do)', en: 'Bass on root (C / do)', es: 'Bajo en la fundamental (do)', ko: '베이스에 으뜸음 (do)', pt: 'Baixo na fundamental (dó)', de: 'Bass auf Grundton (do)' },
    description: {
      ja: '最も安定した形。和音の根音 (do) がバスにあり、響きが「地に足の着いた」感じになる。終止形ではほぼ必ずこの形。',
      en: 'The most stable form. The root (do) is in the bass, giving the chord a grounded sound. Almost always used at cadences.',
      es: 'La forma más estable. La fundamental (do) en el bajo. Casi siempre se usa en las cadencias.',
      ko: '가장 안정된 형. 으뜸음 (do) 이 베이스에. 카덴츠에서 거의 항상 사용.',
      pt: 'A forma mais estável. A fundamental (dó) no baixo. Quase sempre usada em cadências.',
      de: 'Die stabilste Form. Der Grundton (do) im Bass. In Kadenzen fast immer.',
    },
    bachExample: {
      ja: 'Bach BWV 269 終結部 — V → I はどちらも基本形でなければならない (PAC の条件)。',
      en: 'Bach BWV 269 final cadence — both V and I must be in root position (PAC requirement).',
      es: 'Bach BWV 269, cadencia final — V y I en estado fundamental.',
      ko: '바흐 BWV 269 종결 — V·I 모두 기본형 필수.',
      pt: 'Bach BWV 269, cadência final — V e I em estado fundamental.',
      de: 'Bach BWV 269, Schlusskadenz — V und I beide in Grundstellung.',
    },
  },
  {
    id: 'first',
    name: { ja: '第 1 転回形', en: 'First Inversion', es: 'Primera inversión', ko: '제 1 전회', pt: 'Primeira inversão', de: 'Erste Umkehrung' },
    rn: 'I⁶',
    figured: '6 (6/3)',
    // E in bass, then G-C-E above
    voicing: { s: 76, a: 72, ten: 67, b: 52 },
    bassNote: { ja: 'バスに第 3 音 (E・mi)', en: 'Bass on 3rd (E / mi)', es: 'Bajo en la 3ª (mi)', ko: '베이스에 제 3 음 (mi)', pt: 'Baixo na 3ª (mi)', de: 'Bass auf 3. Stufe (mi)' },
    description: {
      ja: '第 3 音 (mi) がバスに来る。基本形より軽やかで流動的。Bach のコラールでは滑らかなベースラインを作るために頻用される。',
      en: 'The 3rd (mi) sits in the bass. Lighter and more flowing than root position. Bach used this constantly to create smooth bass lines in his chorales.',
      es: 'La 3ª (mi) en el bajo. Más ligero y fluido. Bach lo usaba constantemente para líneas de bajo suaves.',
      ko: '제 3 음 (mi) 이 베이스에. 기본형보다 가볍고 유동적. 바흐 코랄에서 매끄러운 베이스 라인 형성에 빈용.',
      pt: 'A 3ª (mi) no baixo. Mais leve e fluido. Bach o usava muito para linhas de baixo suaves.',
      de: 'Die 3. Stufe (mi) im Bass. Leichter und fließender. Bach nutzt es ständig für glatte Basslinien.',
    },
    bachExample: {
      ja: 'Bach のコラールで C → C⁶ → F の進行は典型。バスが C-E-F と滑らかに上行する。',
      en: 'In Bach\'s chorales, the progression C → C⁶ → F is typical. The bass moves smoothly C-E-F.',
      es: 'En los corales de Bach, la progresión C → C⁶ → F es típica. El bajo: C-E-F.',
      ko: '바흐 코랄에서 C → C⁶ → F 진행은 전형. 베이스는 C-E-F 로 부드럽게 상행.',
      pt: 'Nos corais de Bach, a progressão C → C⁶ → F é típica. Baixo: C-E-F.',
      de: 'In Bachs Chorälen ist C → C⁶ → F typisch. Bass: C-E-F glatt aufwärts.',
    },
  },
  {
    id: 'second',
    name: { ja: '第 2 転回形', en: 'Second Inversion', es: 'Segunda inversión', ko: '제 2 전회', pt: 'Segunda inversão', de: 'Zweite Umkehrung' },
    rn: 'I⁶₄',
    figured: '6/4',
    // G in bass, then C-E-G above
    voicing: { s: 79, a: 76, ten: 72, b: 55 },
    bassNote: { ja: 'バスに第 5 音 (G・sol)', en: 'Bass on 5th (G / sol)', es: 'Bajo en la 5ª (sol)', ko: '베이스에 제 5 음 (sol)', pt: 'Baixo na 5ª (sol)', de: 'Bass auf 5. Stufe (sol)' },
    description: {
      ja: '第 5 音 (sol) がバスに。最も不安定で、特殊な文脈でしか使えない。代表的用法はカデンツでの V を装飾する I⁶₄ → V → I (cadential 6/4)。',
      en: 'The 5th (sol) is in the bass. The most unstable form — used only in special contexts. The classic use is the cadential 6/4: I⁶₄ → V → I.',
      es: 'La 5ª (sol) en el bajo. La forma más inestable. El uso clásico es el 6/4 cadencial: I⁶₄ → V → I.',
      ko: '제 5 음 (sol) 이 베이스에. 가장 불안정한 형. 카덴셜 6/4 가 대표적: I⁶₄ → V → I.',
      pt: 'A 5ª (sol) no baixo. A forma mais instável. O uso clássico é o 6/4 cadencial: I⁶₄ → V → I.',
      de: 'Die 5. Stufe (sol) im Bass. Instabilste Form. Klassisch: Quartsextakkord I⁶₄ → V → I.',
    },
    bachExample: {
      ja: 'Mozart ピアノ協奏曲 K.488 終結部 — オーケストラ全奏前の I⁶₄ → V⁷ → I で「これから決定打が来る」と告げる装置。',
      en: 'Mozart Piano Concerto K.488 final cadence — the orchestral I⁶₄ → V⁷ → I before tutti, signaling "the decisive blow is coming."',
      es: 'Mozart KV 488, cadencia final — el orquestal I⁶₄ → V⁷ → I antes del tutti.',
      ko: '모차르트 피아노 협주곡 K.488 종결 — 관현악 전주 직전 I⁶₄ → V⁷ → I.',
      pt: 'Mozart K.488, cadência final — o orquestral I⁶₄ → V⁷ → I antes do tutti.',
      de: 'Mozart KV 488, Schlusskadenz — das orchestrale I⁶₄ → V⁷ → I vor dem Tutti.',
    },
  },
];

// ─────────────────────────────────────────────────────────────
// Web Audio: 三和音を 4 声で再生
// ─────────────────────────────────────────────────────────────
const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function playTriad(v: Voice4) {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.18;
  masterGain.connect(ctx.destination);

  const t0 = ctx.currentTime + 0.05;
  const dur = 1.6;

  [v.s, v.a, v.ten, v.b].forEach(midi => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const g = ctx.createGain();
    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.value = midiToFreq(midi);
    osc2.frequency.value = midiToFreq(midi) * 2;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.22, t0 + 0.025);
    g.gain.setValueAtTime(0.22, t0 + dur - 0.2);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc1.connect(g);
    osc2.connect(g);
    g.connect(masterGain);
    osc1.start(t0);
    osc2.start(t0);
    osc1.stop(t0 + dur);
    osc2.stop(t0 + dur);
  });
  setTimeout(() => ctx.close(), (dur + 0.2) * 1000);
}

// ─────────────────────────────────────────────────────────────
// Grand staff SVG (1 chord 用)
// ─────────────────────────────────────────────────────────────
const GS_W = 280;
const GS_H = 240;
const GS_GAP = 8;
const TREBLE_TOP = 30;
const BASS_TOP = 130;
const CHORD_X = 170;

function diatonicStep(midi: number): number {
  const octave = Math.floor(midi / 12);
  const pc = midi % 12;
  const map: Record<number, number> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
  const step = map[pc] !== undefined ? map[pc] : 0;
  return octave * 7 + step;
}

function midiToTrebleY(midi: number): number {
  const middleLine = TREBLE_TOP + 2 * GS_GAP;  // B4
  const stepFromB4 = diatonicStep(midi) - diatonicStep(71);
  return middleLine - stepFromB4 * (GS_GAP / 2);
}

function midiToBassY(midi: number): number {
  const middleLine = BASS_TOP + 2 * GS_GAP;  // D3
  const stepFromD3 = diatonicStep(midi) - diatonicStep(50);
  return middleLine - stepFromD3 * (GS_GAP / 2);
}

function GrandStaffTriad({ voicing, label }: { voicing: Voice4; label?: string }) {
  const trebleLines = [0, 1, 2, 3, 4].map(i => TREBLE_TOP + i * GS_GAP);
  const bassLines = [0, 1, 2, 3, 4].map(i => BASS_TOP + i * GS_GAP);

  const renderNote = (midi: number, isBass: boolean) => {
    const y = isBass ? midiToBassY(midi) : midiToTrebleY(midi);
    return (
      <ellipse
        key={`${midi}-${isBass}`}
        cx={CHORD_X} cy={y}
        rx={GS_GAP * 0.85} ry={GS_GAP * 0.6}
        fill={INK}
        transform={`rotate(-20 ${CHORD_X} ${y})`}
      />
    );
  };

  return (
    <svg viewBox={`0 0 ${GS_W} ${GS_H}`} style={{ width: '100%', maxWidth: 280, background: PAPER, borderRadius: 4 }}>
      {trebleLines.map((y, i) => <line key={`t${i}`} x1={40} x2={GS_W - 20} y1={y} y2={y} stroke={STAFF_LINE_COLOR} strokeWidth={1} />)}
      {bassLines.map((y, i) => <line key={`b${i}`} x1={40} x2={GS_W - 20} y1={y} y2={y} stroke={STAFF_LINE_COLOR} strokeWidth={1} />)}

      <text x={48} y={TREBLE_TOP + 2 * GS_GAP + 18} fontFamily="Bravura, serif" fontSize={GS_GAP * 4} fill={INK}>
        {String.fromCodePoint(0xE050)}
      </text>
      <text x={48} y={BASS_TOP + GS_GAP + 6} fontFamily="Bravura, serif" fontSize={GS_GAP * 4} fill={INK}>
        {String.fromCodePoint(0xE062)}
      </text>

      {renderNote(voicing.s, false)}
      {renderNote(voicing.a, false)}
      {renderNote(voicing.ten, true)}
      {renderNote(voicing.b, true)}

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
    q: { ja: '三和音とは何で構成されているか?', en: 'What constitutes a triad?', es: '¿Qué constituye una tríada?', ko: '삼화음의 구성은?', pt: 'O que constitui uma tríade?', de: 'Woraus besteht ein Dreiklang?' },
    a: { ja: '根音・第 3 音・第 5 音 — 3 度ずつ重なった 3 つの音。C 長調の I なら C-E-G。', en: 'Root, 3rd, and 5th — three notes stacked in thirds. The I chord in C major is C-E-G.', es: 'Fundamental, 3ª y 5ª — tres notas apiladas en terceras. El I en do mayor: C-E-G.', ko: '으뜸음·제 3 음·제 5 음 — 3 도씩 쌓인 세 음. C 장조 I 는 C-E-G.', pt: 'Fundamental, 3ª e 5ª — três notas em terças. O I em dó maior é C-E-G.', de: 'Grundton, Terz, Quinte — drei in Terzen geschichtete Töne. I-Stufe in C-Dur: C-E-G.' },
  },
  {
    q: { ja: '基本形・第 1 転回・第 2 転回はどう違うか?', en: 'How do root, first inversion, and second inversion differ?', es: '¿En qué difieren?', ko: '기본형·제1전회·제2전회의 차이?', pt: 'Como diferem?', de: 'Wie unterscheiden sie sich?' },
    a: { ja: '何の音がバスにあるかが違う。基本形 = 根音、第 1 転回 = 第 3 音、第 2 転回 = 第 5 音。上の音は同じでも、響きが大きく変わる。', en: 'The bass note differs. Root = root note, 1st = 3rd, 2nd = 5th. Even with the same upper notes, the sound character changes greatly.', es: 'Cambia la nota del bajo. Fundamental = fundamental, 1ª = 3ª, 2ª = 5ª.', ko: '베이스 음이 다름. 기본형 = 으뜸음, 제1전회 = 제3음, 제2전회 = 제5음.', pt: 'A nota do baixo difere. Fundamental = fundamental, 1ª = 3ª, 2ª = 5ª.', de: 'Der Bassnote unterscheidet sich. Grundst. = Grundton, 1. = Terz, 2. = Quinte.' },
  },
  {
    q: { ja: '第 1 転回形を表す数字付き低音 (figured bass) は?', en: 'What is the figured bass for first inversion?', es: '¿Cifrado de la primera inversión?', ko: '제 1 전회의 숫자 베이스는?', pt: 'O baixo cifrado da 1ª inversão?', de: 'Bezifferter Bass der 1. Umkehrung?' },
    a: { ja: '6 (省略形) または 6/3 (完全形)。ローマ数字記法では I⁶ と書く。', en: '6 (abbreviated) or 6/3 (full). In Roman numeral notation, written as I⁶.', es: '6 (abreviado) o 6/3 (completo). En cifras romanas: I⁶.', ko: '6 (약식) 또는 6/3 (완전형). 로마숫자: I⁶.', pt: '6 (abreviado) ou 6/3 (completo). Em números romanos: I⁶.', de: '6 (kurz) oder 6/3 (vollständig). Stufenzeichen: I⁶.' },
  },
  {
    q: { ja: '第 2 転回形 (I⁶₄) はなぜ「不安定」とされるか?', en: 'Why is second inversion (I⁶₄) considered "unstable"?', es: '¿Por qué la 2ª inversión es "inestable"?', ko: '제 2 전회 (I⁶₄) 가 불안정한 이유?', pt: 'Por que a 2ª inversão é "instável"?', de: 'Warum ist die 2. Umkehrung (I⁶₄) „instabil"?' },
    a: { ja: 'バスの第 5 音から見ると、上の音 (根音) は完全 4 度上にある。完全 4 度はバスに対して不協和的に扱われるため、解決を求める響きになる。', en: 'From the bass 5th, the root sits a perfect 4th above. Perfect 4ths against the bass are treated as dissonances, demanding resolution.', es: 'Desde la 5ª en el bajo, la fundamental está una 4ª justa arriba. La 4ª justa contra el bajo es disonancia.', ko: '베이스 제 5 음 위에 으뜸음이 완전 4 도. 베이스에 대한 완전 4 도는 불협화로 취급되어 해결을 요구.', pt: 'Da 5ª no baixo, a fundamental está uma 4ª justa acima. A 4ª justa contra o baixo é tratada como dissonância.', de: 'Vom 5er-Bass aus liegt der Grundton eine reine Quart höher. Die reine Quart gegen den Bass gilt als Dissonanz.' },
  },
  {
    q: { ja: 'Bach がベースラインを「滑らか」にするために好んで使った転回は?', en: 'Which inversion did Bach favor for smooth bass lines?', es: '¿Qué inversión prefirió Bach para líneas de bajo suaves?', ko: '바흐가 부드러운 베이스 라인을 위해 즐겨 쓴 전회는?', pt: 'Qual inversão Bach preferia para baixos suaves?', de: 'Welche Umkehrung bevorzugte Bach für glatte Bässe?' },
    a: { ja: '第 1 転回形 (6 度の和音)。コラールでは隣接和音同士のバスが 2 度進行で結ばれることが理想で、転回形がそれを可能にする。', en: 'First inversion (the 6 chord). In chorales, adjacent chords ideally connect through stepwise bass motion — inversions make this possible.', es: 'Primera inversión. En los corales, los bajos vecinos deben moverse por grados.', ko: '제 1 전회 (6 화음). 코랄에서 인접 화음의 베이스는 2 도 진행으로 연결되는 것이 이상적.', pt: 'Primeira inversão (acorde de 6ª). Em corais, baixos vizinhos devem mover-se por graus.', de: 'Erste Umkehrung (Sextakkord). In Chorälen verbinden sich Nachbarakkorde idealerweise schrittweise.' },
  },
];

// ─────────────────────────────────────────────────────────────
// メイン
// ─────────────────────────────────────────────────────────────
type PracticeMode = 'gallery' | 'quiz';
type PyodideState = 'idle' | 'loading' | 'ready' | 'failed';

export default function LessonM1L12() {
  const { lang } = useLang();
  const [mode, setMode] = useState<PracticeMode>('gallery');
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
          M1 · LESSON 12
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(1.85rem, 4.5vw, 2.85rem)',
          fontWeight: 400, letterSpacing: '0.04em', lineHeight: 1.4, margin: 0, color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '三和音の基本形と転回形',
            en: 'Triads in Root Position and Inversions',
            es: 'La tríada y sus inversiones',
            ko: '삼화음의 기본형과 전회',
            pt: 'A tríade e suas inversões',
            de: 'Dreiklänge in Grundstellung und Umkehrungen',
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
          <p style={{ margin: '0 0 1.6rem 0' }}>
            {t({
              ja: '三和音 (triad) は西洋和声の最小単位です。3 度ずつ重ねた 3 つの音 — 根音・第 3 音・第 5 音 — からなる響きの分子。C 長調なら C-E-G、F 長調なら F-A-C。これが「I の和音」と呼ばれます。',
              en: 'The triad is the smallest unit of Western harmony — three notes stacked in thirds: root, third, fifth. In C major: C-E-G. In F major: F-A-C. This is what we call "the I chord."',
              es: 'La tríada es la unidad mínima de la armonía occidental — tres notas en terceras: fundamental, 3ª, 5ª. En do mayor: C-E-G.',
              ko: '삼화음은 서양 화성의 최소 단위. 3 도씩 쌓인 세 음 — 으뜸음·제 3 음·제 5 음. C 장조에서 C-E-G.',
              pt: 'A tríade é a menor unidade da harmonia ocidental — três notas em terças: fundamental, 3ª, 5ª. Em dó maior: C-E-G.',
              de: 'Der Dreiklang ist die kleinste Einheit der westlichen Harmonik — drei in Terzen geschichtete Töne. In C-Dur: C-E-G.',
            }, lang)}
          </p>
          <p style={{ margin: '0 0 1.6rem 0' }}>
            {t({
              ja: 'しかし同じ 3 音でも、どの音をバス (一番下) に置くかで響きが大きく変わります。基本形 (根音がバス)、第 1 転回 (第 3 音がバス)、第 2 転回 (第 5 音がバス)。3 つの異なる「色」が、同じ和音から立ち上がります。',
              en: 'Yet the same three notes sound very different depending on which note is in the bass. Root position (bass on root), first inversion (bass on 3rd), second inversion (bass on 5th). Three different colors emerge from the same chord.',
              es: 'Pero las mismas tres notas suenan distintas según qué nota esté en el bajo. Estado fundamental, 1ª inversión, 2ª inversión — tres colores del mismo acorde.',
              ko: '하지만 같은 세 음도 어느 음이 베이스에 오는지에 따라 울림이 크게 달라집니다. 기본형·제 1 전회·제 2 전회 — 세 가지 색.',
              pt: 'Mas as mesmas três notas soam diferente dependendo do baixo. Estado fundamental, 1ª inversão, 2ª inversão — três cores do mesmo acorde.',
              de: 'Doch dieselben drei Töne klingen anders, je nachdem, welcher im Bass steht. Grundstellung, erste, zweite Umkehrung — drei Farben aus demselben Akkord.',
            }, lang)}
          </p>
          <p style={{ margin: 0 }}>
            {t({
              ja: 'バッハがコラールを書くとき、彼はベースラインの美しさのために第 1 転回を頻繁に選びました。基本形ばかり並べるとバスが跳躍ばかりになる — そこで転回形を挟むことで、バスが歌うように 2 度進行で繋がっていく。「正解は一つ」ではなく、「文脈に最も生きる選択」を、彼は毎瞬選んでいたのです。',
              en: 'When Bach wrote chorales, he chose first inversions constantly for the sake of bass-line beauty. Stacking only root positions makes the bass leap awkwardly — inversions let the bass sing through stepwise motion. There was no "single right answer." He chose, in every moment, what was most alive in context.',
              es: 'Cuando Bach escribía corales, elegía constantemente la 1ª inversión por la belleza del bajo. Solo fundamentales hacen saltar al bajo — las inversiones lo hacen cantar.',
              ko: '바흐가 코랄을 쓸 때 그는 베이스 라인의 아름다움을 위해 제 1 전회를 즐겨 썼습니다. 기본형만 늘어놓으면 베이스가 도약뿐 — 전회를 넣으면 노래합니다. "정답은 하나"가 아니라 "문맥에 가장 살아있는 선택"을 매 순간 선택했습니다.',
              pt: 'Quando Bach escrevia corais, escolhia constantemente a 1ª inversão pela beleza do baixo. Só fundamentais fazem o baixo saltar — as inversões o fazem cantar.',
              de: 'Wenn Bach Choräle schrieb, wählte er ständig erste Umkehrungen wegen der Bassschönheit. Nur Grundstellungen lassen den Bass springen — Umkehrungen lassen ihn singen.',
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
          <LayerLabel num="II" name={t({ ja: 'Living Score (3 つの転回を聴き比べる)', en: 'Living Score (compare three inversions)', es: 'Living Score (comparar las tres)', ko: 'Living Score (세 전회 비교)', pt: 'Living Score (comparar as três)', de: 'Living Score (drei Umkehrungen vergleichen)' }, lang)} />
          <PyodideBadge state={pyodideState} lang={lang} />

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'clamp(1.4rem, 3vw, 2rem)', flexWrap: 'wrap' }}>
            <ModeButton active={mode === 'gallery'} onClick={() => setMode('gallery')}
              label={t({ ja: '3 つを並べて聴く', en: 'Compare the three', es: 'Comparar las tres', ko: '세 가지 비교', pt: 'Comparar as três', de: 'Drei vergleichen' }, lang)} />
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
            ja: '転回形を学んだら、実際に書いて確かめたくなるはずです。Kuon の和声ツール群が、あなたの 4 声体を即座にチェックします。',
            en: 'Once you grasp inversions, you will want to write them yourself and verify. Kuon\'s harmony tools check your four-voice writing instantly.',
            es: 'Una vez que entiendas las inversiones, querrás escribirlas tú mismo.',
            ko: '전회형을 배웠으면 직접 써 보고 싶어집니다.',
            pt: 'Depois de aprender, você vai querer escrever as suas próprias.',
            de: 'Wenn Sie Umkehrungen verstanden haben, wollen Sie sie selbst schreiben.',
          }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.9rem' }}>
          <RelatedTool href="/harmony" title="KUON HARMONY" desc={t({
            ja: 'SATB 4 声体の和音をリアルタイムでチェック。連続 5/8 度・声部進行違反を即座に検出。',
            en: 'Real-time SATB checker. Catches parallel 5ths/8ves and voice-leading errors as you write.',
            es: 'Comprobador SATB en tiempo real. Detecta paralelas y errores de conducción.',
            ko: 'SATB 실시간 체커. 연속 5/8도·성부 진행 위반 즉시 검출.',
            pt: 'Verificador SATB em tempo real. Detecta paralelas e erros de condução.',
            de: 'Echtzeit-SATB-Checker. Quint/Oktavparallelen sofort erkannt.',
          }, lang)} />
          <RelatedTool href="/classical-lp" title="KUON CLASSICAL ANALYSIS" desc={t({
            ja: 'Bach コラール 371 曲を含む 600+ 曲のローマ数字解析。転回形も自動表示。',
            en: 'Roman numeral analysis of 600+ pieces including all 371 Bach chorales. Inversions auto-detected.',
            es: 'Análisis con números romanos de 600+ obras. Inversiones automáticas.',
            ko: '바흐 코랄 371 곡 포함 600+ 곡의 로마 숫자 분석.',
            pt: 'Análise por números romanos de 600+ obras. Inversões automáticas.',
            de: 'Stufenanalyse von 600+ Werken inkl. aller 371 Bach-Choräle.',
          }, lang)} />
          <RelatedTool href="/chord-quiz-lp" title="KUON CHORD QUIZ" desc={t({
            ja: '聴音による和音識別訓練。基本形・転回形を耳で見分ける反射神経を鍛える。',
            en: 'Ear-based chord identification drills. Build the reflex to distinguish inversions by ear.',
            es: 'Identificación auditiva de acordes. Reflejo para distinguir inversiones.',
            ko: '청음 기반 화음 식별 훈련. 전회형을 귀로 구분하는 반사신경.',
            pt: 'Identificação auditiva de acordes. Distinguir inversões de ouvido.',
            de: 'Akkord-Erkennung nach Gehör. Reflex für Umkehrungen.',
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
            {t({ ja: 'M1 楽典基礎 · Lesson 12', en: 'M1 Fundamentals · Lesson 12', es: 'M1 Fundamentos · Lección 12', ko: 'M1 악전 기초 · 레슨 12', pt: 'M1 Fundamentos · Lição 12', de: 'M1 Grundlagen · Lektion 12' }, lang)}
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
// GalleryMode — 3 転回を並列表示
// ─────────────────────────────────────────────────────────────
function GalleryMode({ lang }: { lang: Lang }) {
  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85 }}>
        {t({
          ja: '同じ C 長調の I 和音を、3 つの異なる形で並べました。各カードの再生ボタンを押して聴き比べてください。バスの音が違うだけで、響きの「色」が変わるのを耳で確かめましょう。',
          en: 'The same C major I chord, presented in three different forms. Press play on each card and compare. Notice how only the bass note changes — yet the entire "color" of the chord shifts.',
          es: 'El mismo I de do mayor en tres formas. Toca y compara: solo cambia el bajo, pero todo el color cambia.',
          ko: '같은 C 장조 I 화음을 세 가지 형으로 나란히. 각 카드를 재생하고 비교해 보세요. 베이스만 바뀌었는데 색이 달라집니다.',
          pt: 'O mesmo I de dó maior em três formas. Toque e compare: só o baixo muda, mas a cor inteira muda.',
          de: 'Derselbe C-Dur-I-Akkord in drei Formen. Drücken Sie Abspielen und vergleichen Sie. Nur der Bass ändert sich — und doch verändert sich die ganze Farbe.',
        }, lang)}
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
        gap: '1.2rem',
      }}>
        {INVERSIONS.map(inv => (
          <div key={inv.id} style={{
            background: PAPER, border: `1px solid ${STAFF_LINE_COLOR}`, borderRadius: 4,
            padding: 'clamp(1.4rem, 2.5vw, 1.8rem)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = INK; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = STAFF_LINE_COLOR; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
              <h3 style={{
                fontFamily: serif, fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
                fontWeight: 500, color: INK, margin: 0, letterSpacing: '0.03em', lineHeight: 1.4,
                wordBreak: 'keep-all' as const,
              }}>
                {t(inv.name, lang)}
              </h3>
              <span style={{ fontFamily: mono, fontSize: '0.78rem', color: ACCENT_GOLD, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                {inv.rn}
              </span>
            </div>
            <div style={{ fontFamily: mono, fontSize: '0.66rem', color: INK_FAINT, letterSpacing: '0.06em', marginBottom: '1rem' }}>
              figured: {inv.figured}
            </div>
            <GrandStaffTriad voicing={inv.voicing} label={inv.rn} />
            <div style={{ fontFamily: serif, fontSize: '0.85rem', color: INK_SOFT, fontStyle: 'italic', margin: '0.7rem 0 0.7rem 0', letterSpacing: '0.02em' }}>
              {t(inv.bassNote, lang)}
            </div>
            <p style={{ fontFamily: serif, fontSize: '0.92rem', color: INK_SOFT, lineHeight: 1.85, margin: '0 0 0.9rem 0', letterSpacing: '0.02em', wordBreak: 'keep-all' as const }}>
              {t(inv.description, lang)}
            </p>
            <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.85rem', color: INK_FAINT, lineHeight: 1.8, margin: '0 0 1.2rem 0', letterSpacing: '0.02em', wordBreak: 'keep-all' as const }}>
              {t(inv.bachExample, lang)}
            </p>
            <button onClick={() => playTriad(inv.voicing)} style={{
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
  const [currentIdx, setCurrentIdx] = useState<number>(() => Math.floor(Math.random() * INVERSIONS.length));
  const [picked, setPicked] = useState<Position | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [hasPlayed, setHasPlayed] = useState(false);

  const current = INVERSIONS[currentIdx];

  const playCurrent = () => {
    playTriad(current.voicing);
    setHasPlayed(true);
  };

  const next = useCallback(() => {
    let idx = Math.floor(Math.random() * INVERSIONS.length);
    if (idx === currentIdx) idx = (idx + 1) % INVERSIONS.length;
    setCurrentIdx(idx);
    setPicked(null);
    setFeedback('');
    setHasPlayed(false);
  }, [currentIdx]);

  const onPick = (id: Position) => {
    setPicked(id);
    if (id === current.id) {
      setFeedback(t({
        ja: `これは ${t(current.name, lang)} (${current.rn})。${t(current.bassNote, lang)}。あなたの耳が捉えたとおりです。`,
        en: `This is ${t(current.name, lang)} (${current.rn}). ${t(current.bassNote, lang)}. Your ear caught it.`,
        es: `Es ${t(current.name, lang)} (${current.rn}). ${t(current.bassNote, lang)}. Tu oído lo captó.`,
        ko: `이것은 ${t(current.name, lang)} (${current.rn}). ${t(current.bassNote, lang)}. 당신의 귀가 잘 잡았습니다.`,
        pt: `Esta é ${t(current.name, lang)} (${current.rn}). ${t(current.bassNote, lang)}. Seu ouvido captou.`,
        de: `Das ist ${t(current.name, lang)} (${current.rn}). ${t(current.bassNote, lang)}. Ihr Ohr hat ihn erkannt.`,
      }, lang));
    } else {
      const chosen = INVERSIONS.find(i => i.id === id)!;
      setFeedback(t({
        ja: `定番の答えは ${t(current.name, lang)} (${current.rn}) でした。あなたの選んだ ${t(chosen.name, lang)} は別の文脈ではこちらが選ばれることもあります。バスの違いを聴き分ける耳は、訓練で確実に鋭くなります。両方とも音楽的に意味のある選択です。`,
        en: `The textbook answer is ${t(current.name, lang)} (${current.rn}). Your choice — ${t(chosen.name, lang)} — is also valid in different contexts. The ear that distinguishes bass positions sharpens with practice. Both are musically meaningful.`,
        es: `La respuesta convencional es ${t(current.name, lang)} (${current.rn}). Tu elección, ${t(chosen.name, lang)}, también es válida en otros contextos.`,
        ko: `정석 답은 ${t(current.name, lang)} (${current.rn}) 였습니다. 당신이 택한 ${t(chosen.name, lang)} 도 다른 문맥에서는 옳을 수 있습니다.`,
        pt: `A resposta convencional é ${t(current.name, lang)} (${current.rn}). Sua escolha, ${t(chosen.name, lang)}, também é válida em outros contextos.`,
        de: `Die Lehrbuchantwort ist ${t(current.name, lang)} (${current.rn}). Ihre Wahl ${t(chosen.name, lang)} ist in anderem Kontext ebenfalls richtig.`,
      }, lang));
    }
  };

  return (
    <div>
      <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85 }}>
        {t({
          ja: '再生ボタンを押し、聴こえた和音の転回形を選んでください。バスの音 (一番低い音) に注目するのがコツです。',
          en: 'Play the chord, then identify which inversion you heard. Listen especially to the bass — the lowest note.',
          es: 'Toca el acorde e identifica la inversión. Escucha el bajo.',
          ko: '재생하고 들리는 화음의 전회를 선택. 베이스에 집중하세요.',
          pt: 'Toque e identifique a inversão. Ouça o baixo.',
          de: 'Spielen Sie ab und erkennen Sie die Umkehrung. Hören Sie auf den Bass.',
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
            : t({ ja: '♪ 和音を再生', en: '♪ Play the chord', es: '♪ Reproducir', ko: '♪ 재생', pt: '♪ Tocar', de: '♪ Abspielen' }, lang)}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
        gap: '0.6rem',
      }}>
        {INVERSIONS.map(inv => {
          const isPickedHere = picked === inv.id;
          return (
            <button key={inv.id}
              onClick={() => onPick(inv.id)}
              disabled={picked !== null || !hasPlayed}
              style={{
                fontFamily: serif,
                fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
                background: isPickedHere ? INK : '#fff',
                color: isPickedHere ? PAPER : INK,
                border: `1px solid ${isPickedHere ? INK : STAFF_LINE_COLOR}`,
                borderRadius: 4, padding: '1rem 0.8rem',
                cursor: picked !== null || !hasPlayed ? 'default' : 'pointer',
                letterSpacing: '0.04em',
                opacity: !hasPlayed ? 0.4 : (picked !== null && !isPickedHere ? 0.55 : 1),
                wordBreak: 'keep-all' as const,
              }}
            >
              {t(inv.name, lang)}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <GrandStaffTriad voicing={current.voicing} label={current.rn} />
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
          fontFamily: serif, fontSize: 'clamp(0.92rem, 1.6vw, 1.05rem)',
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
            {t({ ja: '次の和音 →', en: 'Next chord →', es: 'Siguiente →', ko: '다음 →', pt: 'Próximo →', de: 'Nächster →' }, lang)}
          </button>
        </div>
      )}
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
      <span style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>{name}</span>
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
