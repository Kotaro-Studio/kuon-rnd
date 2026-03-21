"use client"; // 👈 これを一番上に追加します！

// app/page.tsx
import React from 'react';

// --- 1. LP本体のデータ定義（内容を変える場合はここを編集） ---

// 【ヒーローセクション】
const heroContent = {
  title1: "芸術と科学",
  title2: "の境界線を越える",
  description: "金田式DC録音の圧倒的リアリズムと、Next.js/Cloudflareのエッジテクノロジーが融合。音響工学・Web・GPSアルゴリズムが描く、未来の研究開発スタジオ。",
  cta: "Vision & Technology"
};

// 【3Dグラスカード（フィーチャー）】
const featureCards = [
  {
    icon: "🎙️", 
    title: "Audio Engineering", 
    description: "金田式DC録音による究極のアナログサウンド。位相とダイナミクスを完全に保持し、空気感までをも記録する。",
    tag: "純粋アナログ"
  },
  {
    icon: "⚡", 
    title: "Web Technology", 
    description: "Next.jsとCloudflareによる世界最速の配信インフラ。1msのエッジ応答速度が、シームレスな体験を実現。",
    tag: "超高速エッジ"
  },
  {
    icon: "📡", 
    title: "GPS Algorithm", 
    description: "高精度な位置情報と時刻同期を統合する独自アルゴリズム。芸術と科学、空間と時間の交差点を解析する。",
    tag: "時空解析"
  }
];

// 【ビジョン（アバウト）】
const visionContent = {
  quote: "「技術」は「芸術」の僕であり、",
  quoteEnd: "「芸術」は「技術」の魂である。",
  text: "空音開発は、単なるWeb制作スタジオではありません。オーディオフィルの執念、最先端の分散システム、そしてGPS演算技術までを一つの有機体として統合する、異端の研究開発スタジオです。私たちは、技術が芸術の高みへ到達する瞬間を創造します。"
};


// --- 2. LP本体のコンポーネント（デザイン） ---

export default function Home() {
  return (
    // サイト全体のコンテナ（layout.tsxのmainの中に入ります）
    <div style={{ padding: '0 5%' }}>
      
      {/* --- ■ ヒーローセクション（ファーストビュー） --- */}
      <section style={{ 
        padding: '12rem 0 8rem 0', 
        textAlign: 'center' 
      }}>
        {/* メインタイトル：極限まで洗練されたタイポグラフィ */}
        <h2 style={{ 
          fontSize: '4.5rem', 
          fontWeight: '100', 
          letterSpacing: '0.2em', 
          lineHeight: '1.2', 
          margin: '0 0 2rem 0'
        }}>
          <span style={{ display: 'block' }}>{heroContent.title1}</span>
          <span style={{ display: 'block', paddingLeft: '2em' }}>{heroContent.title2}</span>
        </h2>
        {/* 説明文：読みやすい上品なグレー */}
        <p style={{ 
          maxWidth: '800px', 
          margin: '0 auto 3rem auto', 
          color: 'var(--text-muted)', 
          fontSize: '1rem', 
          lineHeight: '2', 
          letterSpacing: '0.05em'
        }}>
          {heroContent.description}
        </p>
        {/* CTAボタン：背景に溶け込むようなデザイン */}
        <button style={{ 
          background: 'none', 
          border: '1px solid rgba(255,255,255,0.1)', 
          color: 'var(--text-main)', 
          padding: '1rem 2.5rem', 
          borderRadius: '50px', 
          fontSize: '0.8rem', 
          letterSpacing: '0.1em', 
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        // マウスホバーでアクセントカラーに光る
        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-main)'; }}
        >
          {heroContent.cta}
        </button>
      </section>

      {/* --- ■ 3Dグラスモーフィズム・フィーチャーセクション（核心部分） --- */}
      {/* ★globals.css で定義した「perspective-container」を親要素に指定
        ★これで子供のカードが3D空間として配置される
      */}
      <section className="perspective-container" style={{ 
        padding: '6rem 0', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '2.5rem'
      }}>
        {featureCards.map((card, index) => (
          /* ★globals.css で定義した「glass-card」を指定
            ★すりガラス＋ホバー時の3D傾き効果がここですべて適用される
          */
          <div key={index} className="glass-card" style={{ 
            padding: '3rem', 
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* ホバー時に光る背景グラデーション（未来感を演出） */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.1) 0%, rgba(6, 182, 212, 0) 70%)',
              opacity: 0.1, // 初期は薄く
              transition: 'opacity 0.5s'
            }}/>

            {/* コンテンツ */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '3rem', margin: '0 0 1.5rem 0' }}>{card.icon}</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '300', margin: '0 0 1rem 0', letterSpacing: '0.1em' }}>{card.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.8', margin: '0 0 2rem 0' }}>{card.description}</p>
              {/* アクセントカラーのタグ */}
              <span style={{ 
                fontSize: '0.7rem', 
                color: 'var(--accent)', 
                border: '1px solid var(--accent)', 
                padding: '0.4rem 1rem', 
                borderRadius: '50px'
              }}>
                {card.tag}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* --- ■ ビジョン/アバウトセクション（静謐なメッセージ） --- */}
      <section style={{ 
        padding: '10rem 0', 
        maxWidth: '700px', 
        margin: '0 auto', 
        textAlign: 'center' 
      }}>
        <h4 style={{ 
          fontSize: '1.8rem', 
          fontWeight: '100', 
          letterSpacing: '0.2em', 
          lineHeight: '1.8', 
          margin: '0 0 3rem 0',
          color: 'var(--text-main)'
        }}>
          {visionContent.quote}<br />
          <span style={{ color: 'var(--accent)' }}>{visionContent.quoteEnd}</span>
        </h4>
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.95rem', 
          lineHeight: '2', 
          letterSpacing: '0.05em'
        }}>
          {visionContent.text}
        </p>
      </section>

    </div>
  );
}