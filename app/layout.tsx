import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ClientProviders } from "./providers";
import { LangSwitcher } from "./lang-switcher";

export const metadata: Metadata = {
  title: "空音開発 - Kuon R&D",
  description: "芸術と科学の境界線を越える研究開発スタジオ",
  icons: { icon: "/icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" style={{ scrollBehavior: 'smooth' }}>
      <body>
        <ClientProviders>

          {/* ── Header ─────────────────────────────── */}
          <header className="kuon-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.2rem 5%',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            position: 'sticky', top: 0, zIndex: 200,
          }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 style={{ fontSize: '1.1rem', fontWeight: '400', letterSpacing: '0.15em', margin: 0, cursor: 'pointer' }}>
                空音開発{' '}
                <span style={{ color: 'var(--accent)', fontSize: '0.75em', marginLeft: '0.4rem' }}>
                  Kuon R&amp;D
                </span>
              </h1>
            </Link>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <nav className="kuon-nav" style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
                <Link href="/" className="nav-link">Top</Link>
                <Link href="/profile" className="nav-link">About me</Link>
                <Link href="/#technology" className="nav-link">Technology</Link>
                <Link href="/gps#gps-tools" className="nav-link">GPS Tool</Link>
                <Link href="/audio-apps" className="nav-link">Audio App</Link>
                <Link href="/#contact" className="nav-button">Contact</Link>
              </nav>

              {/* サイト全体の言語切り替え */}
              <LangSwitcher />
            </div>
          </header>

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
