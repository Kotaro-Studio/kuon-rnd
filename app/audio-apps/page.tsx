'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L3 = Record<Lang, string>;

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const mono  = '"SF Mono", "Fira Code", "Consolas", monospace';

// ─────────────────────────────────────────────
// App data
// ─────────────────────────────────────────────
type AppEntry = {
  id: string;
  number: string;
  badge: string;
  badgeType: 'paid' | 'exclusive' | 'free';
  name: string;
  tagline: L3;
  desc: L3;
  href: string;
  accent: string;
  price: L3;
  cta: L3;
  isNew?: boolean;
};

const apps: AppEntry[] = [
  {
    id: 'player',
    number: '09',
    badge: '24H',
    badgeType: 'free',
    name: 'KUON PLAYER',
    tagline: {
      ja: '音声を共有する。\n24時間で、消える。',
      en: 'Share audio.\nGone in 24 hours.',
      es: 'Comparte audio.\nDesaparece en 24 horas.',
    },
    desc: {
      ja: 'MP3をアップロードし、パスワード付き共有リンクを生成。再生開始から24時間で自動削除。ストリーミング再生のみ・ダウンロード不可。安全な音声共有。',
      en: 'Upload MP3, generate a password-protected share link. Auto-deleted 24 hours after first play. Streaming only — no downloads. Secure audio sharing.',
      es: 'Sube MP3, genera un enlace protegido con contraseña. Se elimina automáticamente 24 horas después de la primera reproducción. Solo streaming — sin descargas.',
    },
    href: '/player-lp',
    accent: '#059669',
    price: { ja: '無料', en: 'Free', es: 'Gratis' },
    cta: { ja: '詳細を見る', en: 'Learn More', es: 'Ver más' },
    isNew: true,
  },
  {
    id: 'master-check',
    number: '06',
    badge: 'LUFS',
    badgeType: 'free',
    name: 'KUON MASTER CHECK',
    tagline: {
      ja: '配信前の最終チェックを、\nブラウザだけで完結させる。',
      en: 'Complete your pre-release\nquality check in the browser.',
      es: 'Completa tu verificación\nfinal directamente en el navegador.',
    },
    desc: {
      ja: 'LUFS・True Peak・クリッピング・ステレオ相関を一括チェック。各配信基準との比較＋ワンクリックでラウドネス自動調整＆WAVダウンロード。リミッター付き。',
      en: 'Check LUFS, True Peak, clipping, stereo correlation at once. Compare with platform targets + one-click auto-adjust with limiter & WAV download.',
      es: 'Verifica LUFS, True Peak, clipping, correlación estéreo. Compara con plataformas + ajuste automático con limitador y descarga WAV en un clic.',
    },
    href: '/master-check-lp',
    accent: '#0284c7',
    price: { ja: '無料', en: 'Free', es: 'Gratis' },
    cta: { ja: '詳細を見る', en: 'Learn More', es: 'Ver más' },
    isNew: true,
  },
  {
    id: 'dsd',
    number: '08',
    badge: 'DSD',
    badgeType: 'free',
    name: 'KUON DSD',
    tagline: {
      ja: 'DSD を、ブラウザで再生する。\n世界初の WebAssembly 駆動。',
      en: 'Play DSD in your browser.\nWorld\'s first, powered by WebAssembly.',
      es: 'Reproduce DSD en tu navegador.\nEl primero del mundo, con WebAssembly.',
    },
    desc: {
      ja: 'DSD ファイル（DSF/DFF）をブラウザで再生＆高品質 WAV に変換。DSD64/128/256 対応、サンプルレート選択（44.1k〜192kHz）、24bit 出力。Rust WebAssembly 駆動。',
      en: 'Play & convert DSD files (DSF/DFF) in your browser. DSD64/128/256, sample rate selection (44.1k–192kHz), 24-bit WAV output. Powered by Rust WebAssembly.',
      es: 'Reproduce y convierte archivos DSD (DSF/DFF) en tu navegador. DSD64/128/256, selección de frecuencia (44.1k–192kHz), salida WAV 24-bit. Rust WebAssembly.',
    },
    href: '/dsd-lp',
    accent: '#7C3AED',
    price: { ja: '無料', en: 'Free', es: 'Gratis' },
    cta: { ja: '詳細を見る', en: 'Learn More', es: 'Ver más' },
    isNew: true,
  },
  {
    id: 'converter',
    number: '07',
    badge: 'MP3',
    badgeType: 'free',
    name: 'KUON CONVERTER',
    tagline: {
      ja: 'WAV を高品質 MP3 に。\nブラウザだけで、一瞬で変換。',
      en: 'WAV to high-quality MP3.\nInstant conversion in your browser.',
      es: 'WAV a MP3 de alta calidad.\nConversión instantánea en tu navegador.',
    },
    desc: {
      ja: 'WAV ファイルを 320kbps / 160kbps の高品質 MP3 に変換。サーバー送信なし・インストール不要。マスタリング後の配信用 MP3 作成に。',
      en: 'Convert WAV to 320kbps / 160kbps high-quality MP3. No server upload, no install. Perfect for distribution-ready MP3 after mastering.',
      es: 'Convierte WAV a MP3 de 320kbps / 160kbps. Sin subir al servidor, sin instalación. Perfecto para MP3 de distribución.',
    },
    href: '/converter',
    accent: '#0284c7',
    price: { ja: '無料', en: 'Free', es: 'Gratis' },
    cta: { ja: 'アプリを開く', en: 'Open App', es: 'Abrir app' },
    isNew: true,
  },
  {
    id: 'ddp-checker',
    number: '05',
    badge: 'DDP',
    badgeType: 'free',
    name: 'DDP CHECKER',
    tagline: {
      ja: 'DDPファイルの中身を、\nブラウザだけで確認する。',
      en: 'Verify DDP file contents\nright in your browser.',
      es: 'Verifica el contenido DDP\ndirectamente en tu navegador.',
    },
    desc: {
      ja: 'CDマスタリング用DDPファイルセットの構造検証・トラックリスト表示・各トラック試聴・WAVダウンロード。完全ローカル処理。',
      en: 'Verify CD mastering DDP filesets — track list, audio preview, WAV download. 100% local processing, no install.',
      es: 'Verifica conjuntos DDP para masterización de CD — lista de pistas, vista previa, descarga WAV. 100% local.',
    },
    href: '/ddp-checker-lp',
    accent: '#0284c7',
    price: { ja: '無料', en: 'Free', es: 'Gratis' },
    cta: { ja: '詳細を見る', en: 'Learn More', es: 'Ver más' },
  },
  {
    id: 'itadaki',
    number: '01',
    badge: 'DECLIP',
    badgeType: 'paid',
    name: 'KUON ITADAKI',
    tagline: {
      ja: 'アンプの限界で失われたピークを、\n数学的に甦らせる。',
      en: 'Mathematically restore the peaks\ndestroyed by analog clipping.',
      es: 'Restaura matemáticamente los picos\nperdidos por el clipping analógico.',
    },
    desc: {
      ja: 'エルミートスプライン補間による非対称クリッピング専用修復エンジン。失われた波形を自然なドーム状の曲線として再構築します。',
      en: 'A declipping engine using Cubic Hermite Spline interpolation, purpose-built for asymmetrical analog distortion.',
      es: 'Motor de restauración basado en interpolación Hermite cúbica, diseñado para la distorsión analógica asimétrica.',
    },
    href: '/itadaki-lp',
    accent: '#0099BB',
    price: { ja: '¥1,980', en: '$14.99', es: '$14.99' },
    cta: { ja: '詳細を見る', en: 'Learn More', es: 'Ver más' },
  },
  {
    id: 'normalize',
    number: '02',
    badge: 'NORMALIZE',
    badgeType: 'exclusive',
    name: 'KUON NORMALIZE',
    tagline: {
      ja: 'マイクを買った、その日から。\nブラウザが、スタジオになる。',
      en: 'The day you get the mic,\nyour browser becomes a studio.',
      es: 'Desde el día que recibes el micro,\ntu navegador se convierte en estudio.',
    },
    desc: {
      ja: 'ピークノーマライズ・ラウドネス最適化・シグネチャーEQ・ホールリバーブを搭載。マイク購入者限定。',
      en: 'Peak normalize, loudness optimization, signature EQ, and hall reverb. Mic owners exclusive.',
      es: 'Normalización de picos, optimización de loudness, EQ signature y reverb de sala. Exclusivo para compradores del micrófono.',
    },
    href: '/normalize-lp',
    accent: '#059669',
    price: { ja: 'マイク同梱', en: 'Mic Bundle', es: 'Incluido' },
    cta: { ja: '詳細を見る', en: 'Learn More', es: 'Ver más' },
  },
  {
    id: 'noise-reduction',
    number: '03',
    badge: 'DENOISE',
    badgeType: 'free',
    name: 'KUON DENOISE',
    tagline: {
      ja: 'エアコン、機材ハム、環境音。\n定常ノイズをスペクトルから消す。',
      en: 'AC hum, gear noise, ambience.\nErase steady noise from the spectrum.',
      es: 'Zumbido, ruido del equipo, ambiente.\nBorra el ruido constante del espectro.',
    },
    desc: {
      ja: 'スペクトル減算法によるブラウザ完結型ノイズリダクション。周波数スペクトルを可視化しながら除去強度をリアルタイムに調整。',
      en: 'Browser-native noise reduction via spectral subtraction. Visualize the frequency spectrum and adjust removal strength in real time.',
      es: 'Reducción de ruido nativa del navegador mediante sustracción espectral. Visualiza el espectro y ajusta la intensidad en tiempo real.',
    },
    href: '/noise-reduction',
    accent: '#7C3AED',
    price: { ja: '無料', en: 'Free', es: 'Gratis' },
    cta: { ja: 'アプリを開く', en: 'Open App', es: 'Abrir app' },
  },
  {
    id: 'dual-mono',
    number: '04',
    badge: 'STEREO',
    badgeType: 'free',
    name: 'KUON DUAL',
    tagline: {
      ja: 'モノラルに、広がりを与える。\nデュアルモノ、または擬似ステレオへ。',
      en: 'Give mono a sense of space.\nConvert to dual mono or pseudo stereo.',
      es: 'Dale amplitud al mono.\nConvierte a dual mono o pseudo estéreo.',
    },
    desc: {
      ja: 'モノラル音声をデュアルモノまたはHaas効果＋MS処理による擬似ステレオに変換。ステレオ幅をスライダーでコントロール。',
      en: 'Convert mono to dual mono or pseudo stereo using Haas effect and M/S processing. Control stereo width with a slider.',
      es: 'Convierte audio mono a dual mono o pseudo estéreo mediante el efecto Haas y procesamiento M/S.',
    },
    href: '/dual-mono',
    accent: '#D97706',
    price: { ja: '無料', en: 'Free', es: 'Gratis' },
    cta: { ja: 'アプリを開く', en: 'Open App', es: 'Abrir app' },
  },
];

// ─────────────────────────────────────────────
// Badge style resolver
// ─────────────────────────────────────────────
function badgeMeta(type: 'paid' | 'exclusive' | 'free', lang: Lang) {
  if (type === 'free') return {
    label: ({ ja: '無料', en: 'FREE', es: 'GRATIS' } as L3)[lang],
    bg: 'rgba(5,150,105,0.1)', color: '#059669', dot: '#059669',
  };
  if (type === 'exclusive') return {
    label: ({ ja: '限定', en: 'EXCLUSIVE', es: 'EXCLUSIVO' } as L3)[lang],
    bg: '#1a1a2e', color: '#fbbf24', dot: '#fbbf24',
  };
  return {
    label: ({ ja: '有料', en: 'PAID', es: 'PREMIUM' } as L3)[lang],
    bg: 'rgba(245,158,11,0.1)', color: '#b45309', dot: '#f59e0b',
  };
}

// ─────────────────────────────────────────────
// Scroll reveal
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

// ─────────────────────────────────────────────
// Single app row — full-width horizontal layout
// ─────────────────────────────────────────────
function AppRow({ app, index, lang }: { app: AppEntry; index: number; lang: Lang }) {
  const ref = useReveal();
  const bm = badgeMeta(app.badgeType, lang);

  return (
    <div
      ref={ref}
      className="reveal"
      style={{ transitionDelay: `${index * 0.06}s`, position: 'relative' }}
    >
      {/* ── NEW RELEASE accent line ── */}
      {app.isNew && (
        <div style={{
          position: 'absolute',
          top: -1,
          left: 0,
          right: 0,
          height: 3,
          borderRadius: '24px 24px 0 0',
          background: `linear-gradient(90deg, ${app.accent}, #7C3AED, ${app.accent})`,
          zIndex: 2,
        }} />
      )}
      {app.isNew && (
        <div style={{
          position: 'absolute',
          top: 14,
          right: 20,
          zIndex: 3,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.16em',
          color: '#fff',
          background: `linear-gradient(135deg, ${app.accent}, #7C3AED)`,
          padding: '5px 14px',
          borderRadius: 50,
          boxShadow: `0 4px 16px ${app.accent}40`,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#fff',
            display: 'inline-block',
          }} />
          NEW RELEASE
        </div>
      )}
      <Link href={app.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            borderRadius: 24,
            overflow: 'hidden',
            background: app.isNew
              ? 'rgba(255,255,255,0.7)'
              : 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: app.isNew
              ? `1px solid ${app.accent}30`
              : '1px solid rgba(255,255,255,0.8)',
            boxShadow: app.isNew
              ? `0 8px 32px ${app.accent}12, 0 0 0 1px ${app.accent}10`
              : '0 4px 24px rgba(0,0,0,0.03)',
            transition: 'all 0.45s cubic-bezier(0.175,0.885,0.32,1.275)',
            cursor: 'pointer',
            minHeight: 280,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 24px 48px ${app.accent}18, 0 0 0 1px ${app.accent}20`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = app.isNew
              ? `0 8px 32px ${app.accent}12, 0 0 0 1px ${app.accent}10`
              : '0 4px 24px rgba(0,0,0,0.03)';
          }}
        >
          {/* ── Accent side panel ── */}
          <div style={{
            width: 'clamp(100px, 18vw, 200px)',
            minWidth: 100,
            background: `linear-gradient(160deg, ${app.accent}12, ${app.accent}06)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
            position: 'relative',
            flexShrink: 0,
          }}>
            {/* Large number */}
            <span style={{
              fontFamily: mono,
              fontSize: 'clamp(48px, 8vw, 72px)',
              fontWeight: 800,
              color: `${app.accent}15`,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              userSelect: 'none',
            }}>
              {app.number}
            </span>
            {/* Category badge */}
            <span style={{
              marginTop: 12,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: app.accent,
              background: `${app.accent}12`,
              padding: '4px 14px',
              borderRadius: 50,
              border: `1px solid ${app.accent}20`,
            }}>
              {app.badge}
            </span>
          </div>

          {/* ── Content ── */}
          <div style={{
            flex: 1,
            padding: 'clamp(24px, 4vw, 40px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            {/* Top: name + status badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 14,
              flexWrap: 'wrap',
            }}>
              <h2 style={{
                fontFamily: sans,
                fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: '#111827',
                margin: 0,
              }}>
                {app.name}
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: bm.color,
                background: bm.bg,
                padding: '4px 12px',
                borderRadius: 50,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: bm.dot, display: 'inline-block',
                }} />
                {bm.label}
              </span>
            </div>

            {/* Tagline — serif italic feeling */}
            <p style={{
              fontFamily: serif,
              fontSize: 'clamp(15px, 2.2vw, 18px)',
              fontWeight: 500,
              color: '#1f2937',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
              marginBottom: 12,
            }}>
              {app.tagline[lang]}
            </p>

            {/* Description */}
            <p style={{
              fontSize: 'clamp(12px, 1.8vw, 14px)',
              color: '#6b7280',
              lineHeight: 1.8,
              marginBottom: 20,
              maxWidth: 520,
            }}>
              {app.desc[lang]}
            </p>

            {/* Bottom: price + CTA */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}>
              <span style={{
                fontFamily: mono,
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontWeight: 700,
                color: app.accent,
              }}>
                {app.price[lang]}
              </span>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: app.accent,
                padding: '8px 24px',
                borderRadius: 50,
                border: `1px solid ${app.accent}30`,
                background: `${app.accent}08`,
                transition: 'all 0.25s ease',
              }}>
                {app.cta[lang]} →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function AudioAppsPage() {
  const { lang } = useLang();

  return (
    <div style={{
      maxWidth: 1000,
      margin: '0 auto',
      padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 40px)',
    }}>

      {/* ═══════════════════════════════════ */}
      {/* HERO                                */}
      {/* ═══════════════════════════════════ */}
      <section style={{
        textAlign: 'center',
        paddingTop: 'clamp(32px, 8vw, 80px)',
        paddingBottom: 'clamp(48px, 10vw, 100px)',
        position: 'relative',
      }}>
        <div className="hero-enter-1" style={{ position: 'relative' }}>
          {/* Stats row */}
          <div style={{
            display: 'inline-flex',
            gap: 32,
            marginBottom: 32,
            padding: '12px 28px',
            borderRadius: 50,
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 800, color: '#0284c7' }}>
                {apps.length}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.12em', fontWeight: 600 }}>
                TOOLS
              </div>
            </div>
            <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 800, color: '#059669' }}>
                {apps.filter(a => a.badgeType === 'free').length}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.12em', fontWeight: 600 }}>
                FREE
              </div>
            </div>
            <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 800, color: '#111827' }}>
                0
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.12em', fontWeight: 600 }}>
                {({ ja: 'インストール', en: 'INSTALL', es: 'INSTALACIÓN' } as L3)[lang]}
              </div>
            </div>
          </div>
        </div>

        <h1 className="hero-enter-2" style={{
          fontFamily: serif,
          fontSize: 'clamp(30px, 6vw, 56px)',
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: '0.03em',
          whiteSpace: 'pre-line',
          marginBottom: 20,
          background: 'linear-gradient(135deg, #111827 20%, #0284c7 60%, #7C3AED)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative',
        }}>
          {({
            ja: '音と向き合う\nすべての人のために。',
            en: 'For everyone\nwho takes sound seriously.',
            es: 'Para todos los que\ntoman el sonido en serio.',
          } as L3)[lang]}
        </h1>

        <p className="hero-enter-3" style={{
          fontFamily: sans,
          fontSize: 'clamp(14px, 2.2vw, 17px)',
          color: '#6b7280',
          lineHeight: 1.8,
          maxWidth: 520,
          margin: '0 auto',
          whiteSpace: 'pre-line',
          position: 'relative',
        }}>
          {({
            ja: 'すべてのアプリはブラウザだけで完結。\nインストールもアカウントも不要。\n開いた瞬間から、あなたのスタジオになる。',
            en: 'Every tool runs entirely in your browser.\nNo install. No account.\nYour studio, the moment you open it.',
            es: 'Todas las herramientas funcionan en tu navegador.\nSin instalación. Sin cuenta.\nTu estudio, desde el momento en que lo abres.',
          } as L3)[lang]}
        </p>
      </section>

      {/* ═══════════════════════════════════ */}
      {/* APP LIST                            */}
      {/* ═══════════════════════════════════ */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(16px, 3vw, 24px)',
        marginBottom: 'clamp(48px, 10vw, 80px)',
      }}>
        {apps.map((app, i) => (
          <AppRow key={app.id} app={app} index={i} lang={lang} />
        ))}
      </section>

      {/* ═══════════════════════════════════ */}
      {/* COMING SOON                         */}
      {/* ═══════════════════════════════════ */}
      <section style={{
        textAlign: 'center',
        paddingBottom: 'clamp(40px, 8vw, 80px)',
      }}>
        <div className="reveal" style={{
          display: 'inline-block',
          padding: '28px 48px',
          borderRadius: 20,
          border: '1px dashed rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          <div style={{
            fontFamily: mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#9ca3af',
            marginBottom: 8,
          }}>
            COMING SOON
          </div>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(14px, 2.2vw, 17px)',
            color: '#6b7280',
          }}>
            {({
              ja: '次のツールを開発中——',
              en: 'Next tool in development —',
              es: 'Próxima herramienta en desarrollo —',
            } as L3)[lang]}
          </p>
        </div>
      </section>
    </div>
  );
}
