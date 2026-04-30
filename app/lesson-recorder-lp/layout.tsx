import type { Metadata } from 'next';

const TITLE_JA = 'KUON LESSON RECORDER — 音楽レッスン録音を一生の財産に | 空音開発';
const DESC_JA =
  '音楽の現場に特化した AI が、レッスンを書き起こし、3 行の本質に磨き上げ、次回までの宿題まで抽出。先生と生徒の発話を識別、カデンツやモーダル等の専門用語も正確認識、90+ 言語対応、Markdown / SRT / JSON 出力、過去レッスンの意味検索つき。音源は処理直後に消える設計。月 ¥780 から、月 15 回。音大生・プロ音楽家・教師のための知識装置。';

const KEYWORDS_JA = [
  'レッスン録音', '音楽レッスン書き起こし', 'AI 文字起こし', 'レッスンノート自動生成',
  '音大生 アプリ', 'ピアノレッスン 記録', 'ヴァイオリンレッスン', '声楽レッスン 書き起こし',
  '楽器レッスン 振り返り', 'マスタークラス 書き起こし', '音楽教室 議事録', '指導記録 AI',
  'AI 要約 音楽', '音楽用語 認識', '話者分離 音楽', 'ブラウザ録音アプリ',
  'クラシック音楽 学習', '音楽教師 ツール', '練習計画 AI', 'レッスン振り返り',
  '次回宿題 自動抽出', '音楽 アクション項目', '音楽家 ノート', 'KUON LESSON RECORDER',
  '空音開発', 'kuon-rnd', '朝比奈幸太郎', 'プライバシー保護 録音', 'サーバー保存なし',
  'タイムスタンプ付き', 'SRT 字幕', 'Markdown 出力', 'Notion 連携',
  '90 言語対応', '多言語翻訳', '日英同時記録', 'オペラ レッスン',
  'コンセルバトワール 留学', 'マスタークラス 海外', '指揮レッスン', '室内楽 レッスン',
  '練習日誌', 'レッスン日記', '音楽学習 記録', '上達 可視化',
  '音楽特化 AI', '意味検索 過去レッスン', '音楽家のための AI', '音大留学 サポート',
];

const TITLE_EN = 'KUON LESSON RECORDER — Turn Music Lessons Into Lifelong Knowledge | KUON R&D';
const DESC_EN =
  'A music-specialized AI transcribes your lessons, distills them into 3-line essence, and extracts next-time homework. Detects teacher and student, recognizes terms like cadence and modal mixture, supports 90+ languages, exports Markdown/SRT/JSON, and lets you search past lessons by meaning. Audio is wiped after processing. From ¥780/month, 15 transcriptions. For conservatory students, pros, and music teachers.';

const KEYWORDS_EN = [
  'music lesson transcription', 'lesson notes AI', 'piano lesson recorder',
  'violin lesson notes', 'voice lesson transcript', 'masterclass transcription',
  'music school notes', 'conservatory lesson notes', 'music teacher tool',
  'AI music summary', 'lesson action items', 'browser-based transcription',
  'lesson archive', 'multilingual lesson notes', 'music vocabulary recognition',
  'pedagogical AI', 'music education AI', 'practice diary AI',
  'opera lesson recorder', 'chamber music coaching', 'instrumental lesson notes',
  'studio lesson archive', 'KUON LESSON RECORDER', 'KUON R&D', 'kuon-rnd',
  'Kotaro Asahina', 'private lesson recording', 'masterclass abroad',
];

const TITLE_ES = 'KUON LESSON RECORDER — Convierte tus clases en patrimonio | KUON R&D';
const DESC_ES =
  'Una IA especializada en música transcribe tus clases, las destila en 3 líneas y extrae las tareas para la próxima vez. Distingue al profesor y al estudiante, reconoce términos como cadencia y mezcla modal, soporta 90+ idiomas. El audio se borra inmediatamente. Desde ¥780/mes, 15 transcripciones.';

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
