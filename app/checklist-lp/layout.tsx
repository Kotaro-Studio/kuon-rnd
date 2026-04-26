import type { Metadata } from 'next';

const SITE_URL = 'https://kuon-rnd.com';
const PAGE_URL = `${SITE_URL}/checklist-lp`;

const KEYWORDS_JA = [
  // 高ボリューム汎用 (15)
  'チェックリストアプリ', '持ち物リスト', 'タスク管理', '本番準備',
  'リマインダーアプリ', 'TODOリスト', 'スマホ チェックリスト', '無料チェックリスト',
  'ガジェットリスト', '出かける前 確認', '忘れ物防止', 'パッキングリスト',
  '旅行 持ち物', 'イベント 準備', 'プロジェクト管理',
  // 中ボリューム用途別 (20)
  '本番 持ち物', 'コンサート 準備', '発表会 チェックリスト', 'リサイタル 当日',
  'ステージ 持ち物', 'ライブ 準備', '楽器 持ち物', '演奏会 持っていく',
  '楽屋 必需品', 'バックステージ 準備', '本番当日 ルーティン', 'パフォーマンス チェック',
  '楽器ケース 中身', '替えリード', '替え弦', 'チューナー 持参',
  '譜面 予備', '演奏服 チェック', '舞台衣装 確認', '黒服 演奏',
  // ロングテール音楽特化 (25)
  '音大生 本番準備', 'ヴァイオリン 本番 持ち物', 'ピアノ コンクール 持参',
  '管楽器 リード スペア', 'クラリネット リード', 'オーボエ リード 5枚',
  'フルート 本番', 'サックス 本番準備', 'トランペット バルブオイル',
  'チェロ 本番 必要', 'コントラバス 持ち物', 'ハープ 移動 準備',
  '声楽 本番 のど対策', 'ヴォーカル 本番 水', 'オペラ 楽屋 必需品',
  '指揮者 譜面台', '室内楽 本番 準備', '弦楽四重奏 持ち物', 'ピアノ三重奏 当日',
  '吹奏楽 大会 チェック', '合唱コンクール 当日', 'バンド ライブ 機材',
  'スタジオ録音 持ち物', 'リハーサル 持参', 'マスタークラス 持ち物',
  // 競合比較 (20)
  'Todoist 代替', 'Things 3 代替', 'TickTick 代わり', 'Microsoft To Do 代わり',
  'Google Keep 代替', 'Notion チェックリスト', 'Apple リマインダー 代替',
  'Any.do 代替', 'Trello チェックリスト', 'Asana 個人',
  'PackPoint 代替', 'TripList 代替', 'Wunderlist 後継',
  'SwitchBot リマインダー', 'Stockly 代替', 'GearChecklist 代替',
  'OmniFocus 個人', 'Evernote チェックリスト', 'Bear ノート 代替',
  'Reminders Watch 代替',
];

const KEYWORDS_EN = [
  'checklist app', 'packing list', 'task manager', 'pre-show checklist',
  'reminder app', 'TODO list', 'mobile checklist', 'free checklist',
  'gear list', 'pre-departure check', 'forgotten items prevention',
  'travel packing list', 'event preparation',
  'pre-performance checklist', 'concert prep', 'recital day checklist',
  'stage gear', 'live prep', 'instrument bag contents', 'backstage essentials',
  'green room necessities', 'performance day routine',
  'spare reeds', 'spare strings', 'tuner backup', 'sheet music backup',
  'performance attire check', 'stage outfit',
  'music student performance prep', 'violin recital essentials',
  'piano competition checklist', 'wind player reed spares',
  'clarinet 5 spare reeds', 'oboe reed essentials',
  'flute performance', 'saxophone gig prep', 'trumpet valve oil',
  'cello recital prep', 'double bass logistics', 'harp transport',
  'vocal performance throat care', 'opera dressing room',
  'conductor stand essentials', 'chamber music day-of',
  'string quartet prep', 'piano trio recital',
  'wind ensemble competition', 'choir festival day',
  'band live gig setup', 'studio session essentials',
  'rehearsal essentials', 'masterclass prep',
  'Todoist alternative', 'Things 3 alternative', 'TickTick alternative',
  'Microsoft To Do alternative', 'Google Keep alternative',
  'Notion checklist', 'Apple Reminders alternative', 'Any.do alternative',
  'Trello checklist', 'PackPoint alternative', 'TripList alternative',
];

const KEYWORDS_ES = [
  'app lista verificación', 'lista de equipaje', 'gestor de tareas',
  'checklist actuación', 'app recordatorio', 'lista TODO',
  'evitar olvidos', 'preparación concierto', 'lista pre-recital',
  'esenciales escenario', 'rutina día actuación',
  'cañas de repuesto', 'cuerdas de repuesto', 'partituras respaldo',
  'estudiantes música preparación', 'violín recital esenciales',
  'piano concurso lista', 'instrumento viento cañas',
  'voz cuidado garganta', 'orquesta día concierto',
  'Todoist alternativa', 'Things 3 alternativa',
  'Notion lista', 'Apple Recordatorios alternativa',
];

const ALL_KEYWORDS = [...KEYWORDS_JA, ...KEYWORDS_EN, ...KEYWORDS_ES];

const SOFTWARE_APP_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON CHECKLIST',
  alternateName: ['Kuon Checklist', '空音 CHECKLIST'],
  description:
    '音楽家の本番当日のための持ち物・タイムライン管理アプリ。楽器選択 (ヴァイオリン/ピアノ/声楽/管楽器/ギター) で自動生成される完璧なチェックリスト。リード・替え弦・譜面・衣装・メンタル準備まで網羅。完了率プログレスバーと過去本番履歴で達成感を可視化。完全無料・登録 (メール) のみ。',
  applicationCategory: 'ProductivityApplication',
  applicationSubCategory: 'TaskManagement',
  operatingSystem: 'Web (any device)',
  url: PAGE_URL,
  inLanguage: ['ja', 'en', 'es'],
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  publisher: { '@type': 'Organization', name: 'Kuon R&D', url: SITE_URL },
  audience: [
    { '@type': 'Audience', audienceType: 'Music Students' },
    { '@type': 'Audience', audienceType: 'Professional Musicians' },
    { '@type': 'Audience', audienceType: 'Performers' },
  ],
  featureList: [
    'Auto-generated checklists by instrument (5 presets)',
    'Custom items addable',
    'Completion progress bar',
    'Performance history with completion stats',
    'Mental preparation reminders (breathing, visualization)',
    'localStorage persistence (your data stays yours)',
  ],
};

const HOWTO_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '音楽家のための本番当日チェックリストの作り方 (KUON CHECKLIST)',
  description: 'ヴァイオリン奏者・ピアニスト・声楽家・管楽器奏者・ギタリストが本番で忘れ物ゼロにするための完璧な準備プロセス',
  totalTime: 'PT5M',
  step: [
    { '@type': 'HowToStep', name: '楽器を選ぶ', text: '5 種類のプリセットから自分の楽器を選択。自動的に最適化されたリストが生成。' },
    { '@type': 'HowToStep', name: '楽器・機材セクション確認', text: '楽器本体・弓・松脂・替え弦・チューナー等を順番にチェック。' },
    { '@type': 'HowToStep', name: '衣装セクション確認', text: '演奏服・シューズが用意されているか確認。' },
    { '@type': 'HowToStep', name: '移動・身の回り確認', text: '会場住所・身分証・水・スマホ充電器を確認。' },
    { '@type': 'HowToStep', name: 'メンタル準備', text: '本番 5 分前の呼吸・視覚化・確信のアファメーションを実行。KUON BREATH と連動可能。' },
    { '@type': 'HowToStep', name: '本番完了を記録', text: '完了率 100% で本番完了ログ。過去履歴に追加され、自分の準備力の成長が可視化。' },
  ],
};

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '音楽家の本番当日に必要な持ち物リストは?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '楽器によって異なります。ヴァイオリン: 楽器・弓・松脂・ミュート・替え弦 (E/A 線)・肩当て・チューナー・譜面。ピアノ: 譜面・ハンドウォーマー。声楽: 常温の水・のどスプレー・歌詞予備。管楽器: マウスピース・リード 3 枚以上・バルブオイル・コルクグリス・クリーニングロッド。共通: 演奏服・身分証・会場住所・水・スマホ充電器。KUON CHECKLIST が楽器別に自動生成します。',
      },
    },
    {
      '@type': 'Question',
      name: 'コンクール・リサイタル前日に確認すべきことは?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '前日チェックポイント: ① 楽器の点検 (緩み・割れ) ② 譜面の準備 (予備 1 部) ③ 演奏服の確認 (シミ・しわなし) ④ 移動経路の確認 ⑤ 早めの就寝 ⑥ 当日朝の食事計画。本番 5 分前: 呼吸法 (KUON BREATH 推奨)、メンタルリハーサル、確信のアファメーション。',
      },
    },
    {
      '@type': 'Question',
      name: 'クラリネット・オーボエ奏者は替えリードを何枚持っていくべき?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'プロは最低 3 枚、本番ではあらかじめ整えた 5 枚を推奨。リードは湿度・温度で大きく変化するため、本番直前に 2-3 枚試し、最も鳴る 1 枚で演奏。残りは予備。KUON CHECKLIST は管楽器選択時に「リード (替え 3 枚以上)」を自動表示。',
      },
    },
    {
      '@type': 'Question',
      name: '声楽家が本番当日に避けるべきものは?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '冷たい飲食物 (声帯収縮)、辛いもの・カフェイン (脱水)、乳製品 (痰)、アルコール、過度な発声練習。代わりに常温の水を頻繁に摂取し、加湿マスクで湿度維持、リップトリル・ハミングで軽くウォームアップ。KUON CHECKLIST の「ヴォーカル/声楽」プリセットに「冷たい飲食物を避ける」が含まれています。',
      },
    },
    {
      '@type': 'Question',
      name: 'KUON CHECKLIST は無料ですか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、メール登録のみで完全無料です。Free プランで楽器別チェックリスト・履歴記録・カスタムアイテム追加すべて利用可能。Stripe 決済も不要。空音開発のメンタル・本番準備カテゴリの 3 アプリ (BREATH/CHECKLIST/FREQUENCY) と統合できます。',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'KUON CHECKLIST | 音楽家の本番当日 持ち物リスト (無料)',
  description:
    'ヴァイオリン・ピアノ・声楽・管楽器・ギター用の本番当日チェックリスト自動生成アプリ。リード・替え弦・譜面・衣装・メンタル準備まで網羅。完了率プログレスバー・本番履歴・カスタムアイテム追加。Todoist や Things の代替として音楽家特化。完全無料。',
  keywords: ALL_KEYWORDS.join(', '),
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'KUON CHECKLIST | 音楽家の本番当日 持ち物リスト',
    description: '楽器選択で自動生成。リード・替え弦・譜面まで完璧に。完全無料。',
    url: PAGE_URL,
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: { card: 'summary_large_image', title: 'KUON CHECKLIST | 本番当日 持ち物管理', description: '音楽家のための本番準備の決定版。完全無料。' },
  robots: { index: true, follow: true },
};

export default function ChecklistLpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_APP_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      {children}
    </>
  );
}
