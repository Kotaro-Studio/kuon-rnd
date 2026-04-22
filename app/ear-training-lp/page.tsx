'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L5 = Partial<Record<Lang, string>> & { en: string };

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const ACCENT  = '#0284c7';
const ACCENT2 = '#0ea5e9';
const GREEN = '#22c55e';
const GOLD  = '#f59e0b';

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
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: 16,
  padding: 'clamp(20px, 4vw, 32px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
};

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T: Record<string, L5> = {
  heroTitle: {
    ja: '音感は、才能ではない。\n正しいトレーニングで身につく。',
    en: 'Perfect pitch isn\'t talent.\nIt\'s practice with the right tool.',
    ko: '음감은 재능이 아닙니다.\n올바른 훈련으로 키울 수 있습니다.',
    pt: 'Ouvido perfeito não é talento.\nÉ prática com a ferramenta certa.',
    es: 'El oído perfecto no es talento.\nEs práctica con la herramienta correcta.',
  },
  heroSub: {
    ja: '音程・和音・音階・聴音。音大受験に必要な全てを、レベルアップ制で楽しく鍛えるブラウザアプリ。無料。',
    en: 'Intervals, chords, scales, and dictation. Everything you need for music entrance exams. Level-up system. Free in your browser.',
    ko: '음정, 화음, 음계, 청음. 음대 입시에 필요한 모든 것을 레벨업 시스템으로 즐겁게 훈련. 무료.',
    pt: 'Intervalos, acordes, escalas e ditado. Tudo para o vestibular de música. Sistema de níveis. Grátis.',
    es: 'Intervalos, acordes, escalas y dictado. Todo para el examen de ingreso. Sistema de niveles. Gratis.',
  },
  heroCta: {
    ja: '今すぐ始める（無料）',
    en: 'Start Training — Free',
    ko: '지금 시작하기 — 무료',
    pt: 'Começar — Grátis',
    es: 'Comenzar — Gratis',
  },
  heroLearn: {
    ja: '詳しく見る',
    en: 'Learn More',
    ko: '더 알아보기',
    pt: 'Saiba mais',
    es: 'Más información',
  },

  // Pain points
  painTitle: {
    ja: 'こんな悩み、ありませんか？',
    en: 'Sound familiar?',
    ko: '이런 고민, 있지 않나요?',
    pt: 'Soa familiar?',
    es: '¿Te suena familiar?',
  },
  pain1Title: {
    ja: '「聴音が苦手で、受験が不安…」',
    en: '"I struggle with dictation exams..."',
    ko: '"청음이 약해서 입시가 걱정돼요..."',
    pt: '"Tenho dificuldade com ditados..."',
    es: '"Me cuesta el dictado..."',
  },
  pain1Desc: {
    ja: '音大受験の聴音試験は、多くの受験生が最も不安を感じるパート。でも正しい方法で毎日5分練習すれば、確実に伸びます。',
    en: 'The aural skills portion of music exams is what most students fear most. But with just 5 minutes of daily practice using the right method, improvement is guaranteed.',
    ko: '음대 입시 청음 시험은 많은 수험생이 가장 불안해하는 파트입니다. 하지만 올바른 방법으로 매일 5분 연습하면 확실히 향상됩니다.',
    pt: 'A parte de percepção auditiva é o que mais preocupa os estudantes. Mas com apenas 5 minutos diários usando o método certo, a melhora é garantida.',
    es: 'La parte de habilidades auditivas es lo que más temen los estudiantes. Pero con solo 5 minutos diarios, la mejora está garantizada.',
  },
  pain2Title: {
    ja: '「ピアノがないと練習できない」',
    en: '"I need a piano to practice..."',
    ko: '"피아노가 없으면 연습을 못 해요"',
    pt: '"Preciso de um piano para praticar..."',
    es: '"Necesito un piano para practicar..."',
  },
  pain2Desc: {
    ja: 'スマホさえあれば、通学中でも、寝る前でも、いつでもどこでも聴音トレーニング。ピアノがない環境でも音感は鍛えられます。',
    en: 'All you need is your phone. Train on the bus, before bed, anywhere. Develop your ear without needing access to a piano.',
    ko: '스마트폰만 있으면 통학 중에도, 잠자기 전에도, 언제 어디서든 청음 훈련. 피아노가 없는 환경에서도 음감을 키울 수 있습니다.',
    pt: 'Tudo que você precisa é seu celular. Treine no ônibus, antes de dormir, em qualquer lugar.',
    es: 'Solo necesitas tu teléfono. Entrena en el bus, antes de dormir, en cualquier lugar.',
  },
  pain3Title: {
    ja: '「どのアプリも続かない…」',
    en: '"I can\'t stick with any app..."',
    ko: '"어떤 앱도 계속하지 못해요..."',
    pt: '"Não consigo manter nenhum app..."',
    es: '"No puedo seguir con ninguna app..."',
  },
  pain3Desc: {
    ja: 'KUON EAR TRAINING はレベルアップ制、連続日数ストリーク、アチーブメントで「つい毎日開いてしまう」設計。ゲーム感覚で音感が身につきます。',
    en: 'KUON EAR TRAINING uses a level-up system, daily streaks, and achievements to keep you coming back. Gamified ear training that actually works.',
    ko: 'KUON EAR TRAINING은 레벨업 시스템, 연속 일수 스트릭, 업적으로 "매일 열어보게 되는" 설계. 게임 감각으로 음감이 길러집니다.',
    pt: 'KUON EAR TRAINING usa um sistema de níveis, sequências diárias e conquistas para te manter voltando. Treinamento auditivo gamificado que funciona.',
    es: 'KUON EAR TRAINING usa un sistema de niveles, rachas diarias y logros para mantenerte regresando. Entrenamiento auditivo gamificado que funciona.',
  },

  // Features
  featTitle: {
    ja: '4つのトレーニングモード',
    en: '4 Training Modes',
    ko: '4가지 훈련 모드',
    pt: '4 Modos de Treino',
    es: '4 Modos de Entrenamiento',
  },
  feat1Title: { ja: '音程（インターバル）', en: 'Intervals', ko: '음정', pt: 'Intervalos', es: 'Intervalos' },
  feat1Desc: {
    ja: '短2度からオクターブまで、12の音程を段階的に解禁。上行・下行・同時の3パターンで出題。',
    en: 'From minor 2nd to octave — 12 intervals unlocked progressively. Ascending, descending, and harmonic modes.',
    ko: '단2도부터 옥타브까지 12개 음정을 단계적으로 해금. 상행, 하행, 동시 3패턴으로 출제.',
    pt: 'De 2ª menor a oitava — 12 intervalos desbloqueados progressivamente. Modos ascendente, descendente e harmônico.',
    es: 'De 2ª menor a octava — 12 intervalos desbloqueados progresivamente. Modos ascendente, descendente y armónico.',
  },
  feat2Title: { ja: '和音（コード）', en: 'Chords', ko: '화음', pt: 'Acordes', es: 'Acordes' },
  feat2Desc: {
    ja: 'メジャー/マイナーの基本からdim, aug, 7th, sus2/4まで12種類。分散和音と同時発音の両方で訓練。',
    en: 'From major/minor basics to dim, aug, 7th, sus2/4 — 12 chord types. Both arpeggiated and block chord listening.',
    ko: '장/단 기본부터 dim, aug, 7th, sus2/4까지 12종류. 분산화음과 동시발음 모두로 훈련.',
    pt: 'Do básico maior/menor a dim, aug, 7ª, sus2/4 — 12 tipos. Treinamento com arpejos e acordes blocos.',
    es: 'De mayor/menor a dim, aug, 7ª, sus2/4 — 12 tipos. Entrenamiento con arpegios y acordes bloques.',
  },
  feat3Title: { ja: '音階（スケール）', en: 'Scales', ko: '음계', pt: 'Escalas', es: 'Escalas' },
  feat3Desc: {
    ja: '長音階・短音階の基本から全音階、ディミニッシュスケール、ハンガリー短音階まで10種類を網羅。',
    en: '10 scale types from major/minor to whole-tone, diminished, and Hungarian minor.',
    ko: '장음계/단음계 기본부터 전음계, 감음계, 헝가리 단음계까지 10종류를 망라.',
    pt: '10 tipos de escalas: de maior/menor a tons inteiros, diminuta e menor húngara.',
    es: '10 tipos de escalas: de mayor/menor a tonos enteros, disminuida y menor húngara.',
  },
  feat4Title: { ja: '聴音書取（メロディ）', en: 'Melodic Dictation', ko: '청음 받아쓰기', pt: 'Ditado Melódico', es: 'Dictado Melódico' },
  feat4Desc: {
    ja: '短いメロディを聴いて音の並びを当てる、聴音書取の基礎訓練。レベルに応じて音数が増加。',
    en: 'Listen to short melodies and identify the notes — core dictation skill training. Notes increase with level.',
    ko: '짧은 멜로디를 듣고 음의 배열을 맞추는 청음 받아쓰기 기초 훈련. 레벨에 따라 음수 증가.',
    pt: 'Ouça melodias curtas e identifique as notas — treinamento fundamental de ditado. Notas aumentam com o nível.',
    es: 'Escucha melodías cortas e identifica las notas — entrenamiento fundamental de dictado.',
  },

  // Gamification
  gameTitle: {
    ja: '続けたくなる仕掛け',
    en: 'Designed to Keep You Practicing',
    ko: '계속하고 싶어지는 설계',
    pt: 'Projetado para Te Manter Praticando',
    es: 'Diseñado para Mantenerte Practicando',
  },
  gameLevel: { ja: 'レベルアップ制', en: 'Level-Up System', ko: '레벨업 시스템', pt: 'Sistema de Níveis', es: 'Sistema de Niveles' },
  gameLevelDesc: {
    ja: 'Lv.1からLv.99まで。正解するごとにXPを獲得。レベルが上がると新しい音程・和音・音階が解禁。',
    en: 'Lv.1 to Lv.99. Earn XP with every correct answer. New intervals, chords, and scales unlock as you level up.',
    ko: 'Lv.1부터 Lv.99까지. 정답마다 XP 획득. 레벨이 올라가면 새로운 음정, 화음, 음계가 해금.',
    pt: 'Nv.1 a Nv.99. Ganhe XP a cada acerto. Novos intervalos, acordes e escalas são desbloqueados ao subir de nível.',
    es: 'Nv.1 a Nv.99. Gana XP con cada acierto. Nuevos intervalos, acordes y escalas se desbloquean al subir de nivel.',
  },
  gameStreak: { ja: '連続日数ストリーク', en: 'Daily Streak', ko: '연속 일수 스트릭', pt: 'Sequência Diária', es: 'Racha Diaria' },
  gameStreakDesc: {
    ja: '毎日ログインするだけでストリークが継続。7日連続でアチーブメント解除。途切れたくない心理が習慣を作る。',
    en: 'Log in daily to keep your streak alive. 7-day streak unlocks an achievement. The fear of breaking your streak builds habits.',
    ko: '매일 로그인하면 스트릭이 유지됩니다. 7일 연속으로 업적 해제. 끊기기 싫은 심리가 습관을 만듭니다.',
    pt: 'Faça login diariamente para manter sua sequência. 7 dias seguidos desbloqueiam uma conquista.',
    es: 'Inicia sesión diariamente para mantener tu racha. 7 días seguidos desbloquean un logro.',
  },
  gameAch: { ja: 'アチーブメント', en: 'Achievements', ko: '업적', pt: 'Conquistas', es: 'Logros' },
  gameAchDesc: {
    ja: '8種類のバッジ。初めての正解、10連続正解、正答率90%、和音マスターなど。コンプリートを目指そう。',
    en: '8 badge types: first correct answer, 10 streak, 90% accuracy, chord master, and more. Aim for completion.',
    ko: '8종류의 배지. 첫 정답, 10연속 정답, 정답률 90%, 화음 마스터 등. 컴플리트를 목표로.',
    pt: '8 tipos de insígnias: primeiro acerto, 10 sequências, 90% precisão, mestre de acordes e mais.',
    es: '8 tipos de insignias: primer acierto, 10 racha, 90% precisión, maestro de acordes y más.',
  },

  // Who is this for
  whoTitle: {
    ja: 'こんな人におすすめ',
    en: 'Who Is This For?',
    ko: '이런 분에게 추천',
    pt: 'Para Quem É?',
    es: '¿Para Quién Es?',
  },
  who1: { ja: '🎓 音大・音楽高校の受験生', en: '🎓 Music school applicants', ko: '🎓 음대/음악고교 수험생', pt: '🎓 Candidatos ao vestibular de música', es: '🎓 Aspirantes a escuela de música' },
  who2: { ja: '🎺 吹奏楽部で合奏力を上げたい部員', en: '🎺 Brass band members improving ensemble skills', ko: '🎺 합주 실력을 올리고 싶은 취주악부원', pt: '🎺 Membros de banda melhorando habilidades de conjunto', es: '🎺 Miembros de banda mejorando habilidades de conjunto' },
  who3: { ja: '🎹 ピアノ・声楽・弦楽器の学習者', en: '🎹 Piano, voice, and string students', ko: '🎹 피아노/성악/현악기 학습자', pt: '🎹 Estudantes de piano, voz e cordas', es: '🎹 Estudiantes de piano, voz y cuerdas' },
  who4: { ja: '🌍 海外の音楽院を目指す留学準備生', en: '🌍 Students preparing for international conservatories', ko: '🌍 해외 음악원을 목표로 하는 유학 준비생', pt: '🌍 Estudantes se preparando para conservatórios internacionais', es: '🌍 Estudiantes preparándose para conservatorios internacionales' },

  // Comparison
  compTitle: {
    ja: '他のアプリとの違い',
    en: 'How We Compare',
    ko: '다른 앱과의 차이',
    pt: 'Como Nos Comparamos',
    es: 'Cómo Nos Comparamos',
  },

  // CTA
  ctaTitle: {
    ja: '今日から、耳を鍛えよう。',
    en: 'Start training your ears today.',
    ko: '오늘부터, 귀를 훈련하세요.',
    pt: 'Comece a treinar seus ouvidos hoje.',
    es: 'Comienza a entrenar tus oídos hoy.',
  },
  ctaSub: {
    ja: '登録不要・ブラウザだけで完結・完全無料',
    en: 'No signup required. Browser only. Completely free.',
    ko: '가입 불필요 · 브라우저만으로 · 완전 무료',
    pt: 'Sem cadastro. Apenas navegador. Totalmente grátis.',
    es: 'Sin registro. Solo navegador. Totalmente gratis.',
  },
  ctaButton: {
    ja: 'KUON EAR TRAINING を開く',
    en: 'Open KUON EAR TRAINING',
    ko: 'KUON EAR TRAINING 열기',
    pt: 'Abrir KUON EAR TRAINING',
    es: 'Abrir KUON EAR TRAINING',
  },
  ctaApps: {
    ja: '他のアプリも見る',
    en: 'Explore Other Apps',
    ko: '다른 앱도 보기',
    pt: 'Explorar Outros Apps',
    es: 'Explorar Otras Apps',
  },

  // Tech
  techTitle: {
    ja: 'テクノロジー',
    en: 'Technology',
    ko: '기술',
    pt: 'Tecnologia',
    es: 'Tecnología',
  },
  techDesc: {
    ja: 'Web Audio API で正確な音を生成。全ての処理はブラウザ内で完結。サーバーに音声データを送信しません。あなたの練習記録はあなたのブラウザにのみ保存されます。',
    en: 'Precise tone generation with Web Audio API. All processing happens in your browser. No audio data is sent to any server. Your practice data stays on your device.',
    ko: 'Web Audio API로 정확한 음을 생성. 모든 처리는 브라우저 내에서 완료. 서버에 오디오 데이터를 전송하지 않습니다. 연습 기록은 브라우저에만 저장됩니다.',
    pt: 'Geração precisa de tons com Web Audio API. Todo processamento no navegador. Nenhum dado é enviado a servidores.',
    es: 'Generación precisa de tonos con Web Audio API. Todo el procesamiento en el navegador. Ningún dato se envía a servidores.',
  },
};

// ─────────────────────────────────────────────
// Comparison data
// ─────────────────────────────────────────────
const compRows = [
  { label: { ja: '料金', en: 'Price', ko: '가격', pt: 'Preço', es: 'Precio' } as L5, kuon: { ja: '完全無料', en: 'Completely Free', ko: '완전 무료', pt: 'Grátis', es: 'Gratis' } as L5, others: { ja: '¥500〜¥3,000/月', en: '$5–$30/mo', ko: '₩5,000~₩30,000/월', pt: '$5–$30/mês', es: '$5–$30/mes' } as L5 },
  { label: { ja: '音程トレーニング', en: 'Interval Training', ko: '음정 훈련', pt: 'Treino de Intervalos', es: 'Entrenamiento de Intervalos' } as L5, kuon: '12', others: '8–12' },
  { label: { ja: '和音トレーニング', en: 'Chord Training', ko: '화음 훈련', pt: 'Treino de Acordes', es: 'Entrenamiento de Acordes' } as L5, kuon: '12', others: '4–8' },
  { label: { ja: '音階トレーニング', en: 'Scale Training', ko: '음계 훈련', pt: 'Treino de Escalas', es: 'Entrenamiento de Escalas' } as L5, kuon: '10', others: '3–6' },
  { label: { ja: '聴音書取', en: 'Melodic Dictation', ko: '청음 받아쓰기', pt: 'Ditado Melódico', es: 'Dictado Melódico' } as L5, kuon: '✓', others: '△' },
  { label: { ja: 'レベルアップ制', en: 'Level-Up System', ko: '레벨업 시스템', pt: 'Sistema de Níveis', es: 'Sistema de Niveles' } as L5, kuon: '✓ (Lv.99)', others: '✕' },
  { label: { ja: 'ストリーク/実績', en: 'Streaks & Achievements', ko: '스트릭/업적', pt: 'Sequências e Conquistas', es: 'Rachas y Logros' } as L5, kuon: '✓ (8種)', others: '△' },
  { label: { ja: '多言語対応', en: 'Multi-language', ko: '다국어 지원', pt: 'Multi-idioma', es: 'Multi-idioma' } as L5, kuon: { ja: '5言語', en: '5 languages', ko: '5개국어', pt: '5 idiomas', es: '5 idiomas' } as L5, others: { ja: '英語のみ', en: 'English only', ko: '영어만', pt: 'Apenas inglês', es: 'Solo inglés' } as L5 },
  { label: { ja: 'インストール', en: 'Installation', ko: '설치', pt: 'Instalação', es: 'Instalación' } as L5, kuon: { ja: '不要', en: 'None', ko: '불필요', pt: 'Nenhuma', es: 'Ninguna' } as L5, others: { ja: '必要', en: 'Required', ko: '필요', pt: 'Necessária', es: 'Necesaria' } as L5 },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function EarTrainingLPPage() {
  const { lang } = useLang();

  const t = (obj: L5) => obj[lang] ?? obj.en;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#1e293b',
      fontFamily: sans,
    }}>
      <style>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* ═══════ HERO ═══════ */}
      <section style={{
        minHeight: '85vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1a2a4a 50%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center',
        padding: 'clamp(60px, 12vw, 120px) clamp(16px, 4vw, 32px) clamp(40px, 8vw, 80px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Floating notes animation */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {['♩', '♪', '♫', '♬', '𝄞', '♭', '♯'].map((n, i) => (
            <span key={i} style={{
              position: 'absolute',
              fontSize: `${20 + i * 8}px`,
              color: `rgba(56, 189, 248, ${0.08 + i * 0.02})`,
              top: `${10 + i * 12}%`,
              left: `${5 + i * 13}%`,
              opacity: 0.3,
            }}>{n}</span>
          ))}
        </div>

        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.6rem, 5vw, 3.2rem)',
          fontWeight: 700,
          color: '#e2e8f0',
          lineHeight: 1.4,
          whiteSpace: 'pre-line',
          margin: '0 0 20px',
          position: 'relative',
        }}>
          {t(T.heroTitle)}
        </h1>
        <p style={{
          fontSize: 'clamp(0.85rem, 2.5vw, 1.15rem)',
          color: '#94a3b8',
          lineHeight: 1.7,
          maxWidth: 640,
          margin: '0 0 32px',
          position: 'relative',
        }}>
          {t(T.heroSub)}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
          <Link href="/ear-training" style={{
            padding: '14px 36px',
            borderRadius: 12,
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1rem',
          }}>
            {t(T.heroCta)}
          </Link>
          <a href="#features" style={{
            padding: '14px 28px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#e2e8f0',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}>
            {t(T.heroLearn)}
          </a>
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(32px, 8vw, 64px) clamp(16px, 4vw, 32px)' }}>
        {/* ═══════ PAIN POINTS ═══════ */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', textAlign: 'center', marginBottom: 32 }}>
            {t(T.painTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
            {[
              { title: T.pain1Title, desc: T.pain1Desc },
              { title: T.pain2Title, desc: T.pain2Desc },
              { title: T.pain3Title, desc: T.pain3Desc },
            ].map((p, i) => (
              <div key={i} style={glass}>
                <h3 style={{ fontFamily: serif, fontSize: '1rem', margin: '0 0 10px', color: '#0f172a' }}>{t(p.title)}</h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>{t(p.desc)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════ 4 FEATURES ═══════ */}
        <Section id="features">
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', textAlign: 'center', marginBottom: 32 }}>
            {t(T.featTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
            {[
              { icon: '↕️', title: T.feat1Title, desc: T.feat1Desc, color: ACCENT },
              { icon: '🎹', title: T.feat2Title, desc: T.feat2Desc, color: '#8b5cf6' },
              { icon: '🎼', title: T.feat3Title, desc: T.feat3Desc, color: GREEN },
              { icon: '🎵', title: T.feat4Title, desc: T.feat4Desc, color: GOLD },
            ].map((f, i) => (
              <div key={i} style={glass}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${f.color}15`, border: `2px solid ${f.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', marginBottom: 12,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: '0.95rem', margin: '0 0 8px', color: '#0f172a' }}>{t(f.title)}</h3>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{t(f.desc)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════ GAMIFICATION ═══════ */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', textAlign: 'center', marginBottom: 32 }}>
            {t(T.gameTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
            {[
              { icon: '⭐', title: T.gameLevel, desc: T.gameLevelDesc },
              { icon: '🔥', title: T.gameStreak, desc: T.gameStreakDesc },
              { icon: '🏅', title: T.gameAch, desc: T.gameAchDesc },
            ].map((g, i) => (
              <div key={i} style={glass}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{g.icon}</div>
                <h3 style={{ fontSize: '0.95rem', margin: '0 0 8px', color: '#0f172a' }}>{t(g.title)}</h3>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{t(g.desc)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════ WHO IS THIS FOR ═══════ */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', textAlign: 'center', marginBottom: 24 }}>
            {t(T.whoTitle)}
          </h2>
          <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[T.who1, T.who2, T.who3, T.who4].map((w, i) => (
              <div key={i} style={{
                ...glass,
                padding: '14px 20px',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}>
                {t(w)}
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════ COMPARISON TABLE ═══════ */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', textAlign: 'center', marginBottom: 24 }}>
            {t(T.compTitle)}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem',
              background: '#fff', borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}></th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: ACCENT2 }}>KUON</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8' }}>
                    {lang === 'ja' ? '他のアプリ' : lang === 'ko' ? '다른 앱' : 'Others'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {compRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: '#334155' }}>
                      {typeof row.label === 'string' ? row.label : t(row.label)}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: ACCENT }}>
                      {typeof row.kuon === 'string' ? row.kuon : t(row.kuon)}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', color: '#94a3b8' }}>
                      {typeof row.others === 'string' ? row.others : t(row.others)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ═══════ TECHNOLOGY ═══════ */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', textAlign: 'center', marginBottom: 16 }}>
            {t(T.techTitle)}
          </h2>
          <p style={{
            fontSize: '0.9rem', color: '#475569', lineHeight: 1.7,
            maxWidth: 640, margin: '0 auto', textAlign: 'center',
          }}>
            {t(T.techDesc)}
          </p>
        </Section>

        {/* ═══════ FINAL CTA ═══════ */}
        <Section>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1a2a4a 100%)',
            borderRadius: 20,
            padding: 'clamp(32px, 6vw, 56px)',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(1.3rem, 4vw, 2rem)',
              color: '#e2e8f0',
              marginBottom: 12,
            }}>
              {t(T.ctaTitle)}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: 28 }}>
              {t(T.ctaSub)}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/ear-training" style={{
                padding: '14px 36px',
                borderRadius: 12,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
              }}>
                {t(T.ctaButton)}
              </Link>
              <Link href="/audio-apps" style={{
                padding: '14px 28px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#e2e8f0',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}>
                {t(T.ctaApps)}
              </Link>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
