import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '無料DDPチェッカー＆曲間試聴 — DDPファイル確認・曲間プレビュー・WAVダウンロード | Free DDP Checker with Gap Listen',
  description:
    'CDマスタリング用DDPファイルセットをブラウザだけで確認。トラックリスト・試聴・WAVダウンロード＋曲間試聴（Gap Listen）：前の曲の終わり15秒→曲間→次の曲の冒頭を連続再生。リードイン・プリギャップ・曲間表示。インストール不要・サーバー送信なし。Free DDP checker with exclusive Gap Listen — hear the last 15s of the previous track through the gap into the next. No install, no upload.',
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
    'DDP 曲間 確認',
    'DDP 曲間 試聴',
    'DDP リードイン',
    'DDP プリギャップ',
    'CD 曲間 チェック',
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
    'DDP gap listen',
    'DDP track gap preview',
    'DDP crossfade preview',
    'DDP lead-in check',
    'DDP pre-gap display',
    // Spanish SEO keywords
    'verificador DDP',
    'DDP checker gratis',
    'abrir archivo DDP',
    'reproductor DDP gratuito',
    'verificar DDP online',
    'masterización CD DDP',
    'DDP pausa entre pistas',
    'DDP escuchar transición',
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
    title: 'Free DDP Checker & Gap Listen — DDPファイル確認・曲間試聴・WAVダウンロード',
    description:
      'DDPファイルセットをブラウザで確認。トラックリスト・試聴・WAVダウンロード＋曲間試聴（Gap Listen）で曲の繋がりを体感。無料・インストール不要。Check DDP with exclusive Gap Listen feature — free, no install.',
    url: 'https://kuon-rnd.com/ddp-checker-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free DDP Checker with Gap Listen — No Install, No Upload, 100% Browser-Based',
    description:
      'Check DDP filesets + hear track transitions with Gap Listen. Track list, preview, WAV download, lead-in & pre-gap display. Free by Kuon R&D.',
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
