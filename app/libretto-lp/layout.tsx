import type { Metadata } from 'next';

const TITLE_JA = 'KUON LIBRETTO TRANSLATOR — オペラリブレット 5 段並列翻訳 (伊・独・仏 → 日本語) | 空音開発';
const DESC_JA =
  '声楽家・指揮者・音大生のためのオペラリブレット統合学習環境。原文 / IPA / 直訳 / 歌唱訳 / 文学訳の 5 段並列表示。Mozart・Verdi・Puccini・Bizet サンプル収録。任意のリブレットを貼り付けて AI 翻訳。行ごとに「Pavarotti はここでどう歌った?」のような解釈質問可。Concerto プラン (¥1,480/月) 以上で月 60 翻訳から。';

const KEYWORDS_JA = [
  'オペラ リブレット 翻訳', '声楽 リブレット 対訳', '音大 オペラ', 'IPA 発音記号 オペラ',
  'Mozart オペラ 対訳', 'Verdi リブレット 翻訳', 'Puccini リブレット 日本語', 'Bizet Carmen 対訳',
  'オペラ 歌唱訳', 'オペラ 直訳', 'オペラ 文学訳', '声楽 ディクション', 'オペラ 発音',
  'コレペティ ツール', '指揮者 オペラ 学習', '音大 声楽 リブレット', 'オペラアリア 解釈',
  'Don Giovanni Madamina', 'Voi che sapete', 'Habanera Carmen', 'Che gelida manina',
  '夜の女王 アリア 歌詞', 'Sempre libera 翻訳', 'KUON LIBRETTO TRANSLATOR', '空音開発', '朝比奈幸太郎',
];

const TITLE_EN = 'KUON LIBRETTO TRANSLATOR — 5-Layer Opera Libretto Translation | KUON R&D';
const DESC_EN =
  'Integrated opera libretto learning environment for singers, conductors, and music students. 5-layer parallel display: original / IPA / literal / singing / literary. Mozart, Verdi, Puccini, Bizet sample arias. Paste any libretto for AI translation. Per-line interpretive Q&A. From ¥1,480/month (Concerto), 60 translations.';

const KEYWORDS_EN = [
  'opera libretto translation', 'opera diction tool', 'IPA opera', 'singing translation opera',
  'Mozart libretto English', 'Verdi libretto translation', 'Puccini libretto', 'Carmen libretto French',
  'opera study tool', 'conservatory voice student', 'repetiteur tool', 'conductor opera study',
  'aria interpretation AI', 'voice student opera', 'opera vocal coach AI',
  'Don Giovanni Madamina translation', 'Voi che sapete translation', 'Habanera Carmen translation',
  'KUON LIBRETTO TRANSLATOR', 'KUON R&D', 'Kotaro Asahina',
];

export const metadata: Metadata = {
  metadataBase: new URL('https://kuon-rnd.com'),
  title: TITLE_JA,
  description: DESC_JA,
  keywords: KEYWORDS_JA.concat(KEYWORDS_EN).join(', '),
  authors: [{ name: '朝比奈幸太郎 (Kotaro Asahina)', url: 'https://kuon-rnd.com/profile' }],
  creator: '朝比奈幸太郎 / KUON R&D',
  publisher: 'KUON R&D / 空音開発',
  applicationName: 'KUON Libretto Translator',
  alternates: {
    canonical: 'https://kuon-rnd.com/libretto-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/libretto-lp',
      'en': 'https://kuon-rnd.com/libretto-lp',
      'es': 'https://kuon-rnd.com/libretto-lp',
      'de': 'https://kuon-rnd.com/libretto-lp',
      'ko': 'https://kuon-rnd.com/libretto-lp',
      'pt': 'https://kuon-rnd.com/libretto-lp',
    },
  },
  openGraph: {
    title: TITLE_JA,
    description: DESC_JA,
    url: 'https://kuon-rnd.com/libretto-lp',
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
  category: 'Music Education / Opera / AI Translation',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
