import type { Metadata } from 'next';
import Link from 'next/link';

// サイト全体の検索エンジン向け設定（SEO）
export const metadata: Metadata = {
  title: '空音開発 | Kuon Rnd',
  description: '芸術と科学の境界線を越える。音・映像・テクノロジーを高次元で融合させる研究開発スタジオ。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#fcfcfc', color: '#1a1a1a', fontFamily: 'sans-serif' }}>
        
        {/* 全ページ共通の固定ヘッダー */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(252, 252, 252, 0.85)', // ほんのり透ける白
          backdropFilter: 'blur(10px)', // すりガラス効果で上品に
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
        }}>
          
          {/* ▼ 左側のロゴ部分：ここを「空音開発」に変更し、明朝体にしました ▼ */}
          <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '0.1em', fontFamily: 'serif' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>
              空音開発
            </Link>
          </div>

          {/* 右側のナビゲーションメニュー */}
          <nav>
            <Link href="/" style={{ marginLeft: '40px', textDecoration: 'none', color: '#555', fontSize: '13px', letterSpacing: '0.1em', transition: 'color 0.2s' }}>HOME</Link>
            <Link href="/profile" style={{ marginLeft: '40px', textDecoration: 'none', color: '#555', fontSize: '13px', letterSpacing: '0.1em', transition: 'color 0.2s' }}>PROFILE</Link>
            <Link href="/contact" style={{ marginLeft: '40px', textDecoration: 'none', color: '#555', fontSize: '13px', letterSpacing: '0.1em', transition: 'color 0.2s' }}>CONTACT</Link>
          </nav>
        </header>

        {/* 各ページの中身（page.tsx）がここに入ります */}
        <main>
          {children}
        </main>

      </body>
    </html>
  );
}