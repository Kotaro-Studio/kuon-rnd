import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://kuon-rnd.com'),
  title: 'KUON SLOWDOWN — Pitch-Preserving Slow Down Music | ピッチ維持スロー再生',
  description:
    'Browser-based pitch-preserving time-stretching. Slow down music from 0.25x to 2.0x without changing pitch. A/B loop, semitone transpose, auto key & BPM detection, bar grid, overdub recording, WAV export. Free alternative to Transcribe! and Amazing Slow Downer. ピッチを変えずに曲をゆっくり再生。ジャズ耳コピ・クラシック練習・タンゴ分析に最適。登録不要・完全無料。',
  alternates: {
    canonical: 'https://kuon-rnd.com/slowdown',
  },
  openGraph: {
    title: 'KUON SLOWDOWN — Pitch-Preserving Slow Down Music',
    description:
      'Browser-based pitch-preserving time-stretching for jazz transcription, classical practice, tango analysis. Free alternative to Transcribe! and Amazing Slow Downer.',
    url: 'https://kuon-rnd.com/slowdown',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SlowdownLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
