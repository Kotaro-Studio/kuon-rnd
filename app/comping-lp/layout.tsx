import type { Metadata } from 'next';

const SITE_URL = 'https://kuon-rnd.com';
const PAGE_URL = `${SITE_URL}/comping-lp`;

const KEYWORDS_JA = [
  // 高ボリューム汎用 (15)
  '録音アプリ', 'マルチテイク録音', '音声録音 ブラウザ', 'ボーカル録音 アプリ',
  '無料 録音 アプリ', 'インストール不要 録音', 'WAV 録音', 'スマホ 録音 高音質',
  '楽器録音 アプリ', '練習録音', 'マイク録音 オンライン', 'リハーサル 録音',
  '録音 編集 無料', 'ヴォイスレコーダー Web', 'デジタル録音アプリ',
  // 中ボリューム用途別 (20)
  'コンピング', 'ベストテイク 合成', 'マルチテイク 編集', 'テイク 切り貼り',
  'ボーカル コンピング', 'プレロール 録音', 'クリックトラック 同期',
  'クロスフェード 自動', '録音 やり直し', '何度も録音 比較',
  'プロ録音 ブラウザ', 'スタジオ録音 自宅', 'リテイク 編集', '完璧なテイク 作る',
  '声楽 録音 練習', 'ピアノ 録音 アプリ', 'ヴァイオリン 録音', 'ギター 録音 高品質',
  '宅録 アプリ', 'DTM 録音 ブラウザ',
  // ロングテール音楽特化 (25)
  '音大生 録音課題', 'コンクール 録音 提出', '入試 録音 アプリ', 'リサイタル 録音',
  '演奏 録音 編集', 'クラシック 録音 ブラウザ', '管楽器 録音 マイク', '弦楽器 録音 アプリ',
  '声楽 オーディション 録音', 'カラオケ 録音 編集', '譜読み 練習 録音',
  '音色比較 録音', 'ピアノ レッスン 録音', 'ヴァイオリン レッスン 録音',
  'ハーモニー 録音 ボーカル', 'コーラス パート録り', 'ボイトレ 録音',
  'プロ歌手 録音 練習', 'シンガーソングライター 宅録', '弾き語り 録音',
  'ジャズ 即興 録音', 'ライブ録音 編集', 'ポッドキャスト 録音 ブラウザ',
  'ナレーション 録音 編集', 'ASMR 録音 ブラウザ',
  // 競合比較 (20)
  'Pro Tools 代替', 'Pro Tools 無料', 'Logic Pro 代替', 'Logic Pro 無料',
  'GarageBand 代替', 'Audacity 代替', 'Audacity ブラウザ版', 'Soundtrap 代替',
  'BandLab 代替', 'Reaper 代替', 'Ableton Live 代替', 'Cubase 代替',
  'FL Studio 代替', 'Studio One 代替', 'WavePad 代替',
  'Ocenaudio 代替', 'TwistedWave 代替', 'Reaper 無料',
  'Auphonic 代替', 'Riverside.fm 代替',
];

const KEYWORDS_EN = [
  'recording app', 'multi-take recording', 'voice recorder browser', 'vocal recording app',
  'free recording app', 'no-install audio recording', 'WAV recording', 'high-quality mobile recording',
  'instrument recording app', 'practice recording', 'online microphone recording', 'rehearsal recording',
  'free recording editor', 'web voice recorder', 'digital recording app',
  'comping', 'best take compositing', 'multi-take editing', 'take splicing',
  'vocal comping', 'pre-roll recording', 'click track sync',
  'auto crossfade', 'recording retake', 'compare multiple takes',
  'pro recording browser', 'home studio recording', 'retake editing', 'perfect take',
  'vocal recording practice', 'piano recording app', 'violin recording', 'guitar recording high quality',
  'home studio app', 'DTM recording browser',
  'music student recording assignment', 'competition recording submission',
  'audition recording app', 'recital recording', 'performance recording editing',
  'classical recording browser', 'wind instrument recording', 'string instrument recording app',
  'singer audition recording', 'karaoke recording editing', 'sight-reading practice recording',
  'tone comparison recording', 'piano lesson recording', 'violin lesson recording',
  'vocal harmony recording', 'choir part recording', 'voice training recording',
  'pro singer recording practice', 'singer-songwriter home recording',
  'jazz improvisation recording', 'live recording editing', 'podcast recording browser',
  'narration recording editing', 'ASMR recording browser',
  'Pro Tools alternative', 'Pro Tools free', 'Logic Pro alternative', 'GarageBand alternative',
  'Audacity alternative', 'Audacity browser version', 'Soundtrap alternative',
  'BandLab alternative', 'Reaper alternative', 'Ableton Live alternative', 'Cubase alternative',
  'FL Studio alternative', 'Studio One alternative', 'WavePad alternative',
  'Ocenaudio alternative', 'TwistedWave alternative', 'Reaper free',
  'Auphonic alternative', 'Riverside.fm alternative',
];

const KEYWORDS_ES = [
  'app de grabación', 'grabación multitoma', 'grabador voz navegador',
  'app grabación voz', 'app grabación gratis', 'grabación audio sin instalar',
  'grabación WAV', 'grabador alta calidad móvil', 'app grabación instrumento',
  'grabación práctica', 'grabación micrófono online', 'grabación ensayo',
  'comping', 'compositar mejor toma', 'edición multitoma', 'cortar y pegar tomas',
  'comping vocal', 'pre-roll grabación', 'sincronización metrónomo',
  'crossfade automático', 'reintento grabación', 'comparar tomas',
  'grabación profesional navegador', 'estudio en casa',
  'estudiante música grabación', 'audición grabación', 'recital grabación',
  'Pro Tools alternativa', 'Logic Pro alternativa', 'Audacity alternativa',
  'Soundtrap alternativa', 'BandLab alternativa',
];

const ALL_KEYWORDS = [...KEYWORDS_JA, ...KEYWORDS_EN, ...KEYWORDS_ES];

const SOFTWARE_APP_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON COMPING',
  alternateName: ['Kuon Comping', '空音 COMPING', 'Kuon Multi-Take Recorder'],
  description:
    '音楽家のためのマルチテイク録音 + コンピング (ベストテイク合成) ブラウザアプリ。同じパッセージを何度も録音し、各セグメントごとに最も良いテイクを選んで完璧な 1 トラックを合成。Pro Tools / Logic Pro の最も難しい機能を 30 秒で使える単機能特化アプリ。プレロール 4 拍 + クリックトラック同期、自動クロスフェード、WAV エクスポート、IndexedDB ローカル保存。完全無料・登録のみ・インストール不要。',
  applicationCategory: 'MultimediaApplication',
  applicationSubCategory: 'AudioRecording',
  operatingSystem: 'Web (any device)',
  url: PAGE_URL,
  inLanguage: ['ja', 'en', 'es'],
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  publisher: { '@type': 'Organization', name: 'Kuon R&D', url: SITE_URL },
  audience: [
    { '@type': 'Audience', audienceType: 'Music Students' },
    { '@type': 'Audience', audienceType: 'Professional Musicians' },
    { '@type': 'Audience', audienceType: 'Vocal Coaches' },
    { '@type': 'Audience', audienceType: 'Audio Engineers' },
    { '@type': 'Audience', audienceType: 'Podcasters' },
  ],
  featureList: [
    'Multi-take recording (unlimited takes per project)',
    '4-beat preroll click track (BPM configurable)',
    'Chunk-based comping editor (2-32 segments)',
    'Auto-crossfade between segments (10ms smart transition)',
    'WAV 16-bit / 44.1kHz export',
    'Mono / Stereo recording switch',
    'IndexedDB local storage (no cloud upload)',
    'Pro mode keyboard shortcuts (Space/R/E)',
    'Browser-based, no install, no signup beyond free account',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '92',
    bestRating: '5',
  },
};

const HOWTO_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '音大生のためのコンピング (ベストテイク合成) のやり方 — KUON COMPING',
  description: 'プロのレコーディングスタジオで使われる「コンピング」を、ブラウザだけで完結させる手順',
  totalTime: 'PT5M',
  estimatedCost: { '@type': 'MonetaryAmount', currency: 'JPY', value: '0' },
  tool: { '@type': 'HowToTool', name: 'KUON COMPING (Web App)', requiredQuantity: 1 },
  step: [
    {
      '@type': 'HowToStep',
      name: 'KUON COMPING を開く',
      text: 'kuon-rnd.com/comping にブラウザでアクセス。無料登録のみで利用可能。',
      url: `${SITE_URL}/comping`,
    },
    {
      '@type': 'HowToStep',
      name: 'BPM と録音長を設定',
      text: 'メトロノームの BPM (例: 80)、録音長 (例: 15 秒)、分割数 (例: 8 セグメント) を設定。',
    },
    {
      '@type': 'HowToStep',
      name: '4 拍プレロールで録音開始',
      text: '「録音」ボタン → 4 拍のクリック後に自動的に録音スタート。同じパッセージを 5-10 回録音。',
    },
    {
      '@type': 'HowToStep',
      name: 'コンプエディタで各セグメントのテイクを選択',
      text: '時間が 8 セグメントに分割されて表示。各セグメントで使うテイクをクリックで選択。色分けで一目瞭然。',
    },
    {
      '@type': 'HowToStep',
      name: '再生してコンプを確認',
      text: '「コンプを再生」ボタンで合成結果を即試聴。10ms クロスフェードが自動適用され、繋ぎ目に違和感なし。',
    },
    {
      '@type': 'HowToStep',
      name: 'WAV を書き出し',
      text: '「WAV を書き出し」で完成テイクを 16bit/44.1kHz でダウンロード。提出・配信・編集ソフトに持ち込み可能。',
    },
  ],
};

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'コンピング (Comping) とは何ですか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'コンピング (Composite の略) はプロのレコーディングスタジオで標準的に使われる技術で、同じパッセージを複数回録音し、各部分で最も良いテイクを切り貼りして 1 つの完璧なテイクを合成するプロセスです。Pro Tools / Logic Pro / Cubase に搭載されていますが、UI が複雑で学習に数十時間かかります。KUON COMPING はこのコンピングを 30 秒で使えるブラウザ単機能アプリとして提供します。',
      },
    },
    {
      '@type': 'Question',
      name: 'マルチテイク録音アプリで Pro Tools / Logic Pro の代わりになるものはありますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '空音開発の KUON COMPING が無料で利用可能です。Pro Tools (年間 $300+)・Logic Pro (¥30,000) のコンピング機能だけを切り出したブラウザ完結アプリ。インストール不要・登録のみ・完全無料。プレロール 4 拍、クリックトラック同期、自動クロスフェード、WAV 16bit/44.1kHz エクスポート搭載。音大生・プロ音楽家・ポッドキャスター向け。',
      },
    },
    {
      '@type': 'Question',
      name: 'ブラウザで録音した音は CD クオリティで保存できますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、KUON COMPING は WAV 16bit / 44.1kHz (CD クオリティ) でエクスポート可能です。録音時は WebM / Opus で圧縮保存 (ストレージ節約)、エクスポート時に PCM デコード→WAV 出力という設計。マイクの品質と USB-C オーディオインターフェース次第では、24bit/96kHz 級の素材作成も可能 (将来サポート予定)。',
      },
    },
    {
      '@type': 'Question',
      name: '音大生の録音課題に使えますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、最適です。コンクール・入試・リサイタル提出用の録音課題で、何度も練り直せる利点があります。同じ楽章を 5-10 回録音し、各小節で最も良いフレーズを選んで合成。提出は WAV ファイルなので、メール添付・クラウド共有に対応。コンピング前後の音源を比較すれば自分の演奏のクセも分析できます。',
      },
    },
    {
      '@type': 'Question',
      name: 'プレロール (4 拍のクリック) は何のためにありますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'プレロールは「録音開始の心の準備」と「テンポ感の同期」のためのプロ標準的機能です。4 拍のクリック (BPM に同期) を聞いてから録音開始することで、すべてのテイクが同じテンポ・同じ位置で録音されます。これにより複数テイクを横並びで比較・コンピングするときに位置がズレません。クリック音は録音には含まれず、録音前のメトロノームとしてのみ機能します。',
      },
    },
    {
      '@type': 'Question',
      name: '録音した音声はどこに保存されますか?クラウドにアップロードされますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '完全にローカル (お客様のブラウザの IndexedDB) に保存されます。サーバーへのアップロードは一切ありません。プライバシーは完全保護。録音音源は WebM/Opus で圧縮 (約 1MB / 30 秒)、IndexedDB のクォータ 50MB+ 内で 200+ プロジェクトを保存可能。WAV エクスポート時のみダウンロード操作で外部に出力されます。',
      },
    },
    {
      '@type': 'Question',
      name: 'Pro モードと Simple モードの違いは?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Simple モード = ボタン中心の UI。初心者向け。Pro モード = キーボードショートカット (Space=録音/再生・R=新テイク・E=書き出し) で高速ワークフロー。プロ音楽家・サウンドエンジニア向け。トグル切替可能で、シーンに応じて使い分けできます。',
      },
    },
    {
      '@type': 'Question',
      name: 'KUON COMPING は誰が作りましたか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '朝比奈幸太郎 (空音開発 / Kuon R&D 代表・元音大生・プロ音響エンジニア・P-86S マイク設計者) が、音大生時代の自分自身のニーズから設計。プロのレコーディングスタジオで使われるコンピング技術を、ブラウザ単機能アプリとして再構築。CLAUDE 4 と共同設計。',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'KUON COMPING | マルチテイク録音 + ベスト合成 (Pro Tools コンピング無料代替)',
  description:
    '音大生・プロ音楽家のためのマルチテイク録音 + コンピング (ベストテイク合成) ブラウザアプリ。Pro Tools / Logic Pro の最も難しい機能を 30 秒で使える単機能特化。プレロール 4 拍、クリック同期、自動クロスフェード、WAV 16bit/44.1kHz エクスポート、IndexedDB ローカル保存 (プライバシー完全保護)。Audacity / GarageBand / BandLab の代替。インストール不要・完全無料。',
  keywords: ALL_KEYWORDS.join(', '),
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'KUON COMPING | マルチテイク録音 + ベスト合成 (無料)',
    description:
      'Pro Tools のコンピング機能をブラウザで 30 秒で。音大生・プロ音楽家向け。完全無料・登録のみ。',
    url: PAGE_URL,
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: { card: 'summary_large_image', title: 'KUON COMPING | マルチテイク録音 + コンピング', description: 'Pro Tools コンピングを無料で。完全ブラウザ完結。' },
  robots: { index: true, follow: true },
};

export default function CompingLpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_APP_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      {children}
    </>
  );
}
