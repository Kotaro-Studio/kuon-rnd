import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '無料DSDプレーヤー＆PCMコンバーター KUON DSD — DSF/DFF再生・WAV変換（24bit）サンプルレート選択 | Free DSD Player & Converter',
  description:
    'DSDファイル（DSF/DFF）をブラウザで再生＆高品質WAVに変換。DSD64/DSD128/DSD256対応。44.1kHz〜192kHzサンプルレート選択・24bit出力。インストール不要・サーバー送信なし・Rust WebAssembly駆動。Free DSD player & converter — play DSF/DFF in browser, convert to WAV with sample rate selection. No install, no upload.',
  keywords: [
    // Japanese
    'DSD プレーヤー',
    'DSD 再生',
    'DSD 変換',
    'DSD コンバーター',
    'DSF 再生',
    'DFF 変換',
    'DSD WAV 変換',
    'DSD PCM 変換',
    'DSD64 変換',
    'DSD128 変換',
    'DSD ブラウザ',
    'ハイレゾ DSD',
    'DSD 無料',
    // English
    'DSD player',
    'DSD player online',
    'DSD converter',
    'DSD to WAV',
    'DSD to PCM',
    'DSF player free',
    'DFF converter',
    'DSD64 converter',
    'DSD128 to WAV',
    'play DSD in browser',
    'DSD file player',
    'free DSD converter',
    'hi-res DSD tool',
    // Spanish
    'reproductor DSD',
    'convertidor DSD',
    'DSD a WAV gratis',
    'reproductor DSF online',
    'convertir DSD a PCM',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/dsd',
    languages: {
      'ja': 'https://kuon-rnd.com/dsd',
      'en': 'https://kuon-rnd.com/dsd',
      'es': 'https://kuon-rnd.com/dsd',
    },
  },
  openGraph: {
    title: 'Free DSD Player & Converter — DSD再生・WAV変換（24bit・サンプルレート選択）',
    description:
      'DSDファイルをブラウザで再生＆WAVに変換。DSD64/128/256対応、44.1k〜192kHz選択、24bit出力。Rust WebAssembly駆動。無料・インストール不要。Play & convert DSD in your browser — free, no install.',
    url: 'https://kuon-rnd.com/dsd',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free DSD Player & Converter — Play DSF/DFF, Convert to WAV (24bit)',
    description:
      'World\'s first browser-based DSD player & converter. DSD64/128/256, sample rate selection, 24-bit WAV output. Powered by Rust WebAssembly. By Kuon R&D.',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'google': 'notranslate',
  },
};

export default function DsdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
