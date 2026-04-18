import type { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'KUON PLAYER — Secure Audio Playback',
  description:
    'パスワード保護された音声を安全に再生。24時間で自動削除。Password-protected secure audio playback. Auto-deletes after 24 hours.',
  robots: { index: false, follow: false },
};

export default function PlayerIdLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
