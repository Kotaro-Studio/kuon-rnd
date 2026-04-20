import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON EAR TRAINING — 音感トレーニング | 空音開発',
  description:
    '音程・和音・音階・聴音を鍛えるブラウザ完結型アプリ。音大受験・吹奏楽・音楽学習に最適。レベルアップ制で楽しく継続。A browser-based ear training app for intervals, chords, scales, and melodic dictation.',
  keywords: [
    '聴音', '音感トレーニング', 'ear training', '音大受験', 'ソルフェージュ',
    '音程', 'intervals', '和音', 'chords', '音階', 'scales',
    '청음 훈련', '음정', '화음', '음계',
    '吹奏楽', 'brass band', 'solfege', 'aural skills',
    'entrenamiento auditivo', 'intervalos', 'acordes', 'escalas',
  ],
  openGraph: {
    title: 'KUON EAR TRAINING — Free Ear Training App',
    description: 'Train intervals, chords, scales & melodic dictation in your browser. Level up system with achievements. Perfect for music students.',
    url: 'https://kuon-rnd.com/ear-training',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON EAR TRAINING — Free Ear Training App',
    description: 'Train intervals, chords, scales & melodic dictation in your browser.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/ear-training',
  },
};

export default function EarTrainingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
