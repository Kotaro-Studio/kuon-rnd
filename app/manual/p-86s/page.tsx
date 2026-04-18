'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Design tokens  (shared with /microphone)
// ─────────────────────────────────────────────
const ACCENT = '#0284c7';
const GOLD   = '#bda678';
const WARN   = '#c62828';
const serif  = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans   = '"Helvetica Neue", Arial, sans-serif';

type L3 = Record<Lang, string>;

// ─────────────────────────────────────────────
// Scroll-reveal hook
// ─────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(28px)', transition: 'opacity 0.7s ease, transform 0.7s ease' } as CSSProperties };
}

// ─────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────
function Section({ children, style, bg }: { children: React.ReactNode; style?: CSSProperties; bg?: string }) {
  const r = useReveal();
  return (
    <div ref={r.ref} style={{ ...r.style, padding: 'clamp(50px,8vw,90px) clamp(16px,4vw,40px)', background: bg || 'transparent', ...style }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Glass card style
// ─────────────────────────────────────────────
const glass: CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
  borderRadius: '20px', border: '1px solid rgba(255,255,255,1)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
};

// ─────────────────────────────────────────────
// Data: Recommended Gear
// ─────────────────────────────────────────────
type GearItem = { name: string; nameEn: string; desc: L3; badge?: string };

const HEADPHONES: GearItem[] = [
  {
    name: 'Sennheiser HD 25', nameEn: 'Sennheiser HD 25', badge: 'RECOMMEND',
    desc: {
      ja: '当スタジオが強く推奨するモニターヘッドホン。録音現場で正確なモニターができ、日常の音楽鑑賞にも最高の音質。低価格・頑丈・超ロングセラー。',
      en: 'Our studio\'s top recommendation. Accurate monitoring at any recording site, superb sound for daily listening. Affordable, tough, and a long-standing bestseller.',
      es: 'Nuestra recomendación principal. Monitoreo preciso en cualquier sitio de grabación, sonido excelente. Asequible, resistente y un éxito de ventas.',
    },
  },
];

const RECORDERS_ENTRY: GearItem[] = [
  {
    name: 'ZOOM H1essential', nameEn: 'ZOOM H1essential',
    desc: {
      ja: '32bit フロート録音対応。入門機ながら音割れの心配がほぼゼロ。最初の1台に最適。',
      en: '32-bit float recording. Virtually zero risk of clipping, perfect as your first recorder.',
      es: 'Grabación en 32 bits float. Prácticamente sin riesgo de distorsión, ideal como primera grabadora.',
    },
  },
  {
    name: 'TASCAM DR-05XP', nameEn: 'TASCAM DR-05XP',
    desc: {
      ja: 'バランス型プラグインパワー対応。TASCAMならではの堅実な音質と操作性。',
      en: 'Balanced plug-in power support. Solid TASCAM audio quality and usability.',
      es: 'Compatible con alimentación plug-in balanceada. Calidad y usabilidad sólidas de TASCAM.',
    },
  },
];

const RECORDERS_PRO: GearItem[] = [
  {
    name: 'ZOOM H5 essential', nameEn: 'ZOOM H5 essential',
    desc: {
      ja: '多機能・高音質。マイクカプセル交換可能。長時間のフィールド録音にも対応。',
      en: 'Feature-rich, high quality. Interchangeable mic capsules. Great for long field sessions.',
      es: 'Versátil y de alta calidad. Cápsulas intercambiables. Ideal para sesiones largas de campo.',
    },
  },
  {
    name: 'TASCAM Portacapture X6', nameEn: 'TASCAM Portacapture X6', badge: 'HIGH-END',
    desc: {
      ja: '32bit フロート + タッチスクリーン。プロの現場で活躍する最高峰のポータブルレコーダー。',
      en: '32-bit float + touchscreen. A top-tier portable recorder for professional use.',
      es: '32 bits float + pantalla táctil. Grabadora portátil de primera clase para uso profesional.',
    },
  },
];

// ─────────────────────────────────────────────
// Data: Recommended Accessories
// ─────────────────────────────────────────────
type AccessoryItem = { name: string; desc: L3; badge?: string };

const STEREO_BARS: AccessoryItem[] = [
  {
    name: 'K&M 236',
    desc: {
      ja: 'ドイツ製マイクバーの定番。高い剛性で微細な振動を抑え、安価な製品とは「音の締まり」が全然違います。通常はこれ1本でOK。',
      en: 'The German standard stereo bar. Superior rigidity suppresses micro-vibrations — a clear difference in sound tightness. One bar is all you need.',
      es: 'La barra estéreo estándar alemana. Rigidez superior que suprime microvibraciones. Una barra es todo lo que necesitas.',
    },
  },
  {
    name: 'K&M 23560',
    desc: {
      ja: 'ロングタイプ。自然界の録音やオーケストラなど、左右の幅を大きく取りたい場合に。壮大なステレオイメージを構築できます。',
      en: 'Long type. For nature recording or orchestras where you need wider spacing. Creates a grand stereo image.',
      es: 'Tipo largo. Para grabaciones de naturaleza u orquestas donde necesitas mayor separación.',
    },
  },
];

const STANDS: AccessoryItem[] = [
  {
    name: 'K&M 26000B',
    desc: {
      ja: 'スタジオ常設向け。鉄板ベースの重量で床からの振動をシャットアウト。圧倒的に音が良くなるプロの定番。',
      en: 'For permanent studio use. Heavy iron base blocks floor vibrations. A pro standard for dramatically better sound.',
      es: 'Para uso permanente en estudio. Base de hierro pesada que bloquea vibraciones del suelo.',
    },
  },
  {
    name: 'K&M 20120B',
    desc: {
      ja: '折りたたみ式・持ち運び重視。軽量ながらドイツ製の精度でガタつきが少なく安定した録音が可能。',
      en: 'Foldable & portable. Lightweight but with German precision — minimal wobble for stable recording.',
      es: 'Plegable y portátil. Ligero pero con precisión alemana para grabaciones estables.',
    },
  },
];

const TOOLS: AccessoryItem[] = [
  {
    name: 'K&M 238B', badge: "EDITOR'S PICK",
    desc: {
      ja: 'ユニバーサルブラケット。スタンドのポールにレコーダーやマイクバーを増設できる万能ツール。日常生活でも「痒い所に手が届く」逸品。',
      en: 'Universal bracket. Mount recorders or mic bars on any stand pole. Incredibly versatile — useful even outside audio.',
      es: 'Soporte universal. Monte grabadoras o barras de micrófono en cualquier poste. Increíblemente versátil.',
    },
  },
  {
    name: 'K&M 232B',
    desc: {
      ja: '卓上スタンド。鉄製の重量級で振動を逃さない。デスクでの録音・ポッドキャスト収録に最適。',
      en: 'Desktop stand. Heavy iron construction absorbs vibrations. Ideal for desk recording and podcasts.',
      es: 'Soporte de escritorio. Construcción pesada de hierro que absorbe vibraciones.',
    },
  },
];

// ─────────────────────────────────────────────
// Gallery images
// ─────────────────────────────────────────────
type GalleryItem = { src: string; alt: string; title: L3; desc: L3; contain?: boolean };

const GALLERY: GalleryItem[] = [
  {
    src: '/IMG_20260211_080312.png', alt: 'P-86S Housing',
    title: { ja: '極小のハウジング', en: 'Minimal Housing', es: 'Carcasa Mínima' },
    desc: {
      ja: '音の回折や反射を防ぐため、シールドは最小限に。Sennheiser MKE 2 や DPA 4060 等の市販ラベリアマイクとほぼ同じ構造です。',
      en: 'Minimal shielding to prevent sound diffraction and reflection. Nearly identical structure to Sennheiser MKE 2 and DPA 4060 lavalier microphones.',
      es: 'Blindaje mínimo para evitar difracción y reflexión del sonido. Estructura casi idéntica a Sennheiser MKE 2 y DPA 4060.',
    },
  },
  {
    src: '/IMG_20260223_155624.jpg', alt: 'P-86S Cable',
    title: { ja: '約1.5mのケーブル', en: '1.5m Cable Length', es: 'Cable de 1.5m' },
    desc: {
      ja: '現場での経験を活かした最適なケーブル長。マイクスタンドにレコーダーを設置すれば、取り回しに困ることはありません。',
      en: 'Optimal cable length refined through field experience. Mount your recorder on the mic stand for effortless setup.',
      es: 'Longitud de cable óptima refinada por experiencia en campo. Monte su grabadora en el soporte para una configuración sin esfuerzo.',
    },
  },
  {
    src: '/glasses-mic.png', alt: 'Glasses Microphone', contain: true,
    title: { ja: '応用：メガネマイク', en: 'Advanced: Glasses Mic', es: 'Avanzado: Micrófono de Gafas' },
    desc: {
      ja: 'その小ささと軽さを活かし、メガネのテンプルに装着。スタンド不要の「ウェアラブル録音」を実現します。',
      en: 'Leveraging its tiny size and weight, attach to glasses temples. Enables stand-free "wearable recording."',
      es: 'Aprovechando su tamaño y peso mínimos, se fija en las patillas de las gafas para grabación portátil.',
    },
  },
];

// ─────────────────────────────────────────────
// Component: Gear Card
// ─────────────────────────────────────────────
function GearCard({ item, lang }: { item: GearItem | AccessoryItem; lang: Lang }) {
  return (
    <div style={{
      ...glass, padding: 'clamp(22px,3vw,32px)', position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {item.badge && (
        <span style={{
          position: 'absolute', top: -12, right: 20,
          background: item.badge === 'RECOMMEND' || item.badge === "EDITOR'S PICK" ? ACCENT : GOLD,
          color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: sans,
          padding: '4px 14px', borderRadius: 20, letterSpacing: '0.08em',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}>{item.badge}</span>
      )}
      <span style={{ fontFamily: sans, fontSize: 'clamp(0.85rem,1.2vw,0.95rem)', fontWeight: 700, color: '#1d1d1f', letterSpacing: '0.02em' }}>
        {item.name}
      </span>
      <p style={{ fontFamily: serif, fontSize: 'clamp(0.78rem,1vw,0.88rem)', color: '#555', lineHeight: 1.8, margin: 0, flex: 1 }}>
        {item.desc[lang]}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════
export default function ManualP86S() {
  const { lang } = useLang();
  const t = (ja: string, en: string, es: string) => lang === 'ja' ? ja : lang === 'en' ? en : es;

  // ─── Hero ───
  const heroReveal = useReveal();

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh' }}>

      {/* ═══ HERO ═══ */}
      <div ref={heroReveal.ref} style={{
        ...heroReveal.style,
        textAlign: 'center',
        padding: 'clamp(80px,12vw,140px) clamp(16px,4vw,40px) clamp(50px,8vw,80px)',
        borderBottom: '1px solid #eee',
      }}>
        <span style={{
          fontFamily: sans, fontSize: 11, letterSpacing: '0.25em', color: ACCENT,
          textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 18,
        }}>
          {t('空音開発 P-86S', 'Kuon R&D P-86S', 'Kuon R&D P-86S')}
        </span>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(1.6rem,4.5vw,2.6rem)', fontWeight: 500,
          color: '#1d1d1f', margin: '0 0 24px', letterSpacing: '-0.02em', lineHeight: 1.3,
        }}>
          {t(
            'P-86S スタートアップガイド',
            'P-86S Startup Guide',
            'Guía de Inicio P-86S',
          )}
        </h1>
        <p style={{
          fontFamily: serif, fontSize: 'clamp(0.85rem,1.3vw,1rem)', color: '#666',
          maxWidth: 620, margin: '0 auto', lineHeight: 1.9,
        }}>
          {t(
            '空音開発のクラフトマイクをご購入いただきありがとうございます。\n「ありのままの音」を記録するための、基本的な準備とセッティング方法を解説します。',
            'Thank you for purchasing our craft microphone.\nThis guide covers the basic preparation and setup for capturing pristine sound.',
            'Gracias por adquirir nuestro micrófono artesanal.\nEsta guía cubre la preparación y configuración básica para capturar sonido prístino.',
          )}
        </p>
      </div>

      {/* ═══ 1. NECESSARY GEAR ═══ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 12, color: '#1d1d1f' }}>
          {t('必要機材リスト', 'Required Gear', 'Equipo Necesario')}
        </h2>
        <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1.1vw,0.9rem)', color: '#888', textAlign: 'center', marginBottom: 50 }}>
          {t('P-86S と一緒に揃えておきたい基本アイテム', 'Essential items to pair with your P-86S', 'Artículos esenciales para combinar con tu P-86S')}
        </p>

        {/* Headphones */}
        <div style={{ marginBottom: 50 }}>
          <h3 style={{
            fontFamily: sans, fontSize: 'clamp(0.75rem,1vw,0.85rem)', fontWeight: 700,
            letterSpacing: '0.15em', color: ACCENT, textTransform: 'uppercase', marginBottom: 18,
          }}>
            {t('モニターヘッドホン', 'Monitor Headphones', 'Auriculares de Monitoreo')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
            {HEADPHONES.map(h => <GearCard key={h.name} item={h} lang={lang} />)}
          </div>
        </div>

        {/* Recorders */}
        <div>
          <h3 style={{
            fontFamily: sans, fontSize: 'clamp(0.75rem,1vw,0.85rem)', fontWeight: 700,
            letterSpacing: '0.15em', color: ACCENT, textTransform: 'uppercase', marginBottom: 18,
          }}>
            {t('対応レコーダー', 'Compatible Recorders', 'Grabadoras Compatibles')}
          </h3>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1vw,0.88rem)', color: '#666', marginBottom: 20, lineHeight: 1.8 }}>
            {t(
              'P-86Sは「プラグインパワー」で駆動します。ご予算と用途に合わせてお選びください。',
              'The P-86S runs on plug-in power. Choose based on your budget and use case.',
              'El P-86S funciona con alimentación plug-in. Elige según tu presupuesto y uso.',
            )}
          </p>

          {/* Entry */}
          <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', display: 'block', marginBottom: 12 }}>
            ENTRY MODEL
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 30 }}>
            {RECORDERS_ENTRY.map(r => <GearCard key={r.name} item={r} lang={lang} />)}
          </div>

          {/* Pro */}
          <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', display: 'block', marginBottom: 12 }}>
            HIGH-END MODEL
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {RECORDERS_PRO.map(r => <GearCard key={r.name} item={r} lang={lang} />)}
          </div>
        </div>
      </Section>

      {/* ═══ 2. PHANTOM WARNING ═══ */}
      <Section>
        <div style={{
          background: '#fff5f5', border: `2px solid ${WARN}22`, borderRadius: 16,
          padding: 'clamp(24px,3vw,36px)', display: 'flex', alignItems: 'flex-start', gap: 20,
        }}>
          <span style={{ fontSize: 32, flexShrink: 0, lineHeight: 1 }}>&#x26a0;&#xfe0f;</span>
          <div>
            <h3 style={{ fontFamily: sans, fontSize: 'clamp(0.9rem,1.3vw,1.05rem)', fontWeight: 700, color: WARN, margin: '0 0 8px' }}>
              {t('【重要】ファンタム電源（+48V）は絶対に使用しないでください', 'IMPORTANT: Never apply phantom power (+48V)', 'IMPORTANTE: Nunca aplique alimentación fantasma (+48V)')}
            </h3>
            <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1vw,0.88rem)', color: '#555', lineHeight: 1.8, margin: 0 }}>
              {t(
                'P-86Sは音質を極限まで追求するために繊細な回路設計を採用しています。業務用のファンタム電源（+48V）をかけると、回路が一瞬で破損します。ファンタム電源で使用したい方は、XLR端子モデルの X-86S をお求めください。',
                'The P-86S uses a delicate circuit design to pursue the ultimate sound quality. Applying phantom power (+48V) will instantly destroy the circuit. If you need phantom power, please consider the X-86S with XLR connectors.',
                'El P-86S utiliza un diseño de circuito delicado para lograr la máxima calidad de sonido. Aplicar alimentación fantasma (+48V) destruirá el circuito instantáneamente. Si necesita alimentación fantasma, considere el X-86S con conectores XLR.',
              )}
            </p>
            <Link href="/microphone" style={{ fontFamily: sans, fontSize: 13, color: ACCENT, textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginTop: 10 }}>
              {t('X-86S について詳しく →', 'Learn about X-86S →', 'Más sobre X-86S →')}
            </Link>
          </div>
        </div>
      </Section>

      {/* ═══ 3. CONNECTION STEPS ═══ */}
      <Section bg="#fff">
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 50, color: '#1d1d1f' }}>
          {t('接続の手順', 'Connection Steps', 'Pasos de Conexión')}
        </h2>
        {[
          {
            num: 1,
            title: { ja: 'レコーダーの設定確認', en: 'Check Recorder Settings', es: 'Verificar Configuración' },
            desc: {
              ja: 'レコーダーのメニューから「MIC POWER」または「PLUG-IN POWER」の設定を ON にしてください。OFFのままだと音が出ません。',
              en: 'In your recorder\'s menu, turn ON the "MIC POWER" or "PLUG-IN POWER" setting. No sound will be produced if this is OFF.',
              es: 'En el menú de su grabadora, active "MIC POWER" o "PLUG-IN POWER". No se producirá sonido si está desactivado.',
            },
          },
          {
            num: 2,
            title: { ja: 'マイクの接続', en: 'Connect the Microphone', es: 'Conectar el Micrófono' },
            desc: {
              ja: 'レコーダーの「MIC IN（マイク入力）」端子に P-86S を接続します。「LINE IN」には挿さないようご注意ください。',
              en: 'Connect the P-86S to your recorder\'s "MIC IN" input. Do not use the "LINE IN" jack.',
              es: 'Conecte el P-86S a la entrada "MIC IN" de su grabadora. No use la entrada "LINE IN".',
            },
          },
          {
            num: 3,
            title: { ja: 'ゲイン（入力レベル）の調整', en: 'Adjust Gain (Input Level)', es: 'Ajustar Ganancia (Nivel de Entrada)' },
            desc: {
              ja: 'P-86Sは非常に高感度です。入力レベルはかなり低めからスタートし、音が割れないギリギリのラインを探ってください。32bit フロート対応レコーダーでも入力感度の調整が必要な場合があります。入力感度は小さめにし、後からノーマライズ処理で調整するのが安全です。',
              en: 'The P-86S is extremely sensitive. Start with a very low input level and find the sweet spot just before clipping. Even 32-bit float recorders may need gain adjustment. Keep input sensitivity low and use normalization in post-processing.',
              es: 'El P-86S es extremadamente sensible. Comience con un nivel de entrada muy bajo y encuentre el punto justo antes del recorte. Incluso las grabadoras de 32 bits float pueden necesitar ajuste. Mantenga la sensibilidad baja y use normalización en postproducción.',
            },
          },
        ].map(step => (
          <div key={step.num} style={{ display: 'flex', gap: 'clamp(16px,2.5vw,24px)', marginBottom: 40, alignItems: 'flex-start' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: '#1d1d1f',
              color: '#fff', fontFamily: sans, fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
            }}>{step.num}</div>
            <div>
              <h3 style={{ fontFamily: serif, fontSize: 'clamp(0.95rem,1.3vw,1.1rem)', fontWeight: 700, margin: '0 0 8px', color: '#1d1d1f' }}>
                {step.title[lang]}
              </h3>
              <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1vw,0.9rem)', color: '#555', lineHeight: 1.9, margin: 0 }}>
                {step.desc[lang]}
              </p>
            </div>
          </div>
        ))}

        {/* Normalize link */}
        <div style={{ ...glass, padding: 20, display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>&#x1f4a1;</span>
          <div>
            <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1vw,0.88rem)', color: '#555', lineHeight: 1.8, margin: 0 }}>
              {t(
                'ノーマライズ処理には、空音開発の無料アプリ KUON NORMALIZE をお使いいただけます。',
                'You can use our free app KUON NORMALIZE for normalization.',
                'Puede usar nuestra app gratuita KUON NORMALIZE para la normalización.',
              )}
            </p>
            <Link href="/normalize" style={{ fontFamily: sans, fontSize: 13, color: ACCENT, textDecoration: 'none', fontWeight: 600, display: 'inline-block', marginTop: 6 }}>
              {t('KUON NORMALIZE を開く →', 'Open KUON NORMALIZE →', 'Abrir KUON NORMALIZE →')}
            </Link>
          </div>
        </div>
      </Section>

      {/* ═══ 4. AB STEREO METHOD ═══ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 16, color: '#1d1d1f' }}>
          {t('基本セッティング：無指向性AB方式', 'Basic Setup: Omnidirectional AB Method', 'Configuración Básica: Método AB Omnidireccional')}
        </h2>
        <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1.1vw,0.9rem)', color: '#888', textAlign: 'center', marginBottom: 50 }}>
          {t('「間隔」が「広がり」を作る', '"Spacing" creates "Spread"', '"La separación" crea "la amplitud"')}
        </p>

        <div style={{ ...glass, padding: 'clamp(30px,4vw,50px)', textAlign: 'center' }}>
          {/* Visual diagram */}
          <div style={{ position: 'relative', width: 240, height: 80, margin: '0 auto 30px', borderTop: `2px dashed ${GOLD}` }}>
            <span style={{ position: 'absolute', left: -8, top: -18, fontFamily: sans, fontSize: 13, fontWeight: 700, color: ACCENT }}>Mic L</span>
            <span style={{ position: 'absolute', right: -8, top: -18, fontFamily: sans, fontSize: 13, fontWeight: 700, color: ACCENT }}>Mic R</span>
            <span style={{ position: 'absolute', width: '100%', top: -32, textAlign: 'center', fontFamily: sans, fontSize: 14, fontWeight: 700, color: GOLD }}>30cm — 50cm</span>
            {/* Mic dots */}
            <span style={{ position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: ACCENT }} />
            <span style={{ position: 'absolute', right: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: ACCENT }} />
          </div>

          <div style={{ textAlign: 'left', maxWidth: 680, margin: '0 auto' }}>
            <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.92rem)', color: '#444', lineHeight: 1.9, marginBottom: 20 }}>
              {t(
                'P-86Sのような無指向性マイクでは、マイクを向ける角度よりも「マイク同士の距離（間隔）」が重要です。左右のマイクを 30cm〜50cm 離して並行に設置する「AB方式」が基本。この距離によって生じる音の到達時間のズレが、スピーカー再生時にリアルなステレオ感（広がり）を生み出します。',
                'For omnidirectional microphones like the P-86S, the distance between mics matters more than their angle. The basic "AB method" places two mics 30–50cm apart in parallel. The time-of-arrival difference at this distance creates realistic stereo imaging (spread) during speaker playback.',
                'Para micrófonos omnidireccionales como el P-86S, la distancia entre micrófonos importa más que su ángulo. El "método AB" básico coloca dos micrófonos a 30–50cm de separación en paralelo. La diferencia en el tiempo de llegada crea una imagen estéreo realista.',
              )}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                {
                  label: { ja: '狭め（20cm〜）', en: 'Narrow (20cm+)', es: 'Estrecho (20cm+)' },
                  desc: { ja: '中央に密度が集まり、親密な音に。', en: 'Center-focused, intimate sound.', es: 'Sonido centrado e íntimo.' },
                },
                {
                  label: { ja: '標準（30cm〜50cm）', en: 'Standard (30–50cm)', es: 'Estándar (30–50cm)' },
                  desc: { ja: 'バランスの取れた自然なステレオ感。推奨。', en: 'Balanced, natural stereo. Recommended.', es: 'Estéreo natural y equilibrado. Recomendado.' },
                },
                {
                  label: { ja: '広め（50cm〜）', en: 'Wide (50cm+)', es: 'Amplio (50cm+)' },
                  desc: { ja: '壮大なスケール感。フィールド録音に最適。', en: 'Grand scale. Ideal for field recording.', es: 'Gran escala. Ideal para grabación de campo.' },
                },
              ].map(d => (
                <div key={d.label.en} style={{ background: '#f8f8fa', borderRadius: 12, padding: 16, border: '1px solid #eee' }}>
                  <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: ACCENT, display: 'block', marginBottom: 4 }}>{d.label[lang]}</span>
                  <span style={{ fontFamily: serif, fontSize: 13, color: '#666', lineHeight: 1.6 }}>{d.desc[lang]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ 5. VISUAL GALLERY ═══ */}
      <Section bg="#fff">
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 12, color: '#1d1d1f' }}>
          {t('外観ギャラリー', 'Visual Gallery', 'Galería Visual')}
        </h2>
        <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1.1vw,0.9rem)', color: '#888', textAlign: 'center', marginBottom: 50 }}>
          {t(
            '音質だけに極限までこだわった結果、余計な装飾を一切削ぎ落とした「最小限の形状」です。',
            'Unwavering focus on sound quality alone has resulted in a minimalist form — stripped of all unnecessary decoration.',
            'Un enfoque inquebrantable en la calidad del sonido ha resultado en una forma minimalista.',
          )}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {GALLERY.map(img => (
            <div key={img.src} style={{ ...glass, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                position: 'relative', width: '100%', paddingTop: '100%',
                background: '#f5f5f5', overflow: 'hidden',
              }}>
                <Image
                  src={img.src} alt={img.alt} fill
                  style={{ objectFit: img.contain ? 'contain' : 'cover', padding: img.contain ? 12 : 0 }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div style={{ padding: 'clamp(16px,2vw,24px)' }}>
                <span style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: '#1d1d1f', display: 'block', marginBottom: 8 }}>
                  {img.title[lang]}
                </span>
                <p style={{ fontFamily: serif, fontSize: 13, color: '#666', lineHeight: 1.7, margin: 0 }}>
                  {img.desc[lang]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ 6. RECOMMENDED ACCESSORIES ═══ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 12, color: '#1d1d1f' }}>
          {t('より良い録音のためのアイテム', 'Gear for Better Recording', 'Equipo para Mejor Grabación')}
        </h2>
        <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1.1vw,0.9rem)', color: '#888', textAlign: 'center', marginBottom: 50 }}>
          {t(
            'P-86Sの性能を100%引き出すための推奨アクセサリー。ドイツ製 K&M を中心にご紹介します。',
            'Recommended accessories to unlock 100% of the P-86S potential. Featuring German-made K&M products.',
            'Accesorios recomendados para aprovechar al 100% el P-86S. Productos K&M fabricados en Alemania.',
          )}
        </p>

        {/* Stereo Bars */}
        <h3 style={{ fontFamily: sans, fontSize: 'clamp(0.75rem,1vw,0.85rem)', fontWeight: 700, letterSpacing: '0.15em', color: ACCENT, textTransform: 'uppercase', marginBottom: 18, borderLeft: `3px solid ${ACCENT}`, paddingLeft: 12 }}>
          {t('ステレオバー（マイクバー）', 'Stereo Bar (Mic Bar)', 'Barra Estéreo')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 50 }}>
          {STEREO_BARS.map(s => <GearCard key={s.name} item={s} lang={lang} />)}
        </div>

        {/* Stands */}
        <h3 style={{ fontFamily: sans, fontSize: 'clamp(0.75rem,1vw,0.85rem)', fontWeight: 700, letterSpacing: '0.15em', color: ACCENT, textTransform: 'uppercase', marginBottom: 12, borderLeft: `3px solid ${ACCENT}`, paddingLeft: 12 }}>
          {t('マイクスタンド', 'Microphone Stand', 'Soporte de Micrófono')}
        </h3>
        {/* Tip */}
        <div style={{ background: '#fffde7', border: '1px solid #fff9c4', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>&#x1f4a1;</span>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.78rem,1vw,0.86rem)', color: '#666', lineHeight: 1.7, margin: 0 }}>
            {t(
              'ストレートタイプが基本です。ブーム（腕付き）タイプは重心がブレやすく、無指向性AB方式では音が濁る原因になります。',
              'Straight stands are the standard. Boom arms can cause center-of-gravity shifts, muddying the sound in AB setups.',
              'Los soportes rectos son el estándar. Los brazos boom pueden causar cambios en el centro de gravedad, enturbiando el sonido.',
            )}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 50 }}>
          {STANDS.map(s => <GearCard key={s.name} item={s} lang={lang} />)}
        </div>

        {/* Tools */}
        <h3 style={{ fontFamily: sans, fontSize: 'clamp(0.75rem,1vw,0.85rem)', fontWeight: 700, letterSpacing: '0.15em', color: ACCENT, textTransform: 'uppercase', marginBottom: 18, borderLeft: `3px solid ${ACCENT}`, paddingLeft: 12 }}>
          {t('便利ツール', 'Useful Tools', 'Herramientas Útiles')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {TOOLS.map(t => <GearCard key={t.name} item={t} lang={lang} />)}
        </div>
      </Section>

      {/* ═══ 7. ADVANCED TECHNIQUES ═══ */}
      <Section bg="#fff">
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 50, color: '#1d1d1f' }}>
          {t('応用セッティング', 'Advanced Techniques', 'Técnicas Avanzadas')}
        </h2>

        {/* AB Distance Theory */}
        <div style={{ marginBottom: 60 }}>
          <h3 style={{ fontFamily: serif, fontSize: 'clamp(1rem,1.5vw,1.15rem)', fontWeight: 700, color: '#1d1d1f', marginBottom: 16, borderLeft: `4px solid ${GOLD}`, paddingLeft: 16 }}>
            {t('AB方式の「距離」の考え方', 'Understanding AB "Distance"', 'Comprendiendo la "Distancia" AB')}
          </h3>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.92rem)', color: '#444', lineHeight: 1.9, marginBottom: 16 }}>
            {t(
              '無指向性マイクのステレオ録音で最も重要なパラメータは「マイクとマイクの距離」です。30cm以下だと音の到達時間差が少なすぎ十分なステレオ感が得られず、また距離を縮めすぎるとお互いの周波数領域が干渉し位相の悪い音になります。まずは 30cm以上離すことを基本ルールとしてください。',
              'The most critical parameter in omnidirectional stereo recording is the distance between mics. Below 30cm, the time-of-arrival difference is too small for adequate stereo effect, and frequencies interfere causing phase issues. Start with at least 30cm as your baseline rule.',
              'El parámetro más crítico en la grabación estéreo omnidireccional es la distancia entre micrófonos. Por debajo de 30cm, la diferencia de tiempo de llegada es muy pequeña. Comience con al menos 30cm como regla base.',
            )}
          </p>
          <div style={{ ...glass, padding: 'clamp(20px,3vw,30px)', borderLeft: `3px solid ${GOLD}` }}>
            <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              {"PRO'S PERSPECTIVE"}
            </span>
            <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.9rem)', color: '#444', lineHeight: 1.8, margin: 0 }}>
              {t(
                '「正解」はありません。40cmが最適という人もいれば、自然界の収録では1m以上離すこともあります。海外のオーケストラ録音では、数センチ単位で距離を調整してホールの響きをコントロールします。決まりがないからこそ面白く、エンジニアの感性が試される部分です。',
                'There is no "correct answer." Some prefer 40cm, while nature recordists may use over 1 meter. Orchestral engineers abroad adjust by centimeters to shape the hall\'s resonance. The lack of rules is what makes it fascinating — this is where an engineer\'s sensibility is truly tested.',
                'No hay una "respuesta correcta." Algunos prefieren 40cm, mientras que los grabadores de naturaleza pueden usar más de 1 metro. La falta de reglas es lo que lo hace fascinante — aquí es donde se prueba la sensibilidad del ingeniero.',
              )}
            </p>
          </div>
        </div>

        {/* Boundary Miking */}
        <div style={{ marginBottom: 60 }}>
          <h3 style={{ fontFamily: serif, fontSize: 'clamp(1rem,1.5vw,1.15rem)', fontWeight: 700, color: '#1d1d1f', marginBottom: 16, borderLeft: `4px solid ${GOLD}`, paddingLeft: 16 }}>
            {t('バウンダリーマイキング', 'Boundary Miking', 'Microfonía de Superficie')}
          </h3>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.92rem)', color: '#444', lineHeight: 1.9, marginBottom: 16 }}>
            {t(
              '30cm以上の間隔さえ守れば、P-86Sは机や床にテープで直接貼り付けても使用可能です。これは「バウンダリーマイク」と呼ばれる手法で、床や壁からの反射音を排除しクリアな音を録ることができます。舞台演劇や会議の録音によく使われますが、先端を少し浮かせる工夫が必要です。',
              'As long as you maintain at least 30cm spacing, the P-86S can be taped directly to a desk or floor. This "boundary microphone" technique eliminates reflections from surfaces for cleaner sound. Common in theater and conference recording, just ensure the capsule tip is slightly elevated.',
              'Siempre que mantenga al menos 30cm de separación, el P-86S puede pegarse directamente a una mesa o piso. Esta técnica de "micrófono de superficie" elimina reflexiones para un sonido más limpio.',
            )}
          </p>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.92rem)', color: '#444', lineHeight: 1.9 }}>
            {t(
              'デスクで最高の音質を目指すなら、鉄製の重量級スタンド K&M 232B の使用を強く推奨します。振動を逃さず、音の芯が太くなります。',
              'For the best desk recording quality, we strongly recommend the heavy iron K&M 232B stand. It absorbs vibrations for a richer, more centered sound.',
              'Para la mejor calidad de grabación en escritorio, recomendamos el pesado soporte de hierro K&M 232B.',
            )}
          </p>
        </div>

        {/* Glasses Mic */}
        <div>
          <h3 style={{ fontFamily: serif, fontSize: 'clamp(1rem,1.5vw,1.15rem)', fontWeight: 700, color: '#1d1d1f', marginBottom: 16, borderLeft: `4px solid ${GOLD}`, paddingLeft: 16 }}>
            {t('メガネマイク — 機動力の極み', 'Glasses Mic — Ultimate Mobility', 'Micrófono de Gafas — Movilidad Definitiva')}
          </h3>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.92rem)', color: '#444', lineHeight: 1.9 }}>
            {t(
              'メガネのテンプル（つる）の両端にP-86Sを装着する応用例です。左右の間隔は頭の幅（約15cm〜20cm）に限定されますが、頭のアーチでステレオ感を稼ぎ、耳に近い位置からバイノーラルマイクのような音響効果が得られます。マイクスタンド不要で「自分の聴いている音」をそのまま記録できるため、旅の記録やフィールドワーク、ドキュメンタリー取材など軽装で臨みたいシーンに最適です。',
              'An advanced technique: attach the P-86S to both temples of your glasses. While spacing is limited to head width (15–20cm), the head\'s arc provides some stereo effect, and the ear-level position creates a binaural-like acoustic result. No stand needed — record exactly what you hear. Perfect for travel, fieldwork, and documentary journalism.',
              'Una técnica avanzada: fije el P-86S en ambas patillas de sus gafas. Aunque la separación se limita al ancho de la cabeza, el arco craneal proporciona efecto estéreo y la posición cercana al oído crea un resultado acústico similar al binaural. Ideal para viajes y documentales.',
            )}
          </p>
        </div>
      </Section>

      {/* ═══ 8. OUTDOOR RECORDING ═══ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 50, color: '#1d1d1f' }}>
          {t('屋外録音の必需品', 'Outdoor Recording Essentials', 'Esenciales para Grabación Exterior')}
        </h2>
        <div style={{ ...glass, padding: 'clamp(28px,4vw,45px)', textAlign: 'center' }}>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1.1vw,0.92rem)', color: '#555', lineHeight: 1.9, maxWidth: 640, margin: '0 auto 24px' }}>
            {t(
              '屋外では微風であってもマイクにとっては「暴風」のようなノイズになります。外で録音する際は、必ずウインドスクリーン（風防）を装着してください。適合サイズは「1.5cm のピンマイク用ヘアリーウインドマフ」です。これを装着するとかなりの暴風でも録音が成功していることが多いです。',
              'Even a light breeze sounds like a storm to a microphone outdoors. Always attach a windscreen when recording outside. The compatible size is a "1.5cm hairy windscreen for lavalier mics." With this attached, recordings often succeed even in strong winds.',
              'Incluso una brisa ligera suena como una tormenta para un micrófono al aire libre. Siempre use un paravientos. El tamaño compatible es "1.5cm para micrófonos lavalier." Con esto, las grabaciones suelen tener éxito incluso con vientos fuertes.',
            )}
          </p>
          <p style={{ fontFamily: sans, fontSize: 'clamp(0.75rem,1vw,0.85rem)', color: '#999', margin: 0 }}>
            {t(
              '※ Amazon・楽天等で「ピンマイク ウインドスクリーン 1.5cm」で検索すると見つかります。',
              '* Search "lavalier windscreen 1.5cm" on Amazon to find compatible products.',
              '* Busque "windscreen lavalier 1.5cm" en Amazon para encontrar productos compatibles.',
            )}
          </p>
        </div>
      </Section>

      {/* ═══ 9. HANDLING PRECAUTIONS ═══ */}
      <Section bg="#fff">
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center',
          color: WARN, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <span>&#x26a0;&#xfe0f;</span>
          {t('取り扱いの最重要事項', 'Critical Handling Precautions', 'Precauciones Críticas de Manejo')}
        </h2>
        <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1.1vw,0.92rem)', color: '#666', textAlign: 'center', lineHeight: 1.8, marginBottom: 50, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          {t(
            'P-86Sは最高の音質を追求するために、あえて頑丈さよりも音響性能を最優先に設計されています。市販の「頑丈だが音質を犠牲にしたマイク」とは根本的に異なる設計思想です。楽器と同じく、丁寧な扱いが最高の音を引き出します。',
            'The P-86S is deliberately designed to prioritize acoustic performance over ruggedness, in pursuit of the ultimate sound quality. This fundamentally differs from commercial microphones that sacrifice sound for durability. Like a fine instrument, careful handling unlocks the best sound.',
            'El P-86S está diseñado deliberadamente para priorizar el rendimiento acústico sobre la robustez, en busca de la máxima calidad de sonido. Como un instrumento fino, el manejo cuidadoso produce el mejor sonido.',
          )}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {/* Caution 1: Tape */}
          <div style={{
            border: `2px dashed ${WARN}33`, background: '#fff5f5', borderRadius: 20,
            padding: 'clamp(28px,3vw,36px)', textAlign: 'center', position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
              background: WARN, color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: sans,
              padding: '4px 18px', borderRadius: 20, boxShadow: '0 4px 12px rgba(198,40,40,0.2)',
            }}>NG</span>
            <span style={{ fontSize: 42, display: 'block', margin: '20px 0 16px' }}>&#x1f6ab;</span>
            <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: WARN, display: 'block', marginBottom: 12 }}>
              {t('先端をテープで塞がない', 'Do Not Cover the Tip with Tape', 'No Cubra la Punta con Cinta')}
            </span>
            <p style={{ fontFamily: serif, fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0, textAlign: 'left' }}>
              {t(
                '最高の音質を実現するため、先端の金属部分（集音口）は極限まで薄く精密に加工されています。ここにテープがかかると高音域が録音されなくなったり、音が極端に小さくなります。テープで固定する際は、必ず先端から少し離した場所に貼ってください。',
                'To achieve the ultimate sound quality, the metal tip (sound inlet) is precisely machined to be extremely thin. Covering it with tape will block high frequencies or drastically reduce volume. When taping, always place tape away from the tip.',
                'Para lograr la máxima calidad de sonido, la punta metálica está mecanizada con precisión extrema. Cubrirla con cinta bloqueará las altas frecuencias. Siempre coloque la cinta lejos de la punta.',
              )}
            </p>
          </div>

          {/* Caution 2: Pressure */}
          <div style={{
            border: `2px dashed ${WARN}33`, background: '#fff5f5', borderRadius: 20,
            padding: 'clamp(28px,3vw,36px)', textAlign: 'center', position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
              background: WARN, color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: sans,
              padding: '4px 18px', borderRadius: 20, boxShadow: '0 4px 12px rgba(198,40,40,0.2)',
            }}>NG</span>
            <span style={{ fontSize: 42, display: 'block', margin: '20px 0 16px' }}>&#x1f447;</span>
            <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: WARN, display: 'block', marginBottom: 12 }}>
              {t('先端を強く押さない', 'Do Not Press the Tip Hard', 'No Presione la Punta con Fuerza')}
            </span>
            <p style={{ fontFamily: serif, fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0, textAlign: 'left' }}>
              {t(
                '音質を最優先に設計しているため、先端部分には非常に薄く繊細な振動板が使われています。指で強く押したり、落下による衝撃を与えると振動板が変形し、本来の性能を発揮できなくなります。楽器と同じく丁寧に扱ってください。',
                'Because sound quality is the absolute priority, the tip contains an extremely thin and delicate diaphragm. Pressing hard with a finger or dropping it can deform the diaphragm, preventing it from performing as designed. Handle with the same care as a musical instrument.',
                'Debido a que la calidad del sonido es la prioridad absoluta, la punta contiene un diafragma extremadamente delgado y delicado. Presionar fuerte o dejarlo caer puede deformar el diafragma. Trátelo con el mismo cuidado que un instrumento musical.',
              )}
            </p>
          </div>
        </div>
      </Section>

      {/* ═══ 10. FINAL MESSAGE + CTA ═══ */}
      <Section>
        <div style={{ textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 60 }}>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.95rem,1.5vw,1.1rem)', color: '#1d1d1f', lineHeight: 1.9, marginBottom: 30 }}>
            {t(
              'P-86Sは、あなたの「耳」の代わりとなるパートナーです。\n大切に扱えば、一生の思い出となる素晴らしい音を記録し続けてくれるでしょう。',
              'The P-86S is a partner that becomes your "ears."\nTreat it well, and it will continue to record magnificent sounds that become lifelong memories.',
              'El P-86S es un compañero que se convierte en sus "oídos."\nTrátelo bien y continuará grabando sonidos magníficos que se convertirán en recuerdos de toda la vida.',
            )}
          </p>
          <span style={{ fontFamily: serif, fontSize: 14, color: GOLD, letterSpacing: '0.15em', display: 'block', marginBottom: 40 }}>
            {t('空音開発 Kuon R&D', 'Kuon R&D', 'Kuon R&D')}
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <Link href="/microphone" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: '#fff', fontFamily: sans, backgroundColor: ACCENT,
              fontSize: 'clamp(0.82rem,1.1vw,0.92rem)', letterSpacing: '0.1em',
              padding: 'clamp(1rem,2vw,1.3rem) clamp(2.5rem,5vw,4rem)',
              borderRadius: 50, boxShadow: '0 8px 24px rgba(2,132,199,0.25)',
              transition: 'all 0.3s ease', fontWeight: 600,
            }}>
              {t('P-86S 製品ページへ', 'View P-86S Product Page', 'Ver Página del P-86S')}
            </Link>
            <Link href="/audio-apps" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: ACCENT, fontFamily: sans,
              backgroundColor: 'rgba(255,255,255,0.85)',
              fontSize: 'clamp(0.82rem,1.1vw,0.92rem)', letterSpacing: '0.1em',
              padding: 'clamp(1rem,2vw,1.3rem) clamp(2.5rem,5vw,4rem)',
              borderRadius: 50, border: `1px solid rgba(2,132,199,0.3)`,
              backdropFilter: 'blur(8px)', transition: 'all 0.3s ease', fontWeight: 600,
            }}>
              {t('無料オーディオアプリ', 'Free Audio Apps', 'Apps de Audio Gratis')}
            </Link>
          </div>
        </div>
      </Section>

      {/* Bottom spacer */}
      <div style={{ height: 40 }} />
    </div>
  );
}
