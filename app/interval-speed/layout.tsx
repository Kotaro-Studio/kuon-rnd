import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON INTERVAL SPEED — 音程反射トレーニング | 空音開発',
  description:
    '音程の聴き分けスピードを鍛える反射神経ゲーム。3段階の難易度、20ラウンド制、スコアランキング。1秒以内に正答できるか？ブラウザ完結・完全無料。Free interval speed reaction game for musicians.',
  keywords: [
    '音程', 'インターバル', 'interval speed', '反射', 'reaction', '聴音',
    'ear training', '音大受験', 'solfège', 'speed game',
    '음정', '반사', '청음 훈련', '음대 입시',
    'intervalos', 'velocidad', 'entrenamiento auditivo',
  ],
  openGraph: {
    title: 'KUON INTERVAL SPEED — Interval Reaction Game',
    description: 'How fast can you identify intervals? 3 difficulty levels, 20 rounds, score-based. Free in your browser.',
    url: 'https://kuon-rnd.com/interval-speed-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON INTERVAL SPEED — Interval Reaction Game',
    description: 'Speed-based interval identification. 3 difficulties, 20 rounds. Free.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/interval-speed-lp',
  },
};

export default function IntervalSpeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
