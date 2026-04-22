'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { AuthGate } from '@/components/AuthGate';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type L3 = Partial<Record<Lang, string>> & { en: string };

type AppStatus = 'idle' | 'loading-wasm' | 'parsing' | 'decoding' | 'playing' | 'paused' | 'converting' | 'done' | 'error';
type SampleRate = 44100 | 48000 | 88200 | 96000 | 176400 | 192000;

interface DsdFileInfo {
  format: string;
  channels: number;
  dsdSampleRate: number;
  totalDsdSamples: number;
  dataOffset: number;
  dataSize: number;
  blockSizePerChannel: number;
  dsdType: string;
  duration: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WasmModule = any;

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#7C3AED';
const ACCENT_DARK = '#6D28D9';

/** Chunk size for reading DSD audio data (8 MB) */
const CHUNK_SIZE = 8 * 1024 * 1024;

const SAMPLE_RATES: { rate: SampleRate; label: string }[] = [
  { rate: 44100, label: '44.1 kHz — CD' },
  { rate: 48000, label: '48 kHz — Broadcast' },
  { rate: 88200, label: '88.2 kHz — Hi-Res (2x CD)' },
  { rate: 96000, label: '96 kHz — Hi-Res (2x 48k)' },
  { rate: 176400, label: '176.4 kHz — Hi-Res (4x CD)' },
  { rate: 192000, label: '192 kHz — Max Quality' },
];

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  pageTitle: { ja: 'KUON DSD', en: 'KUON DSD', es: 'KUON DSD' } as L3,
  pageSubtitle: {
    ja: 'DSD ファイルをブラウザで再生・PCM 変換。\n世界初 — インストール不要・サーバー送信なし。',
    en: 'Play & convert DSD files in your browser.\nWorld\'s first — no install, no server upload.',
    es: 'Reproduce y convierte archivos DSD en tu navegador.\nPrimero en el mundo — sin instalación, sin subir al servidor.',
  } as L3,
  dropTitle: {
    ja: 'DSD ファイルをドロップ',
    en: 'Drop Your DSD File Here',
    es: 'Suelta tu archivo DSD aquí',
  } as L3,
  dropOr: { ja: 'または', en: 'or', es: 'o' } as L3,
  selectFile: { ja: 'ファイルを選択', en: 'Select File', es: 'Seleccionar archivo' } as L3,
  dropHint: {
    ja: 'DSF / DFF (DSDIFF) 対応 — DSD64 / DSD128 / DSD256 — GB級ファイル対応',
    en: 'DSF / DFF (DSDIFF) supported — DSD64 / DSD128 / DSD256 — handles GB-size files',
    es: 'DSF / DFF (DSDIFF) compatible — DSD64 / DSD128 / DSD256 — soporta archivos de GB',
  } as L3,
  fileInfo: { ja: 'ファイル情報', en: 'File Info', es: 'Info del archivo' } as L3,
  lblFormat: { ja: 'フォーマット', en: 'Format', es: 'Formato' } as L3,
  lblDsdType: { ja: 'DSD タイプ', en: 'DSD Type', es: 'Tipo DSD' } as L3,
  lblChannels: { ja: 'チャンネル', en: 'Channels', es: 'Canales' } as L3,
  lblDsdRate: { ja: 'DSD サンプルレート', en: 'DSD Sample Rate', es: 'Frecuencia DSD' } as L3,
  lblDuration: { ja: '再生時間', en: 'Duration', es: 'Duración' } as L3,
  lblFileSize: { ja: 'ファイルサイズ', en: 'File Size', es: 'Tamaño' } as L3,
  sectionPlay: { ja: '再生', en: 'Play', es: 'Reproducir' } as L3,
  playBtn: { ja: '再生', en: 'Play', es: 'Reproducir' } as L3,
  pauseBtn: { ja: '一時停止', en: 'Pause', es: 'Pausa' } as L3,
  resumeBtn: { ja: '再開', en: 'Resume', es: 'Reanudar' } as L3,
  decodingNote: {
    ja: 'DSD → PCM 変換中… 初回のみ処理が必要です',
    en: 'Decoding DSD → PCM… Only needed on first play',
    es: 'Decodificando DSD → PCM… Solo necesario la primera vez',
  } as L3,
  playNote: {
    ja: '初回再生時に DSD → PCM 変換を行います（44.1kHz）。2回目以降は即座に再生されます。',
    en: 'First play decodes DSD → PCM (44.1kHz). Subsequent plays are instant.',
    es: 'La primera reproducción decodifica DSD → PCM (44.1kHz). Las siguientes son instantáneas.',
  } as L3,
  sectionConvert: { ja: 'WAV に変換', en: 'Convert to WAV', es: 'Convertir a WAV' } as L3,
  targetRate: { ja: '出力サンプルレート', en: 'Output Sample Rate', es: 'Frecuencia de salida' } as L3,
  convertBtn: { ja: '変換してダウンロード', en: 'Convert & Download', es: 'Convertir y descargar' } as L3,
  converting: {
    ja: '変換中… チャンク処理でストリーミング変換しています',
    en: 'Converting… Streaming chunk-by-chunk processing',
    es: 'Convirtiendo… Procesamiento por fragmentos en streaming',
  } as L3,
  done: { ja: '変換完了', en: 'Conversion Complete', es: 'Conversión completada' } as L3,
  downloadBtn: { ja: 'WAV をダウンロード', en: 'Download WAV', es: 'Descargar WAV' } as L3,
  convertAnother: { ja: '別のファイルを変換', en: 'Convert Another File', es: 'Convertir otro archivo' } as L3,
  loadingWasm: {
    ja: 'DSD エンジンを読み込み中…',
    en: 'Loading DSD engine…',
    es: 'Cargando motor DSD…',
  } as L3,
  errorGeneric: {
    ja: 'エラーが発生しました。有効な DSD ファイル（DSF / DFF）か確認してください。',
    en: 'An error occurred. Please verify the file is a valid DSD file (DSF / DFF).',
    es: 'Ocurrió un error. Verifique que el archivo sea DSD válido (DSF / DFF).',
  } as L3,
  errorWasm: {
    ja: 'DSD エンジンの読み込みに失敗しました。ページをリロードしてください。',
    en: 'Failed to load DSD engine. Please reload the page.',
    es: 'Error al cargar el motor DSD. Recarga la página.',
  } as L3,
  errorRateNotSupported: {
    ja: 'このサンプルレートへの変換はサポートされていません（DSD サンプルレートの整数分の1である必要があります）',
    en: 'This sample rate conversion is not supported (must be an integer divisor of the DSD sample rate)',
    es: 'Esta conversión de frecuencia no es compatible (debe ser un divisor entero de la frecuencia DSD)',
  } as L3,
  rateUnavailableReason: {
    ja: 'DSDレートの整数分の1ではないため変換不可',
    en: 'Not an integer divisor of DSD rate',
    es: 'No es divisor entero de la frecuencia DSD',
  } as L3,
  privacy: {
    ja: 'すべての処理はブラウザ内で完結します。音声データがサーバーに送信されることはありません。',
    en: 'All processing happens in your browser. Audio data is never sent to a server.',
    es: 'Todo el procesamiento ocurre en tu navegador. Los datos de audio nunca se envían a un servidor.',
  } as L3,
  poweredBy: {
    ja: 'Powered by Rust WebAssembly — 空音開発 Kuon R&D',
    en: 'Powered by Rust WebAssembly — Kuon R&D',
    es: 'Desarrollado con Rust WebAssembly — Kuon R&D',
  } as L3,
  progressLabel: {
    ja: '処理中',
    en: 'Processing',
    es: 'Procesando',
  } as L3,
  // How it works + share
  howItWorks: { ja: 'この技術の仕組み →', en: 'How this works →', es: 'Cómo funciona →' } as L3,
  shareNudge: { ja: 'ブラウザでDSDを再生できることを、まだ知らない人がいます。', en: 'Some audiophiles still don\'t know you can play DSD in a browser.', es: 'Algunos audiófilos aún no saben que pueden reproducir DSD en el navegador.' } as L3,
  btnShareX: { ja: 'Xでシェア', en: 'Share on X', es: 'Compartir en X' } as L3,
  shareText: { ja: 'DSDファイルをブラウザで再生・変換。世界初。Rust WebAssembly搭載。', en: 'Playing DSD files in the browser. World\'s first. Powered by Rust WebAssembly.', es: 'Reproduciendo archivos DSD en el navegador. Primero en el mundo. Powered by Rust WebAssembly.' } as L3,
  techDetail: { ja: '処理詳細', en: 'Processing Details', es: 'Detalles del procesamiento' } as L3,
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

function dsdTypeName(rate: number): string {
  if (rate <= 2_822_400) return 'DSD64';
  if (rate <= 5_644_800) return 'DSD128';
  if (rate <= 11_289_600) return 'DSD256';
  if (rate <= 22_579_200) return 'DSD512';
  return `DSD (${(rate / 1_000_000).toFixed(1)} MHz)`;
}

function getAvailableRates(dsdRate: number): SampleRate[] {
  return SAMPLE_RATES
    .filter(sr => dsdRate % sr.rate === 0)
    .map(sr => sr.rate);
}

// ─────────────────────────────────────────────
// Wasm loader (fetch JS glue as blob -> dynamic import to bypass Turbopack)
// ─────────────────────────────────────────────
let _wasmCache: WasmModule | null = null;

async function loadWasm(): Promise<WasmModule> {
  if (_wasmCache) return _wasmCache;

  const jsText = await (await fetch('/wasm/kuon_dsd_converter.js')).text();
  const patchedJs = jsText.replace(
    /new URL\(['"]kuon_dsd_converter_bg\.wasm['"],\s*import\.meta\.url\)/,
    `"/wasm/kuon_dsd_converter_bg.wasm"`
  );

  const blob = new Blob([patchedJs], { type: 'application/javascript' });
  const blobUrl = URL.createObjectURL(blob);
  const wasmModule = await import(/* webpackIgnore: true */ blobUrl);
  URL.revokeObjectURL(blobUrl);

  await wasmModule.default('/wasm/kuon_dsd_converter_bg.wasm');
  _wasmCache = wasmModule;
  return _wasmCache;
}

// ─────────────────────────────────────────────
// Streaming chunk reader: reads file in CHUNK_SIZE pieces
// ─────────────────────────────────────────────
async function processFileInChunks(
  file: File,
  dataOffset: number,
  dataSize: number,
  wasm: WasmModule,
  fileInfo: DsdFileInfo,
  targetRate: number,
  onProgress: (pct: number) => void,
): Promise<Uint8Array> {
  // Create a DsdProcessor
  const processor = new wasm.DsdProcessor(
    fileInfo.format,
    fileInfo.channels,
    fileInfo.dsdSampleRate,
    targetRate,
    fileInfo.blockSizePerChannel,
  );

  const totalBytes = dataSize > 0 ? dataSize : (file.size - dataOffset);
  const pcmChunks: Uint8Array[] = [];
  let bytesRead = 0;

  while (bytesRead < totalBytes) {
    const start = dataOffset + bytesRead;
    const end = Math.min(start + CHUNK_SIZE, dataOffset + totalBytes);
    const chunkSize = end - start;

    // Read this chunk from the file (no full-file memory needed!)
    const sliceBlob = file.slice(start, end);
    const chunkBuffer = await sliceBlob.arrayBuffer();
    const chunkBytes = new Uint8Array(chunkBuffer);

    // Process chunk through Wasm -> get PCM f32 bytes
    const pcmF32Bytes: Uint8Array = processor.process_chunk(chunkBytes);
    if (pcmF32Bytes.length > 0) {
      // Copy to a native Uint8Array (wasm_bindgen returns a special Uint8Array)
      pcmChunks.push(new Uint8Array(pcmF32Bytes));
    }

    bytesRead += chunkSize;
    onProgress(Math.min(100, Math.round((bytesRead / totalBytes) * 100)));

    // Yield to let UI update
    await new Promise(r => setTimeout(r, 0));
  }

  // Free the processor
  try { processor.free(); } catch { /* ignore */ }

  // Concatenate all PCM chunks
  const totalPcmLength = pcmChunks.reduce((sum, c) => sum + c.length, 0);
  const allPcm = new Uint8Array(totalPcmLength);
  let offset = 0;
  for (const chunk of pcmChunks) {
    allPcm.set(chunk, offset);
    offset += chunk.length;
  }

  return allPcm;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function DsdPage() {
  const { lang } = useLang();
  const t = (obj: L3) => obj[lang] || obj.en;

  const [status, setStatus] = useState<AppStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<DsdFileInfo | null>(null);
  const [targetRate, setTargetRate] = useState<SampleRate>(44100);
  const [availableRates, setAvailableRates] = useState<SampleRate[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const playStartWallTimeRef = useRef(0);
  const playStartOffsetRef = useRef(0);
  const rafRef = useRef<number>(0);

  // ─── File handling (header-only read) ─────
  const handleFile = useCallback(async (file: File) => {
    try {
      // Store file reference for later chunk reading
      fileRef.current = file;

      setStatus('loading-wasm');
      setErrorMsg('');
      setDownloadUrl(null);
      setFileInfo(null);
      setSelectedFile(file);
      setProgress(0);

      const wasm = await loadWasm();
      setStatus('parsing');

      // Read ONLY the first 128KB for header parsing (not the whole file!)
      const headerSize = Math.min(file.size, 128 * 1024);
      const headerSlice = file.slice(0, headerSize);
      const headerBuffer = await headerSlice.arrayBuffer();
      const headerBytes = new Uint8Array(headerBuffer);

      // Parse header via Wasm
      const infoJson: string = wasm.dsd_parse_header(headerBytes);
      const info = JSON.parse(infoJson);

      const dsdType = dsdTypeName(info.dsdSampleRate);
      const duration = info.totalDsdSamples / info.dsdSampleRate;
      const rates = getAvailableRates(info.dsdSampleRate);

      const parsedInfo: DsdFileInfo = {
        format: info.format,
        channels: info.channels,
        dsdSampleRate: info.dsdSampleRate,
        totalDsdSamples: info.totalDsdSamples,
        dataOffset: info.dataOffset,
        dataSize: info.dataSize,
        blockSizePerChannel: info.blockSizePerChannel,
        dsdType,
        duration,
      };

      setFileInfo(parsedInfo);
      setAvailableRates(rates);
      if (rates.length > 0 && !rates.includes(targetRate)) {
        setTargetRate(rates[0]);
      }

      setStatus('idle');
    } catch (err) {
      console.error('DSD parse error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('engine') || msg.includes('wasm')) {
        setErrorMsg(t(T.errorWasm));
      } else {
        setErrorMsg(msg || t(T.errorGeneric));
      }
      setStatus('error');
      setSelectedFile(null);
    }
  }, [lang, targetRate]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ─── Playback time tracking ─────────────────
  const updatePlaybackTime = useCallback(() => {
    if (status === 'playing' && audioCtxRef.current) {
      const elapsed = audioCtxRef.current.currentTime - playStartWallTimeRef.current;
      const current = playStartOffsetRef.current + elapsed;
      setPlaybackTime(Math.min(current, playbackDuration));
    }
    rafRef.current = requestAnimationFrame(updatePlaybackTime);
  }, [status, playbackDuration]);

  useEffect(() => {
    if (status === 'playing') {
      rafRef.current = requestAnimationFrame(updatePlaybackTime);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, updatePlaybackTime]);

  // ─── Decode DSD → AudioBuffer (cached) ─────
  const ensureAudioBuffer = useCallback(async (): Promise<AudioBuffer | null> => {
    // Return cached buffer if available
    if (audioBufferRef.current) return audioBufferRef.current;
    if (!fileRef.current || !fileInfo) return null;

    setStatus('decoding');
    setProgress(0);

    const wasm = await loadWasm();
    const allPcmBytes = await processFileInChunks(
      fileRef.current,
      fileInfo.dataOffset,
      fileInfo.dataSize,
      wasm,
      fileInfo,
      44100,
      setProgress,
    );

    const float32 = new Float32Array(
      allPcmBytes.buffer, allPcmBytes.byteOffset, allPcmBytes.byteLength / 4,
    );
    const channels = fileInfo.channels;
    const samplesPerChannel = Math.floor(float32.length / channels);

    // Reuse or create AudioContext
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext({ sampleRate: 44100 });
    }
    const ctx = audioCtxRef.current;

    const buf = ctx.createBuffer(channels, samplesPerChannel, 44100);
    for (let ch = 0; ch < channels; ch++) {
      const channelData = buf.getChannelData(ch);
      for (let i = 0; i < samplesPerChannel; i++) {
        channelData[i] = float32[i * channels + ch];
      }
    }

    audioBufferRef.current = buf;
    setPlaybackDuration(buf.duration);
    return buf;
  }, [fileInfo]);

  // ─── Start playback from a given offset ────
  const startPlaybackFrom = useCallback((offset: number) => {
    const buf = audioBufferRef.current;
    const ctx = audioCtxRef.current;
    if (!buf || !ctx) return;

    // Stop any existing source
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
      sourceNodeRef.current = null;
    }

    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.connect(ctx.destination);
    source.onended = () => {
      // Only go to paused if we weren't manually stopped/seeked
      if (sourceNodeRef.current === source) {
        setPlaybackTime(buf.duration);
        setStatus('paused');
      }
    };

    const clampedOffset = Math.max(0, Math.min(offset, buf.duration));
    playStartOffsetRef.current = clampedOffset;
    playStartWallTimeRef.current = ctx.currentTime;
    source.start(0, clampedOffset);
    sourceNodeRef.current = source;
    setPlaybackTime(clampedOffset);
    setStatus('playing');
  }, []);

  // ─── Play button handler ───────────────────
  const play = useCallback(async () => {
    try {
      const buf = await ensureAudioBuffer();
      if (!buf) return;

      // If paused, resume from current position; otherwise start from 0
      const offset = status === 'paused' ? playbackTime : 0;

      // Ensure AudioContext is running (may be suspended after user gesture)
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      startPlaybackFrom(offset);
    } catch (err) {
      console.error('Playback error:', err);
      setErrorMsg(t(T.errorGeneric));
      setStatus('error');
    }
  }, [ensureAudioBuffer, startPlaybackFrom, status, playbackTime, lang]);

  // ─── Pause ─────────────────────────────────
  const pause = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
      sourceNodeRef.current = null;
    }
    // Calculate where we stopped
    if (audioCtxRef.current) {
      const elapsed = audioCtxRef.current.currentTime - playStartWallTimeRef.current;
      const current = playStartOffsetRef.current + elapsed;
      setPlaybackTime(Math.min(current, playbackDuration));
    }
    setStatus('paused');
  }, [playbackDuration]);

  // ─── Seek ──────────────────────────────────
  const seekTo = useCallback((time: number) => {
    const clamped = Math.max(0, Math.min(time, playbackDuration));
    setPlaybackTime(clamped);

    if (status === 'playing') {
      // Restart playback from new position
      startPlaybackFrom(clamped);
    } else {
      // Just update position (will start from here on next play)
      playStartOffsetRef.current = clamped;
    }
  }, [status, playbackDuration, startPlaybackFrom]);

  const handleSeekBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (playbackDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    seekTo(ratio * playbackDuration);
  }, [playbackDuration, seekTo]);

  // ─── Conversion (streamed chunk processing) ─
  const convert = useCallback(async () => {
    if (!fileRef.current || !fileInfo) return;

    if (fileInfo.dsdSampleRate % targetRate !== 0) {
      setErrorMsg(t(T.errorRateNotSupported));
      return;
    }

    try {
      setStatus('converting');
      setDownloadUrl(null);
      setErrorMsg('');
      setProgress(0);

      await new Promise(r => setTimeout(r, 50));

      const wasm = await loadWasm();

      // Process file in chunks
      const allPcmBytes = await processFileInChunks(
        fileRef.current,
        fileInfo.dataOffset,
        fileInfo.dataSize,
        wasm,
        fileInfo,
        targetRate,
        setProgress,
      );

      // Encode as 24-bit WAV
      const wavBytes: Uint8Array = wasm.encode_wav_24bit(
        allPcmBytes,
        fileInfo.channels,
        targetRate,
      );

      // Create download Blob (use .slice(0) to get native Uint8Array for Blob compat)
      const nativeWav = wavBytes.slice(0);
      const wavBlob = new Blob([nativeWav], { type: 'audio/wav' });
      const url = URL.createObjectURL(wavBlob);

      const baseName = (selectedFile?.name || 'dsd').replace(/\.(dsf|dff)$/i, '');
      const rateName = targetRate >= 1000 ? `${(targetRate / 1000).toFixed(1)}k` : `${targetRate}`;
      setDownloadName(`${baseName}_${rateName}_24bit.wav`);
      setDownloadUrl(url);
      setStatus('done');
    } catch (err) {
      console.error('Conversion error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || t(T.errorGeneric));
      setStatus('error');
    }
  }, [selectedFile, fileInfo, targetRate, lang]);

  // ─── Reset ─────────────────────────────────
  const reset = useCallback(() => {
    // Stop playback
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
      sourceNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    audioBufferRef.current = null;
    setStatus('idle');
    setSelectedFile(null);
    setFileInfo(null);
    setDownloadUrl(null);
    setDownloadName('');
    setErrorMsg('');
    setProgress(0);
    setPlaybackTime(0);
    setPlaybackDuration(0);
    fileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [downloadUrl]);

  // ─── Styles ────────────────────────────────
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#fafafa',
    fontFamily: sans,
    color: '#1e293b',
  };

  const heroStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem) clamp(1.5rem, 3vw, 2.5rem)',
    background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
    borderBottom: '1px solid #e2e8f0',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#0f172a',
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: sans,
    fontSize: 'clamp(0.85rem, 2vw, 1rem)',
    color: '#64748b',
    marginTop: '0.75rem',
    lineHeight: 1.7,
    whiteSpace: 'pre-line',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 680,
    margin: '0 auto',
    padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 1.5rem)',
  };

  const dropZoneStyle: React.CSSProperties = {
    border: `2px dashed ${isDragging ? ACCENT : '#cbd5e1'}`,
    borderRadius: 16,
    padding: 'clamp(2rem, 5vw, 3rem) 1.5rem',
    textAlign: 'center',
    background: isDragging ? '#faf5ff' : '#fff',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: sans,
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: ACCENT,
    border: 'none',
    padding: '0.9rem 2.2rem',
    borderRadius: 50,
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'all 0.2s ease',
    boxShadow: `0 4px 12px rgba(124,58,237,0.2)`,
  };

  const btnOutline: React.CSSProperties = {
    ...btnPrimary,
    backgroundColor: 'transparent',
    color: ACCENT,
    border: `2px solid ${ACCENT}`,
    boxShadow: 'none',
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    marginTop: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: sans,
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '0.5rem',
  };

  const isProcessing = status === 'loading-wasm' || status === 'parsing' || status === 'converting' || status === 'decoding';
  const hasAudioBuffer = audioBufferRef.current !== null;

  return (
    <AuthGate appName="dsd">
    <div style={pageStyle}>
      {/* Hero */}
      <div style={heroStyle}>
        <h1 style={titleStyle}>{t(T.pageTitle)}</h1>
        <p style={subtitleStyle}>{t(T.pageSubtitle)}</p>
        <span style={{
          display: 'inline-block',
          marginTop: '0.75rem',
          padding: '0.3rem 0.8rem',
          borderRadius: 6,
          background: 'rgba(124,58,237,0.1)',
          color: ACCENT,
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
        }}>
          RUST WEBASSEMBLY
        </span>
      </div>

      <div style={containerStyle}>

        {/* Drop zone */}
        {!selectedFile && status !== 'loading-wasm' && (
          <div
            style={dropZoneStyle}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>&#x1F4BF;</div>
            <p style={{ fontFamily: serif, fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 600, color: '#334155', margin: '0 0 0.5rem' }}>
              {t(T.dropTitle)}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1rem' }}>{t(T.dropOr)}</p>
            <span style={{ ...btnOutline, display: 'inline-block', padding: '0.6rem 1.8rem', fontSize: '0.85rem' }}>
              {t(T.selectFile)}
            </span>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '1rem' }}>{t(T.dropHint)}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".dsf,.dff"
              style={{ display: 'none' }}
              onChange={onFileInput}
            />
          </div>
        )}

        {/* Loading Wasm */}
        {status === 'loading-wasm' && (
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <p style={{ color: ACCENT, fontWeight: 600, margin: 0 }}>{t(T.loadingWasm)}</p>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div style={{ ...cardStyle, borderColor: '#fca5a5', background: '#fef2f2' }}>
            <p style={{ color: '#dc2626', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>{errorMsg}</p>
          </div>
        )}

        {/* File info + controls */}
        {selectedFile && fileInfo && (
          <>
            {/* File info card */}
            <div style={cardStyle}>
              <p style={labelStyle}>{t(T.fileInfo)}</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem 1.5rem',
              }}>
                {[
                  [t(T.lblFormat), fileInfo.format],
                  [t(T.lblDsdType), fileInfo.dsdType],
                  [t(T.lblChannels), fileInfo.channels === 1 ? 'Mono' : fileInfo.channels === 2 ? 'Stereo' : `${fileInfo.channels}ch`],
                  [t(T.lblDsdRate), `${(fileInfo.dsdSampleRate / 1_000_000).toFixed(2)} MHz`],
                  [t(T.lblDuration), formatDuration(fileInfo.duration)],
                  [t(T.lblFileSize), formatSize(selectedFile.size)],
                ].map(([label, value], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{label}</span>
                    <span style={{ fontSize: '0.82rem', fontFamily: mono, fontWeight: 600, color: '#334155' }}>{value}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.75rem', fontFamily: mono, wordBreak: 'break-all' }}>
                {selectedFile.name}
              </p>
            </div>

            {/* Play section */}
            <div style={cardStyle}>
              <p style={labelStyle}>{t(T.sectionPlay)}</p>

              {/* Decoding progress */}
              {status === 'decoding' && (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <p style={{ fontSize: '0.85rem', color: ACCENT, fontWeight: 600, margin: '0 0 0.5rem' }}>
                    {t(T.decodingNote)} ({progress}%)
                  </p>
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)`,
                      borderRadius: 3,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Player controls + seek bar */}
              {status !== 'decoding' && (
                <div style={{ padding: '0.5rem 0' }}>

                  {/* Seek bar (visible when buffer is ready) */}
                  {(status === 'playing' || status === 'paused') && playbackDuration > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      {/* Time display */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontFamily: mono, fontSize: '0.78rem', color: '#64748b',
                        marginBottom: '0.4rem',
                      }}>
                        <span>{formatDuration(playbackTime)}</span>
                        <span>{formatDuration(playbackDuration)}</span>
                      </div>
                      {/* Clickable seek bar */}
                      <div
                        onClick={handleSeekBarClick}
                        style={{
                          width: '100%', height: 8, borderRadius: 4,
                          background: '#e2e8f0', cursor: 'pointer',
                          position: 'relative', overflow: 'hidden',
                        }}
                      >
                        <div style={{
                          height: '100%',
                          width: `${playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0}%`,
                          background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)`,
                          borderRadius: 4,
                          transition: status === 'playing' ? 'none' : 'width 0.15s ease',
                        }} />
                      </div>
                      {/* Seek knob indicator */}
                      <div style={{ position: 'relative', height: 0 }}>
                        <div style={{
                          position: 'absolute',
                          top: -14,
                          left: `calc(${playbackDuration > 0 ? (playbackTime / playbackDuration) * 100 : 0}% - 6px)`,
                          width: 12, height: 12, borderRadius: '50%',
                          background: ACCENT, border: '2px solid #fff',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                          transition: status === 'playing' ? 'none' : 'left 0.15s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div style={{ textAlign: 'center', marginTop: (status === 'playing' || status === 'paused') ? '1.25rem' : 0 }}>
                    {status === 'playing' ? (
                      <button style={{ ...btnPrimary, backgroundColor: '#f59e0b' }} onClick={pause}>
                        &#10074;&#10074; {t(T.pauseBtn)}
                      </button>
                    ) : status === 'paused' ? (
                      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button style={btnPrimary} onClick={play}>
                          &#9654; {t(T.resumeBtn)}
                        </button>
                      </div>
                    ) : (
                      <button
                        style={{ ...btnPrimary, opacity: isProcessing ? 0.5 : 1 }}
                        onClick={play}
                        disabled={isProcessing}
                      >
                        &#9654; {t(T.playBtn)}
                        {hasAudioBuffer && (
                          <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: 4 }}>
                            (instant)
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem', textAlign: 'center' }}>
                    {t(T.playNote)}
                  </p>
                </div>
              )}
            </div>

            {/* Convert section */}
            <div style={cardStyle}>
              <p style={labelStyle}>{t(T.sectionConvert)}</p>

              {/* Sample rate selection */}
              <p style={{ ...labelStyle, marginTop: '0.75rem' }}>{t(T.targetRate)}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {SAMPLE_RATES.map(sr => {
                  const isAvailable = availableRates.includes(sr.rate);
                  const isSelected = targetRate === sr.rate;
                  return (
                    <label
                      key={sr.rate}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 8,
                        border: `2px solid ${isSelected ? ACCENT : '#e2e8f0'}`,
                        background: isSelected ? '#faf5ff' : isAvailable ? '#fff' : '#f8fafc',
                        cursor: isAvailable && !isProcessing ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.4,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="targetRate"
                        value={sr.rate}
                        checked={isSelected}
                        onChange={() => setTargetRate(sr.rate)}
                        disabled={!isAvailable || isProcessing}
                        style={{ accentColor: ACCENT, width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 700 : 400, color: isSelected ? ACCENT_DARK : '#334155' }}>
                        {sr.label}
                      </span>
                      {!isAvailable && (
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginLeft: 'auto', textAlign: 'right' }}>
                          {t(T.rateUnavailableReason)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Convert button / progress */}
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                {status === 'converting' ? (
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: ACCENT, margin: '0 0 0.75rem' }}>
                      {t(T.converting)} ({progress}%)
                    </p>
                    <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)`,
                        borderRadius: 3,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ) : status === 'done' && downloadUrl ? (
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#16a34a', margin: '0 0 0.5rem' }}>
                      {t(T.done)}
                    </p>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: mono, margin: '0 0 1rem' }}>
                      {downloadName}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <a
                        href={downloadUrl}
                        download={downloadName}
                        style={{ ...btnPrimary, textDecoration: 'none', background: '#16a34a' }}
                      >
                        {t(T.downloadBtn)}
                      </a>
                      <button style={btnOutline} onClick={reset}>
                        {t(T.convertAnother)}
                      </button>
                    </div>

                    {/* ── IQ180: Tech details display ── */}
                    {fileInfo && (
                      <div style={{
                        marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0',
                        background: '#f8fafc', borderRadius: 8, padding: '1rem',
                      }}>
                        <p style={{ ...labelStyle, margin: '0 0 0.75rem' }}>{t(T.techDetail)}</p>
                        <div style={{
                          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem 1rem',
                        }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.1em' }}>Input Format</span>
                            <p style={{ fontSize: '0.85rem', fontFamily: mono, fontWeight: 600, color: '#334155', margin: '0.25rem 0 0' }}>{fileInfo.format}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.1em' }}>DSD Type</span>
                            <p style={{ fontSize: '0.85rem', fontFamily: mono, fontWeight: 600, color: '#334155', margin: '0.25rem 0 0' }}>{fileInfo.dsdType}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.1em' }}>Output</span>
                            <p style={{ fontSize: '0.85rem', fontFamily: mono, fontWeight: 600, color: '#334155', margin: '0.25rem 0 0' }}>{targetRate >= 1000 ? (targetRate / 1000).toFixed(1) : targetRate}k 24-bit PCM</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.1em' }}>Engine</span>
                            <p style={{ fontSize: '0.85rem', fontFamily: mono, fontWeight: 600, color: ACCENT, margin: '0.25rem 0 0' }}>Rust Wasm</p>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.1em' }}>Filter</span>
                            <p style={{ fontSize: '0.85rem', fontFamily: mono, fontWeight: 600, color: '#334155', margin: '0.25rem 0 0' }}>Blackman-sinc</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    style={{ ...btnPrimary, opacity: isProcessing || status === 'playing' ? 0.5 : 1 }}
                    onClick={convert}
                    disabled={isProcessing || status === 'playing'}
                  >
                    {t(T.convertBtn)}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── IQ180: Share nudge + How it works ── */}
        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(0.8rem, 2.2vw, 0.92rem)',
            color: '#64748b',
            fontStyle: 'italic',
            marginBottom: '1rem',
            lineHeight: 1.7,
          }}>
            {t(T.shareNudge)}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 20px', borderRadius: 50, border: 'none',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                color: '#fff', background: '#000',
                transition: 'all 0.2s ease',
              }}
              onClick={() => {
                const text = encodeURIComponent(t(T.shareText));
                const url = encodeURIComponent('https://kuon-rnd.com/dsd');
                window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank');
              }}
            >
              𝕏 {t(T.btnShareX)}
            </button>
            <a
              href="/how-it-works/dsd"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: sans, fontSize: 14, color: ACCENT,
                textDecoration: 'none', fontWeight: 500,
                padding: '8px 20px', borderRadius: 50,
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.15)',
                transition: 'all 0.2s ease',
              }}
            >
              {t(T.howItWorks)}
            </a>
          </div>
        </div>

        {/* Privacy */}
        <p style={{
          textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8',
          marginTop: '1rem', padding: '1rem', borderTop: '1px solid #f1f5f9', lineHeight: 1.6,
        }}>
          {t(T.privacy)}
        </p>
        <p style={{
          textAlign: 'center', fontSize: '0.7rem', color: '#cbd5e1',
          marginTop: '0.5rem', fontFamily: serif, letterSpacing: '0.1em',
        }}>
          {t(T.poweredBy)}
        </p>
      </div>
    </div>
    </AuthGate>
  );
}
