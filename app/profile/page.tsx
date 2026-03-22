"use client";
import React from 'react';
import Image from 'next/image';

export default function ProfilePage() {
  // --- スタイル定義（芸術家兼技術者らしい、ミニマルで洗練されたデザイン） ---
  const styles = {
    container: {
      padding: '100px 20px', 
      fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif', // 上質な明朝体を指定
      color: '#1a1a1a', // 墨色
      minHeight: '100vh',
      backgroundColor: '#fafafa', // 透明感のある白
    },
    profileHeaderSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      marginBottom: '80px',
    },
    imageWrapper: {
      width: '180px', 
      height: '180px',
      borderRadius: '50%',
      overflow: 'hidden',
      marginBottom: '40px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.06)', // 薄く柔らかい影
      border: '4px solid #fff', 
      backgroundColor: '#fff', 
    },
    titles: {
      fontSize: '12px',
      color: '#888',
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      marginBottom: '15px',
      fontFamily: '"Helvetica Neue", Arial, sans-serif', // サブタイトルはゴシック
    },
    nameJa: {
      fontSize: '36px',
      fontWeight: '300', // 細字で上品に
      marginTop: '10px',
      marginBottom: '10px',
      letterSpacing: '0.2em',
    },
    nameEn: {
      fontSize: '16px',
      color: '#666',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      letterSpacing: '0.15em',
      fontWeight: '300',
    },
    biographySection: {
      textAlign: 'justify', // 両端揃え（書籍のような雰囲気に）
      fontSize: '16px',
      lineHeight: '2.4', // 行間をゆったりと
      letterSpacing: '0.05em',
      maxWidth: '700px',
      margin: '0 auto',
      color: '#333',
    },
    paragraph: {
      marginBottom: '3em', // 段落間の余白を大きく取り、間合いを持たせる
    },
    
    // ★追加：リンクセクションのスタイル定義
    linksSection: {
      display: 'flex',
      justifyContent: 'center',
      gap: '30px', // ボタン同士の間隔
      marginTop: '100px', // 上部との余白を大きく取り、目立たせる
      fontFamily: '"Helvetica Neue", Arial, sans-serif', // 欧文部分はゴシック
    },
    
    // ★追加：美しいボタンのスタイル定義
    linkButton: {
      display: 'inline-block',
      textDecoration: 'none',
      color: '#444', // 文字色
      fontSize: '13px',
      letterSpacing: '0.15em',
      textTransform: 'uppercase', // 全大文字でシャープに
      
      // グラスモーフィズムの質感
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      
      // 縁取りと影
      border: '1px solid rgba(0,0,0,0.05)',
      padding: '1.2rem 3rem', // 存在感のある大きさ
      borderRadius: '50px', // 丸みのあるフォルム
      boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
      
      transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // 滑らかな3Dアニメーション
    },
    
    footer: {
      marginTop: '150px',
      paddingTop: '40px',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      textAlign: 'center',
      fontSize: '12px',
      color: '#aaa',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      letterSpacing: '0.1em',
    },
  } as const;

  return (
    <div style={styles.container}>
      
      {/* --- メインコンテンツ --- */}
      <div style={styles.profileHeaderSection}>
        {/* プロフィール写真 */}
        <div style={styles.imageWrapper}>
          <Image
            src="/kotaro.jpeg" 
            alt="朝比奈幸太郎"
            width={200}
            height={200}
            unoptimized={true} // Cloudflare環境でのエラー回避
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              filter: 'contrast(0.95) grayscale(10%)', // 質感を高める
            }}
            priority
          />
        </div>

        <header>
          <p style={styles.titles}>音楽家 / 録音アーティスト / 空音開発 代表</p>
          <h1 style={styles.nameJa}>朝比奈 幸太郎</h1>
          <p style={styles.nameEn}>Kotaro Asahina</p>
        </header>
      </div>

      {/* --- 略歴（バイオグラフィー） --- */}
      <section style={styles.biographySection}>
        
        <p style={styles.paragraph}>
          音楽大学にて民族音楽を研究し、卒業後はピアニストとして活動。<br />
          日本でピアニストとして活動しながら、北欧スウェーデンへLindha Kallerdahlと即興演奏研究、ファーストアルバムはドイツ・ケルンでAchim Tangとアルバム制作をし、日本とドイツで同時リリース。<br />
          制作現場にて Stephan Desire より音響学の基礎を学ぶ。
        </p>

        <p style={styles.paragraph}>
          帰国後「金田式DC録音」の第一人者・五島昭彦氏に師事。<br />
          独立後、後芸術工房 Pinocoa を結成し、録音エンジニア、プロデューサーとして、アルゼンチンタンゴ、クラシック、古楽など世界の様々な作品制作をプロデュースする。
        </p>

        <p style={styles.paragraph}>
          プロデューサーとしての活動を続けながら、株式会社ジオセンス・小林一英氏よりC言語およびGPS技術を学び、村上アーカイブス・村上浩治氏より映像技術を習得。<br />
          これにより、「音・映像・テクノロジー」を横断するクリエイターとして独自の制作スタイルを確立。
        </p>

        <p style={styles.paragraph}>
          現在はヴィンテージ機材（Revox等）のレストアや、オリジナルマイク、アンプ、スピーカーの設計開発も手掛けるなど、ハードウェアへの造詣も深める。<br />
          一方で、2025年より金田式DC録音の五島昭彦氏のレーベルで再び学び直し、金田明彦氏の発明した「金田式DC録音技術」の奥義を探求。<br />
          音の純度とヒーリング効果を科学するプロトコル「Curanz Sounds」を発信中。
        </p>

        <p style={{ ...styles.paragraph, marginBottom: 0 }}>
          2026年、芸術と科学の境界線を探求する、空音開発（Kuon R&D）の代表として、GPS技術を応用した独自のアルゴリズム開発、および高度なWebアプリケーション開発を統合。<br />
          次世代のエンジニア育成や技術継承にも情熱を注ぎ、音響工学と最先端テクノロジー、そして芸術表現が高次元で融合する新たな地平を目指している。
        </p>

      </section>

      {/* --- 外部リンクセクション（ブログ・SNS） --- */}
      {/* ★スタイルを適用し、目立たせます */}
      <div style={styles.linksSection}>
        <a 
          href="https://kotaroasahina.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={styles.linkButton}
          // マウスホバーでシアンブルーに美しく光り、浮き上がる魔法
          onMouseOver={(e) => { 
            e.currentTarget.style.color = '#0284c7'; 
            e.currentTarget.style.borderColor = '#0284c7'; 
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(2, 132, 199, 0.1)';
          }}
          onMouseOut={(e) => { 
            e.currentTarget.style.color = '#444'; 
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; 
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)';
          }}
        >
          Official Website & Blog
        </a>
        <a 
          href="https://www.instagram.com/kotaro_asahina/" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={styles.linkButton}
          // こちらも同様の魔法を
          onMouseOver={(e) => { 
            e.currentTarget.style.color = '#0284c7'; 
            e.currentTarget.style.borderColor = '#0284c7'; 
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(2, 132, 199, 0.1)';
          }}
          onMouseOut={(e) => { 
            e.currentTarget.style.color = '#444'; 
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; 
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)';
          }}
        >
          Instagram
        </a>
      </div>

      {/* --- フッター --- */}
      <footer style={styles.footer}>
        <p>&copy; 2026 Kuon R&D / Kotaro Asahina. All rights reserved.</p>
      </footer>
      
    </div>
  );
}