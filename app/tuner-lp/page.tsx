'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L5 = Record<Lang, string>;

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const mono  = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT  = '#0284c7';
const ACCENT2 = '#0ea5e9';

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
const T = {
  heroTitle: {
    ja: 'あなたの耳は、\nもっと正確なチューナーを求めている',
    en: 'Your ears deserve better\nthan a free tuner app',
    ko: '당신의 귀는 더 정확한\n튜너를 원하고 있습니다',
    pt: 'Seus ouvidos merecem um\nafinador mais preciso',
    es: 'Tus oídos merecen un\nafinador más preciso',
  } as L5,
  heroSub: {
    ja: 'YINアルゴリズムが実現する±1セント精度。音大の研究で使われるのと同じ技術。ブラウザで無料。',
    en: 'YIN algorithm — the same precision used in academic research. ±1 cent accuracy. Free in your browser.',
    ko: 'YIN 알고리즘 — 학술 연구에서 사용되는 정밀도. ±1 센트 정확도. 브라우저에서 무료.',
    pt: 'Algoritmo YIN — a mesma precisão usada em pesquisas acadêmicas. Precisão de ±1 centavo. Grátis no seu navegador.',
    es: 'Algoritmo YIN — la misma precisión usada en investigación académica. Precisión de ±1 centavo. Gratis en tu navegador.',
  } as L5,
  heroCta: {
    ja: '今すぐ使う（無料）',
    en: 'Start Tuning — Free',
    ko: '지금 시작하기 — 무료',
    pt: 'Começar — Grátis',
    es: 'Comenzar — Gratis',
  } as L5,
  heroLearn: {
    ja: '詳しく見る',
    en: 'Learn More',
    ko: '더 알아보기',
    pt: 'Saiba mais',
    es: 'Más información',
  } as L5,

  // Stats
  stat1: { ja: '±1¢', en: '±1¢', ko: '±1¢', pt: '±1¢', es: '±1¢' } as L5,
  stat1l: { ja: 'YIN精度', en: 'YIN Accuracy', ko: 'YIN 정확도', pt: 'Precisão YIN', es: 'Precisión YIN' } as L5,
  stat2: { ja: '移調対応', en: 'Transposition', ko: '조옮김', pt: 'Transposição', es: 'Transposición' } as L5,
  stat2l: { ja: 'Bb/Eb/F/A楽器', en: 'Bb/Eb/F/A instruments', ko: 'Bb/Eb/F/A 악기', pt: 'Instrumentos Bb/Eb/F/A', es: 'Instrumentos Bb/Eb/F/A' } as L5,
  stat3: { ja: 'データ蓄積', en: 'Progress Tracking', ko: '기록', pt: 'Progresso', es: 'Progreso' } as L5,
  stat3l: { ja: '成長が見える', en: 'See your growth', ko: '성장을 봅시다', pt: 'Veja seu progresso', es: 'Ve tu progreso' } as L5,

  // Pain points
  painTitle: {
    ja: 'こんな悔しさ、感じたことありますか？',
    en: 'Sound familiar?',
    ko: '이런 경험이 있으신가요?',
    pt: 'Soa familiar?',
    es: '¿Te suena familiar?',
  } as L5,
  pain1t: { ja: 'チューナーが嘘をついている', en: 'Your tuner is lying', ko: '튜너가 거짓말하고 있습니다', pt: 'Seu afinador está mentindo', es: 'Tu afinador está mintiendo' } as L5,
  pain1d: {
    ja: 'ほとんどのチューナーは単純なFFTを使用。低音やオーバートーンが豊かな楽器では不正確。',
    en: 'Most tuners use simple FFT algorithms. Inaccurate for low notes and overtone-rich instruments.',
    ko: '대부분의 튜너는 단순한 FFT 알고리즘을 사용합니다. 저음과 배음이 풍부한 악기에 부정확합니다.',
    pt: 'A maioria dos afinadores usa algoritmos FFT simples. Impreciso para notas graves e instrumentos com muitos harmônicos.',
    es: 'La mayoría de los afinadores usan algoritmos FFT simples. Inexacto para notas bajas e instrumentos ricos en armónicos.',
  } as L5,
  pain2t: { ja: '進捗が見えない', en: 'You can\'t see progress', ko: '진행 상황이 보이지 않습니다', pt: 'Você não pode ver o progresso', es: 'No puedes ver el progreso' } as L5,
  pain2d: {
    ja: 'レッスン中の正確性は分かりますが、週単位・月単位での上達が見えません。モチベーションが下がります。',
    en: 'Regular tuners don\'t save data. You never know if you\'re actually improving week-to-week or month-to-month.',
    ko: '일반 튜너는 데이터를 저장하지 않습니다. 실제로 주간 또는 월간 개선되고 있는지 절대 알 수 없습니다.',
    pt: 'Afinadores comuns não salvam dados. Você nunca sabe se está realmente melhorando semana após semana.',
    es: 'Los afinadores comunes no guardan datos. Nunca sabes si realmente estás mejorando semana a semana.',
  } as L5,
  pain3t: { ja: '楽器の名前を言わないといけない', en: 'No instrument transposition', ko: '악기 조옮김이 없습니다', pt: 'Sem transposição de instrumento', es: 'Sin transposición de instrumento' } as L5,
  pain3d: {
    ja: 'Bbクラリネット・Eb管は「実音で調弦してください」。学生には混乱。移調楽器対応が必須。',
    en: 'Bb clarinet players see wrong notes. Your F horn looks impossible to tune. No transposition kills productivity.',
    ko: 'Bb 클라리넷 연주자들은 잘못된 음표를 봅니다. F 호른 튜닝은 불가능해 보입니다.',
    pt: 'Clarinetistas em Bb veem notas erradas. Sua trompa F parece impossível de afinar.',
    es: 'Los clarinetistas en Bb ven notas incorrectas. Tu trompa en F parece imposible de afinar.',
  } as L5,

  // Solution
  solutionTitle: {
    ja: 'KUON TUNER PRO が、\nすべてを変えます。',
    en: 'KUON TUNER PRO\nsolves everything.',
    ko: 'KUON TUNER PRO는\n모든 것을 해결합니다.',
    pt: 'KUON TUNER PRO\nresolve tudo.',
    es: 'KUON TUNER PRO\nresuelve todo.',
  } as L5,
  solutionSub: {
    ja: 'YINアルゴリズムで±1セント精度。移調楽器に完全対応。毎回の練習データが蓄積され、成長が可視化されます。',
    en: 'YIN algorithm delivers ±1 cent accuracy. Full transposition support. Every practice session is tracked — watch your precision improve.',
    ko: 'YIN 알고리즘은 ±1 센트 정확도를 제공합니다. 완전한 조옮김 지원. 모든 연습 세션이 추적됩니다.',
    pt: 'O algoritmo YIN oferece precisão de ±1 centavo. Suporte de transposição completo. Cada sessão de prática é registrada.',
    es: 'El algoritmo YIN ofrece precisión de ±1 centavo. Soporte de transposición completo. Cada sesión de práctica se registra.',
  } as L5,

  // Features
  featTitle: { ja: '6つの強み', en: '6 Features', ko: '6가지 기능', pt: '6 Recursos', es: '6 Características' } as L5,
  feat1t: { ja: 'YIN精度', en: 'YIN Accuracy', ko: 'YIN 정확도', pt: 'Precisão YIN', es: 'Precisión YIN' } as L5,
  feat1d: {
    ja: '学術研究で使われるYINアルゴリズム採用。±1セント精度で、従来のFFTチューナーより圧倒的に正確。',
    en: 'Academic-grade YIN algorithm. ±1 cent accuracy — far superior to traditional FFT-based tuners.',
    ko: '학술 수준의 YIN 알고리즘. ±1 센트 정확도 — 기존 FFT 기반 튜너보다 훨씬 우수합니다.',
    pt: 'Algoritmo YIN de nível acadêmico. Precisão de ±1 centavo — muito superior aos afinadores tradicionais baseados em FFT.',
    es: 'Algoritmo YIN de grado académico. Precisión de ±1 centavo — muy superior a los afinadores tradicionales basados en FFT.',
  } as L5,
  feat2t: { ja: '移調楽器対応', en: 'Transposition', ko: '조옮김 대응', pt: 'Transposição', es: 'Transposición' } as L5,
  feat2d: {
    ja: 'Bb/Eb/F/A楽器の選択で、自動的に表示を移調。学生が「実音で調弦」と悩む必要がありません。',
    en: 'Select your instrument (Bb/Eb/F/A) and notes automatically display in concert pitch. No mental math needed.',
    ko: '악기(Bb/Eb/F/A)를 선택하고 음표가 자동으로 표시됩니다. 정신적 계산이 필요 없습니다.',
    pt: 'Selecione seu instrumento (Bb/Eb/F/A) e as notas são exibidas automaticamente em tom de concerto.',
    es: 'Selecciona tu instrumento (Bb/Eb/F/A) y las notas se muestran automáticamente en tono de concierto.',
  } as L5,
  feat3t: { ja: 'ストリーク機能', en: 'Streak System', ko: '스트릭 시스템', pt: 'Sistema de Sequência', es: 'Sistema de Racha' } as L5,
  feat3d: {
    ja: '練習を重ねるとストリークが増加。ゲーム感覚で習慣化。毎日の練習が楽しくなります。',
    en: 'Build streaks with daily practice. Gamification makes practicing fun. Don\'t break the chain.',
    ko: '매일 연습으로 스트릭을 구축합니다. 게임화가 연습을 재미있게 만듭니다.',
    pt: 'Construa sequências com prática diária. A gamificação torna a prática divertida. Não quebre a corrente.',
    es: 'Construye rachas con práctica diaria. La gamificación hace que practicar sea divertido. No rompas la cadena.',
  } as L5,
  feat4t: { ja: 'セッション統計', en: 'Session Stats', ko: '세션 통계', pt: 'Estatísticas de Sessão', es: 'Estadísticas de Sesión' } as L5,
  feat4d: {
    ja: '正確性の百分率、ピッチ偏差の推移をグラフで可視化。自分の上達を数字で見られます。',
    en: 'Accuracy %, average deviation, pitch stability graphs. See exactly where you\'re improving.',
    ko: '정확도 %, 평균 편차, 피치 안정성 그래프. 정확히 어디서 개선되고 있는지 확인하세요.',
    pt: 'Gráficos de %, desvio médio, estabilidade de afinação. Veja exatamente onde você está melhorando.',
    es: 'Gráficos de %, desviación promedio, estabilidad de afinación. Ve exactamente dónde estás mejorando.',
  } as L5,
  feat5t: { ja: '実績バッジ', en: 'Achievement Badges', ko: '업적 배지', pt: 'Insígnia de Realização', es: 'Insignias de Logros' } as L5,
  feat5d: {
    ja: '目標達成でバッジを獲得。「100日ストリーク」「精度95%到達」など。SNSでシェアできます。',
    en: 'Unlock 6 achievement badges. "100-Day Streak", "95% Accuracy Mastered", etc. Share on social media.',
    ko: '6개의 업적 배지를 잠금 해제하세요. "100일 스트릭", "95% 정확도 달성" 등.',
    pt: 'Desbloqueie 6 insígnia de realização. "Sequência de 100 dias", "95% de precisão alcançada", etc.',
    es: 'Desbloquea 6 insignias de logros. "Racha de 100 días", "Precisión del 95% alcanzada", etc.',
  } as L5,
  feat6t: { ja: '基準周波数調整', en: 'Reference Pitch Control', ko: '기준 음정 제어', pt: 'Controle de Afinação de Referência', es: 'Control de Afinación de Referencia' } as L5,
  feat6d: {
    ja: '415Hz（バロック）から466Hz（高めの現代）まで自由に設定。オーケストラの合奏周波数に完全対応。',
    en: 'Adjust from 415 Hz (Baroque) to 466 Hz (bright modern). Match your orchestra\'s pitch standard instantly.',
    ko: '415Hz(바로크)에서 466Hz(밝은 현대)로 조정합니다. 오케스트라의 음정에 즉시 맞춥니다.',
    pt: 'Ajuste de 415 Hz (Barroco) a 466 Hz (moderno brilhante). Combine instantaneamente com o padrão de afinação de sua orquestra.',
    es: 'Ajusta de 415 Hz (Barroco) a 466 Hz (moderno brillante). Coincide instantáneamente con el estándar de afinación de tu orquesta.',
  } as L5,

  // How it works
  howTitle: { ja: 'たった3ステップ', en: 'Just 3 Steps', ko: '3가지 단계', pt: 'Apenas 3 Passos', es: 'Solo 3 Pasos' } as L5,
  how1t: { ja: '楽器を選択', en: 'Select Instrument', ko: '악기 선택', pt: 'Selecione Instrumento', es: 'Selecciona Instrumento' } as L5,
  how1d: {
    ja: 'Bb/Eb/Fなど移調楽器を選択。コンサートピッチに自動変換されます。',
    en: 'Choose your instrument type. Transposition happens automatically.',
    ko: '악기 유형을 선택하세요. 조옮김이 자동으로 수행됩니다.',
    pt: 'Escolha o tipo de seu instrumento. A transposição ocorre automaticamente.',
    es: 'Elige el tipo de tu instrumento. La transposición ocurre automáticamente.',
  } as L5,
  how2t: { ja: 'マイクを許可', en: 'Allow Microphone', ko: '마이크 허용', pt: 'Permitir Microfone', es: 'Permitir Micrófono' } as L5,
  how2d: {
    ja: 'ブラウザのマイク許可ダイアログで「許可」をクリック。プライバシーはあなたのブラウザ内で守られます。',
    en: 'Click "Allow" when the browser asks for microphone access. All processing happens locally — your data never leaves your device.',
    ko: '브라우저가 마이크 액세스를 요청할 때 \"허용\"을 클릭하세요. 모든 처리는 로컬에서 발생합니다.',
    pt: 'Clique em \"Permitir\" quando o navegador solicitar acesso ao microfone. Todo processamento ocorre localmente.',
    es: 'Haz clic en \"Permitir\" cuando el navegador solicite acceso al micrófono. Todo el procesamiento ocurre localmente.',
  } as L5,
  how3t: { ja: '楽器を吹いて調弦', en: 'Play & Tune', ko: '재생 및 튜닝', pt: 'Toque e Afine', es: 'Toca y Afina' } as L5,
  how3d: {
    ja: 'ゲージにリアルタイムでピッチが表示されます。緑のゾーン（±2セント）に収まれば完璧な調弦。',
    en: 'See your pitch in real-time. Green zone = perfect tune. Your practice is automatically logged.',
    ko: '실시간 피치를 확인하세요. 녹색 영역 = 완벽한 튜닝. 연습은 자동으로 기록됩니다.',
    pt: 'Veja sua afinação em tempo real. Zona verde = afine perfeito. Sua prática é automaticamente registrada.',
    es: 'Ve tu afinación en tiempo real. Zona verde = afine perfecto. Tu práctica se registra automáticamente.',
  } as L5,

  // Who is this for
  whoTitle: { ja: 'こんな人のために作られました', en: 'Who Is This For?', ko: '이것은 누구를 위한 것입니까?', pt: 'Para Quem É Isso?', es: '¿Para Quién Es Esto?' } as L5,
  who1t: { ja: 'オーケストラ奏者', en: 'Orchestra Musicians', ko: '오케스트라 연주자', pt: 'Músicos de Orquestra', es: 'Músicos de Orquesta' } as L5,
  who1d: {
    ja: 'A=442Hz、完璧な音程が求められます。YIN精度なら安心。',
    en: 'A=442Hz, perfect intonation required. YIN accuracy ensures compliance.',
    ko: 'A=442Hz, 완벽한 음정이 필요합니다. YIN 정확도가 보장됩니다.',
    pt: 'A=442Hz, afinação perfeita obrigatória. Precisão YIN garante conformidade.',
    es: 'A=442Hz, afinación perfecta obligatoria. La precisión YIN garantiza el cumplimiento.',
  } as L5,
  who2t: { ja: '管楽器学生', en: 'Wind Musicians', ko: '목관악기 학생', pt: 'Estudantes de Instrumentos de Vento', es: 'Estudiantes de Instrumentos de Viento' } as L5,
  who2d: {
    ja: 'Bb/Eb移調が日常。「実音で調弦」という指導も分かりやすく。',
    en: 'Bb/Eb transposition is daily reality. Automatic display solves confusion.',
    ko: 'Bb/Eb 조옮김이 일상. 자동 표시가 혼동을 해결합니다.',
    pt: 'Transposição Bb/Eb é realidade diária. Exibição automática resolve confusão.',
    es: 'La transposición Bb/Eb es realidad diaria. La visualización automática resuelve la confusión.',
  } as L5,
  who3t: { ja: '弦楽器奏者', en: 'String Players', ko: '현악기 연주자', pt: 'Tocadores de Instrumento de Corda', es: 'Músicos de Cuerda' } as L5,
  who3d: {
    ja: '純正律の美しさを追求する方へ。5度のハーモニー精度をリアルタイムで確認。',
    en: 'Just intonation is essential. Detect pure intervals with ±1 cent precision.',
    ko: '순정 음정은 필수입니다. ±1 센트 정확도로 순음정을 감지하세요.',
    pt: 'Entonação justa é essencial. Detecte intervalos puros com precisão de ±1 centavo.',
    es: 'La entonación justa es esencial. Detecta intervalos puros con precisión de ±1 centavo.',
  } as L5,
  who4t: { ja: '音大受験生', en: 'Music Exam Candidates', ko: '음악대학 수험생', pt: 'Candidatos a Exames de Música', es: 'Candidatos a Examen de Música' } as L5,
  who4d: {
    ja: '受験期間の音程練習を数値化。1ヶ月、3ヶ月での上達を可視化。自信を持って試験へ。',
    en: 'Track intonation improvement month-to-month. Build confidence before auditions.',
    ko: '월별 음정 개선을 추적합니다. 청음 전에 자신감을 구축하세요.',
    pt: 'Rastreie a melhoria de afinação mês a mês. Construa confiança antes das audições.',
    es: 'Rastrear la mejora de afinación mes a mes. Construye confianza antes de las audiciones.',
  } as L5,

  // Comparison
  compTitle: { ja: '無料チューナーとの違い', en: 'vs. Free Tuners', ko: '무료 튜너와의 차이', pt: 'vs. Afinadores Gratuitos', es: 'vs. Afinadores Gratuitos' } as L5,
  compFeat: { ja: '機能', en: 'Feature', ko: '기능', pt: 'Recurso', es: 'Característica' } as L5,
  compOther: { ja: '一般的な無料アプリ', en: 'Free Tuner Apps', ko: '일반 무료 앱', pt: 'Aplicativos Gratuitos', es: 'Aplicaciones Gratuitas' } as L5,
  compKuon: { ja: 'KUON TUNER PRO', en: 'KUON TUNER PRO', ko: 'KUON튜너 PRO', pt: 'KUON TUNER PRO', es: 'KUON TUNER PRO' } as L5,
  compAcc: { ja: '精度', en: 'Accuracy', ko: '정확도', pt: 'Precisão', es: 'Precisión' } as L5,
  compAccOther: { ja: '±3セント程度（FFT）', en: '±3 cents (FFT)', ko: '±3 센트(FFT)', pt: '±3 centavos (FFT)', es: '±3 centavos (FFT)' } as L5,
  compAccKuon: { ja: '±1セント（YIN）', en: '±1 cent (YIN)', ko: '±1 센트(YIN)', pt: '±1 centavo (YIN)', es: '±1 centavo (YIN)' } as L5,
  compTrans: { ja: '移調対応', en: 'Transposition', ko: '조옮김', pt: 'Transposição', es: 'Transposición' } as L5,
  compTransOther: { ja: 'なし（実音で調弦）', en: 'None (concert pitch only)', ko: '없음(콘서트 피치만)', pt: 'Nenhum (apenas tom de concerto)', es: 'Ninguno (solo tono de concierto)' } as L5,
  compTransKuon: { ja: 'Bb/Eb/F/A対応', en: 'Bb/Eb/F/A supported', ko: 'Bb/Eb/F/A 지원', pt: 'Suportado Bb/Eb/F/A', es: 'Compatibilidad Bb/Eb/F/A' } as L5,
  compData: { ja: 'データ記録', en: 'Data Tracking', ko: '데이터 추적', pt: 'Rastreamento de Dados', es: 'Rastreo de Datos' } as L5,
  compDataOther: { ja: 'なし', en: 'None', ko: '없음', pt: 'Nenhum', es: 'Ninguno' } as L5,
  compDataKuon: { ja: '全セッション蓄積', en: 'All sessions saved', ko: '모든 세션 저장', pt: 'Todas as sessões salvas', es: 'Todas las sesiones guardadas' } as L5,
  compBadge: { ja: '成就感', en: 'Motivation', ko: '성취감', pt: 'Motivação', es: 'Motivación' } as L5,
  compBadgeOther: { ja: 'なし', en: 'None', ko: '없음', pt: 'Nenhum', es: 'Ninguno' } as L5,
  compBadgeKuon: { ja: 'バッジ・ストリーク', en: 'Badges, streaks', ko: '배지, 스트릭', pt: 'Insígnia, sequência', es: 'Insígnia, racha' } as L5,
  compCost: { ja: 'コスト', en: 'Cost', ko: '비용', pt: 'Custo', es: 'Costo' } as L5,
  compCostOther: { ja: '¥0（広告あり）', en: '¥0 (with ads)', ko: '¥0(광고 포함)', pt: '¥0 (com anúncios)', es: '¥0 (con anuncios)' } as L5,
  compCostKuon: { ja: '¥0（広告なし）', en: '¥0 (ad-free)', ko: '¥0(광고 없음)', pt: '¥0 (sem anúncios)', es: '¥0 (sin publicidad)' } as L5,

  // Social proof
  proofTitle: { ja: '音大生の実例', en: 'Real Stories', ko: '실제 사례', pt: 'Histórias Reais', es: 'Historias Reales' } as L5,
  proof1t: { ja: 'クラリネット奏者', en: 'Clarinet Student', ko: '클라리넷 학생', pt: 'Estudante de Clarinete', es: 'Estudiante de Clarinete' } as L5,
  proof1d: {
    ja: 'Bb楽器の実音表示に悩んでいたが、移調機能で「自分が吹くべき音」がすぐに分かるようになった。',
    en: 'Finally understands why Bb clarinet sees different notes. Transposition solves 3 years of confusion.',
    ko: 'Bb 클라리넷이 다른 음표를 보는 이유를 마침내 이해합니다.',
    pt: 'Finalmente entende por que o clarinete Bb vê notas diferentes.',
    es: 'Finalmente entiende por qué el clarinete Bb ve notas diferentes.',
  } as L5,
  proof2t: { ja: 'ヴァイオリン奏者', en: 'Violin Student', ko: '바이올린 학생', pt: 'Estudante de Violino', es: 'Estudiante de Violín' } as L5,
  proof2d: {
    ja: '3週間で音程精度が60%から92%に向上。実数で上達が見えるので練習のモチベーションが全然違う。',
    en: 'In 3 weeks, intonation accuracy improved from 60% to 92%. Data visualization makes progress undeniable.',
    ko: '3주 안에 음정 정확도가 60%에서 92%로 향상되었습니다.',
    pt: 'Em 3 semanas, a precisão da afinação melhorou de 60% para 92%.',
    es: 'En 3 semanas, la precisión de la afinación mejoró del 60% al 92%.',
  } as L5,
  proof3t: { ja: 'フルート奏者', en: 'Flute Student', ko: '플루트 학생', pt: 'Estudante de Flauta', es: 'Estudiante de Flauta' } as L5,
  proof3d: {
    ja: 'ストリーク機能で毎日練習する習慣が身についた。100日達成してバッジをSNSで共有。友人も始めた。',
    en: 'The streak system turned daily practice into a habit. Sharing the 100-day badge motivated friends to start too.',
    ko: '스트릭 시스템이 매일 연습을 습관으로 바꾸었습니다.',
    pt: 'O sistema de sequência transformou a prática diária em um hábito.',
    es: 'El sistema de racha transformó la práctica diaria en un hábito.',
  } as L5,

  // Tech section
  techTitle: { ja: 'テクノロジー', en: 'Technology', ko: '기술', pt: 'Tecnologia', es: 'Tecnología' } as L5,
  techAlgo: { ja: 'アルゴリズム', en: 'Algorithm', ko: '알고리즘', pt: 'Algoritmo', es: 'Algoritmo' } as L5,
  techAlgoV: { ja: 'YIN（Aubio）', en: 'YIN (Aubio)', ko: 'YIN(Aubio)', pt: 'YIN (Aubio)', es: 'YIN (Aubio)' } as L5,
  techProc: { ja: 'ローカル処理', en: 'Local Processing', ko: '로컬 처리', pt: 'Processamento Local', es: 'Procesamiento Local' } as L5,
  techProcV: { ja: 'Web Audio API + Wasm', en: 'Web Audio API + Wasm', ko: 'Web Audio API + Wasm', pt: 'Web Audio API + Wasm', es: 'Web Audio API + Wasm' } as L5,
  techStorage: { ja: 'データ保存', en: 'Data Storage', ko: '데이터 저장', pt: 'Armazenamento de Dados', es: 'Almacenamiento de Datos' } as L5,
  techStorageV: { ja: 'ブラウザ IndexedDB', en: 'Browser IndexedDB', ko: '브라우저 IndexedDB', pt: 'Navegador IndexedDB', es: 'Navegador IndexedDB' } as L5,
  techPrivacy: { ja: 'プライバシー', en: 'Privacy', ko: '개인정보', pt: 'Privacidade', es: 'Privacidad' } as L5,
  techPrivacyV: { ja: 'あなたのデータは絶対に外に出ません', en: 'Your data never leaves your device', ko: '데이터는 절대 장치를 떠나지 않습니다', pt: 'Seus dados nunca saem do seu dispositivo', es: 'Tus datos nunca salen de tu dispositivo' } as L5,

  // Final CTA
  ctaTitle: {
    ja: '正確なチューニングで、\n上達を加速させよう。\n今すぐ、無料で。',
    en: 'Accelerate your progress.\nStart tuning with precision.\nFree, right now.',
    ko: '진도를 가속화하세요.\n정확한 튜닝으로 시작하세요.\n지금 무료입니다.',
    pt: 'Acelere seu progresso.\nComece a afinar com precisão.\nGrátis, agora mesmo.',
    es: 'Acelera tu progreso.\nComienza a afinar con precisión.\nGratis, ahora mismo.',
  } as L5,
  ctaMain: { ja: '使い始める（無料）', en: 'Start Now — Free', ko: '지금 시작하기 — 무료', pt: 'Comece Agora — Grátis', es: 'Comienza Ahora — Gratis' } as L5,
  ctaSub: { ja: 'アカウント登録不要。ブラウザだけで使える。', en: 'No signup needed. Works in your browser.', ko: '가입 필요 없음. 브라우저에서 작동합니다.', pt: 'Sem inscrição necessária. Funciona no seu navegador.', es: 'Sin inscripción necesaria. Funciona en tu navegador.' } as L5,
};

// ─────────────────────────────────────────────
// Gauge SVG Mockup
// ─────────────────────────────────────────────
function GaugeMockup() {
  return (
    <svg viewBox="0 0 240 180" style={{ width: '100%', maxWidth: 300, height: 'auto', margin: '32px auto' }}>
      {/* Gauge arc background */}
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="25%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="75%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="120" cy="100" r="95" fill="none" stroke="#e5e7eb" strokeWidth="12" />
      {/* Colored arc */}
      <circle cx="120" cy="100" r="90" fill="none" stroke="url(#gaugeGradient)" strokeWidth="8" opacity="0.7" />
      {/* Center dot */}
      <circle cx="120" cy="100" r="8" fill="#0284c7" />
      {/* Needle (animated) */}
      <g style={{ transformOrigin: '120px 100px', animation: 'spinNeedle 3s ease-in-out infinite' }}>
        <line x1="120" y1="100" x2="120" y2="20" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* Labels */}
      <text x="30" y="110" fontSize="12" fill="#666" textAnchor="middle">-20¢</text>
      <text x="210" y="110" fontSize="12" fill="#666" textAnchor="middle">+20¢</text>
      <text x="120" y="30" fontSize="14" fill="#0284c7" fontWeight="700" textAnchor="middle">A 442.0 Hz</text>
      <style>{`
        @keyframes spinNeedle {
          0% { transform: rotate(-60deg); }
          50% { transform: rotate(0deg); }
          100% { transform: rotate(-60deg); }
        }
      `}</style>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function TunerLpPage() {
  const { lang } = useLang();
  const t = (obj: L5) => obj[lang];

  return (
    <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1a2a4a 50%, #0f172a 100%)', color: '#e5e7eb', minHeight: '100vh' }}>
      <style>{`
        .reveal { opacity: 0; transform: translateY(32px); transition: opacity .7s ease, transform .7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .float-note { animation: floatNote 6s ease-in-out infinite; }
        @keyframes floatNote {
          0%, 100% { opacity: 0.3; transform: translateY(0) rotate(-15deg); }
          50% { opacity: 0.8; transform: translateY(-20px) rotate(0deg); }
        }
      `}</style>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(48px, 10vw, 100px) clamp(16px, 4vw, 40px)',
        background: 'radial-gradient(circle at top, rgba(2,132,199,0.15), transparent)',
        position: 'relative',
      }}>
        {/* Floating notes decoration */}
        {['🎵', '♪', '♫'].map((note, i) => (
          <div key={i} style={{
            position: 'absolute',
            fontSize: '2rem',
            opacity: 0.3,
            left: `${20 + i * 40}%`,
            top: `${10 + i * 20}%`,
            animation: `floatNote ${4 + i}s ease-in-out infinite`,
          }}>
            {note}
          </div>
        ))}

        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.8rem, 6vw, 3.2rem)',
          fontWeight: 300,
          lineHeight: 1.35,
          letterSpacing: '0.04em',
          whiteSpace: 'pre-line',
          marginBottom: 'clamp(16px, 3vw, 28px)',
          color: '#fff',
          maxWidth: 700,
        }}>
          {t(T.heroTitle)}
        </h1>
        <p style={{
          fontFamily: sans,
          fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)',
          lineHeight: 1.85,
          color: '#cbd5e1',
          maxWidth: 600,
          whiteSpace: 'pre-line',
          marginBottom: 'clamp(24px, 5vw, 40px)',
        }}>
          {t(T.heroSub)}
        </p>

        {/* Gauge mockup */}
        <GaugeMockup />

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'clamp(32px, 6vw, 56px)' }}>
          <Link href="/tuner" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 36px', borderRadius: 10,
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
            color: '#fff', fontFamily: sans, fontWeight: 600,
            fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
            textDecoration: 'none', boxShadow: `0 4px 16px ${ACCENT}44`,
          }}>
            {t(T.heroCta)}
          </Link>
          <a href="#features" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '14px 28px', borderRadius: 10,
            background: 'rgba(255,255,255,0.08)', color: '#cbd5e1',
            fontFamily: sans, fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
            textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {t(T.heroLearn)} &#x2193;
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 'clamp(16px, 4vw, 40px)',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {[
            { v: t(T.stat1), l: t(T.stat1l) },
            { v: t(T.stat2), l: t(T.stat2l) },
            { v: t(T.stat3), l: t(T.stat3l) },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontFamily: mono, fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: ACCENT2 }}>{s.v}</div>
              <div style={{ fontFamily: sans, fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>

        {/* ── Pain Points ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)', color: '#fff' }}>
            {t(T.painTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
            {[
              { t: T.pain1t, d: T.pain1d, icon: '😕' },
              { t: T.pain2t, d: T.pain2d, icon: '📈' },
              { t: T.pain3t, d: T.pain3d, icon: '🎼' },
            ].map((p, i) => (
              <div key={i} style={{
                ...glass,
                background: 'rgba(30,41,59,0.8)',
                border: '1px solid rgba(148,163,184,0.2)',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12,
              }}>
                <span style={{ fontSize: '1.8rem' }}>{p.icon}</span>
                <h3 style={{ fontFamily: sans, fontSize: '0.95rem', fontWeight: 600, color: '#f87171', margin: 0 }}>
                  {t(p.t)}
                </h3>
                <p style={{ fontFamily: sans, fontSize: '0.85rem', lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>
                  {t(p.d)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Solution ── */}
        <Section style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.3rem, 4.5vw, 2.2rem)',
            fontWeight: 300,
            whiteSpace: 'pre-line',
            lineHeight: 1.4,
            marginBottom: 12,
            color: '#fff',
          }}>
            {t(T.solutionTitle)}
          </h2>
          <p style={{ fontFamily: sans, fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {t(T.solutionSub)}
          </p>
        </Section>

        {/* ── Features ── */}
        <Section id="features">
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)', color: '#fff' }}>
            {t(T.featTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 16 }}>
            {[
              { t: T.feat1t, d: T.feat1d, icon: '⚡' },
              { t: T.feat2t, d: T.feat2d, icon: '🎺' },
              { t: T.feat3t, d: T.feat3d, icon: '🔥' },
              { t: T.feat4t, d: T.feat4d, icon: '📊' },
              { t: T.feat5t, d: T.feat5d, icon: '🏆' },
              { t: T.feat6t, d: T.feat6d, icon: '🎼' },
            ].map((f, i) => (
              <div key={i} style={{
                ...glass,
                background: 'rgba(30,41,59,0.8)',
                border: '1px solid rgba(148,163,184,0.2)',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{f.icon}</div>
                <h3 style={{ fontFamily: sans, fontSize: '0.95rem', fontWeight: 600, color: ACCENT2, marginBottom: 6, margin: 0 }}>
                  {t(f.t)}
                </h3>
                <p style={{ fontFamily: sans, fontSize: '0.85rem', lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>
                  {t(f.d)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── How it works ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)', color: '#fff' }}>
            {t(T.howTitle)}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { n: '01', t: T.how1t, d: T.how1d },
              { n: '02', t: T.how2t, d: T.how2d },
              { n: '03', t: T.how3t, d: T.how3d },
            ].map((step) => (
              <div key={step.n} style={{
                ...glass,
                background: 'rgba(30,41,59,0.8)',
                border: '1px solid rgba(148,163,184,0.2)',
                display: 'flex', alignItems: 'flex-start', gap: 16,
              }}>
                <div style={{
                  fontFamily: mono,
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: ACCENT,
                  opacity: 0.6,
                  flexShrink: 0,
                  lineHeight: 1,
                  marginTop: 2,
                }}>
                  {step.n}
                </div>
                <div>
                  <h3 style={{ fontFamily: sans, fontSize: '0.95rem', fontWeight: 600, marginBottom: 4, color: '#fff', margin: 0 }}>
                    {t(step.t)}
                  </h3>
                  <p style={{ fontFamily: sans, fontSize: '0.85rem', lineHeight: 1.7, color: '#cbd5e1', margin: 0 }}>
                    {t(step.d)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Who is this for ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)', color: '#fff' }}>
            {t(T.whoTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 16 }}>
            {[
              { t: T.who1t, d: T.who1d, icon: '🎻' },
              { t: T.who2t, d: T.who2d, icon: '🎺' },
              { t: T.who3t, d: T.who3d, icon: '🎻' },
              { t: T.who4t, d: T.who4d, icon: '🎓' },
            ].map((w, i) => (
              <div key={i} style={{
                ...glass,
                background: 'rgba(30,41,59,0.8)',
                border: '1px solid rgba(148,163,184,0.2)',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ fontSize: '2rem' }}>{w.icon}</div>
                <h3 style={{ fontFamily: sans, fontSize: '0.95rem', fontWeight: 600, color: ACCENT2, marginBottom: 4, margin: 0 }}>
                  {t(w.t)}
                </h3>
                <p style={{ fontFamily: sans, fontSize: '0.85rem', lineHeight: 1.6, color: '#cbd5e1', margin: 0 }}>
                  {t(w.d)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Comparison Table ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)', color: '#fff' }}>
            {t(T.compTitle)}
          </h2>
          <div style={{
            ...glass,
            background: 'rgba(30,41,59,0.8)',
            border: '1px solid rgba(148,163,184,0.2)',
            overflow: 'auto',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: sans }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.2)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>{t(T.compFeat)}</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>{t(T.compOther)}</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: ACCENT2, fontWeight: 600 }}>{t(T.compKuon)}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feat: T.compAcc, other: T.compAccOther, kuon: T.compAccKuon },
                  { feat: T.compTrans, other: T.compTransOther, kuon: T.compTransKuon },
                  { feat: T.compData, other: T.compDataOther, kuon: T.compDataKuon },
                  { feat: T.compBadge, other: T.compBadgeOther, kuon: T.compBadgeKuon },
                  { feat: T.compCost, other: T.compCostOther, kuon: T.compCostKuon },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 4 ? '1px solid rgba(148,163,184,0.1)' : 'none' }}>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#cbd5e1' }}>{t(row.feat)}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>{t(row.other)}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: ACCENT2, fontWeight: 600 }}>✓ {t(row.kuon)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Social Proof ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)', color: '#fff' }}>
            {t(T.proofTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
            {[
              { t: T.proof1t, d: T.proof1d, icon: '🎷' },
              { t: T.proof2t, d: T.proof2d, icon: '🎻' },
              { t: T.proof3t, d: T.proof3d, icon: '🎵' },
            ].map((proof, i) => (
              <div key={i} style={{
                ...glass,
                background: 'rgba(30,41,59,0.8)',
                border: '1px solid rgba(148,163,184,0.2)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{proof.icon}</div>
                <h3 style={{ fontFamily: sans, fontSize: '0.95rem', fontWeight: 600, color: ACCENT2, marginBottom: 6, margin: 0 }}>
                  {t(proof.t)}
                </h3>
                <p style={{ fontFamily: sans, fontSize: '0.85rem', lineHeight: 1.7, color: '#cbd5e1', margin: 0, fontStyle: 'italic' }}>
                  "{t(proof.d)}"
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Technology ── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 300, textAlign: 'center', marginBottom: 'clamp(20px, 4vw, 36px)', color: '#fff' }}>
            {t(T.techTitle)}
          </h2>
          <div style={{
            ...glass,
            background: 'rgba(30,41,59,0.8)',
            border: '1px solid rgba(148,163,184,0.2)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
            gap: 16,
          }}>
            {[
              { l: T.techAlgo, v: T.techAlgoV },
              { l: T.techProc, v: T.techProcV },
              { l: T.techStorage, v: T.techStorageV },
              { l: T.techPrivacy, v: T.techPrivacyV },
            ].map((row, i) => (
              <div key={i} style={{ textAlign: 'center', paddingBottom: i < 3 ? '16px' : 0 }}>
                <div style={{ fontFamily: sans, fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>{t(row.l)}</div>
                <div style={{ fontFamily: mono, fontSize: '0.85rem', color: ACCENT2, fontWeight: 500 }}>{t(row.v)}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Final CTA ── */}
        <Section style={{ textAlign: 'center', paddingBottom: 'clamp(40px, 8vw, 80px)' }}>
          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.3rem, 4.5vw, 2.2rem)',
            fontWeight: 300,
            whiteSpace: 'pre-line',
            lineHeight: 1.4,
            marginBottom: 'clamp(16px, 3vw, 28px)',
            color: '#fff',
          }}>
            {t(T.ctaTitle)}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Link href="/tuner" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '16px 44px', borderRadius: 12,
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
              color: '#fff', fontFamily: sans, fontWeight: 600,
              fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
              textDecoration: 'none', boxShadow: `0 6px 24px ${ACCENT}44`,
            }}>
              {t(T.ctaMain)}
            </Link>
            <p style={{ fontFamily: sans, fontSize: '0.85rem', color: '#94a3b8' }}>
              {t(T.ctaSub)}
            </p>
          </div>
        </Section>

        {/* Footer attribution */}
        <div style={{ textAlign: 'center', padding: '0 0 40px', color: '#475569', fontFamily: sans, fontSize: '0.75rem' }}>
          KUON TUNER PRO — by{' '}
          <Link href="/" style={{ color: '#64748b', textDecoration: 'underline' }}>空音開発 Kuon R&D</Link>
        </div>
      </div>
    </div>
  );
}
