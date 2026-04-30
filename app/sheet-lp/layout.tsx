import type { Metadata } from 'next';

const TITLE_JA = 'KUON SHEET — ブラウザで動くリードシートエディタ + 画像スキャン (歌詞・コード・メロディ) | 空音開発';
const DESC_JA =
  'シンガーソングライター・ジャズ奏者・ポップス作曲家のためのブラウザ完結リードシートエディタ。メロディ + コードネーム + 歌詞を 1 画面で美しく編集。手書きの楽譜は画像スキャンで自動 ABC 化。日本語・英語・スペイン語・ドイツ語の歌詞対応。PDF・MIDI ダウンロード。エディタは無料、画像スキャンは Concerto プラン (¥1,480/月) から。';

const KEYWORDS_JA = [
  'リードシート 作成', 'コード譜 アプリ', 'リードシート ブラウザ', '歌詞 メロディ コード 譜面',
  'シンガーソングライター 譜面', '弾き語り 楽譜', 'ジャズ リードシート', 'ポップス コード譜',
  '手書き 楽譜 デジタル化', 'OMR 楽譜認識', 'ABC notation エディタ', '譜面 PDF 出力',
  '楽譜 MIDI 書き出し', 'コード進行 メモ', 'バンドスコア 簡易', 'メロディ コード 歌詞',
  '日本語 歌詞 楽譜', '英語 歌詞 楽譜', '譜面 自動清書', '楽譜 画像認識',
  'KUON SHEET', '空音開発', '朝比奈幸太郎',
];

const TITLE_EN = 'KUON SHEET — Browser Lead Sheet Editor + Image Scan | KUON R&D';
const DESC_EN =
  'Browser-native lead sheet editor for singer-songwriters, jazz players, and pop composers. Melody + chord symbols + lyrics on a single page. Scan handwritten sheets — AI converts them to editable ABC notation. Japanese, English, Spanish, German lyrics. PDF and MIDI download. Editor free; image scanning from Concerto (¥1,480/month).';

const KEYWORDS_EN = [
  'lead sheet editor', 'chord chart app', 'browser lead sheet', 'melody chord lyrics editor',
  'singer songwriter sheet music', 'jazz lead sheet', 'pop chord chart', 'handwritten sheet music OCR',
  'OMR optical music recognition', 'ABC notation editor', 'sheet music PDF export', 'sheet music MIDI export',
  'songwriter notation tool', 'lead sheet creator', 'chord progression memo', 'real book editor',
  'Spanish lyrics sheet', 'German lyrics sheet', 'KUON SHEET', 'KUON R&D', 'Kotaro Asahina',
];

export const metadata: Metadata = {
  metadataBase: new URL('https://kuon-rnd.com'),
  title: TITLE_JA,
  description: DESC_JA,
  keywords: KEYWORDS_JA.concat(KEYWORDS_EN).join(', '),
  authors: [{ name: '朝比奈幸太郎 (Kotaro Asahina)', url: 'https://kuon-rnd.com/profile' }],
  creator: '朝比奈幸太郎 / KUON R&D',
  publisher: 'KUON R&D / 空音開発',
  applicationName: 'KUON Sheet',
  alternates: {
    canonical: 'https://kuon-rnd.com/sheet-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/sheet-lp',
      'en': 'https://kuon-rnd.com/sheet-lp',
      'es': 'https://kuon-rnd.com/sheet-lp',
      'de': 'https://kuon-rnd.com/sheet-lp',
      'ko': 'https://kuon-rnd.com/sheet-lp',
      'pt': 'https://kuon-rnd.com/sheet-lp',
    },
  },
  openGraph: {
    title: TITLE_JA,
    description: DESC_JA,
    url: 'https://kuon-rnd.com/sheet-lp',
    siteName: 'KUON R&D / 空音開発',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES', 'de_DE', 'ko_KR', 'pt_BR'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE_EN,
    description: DESC_EN,
  },
  robots: {
    index: true, follow: true,
    googleBot: {
      index: true, follow: true,
      'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1,
    },
  },
  category: 'Music Composition / Lead Sheet Editor',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
