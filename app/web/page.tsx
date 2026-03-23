"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// --- データ定義（朝比奈さんの哲学と最新Web技術の融合） ---

// 1. 導入：Headless CMSとエッジコンピューティングの哲学
const introduction = {
  title: "Pure Digital Architecture",
  subtitle: "削ぎ落とされたノイズ。光の速さで届く純粋な情報。",
  image: "/A_sophisticated_and_futuristic_visualization_of_mo-1774174072344.png", 
  text: (
    <>
      オーディオの世界において、不要な回路、また時にはコンデンサーでさえも音の純度を下げる「ノイズ」となります。<br />
      Webシステムの世界もまた、全く同じです。<br />
      <br />
      従来のWordPressに代表されるモノリス（一枚岩）なアーキテクチャは<br />アクセスのたびに<br />データベースを構築し直し、不要なレンダリング処理という「ノイズ」を発生させてきました。<br />
      空音開発でのWebサイト構築は、フロントエンドとバックエンドを完全に分離する<br />「Headless CMS」を採用しています。<br />
      <br />
      そして、ユーザーの最も近いネットワークの境界（エッジ）でコンテンツを処理・配信する<br />
      「エッジコンピューティング（Edge Computing）」を統合しています。<br />
      これにより、サーバーのオーバーヘッドを極限まで削ぎ落とし<br />ミリ秒単位の超高速表示と<br />
      改ざんが物理的に不可能な強固なセキュリティという、純粋な情報伝達を実現するのです。
    </>
  )
};

// 2. アプリ開発：ミリ秒とピクセルのアルゴリズム
const application = {
  title: "Algorithmic Precision",
  subtitle: "センチメートル級の精度を、アプリケーションの挙動へ。",
  image: "/An_abstract_visualization_of_cutting-edge_app_deve-1774174217352.png", 
  text: (
    <>
      アプリケーション開発においても、<br />
      ミリ秒単位のレスポンスとピクセルパーフェクトな精度が求められます。<br />
      <br />
      空音開発では、ReactやNext.jsといったモダンなフロントエンド技術を駆使し<br />
      状態管理から非同期処理に至るまで、研ぎ澄まされたロジックでコードを紡ぎます。<br />
      Webサイトだけではなく、例えばEQパラメータの自動添付や<br />初心者向けの音声自動編集プログラムなど、<br />
      高度なオーディオ技術の提供、またGPS測位技術を俯瞰的に見るためのアプリも有機的に統合しています。<br />
      <br />
      複雑なアルゴリズムを、息を呑むほど美しいUI（ユーザーインターフェース）の中に隠し、<br />
      ユーザーには直感的でシームレスな体験のみを提供するため、日々研究を積み重ねています。
    </>
  )
};

// 3. 結び：芸術と科学の融合
const digitalCanvas = {
  title: "Digital Canvas",
  subtitle: "コードの1行に宿る、エンジニアの魂と美学。",
  image: "/A_stunning_visualization_of_the_perfect_fusion_bet-1774174311436.png", 
  text: (
    <>
      ハンダ付けの1箇所に制作者の性格が現れる、そして<br />
      録音アーティストのバイブレーションが音にそのまま反映されるように。<br />
      <br />
      Webやアプリケーションの構築においても、コードの美しさ、アーキテクチャの選定、<br />
      そして1ピクセル単位の余白への執着に、エンジニアの美学が色濃く反映されます。<br />
      <br />
      プログラムコードとは、最新のエッジテクノロジーをキャンバスとし、芸術と科学を高次元で融合させた、<br />
      「デジタル空間における芸術作品」であると考えています。
    </>
  ),
  cta: {
    text: "Web・アプリ開発のご相談へ",
    url: "/#contact"
  }
};


// --- LP本体のコンポーネント（デザイン） ---

export default function WebPage() {
  
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
      
      {/* --- ■ 1. 導入：Webアーキテクチャの哲学 --- */}
      <section className="section-responsive" style={{ padding: '12rem 5% 10rem 5%', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
          {introduction.title}
        </h2>
        <h3 className="title-responsive" style={{ fontSize: '3rem', fontWeight: '200', letterSpacing: '0.15em', lineHeight: '1.3', margin: '0 0 4rem 0' }}>
          {introduction.subtitle}
        </h3>
        
        <div className="flex-responsive" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center' }}>
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
              alt="Pure Digital Architecture and Edge Computing"
              width={1200}
              height={800}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02)' }}
              priority 
            />
          </div>
        </div>
      </section>

      {/* --- ■ 2. 展開：アプリ開発のアルゴリズム --- */}
      <section className="section-responsive" style={{ padding: '10rem 5%', borderTop: '1px solid rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.03)', background: 'rgba(255,255,255,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            {application.title}
          </h3>
          <h4 className="title-responsive" style={{ fontSize: '2.5rem', fontWeight: '200', letterSpacing: '0.1em', margin: 0 }}>{application.subtitle}</h4>
        </div>

        <div className="flex-responsive" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center' }}>
          {/* 左側：アプリ開発画像 */}
          <div style={{ ...imageWrapperStyle, flex: 1 }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={application.image}
              alt="Application Development and Algorithmic Precision"
              width={1200}
              height={900}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block', filter: 'contrast(0.95) brightness(1.02)' }}
            />
          </div>
          {/* 右側：アプリ開発哲学文 */}
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2.4', letterSpacing: '0.05em', textAlign: 'justify' }}>
              {application.text}
            </p>
          </div>
        </div>
      </section>

      {/* --- ■ 3. 結び：芸術と科学の融合 --- */}
      <section className="section-responsive" style={{ padding: '10rem 5%', backgroundColor: '#fafafa' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            {digitalCanvas.title}
          </h3>
          <h4 className="title-responsive" style={{ fontSize: '2.5rem', fontWeight: '200', letterSpacing: '0.1em', margin: 0 }}>{digitalCanvas.subtitle}</h4>
        </div>

        <div className="flex-responsive" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '5rem', alignItems: 'center' }}>
          {/* 左側：芸術と科学の融合画像 */}
          <div style={{ ...imageWrapperStyle, flex: 1 }}
            onMouseOver={handleImageHover}
            onMouseOut={handleImageOut}
          >
            <Image 
              src={digitalCanvas.image}
              alt="Fusion of Art and Science in Web Technology"
              width={1200}
              height={1000}
              unoptimized={true}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          {/* 右側：結びの哲学文とCTAボタン */}
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: '200', letterSpacing: '0.1em', lineHeight: '2.2', margin: '0 0 4rem 0', textAlign: 'justify' }}>
              {digitalCanvas.text}
            </p>
            
            <div style={{ textAlign: 'center', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              <Link 
                href={digitalCanvas.cta.url} 
                style={glassButtonStyle}
                onMouseOver={handleLinkHover}
                onMouseOut={handleLinkOut}
              >
                {digitalCanvas.cta.text}
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}