import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON CHORD QUIZ — 和音トレーニング | 空音開発',
  description:
    '和音の種類・転回形・コード進行を聴き分けるブラウザ完結型アプリ。メジャー/マイナーから7th、sus、add9、ii-V-Iまで段階解禁。ピアノ音色・鍵盤表示付き。音大受験対策に。A browser-based chord ear training app.',
  keywords: [
    '和音', 'コード', 'chord quiz', '和声', '転回形', 'inversions', 'コード進行',
    'chord progressions', '音大受験', '聴音', 'ear training', 'aural skills',
    '화음', '코드', '전위', '코드 진행', '음대 입시',
    'acordes', 'inversiones', 'progresiones', 'entrenamiento auditivo',
  ],
  openGraph: {
    title: 'KUON CHORD QUIZ — Free Chord Ear Training',
    description: 'Train chord identification, inversions & progressions. Piano timbre with keyboard visualization. Level-up system. Free.',
    url: 'https://kuon-rnd.com/chord-quiz',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON CHORD QUIZ — Free Chord Ear Training',
    description: 'Chords, inversions & progressions. Piano timbre. Level-up system. Free in your browser.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/chord-quiz',
  },
};

export default function ChordQuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
