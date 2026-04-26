'use client';

import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

export default function ChecklistLpPage() {
  const { lang } = useLang();

  return (
    <div style={{ background: '#fff', color: '#0f172a', fontFamily: sans, minHeight: '100vh' }}>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(180deg, #fefce8 0%, #fff 100%)', padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 4vw, 2rem) clamp(3rem, 6vw, 5rem)', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', letterSpacing: '0.2em', color: '#a16207', marginBottom: '1.5rem', fontWeight: 600 }}>
            🧘 {t({ ja: 'メンタル・本番準備', en: 'MENTAL · PRE-PERFORMANCE', es: 'MENTAL · PRE-ACTUACIÓN' }, lang)}
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5.5vw, 3.5rem)', fontWeight: 400, lineHeight: 1.4, marginBottom: '1.5rem' }}>
            {t({
              ja: '本番当日、忘れ物ゼロへ。',
              en: 'Zero forgotten items, every show.',
              es: 'Cero olvidos, en cada actuación.',
            }, lang)}
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#475569', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
            {t({
              ja: '楽器を選ぶだけで、あなた専用のチェックリストが瞬時に完成。リード、替え弦、譜面、衣装、メンタル準備まで。本番履歴の自動記録で「準備力」が育ちます。',
              en: 'Pick your instrument — get your perfect checklist instantly. Reeds, strings, scores, attire, mental prep. Auto-logged performance history grows your preparedness.',
              es: 'Elige tu instrumento — obtén tu lista perfecta al instante. Cañas, cuerdas, partituras, vestuario, preparación mental.',
            }, lang)}
          </p>
          <Link href="/checklist" style={{ background: ACCENT, color: '#fff', padding: '1rem 2.25rem', borderRadius: 999, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.08em', boxShadow: '0 4px 16px rgba(2,132,199,0.3)' }}>
            {t({ ja: 'チェックリストを開く →', en: 'Open Checklist →', es: 'Abrir Lista →' }, lang)}
          </Link>
          <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
            ✓ {t({ ja: 'メール登録のみ', en: 'Email signup only', es: 'Solo email' }, lang)} ✓ {t({ ja: '完全無料', en: 'Free', es: 'Gratis' }, lang)} ✓ {t({ ja: '5 楽器プリセット', en: '5 instrument presets', es: '5 presets' }, lang)}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#fff', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, marginBottom: '2.5rem', textAlign: 'center' }}>
          {t({ ja: '楽器ごとに、最適な準備を', en: 'Optimal prep, per instrument', es: 'Preparación óptima, por instrumento' }, lang)}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
          {[
            { emoji: '🎻', name: { ja: 'ヴァイオリン', en: 'Violin', es: 'Violín' }, items: '9' },
            { emoji: '🎹', name: { ja: 'ピアノ', en: 'Piano', es: 'Piano' }, items: '5' },
            { emoji: '🎤', name: { ja: '声楽', en: 'Vocal', es: 'Voz' }, items: '6' },
            { emoji: '🎺', name: { ja: '管楽器', en: 'Wind', es: 'Viento' }, items: '8' },
            { emoji: '🎸', name: { ja: 'ギター', en: 'Guitar', es: 'Guitarra' }, items: '7' },
          ].map((p, i) => (
            <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{p.emoji}</div>
              <div style={{ fontFamily: sans, fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{t(p.name, lang)}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem' }}>{p.items} {t({ ja: '専用項目', en: 'specific items', es: 'ítems' }, lang)} + {t({ ja: '共通10項目', en: '10 common', es: '10 común' }, lang)}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '📊', title: { ja: '完了率プログレスバー', en: 'Completion progress bar', es: 'Barra de progreso' }, desc: { ja: '達成感の視覚化で準備が習慣に', en: 'Visual achievement turns prep into habit', es: 'Visualización del logro' } },
            { icon: '📋', title: { ja: '本番履歴の自動記録', en: 'Auto-logged history', es: 'Historial automático' }, desc: { ja: '過去 50 本番までの完了率を記録', en: 'Up to 50 past performances tracked', es: 'Hasta 50 actuaciones' } },
            { icon: '➕', title: { ja: 'カスタム項目追加', en: 'Custom items', es: 'Ítems personalizados' }, desc: { ja: '会場固有の必要物も追加可能', en: 'Add venue-specific items', es: 'Agrega ítems específicos' } },
            { icon: '🧘', title: { ja: 'メンタル準備セクション', en: 'Mental prep section', es: 'Sección mental' }, desc: { ja: 'KUON BREATH と統合可能', en: 'Integrates with KUON BREATH', es: 'Se integra con KUON BREATH' } },
          ].map((f, i) => (
            <div key={i} style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <h3 style={{ fontFamily: sans, fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>{t(f.title, lang)}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>{t(f.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 4vw, 2rem)', textAlign: 'center', background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 400, marginBottom: '1.5rem', color: '#0f172a' }}>
          {t({ ja: '本番の不安を、確信に。', en: 'Turn pre-show anxiety into confidence.', es: 'De ansiedad a confianza.' }, lang)}
        </h2>
        <Link href="/checklist" style={{ background: ACCENT, color: '#fff', padding: '1.1rem 2.5rem', borderRadius: 999, textDecoration: 'none', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.1em', display: 'inline-block', boxShadow: '0 6px 24px rgba(2,132,199,0.3)' }}>
          {t({ ja: '今すぐ準備を始める →', en: 'Start Preparing →', es: 'Comenzar →' }, lang)}
        </Link>
      </section>
    </div>
  );
}
