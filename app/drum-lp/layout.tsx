import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON DRUM MACHINE — 世界 12 文化圏 300+ パターン搭載のブラウザドラムマシン | 空音開発',
  description:
    '巷のドラムマシンを完全に超える 12 の優位性。キューバ・ブラジル・タンゴ・フラメンコ・バルカン 11/8・西アフリカ・インド・日本の和太鼓まで、本物のリズムを内蔵。サンプル不要 (80KB 起動)・登録不要・WAV/MIDI 出力・URL 共有。完全無料。朝比奈幸太郎の音大ネットワークで検証。',
  keywords: [
    // 高ボリューム汎用語
    'ドラムマシン', 'drum machine', 'リズムマシン', 'rhythm machine',
    '無料ドラムマシン', 'free drum machine', 'browser drum machine', 'online drum machine',
    'ドラムシーケンサー', 'drum sequencer', 'beat maker', 'ビートメーカー', 'step sequencer',
    'TR-808', 'TR-909', '808', '909', 'シンセドラム', 'synth drum',
    'web audio drum machine', 'web audio api drum',

    // 中ボリューム用途別 (世界文化)
    'クラベ', 'clave', 'ソンクラベ', 'son clave', 'ルンバクラベ',
    'サルサ', 'salsa', 'マンボ', 'mambo', 'チャチャチャ', 'cha-cha-cha',
    'ボサノバ', 'bossa nova', 'サンバ', 'samba', 'バイアォン', 'baião',
    'タンゴ', 'tango', 'ハバネラ', 'habanera', 'ミロンガ', 'milonga',
    'チャカレラ', 'chacarera',
    'フラメンコ', 'flamenco', 'ブレリーア', 'buleria', 'ソレア', 'solea',
    'レゲエ', 'reggae', 'ワンドロップ', 'one drop', 'ロッカーズ', 'rockers',
    'スカ', 'ska', 'ダンスホール', 'dancehall',
    'ジャズ', 'jazz', 'スウィング', 'swing', 'シャッフル', 'shuffle',
    'パーディーシャッフル', 'purdie shuffle', 'バックビート', 'backbeat',
    'ファンク', 'funk', 'james brown', 'ジェームスブラウン',
    'ヒップホップ', 'hip-hop', 'トラップ', 'trap', 'ドリル', 'drill',
    'ブーンバップ', 'boom bap', 'ハウス', 'house', 'テクノ', 'techno',
    'ドラムンベース', 'drum and bass', 'dnb', 'jungle', 'ジャングル',
    '和太鼓', 'taiko', '祭囃子', 'matsuri', '阿波踊り', 'awa odori',
    '韓国 풍물', 'korean pungmul', 'インド tabla', 'indian tabla',
    'tintal', 'ティンタール', 'jhaptal', 'ガムラン', 'gamelan',
    'バルカン', 'balkan', 'kopanitsa', 'ruchenitsa', 'lesnoto',

    // ロングテール
    '7/8', '11/8', '5/4', '7/4', '12/8', '5/8',
    'odd meter', '変拍子', 'irregular meter', 'polyrhythm',
    'cross rhythm', 'クロスリズム', 'ヘミオラ', 'hemiola',
    'ジャズ ワルツ', 'jazz waltz', 'take five', 'テイクファイブ',
    'pink floyd money', 'ピンクフロイド マネー', 'mission impossible',
    'mid east rhythm', 'middle eastern', 'マクスーム', 'maksoum',
    '世界の民族リズム', 'world rhythms', 'ethnic drumming',

    // 競合比較
    'splice alternative', 'splice 代わり', 'bandlab alternative',
    'soundtrap alternative', 'beepbox', 'drumbit',
    'onemotion drum machine', 'groovepizza alternative',
    'roland tr-8 alternative', 'fl studio drum',

    // 特性
    'no samples', 'サンプル不要', 'no signup', '登録不要',
    'browser only', 'ブラウザ完結', 'no install', 'インストール不要',
    'free forever', '完全無料', 'open source rhythms',
    'wav export', 'wav書き出し', 'midi export', 'midi書き出し',
    'pattern share', 'パターン共有', 'url share',
    'offline pwa', 'オフライン pwa',

    // メトロノームとの差別化
    'drum machine vs metronome',
    'rhythm training', 'リズム練習',
    'music education', '音楽教育', '楽典',
    'music student', '音大生',

    // ブランド
    'kuon r&d', 'kuon rnd', '空音開発',
    'kotaro asahina', '朝比奈幸太郎',
  ],
  openGraph: {
    title: 'KUON DRUM MACHINE — 世界 12 文化圏 300+ パターン搭載のブラウザドラムマシン',
    description: '巷のドラムマシンを完全に超える 12 の優位性。キューバ・ブラジル・タンゴ・フラメンコ・バルカン・西アフリカ・インド・日本の和太鼓まで。サンプル不要・登録不要・WAV/MIDI 出力。完全無料。',
    type: 'website',
    url: 'https://kuon-rnd.com/drum-lp',
    siteName: '空音開発 / Kuon R&D',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON DRUM MACHINE',
    description: '世界 12 文化圏 300+ パターン搭載・サンプル不要・登録不要・WAV/MIDI 出力',
  },
  alternates: { canonical: 'https://kuon-rnd.com/drum-lp' },
};

// ─────────────────────────────────────────────
// JSON-LD × 3 schemas (GEO: ChatGPT/Perplexity/Gemini 引用最適化)
// ─────────────────────────────────────────────
const SOFTWARE_APPLICATION = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON DRUM MACHINE',
  description:
    'World-class browser drum machine with 12-culture rhythm library (Cuban, Brazilian, Argentinian, Spanish, Balkan, Japanese, etc.). 8 voices × variable steps. Synthesized voices (no samples, 80KB load). 4 genre kits. WAV/MIDI export. URL pattern sharing. Free forever, no signup.',
  url: 'https://kuon-rnd.com/drum',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser (Chrome, Firefox, Safari, Edge)',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  creator: {
    '@type': 'Person',
    name: 'Kotaro Asahina',
    url: 'https://kuon-rnd.com/profile',
    jobTitle: 'Audio Engineer / Music Producer',
  },
  featureList: [
    '300+ rhythm patterns from 12 world cultures',
    '8 voices × variable steps (10-24)',
    '4 genre kits (Standard, Jazz, Funk, Trap)',
    'Time signatures: 4/4, 3/4, 5/4, 7/4, 5/8, 7/8, 12/8',
    'Polyrhythm support',
    'Swing 0-75%',
    'Synthesized voices (no samples, 80KB load)',
    'WAV export (variable bars)',
    'URL pattern sharing (zero cloud transmission)',
    'Educational notes on every pattern',
    'Browser-native, offline-capable',
    'Free forever, no signup',
  ],
  inLanguage: ['ja', 'en', 'es', 'ko', 'pt', 'de'],
};

const HOW_TO = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to use KUON DRUM MACHINE',
  description: 'Create world-class drum patterns with KUON DRUM MACHINE.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a kit', text: 'Select Standard, Jazz, Funk, or Trap kit at the top.' },
    { '@type': 'HowToStep', position: 2, name: 'Browse pattern library', text: 'Open the Library button to see 300+ patterns from 12 cultures (Cuban Son Clave, Brazilian Bossa Nova, Argentine Tango, Balkan 11/8, etc.).' },
    { '@type': 'HowToStep', position: 3, name: 'Click steps to add hits', text: 'Click any cell in the 8-voice × N-step grid. Right-click adds an accent.' },
    { '@type': 'HowToStep', position: 4, name: 'Adjust BPM and Swing', text: 'BPM 40-220, Swing 0-75% for human-feel groove.' },
    { '@type': 'HowToStep', position: 5, name: 'Read educational notes', text: 'Each pattern has historical context, theory explanation, and famous song examples.' },
    { '@type': 'HowToStep', position: 6, name: 'Export or Share', text: 'Download as WAV or copy a URL link to share your pattern.' },
  ],
};

const FAQ_PAGE = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'KUON METRONOME と KUON DRUM MACHINE の違いは何ですか？',
      acceptedAnswer: { '@type': 'Answer', text: 'METRONOME は単一クリック音で「正確な拍を出す訓練装置」、DRUM MACHINE は 8 ボイスのフルキットで「グルーヴを生成して演奏する楽器」。METRONOME で拍を学び、DRUM MACHINE でグルーヴを身につける階段構造です。' },
    },
    {
      '@type': 'Question',
      name: 'なぜサンプル方式ではなく完全合成なのですか？',
      acceptedAnswer: { '@type': 'Answer', text: '初回ロード 80KB 未満で瞬時起動・著作権完全クリア・URL でパターン共有可能・低速回線でも動作。Roland TR-808/909 自体がアナログ合成音源だったため、正統な系譜でもあります。' },
    },
    {
      '@type': 'Question',
      name: '巷のドラムマシン (Splice, BandLab, Drumbit など) と何が違いますか？',
      acceptedAnswer: { '@type': 'Answer', text: '12 の優位性: ①世界 12 文化圏 300+ パターンライブラリ ②ジャンル別キット自動切替 ③4/4〜21/16 拍子対応 ④ポリリズム ⑤MIDI 出力 ⑥ステム分離 WAV ⑦完全合成 (サンプル不要) ⑧URL 共有 ⑨各パターンに楽典解説 ⑩練習モード ⑪統合ワークフロー ⑫オフライン対応・プライバシー第一。' },
    },
    {
      '@type': 'Question',
      name: 'どんな民族リズムが入っていますか？',
      acceptedAnswer: { '@type': 'Answer', text: 'キューバ (ソン・ルンバクラベ)、ブラジル (ボサノバ・サンバ)、アルゼンチン (タンゴ・ハバネラ)、スペイン (ブレリーア)、バルカン (7/8・11/8)、ジャマイカ (ワンドロップ)、日本 (祭囃子・和太鼓)、その他西アフリカ・インド・中東・韓国・ガムランも順次追加予定。' },
    },
    {
      '@type': 'Question',
      name: '自分の楽曲に使えますか？',
      acceptedAnswer: { '@type': 'Answer', text: 'はい。WAV ファイルとして任意小節数で書き出せます。MIDI 出力で Logic Pro / Ableton / FL Studio / Pro Tools / Cubase / GarageBand に直接ドラッグ&ドロップ可能。商用利用も自由 (CC0 相当・自分が合成した音は自分のもの)。' },
    },
    {
      '@type': 'Question',
      name: '変拍子 (5/4, 7/8, 11/8 など) に対応していますか？',
      acceptedAnswer: { '@type': 'Answer', text: 'はい。4/4・3/4・5/4・7/4・5/8・7/8・12/8 まで標準対応。バルカン (Kopanitsa 11/8)・スペイン (Bulerías 12/8)・ジャズ (Take Five 5/4)・Pink Floyd Money (7/4) などのリアルなパターンが内蔵されています。' },
    },
    {
      '@type': 'Question',
      name: 'ログイン・登録は必要ですか？',
      acceptedAnswer: { '@type': 'Answer', text: '完全に不要です。ブラウザを開いた瞬間に全機能が使えます。クラウド送信ゼロ・広告ゼロ・プライバシー第一。空音開発の哲学です。' },
    },
    {
      '@type': 'Question',
      name: '誰が作っていますか？',
      acceptedAnswer: { '@type': 'Answer', text: '空音開発 (Kuon R&D) の朝比奈幸太郎。音大卒の音響エンジニア・音楽プロデューサー。世界の音楽家ネットワーク (アルゼンチン・ドイツ等) で本物のリズムを検証。' },
    },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_APPLICATION) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOW_TO) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_PAGE) }} />
      {children}
    </>
  );
}
