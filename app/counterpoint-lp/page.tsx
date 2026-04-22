'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────

type L5 = Partial<Record<Lang, string>> & { en: string };

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const mono  = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#0891b2';
const ACCENT2 = '#0e7490';
const CP_LIGHT = '#ecfeff';

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
    ja: '対位法の禁則、\nもう見落とさない。',
    en: 'Never miss a counterpoint\nrule violation again.',
    ko: '대위법의 금칙을\n더 이상 놓치지 않기.',
    pt: 'Nunca mais perder uma\nviolação de contraponto.',
    es: 'Nunca más pasar por alto\nuna violación de contrapunto.',
  },
  heroSub: {
    ja: '— 種別対位法をリアルタイムチェック',
    en: '— Real-time species counterpoint checking',
    ko: '— 유별 대위법 실시간 체크',
    pt: '— Verificação de contraponto por espécies em tempo real',
    es: '— Verificación de contrapunto por especies en tiempo real',
  },
  heroDesc: {
    ja: '世界初のブラウザ対位法チェッカー。Fuxの方法に基づき、第1〜第4類の対位法におけるすべての禁則（並達5度・8度、隠伏5度・8度、声部交差、定旋律との音程禁止など）を自動検出。作曲家・音楽理論家が監修。提出前に全て修正できます。',
    en: 'The world\'s first browser-based counterpoint checker. Based on Fux\'s method, it automatically detects all counterpoint rule violations in 1st–4th species (parallel 5ths/8ths, hidden 5ths/8ths, voice crossing, forbidden intervals with cantus firmus, suspension rules, and more). Supervised by a professional composer. Fix every error before you submit.',
    ko: '세계 최초의 브라우저 대위법 체커. Fux의 방법에 기반한 제1〜제4류 대위법의 모든 금칙을 자동 검출. 병행 5도·8도, 숨은 5도·8도, 성부 교차, 정선율과의 음정 금지 등.',
    pt: 'O primeiro verificador de contrapunto baseado em navegador do mundo. Baseado no método de Fux, detecta automaticamente todas as violações de regras de contraponto nas 4 espécies (5as/8as paralelas, 5as/8as ocultas, cruzamento de vozes, intervalos proibidos com cantus firmus, etc.).',
    es: 'El primer verificador de contrapunto basado en navegador del mundo. Basado en el método de Fux, detecta automáticamente todas las violaciones de reglas de contrapunto en las 4 especies (5as/8as paralelas, 5as/8as ocultas, cruzamiento de voces, intervalos prohibidos con cantus firmus, etc.).',
  },
  heroCta: { ja: 'KUON COUNTERPOINT を試す（無料）', en: 'Try KUON COUNTERPOINT — Free', ko: 'KUON COUNTERPOINT 시도 — 무료', pt: 'Tentar KUON COUNTERPOINT — Grátis', es: 'Intentar KUON COUNTERPOINT — Gratis' },
  heroMore: { ja: '機能を見る', en: 'See Features', ko: '기능 보기', pt: 'Ver Recursos', es: 'Ver Funciones' },

  // Stats bar
  statsSpecies: { ja: '類別', en: 'Species', ko: '류별', pt: 'Espécies', es: 'Especies' },
  statsRules: { ja: 'ルール数', en: 'Rules', ko: '규칙 수', pt: 'Regras', es: 'Reglas' },
  statsCost: { ja: '完全無料', en: 'Free Forever', ko: '완전 무료', pt: 'Grátis Sempre', es: 'Gratis Siempre' },

  // Pain points
  painTitle: { ja: 'なぜ対位法の課題は難しいのか', en: 'Why counterpoint homework is hard', ko: '대위법 과제가 어려운 이유', pt: 'Por que o contraponto é difícil', es: 'Por qué el contrapunto es difícil' },
  pain1: { ja: '並達5度・8度は定旋律とカウンターの両方を同時に見ながら判定しないといけない', en: 'Parallel 5ths/8ths require tracking both cantus firmus and countermelody simultaneously', ko: '병행 5도·8도는 정선율과 대선율을 동시에 추적해야 함', pt: 'Quintas/oitavas paralelas requerem rastreamento simultâneo de dois vozes', es: 'Las quintas/octavas paralelas requieren seguimiento simultáneo de dos voces' },
  pain2: { ja: '不協和音（掛留・経過音など）の扱い方が類別によって異なり、どの規則を適用すべきか分からない', en: 'Dissonance rules (suspensions, passing tones) vary by species—difficult to know which applies', ko: '불협화음(정지음, 경과음)의 취급이 류별마다 다름', pt: 'Regras de dissonância (suspensões, notas de passagem) variam por espécie', es: 'Las reglas de disonancia (suspensiones, notas de paso) varían según la especie' },
  pain3: { ja: '隠伏5度・8度は教科書によって「禁止」「許可」の判断が割れる', en: 'Hidden 5ths/8ths—textbooks disagree on when they\'re allowed or forbidden', ko: '숨은 5도·8도는 금지/허용 판단이 교재마다 다름', pt: 'Quintas/oitavas ocultas — desacordo entre livros sobre permissão', es: '5as/8as ocultas — desacuerdo entre libros sobre si están permitidas' },
  pain4: { ja: 'オンライン対位法チェッカーが存在しない — Sibelius / Finale は高すぎる', en: 'No online counterpoint checker exists — Sibelius/Finale are too expensive', ko: '온라인 대위법 체커 없음 — Sibelius/Finale은 너무 비쌈', pt: 'Não há verificador online — Sibelius/Finale são caros', es: 'No hay verificador online — Sibelius/Finale son caros' },
  pain5: { ja: '先生のコメント「並達」「掛留の解決」を読んでも、どこにあるのか、どう修正するのか分からない', en: 'Teacher feedback like "parallel" or "improper suspension" is hard to locate and fix', ko: '선생님 피드백을 읽어도 어디 있는지, 어떻게 수정할지 알 수 없음', pt: 'Comentários do professor são difíceis de localizar e corrigir', es: 'Los comentarios del profesor son difíciles de localizar y corregir' },

  // Benefit
  benefitTitle: { ja: 'Fuxの正統派対位法に基づく、本物のチェック', en: 'Real counterpoint checking based on Fux\'s method', ko: 'Fux의 정통파 대위법에 기반한 진정한 체크', pt: 'Verificação real baseada no método de Fux', es: 'Verificación real basada en el método de Fux' },
  benefitDesc: {
    ja: 'KUON COUNTERPOINT は「ランダムなルール」ではなく、Johann Joseph Fuxの『Gradus ad Parnassum』に基づいた厳密な種別対位法を実装しています。作曲家・音楽理論家が全ての検証ロジックを監修しました。\n\n第1類（1:1）から第4類（掛留）まで、あなたが見つけられなかった禁則をリアルタイムで検出します。修正後は「本当に合っているのか」を再度チェック。この往復により、対位法の「なぜ」が体に刻まれます。',
    en: 'KUON COUNTERPOINT isn\'t random rules — it\'s rigorous species counterpoint based on Johann Joseph Fux\'s "Gradus ad Parnassum" (Steps to Parnassus). Supervised by professional composers and music theorists.\n\nFrom 1st species (1:1) through 4th species (syncopation), it detects what your eye misses. After you fix errors, check again. This cycle embeds counterpoint rules into your thinking.',
    ko: 'KUON COUNTERPOINT는 임의의 규칙이 아니라 Johann Joseph Fux의 『Gradus ad Parnassum』에 기반한 엄격한 종별 대위법입니다. 작곡가·음악 이론가가 감수했습니다.',
    pt: 'KUON COUNTERPOINT não é regras aleatórias — é contraponto por espécies rigoroso baseado em "Gradus ad Parnassum" de Johann Joseph Fux. Supervisionado por compositores profissionais.',
    es: 'KUON COUNTERPOINT no son reglas aleatorias — es contrapunto rigoroso por especies basado en "Gradus ad Parnassum" de Johann Joseph Fux. Supervisado por compositores profesionales.',
  },

  // Feature section headers
  coreTitle: { ja: 'コア機能 — 15個の対位法ルール自動検出', en: 'Core — 15+ Counterpoint Rules Automatically', ko: '코어 — 15개 이상의 대위법 규칙 자동 검출', pt: 'Core — 15+ Regras de Contraponto Automaticamente', es: 'Core — 15+ Reglas de Contrapunto Automáticamente' },

  // Core features
  f1t: { ja: '協和音程・不協和音程の自動分類', en: 'Consonance/Dissonance Classification', ko: '협화음정·불협화음정 자동 분류', pt: 'Classificação Automática de Consonância/Dissonância', es: 'Clasificación Automática de Consonancia/Disonancia' },
  f1d: { ja: '定旋律とカウンターポイントの各音程を分析。3度・6度（협화）vs 2度・4度・7度（不協和）を自動判定。', en: 'Analyzes each interval between cantus and countermelody. Identifies 3rds/6ths (consonant) vs 2nds/4ths/7ths (dissonant).', ko: '정선율과 대선율 각 음정 분석. 3도·6도(협화)와 2도·4도·7도(불협화) 자동 판정.', pt: 'Analisa cada intervalo. Identifica 3as/6as (consonante) vs 2as/4as/7as (dissonante).', es: 'Analiza cada intervalo. Identifica 3as/6as (consonante) vs 2as/4as/7as (disonante).' },
  f2t: { ja: '並達5度・並達8度の検出', en: 'Parallel 5ths & 8ths Detection', ko: '병행 5도·8도 검출', pt: 'Detecção de Quintas/Oitavas Paralelas', es: 'Detección de Quintas/Octavas Paralelas' },
  f2d: { ja: '定旋律とカウンターが同じ方向に動いて5度・8度に到達したら検出。対位法の最重要禁則。', en: 'Detects when cantus & countermelody move in the same direction to a 5th or 8th. The #1 rule.', ko: '정선율과 대선율이 같은 방향으로 5도·8도에 도달하면 검출.', pt: 'Detecta quando cantus e contraponto movem-se na mesma direção para 5ª ou 8ª.', es: 'Detecta cuando el cantus y el contrapunto se mueven en la misma dirección a 5ª u 8ª.' },
  f3t: { ja: '隠伏5度・隠伏8度の警告', en: 'Hidden 5ths & 8ths Warning', ko: '숨은 5도·8도 경고', pt: 'Alerta de 5as/8as Ocultas', es: 'Alerta de 5as/8as Ocultas' },
  f3d: { ja: 'カウンターが跳躍で5度・8度に到達したら警告（トグルで有効/無効を切替可能）。教科書によって扱いが異なるため。', en: 'Warns when countermelody leaps to 5th/8th. Toggle on/off per your textbook\'s rules.', ko: '대선율이 도약으로 5도·8도에 도달하면 경고(토글 가능).', pt: 'Aviso quando a contraponto salta para 5ª/8ª.', es: 'Alerta cuando la contrapunto salta a 5ª/8ª.' },
  f4t: { ja: '声部交差（Crossing）の検出', en: 'Voice Crossing Detection', ko: '성부 교차 검출', pt: 'Detecção de Cruzamento de Vozes', es: 'Detección de Cruzamiento de Voces' },
  f4d: { ja: 'カウンターの音がこれまでの最低音より低くなったら検出。声部の秩序を保つために重要。', en: 'Detects when countermelody falls below its lowest previous note. Maintains voice integrity.', ko: '대선율의 음이 이전 최저음보다 낮아지면 검출.', pt: 'Detecta quando a contraponto fica abaixo de sua nota mais baixa anterior.', es: 'Detecta cuando la contraponto cae por debajo de su nota más baja anterior.' },
  f5t: { ja: '定旋律との禁止音程', en: 'Forbidden Intervals with Cantus', ko: '정선율과의 금지음정', pt: 'Intervalos Proibidos com Cantus', es: 'Intervalos Prohibidos con Cantus' },
  f5d: { ja: '定旋律とカウンターが組めない音程（完全4度など）を検出。種別によって異なる。', en: 'Detects intervals forbidden with cantus firmus (perfect 4th, etc.). Varies by species.', ko: '정선율과 조화할 수 없는 음정(완전 4도 등) 검출.', pt: 'Detecta intervalos proibidos com cantus firmus.', es: 'Detecta intervalos prohibidos con cantus firmus.' },
  f6t: { ja: '掛留音（Suspension）の検証', en: 'Suspension Treatment Rules', ko: '정지음(Suspension) 검증', pt: 'Regras de Suspensão', es: 'Reglas de Suspensión' },
  f6d: { ja: '掛留は「準備→停止→解決」の3段階を厳密に確認。特に第4類では必須。解決に向かう義務を検出。', en: 'Verifies suspensions follow "preparation → suspension → resolution". Detects improper resolutions.', ko: '정지음은 「준비→정지→해결」의 3단계 엄격히 확인.', pt: 'Verifica se as suspensões seguem preparação → suspensão → resolução.', es: 'Verifica que las suspensiones sigan preparación → suspensión → resolución.' },
  f7t: { ja: '경과음（Passing Tone）・近音（Neighbor Tone）の位置', en: 'Passing Tone & Neighbor Tone Position', ko: '경과음·근음의 위치', pt: 'Posição de Notas de Passagem', es: 'Posición de Notas de Paso' },
  f7d: { ja: '不協和音（2度・7度）は強拍に来ない、弱拍のみ。経過音が斜行（oblique）で準備されているか確認。', en: 'Dissonant tones (2nds/7ths) must fall on weak beats only. Checks proper preparation.', ko: '불협화음(2도·7도)은 약박에만. 경과음이 斜行으로 준비되는지 확인.', pt: 'Tons dissonantes devem estar em tempos fracos apenas.', es: 'Los tonos disonantes deben estar solo en tiempos débiles.' },
  f8t: { ja: '音域チェック（Cantus Firmus）', en: 'Range Check (Cantus Firmus)', ko: '음역 체크(정선율)', pt: 'Verificação de Intervalo (Cantus)', es: 'Verificación de Rango (Cantus)' },
  f8d: { ja: '定旋律の音域が標準範囲（通常は5〜6度）を超えたら警告。カウンターも適切な音域で動いているか確認。', en: 'Warns if cantus firmus exceeds standard range. Checks countermelody stays in proper register.', ko: '정선율의 음역이 표준 범위를 초과하면 경고.', pt: 'Alerta se o cantus firmus exceder o intervalo padrão.', es: 'Alerta si el cantus firmus excede el rango estándar.' },
  f9t: { ja: '進行分類（Motion Type）', en: 'Motion Type Analysis', ko: '진행 분류(Motion Type)', pt: 'Análise de Tipo de Movimento', es: 'Análisis de Tipo de Movimiento' },
  f9d: { ja: '直進行（Similar）/ 逆進行（Contrary）/ 斜進行（Oblique）を自動判定。対位法の基本。', en: 'Auto-identifies similar, contrary, and oblique motion. Fundamental to counterpoint aesthetics.', ko: '직진행(Similar)·역진행(Contrary)·斜진行(Oblique) 자동 판정.', pt: 'Identifica automaticamente movimento similar, contrário e oblíquo.', es: 'Identifica automáticamente movimiento similar, contrario y oblicuo.' },
  f10t: { ja: '旋律的飛躍の制限', en: 'Melodic Leap Restrictions', ko: '선율적 도약 제한', pt: 'Restrições de Salto Melódico', es: 'Restricciones de Salto Melódico' },
  f10d: { ja: '一度に大きく飛び上がる進行（7度以上など）を警告。対位法では旋律は段階的に。', en: 'Warns of large leaps (7ths+) in melody. Counterpoint favors stepwise motion.', ko: '한 번에 큰 도약(7도 이상)을 경고.', pt: 'Aviso de grandes saltos em melodia.', es: 'Aviso de grandes saltos en la melodía.' },
  f11t: { ja: '連続3度・6度の制限（Fauxbourdon回避）', en: 'Consecutive 3rds/6ths Limit', ko: '연속 3도·6도 제한', pt: 'Limite de 3as/6as Consecutivas', es: 'Límite de 3as/6as Consecutivas' },
  f11d: { ja: '同じ音程が続く「平行進行」を検出。特に3度・6度が多く続く場合は警告。', en: 'Detects excessive parallel 3rds/6ths (fauxbourdon effect). Warns against monotony.', ko: '같은 음정이 계속되는 「평행 진행」을 검출.', pt: 'Detecta 3as/6as paralelas excessivas.', es: 'Detecta 3as/6as paralelas excesivas.' },
  f12t: { ja: 'リアルタイム検証', en: 'Real-Time Verification', ko: '실시간 검증', pt: 'Verificação em Tempo Real', es: 'Verificación en Tiempo Real' },
  f12d: { ja: 'メロディーを入力する度に、瞬座に全てのルールを再チェック。提出前に全て修正できます。', en: 'Every note you add is instantly verified against all rules. Fix before you submit.', ko: '입력할 때마다 즉시 모든 규칙 재확인.', pt: 'Cada nota é verificada instantaneamente.', es: 'Cada nota se verifica instantáneamente.' },
  f13t: { ja: '種別（Species）自動判定', en: 'Auto Species Detection', ko: '류별 자동 판정', pt: 'Detecção Automática de Espécie', es: 'Detección Automática de Especie' },
  f13d: { ja: 'カウンターのリズムパターンから第1〜第4類を自動判定。適切なルール群を適用。', en: 'Analyzes countermelody rhythm to auto-identify 1st-4th species. Applies correct ruleset.', ko: '대선율의 리듬 패턴에서 제1〜제4류 자동 판정.', pt: 'Analisa ritmo para identificar automaticamente a espécie.', es: 'Analiza el ritmo para identificar automáticamente la especie.' },
  f14t: { ja: '跳躍後の返行（Leapfrog）規則', en: 'Leap-Resolution Rules', ko: '도약 후 반행 규칙', pt: 'Regras de Resolução de Salto', es: 'Reglas de Resolución de Salto' },
  f14d: { ja: '大きな跳躍後は、反対方向に1度または2度進むべき。これを自動確認。', en: 'After a large leap, motion should return in opposite direction (1-2 steps). Checks automatically.', ko: '큰 도약 후 반대 방향으로 1〜2도 진행해야 함.', pt: 'Após um grande salto, o movimento deve retornar.', es: 'Después de un gran salto, el movimiento debe retornar.' },
  f15t: { ja: 'エラー理由の詳細表示', en: 'Detailed Error Messages', ko: '에러 이유의 상세 표시', pt: 'Mensagens de Erro Detalhadas', es: 'Mensajes de Error Detallados' },
  f15d: { ja: '「並達5度：小節3でSoprano-Bassが直進行」など、具体的にどこでどのルールに触れたかを表示。', en: 'Shows exactly where & why—"Parallel 5ths in m.3: S-B similar motion to G-D". Fix with clarity.', ko: '「병행 5도: 3소절에서 Soprano-Bass가 직진행」등 구체적으로 표시.', pt: 'Mostra exatamente onde e por quê.', es: 'Muestra exactamente dónde y por qué.' },
};

const CORE_FEATURES = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12', 'f13', 'f14', 'f15'];
const CORE_COLORS = ['#0891b2', '#0e7490', '#06b6d4', '#14b8a6', '#10b981', '#059669', '#0d9488', '#087e8b', '#006978', '#003d5b', '#0891b2', '#0e7490', '#06b6d4', '#14b8a6', '#10b981'];
const CORE_ICONS = ['🎼', '🔗', '👁️', '❌', '🚫', '⏸️', '🎵', '📏', '🔄', '📈', '3️⃣', '⚡', '🎯', '🔀', '💬'];

const SPECIES = [
  {
    num: '1',
    ja: '第1類（1:1）',
    en: '1st Species (1:1)',
    ko: '제1류(1:1)',
    pt: '1ª Espécie (1:1)',
    es: '1ª Especie (1:1)',
    ja_desc: '定旋律1音に対してカウンター1音。協和音のみ使用。最も基本的。',
    en_desc: 'One note against one note. Consonances only. The foundation.',
    ko_desc: '정선율 1음에 대해 대선율 1음. 협화음만 사용.',
    pt_desc: 'Uma nota contra uma nota. Apenas consonâncias.',
    es_desc: 'Una nota contra una nota. Solo consonancias.',
  },
  {
    num: '2',
    ja: '第2類（2:1）',
    en: '2nd Species (2:1)',
    ko: '제2류(2:1)',
    pt: '2ª Espécie (2:1)',
    es: '2ª Especie (2:1)',
    ja_desc: '定旋律1音に対してカウンター2音。経過音の導入。',
    en_desc: 'Two notes against one. Passing tones on weak beats introduced.',
    ko_desc: '정선율 1음에 대해 대선율 2음. 경과음 도입.',
    pt_desc: 'Duas notas contra uma. Notas de passagem em tempos fracos.',
    es_desc: 'Dos notas contra una. Notas de paso en tiempos débiles.',
  },
  {
    num: '3',
    ja: '第3類（4:1）',
    en: '3rd Species (4:1)',
    ko: '제3류(4:1)',
    pt: '3ª Espécie (4:1)',
    es: '3ª Especie (4:1)',
    ja_desc: '定旋律1音に対してカウンター4音。経過音・近音・カンビアータを複合的に使用。',
    en_desc: 'Four notes against one. Passing tones, neighbor tones, and cambiata combined.',
    ko_desc: '정선율 1음에 대해 대선율 4음. 경과음·근음·카미아타 복합 사용.',
    pt_desc: 'Quatro notas contra uma. Combinação de notas de passagem, vizinhas e cambiata.',
    es_desc: 'Cuatro notas contra una. Combinación de notas de paso, vecinas y cambiata.',
  },
  {
    num: '4',
    ja: '第4類（掛留）',
    en: '4th Species (Syncopation)',
    ko: '제4류(정지음)',
    pt: '4ª Espécie (Sincopa)',
    es: '4ª Especie (Síncopa)',
    ja_desc: '前小節の音が後ろにずれて掛留が発生。不協和音の厳密な解決を学ぶ。',
    en_desc: 'Syncopation creates suspensions. Strict dissonance resolution required.',
    ko_desc: '전 소절의 음이 뒤로 밀려 정지음 발생. 불협화음 엄격 해결.',
    pt_desc: 'Síncopa cria suspensões. Resolução estrita de dissonância.',
    es_desc: 'La síncopa crea suspensiones. Resolución estricta de disonancia.',
  },
];

const WHO_KEYS = [
  { key: 'who1', ja: '音大の対位法課題を受講中の学生', en: 'Music university counterpoint students', ko: '음대 대위법 과제 수강 중인 학생', pt: 'Alunos de contraponto da universidade', es: 'Estudiantes de contrapunto de universidad' },
  { key: 'who2', ja: '音大受験生（作曲専攻・音楽理論専攻）', en: 'Music exam candidates (composition/theory)', ko: '음대 입시 준비생(작곡·음악이론)', pt: 'Candidatos a exames de música (composição/teoria)', es: 'Candidatos a exámenes de música (composición/teoría)' },
  { key: 'who3', ja: '対位法の基礎を固めたい学習者', en: 'Learners building counterpoint foundations', ko: '대위법 기초를 다지는 학습자', pt: 'Alunos construindo fundações de contraponto', es: 'Alumnos construyendo fundaciones de contrapunto' },
  { key: 'who4', ja: '作曲科の学生（フーガ・カノンへの準備）', en: 'Composition majors (fugue & canon prep)', ko: '작곡과 학생(푸가·카논 준비)', pt: 'Alunos de composição (preparação para fuga & cânone)', es: 'Alumnos de composición (preparación para fuga & canon)' },
  { key: 'who5', ja: '独学で対位法を学ぶ音楽愛好家', en: 'Self-taught counterpoint learners', ko: '독학으로 대위법을 배우는 음악 애호가', pt: 'Alunos autodidatas de contraponto', es: 'Alumnos autodidactas de contraponto' },
  { key: 'who6', ja: 'Fux『Gradus ad Parnassum』を使った学習者', en: 'Fux "Gradus ad Parnassum" learners', ko: 'Fux 『Gradus ad Parnassum』 학습자', pt: 'Alunos de Fux "Gradus ad Parnassum"', es: 'Alumnos de Fux "Gradus ad Parnassum"' },
];
const WHO_ICONS = ['🎓', '📝', '📚', '✍️', '🎵', '📖'];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function CounterpointLPPage() {
  const { lang } = useLang();
  const t = (k: string) => T[k]?.[lang] ?? T[k]?.en ?? '';
  const tSpecies = (species: typeof SPECIES[0]) =>
    (species as Record<string, string>)[lang] || species.en;

  return (
    <main style={{ background: '#f0f9fc', minHeight: '100vh', fontFamily: sans, color: '#1e293b' }}>
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
            <span style={badge('#0e7490', CP_LIGHT)}>Counterpoint Checker</span>
            <p style={{ fontFamily: serif, fontSize: 'clamp(11px,2vw,13px)', letterSpacing: 5, color: ACCENT, marginBottom: 16, textTransform: 'uppercase' }}>
              Kuon Counterpoint
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
              <Link href="/counterpoint" style={ctaBtn}>
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
              { num: '4', label: t('statsSpecies') },
              { num: '15+', label: t('statsRules') },
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

        {/* ════════════ SPECIES OVERVIEW ════════════ */}
        <Section>
          <div style={centerText}>
            <h2 style={sectionTitle}>
              {lang === 'ja' ? '種別対位法 — 4つの段階' : lang === 'ko' ? '유별 대위법 — 4단계' : lang === 'pt' ? 'Contraponto por Espécies — 4 Estágios' : lang === 'es' ? 'Contrapunto por Especies — 4 Etapas' : '4 Species of Counterpoint'}
            </h2>
          </div>
          <div style={dividerLine} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 12,
          }}>
            {SPECIES.map((s, i) => (
              <div key={s.num} style={{
                ...glass,
                borderTop: `3px solid ${CORE_COLORS[i]}`,
                padding: 'clamp(16px,3vw,22px)',
              }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: CORE_COLORS[i], fontWeight: 800, marginBottom: 8 }}>
                  SPECIES {s.num}
                </div>
                <h3 style={{ fontFamily: serif, fontSize: 'clamp(16px,3vw,20px)', lineHeight: 1.3, margin: '0 0 8px 0' }}>
                  {lang === 'ja' ? s.ja : lang === 'ko' ? s.ko : lang === 'pt' ? s.pt : lang === 'es' ? s.es : s.en}
                </h3>
                <p style={{ fontSize: 'clamp(12px,2.2vw,14px)', lineHeight: 1.65, color: '#64748b', margin: 0 }}>
                  {lang === 'ja' ? s.ja_desc : lang === 'ko' ? s.ko_desc : lang === 'pt' ? s.pt_desc : lang === 'es' ? s.es_desc : s.en_desc}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════ CORE FEATURES (15) ════════════ */}
        <Section>
          <div id="features" style={centerText}>
            <span style={badge(ACCENT, CP_LIGHT)}>Core</span>
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
            <h2 style={sectionTitle}>
              {lang === 'ja' ? '使い方 — 3ステップ' : lang === 'ko' ? '사용법 — 3단계' : lang === 'pt' ? 'Como Funciona — 3 Passos' : lang === 'es' ? 'Cómo Funciona — 3 Pasos' : 'How It Works — 3 Steps'}
            </h2>
          </div>
          <div style={dividerLine} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                num: '01',
                ja: '種別を選択',
                en: 'Select Species',
                ko: '류별 선택',
                pt: 'Selecione a Espécie',
                es: 'Seleccione Especie',
                ja_d: '第1〜第4類（1:1、2:1、4:1、掛留）から選択。',
                en_d: 'Choose from 1st-4th species.',
                ko_d: '제1〜제4류 중 선택.',
                pt_d: 'Escolha entre 1ª a 4ª espécie.',
                es_d: 'Elige entre 1ª a 4ª especie.',
                icon: '⚙️',
              },
              {
                num: '02',
                ja: '定旋律とカウンターを入力',
                en: 'Enter Cantus & Countermelody',
                ko: '정선율과 대선율 입력',
                pt: 'Digite Cantus e Contraponto',
                es: 'Ingrese Cantus y Contrapunto',
                ja_d: '定旋律のメロディーと、対位メロディーを音名（C4, G3など）で入力。',
                en_d: 'Input cantus firmus and countermelody notes (C4, G3, etc.).',
                ko_d: '정선율과 대선율을 음명(C4, G3 등)으로 입력.',
                pt_d: 'Digite notas do cantus e contraponto.',
                es_d: 'Ingrese notas del cantus y contrapunto.',
                icon: '🎵',
              },
              {
                num: '03',
                ja: 'リアルタイムでエラーを確認',
                en: 'Check Errors in Real-Time',
                ko: '실시간 오류 확인',
                pt: 'Verifique Erros em Tempo Real',
                es: 'Verifique Errores en Tiempo Real',
                ja_d: '並達5度、隠伏8度、掛留の解決などが即座に赤色で表示される。修正して提出。',
                en_d: 'Errors appear instantly in red. Parallel 5ths, hidden 8ths, suspension issues, etc. Fix and submit.',
                ko_d: '병행 5도, 숨은 8도, 정지음 해결 등이 즉시 빨간색으로 표시.',
                pt_d: 'Erros aparecem instantaneamente em vermelho.',
                es_d: 'Los errores aparecen al instante en rojo.',
                icon: '✅',
              },
            ].map((s, i) => (
              <div key={s.num} className="feat-card" style={{
                ...glass,
                borderLeft: `4px solid ${ACCENT}`,
                padding: 'clamp(20px,4vw,30px)',
                background: 'rgba(236, 254, 255, 0.4)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div>
                    <span style={{ fontFamily: mono, fontSize: 11, color: ACCENT, fontWeight: 800, letterSpacing: 1 }}>
                      STEP {s.num}
                    </span>
                    <h3 style={{ fontFamily: serif, fontSize: 'clamp(17px,3vw,24px)', lineHeight: 1.3, margin: 0 }}>
                      {lang === 'ja' ? s.ja : lang === 'ko' ? s.ko : lang === 'pt' ? s.pt : lang === 'es' ? s.es : s.en}
                    </h3>
                  </div>
                </div>
                <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', lineHeight: 1.85, color: '#64748b', margin: 0 }}>
                  {lang === 'ja' ? s.ja_d : lang === 'ko' ? s.ko_d : lang === 'pt' ? s.pt_d : lang === 'es' ? s.es_d : s.en_d}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════ WHO ════════════ */}
        <Section>
          <div style={centerText}>
            <h2 style={sectionTitle}>
              {lang === 'ja' ? 'こんな人に最適' : lang === 'ko' ? '이런 분에게 최적' : lang === 'pt' ? 'Perfeito Para' : lang === 'es' ? 'Perfecto Para' : 'Perfect For'}
            </h2>
          </div>
          <div style={dividerLine} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: 12,
          }}>
            {WHO_KEYS.map((w, i) => (
              <div key={w.key} style={{
                ...glass,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{WHO_ICONS[i]}</span>
                <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', lineHeight: 1.6, margin: 0 }}>
                  {lang === 'ja' ? w.ja : lang === 'ko' ? w.ko : lang === 'pt' ? w.pt : lang === 'es' ? w.es : w.en}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ════════════ FREE ════════════ */}
        <Section>
          <div style={centerText}>
            <h2 style={sectionTitle}>
              {lang === 'ja' ? 'ブラウザ完結。完全無料。' : lang === 'ko' ? '브라우저 완결. 완전 무료.' : lang === 'pt' ? 'No navegador. Totalmente grátis.' : lang === 'es' ? 'En el navegador. Totalmente gratis.' : 'Browser-based. Completely free.'}
            </h2>
            <p style={{ ...sectionSub, marginBottom: 0 }}>
              {lang === 'ja' ? 'ダウンロード不要。登録不要。広告なし。スマートフォンでもタブレットでも。課題を保存して後で続ける機能はブラウザに自動保存。提出直前の最後のチェック、または日々の練習に — あなたのペースで使えます。' : lang === 'ko' ? '다운로드 불필요. 등록 불필요. 광고 없음. 스마트폰, 태블릿 모두 지원. 자동 저장.' : lang === 'pt' ? 'Sem download. Sem cadastro. Sem anúncios. Funciona em telefone e tablet. Salva automaticamente no navegador.' : lang === 'es' ? 'Sin descarga. Sin registro. Sin anuncios. Funciona en teléfono y tablet. Se guarda automáticamente.' : 'No download. No signup. No ads. Works on phone and tablet. Auto-saves your work in the browser. Final check before submission, or daily practice — at your pace.'}
            </p>
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
            <span style={badge('#0e7490', CP_LIGHT)}>Counterpoint Checker</span>
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(22px,4.5vw,36px)',
              marginBottom: 12,
              lineHeight: 1.45,
              whiteSpace: 'pre-line',
              letterSpacing: 0.3,
            }}>
              {lang === 'ja' ? '対位法の禁則を「知る」のではなく、\n禁則を「見つける力」を持つために。' : lang === 'ko' ? '대위법 금칙을 「아는」 것이 아니라,\n「찾는 능력」을 기르기 위해.' : lang === 'pt' ? 'Não para "saber" as regras,\nmas para "encontrá-las".' : lang === 'es' ? 'No para "saber" las reglas,\nsino para "encontrarlas".' : 'Not to "know" the rules,\nbut to "find" them in your work.'}
            </h2>
            <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', color: '#64748b', marginBottom: 28, lineHeight: 1.7 }}>
              {lang === 'ja' ? '世界初のブラウザ対位法チェッカー。' : lang === 'ko' ? '세계 최초의 브라우저 대위법 체커.' : lang === 'pt' ? 'O primeiro verificador de contraponto baseado em navegador do mundo.' : lang === 'es' ? 'El primer verificador de contrapunto basado en navegador del mundo.' : 'The world\'s first browser-based counterpoint checker.'}
            </p>
            <Link href="/counterpoint" style={{
              ...ctaBtn,
              padding: '18px 48px',
              fontSize: 'clamp(15px,2.8vw,18px)',
              borderRadius: 14,
              boxShadow: `0 4px 20px ${ACCENT}40`,
            }}>
              {lang === 'ja' ? 'KUON COUNTERPOINT を使う（無料）' : lang === 'ko' ? 'KUON COUNTERPOINT 사용 — 무료' : lang === 'pt' ? 'Usar KUON COUNTERPOINT — Grátis' : lang === 'es' ? 'Usar KUON COUNTERPOINT — Gratis' : 'Use KUON COUNTERPOINT — Free'}
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
                {lang === 'ja' ? '全てのアプリを見る' : lang === 'ko' ? '모든 앱 보기' : lang === 'pt' ? 'Ver Todos os Apps' : lang === 'es' ? 'Ver Todas las Apps' : 'See All Apps'} →
              </Link>
            </div>
          </div>
        </Section>

      </div>
    </main>
  );
}
