import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON EAR TRAINING — 無料の音感トレーニング | 空音開発',
  description:
    '音程・和音・音階・聴音書取を鍛えるブラウザ完結型アプリ。音大受験・吹奏楽・音楽学習に最適。レベルアップ制・アチーブメントで楽しく継続。完全無料。Free ear training app for intervals, chords, scales, and melodic dictation.',
  keywords: [
    '聴音', '音感トレーニング', 'ear training', '音大受験', 'ソルフェージュ',
    '音程', 'intervals', '和音', 'chords', '音階', 'scales', '聴音書取', 'melodic dictation',
    '청음 훈련', '음정', '화음', '음계', '음대 입시',
    '吹奏楽', 'brass band', 'solfege', 'aural skills', 'music theory',
    'entrenamiento auditivo', 'intervalos', 'acordes', 'escalas', 'dictado melódico',
    'treinamento auditivo', 'ditado melódico',
  ],
  openGraph: {
    title: 'KUON EAR TRAINING — Free Ear Training for Music Students',
    description: 'Train intervals, chords, scales & melodic dictation. Level-up system with achievements. Perfect for music entrance exams. Free.',
    url: 'https://kuon-rnd.com/ear-training-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON EAR TRAINING — Free Ear Training App',
    description: 'Intervals, chords, scales & dictation. Level-up system. Free in your browser.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/ear-training-lp',
  },
};

export default function EarTrainingLPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
