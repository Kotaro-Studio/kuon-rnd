import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — 空音開発 Kuon R&D',
  description:
    'Kuon R&D Terms of Service. Legal terms governing use of audio tools, microphone sales, and platform services.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'TOS',
    'user agreement',
    '利用規約',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/legal/terms',
  },
  openGraph: {
    title: 'Terms of Service — Kuon R&D',
    description: 'Legal terms governing Kuon R&D services.',
    url: 'https://kuon-rnd.com/legal/terms',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
