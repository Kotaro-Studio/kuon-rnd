'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

/**
 * AuthGate — 初回は無料で通過、2回目以降はログインを要求するゲートコンポーネント
 *
 * 使い方:
 *   <AuthGate appName="declipper">
 *     <YourAppContent />
 *   </AuthGate>
 *
 * 仕組み:
 * 1. localStorage の `kuon_first_visit_{appName}` をチェック
 * 2. 初回 → フラグをセットして children を表示（無料体験）
 * 3. 2回目以降 → kuon_user（localStorage）があれば通過、なければ登録モーダルを表示
 *
 * 聖域: /normalize は AuthGate を使用しない（kuon パスワードで保護）
 */
interface AuthGateProps {
  appName: string;
  children: ReactNode;
}

export function AuthGate({ appName, children }: AuthGateProps) {
  const { lang } = useLang();
  const [status, setStatus] = useState<'loading' | 'free' | 'authenticated' | 'gate'>('loading');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const firstVisitKey = `kuon_first_visit_${appName}`;
    const userJson = localStorage.getItem('kuon_user');
    const hasVisited = localStorage.getItem(firstVisitKey);

    // ユーザーがログイン済み
    if (userJson) {
      // アプリ利用をトラッキング
      trackUsage(appName);
      setStatus('authenticated');
      return;
    }

    // 初回訪問 → 無料で通過
    if (!hasVisited) {
      localStorage.setItem(firstVisitKey, Date.now().toString());
      setStatus('free');
      return;
    }

    // 2回目以降 & 未ログイン → ゲート表示
    setStatus('gate');
  }, [appName]);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid #e2e8f0',
          borderTopColor: ACCENT,
          borderRadius: '50%',
          animation: 'authgate-spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes authgate-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'free' || status === 'authenticated') {
    return <>{children}</>;
  }

  // Gate — 登録を促すオーバーレイ
  return (
    <div style={{ position: 'relative' }}>
      {/* アプリのコンテンツをぼかして表示 */}
      <div style={{
        filter: 'blur(6px)',
        opacity: 0.3,
        pointerEvents: 'none',
        userSelect: 'none',
        maxHeight: '100vh',
        overflow: 'hidden',
      }}>
        {children}
      </div>

      {/* 登録促進オーバーレイ */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}>
        <div style={{
          maxWidth: 440,
          width: '100%',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          padding: 'clamp(2rem, 5vw, 2.5rem)',
          textAlign: 'center',
        }}>
          {/* Logo */}
          <div style={{
            fontFamily: serif,
            fontSize: '1.3rem',
            fontWeight: 300,
            letterSpacing: '0.15em',
            color: '#111',
            marginBottom: '1.5rem',
          }}>
            空音開発
          </div>

          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            fontWeight: 400,
            color: '#111',
            marginBottom: '0.8rem',
            lineHeight: 1.6,
          }}>
            {t3({
              ja: '無料登録で、すべてのツールを\n継続してご利用いただけます',
              en: 'Sign up for free to continue\nusing all tools',
              es: 'Registrate gratis para seguir\nusando todas las herramientas',
            }, lang)}
          </h2>

          <p style={{
            fontFamily: sans,
            fontSize: '0.85rem',
            color: '#888',
            lineHeight: 1.8,
            marginBottom: '2rem',
          }}>
            {t3({
              ja: 'メールアドレスだけで登録完了。パスワード不要、30秒で完了します。',
              en: 'Just your email. No password needed, done in 30 seconds.',
              es: 'Solo tu email. Sin contrasena, listo en 30 segundos.',
            }, lang)}
          </p>

          {/* Features */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            textAlign: 'left',
            marginBottom: '2rem',
            padding: '0 0.5rem',
          }}>
            {[
              { ja: '15以上のオーディオツールが無料で使い放題', en: '15+ audio tools, free and unlimited', es: '15+ herramientas de audio, gratis e ilimitadas' },
              { ja: '利用状況の記録・成長の可視化', en: 'Track your usage and growth', es: 'Registra tu uso y crecimiento' },
              { ja: '新機能の優先アクセス', en: 'Early access to new features', es: 'Acceso anticipado a nuevas funciones' },
            ].map((text, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}>
                <span style={{
                  color: '#10b981',
                  fontSize: '1rem',
                  lineHeight: 1,
                  flexShrink: 0,
                }}>
                  ✓
                </span>
                <span style={{
                  fontFamily: sans,
                  fontSize: '0.8rem',
                  color: '#555',
                }}>
                  {t3(text, lang)}
                </span>
              </div>
            ))}
          </div>

          <Link href="/auth/login" style={{
            display: 'inline-block',
            width: '100%',
            padding: '0.9rem',
            background: ACCENT,
            color: '#fff',
            borderRadius: 50,
            textDecoration: 'none',
            fontFamily: sans,
            fontSize: '0.95rem',
            fontWeight: 500,
            letterSpacing: '0.08em',
            boxSizing: 'border-box',
          }}>
            {t3({
              ja: '無料で登録する',
              en: 'Sign Up for Free',
              es: 'Registrarse Gratis',
            }, lang)}
          </Link>

          <p style={{
            fontFamily: sans,
            fontSize: '0.7rem',
            color: '#bbb',
            marginTop: '1rem',
          }}>
            {t3({
              ja: '既にアカウントをお持ちの方もこちらからログインできます',
              en: 'Already have an account? You can log in here too',
              es: 'Ya tienes cuenta? Tambien puedes iniciar sesion aqui',
            }, lang)}
          </p>
        </div>
      </div>
    </div>
  );
}

/** アプリ利用をバックグラウンドでトラッキング（エラーは無視） */
function trackUsage(appName: string) {
  fetch('/api/auth/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app: appName }),
  }).catch(() => { /* silent */ });
}
