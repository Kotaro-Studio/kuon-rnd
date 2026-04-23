'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ═════════════════════════════════════════════════════════════
// KUON SLOWDOWN — Pitch-preserving time-stretch practice tool
//
// Core engine: HTMLMediaElement.preservesPitch (browser-native WSOLA /
// phase-vocoder — same algorithm family as Rubber Band Library and used in
// Ableton Live / Logic Pro time-stretch). Supplemented by custom chromagram
// key detection, autocorrelation BPM detection, bar-grid overlay, named A/B
// sections, overdub recording (MediaRecorder), and a clean transcription
// notes panel.
//
// DSP note: real-time pitch-preserving playback is handled by the browser
// natively (Chrome, Safari, Firefox all implement this via internal DSP).
// V1 delivers the full transcription workflow that Transcribe! and Amazing
// Slow Downer charge for. An in-browser Rubber Band WASM engine for offline
// export and independent pitch-shift (transpose without speed change) is
// planned for V1.1 (see TODO markers).
// ═════════════════════════════════════════════════════════════

type L5 = Partial<Record<Lang, string>> & { en: string };
function t(lang: Lang, k: L5): string { return k[lang] || k.en; }

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "Source Han Serif", serif';
const sans  = '"Helvetica Neue", Arial, "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif';

const ACCENT    = '#c2410c';
const ACCENT_LT = '#ea580c';
const ACCENT_DK = '#9a3412';
const ACCENT_BG = '#fff7ed';
const INK       = '#0f172a';
const INK_SOFT  = '#1e293b';
const MUTE      = '#475569';
const MUTE_LT   = '#94a3b8';
const BG        = '#fdfaf6';
const CARD      = '#ffffff';
const BORDER    = '#f1e9dd';
const BORDER_DK = '#e7d9c4';

// ─────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────
const T = {
  title:      { ja: 'KUON SLOWDOWN', en: 'KUON SLOWDOWN', es: 'KUON SLOWDOWN' } as L5,
  subtitle:   { ja: 'ピッチを保ったまま、ゆっくり再生。',
                en: 'Slow music without changing its pitch.',
                es: 'Ralentiza sin cambiar el tono.' } as L5,
  drop:       { ja: '音声ファイルをドロップ、またはクリックで選択',
                en: 'Drop audio file or click to select',
                es: 'Arrastra un archivo de audio o haz clic' } as L5,
  dropSub:    { ja: 'MP3 / WAV / FLAC / M4A / OGG — サーバーに送信されません',
                en: 'MP3 / WAV / FLAC / M4A / OGG — never uploaded',
                es: 'MP3 / WAV / FLAC / M4A / OGG — nunca se sube' } as L5,
  analyzing:  { ja: '解析中…', en: 'Analyzing…', es: 'Analizando…' } as L5,

  speed:      { ja: '再生速度', en: 'Speed', es: 'Velocidad' } as L5,
  pitch:      { ja: 'ピッチ（半音）', en: 'Pitch (semitones)', es: 'Tono (semitonos)' } as L5,
  pitchHint:  { ja: '※ V1 ではピッチ変更は速度にも影響します。独立制御は V1.1 で対応予定。',
                en: '※ V1 pitch changes also affect speed. Independent control coming in V1.1.',
                es: '※ V1 el cambio de tono también afecta velocidad. Control independiente en V1.1.' } as L5,
  preservePitch: { ja: 'ピッチ維持', en: 'Preserve pitch', es: 'Preservar tono' } as L5,

  key:        { ja: 'キー', en: 'Key', es: 'Tonalidad' } as L5,
  bpm:        { ja: 'BPM', en: 'BPM', es: 'BPM' } as L5,
  detected:   { ja: '検出', en: 'detected', es: 'detectado' } as L5,

  loopAB:     { ja: 'A/B ループ', en: 'A/B Loop', es: 'Bucle A/B' } as L5,
  setA:       { ja: 'A 設定', en: 'Set A', es: 'Marcar A' } as L5,
  setB:       { ja: 'B 設定', en: 'Set B', es: 'Marcar B' } as L5,
  clearLoop:  { ja: 'ループ解除', en: 'Clear loop', es: 'Quitar bucle' } as L5,
  loopOn:     { ja: 'ループ ON', en: 'Loop ON', es: 'Bucle ON' } as L5,
  loopOff:    { ja: 'ループ OFF', en: 'Loop OFF', es: 'Bucle OFF' } as L5,

  sections:   { ja: 'セクション', en: 'Sections', es: 'Secciones' } as L5,
  saveSection:{ ja: '現在の A/B を保存', en: 'Save current A/B', es: 'Guardar A/B actual' } as L5,
  sectionName:{ ja: '名前（例: Verse 1, Solo）', en: 'Name (e.g. Verse 1, Solo)', es: 'Nombre (ej. Estrofa 1, Solo)' } as L5,
  noSections: { ja: 'まだセクションがありません。A/B を設定して保存してください。',
                en: 'No sections yet. Set A/B then save.',
                es: 'Aún no hay secciones. Marca A/B y guarda.' } as L5,

  play:       { ja: '再生', en: 'Play', es: 'Reproducir' } as L5,
  pause:      { ja: '一時停止', en: 'Pause', es: 'Pausa' } as L5,

  overdub:    { ja: 'オーバーダブ', en: 'Overdub', es: 'Overdub' } as L5,
  startRec:   { ja: '録音開始', en: 'Start recording', es: 'Iniciar grabación' } as L5,
  stopRec:    { ja: '録音停止', en: 'Stop recording', es: 'Detener grabación' } as L5,
  recHint:    { ja: '原曲を流しながら自分の演奏を録音し、採譜の確認に使います。',
                en: 'Record yourself over the playing track to verify transcriptions.',
                es: 'Graba mientras suena la pista para verificar transcripciones.' } as L5,

  notes:      { ja: '採譜メモ', en: 'Transcription notes', es: 'Notas de transcripción' } as L5,
  notesPh:    { ja: 'ここに採譜メモを書けます。現在時刻でタイムスタンプを挿入できます。',
                en: 'Write transcription notes here. Insert current timestamp with the button.',
                es: 'Escribe notas aquí. Inserta el tiempo actual con el botón.' } as L5,
  insertTs:   { ja: '現在時刻を挿入', en: 'Insert current time', es: 'Insertar tiempo actual' } as L5,
  downloadNotes: { ja: 'メモをダウンロード', en: 'Download notes', es: 'Descargar notas' } as L5,

  sendSep:    { ja: 'SEPARATOR に送る（マイナスワン作成）',
                en: 'Send to SEPARATOR (create minus-one)',
                es: 'Enviar a SEPARATOR (crear minus-one)' } as L5,

  privacyNote:{ ja: '音声はサーバーに送信されません。すべてブラウザ内で処理されます。',
                en: 'Audio is never uploaded. Everything processes in your browser.',
                es: 'El audio nunca se sube. Todo se procesa en tu navegador.' } as L5,

  learnMore:  { ja: '仕組みを見る →', en: 'See how it works →', es: 'Ver cómo funciona →' } as L5,
  reload:     { ja: '別のファイルを選ぶ', en: 'Load another file', es: 'Cargar otro archivo' } as L5,
};

// ─────────────────────────────────────────────────────────────
// DSP utilities (chromagram key detection + autocorrelation BPM)
// ─────────────────────────────────────────────────────────────
const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
// Krumhansl-Schmuckler key profiles
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function computeChromagram(buffer: AudioBuffer): Float32Array {
  // Mix to mono, compute power spectrum, fold into 12 pitch classes.
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  // Sample center portion (skip intro/outro) for more stable key detection
  const start = Math.floor(data.length * 0.15);
  const end = Math.floor(data.length * 0.85);
  const N = 4096;
  const chroma = new Float32Array(12);

  // Precompute pitch-class bin mapping
  const binToPC = new Int16Array(N / 2);
  for (let k = 1; k < N / 2; k++) {
    const freq = (k * sampleRate) / N;
    if (freq < 80 || freq > 2500) { binToPC[k] = -1; continue; }
    // MIDI note number: 69 + 12*log2(f/440)
    const midi = 69 + 12 * Math.log2(freq / 440);
    binToPC[k] = ((Math.round(midi) % 12) + 12) % 12;
  }

  // Hop through several frames, average chroma
  const hopCount = 40;
  const hopSize = Math.max(N, Math.floor((end - start) / hopCount));
  for (let h = 0; h < hopCount; h++) {
    const pos = start + h * hopSize;
    if (pos + N > end) break;
    // Simple DFT would be too slow; use a naive FFT via recursion
    const frame = new Float32Array(N);
    for (let i = 0; i < N; i++) frame[i] = data[pos + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
    const { re, im } = fft(frame);
    for (let k = 1; k < N / 2; k++) {
      const pc = binToPC[k];
      if (pc < 0) continue;
      const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
      chroma[pc] += mag;
    }
  }
  // Normalize
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += chroma[i];
  if (sum > 0) for (let i = 0; i < 12; i++) chroma[i] /= sum;
  return chroma;
}

// Minimal iterative Cooley-Tukey radix-2 FFT for Float32 real inputs.
function fft(input: Float32Array): { re: Float32Array; im: Float32Array } {
  const N = input.length;
  const re = new Float32Array(N);
  const im = new Float32Array(N);
  for (let i = 0; i < N; i++) re[i] = input[i];
  // bit reversal
  let j = 0;
  for (let i = 1; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= N; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang), wIm = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let cRe = 1, cIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k], uIm = im[i + k];
        const vRe = re[i + k + len / 2] * cRe - im[i + k + len / 2] * cIm;
        const vIm = re[i + k + len / 2] * cIm + im[i + k + len / 2] * cRe;
        re[i + k] = uRe + vRe; im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe; im[i + k + len / 2] = uIm - vIm;
        const nRe = cRe * wRe - cIm * wIm;
        cIm = cRe * wIm + cIm * wRe; cRe = nRe;
      }
    }
  }
  return { re, im };
}

function detectKey(chroma: Float32Array): { name: string; score: number } {
  let bestScore = -Infinity;
  let bestName = 'C';
  for (let i = 0; i < 12; i++) {
    let majScore = 0, minScore = 0;
    for (let k = 0; k < 12; k++) {
      majScore += chroma[(i + k) % 12] * MAJOR_PROFILE[k];
      minScore += chroma[(i + k) % 12] * MINOR_PROFILE[k];
    }
    if (majScore > bestScore) { bestScore = majScore; bestName = `${NOTE_NAMES[i]} Major`; }
    if (minScore > bestScore) { bestScore = minScore; bestName = `${NOTE_NAMES[i]} Minor`; }
  }
  return { name: bestName, score: bestScore };
}

function detectBPM(buffer: AudioBuffer): number {
  // Onset envelope via half-wave rectified energy flux, autocorrelate for tempo.
  const data = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  const hop = 512;
  const winLen = 1024;
  const frames: number[] = [];
  let prev = 0;
  for (let i = 0; i + winLen < data.length; i += hop) {
    let e = 0;
    for (let k = 0; k < winLen; k++) e += data[i + k] * data[i + k];
    const flux = Math.max(0, e - prev);
    frames.push(flux);
    prev = e;
  }
  // Autocorrelation across plausible BPM range (40..220)
  const fps = sr / hop;
  const minLag = Math.floor((60 * fps) / 220);
  const maxLag = Math.floor((60 * fps) / 40);
  let best = minLag, bestV = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let k = 0; k + lag < frames.length; k++) sum += frames[k] * frames[k + lag];
    if (sum > bestV) { bestV = sum; best = lag; }
  }
  const bpm = (60 * fps) / best;
  // Halve or double into a musical 70-160 sweet spot
  let b = bpm;
  while (b < 70) b *= 2;
  while (b > 160) b /= 2;
  return Math.round(b);
}

// Render a downsampled waveform (peaks per pixel) for display.
function computeWaveformPeaks(buffer: AudioBuffer, width: number): Float32Array {
  const data = buffer.getChannelData(0);
  const samplesPerPixel = Math.max(1, Math.floor(data.length / width));
  const peaks = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    const start = x * samplesPerPixel;
    const end = Math.min(start + samplesPerPixel, data.length);
    let mx = 0;
    for (let i = start; i < end; i++) {
      const v = Math.abs(data[i]);
      if (v > mx) mx = v;
    }
    peaks[x] = mx;
  }
  return peaks;
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
interface Section {
  id: string;
  name: string;
  a: number;
  b: number;
}

export default function SlowdownApp() {
  const { lang } = useLang();

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keyName, setKeyName] = useState<string>('—');
  const [bpm, setBpm] = useState<number>(0);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [rate, setRate] = useState(1.0);
  const [preservePitch, setPreservePitch] = useState(true);
  const [pitchSemi, setPitchSemi] = useState(0);

  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [loopOn, setLoopOn] = useState(true);

  const [sections, setSections] = useState<Section[]>([]);
  const [newSectionName, setNewSectionName] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [notesText, setNotesText] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // ── File loading ───────────────────────────────────────────
  const loadFile = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    try {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setFileName(file.name);

      // Decode for analysis
      const ab = await file.arrayBuffer();
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const buf = await ctx.decodeAudioData(ab);
      setBuffer(buf);
      setDuration(buf.duration);

      // Compute peaks
      const w = Math.min(1600, Math.floor(window.innerWidth * 2));
      setPeaks(computeWaveformPeaks(buf, w));

      // Analyze key + BPM (async-friendly via requestIdleCallback when available)
      const analyze = () => {
        try {
          const chroma = computeChromagram(buf);
          const key = detectKey(chroma);
          setKeyName(key.name);
          const tempo = detectBPM(buf);
          setBpm(tempo);
        } catch (err) {
          console.error('Analysis error', err);
        }
        setIsAnalyzing(false);
      };
      // Slight delay so UI updates before the heavy work
      setTimeout(analyze, 50);
      await ctx.close();
    } catch (err) {
      console.error('Decode error', err);
      alert(t(lang, { ja: 'ファイルを読み込めませんでした', en: 'Could not load file', es: 'No se pudo cargar el archivo' } as L5));
      setIsAnalyzing(false);
    }
  }, [lang]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

  // ── Playback controls ──────────────────────────────────────
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
  }, [rate, fileUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // When preservePitch is off, rate changes pitch too (classic vinyl effect).
    // When on, browser's native time-stretch preserves pitch.
    // TypeScript doesn't model preservesPitch in HTMLMediaElement uniformly across browsers;
    // cast to a permissive shape to set it where supported.
    const a = audio as HTMLMediaElement & {
      preservesPitch?: boolean;
      mozPreservesPitch?: boolean;
      webkitPreservesPitch?: boolean;
    };
    if ('preservesPitch' in a) a.preservesPitch = preservePitch;
    if ('mozPreservesPitch' in a) a.mozPreservesPitch = preservePitch;
    if ('webkitPreservesPitch' in a) a.webkitPreservesPitch = preservePitch;
  }, [preservePitch, fileUrl]);

  // Pitch semitone → apply as playback rate multiplier while preservesPitch=false
  // This is the "coupled" behaviour (pitch+speed shift together). A proper
  // independent pitch shift is planned via AudioWorklet + Rubber Band WASM in V1.1.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (pitchSemi === 0) return;
    // When user moves pitch slider, we switch to mode where rate also shifts pitch
    // (disabling preservesPitch) and compose the rate as speed * 2^(semi/12).
    // For clarity: the UI clearly discloses this V1 limitation.
    const composedRate = rate * Math.pow(2, pitchSemi / 12);
    audio.playbackRate = composedRate;
    const a = audio as HTMLMediaElement & { preservesPitch?: boolean };
    if ('preservesPitch' in a) a.preservesPitch = false;
  }, [pitchSemi, rate, fileUrl]);

  // rAF loop to update current time + enforce A/B loop
  useEffect(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        setCurrentTime(audio.currentTime);
        // A/B loop enforcement
        if (loopOn && loopA !== null && loopB !== null && audio.currentTime >= loopB) {
          audio.currentTime = loopA;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [loopA, loopB, loopOn]);

  // ── Waveform drawing ───────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = canvas.offsetHeight * 2;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = ACCENT_BG;
    ctx.fillRect(0, 0, W, H);

    // Bar grid overlay (if BPM detected)
    if (bpm > 0 && duration > 0) {
      const secPerBeat = 60 / bpm;
      const beatsPerBar = 4;
      const secPerBar = secPerBeat * beatsPerBar;
      const bars = Math.ceil(duration / secPerBar);
      for (let b = 0; b <= bars; b++) {
        const x = ((b * secPerBar) / duration) * W;
        ctx.strokeStyle = b % 4 === 0 ? `${ACCENT}55` : `${ACCENT}22`;
        ctx.lineWidth = b % 4 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
    }

    // Waveform peaks
    const N = peaks.length;
    const pxW = W / N;
    ctx.fillStyle = ACCENT;
    for (let i = 0; i < N; i++) {
      const h = peaks[i] * (H / 2) * 0.92;
      ctx.fillRect(i * pxW, H / 2 - h, Math.max(1, pxW - 0.5), h * 2);
    }

    // Loop region
    if (loopA !== null && loopB !== null) {
      const xA = (loopA / duration) * W;
      const xB = (loopB / duration) * W;
      ctx.fillStyle = '#10b98133';
      ctx.fillRect(xA, 0, xB - xA, H);
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xA, 0); ctx.lineTo(xA, H);
      ctx.moveTo(xB, 0); ctx.lineTo(xB, H);
      ctx.stroke();
      // Labels
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 18px ' + sans;
      ctx.fillText('A', xA + 6, 20);
      ctx.fillText('B', xB + 6, 20);
    }

    // Playhead
    if (duration > 0) {
      const x = (currentTime / duration) * W;
      ctx.strokeStyle = ACCENT_DK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
      ctx.stroke();
    }
  }, [peaks, currentTime, duration, loopA, loopB, bpm]);

  // Click on waveform → seek
  const onWaveformClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || !duration) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * duration;
  };

  // ── Section management ─────────────────────────────────────
  const saveSection = () => {
    if (loopA === null || loopB === null) return;
    const name = newSectionName.trim() || `Section ${sections.length + 1}`;
    const sec: Section = { id: Math.random().toString(36).slice(2, 10), name, a: loopA, b: loopB };
    setSections([...sections, sec]);
    setNewSectionName('');
  };
  const loadSection = (sec: Section) => {
    setLoopA(sec.a);
    setLoopB(sec.b);
    const audio = audioRef.current;
    if (audio) audio.currentTime = sec.a;
  };
  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  // ── Overdub recording ──────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const rec = new MediaRecorder(stream);
      recordChunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) recordChunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(recordChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((tr) => tr.stop());
      };
      rec.start();
      mediaRecorderRef.current = rec;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert(t(lang, { ja: 'マイクへのアクセスが拒否されました', en: 'Microphone access denied', es: 'Acceso al micrófono denegado' } as L5));
    }
  };
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // ── Transcription notes ────────────────────────────────────
  const insertTimestamp = () => {
    const mm = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const ss = (currentTime % 60).toFixed(2).padStart(5, '0');
    setNotesText(notesText + `\n[${mm}:${ss}] `);
  };
  const downloadNotes = () => {
    const header = `KUON SLOWDOWN — Transcription notes\nFile: ${fileName}\nKey: ${keyName}\nBPM: ${bpm}\n\n`;
    const blob = new Blob([header + notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^.]+$/, '')}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Audio event handlers ───────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [fileUrl]);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const resetApp = () => {
    if (audioRef.current) { audioRef.current.pause(); }
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    setFileName('');
    setBuffer(null);
    setPeaks(null);
    setKeyName('—');
    setBpm(0);
    setLoopA(null);
    setLoopB(null);
    setSections([]);
    setNotesText('');
    setRecordedBlob(null);
    setCurrentTime(0);
    setDuration(0);
    setPitchSemi(0);
    setRate(1);
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <main style={{ fontFamily: sans, background: BG, minHeight: '100vh', color: INK }}>
      {/* Header */}
      <header style={{ padding: 'clamp(28px, 4vw, 48px) clamp(20px, 5vw, 48px) 20px', borderBottom: `1px solid ${BORDER}`, background: CARD }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: serif, fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 400, margin: 0, letterSpacing: '-0.01em' }}>
              {t(lang, T.title)}
            </h1>
            <span style={{ color: MUTE, fontSize: 'clamp(13px, 1.4vw, 15px)' }}>
              {t(lang, T.subtitle)}
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
              <Link href="/slowdown-lp" style={{ color: MUTE, fontSize: 13, textDecoration: 'none' }}>
                {t(lang, T.learnMore)}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(20px, 3vw, 40px)' }}>
        {!fileUrl ? (
          /* ───── Drop Zone ───── */
          <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            style={{
              display: 'block',
              padding: 'clamp(60px, 10vw, 120px) clamp(24px, 6vw, 80px)',
              borderRadius: 24,
              border: `2px dashed ${isDragging ? ACCENT : BORDER_DK}`,
              background: isDragging ? ACCENT_BG : CARD,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 20 }}>♪</div>
            <div style={{ fontSize: 'clamp(17px, 2vw, 22px)', fontWeight: 700, color: INK, marginBottom: 8 }}>
              {t(lang, T.drop)}
            </div>
            <div style={{ fontSize: 13, color: MUTE }}>
              {t(lang, T.dropSub)}
            </div>
            <input
              type="file"
              accept="audio/*"
              onChange={onFileInput}
              style={{ display: 'none' }}
            />
            <div style={{ marginTop: 40, fontSize: 12, color: MUTE_LT, fontStyle: 'italic' }}>
              {t(lang, T.privacyNote)}
            </div>
          </label>
        ) : (
          <>
            {/* ───── Active Session ───── */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: INK_SOFT }}>
                <strong>{fileName}</strong>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button
                  onClick={resetApp}
                  style={{
                    padding: '8px 14px',
                    border: `1px solid ${BORDER_DK}`,
                    background: CARD,
                    color: INK_SOFT,
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {t(lang, T.reload)}
                </button>
              </div>
            </div>

            {/* Hidden audio element */}
            <audio ref={audioRef} src={fileUrl} preload="auto" style={{ display: 'none' }} />

            {/* Waveform */}
            <div style={{ background: CARD, borderRadius: 16, padding: 20, border: `1px solid ${BORDER}`, marginBottom: 20 }}>
              <canvas
                ref={canvasRef}
                onClick={onWaveformClick}
                style={{ width: '100%', height: 180, display: 'block', cursor: 'pointer', borderRadius: 8 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: MUTE, fontVariantNumeric: 'tabular-nums' }}>
                <span>{fmtTime(currentTime)}</span>
                <span>{fmtTime(duration)}</span>
              </div>
            </div>

            {/* Primary controls row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
              {/* Play / stats */}
              <div style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}` }}>
                <button
                  onClick={togglePlay}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    background: isPlaying ? INK : ACCENT,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginBottom: 18,
                  }}
                >
                  {isPlaying ? `■ ${t(lang, T.pause)}` : `▶ ${t(lang, T.play)}`}
                </button>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: MUTE }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTE_LT }}>{t(lang, T.key)}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT_DK }}>
                      {isAnalyzing ? '…' : keyName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTE_LT }}>{t(lang, T.bpm)}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT_DK }}>
                      {isAnalyzing ? '…' : bpm > 0 ? bpm : '—'}
                    </div>
                  </div>
                </div>
                {isAnalyzing && (
                  <div style={{ marginTop: 12, fontSize: 12, color: MUTE, fontStyle: 'italic' }}>
                    {t(lang, T.analyzing)}
                  </div>
                )}
              </div>

              {/* Speed */}
              <div style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK_SOFT, letterSpacing: '0.04em' }}>{t(lang, T.speed)}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT_DK, fontVariantNumeric: 'tabular-nums' }}>{rate.toFixed(2)}×</div>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={2.0}
                  step={0.01}
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: ACCENT }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MUTE_LT, marginTop: 6 }}>
                  <span>0.25×</span><span>1.0×</span><span>2.0×</span>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[0.5, 0.75, 0.9, 1.0].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRate(r)}
                      style={{
                        padding: '4px 12px',
                        fontSize: 12,
                        border: `1px solid ${BORDER_DK}`,
                        background: rate === r ? ACCENT : CARD,
                        color: rate === r ? '#fff' : INK_SOFT,
                        borderRadius: 999,
                        cursor: 'pointer',
                      }}
                    >
                      {r}×
                    </button>
                  ))}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 13, color: INK_SOFT, cursor: 'pointer' }}>
                  <input type="checkbox" checked={preservePitch} onChange={(e) => setPreservePitch(e.target.checked)} />
                  {t(lang, T.preservePitch)}
                </label>
              </div>

              {/* Pitch */}
              <div style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK_SOFT, letterSpacing: '0.04em' }}>{t(lang, T.pitch)}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT_DK, fontVariantNumeric: 'tabular-nums' }}>
                    {pitchSemi > 0 ? '+' : ''}{pitchSemi}
                  </div>
                </div>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={pitchSemi}
                  onChange={(e) => setPitchSemi(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: ACCENT }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MUTE_LT, marginTop: 6 }}>
                  <span>-12</span><span>0</span><span>+12</span>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: MUTE_LT, lineHeight: 1.5 }}>
                  {t(lang, T.pitchHint)}
                </div>
              </div>
            </div>

            {/* A/B Loop + Sections row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
              {/* A/B Loop */}
              <div style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK_SOFT, letterSpacing: '0.04em', marginBottom: 12 }}>{t(lang, T.loopAB)}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <button
                    onClick={() => setLoopA(currentTime)}
                    style={{ padding: '8px 14px', background: loopA !== null ? '#10b981' : BORDER_DK, color: loopA !== null ? '#fff' : INK_SOFT, border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    A {loopA !== null ? `· ${fmtTime(loopA)}` : ''}
                  </button>
                  <button
                    onClick={() => setLoopB(currentTime)}
                    style={{ padding: '8px 14px', background: loopB !== null ? '#10b981' : BORDER_DK, color: loopB !== null ? '#fff' : INK_SOFT, border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    B {loopB !== null ? `· ${fmtTime(loopB)}` : ''}
                  </button>
                  <button
                    onClick={() => { setLoopA(null); setLoopB(null); }}
                    style={{ padding: '8px 14px', background: 'transparent', color: MUTE, border: `1px solid ${BORDER_DK}`, borderRadius: 999, fontSize: 12, cursor: 'pointer' }}
                  >
                    {t(lang, T.clearLoop)}
                  </button>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: INK_SOFT, cursor: 'pointer' }}>
                  <input type="checkbox" checked={loopOn} onChange={(e) => setLoopOn(e.target.checked)} />
                  {loopOn ? t(lang, T.loopOn) : t(lang, T.loopOff)}
                </label>
              </div>

              {/* Sections */}
              <div style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK_SOFT, letterSpacing: '0.04em', marginBottom: 12 }}>{t(lang, T.sections)}</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder={t(lang, T.sectionName)}
                    style={{ flex: 1, padding: '8px 12px', border: `1px solid ${BORDER_DK}`, borderRadius: 8, fontSize: 13, fontFamily: sans }}
                  />
                  <button
                    onClick={saveSection}
                    disabled={loopA === null || loopB === null}
                    style={{
                      padding: '8px 14px',
                      background: loopA !== null && loopB !== null ? ACCENT : BORDER_DK,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: loopA !== null && loopB !== null ? 'pointer' : 'not-allowed',
                    }}
                  >
                    +
                  </button>
                </div>
                <div style={{ maxHeight: 140, overflowY: 'auto' }}>
                  {sections.length === 0 ? (
                    <div style={{ fontSize: 12, color: MUTE_LT, fontStyle: 'italic', padding: '8px 0' }}>
                      {t(lang, T.noSections)}
                    </div>
                  ) : (
                    sections.map((s) => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${BORDER}` }}>
                        <button
                          onClick={() => loadSection(s)}
                          style={{ flex: 1, padding: '6px 10px', background: 'transparent', color: INK_SOFT, border: 'none', textAlign: 'left', fontSize: 13, cursor: 'pointer' }}
                        >
                          <strong>{s.name}</strong>
                          <span style={{ color: MUTE_LT, marginLeft: 8, fontSize: 11 }}>
                            {fmtTime(s.a)}–{fmtTime(s.b)}
                          </span>
                        </button>
                        <button
                          onClick={() => deleteSection(s.id)}
                          style={{ padding: 4, background: 'transparent', color: MUTE_LT, border: 'none', cursor: 'pointer', fontSize: 14 }}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Overdub + Notes row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
              {/* Overdub */}
              <div style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK_SOFT, letterSpacing: '0.04em', marginBottom: 10 }}>{t(lang, T.overdub)}</div>
                <div style={{ fontSize: 12, color: MUTE, marginBottom: 14, lineHeight: 1.6 }}>
                  {t(lang, T.recHint)}
                </div>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 999,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    ● {t(lang, T.startRec)}
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 999,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      animation: 'pulse 1.5s infinite',
                    }}
                  >
                    ■ {t(lang, T.stopRec)}
                  </button>
                )}
                {recordedBlob && (
                  <div style={{ marginTop: 14 }}>
                    <audio controls src={URL.createObjectURL(recordedBlob)} style={{ width: '100%' }} />
                    <a
                      href={URL.createObjectURL(recordedBlob)}
                      download={`${fileName.replace(/\.[^.]+$/, '')}_overdub.webm`}
                      style={{ display: 'inline-block', marginTop: 8, padding: '6px 12px', background: BORDER_DK, color: INK_SOFT, borderRadius: 8, textDecoration: 'none', fontSize: 12 }}
                    >
                      ⇣ {lang === 'ja' ? 'ダウンロード' : lang === 'es' ? 'Descargar' : 'Download'}
                    </a>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK_SOFT, letterSpacing: '0.04em', marginBottom: 10 }}>{t(lang, T.notes)}</div>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder={t(lang, T.notesPh)}
                  style={{
                    width: '100%',
                    minHeight: 120,
                    padding: 12,
                    border: `1px solid ${BORDER_DK}`,
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: sans,
                    resize: 'vertical',
                    color: INK_SOFT,
                    lineHeight: 1.6,
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={insertTimestamp}
                    style={{ padding: '6px 12px', background: ACCENT_BG, color: ACCENT_DK, border: `1px solid ${BORDER_DK}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                  >
                    [{fmtTime(currentTime)}]
                  </button>
                  <button
                    onClick={downloadNotes}
                    disabled={!notesText.trim()}
                    style={{ padding: '6px 12px', background: notesText.trim() ? INK : BORDER_DK, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: notesText.trim() ? 'pointer' : 'not-allowed', fontWeight: 600 }}
                  >
                    {t(lang, T.downloadNotes)}
                  </button>
                </div>
              </div>
            </div>

            {/* SEPARATOR integration */}
            <div style={{ background: ACCENT_BG, borderRadius: 16, padding: 20, border: `1px solid ${BORDER_DK}`, textAlign: 'center' }}>
              <Link
                href="/separator-lp"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  background: ACCENT,
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                → {t(lang, T.sendSep)}
              </Link>
              <div style={{ marginTop: 10, fontSize: 12, color: MUTE }}>
                {lang === 'ja' ? 'Pro プランで自動連携：現在の曲をボーカル/ドラム/ベース/楽器に分離 → 伴奏トラックを作って戻ります。' :
                 lang === 'es' ? 'Con plan Pro: separa la pista actual en voces/batería/bajo/instrumentos → crea pista de acompañamiento → vuelve.' :
                 'With Pro plan: splits current track into vocals/drums/bass/instruments → creates accompaniment track → returns.'}
              </div>
            </div>
          </>
        )}

        {/* Footer link */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/audio-apps" style={{ color: MUTE, fontSize: 13, textDecoration: 'none' }}>
            ← {lang === 'ja' ? 'すべてのオーディオアプリ' : lang === 'es' ? 'Todas las apps de audio' : 'All audio apps'}
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </main>
  );
}
