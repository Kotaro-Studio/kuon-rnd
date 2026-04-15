"use client";
import Image from 'next/image';
import React from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type ProfileContent = {
  titles: string;
  nameJa: string;
  nameEn: string;
  p1: React.ReactNode;
  p2: React.ReactNode;
  p3: React.ReactNode;
  p4: React.ReactNode;
  p5: React.ReactNode;
  link1: string;
  link2: string;
  footer: string;
};

const content: Record<Lang, ProfileContent> = {
  ja: {
    titles: '音楽家 / 録音アーティスト / 空音開発 代表',
    nameJa: '朝比奈 幸太郎',
    nameEn: 'Kotaro Asahina',
    p1: <>
      音楽大学にて民族音楽を研究し、卒業後はピアニストとして活動。<br />
      日本でピアニストとして活動しながら、北欧スウェーデンへLindha Kallerdahlと即興演奏研究、ファーストアルバムはドイツ・ケルンでAchim Tangとアルバム制作をし、日本とドイツで同時リリース。<br />
      制作現場にて Stephan Desire より音響学の基礎を学ぶ。
    </>,
    p2: <>
      帰国後「金田式DC録音」の第一人者・五島昭彦氏に師事。<br />
      独立後、後芸術工房 Pinocoa を結成し、録音エンジニア、プロデューサーとして、アルゼンチンタンゴ、クラシック、古楽など世界の様々な作品制作をプロデュースする。
    </>,
    p3: <>
      プロデューサーとしての活動を続けながら、株式会社ジオセンス・小林一英氏よりC言語およびGPS技術を学び、村上アーカイブス・村上浩治氏より映像技術を習得。<br />
      これにより、「音・映像・テクノロジー」を横断するクリエイターとして独自の制作スタイルを確立。
    </>,
    p4: <>
      現在はヴィンテージ機材（Revox等）のレストアや、オリジナルマイク、アンプ、スピーカーの設計開発も手掛けるなど、ハードウェアへの造詣も深める。<br />
      一方で、2025年より金田式DC録音の五島昭彦氏のレーベルで再び学び直し、金田明彦氏の発明した「金田式DC録音技術」の奥義を探求。<br />
      音の純度とヒーリング効果を科学するプロトコル「Curanz Sounds」を発信中。
    </>,
    p5: <>
      2026年、芸術と科学の境界線を探求する、空音開発（Kuon R&D）の代表として、GPS技術を応用した独自のアルゴリズム開発、および高度なWebアプリケーション開発を統合。<br />
      次世代のエンジニア育成や技術継承にも情熱を注ぎ、音響工学と最先端テクノロジー、そして芸術表現が高次元で融合する新たな地平を目指している。
    </>,
    link1: 'Official Website & Blog',
    link2: 'Instagram',
    footer: '© 2026 Kuon R&D / Kotaro Asahina. All rights reserved.',
  },
  en: {
    titles: 'Musician / Recording Artist / Founder of Kuon R&D',
    nameJa: '朝比奈 幸太郎',
    nameEn: 'Kotaro Asahina',
    p1: <>
      Studied ethnomusicology at a music conservatory, then launched a career as a pianist.<br />
      While performing in Japan, he travelled to Sweden for improvisational research with Lindha Kallerdahl. His debut album was recorded in Cologne, Germany with Achim Tang, and released simultaneously in Japan and Germany.<br />
      On set, he received foundational training in acoustics from Stephan Desire.
    </>,
    p2: <>
      Upon returning to Japan, he studied under Akihiko Goshima, the foremost authority on Kaneda-style DC recording.<br />
      He later founded the arts collective Pinocoa, producing recordings and albums spanning Argentine tango, classical, and early music for artists worldwide.
    </>,
    p3: <>
      While continuing his work as a producer, he studied C programming and GPS technology under Kazuhide Kobayashi of Geosense Inc., and acquired video production skills from Koji Murakami of Murakami Archives.<br />
      This cross-disciplinary foundation established his unique creative practice spanning sound, image, and technology.
    </>,
    p4: <>
      Today he also restores vintage equipment (Revox and others) and designs original microphones, amplifiers, and speakers, deepening his expertise in hardware.<br />
      Since 2025 he has returned to study under Goshima&apos;s label, pursuing the mastery of the Kaneda DC recording technique invented by Akihiko Kaneda.<br />
      He also publishes &ldquo;Curanz Sounds,&rdquo; a protocol for scientifically exploring the purity of sound and its healing potential.
    </>,
    p5: <>
      In 2026, as founder of Kuon R&D — a studio exploring the boundary between art and science — he integrates proprietary algorithm development applying GPS technology with advanced web application development.<br />
      Passionate about nurturing the next generation of engineers and preserving technical knowledge, he pursues a new frontier where acoustic engineering, cutting-edge technology, and artistic expression converge at the highest level.
    </>,
    link1: 'Official Website & Blog',
    link2: 'Instagram',
    footer: '© 2026 Kuon R&D / Kotaro Asahina. All rights reserved.',
  },
  es: {
    titles: 'Músico / Artista de Grabación / Fundador de Kuon R&D',
    nameJa: '朝比奈 幸太郎',
    nameEn: 'Kotaro Asahina',
    p1: <>
      Estudió etnomusicología en un conservatorio y posteriormente inició su carrera como pianista.<br />
      Mientras actuaba en Japón, viajó a Suecia para investigar la improvisación junto a Lindha Kallerdahl. Su álbum debut fue grabado en Colonia, Alemania, con Achim Tang, y lanzado simultáneamente en Japón y Alemania.<br />
      Durante la producción, recibió formación en acústica de parte de Stephan Desire.
    </>,
    p2: <>
      A su regreso a Japón, estudió bajo la tutela de Akihiko Goshima, máxima autoridad en la grabación DC estilo Kaneda.<br />
      Posteriormente fundó el colectivo artístico Pinocoa, produciendo grabaciones y álbumes que abarcan tango argentino, música clásica y música antigua para artistas de todo el mundo.
    </>,
    p3: <>
      Sin dejar su labor como productor, estudió programación en C y tecnología GPS con Kazuhide Kobayashi de Geosense Inc., y adquirió habilidades en producción de video con Koji Murakami de Murakami Archives.<br />
      Esta base interdisciplinaria consolidó su práctica creativa única, que abarca sonido, imagen y tecnología.
    </>,
    p4: <>
      Actualmente también restaura equipos vintage (Revox y otros) y diseña micrófonos, amplificadores y altavoces originales, profundizando su conocimiento en hardware.<br />
      Desde 2025 ha retomado sus estudios en el sello de Goshima, explorando los secretos de la técnica de grabación DC Kaneda, inventada por Akihiko Kaneda.<br />
      También publica &ldquo;Curanz Sounds&rdquo;, un protocolo para investigar científicamente la pureza del sonido y su potencial terapéutico.
    </>,
    p5: <>
      En 2026, como fundador de Kuon R&D — un estudio que explora la frontera entre el arte y la ciencia — integra el desarrollo de algoritmos propios aplicando tecnología GPS con el desarrollo avanzado de aplicaciones web.<br />
      Apasionado por la formación de la próxima generación de ingenieros y la preservación del conocimiento técnico, persigue una nueva frontera donde la ingeniería acústica, la tecnología de vanguardia y la expresión artística convergen al más alto nivel.
    </>,
    link1: 'Sitio Oficial & Blog',
    link2: 'Instagram',
    footer: '© 2026 Kuon R&D / Kotaro Asahina. Todos los derechos reservados.',
  },
  pt: {
    titles: 'Músico / Artista de Gravação / Fundador da Kuon R&D',
    nameJa: '朝比奈 幸太郎',
    nameEn: 'Kotaro Asahina',
    p1: <>
      Estudou etnomusicologia em um conservatório de música e iniciou sua carreira como pianista.<br />
      Enquanto atuava no Japão, viajou à Suécia para pesquisar improvisação com Lindha Kallerdahl. Seu álbum de estreia foi gravado em Colônia, Alemanha, com Achim Tang, e lançado simultaneamente no Japão e na Alemanha.<br />
      No estúdio, recebeu formação fundamental em acústica de Stephan Desire.
    </>,
    p2: <>
      Após retornar ao Japão, estudou sob a orientação de Akihiko Goshima, autoridade máxima na gravação DC no estilo Kaneda.<br />
      Mais tarde, fundou o coletivo artístico Pinocoa, produzindo gravações e álbuns que abrangem tango argentino, música clássica e música antiga para artistas de todo o mundo.
    </>,
    p3: <>
      Enquanto continuava seu trabalho como produtor, estudou programação em C e tecnologia GPS com Kazuhide Kobayashi da Geosense Inc., e adquiriu habilidades em produção de vídeo com Koji Murakami da Murakami Archives.<br />
      Essa base interdisciplinar estabeleceu sua prática criativa única, abrangendo som, imagem e tecnologia.
    </>,
    p4: <>
      Hoje também restaura equipamentos vintage (Revox e outros) e projeta microfones, amplificadores e alto-falantes originais, aprofundando sua experiência em hardware.<br />
      Desde 2025, retornou aos estudos no selo de Goshima, buscando o domínio da técnica de gravação DC Kaneda, inventada por Akihiko Kaneda.<br />
      Também publica &ldquo;Curanz Sounds&rdquo;, um protocolo para explorar cientificamente a pureza do som e seu potencial terapêutico.
    </>,
    p5: <>
      Em 2026, como fundador da Kuon R&D — um estúdio que explora a fronteira entre arte e ciência — integra o desenvolvimento de algoritmos proprietários aplicando tecnologia GPS com o desenvolvimento avançado de aplicações web.<br />
      Apaixonado por formar a próxima geração de engenheiros e preservar o conhecimento técnico, busca uma nova fronteira onde engenharia acústica, tecnologia de ponta e expressão artística convergem no mais alto nível.
    </>,
    link1: 'Site Oficial & Blog',
    link2: 'Instagram',
    footer: '© 2026 Kuon R&D / Kotaro Asahina. Todos os direitos reservados.',
  },
  de: {
    titles: 'Musiker / Aufnahmekünstler / Gründer von Kuon R&D',
    nameJa: '朝比奈 幸太郎',
    nameEn: 'Kotaro Asahina',
    p1: <>
      Studierte Ethnomusikologie an einer Musikhochschule und startete anschließend eine Karriere als Pianist.<br />
      Während er in Japan auftrat, reiste er für Improvisationsforschung mit Lindha Kallerdahl nach Schweden. Sein Debütalbum wurde in Köln, Deutschland, mit Achim Tang aufgenommen und gleichzeitig in Japan und Deutschland veröffentlicht.<br />
      Bei den Aufnahmen erhielt er eine grundlegende Ausbildung in Akustik von Stephan Desire.
    </>,
    p2: <>
      Nach seiner Rückkehr nach Japan studierte er bei Akihiko Goshima, der führenden Autorität der Kaneda-DC-Aufnahmetechnik.<br />
      Später gründete er das Künstlerkollektiv Pinocoa, das Aufnahmen und Alben für Künstler weltweit produzierte — von argentinischem Tango über Klassik bis zur Alten Musik.
    </>,
    p3: <>
      Während er weiterhin als Produzent tätig war, studierte er C-Programmierung und GPS-Technologie bei Kazuhide Kobayashi von Geosense Inc. und erwarb Videoproduktionsfähigkeiten bei Koji Murakami von Murakami Archives.<br />
      Diese interdisziplinäre Grundlage etablierte seine einzigartige kreative Praxis, die Klang, Bild und Technologie umfasst.
    </>,
    p4: <>
      Heute restauriert er auch Vintage-Geräte (Revox u.a.) und entwickelt originale Mikrofone, Verstärker und Lautsprecher und vertieft so seine Expertise in Hardware.<br />
      Seit 2025 studiert er erneut bei Goshimas Label und verfolgt die Meisterschaft der von Akihiko Kaneda erfundenen Kaneda-DC-Aufnahmetechnik.<br />
      Er veröffentlicht zudem &bdquo;Curanz Sounds&ldquo;, ein Protokoll zur wissenschaftlichen Erforschung der Klangreinheit und ihres heilenden Potenzials.
    </>,
    p5: <>
      2026 integriert er als Gründer von Kuon R&D — einem Studio an der Grenze zwischen Kunst und Wissenschaft — proprietäre Algorithmenentwicklung mit GPS-Technologie und fortgeschrittene Webanwendungsentwicklung.<br />
      Mit Leidenschaft für die Ausbildung der nächsten Ingenieursgeneration und die Bewahrung technischen Wissens strebt er eine neue Grenze an, an der Akustiktechnik, Spitzentechnologie und künstlerischer Ausdruck auf höchstem Niveau zusammentreffen.
    </>,
    link1: 'Offizielle Website & Blog',
    link2: 'Instagram',
    footer: '© 2026 Kuon R&D / Kotaro Asahina. Alle Rechte vorbehalten.',
  },
};

export default function ProfilePage() {
  const { lang } = useLang();
  const t = content[lang];

  const styles = {
    container: {
      padding: '100px 20px',
      fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif',
      color: '#1a1a1a',
      minHeight: '100vh',
      backgroundColor: '#fafafa',
    },
    profileHeaderSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      marginBottom: '80px',
    },
    imageWrapper: {
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      overflow: 'hidden',
      marginBottom: '40px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
      border: '4px solid #fff',
      backgroundColor: '#fff',
    },
    titles: {
      fontSize: '12px',
      color: '#888',
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      marginBottom: '15px',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
    },
    nameJa: {
      fontSize: '36px',
      fontWeight: '300',
      marginTop: '10px',
      marginBottom: '10px',
      letterSpacing: '0.2em',
    },
    nameEn: {
      fontSize: '16px',
      color: '#666',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      letterSpacing: '0.15em',
      fontWeight: '300',
    },
    biographySection: {
      textAlign: 'justify',
      fontSize: '16px',
      lineHeight: '2.4',
      letterSpacing: '0.05em',
      maxWidth: '700px',
      margin: '0 auto',
      color: '#333',
    },
    paragraph: {
      marginBottom: '3em',
    },
    linksSection: {
      display: 'flex',
      justifyContent: 'center',
      gap: '30px',
      marginTop: '100px',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
    },
    linkButton: {
      display: 'inline-block',
      textDecoration: 'none',
      color: '#444',
      fontSize: '13px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      backgroundColor: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(0,0,0,0.05)',
      padding: '1.2rem 3rem',
      borderRadius: '50px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    footer: {
      marginTop: '150px',
      paddingTop: '40px',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      textAlign: 'center',
      fontSize: '12px',
      color: '#aaa',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      letterSpacing: '0.1em',
    },
  } as const;

  const hoverOn = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = '#0284c7';
    e.currentTarget.style.borderColor = '#0284c7';
    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,1)';
    e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)';
    e.currentTarget.style.boxShadow = '0 15px 30px rgba(2,132,199,0.1)';
  };
  const hoverOff = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = '#444';
    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.7)';
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)';
  };

  return (
    <div style={styles.container}>

      {/* ── プロフィールヘッダー ── */}
      <div style={styles.profileHeaderSection}>
        <div style={styles.imageWrapper}>
          <Image
            src="/kotaro.jpeg"
            alt="朝比奈幸太郎"
            width={200}
            height={200}
            unoptimized={true}
            style={{
              objectFit: 'cover',
              width:     '100%',
              height:    '100%',
              filter:    'contrast(0.95) grayscale(10%)',
            }}
            priority
          />
        </div>
        <header>
          <p style={styles.titles}>{t.titles}</p>
          <h1 style={styles.nameJa}>{t.nameJa}</h1>
          <p style={styles.nameEn}>{t.nameEn}</p>
        </header>
      </div>

      {/* ── 略歴 ── */}
      <section style={styles.biographySection}>
        <p style={styles.paragraph}>{t.p1}</p>
        <p style={styles.paragraph}>{t.p2}</p>
        <p style={styles.paragraph}>{t.p3}</p>
        <p style={styles.paragraph}>{t.p4}</p>
        <p style={{ ...styles.paragraph, marginBottom: 0 }}>{t.p5}</p>
      </section>

      {/* ── 外部リンク ── */}
      <div style={styles.linksSection}>
        <a
          href="https://kotaroasahina.com"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.linkButton}
          onMouseOver={hoverOn}
          onMouseOut={hoverOff}
        >
          {t.link1}
        </a>
        <a
          href="https://www.instagram.com/kotaro_asahina/"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.linkButton}
          onMouseOver={hoverOn}
          onMouseOut={hoverOff}
        >
          {t.link2}
        </a>
      </div>

      {/* ── フッター ── */}
      <footer style={styles.footer}>
        <p>{t.footer}</p>
      </footer>

    </div>
  );
}
