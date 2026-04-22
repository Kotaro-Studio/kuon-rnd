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
const ACCENT = '#8b5cf6';
const ACCENT2 = '#c4b5fd';
const ACCENT_LIGHT = '#ede9fe';
const JAZZ = '#d97706';
const JAZZ_LIGHT = '#fef3c7';

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
    ja: 'プロの音楽家が監修した、\n世界最高のブラウザメトロノーム。',
    en: 'The world\'s finest\nbrowser metronome,\nsupervised by a pro musician.',
    ko: '프로 음악가가 감수한\n세계 최고의 브라우저 메트로놈.',
    pt: 'O melhor metrônomo\nde navegador do mundo,\nsupervisionado por um profissional.',
    es: 'El mejor metrónomo\nde navegador del mundo,\nsupervisado por un profesional.',
  },
  heroSub: {
    ja: '「クリック音を鳴らすだけ」のメトロノームは、メトロノームの10%の機能しか果たしていない。',
    en: 'A metronome that "just plays clicks" fulfills only 10% of what a metronome should do.',
    ko: '"클릭만 재생하는" 메트로놈은 메트로놈 기능의 10%만 수행합니다.',
    pt: 'Um metrônomo que "só toca cliques" cumpre apenas 10% do que deveria.',
    es: 'Un metrónomo que "solo reproduce clics" cumple solo el 10% de lo que debería.',
  },
  heroDesc: {
    ja: 'サイレントバー練習、スピードトレーナー、ポリリズム、スウィング、変拍子グルーピング、メトリック・モジュレーション、クラーベパターン、ビートディスプレイスメント、オーバー・ザ・バーライン — プロが本当に必要とする13の機能を全て搭載。ブラウザ完結・無料。',
    en: 'Silent bar practice, speed trainer, polyrhythm, swing, irregular meter grouping, metric modulation, clave patterns, beat displacement, over-the-barline — all 13 features a pro actually needs. Browser-based, free.',
    ko: '사일런트 바, 스피드 트레이너, 폴리리듬, 스윙, 변박자 그루핑, 메트릭 모듈레이션, 클라베, 비트 디스플레이스먼트, 오버 더 바라인 — 프로가 필요로 하는 13가지 기능. 브라우저 완결, 무료.',
    pt: 'Prática silenciosa, treinador de velocidade, polirritmia, swing, agrupamento irregular, modulação métrica, clave, deslocamento rítmico, além da barra — 13 recursos. No navegador, grátis.',
    es: 'Práctica silenciosa, entrenador de velocidad, polirritmia, swing, agrupamiento irregular, modulación métrica, clave, desplazamiento rítmico, sobre la barra — 13 funciones. En el navegador, gratis.',
  },
  heroCta: { ja: '今すぐ使う（無料）', en: 'Use It Now — Free', ko: '지금 사용 — 무료', pt: 'Use Agora — Grátis', es: 'Úsalo Ahora — Gratis' },
  heroMore: { ja: '機能を見る', en: 'See Features', ko: '기능 보기', pt: 'Ver Recursos', es: 'Ver Funciones' },

  // Pain points
  painTitle: { ja: '既存のメトロノームの問題', en: 'The problem with existing metronomes', ko: '기존 메트로놈의 문제', pt: 'O problema com metrônomos existentes', es: 'El problema con los metrónomos existentes' },
  pain1: { ja: 'クリック音を鳴らすだけ — テンポの内在化訓練ができない', en: '"Just plays clicks" — can\'t train you to internalize tempo', ko: '"클릭만 재생" — 내재화 훈련 불가능', pt: '"Só toca cliques" — não treina internalização', es: '"Solo reproduce clics" — no entrena internalización' },
  pain2: { ja: '変拍子の練習ができない — 5/8、7/8、11/8に非対応', en: 'No irregular meter practice — 5/8, 7/8, 11/8 unsupported', ko: '변박자 연습 불가 — 5/8, 7/8, 11/8 미지원', pt: 'Sem compassos irregulares — 5/8, 7/8, 11/8', es: 'Sin compases irregulares — 5/8, 7/8, 11/8' },
  pain3: { ja: 'ポリリズムの練習手段がない', en: 'No polyrhythm training available', ko: '폴리리듬 연습 수단 없음', pt: 'Sem treinamento de polirritmia', es: 'Sin entrenamiento de polirritmia' },
  pain4: { ja: 'メトリック・モジュレーションの訓練機能が存在しない', en: 'Metric modulation training doesn\'t exist', ko: '메트릭 모듈레이션 훈련 기능이 존재하지 않음', pt: 'Treinamento de modulação métrica não existe', es: 'El entrenamiento de modulación métrica no existe' },
  pain5: { ja: 'クラーベやジャズパターンを同時に鳴らせない', en: 'Can\'t play clave or jazz patterns alongside', ko: '클라베나 재즈 패턴을 동시에 울릴 수 없음', pt: 'Não toca clave ou padrões de jazz junto', es: 'No reproduce clave o patrones de jazz junto' },

  // Pro supervised
  proTitle: { ja: 'なぜ「プロ監修」が違うのか', en: 'Why "pro-supervised" is different', ko: '왜 「프로 감수」가 다른가', pt: 'Por que "profissional" é diferente', es: 'Por qué "profesional" es diferente' },
  proDesc: {
    ja: 'ほとんどのメトロノームアプリは開発者が作っています。開発者はコードは書けますが、練習の現場で何が必要かを知りません。\n\nKUON METRONOMEは、音響エンジニア兼プロの音楽家である朝比奈幸太郎が設計に関わっています。サイレントバー練習、ポリリズム、メトリック・モジュレーション、クラーベパターン — これらは全て実際の練習現場から生まれた機能です。',
    en: 'Most metronome apps are built by developers. Developers can write code, but they don\'t know what\'s needed in the practice room.\n\nKUON METRONOME is designed with input from Kotaro Asahina — audio engineer and professional musician. Silent bar practice, polyrhythm, metric modulation, clave patterns — these features all come from real practice needs.',
    ko: '대부분의 메트로놈 앱은 개발자가 만듭니다. 개발자는 코드를 쓸 수 있지만 연습 현장에서 무엇이 필요한지 모릅니다.\n\nKUON METRONOME은 음향 엔지니어이자 프로 음악가인 아사히나 코타로가 설계에 참여했습니다.',
    pt: 'A maioria dos apps são feitos por desenvolvedores que não conhecem a sala de prática.\n\nKUON METRONOME é projetado com Kotaro Asahina — engenheiro de áudio e músico profissional.',
    es: 'La mayoría de apps son hechos por desarrolladores que no conocen la sala de ensayo.\n\nKUON METRONOME está diseñado con Kotaro Asahina — ingeniero de audio y músico profesional.',
  },

  // Feature section headers
  coreTitle: { ja: 'コア機能 — 9つのプロフェッショナルツール', en: 'Core — 9 Professional Tools', ko: '코어 — 9가지 프로 툴', pt: 'Core — 9 Ferramentas Profissionais', es: 'Core — 9 Herramientas Profesionales' },
  jazzTitle: { ja: 'ジャズトレーニング — 世界に類を見ない4つの訓練機能', en: 'Jazz Training — 4 Features Found Nowhere Else', ko: '재즈 트레이닝 — 세계에 유례없는 4가지 훈련 기능', pt: 'Jazz Training — 4 Recursos Exclusivos', es: 'Jazz Training — 4 Funciones Exclusivas' },
  jazzSub: {
    ja: 'これらの機能を搭載したブラウザメトロノームは、KUON METRONOME 以外に存在しません。',
    en: 'No other browser metronome offers these features.',
    ko: '이러한 기능을 탑재한 브라우저 메트로놈은 KUON METRONOME 외에 존재하지 않습니다.',
    pt: 'Nenhum outro metrônomo de navegador oferece esses recursos.',
    es: 'Ningún otro metrónomo de navegador ofrece estas funciones.',
  },

  // Core features
  f1t: { ja: 'サイレントバー練習', en: 'Silent Bar Practice', ko: '사일런트 바 연습', pt: 'Prática Silenciosa', es: 'Práctica Silenciosa' },
  f1d: { ja: 'N小節鳴らしてN小節無音。復帰時のずれが内部パルスの精度を映す。', en: 'Play N bars, then N bars silent. Drift on return reveals internal pulse accuracy.', ko: 'N마디 재생 후 N마디 무음. 복귀 시 어긋남이 내부 박 정밀도를 반영.', pt: 'Toque N compassos, depois N silenciosos.', es: 'Toca N compases, después N silenciosos.' },
  f2t: { ja: 'スピードトレーナー', en: 'Speed Trainer', ko: '스피드 트레이너', pt: 'Treinador de Velocidade', es: 'Entrenador de Velocidad' },
  f2d: { ja: '開始BPMから目標BPMまでN小節ごとに自動加速。', en: 'Auto-accelerate from start to target BPM every N bars.', ko: '시작 BPM에서 목표까지 N마디마다 자동 가속.', pt: 'Acelera do BPM inicial ao alvo a cada N compassos.', es: 'Acelera del BPM inicial al objetivo cada N compases.' },
  f3t: { ja: 'ポリリズム', en: 'Polyrhythm', ko: '폴리리듬', pt: 'Polirritmia', es: 'Polirritmia' },
  f3d: { ja: '4対3、3対2、5対4 — 2つのリズムを異なる音色で同時再生。', en: '4:3, 3:2, 5:4 — two rhythms in different timbres simultaneously.', ko: '4대3, 3대2, 5대4 — 두 리듬을 다른 음색으로 동시 재생.', pt: '4:3, 3:2, 5:4 — dois ritmos em timbres diferentes.', es: '4:3, 3:2, 5:4 — dos ritmos en timbres diferentes.' },
  f4t: { ja: '変拍子グルーピング', en: 'Irregular Meter Grouping', ko: '변박자 그루핑', pt: 'Agrupamento Irregular', es: 'Agrupamiento Irregular' },
  f4d: { ja: '7/8 を 2+2+3 か 3+2+2 か。5/8〜12/8 に完全対応。', en: '7/8 as 2+2+3 or 3+2+2. Full support for 5/8 through 12/8.', ko: '7/8을 2+2+3인지 3+2+2인지. 5/8~12/8 완전 대응.', pt: '7/8 como 2+2+3 ou 3+2+2. Suporte completo 5/8 a 12/8.', es: '7/8 como 2+2+3 o 3+2+2. Soporte completo 5/8 a 12/8.' },
  f5t: { ja: 'スウィング', en: 'Swing', ko: '스윙', pt: 'Swing', es: 'Swing' },
  f5d: { ja: '50%（ストレート）から75%（完全三連）まで連続調整。', en: '50% (straight) to 75% (full triplet) continuously adjustable.', ko: '50%(스트레이트)에서 75%(완전 삼연음)까지 연속 조절.', pt: '50% (reto) a 75% (tercina completa) continuamente.', es: '50% (recto) a 75% (tresillo completo) continuamente.' },
  f6t: { ja: 'サブディビジョン', en: 'Subdivisions', ko: '세분화', pt: 'Subdivisões', es: 'Subdivisiones' },
  f6d: { ja: '八分音符から七連符まで。メイン拍と異なる音量で裏拍を再生。', en: 'Eighth notes through septuplets. Off-beats at distinct volume.', ko: '8분음표부터 7연음까지. 메인 박과 다른 음량.', pt: 'Colcheias a septinas. Contratempos em volume distinto.', es: 'Corcheas a septillos. Contratiempos en volumen distinto.' },
  f7t: { ja: 'アクセントパターン', en: 'Accent Pattern', ko: '악센트 패턴', pt: 'Padrão de Acento', es: 'Patrón de Acento' },
  f7d: { ja: '拍ごとに4段階（強・中・弱・ミュート）。クリックで即変更。', en: '4 levels per beat (strong/medium/weak/mute). Click to change.', ko: '박마다 4단계(강·중·약·음소거). 클릭으로 변경.', pt: '4 níveis por batida. Clique para mudar.', es: '4 niveles por pulso. Clic para cambiar.' },
  f8t: { ja: 'チューニング基準音', en: 'Tuning Reference', ko: '튜닝 기준음', pt: 'Tom de Referência', es: 'Tono de Referencia' },
  f8d: { ja: 'A=440〜443Hz サイン波をメトロノームと同時出力。', en: 'A=440-443Hz sine wave alongside the metronome.', ko: 'A=440~443Hz 사인파를 메트로놈과 동시 출력.', pt: 'Onda senoidal A=440-443Hz junto ao metrônomo.', es: 'Onda sinusoidal A=440-443Hz junto al metrónomo.' },
  f9t: { ja: 'プリセット＆練習ログ', en: 'Presets & Practice Log', ko: '프리셋 & 연습 로그', pt: 'Predefinições & Registro', es: 'Preajustes & Registro' },
  f9d: { ja: 'BPM・拍子・設定をセット保存。1分以上の練習を自動記録。', en: 'Save BPM, time sig, settings as sets. Auto-log sessions over 1 min.', ko: 'BPM·박자·설정을 세트 저장. 1분 이상 연습 자동 기록.', pt: 'Salve BPM, compasso, config. Registro auto acima de 1 min.', es: 'Guarda BPM, compás, config. Registro auto sobre 1 min.' },

  // Jazz features
  j1t: { ja: 'メトリック・モジュレーション', en: 'Metric Modulation', ko: '메트릭 모듈레이션', pt: 'Modulação Métrica', es: 'Modulación Métrica' },
  j1d: {
    ja: '♩=♩.（テンポ×2/3）、三連符♩=新♩（×3/2）、♩=♪（×2）、五連符モジュレーション、4/4→3/4→4/4 チェーン — 拍の等価関係に基づくテンポ遷移を、複数小節にまたがるシーケンスとして自動再生。プリセット5種を搭載し、ループ再生にも対応。ジャズ・現代音楽の最も高度な訓練を、ブラウザで実現。',
    en: '♩=♩. (tempo×2/3), triplet ♩=new ♩ (×3/2), ♩=♪ (×2), quintuplet modulation, 4/4→3/4→4/4 chain — tempo transitions based on beat equivalence, auto-played as multi-bar sequences. 5 built-in presets with loop support. The most advanced jazz/modern music training, in a browser.',
    ko: '♩=♩.(템포×2/3), 삼연음♩=새♩(×3/2), ♩=♪(×2), 5연음 모듈레이션, 4/4→3/4→4/4 체인 — 박의 등가 관계에 기반한 템포 전환을 여러 마디 시퀀스로 자동 재생. 프리셋 5종, 루프 지원.',
    pt: '♩=♩.(×2/3), tercina♩=nova♩(×3/2), ♩=♪(×2), modulação quintina, cadeia 4/4→3/4→4/4 — transições de tempo em sequências multi-compasso. 5 predefinições com loop.',
    es: '♩=♩.(×2/3), tresillo♩=nueva♩(×3/2), ♩=♪(×2), modulación quintillo, cadena 4/4→3/4→4/4 — transiciones de tempo en secuencias multi-compás. 5 preajustes con loop.',
  },
  j2t: { ja: 'クラーベ＆パターン', en: 'Clave & Patterns', ko: '클라베 & 패턴', pt: 'Clave & Padrões', es: 'Clave & Patrones' },
  j2d: {
    ja: 'ソンクラーベ 3-2 / 2-3、ルンバクラーベ、ボサノバ、サンバ、ジャズライド（スパンガラング）、トレシージョ、カスカラ — 8種のラテン/ジャズ定型パターンを、メトロノームと同時にウッドブロック音色で再生。パターンのドット可視化で構造を直感的に理解。体にパターンを刻む訓練。',
    en: 'Son Clave 3-2/2-3, Rumba Clave, Bossa Nova, Samba, Jazz Ride (Spang-a-lang), Tresillo, Cascara — 8 Latin/Jazz patterns played in woodblock timbre alongside the metronome. Dot visualization shows structure intuitively. Engrave patterns into your body.',
    ko: '손 클라베 3-2/2-3, 룸바, 보사노바, 삼바, 재즈 라이드, 트레시요, 카스카라 — 8종 라틴/재즈 패턴을 우드블록 음색으로 메트로놈과 동시 재생. 도트 시각화.',
    pt: 'Clave de Son, Rumba, Bossa Nova, Samba, Jazz Ride, Tresillo, Cascara — 8 padrões em timbre de woodblock junto ao metrônomo.',
    es: 'Clave de Son, Rumba, Bossa Nova, Samba, Jazz Ride, Tresillo, Cascara — 8 patrones en timbre de woodblock junto al metrónomo.',
  },
  j3t: { ja: 'ビートディスプレイスメント', en: 'Beat Displacement', ko: '비트 디스플레이스먼트', pt: 'Deslocamento de Batida', es: 'Desplazamiento de Pulso' },
  j3d: {
    ja: 'アクセント位置を16分音符（1/16）、8分音符（1/8）、付点8分音符（3/16）、4分音符（1/4）単位でシフト。通常のクリックに加え、ずらした位置にもクリックが鳴る。「ずれた拍頭」でフレーズを弾く訓練 — ジャズ即興における最も核心的なリズム技術。',
    en: 'Shift accent by 1/16, 1/8, 3/16, or 1/4 note. A displaced click sounds alongside the normal click. Practice phrasing on the "shifted downbeat" — the most essential rhythm technique in jazz improvisation.',
    ko: '악센트를 16분음표(1/16), 8분음표(1/8), 점8분음표(3/16), 4분음표(1/4) 단위로 시프트. 「어긋난 박두」로 프레이즈를 연주하는 훈련 — 재즈 즉흥의 핵심 리듬 기술.',
    pt: 'Desloque o acento por 1/16, 1/8, 3/16 ou 1/4. Um clique deslocado soa junto ao normal. Técnica essencial de improvisação jazz.',
    es: 'Desplaza el acento por 1/16, 1/8, 3/16 o 1/4. Un clic desplazado suena junto al normal. Técnica esencial de improvisación jazz.',
  },
  j4t: { ja: 'オーバー・ザ・バーライン', en: 'Over the Barline', ko: '오버 더 바라인', pt: 'Além da Barra', es: 'Sobre la Barra' },
  j4d: {
    ja: '4/4拍子で3拍ごとにアクセント → 4小節で一巡。5拍ごと → 5小節で一巡。7拍ごと → 7小節で一巡（Coltrane的浮遊感）。4 over 3/4（ワルツに4拍子を重ねる）。小節線を超えるアクセントパターンが、ジャズフレージングの「浮遊感」を体に刻む。',
    en: 'Accent every 3 beats in 4/4 → completes in 4 bars. Every 5 → 5 bars. Every 7 → 7 bars (Coltrane-style float). 4 over 3/4 overlays 4-feel on a waltz. Cross-barline accents engrave jazz phrasing "float" into your body.',
    ko: '4/4에서 3박마다 악센트 → 4마디 완결. 5박마다 → 5마디. 7박마다 → 7마디(Coltrane적 부유감). 4 over 3/4. 마디선을 넘는 악센트가 재즈 프레이징의 「부유감」을 몸에 새깁니다.',
    pt: 'Acento a cada 3 batidas em 4/4 → 4 compassos. Cada 5 → 5. Cada 7 → 7 (flutuação à la Coltrane). Acentos além da barra.',
    es: 'Acento cada 3 pulsos en 4/4 → 4 compases. Cada 5 → 5. Cada 7 → 7 (flotación tipo Coltrane). Acentos sobre la barra.',
  },

  // Precision
  precTitle: { ja: 'ミリ秒レベルの精度', en: 'Millisecond-level Precision', ko: '밀리초 수준의 정밀도', pt: 'Precisão em Milissegundos', es: 'Precisión de Milisegundos' },
  precDesc: {
    ja: 'JavaScript の setInterval は ±10ms のジッターがあり、音楽家には論外。KUON METRONOME は Web Audio API の AudioContext.currentTime による先読みスケジューリングを採用。サンプル精度のタイミングを実現し、プロが安心して使える正確さを保証します。',
    en: 'JavaScript\'s setInterval has ±10ms jitter — unacceptable for musicians. KUON METRONOME uses Web Audio API\'s AudioContext.currentTime with look-ahead scheduling. Sample-accurate timing that professionals can trust.',
    ko: 'JavaScript의 setInterval은 ±10ms 지터. KUON METRONOME은 Web Audio API의 AudioContext.currentTime 선행 스케줄링을 사용. 프로가 신뢰할 수 있는 샘플 정밀도.',
    pt: 'setInterval tem ±10ms de jitter. KUON METRONOME usa Web Audio API com agendamento antecipado. Precisão ao nível de amostras.',
    es: 'setInterval tiene ±10ms de jitter. KUON METRONOME usa Web Audio API con programación anticipada. Precisión a nivel de muestras.',
  },

  // Who
  whoTitle: { ja: 'こんな人に最適', en: 'Perfect For', ko: '이런 분에게 최적', pt: 'Perfeito Para', es: 'Perfecto Para' },
  who1: { ja: '聴音・ソルフェージュで拍子感を鍛えたい音大受験生', en: 'Music exam candidates training rhythmic sense in ear training', ko: '청음·솔페주로 박자감을 키우고 싶은 음대 수험생', pt: 'Candidatos a exames de música treinando senso rítmico', es: 'Candidatos a exámenes de música entrenando sentido rítmico' },
  who2: { ja: 'テンポ感を内在化したい全ての楽器奏者', en: 'Every instrumentalist wanting to internalize tempo', ko: '템포 감각을 내재화하고 싶은 모든 악기 연주자', pt: 'Todo instrumentista que quer internalizar o tempo', es: 'Todo instrumentista que quiere internalizar el tempo' },
  who3: { ja: 'ポリリズム・変拍子を体に入れたい上級者', en: 'Advanced players mastering polyrhythm and irregular meters', ko: '폴리리듬·변박자를 몸에 익히고 싶은 상급자', pt: 'Músicos avançados dominando polirritmia', es: 'Músicos avanzados dominando polirritmia' },
  who4: { ja: 'メトリック・モジュレーションを訓練したいジャズミュージシャン', en: 'Jazz musicians training metric modulation', ko: '메트릭 모듈레이션을 훈련하고 싶은 재즈 뮤지션', pt: 'Músicos de jazz treinando modulação métrica', es: 'Músicos de jazz entrenando modulación métrica' },
  who5: { ja: 'クラーベを体に刻みたいラテン/ジャズ奏者', en: 'Latin/Jazz players engraving clave into their body', ko: '클라베를 몸에 새기고 싶은 라틴/재즈 연주자', pt: 'Músicos de Latin/Jazz gravando clave no corpo', es: 'Músicos de Latin/Jazz grabando clave en el cuerpo' },
  who6: { ja: '通学中にテンポトレーニングしたい学生', en: 'Students wanting tempo training during commute', ko: '통학 중 템포 트레이닝하고 싶은 학생', pt: 'Estudantes que querem treinar no trajeto', es: 'Estudiantes que quieren entrenar en el trayecto' },

  // Free
  freeTitle: { ja: 'ブラウザ完結。完全無料。', en: 'Browser-based. Completely free.', ko: '브라우저 완결. 완전 무료.', pt: 'No navegador. Totalmente grátis.', es: 'En el navegador. Totalmente gratis.' },
  freeDesc: {
    ja: 'ダウンロード不要。登録不要。広告なし。スマートフォンでもタブレットでも。プリセットと練習ログはブラウザに自動保存。あなたの練習環境を邪魔しない、静かで強力なツール。',
    en: 'No download. No signup. No ads. Works on phone and tablet. Presets and practice log auto-save in your browser. A quiet, powerful tool that doesn\'t interrupt your practice.',
    ko: '다운로드 불필요. 등록 불필요. 광고 없음. 프리셋과 연습 로그는 브라우저에 자동 저장.',
    pt: 'Sem download. Sem cadastro. Sem anúncios. Predefinições e registro salvam automaticamente.',
    es: 'Sin descarga. Sin registro. Sin anuncios. Preajustes y registro se guardan automáticamente.',
  },

  // CTA
  ctaTitle: {
    ja: 'テンポを「知る」のではなく、\nテンポを「持つ」ために。',
    en: 'Not to "know" tempo,\nbut to "own" it.',
    ko: '템포를 「아는」 것이 아니라,\n템포를 「가지기」 위해.',
    pt: 'Não para "saber" o tempo,\nmas para "tê-lo".',
    es: 'No para "saber" el tempo,\nsino para "tenerlo".',
  },
  ctaSub: {
    ja: 'プロの音楽家が監修した、世界最高のブラウザメトロノーム。',
    en: 'The world\'s finest browser metronome, supervised by a professional musician.',
    ko: '프로 음악가가 감수한 세계 최고의 브라우저 메트로놈.',
    pt: 'O melhor metrônomo de navegador, supervisionado por um profissional.',
    es: 'El mejor metrónomo de navegador, supervisado por un profesional.',
  },
  ctaBtn: { ja: 'KUON METRONOME を使う（無料）', en: 'Use KUON METRONOME — Free', ko: 'KUON METRONOME 사용 — 무료', pt: 'Usar KUON METRONOME — Grátis', es: 'Usar KUON METRONOME — Gratis' },
  ctaApps: { ja: '全てのアプリを見る', en: 'See All Apps', ko: '모든 앱 보기', pt: 'Ver Todos os Apps', es: 'Ver Todas las Apps' },
};

const CORE_FEATURES = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9'];
const CORE_COLORS = ['#dc2626', '#d97706', '#0ea5e9', '#22c55e', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#6366f1'];
const CORE_ICONS = ['🔇', '⚡', '🥁', '🎵', '🎷', '🎼', '🔘', '🎹', '💾'];

const JAZZ_FEATURES = ['j1', 'j2', 'j3', 'j4'];
const JAZZ_COLORS = ['#d97706', '#ea580c', '#b45309', '#92400e'];
const JAZZ_ICONS = ['🔀', '🪘', '↔️', '⤴️'];

const WHO_KEYS = ['who1', 'who2', 'who3', 'who4', 'who5', 'who6'];
const WHO_ICONS = ['🎓', '🎻', '🥁', '🎷', '🪘', '📱'];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function MetronomeLPPage() {
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
            <span style={badge('#92400e', '#fef3c7')}>Pro Supervised</span>
            <p style={{ fontFamily: serif, fontSize: 'clamp(11px,2vw,13px)', letterSpacing: 5, color: ACCENT, marginBottom: 16, textTransform: 'uppercase' }}>
              Kuon Metronome
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
              <Link href="/metronome" style={ctaBtn}>
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
              { num: '13', label: { ja: 'プロ機能', en: 'Pro Features', ko: '프로 기능', pt: 'Recursos Pro', es: 'Funciones Pro' } },
              { num: '12', label: { ja: '拍子', en: 'Time Sigs', ko: '박자', pt: 'Compassos', es: 'Compases' } },
              { num: '¥0', label: { ja: '完全無料', en: 'Free Forever', ko: '완전 무료', pt: 'Grátis Sempre', es: 'Gratis Siempre' } },
            ].map((s, i) => (
              <div key={i} style={{
                ...glass,
                padding: 'clamp(16px,3vw,28px) clamp(10px,2vw,16px)',
              }}>
                <div style={{ fontFamily: serif, fontSize: 'clamp(28px,6vw,40px)', fontWeight: 700, color: ACCENT, lineHeight: 1 }}>
                  {s.num}
                </div>
                <div style={{ fontSize: 'clamp(11px,2vw,13px)', color: '#64748b', marginTop: 6, fontWeight: 600 }}>
                  {(s.label as Record<string, string>)[lang] ?? s.label.en}
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

        {/* ════════════ PRO SUPERVISED ════════════ */}
        <Section>
          <div style={centerText}>
            <h2 style={sectionTitle}>{t('proTitle')}</h2>
          </div>
          <div style={dividerLine} />
          <div style={{ ...glass, borderLeft: `3px solid ${ACCENT}` }}>
            <p style={{ fontSize: 'clamp(14px,2.5vw,16px)', lineHeight: 2, color: '#475569', whiteSpace: 'pre-line' }}>
              {t('proDesc')}
            </p>
          </div>
        </Section>

        {/* ════════════ CORE FEATURES (9) ════════════ */}
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

        {/* ════════════ JAZZ TRAINING (4) ════════════ */}
        <Section>
          <div style={centerText}>
            <span style={badge(JAZZ, JAZZ_LIGHT)}>Jazz Training</span>
            <h2 style={sectionTitle}>{t('jazzTitle')}</h2>
            <p style={sectionSub}>{t('jazzSub')}</p>
          </div>
          <div style={dividerLine} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {JAZZ_FEATURES.map((k, i) => (
              <div key={k} className="feat-card" style={{
                ...glass,
                borderLeft: `4px solid ${JAZZ_COLORS[i]}`,
                padding: 'clamp(20px,4vw,30px)',
                background: 'rgba(255,251,235,0.5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{JAZZ_ICONS[i]}</span>
                  <div>
                    <span style={{ fontFamily: mono, fontSize: 11, color: JAZZ_COLORS[i], fontWeight: 800, letterSpacing: 1 }}>
                      JAZZ {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 style={{ fontFamily: serif, fontSize: 'clamp(17px,3vw,24px)', lineHeight: 1.3, margin: 0 }}>
                      {t(`${k}t`)}
                    </h3>
                  </div>
                </div>
                <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', lineHeight: 1.85, color: '#57534e', margin: 0 }}>
                  {t(`${k}d`)}
                </p>
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
            borderLeft: '3px solid #22c55e',
            display: 'flex',
            gap: 20,
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}>⚡</div>
            <p style={{ fontSize: 'clamp(13px,2.3vw,15px)', lineHeight: 1.9, color: '#475569', margin: 0 }}>
              {t('precDesc')}
            </p>
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
            <span style={badge('#92400e', '#fef3c7')}>Pro Supervised</span>
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
            <Link href="/metronome" style={{
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
