'use client';

// ─────────────────────────────────────────────
// KUON HALO v3 — Admin-only (オーナー専用)
// ─────────────────────────────────────────────
// Curanz Sounds 量産専用のヒーリング音響シンセサイザー。
// 369@kotaroasahina.com のみアクセス可能。
// ─────────────────────────────────────────────

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { HALO_PRESETS, getPresetById, PRESET_CATEGORIES, type HaloPreset } from '@/app/lib/halo/presets';
import { renderPreset, audioBufferToWav24, downloadBlob, buildFilename } from '@/app/lib/halo/export';
import { makePadVoice, PAD_NAMES, type PadType } from '@/app/lib/halo/pads';
import { binauralBeat } from '@/app/lib/halo/binaural';
import { createReverbFromPreset, REVERB_PRESETS, type ReverbPreset } from '@/app/lib/halo/reverb';
import { texture, type TextureType } from '@/app/lib/halo/synth';
import {
  scheduleProgression, voiceChord, getProgressionById, keyToHz,
  PROGRESSIONS, type Mode,
} from '@/app/lib/halo/chord-engine';
import { BRAINWAVES, SOLFEGGIO } from '@/app/lib/halo/frequencies';

const serif = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif';
const sans = '"Helvetica Neue",Arial,sans-serif';
const mono = '"SF Mono","Fira Code","Consolas",monospace';

const COL = {
  bg: 'linear-gradient(180deg, #1a1535, #0a0a1a)',
  bgCard: 'rgba(255,255,255,0.04)',
  bgCardActive: 'rgba(232,184,160,0.12)',
  border: 'rgba(232,184,160,0.2)',
  borderActive: '#e8b8a0',
  text: '#f5e6d3',
  textDim: '#a89cc4',
  textVeryDim: '#5b557a',
  accent: '#e8b8a0',
  accentBlue: '#7b95d9',
  glow: 'rgba(232,184,160,0.3)',
};

type L5 = Partial<Record<Lang, string>> & { en: string };
const t5 = (m: L5, l: Lang) => m[l] ?? m.en;

// ─────────────────────────────────────────────
// Custom Builder State (組み合わせ無限生成)
// ─────────────────────────────────────────────
type BuilderState = {
  baseSolfeggioHz: number;       // 174/285/396/417/528/639/741/852/963 etc.
  mode: Mode;
  progressionId: string;
  bassPad: PadType | 'none';
  mainPad: PadType;
  shimmerPad: PadType | 'none';
  pianoOnChange: boolean;
  reverbPreset: ReverbPreset;
  reverbWet: number;
  textureType: TextureType | 'none';
  textureVolume: number;
  binauralEnabled: boolean;
  binauralBeatHz: number;
  binauralCarrier: number;
  binauralVolume: number;
  warmth: number;
  customTitle: string;
};

const PAD_OPTIONS: PadType[] = ['warm-analog', 'string-ensemble', 'felt-piano', 'glass-pad', 'voice-pad'];
const MODE_OPTIONS: Mode[] = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian'];

// ソルフェジオ周波数をキー=「軸」として直接使う
// ヒーリング音楽では F=349 のような標準音律より、528Hz そのものを軸にする方が意味深い
function solfeggioToKeyName(hz: number): string {
  // 概算でキー名を決める (UI 表示用・実際の周波数は hz をそのまま使う)
  return `${hz}Hz`;
}

function defaultBuilder(): BuilderState {
  return {
    baseSolfeggioHz: 528, mode: 'ionian',
    progressionId: 'sleep-cycle',
    bassPad: 'warm-analog', mainPad: 'warm-analog', shimmerPad: 'glass-pad',
    pianoOnChange: true,
    reverbPreset: 'cathedral', reverbWet: 0.55,
    textureType: 'none', textureVolume: 0.05,
    binauralEnabled: true, binauralBeatHz: 6, binauralCarrier: 264, binauralVolume: 0.08,
    warmth: 0.75,
    customTitle: 'My Custom Track',
  };
}

function builderToPreset(b: BuilderState): HaloPreset {
  return {
    id: 'custom',
    title: { ja: b.customTitle, en: b.customTitle },
    subtitle: { ja: 'カスタム生成', en: 'Custom Generated' },
    description: {
      ja: `軸 ${b.baseSolfeggioHz}Hz · ${b.mode} · 進行 ${b.progressionId}`,
      en: `Axis ${b.baseSolfeggioHz}Hz · ${b.mode} · ${b.progressionId}`,
    },
    category: 'manifestation',
    key: solfeggioToKeyName(b.baseSolfeggioHz),
    tuning: 432,  // 内部互換用 (実際の周波数は baseSolfeggioHz を直接使う)
    mode: b.mode,
    progressionId: b.progressionId,
    bassLayer: b.bassPad === 'none' ? null : { padType: b.bassPad, volume: 0.5, bassOctaveOffset: -1 },
    padLayer: { padType: b.mainPad, volume: 0.55 },
    shimmerLayer: b.shimmerPad === 'none' ? null : { padType: b.shimmerPad, volume: 0.18 },
    pianoOnChange: { enabled: b.pianoOnChange, volume: 0.25 },
    reverb: { preset: b.reverbPreset, wetMix: b.reverbWet },
    texture: { enabled: b.textureType !== 'none', type: (b.textureType === 'none' ? 'water' : b.textureType), volume: b.textureVolume },
    binaural: {
      enabled: b.binauralEnabled, brainwave: 'theta',
      customBeatHz: b.binauralBeatHz, carrierHz: b.binauralCarrier, volume: b.binauralVolume,
    },
    recommendedDurationMin: 60,
    filenameTemplate: `${b.customTitle.replace(/\s+/g, '_')}_{idx}`,
    baseSolfeggioHz: b.baseSolfeggioHz,
  };
}

function randomBuilder(): BuilderState {
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const reverbs: ReverbPreset[] = ['cathedral', 'cave', 'cosmos', 'crystal-hall', 'forest'];
  const textures: (TextureType | 'none')[] = ['none', 'water', 'wind', 'cosmos'];
  const solfeggioPick = pick(SOLFEGGIO);
  const brainwave = pick(BRAINWAVES);
  return {
    baseSolfeggioHz: solfeggioPick.hz,
    mode: pick(MODE_OPTIONS),
    progressionId: pick(PROGRESSIONS).id,
    bassPad: pick(['warm-analog', 'string-ensemble'] as const),
    mainPad: pick(PAD_OPTIONS),
    shimmerPad: Math.random() > 0.3 ? pick(PAD_OPTIONS) : 'none',
    pianoOnChange: Math.random() > 0.4,
    reverbPreset: pick(reverbs),
    reverbWet: 0.4 + Math.random() * 0.3,
    textureType: pick(textures),
    textureVolume: 0.03 + Math.random() * 0.05,
    binauralEnabled: Math.random() > 0.2,
    binauralBeatHz: brainwave.default,
    binauralCarrier: solfeggioPick.hz / 2,
    binauralVolume: 0.06 + Math.random() * 0.06,
    warmth: 0.6 + Math.random() * 0.3,
    customTitle: `Random_${solfeggioPick.hz}Hz_${brainwave.name}`,
  };
}

const OWNER_EMAIL = '369@kotaroasahina.com';

export default function AdminHaloPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // ─── Owner-only auth check ───
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/auth/login'); return; }
        const me = await res.json();
        if (me.email !== OWNER_EMAIL) { router.push('/'); return; }
        setAuthed(true);
      } catch {
        router.push('/auth/login');
      } finally {
        setAuthChecked(true);
      }
    })();
  }, [router]);

  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(180deg, #1a1535, #0a0a1a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#a89cc4', fontFamily: '"Helvetica Neue",Arial,sans-serif', fontSize: 13,
      }}>
        Verifying access...
      </div>
    );
  }
  if (!authed) return null;

  return <HaloApp />;
}

function HaloApp() {
  const { lang } = useLang();
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('manifestation-morning');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [previewing, setPreviewing] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [exportDuration, setExportDuration] = useState<30 | 60 | 90 | 120>(60);
  const [batchCount, setBatchCount] = useState(1);
  const [enableVariation, setEnableVariation] = useState(true);
  const [previewElapsed, setPreviewElapsed] = useState(0);
  const [warmthSlider, setWarmthSlider] = useState(0.75);

  // Custom builder state
  const [builder, setBuilder] = useState<BuilderState>(defaultBuilder);

  const ctxRef = useRef<AudioContext | null>(null);
  const previewCleanupRef = useRef<(() => void) | null>(null);

  // 現在のプリセットを動的に決定 (modeに応じて)
  const preset: HaloPreset = mode === 'custom'
    ? builderToPreset(builder)
    : getPresetById(selectedPresetId)!;
  const progression = getProgressionById(preset.progressionId);

  const initCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    type AudioContextCtor = typeof AudioContext;
    interface WebkitWindow { webkitAudioContext?: AudioContextCtor }
    const Ctor: AudioContextCtor =
      window.AudioContext || ((window as unknown as WebkitWindow).webkitAudioContext as AudioContextCtor);
    const ctx = new Ctor();
    ctxRef.current = ctx;
    return ctx;
  }, []);

  // ─────────────────────────────────────────────
  // Preview (3 chords = approx 2 minutes)
  // ─────────────────────────────────────────────
  const startPreview = useCallback(() => {
    if (!progression) return;
    const ctx = initCtx();
    if (ctx.state === 'suspended') ctx.resume();

    // ─── Anti-clipping master chain ───
    const softClip = ctx.createWaveShaper();
    const sCurveLen = 2048;
    const sCurve = new Float32Array(sCurveLen);
    for (let i = 0; i < sCurveLen; i++) {
      const x = (i / sCurveLen) * 2 - 1;
      sCurve[i] = Math.tanh(x * 0.85);
    }
    softClip.curve = sCurve;
    softClip.connect(ctx.destination);
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
    limiter.attack.value = 0.001; limiter.release.value = 0.05;
    limiter.connect(softClip);
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 5);  // 5秒フェードイン (preview短いので)
    masterGain.connect(limiter);

    const reverb = createReverbFromPreset(ctx, preset.reverb.preset, preset.reverb.wetMix);
    reverb.output.connect(masterGain);

    const keyHz = preset.baseSolfeggioHz ?? keyToHz(preset.key, preset.tuning);
    // Preview = first 3 chords at faster pace for sampling (each 12 sec)
    const previewChordDur = 12;
    const previewChords = progression.chords.slice(0, 3);
    const totalPreviewDur = previewChords.length * previewChordDur;
    const FADE = 2.5;

    const allVoices: { stop: (t?: number) => void }[] = [];

    // Render each chord
    for (let i = 0; i < previewChords.length; i++) {
      const chord = { ...previewChords[i], duration: previewChordDur };
      const startT = ctx.currentTime + i * previewChordDur;
      const releaseT = startT + previewChordDur;
      const voicing = voiceChord(chord, keyHz, progression.mode);

      // Bass
      if (preset.bassLayer) {
        for (const f of voicing.bass) {
          const v = makePadVoice(preset.bassLayer.padType, ctx, reverb.input, startT, {
            freq: f, volume: preset.bassLayer.volume, attack: FADE, release: FADE,
            pan: -0.2, brightness: 0.3,
          });
          v.stop(releaseT);
          allVoices.push(v);
        }
      }

      // Pad
      for (let j = 0; j < voicing.pad.length; j++) {
        const f = voicing.pad[j];
        const pan = (j / Math.max(1, voicing.pad.length - 1) - 0.5) * 0.7;
        const v = makePadVoice(preset.padLayer.padType, ctx, reverb.input, startT, {
          freq: f,
          volume: preset.padLayer.volume / Math.sqrt(voicing.pad.length),
          attack: FADE, release: FADE + 1, pan, brightness: 0.5,
        });
        v.stop(releaseT);
        allVoices.push(v);
      }

      // Shimmer
      if (preset.shimmerLayer && voicing.shimmer.length > 0) {
        for (let j = 0; j < voicing.shimmer.length; j++) {
          const f = voicing.shimmer[j];
          const pan = (j / Math.max(1, voicing.shimmer.length - 1) - 0.5) * 0.9;
          const v = makePadVoice(preset.shimmerLayer.padType, ctx, reverb.input, startT, {
            freq: f,
            volume: preset.shimmerLayer.volume / Math.sqrt(voicing.shimmer.length),
            attack: FADE * 1.5, release: FADE + 2, pan, brightness: 0.8,
          });
          v.stop(releaseT);
          allVoices.push(v);
        }
      }

      // Felt piano on chord change
      if (preset.pianoOnChange.enabled) {
        const pianoNotes = [voicing.pad[0], voicing.pad[Math.min(2, voicing.pad.length - 1)]];
        for (const f of pianoNotes) {
          const v = makePadVoice('felt-piano', ctx, reverb.input, startT + 0.3, {
            freq: f, volume: preset.pianoOnChange.volume,
            attack: 0.005, release: 6,
            pan: (Math.random() - 0.5) * 0.4, brightness: 0.6,
          });
          allVoices.push(v);
        }
      }
    }

    // Binaural
    if (preset.binaural.enabled) {
      const carrier = preset.binaural.carrierHz ?? keyHz / 2;
      const b = binauralBeat(ctx, masterGain, ctx.currentTime, carrier, preset.binaural.customBeatHz ?? 6, preset.binaural.volume, 3);
      allVoices.push(b);
    }
    // Texture
    if (preset.texture.enabled) {
      const tex = texture(ctx, reverb.input, ctx.currentTime, preset.texture.type, {
        volume: preset.texture.volume, attack: 3, release: 4,
      });
      allVoices.push(tex);
    }

    setPreviewing(true);
    setPreviewElapsed(0);
    const startedAt = Date.now();
    const tickerId = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setPreviewElapsed(elapsed);
      if (elapsed >= totalPreviewDur) {
        cleanup();
      }
    }, 200);

    const cleanup = () => {
      window.clearInterval(tickerId);
      const stopT = ctx.currentTime;
      allVoices.forEach((v) => { try { v.stop(stopT); } catch { /* */ } });
      setPreviewing(false);
      setPreviewElapsed(0);
      previewCleanupRef.current = null;
    };
    previewCleanupRef.current = cleanup;
  }, [preset, progression, initCtx]);

  const stopPreview = useCallback(() => {
    previewCleanupRef.current?.();
  }, []);

  useEffect(() => () => previewCleanupRef.current?.(), []);
  useEffect(() => { stopPreview(); }, [selectedPresetId, stopPreview]);

  // ─────────────────────────────────────────────
  // Export
  // ─────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    setIsRendering(true);
    setRenderProgress(0);

    try {
      for (let idx = 1; idx <= batchCount; idx++) {
        const baseProgress = ((idx - 1) / batchCount) * 100;
        const buffer = await renderPreset({
          preset, durationMin: exportDuration, warmth: warmthSlider,
          variation: enableVariation && batchCount > 1 ? {
            detuneJitter: 5,
            binauralCarrierJitter: 2,
          } : undefined,
          onProgress: (pct) => {
            setRenderProgress(baseProgress + (pct / 100) * (100 / batchCount));
          },
        });
        const blob = audioBufferToWav24(buffer);
        downloadBlob(blob, buildFilename(preset, exportDuration, idx));
      }
      setRenderProgress(100);
    } catch (e) {
      console.error(e);
      alert('Render failed: ' + String(e));
    } finally {
      setTimeout(() => setIsRendering(false), 500);
    }
  }, [preset, exportDuration, batchCount, enableVariation, warmthSlider]);

  const filteredPresets = filterCat === 'all'
    ? HALO_PRESETS
    : HALO_PRESETS.filter((p) => p.category === filterCat);

  // 現在再生中のコード番号 (preview 中)
  const currentChordIdx = previewing && progression
    ? Math.min(progression.chords.length - 1, Math.floor(previewElapsed / 12))
    : -1;

  return (
    <div style={{
      minHeight: '100vh', background: COL.bg, color: COL.text,
      fontFamily: sans, paddingBottom: 80, backgroundAttachment: 'fixed',
    }}>
      {/* HERO */}
      <header style={{
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3%, 2rem) 1rem',
        textAlign: 'center', maxWidth: 1200, margin: '0 auto',
      }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.3em', color: COL.accent, marginBottom: 12 }}>
          KUON HALO · v2 PAD AMBIENT
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(1.6rem, 4.5vw, 2.8rem)', fontWeight: 400,
          margin: '0 0 1rem', letterSpacing: '0.04em', color: COL.text,
        }}>
          {t5({
            ja: '魂が震える音響を、量産する。',
            en: 'Mass-produce sound that moves the soul.',
          }, lang)}
        </h1>
        <p style={{
          fontSize: 'clamp(0.85rem, 1.6vw, 1rem)', color: COL.textDim,
          maxWidth: 720, margin: '0 auto', lineHeight: 1.8,
        }}>
          {t5({
            ja: '緩やかなコード進行 + 暖かいパッド + ストリングス + フェルトピアノ。Hiroshi Yoshimura・Joep Beving・Max Richter の系譜の長尺アンビエントを生成。',
            en: 'Slow chord progression + warm pads + strings + felt piano. Long-form ambient in the tradition of Yoshimura, Beving, Richter.',
          }, lang)}
        </p>
      </header>

      {/* 2-COL */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 2fr)',
        gap: 'clamp(16px, 2vw, 32px)', padding: '0 clamp(1rem, 3%, 2rem)',
        maxWidth: 1400, margin: '0 auto',
      }}>
        {/* LEFT: Presets / Custom Builder */}
        <aside>
          {/* Tab Switcher */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <button onClick={() => setMode('presets')} style={{
              flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              border: mode === 'presets' ? `1px solid ${COL.accent}` : `1px solid ${COL.border}`,
              background: mode === 'presets' ? COL.bgCardActive : 'transparent',
              color: mode === 'presets' ? COL.accent : COL.textDim, cursor: 'pointer', letterSpacing: '0.1em',
            }}>
              {t5({ ja: '🎼 プリセット', en: '🎼 PRESETS' }, lang)}
            </button>
            <button onClick={() => setMode('custom')} style={{
              flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              border: mode === 'custom' ? `1px solid ${COL.accent}` : `1px solid ${COL.border}`,
              background: mode === 'custom' ? COL.bgCardActive : 'transparent',
              color: mode === 'custom' ? COL.accent : COL.textDim, cursor: 'pointer', letterSpacing: '0.1em',
            }}>
              {t5({ ja: '✦ カスタム', en: '✦ CUSTOM' }, lang)}
            </button>
          </div>

          {mode === 'presets' && (
            <>
              <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.2em', color: COL.accent, marginBottom: 12 }}>
                {t5({ ja: 'プリセット', en: 'PRESETS' }, lang)} ({HALO_PRESETS.length})
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {PRESET_CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => setFilterCat(c.id)} style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 10,
                    border: filterCat === c.id ? `1px solid ${COL.accent}` : `1px solid ${COL.border}`,
                    background: filterCat === c.id ? COL.bgCardActive : 'transparent',
                    color: filterCat === c.id ? COL.accent : COL.textDim,
                    cursor: 'pointer', fontWeight: filterCat === c.id ? 700 : 400,
                  }}>
                    {t5(c.label, lang)}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 }}>
                {filteredPresets.map((p) => {
                  const active = p.id === selectedPresetId;
                  return (
                    <button key={p.id} onClick={() => setSelectedPresetId(p.id)} style={{
                      textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                      border: active ? `1px solid ${COL.accent}` : `1px solid ${COL.border}`,
                      background: active ? COL.bgCardActive : COL.bgCard,
                      color: COL.text, cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', flexDirection: 'column', gap: 4,
                      boxShadow: active ? `0 0 24px ${COL.glow}` : 'none',
                      transition: 'all 0.3s ease',
                    }}>
                      <div style={{ fontFamily: serif, fontSize: 13, fontWeight: 400, color: active ? COL.accent : COL.text }}>
                        {p.title[lang === 'ja' ? 'ja' : 'en']}
                      </div>
                      <div style={{ fontSize: 10, color: COL.textDim, lineHeight: 1.5 }}>
                        {p.subtitle[lang === 'ja' ? 'ja' : 'en']}
                      </div>
                      <div style={{ fontSize: 9, fontFamily: mono, color: COL.textVeryDim, marginTop: 4, letterSpacing: '0.05em' }}>
                        {p.key} {p.mode} · {p.tuning}Hz · {p.recommendedDurationMin}min
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mode === 'custom' && (
            <CustomBuilderPanel
              builder={builder}
              setBuilder={setBuilder}
              lang={lang}
              onRandom={() => setBuilder(randomBuilder())}
            />
          )}
        </aside>

        {/* RIGHT */}
        <main>
          <div style={{
            background: COL.bgCard, border: `1px solid ${COL.border}`,
            borderRadius: 16, padding: 'clamp(20px, 3vw, 32px)',
            boxShadow: `0 0 64px ${COL.glow}`,
          }}>
            {/* Title */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: COL.accent, letterSpacing: '0.2em', marginBottom: 6 }}>
                {preset.category.toUpperCase().replace('-', ' ')} · {preset.recommendedDurationMin} MIN
              </div>
              <h2 style={{
                fontFamily: serif, fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 400, margin: '0 0 8px', color: COL.text, letterSpacing: '0.02em',
              }}>
                {preset.title[lang === 'ja' ? 'ja' : 'en']}
              </h2>
              <div style={{ fontSize: 13, color: COL.textDim, fontStyle: 'italic' }}>
                {preset.subtitle[lang === 'ja' ? 'ja' : 'en']}
              </div>
            </div>

            <p style={{
              fontSize: 13, color: COL.textDim, lineHeight: 1.9, margin: '0 0 24px',
              borderLeft: `2px solid ${COL.accent}`, paddingLeft: 14,
            }}>
              {preset.description[lang === 'ja' ? 'ja' : 'en']}
            </p>

            {/* CHORD PROGRESSION VISUALIZATION */}
            {progression && (
              <div style={{ marginBottom: 24, padding: 16, background: 'rgba(0,0,0,0.2)', border: `1px solid ${COL.border}`, borderRadius: 10 }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: COL.accent, letterSpacing: '0.2em', marginBottom: 8 }}>
                  {t5({ ja: 'コード進行', en: 'CHORD PROGRESSION' }, lang)} — {progression.name[lang === 'ja' ? 'ja' : 'en']}
                </div>
                <div style={{ fontSize: 11, color: COL.textDim, marginBottom: 12, lineHeight: 1.7 }}>
                  {progression.description[lang === 'ja' ? 'ja' : 'en']}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {progression.chords.map((c, i) => {
                    const isActive = i === currentChordIdx;
                    return (
                      <div key={i} style={{
                        padding: '6px 10px', borderRadius: 6,
                        background: isActive ? COL.accent : 'rgba(255,255,255,0.05)',
                        color: isActive ? '#1a1535' : COL.text,
                        fontFamily: mono, fontSize: 11, fontWeight: 600,
                        transition: 'all 0.4s', minWidth: 70, textAlign: 'center',
                      }}>
                        {romanNumeral(c.rootSemi)}{chordSuffix(c.quality)}
                        <div style={{ fontSize: 8, opacity: 0.7, marginTop: 2 }}>{c.duration}s</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Voice Layer Display */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12, marginBottom: 28,
            }}>
              <SpecCard label={t5({ ja: 'キー', en: 'Key' }, lang)} value={`${preset.key} ${preset.mode}`} />
              <SpecCard label={t5({ ja: 'チューニング', en: 'Tuning' }, lang)} value={`${preset.tuning} Hz`} />
              {preset.bassLayer && <SpecCard label="Bass" value={padLabel(preset.bassLayer.padType, lang)} />}
              <SpecCard label="Pad" value={padLabel(preset.padLayer.padType, lang)} />
              {preset.shimmerLayer && <SpecCard label="Shimmer" value={padLabel(preset.shimmerLayer.padType, lang)} />}
              {preset.pianoOnChange.enabled && <SpecCard label="Piano" value={t5({ ja: 'コード変化時', en: 'On change' }, lang)} />}
              <SpecCard label="Reverb" value={preset.reverb.preset} />
              {preset.binaural.enabled && <SpecCard label="Binaural" value={`${preset.binaural.customBeatHz} Hz`} />}
            </div>

            {preset.binaural.enabled && (
              <div style={{
                background: 'rgba(123,149,217,0.1)', border: `1px solid ${COL.accentBlue}40`,
                borderRadius: 8, padding: '10px 14px', marginBottom: 24,
                fontSize: 11, color: COL.accentBlue,
              }}>
                🎧 {t5({
                  ja: 'バイノーラル効果のためにヘッドフォン推奨。',
                  en: 'Headphones recommended for binaural beat effect.',
                }, lang)}
              </div>
            )}

            {/* PREVIEW */}
            <div style={{ marginBottom: 24 }}>
              <button onClick={previewing ? stopPreview : startPreview} style={{
                width: '100%', padding: '14px 24px', borderRadius: 12, border: 'none',
                background: previewing ? '#7b95d9' : COL.accent, color: '#1a1535',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', letterSpacing: '0.05em',
                boxShadow: previewing ? '0 0 20px rgba(123,149,217,0.5)' : `0 0 20px ${COL.glow}`,
                transition: 'all 0.3s',
              }}>
                {previewing
                  ? `■ ${t5({ ja: 'プレビュー停止', en: 'Stop Preview' }, lang)} (${Math.floor(previewElapsed)}s / 36s)`
                  : `▶ ${t5({ ja: 'プレビュー (3 コード = 36 秒)', en: 'Preview (3 chords = 36 sec)' }, lang)}`}
              </button>
            </div>

            {/* WARMTH SLIDER (即時反映・耳に優しいレベル調整) */}
            <div style={{
              padding: 16, borderRadius: 12, background: 'rgba(232,184,160,0.06)',
              border: `1px solid ${COL.border}`, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: COL.accent, letterSpacing: '0.2em' }}>
                  🌊 {t5({ ja: 'ウォームネス', en: 'WARMTH' }, lang)}
                </span>
                <span style={{ fontFamily: mono, fontSize: 11, color: COL.text, fontWeight: 600 }}>
                  {Math.round(warmthSlider * 100)}%
                </span>
              </div>
              <input type="range" min={0} max={100} value={Math.round(warmthSlider * 100)}
                onChange={(e) => setWarmthSlider(parseInt(e.target.value) / 100)}
                style={{ width: '100%', accentColor: COL.accent }} />
              <div style={{ fontSize: 10, color: COL.textVeryDim, marginTop: 4, lineHeight: 1.6 }}>
                {t5({ ja: '高いほどソフトで耳あたりが良い (推奨 70-90%)', en: 'Higher = softer on the ears (recommended 70-90%)' }, lang)}
              </div>
            </div>

            {/* EXPORT */}
            <div style={{
              padding: 20, borderRadius: 12,
              background: 'rgba(0,0,0,0.2)', border: `1px solid ${COL.border}`,
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: COL.accent, letterSpacing: '0.2em', marginBottom: 14 }}>
                EXPORT — 24-bit / 48kHz HQ
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: COL.textDim }}>
                  {t5({ ja: '長さ (分)', en: 'Duration' }, lang)}
                  <select value={exportDuration} onChange={(e) => setExportDuration(parseInt(e.target.value) as 30 | 60 | 90 | 120)} style={selectStyle}>
                    <option value={30}>30 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120 min</option>
                  </select>
                </label>
                <label style={{ fontSize: 11, color: COL.textDim }}>
                  {t5({ ja: 'バッチ数', en: 'Batch' }, lang)}
                  <select value={batchCount} onChange={(e) => setBatchCount(parseInt(e.target.value))} style={selectStyle}>
                    <option value={1}>1</option>
                    <option value={3}>3 (Vol.1-3)</option>
                    <option value={5}>5 (Vol.1-5)</option>
                    <option value={10}>10 (Series)</option>
                  </select>
                </label>
              </div>

              {batchCount > 1 && (
                <label style={{ fontSize: 11, color: COL.textDim, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <input type="checkbox" checked={enableVariation} onChange={(e) => setEnableVariation(e.target.checked)} />
                  {t5({ ja: 'バリエーション生成 (各回ピッチ・キャリア微調整)', en: 'Generate variations' }, lang)}
                </label>
              )}

              <button onClick={handleExport} disabled={isRendering} style={{
                width: '100%', padding: '14px 24px', borderRadius: 10, border: 'none',
                background: isRendering ? COL.textVeryDim : COL.accent, color: '#1a1535',
                fontWeight: 700, fontSize: 14, cursor: isRendering ? 'wait' : 'pointer',
                letterSpacing: '0.05em',
              }}>
                {isRendering
                  ? `⏳ ${t5({ ja: '生成中', en: 'Rendering' }, lang)}... ${Math.round(renderProgress)}%`
                  : `💾 ${t5({ ja: 'WAV を生成・ダウンロード', en: 'Render & Download WAV' }, lang)}`}
              </button>
            </div>

            <div style={{ fontSize: 10, color: COL.textVeryDim, marginTop: 12, textAlign: 'center', lineHeight: 1.7 }}>
              {t5({
                ja: `想定生成時間: 1 ファイルあたり 30 分なら 約 ${Math.ceil(exportDuration / 4)}-${Math.ceil(exportDuration / 2)} 秒`,
                en: `Est. render time: ~${Math.ceil(exportDuration / 4)}-${Math.ceil(exportDuration / 2)} sec per ${exportDuration}min file`,
              }, lang)}
            </div>
          </div>
        </main>
      </div>

      <div style={{ textAlign: 'center', padding: '24px 16px', fontSize: 11, color: COL.textVeryDim }}>
        🌙 KUON HALO v3 · Curanz Sounds Production · Owner Only
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '8px 12px', background: 'rgba(0,0,0,0.2)',
      border: `1px solid ${COL.border}`, borderRadius: 8,
    }}>
      <div style={{ fontSize: 9, color: COL.textVeryDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12, color: COL.text, fontFamily: mono, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  display: 'block', width: '100%', marginTop: 4,
  padding: '6px 8px', background: 'rgba(0,0,0,0.3)',
  border: `1px solid ${COL.border}`, color: COL.text, borderRadius: 6, fontSize: 12,
  fontFamily: 'inherit',
};

function padLabel(t: keyof typeof PAD_NAMES, lang: Lang): string {
  return lang === 'ja' ? PAD_NAMES[t].ja : PAD_NAMES[t].en;
}

// Roman numeral conversion (simplified - just numeric for now, augmented later)
function romanNumeral(semi: number): string {
  const map: Record<number, string> = {
    0: 'I', 1: 'bII', 2: 'II', 3: 'bIII', 4: 'III', 5: 'IV',
    6: 'bV', 7: 'V', 8: 'bVI', 9: 'vi', 10: 'bVII', 11: 'VII',
  };
  return map[semi] ?? `${semi}`;
}

function chordSuffix(quality: string): string {
  if (quality === 'maj') return '';
  if (quality === 'min') return 'm';
  return quality;
}

// ─────────────────────────────────────────────
// Custom Builder Panel — 組み合わせ無限生成 UI
// ─────────────────────────────────────────────
type CustomBuilderPanelProps = {
  builder: BuilderState;
  setBuilder: React.Dispatch<React.SetStateAction<BuilderState>>;
  lang: Lang;
  onRandom: () => void;
};

function CustomBuilderPanel({ builder, setBuilder, lang, onRandom }: CustomBuilderPanelProps) {
  const update = <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => {
    setBuilder((b) => ({ ...b, [key]: value }));
  };

  const sectionStyle: React.CSSProperties = {
    padding: 14, borderRadius: 10, background: COL.bgCard,
    border: `1px solid ${COL.border}`, marginBottom: 10,
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10, color: COL.textDim,
    marginBottom: 4, letterSpacing: '0.05em',
  };

  return (
    <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 4 }}>
      {/* Random Generate Button */}
      <button onClick={onRandom} style={{
        width: '100%', padding: '12px 16px', borderRadius: 10,
        border: `1px solid ${COL.accent}`, background: 'transparent',
        color: COL.accent, fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
        cursor: 'pointer', letterSpacing: '0.1em', marginBottom: 12,
      }}>
        🎲 {t5({ ja: 'ランダム生成', en: 'RANDOMIZE' }, lang)}
      </button>

      {/* Title */}
      <div style={sectionStyle}>
        <label style={labelStyle}>{t5({ ja: 'タイトル', en: 'Title' }, lang)}</label>
        <input type="text" value={builder.customTitle}
          onChange={(e) => update('customTitle', e.target.value)}
          style={inputStyle} />
      </div>

      {/* 楽曲構造 */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: mono, fontSize: 10, color: COL.accent, marginBottom: 10, letterSpacing: '0.15em' }}>
          🎼 {t5({ ja: '楽曲構造', en: 'STRUCTURE' }, lang)}
        </div>

        {/* ソルフェジオ軸周波数 (チューニング廃止・これが核) */}
        <label style={labelStyle}>
          {t5({ ja: 'ソルフェジオ軸', en: 'Solfeggio Axis' }, lang)}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {SOLFEGGIO.map((s) => (
            <button key={s.hz} onClick={() => update('baseSolfeggioHz', s.hz)} style={{
              ...pillStyle(builder.baseSolfeggioHz === s.hz),
              fontSize: 10, padding: '4px 8px',
            }}
            title={lang === 'ja' ? `${s.jaName} — ${s.jaMeaning}` : `${s.name} — ${s.meaning}`}
            >{s.hz}</button>
          ))}
        </div>
        <input type="number" value={builder.baseSolfeggioHz}
          onChange={(e) => update('baseSolfeggioHz', parseFloat(e.target.value))}
          style={inputStyle} step={1} min={20} max={2000} />
        <div style={{ fontSize: 10, color: COL.textVeryDim, marginTop: 4, lineHeight: 1.5 }}>
          {(() => {
            const sf = SOLFEGGIO.find((s) => s.hz === builder.baseSolfeggioHz);
            if (!sf) return t5({ ja: 'カスタム周波数', en: 'Custom frequency' }, lang);
            return lang === 'ja' ? `${sf.jaName} — ${sf.jaEffect}` : `${sf.name} — ${sf.effect}`;
          })()}
        </div>

        <label style={{ ...labelStyle, marginTop: 12 }}>{t5({ ja: '旋法 (モード)', en: 'Mode' }, lang)}</label>
        <select value={builder.mode} onChange={(e) => update('mode', e.target.value as Mode)} style={inputStyle}>
          {MODE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 10 }}>{t5({ ja: 'コード進行', en: 'Progression' }, lang)}</label>
        <select value={builder.progressionId} onChange={(e) => update('progressionId', e.target.value)} style={inputStyle}>
          {PROGRESSIONS.map((p) => <option key={p.id} value={p.id}>{lang === 'ja' ? p.name.ja : p.name.en}</option>)}
        </select>
      </div>

      {/* レイヤー */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: mono, fontSize: 10, color: COL.accent, marginBottom: 10, letterSpacing: '0.15em' }}>
          🎹 {t5({ ja: 'レイヤー', en: 'LAYERS' }, lang)}
        </div>
        <label style={labelStyle}>{t5({ ja: 'ベース', en: 'Bass' }, lang)}</label>
        <select value={builder.bassPad} onChange={(e) => update('bassPad', e.target.value as PadType | 'none')} style={inputStyle}>
          <option value="none">{t5({ ja: 'なし', en: 'None' }, lang)}</option>
          {PAD_OPTIONS.map((p) => <option key={p} value={p}>{lang === 'ja' ? PAD_NAMES[p].ja : PAD_NAMES[p].en}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 10 }}>{t5({ ja: 'メインパッド', en: 'Main Pad' }, lang)}</label>
        <select value={builder.mainPad} onChange={(e) => update('mainPad', e.target.value as PadType)} style={inputStyle}>
          {PAD_OPTIONS.map((p) => <option key={p} value={p}>{lang === 'ja' ? PAD_NAMES[p].ja : PAD_NAMES[p].en}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 10 }}>{t5({ ja: 'シマー (高音層)', en: 'Shimmer' }, lang)}</label>
        <select value={builder.shimmerPad} onChange={(e) => update('shimmerPad', e.target.value as PadType | 'none')} style={inputStyle}>
          <option value="none">{t5({ ja: 'なし', en: 'None' }, lang)}</option>
          {PAD_OPTIONS.map((p) => <option key={p} value={p}>{lang === 'ja' ? PAD_NAMES[p].ja : PAD_NAMES[p].en}</option>)}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: COL.textDim }}>
          <input type="checkbox" checked={builder.pianoOnChange} onChange={(e) => update('pianoOnChange', e.target.checked)} />
          {t5({ ja: 'コード変化時にフェルトピアノ', en: 'Felt piano on chord change' }, lang)}
        </label>
      </div>

      {/* 空間処理 */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: mono, fontSize: 10, color: COL.accent, marginBottom: 10, letterSpacing: '0.15em' }}>
          ✨ {t5({ ja: '空間処理', en: 'AMBIENCE' }, lang)}
        </div>
        <label style={labelStyle}>{t5({ ja: 'リバーブ', en: 'Reverb' }, lang)}</label>
        <select value={builder.reverbPreset} onChange={(e) => update('reverbPreset', e.target.value as ReverbPreset)} style={inputStyle}>
          {Object.keys(REVERB_PRESETS).map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <label style={{ ...labelStyle, marginTop: 10 }}>
          {t5({ ja: 'ウェット感', en: 'Wet Mix' }, lang)} {Math.round(builder.reverbWet * 100)}%
        </label>
        <input type="range" min={0} max={100} value={Math.round(builder.reverbWet * 100)}
          onChange={(e) => update('reverbWet', parseInt(e.target.value) / 100)}
          style={{ width: '100%', accentColor: COL.accent }} />

        <label style={{ ...labelStyle, marginTop: 10 }}>{t5({ ja: 'テクスチャ', en: 'Texture' }, lang)}</label>
        <select value={builder.textureType} onChange={(e) => update('textureType', e.target.value as TextureType | 'none')} style={inputStyle}>
          <option value="none">{t5({ ja: 'なし', en: 'None' }, lang)}</option>
          <option value="water">{t5({ ja: '水', en: 'Water' }, lang)}</option>
          <option value="wind">{t5({ ja: '風', en: 'Wind' }, lang)}</option>
          <option value="cosmos">{t5({ ja: '宇宙', en: 'Cosmos' }, lang)}</option>
        </select>
      </div>

      {/* バイノーラル + ソルフェジオ */}
      <div style={sectionStyle}>
        <div style={{ fontFamily: mono, fontSize: 10, color: COL.accent, marginBottom: 10, letterSpacing: '0.15em' }}>
          🧠 {t5({ ja: 'バイノーラル', en: 'BINAURAL' }, lang)}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COL.textDim, marginBottom: 8 }}>
          <input type="checkbox" checked={builder.binauralEnabled} onChange={(e) => update('binauralEnabled', e.target.checked)} />
          {t5({ ja: 'バイノーラル有効', en: 'Enable Binaural' }, lang)}
        </label>

        <label style={labelStyle}>{t5({ ja: '脳波 (Hz)', en: 'Beat (Hz)' }, lang)}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {BRAINWAVES.map((b) => (
            <button key={b.id} onClick={() => update('binauralBeatHz', b.default)} style={{
              ...pillStyle(builder.binauralBeatHz === b.default),
              fontSize: 9, padding: '3px 7px',
            }}>{b.name}</button>
          ))}
        </div>
        <input type="number" value={builder.binauralBeatHz} step={0.5}
          onChange={(e) => update('binauralBeatHz', parseFloat(e.target.value))}
          style={inputStyle} />

        <label style={{ ...labelStyle, marginTop: 10 }}>{t5({ ja: 'ソルフェジオ (キャリア)', en: 'Solfeggio (Carrier)' }, lang)}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {SOLFEGGIO.map((s) => (
            <button key={s.hz} onClick={() => update('binauralCarrier', s.hz / 2)} style={{
              ...pillStyle(Math.abs(builder.binauralCarrier - s.hz / 2) < 1),
              fontSize: 9, padding: '3px 7px',
            }}>{s.hz}</button>
          ))}
        </div>
        <input type="number" value={builder.binauralCarrier.toFixed(1)}
          onChange={(e) => update('binauralCarrier', parseFloat(e.target.value))}
          style={inputStyle} />
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%',
  padding: '6px 8px', background: 'rgba(0,0,0,0.3)',
  border: `1px solid ${COL.border}`, color: COL.text, borderRadius: 6, fontSize: 12,
  fontFamily: 'inherit',
};

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: '4px 8px', borderRadius: 999, fontSize: 10,
    border: active ? `1px solid ${COL.accent}` : `1px solid ${COL.border}`,
    background: active ? COL.bgCardActive : 'transparent',
    color: active ? COL.accent : COL.textDim,
    cursor: 'pointer', fontWeight: active ? 700 : 400, fontFamily: 'inherit',
  };
}
