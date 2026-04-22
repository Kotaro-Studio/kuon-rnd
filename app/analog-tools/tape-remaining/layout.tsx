import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reel Remaining Calculator | Kuon Analog Tools',
  description: 'Measure your wind depth and instantly compute remaining tape length and recording time. Supports NAB/CCIR/7"/10" hubs and Standard/LP/DP/Triple thicknesses. Free browser tool for open-reel engineers worldwide.',
  keywords: [
    'reel remaining calculator', 'tape remaining time', 'NAB hub 10 inch',
    'CCIR reel', 'LP tape thickness', 'Triple Play tape',
    'open reel calculator', 'Revox tape length', 'Studer reel remaining',
    'リール残量 計算', 'オープンリール 残量', 'テープ残り時間',
  ],
  openGraph: {
    title: 'Reel Remaining Calculator — Kuon Analog Tools',
    description: 'Measure wind depth, get remaining length and time. NAB/CCIR hubs, 4 thicknesses, 5 speeds.',
    url: 'https://kuon-rnd.com/analog-tools/tape-remaining',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reel Remaining Calculator',
    description: 'Measure wind depth, get remaining length and time.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/analog-tools/tape-remaining',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
