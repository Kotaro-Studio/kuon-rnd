import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '無料DDPチェッカー — DDPファイルの確認・試聴・WAVダウンロード | Free DDP Checker',
  description:
    'CDマスタリング用DDPファイルセットをブラウザだけで確認できる無料ツール。トラックリスト表示、各トラックの試聴再生、WAVダウンロードに対応。インストール不要、サーバー送信なし、完全ローカル処理。DDP v1.01 / v2.00対応。Free online DDP file checker — verify track list, preview audio, and download WAV. No install, no upload, 100% browser-based.',
  keywords: [
    // Japanese SEO keywords
    'DDP チェッカー',
    'DDP 確認',
    'DDP ファイル 開く',
    'DDP 再生',
    'DDP プレーヤー',
    'DDP 無料',
    'DDP ビューアー',
    'DDP 検証',
    'DDP トラック 確認',
    'CDマスタリング DDP',
    'プレス工場 DDP',
    'DDP WAV 変換',
    'DDPファイル 中身 確認',
    'DDPID DDPMS 解析',
    // English SEO keywords
    'DDP checker',
    'DDP file checker',
    'DDP player free',
    'DDP viewer online',
    'DDP file reader',
    'DDP verifier',
    'open DDP file',
    'free DDP player',
    'DDP track list',
    'DDP to WAV',
    'check DDP file online',
    'CD mastering DDP',
    'DDP file format',
    'verify DDP',
    'DDP browser tool',
    // Spanish SEO keywords
    'verificador DDP',
    'DDP checker gratis',
    'abrir archivo DDP',
    'reproductor DDP gratuito',
    'verificar DDP online',
    'masterización CD DDP',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/ddp-checker-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/ddp-checker-lp',
      'en': 'https://kuon-rnd.com/ddp-checker-lp',
      'es': 'https://kuon-rnd.com/ddp-checker-lp',
    },
  },
  openGraph: {
    title: 'Free DDP Checker — DDPファイルの確認・試聴・WAVダウンロード',
    description:
      'DDPファイルセットの中身をブラウザだけで確認。トラックリスト・試聴・WAVダウンロード。無料・インストール不要・完全ローカル処理。Verify DDP filesets in your browser — free, no install, 100% local.',
    url: 'https://kuon-rnd.com/ddp-checker-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free DDP Checker — No Install, No Upload, 100% Browser-Based',
    description:
      'Check DDP filesets in your browser. Track list, preview, WAV download. Free tool by Kuon R&D for musicians and producers.',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'google': 'notranslate',
  },
};

export default function DdpCheckerLpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
