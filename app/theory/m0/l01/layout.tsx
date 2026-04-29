import type { Metadata } from 'next';

export const metadata: Metadata = {
  // Kuon オリジナル M0 (Pre-notational) — OMT v2 範囲外
  title: 'M0-01 音とは何か | KUON Music Theory Suite',
  description: '音楽を理解する最初のレッスン。空気の振動・耳の仕組み・周波数と音色 — 譜面を読む前に、音そのものに触れる。Kuon オリジナル M0「音楽との最初の出会い」第 1 弾。',
  alternates: { canonical: 'https://kuon-rnd.com/theory/m0/l01' },
  openGraph: {
    title: 'M0-01 What is Sound? — KUON Music Theory Suite',
    description: 'The first lesson before notation. Air vibration, the ear, frequency and timbre — touch the sound itself before reading any staff.',
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
