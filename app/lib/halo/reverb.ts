// ─────────────────────────────────────────────
// KUON HALO — Algorithmic Reverb
// ─────────────────────────────────────────────
// 大聖堂・洞窟・宇宙空間レベルの長いリバーブを生成。
// IR (インパルス応答) を JS で動的生成 → ConvolverNode に流し込む。
// ─────────────────────────────────────────────

export type ReverbPreset = 'cathedral' | 'cave' | 'cosmos' | 'crystal-hall' | 'forest';

export type ReverbConfig = {
  decay: number;           // 秒 (リバーブ尾の長さ・1-15)
  preDelay: number;        // 秒 (0-0.2)
  brightness: number;      // 0-1
  stereoSpread: number;    // 0-1
};

// プリセット
export const REVERB_PRESETS: Record<ReverbPreset, ReverbConfig> = {
  cathedral:    { decay: 8,  preDelay: 0.05, brightness: 0.3, stereoSpread: 0.9 },
  cave:         { decay: 12, preDelay: 0.08, brightness: 0.2, stereoSpread: 0.7 },
  cosmos:       { decay: 15, preDelay: 0.15, brightness: 0.5, stereoSpread: 1.0 },
  'crystal-hall': { decay: 6, preDelay: 0.02, brightness: 0.7, stereoSpread: 0.85 },
  forest:       { decay: 4,  preDelay: 0.03, brightness: 0.5, stereoSpread: 0.8 },
};

// ─────────────────────────────────────────────
// IR Generator (Schroeder-style: 指数減衰ノイズ)
// ─────────────────────────────────────────────
function generateIR(
  ctx: BaseAudioContext,
  cfg: ReverbConfig,
): AudioBuffer {
  const sr = ctx.sampleRate;
  const decaySamples = Math.floor(cfg.decay * sr);
  const preDelaySamples = Math.floor(cfg.preDelay * sr);
  const len = decaySamples + preDelaySamples;
  const buf = ctx.createBuffer(2, len, sr);

  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    // ステレオ分離: 左右で異なるノイズシード
    const seed = ch === 0 ? 1 : 1.7;
    let lpState = 0;  // brightness 用簡易ローパス

    for (let i = 0; i < len; i++) {
      if (i < preDelaySamples) {
        data[i] = 0;
        continue;
      }
      const t = (i - preDelaySamples) / decaySamples;
      // 指数減衰
      const env = Math.pow(1 - t, 2);
      // ノイズ
      const noise = (Math.random() * 2 - 1) * env * seed * 0.5;
      // ローパス (brightness 反映)
      const cutoff = 0.05 + cfg.brightness * 0.4;
      lpState = lpState * (1 - cutoff) + noise * cutoff;
      data[i] = lpState;
    }
    // ステレオ広がり調整: 片チャンネルを少し遅らせる
    if (ch === 1 && cfg.stereoSpread > 0) {
      const offset = Math.floor(0.001 * sr * cfg.stereoSpread);
      for (let i = len - 1; i >= offset; i--) {
        data[i] = data[i - offset];
      }
    }
  }

  return buf;
}

// ─────────────────────────────────────────────
// Reverb Node Builder
// ─────────────────────────────────────────────
export function createReverb(
  ctx: AudioContext | OfflineAudioContext,
  cfg: ReverbConfig,
  wetMix: number,    // 0-1
): { input: AudioNode; output: AudioNode } {
  const input = ctx.createGain();
  const dry = ctx.createGain();
  const wet = ctx.createGain();
  const convolver = ctx.createConvolver();
  const output = ctx.createGain();

  convolver.buffer = generateIR(ctx, cfg);

  dry.gain.value = 1 - wetMix;
  wet.gain.value = wetMix;

  input.connect(dry).connect(output);
  input.connect(convolver).connect(wet).connect(output);

  return { input, output };
}

export function createReverbFromPreset(
  ctx: AudioContext | OfflineAudioContext,
  preset: ReverbPreset,
  wetMix: number,
): { input: AudioNode; output: AudioNode } {
  return createReverb(ctx, REVERB_PRESETS[preset], wetMix);
}
