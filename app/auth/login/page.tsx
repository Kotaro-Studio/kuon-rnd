'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

// ── Google Client ID (public, safe to expose) ──
const GOOGLE_CLIENT_ID = '342028960302-rmcnf6238nuucuccps033nibik1qigaf.apps.googleusercontent.com';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

// ── Google One Tap / Sign-In types ──
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Google credential callback ──
  const handleGoogleCredential = useCallback(async (response: { credential: string }) => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Google login failed');
        setGoogleLoading(false);
        return;
      }
      // Store user info in localStorage (same as verify page)
      if (data.user) {
        localStorage.setItem('kuon_user', JSON.stringify(data.user));
      }
      // 購入意図が保存されていれば / に戻して自動 Checkout 継続させる
      const pendingSubscribe = localStorage.getItem('kuon_pending_subscribe');
      if (pendingSubscribe) {
        router.push('/');
        return;
      }
      router.push('/mypage');
    } catch {
      setError(t3({ ja: '通信エラー', en: 'Network error', es: 'Error de red' }, lang));
      setGoogleLoading(false);
    }
  }, [lang, router]);

  // ── Load Google Identity Services script ──
  useEffect(() => {
    if (document.getElementById('google-gsi-script')) return;
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // ── Initialize Google button when script loads ──
  useEffect(() => {
    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      const btnEl = document.getElementById('google-signin-btn');
      if (btnEl) {
        window.google.accounts.id.renderButton(btnEl, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 320,
          locale: lang === 'ja' ? 'ja' : lang === 'ko' ? 'ko' : lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es' : 'en',
        });
      }
    };

    // Try immediately, then poll if script not yet loaded
    initGoogle();
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        initGoogle();
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [lang, handleGoogleCredential]);

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
                ko: '로그인 / 회원가입',
                pt: 'Entrar / Cadastrar',
                es: 'Iniciar sesion / Registrarse',
              }, lang)}
            </h1>
            <p style={{
              fontFamily: sans,
              fontSize: '0.82rem',
              color: '#666',
              textAlign: 'center',
              lineHeight: 1.7,
              marginBottom: '1.5rem',
            }}>
              {t3({
                ja: '無料で登録できます。パスワードは不要です。',
                en: 'Free to join. No password needed.',
                ko: '무료로 가입할 수 있습니다. 비밀번호가 필요 없습니다.',
                pt: 'Gratis para participar. Sem senha necessaria.',
                es: 'Gratis para unirse. Sin contrasena necesaria.',
              }, lang)}
            </p>

            {/* ── Google Sign-In Button ── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.2rem' }}>
              <div id="google-signin-btn" style={{ minHeight: 44 }} />
            </div>

            {googleLoading && (
              <p style={{ textAlign: 'center', color: ACCENT, fontSize: '0.85rem', fontFamily: sans, marginBottom: '1rem' }}>
                {t3({ ja: 'Googleで認証中...', en: 'Signing in with Google...', ko: 'Google 인증 중...', es: 'Iniciando con Google...' }, lang)}
              </p>
            )}

            {/* ── Divider ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              margin: '0.5rem 0 1.2rem',
            }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontFamily: sans, fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.08em' }}>
                {t3({ ja: 'または', en: 'or', ko: '또는', pt: 'ou', es: 'o' }, lang)}
              </span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>

            {/* ── Magic Link Form ── */}
            <form onSubmit={handleSubmit}>
              <label style={{
                display: 'block',
                fontFamily: sans,
                fontSize: '0.8rem',
                color: '#555',
                marginBottom: 6,
                letterSpacing: '0.05em',
              }}>
                {t3({ ja: 'メールアドレス', en: 'Email address', ko: '이메일 주소', pt: 'Endereco de email', es: 'Correo electronico' }, lang)}
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
                  marginTop: '1.2rem',
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
                  ? t3({ ja: '送信中...', en: 'Sending...', ko: '전송 중...', es: 'Enviando...' }, lang)
                  : t3({ ja: 'メールでログイン', en: 'Continue with Email', ko: '이메일로 로그인', es: 'Continuar con email' }, lang)
                }
              </button>
            </form>

            {/* ── Benefits nudge ── */}
            <div style={{
              marginTop: '1.5rem', padding: '1rem',
              background: '#f0f9ff', borderRadius: 10,
              border: '1px solid #e0f2fe',
            }}>
              <p style={{ fontFamily: sans, fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                {t3({ ja: '無料アカウントの特典', en: 'Free account benefits', ko: '무료 계정 혜택', es: 'Beneficios de cuenta gratuita' }, lang)}
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontFamily: sans, fontSize: '0.73rem', color: '#555', lineHeight: 1.9 }}>
                <li>{t3({ ja: '処理結果の保存・ダウンロード', en: 'Save & download results', ko: '결과 저장 및 다운로드', es: 'Guardar y descargar resultados' }, lang)}</li>
                <li>{t3({ ja: '練習スコアの成長グラフ', en: 'Practice score growth charts', ko: '연습 점수 성장 그래프', es: 'Graficos de progreso de practica' }, lang)}</li>
                <li>{t3({ ja: 'お気に入り設定の同期', en: 'Sync your preferences', ko: '즐겨찾기 설정 동기화', es: 'Sincronizar tus preferencias' }, lang)}</li>
              </ul>
            </div>
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
              color: '#fff',
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
                ko: '이메일을 보냈습니다',
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
                ko: `${email}에 로그인 링크를 보냈습니다. 받은 편지함을 확인하고 링크를 클릭하세요.`,
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
                ko: '15분 이내에 받지 못한 경우 스팸 폴더를 확인하세요',
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
            {t3({ ja: '← トップに戻る', en: '← Back to Top', ko: '← 홈으로', es: '← Volver al inicio' }, lang)}
          </Link>
        </div>
      </div>
    </div>
  );
}
