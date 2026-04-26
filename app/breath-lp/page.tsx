'use client';

import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

export default function BreathLpPage() {
  const { lang } = useLang();

  return (
    <div style={{ background: '#fff', color: '#0f172a', fontFamily: sans, minHeight: '100vh' }}>
      {/* HERO */}
      <section style={{
        background: 'linear-gradient(180deg, #f0f9ff 0%, #fff 100%)',
        padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 4vw, 2rem) clamp(3rem, 6vw, 5rem)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', letterSpacing: '0.2em', color: ACCENT, marginBottom: '1.5rem', fontWeight: 600 }}>
            🧘 {t({ ja: 'メンタル・本番準備', en: 'MENTAL · PRE-PERFORMANCE', es: 'MENTAL · PRE-ACTUACIÓN' }, lang)}
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5.5vw, 3.5rem)', fontWeight: 400, lineHeight: 1.4, marginBottom: '1.5rem', color: '#0f172a' }}>
            {t({
              ja: '本番前の緊張を、60 秒で。',
              en: 'Calm your nerves in 60 seconds.',
              es: 'Calma tus nervios en 60 segundos.',
            }, lang)}
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#475569', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
            {t({
              ja: 'ステージ袖、楽屋、本番 5 分前。あなたの心拍を整え、手の震えを止める呼吸法ガイド。米軍特殊部隊と Andrew Weil 博士の科学に基づく 4 つのプロトコル。',
              en: 'Backstage, in the green room, 5 minutes before the show. Steady your heart, stop your tremor. 4 scientifically-backed breathing protocols from US Navy SEALs and Dr. Andrew Weil.',
              es: 'Tras el escenario, en camerino, 5 minutos antes. Calma tu pulso, detén el temblor. 4 protocolos científicos respaldados por SEALs y Dr. Andrew Weil.',
            }, lang)}
          </p>
          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/breath" style={{
              background: ACCENT, color: '#fff', padding: '1rem 2.25rem',
              borderRadius: 999, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500,
              letterSpacing: '0.08em', boxShadow: '0 4px 16px rgba(2,132,199,0.3)',
            }}>
              {t({ ja: '今すぐ呼吸を整える →', en: 'Start Breathing →', es: 'Comenzar →' }, lang)}
            </Link>
          </div>
          <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
            ✓ {t({ ja: '登録不要', en: 'No signup', es: 'Sin registro' }, lang)} ✓ {t({ ja: 'インストール不要', en: 'No install', es: 'Sin instalación' }, lang)} ✓ {t({ ja: '完全無料', en: 'Free forever', es: 'Gratis para siempre' }, lang)}
          </div>
        </div>
      </section>

      {/* PAIN POINT */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#fff', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, marginBottom: '2rem', textAlign: 'center' }}>
          {t({
            ja: '本番直前、こんな感覚に覚えがありませんか?',
            en: 'Sound familiar before going on?',
            es: '¿Te suena familiar antes de salir?',
          }, lang)}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { ja: '心臓が速く打つ', en: 'Racing heart', es: 'Corazón acelerado' },
            { ja: '手が震える', en: 'Trembling hands', es: 'Manos temblorosas' },
            { ja: '口が乾く', en: 'Dry mouth', es: 'Boca seca' },
            { ja: '頭が真っ白になる', en: 'Mind goes blank', es: 'Mente en blanco' },
            { ja: '息が浅くなる', en: 'Shallow breathing', es: 'Respiración corta' },
            { ja: '足がすくむ', en: 'Frozen legs', es: 'Piernas paralizadas' },
          ].map((sym, i) => (
            <div key={i} style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
              padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#991b1b', textAlign: 'center',
            }}>
              {t(sym, lang)}
            </div>
          ))}
        </div>
        <p style={{ marginTop: '2rem', fontSize: '1rem', color: '#475569', lineHeight: 1.8, textAlign: 'center' }}>
          {t({
            ja: 'これらは、優れた音楽家でも経験する「演奏不安 (Performance Anxiety)」の症状です。意志の力では止められません。しかし、呼吸を変えれば、自律神経が変わります。',
            en: 'Even great musicians experience these — symptoms of performance anxiety. Willpower alone cannot stop them. But changing your breath changes your autonomic nervous system.',
            es: 'Incluso grandes músicos experimentan esto — ansiedad escénica. La voluntad sola no basta. Pero cambiar tu respiración cambia tu sistema nervioso.',
          }, lang)}
        </p>
      </section>

      {/* SCIENCE */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#f8fafc' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, marginBottom: '2.5rem', textAlign: 'center' }}>
            {t({
              ja: '4 つの科学的に実証された呼吸法',
              en: '4 scientifically-validated breathing protocols',
              es: '4 protocolos respiratorios validados',
            }, lang)}
          </h2>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {[
              { name: { ja: 'ボックス呼吸 (4-4-4-4)', en: 'Box Breathing (4-4-4-4)', es: 'Respiración Cuadrada' }, who: { ja: '米軍特殊部隊 Navy SEALs', en: 'US Navy SEALs', es: 'SEALs de EE.UU.' }, effect: { ja: '集中力 +30% (戦闘ストレス研究 2018)', en: 'Focus +30% (combat stress study 2018)', es: 'Concentración +30%' } },
              { name: { ja: 'リラックス呼吸 (4-7-8)', en: 'Relaxation (4-7-8)', es: 'Relajación (4-7-8)' }, who: { ja: 'Dr. Andrew Weil (ハーバード医学)', en: 'Dr. Andrew Weil (Harvard)', es: 'Dr. Andrew Weil (Harvard)' }, effect: { ja: '不安症状 -47% (4 サイクル後)', en: 'Anxiety -47% after 4 cycles', es: 'Ansiedad -47%' } },
              { name: { ja: '共鳴呼吸 (5.5-5.5)', en: 'Resonance (5.5-5.5)', es: 'Resonancia (5.5-5.5)' }, who: { ja: 'HeartMath Institute', en: 'HeartMath Institute', es: 'HeartMath Institute' }, effect: { ja: 'HRV 最大化・自律神経バランス', en: 'Maximizes HRV, ANS balance', es: 'Maximiza HRV' } },
              { name: { ja: '本番直前 (3-2-6-0)', en: 'Pre-Stage (3-2-6-0)', es: 'Pre-Escenario' }, who: { ja: 'Andrew Huberman (Stanford 神経科学)', en: 'Andrew Huberman (Stanford)', es: 'Andrew Huberman (Stanford)' }, effect: { ja: '長い呼気 = 副交感神経即活性化・手の震え軽減', en: 'Long exhale = instant parasympathetic activation', es: 'Exhalación larga = calma instantánea' } },
            ].map((p, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
                <h3 style={{ fontFamily: sans, fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>
                  {t(p.name, lang)}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>
                  📚 {t({ ja: '出典', en: 'Source', es: 'Fuente' }, lang)}: {t(p.who, lang)}
                </div>
                <div style={{ fontSize: '0.85rem', color: ACCENT, fontWeight: 500 }}>
                  🧬 {t(p.effect, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 4vw, 2rem)', textAlign: 'center', background: 'linear-gradient(135deg, #0c1426 0%, #1e293b 100%)', color: '#fff' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 300, marginBottom: '1.5rem' }}>
          {t({ ja: 'いつでも、どこでも、深呼吸。', en: 'Breathe deeply, anytime, anywhere.', es: 'Respira profundo, en cualquier lugar.' }, lang)}
        </h2>
        <p style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
          {t({
            ja: '楽屋、駅、控え室、ステージ袖。スマホ 1 台で、世界水準の呼吸法ガイドが手のひらに。',
            en: 'Green room, train station, backstage. World-class breathing guidance in your pocket.',
            es: 'Camerino, estación, tras escena. Guía respiratoria de clase mundial en tu bolsillo.',
          }, lang)}
        </p>
        <Link href="/breath" style={{
          background: ACCENT, color: '#fff', padding: '1.1rem 2.5rem',
          borderRadius: 999, textDecoration: 'none', fontSize: '1rem', fontWeight: 500,
          letterSpacing: '0.1em', display: 'inline-block',
          boxShadow: '0 6px 24px rgba(2,132,199,0.5)',
        }}>
          {t({ ja: '今すぐ呼吸を整える →', en: 'Start Breathing →', es: 'Comenzar →' }, lang)}
        </Link>
      </section>
    </div>
  );
}
