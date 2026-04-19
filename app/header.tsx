'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { LangSwitcher } from './lang-switcher';

// ─────────────────────────────────────────────
// Typography / Colors
// ─────────────────────────────────────────────
const serif  = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans   = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L3 = Partial<Record<Lang, string>> & { en: string };

type MenuItem = { href: string; label: L3 };

const MENU: MenuItem[] = [
  { href: '/',                  label: { ja: 'トップ',           en: 'Top',        ko: '홈',        pt: 'Início',     es: 'Inicio'     } },
  { href: '/audio-apps',        label: { ja: 'アプリ',           en: 'Apps',       ko: '앱',        pt: 'Apps',       es: 'Apps'       } },
  { href: '/microphone',        label: { ja: 'マイク',           en: 'Microphone', ko: '마이크',    pt: 'Microfone',  es: 'Micrófono'  } },
  { href: '/soundmap',          label: { ja: '地球音マップ',     en: 'Sound Map',  ko: '지구의 소리', pt: 'Sons da Terra', es: 'Sonidos' } },
  { href: '/#discover',         label: { ja: 'スカウト',         en: 'Discover',   ko: '디스커버',  pt: 'Descobrir',  es: 'Descubrir'  } },
];

const CONTACT: L3 = { ja: 'コンタクト', en: 'Contact', ko: '문의', pt: 'Contato', es: 'Contacto' };
const LOGIN: L3 = { ja: 'ログイン', en: 'Log In', ko: '로그인', pt: 'Entrar', es: 'Entrar' };
const MYPAGE: L3 = { ja: 'マイページ', en: 'My Page', ko: '마이페이지', pt: 'Minha Página', es: 'Mi Página' };

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
export function Header() {
  const { lang } = useLang();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('kuon_user'));
    }
  }, [pathname]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close the overlay on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // ─── Scroll-spy: track which in-page section is currently visible ───
  // Only runs on the home page ("/"), where same-page anchors like
  // "/#technology" exist. On other routes we just use pathname matching.
  const [activeHash, setActiveHash] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== '/') { setActiveHash(null); return; }

    // Collect all same-page anchor targets from the menu
    const hashes = MENU
      .map(m => m.href)
      .filter(h => h.startsWith('/#'))
      .map(h => h.slice(2));          // '/#technology' → 'technology'

    const elements = hashes
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) { setActiveHash(null); return; }

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry most prominently visible in the viewport
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHash('#' + visible.target.id);
      },
      // Bias detection toward sections occupying the center of the viewport
      { threshold: [0.25, 0.5, 0.75], rootMargin: '-30% 0px -40% 0px' }
    );

    elements.forEach(el => observer.observe(el));

    // Clear when scrolled near the top (hero area) so "Top" becomes active again
    const onScroll = () => {
      if (window.scrollY < 120) setActiveHash(null);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  const isActive = (href: string) => {
    // Home link: active only when on "/" AND no in-page section is highlighted
    if (href === '/') {
      return pathname === '/' && !activeHash;
    }
    // Anchor link
    if (href.includes('#')) {
      const [base, hash] = href.split('#');
      // Same-page anchor (e.g. "/#technology")
      if (base === '' || base === '/') {
        return pathname === '/' && activeHash === '#' + hash;
      }
      // Anchor on a different page (e.g. "/gps#gps-tools")
      return pathname === base;
    }
    // Plain route
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <>
      <header
        className="kuon-header"
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 'clamp(0.9rem, 1.6vw, 1.3rem) clamp(1rem, 4vw, 3rem)',
          background: scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.76)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          boxShadow: scrolled ? '0 6px 28px rgba(0,0,0,0.04)' : 'none',
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
          position: 'sticky', top: 0, zIndex: 200,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'baseline', gap: '0.55rem' }}>
          <span style={{
            fontFamily: serif, fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
            fontWeight: 400, letterSpacing: '0.18em',
          }}>
            空音開発
          </span>
          <span style={{
            fontFamily: sans, fontSize: '0.7rem', fontWeight: 400,
            letterSpacing: '0.18em', color: ACCENT, textTransform: 'uppercase',
          }}>
            Kuon R&amp;D
          </span>
        </Link>

        {/* Desktop navigation */}
        {!isMobile && (
          <nav
            aria-label="Primary"
            style={{ display: 'flex', gap: 'clamp(1.1rem, 2vw, 2rem)', alignItems: 'center' }}
          >
            {MENU.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    textDecoration: 'none',
                    color: active ? ACCENT : '#444',
                    fontFamily: sans, fontSize: '0.82rem',
                    letterSpacing: '0.14em', fontWeight: 400,
                    position: 'relative', paddingBottom: '0.25rem',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = ACCENT)}
                  onMouseOut={(e) => (e.currentTarget.style.color = active ? ACCENT : '#444')}
                >
                  {(item.label[lang] ?? item.label.en)}
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute', left: 0, right: 0, bottom: 0,
                      height: '1px', background: ACCENT,
                      transform: active ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.28s cubic-bezier(0.2,0.8,0.4,1)',
                    }}
                  />
                </Link>
              );
            })}

            <Link
              href="/#contact"
              style={{
                textDecoration: 'none',
                color: ACCENT, fontFamily: sans,
                fontSize: '0.78rem', letterSpacing: '0.14em', fontWeight: 500,
                padding: '0.5rem 1.3rem', borderRadius: '999px',
                border: `1px solid ${ACCENT}`,
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = ACCENT;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = ACCENT;
              }}
            >
              {(CONTACT[lang] ?? CONTACT.en)}
            </Link>

            <Link
              href={isLoggedIn ? '/mypage' : '/auth/login'}
              style={{
                textDecoration: 'none',
                color: '#fff', fontFamily: sans,
                fontSize: '0.78rem', letterSpacing: '0.14em', fontWeight: 500,
                padding: '0.5rem 1.3rem', borderRadius: '999px',
                background: ACCENT,
                transition: 'opacity 0.2s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {isLoggedIn ? (MYPAGE[lang] ?? MYPAGE.en) : (LOGIN[lang] ?? LOGIN.en)}
            </Link>

            <LangSwitcher />
          </nav>
        )}

        {/* Mobile: lang switcher + hamburger */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LangSwitcher />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              style={{
                width: 42, height: 42, borderRadius: '999px',
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer', padding: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s ease, transform 0.2s ease',
                zIndex: 220,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round">
                <line
                  x1="4" y1={mobileOpen ? '12' : '7'} x2="20" y2={mobileOpen ? '12' : '7'}
                  style={{ transform: mobileOpen ? 'rotate(45deg)' : 'rotate(0)', transformOrigin: 'center', transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.4,1)' }}
                />
                <line
                  x1="4" y1="12" x2="20" y2="12"
                  style={{ opacity: mobileOpen ? 0 : 1, transition: 'opacity 0.15s ease' }}
                />
                <line
                  x1="4" y1={mobileOpen ? '12' : '17'} x2="20" y2={mobileOpen ? '12' : '17'}
                  style={{ transform: mobileOpen ? 'rotate(-45deg)' : 'rotate(0)', transformOrigin: 'center', transition: 'transform 0.3s cubic-bezier(0.2,0.8,0.4,1)' }}
                />
              </svg>
            </button>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────
          Mobile fullscreen overlay
      ───────────────────────────────────────────── */}
      {isMobile && (
        <div
          aria-hidden={!mobileOpen}
          style={{
            position: 'fixed', inset: 0, zIndex: 210,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? 'auto' : 'none',
            transition: 'opacity 0.32s cubic-bezier(0.2,0.8,0.4,1)',
            display: 'flex', flexDirection: 'column',
            padding: '6rem clamp(1.5rem, 6vw, 3rem) 2.5rem',
            overflowY: 'auto',
          }}
        >
          {/* Decorative accent */}
          <div
            aria-hidden
            style={{
              position: 'absolute', top: '-8%', left: '-12%',
              width: 360, height: 360, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(2,132,199,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <nav
            aria-label="Mobile primary"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative', zIndex: 1 }}
          >
            {MENU.map((item, idx) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    textDecoration: 'none',
                    color: active ? ACCENT : '#1a1a1a',
                    fontFamily: serif,
                    fontSize: 'clamp(1.4rem, 5vw, 1.9rem)',
                    fontWeight: 300,
                    letterSpacing: '0.08em',
                    padding: '0.85rem 0',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    transform: mobileOpen ? 'translateY(0)' : 'translateY(12px)',
                    opacity: mobileOpen ? 1 : 0,
                    transition: `opacity 0.4s ease ${0.08 + idx * 0.04}s, transform 0.4s cubic-bezier(0.2,0.8,0.4,1) ${0.08 + idx * 0.04}s`,
                    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  }}
                >
                  <span>{(item.label[lang] ?? item.label.en)}</span>
                  <span style={{ fontFamily: sans, fontSize: '0.7rem', color: '#bbb', letterSpacing: '0.18em' }}>
                    0{idx + 1}
                  </span>
                </Link>
              );
            })}

            <Link
              href="/#contact"
              onClick={() => setMobileOpen(false)}
              style={{
                marginTop: '2rem',
                textDecoration: 'none', textAlign: 'center',
                fontFamily: sans, fontSize: '0.88rem',
                letterSpacing: '0.2em', fontWeight: 600,
                color: '#fff', background: ACCENT,
                padding: '1.1rem 2rem', borderRadius: '999px',
                boxShadow: '0 12px 32px rgba(2,132,199,0.4)',
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? 'translateY(0)' : 'translateY(14px)',
                transition: `opacity 0.45s ease ${0.08 + MENU.length * 0.04}s, transform 0.45s cubic-bezier(0.2,0.8,0.4,1) ${0.08 + MENU.length * 0.04}s`,
              }}
            >
              {(CONTACT[lang] ?? CONTACT.en).toUpperCase()}
            </Link>

            <Link
              href={isLoggedIn ? '/mypage' : '/auth/login'}
              onClick={() => setMobileOpen(false)}
              style={{
                marginTop: '0.8rem',
                textDecoration: 'none', textAlign: 'center',
                fontFamily: sans, fontSize: '0.88rem',
                letterSpacing: '0.2em', fontWeight: 500,
                color: ACCENT, background: 'transparent',
                padding: '0.9rem 2rem', borderRadius: '999px',
                border: `1.5px solid ${ACCENT}`,
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? 'translateY(0)' : 'translateY(14px)',
                transition: `opacity 0.48s ease ${0.12 + MENU.length * 0.04}s, transform 0.48s cubic-bezier(0.2,0.8,0.4,1) ${0.12 + MENU.length * 0.04}s`,
              }}
            >
              {(isLoggedIn ? (MYPAGE[lang] ?? MYPAGE.en) : (LOGIN[lang] ?? LOGIN.en)).toUpperCase()}
            </Link>
          </nav>

          {/* Lang switcher at bottom */}
          <div
            style={{
              marginTop: 'auto', paddingTop: '3rem',
              display: 'flex', justifyContent: 'center',
              opacity: mobileOpen ? 1 : 0,
              transition: `opacity 0.5s ease ${0.1 + (MENU.length + 1) * 0.04}s`,
            }}
          >
            <LangSwitcher variant="stacked" />
          </div>
        </div>
      )}
    </>
  );
}
