import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON TRANSPOSER — 移調ヘルパー | 移調楽器の記譜音⇄実音変換 | 移調早見表 | 空音開発',
  description:
    '移調楽器の記譜音と実音を一瞬で変換。B♭クラリネット・アルトサックス・ホルン・トランペットなど30楽器対応。調号の移調・音符列の移調・移調早見表をブラウザ完結・完全無料で。吹奏楽・オーケストラの移調計算に。',
  keywords: [
    // Japanese — primary target
    '移調 アプリ', '移調ヘルパー', '移調 ツール', '移調 計算',
    '移調楽器', '移調楽器 一覧', '移調楽器 表', '移調楽器 変換',
    '移調 早見表', '移調表', '移調 対応表', 'トランスポーズ',
    '記譜音 実音 変換', '記譜音 実音', '実音 記譜音',
    'Bb クラリネット 移調', 'アルトサックス 移調', 'ホルン 移調',
    'トランペット 移調', 'テナーサックス 移調', 'バリトンサックス 移調',
    '吹奏楽 移調', '吹奏楽 パート譜 移調', '吹奏楽 楽器 調',
    'オーケストラ 移調', '楽譜 移調', '移調 無料', '移調 オンライン',
    'in C 変換', 'in Bb 変換', 'in Eb 変換', 'in F 変換',
    'コンサートピッチ 変換', '調号 移調', '調号 変換',
    // English — global SEO
    'transpose app', 'transpose app free', 'transposition tool',
    'transposing instruments', 'transposition chart', 'transposition table',
    'transpose music free', 'transpose notes online', 'free transposer',
    'Bb clarinet transpose', 'alto sax transpose', 'French horn transpose',
    'trumpet transpose', 'tenor sax transpose', 'concert pitch converter',
    'written pitch to concert pitch', 'concert pitch to written pitch',
    'wind band transposition', 'orchestra transposition',
    'key signature transposition', 'transpose key signature',
    'instrument transposition chart', 'transposing instrument chart',
    'free online transposer', 'browser transposition tool',
    // Korean
    '이조 앱', '이조 도구', '이조 악기', '이조 표', '이조 변환',
    '기보음 실음 변환', 'Bb 클라리넷 이조', '알토 색소폰 이조',
    'F 호른 이조', '트럼펫 이조', '취주악 이조', '오케스트라 이조',
    '무료 이조 도구', '조표 이조',
    // Spanish
    'transpositor', 'transpositor de instrumentos', 'transpositor gratis',
    'instrumentos transpositores', 'tabla de transposición',
    'transponer notas', 'transponer gratis online',
    'clarinete Bb transposición', 'saxo alto transposición',
    'trompa transposición', 'trompeta transposición',
    'banda transposición', 'orquesta transposición',
    // Portuguese
    'transpositor de instrumentos', 'transpositor grátis',
    'instrumentos transpositores', 'tabela de transposição',
    'transpor notas grátis', 'clarinete Bb transposição',
    'saxofone alto transposição', 'trompa transposição',
  ],
  openGraph: {
    title: 'KUON TRANSPOSER — Instant Transposition for All Instruments',
    description: '30+ instruments. Key & note transposition. Reference chart. Free.',
    url: 'https://kuon-rnd.com/transposer',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON TRANSPOSER — Transposition Helper',
    description: '30+ instruments, key signatures, note transposition, reference chart. Free & browser-based.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/transposer',
  },
};

export default function TransposerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
