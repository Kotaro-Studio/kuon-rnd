'use client';

/**
 * HeaderFavoriteToggle — グローバルヘッダーに常駐する「☆ お気に入り」ボタン
 *
 * 動作:
 *   1. 現在の pathname を APP_CATALOG.launchHref と照合
 *   2. マッチしないページでは何も表示しない (admin/legal/LP 等で出ない)
 *   3. マッチしたら ☆ / ★ ボタンを表示
 *   4. クリック時:
 *      - 未ログイン → 登録誘導モーダル (IQ180 ナッジ)
 *      - ログイン済 → /api/auth/favorites を PUT してトグル
 *
 * 設計思想:
 *   - 未ログインでも星を表示 → 登録動機が自然に発生
 *   - 33 アプリの page.tsx に一切手を加えない (Header 1 ファイルだけ)
 *   - 動的ルート ([id] 等) は launchHref と一致しないため自動的に非表示
 */

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { APP_CATALOG } from '@/app/lib/app-catalog';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

const sans = '"Helvetica Neue", Arial, sans-serif';
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const ACCENT = '#0284c7';
const STAR_GOLD = '#f59e0b';

const LABELS = {
  add: {
    ja: 'お気に入りに追加',
    en: 'Add to favorites',
    es: 'Agregar a favoritos',
    ko: '즐겨찾기 추가',
    pt: 'Adicionar aos favoritos',
    de: 'Zu Favoriten hinzufügen',
  } as L3,
  remove: {
    ja: 'お気に入りから外す',
    en: 'Remove from favorites',
    es: 'Quitar de favoritos',
    ko: '즐겨찾기 해제',
    pt: 'Remover dos favoritos',
    de: 'Aus Favoriten entfernen',
  } as L3,
  nudgeTitle: {
    ja: 'お気に入り保存',
    en: 'Save to favorites',
    es: 'Guardar en favoritos',
    ko: '즐겨찾기 저장',
    pt: 'Salvar em favoritos',
    de: 'In Favoriten speichern',
  } as L3,
  nudgeBody: {
    ja: 'お気に入り機能の利用には登録（無料）が必要です。あなただけの道具箱を作りましょう。',
    en: 'Favorites need a free account. Build your own toolbox.',
    es: 'Los favoritos requieren una cuenta gratuita. Crea tu caja de herramientas.',
    ko: '즐겨찾기는 무료 계정이 필요합니다.',
    pt: 'Os favoritos requerem uma conta gratuita.',
    de: 'Favoriten benötigen ein kostenloses Konto.',
  } as L3,
  loginCta: {
    ja: '登録して保存する',
    en: 'Sign up & save',
    es: 'Registrarse y guardar',
    ko: '가입하고 저장',
    pt: 'Cadastrar e salvar',
    de: 'Registrieren & speichern',
  } as L3,
  closeBtn: {
    ja: '今はやめる',
    en: 'Maybe later',
    es: 'Quizás más tarde',
    ko: '나중에',
    pt: 'Mais tarde',
    de: 'Später',
  } as L3,
};

export function HeaderFavoriteToggle() {
  const { lang } = useLang();
  const pathname = usePathname();
  const [favorited, setFavorited] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ── 現在のページがアプリかどうか判定 ──
  const currentApp = APP_CATALOG.find((a) => a.launchHref === pathname);

  // ── ログイン状態検出 ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('kuon_user'));
    }
  }, [pathname]);

  // ── お気に入り状態の取得 ──
  useEffect(() => {
    if (!currentApp || !isLoggedIn) {
      setLoaded(true);
      return;
    }
    let mounted = true;
    fetch('/api/auth/favorites')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!mounted) return;
        const ids: string[] = Array.isArray(data?.ids) ? data.ids : [];
        setFavorited(ids.includes(currentApp.id));
        setLoaded(true);
      })
      .catch(() => {
        if (mounted) setLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, [currentApp?.id, isLoggedIn]);

  // ── トグル ──
  const handleToggle = useCallback(async () => {
    if (!currentApp) return;
    if (!isLoggedIn) {
      setShowNudge(true);
      return;
    }
    if (saving) return;

    const newState = !favorited;

    // Optimistic UI + bounce アニメーション
    setFavorited(newState);
    setBounce(true);
    setTimeout(() => setBounce(false), 400);
    setSaving(true);

    try {
      const cur = await fetch('/api/auth/favorites').then((r) => r.json());
      const ids: string[] = Array.isArray(cur?.ids) ? cur.ids : [];
      const next = newState
        ? ids.includes(currentApp.id)
          ? ids
          : [...ids, currentApp.id]
        : ids.filter((id) => id !== currentApp.id);

      await fetch('/api/auth/favorites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: next }),
      });
    } catch {
      // 失敗時はロールバック
      setFavorited(!newState);
    } finally {
      setSaving(false);
    }
  }, [currentApp, favorited, isLoggedIn, saving]);

  // ── アプリページでなければ何も出さない ──
  if (!currentApp) return null;

  const label = favorited ? t3(LABELS.remove, lang) : t3(LABELS.add, lang);

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={!loaded || saving}
        aria-label={label}
        title={label}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          cursor: !loaded || saving ? 'wait' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.15rem',
          lineHeight: 1,
          color: favorited ? STAR_GOLD : '#94a3b8',
          transition: 'all 0.18s ease',
          opacity: !loaded ? 0.55 : 1,
          padding: 0,
          transform: bounce ? 'scale(1.25)' : 'scale(1)',
        }}
        onMouseEnter={(e) => {
          if (loaded && !saving) {
            e.currentTarget.style.background = favorited
              ? 'rgba(245, 158, 11, 0.12)'
              : 'rgba(148, 163, 184, 0.12)';
            e.currentTarget.style.color = favorited ? STAR_GOLD : '#475569';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = favorited ? STAR_GOLD : '#94a3b8';
        }}
      >
        {favorited ? '★' : '☆'}
      </button>

      {/* ── 未ログインユーザー向け登録誘導モーダル (IQ180 ナッジ) ── */}
      {showNudge && (
        <div
          onClick={() => setShowNudge(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 18,
              maxWidth: 380,
              width: '100%',
              padding: '2.25rem 1.75rem 1.75rem',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.22)',
              textAlign: 'center',
              fontFamily: sans,
            }}
          >
            <div style={{ fontSize: '2.6rem', marginBottom: '0.55rem', lineHeight: 1 }}>⭐</div>
            <h3
              style={{
                fontFamily: serif,
                fontSize: '1.15rem',
                fontWeight: 500,
                margin: '0 0 0.7rem',
                color: '#0f172a',
              }}
            >
              {t3(LABELS.nudgeTitle, lang)}
            </h3>
            <p
              style={{
                fontSize: '0.88rem',
                color: '#475569',
                lineHeight: 1.65,
                margin: '0 0 1.5rem',
              }}
            >
              {t3(LABELS.nudgeBody, lang)}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <Link
                href="/auth/login"
                onClick={() => setShowNudge(false)}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  padding: '0.7rem 1.25rem',
                  background: ACCENT,
                  color: '#fff',
                  borderRadius: 999,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.85';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {t3(LABELS.loginCta, lang)}
              </Link>
              <button
                type="button"
                onClick={() => setShowNudge(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: '0.45rem',
                  fontFamily: sans,
                }}
              >
                {t3(LABELS.closeBtn, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
