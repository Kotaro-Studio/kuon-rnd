import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'M0-01 五線と音名 | KUON Music Theory Suite',
  description: '五線と音名を学ぶ最初のレッスン。グイド・ダレッツォ起源の譜表を、本物の音とともに対話的に理解する。Layer 1 (物語) + Layer 2 (Living Score) + Layer 3 (記憶)。',
  alternates: { canonical: 'https://kuon-rnd.com/theory/m0/l01' },
  openGraph: {
    title: 'M0-01 五線と音名 — KUON Music Theory Suite',
    description: 'The Staff and Pitch Names — first lesson of KUON Music Theory Suite.',
    url: 'https://kuon-rnd.com/theory/m0/l01',
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
