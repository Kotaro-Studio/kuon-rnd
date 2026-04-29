import type { Metadata } from 'next';

export const metadata: Metadata = {
  // OMT v2 Part IV 第 1 章 (Introduction to Harmony, Cadences, and Phrase Endings) = M4-01
  title: 'M4-01 カデンツの種類 — 機能和声への導入 | KUON Music Theory Suite',
  description: '完全終止・不完全終止・半終止・偽終止 — Bach が選んだ音楽の句読点。M4 機能和声の最初のレッスン。本物の和声を聴き、識別し、声部進行違反を可視化する。',
  alternates: { canonical: 'https://kuon-rnd.com/theory/m4/l01' },
  openGraph: {
    title: 'M4-01 Cadences — KUON Music Theory Suite',
    description: 'Perfect / Imperfect / Half / Deceptive cadences — the punctuation of music as Bach used it. The opening lesson of Diatonic Harmony.',
    url: 'https://kuon-rnd.com/theory/m4/l01',
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
