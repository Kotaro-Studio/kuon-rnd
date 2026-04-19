import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Today's Live — ライブ・イベントマップ | 空音開発 Kuon R&D",
  description: '世界中の音楽ライブ・コンサート・イベントを地図で探せる。旅行中でもコンサートが見つかる。Find live music events around the world on an interactive map.',
  keywords: ['ライブ', 'コンサート', 'イベント', 'マップ', '音楽', 'live music', 'concert', 'events', 'map', 'kuon'],
  openGraph: {
    title: "Today's Live — 空音開発 Kuon R&D",
    description: '世界中の音楽ライブ・イベントを地図で探そう',
    url: 'https://kuon-rnd.com/events',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://kuon-rnd.com/events' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
