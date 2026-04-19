'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L5 = Partial<Record<Lang, string>> & { en: string };

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const ACCENT  = '#0284c7';
const ACCENT2 = '#38bdf8';
const WARM    = '#f97316';

// ─────────────────────────────────────────────
// useReveal
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
  return <section ref={ref} className="reveal" id={id} style={{ marginBottom: 'clamp(48px, 10vw, 80px)', ...style }}>{children}</section>;
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.8)',
  borderRadius: 16,
  padding: 'clamp(20px, 4vw, 32px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
};

const t = (m: L5, lang: Lang) => m[lang] ?? m.en;

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  heroTitle: {
    ja: '今夜、どこかで\n誰かが奏でている。',
    en: "Tonight, somewhere,\nsomeone is playing.",
    es: 'Esta noche, en algún lugar,\nalguien está tocando.',
  },
  heroSub: {
    ja: '世界中のライブ・コンサート・リサイタルを\n地図の上で見つけよう。',
    en: 'Discover live concerts, recitals & performances\non an interactive world map.',
    es: 'Descubre conciertos, recitales y presentaciones\nen un mapa interactivo del mundo.',
  },
  heroCta: {
    ja: 'イベントマップを開く',
    en: 'Open Event Map',
    es: 'Abrir Mapa de Eventos',
  },
  heroCtaSub: {
    ja: '会員登録不要・無料で閲覧',
    en: 'No sign-up required — free to browse',
    es: 'Sin registro — gratis para navegar',
  },

  // ── For Artists ──
  artistTitle: {
    ja: 'アーティストのあなたへ',
    en: 'For Artists & Performers',
    es: 'Para Artistas e Intérpretes',
  },
  artistSub: {
    ja: '演奏するだけで精一杯。集客まで手が回らない。\nそんな悩み、もう終わりにしませんか。',
    en: "You pour everything into your performance.\nLet us help the audience find you.",
    es: 'Pones todo en tu interpretación.\nDejanos ayudar a que el público te encuentre.',
  },
  artistBenefits: [
    {
      emoji: '📍',
      title: { ja: '地図上にあなたのライブを掲載', en: 'Pin your concert on the map', es: 'Fija tu concierto en el mapa' },
      desc: {
        ja: '会場名、日時、ジャンル、出演者を入力するだけ。世界中の音楽ファンの目に留まります。',
        en: 'Just enter the venue, date, genre & performers. Music fans worldwide will see it.',
        es: 'Solo ingresa el lugar, fecha, género y artistas. Fans de música en todo el mundo lo verán.',
      },
    },
    {
      emoji: '❤️',
      title: { ja: '「気になる」で集客の手応えを事前に把握', en: '"Interested" count shows demand before the show', es: '"Me interesa" muestra la demanda antes del show' },
      desc: {
        ja: '来場前からどれくらいの人が興味を持っているか見える。チケット販売や会場調整の判断材料に。',
        en: 'See how many people are interested before the event. Great for ticket planning & venue decisions.',
        es: 'Mira cuántas personas están interesadas antes del evento. Genial para planificar boletos y lugares.',
      },
    },
    {
      emoji: '🌏',
      title: { ja: '海外からの観客を取り込める', en: 'Reach international audiences', es: 'Llega a audiencias internacionales' },
      desc: {
        ja: '旅行中の音楽ファンが現地のコンサートを探す時代。5言語対応で、言語の壁を超えて発信。',
        en: 'Travelers search for local concerts. With 5 languages supported, your event crosses borders.',
        es: 'Los viajeros buscan conciertos locales. Con 5 idiomas, tu evento cruza fronteras.',
      },
    },
    {
      emoji: '📅',
      title: { ja: 'カレンダー連携でリマインド', en: 'iCal export reminds fans automatically', es: 'Exportación iCal recuerda a los fans automáticamente' },
      desc: {
        ja: 'ファンがワンクリックでGoogleカレンダーに追加。当日忘れずに来てもらえる仕組み。',
        en: 'Fans add your event to Google Calendar with one click. They never forget the day.',
        es: 'Los fans agregan tu evento a Google Calendar con un clic. Nunca olvidan el día.',
      },
    },
    {
      emoji: '🎵',
      title: { ja: '演奏履歴がポートフォリオになる', en: 'Your performance history becomes a portfolio', es: 'Tu historial de presentaciones se convierte en portafolio' },
      desc: {
        ja: '過去のイベントも全てアーカイブ。マイページから演奏経歴を一覧で確認・公開できます。',
        en: 'All past events are archived. View & share your performance history from your profile.',
        es: 'Todos los eventos pasados se archivan. Ve y comparte tu historial desde tu perfil.',
      },
    },
  ],
  artistCta: {
    ja: 'Pro プランに登録してイベントを投稿する',
    en: 'Sign up for Pro to post events',
    es: 'Regístrate en Pro para publicar eventos',
  },

  // ── For Fans ──
  fanTitle: {
    ja: '音楽ファンのあなたへ',
    en: 'For Music Fans',
    es: 'Para Fans de la Música',
  },
  fanSub: {
    ja: '「あの街に行くけど、コンサートないかな」\nそんな時、地図を開くだけ。',
    en: '"I\'m visiting that city — any concerts tonight?"\nJust open the map.',
    es: '"Voy a esa ciudad — ¿hay conciertos esta noche?"\nSolo abre el mapa.',
  },
  fanBenefits: [
    {
      emoji: '🗺️',
      title: { ja: '地図をスクロールするだけ', en: 'Just scroll the map', es: 'Solo desplaza el mapa' },
      desc: {
        ja: '旅先でも地元でも、近くのライブが一目でわかる。日付・ジャンル・タイプで絞り込み自由。',
        en: 'Whether traveling or local, nearby concerts are instantly visible. Filter by date, genre & type.',
        es: 'Ya sea viajando o local, los conciertos cercanos son visibles al instante. Filtra por fecha, género y tipo.',
      },
    },
    {
      emoji: '📱',
      title: { ja: 'スマホで完結', en: 'Works on your phone', es: 'Funciona en tu teléfono' },
      desc: {
        ja: 'レスポンシブ対応。歩きながらでも、電車の中でも、今夜のコンサートが見つかる。',
        en: 'Fully responsive. Find tonight\'s concert while walking or on the train.',
        es: 'Totalmente responsivo. Encuentra el concierto de esta noche mientras caminas o en el tren.',
      },
    },
    {
      emoji: '🎹',
      title: { ja: 'クラシックからジャズまで', en: 'From classical to jazz', es: 'Del clásico al jazz' },
      desc: {
        ja: '10ジャンル × 8タイプのフィルター。発表会も、フェスティバルも、ジャムセッションも。',
        en: '10 genres × 8 event types. From student recitals to festivals to jam sessions.',
        es: '10 géneros × 8 tipos de eventos. Desde recitales estudiantiles hasta festivales y jam sessions.',
      },
    },
    {
      emoji: '🔔',
      title: { ja: '「気になる」でブックマーク', en: '"Interested" to bookmark', es: '"Me interesa" para marcar' },
      desc: {
        ja: '気になるイベントにハートを押しておけば、マイページからいつでも確認。',
        en: 'Tap the heart on events you like. Check them anytime from your page.',
        es: 'Toca el corazón en los eventos que te gusten. Revísalos cuando quieras desde tu página.',
      },
    },
    {
      emoji: '🆓',
      title: { ja: '閲覧は完全無料', en: 'Browsing is 100% free', es: 'Navegar es 100% gratis' },
      desc: {
        ja: 'アカウント登録なしで地図の閲覧・検索・フィルタリングが可能。見るだけなら何も必要ありません。',
        en: 'Browse, search & filter the map without an account. No sign-up needed to discover events.',
        es: 'Navega, busca y filtra el mapa sin una cuenta. No necesitas registrarte para descubrir eventos.',
      },
    },
  ],
  fanCta: {
    ja: 'イベントマップを見る',
    en: 'Browse the Event Map',
    es: 'Ver el Mapa de Eventos',
  },

  // ── How it works ──
  howTitle: {
    ja: '仕組み',
    en: 'How It Works',
    es: 'Cómo Funciona',
  },
  steps: [
    {
      num: '01',
      title: { ja: 'アーティストがイベントを投稿', en: 'Artist posts an event', es: 'El artista publica un evento' },
      desc: {
        ja: 'Pro会員がマイページから会場・日時・ジャンル・出演者を入力。数秒で地図に反映。',
        en: 'Pro members enter venue, date, genre & performers from My Page. Appears on the map in seconds.',
        es: 'Los miembros Pro ingresan lugar, fecha, género y artistas desde Mi Página. Aparece en el mapa en segundos.',
      },
    },
    {
      num: '02',
      title: { ja: 'ファンが地図で発見', en: 'Fans discover on the map', es: 'Los fans descubren en el mapa' },
      desc: {
        ja: '世界地図をスクロール、フィルターで絞り込み。ピンをタップして詳細を確認。',
        en: 'Scroll the world map, filter by preference. Tap a pin for details.',
        es: 'Desplaza el mapa mundial, filtra por preferencia. Toca un pin para detalles.',
      },
    },
    {
      num: '03',
      title: { ja: '「気になる」で応援', en: '"Interested" to show support', es: '"Me interesa" para apoyar' },
      desc: {
        ja: 'ファンのハートがアーティストに届く。集客の可視化がモチベーションに。',
        en: "Fan hearts reach the artist. Visible demand becomes motivation.",
        es: 'Los corazones de los fans llegan al artista. La demanda visible se convierte en motivación.',
      },
    },
    {
      num: '04',
      title: { ja: 'カレンダーに追加 → 当日来場', en: 'Add to calendar → attend', es: 'Agregar al calendario → asistir' },
      desc: {
        ja: 'iCalエクスポートで忘れない。SNSシェアで友人も誘える。そして当日、会場で音楽を楽しむ。',
        en: 'iCal export so you never forget. Share on SNS to invite friends. Then enjoy the music live.',
        es: 'Exporta iCal para no olvidar. Comparte en redes para invitar amigos. Luego disfruta la música en vivo.',
      },
    },
  ],

  // ── Stats ──
  stat1: { ja: '8', en: '8', es: '8' },
  stat1l: { ja: 'イベントタイプ', en: 'Event Types', es: 'Tipos de Evento' },
  stat2: { ja: '10', en: '10', es: '10' },
  stat2l: { ja: '音楽ジャンル', en: 'Music Genres', es: 'Géneros Musicales' },
  stat3: { ja: '5', en: '5', es: '5' },
  stat3l: { ja: '対応言語', en: 'Languages', es: 'Idiomas' },

  // ── Final CTA ──
  finalTitle: {
    ja: '音楽は、出会いから始まる。',
    en: 'Music begins with connection.',
    es: 'La música comienza con conexión.',
  },
  finalSub: {
    ja: 'あなたの街の、今夜のコンサートを見つけよう。\nあなたの演奏を、世界に届けよう。',
    en: "Find tonight's concert in your city.\nShare your performance with the world.",
    es: 'Encuentra el concierto de esta noche en tu ciudad.\nComparte tu presentación con el mundo.',
  },
  finalCtaMap: {
    ja: 'イベントマップを開く',
    en: 'Open Event Map',
    es: 'Abrir Mapa de Eventos',
  },
  finalCtaPro: {
    ja: 'Pro登録してイベントを投稿',
    en: 'Go Pro & Post Events',
    es: 'Hazte Pro y publica eventos',
  },

  // ── Event Types showcase ──
  typesTitle: {
    ja: 'あらゆる音楽イベントに対応',
    en: 'Every kind of music event',
    es: 'Todo tipo de evento musical',
  },
};

const EVENT_TYPES_DISPLAY = [
  { emoji: '🎵', label: { ja: 'コンサート', en: 'Concert', es: 'Concierto' } },
  { emoji: '🎹', label: { ja: 'リサイタル', en: 'Recital', es: 'Recital' } },
  { emoji: '🎷', label: { ja: 'ジャムセッション', en: 'Jam Session', es: 'Jam Session' } },
  { emoji: '🎓', label: { ja: 'ワークショップ', en: 'Workshop', es: 'Taller' } },
  { emoji: '🎪', label: { ja: 'フェスティバル', en: 'Festival', es: 'Festival' } },
  { emoji: '🎓', label: { ja: '発表会', en: 'Student Recital', es: 'Audición' } },
  { emoji: '🎤', label: { ja: 'オープンマイク', en: 'Open Mic', es: 'Micrófono abierto' } },
  { emoji: '📌', label: { ja: 'その他', en: 'Other', es: 'Otro' } },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function EventsLPPage() {
  const { lang } = useLang();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(170deg, #f0f9ff 0%, #ffffff 30%, #fff7ed 60%, #f0f9ff 100%)',
      padding: '0 clamp(1rem, 4vw, 3rem)',
      fontFamily: sans,
      overflowX: 'hidden',
    }}>
      <style>{`
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.2,0.8,0.4,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ═══════════════════════════════════════
            HERO
        ═══════════════════════════════════════ */}
        <Section style={{ textAlign: 'center', paddingTop: 'clamp(3rem, 8vw, 5rem)' }}>
          {/* Floating music pins */}
          <div style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>
            🎵🗺️🎹
          </div>

          <h1 style={{
            fontFamily: serif, fontSize: 'clamp(1.6rem, 4.5vw, 2.6rem)',
            fontWeight: 400, color: '#111', lineHeight: 1.5,
            letterSpacing: '0.06em', whiteSpace: 'pre-line',
          }}>
            {t(T.heroTitle, lang)}
          </h1>

          <p style={{
            fontSize: 'clamp(0.85rem, 1.6vw, 1.05rem)', color: '#555',
            lineHeight: 1.9, marginTop: '1.5rem', whiteSpace: 'pre-line',
          }}>
            {t(T.heroSub, lang)}
          </p>

          {/* Stats bar */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 3rem)',
            marginTop: '2rem', flexWrap: 'wrap',
          }}>
            {[
              { v: T.stat1, l: T.stat1l },
              { v: T.stat2, l: T.stat2l },
              { v: T.stat3, l: T.stat3l },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: ACCENT, fontWeight: 300 }}>
                  {t(s.v, lang)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.1em', marginTop: 2 }}>
                  {t(s.l, lang)}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ marginTop: '2.5rem' }}>
            <Link href="/events" style={{
              display: 'inline-block', textDecoration: 'none',
              fontFamily: sans, fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
              color: '#fff', background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
              padding: '1rem 2.5rem', borderRadius: 999,
              fontWeight: 600, letterSpacing: '0.08em',
              boxShadow: `0 12px 36px rgba(2,132,199,0.35)`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              {t(T.heroCta, lang)}
            </Link>
            <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.6rem' }}>
              {t(T.heroCtaSub, lang)}
            </p>
          </div>
        </Section>

        {/* ═══════════════════════════════════════
            EVENT TYPES SHOWCASE
        ═══════════════════════════════════════ */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 400, color: '#111', textAlign: 'center', letterSpacing: '0.06em' }}>
            {t(T.typesTitle, lang)}
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '0.8rem', marginTop: '1.5rem',
          }}>
            {EVENT_TYPES_DISPLAY.map((et, i) => (
              <div key={i} style={{
                ...glass, textAlign: 'center', padding: '1rem 0.5rem',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{et.emoji}</div>
                <div style={{ fontFamily: sans, fontSize: '0.75rem', color: '#555', fontWeight: 500 }}>
                  {t(et.label, lang)}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════════════════════════════════════
            FOR ARTISTS
        ═══════════════════════════════════════ */}
        <Section>
          <div style={{
            ...glass,
            background: 'linear-gradient(135deg, rgba(2,132,199,0.05), rgba(249,115,22,0.04))',
            border: `1px solid rgba(2,132,199,0.12)`,
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{
                display: 'inline-block', fontFamily: sans, fontSize: '0.7rem',
                color: WARM, background: 'rgba(249,115,22,0.08)', padding: '4px 14px',
                borderRadius: 20, fontWeight: 600, letterSpacing: '0.1em', marginBottom: '0.8rem',
              }}>
                FOR ARTISTS
              </span>
              <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem, 3vw, 1.7rem)', fontWeight: 400, color: '#111', letterSpacing: '0.06em' }}>
                {t(T.artistTitle, lang)}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.8, marginTop: '0.8rem', whiteSpace: 'pre-line' }}>
                {t(T.artistSub, lang)}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {T.artistBenefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '1.5rem', flexShrink: 0,
                    width: 48, height: 48, borderRadius: '50%',
                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    {b.emoji}
                  </span>
                  <div>
                    <h3 style={{ fontFamily: sans, fontSize: '0.9rem', fontWeight: 600, color: '#222', margin: '0 0 0.3rem 0' }}>
                      {t(b.title, lang)}
                    </h3>
                    <p style={{ fontFamily: sans, fontSize: '0.82rem', color: '#666', lineHeight: 1.7, margin: 0 }}>
                      {t(b.desc, lang)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/auth/login" style={{
                display: 'inline-block', textDecoration: 'none',
                fontFamily: sans, fontSize: '0.9rem', fontWeight: 600,
                color: '#fff', background: `linear-gradient(135deg, ${WARM}, #fb923c)`,
                padding: '0.9rem 2.2rem', borderRadius: 999, letterSpacing: '0.06em',
                boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
              }}>
                {t(T.artistCta, lang)}
              </Link>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════
            FOR FANS
        ═══════════════════════════════════════ */}
        <Section>
          <div style={{
            ...glass,
            background: 'linear-gradient(135deg, rgba(2,132,199,0.04), rgba(56,189,248,0.04))',
            border: `1px solid rgba(2,132,199,0.1)`,
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{
                display: 'inline-block', fontFamily: sans, fontSize: '0.7rem',
                color: ACCENT, background: 'rgba(2,132,199,0.08)', padding: '4px 14px',
                borderRadius: 20, fontWeight: 600, letterSpacing: '0.1em', marginBottom: '0.8rem',
              }}>
                FOR FANS
              </span>
              <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem, 3vw, 1.7rem)', fontWeight: 400, color: '#111', letterSpacing: '0.06em' }}>
                {t(T.fanTitle, lang)}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.8, marginTop: '0.8rem', whiteSpace: 'pre-line' }}>
                {t(T.fanSub, lang)}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {T.fanBenefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '1.5rem', flexShrink: 0,
                    width: 48, height: 48, borderRadius: '50%',
                    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    {b.emoji}
                  </span>
                  <div>
                    <h3 style={{ fontFamily: sans, fontSize: '0.9rem', fontWeight: 600, color: '#222', margin: '0 0 0.3rem 0' }}>
                      {t(b.title, lang)}
                    </h3>
                    <p style={{ fontFamily: sans, fontSize: '0.82rem', color: '#666', lineHeight: 1.7, margin: 0 }}>
                      {t(b.desc, lang)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link href="/events" style={{
                display: 'inline-block', textDecoration: 'none',
                fontFamily: sans, fontSize: '0.9rem', fontWeight: 600,
                color: '#fff', background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                padding: '0.9rem 2.2rem', borderRadius: 999, letterSpacing: '0.06em',
                boxShadow: `0 8px 24px rgba(2,132,199,0.3)`,
              }}>
                {t(T.fanCta, lang)}
              </Link>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════ */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 400, color: '#111', textAlign: 'center', letterSpacing: '0.06em', marginBottom: '2rem' }}>
            {t(T.howTitle, lang)}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {T.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                <div style={{
                  fontFamily: serif, fontSize: '1.8rem', color: ACCENT, fontWeight: 300,
                  lineHeight: 1, flexShrink: 0, width: 48,
                  opacity: 0.6,
                }}>
                  {step.num}
                </div>
                <div>
                  <h3 style={{ fontFamily: sans, fontSize: '0.95rem', fontWeight: 600, color: '#222', margin: '0 0 0.3rem 0' }}>
                    {t(step.title, lang)}
                  </h3>
                  <p style={{ fontFamily: sans, fontSize: '0.82rem', color: '#666', lineHeight: 1.7, margin: 0 }}>
                    {t(step.desc, lang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════════════════════════════════════
            WIN-WIN DIAGRAM
        ═══════════════════════════════════════ */}
        <Section>
          <div style={{
            ...glass, textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.03), rgba(2,132,199,0.03))',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 'clamp(0.8rem, 2vw, 1.5rem)', flexWrap: 'wrap',
            }}>
              {/* Artist */}
              <div style={{
                background: 'rgba(249,115,22,0.08)', borderRadius: 12, padding: '1.2rem 1.5rem',
                minWidth: 160,
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🎵</div>
                <div style={{ fontFamily: sans, fontSize: '0.8rem', fontWeight: 600, color: WARM }}>
                  {t({ ja: 'アーティスト', en: 'Artist', es: 'Artista' }, lang)}
                </div>
                <div style={{ fontFamily: sans, fontSize: '0.7rem', color: '#888', marginTop: '0.3rem', lineHeight: 1.6 }}>
                  {t({ ja: '無料で集客\n演奏履歴の蓄積\n海外ファンへの発信', en: 'Free promotion\nPerformance archive\nReach global fans', es: 'Promoción gratuita\nArchivo de actuaciones\nAlcance global' }, lang)}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: '1.5rem', color: '#ccc' }}>⇄</div>

              {/* Platform */}
              <div style={{
                background: `linear-gradient(135deg, rgba(2,132,199,0.08), rgba(249,115,22,0.05))`,
                borderRadius: 12, padding: '1.2rem 1.5rem', minWidth: 160,
                border: `1px solid rgba(2,132,199,0.15)`,
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🗺️</div>
                <div style={{ fontFamily: sans, fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>
                  {t({ ja: "Today's Live", en: "Today's Live", es: "Today's Live" }, lang)}
                </div>
                <div style={{ fontFamily: sans, fontSize: '0.65rem', color: ACCENT, marginTop: '0.2rem' }}>
                  by 空音開発
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: '1.5rem', color: '#ccc' }}>⇄</div>

              {/* Fan */}
              <div style={{
                background: 'rgba(2,132,199,0.08)', borderRadius: 12, padding: '1.2rem 1.5rem',
                minWidth: 160,
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🎧</div>
                <div style={{ fontFamily: sans, fontSize: '0.8rem', fontWeight: 600, color: ACCENT }}>
                  {t({ ja: '音楽ファン', en: 'Music Fan', es: 'Fan de Música' }, lang)}
                </div>
                <div style={{ fontFamily: sans, fontSize: '0.7rem', color: '#888', marginTop: '0.3rem', lineHeight: 1.6 }}>
                  {t({ ja: 'どこでもライブ発見\nジャンル絞り込み\nカレンダー連携', en: 'Discover live music anywhere\nFilter by genre\nCalendar sync', es: 'Descubre música en vivo\nFiltra por género\nSincroniza calendario' }, lang)}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════ */}
        <Section style={{ textAlign: 'center', paddingBottom: 'clamp(3rem, 8vw, 5rem)' }}>
          <h2 style={{
            fontFamily: serif, fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
            fontWeight: 400, color: '#111', letterSpacing: '0.06em',
          }}>
            {t(T.finalTitle, lang)}
          </h2>
          <p style={{
            fontSize: '0.9rem', color: '#666', lineHeight: 1.9,
            marginTop: '1rem', whiteSpace: 'pre-line',
          }}>
            {t(T.finalSub, lang)}
          </p>

          <div style={{
            display: 'flex', gap: '1rem', justifyContent: 'center',
            marginTop: '2rem', flexWrap: 'wrap',
          }}>
            <Link href="/events" style={{
              display: 'inline-block', textDecoration: 'none',
              fontFamily: sans, fontSize: '0.9rem', fontWeight: 600,
              color: '#fff', background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
              padding: '1rem 2.2rem', borderRadius: 999, letterSpacing: '0.06em',
              boxShadow: `0 12px 36px rgba(2,132,199,0.35)`,
            }}>
              {t(T.finalCtaMap, lang)}
            </Link>
            <Link href="/auth/login" style={{
              display: 'inline-block', textDecoration: 'none',
              fontFamily: sans, fontSize: '0.9rem', fontWeight: 600,
              color: WARM, background: 'transparent',
              padding: '1rem 2.2rem', borderRadius: 999, letterSpacing: '0.06em',
              border: `2px solid ${WARM}`,
            }}>
              {t(T.finalCtaPro, lang)}
            </Link>
          </div>

          {/* Powered by */}
          <div style={{ marginTop: '3rem' }}>
            <span style={{ fontFamily: serif, fontSize: '0.75rem', color: '#bbb', letterSpacing: '0.15em' }}>
              空音開発 Kuon R&amp;D
            </span>
          </div>
        </Section>

      </div>
    </div>
  );
}
