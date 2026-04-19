"use client";
import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useState, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';
const GOLD   = '#bda678';

type L3 = Partial<Record<Lang, string>> & { en: string };
type L3Node = Partial<Record<Lang, React.ReactNode>> & { en: React.ReactNode };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;
const t3n = (m: L3Node, lang: Lang) => m[lang] ?? m.en;

// ─────────────────────────────────────────────
// Scroll-reveal hook
// ─────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, style: { opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)', transition: 'opacity 0.8s ease, transform 0.8s ease' } as React.CSSProperties };
}

// ─────────────────────────────────────────────
// Section component
// ─────────────────────────────────────────────
function Section({ children, bg, id }: { children: React.ReactNode; bg?: string; id?: string }) {
  return (
    <section id={id} style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)', backgroundColor: bg ?? '#fafafa' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Content
// ─────────────────────────────────────────────
const TITLES: L3 = {
  ja: '音響エンジニア / ソフトウェアアーキテクト / マイク設計者 / 音楽家',
  en: 'Acoustic Engineer / Software Architect / Microphone Designer / Musician',
  ko: '음향 엔지니어 / 소프트웨어 아키텍트 / 마이크 설계자 / 음악가',
  pt: 'Engenheiro Acústico / Arquiteto de Software / Designer de Microfones / Músico',
  es: 'Ingeniero Acústico / Arquitecto de Software / Diseñador de Micrófonos / Músico',
};

const INTRO: L3Node = {
  ja: <>
    音楽大学にて民族音楽を研究し、卒業後はピアニストとして活動。<br />
    日本でピアニストとして活動しながら、北欧スウェーデンへ渡り Lindha Kallerdahl と即興演奏を研究。<br />
    ファーストアルバムはドイツ・ケルンで Achim Tang とアルバム制作をし、日本とドイツで同時リリース。<br />
    このドイツ滞在中、制作現場にて Stephan Desire より音響学の基礎を学ぶ。<br />
    ケルンのスタジオで叩き込まれた音響物理の知見が、のちの録音哲学の土台となる。
  </>,
  en: <>
    Studied ethnomusicology at a music conservatory, then launched a career as a pianist.<br />
    While performing in Japan, he travelled to Sweden for improvisational research with Lindha Kallerdahl.<br />
    His debut album was recorded in Cologne, Germany with Achim Tang, and released simultaneously in Japan and Germany.<br />
    It was during this time in Germany that he received foundational training in acoustics from Stephan Desire.<br />
    The knowledge of acoustic physics instilled in a Cologne studio would become the bedrock of his recording philosophy.
  </>,
  ko: <>
    음악대학에서 민족음악학을 전공한 후 피아니스트로 활동을 시작했습니다.<br />
    일본에서 활동하면서 스웨덴으로 건너가 Lindha Kallerdahl과 즉흥 연주를 연구했습니다.<br />
    데뷔 앨범은 독일 쾰른에서 Achim Tang과 함께 녹음하여 일본과 독일에서 동시 발매되었습니다.<br />
    이 독일 체류 중에 Stephan Desire로부터 음향학의 기초를 배웠습니다.<br />
    쾰른 스튜디오에서 배운 음향 물리학의 지식이 이후의 녹음 철학의 토대가 됩니다.
  </>,
  pt: <>
    Estudou etnomusicologia em um conservatório e iniciou carreira como pianista.<br />
    Enquanto se apresentava no Japão, viajou à Suécia para pesquisa em improvisação com Lindha Kallerdahl.<br />
    Seu álbum de estreia foi gravado em Colônia, Alemanha, com Achim Tang, e lançado simultaneamente no Japão e na Alemanha.<br />
    Foi durante essa estadia na Alemanha que recebeu formação fundamental em acústica de Stephan Desire.<br />
    O conhecimento de física acústica adquirido em um estúdio de Colônia se tornaria a base de sua filosofia de gravação.
  </>,
  es: <>
    Estudió etnomusicología en un conservatorio y posteriormente inició su carrera como pianista.<br />
    Mientras actuaba en Japón, viajó a Suecia para investigar la improvisación junto a Lindha Kallerdahl.<br />
    Su álbum debut fue grabado en Colonia, Alemania, con Achim Tang, y lanzado simultáneamente en Japón y Alemania.<br />
    Fue durante esta estancia en Alemania donde recibió formación fundamental en acústica de Stephan Desire.<br />
    El conocimiento de física acústica adquirido en un estudio de Colonia se convertiría en la base de su filosofía de grabación.
  </>,
};

const KANEDA_SECTION: L3Node = {
  ja: <>
    帰国後「金田式DC録音」の第一人者・<strong>五島昭彦</strong>氏に師事。<br />
    バランス電流伝送DC録音 —— 市販機器では到達し得ない音の純度を実現する、金田明彦氏が半世紀をかけて築き上げた録音の極致。<br />
    その技術体系を、五島氏から直接継承している。<br /><br />
    独立後、芸術工房 Pinocoa を結成。<br />
    録音エンジニア・プロデューサーとして、アルゼンチンタンゴ、クラシック、古楽など、世界の様々な作品制作をプロデュース。<br />
    録音芸術の現場で磨かれた感性と判断力が、空音開発のすべてのプロダクトの設計思想に宿っている。
  </>,
  en: <>
    After returning to Japan, he studied under <strong>Akihiko Goshima</strong>, the foremost authority on Kaneda-style DC recording.<br />
    Balanced current-transmission DC recording — a pursuit of sonic purity unattainable by commercial equipment, built over half a century by Akihiko Kaneda, who continues to advance this art through his ongoing writings to this day.<br />
    This entire technical lineage has been passed down directly from Goshima.<br /><br />
    He later founded the arts collective Pinocoa, working as a recording engineer and producer across Argentine tango, classical, and early music for artists worldwide.<br />
    The sensibility and judgment forged in the field of recording arts live within every product designed by Kuon R&D.
  </>,
  ko: <>
    귀국 후 「카네다식 DC 녹음」의 제1인자인 <strong>고시마 아키히코</strong> 선생에게 사사했습니다.<br />
    밸런스 전류 전송 DC 녹음 — 시판 기기로는 도달할 수 없는 음의 순도를 실현하는, 카네다 아키히코 선생이 반세기에 걸쳐 구축한 녹음의 극치입니다.<br />
    그 기술 체계를 고시마 선생으로부터 직접 계승하고 있습니다.<br /><br />
    독립 후 예술공방 Pinocoa를 설립하여, 아르헨티나 탱고, 클래식, 고음악 등 세계 각지의 작품 제작을 프로듀스했습니다.<br />
    녹음 예술 현장에서 갈고닦은 감성과 판단력이 쿠온 R&D의 모든 제품 설계 사상에 깃들어 있습니다.
  </>,
  pt: <>
    Após retornar ao Japão, estudou sob <strong>Akihiko Goshima</strong>, a maior autoridade em gravação DC estilo Kaneda.<br />
    Gravação DC por transmissão balanceada de corrente — uma busca pela pureza sonora inatingível por equipamentos comerciais, construída ao longo de meio século por Akihiko Kaneda, que continua avançando essa arte através de seus escritos até hoje.<br />
    Toda essa linhagem técnica foi transmitida diretamente por Goshima.<br /><br />
    Posteriormente fundou o coletivo artístico Pinocoa, trabalhando como engenheiro de gravação e produtor em tango argentino, música clássica e música antiga para artistas de todo o mundo.<br />
    A sensibilidade e o julgamento forjados no campo da arte da gravação vivem em cada produto projetado pela Kuon R&D.
  </>,
  es: <>
    A su regreso a Japón, estudió bajo la tutela de <strong>Akihiko Goshima</strong>, máxima autoridad en la grabación DC estilo Kaneda.<br />
    Grabación DC por transmisión balanceada de corriente — una búsqueda de pureza sonora inalcanzable por equipos comerciales, construida durante medio siglo por Akihiko Kaneda, quien continúa avanzando este arte a través de sus escritos hasta hoy.<br />
    Todo este linaje técnico fue transmitido directamente por Goshima.<br /><br />
    Posteriormente fundó el colectivo artístico Pinocoa, trabajando como ingeniero de grabación y productor en tango argentino, música clásica y música antigua para artistas de todo el mundo.<br />
    La sensibilidad y el juicio forjados en el campo del arte de la grabación viven en cada producto diseñado por Kuon R&D.
  </>,
};

const SOFTWARE_SECTION: L3Node = {
  ja: <>
    プロデューサーとしての活動を続けながら、株式会社ジオセンス・<strong>小林一英</strong>氏よりC言語およびGPS測位技術を学ぶ。<br />
    小林氏の教えは、単なるプログラミング技術の伝授にとどまらず、「ソフトウェアで世界を記述する」という思考の根幹を授けるものだった。<br /><br />
    その薫陶のもと、Next.js / TypeScript / Rust / WebAssembly / Cloudflare Workers を駆使した大規模Webアプリケーション設計、リアルタイム音声処理エンジン（Web Audio API / AudioWorklet）、Rust Wasm によるブラウザ内DSP処理、Stripe決済統合、マジックリンク認証基盤 —— 空音開発の全技術スタックを、ひとりで設計・実装している。<br />
    <br />
    これは、音響工学とソフトウェア工学の両方を深く理解しているからこそ可能な、極めて稀有な制作スタイルである。
  </>,
  en: <>
    While continuing his work as a producer, he studied C programming and GPS positioning technology under <strong>Kazuhide Kobayashi</strong> of Geosense Inc.<br />
    Kobayashi&apos;s teaching went far beyond programming technique — it instilled the fundamental capacity to &ldquo;describe the world through software.&rdquo;<br /><br />
    Under that mentorship, he became capable of architecting every layer of Kuon R&D&apos;s technology: large-scale web application design with Next.js / TypeScript / Rust / WebAssembly / Cloudflare Workers, real-time audio processing engines (Web Audio API / AudioWorklet), in-browser DSP via Rust Wasm, Stripe payment integration, and magic-link authentication infrastructure — all designed and implemented by a single individual.<br /><br />
    This is an exceptionally rare creative practice, made possible only by deep fluency in both acoustic engineering and software architecture.
  </>,
  ko: <>
    프로듀서로 활동하면서 주식회사 지오센스의 <strong>고바야시 가즈히데</strong> 선생에게 C 언어와 GPS 측위 기술을 배웠습니다.<br />
    고바야시 선생의 가르침은 단순한 프로그래밍 기술 전수를 넘어 &ldquo;소프트웨어로 세계를 기술한다&rdquo;는 사고의 근간을 심어주었습니다.<br /><br />
    그 가르침을 바탕으로 Next.js / TypeScript / Rust / WebAssembly / Cloudflare Workers를 활용한 대규모 웹 애플리케이션 설계, 실시간 오디오 처리 엔진, Rust Wasm에 의한 브라우저 내 DSP 처리, Stripe 결제 통합, 매직링크 인증 기반 — 쿠온 R&D의 전체 기술 스택을 혼자서 설계·구현하고 있습니다.
  </>,
  pt: <>
    Enquanto continuava como produtor, estudou programação em C e tecnologia de posicionamento GPS com <strong>Kazuhide Kobayashi</strong> da Geosense Inc.<br />
    O ensino de Kobayashi foi além da técnica de programação — instilou a capacidade fundamental de &ldquo;descrever o mundo através de software.&rdquo;<br /><br />
    Sob essa mentoria, tornou-se capaz de arquitetar toda a tecnologia da Kuon R&D: design de aplicações web em larga escala com Next.js / TypeScript / Rust / WebAssembly / Cloudflare Workers, engines de processamento de áudio em tempo real, DSP no navegador via Rust Wasm, integração de pagamentos Stripe, e infraestrutura de autenticação por magic-link — tudo projetado e implementado por uma única pessoa.
  </>,
  es: <>
    Sin dejar su labor como productor, estudió programación en C y tecnología de posicionamiento GPS con <strong>Kazuhide Kobayashi</strong> de Geosense Inc.<br />
    La enseñanza de Kobayashi fue más allá de la técnica de programación — instauró la capacidad fundamental de &ldquo;describir el mundo a través del software.&rdquo;<br /><br />
    Bajo esa mentoría, se hizo capaz de arquitectar toda la tecnología de Kuon R&D: diseño de aplicaciones web a gran escala con Next.js / TypeScript / Rust / WebAssembly / Cloudflare Workers, motores de procesamiento de audio en tiempo real, DSP en el navegador vía Rust Wasm, integración de pagos Stripe e infraestructura de autenticación — todo diseñado e implementado por una sola persona.
  </>,
};

const REVOX_SECTION: L3Node = {
  ja: <>
    ソフトウェアの世界に没頭する一方で、ハードウェアへの造詣をさらに深めている。スイスの名機 Revox のヴィンテージオープンリールデッキを自ら修復し、基板設計の読み解き、部品の選定、はんだ付け、動作検証まで一貫して手掛ける。<br /><br />
    この経験が、P-86S / X-86S マイクロフォンの設計にも直結している。<br />
    回路の挙動を肌で理解し、はんだの質が音に与える影響を知る者だけが到達できる設計哲学 —— それが空音開発のマイクに宿る「音」の源泉である。
  </>,
  en: <>
    While immersing himself in the world of software, he has further deepened his expertise in hardware. He personally restores vintage Revox open-reel tape decks from Switzerland — reading circuit board schematics, selecting components, soldering, and verifying operation through to completion.<br /><br />
    This hands-on experience directly informs the design of the P-86S and X-86S microphones.<br />
    A design philosophy accessible only to those who understand circuit behavior intimately and know how solder quality affects sound — this is the wellspring of the &ldquo;voice&rdquo; that lives within every Kuon R&D microphone.
  </>,
  ko: <>
    소프트웨어 세계에 몰두하는 한편, 하드웨어에 대한 조예를 더욱 깊게 하고 있습니다. 스위스 명기 Revox의 빈티지 오픈릴 데크를 직접 복원하며, 기판 설계 해독, 부품 선정, 납땜, 동작 검증까지 일관되게 수행합니다.<br /><br />
    이 경험이 P-86S / X-86S 마이크로폰의 설계에 직결됩니다.<br />
    회로의 거동을 피부로 이해하고, 납땜의 질이 음에 미치는 영향을 아는 사람만이 도달할 수 있는 설계 철학입니다.
  </>,
  pt: <>
    Enquanto se imerge no mundo do software, aprofunda ainda mais sua expertise em hardware. Ele restaura pessoalmente gravadores vintage Revox de rolo aberto da Suíça — lendo esquemas de placas, selecionando componentes, soldando e verificando operação do início ao fim.<br /><br />
    Essa experiência prática informa diretamente o design dos microfones P-86S e X-86S.<br />
    Uma filosofia de design acessível apenas a quem compreende intimamente o comportamento dos circuitos e sabe como a qualidade da solda afeta o som.
  </>,
  es: <>
    Mientras se sumerge en el mundo del software, profundiza aún más su experiencia en hardware. Restaura personalmente grabadoras vintage Revox de carrete abierto de Suiza — leyendo esquemas de placas, seleccionando componentes, soldando y verificando el funcionamiento de principio a fin.<br /><br />
    Esta experiencia práctica informa directamente el diseño de los micrófonos P-86S y X-86S.<br />
    Una filosofía de diseño accesible solo para quienes comprenden íntimamente el comportamiento de los circuitos y saben cómo la calidad de la soldadura afecta el sonido.
  </>,
};

const CURANZ_SECTION: L3Node = {
  ja: <>
    音楽家としてのもうひとつの柱が、ヒーリング音楽ブランド <strong>Curanz Sounds</strong> の運営である。432Hz チューニング、ソルフェジオ周波数、バイノーラルビート —— 音の持つ癒しの力を、科学的アプローチと芸術的感性の両方から追求するプロジェクト。<br /><br />
    これは単なる音楽制作ではない。<br />
    音響物理学、心理音響学、そして数千年にわたる音楽哲学を統合した、「音による人間の可能性の拡張」という壮大なテーマへの挑戦である。
  </>,
  en: <>
    Another pillar of his work as a musician is <strong>Curanz Sounds</strong>, a healing music brand. 432Hz tuning, solfeggio frequencies, binaural beats — a project that pursues the healing power of sound through both scientific methodology and artistic sensibility.<br /><br />
    This is not mere music production.<br />
    It is an ambitious challenge to &ldquo;expand human potential through sound&rdquo; — integrating acoustic physics, psychoacoustics, and millennia of musical philosophy.
  </>,
  ko: <>
    음악가로서의 또 다른 축은 힐링 음악 브랜드 <strong>Curanz Sounds</strong>의 운영입니다. 432Hz 튜닝, 솔페지오 주파수, 바이노럴 비트 — 과학적 접근과 예술적 감성 양쪽에서 소리의 치유력을 추구하는 프로젝트입니다.<br /><br />
    이것은 단순한 음악 제작이 아닙니다.<br />
    음향 물리학, 심리음향학, 그리고 수천 년에 걸친 음악 철학을 통합한 &ldquo;소리를 통한 인간 가능성의 확장&rdquo;이라는 웅대한 테마에 대한 도전입니다.
  </>,
  pt: <>
    Outro pilar de seu trabalho como músico é a <strong>Curanz Sounds</strong>, uma marca de música para bem-estar. Afinação 432Hz, frequências solfejo, batidas binaurais — um projeto que busca o poder curativo do som através de metodologia científica e sensibilidade artística.<br /><br />
    Não se trata de simples produção musical.<br />
    É um desafio ambicioso de &ldquo;expandir o potencial humano através do som&rdquo; — integrando física acústica, psicoacústica e milênios de filosofia musical.
  </>,
  es: <>
    Otro pilar de su trabajo como músico es <strong>Curanz Sounds</strong>, una marca de música para el bienestar. Afinación 432Hz, frecuencias solfeggio, beats binaurales — un proyecto que persigue el poder curativo del sonido a través de metodología científica y sensibilidad artística.<br /><br />
    No es simple producción musical.<br />
    Es un desafío ambicioso de &ldquo;expandir el potencial humano a través del sonido&rdquo; — integrando física acústica, psicoacústica y milenios de filosofía musical.
  </>,
};

const VISION_SECTION: L3Node = {
  ja: <>
    2026年、空音開発（Kuon R&D）の代表として、音響工学、ソフトウェアアーキテクチャ、ハードウェア設計、音楽芸術 —— 四つの領域を高次元で統合する、世界でも類を見ないプラットフォームを構築している。<br /><br />
    音大生が手の届く価格でプロ品質の録音を実現するマイク。<br />
    ブラウザだけで完結する15以上のオーディオツール群。<br />
    世界中のフィールド録音を地図上で聴く地球音マップ。<br />
    そして音楽家の練習・成長・発見を支えるコミュニティ。<br /><br />
    すべては「音楽を学ぶすべての人に、最高の環境を」という信念から生まれている。<br />
    次世代の音楽教育と技術継承に情熱を注ぎ、芸術と科学が交差する地平を、これからも切り拓いていく。
  </>,
  en: <>
    In 2026, as founder of Kuon R&D, he is building a platform unlike any other in the world — one that integrates acoustic engineering, software architecture, hardware design, and musical artistry at the highest level.<br /><br />
    Microphones that deliver professional recording quality at prices music students can reach.<br />
    Over 15 browser-based audio tools.<br />
    A global Sound Map for listening to field recordings from around the world.<br />
    And a community that supports musicians in their practice, growth, and discovery.<br /><br />
    Everything stems from a single conviction: &ldquo;The finest environment for everyone who studies music.&rdquo;<br />
    With deep passion for next-generation music education and the transmission of technical knowledge, he continues to pioneer the frontier where art and science converge.
  </>,
  ko: <>
    2026년, 쿠온 R&D의 대표로서 음향공학, 소프트웨어 아키텍처, 하드웨어 설계, 음악 예술 — 네 가지 영역을 고차원에서 통합하는, 세계에서도 유례없는 플랫폼을 구축하고 있습니다.<br /><br />
    음대생이 감당할 수 있는 가격으로 프로 품질의 녹음을 실현하는 마이크.<br />
    브라우저만으로 완결되는 15개 이상의 오디오 도구.<br />
    전 세계 필드 녹음을 지도에서 듣는 지구의 소리 맵.<br />
    그리고 음악가의 연습·성장·발견을 지원하는 커뮤니티.<br /><br />
    모든 것은 &ldquo;음악을 배우는 모든 이에게 최고의 환경을&rdquo;이라는 신념에서 시작됩니다.
  </>,
  pt: <>
    Em 2026, como fundador da Kuon R&D, ele constrói uma plataforma sem igual no mundo — uma que integra engenharia acústica, arquitetura de software, design de hardware e arte musical no mais alto nível.<br /><br />
    Microfones que entregam qualidade profissional a preços acessíveis para estudantes de música.<br />
    Mais de 15 ferramentas de áudio baseadas em navegador.<br />
    Um Mapa Sonoro global.<br />
    E uma comunidade que apoia músicos em sua prática, crescimento e descoberta.<br /><br />
    Tudo nasce de uma única convicção: &ldquo;O melhor ambiente para todos que estudam música.&rdquo;
  </>,
  es: <>
    En 2026, como fundador de Kuon R&D, construye una plataforma sin igual en el mundo — una que integra ingeniería acústica, arquitectura de software, diseño de hardware y arte musical al más alto nivel.<br /><br />
    Micrófonos que ofrecen calidad profesional a precios accesibles para estudiantes de música.<br />
    Más de 15 herramientas de audio en el navegador.<br />
    Un Mapa Sonoro global.<br />
    Y una comunidad que apoya a los músicos en su práctica, crecimiento y descubrimiento.<br /><br />
    Todo nace de una sola convicción: &ldquo;El mejor entorno para todos los que estudian música.&rdquo;<br />
    Con pasión por la educación musical de próxima generación y la transmisión del conocimiento técnico, sigue abriendo camino donde el arte y la ciencia convergen.
  </>,
};

// ─────────────────────────────────────────────
// Section headers
// ─────────────────────────────────────────────
const H_KANEDA: L3 = { ja: '金田式DC録音の継承', en: 'Inheritor of Kaneda DC Recording', ko: '카네다식 DC 녹음의 계승', pt: 'Herdeiro da Gravação DC Kaneda', es: 'Heredero de la Grabación DC Kaneda' };
const H_SOFTWARE: L3 = { ja: 'ソフトウェアで世界を記述する', en: 'Describing the World Through Software', ko: '소프트웨어로 세계를 기술하다', pt: 'Descrevendo o Mundo Através de Software', es: 'Describiendo el Mundo a Través del Software' };
const H_REVOX: L3 = { ja: 'ハードウェアの手触り', en: 'The Touch of Hardware', ko: '하드웨어의 촉감', pt: 'O Toque do Hardware', es: 'El Tacto del Hardware' };
const H_CURANZ: L3 = { ja: '音の癒し — Curanz Sounds', en: 'The Healing of Sound — Curanz Sounds', ko: '소리의 치유 — Curanz Sounds', pt: 'A Cura do Som — Curanz Sounds', es: 'La Sanación del Sonido — Curanz Sounds' };
const H_VISION: L3 = { ja: '四つの領域の統合', en: 'Convergence of Four Disciplines', ko: '네 가지 영역의 통합', pt: 'Convergência de Quatro Disciplinas', es: 'Convergencia de Cuatro Disciplinas' };

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function ProfilePage() {
  const { lang } = useLang();

  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();
  const r5 = useReveal();
  const r6 = useReveal();
  const r7 = useReveal();

  const sectionTitle: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
    fontWeight: 400,
    letterSpacing: '0.08em',
    color: '#111',
    marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
    lineHeight: 1.6,
  };

  const bodyText: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 'clamp(0.88rem, 1.1vw, 0.98rem)',
    lineHeight: 2.2,
    color: '#333',
    letterSpacing: '0.03em',
  };

  const goldLine: React.CSSProperties = {
    width: 40,
    height: 2,
    background: GOLD,
    margin: '0 0 clamp(1.5rem, 3vw, 2rem)',
  };

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh' }}>

      {/* ═══ HERO ═══ */}
      <section style={{
        padding: 'clamp(6rem, 12vw, 10rem) clamp(1.5rem, 5vw, 4rem) clamp(4rem, 8vw, 6rem)',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #fff 0%, #fafafa 100%)',
      }}>
        <div ref={r1.ref} style={r1.style}>
          {/* Portrait */}
          <div style={{
            width: 'clamp(140px, 20vw, 200px)',
            height: 'clamp(140px, 20vw, 200px)',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '0 auto clamp(2rem, 4vw, 3rem)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
            border: '4px solid #fff',
          }}>
            <Image src="/kotaro.jpeg" alt="Kotaro Asahina" width={200} height={200} unoptimized style={{ objectFit: 'cover', width: '100%', height: '100%', filter: 'contrast(0.95) grayscale(10%)' }} priority />
          </div>

          {/* Titles */}
          <p style={{
            fontFamily: sans, fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase',
            color: GOLD, marginBottom: '1rem',
          }}>
            {t3(TITLES, lang)}
          </p>
          <h1 style={{
            fontFamily: serif, fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 300,
            letterSpacing: '0.2em', color: '#111', margin: '0 0 0.5rem',
          }}>
            朝比奈 幸太郎
          </h1>
          <p style={{
            fontFamily: sans, fontSize: 'clamp(0.85rem, 1.2vw, 1rem)', color: '#888',
            letterSpacing: '0.15em', fontWeight: 300,
          }}>
            Kotaro Asahina
          </p>
        </div>
      </section>

      {/* ═══ INTRO ═══ */}
      <Section>
        <div ref={r2.ref} style={r2.style}>
          <div style={goldLine} />
          <div style={bodyText}>{t3n(INTRO, lang)}</div>
        </div>
      </Section>

      {/* ═══ KANEDA DC RECORDING ═══ */}
      <Section bg="#fff">
        <div ref={r3.ref} style={r3.style}>
          <div style={goldLine} />
          <h2 style={sectionTitle}>{t3(H_KANEDA, lang)}</h2>

          {/* Image: Kaneda/Goshima recording */}
          <div style={{
            margin: '0 0 clamp(2rem, 3vw, 2.5rem)',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          }}>
            <Image src="/revox-kaneta.jpeg" alt={t3({ ja: '金田式DC録音の現場', en: 'Kaneda DC Recording session' }, lang)} width={800} height={450} unoptimized style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <p style={{ fontFamily: sans, fontSize: '0.7rem', color: '#999', textAlign: 'center', marginBottom: 'clamp(1.5rem, 2vw, 2rem)', letterSpacing: '0.05em' }}>
            {t3({ ja: '金田式バランス電流伝送DC録音', en: 'Kaneda-style Balanced Current-Transmission DC Recording', ko: '카네다식 밸런스 전류 전송 DC 녹음', pt: 'Gravação DC Kaneda por Transmissão Balanceada', es: 'Grabación DC Kaneda por Transmisión Balanceada' }, lang)}
          </p>

          <div style={bodyText}>{t3n(KANEDA_SECTION, lang)}</div>
        </div>
      </Section>

      {/* ═══ SOFTWARE ENGINEERING ═══ */}
      <Section>
        <div ref={r4.ref} style={r4.style}>
          <div style={goldLine} />
          <h2 style={sectionTitle}>{t3(H_SOFTWARE, lang)}</h2>

          {/* Tech stack pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
            {['Next.js', 'TypeScript', 'Rust', 'WebAssembly', 'Cloudflare Workers', 'Web Audio API', 'Stripe API', 'Hono', 'R2 / KV'].map(t => (
              <span key={t} style={{
                fontFamily: sans, fontSize: '0.68rem', color: ACCENT, border: `1px solid ${ACCENT}33`,
                padding: '0.3rem 0.7rem', borderRadius: 50, letterSpacing: '0.05em', background: `${ACCENT}08`,
              }}>{t}</span>
            ))}
          </div>

          <div style={bodyText}>{t3n(SOFTWARE_SECTION, lang)}</div>
        </div>
      </Section>

      {/* ═══ REVOX / HARDWARE ═══ */}
      <Section bg="#fff">
        <div ref={r5.ref} style={r5.style}>
          <div style={goldLine} />
          <h2 style={sectionTitle}>{t3(H_REVOX, lang)}</h2>

          {/* Revox image grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(0.8rem, 1.5vw, 1.2rem)',
            marginBottom: 'clamp(2rem, 3vw, 2.5rem)',
          }}>
            {['/revox04.jpeg', '/revox01.jpeg', '/revox06.jpg'].map((src) => (
              <div key={src} style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
                <Image src={src} alt="Revox restoration" width={400} height={300} unoptimized style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
          <p style={{ fontFamily: sans, fontSize: '0.7rem', color: '#999', textAlign: 'center', marginBottom: 'clamp(1.5rem, 2vw, 2rem)', letterSpacing: '0.05em' }}>
            {t3({ ja: 'Revox ヴィンテージオープンリールデッキの修復', en: 'Restoration of vintage Revox open-reel tape decks', ko: '빈티지 Revox 오픈릴 데크 복원', pt: 'Restauração de decks vintage Revox', es: 'Restauración de decks vintage Revox' }, lang)}
          </p>

          <div style={bodyText}>{t3n(REVOX_SECTION, lang)}</div>
        </div>
      </Section>

      {/* ═══ CURANZ SOUNDS ═══ */}
      <Section>
        <div ref={r6.ref} style={r6.style}>
          <div style={goldLine} />
          <h2 style={sectionTitle}>{t3(H_CURANZ, lang)}</h2>

          {/* Curanz Sounds image */}
          <div style={{
            margin: '0 0 clamp(2rem, 3vw, 2.5rem)',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            maxWidth: 500,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <Image src="/A_sacred_geometric_mandala_of_golden_light_radiati-1775290235667.png" alt="Curanz Sounds" width={500} height={500} unoptimized style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>

          <div style={bodyText}>{t3n(CURANZ_SECTION, lang)}</div>

          <div style={{ textAlign: 'center', marginTop: 'clamp(1.5rem, 2vw, 2rem)' }}>
            <a href="https://curanzsounds.com" target="_blank" rel="noopener noreferrer" style={{
              fontFamily: sans, fontSize: '0.82rem', color: GOLD, textDecoration: 'none',
              letterSpacing: '0.12em', borderBottom: `1px solid ${GOLD}44`, paddingBottom: 2,
            }}>
              curanzsounds.com →
            </a>
          </div>
        </div>
      </Section>

      {/* ═══ VISION / CONVERGENCE ═══ */}
      <Section bg="#fff">
        <div ref={r7.ref} style={r7.style}>
          <div style={goldLine} />
          <h2 style={sectionTitle}>{t3(H_VISION, lang)}</h2>

          {/* Four discipline diagram */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)', marginBottom: 'clamp(2rem, 3vw, 2.5rem)',
          }}>
            {[
              { icon: '🎵', label: { ja: '音楽・芸術', en: 'Music & Art', ko: '음악 · 예술', pt: 'Música & Arte', es: 'Música & Arte' } },
              { icon: '🔬', label: { ja: '音響工学', en: 'Acoustic Engineering', ko: '음향공학', pt: 'Engenharia Acústica', es: 'Ingeniería Acústica' } },
              { icon: '💻', label: { ja: 'ソフトウェア設計', en: 'Software Architecture', ko: '소프트웨어 설계', pt: 'Arquitetura de Software', es: 'Arquitectura de Software' } },
              { icon: '🔧', label: { ja: 'ハードウェア設計', en: 'Hardware Design', ko: '하드웨어 설계', pt: 'Design de Hardware', es: 'Diseño de Hardware' } },
            ].map(d => (
              <div key={d.icon} style={{
                textAlign: 'center', padding: 'clamp(1.2rem, 2vw, 1.8rem)',
                background: '#fafafa', borderRadius: 12, border: '1px solid rgba(0,0,0,0.04)',
              }}>
                <span style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)', display: 'block', marginBottom: '0.6rem' }}>{d.icon}</span>
                <span style={{ fontFamily: serif, fontSize: 'clamp(0.78rem, 1vw, 0.88rem)', color: '#333', letterSpacing: '0.05em' }}>{t3(d.label, lang)}</span>
              </div>
            ))}
          </div>

          <div style={bodyText}>{t3n(VISION_SECTION, lang)}</div>
        </div>
      </Section>

      {/* ═══ LINKS ═══ */}
      <Section>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
          {[
            { href: 'https://kotaroasahina.com', label: { ja: 'Official Website & Blog', en: 'Official Website & Blog', ko: '공식 웹사이트 & 블로그', pt: 'Website Oficial & Blog', es: 'Sitio Oficial & Blog' } },
            { href: 'https://www.instagram.com/kotaro_asahina/', label: { ja: 'Instagram', en: 'Instagram', ko: 'Instagram', pt: 'Instagram', es: 'Instagram' } },
            { href: 'https://curanzsounds.com', label: { ja: 'Curanz Sounds', en: 'Curanz Sounds', ko: 'Curanz Sounds', pt: 'Curanz Sounds', es: 'Curanz Sounds' } },
          ].map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: sans, fontSize: '0.82rem', color: '#555', textDecoration: 'none',
              padding: '0.9rem 2.2rem', borderRadius: 50, border: '1px solid rgba(0,0,0,0.08)',
              background: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {t3(l.label, lang)}
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'clamp(3rem, 5vw, 4rem)' }}>
          <Link href="/" style={{ fontFamily: sans, fontSize: '0.8rem', color: '#999', textDecoration: 'none' }}>
            {t3({ ja: '← トップに戻る', en: '← Back to Top', ko: '← 홈으로', pt: '← Voltar ao Início', es: '← Volver al Inicio' }, lang)}
          </Link>
        </div>
      </Section>

    </div>
  );
}
