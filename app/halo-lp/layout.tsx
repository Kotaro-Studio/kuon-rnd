import type { Metadata } from 'next';

// 旧 /halo-lp は廃止・ホームへリダイレクト
export const metadata: Metadata = {
  title: 'Redirecting...',
  robots: { index: false, follow: false, nocache: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
