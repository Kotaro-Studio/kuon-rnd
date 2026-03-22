"use client";
import React from 'react';
import Image from 'next/image';

// --- データ定義（朝比奈さんの哲学をJSXパーツへ昇華） ---

const introduction = {
  title: "Microphone Crafting",
  subtitle: "無指向性ステレオペア録音の、美学",
  image: "/mic01.jpeg", 
  text: (
    <>
      無指向性マイクは、録音エンジニアの世界でも取り扱いが難しいマイクとして知られています。<br />
      入射音、反射音すべてを捉えるマイクなので、当然です。<br />
      入射音と反射音は通常天然のディレイがかかりますし、当然天然のリバーブもかかります。<br />
      ステレオ無指向性ペア録音というのは、こういった天然のエフェクトを駆使して収録する必要があるので、<br />
      音楽収録においては指向性マイクよりも難易度は上であると言えます。<br />
      <br />
      そんな中で空音開発の音楽録音は、無指向性のステレオペア録音に絞り、<br />
      究極にシンプルに、そして研ぎ澄まされた技術を結集しています。
    </>
  )
};

const soldering = {
  title: "Aesthetical Soldering",
  image: "/mic02.jpeg", 
  text: (
    <>
      素材選びもオーディオの神様である金田明彦氏推奨のもので揃えており、<br />
      音楽家：朝比奈幸太郎が一本一本丁寧にハンダ付けして制作しています。<br />
      朝比奈幸太郎が一つ一つハンダ付けするのには意味があります。<br />
      こういったところが、芸術と科学の融合であると言えるのではないかと思うわけであります。
    </>
  ),
  quote: (
    <>
      たかがハンダ付けと安易に考えてはならない。<br />
      ハンダ付け1箇所で音が変わる。<br />
      恐ろしいことにハンダ付けをした人間の性格が現れるのだ。<br />
      几帳面な人では几帳面な音。<br />
      大らかな性格な人では大らかな音。<br />
      適当な性格な人では適当な音になる。<br />
      不思議な事に几帳面過ぎても音は良くない。<br />
      程よく几帳面で、程よく適当な人が音楽的に良い音を出す。
    </>
  ),
  quoteSource: "引用：金田明彦著『オーディオDCアンプ制作のすべて上巻』（2003年3月7日）"
};

const vibration = {
  title: "Recording Artist's Vibration",
  image: "/mic03.jpeg", 
  text: (
    <>
      無指向性マイクのもう一つの特徴が、録音する人のバイブレーションがどういうわけか音に反映されるということ。<br />
      録音する人が本当に感動していれば録音される音は本当に感動的な音になりますし、<br />
      録音対象の音を見下していたりすれば、本当にそういう音で録音されるのです。<br />
      <br />
      それは、科学的に考察するとすれば音が波だからだと言えますし、<br />
      オーディオの芸術性、そしてスピリチュアルな領域になるのかもしれません。<br />
      だからこそ、その人が歳を重ねても違う音、違う音楽がそこに広がる。<br />
      金田明彦氏が録音エンジニアのことを「録音アーティスト」という肩書きで呼ぶ所以なのかもしれません。
    </>
  ),
  link: {
    text: "マイクロフォンの購入と試聴",
    url: "https://kotarohattori.com" 
  }
};


// --- LP本体のコンポーネント（デザイン） ---

export default function MicrophonePage() {
  
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

  const imageWrapperStyle = {
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
      
      {/* --- ■ 1. 導入：哲学と無指向性の深淵 --- */}
      <section style={{ padding: '12rem 5% 10rem 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
          {introduction.title}
        </h2>
        <h3 style={{ fontSize: '3rem', fontWeight: '200', letterSpacing: '0.15em', lineHeight: '1.3', margin: '0 0 4rem 0' }}>
          {introduction.subtitle}
        </h3>
        
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center' }}>
          <div style={{ flex: 1, textAlign: 'justify' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2.4', letterSpacing: '0.05em' }}>
              {introduction.text}
            </p>
          </div>
          <div style={{ ...imageWrapperStyle, flex: 1 }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={introduction.image}
              alt="Omnidirectional Microphone Philosophy"
              width={1200}
              height={800}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02)' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* --- ■ 2. 技術と芸術：ハンダ付けと金田氏の叡智 --- */}
      <section style={{ padding: '10rem 5%', borderTop: '1px solid rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.03)', background: 'rgba(255,255,255,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            {soldering.title}
          </h3>
          <h4 style={{ fontSize: '2.5rem', fontWeight: '200', letterSpacing: '0.1em', margin: 0 }}>芸術と科学が、融合する瞬間。</h4>
        </div>

        {/* 構成変更：画像とテキストを横並びにし、その「下」に全幅の引用を配置 */}
        <div style={{ maxWidth: '950px', margin: '0 auto' }}>
          
          {/* 上段：テキストと画像 */}
          <div style={{ display: 'flex', gap: '5rem', alignItems: 'center', marginBottom: '6rem' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2.4', letterSpacing: '0.05em', textAlign: 'justify' }}>
                {soldering.text}
              </p>
            </div>
            <div style={{ ...imageWrapperStyle, flex: 1 }}
              onMouseOver={handleImageHover}
              onMouseOut={handleImageOut}
            >
              <Image 
                src={soldering.image}
                alt="Hand-soldering by Kotaro Asahina"
                width={1200}
                height={900}
                unoptimized={true}
                style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02)' }}
              />
            </div>
          </div>

          {/* ★下段：全幅を使った最高におしゃれな引用デザイン */}
          <div style={{ 
            position: 'relative',
            width: '100%',
            padding: '5rem 3rem', 
            backgroundColor: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '16px', 
            border: '1px solid rgba(255, 255, 255, 1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
            textAlign: 'center', // 中央揃えで詩的に魅せる
            overflow: 'hidden'
          }}>
            {/* 装飾：巨大なクォーテーションマークの透かし */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '12rem',
              color: 'var(--accent)',
              opacity: 0.05,
              fontFamily: '"Times New Roman", Times, serif',
              lineHeight: 1,
              userSelect: 'none'
            }}>“</div>

            {/* 引用テキスト */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ 
                fontSize: '1.3rem', 
                fontWeight: '300', 
                letterSpacing: '0.15em', 
                lineHeight: '2.4', 
                color: 'var(--text-main)',
                margin: '0 0 3rem 0'
              }}>
                {soldering.quote}
              </p>
              
              {/* 引用元（控えめに、しかし上品に） */}
              <div style={{ 
                display: 'inline-block',
                borderTop: '1px solid rgba(0,0,0,0.1)',
                paddingTop: '1rem'
              }}>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: '#888', 
                  letterSpacing: '0.1em', 
                  fontFamily: '"Helvetica Neue", Arial, sans-serif' 
                }}>
                  {soldering.quoteSource}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- ■ 3. 精神：録音アーティストのバイブレーション --- */}
      <section style={{ padding: '10rem 5%', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '5rem', alignItems: 'center' }}>
          <div style={{ ...imageWrapperStyle, flex: 1 }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={vibration.image}
              alt="Completed Omnidirectional Microphone Pair"
              width={1200}
              height={1000}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              {vibration.title}
            </h3>
            <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '200', letterSpacing: '0.1em', lineHeight: '2.2', margin: '0 0 4rem 0', textAlign: 'justify' }}>
              {vibration.text}
            </p>
            
            <div style={{ textAlign: 'left', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              <a 
                href={vibration.link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={glassButtonStyle}
                onMouseOver={handleLinkHover}
                onMouseOut={handleLinkOut}
              >
                {vibration.link.text}
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}