import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '無料DSDプレーヤー＆コンバーター KUON DSD — ブラウザで再生・24bit WAV変換 | Free DSD Player & Converter Online',
  description:
    '世界初：ブラウザだけでDSDファイル（DSF/DFF）を再生・高品質WAVに変換。DSD64/DSD128/DSD256対応。44.1kHz〜192kHzサンプルレート選択、24bit出力。Rust WebAssembly駆動でネイティブ級の速度。インストール不要・サーバー送信なし・完全無料。高額なDSD再生ソフトはもう不要です。World\'s first browser-based DSD player & converter. Play DSF/DFF, convert to 24-bit WAV. No install, no upload, 100% free.',
  keywords: [
    // Japanese
    'DSD プレーヤー 無料', 'DSD 再生 ブラウザ', 'DSD 変換 無料', 'DSD コンバーター オンライン',
    'DSF 再生', 'DFF 変換', 'DSD WAV 変換 24bit', 'DSD PCM 変換',
    'DSD64 再生', 'DSD128 変換', 'DSD256 対応',
    'DSD プレーヤー ソフト 無料', 'ハイレゾ DSD 再生',
    'DSD サンプルレート 変換', 'DSD ブラウザ 再生',
    // English
    'DSD player free', 'DSD player online', 'DSD converter free', 'DSD to WAV converter',
    'DSD to PCM online', 'DSF player free', 'DFF converter online',
    'DSD64 player', 'DSD128 converter', 'DSD256 to WAV',
    'play DSD in browser', 'DSD file player no install',
    'free DSD converter online', 'hi-res DSD tool', 'browser DSD player',
    'DSD playback software free alternative',
    // Spanish
    'reproductor DSD gratis', 'convertidor DSD online', 'DSD a WAV gratis',
    'reproductor DSF online', 'convertir DSD a PCM gratis',
    'reproductor DSD navegador',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/dsd-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/dsd-lp',
      'en': 'https://kuon-rnd.com/dsd-lp',
      'es': 'https://kuon-rnd.com/dsd-lp',
    },
  },
  openGraph: {
    title: 'KUON DSD — Free DSD Player & Converter | ブラウザでDSD再生＆WAV変換',
    description:
      '世界初のブラウザ完結型DSDプレーヤー＆コンバーター。DSD64/128/256再生、24bit WAV変換、サンプルレート選択。Rust WebAssembly駆動。無料・インストール不要。The world\'s first browser-based DSD player — powered by Rust WebAssembly.',
    url: 'https://kuon-rnd.com/dsd-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON DSD — World\'s First Browser-Based DSD Player & Converter (Free)',
    description:
      'Play DSD files (DSF/DFF) and convert to 24-bit WAV — entirely in your browser. DSD64/128/256, sample rate selection, no install, no upload. Powered by Rust WebAssembly. By Kuon R&D.',
  },
  robots: { index: true, follow: true },
  other: { 'google': 'notranslate' },
};

export default function DsdLpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
