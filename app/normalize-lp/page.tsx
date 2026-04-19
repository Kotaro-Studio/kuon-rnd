// app/normalize-lp/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLang } from '@/context/LangContext';

const content = {
  ja: {
    toggleBtn: 'English',
    badge: 'MICROPHONE OWNERS EXCLUSIVE',
    title: 'KUON NORMALIZE',
    titleReading: '空音 正規化',
    subtitle: 'マイクを買った、その日から。\nブラウザが、スタジオに',
    heroNote: '※ 空音開発の無指向性マイクロフォン購入者限定ツール',
    featuresLabel: 'WHAT IT DOES',
    featuresTitle: '3つの処理が、\n音を完成させる。',
    featuresDesc: 'ファイルをドロップして、目的を選ぶだけ。複雑なDAWは不要。すべての処理はあなたのブラウザの中だけで完結します。データが外部に送信されることは一切ありません。',
    feat1Title: 'ピュア・ノーマライズ',
    feat1Desc: '波形のダイナミクスを完全に保ったまま、最大ピークを -0.1dB に揃える。音楽編集の最初の一手に。',
    feat1Mode: 'PEAK MODE',
    feat2Title: 'ラウドネス最適化',
    feat2Desc: 'YouTube・Podcastの配信基準に合わせた音量へ自動調整。リミッターで音割れも完全防止。',
    feat2Mode: 'LOUDNESS MODE',
    feat3Title: '朝比奈シグネチャーEQ',
    feat3Desc: '80Hz以下の濁りをわずかに除去し、10kHz以上の空気感を自然に付加。空音マイクの特性を最大限に引き出す専用チューニング。',
    feat3Mode: 'SIGNATURE EQ',
    magicLabel: 'MAGIC SWITCHES',
    magicTitle: '3つのスイッチが、\n録音を変える。',
    magicDesc: '処理は組み合わせ自由。すべてONにしても、1つだけでも。最適な組み合わせを探す時間そのものを楽しんでください。',
    switch1Name: '位相反転',
    switch1Desc: '録音時の逆相を正相に補正。',
    switch2Name: '朝比奈幸太郎推奨 EQ',
    switch2Desc: '空音マイクの録音に最適化された、ほんのわずかな隠し味。',
    switch3Name: 'ナチュラル・ホールリバーブ',
    switch3Desc: 'ウェット感わずか6%。気づかないほど微小で、しかし確実に空間をリッチにする余韻。',
    micLabel: 'THE KEY',
    micTitle: 'このアプリを使うための、\n条件。',
    micDesc1: '空音開発の無指向性マイクロフォンをご購入いただくと、ご購入時に入力いただいたメールアドレスへパスワードをお届けします。そのパスワードを入力するだけで、このアプリが即座に解放されます。',
    micDesc2: '無指向性素子を採用した空音マイクは、360°全方位の音を均一に捉えます。合唱・アコースティック楽器・フィールドレコーディング——あらゆる録音シーンで、その実力を発揮します。そしてこのアプリは、そのマイクの特性を知り尽くした上で設計されたツールです。',
    micSpec1Label: '指向性',
    micSpec1Value: '無指向性（全方位）',
    micSpec2Label: '用途',
    micSpec2Value: '合唱 / 楽器 / フィールド',
    micSpec3Label: 'アプリ連携',
    micSpec3Value: 'パスワード同梱',
    micSpec4Label: '開発者',
    micSpec4Value: '朝比奈幸太郎 / 空音開発',
    exclusiveLabel: '単体販売について',
    exclusiveTitle: 'このアプリは、\n永久に単体販売しません。',
    exclusiveDesc: 'KUON NORMALIZEは、空音開発のマイクロフォンとセットでのみ入手できます。',
    ctaLabel: 'GET STARTED',
    ctaTitle: 'マイクを手に入れて、\nこのアプリを解放する。',
    ctaDesc: 'マイクロフォンのご購入後、パスワードをメールにてお送りします。',
    ctaBtn: 'マイクロフォンを購入する',
    ctaBtnSub: '空音開発で直接購入 — P-86S ¥13,900（税込）',
    ctaAlready: 'すでにパスワードをお持ちの方',
    ctaAppLink: 'アプリを開く →',
    footerCopy: '© 2025 空音開発 Kuon R&D. All rights reserved.',
    privacy: 'すべての音声処理はブラウザ内で完結するため、データの外部送信は一切行わず、セキュリティー的に最も安全に処理しています。',
  },
  en: {
    toggleBtn: '日本語',
    badge: 'MICROPHONE OWNERS EXCLUSIVE',
    title: 'KUON NORMALIZE',
    titleReading: 'Browser-Native Audio Engine',
    subtitle: 'The day you get the mic,\nyour browser becomes a studio.',
    heroNote: '※ Exclusive to Kuon R&D omnidirectional microphone owners',
    featuresLabel: 'WHAT IT DOES',
    featuresTitle: 'Three processes.\nOne perfect sound.',
    featuresDesc: 'Drop your file, choose your goal. No DAW required. Every process runs entirely inside your browser — your audio never leaves your device.',
    feat1Title: 'Pure Normalize',
    feat1Desc: 'Preserves the full dynamic range while aligning the peak to -0.1dB. The perfect first step for music editing.',
    feat1Mode: 'PEAK MODE',
    feat2Title: 'Loudness Optimization',
    feat2Desc: 'Auto-adjusts to YouTube & Podcast loudness standards. A built-in limiter prevents any re-clipping.',
    feat2Mode: 'LOUDNESS MODE',
    feat3Title: 'Asahina Signature EQ',
    feat3Desc: 'Subtly removes muddiness below 80Hz and adds natural air above 10kHz. Custom tuning to maximize the Kuon mic\'s character.',
    feat3Mode: 'SIGNATURE EQ',
    magicLabel: 'MAGIC SWITCHES',
    magicTitle: 'Three switches.\nEndless possibilities.',
    magicDesc: 'Mix and match freely. All on, just one, or anything in between. Finding the perfect combination is the art of engineering.',
    switch1Name: 'Phase Inversion',
    switch1Desc: 'Corrects reversed phase from recording. Especially effective for choir mic setups.',
    switch2Name: 'Asahina Signature EQ',
    switch2Desc: 'A subtle, custom EQ optimized for recordings made with the Kuon omnidirectional mic.',
    switch3Name: 'Natural Hall Reverb',
    switch3Desc: 'Only 6% wet. Imperceptibly small, but unmistakably enriching the space of your recording.',
    micLabel: 'THE KEY',
    micTitle: 'One condition to\nunlock this app.',
    micDesc1: 'Purchase a Kuon R&D omnidirectional microphone and receive your password by email or in the box. Enter it once, and the app is yours forever.',
    micDesc2: 'The Kuon omnidirectional mic captures sound uniformly from all 360°. Choir, acoustic instruments, field recording — it excels in every scenario. And this app was designed with intimate knowledge of that microphone\'s character.',
    micSpec1Label: 'Polar Pattern',
    micSpec1Value: 'Omnidirectional (360°)',
    micSpec2Label: 'Best For',
    micSpec2Value: 'Choir / Instruments / Field',
    micSpec3Label: 'App Access',
    micSpec3Value: 'Password included',
    micSpec4Label: 'Designer',
    micSpec4Value: 'K. Asahina / Kuon R&D',
    exclusiveLabel: 'ABOUT AVAILABILITY',
    exclusiveTitle: 'This app will never\nbe sold separately.',
    exclusiveDesc: 'KUON NORMALIZE is available only with a Kuon R&D microphone. This is a deliberate decision. Only those who own the mic can access the tool designed to complete its sound. That is the philosophy of Kuon R&D.',
    ctaLabel: 'GET STARTED',
    ctaTitle: 'Get the mic.\nUnlock the app.',
    ctaDesc: 'Your password will be sent by email after purchase.',
    ctaBtn: 'Buy the Microphone',
    ctaBtnSub: 'Direct purchase from Kuon R&D — P-86S ¥13,900',
    ctaAlready: 'Already have a password?',
    ctaAppLink: 'Open the App →',
    footerCopy: '© 2025 Kuon R&D. All rights reserved.',
    privacy: 'All audio processing runs locally in your browser. Your files are never uploaded anywhere.',
  },
  es: {
    toggleBtn: 'Español',
    badge: 'MICROPHONE OWNERS EXCLUSIVE',
    title: 'KUON NORMALIZE',
    titleReading: 'Motor de audio en el navegador',
    subtitle: 'Desde el día que recibes el micro,\ntu navegador se convierte en estudio.',
    heroNote: '※ Herramienta exclusiva para propietarios del micrófono omnidireccional de Kuon R&D',
    featuresLabel: 'WHAT IT DOES',
    featuresTitle: 'Tres procesos.\nUn sonido perfecto.',
    featuresDesc: 'Suelta tu archivo y elige el objetivo. Sin DAW. Todos los procesos corren dentro del navegador — tu audio nunca sale de tu dispositivo.',
    feat1Title: 'Normalización pura',
    feat1Desc: 'Conserva todo el rango dinámico mientras alinea el pico a -0.1 dB. El primer paso perfecto al editar música.',
    feat1Mode: 'PEAK MODE',
    feat2Title: 'Optimización de loudness',
    feat2Desc: 'Ajuste automático al estándar de loudness de YouTube y Podcast. Un limiter interno evita cualquier re-clipping.',
    feat2Mode: 'LOUDNESS MODE',
    feat3Title: 'EQ Signature de Asahina',
    feat3Desc: 'Elimina sutilmente la turbidez por debajo de 80 Hz y añade aire natural por encima de 10 kHz. Ajuste personalizado para sacar el máximo al micro Kuon.',
    feat3Mode: 'SIGNATURE EQ',
    magicLabel: 'MAGIC SWITCHES',
    magicTitle: 'Tres interruptores.\nInfinitas posibilidades.',
    magicDesc: 'Combínalos libremente. Todos activos, solo uno, o cualquier variación. Encontrar la combinación perfecta es el arte de la ingeniería.',
    switch1Name: 'Inversión de fase',
    switch1Desc: 'Corrige la fase invertida durante la grabación. Especialmente eficaz en micros de coro.',
    switch2Name: 'EQ Signature de Asahina',
    switch2Desc: 'Un EQ sutil y a medida optimizado para grabaciones con el micro omnidireccional Kuon.',
    switch3Name: 'Reverberación natural de sala',
    switch3Desc: 'Solo 6 % wet. Imperceptible, pero enriquece el espacio de tu grabación.',
    micLabel: 'THE KEY',
    micTitle: 'Una única condición\npara desbloquear la app.',
    micDesc1: 'Compra un micrófono omnidireccional de Kuon R&D y recibe tu contraseña por correo o en la caja. Introdúcela una vez y la app es tuya para siempre.',
    micDesc2: 'El micro omnidireccional Kuon capta el sonido uniformemente en 360°. Coro, instrumentos acústicos, grabación de campo — sobresale en cualquier escenario. Y esta app fue diseñada conociendo a fondo el carácter de ese micrófono.',
    micSpec1Label: 'Patrón polar',
    micSpec1Value: 'Omnidireccional (360°)',
    micSpec2Label: 'Ideal para',
    micSpec2Value: 'Coro / Instrumentos / Campo',
    micSpec3Label: 'Acceso a la app',
    micSpec3Value: 'Contraseña incluida',
    micSpec4Label: 'Diseñador',
    micSpec4Value: 'K. Asahina / Kuon R&D',
    exclusiveLabel: 'SOBRE LA DISPONIBILIDAD',
    exclusiveTitle: 'Esta app nunca\nse venderá por separado.',
    exclusiveDesc: 'KUON NORMALIZE está disponible únicamente con un micrófono de Kuon R&D. Es una decisión deliberada: solo quienes poseen el micro pueden acceder a la herramienta diseñada para completar su sonido. Esa es la filosofía de Kuon R&D.',
    ctaLabel: 'GET STARTED',
    ctaTitle: 'Consigue el micro.\nDesbloquea la app.',
    ctaDesc: 'Tu contraseña se enviará por correo tras la compra.',
    ctaBtn: 'Comprar el micrófono',
    ctaBtnSub: 'Compra directa en Kuon R&D — P-86S ¥13,900',
    ctaAlready: '¿Ya tienes contraseña?',
    ctaAppLink: 'Abrir la app →',
    footerCopy: '© 2025 Kuon R&D. Todos los derechos reservados.',
    privacy: 'Todo el procesamiento de audio se realiza localmente en tu navegador. Tus archivos nunca se suben a ninguna parte.',
  }
};

function WaveformBar({ index, total }: { index: number; total: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const h = useMemo(() => {
    const t = (index / total) * Math.PI * 3;
    return Math.min(Math.abs(Math.sin(t) * 60 + Math.sin(t * 2.3) * 20) + 8, 80);
  }, [index, total]);
  if (!mounted) return <div style={{ width: '3px', height: '20px', borderRadius: '2px', background: '#E2E8F0' }} />;
  return (
    <div style={{
      width: '3px',
      height: `${h}px`,
      borderRadius: '2px',
      background: index % 3 === 0 ? '#059669' : '#E2E8F0',
      opacity: 0.6 + (index % 4) * 0.1,
      transition: 'height 0.3s ease',
    }} />
  );
}

function WaveformVisual() {
  const bars = 56;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '80px' }}>
      {Array.from({ length: bars }).map((_, i) => (
        <WaveformBar key={i} index={i} total={bars} />
      ))}
    </div>
  );
}

/* ─── 直接購入ボタン（Stripe Checkout 接続）───
   microphone LP と同じ挙動: /api/checkout に POST → Stripe 決済画面へ遷移
   product は P-86S 固定（このアプリは P-86S 購入者向けバンドル） */
function BuyMicButton({
  style,
  className,
  label,
}: {
  style: React.CSSProperties;
  className?: string;
  label: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'p-86s' }),
      });
      const d = (await r.json()) as { url?: string; error?: string };
      if (d.url) {
        window.location.href = d.url;
      } else {
        console.error('Checkout error:', d.error);
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
      style={{
        ...style,
        border: 'none',
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.75 : 1,
      }}
    >
      {loading ? '…' : label}
    </button>
  );
}

export default function NormalizeLandingPage() {
  // サイト共通 useLang() に統合（§19）— アプリロジックには一切触れない
  const { lang } = useLang();
  const t = content[lang as keyof typeof content] || content.en;

  const C = {
    bg: '#FFFFFF',
    bgSoft: '#F7F9FC',
    bgCard: '#FFFFFF',
    border: '#E2E8F0',
    borderGreen: 'rgba(5,150,105,0.22)',
    accent: '#059669',
    accentLight: '#ECFDF5',
    accentDark: '#047857',
    ink: '#1A202C',
    inkMid: '#4A5568',
    inkMuted: '#718096',
    gold: '#D69E2E',
    goldLight: '#FFFFF0',
    goldBorder: 'rgba(214,158,46,0.28)',
    white: '#FFFFFF',
  };

  const baseSection: React.CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '100px 32px',
  };

  const hairline: React.CSSProperties = {
    height: '1px',
    background: C.border,
    margin: '0 32px',
  };

  const label: React.CSSProperties = {
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '4px',
    color: C.accent,
    textTransform: 'uppercase' as const,
    marginBottom: '16px',
  };

  const h2: React.CSSProperties = {
    fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
    fontWeight: 700,
    letterSpacing: '-1px',
    lineHeight: 1.15,
    color: C.ink,
    whiteSpace: 'pre-line',
  };

  return (
    <div style={{
      backgroundColor: C.bg,
      color: C.ink,
      fontFamily: '"Space Grotesk", "Noto Sans JP", "Helvetica Neue", Arial, sans-serif',
      lineHeight: 1.75,
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(5,150,105,0.15); }
        html { scroll-behavior: smooth; }
        .cta-mic:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 48px rgba(5,150,105,0.28) !important;
        }
        .lang-btn:hover {
          color: ${C.accent} !important;
        }
        .feat-card:hover {
          box-shadow: 0 12px 32px rgba(0,0,0,0.08) !important;
          transform: translateY(-3px);
        }
        .switch-row:hover {
          border-color: rgba(5,150,105,0.3) !important;
          background: rgba(5,150,105,0.02) !important;
        }
      `}</style>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '140px 24px 80px',
        background: `linear-gradient(180deg, ${C.bgSoft} 0%, ${C.bg} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(${C.border} 1px, transparent 1px),
            linear-gradient(90deg, ${C.border} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.45,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px', width: '100%' }}>

          {/* バッジ */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: `1px solid ${C.borderGreen}`,
            borderRadius: '100px',
            padding: '5px 16px 5px 12px',
            marginBottom: '36px',
            background: C.accentLight,
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: C.accent, display: 'inline-block',
              boxShadow: `0 0 6px ${C.accent}`,
            }} />
            <span style={{
              fontSize: '0.68rem', fontWeight: 700,
              letterSpacing: '3px', color: C.accent,
              textTransform: 'uppercase' as const,
            }}>
              {t.badge}
            </span>
          </div>

          {/* タイトル */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 8.5vw, 6.5rem)',
            fontWeight: 700,
            letterSpacing: '-3px',
            lineHeight: 0.95,
            color: C.ink,
            marginBottom: '10px',
          }}>
            {t.title}
          </h1>
          <div style={{
            fontSize: '0.72rem', letterSpacing: '5px',
            color: C.inkMuted, marginBottom: '20px',
          }}>
            {t.titleReading}
          </div>

          {/* 言語切替はサイト共通ヘッダーに統合済み（§19） */}

          {/* サブタイトル */}
          <p style={{
            fontSize: 'clamp(1.05rem, 2.4vw, 1.28rem)',
            color: C.inkMid,
            fontWeight: 400,
            lineHeight: 1.75,
            whiteSpace: 'pre-line',
            maxWidth: '540px',
            margin: '0 auto 40px',
          }}>
            {t.subtitle}
          </p>

          {/* 波形 */}
          <div style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: '20px 28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
            marginBottom: '20px',
          }}>
            <WaveformVisual />
          </div>

          <p style={{ fontSize: '0.75rem', color: C.inkMuted }}>
            {t.heroNote}
          </p>
        </div>
      </section>

      <div style={hairline} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FEATURES
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ ...baseSection }}>
        <div style={{ marginBottom: '60px' }}>
          <div style={label}>{t.featuresLabel}</div>
          <h2 style={h2}>{t.featuresTitle}</h2>
          <p style={{ marginTop: '20px', color: C.inkMid, fontSize: '0.95rem', lineHeight: 1.85, maxWidth: '600px' }}>
            {t.featuresDesc}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px' }}>
          {[
            { icon: '🎵', mode: t.feat1Mode, title: t.feat1Title, desc: t.feat1Desc, color: C.accent },
            { icon: '🎬', mode: t.feat2Mode, title: t.feat2Title, desc: t.feat2Desc, color: '#0099BB' },
            { icon: '✨', mode: t.feat3Mode, title: t.feat3Title, desc: t.feat3Desc, color: '#D69E2E' },
          ].map((item, i) => (
            <div key={i} className="feat-card" style={{
              background: C.bgSoft,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              padding: '32px 26px',
              transition: 'all 0.25s ease',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '18px' }}>{item.icon}</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '2.5px', color: item.color, marginBottom: '10px' }}>
                {item.mode}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: C.ink, marginBottom: '12px', lineHeight: 1.3 }}>
                {item.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: C.inkMid, lineHeight: 1.8 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={hairline} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAGIC SWITCHES
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ ...baseSection, background: C.bgSoft }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
          <div>
            <div style={label}>{t.magicLabel}</div>
            <h2 style={h2}>{t.magicTitle}</h2>
            <p style={{ marginTop: '20px', color: C.inkMid, fontSize: '0.95rem', lineHeight: 1.85 }}>
              {t.magicDesc}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: t.switch1Name, desc: t.switch1Desc, color: C.accent },
              { name: t.switch2Name, desc: t.switch2Desc, color: '#D69E2E' },
              { name: t.switch3Name, desc: t.switch3Desc, color: '#0099BB' },
            ].map((item, i) => (
              <div key={i} className="switch-row" style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '18px 20px',
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: '42px', height: '23px', borderRadius: '23px',
                  background: `${item.color}20`,
                  border: `1.5px solid ${item.color}50`,
                  position: 'relative', flexShrink: 0,
                }}>
                  <div style={{
                    width: '17px', height: '17px', borderRadius: '50%',
                    background: item.color,
                    position: 'absolute', top: '2px', right: '2px',
                    boxShadow: `0 2px 6px ${item.color}55`,
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: C.ink, marginBottom: '3px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: C.inkMuted, lineHeight: 1.55 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={hairline} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MIC SECTION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ ...baseSection }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
          <div>
            <div style={label}>{t.micLabel}</div>
            <h2 style={h2}>{t.micTitle}</h2>
            <p style={{ marginTop: '20px', marginBottom: '18px', color: C.inkMid, fontSize: '0.95rem', lineHeight: 1.85 }}>
              {t.micDesc1}
            </p>
            <p style={{ color: C.inkMid, fontSize: '0.95rem', lineHeight: 1.85, marginBottom: '40px' }}>
              {t.micDesc2}
            </p>
            <BuyMicButton
              className="cta-mic"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                color: C.white, padding: '16px 36px', borderRadius: '100px',
                fontSize: '0.95rem', fontWeight: 700,
                boxShadow: `0 8px 28px rgba(5,150,105,0.22)`,
                transition: 'all 0.25s ease',
              }}
              label={<><span>🎙️</span><span>{t.ctaBtn}</span></>}
            />
            <div style={{ marginTop: '10px', fontSize: '0.75rem', color: C.inkMuted }}>
              {t.ctaBtnSub}
            </div>
          </div>

          {/* スペックカード */}
          <div style={{
            background: C.bgSoft, border: `1px solid ${C.border}`,
            borderRadius: '20px', overflow: 'hidden',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)',
              padding: '48px 32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '4.5rem', lineHeight: 1, marginBottom: '12px' }}>🎙️</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '3px', fontWeight: 600 }}>
                空音開発 / KUON R&D
              </div>
              <div style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginTop: '6px', letterSpacing: '0.5px' }}>
                Omnidirectional Microphone
              </div>
            </div>
            <div style={{ padding: '28px 32px' }}>
              {[
                { label: t.micSpec1Label, value: t.micSpec1Value },
                { label: t.micSpec2Label, value: t.micSpec2Value },
                { label: t.micSpec3Label, value: t.micSpec3Value },
                { label: t.micSpec4Label, value: t.micSpec4Value },
              ].map((spec, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < 3 ? `1px solid ${C.border}` : 'none',
                }}>
                  <span style={{ fontSize: '0.78rem', color: C.inkMuted, fontWeight: 500 }}>{spec.label}</span>
                  <span style={{ fontSize: '0.85rem', color: C.ink, fontWeight: 600, textAlign: 'right' as const }}>{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={hairline} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          EXCLUSIVE（永久単体販売なし）
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ ...baseSection, background: C.bgSoft, textAlign: 'center' }}>
        <div style={{
          maxWidth: '580px', margin: '0 auto',
        }}>
          <div style={label}>{t.exclusiveLabel}</div>
          <h2 style={{ ...h2, textAlign: 'center' }}>{t.exclusiveTitle}</h2>
          <p style={{ marginTop: '24px', color: C.inkMid, fontSize: '0.95rem', lineHeight: 1.9 }}>
            {t.exclusiveDesc}
          </p>
        </div>
      </section>

      <div style={hairline} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CTA
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ ...baseSection, padding: '100px 32px 120px', textAlign: 'center' }}>
        <div style={{
          background: C.bgCard, border: `1px solid ${C.border}`,
          borderRadius: '24px', padding: '72px 48px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '140px', height: '2px',
            background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
          }} />

          <div style={label}>{t.ctaLabel}</div>
          <h2 style={{ ...h2, fontSize: 'clamp(1.8rem, 4vw, 3rem)', textAlign: 'center', marginBottom: '18px' }}>
            {t.ctaTitle}
          </h2>
          <p style={{ color: C.inkMid, fontSize: '0.95rem', lineHeight: 1.85, maxWidth: '440px', margin: '0 auto 48px' }}>
            {t.ctaDesc}
          </p>

          <BuyMicButton
            className="cta-mic"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
              color: C.white, padding: '20px 56px', borderRadius: '100px',
              fontSize: '1.05rem', fontWeight: 700,
              boxShadow: `0 8px 32px rgba(5,150,105,0.25)`,
              transition: 'all 0.25s ease', marginBottom: '14px',
            }}
            label={<><span>🎙️</span><span>{t.ctaBtn} →</span></>}
          />

          <div style={{ fontSize: '0.78rem', color: C.inkMuted, marginBottom: '40px' }}>
            {t.ctaBtnSub}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            maxWidth: '300px', margin: '0 auto 28px',
          }}>
            <div style={{ flex: 1, height: '1px', background: C.border }} />
            <span style={{ fontSize: '0.75rem', color: C.inkMuted, whiteSpace: 'nowrap' as const }}>
              {t.ctaAlready}
            </span>
            <div style={{ flex: 1, height: '1px', background: C.border }} />
          </div>

          <a href="/normalize" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: C.accent, fontSize: '0.9rem', fontWeight: 600,
            textDecoration: 'none',
            padding: '12px 32px', borderRadius: '100px',
            border: `1.5px solid ${C.borderGreen}`,
            transition: 'all 0.2s',
          }}>
            {t.ctaAppLink}
          </a>
        </div>

        <div style={{
          marginTop: '28px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '8px',
          fontSize: '0.75rem', color: C.inkMuted,
        }}>
          <span>🔒</span>
          <span>{t.privacy}</span>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.78rem', color: C.inkMuted, background: C.bg,
        flexWrap: 'wrap' as const, gap: '8px',
      }}>
        <div style={{ fontWeight: 600, color: C.ink }}>
          空音開発 <span style={{ color: C.accent, fontWeight: 400 }}>Kuon R&D</span>
        </div>
        <div>{t.footerCopy}</div>
      </footer>
    </div>
  );
}
