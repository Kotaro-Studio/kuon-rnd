import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON SIGHT READING — 譜読みトレーニング | 空音開発',
  description:
    '音名読み・調号判定・音部記号・記譜変換の4モードで初見力を鍛える。ドイツ音名・英語音名・日本音名（イロハ）の3記譜体系に完全対応。ト音記号・ヘ音記号・アルト記号・テノール記号。レベルアップ制。音大受験・ソルフェージュ対策に最適。ブラウザ完結・完全無料。',
  keywords: [
    '譜読み', 'sight reading', '初見', '音名', 'note reading', '調号', 'key signature',
    '音部記号', 'clef', 'ト音記号', 'ヘ音記号', 'アルト記号', 'テノール記号',
    'ドイツ音名', 'German notation', 'Helmholtz', '日本音名', 'イロハ', '記譜変換',
    'ソルフェージュ', 'solfege', '音大受験', '聴音', 'ear training',
    '시창', '초견', '음이름', '조표', '음자리표', '독일 음명', '음대 입시', '청음',
    'lectura a primera vista', 'armadura', 'clave', 'solfeo',
  ],
  openGraph: {
    title: 'KUON SIGHT READING — Free Music Reading Trainer',
    description: 'Note reading, key signature ID, clef reading. 3 modes for exam prep. Browser-based, free.',
    url: 'https://kuon-rnd.com/sight-reading-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON SIGHT READING — Music Reading Trainer',
    description: 'Note reading, key sig & clef. Exam prep. Free.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/sight-reading-lp',
  },
};

export default function SightReadingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
