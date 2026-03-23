"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // ★トップページへの滑らかなリンク用

// --- データ定義（朝比奈さんの哲学をJSXパーツへ昇華） ---

// 1. 導入：宇宙時代とGPS
const introduction = {
  title: "GPS Algorithm",
  subtitle: "個人が宇宙と繋がるためのテクノロジー",
  // ★1枚目：農業とGPS（宇宙時代、個人と宇宙のつながりの象徴）
  image: "/A_futuristic_smart_agriculture_scene_showcasing_GP-1774173381290.png",
  text: (
    <>
      時は宇宙時代。<br />
      科学の世界でも、芸術の世界でも、スピリチュアルな世界でも<br />
      令和の今、人類は宇宙に飛び込もうとしています。<br />
      <br />
      月や火星に足を伸ばし、民間の宇宙旅行も始まりました。<br />
      GPSというのはまさに宇宙時代に個人で宇宙と繋がるための一番最初にして<br />
      最大のテクノロジーになります。
    </>
  )
};

// 2. 応用：依存する未来
const application = {
  title: "Dependency on Space",
  subtitle: "人類と、GPSとが共存する未来",
  // ★2枚目：ドローンとGPS（応用分野の象徴）
  image: "/Cinematic_aerial_photography_of_a_sleek_modern_dro-1774173538239.png",
  text: (
    <>
      ドローンが正確にホバリングするのも、農機具が正確に直線を走れるのも<br />
      すべてGPSテクノロジーのおかげで在ると言えます。<br />
      また今後レベル5の自動運転技術が世界中で広がり始めると<br />
      ますます高精度GPSの技術が求められるようになるでしょう。<br />
      <br />
      農業、自動車、ドローン、また情報伝達まで、<br />
      これから人類はGPSに依存していく未来に突入します。
    </>
  )
};

// 3. 技術と使命：みちびきRTK技術
const kuonRndTechnology = {
  title: "MICHIBIKI & RTK Tech",
  subtitle: "国家レベルのプロジェクトを手にいれる",
  // ★3枚目：自動運転とGPS（依存する未来の象徴として）
  image: "/Cinematic_sci-fi_scene_of_autonomous_self-driving_-1774173606021.png",
  text: (
    <>
      空音開発では、国家レベルのプロジェクトであるみちびき衛星からの<br />
      受信情報を使ったRTK測位技術の研究開発をしています。<br />
      <br />
      法人様を対象とした独占契約での技術提供を基本とさせていただいており、<br />
      必要な技術、アプリのご依頼はコンタクトよりご相談くださいませ。
    </>
  ),
  cta: {
    text: "GPS技術に関するご相談へ",
    url: "/#contact" // ★トップページのコンタクトセクションへ誘導
  }
};


// --- LP本体のコンポーネント（デザイン） ---

export default function GpsPage() {
  
  // インラインスタイルの共通定義（洗練されたボタンUI）
  const glassButtonStyle = {
    display: 'inline-block',
    textDecoration: 'none',
    color: '#444', // 文字色
    fontSize: '13px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase', // 全大文字
    
    // グラスモーフィズム
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    
    // 縁取りと影
    border: '1px solid rgba(0,0,0,0.05)',
    padding: '1.2rem 3rem', // 存在感のある大きさ
    borderRadius: '50px', // 丸み
    boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
    
    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // 立体感のあるアニメーション
    cursor: 'pointer'
  } as const;

  const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = '#0284c7'; 
    e.currentTarget.style.borderColor = '#0284c7'; 
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    e.currentTarget.style.transform = 'translateY(-5px) scale(1.03)'; // 浮き上がる動き
    e.currentTarget.style.boxShadow = '0 15px 30px rgba(2, 132, 199, 0.1)'; // 知的なシアンブルーの影
  };

  const handleLinkOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.color = '#444'; 
    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; 
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)';
  };

  // 画像の上品なスタイル（白い縁取り、薄い影、3D効果）
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
      
      {/* --- ■ 1. 導入：哲学と宇宙時代 --- */}
      {/* ★ className="section-responsive" でスマホ用の余白に */}
      <section className="section-responsive" style={{ padding: '12rem 5% 10rem 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
          {introduction.title}
        </h2>
        {/* ★ className="title-responsive" でスマホ用の巨大文字に */}
        <h3 className="title-responsive" style={{ fontSize: '3rem', fontWeight: '200', letterSpacing: '0.15em', lineHeight: '1.3', margin: '0 0 4rem 0' }}>
          {introduction.subtitle}
        </h3>
        
        {/* ★ className="flex-responsive" でスマホでは縦1列に */}
        <div className="flex-responsive" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center' }}>
          {/* 左側：哲学文 */}
          <div style={{ flex: 1, textAlign: 'justify' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2.4', letterSpacing: '0.05em' }}>
              {introduction.text}
            </p>
          </div>
          {/* 右側：哲学の象徴画像（農業） */}
          <div style={{ ...imageWrapperStyle, flex: 1 }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={introduction.image}
              alt="Space Era and GPS Philosophy"
              width={1200}
              height={800}
              unoptimized={true} // ★Cloudflareエラー回避
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02)' }}
              priority // ★ページ上部なので優先読み込み
            />
          </div>
        </div>
      </section>

      {/* --- ■ 2. 応用：依存する未来 --- */}
      <section className="section-responsive" style={{ padding: '10rem 5%', borderTop: '1px solid rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.03)', background: 'rgba(255,255,255,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            {application.title}
          </h3>
          <h4 className="title-responsive" style={{ fontSize: '2.5rem', fontWeight: '200', letterSpacing: '0.1em', margin: 0 }}>{application.subtitle}</h4>
        </div>

        <div className="flex-responsive" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center' }}>
          {/* 左側：応用分野画像（ドローン） */}
          <div style={{ ...imageWrapperStyle, flex: 1 }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={application.image}
              alt="GPS Application (Drone)"
              width={1200}
              height={900}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02)' }}
            />
          </div>
          {/* 右側：応用哲学文 */}
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2.4', letterSpacing: '0.05em', textAlign: 'justify' }}>
              {application.text}
            </p>
          </div>
        </div>
      </section>

      {/* --- ■ 3. 技術と使命：みちびきRTK技術 --- */}
      <section className="section-responsive" style={{ padding: '10rem 5%', backgroundColor: '#fafafa' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            {kuonRndTechnology.title}
          </h3>
          <h4 className="title-responsive" style={{ fontSize: '2.5rem', fontWeight: '200', letterSpacing: '0.1em', margin: 0 }}>{kuonRndTechnology.subtitle}</h4>
        </div>

        <div className="flex-responsive" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '5rem', alignItems: 'center' }}>
          {/* 左側：自動運転画像（未来の象徴として） */}
          <div style={{ ...imageWrapperStyle, flex: 1 }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={kuonRndTechnology.image}
              alt="Autonomous Self-Driving and GPS Tech"
              width={1200}
              height={1000}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* 右側：技術哲学文と美しいボタン */}
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '200', letterSpacing: '0.1em', lineHeight: '2.2', margin: '0 0 4rem 0', textAlign: 'justify' }}>
              {kuonRndTechnology.text}
            </p>
            
            {/* ★修正部分：トップページのコンタクトセクションへの滑らかなリンクボタン */}
            <div style={{ textAlign: 'center', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              <Link 
                href={kuonRndTechnology.cta.url} 
                style={glassButtonStyle}
                onMouseOver={handleLinkHover}
                onMouseOut={handleLinkOut}
              >
                {kuonRndTechnology.cta.text}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}