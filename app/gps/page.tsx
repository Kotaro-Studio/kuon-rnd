"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// --- 多言語テキスト定義 ---
type T3 = Partial<Record<Lang, string>> & { en: string };
type T3Node = Record<Lang, React.ReactNode>;

// 1. 導入：宇宙時代とGPS
const introduction = {
  title: "GPS Algorithm",
  subtitle: {
    ja: '個人が宇宙と繋がるためのテクノロジー',
    en: 'Technology That Connects You to Space',
    es: 'Tecnología que te conecta con el espacio',
  } as T3,
  image: "/A_futuristic_smart_agriculture_scene_showcasing_GP-1774173381290.png",
  text: {
    ja: (
      <>
        時は宇宙時代。<br />
        科学の世界でも、芸術の世界でも、スピリチュアルな世界でも<br />
        令和の今、人類は宇宙に飛び込もうとしています。<br />
        <br />
        月や火星に足を伸ばし、民間の宇宙旅行も始まりました。<br />
        GPSというのはまさに宇宙時代に個人で宇宙と繋がるための一番最初にして<br />
        最大のテクノロジーになります。
      </>
    ),
    en: (
      <>
        We live in the space age.<br />
        In science, in art, and in the spiritual world —<br />
        humanity is reaching for the stars.<br />
        <br />
        We have set foot on the Moon and Mars, and private space travel has begun.<br />
        GPS is the very first — and most powerful — technology<br />
        that connects each of us personally to outer space.
      </>
    ),
    es: (
      <>
        Vivimos en la era espacial.<br />
        En la ciencia, en el arte y en el mundo espiritual —<br />
        la humanidad se lanza hacia las estrellas.<br />
        <br />
        Hemos llegado a la Luna y a Marte, y los viajes espaciales privados han comenzado.<br />
        El GPS es la primera — y más poderosa — tecnología<br />
        que conecta a cada persona con el espacio exterior.
      </>
    ),
  } as T3Node,
};

// 2. 応用：依存する未来
const application = {
  title: "Dependency on Space",
  subtitle: {
    ja: '人類と、GPSとが共存する未来',
    en: 'A Future Where Humanity and GPS Coexist',
    es: 'Un futuro donde la humanidad y el GPS coexisten',
  } as T3,
  image: "/Cinematic_aerial_photography_of_a_sleek_modern_dro-1774173538239.png",
  text: {
    ja: (
      <>
        ドローンが正確にホバリングするのも、農機具が正確に直線を走れるのも<br />
        すべてGPSテクノロジーのおかげで在ると言えます。<br />
        また今後レベル5の自動運転技術が世界中で広がり始めると<br />
        ますます高精度GPSの技術が求められるようになるでしょう。<br />
        <br />
        農業、自動車、ドローン、また情報伝達まで、<br />
        これから人類はGPSに依存していく未来に突入します。
      </>
    ),
    en: (
      <>
        Drones hover with pinpoint precision. Farm equipment drives in perfectly straight lines.<br />
        All of this is possible thanks to GPS technology.<br />
        As Level 5 autonomous driving spreads around the world,<br />
        the demand for high-precision GPS will only grow.<br />
        <br />
        Agriculture, automobiles, drones, and communications —<br />
        humanity is entering an era of ever-deeper dependence on GPS.
      </>
    ),
    es: (
      <>
        Los drones se mantienen con precisión milimétrica. La maquinaria agrícola traza líneas perfectas.<br />
        Todo esto es posible gracias a la tecnología GPS.<br />
        A medida que la conducción autónoma de Nivel 5 se extienda por el mundo,<br />
        la demanda de GPS de alta precisión solo crecerá.<br />
        <br />
        Agricultura, automóviles, drones y comunicaciones —<br />
        la humanidad entra en una era de dependencia cada vez mayor del GPS.
      </>
    ),
  } as T3Node,
};

// 3. 技術と使命：みちびきRTK技術
const kuonRndTechnology = {
  title: "MICHIBIKI & RTK Tech",
  subtitle: {
    ja: '国家レベルのプロジェクトを手にいれる',
    en: 'Harnessing National-Scale Satellite Projects',
    es: 'Aprovechando proyectos satelitales de escala nacional',
  } as T3,
  image: "/Cinematic_sci-fi_scene_of_autonomous_self-driving_-1774173606021.png",
  text: {
    ja: (
      <>
        空音開発では、国家レベルのプロジェクトであるみちびき衛星からの<br />
        受信情報を使ったRTK測位技術の研究開発をしています。<br />
        <br />
        法人様を対象とした独占契約での技術提供を基本とさせていただいており、<br />
        必要な技術、アプリのご依頼はコンタクトよりご相談くださいませ。
      </>
    ),
    en: (
      <>
        Kuon R&D conducts research and development on RTK positioning technology<br />
        using signals from Japan&apos;s Michibiki (QZSS) satellite constellation — a national-scale project.<br />
        <br />
        We primarily offer technology through exclusive contracts with corporate clients.<br />
        For inquiries about custom solutions, please reach out via our contact form.
      </>
    ),
    es: (
      <>
        Kuon R&D investiga y desarrolla tecnología de posicionamiento RTK<br />
        utilizando señales de la constelación de satélites Michibiki (QZSS) de Japón — un proyecto de escala nacional.<br />
        <br />
        Ofrecemos tecnología principalmente a través de contratos exclusivos con empresas.<br />
        Para consultas sobre soluciones personalizadas, contáctenos a través de nuestro formulario.
      </>
    ),
  } as T3Node,
  cta: {
    text: {
      ja: 'GPS技術に関するご相談へ',
      en: 'Inquire About GPS Technology',
      es: 'Consultar sobre tecnología GPS',
    } as T3,
    url: "/#contact"
  }
};

// 4. オープンツール
const openTools: {
  title: string;
  subtitle: T3;
  desc: T3;
  url: string;
  cta: T3;
  isNew?: boolean;
}[] = [
  {
    title: "Sounds of the Earth",
    subtitle: {
      ja: '地球の音マップ — GPS × Audio',
      en: 'Sounds of the Earth — GPS × Audio',
      ko: 'Sounds of the Earth — GPS × Audio',
      pt: 'Sounds of the Earth — GPS × Audio',
      es: 'Sonidos de la Tierra — GPS × Audio',
    },
    desc: {
      ja: '世界中のフィールド録音スポットをインタラクティブな地図で探索・試聴。滝、海、鳥、森 — 地球が奏でる音楽に耳を傾けよう。あなたの録音も投稿できます。',
      en: 'Explore and listen to field recording spots around the world on an interactive map. Waterfalls, oceans, birds, forests — listen to the music the Earth plays. You can submit your own recordings too.',
      ko: 'Explore and listen to field recording spots around the world on an interactive map. Waterfalls, oceans, birds, forests — listen to the music the Earth plays. You can submit your own recordings too.',
      pt: 'Explore and listen to field recording spots around the world on an interactive map. Waterfalls, oceans, birds, forests — listen to the music the Earth plays. You can submit your own recordings too.',
      es: 'Explora y escucha puntos de grabación de campo en todo el mundo en un mapa interactivo. Cascadas, océanos, aves, bosques — escucha la música que toca la Tierra. También puedes enviar tus grabaciones.',
    },
    url: "/soundmap-lp",
    cta: {
      ja: '地球の音を聴く',
      en: 'Listen to Earth',
      ko: 'Listen to Earth',
      pt: 'Listen to Earth',
      es: 'Escuchar la Tierra',
    },
    isNew: true
  },
  {
    title: "RTK Base Station",
    subtitle: {
      ja: '善意の基地局データ',
      en: 'Open-Access Base Station Data',
      ko: 'Open-Access Base Station Data',
      pt: 'Open-Access Base Station Data',
      es: 'Datos de estación base de acceso abierto',
    },
    desc: {
      ja: 'センチメートル級の高精度な位置情報をオープンに提供。NTRIP方式による補正データ配信のテスト仕様と接続情報を公開しています。',
      en: 'Providing centimeter-level precision positioning data openly. We publish test specifications and connection details for NTRIP correction data distribution.',
      ko: 'Providing centimeter-level precision positioning data openly. We publish test specifications and connection details for NTRIP correction data distribution.',
      pt: 'Providing centimeter-level precision positioning data openly. We publish test specifications and connection details for NTRIP correction data distribution.',
      es: 'Proporcionando datos de posicionamiento de precisión centimétrica de forma abierta. Publicamos especificaciones de prueba y detalles de conexión para distribución de datos de corrección NTRIP.',
    },
    url: "/rtk-base",
    cta: {
      ja: '基地局情報を見る',
      en: 'View Base Station Info',
      ko: 'View Base Station Info',
      pt: 'View Base Station Info',
      es: 'Ver información de la estación base',
    },
  },
  {
    title: "Geocode Viewer",
    subtitle: {
      ja: 'Kuon R&D Edition',
      en: 'Kuon R&D Edition',
      ko: 'Kuon R&D Edition',
      pt: 'Kuon R&D Edition',
      es: 'Kuon R&D Edition',
    },
    desc: {
      ja: '空間と時間の交差点を解析するための精密なWebツール。地図上の直感的なクリック操作で、座標変換や緯度経度のマッピングを瞬時に実行します。',
      en: 'A precision web tool for analyzing the intersection of space and time. Perform coordinate conversions and latitude/longitude mapping instantly with intuitive click operations on the map.',
      ko: 'A precision web tool for analyzing the intersection of space and time. Perform coordinate conversions and latitude/longitude mapping instantly with intuitive click operations on the map.',
      pt: 'A precision web tool for analyzing the intersection of space and time. Perform coordinate conversions and latitude/longitude mapping instantly with intuitive click operations on the map.',
      es: 'Una herramienta web de precisión para analizar la intersección del espacio y el tiempo. Realice conversiones de coordenadas y mapeo de latitud/longitud al instante con operaciones intuitivas de clic en el mapa.',
    },
    url: "/geocode-viewer",
    cta: {
      ja: 'ビューワーを起動する',
      en: 'Launch Viewer',
      ko: 'Launch Viewer',
      pt: 'Launch Viewer',
      es: 'Iniciar visor',
    },
  }
];

// Open Tools セクションのテキスト
const toolsSectionTitle = {
  ja: '社会と共有する、時空解析のインターフェース',
  en: 'Spacetime Analysis Interfaces — Shared with the World',
  es: 'Interfaces de análisis espacio-temporal — Compartidos con el mundo',
} as T3;

const toolsSectionDesc = {
  ja: '空音開発が研究する技術の一部を、誰でも利用できるパブリックツールとして公開しています。',
  en: 'We publish selected technologies from our research as public tools available to everyone.',
  es: 'Publicamos tecnologías seleccionadas de nuestra investigación como herramientas públicas disponibles para todos.',
} as T3;

// --- LP本体のコンポーネント ---

export default function GpsPage() {
  const { lang } = useLang();

  // インラインスタイルの共通定義（洗練されたボタンUI）
  const glassButtonStyle = {
    display: 'inline-block',
    textDecoration: 'none',
    color: '#444',
    fontSize: '13px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(0,0,0,0.05)',
    padding: '1.2rem 3rem',
    borderRadius: '50px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: 'pointer',
    fontFamily: '"Helvetica Neue", Arial, sans-serif'
  } as const;

  const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = '#0284c7';
    e.currentTarget.style.borderColor = '#0284c7';
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)';
    e.currentTarget.style.boxShadow = '0 15px 30px rgba(2, 132, 199, 0.1)';
  };

  const handleLinkOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = '#444';
    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)';
  };

  const imageWrapperStyle = {
    position: 'relative',
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '4px solid #fff',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    backgroundColor: 'transparent'
  } as const;

  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)';
    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
  };

  const handleImageOut = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', color: 'var(--text-main)', fontFamily: '"Hiragino Mincho ProN", "Shippori Mincho", "Yu Mincho", serif' }}>

      {/* --- ■ 1. 導入：哲学と宇宙時代 --- */}
      <section className="section-responsive" style={{ padding: '12rem 5% 10rem 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent, #bda678)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
          {introduction.title}
        </h2>
        <h3 className="title-responsive" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '200', letterSpacing: '0.15em', lineHeight: '1.5', margin: '0 0 4rem 0', color: '#111' }}>
          {introduction.subtitle[lang]}
        </h3>

        <div className="flex-responsive" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', textAlign: 'left' }}>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '2.4', letterSpacing: '0.08em', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              {introduction.text[lang]}
            </p>
          </div>
          <div style={{ ...imageWrapperStyle, flex: '1 1 300px' }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image
              src={introduction.image}
              alt="Space Era and GPS Philosophy"
              width={1200}
              height={800}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02) grayscale(10%)' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* --- ■ 2. 応用：依存する未来 --- */}
      <section className="section-responsive" style={{ padding: '10rem 5%', borderTop: '1px solid rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.03)', background: 'rgba(255,255,255,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent, #bda678)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            {application.title}
          </h3>
          <h4 className="title-responsive" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '200', letterSpacing: '0.1em', margin: 0, color: '#111' }}>{application.subtitle[lang]}</h4>
        </div>

        <div className="flex-responsive" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', flexDirection: 'row-reverse' }}>
          <div style={{ flex: '1 1 300px', textAlign: 'left' }}>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '2.4', letterSpacing: '0.08em', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              {application.text[lang]}
            </p>
          </div>
          <div style={{ ...imageWrapperStyle, flex: '1 1 300px' }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image
              src={application.image}
              alt="GPS Application (Drone)"
              width={1200}
              height={900}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02) grayscale(10%)' }}
            />
          </div>
        </div>
      </section>

      {/* --- ■ 3. 技術と使命：みちびきRTK技術 --- */}
      <section className="section-responsive" style={{ padding: '10rem 5%', backgroundColor: '#fafafa' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent, #bda678)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            {kuonRndTechnology.title}
          </h3>
          <h4 className="title-responsive" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '200', letterSpacing: '0.1em', margin: 0, color: '#111' }}>{kuonRndTechnology.subtitle[lang]}</h4>
        </div>

        <div className="flex-responsive" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '5rem', alignItems: 'center' }}>
          <div style={{ ...imageWrapperStyle, flex: '1 1 400px' }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image
              src={kuonRndTechnology.image}
              alt="Autonomous Self-Driving and GPS Tech"
              width={1200}
              height={1000}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02) grayscale(10%)' }}
            />
          </div>

          <div style={{ flex: '1 1 300px' }}>
            <p style={{ color: '#222', fontSize: 'clamp(1.1rem, 2vw, 1.2rem)', fontWeight: '300', letterSpacing: '0.1em', lineHeight: '2.2', margin: '0 0 4rem 0', textAlign: 'justify' }}>
              {kuonRndTechnology.text[lang]}
            </p>

            <div style={{ textAlign: 'left' }}>
              <Link
                href={kuonRndTechnology.cta.url}
                style={glassButtonStyle}
                onMouseOver={handleLinkHover}
                onMouseOut={handleLinkOut}
              >
                {kuonRndTechnology.cta.text[lang]}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- ■ 4. オープンツール（最後尾） --- */}
      <section id="gps-tools" className="section-responsive" style={{ padding: '8rem 5% 12rem 5%', borderTop: '1px solid rgba(0,0,0,0.03)', backgroundColor: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent, #bda678)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            Open Geolocation Tools
          </h3>
          <h4 className="title-responsive" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '200', letterSpacing: '0.1em', margin: 0, color: '#111' }}>
            {toolsSectionTitle[lang]}
          </h4>
          <p style={{ color: '#666', marginTop: '2rem', fontSize: '0.95rem', letterSpacing: '0.05em', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            {toolsSectionDesc[lang]}
          </p>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center' }}>
          {openTools.map((tool, index) => (
            <div key={index} style={{
              flex: '1 1 350px',
              backgroundColor: '#fafafa',
              border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: '12px',
              padding: '3rem',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.4s ease, box-shadow 0.4s ease',
              fontFamily: '"Helvetica Neue", Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--accent, #bda678)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {tool.subtitle[lang]}
                </span>
                {tool.isNew && (
                  <span style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', letterSpacing: '0.1em' }}>
                    NEW
                  </span>
                )}
              </div>
              <h5 style={{ fontSize: '1.6rem', color: '#111', margin: '0 0 1.5rem 0', fontWeight: '400', letterSpacing: '0.05em' }}>
                {tool.title}
              </h5>
              <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: '2', margin: '0 0 2.5rem 0', flex: 1 }}>
                {tool.desc[lang]}
              </p>

              <div>
                <Link
                  href={tool.url}
                  style={{ ...glassButtonStyle, padding: '1rem 2rem', fontSize: '0.8rem', width: '100%', textAlign: 'center', backgroundColor: '#fff' }}
                  onMouseOver={handleLinkHover}
                  onMouseOut={handleLinkOut}
                >
                  {tool.cta[lang]}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
