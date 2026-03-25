"use client";
import React from 'react';
import Link from 'next/link';

export default function RtkBasePage() {
  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', color: '#1a1a1a', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      
      {/* --- ヘッダーセクション --- */}
      <header style={{ padding: '8rem 5% 5rem', textAlign: 'center', backgroundColor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <h1 style={{ 
          fontFamily: '"Shippori Mincho", "Noto Serif JP", serif', 
          fontSize: 'clamp(2rem, 4vw, 3rem)', 
          fontWeight: '300', 
          letterSpacing: '0.2em', 
          color: '#111',
          marginBottom: '1rem' 
        }}>
          RTK Base Station
        </h1>
        <p style={{ color: 'var(--accent, #bda678)', fontSize: '1rem', letterSpacing: '0.15em', marginBottom: '2rem' }}>
          善意の基地局（運用準備中・過去データ参照）
        </p>
        <p style={{ maxWidth: '700px', margin: '0 auto', color: '#666', lineHeight: '2', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
          センチメートル級の精密なRTK測位を実現するため、NTRIP方式による補正データの配信を行っています。現在は過去の足寄町での運用データをベースにしたテストページです。
        </p>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '5rem 5%' }}>
        
        {/* --- 基地局スペック表 --- */}
        <section style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontFamily: '"Shippori Mincho", "Noto Serif JP", serif', fontSize: '1.5rem', fontWeight: '300', letterSpacing: '0.1em', borderBottom: '1px solid var(--accent, #bda678)', paddingBottom: '0.8rem', marginBottom: '2.5rem', color: '#111' }}>
            Station Specifications
          </h2>
          
          <div style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              
              {/* 基本情報 */}
              <div style={{ padding: '2.5rem', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Basic Information</h3>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem 0', fontSize: '0.95rem' }}>
                  <dt style={{ color: '#888' }}>都市名</dt><dd style={{ color: '#222', margin: 0, fontWeight: '500' }}>北海道足寄郡足寄町</dd>
                  <dt style={{ color: '#888' }}>局名</dt><dd style={{ color: '#222', margin: 0, fontWeight: '500' }}>ashoro001</dd>
                  <dt style={{ color: '#888' }}>北緯 (Lat)</dt><dd style={{ color: '#222', margin: 0, fontFamily: 'monospace', fontSize: '1rem' }}>43.23666</dd>
                  <dt style={{ color: '#888' }}>東経 (Lng)</dt><dd style={{ color: '#222', margin: 0, fontFamily: 'monospace', fontSize: '1rem' }}>143.55080371</dd>
                </dl>
              </div>

              {/* 接続情報 */}
              <div style={{ padding: '2.5rem' }}>
                <h3 style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Connection Details</h3>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem 0', fontSize: '0.95rem' }}>
                  <dt style={{ color: '#888' }}>サーバアドレス</dt><dd style={{ color: '#222', margin: 0 }}>geortk.jp</dd>
                  <dt style={{ color: '#888' }}>ポート番号</dt><dd style={{ color: '#222', margin: 0 }}>2101</dd>
                  <dt style={{ color: '#888' }}>データ形式</dt><dd style={{ color: '#222', margin: 0 }}>RTCM3 (1005発信確認)</dd>
                  <dt style={{ color: '#888' }}>接続方法</dt><dd style={{ color: '#222', margin: 0 }}>NTRIP (Caster経由)</dd>
                  <dt style={{ color: '#888' }}>Mount Point</dt><dd style={{ color: '#222', margin: 0, fontWeight: 'bold' }}>ashoro001</dd>
                  <dt style={{ color: '#888' }}>ID / Password</dt><dd style={{ color: '#222', margin: 0 }}>なし</dd>
                </dl>
              </div>

              {/* 機材情報 */}
              <div style={{ padding: '2.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Hardware & System</h3>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem 0', fontSize: '0.95rem' }}>
                  <dt style={{ color: '#888' }}>受信機</dt><dd style={{ color: '#222', margin: 0 }}>u-blox ZED-F9P</dd>
                  <dt style={{ color: '#888' }}>アンテナ</dt><dd style={{ color: '#222', margin: 0 }}>JCA228B</dd>
                  <dt style={{ color: '#888' }}>運用メモ</dt><dd style={{ color: '#222', margin: 0 }}>ジオセンス / ファームウェア: 1.0.56</dd>
                </dl>
              </div>

            </div>
          </div>
        </section>

        {/* --- INI設定コードブロック --- */}
        <section style={{ marginBottom: '6rem' }}>
          <h2 style={{ fontFamily: '"Shippori Mincho", "Noto Serif JP", serif', fontSize: '1.5rem', fontWeight: '300', letterSpacing: '0.1em', borderBottom: '1px solid var(--accent, #bda678)', paddingBottom: '0.8rem', marginBottom: '2.5rem', color: '#111' }}>
            Configuration (INI)
          </h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            各種RTKクライアントソフトウェアのINIファイルには、以下の接続設定を追記してください。
          </p>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '2rem', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: '1.8', overflowX: 'auto' }}>
            <span style={{ color: '#94a3b8' }}># 基地局の名前</span><br />
            <span style={{ color: '#38bdf8' }}>[receiver]</span><br />
            name = ashoro001<br />
            <br />
            <span style={{ color: '#94a3b8' }}># INIファイルへの接続設定</span><br />
            <span style={{ color: '#38bdf8' }}>[caster]</span><br />
            address = www.geortk.jp<br />
            mount = ashoro001
          </div>
        </section>

        {/* --- Geocode Viewer (お師匠様のツール) へのリンク --- */}
        <section>
           <h2 style={{ fontFamily: '"Shippori Mincho", "Noto Serif JP", serif', fontSize: '1.5rem', fontWeight: '300', letterSpacing: '0.1em', borderBottom: '1px solid var(--accent, #bda678)', paddingBottom: '0.8rem', marginBottom: '2.5rem', color: '#111' }}>
            External Tools
          </h2>
          
          <a href="https://www.geosense.co.jp/map/tool/geoconverter.php" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ 
              backgroundColor: '#fff', 
              border: '1px solid rgba(0,0,0,0.08)', 
              borderRadius: '8px', 
              padding: '2.5rem', 
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent, #bda678)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(189, 166, 120, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div>
                <span style={{ display: 'inline-block', fontSize: '0.7rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.8rem', borderBottom: '1px solid #ddd', paddingBottom: '0.3rem' }}>
                  株式会社ジオセンス 提供
                </span>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#111', fontSize: '1.4rem', fontWeight: '500' }}>Geocode Viewer / Converter</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  座標変換や緯度経度のマッピングを行うための、強力で精密なWebツールです。
                </p>
              </div>
              <div style={{ color: 'var(--accent, #bda678)', fontSize: '1.5rem' }}>
                ↗
              </div>
            </div>
          </a>
        </section>

      </main>
      
      {/* 戻るボタン */}
      <div style={{ textAlign: 'center', paddingBottom: '5rem' }}>
        <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '0.1em', borderBottom: '1px solid #ddd', paddingBottom: '0.3rem', transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#111'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
        >
          ← トップページへ戻る
        </Link>
      </div>
    </div>
  );
}