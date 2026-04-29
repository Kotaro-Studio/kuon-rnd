import type { Metadata } from 'next';

export const metadata: Metadata = {
  // OMT v2 Part I 第 2 章前半 (Chelsey Hamm 著)
  title: 'M1-02 音符の記譜と五線 | KUON Music Theory Suite',
  description: '音符は高さとリズムを同時に伝える記号。五線とは何か、音符をどう配置するか — 西洋記譜法の最も基本的なルール。古代ギリシャでは高音を下に書いた歴史も学ぶ。OMT v2 Part I 第 2 章準拠。',
  alternates: { canonical: 'https://kuon-rnd.com/theory/m1/l02' },
  openGraph: {
    title: 'M1-02 Notation of Notes and the Staff — KUON Music Theory Suite',
    description: 'Notes encode pitch and rhythm. The staff and how notes sit on it — the basics of Western notation, with a glance at the ancient Greek alternative.',
    url: 'https://kuon-rnd.com/theory/m1/l02',
    type: 'article',
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function LessonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
