'use client';

import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

const FREQS_PREVIEW = [
  { hz: 396, color: '#7e22ce', purpose: { ja: '罪悪感解放', en: 'Release guilt', es: 'Liberar culpa' } },
  { hz: 432, color: '#0284c7', purpose: { ja: '自然調和', en: 'Natural harmony', es: 'Armonía natural' } },
  { hz: 528, color: '#16a34a', purpose: { ja: '愛・修復', en: 'Love, repair', es: 'Amor' } },
  { hz: 639, color: '#ca8a04', purpose: { ja: '人間関係', en: 'Relationships', es: 'Relaciones' } },
  { hz: 741, color: '#ea580c', purpose: { ja: '表現力', en: 'Expression', es: 'Expresión' } },
  { hz: 852, color: '#dc2626', purpose: { ja: '直感', en: 'Intuition', es: 'Intuición' } },
];

export default function FrequencyLpPage() {
  const { lang } = useLang();

  return (
    <div style={{ background: '#0c1426', color: '#e5e5e5', fontFamily: sans, minHeight: '100vh' }}>
      {/* HERO */}
      <section style={{ background: 'radial-gradient(ellipse at top, rgba(2,132,199,0.25), #0c1426 70%)', padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 4vw, 2rem) clamp(3rem, 6vw, 5rem)', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', letterSpacing: '0.2em', color: '#7dd3fc', marginBottom: '1.5rem', fontWeight: 600 }}>
            🧘 {t({ ja: 'メンタル・本番準備', en: 'MENTAL · PRE-PERFORMANCE', es: 'MENTAL · PRE-ACTUACIÓN' }, lang)}
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5.5vw, 3.5rem)', fontWeight: 300, lineHeight: 1.4, marginBottom: '1.5rem', color: '#fff' }}>
            {t({
              ja: '純粋なサイン波が、心を整える。',
              en: 'Pure sine waves to align your mind.',
              es: 'Ondas sinusoidales puras para alinear tu mente.',
            }, lang)}
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#cbd5e1', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
            {t({
              ja: '10 種類のソルフェジオ周波数を Web Audio で純粋合成。録音ファイルではなく、ブラウザが今この瞬間に生成するサイン波。バイノーラルビート機能搭載。',
              en: '10 solfeggio frequencies, synthesized live in your browser. Not recorded files — pure mathematical sine waves generated in real time. Binaural beat capable.',
              es: '10 frecuencias solfeggio sintetizadas en vivo en tu navegador. Ondas sinusoidales puras en tiempo real.',
            }, lang)}
          </p>
          <Link href="/frequency" style={{
            background: ACCENT, color: '#fff', padding: '1rem 2.25rem',
            borderRadius: 999, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500,
            letterSpacing: '0.08em', boxShadow: '0 4px 24px rgba(2,132,199,0.5)',
          }}>
            ▶ {t({ ja: '今すぐ周波数を聴く →', en: 'Listen Now →', es: 'Escuchar →' }, lang)}
          </Link>
          <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: '#64748b' }}>
            ✓ {t({ ja: '登録不要', en: 'No signup', es: 'Sin registro' }, lang)} ✓ {t({ ja: '完全無料', en: 'Free forever', es: 'Gratis siempre' }, lang)} ✓ {t({ ja: 'ファイルダウンロード不要', en: 'Zero downloads', es: 'Sin descargas' }, lang)}
          </div>
        </div>
      </section>

      {/* FREQUENCIES PREVIEW */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 300, marginBottom: '2.5rem', textAlign: 'center', color: '#fff' }}>
          {t({ ja: '10 つの周波数、それぞれに意味がある', en: '10 frequencies, each with purpose', es: '10 frecuencias con propósito' }, lang)}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
          {FREQS_PREVIEW.map((f) => (
            <div key={f.hz} style={{
              background: `radial-gradient(circle, ${f.color}22, transparent)`,
              border: `1px solid ${f.color}55`,
              borderRadius: 12, padding: '1.25rem', textAlign: 'center',
            }}>
              <div style={{ fontFamily: serif, fontSize: '1.75rem', fontWeight: 300, color: f.color, marginBottom: '0.4rem' }}>
                {f.hz} Hz
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{t(f.purpose, lang)}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
          {t({
            ja: '+ 174Hz / 285Hz / 417Hz / 963Hz の合計 10 種類',
            en: '+ 174Hz / 285Hz / 417Hz / 963Hz · 10 total',
            es: '+ 174Hz / 285Hz / 417Hz / 963Hz · 10 en total',
          }, lang)}
        </p>
      </section>

      {/* USE CASES */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 300, marginBottom: '2.5rem', textAlign: 'center', color: '#fff' }}>
            {t({ ja: 'こんなときに', en: 'Use cases', es: 'Casos de uso' }, lang)}
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { icon: '🎼', sit: { ja: '本番 5 分前のメンタルリセット', en: 'Pre-stage mental reset (5 min)', es: 'Reset mental pre-escenario' }, freq: '528 Hz' },
              { icon: '🎯', sit: { ja: '練習開始時の集中導入', en: 'Pre-practice focus', es: 'Concentración pre-práctica' }, freq: '432 Hz' },
              { icon: '🎤', sit: { ja: 'ソロ前の表現力解放', en: 'Pre-solo expression freedom', es: 'Libertad expresiva pre-solo' }, freq: '741 Hz' },
              { icon: '🎷', sit: { ja: '即興演奏前の直感活性', en: 'Pre-improvisation intuition', es: 'Intuición pre-improvisación' }, freq: '852 Hz' },
              { icon: '🎻', sit: { ja: 'アンサンブル前の調和', en: 'Pre-ensemble harmony', es: 'Armonía pre-ensemble' }, freq: '639 Hz' },
              { icon: '🌙', sit: { ja: '本番後の自己批判リセット', en: 'Post-show self-critique reset', es: 'Reset post-actuación' }, freq: '396 Hz' },
            ].map((u, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <span style={{ fontSize: '1.75rem' }}>{u.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', color: '#e5e5e5', marginBottom: '0.2rem' }}>{t(u.sit, lang)}</div>
                  <div style={{ fontSize: '0.78rem', color: '#7dd3fc', fontFamily: serif }}>{u.freq}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 4vw, 2rem)', textAlign: 'center', background: 'radial-gradient(ellipse at center, rgba(2,132,199,0.15), #0c1426)' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 300, marginBottom: '1.5rem', color: '#fff' }}>
          {t({ ja: '純粋な音は、純粋な心を呼ぶ。', en: 'Pure sound calls forth pure mind.', es: 'Sonido puro convoca mente pura.' }, lang)}
        </h2>
        <Link href="/frequency" style={{ background: ACCENT, color: '#fff', padding: '1.1rem 2.5rem', borderRadius: 999, textDecoration: 'none', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.1em', display: 'inline-block', boxShadow: '0 6px 30px rgba(2,132,199,0.5)' }}>
          ▶ {t({ ja: '今すぐ周波数を聴く →', en: 'Listen Now →', es: 'Escuchar →' }, lang)}
        </Link>
      </section>
    </div>
  );
}
