import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 — 空音開発 Kuon R&D',
  description:
    '空音開発（空音開発）の特定商取引法に基づく表記。販売業者情報、支払い方法、配送、返品ポリシー。',
  keywords: [
    '特定商取引法',
    '特商法',
    'tokushoho',
    'business information',
    '販売業者',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/legal/tokushoho',
  },
  openGraph: {
    title: '特定商取引法に基づく表記 — 空音開発',
    description: '空音開発の法律に基づく販売業者情報。',
    url: 'https://kuon-rnd.com/legal/tokushoho',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TokushohLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
