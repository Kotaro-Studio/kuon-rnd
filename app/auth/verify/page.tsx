'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: sans, color: '#555' }}>Loading...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const { lang } = useLang();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [userName, setUserName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMsg(t3({
        ja: 'トークンがありません',
        en: 'Missing token',
        es: 'Token no encontrado',
      }, lang));
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          setErrorMsg(data.error || 'Verification failed');
          return;
        }
        // JWT は HttpOnly Cookie に自動セット済み
        // localStorage にも最低限の情報を保存（AuthGate用）
        if (typeof window !== 'undefined') {
          localStorage.setItem('kuon_user', JSON.stringify({
            email: data.user?.email,
            name: data.user?.name,
            plan: data.user?.plan,
          }));
        }
        setUserName(data.user?.name || data.user?.email || '');
        setStatus('success');
      } catch {
        setStatus('error');
        setErrorMsg(t3({
          ja: '通信エラーが発生しました',
          en: 'Network error occurred',
          es: 'Error de red',
        }, lang));
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
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
        </div>

        {status === 'verifying' && (
          <>
            <div style={{
              width: 48,
              height: 48,
              border: '3px solid #e2e8f0',
              borderTopColor: '#0284c7',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1.5rem',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{
              fontFamily: sans,
              fontSize: '0.95rem',
              color: '#555',
            }}>
              {t3({
                ja: '認証中...',
                en: 'Verifying...',
                es: 'Verificando...',
              }, lang)}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.8rem',
              color: '#fff',
            }}>
              ✓
            </div>
            <h2 style={{
              fontFamily: serif,
              fontSize: '1.3rem',
              fontWeight: 400,
              marginBottom: '0.8rem',
              color: '#111',
            }}>
              {t3({
                ja: 'ログイン完了',
                en: 'Login Successful',
                es: 'Sesion iniciada',
              }, lang)}
            </h2>
            <p style={{
              fontFamily: sans,
              fontSize: '0.9rem',
              color: '#666',
              lineHeight: 1.8,
              marginBottom: '2rem',
            }}>
              {t3({
                ja: `ようこそ、${userName}さん。空音開発のすべてのツールをご利用いただけます。`,
                en: `Welcome, ${userName}. You now have access to all Kuon R&D tools.`,
                es: `Bienvenido, ${userName}. Ahora tienes acceso a todas las herramientas.`,
              }, lang)}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Link href="/audio-apps" style={{
                display: 'inline-block',
                padding: '0.8rem 2rem',
                background: '#0284c7',
                color: '#fff',
                borderRadius: 50,
                textDecoration: 'none',
                fontFamily: sans,
                fontSize: '0.9rem',
                letterSpacing: '0.08em',
              }}>
                {t3({ ja: 'アプリ一覧へ', en: 'Go to Apps', es: 'Ir a Apps' }, lang)}
              </Link>
              <Link href="/mypage" style={{
                display: 'inline-block',
                padding: '0.8rem 2rem',
                background: 'transparent',
                color: '#0284c7',
                border: '1px solid #0284c7',
                borderRadius: 50,
                textDecoration: 'none',
                fontFamily: sans,
                fontSize: '0.9rem',
                letterSpacing: '0.08em',
              }}>
                {t3({ ja: 'マイページ', en: 'My Page', es: 'Mi pagina' }, lang)}
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #f87171)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.6rem',
              color: '#fff',
            }}>
              ✕
            </div>
            <h2 style={{
              fontFamily: serif,
              fontSize: '1.2rem',
              fontWeight: 400,
              marginBottom: '0.8rem',
              color: '#111',
            }}>
              {t3({
                ja: '認証に失敗しました',
                en: 'Verification Failed',
                es: 'Verificacion fallida',
              }, lang)}
            </h2>
            <p style={{
              fontFamily: sans,
              fontSize: '0.85rem',
              color: '#666',
              lineHeight: 1.8,
              marginBottom: '1.5rem',
            }}>
              {errorMsg}
            </p>
            <Link href="/auth/login" style={{
              display: 'inline-block',
              padding: '0.8rem 2rem',
              background: '#0284c7',
              color: '#fff',
              borderRadius: 50,
              textDecoration: 'none',
              fontFamily: sans,
              fontSize: '0.9rem',
              letterSpacing: '0.08em',
            }}>
              {t3({ ja: 'もう一度ログイン', en: 'Try Again', es: 'Intentar de nuevo' }, lang)}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
