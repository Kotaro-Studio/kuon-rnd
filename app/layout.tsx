import type { Metadata } from "next";
import Link from "next/link"; 
import "./globals.css";

export const metadata: Metadata = {
  title: "空音開発",
  description: "芸術と科学を融合させる研究開発スタジオ",
  icons: { icon: "/icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        
        {/* --- ヘッダー --- */}
        {/* ★直接タグに display: 'flex' や justifyContent などの指示を復活させ、絶対に無視されないようにします */}
        <header className="kuon-header" style={{ 
          display: 'flex',               // ★復活：横並び
          justifyContent: 'space-between', // ★復活：左右の両端に離す
          alignItems: 'center',          // ★復活：縦の中央揃え
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

          {/* ★ナビゲーションも同様に、隙間(gap)の指示を直接復活させます */}
          <nav className="kuon-nav" style={{
            display: 'flex',  // ★復活：横並び
            gap: '2rem',      // ★復活：メニュー間の隙間
            alignItems: 'center'
          }}>
            <Link href="/" className="nav-link">Top</Link>
            <Link href="/profile" className="nav-link">About me</Link>
            <Link href="/#technology" className="nav-link">Technology</Link>
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