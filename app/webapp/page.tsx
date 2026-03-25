"use client";
import React from 'react';
import Link from 'next/link';

const PUBLIC_APPS = [
  { title: "2D Plotter (GPS)", desc: "平面的な位置情報の可視化・分析", link: "/gps-plot", icon: "📍" },
  { title: "Z-Axis Profiler (GPS)", desc: "標高データを含む3次元プロファイル", link: "/gps-elevation", icon: "⛰️" },
  { title: "Heatmap Analyzer (GPS)", desc: "移動密度の熱分布解析", link: "/gps-heatmap", icon: "🔥" },
];

const PARTNER_APPS = [
  { title: "タクティカル・レーダー V5", desc: "キャットワン様専用：AI捜索予測・レポート生成", link: "/radar", icon: "📡" },
];

export default function WebAppPortal() {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#1e293b', fontFamily: 'sans-serif', padding: '2rem' }}>
      
      {/* ヘッダーセクション：明るく開放的なデザイン */}
      <header style={{ textAlign: 'center', marginBottom: '4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', letterSpacing: '0.2em', color: '#0f172a', fontWeight: '700' }}>KUON R&D WEB APPS</h1>
        <p style={{ color: '#64748b', marginTop: '1rem', fontSize: '1.1rem' }}>High-End Acoustic & Geolocation Solutions</p>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* 1. 先頭：Pure Normalize (最上位ツール) */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ color: '#475569', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>AUDIO ENGINE</h2>
          <Link href="/normalize" style={{ textDecoration: 'none' }}>
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.3s ease', cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.borderColor = '#3b82f6'; 
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.borderColor = '#e2e8f0'; 
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Limited Access</span>
                <h3 style={{ fontSize: '2rem', margin: '0.5rem 0', color: '#0f172a' }}>Pure Normalize</h3>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>デジタル処理の限界を超えた、純粋な音圧補正エンジン。</p>
              </div>
              <span style={{ fontSize: '3.5rem' }}>🎙️</span>
            </div>
          </Link>
          <p style={{ textAlign: 'right', marginTop: '0.8rem' }}>
            <a href="https://kotarohattori.com" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none', borderBottom: '1px solid #e2e8f0' }}>
              マイクロフォンのご購入はこちら ↗
            </a>
          </p>
        </section>

        {/* 2. 提供企業様専用：タクティカル・レーダー */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ color: '#475569', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>EXCLUSIVE FOR PARTNERS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
            {PARTNER_APPS.map((app) => (
              <Link href={app.link} key={app.link} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  backgroundColor: '#ecfdf5', padding: '1.8rem', borderRadius: '12px', border: '1px solid #d1fae5',
                  display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d1fae5'; e.currentTarget.style.borderColor = '#10b981'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ecfdf5'; e.currentTarget.style.borderColor = '#d1fae5'; }}
                >
                  <span style={{ fontSize: '2.2rem' }}>{app.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, color: '#065f46', fontSize: '1.2rem' }}>{app.title}</h3>
                    <p style={{ margin: '0.3rem 0 0', color: '#047857', fontSize: '0.95rem' }}>{app.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. 一般公開：GPS解析ツール */}
        <section>
          <h2 style={{ color: '#475569', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>PUBLIC ANALYSIS TOOLS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {PUBLIC_APPS.map((app) => (
              <Link href={app.link} key={app.link} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  backgroundColor: '#ffffff', padding: '1.8rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                  height: '100%', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                >
                  <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '1.2rem' }}>{app.icon}</span>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>{app.title}</h3>
                  <p style={{ margin: '0.6rem 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>{app.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <footer style={{ marginTop: '8rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', paddingBottom: '4rem' }}>
        &copy; 2026 KUON R&D / TIME MACHINE RECORDS. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}