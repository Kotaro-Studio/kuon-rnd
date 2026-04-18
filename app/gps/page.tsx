"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// --- データ定義（朝比奈さんの哲学をJSXパーツへ昇華） ---

// 1. 導入：宇宙時代とGPS
const introduction = {
  title: "GPS Algorithm",
  subtitle: "個人が宇宙と繋がるためのテクノロジー",
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
    url: "/#contact" 
  }
};

// 4. オープンツール
const openTools = [
  {
    title: "Sounds of the Earth",
    subtitle: "地球の音マップ — GPS × Audio",
    desc: "世界中のフィールド録音スポットをインタラクティブな地図で探索・試聴。滝、海、鳥、森 — 地球が奏でる音楽に耳を傾けよう。あなたの録音も投稿できます。",
    url: "/soundmap-lp",
    cta: "地球の音を聴く",
    isNew: true
  },
  {
    title: "RTK Base Station",
    subtitle: "善意の基地局データ",
    desc: "センチメートル級の高精度な位置情報をオープンに提供。NTRIP方式による補正データ配信のテスト仕様と接続情報を公開しています。",
    url: "/rtk-base",
    cta: "基地局情報を見る"
  },
  {
    title: "Geocode Viewer",
    subtitle: "Kuon R&D Edition",
    desc: "空間と時間の交差点を解析するための精密なWebツール。地図上の直感的なクリック操作で、座標変換や緯度経度のマッピングを瞬時に実行します。",
    url: "/geocode-viewer",
    cta: "ビューワーを起動する"
  }
];

// --- LP本体のコンポーネント ---

export default function GpsPage() {
  
  // インラインスタイルの共通定義（洗練されたボタンUI）
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
    cursor: 'pointer',
    fontFamily: '"Helvetica Neue", Arial, sans-serif'
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
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', color: 'var(--text-main)', fontFamily: '"Hiragino Mincho ProN", "Shippori Mincho", "Yu Mincho", serif' }}>
      
      {/* --- ■ 1. 導入：哲学と宇宙時代 --- */}
      <section className="section-responsive" style={{ padding: '12rem 5% 10rem 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent, #bda678)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
          {introduction.title}
        </h2>
        <h3 className="title-responsive" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '200', letterSpacing: '0.15em', lineHeight: '1.5', margin: '0 0 4rem 0', color: '#111' }}>
          {introduction.subtitle}
        </h3>
        
        <div className="flex-responsive" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', textAlign: 'left' }}>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '2.4', letterSpacing: '0.08em', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              {introduction.text}
            </p>
          </div>
          <div style={{ ...imageWrapperStyle, flex: '1 1 300px' }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={introduction.image}
              alt="Space Era and GPS Philosophy"
              width={1200}
              height={800}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02) grayscale(10%)' }}
              priority 
            />
          </div>
        </div>
      </section>

      {/* --- ■ 2. 応用：依存する未来 --- */}
      <section className="section-responsive" style={{ padding: '10rem 5%', borderTop: '1px solid rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.03)', background: 'rgba(255,255,255,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent, #bda678)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            {application.title}
          </h3>
          <h4 className="title-responsive" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '200', letterSpacing: '0.1em', margin: 0, color: '#111' }}>{application.subtitle}</h4>
        </div>

        <div className="flex-responsive" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', flexDirection: 'row-reverse' }}>
          <div style={{ flex: '1 1 300px', textAlign: 'left' }}>
            <p style={{ color: '#555', fontSize: '0.95rem', lineHeight: '2.4', letterSpacing: '0.08em', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              {application.text}
            </p>
          </div>
          <div style={{ ...imageWrapperStyle, flex: '1 1 300px' }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={application.image}
              alt="GPS Application (Drone)"
              width={1200}
              height={900}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02) grayscale(10%)' }}
            />
          </div>
        </div>
      </section>

      {/* --- ■ 3. 技術と使命：みちびきRTK技術 --- */}
      <section className="section-responsive" style={{ padding: '10rem 5%', backgroundColor: '#fafafa' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent, #bda678)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            {kuonRndTechnology.title}
          </h3>
          <h4 className="title-responsive" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '200', letterSpacing: '0.1em', margin: 0, color: '#111' }}>{kuonRndTechnology.subtitle}</h4>
        </div>

        <div className="flex-responsive" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '5rem', alignItems: 'center' }}>
          <div style={{ ...imageWrapperStyle, flex: '1 1 400px' }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={kuonRndTechnology.image}
              alt="Autonomous Self-Driving and GPS Tech"
              width={1200}
              height={1000}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02) grayscale(10%)' }}
            />
          </div>

          <div style={{ flex: '1 1 300px' }}>
            <p style={{ color: '#222', fontSize: 'clamp(1.1rem, 2vw, 1.2rem)', fontWeight: '300', letterSpacing: '0.1em', lineHeight: '2.2', margin: '0 0 4rem 0', textAlign: 'justify' }}>
              {kuonRndTechnology.text}
            </p>
            
            <div style={{ textAlign: 'left' }}>
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

      {/* --- ■ 4. オープンツール（最後尾） --- */}
      {/* 🎯 メニューから飛べるように id="gps-tools" を付与しました */}
      <section id="gps-tools" className="section-responsive" style={{ padding: '8rem 5% 12rem 5%', borderTop: '1px solid rgba(0,0,0,0.03)', backgroundColor: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent, #bda678)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            Open Geolocation Tools
          </h3>
          <h4 className="title-responsive" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '200', letterSpacing: '0.1em', margin: 0, color: '#111' }}>
            社会と共有する、時空解析のインターフェース
          </h4>
          <p style={{ color: '#666', marginTop: '2rem', fontSize: '0.95rem', letterSpacing: '0.05em', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            空音開発が研究する技術の一部を、誰でも利用できるパブリックツールとして公開しています。
          </p>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center' }}>
          {openTools.map((tool, index) => (
            <div key={index} style={{
              flex: '1 1 350px',
              backgroundColor: '#fafafa',
              border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: '12px',
              padding: '3rem',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.4s ease, box-shadow 0.4s ease',
              fontFamily: '"Helvetica Neue", Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--accent, #bda678)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  {tool.subtitle}
                </span>
                {'isNew' in tool && tool.isNew && (
                  <span style={{ background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', letterSpacing: '0.1em' }}>
                    NEW
                  </span>
                )}
              </div>
              <h5 style={{ fontSize: '1.6rem', color: '#111', margin: '0 0 1.5rem 0', fontWeight: '400', letterSpacing: '0.05em' }}>
                {tool.title}
              </h5>
              <p style={{ color: '#555', fontSize: '0.9rem', lineHeight: '2', margin: '0 0 2.5rem 0', flex: 1 }}>
                {tool.desc}
              </p>
              
              <div>
                <Link 
                  href={tool.url} 
                  style={{ ...glassButtonStyle, padding: '1rem 2rem', fontSize: '0.8rem', width: '100%', textAlign: 'center', backgroundColor: '#fff' }}
                  onMouseOver={handleLinkHover}
                  onMouseOut={handleLinkOut}
                >
                  {tool.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}