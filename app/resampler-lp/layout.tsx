import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '無料サンプルレートコンバーター KUON RESAMPLER — Sinc補間で高品質リサンプリング 44.1kHz↔48kHz↔96kHz↔192kHz | Free Sample Rate Converter',
  description:
    'ブラウザだけで高品質サンプルレート変換。Sinc補間×Kaiser窓による理論的に最適なリサンプリング。ダウンサンプリングのアンチエイリアス、フォーマット要件対応、処理精度の向上。完全無料・インストール不要・サーバー送信なし。Free high-quality sample rate converter with sinc interpolation and Kaiser window. No install, no upload.',
  keywords: [
    // Japanese — primary SEO targets
    'サンプルレート 変換 無料',
    'サンプルレートコンバーター 無料',
    'リサンプラー 無料',
    'リサンプリング オンライン',
    'リサンプリング 無料',
    'アップサンプリング 意味',
    'アップサンプリング 音質',
    'ダウンサンプリング 高音質',
    '44.1kHz 48kHz 変換 無料',
    '96kHz 44.1kHz 変換',
    '192kHz ダウンサンプリング',
    'サンプリング周波数 変換 ツール',
    'sinc補間 リサンプリング',
    'オーディオ サンプルレート変換 ブラウザ',
    'ハイレゾ CD 変換',
    'WAV サンプルレート変換 無料',
    'アンチエイリアス フィルタ',
    'Kaiser窓 リサンプラー',
    // English
    'sample rate converter free',
    'sample rate converter online',
    'audio resampler free',
    'resampler online free',
    'resample audio free online',
    'does upsampling improve quality',
    'upsampling vs downsampling',
    '44.1kHz to 48kHz converter',
    '48kHz to 44.1kHz converter free',
    '96kHz to 44.1kHz converter',
    '192kHz downsampling',
    'sinc interpolation resampler',
    'kaiser window resampler',
    'high quality audio resampling',
    'anti-aliasing resampler',
    'hi-res to CD quality converter',
    'lossless sample rate conversion',
    'audio resampling browser',
    // Spanish
    'convertidor frecuencia muestreo gratis',
    'convertidor sample rate online gratis',
    'remuestreador audio gratis',
    'remuestreo audio online',
    'sobremuestreo mejora calidad',
    'convertir 44.1kHz a 48kHz gratis',
    '96kHz a 44.1kHz convertidor',
    'interpolación sinc audio',
    'conversión frecuencia muestreo navegador',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/resampler-lp',
    languages: {
      ja: 'https://kuon-rnd.com/resampler-lp',
      en: 'https://kuon-rnd.com/resampler-lp',
      es: 'https://kuon-rnd.com/resampler-lp',
    },
  },
  openGraph: {
    title: 'Free Sample Rate Converter — 無料サンプルレートコンバーター KUON RESAMPLER',
    description:
      'ブラウザ完結の高品質サンプルレート変換。Sinc補間×Kaiser窓。44.1k↔48k↔96k↔192kHz。アップサンプリングの誤解と3つの正しい使い方を解説。無料・インストール不要。',
    url: 'https://kuon-rnd.com/resampler-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free High-Quality Sample Rate Converter — Does Upsampling Improve Quality?',
    description:
      'Honest answer: No, upsampling doesn\'t add new information. But here are 3 real reasons you need a quality resampler. Sinc interpolation × Kaiser window. Free, no install.',
  },
  robots: { index: true, follow: true },
  other: { google: 'notranslate' },
};

export default function ResamplerLpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
