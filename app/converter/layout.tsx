import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '無料WAV→MP3コンバーター KUON CONVERTER — 高品質MP3変換（320kbps/160kbps）ブラウザ完結 | Free WAV to MP3 Converter',
  description:
    'WAVファイルを高品質MP3に変換。320kbps / 160kbps 選択可。ブラウザだけで完結、サーバー送信なし、インストール不要。マスタリング後の配信用MP3作成に最適。Free WAV to MP3 converter — 320/160 kbps, no install, no upload, 100% browser-based.',
  keywords: [
    // Japanese
    'WAV MP3 変換',
    'WAV MP3 コンバーター',
    'WAV 変換 無料',
    'MP3 変換 オンライン',
    'MP3 エンコーダー',
    '音声変換 ブラウザ',
    '音声ファイル 変換',
    '320kbps MP3',
    'WAV MP3 高品質',
    'マスタリング MP3',
    '配信用 MP3 作成',
    // English
    'WAV to MP3 converter',
    'WAV to MP3 free',
    'WAV to MP3 online',
    'convert WAV to MP3',
    'MP3 encoder online',
    'audio converter browser',
    '320kbps MP3 converter',
    'high quality MP3 converter',
    'WAV MP3 no upload',
    'browser audio converter',
    'mastering MP3 export',
    // Spanish
    'convertidor WAV a MP3',
    'convertir WAV a MP3 gratis',
    'convertidor audio online',
    'codificador MP3 gratis',
    'convertir audio navegador',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/converter',
    languages: {
      'ja': 'https://kuon-rnd.com/converter',
      'en': 'https://kuon-rnd.com/converter',
      'es': 'https://kuon-rnd.com/converter',
    },
  },
  openGraph: {
    title: 'Free WAV to MP3 Converter — 高品質MP3変換（320kbps/160kbps）ブラウザ完結',
    description:
      'WAVファイルを320kbps/160kbpsの高品質MP3に変換。ブラウザだけで完結、サーバー送信なし。Convert WAV to high-quality MP3 — free, no install, no upload.',
    url: 'https://kuon-rnd.com/converter',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free WAV to MP3 Converter — 320kbps / 160kbps, No Install, No Upload',
    description:
      'Convert WAV to high-quality MP3 in your browser. 320kbps or 160kbps. No install, no upload, 100% private. By Kuon R&D.',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'google': 'notranslate',
  },
};

export default function ConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
