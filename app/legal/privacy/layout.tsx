import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — 空音開発 Kuon R&D',
  description:
    'Kuon R&D privacy policy. Information about how we collect, use, and protect your personal data.',
  keywords: [
    'privacy policy',
    'data protection',
    'privacy',
    'personal information',
    'プライバシーポリシー',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/legal/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — Kuon R&D',
    description: 'Information about how Kuon R&D handles your personal data.',
    url: 'https://kuon-rnd.com/legal/privacy',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
