import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON CHORD QUIZ — 和音トレーニング | 空音開発',
  description:
    '14種類の和音判定、転回形、コード進行を聴き分けるブラウザアプリ。ピアノ音色・鍵盤表示・レベルアップ制。音大受験・和声課題に。完全無料。Free chord ear training app with piano timbre and keyboard visualization.',
  keywords: [
    '和音', 'コード', 'chord quiz', '転回形', 'inversions', 'コード進行',
    'chord progressions', '和声', '音大受験', '聴音', 'ear training',
    '화음 훈련', '전위', '코드 진행', '음대 입시',
    'acordes', 'inversiones', 'progresiones',
  ],
  openGraph: {
    title: 'KUON CHORD QUIZ — Free Chord Ear Training',
    description: '14 chord types, inversions, progressions. Piano timbre + keyboard visual. Level-up system. Free.',
    url: 'https://kuon-rnd.com/chord-quiz-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON CHORD QUIZ — Free Chord Training',
    description: 'Chords, inversions & progressions with piano timbre. Free in your browser.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/chord-quiz-lp',
  },
};

export default function ChordQuizLPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
