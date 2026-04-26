import type { Metadata } from 'next';

// 旧 /halo URL → /admin/halo へリダイレクト
// noindex で検索エンジンに残らないように
export const metadata: Metadata = {
  title: 'Redirecting...',
  robots: { index: false, follow: false, nocache: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
