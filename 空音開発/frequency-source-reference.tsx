'use client';

// ============================================================
// KUON FREQUENCY — 純粋サイン波プレーヤー
// ============================================================
// 完全オリジナル実装 (Curanz Sounds 音源は使用しない)
// Web Audio API でブラウザ内合成・ファイル無し
//
// このファイルは Curanz Sounds 移植のためのリファレンス資料です。
// 元ファイル: /Users/kotaro/kuon-rnd/app/frequency/page.tsx
// 移植仕様書: ./frequency-port-to-curanz.md
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
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.5);

      audioCtxRef.current = ctx;
      oscLeftRef.current = oscL;
      oscRightRef.current = oscR;
      gainRef.current = gain;
      setPlaying(true);

      sessionTimerRef.current = window.setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  }

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
        {/* ヘッダー・ライフタイム統計・周波数選択・選択中情報・ビジュアライザー・コントロール・PLAY/STOP は移植仕様書 §3 を参照 */}
        {/* バイノーラル チェックボックス + offset スライダー の核心 UI: */}
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

        {/* ヘッドホン推奨表示 */}
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

// 注: このリファレンスファイルは抜粋です。
// 完全な実装 (フル UI / SineWaveVisualizer 含む) は元ファイルを参照:
// /Users/kotaro/kuon-rnd/app/frequency/page.tsx
//
// 移植時の手順は同フォルダの frequency-port-to-curanz.md を参照してください。
