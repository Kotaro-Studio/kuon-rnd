import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "./providers";
import { Header } from "./header";

export const metadata: Metadata = {
  title: {
    default: '空音開発 Kuon R&D — ハンドメイドマイク・オーディオアプリ開発',
    template: '%s | 空音開発 Kuon R&D',
  },
  description:
    '空音開発（Kuon R&D）は、ハンドメイドステレオマイクロフォンの設計・製造と、音声処理Webアプリの開発を行う研究開発スタジオです。GPS/RTK技術の研究も。',
  icons: { icon: '/icon.png' },
  metadataBase: new URL('https://kuon-rnd.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '空音開発 Kuon R&D — ハンドメイドマイク・オーディオアプリ開発',
    description:
      'ハンドメイドステレオマイクロフォンの設計・製造と、音声処理Webアプリの開発を行う研究開発スタジオ。',
    url: 'https://kuon-rnd.com',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: '/mic01.jpeg',
        width: 1200,
        height: 630,
        alt: '空音開発 Kuon R&D',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '空音開発 Kuon R&D',
    description: 'ハンドメイドステレオマイクとオーディオアプリの研究開発スタジオ',
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
          <footer style={{ padding: '3rem 5%', textAlign: 'center', opacity: 0.5, fontSize: '0.78rem' }}>
            &copy; 2026 Kuon R&amp;D / Kotaro Asahina. All rights reserved.
          </footer>

        </ClientProviders>
      </body>
    </html>
  );
}
