import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '24時間で消えるMP3プレーヤー KUON PLAYER — 安全な音声共有 | 24-Hour Self-Destructing MP3 Player',
  description:
    'MP3ファイルをアップロードし、パスワード付きの共有リンクを生成。再生開始から24時間で自動削除。サーバーにファイルを残さない安全な音声共有。Upload MP3, generate a password-protected share link. Auto-deletes 24 hours after first play.',
  keywords: [
    'MP3 共有', 'MP3 プレーヤー 24時間', '音声共有 安全', '自動削除 MP3',
    'パスワード付き 音声共有', '一時的 音声リンク', 'MP3 sharing secure',
    'self-destructing audio', '24 hour MP3 player', 'temporary audio link',
    'password protected MP3', 'secure audio sharing online',
    'compartir MP3 seguro', 'reproductor MP3 temporal', 'audio autodestructivo',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/player/upload',
  },
  openGraph: {
    title: 'KUON PLAYER — 24時間で消える安全なMP3共有',
    description:
      'MP3をアップロード → パスワード付きリンク生成 → 24時間後に自動削除。インストール不要・完全無料。',
    url: 'https://kuon-rnd.com/player/upload',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON PLAYER — 24-Hour Self-Destructing MP3 Player (Free)',
    description:
      'Upload MP3, get a password-protected share link. Auto-deletes after 24 hours. No install, no sign-up. By Kuon R&D.',
  },
  robots: { index: true, follow: true },
  other: { 'google': 'notranslate' },
};

export default function PlayerUploadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
