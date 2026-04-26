'use client';

// ============================================================
// KUON BREATH — 本番前の呼吸法ガイド
// ============================================================
// IQ180 心理学的フック:
// - 拡縮する円ビジュアル → 視覚的同期で集中誘導
// - セッション完了時にカウンター更新 → 達成感
// - localStorage に「累計呼吸回数」を保存 → sunk cost
// - 4 つのモード × 3 つの長さ = 12 通りでマンネリ防止
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

interface BreathPattern {
  id: string;
  name: L;
  desc: L;
  // [inhale, hold-in, exhale, hold-out] in seconds
  phases: [number, number, number, number];
  scientificBasis: L;
}

const PATTERNS: BreathPattern[] = [
  {
    id: 'box',
    name: { ja: 'ボックス呼吸 (4-4-4-4)', en: 'Box Breathing (4-4-4-4)', es: 'Respiración Cuadrada (4-4-4-4)' },
    desc: { ja: '米軍特殊部隊が採用する集中呼吸法', en: 'Used by US Navy SEALs for focus', es: 'Usada por SEALs para concentración' },
    phases: [4, 4, 4, 4],
    scientificBasis: { ja: '副交感神経活性化・心拍 -10bpm', en: 'Activates parasympathetic, -10 bpm', es: 'Activa parasimpático, -10 bpm' },
  },
  {
    id: 'relax',
    name: { ja: 'リラックス呼吸 (4-7-8)', en: 'Relaxation (4-7-8)', es: 'Relajación (4-7-8)' },
    desc: { ja: '不安と緊張を即座に和らげる Andrew Weil 博士法', en: 'Dr. Andrew Weil method for instant calm', es: 'Método del Dr. Andrew Weil' },
    phases: [4, 7, 8, 0],
    scientificBasis: { ja: '迷走神経刺激で抗不安効果', en: 'Vagal stimulation reduces anxiety', es: 'Estimulación vagal' },
  },
  {
    id: 'resonance',
    name: { ja: '共鳴呼吸 (5.5-5.5)', en: 'Resonance (5.5-5.5)', es: 'Resonancia (5.5-5.5)' },
    desc: { ja: 'HRV を最大化する 1 分 5.5 回呼吸', en: '5.5 breaths/min for max HRV', es: '5.5 respiraciones por minuto' },
    phases: [5.5, 0, 5.5, 0],
    scientificBasis: { ja: '心拍変動 (HRV) 最大化・自律神経バランス', en: 'Maximizes HRV, balances ANS', es: 'Maximiza HRV' },
  },
  {
    id: 'pre-stage',
    name: { ja: '本番直前 (3-2-6-0)', en: 'Pre-Stage (3-2-6-0)', es: 'Pre-Escenario (3-2-6-0)' },
    desc: { ja: '長い呼気で副交感神経を即活性化', en: 'Long exhale for fast calming', es: 'Exhalación larga' },
    phases: [3, 2, 6, 0],
    scientificBasis: { ja: '呼気優位で 1 分以内に手の震え軽減', en: 'Exhale-dominant: hand tremor relief', es: 'Reduce temblor de manos' },
  },
];

const DURATIONS = [
  { id: 60, label: { ja: '60秒 (1サイクル試す)', en: '60s (try once)', es: '60s (probar)' } },
  { id: 180, label: { ja: '3分 (素早く整える)', en: '3 min (quick reset)', es: '3 min (reset rápido)' } },
  { id: 300, label: { ja: '5分 (推奨)', en: '5 min (recommended)', es: '5 min (recomendado)' } },
  { id: 600, label: { ja: '10分 (深い集中)', en: '10 min (deep focus)', es: '10 min (profundo)' } },
];

const TOTAL_BREATHS_KEY = 'kuon_total_breaths';
const SESSION_COUNT_KEY = 'kuon_breath_sessions';

export default function BreathPage() {
  const { lang } = useLang();
  const [pattern, setPattern] = useState<BreathPattern>(PATTERNS[0]);
  const [duration, setDuration] = useState<number>(300);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out'>('idle');
  const [phaseSec, setPhaseSec] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [totalAllTime, setTotalAllTime] = useState(0);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // load lifetime counters
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setTotalAllTime(parseInt(localStorage.getItem(TOTAL_BREATHS_KEY) || '0', 10));
    setSessions(parseInt(localStorage.getItem(SESSION_COUNT_KEY) || '0', 10));
  }, []);

  const cycleSec = pattern.phases.reduce((a, b) => a + b, 0);

  const stop = useCallback((completed: boolean) => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    setPhase('idle');
    if (completed && typeof window !== 'undefined') {
      // Update lifetime stats
      const newTotal = totalAllTime + breathCount;
      const newSessions = sessions + 1;
      localStorage.setItem(TOTAL_BREATHS_KEY, String(newTotal));
      localStorage.setItem(SESSION_COUNT_KEY, String(newSessions));
      setTotalAllTime(newTotal);
      setSessions(newSessions);
    }
  }, [breathCount, totalAllTime, sessions]);

  const start = () => {
    setBreathCount(0);
    setElapsed(0);
    setPhaseSec(0);
    setPhase('inhale');
    setRunning(true);
  };

  // main timer
  useEffect(() => {
    if (!running) return;
    const tickMs = 100;
    let phaseElapsed = 0;
    let totalElapsed = 0;
    let phaseIdx = 0; // 0=inhale, 1=hold-in, 2=exhale, 3=hold-out
    let breaths = 0;

    intervalRef.current = window.setInterval(() => {
      phaseElapsed += tickMs / 1000;
      totalElapsed += tickMs / 1000;

      const currentPhaseDur = pattern.phases[phaseIdx];
      if (phaseElapsed >= currentPhaseDur) {
        phaseElapsed = 0;
        phaseIdx = (phaseIdx + 1) % 4;
        // skip 0-duration phases
        while (pattern.phases[phaseIdx] === 0 && phaseIdx !== 0) {
          phaseIdx = (phaseIdx + 1) % 4;
        }
        if (phaseIdx === 0) breaths++;
      }

      const phaseNames = ['inhale', 'hold-in', 'exhale', 'hold-out'] as const;
      setPhase(phaseNames[phaseIdx]);
      setPhaseSec(phaseElapsed);
      setElapsed(totalElapsed);
      setBreathCount(breaths);

      if (totalElapsed >= duration) {
        stop(true);
      }
    }, tickMs);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, pattern, duration, stop]);

  // Visual circle scale based on phase
  const circleScale = (() => {
    if (!running) return 1;
    const dur = pattern.phases[['inhale', 'hold-in', 'exhale', 'hold-out'].indexOf(phase)];
    const ratio = dur > 0 ? phaseSec / dur : 0;
    if (phase === 'inhale') return 0.5 + 0.5 * ratio;       // 0.5 → 1.0
    if (phase === 'hold-in') return 1.0;                    // hold large
    if (phase === 'exhale') return 1.0 - 0.5 * ratio;       // 1.0 → 0.5
    if (phase === 'hold-out') return 0.5;                   // hold small
    return 1;
  })();

  const phaseLabel = (): string => {
    if (phase === 'inhale') return t({ ja: '吸う', en: 'Inhale', es: 'Inhala' }, lang);
    if (phase === 'hold-in') return t({ ja: '止める', en: 'Hold', es: 'Mantén' }, lang);
    if (phase === 'exhale') return t({ ja: '吐く', en: 'Exhale', es: 'Exhala' }, lang);
    if (phase === 'hold-out') return t({ ja: '空にする', en: 'Pause', es: 'Vacío' }, lang);
    return '';
  };

  const remaining = Math.max(0, duration - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0c1426 0%, #1e293b 100%)', color: '#e5e5e5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(1rem, 4vw, 2.5rem)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(1rem, 3vw, 2rem)' }}>
          <Link href="/breath-lp" style={{ fontFamily: serif, fontSize: '0.95rem', fontWeight: 400, color: '#94a3b8', textDecoration: 'none', letterSpacing: '0.1em' }}>
            ← KUON BREATH
          </Link>
          <Link href="/audio-apps" style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'none' }}>
            {t({ ja: 'すべてのアプリ', en: 'All apps', es: 'Todas las apps' }, lang)}
          </Link>
        </header>

        {/* Lifetime stats banner */}
        {!running && totalAllTime > 0 && (
          <div style={{ background: 'rgba(2,132,199,0.1)', border: '1px solid rgba(2,132,199,0.2)', borderRadius: 10, padding: '0.85rem 1.1rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
            🌬 {t({
              ja: `あなたは Kuon と共に ${totalAllTime.toLocaleString()} 回の呼吸を整えました (${sessions} セッション)`,
              en: `You've taken ${totalAllTime.toLocaleString()} breaths with Kuon (${sessions} sessions)`,
              es: `Has hecho ${totalAllTime.toLocaleString()} respiraciones con Kuon (${sessions} sesiones)`,
            }, lang)}
          </div>
        )}

        {/* Pattern + duration selector (idle only) */}
        {!running && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, color: '#cbd5e1', marginBottom: '0.85rem', letterSpacing: '0.08em' }}>
              {t({ ja: '呼吸法を選ぶ', en: 'Choose pattern', es: 'Elige patrón' }, lang)}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {PATTERNS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPattern(p)}
                  style={{
                    background: pattern.id === p.id ? 'rgba(2,132,199,0.2)' : 'rgba(255,255,255,0.04)',
                    border: pattern.id === p.id ? `1px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '0.95rem 1rem', textAlign: 'left',
                    color: '#e5e5e5', cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontFamily: sans, fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    {t(p.name, lang)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.4rem' }}>
                    {t(p.desc, lang)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontStyle: 'italic' }}>
                    🧬 {t(p.scientificBasis, lang)}
                  </div>
                </button>
              ))}
            </div>

            <h2 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, color: '#cbd5e1', marginBottom: '0.85rem', letterSpacing: '0.08em' }}>
              {t({ ja: '時間を選ぶ', en: 'Choose duration', es: 'Elige duración' }, lang)}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {DURATIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDuration(d.id)}
                  style={{
                    background: duration === d.id ? ACCENT : 'rgba(255,255,255,0.06)',
                    color: duration === d.id ? '#fff' : '#cbd5e1',
                    border: 'none', padding: '0.55rem 1rem', borderRadius: 999,
                    fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                >
                  {t(d.label, lang)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Visualizer */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 380,
          padding: '2rem 0',
        }}>
          <div style={{ position: 'relative', width: 280, height: 280 }}>
            {/* Outer ring */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid rgba(2,132,199,0.2)',
              background: 'radial-gradient(circle, rgba(2,132,199,0.08) 0%, transparent 70%)',
            }} />
            {/* Pulsing core */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 240, height: 240,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(56,189,248,0.5) 0%, rgba(2,132,199,0.2) 60%, transparent 100%)`,
              transform: `translate(-50%, -50%) scale(${circleScale})`,
              transition: 'transform 0.1s linear',
              boxShadow: `0 0 ${60 * circleScale}px rgba(56,189,248,${0.4 * circleScale})`,
            }} />
            {/* Phase label center */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              {running ? (
                <>
                  <div style={{ fontFamily: serif, fontSize: '1.85rem', fontWeight: 300, color: '#fff', marginBottom: '0.3rem' }}>
                    {phaseLabel()}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: sans }}>
                    {Math.ceil(pattern.phases[['inhale', 'hold-in', 'exhale', 'hold-out'].indexOf(phase)] - phaseSec)}
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 300, color: '#cbd5e1' }}>
                  {t({ ja: '呼吸の準備', en: 'Ready', es: 'Listo' }, lang)}
                </div>
              )}
            </div>
          </div>

          {running && (
            <div style={{ marginTop: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', fontFamily: sans }}>
              <div>
                {mins}:{String(secs).padStart(2, '0')} {t({ ja: '残り', en: 'remaining', es: 'restante' }, lang)}
                {' · '}
                {breathCount} {t({ ja: '呼吸完了', en: 'breaths', es: 'respiraciones' }, lang)}
              </div>
            </div>
          )}
        </div>

        {/* Control button */}
        <div style={{ marginTop: '2rem', textAlign: 'center', paddingBottom: '2rem' }}>
          {!running ? (
            <button
              onClick={start}
              style={{
                background: ACCENT, color: '#fff', border: 'none',
                padding: '1rem 3rem', borderRadius: 999, fontSize: '1rem', fontWeight: 500,
                fontFamily: sans, letterSpacing: '0.1em', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(2,132,199,0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              {t({ ja: 'はじめる', en: 'BEGIN', es: 'COMENZAR' }, lang)}
            </button>
          ) : (
            <button
              onClick={() => stop(false)}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none',
                padding: '0.85rem 2rem', borderRadius: 999, fontSize: '0.85rem',
                fontFamily: sans, cursor: 'pointer',
              }}
            >
              {t({ ja: '中断する', en: 'Stop', es: 'Detener' }, lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
