import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '無料LUFSメーター＆スペクトラムアナライザー KUON ANALYZER — リアルタイム周波数解析・リファレンス比較・マイク対応 | Free LUFS Meter & Spectrum Analyzer',
  description:
    'ブラウザだけでリアルタイムLUFSメーター＆スペクトラムアナライザー。リファレンス楽曲と重ねて周波数バランスを比較。マイク入力・MASTER CHECK連携。完全無料・インストール不要・サーバー送信なし。Free real-time LUFS meter & spectrum analyzer with reference comparison — no install, no upload, 100% browser.',
  keywords: [
    // Japanese — primary SEO targets
    'LUFS メーター 無料',
    'LUFS メーター オンライン',
    'ラウドネスメーター 無料',
    'ラウドネスメーター オンライン',
    'ラウドネス 測定 無料',
    'スペクトラムアナライザー 無料',
    'スペクトラムアナライザー オンライン',
    'FFT アナライザー 無料',
    '周波数解析 オンライン',
    'リファレンス 比較 ミックス',
    'ミックス 周波数バランス 比較',
    'マスタリング スペクトラム 確認',
    'リアルタイム ラウドネス',
    'EBU R128 メーター 無料',
    'オーディオ 解析 ブラウザ',
    'マイク入力 スペクトラム',
    // English
    'LUFS meter free',
    'LUFS meter online',
    'loudness meter free',
    'loudness meter online',
    'spectrum analyzer free',
    'spectrum analyzer online',
    'FFT analyzer online free',
    'frequency analysis online',
    'reference track comparison tool',
    'mix frequency balance checker',
    'real-time loudness meter browser',
    'EBU R128 meter free',
    'audio spectrum analyzer browser',
    'mastering frequency analysis',
    'mic input spectrum analyzer',
    // Spanish
    'medidor LUFS gratis',
    'medidor de sonoridad online',
    'analizador de espectro gratis',
    'analizador de frecuencia online',
    'comparación de referencia mezcla',
    'analizador de audio navegador',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/analyzer-lp',
    languages: {
      ja: 'https://kuon-rnd.com/analyzer-lp',
      en: 'https://kuon-rnd.com/analyzer-lp',
      es: 'https://kuon-rnd.com/analyzer-lp',
    },
  },
  openGraph: {
    title: 'Free LUFS Meter & Spectrum Analyzer — 無料LUFSメーター＆スペクトラムアナライザー',
    description:
      'ブラウザ完結のLUFSメーター＋スペクトラムアナライザー。リファレンス比較・マイク入力・MASTER CHECK連携。無料・インストール不要。Real-time LUFS meter & spectrum analyzer with reference comparison. Free, no install.',
    url: 'https://kuon-rnd.com/analyzer-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free LUFS Meter & Spectrum Analyzer — Reference Comparison, Mic Input',
    description:
      'Real-time LUFS loudness meter & spectrum analyzer in your browser. Compare mixes with reference tracks, mic input support. Free, no install. By Kuon R&D.',
  },
  robots: { index: true, follow: true },
  other: { google: 'notranslate' },
};

export default function AnalyzerLpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
