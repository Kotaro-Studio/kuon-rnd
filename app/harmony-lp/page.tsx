'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────

type L5 = Record<Lang, string>;

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const mono  = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#ec4899';
const ACCENT2 = '#be185d';
const ACCENT_LIGHT = '#fdf2f8';

// ─────────────────────────────────────────────
// Reveal Animation
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
  return <section ref={ref} className="reveal" id={id} style={{ marginBottom: 'clamp(56px,12vw,88px)', ...style }}>{children}</section>;
}

// ─────────────────────────────────────────────
// Shared Styles
// ─────────────────────────────────────────────

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.85)',
  borderRadius: 16,
  padding: 'clamp(20px,4vw,32px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
};

const centerText: React.CSSProperties = { textAlign: 'center' };

const sectionTitle: React.CSSProperties = {
  fontFamily: serif,
  fontSize: 'clamp(22px,4.5vw,34px)',
  lineHeight: 1.4,
  marginBottom: 10,
  letterSpacing: 0.5,
  textAlign: 'center',
};

const sectionSub: React.CSSProperties = {
  fontSize: 'clamp(13px,2.5vw,15px)',
  color: '#64748b',
  lineHeight: 1.8,
  textAlign: 'center',
  maxWidth: 640,
  margin: '0 auto 28px',
};

const badge = (color: string, bg: string): React.CSSProperties => ({
  display: 'inline-block',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 2.5,
  textTransform: 'uppercase',
  color,
  background: bg,
  padding: '4px 14px',
  borderRadius: 20,
  marginBottom: 14,
});

const ctaBtn: React.CSSProperties = {
  display: 'inline-block',
  background: ACCENT,
  color: '#fff',
  fontWeight: 700,
  padding: '16px 44px',
  borderRadius: 12,
  fontSize: 'clamp(14px,2.5vw,17px)',
  textDecoration: 'none',
  letterSpacing: 0.5,
  border: 'none',
  cursor: 'pointer',
};

const outlineBtn: React.CSSProperties = {
  display: 'inline-block',
  border: `1.5px solid ${ACCENT}`,
  color: ACCENT,
  fontWeight: 600,
  padding: '14px 32px',
  borderRadius: 12,
  fontSize: 'clamp(13px,2.5vw,15px)',
  textDecoration: 'none',
  letterSpacing: 0.3,
};

const dividerLine: React.CSSProperties = {
  width: 48,
  height: 1,
  background: '#e2e8f0',
  margin: '0 auto 28px',
};

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────

const T: Record<string, L5> = {
  heroTitle: {
    ja: '3時間かけた和声課題。\n提出して初めて赤ペンの山。',
    en: 'Three hours on your\nharmony homework.\nRed marks everywhere.',
    ko: '3시간 들인 화성 과제.\n제출 후 빨간 펜의 산.',
    pt: 'Três horas de harmonia.\nMarcado com caneta vermelha.',
    es: 'Tres horas de armonía.\nLleno de marcas rojas.',
  },
  heroSub: {
    ja: '— もし、提出前にチェックできたら？',
    en: '— What if you could check before submitting?',
    ko: '— 제출 전에 확인할 수 있다면?',
    pt: '— E se pudesse verificar antes?',
    es: '— ¿Y si pudiera verificar antes?',
  },
  heroDesc: {
    ja: '世界で唯一のブラウザ和声チェッカー。並達5度・並達8度・隠伏5度・声部交差・音域逸脱・限定進行・増2度など、10個以上の和声ルールをリアルタイムで検出。全調・全21進行に対応。提出前に全ての禁則を修正できます。',
    en: 'The world\'s only browser-based harmony checker. Detects parallel 5ths/8ths, hidden 5ths, voice crossing, range violations, resolution rules, augmented 2nds, and 10+ harmony rules in real-time. All keys and progressions supported. Fix every error before you submit.',
    ko: '세계 유일의 브라우저 화성 체커. 병행 5도·8도, 성부 교차, 음역 초과, 제한된 진행, 증2도 등 10개 이상의 화성 규칙을 실시간으로 검출.',
    pt: 'O único verificador de harmonia baseado em navegador do mundo. Detecta 5as paralelas, 8as, cruzamento de vozes, violações de amplitude, regras de resolução, 2as aumentadas e 10+ regras em tempo real.',
    es: 'El único verificador de armonía basado en navegador del mundo. Detecta 5as paralelas, 8as, cruzamiento de voces, violaciones de rango, reglas de resolución, 2as aumentadas y 10+ reglas en tiempo real.',
  },
  heroCta: { ja: 'KUON HARMONY を試す（無料）', en: 'Try KUON HARMONY — Free', ko: 'KUON HARMONY 시도 — 무료', pt: 'Tentar KUON HARMONY — Grátis', es: 'Intentar KUON HARMONY — Gratis' },
  heroMore: { ja: '機能を見る', en: 'See Features', ko: '기능 보기', pt: 'Ver Recursos', es: 'Ver Funciones' },

  // Stats bar
  statsFeature: { ja: 'ルール数', en: 'Rules', ko: '규칙 수', pt: 'Regras', es: 'Reglas' },
  statsKey: { ja: '調対応', en: 'Keys', ko: '조 대응', pt: 'Tonalidades', es: 'Tonalidades' },
  statsCost: { ja: '完全無料', en: 'Free Forever', ko: '완전 무료', pt: 'Grátis Sempre', es: 'Gratis Siempre' },

  // Pain points
  painTitle: { ja: 'なぜ和声課題は難しいのか', en: 'Why harmony homework is hard', ko: '화성 과제가 어려운 이유', pt: 'Por que a harmonia é difícil', es: 'Por qué la armonía es difícil' },
  pain1: { ja: '禁則を全て理解しても、自分の書いた課題で禁則を見つけられない', en: 'Even when you know the rules, you can\'t spot errors in your own work', ko: '금칙을 이해해도 자신의 과제에서 찾을 수 없음', pt: 'Mesmo conhecendo as regras, você não consegue encontrar erros', es: 'Incluso conociendo las reglas, no ve los errores' },
  pain2: { ja: '並達5度・並達8度は2つの声部を同時に追いながら判定する必要がある', en: 'Parallel 5ths/8ths require tracking 2 voice parts simultaneously', ko: '병행 5도·8도는 두 음성을 동시에 추적해야 함', pt: 'Quintas/oitavas paralelas requerem rastreamento simultâneo', es: 'Las quintas/octavas paralelas requieren seguimiento simultáneo' },
  pain3: { ja: '教科書では「並達5度はダメ」と書いてあるが、「修正方法」は載っていない', en: 'Textbooks say "no parallel 5ths" but don\'t explain how to fix it', ko: '교재는 「금칙」만 설명하고 수정 방법은 없음', pt: 'Livros dizem o erro, mas não como consertar', es: 'Los libros dicen el error, pero no cómo arreglarlo' },
  pain4: { ja: 'オンライン和声チェッカーが存在しない — Sibelius / Finale は高すぎる', en: 'No online checker exists — Sibelius/Finale are too expensive', ko: '온라인 체커 없음 — Sibelius/Finale은 너무 비쌈', pt: 'Não há verificador online — Sibelius/Finale são caros', es: 'No hay verificador online — Sibelius/Finale son caros' },
  pain5: { ja: '先生のコメント「並達」「声部交差」を読んでも、どこにあるのか分からない', en: 'You see "parallel" in teacher feedback but can\'t find where it is', ko: '선생님 피드백을 읽어도 어디 있는지 알 수 없음', pt: 'Vê comentários do professor mas não encontra o erro', es: 'Ve comentarios del profesor pero no encuentra el error' },

  // Core Benefits
  benefitTitle: { ja: '朝比奈幸太郎が全て監修した、本物の和声チェック', en: 'Real harmony checking, supervised by a professional', ko: '음악 전공자가 감수한 진정한 화성 체크', pt: 'Verificação real de harmonia, supervisionada por um profissional', es: 'Verificación real de armonía, supervisada por un profesional' },
  benefitDesc: {
    ja: 'KUON HARMONY は「ランダムなルール」ではなく、芸大和声・Piston・Aldwell & Schachter に基づいた正統な西洋古典和声を実装しています。朝比奈幸太郎（音響エンジニア兼作曲家・音大出身）が全ての検証ロジックを監修しました。\n\nあなたが見つけられなかった禁則を、KUON HARMONY は見つけます。修正後は「本当に合っているのか」を再度チェック。この往復により、禁則の「なぜ」が体に刻まれます。',
    en: 'KUON HARMONY isn\'t random rules — it\'s classical Western harmony based on Piston, Aldwell & Schachter, and Japanese conservatory standards. Supervised by Kotaro Asahina, an audio engineer and composer from a music university.\n\nIt finds what your eyes miss. After you fix errors, check again. This cycle embeds harmony rules into your body.',
    ko: 'KUON HARMONY는 임의의 규칙이 아니라 Piston, Aldwell & Schachter, 일본 보존 기준에 기반한 고전적 서양 화성입니다. 음대 출신 음향 엔지니어 아사히나 코타로가 감수했습니다.',
    pt: 'KUON HARMONY não é regras aleatórias — é harmonia clássica ocidental baseada em Piston, Aldwell & Schachter e padrões conservatório. Supervisionado por Kotaro Asahina, engenheiro de áudio e compositor.',
    es: 'KUON HARMONY no son reglas aleatorias — es armonía clásica occidental basada en Piston, Aldwell & Schachter y estándares conservatorio. Supervisado por Kotaro Asahina, ingeniero de audio y compositor.',
  },

  // Feature section headers
  coreTitle: { ja: 'コア機能 — 10個の和声ルール自動検出', en: 'Core — 10 Harmony Rules Automatically', ko: '코어 — 10가지 화성 규칙 자동 검출', pt: 'Core — 10 Regras de Harmonia Automaticamente', es: 'Core — 10 Reglas de Armonía Automáticamente' },

  // Core features
  f1t: { ja: '並達5度・並達8度', en: 'Parallel 5ths & 8ths', ko: '병행 5도·8도', pt: 'Quintas/Oitavas Paralelas', es: 'Quintas/Octavas Paralelas' },
  f1d: { ja: '2つの声部が同じ間隔で同方向に動いたら検出。古典和声の最重要禁則。', en: 'Two voices moving in the same direction at the same interval. Classical harmony\'s #1 rule.', ko: '두 성부가 같은 간격으로 같은 방향으로 움직임.', pt: 'Dois vozes na mesma direção no mesmo intervalo.', es: 'Dos voces en la misma dirección al mismo intervalo.' },
  f2t: { ja: '隠伏5度・隠伏8度', en: 'Hidden 5ths & 8ths', ko: '숨은 5도·8도', pt: '5as/8as Ocultas', es: '5as/8as Ocultas' },
  f2d: { ja: 'ソプラノとバスが跳躍で5度・8度に到達したら警告。教科書によって扱いが異なるため、トグルで有効/無効を切替可能。', en: 'When S & B leap to a 5th or 8th. Treatment varies by textbook — toggle on/off as needed.', ko: 'S와 B가 5도·8도로 도약할 때. 교재마다 다르므로 토글 가능.', pt: 'Quando S e B saltam para 5a ou 8a.', es: 'Cuando S y B saltan a 5a u 8a.' },
  f3t: { ja: '声部交差（Crossing）', en: 'Voice Crossing', ko: '성부 교차', pt: 'Cruzamento de Vozes', es: 'Cruzamiento de Voces' },
  f3d: { ja: 'テノール > アルト、アルト > ソプラノなど、音高関係が逆転したら検出。', en: 'Tenor above Alto, Alto above Soprano. Detects when voice order is reversed.', ko: '테너 > 알토, 알토 > 소프라노 등 순서 역전 감지.', pt: 'Tenor acima de Alto, Alto acima de Soprano.', es: 'Tenor arriba de Alto, Alto arriba de Soprano.' },
  f4t: { ja: '声部間隔チェック', en: 'Spacing Violations', ko: '성부 간격 체크', pt: 'Violações de Espaçamento', es: 'Violaciones de Espaciado' },
  f4d: { ja: 'SAT（高い3声部）の間隔が8度以上だったら警告。下声部の密集度が和音の響きを左右。', en: 'Warns if S-A-T spacing exceeds an octave. Tight spacing affects timbre.', ko: 'S-A-T 간격이 8도를 초과하면 경고.', pt: 'Aviso se S-A-T > uma oitava.', es: 'Aviso si S-A-T > una octava.' },
  f5t: { ja: '音域逸脱', en: 'Range Violations', ko: '음역 초과', pt: 'Violações de Amplitude', es: 'Violaciones de Rango' },
  f5d: { ja: 'ソプラノ（C4-C5）、アルト（G3-C5）、テノール（C3-G4）、バス（C2-C4）の標準音域を超えたら検出。', en: 'S(C4-C5), A(G3-C5), T(C3-G4), B(C2-C4). Detects when notes fall outside standard ranges.', ko: '표준 음역 초과 감지.', pt: 'Detecta notas fora dos intervalos padrão.', es: 'Detecta notas fuera de los rangos estándar.' },
  f6t: { ja: '限定進行（解決）チェック', en: 'Resolution Rules', ko: '제한된 진행 체크', pt: 'Regras de Resolução', es: 'Reglas de Resolución' },
  f6d: { ja: '導音は必ず主音に進行。V7の7度は必ず下行。これらの「解決義務」を検出。', en: 'Leading tone must resolve to tonic. 7th of V7 must resolve down. Detects violations.', ko: '도음은 반드시 주음으로 진행. V7의 7도는 반드시 하행.', pt: 'Nota sensível para tônica. 7ª de V7 para baixo.', es: 'Nota sensible a tónica. 7ª de V7 hacia abajo.' },
  f7t: { ja: '増2度', en: 'Augmented 2nds', ko: '증2도', pt: '2as Aumentadas', es: '2as Aumentadas' },
  f7d: { ja: 'A♭-B（増2度）が和音内で発生したら警告。不協和感の強さを避けるため。', en: 'Warns if A♭-B (aug 2) appears in a chord. Avoids harsh dissonance.', ko: 'A♭-B(증2도)가 화음 내 발생 시 경고.', pt: 'Aviso se aparece A♭-B em um acorde.', es: 'Aviso si aparece A♭-B en un acorde.' },
  f8t: { ja: '和音自動判定', en: 'Automatic Chord ID', ko: '화음 자동 판정', pt: 'Identificação Automática de Acordes', es: 'Identificación Automática de Acordes' },
  f8d: { ja: '入力した SATB から和音の種類を自動判定。根音の転回形かどうかも表示。', en: 'Auto-identifies chord type from SATB. Shows whether chord is in root position or inverted.', ko: '입력한 SATB에서 화음 종류 자동 판정.', pt: 'Identifica automaticamente o tipo de acorde.', es: 'Identifica automáticamente el tipo de acorde.' },
  f9t: { ja: 'ローマ数字分析', en: 'Roman Numeral Analysis', ko: '로마 숫자 분석', pt: 'Análise de Algarismos Romanos', es: 'Análisis de Números Romanos' },
  f9d: { ja: '検出した和音を I, IV, V, IV6など機能和声のローマ数字で表示。', en: 'Displays detected chords as I, IV, V, IV6, etc. Shows harmonic function.', ko: '검출한 화음을 I, IV, V, IV6 등으로 표시.', pt: 'Exibe acordes como I, IV, V, IV6, etc.', es: 'Muestra acordes como I, IV, V, IV6, etc.' },
  f10t: { ja: 'リアルタイムチェック', en: 'Real-Time Checking', ko: '실시간 체크', pt: 'Verificação em Tempo Real', es: 'Verificación en Tiempo Real' },
  f10d: { ja: 'SATB を入力する度に瞬座に全てのルールを再チェック。「赤ペンの後」ではなく、「書く前」に修正。', en: 'Every note you type is instantly checked. Fix errors before you submit.', ko: '입력할 때마다 즉시 모든 규칙 재확인.', pt: 'Cada nota é verificada instantaneamente.', es: 'Cada nota se verifica instantáneamente.' },

  // How it works
  howTitle: { ja: '使い方 — 3ステップ', en: 'How It Works — 3 Steps', ko: '사용법 — 3단계', pt: 'Como Funciona — 3 Passos', es: 'Cómo Funciona — 3 Pasos' },
  step1: { ja: '調を選択', en: 'Select Key', ko: '조 선택', pt: 'Selecione a Tonalidade', es: 'Seleccione Tonalidad' },
  step1d: { ja: 'C major から B minor まで全26調から選択。短調はナチュラル / ハーモニック / メロディックから選択可能。', en: 'Choose from all 26 major & minor keys. Minor keys: Natural / Harmonic / Melodic options.', ko: 'C장조부터 B단조까지 전 26조 중 선택.', pt: 'Escolha entre todas as 26 tonalidades.', es: 'Elige entre las 26 tonalidades.' },
  step2: { ja: 'SATB音名を入力', en: 'Enter SATB Notes', ko: 'SATB 음명 입력', pt: 'Digite Notas SATB', es: 'Ingrese Notas SATB' },
  step2d: { ja: '各小節の Soprano / Alto / Tenor / Bass の音を入力。C4, G3, E2 など絶対音高で指定。', en: 'Input each voice\'s notes (absolute pitch). C4, G3, E2, etc. Text or click interface.', ko: 'Soprano/Alto/Tenor/Bass 음 입력. C4, G3, E2 등 절대음 지정.', pt: 'Digite as notas de cada voz (altura absoluta).', es: 'Ingrese las notas de cada voz (altura absoluta).' },
  step3: { ja: 'リアルタイムでエラーを確認', en: 'Check Errors in Real-Time', ko: '실시간 오류 확인', pt: 'Verifique Erros em Tempo Real', es: 'Verifique Errores en Tiempo Real' },
  step3d: { ja: '並達5度、隠伏8度、声部交差などが赤色で即座に表示される。修正して提出。', en: 'Errors appear instantly in red. Parallel 5ths, crossing, range issues, etc. Fix and submit.', ko: '병행 5도, 숨은 8도, 성부 교차 등이 즉시 빨간색으로 표시.', pt: 'Erros aparecem instantaneamente em vermelho.', es: 'Los errores aparecen al instante en rojo.' },

  // Who
  whoTitle: { ja: 'こんな人に最適', en: 'Perfect For', ko: '이런 분에게 최적', pt: 'Perfeito Para', es: 'Perfecto Para' },
  who1: { ja: '音大の和声学科目を受講中の学生', en: 'Music university harmony class students', ko: '음대 화성학 수강 중인 학생', pt: 'Alunos de harmonia da universidade', es: 'Estudiantes de armonía de universidad' },
  who2: { ja: '音大受験生（共通テスト・二次対策）', en: 'Music exam candidates (entrance prep)', ko: '음대 입시 준비생', pt: 'Candidatos a exames de música', es: 'Candidatos a exámenes de música' },
  who3: { ja: '対位法の基礎を固めたい学習者', en: 'Learners building counterpoint foundations', ko: '대위법 기초를 다지는 학습자', pt: 'Aprendizes construindo contraponto', es: 'Alumnos de contrapunto' },
  who4: { ja: '作曲科 / 音楽理論科の学生', en: 'Composition and music theory majors', ko: '작곡과·음악이론과 학생', pt: 'Alunos de composição e teoria musical', es: 'Alumnos de composición y teoría' },
  who5: { ja: '独学で和声を学ぶ音楽愛好家', en: 'Self-taught music theory learners', ko: '독학으로 화성을 배우는 음악 애호가', pt: 'Aprendizes autodidatas de teoria musical', es: 'Aprendices autoeducativos de teoría' },
  who6: { ja: '吹奏楽のアレンジャー（声部進行の検証用）', en: 'Wind band arrangers (part writing validation)', ko: '관악악단 편곡가', pt: 'Arranjadores de banda de sopros', es: 'Arreglistas de banda de vientos' },

  // Precision
  precTitle: { ja: '正統派の和声理論に基づく', en: 'Based on Classical Harmony Theory', ko: '정통 화성 이론에 기반', pt: 'Baseado em Teoria da Harmonia Clássica', es: 'Basado en Teoría de Armonía Clásica' },
  precDesc: {
    ja: 'KUON HARMONY の検証アルゴリズムは以下の標準教科書に基づいています：\n• 島岡襄『和声 理論と実習』（音楽の友社）— 日本の音大で最も使われている教科書\n• Walter Piston『Harmony』（W.W. Norton）— 米国の標準教科書\n• Edward Aldwell & Carl Schachter『Harmony and Voice Leading』— 実践的かつ厳密\n\n各検査は複数教科書を相互参照し、矛盾のない判定を行っています。',
    en: 'KUON HARMONY\'s verification algorithms follow these standard textbooks:\n• Yo Shimaoka "Harmony: Theory and Practice" — Japan\'s conservatory standard\n• Walter Piston "Harmony" — American standard\n• Aldwell & Schachter "Harmony and Voice Leading" — Practical and rigorous\n\nEach check cross-references multiple textbooks for consistency.',
    ko: 'KUON HARMONY의 검증 알고리즘은 다음 표준 교과서에 기반합니다:\n• 시마오카 요(島岡襄) 『화성 이론과 실습』\n• Walter Piston 『Harmony』\n• Aldwell & Schachter 『Harmony and Voice Leading』',
    pt: 'Os algoritmos de verificação do KUON HARMONY seguem estes livros-padrão:\n• Yo Shimaoka "Harmony: Theory and Practice"\n• Walter Piston "Harmony"\n• Aldwell & Schachter "Harmony and Voice Leading"',
    es: 'Los algoritmos de verificación de KUON HARMONY siguen estos libros estándar:\n• Yo Shimaoka "Harmony: Theory and Practice"\n• Walter Piston "Harmony"\n• Aldwell & Schachter "Harmony and Voice Leading"',
  },

  // Free
  freeTitle: { ja: 'ブラウザ完結。完全無料。', en: 'Browser-based. Completely free.', ko: '브라우저 완결. 완전 무료.', pt: 'No navegador. Totalmente grátis.', es: 'En el navegador. Totalmente gratis.' },
  freeDesc: {
    ja: 'ダウンロード不要。登録不要。広告なし。スマートフォンでもタブレットでも。課題を保存して後で続ける機能はブラウザに自動保存。提出直前の最後のチェック、または日々の練習に — あなたのペースで使えます。',
    en: 'No download. No signup. No ads. Works on phone and tablet. Auto-saves your work in the browser. Final check before submission, or daily practice — at your pace.',
    ko: '다운로드 불필요. 등록 불필요. 광고 없음. 스마트폰, 태블릿 모두 지원. 자동 저장.',
    pt: 'Sem download. Sem cadastro. Sem anúncios. Funciona em telefone e tablet. Salva automaticamente no navegador.',
    es: 'Sin descarga. Sin registro. Sin anuncios. Funciona en teléfono y tablet. Se guarda automáticamente.',
  },

  // CTA
  ctaTitle: {
    ja: '禁則を「知る」のではなく、\n禁則を「見つける力」を持つために。',
    en: 'Not to "know" the rules,\nbut to "find" them in your work.',
    ko: '금칙을 「아는」 것이 아니라,\n「찾는 능력」을 기르기 위해.',
    pt: 'Não para "saber" as regras,\nmas para "encontrá-las".',
    es: 'No para "saber" las reglas,\nsino para "encontrarlas".',
  },
  ctaSub: {
    ja: '世界で唯一のブラウザ和声チェッカー。',
    en: 'The world\'s only browser-based harmony checker.',
    ko: '세계 유일의 브라우저 화성 체커.',
    pt: 'O único verificador de harmonia baseado em navegador do mundo.',
    es: 'El único verificador de armonía basado en navegador del mundo.',
  },
  ctaBtn: { ja: 'KUON HARMONY を使う（無料）', en: 'Use KUON HARMONY — Free', ko: 'KUON HARMONY 사용 — 무료', pt: 'Usar KUON HARMONY — Grátis', es: 'Usar KUON HARMONY — Gratis' },
  ctaApps: { ja: '全てのアプリを見る', en: 'See All Apps', ko: '모든 앱 보기', pt: 'Ver Todos os Apps', es: 'Ver Todas las Apps' },
};

const CORE_FEATURES = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10'];
const CORE_COLORS = ['#ec4899', '#be185d', '#be123c', '#db2777', '#d91e63', '#c2185b', '#ad1457', '#880e4f', '#6a0dad', '#7b1fa2'];
const CORE_ICONS = ['🔗', '👁️', '❌', '📏', '🎼', '🎯', '🔄', '🎵', '🔢', '⚡'];

const WHO_KEYS = ['who1', 'who2', 'who3', 'who4', 'who5', 'who6'];
const WHO_ICONS = ['🎓', '📝', '📚', '✍️', '🎵', '🎺'];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function HarmonyLPPage() {
  const { lang } = useLang();
  const t = (k: string) => T[k]?.[lang] ?? T[k]?.en ?? '';

  return (
    <main style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: sans, color: '#1e293b' }}>
      <style>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .reveal.visible { opacity: 1; transform: none; }
        .feat-card { transition: transform .2s, box-shadow .2s; }
        .feat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.06) !important; }
      `}</style>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(32px,7vw,64px) clamp(16px,4vw,32px)' }}>

        {/* ════════════ HERO ════════════ */}
        <Section>
          <div style={centerText}>
            <span style={badge('#be185d', ACCENT_LIGHT)}>Harmony Checker</span>
            <p style={{ fontFamily: serif, fontSize: 'clamp(11px,2vw,13px)', letterSpacing: 5, color: ACCENT, marginBottom: 16, textTransform: 'uppercase' }}>
              Kuon Harmony
            </p>
            <h1 style={{
              fontFamily: serif,
              fontSize: 'clamp(26px,5.5vw,44px)',
              lineHeight: 1.45,
              marginBottom: 20,
              whiteSpace: 'pre-line',
              letterSpacing: 0.5,
            }}>
              {t('heroTitle')}
            </h1>
            <p style={{ fontSize: 'clamp(15px,2.8vw,18px)', lineHeight: 1.7, color: '#475569', fontWeight: 500, marginBottom: 8 }}>
              {t('heroSub')}
            </p>
            <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', lineHeight: 1.8, color: '#64748b', marginBottom: 32, maxWidth: 680, margin: '0 auto 32px' }}>
              {t('heroDesc')}
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/harmony" style={ctaBtn}>
                {t('heroCta')}
              </Link>
              <a href="#features" style={outlineBtn}>
                {t('heroMore')}
              </a>
            </div>
          </div>
        </Section>

        {/* ════════════ STATS BAR ════════════ */}
        <Section>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(8px,2vw,16px)',
            textAlign: 'center',
          }}>
            {[
              { num: '10+', label: t('statsFeature') },
              { num: '26', label: t('statsKey') },
              { num: '¥0', label: t('statsCost') },
            ].map((s, i) => (
              <div key={i} style={{
                ...glass,
                padding: 'clamp(16px,3vw,28px) clamp(10px,2vw,16px)',
              }}>
                <div style={{ fontFamily: serif, fontSize: 'clamp(28px,6vw,40px)', fontWeight: 700, color: ACCENT, lineHeight: 1 }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 'clamp(11px,2vw,13px)', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════ PAIN POINTS ════════════ */}
        <Section>
          <div style={centerText}>
            <h2 style={sectionTitle}>{t('painTitle')}</h2>
          </div>
          <div style={dividerLine} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['pain1', 'pain2', 'pain3', 'pain4', 'pain5'].map((k, i) => (
              <div key={k} style={{
                ...glass,
                padding: '16px 22px',
                borderLeft: '3px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                <span style={{ fontSize: 18, color: '#ef4444', fontWeight: 700, fontFamily: mono, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', lineHeight: 1.7, color: '#475569' }}>
                  {t(k)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════ BENEFIT ════════════ */}
        <Section>
          <div style={centerText}>
            <h2 style={sectionTitle}>{t('benefitTitle')}</h2>
          </div>
          <div style={dividerLine} />
          <div style={{ ...glass, borderLeft: `3px solid ${ACCENT}` }}>
            <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 2, color: '#475569', whiteSpace: 'pre-line' }}>
              {t('benefitDesc')}
            </p>
          </div>
        </Section>

        {/* ════════════ CORE FEATURES (10) ════════════ */}
        <Section>
          <div id="features" style={centerText}>
            <span style={badge(ACCENT, ACCENT_LIGHT)}>Core</span>
            <h2 style={sectionTitle}>{t('coreTitle')}</h2>
          </div>
          <div style={dividerLine} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: 14,
          }}>
            {CORE_FEATURES.map((k, i) => (
              <div key={k} className="feat-card" style={{
                ...glass,
                borderTop: `3px solid ${CORE_COLORS[i]}`,
                padding: 'clamp(18px,3vw,26px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 20 }}>{CORE_ICONS[i]}</span>
                  <div>
                    <span style={{ fontFamily: mono, fontSize: 11, color: CORE_COLORS[i], fontWeight: 700 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 style={{ fontFamily: serif, fontSize: 'clamp(15px,2.8vw,19px)', lineHeight: 1.3, margin: 0 }}>
                      {t(`${k}t`)}
                    </h3>
                  </div>
                </div>
                <p style={{ fontSize: 'clamp(12px,2.2vw,14px)', lineHeight: 1.75, color: '#64748b', margin: 0 }}>
                  {t(`${k}d`)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════ HOW IT WORKS ════════════ */}
        <Section>
          <div style={centerText}>
            <h2 style={sectionTitle}>{t('howTitle')}</h2>
          </div>
          <div style={dividerLine} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { num: '01', key: 'step1', descKey: 'step1d', icon: '⚙️' },
              { num: '02', key: 'step2', descKey: 'step2d', icon: '🎵' },
              { num: '03', key: 'step3', descKey: 'step3d', icon: '✅' },
            ].map((s, i) => (
              <div key={s.key} className="feat-card" style={{
                ...glass,
                borderLeft: `4px solid ${ACCENT}`,
                padding: 'clamp(20px,4vw,30px)',
                background: 'rgba(253,242,248,0.5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div>
                    <span style={{ fontFamily: mono, fontSize: 11, color: ACCENT, fontWeight: 800, letterSpacing: 1 }}>
                      STEP {s.num}
                    </span>
                    <h3 style={{ fontFamily: serif, fontSize: 'clamp(17px,3vw,24px)', lineHeight: 1.3, margin: 0 }}>
                      {t(s.key)}
                    </h3>
                  </div>
                </div>
                <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', lineHeight: 1.85, color: '#64748b', margin: 0 }}>
                  {t(s.descKey)}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════ WHO ════════════ */}
        <Section>
          <div style={centerText}>
            <h2 style={sectionTitle}>{t('whoTitle')}</h2>
          </div>
          <div style={dividerLine} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: 12,
          }}>
            {WHO_KEYS.map((k, i) => (
              <div key={k} style={{
                ...glass,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{WHO_ICONS[i]}</span>
                <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', lineHeight: 1.6, margin: 0 }}>{t(k)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════ PRECISION ════════════ */}
        <Section>
          <div style={centerText}>
            <h2 style={sectionTitle}>{t('precTitle')}</h2>
          </div>
          <div style={dividerLine} />
          <div style={{
            ...glass,
            borderLeft: '3px solid #ec4899',
            display: 'flex',
            gap: 20,
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: ACCENT_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}>📖</div>
            <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', lineHeight: 1.9, color: '#475569', margin: 0, whiteSpace: 'pre-line' }}>
              {t('precDesc')}
            </p>
          </div>
        </Section>

        {/* ════════════ FREE ════════════ */}
        <Section>
          <div style={centerText}>
            <h2 style={sectionTitle}>{t('freeTitle')}</h2>
            <p style={{ ...sectionSub, marginBottom: 0 }}>{t('freeDesc')}</p>
          </div>
        </Section>

        {/* ════════════ FINAL CTA ════════════ */}
        <Section>
          <div style={{
            ...glass,
            textAlign: 'center',
            padding: 'clamp(36px,7vw,64px) clamp(20px,4vw,40px)',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: 24,
          }}>
            <span style={badge('#be185d', ACCENT_LIGHT)}>Harmony Checker</span>
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(22px,4.5vw,36px)',
              marginBottom: 12,
              lineHeight: 1.45,
              whiteSpace: 'pre-line',
              letterSpacing: 0.3,
            }}>
              {t('ctaTitle')}
            </h2>
            <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', color: '#64748b', marginBottom: 28, lineHeight: 1.7 }}>
              {t('ctaSub')}
            </p>
            <Link href="/harmony" style={{
              ...ctaBtn,
              padding: '18px 48px',
              fontSize: 'clamp(15px,2.8vw,18px)',
              borderRadius: 14,
              boxShadow: `0 4px 20px ${ACCENT}40`,
            }}>
              {t('ctaBtn')}
            </Link>
            <div style={{ marginTop: 20 }}>
              <Link href="/audio-apps" style={{
                color: '#64748b',
                fontWeight: 600,
                fontSize: 'clamp(12px,2.2vw,14px)',
                textDecoration: 'none',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: 2,
              }}>
                {t('ctaApps')} →
              </Link>
            </div>
          </div>
        </Section>

      </div>
    </main>
  );
}
