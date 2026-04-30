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
// IndexedDB Helper (v2: streaming write + crash recovery)
// ============================================================
//
// 物理保存場所:
//   Mac:     ~/Library/Application Support/Google/Chrome/Default/IndexedDB/
//   Windows: %LOCALAPPDATA%\Google\Chrome\User Data\Default\IndexedDB\
//   iOS:     Safari サンドボックス内 (暗号化)
//   Android: /data/data/com.android.chrome/.../IndexedDB/
//
// クラッシュ復旧:
//   recording_sessions に { active: true } セッションを保存
//   recording_chunks に 250ms ごとに chunk を即書き込み
//   起動時に active=true のセッションを検出 → 復旧ダイアログ
// ============================================================
const DB_NAME = 'kuon_daw';
const DB_VERSION = 2;
const STORE_PROJECTS = 'projects';
const STORE_BUFFERS = 'buffers';
const STORE_REC_SESSIONS = 'recording_sessions';
const STORE_REC_CHUNKS = 'recording_chunks';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_BUFFERS)) db.createObjectStore(STORE_BUFFERS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_REC_SESSIONS)) db.createObjectStore(STORE_REC_SESSIONS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_REC_CHUNKS)) {
        const chunks = db.createObjectStore(STORE_REC_CHUNKS, { keyPath: 'id' });
        chunks.createIndex('sessionId', 'sessionId', { unique: false });
      }
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

async function dbDelete(store: string, id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  db.close();
}

async function dbGetAll(store: string): Promise<unknown[]> {
  const db = await openDb();
  const r = await new Promise<unknown[]>((res, rej) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => res((req.result as unknown[]) || []);
    req.onerror = () => rej(req.error);
  });
  db.close();
  return r;
}

/** 指定 sessionId のチャンクを順番に取得 */
async function dbGetChunksBySession(sessionId: string): Promise<{ id: string; sessionId: string; chunkIndex: number; blob: Blob }[]> {
  const db = await openDb();
  const r = await new Promise<{ id: string; sessionId: string; chunkIndex: number; blob: Blob }[]>((res, rej) => {
    const tx = db.transaction(STORE_REC_CHUNKS, 'readonly');
    const idx = tx.objectStore(STORE_REC_CHUNKS).index('sessionId');
    const req = idx.getAll(sessionId);
    req.onsuccess = () => {
      const arr = (req.result || []) as { id: string; sessionId: string; chunkIndex: number; blob: Blob }[];
      arr.sort((a, b) => a.chunkIndex - b.chunkIndex);
      res(arr);
    };
    req.onerror = () => rej(req.error);
  });
  db.close();
  return r;
}

/** active=true のままになっている (= クラッシュ未復旧) セッションを取得 */
interface RecordingSession {
  id: string;
  trackId: string;
  startTime: number;
  active: boolean;
  sampleRate: number;
  mimeType: string;
}
async function dbFindOrphanedSessions(): Promise<RecordingSession[]> {
  const all = (await dbGetAll(STORE_REC_SESSIONS)) as RecordingSession[];
  return all.filter((s) => s.active);
}

/** ストレージ使用量推定 (Storage API) */
async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
  const { usage = 0, quota = 0 } = await navigator.storage.estimate();
  return { usage, quota };
}

/** OS 別保存パス取得 (表示用) */
function getStorageLocationHint(): string {
  if (typeof window === 'undefined') return '';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) {
    return 'Safari サンドボックス内 (暗号化)';
  } else if (/Android/.test(ua)) {
    return '/data/data/com.android.chrome/app_chrome/Default/IndexedDB/';
  } else if (/Mac/.test(ua)) {
    return '~/Library/Application Support/Google/Chrome/Default/IndexedDB/';
  } else if (/Windows/.test(ua)) {
    return '%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\IndexedDB\\';
  } else if (/Linux/.test(ua)) {
    return '~/.config/google-chrome/Default/IndexedDB/';
  }
  return 'ブラウザのローカルストレージ';
}

/** プライベートブラウジング検出 */
async function isPrivateBrowsing(): Promise<boolean> {
  try {
    const est = await getStorageEstimate();
    // Safari Private Browsing reports very low quota
    if (est && est.quota < 120 * 1024 * 1024) return true;
  } catch {
    return true;
  }
  return false;
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

interface TrackEQ {
  low: number;     // -12 to +12 dB (low shelf @ 250 Hz)
  mid: number;     // -12 to +12 dB (peaking @ 1 kHz, Q=1)
  high: number;    // -12 to +12 dB (high shelf @ 4 kHz)
}

interface TrackReverb {
  mix: number;     // 0 to 1 (dry/wet)
  size: number;    // 0 to 1 (decay 0.3s ~ 4s)
}

interface Track {
  id: string;
  name: string;
  jewelIdx: number;          // TRACK_JEWELS index
  gainDb: number;            // -infinity〜+12 dB
  pan: number;               // -1 (L) to +1 (R)
  mute: boolean;
  solo: boolean;
  armed: boolean;            // 録音待機 (true = mic active + VU 表示)
  recordMode: 'mono' | 'stereo'; // 録音モード (デフォルト stereo・USB マイクならモノラル選択)
  eq: TrackEQ;               // 3 バンド EQ
  reverb: TrackReverb;       // シンプルリバーブ
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
  // Phase 1: Crash recovery state
  const [orphanSessions, setOrphanSessions] = useState<RecordingSession[]>([]);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);
  const [storagePath, setStoragePath] = useState('');
  const [privateModeWarning, setPrivateModeWarning] = useState(false);
  const [showFirstVisitWarning, setShowFirstVisitWarning] = useState(false);
  const recSessionIdRef = useRef<string | null>(null);
  const recChunkIndexRef = useRef<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<Blob[]>([]);
  const recStartRef = useRef<number>(0);
  const recIntervalRef = useRef<number | null>(null);
  const playSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playStartTimeRef = useRef(0);
  const playRafRef = useRef<number | null>(null);

  // ── 録音待機 (ARM) + VU メーター ──
  const [armedTrackId, setArmedTrackId] = useState<string | null>(null);
  const [vuLevels, setVuLevels] = useState<{ peak: number; rms: number }>({ peak: -Infinity, rms: -Infinity });
  const [mixerOpen, setMixerOpen] = useState(false);
  const monitorStreamRef = useRef<MediaStream | null>(null);
  const monitorAnalyserRef = useRef<AnalyserNode | null>(null);
  const monitorSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const monitorRafRef = useRef<number | null>(null);

  // ── トラック単位プレビュー再生 ──
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const previewSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const previewTimeoutRef = useRef<number | null>(null);

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
    setMixerOpen(true); // トラック追加と同時にミキサーを表示
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
  // トラック単位プレビュー再生 (このトラックだけ・他トラックは無音)
  // ============================================================
  const stopTrackPreview = useCallback(() => {
    previewSourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
    previewSourcesRef.current = [];
    if (previewTimeoutRef.current) {
      window.clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
    setPreviewingTrackId(null);
  }, []);

  const playTrackOnly = useCallback((trackId: string) => {
    // 既に同じトラックがプレビュー中なら停止
    if (previewingTrackId === trackId) {
      stopTrackPreview();
      return;
    }
    // 別トラックがプレビュー中なら停止してから再生
    if (previewingTrackId !== null) {
      stopTrackPreview();
    }
    // メイン再生中は停止 (stopPlayback の宣言前参照を避けるためインライン化)
    if (playing) {
      playSourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
      playSourcesRef.current = [];
      if (playRafRef.current) cancelAnimationFrame(playRafRef.current);
      setPlaying(false);
      setPlayPos(0);
    }
    const track = project.tracks.find((t) => t.id === trackId);
    if (!track || track.regions.length === 0) return;

    const ctx = getCtx();
    const startTime = ctx.currentTime + 0.05;

    // EQ + Reverb チェーン (このトラック分)
    const trackGain = ctx.createGain();
    const trackPan = ctx.createStereoPanner();
    trackGain.gain.value = dbToLinear(track.gainDb);
    trackPan.pan.value = track.pan;
    trackPan.connect(ctx.destination);
    const eqInput = buildTrackEffects(ctx, track, trackGain);
    trackGain.connect(trackPan);

    let trackEnd = 0;
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
      src.connect(regionGain).connect(eqInput);
      src.start(startAt, r.offsetInBuffer, r.duration);
      src.stop(endAt + 0.05);
      previewSourcesRef.current.push(src);
      if (r.startInTrack + r.duration > trackEnd) trackEnd = r.startInTrack + r.duration;
    });

    setPreviewingTrackId(trackId);
    // 終了時に自動停止
    previewTimeoutRef.current = window.setTimeout(() => {
      stopTrackPreview();
    }, (trackEnd + 0.2) * 1000);
  }, [previewingTrackId, playing, project.tracks, audioBuffers, getCtx, stopTrackPreview]);

  // unmount 時クリーンアップ
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) window.clearTimeout(previewTimeoutRef.current);
      previewSourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
    };
  }, []);

  // ============================================================
  // 録音モード切替 (mono ⇄ stereo)
  // armed 中なら disarm して情報メッセージを表示 (再 ARM で新モード反映)
  // ============================================================
  const setTrackRecordMode = useCallback((trackId: string, mode: 'mono' | 'stereo') => {
    updateTrack(trackId, { recordMode: mode });
    // 録音中はモード切替不可なので警告
    if (recState === 'recording' && activeRecordingTrackId === trackId) {
      // 録音中はそのまま (次回録音から反映)
    }
    // armed 中ならストリームを再起動するため一旦 disarm
    // (ユーザーが再度 ARM をクリックすれば新モードで開く)
    if (armedTrackId === trackId) {
      // disarmTrack はこの下で定義されるので、setProject 経由で armed を解除する
      setArmedTrackId(null);
      if (monitorRafRef.current) {
        cancelAnimationFrame(monitorRafRef.current);
        monitorRafRef.current = null;
      }
      if (monitorSourceRef.current) {
        try { monitorSourceRef.current.disconnect(); } catch {}
        monitorSourceRef.current = null;
      }
      if (monitorAnalyserRef.current) {
        try { monitorAnalyserRef.current.disconnect(); } catch {}
        monitorAnalyserRef.current = null;
      }
      if (monitorStreamRef.current) {
        monitorStreamRef.current.getTracks().forEach((tr) => tr.stop());
        monitorStreamRef.current = null;
      }
      setVuLevels({ peak: -Infinity, rms: -Infinity });
      setProject((p) => ({
        ...p,
        tracks: p.tracks.map((tr) => (tr.id === trackId ? { ...tr, armed: false } : tr)),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armedTrackId, recState, activeRecordingTrackId]);

  // ============================================================
  // 録音待機 (ARM) — マイクを開いて AnalyserNode で VU メーター駆動
  // ============================================================
  const disarmTrack = useCallback(() => {
    if (monitorRafRef.current) {
      cancelAnimationFrame(monitorRafRef.current);
      monitorRafRef.current = null;
    }
    if (monitorSourceRef.current) {
      try { monitorSourceRef.current.disconnect(); } catch {}
      monitorSourceRef.current = null;
    }
    if (monitorAnalyserRef.current) {
      try { monitorAnalyserRef.current.disconnect(); } catch {}
      monitorAnalyserRef.current = null;
    }
    if (monitorStreamRef.current) {
      monitorStreamRef.current.getTracks().forEach((tr) => tr.stop());
      monitorStreamRef.current = null;
    }
    setVuLevels({ peak: -Infinity, rms: -Infinity });
    if (armedTrackId) {
      setProject((p) => ({
        ...p,
        tracks: p.tracks.map((tr) => (tr.id === armedTrackId ? { ...tr, armed: false } : tr)),
      }));
    }
    setArmedTrackId(null);
  }, [armedTrackId]);

  const armTrack = useCallback(async (trackId: string) => {
    // 既に同じトラックが armed なら disarm
    if (armedTrackId === trackId) {
      disarmTrack();
      return;
    }
    // 別トラックが armed ならまず解除
    if (armedTrackId !== null) {
      disarmTrack();
    }
    // 録音中なら ARM 不可
    if (recState === 'recording') {
      alert(t({ ja: '録音中は待機モードに切り替えできません', en: 'Cannot arm while recording', es: 'No se puede armar durante grabación' }, lang));
      return;
    }

    try {
      // 対象トラックの recordMode に基づいて channelCount を決定
      const targetTrack = project.tracks.find((tr) => tr.id === trackId);
      const channelCount = targetTrack?.recordMode === 'mono' ? 1 : 2;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: { ideal: channelCount },
          sampleRate: project.sampleRate,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      monitorStreamRef.current = stream;

      const ctx = getCtx();
      // suspended 状態なら resume
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      // ★モニター音は AudioContext.destination には繋がない (ハウリング防止)★
      monitorSourceRef.current = source;
      monitorAnalyserRef.current = analyser;

      setArmedTrackId(trackId);
      setProject((p) => ({
        ...p,
        tracks: p.tracks.map((tr) => (tr.id === trackId ? { ...tr, armed: true } : tr)),
      }));

      // 60fps で VU 更新
      const buf = new Float32Array(analyser.fftSize);
      const animate = () => {
        if (!monitorAnalyserRef.current) return;
        monitorAnalyserRef.current.getFloatTimeDomainData(buf);
        let sum = 0;
        let peak = 0;
        for (let i = 0; i < buf.length; i++) {
          const abs = Math.abs(buf[i]);
          if (abs > peak) peak = abs;
          sum += buf[i] * buf[i];
        }
        const rms = Math.sqrt(sum / buf.length);
        setVuLevels({
          peak: peak > 0 ? 20 * Math.log10(peak) : -Infinity,
          rms: rms > 0 ? 20 * Math.log10(rms) : -Infinity,
        });
        monitorRafRef.current = requestAnimationFrame(animate);
      };
      monitorRafRef.current = requestAnimationFrame(animate);
    } catch (e) {
      console.error('arm failed:', e);
      alert(t({ ja: 'マイクアクセスが必要です', en: 'Microphone access required', es: 'Acceso al micrófono requerido' }, lang));
    }
  }, [armedTrackId, recState, lang, project.sampleRate, getCtx, disarmTrack]);

  // unmount 時クリーンアップ
  useEffect(() => {
    return () => {
      if (monitorRafRef.current) cancelAnimationFrame(monitorRafRef.current);
      if (monitorStreamRef.current) {
        monitorStreamRef.current.getTracks().forEach((tr) => tr.stop());
      }
    };
  }, []);

  // armed トラックが削除されたら自動で disarm
  useEffect(() => {
    if (armedTrackId && !project.tracks.some((tr) => tr.id === armedTrackId)) {
      disarmTrack();
    }
  }, [project.tracks, armedTrackId, disarmTrack]);

  // ============================================================
  // Recording (Phase 1: streaming write to IndexedDB every 250ms)
  // ============================================================
  // クラッシュ耐性: 250ms 毎に chunk を即 IndexedDB へ書き込み。
  // ブラウザ落ち / タブ閉じ / 電源断でも、最悪 250ms 分の損失で済む。
  // 復旧は起動時に自動検出 (showRecoveryDialog 経由)。
  //
  // 仕様変更 (v2): ARM 状態 → マスター REC で開始する 2 段階フロー。
  // 直接 startRecording(trackId) を呼ぶ場合は、対象トラックに既存ストリームを使う。
  // ============================================================
  const startRecording = async (trackId: string) => {
    try {
      // armed track のストリームがあればそれを再利用 (連続 2 回 mic 開かない)
      let stream: MediaStream;
      if (armedTrackId === trackId && monitorStreamRef.current) {
        stream = monitorStreamRef.current;
        // monitor は record 中も継続させる (VU 表示維持)
      } else {
        const targetTrack = project.tracks.find((tr) => tr.id === trackId);
        const channelCount = targetTrack?.recordMode === 'mono' ? 1 : 2;
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: { ideal: channelCount },
            sampleRate: project.sampleRate,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
      }
      mediaStreamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecRef.current = recorder;

      // セッション ID 発行 + IndexedDB に active セッションとして記録
      const sessionId = `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      recSessionIdRef.current = sessionId;
      recChunkIndexRef.current = 0;
      const startTime = Date.now();
      await dbPut(STORE_REC_SESSIONS, {
        id: sessionId,
        trackId,
        startTime,
        active: true,
        sampleRate: project.sampleRate,
        mimeType,
      });

      // ★ストリーミング書き込み: chunk 到着のたびに IndexedDB へ即書き込み★
      recorder.ondataavailable = async (e) => {
        if (e.data.size === 0) return;
        const idx = recChunkIndexRef.current++;
        try {
          await dbPut(STORE_REC_CHUNKS, {
            id: `${sessionId}_${String(idx).padStart(6, '0')}`,
            sessionId,
            chunkIndex: idx,
            blob: e.data,
          });
        } catch (err) {
          console.error('Failed to persist chunk:', err);
        }
      };

      recorder.onstop = async () => {
        // 全 chunk を IndexedDB から取得して assemble
        const sid = recSessionIdRef.current;
        if (!sid) return;
        try {
          const chunks = await dbGetChunksBySession(sid);
          const blobs = chunks.map((c) => c.blob);
          if (blobs.length === 0) return;
          const blob = new Blob(blobs, { type: mimeType });
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

          // セッションを active=false にマーク (復旧不要)
          await dbPut(STORE_REC_SESSIONS, {
            id: sid, trackId, startTime, active: false, sampleRate: project.sampleRate, mimeType,
          });
          // チャンクは TTL 30 日で残す (誤操作からの保険)・ここでは消さない
          recSessionIdRef.current = null;
        } catch (err) {
          console.error('Finalize failed:', err);
        }
      };

      // 250ms 毎に chunk 発火 = ストリーミング書き込み
      recorder.start(250);
      recStartRef.current = startTime;
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
    // armed と同じトラックを録音中ならストリームは保持 (VU 続行)
    const sharedWithMonitor = mediaStreamRef.current && monitorStreamRef.current === mediaStreamRef.current;
    if (mediaStreamRef.current && !sharedWithMonitor) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    mediaStreamRef.current = null;
    if (recIntervalRef.current) {
      window.clearInterval(recIntervalRef.current);
      recIntervalRef.current = null;
    }
    setRecState('idle');
    setActiveRecordingTrackId(null);
    setRecElapsed(0);
  };

  // ============================================================
  // Phase 1: Crash recovery
  // ============================================================
  const recoverSession = async (session: RecordingSession) => {
    try {
      const chunks = await dbGetChunksBySession(session.id);
      if (chunks.length === 0) {
        await dbPut(STORE_REC_SESSIONS, { ...session, active: false });
        return;
      }
      const blob = new Blob(chunks.map((c) => c.blob), { type: session.mimeType });
      const ctx = getCtx();
      const ab = await blob.arrayBuffer();
      const buf = await ctx.decodeAudioData(ab.slice(0));
      const bufferId = `buf_recovered_${Date.now()}`;
      setAudioBuffers((m) => new Map(m).set(bufferId, buf));

      const region: Region = {
        id: `r_recovered_${Date.now()}`,
        bufferId, startInTrack: 0, offsetInBuffer: 0,
        duration: buf.duration, fadeInSec: 0, fadeOutSec: 0,
      };
      // 復旧したリージョンを既存トラックに追加 (元のトラック ID で)
      const trackExists = project.tracks.some((t) => t.id === session.trackId);
      if (trackExists) {
        setProject((p) => ({
          ...p,
          tracks: p.tracks.map((t) =>
            t.id !== session.trackId ? t : { ...t, regions: [...t.regions, region] }),
          modifiedAt: Date.now(),
        }));
      } else {
        // トラックが存在しない場合は新規トラック作成
        setProject((p) => {
          const newTrack: Track = { ...makeTrack(p.tracks.length), regions: [region], name: `Recovered ${new Date(session.startTime).toLocaleString()}` };
          return { ...p, tracks: [...p.tracks, newTrack], modifiedAt: Date.now() };
        });
      }
      await dbPut(STORE_REC_SESSIONS, { ...session, active: false });
      setOrphanSessions((arr) => arr.filter((s) => s.id !== session.id));
    } catch (err) {
      console.error('Recovery failed:', err);
      alert(t({ ja: '復旧に失敗しました', en: 'Recovery failed', es: 'Recuperación fallida' }, lang));
    }
  };

  const discardSession = async (sessionId: string) => {
    try {
      // チャンクを削除
      const chunks = await dbGetChunksBySession(sessionId);
      for (const c of chunks) await dbDelete(STORE_REC_CHUNKS, c.id);
      await dbDelete(STORE_REC_SESSIONS, sessionId);
      setOrphanSessions((arr) => arr.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error('Discard failed:', err);
    }
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
      trackPan.connect(ctx.destination);

      // EQ + Reverb チェーン: source → regionGain → eqIn → ... → trackGain → trackPan → out
      const eqInput = buildTrackEffects(ctx, track, trackGain);
      trackGain.connect(trackPan);

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

        src.connect(regionGain).connect(eqInput);
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
      trackPan.connect(offlineCtx.destination);
      // EQ + Reverb チェーン
      const eqInput = buildTrackEffects(offlineCtx, track, trackGain);
      trackGain.connect(trackPan);
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
        src.connect(regionGain).connect(eqInput);
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
  // Phase 1: Startup checks (orphan sessions + storage + private mode + first visit)
  // ============================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;
    (async () => {
      // 1. プライベートブラウジング検出
      try {
        const isPriv = await isPrivateBrowsing();
        if (isPriv) setPrivateModeWarning(true);
      } catch {}

      // 2. 初回訪問警告 (ブラウザデータ削除リスク告知)
      const visited = localStorage.getItem('kuon_daw_visited');
      if (!visited) setShowFirstVisitWarning(true);

      // 3. ストレージ使用量取得 + 保存パス
      try {
        const est = await getStorageEstimate();
        if (est) setStorageInfo(est);
        setStoragePath(getStorageLocationHint());
      } catch {}

      // 4. クラッシュ未復旧セッション検出
      try {
        const orphans = await dbFindOrphanedSessions();
        if (orphans.length > 0) {
          setOrphanSessions(orphans);
          setShowRecoveryDialog(true);
        }
      } catch {}
    })();
  }, []);

  // Persistent Storage 申請 (ブラウザがストレージを誤削除しないようマーク)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      navigator.storage.persist().catch(() => {});
    }
  }, []);

  const dismissFirstVisitWarning = () => {
    if (typeof window !== 'undefined') localStorage.setItem('kuon_daw_visited', '1');
    setShowFirstVisitWarning(false);
  };

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
      {/* ━━━ Phase 1: Crash Recovery Dialog ━━━ */}
      {showRecoveryDialog && orphanSessions.length > 0 && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem', backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            background: c.bg, border: `1px solid ${c.borderStrong}`,
            borderRadius: 14, padding: 'clamp(1.5rem, 3vw, 2.5rem)',
            maxWidth: 560, width: '100%',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: c.accent, fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              🔔 {t({ ja: 'クラッシュ復旧', en: 'Crash Recovery', es: 'Recuperación' }, lang)}
            </div>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 400, color: c.textPrimary, marginBottom: '0.85rem' }}>
              {t({
                ja: '未完了の録音セッションを検出しました',
                en: 'Incomplete recording session detected',
                es: 'Sesión de grabación incompleta detectada',
              }, lang)}
            </h2>
            <p style={{ fontSize: '0.85rem', color: c.textSecondary, lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {t({
                ja: '前回ブラウザが予期せず閉じられた可能性があります。録音データは IndexedDB に保存されているので復旧できます。',
                en: 'Your browser may have closed unexpectedly. The recording is safely stored in IndexedDB and can be recovered.',
                es: 'Su navegador puede haberse cerrado inesperadamente. La grabación está segura en IndexedDB.',
              }, lang)}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {orphanSessions.map((s) => (
                <div key={s.id} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 8, padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.85rem', color: c.textPrimary, marginBottom: '0.4rem', fontWeight: 600 }}>
                    {new Date(s.startTime).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: c.textTertiary, marginBottom: '0.6rem' }}>
                    Track: {s.trackId} · {s.sampleRate / 1000}kHz · {s.mimeType}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => recoverSession(s)}
                      style={{ background: c.accent, color: theme === 'dark' ? '#0a1226' : '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                      ✓ {t({ ja: '復旧する', en: 'Recover', es: 'Recuperar' }, lang)}
                    </button>
                    <button onClick={() => discardSession(s.id)}
                      style={{ background: 'transparent', color: c.danger, border: `1px solid ${c.danger}`, padding: '0.5rem 1rem', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer' }}>
                      🗑 {t({ ja: '破棄する', en: 'Discard', es: 'Descartar' }, lang)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowRecoveryDialog(false)}
              style={{ background: 'transparent', color: c.textSecondary, border: `1px solid ${c.border}`, padding: '0.5rem 1rem', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer', width: '100%' }}>
              {t({ ja: 'あとで確認 (このダイアログを閉じる)', en: 'Decide later (close)', es: 'Decidir luego' }, lang)}
            </button>
          </div>
        </div>
      )}

      {/* ━━━ Private browsing warning ━━━ */}
      {privateModeWarning && (
        <div style={{ background: '#dc2626', color: '#fff', padding: '0.6rem 1rem', textAlign: 'center', fontSize: '0.8rem' }}>
          ⚠️ {t({
            ja: 'プライベートブラウジングで録音されています。録音データは保存されません。通常モードでお使いください。',
            en: 'Private browsing detected. Recordings will NOT be saved. Use normal mode.',
            es: 'Navegación privada detectada. Las grabaciones NO se guardarán.',
          }, lang)}
          <button onClick={() => setPrivateModeWarning(false)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: 4, marginLeft: 8, cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* ━━━ First visit warning (browser data deletion risk) ━━━ */}
      {showFirstVisitWarning && !privateModeWarning && (
        <div style={{ background: c.accentSoft, color: c.textPrimary, padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.78rem', borderBottom: `1px solid ${c.border}` }}>
          💡 {t({
            ja: 'ヒント: 録音はあなたのブラウザ内 (IndexedDB) に保存されます。「閲覧データを削除」を実行すると消えるので、重要な録音は WAV 書き出しでバックアップしてください。',
            en: 'Tip: Recordings are stored in your browser (IndexedDB). Clearing "browsing data" will delete them. Export important recordings as WAV.',
            es: 'Consejo: Las grabaciones están en su navegador (IndexedDB).',
          }, lang)}
          <button onClick={dismissFirstVisitWarning} style={{ background: c.accent, color: theme === 'dark' ? '#0a1226' : '#fff', border: 'none', padding: '3px 10px', borderRadius: 4, marginLeft: 8, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>
            {t({ ja: '了解', en: 'Got it', es: 'Entendido' }, lang)}
          </button>
        </div>
      )}

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
            <button onClick={() => setMixerOpen(true)}
              style={{ background: c.surface, color: c.textPrimary, border: `1px solid ${c.borderStrong}`, padding: '0.55rem 1rem', borderRadius: 999, fontSize: '0.78rem', cursor: 'pointer' }}>
              🎚️ {t({ ja: 'ミキサー', en: 'Mixer', es: 'Mezclador' }, lang)}
            </button>
            <button onClick={addTrack} disabled={project.tracks.length >= 4}
              style={{ background: c.surface, color: c.textPrimary, border: `1px solid ${c.borderStrong}`, padding: '0.55rem 1rem', borderRadius: 999, fontSize: '0.78rem', cursor: project.tracks.length >= 4 ? 'not-allowed' : 'pointer', opacity: project.tracks.length >= 4 ? 0.5 : 1 }}>
              + {t({ ja: 'トラック追加', en: 'Add Track', es: 'Añadir' }, lang)} ({project.tracks.length}/4)
            </button>
          </div>
        </div>

        {/* ミキサーパネル (モーダル) */}
        {mixerOpen && (
          <MixerPanel
            tracks={project.tracks}
            theme={c}
            onUpdateTrack={(trackId, u) => updateTrack(trackId, u)}
            onClose={() => setMixerOpen(false)}
            lang={lang}
          />
        )}

        {/* ━━━ Storage Info Bar (Phase 1) ━━━ */}
        {storageInfo && (
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: '0.6rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.72rem', color: c.textTertiary }}>
            <span>
              💾 {t({ ja: 'ローカル保存中', en: 'Stored locally', es: 'Guardado localmente' }, lang)}: {(storageInfo.usage / (1024 * 1024)).toFixed(1)} MB / {(storageInfo.quota / (1024 * 1024 * 1024)).toFixed(1)} GB
              {storagePath && <> · <code style={{ fontSize: '0.7em', background: 'transparent', color: c.textSecondary }}>{storagePath}</code></>}
            </span>
            <span style={{ color: c.success }}>
              ✓ {t({ ja: 'クラウド送信ゼロ', en: 'Zero cloud upload', es: 'Sin nube' }, lang)} · {t({ ja: '250ms 毎にディスク書き込み', en: 'Stream-write every 250ms', es: 'Escritura cada 250ms' }, lang)}
            </span>
          </div>
        )}

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
              onArm={() => armTrack(track.id)}
              isArmed={armedTrackId === track.id}
              vuLevels={armedTrackId === track.id ? vuLevels : { peak: -Infinity, rms: -Infinity }}
              onSetRecordMode={(mode) => setTrackRecordMode(track.id, mode)}
              onPreviewToggle={() => playTrackOnly(track.id)}
              isPreviewing={previewingTrackId === track.id}
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
  onArm: () => void;                     // 録音待機トグル
  isArmed: boolean;                      // このトラックが現在 armed か
  vuLevels: { peak: number; rms: number }; // VU メーター値 (dB・armed トラックのみ意味あり)
  onSetRecordMode: (mode: 'mono' | 'stereo') => void; // 録音モード切替
  onPreviewToggle: () => void;           // このトラックだけ再生/停止
  isPreviewing: boolean;                 // このトラックが現在プレビュー再生中か
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
    onArm, isArmed, vuLevels, onSetRecordMode, onPreviewToggle, isPreviewing,
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
        {/* Mute / Solo / Preview Play */}
        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.4rem' }}>
          <button onClick={() => onUpdateTrack({ mute: !track.mute })} title={lang === 'ja' ? 'ミュート' : 'Mute'}
            style={{ flex: 1, background: track.mute ? c.danger : c.surface, color: track.mute ? '#fff' : c.textSecondary, border: `1px solid ${track.mute ? c.danger : c.border}`, padding: '0.3rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>M</button>
          <button onClick={() => onUpdateTrack({ solo: !track.solo })} title={lang === 'ja' ? 'ソロ (これだけ再生)' : 'Solo'}
            style={{ flex: 1, background: track.solo ? '#f59e0b' : c.surface, color: track.solo ? '#000' : c.textSecondary, border: `1px solid ${track.solo ? '#f59e0b' : c.border}`, padding: '0.3rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>S</button>
          <button onClick={onPreviewToggle}
            disabled={track.regions.length === 0}
            title={track.regions.length === 0
              ? (lang === 'ja' ? '録音/読込してから再生できます' : 'Record or load audio first')
              : (lang === 'ja' ? 'このトラックだけ再生' : 'Preview this track only')}
            style={{
              flex: 1,
              background: isPreviewing ? c.accent : c.surface,
              color: isPreviewing ? (themeMode === 'dark' ? '#0a1226' : '#fff') : c.textSecondary,
              border: `1px solid ${isPreviewing ? c.accent : c.border}`,
              padding: '0.3rem', borderRadius: 4,
              fontSize: '0.78rem', fontWeight: 600,
              cursor: track.regions.length === 0 ? 'not-allowed' : 'pointer',
              opacity: track.regions.length === 0 ? 0.4 : 1,
            }}>
            {isPreviewing ? '⏸' : '▶'}
          </button>
        </div>

        {/* Mono / Stereo トグル */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '0.5rem', borderRadius: 4, overflow: 'hidden', border: `1px solid ${c.border}` }}>
          <button
            onClick={() => onSetRecordMode('mono')}
            disabled={isRecording}
            title={lang === 'ja' ? 'モノラル収録 (USB マイク・1ch マイク向き)' : 'Mono recording (USB / 1ch mics)'}
            style={{
              flex: 1,
              background: track.recordMode === 'mono' ? jewel.hex : 'transparent',
              color: track.recordMode === 'mono' ? '#fff' : c.textSecondary,
              border: 'none',
              padding: '0.3rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em',
              cursor: isRecording ? 'not-allowed' : 'pointer',
              opacity: isRecording ? 0.5 : 1,
            }}
          >
            MONO
          </button>
          <button
            onClick={() => onSetRecordMode('stereo')}
            disabled={isRecording}
            title={lang === 'ja' ? 'ステレオ収録 (2ch マイク・オーディオI/O向き)' : 'Stereo recording (2ch / interface)'}
            style={{
              flex: 1,
              background: track.recordMode === 'stereo' ? jewel.hex : 'transparent',
              color: track.recordMode === 'stereo' ? '#fff' : c.textSecondary,
              border: 'none',
              padding: '0.3rem', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em',
              cursor: isRecording ? 'not-allowed' : 'pointer',
              opacity: isRecording ? 0.5 : 1,
            }}
          >
            STEREO
          </button>
        </div>
        {/* ARM ボタン + VU メーター */}
        <div style={{ marginBottom: '0.4rem' }}>
          <button onClick={onArm}
            disabled={isRecording && !isArmed}
            style={{
              width: '100%',
              background: isArmed ? c.danger : c.surface,
              color: isArmed ? '#fff' : c.textSecondary,
              border: `1px solid ${isArmed ? c.danger : c.border}`,
              padding: '0.4rem', borderRadius: 4,
              fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em',
              cursor: isRecording && !isArmed ? 'not-allowed' : 'pointer',
              opacity: isRecording && !isArmed ? 0.4 : 1,
            }}>
            {isArmed ? '🎤 ' + (lang === 'ja' ? '待機中 (解除)' : lang === 'es' ? 'Listo (cancelar)' : 'ARMED (cancel)')
              : '🎤 ' + (lang === 'ja' ? '録音待機' : lang === 'es' ? 'Armar' : 'ARM')}
          </button>
          {/* VU メーター (armed の時のみ表示) */}
          {isArmed && <VuMeter levels={vuLevels} accent={jewel.hex} themeMode={themeMode} />}
        </div>
        {/* Record / Upload */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          <button onClick={isRecording ? onStopRecord : onStartRecord}
            disabled={!isArmed && !isRecording}
            title={!isArmed && !isRecording
              ? (lang === 'ja' ? '先に「録音待機」でマイクを開いてください' : 'Press ARM first to open the mic')
              : ''}
            style={{
              flex: 1,
              background: isRecording ? c.danger : (isArmed ? '#dc2626' : c.surface),
              color: (isRecording || isArmed) ? '#fff' : c.textSecondary,
              border: `1px solid ${isRecording || isArmed ? c.danger : c.border}`,
              padding: '0.4rem', borderRadius: 4, fontSize: '0.7rem',
              cursor: (!isArmed && !isRecording) ? 'not-allowed' : 'pointer',
              opacity: (!isArmed && !isRecording) ? 0.5 : 1,
            }}>
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
    armed: false,
    recordMode: 'stereo', // デフォルトはステレオ要求 (マイクがモノラルなら自動でモノに)
    eq: { low: 0, mid: 0, high: 0 },
    reverb: { mix: 0, size: 0.4 },
    regions: [],
  };
}

// ============================================================
// VuMeter — 録音待機中のリアルタイム入力レベル (peak + RMS)
// ============================================================
function VuMeter({ levels, accent, themeMode }: { levels: { peak: number; rms: number }; accent: string; themeMode: ThemeMode }) {
  // dB → 0..1 マッピング (-60dB 以下は 0、0dB が 1)
  const toUnit = (db: number) => {
    if (!isFinite(db)) return 0;
    if (db <= -60) return 0;
    if (db >= 0) return 1;
    return (db + 60) / 60;
  };
  const peakUnit = toUnit(levels.peak);
  const rmsUnit = toUnit(levels.rms);
  const trackBg = themeMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const dangerColor = '#ef4444'; // 0dB クリップ警告
  const warnColor = '#f59e0b';   // -6dB 注意
  // peak バーの色 (0dB 付近で赤、-6dB 付近で黄、それ以下で aqua/緑系)
  const peakColor = levels.peak >= -1
    ? dangerColor
    : levels.peak >= -6
    ? warnColor
    : accent;
  return (
    <div style={{ marginTop: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'inherit', opacity: 0.7, marginBottom: 2 }}>
        <span>{isFinite(levels.peak) ? levels.peak.toFixed(1) : '−∞'} dB peak</span>
        <span>{isFinite(levels.rms) ? levels.rms.toFixed(1) : '−∞'} dB RMS</span>
      </div>
      {/* RMS バー (背景) + peak バー (前景) */}
      <div style={{ position: 'relative', height: 10, background: trackBg, borderRadius: 3, overflow: 'hidden' }}>
        {/* RMS (緑系・薄め) */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${rmsUnit * 100}%`,
          background: `linear-gradient(90deg, ${accent}66, ${accent}aa)`,
          transition: 'width 0.05s linear',
        }} />
        {/* Peak (現状値) */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${peakUnit * 100}%`,
          background: `linear-gradient(90deg, transparent 0%, ${peakColor}88 80%, ${peakColor} 100%)`,
          transition: 'width 0.03s linear',
          borderRight: peakUnit > 0.01 ? `1px solid ${peakColor}` : 'none',
          mixBlendMode: 'screen',
        }} />
        {/* -6dB マーカー */}
        <div style={{
          position: 'absolute',
          left: `${toUnit(-6) * 100}%`,
          top: 0, bottom: 0,
          width: 1,
          background: warnColor,
          opacity: 0.5,
        }} />
      </div>
    </div>
  );
}

// ============================================================
// Mixer Panel — 全トラックの EQ + Reverb 一覧編集
// ============================================================
interface MixerPanelProps {
  tracks: Track[];
  theme: ThemeColors;
  onUpdateTrack: (trackId: string, u: Partial<Track>) => void;
  onClose: () => void;
  lang: Lang;
}
function MixerPanel({ tracks, theme: c, onUpdateTrack, onClose, lang }: MixerPanelProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', zIndex: 1000,
    }}
    onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          padding: '1.5rem',
          maxWidth: 1100, width: '100%',
          maxHeight: '85vh', overflowY: 'auto',
          color: c.textPrimary,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.2rem' }}>
          <h2 style={{ fontFamily: serif, fontSize: '1.3rem', fontWeight: 400, margin: 0, letterSpacing: '0.04em' }}>
            🎚️ {t({ ja: 'ミキサー', en: 'Mixer', es: 'Mezclador' }, lang)}
          </h2>
          <button onClick={onClose}
            style={{ background: 'transparent', color: c.textSecondary, border: `1px solid ${c.border}`, borderRadius: 4, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            ✕ {t({ ja: '閉じる', en: 'Close', es: 'Cerrar' }, lang)}
          </button>
        </div>
        <p style={{ fontSize: '0.78rem', color: c.textTertiary, lineHeight: 1.7, marginTop: 0, marginBottom: '1rem' }}>
          {t({
            ja: '各トラックの 3 バンド EQ (低 250Hz・中 1kHz・高 4kHz) とシンプルリバーブ。再生・書き出しにも反映されます。',
            en: '3-band EQ (Low 250Hz / Mid 1kHz / High 4kHz) + simple reverb per track. Applied during playback and export.',
            es: 'EQ de 3 bandas + reverb simple por pista. Se aplica en reproducción y exportación.',
          }, lang)}
        </p>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {tracks.map((track) => {
            const jewel = TRACK_JEWELS[track.jewelIdx % TRACK_JEWELS.length];
            return (
              <div key={track.id}
                style={{
                  padding: '1rem',
                  background: c.surface,
                  border: `1px solid ${c.border}`,
                  borderLeft: `4px solid ${jewel.hex}`,
                  borderRadius: 8,
                }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{track.name}</div>
                <div style={{ fontSize: '0.6rem', color: jewel.hex, letterSpacing: '0.1em', marginBottom: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>{jewel.name}</div>

                {/* EQ 3 バンド */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', color: c.textTertiary, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    EQ ({t({ ja: '3 バンド', en: '3-band', es: '3 bandas' }, lang)})
                  </div>
                  <EqKnob label={t({ ja: '低音', en: 'Low', es: 'Bajos' }, lang)} hint="250 Hz" value={track.eq.low} accent={jewel.hex} c={c}
                    onChange={(v) => onUpdateTrack(track.id, { eq: { ...track.eq, low: v } })} />
                  <EqKnob label={t({ ja: '中音', en: 'Mid', es: 'Medios' }, lang)} hint="1 kHz" value={track.eq.mid} accent={jewel.hex} c={c}
                    onChange={(v) => onUpdateTrack(track.id, { eq: { ...track.eq, mid: v } })} />
                  <EqKnob label={t({ ja: '高音', en: 'High', es: 'Agudos' }, lang)} hint="4 kHz" value={track.eq.high} accent={jewel.hex} c={c}
                    onChange={(v) => onUpdateTrack(track.id, { eq: { ...track.eq, high: v } })} />
                </div>

                {/* Reverb */}
                <div>
                  <div style={{ fontSize: '0.7rem', color: c.textTertiary, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {t({ ja: 'リバーブ', en: 'Reverb', es: 'Reverb' }, lang)}
                  </div>
                  <SliderRow label={t({ ja: 'ミックス', en: 'Mix', es: 'Mezcla' }, lang)}
                    value={track.reverb.mix} min={0} max={1} step={0.01}
                    display={`${Math.round(track.reverb.mix * 100)}%`}
                    accent={jewel.hex} c={c}
                    onChange={(v) => onUpdateTrack(track.id, { reverb: { ...track.reverb, mix: v } })}
                  />
                  <SliderRow label={t({ ja: 'サイズ', en: 'Size', es: 'Tamaño' }, lang)}
                    value={track.reverb.size} min={0} max={1} step={0.01}
                    display={`${(0.3 + track.reverb.size * 3.7).toFixed(1)}s`}
                    accent={jewel.hex} c={c}
                    onChange={(v) => onUpdateTrack(track.id, { reverb: { ...track.reverb, size: v } })}
                  />
                </div>

                {/* リセットボタン */}
                <button
                  onClick={() => onUpdateTrack(track.id, {
                    eq: { low: 0, mid: 0, high: 0 },
                    reverb: { mix: 0, size: 0.4 },
                  })}
                  style={{
                    marginTop: '0.8rem',
                    width: '100%',
                    background: 'transparent',
                    color: c.textTertiary,
                    border: `1px solid ${c.border}`,
                    borderRadius: 4,
                    padding: '0.4rem',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                  }}
                >
                  ↺ {t({ ja: 'リセット', en: 'Reset', es: 'Reset' }, lang)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EqKnob({ label, hint, value, accent, c, onChange }: {
  label: string; hint: string; value: number; accent: string; c: ThemeColors; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: c.textTertiary, marginBottom: 2 }}>
        <span>{label} <span style={{ opacity: 0.6 }}>{hint}</span></span>
        <span style={{ color: c.textSecondary }}>{value > 0 ? '+' : ''}{value.toFixed(1)} dB</span>
      </div>
      <input type="range" min={-12} max={12} step={0.5} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: accent }}
      />
    </div>
  );
}

function SliderRow({ label, value, min, max, step, display, accent, c, onChange }: {
  label: string; value: number; min: number; max: number; step: number; display: string;
  accent: string; c: ThemeColors; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: c.textTertiary, marginBottom: 2 }}>
        <span>{label}</span><span style={{ color: c.textSecondary }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: accent }}
      />
    </div>
  );
}

// ============================================================
// Helper: 旧プロジェクトデータの互換補完 (eq/reverb/armed が無い場合)
// ============================================================
function ensureTrackDefaults(t: any): Track {
  return {
    ...t,
    armed: typeof t.armed === 'boolean' ? t.armed : false,
    eq: t.eq && typeof t.eq.low === 'number' ? t.eq : { low: 0, mid: 0, high: 0 },
    reverb: t.reverb && typeof t.reverb.mix === 'number' ? t.reverb : { mix: 0, size: 0.4 },
  };
}

// ============================================================
// 簡易インパルス応答生成 (size 0~1 で 0.3s〜4s の指数減衰ノイズ)
// ============================================================
function makeReverbImpulse(ctx: BaseAudioContext, size: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const duration = 0.3 + Math.max(0, Math.min(1, size)) * 3.7; // 0.3s〜4s
  const length = Math.floor(sampleRate * duration);
  const ir = ctx.createBuffer(2, length, sampleRate);
  const decay = 2 + size * 2; // 大きいほどゆっくり減衰
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const env = Math.pow(1 - i / length, decay);
      data[i] = (Math.random() * 2 - 1) * env;
    }
  }
  return ir;
}

// ============================================================
// EQ + Reverb チェーン構築 (再生・書き出し共通)
// 戻り値: 入力ノード (source を connect する先)
// ============================================================
function buildTrackEffects(
  ctx: BaseAudioContext,
  track: Track,
  destination: AudioNode,
): AudioNode {
  // EQ: 3 段の BiquadFilter (low shelf 250Hz, peaking 1kHz, high shelf 4kHz)
  const lowShelf = ctx.createBiquadFilter();
  lowShelf.type = 'lowshelf';
  lowShelf.frequency.value = 250;
  lowShelf.gain.value = track.eq.low;

  const peaking = ctx.createBiquadFilter();
  peaking.type = 'peaking';
  peaking.frequency.value = 1000;
  peaking.Q.value = 1;
  peaking.gain.value = track.eq.mid;

  const highShelf = ctx.createBiquadFilter();
  highShelf.type = 'highshelf';
  highShelf.frequency.value = 4000;
  highShelf.gain.value = track.eq.high;

  // Reverb: ConvolverNode + Wet/Dry mix
  const reverbMix = Math.max(0, Math.min(1, track.reverb.mix));
  const eqOut = lowShelf;
  lowShelf.connect(peaking).connect(highShelf);

  if (reverbMix > 0.001) {
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    const convolver = ctx.createConvolver();
    convolver.buffer = makeReverbImpulse(ctx, track.reverb.size);

    dryGain.gain.value = 1 - reverbMix;
    wetGain.gain.value = reverbMix * 1.4; // wet 側はリバーブで音量下がるので少し補正

    highShelf.connect(dryGain).connect(destination);
    highShelf.connect(convolver).connect(wetGain).connect(destination);
  } else {
    highShelf.connect(destination);
  }

  return eqOut; // ← source.connect(eqOut) すれば良い
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
