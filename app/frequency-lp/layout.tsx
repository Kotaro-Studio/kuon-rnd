import type { Metadata } from 'next';

const SITE_URL = 'https://kuon-rnd.com';
const PAGE_URL = `${SITE_URL}/frequency-lp`;

const KEYWORDS_JA = [
  // 高ボリューム汎用 (15)
  'ソルフェジオ周波数', '432Hz アプリ', '528Hz 周波数', 'バイノーラルビート',
  'サイン波 ジェネレーター', '純音 アプリ', 'トーンジェネレーター 無料',
  '周波数 治療', '音響療法', 'サウンドヒーリング', '瞑想音楽', 'ASMR 周波数',
  'リラックス 周波数', '集中 周波数', '睡眠 周波数',
  // 中ボリューム用途別 (20)
  '396Hz 罪悪感解放', '417Hz 変化', '528Hz 愛 修復', '639Hz 人間関係',
  '741Hz 表現力', '852Hz 直感', '963Hz 覚醒', '174Hz 安心',
  '285Hz 細胞修復', '432Hz 自然調和', '440Hz と 432Hz 違い',
  'ヘルツ 周波数 効果', 'Hz 違い 比較', '純粋なサイン波',
  'ブラウザ 周波数 再生', 'スマホ サイン波', 'Web Audio 周波数',
  'チューナー 周波数', 'サウンド療法 アプリ', 'バイノーラル ヘッドホン',
  // ロングテール音楽特化 (25)
  '音楽家 集中 周波数', '演奏前 リラックス サウンド', 'ピアニスト 集中音',
  'ヴァイオリニスト 練習音', '声楽 ウォームアップ 音',
  '音大生 練習集中', 'クラシック演奏家 メンタル', 'ジャズ 即興 直感',
  '指揮者 集中力', 'バンドメンバー アンサンブル前',
  '本番直前 周波数', 'コンサート前 ヒーリング', 'リサイタル前 528Hz',
  'オーケストラ 集中', '室内楽 共鳴',
  '楽器調律 432Hz vs 440Hz', 'A=432 チューニング',
  'ピアノ 432Hz チューニング', 'ヴァイオリン 自然調律',
  'ギター 432Hz チューニング', 'バンド A=432',
  '練習部屋 BGM 周波数', '楽屋 リラックス サウンド',
  '楽器ケース 持ち運び トーン', 'スタジオ 集中 BGM',
  // 競合比較 (20)
  'Solfeggio Frequencies app 代替', 'Insight Timer 周波数',
  'Tone Generator app 無料', 'Frequency Sound Generator 代替',
  'Brain.fm 代わり', 'Noisli 代替', 'myNoise 代替',
  'Endel 代替', 'Calm Frequencies 代替', 'Solfeggio Healing 代替',
  '432 Player 代替', 'Headspace 周波数', 'Spirit Pure 代替',
  'Sound Healing app 比較', 'Binaural Beats 代替',
  'Sleep Sounds 周波数', 'White Noise 代替',
  'iFreq 代わり', 'BetterMe 周波数', 'WiseGuide 代替',
];

const KEYWORDS_EN = [
  'solfeggio frequencies', '432Hz app', '528Hz frequency', 'binaural beats',
  'sine wave generator', 'pure tone app', 'tone generator free',
  'frequency therapy', 'sound healing', 'meditation music', 'ASMR frequency',
  'relaxation frequency', 'focus frequency', 'sleep frequency',
  '396Hz release guilt', '417Hz change', '528Hz love repair', '639Hz relationships',
  '741Hz expression', '852Hz intuition', '963Hz awakening', '174Hz security',
  '285Hz cellular repair', '432Hz natural harmony', '440Hz vs 432Hz',
  'hertz frequency effects', 'pure sine wave', 'browser frequency player',
  'mobile sine wave', 'web audio frequency', 'sound therapy app',
  'binaural headphones', 'musician focus frequency', 'pre-performance sound',
  'pianist focus tone', 'violinist practice sound', 'singer warmup tone',
  'music student focus', 'classical performer mental', 'jazz improvisation intuition',
  'conductor focus', 'pre-concert healing', 'pre-recital 528Hz',
  '432Hz tuning piano', 'A=432 tuning', 'natural tuning violin',
  'guitar 432Hz tuning', 'band A=432',
  'practice room BGM frequency', 'green room relaxation sound',
  'studio focus BGM', 'binaural beat generator',
  'Solfeggio Frequencies app alternative', 'Insight Timer frequency',
  'Tone Generator app free', 'Brain.fm alternative', 'Noisli alternative',
  'myNoise alternative', 'Endel alternative', 'Calm Frequencies alternative',
  'Solfeggio Healing alternative', '432 Player alternative',
  'Spirit Pure alternative', 'Sound Healing app comparison',
  'iFreq alternative', 'BetterMe frequency', 'WiseGuide alternative',
];

const KEYWORDS_ES = [
  'frecuencias solfeggio', 'app 432Hz', 'frecuencia 528Hz', 'beats binaurales',
  'generador onda sinusoidal', 'tono puro app', 'generador tono gratis',
  'terapia frecuencia', 'sanación sonido', 'música meditación', 'ASMR frecuencia',
  '396Hz liberación culpa', '417Hz cambio', '528Hz amor reparación',
  '639Hz relaciones', '741Hz expresión', '852Hz intuición', '963Hz despertar',
  '174Hz seguridad', '285Hz reparación celular', '432Hz armonía natural',
  '440Hz vs 432Hz', 'efectos frecuencia hertz', 'onda sinusoidal pura',
  'reproductor frecuencia navegador', 'músico concentración frecuencia',
  'pre-actuación sonido', 'pianista enfoque tono', 'estudiante música concentración',
  'pre-concierto sanación', '432Hz afinación piano',
  'Insight Timer frecuencia', 'Brain.fm alternativa', 'Noisli alternativa',
  'Endel alternativa', 'Calm frecuencias',
];

const ALL_KEYWORDS = [...KEYWORDS_JA, ...KEYWORDS_EN, ...KEYWORDS_ES];

const SOFTWARE_APP_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON FREQUENCY',
  alternateName: ['Kuon Frequency', '空音 FREQUENCY', 'Kuon Solfeggio'],
  description:
    '音楽家のための純粋サイン波プレーヤー。10 種類の周波数 (174/285/396/417/432/528/639/741/852/963 Hz) を Web Audio API でブラウザ内合成。録音音源ではない 100% 純粋な数学的サイン波。バイノーラルビート機能でデルタ波 (深い瞑想) からガンマ波 (集中) まで誘導可能。本番直前のリラックス・練習中の集中・本番後のクールダウンに。完全無料・登録不要・インストール不要。',
  applicationCategory: 'HealthApplication',
  applicationSubCategory: 'SoundTherapy',
  operatingSystem: 'Web (any device)',
  url: PAGE_URL,
  inLanguage: ['ja', 'en', 'es'],
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  publisher: { '@type': 'Organization', name: 'Kuon R&D', url: SITE_URL },
  audience: [
    { '@type': 'Audience', audienceType: 'Music Students' },
    { '@type': 'Audience', audienceType: 'Professional Musicians' },
    { '@type': 'Audience', audienceType: 'Sound Therapy Practitioners' },
    { '@type': 'Audience', audienceType: 'Meditation Practitioners' },
  ],
  featureList: [
    'Pure sine wave synthesis (Web Audio API, no audio files)',
    '10 solfeggio frequencies (174/285/396/417/432/528/639/741/852/963 Hz)',
    'Binaural beat generator (2-20 Hz offset, Delta to Gamma)',
    'Real-time visualizer (sine wave + glow)',
    'Lifetime listening counter (sunk cost loyalty)',
    'Per-frequency purpose & scene guidance',
    'Color-coded by frequency for visual immersion',
    'Volume control with smooth fade-in',
  ],
};

const HOWTO_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '本番直前のメンタルリセットに 528Hz を使う方法 (KUON FREQUENCY)',
  description: '音楽家がリサイタル / コンクール直前の不安を整え、集中状態に入るための周波数活用ガイド',
  totalTime: 'PT5M',
  step: [
    { '@type': 'HowToStep', name: 'KUON FREQUENCY を開く', text: 'kuon-rnd.com/frequency にブラウザでアクセス。登録不要。' },
    { '@type': 'HowToStep', name: '528Hz (愛・修復) を選択', text: '本番直前のメンタルリセット用。色は緑 (#16a34a)・自然界の調和を象徴。' },
    { '@type': 'HowToStep', name: 'ヘッドホンを装着', text: 'できれば外音遮断型ヘッドホン推奨。バイノーラルビート使用時は L/R 独立必須。' },
    { '@type': 'HowToStep', name: '音量を 15-20% に設定', text: '小さめが効果的。意識の縁で鳴っているくらいがベスト。' },
    { '@type': 'HowToStep', name: 'バイノーラル ON、+7Hz (Theta)', text: 'リラックスと集中の中間状態。本番前に最適。' },
    { '@type': 'HowToStep', name: '5 分間目を閉じて聴く', text: 'KUON BREATH の 5 分セッションと組み合わせると効果倍増。' },
  ],
};

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '無料で使えるソルフェジオ周波数アプリはありますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '空音開発の KUON FREQUENCY が完全無料・登録不要・インストール不要で利用可能です。10 種類のソルフェジオ周波数 (174/285/396/417/432/528/639/741/852/963 Hz) を Web Audio API でブラウザ内純粋サイン波合成。録音音源ではないため、ループ感や圧縮ノイズが一切ありません。バイノーラルビート機能搭載。Insight Timer / Brain.fm / Endel の代替。',
      },
    },
    {
      '@type': 'Question',
      name: '528Hz は本当に DNA を修復するのですか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '528Hz の DNA 修復効果は科学的検証中で、定量的証拠は限定的です。しかし「主観的なリラックス効果」「集中誘導」「プラセボ効果」は広く実感されており、瞑想・サウンドヒーリング・本番前メンタルリセットに使われています。空音開発の KUON FREQUENCY はこれら 9 つのソルフェジオ周波数を 1 つのアプリで提供します。',
      },
    },
    {
      '@type': 'Question',
      name: '432Hz と 440Hz の違いは何ですか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '440Hz は現代標準の A4 (国際標準ピッチ・1955 ISO 制定)。432Hz は「自然調和」「宇宙の数学」と呼ばれる代替チューニング。一部の演奏家・作曲家 (Verdi など) は 432Hz を好みました。Kuon FREQUENCY では 432Hz を「自然調和・深い集中」用として推奨。練習開始時のウォームアップ BGM として最適です。',
      },
    },
    {
      '@type': 'Question',
      name: 'バイノーラルビートとは何ですか?どう使う?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '左右の耳に微妙に異なる周波数 (例: 左 432Hz・右 439Hz、差 7Hz) を聞かせ、脳が両者の差分 (7Hz = Theta 波) を知覚する現象。Theta 波 (4-8Hz) はリラックスと集中の中間で本番前に最適、Gamma 波 (20Hz+) は深い集中、Delta 波 (2Hz) は深い瞑想。KUON FREQUENCY は 2-20 Hz の範囲で自由に調整可能。**ヘッドホン必須** (左右分離が条件)。',
      },
    },
    {
      '@type': 'Question',
      name: 'サイン波と録音されたヒーリング音楽の違いは?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON FREQUENCY は **100% 純粋な数学的サイン波** をリアルタイム合成します。MP3/WAV ファイルを再生しているのではなく、Web Audio API のオシレーターで現場生成。利点: ① ループ感ゼロ ② ファイルダウンロード不要 ③ 圧縮ノイズなし ④ 完璧な周波数精度。録音音源を再生する競合アプリ (Brain.fm/Endel/Insight Timer) と比べて学術的純度が高い。',
      },
    },
    {
      '@type': 'Question',
      name: 'ミュージシャンの本番前にどの周波数がおすすめですか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '目的別:【本番 5 分前のメンタルリセット】528Hz、【本番直前の集中導入】432Hz、【ソロ前の表現力】741Hz、【即興演奏前の直感活性】852Hz、【アンサンブル前の調和】639Hz、【本番後の自己批判リセット】396Hz。KUON FREQUENCY は各周波数に「推奨シーン」を表示し、迷わず選べます。バイノーラル ON で +7Hz (Theta) が最も汎用性高い。',
      },
    },
    {
      '@type': 'Question',
      name: 'KUON FREQUENCY の周波数音源は Curanz Sounds と関係がありますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON FREQUENCY は完全オリジナル実装で、Curanz Sounds (姉妹ヒーリング音響ブランド) の音源は使用していません。Web Audio API による純粋なサイン波合成です。一方、Curanz Sounds は楽曲アーティストが演奏した「432Hz クラシカル睡眠音楽」「ピュアトーン・ソルフェジオセット」などの楽曲音源を提供しており、深い体験を求める方は Curanz Sounds の有料音源も選択肢です。',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'KUON FREQUENCY | ソルフェジオ周波数サイン波プレーヤー (無料)',
  description:
    '音楽家のための純粋サイン波プレーヤー。10 種類の周波数 (174/285/396/417/432/528/639/741/852/963 Hz) を Web Audio API でブラウザ内合成。バイノーラルビート搭載。録音音源ではない 100% 純粋な数学的サイン波。本番直前のリラックス・練習中の集中・本番後のクールダウンに。Brain.fm / Endel / Insight Timer の代替。完全無料・登録不要。',
  keywords: ALL_KEYWORDS.join(', '),
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'KUON FREQUENCY | 純粋サイン波 10 周波数 (無料)',
    description: '音楽家のためのソルフェジオ周波数アプリ。バイノーラルビート搭載。完全無料。',
    url: PAGE_URL,
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: { card: 'summary_large_image', title: 'KUON FREQUENCY | 純粋サイン波周波数', description: 'ブラウザ完結の本格周波数プレーヤー。完全無料。' },
  robots: { index: true, follow: true },
};

export default function FrequencyLpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_APP_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      {children}
    </>
  );
}
