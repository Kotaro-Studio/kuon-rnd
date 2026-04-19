export const runtime = 'edge';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event — 空音開発 Kuon R&D',
  description: 'Live event details — 空音開発 Kuon R&D',
  openGraph: {
    title: 'Live Event — 空音開発 Kuon R&D',
    description: 'Live music event details',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: { card: 'summary' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
