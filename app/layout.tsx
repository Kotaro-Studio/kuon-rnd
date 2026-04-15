import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "./providers";
import { Header } from "./header";

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
