'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLang } from '@/context/LangContext';

const content = {
  ja: {
    toggleBtn: 'English',
    badge: 'ASYMMETRICAL DECLIPPER',
    title: 'KUON ITADAKI',
    titleReading: '空音 頂',
    subtitle: 'アンプの限界で削り取られた\n波形の「頂」を取り戻す。',
    problemLabel: 'THE PROBLEM',
    problemTitle: 'デジタルの常識が\n通用しない歪みがある。',
    problemDesc: '録音時、アナログ機材のヘッドルームを超えた際に発生する「マイナス側の底打ち」と「プラス側の台形歪み」。これは通常のデクリッパーでは直せません。KUON ITADAKIは、独自の数学的アルゴリズム（エルミートスプライン補間）を用いて、完全に失われたピークを自然なドーム状の曲線として再構築します。',
    algoLabel: 'ALGORITHM',
    algoName: 'Cubic Hermite Spline Interpolation',
    algo1: 'クリップ領域の検出',
    algo2: '境界点のアンカリング',
    algo3: 'スプライン補間による再構築',
    evidenceLabel: 'VISUAL PROOF',
    evidenceTitle: '百聞は一見に如かず。',
    evidenceSubtitle: '圧倒的な修復力',
    evidenceOverallCaption: '全体波形 ― 上: 処理前（上下が平坦に潰れている）/ 下: 処理後（失われたピークが鮮明に復元）',
    evidenceZoomCaption: '拡大波形 ― 上: 処理前（マイナス側が底打ち）/ 下: 処理後（自然な「丸い谷」として再構築）',
    howToLabel: 'HOW TO USE',
    howToTitle: 'スイートスポットを\n見つけるために。',
    step1: 'STEP 01', step1Title: 'WAVをドロップ',
    step1Desc: 'ブラウザにWAVファイルをドラッグ＆ドロップするだけで準備完了。',
    step2: 'STEP 02', step2Title: 'Auto Repairで自動解析',
    step2Desc: 'まず「Auto Repair」を実行。プログラムがファイル全体の限界点を自動検知します。',
    step3: 'STEP 03', step3Title: 'スライダーで微調整',
    step3Desc: '自動解析で納得できない場合、Upper/Lowerスライダーを微調整。波形が潰れているギリギリ内側を狙います。',
    proTipLabel: 'PRO TIP',
    proTipTitle: '修復後のポストプロダクション',
    proTipDesc: 'KUON ITADAKIは限界を突破したピークを無傷のまま保存するため「32bit Float」でWAVを出力します。DAWに読み込んだ後、必ず全体をノーマライズし、ラウドネス規格に合わせてリミッティングを行ってください。これにより、再クリップを防ぎつつ、息を呑むほどクリアな音源が完成します。',
    priceLabel: '買い切りアクセス権',
    priceValue: '¥1,980',
    priceSub: '一度の購入で永続利用可能',
    ctaBtn: 'パスワードを購入してアプリを開く',
    ctaSub: 'Stripe決済 — SSL暗号化通信',
    footerCopy: '© 2025 空音開発 Kuon R&D. All rights reserved.',
  },
  en: {
    toggleBtn: '日本語',
    badge: 'ASYMMETRICAL DECLIPPER',
    title: 'KUON ITADAKI',
    titleReading: 'Peak Reclamation Engine',
    subtitle: 'Reclaim the lost peaks of\nyour analog recordings.',
    problemLabel: 'THE PROBLEM',
    problemTitle: 'The distortion that\nstandard tools can\'t fix.',
    problemDesc: 'When recording, pushing analog gear past its headroom often results in asymmetrical clipping—a flat bottom on the negative side and a rounded saturation on the positive. Standard digital declippers fail here. KUON ITADAKI uses a proprietary algorithm (Cubic Hermite Spline) to perfectly reconstruct the lost peaks into natural, dome-like curves.',
    algoLabel: 'ALGORITHM',
    algoName: 'Cubic Hermite Spline Interpolation',
    algo1: 'Detect Clip Region',
    algo2: 'Anchor Boundary Points',
    algo3: 'Spline Reconstruction',
    evidenceLabel: 'VISUAL PROOF',
    evidenceTitle: 'Seeing is believing.',
    evidenceSubtitle: 'The Restoration Power',
    evidenceOverallCaption: 'Overall Waveform — Top: Before (Flatly crushed) / Bottom: After (Lost peaks restored)',
    evidenceZoomCaption: 'Zoomed In — Top: Before (Negative side flatlines) / Bottom: After (Perfect round valley reconstructed)',
    howToLabel: 'HOW TO USE',
    howToTitle: 'Finding your\nsweet spot.',
    step1: 'STEP 01', step1Title: 'Drop your WAV',
    step1Desc: 'Simply drag and drop your WAV file into the browser window to get started.',
    step2: 'STEP 02', step2Title: 'Run Auto Repair',
    step2Desc: 'Click "Auto Repair" first. The engine will automatically scan the file for its extreme limits.',
    step3: 'STEP 03', step3Title: 'Fine-tune the sliders',
    step3Desc: 'If Auto Repair isn\'t perfect, adjust the Upper/Lower sliders. Aim just inside the flat region and click Manual Repair.',
    proTipLabel: 'PRO TIP',
    proTipTitle: 'Post-Processing Your Restored File',
    proTipDesc: 'KUON ITADAKI exports in 32-bit Float WAV to safely store the newly expanded peaks without re-clipping. Once imported into your DAW, normalize or manage gain carefully, then apply your standard loudness processing. The result: a breathtakingly clear final mix.',
    priceLabel: 'Lifetime Access',
    priceValue: '$14.99',
    priceSub: 'One-time purchase, permanent access',
    ctaBtn: 'Get Password & Open App',
    ctaSub: 'Stripe Checkout — SSL Encrypted',
    footerCopy: '© 2025 Kuon R&D. All rights reserved.',
  },
  es: {
    toggleBtn: 'Español',
    badge: 'ASYMMETRICAL DECLIPPER',
    title: 'KUON ITADAKI',
    titleReading: 'Motor de recuperación de picos',
    subtitle: 'Recupera los picos perdidos\nde tus grabaciones analógicas.',
    problemLabel: 'THE PROBLEM',
    problemTitle: 'La distorsión que las herramientas\nestándar no pueden arreglar.',
    problemDesc: 'Al grabar, superar el headroom del equipo analógico produce un clipping asimétrico: fondo plano en la parte negativa y saturación redondeada en la positiva. Los desclippers estándar fallan aquí. KUON ITADAKI utiliza un algoritmo propietario (spline Hermite cúbica) para reconstruir perfectamente los picos perdidos en curvas naturales con forma de cúpula.',
    algoLabel: 'ALGORITHM',
    algoName: 'Interpolación Spline Hermite Cúbica',
    algo1: 'Detectar región clipada',
    algo2: 'Anclar puntos límite',
    algo3: 'Reconstrucción por spline',
    evidenceLabel: 'VISUAL PROOF',
    evidenceTitle: 'Ver para creer.',
    evidenceSubtitle: 'El poder de restauración',
    evidenceOverallCaption: 'Forma de onda general — Arriba: Antes (planamente aplastado) / Abajo: Después (picos perdidos restaurados)',
    evidenceZoomCaption: 'Vista ampliada — Arriba: Antes (la parte negativa se aplana) / Abajo: Después (valle redondo reconstruido)',
    howToLabel: 'HOW TO USE',
    howToTitle: 'Encontrando tu\npunto dulce.',
    step1: 'STEP 01', step1Title: 'Suelta tu WAV',
    step1Desc: 'Simplemente arrastra y suelta tu archivo WAV en la ventana del navegador para empezar.',
    step2: 'STEP 02', step2Title: 'Ejecuta Auto Repair',
    step2Desc: 'Haz clic en "Auto Repair" primero. El motor escaneará automáticamente los límites extremos del archivo.',
    step3: 'STEP 03', step3Title: 'Ajusta los sliders',
    step3Desc: 'Si Auto Repair no es perfecto, ajusta los sliders Upper/Lower. Apunta justo dentro de la región plana y haz clic en Manual Repair.',
    proTipLabel: 'PRO TIP',
    proTipTitle: 'Post-procesado del archivo restaurado',
    proTipDesc: 'KUON ITADAKI exporta en WAV de 32-bit Float para almacenar de forma segura los picos recién expandidos sin re-clipear. Una vez importado en tu DAW, normaliza o gestiona el gain con cuidado y luego aplica tu procesamiento de loudness estándar. El resultado: una mezcla final asombrosamente clara.',
    priceLabel: 'Acceso de por vida',
    priceValue: '$14.99',
    priceSub: 'Compra única, acceso permanente',
    ctaBtn: 'Obtener contraseña y abrir la app',
    ctaSub: 'Stripe Checkout — cifrado SSL',
    footerCopy: '© 2025 Kuon R&D. Todos los derechos reservados.',
  }
};

function WaveformSVG({ clipped }: { clipped: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const points = useMemo(() => {
    const W = 800, H = 80, mid = H / 2;
    const pts: string[] = [];
    for (let x = 0; x <= W; x += 3) {
      const t = (x / W) * Math.PI * 14;
      let y = Math.sin(t) * 28 * (0.5 + 0.5 * Math.sin(t * 0.27));
      if (clipped) y = Math.max(Math.min(y, 20), -16);
      pts.push(`${x},${+(mid - y).toFixed(4)}`);
    }
    return pts.join(' ');
  }, [clipped]);

  if (!mounted) return <div style={{ height: '80px' }} />;

  return (
    <svg
      viewBox="0 0 800 80"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={clipped ? '#E53E3E' : '#0099BB'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ItadakiLandingPage() {
  // サイト共通 useLang() に統合（§19）— アプリロジックには一切触れない
  const { lang } = useLang();
  const t = content[lang as keyof typeof content] || content.en;

  const C = {
    bg: '#FFFFFF',
    bgSoft: '#F7F9FC',
    bgCard: '#FFFFFF',
    border: '#E2E8F0',
    borderAccent: 'rgba(0,153,187,0.25)',
    accent: '#0099BB',
    accentLight: '#E6F6FA',
    accentDark: '#007A99',
    ink: '#1A202C',
    inkMid: '#4A5568',
    inkMuted: '#718096',
    red: '#E53E3E',
    gold: '#D69E2E',
    goldLight: '#FFFFF0',
    goldBorder: 'rgba(214,158,46,0.3)',
    white: '#FFFFFF',
  };

  const baseSection: React.CSSProperties = {
    maxWidth: '880px',
    margin: '0 auto',
    padding: '100px 32px',
  };

  const hairline: React.CSSProperties = {
    height: '1px',
    background: C.border,
    margin: '0 32px',
  };

  return (
    <div style={{
      backgroundColor: C.bg,
      color: C.ink,
      fontFamily: '"Space Grotesk", "Noto Sans JP", "Helvetica Neue", Arial, sans-serif',
      lineHeight: 1.75,
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::selection { background: rgba(0,153,187,0.18); }
        html { scroll-behavior: smooth; }
        .cta-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 48px rgba(0,153,187,0.28) !important;
        }
        .lang-btn:hover {
          background: #E6F6FA !important;
          border-color: #0099BB !important;
          color: #007A99 !important;
        }
        .step-card:hover {
          border-color: #0099BB !important;
          box-shadow: 0 8px 24px rgba(0,153,187,0.10) !important;
        }
      `}</style>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '140px 24px 80px',
        background: `linear-gradient(180deg, ${C.bgSoft} 0%, ${C.bg} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 背景グリッド */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(${C.border} 1px, transparent 1px),
            linear-gradient(90deg, ${C.border} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: 0.5,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', width: '100%' }}>

          {/* バッジ */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: `1px solid ${C.borderAccent}`,
            borderRadius: '100px',
            padding: '5px 16px 5px 12px',
            marginBottom: '40px',
            background: C.accentLight,
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: C.accent, display: 'inline-block',
              boxShadow: `0 0 6px ${C.accent}`,
            }} />
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '3px', color: C.accent,
              textTransform: 'uppercase' as const,
            }}>
              {t.badge}
            </span>
          </div>

          {/* タイトル */}
          <h1 style={{
            fontSize: 'clamp(2.8rem, 9vw, 7rem)',
            fontWeight: 700,
            letterSpacing: '-3px',
            lineHeight: 0.95,
            color: C.ink,
            marginBottom: '10px',
          }}>
            {t.title}
          </h1>

          {/* 読み仮名 */}
          <div style={{
            fontSize: '0.75rem',
            letterSpacing: '5px',
            color: C.inkMuted,
            marginBottom: '20px',
            fontWeight: 400,
          }}>
            {t.titleReading}
          </div>

          {/* 言語切替はサイト共通ヘッダーに統合済み（§19） */}

          {/* サブタイトル */}
          <p style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.25rem)',
            color: C.inkMid,
            fontWeight: 400,
            lineHeight: 1.75,
            whiteSpace: 'pre-line',
            maxWidth: '520px',
            margin: '0 auto 56px',
          }}>
            {t.subtitle}
          </p>

          {/* 波形カード */}
          <div style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: '20px 28px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red, display: 'inline-block' }} />
              <span style={{ fontSize: '0.68rem', color: C.red, letterSpacing: '2px', fontWeight: 600 }}>
                BEFORE — CLIPPED
              </span>
            </div>
            <WaveformSVG clipped={true} />
            <div style={{ height: '1px', background: C.border, margin: '16px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.accent, display: 'inline-block' }} />
              <span style={{ fontSize: '0.68rem', color: C.accent, letterSpacing: '2px', fontWeight: 600 }}>
                AFTER — RESTORED
              </span>
            </div>
            <WaveformSVG clipped={false} />
          </div>
        </div>
      </section>

      <div style={hairline} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PROBLEM
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ ...baseSection, background: C.bg }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '72px',
          alignItems: 'start',
        }}>
          <div>
            <div style={{
              fontSize: '0.68rem', color: C.accent,
              letterSpacing: '3px', fontWeight: 700, marginBottom: '20px',
            }}>
              {t.problemLabel}
            </div>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
              fontWeight: 700, lineHeight: 1.2,
              letterSpacing: '-0.5px', whiteSpace: 'pre-line',
              marginBottom: '28px', color: C.ink,
            }}>
              {t.problemTitle}
            </h2>
            <p style={{ color: C.inkMid, fontSize: '0.97rem', lineHeight: 1.85 }}>
              {t.problemDesc}
            </p>
          </div>

          <div style={{
            background: C.bgSoft, border: `1px solid ${C.border}`,
            borderRadius: '20px', padding: '36px 32px',
          }}>
            <div style={{
              fontSize: '0.65rem', color: C.inkMuted,
              letterSpacing: '3px', marginBottom: '12px', fontWeight: 600,
            }}>
              {t.algoLabel}
            </div>
            <div style={{
              fontSize: '1.05rem', fontWeight: 600, color: C.ink,
              marginBottom: '36px', lineHeight: 1.4,
              borderBottom: `1px solid ${C.border}`, paddingBottom: '20px',
            }}>
              {t.algoName}
            </div>
            {[
              { label: t.algo1, color: C.red },
              { label: t.algo2, color: C.gold },
              { label: t.algo3, color: C.accent },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center',
                gap: '14px', marginBottom: i < 2 ? '16px' : 0,
              }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: C.bg, border: `1.5px solid ${item.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', color: item.color, fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '0.9rem', color: C.inkMid }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={hairline} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          EVIDENCE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ ...baseSection, background: C.bgSoft }}>
        <div style={{ marginBottom: '56px' }}>
          <div style={{
            fontSize: '0.68rem', color: C.accent,
            letterSpacing: '3px', fontWeight: 700, marginBottom: '16px',
          }}>
            {t.evidenceLabel}
          </div>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
            fontWeight: 700, letterSpacing: '-0.5px',
            lineHeight: 1.2, color: C.ink,
          }}>
            {t.evidenceTitle}
            <span style={{ color: C.accent }}> {t.evidenceSubtitle}</span>
          </h2>
        </div>

        {[
          {
            src: '/スクリーンショット 0008-03-26 11.07.47.png',
            caption: t.evidenceOverallCaption,
            label: 'FIGURE 01',
          },
          {
            src: '/ダウンロード.png',
            caption: t.evidenceZoomCaption,
            label: 'FIGURE 02',
          },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: i === 0 ? '36px' : 0 }}>
            <div style={{
              fontSize: '0.65rem', color: C.inkMuted,
              letterSpacing: '3px', marginBottom: '12px', fontWeight: 600,
            }}>
              {item.label}
            </div>
            <div style={{
              background: C.bgCard, border: `1px solid ${C.border}`,
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}>
              <img
                src={item.src}
                alt={item.caption}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              <div style={{
                padding: '14px 22px', fontSize: '0.82rem',
                color: C.inkMuted, borderTop: `1px solid ${C.border}`, lineHeight: 1.6,
              }}>
                {item.caption}
              </div>
            </div>
          </div>
        ))}
      </section>

      <div style={hairline} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HOW TO USE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ ...baseSection, background: C.bg }}>
        <div style={{ marginBottom: '56px' }}>
          <div style={{
            fontSize: '0.68rem', color: C.accent,
            letterSpacing: '3px', fontWeight: 700, marginBottom: '16px',
          }}>
            {t.howToLabel}
          </div>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
            fontWeight: 700, letterSpacing: '-0.5px',
            lineHeight: 1.2, whiteSpace: 'pre-line', color: C.ink,
          }}>
            {t.howToTitle}
          </h2>
        </div>

        {/* 3ステップ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginBottom: '56px',
        }}>
          {[
            { step: t.step1, title: t.step1Title, desc: t.step1Desc },
            { step: t.step2, title: t.step2Title, desc: t.step2Desc },
            { step: t.step3, title: t.step3Title, desc: t.step3Desc },
          ].map((item, i) => (
            <div key={i} className="step-card" style={{
              background: C.bgSoft, border: `1px solid ${C.border}`,
              borderRadius: '14px', padding: '28px 24px', transition: 'all 0.2s',
            }}>
              <div style={{
                fontSize: '0.65rem', color: C.accent,
                letterSpacing: '3px', marginBottom: '14px', fontWeight: 700,
              }}>
                {item.step}
              </div>
              <div style={{
                fontSize: '1rem', fontWeight: 600,
                marginBottom: '10px', lineHeight: 1.3, color: C.ink,
              }}>
                {item.title}
              </div>
              <div style={{ fontSize: '0.87rem', color: C.inkMid, lineHeight: 1.75 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* UIスクリーンショット */}
        <div style={{
          background: C.bgCard, border: `1px solid ${C.border}`,
          borderRadius: '14px', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '48px',
        }}>
          <div style={{
            padding: '11px 18px', borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', gap: '8px', background: C.bgSoft,
          }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => (
              <div key={i} style={{
                width: '11px', height: '11px', borderRadius: '50%', background: c,
              }} />
            ))}
            <span style={{
              fontSize: '0.73rem', color: C.inkMuted,
              marginLeft: '8px', letterSpacing: '0.5px',
            }}>
              KUON ITADAKI — App Interface
            </span>
          </div>
          <img
            src="/スクリーンショット 0008-03-26 14.07.26.png"
            alt="App UI"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* PRO TIP */}
        <div style={{
          background: C.goldLight,
          border: `1px solid ${C.goldBorder}`,
          borderLeft: `4px solid ${C.gold}`,
          borderRadius: '0 12px 12px 0',
          padding: '28px 32px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', marginBottom: '12px', flexWrap: 'wrap' as const,
          }}>
            <span style={{
              fontSize: '0.63rem', fontWeight: 700, letterSpacing: '2px',
              color: C.gold, background: 'rgba(214,158,46,0.12)',
              padding: '3px 10px', borderRadius: '4px',
              border: `1px solid ${C.goldBorder}`,
            }}>
              {t.proTipLabel}
            </span>
            <span style={{ fontSize: '0.98rem', fontWeight: 600, color: C.ink }}>
              {t.proTipTitle}
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: C.inkMid, lineHeight: 1.85 }}>
            {t.proTipDesc}
          </p>
        </div>
      </section>

      <div style={hairline} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CTA
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{
        ...baseSection,
        padding: '100px 32px 120px',
        background: C.bgSoft,
        textAlign: 'center',
      }}>
        <div style={{
          background: C.bgCard, border: `1px solid ${C.border}`,
          borderRadius: '24px', padding: '72px 48px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '160px', height: '2px',
            background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
          }} />
          <div style={{
            fontSize: '0.68rem', color: C.accent,
            letterSpacing: '3px', fontWeight: 700, marginBottom: '20px',
          }}>
            {t.priceLabel.toUpperCase()}
          </div>
          <div style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: 700, letterSpacing: '-3px',
            lineHeight: 1, color: C.ink, marginBottom: '10px',
          }}>
            {t.priceValue}
          </div>
          <div style={{ fontSize: '0.87rem', color: C.inkMuted, marginBottom: '48px' }}>
            {t.priceSub}
          </div>
          <a
            href="https://kuon-rnd.com/purchase"
            className="cta-btn"
            style={{
              display: 'inline-block',
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
              color: C.white, padding: '18px 52px',
              borderRadius: '100px', fontSize: '1rem',
              fontWeight: 700, textDecoration: 'none',
              letterSpacing: '0.3px',
              boxShadow: `0 8px 28px rgba(0,153,187,0.22)`,
              transition: 'all 0.25s ease',
            }}
          >
            {t.ctaBtn} →
          </a>
          <div style={{ marginTop: '20px', fontSize: '0.78rem', color: C.inkMuted }}>
            🔒 {t.ctaSub}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '0.8rem', color: C.inkMuted, background: C.bg,
        flexWrap: 'wrap' as const, gap: '8px',
      }}>
        <div style={{ fontWeight: 600, color: C.ink }}>
          空音開発 <span style={{ color: C.accent, fontWeight: 400 }}>Kuon R&D</span>
        </div>
        <div>{t.footerCopy}</div>
      </footer>
    </div>
  );
}
