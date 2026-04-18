import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '無料サンプルレートコンバーター KUON RESAMPLER — 高品質Sinc補間リサンプラー 44.1kHz↔48kHz↔96kHz↔192kHz | Free Sample Rate Converter',
  description:
    'ブラウザだけで高品質サンプルレート変換。Sinc補間（Kaiser窓）によるプロ品質のリサンプリング。44.1kHz / 48kHz / 88.2kHz / 96kHz / 176.4kHz / 192kHz 相互変換。完全無料・インストール不要・サーバー送信なし。Rust WebAssembly駆動。Free high-quality sample rate converter with windowed-sinc interpolation — no install, no upload.',
  keywords: [
    // Japanese
    'サンプルレート 変換 無料',
    'サンプルレートコンバーター 無料',
    'リサンプラー 無料',
    'リサンプリング 無料',
    'リサンプリング オンライン',
    '44.1kHz 48kHz 変換',
    '48kHz 44.1kHz 変換',
    '96kHz 変換',
    '192kHz 変換',
    'サンプルレート変換 高音質',
    'サンプリング周波数 変換',
    'オーディオ リサンプリング ブラウザ',
    'WAV サンプルレート変換',
    'ハイレゾ ダウンサンプリング',
    'アップサンプリング 意味',
    'sinc補間 リサンプリング',
    // English
    'sample rate converter free',
    'sample rate converter online',
    'audio resampler free',
    'resampler online free',
    'resample audio online',
    '44.1kHz to 48kHz converter',
    '48kHz to 44.1kHz converter',
    '96kHz converter online',
    '192kHz to 44.1kHz',
    'high quality resampling',
    'sinc interpolation resampler',
    'WAV sample rate converter',
    'hi-res downsampling tool',
    'audio sample rate conversion browser',
    'lossless resampling online',
    // Spanish
    'convertidor frecuencia muestreo gratis',
    'convertidor sample rate online',
    'remuestreador audio gratis',
    'conversión frecuencia muestreo online',
    'convertir 44.1kHz a 48kHz',
    'remuestreo audio navegador',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/resampler',
    languages: {
      ja: 'https://kuon-rnd.com/resampler',
      en: 'https://kuon-rnd.com/resampler',
      es: 'https://kuon-rnd.com/resampler',
    },
  },
  openGraph: {
    title: 'Free Sample Rate Converter — 無料サンプルレートコンバーター KUON RESAMPLER',
    description:
      'ブラウザ完結の高品質サンプルレート変換。Sinc補間・Kaiser窓。44.1k↔48k↔96k↔192kHz。無料・インストール不要。High-quality sample rate conversion with sinc interpolation. Free, no install.',
    url: 'https://kuon-rnd.com/resampler',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free High-Quality Sample Rate Converter — Sinc Interpolation, Browser-Based',
    description:
      'Convert sample rates with professional sinc interpolation. 44.1k↔48k↔96k↔192kHz. Free, no install, no upload. Powered by Rust WebAssembly. By Kuon R&D.',
  },
  robots: { index: true, follow: true },
  other: { google: 'notranslate' },
};

export default function ResamplerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
