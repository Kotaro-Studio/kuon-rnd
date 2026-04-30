import type { Metadata } from 'next';

const TITLE_JA = 'KUON LIBRETTO TRANSLATOR — オペラリブレットを 5 段並列翻訳 (伊・独・仏 → 日本語) | 空音開発';
const DESC_JA =
  '声楽家・指揮者・音楽学生のためのオペラリブレット統合翻訳環境。原文・IPA・直訳・歌唱訳・文学訳の 5 段並列表示。Mozart / Verdi / Puccini / Bizet サンプル収録。任意のリブレットも貼り付けて翻訳可能。月 60 翻訳から月 600 翻訳まで。Concerto プラン以上で利用可能。';

export const metadata: Metadata = {
  metadataBase: new URL('https://kuon-rnd.com'),
  title: TITLE_JA,
  description: DESC_JA,
  alternates: { canonical: 'https://kuon-rnd.com/libretto' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
