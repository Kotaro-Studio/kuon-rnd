'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { AuthGate } from '@/components/AuthGate';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type L3 = Partial<Record<Lang, string>> & { en: string };
type InputMode = 'file' | 'mic';
type AppStatus = 'idle' | 'loading' | 'active' | 'error';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#4F46E5'; // Indigo

const FFT_SIZE = 8192;
const SMOOTHING = 0.82;
const DB_MIN = -90;
const DB_MAX = 0;
const FREQ_BANDS = [
  20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630,
  800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000,
  12500, 16000, 20000,
];
const FREQ_LABELS = [
  { freq: 50, label: '50' },
  { freq: 100, label: '100' },
  { freq: 200, label: '200' },
  { freq: 500, label: '500' },
  { freq: 1000, label: '1k' },
  { freq: 2000, label: '2k' },
  { freq: 5000, label: '5k' },
  { freq: 10000, label: '10k' },
  { freq: 20000, label: '20k' },
];

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  pageTitle: { ja: 'KUON ANALYZER', en: 'KUON ANALYZER', es: 'KUON ANALYZER' } as L3,
  pageSubtitle: {
    ja: 'スペクトラムアナライザー × ラウドネスメーター\nリファレンス比較対応。ブラウザだけで完結。',
    en: 'Spectrum Analyzer × Loudness Meter\nReference comparison. Browser-only.',
    es: 'Analizador de Espectro × Medidor de Sonoridad\nComparación de referencia. Solo navegador.',
  } as L3,
  dropTitle: {
    ja: '音声ファイルをドロップして解析開始',
    en: 'Drop Audio File to Start Analysis',
    es: 'Suelta un Archivo de Audio para Analizar',
  } as L3,
  dropHint: {
    ja: 'WAV / FLAC / MP3 / AAC 対応',
    en: 'WAV / FLAC / MP3 / AAC supported',
    es: 'WAV / FLAC / MP3 / AAC compatible',
  } as L3,
  selectFile: { ja: 'ファイルを選択', en: 'Select File', es: 'Seleccionar' } as L3,
  tabFile: { ja: 'ファイル', en: 'File', es: 'Archivo' } as L3,
  tabMic: { ja: 'マイク入力', en: 'Mic Input', es: 'Micrófono' } as L3,
  startMic: { ja: 'マイク入力を開始', en: 'Start Mic Input', es: 'Iniciar Micrófono' } as L3,
  stopMic: { ja: '停止', en: 'Stop', es: 'Detener' } as L3,
  micNotice: {
    ja: 'ブラウザがマイクへのアクセス許可を求めます。\nオーディオインターフェイスの入力がリアルタイムに解析されます。',
    en: 'Your browser will ask for microphone permission.\nAudio interface input will be analyzed in real-time.',
    es: 'Tu navegador pedirá permiso para el micrófono.\nLa entrada de la interfaz se analizará en tiempo real.',
  } as L3,
  micError: {
    ja: 'マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。',
    en: 'Microphone access denied. Check your browser settings.',
    es: 'Acceso al micrófono denegado. Verifica la configuración.',
  } as L3,
  addRef: { ja: '+ リファレンス追加', en: '+ Add Reference', es: '+ Añadir Referencia' } as L3,
  removeRef: { ja: 'リファレンス解除', en: 'Remove Reference', es: 'Quitar Referencia' } as L3,
  refLabel: { ja: 'REF', en: 'REF', es: 'REF' } as L3,
  playing: { ja: '再生中', en: 'Playing', es: 'Reproduciendo' } as L3,
  paused: { ja: '一時停止', en: 'Paused', es: 'Pausado' } as L3,
  btnPlay: { ja: '▶ 再生', en: '▶ Play', es: '▶ Reproducir' } as L3,
  btnPause: { ja: '⏸ 停止', en: '⏸ Pause', es: '⏸ Pausa' } as L3,
  btnReset: { ja: '別のファイル', en: 'New File', es: 'Nuevo Archivo' } as L3,
  lblMomentary: { ja: 'Momentary', en: 'Momentary', es: 'Momentáneo' } as L3,
  lblShortTerm: { ja: 'Short-term', en: 'Short-term', es: 'Corto plazo' } as L3,
  lblPeak: { ja: 'Peak', en: 'Peak', es: 'Pico' } as L3,
  lblRms: { ja: 'RMS', en: 'RMS', es: 'RMS' } as L3,
  toMasterCheck: {
    ja: 'MASTER CHECK で詳細分析',
    en: 'Detailed Analysis in MASTER CHECK',
    es: 'Análisis Detallado en MASTER CHECK',
  } as L3,
  privacyNote: {
    ja: 'すべての処理はブラウザ内で完結。音声データがサーバーに送信されることはありません。',
    en: 'All processing happens in your browser. No audio data is sent to any server.',
    es: 'Todo el procesamiento ocurre en tu navegador. No se envían datos de audio.',
  } as L3,
  errDecode: {
    ja: 'ファイルをデコードできませんでした。WAV または MP3 をお試しください。',
    en: 'Could not decode file. Try WAV or MP3.',
    es: 'No se pudo decodificar. Intenta WAV o MP3.',
  } as L3,
  spectrum: { ja: 'スペクトラム', en: 'Spectrum', es: 'Espectro' } as L3,
  loudness: { ja: 'ラウドネス', en: 'Loudness', es: 'Sonoridad' } as L3,
  freqBalance: { ja: '帯域バランス', en: 'Freq Balance', es: 'Balance Freq' } as L3,
  low: { ja: 'Low', en: 'Low', es: 'Bajo' } as L3,
  mid: { ja: 'Mid', en: 'Mid', es: 'Medio' } as L3,
  high: { ja: 'High', en: 'High', es: 'Alto' } as L3,
};

// ─────────────────────────────────────────────
// K-weighting for LUFS
// ─────────────────────────────────────────────
function getKWeightCoeffs(sr: number) {
  if (sr === 48000) {
    return {
      shelf: { b: [1.53512485958697, -2.69169618940638, 1.19839281085285], a: [1, -1.69065929318241, 0.73248077421585] },
      hp: { b: [1.0, -2.0, 1.0], a: [1, -1.99004745483398, 0.99007225036621] },
    };
  }
  return {
    shelf: { b: [1.53084738656498, -2.65099999649498, 1.16901990476645], a: [1, -1.66363909721198, 0.71244680613946] },
    hp: { b: [1.0, -2.0, 1.0], a: [1, -1.98911621993247, 0.98913095185580] },
  };
}

// ─────────────────────────────────────────────
// Biquad filter state class
// ─────────────────────────────────────────────
class BiquadState {
  x1 = 0; x2 = 0; y1 = 0; y2 = 0;
  process(x: number, b: number[], a: number[]): number {
    const y = b[0] * x + b[1] * this.x1 + b[2] * this.x2 - a[1] * this.y1 - a[2] * this.y2;
    this.x2 = this.x1; this.x1 = x;
    this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

// ─────────────────────────────────────────────
// Canvas drawing helpers
// ─────────────────────────────────────────────

function freqToX(freq: number, width: number): number {
  const minLog = Math.log10(20);
  const maxLog = Math.log10(20000);
  return ((Math.log10(freq) - minLog) / (maxLog - minLog)) * width;
}

function dbToY(db: number, height: number): number {
  const clamped = Math.max(DB_MIN, Math.min(DB_MAX, db));
  return (1 - (clamped - DB_MIN) / (DB_MAX - DB_MIN)) * height;
}

function getBarColor(db: number): string {
  const t = Math.max(0, Math.min(1, (db - DB_MIN) / (DB_MAX - DB_MIN)));
  if (t < 0.33) return `rgba(79,70,229,${0.3 + t * 1.5})`;
  if (t < 0.66) return `rgba(79,70,229,${0.6 + (t - 0.33) * 0.6})`;
  return `rgb(${Math.round(79 + (239 - 79) * (t - 0.66) * 3)},${Math.round(70 - 70 * (t - 0.66) * 3)},${Math.round(229 - (229 - 68) * (t - 0.66) * 3)})`;
}

function getMeterColor(lufs: number): string {
  if (lufs < -24) return '#059669';
  if (lufs < -14) return '#059669';
  if (lufs < -8) return '#f59e0b';
  return '#ef4444';
}

function formatLufs(v: number): string {
  if (!isFinite(v) || v < -100) return '-∞';
  return v.toFixed(1);
}

function formatDb(v: number): string {
  if (!isFinite(v) || v < -100) return '-∞';
  return v.toFixed(1);
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function AnalyzerPage() {
  const { lang } = useLang();
  const t = (l3: L3) => l3[lang] || l3.en;

  // State
  const [status, setStatus] = useState<AppStatus>('idle');
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState('');
  const [refName, setRefName] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  // Metering values (updated by animation frame)
  const [momentaryLufs, setMomentaryLufs] = useState(-Infinity);
  const [shortTermLufs, setShortTermLufs] = useState(-Infinity);
  const [peakDb, setPeakDb] = useState(-Infinity);
  const [rmsDb, setRmsDb] = useState(-Infinity);
  const [bandBalance, setBandBalance] = useState<[number, number, number]>([-Infinity, -Infinity, -Infinity]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const peakHoldRef = useRef<Float32Array | null>(null);
  const peakDecayRef = useRef<Float32Array | null>(null);
  const refSpectrumRef = useRef<Float32Array | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef(0);
  const pauseOffsetRef = useRef(0);

  // K-weighting state for LUFS
  const kShelf1Ref = useRef(new BiquadState());
  const kShelf2Ref = useRef(new BiquadState());
  const kHp1Ref = useRef(new BiquadState());
  const kHp2Ref = useRef(new BiquadState());
  const momentaryBufRef = useRef<Float32Array>(new Float32Array(0));
  const momentaryIdxRef = useRef(0);
  const shortTermBufRef = useRef<Float32Array>(new Float32Array(0));
  const shortTermIdxRef = useRef(0);
  const kCoeffsRef = useRef(getKWeightCoeffs(44100));
  // Script processor for LUFS
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);

  // ─── Cleanup ───
  const cleanup = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    if (sourceRef.current) {
      try {
        if ('stop' in sourceRef.current) (sourceRef.current as AudioBufferSourceNode).stop();
        sourceRef.current.disconnect();
      } catch { /* ignore */ }
      sourceRef.current = null;
    }
    if (scriptNodeRef.current) {
      try { scriptNodeRef.current.disconnect(); } catch { /* ignore */ }
      scriptNodeRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
    }
    audioCtxRef.current = null;
    analyserRef.current = null;
    peakHoldRef.current = null;
    peakDecayRef.current = null;
  }, []);

  useEffect(() => { return () => cleanup(); }, [cleanup]);

  // ─── Setup audio context + analyser ───
  const setupAudio = useCallback((sampleRate?: number) => {
    const ctx = new AudioContext(sampleRate ? { sampleRate } : undefined);
    audioCtxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = SMOOTHING;
    analyser.minDecibels = DB_MIN;
    analyser.maxDecibels = DB_MAX;
    analyserRef.current = analyser;

    // Init peak hold arrays
    const binCount = analyser.frequencyBinCount;
    peakHoldRef.current = new Float32Array(binCount).fill(DB_MIN);
    peakDecayRef.current = new Float32Array(binCount).fill(0);

    // Init K-weighting
    kCoeffsRef.current = getKWeightCoeffs(ctx.sampleRate);
    kShelf1Ref.current = new BiquadState();
    kShelf2Ref.current = new BiquadState();
    kHp1Ref.current = new BiquadState();
    kHp2Ref.current = new BiquadState();

    // Init LUFS buffers (400ms momentary, 3s short-term)
    const momentarySize = Math.ceil(ctx.sampleRate * 0.4);
    const shortTermSize = Math.ceil(ctx.sampleRate * 3);
    momentaryBufRef.current = new Float32Array(momentarySize);
    shortTermBufRef.current = new Float32Array(shortTermSize);
    momentaryIdxRef.current = 0;
    shortTermIdxRef.current = 0;

    // Script processor for LUFS calculation
    const scriptNode = ctx.createScriptProcessor(4096, 2, 2);
    scriptNodeRef.current = scriptNode;

    scriptNode.onaudioprocess = (e) => {
      const inputL = e.inputBuffer.getChannelData(0);
      const inputR = e.inputBuffer.numberOfChannels >= 2
        ? e.inputBuffer.getChannelData(1)
        : inputL;

      // Also pass audio through
      for (let ch = 0; ch < e.outputBuffer.numberOfChannels; ch++) {
        const out = e.outputBuffer.getChannelData(ch);
        const inp = e.inputBuffer.getChannelData(Math.min(ch, e.inputBuffer.numberOfChannels - 1));
        out.set(inp);
      }

      const c = kCoeffsRef.current;
      const mBuf = momentaryBufRef.current;
      const stBuf = shortTermBufRef.current;

      for (let i = 0; i < inputL.length; i++) {
        // Average L+R for simplicity
        const sample = (inputL[i] + inputR[i]) * 0.5;

        // K-weighting: shelf -> highpass
        const s1 = kShelf1Ref.current.process(sample, c.shelf.b, c.shelf.a);
        const kWeighted = kHp1Ref.current.process(s1, c.hp.b, c.hp.a);

        // Square and store
        const sq = kWeighted * kWeighted;
        mBuf[momentaryIdxRef.current % mBuf.length] = sq;
        momentaryIdxRef.current++;
        stBuf[shortTermIdxRef.current % stBuf.length] = sq;
        shortTermIdxRef.current++;
      }
    };

    return { ctx, analyser, scriptNode };
  }, []);

  // ─── Calculate LUFS from ring buffer ───
  const calcLufs = useCallback((buf: Float32Array, idx: number): number => {
    const len = Math.min(idx, buf.length);
    if (len === 0) return -Infinity;
    let sum = 0;
    const start = idx < buf.length ? 0 : (idx % buf.length);
    for (let i = 0; i < len; i++) {
      sum += buf[(start + i) % buf.length];
    }
    const mean = sum / len;
    if (mean <= 0) return -Infinity;
    return -0.691 + 10 * Math.log10(mean);
  }, []);

  // ─── Animation loop: spectrum + meters ───
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    // High DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx2d.scale(dpr, dpr);
    }
    const W = rect.width;
    const H = rect.height;

    // Get frequency data
    const binCount = analyser.frequencyBinCount;
    const freqData = new Float32Array(binCount);
    analyser.getFloatFrequencyData(freqData);

    // Get time domain for peak/RMS
    const timeDomain = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(timeDomain);

    // Peak / RMS
    let maxSample = 0;
    let rmsSum = 0;
    for (let i = 0; i < timeDomain.length; i++) {
      const abs = Math.abs(timeDomain[i]);
      if (abs > maxSample) maxSample = abs;
      rmsSum += timeDomain[i] * timeDomain[i];
    }
    const peak = maxSample > 0 ? 20 * Math.log10(maxSample) : -Infinity;
    const rms = rmsSum > 0 ? 10 * Math.log10(rmsSum / timeDomain.length) : -Infinity;
    setPeakDb(peak);
    setRmsDb(rms);

    // LUFS
    const mLufs = calcLufs(momentaryBufRef.current, momentaryIdxRef.current);
    const stLufs = calcLufs(shortTermBufRef.current, shortTermIdxRef.current);
    setMomentaryLufs(mLufs);
    setShortTermLufs(stLufs);

    // Band balance (Low: 20-250Hz, Mid: 250-4kHz, High: 4k-20kHz)
    const sr = audioCtxRef.current?.sampleRate || 44100;
    const freqPerBin = sr / analyser.fftSize;
    let lowSum = 0, lowCount = 0;
    let midSum = 0, midCount = 0;
    let highSum = 0, highCount = 0;
    for (let i = 0; i < binCount; i++) {
      const freq = i * freqPerBin;
      const val = freqData[i];
      if (freq >= 20 && freq < 250) { lowSum += val; lowCount++; }
      else if (freq >= 250 && freq < 4000) { midSum += val; midCount++; }
      else if (freq >= 4000 && freq <= 20000) { highSum += val; highCount++; }
    }
    setBandBalance([
      lowCount > 0 ? lowSum / lowCount : DB_MIN,
      midCount > 0 ? midSum / midCount : DB_MIN,
      highCount > 0 ? highSum / highCount : DB_MIN,
    ]);

    // ─── DRAW ───
    ctx2d.clearRect(0, 0, W, H);

    // Background
    ctx2d.fillStyle = 'rgba(8,8,20,0.97)';
    ctx2d.fillRect(0, 0, W, H);

    const padL = 40;
    const padR = 16;
    const padT = 16;
    const padB = 28;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // Grid lines
    ctx2d.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx2d.lineWidth = 0.5;

    // Horizontal (dB)
    for (let db = -80; db <= 0; db += 10) {
      const y = padT + dbToY(db, plotH);
      ctx2d.beginPath();
      ctx2d.moveTo(padL, y);
      ctx2d.lineTo(padL + plotW, y);
      ctx2d.stroke();

      ctx2d.fillStyle = 'rgba(255,255,255,0.25)';
      ctx2d.font = `9px ${mono}`;
      ctx2d.textAlign = 'right';
      ctx2d.fillText(`${db}`, padL - 4, y + 3);
    }

    // Vertical (freq)
    for (const fl of FREQ_LABELS) {
      const x = padL + freqToX(fl.freq, plotW);
      ctx2d.beginPath();
      ctx2d.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx2d.moveTo(x, padT);
      ctx2d.lineTo(x, padT + plotH);
      ctx2d.stroke();

      ctx2d.fillStyle = 'rgba(255,255,255,0.3)';
      ctx2d.font = `9px ${mono}`;
      ctx2d.textAlign = 'center';
      ctx2d.fillText(fl.label, x, padT + plotH + 14);
    }

    // Reference spectrum (if loaded)
    const refSpectrum = refSpectrumRef.current;
    if (refSpectrum) {
      ctx2d.beginPath();
      ctx2d.strokeStyle = 'rgba(245,158,11,0.5)';
      ctx2d.lineWidth = 1.5;
      let started = false;
      for (let i = 0; i < FREQ_BANDS.length; i++) {
        const freq = FREQ_BANDS[i];
        const bin = Math.round(freq / freqPerBin);
        if (bin >= refSpectrum.length) break;
        const x = padL + freqToX(freq, plotW);
        const y = padT + dbToY(refSpectrum[Math.min(bin, refSpectrum.length - 1)], plotH);
        if (!started) { ctx2d.moveTo(x, y); started = true; }
        else ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();

      // REF label
      ctx2d.fillStyle = 'rgba(245,158,11,0.8)';
      ctx2d.font = `bold 10px ${mono}`;
      ctx2d.textAlign = 'right';
      ctx2d.fillText('REF', padL + plotW - 4, padT + 14);
    }

    // Spectrum bars
    const peakHold = peakHoldRef.current;
    const peakDecay = peakDecayRef.current;
    const barWidth = Math.max(2, plotW / FREQ_BANDS.length - 1);

    for (let i = 0; i < FREQ_BANDS.length; i++) {
      const freq = FREQ_BANDS[i];
      const bin = Math.round(freq / freqPerBin);
      if (bin >= binCount) break;

      // Average a few bins around the center frequency for smoother display
      let dbVal = freqData[bin];
      const spread = Math.max(1, Math.floor(bin * 0.1));
      let sum = 0, count = 0;
      for (let j = Math.max(0, bin - spread); j <= Math.min(binCount - 1, bin + spread); j++) {
        sum += freqData[j];
        count++;
      }
      if (count > 0) dbVal = sum / count;

      const x = padL + freqToX(freq, plotW) - barWidth / 2;
      const barH = Math.max(0, plotH - dbToY(dbVal, plotH));
      const y = padT + plotH - barH;

      // Bar gradient
      const grad = ctx2d.createLinearGradient(0, padT + plotH, 0, padT);
      grad.addColorStop(0, 'rgba(79,70,229,0.15)');
      grad.addColorStop(0.3, 'rgba(79,70,229,0.5)');
      grad.addColorStop(0.6, 'rgba(99,102,241,0.7)');
      grad.addColorStop(0.85, 'rgba(167,139,250,0.85)');
      grad.addColorStop(1, 'rgba(239,68,68,0.9)');
      ctx2d.fillStyle = grad;
      ctx2d.fillRect(x, y, barWidth, barH);

      // Peak hold
      if (peakHold && peakDecay) {
        if (dbVal > peakHold[i]) {
          peakHold[i] = dbVal;
          peakDecay[i] = 0;
        } else {
          peakDecay[i] += 0.15;
          peakHold[i] -= peakDecay[i] * 0.08;
          if (peakHold[i] < DB_MIN) peakHold[i] = DB_MIN;
        }
        const peakY = padT + dbToY(peakHold[i], plotH);
        ctx2d.fillStyle = 'rgba(255,255,255,0.7)';
        ctx2d.fillRect(x, peakY - 1, barWidth, 2);
      }
    }

    // Update time for file mode
    if (audioCtxRef.current && audioBufferRef.current) {
      const ct = audioCtxRef.current.currentTime - startTimeRef.current + pauseOffsetRef.current;
      setCurrentTime(Math.min(ct, audioBufferRef.current.duration));
    }

    animRef.current = requestAnimationFrame(drawFrame);
  }, [calcLufs]);

  // ─── Start animation loop ───
  const startAnimation = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(drawFrame);
  }, [drawFrame]);

  // ─── File handler ───
  const handleFile = useCallback(async (file: File) => {
    cleanup();
    setStatus('loading');
    setErrorMsg('');
    setFileName(file.name);
    setIsPlaying(false);
    setCurrentTime(0);
    pauseOffsetRef.current = 0;

    try {
      const arrayBuf = await file.arrayBuffer();
      const { ctx, analyser, scriptNode } = setupAudio();

      let decoded: AudioBuffer;
      try {
        decoded = await ctx.decodeAudioData(arrayBuf);
      } catch {
        setErrorMsg(t(T.errDecode));
        setStatus('error');
        return;
      }

      audioBufferRef.current = decoded;
      setDuration(decoded.duration);

      // Create source
      const source = ctx.createBufferSource();
      source.buffer = decoded;
      source.loop = false;
      source.connect(scriptNode);
      scriptNode.connect(analyser);
      analyser.connect(ctx.destination);

      source.onended = () => {
        setIsPlaying(false);
      };

      sourceRef.current = source;
      source.start(0);
      startTimeRef.current = ctx.currentTime;
      setIsPlaying(true);
      setStatus('active');
      startAnimation();
    } catch (err) {
      console.error(err);
      setErrorMsg(t(T.errDecode));
      setStatus('error');
    }
  }, [cleanup, setupAudio, startAnimation, t]);

  // ─── Play/Pause ───
  const togglePlay = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !audioBufferRef.current) return;

    if (isPlaying) {
      // Pause: record offset, stop source
      pauseOffsetRef.current += ctx.currentTime - startTimeRef.current;
      if (sourceRef.current && 'stop' in sourceRef.current) {
        try { (sourceRef.current as AudioBufferSourceNode).stop(); } catch { /* */ }
      }
      setIsPlaying(false);
      cancelAnimationFrame(animRef.current);
    } else {
      // Resume: create new source from offset
      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(scriptNodeRef.current!);
      source.onended = () => setIsPlaying(false);
      sourceRef.current = source;
      startTimeRef.current = ctx.currentTime;
      const offset = Math.min(pauseOffsetRef.current, audioBufferRef.current.duration - 0.01);
      source.start(0, offset);
      setIsPlaying(true);
      startAnimation();
    }
  }, [isPlaying, startAnimation]);

  // ─── Seek ───
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const ctx = audioCtxRef.current;
    const buf = audioBufferRef.current;
    if (!ctx || !buf) return;

    // Stop current source
    if (sourceRef.current && 'stop' in sourceRef.current) {
      try { (sourceRef.current as AudioBufferSourceNode).stop(); } catch { /* */ }
    }

    pauseOffsetRef.current = val;
    setCurrentTime(val);

    if (isPlaying) {
      const source = ctx.createBufferSource();
      source.buffer = buf;
      source.connect(scriptNodeRef.current!);
      source.onended = () => setIsPlaying(false);
      sourceRef.current = source;
      startTimeRef.current = ctx.currentTime;
      source.start(0, val);
      startAnimation();
    }
  }, [isPlaying, startAnimation]);

  // ─── Mic handler ───
  const startMic = useCallback(async () => {
    cleanup();
    setStatus('loading');
    setErrorMsg('');
    setFileName('');
    audioBufferRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const { ctx, analyser, scriptNode } = setupAudio();

      const source = ctx.createMediaStreamSource(stream);
      source.connect(scriptNode);
      scriptNode.connect(analyser);
      // Don't connect to destination to avoid feedback
      sourceRef.current = source;

      setStatus('active');
      setIsPlaying(true);
      startAnimation();
    } catch {
      setErrorMsg(t(T.micError));
      setStatus('error');
    }
  }, [cleanup, setupAudio, startAnimation, t]);

  const stopMic = useCallback(() => {
    cleanup();
    setStatus('idle');
    setIsPlaying(false);
    setMomentaryLufs(-Infinity);
    setShortTermLufs(-Infinity);
    setPeakDb(-Infinity);
    setRmsDb(-Infinity);
  }, [cleanup]);

  // ─── Reference file handler ───
  const handleRefFile = useCallback(async (file: File) => {
    try {
      const arrayBuf = await file.arrayBuffer();
      const offlineCtx = new OfflineAudioContext(2, 1, 44100);
      const decoded = await offlineCtx.decodeAudioData(arrayBuf);
      setRefName(file.name);

      // Compute average spectrum of reference
      const ctx = new OfflineAudioContext(decoded.numberOfChannels, decoded.length, decoded.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = decoded;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      source.start(0);

      await ctx.startRendering();

      const binCount = analyser.frequencyBinCount;
      const freqData = new Float32Array(binCount);
      analyser.getFloatFrequencyData(freqData);
      refSpectrumRef.current = freqData;
    } catch {
      // silently ignore reference errors
    }
  }, []);

  const removeRef = useCallback(() => {
    refSpectrumRef.current = null;
    setRefName('');
  }, []);

  // ─── Reset ───
  const reset = useCallback(() => {
    cleanup();
    setStatus('idle');
    setFileName('');
    setRefName('');
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setMomentaryLufs(-Infinity);
    setShortTermLufs(-Infinity);
    setPeakDb(-Infinity);
    setRmsDb(-Infinity);
    setBandBalance([-Infinity, -Infinity, -Infinity]);
    audioBufferRef.current = null;
    refSpectrumRef.current = null;
    pauseOffsetRef.current = 0;
  }, [cleanup]);

  // ─── Drag handlers ───
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };
  const handleRefSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleRefFile(file);
  };

  // ─── Styles ───
  const containerStyle: React.CSSProperties = {
    maxWidth: 1000,
    margin: '0 auto',
    padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 40px)',
    fontFamily: sans,
  };

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 'clamp(20px, 4vw, 32px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  };

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 20px', borderRadius: 50, border: 'none',
    fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
    cursor: 'pointer', color: '#fff', background: ACCENT,
    transition: 'all 0.2s',
  };

  const btnOutline: React.CSSProperties = {
    ...btnPrimary, color: ACCENT, background: 'transparent',
    border: `1px solid ${ACCENT}`,
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px', borderRadius: 50, border: 'none',
    fontSize: 13, fontWeight: 600, letterSpacing: '0.05em',
    cursor: 'pointer',
    color: active ? '#fff' : '#6b7280',
    background: active ? ACCENT : 'rgba(0,0,0,0.04)',
    transition: 'all 0.2s',
  });

  // ─── Meter bar ───
  function MeterBar({ label, value, unit, min, max, color }: {
    label: string; value: number; unit: string; min: number; max: number; color: string;
  }) {
    const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em' }}>{label}</span>
          <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color }}>
            {isFinite(value) && value > min ? `${value > 0 ? '+' : ''}${value.toFixed(1)} ${unit}` : `−∞ ${unit}`}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            width: `${pct}%`,
            transition: 'width 0.1s ease-out',
          }} />
        </div>
      </div>
    );
  }

  // ─── Render ───
  return (
    <AuthGate appName="analyzer">
    <div style={containerStyle}>
      {/* Hero */}
      <div className="hero-enter-1" style={{ textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)' }}>
        <h1 style={{
          fontFamily: sans, fontSize: 'clamp(26px, 5vw, 42px)',
          fontWeight: 800, letterSpacing: '-0.01em', marginBottom: 12,
          background: `linear-gradient(135deg, #111827, ${ACCENT})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {t(T.pageTitle)}
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 2.2vw, 17px)', color: '#6b7280',
          maxWidth: 600, margin: '0 auto', lineHeight: 1.7, whiteSpace: 'pre-line',
        }}>
          {t(T.pageSubtitle)}
        </p>
      </div>

      {/* Mode tabs */}
      {status === 'idle' && (
        <div className="hero-enter-2" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          <button style={tabStyle(inputMode === 'file')} onClick={() => setInputMode('file')}>
            {t(T.tabFile)}
          </button>
          <button style={tabStyle(inputMode === 'mic')} onClick={() => setInputMode('mic')}>
            {t(T.tabMic)}
          </button>
        </div>
      )}

      {/* ── Idle: File mode ── */}
      {status === 'idle' && inputMode === 'file' && (
        <div
          className="hero-enter-2"
          style={{
            border: isDragging ? `2px solid ${ACCENT}` : '2px dashed rgba(0,0,0,0.15)',
            borderRadius: 20, padding: 'clamp(40px, 8vw, 80px) 24px',
            textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: isDragging ? `rgba(79,70,229,0.04)` : 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📊</div>
          <p style={{ fontFamily: serif, fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, marginBottom: 12, color: '#111827' }}>
            {t(T.dropTitle)}
          </p>
          <button style={btnPrimary} onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            {t(T.selectFile)}
          </button>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 20 }}>{t(T.dropHint)}</p>
          <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleSelect} />
        </div>
      )}

      {/* ── Idle: Mic mode ── */}
      {status === 'idle' && inputMode === 'mic' && (
        <div className="hero-enter-2" style={{ ...glass, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
          <p style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🎙</p>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: 24 }}>
            {t(T.micNotice)}
          </p>
          <button style={btnPrimary} onClick={startMic}>
            {t(T.startMic)}
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {status === 'loading' && (
        <div style={{ ...glass, textAlign: 'center', padding: '60px 24px' }}>
          <div style={{
            width: 40, height: 40, border: `3px solid ${ACCENT}20`,
            borderTop: `3px solid ${ACCENT}`, borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#6b7280', fontSize: 15 }}>Loading…</p>
        </div>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <div style={{ ...glass, textAlign: 'center', borderColor: 'rgba(239,68,68,0.3)' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>⚠️</p>
          <p style={{ color: '#ef4444', fontSize: 15, marginBottom: 20 }}>{errorMsg}</p>
          <button style={btnPrimary} onClick={reset}>{t(T.btnReset)}</button>
        </div>
      )}

      {/* ── Active: Spectrum + Meters ── */}
      {status === 'active' && (
        <>
          {/* File info bar */}
          {fileName && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 12, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: mono, fontSize: 13, color: '#111827', fontWeight: 600 }}>
                  {fileName}
                </span>
                {isPlaying && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                    color: '#059669', padding: '2px 10px', borderRadius: 50,
                    background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)',
                  }}>
                    ● {t(T.playing)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {refName ? (
                  <button style={{ ...btnOutline, fontSize: 11, padding: '5px 14px', color: '#f59e0b', borderColor: '#f59e0b' }} onClick={removeRef}>
                    REF: {refName.slice(0, 20)} ✕
                  </button>
                ) : (
                  <>
                    <button style={{ ...btnOutline, fontSize: 11, padding: '5px 14px' }} onClick={() => refInputRef.current?.click()}>
                      {t(T.addRef)}
                    </button>
                    <input ref={refInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleRefSelect} />
                  </>
                )}
                <button style={{ ...btnOutline, fontSize: 11, padding: '5px 14px' }} onClick={reset}>
                  {t(T.btnReset)}
                </button>
              </div>
            </div>
          )}

          {/* Mic mode controls */}
          {inputMode === 'mic' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button style={{ ...btnOutline, fontSize: 12, color: '#ef4444', borderColor: '#ef4444' }} onClick={stopMic}>
                ⏹ {t(T.stopMic)}
              </button>
            </div>
          )}

          {/* Spectrum Canvas */}
          <div style={{
            borderRadius: 16, overflow: 'hidden', marginBottom: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(79,70,229,0.15)',
          }}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: 'clamp(200px, 35vw, 360px)',
                display: 'block',
                background: '#080814',
              }}
            />
          </div>

          {/* Playback controls (file mode only) */}
          {audioBufferRef.current && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
              padding: '12px 20px', borderRadius: 12,
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.8)',
            }}>
              <button onClick={togglePlay} style={{
                ...btnPrimary, padding: '6px 16px', fontSize: 12,
                background: isPlaying ? '#6b7280' : ACCENT,
              }}>
                {isPlaying ? t(T.btnPause) : t(T.btnPlay)}
              </button>
              <span style={{ fontFamily: mono, fontSize: 12, color: '#6b7280', minWidth: 44 }}>
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                style={{ flex: 1, accentColor: ACCENT }}
              />
              <span style={{ fontFamily: mono, fontSize: 12, color: '#6b7280', minWidth: 44 }}>
                {formatTime(duration)}
              </span>
            </div>
          )}

          {/* Meters grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16, marginBottom: 16,
          }}>
            {/* Loudness card */}
            <div style={glass}>
              <h3 style={{
                fontFamily: serif, fontSize: 15, fontWeight: 600, marginBottom: 16,
                color: '#111827', letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>📊</span> {t(T.loudness)}
              </h3>
              <MeterBar
                label={t(T.lblMomentary)}
                value={momentaryLufs}
                unit="LUFS"
                min={-60}
                max={0}
                color={getMeterColor(momentaryLufs)}
              />
              <MeterBar
                label={t(T.lblShortTerm)}
                value={shortTermLufs}
                unit="LUFS"
                min={-60}
                max={0}
                color={getMeterColor(shortTermLufs)}
              />
              <MeterBar
                label={t(T.lblPeak)}
                value={peakDb}
                unit="dB"
                min={-60}
                max={0}
                color={peakDb > -1 ? '#ef4444' : '#059669'}
              />
              <MeterBar
                label={t(T.lblRms)}
                value={rmsDb}
                unit="dB"
                min={-60}
                max={0}
                color="#4F46E5"
              />
            </div>

            {/* Band balance card */}
            <div style={glass}>
              <h3 style={{
                fontFamily: serif, fontSize: 15, fontWeight: 600, marginBottom: 16,
                color: '#111827', letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>🎚</span> {t(T.freqBalance)}
              </h3>
              {[
                { label: `${t(T.low)} (20-250Hz)`, val: bandBalance[0], color: '#4F46E5' },
                { label: `${t(T.mid)} (250Hz-4kHz)`, val: bandBalance[1], color: '#059669' },
                { label: `${t(T.high)} (4k-20kHz)`, val: bandBalance[2], color: '#f59e0b' },
              ].map((b, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>{b.label}</span>
                    <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: b.color }}>
                      {formatDb(b.val)} dB
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: b.color,
                      width: `${Math.max(0, Math.min(100, ((b.val - DB_MIN) / (DB_MAX - DB_MIN)) * 100))}%`,
                      transition: 'width 0.1s ease-out',
                      opacity: 0.7,
                    }} />
                  </div>
                </div>
              ))}

              {/* Balance visual triangle */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 4, marginTop: 16,
                padding: '12px 0', borderTop: '1px solid rgba(0,0,0,0.06)',
              }}>
                {['LOW', 'MID', 'HIGH'].map((label, i) => {
                  const val = bandBalance[i];
                  const normalized = isFinite(val) ? Math.max(0, (val - DB_MIN) / (DB_MAX - DB_MIN)) : 0;
                  const h = Math.max(4, normalized * 40);
                  return (
                    <div key={label} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{
                        height: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                      }}>
                        <div style={{
                          width: '60%', maxWidth: 40, height: h, borderRadius: 3,
                          background: ['#4F46E5', '#059669', '#f59e0b'][i],
                          opacity: 0.6, transition: 'height 0.15s ease-out',
                        }} />
                      </div>
                      <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, letterSpacing: '0.1em' }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MASTER CHECK link */}
          {audioBufferRef.current && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Link href="/master-check" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 50,
                fontSize: 13, fontWeight: 600, color: '#0284c7',
                border: '1px solid rgba(2,132,199,0.3)',
                background: 'rgba(2,132,199,0.04)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
                🎯 {t(T.toMasterCheck)} →
              </Link>
            </div>
          )}
        </>
      )}

      {/* Privacy note */}
      <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 32 }}>
        🔒 {t(T.privacyNote)}
      </p>
    </div>
    </AuthGate>
  );
}
