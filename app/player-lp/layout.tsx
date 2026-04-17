import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '24時間で消えるMP3プレーヤー KUON PLAYER — パスワード保護・安全な音声共有 | Self-Destructing MP3 Player',
  description:
    'MP3をアップロードし、パスワード付き共有リンクを生成。再生開始から24時間で完全自動削除。ストリーミング再生のみ・ダウンロード不可。録音エンジニア・音楽家のための安全な音声共有ツール。Upload MP3, get a password-protected link. Auto-deleted 24 hours after first play. Streaming only, no download. Secure audio sharing for recording engineers & musicians.',
  keywords: [
    // Japanese
    'MP3 共有 安全', 'MP3 プレーヤー 24時間', '音声共有 パスワード保護', '自動削除 MP3 プレーヤー',
    '一時的 音声リンク', 'セキュア 音声共有', '録音 共有 ツール', 'ストリーミング MP3 安全',
    '音声ファイル 自動消滅', 'MP3 期限付き 共有',
    // English
    'MP3 sharing secure', 'self-destructing audio player', '24 hour MP3 player',
    'temporary audio link', 'password protected MP3 player', 'secure audio sharing online',
    'ephemeral audio sharing', 'auto-delete MP3 player', 'streaming only MP3',
    'recording engineer file sharing', 'musician audio sharing tool',
    // Spanish
    'compartir MP3 seguro', 'reproductor MP3 temporal', 'audio autodestructivo',
    'enlace de audio temporal', 'compartir audio con contraseña',
    'compartir grabaciones seguro',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/player-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/player-lp',
      'en': 'https://kuon-rnd.com/player-lp',
      'es': 'https://kuon-rnd.com/player-lp',
    },
  },
  openGraph: {
    title: 'KUON PLAYER — 24時間で消える安全なMP3共有 | Self-Destructing Audio Sharing',
    description:
      'MP3をアップロード → パスワード付きリンク生成 → 24時間後に自動削除。ダウンロード不可・ストリーミングのみ。安全な音声共有。Upload MP3, auto-deletes after 24h. Streaming only. Secure audio sharing.',
    url: 'https://kuon-rnd.com/player-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON PLAYER — 24-Hour Self-Destructing MP3 Player (Free & Secure)',
    description:
      'Upload MP3, share with a password-protected link. Auto-deleted after 24 hours. Streaming only — no downloads. By Kuon R&D.',
  },
  robots: { index: true, follow: true },
  other: { 'google': 'notranslate' },
};

export default function PlayerLpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
