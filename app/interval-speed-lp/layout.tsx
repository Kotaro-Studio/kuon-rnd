import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON INTERVAL SPEED — 音程反射トレーニング | 空音開発',
  description:
    '音程の聴き分けスピードを競う反射神経ゲーム。Easy/Medium/Hardの3段階、20ラウンド制、スコア＆自己ベスト記録。1秒以内に答えられるか挑戦しよう。ブラウザ完結・完全無料。Speed-based interval reaction game. Free.',
  keywords: [
    '音程', 'インターバル', 'interval speed', 'スピード', 'reaction', '反射神経',
    'ゲーム', '聴音', 'ear training', '音大受験', 'solfège',
    '음정 속도', '반사', '청음', '음대 입시',
    'intervalos velocidad', 'entrenamiento auditivo', 'juego de reacción',
  ],
  openGraph: {
    title: 'KUON INTERVAL SPEED — Free Interval Reaction Game',
    description: 'Speed-based interval ear training. 3 difficulties, 20 rounds, personal bests. Browser-based, free.',
    url: 'https://kuon-rnd.com/interval-speed-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON INTERVAL SPEED — Interval Reaction Game',
    description: 'How fast can you identify intervals? 3 difficulties × 20 rounds. Free.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/interval-speed-lp',
  },
};

export default function IntervalSpeedLPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
