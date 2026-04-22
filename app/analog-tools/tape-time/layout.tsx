import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tape Recording Time Calculator | Kuon Analog Tools',
  description: 'Convert tape length (ft/m/cm) and speed into recording time instantly. Presets for 1200/1800/2500/3600/4800 ft reels. Supports 4.75 to 76 cm/s. Free browser tool.',
  keywords: [
    'tape recording time calculator', 'open reel time calculator',
    '1800 ft reel time', '2500 ft tape time', 'NAB reel time',
    'tape duration', 'reel to reel time', 'cm/s ips tape speed',
    'テープ 録音時間', 'オープンリール 時間', 'テープ残量',
  ],
  openGraph: {
    title: 'Tape Recording Time Calculator — Kuon Analog Tools',
    description: 'Length (ft/m) × speed → time. Presets for standard reels.',
    url: 'https://kuon-rnd.com/analog-tools/tape-time',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Tape Recording Time Calculator', description: 'Length × speed → time.' },
  alternates: { canonical: 'https://kuon-rnd.com/analog-tools/tape-time' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
