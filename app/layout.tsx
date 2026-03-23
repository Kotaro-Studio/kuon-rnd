import type { Metadata } from "next";
import Link from "next/link"; 
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
        
        {/* --- ヘッダー --- */}
        <header className="kuon-header" style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem 5%', 
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '400', letterSpacing: '0.15em', margin: 0, cursor: 'pointer' }}>
              空音開発 <span style={{ color: 'var(--accent)', fontSize: '0.8em', marginLeft: '0.5rem' }}>Kuon R&D</span>
            </h1>
          </Link>

          <nav className="kuon-nav" style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <Link href="/" className="nav-link">Top</Link>
            <Link href="/profile" className="nav-link">About me</Link>
            <Link href="/#technology" className="nav-link">Technology</Link>
            
            {/* ★ ここに「Web App」のリンクを追加しました！ */}
            <Link href="/webapp" className="nav-link">Web App</Link>
            
            <Link href="/#contact" className="nav-button">Contact</Link>
          </nav>
        </header>

        {/* --- メインコンテンツ --- */}
        <main style={{ flex: 1 }}>{children}</main>

        {/* --- フッター --- */}
        <footer style={{ padding: '3rem 5%', textAlign: 'center', opacity: 0.6, fontSize: '0.8rem' }}>
          &copy; 2026 Kuon R&D / Kotaro Asahina. All rights reserved.
        </footer>

      </body>
    </html>
  );
}