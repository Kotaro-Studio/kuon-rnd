"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // ★Next.jsの高速リンクをインポート

// --- LP本体のデータ定義（朝比奈さんの哲学をJSXパーツへ昇華） ---

const introduction = {
  title: "Revox Restoring",
  subtitle: "叡智を、次の世代へ繋ぐ使命",
  image: "/revox01.jpeg", 
  text: (
    <>
      最高のマスターレコーダーの哲学的な位置付けは、半世紀を経ても変わらない。<br />
      オーディオ史に刻まれたRevoxという叡智を、私たちは失ってはいけません。<br />
      実体なき音が、デジタルへの移行によって永久不滅のものとなった今、<br />
      その「魂」をハードウェアとして現世に留め、次世代に引き渡す。<br />
      それが空音開発の使命です。
    </>
  )
};

const restoring = {
  title: "Junk to Jewelry",
  images: [
    { src: "/revox04.jpeg", alt: "Restoring Detail 1" }, 
    { src: "/revox03.jpeg", alt: "Restoring Detail 2" }, 
    { src: "/revox02.jpeg", alt: "Restoring Detail 3" }  
  ],
  text: (
    <>
      Revoxのオープンリールレコーダーは、初代A77の発売から半世紀以上が経過しました。<br />
      日本のメーカーであっても早ければ10年、長くても30年でパーツの保管はなくなります。<br />
      しかし、現代でもRevoxはA77〜B77まで、フルレストアのためのパーツのすべてが<br />
      なんらかの方法で手に入ります。これは到底考えられないことなのです。<br />
      <br />
      空音開発では、完全にジャンクとなったRevoxを仕入れ、高い技術力でフルレストアを施します。<br />
      アンプ制作で培った厳選されたコンデンサーに交換し、当時の音よりもさらに<br />
      弾けるような音質にアップグレードして、次の世代に引き渡します。
    </>
  )
};

const kaneta = {
  title: "金田式DC録音への統合",
  tagImage: "/revox-kaneta.jpeg", 
  restoredImage: "/revox07.jpg",  
  text: (
    <>
      金田式アナログバランス電流伝送DC録音において、<br />
      金田明彦氏より採用されているRevoxのマスターレコーダー。<br />
      <br />
      空音開発では、タイムマシンレコードの五島昭彦氏の厳格なる管理監督の元、<br />
      B77の金田式アナログバランス電流伝送化への改造も行っています。
    </>
  ),
  links: {
    kaneta: {
      text: "金田式DC録音技術への探求",
      url: "https://academy.kotarohattori.com" 
    },
    contact: {
      text: "Revoxに関するご相談",
      // ★修正：Formspreeの直URLではなく、トップページのフォームへ誘導
      url: "/#contact" 
    }
  }
};


// --- LP本体のコンポーネント（デザイン） ---

export default function RevoxPage() {
  
  const glassButtonStyle = {
    display: 'inline-block',
    textDecoration: 'none',
    color: '#444',
    fontSize: '13px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(0,0,0,0.05)',
    padding: '1.2rem 3rem',
    borderRadius: '50px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: 'pointer'
  } as const;

  const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = '#0284c7'; 
    e.currentTarget.style.borderColor = '#0284c7'; 
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)';
    e.currentTarget.style.boxShadow = '0 15px 30px rgba(2, 132, 199, 0.1)';
  };

  const handleLinkOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = '#444'; 
    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; 
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)';
  };

  const autoImageWrapperStyle = {
    position: 'relative',
    width: '100%',
    height: 'auto', 
    borderRadius: '12px',
    overflow: 'hidden',
    border: '4px solid #fff',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    backgroundColor: 'transparent'
  } as const;

  const fixedImageWrapperStyle = {
    position: 'relative',
    width: '100%',
    height: '220px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '4px solid #fff',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    backgroundColor: '#fff'
  } as const;

  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)';
    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
  };

  const handleImageOut = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', color: 'var(--text-main)', fontFamily: '"Hiragino Mincho ProN", "Yu Mincho", serif' }}>
      
      {/* --- ■ 1. 導入：哲学と使命 --- */}
      <section style={{ padding: '12rem 5% 10rem 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
          {introduction.title}
        </h2>
        <h3 style={{ fontSize: '3rem', fontWeight: '200', letterSpacing: '0.15em', lineHeight: '1.3', margin: '0 0 4rem 0' }}>
          {introduction.subtitle}
        </h3>
        
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, textAlign: 'justify' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2.4', letterSpacing: '0.05em' }}>
              {introduction.text}
            </p>
          </div>
          <div style={{ ...autoImageWrapperStyle, flex: 1 }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={introduction.image}
              alt="Revox Philosophy Symbol"
              width={1200}
              height={800}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02)' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* --- ■ 2. 技術と情熱：レストアのディテール --- */}
      <section style={{ padding: '10rem 5%', borderTop: '1px solid rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.03)', background: 'rgba(255,255,255,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Restoring</h3>
          <h4 style={{ fontSize: '2.5rem', fontWeight: '200', letterSpacing: '0.1em', margin: 0 }}>{restoring.title}</h4>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          <div style={{ textAlign: 'justify' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2.4', letterSpacing: '0.05em' }}>
              {restoring.text}
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {restoring.images.map((image, index) => (
              <div key={index} style={fixedImageWrapperStyle}
                onMouseOver={handleImageHover}
                onMouseOut={handleImageOut}
              >
                <Image 
                  src={image.src} 
                  alt={image.alt}
                  layout="fill"
                  objectFit="cover"
                  unoptimized={true}
                  style={{ filter: 'contrast(0.95) brightness(1.02)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- ■ 3. 叡智の継承：金田式DC録音への統合 --- */}
      <section style={{ padding: '10rem 5%', background: '#fafafa' }}>
        <div style={{ 
          display: 'flex', gap: '5rem', alignItems: 'center', 
          maxWidth: '1100px', margin: '0 auto' 
        }}>
          {/* 左側：画像エリア */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={autoImageWrapperStyle}
              onMouseOver={handleImageHover}
              onMouseOut={handleImageOut}
            >
              <Image 
                src={kaneta.tagImage}
                alt="Kaneta DC Recording Philosophy Tag"
                width={1200}
                height={800}
                unoptimized={true}
                style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(1.1) brightness(0.95)' }} 
              />
            </div>
            
            <div style={autoImageWrapperStyle}
              onMouseOver={handleImageHover}
              onMouseOut={handleImageOut}
            >
              <Image 
                src={kaneta.restoredImage}
                alt="Restored Revox for Kaneta System"
                width={1200}
                height={800}
                unoptimized={true}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>

          {/* 右側：哲学文とボタン */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              {kaneta.title}
            </h3>
            <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '200', letterSpacing: '0.1em', lineHeight: '2.2', margin: '0 0 3rem 0', textAlign: 'justify' }}>
              {kaneta.text}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              {/* 外部サイトへのリンク（別タブで開く） */}
              <a 
                href={kaneta.links.kaneta.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={glassButtonStyle}
                onMouseOver={handleLinkHover}
                onMouseOut={handleLinkOut}
              >
                {kaneta.links.kaneta.text}
              </a>
              
              {/* ★修正部分：トップページのコンタクトフォームへのリンク */}
              <Link 
                href={kaneta.links.contact.url} 
                style={glassButtonStyle}
                onMouseOver={handleLinkHover}
                onMouseOut={handleLinkOut}
              >
                {kaneta.links.contact.text}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}