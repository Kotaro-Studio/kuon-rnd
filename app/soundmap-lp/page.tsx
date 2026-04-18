'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L3 = Record<Lang, string>;

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#bda678';

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
const T: Record<string, L3> = {
  heroTitle: {
    ja: '地球のどこかの音が、\nあなたの耳に届く。',
    en: 'A sound from somewhere\non Earth, reaching your ears.',
    es: 'Un sonido de algún lugar\nde la Tierra, llegando a tus oídos.',
  },
  heroSub: {
    ja: '世界中のフィールド録音を、インタラクティブな地球儀で探索・試聴。\n昼と夜がリアルタイムに描かれる地図の上で、音に出会う。',
    en: 'Explore field recordings on an interactive globe with real-time day and night.\nDiscover sounds you have never heard before.',
    es: 'Explora grabaciones de campo en un globo interactivo con día y noche en tiempo real.\nDescubre sonidos que nunca has escuchado.',
  },
  heroCta: {
    ja: '地図を開く',
    en: 'Open the Map',
    es: 'Abrir el Mapa',
  },
  heroFree: {
    ja: '完全無料 — アカウント不要 — 世界中の音を再生',
    en: '100% Free — No Account — Play Sounds Worldwide',
    es: '100% Gratis — Sin Cuenta — Sonidos del Mundo',
  },
  heroStat1: { ja: '0', en: '0', es: '0' },
  heroStat1Label: { ja: '円 — 完全無料', en: '¥ — Completely Free', es: '¥ — Totalmente Gratis' },
  heroStat2: { ja: 'Globe', en: 'Globe', es: 'Globo' },
  heroStat2Label: { ja: '地球儀投影', en: 'Projection', es: 'Proyección' },
  heroStat3: { ja: 'Live', en: 'Live', es: 'En Vivo' },
  heroStat3Label: { ja: '昼夜リアルタイム', en: 'Real-time Day/Night', es: 'Día/Noche en Tiempo Real' },

  // Problem
  problemTitle: {
    ja: 'こんな想いを\n抱えていませんか？',
    en: 'Do any of these\nresonate with you?',
    es: '¿Alguna de estas\nte suena familiar?',
  },
  pain1: {
    ja: '旅先で聴いた忘れられない音がある。でも誰にも伝えられない。',
    en: 'You heard an unforgettable sound while traveling — but you can\'t share it with anyone.',
    es: 'Escuchaste un sonido inolvidable viajando — pero no puedes compartirlo.',
  },
  pain2: {
    ja: 'フィールド録音を始めたいけれど、世界にはどんな音のスポットがあるのかわからない。',
    en: 'You want to try field recording, but don\'t know what sound spots exist around the world.',
    es: 'Quieres empezar a grabar, pero no sabes qué spots de sonido existen en el mundo.',
  },
  pain3: {
    ja: '自然の音を聴きたいけれど、動画サイトでは映像が先に目に入ってしまう。',
    en: 'You want to hear nature, but on video platforms, visuals get in the way of listening.',
    es: 'Quieres escuchar la naturaleza, pero en plataformas de video, lo visual distrae.',
  },
  pain4: {
    ja: '自分のフィールド録音を世界に公開したいが、音に特化したプラットフォームがない。',
    en: 'You want to publish your field recordings, but there\'s no audio-first platform.',
    es: 'Quieres publicar tus grabaciones, pero no hay una plataforma enfocada en audio.',
  },

  // Solution
  solutionTitle: {
    ja: '「地球の音マップ」が、\nすべてを繋ぎます。',
    en: '"Sounds of the Earth"\nconnects it all.',
    es: '"Sonidos de la Tierra"\nlo conecta todo.',
  },
  solutionText: {
    ja: 'GPS 座標 × 高品質フィールド録音。\n世界中の音を、リアルタイムの昼夜が描かれた地球儀の上で発見し、再生し、そして投稿する。\n空音開発のコアコンセプト「空と音」を体現する、唯一無二のプロジェクトです。',
    en: 'GPS coordinates × high-quality field recordings.\nDiscover, play, and contribute sounds on a globe with real-time day and night.\nA one-of-a-kind project embodying Kuon R&D\'s core concept: Sky & Sound.',
    es: 'Coordenadas GPS × grabaciones de campo de alta calidad.\nDescubre, reproduce y contribuye sonidos en un globo con día y noche en tiempo real.\nUn proyecto único que encarna el concepto de Kuon R&D: Cielo y Sonido.',
  },

  // Features
  feat1T: { ja: 'リアルタイム昼夜表現', en: 'Real-Time Day & Night', es: 'Día y Noche en Tiempo Real' },
  feat1D: {
    ja: '太陽の実際の位置を基に、地球儀上の明暗がリアルタイムで変化。今この瞬間、どこが朝で、どこが夜かがひと目でわかります。',
    en: 'Lighting on the globe changes in real-time based on the sun\'s actual position. See at a glance where it\'s morning and where it\'s night, right now.',
    es: 'La iluminación del globo cambia en tiempo real según la posición real del sol. Ve de un vistazo dónde es de mañana y dónde de noche.',
  },
  feat2T: { ja: 'Globe 投影', en: 'Globe Projection', es: 'Proyección de Globo' },
  feat2D: {
    ja: 'Mapbox GL JS のグローブ投影で、地球をそのまま表示。宇宙空間に浮かぶ地球儀を回しながら、音のスポットを探索できます。',
    en: 'Mapbox GL JS globe projection renders Earth as it is. Spin the floating globe and explore sound spots across continents.',
    es: 'La proyección de globo de Mapbox GL JS muestra la Tierra tal como es. Gira el globo flotante y explora spots de sonido.',
  },
  feat3T: { ja: '高品質フィールド録音', en: 'High-Quality Recordings', es: 'Grabaciones de Alta Calidad' },
  feat3D: {
    ja: '空音開発のマイクで録音された音源を中心に、世界中のレコーディストの作品を厳選掲載。圧縮ノイズのない、本物の音。',
    en: 'Curated recordings centered on Kuon R&D microphones. Genuine sounds without compression artifacts, from recordists worldwide.',
    es: 'Grabaciones curadas centradas en micrófonos Kuon R&D. Sonidos genuinos sin artefactos de compresión.',
  },
  feat4T: { ja: 'コミュニティ投稿', en: 'Community Contributions', es: 'Contribuciones de la Comunidad' },
  feat4D: {
    ja: 'あなたのフィールド録音を地球の音マップに追加しよう。座標と音声ファイルを送るだけ。レビュー後に世界に公開されます。',
    en: 'Add your field recording to the map. Just submit coordinates and an audio file. Published worldwide after review.',
    es: 'Añade tu grabación al mapa. Solo envía coordenadas y un archivo de audio. Se publica mundialmente tras revisión.',
  },
  feat5T: { ja: 'レコーディストの名刺', en: 'Recordist\'s Portfolio', es: 'Portafolio del Grabador' },
  feat5D: {
    ja: '投稿者のサイトやSNSへのリンクを掲載。あなたの録音作品が、世界中のリスナーとの出会いの入口になります。',
    en: 'Each submission can link to your website or social media. Your recordings become a gateway to listeners worldwide.',
    es: 'Cada envío enlaza a tu web o redes sociales. Tus grabaciones se convierten en puerta a oyentes de todo el mundo.',
  },
  feat6T: { ja: '完全無料 — 広告なし', en: 'Completely Free — No Ads', es: 'Completamente Gratis — Sin Anuncios' },
  feat6D: {
    ja: 'アカウント登録なしですべての音を聴ける。広告もデータ収集もなし。純粋に「音を聴く」ためだけの空間です。',
    en: 'Listen to everything without an account. No ads, no data collection. A space purely for listening.',
    es: 'Escucha todo sin cuenta. Sin anuncios, sin recolección de datos. Un espacio puro para escuchar.',
  },

  // Steps
  howTitle: { ja: '使い方', en: 'How It Works', es: 'Cómo Funciona' },
  step1T: { ja: '地球儀を回す', en: 'Spin the Globe', es: 'Gira el Globo' },
  step1D: { ja: '昼と夜がリアルタイムに描かれた地球儀を、指やマウスで自由に回転', en: 'Rotate the globe freely with real-time day and night rendered', es: 'Rota el globo con día y noche renderizados en tiempo real' },
  step2T: { ja: 'ピンをクリック', en: 'Click a Pin', es: 'Haz Clic en un Pin' },
  step2D: { ja: 'そこで録音された音が即座に再生される。場所の説明、使用マイクも表示', en: 'The sound recorded there plays immediately. Location details and microphone info shown', es: 'El sonido grabado se reproduce al instante. Detalles de ubicación y micrófono' },
  step3T: { ja: 'あなたの音を投稿', en: 'Submit Your Sound', es: 'Envía Tu Sonido' },
  step3D: { ja: '地図をクリックして座標を取得 → MP3ファイルと一緒に送信。レビュー後に世界へ公開', en: 'Click the map to get coordinates → submit with your MP3. Published worldwide after review', es: 'Haz clic en el mapa para coordenadas → envía con tu MP3. Publicado tras revisión' },

  // Personas
  personaTitle: { ja: 'こんな人のための地図', en: 'Who Is This For?', es: '¿Para Quién Es?' },
  p1T: { ja: 'フィールド録音家', en: 'Field Recordists', es: 'Grabadores de Campo' },
  p1D: { ja: '録音作品を世界に公開する場として。新しいリスナーとの出会いの入口に。', en: 'A platform to share your work with the world. A gateway to new listeners.', es: 'Una plataforma para compartir tu trabajo. Una puerta a nuevos oyentes.' },
  p2T: { ja: 'サウンドデザイナー', en: 'Sound Designers', es: 'Diseñadores de Sonido' },
  p2D: { ja: '映画、ゲーム、VR のための環境音リファレンス。地球規模の音のアーカイブ。', en: 'Ambient sound references for film, games, VR. A global sound archive.', es: 'Referencias de sonido para cine, juegos, VR. Un archivo sonoro global.' },
  p3T: { ja: '旅行者・自然愛好家', en: 'Travelers & Nature Lovers', es: 'Viajeros y Amantes de la Naturaleza' },
  p3D: { ja: '行ったことのない場所の音を聴く。次の旅先の音を、先に体験する。', en: 'Hear places you\'ve never been. Experience your next destination\'s soundscape in advance.', es: 'Escucha lugares que nunca visitaste. Experimenta tu próximo destino.' },
  p4T: { ja: '教育・研究者', en: 'Educators & Researchers', es: 'Educadores e Investigadores' },
  p4D: { ja: '生態学、地理学、音響学の教材として。地球規模の音響環境データベース。', en: 'Teaching material for ecology, geography, acoustics. A global soundscape database.', es: 'Material educativo para ecología, geografía, acústica.' },

  // CTA
  ctaTitle: {
    ja: '地球の音を、\n聴きに行こう。',
    en: 'Go listen to\nthe sounds of Earth.',
    es: 'Ve a escuchar\nlos sonidos de la Tierra.',
  },
  ctaSub: {
    ja: '世界のどこかに、あなたがまだ聴いたことのない音がある。',
    en: 'Somewhere in the world, there\'s a sound you haven\'t heard yet.',
    es: 'En algún lugar del mundo, hay un sonido que aún no has escuchado.',
  },
  ctaBtn: {
    ja: '地球の音マップを開く',
    en: 'Open Sounds of the Earth',
    es: 'Abrir Sonidos de la Tierra',
  },

  // Comparison
  compTitle: { ja: '他のサービスとの違い', en: 'How We Compare', es: 'Cómo Nos Comparamos' },
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function SoundMapLpPage() {
  const { lang } = useLang();
  const t = (key: string) => T[key]?.[lang] || T[key]?.ja || '';

  const features = [
    { n: '01', title: t('feat1T'), desc: t('feat1D') },
    { n: '02', title: t('feat2T'), desc: t('feat2D') },
    { n: '03', title: t('feat3T'), desc: t('feat3D') },
    { n: '04', title: t('feat4T'), desc: t('feat4D') },
    { n: '05', title: t('feat5T'), desc: t('feat5D') },
    { n: '06', title: t('feat6T'), desc: t('feat6D') },
  ];

  const steps = [
    { n: '01', title: t('step1T'), desc: t('step1D') },
    { n: '02', title: t('step2T'), desc: t('step2D') },
    { n: '03', title: t('step3T'), desc: t('step3D') },
  ];

  const personas = [
    { title: t('p1T'), desc: t('p1D') },
    { title: t('p2T'), desc: t('p2D') },
    { title: t('p3T'), desc: t('p3D') },
    { title: t('p4T'), desc: t('p4D') },
  ];

  type CompRow = { feature: L3; us: string; yt: string; fm: string };
  const compRows: CompRow[] = [
    { feature: { ja: '地図ベース探索', en: 'Map-based exploration', es: 'Exploración en mapa' }, us: '\u25CF', yt: '\u2014', fm: '\u25CB' },
    { feature: { ja: 'リアルタイム昼夜', en: 'Real-time day/night', es: 'Día/noche en tiempo real' }, us: '\u25CF', yt: '\u2014', fm: '\u2014' },
    { feature: { ja: 'Globe 投影', en: 'Globe projection', es: 'Proyección de globo' }, us: '\u25CF', yt: '\u2014', fm: '\u2014' },
    { feature: { ja: 'コミュニティ投稿', en: 'Community submissions', es: 'Contribuciones' }, us: '\u25CF', yt: '\u25CF', fm: '\u25CF' },
    { feature: { ja: 'サーバー送信なし', en: 'No server streaming', es: 'Sin streaming al servidor' }, us: '\u2014', yt: '\u2014', fm: '\u2014' },
    { feature: { ja: '完全無料', en: 'Completely free', es: 'Completamente gratis' }, us: '\u25CF', yt: '\u25CF', fm: '\u25CB' },
    { feature: { ja: '広告なし', en: 'No ads', es: 'Sin anuncios' }, us: '\u25CF', yt: '\u2014', fm: '\u25CF' },
    { feature: { ja: '投稿者ポートフォリオ', en: 'Recordist portfolio link', es: 'Enlace de portafolio' }, us: '\u25CF', yt: '\u2014', fm: '\u25CB' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(170deg, #fafaf8 0%, #f5f3ef 40%, #fafafa 100%)',
      color: '#1e293b',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: none; }
      ` }} />

      {/* ── Hero ── */}
      <section style={{
        padding: 'clamp(7rem,14vw,11rem) 5% clamp(3rem,6vw,5rem)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '0.62rem', letterSpacing: '0.5em', textTransform: 'uppercase',
          color: ACCENT, marginBottom: '2rem', fontFamily: sans,
        }}>
          Sounds of the Earth
        </p>

        <h1 style={{
          fontSize: 'clamp(1.8rem,5vw,3.2rem)', fontWeight: '200',
          letterSpacing: '0.08em', lineHeight: '1.7',
          fontFamily: serif, whiteSpace: 'pre-line',
          margin: '0 auto 1.5rem', maxWidth: '650px', wordBreak: 'keep-all',
        }}>
          {t('heroTitle')}
        </h1>

        <p style={{
          fontSize: 'clamp(0.82rem,1.2vw,0.95rem)', lineHeight: '2.2',
          color: '#666', fontFamily: sans,
          whiteSpace: 'pre-line', maxWidth: '580px', margin: '0 auto 3rem',
        }}>
          {t('heroSub')}
        </p>

        {/* Stats */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 'clamp(2rem,5vw,4rem)',
          marginBottom: '3rem',
        }}>
          {[['heroStat1', 'heroStat1Label'], ['heroStat2', 'heroStat2Label'], ['heroStat3', 'heroStat3Label']].map(([k, kl]) => (
            <div key={k}>
              <div style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: '200', color: ACCENT, fontFamily: sans }}>{t(k)}</div>
              <div style={{ fontSize: '0.65rem', color: '#999', letterSpacing: '0.12em', fontFamily: sans, marginTop: '4px' }}>{t(kl)}</div>
            </div>
          ))}
        </div>

        <Link href="/soundmap" style={{
          display: 'inline-block', textDecoration: 'none', color: '#fff', fontFamily: sans,
          background: `linear-gradient(135deg, #d4b98a, ${ACCENT})`,
          fontSize: 'clamp(0.85rem,1.2vw,0.95rem)', letterSpacing: '0.15em',
          padding: '1.1rem 3.5rem', borderRadius: '50px',
          boxShadow: '0 8px 32px rgba(189,166,120,0.3)',
          transition: 'all 0.3s ease',
        }}>
          {t('heroCta')}
        </Link>

        <p style={{ fontSize: '0.7rem', color: '#bbb', marginTop: '1.5rem', letterSpacing: '0.1em', fontFamily: sans }}>
          {t('heroFree')}
        </p>
      </section>

      {/* ── Pain points ── */}
      <Section style={{ maxWidth: '660px', margin: '0 auto', padding: '0 5%' }}>
        <h2 style={{
          textAlign: 'center', fontSize: 'clamp(1.3rem,3vw,2rem)', fontWeight: '200',
          fontFamily: serif, marginBottom: 'clamp(24px,4vw,40px)', letterSpacing: '0.06em',
          whiteSpace: 'pre-line', lineHeight: '1.7',
        }}>
          {t('problemTitle')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {['pain1', 'pain2', 'pain3', 'pain4'].map(k => (
            <div key={k} style={{ ...glass, display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: ACCENT, marginTop: '9px', flexShrink: 0 }} />
              <p style={{ fontSize: 'clamp(0.85rem,1.1vw,0.92rem)', lineHeight: '1.9', color: '#555', fontFamily: sans, margin: 0 }}>
                {t(k)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Solution ── */}
      <Section style={{ textAlign: 'center', padding: '0 5%' }}>
        <p style={{ fontSize: '0.62rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: ACCENT, marginBottom: '1.5rem', fontFamily: sans }}>
          Solution
        </p>
        <h2 style={{
          fontSize: 'clamp(1.3rem,3vw,2rem)', fontWeight: '200',
          fontFamily: serif, lineHeight: '1.7', whiteSpace: 'pre-line',
          maxWidth: '550px', margin: '0 auto 1.2rem', wordBreak: 'keep-all',
        }}>
          {t('solutionTitle')}
        </h2>
        <p style={{
          fontSize: 'clamp(0.82rem,1.1vw,0.92rem)', lineHeight: '2.2',
          color: '#666', fontFamily: sans, whiteSpace: 'pre-line',
          maxWidth: '560px', margin: '0 auto',
        }}>
          {t('solutionText')}
        </p>
      </Section>

      {/* ── Features ── */}
      <Section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 5%' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 'clamp(14px,2.5vw,20px)',
        }}>
          {features.map(f => (
            <div key={f.n} style={{
              ...glass, transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)'; }}
            >
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: ACCENT, fontFamily: sans }}>{f.n}</span>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, fontFamily: sans, margin: '8px 0', color: '#1e293b' }}>{f.title}</h3>
              <p style={{ fontSize: '0.8rem', lineHeight: '1.8', color: '#666', fontFamily: sans, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── How it works ── */}
      <Section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 5%' }}>
        <h2 style={{
          textAlign: 'center', fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', fontWeight: '200',
          fontFamily: serif, marginBottom: 'clamp(24px,5vw,44px)', letterSpacing: '0.06em',
        }}>
          {t('howTitle')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {steps.map(s => (
            <div key={s.n} style={{ ...glass, display: 'flex', alignItems: 'flex-start', gap: 'clamp(14px,3vw,24px)' }}>
              <div style={{
                fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: '200', color: ACCENT,
                fontFamily: sans, flexShrink: 0, lineHeight: 1, minWidth: '44px',
              }}>
                {s.n}
              </div>
              <div>
                <h3 style={{ fontSize: 'clamp(0.92rem,1.3vw,1.05rem)', fontWeight: 600, fontFamily: sans, margin: '0 0 4px', color: '#1e293b' }}>{s.title}</h3>
                <p style={{ fontSize: '0.82rem', color: '#666', fontFamily: sans, margin: 0, lineHeight: '1.8' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Comparison ── */}
      <Section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 5%' }}>
        <h2 style={{
          textAlign: 'center', fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', fontWeight: '200',
          fontFamily: serif, marginBottom: 'clamp(20px,4vw,36px)', letterSpacing: '0.06em',
        }}>
          {t('compTitle')}
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse', fontFamily: sans, fontSize: '0.78rem',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: 400, color: '#999' }}></th>
                <th style={{ padding: '12px 8px', fontWeight: 600, color: ACCENT, letterSpacing: '0.08em' }}>KUON</th>
                <th style={{ padding: '12px 8px', fontWeight: 400, color: '#999' }}>YouTube</th>
                <th style={{ padding: '12px 8px', fontWeight: 400, color: '#999' }}>Freesound</th>
              </tr>
            </thead>
            <tbody>
              {compRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ padding: '10px 8px', color: '#555' }}>{row.feature[lang]}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: row.us === '\u25CF' ? ACCENT : '#ccc' }}>{row.us}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: row.yt === '\u25CF' ? '#555' : '#ccc' }}>{row.yt}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: row.fm === '\u25CF' ? '#555' : '#ccc' }}>{row.fm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Personas ── */}
      <Section style={{ maxWidth: '800px', margin: '0 auto', padding: '0 5%' }}>
        <h2 style={{
          textAlign: 'center', fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', fontWeight: '200',
          fontFamily: serif, marginBottom: 'clamp(20px,4vw,36px)', letterSpacing: '0.06em',
        }}>
          {t('personaTitle')}
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 'clamp(12px,2vw,18px)',
        }}>
          {personas.map((p, i) => (
            <div key={i} style={{ ...glass, textAlign: 'center', padding: 'clamp(18px,3vw,26px)' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 600, fontFamily: sans, marginBottom: '6px', color: '#1e293b' }}>{p.title}</h3>
              <p style={{ fontSize: '0.78rem', lineHeight: '1.8', color: '#666', fontFamily: sans, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Final CTA ── */}
      <section style={{
        textAlign: 'center',
        padding: 'clamp(4rem,10vw,8rem) 5%',
        borderTop: '1px solid rgba(0,0,0,0.04)',
      }}>
        <h2 style={{
          fontSize: 'clamp(1.4rem,3.5vw,2.4rem)', fontWeight: '200',
          fontFamily: serif, lineHeight: '1.7', margin: '0 0 1rem',
          whiteSpace: 'pre-line', wordBreak: 'keep-all',
        }}>
          {t('ctaTitle')}
        </h2>
        <p style={{
          fontSize: 'clamp(0.85rem,1.2vw,0.95rem)', color: '#888',
          fontFamily: sans, margin: '0 0 2.5rem', lineHeight: '2',
        }}>
          {t('ctaSub')}
        </p>
        <Link href="/soundmap" style={{
          display: 'inline-block', textDecoration: 'none', color: '#fff', fontFamily: sans,
          background: `linear-gradient(135deg, #d4b98a, ${ACCENT})`,
          fontSize: 'clamp(0.9rem,1.3vw,1rem)', letterSpacing: '0.15em',
          padding: '1.2rem 3.5rem', borderRadius: '50px',
          boxShadow: '0 10px 40px rgba(189,166,120,0.3)', transition: 'all 0.3s ease',
        }}>
          {t('ctaBtn')}
        </Link>
        <p style={{ fontSize: '0.7rem', color: '#bbb', marginTop: '1.5rem', fontFamily: sans, letterSpacing: '0.1em' }}>
          {t('heroFree')}
        </p>
      </section>

      {/* ── JSON-LD ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Sounds of the Earth — 地球の音マップ',
        url: 'https://kuon-rnd.com/soundmap',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
        creator: { '@type': 'Organization', name: '空音開発 Kuon R&D', url: 'https://kuon-rnd.com' },
        description: 'Interactive world map of field recordings with real-time day/night. Listen to sounds from around the Earth. GPS × Audio by Kuon R&D.',
        featureList: 'Interactive globe, Real-time sun position, Field recording playback, Community contributions, GPS coordinates',
      }) }} />
    </div>
  );
}
