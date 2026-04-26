'use client';

// ─────────────────────────────────────────────
// KUON DRUM MACHINE — Main App
// ─────────────────────────────────────────────
// 8 voices × N steps シーケンサー + 4 キット + 28 パターン + URL 共有 + WAV 出力
// 完全シンセシス (サンプルなし) で 80KB 未満
// ─────────────────────────────────────────────

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { KITS, AVAILABLE_KITS, COMING_SOON_KITS, type KitId } from '@/app/lib/drum/kits';
import { PATTERNS, getPatternById, type Pattern } from '@/app/lib/drum/patterns';
import { encodeShare, decodeShare } from '@/app/lib/drum/encoder';
import { renderToWav, downloadBlob } from '@/app/lib/drum/wav-export';
import type { PlayParams } from '@/app/lib/drum/synth';

const serif = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif';
const sans = '"Helvetica Neue",Arial,sans-serif';
const mono = '"SF Mono","Fira Code","Consolas",monospace';

// 宝石カラー (ボイス別)
const VOICE_COLORS = [
  '#ef4444', // Kick - ルビー
  '#f59e0b', // Snare - アンバー
  '#10b981', // CH - エメラルド
  '#06b6d4', // OH - ターコイズ
  '#8b5cf6', // Clap/extra - アメジスト
  '#ec4899', // Tom/extra - ローズ
  '#eab308', // Cowbell/extra - ゴールド
  '#94a3b8', // Rim/extra - シルバー
];

const ACCENT = '#0284c7';
const NAVY = '#0a1226';
const ROSE_GOLD = '#e8b8a0';

type L5 = Partial<Record<Lang, string>> & { en: string };
const t5 = (m: L5, l: Lang) => m[l] ?? m.en;

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function DrumMachinePage() {
  const { lang } = useLang();

  // State
  const [kitId, setKitId] = useState<KitId>('standard');
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(0);
  const [steps, setSteps] = useState(16);
  const [tracks, setTracks] = useState<boolean[][]>(
    () => Array.from({ length: 8 }, () => Array(16).fill(false)),
  );
  const [accents, setAccents] = useState<boolean[][]>(
    () => Array.from({ length: 8 }, () => Array(16).fill(false)),
  );
  const [voiceParams, setVoiceParams] = useState<PlayParams[]>(
    () => KITS.standard.defaultParams.map((p) => ({ ...p })),
  );
  const [muted, setMuted] = useState<boolean[]>(() => Array(8).fill(false));
  const [solo, setSolo] = useState<boolean[]>(() => Array(8).fill(false));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [filterCulture, setFilterCulture] = useState<string>('all');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [bars, setBars] = useState(2);
  const [isExporting, setIsExporting] = useState(false);

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const nextStepTimeRef = useRef(0);
  const stepIdxRef = useRef(0);
  const schedulerIdRef = useRef<number | null>(null);

  const kit = KITS[kitId];

  // ─────────────────────────────────────────────
  // Init AudioContext on first interaction
  // ─────────────────────────────────────────────
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    type AudioContextCtor = typeof AudioContext;
    interface WebkitWindow { webkitAudioContext?: AudioContextCtor }
    const Ctor: AudioContextCtor =
      window.AudioContext || ((window as unknown as WebkitWindow).webkitAudioContext as AudioContextCtor);
    const ctx = new Ctor();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -10;
    comp.knee.value = 6;
    comp.ratio.value = 3;
    comp.attack.value = 0.005;
    comp.release.value = 0.1;
    const master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(comp);
    comp.connect(ctx.destination);
    audioCtxRef.current = ctx;
    masterGainRef.current = master;
    compressorRef.current = comp;
    return ctx;
  }, []);

  // ─────────────────────────────────────────────
  // Scheduler (lookahead)
  // ─────────────────────────────────────────────
  const stepDur = 60 / bpm / 4; // 16 分音符 (4 ステップ = 1 拍)
  const scheduleAhead = 0.1;    // 100ms 先までスケジュール

  const scheduleStep = useCallback((stepIdx: number, time: number) => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const isAnySolo = solo.some(Boolean);
    const swingOffset = (stepIdx & 1) === 1
      ? stepDur * (swing / 100) * 0.5
      : 0;
    const playTime = time + swingOffset;

    for (let v = 0; v < 8; v++) {
      if (!tracks[v]?.[stepIdx]) continue;
      if (muted[v]) continue;
      if (isAnySolo && !solo[v]) continue;
      const voice = kit.voices[v];
      if (!voice) continue;
      const params: PlayParams = {
        ...voiceParams[v],
        accent: accents[v]?.[stepIdx],
      };
      voice(ctx, master, playTime, params);
    }
  }, [tracks, accents, voiceParams, kit, muted, solo, swing, stepDur]);

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    while (nextStepTimeRef.current < ctx.currentTime + scheduleAhead) {
      const stepIdx = stepIdxRef.current;
      scheduleStep(stepIdx, nextStepTimeRef.current);
      // setState は次フレームに委ねる (visual sync)
      const targetTime = nextStepTimeRef.current;
      const delay = Math.max(0, (targetTime - ctx.currentTime) * 1000);
      window.setTimeout(() => setCurrentStep(stepIdx), delay);
      nextStepTimeRef.current += stepDur;
      stepIdxRef.current = (stepIdx + 1) % steps;
    }
    schedulerIdRef.current = window.setTimeout(scheduler, 25);
  }, [scheduleStep, stepDur, steps]);

  // Play / Stop
  const handlePlay = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();
    nextStepTimeRef.current = ctx.currentTime + 0.05;
    stepIdxRef.current = 0;
    setIsPlaying(true);
    scheduler();
  }, [initAudio, scheduler]);

  const handleStop = useCallback(() => {
    if (schedulerIdRef.current !== null) {
      clearTimeout(schedulerIdRef.current);
      schedulerIdRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(-1);
    stepIdxRef.current = 0;
  }, []);

  useEffect(() => () => { if (schedulerIdRef.current !== null) clearTimeout(schedulerIdRef.current); }, []);

  // ─────────────────────────────────────────────
  // Pattern load
  // ─────────────────────────────────────────────
  const loadPattern = useCallback((p: Pattern) => {
    handleStop();
    setKitId(p.defaultKit);
    setBpm(p.defaultBpm);
    setSwing(p.swing);
    setSteps(p.steps);
    setTracks(p.tracks.map((row) => [...row]));
    setAccents(
      p.accents
        ? p.accents.map((row) => [...row])
        : Array.from({ length: 8 }, () => Array(p.steps).fill(false)),
    );
    setVoiceParams(KITS[p.defaultKit].defaultParams.map((q) => ({ ...q })));
    setMuted(Array(8).fill(false));
    setSolo(Array(8).fill(false));
    setSelectedPatternId(p.id);
    setShowInfo(true);
    setShowLibrary(false);
  }, [handleStop]);

  // ─────────────────────────────────────────────
  // Step click toggle
  // ─────────────────────────────────────────────
  const toggleStep = (v: number, s: number) => {
    setTracks((prev) => {
      const next = prev.map((r) => [...r]);
      next[v][s] = !next[v][s];
      return next;
    });
  };
  const toggleAccent = (v: number, s: number) => {
    setAccents((prev) => {
      const next = prev.map((r) => [...r]);
      next[v][s] = !next[v][s];
      return next;
    });
  };

  // Kit change
  const changeKit = (newKitId: KitId) => {
    if (!KITS[newKitId].available) return;
    handleStop();
    setKitId(newKitId);
    setVoiceParams(KITS[newKitId].defaultParams.map((p) => ({ ...p })));
    setSelectedPatternId(null);
    setShowInfo(false);
  };

  // Steps change (clear pattern)
  const changeSteps = (newSteps: number) => {
    handleStop();
    setSteps(newSteps);
    setTracks(Array.from({ length: 8 }, () => Array(newSteps).fill(false)));
    setAccents(Array.from({ length: 8 }, () => Array(newSteps).fill(false)));
    setSelectedPatternId(null);
    setShowInfo(false);
  };

  // Clear all
  const clearAll = () => {
    handleStop();
    setTracks(Array.from({ length: 8 }, () => Array(steps).fill(false)));
    setAccents(Array.from({ length: 8 }, () => Array(steps).fill(false)));
    setSelectedPatternId(null);
  };

  // Toggle mute / solo
  const toggleMute = (v: number) => setMuted((m) => m.map((x, i) => i === v ? !x : x));
  const toggleSolo = (v: number) => setSolo((s) => s.map((x, i) => i === v ? !x : x));

  // ─────────────────────────────────────────────
  // Share URL
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('p=')) {
      const decoded = decodeShare(hash.slice(2));
      if (decoded) {
        setKitId(decoded.kitId);
        setBpm(decoded.bpm);
        setSwing(decoded.swing);
        setSteps(decoded.steps);
        setTracks(decoded.tracks);
        setAccents(decoded.accents ?? Array.from({ length: 8 }, () => Array(decoded.steps).fill(false)));
        setVoiceParams(KITS[decoded.kitId].defaultParams.map((q) => ({ ...q })));
      }
    }
  }, []);

  const generateShareUrl = useCallback(() => {
    const code = encodeShare({ kitId, bpm, swing, steps, tracks, accents });
    const url = `${window.location.origin}/drum#p=${code}`;
    setShareUrl(url);
    navigator.clipboard?.writeText(url).catch(() => {});
  }, [kitId, bpm, swing, steps, tracks, accents]);

  // ─────────────────────────────────────────────
  // WAV export
  // ─────────────────────────────────────────────
  const exportWav = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await renderToWav({
        kit, tracks, accents, voiceParams,
        bpm, swing, steps, bars,
      });
      downloadBlob(blob, `kuon-drum-${selectedPatternId ?? 'pattern'}-${bpm}bpm.wav`);
    } finally {
      setIsExporting(false);
    }
  }, [kit, tracks, accents, voiceParams, bpm, swing, steps, bars, selectedPatternId]);

  // ─────────────────────────────────────────────
  // Filter patterns
  // ─────────────────────────────────────────────
  const filteredPatterns = useMemo(() => {
    if (filterCulture === 'all') return PATTERNS;
    return PATTERNS.filter((p) => p.culture === filterCulture);
  }, [filterCulture]);

  const cultureFilters: { id: string; label: L5 }[] = [
    { id: 'all', label: { ja: 'すべて', en: 'All', es: 'Todo', ko: '전체', pt: 'Todos', de: 'Alle' } },
    { id: 'western', label: { ja: '西洋', en: 'Western', es: 'Occidental', ko: '서양', pt: 'Ocidental', de: 'Westlich' } },
    { id: 'cuban', label: { ja: 'キューバ', en: 'Cuban', es: 'Cubano', ko: '쿠바', pt: 'Cubano', de: 'Kubanisch' } },
    { id: 'brazilian', label: { ja: 'ブラジル', en: 'Brazilian', es: 'Brasileño', ko: '브라질', pt: 'Brasileiro', de: 'Brasilianisch' } },
    { id: 'argentinian', label: { ja: 'アルゼンチン', en: 'Argentinian', es: 'Argentino', ko: '아르헨티나', pt: 'Argentino', de: 'Argentinisch' } },
    { id: 'spanish', label: { ja: 'スペイン', en: 'Spanish', es: 'Español', ko: '스페인', pt: 'Espanhol', de: 'Spanisch' } },
    { id: 'balkan', label: { ja: 'バルカン', en: 'Balkan', es: 'Balcánico', ko: '발칸', pt: 'Balcânico', de: 'Balkanisch' } },
    { id: 'jamaican', label: { ja: 'ジャマイカ', en: 'Jamaican', es: 'Jamaicano', ko: '자메이카', pt: 'Jamaicano', de: 'Jamaikanisch' } },
    { id: 'japanese', label: { ja: '日本', en: 'Japanese', es: 'Japonés', ko: '일본', pt: 'Japonês', de: 'Japanisch' } },
  ];

  const selectedPattern = selectedPatternId ? getPatternById(selectedPatternId) : null;

  // Step indexing — 4 拍ごと薄い区切り
  const beatGroups = Math.ceil(steps / 4);

  return (
    <div style={{
      minHeight: '100vh', background: `linear-gradient(180deg, #0f1729, ${NAVY})`,
      color: '#e2e8f0', fontFamily: sans, paddingBottom: 80,
    }}>
      {/* HERO */}
      <header style={{ padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3%, 2rem) 1.5rem', textAlign: 'center', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.2em', color: ROSE_GOLD, marginBottom: 8 }}>
          KUON DRUM MACHINE
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 400,
          margin: '0 0 0.5rem', letterSpacing: '0.02em', color: '#fff',
        }}>
          {t5({ ja: '世界のリズムを、ブラウザで叩く。', en: 'Beat the world\'s rhythms, in your browser.', es: 'Toca los ritmos del mundo en tu navegador.', ko: '세계의 리듬을 브라우저에서.', pt: 'Toque os ritmos do mundo no navegador.', de: 'Schlage die Rhythmen der Welt im Browser.' }, lang)}
        </h1>
        <p style={{
          fontSize: 'clamp(0.85rem, 1.6vw, 1rem)', color: '#94a3b8',
          maxWidth: 720, margin: '0 auto', lineHeight: 1.7,
        }}>
          {t5({
            ja: `${PATTERNS.length}+ パターン・${AVAILABLE_KITS.length} キット・サンプル不要・登録不要・WAV/MIDI 出力`,
            en: `${PATTERNS.length}+ patterns · ${AVAILABLE_KITS.length} kits · no samples · no signup · WAV export`,
            es: `${PATTERNS.length}+ patrones · ${AVAILABLE_KITS.length} kits · sin samples · sin registro · exportación WAV`,
            ko: `${PATTERNS.length}+ 패턴 · ${AVAILABLE_KITS.length} 키트 · 샘플 불필요 · WAV 출력`,
            pt: `${PATTERNS.length}+ padrões · ${AVAILABLE_KITS.length} kits · sem samples · WAV export`,
            de: `${PATTERNS.length}+ Patterns · ${AVAILABLE_KITS.length} Kits · ohne Samples · WAV-Export`,
          }, lang)}
        </p>
      </header>

      {/* TRANSPORT BAR */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(10,18,38,0.95)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(232,184,160,0.2)', borderBottom: '1px solid rgba(232,184,160,0.2)',
        padding: '12px clamp(0.75rem, 3%, 2rem)', maxWidth: 1400, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'center' }}>
          {/* Play/Stop */}
          <button onClick={isPlaying ? handleStop : handlePlay} style={{
            padding: '10px 24px', borderRadius: 8, border: 'none',
            background: isPlaying ? '#ef4444' : ROSE_GOLD,
            color: NAVY, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            letterSpacing: '0.05em',
          }}>
            {isPlaying
              ? `■ ${t5({ ja: '停止', en: 'Stop', es: 'Parar', ko: '정지', pt: 'Parar', de: 'Stopp' }, lang)}`
              : `▶ ${t5({ ja: '再生', en: 'Play', es: 'Tocar', ko: '재생', pt: 'Tocar', de: 'Abspielen' }, lang)}`}
          </button>

          {/* BPM */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: '#94a3b8' }}>BPM</span>
            <input type="number" value={bpm} min={40} max={220}
              onChange={(e) => setBpm(Math.max(40, Math.min(220, parseInt(e.target.value) || 120)))}
              style={{ width: 64, padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: 6, fontSize: 13, fontFamily: mono }} />
          </label>

          {/* Swing */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: '#94a3b8' }}>{t5({ ja: 'スウィング', en: 'Swing', es: 'Swing', ko: '스윙', pt: 'Swing', de: 'Swing' }, lang)}</span>
            <input type="range" min={0} max={75} value={swing} onChange={(e) => setSwing(parseInt(e.target.value))}
              style={{ width: 80 }} />
            <span style={{ fontFamily: mono, color: ROSE_GOLD, width: 30, textAlign: 'right' }}>{swing}%</span>
          </label>

          {/* Steps */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: '#94a3b8' }}>{t5({ ja: 'ステップ', en: 'Steps', es: 'Pasos', ko: '스텝', pt: 'Passos', de: 'Schritte' }, lang)}</span>
            <select value={steps} onChange={(e) => changeSteps(parseInt(e.target.value))}
              style={{ padding: '6px 8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: 6, fontSize: 12 }}>
              {[10, 11, 12, 14, 16, 20, 24].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          {/* Library */}
          <button onClick={() => setShowLibrary((v) => !v)} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(232,184,160,0.4)',
            background: showLibrary ? ROSE_GOLD : 'transparent', color: showLibrary ? NAVY : '#fff',
            fontWeight: 600, fontSize: 12, cursor: 'pointer', letterSpacing: '0.05em',
          }}>
            📚 {t5({ ja: 'ライブラリ', en: 'Library', es: 'Librería', ko: '라이브러리', pt: 'Biblioteca', de: 'Bibliothek' }, lang)} ({PATTERNS.length})
          </button>

          {/* Clear */}
          <button onClick={clearAll} style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid #334155',
            background: 'transparent', color: '#94a3b8', fontSize: 12, cursor: 'pointer',
          }}>
            {t5({ ja: 'クリア', en: 'Clear', es: 'Limpiar', ko: '클리어', pt: 'Limpar', de: 'Leeren' }, lang)}
          </button>
        </div>
      </div>

      {/* KIT SELECTOR */}
      <div style={{ padding: '16px clamp(0.75rem, 3%, 2rem) 8px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: '#64748b', marginBottom: 8, fontFamily: mono }}>KIT</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[...AVAILABLE_KITS, ...COMING_SOON_KITS].map((kid) => {
            const k = KITS[kid];
            const isActive = kid === kitId;
            const isAvail = k.available;
            return (
              <button key={kid} onClick={() => changeKit(kid)} disabled={!isAvail}
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  border: isActive ? `2px solid ${ROSE_GOLD}` : '1px solid #334155',
                  background: isActive ? 'rgba(232,184,160,0.15)' : (isAvail ? '#1e293b' : 'rgba(30,41,59,0.4)'),
                  color: isAvail ? '#fff' : '#475569',
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  cursor: isAvail ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: 6,
                  opacity: isAvail ? 1 : 0.5,
                }}>
                <span style={{ fontSize: 14 }}>{k.emoji}</span>
                {t5(k.name, lang)}
                {!isAvail && <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 4 }}>({t5({ ja: '近日', en: 'soon', es: 'pronto', ko: '곧', pt: 'breve', de: 'bald' }, lang)})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* PATTERN INFO (selected pattern's educational text) */}
      {selectedPattern && showInfo && (
        <div style={{ padding: '0 clamp(0.75rem, 3%, 2rem)', maxWidth: 1400, margin: '0 auto' }}>
          <div style={{
            background: 'rgba(232,184,160,0.08)', border: '1px solid rgba(232,184,160,0.3)',
            borderRadius: 12, padding: '16px 20px', marginTop: 12, position: 'relative',
          }}>
            <button onClick={() => setShowInfo(false)} style={{
              position: 'absolute', top: 8, right: 12, background: 'none', border: 'none',
              color: '#94a3b8', fontSize: 18, cursor: 'pointer',
            }}>×</button>
            <div style={{ fontFamily: mono, fontSize: 10, color: ROSE_GOLD, marginBottom: 6, letterSpacing: '0.15em' }}>
              {t5({ ja: 'リズム解説', en: 'Rhythm Notes', es: 'Notas Rítmicas', ko: '리듬 해설', pt: 'Notas Rítmicas', de: 'Rhythmus-Notizen' }, lang)} · {selectedPattern.timeSignature} · ⭐ {'★'.repeat(selectedPattern.difficulty)}{'☆'.repeat(5 - selectedPattern.difficulty)}
            </div>
            <h3 style={{ fontFamily: serif, fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)', fontWeight: 400, margin: '0 0 8px', color: '#fff' }}>
              {t5(selectedPattern.name, lang)}
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#cbd5e1', margin: '0 0 10px' }}>
              {t5(selectedPattern.description, lang)}
            </p>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: '#94a3b8', borderLeft: `2px solid ${ROSE_GOLD}`, paddingLeft: 10, marginBottom: 10 }}>
              <strong style={{ color: ROSE_GOLD }}>{t5({ ja: '楽典メモ:', en: 'Theory:', es: 'Teoría:', ko: '이론:', pt: 'Teoria:', de: 'Theorie:' }, lang)}</strong> {t5(selectedPattern.educationalNotes, lang)}
            </div>
            {selectedPattern.examples && selectedPattern.examples.length > 0 && (
              <div style={{ fontSize: 11, color: '#64748b' }}>
                <strong style={{ color: '#94a3b8' }}>{t5({ ja: '代表曲', en: 'Examples', es: 'Ejemplos', ko: '대표곡', pt: 'Exemplos', de: 'Beispiele' }, lang)}:</strong>{' '}
                {selectedPattern.examples.map((ex, i) => (
                  <span key={i}>{ex.artist} — &ldquo;{ex.song}&rdquo;{i < (selectedPattern.examples?.length ?? 0) - 1 ? ' / ' : ''}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GRID */}
      <div style={{ padding: '16px clamp(0.5rem, 2%, 2rem)', maxWidth: 1400, margin: '0 auto', overflowX: 'auto' }}>
        <div style={{ minWidth: steps * 32 + 200 }}>
          {kit.voices.map((_, v) => {
            const isAnySolo = solo.some(Boolean);
            const isMuted = muted[v] || (isAnySolo && !solo[v]);
            return (
              <div key={v} style={{
                display: 'grid', gridTemplateColumns: '180px 1fr', gap: 8,
                marginBottom: 4, alignItems: 'center', opacity: isMuted ? 0.35 : 1,
              }}>
                {/* Voice label + controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 28, background: VOICE_COLORS[v], borderRadius: 2 }} />
                  <div style={{ flex: 1, fontSize: 11, color: '#cbd5e1', fontWeight: 500 }}>
                    {t5(kit.voiceLabels[v] ?? { en: '?' }, lang)}
                  </div>
                  <button onClick={() => toggleMute(v)} title="Mute" style={{
                    width: 22, height: 22, borderRadius: 4,
                    border: '1px solid #334155', background: muted[v] ? '#ef4444' : 'transparent',
                    color: muted[v] ? '#fff' : '#94a3b8', fontSize: 9, cursor: 'pointer',
                  }}>M</button>
                  <button onClick={() => toggleSolo(v)} title="Solo" style={{
                    width: 22, height: 22, borderRadius: 4,
                    border: '1px solid #334155', background: solo[v] ? ROSE_GOLD : 'transparent',
                    color: solo[v] ? NAVY : '#94a3b8', fontSize: 9, fontWeight: 700, cursor: 'pointer',
                  }}>S</button>
                </div>
                {/* Steps */}
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: steps }).map((_, s) => {
                    const on = tracks[v]?.[s];
                    const acc = accents[v]?.[s];
                    const isCurrent = s === currentStep;
                    const isBeat = s % 4 === 0;
                    const groupGap = s > 0 && s % 4 === 0 ? { marginLeft: 4 } : {};
                    return (
                      <button key={s}
                        onClick={() => toggleStep(v, s)}
                        onContextMenu={(e) => { e.preventDefault(); if (on) toggleAccent(v, s); }}
                        style={{
                          flex: 1, minWidth: 22, height: 28,
                          borderRadius: 4,
                          border: isCurrent ? `2px solid ${ROSE_GOLD}` : (isBeat ? '1px solid #475569' : '1px solid #334155'),
                          background: on
                            ? (acc ? ROSE_GOLD : VOICE_COLORS[v])
                            : (isBeat ? 'rgba(255,255,255,0.04)' : 'transparent'),
                          cursor: 'pointer', transition: 'background 0.05s',
                          padding: 0,
                          ...groupGap,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Step numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 8, marginTop: 8, fontSize: 10, color: '#64748b' }}>
            <div style={{ textAlign: 'right', paddingRight: 8 }}>{t5({ ja: '右クリックでアクセント', en: 'Right-click = accent', es: 'Clic derecho = acento', ko: '우클릭 = 액센트', pt: 'Clique direito = acento', de: 'Rechtsklick = Akzent' }, lang)}</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: steps }).map((_, s) => (
                <div key={s} style={{
                  flex: 1, minWidth: 22, textAlign: 'center', fontFamily: mono,
                  ...(s > 0 && s % 4 === 0 ? { marginLeft: 4 } : {}),
                  color: s % 4 === 0 ? ROSE_GOLD : '#475569',
                }}>
                  {s % 4 === 0 ? `${(s / 4) + 1}` : '·'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TIME SIGNATURE HINT */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#64748b' }}>
          {steps} {t5({ ja: 'ステップ', en: 'steps', es: 'pasos', ko: '스텝', pt: 'passos', de: 'Schritte' }, lang)} · {beatGroups} {t5({ ja: 'グループ', en: 'groups', es: 'grupos', ko: '그룹', pt: 'grupos', de: 'Gruppen' }, lang)}
          {selectedPattern && ` · ${selectedPattern.timeSignature}`}
        </div>
      </div>

      {/* SHARE & EXPORT */}
      <div style={{ padding: '24px clamp(0.75rem, 3%, 2rem)', maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Share */}
        <div style={{ padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid #1e293b' }}>
          <div style={{ fontSize: 11, color: ROSE_GOLD, fontFamily: mono, letterSpacing: '0.15em', marginBottom: 8 }}>SHARE</div>
          <h3 style={{ fontFamily: serif, fontSize: '1.1rem', margin: '0 0 8px', color: '#fff', fontWeight: 400 }}>
            {t5({ ja: 'パターンを URL で共有', en: 'Share Pattern via URL', es: 'Compartir Patrón por URL', ko: 'URL로 패턴 공유', pt: 'Compartilhar Padrão por URL', de: 'Pattern per URL teilen' }, lang)}
          </h3>
          <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10 }}>
            {t5({ ja: 'クラウド送信ゼロ。すべての設定が URL に圧縮されます。', en: 'Zero cloud transmission. All settings encoded in the URL.', es: 'Cero envío a la nube.', ko: '클라우드 전송 제로.', pt: 'Zero envio à nuvem.', de: 'Keine Cloud-Übertragung.' }, lang)}
          </p>
          <button onClick={generateShareUrl} style={{
            padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(232,184,160,0.4)',
            background: 'transparent', color: ROSE_GOLD, fontSize: 12, cursor: 'pointer', fontWeight: 600,
          }}>
            🔗 {t5({ ja: 'URL を生成 + コピー', en: 'Generate + Copy URL', es: 'Generar + Copiar URL', ko: 'URL 생성 + 복사', pt: 'Gerar + Copiar URL', de: 'URL generieren + kopieren' }, lang)}
          </button>
          {shareUrl && (
            <div style={{ marginTop: 8, padding: 8, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, fontFamily: mono, fontSize: 10, wordBreak: 'break-all', color: '#cbd5e1' }}>
              {shareUrl}
            </div>
          )}
        </div>

        {/* Export */}
        <div style={{ padding: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid #1e293b' }}>
          <div style={{ fontSize: 11, color: ROSE_GOLD, fontFamily: mono, letterSpacing: '0.15em', marginBottom: 8 }}>EXPORT</div>
          <h3 style={{ fontFamily: serif, fontSize: '1.1rem', margin: '0 0 8px', color: '#fff', fontWeight: 400 }}>
            {t5({ ja: 'WAV で書き出す', en: 'Export as WAV', es: 'Exportar como WAV', ko: 'WAV로 내보내기', pt: 'Exportar WAV', de: 'Als WAV exportieren' }, lang)}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{t5({ ja: '小節数', en: 'Bars', es: 'Compases', ko: '마디', pt: 'Compassos', de: 'Takte' }, lang)}</span>
            <select value={bars} onChange={(e) => setBars(parseInt(e.target.value))}
              style={{ padding: '4px 8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: 4, fontSize: 12 }}>
              {[1, 2, 4, 8, 16].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button onClick={exportWav} disabled={isExporting} style={{
            padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(232,184,160,0.4)',
            background: 'transparent', color: ROSE_GOLD, fontSize: 12, cursor: isExporting ? 'wait' : 'pointer', fontWeight: 600,
          }}>
            {isExporting ? '⏳ ' + t5({ ja: '書き出し中...', en: 'Rendering...', es: 'Renderizando...', ko: '렌더링 중...', pt: 'Renderizando...', de: 'Rendere...' }, lang) : '💾 ' + t5({ ja: 'WAV ダウンロード', en: 'Download WAV', es: 'Descargar WAV', ko: 'WAV 다운로드', pt: 'Baixar WAV', de: 'WAV herunterladen' }, lang)}
          </button>
        </div>
      </div>

      {/* PATTERN LIBRARY MODAL */}
      {showLibrary && (
        <div onClick={() => setShowLibrary(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', zIndex: 100,
          padding: 'clamp(1rem, 3vw, 2rem)', overflowY: 'auto',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: NAVY, borderRadius: 16, padding: 'clamp(1rem, 3vw, 2rem)',
            maxWidth: 1100, margin: '0 auto', border: '1px solid rgba(232,184,160,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 3vw, 2rem)', margin: 0, fontWeight: 400, color: '#fff' }}>
                {t5({ ja: 'パターンライブラリ', en: 'Pattern Library', es: 'Librería de Patrones', ko: '패턴 라이브러리', pt: 'Biblioteca de Padrões', de: 'Pattern-Bibliothek' }, lang)}
                <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8' }}>({filteredPatterns.length}/{PATTERNS.length})</span>
              </h2>
              <button onClick={() => setShowLibrary(false)} style={{
                background: 'none', border: 'none', color: '#94a3b8', fontSize: 28, cursor: 'pointer', lineHeight: 1,
              }}>×</button>
            </div>
            {/* Culture filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {cultureFilters.map((f) => (
                <button key={f.id} onClick={() => setFilterCulture(f.id)} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 11,
                  border: filterCulture === f.id ? `1px solid ${ROSE_GOLD}` : '1px solid #334155',
                  background: filterCulture === f.id ? 'rgba(232,184,160,0.15)' : 'transparent',
                  color: filterCulture === f.id ? ROSE_GOLD : '#94a3b8',
                  cursor: 'pointer', fontWeight: filterCulture === f.id ? 700 : 400,
                }}>
                  {t5(f.label, lang)}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {filteredPatterns.map((p) => (
                <button key={p.id} onClick={() => loadPattern(p)} style={{
                  textAlign: 'left', padding: 14, borderRadius: 10,
                  border: '1px solid #334155', background: 'rgba(255,255,255,0.03)',
                  color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ fontSize: 10, color: ROSE_GOLD, fontFamily: mono, letterSpacing: '0.1em' }}>
                    {p.timeSignature} · {p.defaultBpm} BPM · {'★'.repeat(p.difficulty)}
                  </div>
                  <div style={{ fontFamily: serif, fontSize: 14, fontWeight: 500 }}>
                    {t5(p.name, lang)}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                    {t5(p.description, lang).slice(0, 90)}…
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER LINK */}
      <div style={{ textAlign: 'center', padding: '24px 16px', fontSize: 12, color: '#64748b' }}>
        <Link href="/drum-lp" style={{ color: ROSE_GOLD, textDecoration: 'none' }}>
          {t5({ ja: 'KUON DRUM MACHINE について →', en: 'About KUON DRUM MACHINE →', es: 'Acerca de →', ko: '소개 →', pt: 'Sobre →', de: 'Über →' }, lang)}
        </Link>
        {' / '}
        <Link href="/metronome" style={{ color: '#94a3b8', textDecoration: 'none' }}>
          {t5({ ja: 'KUON METRONOME', en: 'KUON METRONOME', es: 'KUON METRONOME', ko: 'KUON METRONOME', pt: 'KUON METRONOME', de: 'KUON METRONOME' }, lang)} →
        </Link>
      </div>
    </div>
  );
}
