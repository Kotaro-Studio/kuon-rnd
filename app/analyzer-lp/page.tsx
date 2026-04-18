'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L3 = Record<Lang, string>;

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#4F46E5';

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

function Section({ children, style, id }: { children: React.ReactNode; style?: React.CSSProperties; id?: string }) {
  const ref = useReveal();
  return <section ref={ref} id={id} className="reveal" style={{ marginBottom: 'clamp(48px, 10vw, 80px)', ...style }}>{children}</section>;
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.8)',
  borderRadius: 16,
  padding: 'clamp(20px, 4vw, 32px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
};

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  heroTitle: {
    ja: 'あなたのミックス、\nプロと何が違う？',
    en: 'What makes your mix\ndifferent from the pros?',
    es: '¿Qué diferencia tu mezcla\nde la de los profesionales?',
  } as L3,
  heroSub: {
    ja: 'LUFSラウドネスメーター × スペクトラムアナライザー。\nリファレンス楽曲を重ねて比較。答えが見える。',
    en: 'LUFS loudness meter × spectrum analyzer.\nOverlay a reference track. See the difference.',
    es: 'Medidor LUFS × analizador de espectro.\nSuperpón una referencia. Ve la diferencia.',
  } as L3,
  heroCta: {
    ja: '今すぐ解析する（無料）',
    en: 'Analyze Now — Free',
    es: 'Analizar Ahora — Gratis',
  } as L3,
  heroFree: {
    ja: '完全無料・インストール不要・サーバー送信なし',
    en: '100% Free — No Install — No Upload',
    es: '100% Gratis — Sin Instalación — Sin Subida',
  } as L3,

  // Problem
  problemTitle: {
    ja: 'こんな悩み、ありませんか？',
    en: 'Sound familiar?',
    es: '¿Te suena familiar?',
  } as L3,
  problem1: {
    ja: '自分のミックスの周波数バランスが正しいのか、耳だけでは判断できない',
    en: 'You can\'t tell if your mix\'s frequency balance is right — by ear alone',
    es: 'No puedes saber si el balance de frecuencias es correcto — solo de oído',
  } as L3,
  problem2: {
    ja: 'リファレンス曲と比較したいけど、プラグインのアナライザーは高すぎる',
    en: 'You want to compare with a reference, but analyzer plugins cost too much',
    es: 'Quieres comparar con una referencia, pero los analizadores cuestan demasiado',
  } as L3,
  problem3: {
    ja: 'LUFSメーターを使いたいけど、DAWを開くのが面倒なときがある',
    en: 'You need a LUFS meter but don\'t want to open your DAW every time',
    es: 'Necesitas un medidor LUFS pero no quieres abrir tu DAW cada vez',
  } as L3,
  problem4: {
    ja: 'マイクやインターフェイスの入力信号をリアルタイムで確認したい',
    en: 'You want to check mic or interface input signal in real-time',
    es: 'Quieres ver la señal de entrada del micrófono en tiempo real',
  } as L3,

  // Solution
  solutionTitle: {
    ja: 'KUON ANALYZER が\nすべてを一画面で可視化します。',
    en: 'KUON ANALYZER visualizes\neverything in one screen.',
    es: 'KUON ANALYZER visualiza\ntodo en una pantalla.',
  } as L3,

  // Features
  featTitle: {
    ja: 'ミックスを「見る」ための6つの機能',
    en: '6 Features to "See" Your Mix',
    es: '6 Funciones para "Ver" tu Mezcla',
  } as L3,
  feat0t: { ja: 'リファレンス比較', en: 'Reference Comparison', es: 'Comparación de Referencia' } as L3,
  feat0d: {
    ja: 'プロの楽曲をリファレンスとして読み込み、あなたのミックスの上にスペクトラムを重ねて表示。どの帯域が足りないか、どこが出すぎているか、一目で分かります。$199のプラグインと同じことが、無料で。',
    en: 'Load a professional track as reference and overlay its spectrum on yours. Instantly see which frequencies are lacking or excessive. What $199 plugins do — free.',
    es: 'Carga una pista profesional como referencia y superpón su espectro sobre el tuyo. Ve al instante qué frecuencias faltan o sobran. Lo que hacen plugins de $199 — gratis.',
  } as L3,
  feat1t: { ja: 'リアルタイム スペクトラム', en: 'Real-time Spectrum', es: 'Espectro en Tiempo Real' } as L3,
  feat1d: {
    ja: '8192点FFTによる高精度リアルタイム周波数解析。20Hzから20kHzまで対数スケールで表示。ピークホールド機能搭載。',
    en: 'High-resolution real-time frequency analysis with 8192-point FFT. 20Hz to 20kHz on logarithmic scale. Peak hold included.',
    es: 'Análisis de frecuencia en tiempo real con FFT de 8192 puntos. 20Hz a 20kHz en escala logarítmica. Con peak hold.',
  } as L3,
  feat2t: { ja: 'LUFS ラウドネスメーター', en: 'LUFS Loudness Meter', es: 'Medidor LUFS' } as L3,
  feat2d: {
    ja: 'EBU R128 準拠の K-weighting フィルタによるリアルタイム Momentary / Short-term LUFS 計測。配信基準を常に意識しながらミックスできます。',
    en: 'Real-time Momentary / Short-term LUFS with EBU R128 K-weighting filters. Mix with streaming standards always in view.',
    es: 'LUFS Momentáneo / Corto plazo en tiempo real con filtros K-weighting EBU R128. Mezcla con los estándares de streaming siempre a la vista.',
  } as L3,
  feat3t: { ja: '帯域バランス可視化', en: 'Band Balance View', es: 'Vista de Balance de Bandas' } as L3,
  feat3d: {
    ja: 'Low / Mid / High の 3 バンドでエネルギー分布を可視化。ミックス全体の周波数バランスを直感的に把握。',
    en: 'Visualize energy distribution across Low / Mid / High bands. Intuitively grasp your overall frequency balance.',
    es: 'Visualiza la distribución de energía en bandas Low / Mid / High. Comprende intuitivamente tu balance de frecuencias.',
  } as L3,
  feat4t: { ja: 'マイク入力対応', en: 'Mic Input Support', es: 'Entrada de Micrófono' } as L3,
  feat4d: {
    ja: 'オーディオインターフェイスの入力信号をリアルタイムにスペクトラム表示。マイクテスト、部屋の音響測定、ライブモニタリングに。',
    en: 'Real-time spectrum display of your audio interface input. For mic testing, room acoustics measurement, and live monitoring.',
    es: 'Espectro en tiempo real de la entrada de tu interfaz de audio. Para pruebas de micrófono, medición acústica y monitoreo en vivo.',
  } as L3,
  feat5t: { ja: 'MASTER CHECK 連携', en: 'MASTER CHECK Integration', es: 'Integración con MASTER CHECK' } as L3,
  feat5d: {
    ja: 'スペクトラムで全体を確認したら、ワンクリックで KUON MASTER CHECK へ。プラットフォーム判定・自動ラウドネス調整・WAVダウンロードまで一気通貫。',
    en: 'After checking the spectrum, one click takes you to KUON MASTER CHECK. Platform verdict, auto loudness adjust, and WAV download — all in one flow.',
    es: 'Después de ver el espectro, un clic te lleva a KUON MASTER CHECK. Veredicto por plataforma, ajuste automático y descarga WAV — todo en un flujo.',
  } as L3,

  // How to use
  howTitle: {
    ja: '使い方 — 3ステップ',
    en: 'How to Use — 3 Steps',
    es: 'Cómo Usar — 3 Pasos',
  } as L3,
  how1t: { ja: 'ファイルをドロップ', en: 'Drop Your File', es: 'Suelta tu Archivo' } as L3,
  how1d: {
    ja: 'ミックス済みの音声ファイルをドラッグ＆ドロップ。またはマイク入力モードでリアルタイム解析を開始。',
    en: 'Drag & drop your mixed audio file. Or start real-time analysis with mic input mode.',
    es: 'Arrastra y suelta tu archivo de audio. O inicia el análisis en tiempo real con el micrófono.',
  } as L3,
  how2t: { ja: 'リファレンスを重ねる', en: 'Overlay Reference', es: 'Superpón Referencia' } as L3,
  how2d: {
    ja: '「+ リファレンス追加」でプロの楽曲を読み込み。スペクトラムが重なって表示され、周波数バランスの差が一目瞭然。',
    en: 'Click "+ Add Reference" to load a pro track. Spectrums overlay, making frequency balance differences obvious.',
    es: 'Haz clic en "+ Añadir Referencia" para cargar una pista profesional. Los espectros se superponen.',
  } as L3,
  how3t: { ja: '分析 → 修正', en: 'Analyze → Fix', es: 'Analiza → Corrige' } as L3,
  how3d: {
    ja: '問題が見つかったら MASTER CHECK でプラットフォーム別に自動調整。スペクトラムで確認 → ラウドネスを最適化 → WAVダウンロード。',
    en: 'Found issues? Use MASTER CHECK for per-platform auto-adjustment. Check spectrum → optimize loudness → download WAV.',
    es: '¿Encontraste problemas? Usa MASTER CHECK para ajuste automático por plataforma. Ver espectro → optimizar → descargar WAV.',
  } as L3,

  // Comparison
  compTitle: {
    ja: '他のツールとの比較',
    en: 'Compared to Other Tools',
    es: 'Comparado con Otras Herramientas',
  } as L3,

  // Who
  whoTitle: {
    ja: 'こんな方に最適',
    en: 'Who Is It For?',
    es: '¿Para Quién Es?',
  } as L3,
  who1t: { ja: 'DTM・宅録ミキサー', en: 'Home Studio Mixers', es: 'Mezcladores de Home Studio' } as L3,
  who1d: {
    ja: 'リファレンス楽曲と自分のミックスを並べて比較したい方。プロの周波数バランスを「見て」学べます。',
    en: 'Want to compare your mix with reference tracks side by side? "See" and learn from professional frequency balance.',
    es: '¿Quieres comparar tu mezcla con pistas de referencia? "Ve" y aprende del balance de frecuencias profesional.',
  } as L3,
  who2t: { ja: 'マスタリングエンジニア', en: 'Mastering Engineers', es: 'Ingenieros de Masterización' } as L3,
  who2d: {
    ja: '納品前のクイックチェック。LUFS + スペクトラムを一画面で確認。問題があればそのまま MASTER CHECK で修正。',
    en: 'Quick pre-delivery check. LUFS + spectrum in one screen. Issues? Fix them right in MASTER CHECK.',
    es: 'Verificación rápida pre-entrega. LUFS + espectro en una pantalla. ¿Problemas? Corrígelos en MASTER CHECK.',
  } as L3,
  who3t: { ja: 'ライブ・PA エンジニア', en: 'Live / PA Engineers', es: 'Ingenieros de Sonido en Vivo' } as L3,
  who3d: {
    ja: 'マイク入力でリアルタイムスペクトラム表示。部屋の音響やスピーカーの周波数特性を即座に可視化。',
    en: 'Real-time spectrum from mic input. Instantly visualize room acoustics and speaker frequency response.',
    es: 'Espectro en tiempo real del micrófono. Visualiza acústica de la sala y respuesta del altavoz.',
  } as L3,
  who4t: { ja: '録音愛好家・P-86S ユーザー', en: 'Recording Enthusiasts', es: 'Entusiastas de la Grabación' } as L3,
  who4d: {
    ja: '自分の録音の周波数特性を確認。プロの録音と比較して、マイクのポジションやEQの方向性を学べます。',
    en: 'Check your recording\'s frequency profile. Compare with pro recordings to learn about mic placement and EQ.',
    es: 'Verifica el perfil de frecuencia de tu grabación. Compara con grabaciones profesionales.',
  } as L3,

  // Value
  valueTitle: {
    ja: 'ラウドネスメーターを探しに来たあなたへ',
    en: 'You came looking for a loudness meter.',
    es: 'Viniste buscando un medidor de sonoridad.',
  } as L3,
  valueBody: {
    ja: 'LUFSメーターを無料で使いたい — そう思って検索した方も多いでしょう。\n\nKUON\u00A0ANALYZERは、その期待に応えるだけでなく、もうひとつの武器を提供します。スペクトラムアナライザーとリファレンス比較機能です。\n\nプロのミキサーやマスタリングエンジニアは、必ずリファレンス楽曲と自分のミックスを比較しています。iZotopeやFabFilterのプラグインを使って。それが今、ブラウザだけで、無料でできます。\n\n空音開発のツールは「分析して終わり」ではありません。問題を見つけたら、そのままMASTER\u00A0CHECKで修正 → 最適化済みWAVをダウンロード。分析から修正までが一気通貫です。',
    en: 'You searched for a free LUFS meter — and you found one.\n\nBut KUON\u00A0ANALYZER gives you something more: a spectrum analyzer with reference comparison.\n\nProfessional mixers and mastering engineers always compare their work against reference tracks, using plugins from iZotope or FabFilter. Now you can do the same thing — in your browser, for free.\n\nKuon R&D tools don\'t stop at analysis. Found a problem? Jump to MASTER\u00A0CHECK to fix it → download an optimized WAV. Analysis to correction, all in one flow.',
    es: 'Buscaste un medidor LUFS gratis — y lo encontraste.\n\nPero KUON\u00A0ANALYZER te da algo más: un analizador de espectro con comparación de referencia.\n\nLos profesionales siempre comparan su trabajo contra pistas de referencia, usando plugins de iZotope o FabFilter. Ahora puedes hacerlo — en tu navegador, gratis.\n\nLas herramientas de Kuon R&D no se detienen en el análisis. ¿Encontraste un problema? Salta a MASTER\u00A0CHECK para corregirlo → descarga un WAV optimizado.',
  } as L3,

  // FAQ
  faqTitle: { ja: 'よくある質問', en: 'FAQ', es: 'Preguntas Frecuentes' } as L3,
  faq1q: {
    ja: 'スペクトラムアナライザーとは何ですか？',
    en: 'What is a spectrum analyzer?',
    es: '¿Qué es un analizador de espectro?',
  } as L3,
  faq1a: {
    ja: 'スペクトラムアナライザーは、音声信号の周波数成分をリアルタイムで可視化するツールです。低音（ベース）から高音（シンバル）まで、どの周波数帯にどれだけエネルギーがあるかをグラフで表示します。ミックスの周波数バランスの確認や、リファレンス楽曲との比較に不可欠です。',
    en: 'A spectrum analyzer visualizes the frequency components of an audio signal in real-time. It shows how much energy exists in each frequency band, from bass to treble. Essential for checking mix frequency balance and comparing with reference tracks.',
    es: 'Un analizador de espectro visualiza los componentes de frecuencia de una señal de audio en tiempo real. Muestra cuánta energía existe en cada banda de frecuencia. Esencial para verificar el balance y comparar con referencias.',
  } as L3,
  faq2q: {
    ja: 'LUFSメーターはどんなときに使いますか？',
    en: 'When should I use a LUFS meter?',
    es: '¿Cuándo debo usar un medidor LUFS?',
  } as L3,
  faq2a: {
    ja: 'LUFS（Loudness Units relative to Full Scale）は、人間の聴覚特性を考慮したラウドネスの国際規格です。Spotify（-14 LUFS）やApple Music（-16 LUFS）などの配信プラットフォームは、この値を基準に音量を自動調整します。マスタリング後、配信前のチェックに必須のツールです。KUON ANALYZER ではリアルタイムに Momentary / Short-term LUFS を確認できます。',
    en: 'LUFS measures perceived loudness based on human hearing. Streaming platforms like Spotify (-14 LUFS) and Apple Music (-16 LUFS) use this value to auto-adjust volume. Essential for checking after mastering, before distribution. KUON ANALYZER shows real-time Momentary / Short-term LUFS.',
    es: 'LUFS mide la sonoridad percibida. Plataformas como Spotify (-14 LUFS) y Apple Music (-16 LUFS) usan este valor para ajustar el volumen automáticamente. Esencial después de la masterización. KUON ANALYZER muestra LUFS Momentáneo / Corto plazo en tiempo real.',
  } as L3,
  faq3q: {
    ja: 'リファレンス比較はどうやって使いますか？',
    en: 'How do I use reference comparison?',
    es: '¿Cómo uso la comparación de referencia?',
  } as L3,
  faq3a: {
    ja: '自分のミックスを再生中に「+ リファレンス追加」ボタンでプロの楽曲ファイルを読み込みます。リファレンスの平均スペクトラムがオレンジ色のラインで重ねて表示されるので、自分のミックスとの周波数バランスの差が一目で分かります。',
    en: 'While playing your mix, click "+ Add Reference" and load a professional track. Its average spectrum appears as an orange overlay line, making frequency balance differences instantly visible.',
    es: 'Mientras reproduces tu mezcla, haz clic en "+ Añadir Referencia" y carga una pista profesional. Su espectro promedio aparece como una línea naranja superpuesta.',
  } as L3,
  faq4q: {
    ja: 'マイク入力は何が解析されますか？',
    en: 'What does mic input analyze?',
    es: '¿Qué analiza la entrada de micrófono?',
  } as L3,
  faq4a: {
    ja: 'ブラウザがアクセスできるオーディオ入力デバイス（内蔵マイク、USBマイク、オーディオインターフェイスの入力など）からの信号をリアルタイムに解析します。部屋の音響測定、マイクテスト、ライブのモニタリングなどに使えます。',
    en: 'It analyzes the signal from any audio input device your browser can access — built-in mic, USB mic, or audio interface input. Use for room acoustics measurement, mic testing, or live monitoring.',
    es: 'Analiza la señal de cualquier dispositivo de entrada — micrófono integrado, USB o interfaz de audio. Útil para medición acústica, pruebas de micrófono o monitoreo en vivo.',
  } as L3,
  faq5q: {
    ja: '音声データはサーバーに送信されますか？',
    en: 'Is my audio sent to a server?',
    es: '¿Se envía mi audio a un servidor?',
  } as L3,
  faq5a: {
    ja: 'いいえ。すべての処理はブラウザ内で完結します。未公開の音源も安心してチェックできます。',
    en: 'No. All processing happens entirely in your browser. You can safely analyze unreleased material.',
    es: 'No. Todo ocurre en tu navegador. Puedes analizar material inédito con total seguridad.',
  } as L3,

  // CTA
  ctaTitle: {
    ja: 'あなたのミックス、今すぐ「見て」みませんか？',
    en: 'Ready to "see" your mix?',
    es: '¿Listo para "ver" tu mezcla?',
  } as L3,
  ctaBtn: {
    ja: 'KUON ANALYZER を開く',
    en: 'Open KUON ANALYZER',
    es: 'Abrir KUON ANALYZER',
  } as L3,
  ctaFree: {
    ja: '完全無料・インストール不要・サーバー送信なし',
    en: '100% Free — No Install — No Upload',
    es: '100% Gratis — Sin Instalación — Sin Subida',
  } as L3,
  ctaMasterCheck: {
    ja: 'ラウドネスの詳細分析 → KUON MASTER CHECK',
    en: 'Detailed loudness analysis → KUON MASTER CHECK',
    es: 'Análisis detallado → KUON MASTER CHECK',
  } as L3,
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function AnalyzerLpPage() {
  const { lang } = useLang();
  const t = (l3: L3) => l3[lang] || l3.en;

  const features = [
    { icon: '🎯', t: T.feat0t, d: T.feat0d, highlight: true },
    { icon: '📊', t: T.feat1t, d: T.feat1d },
    { icon: '📈', t: T.feat2t, d: T.feat2d },
    { icon: '🎚', t: T.feat3t, d: T.feat3d },
    { icon: '🎙', t: T.feat4t, d: T.feat4d },
    { icon: '🔗', t: T.feat5t, d: T.feat5d },
  ];

  const steps = [
    { n: '01', t: T.how1t, d: T.how1d },
    { n: '02', t: T.how2t, d: T.how2d },
    { n: '03', t: T.how3t, d: T.how3d },
  ];

  const personas = [
    { icon: '🎛️', t: T.who1t, d: T.who1d },
    { icon: '🎧', t: T.who2t, d: T.who2d },
    { icon: '🔊', t: T.who3t, d: T.who3d },
    { icon: '🎤', t: T.who4t, d: T.who4d },
  ];

  const faqs = [
    { q: T.faq1q, a: T.faq1a },
    { q: T.faq2q, a: T.faq2a },
    { q: T.faq3q, a: T.faq3a },
    { q: T.faq4q, a: T.faq4a },
    { q: T.faq5q, a: T.faq5a },
  ];

  const ctaButton = (
    <Link href="/analyzer" style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '14px 36px', borderRadius: 50, border: 'none',
      fontSize: 'clamp(14px, 2.5vw, 16px)', fontWeight: 700,
      letterSpacing: '0.06em', textDecoration: 'none',
      color: '#fff', background: `linear-gradient(135deg, ${ACCENT}, #7C3AED)`,
      boxShadow: `0 8px 24px rgba(79,70,229,0.3)`,
      transition: 'all 0.3s ease',
    }}>
      {t(T.ctaBtn)} →
    </Link>
  );

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'KUON ANALYZER',
        description: t(T.heroSub),
        url: 'https://kuon-rnd.com/analyzer',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web Browser',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
        author: { '@type': 'Organization', name: '空音開発 Kuon R&D', url: 'https://kuon-rnd.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: t(f.q),
          acceptedAnswer: { '@type': 'Answer', text: t(f.a) },
        })),
      },
    ],
  };

  return (
    <div style={{
      maxWidth: 960, margin: '0 auto',
      padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 40px)',
      fontFamily: sans,
    }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ══════════ HERO ══════════ */}
      <section className="hero-enter-1" style={{
        textAlign: 'center',
        paddingTop: 'clamp(32px, 8vw, 80px)',
        paddingBottom: 'clamp(48px, 10vw, 80px)',
      }}>
        {/* Stats */}
        <div style={{
          display: 'inline-flex', gap: 'clamp(20px, 4vw, 32px)', marginBottom: 32,
          padding: '12px 28px', borderRadius: 50,
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}>
          {[
            { val: '¥0', label: 'PRICE' },
            { val: '8192', label: 'FFT' },
            { val: 'EBU', label: 'R128' },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: mono, fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: ACCENT }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.12em', fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(28px, 6vw, 52px)',
          fontWeight: 700, lineHeight: 1.3,
          letterSpacing: '0.03em', whiteSpace: 'pre-line',
          marginBottom: 20,
          background: `linear-gradient(135deg, #111827 20%, ${ACCENT} 60%, #7C3AED)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {t(T.heroTitle)}
        </h1>
        <p className="hero-enter-2" style={{
          fontSize: 'clamp(14px, 2.2vw, 17px)',
          color: '#6b7280', lineHeight: 1.8, maxWidth: 600, margin: '0 auto',
          whiteSpace: 'pre-line', marginBottom: 32,
        }}>
          {t(T.heroSub)}
        </p>
        <div className="hero-enter-3">
          {ctaButton}
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>{t(T.heroFree)}</p>
        </div>
      </section>

      {/* ══════════ PROBLEM ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em', wordBreak: 'keep-all' }}>
          {t(T.problemTitle)}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto' }}>
          {[T.problem1, T.problem2, T.problem3, T.problem4].map((p, i) => (
            <div key={i} style={{
              ...glass, display: 'flex', alignItems: 'flex-start', gap: 14, padding: '20px 24px',
              borderLeft: `3px solid ${['#ef4444', '#f59e0b', '#7C3AED', ACCENT][i]}`,
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{['🤔', '💸', '😮‍💨', '🎙'][i]}</span>
              <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#374151', lineHeight: 1.7, margin: 0, wordBreak: 'keep-all' }}>{t(p)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════ SOLUTION ══════════ */}
      <Section style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)',
          fontWeight: 600, lineHeight: 1.4, letterSpacing: '0.03em',
          whiteSpace: 'pre-line', marginBottom: 32, wordBreak: 'keep-all',
        }}>
          {t(T.solutionTitle)}
        </h2>
        {/* Mock UI */}
        <div style={{
          ...glass, maxWidth: 600, margin: '0 auto', padding: 0, overflow: 'hidden',
          border: `1px solid rgba(79,70,229,0.2)`,
        }}>
          {/* Browser chrome */}
          <div style={{
            background: 'rgba(0,0,0,0.03)', padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#9ca3af', fontFamily: mono }}>kuon-rnd.com/analyzer</span>
          </div>
          {/* Mock spectrum */}
          <div style={{ background: '#080814', padding: '20px 16px 12px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: 80, gap: 2, justifyContent: 'center' }}>
              {[40, 55, 65, 72, 78, 75, 70, 68, 62, 55, 48, 42, 38, 35, 30, 25, 20, 15, 12, 10, 8].map((h, i) => (
                <div key={i} style={{
                  width: 'clamp(8px, 2vw, 16px)', height: `${h}%`, borderRadius: 2,
                  background: `linear-gradient(to top, rgba(79,70,229,0.3), rgba(79,70,229,0.8), rgba(167,139,250,0.9))`,
                }} />
              ))}
            </div>
            {/* Mock reference line */}
            <svg viewBox="0 0 300 80" style={{ position: 'absolute', top: 20, left: 16, right: 16, height: 80, width: 'calc(100% - 32px)' }}>
              <polyline
                points="0,58 15,42 30,32 45,26 60,20 75,22 90,28 105,30 120,34 135,40 150,45 165,50 180,54 195,58 210,62 225,65 240,68 255,72 270,74 285,76 300,78"
                fill="none" stroke="rgba(245,158,11,0.6)" strokeWidth="1.5" strokeDasharray="4,3"
              />
            </svg>
            {/* REF label */}
            <span style={{
              position: 'absolute', top: 8, right: 20,
              fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
              color: '#f59e0b', opacity: 0.8, fontFamily: mono,
            }}>REF</span>
            {/* Freq labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' }}>
              {['100', '1k', '10k'].map(l => (
                <span key={l} style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontFamily: mono }}>{l}</span>
              ))}
            </div>
          </div>
          {/* Mock meters */}
          <div style={{ padding: '12px 16px', display: 'flex', gap: 16 }}>
            {[
              { label: 'Momentary', value: '-12.4 LUFS', color: '#f59e0b' },
              { label: 'Short-term', value: '-13.1 LUFS', color: '#059669' },
              { label: 'Peak', value: '-1.2 dB', color: '#059669' },
            ].map((m, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2, fontWeight: 600 }}>{m.label}</div>
                <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ══════════ FEATURES ══════════ */}
      <Section id="features">
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em' }}>
          {t(T.featTitle)}
        </h2>
        {/* Highlight: Reference Comparison */}
        {features.filter(f => f.highlight).map((f, i) => (
          <div key={`hl-${i}`} style={{
            ...glass, padding: 'clamp(24px, 4vw, 36px)', marginBottom: 16,
            borderLeft: `4px solid ${ACCENT}`,
            background: `linear-gradient(135deg, rgba(79,70,229,0.04), rgba(255,255,255,0.7))`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 36, flexShrink: 0 }}>{f.icon}</span>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: sans, fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 800, color: '#111827', margin: 0 }}>
                    {t(f.t)}
                  </h3>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                    padding: '3px 10px', borderRadius: 50,
                    color: '#fff', background: `linear-gradient(135deg, ${ACCENT}, #7C3AED)`,
                  }}>
                    {lang === 'ja' ? '他ツールにない機能' : lang === 'es' ? 'EXCLUSIVO' : 'EXCLUSIVE'}
                  </span>
                </div>
                <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#374151', lineHeight: 1.8, margin: 0 }}>{t(f.d)}</p>
              </div>
            </div>
          </div>
        ))}
        {/* Other features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {features.filter(f => !f.highlight).map((f, i) => (
            <div key={i} style={{ ...glass, padding: '24px' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontFamily: sans, fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#111827' }}>{t(f.t)}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{t(f.d)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════ HOW TO USE ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em' }}>
          {t(T.howTitle)}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600, margin: '0 auto' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ ...glass, display: 'flex', gap: 20, alignItems: 'flex-start', padding: '24px' }}>
              <span style={{
                fontFamily: mono, fontSize: 32, fontWeight: 800,
                color: `${ACCENT}20`, lineHeight: 1, flexShrink: 0,
              }}>{s.n}</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#111827' }}>{t(s.t)}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{t(s.d)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════ COMPARISON ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em' }}>
          {t(T.compTitle)}
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(12px, 2vw, 14px)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.08)' }}>
                {['', 'KUON ANALYZER', 'Voxengo SPAN', 'Youlean Loudness Meter', 'iZotope Insight 2'].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center',
                    fontWeight: i === 1 ? 800 : 600, fontSize: 12,
                    letterSpacing: '0.06em', color: i === 1 ? ACCENT : '#6b7280',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [{ ja: '価格', en: 'Price', es: 'Precio' }, { ja: '無料', en: 'Free', es: 'Gratis' }, { ja: '無料', en: 'Free', es: 'Gratis' }, '$99 (Free ver.)', '$199'],
                [{ ja: 'インストール', en: 'Install', es: 'Instalación' }, '—', { ja: '必要（VST）', en: 'Required (VST)', es: 'Necesario (VST)' }, { ja: '必要（VST）', en: 'Required (VST)', es: 'Necesario (VST)' }, { ja: '必要（VST）', en: 'Required (VST)', es: 'Necesario (VST)' }],
                [{ ja: 'スペクトラム表示', en: 'Spectrum Display', es: 'Espectro' }, '✅', '✅', '—', '✅'],
                ['LUFS (EBU R128)', '✅', '—', '✅', '✅'],
                [{ ja: 'リファレンス比較', en: 'Reference Compare', es: 'Comparar Ref.' }, '✅', '✅', '—', '✅'],
                [{ ja: '帯域バランス表示', en: 'Band Balance', es: 'Balance Bandas' }, '✅', '—', '—', '✅'],
                [{ ja: 'マイク入力', en: 'Mic Input', es: 'Micrófono' }, '✅', '—', '—', '—'],
                [{ ja: 'ラウドネス自動調整連携', en: 'Auto Adjust Link', es: 'Ajuste Automático' }, '✅ (MASTER CHECK)', '❌', '❌', '❌'],
                [{ ja: 'サーバー送信なし', en: 'No Server Upload', es: 'Sin Subida' }, '✅', '✅', '✅', '✅'],
                [{ ja: 'ブラウザ完結', en: 'Browser Only', es: 'Solo Navegador' }, '✅', '❌', '❌', '❌'],
              ].map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  {row.map((cell, ci) => {
                    const text = typeof cell === 'object' && cell !== null && 'ja' in cell ? (cell as L3)[lang] : String(cell);
                    return (
                      <td key={ci} style={{
                        padding: '10px 12px',
                        textAlign: ci === 0 ? 'left' : 'center',
                        fontWeight: ci === 0 ? 600 : 400,
                        color: ci === 1 ? '#111827' : '#6b7280',
                        background: ci === 1 ? `rgba(79,70,229,0.03)` : 'transparent',
                        whiteSpace: 'nowrap',
                      }}>{text}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ══════════ WHO ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em', wordBreak: 'keep-all' }}>
          {t(T.whoTitle)}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {personas.map((p, i) => (
            <div key={i} style={{ ...glass, padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{p.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#111827' }}>{t(p.t)}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{t(p.d)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════ VALUE ══════════ */}
      <Section>
        <div style={{ ...glass, maxWidth: 640, margin: '0 auto', padding: 'clamp(28px, 5vw, 44px)', borderLeft: `4px solid ${ACCENT}` }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 600, marginBottom: 20, letterSpacing: '0.03em', wordBreak: 'keep-all' }}>
            {t(T.valueTitle)}
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
            {t(T.valueBody)}
          </p>
        </div>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em' }}>
          {t(T.faqTitle)}
        </h2>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((f, i) => (
            <details key={i} style={{ ...glass, padding: 0, cursor: 'pointer' }}>
              <summary style={{
                padding: '18px 24px', fontSize: 'clamp(14px, 2vw, 16px)',
                fontWeight: 600, color: '#111827', listStyle: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {t(f.q)}
                <span style={{ fontSize: 18, color: '#9ca3af', flexShrink: 0, marginLeft: 12 }}>＋</span>
              </summary>
              <div style={{ padding: '0 24px 18px', fontSize: 'clamp(13px, 1.8vw, 15px)', color: '#6b7280', lineHeight: 1.8 }}>
                {t(f.a)}
              </div>
            </details>
          ))}
        </div>
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <Section style={{ textAlign: 'center', paddingBottom: 'clamp(40px, 8vw, 80px)' }}>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)',
          fontWeight: 600, marginBottom: 24, letterSpacing: '0.03em', wordBreak: 'keep-all',
        }}>
          {t(T.ctaTitle)}
        </h2>
        {ctaButton}
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>{t(T.ctaFree)}</p>
        <div style={{ marginTop: 24 }}>
          <Link href="/master-check-lp" style={{
            fontSize: 13, color: '#0284c7', textDecoration: 'none',
            borderBottom: '1px solid rgba(2,132,199,0.3)',
            transition: 'all 0.2s',
          }}>
            🎯 {t(T.ctaMasterCheck)}
          </Link>
        </div>
      </Section>
    </div>
  );
}
