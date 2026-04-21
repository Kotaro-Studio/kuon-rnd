'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { AuthGate } from '@/components/AuthGate';
import { RegistrationNudge, useRegistrationNudge } from '@/components/RegistrationNudge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WasmModule = any;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type L3 = Partial<Record<Lang, string>> & { en: string };

type AppStatus = 'idle' | 'decoding' | 'resampling' | 'encoding' | 'done' | 'error';
type SampleRate = 44100 | 48000 | 88200 | 96000 | 176400 | 192000;
type Quality = 0 | 1 | 2;

interface FileInfo {
  name: string;
  size: number;
  sampleRate: number;
  channels: number;
  duration: number;
  bitDepth: number;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#0891B2';
const ACCENT_DARK = '#0E7490';

const SAMPLE_RATES: { rate: SampleRate; label: string }[] = [
  { rate: 44100, label: '44.1 kHz — CD' },
  { rate: 48000, label: '48 kHz — Video / Broadcast' },
  { rate: 88200, label: '88.2 kHz — Hi-Res (2× CD)' },
  { rate: 96000, label: '96 kHz — Hi-Res (2× 48k)' },
  { rate: 176400, label: '176.4 kHz — Hi-Res (4× CD)' },
  { rate: 192000, label: '192 kHz — Max' },
];

const QUALITY_PRESETS: { value: Quality; label: L3; desc: L3 }[] = [
  {
    value: 0,
    label: { ja: 'Standard', en: 'Standard', es: 'Estándar' },
    desc: {
      ja: '32タップ — 高速・十分な品質（-80dB ストップバンド）',
      en: '32-tap — Fast, good quality (-80dB stopband)',
      es: '32 taps — Rápido, buena calidad (-80dB)',
    },
  },
  {
    value: 1,
    label: { ja: 'High', en: 'High', es: 'Alta' },
    desc: {
      ja: '64タップ — プロフェッショナル品質（-100dB ストップバンド）',
      en: '64-tap — Professional quality (-100dB stopband)',
      es: '64 taps — Calidad profesional (-100dB)',
    },
  },
  {
    value: 2,
    label: { ja: 'Ultra', en: 'Ultra', es: 'Ultra' },
    desc: {
      ja: '128タップ — リファレンスグレード（-120dB ストップバンド）',
      en: '128-tap — Reference-grade (-120dB stopband)',
      es: '128 taps — Grado de referencia (-120dB)',
    },
  },
];

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  pageTitle: { ja: 'KUON\u00A0RESAMPLER', en: 'KUON\u00A0RESAMPLER', es: 'KUON\u00A0RESAMPLER', ko: 'KUON RESAMPLER' } as L3,
  pageSubtitle: {
    ja: '高品質サンプルレートコンバーター。\nSinc 補間 × Kaiser 窓 — インストール不要・サーバー送信なし。',
    en: 'High-quality sample rate converter.\nSinc interpolation × Kaiser window — no install, no server upload.',
    es: 'Convertidor de frecuencia de muestreo de alta calidad.\nInterpolación sinc × ventana Kaiser — sin instalación, sin subida al servidor.',
  } as L3,
  dropTitle: {
    ja: 'オーディオファイルをドロップ',
    en: 'Drop Your Audio File Here',
    es: 'Suelta tu archivo de audio aquí',
  } as L3,
  dropOr: { ja: 'または', en: 'or', es: 'o', ko: '또는' } as L3,
  selectFile: { ja: 'ファイルを選択', en: 'Select File', es: 'Seleccionar archivo', ko: '파일 선택' } as L3,
  dropHint: {
    ja: 'WAV / FLAC / MP3 / AAC / OGG 対応 — モノラル / ステレオ',
    en: 'WAV / FLAC / MP3 / AAC / OGG supported — Mono / Stereo',
    es: 'WAV / FLAC / MP3 / AAC / OGG compatibles — Mono / Estéreo',
  } as L3,
  fileInfo: { ja: 'ファイル情報', en: 'File Info', es: 'Info del archivo', ko: '파일 정보' } as L3,
  lblName: { ja: 'ファイル名', en: 'File Name', es: 'Nombre', ko: '파일 이름' } as L3,
  lblFormat: { ja: 'サンプルレート', en: 'Sample Rate', es: 'Frecuencia', ko: '샘플링 레이트' } as L3,
  lblChannels: { ja: 'チャンネル', en: 'Channels', es: 'Canales', ko: '채널' } as L3,
  lblDuration: { ja: '再生時間', en: 'Duration', es: 'Duración', ko: '재생 시간' } as L3,
  lblSize: { ja: 'ファイルサイズ', en: 'File Size', es: 'Tamaño', ko: '파일 크기' } as L3,
  targetRate: { ja: '出力サンプルレート', en: 'Output Sample Rate', es: 'Frecuencia de salida', ko: '출력 샘플링 레이트' } as L3,
  quality: { ja: 'フィルタ品質', en: 'Filter Quality', es: 'Calidad del filtro', ko: '필터 품질' } as L3,
  convertBtn: { ja: '変換してダウンロード', en: 'Convert & Download', es: 'Convertir y descargar', ko: '변환 및 다운로드' } as L3,
  sameRateWarn: {
    ja: '入力と同じサンプルレートです。変換の必要はありません。',
    en: 'Same as input sample rate. No conversion needed.',
    es: 'Misma frecuencia que la entrada. No se necesita conversión.',
  } as L3,
  decoding: {
    ja: 'デコード中…',
    en: 'Decoding…',
    es: 'Decodificando…',
  } as L3,
  resampling: {
    ja: 'リサンプリング中… Sinc 補間フィルタを適用しています',
    en: 'Resampling… Applying sinc interpolation filter',
    es: 'Remuestreando… Aplicando filtro de interpolación sinc',
  } as L3,
  encoding: {
    ja: 'WAV エンコード中…',
    en: 'Encoding WAV…',
    es: 'Codificando WAV…',
  } as L3,
  done: { ja: '変換完了', en: 'Conversion Complete', es: 'Conversión completada', ko: '변환 완료' } as L3,
  downloadBtn: { ja: 'WAV をダウンロード', en: 'Download WAV', es: 'Descargar WAV', ko: 'WAV 다운로드' } as L3,
  convertAnother: { ja: '別のファイルを変換', en: 'Convert Another File', es: 'Convertir otro archivo', ko: '다른 파일 변환' } as L3,
  privacy: {
    ja: 'すべての処理はブラウザ内で完結します。音声データがサーバーに送信されることはありません。',
    en: 'All processing happens in your browser. Audio data is never sent to a server.',
    es: 'Todo el procesamiento ocurre en tu navegador. Los datos de audio nunca se envían a un servidor.',
  } as L3,
  poweredBy: {
    ja: 'Windowed-Sinc Interpolation — 空音開発 Kuon R&D',
    en: 'Windowed-Sinc Interpolation — Kuon R&D',
    es: 'Interpolación Sinc con Ventana — Kuon R&D',
  } as L3,
  errorGeneric: {
    ja: 'エラーが発生しました。有効なオーディオファイルか確認してください。',
    en: 'An error occurred. Please verify the file is a valid audio file.',
    es: 'Ocurrió un error. Verifique que el archivo sea un archivo de audio válido.',
  } as L3,
  learnMore: {
    ja: 'リサンプリングとは？ 詳しく解説 →',
    en: 'What is resampling? Learn more →',
    es: '¿Qué es el remuestreo? Más info →',
  } as L3,
  downNote: {
    ja: 'ダウンサンプリング: アンチエイリアスフィルタで折り返しノイズを除去',
    en: 'Downsampling: Anti-aliasing filter removes aliasing artifacts',
    es: 'Submuestreo: El filtro anti-aliasing elimina artefactos',
  } as L3,
  upNote: {
    ja: 'アップサンプリング: 既存データの間を正確に補間（新しい情報は追加されません）',
    en: 'Upsampling: Precisely interpolates between existing samples (no new information added)',
    es: 'Sobremuestreo: Interpola entre muestras existentes (sin información nueva)',
  } as L3,
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatRate(rate: number): string {
  return rate >= 1000 ? `${(rate / 1000).toFixed(rate % 1000 === 0 ? 0 : 1)} kHz` : `${rate} Hz`;
}

// ─────────────────────────────────────────────
// JavaScript Sinc Resampler (fallback when Wasm is not available)
// Uses identical algorithm to the Rust version: windowed-sinc with Kaiser window
// ─────────────────────────────────────────────
function besselI0(x: number): number {
  let sum = 1.0;
  let term = 1.0;
  const halfX = x * 0.5;
  for (let k = 1; k <= 25; k++) {
    term *= (halfX / k) * (halfX / k);
    sum += term;
    if (term < 1e-20) break;
  }
  return sum;
}

function kaiserWindow(pos: number, beta: number, invI0Beta: number): number {
  if (Math.abs(pos) >= 1.0) return 0.0;
  const arg = 1.0 - pos * pos;
  if (arg <= 0.0) return 0.0;
  return besselI0(beta * Math.sqrt(arg)) * invI0Beta;
}

function sinc(x: number): number {
  if (Math.abs(x) < 1e-12) return 1.0;
  const px = Math.PI * x;
  return Math.sin(px) / px;
}

function qualityParams(preset: Quality): [number, number] {
  switch (preset) {
    case 0: return [32, 6.0];
    case 1: return [64, 9.0];
    case 2: return [128, 12.0];
  }
}

function resampleChannel(
  input: Float32Array,
  srIn: number,
  srOut: number,
  halfLen: number,
  beta: number,
  onProgress?: (pct: number) => void,
): Float32Array {
  const inLen = input.length;
  if (inLen === 0) return new Float32Array(0);

  const ratio = srOut / srIn;
  const outLen = Math.ceil(inLen * ratio);
  const cutoff = ratio < 1.0 ? ratio : 1.0;
  const gain = cutoff;
  const invI0Beta = 1.0 / besselI0(beta);

  const output = new Float32Array(outLen);

  for (let i = 0; i < outLen; i++) {
    const t = i / ratio;
    const center = Math.floor(t);
    let sum = 0.0;

    const start = Math.max(0, center - halfLen + 1);
    const end = Math.min(inLen - 1, center + halfLen);

    for (let j = start; j <= end; j++) {
      const delta = t - j;
      const sincVal = sinc(delta * cutoff);
      const windowPos = delta / halfLen;
      const windowVal = kaiserWindow(windowPos, beta, invI0Beta);
      sum += input[j] * sincVal * windowVal;
    }

    output[i] = sum * gain;

    // Report progress every 10000 samples
    if (onProgress && i % 10000 === 0) {
      onProgress(Math.round((i / outLen) * 100));
    }
  }

  return output;
}

function resampleAudio(
  inputData: Float32Array,
  channels: number,
  srIn: number,
  srOut: number,
  quality: Quality,
  onProgress?: (pct: number) => void,
): Float32Array {
  const [halfLen, beta] = qualityParams(quality);
  const frames = Math.floor(inputData.length / channels);

  if (channels === 1) {
    return resampleChannel(inputData, srIn, srOut, halfLen, beta, onProgress);
  }

  // De-interleave
  const channelData: Float32Array[] = [];
  for (let c = 0; c < channels; c++) {
    const ch = new Float32Array(frames);
    for (let f = 0; f < frames; f++) {
      ch[f] = inputData[f * channels + c];
    }
    channelData.push(ch);
  }

  // Resample each channel
  const resampled: Float32Array[] = [];
  for (let c = 0; c < channels; c++) {
    const r = resampleChannel(channelData[c], srIn, srOut, halfLen, beta, (pct) => {
      if (onProgress) onProgress(Math.round((c * 100 + pct) / channels));
    });
    resampled.push(r);
  }

  // Re-interleave
  const outFrames = Math.min(...resampled.map(r => r.length));
  const output = new Float32Array(outFrames * channels);
  for (let f = 0; f < outFrames; f++) {
    for (let c = 0; c < channels; c++) {
      output[f * channels + c] = resampled[c][f];
    }
  }

  return output;
}

// ─────────────────────────────────────────────
// WAV encoder (32-bit float)
// ─────────────────────────────────────────────
function encodeWav32Float(samples: Float32Array, sampleRate: number, channels: number): ArrayBuffer {
  const bytesPerSample = 4;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk — IEEE float
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 3, true); // IEEE float
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 32, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write float samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    view.setFloat32(offset, samples[i], true);
    offset += 4;
  }

  return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// ─────────────────────────────────────────────
// Wasm loader (Turbopack-compatible: fetch JS glue as blob → dynamic import)
// ─────────────────────────────────────────────
let _wasmCache: WasmModule | null = null;

async function loadWasm(): Promise<WasmModule | null> {
  if (_wasmCache) return _wasmCache;
  try {
    const jsText = await (await fetch('/wasm/kuon-resampler/kuon_resampler.js')).text();
    const patchedJs = jsText.replace(
      /new URL\(['"]kuon_resampler_bg\.wasm['"],\s*import\.meta\.url\)/,
      `"/wasm/kuon-resampler/kuon_resampler_bg.wasm"`,
    );
    const blob = new Blob([patchedJs], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    const wasmModule = await import(/* webpackIgnore: true */ blobUrl);
    URL.revokeObjectURL(blobUrl);
    await wasmModule.default('/wasm/kuon-resampler/kuon_resampler_bg.wasm');
    _wasmCache = wasmModule;
    return _wasmCache;
  } catch (e) {
    console.warn('Wasm not available, using JS fallback:', e);
    return null;
  }
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ResamplerPage() {
  const { lang } = useLang();
  const { guardAction, showNudge, setShowNudge } = useRegistrationNudge();

  const [status, setStatus] = useState<AppStatus>('idle');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [targetRate, setTargetRate] = useState<SampleRate>(48000);
  const [quality, setQuality] = useState<Quality>(1);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [wavUrl, setWavUrl] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState('');
  const [useWasm, setUseWasm] = useState(false);

  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasmRef = useRef<WasmModule | null>(null);

  // Pre-load Wasm on mount
  useEffect(() => {
    loadWasm().then((mod) => {
      if (mod) {
        wasmRef.current = mod;
        setUseWasm(true);
      }
    });
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setFileInfo(null);
    setProgress(0);
    setErrorMsg('');
    setDragOver(false);
    audioBufferRef.current = null;
    if (wavUrl) URL.revokeObjectURL(wavUrl);
    setWavUrl(null);
    setOutputFileName('');
  }, [wavUrl]);

  // ─── File handling ───
  const handleFile = useCallback(async (file: File) => {
    try {
      setStatus('decoding');
      setProgress(0);
      setErrorMsg('');

      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      audioCtx.close();

      audioBufferRef.current = audioBuffer;

      const info: FileInfo = {
        name: file.name,
        size: file.size,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
        duration: audioBuffer.duration,
        bitDepth: 32, // AudioBuffer is always 32-bit float internally
      };

      setFileInfo(info);

      // Auto-select a sensible target rate different from input
      const inputRate = audioBuffer.sampleRate;
      if (inputRate === 44100) setTargetRate(48000);
      else if (inputRate === 48000) setTargetRate(44100);
      else if (inputRate === 88200) setTargetRate(96000);
      else if (inputRate === 96000) setTargetRate(44100);
      else if (inputRate === 176400) setTargetRate(96000);
      else if (inputRate === 192000) setTargetRate(96000);
      else setTargetRate(44100);

      setStatus('idle');
    } catch (err) {
      console.error(err);
      setErrorMsg(T.errorGeneric[lang] ?? T.errorGeneric.en);
      setStatus('error');
    }
  }, [lang]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ─── Resample ───
  const handleConvert = useCallback(async () => {
    if (guardAction()) return;
    const audioBuffer = audioBufferRef.current;
    if (!audioBuffer || !fileInfo) return;

    try {
      setStatus('resampling');
      setProgress(0);

      const channels = audioBuffer.numberOfChannels;
      const frames = audioBuffer.length;

      // Interleave
      const interleaved = new Float32Array(frames * channels);
      for (let c = 0; c < channels; c++) {
        const ch = audioBuffer.getChannelData(c);
        for (let f = 0; f < frames; f++) {
          interleaved[f * channels + c] = ch[f];
        }
      }

      // Give UI a moment to update
      await new Promise(r => setTimeout(r, 50));

      // Resample: Wasm (fast) or JS fallback
      let resampled: Float32Array;
      if (wasmRef.current) {
        // Wasm path — entire resample in one call (much faster)
        resampled = wasmRef.current.resample(
          interleaved,
          channels,
          audioBuffer.sampleRate,
          targetRate,
          quality,
        );
        setProgress(90);
      } else {
        // JS fallback — same algorithm, slower
        resampled = resampleAudio(
          interleaved,
          channels,
          audioBuffer.sampleRate,
          targetRate,
          quality,
          (pct) => setProgress(pct),
        );
      }

      setStatus('encoding');
      setProgress(95);

      await new Promise(r => setTimeout(r, 20));

      // Encode to WAV (32-bit float)
      const wavBuffer = encodeWav32Float(resampled, targetRate, channels);

      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      const baseName = fileInfo.name.replace(/\.[^.]+$/, '');
      const outName = `${baseName}_${formatRate(targetRate).replace(' ', '')}.wav`;

      setWavUrl(url);
      setOutputFileName(outName);
      setProgress(100);
      setStatus('done');
    } catch (err) {
      console.error(err);
      setErrorMsg(T.errorGeneric[lang] ?? T.errorGeneric.en);
      setStatus('error');
    }
  }, [fileInfo, targetRate, quality, lang]);

  const isSameRate = fileInfo && fileInfo.sampleRate === targetRate;
  const isDown = fileInfo ? targetRate < fileInfo.sampleRate : false;

  // ─── Styles ───
  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 'clamp(20px, 4vw, 32px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: sans,
    fontSize: 'clamp(0.7rem, 1vw, 0.8rem)',
    fontWeight: 600,
    letterSpacing: '0.18em',
    color: ACCENT,
    textTransform: 'uppercase' as const,
    marginBottom: '1rem',
  };

  return (
    <AuthGate appName="resampler">
    <RegistrationNudge show={showNudge} onClose={() => setShowNudge(false)} feature="download" />
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f0fdfa 0%, #ecfeff 30%, #f0f9ff 60%, #f8fafc 100%)',
      padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* ─── Header ─── */}
        <header style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
          <h1 style={{
            fontFamily: sans,
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: '#0f172a',
            margin: 0,
          }}>
            {T.pageTitle[lang]}
          </h1>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
            color: '#64748b',
            lineHeight: 1.8,
            marginTop: '0.8rem',
            whiteSpace: 'pre-line',
          }}>
            {T.pageSubtitle[lang]}
          </p>
        </header>

        {/* ─── Drop zone ─── */}
        {!fileInfo && status !== 'error' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              ...glass,
              cursor: 'pointer',
              textAlign: 'center',
              padding: 'clamp(3rem, 8vw, 5rem) clamp(1.5rem, 4vw, 2rem)',
              border: dragOver
                ? `2px dashed ${ACCENT}`
                : '2px dashed rgba(0,0,0,0.12)',
              background: dragOver
                ? 'rgba(8,145,178,0.06)'
                : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s ease',
              marginBottom: '2rem',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.7 }}>
              🎵
            </div>
            <p style={{
              fontFamily: serif,
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: '#1e293b',
              fontWeight: 300,
              margin: 0,
            }}>
              {T.dropTitle[lang]}
            </p>
            <p style={{
              fontFamily: sans,
              fontSize: '0.8rem',
              color: '#94a3b8',
              margin: '0.8rem 0',
            }}>
              {T.dropOr[lang]}
            </p>
            <span style={{
              fontFamily: sans,
              fontSize: '0.82rem',
              color: ACCENT,
              fontWeight: 600,
              letterSpacing: '0.08em',
              padding: '0.5rem 1.5rem',
              border: `1px solid ${ACCENT}`,
              borderRadius: 999,
              display: 'inline-block',
            }}>
              {T.selectFile[lang]}
            </span>
            <p style={{
              fontFamily: mono,
              fontSize: '0.68rem',
              color: '#94a3b8',
              marginTop: '1.2rem',
              letterSpacing: '0.04em',
            }}>
              {T.dropHint[lang]}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.wav,.flac,.mp3,.aac,.ogg,.m4a,.aiff"
              style={{ display: 'none' }}
              onChange={onFileInput}
            />
          </div>
        )}

        {/* ─── Decoding state ─── */}
        {status === 'decoding' && (
          <div style={{ ...glass, textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: `3px solid ${ACCENT}20`, borderTopColor: ACCENT,
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }} />
            <p style={{ fontFamily: sans, color: '#475569', fontSize: '0.9rem' }}>
              {T.decoding[lang]}
            </p>
          </div>
        )}

        {/* ─── Error ─── */}
        {status === 'error' && (
          <div style={{ ...glass, textAlign: 'center', marginBottom: '2rem', borderColor: '#fca5a5' }}>
            <p style={{ fontFamily: sans, color: '#dc2626', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {errorMsg || T.errorGeneric[lang]}
            </p>
            <button onClick={reset} style={{
              fontFamily: sans, fontSize: '0.82rem', fontWeight: 600,
              color: '#fff', background: ACCENT, border: 'none',
              padding: '0.6rem 1.5rem', borderRadius: 999, cursor: 'pointer',
            }}>
              {T.convertAnother[lang]}
            </button>
          </div>
        )}

        {/* ─── File info + settings ─── */}
        {fileInfo && status !== 'error' && (
          <>
            {/* File info */}
            <div style={{ ...glass, marginBottom: '1.5rem' }}>
              <p style={sectionTitle}>{T.fileInfo[lang]}</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '0.4rem 1.2rem',
                fontFamily: mono,
                fontSize: '0.78rem',
                color: '#334155',
              }}>
                <span style={{ color: '#94a3b8' }}>{T.lblName[lang]}</span>
                <span style={{ wordBreak: 'break-all' }}>{fileInfo.name}</span>
                <span style={{ color: '#94a3b8' }}>{T.lblFormat[lang]}</span>
                <span>{formatRate(fileInfo.sampleRate)}</span>
                <span style={{ color: '#94a3b8' }}>{T.lblChannels[lang]}</span>
                <span>{fileInfo.channels === 1 ? 'Mono' : fileInfo.channels === 2 ? 'Stereo' : `${fileInfo.channels}ch`}</span>
                <span style={{ color: '#94a3b8' }}>{T.lblDuration[lang]}</span>
                <span>{formatDuration(fileInfo.duration)}</span>
                <span style={{ color: '#94a3b8' }}>{T.lblSize[lang]}</span>
                <span>{formatSize(fileInfo.size)}</span>
              </div>
            </div>

            {/* Conversion settings */}
            {status !== 'done' && (
              <div style={{ ...glass, marginBottom: '1.5rem' }}>
                {/* Target sample rate */}
                <p style={sectionTitle}>{T.targetRate[lang]}</p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                }}>
                  {SAMPLE_RATES.map((sr) => {
                    const active = targetRate === sr.rate;
                    const isSame = fileInfo.sampleRate === sr.rate;
                    return (
                      <button
                        key={sr.rate}
                        onClick={() => setTargetRate(sr.rate)}
                        style={{
                          fontFamily: mono,
                          fontSize: '0.76rem',
                          padding: '0.6rem 0.8rem',
                          borderRadius: 10,
                          border: active ? `2px solid ${ACCENT}` : '1px solid rgba(0,0,0,0.08)',
                          background: active ? `${ACCENT}10` : 'rgba(255,255,255,0.5)',
                          color: isSame ? '#94a3b8' : active ? ACCENT : '#334155',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                        }}
                      >
                        {sr.label}
                        {isSame && (
                          <span style={{
                            display: 'block',
                            fontSize: '0.62rem',
                            color: '#94a3b8',
                            marginTop: '0.15rem',
                          }}>
                            = {lang === 'ja' ? '入力と同じ' : lang === 'en' ? 'same as input' : 'igual que entrada'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Direction indicator */}
                {!isSameRate && (
                  <p style={{
                    fontFamily: sans,
                    fontSize: '0.72rem',
                    color: '#64748b',
                    marginBottom: '1.2rem',
                    padding: '0.5rem 0.8rem',
                    background: 'rgba(0,0,0,0.02)',
                    borderRadius: 8,
                    borderLeft: `3px solid ${ACCENT}`,
                  }}>
                    {isDown ? '↓ ' : '↑ '}
                    {formatRate(fileInfo.sampleRate)} → {formatRate(targetRate)}
                    {'  —  '}
                    {isDown ? T.downNote[lang] : T.upNote[lang]}
                  </p>
                )}

                {/* Quality preset */}
                <p style={sectionTitle}>{T.quality[lang]}</p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                }}>
                  {QUALITY_PRESETS.map((q) => {
                    const active = quality === q.value;
                    return (
                      <button
                        key={q.value}
                        onClick={() => setQuality(q.value)}
                        style={{
                          fontFamily: sans,
                          fontSize: '0.8rem',
                          padding: '0.7rem 1rem',
                          borderRadius: 10,
                          border: active ? `2px solid ${ACCENT}` : '1px solid rgba(0,0,0,0.08)',
                          background: active ? `${ACCENT}10` : 'rgba(255,255,255,0.5)',
                          color: active ? ACCENT_DARK : '#334155',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <strong>{q.label[lang]}</strong>
                        <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {q.desc[lang]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Same rate warning */}
                {isSameRate && (
                  <p style={{
                    fontFamily: sans, fontSize: '0.78rem', color: '#f59e0b',
                    padding: '0.6rem 0.8rem', background: '#fffbeb', borderRadius: 8,
                    marginBottom: '1rem',
                  }}>
                    ⚠ {T.sameRateWarn[lang]}
                  </p>
                )}

                {/* Convert button */}
                <button
                  onClick={handleConvert}
                  disabled={!!isSameRate || status === 'resampling' || status === 'encoding'}
                  style={{
                    width: '100%',
                    fontFamily: sans,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: '#fff',
                    background: isSameRate ? '#cbd5e1' : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: 999,
                    cursor: isSameRate ? 'not-allowed' : 'pointer',
                    boxShadow: isSameRate ? 'none' : `0 8px 24px ${ACCENT}40`,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {T.convertBtn[lang]}
                </button>
              </div>
            )}

            {/* ─── Processing ─── */}
            {(status === 'resampling' || status === 'encoding') && (
              <div style={{ ...glass, textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: sans, color: '#475569', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {status === 'resampling' ? T.resampling[lang] : T.encoding[lang]}
                </p>
                <div style={{
                  width: '100%', height: 6, background: 'rgba(0,0,0,0.06)',
                  borderRadius: 3, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK})`,
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <p style={{ fontFamily: mono, fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  {progress}%
                </p>
              </div>
            )}

            {/* ─── Done ─── */}
            {status === 'done' && wavUrl && (
              <div style={{ ...glass, textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                <p style={{
                  fontFamily: sans, fontSize: '1rem', fontWeight: 600,
                  color: '#059669', marginBottom: '0.3rem',
                }}>
                  {T.done[lang]}
                </p>
                <p style={{
                  fontFamily: mono, fontSize: '0.72rem', color: '#64748b',
                  marginBottom: '1.2rem',
                }}>
                  {formatRate(fileInfo.sampleRate)} → {formatRate(targetRate)}
                  {'  ·  '}
                  {QUALITY_PRESETS.find(q => q.value === quality)?.label[lang]}
                  {'  ·  32-bit float WAV'}
                </p>
                <a
                  href={wavUrl}
                  download={outputFileName}
                  style={{
                    display: 'inline-block',
                    fontFamily: sans,
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#fff',
                    background: `linear-gradient(135deg, #059669, #047857)`,
                    padding: '0.8rem 2rem',
                    borderRadius: 999,
                    textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(5,150,105,0.3)',
                    marginBottom: '1rem',
                  }}
                >
                  {T.downloadBtn[lang]}
                </a>
                <br />
                <button
                  onClick={reset}
                  style={{
                    fontFamily: sans, fontSize: '0.78rem', color: ACCENT,
                    background: 'none', border: 'none', cursor: 'pointer',
                    marginTop: '1rem', padding: '0.4rem',
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                  }}
                >
                  {T.convertAnother[lang]}
                </button>
              </div>
            )}
          </>
        )}

        {/* ─── Learn more link ─── */}
        <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
          <Link
            href="/resampler-lp"
            style={{
              fontFamily: sans,
              fontSize: '0.78rem',
              color: ACCENT,
              textDecoration: 'none',
              letterSpacing: '0.04em',
            }}
          >
            {T.learnMore[lang]}
          </Link>
        </div>

        {/* ─── Footer ─── */}
        <footer style={{ textAlign: 'center', padding: '2rem 0' }}>
          <p style={{
            fontFamily: sans,
            fontSize: '0.68rem',
            color: '#94a3b8',
            lineHeight: 1.8,
            marginBottom: '0.5rem',
          }}>
            {T.privacy[lang]}
          </p>
          <p style={{
            fontFamily: mono,
            fontSize: '0.62rem',
            color: '#cbd5e1',
            letterSpacing: '0.12em',
          }}>
            {T.poweredBy[lang]}
            {useWasm && (
              <span style={{ color: '#059669', marginLeft: '0.5em' }}>
                ⚡ Rust WebAssembly
              </span>
            )}
          </p>
        </footer>
      </div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
    </AuthGate>
  );
}
