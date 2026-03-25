"use client";
import React from 'react';
import Link from 'next/link';

// アプリの定義データ
const PUBLIC_APPS = [
  { title: "2D Plotter (GPS)", desc: "平面的な位置情報の可視化・分析", link: "/gps-plot", icon: "📍" },
  { title: "Z-Axis Profiler (GPS)", desc: "標高データを含む3次元プロファイル", link: "/gps-elevation", icon: "⛰️" },
  { title: "Heatmap Analyzer (GPS)", desc: "移動密度の熱分布解析", link: "/gps-heatmap", icon: "🔥" },
];

const PARTNER_APPS = [
  { title: "タクティカル・レーダー V5", desc: "提携様専用：AI捜索予測・レポート生成", link: "/radar", icon: "📡" },
];

export default function WebAppPortal() {
  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'monospace', padding: '2rem' }}>
      
      {/* ヘッダーセクション */}
      <header style={{ textAlign: 'center', marginBottom: '4rem', borderBottom: '1px solid #1e293b', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', letterSpacing: '0.3em', color: '#38bdf8' }}>KUON R&D WEB APPS</h1>
        <p style={{ color: '#64748b', marginTop: '1rem' }}>High-End Acoustic & Geolocation Solutions</p>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* 1. 先頭：自動ノーマライズ（ヘッドライン） */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '1.5rem', borderLeft: '4px solid #f59e0b', paddingLeft: '1rem' }}>HEADLINE AUDIO TOOL</h2>
          <Link href="/normalize" style={{ textDecoration: 'none' }}>
            <div style={{ 
              background: 'linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%)', 
              padding: '2rem', borderRadius: '12px', border: '1px solid #312e81',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#312e81'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 'bold' }}>Microphone Owners Only</span>
                <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: '#fff' }}>Pure Normalize</h3>
                <p style={{ color: '#94a3b8' }}>デジタル処理の限界を超えた、純粋な音圧補正エンジン。</p>
              </div>
              <span style={{ fontSize: '3rem' }}>🎙️</span>
            </div>
          </Link>
          <p style={{ textAlign: 'right', marginTop: '0.5rem' }}>
            <a href="https://kotarohattori.com" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', fontSize: '0.8rem' }}>
              マイクロフォンのご購入はこちら ↗
            </a>
          </p>
        </section>

        {/* 2. 新設：提供企業様専用アプリ */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '1.5rem', borderLeft: '4px solid #10b981', paddingLeft: '1rem' }}>EXCLUSIVE FOR PARTNERS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {PARTNER_APPS.map((app) => (
              <Link href={app.link} key={app.link} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  backgroundColor: '#064e3b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #065f46',
                  display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#065f46'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#064e3b'}
                >
                  <span style={{ fontSize: '2rem' }}>{app.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, color: '#34d399' }}>{app.title}</h3>
                    <p style={{ margin: '0.3rem 0 0', color: '#a7f3d0', fontSize: '0.9rem' }}>{app.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. 一般公開：GPS解析ツール */}
        <section>
          <h2 style={{ color: '#e2e8f0', fontSize: '1.2rem', marginBottom: '1.5rem', borderLeft: '4px solid #38bdf8', paddingLeft: '1rem' }}>PUBLIC ANALYSIS TOOLS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {PUBLIC_APPS.map((app) => (
              <Link href={app.link} key={app.link} style={{ textDecoration: 'none' }}>
                <div style={{ 
                  backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1e293b',
                  height: '100%', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.backgroundColor = '#1e293b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.backgroundColor = '#0f172a'; }}
                >
                  <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '1rem' }}>{app.icon}</span>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{app.title}</h3>
                  <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.4' }}>{app.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <footer style={{ marginTop: '6rem', textAlign: 'center', color: '#334155', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
        &copy; 2026 KUON R&D / TIME MACHINE RECORDS. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}