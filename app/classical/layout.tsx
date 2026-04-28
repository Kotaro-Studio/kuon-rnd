import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON CLASSICAL ANALYSIS — Western art music を、科学的に読み解く | 空音開発',
  description:
    'バッハのコラール、モーツァルトのソナタ、ベートーベンの四重奏曲を瞬時にローマ数字で分析。声部進行違反検出・転調マップ・調性判定。music21 ベース・600+ 楽曲のキュレーションライブラリ内蔵。和声学の宿題を 5 秒で。Common Practice (1600-1900) 全般対応。',
  alternates: {
    canonical: 'https://kuon-rnd.com/classical',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
