import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '無料スペクトラムアナライザー＆LUFSメーター KUON ANALYZER — リアルタイム周波数解析・リファレンス比較・ラウドネス計測 | Free Spectrum Analyzer & LUFS Meter',
  description:
    'ブラウザだけでリアルタイムスペクトラム解析＆LUFSラウドネスメーター。リファレンス楽曲との比較、マイク入力対応、MASTER CHECK連携。インストール不要・サーバー送信なし。Free real-time spectrum analyzer & LUFS meter — reference comparison, mic input, no install, no upload.',
  keywords: [
    // Japanese (SEO primary targets)
    'スペクトラムアナライザー 無料',
    'スペクトラムアナライザー オンライン',
    'LUFS メーター',
    'LUFS メーター 無料',
    'ラウドネスメーター オンライン',
    'ラウドネス 測定 無料',
    '周波数解析 オンライン',
    'リアルタイム スペクトラム',
    'FFT アナライザー',
    'リファレンス 比較 ミックス',
    'ミックス 周波数バランス',
    'マスタリング スペクトラム',
    'オーディオ アナライザー 無料',
    'EBU R128 メーター',
    '音声 周波数分析',
    // English
    'spectrum analyzer free',
    'spectrum analyzer online',
    'LUFS meter free',
    'LUFS meter online',
    'loudness meter free',
    'real-time spectrum analyzer',
    'FFT analyzer online',
    'reference track comparison',
    'mix frequency balance',
    'audio analyzer free',
    'EBU R128 meter',
    'frequency analysis online',
    'mastering spectrum analyzer',
    'browser audio analyzer',
    // Spanish
    'analizador de espectro gratis',
    'medidor LUFS gratis',
    'medidor de sonoridad online',
    'analizador de frecuencia',
    'comparación de referencia mezcla',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/analyzer',
    languages: {
      ja: 'https://kuon-rnd.com/analyzer',
      en: 'https://kuon-rnd.com/analyzer',
      es: 'https://kuon-rnd.com/analyzer',
    },
  },
  openGraph: {
    title: 'Free Spectrum Analyzer & LUFS Meter — リアルタイム周波数解析・リファレンス比較',
    description:
      'ブラウザ完結のスペクトラムアナライザー＋LUFSメーター。リファレンス比較・マイク入力対応。無料・インストール不要。Real-time spectrum analyzer & LUFS meter with reference comparison. Free, no install.',
    url: 'https://kuon-rnd.com/analyzer',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Spectrum Analyzer & LUFS Meter — Reference Comparison, Mic Input',
    description:
      'Real-time spectrum analyzer & LUFS loudness meter in your browser. Compare with reference tracks, mic input support. Free, no install. By Kuon R&D.',
  },
  robots: { index: true, follow: true },
  other: { google: 'notranslate' },
};

export default function AnalyzerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
