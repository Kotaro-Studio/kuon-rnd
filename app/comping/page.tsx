'use client';

// ============================================================
// KUON COMPING — マルチテイク録音 + ベスト合成
// ============================================================
//
// 機能:
//  - マイク録音 (getUserMedia + MediaRecorder)
//  - 複数テイクの保存 (IndexedDB / WebM Opus)
//  - 波形表示 (Canvas)
//  - チャンク式コンピング (時間を N 等分し、各チャンクで使うテイクを選択)
//  - スマートクロスフェード (10ms 自動)
//  - WAV エクスポート (16bit PCM 44.1kHz)
//  - プレロール 4 拍 (BPM 設定)
//  - クリック音同期
//  - キーボードショートカット (Space=録音/停止/再生, R=新テイク, E=書き出し)
//
// IQ180 設計判断:
//  - チャンク式 = ブラウザで最も直感的なコンピング UX
//  - シンプルモード / プロモード切替 (キーボードショートカット ON/OFF)
//  - モノラル/ステレオ切替 (P-86S オーナー特典との連携)
//  - AB 比較・自動アライメント・品質スコアは v2 で追加予定
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { AuthGate } from '@/components/AuthGate';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

// ============================================================
// IndexedDB Helper (kuon_comping)
// ============================================================
const DB_NAME = 'kuon_comping';
const DB_VERSION = 1;
const STORE_TAKES = 'takes';
const STORE_PROJECTS = 'projects';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_TAKES)) {
        db.createObjectStore(STORE_TAKES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
    };
  });
}

async function saveTakeBlob(takeId: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE_TAKES, 'readwrite');
    tx.objectStore(STORE_TAKES).put({ id: takeId, blob });
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  db.close();
}

async function loadTakeBlob(takeId: string): Promise<Blob | null> {
  const db = await openDb();
  const result = await new Promise<{ id: string; blob: Blob } | null>((res, rej) => {
    const tx = db.transaction(STORE_TAKES, 'readonly');
    const req = tx.objectStore(STORE_TAKES).get(takeId);
    req.onsuccess = () => res((req.result as { id: string; blob: Blob } | undefined) || null);
    req.onerror = () => rej(req.error);
  });
  db.close();
  return result?.blob || null;
}

async function deleteTake(takeId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE_TAKES, 'readwrite');
    tx.objectStore(STORE_TAKES).delete(takeId);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
  db.close();
}

// ============================================================
// WAV Encoder (16bit PCM)
// ============================================================
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2 + 44;
  const ab = new ArrayBuffer(length);
  const view = new DataView(ab);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, length - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length - 44, true);

  // PCM samples (interleaved)
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([ab], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

// ============================================================
// Types
// ============================================================
interface Take {
  id: string;
  takeNumber: number;
  duration: number;
  audioBuffer?: AudioBuffer;
  rating: number; // 0-5
  recordedAt: number;
}

// ============================================================
// Main Component (gated)
// ============================================================
function CompingApp() {
  const { lang } = useLang();

  // Settings
  const [bpm, setBpm] = useState(80);
  const [recordingDuration, setRecordingDuration] = useState(15); // seconds
  const [chunks, setChunks] = useState(8); // number of comp segments
  const [mode, setMode] = useState<'simple' | 'pro'>('simple');
  const [stereo, setStereo] = useState(false);

  // Recording state
  const [recState, setRecState] = useState<'idle' | 'preroll' | 'recording'>('idle');
  const [prerollBeat, setPrerollBeat] = useState(0); // 1-4
  const [recElapsed, setRecElapsed] = useState(0);

  // Takes
  const [takes, setTakes] = useState<Take[]>([]);
  const [chosenTakeIds, setChosenTakeIds] = useState<(string | null)[]>([]);

  // Playback state
  const [playing, setPlaying] = useState(false);
  const [playPos, setPlayPos] = useState(0);

  // Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimeoutRef = useRef<number | null>(null);
  const recIntervalRef = useRef<number | null>(null);
  const playSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playStartTimeRef = useRef(0);
  const playRafRef = useRef<number | null>(null);

  // Get or create AudioContext
  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  }, []);

  // ============================================================
  // Recording flow
  // ============================================================
  const startPreroll = useCallback(() => {
    setRecState('preroll');
    setPrerollBeat(0);
    const ctx = getCtx();
    const beatMs = 60_000 / bpm;
    let beat = 0;

    const playClick = () => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = beat === 0 ? 1200 : 800; // accent on first beat (cycle restarts)
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.06);
    };

    const tick = () => {
      beat++;
      setPrerollBeat(beat);
      playClick();
      if (beat >= 4) {
        // Start actual recording after the 4th preroll beat
        window.clearInterval(intervalId);
        startRecording();
      }
    };

    playClick(); // beat 1
    setPrerollBeat(1);
    const intervalId = window.setInterval(tick, beatMs);
  }, [bpm, getCtx]);

  const startRecording = useCallback(async () => {
    setRecState('recording');
    setRecElapsed(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: stereo ? 2 : 1,
          sampleRate: 44100,
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
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        await finalizeTake(blob);
      };
      recorder.start();

      // Stop after duration + start elapsed counter
      const startTime = Date.now();
      recIntervalRef.current = window.setInterval(() => {
        setRecElapsed((Date.now() - startTime) / 1000);
      }, 100);
      recordTimeoutRef.current = window.setTimeout(() => {
        stopRecording();
      }, recordingDuration * 1000);
    } catch (e) {
      console.error('Recording failed:', e);
      alert(t({ ja: 'マイクアクセスが拒否されました', en: 'Microphone access denied', es: 'Acceso al micrófono denegado' }, lang));
      setRecState('idle');
    }
  }, [stereo, recordingDuration, lang]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (recordTimeoutRef.current) {
      window.clearTimeout(recordTimeoutRef.current);
      recordTimeoutRef.current = null;
    }
    if (recIntervalRef.current) {
      window.clearInterval(recIntervalRef.current);
      recIntervalRef.current = null;
    }
    setRecState('idle');
  }, []);

  const finalizeTake = useCallback(async (blob: Blob) => {
    const ctx = getCtx();
    const arrayBuf = await blob.arrayBuffer();
    const audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0));
    const id = `take_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await saveTakeBlob(id, blob);
    setTakes((prev) => {
      const newTake: Take = {
        id,
        takeNumber: prev.length + 1,
        duration: audioBuf.duration,
        audioBuffer: audioBuf,
        rating: 3,
        recordedAt: Date.now(),
      };
      return [...prev, newTake];
    });
  }, [getCtx]);

  // ============================================================
  // Comping (chunk-based)
  // ============================================================
  // Reset chunks when number changes or new takes added
  useEffect(() => {
    setChosenTakeIds((prev) => {
      const next = [...prev];
      while (next.length < chunks) next.push(null);
      while (next.length > chunks) next.pop();
      return next;
    });
  }, [chunks]);

  // Auto-fill chunks with first take when first take added
  useEffect(() => {
    if (takes.length === 1 && chosenTakeIds.every((c) => c === null)) {
      setChosenTakeIds(new Array(chunks).fill(takes[0].id));
    }
  }, [takes, chunks, chosenTakeIds]);

  const setChunk = (chunkIdx: number, takeId: string | null) => {
    setChosenTakeIds((prev) => {
      const next = [...prev];
      next[chunkIdx] = takeId;
      return next;
    });
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

  const playComp = useCallback(() => {
    if (playing) {
      stopPlayback();
      return;
    }
    const ctx = getCtx();
    const chunkDur = recordingDuration / chunks;
    const fadeMs = 10;
    const fadeSec = fadeMs / 1000;

    playSourcesRef.current = [];
    const startTime = ctx.currentTime + 0.05;
    playStartTimeRef.current = startTime;

    chosenTakeIds.forEach((takeId, idx) => {
      if (!takeId) return;
      const take = takes.find((t) => t.id === takeId);
      if (!take?.audioBuffer) return;
      const buf = take.audioBuffer;
      const offsetInTake = idx * chunkDur;
      const compStart = startTime + idx * chunkDur;
      const compEnd = compStart + chunkDur;

      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gain = ctx.createGain();

      // Fade-in (smart crossfade)
      gain.gain.setValueAtTime(idx === 0 ? 1 : 0, compStart);
      if (idx > 0) gain.gain.linearRampToValueAtTime(1, compStart + fadeSec);
      // Fade-out
      gain.gain.setValueAtTime(1, compEnd - fadeSec);
      gain.gain.linearRampToValueAtTime(idx === chunks - 1 ? 1 : 0, compEnd);

      src.connect(gain).connect(ctx.destination);
      src.start(compStart, offsetInTake, chunkDur + fadeSec);
      src.stop(compEnd + 0.05);
      playSourcesRef.current.push(src);
    });

    setPlaying(true);
    const animate = () => {
      const elapsed = ctx.currentTime - startTime;
      if (elapsed >= recordingDuration) {
        stopPlayback();
        return;
      }
      setPlayPos(elapsed);
      playRafRef.current = requestAnimationFrame(animate);
    };
    playRafRef.current = requestAnimationFrame(animate);
  }, [playing, getCtx, recordingDuration, chunks, chosenTakeIds, takes, stopPlayback]);

  // ============================================================
  // WAV Export (Offline render)
  // ============================================================
  const exportWav = useCallback(async () => {
    if (chosenTakeIds.every((c) => c === null)) {
      alert(t({ ja: 'コンプにテイクを選択してください', en: 'Please select takes for comp', es: 'Selecciona tomas' }, lang));
      return;
    }
    const sampleRate = 44100;
    const numChannels = stereo ? 2 : 1;
    const totalLen = Math.floor(recordingDuration * sampleRate);
    const offlineCtx = new OfflineAudioContext(numChannels, totalLen, sampleRate);

    const chunkDur = recordingDuration / chunks;
    const fadeSec = 0.01;

    chosenTakeIds.forEach((takeId, idx) => {
      if (!takeId) return;
      const take = takes.find((t) => t.id === takeId);
      if (!take?.audioBuffer) return;
      const buf = take.audioBuffer;
      const offsetInTake = idx * chunkDur;
      const compStart = idx * chunkDur;
      const compEnd = compStart + chunkDur;

      const src = offlineCtx.createBufferSource();
      src.buffer = buf;
      const gain = offlineCtx.createGain();
      gain.gain.setValueAtTime(idx === 0 ? 1 : 0, compStart);
      if (idx > 0) gain.gain.linearRampToValueAtTime(1, compStart + fadeSec);
      gain.gain.setValueAtTime(1, compEnd - fadeSec);
      gain.gain.linearRampToValueAtTime(idx === chunks - 1 ? 1 : 0, compEnd);
      src.connect(gain).connect(offlineCtx.destination);
      src.start(compStart, offsetInTake, chunkDur + fadeSec);
    });

    const rendered = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWavBlob(rendered);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kuon-comping-${Date.now()}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  }, [chosenTakeIds, recordingDuration, chunks, takes, stereo, lang]);

  // ============================================================
  // Take deletion
  // ============================================================
  const removeTake = useCallback(async (takeId: string) => {
    if (!confirm(t({ ja: 'このテイクを削除しますか?', en: 'Delete this take?', es: '¿Eliminar esta toma?' }, lang))) return;
    await deleteTake(takeId);
    setTakes((prev) => prev.filter((t) => t.id !== takeId));
    setChosenTakeIds((prev) => prev.map((c) => (c === takeId ? null : c)));
  }, [lang]);

  // ============================================================
  // Pro mode keyboard shortcuts
  // ============================================================
  useEffect(() => {
    if (mode !== 'pro') return;
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (recState === 'idle' && !playing) {
          startPreroll();
        } else if (recState === 'recording') {
          stopRecording();
        } else if (playing) {
          stopPlayback();
        } else {
          playComp();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (recState === 'idle' && !playing) startPreroll();
      } else if (e.key === 'e' || e.key === 'E') {
        exportWav();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, recState, playing, startPreroll, stopRecording, playComp, stopPlayback, exportWav]);

  // ============================================================
  // Cleanup on unmount
  // ============================================================
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e1a 0%, #1e293b 100%)', color: '#e5e5e5', fontFamily: sans }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem)' }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link href="/comping-lp" style={{ fontFamily: serif, fontSize: '1rem', color: '#94a3b8', textDecoration: 'none', letterSpacing: '0.1em' }}>
            ← KUON COMPING
          </Link>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setMode(mode === 'simple' ? 'pro' : 'simple')}
              style={{ background: mode === 'pro' ? ACCENT : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: 999, fontSize: '0.75rem', fontFamily: sans, cursor: 'pointer' }}
            >
              {mode === 'pro' ? '⌨ Pro Mode' : 'Simple Mode'}
            </button>
            <Link href="/audio-apps" style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'none' }}>
              {t({ ja: 'すべてのアプリ', en: 'All apps', es: 'Todas' }, lang)}
            </Link>
          </div>
        </header>

        {/* Pro mode shortcut hint */}
        {mode === 'pro' && (
          <div style={{ background: 'rgba(2,132,199,0.1)', border: '1px solid rgba(2,132,199,0.2)', borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#7dd3fc' }}>
            ⌨ {t({ ja: 'ショートカット', en: 'Shortcuts', es: 'Atajos' }, lang)}: Space = {t({ ja: '録音/再生', en: 'Record/Play', es: 'Grabar/Reproducir' }, lang)} · R = {t({ ja: '新テイク', en: 'New take', es: 'Nueva toma' }, lang)} · E = {t({ ja: '書き出し', en: 'Export', es: 'Exportar' }, lang)}
          </div>
        )}

        {/* Settings */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>{t({ ja: 'BPM', en: 'BPM', es: 'BPM' }, lang)}</label>
              <input type="number" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value) || 80)} disabled={recState !== 'idle'}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: 6, fontSize: '0.85rem' }} min="40" max="240" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>{t({ ja: '録音長 (秒)', en: 'Length (sec)', es: 'Duración (s)' }, lang)}</label>
              <input type="number" value={recordingDuration} onChange={(e) => setRecordingDuration(parseInt(e.target.value) || 15)} disabled={recState !== 'idle' || takes.length > 0}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: 6, fontSize: '0.85rem' }} min="3" max="300" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>{t({ ja: '分割数', en: 'Chunks', es: 'Segmentos' }, lang)}</label>
              <input type="number" value={chunks} onChange={(e) => setChunks(Math.max(2, Math.min(32, parseInt(e.target.value) || 8)))} disabled={recState !== 'idle'}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: 6, fontSize: '0.85rem' }} min="2" max="32" />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>{t({ ja: 'チャンネル', en: 'Channels', es: 'Canales' }, lang)}</label>
              <select value={stereo ? 'stereo' : 'mono'} onChange={(e) => setStereo(e.target.value === 'stereo')} disabled={recState !== 'idle' || takes.length > 0}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: 6, fontSize: '0.85rem' }}>
                <option value="mono">{t({ ja: 'モノラル', en: 'Mono', es: 'Mono' }, lang)}</option>
                <option value="stereo">{t({ ja: 'ステレオ', en: 'Stereo', es: 'Estéreo' }, lang)}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recording UI */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          {recState === 'idle' && (
            <button onClick={startPreroll} disabled={playing}
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '1rem 2.25rem', borderRadius: 999, fontSize: '0.95rem', fontWeight: 500, fontFamily: sans, cursor: 'pointer', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
              ⚫ {t({ ja: '新しいテイクを録音', en: 'Record New Take', es: 'Grabar nueva toma' }, lang)}
            </button>
          )}
          {recState === 'preroll' && (
            <div>
              <div style={{ fontFamily: serif, fontSize: '4rem', fontWeight: 300, color: ACCENT, marginBottom: '0.5rem', lineHeight: 1 }}>
                {prerollBeat}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{t({ ja: 'プレロール (4 拍)', en: 'Pre-roll (4 beats)', es: 'Pre-roll (4 beats)' }, lang)}</div>
            </div>
          )}
          {recState === 'recording' && (
            <div>
              <div style={{ fontFamily: serif, fontSize: '2.5rem', fontWeight: 300, color: '#dc2626', marginBottom: '0.5rem' }}>
                ● REC {recElapsed.toFixed(1)} / {recordingDuration}s
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
                <div style={{ height: '100%', background: '#dc2626', width: `${(recElapsed / recordingDuration) * 100}%`, transition: 'width 0.1s linear' }} />
              </div>
              <button onClick={stopRecording} style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 999, fontSize: '0.8rem', cursor: 'pointer' }}>
                ■ {t({ ja: '停止', en: 'Stop', es: 'Detener' }, lang)}
              </button>
            </div>
          )}
        </div>

        {/* Takes display */}
        {takes.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: serif, fontSize: '1rem', color: '#cbd5e1', marginBottom: '1rem', fontWeight: 400 }}>
              {t({ ja: 'テイク', en: 'Takes', es: 'Tomas' }, lang)} ({takes.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {takes.map((take) => (
                <div key={take.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: TAKE_COLORS[take.takeNumber % TAKE_COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#fff', flexShrink: 0,
                  }}>
                    {take.takeNumber}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Waveform buffer={take.audioBuffer} color={TAKE_COLORS[take.takeNumber % TAKE_COLORS.length]} />
                  </div>
                  <button onClick={() => removeTake(take.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.85rem' }}>🗑</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comp editor */}
        {takes.length > 0 && (
          <div style={{ background: 'rgba(2,132,199,0.05)', border: '1px solid rgba(2,132,199,0.2)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: serif, fontSize: '1rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 400 }}>
              {t({ ja: 'コンプ (各セグメントで使うテイクを選択)', en: 'Comp (pick a take per segment)', es: 'Comp (elige toma por segmento)' }, lang)}
            </h3>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
              {t({ ja: 'クリックで切替・ダブルクリックで「使わない」', en: 'Click to switch · double-click to clear', es: 'Click para cambiar · doble click para limpiar' }, lang)}
            </div>
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${chunks}, 1fr)`, gap: 2, marginBottom: '0.5rem' }}>
              {chosenTakeIds.map((takeId, idx) => {
                const take = takes.find((t) => t.id === takeId);
                const color = take ? TAKE_COLORS[take.takeNumber % TAKE_COLORS.length] : '#374151';
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const currentIdx = takes.findIndex((t) => t.id === takeId);
                      const nextIdx = (currentIdx + 1) % takes.length;
                      setChunk(idx, takes[nextIdx].id);
                    }}
                    onDoubleClick={() => setChunk(idx, null)}
                    style={{ background: color, height: 50, border: 'none', borderRadius: 4, cursor: 'pointer', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    {take ? `T${take.takeNumber}` : '—'}
                  </button>
                );
              })}
            </div>
            <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: '0.85rem' }}>
              {playing && (
                <div style={{ position: 'absolute', left: `${(playPos / recordingDuration) * 100}%`, top: -8, width: 2, height: 20, background: '#fff' }} />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
              <span>0s</span>
              <span>{recordingDuration}s</span>
            </div>
          </div>
        )}

        {/* Playback + Export */}
        {takes.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={playComp} style={{ background: ACCENT, color: '#fff', border: 'none', padding: '0.85rem 2rem', borderRadius: 999, fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
              {playing ? '■ ' + t({ ja: '停止', en: 'Stop', es: 'Detener' }, lang) : '▶ ' + t({ ja: 'コンプを再生', en: 'Play Comp', es: 'Reproducir' }, lang)}
            </button>
            <button onClick={exportWav} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.85rem 2rem', borderRadius: 999, fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
              📥 {t({ ja: 'WAV を書き出し', en: 'Export WAV', es: 'Exportar WAV' }, lang)}
            </button>
          </div>
        )}

        {/* Empty state */}
        {takes.length === 0 && recState === 'idle' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.85rem' }}>
            {t({
              ja: '上のボタンを押して 1 つ目のテイクを録音してください。同じパッセージを複数回録音 → ベスト合成できます。',
              en: 'Click the button above to record your first take. Record the same passage multiple times → comp the best moments.',
              es: 'Haz clic arriba para grabar tu primera toma.',
            }, lang)}
          </div>
        )}
      </div>
    </div>
  );
}

const TAKE_COLORS = ['#0284c7', '#16a34a', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4', '#dc2626', '#84cc16'];

// ============================================================
// Waveform component (Canvas)
// ============================================================
function Waveform({ buffer, color }: { buffer?: AudioBuffer; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!buffer || !ref.current) return;
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const w = cv.width = cv.clientWidth * 2; // retina
    const h = cv.height = cv.clientHeight * 2;
    ctx.scale(1, 1);
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / w);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = color;
    for (let x = 0; x < w; x++) {
      let min = 1, max = -1;
      for (let i = 0; i < step; i++) {
        const v = data[x * step + i];
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const yMin = ((1 + min) * h) / 2;
      const yMax = ((1 + max) * h) / 2;
      ctx.fillRect(x, yMax, 1, Math.max(2, yMin - yMax));
    }
  }, [buffer, color]);
  return <canvas ref={ref} style={{ width: '100%', height: 40, display: 'block' }} />;
}

export default function CompingPage() {
  return (
    <AuthGate appName="comping">
      <CompingApp />
    </AuthGate>
  );
}
