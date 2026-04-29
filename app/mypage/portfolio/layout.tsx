import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ポートフォリオ編集 | KUON',
  description: '空音開発のポートフォリオ編集ページ',
  robots: { index: false, follow: false, nocache: true },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
