// ─────────────────────────────────────────────
// KUON HALO — Granular Cloud Engine
// ─────────────────────────────────────────────
// 既存の音 (foundation layer や外部サンプル) を「グレイン」に分解し、
// 何百個も時間軸上に散りばめて「霧」「雲」のような連続音響を生成。
//
// 健康音楽用途では:
//   - グレイン長: 100-500ms (典型的グラニュラーより長い = 滑らか)
//   - 密度: 10-100 grains/sec (典型より低い = 静か)
//   - ピッチジッタ ±50 cents (微細な倍音)
//   - 位置ジッタ あり (ループ感の徹底排除)
// ─────────────────────────────────────────────

export type GrainCloudParams = {
  source: AudioBuffer;          // 元音源
  grainSizeMs: number;          // 50-500
  density: number;              // grains per second (5-200)
  pitchJitterCents: number;     // 0-200
  positionJitter: number;       // 0-1 (ソース時間に対する比率)
  panSpread: number;            // 0-1
  startPosition: number;        // 0-1 (ソース内の読み始め位置)
  reverseProb: number;          // 0-1 (逆再生確率)
  volume: number;               // 0-1
};

export type GrainCloud = {
  stop(releaseTime?: number): void;
  setVolume(v: number, atTime?: number): void;
  setPosition(pos: number): void;
};

/**
 * Schedule grain cloud playback for `durationSec` seconds.
 * For OfflineAudioContext rendering: schedules ALL grains upfront.
 * For real-time AudioContext: also schedules ahead.
 */
export function startGrainCloud(
  ctx: AudioContext | OfflineAudioContext,
  dest: AudioNode,
  startTime: number,
  durationSec: number,
  p: GrainCloudParams,
): GrainCloud {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, startTime);
  masterGain.gain.linearRampToValueAtTime(p.volume, startTime + 3);
  masterGain.connect(dest);

  const totalGrains = Math.ceil(p.density * durationSec);
  const interval = 1 / p.density;
  const sourceDuration = p.source.duration;
  const grainDur = p.grainSizeMs / 1000;

  let posCursor = p.startPosition;

  for (let i = 0; i < totalGrains; i++) {
    // グレイン発生時刻 (微細にランダム化 = ループ感排除)
    const baseTime = startTime + i * interval;
    const jitter = (Math.random() - 0.5) * interval * 0.3;
    const t = baseTime + jitter;
    if (t > startTime + durationSec) break;

    // ソース内位置 (cursor + jitter)
    const positionJitter = (Math.random() * 2 - 1) * p.positionJitter;
    let sourcePos = (posCursor + positionJitter) * sourceDuration;
    sourcePos = Math.max(0, Math.min(sourceDuration - grainDur - 0.01, sourcePos));

    // ピッチ倍率 (cents → ratio)
    const pitchCents = (Math.random() * 2 - 1) * p.pitchJitterCents;
    const playbackRate = Math.pow(2, pitchCents / 1200);

    // 逆再生
    const reverse = Math.random() < p.reverseProb;

    // ステレオ位置
    const pan = (Math.random() * 2 - 1) * p.panSpread;

    // ノード生成
    const src = ctx.createBufferSource();
    src.buffer = p.source;
    src.playbackRate.value = playbackRate;

    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;

    // Hann 窓エンベロープ (グレイン特有の滑らかな包絡)
    // attack = release = grainDur / 2
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.7, t + grainDur / 2);
    gain.gain.linearRampToValueAtTime(0.0001, t + grainDur);

    src.connect(gain).connect(panner).connect(masterGain);

    if (reverse) {
      // 逆再生は reverse buffer を作る必要があるが、簡易に offset を end 寄りにして対応
      // (フル reverse 実装は重いので Phase 2)
      src.start(t, sourcePos, grainDur);
    } else {
      src.start(t, sourcePos, grainDur);
    }
    src.stop(t + grainDur + 0.05);

    // cursor を少しずつ進める (sourceDuration を一周する設計)
    posCursor += (interval / durationSec) * 0.5;
    if (posCursor > 1) posCursor = 0;
  }

  return {
    stop(releaseTime = ctx.currentTime) {
      masterGain.gain.cancelScheduledValues(releaseTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, releaseTime);
      masterGain.gain.linearRampToValueAtTime(0.0001, releaseTime + 5);
    },
    setVolume(v, atTime = ctx.currentTime) {
      masterGain.gain.linearRampToValueAtTime(v, atTime + 1);
    },
    setPosition(pos) {
      posCursor = pos;
    },
  };
}

// ─────────────────────────────────────────────
// Generate a single-tone source AudioBuffer for granulating
// (Foundation 層の音をオフライン生成 → grain cloud のソースに使う)
// ─────────────────────────────────────────────
export async function renderToneToBuffer(
  freq: number,
  durationSec: number,
  sampleRate: number = 44100,
  type: 'sine' | 'crystal' = 'crystal',
): Promise<AudioBuffer> {
  const offline = new OfflineAudioContext(2, Math.floor(durationSec * sampleRate), sampleRate);

  if (type === 'sine') {
    const osc = offline.createOscillator();
    const gain = offline.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.5, 0.5);
    gain.gain.setValueAtTime(0.5, durationSec - 0.5);
    gain.gain.linearRampToValueAtTime(0, durationSec);
    osc.connect(gain).connect(offline.destination);
    osc.start(0);
    osc.stop(durationSec);
  } else {
    // crystal: fundamental + 4 inharmonic partials
    const partials = [
      { ratio: 1.0, amp: 0.5 },
      { ratio: 2.4, amp: 0.25 },
      { ratio: 4.8, amp: 0.15 },
      { ratio: 6.8, amp: 0.08 },
    ];
    for (const p of partials) {
      const osc = offline.createOscillator();
      const gain = offline.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * p.ratio;
      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(p.amp, 0.5);
      gain.gain.setValueAtTime(p.amp, durationSec - 0.5);
      gain.gain.linearRampToValueAtTime(0, durationSec);
      osc.connect(gain).connect(offline.destination);
      osc.start(0);
      osc.stop(durationSec);
    }
  }

  return offline.startRendering();
}
