import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'M1-12 三和音の基本形と転回形 | KUON Music Theory Suite',
  description: '三和音 — 基本形・第 1 転回形・第 2 転回形。Bach がベースラインの美しさのために選んだ転回。本物の和声を聴き、識別する。Layer 1 (物語) + Layer 2 (Living Score) + Layer 3 (記憶)。',
  alternates: { canonical: 'https://kuon-rnd.com/theory/m1/l12' },
  openGraph: {
    title: 'M1-12 Triads & Inversions — KUON Music Theory Suite',
    description: 'Triads in root position, first inversion, second inversion — colors and bass-line consequences.',
    url: 'https://kuon-rnd.com/theory/m1/l12',
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
