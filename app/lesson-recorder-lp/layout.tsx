import type { Metadata } from 'next';

const TITLE_JA = 'KUON LESSON RECORDER — 音楽レッスン録音 AI 書き起こし & 要約 | 空音開発';
const DESC_JA =
  '音楽レッスンの録音を AI が自動で書き起こし、3 行サマリー・アクション項目・音楽用語解説まで一気に生成。話者を教師/生徒に推定、99 言語対応の Whisper + Llama 3.3 70B + M2M100 翻訳を Cloudflare Workers AI で高速処理。Markdown / SRT / JSON エクスポート、過去レッスン意味検索付き。Prelude プラン (¥780/月) から月 15 回利用可能。';

const KEYWORDS_JA = [
  'レッスン録音', '音楽レッスン書き起こし', 'AI 文字起こし', 'Whisper 音声認識',
  'レッスンノート自動生成', '音大生 アプリ', 'ピアノレッスン', 'ヴァイオリンレッスン',
  '声楽レッスン', '楽器レッスン 記録', 'マスタークラス 書き起こし', '音楽教室 議事録',
  '指導記録', 'AI 要約 音楽', '音楽用語 認識', '話者分離 音楽',
  'ブラウザ録音アプリ', 'クラシック音楽 学習', '音楽教師 ツール', '練習計画 AI',
  'レッスン振り返り', '次回宿題 自動抽出', '音楽 アクション項目',
  'KUON LESSON RECORDER', '空音開発', 'kuon-rnd', '朝比奈幸太郎',
  'Cloudflare Workers AI', 'edge AI', 'プライバシー保護 録音', 'サーバー保存なし',
  'タイムスタンプ付き', 'SRT 字幕', 'Markdown 出力', 'Notion 連携',
  '99 言語対応', '多言語翻訳', '日英同時記録', 'オペラ レッスン',
  'コンセルバトワール 留学', 'マスタークラス 海外', '指揮レッスン', '室内楽 レッスン',
  '練習日誌', 'レッスン日記', '音楽学習 記録', '上達 可視化',
  'Llama 3.3 70B', 'M2M100 翻訳', 'BGE-m3 埋め込み', '意味検索 過去レッスン',
];

const TITLE_EN = 'KUON LESSON RECORDER — AI Music Lesson Transcription & Summary | KUON R&D';
const DESC_EN =
  'AI-powered transcription, 3-line summary, and action items for music lesson recordings. Speaker detection, music terminology recognition, 99-language support via Workers AI Whisper-large-v3-turbo + Llama 3.3 70B + M2M100. Markdown/SRT/JSON export, semantic search across past lessons. From ¥780/month (Prelude plan), 20 transcriptions/month.';

const KEYWORDS_EN = [
  'music lesson transcription', 'lesson notes AI', 'whisper transcribe music',
  'piano lesson recorder', 'violin lesson notes', 'voice lesson transcript',
  'masterclass transcription', 'music school notes', 'conservatory lesson notes',
  'music teacher tool', 'AI music summary', 'lesson action items',
  'browser-based transcription', 'workers AI music', 'edge AI transcription',
  'lesson archive', 'semantic search music', 'multilingual lesson notes',
  'music vocabulary AI', 'speaker diarization music', 'pedagogical AI',
  'music education AI', 'practice diary AI', 'opera lesson recorder',
  'chamber music coaching', 'instrumental lesson notes', 'studio lesson archive',
  'KUON LESSON RECORDER', 'KUON R&D', 'kuon-rnd', 'Kotaro Asahina',
];

const TITLE_ES = 'KUON LESSON RECORDER — Transcripción IA de Clases de Música | KUON R&D';
const DESC_ES =
  'Transcripción automática, resumen y tareas con IA para grabaciones de clases de música. Detección de hablantes, reconocimiento de terminología musical, 99 idiomas con Workers AI. Exportación Markdown/SRT/JSON. Desde ¥780/mes (Prelude), 20 transcripciones/mes.';

export const metadata: Metadata = {
  metadataBase: new URL('https://kuon-rnd.com'),
  title: TITLE_JA,
  description: DESC_JA,
  keywords: KEYWORDS_JA.concat(KEYWORDS_EN).join(', '),
  authors: [{ name: '朝比奈幸太郎 (Kotaro Asahina)', url: 'https://kuon-rnd.com/profile' }],
  creator: '朝比奈幸太郎 / KUON R&D',
  publisher: 'KUON R&D / 空音開発',
  applicationName: 'KUON Lesson Recorder',
  alternates: {
    canonical: 'https://kuon-rnd.com/lesson-recorder-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/lesson-recorder-lp',
      'en': 'https://kuon-rnd.com/lesson-recorder-lp',
      'es': 'https://kuon-rnd.com/lesson-recorder-lp',
      'ko': 'https://kuon-rnd.com/lesson-recorder-lp',
      'pt': 'https://kuon-rnd.com/lesson-recorder-lp',
      'de': 'https://kuon-rnd.com/lesson-recorder-lp',
    },
  },
  openGraph: {
    title: TITLE_JA,
    description: DESC_JA,
    url: 'https://kuon-rnd.com/lesson-recorder-lp',
    siteName: 'KUON R&D / 空音開発',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES', 'ko_KR', 'pt_BR', 'de_DE'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE_EN,
    description: DESC_EN,
    creator: '@kotaro_asahina',
  },
  robots: {
    index: true, follow: true,
    googleBot: {
      index: true, follow: true,
      'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1,
    },
  },
  category: 'Music Education / AI / Productivity',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
