"use client";
import React from 'react';
import Link from 'next/link';

// --- アプリの定義データ ---
const AUDIO_APPS = [
  { 
    title: "Pure Normalize", 
    desc: "デジタル処理の限界を超えた、純粋な音圧補正エンジン。", 
    link: "/normalize", 
    icon: "🎙️", 
    limited: true
  }
];

const GPS_APPS = [
  { title: "2D Plotter", desc: "平面的な位置情報の可視化・分析", link: "/gps-plot", icon: "📍" },
  { title: "Z-Axis Profiler", desc: "標高データを含む3次元プロファイル", link: "/gps-elevation", icon: "⛰️" },
  { title: "Heatmap Analyzer", desc: "移動密度的熱分布解析", link: "/gps-heatmap", icon: "🔥" },
];

const PARTNER_APPS = [
  { title: "タクティカル・レーダー V5", desc: "キャットワン様専用：AI捜索予測・レポート生成", link: "/radar", icon: "📡" },
];

export default function WebAppPortal() {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#1e293b', fontFamily: 'monospace', padding: '2rem' }}>
      
      {/* ヘッダーセクション */}
      <header style={{ textAlign: 'center', marginBottom: '4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', letterSpacing: '0.2em', color: '#0f172a', fontWeight: '700' }}>KUON R&D WEB APPS</h1>
        <p style={{ color: '#64748b', marginTop: '1rem', fontSize: '1.1rem', fontFamily: 'sans-serif' }}>High-End Acoustic & Geolocation Solutions</p>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* --- セクションA: AUDIO DIVISION --- */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ color: '#475569', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '0.1em', borderLeft: '4px solid #f59e0b', paddingLeft: '1rem' }}>AUDIO DIVISION</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', paddingLeft: '1.25rem', fontFamily: 'sans-serif' }}>音圧補正から高度な信号処理まで、妥協のないオーディオ体験を追求。</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {AUDIO_APPS.map((app) => (
              <Link href={app.link} key={app.link} style={{textDecoration: 'none'}} className="group">
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                  height: '100%', transition: 'border-color 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: 'none' // ドロップシャドウを削除
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem'}}>
                      <h3 style={{ fontSize: '1.5rem', margin: 0, color: '#0f172a' }}>{app.title}</h3>
                      {app.limited && (
                        <span style={{ fontSize: '0.7rem', color: '#f59e0b', backgroundColor: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Limited Access</span>
                      )}
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontFamily: 'sans-serif', lineHeight: '1.4' }}>{app.desc}</p>
                  </div>
                  <span style={{ fontSize: '3rem' }}>{app.icon}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* 🎙️ マイク購入CTA：目立ちすぎない、美しく洗練されたテキストリンクとして復元 */}
          <p style={{ textAlign: 'right', marginTop: '0.8rem', paddingRight: '0.5rem' }}>
            <a href="https://kotarohattori.com" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none', borderBottom: '1px solid #e2e8f0', fontFamily: 'sans-serif' }}>
              マイクロフォンのご購入はこちら ↗
            </a>
          </p>
        </section>

        {/* --- セクションB: GPS DIVISION --- */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ color: '#475569', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '0.1em', borderLeft: '4px solid #38bdf8', paddingLeft: '1rem' }}>GPS DIVISION</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', paddingLeft: '1.25rem', fontFamily: 'sans-serif' }}>高度なGeolocationソリューション。移動の軌跡を、価値あるデータへ。</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {GPS_APPS.map((app) => (
              <Link href={app.link} key={app.link} style={{textDecoration: 'none'}} className="group">
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                  height: '100%', transition: 'border-color 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: 'none' // ドロップシャドウを削除
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div>
                    <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem' }}>{app.title}</h3>
                    <p style={{ margin: '0.4rem 0 0', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.4', fontFamily: 'sans-serif' }}>{app.desc}</p>
                  </div>
                  <span style={{ fontSize: '2rem' }}>{app.icon}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- セクションC: PARTNER EXCLUSIVE SOLUTIONS --- */}
        <section>
          <h2 style={{ color: '#475569', fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', letterSpacing: '0.1em', borderLeft: '4px solid #10b981', paddingLeft: '1rem' }}>PARTNER EXCLUSIVE SOLUTIONS</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', paddingLeft: '1.25rem', fontFamily: 'sans-serif' }}>特定のビジネスニーズに応える、オーダーメイドのアプリケーション。</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {PARTNER_APPS.map((app) => (
              <Link href={app.link} key={app.link} style={{textDecoration: 'none'}} className="group">
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                  height: '100%', transition: 'border-color 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: 'none' // ドロップシャドウを削除
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.5rem', margin: 0, color: '#0f172a' }}>{app.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.4rem 0 0', fontFamily: 'sans-serif', lineHeight: '1.4' }}>{app.desc}</p>
                  </div>
                  <span style={{ fontSize: '2.5rem' }}>{app.icon}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* フッター */}
      <footer style={{ marginTop: '8rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', paddingBottom: '4rem', fontFamily: 'monospace' }}>
        &copy; 2026 KUON R&D / TIME MACHINE RECORDS. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}