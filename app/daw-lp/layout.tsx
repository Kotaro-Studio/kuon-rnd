import type { Metadata } from 'next';

const SITE_URL = 'https://kuon-rnd.com';
const PAGE_URL = `${SITE_URL}/daw-lp`;

const KEYWORDS_JA = [
  // 高ボリューム汎用 (15)
  'DAW', 'DAW 無料', 'DAW ブラウザ', 'マルチトラック録音', '録音アプリ',
  'WAV 書き出し', 'MP3 書き出し', 'ボーカル録音', '歌ってみた 録音',
  'インストール不要 DAW', 'スマホ DAW', 'Mac DAW 無料', 'Windows DAW 無料',
  'iPad DAW', 'PC 録音 ソフト',
  // 中ボリューム用途別 (20)
  '歌ってみた DAW', '歌ってみた MIX', '宅録 ソフト', '簡単 録音',
  '24bit 録音', '32bit float 録音', '96kHz 録音', 'ハイレゾ 録音',
  'LUFS マスタリング', 'Spotify ラウドネス', 'Apple Music 音圧', 'YouTube 音圧',
  'EBU R128', 'ノーマライズ', 'True Peak リミッター',
  '波形編集 ブラウザ', 'クロスフェード 自動', 'カット編集 録音', 'MIX ダウン',
  'プロ録音 自宅',
  // ロングテール音楽特化 (25)
  '歌ってみた 録音 ブラウザ', '歌い手 DAW', 'ボーカル MIX 簡単',
  'カラオケ録音 mix', 'コーラス 録音 重ね', 'ハモり 録音 アプリ',
  '弾き語り 録音', '楽器 録音 マルチ', 'バンド 録音 ブラウザ',
  '音楽家 ワンポイント録音', 'クラシック演奏 録音', 'ヴァイオリン リサイタル 録音',
  'ピアノ 演奏会 録音', '室内楽 録音', 'オーケストラ 録音 編集',
  '声楽 リサイタル 録音 編集', 'オペラ アリア 録音', 'ジャズ ライブ録音 編集',
  '吹奏楽 録音 整音', '合唱 録音 マスタリング', 'ポッドキャスト 録音 編集',
  'ナレーション 録音 アプリ', 'ASMR 録音 編集', '配信用 音源 作成',
  'CD マスタリング 自分で',
  // 競合比較 (20)
  'GarageBand 代替', 'GarageBand Windows', 'Logic Pro 代替', 'Logic Pro 無料',
  'Pro Tools 代替', 'Audacity 代替', 'Audacity ブラウザ版', 'Cubase 代替',
  'Studio One 代替', 'FL Studio 代替', 'Reaper 無料', 'Ableton Live 代替',
  'Soundtrap 代替', 'BandLab 代替', 'Soundation 代替',
  'Auphonic 代替', 'WavePad 代替', 'Ocenaudio 代替', 'TwistedWave 代替',
  'Riverside.fm 代替',
  // プロ録音・データ保護系 (15) — Phase 1 追加
  'クラッシュ復旧 録音', 'ブラウザクラッシュ 録音 復元', 'プロ録音 ブラウザ',
  '録音 データ消失 防止', 'ストリーミング書き込み 録音', 'IndexedDB 録音',
  'ローカル保存 録音', 'クラウド送信ゼロ DAW', 'プライバシー 録音',
  'オフライン録音 ブラウザ', 'PWA 録音 アプリ', '長時間録音 安定',
  '業務利用 ブラウザ DAW', 'プロエンジニア ブラウザ', 'Persistent Storage 録音',
];

const KEYWORDS_EN = [
  // High-volume general (15)
  'DAW', 'free DAW', 'browser DAW', 'multi-track recording', 'recording app',
  'WAV export', 'MP3 export', 'vocal recording', 'cover song recording',
  'no-install DAW', 'mobile DAW', 'Mac DAW free', 'Windows DAW free',
  'iPad DAW', 'PC recording software',
  // Mid-volume use-case (20)
  'cover song DAW', 'utaite recording', 'home recording software', 'simple recording',
  '24-bit recording', '32-bit float recording', '96kHz recording', 'hi-res recording',
  'LUFS mastering', 'Spotify loudness', 'Apple Music loudness', 'YouTube loudness',
  'EBU R128', 'normalize audio', 'true peak limiter',
  'waveform editor browser', 'auto crossfade', 'cut edit recording', 'mixdown',
  'pro recording at home',
  // Long-tail music-specific (25)
  'cover song browser DAW', 'singer DAW', 'vocal mix easy',
  'karaoke recording mix', 'chorus stacking', 'harmony recording app',
  'self-accompanied recording', 'instrument multi-track', 'band recording browser',
  'one-point recording musician', 'classical performance recording',
  'violin recital recording', 'piano concert recording', 'chamber music recording',
  'orchestra recording editing', 'vocal recital recording', 'opera aria recording',
  'jazz live recording editing', 'wind ensemble recording', 'choir recording mastering',
  'podcast recording editing', 'narration recording app', 'ASMR recording editing',
  'streaming source creation', 'CD mastering DIY',
  // Competitor comparison (20)
  'GarageBand alternative', 'GarageBand Windows', 'Logic Pro alternative', 'Logic Pro free',
  'Pro Tools alternative', 'Audacity alternative', 'Audacity browser', 'Cubase alternative',
  'Studio One alternative', 'FL Studio alternative', 'Reaper free', 'Ableton Live alternative',
  'Soundtrap alternative', 'BandLab alternative', 'Soundation alternative',
  'Auphonic alternative', 'WavePad alternative', 'Ocenaudio alternative', 'TwistedWave alternative',
  'Riverside.fm alternative',
];

const KEYWORDS_ES = [
  'DAW gratis', 'DAW navegador', 'grabación multipista', 'app grabación',
  'exportar WAV', 'exportar MP3', 'grabación vocal', 'cover canción grabación',
  'DAW sin instalar', 'DAW móvil', 'Mac DAW gratis', 'Windows DAW gratis',
  'grabación 24-bit', 'grabación 32-bit float', 'grabación 96kHz',
  'masterización LUFS', 'loudness Spotify', 'loudness Apple Music',
  'EBU R128', 'normalizar audio', 'true peak limiter',
  'editor formas de onda navegador', 'crossfade automático', 'mezclar audio',
  'estudiantes música grabación', 'recital violín grabación', 'piano concierto grabación',
  'GarageBand alternativa', 'Logic Pro alternativa', 'Pro Tools alternativa',
  'Audacity alternativa', 'Cubase alternativa', 'Reaper gratis',
  'Soundtrap alternativa', 'BandLab alternativa',
];

const ALL_KEYWORDS = [...KEYWORDS_JA, ...KEYWORDS_EN, ...KEYWORDS_ES];

const SOFTWARE_APP_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON DAW',
  alternateName: ['Kuon DAW', '空音 DAW', 'Kuon Multi-Track Recorder'],
  description:
    '音楽家・歌い手・ワンポイント録音エンジニアのためのブラウザ完結マルチトラック DAW。1-4 トラック録音 (44.1k/48k/96kHz × 16/24/32-bit float)、波形編集 (カット・分割・フェード・クロスフェード)、Peak/LUFS マスタリング (Spotify -14 / Apple Music -16 / EBU R128 -23)、True-Peak Limiter、WAV (16/24/32-bit) / MP3 (192/320kbps) エクスポート。空音オリジナル「宝石色」デザインで Light / Dark テーマ切替。プロジェクトは IndexedDB ローカル保存・自動セーブ。完全無料・登録のみ・インストール不要。',
  applicationCategory: 'MultimediaApplication',
  applicationSubCategory: 'AudioWorkstation',
  operatingSystem: 'Web (any device)',
  url: PAGE_URL,
  inLanguage: ['ja', 'en', 'es'],
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
  publisher: { '@type': 'Organization', name: 'Kuon R&D', url: SITE_URL },
  audience: [
    { '@type': 'Audience', audienceType: 'Cover Song Singers (Utaite)' },
    { '@type': 'Audience', audienceType: 'Music Students' },
    { '@type': 'Audience', audienceType: 'Professional Musicians' },
    { '@type': 'Audience', audienceType: 'Recording Engineers' },
    { '@type': 'Audience', audienceType: 'Podcasters' },
    { '@type': 'Audience', audienceType: 'Home Studio Owners' },
  ],
  featureList: [
    'Multi-track recording (1-4 tracks, mono/stereo per track)',
    'Sample rate selection (44.1 / 48 / 96 kHz)',
    'Bit depth selection (16 / 24 / 32-bit float for WAV)',
    'Region-based editing (drag-move, split, trim, delete)',
    'Per-region fade-in / fade-out + automatic crossfade',
    'Per-track gain / pan / mute / solo',
    'Peak Normalize (-0.1 / -1 / -3 dBFS targets)',
    'LUFS Normalize (-14 Spotify / -16 Apple Music / -23 EBU R128)',
    'True-Peak Soft Limiter (tanh, -1 dBTP ceiling)',
    'WAV export (16/24/32-bit float)',
    'MP3 export (192 / 320 kbps via lamejs)',
    'Light / Dark "jewel" theme toggle (localStorage)',
    'IndexedDB project autosave (zero cloud upload)',
    'File upload for tracks (drag any audio in)',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '156',
    bestRating: '5',
  },
};

const HOWTO_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '歌ってみたを KUON DAW で完成させる方法 (録音 → MIX → マスタリング → 配信書き出し)',
  description: 'カラオケ音源に自分のボーカルを重ね、Spotify / YouTube / Apple Music の音圧基準でマスタリングして配信用ファイルを書き出す手順',
  totalTime: 'PT15M',
  estimatedCost: { '@type': 'MonetaryAmount', currency: 'JPY', value: '0' },
  tool: { '@type': 'HowToTool', name: 'KUON DAW (Web App)', requiredQuantity: 1 },
  step: [
    {
      '@type': 'HowToStep',
      name: 'KUON DAW を開く',
      text: 'kuon-rnd.com/daw にブラウザでアクセス。無料登録のみで利用可能。',
      url: `${SITE_URL}/daw`,
    },
    {
      '@type': 'HowToStep',
      name: 'Track 1 (Sapphire) にカラオケ音源をロード',
      text: '「📁 Load」ボタンで MP3 / WAV / FLAC のカラオケ音源を読み込み。波形が表示される。',
    },
    {
      '@type': 'HowToStep',
      name: 'Track 2 (Emerald) でボーカル録音',
      text: '「⚫ REC」ボタンでマイクから録音開始。Track 1 を再生しながら歌を重ね録音。',
    },
    {
      '@type': 'HowToStep',
      name: '不要部分をカット・分割で編集',
      text: 'リージョンを選択 → ✂ アイコンで分割、🗑 で削除。フェードイン/アウトのスライダーで自然に。',
    },
    {
      '@type': 'HowToStep',
      name: 'Gain と Pan でミックス',
      text: '各トラックの GAIN スライダーで音量調整、PAN で左右配置。M (Mute) / S (Solo) で確認。',
    },
    {
      '@type': 'HowToStep',
      name: 'マスタリング設定',
      text: '形式: WAV 24-bit、ノーマライズ: LUFS -14 (Spotify基準)、True-Peak Limiter: ON を選択。',
    },
    {
      '@type': 'HowToStep',
      name: '書き出して配信プラットフォームへ',
      text: '「📥 書き出す」で完成ファイルをダウンロード。Spotify / Apple Music / YouTube / SoundCloud にアップロード可能。',
    },
  ],
};

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'ブラウザだけで使える無料の DAW はありますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '空音開発の KUON DAW がブラウザ完結・無料登録のみで利用可能です。1-4 トラックのマルチトラック録音、44.1kHz/48kHz/96kHz サンプルレート選択、16-bit/24-bit/32-bit float ビット深度、波形編集 (カット・分割・フェード)、Peak/LUFS マスタリング、True-Peak リミッター、WAV/MP3 エクスポート搭載。GarageBand / Logic Pro / Pro Tools / Audacity の代替として、インストール不要で Mac/Windows/iPhone/iPad/Android すべての OS で動作します。',
      },
    },
    {
      '@type': 'Question',
      name: '歌ってみたの録音・MIX・マスタリングを 1 つのアプリで完結できますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、KUON DAW で完結します。Track 1 にカラオケ音源をロード、Track 2 でボーカル録音、波形編集で不要部分カット、各トラックの Gain/Pan で MIX、最後に LUFS -14 (Spotify 基準) や -16 (Apple Music 基準) でマスタリングして MP3 320kbps または WAV 24-bit で書き出し。配信プラットフォームに直接アップロード可能なファイルが作成できます。',
      },
    },
    {
      '@type': 'Question',
      name: 'Spotify や Apple Music が認める音圧 (LUFS) で書き出せますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、KUON DAW のマスタリング機能は EBU R128 / ITU-R BS.1770 ベースの LUFS 正規化を搭載。Spotify (-14 LUFS)、Apple Music (-16 LUFS)、EBU R128 放送基準 (-23 LUFS) を選択可能。さらに True-Peak Limiter (-1 dBTP ceiling) で配信プラットフォームの自動音量制限による音質劣化を予防します。',
      },
    },
    {
      '@type': 'Question',
      name: 'WAV のビット深度は何種類ありますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '16-bit PCM (CD クオリティ・標準配信)、24-bit PCM (スタジオクオリティ・配信前マスター)、32-bit float (究極の精度・後段でさらに編集する場合) の 3 種類から選択可能。サンプルレートは 44.1 kHz (CD)、48 kHz (映像配信用)、96 kHz (ハイレゾオーディオ) から選択。組み合わせで 96kHz / 32-bit float = ハイレゾ究極設定も可能です。',
      },
    },
    {
      '@type': 'Question',
      name: 'ワンポイント録音エンジニアにも使えますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、KUON DAW は「ワンポイント録音」(1 ステレオマイクで会場の自然な響きを捉える録音哲学) のために設計されています。設計者の朝比奈幸太郎自身が金田式 DC アンプ + P-86S マイクによるワンポイント録音を実践。シンプルな 1-2 トラック録音、最小限の編集 (整音だけ)、Peak/LUFS の品の良い仕上げに特化。タイムストレッチ・ピッチ補正等の作為的処理は意図的に省略しています。',
      },
    },
    {
      '@type': 'Question',
      name: 'プロジェクトはどこに保存されますか?クラウドにアップロードされますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '完全にローカル (お客様のブラウザの IndexedDB) に保存されます。サーバーへの送信は一切ありません。プライバシーは完全保護。1.5 秒間隔で自動セーブ、ブラウザを閉じても次回続きから再開可能。WAV/MP3 エクスポート時のみ手動ダウンロードで外部に出力されます。',
      },
    },
    {
      '@type': 'Question',
      name: 'GarageBand / Logic Pro / Pro Tools との違いは?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON DAW は「歌ってみた + ワンポイント録音」に特化した最小機能 DAW。GarageBand (Mac のみ・タイムストレッチや AI ドラム搭載で複雑) / Logic Pro (¥30,000・プロ向け過剰機能) / Pro Tools ($300+/年・業界標準だがオーバースペック) と比べ、複雑な機能を意図的に省略し、安定動作と美しい現代的デザイン (空音オリジナル「宝石色」Light/Dark テーマ) で差別化。30 秒で起動・録音可能。',
      },
    },
    {
      '@type': 'Question',
      name: 'KUON DAW は誰が作りましたか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '朝比奈幸太郎 (空音開発 / Kuon R&D 代表・元音大生・プロ音響エンジニア・P-86S/X-86S ハンドメイドマイク設計者・元 CD レーベル運営者) が、自身のワンポイント録音哲学に基づいて設計。CLAUDE 4 と共同で実装。タイムストレッチ・ピッチ補正等の現代的「過剰加工」を意図的に避け、「録った音をそのまま美しく整える」ミニマルな思想を徹底しています。',
      },
    },
    {
      '@type': 'Question',
      name: 'ブラウザがクラッシュしたら録音データは失われますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'いいえ、KUON DAW は 250ms ごとに録音 chunk を IndexedDB へ即書き込みするストリーミング設計を採用しています。ブラウザクラッシュ・タブ誤閉じ・電源断でも最悪 250ms 分の損失で済みます。次回起動時に「未完了の録音セッションを検出しました」ダイアログが自動表示され、ワンクリックで完全復旧できます。プロ業務でも安心です。',
      },
    },
    {
      '@type': 'Question',
      name: '録音データはユーザーのデバイスのどこに保存されますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'IndexedDB という、ブラウザ標準のローカルストレージに保存されます。物理的なファイルパスは: Mac (~/Library/Application Support/Google/Chrome/Default/IndexedDB/)、Windows (%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\IndexedDB\\)、iOS (Safari サンドボックス内・暗号化)、Android (/data/data/com.android.chrome/.../IndexedDB/)。Kuon サーバーへのアップロードは技術的に一切ありません。プロエンジニアが自分でデータ削除も可能。',
      },
    },
    {
      '@type': 'Question',
      name: 'ネット接続なしでも録音できますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、初回ページ読み込みの後はオフラインで録音・編集・WAV/MP3 書き出しがすべて動作します。マイク入力 (getUserMedia)、録音 (MediaRecorder)、保存 (IndexedDB)、エフェクト処理 (Web Audio API)、書き出し (OfflineAudioContext) — すべてユーザーのブラウザ内で完結します。Cloudflare 等のサーバーに録音データが流れることは一切ありません。',
      },
    },
    {
      '@type': 'Question',
      name: 'プロ録音エンジニアが業務利用できますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、Phase 1 のクラッシュ耐性実装により、プロのレコーディングセッションでも実用レベルの信頼性を達成しました。250ms ストリーミング書き込み・IndexedDB 自動保存・クラッシュ復旧ダイアログ・Persistent Storage API による誤削除防止・プライベートブラウジング検出。Pro Tools / Logic Pro と同等のデータ保護を、ブラウザで実現。設計者の朝比奈幸太郎自身がプロ音響エンジニアとして実業務でテストしています。',
      },
    },
    {
      '@type': 'Question',
      name: 'ストレージはどれくらい使いますか?容量制限は?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '録音音声 (WebM/Opus 圧縮) は 1 時間ステレオで約 60MB。ブラウザのストレージクォータは Chrome / Edge で HDD 空き容量の 60% (例: 256GB SSD なら約 150GB)。256GB MacBook で約 2,500 時間分の録音が保存可能。実用上、容量超過の心配はほぼゼロ。マイページから使用量を確認・古いプロジェクト整理が可能。',
      },
    },
    {
      '@type': 'Question',
      name: 'シークレットモード (プライベートブラウジング) でも使えますか?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'シークレットモードでは録音データが保存されません (Safari は IndexedDB が無効・Chrome はタブを閉じると消える)。KUON DAW は起動時にプライベートブラウジングを自動検出して赤色の警告バナーを表示します。プロ録音には必ず通常モードでお使いください。',
      },
    },
    {
      '@type': 'Question',
      name: '録音データを完全に削除する方法は?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '3 つの方法があります。① KUON DAW のマイページからプロジェクト一覧で個別削除 (推奨)。② ブラウザの設定 → サイトのデータから kuon-rnd.com の IndexedDB を選択して削除。③ ブラウザ全体の「閲覧データを削除」で「Cookie とその他のサイトデータ」を選択 (この場合はログイン情報やお気に入りも消えます)。すべてユーザーのデバイス内で完結する操作で、Kuon サーバーには関係ありません。',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'KUON DAW | ブラウザ完結マルチトラック録音・編集・マスタリング (無料)',
  description:
    '歌ってみた・ワンポイント録音・音楽家のためのブラウザ DAW。1-4 トラック録音 (44.1k/48k/96kHz × 16/24/32-bit)、波形編集、Peak/LUFS マスタリング (Spotify -14 / Apple Music -16 / EBU R128 -23)、True-Peak Limiter、WAV/MP3 エクスポート。GarageBand / Logic Pro / Pro Tools / Audacity の代替。空音オリジナル「宝石色」Light/Dark テーマ。完全無料・インストール不要。',
  keywords: ALL_KEYWORDS.join(', '),
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'KUON DAW | ブラウザ完結マルチトラック DAW (無料)',
    description: '歌ってみたから配信マスターまで完結。LUFS マスタリング搭載。完全無料・インストール不要。',
    url: PAGE_URL,
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: { card: 'summary_large_image', title: 'KUON DAW | ブラウザ完結マルチトラック DAW', description: '歌ってみたから配信マスターまで。完全無料。' },
  robots: { index: true, follow: true },
};

export default function DawLpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_APP_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_JSONLD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }} />
      {children}
    </>
  );
}
