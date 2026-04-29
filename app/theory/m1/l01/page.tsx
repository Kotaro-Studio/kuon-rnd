'use client';

/**
 * /theory/m1/l01 — M1-01「西洋音楽記譜法の導入」
 * =========================================================
 * OMT v2 Part I 第 1 章 (Introduction to Western Musical Notation, Chelsey Hamm)
 *
 * 章の Key Takeaways (PDF p.21):
 *   1. 「西洋音楽記譜法」= 音を伝えるための書記号
 *   2. 世界に存在する多くの記譜システムの一つに過ぎない
 *   3. 書き手は社会的文脈に応じて記譜法を選ぶ
 *
 * 本レッスンの設計:
 *   Layer 1 (Story): 記譜は翻訳である。完璧な翻訳は不可能で、何を伝えるか選ぶ。
 *   Layer 2 (Living Score): 同じ 3 音メロディーを 8 つの記譜で並列表示・聴き比べ。
 *                           「Make your own notation」演習 (OMT 章末課題に相当)。
 *   Layer 3 (Memory): 5 枚のフラッシュカード
 *
 * §49 整合性:
 *   - 「正解は一つではない」を記譜のレベルで先に教える
 *   - これが M1 全体の哲学的な土台になる
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

declare global {
  interface Window {
    loadPyodide?: (config?: Record<string, unknown>) => Promise<unknown>;
    __kuonPyodide?: unknown;
  }
}

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE_COLOR = '#d4d0c4';
const ACCENT_INDIGO = '#3a3a5e';
const ACCENT_GOLD = '#9c7c3a';

type L6 = { ja?: string; en: string; es?: string; ko?: string; pt?: string; de?: string };
const t = (m: L6, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

// ─────────────────────────────────────────────────────────────
// Web Audio で 3 音メロディー (do-mi-sol = C4-E4-G4) を再生
// ─────────────────────────────────────────────────────────────
const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const MELODY_MIDI = [60, 64, 67]; // C4, E4, G4

function playMelody() {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.18;
  masterGain.connect(ctx.destination);

  const noteDur = 0.55;
  MELODY_MIDI.forEach((midi, i) => {
    const t0 = ctx.currentTime + 0.05 + i * noteDur;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc2.type = 'sine';
    osc.frequency.value = midiToFreq(midi);
    osc2.frequency.value = midiToFreq(midi) * 2;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.22, t0 + 0.02);
    g.gain.setValueAtTime(0.22, t0 + noteDur - 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + noteDur);
    osc.connect(g);
    osc2.connect(g);
    g.connect(masterGain);
    osc.start(t0);
    osc2.start(t0);
    osc.stop(t0 + noteDur);
    osc2.stop(t0 + noteDur);
  });
  setTimeout(() => ctx.close(), 2500);
}

// ─────────────────────────────────────────────────────────────
// 8 つの記譜システム (同じ C-E-G メロディーを多様に表現)
// ─────────────────────────────────────────────────────────────
interface NotationSystem {
  id: string;
  name: L6;
  origin: L6;
  representation: string;  // 視覚的表現
  description: L6;
}

const NOTATION_SYSTEMS: NotationSystem[] = [
  {
    id: 'staff',
    name: { ja: '西洋五線譜', en: 'Western Staff Notation', es: 'Pentagrama occidental', ko: '서양 오선보', pt: 'Pauta ocidental', de: 'Westliche Notenschrift' },
    origin: { ja: '11 世紀イタリア (グイド・ダレッツォ起源)', en: '11th-century Italy (Guido of Arezzo)', es: 'Italia s. XI', ko: '11세기 이탈리아', pt: 'Itália do séc. XI', de: '11. Jh. Italien' },
    representation: '__STAFF_SVG__', // 特殊値: 下記の StaffMiniSvg をレンダリング (五線譜正確性遵守)
    description: { ja: '5 本の線と 4 つのスペース上に音符を配置。Bach・Mozart・Beethoven の世界。', en: 'Notes placed on 5 lines and 4 spaces. The world of Bach, Mozart, Beethoven.', es: 'Notas en 5 líneas y 4 espacios. El mundo de Bach, Mozart, Beethoven.', ko: '5 선 4 칸 위에 음표 배치. 바흐·모차르트·베토벤의 세계.', pt: 'Notas em 5 linhas e 4 espaços. O mundo de Bach, Mozart, Beethoven.', de: 'Noten auf 5 Linien und 4 Zwischenräumen. Die Welt von Bach, Mozart, Beethoven.' },
  },
  {
    id: 'letters',
    name: { ja: 'アルファベット (西洋音名)', en: 'Letter Names', es: 'Nombres de notas', ko: '알파벳 (서양 음이름)', pt: 'Nomes em letras', de: 'Buchstabennamen' },
    origin: { ja: '中世ヨーロッパ', en: 'Medieval Europe', es: 'Europa medieval', ko: '중세 유럽', pt: 'Europa medieval', de: 'Mittelalterliches Europa' },
    representation: 'C  E  G',
    description: { ja: '7 つの白鍵に A-G の文字を割り当てる。コードネーム表記の基礎。', en: 'Assigns letters A-G to the seven white keys. The basis of chord-symbol notation.', es: 'Asigna letras A-G a las teclas blancas. Base del cifrado de acordes.', ko: '7 개의 백건에 A-G 글자 할당. 코드 심볼 표기의 기초.', pt: 'Atribui letras A-G às teclas brancas. Base da cifragem de acordes.', de: 'Weist den weißen Tasten A-G zu. Grundlage der Akkordsymbol-Notation.' },
  },
  {
    id: 'solfege',
    name: { ja: '階名 (固定ド)', en: 'Solfège (fixed do)', es: 'Solfeo (do fijo)', ko: '계명 (고정도)', pt: 'Solfejo (dó fixo)', de: 'Solmisation (festes do)' },
    origin: { ja: '11 世紀グイド・ダレッツォ起源・ロマンス諸国で発展', en: 'Guido of Arezzo, 11th century — developed in Romance countries', es: 'Guido de Arezzo, s. XI', ko: '귀도 다레초, 11 세기', pt: 'Guido d\'Arezzo, séc. XI', de: 'Guido von Arezzo, 11. Jh.' },
    representation: 'do  mi  sol',
    description: { ja: 'Ut-Re-Mi-Fa-Sol-La (後に Si 追加) の音節で歌う。日本では固定ドが標準。', en: 'Sing with syllables Ut-Re-Mi-Fa-Sol-La (later Si). Fixed-do is standard in Japan and France.', es: 'Cantar con sílabas Ut-Re-Mi-Fa-Sol-La (después Si). El do fijo es estándar en Japón y Francia.', ko: 'Ut-Re-Mi-Fa-Sol-La (나중 Si 추가) 음절로 노래. 일본과 프랑스는 고정도.', pt: 'Cantar com sílabas Ut-Re-Mi-Fa-Sol-La (depois Si). Dó fixo padrão no Japão e França.', de: 'Singen mit Silben Ut-Re-Mi-Fa-Sol-La (später Si). Festes do ist Standard in Japan und Frankreich.' },
  },
  {
    id: 'japanese',
    name: { ja: '日本式音名 (イロハ)', en: 'Japanese Names (Iroha)', es: 'Nombres japoneses', ko: '일본식 음이름', pt: 'Nomes japoneses', de: 'Japanische Tonnamen' },
    origin: { ja: '近代日本・西洋音楽受容期に整備', en: 'Modern Japan, during the introduction of Western music', es: 'Japón moderno', ko: '근대 일본', pt: 'Japão moderno', de: 'Modernes Japan' },
    representation: 'ハ  ホ  ト',
    description: { ja: 'いろは順に対応: ハニホヘトイロ = C D E F G A B。日本の楽典で標準。', en: 'Iroha-order syllables: ハニホヘトイロ = C D E F G A B. Standard in Japanese theory texts.', es: 'Sílabas en orden iroha: ハニホヘトイロ = C D E F G A B.', ko: '이로하 순: ハニホヘトイロ = C D E F G A B. 일본 악전 표준.', pt: 'Sílabas iroha: ハニホヘトイロ = C D E F G A B.', de: 'Iroha-Silben: ハニホヘトイロ = C D E F G A B.' },
  },
  {
    id: 'sargam',
    name: { ja: 'サルガム (sargam)', en: 'Sargam (Indian)', es: 'Sargam (India)', ko: '사르감 (인도)', pt: 'Sargam (Índia)', de: 'Sargam (Indien)' },
    origin: { ja: 'インド古典音楽 (ヒンドゥスターニー・カルナーティック)', en: 'Indian classical music (Hindustani & Carnatic)', es: 'Música clásica india', ko: '인도 고전 음악', pt: 'Música clássica indiana', de: 'Indische klassische Musik' },
    representation: 'Sa  Ga  Pa',
    description: { ja: 'Sa-Re-Ga-Ma-Pa-Dha-Ni の 7 音節。ラーガ (旋法) ごとに音程が変わる柔軟な体系。', en: 'Seven syllables Sa-Re-Ga-Ma-Pa-Dha-Ni. Pitches shift per raga — a flexible modal system.', es: 'Siete sílabas Sa-Re-Ga-Ma-Pa-Dha-Ni. Las alturas cambian por raga.', ko: '7 음절 Sa-Re-Ga-Ma-Pa-Dha-Ni. 라가마다 음정 변화.', pt: 'Sete sílabas Sa-Re-Ga-Ma-Pa-Dha-Ni. Alturas mudam por raga.', de: 'Sieben Silben Sa-Re-Ga-Ma-Pa-Dha-Ni. Tonhöhen ändern sich je Raga.' },
  },
  {
    id: 'gongche',
    name: { ja: '工尺譜 (gōngchěpǔ)', en: 'Gongche (Chinese)', es: 'Gongche (China)', ko: '공척보 (중국)', pt: 'Gongche (China)', de: 'Gongche (China)' },
    origin: { ja: '中国伝統音楽 (唐代に成立・宋代以降に標準化)', en: 'Traditional Chinese music (established in Tang dynasty)', es: 'Música tradicional china (dinastía Tang)', ko: '중국 전통 음악 (당대)', pt: 'Música tradicional chinesa (dinastia Tang)', de: 'Traditionelle chinesische Musik (Tang-Dynastie)' },
    representation: '上  工  凡',
    description: { ja: '合・四・一・上・尺・工・凡・六・五・乙 の 10 字で音高を表す。京劇・古琴譜などに残る。', en: 'Ten characters 合四一上尺工凡六五乙 represent pitches. Survives in Peking opera and guqin scores.', es: 'Diez caracteres 合四一上尺工凡六五乙 representan alturas. Sobrevive en ópera de Pekín y guqin.', ko: '10 글자 合四一上尺工凡六五乙 가 음고를 나타냄. 경극과 고금 악보에 남아있음.', pt: 'Dez caracteres 合四一上尺工凡六五乙 representam alturas. Sobrevive na ópera de Pequim e guqin.', de: 'Zehn Zeichen 合四一上尺工凡六五乙 stellen Tonhöhen dar. Erhalten in Peking-Oper und Guqin-Notation.' },
  },
  {
    id: 'numbers',
    name: { ja: '数字譜 (jiǎnpǔ)', en: 'Numbered Notation (Cipher / Jianpu)', es: 'Cifra numérica', ko: '숫자보', pt: 'Cifra numérica', de: 'Ziffern-Notation' },
    origin: { ja: '17 世紀フランス起源・19 世紀中国で発展', en: '17th-century France origin, developed in 19th-century China', es: 'Origen Francia s. XVII, China s. XIX', ko: '17 세기 프랑스 기원, 19 세기 중국 발전', pt: 'Origem França séc. XVII, China séc. XIX', de: 'Ursprung Frankreich 17. Jh., entwickelt China 19. Jh.' },
    representation: '1  3  5',
    description: { ja: '1-7 の数字でスケール度数を表す。中国・東南アジアの大衆音楽教育で広く使われる。', en: 'Numbers 1-7 represent scale degrees. Widely used in popular music education in China and SE Asia.', es: 'Números 1-7 para grados. Usado en educación musical popular en China y SE Asia.', ko: '1-7 숫자로 음계 도수. 중국·동남아 대중음악 교육에서 널리 사용.', pt: 'Números 1-7 para graus. Usado no ensino popular na China e Sudeste Asiático.', de: 'Ziffern 1-7 für Tonleiterstufen. Verbreitet im Volksmusikunterricht in China und Südostasien.' },
  },
  {
    id: 'frequency',
    name: { ja: '周波数 (Hz)', en: 'Frequency (Hz)', es: 'Frecuencia (Hz)', ko: '주파수 (Hz)', pt: 'Frequência (Hz)', de: 'Frequenz (Hz)' },
    origin: { ja: '物理学 — 19 世紀以降の科学的記述', en: 'Physics — scientific description, post-19th century', es: 'Física — descripción científica', ko: '물리학 — 과학적 기술', pt: 'Física — descrição científica', de: 'Physik — wissenschaftliche Beschreibung' },
    representation: '261.6  329.6  392.0',
    description: { ja: '空気の振動数で音を完全に特定できる。電子音楽・物理音響学の言語。', en: 'Air vibration frequency uniquely specifies a pitch. The language of electronic music and acoustics.', es: 'La frecuencia identifica una altura. Lenguaje de música electrónica y acústica.', ko: '공기 진동 주파수로 음 완전 특정. 전자 음악과 음향학의 언어.', pt: 'Frequência identifica unicamente a altura. Linguagem da música eletrônica.', de: 'Schwingungsfrequenz definiert die Tonhöhe eindeutig. Sprache der elektronischen Musik.' },
  },
];

// ─────────────────────────────────────────────────────────────
// Layer 3 フラッシュカード
// ─────────────────────────────────────────────────────────────
const FLASHCARDS: { q: L6; a: L6 }[] = [
  {
    q: { ja: '記譜法はなぜ存在するのか?', en: 'Why does musical notation exist?', es: '¿Por qué existe la notación musical?', ko: '음악 기보법은 왜 존재하는가?', pt: 'Por que existe a notação musical?', de: 'Warum existiert Musiknotation?' },
    a: { ja: '音楽は聴覚の芸術だが、書記化することで (a) 記憶に頼らず再現できる、(b) 記譜法を学んだ誰もが教師なしで作品にアクセスできる、(c) 細部を記録できる、という利点が生まれる。', en: 'Music is an auditory art, but notation provides (a) reproduction without memorization, (b) access without a teacher for anyone who knows the system, (c) preservation of details that might otherwise be forgotten.', es: 'La música es arte auditivo; la notación permite reproducción sin memorizar, acceso sin profesor, conservación de detalles.', ko: '음악은 청각 예술이지만 기보는 (a) 기억에 의존하지 않는 재현, (b) 교사 없는 접근, (c) 세부의 보존을 가능하게 한다.', pt: 'A música é arte auditiva; a notação permite reprodução sem memorizar, acesso sem professor, preservação de detalhes.', de: 'Musik ist Hörkunst; Notation ermöglicht Reproduktion ohne Auswendiglernen, Zugang ohne Lehrer, Bewahrung von Details.' },
  },
  {
    q: { ja: '西洋五線譜は世界で唯一正しい記譜法か?', en: 'Is Western staff notation the one correct system?', es: '¿Es el pentagrama el único sistema correcto?', ko: '서양 오선보가 유일하게 올바른 기보법인가?', pt: 'A pauta ocidental é o único sistema correto?', de: 'Ist die westliche Notenschrift das einzig richtige System?' },
    a: { ja: 'いいえ。世界には Sargam (インド)、工尺譜 (中国)、数字譜、階名、日本式音名など、無数の記譜システムが存在する。それぞれの文化が、伝えたい音楽の特徴を最も正確に書き留められるよう設計してきた。「正しい」記譜法は、伝えたい内容と社会的文脈によって変わる。', en: 'No. Sargam (India), Gongche (China), numbered notation, solfège, Japanese names, and many more systems exist worldwide. Each culture designs notation to best capture what its music values. The "right" notation depends on what you want to communicate and your social context.', es: 'No. Existen Sargam, Gongche, cifra, solfeo, nombres japoneses y muchos más. Cada cultura diseña su notación según lo que su música valora.', ko: '아니다. Sargam (인도), 工尺譜 (중국), 숫자보, 계명, 일본식 음명 등 다양한 기보가 존재한다. 각 문화가 가치 있는 것을 가장 정확히 기록하도록 설계해 왔다.', pt: 'Não. Existem Sargam, Gongche, cifra numérica, solfejo, nomes japoneses, e muitos outros. Cada cultura desenha sua notação.', de: 'Nein. Sargam, Gongche, Ziffern, Solmisation, japanische Namen — jede Kultur entwirft Notation, um zu erfassen, was ihrer Musik wichtig ist.' },
  },
  {
    q: { ja: '記譜法と「翻訳」の類似性は?', en: 'How is notation similar to translation?', es: '¿En qué se parece la notación a la traducción?', ko: '기보와 번역의 유사성은?', pt: 'Como a notação se assemelha à tradução?', de: 'Wie ähnelt Notation einer Übersetzung?' },
    a: { ja: '言語の翻訳と同様、音から記号への「翻訳」も完全には不可能である。何を伝えるかを選び、何を諦めるかを決める。これは創作的判断であり、書き手の社会的文脈と価値観を反映する。', en: 'Like language translation, notation is never perfect — you choose what to convey and what to leave out. This is a creative judgment that reflects the writer\'s social context and values.', es: 'Como traducir entre lenguas, la notación nunca es perfecta — eliges qué transmitir y qué dejar fuera. Es un juicio creativo.', ko: '언어 번역과 마찬가지로 기보도 완벽할 수 없다 — 무엇을 전할지, 무엇을 버릴지 선택한다. 작가의 가치관이 반영된 창조적 판단.', pt: 'Como traduzir línguas, a notação nunca é perfeita — você escolhe o que transmitir. É um juízo criativo.', de: 'Wie Sprachübersetzung ist Notation nie perfekt — man wählt, was übermittelt wird. Eine schöpferische Entscheidung.' },
  },
  {
    q: { ja: 'なぜこのレッスンは「西洋」記譜法と限定するのか?', en: 'Why does this lesson specify "Western" notation?', es: '¿Por qué especifica "occidental"?', ko: '왜 "서양" 으로 한정하는가?', pt: 'Por que especifica "ocidental"?', de: 'Warum „westliche" Notation?' },
    a: { ja: '私たちが学ぶのは特定の文化が育てた一つのシステムだから。「音楽記譜法」と一般化せず、「西洋音楽記譜法」と限定することで、これが歴史的・文化的選択であることを明示する。他の文化の記譜法も同等に存在価値がある。', en: 'Because we are learning one specific culturally-developed system. Specifying "Western" rather than generalizing as "music notation" makes clear this is a historical and cultural choice. Other cultures\' systems are equally valid.', es: 'Porque aprendemos un sistema cultural específico. Decir "occidental" hace explícito que es una elección histórica.', ko: '특정 문화가 발전시킨 한 시스템을 배우기 때문. "서양"이라 한정함으로써 역사적·문화적 선택임을 명시한다.', pt: 'Porque aprendemos um sistema culturalmente específico. "Ocidental" deixa claro que é uma escolha histórica.', de: 'Weil wir ein kulturell spezifisches System lernen. „Westlich" macht klar: Es ist eine historische Wahl.' },
  },
  {
    q: { ja: '記譜法を学ぶ意味は?', en: 'What is the value of learning notation?', es: '¿Cuál es el valor de aprender notación?', ko: '기보를 배우는 의미는?', pt: 'Qual o valor de aprender notação?', de: 'Was bringt das Erlernen von Notation?' },
    a: { ja: 'その記譜法を共有する音楽家・作曲家のすべての作品にアクセスできるようになる。Bach・Mozart・Beethoven・武満徹・Coltrane・坂本龍一 — 西洋記譜法を学べば、彼ら全員と直接対話できる。記譜法は、時代と国境を超えて広がる音楽家の共同体への招待状である。', en: 'You gain access to every work by composers and musicians who share the system. Bach, Mozart, Beethoven, Toru Takemitsu, Coltrane, Ryuichi Sakamoto — by learning Western notation, you can converse with all of them directly. Notation is an invitation to a community of musicians across time and borders.', es: 'Accedes a todas las obras de compositores que comparten el sistema. Bach, Mozart, Coltrane, Sakamoto — la notación es una invitación a una comunidad transnacional.', ko: '그 기보를 공유하는 모든 음악가의 작품에 접근할 수 있게 된다. 바흐, 모차르트, 콜트레인, 사카모토 — 기보는 시대와 국경을 넘는 음악가 공동체로의 초대장.', pt: 'Você acessa toda obra de compositores que compartilham o sistema. Bach, Coltrane, Sakamoto — a notação é convite para uma comunidade transnacional.', de: 'Sie erhalten Zugang zu allen Werken von Komponisten, die das System teilen. Bach, Coltrane, Sakamoto — Notation ist eine Einladung in eine grenzüberschreitende Gemeinschaft.' },
  },
];

// ─────────────────────────────────────────────────────────────
// メイン
// ─────────────────────────────────────────────────────────────
type PyodideState = 'idle' | 'loading' | 'ready' | 'failed';

export default function LessonM1L01() {
  const { lang } = useLang();
  const [pyodideState, setPyodideState] = useState<PyodideState>('idle');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const startedRef = useRef(false);

  // Bravura
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const styleId = 'kuon-bravura-face';
    if (!document.getElementById(styleId)) {
      const s = document.createElement('style');
      s.id = styleId;
      s.textContent = `@font-face { font-family: 'Bravura'; src: url('/fonts/Bravura.woff2') format('woff2'); font-display: swap; }`;
      document.head.appendChild(s);
    }
  }, []);

  // Pyodide background load
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (window.__kuonPyodide) {
      setPyodideState('ready');
      return;
    }
    setPyodideState('loading');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js';
    script.async = true;
    script.onload = async () => {
      try {
        if (!window.loadPyodide) throw new Error('loadPyodide not available');
        const pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/' });
        window.__kuonPyodide = pyodide;
        setPyodideState('ready');
      } catch {
        setPyodideState('failed');
      }
    };
    script.onerror = () => setPyodideState('failed');
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>

      {/* パンくず + タイトル */}
      <div style={{
        maxWidth: 880, margin: '0 auto',
        padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2rem)',
      }}>
        <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, letterSpacing: '0.05em', marginBottom: '1.4rem' }}>
          <Link href="/theory" style={{ color: INK_SOFT, textDecoration: 'none' }}>
            ← {t({ ja: '目次へ戻る', en: 'Back to contents', es: 'Volver al índice', ko: '목차로', pt: 'Voltar', de: 'Zum Inhalt' }, lang)}
          </Link>
        </div>
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.28em', marginBottom: '0.7rem' }}>
          M1 · LESSON 01
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(1.85rem, 4.5vw, 2.85rem)',
          fontWeight: 400, letterSpacing: '0.04em', lineHeight: 1.4, margin: 0, color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '西洋音楽記譜法の導入',
            en: 'Introduction to Western Musical Notation',
            es: 'Introducción a la notación musical occidental',
            ko: '서양 음악 기보법의 도입',
            pt: 'Introdução à notação musical ocidental',
            de: 'Einführung in die westliche Musiknotation',
          }, lang)}
        </h1>
      </div>

      {/* ═══════ Layer 1: STORY ═══════ */}
      <section style={{
        maxWidth: 720, margin: '0 auto',
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)',
      }}>
        <LayerLabel num="I" name={t({ ja: '物語', en: 'Story', es: 'Historia', ko: '이야기', pt: 'História', de: 'Geschichte' }, lang)} />
        <div style={{
          fontFamily: serif, fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
          color: INK, lineHeight: 2.05, letterSpacing: '0.03em',
          wordBreak: 'keep-all' as const,
        }}>
          <p style={{ margin: '0 0 1.6rem 0', whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `音楽は耳の芸術です。
時間の中で消えていく振動を、紙の上に書き留めようとした人々が、千年前にいました。
記譜法とは、聴こえた音を見える記号に「翻訳」する試みです。`,
              en: `Music is an art of the ear.
A thousand years ago, certain people tried to capture vibrations that vanish in time on the surface of paper.
Notation is the attempt to translate what is heard into what can be seen.`,
              es: `La música es arte del oído.
Hace mil años, algunas personas intentaron capturar las vibraciones que desaparecen en el tiempo sobre el papel.
La notación es el intento de traducir lo oído en lo visible.`,
              ko: `음악은 귀의 예술입니다.
천 년 전, 시간 속에서 사라지는 진동을 종이 위에 적으려는 사람들이 있었습니다.
기보법은 들리는 것을 보이는 기호로 "번역"하는 시도입니다.`,
              pt: `A música é uma arte do ouvido.
Há mil anos, certas pessoas tentaram capturar vibrações que desaparecem no tempo sobre o papel.
A notação é a tentativa de traduzir o ouvido em algo visível.`,
              de: `Musik ist eine Kunst des Ohres.
Vor tausend Jahren versuchten Menschen, in der Zeit verschwindende Schwingungen auf Papier festzuhalten.
Notation ist der Versuch, Gehörtes in Sichtbares zu übersetzen.`,
            }, lang)}
          </p>
          <p style={{ margin: '0 0 1.6rem 0', whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `しかし翻訳は完璧にはなりません。
言語の翻訳が直訳できないように、音楽記譜も「すべての音」を書き留めることはできない。
書き手は何を伝えるか、何を諦めるかを選ぶ — それは創造的判断です。
何を残すかは、その文化が音楽に何を求めてきたかを映します。`,
              en: `But translation is never perfect.
Just as language cannot be translated word-for-word, neither can music capture every detail of sound.
The writer chooses what to convey and what to leave out — a creative judgment.
What is preserved reflects what that culture has come to value in music.`,
              es: `Pero la traducción nunca es perfecta.
Como las lenguas no se traducen palabra por palabra, la notación tampoco captura cada detalle del sonido.
El escritor elige qué transmitir y qué dejar fuera — un juicio creativo.
Lo que se preserva refleja lo que esa cultura valora en la música.`,
              ko: `그러나 번역은 결코 완벽하지 않습니다.
언어가 단어 그대로 번역될 수 없듯, 기보도 모든 소리의 세부를 담을 수 없습니다.
작가는 무엇을 전할지, 무엇을 버릴지 선택합니다 — 창조적 판단.
남기는 것은 그 문화가 음악에서 가치 있다고 여겨온 것을 반영합니다.`,
              pt: `Mas a tradução nunca é perfeita.
Assim como as línguas não se traduzem palavra por palavra, a notação não captura todo detalhe do som.
O escritor escolhe o que transmitir — um juízo criativo.
O que se preserva reflete o que aquela cultura valoriza.`,
              de: `Doch keine Übersetzung ist je perfekt.
Wie Sprachen nicht Wort für Wort übertragen werden können, kann auch Notation nicht jedes Detail des Klangs erfassen.
Der Schreibende wählt, was zu übermitteln ist — eine schöpferische Entscheidung.
Was bewahrt wird, spiegelt, was diese Kultur an der Musik wertschätzt.`,
            }, lang)}
          </p>
          <p style={{ margin: '0 0 1.6rem 0', whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `世界には、西洋五線譜の他にも数多くの記譜システムがあります。
インドのサルガム、中国の工尺譜、日本のイロハ音名、固定ド階名、数字譜、周波数記述。
それぞれが、その文化が大切にしてきた音楽の側面を最も精確に書き留めるよう、人々の手で形作られてきた。
「正しい」記譜法は一つではなく、伝えたい音楽と社会的文脈によって最適な選択が変わります。`,
              en: `Many systems of musical notation exist beyond Western staff.
Indian sargam, Chinese gongche, Japanese iroha names, fixed-do solfège, numbered notation, frequency description.
Each was shaped by people to most precisely record what their culture cherishes about music.
There is no single "right" notation — the best choice depends on what you want to communicate and your social context.`,
              es: `Existen muchos sistemas de notación más allá del pentagrama occidental.
Sargam indio, gongche chino, iroha japonés, solfeo fijo, cifra numérica, frecuencia.
Cada uno fue moldeado para capturar lo que su cultura valora.
No hay una única notación "correcta" — la mejor elección depende del contexto.`,
              ko: `세계에는 서양 오선보 외에도 많은 기보 체계가 있습니다.
인도의 사르감, 중국의 공척보, 일본의 이로하 음명, 고정도, 숫자보, 주파수 기술.
각각은 그 문화가 음악에서 소중히 여기는 면을 가장 정확히 적도록 형성되어 왔습니다.
"올바른" 기보는 하나가 아니며, 전하고 싶은 내용과 사회적 문맥에 따라 최선이 달라집니다.`,
              pt: `Existem muitos sistemas de notação além da pauta ocidental.
Sargam indiano, gongche chinês, iroha japonês, solfejo fixo, cifra numérica, frequência.
Cada um foi moldado para registrar o que sua cultura valoriza.
Não há uma única notação "correta" — a melhor escolha depende do contexto.`,
              de: `Neben der westlichen Notenschrift existieren viele Notationssysteme.
Indisches Sargam, chinesisches Gongche, japanisches Iroha, festes do, Ziffernnotation, Frequenzbeschreibung.
Jedes wurde geformt, um das festzuhalten, was seine Kultur an der Musik schätzt.
Es gibt keine einzig „richtige" Notation — die beste Wahl hängt vom Kontext ab.`,
            }, lang)}
          </p>
          <p style={{ margin: 0, whiteSpace: 'pre-line' as const }}>
            {t({
              ja: `では、なぜ私たちは西洋音楽記譜法を学ぶのか?
それは、Bach、Mozart、Beethoven、武満徹、Coltrane、坂本龍一 — この記譜法を共有してきた音楽家たち全員と直接対話できるようになるためです。
記譜法を学ぶことは、時代と国境を超えて広がる音楽家の共同体への、招待状を受け取ることに似ています。`,
              en: `Why, then, do we learn Western musical notation?
Because doing so opens direct conversation with every musician who has shared this system — Bach, Mozart, Beethoven, Toru Takemitsu, Coltrane, Ryuichi Sakamoto.
Learning notation is something like receiving an invitation into a community of musicians that stretches across time and borders.`,
              es: `¿Por qué, entonces, aprendemos la notación occidental?
Porque te abre el diálogo directo con todo músico que ha compartido este sistema — Bach, Mozart, Coltrane, Sakamoto.
Aprender notación es como recibir una invitación a una comunidad de músicos a través del tiempo y las fronteras.`,
              ko: `그렇다면 왜 서양 기보법을 배우는가?
그 기보를 공유해 온 모든 음악가 — 바흐, 모차르트, 베토벤, 다케미츠, 콜트레인, 사카모토 — 와 직접 대화할 수 있게 되기 때문입니다.
기보법을 배우는 것은, 시대와 국경을 넘는 음악가 공동체로의 초대장을 받는 것과 비슷합니다.`,
              pt: `Por que, então, aprender a notação ocidental?
Porque ela abre o diálogo direto com todo músico que compartilhou esse sistema — Bach, Mozart, Coltrane, Sakamoto.
Aprender notação é como receber um convite para uma comunidade que atravessa tempo e fronteiras.`,
              de: `Warum lernen wir also westliche Notation?
Weil sie den direkten Dialog mit jedem Musiker eröffnet, der dieses System teilt — Bach, Mozart, Beethoven, Takemitsu, Coltrane, Sakamoto.
Notation zu lernen, ist wie eine Einladung in eine Gemeinschaft von Musikern, die Zeit und Grenzen überspannt.`,
            }, lang)}
          </p>

          {/* 前方参照 */}
          <aside style={{
            marginTop: 'clamp(1.5rem, 3vw, 2rem)',
            padding: 'clamp(0.9rem, 2vw, 1.2rem) clamp(1.1rem, 2.5vw, 1.5rem)',
            background: PAPER_DEEP,
            border: `1px solid ${STAFF_LINE_COLOR}`,
            borderLeft: `2px solid ${ACCENT_INDIGO}`,
            borderRadius: 4,
            fontFamily: serif,
            fontSize: '0.88rem',
            color: INK_SOFT,
            lineHeight: 1.85,
            letterSpacing: '0.02em',
            whiteSpace: 'pre-line' as const,
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: `※ 次のレッスン M1-02 から M1-04 では、実際の五線譜の書き方 (音符・符尾・連桁の描き方) を学びます。
本レッスンでは「記譜法とは何か」「なぜ存在するか」を理解することが目的です — 記号の暗記ではなく、その意味を捉えること。`,
              en: `Note: in lessons M1-02 through M1-04, we'll learn the practical writing of staff notation (note shapes, stems, beams).
This lesson aims at understanding what notation is and why it exists — grasping meaning, not memorizing symbols.`,
              es: `Nota: en las lecciones M1-02 a M1-04 aprenderemos la escritura práctica del pentagrama.
Esta lección busca entender qué es la notación y por qué existe — captar el significado, no memorizar símbolos.`,
              ko: `※ 다음 레슨 M1-02 부터 M1-04 에서는 실제 오선보 쓰기 (음표·기둥·꼬리) 를 배웁니다.
이 레슨에서는 "기보법이란 무엇인가" "왜 존재하는가" 를 이해하는 것이 목적입니다.`,
              pt: `Nota: nas lições M1-02 a M1-04 aprenderemos a escrita prática da pauta.
Esta lição busca entender o que é a notação e por que existe.`,
              de: `Hinweis: In den Lektionen M1-02 bis M1-04 lernen wir die praktische Schreibweise der Notenschrift.
Diese Lektion zielt darauf, zu verstehen, was Notation ist und warum sie existiert.`,
            }, lang)}
          </aside>
        </div>
      </section>

      {/* ═══════ Layer 2: LIVING SCORE ═══════ */}
      <section style={{
        background: '#fff',
        borderTop: `1px solid ${STAFF_LINE_COLOR}`,
        borderBottom: `1px solid ${STAFF_LINE_COLOR}`,
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <LayerLabel num="II" name={t({ ja: 'Living Score (同じ音楽を 8 つの記譜で見る・聴く)', en: 'Living Score (the same music in 8 notation systems)', es: 'Living Score (8 sistemas)', ko: 'Living Score (8 가지 기보)', pt: 'Living Score (8 sistemas)', de: 'Living Score (acht Notationssysteme)' }, lang)} />
          <PyodideBadge state={pyodideState} lang={lang} />

          <p style={{ fontFamily: serif, fontStyle: 'italic', color: INK_SOFT, marginBottom: '1.5rem', lineHeight: 1.85, whiteSpace: 'pre-line' as const, wordBreak: 'keep-all' as const }}>
            {t({
              ja: `下の 8 つのカードはすべて、同じ 3 音のメロディー (do-mi-sol = C-E-G の上行) を表しています。
任意のカードをクリックすると、メロディーが鳴ります。
記号の見た目は違っても、聴こえる音は同じ — これが「翻訳」の証拠です。`,
              en: `All eight cards below represent the same three-note melody (do-mi-sol = C-E-G ascending).
Click any card to hear the melody.
The symbols differ, but the sound is the same — proof of "translation."`,
              es: `Las 8 tarjetas representan la misma melodía de 3 notas (do-mi-sol).
Toca cualquiera para oírla.
Los símbolos cambian, pero el sonido es el mismo — prueba de la "traducción."`,
              ko: `아래 8 개 카드는 모두 같은 3 음 멜로디 (do-mi-sol).
어느 카드든 클릭하면 멜로디가 울립니다.
기호는 다르지만 소리는 같다 — "번역" 의 증거.`,
              pt: `Os 8 cartões abaixo representam a mesma melodia de 3 notas.
Clique em qualquer um para ouvi-la.
Os símbolos diferem, mas o som é igual — prova da "tradução."`,
              de: `Alle acht Karten unten zeigen dieselbe Drei-Ton-Melodie (do-mi-sol).
Klicken Sie auf eine Karte, um sie zu hören.
Die Symbole sind verschieden, der Klang gleich — Beweis der „Übersetzung".`,
            }, lang)}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))',
            gap: 'clamp(0.9rem, 2vw, 1.2rem)',
          }}>
            {NOTATION_SYSTEMS.map(s => (
              <button
                key={s.id}
                onClick={() => playMelody()}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: PAPER,
                  border: `1px solid ${hoveredId === s.id ? INK : STAFF_LINE_COLOR}`,
                  borderRadius: 4,
                  padding: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                  textAlign: 'left' as const,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: '0.7rem',
                }}
              >
                <div style={{
                  fontFamily: sans,
                  fontSize: '0.7rem',
                  color: INK_FAINT,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                }}>
                  {t({ ja: '記譜法', en: 'System', es: 'Sistema', ko: '기보법', pt: 'Sistema', de: 'System' }, lang)}
                </div>
                <h3 style={{
                  fontFamily: serif,
                  fontSize: 'clamp(1rem, 1.7vw, 1.15rem)',
                  fontWeight: 500,
                  color: INK,
                  margin: 0,
                  letterSpacing: '0.03em',
                  lineHeight: 1.4,
                  wordBreak: 'keep-all' as const,
                }}>
                  {t(s.name, lang)}
                </h3>
                {s.id === 'staff' ? (
                  // CLAUDE.md §51 五線譜正確性ルール準拠 — 本物の SVG 楽譜で C-E-G を描画
                  <div style={{
                    padding: '0.6rem 0',
                    borderTop: `1px solid ${STAFF_LINE_COLOR}`,
                    borderBottom: `1px solid ${STAFF_LINE_COLOR}`,
                    display: 'flex',
                    justifyContent: 'center' as const,
                    alignItems: 'center' as const,
                  }}>
                    <StaffMiniSvg />
                  </div>
                ) : (
                  <div style={{
                    fontFamily: s.id === 'frequency' || s.id === 'numbers' ? mono : serif,
                    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                    color: ACCENT_INDIGO,
                    letterSpacing: '0.08em',
                    lineHeight: 1.2,
                    padding: '0.4rem 0',
                    borderTop: `1px solid ${STAFF_LINE_COLOR}`,
                    borderBottom: `1px solid ${STAFF_LINE_COLOR}`,
                    textAlign: 'center' as const,
                  }}>
                    {s.representation}
                  </div>
                )}
                <div style={{
                  fontFamily: sans,
                  fontSize: '0.7rem',
                  color: INK_FAINT,
                  fontStyle: 'italic' as const,
                  letterSpacing: '0.04em',
                  lineHeight: 1.6,
                }}>
                  {t(s.origin, lang)}
                </div>
                <p style={{
                  fontFamily: serif,
                  fontSize: '0.85rem',
                  color: INK_SOFT,
                  lineHeight: 1.75,
                  margin: 0,
                  letterSpacing: '0.02em',
                  wordBreak: 'keep-all' as const,
                }}>
                  {t(s.description, lang)}
                </p>
                <div style={{
                  fontFamily: sans,
                  fontSize: '0.72rem',
                  color: ACCENT_GOLD,
                  letterSpacing: '0.05em',
                  marginTop: '0.3rem',
                }}>
                  ♪ {t({ ja: 'クリックで再生', en: 'Click to play', es: 'Clic para reproducir', ko: '클릭하여 재생', pt: 'Clique para tocar', de: 'Zum Abspielen klicken' }, lang)}
                </div>
              </button>
            ))}
          </div>

          {/* OMT v2 章末課題: Inventing a Notation System */}
          <div style={{
            marginTop: 'clamp(2rem, 4vw, 3rem)',
            padding: 'clamp(1.4rem, 2.5vw, 1.8rem)',
            background: PAPER_DEEP,
            border: `1px solid ${STAFF_LINE_COLOR}`,
            borderLeft: `2px solid ${ACCENT_GOLD}`,
            borderRadius: 4,
          }}>
            <div style={{ fontFamily: mono, fontSize: '0.7rem', color: ACCENT_GOLD, letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginBottom: '0.7rem', fontWeight: 600 }}>
              {t({ ja: '思考実験', en: 'Thought Experiment', es: 'Experimento mental', ko: '사고 실험', pt: 'Experimento mental', de: 'Gedankenexperiment' }, lang)}
            </div>
            <h3 style={{ fontFamily: serif, fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', fontWeight: 500, color: INK, margin: '0 0 0.9rem 0', letterSpacing: '0.03em', lineHeight: 1.5, wordBreak: 'keep-all' as const }}>
              {t({
                ja: 'あなたなら、自分の好きな曲をどう書き留めますか?',
                en: 'How would you notate your favorite song?',
                es: '¿Cómo anotarías tu canción favorita?',
                ko: '당신은 좋아하는 곡을 어떻게 기록하시겠습니까?',
                pt: 'Como você anotaria sua música favorita?',
                de: 'Wie würden Sie Ihr Lieblingslied notieren?',
              }, lang)}
            </h3>
            <p style={{ fontFamily: serif, fontSize: '0.92rem', color: INK_SOFT, lineHeight: 1.95, margin: 0, letterSpacing: '0.02em', whiteSpace: 'pre-line' as const, wordBreak: 'keep-all' as const }}>
              {t({
                ja: `OMT v2 第 1 章 (Chelsey Hamm 著) の章末課題から。
1. その曲の最も重要な音楽的特徴は何ですか? 重要でない特徴は?
2. あなたが書き留めるのはどの特徴ですか? 諦めるのは?
3. 別の曲だったら、答えは変わりますか?
4. 自分の記譜システムを誰かに説明するなら、どう伝えますか?

これに答えを書く必要はありません。考えることそのものが、Bach がコラールを記譜したとき、Coltrane がモードを記述したときに彼らがしていた選択を理解する第一歩です。`,
                en: `From the chapter-end exercise in OMT v2 Chapter 1 (by Chelsey Hamm).
1. What are the most important musical features of the work? What are the less important features?
2. Which features would you write down? Which would you leave out?
3. Would your answers change for a different song?
4. How would you explain your notation system to someone else?

You don't need to write down answers. Just thinking through these questions is the first step toward understanding the choices Bach made when he notated his chorales, or Coltrane made when he described his modes.`,
                es: `Del ejercicio del Cap. 1 de OMT v2 (por Chelsey Hamm).
1. ¿Cuáles son las características más importantes de la obra? ¿Las menos?
2. ¿Cuáles anotarías? ¿Cuáles dejarías fuera?
3. ¿Cambiarían tus respuestas para otra canción?
4. ¿Cómo explicarías tu sistema a otra persona?

No necesitas escribir respuestas — pensarlo es el primer paso para entender las elecciones de Bach o Coltrane.`,
                ko: `OMT v2 1 장 (Chelsey Hamm 저) 의 장말 과제.
1. 그 곡의 가장 중요한 음악적 특징은? 덜 중요한 특징은?
2. 당신이 기록할 특징은? 버릴 특징은?
3. 다른 곡이라면 답이 달라지는가?
4. 당신의 기보 시스템을 어떻게 설명하겠는가?

답을 적을 필요는 없습니다. 생각하는 것 자체가 첫걸음입니다.`,
                pt: `Do exercício do Cap. 1 do OMT v2 (Chelsey Hamm).
1. Quais as características mais importantes? Menos importantes?
2. Quais você anotaria? Quais deixaria fora?
3. Suas respostas mudam para outra música?
4. Como você explicaria seu sistema?

Você não precisa escrever respostas — pensar é o primeiro passo.`,
                de: `Aus der Aufgabe von OMT v2 Kapitel 1 (Chelsey Hamm).
1. Welche musikalischen Merkmale sind am wichtigsten? Welche weniger wichtig?
2. Welche würden Sie aufschreiben? Welche weglassen?
3. Würden sich die Antworten bei einem anderen Lied ändern?
4. Wie würden Sie Ihr System erklären?

Sie müssen keine Antworten aufschreiben — das Nachdenken selbst ist der erste Schritt.`,
              }, lang)}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ Layer 3: MEMORY ═══════ */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <LayerLabel num="III" name={t({ ja: '記憶 (フラッシュカード)', en: 'Memory (Flashcards)', es: 'Memoria (Tarjetas)', ko: '기억 (플래시카드)', pt: 'Memória (Cartões)', de: 'Erinnern (Karten)' }, lang)} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '0.9rem' }}>
          {FLASHCARDS.map((c, i) => <FlashcardItem key={i} card={c} lang={lang} />)}
        </div>
      </section>

      {/* ═══════ RELATED KUON TOOLS ═══════ */}
      <section style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) 0' }}>
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.22em', textTransform: 'uppercase' as const, marginBottom: '1.2rem' }}>
          {t({ ja: '関連するツール', en: 'Related tools', es: 'Herramientas relacionadas', ko: '관련 도구', pt: 'Ferramentas relacionadas', de: 'Verwandte Werkzeuge' }, lang)}
        </div>
        <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.9rem', color: INK_SOFT, lineHeight: 1.85, margin: '0 0 1.4rem 0' }}>
          {t({
            ja: '記譜法を「読む」段階に入るのは次のレッスンから。実際のツールで体感を深めることもできます。',
            en: 'In the next lesson we begin actually reading notation. The tools below can deepen your experience.',
            es: 'En la próxima lección empezamos a leer notación. Las herramientas profundizan la experiencia.',
            ko: '다음 레슨에서 기보를 실제로 읽기 시작합니다.',
            pt: 'Na próxima lição começamos a ler notação. As ferramentas aprofundam.',
            de: 'In der nächsten Lektion beginnen wir, Notation zu lesen.',
          }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.9rem' }}>
          <RelatedTool href="/sight-reading-lp" title="KUON SIGHT READING" desc={t({
            ja: '譜読み訓練。譜表上のランダムな音をすぐに識別する反射神経を鍛える。',
            en: 'Sight-reading drills. Build the reflex to name pitches on the staff instantly.',
            es: 'Lectura a primera vista. Reflejos para identificar notas.',
            ko: '시창 훈련. 오선상 음을 즉시 식별.',
            pt: 'Leitura à primeira vista. Identificar notas instantaneamente.',
            de: 'Blattlesen. Tonhöhen sofort benennen.',
          }, lang)} />
          <RelatedTool href="/classical-lp" title="KUON CLASSICAL ANALYSIS" desc={t({
            ja: 'Bach・Mozart・Beethoven の本物の楽譜を music21 で自動分析。記譜法を学んだ後、実物に触れる入口。',
            en: 'Real Bach, Mozart, Beethoven scores analyzed by music21. The bridge from notation theory to real works.',
            es: 'Análisis automático de Bach, Mozart, Beethoven con music21.',
            ko: '바흐·모차르트·베토벤 실제 악보를 music21 로 자동 분석.',
            pt: 'Partituras de Bach, Mozart, Beethoven analisadas com music21.',
            de: 'Echte Bach-, Mozart-, Beethoven-Partituren mit music21 analysiert.',
          }, lang)} />
          <RelatedTool href="/tuner-lp" title="KUON TUNER PRO" desc={t({
            ja: '高精度チューナー。「周波数」記譜の世界を、実楽器・実声で体感する。',
            en: 'High-precision tuner. Experience the "frequency" notation world with real instruments and voice.',
            es: 'Afinador de alta precisión. Vive la notación por frecuencia.',
            ko: '고정밀 튜너. 주파수 기보의 세계를 실감.',
            pt: 'Afinador de alta precisão. Viva a notação por frequência.',
            de: 'Präzisions-Stimmgerät. Erleben Sie die Frequenz-Notation.',
          }, lang)} />
        </div>
      </section>

      {/* ═══════ FOOTER NAV ═══════ */}
      <footer style={{
        maxWidth: 880, margin: '0 auto',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)',
        borderTop: `1px solid ${STAFF_LINE_COLOR}`,
        marginTop: 'clamp(2rem, 5vw, 4rem)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '1rem' }}>
          <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, letterSpacing: '0.04em' }}>
            {t({ ja: 'M1 楽典基礎 · Lesson 1 / 60', en: 'M1 Fundamentals · Lesson 1 / 60', es: 'M1 Fundamentos · Lección 1 / 60', ko: 'M1 악전 기초 · 레슨 1 / 60', pt: 'M1 Fundamentos · Lição 1 / 60', de: 'M1 Grundlagen · Lektion 1 / 60' }, lang)}
          </div>
          <Link href="/theory" style={{
            fontFamily: sans, fontSize: '0.85rem', color: INK,
            textDecoration: 'none', padding: '0.7rem 1.4rem',
            border: `1px solid ${INK}`, borderRadius: 999, letterSpacing: '0.06em',
          }}>
            {t({ ja: '目次へ戻る', en: 'Back to contents', es: 'Volver', ko: '목차로', pt: 'Voltar', de: 'Zum Inhalt' }, lang)}
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 共通サブコンポーネント
// ─────────────────────────────────────────────────────────────
function LayerLabel({ num, name }: { num: string; name: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: '0.85rem',
      marginBottom: 'clamp(1.4rem, 3vw, 1.8rem)',
      paddingBottom: '0.7rem', borderBottom: `1px solid ${STAFF_LINE_COLOR}`,
    }}>
      <span style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 2.5vw, 1.7rem)', color: ACCENT_GOLD, letterSpacing: '0.04em', lineHeight: 1 }}>{num}</span>
      <span style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, letterSpacing: '0.18em', textTransform: 'uppercase' as const, fontWeight: 600 }}>{name}</span>
    </div>
  );
}

function PyodideBadge({ state, lang }: { state: PyodideState; lang: Lang }) {
  const messages: Record<PyodideState, L6> = {
    idle: { ja: '', en: '' },
    loading: { ja: '音楽環境を準備中…', en: 'Preparing the music environment…', es: 'Preparando…', ko: '음악 환경 준비 중…', pt: 'Preparando…', de: 'Vorbereitung…' },
    ready: { ja: '✓ 準備完了', en: '✓ Ready', es: '✓ Listo', ko: '✓ 준비 완료', pt: '✓ Pronto', de: '✓ Bereit' },
    failed: { ja: '基本機能で動作中', en: 'Running with core features', es: 'Funciones básicas', ko: '기본 기능', pt: 'Funções básicas', de: 'Mit Kernfunktionen' },
  };
  const message = t(messages[state], lang);
  if (!message) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      fontFamily: mono, fontSize: '0.68rem',
      color: state === 'ready' ? ACCENT_INDIGO : INK_FAINT,
      letterSpacing: '0.08em', marginBottom: '1.4rem',
      padding: '0.3rem 0.85rem',
      background: state === 'ready' ? `${ACCENT_INDIGO}10` : PAPER_DEEP,
      borderRadius: 999,
    }}>
      {state === 'loading' && <PulseDot />}
      <span>{message}</span>
    </div>
  );
}

function PulseDot() {
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
      background: INK_FAINT, animation: 'kuonPulse 1.4s ease-in-out infinite',
    }}>
      <style>{`@keyframes kuonPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>
    </span>
  );
}

function FlashcardItem({ card, lang }: { card: { q: L6; a: L6 }; lang: Lang }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button onClick={() => setFlipped(f => !f)} style={{
      background: flipped ? PAPER_DEEP : '#fff',
      border: `1px solid ${STAFF_LINE_COLOR}`, borderRadius: 4,
      padding: 'clamp(1.2rem, 2.5vw, 1.5rem)', cursor: 'pointer',
      textAlign: 'left' as const, fontFamily: serif, fontSize: '0.92rem',
      color: INK, lineHeight: 1.85, letterSpacing: '0.02em',
      transition: 'all 0.3s ease', minHeight: 120,
      display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-start' as const,
    }}>
      <div style={{ fontFamily: mono, fontSize: '0.65rem', color: INK_FAINT, letterSpacing: '0.16em', textTransform: 'uppercase' as const, marginBottom: '0.7rem' }}>
        {flipped ? t({ ja: '答え', en: 'Answer', es: 'Respuesta', ko: '답', pt: 'Resposta', de: 'Antwort' }, lang) : t({ ja: '問い', en: 'Question', es: 'Pregunta', ko: '질문', pt: 'Pergunta', de: 'Frage' }, lang)}
      </div>
      <div style={{ wordBreak: 'keep-all' as const, whiteSpace: 'pre-line' as const }}>
        {flipped ? t(card.a, lang) : t(card.q, lang)}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// StaffMiniSvg — 西洋五線譜カード用ミニ譜表
// CLAUDE.md §51 五線譜正確性ルール準拠
// C4 (中央ハ・加線 1 本) → E4 (第 1 線) → G4 (第 2 線) を treble clef で描画
// ─────────────────────────────────────────────────────────────
function StaffMiniSvg() {
  const W = 220, H = 80;
  const STAFF_TOP = 22;
  const GAP = 7;

  // 全音階ステップ (C0=0, D0=1, ..., B0=6, C1=7, ...)
  const diatonicStep = (midi: number): number => {
    const octave = Math.floor(midi / 12);
    const pc = midi % 12;
    const map: Record<number, number> = { 0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 };
    return octave * 7 + (map[pc] ?? 0);
  };

  // MIDI → Y 座標: B4 (= MIDI 71) を譜表中央線 (3rd line) に対応
  const midiToY = (midi: number): number => {
    const middleLine = STAFF_TOP + 2 * GAP;
    const stepFromB4 = diatonicStep(midi) - diatonicStep(71);
    return middleLine - stepFromB4 * (GAP / 2);
  };

  // 描画する 3 音 (do-mi-sol = C4-E4-G4)
  const NOTES = [60, 64, 67];
  const X_POSITIONS = [110, 150, 190];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 220 }}>
      {/* 5 staff lines */}
      {[0, 1, 2, 3, 4].map(i => (
        <line
          key={i}
          x1={45} x2={W - 12}
          y1={STAFF_TOP + i * GAP} y2={STAFF_TOP + i * GAP}
          stroke={STAFF_LINE_COLOR}
          strokeWidth={1}
        />
      ))}

      {/* Treble clef (Bravura SMuFL U+E050) */}
      <text
        x={15}
        y={STAFF_TOP + 2 * GAP + 14}
        fontFamily="Bravura, serif"
        fontSize={GAP * 4}
        fill={ACCENT_INDIGO}
      >
        {String.fromCodePoint(0xE050)}
      </text>

      {/* 3 noteheads with proper positions */}
      {NOTES.map((midi, i) => {
        const cx = X_POSITIONS[i];
        const cy = midiToY(midi);
        const needsLedger = midi === 60; // C4 = ledger line below staff
        return (
          <g key={midi}>
            {needsLedger && (
              <line
                x1={cx - 9} x2={cx + 9}
                y1={cy} y2={cy}
                stroke={ACCENT_INDIGO}
                strokeWidth={1.2}
              />
            )}
            <ellipse
              cx={cx} cy={cy}
              rx={GAP * 0.85} ry={GAP * 0.6}
              fill={ACCENT_INDIGO}
              transform={`rotate(-20 ${cx} ${cy})`}
            />
          </g>
        );
      })}
    </svg>
  );
}

function RelatedTool({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        background: '#fff', border: `1px solid ${STAFF_LINE_COLOR}`, borderRadius: 4,
        padding: 'clamp(1.1rem, 2vw, 1.4rem)', height: '100%',
        transition: 'all 0.25s ease', cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = INK; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = STAFF_LINE_COLOR; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{ fontFamily: sans, fontSize: '0.78rem', fontWeight: 600, color: INK, letterSpacing: '0.06em', marginBottom: '0.55rem' }}>{title}</div>
        <p style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, lineHeight: 1.7, margin: 0, letterSpacing: '0.01em' }}>{desc}</p>
        <div style={{ fontFamily: sans, fontSize: '0.7rem', color: ACCENT_INDIGO, marginTop: '0.85rem', letterSpacing: '0.04em' }}>{'→'}</div>
      </div>
    </Link>
  );
}
