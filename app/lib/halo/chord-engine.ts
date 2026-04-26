// ─────────────────────────────────────────────
// KUON HALO v2 — Chord Progression Engine
// ─────────────────────────────────────────────
// アンビエント音楽の核心 = 緩やかなコード進行 (1 コード = 30-60 秒持続)。
// Roman Numeral 表記 + モード対応 + ヴォイスリーディング (なめらかな声部移動)。
// Hiroshi Yoshimura / Joep Beving / Max Richter 系の長尺音楽を生成可能に。
// ─────────────────────────────────────────────

export type ChordQuality =
  | 'maj' | 'min'
  | 'maj7' | 'min7' | '7'
  | 'maj9' | 'min9'
  | 'sus2' | 'sus4'
  | 'add9' | 'minAdd9'
  | 'maj11' | 'min11';

// 各コードクオリティの semitone 構成
export function chordIntervals(q: ChordQuality): number[] {
  switch (q) {
    case 'maj':       return [0, 4, 7];
    case 'min':       return [0, 3, 7];
    case 'maj7':      return [0, 4, 7, 11];
    case 'min7':      return [0, 3, 7, 10];
    case '7':         return [0, 4, 7, 10];
    case 'maj9':      return [0, 4, 7, 11, 14];
    case 'min9':      return [0, 3, 7, 10, 14];
    case 'sus2':      return [0, 2, 7];
    case 'sus4':      return [0, 5, 7];
    case 'add9':      return [0, 4, 7, 14];
    case 'minAdd9':   return [0, 3, 7, 14];
    case 'maj11':     return [0, 4, 7, 11, 14, 17];
    case 'min11':     return [0, 3, 7, 10, 14, 17];
  }
}

// ─────────────────────────────────────────────
// Mode (旋法)
// ─────────────────────────────────────────────
export type Mode = 'ionian' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian';

// Mode の semitone パターン (ルートからの度数)
export const MODE_INTERVALS: Record<Mode, number[]> = {
  ionian:     [0, 2, 4, 5, 7, 9, 11],   // メジャー
  dorian:     [0, 2, 3, 5, 7, 9, 10],
  phrygian:   [0, 1, 3, 5, 7, 8, 10],   // 神秘・スパニッシュ
  lydian:     [0, 2, 4, 6, 7, 9, 11],   // 浮遊感
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian:    [0, 2, 3, 5, 7, 8, 10],   // ナチュラル・マイナー
  locrian:    [0, 1, 3, 5, 6, 8, 10],
};

// ─────────────────────────────────────────────
// Chord — 1 つのコードを表す
// ─────────────────────────────────────────────
export type Chord = {
  rootSemi: number;     // キーからの semitones (0 = I, 5 = IV など)
  quality: ChordQuality;
  duration: number;     // 秒
  // ボイシング指定 (省略可)
  bassOctaveOffset?: number;   // 通常 0、低めにしたい時 -1 など
  noTopShimmer?: boolean;      // 高音層の倍音を抑える
};

// ─────────────────────────────────────────────
// Progression — コード進行
// ─────────────────────────────────────────────
export type Progression = {
  id: string;
  name: { ja: string; en: string };
  description: { ja: string; en: string };
  mode: Mode;
  chords: Chord[];
  loop: boolean;        // true: durationの終わりまで繰り返し
};

// ─────────────────────────────────────────────
// 内蔵プログレッション・ライブラリ
// 全て C キー (root = 0) で記述。再生時に Key 周波数で transpose。
// ─────────────────────────────────────────────

export const PROGRESSIONS: Progression[] = [
  {
    id: 'sleep-cycle',
    name: { ja: '眠りの輪', en: 'Sleep Cycle' },
    description: {
      ja: 'I → vi → IV → V の優しいループ。Pop Music 黄金進行の超低速版。脳が「また始まる」と認識する瞬間に深い安心感が訪れる。',
      en: 'I → vi → IV → V slow loop. The slowed-down golden progression — the brain feels deep safety in its predictable return.',
    },
    mode: 'ionian',
    chords: [
      { rootSemi: 0, quality: 'maj9',    duration: 45 },  // Imaj9
      { rootSemi: 9, quality: 'min9',    duration: 45 },  // vim9
      { rootSemi: 5, quality: 'maj7',    duration: 45 },  // IVmaj7
      { rootSemi: 7, quality: 'sus2',    duration: 45 },  // Vsus2
    ],
    loop: true,
  },
  {
    id: 'eno-floating',
    name: { ja: '漂う', en: 'Floating' },
    description: {
      ja: 'I と IV の超低速交替のみ。Brian Eno『Music for Airports』方式。時間の感覚が消える。',
      en: 'Just I and IV alternating very slowly. Brian Eno "Music for Airports" approach — time itself dissolves.',
    },
    mode: 'ionian',
    chords: [
      { rootSemi: 0, quality: 'maj9', duration: 60 },
      { rootSemi: 5, quality: 'maj9', duration: 60 },
    ],
    loop: true,
  },
  {
    id: 'mystical-phrygian',
    name: { ja: '神秘の進行', en: 'Mystical Phrygian' },
    description: {
      ja: 'フリジアン旋法。I → bII → I → bII の独特な揺らぎ。スペインのフラメンコ風だが、超低速で神秘的に。',
      en: 'Phrygian mode. I → bII → I → bII — Spanish/Mediterranean mystical color at glacial pace.',
    },
    mode: 'phrygian',
    chords: [
      { rootSemi: 0, quality: 'min',    duration: 50 },  // i
      { rootSemi: 1, quality: 'maj7',   duration: 50 },  // bIImaj7
      { rootSemi: 0, quality: 'minAdd9', duration: 50 },
      { rootSemi: 1, quality: 'maj7',   duration: 50 },
    ],
    loop: true,
  },
  {
    id: 'manifestation',
    name: { ja: '引き寄せ', en: 'Manifestation' },
    description: {
      ja: 'I → iii → vi → IV。「人生が好転していく」感覚を生む上昇的進行。引き寄せの法則を実践する女性に最適。',
      en: 'I → iii → vi → IV. Uplifting progression evoking "life is improving" — perfect for law-of-attraction practice.',
    },
    mode: 'ionian',
    chords: [
      { rootSemi: 0, quality: 'maj9',   duration: 40 },
      { rootSemi: 4, quality: 'min9',   duration: 40 },
      { rootSemi: 9, quality: 'min7',   duration: 40 },
      { rootSemi: 5, quality: 'maj9',   duration: 40 },
    ],
    loop: true,
  },
  {
    id: 'abundance',
    name: { ja: '豊かさ', en: 'Abundance' },
    description: {
      ja: 'I → V → vi → iii → IV → I → IV → V。豊かな展開のバラード進行。ビジュアライゼーション瞑想用。',
      en: 'I → V → vi → iii → IV → I → IV → V. Rich balladic progression for visualization meditation.',
    },
    mode: 'ionian',
    chords: [
      { rootSemi: 0, quality: 'maj9',  duration: 35 },
      { rootSemi: 7, quality: 'sus2',  duration: 35 },
      { rootSemi: 9, quality: 'min9',  duration: 35 },
      { rootSemi: 4, quality: 'min7',  duration: 35 },
      { rootSemi: 5, quality: 'maj7',  duration: 35 },
      { rootSemi: 0, quality: 'add9',  duration: 35 },
      { rootSemi: 5, quality: 'maj9',  duration: 35 },
      { rootSemi: 7, quality: 'sus4',  duration: 35 },
    ],
    loop: true,
  },
  {
    id: 'divine-embrace',
    name: { ja: '神聖な抱擁', en: 'Divine Embrace' },
    description: {
      ja: 'I → IV → I → V → vi → IV → I。穏やかに帰結するピース。守られている感覚。',
      en: 'I → IV → I → V → vi → IV → I. Peacefully resolving — the feeling of being held.',
    },
    mode: 'ionian',
    chords: [
      { rootSemi: 0, quality: 'maj9',  duration: 45 },
      { rootSemi: 5, quality: 'maj9',  duration: 45 },
      { rootSemi: 0, quality: 'add9',  duration: 45 },
      { rootSemi: 7, quality: 'sus2',  duration: 45 },
      { rootSemi: 9, quality: 'min9',  duration: 45 },
      { rootSemi: 5, quality: 'maj7',  duration: 45 },
      { rootSemi: 0, quality: 'maj9',  duration: 45 },
    ],
    loop: true,
  },
  {
    id: 'inner-light',
    name: { ja: '内なる光', en: 'Inner Light' },
    description: {
      ja: 'リディアン旋法。I → IImaj → I → vii。きらめく上昇感。松果体覚醒・直観の目覚めに。',
      en: 'Lydian mode. I → IImaj → I → vii. Sparkling lift — for pineal awakening and intuition.',
    },
    mode: 'lydian',
    chords: [
      { rootSemi: 0, quality: 'maj9',  duration: 50 },
      { rootSemi: 2, quality: 'maj7',  duration: 50 },
      { rootSemi: 0, quality: 'add9',  duration: 50 },
      { rootSemi: 11, quality: 'min7', duration: 50 },
    ],
    loop: true,
  },
  {
    id: 'self-worth',
    name: { ja: '自己価値の癒し', en: 'Self-Worth Healing' },
    description: {
      ja: '4 つの和音だけで、自分を抱きしめるような優しさ。うつ・自己否定に静かに寄り添う。',
      en: 'Just 4 chords, gentle as a self-embrace. Quietly accompanies depression and self-criticism.',
    },
    mode: 'ionian',
    chords: [
      { rootSemi: 5, quality: 'maj9',  duration: 60 },  // IV (warmth start)
      { rootSemi: 0, quality: 'add9',  duration: 60 },  // I
      { rootSemi: 9, quality: 'min9',  duration: 60 },  // vi
      { rootSemi: 7, quality: 'sus2',  duration: 60 },  // V
    ],
    loop: true,
  },
];

// ─────────────────────────────────────────────
// Voice Allocation
// 各コードに対し、複数のボイス層 (bass / pad / shimmer) を生成
// ─────────────────────────────────────────────

export type ChordVoicing = {
  bass: number[];       // 周波数 (Hz) 配列・1-2 音
  pad: number[];        // 周波数 (Hz) 配列・3-5 音 (パッド層)
  shimmer: number[];    // 周波数 (Hz) 配列・1-3 音 (高音層)
};

/**
 * コードを実際の周波数群に展開。
 * 美しい voicing (open voicing で広がりを出す)
 */
export function voiceChord(
  chord: Chord,
  keyHz: number,        // キーの基本周波数 (例: F4 = 349.23 Hz)
  mode: Mode,
): ChordVoicing {
  const intervals = chordIntervals(chord.quality);
  const rootHz = keyHz * Math.pow(2, chord.rootSemi / 12);

  // Bass: ルート音を 1-2 octave 下
  const bassOctave = chord.bassOctaveOffset ?? -1;
  const bass = [
    rootHz * Math.pow(2, bassOctave),
    // 5 度を低めに重ねる (open voicing)
    rootHz * Math.pow(2, bassOctave) * Math.pow(2, 7 / 12),
  ];

  // Pad: chord intervals を mid range に展開
  // open voicing: 1-3-7 (skip 5th in mid for openness, add 5 in shimmer)
  const pad = intervals.map((semi) => rootHz * Math.pow(2, semi / 12));

  // Shimmer: octave + 9th + 12th あたりの倍音
  const shimmer = chord.noTopShimmer ? [] : [
    rootHz * Math.pow(2, 12 / 12),       // octave up
    rootHz * Math.pow(2, 19 / 12),       // 12th (5th up an octave)
    // 9th (2nd up an octave) for sus2/maj9 chords
    ...(intervals.includes(14) || intervals.includes(2)
      ? [rootHz * Math.pow(2, 14 / 12)]
      : []),
  ];

  return { bass, pad, shimmer };
}

// ─────────────────────────────────────────────
// Time-based progression query
// ─────────────────────────────────────────────

export type ProgressionEvent = {
  chord: Chord;
  startTime: number;
  endTime: number;
  index: number;
};

/**
 * Progression を duration 秒分にスケジュール (loop 対応)
 */
export function scheduleProgression(
  progression: Progression,
  totalDuration: number,
): ProgressionEvent[] {
  const events: ProgressionEvent[] = [];
  const cycleDur = progression.chords.reduce((s, c) => s + c.duration, 0);

  let t = 0;
  let cycleIdx = 0;
  while (t < totalDuration) {
    for (let i = 0; i < progression.chords.length; i++) {
      const c = progression.chords[i];
      const endT = Math.min(t + c.duration, totalDuration);
      events.push({
        chord: c,
        startTime: t,
        endTime: endT,
        index: events.length,
      });
      t = endT;
      if (t >= totalDuration) break;
    }
    cycleIdx++;
    if (!progression.loop || cycleDur === 0) break;
  }
  return events;
}

// ─────────────────────────────────────────────
// Key 周波数ヘルパ
// F major key = F4 = 349.23 Hz (440Hz tuning)
// 432Hz tuning だと F4 = 343.06 Hz
// ─────────────────────────────────────────────
export const KEY_FREQS_440: Record<string, number> = {
  C:  261.63,  'C#': 277.18, D:  293.66, 'D#': 311.13,
  E:  329.63,  F:   349.23, 'F#': 369.99, G:  392.00,
  'G#': 415.30, A:  440.00, 'A#': 466.16, B:  493.88,
};

export function keyToHz(key: string, tuning: 432 | 440 = 440): number {
  const base = KEY_FREQS_440[key] ?? 349.23; // F default
  return tuning === 432 ? base * (432 / 440) : base;
}

export function getProgressionById(id: string): Progression | undefined {
  return PROGRESSIONS.find((p) => p.id === id);
}
