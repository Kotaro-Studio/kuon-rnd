import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Performance Time Calculator | Jazz & Classical Structure | Kuon',
  description: 'Compute exact performance time from BPM, time signature, bar count, and chorus count. Supports 4/4, 3/4, 5/4, 6/8, 7/8, 12/8. Separate intro / theme / solo / ending sections. Essential for live recording planning.',
  keywords: [
    'performance time calculator', 'jazz time calculator', 'BPM bar time',
    'music duration calculator', 'chorus count calculator',
    'time signature performance time', 'recording session planner',
    'live recording duration', '演奏時間 計算', '曲尺 計算',
  ],
  openGraph: {
    title: 'Performance Time Calculator — Jazz & Classical',
    description: 'BPM × time signature × bars × choruses → exact performance time.',
    url: 'https://kuon-rnd.com/analog-tools/jazz-time',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Performance Time Calculator', description: 'BPM × form → time.' },
  alternates: { canonical: 'https://kuon-rnd.com/analog-tools/jazz-time' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
