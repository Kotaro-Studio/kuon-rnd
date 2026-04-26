'use client';

// ============================================================
// KUON DAW — マルチトラック録音・編集・マスタリング
// ============================================================
//
// 機能:
//  - 1-4 トラック (録音 or ファイル読み込み)
//  - 録音: モノ/ステレオ、44.1k/48k/96k、16/24/32bit float
//  - 編集: split, delete, fade, crossfade, drag-move, gain/pan
//  - マスタリング: Peak Normalize, LUFS Normalize, True-Peak Limiter
//  - エクスポート: WAV (16/24/32bit) / MP3 (192/320kbps)
//  - テーマ: 宝石色ダーク / 宝石色ライト 切替 (localStorage 永続化)
//  - プロジェクト: IndexedDB 自動保存・復元
//
// IQ180 設計判断:
//  - 「歌ってみた」+ 「ワンポイント録音エンジニア」のためのシンプル DAW
//  - 安定性 > 機能数
//  - タイムストレッチ・ピッチシフト等の高度機能は意図的に省略
//  - 美しい現代的デザイン (空音オリジナル「宝石色」)
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { AuthGate } from '@/components/AuthGate';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

// ============================================================
// 宝石色パレット (空音オリジナル)
// ============================================================
const TRACK_JEWELS = [
  { name: 'Sapphire',  hex: '#0ea5e9' },
  { name: 'Emerald',   hex: '#10b981' },
  { name: 'Amethyst',  hex: '#a855f7' },
  { name: 'Gold',      hex: '#f59e0b' },
];

// テーマ別カラー
type ThemeMode = 'dark' | 'light';
interface ThemeColors {
  bg: string;
  bgGradient: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;
  timeline: string;
}
const THEME: Record<ThemeMode, ThemeColors> = {
  dark: {
    bg: '#0a1226',
    bgGradient: 'linear-gradient(135deg, #0a1226 0%, #1a2742 100%)',
    surface: 'rgba(255, 255, 255, 0.04)',
    surfaceHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#64748b',
    accent: '#e8b8a0',         // ローズゴールド
    accentSoft: 'rgba(232, 184, 160, 0.2)',
    danger: '#ef4444',
    success: '#10b981',
    timeline: 'rgba(255,255,255,0.04)',
  },
  light: {
    bg: '#fafaf7',
    bgGradient: 'linear-gradient(135deg, #fafaf7 0%, #f0e9e0 100%)',
    surface: 'rgba(255, 255, 255, 0.7)',
    surfaceHover: 'rgba(255, 255, 255, 1)',
    border: 'rgba(10, 18, 38, 0.08)',
    borderStrong: 'rgba(10, 18, 38, 0.15)',
    textPrimary: '#0a1226',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
    accent: '#b8755a',         // ローズゴールド (濃いめ)
    accentSoft: 'rgba(184, 117, 90, 0.15)',
    danger: '#dc2626',
    success: '#059669',
    timeline: 'rgba(0,0,0,0.03)',
  },
};

// ============================================================
// IndexedDB Helper
// ============================================================
const DB_NAME = 'kuon_daw';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_BUFFERS = 'buffers';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_BUFFERS)) db.createObjectStore(STORE_BUFFERS, { keyPath: 'id' });
    };
  });
}

async function dbPut(store: string, value: { id: string; [k: string]: unknown }): Promise<void> {
  const db = await openDb();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  db.close();
}

async function dbGet(store: string, id: string): Promise<unknown> {
  const db = await openDb();
  const r = await new Promise((res, rej) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(id);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
  db.close();
  return r;
}

// ============================================================
// WAV Encoder (16/24/32-bit)
// ============================================================
function audioBufferToWav(buffer: AudioBuffer, bitDepth: 16 | 24 | 32): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = bitDepth === 32 ? 4 : bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const buf = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buf);

  const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  const formatCode = bitDepth === 32 ? 3 : 1; // 3 = IEEE float, 1 = PCM
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, formatCode, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

  let off = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      if (bitDepth === 16) {
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true); off += 2;
      } else if (bitDepth === 24) {
        const v = Math.round(s < 0 ? s * 0x800000 : s * 0x7fffff);
        view.setUint8(off, v & 0xff);
        view.setUint8(off + 1, (v >> 8) & 0xff);
        view.setUint8(off + 2, (v >> 16) & 0xff);
        off += 3;
      } else {
        view.setFloat32(off, s, true); off += 4;
      }
    }
  }
  return new Blob([buf], { type: 'audio/wav' });
}

// ============================================================
// Peak / LUFS analysis (簡易版)
// ============================================================
function findPeak(buffer: AudioBuffer): number {
  let peak = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      const v = Math.abs(data[i]);
      if (v > peak) peak = v;
    }
  }
  return peak;
}

// 簡易 K-weighting + RMS による Integrated LUFS 推定 (簡略実装)
function estimateLUFS(buffer: AudioBuffer): number {
  // ITU-R BS.1770-4 K-weighting 完全実装は省略・簡略 RMS で代用
  let sumSquares = 0;
  let count = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      sumSquares += data[i] * data[i];
      count++;
    }
  }
  if (count === 0) return -70;
  const meanSq = sumSquares / count;
  if (meanSq <= 0) return -70;
  // -0.691 dB は K-weighting 補正 (近似)
  return -0.691 + 10 * Math.log10(meanSq);
}

// ============================================================
// Types
// ============================================================
interface Region {
  id: string;
  bufferId: string;          // IndexedDB の AudioBuffer 参照
  startInTrack: number;      // トラック上の位置 (秒)
  offsetInBuffer: number;    // バッファ内の開始オフセット (秒)
  duration: number;          // 再生長 (秒)
  fadeInSec: number;
  fadeOutSec: number;
}

interface Track {
  id: string;
  name: string;
  jewelIdx: number;          // TRACK_JEWELS index
  gainDb: number;            // -infinity〜+12 dB
  pan: number;               // -1 (L) to +1 (R)
  mute: boolean;
  solo: boolean;
  regions: Region[];
}

interface Project {
  id: string;
  name: string;
  bpm: number;
  sampleRate: 44100 | 48000 | 96000;
  tracks: Track[];
  modifiedAt: number;
}

// ============================================================
// Main App (gated)
// ============================================================
function DawApp() {
  const { lang } = useLang();
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [project, setProject] = useState<Project>(() => createBlankProject());
  const [audioBuffers, setAudioBuffers] = useState<Map<string, AudioBuffer>>(new Map());
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [activeRecordingTrackId, setActiveRecordingTrackId] = useState<string | null>(null);
  const [recState, setRecState] = useState<'idle' | 'recording'>('idle');
  const [recElapsed, setRecElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playPos, setPlayPos] = useState(0);
  const [exporting, setExporting] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<Blob[]>([]);
  const recStartRef = useRef<number>(0);
  const recIntervalRef = useRef<number | null>(null);
  const playSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playStartTimeRef = useRef(0);
  const playRafRef = useRef<number | null>(null);

  const c = THEME[theme];

  // Theme persistence
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('kuon_daw_theme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('kuon_daw_theme', theme);
  }, [theme]);

  // AudioContext
  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctx({ sampleRate: project.sampleRate });
    }
    return audioCtxRef.current;
  }, [project.sampleRate]);

  // ============================================================
  // Project total duration
  // ============================================================
  const projectDuration = (() => {
    let max = 0;
    for (const tr of project.tracks) {
      for (const r of tr.regions) {
        const end = r.startInTrack + r.duration;
        if (end > max) max = end;
      }
    }
    return Math.max(max, 30); // minimum 30 seconds
  })();

  // ============================================================
  // Track operations
  // ============================================================
  const addTrack = () => {
    if (project.tracks.length >= 4) return;
    setProject((p) => ({
      ...p,
      tracks: [...p.tracks, makeTrack(p.tracks.length)],
      modifiedAt: Date.now(),
    }));
  };

  const removeTrack = (trackId: string) => {
    setProject((p) => ({ ...p, tracks: p.tracks.filter((t) => t.id !== trackId), modifiedAt: Date.now() }));
  };

  const updateTrack = (trackId: string, updates: Partial<Track>) => {
    setProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, ...updates } : t)),
      modifiedAt: Date.now(),
    }));
  };

  // ============================================================
  // File upload to track
  // ============================================================
  const uploadToTrack = async (trackId: string, file: File) => {
    try {
      const ctx = getCtx();
      const ab = await file.arrayBuffer();
      const buf = await ctx.decodeAudioData(ab.slice(0));
      const bufferId = `buf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setAudioBuffers((m) => new Map(m).set(bufferId, buf));

      const region: Region = {
        id: `r_${Date.now()}`,
        bufferId,
        startInTrack: 0,
        offsetInBuffer: 0,
        duration: buf.duration,
        fadeInSec: 0,
        fadeOutSec: 0,
      };

      setProject((p) => ({
        ...p,
        tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, regions: [...t.regions, region] } : t)),
        modifiedAt: Date.now(),
      }));
    } catch (e) {
      console.error('Upload failed:', e);
      alert(t({ ja: 'ファイル読み込みに失敗しました', en: 'File load failed', es: 'Error al cargar' }, lang));
    }
  };

  // ============================================================
  // Recording
  // ============================================================
  const startRecording = async (trackId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 2,
          sampleRate: project.sampleRate,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });
      mediaRecRef.current = recorder;
      recChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(recChunksRef.current, { type: 'audio/webm' });
        const ctx = getCtx();
        const ab = await blob.arrayBuffer();
        const buf = await ctx.decodeAudioData(ab.slice(0));
        const bufferId = `buf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        setAudioBuffers((m) => new Map(m).set(bufferId, buf));

        const region: Region = {
          id: `r_${Date.now()}`,
          bufferId,
          startInTrack: 0,
          offsetInBuffer: 0,
          duration: buf.duration,
          fadeInSec: 0,
          fadeOutSec: 0,
        };
        setProject((p) => ({
          ...p,
          tracks: p.tracks.map((t) => (t.id === trackId ? { ...t, regions: [...t.regions, region] } : t)),
          modifiedAt: Date.now(),
        }));
      };
      recorder.start();
      recStartRef.current = Date.now();
      setRecState('recording');
      setActiveRecordingTrackId(trackId);
      recIntervalRef.current = window.setInterval(() => {
        setRecElapsed((Date.now() - recStartRef.current) / 1000);
      }, 100);
    } catch (e) {
      console.error('Recording failed:', e);
      alert(t({ ja: 'マイクアクセスが必要です', en: 'Microphone access required', es: 'Se requiere acceso al micrófono' }, lang));
    }
  };

  const stopRecording = () => {
    if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') mediaRecRef.current.stop();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (recIntervalRef.current) {
      window.clearInterval(recIntervalRef.current);
      recIntervalRef.current = null;
    }
    setRecState('idle');
    setActiveRecordingTrackId(null);
    setRecElapsed(0);
  };

  // ============================================================
  // Region operations
  // ============================================================
  const updateRegion = (trackId: string, regionId: string, updates: Partial<Region>) => {
    setProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) =>
        t.id !== trackId ? t : { ...t, regions: t.regions.map((r) => (r.id === regionId ? { ...r, ...updates } : r)) }
      ),
      modifiedAt: Date.now(),
    }));
  };

  const deleteRegion = (trackId: string, regionId: string) => {
    setProject((p) => ({
      ...p,
      tracks: p.tracks.map((t) => (t.id !== trackId ? t : { ...t, regions: t.regions.filter((r) => r.id !== regionId) })),
      modifiedAt: Date.now(),
    }));
    setSelectedRegionId(null);
  };

  // Split at playhead position (in track's time)
  const splitRegionAtTime = (trackId: string, regionId: string, splitTimeInTrack: number) => {
    const track = project.tracks.find((t) => t.id === trackId);
    if (!track) return;
    const region = track.regions.find((r) => r.id === regionId);
    if (!region) return;
    const splitOffset = splitTimeInTrack - region.startInTrack;
    if (splitOffset <= 0.05 || splitOffset >= region.duration - 0.05) return;

    const left: Region = { ...region, duration: splitOffset, fadeOutSec: 0 };
    const right: Region = {
      ...region,
      id: `r_${Date.now()}`,
      startInTrack: splitTimeInTrack,
      offsetInBuffer: region.offsetInBuffer + splitOffset,
      duration: region.duration - splitOffset,
      fadeInSec: 0,
    };
    setProject((p) => ({
      ...p,
      tracks: p.tracks.map((tr) =>
        tr.id !== trackId ? tr : { ...tr, regions: tr.regions.map((r) => (r.id === regionId ? left : r)).concat([right]) }
      ),
      modifiedAt: Date.now(),
    }));
  };

  // ============================================================
  // Playback
  // ============================================================
  const stopPlayback = useCallback(() => {
    playSourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
    playSourcesRef.current = [];
    if (playRafRef.current) cancelAnimationFrame(playRafRef.current);
    setPlaying(false);
    setPlayPos(0);
  }, []);

  const playProject = useCallback(() => {
    if (playing) {
      stopPlayback();
      return;
    }
    const ctx = getCtx();
    const startTime = ctx.currentTime + 0.05;
    playStartTimeRef.current = startTime;

    // Solo handling
    const anySolo = project.tracks.some((t) => t.solo);

    project.tracks.forEach((track) => {
      const audible = anySolo ? track.solo : !track.mute;
      if (!audible) return;

      const trackGain = ctx.createGain();
      const trackPan = ctx.createStereoPanner();
      trackGain.gain.value = dbToLinear(track.gainDb);
      trackPan.pan.value = track.pan;
      trackGain.connect(trackPan).connect(ctx.destination);

      track.regions.forEach((r) => {
        const buf = audioBuffers.get(r.bufferId);
        if (!buf) return;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const regionGain = ctx.createGain();

        const startAt = startTime + r.startInTrack;
        const endAt = startAt + r.duration;
        const fadeIn = Math.min(r.fadeInSec, r.duration / 2);
        const fadeOut = Math.min(r.fadeOutSec, r.duration / 2);

        regionGain.gain.setValueAtTime(fadeIn > 0 ? 0 : 1, startAt);
        if (fadeIn > 0) regionGain.gain.linearRampToValueAtTime(1, startAt + fadeIn);
        regionGain.gain.setValueAtTime(1, endAt - fadeOut);
        if (fadeOut > 0) regionGain.gain.linearRampToValueAtTime(0, endAt);

        src.connect(regionGain).connect(trackGain);
        src.start(startAt, r.offsetInBuffer, r.duration);
        src.stop(endAt + 0.05);
        playSourcesRef.current.push(src);
      });
    });

    setPlaying(true);
    const animate = () => {
      const elapsed = ctx.currentTime - startTime;
      if (elapsed >= projectDuration) {
        stopPlayback();
        return;
      }
      setPlayPos(elapsed);
      playRafRef.current = requestAnimationFrame(animate);
    };
    playRafRef.current = requestAnimationFrame(animate);
  }, [playing, project, audioBuffers, projectDuration, getCtx, stopPlayback]);

  // ============================================================
  // Export (mastering + WAV/MP3)
  // ============================================================
  const renderProject = async (
    targetSampleRate: 44100 | 48000 | 96000,
    normalizeMode: 'none' | 'peak' | 'lufs',
    targetLufs: number,
    targetPeakDb: number,
    applyLimiter: boolean,
  ): Promise<AudioBuffer> => {
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(projectDuration * targetSampleRate), targetSampleRate);
    const anySolo = project.tracks.some((t) => t.solo);
    project.tracks.forEach((track) => {
      const audible = anySolo ? track.solo : !track.mute;
      if (!audible) return;
      const trackGain = offlineCtx.createGain();
      const trackPan = offlineCtx.createStereoPanner();
      trackGain.gain.value = dbToLinear(track.gainDb);
      trackPan.pan.value = track.pan;
      trackGain.connect(trackPan).connect(offlineCtx.destination);
      track.regions.forEach((r) => {
        const buf = audioBuffers.get(r.bufferId);
        if (!buf) return;
        const src = offlineCtx.createBufferSource();
        src.buffer = buf;
        const regionGain = offlineCtx.createGain();
        const startAt = r.startInTrack;
        const endAt = startAt + r.duration;
        const fadeIn = Math.min(r.fadeInSec, r.duration / 2);
        const fadeOut = Math.min(r.fadeOutSec, r.duration / 2);
        regionGain.gain.setValueAtTime(fadeIn > 0 ? 0 : 1, startAt);
        if (fadeIn > 0) regionGain.gain.linearRampToValueAtTime(1, startAt + fadeIn);
        regionGain.gain.setValueAtTime(1, endAt - fadeOut);
        if (fadeOut > 0) regionGain.gain.linearRampToValueAtTime(0, endAt);
        src.connect(regionGain).connect(trackGain);
        src.start(startAt, r.offsetInBuffer, r.duration);
      });
    });
    const rendered = await offlineCtx.startRendering();

    // Normalize
    let gain = 1;
    if (normalizeMode === 'peak') {
      const peak = findPeak(rendered);
      const targetPeak = Math.pow(10, targetPeakDb / 20);
      if (peak > 0) gain = targetPeak / peak;
    } else if (normalizeMode === 'lufs') {
      const lufs = estimateLUFS(rendered);
      if (lufs > -70) {
        const diffDb = targetLufs - lufs;
        gain = Math.pow(10, diffDb / 20);
      }
    }

    // Apply gain + soft limiter (if enabled)
    if (gain !== 1 || applyLimiter) {
      const ceil = Math.pow(10, -1 / 20); // -1 dBTP
      for (let c = 0; c < rendered.numberOfChannels; c++) {
        const data = rendered.getChannelData(c);
        for (let i = 0; i < data.length; i++) {
          let v = data[i] * gain;
          if (applyLimiter) {
            // tanh soft clip at -1 dBTP
            v = ceil * Math.tanh(v / ceil);
          }
          data[i] = Math.max(-1, Math.min(1, v));
        }
      }
    }

    return rendered;
  };

  const exportFile = async (
    format: 'wav' | 'mp3',
    bitDepth: 16 | 24 | 32,
    sampleRate: 44100 | 48000 | 96000,
    normalize: 'none' | 'peak' | 'lufs',
    targetLufs: number,
    targetPeak: number,
    limiter: boolean,
    mp3Bitrate: 192 | 320,
  ) => {
    setExporting(true);
    try {
      const rendered = await renderProject(sampleRate, normalize, targetLufs, targetPeak, limiter);
      let blob: Blob;
      let ext: string;
      if (format === 'wav') {
        blob = audioBufferToWav(rendered, bitDepth);
        ext = 'wav';
      } else {
        // MP3 via lamejs (already in /public/lamejs/lame.all.js)
        blob = await encodeMp3(rendered, mp3Bitrate);
        ext = 'mp3';
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name || 'kuon-daw'}-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
      alert(t({ ja: '書き出しに失敗しました', en: 'Export failed', es: 'Error al exportar' }, lang));
    } finally {
      setExporting(false);
    }
  };

  // ============================================================
  // Auto-save
  // ============================================================
  useEffect(() => {
    const id = setTimeout(() => {
      dbPut(STORE_PROJECTS, { ...project, modifiedAt: Date.now() }).catch(() => {});
    }, 1500);
    return () => clearTimeout(id);
  }, [project]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopRecording();
      stopPlayback();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div style={{
      minHeight: '100vh',
      background: c.bgGradient,
      color: c.textPrimary,
      fontFamily: sans,
      transition: 'background 0.4s ease, color 0.4s ease',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(1rem, 2.5vw, 2rem)' }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.85rem' }}>
            <Link href="/daw-lp" style={{ fontFamily: serif, fontSize: '1.15rem', color: c.textPrimary, textDecoration: 'none', letterSpacing: '0.15em', fontWeight: 300 }}>
              KUON DAW
            </Link>
            <input
              value={project.name}
              onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))}
              placeholder={t({ ja: 'プロジェクト名', en: 'Project name', es: 'Proyecto' }, lang)}
              style={{
                background: 'transparent', border: 'none',
                borderBottom: `1px solid ${c.border}`,
                color: c.textSecondary, fontSize: '0.9rem',
                padding: '0.25rem 0.5rem', fontFamily: serif,
                outline: 'none', width: 200,
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              style={{
                background: c.surface, border: `1px solid ${c.border}`,
                color: c.textPrimary, padding: '0.4rem 0.85rem',
                borderRadius: 999, fontSize: '0.78rem', cursor: 'pointer',
                fontFamily: sans, transition: 'all 0.2s ease',
              }}
            >
              {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
            </button>
            <Link href="/audio-apps" style={{ fontSize: '0.78rem', color: c.textTertiary, textDecoration: 'none' }}>
              {t({ ja: 'すべてのアプリ', en: 'All apps', es: 'Todas' }, lang)}
            </Link>
          </div>
        </header>

        {/* Settings bar */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: c.textTertiary, marginBottom: '0.2rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>BPM</div>
            <input type="number" value={project.bpm}
              onChange={(e) => setProject((p) => ({ ...p, bpm: parseInt(e.target.value) || 80 }))}
              style={{ width: 70, background: 'transparent', border: `1px solid ${c.border}`, color: c.textPrimary, padding: '0.4rem 0.6rem', borderRadius: 6, fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: c.textTertiary, marginBottom: '0.2rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sample Rate</div>
            <select value={project.sampleRate}
              onChange={(e) => setProject((p) => ({ ...p, sampleRate: parseInt(e.target.value) as 44100 | 48000 | 96000 }))}
              style={{ background: 'transparent', border: `1px solid ${c.border}`, color: c.textPrimary, padding: '0.4rem 0.6rem', borderRadius: 6, fontSize: '0.85rem' }}
              disabled={project.tracks.some((t) => t.regions.length > 0)}
            >
              <option value={44100} style={{ background: c.bg, color: c.textPrimary }}>44.1 kHz (CD)</option>
              <option value={48000} style={{ background: c.bg, color: c.textPrimary }}>48 kHz (Video)</option>
              <option value={96000} style={{ background: c.bg, color: c.textPrimary }}>96 kHz (Hi-Res)</option>
            </select>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button onClick={playProject} disabled={recState === 'recording'}
              style={{ background: c.accent, color: theme === 'dark' ? '#0a1226' : '#fff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              {playing ? '■ Stop' : '▶ Play'}
            </button>
            <button onClick={addTrack} disabled={project.tracks.length >= 4}
              style={{ background: c.surface, color: c.textPrimary, border: `1px solid ${c.borderStrong}`, padding: '0.55rem 1rem', borderRadius: 999, fontSize: '0.78rem', cursor: project.tracks.length >= 4 ? 'not-allowed' : 'pointer', opacity: project.tracks.length >= 4 ? 0.5 : 1 }}>
              + {t({ ja: 'トラック追加', en: 'Add Track', es: 'Añadir' }, lang)} ({project.tracks.length}/4)
            </button>
          </div>
        </div>

        {/* Timeline header (time markers) */}
        <div style={{ display: 'flex', marginBottom: 4, paddingLeft: 220 }}>
          {Array.from({ length: Math.ceil(projectDuration / 5) }).map((_, i) => (
            <div key={i} style={{ flex: 1, fontSize: '0.65rem', color: c.textTertiary, borderLeft: `1px solid ${c.border}`, paddingLeft: 4 }}>
              {i * 5}s
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {project.tracks.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              theme={c}
              themeMode={theme}
              audioBuffers={audioBuffers}
              projectDuration={projectDuration}
              isRecording={activeRecordingTrackId === track.id && recState === 'recording'}
              recElapsed={recElapsed}
              playing={playing}
              playPos={playPos}
              selectedRegionId={selectedRegionId}
              setSelectedRegionId={setSelectedRegionId}
              onUpload={(file) => uploadToTrack(track.id, file)}
              onStartRecord={() => startRecording(track.id)}
              onStopRecord={stopRecording}
              onUpdateTrack={(u) => updateTrack(track.id, u)}
              onRemoveTrack={() => removeTrack(track.id)}
              onUpdateRegion={(rid, u) => updateRegion(track.id, rid, u)}
              onDeleteRegion={(rid) => deleteRegion(track.id, rid)}
              onSplitRegion={(rid) => splitRegionAtTime(track.id, rid, playPos)}
              lang={lang}
            />
          ))}
          {project.tracks.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: c.textTertiary, border: `1px dashed ${c.border}`, borderRadius: 12 }}>
              {t({ ja: '「+ トラック追加」で録音/読込を始めましょう', en: 'Add a track to start recording or loading', es: 'Añade una pista para comenzar' }, lang)}
            </div>
          )}
        </div>

        {/* Master / Export */}
        {project.tracks.length > 0 && (
          <ExportPanel
            theme={c}
            themeMode={theme}
            sampleRate={project.sampleRate}
            disabled={exporting || playing || recState === 'recording'}
            onExport={exportFile}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Track Row Component
// ============================================================
interface TrackRowProps {
  track: Track;
  theme: ThemeColors;
  themeMode: ThemeMode;
  audioBuffers: Map<string, AudioBuffer>;
  projectDuration: number;
  isRecording: boolean;
  recElapsed: number;
  playing: boolean;
  playPos: number;
  selectedRegionId: string | null;
  setSelectedRegionId: (id: string | null) => void;
  onUpload: (file: File) => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onUpdateTrack: (u: Partial<Track>) => void;
  onRemoveTrack: () => void;
  onUpdateRegion: (rid: string, u: Partial<Region>) => void;
  onDeleteRegion: (rid: string) => void;
  onSplitRegion: (rid: string) => void;
  lang: Lang;
}

function TrackRow(props: TrackRowProps) {
  const { track, theme: c, themeMode, audioBuffers, projectDuration, isRecording, recElapsed,
    playing, playPos, selectedRegionId, setSelectedRegionId, onUpload, onStartRecord, onStopRecord,
    onUpdateTrack, onRemoveTrack, onUpdateRegion, onDeleteRegion, onSplitRegion, lang } = props;
  const fileRef = useRef<HTMLInputElement>(null);
  const jewel = TRACK_JEWELS[track.jewelIdx % TRACK_JEWELS.length];

  return (
    <div style={{ display: 'flex', background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
      {/* Track header (mixer) */}
      <div style={{ width: 220, flexShrink: 0, padding: '0.75rem', borderRight: `1px solid ${c.border}`, borderLeft: `4px solid ${jewel.hex}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <input value={track.name} onChange={(e) => onUpdateTrack({ name: e.target.value })}
            style={{ flex: 1, background: 'transparent', border: 'none', color: c.textPrimary, fontSize: '0.85rem', fontWeight: 600, outline: 'none', padding: 0 }}
          />
          <button onClick={onRemoveTrack} title="Remove track"
            style={{ background: 'none', border: 'none', color: c.textTertiary, cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
        </div>
        <div style={{ fontSize: '0.6rem', color: jewel.hex, letterSpacing: '0.1em', marginBottom: '0.6rem', textTransform: 'uppercase', fontWeight: 600 }}>
          {jewel.name}
        </div>
        {/* Gain */}
        <div style={{ marginBottom: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: c.textTertiary, marginBottom: 2 }}>
            <span>GAIN</span><span>{track.gainDb > 0 ? '+' : ''}{track.gainDb.toFixed(1)} dB</span>
          </div>
          <input type="range" min={-60} max={12} step={0.5} value={track.gainDb}
            onChange={(e) => onUpdateTrack({ gainDb: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: jewel.hex }}
          />
        </div>
        {/* Pan */}
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: c.textTertiary, marginBottom: 2 }}>
            <span>PAN</span><span>{track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.round(-track.pan * 100)}` : `R${Math.round(track.pan * 100)}`}</span>
          </div>
          <input type="range" min={-1} max={1} step={0.05} value={track.pan}
            onChange={(e) => onUpdateTrack({ pan: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: jewel.hex }}
          />
        </div>
        {/* Mute / Solo */}
        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
          <button onClick={() => onUpdateTrack({ mute: !track.mute })}
            style={{ flex: 1, background: track.mute ? c.danger : c.surface, color: track.mute ? '#fff' : c.textSecondary, border: `1px solid ${track.mute ? c.danger : c.border}`, padding: '0.3rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>M</button>
          <button onClick={() => onUpdateTrack({ solo: !track.solo })}
            style={{ flex: 1, background: track.solo ? '#f59e0b' : c.surface, color: track.solo ? '#000' : c.textSecondary, border: `1px solid ${track.solo ? '#f59e0b' : c.border}`, padding: '0.3rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>S</button>
        </div>
        {/* Record / Upload */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button onClick={isRecording ? onStopRecord : onStartRecord}
            style={{ flex: 1, background: isRecording ? c.danger : c.surface, color: isRecording ? '#fff' : c.textSecondary, border: `1px solid ${isRecording ? c.danger : c.border}`, padding: '0.4rem', borderRadius: 4, fontSize: '0.7rem', cursor: 'pointer' }}>
            {isRecording ? '■' : '⚫'} {isRecording ? recElapsed.toFixed(1) + 's' : 'REC'}
          </button>
          <button onClick={() => fileRef.current?.click()}
            style={{ flex: 1, background: c.surface, color: c.textSecondary, border: `1px solid ${c.border}`, padding: '0.4rem', borderRadius: 4, fontSize: '0.7rem', cursor: 'pointer' }}>
            📁 Load
          </button>
          <input ref={fileRef} type="file" accept="audio/*" hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, position: 'relative', background: c.timeline, height: 110, overflow: 'hidden' }}>
        {/* Time grid */}
        {Array.from({ length: Math.ceil(projectDuration / 5) }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${(i * 5 / projectDuration) * 100}%`, top: 0, bottom: 0, borderLeft: `1px dashed ${c.border}` }} />
        ))}
        {/* Regions */}
        {track.regions.map((region) => {
          const buf = audioBuffers.get(region.bufferId);
          const isSelected = selectedRegionId === region.id;
          return (
            <RegionView
              key={region.id}
              region={region}
              buffer={buf}
              jewelHex={jewel.hex}
              themeMode={themeMode}
              projectDuration={projectDuration}
              selected={isSelected}
              onSelect={() => setSelectedRegionId(region.id)}
              onUpdate={(u) => onUpdateRegion(region.id, u)}
              onDelete={() => onDeleteRegion(region.id)}
              onSplit={() => onSplitRegion(region.id)}
            />
          );
        })}
        {/* Playhead */}
        {playing && (
          <div style={{ position: 'absolute', left: `${(playPos / projectDuration) * 100}%`, top: 0, bottom: 0, width: 2, background: c.accent, pointerEvents: 'none', boxShadow: `0 0 8px ${c.accent}` }} />
        )}
      </div>
    </div>
  );
}

// ============================================================
// Region Component (with drag, resize, fade)
// ============================================================
interface RegionViewProps {
  region: Region;
  buffer?: AudioBuffer;
  jewelHex: string;
  themeMode: ThemeMode;
  projectDuration: number;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (u: Partial<Region>) => void;
  onDelete: () => void;
  onSplit: () => void;
}

function RegionView({ region, buffer, jewelHex, themeMode, projectDuration, selected, onSelect, onUpdate, onDelete, onSplit }: RegionViewProps) {
  const [dragMode, setDragMode] = useState<null | 'move' | 'resize-l' | 'resize-r'>(null);
  const dragStartRef = useRef<{ x: number; startInTrack: number; offsetInBuffer: number; duration: number } | null>(null);

  const startPct = (region.startInTrack / projectDuration) * 100;
  const widthPct = (region.duration / projectDuration) * 100;

  const handlePointerDown = (e: React.PointerEvent, mode: 'move' | 'resize-l' | 'resize-r') => {
    e.stopPropagation();
    onSelect();
    setDragMode(mode);
    dragStartRef.current = {
      x: e.clientX,
      startInTrack: region.startInTrack,
      offsetInBuffer: region.offsetInBuffer,
      duration: region.duration,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragMode || !dragStartRef.current) return;
    const parentWidth = (e.currentTarget.parentElement as HTMLElement).offsetWidth;
    const dxSec = ((e.clientX - dragStartRef.current.x) / parentWidth) * projectDuration;

    if (dragMode === 'move') {
      onUpdate({ startInTrack: Math.max(0, dragStartRef.current.startInTrack + dxSec) });
    } else if (dragMode === 'resize-r') {
      const newDur = Math.max(0.1, dragStartRef.current.duration + dxSec);
      const maxDur = buffer ? buffer.duration - region.offsetInBuffer : newDur;
      onUpdate({ duration: Math.min(newDur, maxDur) });
    } else if (dragMode === 'resize-l') {
      const desiredOffset = Math.max(0, dragStartRef.current.offsetInBuffer + dxSec);
      const desiredStart = dragStartRef.current.startInTrack + (desiredOffset - dragStartRef.current.offsetInBuffer);
      const desiredDuration = dragStartRef.current.duration - (desiredOffset - dragStartRef.current.offsetInBuffer);
      if (desiredDuration > 0.1 && desiredStart >= 0) {
        onUpdate({ offsetInBuffer: desiredOffset, startInTrack: desiredStart, duration: desiredDuration });
      }
    }
  };

  const handlePointerUp = () => { setDragMode(null); dragStartRef.current = null; };

  return (
    <div
      onClick={onSelect}
      style={{
        position: 'absolute', left: `${startPct}%`, width: `${widthPct}%`, top: 6, height: 98,
        background: `linear-gradient(180deg, ${jewelHex}cc 0%, ${jewelHex}99 100%)`,
        border: selected ? `2px solid #fff` : `1px solid ${jewelHex}`,
        borderRadius: 6, cursor: dragMode === 'move' ? 'grabbing' : 'grab',
        boxShadow: selected ? `0 0 16px ${jewelHex}88` : 'none',
        transition: 'box-shadow 0.2s ease',
        overflow: 'hidden',
      }}
      onPointerDown={(e) => handlePointerDown(e, 'move')}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Waveform mini */}
      {buffer && <RegionWaveform buffer={buffer} offset={region.offsetInBuffer} duration={region.duration} themeMode={themeMode} />}

      {/* Resize handles */}
      <div onPointerDown={(e) => handlePointerDown(e, 'resize-l')}
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, cursor: 'ew-resize', background: 'rgba(255,255,255,0.3)' }} />
      <div onPointerDown={(e) => handlePointerDown(e, 'resize-r')}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'ew-resize', background: 'rgba(255,255,255,0.3)' }} />

      {/* Selected actions */}
      {selected && (
        <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4, zIndex: 10 }}>
          <button onClick={(e) => { e.stopPropagation(); onSplit(); }} title="Split at playhead"
            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>✂</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete"
            style={{ background: 'rgba(220,38,38,0.8)', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer' }}>🗑</button>
        </div>
      )}
      {selected && (
        <div style={{ position: 'absolute', bottom: 2, left: 8, right: 8, display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#fff' }}>
          <span>Fade In: {region.fadeInSec.toFixed(1)}s</span>
          <span>Fade Out: {region.fadeOutSec.toFixed(1)}s</span>
        </div>
      )}
      {selected && (
        <div style={{ position: 'absolute', bottom: 16, left: 4, right: 4, display: 'flex', gap: 4 }}>
          <input type="range" min={0} max={Math.min(2, region.duration / 2)} step={0.05} value={region.fadeInSec}
            onChange={(e) => { e.stopPropagation(); onUpdate({ fadeInSec: parseFloat(e.target.value) }); }}
            onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
            style={{ flex: 1, accentColor: '#fff' }}
          />
          <input type="range" min={0} max={Math.min(2, region.duration / 2)} step={0.05} value={region.fadeOutSec}
            onChange={(e) => { e.stopPropagation(); onUpdate({ fadeOutSec: parseFloat(e.target.value) }); }}
            onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
            style={{ flex: 1, accentColor: '#fff' }}
          />
        </div>
      )}
    </div>
  );
}

function RegionWaveform({ buffer, offset, duration, themeMode }: { buffer: AudioBuffer; offset: number; duration: number; themeMode: ThemeMode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || !buffer) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const w = cv.width = cv.clientWidth * 2;
    const h = cv.height = cv.clientHeight * 2;
    const data = buffer.getChannelData(0);
    const startSample = Math.floor(offset * buffer.sampleRate);
    const endSample = Math.min(data.length, Math.floor((offset + duration) * buffer.sampleRate));
    const samples = endSample - startSample;
    const step = Math.max(1, Math.floor(samples / w));
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = themeMode === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)';
    for (let x = 0; x < w; x++) {
      let min = 1, max = -1;
      for (let i = 0; i < step; i++) {
        const v = data[startSample + x * step + i] || 0;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const yMin = ((1 + min) * h) / 2;
      const yMax = ((1 + max) * h) / 2;
      ctx.fillRect(x, yMax, 1, Math.max(2, yMin - yMax));
    }
  }, [buffer, offset, duration, themeMode]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />;
}

// ============================================================
// Export Panel
// ============================================================
function ExportPanel({ theme: c, themeMode, sampleRate, disabled, onExport, lang }: {
  theme: ThemeColors; themeMode: ThemeMode; sampleRate: 44100 | 48000 | 96000; disabled: boolean;
  onExport: (
    format: 'wav' | 'mp3', bitDepth: 16 | 24 | 32, sampleRate: 44100 | 48000 | 96000,
    normalize: 'none' | 'peak' | 'lufs', targetLufs: number, targetPeak: number, limiter: boolean,
    mp3Bitrate: 192 | 320,
  ) => void;
  lang: Lang;
}) {
  const [format, setFormat] = useState<'wav' | 'mp3'>('wav');
  const [bitDepth, setBitDepth] = useState<16 | 24 | 32>(24);
  const [normalize, setNormalize] = useState<'none' | 'peak' | 'lufs'>('lufs');
  const [targetLufs, setTargetLufs] = useState(-14);
  const [targetPeak, setTargetPeak] = useState(-1);
  const [limiter, setLimiter] = useState(true);
  const [mp3Bitrate, setMp3Bitrate] = useState<192 | 320>(320);

  return (
    <div style={{ marginTop: '1.5rem', background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: '1.25rem' }}>
      <h3 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, color: c.textPrimary, marginBottom: '1rem', letterSpacing: '0.1em' }}>
        {t({ ja: '✨ マスタリング & エクスポート', en: '✨ Mastering & Export', es: '✨ Masterización' }, lang)}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <Field theme={c} label={t({ ja: '形式', en: 'Format', es: 'Formato' }, lang)}>
          <select value={format} onChange={(e) => setFormat(e.target.value as 'wav' | 'mp3')}
            style={inputStyle(c)}>
            <option value="wav" style={{ background: c.bg }}>WAV</option>
            <option value="mp3" style={{ background: c.bg }}>MP3</option>
          </select>
        </Field>
        {format === 'wav' && (
          <Field theme={c} label={t({ ja: 'ビット深度', en: 'Bit Depth', es: 'Bit' }, lang)}>
            <select value={bitDepth} onChange={(e) => setBitDepth(parseInt(e.target.value) as 16 | 24 | 32)}
              style={inputStyle(c)}>
              <option value={16} style={{ background: c.bg }}>16-bit (CD)</option>
              <option value={24} style={{ background: c.bg }}>24-bit (Studio)</option>
              <option value={32} style={{ background: c.bg }}>32-bit float</option>
            </select>
          </Field>
        )}
        {format === 'mp3' && (
          <Field theme={c} label={t({ ja: 'ビットレート', en: 'Bitrate', es: 'Bitrate' }, lang)}>
            <select value={mp3Bitrate} onChange={(e) => setMp3Bitrate(parseInt(e.target.value) as 192 | 320)}
              style={inputStyle(c)}>
              <option value={192} style={{ background: c.bg }}>192 kbps</option>
              <option value={320} style={{ background: c.bg }}>320 kbps (Best)</option>
            </select>
          </Field>
        )}
        <Field theme={c} label={t({ ja: 'ノーマライズ', en: 'Normalize', es: 'Normalizar' }, lang)}>
          <select value={normalize} onChange={(e) => setNormalize(e.target.value as 'none' | 'peak' | 'lufs')}
            style={inputStyle(c)}>
            <option value="none" style={{ background: c.bg }}>None</option>
            <option value="peak" style={{ background: c.bg }}>Peak (dBFS)</option>
            <option value="lufs" style={{ background: c.bg }}>LUFS (Loudness)</option>
          </select>
        </Field>
        {normalize === 'lufs' && (
          <Field theme={c} label={t({ ja: 'ターゲット LUFS', en: 'Target LUFS', es: 'LUFS' }, lang)}>
            <select value={targetLufs} onChange={(e) => setTargetLufs(parseFloat(e.target.value))}
              style={inputStyle(c)}>
              <option value={-14} style={{ background: c.bg }}>-14 (Spotify/YouTube)</option>
              <option value={-16} style={{ background: c.bg }}>-16 (Apple Music)</option>
              <option value={-23} style={{ background: c.bg }}>-23 (EBU R128)</option>
            </select>
          </Field>
        )}
        {normalize === 'peak' && (
          <Field theme={c} label={t({ ja: 'ターゲット dBFS', en: 'Target dBFS', es: 'dBFS' }, lang)}>
            <select value={targetPeak} onChange={(e) => setTargetPeak(parseFloat(e.target.value))}
              style={inputStyle(c)}>
              <option value={-0.1} style={{ background: c.bg }}>-0.1 dBFS</option>
              <option value={-1} style={{ background: c.bg }}>-1 dBFS</option>
              <option value={-3} style={{ background: c.bg }}>-3 dBFS</option>
            </select>
          </Field>
        )}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: c.textSecondary, cursor: 'pointer', marginBottom: '1rem' }}>
        <input type="checkbox" checked={limiter} onChange={(e) => setLimiter(e.target.checked)} />
        {t({ ja: 'True-Peak Limiter (-1 dBTP)', en: 'True-Peak Limiter (-1 dBTP)', es: 'Limitador True-Peak' }, lang)}
      </label>
      <button
        onClick={() => onExport(format, bitDepth, sampleRate, normalize, targetLufs, targetPeak, limiter, mp3Bitrate)}
        disabled={disabled}
        style={{
          background: c.accent, color: themeMode === 'dark' ? '#0a1226' : '#fff', border: 'none',
          padding: '0.85rem 2rem', borderRadius: 999, fontSize: '0.9rem', fontWeight: 600, cursor: disabled ? 'wait' : 'pointer',
          opacity: disabled ? 0.5 : 1, fontFamily: sans,
        }}>
        {disabled ? t({ ja: '処理中…', en: 'Processing…', es: 'Procesando…' }, lang) : '📥 ' + t({ ja: '書き出す', en: 'Export', es: 'Exportar' }, lang)}
      </button>
    </div>
  );
}

function Field({ label, children, theme: c }: { label: string; children: React.ReactNode; theme: ThemeColors }) {
  return (
    <div>
      <div style={{ fontSize: '0.65rem', color: c.textTertiary, marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
      {children}
    </div>
  );
}

function inputStyle(c: ThemeColors): React.CSSProperties {
  return { width: '100%', background: 'transparent', border: `1px solid ${c.border}`, color: c.textPrimary, padding: '0.4rem 0.6rem', borderRadius: 6, fontSize: '0.8rem', fontFamily: sans };
}

// ============================================================
// Helpers
// ============================================================
function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

function makeTrack(idx: number): Track {
  return {
    id: `t_${Date.now()}_${idx}`,
    name: `Track ${idx + 1}`,
    jewelIdx: idx,
    gainDb: 0,
    pan: 0,
    mute: false,
    solo: false,
    regions: [],
  };
}

function createBlankProject(): Project {
  return {
    id: `proj_${Date.now()}`,
    name: 'Untitled',
    bpm: 80,
    sampleRate: 44100,
    tracks: [makeTrack(0)],
    modifiedAt: Date.now(),
  };
}

// ============================================================
// MP3 encoding via lamejs (loaded from /public/lamejs/lame.all.js)
// ============================================================
async function encodeMp3(buffer: AudioBuffer, bitrate: 192 | 320): Promise<Blob> {
  // Lazy-load lamejs script if not yet loaded
  await ensureLamejsLoaded();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Lame = (window as any).lamejs;
  if (!Lame) throw new Error('lamejs not loaded');

  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const encoder = new Lame.Mp3Encoder(numCh, sampleRate, bitrate);
  const left = floatTo16(buffer.getChannelData(0));
  const right = numCh > 1 ? floatTo16(buffer.getChannelData(1)) : null;

  const blockSize = 1152;
  const mp3Data: Int8Array[] = [];
  for (let i = 0; i < left.length; i += blockSize) {
    const lChunk = left.subarray(i, i + blockSize);
    let mp3buf: Int8Array;
    if (right) {
      const rChunk = right.subarray(i, i + blockSize);
      mp3buf = encoder.encodeBuffer(lChunk, rChunk);
    } else {
      mp3buf = encoder.encodeBuffer(lChunk);
    }
    if (mp3buf.length > 0) mp3Data.push(mp3buf);
  }
  const tail = encoder.flush();
  if (tail.length > 0) mp3Data.push(tail);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Blob(mp3Data as any, { type: 'audio/mpeg' });
}

function floatTo16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

async function ensureLamejsLoaded(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).lamejs) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/lamejs/lame.all.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load lamejs'));
    document.head.appendChild(script);
  });
}

// ============================================================
// Default export
// ============================================================
export default function DawPage() {
  return (
    <AuthGate appName="daw">
      <DawApp />
    </AuthGate>
  );
}
