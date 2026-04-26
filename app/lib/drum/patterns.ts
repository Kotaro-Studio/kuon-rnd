// ─────────────────────────────────────────────
// KUON DRUM MACHINE — Pattern Library (MVP: 40 patterns)
// ─────────────────────────────────────────────
// 各パターンに「歴史的背景・楽典解説・代表曲・推奨 BPM」を併記。
// 巷のドラムマシンには絶対に真似できない教育次元。
// 6 言語対応 (ja/en/es 詳細・ko/pt/de 簡略)。
//
// 軸:
//   tracks[trackIdx][stepIdx] = true なら打点
//   accents[trackIdx][stepIdx] = true ならアクセント (+音量)
//
// MVP は 4/4 主軸 + 3/4・5/4・7/8 を一部含む (差別化)
// ─────────────────────────────────────────────

import type { Lang } from '@/context/LangContext';
import type { KitId } from './kits';

export type L5 = Partial<Record<Lang, string>> & { en: string };

export type TimeSignature = '4/4' | '3/4' | '5/4' | '7/4' | '5/8' | '7/8' | '12/8';

export type Pattern = {
  id: string;
  name: L5;
  culture:
    | 'western' | 'cuban' | 'brazilian' | 'argentinian' | 'spanish'
    | 'westafrican' | 'indian' | 'middleeastern' | 'balkan'
    | 'jamaican' | 'japanese' | 'korean' | 'gamelan';
  genre: string;
  defaultKit: KitId;
  bpmRange: [number, number];
  defaultBpm: number;
  timeSignature: TimeSignature;
  steps: number;            // 16, 12, 14, 20 等
  swing: number;            // 0-75
  tracks: boolean[][];      // 8 voices × steps
  accents?: boolean[][];    // 8 voices × steps
  description: L5;          // 歴史・文化背景
  educationalNotes: L5;     // 楽典解説
  examples?: { artist: string; song: string }[];
  difficulty: 1 | 2 | 3 | 4 | 5;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const _ = false;
const X = true;

// 全 8 トラック × N ステップを空にする
function emptyTracks(steps: number): boolean[][] {
  return Array.from({ length: 8 }, () => Array(steps).fill(false));
}

// 1 ライナー記法でトラックを定義
//   "X-X-X-X-X-X-X-X-" → 16 ステップ
function row(s: string): boolean[] {
  return s.split('').map((c) => c === 'X');
}

// パターンのトラックを 8 行のテキストから組み立て
function P(rows: string[]): boolean[][] {
  if (rows.length !== 8) {
    throw new Error(`Pattern requires exactly 8 rows, got ${rows.length}`);
  }
  return rows.map(row);
}

// ─────────────────────────────────────────────
// PATTERN LIBRARY
// 行順は kit の voices と一致 (slot 0 = Kick, 1 = Snare, ...)
// ─────────────────────────────────────────────

export const PATTERNS: Pattern[] = [
  // ═══════════════════════════════════════════
  // 1. STANDARD (Western Pop / Rock / EDM) — 12 patterns
  // ═══════════════════════════════════════════
  {
    id: 'rock-basic-4',
    name: { ja: 'ロック・ベーシック', en: 'Rock Basic', es: 'Rock Básico', ko: '기본 록', pt: 'Rock Básico', de: 'Rock Basic' },
    culture: 'western', genre: 'rock', defaultKit: 'standard',
    bpmRange: [80, 160], defaultBpm: 120,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 1,
    tracks: P([
      'X-------X-------',  // Kick
      '----X-------X---',  // Snare
      'X-X-X-X-X-X-X-X-',  // CH
      '________________',  // OH
      '________________',  // Clap
      '________________',  // Tom Low
      '________________',  // Cowbell
      '________________',  // Rim
    ].map(s => s.replace(/_/g, '-'))),
    description: {
      ja: '4 拍子ロックの最も基本的なパターン。1・3 拍にキック、2・4 拍にスネア、8 分でハイハット。1960 年代以降のポピュラー音楽の土台。',
      en: 'The most basic 4/4 rock pattern. Kick on 1 & 3, snare on 2 & 4 (the "backbeat"), 8th-note hi-hats. The foundation of popular music since the 1960s.',
      es: 'El patrón básico de rock en 4/4. Bombo en 1 y 3, caja en 2 y 4 (backbeat), corcheas en hi-hat. Base de la música popular desde los 60.',
      ko: '4/4 록의 가장 기본 패턴. 1·3박 킥, 2·4박 스네어, 8분 하이햇.',
      pt: 'O padrão básico de rock 4/4. Bumbo em 1 e 3, caixa em 2 e 4, colcheias no chimbal.',
      de: 'Das grundlegendste 4/4-Rock-Pattern. Kick auf 1 und 3, Snare auf 2 und 4, Achtel-Hi-Hat.',
    },
    educationalNotes: {
      ja: '2 拍目と 4 拍目のスネアを「バックビート」と呼び、これが体を揺らすグルーヴの源。実際にはスネアを微妙に遅らせると「レイドバック」した感じになる。',
      en: 'The snare on beats 2 & 4 is called the "backbeat" — the source of body-moving groove. In practice, slightly delaying the snare creates a "laid-back" feel.',
      es: 'La caja en los tiempos 2 y 4 es el "backbeat" — el origen del groove. Retrasarla ligeramente crea un feel "laid-back".',
      ko: '2·4박 스네어가 "백비트". 살짝 늦추면 레이드백 그루브.',
      pt: 'A caixa em 2 e 4 é o "backbeat" — origem do groove.',
      de: 'Snare auf 2 und 4 ist der "Backbeat" — Quelle des Grooves.',
    },
    examples: [
      { artist: 'AC/DC', song: 'Back in Black' },
      { artist: 'The Beatles', song: 'Come Together' },
    ],
  },
  {
    id: 'rock-pop-half',
    name: { ja: 'ポップ・ハーフタイム', en: 'Pop Half-Time', es: 'Pop Medio Tiempo', ko: '팝 하프타임', pt: 'Pop Meio Tempo', de: 'Pop Halbtakt' },
    culture: 'western', genre: 'pop', defaultKit: 'standard',
    bpmRange: [70, 100], defaultBpm: 85,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 2,
    tracks: P([
      'X-------X-X-----',
      '--------X-------',
      'X-X-X-X-X-X-X-X-',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: 'ハーフタイム感覚のポップス。スネアを 3 拍目だけにすることで、テンポは速くても体感はゆったりする。R&B やインディーポップで頻出。',
      en: 'Half-time pop feel. Snare only on beat 3 makes a fast tempo feel relaxed. Common in R&B and indie pop.',
      es: 'Sensación de medio tiempo. Caja solo en el tiempo 3.',
      ko: '하프타임 느낌. 3박에만 스네어.',
      pt: 'Sensação de meio tempo. Caixa só no tempo 3.',
      de: 'Halbtakt-Gefühl. Snare nur auf Schlag 3.',
    },
    educationalNotes: {
      ja: 'ハーフタイムは「拍数は同じだがアクセントが半分の頻度」になる感覚。ロック→ハーフタイムの切替は曲展開で頻用される (例: ブリッジ部)。',
      en: 'Half-time = same BPM but accents at half frequency. Switching to half-time during bridges adds emotional weight.',
      es: 'Medio tiempo: mismo BPM, acentos a mitad de frecuencia.',
      ko: '하프타임: 같은 BPM, 절반 빈도의 액센트.',
      pt: 'Meio tempo: mesmo BPM, acentos pela metade.',
      de: 'Halbtakt: gleiche BPM, halbe Akzentfrequenz.',
    },
    examples: [{ artist: 'Billie Eilish', song: 'bad guy' }],
  },
  {
    id: 'rock-driving',
    name: { ja: 'ロック・ドライビング 8 分', en: 'Driving Eighth Rock', es: 'Rock 8vos', ko: '드라이빙 8분 록', pt: 'Rock 8as', de: 'Driving 8tel Rock' },
    culture: 'western', genre: 'rock', defaultKit: 'standard',
    bpmRange: [120, 180], defaultBpm: 140,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 1,
    tracks: P([
      'X-X-X-X-X-X-X-X-',
      '----X-------X---',
      'X-X-X-X-X-X-X-X-',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: 'パンク・ハードロックの基本。キックを 8 分連打で「前進感」を生む。',
      en: 'Punk / hard rock essential. Eighth-note kick creates forward momentum.',
      es: 'Esencial del punk/hard rock. Bombo en 8vos crea impulso.',
      ko: '펑크·하드록 기본. 8분 킥의 추진력.',
      pt: 'Punk/hard rock. Bumbo em 8as cria impulso.',
      de: 'Punk/Hard Rock. Achtel-Kick treibt vorwärts.',
    },
    educationalNotes: {
      ja: 'キック 8 分連打はベースラインと一致しやすく、「ウォール・オブ・サウンド」を作る。',
      en: 'Eighth-note kicks lock with bass for a "wall of sound" effect.',
      es: 'Bombo en 8vos se sincroniza con el bajo.',
      ko: '8분 킥이 베이스와 동기화.',
      pt: 'Bumbo em 8as alinha com baixo.',
      de: 'Achtel-Kicks synchron zum Bass.',
    },
    examples: [{ artist: 'The Ramones', song: 'Blitzkrieg Bop' }],
  },
  {
    id: 'disco-classic',
    name: { ja: 'ディスコ', en: 'Disco', es: 'Disco', ko: '디스코', pt: 'Disco', de: 'Disco' },
    culture: 'western', genre: 'disco', defaultKit: 'standard',
    bpmRange: [110, 130], defaultBpm: 120,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 2,
    tracks: P([
      'X---X---X---X---',
      '----X-------X---',
      '--X---X---X---X-',  // 裏拍ハイハット
      '--X---X---X---X-',  // オープンハットも裏に
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    accents: P([
      'X---X---X---X---',
      '----X-------X---',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: 'ディスコの 4 つ打ち + 裏拍オープンハット。1970 年代後半 NY のクラブから生まれた、世界の「ダンスミュージック」の原型。',
      en: 'Disco "four-on-the-floor" + offbeat open hi-hat. Born in late-70s NYC clubs, the prototype of all dance music.',
      es: 'Cuatro al piso disco + hi-hat abierto en contratiempo. Nacido en clubs neoyorquinos de fines de los 70.',
      ko: '디스코 4분 킥 + 오픈 햇 백비트.',
      pt: 'Bumbo em 4 + chimbal aberto em contratempo.',
      de: '4-on-the-floor + offene Hi-Hat auf Off-Beat.',
    },
    educationalNotes: {
      ja: '4 つ打ちキック + 裏拍オープンハットの組み合わせが「クラブのドライブ感」を作る。後の House / Techno / EDM の祖先。',
      en: 'Four-on-the-floor + offbeat open hat = club drive. Ancestor of House/Techno/EDM.',
      es: 'Patrón ancestro del House/Techno/EDM.',
      ko: 'House/Techno/EDM의 조상.',
      pt: 'Ancestral de House/Techno/EDM.',
      de: 'Vorfahre von House/Techno/EDM.',
    },
    examples: [
      { artist: 'Donna Summer', song: 'I Feel Love' },
      { artist: 'Bee Gees', song: 'Stayin\' Alive' },
    ],
  },
  {
    id: 'house-classic',
    name: { ja: 'ハウス', en: 'House', es: 'House', ko: '하우스', pt: 'House', de: 'House' },
    culture: 'western', genre: 'house', defaultKit: 'standard',
    bpmRange: [118, 130], defaultBpm: 124,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 2,
    tracks: P([
      'X---X---X---X---',
      '----X-------X---',
      '--X---X---X---X-',
      '----------------',
      '------X-X-------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: '1980 年代シカゴ発のハウスミュージック。ディスコを電子楽器で再構築し、世界の電子ダンスミュージックの基礎を築いた。',
      en: '1980s Chicago house music — disco reconstructed with electronics, the foundation of all electronic dance music.',
      es: 'House de Chicago de los 80 — disco reconstruido con electrónica.',
      ko: '시카고 하우스. 디스코의 전자적 재구성.',
      pt: 'House de Chicago. Disco reconstruído eletronicamente.',
      de: 'Chicago House. Disco elektronisch neu erfunden.',
    },
    educationalNotes: {
      ja: 'BPM 120-128 がスイートスポット。クラップを 16 分の裏に置く「ダブルハンド」が現代ハウスの定番。',
      en: 'BPM 120-128 is the sweet spot. "Double hand" claps on 16th offbeats is modern house signature.',
      es: 'BPM 120-128 es el punto óptimo.',
      ko: 'BPM 120-128가 최적.',
      pt: 'BPM 120-128 é o ideal.',
      de: 'BPM 120-128 ist der Sweet Spot.',
    },
    examples: [{ artist: 'Frankie Knuckles', song: 'Your Love' }],
  },
  {
    id: 'techno-driving',
    name: { ja: 'テクノ', en: 'Techno', es: 'Techno', ko: '테크노', pt: 'Techno', de: 'Techno' },
    culture: 'western', genre: 'techno', defaultKit: 'standard',
    bpmRange: [125, 145], defaultBpm: 135,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 2,
    tracks: P([
      'X---X---X---X---',
      '----X-------X---',
      'X-X-X-X-X-X-X-X-',
      '--X---X---X---X-',
      '----------------',
      '----------------',
      '----X---X---X---',
      '----------------',
    ]),
    description: {
      ja: 'デトロイト・ベルリン系テクノ。ハウスより速く、よりミニマルでハードな機械感。',
      en: 'Detroit/Berlin techno. Faster, more minimal and machine-like than house.',
      es: 'Techno de Detroit/Berlín. Más rápido y mecánico que el house.',
      ko: '디트로이트·베를린 테크노.',
      pt: 'Techno de Detroit/Berlim.',
      de: 'Detroit/Berliner Techno.',
    },
    educationalNotes: {
      ja: '人間味を消し、機械の反復美を追求するのがテクノの美学。BPM 130 前後のハードテクノが標準。',
      en: 'Removing humanity to celebrate machine repetition is techno\'s aesthetic. ~BPM 130 is standard hard techno.',
      es: 'Estética techno: belleza de la repetición mecánica.',
      ko: '기계적 반복미가 테크노 미학.',
      pt: 'Estética techno: beleza da repetição mecânica.',
      de: 'Techno-Ästhetik: Schönheit der maschinellen Wiederholung.',
    },
    examples: [{ artist: 'Jeff Mills', song: 'The Bells' }],
  },
  {
    id: 'dnb-amen-light',
    name: { ja: 'ドラムンベース', en: 'Drum & Bass', es: 'Drum & Bass', ko: '드럼앤베이스', pt: 'Drum & Bass', de: 'Drum & Bass' },
    culture: 'western', genre: 'dnb', defaultKit: 'standard',
    bpmRange: [165, 180], defaultBpm: 174,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 4,
    tracks: P([
      'X-----X---------',
      '----X-------X---',
      'X-X-X-X-X-X-X-X-',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '------X-------X-',
    ]),
    description: {
      ja: '1990 年代英国発の高速ブレイクビート。BPM 170-180 でのキック・スネア配置が独特。',
      en: '1990s UK high-tempo breakbeat. Distinctive kick/snare placement at BPM 170-180.',
      es: 'Breakbeat británico de alta velocidad de los 90.',
      ko: '90년대 영국 고속 브레이크비트.',
      pt: 'Breakbeat britânico dos anos 90.',
      de: 'Britischer High-Tempo-Breakbeat der 90er.',
    },
    educationalNotes: {
      ja: 'BPM 174 が標準だが、ベースラインのレベルは BPM 87 で感じる「ハーフタイム錯覚」が DnB の核心。',
      en: 'BPM 174 is standard, but bass is felt at BPM 87 — "half-time illusion" is DnB\'s core.',
      es: 'Sensación de medio tiempo en el bajo es la esencia.',
      ko: '하프타임 착각이 핵심.',
      pt: 'Ilusão de meio tempo na linha de baixo.',
      de: 'Halbtakt-Illusion im Bass ist das Wesentliche.',
    },
    examples: [{ artist: 'Goldie', song: 'Inner City Life' }],
  },

  // ═══════════════════════════════════════════
  // 2. JAZZ KIT (Jazz / Swing / Bossa Nova / Samba 風) — 8 patterns
  // ═══════════════════════════════════════════
  {
    id: 'jazz-swing-medium',
    name: { ja: 'ジャズ・スウィング (ミディアム)', en: 'Jazz Swing (Medium)', es: 'Jazz Swing Medio', ko: '재즈 스윙 (중)', pt: 'Jazz Swing Médio', de: 'Jazz Swing (mittel)' },
    culture: 'western', genre: 'jazz', defaultKit: 'jazz',
    bpmRange: [100, 180], defaultBpm: 130,
    timeSignature: '4/4', steps: 16, swing: 65, difficulty: 3,
    tracks: P([
      'X-------X-------',
      '----X-------X---',
      '----X-------X---',  // ハイハット 2・4 拍 (フット)
      'X--XX---X--XX---',  // ライド・スウィング 8 分
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: 'ジャズ・スウィングの王道リズム。ライドシンバルの「ジン・ジ・ジ・ジン」が核。スウィング比率 (8 分の長短) は実測で 1.6:1 程度。',
      en: 'Classic jazz swing. The ride cymbal "ding-da-ding" is core. Swing ratio measured ~1.6:1, not 2:1.',
      es: 'Jazz swing clásico. Ride "ding-da-ding". Ratio swing real ~1.6:1.',
      ko: '재즈 스윙. 라이드 "ding-da-ding".',
      pt: 'Jazz swing clássico. Ride "ding-da-ding".',
      de: 'Klassischer Jazz-Swing. Ride "ding-da-ding".',
    },
    educationalNotes: {
      ja: 'ハイハット (フット) は 2・4 拍に踏む。スウィング比率は厳密な 3:1 (三連譜記譜) ではなく、テンポによって変化する。テンポが速いほどストレート 8 分に近づく。',
      en: 'Hi-hat foot on 2 & 4. Swing ratio is NOT strictly 2:1 (triplet) — it varies with tempo, approaching straight 8ths at faster tempos.',
      es: 'Hi-hat con pie en 2 y 4. Ratio swing varía con tempo.',
      ko: '하이햇 풋이 2·4박. 스윙 비율은 템포에 따라 변동.',
      pt: 'Chimbal de pé em 2 e 4.',
      de: 'Hi-Hat-Fuß auf 2 und 4. Swing-Ratio variiert mit Tempo.',
    },
    examples: [
      { artist: 'Miles Davis', song: 'So What' },
      { artist: 'John Coltrane', song: 'Giant Steps' },
    ],
  },
  {
    id: 'jazz-bossa-nova',
    name: { ja: 'ボサノバ', en: 'Bossa Nova', es: 'Bossa Nova', ko: '보사노바', pt: 'Bossa Nova', de: 'Bossa Nova' },
    culture: 'brazilian', genre: 'bossa', defaultKit: 'jazz',
    bpmRange: [100, 140], defaultBpm: 120,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 2,
    tracks: P([
      'X---X-X-X---X-X-',  // キック (ボサ・パターン)
      '------X-------X-',  // クロスティックでクラベ近似
      'X-X-X-X-X-X-X-X-',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      'X-X---X-X-X---X-',  // クロスティック
    ]),
    description: {
      ja: '1958 年ブラジル発祥。ジョアン・ジルベルトのギターパターンとセットになるドラム。クロスティックでクラベを刻む。',
      en: 'Born 1958 in Brazil. Drum pattern paired with João Gilberto\'s guitar. Cross-stick plays clave-like figure.',
      es: 'Nacida en Brasil 1958. Patrón con guitarra de João Gilberto.',
      ko: '1958년 브라질 발상.',
      pt: 'Nascida no Brasil em 1958.',
      de: '1958 in Brasilien geboren.',
    },
    educationalNotes: {
      ja: 'キックの「3-3-2」または「3-3-4-3-3」のリズムがハバネラ系の名残。サンバよりはるかにシンプルで穏やか。',
      en: 'The kick\'s "3-3-2" or "3-3-4-3-3" rhythm reflects habanera roots. Much simpler and gentler than samba.',
      es: 'Ritmo "3-3-2" del bombo refleja raíces de habanera.',
      ko: '킥 "3-3-2" 리듬이 하바네라의 흔적.',
      pt: 'Ritmo "3-3-2" do bumbo reflete raízes da habanera.',
      de: '"3-3-2"-Rhythmus zeigt Habanera-Wurzeln.',
    },
    examples: [
      { artist: 'João Gilberto', song: 'The Girl from Ipanema' },
      { artist: 'Antonio Carlos Jobim', song: 'Wave' },
    ],
  },
  {
    id: 'jazz-samba-fast',
    name: { ja: 'サンバ (ジャズ・フィーリング)', en: 'Samba (Jazz feel)', es: 'Samba (sensación jazz)', ko: '삼바 (재즈 감각)', pt: 'Samba (jazz)', de: 'Samba (Jazz-Feel)' },
    culture: 'brazilian', genre: 'samba', defaultKit: 'jazz',
    bpmRange: [100, 200], defaultBpm: 140,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 3,
    tracks: P([
      'X-X-X-X-X-X-X-X-',  // 16 分キック (サンバの「サパテアド」)
      '----X---X---X---',
      'X-X-X-X-X-X-X-X-',
      '----------------',
      '----------------',
      '------X-X---X-X-',  // タムでスルド代用
      '----------------',
      '--X---X-X---X-X-',
    ]),
    description: {
      ja: 'リオのカーニバル発祥。本来はスルド (低音太鼓) + タンボリン + パンデイロのアンサンブルだが、ジャズキットで近似。',
      en: 'Born from Rio Carnival. Originally surdo + tamborim + pandeiro ensemble, here approximated with jazz kit.',
      es: 'Nacida del Carnaval de Río.',
      ko: '리우 카니발 발상.',
      pt: 'Nascida do Carnaval do Rio.',
      de: 'Aus dem Karneval von Rio.',
    },
    educationalNotes: {
      ja: 'サンバの「2 拍子感」が本質。記譜は 4/4 でも実際は 2 拍子で感じる。ボサノバとの違いはテンポ・密度・パッション。',
      en: 'Samba is felt in 2 (cut time). Difference from bossa: tempo, density, passion.',
      es: 'Samba se siente en 2.',
      ko: '삼바는 2박자로 느낌.',
      pt: 'Samba é sentido em 2.',
      de: 'Samba wird in 2 gefühlt.',
    },
  },
  {
    id: 'jazz-waltz',
    name: { ja: 'ジャズ・ワルツ', en: 'Jazz Waltz', es: 'Vals de Jazz', ko: '재즈 왈츠', pt: 'Valsa de Jazz', de: 'Jazz-Walzer' },
    culture: 'western', genre: 'jazz', defaultKit: 'jazz',
    bpmRange: [120, 200], defaultBpm: 160,
    timeSignature: '3/4', steps: 12, swing: 65, difficulty: 3,
    tracks: P([
      'X-----X-----',
      '------------',
      '----X---X---',
      'X---X-XX----',
      '------------',
      '------------',
      '------------',
      '------------',
    ]),
    description: {
      ja: 'ワルツの 3 拍子をスウィング感で叩く。ビル・エヴァンス「Waltz for Debby」が代表。',
      en: '3/4 waltz with jazz swing feel. Bill Evans\' "Waltz for Debby" is iconic.',
      es: 'Vals 3/4 con sensación jazz.',
      ko: '3/4 왈츠 + 재즈 스윙.',
      pt: 'Valsa 3/4 com swing jazz.',
      de: '3/4-Walzer mit Jazz-Swing.',
    },
    educationalNotes: {
      ja: 'ワルツでも 4 拍子のスウィング感を保つのが「ジャズらしさ」。ライドの 3 連符グルーピングがポイント。',
      en: 'Maintaining 4/4 swing feel within 3/4 is jazz-like. Triplet ride grouping is key.',
      es: 'Mantener swing 4/4 dentro de 3/4.',
      ko: '3/4 안에서 4/4 스윙 유지.',
      pt: 'Manter swing 4/4 dentro de 3/4.',
      de: 'Swing-Gefühl im 3/4 beibehalten.',
    },
    examples: [{ artist: 'Bill Evans', song: 'Waltz for Debby' }],
  },
  {
    id: 'jazz-shuffle',
    name: { ja: 'シャッフル', en: 'Shuffle', es: 'Shuffle', ko: '셔플', pt: 'Shuffle', de: 'Shuffle' },
    culture: 'western', genre: 'blues', defaultKit: 'jazz',
    bpmRange: [80, 140], defaultBpm: 100,
    timeSignature: '4/4', steps: 12, swing: 0, difficulty: 2,  // 12 ステップ = 4 拍 × 3 連
    tracks: P([
      'X--X--X--X--',
      '---X-----X--',
      'X--X--X--X--',
      '------------',
      '------------',
      '------------',
      '------------',
      '------------',
    ]),
    description: {
      ja: 'ブルース・シャッフル。8 分音符を 3 連符のグルーピングで叩く。テキサスブルースの定番。',
      en: 'Blues shuffle. 8th notes grouped as triplets. Texas blues staple.',
      es: 'Shuffle de blues. Corcheas en tresillos.',
      ko: '블루스 셔플. 8분이 셋잇단.',
      pt: 'Shuffle do blues.',
      de: 'Blues-Shuffle. 8tel als Triolen.',
    },
    educationalNotes: {
      ja: 'シャッフルは 12/8 で記譜することも多い。1 拍を 3 等分して「Da-da-Da-da-Da-da-Da-da」と感じる。',
      en: 'Often notated 12/8. Each beat = 3 subdivisions, felt as "Da-da-Da-da-Da-da-Da-da".',
      es: 'A menudo en 12/8. Cada tiempo = 3 subdivisiones.',
      ko: '12/8로 기보.',
      pt: 'Geralmente em 12/8.',
      de: 'Oft in 12/8 notiert.',
    },
    examples: [{ artist: 'Stevie Ray Vaughan', song: 'Pride and Joy' }],
  },

  // ═══════════════════════════════════════════
  // 3. FUNK KIT — 8 patterns
  // ═══════════════════════════════════════════
  {
    id: 'funk-james-brown',
    name: { ja: 'ファンク (JB スタイル)', en: 'Funk (JB Style)', es: 'Funk (estilo JB)', ko: '펑크 (JB 스타일)', pt: 'Funk (JB)', de: 'Funk (JB-Style)' },
    culture: 'western', genre: 'funk', defaultKit: 'funk',
    bpmRange: [90, 110], defaultBpm: 100,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 3,
    tracks: P([
      'X---X-X---X-----',
      '----X-------X---',
      'X-X-X-X-X-X-X-X-',
      '----------------',
      '----------------',
      '------X---X-----',
      '------X---X-----',
      '----------------',
    ]),
    accents: P([
      'X---------------',
      '----X-------X---',
      'X-------X-------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: 'ジェームス・ブラウンが 1960 年代後半に確立した「On the One」ファンク。1 拍目に強烈なアクセント。',
      en: 'James Brown\'s "On the One" funk, established in the late 1960s. Strong accent on beat 1.',
      es: 'Funk "On the One" de James Brown, finales de los 60.',
      ko: '제임스 브라운의 "On the One" 펑크.',
      pt: 'Funk "On the One" de James Brown.',
      de: 'James Browns "On the One"-Funk.',
    },
    educationalNotes: {
      ja: '従来の 2・4 拍アクセント (バックビート) ではなく、1 拍目を最重要視するのが JB ファンクの革命。これがヒップホップの DNA に流れ込んだ。',
      en: 'Instead of 2 & 4 backbeat, JB funk emphasizes beat 1 — a revolution that became hip-hop\'s DNA.',
      es: 'Énfasis en el tiempo 1 — revolución que entró al ADN del hip-hop.',
      ko: '1박 강조가 힙합 DNA에.',
      pt: 'Ênfase no tempo 1 — DNA do hip-hop.',
      de: 'Betonung auf Schlag 1 — Hip-Hop-DNA.',
    },
    examples: [
      { artist: 'James Brown', song: 'Funky Drummer' },
      { artist: 'James Brown', song: 'Cold Sweat' },
    ],
  },
  {
    id: 'funk-purdie-shuffle',
    name: { ja: 'パーディー・シャッフル', en: 'Purdie Shuffle', es: 'Purdie Shuffle', ko: '퍼디 셔플', pt: 'Purdie Shuffle', de: 'Purdie Shuffle' },
    culture: 'western', genre: 'funk', defaultKit: 'funk',
    bpmRange: [80, 120], defaultBpm: 100,
    timeSignature: '4/4', steps: 24, swing: 0, difficulty: 5,  // 4拍×6分割
    tracks: P([
      'X-----X-----X-----X-----',
      '------X-X---------X-X---',  // ゴーストノート + メイン
      'X-XX-XX-XXX-XX-XX-XX-X--',
      '------------------------',
      '------------------------',
      '------------------------',
      '------------------------',
      '------------------------',
    ]),
    description: {
      ja: '伝説のドラマー Bernard Purdie が作った最高難度シャッフル。スネアの「ゴーストノート」(微小音量) が決め手。',
      en: 'Legendary drummer Bernard Purdie\'s ultimate shuffle. Snare "ghost notes" (whisper-quiet hits) are the key.',
      es: 'Shuffle de Bernard Purdie. Notas fantasma en la caja.',
      ko: '버나드 퍼디의 셔플.',
      pt: 'Shuffle de Bernard Purdie.',
      de: 'Bernard Purdies Shuffle.',
    },
    educationalNotes: {
      ja: 'メインスネアの間にゴーストノートを潜ませる。トト「Rosanna」、スティーリー・ダン「Home at Last」で有名。',
      en: 'Ghost notes hidden between main snares. Famous in Toto "Rosanna" and Steely Dan "Home at Last".',
      es: 'Notas fantasma entre cajas principales.',
      ko: '메인 스네어 사이의 고스트 노트.',
      pt: 'Notas fantasma entre caixas principais.',
      de: 'Ghost Notes zwischen Haupt-Snares.',
    },
    examples: [
      { artist: 'Toto', song: 'Rosanna' },
      { artist: 'Steely Dan', song: 'Home at Last' },
    ],
  },
  {
    id: 'funk-clyde-stubblefield',
    name: { ja: 'ファンキー・ドラマー', en: 'Funky Drummer', es: 'Funky Drummer', ko: '펑키 드러머', pt: 'Funky Drummer', de: 'Funky Drummer' },
    culture: 'western', genre: 'funk', defaultKit: 'funk',
    bpmRange: [95, 110], defaultBpm: 102,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 4,
    tracks: P([
      'X---X---X---X---',
      '----X---X-X-X---',  // メインスネア + ゴースト
      'X-X-X-XXX-X-X-XX',  // 16 分ハット (一部 32 分風)
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: 'クライド・スタブルフィールドが叩いた、史上最もサンプリングされたドラムブレイク。ヒップホップ全体の母。',
      en: 'Clyde Stubblefield\'s most-sampled drum break in history. Mother of all hip-hop.',
      es: 'El break más sampleado de la historia.',
      ko: '역사상 가장 많이 샘플링.',
      pt: 'Break mais sampleado da história.',
      de: 'Meistgesampelter Drum Break der Geschichte.',
    },
    educationalNotes: {
      ja: '4 小節のループが完璧で、Public Enemy・LL Cool J・Run-DMC など何千曲でサンプリングされた。',
      en: 'Perfect 4-bar loop sampled in thousands of tracks (Public Enemy, LL Cool J, Run-DMC etc.).',
      es: 'Loop perfecto de 4 compases.',
      ko: '4마디 완벽한 루프.',
      pt: 'Loop perfeito de 4 compassos.',
      de: 'Perfekter 4-Takt-Loop.',
    },
  },
  {
    id: 'funk-second-line',
    name: { ja: 'セカンドライン', en: 'Second Line', es: 'Second Line', ko: '세컨드 라인', pt: 'Second Line', de: 'Second Line' },
    culture: 'western', genre: 'funk', defaultKit: 'funk',
    bpmRange: [85, 120], defaultBpm: 100,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 3,
    tracks: P([
      'X---X-X-X---X-X-',
      '----X-------X---',
      '----------------',
      '----------------',
      '------X-------X-',
      '------X-------X-',
      'X-X---X-X-X---X-',
      '----------------',
    ]),
    description: {
      ja: 'ニューオーリンズの葬列・パレードのリズム。アメリカ南部独自のシンコペーションが脈打つ。',
      en: 'New Orleans funeral parade rhythm. Distinctive Southern syncopation.',
      es: 'Ritmo de desfile de Nueva Orleans.',
      ko: '뉴올리언스 행진 리듬.',
      pt: 'Ritmo de desfile de Nova Orleans.',
      de: 'New-Orleans-Paradenrhythmus.',
    },
    educationalNotes: {
      ja: 'メリディース・ブラザーズなど、ジャズの根源にあるリズム。3-2 クラベ系のシンコペーションが特徴。',
      en: 'Root rhythm of jazz. Features 3-2 clave-style syncopation.',
      es: 'Ritmo raíz del jazz.',
      ko: '재즈의 뿌리 리듬.',
      pt: 'Ritmo raiz do jazz.',
      de: 'Wurzelrhythmus des Jazz.',
    },
  },

  // ═══════════════════════════════════════════
  // 4. TRAP KIT — 6 patterns
  // ═══════════════════════════════════════════
  {
    id: 'trap-classic',
    name: { ja: 'トラップ・クラシック', en: 'Trap Classic', es: 'Trap Clásico', ko: '트랩 클래식', pt: 'Trap Clássico', de: 'Trap Classic' },
    culture: 'western', genre: 'trap', defaultKit: 'trap',
    bpmRange: [60, 80], defaultBpm: 70,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 3,
    tracks: P([
      'X-------X---X---',
      '----X-------X---',
      'X-X-X-X-X-X-X-X-',  // 8 分ハット
      '------X---------',  // 16 分ロール
      '----------------',
      '------------X---',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: '2010 年代アトランタ発のトラップ。808 サブベース・スネアの遅延・ハットの 16/32 分ロールが定石。',
      en: '2010s Atlanta trap. 808 sub-bass, delayed snare, and 16th/32nd hat rolls.',
      es: 'Trap de Atlanta de los 2010s.',
      ko: '2010년대 애틀랜타 트랩.',
      pt: 'Trap de Atlanta dos anos 2010.',
      de: 'Atlanta-Trap der 2010er.',
    },
    educationalNotes: {
      ja: 'BPM は 60-80 だが、ハイハットの 16 分・32 分連打で「速さ感」を作る。ハーフタイム錯覚の極致。',
      en: 'BPM 60-80 but hi-hat 16th/32nd rolls create perceived speed. Ultimate half-time illusion.',
      es: 'BPM 60-80 pero hi-hat 16/32 crea velocidad percibida.',
      ko: 'BPM 60-80이지만 햇 16·32분이 속도감.',
      pt: 'BPM 60-80 mas chimbal 16/32 cria velocidade.',
      de: 'BPM 60-80 aber 16tel/32tel Hi-Hat erzeugt Geschwindigkeit.',
    },
    examples: [{ artist: 'Gucci Mane', song: 'Lemonade' }],
  },
  {
    id: 'trap-drill',
    name: { ja: 'ドリル', en: 'Drill', es: 'Drill', ko: '드릴', pt: 'Drill', de: 'Drill' },
    culture: 'western', genre: 'drill', defaultKit: 'trap',
    bpmRange: [60, 75], defaultBpm: 65,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 4,
    tracks: P([
      'X-X-----X---X---',
      '----X-------X---',
      'X-X-X-X-X-X-X-X-',
      '----X-X---X-----',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: 'シカゴ→UK→アトランタへ伝播したドリル。トラップよりさらに低速・ダーク。',
      en: 'Drill traveled Chicago → UK → Atlanta. Even slower and darker than trap.',
      es: 'Drill: Chicago → UK → Atlanta.',
      ko: '드릴: 시카고 → 영국 → 애틀랜타.',
      pt: 'Drill: Chicago → Reino Unido → Atlanta.',
      de: 'Drill: Chicago → UK → Atlanta.',
    },
    educationalNotes: {
      ja: 'スライディング 808 ベース + 不規則なスネア配置が UK ドリルの特徴。',
      en: 'Sliding 808 bass + irregular snare placement characterize UK drill.',
      es: 'Bajo 808 deslizante + caja irregular en UK drill.',
      ko: '슬라이딩 808 베이스 + 불규칙 스네어.',
      pt: 'Baixo 808 deslizante.',
      de: 'Gleitender 808-Bass + unregelmäßige Snare.',
    },
  },
  {
    id: 'trap-boom-bap',
    name: { ja: 'ブーン・バップ', en: 'Boom Bap', es: 'Boom Bap', ko: '붐 뱁', pt: 'Boom Bap', de: 'Boom Bap' },
    culture: 'western', genre: 'hip-hop', defaultKit: 'trap',
    bpmRange: [85, 100], defaultBpm: 92,
    timeSignature: '4/4', steps: 16, swing: 25, difficulty: 2,
    tracks: P([
      'X-------X-X-----',
      '----X-------X---',
      'X-X-X-X-X-X-X-X-',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: '90 年代ニューヨーク・ヒップホップの古典。「ブーン」(キック) と「バップ」(スネア) の対話。',
      en: '\'90s NYC hip-hop classic. "Boom" (kick) and "Bap" (snare) dialogue.',
      es: 'Hip-hop neoyorquino de los 90.',
      ko: '90년대 뉴욕 힙합.',
      pt: 'Hip-hop nova-iorquino dos 90.',
      de: '90er NYC-Hip-Hop.',
    },
    educationalNotes: {
      ja: 'スウィング 8 分 (25-30%) で「人間味」を残すのがブーン・バップの美学。完全に揃わない方が良い。',
      en: 'Swing 8ths (25-30%) preserve humanity. Imperfection is the boom-bap aesthetic.',
      es: 'Swing 25-30% preserva humanidad.',
      ko: '스윙 25-30%로 인간미.',
      pt: 'Swing 25-30% preserva humanidade.',
      de: '25-30% Swing für Menschlichkeit.',
    },
    examples: [
      { artist: 'A Tribe Called Quest', song: 'Can I Kick It?' },
      { artist: 'Nas', song: 'NY State of Mind' },
    ],
  },

  // ═══════════════════════════════════════════
  // 5. WORLD MUSIC PREVIEW (民族リズム先行公開) — 6 patterns
  // ═══════════════════════════════════════════
  {
    id: 'cuban-son-clave-32',
    name: { ja: 'ソン・クラベ 3-2', en: 'Son Clave 3-2', es: 'Clave de Son 3-2', ko: '손 클라베 3-2', pt: 'Clave de Son 3-2', de: 'Son-Clave 3-2' },
    culture: 'cuban', genre: 'son', defaultKit: 'standard',
    bpmRange: [90, 130], defaultBpm: 105,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 3,
    tracks: P([
      'X-----X---X-----',  // キック (テンバオ系)
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '------X-X-------',  // タムでコンガ近似
      '----------------',
      'X--X--X---X-X---',  // クロスティックでクラベ刻み (3-2)
    ]),
    description: {
      ja: 'キューバ音楽の根幹「クラベ」3-2 方向。最初の小節に 3 打、次の小節に 2 打。すべてのキューバ音楽 (ソン・サルサ・マンボ) の骨格。',
      en: 'The "clave" — backbone of Cuban music. 3-2 direction: 3 hits in first bar, 2 in second. Foundation of son, salsa, mambo.',
      es: 'La clave — columna vertebral de la música cubana.',
      ko: '쿠바 음악의 뿌리 클라베.',
      pt: 'Clave — coluna vertebral da música cubana.',
      de: 'Clave — Rückgrat der kubanischen Musik.',
    },
    educationalNotes: {
      ja: '3-2 と 2-3 はメロディと逆向きだと「クラベ・ターニング」と呼ばれ違和感を生む。曲の最初がどちらかを決めると、最後まで貫く。',
      en: '3-2 vs 2-3 must match melody direction — mismatched is "clave turning". Once chosen, you keep it for the whole song.',
      es: '3-2 vs 2-3 debe coincidir con la melodía.',
      ko: '3-2 vs 2-3는 멜로디 방향과 일치해야.',
      pt: '3-2 vs 2-3 deve combinar com melodia.',
      de: '3-2 vs 2-3 muss zur Melodie passen.',
    },
    examples: [{ artist: 'Buena Vista Social Club', song: 'Chan Chan' }],
  },
  {
    id: 'argentinian-tango',
    name: { ja: 'タンゴ (ハバネラ)', en: 'Tango (Habanera)', es: 'Tango (Habanera)', ko: '탱고 (하바네라)', pt: 'Tango (Habanera)', de: 'Tango (Habanera)' },
    culture: 'argentinian', genre: 'tango', defaultKit: 'standard',
    bpmRange: [55, 80], defaultBpm: 65,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 3,
    tracks: P([
      'X---X-X-X---X-X-',  // ハバネラ・リズム (付点 8 分 + 8 分 + 4 分)
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      'X---X---X---X---',  // クロスティックで拍頭
    ]),
    description: {
      ja: 'アルゼンチン・タンゴの土台「ハバネラ」リズム。19 世紀キューバから輸入され、ブエノスアイレスで進化。',
      en: 'Foundation of Argentine tango: the "Habanera" rhythm. Imported from 19th-century Cuba, evolved in Buenos Aires.',
      es: 'Base del tango: ritmo de habanera. Importado de Cuba del siglo XIX.',
      ko: '탱고의 토대 하바네라.',
      pt: 'Base do tango: ritmo de habanera.',
      de: 'Basis des Tangos: Habanera-Rhythmus.',
    },
    educationalNotes: {
      ja: '付点 8 分音符 + 8 分音符 + 4 分音符 + 4 分音符の 4 拍子パターン。バンドネオンと一体になって「タンゴの呼吸」を作る。',
      en: 'Dotted 8th + 8th + quarter + quarter pattern in 4/4. Combined with bandoneón breath, creates tango itself.',
      es: 'Patrón corchea con puntillo + corchea + 2 negras.',
      ko: '점8분+8분+2개4분 패턴.',
      pt: 'Padrão colcheia pontuada + colcheia + 2 semínimas.',
      de: 'Punktierte 8tel + 8tel + 2 Viertel.',
    },
    examples: [{ artist: 'Astor Piazzolla', song: 'Libertango' }],
  },
  {
    id: 'balkan-7-8',
    name: { ja: 'バルカン 7/8 (Lesnoto)', en: 'Balkan 7/8 (Lesnoto)', es: 'Balcánico 7/8', ko: '발칸 7/8', pt: 'Balcânico 7/8', de: 'Balkan 7/8 (Lesnoto)' },
    culture: 'balkan', genre: 'lesnoto', defaultKit: 'standard',
    bpmRange: [120, 180], defaultBpm: 150,
    timeSignature: '7/8', steps: 14, swing: 0, difficulty: 4,
    tracks: P([
      'X-----X---X---',   // 3+2+2 グルーピング
      '------X---X---',
      'X-X-X-X-X-X-X-',
      '--------------',
      '--------------',
      '--X-----------',
      '--------------',
      '--------------',
    ]),
    accents: P([
      'X-----X---X---',
      '--------------',
      '--------------',
      '--------------',
      '--------------',
      '--------------',
      '--------------',
      '--------------',
    ]),
    description: {
      ja: 'マケドニア・ブルガリアの伝統舞曲。7/8 を「3+2+2」または「2+2+3」で感じる。',
      en: 'Macedonian/Bulgarian traditional dance. 7/8 grouped as "3+2+2" or "2+2+3".',
      es: 'Danza tradicional macedonia/búlgara.',
      ko: '마케도니아·불가리아 전통.',
      pt: 'Dança tradicional macedônia/búlgara.',
      de: 'Mazedonisch/bulgarischer Traditionstanz.',
    },
    educationalNotes: {
      ja: '7/8 のグルーピングが文化圏で異なる: ブルガリア「Ruchenitsa」は 2+2+3、マケドニア「Lesnoto」は 3+2+2。アクセントの位置で踊りが変わる。',
      en: 'Grouping varies by region: Bulgarian Ruchenitsa = 2+2+3, Macedonian Lesnoto = 3+2+2. Accent position dictates the dance.',
      es: 'Agrupación varía por región.',
      ko: '지역별 그루핑 다름.',
      pt: 'Agrupamento varia por região.',
      de: 'Gruppierung variiert je nach Region.',
    },
  },
  {
    id: 'reggae-one-drop',
    name: { ja: 'レゲエ・ワンドロップ', en: 'Reggae One Drop', es: 'Reggae One Drop', ko: '레게 원 드롭', pt: 'Reggae One Drop', de: 'Reggae One Drop' },
    culture: 'jamaican', genre: 'reggae', defaultKit: 'standard',
    bpmRange: [60, 90], defaultBpm: 75,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 3,
    tracks: P([
      '--------X-------',  // キック 3 拍目だけ (ワンドロップ)
      '--------X-------',  // スネア 3 拍目 = キックと同時
      '--X---X---X---X-',  // 裏拍ハット
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    accents: P([
      '--------X-------',
      '--------X-------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
      '----------------',
    ]),
    description: {
      ja: 'ジャマイカ・レゲエの「ワンドロップ」。3 拍目にキックとスネアが同時 = 「ドロップ」。1 拍目を意図的に消す驚きのデザイン。',
      en: 'Jamaican reggae "one drop". Kick + snare simultaneously on beat 3 = "drop". Beat 1 intentionally absent — radical design.',
      es: 'Reggae jamaicano "one drop". Bombo + caja en tiempo 3.',
      ko: '자메이카 레게 원 드롭.',
      pt: 'Reggae jamaicano "one drop".',
      de: 'Jamaikanischer Reggae "One Drop".',
    },
    educationalNotes: {
      ja: 'ボブ・マーリー以降の世界レゲエ標準。1 拍目を消すことで「裏が表」になる感覚転換が起こる。',
      en: 'Standard since Bob Marley. Removing beat 1 inverts perception — offbeat becomes onbeat.',
      es: 'Estándar desde Bob Marley.',
      ko: '밥 말리 이후 표준.',
      pt: 'Padrão desde Bob Marley.',
      de: 'Standard seit Bob Marley.',
    },
    examples: [{ artist: 'Bob Marley', song: 'No Woman No Cry' }],
  },
  {
    id: 'flamenco-buleria',
    name: { ja: 'ブレリーア (フラメンコ)', en: 'Bulería (Flamenco)', es: 'Bulería', ko: '불레리아', pt: 'Bulería', de: 'Bulería' },
    culture: 'spanish', genre: 'flamenco', defaultKit: 'standard',
    bpmRange: [200, 260], defaultBpm: 230,
    timeSignature: '12/8', steps: 12, swing: 0, difficulty: 5,
    tracks: P([
      '--X---X-----',  // 12 拍中アクセント (3,6,8,10,12)
      '------------',
      '------------',
      '------------',
      'X-XX-XX-XX-X',  // パルマス (拍手)
      '------------',
      '------------',
      '------------',
    ]),
    accents: P([
      '--X---X-X-X-',
      '------------',
      '------------',
      '------------',
      '------------',
      '------------',
      '------------',
      '------------',
    ]),
    description: {
      ja: 'スペイン・アンダルシアのフラメンコ。12 拍を「3+3+2+2+2」でグルーピング。アクセントは 3-6-8-10-12 拍。',
      en: 'Andalusian flamenco. 12 beats grouped 3+3+2+2+2. Accents on 3-6-8-10-12.',
      es: 'Flamenco andaluz. 12 tiempos: 3+3+2+2+2.',
      ko: '안달루시아 플라멩코.',
      pt: 'Flamenco andaluz.',
      de: 'Andalusischer Flamenco.',
    },
    educationalNotes: {
      ja: 'カホン (木箱) + パルマス (手拍子) で叩く。「コンパス」と呼ばれるリズム周期で、フラメンコギター・歌・踊りすべての軸。',
      en: 'Played with cajón (box) + palmas (claps). The "compás" is the temporal axis for flamenco guitar/song/dance.',
      es: 'Tocado con cajón + palmas. El "compás" es el eje.',
      ko: '카혼 + 팔마스.',
      pt: 'Tocado com cajón + palmas.',
      de: 'Cajón + Palmas. "Compás" ist die Achse.',
    },
    examples: [{ artist: 'Paco de Lucía', song: 'Buleria' }],
  },
  {
    id: 'japanese-matsuri',
    name: { ja: '祭囃子 (お囃子)', en: 'Matsuri Bayashi', es: 'Matsuri Bayashi', ko: '마쓰리', pt: 'Matsuri', de: 'Matsuri Bayashi' },
    culture: 'japanese', genre: 'matsuri', defaultKit: 'standard',
    bpmRange: [100, 140], defaultBpm: 120,
    timeSignature: '4/4', steps: 16, swing: 0, difficulty: 3,
    tracks: P([
      'X---X---X---X---',  // 大太鼓
      'X-X-X-X-X-X-X-X-',  // 締太鼓 (8 分連)
      '----X---X---X---',
      '----------------',
      '----------------',
      '------X-------X-',
      'X---------------',
      '----------------',
    ]),
    description: {
      ja: '日本の祭囃子。大太鼓・締太鼓・鉦のアンサンブル。江戸時代から続く都市祭の音響。',
      en: 'Japanese festival music. Ensemble of o-daiko, shime-daiko, and kane bell. Edo-era urban festival sound.',
      es: 'Música de festival japonés.',
      ko: '일본 축제 음악.',
      pt: 'Música de festival japonês.',
      de: 'Japanische Festmusik.',
    },
    educationalNotes: {
      ja: '大太鼓 (おおだいこ) は土台、締太鼓 (しめだいこ) は装飾。地方ごとに無数のバリエーションがあり、阿波踊り・三社祭などが代表。',
      en: 'O-daiko = foundation, shime-daiko = decoration. Countless regional variations: Awa Odori, Sanja Matsuri, etc.',
      es: 'O-daiko base, shime-daiko ornamento.',
      ko: '오다이코 토대, 시메다이코 장식.',
      pt: 'O-daiko base, shime-daiko ornamento.',
      de: 'O-daiko Basis, shime-daiko Verzierung.',
    },
  },

  // ═══════════════════════════════════════════
  // 6. ODD METER PRACTICE (差別化の象徴) — 4 patterns
  // ═══════════════════════════════════════════
  {
    id: 'take-five-54',
    name: { ja: 'テイク・ファイブ風 5/4', en: 'Take Five Style 5/4', es: 'Estilo Take Five 5/4', ko: '테이크 파이브 5/4', pt: 'Take Five 5/4', de: 'Take Five 5/4' },
    culture: 'western', genre: 'jazz', defaultKit: 'jazz',
    bpmRange: [140, 180], defaultBpm: 170,
    timeSignature: '5/4', steps: 20, swing: 65, difficulty: 4,
    tracks: P([
      'X-------X-----------',
      '----X-----------X---',
      '----X---------------',
      'X--XX---X--XX---X--X',  // ライド・スウィング
      '--------------------',
      '--------------------',
      '--------------------',
      '--------------------',
    ]),
    description: {
      ja: 'デイヴ・ブルーベック「Take Five」(1959) の 5/4 拍子。ジャズで初めて変拍子を大衆化した名曲。',
      en: 'Dave Brubeck\'s "Take Five" (1959) — first jazz tune to popularize odd meter for mass audiences.',
      es: 'Dave Brubeck "Take Five" (1959).',
      ko: '데이브 브루벡 "Take Five".',
      pt: 'Dave Brubeck "Take Five".',
      de: 'Dave Brubecks "Take Five".',
    },
    educationalNotes: {
      ja: '5/4 を「3+2」でグルーピング。最初の 3 拍はワルツのように、次の 2 拍はマーチのように感じる。',
      en: '5/4 grouped 3+2. First 3 beats waltz-like, next 2 beats march-like.',
      es: '5/4 como 3+2.',
      ko: '5/4 = 3+2.',
      pt: '5/4 como 3+2.',
      de: '5/4 als 3+2.',
    },
    examples: [{ artist: 'Dave Brubeck Quartet', song: 'Take Five' }],
  },
  {
    id: 'pink-floyd-money-74',
    name: { ja: '7/4 (マネー風)', en: '7/4 (Money Style)', es: '7/4 (estilo Money)', ko: '7/4 (Money 스타일)', pt: '7/4 (Money)', de: '7/4 (Money Style)' },
    culture: 'western', genre: 'rock', defaultKit: 'standard',
    bpmRange: [110, 140], defaultBpm: 120,
    timeSignature: '7/4', steps: 14, swing: 0, difficulty: 4,
    tracks: P([
      'X-----X-------',
      '----X-----X---',
      'X-X-X-X-X-X-X-',
      '--------------',
      '--------------',
      '--------------',
      '--------------',
      '--------------',
    ]),
    description: {
      ja: 'ピンク・フロイド「Money」(1973) の 7/4 拍子。ロックで変拍子を大衆化した革新作。',
      en: 'Pink Floyd "Money" (1973) — popularized 7/4 in rock music.',
      es: 'Pink Floyd "Money" (1973).',
      ko: '핑크 플로이드 "Money".',
      pt: 'Pink Floyd "Money".',
      de: 'Pink Floyds "Money".',
    },
    educationalNotes: {
      ja: '7/4 は「4+3」または「3+4」でグルーピング。Money は「4+3」(キックが 1・5 拍)。',
      en: '7/4 = 4+3 or 3+4. Money uses 4+3 (kick on 1 & 5).',
      es: '7/4 = 4+3 o 3+4.',
      ko: '7/4 = 4+3 or 3+4.',
      pt: '7/4 = 4+3 ou 3+4.',
      de: '7/4 = 4+3 oder 3+4.',
    },
    examples: [{ artist: 'Pink Floyd', song: 'Money' }],
  },
  {
    id: 'odd-58',
    name: { ja: '5/8 (Mission Impossible 風)', en: '5/8 (Mission Impossible)', es: '5/8 (MI)', ko: '5/8', pt: '5/8', de: '5/8' },
    culture: 'western', genre: 'cinematic', defaultKit: 'standard',
    bpmRange: [140, 180], defaultBpm: 160,
    timeSignature: '5/8', steps: 10, swing: 0, difficulty: 4,
    tracks: P([
      'X-X-------',  // 3+2 グルーピング
      '------X---',
      'X-X-X-X-X-',
      '----------',
      '----------',
      '----------',
      '------X---',
      '----------',
    ]),
    description: {
      ja: 'ラロ・シフリン「Mission Impossible」(1966) の 5/4 が著名だが、ここでは速い 5/8 として扱う。',
      en: 'Lalo Schifrin\'s "Mission: Impossible" (1966) is famous in 5/4; here treated as fast 5/8.',
      es: 'Lalo Schifrin "Mission Impossible".',
      ko: '미션 임파서블.',
      pt: 'Mission Impossible.',
      de: 'Mission Impossible.',
    },
    educationalNotes: {
      ja: '5/8 は 3+2 か 2+3。3+2 だと「重→軽」の流れ、2+3 だと「軽→重」になる。',
      en: '5/8 = 3+2 or 2+3. 3+2 feels heavy→light, 2+3 feels light→heavy.',
      es: '5/8 = 3+2 o 2+3.',
      ko: '5/8 = 3+2 or 2+3.',
      pt: '5/8 = 3+2 ou 2+3.',
      de: '5/8 = 3+2 oder 2+3.',
    },
  },
  {
    id: 'odd-118',
    name: { ja: '11/8 (バルカン風)', en: '11/8 (Balkan Style)', es: '11/8 (Balcánico)', ko: '11/8', pt: '11/8', de: '11/8 (Balkan)' },
    culture: 'balkan', genre: 'kopanitsa', defaultKit: 'standard',
    bpmRange: [120, 180], defaultBpm: 150,
    timeSignature: '7/8', steps: 11, swing: 0, difficulty: 5,  // ステップ 11 (= 11/8)
    tracks: P([
      'X-----X---X',  // 2+2+3+2+2 グルーピング
      '----X-----X',
      'X-X-X-X-X-X',
      '-----------',
      '-----------',
      '--X--------',
      '-----------',
      '-----------',
    ]),
    description: {
      ja: 'ブルガリア「コパニツァ」舞曲の 11/8。「2+2+3+2+2」が伝統的グルーピング。',
      en: 'Bulgarian "Kopanitsa" dance in 11/8. Traditional grouping: 2+2+3+2+2.',
      es: 'Danza búlgara Kopanitsa 11/8.',
      ko: '불가리아 코파니차 11/8.',
      pt: 'Dança búlgara Kopanitsa 11/8.',
      de: 'Bulgarischer Kopanitsa-Tanz 11/8.',
    },
    educationalNotes: {
      ja: '11 拍を一気に数えるのではなく、グループ化された塊として体に入れる。「2-2-長-2-2」の歌い方が伝統。',
      en: 'Don\'t count 11 — feel the chunks. "Quick-quick-LONG-quick-quick" is the traditional internal singing.',
      es: 'Sentir los bloques, no contar 11.',
      ko: '11을 세지 말고 덩어리로 느끼기.',
      pt: 'Sentir blocos, não contar 11.',
      de: 'Blöcke fühlen, nicht 11 zählen.',
    },
  },
];

// ─────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────

export function getPatternsByCulture(culture: Pattern['culture']): Pattern[] {
  return PATTERNS.filter((p) => p.culture === culture);
}

export function getPatternsByGenre(genre: string): Pattern[] {
  return PATTERNS.filter((p) => p.genre === genre);
}

export function getPatternById(id: string): Pattern | undefined {
  return PATTERNS.find((p) => p.id === id);
}

export const PATTERN_COUNT = PATTERNS.length;
