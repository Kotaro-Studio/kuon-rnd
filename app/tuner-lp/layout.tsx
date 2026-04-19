import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON TUNER PRO — 高精度クロマチックチューナー — 空音開発 Kuon R&D',
  description: '音大生・音楽学習者のための無料高精度チューナー。YINアルゴリズムによる正確なピッチ検出、移調楽器対応、練習記録・成長可視化。ブラウザだけで使える。',
  keywords: [
    'チューナー', 'クロマチックチューナー', 'ピッチ検出', '音程', '調律',
    'chromatic tuner', 'pitch detector', 'music tuner', 'instrument tuner',
    '튜너', '크로마틱 튜너', '피치 감지', '악기 튜너',
    'afinador', 'afinador cromático',
    '音大', '吹奏楽', '管楽器', 'オーケストラ',
  ],
  openGraph: {
    title: 'KUON TUNER PRO — 高精度クロマチックチューナー',
    description: 'YINアルゴリズムによる±1セント精度。移調楽器対応。練習記録で成長が見える。',
    url: 'https://kuon-rnd.com/tuner-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://kuon-rnd.com/tuner-lp' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
