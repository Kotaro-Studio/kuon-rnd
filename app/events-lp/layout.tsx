import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Today's Live — ライブ・コンサート情報マップ — 空音開発 Kuon R&D",
  description:
    '世界中の音楽ライブ・コンサート・リサイタルを地図上で探せる。アーティストは無料で集客、ファンは旅先でも音楽に出会える。',
  keywords: [
    'ライブ情報', 'コンサート検索', 'リサイタル', '音楽イベント', 'ライブマップ',
    'live music map', 'concert finder', 'recital', 'music events',
    'conciertos', 'eventos musicales',
  ],
  openGraph: {
    title: "Today's Live — ライブ・コンサート情報マップ",
    description: '世界中のライブを地図上で。アーティストもファンも、音楽でつながる。',
    url: 'https://kuon-rnd.com/events-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://kuon-rnd.com/events-lp' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
