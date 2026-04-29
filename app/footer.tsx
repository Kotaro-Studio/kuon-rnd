'use client';

import Link from 'next/link';
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
const BG_DARK = '#111111';
const BG_DARKER = '#0a0a0a';

type L3 = Partial<Record<Lang, string>> & { en: string };

interface FooterLink {
  href: string;
  label: L3;
}

const PRODUCTS: FooterLink[] = [
  { href: '/audio-apps',  label: { ja: 'オーディオアプリ', en: 'Audio Apps', ko: '오디오 앱', pt: 'Apps de Áudio', es: 'Aplicaciones de Audio' } },
  // 2026-04-26 削除: マイク (国際公平性のため・Kotaro Studio 外部リンクのみで流入)
  // 2026-04-26 ヘッダーから移動
  { href: '/soundmap',    label: { ja: '地球音マップ', en: 'Sound Map', ko: '지구 음향 맵', pt: 'Mapa de Sons', es: 'Mapa de Sonidos' } },
  { href: '/events-lp',   label: { ja: 'ライブ情報', en: "Today's Live", ko: '공연 정보', pt: 'Ao Vivo', es: 'En Vivo' } },
  { href: '/gps',         label: { ja: 'GPSアプリ', en: 'GPS Apps', ko: 'GPS 앱', pt: 'Apps GPS', es: 'Apps GPS' } },
  { href: '/player-lp',   label: { ja: 'KUON PLAYER', en: 'KUON PLAYER', ko: 'KUON PLAYER', pt: 'KUON PLAYER', es: 'KUON PLAYER' } },
  { href: '/gallery',     label: { ja: 'ギャラリー', en: 'Gallery', ko: '갤러리', pt: 'Galeria', es: 'Galería' } },
];

const LEGAL: FooterLink[] = [
  { href: '/legal/tokushoho', label: { ja: '特定商取引法に基づく表記', en: 'Specified Commercial Transaction Act', ko: '특정 상거래법', pt: 'Lei de Transação Comercial', es: 'Ley de Transacción Comercial' } },
  { href: '/legal/privacy',   label: { ja: 'プライバシーポリシー', en: 'Privacy Policy', ko: '개인정보보호정책', pt: 'Política de Privacidade', es: 'Política de Privacidad' } },
  { href: '/legal/terms',     label: { ja: '利用規約', en: 'Terms of Use', ko: '이용 약관', pt: 'Termos de Uso', es: 'Términos de Uso' } },
];

const ABOUT: FooterLink[] = [
  { href: '/profile',     label: { ja: 'プロフィール', en: 'Developer Profile', ko: '개발자 프로필', pt: 'Perfil', es: 'Perfil del Desarrollador' } },
  // 2026-04-29 削除: /for-schools — 機能していないため、ページごと削除した
  { href: '/#contact',    label: { ja: 'お問い合わせ', en: 'Contact', ko: '문의', pt: 'Contato', es: 'Contacto' } },
  { href: '/mypage',      label: { ja: 'マイページ', en: 'My Page', ko: '마이페이지', pt: 'Minha Página', es: 'Mi Página' } },
];

const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

// ─────────────────────────────────────────────
// Footer Component
// ─────────────────────────────────────────────

export function Footer() {
  const { lang } = useLang();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <footer
      style={{
        background: `linear-gradient(135deg, ${BG_DARK} 0%, ${BG_DARKER} 100%)`,
        color: '#e5e5e5',
        fontFamily: sans,
        marginTop: 'clamp(3rem, 10vw, 6rem)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* ─── Main footer content ─── */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: 'clamp(3rem, 8vw, 5rem) clamp(1.5rem, 5vw, 3rem)',
        }}
      >
        {/* Logo + tagline */}
        <div
          style={{
            marginBottom: 'clamp(2.5rem, 6vw, 3.5rem)',
            paddingBottom: 'clamp(2rem, 5vw, 2.8rem)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '0.6rem',
              marginBottom: '0.6rem',
            }}
          >
            <span
              style={{
                fontFamily: serif,
                fontSize: 'clamp(1.05rem, 2vw, 1.3rem)',
                fontWeight: 400,
                letterSpacing: '0.18em',
                color: '#ffffff',
              }}
            >
              空音開発
            </span>
            <span
              style={{
                fontFamily: sans,
                fontSize: '0.7rem',
                fontWeight: 500,
                letterSpacing: '0.18em',
                color: ACCENT,
                textTransform: 'uppercase',
              }}
            >
              Kuon R&amp;D
            </span>
          </Link>
          <p
            style={{
              fontFamily: sans,
              fontSize: '0.85rem',
              lineHeight: 1.6,
              color: '#a8a8a8',
              maxWidth: '400px',
              margin: '0.8rem 0 0 0',
              fontWeight: 300,
            }}
          >
            {lang === 'ja' && '音大生のための、次世代オーディオプラットフォーム'}
            {lang === 'en' && 'Next-generation audio platform for musicians'}
            {lang === 'ko' && '음악 학생을 위한 차세대 오디오 플랫폼'}
            {lang === 'pt' && 'Plataforma de áudio de próxima geração para músicos'}
            {lang === 'es' && 'Plataforma de audio de próxima generación para músicos'}
          </p>
        </div>

        {/* Three-column grid or stacked */}
        <div
          style={{
            display: isMobile ? 'flex' : 'grid',
            flexDirection: isMobile ? 'column' : 'row',
            gridTemplateColumns: isMobile ? undefined : '1fr 1fr 1fr',
            gap: isMobile ? '2.5rem' : 'clamp(2rem, 4vw, 3.5rem)',
            marginBottom: 'clamp(2.5rem, 6vw, 3.5rem)',
          }}
        >
          {/* Column 1: Products */}
          <div>
            <h3
              style={{
                fontFamily: serif,
                fontSize: '0.95rem',
                fontWeight: 400,
                letterSpacing: '0.12em',
                color: '#ffffff',
                marginBottom: '1.2rem',
                textTransform: 'uppercase',
              }}
            >
              {t3({ ja: 'プロダクト', en: 'Products', ko: '제품', pt: 'Produtos', es: 'Productos' }, lang)}
            </h3>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
              }}
            >
              {PRODUCTS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      color: '#a8a8a8',
                      fontSize: '0.85rem',
                      fontWeight: 300,
                      lineHeight: 1.5,
                      transition: 'color 0.25s ease',
                      display: 'inline-flex',
                      position: 'relative',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = ACCENT;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#a8a8a8';
                    }}
                  >
                    {t3(link.label, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Legal */}
          <div>
            <h3
              style={{
                fontFamily: serif,
                fontSize: '0.95rem',
                fontWeight: 400,
                letterSpacing: '0.12em',
                color: '#ffffff',
                marginBottom: '1.2rem',
                textTransform: 'uppercase',
              }}
            >
              {t3({ ja: 'リーガル', en: 'Legal', ko: '법적', pt: 'Legal', es: 'Legal' }, lang)}
            </h3>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
              }}
            >
              {LEGAL.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      color: '#a8a8a8',
                      fontSize: '0.85rem',
                      fontWeight: 300,
                      lineHeight: 1.5,
                      transition: 'color 0.25s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = ACCENT;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#a8a8a8';
                    }}
                  >
                    {t3(link.label, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: About */}
          <div>
            <h3
              style={{
                fontFamily: serif,
                fontSize: '0.95rem',
                fontWeight: 400,
                letterSpacing: '0.12em',
                color: '#ffffff',
                marginBottom: '1.2rem',
                textTransform: 'uppercase',
              }}
            >
              {t3({ ja: '私たちについて', en: 'About Us', ko: '소개', pt: 'Sobre Nós', es: 'Sobre Nosotros' }, lang)}
            </h3>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.7rem',
              }}
            >
              {ABOUT.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      color: '#a8a8a8',
                      fontSize: '0.85rem',
                      fontWeight: 300,
                      lineHeight: 1.5,
                      transition: 'color 0.25s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = ACCENT;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = '#a8a8a8';
                    }}
                  >
                    {t3(link.label, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
            margin: 'clamp(2rem, 5vw, 2.5rem) 0',
          }}
        />

        {/* Bottom bar: copyright + lang switcher */}
        <div
          style={{
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'space-between',
            alignItems: isMobile ? 'center' : 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '1.5rem' : 0,
            fontSize: '0.8rem',
            color: '#757575',
            lineHeight: 1.6,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: sans,
              fontWeight: 300,
              textAlign: isMobile ? 'center' : 'left',
            }}
          >
            © 2026 Kuon R&amp;D / Kotaro Asahina. All rights reserved.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LangSwitcher />
          </div>
        </div>
      </div>

    </footer>
  );
}
