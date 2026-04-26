// ─────────────────────────────────────────────
// KUON HALO — Binaural Beat Generator
// ─────────────────────────────────────────────
// 左右で異なる周波数を再生 → 脳が差分を検出 → 脳波同調
// デルタ (0.5-4Hz) = 深い眠り
// シータ (4-8Hz) = 瞑想・直観
// アルファ (8-12Hz) = リラックス
// ベータ (12-30Hz) = 集中
// ガンマ (30-100Hz) = 高次意識
//
// 必ずヘッドフォン使用が前提 (LP に明記)
// ─────────────────────────────────────────────

export type BinauralVoice = {
  stop(releaseTime?: number): void;
  setVolume(v: number, atTime?: number): void;
  setBeat(hz: number, atTime?: number): void;
};

export function binauralBeat(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  carrier: number,        // 基本周波数 (200-800Hz 推奨)
  beatHz: number,         // 差分 = 脳波周波数 (0.5-100Hz)
  volume: number,
  attack: number = 5,
): BinauralVoice {
  const oscL = ctx.createOscillator();
  const oscR = ctx.createOscillator();
  const gainL = ctx.createGain();
  const gainR = ctx.createGain();
  const merger = ctx.createChannelMerger(2);

  oscL.type = 'sine';
  oscR.type = 'sine';
  oscL.frequency.value = carrier - beatHz / 2;
  oscR.frequency.value = carrier + beatHz / 2;

  gainL.gain.setValueAtTime(0, startTime);
  gainL.gain.linearRampToValueAtTime(volume, startTime + attack);
  gainR.gain.setValueAtTime(0, startTime);
  gainR.gain.linearRampToValueAtTime(volume, startTime + attack);

  oscL.connect(gainL).connect(merger, 0, 0);  // 左チャンネル
  oscR.connect(gainR).connect(merger, 0, 1);  // 右チャンネル
  merger.connect(dest);

  oscL.start(startTime);
  oscR.start(startTime);

  return {
    stop(releaseTime = ctx.currentTime) {
      const r = 5;
      gainL.gain.cancelScheduledValues(releaseTime);
      gainR.gain.cancelScheduledValues(releaseTime);
      gainL.gain.setValueAtTime(gainL.gain.value, releaseTime);
      gainR.gain.setValueAtTime(gainR.gain.value, releaseTime);
      gainL.gain.linearRampToValueAtTime(0.0001, releaseTime + r);
      gainR.gain.linearRampToValueAtTime(0.0001, releaseTime + r);
      oscL.stop(releaseTime + r + 0.1);
      oscR.stop(releaseTime + r + 0.1);
    },
    setVolume(v, atTime = ctx.currentTime) {
      gainL.gain.linearRampToValueAtTime(v, atTime + 0.5);
      gainR.gain.linearRampToValueAtTime(v, atTime + 0.5);
    },
    setBeat(hz, atTime = ctx.currentTime) {
      oscL.frequency.linearRampToValueAtTime(carrier - hz / 2, atTime + 1);
      oscR.frequency.linearRampToValueAtTime(carrier + hz / 2, atTime + 1);
    },
  };
}
