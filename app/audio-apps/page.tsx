// app/audio-apps/page.tsx
'use client';

import { useState } from 'react';

const apps = [
  {
    id: 'itadaki',
    badge: 'DECLIP',
    name: 'KUON ITADAKI',
    nameJa: '久遠 頂',
    tagline: {
      ja: 'アンプの限界で失われたピークを、\n数学的に甦らせる。',
      en: 'Mathematically restore the peaks\ndestroyedby analog clipping.',
    },
    desc: {
      ja: 'エルミートスプライン補間による非対称クリッピング専用修復エンジン。失われた波形を自然なドーム状の曲線として再構築します。',
      en: 'A declipping engine using Cubic Hermite Spline interpolation, purpose-built for asymmetrical analog distortion.',
    },
    href: '/itadaki-lp',
    accentColor: '#0099BB',
    accentLight: '#E6F6FA',
    icon: '◈',
    status: 'AVAILABLE',
  },
  {
    id: 'normalize',
    badge: 'NORMALIZE',
    name: 'KUON NORMALIZE',
    nameJa: '久遠 正規化',
    tagline: {
      ja: 'マイクを買った、その日から。\nブラウザが、スタジオになる。',
      en: 'The day you get the mic,\nyour browser becomes a studio.',
    },
    desc: {
      ja: 'ピークノーマライズ・ラウドネス最適化・シグネチャーEQ・ホールリバーブを搭載したブラウザ完結型音声処理ツール。マイク購入者限定。',
      en: 'Browser-native audio processing: peak normalize, loudness optimization, signature EQ, and hall reverb. Mic owners exclusive.',
    },
    href: '/normalize-lp',
    accentColor: '#059669',
    accentLight: '#ECFDF5',
    icon: '◉',
    status: 'AVAILABLE',
  },
];

export default function AudioAppsPage() {
  const [lang, setLang] = useState<'ja' | 'en'>('ja');

  const C = {
    bg: '#FFFFFF',
    bgSoft: '#F7F9FC',
    border: '#E2E8F0',
    ink: '#1A202C',
    inkMid: '#4A5568',
    inkMuted: '#718096',
    accent: '#0099BB',
    accentLight: '#E6F6FA',
    white: '#FFFFFF',
  };

  return (
    <div style={{
      backgroundColor: C.bg,
      color: C.ink,
      fontFamily: '"Space Grotesk", "Noto Sans JP", "Helvetica Neue", Arial, sans-serif',
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(0,153,187,0.15); }
        html { scroll-behavior: smooth; }

        .app-card {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .app-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.09) !important;
        }
        .app-card:hover .card-arrow {
          transform: translateX(4px);
          opacity: 1 !important;
        }
        .lang-btn:hover {
          background: ${C.accentLight} !important;
          border-color: ${C.accent} !important;
          color: ${C.accent} !important;
        }
        .card-link {
          text-decoration: none;
          display: block;
        }
      `}</style>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PAGE HEADER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: '120px 32px 80px',
        textAlign: 'center',
        position: 'relative',
      }}>

        {/* 言語切替 */}
        <div style={{
          position: 'absolute',
          top: '120px',
          right: '32px',
        }}>
          <button
            className="lang-btn"
            onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
            style={{
              background: C.white,
              border: `1.5px solid ${C.border}`,
              color: C.inkMid,
              padding: '7px 18px',
              borderRadius: '100px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            }}
          >
            <span>🌐</span>
            <span>{lang === 'ja' ? 'English' : '日本語'}</span>
          </button>
        </div>

        {/* ラベル */}
        <div style={{
          fontSize: '0.68rem',
          color: C.accent,
          letterSpacing: '4px',
          fontWeight: 700,
          marginBottom: '24px',
          textTransform: 'uppercase' as const,
        }}>
          AUDIO ENGINEERING TOOLS
        </div>

        {/* タイトル */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 700,
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
          color: C.ink,
          marginBottom: '24px',
        }}>
          {lang === 'ja'
            ? '音に、もう一度\n向き合うための道具。'
            : 'Tools for those who\ntake sound seriously.'}
        </h1>

        <p style={{
          fontSize: '1rem',
          color: C.inkMuted,
          lineHeight: 1.85,
          maxWidth: '480px',
          margin: '0 auto',
          whiteSpace: 'pre-line',
        }}>
          {lang === 'ja'
            ? '空音開発のオーディオツールはすべて、\nブラウザだけで動きます。インストール不要。'
            : 'Every Kuon R&D audio tool runs entirely\nin your browser. Nothing to install.'}
        </p>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          APP CARDS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: '0 32px 160px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        {apps.map((app, i) => (
          <a
            key={app.id}
            href={app.href}
            className="card-link"
          >
            <div
              className="app-card"
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: '20px',
                padding: '40px 44px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: '32px',
              }}
            >
              {/* 左：コンテンツ */}
              <div>
                {/* バッジ行 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '18px',
                }}>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: '3px',
                    color: app.accentColor,
                    background: app.accentLight,
                    padding: '4px 12px',
                    borderRadius: '100px',
                  }}>
                    {app.badge}
                  </span>
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    letterSpacing: '2px',
                    color: C.inkMuted,
                  }}>
                    {app.status}
                  </span>
                </div>

                {/* アプリ名 */}
                <div style={{
                  fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  color: C.ink,
                  lineHeight: 1,
                  marginBottom: '6px',
                }}>
                  {app.name}
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  letterSpacing: '4px',
                  color: C.inkMuted,
                  fontWeight: 400,
                  marginBottom: '20px',
                }}>
                  {app.nameJa}
                </div>

                {/* タグライン */}
                <p style={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: C.inkMid,
                  lineHeight: 1.6,
                  marginBottom: '14px',
                  whiteSpace: 'pre-line',
                }}>
                  {app.tagline[lang]}
                </p>

                {/* 説明 */}
                <p style={{
                  fontSize: '0.85rem',
                  color: C.inkMuted,
                  lineHeight: 1.8,
                }}>
                  {app.desc[lang]}
                </p>
              </div>

              {/* 右：アイコン＋矢印 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                flexShrink: 0,
              }}>
                {/* アイコン */}
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '18px',
                  background: app.accentLight,
                  border: `1px solid ${app.accentColor}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  color: app.accentColor,
                  fontWeight: 300,
                  letterSpacing: '-1px',
                }}>
                  {app.icon}
                </div>

                {/* 矢印 */}
                <div
                  className="card-arrow"
                  style={{
                    fontSize: '1.2rem',
                    color: app.accentColor,
                    opacity: 0.4,
                    transition: 'all 0.3s ease',
                    fontWeight: 300,
                  }}
                >
                  →
                </div>
              </div>
            </div>
          </a>
        ))}

        {/* ━━ COMING SOON カード ━━ */}
        <div style={{
          background: C.bgSoft,
          border: `1px dashed ${C.border}`,
          borderRadius: '20px',
          padding: '36px 44px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          opacity: 0.6,
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '18px',
            background: C.white,
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            color: C.inkMuted,
            flexShrink: 0,
          }}>
            +
          </div>
          <div>
            <div style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '3px',
              color: C.inkMuted,
              marginBottom: '8px',
            }}>
              COMING SOON
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: C.inkMuted,
              marginBottom: '6px',
            }}>
              {lang === 'ja' ? '次のツールを開発中' : 'Next tool in development'}
            </div>
            <div style={{
              fontSize: '0.83rem',
              color: C.inkMuted,
              lineHeight: 1.7,
            }}>
              {lang === 'ja'
                ? '空音開発は新しい音響ツールを継続的にリリースします。'
                : 'Kuon R&D continuously releases new audio engineering tools.'}
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '28px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: C.inkMuted,
        background: C.white,
        flexWrap: 'wrap' as const,
        gap: '8px',
      }}>
        <div style={{ fontWeight: 600, color: C.ink }}>
          空音開発 <span style={{ color: C.accent, fontWeight: 400 }}>Kuon R&D</span>
        </div>
        <div>© 2025 Kuon R&D. All rights reserved.</div>
      </footer>
    </div>
  );
}
