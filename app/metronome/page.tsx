'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { RegistrationNudge, useRegistrationNudge } from '@/components/RegistrationNudge';

// ============================================================================
// TYPES
// ============================================================================

type L5 = Record<Lang, string>;

interface Preset {
  name: string;
  bpm: number;
  tsNum: number;
  tsDen: number;
  subdivision: number;
  swing: number;
  grouping: number[];
  accents: number[];
}

interface LogEntry {
  date: string;
  min: number;
  bpm: number;
  ts: string;
}

interface ModulationStep {
  tsNum: number;
  tsDen: number;
  bars: number;
  ratio: [number, number]; // [old subdivision count, new beat count] e.g. [3,2] = triplet = new beat
  label: string;
}

interface ClavePattern {
  id: string;
  name: L5;
  hits: number[]; // positions out of `length` subdivisions
  length: number; // total subdivisions per cycle
  bars: number;   // how many bars the pattern spans
}

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#8b5cf6';
const ACCENT_LIGHT = '#ede9fe';
const JAZZ_AMBER = '#d97706';
const JAZZ_AMBER_LIGHT = '#fef3c7';

// ============================================================================
// TIME SIGNATURES & GROUPINGS
// ============================================================================

interface TSig { label: string; num: number; den: number; group: number[]; }

const TS_LIST: TSig[] = [
  { label: '2/4', num: 2, den: 4, group: [2] },
  { label: '3/4', num: 3, den: 4, group: [3] },
  { label: '4/4', num: 4, den: 4, group: [4] },
  { label: '5/4', num: 5, den: 4, group: [2, 3] },
  { label: '6/4', num: 6, den: 4, group: [3, 3] },
  { label: '7/4', num: 7, den: 4, group: [2, 2, 3] },
  { label: '3/8', num: 3, den: 8, group: [3] },
  { label: '5/8', num: 5, den: 8, group: [2, 3] },
  { label: '6/8', num: 6, den: 8, group: [3, 3] },
  { label: '7/8', num: 7, den: 8, group: [2, 2, 3] },
  { label: '9/8', num: 9, den: 8, group: [3, 3, 3] },
  { label: '12/8', num: 12, den: 8, group: [3, 3, 3, 3] },
];

const ALT_GROUPS: Record<number, number[][]> = {
  5: [[2, 3], [3, 2]],
  7: [[2, 2, 3], [2, 3, 2], [3, 2, 2]],
  8: [[3, 3, 2], [3, 2, 3], [2, 3, 3]],
  9: [[3, 3, 3], [2, 2, 2, 3]],
  10: [[3, 3, 2, 2], [2, 3, 2, 3]],
  11: [[3, 3, 3, 2], [3, 3, 2, 3], [2, 3, 3, 3]],
  12: [[3, 3, 3, 3], [4, 4, 4]],
};

function genAccents(num: number, grouping: number[]): number[] {
  const a = new Array(num).fill(1);
  let pos = 0;
  grouping.forEach((g, i) => { a[pos] = i === 0 ? 3 : 2; pos += g; });
  return a;
}

function groupStarts(grouping: number[]): Set<number> {
  const s = new Set<number>();
  let pos = 0;
  for (const g of grouping) { s.add(pos); pos += g; }
  return s;
}

// ============================================================================
// METRIC MODULATION PRESETS
// ============================================================================

interface ModPreset {
  id: string;
  name: L5;
  desc: L5;
  steps: { tsLabel: string; bars: number; bpmMultiplier: number; }[];
}

const MOD_PRESETS: ModPreset[] = [
  {
    id: 'q-eq-dotq',
    name: {
      ja: '♩ = ♩.（テンポ × 2/3）',
      en: '♩ = ♩. (Tempo × 2/3)',
      ko: '♩ = ♩. (템포 × 2/3)',
      pt: '♩ = ♩. (Tempo × 2/3)',
      es: '♩ = ♩. (Tempo × 2/3)',
    },
    desc: {
      ja: '4/4の付点四分音符が新しい四分音符に。BPM 120 → 80。ジャズ・現代音楽の定番。',
      en: 'Dotted quarter in 4/4 becomes the new quarter. BPM 120 → 80. Jazz & modern music staple.',
      ko: '4/4의 점4분음표가 새로운 4분음표로. BPM 120 → 80. 재즈·현대음악의 정석.',
      pt: 'Semínima pontuada em 4/4 vira a nova semínima. BPM 120 → 80.',
      es: 'Negra con puntillo en 4/4 se convierte en la nueva negra. BPM 120 → 80.',
    },
    steps: [
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 1 },
      { tsLabel: '3/4', bars: 4, bpmMultiplier: 2 / 3 },
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 1 },
    ],
  },
  {
    id: 'triplet-mod',
    name: {
      ja: '三連符♩ = 新♩（テンポ × 3/2）',
      en: 'Triplet ♩ = New ♩ (Tempo × 3/2)',
      ko: '삼연음 ♩ = 새 ♩ (템포 × 3/2)',
      pt: 'Tercina ♩ = Nova ♩ (Tempo × 3/2)',
      es: 'Tresillo ♩ = Nueva ♩ (Tempo × 3/2)',
    },
    desc: {
      ja: '三連符の1つが新しい拍になる。BPM 120 → 180。アップテンポへの加速モジュレーション。',
      en: 'One triplet beat becomes the new pulse. BPM 120 → 180. Accelerating modulation.',
      ko: '삼연음의 하나가 새로운 박이 됩니다. BPM 120 → 180. 가속 모듈레이션.',
      pt: 'Uma tercina vira o novo pulso. BPM 120 → 180. Modulação acelerante.',
      es: 'Un tresillo se convierte en el nuevo pulso. BPM 120 → 180. Modulación acelerante.',
    },
    steps: [
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 1 },
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 3 / 2 },
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 1 },
    ],
  },
  {
    id: 'q-eq-e',
    name: {
      ja: '♩ = ♪（テンポ × 2）',
      en: '♩ = ♪ (Tempo × 2)',
      ko: '♩ = ♪ (템포 × 2)',
      pt: '♩ = ♪ (Tempo × 2)',
      es: '♩ = ♪ (Tempo × 2)',
    },
    desc: {
      ja: '八分音符が新しい四分音符に。テンポが2倍に跳ね上がる。ドラマチックなダブルタイム。',
      en: 'Eighth note becomes the new quarter. Tempo doubles. Dramatic double-time.',
      ko: '8분음표가 새로운 4분음표로. 템포 2배. 드라마틱한 더블 타임.',
      pt: 'Colcheia vira a nova semínima. Tempo dobra. Double-time dramático.',
      es: 'Corchea se convierte en la nueva negra. Tempo se duplica. Double-time dramático.',
    },
    steps: [
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 1 },
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 2 },
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 1 },
    ],
  },
  {
    id: '5-over-4',
    name: {
      ja: '5連符♩ = 新♩（テンポ × 5/4）',
      en: 'Quintuplet ♩ = New ♩ (× 5/4)',
      ko: '5연음 ♩ = 새 ♩ (× 5/4)',
      pt: 'Quintina ♩ = Nova ♩ (× 5/4)',
      es: 'Quintillo ♩ = Nueva ♩ (× 5/4)',
    },
    desc: {
      ja: '五連符の1つが新しい拍。テンポが5/4倍に。微妙な加速の上級モジュレーション。',
      en: 'One quintuplet becomes the new pulse. Advanced subtle acceleration.',
      ko: '5연음의 하나가 새로운 박. 미묘한 가속의 상급 모듈레이션.',
      pt: 'Uma quintina vira o novo pulso. Aceleração sutil avançada.',
      es: 'Un quintillo se convierte en el nuevo pulso. Aceleración sutil avanzada.',
    },
    steps: [
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 1 },
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 5 / 4 },
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 1 },
    ],
  },
  {
    id: '4-to-3-to-4',
    name: {
      ja: '4/4 → 3/4 → 4/4 チェーン',
      en: '4/4 → 3/4 → 4/4 Chain',
      ko: '4/4 → 3/4 → 4/4 체인',
      pt: '4/4 → 3/4 → 4/4 Cadeia',
      es: '4/4 → 3/4 → 4/4 Cadena',
    },
    desc: {
      ja: '♩. = ♩ で3/4に移行し、再び♩ = ♩.で4/4に復帰。完全な往復モジュレーション。',
      en: '♩. = ♩ into 3/4, then ♩ = ♩. back to 4/4. Complete round-trip modulation.',
      ko: '♩. = ♩로 3/4에 이행, 다시 ♩ = ♩.로 4/4에 복귀. 완전한 왕복 모듈레이션.',
      pt: '♩. = ♩ para 3/4, depois ♩ = ♩. volta para 4/4. Modulação ida e volta.',
      es: '♩. = ♩ a 3/4, luego ♩ = ♩. de vuelta a 4/4. Modulación de ida y vuelta.',
    },
    steps: [
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 1 },
      { tsLabel: '3/4', bars: 4, bpmMultiplier: 2 / 3 },
      { tsLabel: '4/4', bars: 4, bpmMultiplier: 1 },
      { tsLabel: '3/4', bars: 4, bpmMultiplier: 2 / 3 },
    ],
  },
];

// ============================================================================
// CLAVE / RHYTHMIC PATTERNS
// ============================================================================

const CLAVE_PATTERNS: ClavePattern[] = [
  {
    id: 'son-32', name: { ja: 'ソンクラーベ 3-2', en: 'Son Clave 3-2', ko: '손 클라베 3-2', pt: 'Clave de Son 3-2', es: 'Clave de Son 3-2' },
    hits: [0, 3, 7, 8, 12], length: 16, bars: 2,
  },
  {
    id: 'son-23', name: { ja: 'ソンクラーベ 2-3', en: 'Son Clave 2-3', ko: '손 클라베 2-3', pt: 'Clave de Son 2-3', es: 'Clave de Son 2-3' },
    hits: [0, 4, 8, 11, 15], length: 16, bars: 2, // Rotated version
  },
  {
    id: 'rumba-32', name: { ja: 'ルンバクラーベ 3-2', en: 'Rumba Clave 3-2', ko: '룸바 클라베 3-2', pt: 'Clave de Rumba 3-2', es: 'Clave de Rumba 3-2' },
    hits: [0, 3, 7, 9, 12], length: 16, bars: 2,
  },
  {
    id: 'bossa', name: { ja: 'ボサノバ', en: 'Bossa Nova', ko: '보사노바', pt: 'Bossa Nova', es: 'Bossa Nova' },
    hits: [0, 3, 6, 8, 10, 12, 15], length: 16, bars: 2,
  },
  {
    id: 'samba', name: { ja: 'サンバ', en: 'Samba', ko: '삼바', pt: 'Samba', es: 'Samba' },
    hits: [0, 2, 3, 5, 8, 10, 11, 13], length: 16, bars: 2,
  },
  {
    id: 'jazz-ride', name: { ja: 'ジャズライド', en: 'Jazz Ride', ko: '재즈 라이드', pt: 'Ride de Jazz', es: 'Ride de Jazz' },
    hits: [0, 2, 4, 5, 8, 10, 12, 13], length: 16, bars: 2, // spang-a-lang
  },
  {
    id: 'tresillo', name: { ja: 'トレシージョ', en: 'Tresillo', ko: '트레시요', pt: 'Tresillo', es: 'Tresillo' },
    hits: [0, 3, 6], length: 8, bars: 1,
  },
  {
    id: 'cascara', name: { ja: 'カスカラ', en: 'Cascara', ko: '카스카라', pt: 'Cascara', es: 'Cascara' },
    hits: [0, 2, 3, 5, 8, 9, 11, 12], length: 16, bars: 2,
  },
];

// ============================================================================
// OVER-THE-BARLINE (OTB) PRESETS
// ============================================================================

interface OTBPreset {
  id: string;
  name: L5;
  desc: L5;
  accentEvery: number; // accent every N beats across barlines
  tsNum: number;
}

const OTB_PRESETS: OTBPreset[] = [
  {
    id: 'otb-3-over-4', accentEvery: 3, tsNum: 4,
    name: { ja: '3 over 4/4', en: '3 over 4/4', ko: '3 over 4/4', pt: '3 sobre 4/4', es: '3 sobre 4/4' },
    desc: {
      ja: '4/4拍子で3拍ごとにアクセント。4小節で一巡。ジャズ即興のフレージング基盤。',
      en: 'Accent every 3 beats in 4/4. Completes in 4 bars. Foundation of jazz improvisation phrasing.',
      ko: '4/4에서 3박마다 악센트. 4마디로 한 바퀴. 재즈 즉흥의 프레이징 기반.',
      pt: 'Acento a cada 3 batidas em 4/4. Completa em 4 compassos.',
      es: 'Acento cada 3 pulsos en 4/4. Completa en 4 compases.',
    },
  },
  {
    id: 'otb-5-over-4', accentEvery: 5, tsNum: 4,
    name: { ja: '5 over 4/4', en: '5 over 4/4', ko: '5 over 4/4', pt: '5 sobre 4/4', es: '5 sobre 4/4' },
    desc: {
      ja: '4/4拍子で5拍ごとにアクセント。5小節で一巡。高度な拍節ずらし訓練。',
      en: 'Accent every 5 beats in 4/4. Completes in 5 bars. Advanced rhythmic displacement.',
      ko: '4/4에서 5박마다 악센트. 5마디로 한 바퀴. 고급 박절 어긋남 훈련.',
      pt: 'Acento a cada 5 batidas em 4/4. Completa em 5 compassos.',
      es: 'Acento cada 5 pulsos en 4/4. Completa en 5 compases.',
    },
  },
  {
    id: 'otb-3-over-3', accentEvery: 4, tsNum: 3,
    name: { ja: '4 over 3/4', en: '4 over 3/4', ko: '4 over 3/4', pt: '4 sobre 3/4', es: '4 sobre 3/4' },
    desc: {
      ja: '3/4拍子で4拍ごとにアクセント。3小節で一巡。ワルツの中に4拍子の感覚を重ねる。',
      en: 'Accent every 4 beats in 3/4. Completes in 3 bars. Overlay 4-feel on a waltz.',
      ko: '3/4에서 4박마다 악센트. 3마디로 한 바퀴. 왈츠 위에 4박 감각을 겹침.',
      pt: 'Acento a cada 4 batidas em 3/4. Completa em 3 compassos.',
      es: 'Acento cada 4 pulsos en 3/4. Completa en 3 compases.',
    },
  },
  {
    id: 'otb-7-over-4', accentEvery: 7, tsNum: 4,
    name: { ja: '7 over 4/4', en: '7 over 4/4', ko: '7 over 4/4', pt: '7 sobre 4/4', es: '7 sobre 4/4' },
    desc: {
      ja: '4/4拍子で7拍ごとにアクセント。7小節で一巡。Coltraneの「Countdown」的な浮遊感。',
      en: 'Accent every 7 beats in 4/4. Completes in 7 bars. Coltrane "Countdown" float.',
      ko: '4/4에서 7박마다 악센트. 7마디로 한 바퀴. Coltrane "Countdown"적 부유감.',
      pt: 'Acento a cada 7 batidas em 4/4. Completa em 7 compassos.',
      es: 'Acento cada 7 pulsos en 4/4. Completa en 7 compases.',
    },
  },
];

// ============================================================================
// AUDIO HELPERS
// ============================================================================

const LOOKAHEAD = 0.1;
const SCHED_MS = 25;

function playClick(ctx: AudioContext, time: number, level: number) {
  if (level === 0) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  const freqs = [0, 800, 900, 1000];
  const vols = [0, 0.25, 0.45, 0.7];
  const decs = [0, 0.03, 0.04, 0.05];
  osc.frequency.value = freqs[level];
  osc.type = 'sine';
  g.gain.setValueAtTime(vols[level], time);
  g.gain.exponentialRampToValueAtTime(0.001, time + decs[level]);
  osc.start(time); osc.stop(time + 0.1);
}

function playSubClick(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.frequency.value = 660; osc.type = 'sine';
  g.gain.setValueAtTime(0.12, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
  osc.start(time); osc.stop(time + 0.06);
}

function playPolyClick(ctx: AudioContext, time: number, accent: boolean) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.frequency.value = accent ? 1200 : 1100; osc.type = 'triangle';
  g.gain.setValueAtTime(accent ? 0.45 : 0.3, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  osc.start(time); osc.stop(time + 0.08);
}

function playClaveHit(ctx: AudioContext, time: number, isAccent: boolean) {
  // Wood block-style sound for clave
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  const f = ctx.createBiquadFilter();
  osc.connect(f); f.connect(g); g.connect(ctx.destination);
  osc.frequency.value = isAccent ? 2400 : 2000;
  osc.type = 'square';
  f.type = 'bandpass'; f.frequency.value = isAccent ? 2400 : 2000; f.Q.value = 8;
  g.gain.setValueAtTime(isAccent ? 0.35 : 0.25, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
  osc.start(time); osc.stop(time + 0.06);
}

function playOTBAccent(ctx: AudioContext, time: number) {
  // Distinctive tone for over-the-barline accent
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.frequency.value = 1400; osc.type = 'triangle';
  g.gain.setValueAtTime(0.55, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
  osc.start(time); osc.stop(time + 0.1);
}

function playDisplaceTick(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.frequency.value = 1800; osc.type = 'sine';
  g.gain.setValueAtTime(0.4, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  osc.start(time); osc.stop(time + 0.07);
}

// ============================================================================
// STORAGE
// ============================================================================

const PRESET_KEY = 'kuon-metro-presets';
const LOG_KEY = 'kuon-metro-log';

function loadPresets(): Preset[] { try { return JSON.parse(localStorage.getItem(PRESET_KEY) || '[]'); } catch { return []; } }
function savePresets(p: Preset[]) { localStorage.setItem(PRESET_KEY, JSON.stringify(p)); }
function loadLog(): LogEntry[] { try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch { return []; } }
function saveLog(l: LogEntry[]) { localStorage.setItem(LOG_KEY, JSON.stringify(l)); }

// ============================================================================
// TRANSLATIONS
// ============================================================================

const T: Record<string, L5> = {
  sub: {
    ja: 'プロの音楽家 朝比奈幸太郎 監修',
    en: 'Supervised by pro musician Kotaro Asahina',
    ko: '프로 음악가 아사히나 코타로 감수',
    pt: 'Supervisionado pelo músico profissional Kotaro Asahina',
    es: 'Supervisado por el músico profesional Kotaro Asahina',
  },
  tap: { ja: 'タップテンポ', en: 'Tap Tempo', ko: '탭 템포', pt: 'Tap Tempo', es: 'Tap Tempo' },
  ts: { ja: '拍子', en: 'Time Signature', ko: '박자', pt: 'Compasso', es: 'Compás' },
  sdLabel: { ja: 'サブディビジョン', en: 'Subdivision', ko: '세분화', pt: 'Subdivisão', es: 'Subdivisión' },
  sdNone: { ja: 'なし', en: 'None', ko: '없음', pt: 'Nenhum', es: 'Ninguna' },

  pAccent: { ja: 'アクセントパターン', en: 'Accent Pattern', ko: '악센트 패턴', pt: 'Padrão de Acento', es: 'Patrón de Acento' },
  pAccentDesc: { ja: '●をクリックでアクセント変更（強→中→弱→ミュート）', en: 'Click circles to change accent (strong→medium→weak→mute)', ko: '●을 클릭해 악센트 변경 (강→중→약→음소거)', pt: 'Clique nos círculos para mudar acento', es: 'Haz clic en los círculos para cambiar acento' },

  pSilent: { ja: 'サイレントバー練習', en: 'Silent Bar Practice', ko: '사일런트 바 연습', pt: 'Prática de Compassos Silenciosos', es: 'Práctica de Compases Silenciosos' },
  pSilentDesc: { ja: 'N小節鳴らしてN小節無音。復帰時にずれていたら内部パルスが未成熟。', en: 'Play N bars, then N bars silent. If you drift, your internal pulse needs work.', ko: 'N마디 재생 후 N마디 무음. 복귀 시 어긋나면 내부 박이 미숙.', pt: 'Toque N compassos, depois N silenciosos.', es: 'Toca N compases, después N silenciosos.' },
  playBars: { ja: '鳴らす', en: 'Play', ko: '재생', pt: 'Tocar', es: 'Tocar' },
  silentBars: { ja: '無音', en: 'Silent', ko: '무음', pt: 'Silêncio', es: 'Silencio' },
  bars: { ja: '小節', en: 'bars', ko: '마디', pt: 'compassos', es: 'compases' },

  pSpeed: { ja: 'スピードトレーナー', en: 'Speed Trainer', ko: '스피드 트레이너', pt: 'Treinador de Velocidade', es: 'Entrenador de Velocidad' },
  pSpeedDesc: { ja: 'N小節ごとにBPMを自動加速。楽器練習の速度上げに。', en: 'Auto-increase BPM every N bars. For building instrument speed.', ko: 'N마디마다 BPM 자동 가속. 악기 연습 속도 향상에.', pt: 'Aumente BPM automaticamente a cada N compassos.', es: 'Aumenta BPM automáticamente cada N compases.' },
  startBpm: { ja: '開始', en: 'Start', ko: '시작', pt: 'Início', es: 'Inicio' },
  targetBpm: { ja: '目標', en: 'Target', ko: '목표', pt: 'Meta', es: 'Meta' },
  increment: { ja: '増分', en: '+', ko: '증분', pt: '+', es: '+' },
  everyN: { ja: '小節ごと', en: 'every … bars', ko: '마디마다', pt: 'a cada … compassos', es: 'cada … compases' },

  pPoly: { ja: 'ポリリズム', en: 'Polyrhythm', ko: '폴리리듬', pt: 'Polirritmia', es: 'Polirritmia' },
  pPolyDesc: { ja: '現在の拍子に別のリズムを重ねて聴く。', en: 'Overlay a second rhythm on the current meter.', ko: '현재 박자에 다른 리듬을 겹쳐 듣기.', pt: 'Sobreponha um segundo ritmo ao compasso atual.', es: 'Superpón un segundo ritmo al compás actual.' },
  overlay: { ja: 'オーバーレイ', en: 'Overlay', ko: '오버레이', pt: 'Sobreposição', es: 'Superposición' },
  against: { ja: 'against', en: 'against', ko: 'against', pt: 'contra', es: 'contra' },

  pSwing: { ja: 'スウィング', en: 'Swing', ko: '스윙', pt: 'Swing', es: 'Swing' },
  pSwingDesc: { ja: 'オフビートのタイミング調整。ジャズのスウィングフィール。', en: 'Adjust off-beat timing. Jazz swing feel.', ko: '오프비트 타이밍 조절. 재즈 스윙 필.', pt: 'Ajuste o timing do contratempo. Swing de jazz.', es: 'Ajusta el timing del contratiempo. Swing de jazz.' },
  straight: { ja: 'ストレート', en: 'Straight', ko: '스트레이트', pt: 'Reto', es: 'Recto' },
  tripleFeel: { ja: 'トリプル', en: 'Triplet', ko: '트리플', pt: 'Tercina', es: 'Tresillo' },

  pGroup: { ja: 'ビートグルーピング', en: 'Beat Grouping', ko: '비트 그루핑', pt: 'Agrupamento', es: 'Agrupamiento' },
  pGroupDesc: { ja: '変拍子のアクセント位置を変更。', en: 'Change accent positions for irregular meters.', ko: '변박자의 악센트 위치를 변경.', pt: 'Mude posições de acento em compassos irregulares.', es: 'Cambia posiciones de acento en compases irregulares.' },

  pTune: { ja: 'チューニング基準音', en: 'Tuning Reference', ko: '튜닝 기준음', pt: 'Tom de Referência', es: 'Tono de Referencia' },
  pTuneDesc: { ja: 'A=440〜443Hz のサイン波。メトロノームと同時に使用可。', en: 'A=440-443Hz sine wave. Use alongside metronome.', ko: 'A=440~443Hz 사인파. 메트로놈과 동시 사용 가능.', pt: 'Onda senoidal A=440-443Hz. Use junto com o metrônomo.', es: 'Onda sinusoidal A=440-443Hz. Úsalo junto con el metrónomo.' },

  pMod: { ja: 'メトリック・モジュレーション', en: 'Metric Modulation', ko: '메트릭 모듈레이션', pt: 'Modulação Métrica', es: 'Modulación Métrica' },
  pModDesc: {
    ja: '拍の等価関係に基づくテンポ遷移。複数小節にまたがるセクションを自動再生。ジャズ・現代音楽の必須訓練。',
    en: 'Tempo transition based on beat equivalence. Auto-plays multi-bar sections. Essential jazz & modern music training.',
    ko: '박의 등가 관계에 기반한 템포 전환. 여러 마디에 걸친 섹션을 자동 재생. 재즈·현대음악의 필수 훈련.',
    pt: 'Transição de tempo baseada em equivalência de batidas. Reproduz seções de vários compassos automaticamente.',
    es: 'Transición de tempo basada en equivalencia de pulsos. Reproduce secciones de varios compases automáticamente.',
  },
  modLoop: { ja: 'ループ再生', en: 'Loop', ko: '루프', pt: 'Loop', es: 'Loop' },
  modStep: { ja: 'ステップ', en: 'Step', ko: '스텝', pt: 'Passo', es: 'Paso' },
  modBars: { ja: '小節', en: 'bars', ko: '마디', pt: 'comp.', es: 'comp.' },

  pClave: { ja: 'クラーベ＆パターン', en: 'Clave & Patterns', ko: '클라베 & 패턴', pt: 'Clave & Padrões', es: 'Clave & Patrones' },
  pClaveDesc: {
    ja: 'ソンクラーベ・ルンバクラーベ・ボサノバ・サンバ・ジャズライド・カスカラ等の定型リズムパターン。メトロノームと同時に鳴らし、パターンを体に刻む。',
    en: 'Son clave, Rumba clave, Bossa nova, Samba, Jazz ride, Cascara and more. Play alongside metronome — engrave patterns into your body.',
    ko: '손 클라베·룸바 클라베·보사노바·삼바·재즈 라이드·카스카라 등의 정형 리듬 패턴. 메트로놈과 동시에 울려 패턴을 몸에 새깁니다.',
    pt: 'Clave de Son, Rumba, Bossa nova, Samba, Ride de Jazz, Cascara e mais.',
    es: 'Clave de Son, Rumba, Bossa nova, Samba, Ride de Jazz, Cascara y más.',
  },

  pDisplace: { ja: 'ビートディスプレイスメント', en: 'Beat Displacement', ko: '비트 디스플레이스먼트', pt: 'Deslocamento de Batida', es: 'Desplazamiento de Pulso' },
  pDisplaceDesc: {
    ja: 'アクセント位置を八分音符や十六分音符の単位でシフト。拍頭が「ずれる」感覚を訓練。ジャズ即興の核心技術。',
    en: 'Shift accent position by eighth or sixteenth note. Train the feel of a displaced downbeat. Core jazz improvisation technique.',
    ko: '악센트 위치를 8분음표나 16분음표 단위로 시프트. 박두가 「어긋나는」 감각을 훈련. 재즈 즉흥의 핵심 기술.',
    pt: 'Desloque a posição do acento por colcheia ou semicolcheia.',
    es: 'Desplaza la posición del acento por corchea o semicorchea.',
  },
  displaceBy: { ja: 'シフト量', en: 'Shift', ko: '시프트', pt: 'Desvio', es: 'Desplazamiento' },

  pOTB: { ja: 'オーバー・ザ・バーライン', en: 'Over the Barline', ko: '오버 더 바라인', pt: 'Além da Barra', es: 'Sobre la Barra' },
  pOTBDesc: {
    ja: '小節線を超えてN拍ごとにアクセント。4/4で3拍ごとにアクセントを打つと4小節で一巡。ジャズフレージングの浮遊感を体得。',
    en: 'Accent every N beats across barlines. E.g. every 3 beats in 4/4 completes in 4 bars. Master jazz phrasing float.',
    ko: '마디선을 넘어 N박마다 악센트. 4/4에서 3박마다 악센트를 치면 4마디로 한 바퀴. 재즈 프레이징의 부유감을 체득.',
    pt: 'Acento a cada N batidas além das barras de compasso.',
    es: 'Acento cada N pulsos a través de las barras de compás.',
  },
  otbEvery: { ja: '拍ごと', en: 'every … beats', ko: '박마다', pt: 'a cada … batidas', es: 'cada … pulsos' },

  pPreset: { ja: 'プリセット', en: 'Presets', ko: '프리셋', pt: 'Predefinições', es: 'Preajustes' },
  pLog: { ja: '練習ログ', en: 'Practice Log', ko: '연습 로그', pt: 'Registro de Prática', es: 'Registro de Práctica' },
  pLogDesc: { ja: '1分以上の練習セッションを自動記録。', en: 'Auto-records sessions over 1 minute.', ko: '1분 이상의 연습 세션을 자동 기록.', pt: 'Registra automaticamente sessões acima de 1 minuto.', es: 'Registra automáticamente sesiones de más de 1 minuto.' },

  save: { ja: '保存', en: 'Save', ko: '저장', pt: 'Salvar', es: 'Guardar' },
  del: { ja: '削除', en: 'Delete', ko: '삭제', pt: 'Excluir', es: 'Eliminar' },
  clear: { ja: 'クリア', en: 'Clear', ko: '클리어', pt: 'Limpar', es: 'Limpiar' },
  noLog: { ja: 'まだ記録がありません', en: 'No records yet', ko: '아직 기록이 없습니다', pt: 'Nenhum registro ainda', es: 'Sin registros aún' },
  min: { ja: '分', en: 'min', ko: '분', pt: 'min', es: 'min' },

  tipKeys: {
    ja: 'Space 再生/停止　↑↓ BPM±1　←→ BPM±5',
    en: 'Space play/stop　↑↓ BPM±1　←→ BPM±5',
    ko: 'Space 재생/정지　↑↓ BPM±1　←→ BPM±5',
    pt: 'Space play/stop　↑↓ BPM±1　←→ BPM±5',
    es: 'Space play/stop　↑↓ BPM±1　←→ BPM±5',
  },

  jazzLabel: {
    ja: 'JAZZ TRAINING',
    en: 'JAZZ TRAINING',
    ko: 'JAZZ TRAINING',
    pt: 'JAZZ TRAINING',
    es: 'JAZZ TRAINING',
  },
  coreLabel: {
    ja: 'CORE',
    en: 'CORE',
    ko: 'CORE',
    pt: 'CORE',
    es: 'CORE',
  },
  toolsLabel: {
    ja: 'TOOLS',
    en: 'TOOLS',
    ko: 'TOOLS',
    pt: 'TOOLS',
    es: 'TOOLS',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function MetronomePage() {
  const { lang } = useLang();
  const t = (k: string) => T[k]?.[lang] ?? T[k]?.en ?? k;
  const { guardAction, showNudge, setShowNudge } = useRegistrationNudge();

  // ── Core state ──
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [tsIdx, setTsIdx] = useState(2); // index into TS_LIST (default 4/4)
  const ts = TS_LIST[tsIdx];

  // ── Feature state ──
  const [subdivision, setSubdivision] = useState(1);
  const [accents, setAccents] = useState<number[]>(() => genAccents(4, [4]));
  const [grouping, setGrouping] = useState<number[]>([4]);

  const [silentEnabled, setSilentEnabled] = useState(false);
  const [playBarsN, setPlayBarsN] = useState(4);
  const [silentBarsN, setSilentBarsN] = useState(4);
  const [silentPhase, setSilentPhase] = useState<'play' | 'silent'>('play');
  const [cycleBar, setCycleBar] = useState(0);

  const [speedEnabled, setSpeedEnabled] = useState(false);
  const [speedStart, setSpeedStart] = useState(60);
  const [speedTarget, setSpeedTarget] = useState(120);
  const [speedInc, setSpeedInc] = useState(2);
  const [speedEvery, setSpeedEvery] = useState(4);

  const [polyEnabled, setPolyEnabled] = useState(false);
  const [polyNum, setPolyNum] = useState(3);
  const [currentPolyBeat, setCurrentPolyBeat] = useState(-1);

  const [swing, setSwing] = useState(50);

  const [tuneEnabled, setTuneEnabled] = useState(false);
  const [tuneHz, setTuneHz] = useState(442);

  // ── Metric Modulation state ──
  const [modEnabled, setModEnabled] = useState(false);
  const [modPresetIdx, setModPresetIdx] = useState(0);
  const [modLoop, setModLoop] = useState(true);
  const [modStepDisplay, setModStepDisplay] = useState(0);
  const [modBarDisplay, setModBarDisplay] = useState(0);

  // ── Clave state ──
  const [claveEnabled, setClaveEnabled] = useState(false);
  const [claveIdx, setClaveIdx] = useState(0);

  // ── Beat Displacement state ──
  const [displaceEnabled, setDisplaceEnabled] = useState(false);
  const [displaceShift, setDisplaceShift] = useState(1); // in 16th note units (1=16th, 2=8th, 3=dotted 8th, 4=quarter)

  // ── OTB state ──
  const [otbEnabled, setOtbEnabled] = useState(false);
  const [otbPresetIdx, setOtbPresetIdx] = useState(0);
  const [otbTotalBeat, setOtbTotalBeat] = useState(0);

  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [log, setLog] = useState<LogEntry[]>([]);

  const [openPanel, setOpenPanel] = useState<string | null>(null);

  // ── Tap tempo ──
  const tapTimesRef = useRef<number[]>([]);

  // ── Audio refs ──
  const ctxRef = useRef<AudioContext | null>(null);
  const schedRef = useRef<number | null>(null);
  const nextTimeRef = useRef(0);
  const beatRef = useRef(0);
  const subRef = useRef(0);
  const barRef = useRef(0);

  const nextPolyTimeRef = useRef(0);
  const polyBeatRef = useRef(0);

  const silentCycleBarRef = useRef(0);
  const inSilentRef = useRef(false);
  const speedBarsRef = useRef(0);

  // Metric Modulation refs
  const modStepRef = useRef(0);
  const modBarRef = useRef(0);
  const modActiveBpmRef = useRef(0);

  // Clave refs
  const claveSubRef = useRef(0); // current subdivision position in clave cycle
  const claveNextTimeRef = useRef(0);

  // Beat Displacement refs
  const displaceSubRef = useRef(0);
  const displaceNextTimeRef = useRef(0);

  // OTB refs
  const otbTotalBeatRef = useRef(0);

  const tuneOscRef = useRef<OscillatorNode | null>(null);
  const tuneGainRef = useRef<GainNode | null>(null);

  const sessionStartRef = useRef(0);

  // ── Sync refs (read by scheduler) ──
  const bpmRef = useRef(bpm);         bpmRef.current = bpm;
  const tsNumRef = useRef(ts.num);    tsNumRef.current = ts.num;
  const tsDenRef = useRef(ts.den);    tsDenRef.current = ts.den;
  const subDivRef = useRef(subdivision); subDivRef.current = subdivision;
  const swingRef = useRef(swing);     swingRef.current = swing;
  const accentsRef = useRef(accents); accentsRef.current = accents;
  const silentEnabledRef = useRef(silentEnabled); silentEnabledRef.current = silentEnabled;
  const playBarsRef = useRef(playBarsN); playBarsRef.current = playBarsN;
  const silentBarsRef = useRef(silentBarsN); silentBarsRef.current = silentBarsN;
  const speedEnabledRef = useRef(speedEnabled); speedEnabledRef.current = speedEnabled;
  const speedTargetRef = useRef(speedTarget); speedTargetRef.current = speedTarget;
  const speedIncRef = useRef(speedInc); speedIncRef.current = speedInc;
  const speedEveryRef = useRef(speedEvery); speedEveryRef.current = speedEvery;
  const polyEnabledRef = useRef(polyEnabled); polyEnabledRef.current = polyEnabled;
  const polyNumRef = useRef(polyNum); polyNumRef.current = polyNum;

  const modEnabledRef = useRef(modEnabled); modEnabledRef.current = modEnabled;
  const modPresetIdxRef = useRef(modPresetIdx); modPresetIdxRef.current = modPresetIdx;
  const modLoopRef = useRef(modLoop); modLoopRef.current = modLoop;

  const claveEnabledRef = useRef(claveEnabled); claveEnabledRef.current = claveEnabled;
  const claveIdxRef = useRef(claveIdx); claveIdxRef.current = claveIdx;

  const displaceEnabledRef = useRef(displaceEnabled); displaceEnabledRef.current = displaceEnabled;
  const displaceShiftRef = useRef(displaceShift); displaceShiftRef.current = displaceShift;

  const otbEnabledRef = useRef(otbEnabled); otbEnabledRef.current = otbEnabled;
  const otbPresetIdxRef = useRef(otbPresetIdx); otbPresetIdxRef.current = otbPresetIdx;

  // ── Init from storage ──
  useEffect(() => {
    setPresets(loadPresets());
    setLog(loadLog());
  }, []);

  // ── Tuning reference ──
  useEffect(() => {
    if (tuneOscRef.current) tuneOscRef.current.frequency.value = tuneHz;
  }, [tuneHz]);

  const toggleTuning = useCallback((on: boolean) => {
    if (on) {
      const c = getCtx();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.frequency.value = tuneHz;
      osc.type = 'sine';
      g.gain.value = 0.08;
      osc.connect(g); g.connect(c.destination);
      osc.start();
      tuneOscRef.current = osc;
      tuneGainRef.current = g;
    } else {
      try { tuneOscRef.current?.stop(); } catch { /* */ }
      tuneOscRef.current = null;
      tuneGainRef.current = null;
    }
  }, [tuneHz]);

  // ── AudioContext ──
  function getCtx(): AudioContext {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }

  // ── Bar complete handler ──
  function onBarComplete() {
    if (silentEnabledRef.current) {
      silentCycleBarRef.current++;
      const total = playBarsRef.current + silentBarsRef.current;
      if (silentCycleBarRef.current >= total) silentCycleBarRef.current = 0;
      inSilentRef.current = silentCycleBarRef.current >= playBarsRef.current;
      setSilentPhase(inSilentRef.current ? 'silent' : 'play');
      setCycleBar(silentCycleBarRef.current);
    }
    if (speedEnabledRef.current && !modEnabledRef.current) {
      speedBarsRef.current++;
      if (speedBarsRef.current >= speedEveryRef.current) {
        speedBarsRef.current = 0;
        const next = Math.min(bpmRef.current + speedIncRef.current, speedTargetRef.current);
        bpmRef.current = next;
        setBpm(next);
      }
    }
    // Metric modulation: advance bar, possibly step
    if (modEnabledRef.current) {
      modBarRef.current++;
      const preset = MOD_PRESETS[modPresetIdxRef.current];
      if (preset) {
        const currentStep = preset.steps[modStepRef.current];
        if (currentStep && modBarRef.current >= currentStep.bars) {
          modBarRef.current = 0;
          modStepRef.current++;
          if (modStepRef.current >= preset.steps.length) {
            if (modLoopRef.current) {
              modStepRef.current = 0;
            } else {
              modStepRef.current = preset.steps.length - 1;
            }
          }
          // Apply new step's BPM and time signature
          const newStep = preset.steps[modStepRef.current];
          if (newStep) {
            const baseBpm = modActiveBpmRef.current;
            const newBpm = Math.round(baseBpm * newStep.bpmMultiplier);
            bpmRef.current = newBpm;
            setBpm(newBpm);
            // Find matching TS
            const tsMatch = TS_LIST.findIndex(t => t.label === newStep.tsLabel);
            if (tsMatch >= 0) {
              tsNumRef.current = TS_LIST[tsMatch].num;
              tsDenRef.current = TS_LIST[tsMatch].den;
            }
          }
        }
        setModStepDisplay(modStepRef.current);
        setModBarDisplay(modBarRef.current);
      }
    }
  }

  // ── Scheduler ──
  function schedule() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const ahead = ctx.currentTime + LOOKAHEAD;

    // Main beats + subdivisions
    while (nextTimeRef.current < ahead) {
      const beat = beatRef.current;
      const sub = subRef.current;
      const silent = silentEnabledRef.current && inSilentRef.current;
      const time = nextTimeRef.current;

      if (sub === 0) {
        // OTB accent overlay
        const otbAccent = otbEnabledRef.current &&
          otbTotalBeatRef.current % OTB_PRESETS[otbPresetIdxRef.current].accentEvery === 0;

        if (!silent) {
          const level = accentsRef.current[beat] ?? 1;
          playClick(ctx, time, level);
          if (otbAccent) playOTBAccent(ctx, time);
        }
        const delay = Math.max(0, (time - ctx.currentTime) * 1000);
        const capturedBeat = beat;
        const capturedOtbTotal = otbTotalBeatRef.current;
        setTimeout(() => {
          setCurrentBeat(capturedBeat);
          if (otbEnabledRef.current) setOtbTotalBeat(capturedOtbTotal);
        }, delay);

        if (otbEnabledRef.current) {
          otbTotalBeatRef.current++;
        }
      } else {
        if (!silent) playSubClick(ctx, time);
      }

      // Advance
      const bpmNow = bpmRef.current;
      const beatDur = 60 / bpmNow;
      const sd = subDivRef.current;
      const num = tsNumRef.current;
      const sw = swingRef.current;

      subRef.current++;
      if (subRef.current >= sd) {
        subRef.current = 0;
        beatRef.current++;
        if (beatRef.current >= num) {
          beatRef.current = 0;
          barRef.current++;
          onBarComplete();
        }
      }

      // Time advance
      if (sd <= 1) {
        nextTimeRef.current += beatDur;
      } else if (sd === 2 && sw !== 50) {
        nextTimeRef.current += beatDur * (subRef.current === 1 ? sw / 100 : (100 - sw) / 100);
      } else {
        nextTimeRef.current += beatDur / sd;
      }
    }

    // Polyrhythm overlay
    if (polyEnabledRef.current) {
      while (nextPolyTimeRef.current < ahead) {
        const silent = silentEnabledRef.current && inSilentRef.current;
        const pBeat = polyBeatRef.current;
        const time = nextPolyTimeRef.current;
        if (!silent) playPolyClick(ctx, time, pBeat === 0);
        const capturedPBeat = pBeat;
        const delay = Math.max(0, (time - ctx.currentTime) * 1000);
        setTimeout(() => setCurrentPolyBeat(capturedPBeat), delay);

        polyBeatRef.current++;
        if (polyBeatRef.current >= polyNumRef.current) polyBeatRef.current = 0;
        const barDur = tsNumRef.current * (60 / bpmRef.current);
        nextPolyTimeRef.current += barDur / polyNumRef.current;
      }
    }

    // Clave pattern overlay
    if (claveEnabledRef.current) {
      const pattern = CLAVE_PATTERNS[claveIdxRef.current];
      if (pattern) {
        while (claveNextTimeRef.current < ahead) {
          const silent = silentEnabledRef.current && inSilentRef.current;
          const pos = claveSubRef.current % pattern.length;
          if (pattern.hits.includes(pos) && !silent) {
            playClaveHit(ctx, claveNextTimeRef.current, pos === 0);
          }
          claveSubRef.current++;
          if (claveSubRef.current >= pattern.length) claveSubRef.current = 0;
          // Each subdivision = 1/4 of a beat (16th note grid)
          const sixteenthDur = (60 / bpmRef.current) / 4;
          claveNextTimeRef.current += sixteenthDur;
        }
      }
    }

    // Beat displacement overlay
    if (displaceEnabledRef.current) {
      while (displaceNextTimeRef.current < ahead) {
        const silent = silentEnabledRef.current && inSilentRef.current;
        if (!silent) playDisplaceTick(ctx, displaceNextTimeRef.current);
        const beatDurNow = 60 / bpmRef.current;
        displaceNextTimeRef.current += beatDurNow;
      }
    }
  }

  // ── Play / Stop ──
  const startPlay = useCallback(() => {
    const ctx = getCtx();
    nextTimeRef.current = ctx.currentTime + 0.05;
    beatRef.current = 0; subRef.current = 0; barRef.current = 0;
    silentCycleBarRef.current = 0; inSilentRef.current = false;
    speedBarsRef.current = 0;

    // Metric modulation init
    if (modEnabled) {
      modStepRef.current = 0;
      modBarRef.current = 0;
      modActiveBpmRef.current = bpm; // Store the base BPM
      const firstStep = MOD_PRESETS[modPresetIdx]?.steps[0];
      if (firstStep) {
        const startBpm = Math.round(bpm * firstStep.bpmMultiplier);
        bpmRef.current = startBpm;
        setBpm(startBpm);
        const tsMatch = TS_LIST.findIndex(t => t.label === firstStep.tsLabel);
        if (tsMatch >= 0) {
          tsNumRef.current = TS_LIST[tsMatch].num;
          tsDenRef.current = TS_LIST[tsMatch].den;
        }
      }
      setModStepDisplay(0);
      setModBarDisplay(0);
    } else if (speedEnabled) {
      bpmRef.current = speedStart;
      setBpm(speedStart);
    }

    // Clave init
    claveSubRef.current = 0;
    claveNextTimeRef.current = nextTimeRef.current;

    // Displacement init
    const shiftUnits = displaceShift;
    const sixteenthDur = (60 / bpmRef.current) / 4;
    displaceNextTimeRef.current = nextTimeRef.current + (shiftUnits * sixteenthDur);
    displaceSubRef.current = 0;

    // OTB init
    otbTotalBeatRef.current = 0;
    setOtbTotalBeat(0);

    polyBeatRef.current = 0; nextPolyTimeRef.current = nextTimeRef.current;
    setSilentPhase('play'); setCycleBar(0);
    sessionStartRef.current = Date.now();
    schedRef.current = window.setInterval(schedule, SCHED_MS);
    setIsPlaying(true);
  }, [speedEnabled, speedStart, modEnabled, modPresetIdx, bpm, displaceShift]);

  const stopPlay = useCallback(() => {
    if (schedRef.current) { clearInterval(schedRef.current); schedRef.current = null; }
    setIsPlaying(false); setCurrentBeat(-1); setCurrentPolyBeat(-1);
    // Restore TS if modulation was active
    if (modEnabled) {
      tsNumRef.current = ts.num;
      tsDenRef.current = ts.den;
    }
    // Log
    const dur = Math.round((Date.now() - sessionStartRef.current) / 60000);
    if (dur >= 1) {
      const entry: LogEntry = {
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        min: dur, bpm, ts: ts.label,
      };
      const updated = [entry, ...log].slice(0, 50);
      setLog(updated); saveLog(updated);
    }
  }, [bpm, ts.label, ts.num, ts.den, log, modEnabled]);

  const togglePlay = useCallback(() => {
    if (isPlaying) stopPlay(); else startPlay();
  }, [isPlaying, startPlay, stopPlay]);

  // ── Tap tempo ──
  const handleTap = useCallback(() => {
    const now = performance.now();
    const taps = tapTimesRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) taps.length = 0;
    taps.push(now);
    if (taps.length > 8) taps.shift();
    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / avg);
      if (newBpm >= 20 && newBpm <= 300) setBpm(newBpm);
    }
  }, []);

  // ── Keyboard ──
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowUp') { e.preventDefault(); setBpm(b => Math.min(b + 1, 300)); }
      if (e.code === 'ArrowDown') { e.preventDefault(); setBpm(b => Math.max(b - 1, 20)); }
      if (e.code === 'ArrowRight') { e.preventDefault(); setBpm(b => Math.min(b + 5, 300)); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); setBpm(b => Math.max(b - 5, 20)); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [togglePlay]);

  // ── Handle metric modulation enable with nudge ──
  const handleModEnable = useCallback((checked: boolean) => {
    if (checked && guardAction()) return; // Show nudge if user not logged in
    setModEnabled(checked);
    if (isPlaying) stopPlay();
  }, [guardAction, isPlaying, stopPlay]);

  // ── Time sig change ──
  function changeTsIdx(idx: number) {
    setTsIdx(idx);
    const newTs = TS_LIST[idx];
    const newGroup = newTs.group;
    setGrouping(newGroup);
    setAccents(genAccents(newTs.num, newGroup));
    if (isPlaying) { stopPlay(); }
  }

  function changeGrouping(g: number[]) {
    setGrouping(g);
    setAccents(genAccents(ts.num, g));
  }

  function cycleAccent(i: number) {
    const next = [...accents];
    next[i] = next[i] === 3 ? 2 : next[i] === 2 ? 1 : next[i] === 1 ? 0 : 3;
    setAccents(next);
  }

  // ── Presets ──
  function savePreset() {
    if (!presetName.trim()) return;
    const p: Preset = {
      name: presetName.trim(), bpm, tsNum: ts.num, tsDen: ts.den,
      subdivision, swing, grouping, accents,
    };
    const updated = [p, ...presets.filter(x => x.name !== p.name)].slice(0, 20);
    setPresets(updated); savePresets(updated); setPresetName('');
  }
  function loadPreset(p: Preset) {
    setBpm(p.bpm); setSubdivision(p.subdivision); setSwing(p.swing);
    setGrouping(p.grouping); setAccents(p.accents);
    const idx = TS_LIST.findIndex(t => t.num === p.tsNum && t.den === p.tsDen);
    if (idx >= 0) setTsIdx(idx);
    if (isPlaying) stopPlay();
  }
  function deletePreset(name: string) {
    const updated = presets.filter(p => p.name !== name);
    setPresets(updated); savePresets(updated);
  }

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      if (schedRef.current) clearInterval(schedRef.current);
      try { tuneOscRef.current?.stop(); } catch { /* */ }
      ctxRef.current?.close().catch(() => { /* */ });
    };
  }, []);

  // ── Derived ──
  const gStarts = groupStarts(grouping);
  const noteSymbol = ts.den === 8 ? '♪' : ts.den === 2 ? '𝅗𝅥' : '♩';
  const subLabels = [
    { val: 1, label: T.sdNone[lang] },
    { val: 2, label: '♪' },
    { val: 3, label: '3' },
    { val: 4, label: '♬' },
    { val: 5, label: '5' },
    { val: 7, label: '7' },
  ];

  const otbPreset = OTB_PRESETS[otbPresetIdx];
  const otbCycleLength = otbPreset.accentEvery * otbPreset.tsNum;

  // ── Panel toggle ──
  function togglePanel(id: string) { setOpenPanel(openPanel === id ? null : id); }

  // ── Styles ──
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 14, padding: 'clamp(14px,3vw,22px)',
    border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
  };
  const panelHead: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', userSelect: 'none', padding: '12px 16px',
    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
    fontSize: 'clamp(13px,2.5vw,15px)', fontWeight: 600, color: '#334155',
  };
  const jazzPanelHead: React.CSSProperties = {
    ...panelHead,
    borderColor: JAZZ_AMBER,
    borderWidth: '1.5px',
    background: '#fffbeb',
  };
  const smallBtn: React.CSSProperties = {
    padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569',
  };
  const activeSmallBtn: React.CSSProperties = {
    ...smallBtn, background: ACCENT, color: '#fff', borderColor: ACCENT,
  };
  const jazzSmallBtn: React.CSSProperties = {
    ...smallBtn, borderColor: '#fbbf24',
  };
  const jazzActiveBtn: React.CSSProperties = {
    ...smallBtn, background: JAZZ_AMBER, color: '#fff', borderColor: JAZZ_AMBER,
  };
  const sliderStyle: React.CSSProperties = { width: '100%', accentColor: ACCENT };
  const labelStyle: React.CSSProperties = { fontSize: 12, color: '#94a3b8', marginBottom: 4 };
  const sectionDivider = (label: string, color: string, bg: string): React.CSSProperties => ({
    fontSize: 10, fontWeight: 800, letterSpacing: 2.5, color, textTransform: 'uppercase' as const,
    background: bg, display: 'inline-block', padding: '3px 12px', borderRadius: 20, marginBottom: 8,
  });

  // ── Render ──
  return (
    <>
    <RegistrationNudge show={showNudge} onClose={() => setShowNudge(false)} feature="advanced" />
    <main style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: sans, color: '#1e293b' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 'clamp(20px,5vw,40px) clamp(14px,4vw,24px)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
            Pro Supervised
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(26px,6vw,38px)', letterSpacing: 2, marginBottom: 6 }}>
            KUON METRONOME
          </h1>
          <p style={{ fontSize: 'clamp(11px,2.5vw,13px)', color: '#64748b' }}>{t('sub')}</p>
        </div>

        {/* BPM Display */}
        <div style={{ ...card, textAlign: 'center', marginBottom: 16, padding: 'clamp(20px,4vw,32px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(12px,3vw,24px)', marginBottom: 12 }}>
            <button onClick={() => setBpm(b => Math.max(b - 1, 20))} style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 22, cursor: 'pointer', color: '#475569', fontWeight: 700 }}>−</button>
            <div>
              <div style={{ fontFamily: serif, fontSize: 'clamp(48px,12vw,72px)', fontWeight: 700, lineHeight: 1, letterSpacing: -2 }}>{bpm}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{noteSymbol} = {bpm}</div>
            </div>
            <button onClick={() => setBpm(b => Math.min(b + 1, 300))} style={{ width: 44, height: 44, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 22, cursor: 'pointer', color: '#475569', fontWeight: 700 }}>+</button>
          </div>
          <input type="range" min={20} max={300} value={bpm} onChange={e => setBpm(+e.target.value)} style={{ ...sliderStyle, marginBottom: 10 }} />
          <button onClick={handleTap} style={{ ...smallBtn, background: ACCENT_LIGHT, color: ACCENT, borderColor: ACCENT, fontWeight: 700 }}>
            {t('tap')}
          </button>
        </div>

        {/* Status bar */}
        {isPlaying && (speedEnabled || silentEnabled || modEnabled || otbEnabled) && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            {speedEnabled && !modEnabled && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '3px 10px', borderRadius: 8 }}>
                Speed: {bpm} → {speedTarget}
              </span>
            )}
            {silentEnabled && (
              <span style={{ fontSize: 12, fontWeight: 700, color: silentPhase === 'silent' ? '#dc2626' : '#16a34a', background: silentPhase === 'silent' ? '#fef2f2' : '#f0fdf4', padding: '3px 10px', borderRadius: 8 }}>
                {silentPhase === 'silent' ? 'SILENT' : 'PLAY'} {cycleBar + 1}/{silentPhase === 'silent' ? silentBarsN : playBarsN}
              </span>
            )}
            {modEnabled && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '3px 10px', borderRadius: 8 }}>
                Mod: Step {modStepDisplay + 1}/{MOD_PRESETS[modPresetIdx]?.steps.length ?? 0} · Bar {modBarDisplay + 1}
              </span>
            )}
            {otbEnabled && (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '3px 10px', borderRadius: 8 }}>
                OTB: {(otbTotalBeat % OTB_PRESETS[otbPresetIdx].accentEvery) + 1}/{OTB_PRESETS[otbPresetIdx].accentEvery}
              </span>
            )}
          </div>
        )}

        {/* Time Signature */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ ...labelStyle, textAlign: 'center' }}>{t('ts')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {TS_LIST.map((s, i) => (
              <button key={s.label} onClick={() => changeTsIdx(i)} style={i === tsIdx ? activeSmallBtn : smallBtn}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Beat Circles */}
        <div style={{ ...card, marginBottom: 16, textAlign: 'center', padding: 'clamp(16px,3vw,24px)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            {Array.from({ length: ts.num }, (_, i) => {
              const isActive = currentBeat === i;
              const level = accents[i] ?? 1;
              const size = level === 3 ? 34 : level === 2 ? 28 : level === 1 ? 24 : 20;
              // OTB highlight: check if this beat position is an OTB accent
              const isOtbAccent = otbEnabled && isPlaying && otbTotalBeat > 0 &&
                ((otbTotalBeat - 1) % OTB_PRESETS[otbPresetIdx].accentEvery === 0) && isActive;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  {gStarts.has(i) && i > 0 && <div style={{ width: 10 }} />}
                  <div
                    onClick={() => cycleAccent(i)}
                    style={{
                      width: size,
                      height: size,
                      borderRadius: '50%',
                      border: `2.5px solid ${isOtbAccent ? '#0369a1' : isActive ? ACCENT : level === 0 ? '#cbd5e1' : '#94a3b8'}`,
                      background: isOtbAccent ? '#0369a1' : isActive ? ACCENT : level === 0 ? '#f1f5f9' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, color: isActive || isOtbAccent ? '#fff' : '#94a3b8', fontWeight: 700,
                    }}
                  >
                    {level === 0 ? '×' : ''}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Poly overlay circles */}
          {polyEnabled && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {Array.from({ length: polyNum }, (_, i) => (
                <div key={i} style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: `2px solid ${currentPolyBeat === i ? '#0ea5e9' : '#bae6fd'}`,
                  background: currentPolyBeat === i ? '#0ea5e9' : 'transparent',
                }} />
              ))}
              <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center', marginLeft: 4 }}>
                {ts.num} {t('against')} {polyNum}
              </span>
            </div>
          )}
          <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 8 }}>{t('pAccentDesc')}</p>
        </div>

        {/* Play / Stop */}
        <button
          onClick={togglePlay}
          style={{
            display: 'block', width: '100%', padding: '18px 0', borderRadius: 14,
            border: 'none', cursor: 'pointer', fontWeight: 800,
            fontSize: 'clamp(16px,3vw,20px)', letterSpacing: 2,
            background: isPlaying ? '#ef4444' : ACCENT,
            color: '#fff', marginBottom: 16,
          }}
        >
          {isPlaying ? '■  STOP' : '▶  PLAY'}
        </button>

        {/* Subdivision */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...labelStyle, textAlign: 'center' }}>{t('sdLabel')}</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {subLabels.map(s => (
              <button key={s.val} onClick={() => setSubdivision(s.val)} style={s.val === subdivision ? activeSmallBtn : smallBtn}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════ CORE PANELS ══════ */}
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={sectionDivider(t('coreLabel'), ACCENT, ACCENT_LIGHT)}>{t('coreLabel')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>

          {/* Silent Bar */}
          <div>
            <div style={panelHead} onClick={() => togglePanel('silent')}>
              <span>{silentEnabled ? '🟢 ' : ''}{t('pSilent')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'silent' ? '−' : '+'}</span>
            </div>
            {openPanel === 'silent' && (
              <div style={{ ...card, marginTop: 4 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{t('pSilentDesc')}</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={silentEnabled} onChange={e => setSilentEnabled(e.target.checked)} style={{ accentColor: ACCENT }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>ON</span>
                </label>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={labelStyle}>{t('playBars')} ({t('bars')})</div>
                    <input type="number" min={1} max={16} value={playBarsN} onChange={e => setPlayBarsN(Math.max(1, +e.target.value))} style={{ width: 60, padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
                  </div>
                  <div>
                    <div style={labelStyle}>{t('silentBars')} ({t('bars')})</div>
                    <input type="number" min={1} max={16} value={silentBarsN} onChange={e => setSilentBarsN(Math.max(1, +e.target.value))} style={{ width: 60, padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Speed Trainer */}
          <div>
            <div style={panelHead} onClick={() => togglePanel('speed')}>
              <span>{speedEnabled ? '🟢 ' : ''}{t('pSpeed')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'speed' ? '−' : '+'}</span>
            </div>
            {openPanel === 'speed' && (
              <div style={{ ...card, marginTop: 4 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{t('pSpeedDesc')}</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={speedEnabled} onChange={e => setSpeedEnabled(e.target.checked)} style={{ accentColor: ACCENT }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>ON</span>
                </label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={labelStyle}>{t('startBpm')}</div>
                    <input type="number" min={20} max={300} value={speedStart} onChange={e => setSpeedStart(+e.target.value)} style={{ width: 64, padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
                  </div>
                  <div>
                    <div style={labelStyle}>{t('targetBpm')}</div>
                    <input type="number" min={20} max={300} value={speedTarget} onChange={e => setSpeedTarget(+e.target.value)} style={{ width: 64, padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
                  </div>
                  <div>
                    <div style={labelStyle}>{t('increment')}</div>
                    <input type="number" min={1} max={20} value={speedInc} onChange={e => setSpeedInc(Math.max(1, +e.target.value))} style={{ width: 52, padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
                  </div>
                  <div>
                    <div style={labelStyle}>{t('everyN')}</div>
                    <input type="number" min={1} max={32} value={speedEvery} onChange={e => setSpeedEvery(Math.max(1, +e.target.value))} style={{ width: 52, padding: '6px 8px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Polyrhythm */}
          <div>
            <div style={panelHead} onClick={() => togglePanel('poly')}>
              <span>{polyEnabled ? '🟢 ' : ''}{t('pPoly')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'poly' ? '−' : '+'}</span>
            </div>
            {openPanel === 'poly' && (
              <div style={{ ...card, marginTop: 4 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{t('pPolyDesc')}</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={polyEnabled} onChange={e => setPolyEnabled(e.target.checked)} style={{ accentColor: ACCENT }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>ON</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{ts.num}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{t('against')}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[2, 3, 4, 5, 7].map(n => (
                      <button key={n} onClick={() => setPolyNum(n)} style={n === polyNum ? activeSmallBtn : smallBtn}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Swing */}
          <div>
            <div style={panelHead} onClick={() => togglePanel('swing')}>
              <span>{swing !== 50 ? '🟢 ' : ''}{t('pSwing')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'swing' ? '−' : '+'}</span>
            </div>
            {openPanel === 'swing' && (
              <div style={{ ...card, marginTop: 4 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{t('pSwingDesc')}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                  <span>{t('straight')} 50%</span>
                  <span style={{ fontWeight: 700, color: '#475569' }}>{swing}%</span>
                  <span>{t('tripleFeel')} 75%</span>
                </div>
                <input type="range" min={50} max={75} value={swing} onChange={e => setSwing(+e.target.value)} style={sliderStyle} />
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                  {subdivision !== 2 && lang === 'ja' ? '※ サブディビジョンを♪に設定するとスウィングが適用されます' :
                   subdivision !== 2 ? '※ Set subdivision to ♪ to apply swing' : ''}
                </p>
              </div>
            )}
          </div>

          {/* Beat Grouping */}
          {ALT_GROUPS[ts.num] && (
            <div>
              <div style={panelHead} onClick={() => togglePanel('group')}>
                <span>{t('pGroup')}</span>
                <span style={{ fontSize: 16 }}>{openPanel === 'group' ? '−' : '+'}</span>
              </div>
              {openPanel === 'group' && (
                <div style={{ ...card, marginTop: 4 }}>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{t('pGroupDesc')}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(ALT_GROUPS[ts.num] || []).map(g => {
                      const label = g.join('+');
                      const active = grouping.join('+') === label;
                      return (
                        <button key={label} onClick={() => changeGrouping(g)} style={active ? activeSmallBtn : smallBtn}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tuning */}
          <div>
            <div style={panelHead} onClick={() => togglePanel('tune')}>
              <span>{tuneEnabled ? '🟢 ' : ''}{t('pTune')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'tune' ? '−' : '+'}</span>
            </div>
            {openPanel === 'tune' && (
              <div style={{ ...card, marginTop: 4 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{t('pTuneDesc')}</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={tuneEnabled} onChange={e => { setTuneEnabled(e.target.checked); toggleTuning(e.target.checked); }} style={{ accentColor: ACCENT }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>ON</span>
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[440, 441, 442, 443].map(hz => (
                    <button key={hz} onClick={() => setTuneHz(hz)} style={hz === tuneHz ? activeSmallBtn : smallBtn}>
                      {hz} Hz
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══════ JAZZ TRAINING PANELS ══════ */}
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={sectionDivider(t('jazzLabel'), JAZZ_AMBER, JAZZ_AMBER_LIGHT)}>{t('jazzLabel')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>

          {/* Metric Modulation */}
          <div>
            <div style={jazzPanelHead} onClick={() => togglePanel('mod')}>
              <span>{modEnabled ? '🟠 ' : ''}{t('pMod')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'mod' ? '−' : '+'}</span>
            </div>
            {openPanel === 'mod' && (
              <div style={{ ...card, marginTop: 4, borderColor: '#fbbf24', borderWidth: '1.5px' }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>{t('pModDesc')}</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={modEnabled} onChange={e => handleModEnable(e.target.checked)} style={{ accentColor: JAZZ_AMBER }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>ON</span>
                </label>
                {/* Preset selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {MOD_PRESETS.map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => { setModPresetIdx(i); if (isPlaying) stopPlay(); }}
                      style={{
                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1.5px solid ${i === modPresetIdx ? JAZZ_AMBER : '#e2e8f0'}`,
                        background: i === modPresetIdx ? '#fffbeb' : '#fff',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700, color: i === modPresetIdx ? JAZZ_AMBER : '#334155', marginBottom: 2 }}>
                        {p.name[lang] ?? p.name.en}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                        {p.desc[lang] ?? p.desc.en}
                      </div>
                      {/* Step visualization */}
                      <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {p.steps.map((s, si) => (
                          <span key={si} style={{
                            fontSize: 11, fontWeight: 700, fontFamily: mono,
                            padding: '2px 8px', borderRadius: 6,
                            background: isPlaying && modEnabled && i === modPresetIdx && si === modStepDisplay ? JAZZ_AMBER : '#f1f5f9',
                            color: isPlaying && modEnabled && i === modPresetIdx && si === modStepDisplay ? '#fff' : '#475569',
                          }}>
                            {s.tsLabel} × {s.bars}
                            {s.bpmMultiplier !== 1 ? ` (×${Math.round(s.bpmMultiplier * 100) / 100})` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Loop toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={modLoop} onChange={e => setModLoop(e.target.checked)} style={{ accentColor: JAZZ_AMBER }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{t('modLoop')}</span>
                </label>
              </div>
            )}
          </div>

          {/* Clave & Patterns */}
          <div>
            <div style={jazzPanelHead} onClick={() => togglePanel('clave')}>
              <span>{claveEnabled ? '🟠 ' : ''}{t('pClave')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'clave' ? '−' : '+'}</span>
            </div>
            {openPanel === 'clave' && (
              <div style={{ ...card, marginTop: 4, borderColor: '#fbbf24', borderWidth: '1.5px' }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>{t('pClaveDesc')}</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={claveEnabled} onChange={e => setClaveEnabled(e.target.checked)} style={{ accentColor: JAZZ_AMBER }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>ON</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {CLAVE_PATTERNS.map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => setClaveIdx(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                        border: `1.5px solid ${i === claveIdx ? JAZZ_AMBER : '#e2e8f0'}`,
                        background: i === claveIdx ? '#fffbeb' : '#fff',
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: i === claveIdx ? 700 : 500, color: i === claveIdx ? JAZZ_AMBER : '#475569', minWidth: 120 }}>
                        {p.name[lang] ?? p.name.en}
                      </span>
                      {/* Pattern dots visualization */}
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: p.length }, (_, j) => (
                          <div key={j} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: p.hits.includes(j) ? (i === claveIdx ? JAZZ_AMBER : '#94a3b8') : '#e2e8f0',
                          }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Beat Displacement */}
          <div>
            <div style={jazzPanelHead} onClick={() => togglePanel('displace')}>
              <span>{displaceEnabled ? '🟠 ' : ''}{t('pDisplace')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'displace' ? '−' : '+'}</span>
            </div>
            {openPanel === 'displace' && (
              <div style={{ ...card, marginTop: 4, borderColor: '#fbbf24', borderWidth: '1.5px' }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>{t('pDisplaceDesc')}</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={displaceEnabled} onChange={e => { setDisplaceEnabled(e.target.checked); if (isPlaying) stopPlay(); }} style={{ accentColor: JAZZ_AMBER }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>ON</span>
                </label>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{t('displaceBy')}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { val: 1, label: '1/16' },
                    { val: 2, label: '1/8 (♪)' },
                    { val: 3, label: '3/16 (♪.)' },
                    { val: 4, label: '1/4 (♩)' },
                  ].map(s => (
                    <button key={s.val} onClick={() => { setDisplaceShift(s.val); if (isPlaying) stopPlay(); }} style={s.val === displaceShift ? jazzActiveBtn : jazzSmallBtn}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, lineHeight: 1.6 }}>
                  {lang === 'ja'
                    ? '通常のクリックに加え、指定量だけずらした位置にもクリックが鳴ります。ずらしたクリックに合わせてフレーズを弾く訓練です。'
                    : 'A displaced click sounds alongside the normal click. Practice phrasing on the displaced beat.'}
                </p>
              </div>
            )}
          </div>

          {/* Over the Barline */}
          <div>
            <div style={jazzPanelHead} onClick={() => togglePanel('otb')}>
              <span>{otbEnabled ? '🟠 ' : ''}{t('pOTB')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'otb' ? '−' : '+'}</span>
            </div>
            {openPanel === 'otb' && (
              <div style={{ ...card, marginTop: 4, borderColor: '#fbbf24', borderWidth: '1.5px' }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>{t('pOTBDesc')}</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={otbEnabled} onChange={e => { setOtbEnabled(e.target.checked); if (isPlaying) stopPlay(); }} style={{ accentColor: JAZZ_AMBER }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>ON</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {OTB_PRESETS.map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => { setOtbPresetIdx(i); if (isPlaying) stopPlay(); }}
                      style={{
                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1.5px solid ${i === otbPresetIdx ? JAZZ_AMBER : '#e2e8f0'}`,
                        background: i === otbPresetIdx ? '#fffbeb' : '#fff',
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 700, color: i === otbPresetIdx ? JAZZ_AMBER : '#334155', marginBottom: 2 }}>
                        {p.name[lang] ?? p.name.en}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                        {p.desc[lang] ?? p.desc.en}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══════ TOOLS ══════ */}
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={sectionDivider(t('toolsLabel'), '#64748b', '#f1f5f9')}>{t('toolsLabel')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
          {/* Presets */}
          <div>
            <div style={panelHead} onClick={() => togglePanel('preset')}>
              <span>{t('pPreset')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'preset' ? '−' : '+'}</span>
            </div>
            {openPanel === 'preset' && (
              <div style={{ ...card, marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  <input type="text" value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Preset name" maxLength={30} style={{ flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                  <button onClick={savePreset} style={{ ...smallBtn, background: ACCENT, color: '#fff', borderColor: ACCENT }}>{t('save')}</button>
                </div>
                {presets.length === 0 && <p style={{ fontSize: 12, color: '#94a3b8' }}>—</p>}
                {presets.map(p => (
                  <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <button onClick={() => loadPreset(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: ACCENT, textAlign: 'left' }}>
                      {p.name} <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>{p.bpm} BPM · {p.tsNum}/{p.tsDen}</span>
                    </button>
                    <button onClick={() => deletePreset(p.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Practice Log */}
          <div>
            <div style={panelHead} onClick={() => togglePanel('log')}>
              <span>{t('pLog')}</span>
              <span style={{ fontSize: 16 }}>{openPanel === 'log' ? '−' : '+'}</span>
            </div>
            {openPanel === 'log' && (
              <div style={{ ...card, marginTop: 4 }}>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{t('pLogDesc')}</p>
                {log.length === 0 && <p style={{ fontSize: 12, color: '#94a3b8' }}>{t('noLog')}</p>}
                {log.slice(0, 20).map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>{e.date}</span>
                    <span style={{ fontWeight: 600 }}>{e.min}{t('min')} · {e.bpm} BPM · {e.ts}</span>
                  </div>
                ))}
                {log.length > 0 && (
                  <button onClick={() => { setLog([]); saveLog([]); }} style={{ ...smallBtn, marginTop: 8, fontSize: 11, color: '#ef4444', borderColor: '#fecaca' }}>
                    {t('clear')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tip */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', lineHeight: 1.7, fontFamily: mono }}>
          {t('tipKeys')}
        </div>
      </div>
    </main>
    </>
  );
}
