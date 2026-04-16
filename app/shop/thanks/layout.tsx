import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ご購入ありがとうございます | 空音開発 Kuon R&D',
  robots: { index: false, follow: false },
};

export default function ThanksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
