import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON TRANSPOSER — 移調ヘルパー | 30+楽器対応・移調早見表・完全無料 | 空音開発',
  description:
    '移調楽器の記譜音と実音を一瞬で変換。B♭クラリネット・アルトサックス・ホルン・トランペットなど30楽器対応。吹奏楽・オーケストラの移調計算に。ブラウザ完結・完全無料。',
  keywords: [
    '移調 アプリ', '移調 アプリ 無料', '移調ヘルパー', '移調 ツール', '移調 計算', '移調 表',
    '移調楽器', '移調楽器 一覧', '移調楽器 変換', '移調 早見表', 'トランスポーズ',
    '吹奏楽 移調', '吹奏楽 パート譜', 'オーケストラ 移調', '楽譜 移調 無料',
    'Bb クラリネット 移調', 'アルトサックス 移調', 'ホルン 移調', 'トランペット 移調',
    'transpose app free', 'transposition tool free', 'transposing instruments chart',
    'transpose music online free', 'instrument transposition calculator',
    'Bb clarinet transpose', 'alto sax transpose', 'horn transpose', 'trumpet transpose',
    '이조 앱 무료', '이조 도구', '이조 악기', '이조 표',
    'transpositor gratis', 'transpositor de instrumentos',
    'transpositor grátis', 'transposição de instrumentos',
  ],
  openGraph: {
    title: 'KUON TRANSPOSER — Transpose Any Instrument Instantly',
    description: '30+ instruments. Key & note transposition. Reference chart. Free & browser-based.',
    url: 'https://kuon-rnd.com/transposer-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON TRANSPOSER — Free Transposition Helper',
    description: '30+ instruments, key signatures, note transposition, reference chart. Free.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/transposer-lp',
  },
};

export default function TransposerLPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
