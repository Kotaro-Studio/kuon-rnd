// ─────────────────────────────────────────────
// KUON DRUM MACHINE — Synthesis Engine
// ─────────────────────────────────────────────
// 全ボイスを Web Audio API + OscillatorNode + ノイズで合成。
// サンプルファイル不要・ロード時間ゼロ・著作権完全クリア。
// 各ボイスは (ctx, time, params) を受け取り、指定時刻に発音する純関数。
// ─────────────────────────────────────────────

export type PlayParams = {
  tune: number;     // 0.5 - 2.0 (ピッチ倍率)
  decay: number;    // 0.05 - 2.0 (秒)
  volume: number;   // 0 - 1
  pan: number;      // -1 (L) - 1 (R)
  accent?: boolean; // true で +6dB
};

export type VoiceFn = (
  ctx: AudioContext,
  destination: AudioNode,
  time: number,
  params: PlayParams,
) => void;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function panNode(ctx: AudioContext, pan: number): StereoPannerNode {
  const p = ctx.createStereoPanner();
  p.pan.value = Math.max(-1, Math.min(1, pan));
  return p;
}

function applyAccent(volume: number, accent?: boolean): number {
  return accent ? Math.min(1, volume * 1.5) : volume; // +~3.5dB
}

// 1 サンプルだけのノイズバッファをキャッシュ（毎回生成しない）
let _noiseBuf: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (_noiseBuf && _noiseBuf.sampleRate === ctx.sampleRate) return _noiseBuf;
  const len = Math.floor(ctx.sampleRate * 1.5);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  _noiseBuf = buf;
  return buf;
}

// ─────────────────────────────────────────────
// Voice: Kick (Electronic / TR-808 風)
// サイン波 + ピッチエンベロープ + クリック
// ─────────────────────────────────────────────
export const kickElectronic: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.1, params.decay);

  // ボディ (サイン波 + ピッチ低下)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150 * params.tune, time);
  osc.frequency.exponentialRampToValueAtTime(40 * params.tune, time + 0.06);
  oscGain.gain.setValueAtTime(vol, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  // クリック (短いノイズバースト)
  const click = ctx.createBufferSource();
  click.buffer = getNoiseBuffer(ctx);
  const clickGain = ctx.createGain();
  const clickFilter = ctx.createBiquadFilter();
  clickFilter.type = 'lowpass';
  clickFilter.frequency.value = 4000;
  clickGain.gain.setValueAtTime(vol * 0.3, time);
  clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.005);

  const panner = panNode(ctx, params.pan);
  osc.connect(oscGain).connect(panner);
  click.connect(clickFilter).connect(clickGain).connect(panner);
  panner.connect(dest);

  osc.start(time);
  osc.stop(time + decay + 0.01);
  click.start(time);
  click.stop(time + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Kick Acoustic (ジャズ用・柔らかい)
// ─────────────────────────────────────────────
export const kickAcoustic: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.15, params.decay);

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(80 * params.tune, time);
  osc.frequency.exponentialRampToValueAtTime(45 * params.tune, time + 0.1);
  oscGain.gain.setValueAtTime(vol, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  // 軽いサブハーモニック
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(40 * params.tune, time);
  subGain.gain.setValueAtTime(vol * 0.4, time);
  subGain.gain.exponentialRampToValueAtTime(0.001, time + decay * 0.6);

  const panner = panNode(ctx, params.pan);
  osc.connect(oscGain).connect(panner);
  sub.connect(subGain).connect(panner);
  panner.connect(dest);

  osc.start(time); osc.stop(time + decay + 0.01);
  sub.start(time); sub.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: 808 Sub Kick (Trap 用)
// ─────────────────────────────────────────────
export const kick808Sub: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.4, params.decay);

  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(110 * params.tune, time);
  osc.frequency.exponentialRampToValueAtTime(35 * params.tune, time + 0.15);
  oscGain.gain.setValueAtTime(vol, time);
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  osc.connect(oscGain).connect(panner);
  panner.connect(dest);

  osc.start(time); osc.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Snare (Electronic)
// ノイズ + 200Hz トライアングル
// ─────────────────────────────────────────────
export const snareElectronic: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.08, params.decay);

  // トーン部
  const tone = ctx.createOscillator();
  const toneGain = ctx.createGain();
  tone.type = 'triangle';
  tone.frequency.value = 200 * params.tune;
  toneGain.gain.setValueAtTime(vol * 0.5, time);
  toneGain.gain.exponentialRampToValueAtTime(0.001, time + decay * 0.4);

  // ノイズ部
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 1500;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vol * 0.7, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  tone.connect(toneGain).connect(panner);
  noise.connect(noiseFilter).connect(noiseGain).connect(panner);
  panner.connect(dest);

  tone.start(time); tone.stop(time + decay + 0.01);
  noise.start(time); noise.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Brush Snare (Jazz 用・柔らかい)
// ─────────────────────────────────────────────
export const snareBrush: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.15, params.decay);

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2500 * params.tune;
  filter.Q.value = 1.5;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, time);
  noiseGain.gain.linearRampToValueAtTime(vol * 0.6, time + 0.005);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  noise.connect(filter).connect(noiseGain).connect(panner);
  panner.connect(dest);

  noise.start(time); noise.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Closed Hi-Hat
// ─────────────────────────────────────────────
export const hatClosed: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.04, params.decay);

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000 * params.tune;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  noise.connect(filter).connect(gain).connect(panner);
  panner.connect(dest);

  noise.start(time); noise.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Open Hi-Hat
// ─────────────────────────────────────────────
export const hatOpen: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.2, params.decay);

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 5000 * params.tune;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.45, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  noise.connect(filter).connect(gain).connect(panner);
  panner.connect(dest);

  noise.start(time); noise.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Ride Cymbal (Jazz 用)
// ─────────────────────────────────────────────
export const ride: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.4, params.decay);

  // ベル音 (鋭い倍音)
  const bell = ctx.createOscillator();
  const bellGain = ctx.createGain();
  bell.type = 'square';
  bell.frequency.value = 800 * params.tune;
  bellGain.gain.setValueAtTime(vol * 0.15, time);
  bellGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

  // シマー (ノイズ + バンドパス)
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 6000 * params.tune;
  filter.Q.value = 0.5;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vol * 0.3, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  bell.connect(bellGain).connect(panner);
  noise.connect(filter).connect(noiseGain).connect(panner);
  panner.connect(dest);

  bell.start(time); bell.stop(time + 0.12);
  noise.start(time); noise.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Clap
// ─────────────────────────────────────────────
export const clap: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.15, params.decay);

  // 4 連射ノイズで人間の手拍子っぽさを再現
  const offsets = [0, 0.008, 0.016, 0.024];
  const panner = panNode(ctx, params.pan);
  panner.connect(dest);

  for (const offset of offsets) {
    const t = time + offset;
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500 * params.tune;
    filter.Q.value = 1;
    const gain = ctx.createGain();
    const burstDecay = offset === 0.024 ? decay : 0.01;
    gain.gain.setValueAtTime(vol * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + burstDecay);

    noise.connect(filter).connect(gain).connect(panner);
    noise.start(t); noise.stop(t + burstDecay + 0.01);
  }
};

// ─────────────────────────────────────────────
// Voice: Snap (Trap 用クラップ代替)
// ─────────────────────────────────────────────
export const snap: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.06, params.decay);

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3000 * params.tune;
  filter.Q.value = 4;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.6, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  noise.connect(filter).connect(gain).connect(panner);
  panner.connect(dest);

  noise.start(time); noise.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Tom (Low / Mid)
// ─────────────────────────────────────────────
export function tomMaker(baseFreq: number): VoiceFn {
  return (ctx, dest, time, params) => {
    const vol = applyAccent(params.volume, params.accent);
    const decay = Math.max(0.2, params.decay);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * params.tune, time);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * params.tune * 0.6, time + 0.15);
    oscGain.gain.setValueAtTime(vol, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    // 軽いノイズ層
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = baseFreq * 4 * params.tune;
    filter.Q.value = 1;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.15, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    const panner = panNode(ctx, params.pan);
    osc.connect(oscGain).connect(panner);
    noise.connect(filter).connect(noiseGain).connect(panner);
    panner.connect(dest);

    osc.start(time); osc.stop(time + decay + 0.01);
    noise.start(time); noise.stop(time + 0.06);
  };
}

export const tomLow = tomMaker(80);
export const tomMid = tomMaker(140);
export const tomHigh = tomMaker(220);

// ─────────────────────────────────────────────
// Voice: Cowbell (TR-808 風 2 矩形波)
// ─────────────────────────────────────────────
export const cowbell: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.15, params.decay);

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = 'square';
  osc2.type = 'square';
  osc1.frequency.value = 560 * params.tune;
  osc2.frequency.value = 845 * params.tune;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800 * params.tune;
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.25, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  osc1.connect(filter); osc2.connect(filter);
  filter.connect(gain).connect(panner);
  panner.connect(dest);

  osc1.start(time); osc1.stop(time + decay + 0.01);
  osc2.start(time); osc2.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Rim Shot
// ─────────────────────────────────────────────
export const rim: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.05, params.decay);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 1800 * params.tune;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2500 * params.tune;
  filter.Q.value = 5;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  osc.connect(filter).connect(gain).connect(panner);
  panner.connect(dest);

  osc.start(time); osc.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Conga (高/低)
// ─────────────────────────────────────────────
export function congaMaker(baseFreq: number): VoiceFn {
  return (ctx, dest, time, params) => {
    const vol = applyAccent(params.volume, params.accent);
    const decay = Math.max(0.1, params.decay);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * params.tune, time);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8 * params.tune, time + 0.05);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    // アタック (ノイズ短)
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = baseFreq * 6 * params.tune;
    filter.Q.value = 1.5;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(vol * 0.3, time);
    nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

    const panner = panNode(ctx, params.pan);
    osc.connect(gain).connect(panner);
    noise.connect(filter).connect(nGain).connect(panner);
    panner.connect(dest);

    osc.start(time); osc.stop(time + decay + 0.01);
    noise.start(time); noise.stop(time + 0.02);
  };
}

export const congaHigh = congaMaker(280);
export const congaLow = congaMaker(180);

// ─────────────────────────────────────────────
// Voice: Tambourine (ファンク用)
// ─────────────────────────────────────────────
export const tambourine: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.1, params.decay);

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 8000 * params.tune;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  noise.connect(filter).connect(gain).connect(panner);
  panner.connect(dest);

  noise.start(time); noise.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Crash Cymbal
// ─────────────────────────────────────────────
export const crash: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.8, params.decay);

  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 4000 * params.tune;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  noise.connect(filter).connect(gain).connect(panner);
  panner.connect(dest);

  noise.start(time); noise.stop(time + decay + 0.01);
};

// ─────────────────────────────────────────────
// Voice: Hi-Hat 16th Roll (Trap 用)
// ─────────────────────────────────────────────
export const hatRoll: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  // 32 分 4 連射
  const panner = panNode(ctx, params.pan);
  panner.connect(dest);
  for (let i = 0; i < 4; i++) {
    const t = time + i * 0.03;
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000 * params.tune;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    noise.connect(filter).connect(gain).connect(panner);
    noise.start(t); noise.stop(t + 0.04);
  }
};

// ─────────────────────────────────────────────
// Voice: Clave (キューバ・木のスティック)
// ─────────────────────────────────────────────
export const clave: VoiceFn = (ctx, dest, time, params) => {
  const vol = applyAccent(params.volume, params.accent);
  const decay = Math.max(0.05, params.decay);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 1200 * params.tune;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1400 * params.tune;
  filter.Q.value = 8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * 0.55, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

  const panner = panNode(ctx, params.pan);
  osc.connect(filter).connect(gain).connect(panner);
  panner.connect(dest);

  osc.start(time); osc.stop(time + decay + 0.01);
};
