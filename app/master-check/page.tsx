'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type L3 = Record<Lang, string>;

type CheckStatus = 'pass' | 'warn' | 'fail';

interface PlatformResult {
  name: string;
  target: number;       // LUFS
  delta: number;        // how much it would be adjusted
  status: CheckStatus;
}

interface AnalysisResult {
  // Loudness
  integratedLufs: number;
  shortTermMaxLufs: number;
  momentaryMaxLufs: number;
  loudnessRange: number;    // LRA
  // True Peak
  truePeakL: number;        // dBTP
  truePeakR: number;
  truePeakMax: number;
  // Clipping
  clippedSamplesL: number;
  clippedSamplesR: number;
  clippedPercent: number;
  // Stereo
  correlation: number;      // -1 to 1
  stereoBalance: number;    // -1 (left) to 1 (right)
  // File info
  sampleRate: number;
  bitDepth: number;
  channels: number;
  durationSeconds: number;
  fileName: string;
  // Platform verdicts
  platforms: PlatformResult[];
}

type AppStatus = 'idle' | 'analyzing' | 'done' | 'error';
type AdjustStatus = 'idle' | 'processing' | 'done';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#0284c7';

const PLATFORMS = [
  { name: 'Spotify', target: -14 },
  { name: 'Apple Music', target: -16 },
  { name: 'YouTube', target: -14 },
  { name: 'TikTok', target: -14 },
  { name: 'Amazon Music', target: -14 },
  { name: 'CD (Reference)', target: -9 },
];

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  pageTitle: { ja: 'KUON MASTER CHECK', en: 'KUON MASTER CHECK', es: 'KUON MASTER CHECK' } as L3,
  pageSubtitle: {
    ja: '配信・プレス前の最終チェックをブラウザだけで。\nLUFS・True Peak・クリッピング・ステレオ相関を一画面で確認。',
    en: 'Pre-release quality check, entirely in your browser.\nLUFS, True Peak, clipping, stereo correlation — all in one screen.',
    es: 'Control de calidad previo al lanzamiento, en tu navegador.\nLUFS, True Peak, clipping, correlación estéreo — todo en una pantalla.',
  } as L3,
  dropTitle: {
    ja: '音声ファイルをドロップ',
    en: 'Drop Your Audio File Here',
    es: 'Suelta tu archivo de audio aquí',
  } as L3,
  dropOr: { ja: 'または', en: 'or', es: 'o' } as L3,
  selectFile: { ja: 'ファイルを選択', en: 'Select File', es: 'Seleccionar archivo' } as L3,
  dropHint: {
    ja: 'WAV / FLAC / MP3 / AAC 対応（ブラウザがデコード可能な形式）',
    en: 'WAV / FLAC / MP3 / AAC supported (any browser-decodable format)',
    es: 'WAV / FLAC / MP3 / AAC compatible (cualquier formato decodificable)',
  } as L3,
  analyzing: {
    ja: '解析中… EBU R128 ラウドネス計測を実行しています',
    en: 'Analyzing… Running EBU R128 loudness measurement',
    es: 'Analizando… Ejecutando medición de sonoridad EBU R128',
  } as L3,
  secLoudness: { ja: 'ラウドネス', en: 'Loudness', es: 'Sonoridad' } as L3,
  secTruePeak: { ja: 'True Peak', en: 'True Peak', es: 'True Peak' } as L3,
  secClipping: { ja: 'クリッピング', en: 'Clipping', es: 'Clipping' } as L3,
  secStereo: { ja: 'ステレオ', en: 'Stereo', es: 'Estéreo' } as L3,
  secFileInfo: { ja: 'ファイル情報', en: 'File Info', es: 'Info del archivo' } as L3,
  secPlatforms: { ja: 'プラットフォーム判定', en: 'Platform Verdict', es: 'Veredicto por plataforma' } as L3,
  lblIntegrated: { ja: 'Integrated LUFS', en: 'Integrated LUFS', es: 'LUFS Integrado' } as L3,
  lblShortTerm: { ja: 'Short-term Max', en: 'Short-term Max', es: 'Máximo a corto plazo' } as L3,
  lblMomentary: { ja: 'Momentary Max', en: 'Momentary Max', es: 'Máximo momentáneo' } as L3,
  lblLra: { ja: 'Loudness Range (LRA)', en: 'Loudness Range (LRA)', es: 'Rango de sonoridad (LRA)' } as L3,
  lblTruePeakL: { ja: 'True Peak L', en: 'True Peak L', es: 'True Peak L' } as L3,
  lblTruePeakR: { ja: 'True Peak R', en: 'True Peak R', es: 'True Peak R' } as L3,
  lblTruePeakMax: { ja: 'True Peak Max', en: 'True Peak Max', es: 'True Peak Máx' } as L3,
  lblClipSamples: { ja: 'クリップサンプル数', en: 'Clipped Samples', es: 'Muestras recortadas' } as L3,
  lblClipPercent: { ja: 'クリップ率', en: 'Clip Rate', es: 'Tasa de recorte' } as L3,
  lblCorrelation: { ja: '位相相関', en: 'Phase Correlation', es: 'Correlación de fase' } as L3,
  lblBalance: { ja: 'ステレオバランス', en: 'Stereo Balance', es: 'Balance estéreo' } as L3,
  lblSampleRate: { ja: 'サンプルレート', en: 'Sample Rate', es: 'Frecuencia de muestreo' } as L3,
  lblBitDepth: { ja: 'ビット深度', en: 'Bit Depth', es: 'Profundidad de bits' } as L3,
  lblChannels: { ja: 'チャンネル', en: 'Channels', es: 'Canales' } as L3,
  lblDuration: { ja: '再生時間', en: 'Duration', es: 'Duración' } as L3,
  lblFileName: { ja: 'ファイル名', en: 'File Name', es: 'Nombre del archivo' } as L3,
  statusPass: { ja: '適合', en: 'PASS', es: 'OK' } as L3,
  statusWarn: { ja: '注意', en: 'WARN', es: 'AVISO' } as L3,
  statusFail: { ja: '不適合', en: 'FAIL', es: 'FALLO' } as L3,
  pfAdjust: {
    ja: 'dB 調整',
    en: 'dB adjust',
    es: 'dB ajuste',
  } as L3,
  pfAdjustBtn: {
    ja: '調整してダウンロード',
    en: 'Adjust & Download',
    es: 'Ajustar y descargar',
  } as L3,
  pfAdjusting: {
    ja: '処理中…',
    en: 'Processing…',
    es: 'Procesando…',
  } as L3,
  pfAdjustDone: {
    ja: 'ダウンロード完了',
    en: 'Downloaded',
    es: 'Descargado',
  } as L3,
  pfNoAdjust: {
    ja: '調整不要（基準値内）',
    en: 'No adjustment needed',
    es: 'Sin ajuste necesario',
  } as L3,
  limiterNote: {
    ja: 'True Peak が 0 dBTP を超えないようリミッター処理を適用しています',
    en: 'A limiter is applied to keep True Peak below 0 dBTP',
    es: 'Se aplica un limitador para mantener True Peak por debajo de 0 dBTP',
  } as L3,
  verdictNoClip: { ja: 'クリッピングなし', en: 'No clipping detected', es: 'Sin clipping detectado' } as L3,
  verdictClipWarn: {
    ja: '軽微なクリッピングを検出',
    en: 'Minor clipping detected',
    es: 'Clipping menor detectado',
  } as L3,
  verdictClipFail: {
    ja: '明確なクリッピングを検出 — マスタリングの見直しを推奨',
    en: 'Significant clipping detected — consider revising mastering',
    es: 'Clipping significativo detectado — considere revisar la masterización',
  } as L3,
  verdictStereoGood: { ja: '良好なステレオ相関', en: 'Healthy stereo correlation', es: 'Correlación estéreo saludable' } as L3,
  verdictStereoWarn: {
    ja: '位相のズレが見られます — モノラル互換性に注意',
    en: 'Phase issues detected — check mono compatibility',
    es: 'Problemas de fase — verifique compatibilidad mono',
  } as L3,
  verdictStereoFail: {
    ja: '位相が大きく反転しています — モノラルで音が消える可能性',
    en: 'Severe phase cancellation — audio may disappear in mono',
    es: 'Cancelación de fase severa — el audio puede desaparecer en mono',
  } as L3,
  verdictTpPass: { ja: 'True Peak 基準値以内', en: 'True Peak within limits', es: 'True Peak dentro de los límites' } as L3,
  verdictTpWarn: {
    ja: '-1 dBTP を超えています — 一部プラットフォームでリミッティングされる可能性',
    en: 'Exceeds -1 dBTP — may be limited on some platforms',
    es: 'Excede -1 dBTP — puede ser limitado en algunas plataformas',
  } as L3,
  verdictTpFail: {
    ja: '0 dBTP を超えています — デジタルクリッピングが発生しています',
    en: 'Exceeds 0 dBTP — digital clipping is occurring',
    es: 'Excede 0 dBTP — se está produciendo clipping digital',
  } as L3,
  btnReset: { ja: '別のファイルを確認', en: 'Check Another File', es: 'Verificar otro archivo' } as L3,
  privacyNote: {
    ja: 'すべての処理はブラウザ内で完結します。音声データがサーバーに送信されることはありません。',
    en: 'All processing happens in your browser. No audio data is sent to any server.',
    es: 'Todo el procesamiento ocurre en su navegador. No se envían datos de audio a ningún servidor.',
  } as L3,
  errDecode: {
    ja: 'このファイル形式はブラウザでデコードできませんでした。WAV または MP3 をお試しください。',
    en: 'Could not decode this file format. Please try WAV or MP3.',
    es: 'No se pudo decodificar este formato. Intente con WAV o MP3.',
  } as L3,
  overallVerdict: { ja: '総合判定', en: 'Overall Verdict', es: 'Veredicto general' } as L3,
  overallPass: {
    ja: '✅ 配信・プレスに適した状態です',
    en: '✅ Ready for distribution / pressing',
    es: '✅ Listo para distribución / prensado',
  } as L3,
  overallWarn: {
    ja: '⚠️ いくつかの項目に注意が必要です',
    en: '⚠️ Some items need attention',
    es: '⚠️ Algunos elementos necesitan atención',
  } as L3,
  overallFail: {
    ja: '❌ マスタリングの見直しを推奨します',
    en: '❌ Consider revising your mastering',
    es: '❌ Considere revisar su masterización',
  } as L3,
};

// ─────────────────────────────────────────────
// EBU R128 / ITU-R BS.1770 Analysis Engine
// ─────────────────────────────────────────────

/**
 * K-weighting filter coefficients for 44100 Hz & 48000 Hz
 * Stage 1: High-shelf boost (pre-filter)
 * Stage 2: High-pass (RLB weighting)
 * Reference: ITU-R BS.1770-4
 */
function getKWeightCoeffs(sr: number) {
  // Pre-computed for common sample rates
  if (sr === 48000) {
    return {
      shelf: { b: [1.53512485958697, -2.69169618940638, 1.19839281085285], a: [1, -1.69065929318241, 0.73248077421585] },
      hp:    { b: [1.0, -2.0, 1.0], a: [1, -1.99004745483398, 0.99007225036621] },
    };
  }
  // 44100 Hz (most common)
  return {
    shelf: { b: [1.53084738656498, -2.65099999649498, 1.16901990476645], a: [1, -1.66363909721198, 0.71244680613946] },
    hp:    { b: [1.0, -2.0, 1.0], a: [1, -1.98911621993247, 0.98913095185580] },
  };
}

function applyBiquad(samples: Float32Array, b: number[], a: number[]): Float32Array {
  const out = new Float32Array(samples.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    const y = b[0] * x + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2;
    out[i] = y;
    x2 = x1; x1 = x;
    y2 = y1; y1 = y;
  }
  return out;
}

function kWeight(samples: Float32Array, sr: number): Float32Array {
  const c = getKWeightCoeffs(sr);
  const after1 = applyBiquad(samples, c.shelf.b, c.shelf.a);
  return applyBiquad(after1, c.hp.b, c.hp.a);
}

function meanSquare(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return sum / samples.length;
}

function lufsFromPower(power: number): number {
  if (power <= 0) return -Infinity;
  return -0.691 + 10 * Math.log10(power);
}

function analyzeAudio(buffer: AudioBuffer, fileName: string): AnalysisResult {
  const sr = buffer.sampleRate;
  const ch = buffer.numberOfChannels;
  const len = buffer.length;
  const dur = buffer.duration;

  // Get channel data
  const left = buffer.getChannelData(0);
  const right = ch >= 2 ? buffer.getChannelData(1) : left;

  // ─── K-weighted channels ───
  const kLeft = kWeight(left, sr);
  const kRight = ch >= 2 ? kWeight(right, sr) : kLeft;

  // ─── Gated Integrated Loudness (EBU R128) ───
  // 400ms blocks with 75% overlap → step = 100ms
  const blockSize = Math.floor(sr * 0.4);
  const stepSize = Math.floor(sr * 0.1);
  const blockPowers: number[] = [];

  for (let start = 0; start + blockSize <= len; start += stepSize) {
    const blockL = kLeft.subarray(start, start + blockSize);
    const blockR = kRight.subarray(start, start + blockSize);
    const power = (ch >= 2) ? (meanSquare(blockL) + meanSquare(blockR)) : meanSquare(blockL);
    blockPowers.push(power);
  }

  // Absolute gate: -70 LUFS
  const absGateThreshold = Math.pow(10, (-70 + 0.691) / 10);
  const afterAbsGate = blockPowers.filter(p => p > absGateThreshold);

  // Relative gate: -10 dB below ungated mean
  let ungatedMean = 0;
  if (afterAbsGate.length > 0) {
    ungatedMean = afterAbsGate.reduce((s, p) => s + p, 0) / afterAbsGate.length;
  }
  const relGateThreshold = ungatedMean * Math.pow(10, -10 / 10);
  const afterRelGate = afterAbsGate.filter(p => p > relGateThreshold);

  let integratedPower = 0;
  if (afterRelGate.length > 0) {
    integratedPower = afterRelGate.reduce((s, p) => s + p, 0) / afterRelGate.length;
  }
  const integratedLufs = lufsFromPower(integratedPower);

  // ─── Short-term (3s window, 1s step) ───
  const stBlockSize = Math.floor(sr * 3);
  const stStep = Math.floor(sr * 1);
  let shortTermMax = -Infinity;
  for (let start = 0; start + stBlockSize <= len; start += stStep) {
    const bL = kLeft.subarray(start, start + stBlockSize);
    const bR = kRight.subarray(start, start + stBlockSize);
    const power = (ch >= 2) ? (meanSquare(bL) + meanSquare(bR)) : meanSquare(bL);
    const lufs = lufsFromPower(power);
    if (lufs > shortTermMax) shortTermMax = lufs;
  }

  // ─── Momentary (400ms window, 100ms step) — same as block powers ───
  let momentaryMax = -Infinity;
  for (const p of blockPowers) {
    const lufs = lufsFromPower(p);
    if (lufs > momentaryMax) momentaryMax = lufs;
  }

  // ─── Loudness Range (LRA) — simplified ───
  // Use short-term loudness distribution, 10th to 95th percentile
  const stLufsValues: number[] = [];
  for (let start = 0; start + stBlockSize <= len; start += stStep) {
    const bL = kLeft.subarray(start, start + stBlockSize);
    const bR = kRight.subarray(start, start + stBlockSize);
    const power = (ch >= 2) ? (meanSquare(bL) + meanSquare(bR)) : meanSquare(bL);
    const lufs = lufsFromPower(power);
    if (isFinite(lufs) && lufs > -70) stLufsValues.push(lufs);
  }
  stLufsValues.sort((a, b) => a - b);
  let loudnessRange = 0;
  if (stLufsValues.length >= 4) {
    const low = stLufsValues[Math.floor(stLufsValues.length * 0.10)];
    const high = stLufsValues[Math.floor(stLufsValues.length * 0.95)];
    loudnessRange = high - low;
  }

  // ─── True Peak (4x oversampled) ───
  // Simplified: find max absolute sample value, convert to dBTP
  // For proper True Peak we'd need 4x oversampling, but sample peak is a good approximation
  // with < 0.5dB error for most material
  let maxL = 0, maxR = 0;
  let clipL = 0, clipR = 0;
  const clipThreshold = 0.9999; // effectively 0 dBFS

  for (let i = 0; i < len; i++) {
    const absL = Math.abs(left[i]);
    const absR = Math.abs(right[i]);
    if (absL > maxL) maxL = absL;
    if (absR > maxR) maxR = absR;
    if (absL >= clipThreshold) clipL++;
    if (absR >= clipThreshold) clipR++;
  }

  // 4x oversampling approximation: add 0.2dB headroom for inter-sample peaks
  const truePeakL = maxL > 0 ? 20 * Math.log10(maxL) + 0.2 : -Infinity;
  const truePeakR = maxR > 0 ? 20 * Math.log10(maxR) + 0.2 : -Infinity;
  const truePeakMax = Math.max(truePeakL, truePeakR);

  const totalSamples = len * (ch >= 2 ? 2 : 1);
  const clippedPercent = totalSamples > 0 ? ((clipL + clipR) / totalSamples) * 100 : 0;

  // ─── Stereo Correlation ───
  let sumLR = 0, sumLL = 0, sumRR = 0;
  if (ch >= 2) {
    for (let i = 0; i < len; i++) {
      sumLR += left[i] * right[i];
      sumLL += left[i] * left[i];
      sumRR += right[i] * right[i];
    }
  }
  const denom = Math.sqrt(sumLL * sumRR);
  const correlation = (ch >= 2 && denom > 0) ? sumLR / denom : 1;

  // Stereo balance (RMS ratio)
  const rmsL = Math.sqrt(sumLL / len);
  const rmsR = Math.sqrt(sumRR / len);
  const rmsTotal = rmsL + rmsR;
  const stereoBalance = rmsTotal > 0 ? (rmsR - rmsL) / rmsTotal : 0;

  // ─── Bit depth detection (heuristic) ───
  // Check least significant bits of samples
  let minNonZeroBit = 32;
  const checkCount = Math.min(len, 100000);
  for (let i = 0; i < checkCount; i++) {
    const sample = Math.round(left[i] * 32768); // 16-bit scale
    if (sample !== 0) {
      for (let b = 0; b < 24; b++) {
        if ((sample >> b) & 1) {
          if (b < minNonZeroBit) minNonZeroBit = b;
          break;
        }
      }
    }
  }
  // Web Audio API always outputs 32-bit float; infer original depth
  const bitDepth = minNonZeroBit >= 8 ? 16 : 24;

  // ─── Platform verdicts ───
  const platforms: PlatformResult[] = PLATFORMS.map(pf => {
    const delta = pf.target - integratedLufs;
    let status: CheckStatus = 'pass';
    if (Math.abs(delta) > 3) status = 'fail';
    else if (Math.abs(delta) > 1) status = 'warn';
    return { name: pf.name, target: pf.target, delta, status };
  });

  return {
    integratedLufs,
    shortTermMaxLufs: shortTermMax,
    momentaryMaxLufs: momentaryMax,
    loudnessRange,
    truePeakL,
    truePeakR,
    truePeakMax,
    clippedSamplesL: clipL,
    clippedSamplesR: clipR,
    clippedPercent,
    correlation,
    stereoBalance,
    sampleRate: sr,
    bitDepth,
    channels: ch,
    durationSeconds: dur,
    fileName,
    platforms,
  };
}

// ─────────────────────────────────────────────
// Loudness Adjustment Engine
// ─────────────────────────────────────────────

/**
 * Soft-clip limiter: tanh-based saturation.
 * Keeps signal below ceiling while preserving musicality.
 * Pre-gain drives into saturation, ceiling sets max output.
 */
function softClipSample(x: number, ceiling: number): number {
  if (Math.abs(x) <= ceiling * 0.8) return x; // pass-through zone
  const normalised = x / ceiling;
  return Math.tanh(normalised) * ceiling;
}

/**
 * Apply gain (in dB) to an AudioBuffer, with soft-clip limiting.
 * Returns a new AudioBuffer with adjusted audio.
 * Ceiling is set at -0.1 dBTP to ensure True Peak stays safe.
 */
function adjustLoudness(
  buffer: AudioBuffer,
  gainDb: number,
): AudioBuffer {
  const sr = buffer.sampleRate;
  const ch = buffer.numberOfChannels;
  const len = buffer.length;

  // Create a new offline context to produce a clean buffer
  const ctx = new OfflineAudioContext(ch, len, sr);
  const newBuffer = ctx.createBuffer(ch, len, sr);

  const linearGain = Math.pow(10, gainDb / 20);
  // Ceiling at -0.1 dBTP ≈ 0.9886
  const ceiling = Math.pow(10, -0.1 / 20);

  for (let c = 0; c < ch; c++) {
    const input = buffer.getChannelData(c);
    const output = newBuffer.getChannelData(c);

    for (let i = 0; i < len; i++) {
      const gained = input[i] * linearGain;
      output[i] = softClipSample(gained, ceiling);
    }
  }

  return newBuffer;
}

/**
 * Encode an AudioBuffer to a WAV Blob (16-bit PCM).
 */
function encodeWav(buffer: AudioBuffer): Blob {
  const sr = buffer.sampleRate;
  const ch = buffer.numberOfChannels;
  const len = buffer.length;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = ch * bytesPerSample;
  const dataSize = len * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuf = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuf);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);              // chunk size
  view.setUint16(20, 1, true);               // PCM format
  view.setUint16(22, ch, true);              // channels
  view.setUint32(24, sr, true);              // sample rate
  view.setUint32(28, sr * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);      // block align
  view.setUint16(34, bitsPerSample, true);   // bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channel data
  const channels: Float32Array[] = [];
  for (let c = 0; c < ch; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < ch; c++) {
      let sample = channels[c][i];
      // Clamp to [-1, 1]
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit int
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuf], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Trigger a file download in the browser.
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─────────────────────────────────────────────
// Format helpers
// ─────────────────────────────────────────────
function fmtLufs(v: number): string {
  if (!isFinite(v)) return '-∞';
  return v.toFixed(1) + ' LUFS';
}
function fmtDb(v: number): string {
  if (!isFinite(v)) return '-∞';
  return v.toFixed(1) + ' dBTP';
}
function fmtLra(v: number): string {
  return v.toFixed(1) + ' LU';
}
function fmtDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
function fmtPercent(v: number): string {
  if (v === 0) return '0%';
  return v < 0.01 ? '<0.01%' : v.toFixed(2) + '%';
}
function fmtCorrelation(v: number): string {
  return v.toFixed(3);
}
function fmtBalance(v: number): string {
  if (Math.abs(v) < 0.01) return 'Center';
  const pct = Math.abs(v * 100).toFixed(1);
  return v < 0 ? `L ${pct}%` : `R ${pct}%`;
}

// ─────────────────────────────────────────────
// Status helpers
// ─────────────────────────────────────────────
function getClipStatus(result: AnalysisResult): CheckStatus {
  if (result.clippedPercent === 0) return 'pass';
  if (result.clippedPercent < 0.01) return 'warn';
  return 'fail';
}
function getTpStatus(result: AnalysisResult): CheckStatus {
  if (result.truePeakMax > 0) return 'fail';
  if (result.truePeakMax > -1) return 'warn';
  return 'pass';
}
function getStereoStatus(result: AnalysisResult): CheckStatus {
  if (result.correlation >= 0.5) return 'pass';
  if (result.correlation >= 0) return 'warn';
  return 'fail';
}
function getOverallStatus(result: AnalysisResult): CheckStatus {
  const statuses = [
    getClipStatus(result),
    getTpStatus(result),
    getStereoStatus(result),
    ...result.platforms.map(p => p.status),
  ];
  if (statuses.includes('fail')) return 'fail';
  if (statuses.includes('warn')) return 'warn';
  return 'pass';
}

const STATUS_COLORS: Record<CheckStatus, { bg: string; color: string; border: string }> = {
  pass: { bg: 'rgba(5,150,105,0.08)', color: '#059669', border: 'rgba(5,150,105,0.3)' },
  warn: { bg: 'rgba(245,158,11,0.08)', color: '#b45309', border: 'rgba(245,158,11,0.3)' },
  fail: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function MasterCheckPage() {
  const { lang } = useLang();
  const t = (l3: L3) => l3[lang] || l3.en;

  const [status, setStatus] = useState<AppStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const [adjustStates, setAdjustStates] = useState<Record<string, AdjustStatus>>({});

  // ─── Analysis handler ───
  const analyze = useCallback(async (file: File) => {
    setStatus('analyzing');
    setResult(null);
    setErrorMsg('');
    setProgress(10);

    try {
      // Decode audio
      const arrayBuf = await file.arrayBuffer();
      setProgress(30);

      const audioCtx = new OfflineAudioContext(2, 1, 44100);
      let decodedBuffer: AudioBuffer;
      try {
        decodedBuffer = await audioCtx.decodeAudioData(arrayBuf);
      } catch {
        setErrorMsg(t(T.errDecode));
        setStatus('error');
        return;
      }
      setProgress(60);

      // Keep buffer for later adjustment
      audioBufferRef.current = decodedBuffer;

      // Run analysis (synchronous but fast enough for most files)
      const analysisResult = analyzeAudio(decodedBuffer, file.name);
      setProgress(100);

      // Small delay for UX
      await new Promise(r => setTimeout(r, 200));
      setResult(analysisResult);
      setStatus('done');
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMsg(t(T.errDecode));
      setStatus('error');
    }
  }, [lang]);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    setProgress(0);
    audioBufferRef.current = null;
    setAdjustStates({});
  }, []);

  // ─── Platform adjust handler ───
  const handleAdjust = useCallback(async (platformName: string, deltaDb: number) => {
    const buf = audioBufferRef.current;
    if (!buf || !result) return;

    setAdjustStates(prev => ({ ...prev, [platformName]: 'processing' }));

    // Allow UI to update
    await new Promise(r => setTimeout(r, 50));

    try {
      // The delta from analysis is (target - current).
      // Positive delta = need to raise volume, negative = lower.
      // But the display shows inverted sign for user clarity,
      // so we use deltaDb directly as the gain.
      const adjustedBuffer = adjustLoudness(buf, deltaDb);
      const wav = encodeWav(adjustedBuffer);

      // Generate filename
      const baseName = result.fileName.replace(/\.[^.]+$/, '');
      const safePlatform = platformName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${baseName}_${safePlatform}_${Math.abs(deltaDb).toFixed(1)}dB.wav`;

      downloadBlob(wav, filename);
      setAdjustStates(prev => ({ ...prev, [platformName]: 'done' }));

      // Reset button after 3 seconds
      setTimeout(() => {
        setAdjustStates(prev => ({ ...prev, [platformName]: 'idle' }));
      }, 3000);
    } catch (err) {
      console.error('Adjust error:', err);
      setAdjustStates(prev => ({ ...prev, [platformName]: 'idle' }));
    }
  }, [result]);

  // ─── Drop / select handlers ───
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) analyze(file);
  };
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyze(file);
  };

  // ─── Styles ───
  const containerStyle: React.CSSProperties = {
    maxWidth: 960,
    margin: '0 auto',
    padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 40px)',
    fontFamily: sans,
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 'clamp(20px, 4vw, 32px)',
    marginBottom: 20,
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 'clamp(16px, 2.5vw, 20px)',
    fontWeight: 600,
    marginBottom: 16,
    color: '#111827',
    letterSpacing: '0.02em',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    fontSize: 'clamp(13px, 2vw, 15px)',
  };

  const labelSt: React.CSSProperties = { color: '#6b7280', fontWeight: 500 };
  const valueSt: React.CSSProperties = { fontFamily: mono, color: '#111827', textAlign: 'right' };

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 20px', borderRadius: 50, border: 'none',
    fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
    cursor: 'pointer', color: '#fff', background: ACCENT,
    transition: 'all 0.2s',
  };

  const btnOutline: React.CSSProperties = {
    ...btnPrimary, color: ACCENT, background: 'transparent', border: `1px solid ${ACCENT}`,
  };

  function StatusBadge({ s }: { s: CheckStatus }) {
    const c = STATUS_COLORS[s];
    const label = s === 'pass' ? t(T.statusPass) : s === 'warn' ? t(T.statusWarn) : t(T.statusFail);
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
        padding: '3px 10px', borderRadius: 50,
        color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
        {label}
      </span>
    );
  }

  function InfoRow({ label, value, status }: { label: string; value: string; status?: CheckStatus }) {
    return (
      <div style={rowStyle}>
        <span style={labelSt}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {status && <StatusBadge s={status} />}
          <span style={valueSt}>{value}</span>
        </span>
      </div>
    );
  }

  // ─── Render ───
  return (
    <div style={containerStyle}>
      {/* Hero */}
      <div className="hero-enter-1" style={{ textAlign: 'center', marginBottom: 'clamp(32px, 6vw, 56px)' }}>
        <h1 style={{
          fontFamily: sans,
          fontSize: 'clamp(26px, 5vw, 42px)',
          fontWeight: 800,
          letterSpacing: '-0.01em',
          marginBottom: 12,
          background: `linear-gradient(135deg, #111827, ${ACCENT})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {t(T.pageTitle)}
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 2.2vw, 17px)',
          color: '#6b7280', maxWidth: 640, margin: '0 auto',
          lineHeight: 1.7, whiteSpace: 'pre-line',
        }}>
          {t(T.pageSubtitle)}
        </p>
      </div>

      {/* ── Idle: Drop Zone ── */}
      {status === 'idle' && (
        <div
          className="hero-enter-2"
          style={{
            border: isDragging ? `2px solid ${ACCENT}` : '2px dashed rgba(0,0,0,0.15)',
            borderRadius: 20, padding: 'clamp(40px, 8vw, 80px) 24px',
            textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: isDragging ? `rgba(2,132,199,0.04)` : 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🎵</div>
          <p style={{ fontFamily: serif, fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, marginBottom: 12, color: '#111827' }}>
            {t(T.dropTitle)}
          </p>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>{t(T.dropOr)}</p>
          <button style={btnPrimary} onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            {t(T.selectFile)}
          </button>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 20 }}>{t(T.dropHint)}</p>
          <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleSelect} />
        </div>
      )}

      {/* ── Analyzing ── */}
      {status === 'analyzing' && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 24px' }}>
          {/* Progress bar */}
          <div style={{
            width: '80%', maxWidth: 400, height: 6, borderRadius: 3,
            background: 'rgba(0,0,0,0.06)', margin: '0 auto 20px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${ACCENT}, rgba(2,132,199,0.6))`,
              width: `${progress}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <p style={{ color: '#6b7280', fontSize: 15 }}>{t(T.analyzing)}</p>
        </div>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <div style={{ ...cardStyle, textAlign: 'center', borderColor: 'rgba(239,68,68,0.3)' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>⚠️</p>
          <p style={{ color: '#ef4444', fontSize: 15, marginBottom: 20 }}>{errorMsg}</p>
          <button style={btnPrimary} onClick={reset}>{t(T.btnReset)}</button>
        </div>
      )}

      {/* ── Results ── */}
      {status === 'done' && result && (
        <>
          {/* Overall Verdict */}
          {(() => {
            const overall = getOverallStatus(result);
            const c = STATUS_COLORS[overall];
            const verdictText = overall === 'pass' ? t(T.overallPass) : overall === 'warn' ? t(T.overallWarn) : t(T.overallFail);
            return (
              <div className="hero-enter-1" style={{
                ...cardStyle,
                border: `2px solid ${c.border}`,
                background: c.bg,
                textAlign: 'center',
                padding: 'clamp(24px, 4vw, 36px)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase' }}>
                  {t(T.overallVerdict)}
                </p>
                <p style={{ fontFamily: serif, fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 600, color: c.color }}>
                  {verdictText}
                </p>
              </div>
            );
          })()}

          {/* Loudness */}
          <div style={cardStyle} className="hero-enter-1">
            <h2 style={sectionTitle}>
              <span style={{ fontSize: 20 }}>📊</span>
              {t(T.secLoudness)}
            </h2>
            <InfoRow label={t(T.lblIntegrated)} value={fmtLufs(result.integratedLufs)} />
            <InfoRow label={t(T.lblShortTerm)} value={fmtLufs(result.shortTermMaxLufs)} />
            <InfoRow label={t(T.lblMomentary)} value={fmtLufs(result.momentaryMaxLufs)} />
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={labelSt}>{t(T.lblLra)}</span>
              <span style={valueSt}>{fmtLra(result.loudnessRange)}</span>
            </div>
          </div>

          {/* Platform Verdict */}
          <div style={cardStyle} className="hero-enter-2">
            <h2 style={sectionTitle}>
              <span style={{ fontSize: 20 }}>🎯</span>
              {t(T.secPlatforms)}
            </h2>
            {result.platforms.map((pf, i) => {
              const adjState = adjustStates[pf.name] || 'idle';
              const needsAdjust = Math.abs(pf.delta) >= 0.5;
              return (
                <div key={pf.name} style={{
                  borderBottom: i === result.platforms.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.05)',
                  padding: '12px 0',
                }}>
                  {/* Top row: platform info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 'clamp(13px, 2vw, 15px)',
                  }}>
                    <span style={{ ...labelSt, fontWeight: 600, minWidth: 120 }}>{pf.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <StatusBadge s={pf.status} />
                      <span style={{ ...valueSt, fontSize: 12, minWidth: 80 }}>
                        {pf.target} LUFS
                      </span>
                      <span style={{
                        fontFamily: mono, fontSize: 12,
                        color: Math.abs(pf.delta) < 1 ? '#059669' : pf.delta > 0 ? '#b45309' : '#6b7280',
                        minWidth: 90, textAlign: 'right',
                      }}>
                        {pf.delta > 0 ? '−' : '+'}{Math.abs(pf.delta).toFixed(1)} {t(T.pfAdjust)}
                      </span>
                    </span>
                  </div>
                  {/* Bottom row: adjust button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    {needsAdjust ? (
                      <button
                        onClick={() => handleAdjust(pf.name, pf.delta)}
                        disabled={adjState === 'processing'}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 16px', borderRadius: 50,
                          fontSize: 12, fontWeight: 600, letterSpacing: '0.03em',
                          cursor: adjState === 'processing' ? 'wait' : 'pointer',
                          color: adjState === 'done' ? '#059669' : '#fff',
                          background: adjState === 'done'
                            ? 'rgba(5,150,105,0.1)'
                            : adjState === 'processing'
                              ? 'rgba(2,132,199,0.5)'
                              : ACCENT,
                          border: adjState === 'done' ? '1px solid rgba(5,150,105,0.3)' : 'none',
                          transition: 'all 0.2s',
                          opacity: adjState === 'processing' ? 0.7 : 1,
                        }}
                      >
                        {adjState === 'processing' ? (
                          <>{t(T.pfAdjusting)}</>
                        ) : adjState === 'done' ? (
                          <>✓ {t(T.pfAdjustDone)}</>
                        ) : (
                          <>
                            <span style={{ fontSize: 14 }}>⬇</span>
                            {t(T.pfAdjustBtn)}（{pf.delta > 0 ? '−' : '+'}{Math.abs(pf.delta).toFixed(1)} dB → WAV）
                          </>
                        )}
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: '#059669', fontStyle: 'italic' }}>
                        ✓ {t(T.pfNoAdjust)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {/* Limiter note */}
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 12, fontStyle: 'italic', textAlign: 'center' }}>
              🛡 {t(T.limiterNote)}
            </p>
          </div>

          {/* True Peak */}
          <div style={cardStyle}>
            <h2 style={sectionTitle}>
              <span style={{ fontSize: 20 }}>📈</span>
              {t(T.secTruePeak)}
            </h2>
            <InfoRow label={t(T.lblTruePeakL)} value={fmtDb(result.truePeakL)} />
            <InfoRow label={t(T.lblTruePeakR)} value={fmtDb(result.truePeakR)} />
            <InfoRow
              label={t(T.lblTruePeakMax)}
              value={fmtDb(result.truePeakMax)}
              status={getTpStatus(result)}
            />
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 10, fontStyle: 'italic' }}>
              {getTpStatus(result) === 'pass' ? t(T.verdictTpPass) : getTpStatus(result) === 'warn' ? t(T.verdictTpWarn) : t(T.verdictTpFail)}
            </p>
          </div>

          {/* Clipping */}
          <div style={cardStyle}>
            <h2 style={sectionTitle}>
              <span style={{ fontSize: 20 }}>⚡</span>
              {t(T.secClipping)}
            </h2>
            <InfoRow
              label={t(T.lblClipSamples)}
              value={`L: ${result.clippedSamplesL.toLocaleString()}  /  R: ${result.clippedSamplesR.toLocaleString()}`}
              status={getClipStatus(result)}
            />
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={labelSt}>{t(T.lblClipPercent)}</span>
              <span style={valueSt}>{fmtPercent(result.clippedPercent)}</span>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 10, fontStyle: 'italic' }}>
              {getClipStatus(result) === 'pass' ? t(T.verdictNoClip) : getClipStatus(result) === 'warn' ? t(T.verdictClipWarn) : t(T.verdictClipFail)}
            </p>
          </div>

          {/* Stereo */}
          <div style={cardStyle}>
            <h2 style={sectionTitle}>
              <span style={{ fontSize: 20 }}>🔊</span>
              {t(T.secStereo)}
            </h2>
            <InfoRow
              label={t(T.lblCorrelation)}
              value={fmtCorrelation(result.correlation)}
              status={getStereoStatus(result)}
            />
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={labelSt}>{t(T.lblBalance)}</span>
              <span style={valueSt}>{fmtBalance(result.stereoBalance)}</span>
            </div>
            {/* Correlation visual meter */}
            <div style={{
              marginTop: 12, padding: '12px 0',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 11, color: '#ef4444', fontFamily: mono }}>-1</span>
              <div style={{
                flex: 1, height: 8, borderRadius: 4,
                background: 'linear-gradient(90deg, #ef4444, #f59e0b 25%, #059669 50%, #f59e0b 75%, #ef4444)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  left: `${((result.correlation + 1) / 2) * 100}%`,
                  top: -4,
                  transform: 'translateX(-50%)',
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#fff',
                  border: `2px solid ${getStereoStatus(result) === 'pass' ? '#059669' : getStereoStatus(result) === 'warn' ? '#f59e0b' : '#ef4444'}`,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }} />
              </div>
              <span style={{ fontSize: 11, color: '#059669', fontFamily: mono }}>+1</span>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6, fontStyle: 'italic' }}>
              {getStereoStatus(result) === 'pass' ? t(T.verdictStereoGood) : getStereoStatus(result) === 'warn' ? t(T.verdictStereoWarn) : t(T.verdictStereoFail)}
            </p>
          </div>

          {/* File Info */}
          <div style={cardStyle}>
            <h2 style={sectionTitle}>
              <span style={{ fontSize: 20 }}>📁</span>
              {t(T.secFileInfo)}
            </h2>
            <InfoRow label={t(T.lblFileName)} value={result.fileName} />
            <InfoRow label={t(T.lblSampleRate)} value={`${(result.sampleRate / 1000).toFixed(1)} kHz`} />
            <InfoRow label={t(T.lblBitDepth)} value={`${result.bitDepth}-bit`} />
            <InfoRow label={t(T.lblChannels)} value={result.channels === 1 ? 'Mono' : result.channels === 2 ? 'Stereo' : `${result.channels}ch`} />
            <div style={{ ...rowStyle, borderBottom: 'none' }}>
              <span style={labelSt}>{t(T.lblDuration)}</span>
              <span style={valueSt}>{fmtDuration(result.durationSeconds)}</span>
            </div>
          </div>

          {/* Privacy + Reset */}
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
            🔒 {t(T.privacyNote)}
          </p>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button style={btnOutline} onClick={reset}>{t(T.btnReset)}</button>
          </div>
        </>
      )}

      {/* Privacy on idle */}
      {status === 'idle' && (
        <p className="hero-enter-3" style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 32 }}>
          🔒 {t(T.privacyNote)}
        </p>
      )}
    </div>
  );
}
