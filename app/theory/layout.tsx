import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON Music Theory Suite — 16モジュール553レッスンの目次 | 楽典・和声・聴音・視唱 | 空音開発',
  description: '16モジュール553レッスンの音楽理論カリキュラムの目次。楽典基礎から音大卒業レベルまで、Open Music Theory v2を骨格にした完全コース。',
  alternates: { canonical: 'https://kuon-rnd.com/theory' },
  openGraph: {
    title: 'KUON Music Theory Suite Hub',
    description: '16 modules · 553 lessons · OMT v2 foundation',
    url: 'https://kuon-rnd.com/theory',
    type: 'website',
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function TheoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
