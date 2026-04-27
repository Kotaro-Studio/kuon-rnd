import type { Metadata } from 'next';

// 2026-04-27: SEPARATOR は Replicate API 乗せ替え完了まで非公開。
// noindex/nofollow で検索エンジンから隠す。アプリ自体はアクセス可能だが
// 公開導線（ホーム・catalog・sitemap）から外しているため、URL を直接知る人だけが入れる。
export const metadata: Metadata = {
  title: 'KUON SEPARATOR (準備中)',
  description: 'AI 音源分離ツール — Replicate API 統合作業中につき一時的に非公開。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SeparatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
