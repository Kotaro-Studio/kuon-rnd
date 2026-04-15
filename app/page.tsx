"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Typography / Colors
// ─────────────────────────────────────────────
const serif = '"Shippori Mincho", "Noto Serif JP", "Yu Mincho", "YuMincho", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';

// ─────────────────────────────────────────────
// i18n content
// ─────────────────────────────────────────────
type LinkItem = { url: string; text: string };
type TechCard = {
  image: string;
  title: string;
  tag: string;
  description: React.ReactNode;
  links: LinkItem[];
};

type SiteContent = {
  hero: {
    title: string;
    subtitle: string;
    description: React.ReactNode;
  };
  vision: {
    sectionTitle: string;
    title: string;
    quote: string;
    text: React.ReactNode;
    profileCta: string;
  };
  technology: {
    sectionTitle: string;
    title: string;
    cards: TechCard[];
    detailText: string;
  };
  contact: {
    sectionTitle: string;
    title: string;
    desc: React.ReactNode;
    form: { name: string; email: string; message: string; submit: string };
  };
};

const siteContent: Record<Lang, SiteContent> = {
  ja: {
    hero: {
      title: '芸術と科学の融合',
      subtitle: '形なきものに意味を与え、「空」の中に在る存在を創造する',
      description: (
        <>
          Revoxのレストア技術、GPSによる精密な時空解析<br />
          そして最新のWebエッジテクノロジー<br />
          音響工学・Web・GPSアルゴリズムが描く、未来の研究開発スタジオ
        </>
      ),
    },
    vision: {
      sectionTitle: 'Vision',
      title: '空音開発',
      quote: '芸術は「空」であり、技術は「色」を創る',
      text: (
        <>
          「空音（くおん）」という名は、仏教用語の「久遠（永続）」と「空（形なき存在）」に由来します。<br />
          音は波であり、GPSは空からの情報です。<br />
          それぞれ実体はなくとも、これらは世界を少しだけ美しく、少しだけ生きやすくするためのこの世界の重要なシステムの一部で在ると言えます。<br />
          <br />
          音楽家:朝比奈幸太郎がたくさんの巨匠から受け継いだ技術と哲学を結集し、 空の中、そして意味のないもの（芸術）に意味を生み出すため、『空即是色』の世界を提供する異端の研究開発スタジオです。
        </>
      ),
      profileCta: '朝比奈幸太郎 プロフィール詳細',
    },
    technology: {
      sectionTitle: 'Technology',
      title: '芸術と科学の、交差点。',
      cards: [
        {
          image: '/audio.png',
          title: 'Audio Engineering',
          tag: '純粋アナログと叡智の継承',
          description: (
            <>
              無指向性マイクを厳選されたパーツとハンダ技術で一本一本手作りで制作。<br /><br />
              バーチ材を用いた密閉型スピーカー、選び抜かれたコンデンサーを惜しみなく投入したアンプ設計。<br /><br />
              <strong>Revox Restoring:</strong> また、人類が到達した最高峰のマスターレコーダーRevoxの叡智を、次世代に繋ぐ使命としてレストアを行っています。
            </>
          ),
          links: [
            { url: '/microphone', text: '無指向性マイクの哲学' },
            { url: '/revox',      text: 'Revox レストアの哲学' },
          ],
        },
        {
          image: '/gps.png',
          title: 'GPS Algorithm',
          tag: '時空解析と社会実装',
          description: (
            <>
              株式会社ジオセンス・小林一英氏より学んだC言語を駆使し、通常の測位に加え、センチメートル級の精度を誇るRTK測位プログラムを開発。<br /><br />
              善意の基地局も準備中です。<br /><br />
              <strong>ペット探偵業界への提供:</strong> 空間と時間の交差点を解析する技術を、実社会の課題解決（ペット探偵システムの開発）に提供しています。
            </>
          ),
          links: [
            { url: '/gps',            text: 'GPSテクノロジーの哲学' },
            { url: '/gps#gps-tools',  text: 'オープンGPSツール群' },
          ],
        },
        {
          image: '/web.png',
          title: 'Program Development',
          tag: '技術を統合する、知的なアプリ',
          description: (
            <>
              空音開発が設計するEQパラメータの自動添付や、初心者の音声編集を自動化するアプリを開発。<br /><br />
              オーディオとGPSの技術を有機的に統合します。<br /><br />
              <strong>Web Technology:</strong> また、ウェブ開発においては、WordPressを使わない、Headless CMSやエッジコンピューティングといった最新のWeb技術を用いて、超高速でセキュアなWebサイトを提供します。
            </>
          ),
          links: [{ url: '/web', text: 'Web・アプリ開発の哲学' }],
        },
      ],
      detailText: '詳細を見る',
    },
    contact: {
      sectionTitle: 'Contact',
      title: 'さあ、一緒にプロジェクトを、始めよう',
      desc: (
        <>金田式DC録音コンサルティング、GPSシステムの導入、最新Webエッジインフラの構築など、<br />技術と芸術に関するご相談はこちらから。</>
      ),
      form: { name: 'お名前', email: 'メールアドレス', message: 'お問い合わせ内容', submit: 'メッセージを送る' },
    },
  },
  en: {
    hero: {
      title: 'Fusion of Art and Science',
      subtitle: "Giving meaning to the formless, creating existence within 'Emptiness'",
      description: (
        <>
          Revox restoration technology, precise space-time analysis via GPS<br />
          and cutting-edge Web Edge technology.<br />
          A future R&amp;D studio drawn by acoustic engineering, Web, and GPS algorithms.
        </>
      ),
    },
    vision: {
      sectionTitle: 'Vision',
      title: 'Kuon R&D',
      quote: "Art is 'Emptiness', Technology creates 'Form'",
      text: (
        <>
          The name &ldquo;Kuon&rdquo; is derived from the Buddhist terms &ldquo;Kuon&rdquo; (eternity) and &ldquo;Ku&rdquo; (formless existence).<br />
          Sound is a wave, and GPS is information from the sky.<br />
          Although neither has physical substance, they are essential parts of this world&apos;s systems that make it a little more beautiful and a little easier to live in.<br />
          <br />
          Bringing together the technology and philosophy inherited from many masters by musician Kotaro Asahina, we are a unique R&amp;D studio providing a world of &ldquo;Ku-soku-ze-shiki&rdquo; (Form is Emptiness) to breathe meaning into the emptiness and the meaningless (art).
        </>
      ),
      profileCta: 'About Kotaro Asahina',
    },
    technology: {
      sectionTitle: 'Technology',
      title: 'The Intersection of Art and Science.',
      cards: [
        {
          image: '/audio.png',
          title: 'Audio Engineering',
          tag: 'Pure Analog & Inheritance of Wisdom',
          description: (
            <>
              Omnidirectional microphones handcrafted one by one with carefully selected parts and soldering techniques.<br /><br />
              Amplifier design generously utilizing birch wood sealed speakers and carefully selected capacitors.<br /><br />
              <strong>Revox Restoring:</strong> We also restore Revox, the pinnacle of master recorders reached by humanity, as our mission to pass its wisdom to the next generation.
            </>
          ),
          links: [
            { url: '/microphone', text: 'Philosophy of Omnidirectional Mic' },
            { url: '/revox',      text: 'Philosophy of Revox Restoration' },
          ],
        },
        {
          image: '/gps.png',
          title: 'GPS Algorithm',
          tag: 'Space-Time Analysis & Social Implementation',
          description: (
            <>
              Utilizing C language learned from Mr. Kazuhide Kobayashi of Geosense Inc., we develop RTK positioning programs boasting centimeter-level accuracy.<br /><br />
              Voluntary base stations are also in preparation.<br /><br />
              <strong>Provision to Pet Detectives:</strong> We provide technology that analyzes the intersection of space and time to solve real-world issues (development of pet detective systems).
            </>
          ),
          links: [
            { url: '/gps',           text: 'Philosophy of GPS Technology' },
            { url: '/gps#gps-tools', text: 'Open GPS Tools' },
          ],
        },
        {
          image: '/web.png',
          title: 'Program Development',
          tag: 'Intelligent Apps Integrating Technology',
          description: (
            <>
              Developing apps that automate audio editing for beginners and automatically attach EQ parameters designed by Kuon R&amp;D.<br /><br />
              Organically integrating audio and GPS technologies.<br /><br />
              <strong>Web Technology:</strong> In web development, we provide ultra-fast and secure websites using the latest web technologies such as Headless CMS and edge computing, without using WordPress.
            </>
          ),
          links: [{ url: '/web', text: 'Philosophy of Web/App Development' }],
        },
      ],
      detailText: 'View Details',
    },
    contact: {
      sectionTitle: 'Contact',
      title: "Let's start a project together",
      desc: (
        <>Kaneda-style DC recording consulting, GPS system introduction, construction of the latest Web edge infrastructure, etc.<br />Please contact us here for consultations regarding technology and art.</>
      ),
      form: { name: 'Name', email: 'Email Address', message: 'Message', submit: 'Send Message' },
    },
  },
  es: {
    hero: {
      title: 'Fusión de Arte y Ciencia',
      subtitle: 'Dar sentido a lo informe, crear existencia dentro del «Vacío»',
      description: (
        <>
          Restauración de equipos Revox, análisis espacio-temporal preciso mediante GPS<br />
          y tecnología Edge de vanguardia para la Web.<br />
          Un estudio de I+D del futuro que integra ingeniería acústica, Web y algoritmos GPS.
        </>
      ),
    },
    vision: {
      sectionTitle: 'Vision',
      title: 'Kuon R&D',
      quote: 'El arte es «Vacío»; la tecnología crea «Forma»',
      text: (
        <>
          El nombre «Kuon» proviene de los términos budistas «Kuon» (eternidad) y «Ku» (existencia sin forma).<br />
          El sonido es una onda y el GPS es información que proviene del cielo.<br />
          Aunque ninguno tenga sustancia física, ambos son partes esenciales de los sistemas del mundo que lo hacen un poco más bello y un poco más habitable.<br />
          <br />
          Reuniendo la técnica y la filosofía heredadas de muchos maestros por el músico Kotaro Asahina, somos un estudio de I+D singular que ofrece el mundo del «Ku-soku-ze-shiki» (la forma es vacío) para dar sentido al vacío y a lo que no lo tiene: el arte.
        </>
      ),
      profileCta: 'Perfil de Kotaro Asahina',
    },
    technology: {
      sectionTitle: 'Technology',
      title: 'La intersección del arte y la ciencia.',
      cards: [
        {
          image: '/audio.png',
          title: 'Audio Engineering',
          tag: 'Analógico puro y legado del saber',
          description: (
            <>
              Micrófonos omnidireccionales hechos a mano, uno a uno, con piezas cuidadosamente seleccionadas y técnicas de soldadura refinadas.<br /><br />
              Diseño de amplificadores con altavoces sellados de madera de abedul y condensadores seleccionados sin reservas.<br /><br />
              <strong>Revox Restoring:</strong> También restauramos Revox, la cima de los grabadores maestros alcanzada por la humanidad, como misión para transmitir su sabiduría a la próxima generación.
            </>
          ),
          links: [
            { url: '/microphone', text: 'Filosofía del micrófono omnidireccional' },
            { url: '/revox',      text: 'Filosofía de la restauración Revox' },
          ],
        },
        {
          image: '/gps.png',
          title: 'GPS Algorithm',
          tag: 'Análisis espacio-temporal e implementación social',
          description: (
            <>
              Utilizando el lenguaje C aprendido del Sr. Kazuhide Kobayashi de Geosense Inc., desarrollamos programas de posicionamiento RTK con precisión centimétrica.<br /><br />
              También preparamos estaciones base voluntarias.<br /><br />
              <strong>Servicio a detectives de mascotas:</strong> Ofrecemos tecnología que analiza la intersección del espacio y el tiempo para resolver problemas reales (desarrollo de sistemas de detectives de mascotas).
            </>
          ),
          links: [
            { url: '/gps',           text: 'Filosofía de la tecnología GPS' },
            { url: '/gps#gps-tools', text: 'Herramientas GPS abiertas' },
          ],
        },
        {
          image: '/web.png',
          title: 'Program Development',
          tag: 'Aplicaciones inteligentes que integran tecnologías',
          description: (
            <>
              Desarrollamos aplicaciones que automatizan la edición de audio para principiantes y añaden parámetros de EQ diseñados por Kuon R&amp;D.<br /><br />
              Integrando orgánicamente audio y GPS.<br /><br />
              <strong>Web Technology:</strong> En desarrollo web ofrecemos sitios ultrarrápidos y seguros usando las últimas tecnologías: Headless CMS y Edge Computing, sin WordPress.
            </>
          ),
          links: [{ url: '/web', text: 'Filosofía del desarrollo Web/App' }],
        },
      ],
      detailText: 'Ver detalles',
    },
    contact: {
      sectionTitle: 'Contact',
      title: 'Empecemos un proyecto juntos',
      desc: (
        <>Consultoría de grabación DC estilo Kaneda, introducción de sistemas GPS, construcción de infraestructura web Edge de última generación, y más.<br />Consultas sobre tecnología y arte aquí.</>
      ),
      form: { name: 'Nombre', email: 'Correo electrónico', message: 'Mensaje', submit: 'Enviar mensaje' },
    },
  },
};

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function Home() {
  const { lang } = useLang();
  const t = siteContent[lang];

  return (
    <div style={{
      padding: '0 clamp(1.25rem, 5vw, 3rem)',
      fontFamily: serif,
      color: '#1a1a1a',
      backgroundColor: '#fafafa',
      overflowX: 'hidden',
    }}>

      {/* ══════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(5rem, 14vw, 12rem) 0 clamp(4rem, 12vw, 10rem) 0',
        textAlign: 'center', position: 'relative',
      }}>
        <div
          aria-hidden
          style={{
            position: 'absolute', top: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '100vw', height: '100%',
            background: 'radial-gradient(circle at center top, rgba(2,132,199,0.05) 0%, rgba(250,250,250,0) 70%)',
            zIndex: -1, pointerEvents: 'none',
          }}
        />

        <h2 style={{
          fontSize: 'clamp(1.4rem, 4.5vw, 2.8rem)',
          fontWeight: 300,
          letterSpacing: 'clamp(0.2em, 0.4em, 0.4em)',
          lineHeight: 1.6,
          margin: '0 0 clamp(1.75rem, 3vw, 2.5rem) 0',
          color: '#111',
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
        }}>
          {t.hero.title}
        </h2>

        <p style={{
          color: 'var(--accent, #0284c7)',
          fontSize: 'clamp(0.88rem, 1.6vw, 1.1rem)',
          fontWeight: 400,
          letterSpacing: '0.18em',
          marginBottom: 'clamp(2rem, 4vw, 3rem)',
          lineHeight: 1.7,
          wordBreak: 'keep-all',
        }}>
          {t.hero.subtitle}
        </p>

        <p style={{
          maxWidth: '750px',
          margin: '0 auto',
          padding: '0 clamp(0rem, 2vw, 1rem)',
          color: '#555',
          fontSize: 'clamp(0.85rem, 1.3vw, 0.95rem)',
          lineHeight: 2.2,
          letterSpacing: '0.08em',
          fontFamily: sans,
        }}>
          {t.hero.description}
        </p>
      </section>

      {/* ══════════════════════════════════════════
          2. VISION
      ══════════════════════════════════════════ */}
      <section id="vision" style={{
        padding: 'clamp(4rem, 10vw, 8rem) 0',
        borderTop: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 7vw, 6rem)' }}>
          <h3 style={{
            fontSize: '0.78rem', fontWeight: 400, color: '#888',
            letterSpacing: '0.32em', textTransform: 'uppercase',
            marginBottom: '1.5rem', fontFamily: sans,
          }}>
            {t.vision.sectionTitle}
          </h3>
          <h4 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 300, letterSpacing: '0.2em', margin: 0, color: '#222',
          }}>
            {t.vision.title}
          </h4>
        </div>

        <div style={{
          display: 'flex', flexWrap: 'wrap',
          gap: 'clamp(2rem, 5vw, 5rem)',
          alignItems: 'flex-start', justifyContent: 'center',
          maxWidth: '1000px', margin: '0 auto',
        }}>
          <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
            <div style={{
              padding: '10px', border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: '50%', display: 'inline-block',
            }}>
              <Image
                src="/kotaro.jpeg"
                alt="Kotaro Asahina"
                width={180}
                height={180}
                unoptimized
                style={{
                  borderRadius: '50%', objectFit: 'cover',
                  filter: 'grayscale(20%) contrast(1.1)',
                  width: 'clamp(130px, 18vw, 180px)',
                  height: 'clamp(130px, 18vw, 180px)',
                  display: 'block',
                }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 300px', minWidth: 'min(100%, 280px)' }}>
            <p style={{
              fontSize: 'clamp(1.15rem, 2.6vw, 1.6rem)',
              fontWeight: 300,
              letterSpacing: '0.12em',
              lineHeight: 1.9,
              margin: '0 0 clamp(1.5rem, 3vw, 2.5rem) 0',
              color: '#222',
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
            }}>
              {t.vision.quote}
            </p>
            <div style={{
              color: '#555',
              fontSize: 'clamp(0.85rem, 1.3vw, 0.95rem)',
              lineHeight: 2.2,
              letterSpacing: '0.06em',
              fontFamily: sans,
            }}>
              {t.vision.text}
            </div>

            <div style={{ marginTop: 'clamp(2rem, 4vw, 3rem)' }}>
              <Link
                href="/profile"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '1rem',
                  padding: 'clamp(0.9rem, 1.5vw, 1rem) clamp(1.5rem, 3vw, 2.5rem)',
                  backgroundColor: '#111', color: '#fff',
                  fontSize: 'clamp(0.78rem, 1.1vw, 0.85rem)',
                  letterSpacing: '0.15em',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: sans, borderRadius: '2px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent, #0284c7)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(2,132,199,0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#111';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>{t.vision.profileCta}</span>
                <span style={{ fontSize: '1.2em' }}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. TECHNOLOGY
      ══════════════════════════════════════════ */}
      <section id="technology" style={{
        padding: 'clamp(4rem, 10vw, 8rem) 0',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 7vw, 6rem)' }}>
          <h3 style={{
            fontSize: '0.78rem', fontWeight: 400, color: '#888',
            letterSpacing: '0.32em', textTransform: 'uppercase',
            marginBottom: '1.5rem', fontFamily: sans,
          }}>
            {t.technology.sectionTitle}
          </h3>
          <h4 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 300, letterSpacing: '0.2em', margin: 0, color: '#222',
          }}>
            {t.technology.title}
          </h4>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(1.25rem, 3vw, 3rem)',
          maxWidth: '1200px', margin: '0 auto',
        }}>
          {t.technology.cards.map((card, index) => (
            <div
              key={index}
              style={{
                padding: 'clamp(1.5rem, 3.5vw, 3rem)',
                backgroundColor: '#fff',
                border: '1px solid rgba(0,0,0,0.03)',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.02)',
                display: 'flex', flexDirection: 'column',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.02)';
              }}
            >
              <div style={{
                position: 'relative', width: '100%',
                height: 'clamp(150px, 22vw, 200px)',
                marginBottom: 'clamp(1.25rem, 2.5vw, 2rem)',
                overflow: 'hidden',
              }}>
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  style={{ objectFit: 'cover', filter: 'grayscale(30%) contrast(0.95)' }}
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>

              <span style={{
                alignSelf: 'flex-start',
                fontSize: '0.7rem',
                color: 'var(--accent, #0284c7)',
                borderBottom: '1px solid var(--accent, #0284c7)',
                paddingBottom: '0.3rem',
                marginBottom: '1.5rem',
                letterSpacing: '0.1em',
                fontFamily: sans,
              }}>
                {card.tag}
              </span>

              <h3 style={{
                fontSize: 'clamp(1.2rem, 2vw, 1.4rem)',
                fontWeight: 400,
                margin: '0 0 1.5rem 0',
                letterSpacing: '0.15em',
                color: '#111',
              }}>
                {card.title}
              </h3>

              <div style={{
                color: '#666',
                fontSize: 'clamp(0.82rem, 1.1vw, 0.9rem)',
                lineHeight: 2.1,
                margin: 0, flex: 1,
                fontFamily: sans,
              }}>
                {card.description}
              </div>

              {card.links && (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                  marginTop: 'clamp(1.75rem, 3vw, 2.5rem)',
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  paddingTop: 'clamp(1.5rem, 3vw, 2rem)',
                }}>
                  {card.links.map((link, i) => (
                    <Link
                      key={i}
                      href={link.url}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: 'clamp(0.85rem, 1.5vw, 1rem) clamp(1rem, 2vw, 1.5rem)',
                        backgroundColor: '#fafafa',
                        border: '1px solid #eaeaea',
                        color: '#222',
                        fontWeight: 500,
                        fontSize: 'clamp(0.78rem, 1.1vw, 0.85rem)',
                        letterSpacing: '0.05em',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        fontFamily: sans,
                        gap: '0.5rem',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.borderColor = 'var(--accent, #0284c7)';
                        e.currentTarget.style.boxShadow = '0 8px 15px -5px rgba(2,132,199,0.2)';
                        e.currentTarget.style.color = 'var(--accent, #0284c7)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#fafafa';
                        e.currentTarget.style.borderColor = '#eaeaea';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.color = '#222';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.text}</span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 'bold',
                        color: 'inherit',
                        letterSpacing: '0.1em',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {t.technology.detailText} <span style={{ fontSize: '1.2em', verticalAlign: 'middle' }}>→</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. CONTACT
      ══════════════════════════════════════════ */}
      <section id="contact" style={{
        padding: 'clamp(4rem, 10vw, 8rem) 0',
        textAlign: 'center',
      }}>
        <h3 style={{
          fontSize: '0.78rem', fontWeight: 400, color: '#888',
          letterSpacing: '0.32em', textTransform: 'uppercase',
          marginBottom: '1.5rem', fontFamily: sans,
        }}>
          {t.contact.sectionTitle}
        </h3>
        <h4 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 300, letterSpacing: '0.2em',
          margin: '0 0 2rem 0', color: '#222',
          padding: '0 1rem',
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
        }}>
          {t.contact.title}
        </h4>
        <p style={{
          color: '#666',
          marginBottom: 'clamp(3rem, 6vw, 5rem)',
          maxWidth: '700px', margin: '0 auto clamp(3rem, 6vw, 5rem)',
          fontSize: 'clamp(0.85rem, 1.3vw, 0.95rem)',
          letterSpacing: '0.08em',
          lineHeight: 2.0,
          fontFamily: sans,
          padding: '0 1rem',
        }}>
          {t.contact.desc}
        </p>

        <form
          action="https://formspree.io/f/xyknanzy"
          method="POST"
          style={{
            maxWidth: '600px', width: '100%', margin: '0 auto',
            display: 'flex', flexDirection: 'column',
            gap: 'clamp(1.75rem, 3vw, 2.5rem)',
            textAlign: 'left',
            fontFamily: sans,
          }}
        >
          {([
            { id: 'name',    label: t.contact.form.name,    type: 'text',  required: true },
            { id: 'email',   label: t.contact.form.email,   type: 'email', required: true },
            { id: 'message', label: t.contact.form.message, type: 'textarea', required: true },
          ] as const).map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} style={{
                display: 'block', marginBottom: '0.8rem',
                color: '#888', fontSize: '0.75rem',
                letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.id} name={field.id} rows={4} required={field.required}
                  style={{
                    width: '100%', padding: '0.9rem 0', border: 'none',
                    borderBottom: '1px solid #ccc', background: 'transparent',
                    color: '#222', fontSize: '1rem', outline: 'none',
                    resize: 'vertical', lineHeight: 1.8,
                    transition: 'border-color 0.3s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent, #0284c7)')}
                  onBlur={(e) => (e.target.style.borderBottomColor = '#ccc')}
                />
              ) : (
                <input
                  type={field.type} id={field.id} name={field.id} required={field.required}
                  style={{
                    width: '100%', padding: '0.9rem 0', border: 'none',
                    borderBottom: '1px solid #ccc', background: 'transparent',
                    color: '#222', fontSize: '1rem', outline: 'none',
                    transition: 'border-color 0.3s', fontFamily: 'inherit',
                  }}
                  onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent, #0284c7)')}
                  onBlur={(e) => (e.target.style.borderBottomColor = '#ccc')}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            style={{
              marginTop: '1.5rem',
              padding: 'clamp(1rem, 1.8vw, 1.2rem) clamp(2.5rem, 5vw, 4rem)',
              alignSelf: 'center',
              cursor: 'pointer',
              background: 'transparent',
              color: 'var(--accent, #0284c7)',
              border: '1px solid var(--accent, #0284c7)',
              fontSize: 'clamp(0.78rem, 1.1vw, 0.85rem)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              transition: 'all 0.4s ease',
              borderRadius: '999px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent, #0284c7)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--accent, #0284c7)';
            }}
          >
            {t.contact.form.submit}
          </button>
        </form>
      </section>

    </div>
  );
}
