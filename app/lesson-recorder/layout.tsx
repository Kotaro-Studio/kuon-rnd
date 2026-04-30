import type { Metadata } from 'next';

const TITLE = 'KUON LESSON RECORDER — レッスン録音 AI 書き起こし | 空音開発';
const DESC =
  '音楽レッスンの録音を AI が自動で書き起こし・要約・アクション項目化。話者を教師/生徒に推定、音楽専門用語を自動認識、多言語翻訳、Markdown/PDF/SRT 出力。Prelude プランから月 15 回利用可能。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: 'https://kuon-rnd.com/lesson-recorder' },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: 'https://kuon-rnd.com/lesson-recorder',
    siteName: 'KUON R&D / 空音開発',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
