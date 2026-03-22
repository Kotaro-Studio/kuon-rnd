// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link"; // ★Next.jsの高速画面遷移ツールを読み込み
import "./globals.css";

export const metadata: Metadata = {
  title: "空音開発 - Kuon R&D",
  description: "芸術と科学の境界線を越える研究開発スタジオ",
  icons: { icon: "/icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header style={{ 
          padding: '1.5rem 5%', 
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 100,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '400', letterSpacing: '0.15em', margin: 0 }}>
            空音開発 <span style={{ color: 'var(--accent)', fontSize: '0.8em', marginLeft: '0.5rem' }}>Kuon R&D</span>
          </h1>

          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {/* ★ここがポイント！それぞれの行き先（href）を指定しています */}
            <Link href="/profile" className="nav-link">About me</Link>
            <Link href="/#vision" className="nav-link">Vision</Link>
            <Link href="/#technology" className="nav-link">Technology</Link>
            <Link href="/#service" className="nav-link">Service</Link>
            <Link href="/#contact" className="nav-button">Contact</Link>
          </nav>
        </header>

        <main style={{ flex: 1 }}>{children}</main>

        <footer style={{ padding: '3rem 5%', textAlign: 'center', opacity: 0.6, fontSize: '0.8rem' }}>
          © 2026 Kuon R&D.
        </footer>
      </body>
    </html>
  );
}