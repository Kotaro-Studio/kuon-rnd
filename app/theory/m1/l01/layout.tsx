import type { Metadata } from 'next';

export const metadata: Metadata = {
  // OMT v2 Part I 第 1 章 (Chelsey Hamm 著)
  title: 'M1-01 西洋音楽記譜法の導入 | KUON Music Theory Suite',
  description: '西洋音楽記譜法は、世界に存在する多くの記譜システムの一つに過ぎません。Sargam、工尺譜、階名、数字、周波数 — 同じ音楽を異なる記譜で表現できます。Open Music Theory v2 Part I 第 1 章に厳密対応。',
  alternates: { canonical: 'https://kuon-rnd.com/theory/m1/l01' },
  openGraph: {
    title: 'M1-01 Introduction to Western Musical Notation — KUON Music Theory Suite',
    description: 'Western notation is one of many systems across cultures. The same melody, multiple notations — and none is "the right one."',
    url: 'https://kuon-rnd.com/theory/m1/l01',
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
