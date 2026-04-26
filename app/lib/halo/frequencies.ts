// ─────────────────────────────────────────────
// KUON HALO — Sacred Frequency System
// ─────────────────────────────────────────────
// Curanz Sounds のヒーリング音楽量産のための周波数体系。
// 432Hz チューニング・ソルフェジオ・シューマン共鳴・脳波周波数を
// 数値ではなく「意味と効果」で扱える形に整理。
// ─────────────────────────────────────────────

export type SacredFreq = {
  hz: number;
  name: string;
  jaName: string;
  meaning: string;       // 説明 (LP・プリセット説明用)
  jaMeaning: string;
  effect: string;        // 期待される効果 (女性が共感する文言)
  jaEffect: string;
  recommended: 'sleep' | 'meditation' | 'morning' | 'heart' | 'focus' | 'all';
};

// ─────────────────────────────────────────────
// Solfeggio 9 周波数 (古代の癒しの音階)
// ─────────────────────────────────────────────
export const SOLFEGGIO: SacredFreq[] = [
  {
    hz: 174,
    name: 'Foundation', jaName: '土台',
    meaning: 'Reduces pain, gives stability and security',
    jaMeaning: '痛みの緩和・安心感・大地のような安定',
    effect: 'Pain relief, security, grounding',
    jaEffect: '身体の痛み・不安からの解放・地に足がつく感覚',
    recommended: 'sleep',
  },
  {
    hz: 285,
    name: 'Quantum Cognition', jaName: '量子的修復',
    meaning: 'Influences energy fields, regenerates tissue',
    jaMeaning: 'エネルギー場への影響・組織の修復',
    effect: 'Cell regeneration, body healing',
    jaEffect: '細胞の再生・身体的な癒し',
    recommended: 'sleep',
  },
  {
    hz: 396,
    name: 'Liberation', jaName: '解放',
    meaning: 'Liberates from fear and guilt',
    jaMeaning: '恐れと罪悪感からの解放',
    effect: 'Releases fear, guilt, and trauma',
    jaEffect: '恐れ・罪悪感・トラウマからの解放',
    recommended: 'meditation',
  },
  {
    hz: 417,
    name: 'Change', jaName: '変容',
    meaning: 'Facilitates change, undoing situations',
    jaMeaning: '変化を促す・状況をリセットする',
    effect: 'Resonance with change, release of negative energy',
    jaEffect: '人生の転換期に・ネガティブの浄化',
    recommended: 'morning',
  },
  {
    hz: 528,
    name: 'Love', jaName: '愛',
    meaning: 'DNA repair, transformation and miracles',
    jaMeaning: 'DNA 修復・変容・愛と奇跡の周波数',
    effect: 'The miracle frequency — love, joy, peace',
    jaEffect: '愛・喜び・平安・奇跡の周波数',
    recommended: 'all',
  },
  {
    hz: 639,
    name: 'Connection', jaName: '繋がり',
    meaning: 'Connection in relationships, love',
    jaMeaning: '人間関係の調和・愛の絆',
    effect: 'Heart opening, harmonious relationships',
    jaEffect: 'ハート・チャクラを開く・人との調和',
    recommended: 'heart',
  },
  {
    hz: 741,
    name: 'Expression', jaName: '表現',
    meaning: 'Awakening intuition, expression',
    jaMeaning: '直感の覚醒・表現力の解放',
    effect: 'Self-expression, problem solving',
    jaEffect: '本来の自分を表現する力・問題解決',
    recommended: 'morning',
  },
  {
    hz: 852,
    name: 'Intuition', jaName: '直観',
    meaning: 'Returning to spiritual order',
    jaMeaning: 'スピリチュアルな秩序への回帰',
    effect: 'Awakening intuition, spiritual sight',
    jaEffect: '直観の目覚め・霊的視野の開花',
    recommended: 'meditation',
  },
  {
    hz: 963,
    name: 'Pineal Activation', jaName: '松果体活性',
    meaning: 'Connection with the divine consciousness',
    jaMeaning: '神聖な意識との繋がり・松果体の覚醒',
    effect: 'Crown chakra activation, oneness',
    jaEffect: 'クラウン・チャクラの覚醒・宇宙との一体感',
    recommended: 'meditation',
  },
];

// ─────────────────────────────────────────────
// Special Healing Frequencies
// ─────────────────────────────────────────────
export const SPECIAL_FREQS: SacredFreq[] = [
  {
    hz: 432,
    name: '432Hz Sacred A', jaName: '432Hz 神聖な A',
    meaning: 'Natural tuning aligned with the Earth and universe',
    jaMeaning: '地球と宇宙に同調する自然なチューニング',
    effect: 'Calmer, more harmonious than 440Hz tuning',
    jaEffect: '440Hz より穏やかで調和的な響き',
    recommended: 'all',
  },
  {
    hz: 7.83,
    name: 'Schumann Resonance', jaName: 'シューマン共鳴',
    meaning: 'Earth\'s natural electromagnetic resonance',
    jaMeaning: '地球本来の電磁共鳴・自然との同調',
    effect: 'Deep grounding, connection to Earth',
    jaEffect: '深い接地感・地球との一体化',
    recommended: 'meditation',
  },
  {
    hz: 40,
    name: 'Gamma Awakening', jaName: 'ガンマ覚醒',
    meaning: 'Brain wave frequency for higher consciousness',
    jaMeaning: '高次意識の脳波周波数',
    effect: 'Mental clarity, focus, peak awareness',
    jaEffect: '精神的クリアさ・集中・覚醒',
    recommended: 'focus',
  },
];

// ─────────────────────────────────────────────
// Brainwave Frequencies (binaural beat offsets)
// ─────────────────────────────────────────────
export type Brainwave = {
  id: 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
  range: [number, number];        // Hz range
  default: number;                 // recommended Hz
  name: string;
  jaName: string;
  state: string;
  jaState: string;
  use: string;
  jaUse: string;
};

export const BRAINWAVES: Brainwave[] = [
  {
    id: 'delta', range: [0.5, 4], default: 2,
    name: 'Delta', jaName: 'デルタ波',
    state: 'Deep sleep, healing', jaState: '深い眠り・治癒',
    use: 'Sleep music, deep rest, recovery',
    jaUse: '睡眠音楽・深い休息・心身回復',
  },
  {
    id: 'theta', range: [4, 8], default: 6,
    name: 'Theta', jaName: 'シータ波',
    state: 'Meditation, intuition, dreams', jaState: '瞑想・直観・夢の世界',
    use: 'Deep meditation, hypnosis, creativity',
    jaUse: '深い瞑想・催眠・創造性の覚醒',
  },
  {
    id: 'alpha', range: [8, 12], default: 10,
    name: 'Alpha', jaName: 'アルファ波',
    state: 'Relaxed alertness', jaState: 'リラックスした覚醒',
    use: 'Light meditation, flow state, learning',
    jaUse: '軽い瞑想・フロー状態・学習',
  },
  {
    id: 'beta', range: [12, 30], default: 18,
    name: 'Beta', jaName: 'ベータ波',
    state: 'Active thinking, focus', jaState: '能動的思考・集中',
    use: 'Focus, problem-solving, productivity',
    jaUse: '集中・問題解決・生産性',
  },
  {
    id: 'gamma', range: [30, 100], default: 40,
    name: 'Gamma', jaName: 'ガンマ波',
    state: 'Peak awareness, insight', jaState: '頂点の覚醒・洞察',
    use: 'Higher consciousness, deep insight',
    jaUse: '高次意識・深い洞察・閃き',
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

// 432Hz チューニングでの周波数計算 (A4 = 432Hz 基準)
// midiNote 69 = A4
export function midiToHz432(midiNote: number): number {
  return 432 * Math.pow(2, (midiNote - 69) / 12);
}

// 440Hz チューニング (標準)
export function midiToHz440(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// 任意の基準周波数 (例: 528Hz を基準音にする)
export function midiToHzWithBase(midiNote: number, baseFreq: number, baseMidi: number = 69): number {
  return baseFreq * Math.pow(2, (midiNote - baseMidi) / 12);
}

// セント差をピッチ倍率に
export function centsToRatio(cents: number): number {
  return Math.pow(2, cents / 1200);
}

// ─────────────────────────────────────────────
// Healing Scales (modal scales, common in healing music)
// ─────────────────────────────────────────────
export type HealingScale = {
  id: string;
  name: string;
  jaName: string;
  intervals: number[];     // semitones from root
  vibe: string;
  jaVibe: string;
};

export const HEALING_SCALES: HealingScale[] = [
  {
    id: 'minor-pentatonic', name: 'Minor Pentatonic', jaName: 'マイナー・ペンタトニック',
    intervals: [0, 3, 5, 7, 10],
    vibe: 'Mysterious, soulful', jaVibe: '神秘的・魂に響く',
  },
  {
    id: 'major-pentatonic', name: 'Major Pentatonic', jaName: 'メジャー・ペンタトニック',
    intervals: [0, 2, 4, 7, 9],
    vibe: 'Bright, peaceful', jaVibe: '明るく穏やか',
  },
  {
    id: 'dorian', name: 'Dorian', jaName: 'ドリアン旋法',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    vibe: 'Mystical, contemplative', jaVibe: '神秘的・瞑想的',
  },
  {
    id: 'lydian', name: 'Lydian', jaName: 'リディアン旋法',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    vibe: 'Floating, ethereal', jaVibe: '浮遊感・天使的',
  },
  {
    id: 'aeolian', name: 'Natural Minor (Aeolian)', jaName: 'ナチュラル・マイナー',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    vibe: 'Sad, healing', jaVibe: '悲しみと癒し',
  },
  {
    id: 'phrygian', name: 'Phrygian', jaName: 'フリジア旋法',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    vibe: 'Eastern, exotic', jaVibe: '東洋的・神聖',
  },
  {
    id: 'overtone-1', name: 'Pure Fifth Drone', jaName: '純正 5 度ドローン',
    intervals: [0, 7], // tonic + perfect fifth
    vibe: 'Ancient, primal', jaVibe: '古代の・根源的',
  },
];
