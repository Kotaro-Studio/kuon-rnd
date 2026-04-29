import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'M4-04 カデンツの種類 | KUON Music Theory Suite',
  description: '完全終止・不完全終止・半終止・偽終止 — Bach が選んだ音楽の句読点。本物の和声を聴き、識別し、声部進行違反を可視化する。Layer 1 (物語) + Layer 2 (Living Score) + Layer 3 (記憶)。',
  alternates: { canonical: 'https://kuon-rnd.com/theory/m4/l04' },
  openGraph: {
    title: 'M4-04 Cadences — KUON Music Theory Suite',
    description: 'Perfect / Imperfect / Half / Deceptive cadences — the punctuation of music as Bach used it.',
    url: 'https://kuon-rnd.com/theory/m4/l04',
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
