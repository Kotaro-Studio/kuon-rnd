import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "./providers";
import { Header } from "./header";
import { Footer } from "./footer";

export const metadata: Metadata = {
  title: {
    default: '空音開発 Kuon R&D — 音楽家のためのプラットフォーム',
    template: '%s | 空音開発 Kuon R&D',
  },
  description:
    '録音、成長記録、スカウト。空音開発は、ハンドメイドマイク・15以上のオーディオツール・音楽家コミュニティをひとつにした、音楽家のためのプラットフォームです。',
  keywords: [
    '空音開発', 'Kuon R&D', '音楽家', 'プラットフォーム', 'マイク', 'ハンドメイドマイク',
    'オーディオアプリ', '音源分離', '和声分析', 'レッスン書き起こし', '音大生',
    'P-86S', 'X-86S', 'ステレオマイク', '録音', 'musician platform',
  ],
  icons: { icon: '/icon.png' },
  metadataBase: new URL('https://kuon-rnd.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '空音開発 Kuon R&D — 音楽家のためのプラットフォーム',
    description:
      '録音、成長記録、スカウト。ハンドメイドマイク・15以上のオーディオツール・音楽家コミュニティをひとつにした、音楽家のためのプラットフォーム。',
    url: 'https://kuon-rnd.com',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: '/mic01.jpeg',
        width: 1200,
        height: 630,
        alt: '空音開発 Kuon R&D — 音楽家のためのプラットフォーム',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '空音開発 Kuon R&D — 音楽家のためのプラットフォーム',
    description: '録音、成長記録、スカウト。ハンドメイドマイク・オーディオツール・音楽家コミュニティをひとつに。',
    images: ['/mic01.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" style={{ scrollBehavior: 'smooth' }}>
      <body>
        <ClientProviders>

          {/* ── Header ─────────────────────────────── */}
          <Header />

          {/* ── Main ───────────────────────────────── */}
          <main style={{ flex: 1 }}>{children}</main>

          {/* ── Footer ─────────────────────────────── */}
          <Footer />

        </ClientProviders>
      </body>
    </html>
  );
}
