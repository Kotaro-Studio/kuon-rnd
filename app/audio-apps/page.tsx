'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const mono  = '"SF Mono", "Fira Code", "Consolas", monospace';

type L5 = Partial<Record<Lang, string>> & { en: string };
const t5 = (m: L5, lang: Lang) => m[lang] ?? m.en;

// ─────────────────────────────────────────────
// Persona & Tier definitions
// ─────────────────────────────────────────────
// Persona = 顧客のジャンル（誰向け）
// Tier    = アクセス層（どう使う）
// この 2 軸をかけ合わせることで、ユーザーは自分に最適なツール群を発見できる。
type Persona = 'engineer' | 'student' | 'producer';
type Tier = 'open' | 'login' | 'pro';

const PERSONA_META: Record<Persona, {
  icon: string;
  label: L5;
  tag: L5;
  lead: L5;
  accent: string;
  gradient: string;
}> = {
  engineer: {
    icon: '🎧',
    label: {
      ja: 'エンジニア', en: 'Engineer', ko: '엔지니어', pt: 'Engenheiro', es: 'Ingeniero',
    },
    tag: {
      ja: 'マスタリング・アーカイブ・フォーマット',
      en: 'Mastering · Archive · Format',
      ko: '마스터링·아카이브·포맷',
      pt: 'Mastering · Arquivamento · Formato',
      es: 'Mastering · Archivado · Formato',
    },
    lead: {
      ja: 'プロエンジニアのための精密ツール群。DDP・DSD・LUFS・True Peak・ジッタ制御。世界初のブラウザ完結ワークフロー。',
      en: 'Precision tools for pro engineers. DDP, DSD, LUFS, True Peak, jitter control — the world\'s first browser-native workflow.',
      ko: '프로 엔지니어를 위한 정밀 도구. DDP·DSD·LUFS·True Peak·지터 제어. 세계 최초 브라우저 완결 워크플로우.',
      pt: 'Ferramentas de precisão para engenheiros profissionais. DDP, DSD, LUFS, True Peak — workflow completo no navegador.',
      es: 'Herramientas de precisión para ingenieros profesionales. DDP, DSD, LUFS, True Peak — flujo completo en navegador.',
    },
    accent: '#0284c7',
    gradient: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
  },
  student: {
    icon: '🎓',
    label: {
      ja: '音大生・学習者', en: 'Student', ko: '학습자', pt: 'Estudante', es: 'Estudiante',
    },
    tag: {
      ja: '練習・聴音・音楽理論',
      en: 'Practice · Ear · Theory',
      ko: '연습·청음·이론',
      pt: 'Prática · Ouvido · Teoria',
      es: 'Práctica · Oído · Teoría',
    },
    lead: {
      ja: '毎日の練習を支え、4年後の成長を形にする。チューナー、聴音、和声、対位法——音大生のために設計された学習パートナー。',
      en: 'Support your daily practice, visualize your growth over 4 years. Tuner, ear training, harmony, counterpoint — built for music students.',
      ko: '매일의 연습을 지원하고 4년 후의 성장을 형태로. 튜너, 청음, 화성, 대위법 — 음대생을 위한 학습 파트너.',
      pt: 'Apoie sua prática diária e visualize seu crescimento ao longo de 4 anos. Afinador, treino auditivo, harmonia, contraponto — feito para estudantes.',
      es: 'Apoya tu práctica diaria y visualiza tu crecimiento en 4 años. Afinador, entrenamiento auditivo, armonía, contrapunto — para estudiantes.',
    },
    accent: '#8b5cf6',
    gradient: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
  },
  producer: {
    icon: '🎼',
    label: {
      ja: 'プロ制作', en: 'Pro Creator', ko: '프로 제작', pt: 'Criador Pro', es: 'Creador Pro',
    },
    tag: {
      ja: '録音・ミックス・AI 分離',
      en: 'Record · Mix · AI Separation',
      ko: '녹음·믹스·AI 분리',
      pt: 'Gravação · Mixagem · IA',
      es: 'Grabación · Mezcla · IA',
    },
    lead: {
      ja: '複雑な処理を要するプロ制作者のためのツール群。AI 音源分離、クリッピング復元、ノイズ除去。サーバーサイド処理を含む。',
      en: 'Tools for pro creators who need heavy processing. AI source separation, declipping, noise reduction — includes server-side processing.',
      ko: '복잡한 처리가 필요한 프로 제작자를 위한 도구. AI 음원 분리, 클리핑 복원, 노이즈 제거 — 서버 처리 포함.',
      pt: 'Ferramentas para criadores profissionais. Separação de fontes com IA, declipping, redução de ruído — com processamento no servidor.',
      es: 'Herramientas para creadores profesionales. Separación con IA, declipping, reducción de ruido — con procesamiento en servidor.',
    },
    accent: '#dc2626',
    gradient: 'linear-gradient(135deg,#dc2626,#f59e0b)',
  },
};

const TIER_META: Record<Tier, { label: L5; bg: string; color: string; dot: string; desc: L5 }> = {
  open: {
    label: { en: 'FREE' },
    bg: 'rgba(5,150,105,0.12)', color: '#059669', dot: '#059669',
    desc: {
      ja: 'ログイン不要・無制限',
      en: 'No login · Unlimited',
      ko: '로그인 불필요 · 무제한',
      pt: 'Sem login · Ilimitado',
      es: 'Sin login · Ilimitado',
    },
  },
  login: {
    label: { en: 'LOGIN' },
    bg: 'rgba(2,132,199,0.12)', color: '#0284c7', dot: '#0284c7',
    desc: {
      ja: '無料登録・データ蓄積',
      en: 'Free signup · Data saved',
      ko: '무료 가입 · 데이터 저장',
      pt: 'Cadastro grátis · Dados salvos',
      es: 'Registro gratis · Datos guardados',
    },
  },
  pro: {
    label: { en: 'PRO' },
    bg: 'rgba(245,158,11,0.12)', color: '#d97706', dot: '#f59e0b',
    desc: {
      ja: 'サーバー処理・サブスク',
      en: 'Server processing · Subscription',
      ko: '서버 처리 · 구독',
      pt: 'Processamento · Assinatura',
      es: 'Servidor · Suscripción',
    },
  },
};

// ─────────────────────────────────────────────
// Plan badge — shown prominently on each card.
//  "FREE"          : browser-complete or free-signup apps (anyone can use, no paid plan required)
//  "STUDENT · PRO" : subscription apps (Student plan & Pro plan both include; Pro covers everything)
// 洗練された雰囲気を保ちつつ、無料アプリが一目でわかるデザイン。
// ─────────────────────────────────────────────
type PlanBadgeStyle = {
  label: string;
  accent: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  isFree: boolean;
};

function planBadge(tier: Tier): PlanBadgeStyle {
  if (tier === 'pro') {
    return {
      label: 'STUDENT · PRO',
      accent: '#b45309',
      bgGradient: 'linear-gradient(135deg, rgba(254,243,199,0.95), rgba(253,230,138,0.95))',
      borderColor: 'rgba(217,119,6,0.5)',
      textColor: '#92400e',
      isFree: false,
    };
  }
  // open / login: both are free (login just requires a free account)
  return {
    label: 'FREE',
    accent: '#059669',
    bgGradient: 'linear-gradient(135deg, rgba(209,250,229,0.95), rgba(167,243,208,0.92))',
    borderColor: 'rgba(5,150,105,0.42)',
    textColor: '#065f46',
    isFree: true,
  };
}

// ─────────────────────────────────────────────
// App data — each app can belong to multiple personas
// NOTE: href values and app system paths are UNCHANGED.
// ─────────────────────────────────────────────
type AppEntry = {
  id: string;
  personas: Persona[];
  tier: Tier;
  badge: string;
  name: string;
  tagline: L5;
  desc: L5;
  href: string;
  accent: string;
  replaces?: L5;       // 競合ソフト置換訴求（IQ180）
  isNew?: boolean;
  isComingSoon?: boolean;
};

const apps: AppEntry[] = [
  // ─── STUDENT primary (教育学習) ───
  {
    id: 'tuner', personas: ['student'], tier: 'open',
    badge: 'YIN', name: 'KUON TUNER PRO',
    tagline: {
      ja: 'あなたの耳は、もっと正確さを求めている。',
      en: 'Your ears deserve better precision.',
      ko: '당신의 귀는 더 정확한 튜너를 원합니다.',
      pt: 'Seus ouvidos merecem mais precisão.',
      es: 'Tus oídos merecen más precisión.',
    },
    desc: {
      ja: 'YINアルゴリズム高精度チューナー。移調楽器対応。ストリーク・アチーブメント・セッション統計。',
      en: 'YIN algorithm precision tuner. Transposing instruments. Streaks, achievements, session stats.',
      ko: 'YIN 알고리즘 고정밀 튜너. 이조 악기 지원. 스트릭, 업적, 세션 통계.',
      pt: 'Afinador de precisão YIN. Instrumentos transpositores. Streaks, conquistas, estatísticas.',
      es: 'Afinador de precisión YIN. Instrumentos transpositores. Rachas, logros, estadísticas.',
    },
    href: '/tuner-lp', accent: '#22c55e', isNew: true,
  },
  {
    id: 'ear-training', personas: ['student'], tier: 'open',
    badge: 'EAR', name: 'KUON EAR TRAINING',
    tagline: {
      ja: '聴音力を鍛える。毎日10分で変わる。',
      en: 'Train your ear. 10 minutes a day changes everything.',
      ko: '청음력을 키우세요. 하루 10분이면 달라집니다.',
      pt: 'Treine seu ouvido. 10 minutos por dia mudam tudo.',
      es: 'Entrena tu oído. 10 minutos al día lo cambian todo.',
    },
    desc: {
      ja: '音程・和音・音階・聴音の4モードトレーニング。レベルアップ制・アチーブメント・ストリークで楽しく継続。音大受験対策に。',
      en: 'Intervals, chords, scales, dictation — 4-mode ear training. Level-up system, achievements & streaks. Exam prep.',
      ko: '음정, 화음, 음계, 청음 — 4가지 모드 훈련. 레벨업 시스템, 업적, 스트릭으로 즐겁게 계속. 시험 대비.',
      pt: 'Intervalos, acordes, escalas, ditado — 4 modos. Sistema de níveis, conquistas e sequências. Preparação para provas.',
      es: 'Intervalos, acordes, escalas, dictado — 4 modos. Sistema de niveles, logros y rachas. Preparación para exámenes.',
    },
    href: '/ear-training-lp', accent: '#8b5cf6', isNew: true,
  },
  {
    id: 'chord-quiz', personas: ['student'], tier: 'open',
    badge: 'CHORD', name: 'KUON CHORD QUIZ',
    tagline: {
      ja: '和音が「聴こえる」ようになる。',
      en: 'Truly hear the chords.',
      ko: '화음이 "들리게" 됩니다.',
      pt: 'Realmente ouça os acordes.',
      es: 'Realmente escucha los acordes.',
    },
    desc: {
      ja: '14種類の和音判定・転回形・コード進行の3モード。ピアノ音色と鍵盤ビジュアルで直感的に学ぶ。',
      en: '14 chord types, inversions & progressions — 3 modes. Piano timbre with keyboard visualization.',
      ko: '14종류 화음 판별·전위·코드 진행 3모드. 피아노 음색과 건반 시각화로 직관적 학습.',
      pt: '14 tipos de acordes, inversões e progressões — 3 modos. Timbre de piano com visualização de teclado.',
      es: '14 tipos de acordes, inversiones y progresiones — 3 modos. Timbre de piano con visualización de teclado.',
    },
    href: '/chord-quiz-lp', accent: '#8b5cf6', isNew: true,
  },
  {
    id: 'interval-speed', personas: ['student'], tier: 'open',
    badge: 'SPEED', name: 'KUON INTERVAL SPEED',
    tagline: {
      ja: '1秒以内に答えられるか？',
      en: 'Can you answer in under 1 second?',
      ko: '1초 안에 대답할 수 있나요?',
      pt: 'Consegue responder em menos de 1 segundo?',
      es: '¿Puedes responder en menos de 1 segundo?',
    },
    desc: {
      ja: '音程の反射速度を競うスピードゲーム。Easy/Medium/Hardの3段階、20ラウンド制。スコア＆自己ベスト記録。',
      en: 'Speed-based interval reaction game. 3 difficulty levels, 20 rounds. Score & personal best tracking.',
      ko: '음정 반사 속도를 겨루는 스피드 게임. Easy/Medium/Hard 3단계, 20라운드. 스코어 & 자기 최고 기록.',
      pt: 'Jogo de velocidade de identificação de intervalos. 3 níveis, 20 rodadas. Pontuação e recordes pessoais.',
      es: 'Juego de velocidad de identificación de intervalos. 3 niveles, 20 rondas. Puntuación y récords personales.',
    },
    href: '/interval-speed-lp', accent: '#8b5cf6', isNew: true,
  },
  {
    id: 'metronome', personas: ['student', 'producer'], tier: 'open',
    badge: 'METRO', name: 'KUON METRONOME',
    tagline: {
      ja: 'プロの音楽家が監修した、最高のメトロノーム。',
      en: 'The finest metronome, supervised by a pro musician.',
      ko: '프로 음악가가 감수한 최고의 메트로놈.',
      pt: 'O melhor metrônomo, supervisionado por um músico profissional.',
      es: 'El mejor metrónomo, supervisado por un músico profesional.',
    },
    desc: {
      ja: 'サイレントバー練習・スピードトレーナー・ポリリズム・スウィング・変拍子・メトリックモジュレーション・クラーベパターン・ビートディスプレイスメント・オーバーザバーライン。13のプロ機能。',
      en: 'Silent bar, speed trainer, polyrhythm, swing, irregular meters, metric modulation, clave patterns, beat displacement, over-the-barline. 13 pro features.',
      ko: '사일런트 바·스피드 트레이너·폴리리듬·스윙·변박자·메트릭 모듈레이션·클라베·비트 디스플레이스먼트·오버 더 바라인. 13가지 프로 기능.',
      pt: 'Prática silenciosa, velocidade, polirritmia, swing, irregulares, modulação métrica, clave, deslocamento, sobre a barra. 13 recursos pro.',
      es: 'Práctica silenciosa, velocidad, polirritmia, swing, irregulares, modulación métrica, clave, desplazamiento, sobre la barra. 13 funciones pro.',
    },
    href: '/metronome-lp', accent: '#8b5cf6', isNew: true,
  },
  {
    id: 'sight-reading', personas: ['student'], tier: 'open',
    badge: 'READING', name: 'KUON SIGHT READING',
    tagline: {
      ja: '譜面を読む力を、鍛える。',
      en: 'Train your music reading skills.',
      ko: '악보 읽는 힘을 기르자.',
      pt: 'Treine sua leitura musical.',
      es: 'Entrena tu lectura musical.',
    },
    desc: {
      ja: '音名読み・調号判定・音部記号・記譜変換の4モード。ドイツ音名・英語音名・日本音名の3記譜体系に完全対応。ト音・ヘ音・アルト・テノール記号。レベルアップ制。',
      en: '4 modes: note reading, key signature, clef reading, notation conversion. Full support for German, English & Japanese notation systems. Treble, bass, alto & tenor clefs.',
      ko: '음이름·조표·음자리표·기보 변환 4모드. 독일·영어·일본 음명 3체계 완벽 대응. 높은·낮은·알토·테너 음자리표. 레벨업 시스템.',
      pt: '4 modos: notas, armadura, claves, conversao de notacao. Suporte completo para notacao alema, inglesa e japonesa. Sol, fa, alto e tenor.',
      es: '4 modos: notas, armadura, claves, conversion de notacion. Soporte completo para notacion alemana, inglesa y japonesa. Sol, fa, alto y tenor.',
    },
    href: '/sight-reading-lp', accent: '#8b5cf6', isNew: true,
  },
  {
    id: 'harmony', personas: ['student', 'producer'], tier: 'open',
    badge: 'HARMONY', name: 'KUON HARMONY',
    tagline: {
      ja: '提出前に、和声課題をチェック。',
      en: 'Check your harmony homework before submitting.',
      ko: '제출 전에 화성 과제를 체크.',
      pt: 'Verifique seus exercícios antes de entregar.',
      es: 'Revisa tus ejercicios antes de entregar.',
    },
    desc: {
      ja: '四声体（SATB）のリアルタイムチェッカー。並達5度・8度・隠伏5度・声部交差・導音重複・増2度など10項目を即座に検出。全調対応。',
      en: 'Real-time SATB checker. Detects parallel 5ths/8ths, hidden 5ths, voice crossing, doubled leading tone, augmented 2nd. 10 rules. All keys.',
      ko: '4성부(SATB) 실시간 체커. 병행 5도/8도·은복5도·성부교차·이끔음 중복·증2도 등 10항목 검출. 전조 대응.',
      pt: 'Verificador SATB em tempo real. Quintas/oitavas paralelas, quintas ocultas, cruzamento, sensível duplicada, 2ª aumentada. 10 regras.',
      es: 'Verificador SATB en tiempo real. Quintas/octavas paralelas, quintas ocultas, cruces, sensible duplicada, 2ª aumentada. 10 reglas.',
    },
    href: '/harmony-lp', accent: '#ec4899', isNew: true,
  },
  {
    id: 'counterpoint', personas: ['student'], tier: 'open',
    badge: 'COUNTERPOINT', name: 'KUON COUNTERPOINT',
    tagline: {
      ja: '対位法の課題を、提出前にチェック。',
      en: 'Check your counterpoint homework before submitting.',
      ko: '대위법 과제를 제출 전에 체크.',
      pt: 'Verifique seus exercícios de contraponto antes de entregar.',
      es: 'Revisa tus ejercicios de contrapunto antes de entregar.',
    },
    desc: {
      ja: '種別対位法（1〜4類）のリアルタイムチェッカー。並行完全協和音・隠伏5度・声部交差・不協和音処理・経過音・係留音など12項目以上を即座に検出。',
      en: 'Real-time species counterpoint checker (1st–4th). Detects parallel perfects, hidden 5ths, voice crossing, dissonance treatment, passing tones, suspensions. 12+ rules.',
      ko: '종별 대위법(1~4종) 실시간 체커. 병행 완전협화음·은복5도·성부교차·불협화음 처리·경과음·계류음 등 12항목 이상 검출.',
      pt: 'Verificador de contraponto por espécies (1ª–4ª) em tempo real. Quintas paralelas, quintas ocultas, cruzamento, tratamento de dissonância, notas de passagem, retardos. 12+ regras.',
      es: 'Verificador de contrapunto por especies (1ª–4ª) en tiempo real. Quintas paralelas, quintas ocultas, cruces, tratamiento de disonancia, notas de paso, retardos. 12+ reglas.',
    },
    href: '/counterpoint-lp', accent: '#0891b2', isNew: true,
  },
  {
    id: 'transposer', personas: ['student', 'producer'], tier: 'open',
    badge: 'TRANSPOSER', name: 'KUON TRANSPOSER',
    tagline: {
      ja: '移調の計算を、一瞬で。',
      en: 'Transpose between any instruments, instantly.',
      ko: '이조 계산을 즉시.',
      pt: 'Transponha entre qualquer instrumento, instantaneamente.',
      es: 'Transpón entre cualquier instrumento, al instante.',
    },
    desc: {
      ja: '30+楽器プリセット。B♭クラ→アルトサックスなど楽器間の直接移調。調号の自動変換。音符列の一括移調。移調早見表を内蔵。',
      en: '30+ instrument presets. Direct instrument-to-instrument transposition. Automatic key conversion. Batch note transposition. Built-in reference chart.',
      ko: '30개 이상 악기 프리셋. 악기 간 직접 이조. 조표 자동 변환. 음표열 일괄 이조. 이조 조견표 내장.',
      pt: '30+ presets de instrumentos. Transposição direta entre instrumentos. Conversão automática de armadura. Tabela de referência integrada.',
      es: '30+ presets de instrumentos. Transposición directa entre instrumentos. Conversión automática de armadura. Tabla de referencia integrada.',
    },
    href: '/transposer-lp', accent: '#ea580c', isNew: true,
  },
  {
    id: 'sight-reading-app', personas: ['student'], tier: 'login',
    badge: 'SIGHT', name: 'KUON SIGHT READING',
    tagline: {
      ja: '初見力を、数値で測る。',
      en: 'Measure your sight-reading accuracy.',
      ko: '초견력을 수치로 측정하세요.',
      pt: 'Meça sua precisão de leitura à primeira vista.',
      es: 'Mide tu precisión de lectura a primera vista.',
    },
    desc: {
      ja: 'ランダム旋律を初見で演奏。ピッチ・リズムの正確さをリアルタイム採点。段階的に難易度UP。',
      en: 'Sight-read random melodies. Real-time pitch & rhythm scoring. Progressive difficulty.',
      ko: '랜덤 선율을 초견 연주. 피치와 리듬 정확도를 실시간 채점. 점진적 난이도 상승.',
      pt: 'Leia melodias aleatórias à primeira vista. Pontuação em tempo real. Dificuldade progressiva.',
      es: 'Lee melodías aleatorias a primera vista. Puntuación en tiempo real. Dificultad progresiva.',
    },
    href: '/sight-reading', accent: '#06b6d4', isComingSoon: true,
  },
  {
    id: 'drone', personas: ['student', 'producer'], tier: 'open',
    badge: 'DRONE', name: 'KUON DRONE',
    tagline: {
      ja: '純正律の響きを、体で覚える。',
      en: 'Feel just intonation in your body.',
      ko: '순정률의 울림을 몸으로 기억하세요.',
      pt: 'Sinta a entonação justa no seu corpo.',
      es: 'Siente la entonación justa en tu cuerpo.',
    },
    desc: {
      ja: '任意の音高で持続音を生成。純正律・平均律ドローン。和音ドローン（完全5度・長3度）対応。',
      en: 'Generate sustained tones at any pitch. Just/equal temperament drones. Chord drones (P5, M3).',
      ko: '임의의 음고로 지속음 생성. 순정률/평균률 드론. 화음 드론 (완전5도, 장3도) 대응.',
      pt: 'Gere tons sustentados em qualquer altura. Drones em temperamento justo/igual. Acordes (P5, M3).',
      es: 'Genera tonos sostenidos en cualquier altura. Drones en temperamento justo/igual. Acordes (P5, M3).',
    },
    href: '/drone', accent: '#14b8a6', isComingSoon: true,
  },
  {
    id: 'metronome-intelligent', personas: ['student', 'producer'], tier: 'open',
    badge: 'BPM', name: 'KUON METRONOME INTELLIGENT',
    tagline: {
      ja: 'テンポの揺れを、検出する。',
      en: 'Detect tempo fluctuations.',
      ko: '템포 흔들림을 감지합니다.',
      pt: 'Detecte flutuações de tempo.',
      es: 'Detecta fluctuaciones de tempo.',
    },
    desc: {
      ja: 'インテリジェントメトロノーム。録音しながら練習するとテンポの揺れを%で表示。拍子変更プログラミング。',
      en: 'Intelligent metronome. Practice while recording — shows tempo fluctuations in %. Time signature programming.',
      ko: '인텔리전트 메트로놈. 녹음하며 연습하면 템포 흔들림을 %로 표시. 박자 변경 프로그래밍.',
      pt: 'Metrônomo inteligente. Pratique gravando — mostra flutuações de tempo em %. Programação de compasso.',
      es: 'Metrónomo inteligente. Practica grabando — muestra fluctuaciones de tempo en %. Programación de compás.',
    },
    href: '/metronome', accent: '#f97316', isComingSoon: true,
  },
  {
    id: 'practice-log', personas: ['student', 'producer'], tier: 'login',
    badge: 'LOG', name: 'KUON PRACTICE LOG',
    tagline: {
      ja: '4年分の成長が、グラフになる。',
      en: '4 years of growth, in one graph.',
      ko: '4년간의 성장이 그래프가 됩니다.',
      pt: '4 anos de crescimento em um gráfico.',
      es: '4 años de crecimiento en un gráfico.',
    },
    desc: {
      ja: '練習時間・ピッチ精度・テンポ安定性の長期推移を記録。他のKUONアプリと自動連携。成長曲線を可視化。',
      en: 'Track practice time, pitch accuracy, tempo stability over months. Auto-syncs with all KUON apps. Visualize your growth curve.',
      ko: '연습 시간, 피치 정확도, 템포 안정성의 장기 추이를 기록. 다른 KUON 앱과 자동 연동. 성장 곡선을 시각화.',
      pt: 'Registre tempo de prática, precisão de afinação, estabilidade de tempo. Sincroniza com todos os apps KUON.',
      es: 'Registra tiempo de práctica, precisión de afinación, estabilidad de tempo. Sincroniza con todas las apps KUON.',
    },
    href: '/practice-log', accent: '#0ea5e9', isComingSoon: true,
  },

  // ─── ENGINEER primary (エンジニア向け) ───
  {
    id: 'master-check', personas: ['engineer', 'producer'], tier: 'open',
    badge: 'LUFS', name: 'KUON MASTER CHECK',
    tagline: {
      ja: '配信前の最終チェックを、ブラウザだけで。',
      en: 'Pre-release quality check in the browser.',
      ko: '배포 전 최종 체크를 브라우저에서.',
      pt: 'Verificação final pré-lançamento no navegador.',
      es: 'Verificación final previa al lanzamiento en el navegador.',
    },
    desc: {
      ja: 'LUFS・True Peak・クリッピング・ステレオ相関を一括チェック。ワンクリック自動調整＆WAVダウンロード。',
      en: 'Check LUFS, True Peak, clipping, stereo correlation. One-click auto-adjust with limiter & WAV download.',
      ko: 'LUFS, 트루 피크, 클리핑, 스테레오 상관을 일괄 체크. 원클릭 자동 조정 및 WAV 다운로드.',
      pt: 'Verifique LUFS, True Peak, clipping, correlação estéreo. Ajuste automático com limitador e download WAV.',
      es: 'Verifica LUFS, True Peak, clipping, correlación estéreo. Ajuste automático con limitador y descarga WAV.',
    },
    replaces: {
      ja: '※ iZotope Insight ($249) 相当のLUFS測定をブラウザで',
      en: 'Browser-native alternative to iZotope Insight ($249).',
      ko: 'iZotope Insight ($249) 대안을 브라우저에서.',
      pt: 'Alternativa ao iZotope Insight ($249) no navegador.',
      es: 'Alternativa a iZotope Insight ($249) en el navegador.',
    },
    href: '/master-check-lp', accent: '#0284c7',
  },
  {
    id: 'analyzer', personas: ['engineer', 'producer'], tier: 'open',
    badge: 'FFT', name: 'KUON ANALYZER',
    tagline: {
      ja: 'あなたのミックス、プロと何が違う？',
      en: 'What makes your mix different from the pros?',
      ko: '당신의 믹스, 프로와 뭐가 다를까요?',
      pt: 'O que diferencia seu mix dos profissionais?',
      es: '¿Qué diferencia tu mezcla de los profesionales?',
    },
    desc: {
      ja: 'リアルタイムスペクトラムアナライザー × LUFSメーター。リファレンス比較。マイク入力対応。',
      en: 'Real-time spectrum analyzer × LUFS meter. Reference comparison. Mic input support.',
      ko: '실시간 스펙트럼 분석기 × LUFS 미터. 레퍼런스 비교. 마이크 입력 지원.',
      pt: 'Analisador de espectro × medidor LUFS em tempo real. Comparação de referência. Entrada de microfone.',
      es: 'Analizador de espectro × medidor LUFS. Comparación de referencia. Entrada de micrófono.',
    },
    href: '/analyzer-lp', accent: '#4F46E5',
  },
  {
    id: 'ddp-checker', personas: ['engineer'], tier: 'open',
    badge: 'DDP', name: 'KUON DDP CHECKER',
    tagline: {
      ja: 'DDPの中身を、ブラウザで確認。',
      en: 'Verify DDP contents in your browser.',
      ko: 'DDP 내용을 브라우저에서 확인.',
      pt: 'Verifique conteúdo DDP no navegador.',
      es: 'Verifica contenido DDP en el navegador.',
    },
    desc: {
      ja: 'CDマスタリング用DDP構造検証・トラック試聴・曲間試聴・WAVダウンロード。完全ローカル。',
      en: 'CD mastering DDP verification — track preview, gap listen, WAV download. 100% local.',
      ko: 'CD 마스터링 DDP 구조 검증 · 트랙 시청 · 곡간 시청 · WAV 다운로드. 완전 로컬.',
      pt: 'Verificação DDP para CD — preview de faixas, gap listen, download WAV. 100% local.',
      es: 'Verificación DDP para CD — vista previa, gap listen, descarga WAV. 100% local.',
    },
    replaces: {
      ja: '※ WaveLab Pro (¥86,000) の DDP 機能相当',
      en: 'Equivalent to WaveLab Pro ($600) DDP tools.',
      ko: 'WaveLab Pro의 DDP 기능 동등.',
      pt: 'Equivalente às ferramentas DDP do WaveLab Pro ($600).',
      es: 'Equivalente a las herramientas DDP de WaveLab Pro ($600).',
    },
    href: '/ddp-checker-lp', accent: '#0284c7',
  },
  {
    id: 'analog-tools', personas: ['engineer'], tier: 'open',
    badge: 'ANALOG', name: 'KUON ANALOG TOOLS',
    tagline: {
      ja: 'オープンリールと、ヴィンテージ機材のための5つの計算機。',
      en: 'Five calculators for open-reel tape and vintage analog gear.',
      ko: '오픈 릴과 빈티지 장비를 위한 5가지 계산기.',
      pt: 'Cinco calculadoras para fita de rolo e equipamento vintage.',
      es: 'Cinco calculadoras para cinta de carrete y equipo vintage.',
    },
    desc: {
      ja: 'リール残量・テープ録音時間・Revox/Studer/Otari/Tascamの速度校正・演奏時間・電圧⇔dB変換。感覚ではなく数値で判断する、アナログ現場のための精密ツール群。',
      en: 'Reel remaining, tape time, Revox/Studer/Otari/Tascam speed calibration, performance time, voltage⇔dB conversion. Precision tools for the analog workflow — numbers, not guesswork.',
      ko: '릴 잔량·테이프 시간·Revox/Studer/Otari/Tascam 속도 교정·연주 시간·전압⇔dB 변환. 감각이 아닌 수치로 판단하는 아날로그 현장의 정밀 도구.',
      pt: 'Fita restante, tempo, calibração Revox/Studer/Otari/Tascam, tempo de performance, conversão tensão⇔dB. Ferramentas de precisão para o workflow analógico.',
      es: 'Cinta restante, tiempo, calibración Revox/Studer/Otari/Tascam, tiempo de actuación, conversión voltaje⇔dB. Herramientas de precisión para el flujo analógico.',
    },
    href: '/analog-tools', accent: '#d97706', isNew: true,
  },
  {
    id: 'dsd', personas: ['engineer'], tier: 'open',
    badge: 'DSD', name: 'KUON DSD',
    tagline: {
      ja: 'DSD を、ブラウザで再生する。世界初。',
      en: "Play DSD in your browser. World's first.",
      ko: 'DSD를 브라우저에서 재생. 세계 최초.',
      pt: 'Reproduza DSD no navegador. Primeiro do mundo.',
      es: 'Reproduce DSD en el navegador. Primero en el mundo.',
    },
    desc: {
      ja: 'DSF/DFF → 再生＆WAV変換。DSD64/128/256。Rust WebAssembly駆動。',
      en: 'DSF/DFF → play & WAV conversion. DSD64/128/256. Powered by Rust WebAssembly.',
      ko: 'DSF/DFF → 재생 및 WAV 변환. DSD64/128/256. Rust WebAssembly 구동.',
      pt: 'DSF/DFF → reprodução e conversão WAV. DSD64/128/256. Rust WebAssembly.',
      es: 'DSF/DFF → reproducción y conversión WAV. DSD64/128/256. Rust WebAssembly.',
    },
    href: '/dsd-lp', accent: '#7C3AED',
  },
  {
    id: 'resampler', personas: ['engineer', 'producer'], tier: 'open',
    badge: 'SINC', name: 'KUON RESAMPLER',
    tagline: {
      ja: 'サンプルレート変換に、プロの品質を。',
      en: 'Professional quality for sample rate conversion.',
      ko: '샘플 레이트 변환에 프로 품질을.',
      pt: 'Qualidade profissional para conversão de sample rate.',
      es: 'Calidad profesional para conversión de frecuencia.',
    },
    desc: {
      ja: 'Sinc補間×Kaiser窓。44.1k↔48k↔96k↔192kHz。3段階品質。32-bit float WAV出力。',
      en: 'Sinc interpolation × Kaiser window. 44.1k↔48k↔96k↔192kHz. 3 quality presets. 32-bit float WAV.',
      ko: 'Sinc 보간 × Kaiser 윈도우. 44.1k↔48k↔96k↔192kHz. 3단계 품질. 32-bit float WAV.',
      pt: 'Interpolação Sinc × janela Kaiser. 44.1k↔48k↔96k↔192kHz. 3 presets. WAV 32-bit float.',
      es: 'Interpolación Sinc × ventana Kaiser. 44.1k↔48k↔96k↔192kHz. 3 presets. WAV 32-bit float.',
    },
    href: '/resampler-lp', accent: '#0891B2',
  },
  {
    id: 'converter', personas: ['engineer', 'producer', 'student'], tier: 'open',
    badge: 'MP3', name: 'KUON CONVERTER',
    tagline: {
      ja: 'WAV → MP3。ブラウザで一瞬。',
      en: 'WAV → MP3. Instant in browser.',
      ko: 'WAV → MP3. 브라우저에서 순식간에.',
      pt: 'WAV → MP3. Instantâneo no navegador.',
      es: 'WAV → MP3. Instantáneo en el navegador.',
    },
    desc: {
      ja: '320kbps / 160kbps 高品質変換。サーバー送信なし。マスタリング後のMP3作成に。',
      en: '320kbps / 160kbps high-quality conversion. No server upload. For post-mastering MP3.',
      ko: '320kbps / 160kbps 고품질 변환. 서버 전송 없음. 마스터링 후 MP3 제작에.',
      pt: 'Conversão 320kbps / 160kbps. Sem upload. Para MP3 pós-masterização.',
      es: 'Conversión 320kbps / 160kbps. Sin subir al servidor. Para MP3 post-masterización.',
    },
    href: '/converter', accent: '#0284c7',
  },
  {
    id: 'noise-reduction', personas: ['engineer', 'producer'], tier: 'open',
    badge: 'DENOISE', name: 'KUON DENOISE',
    tagline: {
      ja: '定常ノイズをスペクトルから消す。',
      en: 'Erase steady noise from the spectrum.',
      ko: '정상 노이즈를 스펙트럼에서 제거.',
      pt: 'Apague ruído constante do espectro.',
      es: 'Borra ruido constante del espectro.',
    },
    desc: {
      ja: 'スペクトル減算法ノイズリダクション。周波数スペクトル可視化。リアルタイム調整。',
      en: 'Spectral subtraction noise reduction. Frequency spectrum visualization. Real-time adjustment.',
      ko: '스펙트럼 감산법 노이즈 리덕션. 주파수 스펙트럼 시각화. 실시간 조정.',
      pt: 'Redução de ruído por subtração espectral. Visualização de espectro. Ajuste em tempo real.',
      es: 'Reducción de ruido por sustracción espectral. Visualización de espectro. Ajuste en tiempo real.',
    },
    href: '/noise-reduction', accent: '#7C3AED',
  },

  // ─── PRODUCER primary (プロ制作向け) ───
  {
    id: 'normalize', personas: ['producer', 'student'], tier: 'login',
    badge: 'NORMALIZE', name: 'KUON NORMALIZE',
    tagline: {
      ja: 'ブラウザが、スタジオになる。',
      en: 'Your browser becomes a studio.',
      ko: '브라우저가 스튜디오가 됩니다.',
      pt: 'Seu navegador se torna um estúdio.',
      es: 'Tu navegador se convierte en un estudio.',
    },
    desc: {
      ja: 'ピークノーマライズ・ラウドネス最適化・シグネチャーEQ・ホールリバーブ搭載。マイク購入者特典。',
      en: 'Peak normalize, loudness optimization, signature EQ, hall reverb. Mic owner bonus.',
      ko: '피크 노멀라이즈, 라우드니스 최적화, 시그니처 EQ, 홀 리버브. 마이크 구매자 특전.',
      pt: 'Normalização de picos, otimização de loudness, EQ signature, reverb. Bônus para donos de mic.',
      es: 'Normalización de picos, optimización de loudness, EQ signature, reverb. Bonus para dueños de mic.',
    },
    href: '/normalize-lp', accent: '#059669',
  },
  {
    id: 'dual-mono', personas: ['producer', 'engineer'], tier: 'open',
    badge: 'STEREO', name: 'KUON DUAL',
    tagline: {
      ja: 'モノラルに、広がりを与える。',
      en: 'Give mono a sense of space.',
      ko: '모노에 공간감을 부여합니다.',
      pt: 'Dê amplitude ao mono.',
      es: 'Dale amplitud al mono.',
    },
    desc: {
      ja: 'デュアルモノ or Haas効果＋MS処理による擬似ステレオ変換。ステレオ幅コントロール。',
      en: 'Dual mono or pseudo stereo via Haas effect + M/S processing. Stereo width control.',
      ko: '듀얼 모노 또는 Haas 효과 + MS 처리에 의한 의사 스테레오 변환. 스테레오 폭 제어.',
      pt: 'Dual mono ou pseudo estéreo via efeito Haas + processamento M/S. Controle de largura estéreo.',
      es: 'Dual mono o pseudo estéreo vía efecto Haas + procesamiento M/S. Control de ancho estéreo.',
    },
    href: '/dual-mono', accent: '#D97706',
  },
  {
    id: 'itadaki', personas: ['producer', 'engineer'], tier: 'login',
    badge: 'DECLIP', name: 'KUON ITADAKI',
    tagline: {
      ja: '失われたピークを、数学的に甦らせる。',
      en: 'Mathematically restore lost peaks.',
      ko: '잃어버린 피크를 수학적으로 복원합니다.',
      pt: 'Restaure matematicamente picos perdidos.',
      es: 'Restaura matemáticamente los picos perdidos.',
    },
    desc: {
      ja: 'エルミートスプライン補間による非対称クリッピング修復エンジン。',
      en: 'Declipping engine using Cubic Hermite Spline interpolation for asymmetric analog distortion.',
      ko: '에르미트 스플라인 보간에 의한 비대칭 클리핑 복구 엔진.',
      pt: 'Motor de restauração usando interpolação Hermite cúbica para distorção analógica assimétrica.',
      es: 'Motor de restauración usando interpolación Hermite cúbica para distorsión analógica asimétrica.',
    },
    replaces: {
      ja: '※ iZotope RX Advanced ($1,249) の De-clip 相当',
      en: 'Equivalent to iZotope RX Advanced De-clip ($1,249).',
      ko: 'iZotope RX Advanced De-clip ($1,249) 동등.',
      pt: 'Equivalente ao De-clip do iZotope RX Advanced ($1,249).',
      es: 'Equivalente al De-clip de iZotope RX Advanced ($1,249).',
    },
    href: '/itadaki-lp', accent: '#0099BB',
  },
  {
    id: 'separator', personas: ['producer', 'student'], tier: 'pro',
    badge: 'AI', name: 'KUON SEPARATOR',
    tagline: {
      ja: '音源分離。自分のパートだけ消す。',
      en: 'Source separation. Remove your part only.',
      ko: '음원 분리. 자신의 파트만 제거.',
      pt: 'Separação de fontes. Remova apenas sua parte.',
      es: 'Separación de fuentes. Elimina solo tu parte.',
    },
    desc: {
      ja: 'Demucs v4（Meta AI）による音源分離。ボーカル・ドラム・ベース・その他を分離。伴奏練習に最適。',
      en: 'Source separation powered by Demucs v4 (Meta AI). Separate vocals, drums, bass, other. Perfect for accompaniment practice.',
      ko: 'Demucs v4 (Meta AI) 기반 음원 분리. 보컬, 드럼, 베이스, 기타 분리. 반주 연습에 최적.',
      pt: 'Separação de fontes com Demucs v4 (Meta AI). Separe vocais, bateria, baixo, outros.',
      es: 'Separación de fuentes con Demucs v4 (Meta AI). Separa vocales, batería, bajo, otros.',
    },
    href: '/separator-lp', accent: '#dc2626', isNew: true,
  },
  {
    id: 'slowdown', personas: ['student', 'producer'], tier: 'open',
    badge: 'SLOW', name: 'KUON SLOWDOWN',
    tagline: {
      ja: 'ピッチを変えずに、ゆっくり再生。',
      en: 'Slow down music without changing pitch.',
      ko: '피치를 바꾸지 않고 느리게 재생.',
      pt: 'Reduza a velocidade sem alterar o tom.',
      es: 'Reduce la velocidad sin cambiar el tono.',
    },
    desc: {
      ja: 'ジャズ耳コピ・クラシック練習・タンゴ分析に。0.25x〜2.0x可変、A/Bループ、半音トランスポーズ、自動キー/BPM検出、小節グリッド、オーバーダブ録音。Transcribe!に代わる次世代ブラウザツール。',
      en: 'For jazz transcription, classical practice, tango analysis. 0.25x–2.0x, A/B loop, semitone transpose, auto key & BPM, bar grid, overdub recording. Browser-based next-gen alternative to Transcribe!.',
      ko: '재즈 카피, 클래식 연습, 탱고 분석에. 0.25x~2.0x, A/B 루프, 반음 전조, 자동 키/BPM, 소절 그리드, 오버덥 녹음. Transcribe! 대체 차세대 브라우저 툴.',
      pt: 'Para transcrição de jazz, prática clássica, análise de tango. 0.25x–2.0x, loop A/B, transposição, detecção automática, grade de compasso, gravação overdub.',
      es: 'Para transcripción de jazz, práctica clásica, análisis de tango. 0.25x–2.0x, loop A/B, transposición, detección automática, grilla de compases, grabación overdub.',
    },
    replaces: {
      ja: '※ Transcribe! ($39) / Amazing Slow Downer ($50) / Anytune ($15) に代わる無料ブラウザ版',
      en: 'Free browser alternative to Transcribe! ($39), Amazing Slow Downer ($50), Anytune ($15).',
      ko: 'Transcribe! ($39), Amazing Slow Downer ($50), Anytune ($15) 대체 무료 브라우저판.',
      pt: 'Alternativa gratuita ao Transcribe! ($39), Amazing Slow Downer ($50), Anytune ($15).',
      es: 'Alternativa gratuita a Transcribe! ($39), Amazing Slow Downer ($50), Anytune ($15).',
    },
    href: '/slowdown-lp', accent: '#c2410c', isNew: true,
  },

  // ─── Community / Shared (appears across personas) ───
  {
    id: 'player', personas: ['engineer', 'student', 'producer'], tier: 'open',
    badge: '24H', name: 'KUON PLAYER',
    tagline: {
      ja: '音声を共有する。24時間で、消える。',
      en: 'Share audio. Gone in 24 hours.',
      ko: '오디오를 공유하세요. 24시간 후 삭제.',
      pt: 'Compartilhe áudio. Some em 24 horas.',
      es: 'Comparte audio. Desaparece en 24 horas.',
    },
    desc: {
      ja: 'MP3アップロード → パスワード付き共有リンク → 24時間自動削除。ストリーミングのみ。',
      en: 'Upload MP3 → password-protected link → auto-deleted in 24h. Streaming only, no downloads.',
      ko: 'MP3 업로드 → 비밀번호 보호 링크 → 24시간 자동 삭제. 스트리밍만 가능.',
      pt: 'Upload MP3 → link protegido → excluído em 24h. Apenas streaming, sem download.',
      es: 'Sube MP3 → enlace protegido → eliminado en 24h. Solo streaming, sin descargas.',
    },
    href: '/player-lp', accent: '#059669',
  },
  {
    id: 'events', personas: ['student', 'producer', 'engineer'], tier: 'open',
    badge: 'LIVE', name: "TODAY'S LIVE",
    tagline: {
      ja: '世界中のライブを、地図で探す。',
      en: 'Find live music worldwide on a map.',
      ko: '전 세계의 라이브를 지도에서 찾으세요.',
      pt: 'Encontre música ao vivo no mapa mundial.',
      es: 'Encuentra música en vivo en el mapa mundial.',
    },
    desc: {
      ja: '音楽ライブ・コンサート・リサイタルを地図上で探せる。アーティストは無料で集客。ジャンル・日付フィルター。',
      en: 'Discover concerts, recitals, jam sessions on a map. Artists promote for free. Genre & date filters.',
      ko: '콘서트, 리사이틀, 잼 세션을 지도에서 발견. 아티스트는 무료 홍보. 장르 및 날짜 필터.',
      pt: 'Descubra concertos, recitais, jam sessions no mapa. Artistas promovem grátis. Filtros de gênero e data.',
      es: 'Descubre conciertos, recitales, jam sessions en el mapa. Artistas promocionan gratis. Filtros de género y fecha.',
    },
    href: '/events-lp', accent: '#e11d48',
  },
  {
    id: 'soundmap', personas: ['engineer', 'producer'], tier: 'open',
    badge: 'EARTH', name: 'SOUND MAP',
    tagline: {
      ja: '地球の音を、聴く。',
      en: 'Listen to the sounds of Earth.',
      ko: '지구의 소리를 들어보세요.',
      pt: 'Ouça os sons da Terra.',
      es: 'Escucha los sonidos de la Tierra.',
    },
    desc: {
      ja: '世界中のフィールドレコーディングを地図上で聴ける。あなたの録音も投稿できる。',
      en: 'Listen to field recordings worldwide on a map. Submit your own recordings too.',
      ko: '전 세계의 필드 레코딩을 지도에서 들을 수 있습니다. 당신의 녹음도 투고 가능.',
      pt: 'Ouça gravações de campo do mundo todo no mapa. Envie suas próprias gravações também.',
      es: 'Escucha grabaciones de campo del mundo en el mapa. Envía tus propias grabaciones también.',
    },
    href: '/soundmap-lp', accent: '#16a34a',
  },
  {
    id: 'gallery', personas: ['engineer', 'producer'], tier: 'login',
    badge: 'GALLERY', name: "OWNER'S GALLERY",
    tagline: {
      ja: 'あなたの録音を、世界に聴かせる。',
      en: 'Let the world hear your recordings.',
      ko: '당신의 녹음을 세계에 들려주세요.',
      pt: 'Deixe o mundo ouvir suas gravações.',
      es: 'Deja que el mundo escuche tus grabaciones.',
    },
    desc: {
      ja: 'P-86S / X-86S オーナーの録音ギャラリー。朝比奈幸太郎によるマスタリング処理。投稿パスワード制。',
      en: "P-86S / X-86S owner's recording gallery. Mastered by Kotaro Asahina. Password-protected submissions.",
      ko: 'P-86S / X-86S 오너의 녹음 갤러리. 아사히나 코타로의 마스터링 처리. 투고 비밀번호 제.',
      pt: 'Galeria de gravações dos donos de P-86S / X-86S. Masterizado por Kotaro Asahina.',
      es: 'Galería de grabaciones de propietarios de P-86S / X-86S. Masterizado por Kotaro Asahina.',
    },
    href: '/gallery', accent: '#a855f7',
  },
  {
    id: 'portfolio', personas: ['student', 'producer'], tier: 'login',
    badge: 'FOLIO', name: 'KUON PORTFOLIO',
    tagline: {
      ja: '演奏履歴を、1つのURLに。',
      en: 'Your performance history, in one URL.',
      ko: '연주 이력을 하나의 URL로.',
      pt: 'Seu histórico de apresentações em uma URL.',
      es: 'Tu historial de interpretaciones en una URL.',
    },
    desc: {
      ja: 'ベスト演奏を公開ページとして整理。音大受験・コンクール・留学オーディションの提出資料に。',
      en: 'Organize your best performances as a public page. For auditions, competitions, and college applications.',
      ko: '베스트 연주를 공개 페이지로 정리. 음대 수험, 콩쿠르, 유학 오디션 제출 자료에.',
      pt: 'Organize suas melhores apresentações como página pública. Para audições, concursos e candidaturas.',
      es: 'Organiza tus mejores interpretaciones como página pública. Para audiciones, concursos y solicitudes.',
    },
    href: '/portfolio', accent: '#0369a1', isComingSoon: true,
  },
];

// ─────────────────────────────────────────────
// Workflow stacks — curated paths per persona (IQ180)
// ─────────────────────────────────────────────
type Stack = {
  id: string;
  persona: Persona;
  icon: string;
  title: L5;
  summary: L5;
  steps: Array<{ appId: string; note?: L5 }>;
};

const stacks: Stack[] = [
  // Engineer stacks
  {
    id: 'cd-mastering', persona: 'engineer', icon: '💿',
    title: {
      ja: 'CDマスタリング完全ワークフロー',
      en: 'Complete CD Mastering Workflow',
      ko: 'CD 마스터링 완전 워크플로우',
      pt: 'Workflow completo de masterização CD',
      es: 'Flujo completo de mastering para CD',
    },
    summary: {
      ja: '測定 → ラウドネス調整 → DDP 検証 → DSD アーカイブ。全てブラウザで完結。',
      en: 'Measure → adjust loudness → verify DDP → archive as DSD. Fully browser-native.',
      ko: '측정 → 라우드니스 조정 → DDP 검증 → DSD 아카이브. 완전 브라우저 완결.',
      pt: 'Medir → ajustar loudness → verificar DDP → arquivar DSD. Completo no navegador.',
      es: 'Medir → loudness → DDP → DSD. Completo en navegador.',
    },
    steps: [
      { appId: 'analyzer' },
      { appId: 'master-check' },
      { appId: 'ddp-checker' },
      { appId: 'dsd' },
    ],
  },
  {
    id: 'restoration', persona: 'engineer', icon: '🔧',
    title: {
      ja: '録音レストア & リマスター',
      en: 'Recording Restoration & Remaster',
      ko: '녹음 복원 & 리마스터',
      pt: 'Restauração e Remasterização',
      es: 'Restauración y Remasterización',
    },
    summary: {
      ja: 'ノイズ除去 → クリッピング復元 → サンプルレート変換 → 配信フォーマット化。',
      en: 'Denoise → declip → resample → deliver.',
      ko: '노이즈 제거 → 클리핑 복원 → 리샘플 → 배포.',
      pt: 'Remover ruído → declip → resample → entregar.',
      es: 'Denoise → declip → resample → entregar.',
    },
    steps: [
      { appId: 'noise-reduction' },
      { appId: 'itadaki' },
      { appId: 'resampler' },
      { appId: 'converter' },
    ],
  },

  // Student stacks
  {
    id: 'daily-practice', persona: 'student', icon: '🌅',
    title: {
      ja: '毎日の練習ルーティン',
      en: 'Daily Practice Routine',
      ko: '매일의 연습 루틴',
      pt: 'Rotina diária de prática',
      es: 'Rutina diaria de práctica',
    },
    summary: {
      ja: 'ウォームアップ（チューナー＋ドローン） → メトロノーム練習 → 聴音 → 記録。',
      en: 'Warm up (tuner + drone) → metronome practice → ear training → log.',
      ko: '워밍업(튜너+드론) → 메트로놈 → 청음 → 기록.',
      pt: 'Aquecimento → metrônomo → treino auditivo → registro.',
      es: 'Calentamiento → metrónomo → entrenamiento auditivo → registro.',
    },
    steps: [
      { appId: 'tuner' },
      { appId: 'metronome' },
      { appId: 'ear-training' },
      { appId: 'practice-log' },
    ],
  },
  {
    id: 'theory-prep', persona: 'student', icon: '📖',
    title: {
      ja: '音大受験・和声対策',
      en: 'Theory Exam Prep',
      ko: '시험 대비',
      pt: 'Preparação para provas',
      es: 'Preparación para exámenes',
    },
    summary: {
      ja: '音名読み → 和音判定 → 和声課題チェック → 対位法チェック。提出前に即確認。',
      en: 'Note reading → chord ID → harmony check → counterpoint check. Verify before submission.',
      ko: '음이름 → 화음 → 화성 → 대위법. 제출 전 체크.',
      pt: 'Leitura → acordes → harmonia → contraponto. Revise antes de entregar.',
      es: 'Lectura → acordes → armonía → contrapunto. Revisa antes de entregar.',
    },
    steps: [
      { appId: 'sight-reading' },
      { appId: 'chord-quiz' },
      { appId: 'harmony' },
      { appId: 'counterpoint' },
    ],
  },

  // Producer stacks
  {
    id: 'recording-to-release', persona: 'producer', icon: '🎙️',
    title: {
      ja: '録音 → リリースまで',
      en: 'Record to Release',
      ko: '녹음에서 릴리스까지',
      pt: 'Da gravação ao lançamento',
      es: 'De la grabación al lanzamiento',
    },
    summary: {
      ja: 'ノイズ除去 → クリッピング復元 → 仕上げ → 測定 → MP3 化。',
      en: 'Denoise → declip → polish → measure → MP3.',
      ko: '노이즈 → 클리핑 → 마무리 → 측정 → MP3.',
      pt: 'Ruído → clip → polir → medir → MP3.',
      es: 'Ruido → clip → pulir → medir → MP3.',
    },
    steps: [
      { appId: 'noise-reduction' },
      { appId: 'itadaki' },
      { appId: 'normalize' },
      { appId: 'analyzer' },
      { appId: 'converter' },
    ],
  },
  {
    id: 'stem-production', persona: 'producer', icon: '🎚️',
    title: {
      ja: 'AI ステム抽出 & リミックス',
      en: 'AI Stem Extraction & Remix',
      ko: 'AI 스템 추출 & 리믹스',
      pt: 'Extração de stems & Remix',
      es: 'Extracción de stems & Remix',
    },
    summary: {
      ja: 'Demucs v4 で音源分離 → 個別パート処理 → 再ミックス。',
      en: 'Separate with Demucs v4 → process per stem → remix.',
      ko: 'Demucs v4 분리 → 개별 처리 → 리믹스.',
      pt: 'Separar com Demucs v4 → processar stems → remixar.',
      es: 'Separar con Demucs v4 → procesar stems → remix.',
    },
    steps: [
      { appId: 'separator' },
      { appId: 'noise-reduction' },
      { appId: 'normalize' },
      { appId: 'master-check' },
    ],
  },
];

// ─────────────────────────────────────────────
// Scroll reveal hook
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

// ─────────────────────────────────────────────
// App Card
// ─────────────────────────────────────────────
function AppCard({ app, index, lang }: { app: AppEntry; index: number; lang: Lang }) {
  const ref = useReveal();
  const plan = planBadge(app.tier);
  const primary = PERSONA_META[app.personas[0]];

  const inner = (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: app.isComingSoon
          ? 'rgba(255,255,255,0.35)'
          : 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        padding: 'clamp(20px, 3vw, 28px)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        cursor: app.isComingSoon ? 'default' : 'pointer',
        transition: 'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
        opacity: app.isComingSoon ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!app.isComingSoon) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 16px 40px ${app.accent}20`;
        }
      }}
      onMouseLeave={e => {
        if (!app.isComingSoon) {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
        }
      }}
    >
      {/* Top row: 大局の分類 (ペルソナ) + プラン可用性 + coming soon */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 16, flexWrap: 'wrap',
      }}>
        {/* Persona — どのカテゴリーのアプリか（エンジニア/学習/プロ制作） */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10.5, fontWeight: 600, letterSpacing: '0.02em',
          color: primary.accent,
          background: `${primary.accent}0f`,
          padding: '4px 10px 4px 8px', borderRadius: 50,
          border: `1px solid ${primary.accent}24`,
          fontFamily: sans,
        }}>
          <span style={{ fontSize: 11, lineHeight: 1 }}>{primary.icon}</span>
          <span>{t5(primary.label, lang)}</span>
        </span>

        {/* Plan — どのプランで使えるか。FREE は目立つグラデーション + 発光ドット */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: plan.isFree ? 11 : 10.5,
          fontWeight: 800,
          letterSpacing: plan.isFree ? '0.22em' : '0.16em',
          color: plan.textColor,
          background: plan.bgGradient,
          padding: plan.isFree ? '4px 13px 4px 11px' : '4px 12px',
          borderRadius: 50,
          border: `1px solid ${plan.borderColor}`,
          fontFamily: sans,
          boxShadow: plan.isFree
            ? `0 2px 10px ${plan.accent}32, inset 0 1px 0 rgba(255,255,255,0.65)`
            : `0 2px 8px ${plan.accent}28, inset 0 1px 0 rgba(255,255,255,0.6)`,
        }}>
          {plan.isFree && (
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: plan.accent,
              boxShadow: `0 0 8px ${plan.accent}cc`,
              display: 'inline-block',
            }} />
          )}
          {plan.label}
        </span>

        {app.isComingSoon && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
            color: '#94a3b8', background: 'rgba(148,163,184,0.12)',
            padding: '3px 10px', borderRadius: 50,
            fontFamily: sans,
          }}>
            {t5({
              ja: '近日公開',
              en: 'COMING SOON',
              ko: '곧 출시',
              pt: 'EM BREVE',
              es: 'PRONTO',
            }, lang)}
          </span>
        )}
      </div>

      {/* Name */}
      <h3 style={{
        fontFamily: sans, fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
        fontWeight: 700, color: '#111827', margin: '0 0 8px 0',
        letterSpacing: '-0.01em',
      }}>
        {app.name}
      </h3>

      {/* Tagline */}
      <p style={{
        fontFamily: serif,
        fontSize: 'clamp(13px, 1.8vw, 15px)',
        fontWeight: 500, color: '#374151',
        lineHeight: 1.6, margin: '0 0 10px 0',
      }}>
        {t5(app.tagline, lang)}
      </p>

      {/* Description */}
      <p style={{
        fontSize: 'clamp(11px, 1.5vw, 12.5px)',
        color: '#6b7280', lineHeight: 1.7,
        margin: '0 0 12px 0', flex: 1,
      }}>
        {t5(app.desc, lang)}
      </p>

      {/* Replaces (competitive positioning) */}
      {app.replaces && (
        <p style={{
          fontSize: 10, fontFamily: mono,
          color: app.accent, opacity: 0.8,
          margin: '0 0 12px 0',
          padding: '6px 10px',
          background: `${app.accent}08`,
          borderLeft: `2px solid ${app.accent}60`,
          borderRadius: '0 6px 6px 0',
        }}>
          {t5(app.replaces, lang)}
        </p>
      )}

      {/* CTA */}
      {!app.isComingSoon && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
            color: app.accent,
            padding: '6px 16px', borderRadius: 50,
            border: `1px solid ${app.accent}30`,
            background: `${app.accent}08`,
          }}>
            {t5({
              ja: '詳細を見る', en: 'Learn More', ko: '자세히 보기',
              pt: 'Saiba mais', es: 'Ver más',
            }, lang)} →
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      className="reveal"
      style={{ transitionDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      {app.isComingSoon ? (
        <div style={{ height: '100%' }}>{inner}</div>
      ) : (
        <Link href={app.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
          {inner}
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Persona selector (primary navigation)
// ─────────────────────────────────────────────
function PersonaSelector({
  active, setActive, counts, lang,
}: {
  active: Persona;
  setActive: (p: Persona) => void;
  counts: Record<Persona, number>;
  lang: Lang;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
      gap: 'clamp(10px, 2vw, 14px)',
      marginBottom: 'clamp(20px, 4vw, 28px)',
    }}>
      {(['engineer', 'student', 'producer'] as Persona[]).map(p => {
        const meta = PERSONA_META[p];
        const isActive = active === p;
        return (
          <button
            key={p}
            onClick={() => setActive(p)}
            style={{
              position: 'relative',
              textAlign: 'left' as const,
              padding: 'clamp(18px, 3vw, 26px)',
              borderRadius: 18,
              border: isActive
                ? `1.5px solid ${meta.accent}`
                : '1px solid rgba(255,255,255,0.7)',
              cursor: 'pointer',
              background: isActive ? meta.gradient : 'rgba(255,255,255,0.55)',
              color: isActive ? '#fff' : '#111827',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: isActive
                ? `0 12px 32px ${meta.accent}35`
                : '0 2px 12px rgba(0,0,0,0.04)',
              transform: isActive ? 'translateY(-2px)' : 'none',
              transition: 'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10,
            }}>
              <span style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}>{meta.icon}</span>
              <span style={{
                fontSize: 10, fontFamily: mono, fontWeight: 700,
                letterSpacing: '0.12em',
                padding: '3px 9px', borderRadius: 50,
                background: isActive ? 'rgba(255,255,255,0.25)' : `${meta.accent}15`,
                color: isActive ? '#fff' : meta.accent,
              }}>
                {counts[p]} {t5({ ja: 'ツール', en: 'TOOLS', ko: '도구', pt: 'FERR.', es: 'HERR.' }, lang)}
              </span>
            </div>
            <div style={{
              fontFamily: sans, fontWeight: 700,
              fontSize: 'clamp(15px, 2.2vw, 18px)',
              letterSpacing: '-0.01em',
              marginBottom: 4,
            }}>
              {t5(meta.label, lang)}
            </div>
            <div style={{
              fontFamily: mono, fontSize: 10,
              letterSpacing: '0.1em', fontWeight: 600,
              opacity: isActive ? 0.9 : 0.6,
              marginBottom: 10,
            }}>
              {t5(meta.tag, lang)}
            </div>
            <p style={{
              fontSize: 'clamp(11px, 1.6vw, 12.5px)',
              lineHeight: 1.6,
              opacity: isActive ? 0.95 : 0.7,
              margin: 0,
            }}>
              {t5(meta.lead, lang)}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tier filter chips
// ─────────────────────────────────────────────
type TierFilter = 'all' | Tier;

function TierFilterChips({
  active, setActive, counts, lang, accent,
}: {
  active: TierFilter;
  setActive: (t: TierFilter) => void;
  counts: Record<TierFilter, number>;
  lang: Lang;
  accent: string;
}) {
  const options: Array<{ value: TierFilter; label: L5; desc?: L5 }> = [
    {
      value: 'all',
      label: { ja: 'すべて', en: 'ALL', ko: '전체', pt: 'TUDO', es: 'TODO' },
    },
    { value: 'open',  label: TIER_META.open.label,  desc: TIER_META.open.desc  },
    { value: 'login', label: TIER_META.login.label, desc: TIER_META.login.desc },
    { value: 'pro',   label: TIER_META.pro.label,   desc: TIER_META.pro.desc   },
  ];

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
      justifyContent: 'center',
      marginBottom: 'clamp(24px, 4vw, 32px)',
    }}>
      {options.map(opt => {
        const isActive = active === opt.value;
        const count = counts[opt.value];
        return (
          <button
            key={opt.value}
            onClick={() => setActive(opt.value)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 50,
              background: isActive ? accent : 'rgba(255,255,255,0.55)',
              color: isActive ? '#fff' : '#374151',
              border: isActive ? `1px solid ${accent}` : '1px solid rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontFamily: sans,
              fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: isActive ? `0 6px 20px ${accent}30` : '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.25s',
            }}
          >
            <span>{t5(opt.label, lang)}</span>
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
              color: isActive ? '#fff' : '#9ca3af',
              padding: '1px 8px', borderRadius: 50,
              minWidth: 20, textAlign: 'center' as const,
            }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Workflow stack card (IQ180)
// ─────────────────────────────────────────────
function WorkflowStack({ stack, lang, accent }: { stack: Stack; lang: Lang; accent: string }) {
  const ref = useReveal();
  const resolvedSteps = stack.steps
    .map(s => apps.find(a => a.id === s.appId))
    .filter((a): a is AppEntry => !!a);

  return (
    <div
      ref={ref}
      className="reveal"
      style={{
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderRadius: 18,
        padding: 'clamp(20px, 3vw, 28px)',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{stack.icon}</span>
        <h4 style={{
          fontFamily: sans, fontSize: 'clamp(14px, 2vw, 16px)',
          fontWeight: 700, margin: 0, color: '#111827',
          letterSpacing: '-0.01em',
        }}>
          {t5(stack.title, lang)}
        </h4>
      </div>
      <p style={{
        fontSize: 'clamp(11px, 1.5vw, 13px)',
        color: '#6b7280', lineHeight: 1.7,
        margin: '0 0 16px 0',
      }}>
        {t5(stack.summary, lang)}
      </p>
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6,
      }}>
        {resolvedSteps.map((app, i) => (
          <React.Fragment key={app.id}>
            {app.isComingSoon ? (
              <span style={{
                padding: '6px 12px', borderRadius: 50,
                background: 'rgba(148,163,184,0.12)',
                color: '#94a3b8',
                fontSize: 11, fontWeight: 700,
                fontFamily: mono, letterSpacing: '0.06em',
              }}>
                {app.name.replace('KUON ', '')}
              </span>
            ) : (
              <Link
                href={app.href}
                style={{
                  padding: '6px 12px', borderRadius: 50,
                  background: `${app.accent}12`,
                  color: app.accent,
                  border: `1px solid ${app.accent}25`,
                  fontSize: 11, fontWeight: 700,
                  fontFamily: mono, letterSpacing: '0.06em',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `${app.accent}22`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${app.accent}12`;
                  e.currentTarget.style.transform = '';
                }}
              >
                {app.name.replace('KUON ', '')}
              </Link>
            )}
            {i < resolvedSteps.length - 1 && (
              <span style={{ color: accent, fontSize: 14, fontWeight: 700 }}>→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subscription preview (IQ180)
// ─────────────────────────────────────────────
function SubscriptionPreview({ lang }: { lang: Lang }) {
  const plans = [
    {
      id: 'free',
      label: { ja: 'FREE', en: 'FREE' } as L5,
      price: '¥0',
      priceNote: { ja: '永年無料', en: 'Free forever', ko: '영구 무료', pt: 'Grátis sempre', es: 'Siempre gratis' } as L5,
      features: [
        { ja: 'ブラウザアプリ全て無制限', en: 'All browser apps unlimited', ko: '브라우저 앱 무제한', pt: 'Apps no navegador ilimitados', es: 'Apps del navegador ilimitadas' },
        { ja: 'サーバーアプリ 月3回', en: 'Server apps: 3/month', ko: '서버 앱 월 3회', pt: 'Apps servidor: 3/mês', es: 'Apps servidor: 3/mes' },
        { ja: 'ログインなしでも使用可', en: 'Works without login', ko: '로그인 없이 사용 가능', pt: 'Funciona sem login', es: 'Funciona sin login' },
      ],
      accent: '#059669',
      cta: { ja: '今すぐ使う', en: 'Use Now', ko: '지금 사용', pt: 'Usar agora', es: 'Usar ahora' } as L5,
      href: '#apps',
    },
    {
      id: 'student',
      label: { ja: 'STUDENT', en: 'STUDENT' } as L5,
      price: '¥480',
      priceNote: { ja: '/月・学割', en: '/mo · Student', ko: '/월 · 학생', pt: '/mês · Estudante', es: '/mes · Estudiante' } as L5,
      features: [
        { ja: '全サーバーアプリ無制限', en: 'All server apps unlimited', ko: '모든 서버 앱 무제한', pt: 'Apps servidor ilimitados', es: 'Apps servidor ilimitadas' },
        { ja: '練習ログ・成長曲線の保存', en: 'Practice logs & growth curves', ko: '연습 기록·성장 곡선', pt: 'Registros e curvas de crescimento', es: 'Registros y curvas de crecimiento' },
        { ja: '音大生向けコミュニティ', en: 'Student-focused community', ko: '학생 커뮤니티', pt: 'Comunidade estudantil', es: 'Comunidad estudiantil' },
      ],
      accent: '#8b5cf6',
      cta: { ja: 'まもなく', en: 'Coming soon', ko: '곧 공개', pt: 'Em breve', es: 'Próximamente' } as L5,
      comingSoon: true,
    },
    {
      id: 'pro',
      label: { ja: 'PRO', en: 'PRO' } as L5,
      price: '¥980',
      priceNote: { ja: '/月', en: '/mo', ko: '/월', pt: '/mês', es: '/mes' } as L5,
      features: [
        { ja: '全機能無制限', en: 'All features unlimited', ko: '전 기능 무제한', pt: 'Tudo ilimitado', es: 'Todo ilimitado' },
        { ja: '優先サーバー処理', en: 'Priority server processing', ko: '우선 서버 처리', pt: 'Processamento prioritário', es: 'Procesamiento prioritario' },
        { ja: 'イベント投稿・ポートフォリオ', en: 'Event posting & portfolio', ko: '이벤트·포트폴리오', pt: 'Eventos e portfólio', es: 'Eventos y portafolio' },
      ],
      accent: '#d97706',
      cta: { ja: 'まもなく', en: 'Coming soon', ko: '곧 공개', pt: 'Em breve', es: 'Próximamente' } as L5,
      comingSoon: true,
      highlight: true,
    },
  ];

  return (
    <section id="pricing" style={{
      marginTop: 'clamp(48px, 8vw, 80px)',
      marginBottom: 'clamp(32px, 6vw, 48px)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 36px)' }}>
        <p style={{
          fontFamily: mono, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.2em', color: '#0284c7', margin: '0 0 10px 0',
        }}>
          PRICING
        </p>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(20px, 3.5vw, 28px)',
          fontWeight: 700, letterSpacing: '0.03em',
          margin: '0 0 10px 0', color: '#111827',
        }}>
          {t5({
            ja: 'あなたに合った使い方を。',
            en: 'A plan that fits you.',
            ko: '당신에게 맞는 방식으로.',
            pt: 'Um plano que se ajusta a você.',
            es: 'Un plan que se ajusta a ti.',
          }, lang)}
        </h2>
        <p style={{
          fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#6b7280',
          maxWidth: 520, margin: '0 auto', lineHeight: 1.7,
        }}>
          {t5({
            ja: 'ブラウザで動くアプリは全て無料で使えます。サーバー処理が必要なアプリのみサブスクをご用意。',
            en: 'All browser-native apps are free, always. Subscription covers server-processing apps only.',
            ko: '브라우저 앱은 모두 무료. 서버 처리 앱에만 구독이 필요합니다.',
            pt: 'Todos os apps no navegador são grátis. Assinatura apenas para apps com processamento no servidor.',
            es: 'Todas las apps del navegador son gratis. La suscripción solo cubre apps con procesamiento en servidor.',
          }, lang)}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
        gap: 'clamp(12px, 2vw, 18px)',
      }}>
        {plans.map(plan => (
          <div key={plan.id} style={{
            position: 'relative',
            padding: 'clamp(20px, 3vw, 28px)',
            borderRadius: 18,
            background: plan.highlight
              ? 'linear-gradient(135deg, #1e293b, #0f172a)'
              : 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: plan.highlight
              ? `1.5px solid ${plan.accent}`
              : '1px solid rgba(255,255,255,0.8)',
            boxShadow: plan.highlight
              ? `0 20px 48px ${plan.accent}30`
              : '0 2px 12px rgba(0,0,0,0.04)',
            color: plan.highlight ? '#fff' : '#111827',
            display: 'flex', flexDirection: 'column' as const,
          }}>
            {plan.highlight && (
              <span style={{
                position: 'absolute', top: -10, right: 16,
                fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
                color: '#fff',
                background: `linear-gradient(135deg, ${plan.accent}, #ec4899)`,
                padding: '4px 10px', borderRadius: 50,
              }}>
                POPULAR
              </span>
            )}
            <div style={{
              fontFamily: mono, fontSize: 11, fontWeight: 800,
              letterSpacing: '0.16em', color: plan.accent,
              marginBottom: 12,
            }}>
              {t5(plan.label, lang)}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
              <span style={{
                fontFamily: sans, fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 800, letterSpacing: '-0.02em',
              }}>
                {plan.price}
              </span>
              <span style={{
                fontSize: 12, opacity: plan.highlight ? 0.7 : 0.6,
                fontWeight: 500,
              }}>
                {t5(plan.priceNote, lang)}
              </span>
            </div>
            <ul style={{
              listStyle: 'none', padding: 0, margin: '0 0 20px 0',
              display: 'flex', flexDirection: 'column' as const, gap: 8,
              flex: 1,
            }}>
              {plan.features.map((f, i) => (
                <li key={i} style={{
                  display: 'flex', gap: 8,
                  fontSize: 'clamp(11px, 1.6vw, 13px)',
                  lineHeight: 1.6,
                  opacity: plan.highlight ? 0.9 : 0.85,
                }}>
                  <span style={{ color: plan.accent, fontWeight: 700 }}>✓</span>
                  <span>{t5(f as L5, lang)}</span>
                </li>
              ))}
            </ul>
            {plan.comingSoon ? (
              <div style={{
                padding: '10px 16px', borderRadius: 50,
                textAlign: 'center' as const,
                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                background: plan.highlight ? 'rgba(255,255,255,0.1)' : 'rgba(148,163,184,0.12)',
                color: plan.highlight ? '#94a3b8' : '#94a3b8',
              }}>
                {t5(plan.cta, lang)}
              </div>
            ) : (
              <Link href={plan.href ?? '#apps'} style={{
                padding: '10px 16px', borderRadius: 50,
                textAlign: 'center' as const, textDecoration: 'none',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                background: plan.accent, color: '#fff',
                transition: 'all 0.25s',
              }}>
                {t5(plan.cta, lang)}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Mic bundle CTA (flywheel §29)
// ─────────────────────────────────────────────
function MicBundleCTA({ lang }: { lang: Lang }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #fff7ed, #fef3c7)',
      border: '1px solid rgba(217,119,6,0.2)',
      borderRadius: 20,
      padding: 'clamp(24px, 4vw, 36px)',
      marginTop: 'clamp(32px, 6vw, 48px)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
      gap: 'clamp(16px, 3vw, 24px)',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: 'rgba(217,119,6,0.12)', filter: 'blur(48px)',
      }} />
      <div style={{ position: 'relative' }}>
        <p style={{
          fontFamily: mono, fontSize: 10, fontWeight: 800,
          letterSpacing: '0.2em', color: '#d97706',
          margin: '0 0 10px 0',
        }}>
          OWNER BONUS
        </p>
        <h3 style={{
          fontFamily: serif, fontSize: 'clamp(18px, 3vw, 24px)',
          fontWeight: 700, letterSpacing: '0.02em',
          margin: '0 0 10px 0', color: '#7c2d12',
        }}>
          {t5({
            ja: 'P-86S を買うと、PRO が 3 ヶ月無料。',
            en: 'Buy P-86S, get 3 months of PRO — free.',
            ko: 'P-86S 구매 시 PRO 3개월 무료.',
            pt: 'Compre P-86S e ganhe 3 meses de PRO grátis.',
            es: 'Compra P-86S y obtén 3 meses PRO gratis.',
          }, lang)}
        </h3>
        <p style={{
          fontSize: 'clamp(12px, 1.8vw, 14px)',
          color: '#78350f', lineHeight: 1.7, margin: 0,
        }}>
          {t5({
            ja: '音大生だった朝比奈幸太郎が手はんだで作る、数十万円クラスの録音クオリティ。¥13,900。KUON NORMALIZE を含む PRO 特典付き。',
            en: 'Handmade by Kotaro Asahina with his own solder — delivering the quality of $2,000+ microphones. ¥13,900, ships worldwide. PRO benefits including KUON NORMALIZE included.',
            ko: '음대생이었던 아사히나 코타로가 손납땜으로 제작. 수십만 엔급 녹음 품질. ¥13,900.',
            pt: 'Feito à mão por Kotaro Asahina — qualidade de microfones de US$ 2.000+. ¥13,900. Envio internacional.',
            es: 'Hecho a mano por Kotaro Asahina — calidad de micrófonos de $2,000+. ¥13,900. Envío internacional.',
          }, lang)}
        </p>
      </div>
      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap',
        justifyContent: 'flex-end', position: 'relative',
      }}>
        <Link href="/microphone" style={{
          padding: '12px 28px', borderRadius: 50,
          background: '#d97706', color: '#fff',
          fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
          textDecoration: 'none',
          boxShadow: '0 8px 20px rgba(217,119,6,0.35)',
          transition: 'all 0.25s',
        }}>
          {t5({
            ja: 'P-86S を見る', en: 'View P-86S', ko: 'P-86S 보기',
            pt: 'Ver P-86S', es: 'Ver P-86S',
          }, lang)} →
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Service cross-sell (mastering service)
// ─────────────────────────────────────────────
function MasteringServiceCard({ lang }: { lang: Lang }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a, #312e81)',
      borderRadius: 20,
      padding: 'clamp(24px, 4vw, 36px)',
      color: '#fff',
      position: 'relative', overflow: 'hidden',
      marginTop: 'clamp(24px, 4vw, 32px)',
    }}>
      <div style={{
        position: 'absolute', top: -60, left: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(139,92,246,0.2)', filter: 'blur(60px)',
      }} />
      <div style={{ position: 'relative', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)', alignItems: 'center',
      }}>
        <div>
          <p style={{
            fontFamily: mono, fontSize: 10, fontWeight: 800,
            letterSpacing: '0.2em', color: '#a78bfa',
            margin: '0 0 10px 0',
          }}>
            HUMAN TOUCH
          </p>
          <h3 style={{
            fontFamily: serif, fontSize: 'clamp(18px, 3vw, 24px)',
            fontWeight: 700, letterSpacing: '0.02em',
            margin: '0 0 10px 0',
          }}>
            {t5({
              ja: 'ツールで足りない時は、朝比奈幸太郎本人に依頼を。',
              en: 'When tools aren\'t enough, let Kotaro Asahina master it himself.',
              ko: '도구로 부족할 때, 아사히나 코타로 본인에게 의뢰하세요.',
              pt: 'Quando ferramentas não bastam — peça a Kotaro Asahina.',
              es: 'Cuando las herramientas no bastan — pídele a Kotaro Asahina.',
            }, lang)}
          </h3>
          <p style={{
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            color: '#cbd5e1', lineHeight: 1.7, margin: 0,
          }}>
            {t5({
              ja: '音大卒の音響エンジニアによる、1対1のマスタリング／録音サービス。金田式DC録音技術を継承。KUON PRO 会員は優先対応。',
              en: 'One-on-one mastering & recording by a conservatory-trained engineer. Inheriting the Kaneda DC recording tradition. KUON PRO members get priority.',
              ko: '음대 졸업 음향 엔지니어의 1:1 마스터링·녹음. 카네다식 DC 녹음 기술 계승. PRO 회원 우선.',
              pt: 'Masterização e gravação 1:1 por engenheiro formado em conservatório. Tradição Kaneda DC. Membros PRO têm prioridade.',
              es: 'Masterización y grabación 1:1 por ingeniero formado en conservatorio. Tradición Kaneda DC. Miembros PRO con prioridad.',
            }, lang)}
          </p>
        </div>
        <div style={{
          display: 'flex', gap: 10, flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}>
          <Link href="https://academy.kotarohattori.com" target="_blank" rel="noopener" style={{
            padding: '12px 28px', borderRadius: 50,
            background: '#a78bfa', color: '#0f172a',
            fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
            textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(167,139,250,0.35)',
            transition: 'all 0.25s',
          }}>
            {t5({
              ja: 'サービスを見る', en: 'Book a session', ko: '서비스 보기',
              pt: 'Reservar sessão', es: 'Reservar sesión',
            }, lang)} →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Signup CTA Banner
// ─────────────────────────────────────────────
function SignupBanner({ lang }: { lang: Lang }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
      borderRadius: 20, padding: 'clamp(32px, 6vw, 48px)',
      textAlign: 'center' as const, marginTop: 'clamp(32px, 6vw, 48px)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(2,132,199,0.15)', filter: 'blur(60px)',
      }} />
      <p style={{
        fontFamily: mono, fontSize: 10, fontWeight: 700,
        letterSpacing: '0.2em', color: '#0284c7',
        marginBottom: 12,
      }}>
        FREE ACCOUNT
      </p>
      <h2 style={{
        fontFamily: serif, fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
        fontWeight: 600, color: '#fff', lineHeight: 1.5,
        marginBottom: 12, letterSpacing: '0.03em',
      }}>
        {t5({
          ja: '無料アカウントで、あなたの成長が記録される。',
          en: 'Free account — your growth gets recorded.',
          ko: '무료 계정으로 당신의 성장이 기록됩니다.',
          pt: 'Conta gratuita — seu crescimento é registrado.',
          es: 'Cuenta gratuita — tu crecimiento queda registrado.',
        }, lang)}
      </h2>
      <p style={{
        fontSize: 'clamp(12px, 2vw, 14px)', color: '#94a3b8',
        lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px',
      }}>
        {t5({
          ja: '練習記録・聴音スコア・セッション統計——すべてがクラウドに蓄積される。1年後、あなたは自分の成長に驚く。',
          en: 'Practice logs, ear training scores, session stats — everything accumulates in the cloud. In a year, you\'ll be amazed at your own growth.',
          ko: '연습 기록, 청음 점수, 세션 통계 — 모든 것이 클라우드에 축적됩니다. 1년 후, 당신은 자신의 성장에 놀랄 것입니다.',
          pt: 'Registros de prática, pontuações de treinamento auditivo — tudo se acumula na nuvem. Em um ano, você ficará impressionado.',
          es: 'Registros de práctica, puntuaciones de entrenamiento auditivo — todo se acumula en la nube. En un año, te sorprenderás.',
        }, lang)}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/auth/login" style={{
          display: 'inline-block', textDecoration: 'none',
          padding: '12px 32px', borderRadius: 50,
          background: '#0284c7', color: '#fff',
          fontSize: 14, fontWeight: 600, letterSpacing: '0.05em',
          transition: 'all 0.25s',
        }}>
          {t5({
            ja: '無料で始める', en: 'Start Free', ko: '무료로 시작하기',
            pt: 'Começar grátis', es: 'Empezar gratis',
          }, lang)}
        </Link>
        <Link href="/microphone" style={{
          display: 'inline-block', textDecoration: 'none',
          padding: '12px 32px', borderRadius: 50,
          background: 'transparent', color: '#94a3b8',
          fontSize: 14, fontWeight: 500,
          border: '1px solid rgba(148,163,184,0.3)',
          transition: 'all 0.25s',
        }}>
          {t5({
            ja: 'P-86S マイクを見る', en: 'View P-86S Mic', ko: 'P-86S 마이크 보기',
            pt: 'Ver microfone P-86S', es: 'Ver micrófono P-86S',
          }, lang)}
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function AudioAppsPage() {
  const { lang } = useLang();
  const [activePersona, setActivePersona] = useState<Persona>('engineer');
  const [activeTier, setActiveTier] = useState<TierFilter>('all');

  // Apps filtered by active persona
  const personaApps = useMemo(
    () => apps.filter(a => a.personas.includes(activePersona)),
    [activePersona],
  );

  // Counts for persona selector
  const personaCounts = useMemo(() => ({
    engineer: apps.filter(a => a.personas.includes('engineer')).length,
    student:  apps.filter(a => a.personas.includes('student')).length,
    producer: apps.filter(a => a.personas.includes('producer')).length,
  }), []);

  // Counts for tier filter (within current persona)
  const tierCounts: Record<TierFilter, number> = useMemo(() => ({
    all:   personaApps.length,
    open:  personaApps.filter(a => a.tier === 'open').length,
    login: personaApps.filter(a => a.tier === 'login').length,
    pro:   personaApps.filter(a => a.tier === 'pro').length,
  }), [personaApps]);

  // Apply tier filter
  const filteredApps = useMemo(() => (
    activeTier === 'all'
      ? personaApps
      : personaApps.filter(a => a.tier === activeTier)
  ), [personaApps, activeTier]);

  // Sort: ready apps before coming soon, within each by tier (open/login/pro)
  const sortedApps = useMemo(() => {
    const tierOrder: Record<Tier, number> = { open: 0, login: 1, pro: 2 };
    return [...filteredApps].sort((a, b) => {
      if (!!a.isComingSoon !== !!b.isComingSoon) {
        return a.isComingSoon ? 1 : -1;
      }
      return tierOrder[a.tier] - tierOrder[b.tier];
    });
  }, [filteredApps]);

  // Workflow stacks for active persona
  const personaStacks = useMemo(
    () => stacks.filter(s => s.persona === activePersona),
    [activePersona],
  );

  const personaMeta = PERSONA_META[activePersona];

  // Page-wide stats
  const totalApps = apps.length;
  const openApps = apps.filter(a => a.tier === 'open' && !a.isComingSoon).length;
  const comingSoonApps = apps.filter(a => a.isComingSoon).length;

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 40px)',
    }}>
      {/* ═══════ CSS ═══════ */}
      <style>{`
        .reveal{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
        .reveal.visible{opacity:1;transform:translateY(0);}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .hero-enter-1{animation:fadeIn .7s ease forwards}
        .hero-enter-2{animation:fadeIn .7s .15s ease forwards;opacity:0}
        .hero-enter-3{animation:fadeIn .7s .3s ease forwards;opacity:0}
      `}</style>

      {/* ═══════ HERO ═══════ */}
      <section style={{
        textAlign: 'center' as const,
        paddingTop: 'clamp(32px, 8vw, 80px)',
        paddingBottom: 'clamp(32px, 6vw, 56px)',
      }}>
        <div className="hero-enter-1" style={{
          display: 'inline-flex', gap: 28,
          padding: '12px 28px', borderRadius: 50,
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          marginBottom: 32,
        }}>
          {[
            { n: totalApps, label: 'TOOLS', color: '#0284c7' },
            { n: openApps, label: t5({ ja: '即使用可', en: 'READY', ko: '즉시 사용', pt: 'PRONTO', es: 'LISTO' }, lang), color: '#059669' },
            { n: comingSoonApps, label: t5({ ja: '開発中', en: 'COMING', ko: '개발 중', pt: 'EM BREVE', es: 'PRÓXIMO' }, lang), color: '#f59e0b' },
          ].map(({ n, label, color }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />}
              <div style={{ textAlign: 'center' as const }}>
                <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 800, color }}>{n}</div>
                <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: '0.14em', fontWeight: 600 }}>{label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <h1 className="hero-enter-2" style={{
          fontFamily: serif,
          fontSize: 'clamp(26px, 5.5vw, 48px)',
          fontWeight: 700, lineHeight: 1.3, letterSpacing: '0.03em',
          whiteSpace: 'pre-line', marginBottom: 16,
          background: 'linear-gradient(135deg, #111827 20%, #0284c7 60%, #7C3AED)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {t5({
            ja: 'あなたの仕事に、\n最適なツールを。',
            en: 'The right tools\nfor your work.',
            ko: '당신의 일에\n딱 맞는 도구를.',
            pt: 'As ferramentas certas\npara seu trabalho.',
            es: 'Las herramientas correctas\npara tu trabajo.',
          }, lang)}
        </h1>

        <p className="hero-enter-3" style={{
          fontFamily: sans,
          fontSize: 'clamp(13px, 2vw, 16px)', color: '#6b7280',
          lineHeight: 1.8, maxWidth: 560, margin: '0 auto',
        }}>
          {t5({
            ja: 'エンジニア、音大生、プロ制作者——\nあなたの役割に応じた最適なツール群を、即座に見つける。',
            en: 'Engineers, students, pro creators —\nfind the right toolkit for your role, instantly.',
            ko: '엔지니어, 학습자, 프로 제작자 —\n역할에 맞는 도구를 즉시 찾으세요.',
            pt: 'Engenheiros, estudantes, criadores —\nencontre suas ferramentas instantaneamente.',
            es: 'Ingenieros, estudiantes, creadores —\nencuentra tus herramientas al instante.',
          }, lang)}
        </p>
      </section>

      {/* ═══════ PERSONA SELECTOR (primary nav) ═══════ */}
      <PersonaSelector
        active={activePersona}
        setActive={(p) => { setActivePersona(p); setActiveTier('all'); }}
        counts={personaCounts}
        lang={lang}
      />

      {/* ═══════ TIER FILTER ═══════ */}
      <div id="apps" style={{ scrollMarginTop: 80 }}>
        <TierFilterChips
          active={activeTier}
          setActive={setActiveTier}
          counts={tierCounts}
          lang={lang}
          accent={personaMeta.accent}
        />
      </div>

      {/* ═══════ APP GRID ═══════ */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: 'clamp(12px, 2.5vw, 20px)',
        marginBottom: 'clamp(32px, 6vw, 48px)',
      }}>
        {sortedApps.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center' as const,
            padding: '48px 24px',
            color: '#9ca3af',
            fontSize: 14,
          }}>
            {t5({
              ja: 'このフィルタに該当するツールはまだありません。',
              en: 'No tools match this filter yet.',
              ko: '이 필터에 해당하는 도구가 없습니다.',
              pt: 'Nenhuma ferramenta corresponde a este filtro.',
              es: 'Ninguna herramienta coincide con este filtro.',
            }, lang)}
          </div>
        ) : (
          sortedApps.map((app, i) => (
            <AppCard key={`${app.id}-${activePersona}`} app={app} index={i} lang={lang} />
          ))
        )}
      </section>

      {/* ═══════ WORKFLOW STACKS ═══════ */}
      {personaStacks.length > 0 && (
        <section style={{ marginTop: 'clamp(40px, 8vw, 72px)' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 'clamp(20px, 4vw, 32px)' }}>
            <p style={{
              fontFamily: mono, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.2em', color: personaMeta.accent,
              margin: '0 0 10px 0',
            }}>
              WORKFLOW STACKS
            </p>
            <h2 style={{
              fontFamily: serif, fontSize: 'clamp(18px, 3vw, 24px)',
              fontWeight: 700, letterSpacing: '0.03em',
              margin: '0 0 10px 0', color: '#111827',
            }}>
              {t5({
                ja: 'ツールの組み合わせで、作業が完結する。',
                en: 'Complete workflows through combined tools.',
                ko: '도구 조합으로 작업이 완결됩니다.',
                pt: 'Workflows completos combinando ferramentas.',
                es: 'Flujos completos combinando herramientas.',
              }, lang)}
            </h2>
            <p style={{
              fontSize: 'clamp(12px, 1.8vw, 14px)', color: '#6b7280',
              maxWidth: 520, margin: '0 auto', lineHeight: 1.7,
            }}>
              {t5({
                ja: '「次に何を使うべきか」で迷わない。用途別に組み合わせが決まっている。',
                en: 'No more guessing what to use next. The toolchain is mapped for you.',
                ko: '"다음 무엇을 쓸까" 고민 없음. 용도별로 조합이 정해져 있습니다.',
                pt: 'Sem adivinhar o próximo passo. O fluxo está pronto.',
                es: 'Sin adivinar el siguiente paso. El flujo está definido.',
              }, lang)}
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 'clamp(14px, 2.5vw, 20px)',
          }}>
            {personaStacks.map(stack => (
              <WorkflowStack key={stack.id} stack={stack} lang={lang} accent={personaMeta.accent} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════ PRICING / SUBSCRIPTION ═══════ */}
      <SubscriptionPreview lang={lang} />

      {/* ═══════ MIC BUNDLE CTA ═══════ */}
      <MicBundleCTA lang={lang} />

      {/* ═══════ MASTERING SERVICE CROSS-SELL ═══════ */}
      <MasteringServiceCard lang={lang} />

      {/* ═══════ SIGNUP CTA ═══════ */}
      <SignupBanner lang={lang} />

      {/* ═══════ DATA MOAT MESSAGE ═══════ */}
      <div style={{
        textAlign: 'center' as const,
        paddingTop: 'clamp(40px, 8vw, 64px)',
        paddingBottom: 'clamp(24px, 5vw, 40px)',
      }}>
        <p style={{
          fontFamily: serif,
          fontSize: 'clamp(14px, 2.5vw, 18px)',
          color: '#9ca3af',
          lineHeight: 1.8,
          maxWidth: 500,
          margin: '0 auto',
          whiteSpace: 'pre-line' as const,
        }}>
          {t5({
            ja: '他のアプリに乗り換えても、\nここに蓄積された練習記録と成長曲線は、\n持っていけない。',
            en: "Even if you switch to another app,\nyou can't take your practice history\nand growth curve with you.",
            ko: '다른 앱으로 바꿔도,\n여기에 축적된 연습 기록과 성장 곡선은\n가져갈 수 없습니다.',
            pt: 'Mesmo se mudar para outro app,\nvocê não pode levar seu histórico de\nprática e curva de crescimento.',
            es: 'Aunque cambies de app,\nno puedes llevarte tu historial de\npráctica y curva de crecimiento.',
          }, lang)}
        </p>
      </div>
    </div>
  );
}
