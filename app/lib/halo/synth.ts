// ─────────────────────────────────────────────
// KUON HALO — Healing Voice Synthesis
// ─────────────────────────────────────────────
// クリスタル・ボウル・チベタン・ボウル・純粋トーン・ドローン・コーラス的
// 音響を Web Audio API で完全合成。サンプルファイル不要。
//
// 各ボイスは「持続音 (sustain)」を生成する関数として設計:
//   start(ctx, dest, freq, params) → { stop(time): void }
// 長時間 (30-120 分) のレンダリングに対応するため、エンベロープは
// 緩やか (アタック数秒・リリース数十秒) に設計。
// ─────────────────────────────────────────────

export type VoiceParams = {
  freq: number;          // 基本周波数 Hz
  volume: number;        // 0-1
  attack: number;        // 秒 (推奨 1-10)
  release: number;       // 秒 (推奨 5-30)
  detune: number;        // セント (微妙な「揺らぎ」用)
  pan: number;           // -1 to 1
  // ボイス固有パラメータ
  brightness?: number;   // 0-1 (倍音の強さ)
  warmth?: number;       // 0-1 (低域の豊かさ)
};

export type Voice = {
  stop(releaseTime?: number): void;
  setVolume(v: number, atTime?: number): void;
  nodes: AudioNode[];     // 内部参照 (デバッグ用)
};

// ─────────────────────────────────────────────
// Helper: panner
// ─────────────────────────────────────────────
function pan(ctx: BaseAudioContext, p: number): StereoPannerNode {
  const n = ctx.createStereoPanner();
  n.pan.value = Math.max(-1, Math.min(1, p));
  return n;
}

// ─────────────────────────────────────────────
// Voice 1: Pure Sine (純粋なサイン波)
// 最もシンプルで純粋な癒し音。ソルフェジオ周波数に最適。
// ─────────────────────────────────────────────
export function pureSine(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: VoiceParams,
): Voice {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const panner = pan(ctx, p.pan);

  osc.type = 'sine';
  osc.frequency.value = p.freq;
  osc.detune.value = p.detune;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(p.volume, startTime + p.attack);

  osc.connect(gain).connect(panner).connect(dest);
  osc.start(startTime);

  return {
    stop(releaseTime = ctx.currentTime) {
      gain.gain.cancelScheduledValues(releaseTime);
      gain.gain.setValueAtTime(gain.gain.value, releaseTime);
      gain.gain.linearRampToValueAtTime(0.0001, releaseTime + p.release);
      osc.stop(releaseTime + p.release + 0.1);
    },
    setVolume(v, atTime = ctx.currentTime) {
      gain.gain.linearRampToValueAtTime(v, atTime + 0.5);
    },
    nodes: [osc, gain, panner],
  };
}

// ─────────────────────────────────────────────
// Voice 2: Crystal Bowl (クリスタルボウル)
// 倍音構成: 1.0, 2.4, 4.8, 6.8, 9.4 (実測ベース・非整数倍 = inharmonic)
// アタック緩やか、リリース極長。神秘的な「水晶の響き」。
// ─────────────────────────────────────────────
const CRYSTAL_PARTIALS = [
  { ratio: 1.0,  amp: 1.0,  detune: 0 },
  { ratio: 2.4,  amp: 0.55, detune: -3 },
  { ratio: 4.8,  amp: 0.32, detune: 5 },
  { ratio: 6.8,  amp: 0.18, detune: -2 },
  { ratio: 9.4,  amp: 0.08, detune: 7 },
];

export function crystalBowl(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: VoiceParams,
): Voice {
  const oscs: OscillatorNode[] = [];
  const gain = ctx.createGain();
  const panner = pan(ctx, p.pan);

  // 微細な揺らぎ (LFO で全体ピッチを ±2 セント揺らす = "生きてる" 感)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.13;  // 7-8 秒周期
  lfoGain.gain.value = 2;       // ±2 セント
  lfo.connect(lfoGain);

  for (const partial of CRYSTAL_PARTIALS) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = p.freq * partial.ratio;
    osc.detune.value = p.detune + partial.detune;
    oscGain.gain.value = partial.amp;
    lfoGain.connect(osc.detune); // 揺らぎを各倍音に適用
    osc.connect(oscGain).connect(gain);
    oscs.push(osc);
  }

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(p.volume, startTime + Math.max(p.attack, 1));

  gain.connect(panner).connect(dest);
  oscs.forEach((o) => o.start(startTime));
  lfo.start(startTime);

  return {
    stop(releaseTime = ctx.currentTime) {
      const r = Math.max(p.release, 5);  // クリスタルは最低 5 秒リリース
      gain.gain.cancelScheduledValues(releaseTime);
      gain.gain.setValueAtTime(gain.gain.value, releaseTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + r);
      oscs.forEach((o) => o.stop(releaseTime + r + 0.1));
      lfo.stop(releaseTime + r + 0.1);
    },
    setVolume(v, atTime = ctx.currentTime) {
      gain.gain.linearRampToValueAtTime(v, atTime + 1);
    },
    nodes: [...oscs, gain, panner, lfo, lfoGain],
  };
}

// ─────────────────────────────────────────────
// Voice 3: Tibetan Bowl (チベタン・シンギングボウル)
// より豊かな低域と複雑な倍音。瞑想・ヨガ向け。
// ─────────────────────────────────────────────
const TIBETAN_PARTIALS = [
  { ratio: 1.0,  amp: 1.0,  detune: 0 },
  { ratio: 1.5,  amp: 0.4,  detune: -8 },  // 完全 5 度
  { ratio: 2.0,  amp: 0.6,  detune: 0 },
  { ratio: 3.1,  amp: 0.35, detune: 12 },
  { ratio: 4.5,  amp: 0.2,  detune: -5 },
  { ratio: 6.2,  amp: 0.12, detune: 8 },
];

export function tibetanBowl(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: VoiceParams,
): Voice {
  const oscs: OscillatorNode[] = [];
  const gain = ctx.createGain();
  const panner = pan(ctx, p.pan);

  // 「ううん〜」とうなる感じ (binaural-like 揺らぎ)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.08;  // 12-13 秒周期
  lfoGain.gain.value = 4;
  lfo.connect(lfoGain);

  for (const partial of TIBETAN_PARTIALS) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    // 偶数倍音は sine, 奇数は triangle で「金属感」演出
    osc.type = partial.ratio % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.value = p.freq * partial.ratio;
    osc.detune.value = p.detune + partial.detune;
    oscGain.gain.value = partial.amp;
    lfoGain.connect(osc.detune);
    osc.connect(oscGain).connect(gain);
    oscs.push(osc);
  }

  // ローパス (やや暖かさを出す)
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = (p.brightness ?? 0.5) * 4000 + 2000;
  lowpass.Q.value = 0.5;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(p.volume, startTime + Math.max(p.attack, 2));

  gain.connect(lowpass).connect(panner).connect(dest);
  oscs.forEach((o) => o.start(startTime));
  lfo.start(startTime);

  return {
    stop(releaseTime = ctx.currentTime) {
      const r = Math.max(p.release, 8);
      gain.gain.cancelScheduledValues(releaseTime);
      gain.gain.setValueAtTime(gain.gain.value, releaseTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + r);
      oscs.forEach((o) => o.stop(releaseTime + r + 0.1));
      lfo.stop(releaseTime + r + 0.1);
    },
    setVolume(v, atTime = ctx.currentTime) {
      gain.gain.linearRampToValueAtTime(v, atTime + 1);
    },
    nodes: [...oscs, gain, panner, lowpass, lfo, lfoGain],
  };
}

// ─────────────────────────────────────────────
// Voice 4: Drone (ドローン: 基音 + サブ + 5 度の重なり)
// 持続音の土台として最強。睡眠音楽の基礎。
// ─────────────────────────────────────────────
export function drone(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: VoiceParams,
): Voice {
  const layers = [
    { freq: p.freq * 0.5, type: 'sine' as const, amp: 0.4 },  // サブオクターブ
    { freq: p.freq,        type: 'sine' as const, amp: 0.6 },  // 基音
    { freq: p.freq * 1.5,  type: 'sine' as const, amp: 0.2 },  // 完全 5 度
    { freq: p.freq * 2,    type: 'sine' as const, amp: 0.3 },  // オクターブ上
  ];
  const oscs: OscillatorNode[] = [];
  const gain = ctx.createGain();
  const panner = pan(ctx, p.pan);

  // 微細な「呼吸」のような揺らぎ
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.06;  // 16 秒周期 (呼吸)
  lfoGain.gain.value = 3;
  lfo.connect(lfoGain);

  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = l.type;
    osc.frequency.value = l.freq;
    osc.detune.value = p.detune + (i - 2) * 1.5;  // 微細にデチューン
    oscGain.gain.value = l.amp;
    lfoGain.connect(osc.detune);
    osc.connect(oscGain).connect(gain);
    oscs.push(osc);
  }

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(p.volume, startTime + Math.max(p.attack, 3));

  gain.connect(panner).connect(dest);
  oscs.forEach((o) => o.start(startTime));
  lfo.start(startTime);

  return {
    stop(releaseTime = ctx.currentTime) {
      const r = Math.max(p.release, 5);
      gain.gain.cancelScheduledValues(releaseTime);
      gain.gain.setValueAtTime(gain.gain.value, releaseTime);
      gain.gain.linearRampToValueAtTime(0.0001, releaseTime + r);
      oscs.forEach((o) => o.stop(releaseTime + r + 0.1));
      lfo.stop(releaseTime + r + 0.1);
    },
    setVolume(v, atTime = ctx.currentTime) {
      gain.gain.linearRampToValueAtTime(v, atTime + 1);
    },
    nodes: [...oscs, gain, panner, lfo, lfoGain],
  };
}

// ─────────────────────────────────────────────
// Voice 5: Choir-like (天使の合唱風)
// ノコギリ波 + ローパスフィルタの遅いスイープ
// ─────────────────────────────────────────────
export function angelChoir(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: VoiceParams,
): Voice {
  // 3 つの微妙にデチューンされたノコギリ波 = "voice" っぽさ
  const oscs: OscillatorNode[] = [];
  const detuneCents = [-7, 0, 7];
  const gain = ctx.createGain();
  const panner = pan(ctx, p.pan);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  filter.Q.value = 1;

  // 遅いフィルタスイープ (天使が降りてくる感)
  filter.frequency.setValueAtTime(500, startTime);
  filter.frequency.linearRampToValueAtTime(2500 + (p.brightness ?? 0.5) * 1500, startTime + Math.max(p.attack, 8));

  for (const d of detuneCents) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = p.freq;
    osc.detune.value = p.detune + d;
    osc.connect(filter);
    oscs.push(osc);
  }

  // 軽い揺らぎ
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.15;
  lfoGain.gain.value = 5;
  lfo.connect(lfoGain);
  oscs.forEach((o) => lfoGain.connect(o.detune));

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(p.volume * 0.4, startTime + Math.max(p.attack, 5));  // sawtooth 強い→控えめ

  filter.connect(gain).connect(panner).connect(dest);
  oscs.forEach((o) => o.start(startTime));
  lfo.start(startTime);

  return {
    stop(releaseTime = ctx.currentTime) {
      const r = Math.max(p.release, 6);
      gain.gain.cancelScheduledValues(releaseTime);
      gain.gain.setValueAtTime(gain.gain.value, releaseTime);
      gain.gain.linearRampToValueAtTime(0.0001, releaseTime + r);
      oscs.forEach((o) => o.stop(releaseTime + r + 0.1));
      lfo.stop(releaseTime + r + 0.1);
    },
    setVolume(v, atTime = ctx.currentTime) {
      gain.gain.linearRampToValueAtTime(v, atTime + 1);
    },
    nodes: [...oscs, gain, panner, filter, lfo, lfoGain],
  };
}

// ─────────────────────────────────────────────
// Texture: Filtered Pink Noise (水・風・宇宙感)
// ─────────────────────────────────────────────
let _noiseBuf: AudioBuffer | null = null;
function getPinkNoiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  if (_noiseBuf && _noiseBuf.sampleRate === ctx.sampleRate) return _noiseBuf;
  const len = Math.floor(ctx.sampleRate * 4);  // 4 秒ループ
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }
  _noiseBuf = buf;
  return buf;
}

export type TextureType = 'water' | 'wind' | 'cosmos';

export function texture(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  type: TextureType,
  p: { volume: number; attack: number; release: number; pan?: number },
): Voice {
  const src = ctx.createBufferSource();
  src.buffer = getPinkNoiseBuffer(ctx);
  src.loop = true;

  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const panner = pan(ctx, p.pan ?? 0);

  if (type === 'water') {
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 0.7;
  } else if (type === 'wind') {
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 1;
  } else {
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    filter.Q.value = 0.5;
  }

  // 遅いフィルタモジュレーション (水流・風の変化感)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.05;
  lfoGain.gain.value = type === 'water' ? 800 : (type === 'wind' ? 200 : 1500);
  lfo.connect(lfoGain).connect(filter.frequency);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(p.volume, startTime + p.attack);

  src.connect(filter).connect(gain).connect(panner).connect(dest);
  src.start(startTime);
  lfo.start(startTime);

  return {
    stop(releaseTime = ctx.currentTime) {
      gain.gain.cancelScheduledValues(releaseTime);
      gain.gain.setValueAtTime(gain.gain.value, releaseTime);
      gain.gain.linearRampToValueAtTime(0.0001, releaseTime + p.release);
      src.stop(releaseTime + p.release + 0.1);
      lfo.stop(releaseTime + p.release + 0.1);
    },
    setVolume(v, atTime = ctx.currentTime) {
      gain.gain.linearRampToValueAtTime(v, atTime + 1);
    },
    nodes: [src, filter, gain, panner, lfo, lfoGain],
  };
}

// ─────────────────────────────────────────────
// Voice Type Registry
// ─────────────────────────────────────────────
export type VoiceType = 'pure-sine' | 'crystal-bowl' | 'tibetan-bowl' | 'drone' | 'angel-choir';

export const VOICE_NAMES: Record<VoiceType, { ja: string; en: string }> = {
  'pure-sine': { ja: '純粋サイン波', en: 'Pure Sine' },
  'crystal-bowl': { ja: 'クリスタル・ボウル', en: 'Crystal Bowl' },
  'tibetan-bowl': { ja: 'チベタン・ボウル', en: 'Tibetan Bowl' },
  'drone': { ja: 'ドローン', en: 'Drone' },
  'angel-choir': { ja: '天使の合唱', en: 'Angel Choir' },
};

export function makeVoice(
  type: VoiceType,
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: VoiceParams,
): Voice {
  switch (type) {
    case 'pure-sine':    return pureSine(ctx, dest, startTime, p);
    case 'crystal-bowl': return crystalBowl(ctx, dest, startTime, p);
    case 'tibetan-bowl': return tibetanBowl(ctx, dest, startTime, p);
    case 'drone':        return drone(ctx, dest, startTime, p);
    case 'angel-choir':  return angelChoir(ctx, dest, startTime, p);
  }
}
