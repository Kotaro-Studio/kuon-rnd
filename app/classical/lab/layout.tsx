import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON CLASSICAL LAB — music21 in Browser | 空音開発',
  description:
    'Run real Python music21 in your browser via Pyodide. Edit and execute Roman numeral analysis, voice leading checks, and modulation maps on Bach, Mozart, Beethoven, and Palestrina scores. No server, no install — pure WebAssembly.',
  keywords: [
    'music21',
    'Pyodide',
    'WebAssembly Python',
    'browser music analysis',
    'computational musicology',
    'Roman numeral analysis Python',
    'voice leading checker',
    'Bach chorale analysis',
    'Mozart string quartet analysis',
    'Beethoven sonata analysis',
    'Palestrina mass analysis',
    'musicology playground',
    'music theory programming',
    'KUON CLASSICAL LAB',
    'Kuon R&D',
    '空音開発',
    'ブラウザ Python 音楽',
    'music21 ブラウザ',
    '和声分析 Python',
    '音楽情報学',
  ],
  openGraph: {
    title: 'KUON CLASSICAL LAB — music21 in Your Browser',
    description: 'Real Python music21 environment, zero server, computational music theory for music students.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON CLASSICAL LAB',
    description: 'music21 in your browser. No server. Real Python.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/classical/lab',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
