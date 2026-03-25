"use client";
import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Link from 'next/link';

// 🚨 ご自身のMapbox APIキーを指定してください
const MY_MAPBOX_TOKEN = "pk.eyJ1Ijoia290YXJvYXNhaGluYSIsImEiOiJjbW41Nnp2YXEwODZiMnJzNDhzbThyc2lhIn0.jCJovLADR9sMKYPlSoKgRg"; 
mapboxgl.accessToken = MY_MAPBOX_TOKEN;

export default function GeocodeViewer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // 🌍 修正点1: 初期表示を全日本に設定 (新潟県付近を中心に、ズーム5)
  const initialLat = "37.500000"; 
  const initialLng = "138.500000";
  const initialZoom = 5;

  // ステート管理: 座標情報
  const [lat, setLat] = useState<string>(initialLat);
  const [lng, setLng] = useState<string>(initialLng);
  const [cursorLat, setCursorLat] = useState<string>("0.000000");
  const [cursorLng, setCursorLng] = useState<string>("0.000000");
  const [format, setFormat] = useState<'decimal' | 'dms'>('decimal'); // 度(10進数)か度分秒か

  // 📋 修正点2: コピー成功時のフィードバック用ステート
  const [latCopySuccess, setLatCopySuccess] = useState(false);
  const [lngCopySuccess, setLngCopySuccess] = useState(false);

  // 度分秒 (DMS) への変換関数
  const toDMS = (deg: number, isLat: boolean) => {
    const d = Math.floor(Math.abs(deg));
    const minFloat = (Math.abs(deg) - d) * 60;
    const m = Math.floor(minFloat);
    const s = ((minFloat - m) * 60).toFixed(2);
    const dir = isLat ? (deg >= 0 ? "N" : "S") : (deg >= 0 ? "E" : "W");
    return `${dir} ${d}° ${m}' ${s}"`;
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // 地図の初期化
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // デフォルトは見やすい白地図
      center: [parseFloat(initialLng), parseFloat(initialLat)],
      zoom: initialZoom,
      doubleClickZoom: false // ダブルクリックでのズームを無効化
    });

    // コントロールの追加
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // 初期のマーカー（赤十字風にカスタム）を作成
    const el = document.createElement('div');
    el.innerHTML = '<span style="color: #ef4444; font-size: 2rem;">+</span>';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';

    marker.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([parseFloat(lng), parseFloat(lat)])
      .addTo(map.current);

    // 【機能1】シングルクリック: マーカーの移動と座標取得
    map.current.on('click', (e) => {
      const newLng = e.lngLat.lng;
      const newLat = e.lngLat.lat;
      setLng(newLng.toFixed(6));
      setLat(newLat.toFixed(6));
      marker.current?.setLngLat([newLng, newLat]);
    });

    // 【機能2】ダブルクリック: 中心位置の移動
    map.current.on('dblclick', (e) => {
      map.current?.flyTo({ center: [e.lngLat.lng, e.lngLat.lat], duration: 800 });
    });

    // 【機能3】マウスカーソルの座標をリアルタイム表示
    map.current.on('mousemove', (e) => {
      setCursorLng(e.lngLat.lng.toFixed(6));
      setCursorLat(e.lngLat.lat.toFixed(6));
    });

    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, [lat, lng]);

  // 【機能4】入力された座標へ移動（表示ボタン）
  const handleMoveToCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    
    if (!isNaN(parsedLat) && !isNaN(parsedLng) && map.current && marker.current) {
      map.current.flyTo({ center: [parsedLng, parsedLat], zoom: 14, duration: 1000 });
      marker.current.setLngLat([parsedLng, parsedLat]);
    } else {
      alert("正しい数値を入力してください。");
    }
  };

  // 📋 修正点2: クリップボードへのコピー関数
  const handleCopy = async (textToCopy: string, setSuccess: React.Dispatch<React.SetStateAction<boolean>>) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500); // 1.5秒後に元に戻す
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('コピーに失敗しました。');
    }
  };

  // 表示形式に応じた座標のレンダリング
  const displayCursorLat = format === 'decimal' ? cursorLat : toDMS(parseFloat(cursorLat), true);
  const displayCursorLng = format === 'decimal' ? cursorLng : toDMS(parseFloat(cursorLng), false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa', fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#333' }}>
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css" rel="stylesheet" />

      {/* ヘッダー */}
      <header style={{ padding: '1rem 2rem', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '500', letterSpacing: '0.05em' }}>Geocode Viewer</h1>
          <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.7rem', color: '#888' }}>Kuon R&D Edition</p>
        </div>
        <Link href="/" style={{ fontSize: '0.8rem', color: '#0284c7', textDecoration: 'none', fontWeight: 'bold' }}>← トップページへ戻る</Link>
      </header>

      {/* メインレイアウト (左右分割) */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* 左側: 地図エリア */}
        <div style={{ flex: '1', position: 'relative' }}>
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
          
          {/* カーソル座標表示 (地図上にフロート) */}
          <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', pointerEvents: 'none' }}>
            カーソル: 緯度 <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{displayCursorLat}</span> / 経度 <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{displayCursorLng}</span>
          </div>
        </div>

        {/* 右側: コントロールパネル */}
        <div style={{ width: '380px', backgroundColor: '#fff', borderLeft: '1px solid #eaeaea', padding: '1.5rem', overflowY: 'auto' }}>
          
          {/* 座標入力フォーム */}
          <form onSubmit={handleMoveToCoordinates} style={{ marginBottom: '2rem', backgroundColor: '#f8fafc', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#334155' }}>📍 赤の十字 (マーカー位置)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              
              {/* 緯度入力ボックス周りの修正 */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>緯度 (Latitude)</label>
                {/* 📋 修正点2: コピーボタン */}
                <button 
                  type="button" 
                  onClick={() => handleCopy(lat, setLatCopySuccess)}
                  style={{
                    position: 'absolute',
                    top: '1.1rem', 
                    right: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '2px',
                    color: latCopySuccess ? '#10b981' : '#94a3b8', 
                    transition: 'color 0.2s',
                    zIndex: 1
                  }}
                  title="クリップボードにコピー"
                >
                  {latCopySuccess ? '✅' : '📋'}
                </button>
                <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: '100%', padding: '0.5rem 2.2rem 0.5rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: 'monospace', marginTop: '0.3rem', fontSize: '0.9rem' }} />
              </div>

              {/* 経度入力ボックス周りの修正 */}
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>経度 (Longitude)</label>
                {/* 📋 修正点2: コピーボタン */}
                <button 
                  type="button" 
                  onClick={() => handleCopy(lng, setLngCopySuccess)}
                  style={{
                    position: 'absolute',
                    top: '1.1rem', 
                    right: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '2px',
                    color: lngCopySuccess ? '#10b981' : '#94a3b8', 
                    transition: 'color 0.2s',
                    zIndex: 1
                  }}
                  title="クリップボードにコピー"
                >
                  {lngCopySuccess ? '✅' : '📋'}
                </button>
                <input type="text" value={lng} onChange={(e) => setLng(e.target.value)} style={{ width: '100%', padding: '0.5rem 2.2rem 0.5rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: 'monospace', marginTop: '0.3rem', fontSize: '0.9rem' }} />
              </div>
              
              <button type="submit" style={{ padding: '0.6rem', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                指定位置を表示
              </button>
            </div>
          </form>

          {/* 設定項目 */}
          <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#334155' }}>⚙️ 設定</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#555' }}>表示形式:</label>
              <select value={format} onChange={(e) => setFormat(e.target.value as 'decimal' | 'dms')} style={{ padding: '0.3rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.85rem', flex: 1 }}>
                <option value="decimal">度 (ddd.dddddd)</option>
                <option value="dms">度分秒 (DMS)</option>
              </select>
            </div>
          </div>

          {/* 使い方ガイド (お師匠様のツールを踏襲) */}
          <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6', padding: '0 0.5rem' }}>
            <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', color: '#334155' }}>📖 使い方</h3>
            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
              <li><strong>シングルクリック:</strong> 赤十字 (マーカー) の移動と座標取得</li>
              <li><strong>ダブルクリック:</strong> 中心位置の移動 (ズーム)</li>
              <li><strong>数値入力:</strong> 緯度経度を入力し「表示」ボタンでその位置へジャンプします。</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}