// ─────────────────────────────────────────────
// KUON HALO v2 — WAV Export with Chord Progression
// ─────────────────────────────────────────────
// コード進行に沿ってボイスを連続起動 → 24-bit 48kHz WAV にレンダリング。
// 1 コードごとに bass/pad/shimmer 層を起動・前のコードと cross-fade。
// ─────────────────────────────────────────────

import type { HaloPreset } from './presets';
import { makePadVoice } from './pads';
import { binauralBeat } from './binaural';
import { texture } from './synth';
import { createReverbFromPreset } from './reverb';
import {
  scheduleProgression, voiceChord, getProgressionById, keyToHz,
  type ProgressionEvent,
} from './chord-engine';

// ─────────────────────────────────────────────
// 24-bit PCM WAV エンコーダ
// ─────────────────────────────────────────────
export function audioBufferToWav24(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = 3;
  const dataLength = buffer.length * numCh * bytesPerSample;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuf = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuf);

  let offset = 0;
  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i));
  };
  writeStr('RIFF');
  view.setUint32(offset, totalLength - 8, true); offset += 4;
  writeStr('WAVE');
  writeStr('fmt ');
  view.setUint32(offset, 16, true); offset += 4;
  view.setUint16(offset, 1, true); offset += 2;
  view.setUint16(offset, numCh, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * numCh * bytesPerSample, true); offset += 4;
  view.setUint16(offset, numCh * bytesPerSample, true); offset += 2;
  view.setUint16(offset, 24, true); offset += 2;
  writeStr('data');
  view.setUint32(offset, dataLength, true); offset += 4;

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numCh; ch++) channels.push(buffer.getChannelData(ch));

  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numCh; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i]));
      const intVal = s < 0 ? Math.round(s * 0x800000) : Math.round(s * 0x7FFFFF);
      view.setUint8(offset++, intVal & 0xFF);
      view.setUint8(offset++, (intVal >> 8) & 0xFF);
      view.setUint8(offset++, (intVal >> 16) & 0xFF);
    }
  }

  return new Blob([arrayBuf], { type: 'audio/wav' });
}

// ─────────────────────────────────────────────
// Render preset to AudioBuffer (with chord progression)
// ─────────────────────────────────────────────
export type RenderOptions = {
  preset: HaloPreset;
  durationMin: number;
  sampleRate?: number;
  warmth?: number;            // 0-1 (UI 経由の温感調整・default 0.7)
  variation?: {
    detuneJitter?: number;
    binauralCarrierJitter?: number;
  };
  onProgress?: (pct: number) => void;
};

export async function renderPreset(opts: RenderOptions): Promise<AudioBuffer> {
  const sr = opts.sampleRate ?? 48000;
  const dur = opts.durationMin * 60;
  const ctx = new OfflineAudioContext(2, Math.floor(dur * sr), sr);

  const p = opts.preset;
  const v = opts.variation ?? {};
  const warmth = opts.warmth ?? 0.7;

  // ─── Master Chain (anti-clipping 強化版) ───
  // tanh ソフトクリッパー (最終安全網・絶対に音割れさせない)
  const softClip = ctx.createWaveShaper();
  const sCurveLen = 4096;
  const sCurve = new Float32Array(sCurveLen);
  for (let i = 0; i < sCurveLen; i++) {
    const x = (i / sCurveLen) * 2 - 1;
    sCurve[i] = Math.tanh(x * 0.85);  // 0.85 で穏やかな飽和
  }
  softClip.curve = sCurve;
  softClip.oversample = '4x';
  softClip.connect(ctx.destination);

  // ブリックウォール・リミッター (-3dB 厳守)
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.05;
  limiter.connect(softClip);

  // 通常コンプ (穏やかにダイナミクス整形)
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12;
  comp.knee.value = 12;
  comp.ratio.value = 2.5;
  comp.attack.value = 0.05;
  comp.release.value = 0.3;
  comp.connect(limiter);

  // マスターゲイン (低めスタート + 10 秒フェードイン = クレッシェンド爆発防止)
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.0001;     // ほぼ無音から開始
  masterGain.gain.setValueAtTime(0.0001, 0);
  masterGain.gain.exponentialRampToValueAtTime(0.5, 10);  // 10 秒かけて 0.5 へ
  masterGain.connect(comp);

  // Reverb
  const reverb = createReverbFromPreset(ctx, p.reverb.preset, p.reverb.wetMix);
  reverb.output.connect(masterGain);

  // ─── Chord Progression Schedule ───
  const progression = getProgressionById(p.progressionId);
  if (!progression) throw new Error(`Progression not found: ${p.progressionId}`);

  // ソルフェジオ周波数を軸に直接使用 (優先)。なければ従来のキー名→Hz 変換。
  const keyHz = p.baseSolfeggioHz ?? keyToHz(p.key, p.tuning);
  const events: ProgressionEvent[] = scheduleProgression(progression, dur);

  // 各コードイベントごとに 3 層 (bass/pad/shimmer) を起動・前と cross-fade
  const FADE_OVERLAP = 4; // 秒 (前後コードの crossfade)

  for (const ev of events) {
    const voicing = voiceChord(ev.chord, keyHz, progression.mode);
    const t = ev.startTime;
    const tEnd = ev.endTime + FADE_OVERLAP;
    const chordDur = ev.endTime - ev.startTime;
    const releaseTime = ev.endTime;

    // detune jitter
    const dj = (v.detuneJitter ?? 0) * (Math.random() * 2 - 1);

    // ─── BASS layer ───
    if (p.bassLayer) {
      for (const f of voicing.bass) {
        const voice = makePadVoice(p.bassLayer.padType, ctx, reverb.input, t, {
          freq: f * Math.pow(2, dj / 1200),
          volume: p.bassLayer.volume,
          attack: Math.min(FADE_OVERLAP, chordDur * 0.3),
          release: FADE_OVERLAP,
          pan: -0.3 + Math.random() * 0.2,
          brightness: 0.3, warmth,
        });
        voice.stop(releaseTime);
      }
    }

    // ─── PAD layer (主声部) ───
    for (let i = 0; i < voicing.pad.length; i++) {
      const f = voicing.pad[i];
      const pan = (i / Math.max(1, voicing.pad.length - 1) - 0.5) * 0.7;
      const voice = makePadVoice(p.padLayer.padType, ctx, reverb.input, t, {
        freq: f * Math.pow(2, dj / 1200),
        volume: p.padLayer.volume / Math.sqrt(voicing.pad.length),
        attack: Math.min(FADE_OVERLAP, chordDur * 0.3),
        release: FADE_OVERLAP + 2,
        pan,
        brightness: 0.5, warmth,
      });
      voice.stop(releaseTime);
    }

    // ─── SHIMMER layer (高音層) ───
    if (p.shimmerLayer && voicing.shimmer.length > 0) {
      for (let i = 0; i < voicing.shimmer.length; i++) {
        const f = voicing.shimmer[i];
        const pan = (i / Math.max(1, voicing.shimmer.length - 1) - 0.5) * 0.9;
        const voice = makePadVoice(p.shimmerLayer.padType, ctx, reverb.input, t, {
          freq: f * Math.pow(2, dj / 1200),
          volume: p.shimmerLayer.volume / Math.sqrt(voicing.shimmer.length),
          attack: Math.min(FADE_OVERLAP * 1.5, chordDur * 0.4),
          release: FADE_OVERLAP + 3,
          pan,
          brightness: 0.8, warmth,
        });
        voice.stop(releaseTime);
      }
    }

    // ─── Felt Piano on chord change (1 hit) ───
    if (p.pianoOnChange.enabled) {
      // root + 5th of chord, mid octave
      const pianoNotes = [voicing.pad[0], voicing.pad[Math.min(2, voicing.pad.length - 1)]];
      for (const f of pianoNotes) {
        makePadVoice('felt-piano', ctx, reverb.input, t + 0.5, {
          freq: f * Math.pow(2, dj / 1200),
          volume: p.pianoOnChange.volume,
          attack: 0.005,
          release: 6,
          pan: (Math.random() - 0.5) * 0.4,
          brightness: 0.6,
        });
      }
    }

    // 進捗報告
    if (opts.onProgress) {
      opts.onProgress((ev.endTime / dur) * 90); // レンダ前 90%, 後 10%
    }
    // 末尾オーバーラップ補正
    if (tEnd > dur) break;
  }

  // ─── Binaural Layer (全体に渡って) ───
  if (p.binaural.enabled) {
    const carrier = (p.binaural.carrierHz ?? keyHz / 2)
      + ((v.binauralCarrierJitter ?? 0) * (Math.random() * 2 - 1));
    const beatHz = p.binaural.customBeatHz ?? 6;
    binauralBeat(ctx, masterGain, 0, carrier, beatHz, p.binaural.volume, 5);
  }

  // ─── Texture Layer ───
  if (p.texture.enabled) {
    texture(ctx, reverb.input, 0, p.texture.type, {
      volume: p.texture.volume,
      attack: 8,
      release: 10,
    });
  }

  // ─── Master fade-out 末尾 15 秒 ───
  masterGain.gain.setValueAtTime(0.5, dur - 15);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, dur - 0.5);

  if (opts.onProgress) opts.onProgress(95);
  const result = await ctx.startRendering();
  if (opts.onProgress) opts.onProgress(100);
  return result;
}

// ─────────────────────────────────────────────
// Download helper
// ─────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

export function buildFilename(preset: HaloPreset, durationMin: number, idx: number): string {
  const name = preset.filenameTemplate
    .replace('{idx}', String(idx).padStart(2, '0'))
    .replace('{dur}', String(durationMin));
  return `${name}_${durationMin}min.wav`;
}
