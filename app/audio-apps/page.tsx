'use client';

import { useEffect, useState } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L3 = Record<Lang, string>;

const apps: Array<{
  id: string;
  badge: string;
  badgeType: 'paid' | 'exclusive' | 'free';
  name: string;
  nameJa: string;
  tagline: L3;
  desc: L3;
  href: string;
  accentColor: string;
  accentLight: string;
  icon: string;
  status: string;
  price: L3;
}> = [
  {
    id: 'itadaki',
    badge: 'DECLIP',
    badgeType: 'paid',
    name: 'KUON ITADAKI',
    nameJa: '',
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
    accentColor: '#0099BB',
    accentLight: '#E6F6FA',
    icon: '◈',
    status: 'AVAILABLE',
    price: { ja: '¥1,980', en: '$14.99', es: '$14.99' },
  },
  {
    id: 'normalize',
    badge: 'NORMALIZE',
    badgeType: 'exclusive',
    name: 'KUON NORMALIZE',
    nameJa: '',
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
    accentColor: '#059669',
    accentLight: '#ECFDF5',
    icon: '◉',
    status: 'AVAILABLE',
    price: { ja: 'マイク同梱', en: 'Mic Bundle', es: 'Incluido con mic' },
  },
  {
    id: 'noise-reduction',
    badge: 'NOISE REDUCTION',
    badgeType: 'free',
    name: 'KUON DENOISE',
    nameJa: '',
    tagline: {
      ja: 'エアコン、機材ハム、環境音。\n定常ノイズをスペクトルから消す。',
      en: 'AC hum, gear noise, ambience.\nErase steady noise from the spectrum.',
      es: 'Zumbido, ruido del equipo, ambiente.\nBorra el ruido constante del espectro.',
    },
    desc: {
      ja: 'スペクトル減算法によるブラウザ完結型ノイズリダクション。周波数スペクトルを可視化しながら除去強度をリアルタイムに調整できます。',
      en: 'Browser-native noise reduction via spectral subtraction. Visualize the frequency spectrum and adjust removal strength in real time.',
      es: 'Reducción de ruido nativa del navegador mediante sustracción espectral. Visualiza el espectro y ajusta la intensidad en tiempo real.',
    },
    href: '/noise-reduction',
    accentColor: '#7C3AED',
    accentLight: '#F5F3FF',
    icon: '◎',
    status: 'AVAILABLE',
    price: { ja: '完全無料', en: 'Free', es: 'Gratis' },
  },
  {
    id: 'dual-mono',
    badge: 'DUAL MONO',
    badgeType: 'free',
    name: 'KUON DUAL',
    nameJa: '',
    tagline: {
      ja: 'モノラルに、広がりを与える。\nデュアルモノ、または擬似ステレオへ。',
      en: 'Give mono a sense of space.\nConvert to dual mono or pseudo stereo.',
      es: 'Dale amplitud al mono.\nConvierte a dual mono o pseudo estéreo.',
    },
    desc: {
      ja: 'モノラル音声をデュアルモノまたはHaas効果＋MS処理による擬似ステレオに変換。ステレオ幅をスライダーでコントロールできます。',
      en: 'Convert mono to dual mono or pseudo stereo using Haas effect and M/S processing. Control stereo width with a slider.',
      es: 'Convierte audio mono a dual mono o pseudo estéreo mediante el efecto Haas y procesamiento M/S. Controla la amplitud con un slider.',
    },
    href: '/dual-mono',
    accentColor: '#D97706',
    accentLight: '#FFFBEB',
    icon: '◑',
    status: 'AVAILABLE',
    price: { ja: '完全無料', en: 'Free', es: 'Gratis' },
  },
];

/* ─── ANIMATED BADGE ─── */
function AnimatedBadge({ type, lang }: { type: 'paid' | 'exclusive' | 'free'; lang: Lang }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  const pulse = (tick % 2 === 0);

  if (type === 'free') {
    return (
      <span style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           '5px',
        fontSize:      '0.72rem',
        fontWeight:    800,
        letterSpacing: '1.5px',
        color:         '#059669',
        background:    `linear-gradient(135deg, #D1FAE5, #A7F3D0)`,
        padding:       '5px 13px',
        borderRadius:  '100px',
        boxShadow:     pulse
          ? '0 0 0 3px rgba(5,150,105,0.18), 0 2px 8px rgba(5,150,105,0.25)'
          : '0 0 0 0px rgba(5,150,105,0)',
        transition:    'box-shadow 0.6s ease',
        whiteSpace:    'nowrap' as const,
      }}>
        <span style={{
          width:        '6px',
          height:       '6px',
          borderRadius: '50%',
          background:   '#059669',
          display:      'inline-block',
          transform:    pulse ? 'scale(1.4)' : 'scale(1)',
          transition:   'transform 0.6s ease',
        }} />
        {({ ja: '完全無料', en: 'FREE', es: 'GRATIS' } as L3)[lang]}
      </span>
    );
  }

  if (type === 'exclusive') {
    return (
      <span style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           '5px',
        fontSize:      '0.72rem',
        fontWeight:    800,
        letterSpacing: '1.5px',
        color:         '#F6E05E',
        background:    '#1A202C',
        padding:       '5px 13px',
        borderRadius:  '100px',
        boxShadow:     pulse
          ? '0 0 0 3px rgba(246,224,94,0.2), 0 2px 8px rgba(0,0,0,0.3)'
          : '0 0 0 0px rgba(246,224,94,0)',
        transition:    'box-shadow 0.6s ease',
        whiteSpace:    'nowrap' as const,
      }}>
        <span style={{
          width:        '6px',
          height:       '6px',
          borderRadius: '50%',
          background:   '#F6E05E',
          display:      'inline-block',
          transform:    pulse ? 'scale(1.4)' : 'scale(1)',
          transition:   'transform 0.6s ease',
        }} />
        {({ ja: '限定公開', en: 'EXCLUSIVE', es: 'EXCLUSIVO' } as L3)[lang]}
      </span>
    );
  }

  // paid
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           '5px',
      fontSize:      '0.72rem',
      fontWeight:    800,
      letterSpacing: '1.5px',
      color:         '#92400E',
      background:    `linear-gradient(135deg, #FEF3C7, #FDE68A)`,
      padding:       '5px 13px',
      borderRadius:  '100px',
      boxShadow:     pulse
        ? '0 0 0 3px rgba(217,119,6,0.18), 0 2px 8px rgba(217,119,6,0.2)'
        : '0 0 0 0px rgba(217,119,6,0)',
      transition:    'box-shadow 0.6s ease',
      whiteSpace:    'nowrap' as const,
    }}>
      <span style={{
        width:        '6px',
        height:       '6px',
        borderRadius: '50%',
        background:   '#D97706',
        display:      'inline-block',
        transform:    pulse ? 'scale(1.4)' : 'scale(1)',
        transition:   'transform 0.6s ease',
      }} />
      {({ ja: '有料', en: 'PAID', es: 'PREMIUM' } as L3)[lang]}
    </span>
  );
}

/* ─── PRICE TAG ─── */
function PriceTag({ type, price, lang }: { type: 'paid' | 'exclusive' | 'free'; price: L3; lang: Lang }) {
  if (type === 'free') {
    return (
      <span style={{
        fontSize:      '1.05rem',
        fontWeight:    800,
        color:         '#059669',
        letterSpacing: '-0.3px',
      }}>
        {price[lang]}
      </span>
    );
  }
  if (type === 'exclusive') {
    return (
      <span style={{
        fontSize:      '1.05rem',
        fontWeight:    800,
        color:         '#059669',
        letterSpacing: '-0.3px',
      }}>
        {price[lang]}
      </span>
    );
  }
  return (
    <span style={{
      fontSize:      '1.05rem',
      fontWeight:    800,
      color:         '#0099BB',
      letterSpacing: '-0.3px',
    }}>
      {price[lang]}
    </span>
  );
}

/* ─── MAIN ─── */
export default function AudioAppsPage() {
  // サイト共通の useLang() に統合（§19 アプリ絶対保護ルール遵守：表示レイヤーのみ変更）
  const { lang } = useLang();

  const C = {
    bg:          '#FFFFFF',
    bgSoft:      '#F7F9FC',
    border:      '#E2E8F0',
    ink:         '#1A202C',
    inkMid:      '#4A5568',
    inkMuted:    '#718096',
    accent:      '#0099BB',
    accentLight: '#E6F6FA',
    white:       '#FFFFFF',
  };

  return (
    <div style={{
      backgroundColor: C.bg,
      color:           C.ink,
      fontFamily:      '"Space Grotesk","Noto Sans JP","Helvetica Neue",Arial,sans-serif',
      minHeight:       '100vh',
      overflowX:       'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(0,153,187,0.15); }

        .app-card {
          text-decoration: none;
          display:         flex;
          flex-direction:  column;
          background:      #FFFFFF;
          border:          1px solid #E2E8F0;
          border-radius:   20px;
          padding:         32px;
          box-shadow:      0 2px 12px rgba(0,0,0,0.04);
          transition:      all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
          color:           inherit;
        }
        .app-card:hover {
          transform:   translateY(-6px);
          box-shadow:  0 24px 56px rgba(0,0,0,0.10) !important;
          border-color: rgba(0,0,0,0.14) !important;
        }
        .app-card:hover .card-arrow {
          transform: translateX(5px);
          opacity:   1 !important;
        }
        .app-card:hover .card-icon {
          transform: scale(1.07);
        }
        .card-icon {
          transition: transform 0.3s ease;
        }
        .lang-btn:hover {
          background:   ${C.accentLight} !important;
          border-color: ${C.accent} !important;
          color:        ${C.accent} !important;
        }

        @media (max-width: 640px) {
          .apps-grid { grid-template-columns: 1fr !important; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ━━ HEADER ━━ */}
      <div style={{
        maxWidth:  '880px',
        margin:    '0 auto',
        padding:   '100px 32px 72px',
        textAlign: 'center',
        animation: 'fadeInUp 0.6s ease both',
      }}>
        {/* 言語切替はサイト共通ヘッダーに統合済み（§19） */}

        <div style={{
          fontSize:      '0.68rem',
          color:         C.accent,
          letterSpacing: '4px',
          fontWeight:    700,
          marginBottom:  '20px',
          textTransform: 'uppercase' as const,
        }}>
          AUDIO ENGINEERING TOOLS
        </div>

        <h1 style={{
          fontSize:      'clamp(2rem,5vw,3.2rem)',
          fontWeight:    700,
          letterSpacing: '-1.5px',
          lineHeight:    1.15,
          color:         C.ink,
          marginBottom:  '24px',
          whiteSpace:    'pre-line',
        }}>
          {({
            ja: '音と向き合うための道具',
            en: 'Tools for those who\ntake sound seriously.',
            es: 'Herramientas para quienes\ntoman el sonido en serio.',
          } as L3)[lang]}
        </h1>

        <p style={{
          fontSize:   '1rem',
          color:      C.inkMuted,
          lineHeight: 1.85,
          maxWidth:   '480px',
          margin:     '0 auto',
        }}>
          {({
            ja: 'アプリはすべて、ブラウザだけでインストール不要',
            en: 'Every Kuon R&D audio tool runs entirely in your browser. Nothing to install.',
            es: 'Todas las apps de Kuon R&D funcionan en tu navegador. Nada que instalar.',
          } as L3)[lang]}
        </p>
      </div>

      {/* ━━ GRID ━━ */}
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '0 32px 140px' }}>
        <div
          className="apps-grid"
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap:                 '20px',
            marginBottom:        '20px',
          }}
        >
          {apps.map((app, i) => (
            <a
              key={app.id}
              href={app.href}
              className="app-card"
              style={{ animationDelay: `${i * 0.08}s`, animation: 'fadeInUp 0.6s ease both' }}
            >
              {/* top row: icon + badges */}
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'flex-start',
                marginBottom:   '22px',
              }}>
                <div
                  className="card-icon"
                  style={{
                    width:          '54px',
                    height:         '54px',
                    borderRadius:   '14px',
                    background:     app.accentLight,
                    border:         `1px solid ${app.accentColor}22`,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontSize:       '1.4rem',
                    color:          app.accentColor,
                  }}
                >
                  {app.icon}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  {/* category */}
                  <span style={{
                    fontSize:      '0.6rem',
                    fontWeight:    700,
                    letterSpacing: '2px',
                    color:         app.accentColor,
                    background:    app.accentLight,
                    padding:       '3px 10px',
                    borderRadius:  '100px',
                  }}>
                    {app.badge}
                  </span>
                  {/* animated status badge */}
                  <AnimatedBadge type={app.badgeType} lang={lang} />
                </div>
              </div>

              {/* name */}
              <div style={{
                fontSize:      'clamp(1.15rem,2.2vw,1.5rem)',
                fontWeight:    700,
                letterSpacing: '-0.5px',
                color:         C.ink,
                lineHeight:    1,
                marginBottom:  '14px',
              }}>
                {app.name}
              </div>

              {/* tagline */}
              <p style={{
                fontSize:    '0.9rem',
                fontWeight:  500,
                color:       C.inkMid,
                lineHeight:  1.65,
                marginBottom:'10px',
                whiteSpace:  'pre-line',
                flexGrow:    1,
              }}>
                {app.tagline[lang]}
              </p>

              {/* desc */}
              <p style={{
                fontSize:    '0.78rem',
                color:       C.inkMuted,
                lineHeight:  1.8,
                marginBottom:'22px',
              }}>
                {app.desc[lang]}
              </p>

              {/* bottom: price + arrow */}
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                borderTop:      `1px solid ${C.border}`,
                paddingTop:     '16px',
                marginTop:      'auto',
              }}>
                <PriceTag type={app.badgeType} price={app.price} lang={lang} />
                <span
                  className="card-arrow"
                  style={{
                    fontSize:   '1.1rem',
                    color:      app.accentColor,
                    opacity:    0.3,
                    transition: 'all 0.3s ease',
                  }}
                >
                  →
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* ━━ COMING SOON ━━ */}
        <div style={{
          background:   C.bgSoft,
          border:       `1px dashed ${C.border}`,
          borderRadius: '20px',
          padding:      '32px',
          display:      'flex',
          alignItems:   'center',
          gap:          '20px',
          opacity:      0.55,
        }}>
          <div style={{
            width:          '54px',
            height:         '54px',
            borderRadius:   '14px',
            background:     C.white,
            border:         `1px solid ${C.border}`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '1.4rem',
            color:          C.inkMuted,
            flexShrink:     0,
          }}>
            +
          </div>
          <div>
            <div style={{
              fontSize:      '0.6rem',
              fontWeight:    700,
              letterSpacing: '3px',
              color:         C.inkMuted,
              marginBottom:  '6px',
            }}>
              COMING SOON
            </div>
            <div style={{
              fontSize:    '1rem',
              fontWeight:  600,
              color:       C.inkMuted,
              marginBottom:'4px',
            }}>
              {({ ja: '次のツールを開発中', en: 'Next tool in development', es: 'Próxima herramienta en desarrollo' } as L3)[lang]}
            </div>
            <div style={{ fontSize: '0.82rem', color: C.inkMuted, lineHeight: 1.7 }}>
              {({
                ja: '空音開発は新しい音響ツールを継続的にリリースします',
                en: 'Kuon R&D continuously releases new audio engineering tools.',
                es: 'Kuon R&D lanza continuamente nuevas herramientas de audio.',
              } as L3)[lang]}
            </div>
          </div>
        </div>
      </div>

      {/* ━━ FOOTER ━━ */}
      <footer style={{
        borderTop:      `1px solid ${C.border}`,
        padding:        '28px 40px',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        fontSize:       '0.8rem',
        color:          C.inkMuted,
        background:     C.white,
        flexWrap:       'wrap' as const,
        gap:            '8px',
      }}>
        <div style={{ fontWeight: 600, color: C.ink }}>
          空音開発 <span style={{ color: C.accent, fontWeight: 400 }}>Kuon R&D</span>
        </div>
        <div>© 2026 Kuon R&D. All rights reserved.</div>
      </footer>
    </div>
  );
}
