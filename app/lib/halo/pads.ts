// ─────────────────────────────────────────────
// KUON HALO v2 — Warm Pad Voice Library
// ─────────────────────────────────────────────
// Hiroshi Yoshimura / Joep Beving / Nils Frahm / Max Richter 系の
// 暖かい・透明・天上的な音色を Web Audio API で合成。
//
// 各ボイス: 1 つの周波数を持続させる関数。コード進行で複数ノート同時起動。
// ─────────────────────────────────────────────

export type PadParams = {
  freq: number;          // Hz
  volume: number;        // 0-1
  attack: number;        // 秒
  release: number;       // 秒
  pan: number;           // -1 to 1
  brightness?: number;   // 0-1 (default 0.4 で十分にダーク)
  warmth?: number;       // 0-1 (default 0.7・1 = 最も柔らかく耳に優しい)
};

export type PadVoice = {
  stop(releaseTime?: number): void;
  setVolume(v: number, atTime?: number): void;
};

// ─────────────────────────────────────────────
// Helper: stereo panner
// ─────────────────────────────────────────────
function pan(ctx: BaseAudioContext, p: number): StereoPannerNode {
  const n = ctx.createStereoPanner();
  n.pan.value = Math.max(-1, Math.min(1, p));
  return n;
}

// ─────────────────────────────────────────────
// Helper: soft stereo chorus (3-tap, 長いタップ・ゆっくりレート)
// 耳に優しいゆったり広がり感
// ─────────────────────────────────────────────
function applyChorus(
  ctx: AudioContext | OfflineAudioContext,
  input: AudioNode,
  output: AudioNode,
  depth: number = 0.012,        // 12ms (was 5ms) - もっと深く
  rate: number = 0.18,          // 0.18 Hz (was 0.3) - もっと遅く
): void {
  input.connect(output);

  const taps = [
    { delay: 0.018, rate: rate * 0.6, pan: -0.7 },  // やや長く・遅く
    { delay: 0.028, rate: rate * 0.9, pan:  0.0 },
    { delay: 0.040, rate: rate * 1.2, pan:  0.7 },  // 40ms = 立体感重視
  ];

  for (const tap of taps) {
    const d = ctx.createDelay(0.15);
    d.delayTime.value = tap.delay;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = tap.rate;
    lfoGain.gain.value = depth;
    lfo.connect(lfoGain).connect(d.delayTime);
    lfo.start();

    const tapGain = ctx.createGain();
    tapGain.gain.value = 0.35;
    const tapPan = pan(ctx, tap.pan);

    input.connect(d).connect(tapGain).connect(tapPan).connect(output);
  }
}

// ─────────────────────────────────────────────
// Helper: tanh ソフトサチュレーション (アナログ温感)
// 耳に刺さる高域ピークを穏やかに丸める
// ─────────────────────────────────────────────
function applyWarmth(
  ctx: AudioContext | OfflineAudioContext,
  input: AudioNode,
  output: AudioNode,
  amount: number = 0.7,  // 0-1 (1 = 最大温感)
): WaveShaperNode {
  const shaper = ctx.createWaveShaper();
  const samples = 4096;
  const curve = new Float32Array(samples);
  const k = 1 + amount * 3;  // ドライブ量
  for (let i = 0; i < samples; i++) {
    const x = (i / samples) * 2 - 1;
    curve[i] = Math.tanh(x * k) / Math.tanh(k);
  }
  shaper.curve = curve;
  shaper.oversample = '2x';

  // 温感後にローシェルフで低域を少し増やす (アナログの暖かさ)
  const lowShelf = ctx.createBiquadFilter();
  lowShelf.type = 'lowshelf';
  lowShelf.frequency.value = 250;
  lowShelf.gain.value = 2 + amount * 2;  // +2〜+4 dB

  // 同時に高域を少しカット (耳に優しく)
  const highShelf = ctx.createBiquadFilter();
  highShelf.type = 'highshelf';
  highShelf.frequency.value = 6000;
  highShelf.gain.value = -3 - amount * 4;  // -3〜-7 dB

  input.connect(shaper).connect(lowShelf).connect(highShelf).connect(output);
  return shaper;
}

// ─────────────────────────────────────────────
// Voice 1: Warm Analog Pad (大幅ウォーム化版・耳あたりの良いソフトパッド)
// - サイン × 3 + ノコギリ × 2 のブレンド (saw だけだと刺さる)
// - サブオクターブ サイン (温感の土台)
// - LPF カットオフ低め (400-1100Hz) + Q 低め
// - tanh サチュレーション (アナログ感)
// - ハイシェルフカット (耳に優しく)
// ─────────────────────────────────────────────
export function warmAnalogPad(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: PadParams,
): PadVoice {
  const warmth = p.warmth ?? 0.7;
  const brightness = p.brightness ?? 0.4;

  const oscs: OscillatorNode[] = [];
  const sumGain = ctx.createGain();
  sumGain.gain.value = 0.28;

  // サイン × 3 (温感の主役・デチューン少なめ = 静かなビート)
  for (const d of [-4, 0, 4]) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = p.freq;
    osc.detune.value = d;
    const g = ctx.createGain();
    g.gain.value = 0.5;  // サイン優勢
    osc.connect(g).connect(sumGain);
    oscs.push(osc);
  }

  // ノコギリ × 2 (倍音の彩り・控えめ)
  for (const d of [-3, 3]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = p.freq;
    osc.detune.value = d;
    const g = ctx.createGain();
    g.gain.value = 0.18 * (1 - warmth * 0.5);  // warmth が高いほど saw を控える
    osc.connect(g).connect(sumGain);
    oscs.push(osc);
  }

  // サブオクターブ サイン (温感の土台)
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.value = p.freq * 0.5;
  subGain.gain.value = 0.35 + warmth * 0.15;  // 0.35-0.5
  sub.connect(subGain).connect(sumGain);
  oscs.push(sub);

  // LPF (warmth が高いほどカットオフ低い)
  const lpf1 = ctx.createBiquadFilter();
  const lpf2 = ctx.createBiquadFilter();
  lpf1.type = 'lowpass';
  lpf2.type = 'lowpass';
  const baseCutoff = 400 + brightness * 700 - warmth * 250;  // 150-1100Hz
  lpf1.frequency.value = Math.max(200, baseCutoff);
  lpf2.frequency.value = Math.max(250, baseCutoff * 1.4);
  lpf1.Q.value = 0.5;
  lpf2.Q.value = 0.4;

  // 遅いフィルタモジュレーション
  const filterLfo = ctx.createOscillator();
  const filterLfoGain = ctx.createGain();
  filterLfo.frequency.value = 0.07;
  filterLfoGain.gain.value = baseCutoff * 0.15;
  filterLfo.connect(filterLfoGain).connect(lpf1.frequency);

  const warmthIn = ctx.createGain();
  const chorusIn = ctx.createGain();
  const envGain = ctx.createGain();
  const panner = pan(ctx, p.pan);

  envGain.gain.setValueAtTime(0, startTime);
  envGain.gain.linearRampToValueAtTime(p.volume, startTime + Math.max(p.attack, 2));

  sumGain.connect(lpf1).connect(lpf2).connect(warmthIn);
  applyWarmth(ctx, warmthIn, chorusIn, warmth);
  applyChorus(ctx, chorusIn, envGain, 0.012, 0.18);
  envGain.connect(panner).connect(dest);

  oscs.forEach((o) => o.start(startTime));
  filterLfo.start(startTime);

  return {
    stop(rt = ctx.currentTime) {
      const r = Math.max(p.release, 5);
      envGain.gain.cancelScheduledValues(rt);
      envGain.gain.setValueAtTime(envGain.gain.value, rt);
      envGain.gain.linearRampToValueAtTime(0.0001, rt + r);
      oscs.forEach((o) => { try { o.stop(rt + r + 0.1); } catch { /* */ } });
      try { filterLfo.stop(rt + r + 0.1); } catch { /* */ }
    },
    setVolume(v, at = ctx.currentTime) {
      envGain.gain.linearRampToValueAtTime(v, at + 1);
    },
  };
}

// ─────────────────────────────────────────────
// Voice 2: String Ensemble (大幅ウォーム化)
// - サイン × 3 + ノコギリ × 2 のブレンド (saw のみだと弦の擦弦音が刺さる)
// - ローパス中心 (バンドパスは耳に痛いので廃止)
// - サブオクターブで暖かさ
// - tanh 飽和でアナログ感
// ─────────────────────────────────────────────
export function stringEnsemble(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: PadParams,
): PadVoice {
  const warmth = p.warmth ?? 0.7;
  const brightness = p.brightness ?? 0.4;

  const oscs: OscillatorNode[] = [];
  const sumGain = ctx.createGain();
  sumGain.gain.value = 0.18;

  // サイン × 3 (主役の暖かい弦の体)
  for (const d of [-8, 0, 8]) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = p.freq;
    osc.detune.value = d;
    const g = ctx.createGain();
    g.gain.value = 0.45;
    osc.connect(g).connect(sumGain);
    oscs.push(osc);
  }

  // ノコギリ × 2 (弦の倍音感だけ控えめに乗せる)
  for (const d of [-6, 6]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = p.freq;
    osc.detune.value = d;
    const g = ctx.createGain();
    g.gain.value = 0.15 * (1 - warmth * 0.5);
    osc.connect(g).connect(sumGain);
    oscs.push(osc);
  }

  // サブオクターブ (チェロのような体)
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.value = p.freq * 0.5;
  subGain.gain.value = 0.3 + warmth * 0.15;
  sub.connect(subGain).connect(sumGain);
  oscs.push(sub);

  // ローパス (バンドパス廃止・刺さらない)
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = Math.max(300, 700 + brightness * 800 - warmth * 300);
  lpf.Q.value = 0.4;

  // ハイパス (mud 除去)
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 60;

  // 軽い弓奏ビブラート (柔らかく)
  const vib = ctx.createOscillator();
  const vibGain = ctx.createGain();
  vib.frequency.value = 3.5;  // やや遅め
  vibGain.gain.value = 2;     // 控えめ
  vib.connect(vibGain);
  oscs.forEach((o) => vibGain.connect(o.detune));

  const warmthIn = ctx.createGain();
  const chorusIn = ctx.createGain();
  const envGain = ctx.createGain();
  const panner = pan(ctx, p.pan);

  envGain.gain.setValueAtTime(0, startTime);
  envGain.gain.linearRampToValueAtTime(p.volume * 0.55, startTime + Math.max(p.attack, 5));

  sumGain.connect(hp).connect(lpf).connect(warmthIn);
  applyWarmth(ctx, warmthIn, chorusIn, warmth);
  applyChorus(ctx, chorusIn, envGain, 0.014, 0.15);
  envGain.connect(panner).connect(dest);

  oscs.forEach((o) => o.start(startTime));
  vib.start(startTime);

  return {
    stop(rt = ctx.currentTime) {
      const r = Math.max(p.release, 7);
      envGain.gain.cancelScheduledValues(rt);
      envGain.gain.setValueAtTime(envGain.gain.value, rt);
      envGain.gain.linearRampToValueAtTime(0.0001, rt + r);
      oscs.forEach((o) => { try { o.stop(rt + r + 0.1); } catch { /* */ } });
      try { vib.stop(rt + r + 0.1); } catch { /* */ }
    },
    setVolume(v, at = ctx.currentTime) {
      envGain.gain.linearRampToValueAtTime(v, at + 1);
    },
  };
}

// ─────────────────────────────────────────────
// Voice 3: Felt Piano (Joep Beving / Nils Frahm 風・フェルトピアノ)
// 短い柔らかいアタック + 長い自然減衰 + 微細な inharmonic 倍音
// 「コード変化の瞬間に 1 度だけ鳴らす」用途
// ─────────────────────────────────────────────
export function feltPiano(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: PadParams,
): PadVoice {
  // ピアノのような部分音 (基音 + 微妙にデチューンした倍音層)
  const partials = [
    { ratio: 1.0,  amp: 1.0,  decay: 6.0, type: 'sine'     as OscillatorType },
    { ratio: 2.0,  amp: 0.4,  decay: 4.0, type: 'sine'     as OscillatorType },
    { ratio: 3.01, amp: 0.18, decay: 2.5, type: 'triangle' as OscillatorType },
    { ratio: 4.02, amp: 0.08, decay: 1.5, type: 'sine'     as OscillatorType },
    { ratio: 5.04, amp: 0.04, decay: 1.0, type: 'triangle' as OscillatorType },
  ];

  const sumGain = ctx.createGain();
  sumGain.gain.value = 0.5;
  const oscs: OscillatorNode[] = [];

  for (const part of partials) {
    const osc = ctx.createOscillator();
    osc.type = part.type;
    osc.frequency.value = p.freq * part.ratio;
    const partGain = ctx.createGain();
    // ピアノ的エンベロープ: 5ms attack + 自然指数減衰
    partGain.gain.setValueAtTime(0, startTime);
    partGain.gain.linearRampToValueAtTime(part.amp * p.volume, startTime + 0.005);
    partGain.gain.exponentialRampToValueAtTime(0.001, startTime + part.decay);
    osc.connect(partGain).connect(sumGain);
    oscs.push(osc);
  }

  // フェルト感: 高域を少しカット
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 3000 + (p.brightness ?? 0.5) * 2000;
  lpf.Q.value = 0.5;

  const panner = pan(ctx, p.pan);
  sumGain.connect(lpf).connect(panner).connect(dest);

  oscs.forEach((o) => o.start(startTime));
  // ピアノは「1 ヒット」なので一定時間後に自然停止
  oscs.forEach((o) => o.stop(startTime + 8));

  return {
    stop(rt = ctx.currentTime) {
      // すでに自然減衰中なので追加処理不要
      try { oscs.forEach((o) => o.stop(rt + 0.5)); } catch { /* already stopped */ }
    },
    setVolume(_v, _at) { /* no-op: 1 shot */ },
  };
}

// ─────────────────────────────────────────────
// Voice 4: Glass Pad (大幅ソフト化)
// 高次倍音の音量を大きく削減・LPF 追加で耳に優しく
// ─────────────────────────────────────────────
export function glassPad(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: PadParams,
): PadVoice {
  const warmth = p.warmth ?? 0.7;
  const partials = [
    { ratio: 1.0,  amp: 0.7,                            detune: 0 },
    { ratio: 2.0,  amp: 0.18,                           detune: 5 },
    { ratio: 3.0,  amp: 0.06 * (1 - warmth * 0.5),      detune: -3 },
    { ratio: 4.0,  amp: 0.025 * (1 - warmth * 0.6),     detune: 7 },
    { ratio: 6.0,  amp: 0.012 * (1 - warmth * 0.7),     detune: -5 }, // きらめきを大幅削減
  ];

  const oscs: OscillatorNode[] = [];
  const sumGain = ctx.createGain();
  sumGain.gain.value = 0.4;

  for (const part of partials) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = p.freq * part.ratio;
    osc.detune.value = part.detune;
    const partGain = ctx.createGain();
    partGain.gain.value = part.amp;
    osc.connect(partGain).connect(sumGain);
    oscs.push(osc);
  }

  // きらめき LFO (高次倍音だけ揺らす)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.18;
  lfoGain.gain.value = 4;
  lfo.connect(lfoGain);
  // 高次倍音 (index 3, 4) に LFO 適用
  lfoGain.connect(oscs[3].detune);
  lfoGain.connect(oscs[4].detune);

  const envGain = ctx.createGain();
  const panner = pan(ctx, p.pan);
  envGain.gain.setValueAtTime(0, startTime);
  envGain.gain.linearRampToValueAtTime(p.volume, startTime + Math.max(p.attack, 3));

  // ソフト化のための LPF
  const softLpf = ctx.createBiquadFilter();
  softLpf.type = 'lowpass';
  softLpf.frequency.value = 2500 + (1 - warmth) * 2000;  // warmth 高いほど低く (耳優しく)
  softLpf.Q.value = 0.4;

  sumGain.connect(softLpf).connect(envGain).connect(panner).connect(dest);
  oscs.forEach((o) => o.start(startTime));
  lfo.start(startTime);

  return {
    stop(rt = ctx.currentTime) {
      const r = Math.max(p.release, 5);
      envGain.gain.cancelScheduledValues(rt);
      envGain.gain.setValueAtTime(envGain.gain.value, rt);
      envGain.gain.exponentialRampToValueAtTime(0.0001, rt + r);
      oscs.forEach((o) => { try { o.stop(rt + r + 0.1); } catch { /* */ } });
      try { lfo.stop(rt + r + 0.1); } catch { /* */ }
    },
    setVolume(v, at = ctx.currentTime) {
      envGain.gain.linearRampToValueAtTime(v, at + 1);
    },
  };
}

// ─────────────────────────────────────────────
// Voice 5: Voice Pad (女性ボーカル風・フォルマント)
// 「ああ」の母音風スウィープ
// ─────────────────────────────────────────────
export function voicePad(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: PadParams,
): PadVoice {
  // 3 つのデチューンノコギリ
  const oscs: OscillatorNode[] = [];
  for (const d of [-5, 0, 5]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = p.freq;
    osc.detune.value = d;
    oscs.push(osc);
  }

  // フォルマント (「あ」の母音: F1=800, F2=1200)
  const formant1 = ctx.createBiquadFilter();
  const formant2 = ctx.createBiquadFilter();
  formant1.type = 'bandpass';
  formant2.type = 'bandpass';
  formant1.frequency.value = 800;
  formant2.frequency.value = 1200;
  formant1.Q.value = 6;
  formant2.Q.value = 4;

  const f1Gain = ctx.createGain();
  const f2Gain = ctx.createGain();
  f1Gain.gain.value = 0.6;
  f2Gain.gain.value = 0.4;

  // 軽いビブラート
  const vib = ctx.createOscillator();
  const vibGain = ctx.createGain();
  vib.frequency.value = 5;
  vibGain.gain.value = 4;
  vib.connect(vibGain);
  oscs.forEach((o) => vibGain.connect(o.detune));

  // ハイカット
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 2500;

  const sumGain = ctx.createGain();
  sumGain.gain.value = 0.25;

  oscs.forEach((o) => {
    o.connect(formant1).connect(f1Gain).connect(sumGain);
    o.connect(formant2).connect(f2Gain).connect(sumGain);
  });

  const envGain = ctx.createGain();
  const panner = pan(ctx, p.pan);
  envGain.gain.setValueAtTime(0, startTime);
  envGain.gain.linearRampToValueAtTime(p.volume * 0.5, startTime + Math.max(p.attack, 4));

  sumGain.connect(lpf).connect(envGain).connect(panner).connect(dest);
  oscs.forEach((o) => o.start(startTime));
  vib.start(startTime);

  return {
    stop(rt = ctx.currentTime) {
      const r = Math.max(p.release, 5);
      envGain.gain.cancelScheduledValues(rt);
      envGain.gain.setValueAtTime(envGain.gain.value, rt);
      envGain.gain.linearRampToValueAtTime(0.0001, rt + r);
      oscs.forEach((o) => o.stop(rt + r + 0.1));
      vib.stop(rt + r + 0.1);
    },
    setVolume(v, at = ctx.currentTime) {
      envGain.gain.linearRampToValueAtTime(v, at + 1);
    },
  };
}

// ─────────────────────────────────────────────
// Pad Voice Type Registry
// ─────────────────────────────────────────────
export type PadType = 'warm-analog' | 'string-ensemble' | 'felt-piano' | 'glass-pad' | 'voice-pad';

export const PAD_NAMES: Record<PadType, { ja: string; en: string }> = {
  'warm-analog':     { ja: 'ウォーム・アナログ・パッド', en: 'Warm Analog Pad' },
  'string-ensemble': { ja: 'ストリングス・アンサンブル', en: 'String Ensemble' },
  'felt-piano':      { ja: 'フェルト・ピアノ', en: 'Felt Piano' },
  'glass-pad':       { ja: 'グラス・パッド', en: 'Glass Pad' },
  'voice-pad':       { ja: 'ヴォイス・パッド', en: 'Voice Pad' },
};

export function makePadVoice(
  type: PadType,
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  p: PadParams,
): PadVoice {
  switch (type) {
    case 'warm-analog':     return warmAnalogPad(ctx, dest, startTime, p);
    case 'string-ensemble': return stringEnsemble(ctx, dest, startTime, p);
    case 'felt-piano':      return feltPiano(ctx, dest, startTime, p);
    case 'glass-pad':       return glassPad(ctx, dest, startTime, p);
    case 'voice-pad':       return voicePad(ctx, dest, startTime, p);
  }
}
