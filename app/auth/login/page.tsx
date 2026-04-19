'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

export default function LoginPage() {
  const { lang } = useLang();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      const res = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error');
        setSending(false);
        return;
      }
      setSent(true);
    } catch {
      setError(t3({ ja: '通信エラー', en: 'Network error', es: 'Error de red' }, lang));
    }
    setSending(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f0f9ff 100%)',
      padding: '2rem 1rem',
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: 'clamp(2rem, 5vw, 3rem)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: serif,
              fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
              fontWeight: 300,
              letterSpacing: '0.15em',
              color: '#111',
            }}>
              空音開発
            </span>
          </Link>
          <p style={{
            fontFamily: sans,
            fontSize: '0.75rem',
            color: '#999',
            letterSpacing: '0.12em',
            marginTop: 4,
          }}>
            KUON R&D
          </p>
        </div>

        {!sent ? (
          <>
            <h1 style={{
              fontFamily: serif,
              fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
              fontWeight: 400,
              textAlign: 'center',
              marginBottom: '0.5rem',
              color: '#111',
            }}>
              {t3({
                ja: 'ログイン / 新規登録',
                en: 'Log In / Sign Up',
                es: 'Iniciar sesion / Registrarse',
              }, lang)}
            </h1>
            <p style={{
              fontFamily: sans,
              fontSize: '0.85rem',
              color: '#666',
              textAlign: 'center',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}>
              {t3({
                ja: 'メールアドレスを入力するとログインリンクが届きます。パスワードは不要です。',
                en: 'Enter your email and we\'ll send you a login link. No password needed.',
                es: 'Ingresa tu email y te enviaremos un enlace. Sin contrasena.',
              }, lang)}
            </p>

            <form onSubmit={handleSubmit}>
              <label style={{
                display: 'block',
                fontFamily: sans,
                fontSize: '0.8rem',
                color: '#555',
                marginBottom: 6,
                letterSpacing: '0.05em',
              }}>
                {t3({ ja: 'メールアドレス', en: 'Email address', es: 'Correo electronico' }, lang)}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontFamily: sans,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = ACCENT)}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
              />

              {error && (
                <p style={{
                  color: '#dc2626',
                  fontSize: '0.8rem',
                  fontFamily: sans,
                  marginTop: 8,
                }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                style={{
                  width: '100%',
                  marginTop: '1.5rem',
                  padding: '0.9rem',
                  background: sending ? '#94a3b8' : ACCENT,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 50,
                  fontSize: '0.95rem',
                  fontFamily: sans,
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  cursor: sending ? 'wait' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {sending
                  ? t3({ ja: '送信中...', en: 'Sending...', es: 'Enviando...' }, lang)
                  : t3({ ja: 'ログインリンクを送信', en: 'Send Login Link', es: 'Enviar enlace' }, lang)
                }
              </button>
            </form>
          </>
        ) : (
          /* Sent state */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.8rem',
            }}>
              ✉
            </div>
            <h2 style={{
              fontFamily: serif,
              fontSize: '1.2rem',
              fontWeight: 400,
              marginBottom: '0.8rem',
              color: '#111',
            }}>
              {t3({
                ja: 'メールを送信しました',
                en: 'Email Sent',
                es: 'Correo enviado',
              }, lang)}
            </h2>
            <p style={{
              fontFamily: sans,
              fontSize: '0.85rem',
              color: '#666',
              lineHeight: 1.8,
            }}>
              {t3({
                ja: `${email} にログインリンクを送信しました。メールを確認してリンクをクリックしてください。`,
                en: `We sent a login link to ${email}. Check your inbox and click the link.`,
                es: `Enviamos un enlace a ${email}. Revisa tu bandeja y haz clic en el enlace.`,
              }, lang)}
            </p>
            <p style={{
              fontFamily: sans,
              fontSize: '0.75rem',
              color: '#999',
              marginTop: '1rem',
            }}>
              {t3({
                ja: '※ 15分以内に届かない場合は迷惑メールフォルダを確認してください',
                en: 'If you don\'t receive it within 15 minutes, check your spam folder',
                es: 'Si no lo recibes en 15 minutos, revisa tu carpeta de spam',
              }, lang)}
            </p>
          </div>
        )}

        {/* Back to top */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{
            fontFamily: sans,
            fontSize: '0.8rem',
            color: '#999',
            textDecoration: 'none',
          }}>
            {t3({ ja: '← トップに戻る', en: '← Back to Top', es: '← Volver al inicio' }, lang)}
          </Link>
        </div>
      </div>
    </div>
  );
}
