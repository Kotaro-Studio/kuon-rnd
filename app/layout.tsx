// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "空音開発 - Kuon R&D",
  description: "芸術と科学の境界線を越える研究開発スタジオ",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        
        {/* --- ヘッダー（メニュー復活版） --- */}
        <header style={{ 
          padding: '1.5rem 5%', 
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(5, 5, 10, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', /* Safari用のすりガラス設定 */
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',                 /* ★横並びにする魔法 */
          justifyContent: 'space-between', /* ★左（ロゴ）と右（メニュー）に分ける */
          alignItems: 'center'             /* ★縦の真ん中を揃える */
        }}>
          {/* 左側：ロゴ */}
          <h1 style={{ fontSize: '1.2rem', fontWeight: '300', letterSpacing: '0.15em', margin: 0 }}>
            空音開発 <span style={{ color: 'var(--accent)', fontSize: '0.8em', marginLeft: '0.5rem', fontWeight: '400' }}>Kuon R&D</span>
          </h1>

          {/* 右側：ナビゲーションメニュー */}
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#vision" className="nav-link">Vision</a>
            <a href="#technology" className="nav-link">Technology</a>
            <a href="#studio" className="nav-link">Studio</a>
            <a href="#contact" className="nav-button">Contact</a>
          </nav>
        </header>

        {/* --- メインコンテンツ --- */}
        <main style={{ flex: 1 }}>
          {children}
        </main>

        {/* --- フッター --- */}
        <footer style={{ 
          padding: '3rem 5%', 
          textAlign: 'center', 
          opacity: 0.4, 
          fontSize: '0.8rem',
          letterSpacing: '0.05em'
        }}>
          © 2026 Kuon R&D.
        </footer>

      </body>
    </html>
  );
}