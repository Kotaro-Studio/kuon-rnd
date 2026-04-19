import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '管理ダッシュボード | 空音開発',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
