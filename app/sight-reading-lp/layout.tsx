import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON SIGHT READING — 譜読みトレーニング LP | 空音開発',
  description:
    '音名読み・調号判定・音部記号・記譜変換の4モードで初見力を徹底強化。ドイツ音名・英語音名・日本音名（イロハ）の3記譜体系に完全対応。音大受験の楽典・ソルフェージュ試験対策に最適。ブラウザ完結・完全無料。',
  keywords: [
    '譜読み', 'sight reading', '初見', '音名読み', 'note reading',
    '調号判定', 'key signature', '音部記号', 'clef reading',
    'ドイツ音名', 'German notation', 'Helmholtz', '日本音名', 'イロハ',
    '記譜変換', 'notation conversion', 'H-dur', 'B-dur',
    'ソルフェージュ', 'solfege', '音大受験', '楽典', 'music theory',
    '시창', '초견', '악보 읽기', '조표', '음자리표', '독일 음명', '솔페주', '음대 입시',
    'lectura a primera vista', 'armadura', 'clave de sol', 'solfeo', 'teoria musical',
  ],
  openGraph: {
    title: 'KUON SIGHT READING — Sight Reading Trainer for Exam Prep',
    description: 'Note reading, key signature, clef reading, notation conversion. 4 modes with German/English/Japanese notation. Free.',
    url: 'https://kuon-rnd.com/sight-reading-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON SIGHT READING — Sight Reading Exam Prep',
    description: 'Master note names, key signatures, clefs & notation conversion. German/English/Japanese. Free.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/sight-reading-lp',
  },
};

export default function SightReadingLPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
