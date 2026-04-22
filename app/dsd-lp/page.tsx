'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L3 = Partial<Record<Lang, string>> & { en: string };

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#7C3AED';
const ACCENT2 = '#a78bfa';

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

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useReveal();
  return <section ref={ref} className="reveal" style={{ marginBottom: 'clamp(48px, 10vw, 80px)', ...style }}>{children}</section>;
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
    ja: 'DSD を、ブラウザで再生する。\n世界初。',
    en: 'Play DSD in your browser.\nA world first.',
    es: 'Reproduce DSD en tu navegador.\nUna primicia mundial.',
  } as L3,
  heroSub: {
    ja: 'DSF / DFF ファイルをドロップするだけ。\n再生もWAV変換も、ブラウザの中で完結します。\nインストール不要。サーバー送信なし。完全無料。',
    en: 'Just drop your DSF / DFF file.\nPlayback and WAV conversion happen entirely in your browser.\nNo install. No server upload. Completely free.',
    es: 'Solo arrastra tu archivo DSF / DFF.\nLa reproducción y conversión WAV ocurren en tu navegador.\nSin instalación. Sin subir al servidor. Totalmente gratis.',
  } as L3,
  heroCta: {
    ja: '今すぐ使う（無料）',
    en: 'Use Now — Free',
    es: 'Usar Ahora — Gratis',
  } as L3,
  heroLearn: {
    ja: '詳しく見る',
    en: 'Learn More',
    es: 'Más información',
  } as L3,

  // Pain points
  painTitle: {
    ja: 'DSD の再生、困っていませんか？',
    en: 'Struggling to play DSD files?',
    es: '¿Tienes problemas para reproducir archivos DSD?',
  } as L3,
  pain1: {
    ja: 'DSD対応の再生ソフトは高額で、年間サブスクリプションも必要',
    en: 'DSD playback software is expensive, often requiring annual subscriptions',
    es: 'El software de reproducción DSD es caro y a menudo requiere suscripciones anuales',
  } as L3,
  pain2: {
    ja: '再生アプリをインストールしたが、ドライバの設定が複雑すぎて挫折',
    en: 'You installed a player but gave up on complex driver configuration',
    es: 'Instalaste un reproductor pero abandonaste la configuración compleja de drivers',
  } as L3,
  pain3: {
    ja: 'DSDファイルをWAVに変換したいが、変換ツールも有料ばかり',
    en: 'You want to convert DSD to WAV, but conversion tools are all paid',
    es: 'Quieres convertir DSD a WAV, pero las herramientas de conversión son todas de pago',
  } as L3,
  pain4: {
    ja: 'ファイルをサーバーにアップロードするオンラインツールは、大容量DSDファイルには使えない',
    en: 'Online tools that upload to servers can\'t handle GB-sized DSD files',
    es: 'Las herramientas online que suben al servidor no pueden manejar archivos DSD de GB',
  } as L3,

  // Solution
  solutionTitle: {
    ja: 'KUON DSD が、\nすべてを解決します。',
    en: 'KUON DSD solves\nall of this.',
    es: 'KUON DSD resuelve\ntodo esto.',
  } as L3,
  solutionSub: {
    ja: 'URL を開いて、ファイルをドロップする。それだけです。',
    en: 'Open the URL, drop your file. That\'s it.',
    es: 'Abre la URL, arrastra tu archivo. Eso es todo.',
  } as L3,

  // Features
  featTitle: {
    ja: '6 つの理由',
    en: '6 Reasons',
    es: '6 Razones',
  } as L3,
  feat1t: { ja: 'ブラウザ完結 DSD プレーヤー', en: 'Browser-Native DSD Player', es: 'Reproductor DSD nativo del navegador' } as L3,
  feat1d: {
    ja: 'DSF / DFF ファイルをドロップするだけで、ブラウザ上で即座に再生。シークバー付きで、好きな位置から聴けます。',
    en: 'Drop your DSF / DFF file and play instantly in the browser. Seek bar included — jump to any position.',
    es: 'Arrastra tu archivo DSF / DFF y reprodúcelo al instante. Barra de búsqueda incluida — salta a cualquier posición.',
  } as L3,
  feat2t: { ja: '高品質 WAV 変換（24bit）', en: 'High-Quality WAV Conversion (24-bit)', es: 'Conversión WAV de alta calidad (24-bit)' } as L3,
  feat2d: {
    ja: 'FIR ローパスフィルタによるプロ品質のデシメーション。44.1kHz〜192kHz のサンプルレートを選択して、24bit WAV としてダウンロード。',
    en: 'Pro-quality decimation with FIR lowpass filter. Choose sample rates from 44.1kHz to 192kHz and download as 24-bit WAV.',
    es: 'Decimación de calidad profesional con filtro FIR. Elige frecuencias de 44.1kHz a 192kHz y descarga como WAV de 24-bit.',
  } as L3,
  feat3t: { ja: 'GB級ファイル対応', en: 'Handles GB-Size Files', es: 'Soporta archivos de GB' } as L3,
  feat3d: {
    ja: 'レコード1枚分（3GB超）のDSDファイルも問題なし。ストリーミング・チャンク処理で、メモリを使い切ることなく安全に処理。',
    en: 'Full vinyl rips (3GB+) are no problem. Streaming chunk-by-chunk processing keeps memory usage efficient and safe.',
    es: 'Rips de vinilos completos (3GB+) sin problema. Procesamiento por fragmentos mantiene el uso de memoria eficiente.',
  } as L3,
  feat4t: { ja: 'Rust WebAssembly 駆動', en: 'Powered by Rust WebAssembly', es: 'Impulsado por Rust WebAssembly' } as L3,
  feat4d: {
    ja: 'オーディオ処理エンジンは Rust で実装し、WebAssembly にコンパイル。ネイティブアプリと同等の処理速度をブラウザ上で実現。',
    en: 'The audio processing engine is written in Rust and compiled to WebAssembly. Native-app-level performance, right in your browser.',
    es: 'El motor de procesamiento de audio está escrito en Rust y compilado a WebAssembly. Rendimiento de app nativa en tu navegador.',
  } as L3,
  feat5t: { ja: '完全ローカル処理', en: 'Fully Local Processing', es: 'Procesamiento 100% local' } as L3,
  feat5d: {
    ja: '音声データは一切サーバーに送信されません。すべてのデコード・変換・再生がブラウザ内のみで完結します。機密音源も安心。',
    en: 'Your audio data never leaves your computer. All decoding, conversion, and playback happen entirely in your browser. Safe for confidential recordings.',
    es: 'Tus datos de audio nunca salen de tu computadora. Todo ocurre en tu navegador. Seguro para grabaciones confidenciales.',
  } as L3,
  feat6t: { ja: '完全無料・インストール不要', en: 'Completely Free — No Install', es: 'Totalmente gratis — Sin instalación' } as L3,
  feat6d: {
    ja: '会員登録もサブスクリプションも不要。URL を開くだけ。Windows / Mac / Linux / iPad、ブラウザがあればすべてのデバイスで動作。',
    en: 'No registration, no subscription. Just open the URL. Works on Windows, Mac, Linux, iPad — any device with a browser.',
    es: 'Sin registro, sin suscripción. Solo abre la URL. Funciona en Windows, Mac, Linux, iPad — cualquier dispositivo con navegador.',
  } as L3,

  // Comparison
  compTitle: {
    ja: '高額ソフトウェアと比較',
    en: 'Compared to Expensive Software',
    es: 'Comparado con software costoso',
  } as L3,
  compFeature: { ja: '機能', en: 'Feature', es: 'Función' } as L3,
  compKuon: { ja: 'KUON DSD', en: 'KUON DSD', es: 'KUON DSD' } as L3,
  compOthers: { ja: '他の DSD ソフト', en: 'Other DSD Software', es: 'Otro software DSD' } as L3,
  compRows: [
    { feat: { ja: '価格', en: 'Price', es: 'Precio' } as L3, kuon: { ja: '無料', en: 'Free', es: 'Gratis' } as L3, others: { ja: '¥5,000〜¥30,000+', en: '$50–$200+', es: '$50–$200+' } as L3 },
    { feat: { ja: 'インストール', en: 'Installation', es: 'Instalación' } as L3, kuon: { ja: '不要', en: 'Not required', es: 'No requerida' } as L3, others: { ja: '必要', en: 'Required', es: 'Requerida' } as L3 },
    { feat: { ja: 'ドライバ設定', en: 'Driver Setup', es: 'Configuración de drivers' } as L3, kuon: { ja: '不要', en: 'Not required', es: 'No requerida' } as L3, others: { ja: 'ASIO等の設定が必要', en: 'ASIO etc. needed', es: 'ASIO etc. necesario' } as L3 },
    { feat: { ja: 'サーバー送信', en: 'Server Upload', es: 'Subida al servidor' } as L3, kuon: { ja: 'なし（完全ローカル）', en: 'None (fully local)', es: 'Ninguna (100% local)' } as L3, others: { ja: 'ローカル', en: 'Local', es: 'Local' } as L3 },
    { feat: { ja: 'GB級ファイル', en: 'GB-Size Files', es: 'Archivos de GB' } as L3, kuon: { ja: '対応', en: 'Supported', es: 'Soportado' } as L3, others: { ja: '対応', en: 'Supported', es: 'Soportado' } as L3 },
    { feat: { ja: 'WAV変換', en: 'WAV Export', es: 'Exportar WAV' } as L3, kuon: { ja: '24bit / サンプルレート選択', en: '24-bit / Rate selection', es: '24-bit / Selección de frecuencia' } as L3, others: { ja: 'ソフトによる', en: 'Varies', es: 'Varía' } as L3 },
    { feat: { ja: 'DSD64/128/256', en: 'DSD64/128/256', es: 'DSD64/128/256' } as L3, kuon: { ja: '対応', en: 'Supported', es: 'Soportado' } as L3, others: { ja: '対応', en: 'Supported', es: 'Soportado' } as L3 },
    { feat: { ja: 'クロスプラットフォーム', en: 'Cross-Platform', es: 'Multiplataforma' } as L3, kuon: { ja: 'ブラウザがあれば全OS', en: 'Any OS with a browser', es: 'Cualquier SO con navegador' } as L3, others: { ja: 'Win/Mac のみが多い', en: 'Often Win/Mac only', es: 'A menudo solo Win/Mac' } as L3 },
  ],

  // Tech
  techTitle: {
    ja: 'テクノロジー',
    en: 'Technology',
    es: 'Tecnología',
  } as L3,
  techItems: [
    { label: { ja: 'エンジン', en: 'Engine', es: 'Motor' } as L3, value: 'Rust → WebAssembly' },
    { label: { ja: 'フィルタ', en: 'Filter', es: 'Filtro' } as L3, value: 'Blackman-windowed sinc FIR' },
    { label: { ja: 'ストップバンド', en: 'Stopband', es: 'Banda de rechazo' } as L3, value: '-74 dB' },
    { label: { ja: '出力', en: 'Output', es: 'Salida' } as L3, value: '24-bit PCM WAV' },
    { label: { ja: '処理方式', en: 'Processing', es: 'Procesamiento' } as L3, value: 'Streaming (8MB chunks)' },
    { label: { ja: 'ルックアップ最適化', en: 'Lookup Optimization', es: 'Optimización de búsqueda' } as L3, value: '256-entry byte LUT' },
  ],

  // Supported
  supportTitle: {
    ja: '対応フォーマット',
    en: 'Supported Formats',
    es: 'Formatos soportados',
  } as L3,

  // CTA
  ctaTitle: {
    ja: '高額な DSD ソフトは、もう不要です。',
    en: 'Expensive DSD software is now obsolete.',
    es: 'El software DSD caro ya es obsoleto.',
  } as L3,
  ctaSub: {
    ja: 'URL を開く。ファイルをドロップ。再生する。変換する。\nそれだけで、あなたの DSD コレクションが生き返ります。',
    en: 'Open the URL. Drop your file. Play. Convert.\nThat\'s all it takes to bring your DSD collection to life.',
    es: 'Abre la URL. Arrastra tu archivo. Reproduce. Convierte.\nEso es todo lo que necesitas para dar vida a tu colección DSD.',
  } as L3,
  ctaBtn: {
    ja: 'KUON DSD を開く（無料）',
    en: 'Open KUON DSD — Free',
    es: 'Abrir KUON DSD — Gratis',
  } as L3,

  poweredBy: {
    ja: 'Powered by Rust WebAssembly — 空音開発 Kuon R&D',
    en: 'Powered by Rust WebAssembly — Kuon R&D',
    es: 'Desarrollado con Rust WebAssembly — Kuon R&D',
  } as L3,
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function DsdLpPage() {
  const { lang } = useLang();
  const t = (obj: L3) => obj[lang] || obj.en;

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: sans, fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', fontWeight: 700,
    color: '#fff', backgroundColor: ACCENT,
    border: 'none', padding: '1rem 2.5rem', borderRadius: 50,
    cursor: 'pointer', letterSpacing: '0.05em',
    boxShadow: `0 6px 24px rgba(124,58,237,0.3)`,
    textDecoration: 'none', transition: 'all 0.3s ease',
  };

  const btnOutline: React.CSSProperties = {
    ...btnPrimary,
    backgroundColor: 'transparent', color: ACCENT,
    border: `2px solid ${ACCENT}`, boxShadow: 'none',
  };

  return (
    <div style={{
      maxWidth: 900, margin: '0 auto',
      padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 40px)',
    }}>

      {/* ═══ HERO ═══ */}
      <section style={{
        textAlign: 'center',
        paddingTop: 'clamp(40px, 10vw, 100px)',
        paddingBottom: 'clamp(48px, 10vw, 80px)',
      }}>
        {/* Badge */}
        <div className="hero-enter-1" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 20px', borderRadius: 50, marginBottom: 28,
          background: `${ACCENT}10`, border: `1px solid ${ACCENT}25`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, display: 'inline-block' }} />
          <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: ACCENT }}>
            RUST WEBASSEMBLY
          </span>
        </div>

        <h1 className="hero-enter-2" style={{
          fontFamily: serif,
          fontSize: 'clamp(28px, 6vw, 54px)',
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: '0.03em',
          whiteSpace: 'pre-line',
          marginBottom: 24,
          background: `linear-gradient(135deg, #0f172a 30%, ${ACCENT} 70%, ${ACCENT2})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {t(T.heroTitle)}
        </h1>

        <p className="hero-enter-3" style={{
          fontFamily: sans, fontSize: 'clamp(14px, 2.2vw, 17px)',
          color: '#6b7280', lineHeight: 1.9, maxWidth: 560,
          margin: '0 auto 36px', whiteSpace: 'pre-line',
        }}>
          {t(T.heroSub)}
        </p>

        <div className="hero-enter-4" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dsd" style={btnPrimary}>{t(T.heroCta)}</Link>
          <a href="#features" style={btnOutline}>{t(T.heroLearn)} ↓</a>
        </div>

        {/* Stats */}
        <div className="hero-enter-5" style={{
          display: 'inline-flex', gap: 32, marginTop: 48,
          padding: '16px 36px', borderRadius: 50,
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
        }}>
          {[
            { value: '¥0', label: { ja: '価格', en: 'PRICE', es: 'PRECIO' } as L3 },
            { value: '0', label: { ja: 'インストール', en: 'INSTALL', es: 'INSTALACIÓN' } as L3 },
            { value: '24bit', label: { ja: '出力品質', en: 'OUTPUT', es: 'CALIDAD' } as L3 },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: mono, fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: ACCENT }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.12em', fontWeight: 600 }}>
                  {t(s.label)}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ═══ PAIN POINTS ═══ */}
      <Section>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)',
          fontWeight: 700, textAlign: 'center', marginBottom: 32,
          color: '#111827',
        }}>
          {t(T.painTitle)}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640, margin: '0 auto' }}>
          {[T.pain1, T.pain2, T.pain3, T.pain4].map((p, i) => (
            <div key={i} style={{
              ...glass,
              display: 'flex', alignItems: 'flex-start', gap: 14,
              borderLeft: `3px solid ${ACCENT}30`,
            }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>
                {['💸', '😤', '💰', '📡'][i]}
              </span>
              <p style={{ margin: 0, fontSize: 'clamp(13px, 2vw, 15px)', color: '#374151', lineHeight: 1.7 }}>
                {t(p)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ SOLUTION ═══ */}
      <Section style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(24px, 5vw, 40px)',
          fontWeight: 700, marginBottom: 16, whiteSpace: 'pre-line',
          background: `linear-gradient(135deg, #0f172a, ${ACCENT})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {t(T.solutionTitle)}
        </h2>
        <p style={{
          fontSize: 'clamp(14px, 2.2vw, 17px)', color: '#6b7280',
          lineHeight: 1.8, maxWidth: 500, margin: '0 auto',
        }}>
          {t(T.solutionSub)}
        </p>
      </Section>

      {/* ═══ FEATURES ═══ */}
      <Section>
        <div id="features" style={{ position: 'relative', top: -80 }} />
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)',
          fontWeight: 700, textAlign: 'center', marginBottom: 36,
          color: '#111827',
        }}>
          {t(T.featTitle)}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {[
            { icon: '🎵', t: T.feat1t, d: T.feat1d },
            { icon: '🎚️', t: T.feat2t, d: T.feat2d },
            { icon: '💾', t: T.feat3t, d: T.feat3d },
            { icon: '⚡', t: T.feat4t, d: T.feat4d },
            { icon: '🔒', t: T.feat5t, d: T.feat5d },
            { icon: '🆓', t: T.feat6t, d: T.feat6d },
          ].map((f, i) => (
            <div key={i} style={{ ...glass, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 28 }}>{f.icon}</div>
              <h3 style={{
                fontFamily: sans, fontSize: 'clamp(14px, 2vw, 16px)',
                fontWeight: 700, color: '#111827', margin: 0,
              }}>
                {t(f.t)}
              </h3>
              <p style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
                {t(f.d)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <Section>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)',
          fontWeight: 700, textAlign: 'center', marginBottom: 32,
          color: '#111827',
        }}>
          {t(T.compTitle)}
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: 12, overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}>
            <thead>
              <tr style={{ background: `${ACCENT}08` }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>
                  {t(T.compFeature)}
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: ACCENT, fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
                  {t(T.compKuon)}
                </th>
                <th style={{ padding: '14px 16px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>
                  {t(T.compOthers)}
                </th>
              </tr>
            </thead>
            <tbody>
              {T.compRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < T.compRows.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: '#374151', fontWeight: 500 }}>{t(row.feat)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: ACCENT, fontWeight: 700 }}>{t(row.kuon)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>{t(row.others)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ═══ SUPPORTED FORMATS ═══ */}
      <Section>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)',
          fontWeight: 700, textAlign: 'center', marginBottom: 32,
          color: '#111827',
        }}>
          {t(T.supportTitle)}
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, maxWidth: 640, margin: '0 auto',
        }}>
          {[
            { title: 'DSF', sub: 'DSD Stream File', desc: { ja: 'Sony 策定のDSD標準フォーマット', en: 'Sony\'s DSD standard format', es: 'Formato estándar DSD de Sony' } as L3 },
            { title: 'DFF', sub: 'DSDIFF', desc: { ja: 'Philips 策定のDSD標準フォーマット', en: 'Philips\' DSD standard format', es: 'Formato estándar DSD de Philips' } as L3 },
          ].map((f, i) => (
            <div key={i} style={{ ...glass, textAlign: 'center' }}>
              <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 800, color: ACCENT, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 8 }}>{f.sub}</div>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{t(f.desc)}</p>
            </div>
          ))}
        </div>
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24,
        }}>
          {['DSD64 (2.8 MHz)', 'DSD128 (5.6 MHz)', 'DSD256 (11.2 MHz)'].map((d, i) => (
            <span key={i} style={{
              fontFamily: mono, fontSize: 12, fontWeight: 600,
              padding: '6px 16px', borderRadius: 50,
              background: `${ACCENT}10`, color: ACCENT,
              border: `1px solid ${ACCENT}20`,
            }}>
              {d}
            </span>
          ))}
        </div>
      </Section>

      {/* ═══ TECHNOLOGY ═══ */}
      <Section>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)',
          fontWeight: 700, textAlign: 'center', marginBottom: 32,
          color: '#111827',
        }}>
          {t(T.techTitle)}
        </h2>
        <div style={{
          ...glass, maxWidth: 500, margin: '0 auto',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {T.techItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: i < T.techItems.length - 1 ? 12 : 0,
              borderBottom: i < T.techItems.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{t(item.label)}</span>
              <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: '#334155' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══ FINAL CTA ═══ */}
      <Section style={{ textAlign: 'center', paddingBottom: 'clamp(40px, 10vw, 80px)' }}>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(24px, 5vw, 40px)',
          fontWeight: 700, marginBottom: 20,
          background: `linear-gradient(135deg, #0f172a, ${ACCENT})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {t(T.ctaTitle)}
        </h2>
        <p style={{
          fontSize: 'clamp(14px, 2.2vw, 17px)', color: '#6b7280',
          lineHeight: 1.9, maxWidth: 520, margin: '0 auto 32px',
          whiteSpace: 'pre-line',
        }}>
          {t(T.ctaSub)}
        </p>
        <Link href="/dsd" style={btnPrimary}>{t(T.ctaBtn)}</Link>

        {/* Powered by */}
        <p style={{
          marginTop: 48, fontSize: '0.7rem', color: '#cbd5e1',
          fontFamily: serif, letterSpacing: '0.1em',
        }}>
          {t(T.poweredBy)}
        </p>
      </Section>
    </div>
  );
}
