'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─── Design tokens ───
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#8b5cf6';    // kuon-rnd signature purple
const GOLD = '#f59e0b';
const DEEP = '#1e293b';

type L5 = Partial<Record<Lang, string>> & { en: string };
const t = (m: L5, lang: Lang) => m[lang] ?? m.en;

// ─── Reveal on scroll ───
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
  return <section ref={ref} className="reveal" id={id} style={{ marginBottom: 'clamp(56px, 10vw, 96px)', ...style }}>{children}</section>;
}

// ──────────────────────────────────────────────────────────────────────
// i18n
// ──────────────────────────────────────────────────────────────────────
const T = {
  heroKicker: {
    ja: '空音開発 for 教育機関',
    en: 'Kuon R&D for Institutions',
    es: 'Kuon R&D para Instituciones',
    pt: 'Kuon R&D para Instituicoes',
    ko: 'Kuon R&D for Institutions',
  } as L5,
  heroTitle: {
    ja: '世界のどの音楽学校にも、\n適応する学習環境を。',
    en: 'A learning environment that adapts\nto music schools anywhere in the world.',
    es: 'Un entorno de aprendizaje que se adapta\na escuelas de musica en cualquier parte del mundo.',
    pt: 'Um ambiente de aprendizagem que se adapta\na escolas de musica em qualquer parte do mundo.',
    ko: '세계 어느 음악학교에도\n적응하는 학습 환경.',
  } as L5,
  heroSub: {
    ja: '5言語 × 4記譜体系 — ドレミ（固定ド）・ドイツ音名・英語音名・日本音名。\nラテンアメリカの音楽院から、日本の音楽高校、ヨーロッパのコンセルバトワールまで。',
    en: '5 languages x 4 notation systems — Italian solfege (fixed-do), German, English, and Japanese.\nFrom Latin American conservatorios to Japanese music high schools to European conservatoires.',
    es: '5 idiomas x 4 sistemas de notacion — solfeo italiano (do-fijo), aleman, ingles y japones.\nDesde conservatorios latinoamericanos hasta escuelas de musica japonesas y europeas.',
    pt: '5 idiomas x 4 sistemas de notacao — solfejo italiano (do-fixo), alemao, ingles e japones.\nDe conservatorios latino-americanos a escolas de musica japonesas e conservatorios europeus.',
    ko: '5개 언어 x 4개 기보 체계 — 이탈리아 솔페주, 독일, 영어, 일본 음명.\n라틴 아메리카 음악원에서 일본 음악 고등학교, 유럽 콘세르바토리까지.',
  } as L5,
  heroCta: {
    ja: '導入のご相談',
    en: 'Request Institutional Access',
    es: 'Solicitar Acceso Institucional',
    pt: 'Solicitar Acesso Institucional',
    ko: '기관 도입 문의',
  } as L5,
  heroCtaSub: {
    ja: 'パイロット導入・無料トライアルのご案内も可能です',
    en: 'Pilot programs and free trials available',
    es: 'Disponibles programas piloto y pruebas gratuitas',
    pt: 'Disponiveis programas piloto e testes gratuitos',
    ko: '파일럿 도입과 무료 체험 안내 가능',
  } as L5,

  // ── Who we serve ──
  whoTitle: {
    ja: 'ご利用いただいている教育現場',
    en: 'Who we serve',
    es: 'Para quienes trabajamos',
    pt: 'Para quem trabalhamos',
    ko: '우리의 대상',
  } as L5,
  whoSub: {
    ja: '国・言語・記譜体系の違いを越えて、1つの学習基盤ですべての学生を支えます。',
    en: 'One learning platform that transcends borders, languages, and notation traditions.',
    es: 'Una plataforma de aprendizaje que trasciende fronteras, idiomas y tradiciones de notacion.',
    pt: 'Uma plataforma de aprendizagem que transcende fronteiras, idiomas e tradicoes de notacao.',
    ko: '국가·언어·기보 체계를 넘어 하나의 학습 기반으로 모든 학생을 지원합니다.',
  } as L5,

  // ── Value props ──
  valueTitle: {
    ja: '教育機関が選ぶ5つの理由',
    en: 'Five reasons institutions choose Kuon R&D',
    es: 'Cinco razones por las que las instituciones eligen Kuon R&D',
    pt: 'Cinco razoes pelas quais as instituicoes escolhem Kuon R&D',
    ko: '기관이 Kuon R&D를 선택하는 5가지 이유',
  } as L5,

  // ── How it works ──
  howTitle: {
    ja: '導入から運用まで',
    en: 'From onboarding to daily use',
    es: 'De la implementacion al uso diario',
    pt: 'Do onboarding ao uso diario',
    ko: '도입부터 운용까지',
  } as L5,

  // ── Pricing ──
  pricingTitle: {
    ja: '教育機関向けプラン',
    en: 'Institutional plans',
    es: 'Planes institucionales',
    pt: 'Planos institucionais',
    ko: '기관용 플랜',
  } as L5,
  pricingSub: {
    ja: '10席から。年間契約・学期契約どちらも対応可能。パイロット導入は3ヶ月無料。',
    en: 'Starts at 10 seats. Annual or semester contracts available. 3-month pilot deployment is free.',
    es: 'Desde 10 plazas. Contratos anuales o semestrales. Piloto de 3 meses gratis.',
    pt: 'A partir de 10 assentos. Contratos anuais ou semestrais. Piloto de 3 meses gratuito.',
    ko: '10석부터. 연간·학기 계약 모두 대응. 파일럿 도입은 3개월 무료.',
  } as L5,

  // ── FAQ ──
  faqTitle: {
    ja: 'よくあるご質問',
    en: 'Frequently asked questions',
    es: 'Preguntas frecuentes',
    pt: 'Perguntas frequentes',
    ko: '자주 묻는 질문',
  } as L5,

  // ── Final CTA / form ──
  formTitle: {
    ja: '導入をご検討の教育機関の方へ',
    en: 'For institutions considering adoption',
    es: 'Para instituciones que estan considerando la adopcion',
    pt: 'Para instituicoes considerando a adocao',
    ko: '도입을 검토 중인 교육기관께',
  } as L5,
  formSub: {
    ja: '担当者が1〜3営業日以内にご返信いたします。パイロット導入・デモ・個別機能要望などお気軽にご相談ください。',
    en: 'A team member will respond within 1–3 business days. Feel free to inquire about pilot programs, demos, or custom feature requests.',
    es: 'Un miembro del equipo respondera en 1–3 dias habiles. No dude en consultar sobre programas piloto, demos o solicitudes personalizadas.',
    pt: 'Um membro da equipe respondera em 1–3 dias uteis. Sinta-se a vontade para perguntar sobre programas piloto, demos ou solicitacoes personalizadas.',
    ko: '담당자가 1–3영업일 이내에 답변드립니다. 파일럿 도입·데모·개별 기능 요청 등 부담없이 문의해 주세요.',
  } as L5,

  fInstitution: { ja: '教育機関名', en: 'Institution name', es: 'Nombre de la institucion', pt: 'Nome da instituicao', ko: '교육기관명' } as L5,
  fRole: { ja: 'ご担当者の役職', en: 'Your role', es: 'Su cargo', pt: 'Seu cargo', ko: '담당자 직책' } as L5,
  fCountry: { ja: '国・地域', en: 'Country / region', es: 'Pais / region', pt: 'Pais / regiao', ko: '국가·지역' } as L5,
  fStudents: { ja: '想定利用学生数', en: 'Estimated student count', es: 'Numero estimado de estudiantes', pt: 'Numero estimado de estudantes', ko: '예상 이용 학생 수' } as L5,
  fName: { ja: 'お名前', en: 'Your name', es: 'Su nombre', pt: 'Seu nome', ko: '이름' } as L5,
  fEmail: { ja: 'メールアドレス', en: 'Email address', es: 'Correo electronico', pt: 'E-mail', ko: '이메일' } as L5,
  fMessage: { ja: 'ご相談内容', en: 'Message', es: 'Mensaje', pt: 'Mensagem', ko: '상담 내용' } as L5,
  fSubmit: { ja: '送信する', en: 'Send inquiry', es: 'Enviar consulta', pt: 'Enviar consulta', ko: '전송하기' } as L5,
};

// ──────────────────────────────────────────────────────────────────────
// WHO WE SERVE (audience pillars)
// ──────────────────────────────────────────────────────────────────────
interface Pillar {
  icon: string;
  region: L5;
  titles: L5;
  notation: string;
  detail: L5;
  color: string;
}
const PILLARS: Pillar[] = [
  {
    icon: '🎻',
    region: { ja: 'ラテンアメリカ・ヨーロッパ', en: 'Latin America & Europe', es: 'America Latina y Europa', pt: 'America Latina e Europa', ko: '라틴 아메리카·유럽' },
    titles: { ja: '音楽院・コンセルバトワール', en: 'Conservatorios & conservatoires', es: 'Conservatorios', pt: 'Conservatorios', ko: '음악원·콘세르바토리' },
    notation: 'Do Re Mi / Solfège',
    detail: {
      ja: 'アルゼンチン・メキシコ・ブラジル・スペイン・イタリア・フランスの音楽院で標準となっている固定ド・ソルフェージュに完全対応。英語・ドイツ語との併記も切替可能。',
      en: 'Full support for the fixed-do solfège system used as standard across conservatorios in Argentina, Mexico, Brazil, Spain, Italy, and France. Switchable to parallel English or German notation.',
      es: 'Soporte completo para el sistema solfeo do-fijo usado como estandar en conservatorios de Argentina, Mexico, Brasil, Espana, Italia y Francia. Cambiable a notacion paralela en ingles o aleman.',
      pt: 'Suporte completo para o sistema do-fixo usado como padrao em conservatorios da Argentina, Mexico, Brasil, Espanha, Italia e Franca. Comutavel para notacao paralela em ingles ou alemao.',
      ko: '아르헨티나·멕시코·브라질·스페인·이탈리아·프랑스 음악원에서 표준인 고정도 솔페주 완벽 대응. 영어·독일어와의 병기도 전환 가능.',
    },
    color: GOLD,
  },
  {
    icon: '🎓',
    region: { ja: '日本', en: 'Japan', es: 'Japon', pt: 'Japao', ko: '일본' },
    titles: { ja: '音楽大学・音楽高校・大学音楽学部', en: 'Music universities, music high schools, and music departments', es: 'Universidades de musica, escuelas secundarias de musica y departamentos de musica', pt: 'Universidades de musica, escolas secundarias de musica e departamentos de musica', ko: '음악대학·음악고등학교·대학 음악학부' },
    notation: '日本音名 (Iroha) / Deutsch',
    detail: {
      ja: '楽典試験の日本音名（イロハ式）、ソルフェージュの固定ド、クラシックのドイツ音名を1画面で切り替え。入試対策と実戦スキルを同時に磨ける唯一のプラットフォーム。',
      en: 'Seamlessly switch between Iroha notation (required for music theory exams), fixed-do solfège, and German notation. The only platform where exam preparation and real-world musical skills are trained together.',
      es: 'Cambia sin problemas entre notacion Iroha (requerida para examenes de teoria musical), solfeo do-fijo y notacion alemana. La unica plataforma donde la preparacion de examenes y las habilidades musicales reales se entrenan juntas.',
      pt: 'Alterne sem problemas entre notacao Iroha (obrigatoria para exames de teoria musical), do-fixo e notacao alema. A unica plataforma onde a preparacao para exames e as habilidades musicais reais sao treinadas juntas.',
      ko: '악전 시험의 이로하 표기, 솔페주 고정도, 클래식의 독일 음명을 한 화면에서 전환. 입시 대비와 실전 기술을 동시에 연마할 수 있는 유일한 플랫폼.',
    },
    color: ACCENT,
  },
  {
    icon: '🎹',
    region: { ja: '全世界', en: 'Worldwide', es: 'Todo el mundo', pt: 'Mundo inteiro', ko: '전 세계' },
    titles: { ja: '私立音楽教室・ピアノ教室・ヤマハ系列校', en: 'Private music academies, piano studios, and music networks', es: 'Academias privadas de musica, estudios de piano y redes musicales', pt: 'Academias particulares de musica, estudios de piano e redes musicais', ko: '사립 음악교실·피아노 교실·음악 네트워크' },
    notation: 'Do Re Mi / English / 日本音名',
    detail: {
      ja: '生徒の年齢層や指導方針に合わせて、教室ごとに記譜体系とUI言語を個別に設定可能。学年・級別クラスの到達度を講師ダッシュボードで一元管理。',
      en: 'Configure notation system and UI language per studio, matching your pedagogical approach and student demographics. Track class-wide and individual progress through the teacher dashboard.',
      es: 'Configure el sistema de notacion y el idioma de la interfaz por estudio, adaptandose a su enfoque pedagogico y demografia estudiantil. Siga el progreso individual y de clase a traves del panel del profesor.',
      pt: 'Configure o sistema de notacao e o idioma da interface por estudio, adaptando-se a sua abordagem pedagogica e demografia estudantil. Acompanhe o progresso individual e de classe pelo painel do professor.',
      ko: '학생의 연령대나 지도 방침에 맞춰 교실별로 기보 체계와 UI 언어를 개별 설정 가능. 학년·급별 클래스 도달도를 강사 대시보드로 일원 관리.',
    },
    color: '#22c55e',
  },
  {
    icon: '🏫',
    region: { ja: '全世界', en: 'Worldwide', es: 'Todo el mundo', pt: 'Mundo inteiro', ko: '전 세계' },
    titles: { ja: '吹奏楽部・オーケストラ・合唱団', en: 'Concert bands, orchestras, and choirs', es: 'Bandas, orquestas y coros', pt: 'Bandas, orquestras e coros', ko: '취주악부·오케스트라·합창단' },
    notation: 'Solfège / Deutsch / English',
    detail: {
      ja: '部員全員の譜読み速度・ピッチ精度・音程感覚を可視化。パート別・楽器別の成長曲線で指導ポイントが一目瞭然。全国コンクール対策に。',
      en: 'Visualize every member\u2019s sight-reading speed, pitch accuracy, and intervallic sense. Section-by-section and instrument-by-instrument growth curves make coaching priorities immediately visible. Ideal for competitions.',
      es: 'Visualice la velocidad de lectura, precision de afinacion y sentido intervalico de cada miembro. Las curvas de crecimiento por seccion y por instrumento hacen las prioridades de entrenamiento inmediatamente visibles.',
      pt: 'Visualize a velocidade de leitura, precisao de afinacao e sentido intervalico de cada membro. Curvas de crescimento por secao e por instrumento tornam as prioridades de coaching imediatamente visiveis.',
      ko: '부원 전원의 악보 읽기 속도·피치 정확도·음정 감각을 가시화. 파트별·악기별 성장 곡선으로 지도 포인트가 한눈에. 콩쿠르 대비에.',
    },
    color: '#ef4444',
  },
];

// ──────────────────────────────────────────────────────────────────────
// VALUE PROPS — 5 reasons
// ──────────────────────────────────────────────────────────────────────
const VALUES: { num: string; title: L5; body: L5 }[] = [
  {
    num: '01',
    title: {
      ja: '世界唯一、4記譜体系 × 5言語の完全対応',
      en: 'Only platform with full 4-notation x 5-language support',
      es: 'La unica plataforma con soporte completo de 4 notaciones x 5 idiomas',
      pt: 'A unica plataforma com suporte completo de 4 notacoes x 5 idiomas',
      ko: '세계 유일, 4기보 체계 x 5개 언어 완벽 대응',
    },
    body: {
      ja: 'ドレミ（イタリア式固定ド）・ドイツ音名・英語音名・日本音名。UI言語と記譜法を独立して設定できるため、留学生・交換学生・国際コースにも対応可能。',
      en: 'Italian solfège (fixed-do), German, English, and Japanese notation. UI language and notation system are configured independently, making the platform ideal for exchange students, international programs, and multilingual faculties.',
      es: 'Solfeo italiano (do-fijo), notacion alemana, inglesa y japonesa. El idioma de la interfaz y el sistema de notacion se configuran de forma independiente, haciendo la plataforma ideal para estudiantes de intercambio y programas internacionales.',
      pt: 'Solfejo italiano (do-fixo), notacao alema, inglesa e japonesa. Idioma da interface e sistema de notacao sao configurados independentemente, tornando a plataforma ideal para estudantes de intercambio e programas internacionais.',
      ko: '이탈리아식 고정도 솔페주·독일 음명·영어 음명·일본 음명. UI 언어와 기보법을 독립 설정할 수 있어 유학생·교환학생·국제 코스에도 대응 가능.',
    },
  },
  {
    num: '02',
    title: {
      ja: 'ブラウザで完結、インストール不要',
      en: 'Runs in the browser — zero installation',
      es: 'Funciona en el navegador — cero instalacion',
      pt: 'Roda no navegador — zero instalacao',
      ko: '브라우저로 완결, 설치 불필요',
    },
    body: {
      ja: '教室のPC、生徒のスマートフォン、タブレット、全てのブラウザで即日利用可能。IT部門の承認や端末管理の手間が発生しません。録音・試聴・変換の全てがブラウザ内で処理され、音声データは一切外部送信されません。',
      en: 'Works instantly on classroom PCs, student smartphones, and tablets — any browser, any OS. No IT-department approvals or device management overhead. Recording, playback, and conversion are all processed in-browser; no audio data is ever transmitted externally.',
      es: 'Funciona al instante en PCs del aula, smartphones de los estudiantes y tablets — cualquier navegador, cualquier sistema operativo. Sin aprobaciones del departamento de TI ni gestion de dispositivos.',
      pt: 'Funciona instantaneamente em PCs de sala de aula, smartphones dos estudantes e tablets — qualquer navegador, qualquer sistema operacional. Sem aprovacoes do departamento de TI nem gestao de dispositivos.',
      ko: '교실 PC, 학생 스마트폰, 태블릿, 모든 브라우저에서 즉시 이용 가능. IT 부서 승인이나 기기 관리 부담이 발생하지 않습니다.',
    },
  },
  {
    num: '03',
    title: {
      ja: '講師ダッシュボードで学生の成長を可視化',
      en: 'Teacher dashboard visualizes every student\u2019s growth',
      es: 'El panel del profesor visualiza el crecimiento de cada estudiante',
      pt: 'Painel do professor visualiza o crescimento de cada estudante',
      ko: '강사 대시보드로 학생의 성장을 가시화',
    },
    body: {
      ja: '譜読み速度・ピッチ精度・調号判定の正答率・練習時間 — 全ての学習データをクラス単位で可視化。入学時から卒業時までの4年間の成長曲線を保存。他のどのプラットフォームにも移行できない、学校独自の資産になります。',
      en: 'Sight-reading speed, pitch accuracy, key-signature identification rates, practice time — visualized at class level. Four-year growth curves from enrollment to graduation are preserved as institutional data that does not transfer to any other platform.',
      es: 'Velocidad de lectura, precision de afinacion, identificacion de armaduras, tiempo de practica — visualizados a nivel de clase. Curvas de crecimiento de cuatro anos, desde la inscripcion hasta la graduacion.',
      pt: 'Velocidade de leitura, precisao de afinacao, identificacao de armaduras, tempo de pratica — visualizados no nivel da classe. Curvas de crescimento de quatro anos, desde a matricula ate a graduacao.',
      ko: '악보 읽기 속도·피치 정확도·조표 판정 정답률·연습 시간 — 모든 학습 데이터를 클래스 단위로 가시화. 입학부터 졸업까지 4년간의 성장 곡선을 보관.',
    },
  },
  {
    num: '04',
    title: {
      ja: '音大卒エンジニアが設計した、音楽家のための道具',
      en: 'Built by a music-school graduate turned engineer',
      es: 'Construido por un graduado de conservatorio convertido en ingeniero',
      pt: 'Construido por um graduado de conservatorio que virou engenheiro',
      ko: '음악대학 졸업 엔지니어가 설계한 음악가를 위한 도구',
    },
    body: {
      ja: '創業者の朝比奈幸太郎は音大卒の音響エンジニア。「自分が学生時代に欲しかった道具」をすべて実装しています。汎用教育サービスでは到達できない、音楽家の実感を基準にした学習体験を提供します。',
      en: 'Founder Kotaro Asahina graduated from a Japanese music university before becoming an audio engineer. Every tool is built around what he wished he had as a student. The result is a learning experience rooted in a musician\u2019s instinct — something generic EdTech platforms cannot replicate.',
      es: 'El fundador Kotaro Asahina se graduo de una universidad japonesa de musica antes de convertirse en ingeniero de audio. Cada herramienta esta construida alrededor de lo que deseaba tener como estudiante.',
      pt: 'O fundador Kotaro Asahina graduou-se em uma universidade japonesa de musica antes de se tornar engenheiro de audio. Cada ferramenta e construida em torno do que ele desejava ter como estudante.',
      ko: '창업자 아사히나 코타로는 음악대학을 졸업한 음향 엔지니어. "학창시절에 원했던 도구"를 모두 구현하고 있습니다. 일반 교육 서비스로는 도달할 수 없는, 음악가의 실감을 기준으로 한 학습 경험을 제공합니다.',
    },
  },
  {
    num: '05',
    title: {
      ja: '15以上の音楽学習ツールを、1契約で全て',
      en: '15+ music learning tools — all in one institutional contract',
      es: '15+ herramientas de aprendizaje musical — todas en un contrato institucional',
      pt: '15+ ferramentas de aprendizagem musical — todas em um contrato institucional',
      ko: '15개 이상의 음악 학습 도구를 1계약으로 전부',
    },
    body: {
      ja: 'SIGHT READING（譜読み）・EAR TRAINING（聴音）・INTERVAL SPEED（音程）・CHORD QUIZ（和声）・TUNER（チューナー）・METRONOME・MASTER CHECK・DDP CHECKER など、音楽学習・録音・編集の全てを1契約でカバー。学生にとっての総合プラットフォームになります。',
      en: 'SIGHT READING, EAR TRAINING, INTERVAL SPEED, CHORD QUIZ, TUNER, METRONOME, MASTER CHECK, DDP CHECKER, and more — every music learning, recording, and editing tool in a single institutional contract. Becomes the students\u2019 one-stop platform.',
      es: 'SIGHT READING, EAR TRAINING, INTERVAL SPEED, CHORD QUIZ, TUNER, METRONOME, MASTER CHECK, DDP CHECKER y mas — cada herramienta de aprendizaje, grabacion y edicion musical en un solo contrato institucional.',
      pt: 'SIGHT READING, EAR TRAINING, INTERVAL SPEED, CHORD QUIZ, TUNER, METRONOME, MASTER CHECK, DDP CHECKER e mais — cada ferramenta de aprendizagem, gravacao e edicao musical em um unico contrato institucional.',
      ko: 'SIGHT READING·EAR TRAINING·INTERVAL SPEED·CHORD QUIZ·TUNER·METRONOME·MASTER CHECK·DDP CHECKER 등 음악 학습·녹음·편집의 모든 것을 1계약으로 커버.',
    },
  },
];

// ──────────────────────────────────────────────────────────────────────
// HOW IT WORKS — 4 steps
// ──────────────────────────────────────────────────────────────────────
const STEPS: { step: string; title: L5; body: L5 }[] = [
  {
    step: 'STEP 1',
    title: { ja: 'お問い合わせ', en: 'Inquiry', es: 'Consulta', pt: 'Consulta', ko: '문의' },
    body: {
      ja: '下のフォームからご連絡ください。1〜3営業日以内に担当者がご返信いたします。',
      en: 'Contact us through the form below. A team member will respond within 1–3 business days.',
      es: 'Contactenos a traves del formulario. Un miembro del equipo respondera en 1–3 dias habiles.',
      pt: 'Entre em contato atraves do formulario. Um membro da equipe respondera em 1–3 dias uteis.',
      ko: '아래 폼으로 연락주세요. 담당자가 1–3영업일 이내에 답변드립니다.',
    },
  },
  {
    step: 'STEP 2',
    title: { ja: 'ヒアリング・デモ', en: 'Discovery & demo', es: 'Descubrimiento y demo', pt: 'Descoberta e demo', ko: '히어링·데모' },
    body: {
      ja: 'オンラインで30分のヒアリング。貴校の指導方針・使用記譜体系・必要機能を伺い、カスタマイズした機能デモをご覧いただきます。',
      en: 'A 30-minute online meeting. We discuss your pedagogical approach, notation preferences, and required features, then walk through a tailored demo.',
      es: 'Una reunion online de 30 minutos. Discutimos su enfoque pedagogico, preferencias de notacion y caracteristicas requeridas, luego presentamos una demo adaptada.',
      pt: 'Uma reuniao online de 30 minutos. Discutimos sua abordagem pedagogica, preferencias de notacao e recursos necessarios, depois apresentamos uma demo personalizada.',
      ko: '온라인으로 30분 히어링. 귀교의 지도 방침·사용 기보 체계·필요 기능을 듣고 맞춤 데모를 보여드립니다.',
    },
  },
  {
    step: 'STEP 3',
    title: { ja: '3ヶ月 無料パイロット', en: '3-month free pilot', es: 'Piloto gratuito de 3 meses', pt: 'Piloto gratuito de 3 meses', ko: '3개월 무료 파일럿' },
    body: {
      ja: '最大50名の学生を対象に、3ヶ月間無料でお試しいただけます。期間中は講師ダッシュボードを含む全機能を利用可能。途中解約は自由です。',
      en: 'Free 3-month trial for up to 50 students. Full access to all features including the teacher dashboard during the trial. Cancel anytime.',
      es: 'Prueba gratuita de 3 meses para hasta 50 estudiantes. Acceso completo a todas las caracteristicas, incluido el panel del profesor. Cancele en cualquier momento.',
      pt: 'Teste gratuito de 3 meses para ate 50 estudantes. Acesso completo a todos os recursos, incluindo o painel do professor. Cancele a qualquer momento.',
      ko: '최대 50명의 학생을 대상으로 3개월 무료 체험. 기간 중 강사 대시보드를 포함한 전 기능 이용 가능. 중도 해약은 자유.',
    },
  },
  {
    step: 'STEP 4',
    title: { ja: '正式契約・運用開始', en: 'Contract & rollout', es: 'Contrato y despliegue', pt: 'Contrato e implantacao', ko: '정식 계약·운용 시작' },
    body: {
      ja: '年間契約・学期契約・月次契約から選択。請求書払い（円・USD・EUR）対応。契約後は担当者が2週間ごとの定例ミーティングで運用をサポートします。',
      en: 'Choose annual, semester, or monthly contracts. Invoice billing in JPY, USD, or EUR. After signing, a dedicated contact supports deployment with bi-weekly check-ins.',
      es: 'Elija contratos anuales, semestrales o mensuales. Facturacion en JPY, USD o EUR. Despues de firmar, un contacto dedicado apoya el despliegue con reuniones quincenales.',
      pt: 'Escolha contratos anuais, semestrais ou mensais. Faturamento em JPY, USD ou EUR. Apos a assinatura, um contato dedicado apoia a implantacao com reunioes quinzenais.',
      ko: '연간·학기·월간 계약 중 선택. 인보이스 결제(엔·USD·EUR) 대응. 계약 후 담당자가 2주마다 정기 미팅으로 운용을 지원합니다.',
    },
  },
];

// ──────────────────────────────────────────────────────────────────────
// PRICING
// ──────────────────────────────────────────────────────────────────────
interface Tier {
  seats: string;
  name: L5;
  perSeat: string;
  hint: L5;
}
const TIERS: Tier[] = [
  {
    seats: '10–49',
    name: { ja: 'スタジオ', en: 'Studio', es: 'Estudio', pt: 'Estudio', ko: '스튜디오' },
    perSeat: '¥380 / $2.8',
    hint: { ja: '個人教室・小規模音楽教室向け', en: 'Private studios, small music academies', es: 'Estudios privados, academias pequenas', pt: 'Estudios privados, academias pequenas', ko: '개인 교실·소규모 음악 교실용' },
  },
  {
    seats: '50–199',
    name: { ja: 'スクール', en: 'School', es: 'Escuela', pt: 'Escola', ko: '스쿨' },
    perSeat: '¥320 / $2.3',
    hint: { ja: '音楽高校・大学音楽学部・吹奏楽部', en: 'Music high schools, university music departments, concert bands', es: 'Escuelas secundarias de musica, departamentos universitarios, bandas', pt: 'Escolas secundarias de musica, departamentos universitarios, bandas', ko: '음악고등학교·대학 음악학부·취주악부' },
  },
  {
    seats: '200+',
    name: { ja: 'コンセルバトワール', en: 'Conservatorio', es: 'Conservatorio', pt: 'Conservatorio', ko: '콘세르바토리' },
    perSeat: {
      en: 'Custom',
    } as unknown as string,
    hint: { ja: '音楽院・複数校ネットワーク・教育委員会', en: 'Conservatorios, multi-campus networks, educational boards', es: 'Conservatorios, redes multi-campus, juntas educativas', pt: 'Conservatorios, redes multi-campus, conselhos educacionais', ko: '음악원·복수 학교 네트워크·교육위원회' },
  },
];

// ──────────────────────────────────────────────────────────────────────
// FAQ
// ──────────────────────────────────────────────────────────────────────
const FAQ: { q: L5; a: L5 }[] = [
  {
    q: {
      ja: '学生のデータはどこに保管されますか？',
      en: 'Where is student data stored?',
      es: 'Donde se almacenan los datos de los estudiantes?',
      pt: 'Onde os dados dos estudantes sao armazenados?',
      ko: '학생 데이터는 어디에 보관됩니까?',
    },
    a: {
      ja: 'Cloudflare（米国・EU・日本のリージョンから選択可能）に暗号化保存されます。音声録音データは全てブラウザ内で処理され、ネットワークに送信されることはありません。EU圏では GDPR、日本では個人情報保護法に準拠します。',
      en: 'Encrypted storage on Cloudflare (region selectable: US, EU, or Japan). Audio recordings are processed entirely in-browser and never leave the student\u2019s device. GDPR-compliant in the EU, APPI-compliant in Japan.',
      es: 'Almacenamiento encriptado en Cloudflare (region seleccionable: EE.UU., UE o Japon). Las grabaciones de audio se procesan completamente en el navegador y nunca salen del dispositivo del estudiante. Cumple GDPR en la UE.',
      pt: 'Armazenamento criptografado na Cloudflare (regiao selecionavel: EUA, UE ou Japao). Gravacoes de audio sao processadas inteiramente no navegador e nunca saem do dispositivo do estudante. Compativel com GDPR na UE.',
      ko: 'Cloudflare(미국·EU·일본 리전에서 선택 가능)에 암호화 저장됩니다. 음성 녹음 데이터는 모두 브라우저 내에서 처리되며 네트워크로 전송되지 않습니다.',
    },
  },
  {
    q: {
      ja: 'SSO（Google Workspace / Microsoft Entra）に対応していますか？',
      en: 'Do you support SSO (Google Workspace / Microsoft Entra)?',
      es: 'Admiten SSO (Google Workspace / Microsoft Entra)?',
      pt: 'Voces suportam SSO (Google Workspace / Microsoft Entra)?',
      ko: 'SSO(Google Workspace / Microsoft Entra)를 지원합니까?',
    },
    a: {
      ja: 'Google Workspace SSO に対応しています。Microsoft Entra、SAML 2.0 は50席以上のスクールプラン以上で対応可能。導入時にご相談ください。',
      en: 'Google Workspace SSO is supported out of the box. Microsoft Entra and SAML 2.0 are available on School plans (50+ seats). Let us know during onboarding.',
      es: 'Google Workspace SSO es compatible de serie. Microsoft Entra y SAML 2.0 estan disponibles en planes School (50+ plazas).',
      pt: 'Google Workspace SSO tem suporte nativo. Microsoft Entra e SAML 2.0 estao disponiveis em planos School (50+ assentos).',
      ko: 'Google Workspace SSO 지원. Microsoft Entra·SAML 2.0 은 50석 이상의 스쿨 플랜부터 대응 가능.',
    },
  },
  {
    q: {
      ja: '請求書払い・年度末一括払いは可能ですか？',
      en: 'Can we pay by invoice / fiscal-year billing?',
      es: 'Podemos pagar por factura / facturacion de ano fiscal?',
      pt: 'Podemos pagar por fatura / faturamento de ano fiscal?',
      ko: '인보이스·연도말 일괄 결제가 가능합니까?',
    },
    a: {
      ja: '可能です。日本円・USD・EUR の請求書払いに対応しています。日本の公立学校・国立大学の会計年度（4月〜翌3月）にも合わせられます。支払い条件の柔軟な対応が可能です。',
      en: 'Yes. Invoice billing is supported in JPY, USD, and EUR. We accommodate Japanese public-school and national-university fiscal years (April–March) as well as standard calendar-year contracts. Flexible payment terms available.',
      es: 'Si. La facturacion por factura es compatible en JPY, USD y EUR. Acomodamos el ano fiscal de escuelas publicas japonesas (abril–marzo) y contratos estandar del ano calendario.',
      pt: 'Sim. O faturamento por fatura e suportado em JPY, USD e EUR. Acomodamos o ano fiscal de escolas publicas japonesas (abril–marco) e contratos padrao do ano calendario.',
      ko: '가능합니다. 엔·USD·EUR 인보이스 결제 대응. 일본 공립학교·국립대학의 회계연도(4월~3월)에도 맞출 수 있습니다.',
    },
  },
  {
    q: {
      ja: 'カリキュラムに合わせた問題セットを作成できますか？',
      en: 'Can we create question sets tailored to our curriculum?',
      es: 'Podemos crear conjuntos de preguntas adaptados a nuestro curriculo?',
      pt: 'Podemos criar conjuntos de perguntas adaptados ao nosso curriculo?',
      ko: '커리큘럼에 맞춘 문제 세트를 작성할 수 있습니까?',
    },
    a: {
      ja: 'School プラン以上で、講師が独自の問題セット・課題・試験範囲を作成・配信できる「アサインメント機能」をご利用いただけます。学期の進度に合わせた柔軟な運用が可能です。',
      en: 'School plans include Assignment functionality, enabling teachers to create custom question sets, homework, and exam-prep material. Instructors can pace content to match the semester\u2019s progression.',
      es: 'Los planes School incluyen funcionalidad de Tareas, permitiendo a los profesores crear conjuntos de preguntas personalizados, tareas y material de preparacion para examenes.',
      pt: 'Os planos School incluem funcionalidade de Tarefas, permitindo que os professores criem conjuntos de perguntas personalizados, lico de casa e material de preparacao para exames.',
      ko: '스쿨 플랜 이상에서 강사가 독자적인 문제 세트·과제·시험 범위를 작성·배포할 수 있는 "과제 기능"을 이용할 수 있습니다.',
    },
  },
  {
    q: {
      ja: '学生が卒業後も自分の学習データを残せますか？',
      en: 'Can students keep their learning data after graduation?',
      es: 'Pueden los estudiantes mantener sus datos de aprendizaje despues de graduarse?',
      pt: 'Os estudantes podem manter seus dados de aprendizagem apos a graduacao?',
      ko: '학생이 졸업 후에도 자신의 학습 데이터를 유지할 수 있습니까?',
    },
    a: {
      ja: 'はい。卒業後は学生個人の空音開発アカウント（月額¥480の Student プラン、または Pro プラン）に学習データを引き継げます。4年間の譜読み成長曲線は学生にとって一生の資産になります。',
      en: 'Yes. Upon graduation, students can migrate their learning history to a personal Kuon R&D account (Student ¥480/mo or Pro plan). Four years of growth data becomes a lifelong personal record.',
      es: 'Si. Al graduarse, los estudiantes pueden migrar su historial de aprendizaje a una cuenta personal de Kuon R&D (plan Student ¥480/mes o plan Pro). Cuatro anos de datos de crecimiento se convierten en un registro personal de por vida.',
      pt: 'Sim. Apos a graduacao, os estudantes podem migrar seu historico de aprendizagem para uma conta pessoal Kuon R&D (plano Student ¥480/mes ou Pro). Quatro anos de dados de crescimento tornam-se um registro pessoal vitalicio.',
      ko: '예. 졸업 후에는 학생 개인의 Kuon R&D 계정(월 ¥480 Student 플랜 또는 Pro 플랜)에 학습 데이터를 계승할 수 있습니다.',
    },
  },
];

// ──────────────────────────────────────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────────────────────────────────────
export default function ForSchoolsPage() {
  const { lang } = useLang();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: sans, color: DEEP }}>
      <style>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* ──── HERO ──── */}
      <section style={{
        padding: 'clamp(100px, 15vw, 160px) clamp(16px, 4vw, 32px) clamp(40px, 8vw, 80px)',
        maxWidth: 900, margin: '0 auto', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block', padding: '6px 14px', borderRadius: 999, background: `${ACCENT}15`,
          color: ACCENT, fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: 24,
        }}>{t(T.heroKicker, lang)}</div>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(28px, 7vw, 56px)', fontWeight: 700,
          lineHeight: 1.3, whiteSpace: 'pre-line', margin: '0 0 20px', letterSpacing: '-0.01em',
        }}>
          {t(T.heroTitle, lang)}
        </h1>
        <p style={{
          fontSize: 'clamp(14px, 3vw, 18px)', color: '#64748b', lineHeight: 1.8,
          whiteSpace: 'pre-line', maxWidth: 680, margin: '0 auto 40px',
        }}>
          {t(T.heroSub, lang)}
        </p>
        <a href="#inquiry" style={{
          display: 'inline-block', padding: '16px 40px',
          background: ACCENT, color: '#fff', borderRadius: 14, fontSize: 'clamp(14px, 3vw, 17px)',
          fontWeight: 700, textDecoration: 'none', letterSpacing: '0.01em',
          boxShadow: `0 8px 30px ${ACCENT}40`,
        }}>
          {t(T.heroCta, lang)}
        </a>
        <div style={{ marginTop: 12, fontSize: 'clamp(11px, 2.5vw, 13px)', color: '#94a3b8' }}>
          {t(T.heroCtaSub, lang)}
        </div>

        {/* Notation system preview strip */}
        <div style={{
          marginTop: 56, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12,
          fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: 'clamp(11px, 2.5vw, 14px)',
        }}>
          <span style={{ padding: '6px 12px', background: `${GOLD}15`, color: GOLD, borderRadius: 8, fontWeight: 600 }}>Do Re Mi</span>
          <span style={{ padding: '6px 12px', background: `${ACCENT}15`, color: ACCENT, borderRadius: 8, fontWeight: 600 }}>Deutsch</span>
          <span style={{ padding: '6px 12px', background: '#22c55e15', color: '#22c55e', borderRadius: 8, fontWeight: 600 }}>English</span>
          <span style={{ padding: '6px 12px', background: '#ef444415', color: '#ef4444', borderRadius: 8, fontWeight: 600 }}>日本音名</span>
        </div>
      </section>

      {/* ──── WHO WE SERVE ──── */}
      <Section style={{ padding: '0 clamp(16px, 4vw, 32px)', maxWidth: 1100, margin: '0 auto clamp(56px, 10vw, 96px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 5vw, 36px)', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
            {t(T.whoTitle, lang)}
          </h2>
          <p style={{ color: '#64748b', fontSize: 'clamp(13px, 2.8vw, 16px)', maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>
            {t(T.whoSub, lang)}
          </p>
        </div>
        <div style={{
          display: 'grid', gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}>
          {PILLARS.map((p, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 18, padding: 'clamp(22px, 4vw, 30px)',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{p.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: p.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                {t(p.region, lang)}
              </div>
              <h3 style={{ fontFamily: serif, fontSize: 'clamp(15px, 3.5vw, 19px)', margin: '0 0 10px', fontWeight: 700, lineHeight: 1.4 }}>
                {t(p.titles, lang)}
              </h3>
              <div style={{
                display: 'inline-block', padding: '4px 10px', background: `${p.color}15`, color: p.color,
                borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 12,
                fontFamily: '"SF Mono", "Fira Code", monospace', alignSelf: 'flex-start',
              }}>
                {p.notation}
              </div>
              <p style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                {t(p.detail, lang)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ──── VALUES ──── */}
      <Section style={{ padding: '0 clamp(16px, 4vw, 32px)', maxWidth: 820, margin: '0 auto clamp(56px, 10vw, 96px)' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 5vw, 36px)', textAlign: 'center', margin: '0 0 48px', letterSpacing: '-0.01em' }}>
          {t(T.valueTitle, lang)}
        </h2>
        <div style={{ display: 'grid', gap: 18 }}>
          {VALUES.map((v, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: 'clamp(22px, 4vw, 32px)',
              border: '1px solid #e2e8f0', display: 'flex', gap: 'clamp(14px, 3vw, 22px)',
              alignItems: 'flex-start',
            }}>
              <span style={{
                fontFamily: serif, fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 700, color: ACCENT,
                lineHeight: 1, minWidth: 48, opacity: 0.4,
              }}>{v.num}</span>
              <div>
                <h3 style={{ fontFamily: serif, fontSize: 'clamp(16px, 3.8vw, 22px)', margin: '0 0 10px', fontWeight: 700, lineHeight: 1.35 }}>
                  {t(v.title, lang)}
                </h3>
                <p style={{ fontSize: 'clamp(13px, 2.8vw, 15px)', color: '#475569', lineHeight: 1.8, margin: 0 }}>
                  {t(v.body, lang)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ──── HOW IT WORKS ──── */}
      <Section style={{ padding: '0 clamp(16px, 4vw, 32px)', maxWidth: 1100, margin: '0 auto clamp(56px, 10vw, 96px)' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 5vw, 36px)', textAlign: 'center', margin: '0 0 48px', letterSpacing: '-0.01em' }}>
          {t(T.howTitle, lang)}
        </h2>
        <div style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: 'clamp(20px, 4vw, 28px)',
              border: '1px solid #e2e8f0', position: 'relative',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.15em', marginBottom: 12 }}>
                {s.step}
              </div>
              <h3 style={{ fontFamily: serif, fontSize: 'clamp(15px, 3.5vw, 18px)', margin: '0 0 10px', fontWeight: 700 }}>
                {t(s.title, lang)}
              </h3>
              <p style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#475569', lineHeight: 1.7, margin: 0 }}>
                {t(s.body, lang)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ──── PRICING ──── */}
      <Section style={{ padding: '0 clamp(16px, 4vw, 32px)', maxWidth: 1000, margin: '0 auto clamp(56px, 10vw, 96px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 5vw, 36px)', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
            {t(T.pricingTitle, lang)}
          </h2>
          <p style={{ color: '#64748b', fontSize: 'clamp(13px, 2.8vw, 16px)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {t(T.pricingSub, lang)}
          </p>
        </div>
        <div style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}>
          {TIERS.map((tier, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: 'clamp(24px, 4vw, 32px)',
              border: i === 1 ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
              position: 'relative',
            }}>
              {i === 1 && (
                <div style={{
                  position: 'absolute', top: -10, left: 24, padding: '3px 10px',
                  background: ACCENT, color: '#fff', borderRadius: 6, fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>POPULAR</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                {t(tier.name, lang)}
              </div>
              <div style={{ fontSize: 'clamp(13px, 2.8vw, 15px)', color: '#64748b', marginBottom: 16 }}>
                {tier.seats} {t({ ja: '席', en: 'seats', es: 'plazas', pt: 'assentos', ko: '석' }, lang)}
              </div>
              <div style={{ fontFamily: serif, fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 700, marginBottom: 4 }}>
                {typeof tier.perSeat === 'string' ? tier.perSeat : t(tier.perSeat, lang)}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>
                {t({ ja: '1席/月・税別', en: 'per seat / month', es: 'por plaza / mes', pt: 'por assento / mes', ko: '1석·월' }, lang)}
              </div>
              <p style={{ fontSize: 'clamp(12px, 2.5vw, 13px)', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {t(tier.hint, lang)}
              </p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
          {t({
            ja: '※ 国・通貨によって価格は変動します。詳細はお問い合わせください。卒業生の個人アカウント移行は無料です。',
            en: '※ Pricing varies by region and currency. Alumni personal account migration is included at no charge.',
            es: '※ Los precios varian por region y moneda. La migracion de cuentas personales de ex alumnos esta incluida sin cargo.',
            pt: '※ Precos variam por regiao e moeda. A migracao de contas pessoais de ex-alunos esta incluida sem custo.',
            ko: '※ 국가·통화에 따라 가격은 변동됩니다. 졸업생 개인 계정 이관은 무료입니다.',
          }, lang)}
        </div>
      </Section>

      {/* ──── FAQ ──── */}
      <Section style={{ padding: '0 clamp(16px, 4vw, 32px)', maxWidth: 820, margin: '0 auto clamp(56px, 10vw, 96px)' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 5vw, 36px)', textAlign: 'center', margin: '0 0 40px', letterSpacing: '-0.01em' }}>
          {t(T.faqTitle, lang)}
        </h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden',
            }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', padding: 'clamp(16px, 3vw, 20px)', background: 'none', border: 'none',
                  textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', gap: 12, fontFamily: sans,
                }}>
                <span style={{ fontFamily: serif, fontSize: 'clamp(14px, 3vw, 17px)', fontWeight: 700, flex: 1 }}>
                  {t(item.q, lang)}
                </span>
                <span style={{
                  fontSize: 18, color: ACCENT, fontWeight: 700, transition: 'transform 0.2s',
                  transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)',
                }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 clamp(16px, 3vw, 20px) clamp(16px, 3vw, 20px)' }}>
                  <p style={{ fontSize: 'clamp(13px, 2.8vw, 15px)', color: '#475569', lineHeight: 1.8, margin: 0 }}>
                    {t(item.a, lang)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ──── INQUIRY FORM ──── */}
      <Section id="inquiry" style={{
        padding: 'clamp(60px, 10vw, 100px) clamp(16px, 4vw, 32px)',
        background: 'linear-gradient(180deg, #fff 0%, #f1f5f9 100%)',
        borderTop: '1px solid #e2e8f0', marginBottom: 0,
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 5vw, 32px)', margin: '0 0 12px', letterSpacing: '-0.01em' }}>
              {t(T.formTitle, lang)}
            </h2>
            <p style={{ color: '#64748b', fontSize: 'clamp(13px, 2.8vw, 15px)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
              {t(T.formSub, lang)}
            </p>
          </div>
          <form
            action="https://formspree.io/f/xyknanzy"
            method="POST"
            style={{
              background: '#fff', borderRadius: 16, padding: 'clamp(24px, 5vw, 36px)',
              border: '1px solid #e2e8f0', display: 'grid', gap: 14,
            }}
          >
            <input type="hidden" name="_subject" value="[for-schools] Institutional inquiry" />
            <input type="hidden" name="source" value="for-schools-page" />

            <FormField name="institution" label={t(T.fInstitution, lang)} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField name="role" label={t(T.fRole, lang)} />
              <FormField name="country" label={t(T.fCountry, lang)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField name="students" label={t(T.fStudents, lang)} type="number" />
              <FormField name="name" label={t(T.fName, lang)} required />
            </div>
            <FormField name="email" label={t(T.fEmail, lang)} type="email" required />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t(T.fMessage, lang)}
              </label>
              <textarea
                name="message"
                rows={5}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                  fontFamily: sans, fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
                  color: DEEP, background: '#fafbfc',
                }}
              />
            </div>
            <button type="submit" style={{
              marginTop: 6, padding: '14px 28px', background: ACCENT, color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 700, cursor: 'pointer', letterSpacing: '0.01em',
              boxShadow: `0 4px 20px ${ACCENT}40`,
            }}>
              {t(T.fSubmit, lang)}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: '#94a3b8' }}>
            {t({
              ja: '個人のお問い合わせはこちら → ',
              en: 'Individual inquiry? → ',
              es: 'Consulta individual? → ',
              pt: 'Consulta individual? → ',
              ko: '개인 문의는 여기로 → ',
            }, lang)}
            <Link href="/#contact" style={{ color: ACCENT, textDecoration: 'underline' }}>
              kuon-rnd.com
            </Link>
          </div>
        </div>
      </Section>

      {/* Related apps footer nav */}
      <section style={{ padding: '40px clamp(16px, 4vw, 32px) 80px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
          {t({ ja: '教育機関で使われるツール', en: 'Tools used in institutions', es: 'Herramientas usadas en instituciones', pt: 'Ferramentas usadas em instituicoes', ko: '기관에서 사용되는 도구' }, lang)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {[
            { href: '/sight-reading-lp', label: 'SIGHT READING' },
            { href: '/ear-training-lp', label: 'EAR TRAINING' },
            { href: '/interval-speed-lp', label: 'INTERVAL SPEED' },
            { href: '/chord-quiz-lp', label: 'CHORD QUIZ' },
            { href: '/counterpoint-lp', label: 'COUNTERPOINT' },
            { href: '/harmony-lp', label: 'HARMONY' },
            { href: '/metronome-lp', label: 'METRONOME' },
            { href: '/tuner-lp', label: 'TUNER' },
            { href: '/transposer-lp', label: 'TRANSPOSER' },
          ].map(app => (
            <Link key={app.href} href={app.href} style={{
              fontSize: 13, color: ACCENT, textDecoration: 'none',
              padding: '6px 12px', borderRadius: 8, border: `1px solid ${ACCENT}30`,
            }}>{app.label}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Form field
// ──────────────────────────────────────────────────────────────────────
function FormField({ name, label, type = 'text', required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b',
        marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
      </label>
      <input
        type={type} name={name} required={required}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
          fontFamily: sans, fontSize: 14, boxSizing: 'border-box',
          color: DEEP, background: '#fafbfc',
        }}
      />
    </div>
  );
}
