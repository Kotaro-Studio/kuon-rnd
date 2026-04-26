// ─────────────────────────────────────────────
// KUON DRUM MACHINE — WAV / Stem Export
// ─────────────────────────────────────────────
// OfflineAudioContext で N 小節を一気にレンダリング。
// 16-bit PCM WAV ファイルを Blob で生成 → ダウンロード可能。
//
// IQ180 機能:
//   - mixdown: 全トラック合算 1 ファイル
//   - stems: 各トラック別 8 ファイル ZIP (Pro 機能要望時に追加)
// ─────────────────────────────────────────────

import type { Kit } from './kits';
import type { PlayParams } from './synth';

export type RenderOptions = {
  kit: Kit;
  tracks: boolean[][];      // 8 voices × steps
  accents?: boolean[][];
  voiceParams: PlayParams[]; // 8 ボイスのパラメータ
  bpm: number;
  swing: number;            // 0-75
  steps: number;
  bars: number;             // 何小節レンダリングするか
  stepsPerBeat?: number;    // 16 ステップなら 4 (16 分音符)
  sampleRate?: number;
  // ステムレンダリングするか (true なら voice 単独再生)
  isolateVoice?: number;    // 0-7
};

// ─────────────────────────────────────────────
// 16-bit PCM WAV エンコーダ
// ─────────────────────────────────────────────
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = 2;
  const dataLength = buffer.length * numCh * bytesPerSample;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuf = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuf);

  // RIFF header
  let offset = 0;
  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
  };
  writeStr('RIFF');
  view.setUint32(offset, totalLength - 8, true); offset += 4;
  writeStr('WAVE');
  writeStr('fmt ');
  view.setUint32(offset, 16, true); offset += 4;          // PCM chunk size
  view.setUint16(offset, 1, true); offset += 2;            // PCM format
  view.setUint16(offset, numCh, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * numCh * bytesPerSample, true); offset += 4;
  view.setUint16(offset, numCh * bytesPerSample, true); offset += 2;
  view.setUint16(offset, 16, true); offset += 2;
  writeStr('data');
  view.setUint32(offset, dataLength, true); offset += 4;

  // Interleaved 16-bit PCM
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numCh; ch++) channels.push(buffer.getChannelData(ch));

  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuf], { type: 'audio/wav' });
}

// ─────────────────────────────────────────────
// メインレンダリング関数
// ─────────────────────────────────────────────
export async function renderToWav(opts: RenderOptions): Promise<Blob> {
  const sampleRate = opts.sampleRate ?? 44100;
  const stepsPerBeat = opts.stepsPerBeat ?? 4;
  const beatsPerSec = opts.bpm / 60;
  const stepDur = 1 / (beatsPerSec * stepsPerBeat); // 秒/ステップ
  const totalSteps = opts.steps * opts.bars;
  const totalDur = totalSteps * stepDur + 1.5; // 末尾にディケイ余裕

  const ctx = new OfflineAudioContext(2, Math.floor(totalDur * sampleRate), sampleRate);

  // マスターチェイン: コンプレッサー + リミッター → destination
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10;
  comp.knee.value = 6;
  comp.ratio.value = 3;
  comp.attack.value = 0.005;
  comp.release.value = 0.1;
  comp.connect(ctx.destination);

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.85;
  masterGain.connect(comp);

  // 各ステップの再生時刻にボイスをスケジュール
  for (let bar = 0; bar < opts.bars; bar++) {
    for (let step = 0; step < opts.steps; step++) {
      const baseTime = (bar * opts.steps + step) * stepDur;
      // スウィング: 偶数 16 分音符を遅らせる
      const swingOffset = (step & 1) === 1
        ? stepDur * (opts.swing / 100) * 0.5
        : 0;
      const time = baseTime + swingOffset;

      for (let v = 0; v < 8; v++) {
        if (!opts.tracks[v]?.[step]) continue;
        // ステム書き出し: 指定ボイス以外をスキップ
        if (opts.isolateVoice !== undefined && opts.isolateVoice !== v) continue;
        const voice = opts.kit.voices[v];
        if (!voice) continue;
        const params = {
          ...opts.voiceParams[v],
          accent: opts.accents?.[v]?.[step],
        };
        voice(ctx as unknown as AudioContext, masterGain, time, params);
      }
    }
  }

  const rendered = await ctx.startRendering();
  return audioBufferToWav(rendered);
}

// ─────────────────────────────────────────────
// ファイルダウンロードヘルパ
// ─────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}
