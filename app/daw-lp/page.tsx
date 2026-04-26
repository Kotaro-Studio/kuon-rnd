'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#e8b8a0'; // ローズゴールド (DAW テーマと一致)

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

const JEWELS = [
  { name: 'Sapphire',  hex: '#0ea5e9' },
  { name: 'Emerald',   hex: '#10b981' },
  { name: 'Amethyst',  hex: '#a855f7' },
  { name: 'Gold',      hex: '#f59e0b' },
];

export default function DawLpPage() {
  const { lang } = useLang();
  const [mockTheme, setMockTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div style={{ fontFamily: sans, color: '#0f172a', background: '#fff', minHeight: '100vh', overflow: 'hidden' }}>
      {/* ═════════ HERO ═════════ */}
      <section style={{
        background: 'linear-gradient(180deg, #0a1226 0%, #1a2742 50%, #0a1226 100%)',
        color: '#fff',
        padding: 'clamp(5rem, 12vw, 10rem) clamp(1rem, 4vw, 2rem) clamp(4rem, 8vw, 7rem)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 装飾の宝石グラデ */}
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, #0ea5e955, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 350, height: 350, background: 'radial-gradient(circle, #a855f755, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 'clamp(0.7rem, 1.4vw, 0.85rem)', letterSpacing: '0.25em', color: ACCENT, marginBottom: '1.5rem', fontWeight: 600 }}>
            🎚 {t({ ja: 'KUON DAW · 制作・スタジオ', en: 'KUON DAW · STUDIO', es: 'KUON DAW · ESTUDIO' }, lang)}
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: 'clamp(2.2rem, 6.5vw, 4.5rem)',
            fontWeight: 300, lineHeight: 1.3, marginBottom: '1.5rem', color: '#fff',
            letterSpacing: '0.02em',
          }}>
            {t({
              ja: 'あなたのブラウザに、\nスタジオが届く日。',
              en: 'A studio,\ndelivered to your browser.',
              es: 'Un estudio\nen tu navegador.',
            }, lang).split('\n').map((line, i) => (<span key={i} style={{ display: 'block' }}>{line}</span>))}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#cbd5e1', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 700, margin: '0 auto 2.5rem' }}>
            {t({
              ja: '歌ってみたから配信マスターまで、ひとつのブラウザで完結。最大 4 トラック、24-bit 録音、Spotify / Apple Music 基準のラウドネス書き出し。インストールも、月額料金も、必要ありません。',
              en: 'From cover song to release master — all in one browser. 4 tracks, 24-bit recording, Spotify/Apple Music loudness export. No install, no subscription, no friction.',
              es: 'Desde cover hasta máster de lanzamiento, todo en tu navegador. 4 pistas, grabación 24-bit, exportación a loudness Spotify/Apple Music.',
            }, lang)}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <Link href="/daw" style={{
              background: ACCENT, color: '#0a1226',
              padding: '1.1rem 2.5rem', borderRadius: 999,
              textDecoration: 'none', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.08em',
              boxShadow: '0 8px 32px rgba(232,184,160,0.4)',
              transition: 'transform 0.2s ease',
            }}>
              ▶ {t({ ja: '今すぐスタジオを開く', en: 'Open Studio Now', es: 'Abrir Estudio' }, lang)}
            </Link>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span>✓ {t({ ja: '完全無料', en: 'Free forever', es: 'Gratis' }, lang)}</span>
            <span>✓ {t({ ja: 'メール登録のみ', en: 'Email signup only', es: 'Solo email' }, lang)}</span>
            <span>✓ {t({ ja: 'インストール不要', en: 'No install', es: 'Sin instalar' }, lang)}</span>
            <span>✓ {t({ ja: 'クラウド送信なし', en: 'No cloud upload', es: 'Sin subida' }, lang)}</span>
          </div>
        </div>
      </section>

      {/* ═════════ SOCIAL PROOF ═════════ */}
      <section style={{ padding: '2.5rem 1rem', background: '#fafaf7', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', letterSpacing: '0.15em', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>
            {t({ ja: 'こんな方が使っています', en: 'Built for', es: 'Diseñado para' }, lang)}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#475569' }}>
            <span>🎤 {t({ ja: '歌ってみた配信者', en: 'Cover song creators', es: 'Creadores cover' }, lang)}</span>
            <span>🎻 {t({ ja: '音大生・クラシック演奏家', en: 'Music students & classical players', es: 'Estudiantes música' }, lang)}</span>
            <span>🎙 {t({ ja: 'ワンポイント録音エンジニア', en: 'One-point recording engineers', es: 'Ingenieros un-punto' }, lang)}</span>
            <span>🎧 {t({ ja: 'ポッドキャスター', en: 'Podcasters', es: 'Podcasters' }, lang)}</span>
          </div>
        </div>
      </section>

      {/* ═════════ FEATURE SHOWCASE — 宝石パレット ═════════ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: '#b8755a', marginBottom: '0.75rem', fontWeight: 600 }}>
              {t({ ja: '空音オリジナル', en: 'KUON ORIGINAL', es: 'KUON ORIGINAL' }, lang)}
            </div>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 300, marginBottom: '1rem', color: '#0a1226' }}>
              {t({ ja: '4 つの宝石、4 つのトラック', en: 'Four jewels, four tracks', es: 'Cuatro joyas, cuatro pistas' }, lang)}
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
              {t({
                ja: 'サファイア・エメラルド・アメジスト・ゴールド。それぞれのトラックに固有の宝石色を。',
                en: 'Sapphire, Emerald, Amethyst, Gold. Each track gets its own jewel.',
                es: 'Zafiro, Esmeralda, Amatista, Oro. Cada pista tiene su joya.',
              }, lang)}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {JEWELS.map((j, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${j.hex}11, ${j.hex}33)`,
                border: `1px solid ${j.hex}44`,
                borderRadius: 16, padding: '1.5rem',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: j.hex, marginBottom: '0.85rem', boxShadow: `0 4px 16px ${j.hex}66` }} />
                <div style={{ fontFamily: serif, fontSize: '1.2rem', fontWeight: 400, color: '#0a1226', marginBottom: '0.3rem' }}>
                  {j.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                  Track {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ THEME TOGGLE DEMO ═════════ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#0a1226', color: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 300, marginBottom: '1rem' }}>
              {t({ ja: 'あなたの気分に、合わせて変わる。', en: 'Adapts to your mood.', es: 'Se adapta a tu humor.' }, lang)}
            </h2>
            <p style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '2rem' }}>
              {t({ ja: '深夜の集中作業はダーク、朝のミックスはライト。ワンタップで切替。', en: 'Dark for late-night focus, Light for morning mixing. Toggle in one tap.', es: 'Oscuro para noches, claro para mañanas. Un toque.' }, lang)}
            </p>
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', borderRadius: 999, padding: 4, border: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={() => setMockTheme('dark')}
                style={{ background: mockTheme === 'dark' ? ACCENT : 'transparent', color: mockTheme === 'dark' ? '#0a1226' : '#cbd5e1', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 999, cursor: 'pointer', fontSize: '0.85rem' }}>
                🌙 Dark
              </button>
              <button onClick={() => setMockTheme('light')}
                style={{ background: mockTheme === 'light' ? ACCENT : 'transparent', color: mockTheme === 'light' ? '#0a1226' : '#cbd5e1', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 999, cursor: 'pointer', fontSize: '0.85rem' }}>
                ☀ Light
              </button>
            </div>
          </div>
          {/* Mock UI window */}
          <div style={{
            background: mockTheme === 'dark' ? 'linear-gradient(135deg, #0a1226 0%, #1a2742 100%)' : 'linear-gradient(135deg, #fafaf7 0%, #f0e9e0 100%)',
            border: mockTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(10,18,38,0.1)',
            borderRadius: 14, padding: '1.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            transition: 'all 0.4s ease',
          }}>
            {/* Mock header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: serif, fontSize: '1rem', color: mockTheme === 'dark' ? '#f8fafc' : '#0a1226', letterSpacing: '0.15em' }}>KUON DAW</span>
              <span style={{ fontSize: '0.7rem', color: mockTheme === 'dark' ? '#94a3b8' : '#64748b' }}>Untitled · 80 BPM · 44.1 kHz</span>
            </div>
            {/* Mock tracks */}
            {JEWELS.slice(0, 3).map((j, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, background: mockTheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)', borderRadius: 8, padding: 6, borderLeft: `4px solid ${j.hex}` }}>
                <div style={{ width: 90, fontSize: '0.7rem', color: mockTheme === 'dark' ? '#cbd5e1' : '#475569' }}>Track {i + 1}</div>
                <div style={{ flex: 1, height: 32, background: `linear-gradient(180deg, ${j.hex}cc, ${j.hex}88)`, borderRadius: 4, position: 'relative' }}>
                  {/* fake waveform peaks */}
                  {Array.from({ length: 40 }).map((_, k) => (
                    <div key={k} style={{ position: 'absolute', left: `${(k / 40) * 100}%`, top: '20%', width: 1, height: `${20 + Math.sin(k * 0.7 + i) * 30 + Math.random() * 20}%`, background: 'rgba(255,255,255,0.6)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ FEATURES (full list) ═════════ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 300, marginBottom: '3rem', textAlign: 'center', color: '#0a1226' }}>
            {t({ ja: 'プロが必要とする、すべて。', en: 'Everything a pro needs.', es: 'Todo lo que un pro necesita.' }, lang)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {[
              { ic: '🎙', title: { ja: '24/32-bit 録音', en: '24/32-bit Recording', es: 'Grabación 24/32-bit' }, desc: { ja: '44.1k / 48k / 96kHz × 16/24/32-bit float', en: '44.1k/48k/96kHz × 16/24/32-bit float', es: '44.1k/48k/96kHz × 16/24/32-bit' } },
              { ic: '🎚', title: { ja: 'マルチトラック', en: 'Multi-track', es: 'Multipista' }, desc: { ja: '1-4 トラック・モノ/ステレオ切替', en: '1-4 tracks · mono/stereo switch', es: '1-4 pistas · mono/estéreo' } },
              { ic: '✂', title: { ja: '波形編集', en: 'Waveform Editing', es: 'Edición forma de onda' }, desc: { ja: 'カット・分割・トリム・移動・フェード', en: 'Cut, split, trim, move, fade', es: 'Cortar, dividir, recortar, mover' } },
              { ic: '🌊', title: { ja: '自動クロスフェード', en: 'Auto Crossfade', es: 'Crossfade automático' }, desc: { ja: 'リージョン重複時にスムーズに', en: 'Smooth on region overlap', es: 'Suave en superposición' } },
              { ic: '📊', title: { ja: 'LUFS マスタリング', en: 'LUFS Mastering', es: 'Masterización LUFS' }, desc: { ja: 'Spotify -14 / Apple -16 / EBU -23', en: 'Spotify -14 / Apple -16 / EBU -23', es: 'Spotify -14 / Apple -16' } },
              { ic: '🛡', title: { ja: 'True-Peak Limiter', en: 'True-Peak Limiter', es: 'True-Peak Limiter' }, desc: { ja: '-1 dBTP・配信プラットフォーム保護', en: '-1 dBTP · platform-safe', es: '-1 dBTP · plataforma' } },
              { ic: '📥', title: { ja: 'WAV/MP3 書き出し', en: 'WAV/MP3 Export', es: 'Export WAV/MP3' }, desc: { ja: 'WAV 16/24/32-bit · MP3 192/320kbps', en: 'WAV 16/24/32-bit · MP3 192/320', es: 'WAV 16/24/32-bit · MP3 192/320' } },
              { ic: '🔒', title: { ja: 'ローカル完結', en: 'Local-only', es: 'Solo local' }, desc: { ja: 'IndexedDB 保存・クラウド送信ゼロ', en: 'IndexedDB saves · zero cloud', es: 'IndexedDB · cero nube' } },
            ].map((f, i) => (
              <div key={i} style={{ padding: '1.5rem', borderRadius: 12, background: '#fafaf7', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.85rem', marginBottom: '0.6rem' }}>{f.ic}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0a1226', marginBottom: '0.4rem' }}>{t(f.title, lang)}</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>{t(f.desc, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ COMPARISON ═════════ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#fafaf7' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 300, marginBottom: '2.5rem', textAlign: 'center', color: '#0a1226' }}>
            {t({ ja: 'なぜ KUON DAW なのか?', en: 'Why KUON DAW?', es: '¿Por qué KUON DAW?' }, lang)}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '0.85rem', textAlign: 'left', color: '#0a1226', fontWeight: 600 }}>{t({ ja: 'ソフト', en: 'Software', es: 'Software' }, lang)}</th>
                  <th style={{ padding: '0.85rem', color: '#0a1226' }}>{t({ ja: '価格', en: 'Price', es: 'Precio' }, lang)}</th>
                  <th style={{ padding: '0.85rem', color: '#0a1226' }}>{t({ ja: 'プラットフォーム', en: 'Platform', es: 'Plataforma' }, lang)}</th>
                  <th style={{ padding: '0.85rem', color: '#0a1226' }}>{t({ ja: 'インストール', en: 'Install', es: 'Instalar' }, lang)}</th>
                  <th style={{ padding: '0.85rem', color: '#0a1226' }}>LUFS</th>
                </tr>
              </thead>
              <tbody style={{ color: '#475569' }}>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '0.85rem' }}>Pro Tools</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>$300+/年</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>Mac/Win</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>必要</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>◯ (拡張)</td></tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '0.85rem' }}>Logic Pro</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>¥30,000</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>Mac のみ</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>必要</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>◯</td></tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '0.85rem' }}>GarageBand</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>{t({ ja: '無料', en: 'Free', es: 'Gratis' }, lang)}</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>Mac/iOS</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>必要</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>△</td></tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '0.85rem' }}>Audacity</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>{t({ ja: '無料', en: 'Free', es: 'Gratis' }, lang)}</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>Mac/Win/Linux</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>必要</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>◯</td></tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}><td style={{ padding: '0.85rem' }}>Soundtrap</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>$11.99/月</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>{t({ ja: 'ブラウザ', en: 'Browser', es: 'Navegador' }, lang)}</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>{t({ ja: '不要', en: 'No', es: 'No' }, lang)}</td><td style={{ padding: '0.85rem', textAlign: 'center' }}>×</td></tr>
                <tr style={{ background: 'rgba(232,184,160,0.15)', borderRadius: 8 }}>
                  <td style={{ padding: '0.85rem', fontWeight: 700, color: '#b8755a' }}>KUON DAW</td>
                  <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 700, color: '#b8755a' }}>{t({ ja: '完全無料', en: 'Free', es: 'Gratis' }, lang)}</td>
                  <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 700, color: '#b8755a' }}>{t({ ja: 'すべて', en: 'All', es: 'Todo' }, lang)}</td>
                  <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 700, color: '#b8755a' }}>{t({ ja: '不要', en: 'No', es: 'No' }, lang)}</td>
                  <td style={{ padding: '0.85rem', textAlign: 'center', fontWeight: 700, color: '#b8755a' }}>◎ 標準</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═════════ FOUNDER STATEMENT ═════════ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <blockquote style={{
            margin: 0, padding: 'clamp(2rem, 5vw, 3rem)',
            background: 'linear-gradient(135deg, #fafaf7 0%, #f0e9e0 100%)',
            borderRadius: 16, borderLeft: `4px solid ${ACCENT}`,
            position: 'relative',
          }}>
            <p style={{ fontFamily: serif, fontSize: 'clamp(1.05rem, 2.2vw, 1.4rem)', color: '#0a1226', lineHeight: 1.9, marginBottom: '1.5rem', fontStyle: 'italic' }}>
              {t({
                ja: '「録った音は、録ったままに。\nそれを美しく整える、それだけでいい。\nワンポイント録音の哲学を、現代のブラウザに。」',
                en: '"What was recorded, stays recorded.\nWe just make it beautiful.\nOne-point recording philosophy, in the modern browser."',
                es: '"Lo grabado, se queda grabado.\nSolo lo hacemos bello.\nFilosofía de grabación de un punto, en el navegador moderno."',
              }, lang).split('\n').map((l, i) => <span key={i} style={{ display: 'block' }}>{l}</span>)}
            </p>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              — 朝比奈幸太郎 (Kotaro Asahina)
              <br />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t({ ja: '空音開発代表 / プロ音響エンジニア / P-86S 設計者', en: 'Kuon R&D Founder / Audio Engineer / P-86S Designer', es: 'Kuon R&D Fundador' }, lang)}</span>
            </div>
          </blockquote>
        </div>
      </section>

      {/* ═════════ FAQ ═════════ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)', background: '#fafaf7' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 300, marginBottom: '2.5rem', textAlign: 'center', color: '#0a1226' }}>
            {t({ ja: 'よくある質問', en: 'FAQ', es: 'Preguntas Frecuentes' }, lang)}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { q: { ja: '本当に完全無料?', en: 'Really 100% free?', es: '¿100% gratis?' }, a: { ja: 'はい。メール登録のみで、隠れた課金や容量制限はありません。', en: 'Yes. Email signup only, no hidden charges, no storage limits.', es: 'Sí. Solo email, sin cargos ocultos.' } },
              { q: { ja: 'プラグイン (VST) は使える?', en: 'Can I use VST plugins?', es: '¿Puedo usar VST?' }, a: { ja: 'いいえ。ブラウザの制約上、VST/AU プラグインは読み込めません。代わりに、安定した内蔵 LUFS マスタリング・True Peak リミッターを提供しています。', en: 'No. Browser limitation. We provide built-in LUFS mastering & True Peak limiter instead.', es: 'No. Limitación de navegador. Proporcionamos masterización LUFS interna.' } },
              { q: { ja: '同時に何トラック録音できますか?', en: 'How many tracks at once?', es: '¿Cuántas pistas?' }, a: { ja: '最大 4 トラックまで。歌ってみたなら 2 トラック (カラオケ + ボーカル) で十分です。', en: 'Up to 4 tracks. For cover songs, 2 tracks (karaoke + vocal) is enough.', es: 'Hasta 4 pistas. Para covers, 2 son suficientes.' } },
              { q: { ja: '録音データはクラウドに送られる?', en: 'Is data sent to cloud?', es: '¿Datos a la nube?' }, a: { ja: 'いいえ。すべてブラウザの IndexedDB に保存されます。プライバシー完全保護。', en: 'No. Everything stays in your browser\'s IndexedDB. Fully private.', es: 'No. Todo en IndexedDB local.' } },
              { q: { ja: '配信プラットフォームに直接アップできますか?', en: 'Can I upload directly to streaming platforms?', es: '¿Puedo subir a plataformas?' }, a: { ja: 'WAV/MP3 にエクスポート → Spotify (TuneCore 等経由)、YouTube、SoundCloud、Apple Music にアップロード可能。LUFS マスタリング済みなので即配信品質。', en: 'Export to WAV/MP3 → upload to Spotify (via TuneCore etc.), YouTube, SoundCloud, Apple Music. LUFS-mastered, ready to release.', es: 'Exporta WAV/MP3 → sube a Spotify, YouTube, etc.' } },
              { q: { ja: 'MIDI やバーチャルインストルメントは?', en: 'MIDI or virtual instruments?', es: '¿MIDI?' }, a: { ja: '現バージョンでは録音とオーディオ編集に特化しており、MIDI 機能はありません。MIDI 系は別アプリ (今後実装予定) で対応します。', en: 'Current version focuses on recording + audio editing. MIDI features in future apps.', es: 'Versión actual sin MIDI. Próximas apps tendrán MIDI.' } },
            ].map((f, i) => (
              <details key={i} style={{ background: '#fff', borderRadius: 10, padding: '1rem 1.25rem', border: '1px solid #e2e8f0' }}>
                <summary style={{ fontWeight: 600, color: '#0a1226', cursor: 'pointer', fontSize: '0.95rem' }}>{t(f.q, lang)}</summary>
                <p style={{ marginTop: '0.85rem', color: '#475569', fontSize: '0.85rem', lineHeight: 1.7 }}>{t(f.a, lang)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ FINAL CTA ═════════ */}
      <section style={{
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1rem, 4vw, 2rem)',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #0a1226 0%, #1a2742 100%)',
        color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: `radial-gradient(circle, ${ACCENT}22, transparent 60%)`, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', fontWeight: 300, marginBottom: '1rem' }}>
            {t({
              ja: '今、はじめよう。',
              en: 'Begin now.',
              es: 'Comienza ahora.',
            }, lang)}
          </h2>
          <p style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 1.8 }}>
            {t({
              ja: '30 秒後、あなたのブラウザに本物のスタジオが立ち上がります。',
              en: 'In 30 seconds, a real studio will be running in your browser.',
              es: 'En 30 segundos, un estudio real en tu navegador.',
            }, lang)}
          </p>
          <Link href="/daw" style={{
            background: ACCENT, color: '#0a1226',
            padding: '1.2rem 2.75rem', borderRadius: 999,
            textDecoration: 'none', fontSize: '1.05rem', fontWeight: 600, letterSpacing: '0.1em',
            display: 'inline-block',
            boxShadow: '0 12px 40px rgba(232,184,160,0.5)',
          }}>
            ▶ {t({ ja: '今すぐスタジオを開く', en: 'Open Studio Now', es: 'Abrir Estudio' }, lang)}
          </Link>
        </div>
      </section>
    </div>
  );
}
