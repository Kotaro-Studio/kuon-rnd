'use client';

import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

export default function CompingLpPage() {
  const { lang } = useLang();

  return (
    <div style={{ background: '#fff', color: '#0f172a', fontFamily: sans, minHeight: '100vh' }}>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(180deg, #f0f9ff 0%, #fff 100%)', padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 4vw, 2rem) clamp(3rem, 6vw, 5rem)', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', letterSpacing: '0.2em', color: ACCENT, marginBottom: '1.5rem', fontWeight: 600 }}>
            🎚 {t({ ja: '制作・スタジオ', en: 'PRODUCTION · STUDIO', es: 'PRODUCCIÓN · ESTUDIO' }, lang)}
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5.5vw, 3.5rem)', fontWeight: 400, lineHeight: 1.4, marginBottom: '1.5rem' }}>
            {t({
              ja: '何度も録音、ベストだけを合成。',
              en: 'Record many takes. Compile the best.',
              es: 'Graba muchas tomas. Compila la mejor.',
            }, lang)}
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#475569', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
            {t({
              ja: 'プロのレコーディングスタジオで使われる「コンピング」を、ブラウザだけで完結。同じ箇所を何度でも録り直し、各セグメントごとにベストのテイクを選んで完璧な 1 トラックを合成します。Pro Tools の最も難しい機能を、30 秒で。',
              en: 'The "comping" technique used in pro recording studios — now in your browser. Re-record any passage as many times as you like, then pick the best moments from each take to assemble one perfect track. Pro Tools\' hardest feature, in 30 seconds.',
              es: 'La técnica "comping" de estudios profesionales — en tu navegador. Re-graba pasajes y elige los mejores momentos de cada toma.',
            }, lang)}
          </p>
          <Link href="/comping" style={{
            background: ACCENT, color: '#fff', padding: '1rem 2.25rem',
            borderRadius: 999, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500,
            letterSpacing: '0.08em', boxShadow: '0 4px 16px rgba(2,132,199,0.3)',
          }}>
            ⚫ {t({ ja: '今すぐ録音を始める →', en: 'Start Recording →', es: 'Comenzar →' }, lang)}
          </Link>
          <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: '#94a3b8' }}>
            ✓ {t({ ja: '無料登録のみ', en: 'Free signup only', es: 'Solo registro gratis' }, lang)}
            ✓ {t({ ja: 'インストール不要', en: 'No install', es: 'Sin instalación' }, lang)}
            ✓ {t({ ja: 'WAV エクスポート', en: 'WAV export', es: 'Exportar WAV' }, lang)}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, marginBottom: '2rem', textAlign: 'center' }}>
          {t({
            ja: 'なぜ「録音 → 編集」がこんなに大変なのか?',
            en: 'Why recording + editing is so painful',
            es: '¿Por qué grabar + editar es tan difícil?',
          }, lang)}
        </h2>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ color: '#991b1b', lineHeight: 1.8 }}>
            {t({
              ja: 'Pro Tools (¥30,000+/年)、Logic Pro (¥30,000)、Cubase (¥58,000) — どれもコンピング機能を持っていますが、UI が複雑で学習に何十時間もかかります。GarageBand は無料ですが、コンピングは限定的。Audacity は手動で切り貼りするしかありません。',
              en: 'Pro Tools, Logic Pro, Cubase all have comping — but the UI takes dozens of hours to master. GarageBand has limited comping. Audacity requires manual cut-and-paste.',
              es: 'Pro Tools, Logic Pro y Cubase tienen comping pero la UI requiere docenas de horas de estudio. GarageBand es limitado. Audacity requiere edición manual.',
            }, lang)}
          </p>
        </div>
        <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.8, textAlign: 'center', fontWeight: 500 }}>
          {t({
            ja: '→ KUON COMPING は「コンピングだけしたい」需要に 100% 応えます。',
            en: '→ KUON COMPING serves the "I just want to comp" need 100%.',
            es: '→ KUON COMPING resuelve "solo quiero comping" 100%.',
          }, lang)}
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#f8fafc', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, marginBottom: '2.5rem', textAlign: 'center' }}>
          {t({ ja: '3 ステップで完璧なテイクへ', en: '3 steps to a perfect take', es: '3 pasos para una toma perfecta' }, lang)}
        </h2>
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {[
            {
              n: '1', emoji: '⚫',
              title: { ja: '何度でも録音', en: 'Record as many times as you like', es: 'Graba cuantas veces quieras' },
              desc: { ja: 'BPM とクリックトラックに同期して 4 拍プレロール → 同じパッセージを 5 回でも 10 回でも録音。すべてが横並びで保存されます。', en: 'Sync to BPM with 4-beat preroll click. Re-record any passage 5, 10, or 20 times — all saved side-by-side.', es: 'Sincroniza con BPM. Re-graba 5, 10, 20 veces — todas guardadas en paralelo.' },
            },
            {
              n: '2', emoji: '🎯',
              title: { ja: 'セグメントごとにベストを選ぶ', en: 'Pick the best per segment', es: 'Elige la mejor por segmento' },
              desc: { ja: '時間を 8 セグメントに自動分割。各セグメントで使うテイクをワンクリックで選択。色分けで一目瞭然。', en: 'Time auto-divided into 8 segments. Pick a take per segment with one click. Color-coded for instant recognition.', es: 'Tiempo dividido en 8 segmentos. Elige una toma por segmento con un click.' },
            },
            {
              n: '3', emoji: '📥',
              title: { ja: 'WAV で書き出し', en: 'Export as WAV', es: 'Exporta como WAV' },
              desc: { ja: '10ms クロスフェードが自動適用された完璧なトラックを WAV (16bit/44.1kHz CD クオリティ) でダウンロード。', en: '10ms auto-crossfade applied. Download as WAV (16bit/44.1kHz CD quality).', es: 'Crossfade automático de 10ms. Descarga WAV calidad CD.' },
            },
          ].map((step, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ fontFamily: serif, fontSize: '2rem', color: ACCENT, fontWeight: 300, lineHeight: 1, minWidth: 40 }}>{step.n}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: sans, fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#0f172a' }}>
                  {step.emoji} {t(step.title, lang)}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.7 }}>{t(step.desc, lang)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPETITION */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, marginBottom: '2.5rem', textAlign: 'center' }}>
          {t({ ja: '他のソフトとの比較', en: 'Compared to others', es: 'Comparación' }, lang)}
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.85rem', textAlign: 'left', color: '#0f172a', fontWeight: 600 }}>{t({ ja: 'ソフト', en: 'Software', es: 'Software' }, lang)}</th>
                <th style={{ padding: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{t({ ja: '価格', en: 'Price', es: 'Precio' }, lang)}</th>
                <th style={{ padding: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{t({ ja: '学習時間', en: 'Learning curve', es: 'Curva' }, lang)}</th>
                <th style={{ padding: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{t({ ja: 'コンピング', en: 'Comping', es: 'Comping' }, lang)}</th>
              </tr>
            </thead>
            <tbody style={{ color: '#475569' }}>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '0.85rem' }}>Pro Tools</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>$300+/年</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>数十時間</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>◯</td></tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '0.85rem' }}>Logic Pro</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>¥30,000</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>数十時間</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>◯</td></tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '0.85rem' }}>GarageBand</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>{t({ ja: '無料 (Mac のみ)', en: 'Free (Mac only)', es: 'Gratis (Mac)' }, lang)}</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>{t({ ja: '数時間', en: 'Hours', es: 'Horas' }, lang)}</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>△</td></tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ padding: '0.85rem' }}>Audacity</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>{t({ ja: '無料', en: 'Free', es: 'Gratis' }, lang)}</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>{t({ ja: '数時間', en: 'Hours', es: 'Horas' }, lang)}</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>{t({ ja: '手動', en: 'Manual', es: 'Manual' }, lang)}</td></tr>
              <tr style={{ background: 'rgba(2,132,199,0.05)', borderRadius: 8 }}>
                <td style={{ padding: '0.85rem', fontWeight: 700, color: ACCENT }}>KUON COMPING</td>
                <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 600, color: ACCENT }}>{t({ ja: '無料', en: 'Free', es: 'Gratis' }, lang)}</td>
                <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 600, color: ACCENT }}>30秒</td>
                <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 600, color: ACCENT }}>◎ 特化</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#f8fafc' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, marginBottom: '2.5rem', textAlign: 'center' }}>
            {t({ ja: '主要機能', en: 'Key Features', es: 'Características' }, lang)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🎵', title: { ja: 'プレロール 4 拍 + クリック', en: 'Preroll + Click', es: 'Preroll + Click' }, desc: { ja: 'BPM 同期で全テイクが揃う', en: 'BPM-synced takes', es: 'Tomas sincronizadas' } },
              { icon: '🎨', title: { ja: '色分けセグメント', en: 'Color-coded segments', es: 'Segmentos coloreados' }, desc: { ja: 'どのテイクを選んだか一目', en: 'Instant recognition', es: 'Reconocimiento instantáneo' } },
              { icon: '🌊', title: { ja: '自動クロスフェード 10ms', en: 'Auto-crossfade 10ms', es: 'Crossfade automático' }, desc: { ja: 'クリックノイズ完全防止', en: 'No click artifacts', es: 'Sin clicks' } },
              { icon: '💾', title: { ja: 'IndexedDB ローカル保存', en: 'IndexedDB local storage', es: 'Almacenamiento local' }, desc: { ja: 'クラウド送信ゼロ・完全プライベート', en: 'Zero cloud upload', es: 'Privacidad total' } },
              { icon: '🎚', title: { ja: 'モノ/ステレオ切替', en: 'Mono/Stereo switch', es: 'Mono/Estéreo' }, desc: { ja: 'P-86S オーナー特典と相性', en: 'P-86S owner perk', es: 'P-86S compatible' } },
              { icon: '⌨', title: { ja: 'Pro Mode キーボード操作', en: 'Pro keyboard mode', es: 'Modo Pro teclado' }, desc: { ja: 'Space/R/E で爆速', en: 'Space/R/E shortcuts', es: 'Atajos teclado' } },
              { icon: '📥', title: { ja: 'WAV 16bit 書き出し', en: 'WAV 16bit export', es: 'Exportar WAV 16bit' }, desc: { ja: 'CD クオリティ・即提出可能', en: 'CD quality, ready to submit', es: 'Calidad CD' } },
              { icon: '🎓', title: { ja: '音大生・プロ向け', en: 'For students & pros', es: 'Estudiantes y pros' }, desc: { ja: '録音課題・コンクール提出に', en: 'Assignments, competitions', es: 'Tareas, concursos' } },
            ].map((f, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{f.icon}</div>
                <h3 style={{ fontFamily: sans, fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>{t(f.title, lang)}</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>{t(f.desc, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(4rem, 10vw, 8rem) clamp(1rem, 4vw, 2rem)', textAlign: 'center', background: 'linear-gradient(135deg, #0a0e1a 0%, #1e293b 100%)', color: '#fff' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 300, marginBottom: '1.5rem' }}>
          {t({
            ja: 'プロのスタジオを、あなたのブラウザに。',
            en: 'A pro studio, in your browser.',
            es: 'Un estudio profesional en tu navegador.',
          }, lang)}
        </h2>
        <p style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
          {t({
            ja: '何度でも録音、ベストだけを残す。Pro Tools が 30 年かけて確立した「コンピング」技術が、いま無料で。',
            en: 'Record many. Keep the best. The "comping" technique Pro Tools spent 30 years perfecting — now free.',
            es: 'Graba muchas. Quédate con la mejor. Comping en tu navegador.',
          }, lang)}
        </p>
        <Link href="/comping" style={{
          background: ACCENT, color: '#fff', padding: '1.1rem 2.5rem',
          borderRadius: 999, textDecoration: 'none', fontSize: '1rem', fontWeight: 500,
          letterSpacing: '0.1em', display: 'inline-block',
          boxShadow: '0 6px 30px rgba(2,132,199,0.5)',
        }}>
          ⚫ {t({ ja: '今すぐ録音を始める →', en: 'Start Recording →', es: 'Comenzar →' }, lang)}
        </Link>
      </section>
    </div>
  );
}
