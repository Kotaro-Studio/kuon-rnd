'use client';

// ============================================================
// KUON FREQUENCY — 純粋サイン波プレーヤー
// ============================================================
// 完全オリジナル実装 (Curanz Sounds 音源は使用しない)
// Web Audio API でブラウザ内合成・ファイル無し
//
// IQ180 心理学的フック:
// - 9 つのソルフェジオ周波数 + 432Hz
// - 場面別「目的」表示 (集中/リラックス/直感等)
// - 累計再生時間カウンター (sunk cost)
// - バイノーラル ON/OFF (微差で集中誘導)
// - 視覚的サイン波アニメーション (心理同期)
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

interface Frequency {
  hz: number;
  name: L;
  purpose: L;
  scene: L;
  color: string;
}

const FREQUENCIES: Frequency[] = [
  { hz: 174, name: { ja: '174 Hz', en: '174 Hz', es: '174 Hz' }, purpose: { ja: '基盤・安心感', en: 'Foundation, security', es: 'Fundamento' }, scene: { ja: '長旅の前・心の整え', en: 'Before long journey, grounding', es: 'Antes de viaje largo' }, color: '#1e3a8a' },
  { hz: 285, name: { ja: '285 Hz', en: '285 Hz', es: '285 Hz' }, purpose: { ja: '組織再生・修復', en: 'Tissue regeneration', es: 'Regeneración' }, scene: { ja: '練習後のクールダウン', en: 'Post-practice recovery', es: 'Recuperación' }, color: '#1e40af' },
  { hz: 396, name: { ja: '396 Hz', en: '396 Hz', es: '396 Hz' }, purpose: { ja: '罪悪感・恐怖の解放', en: 'Release guilt & fear', es: 'Liberación de culpa' }, scene: { ja: '本番後の自己批判リセット', en: 'Post-show self-critique reset', es: 'Reset post-actuación' }, color: '#7e22ce' },
  { hz: 417, name: { ja: '417 Hz', en: '417 Hz', es: '417 Hz' }, purpose: { ja: '変化を促す', en: 'Facilitate change', es: 'Facilitar cambio' }, scene: { ja: '新曲に取り組む前', en: 'Before learning new piece', es: 'Antes de pieza nueva' }, color: '#9333ea' },
  { hz: 432, name: { ja: '432 Hz', en: '432 Hz', es: '432 Hz' }, purpose: { ja: '自然調和・深い集中', en: 'Natural harmony, deep focus', es: 'Armonía natural' }, scene: { ja: '練習開始時の集中導入', en: 'Pre-practice focus', es: 'Pre-práctica' }, color: '#0284c7' },
  { hz: 528, name: { ja: '528 Hz', en: '528 Hz', es: '528 Hz' }, purpose: { ja: '愛・修復・DNA 修復', en: 'Love, repair, DNA repair', es: 'Amor, reparación' }, scene: { ja: '本番直前のメンタルリセット', en: 'Pre-stage mental reset', es: 'Pre-escenario' }, color: '#16a34a' },
  { hz: 639, name: { ja: '639 Hz', en: '639 Hz', es: '639 Hz' }, purpose: { ja: '人間関係・調和', en: 'Relationships, harmony', es: 'Relaciones' }, scene: { ja: 'アンサンブル前・共演前', en: 'Before ensemble rehearsal', es: 'Antes de ensemble' }, color: '#ca8a04' },
  { hz: 741, name: { ja: '741 Hz', en: '741 Hz', es: '741 Hz' }, purpose: { ja: '表現力・自由', en: 'Expression, freedom', es: 'Expresión' }, scene: { ja: 'ソロ演奏・即興前', en: 'Before solo or improvisation', es: 'Antes de solo' }, color: '#ea580c' },
  { hz: 852, name: { ja: '852 Hz', en: '852 Hz', es: '852 Hz' }, purpose: { ja: '直感・スピリチュアル', en: 'Intuition, spiritual', es: 'Intuición' }, scene: { ja: '即興演奏・創作活動', en: 'Improvisation, composing', es: 'Improvisación' }, color: '#dc2626' },
  { hz: 963, name: { ja: '963 Hz', en: '963 Hz', es: '963 Hz' }, purpose: { ja: '一体感・覚醒', en: 'Unity, awakening', es: 'Unidad' }, scene: { ja: '深い瞑想・宇宙との繋がり', en: 'Deep meditation, transcendence', es: 'Meditación profunda' }, color: '#9f1239' },
];

const TOTAL_TIME_KEY = 'kuon_freq_total_seconds';

export default function FrequencyPage() {
  const { lang } = useLang();
  const [freq, setFreq] = useState<Frequency>(FREQUENCIES[4]); // default 432Hz
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const [binaural, setBinaural] = useState(false);
  const [binauralOffset, setBinauralOffset] = useState(7); // Theta wave offset
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscLeftRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sessionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setTotalSeconds(parseInt(localStorage.getItem(TOTAL_TIME_KEY) || '0', 10));
  }, []);

  const stop = useCallback(() => {
    if (oscLeftRef.current) { try { oscLeftRef.current.stop(); } catch {} oscLeftRef.current = null; }
    if (oscRightRef.current) { try { oscRightRef.current.stop(); } catch {} oscRightRef.current = null; }
    if (gainRef.current) { gainRef.current.disconnect(); gainRef.current = null; }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (sessionTimerRef.current) {
      window.clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && sessionSeconds > 0) {
      const newTotal = totalSeconds + sessionSeconds;
      localStorage.setItem(TOTAL_TIME_KEY, String(newTotal));
      setTotalSeconds(newTotal);
    }
    setSessionSeconds(0);
    setPlaying(false);
  }, [sessionSeconds, totalSeconds]);

  // ピッチ変更時、再生中なら新しい周波数で再起動
  useEffect(() => {
    if (!playing || !oscLeftRef.current) return;
    const now = audioCtxRef.current?.currentTime ?? 0;
    oscLeftRef.current.frequency.setValueAtTime(freq.hz, now);
    if (oscRightRef.current) {
      oscRightRef.current.frequency.setValueAtTime(binaural ? freq.hz + binauralOffset : freq.hz, now);
    }
  }, [freq, binaural, binauralOffset, playing]);

  // 音量変更
  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(volume, audioCtxRef.current.currentTime + 0.05);
    }
  }, [volume]);

  function start() {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      const gain = ctx.createGain();

      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.value = freq.hz;
      oscR.frequency.value = binaural ? freq.hz + binauralOffset : freq.hz;
      gain.gain.value = 0;

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(gain);
      gain.connect(ctx.destination);

      oscL.start();
      oscR.start();
      // Smooth fade-in
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5);

      audioCtxRef.current = ctx;
      oscLeftRef.current = oscL;
      oscRightRef.current = oscR;
      gainRef.current = gain;
      setPlaying(true);

      // セッションタイマー開始
      sessionTimerRef.current = window.setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (oscLeftRef.current) try { oscLeftRef.current.stop(); } catch {}
      if (oscRightRef.current) try { oscRightRef.current.stop(); } catch {}
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (sessionTimerRef.current) window.clearInterval(sessionTimerRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const formatLifetimeTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h} ${t({ ja: '時間', en: 'h', es: 'h' }, lang)} ${m} ${t({ ja: '分', en: 'min', es: 'min' }, lang)}`;
    return `${m} ${t({ ja: '分', en: 'min', es: 'min' }, lang)} ${s % 60} ${t({ ja: '秒', en: 's', es: 's' }, lang)}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at top, ${freq.color}33, #0c1426 70%)`, color: '#e5e5e5', display: 'flex', flexDirection: 'column', transition: 'background 0.6s ease' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(1rem, 4vw, 2.5rem)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Link href="/frequency-lp" style={{ fontFamily: serif, fontSize: '1rem', color: '#94a3b8', textDecoration: 'none', letterSpacing: '0.1em' }}>
            ← KUON FREQUENCY
          </Link>
          <Link href="/audio-apps" style={{ fontSize: '0.78rem', color: '#64748b', textDecoration: 'none' }}>
            {t({ ja: 'すべてのアプリ', en: 'All apps', es: 'Todas' }, lang)}
          </Link>
        </header>

        {/* Lifetime stats */}
        {totalSeconds > 0 && !playing && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.85rem 1.1rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: '#cbd5e1' }}>
            🔊 {t({
              ja: `あなたは Kuon と共に ${formatLifetimeTime(totalSeconds)} 周波数に浸りました`,
              en: `You've immersed in frequencies for ${formatLifetimeTime(totalSeconds)} with Kuon`,
              es: `Has escuchado frecuencias por ${formatLifetimeTime(totalSeconds)}`,
            }, lang)}
          </div>
        )}

        {/* Frequency selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: serif, fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '0.85rem', letterSpacing: '0.08em', fontWeight: 400 }}>
            {t({ ja: '周波数を選ぶ', en: 'Select frequency', es: 'Selecciona frecuencia' }, lang)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.6rem' }}>
            {FREQUENCIES.map((f) => (
              <button
                key={f.hz}
                onClick={() => setFreq(f)}
                style={{
                  background: freq.hz === f.hz ? f.color + '33' : 'rgba(255,255,255,0.04)',
                  border: freq.hz === f.hz ? `1px solid ${f.color}` : '1px solid rgba(255,255,255,0.1)',
                  color: '#e5e5e5', padding: '0.7rem 0.6rem', borderRadius: 10,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 400, color: f.color }}>
                  {t(f.name, lang)}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem', lineHeight: 1.3 }}>
                  {t(f.purpose, lang)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected frequency info */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${freq.color}33`, borderRadius: 12, padding: '1.1rem 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: serif, fontSize: '1.5rem', color: freq.color, marginBottom: '0.4rem' }}>
            {freq.hz} Hz
          </div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
            <strong>{t({ ja: '効果', en: 'Purpose', es: 'Propósito' }, lang)}:</strong> {t(freq.purpose, lang)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            🎯 {t({ ja: '推奨シーン', en: 'Best for', es: 'Ideal para' }, lang)}: {t(freq.scene, lang)}
          </div>
        </div>

        {/* Visualizer */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, padding: '2rem 0' }}>
          <SineWaveVisualizer playing={playing} color={freq.color} freq={freq.hz} />
        </div>

        {/* Volume + binaural */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
              <span>🔉 {t({ ja: '音量', en: 'Volume', es: 'Volumen' }, lang)}</span>
              <span>{Math.round(volume * 100)}%</span>
            </label>
            <input
              type="range" min="0" max="0.5" step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: freq.color }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={binaural}
                onChange={(e) => setBinaural(e.target.checked)}
                style={{ accentColor: freq.color }}
              />
              <span>🎧 {t({ ja: 'バイノーラルビート (左右で僅差)', en: 'Binaural beat (subtle L/R offset)', es: 'Beat binaural (sutil)' }, lang)}</span>
              {binaural && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8' }}>+{binauralOffset} Hz</span>}
            </label>
            {binaural && (
              <div style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <input
                  type="range" min="2" max="20" step="1"
                  value={binauralOffset}
                  onChange={(e) => setBinauralOffset(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: freq.color }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                  <span>{t({ ja: 'デルタ (2Hz・深い瞑想)', en: 'Delta 2Hz (deep meditation)', es: 'Delta 2Hz' }, lang)}</span>
                  <span>{t({ ja: 'ガンマ (20Hz・集中)', en: 'Gamma 20Hz (focus)', es: 'Gamma 20Hz' }, lang)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Session info */}
        {playing && (
          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
            ⏱ {t({ ja: 'セッション', en: 'Session', es: 'Sesión' }, lang)}: {formatTime(sessionSeconds)}
          </div>
        )}

        {/* Play / Stop button */}
        <div style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          {!playing ? (
            <button
              onClick={start}
              style={{
                background: freq.color, color: '#fff', border: 'none',
                padding: '1rem 3rem', borderRadius: 999, fontSize: '1rem', fontWeight: 500,
                fontFamily: sans, letterSpacing: '0.1em', cursor: 'pointer',
                boxShadow: `0 4px 24px ${freq.color}66`,
              }}
            >
              ▶ {t({ ja: '再生', en: 'PLAY', es: 'REPRODUCIR' }, lang)}
            </button>
          ) : (
            <button
              onClick={stop}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#cbd5e1', border: 'none',
                padding: '0.85rem 2rem', borderRadius: 999, fontSize: '0.9rem',
                fontFamily: sans, cursor: 'pointer',
              }}
            >
              ■ {t({ ja: '停止', en: 'STOP', es: 'DETENER' }, lang)}
            </button>
          )}
        </div>

        {/* Headphone tip */}
        <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', paddingBottom: '1rem' }}>
          {t({
            ja: '💡 ヘッドホン推奨。バイノーラル効果は左右独立スピーカーが必要です。',
            en: '💡 Headphones recommended. Binaural effect requires separate L/R channels.',
            es: '💡 Auriculares recomendados.',
          }, lang)}
        </div>
      </div>
    </div>
  );
}

function SineWaveVisualizer({ playing, color, freq }: { playing: boolean; color: string; freq: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const w = cv.width;
      const h = cv.height;
      ctx.clearRect(0, 0, w, h);

      // Visualization speed scaled to frequency (slower draw than actual)
      const visualFreq = Math.log10(freq) * 1.2; // 174→2.7, 963→3.6 cycles visible
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      for (let x = 0; x < w; x++) {
        const t = x / w;
        const y = h / 2 + Math.sin(2 * Math.PI * visualFreq * t + phaseRef.current) * (h / 3);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow effect
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
      ctx.stroke();
      ctx.shadowBlur = 0;

      phaseRef.current += 0.04;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, color, freq]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={140}
      style={{
        width: '100%', maxWidth: 600, height: 140,
        opacity: playing ? 1 : 0.2,
        transition: 'opacity 0.5s ease',
      }}
    />
  );
}
