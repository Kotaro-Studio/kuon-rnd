'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const ACCENT = '#0284c7';
const GOLD   = '#bda678';
const WARN   = '#c62828';
const PRO    = '#1d1d1f';
const serif  = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans   = '"Helvetica Neue", Arial, sans-serif';

type L3 = Partial<Record<Lang, string>> & { en: string };

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
// Glass card
// ─────────────────────────────────────────────
const glass: CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
  borderRadius: '20px', border: '1px solid rgba(255,255,255,1)',
  boxShadow: '0 12px 40px rgba(0,0,0,0.05)',
};

// ─────────────────────────────────────────────
// Data: Adapters
// ─────────────────────────────────────────────
type AdapterItem = { name: string; badge?: string; highlight?: boolean; desc: L3 };

const ADAPTERS: AdapterItem[] = [
  {
    name: 'CLASSIC PRO / CEMPW100',
    desc: {
      ja: '最も安価に導入できる標準的なファンタム電源変換アダプター。まずは音を出してみたい、コストを抑えたいという方はこちらをお選びください。',
      en: 'The most affordable standard phantom power adapter. Choose this if you want to get started quickly at a lower cost.',
      es: 'El adaptador de alimentación fantasma estándar más asequible. Elija esto si desea comenzar rápidamente a menor costo.',
    },
  },
  {
    name: 'AKG / MPA VL', badge: 'HIGHLY RECOMMENDED', highlight: true,
    desc: {
      ja: '「マイク探しの旅を終わらせたい」なら、迷わずこちらです。回路の質が圧倒的に高く、X-86Sのポテンシャルを100%引き出し、クリアで深みのある「真実の音」を奏でます。無指向性マイクのおすすめ構成として、プロのレコーディングエンジニアにも自信を持って推薦できる組み合わせです。',
      en: 'If you want to end your search for the perfect microphone, this is the answer. Its circuit quality is outstanding — it unlocks 100% of the X-86S potential, delivering a clear, deep "true sound." A recommended omnidirectional microphone setup we confidently endorse even to professional recording engineers.',
      es: 'Si desea terminar su búsqueda del micrófono perfecto, esta es la respuesta. La calidad de su circuito es excepcional — desbloquea el 100% del potencial del X-86S para un sonido verdadero, claro y profundo.',
    },
  },
];

// ─────────────────────────────────────────────
// Data: Accessories
// ─────────────────────────────────────────────
type AccessoryItem = { name: string; desc: L3; badge?: string };

const STEREO_BARS: AccessoryItem[] = [
  {
    name: 'K&M 236',
    desc: {
      ja: 'ドイツ製マイクバーの定番。高い剛性で微細な振動を抑え、安価な製品とは「音の締まり」が全然違います。通常はこれ1本でOK。',
      en: 'The German standard stereo bar. Superior rigidity suppresses micro-vibrations — a clear difference in sound quality. One bar is all you need.',
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
      ja: 'スタジオ常設向け。鉄板ベースの重量で床からの振動をシャットアウト。プロの定番で、無指向性マイクの性能を最大限に引き出すおすすめのスタンド。',
      en: 'For permanent studio use. Heavy iron base blocks floor vibrations. A professional standard — the recommended stand for maximizing omnidirectional microphone performance.',
      es: 'Para uso permanente en estudio. Base de hierro que bloquea vibraciones del suelo. Estándar profesional.',
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
      ja: 'ユニバーサルブラケット。スタンドのポールにレコーダーやマイクバーを増設できる万能ツール。',
      en: 'Universal bracket. Mount recorders or mic bars on any stand pole. Incredibly versatile.',
      es: 'Soporte universal. Monte grabadoras o barras de micrófono en cualquier poste.',
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
// Gear card
// ─────────────────────────────────────────────
function GearCard({ item, lang }: { item: AccessoryItem; lang: Lang }) {
  return (
    <div style={{ ...glass, padding: 'clamp(22px,3vw,32px)', position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {item.badge && (
        <span style={{
          position: 'absolute', top: -12, right: 20,
          background: item.badge === "EDITOR'S PICK" ? ACCENT : GOLD,
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
export default function ManualX86S() {
  const { lang } = useLang();
  const t = (ja: string, en: string, es: string) => lang === 'ja' ? ja : lang === 'en' ? en : es;
  const t3 = (m: L3) => m[lang] ?? m.en;
  const heroReveal = useReveal();

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh' }}>

      {/* ═══ HERO ═══ */}
      <div ref={heroReveal.ref} style={{
        ...heroReveal.style, textAlign: 'center',
        padding: 'clamp(80px,12vw,140px) clamp(16px,4vw,40px) clamp(50px,8vw,80px)',
        borderBottom: '1px solid #eee',
      }}>
        <span style={{
          display: 'inline-block', background: PRO, color: '#fff',
          fontFamily: sans, fontSize: 11, fontWeight: 700, padding: '6px 18px',
          borderRadius: 4, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 22,
        }}>
          PRO EDITION
        </span>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(1.6rem,4.5vw,2.6rem)', fontWeight: 500,
          color: '#1d1d1f', margin: '0 0 24px', letterSpacing: '-0.02em', lineHeight: 1.3,
        }}>
          {t('X-86S セットアップガイド', 'X-86S Setup Guide', 'Guía de Configuración X-86S')}
        </h1>
        <p style={{
          fontFamily: serif, fontSize: 'clamp(0.85rem,1.3vw,1rem)', color: '#666',
          maxWidth: 660, margin: '0 auto', lineHeight: 1.9,
        }}>
          {t(
            'Mini-XLR端子を採用したプロフェッショナルモデル「X-86S」の導入手順です。正しい電源供給を行うことで、無指向性マイクの頂点とも言える音質を実現します。',
            'Setup instructions for the professional model "X-86S" with Mini-XLR connectors. Proper power supply unlocks sound quality that stands at the pinnacle of omnidirectional microphones.',
            'Instrucciones de configuración para el modelo profesional "X-86S" con conectores Mini-XLR. La alimentación correcta desbloquea una calidad de sonido en la cima de los micrófonos omnidireccionales.',
          )}
        </p>
      </div>

      {/* ═══ 1. PHANTOM POWER ADAPTERS ═══ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 12, color: '#1d1d1f' }}>
          {t('必須：ファンタム電源変換アダプター', 'Required: Phantom Power Adapter', 'Requerido: Adaptador de Alimentación Fantasma')}
        </h2>
        <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1.1vw,0.9rem)', color: '#888', textAlign: 'center', marginBottom: 50, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
          {t(
            'X-86Sを一般的なXLR端子（ミキサーやオーディオインターフェース）で使用するには、電圧を変換するアダプターが不可欠です。信頼できる選択肢は以下の2つのみです。',
            'To use the X-86S with standard XLR inputs (mixers or audio interfaces), a voltage-converting adapter is essential. Only two reliable options exist.',
            'Para usar el X-86S con entradas XLR estándar, es esencial un adaptador de conversión de voltaje. Solo existen dos opciones confiables.',
          )}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
          {ADAPTERS.map(a => (
            <div key={a.name} style={{
              ...glass, padding: 'clamp(28px,3vw,40px)', position: 'relative',
              display: 'flex', flexDirection: 'column', gap: 14,
              border: a.highlight ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,1)',
              boxShadow: a.highlight ? `0 12px 40px rgba(189,166,120,0.15)` : '0 12px 40px rgba(0,0,0,0.05)',
            }}>
              {a.badge && (
                <span style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: GOLD, color: '#fff', fontSize: 10, fontWeight: 700, fontFamily: sans,
                  padding: '5px 16px', borderRadius: 20, letterSpacing: '0.08em', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(189,166,120,0.25)',
                }}>{a.badge}</span>
              )}
              <span style={{ fontFamily: sans, fontSize: 'clamp(0.9rem,1.2vw,1rem)', fontWeight: 700, color: '#1d1d1f' }}>
                {a.name}
              </span>
              <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1vw,0.9rem)', color: '#555', lineHeight: 1.85, margin: 0, flex: 1 }}>
                {a.desc[lang]}
              </p>
            </div>
          ))}
        </div>

        {/* Stereo pair quantity notice */}
        <div style={{
          background: '#e3f2fd', borderLeft: `5px solid ${ACCENT}`,
          padding: 'clamp(20px,3vw,30px)', borderRadius: 8,
        }}>
          <h3 style={{ fontFamily: sans, fontSize: 'clamp(0.85rem,1.1vw,0.95rem)', fontWeight: 700, color: '#0d47a1', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>&#x1f4e2;</span>
            {t('購入数の注意点', 'Quantity Notice', 'Aviso de Cantidad')}
          </h3>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1vw,0.9rem)', color: '#0d47a1', lineHeight: 1.85, margin: 0 }}>
            {t(
              '当スタジオのX-86Sは、「個数1」のご注文でステレオペア（マイク2本入り）でお届けします。他社製品のように2本買う必要はありません。そのため、変換アダプター（CEMPW100 または MPA VL）は「2個」必要になります。',
              'One X-86S order includes a stereo pair (2 microphones). You do NOT need to buy two. However, you will need TWO phantom power adapters (CEMPW100 or MPA VL).',
              'Un pedido de X-86S incluye un par estéreo (2 micrófonos). NO necesita comprar dos. Sin embargo, necesitará DOS adaptadores de alimentación fantasma.',
            )}
          </p>
        </div>
      </Section>

      {/* ═══ 2. CRITICAL WARNING ═══ */}
      <Section>
        <div style={{
          border: `2px dashed ${WARN}`, background: '#fff5f5', borderRadius: 20,
          padding: 'clamp(30px,4vw,50px)', textAlign: 'center',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>&#x1f6ab;</span>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.1rem,2vw,1.4rem)', fontWeight: 700, color: WARN, marginBottom: 20 }}>
            {t(
              '【警告】形状だけの変換プラグは絶対に使用しないでください',
              'WARNING: Never Use Shape-Only Adapter Plugs',
              'ADVERTENCIA: Nunca Use Adaptadores Solo de Forma',
            )}
          </h2>
          <div style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.92rem)', color: '#444', lineHeight: 1.9, maxWidth: 640, margin: '0 auto', textAlign: 'left' }}>
            <p style={{ marginBottom: 14 }}>
              {t(
                'Amazon等で「ミニXLRからXLRに形状だけ変換する」数百円のプラグが販売されていますが、これらは絶対に使用しないでください。',
                'Inexpensive plugs that "only convert the shape from Mini-XLR to XLR" are sold on Amazon and similar sites. Never use these.',
                'Se venden enchufes baratos que "solo convierten la forma de Mini-XLR a XLR" en Amazon y sitios similares. Nunca los use.',
              )}
            </p>
            <p style={{ marginBottom: 14 }}>
              {t(
                '電圧変換回路が入っていない安価なプラグで形状だけ変換接続し、48Vファンタム電源をかけると、一瞬でマイクが焼損（故障）します。',
                'If you connect through a cheap plug without voltage conversion circuitry and apply 48V phantom power, the microphone will be instantly destroyed.',
                'Si conecta a través de un enchufe barato sin circuito de conversión de voltaje y aplica alimentación fantasma de 48V, el micrófono se destruirá instantáneamente.',
              )}
            </p>
            <p style={{ margin: 0, fontWeight: 700, color: WARN }}>
              {t(
                '必ず、電圧変換機能を持った正規のアダプター（CLASSIC PRO CEMPW100 または AKG MPA VL）をご使用ください。',
                'Always use a legitimate adapter with voltage conversion (CLASSIC PRO CEMPW100 or AKG MPA VL).',
                'Siempre use un adaptador legítimo con conversión de voltaje (CLASSIC PRO CEMPW100 o AKG MPA VL).',
              )}
            </p>
          </div>
        </div>
      </Section>

      {/* ═══ 3. ACCESSORIES ═══ */}
      <Section bg="#fff">
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 12, color: '#1d1d1f' }}>
          {t('X-86Sの運用を支える周辺機材', 'Supporting Gear for X-86S', 'Equipo de Soporte para X-86S')}
        </h2>
        <p style={{ fontFamily: serif, fontSize: 'clamp(0.8rem,1.1vw,0.9rem)', color: '#888', textAlign: 'center', marginBottom: 50, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
          {t(
            'AKGのアダプターで引き出した極上の音を、物理的な振動ノイズで汚さないために。プロ仕様のドイツ製 K&M アクセサリーをご紹介します。',
            'Protect the superb sound unlocked by the AKG adapter from physical vibration noise. We recommend professional German-made K&M accessories.',
            'Proteja el sonido excelente del adaptador AKG del ruido de vibración física. Recomendamos accesorios profesionales K&M fabricados en Alemania.',
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
        <div style={{ background: '#fffde7', border: '1px solid #fff9c4', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>&#x1f4a1;</span>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.78rem,1vw,0.86rem)', color: '#666', lineHeight: 1.7, margin: 0 }}>
            {t(
              'X-86Sのような高感度な無指向性マイクは、スタンドの質が露骨に音に出ます。ブーム（腕付き）ではなく、重心の安定する「ストレートタイプ」を強く推奨します。',
              'High-sensitivity omnidirectional microphones like the X-86S reveal stand quality in the sound. We strongly recommend straight stands over boom arms for center-of-gravity stability.',
              'Los micrófonos omnidireccionales de alta sensibilidad como el X-86S revelan la calidad del soporte. Recomendamos soportes rectos sobre brazos boom.',
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
          {TOOLS.map(tl => <GearCard key={tl.name} item={tl} lang={lang} />)}
        </div>
      </Section>

      {/* ═══ 4. ADVANCED TECHNIQUES ═══ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 50, color: '#1d1d1f' }}>
          {t('応用セッティング', 'Advanced Techniques', 'Técnicas Avanzadas')}
        </h2>

        {/* AB Distance */}
        <div style={{ marginBottom: 60 }}>
          <h3 style={{ fontFamily: serif, fontSize: 'clamp(1rem,1.5vw,1.15rem)', fontWeight: 700, color: '#1d1d1f', marginBottom: 16, borderLeft: `4px solid ${GOLD}`, paddingLeft: 16 }}>
            {t(
              '無指向性AB方式の「距離」の考え方',
              'Understanding Omnidirectional AB "Distance"',
              'Comprendiendo la "Distancia" AB Omnidireccional',
            )}
          </h3>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.92rem)', color: '#444', lineHeight: 1.9, marginBottom: 16 }}>
            {t(
              '無指向性マイクのおすすめのステレオ録音セッティングとして、AB方式では一般的に 30cm〜50cm が基本です。30cm以下だと音の到達時間差が少なすぎ十分なステレオ感が得られず、距離を縮めすぎるとお互いの周波数領域が干渉し位相の悪い音になります。まずは 30cm以上離すことを基本ルールとしてください。',
              'For the recommended omnidirectional microphone stereo recording setup, the AB method standard is 30–50cm. Below 30cm, the time-of-arrival difference is too small for adequate stereo effect, and frequencies interfere causing phase issues. Start with at least 30cm as your baseline.',
              'Para la configuración estéreo recomendada con micrófonos omnidireccionales, el método AB estándar es 30–50cm. Por debajo de 30cm, la diferencia de tiempo de llegada es insuficiente. Comience con al menos 30cm.',
            )}
          </p>

          {/* AB diagram */}
          <div style={{ ...glass, padding: 'clamp(24px,3vw,36px)', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', width: 240, height: 80, margin: '0 auto 20px', borderTop: `2px dashed ${GOLD}` }}>
              <span style={{ position: 'absolute', left: -8, top: -18, fontFamily: sans, fontSize: 13, fontWeight: 700, color: ACCENT }}>Mic L</span>
              <span style={{ position: 'absolute', right: -8, top: -18, fontFamily: sans, fontSize: 13, fontWeight: 700, color: ACCENT }}>Mic R</span>
              <span style={{ position: 'absolute', width: '100%', top: -32, textAlign: 'center', fontFamily: sans, fontSize: 14, fontWeight: 700, color: GOLD }}>30cm — 50cm</span>
              <span style={{ position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: ACCENT }} />
              <span style={{ position: 'absolute', right: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: ACCENT }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'left' }}>
              {[
                { label: { ja: '狭め（20cm〜）', en: 'Narrow (20cm+)', es: 'Estrecho (20cm+)' }, desc: { ja: '中央に密度が集まり、親密な音に。', en: 'Center-focused, intimate sound.', es: 'Sonido centrado e íntimo.' } },
                { label: { ja: '標準（30cm〜50cm）', en: 'Standard (30–50cm)', es: 'Estándar (30–50cm)' }, desc: { ja: 'バランスの取れた自然なステレオ感。推奨。', en: 'Balanced, natural stereo. Recommended.', es: 'Estéreo equilibrado. Recomendado.' } },
                { label: { ja: '広め（50cm〜）', en: 'Wide (50cm+)', es: 'Amplio (50cm+)' }, desc: { ja: '壮大なスケール感。オーケストラやフィールド録音に。', en: 'Grand scale. For orchestras and field recording.', es: 'Gran escala. Para orquestas y grabación de campo.' } },
              ].map(d => (
                <div key={d.label.en} style={{ background: '#f8f8fa', borderRadius: 12, padding: 16, border: '1px solid #eee' }}>
                  <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: ACCENT, display: 'block', marginBottom: 4 }}>{t3(d.label)}</span>
                  <span style={{ fontFamily: serif, fontSize: 13, color: '#666', lineHeight: 1.6 }}>{t3(d.desc)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro's Perspective */}
          <div style={{ ...glass, padding: 'clamp(20px,3vw,30px)', borderLeft: `3px solid ${GOLD}` }}>
            <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              {"PRO'S PERSPECTIVE"}
            </span>
            <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.9rem)', color: '#444', lineHeight: 1.85, margin: 0 }}>
              {t(
                '「正解」はありません。40cmが最適という人もいれば、自然界の収録では1m以上離すこともあります。リバーブの強い場所（西洋式の教会等）では幅を大きめに、天井の高い場所では60cmが最適だったこともあります。特にX-86Sを選択される方は、指向性マイクとのマルチ録音も視野に入れておられるでしょう。混ぜる場合の最適な幅はステレオペア録音時と大きく変わることもありますので、何度もテストしてご自身の音を見つけてみてください。決まりがないからこそ面白く、エンジニアの感性が試される部分です。',
                'There is no "correct answer." Some prefer 40cm; nature recordists may use over 1 meter. In reverberant spaces (Western churches), wider spacing works best; in high-ceiling venues, 60cm proved optimal. X-86S users likely plan multi-mic setups with directional microphones — the ideal spacing can change dramatically when mixing. Test repeatedly to find your own sound. The lack of rules is what makes it fascinating.',
                'No hay una "respuesta correcta." Algunos prefieren 40cm; los grabadores de naturaleza pueden usar más de 1 metro. Los usuarios del X-86S probablemente planean configuraciones con múltiples micrófonos — el espaciado ideal puede cambiar drásticamente al mezclar. Experimente para encontrar su propio sonido.',
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
              '30cm以上の間隔さえ守れば、机や床にテープで直接貼り付けても使用可能です。「バウンダリーマイク」手法で床や壁からの反射音を排除しクリアな音を録ることができます。舞台演劇や会議の録音によく使われますが、先端を少し浮かせる工夫が必要です。',
              'As long as you maintain at least 30cm spacing, the mics can be taped to a desk or floor. This "boundary microphone" technique eliminates surface reflections for cleaner sound. Common in theater and conference recording — just ensure the capsule tip is slightly elevated.',
              'Siempre que mantenga al menos 30cm de separación, los micrófonos pueden pegarse a una mesa o piso. Esta técnica elimina reflexiones de superficie para un sonido más limpio.',
            )}
          </p>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.92rem)', color: '#444', lineHeight: 1.9 }}>
            {t(
              'デスクで最高の音質を目指すなら、鉄製の重量級スタンド K&M 232B の使用を強く推奨します。振動を逃さず、音の芯が太くなります。ポッドキャスト収録にも最適です。',
              'For the best desk recording quality, we strongly recommend the heavy iron K&M 232B stand. It absorbs vibrations for a richer, more centered sound. Also ideal for podcast recording.',
              'Para la mejor calidad en escritorio, recomendamos el pesado soporte K&M 232B. También ideal para podcasts.',
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
              'P-86S同様、メガネのテンプル（つる）の両端にX-86Sを装着する応用も可能です。左右の間隔は頭の幅（約15cm〜20cm）に限定されますが、頭のアーチでステレオ感を稼ぎ、耳に近い位置からバイノーラルマイクのような音響効果が得られます。旅の記録やフィールドワーク、ドキュメンタリー取材など軽装で臨みたいシーンに最適な超軽装備スタイルです。',
              'Like the P-86S, the X-86S can be attached to glasses temples. While spacing is limited to head width (15–20cm), the head\'s arc provides stereo effect and ear-level positioning creates binaural-like acoustics. Perfect for travel, fieldwork, and documentary journalism.',
              'Como el P-86S, el X-86S puede fijarse en las patillas de gafas. Ideal para viajes, trabajo de campo y documentales.',
            )}
          </p>
        </div>
      </Section>

      {/* ═══ 5. PHASE INFO (PRO SECTION) ═══ */}
      <Section bg="#fff">
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 50, color: '#1d1d1f' }}>
          {t('プロユーザー向け技術情報', 'Technical Information for Pro Users', 'Información Técnica para Profesionales')}
        </h2>

        <div style={{
          background: '#eef2f5', borderLeft: '5px solid #607d8b',
          padding: 'clamp(24px,3vw,40px)', borderRadius: 8,
        }}>
          <h3 style={{ fontFamily: sans, fontSize: 'clamp(0.9rem,1.2vw,1rem)', fontWeight: 700, color: '#37474f', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>&#x1f504;</span>
            {t('X-86Sの位相（Phase）特性', 'X-86S Phase Characteristics', 'Características de Fase del X-86S')}
          </h3>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.92rem)', color: '#455a64', lineHeight: 1.9, marginBottom: 20 }}>
            {t(
              'X-86Sは、Countryman B3などの一部のプロ用ラベリアマイクと同様に、出力が「逆相（Reverse Phase）」になっています。X-86S同士でのステレオペア録音では全く問題ありませんが、他の「正相」のマイクと混ぜて使用する場合（マルチマイク収録時）は、位相干渉による低域の減衰などが起こる可能性があります。',
              'Like some professional lavalier microphones such as the Countryman B3, the X-86S output is in "reverse phase." This causes no issues when using X-86S units as a stereo pair, but when mixing with "normal phase" microphones in multi-mic setups, phase interference may cause low-frequency attenuation.',
              'Como algunos micrófonos lavalier profesionales como el Countryman B3, la salida del X-86S está en "fase inversa." Esto no causa problemas entre unidades X-86S, pero al mezclar con micrófonos de "fase normal," puede haber atenuación de bajas frecuencias.',
            )}
          </p>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1vw,0.92rem)', color: '#455a64', lineHeight: 1.9, marginBottom: 24 }}>
            {t(
              'ご安心ください。空音開発のマイク購入者限定アプリ「KUON NORMALIZE」を使えば、ワンクリックで逆相を正相に修正できます。ノーマライズ処理と同時に位相反転も行えるため、マルチマイク運用でも面倒な手順は一切不要です。',
              'Don\'t worry — our microphone owners\' exclusive app "KUON NORMALIZE" lets you fix reverse phase to normal phase with a single click. It handles phase inversion alongside normalization, so there are no extra steps even in multi-mic workflows.',
              'No se preocupe — nuestra app exclusiva para propietarios "KUON NORMALIZE" permite corregir la fase inversa con un solo clic. Maneja la inversión de fase junto con la normalización, sin pasos adicionales.',
            )}
          </p>

          {/* KUON NORMALIZE CTA */}
          <div style={{
            background: '#fff', border: `1px solid ${ACCENT}33`, borderRadius: 12,
            padding: 'clamp(16px,2vw,24px)', display: 'flex', alignItems: 'center', gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                {t('購入者限定 無料アプリ', 'Owners-Only Free App', 'App Gratuita Exclusiva')}
              </span>
              <span style={{ fontFamily: serif, fontSize: 'clamp(0.9rem,1.2vw,1rem)', fontWeight: 700, color: '#1d1d1f', display: 'block', marginBottom: 6 }}>
                KUON NORMALIZE
              </span>
              <p style={{ fontFamily: serif, fontSize: 'clamp(0.78rem,0.9vw,0.85rem)', color: '#666', lineHeight: 1.7, margin: 0 }}>
                {t(
                  'ノーマライズ・位相反転・ラウドネス調整をブラウザ上でワンクリック。DAW不要・インストール不要。',
                  'One-click normalization, phase inversion & loudness adjustment in your browser. No DAW or install needed.',
                  'Normalización, inversión de fase y ajuste de volumen con un clic en el navegador. Sin DAW ni instalación.',
                )}
              </p>
            </div>
            <Link href="/normalize-lp" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: '#fff', fontFamily: sans, backgroundColor: ACCENT,
              fontSize: 13, fontWeight: 700, padding: '12px 28px', borderRadius: 50,
              boxShadow: '0 4px 16px rgba(2,132,199,0.25)', transition: 'all 0.3s ease',
              whiteSpace: 'nowrap', letterSpacing: '0.06em',
            }}>
              {t('KUON NORMALIZE を見る', 'View KUON NORMALIZE', 'Ver KUON NORMALIZE')}
            </Link>
          </div>

          <p style={{ fontFamily: serif, fontSize: 'clamp(0.78rem,0.9vw,0.85rem)', color: '#90a4ae', lineHeight: 1.7, marginTop: 16, margin: '16px 0 0' }}>
            {t(
              '※ もちろん、お手持ちのDAW（Cubase、Logic Pro、Pro Tools 等）や Audacity でも位相反転は可能です。',
              '* Of course, you can also invert phase in your own DAW (Cubase, Logic Pro, Pro Tools, etc.) or Audacity.',
              '* También puede invertir la fase en su DAW (Cubase, Logic Pro, Pro Tools, etc.) o Audacity.',
            )}
          </p>
        </div>
      </Section>

      {/* ═══ 6. OUTDOOR RECORDING ═══ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, textAlign: 'center', marginBottom: 50, color: '#1d1d1f' }}>
          {t('屋外録音の必需品', 'Outdoor Recording Essentials', 'Esenciales para Grabación Exterior')}
        </h2>
        <div style={{ ...glass, padding: 'clamp(28px,4vw,45px)', textAlign: 'center' }}>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.82rem,1.1vw,0.92rem)', color: '#555', lineHeight: 1.9, maxWidth: 640, margin: '0 auto 24px' }}>
            {t(
              '屋外では微風であってもマイクにとっては「暴風」のようなノイズになります。外で録音する際は、必ずウインドスクリーン（風防）を装着してください。X-86Sには「1.5cm のピンマイク用ヘアリーウインドマフ」が適合します。これを装着するとかなりの暴風でも録音が成功していることが多いです。',
              'Even a light breeze sounds like a storm to a microphone outdoors. Always attach a windscreen. The compatible size for the X-86S is a "1.5cm hairy windscreen for lavalier mics." With this, recordings often succeed even in strong winds.',
              'Incluso una brisa ligera suena como una tormenta al aire libre. Siempre use un paravientos. El tamaño compatible es "1.5cm para lavalier."',
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

      {/* ═══ 7. HANDLING PRECAUTIONS ═══ */}
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
            'X-86Sは最高の音質を追求するために、あえて頑丈さよりも音響性能を最優先に設計されています。市販の「頑丈だが音質を犠牲にしたマイク」とは根本的に設計思想が異なります。楽器と同じく、丁寧な扱いが最高の音を引き出します。',
            'The X-86S is deliberately designed to prioritize acoustic performance over ruggedness, in pursuit of the ultimate sound quality. This fundamentally differs from commercial microphones that sacrifice sound for durability. Like a fine instrument, careful handling unlocks the best sound.',
            'El X-86S está diseñado para priorizar el rendimiento acústico sobre la robustez, en busca de la máxima calidad de sonido. Como un instrumento fino, el manejo cuidadoso produce el mejor sonido.',
          )}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{ border: `2px dashed ${WARN}33`, background: '#fff5f5', borderRadius: 20, padding: 'clamp(28px,3vw,36px)', textAlign: 'center', position: 'relative' }}>
            <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: WARN, color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: sans, padding: '4px 18px', borderRadius: 20, boxShadow: '0 4px 12px rgba(198,40,40,0.2)' }}>NG</span>
            <span style={{ fontSize: 42, display: 'block', margin: '20px 0 16px' }}>&#x1f6ab;</span>
            <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: WARN, display: 'block', marginBottom: 12 }}>
              {t('先端をテープで塞がない', 'Do Not Cover the Tip with Tape', 'No Cubra la Punta con Cinta')}
            </span>
            <p style={{ fontFamily: serif, fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0, textAlign: 'left' }}>
              {t(
                '最高の音質を実現するため、先端の金属部分（集音口）は極限まで薄く精密に加工されています。ここにテープがかかると高音域が録音されなくなったり、音が極端に小さくなります。テープで固定する際は、必ず先端から少し離した場所に貼ってください。',
                'To achieve the ultimate sound quality, the metal tip (sound inlet) is precisely machined to be extremely thin. Covering it with tape will block high frequencies or drastically reduce volume. Always tape away from the tip.',
                'Para lograr la máxima calidad, la punta metálica está mecanizada con precisión extrema. Cubrirla bloqueará altas frecuencias. Siempre coloque la cinta lejos de la punta.',
              )}
            </p>
          </div>

          <div style={{ border: `2px dashed ${WARN}33`, background: '#fff5f5', borderRadius: 20, padding: 'clamp(28px,3vw,36px)', textAlign: 'center', position: 'relative' }}>
            <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: WARN, color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: sans, padding: '4px 18px', borderRadius: 20, boxShadow: '0 4px 12px rgba(198,40,40,0.2)' }}>NG</span>
            <span style={{ fontSize: 42, display: 'block', margin: '20px 0 16px' }}>&#x1f447;</span>
            <span style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: WARN, display: 'block', marginBottom: 12 }}>
              {t('先端を強く押さない', 'Do Not Press the Tip Hard', 'No Presione la Punta con Fuerza')}
            </span>
            <p style={{ fontFamily: serif, fontSize: 13, color: '#555', lineHeight: 1.8, margin: 0, textAlign: 'left' }}>
              {t(
                '音質を最優先に設計しているため、先端部分には非常に薄く繊細な振動板が使われています。指で強く押したり、落下による衝撃を与えると振動板が変形し、本来の性能を発揮できなくなります。楽器と同じく丁寧に扱ってください。',
                'Because sound quality is the absolute priority, the tip contains an extremely thin and delicate diaphragm. Pressing hard or dropping it can deform the diaphragm. Handle with the same care as a musical instrument.',
                'La punta contiene un diafragma extremadamente delgado y delicado. Presionar fuerte o dejarlo caer puede deformarlo. Trátelo con el mismo cuidado que un instrumento musical.',
              )}
            </p>
          </div>
        </div>
      </Section>

      {/* ═══ 8. FINAL MESSAGE + CTA ═══ */}
      <Section>
        <div style={{ textAlign: 'center', borderTop: '1px solid #eee', paddingTop: 60 }}>
          <p style={{ fontFamily: serif, fontSize: 'clamp(0.95rem,1.5vw,1.1rem)', color: '#1d1d1f', lineHeight: 1.9, marginBottom: 30 }}>
            {t(
              'X-86Sは無指向性マイクの中でもかなりの実力を持っています。\nステレオペア録音だけでも素晴らしい性能を発揮し、\nライブハウスやスタジオにも導入実績があるプロ仕様の仕事に耐えるマイクロフォンです。',
              'The X-86S is a powerhouse among omnidirectional microphones.\nIt delivers outstanding performance even in stereo pair recording alone,\nwith proven deployments in live venues and studios — a microphone built for professional work.',
              'El X-86S es una potencia entre los micrófonos omnidireccionales.\nOfrece un rendimiento excepcional incluso en grabación estéreo,\ncon implementaciones probadas en lugares en vivo y estudios.',
            )}
          </p>
          <span style={{ fontFamily: serif, fontSize: 14, color: GOLD, letterSpacing: '0.15em', display: 'block', marginBottom: 40 }}>
            {t('空音開発 Kuon R&D', 'Kuon R&D', 'Kuon R&D')}
          </span>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            <Link href="/microphone" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: '#fff', fontFamily: sans, backgroundColor: PRO,
              fontSize: 'clamp(0.82rem,1.1vw,0.92rem)', letterSpacing: '0.1em',
              padding: 'clamp(1rem,2vw,1.3rem) clamp(2.5rem,5vw,4rem)',
              borderRadius: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease', fontWeight: 600,
            }}>
              {t('製品ページへ', 'View Product Page', 'Ver Página del Producto')}
            </Link>
            <Link href="/manual/p-86s" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              textDecoration: 'none', color: ACCENT, fontFamily: sans,
              backgroundColor: 'rgba(255,255,255,0.85)',
              fontSize: 'clamp(0.82rem,1.1vw,0.92rem)', letterSpacing: '0.1em',
              padding: 'clamp(1rem,2vw,1.3rem) clamp(2.5rem,5vw,4rem)',
              borderRadius: 50, border: `1px solid rgba(2,132,199,0.3)`,
              backdropFilter: 'blur(8px)', transition: 'all 0.3s ease', fontWeight: 600,
            }}>
              {t('P-86S ガイドを見る', 'View P-86S Guide', 'Ver Guía P-86S')}
            </Link>
          </div>
        </div>
      </Section>

      <div style={{ height: 40 }} />
    </div>
  );
}
