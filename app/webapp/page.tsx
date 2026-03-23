"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ============================================================================
// ★ ここでTypeScriptに「データの形（設計図）」を教え、赤文字のパニックを鎮めます
// ============================================================================
type AppLink = {
  href: string;
  text: string;
  type: 'primary' | 'secondary';
  external?: boolean; // 「?」をつけることで、「この項目は無いこともあるよ」と教えます
};

type WebApp = {
  image: string;
  tag: string;
  title: string;
  description: string;
  note?: string;
  links: AppLink[];
};

export default function WebAppPage() {
  const accentColor = "var(--accent)";
  const textMain = "var(--text-main)";
  const textMuted = "var(--text-muted)";

  // アプリケーションデータの定義（先ほど教えた設計図を適用）
  const webApps: WebApp[] = [
    // --- 【オーディオ・エンジニアリング部門】 ---
    {
      image: "/mic02.jpeg", 
      tag: "Audio Engineering",
      title: "Pure Normalize",
      description: "朝比奈シグネチャーEQ、位相反転、そして究極の「32bit Float WAV」出力に対応。音の強弱（ダイナミクス）を数学的に最適化する、劣化ゼロのエッジ・オーディオプロセッサー。",
      note: "※ Kotaro Studio マイクロフォン購入者限定",
      links: [
        { href: "/normalize", text: "アプリを開く", type: "primary" },
        { href: "https://kotarohattori.com", text: "マイクロフォンを購入", type: "secondary", external: true },
      ]
    },
    // --- 【GNSS / GPS・時空解析部門】 ---
    {
      image: "/gps.png", 
      tag: "GNSS / GPS Analysis",
      title: "RTK Tools",
      description: "NMEAログから2D軌跡、Z軸（標高）のミリ単位断面図、そしてペット探偵向けの滞在時間ヒートマップを一瞬で生成。RTK測位の圧倒的な解像度を可視化するエッジ解析ツール群。",
      links: [
        { href: "/gps-plot", text: "2D Plotter", type: "primary" },
        { href: "/gps-elevation", text: "Z-Axis Profiler", type: "primary" },
        { href: "/gps-heatmap", text: "Heatmap Analyzer", type: "primary" },
      ]
    }
  ];

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: 'clamp(4rem, 8vw, 6rem) 5%' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        
        <section style={{ marginBottom: 'clamp(4rem, 8vw, 6rem)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '300', color: accentColor, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Technology in Action
          </h2>
          <h3 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '200', letterSpacing: '0.1em', margin: '0 0 1rem 0', color: textMain }}>
            Web App
          </h3>
          <p style={{ maxWidth: '700px', margin: '0 auto', color: textMuted, fontSize: '1.05rem', lineHeight: '2', letterSpacing: '0.05em' }}>
            芸術と科学の境界線を、ブラウザ上で体現<br />
            すべての処理はユーザーのデバイス（エッジ）で完結、データは外部へ送信されません<br />
            空音開発が提供する超高速でセキュアなツール
          </p>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {webApps.map((app, index) => (
            <div key={index} className="glass-card" style={{ 
              display: 'flex', flexWrap: 'wrap', gap: '3rem', 
              padding: 'clamp(2rem, 4vw, 3.5rem)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)', 
              textAlign: 'left', alignItems: 'center',
              transition: 'all 0.3s ease',
              backgroundColor: 'rgba(255,255,255,0.7)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)'; }}
            >
              
              <div style={{ flex: '1 1 350px', position: 'relative', height: '320px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Image 
                  src={app.image} 
                  alt={app.title} 
                  layout="fill" 
                  objectFit="cover" 
                  unoptimized={true}
                  style={{ transition: 'transform 0.5s ease' }} 
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
              </div>

              <div style={{ flex: '1 1 450px' }}>
                <span style={{ fontSize: '0.75rem', color: accentColor, border: `1px solid ${accentColor}`, padding: '0.5rem 1.2rem', borderRadius: '50px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '500' }}>
                  {app.tag}
                </span>
                
                <h4 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: '200', margin: '1.5rem 0 1.2rem 0', letterSpacing: '0.1em', color: textMain }}>
                  {app.title}
                </h4>
                
                <p style={{ color: textMuted, fontSize: '0.95rem', lineHeight: '2', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                  {app.description}
                </p>
                
                {app.note && (
                  <p style={{ color: accentColor, fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.1em', marginBottom: '3rem', backgroundColor: 'rgba(2, 132, 199, 0.04)', display: 'inline-block', padding: '0.6rem 1.2rem', borderRadius: '4px' }}>
                    {app.note}
                  </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: app.note ? '0' : '3rem' }}>
                  {app.links.map((link, i) => (
                    <Link key={i} href={link.href} passHref
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      style={{
                        display: 'inline-block',
                        padding: '0.8rem 2.5rem',
                        borderRadius: '50px',
                        fontSize: '0.85rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        textAlign: 'center',
                        
                        ...(link.type === 'primary' ? {
                          backgroundColor: accentColor,
                          color: '#fff',
                          boxShadow: '0 5px 15px rgba(2, 132, 199, 0.2)',
                          border: '1px solid transparent',
                        } : {
                          backgroundColor: 'transparent',
                          color: accentColor,
                          border: `1px solid ${accentColor}`,
                        }),
                      }}
                      className={link.type === 'secondary' ? 'nav-button' : ''}
                      onMouseOver={(e) => {
                        if (link.type === 'primary') {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(2, 132, 199, 0.3)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (link.type === 'primary') {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 5px 15px rgba(2, 132, 199, 0.2)';
                        }
                      }}
                    >
                      {link.text} {link.external && <span style={{fontSize: '0.8em', marginLeft: '0.3rem'}}>↗</span>}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: '6rem', fontSize: '0.85rem', color: textMuted, letterSpacing: '0.05em', maxWidth: '650px', margin: '6rem auto 0 auto', lineHeight: '1.8' }}>
          ※ 各アプリケーションは、WebAssemblyやWeb Audio API等の最先端Web標準技術を用いてブラウザ内部でのみ動作します。<br />
          セキュリティ要件の高い、秘匿性の高いデータも、安心してお使いいただけます。
        </p>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}} />
      </div>
    </div>
  );
}