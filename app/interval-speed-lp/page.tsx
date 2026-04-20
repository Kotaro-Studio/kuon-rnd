'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L5 = Record<Lang, string>;

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#8b5cf6';

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
  return <section ref={ref} className="reveal" style={{ marginBottom: 'clamp(48px, 10vw, 72px)', ...style }}>{children}</section>;
}

const glass: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: 'clamp(18px, 4vw, 28px)',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
};

const T: Record<string, L5> = {
  heroTitle: {
    ja: '聴音試験で、\n考えている時間はない。',
    en: 'In an ear test,\nthere is no time to think.',
    ko: '청음 시험에서,\n생각할 시간은 없다.',
    pt: 'No teste auditivo,\nnão há tempo para pensar.',
    es: 'En un examen auditivo,\nno hay tiempo para pensar.',
  },
  heroSub: {
    ja: '音程を「知っている」と「反射で答えられる」は全く違う。音大受験の聴音試験は、聴いた瞬間に判別できなければ間に合わない。このアプリは、その反射速度を鍛えるために作られた。',
    en: '"Knowing" an interval and "answering by reflex" are completely different. Music entrance exams demand instant recognition — the moment you hear it. This app was built to train that reflex.',
    ko: '음정을 "아는 것"과 "반사적으로 답하는 것"은 완전히 다릅니다. 음대 입시 청음 시험은 듣는 순간 판별해야 합니다. 이 앱은 그 반사 속도를 훈련하기 위해 만들어졌습니다.',
    pt: '"Saber" um intervalo e "responder por reflexo" são coisas completamente diferentes. Exames de música exigem reconhecimento instantâneo. Este app treina esse reflexo.',
    es: '"Saber" un intervalo y "responder por reflejo" son cosas completamente diferentes. Los exámenes de música exigen reconocimiento instantáneo. Esta app entrena ese reflejo.',
  },
  heroCta: { ja: '今すぐ挑戦する（無料）', en: 'Start Challenge — Free', ko: '지금 도전하기 — 무료', pt: 'Começar — Grátis', es: 'Comenzar — Gratis' },
  heroMore: { ja: '詳しく見る', en: 'Learn More', ko: '더 알아보기', pt: 'Saiba mais', es: 'Más información' },

  painTitle: { ja: 'こんな経験、ありませんか？', en: 'Sound familiar?', ko: '이런 경험, 있지 않나요?', pt: 'Parece familiar?', es: '¿Te suena familiar?' },
  pain1: {
    ja: '「聴音の授業でメロディは書き取れるのに、音程を1つずつ問われると迷ってしまう」',
    en: '"I can take melody dictation, but when asked to identify individual intervals, I freeze."',
    ko: '"청음 수업에서 멜로디는 받아쓸 수 있는데, 음정을 하나씩 물으면 망설여져요"',
    pt: '"Consigo fazer ditado melódico, mas quando pedem para identificar intervalos individuais, eu travo."',
    es: '"Puedo hacer dictado melódico, pero cuando me piden identificar intervalos individuales, me bloqueo."',
  },
  pain2: {
    ja: '「模試で短3度と長3度を聴き間違えて、あと1問で不合格だった」',
    en: '"I confused a minor 3rd with a major 3rd on a mock exam — and failed by one question."',
    ko: '"모의시험에서 단3도와 장3도를 잘못 들어서, 1문제 차이로 불합격이었어요"',
    pt: '"Confundi uma 3ª menor com uma 3ª maior no simulado — e reprovei por uma questão."',
    es: '"Confundí una 3ª menor con una 3ª mayor en el simulacro — y reprobé por una pregunta."',
  },
  pain3: {
    ja: '「時間をかければ判別できるけど、試験のスピードについていけない」',
    en: '"I can identify intervals if I take my time, but I cannot keep up with the exam pace."',
    ko: '"시간을 들이면 구별할 수 있지만, 시험 속도를 따라잡을 수가 없어요"',
    pt: '"Consigo identificar com tempo, mas não acompanho o ritmo do exame."',
    es: '"Puedo identificar con tiempo, pero no puedo seguir el ritmo del examen."',
  },

  solutionTitle: { ja: 'INTERVAL SPEED は、「反射」を鍛える。', en: 'INTERVAL SPEED trains your reflexes.', ko: 'INTERVAL SPEED는 "반사"를 훈련합니다.', pt: 'INTERVAL SPEED treina seus reflexos.', es: 'INTERVAL SPEED entrena tus reflejos.' },
  solutionDesc: {
    ja: '知識ではなく、スピード。正確さではなく、反射。20ラウンドの連続出題で、音程の判別を体に叩き込む。毎日5分、通学の電車の中でも。',
    en: 'Not knowledge — speed. Not accuracy — reflex. 20 consecutive rounds hammer interval recognition into your muscle memory. 5 minutes a day, even on the train to school.',
    ko: '지식이 아닌 속도. 정확성이 아닌 반사. 20라운드의 연속 출제로 음정 판별을 몸에 새깁니다. 매일 5분, 통학 전철에서도.',
    pt: 'Não é conhecimento — é velocidade. Não é precisão — é reflexo. 20 rodadas consecutivas gravam o reconhecimento na memória muscular. 5 minutos por dia, mesmo no ônibus.',
    es: 'No es conocimiento — es velocidad. No es precisión — es reflejo. 20 rondas consecutivas graban el reconocimiento en la memoria muscular. 5 minutos al día, incluso en el transporte.',
  },

  diffTitle: { ja: '3つの難易度で段階的に', en: '3 Difficulty Levels, Step by Step', ko: '3가지 난이도로 단계적으로', pt: '3 Níveis Progressivos', es: '3 Niveles Progresivos' },
  diff1Title: { ja: 'Easy — まずは5音程から', en: 'Easy — Start with 5 intervals', ko: 'Easy — 5음정부터', pt: 'Easy — 5 intervalos', es: 'Easy — 5 intervalos' },
  diff1Desc: {
    ja: '短3度・長3度・完全4度・完全5度・オクターブ。最も頻出で、最も重要な5つ。ここで反射の基礎を作る。',
    en: 'Minor 3rd, major 3rd, perfect 4th, perfect 5th, octave. The 5 most common and important intervals. Build your reflex foundation here.',
    ko: '단3도, 장3도, 완전4도, 완전5도, 옥타브. 가장 자주 출제되는 5개 음정. 반사의 기초를 여기서 만듭니다.',
    pt: '3ª menor, 3ª maior, 4ª justa, 5ª justa, oitava. Os 5 intervalos mais comuns e importantes.',
    es: '3ª menor, 3ª mayor, 4ª justa, 5ª justa, octava. Los 5 intervalos más comunes e importantes.',
  },
  diff2Title: { ja: 'Medium — 9音程へ拡張', en: 'Medium — Expand to 9', ko: 'Medium — 9음정으로 확장', pt: 'Medium — 9 intervalos', es: 'Medium — 9 intervalos' },
  diff2Desc: {
    ja: '短2度・長2度・短6度・長6度を追加。聴音試験の出題範囲をほぼカバー。',
    en: 'Adds minor/major 2nd and minor/major 6th. Covers nearly all ear exam questions.',
    ko: '단2도, 장2도, 단6도, 장6도 추가. 청음 시험 출제 범위를 거의 커버.',
    pt: 'Adiciona 2ª menor/maior e 6ª menor/maior. Cobre quase todo o conteúdo do exame.',
    es: 'Añade 2ª menor/mayor y 6ª menor/mayor. Cubre casi todo el contenido del examen.',
  },
  diff3Title: { ja: 'Hard — 全12音程', en: 'Hard — All 12 intervals', ko: 'Hard — 전 12음정', pt: 'Hard — 12 intervalos', es: 'Hard — 12 intervalos' },
  diff3Desc: {
    ja: '三全音・短7度・長7度を追加。ここまで反射で識別できれば、聴音試験の音程問題は怖くない。',
    en: 'Adds tritone, minor 7th, major 7th. If you can identify all 12 by reflex, interval questions on ear exams will never scare you.',
    ko: '삼전음, 단7도, 장7도 추가. 여기까지 반사로 식별할 수 있으면, 청음 시험의 음정 문제는 두렵지 않습니다.',
    pt: 'Adiciona trítono, 7ª menor, 7ª maior. Se identificar todos os 12 por reflexo, a prova não assusta.',
    es: 'Añade tritono, 7ª menor, 7ª mayor. Si identificas los 12 por reflejo, el examen no te asusta.',
  },

  examTitle: { ja: '受験対策としての音程トレーニング', en: 'Interval Training for Entrance Exams', ko: '입시 대비 음정 훈련', pt: 'Treino de Intervalos para Vestibulares', es: 'Entrenamiento de Intervalos para Exámenes' },
  examDesc: {
    ja: '音大・音楽高校の入学試験では、聴音（ソルフェージュ）の配点が高い。特に音程判別は基礎中の基礎。しかし多くの受験生が「知っているのに試験では答えられない」という壁にぶつかる。原因は知識不足ではなく、反応速度の不足。INTERVAL SPEEDは、この「知っているのに答えられない」ギャップを埋めるために設計された。',
    en: 'In music school entrance exams, ear training (solfege) carries significant weight. Interval identification is the absolute foundation. Yet many candidates hit a wall: "I know it, but I cannot answer fast enough in the exam." The cause is not lack of knowledge — it is lack of reaction speed. INTERVAL SPEED was designed to close that gap.',
    ko: '음대·음악고교 입학시험에서 청음(솔페주)의 배점은 높습니다. 특히 음정 판별은 기초 중의 기초. 그러나 많은 수험생이 "알고 있는데 시험에서 답하지 못하는" 벽에 부딪힙니다. 원인은 지식 부족이 아닌 반응 속도 부족. INTERVAL SPEED는 이 갭을 메우기 위해 설계되었습니다.',
    pt: 'Nos exames de admissão de escolas de música, o treinamento auditivo tem peso significativo. Identificação de intervalos é a base absoluta. Muitos candidatos enfrentam um muro: "Eu sei, mas não consigo responder rápido o suficiente." A causa não é falta de conhecimento — é falta de velocidade de reação. O INTERVAL SPEED foi projetado para fechar essa lacuna.',
    es: 'En los exámenes de admisión de escuelas de música, el entrenamiento auditivo tiene peso significativo. Identificación de intervalos es la base absoluta. Muchos candidatos chocan con un muro: "Lo sé, pero no puedo responder lo suficientemente rápido." La causa no es falta de conocimiento — es falta de velocidad de reacción. INTERVAL SPEED fue diseñado para cerrar esa brecha.',
  },

  examBenefits: {
    ja: '毎日5分の習慣が、本番で差をつける。',
    en: '5 minutes a day makes the difference on exam day.',
    ko: '매일 5분의 습관이 본번에서 차이를 만듭니다.',
    pt: '5 minutos por dia fazem a diferença no dia da prova.',
    es: '5 minutos al día marcan la diferencia el día del examen.',
  },
  examBenefit1: {
    ja: '聴いた瞬間に音程名が浮かぶ反射回路を構築',
    en: 'Build neural pathways that instantly name intervals the moment you hear them',
    ko: '들은 순간 음정명이 떠오르는 반사 회로 구축',
    pt: 'Construa vias neurais que nomeiam intervalos instantaneamente',
    es: 'Construye vías neuronales que nombran intervalos al instante',
  },
  examBenefit2: {
    ja: '似た音程（短3度 vs 長3度、完全4度 vs 三全音）の聴き分けが自動化',
    en: 'Automate distinction between similar intervals (m3 vs M3, P4 vs tritone)',
    ko: '비슷한 음정(단3도 vs 장3도, 완전4도 vs 삼전음)의 구별 자동화',
    pt: 'Automatize a distinção entre intervalos similares (m3 vs M3, P4 vs trítono)',
    es: 'Automatiza la distinción entre intervalos similares (m3 vs M3, P4 vs tritono)',
  },
  examBenefit3: {
    ja: '上行・下行・和声の3方向で出題されるため、試験形式に直結',
    en: 'Questions in ascending, descending, and harmonic — directly mirrors exam format',
    ko: '상행·하행·화성의 3방향으로 출제되어 시험 형식에 직결',
    pt: 'Questões ascendentes, descendentes e harmônicas — espelha o formato do exame',
    es: 'Preguntas ascendentes, descendentes y armónicas — refleja directamente el formato del examen',
  },
  examBenefit4: {
    ja: 'スコアと自己ベスト記録で、成長を数値で確認できる',
    en: 'Score and personal best tracking lets you see growth in numbers',
    ko: '스코어와 자기 최고 기록으로 성장을 수치로 확인',
    pt: 'Pontuação e recordes pessoais permitem ver o crescimento em números',
    es: 'Puntuación y récords personales te permiten ver el crecimiento en números',
  },

  scoreTitle: { ja: 'スピードがスコアになる', en: 'Speed Becomes Your Score', ko: '속도가 점수가 된다', pt: 'Velocidade Vira Pontuação', es: 'La Velocidad Se Convierte en Puntuación' },
  scoreDesc: {
    ja: '正答の速さに応じてスコアが変わる。1秒以内なら300点、2秒以内で200点、3秒以内で150点。不正解は0点。20ラウンドの合計スコアで自己ベストを記録。',
    en: 'Score scales with reaction speed: under 1s = 300pts, under 2s = 200pts, under 3s = 150pts. Wrong answers = 0. Total score across 20 rounds. Track your personal best.',
    ko: '정답 속도에 따라 점수가 달라집니다. 1초 이내 300점, 2초 이내 200점, 3초 이내 150점. 오답 0점. 20라운드 합산으로 자기 최고 기록.',
    pt: 'Pontuação muda com velocidade: <1s = 300pts, <2s = 200pts, <3s = 150pts. Erros = 0. 20 rodadas, recorde pessoal.',
    es: 'Puntuación según velocidad: <1s = 300pts, <2s = 200pts, <3s = 150pts. Errores = 0. 20 rondas, récord personal.',
  },
  speedLabels: {
    ja: '⚡ Lightning（1秒以内）→ 🏃 Fast（2秒以内）→ 👍 Good（3秒以内）→ 🐢 Slow（3秒超）',
    en: '⚡ Lightning (<1s) → 🏃 Fast (<2s) → 👍 Good (<3s) → 🐢 Slow (>3s)',
    ko: '⚡ Lightning (<1초) → 🏃 Fast (<2초) → 👍 Good (<3초) → 🐢 Slow (>3초)',
    pt: '⚡ Lightning (<1s) → 🏃 Fast (<2s) → 👍 Good (<3s) → 🐢 Slow (>3s)',
    es: '⚡ Lightning (<1s) → 🏃 Fast (<2s) → 👍 Good (<3s) → 🐢 Slow (>3s)',
  },

  vsTitle: { ja: 'EAR TRAINING との使い分け', en: 'EAR TRAINING vs INTERVAL SPEED', ko: 'EAR TRAINING과의 차이', pt: 'EAR TRAINING vs INTERVAL SPEED', es: 'EAR TRAINING vs INTERVAL SPEED' },
  vsEarTrain: { ja: 'EAR TRAINING', en: 'EAR TRAINING', ko: 'EAR TRAINING', pt: 'EAR TRAINING', es: 'EAR TRAINING' },
  vsEarDesc: {
    ja: '正確さ重視の学習ツール。音程・和音・音階・聴音の4モード。レベルアップ制でじっくり身につける。',
    en: 'Accuracy-focused learning tool. 4 modes: intervals, chords, scales, dictation. Level-up system for deep learning.',
    ko: '정확성 중시 학습 도구. 4모드: 음정, 화음, 음계, 청음. 레벨업 시스템으로 차근차근.',
    pt: 'Ferramenta de aprendizado focada em precisão. 4 modos. Sistema de níveis para aprendizado profundo.',
    es: 'Herramienta de aprendizaje enfocada en precisión. 4 modos. Sistema de niveles para aprendizaje profundo.',
  },
  vsSpeedDesc: {
    ja: '速さ重視の反射ゲーム。20ラウンドのスピードチャレンジ。スコア制で毎日の自己ベスト更新。',
    en: 'Speed-focused reaction game. 20-round speed challenge. Score-based with daily personal best tracking.',
    ko: '속도 중시 반사 게임. 20라운드 스피드 챌린지. 매일 자기 최고 기록 갱신.',
    pt: 'Jogo de reação focado em velocidade. 20 rodadas. Pontuação com recordes pessoais diários.',
    es: 'Juego de reacción enfocado en velocidad. 20 rondas. Puntuación con récords personales diarios.',
  },
  vsBoth: {
    ja: 'EAR TRAININGで音程を「理解」し、INTERVAL SPEEDで「体に染み込ませる」。両方使うことで、聴音試験の得点が飛躍的に伸びる。',
    en: 'Use EAR TRAINING to "understand" intervals, and INTERVAL SPEED to "internalize" them. Together, they dramatically boost your ear exam scores.',
    ko: 'EAR TRAINING으로 음정을 "이해"하고, INTERVAL SPEED로 "체화"합니다. 둘 다 사용하면 청음 시험 점수가 비약적으로 오릅니다.',
    pt: 'Use o EAR TRAINING para "entender" e o INTERVAL SPEED para "internalizar". Juntos, eles impulsionam dramaticamente suas notas.',
    es: 'Usa EAR TRAINING para "entender" e INTERVAL SPEED para "internalizar". Juntos, impulsan dramáticamente tus notas.',
  },

  whoTitle: { ja: 'こんな人に最適なアプリ', en: 'The Perfect App For You', ko: '이런 분에게 최적의 앱', pt: 'O App Perfeito Para Você', es: 'La App Perfecta Para Ti' },
  who1: {
    ja: '🎓 音大受験を控えた受験生 — 聴音試験の音程問題で確実に得点したい',
    en: '🎓 Music school exam candidates — Want reliable scores on interval identification',
    ko: '🎓 음대 입시를 앞둔 수험생 — 청음 시험 음정 문제에서 확실히 득점하고 싶다',
    pt: '🎓 Candidatos a escolas de música — Quer pontuação confiável em intervalos',
    es: '🎓 Candidatos a escuelas de música — Quieren puntuación confiable en intervalos',
  },
  who2: {
    ja: '🎹 音楽高校を目指す中学生 — 早い段階で聴音の基礎を固めたい',
    en: '🎹 Middle schoolers aiming for music high school — Build ear foundations early',
    ko: '🎹 음악고등학교를 목표하는 중학생 — 이른 단계에서 청음 기초를 다지고 싶다',
    pt: '🎹 Alunos que buscam escolas de música — Construir bases auditivas cedo',
    es: '🎹 Estudiantes que buscan escuelas de música — Construir bases auditivas temprano',
  },
  who3: {
    ja: '🎼 和声の授業で音程に苦手意識がある音大生 — 反射速度を上げて授業に追いつく',
    en: '🎼 Music students struggling with intervals in harmony class — Speed up to keep pace',
    ko: '🎼 화성 수업에서 음정에 어려움을 느끼는 음대생 — 반사 속도를 높여 수업을 따라잡기',
    pt: '🎼 Estudantes com dificuldade em intervalos — Acelere para acompanhar a turma',
    es: '🎼 Estudiantes con dificultad en intervalos — Acelera para seguir el ritmo de la clase',
  },
  who4: {
    ja: '🎸 アンサンブルで瞬時にピッチのずれを判断したい楽器奏者',
    en: '🎸 Instrumentalists wanting instant pitch deviation detection in ensembles',
    ko: '🎸 앙상블에서 순간적으로 피치 차이를 판단하고 싶은 악기 연주자',
    pt: '🎸 Instrumentistas que querem detectar desvios de afinação instantaneamente',
    es: '🎸 Instrumentistas que quieren detectar desviaciones de afinación instantáneamente',
  },
  who5: {
    ja: '🎮 毎日の耳トレを、楽しいゲームとして続けたい人',
    en: '🎮 Anyone who wants daily ear training to feel like a fun game',
    ko: '🎮 매일의 귀 훈련을 재미있는 게임으로 계속하고 싶은 사람',
    pt: '🎮 Quem quer que o treino diário pareça um jogo divertido',
    es: '🎮 Quien quiera que el entrenamiento diario se sienta como un juego divertido',
  },
  who6: {
    ja: '🏆 「全音程を1秒以内に判別できる」という目標に挑戦したい音楽家',
    en: '🏆 Musicians challenging themselves to identify all intervals under 1 second',
    ko: '🏆 "전 음정을 1초 이내에 판별"이라는 목표에 도전하고 싶은 음악가',
    pt: '🏆 Músicos que desafiam a si mesmos a identificar todos em menos de 1 segundo',
    es: '🏆 Músicos que se desafían a identificar todos en menos de 1 segundo',
  },

  achTitle: { ja: '8つのアチーブメント', en: '8 Achievements to Unlock', ko: '8개의 업적 해제', pt: '8 Conquistas para Desbloquear', es: '8 Logros para Desbloquear' },
  achDesc: {
    ja: '「1秒以内に10問正答」「全20問パーフェクト」「スコア5000超え」「0.5秒以内に正答」「ハードモードで4000超え」「50ゲーム達成」— 実績をコンプリートしよう。',
    en: '"10 under 1s", "Perfect 20", "Score 5000+", "Sub-500ms", "Hard 4000+", "50 games" — complete them all.',
    ko: '"1초 이내 10문제", "퍼펙트 20", "스코어 5000+", "0.5초 이내", "하드 4000+", "50게임" — 전부 달성하세요.',
    pt: '"10 em <1s", "Perfeito 20", "5000+", "<500ms", "Hard 4000+", "50 jogos" — complete todos.',
    es: '"10 en <1s", "Perfecto 20", "5000+", "<500ms", "Hard 4000+", "50 juegos" — completa todos.',
  },

  freeTitle: { ja: 'ブラウザ完結。完全無料。', en: 'Browser-based. Completely free.', ko: '브라우저 완결. 완전 무료.', pt: 'No navegador. Totalmente grátis.', es: 'En el navegador. Totalmente gratis.' },
  freeDesc: {
    ja: 'ダウンロード不要。アカウント登録不要。広告なし。スマートフォンでもPCでも、ブラウザを開いた瞬間から練習開始。通学中の電車の中でも、レッスン前の5分でも。',
    en: 'No download. No signup. No ads. Start practicing the moment you open your browser — on phone or PC. On the train to school. 5 minutes before your lesson.',
    ko: '다운로드 불필요. 계정 등록 불필요. 광고 없음. 스마트폰이든 PC든, 브라우저를 연 순간부터 연습 시작. 통학 전철에서도, 레슨 전 5분에도.',
    pt: 'Sem download. Sem cadastro. Sem anúncios. Comece a praticar no momento em que abrir o navegador. No ônibus, 5 minutos antes da aula.',
    es: 'Sin descarga. Sin registro. Sin anuncios. Empieza a practicar en cuanto abras el navegador. En el transporte, 5 minutos antes de tu clase.',
  },

  ctaTitle: { ja: '聴音試験まで、あと何日？', en: 'How many days until your ear exam?', ko: '청음 시험까지 며칠 남았나요?', pt: 'Quantos dias até sua prova?', es: '¿Cuántos días faltan para tu examen?' },
  ctaSub: {
    ja: '今日の5分が、本番の1点になる。',
    en: "Today's 5 minutes become tomorrow's exam points.",
    ko: "오늘의 5분이 본번의 1점이 됩니다.",
    pt: 'Os 5 minutos de hoje se tornam os pontos de amanhã.',
    es: 'Los 5 minutos de hoy se convierten en los puntos de mañana.',
  },
  ctaBtn: { ja: 'INTERVAL SPEED を始める（無料）', en: 'Start INTERVAL SPEED — Free', ko: 'INTERVAL SPEED 시작 — 무료', pt: 'Começar INTERVAL SPEED — Grátis', es: 'Comenzar INTERVAL SPEED — Gratis' },
  ctaEar: { ja: 'EAR TRAINING も試す', en: 'Try EAR TRAINING too', ko: 'EAR TRAINING도 해보기', pt: 'Tente EAR TRAINING também', es: 'Prueba EAR TRAINING también' },
  ctaChord: { ja: 'CHORD QUIZ も試す', en: 'Try CHORD QUIZ too', ko: 'CHORD QUIZ도 해보기', pt: 'Tente CHORD QUIZ também', es: 'Prueba CHORD QUIZ también' },
};

export default function IntervalSpeedLP() {
  const { lang } = useLang();
  const t = (k: string) => T[k]?.[lang] ?? T[k]?.en ?? '';

  return (
    <main style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: sans, color: '#1e293b' }}>
      <style>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s, transform .7s; }
        .reveal.visible { opacity: 1; transform: none; }
        @media (max-width:767px) { .sp-col { flex-direction: column !important; } }
      `}</style>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(24px,6vw,56px) clamp(16px,4vw,32px)' }}>

        {/* ── Hero ── */}
        <Section>
          <p style={{ fontFamily: serif, fontSize: 'clamp(11px,2.5vw,13px)', letterSpacing: 4, color: ACCENT, marginBottom: 12, textTransform: 'uppercase' }}>
            Kuon Interval Speed
          </p>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(24px,5vw,40px)', lineHeight: 1.5, marginBottom: 16, whiteSpace: 'pre-line' }}>
            {t('heroTitle')}
          </h1>
          <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.8, color: '#475569', marginBottom: 28, maxWidth: 680 }}>
            {t('heroSub')}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/interval-speed" style={{
              display: 'inline-block', background: ACCENT, color: '#fff', fontWeight: 700,
              padding: '14px 36px', borderRadius: 10, fontSize: 'clamp(14px,2.5vw,16px)', textDecoration: 'none',
            }}>
              {t('heroCta')}
            </Link>
            <a href="#exam" style={{
              display: 'inline-block', border: `1.5px solid ${ACCENT}`, color: ACCENT, fontWeight: 600,
              padding: '14px 28px', borderRadius: 10, fontSize: 'clamp(14px,2.5vw,16px)', textDecoration: 'none',
            }}>
              {t('heroMore')}
            </a>
          </div>
        </Section>

        {/* ── Pain Points ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4vw,30px)', marginBottom: 20 }}>{t('painTitle')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['pain1', 'pain2', 'pain3'].map(k => (
              <div key={k} style={{ ...glass, borderLeft: '3px solid #ef4444', padding: '16px 20px' }}>
                <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.7, color: '#475569', fontStyle: 'italic' }}>
                  {t(k)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Solution ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4vw,30px)', marginBottom: 12 }}>{t('solutionTitle')}</h2>
          <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.8, color: '#475569', maxWidth: 680 }}>
            {t('solutionDesc')}
          </p>
        </Section>

        {/* ── 3 Difficulty Levels ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4vw,30px)', marginBottom: 24 }}>{t('diffTitle')}</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }} className="sp-col">
            {(['diff1', 'diff2', 'diff3'] as const).map((k, i) => (
              <div key={k} style={{ ...glass, flex: '1 1 220px', borderTop: `3px solid ${['#22c55e', '#f59e0b', '#ef4444'][i]}` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: ['#22c55e', '#f59e0b', '#ef4444'][i], marginBottom: 6 }}>
                  {['EASY', 'MEDIUM', 'HARD'][i]}
                </p>
                <h3 style={{ fontFamily: serif, fontSize: 'clamp(15px,2.8vw,19px)', marginBottom: 8, lineHeight: 1.4 }}>{t(`${k}Title`)}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b' }}>{t(`${k}Desc`)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Exam Prep Section ── */}
        <Section>
          <div id="exam" />
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4vw,30px)', marginBottom: 16 }}>{t('examTitle')}</h2>
          <div style={{ ...glass, borderLeft: `3px solid ${ACCENT}`, marginBottom: 20 }}>
            <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.9, color: '#475569' }}>
              {t('examDesc')}
            </p>
          </div>

          <h3 style={{ fontFamily: serif, fontSize: 'clamp(16px,3vw,22px)', marginBottom: 16, color: '#0f172a' }}>
            {t('examBenefits')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['examBenefit1', 'examBenefit2', 'examBenefit3', 'examBenefit4'].map((k, i) => (
              <div key={k} style={{ ...glass, padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{
                  background: `${ACCENT}12`, color: ACCENT, fontWeight: 800, fontSize: '0.82rem',
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: 'clamp(14px,2.5vw,15px)', lineHeight: 1.6, color: '#475569', margin: 0 }}>
                  {t(k)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Score System ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4vw,30px)', marginBottom: 16 }}>{t('scoreTitle')}</h2>
          <div style={glass}>
            <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.8, color: '#475569', marginBottom: 16 }}>
              {t('scoreDesc')}
            </p>
            <p style={{
              fontFamily: '"SF Mono","Fira Code","Consolas",monospace',
              fontSize: 'clamp(12px,2.2vw,14px)',
              color: ACCENT,
              background: 'rgba(139,92,246,0.06)',
              padding: '12px 16px',
              borderRadius: 8,
              lineHeight: 1.6,
            }}>
              {t('speedLabels')}
            </p>
          </div>
        </Section>

        {/* ── vs EAR TRAINING ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4vw,30px)', marginBottom: 20 }}>{t('vsTitle')}</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }} className="sp-col">
            <div style={{ ...glass, flex: '1 1 280px', borderTop: '3px solid #0284c7' }}>
              <p style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.82rem', marginBottom: 6 }}>{t('vsEarTrain')}</p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b' }}>{t('vsEarDesc')}</p>
            </div>
            <div style={{ ...glass, flex: '1 1 280px', borderTop: `3px solid ${ACCENT}` }}>
              <p style={{ fontWeight: 700, color: ACCENT, fontSize: '0.82rem', marginBottom: 6 }}>INTERVAL SPEED</p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#64748b' }}>{t('vsSpeedDesc')}</p>
            </div>
          </div>
          <div style={{ ...glass, marginTop: 16, borderLeft: `3px solid #22c55e` }}>
            <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.8, color: '#475569', fontWeight: 500 }}>
              {t('vsBoth')}
            </p>
          </div>
        </Section>

        {/* ── Who Is This For ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4vw,30px)', marginBottom: 20 }}>{t('whoTitle')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['who1', 'who2', 'who3', 'who4', 'who5', 'who6'].map(k => (
              <div key={k} style={{ ...glass, padding: '14px 20px' }}>
                <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.6 }}>{t(k)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Achievements ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4vw,30px)', marginBottom: 16 }}>{t('achTitle')}</h2>
          <div style={{ ...glass, borderLeft: `3px solid #f59e0b` }}>
            <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.8, color: '#475569' }}>
              {t('achDesc')}
            </p>
          </div>
        </Section>

        {/* ── Free ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4vw,30px)', marginBottom: 12 }}>{t('freeTitle')}</h2>
          <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 1.8, color: '#475569', maxWidth: 680 }}>
            {t('freeDesc')}
          </p>
        </Section>

        {/* ── Final CTA ── */}
        <Section>
          <div style={{
            textAlign: 'center',
            padding: 'clamp(32px,6vw,56px) clamp(16px,4vw,32px)',
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #e2e8f0',
          }}>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px,4.5vw,34px)', marginBottom: 10, lineHeight: 1.4 }}>
              {t('ctaTitle')}
            </h2>
            <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', color: '#64748b', marginBottom: 24 }}>
              {t('ctaSub')}
            </p>
            <Link href="/interval-speed" style={{
              display: 'inline-block', background: ACCENT, color: '#fff', fontWeight: 700,
              padding: '16px 40px', borderRadius: 12, fontSize: 'clamp(14px,2.5vw,17px)', textDecoration: 'none',
              marginBottom: 16,
            }}>
              {t('ctaBtn')}
            </Link>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginTop: 12 }}>
              <Link href="/ear-training-lp" style={{
                color: '#0284c7', fontWeight: 600, fontSize: 'clamp(13px,2.5vw,15px)', textDecoration: 'none',
              }}>
                {t('ctaEar')} →
              </Link>
              <Link href="/chord-quiz-lp" style={{
                color: ACCENT, fontWeight: 600, fontSize: 'clamp(13px,2.5vw,15px)', textDecoration: 'none',
              }}>
                {t('ctaChord')} →
              </Link>
            </div>
          </div>
        </Section>
      </div>
    </main>
  );
}
