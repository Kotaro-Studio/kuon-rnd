"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Product definitions
// ─────────────────────────────────────────────
type ProductKey = 'p-86s' | 'x-86s';

interface ProductInfo {
  name: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  giftDesc: Record<Lang, string>;
  passwordNote: Record<Lang, string>;
}

const PRODUCTS: Record<ProductKey, ProductInfo> = {
  'p-86s': {
    name: {
      ja: 'P-86S ステレオマイクロフォン',
      en: 'P-86S Stereo Microphone',
      es: 'P-86S Micrófono Estéreo',
    },
    subtitle: {
      ja: 'P-86S ステレオマイクロフォンのご注文を承りました。',
      en: 'Your order for the P-86S Stereo Microphone has been confirmed.',
      es: 'Su pedido del P-86S Micrófono Estéreo ha sido confirmado.',
    },
    giftDesc: {
      ja: 'P-86S をご購入いただいたお客様に、空音開発のオーディオアプリ「KUON NORMALIZE」を無料でお使いいただけます。',
      en: 'As a P-86S owner, you get free access to our audio app "KUON NORMALIZE".',
      es: 'Como propietario del P-86S, obtiene acceso gratuito a nuestra aplicación de audio "KUON NORMALIZE".',
    },
    passwordNote: {
      ja: 'このパスワードはすべての P-86S オーナーが共有しています。仲間の証です。',
      en: 'This password is shared among all P-86S owners. It\'s a badge of our community.',
      es: 'Esta contraseña es compartida entre todos los propietarios de P-86S. Es una insignia de nuestra comunidad.',
    },
  },
  'x-86s': {
    name: {
      ja: 'X-86S プロフェッショナルステレオマイクロフォン',
      en: 'X-86S Professional Stereo Microphone',
      es: 'X-86S Micrófono Estéreo Profesional',
    },
    subtitle: {
      ja: 'X-86S プロフェッショナルステレオマイクロフォンのご注文を承りました。',
      en: 'Your order for the X-86S Professional Stereo Microphone has been confirmed.',
      es: 'Su pedido del X-86S Micrófono Estéreo Profesional ha sido confirmado.',
    },
    giftDesc: {
      ja: 'X-86S をご購入いただいたお客様に、空音開発のオーディオアプリ「KUON NORMALIZE」を無料でお使いいただけます。',
      en: 'As an X-86S owner, you get free access to our audio app "KUON NORMALIZE".',
      es: 'Como propietario del X-86S, obtiene acceso gratuito a nuestra aplicación de audio "KUON NORMALIZE".',
    },
    passwordNote: {
      ja: 'このパスワードはすべてのマイクロフォンオーナーが共有しています。仲間の証です。',
      en: 'This password is shared among all microphone owners. It\'s a badge of our community.',
      es: 'Esta contraseña es compartida entre todos los propietarios de micrófonos. Es una insignia de nuestra comunidad.',
    },
  },
};

// ─────────────────────────────────────────────
// Shared translations
// ─────────────────────────────────────────────
type T3 = Record<Lang, string>;

const t = {
  title: {
    ja: 'ご購入ありがとうございます',
    en: 'Thank you for your purchase',
    es: 'Gracias por su compra',
  } as T3,
  shipping: {
    ja: '決済確認後、1〜3 営業日以内に発送いたします。発送完了後、メールにてお知らせします。',
    en: 'We will ship within 1-3 business days after payment confirmation. You will receive a shipping notification via email.',
    es: 'Enviaremos dentro de 1-3 días hábiles después de la confirmación del pago. Recibirá una notificación de envío por correo electrónico.',
  } as T3,
  giftTitle: {
    ja: '購入者限定特典',
    en: 'Exclusive Bonus for Buyers',
    es: 'Bonificación exclusiva para compradores',
  } as T3,
  passwordLabel: {
    ja: 'アプリのパスワード',
    en: 'App Password',
    es: 'Contraseña de la aplicación',
  } as T3,
  openApp: {
    ja: 'KUON NORMALIZE を開く',
    en: 'Open KUON NORMALIZE',
    es: 'Abrir KUON NORMALIZE',
  } as T3,
  emailNote: {
    ja: 'このパスワードはご登録のメールアドレスにもお送りしています。',
    en: 'This password has also been sent to your registered email address.',
    es: 'Esta contraseña también se ha enviado a su dirección de correo electrónico registrada.',
  } as T3,
  backHome: {
    ja: '空音開発 トップページへ',
    en: 'Back to Kuon R&D Home',
    es: 'Volver a la página principal de Kuon R&D',
  } as T3,
  backMic: {
    ja: 'マイクロフォンページへ戻る',
    en: 'Back to Microphone page',
    es: 'Volver a la página del micrófono',
  } as T3,
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const ACCENT = '#0284c7';
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(170deg, #f8fafc 0%, #e8f4f8 40%, #f0f9ff 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)',
  fontFamily: sans,
};

const cardStyle: React.CSSProperties = {
  maxWidth: '640px',
  width: '100%',
  background: '#fff',
  borderRadius: '20px',
  boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
  padding: 'clamp(2rem, 5vw, 3.5rem)',
  textAlign: 'center',
};

const checkIconStyle: React.CSSProperties = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1.5rem',
  fontSize: '2rem',
  color: '#fff',
};

const passwordBoxStyle: React.CSSProperties = {
  margin: '1.5rem auto',
  padding: '1.5rem 2rem',
  background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)',
  borderRadius: '16px',
  color: '#fff',
  maxWidth: '360px',
};

const passwordValueStyle: React.CSSProperties = {
  fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
  fontSize: 'clamp(2rem, 5vw, 2.8rem)',
  fontWeight: 700,
  letterSpacing: '0.3em',
  margin: '0.5rem 0',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  color: '#fff',
  fontFamily: sans,
  backgroundColor: ACCENT,
  fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
  letterSpacing: '0.1em',
  padding: '1rem 2.5rem',
  borderRadius: '50px',
  boxShadow: '0 8px 28px rgba(2,132,199,0.3)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: 'none',
  marginTop: '1.5rem',
};

const linkStyle: React.CSSProperties = {
  color: ACCENT,
  textDecoration: 'none',
  fontSize: '0.9rem',
  transition: 'opacity 0.2s',
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ThanksPage() {
  return (
    <Suspense fallback={<div style={containerStyle}><div style={cardStyle}><p style={{ textAlign: 'center', color: '#94a3b8' }}>読み込み中…</p></div></div>}>
      <ThanksContent />
    </Suspense>
  );
}

function ThanksContent() {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const productParam = searchParams.get('product') as ProductKey | null;
  const product = productParam && PRODUCTS[productParam] ? PRODUCTS[productParam] : PRODUCTS['p-86s'];

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Check Icon */}
        <div style={checkIconStyle}>✓</div>

        {/* Title */}
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
          fontWeight: 600,
          color: '#0c4a6e',
          margin: '0 0 0.8rem',
          lineHeight: 1.4,
        }}>
          {t.title[lang]}
        </h1>

        {/* Subtitle — product-specific */}
        <p style={{
          color: '#475569',
          fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
          lineHeight: 1.8,
          margin: '0 0 0.5rem',
        }}>
          {product.subtitle[lang]}
        </p>

        {/* Shipping Info */}
        <p style={{
          color: '#64748b',
          fontSize: '0.85rem',
          lineHeight: 1.7,
          margin: '0 0 2rem',
        }}>
          {t.shipping[lang]}
        </p>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0 0 2rem' }} />

        {/* Gift Section */}
        <h2 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
          fontWeight: 600,
          color: '#0c4a6e',
          margin: '0 0 0.8rem',
        }}>
          {t.giftTitle[lang]}
        </h2>

        <p style={{
          color: '#475569',
          fontSize: 'clamp(0.85rem, 1.3vw, 0.95rem)',
          lineHeight: 1.8,
          margin: '0 0 1.5rem',
        }}>
          {product.giftDesc[lang]}
        </p>

        {/* Password Box */}
        <div style={passwordBoxStyle}>
          <div style={{
            fontSize: '0.8rem',
            opacity: 0.8,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            {t.passwordLabel[lang]}
          </div>
          <div style={passwordValueStyle}>kuon</div>
        </div>

        <p style={{
          color: '#94a3b8',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          margin: '0 0 0.5rem',
          fontStyle: 'italic',
        }}>
          {product.passwordNote[lang]}
        </p>

        <p style={{
          color: '#94a3b8',
          fontSize: '0.78rem',
          lineHeight: 1.6,
          margin: '0 0 1.5rem',
        }}>
          {t.emailNote[lang]}
        </p>

        {/* CTA: Open App */}
        <Link href="/normalize" style={btnPrimary}>
          {t.openApp[lang]}
        </Link>

        {/* Gallery Invite */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(2,132,199,0.05) 0%, rgba(14,165,233,0.08) 100%)',
          borderRadius: '14px',
          border: '1px solid rgba(2,132,199,0.1)',
        }}>
          <p style={{ fontSize:'0.82rem', color:'#0c4a6e', fontWeight:600, margin:'0 0 0.4rem', fontFamily:serif }}>
            {{
              ja: '🎙 オーナーズ・ギャラリーに参加しませんか？',
              en: '🎙 Join the Owner\'s Gallery!',
              es: '🎙 ¡Únase a la Galería de Propietarios!',
            }[lang]}
          </p>
          <p style={{ fontSize:'0.78rem', color:'#475569', lineHeight:1.7, margin:'0 0 0.8rem' }}>
            {{
              ja: 'あなたの自慢の録音を空音開発のサイトで紹介しませんか？朝比奈幸太郎によるマスタリングも承ります。',
              en: 'Share your best recording on the Kuon R&D website. Mastering by Kotaro Asahina is also available.',
              es: 'Comparta su mejor grabación en el sitio de Kuon R&D. También disponible la masterización por Kotaro Asahina.',
            }[lang]}
          </p>
          <div style={{
            margin: '0.6rem 0 0.8rem',
            padding: '0.7rem 1rem',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '10px',
            border: '1px solid rgba(2,132,199,0.15)',
            display: 'inline-block',
          }}>
            <span style={{ fontSize:'0.7rem', color:'#64748b', letterSpacing:'0.08em' }}>
              {{
                ja: '投稿パスワード:',
                en: 'Submission password:',
                es: 'Contraseña de envío:',
              }[lang]}
            </span>
            <span style={{
              fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#0c4a6e',
              letterSpacing: '0.15em',
              marginLeft: '0.5rem',
            }}>
              kuon041755
            </span>
          </div>
          <p style={{ fontSize:'0.7rem', color:'#94a3b8', lineHeight:1.6, margin:'0 0 0.8rem' }}>
            {{
              ja: '※ このパスワードはご購入確認メールにも記載されています。',
              en: '* This password is also included in your purchase confirmation email.',
              es: '* Esta contraseña también está incluida en su correo de confirmación.',
            }[lang]}
          </p>
          <Link href="/microphone#gallery-submit" style={{ ...linkStyle, fontWeight:500, fontSize:'0.82rem' }}>
            {{
              ja: '録音を投稿する →',
              en: 'Submit a recording →',
              es: 'Enviar una grabación →',
            }[lang]}
          </Link>
        </div>

        {/* SoftBank Warning */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem 1.2rem',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '10px',
          textAlign: 'left',
        }}>
          <p style={{ color:'#92400e', fontSize:'0.78rem', lineHeight:1.7, margin:0 }}>
            {{
              ja: <>
                <strong>ソフトバンク（@softbank.ne.jp, @i.softbank.jp 等）のメールアドレスをご利用のお客様へ</strong><br/>
                迷惑メールフィルタの設定により、当社からの確認メールが届かない場合がございます。メールが届いていない場合は、お手数ですが別のメールアドレス（Gmail 等）を添えて<Link href="/#contact" style={{ color:'#0284c7' }}>お問い合わせフォーム</Link>よりご連絡ください。パスワードを再送いたします。
              </>,
              en: <>
                <strong>For customers using SoftBank email (@softbank.ne.jp, @i.softbank.jp, etc.)</strong><br/>
                Our confirmation emails may not be delivered due to spam filter settings. If you have not received an email, please contact us via the <Link href="/#contact" style={{ color:'#0284c7' }}>contact form</Link> with an alternative email address (e.g. Gmail). We will resend your passwords.
              </>,
              es: <>
                <strong>Para clientes con correo SoftBank (@softbank.ne.jp, @i.softbank.jp, etc.)</strong><br/>
                Es posible que nuestros correos no lleguen debido a filtros de spam. Si no ha recibido un correo, contáctenos a través del <Link href="/#contact" style={{ color:'#0284c7' }}>formulario de contacto</Link> con una dirección alternativa (ej. Gmail). Reenviaremos sus contraseñas.
              </>,
            }[lang]}
          </p>
        </div>

        {/* Bottom Links */}
        <div style={{
          marginTop: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
          alignItems: 'center',
        }}>
          <Link href="/microphone" style={linkStyle}>
            {t.backMic[lang]}
          </Link>
          <Link href="/" style={linkStyle}>
            {t.backHome[lang]}
          </Link>
        </div>
      </div>
    </div>
  );
}
