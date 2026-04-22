'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L3 = Partial<Record<Lang, string>> & { en: string };

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const mono  = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT  = '#059669';
const ACCENT2 = '#34d399';

// ─────────────────────────────────────────────
// useReveal
// ─────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); io.disconnect(); } },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Section({ children, style, id }: { children: React.ReactNode; style?: React.CSSProperties; id?: string }) {
  const ref = useReveal();
  return <section ref={ref} className="reveal" id={id} style={{ marginBottom: 'clamp(48px, 10vw, 80px)', ...style }}>{children}</section>;
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.8)',
  borderRadius: 16,
  padding: 'clamp(20px, 4vw, 32px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
};

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  heroTitle: {
    ja: '音声を共有する。\n24時間で、消える。',
    en: 'Share audio.\nGone in 24 hours.',
    es: 'Comparte audio.\nDesaparece en 24 horas.',
  } as L3,
  heroSub: {
    ja: 'MP3をアップロード、パスワード付きリンクを生成。\n再生開始から24時間で完全削除。\nサーバーにファイルを残さない、安全な音声共有。',
    en: 'Upload MP3, generate a password-protected link.\nCompletely deleted 24 hours after first play.\nSecure audio sharing — nothing stays on the server.',
    es: 'Sube MP3, genera un enlace protegido con contraseña.\nCompletamente eliminado 24 horas después de la primera reproducción.\nAudio compartido seguro — nada queda en el servidor.',
  } as L3,
  heroCta: {
    ja: '今すぐ使う（無料）',
    en: 'Use Now — Free',
    es: 'Usar Ahora — Gratis',
  } as L3,
  heroLearn: { ja: '詳しく見る', en: 'Learn More', es: 'Más información' } as L3,

  // Stats
  stat1: { ja: '¥0', en: '¥0', es: '¥0' } as L3,
  stat1l: { ja: '完全無料', en: 'Totally Free', es: 'Totalmente gratis' } as L3,
  stat2: { ja: '24h', en: '24h', es: '24h' } as L3,
  stat2l: { ja: '自動削除', en: 'Auto-Delete', es: 'Auto-eliminar' } as L3,
  stat3: { ja: '99MB', en: '99MB', es: '99MB' } as L3,
  stat3l: { ja: '最大容量', en: 'Max Size', es: 'Tamaño máx.' } as L3,

  // Pain points
  painTitle: {
    ja: 'こんな経験、ありませんか？',
    en: 'Sound familiar?',
    es: '¿Te suena familiar?',
  } as L3,
  pain1: {
    ja: '録音をクライアントに送りたいが、大容量ファイル転送サービスはURLがいつまでも残って不安',
    en: 'You want to send a recording to a client, but file transfer services leave URLs alive indefinitely',
    es: 'Quieres enviar una grabación a un cliente, pero los servicios de transferencia dejan URLs activas indefinidamente',
  } as L3,
  pain2: {
    ja: '仮ミックスを送ったが、リンクが第三者に転送されてしまわないか心配',
    en: 'You sent a rough mix, but worry it might get forwarded to unintended listeners',
    es: 'Enviaste una mezcla provisional, pero te preocupa que se reenvíe a personas no deseadas',
  } as L3,
  pain3: {
    ja: 'ギガファイル便やDropboxの共有リンクは削除し忘れることが多い',
    en: 'You often forget to delete shared links from file transfer services or cloud storage',
    es: 'A menudo olvidas eliminar los enlaces compartidos de servicios de transferencia o la nube',
  } as L3,
  pain4: {
    ja: '相手がダウンロードできてしまうと、ファイルの流出を制御できない',
    en: 'If the recipient can download the file, you lose control over distribution',
    es: 'Si el destinatario puede descargar el archivo, pierdes el control sobre la distribución',
  } as L3,

  // Solution
  solutionTitle: {
    ja: 'KUON PLAYER が、\nすべてを解決します。',
    en: 'KUON PLAYER solves\nall of this.',
    es: 'KUON PLAYER resuelve\ntodo esto.',
  } as L3,
  solutionSub: {
    ja: 'アップロード → リンク生成 → 24時間で自動消滅。\nパスワードを知っている人だけが再生できます。',
    en: 'Upload → Generate link → Auto-destroyed in 24 hours.\nOnly people with the password can play.',
    es: 'Subir → Generar enlace → Autodestrucción en 24 horas.\nSolo quienes conozcan la contraseña pueden reproducir.',
  } as L3,

  // Features
  featTitle: { ja: '5つの安心', en: '5 Assurances', es: '5 Garantías' } as L3,
  feat1t: { ja: '24時間で完全削除', en: 'Completely Deleted in 24 Hours', es: 'Eliminación completa en 24 horas' } as L3,
  feat1d: {
    ja: '再生が始まった瞬間から24時間のカウントダウンが開始。時間が来たらサーバーからファイルを完全削除。リンクも無効化されます。',
    en: 'The 24-hour countdown starts the moment playback begins. When time\'s up, the file is completely erased from the server. The link becomes invalid.',
    es: 'La cuenta regresiva de 24 horas comienza en el momento de la reproducción. Al terminar, el archivo se elimina completamente del servidor. El enlace queda inválido.',
  } as L3,
  feat2t: { ja: 'パスワード保護', en: 'Password Protected', es: 'Protegido con contraseña' } as L3,
  feat2d: {
    ja: 'アップロード時に設定したパスワードがなければ再生できません。パスワードはSHA-256でハッシュ化され、平文では保存されません。',
    en: 'No playback without the password you set at upload. Passwords are SHA-256 hashed — never stored in plain text.',
    es: 'No se puede reproducir sin la contraseña establecida al subir. Las contraseñas se almacenan con hash SHA-256, nunca en texto plano.',
  } as L3,
  feat3t: { ja: 'ストリーミング再生のみ', en: 'Streaming Only', es: 'Solo streaming' } as L3,
  feat3d: {
    ja: 'ダウンロードボタンはありません。音声はストリーミング再生のみ。ファイルが相手の端末に残ることを防ぎます。',
    en: 'No download button. Audio is streaming-only. Prevents the file from remaining on the recipient\'s device.',
    es: 'Sin botón de descarga. Solo reproducción en streaming. Evita que el archivo quede en el dispositivo del destinatario.',
  } as L3,
  feat4t: { ja: 'いつでも即座に削除', en: 'Instant Deletion Anytime', es: 'Eliminación instantánea en cualquier momento' } as L3,
  feat4d: {
    ja: '24時間を待たず、パスワードを使っていつでもファイルを即座に削除できます。送信者が完全にコントロールを維持。',
    en: 'Don\'t wait 24 hours — delete the file instantly anytime using your password. You remain in full control.',
    es: 'No esperes 24 horas — elimina el archivo al instante con tu contraseña. Mantén el control total.',
  } as L3,
  feat5t: { ja: 'インストール不要', en: 'No Install Required', es: 'Sin instalación' } as L3,
  feat5d: {
    ja: 'ブラウザだけで完結。アプリのインストールもアカウント登録も不要。URLを開くだけ。',
    en: 'Works entirely in the browser. No app install, no account signup. Just open the URL.',
    es: 'Funciona completamente en el navegador. Sin instalar apps, sin crear cuenta. Solo abre la URL.',
  } as L3,

  // How it works
  howTitle: { ja: 'たった3ステップ', en: 'Just 3 Steps', es: 'Solo 3 pasos' } as L3,
  how1t: { ja: 'アップロード', en: 'Upload', es: 'Subir' } as L3,
  how1d: {
    ja: 'MP3ファイルを選択し、曲名とパスワードを設定してアップロード。',
    en: 'Select your MP3 file, set a title and password, then upload.',
    es: 'Selecciona tu archivo MP3, establece un título y contraseña, y sube.',
  } as L3,
  how2t: { ja: 'リンクを共有', en: 'Share the Link', es: 'Comparte el enlace' } as L3,
  how2d: {
    ja: '生成されたURLとパスワードを相手に送信。メール、LINE、何でもOK。',
    en: 'Send the generated URL and password to your recipient. Email, messenger, anything works.',
    es: 'Envía la URL generada y la contraseña al destinatario. Email, mensajería, lo que sea.',
  } as L3,
  how3t: { ja: '24時間後に自動消滅', en: 'Auto-Destroyed After 24h', es: 'Autodestrucción tras 24h' } as L3,
  how3d: {
    ja: '再生開始から24時間が経過すると、ファイルは完全に削除されます。何もする必要はありません。',
    en: 'After 24 hours from first play, the file is completely erased. You don\'t need to do anything.',
    es: 'Después de 24 horas desde la primera reproducción, el archivo se elimina completamente. No necesitas hacer nada.',
  } as L3,

  // Use cases
  useTitle: { ja: 'こんな場面で', en: 'Use Cases', es: 'Casos de uso' } as L3,
  use1: { ja: '録音エンジニアがクライアントに仮ミックスを送る', en: 'Recording engineers sending rough mixes to clients', es: 'Ingenieros de grabación enviando mezclas provisionales a clientes' } as L3,
  use2: { ja: '音楽教師が生徒のレッスン録音を本人に共有', en: 'Music teachers sharing lesson recordings with students', es: 'Profesores de música compartiendo grabaciones de lecciones con estudiantes' } as L3,
  use3: { ja: 'バンドメンバー間でデモ音源を回覧', en: 'Band members circulating demo recordings', es: 'Miembros de banda circulando grabaciones demo' } as L3,
  use4: { ja: 'ポッドキャスト収録の確認音源を関係者に送る', en: 'Sending podcast recording proofs to stakeholders', es: 'Enviando pruebas de grabación de podcast a interesados' } as L3,
  use5: { ja: 'マスタリング前後の比較音源をアーティストに提示', en: 'Presenting before/after mastering comparisons to artists', es: 'Presentando comparaciones de masterización antes/después a artistas' } as L3,

  // Tech
  techTitle: { ja: 'テクノロジー', en: 'Technology', es: 'Tecnología' } as L3,
  techStorage: { ja: 'ストレージ', en: 'Storage', es: 'Almacenamiento' } as L3,
  techStorageV: { ja: 'Cloudflare R2（エッジ配信）', en: 'Cloudflare R2 (Edge Delivery)', es: 'Cloudflare R2 (Entrega Edge)' } as L3,
  techAuth: { ja: '認証', en: 'Authentication', es: 'Autenticación' } as L3,
  techAuthV: { ja: 'SHA-256 パスワードハッシュ', en: 'SHA-256 Password Hashing', es: 'Hash de contraseña SHA-256' } as L3,
  techCleanup: { ja: '自動削除', en: 'Auto Cleanup', es: 'Limpieza automática' } as L3,
  techCleanupV: { ja: 'Cron Trigger（1時間周期）', en: 'Cron Trigger (Hourly)', es: 'Cron Trigger (Cada hora)' } as L3,
  techStream: { ja: '配信方式', en: 'Delivery', es: 'Entrega' } as L3,
  techStreamV: { ja: 'Range リクエスト対応ストリーミング', en: 'Range Request Streaming', es: 'Streaming con Range Request' } as L3,
  techMax: { ja: '最大ファイルサイズ', en: 'Max File Size', es: 'Tamaño máximo' } as L3,
  techMaxV: { ja: '99 MB', en: '99 MB', es: '99 MB' } as L3,

  // Final CTA
  ctaTitle: {
    ja: '安全に音声を共有する。\n今すぐ、無料で。',
    en: 'Share audio securely.\nRight now, for free.',
    es: 'Comparte audio de forma segura.\nAhora mismo, gratis.',
  } as L3,
  ctaBtn: { ja: 'アップロードを始める', en: 'Start Uploading', es: 'Comenzar a subir' } as L3,
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function PlayerLpPage() {
  const { lang } = useLang();
  const t = (obj: L3) => obj[lang] ?? obj.en;

  return (
    <div style={{ background: '#fafaf9', color: '#1a1a1a', minHeight: '100vh' }}>
      <style>{`
        .reveal { opacity: 0; transform: translateY(32px); transition: opacity .7s ease, transform .7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(48px, 10vw, 100px) clamp(16px, 4vw, 40px)',
        background: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 30%, #fafaf9 100%)',
      }}>
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.8rem, 6vw, 3.2rem)',
          fontWeight: 300,
          lineHeight: 1.35,
          letterSpacing: '0.04em',
          whiteSpace: 'pre-line',
          marginBottom: 'clamp(16px, 3vw, 28px)',
          color: '#111',
        }}>
          {t(T.heroTitle)}
        </h1>
        <p style={{
          fontFamily: sans,
          fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)',
          lineHeight: 1.85,
          color: '#555',
          maxWidth: 560,
          whiteSpace: 'pre-line',
          marginBottom: 'clamp(24px, 5vw, 40px)',
        }}>
          {t(T.heroSub)}
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'clamp(32px, 6vw, 56px)' }}>
          <Link href="/player/upload" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 36px', borderRadius: 10,
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT.replace('69', '57')})`,
            color: '#fff', fontFamily: sans, fontWeight: 600,
            fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
            textDecoration: 'none', boxShadow: `0 4px 16px ${ACCENT}44`,
          }}>
            {t(T.heroCta)}
          </Link>
          <a href="#features" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '14px 28px', borderRadius: 10,
            background: 'rgba(0,0,0,0.04)', color: '#333',
            fontFamily: sans, fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
            textDecoration: 'none', border: '1px solid rgba(0,0,0,0.08)',
          }}>
            {t(T.heroLearn)} &#x2193;
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 'clamp(16px, 4vw, 40px)',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {[
            { v: t(T.stat1), l: t(T.stat1l) },
            { v: t(T.stat2), l: t(T.stat2l) },
            { v: t(T.stat3), l: t(T.stat3l) },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontFamily: mono, fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: ACCENT }}>{s.v}</div>
              <div style={{ fontFamily: sans, fontSize: '0.75rem', color: '#888', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>

        {/* ── Pain Points ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)' }}>
            {t(T.painTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
            {[T.pain1, T.pain2, T.pain3, T.pain4].map((p, i) => (
              <div key={i} style={{
                ...glass,
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{['💸', '🚫', '💣', '⚠️'][i]}</span>
                <p style={{ fontFamily: sans, fontSize: '0.9rem', lineHeight: 1.7, color: '#444' }}>
                  {t(p)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Solution ── */}
        <Section style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.3rem, 4.5vw, 2.2rem)',
            fontWeight: 300,
            whiteSpace: 'pre-line',
            lineHeight: 1.4,
            marginBottom: 12,
          }}>
            {t(T.solutionTitle)}
          </h2>
          <p style={{ fontFamily: sans, fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', color: '#666', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {t(T.solutionSub)}
          </p>
        </Section>

        {/* ── Features ── */}
        <Section id="features">
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)' }}>
            {t(T.featTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 16 }}>
            {[
              { t: T.feat1t, d: T.feat1d, icon: '⏰' },
              { t: T.feat2t, d: T.feat2d, icon: '🔒' },
              { t: T.feat3t, d: T.feat3d, icon: '🎶' },
              { t: T.feat4t, d: T.feat4d, icon: '🗑️' },
              { t: T.feat5t, d: T.feat5d, icon: '🌐' },
            ].map((f, i) => (
              <div key={i} style={glass}>
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{f.icon}</div>
                <h3 style={{ fontFamily: sans, fontSize: '0.95rem', fontWeight: 600, color: ACCENT, marginBottom: 6 }}>
                  {t(f.t)}
                </h3>
                <p style={{ fontFamily: sans, fontSize: '0.85rem', lineHeight: 1.7, color: '#555' }}>
                  {t(f.d)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── How it works ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)' }}>
            {t(T.howTitle)}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { n: '01', t: T.how1t, d: T.how1d },
              { n: '02', t: T.how2t, d: T.how2d },
              { n: '03', t: T.how3t, d: T.how3d },
            ].map((step) => (
              <div key={step.n} style={{
                ...glass,
                display: 'flex', alignItems: 'flex-start', gap: 16,
              }}>
                <div style={{
                  fontFamily: mono,
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: ACCENT,
                  opacity: 0.4,
                  flexShrink: 0,
                  lineHeight: 1,
                  marginTop: 2,
                }}>
                  {step.n}
                </div>
                <div>
                  <h3 style={{ fontFamily: sans, fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>
                    {t(step.t)}
                  </h3>
                  <p style={{ fontFamily: sans, fontSize: '0.85rem', lineHeight: 1.7, color: '#555' }}>
                    {t(step.d)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Use Cases ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)' }}>
            {t(T.useTitle)}
          </h2>
          <div style={glass}>
            {[T.use1, T.use2, T.use3, T.use4, T.use5].map((u, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.05)' : 'none',
              }}>
                <span style={{ color: ACCENT, fontSize: '0.9rem' }}>&#x2713;</span>
                <p style={{ fontFamily: sans, fontSize: '0.9rem', color: '#444', lineHeight: 1.6 }}>
                  {t(u)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Technology ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)' }}>
            {t(T.techTitle)}
          </h2>
          <div style={{
            ...glass,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
            gap: 16,
          }}>
            {[
              { l: T.techStorage, v: T.techStorageV },
              { l: T.techAuth, v: T.techAuthV },
              { l: T.techCleanup, v: T.techCleanupV },
              { l: T.techStream, v: T.techStreamV },
              { l: T.techMax, v: T.techMaxV },
            ].map((row, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: sans, fontSize: '0.75rem', color: '#888', marginBottom: 4 }}>{t(row.l)}</div>
                <div style={{ fontFamily: mono, fontSize: '0.85rem', color: '#333', fontWeight: 500 }}>{t(row.v)}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Final CTA ── */}
        <Section style={{ textAlign: 'center', paddingBottom: 'clamp(40px, 8vw, 80px)' }}>
          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.3rem, 4.5vw, 2.2rem)',
            fontWeight: 300,
            whiteSpace: 'pre-line',
            lineHeight: 1.4,
            marginBottom: 'clamp(16px, 3vw, 28px)',
          }}>
            {t(T.ctaTitle)}
          </h2>
          <Link href="/player/upload" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '16px 44px', borderRadius: 12,
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT.replace('69', '57')})`,
            color: '#fff', fontFamily: sans, fontWeight: 600,
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            textDecoration: 'none', boxShadow: `0 6px 24px ${ACCENT}44`,
          }}>
            {t(T.ctaBtn)}
          </Link>
        </Section>

        {/* Footer attribution */}
        <div style={{ textAlign: 'center', padding: '0 0 40px', color: '#bbb', fontFamily: sans, fontSize: '0.75rem' }}>
          KUON PLAYER — by{' '}
          <Link href="/" style={{ color: '#999', textDecoration: 'underline' }}>空音開発 Kuon R&D</Link>
        </div>
      </div>
    </div>
  );
}
