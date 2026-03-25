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

  const initialLat = "37.500000"; 
  const initialLng = "138.500000";
  const initialZoom = 5;

  // ステート管理
  const [lat, setLat] = useState<string>(initialLat);
  const [lng, setLng] = useState<string>(initialLng);
  const [cursorLat, setCursorLat] = useState<string>("0.000000");
  const [cursorLng, setCursorLng] = useState<string>("0.000000");
  const [format, setFormat] = useState<'decimal' | 'dms'>('decimal');
  
  const [latCopySuccess, setLatCopySuccess] = useState(false);
  const [lngCopySuccess, setLngCopySuccess] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', 
      center: [parseFloat(initialLng), parseFloat(initialLat)],
      zoom: initialZoom,
      doubleClickZoom: false 
    });

    // 🇯Ｐ 新機能: 地図のスタイルが読み込まれたら、言語を「日本語」に強制設定する
    map.current.on('style.load', () => {
      map.current?.setLanguage('ja');
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const el = document.createElement('div');
    el.innerHTML = '<span style="color: #ef4444; font-size: 2rem;">+</span>';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';

    marker.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([parseFloat(lng), parseFloat(lat)])
      .addTo(map.current);

    map.current.on('click', (e) => {
      const newLng = e.lngLat.lng;
      const newLat = e.lngLat.lat;
      setLng(newLng.toFixed(6));
      setLat(newLat.toFixed(6));
      marker.current?.setLngLat([newLng, newLat]);
    });

    map.current.on('dblclick', (e) => {
      map.current?.flyTo({ center: [e.lngLat.lng, e.lngLat.lat], duration: 800 });
    });

    map.current.on('mousemove', (e) => {
      setCursorLng(e.lngLat.lng.toFixed(6));
      setCursorLat(e.lngLat.lat.toFixed(6));
    });

    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, []);

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

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MY_MAPBOX_TOKEN}&language=ja`);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [newLng, newLat] = data.features[0].center;

        setLng(newLng.toFixed(6));
        setLat(newLat.toFixed(6));

        if (map.current && marker.current) {
          map.current.flyTo({ center: [newLng, newLat], zoom: 15, duration: 1500 });
          marker.current.setLngLat([newLng, newLat]);
        }
      } else {
        alert("該当する場所が見つかりませんでした。番地を省くか、別のキーワードでお試しください。");
      }
    } catch (error) {
      console.error("Geocoding Error:", error);
      alert("検索中にエラーが発生しました。");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = async (textToCopy: string, setSuccess: React.Dispatch<React.SetStateAction<boolean>>) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 1500); 
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('コピーに失敗しました。');
    }
  };

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
          
          <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', pointerEvents: 'none' }}>
            カーソル: 緯度 <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{displayCursorLat}</span> / 経度 <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{displayCursorLng}</span>
          </div>
        </div>

        {/* 右側: コントロールパネル */}
        <div style={{ width: '380px', backgroundColor: '#fff', borderLeft: '1px solid #eaeaea', padding: '1.5rem', overflowY: 'auto' }}>
          
          {/* 🌍 住所検索フォーム */}
          <form onSubmit={handleAddressSearch} style={{ marginBottom: '1.5rem', backgroundColor: '#f0f9ff', padding: '1.2rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: '#0369a1' }}>🔍 住所・地名検索</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="例: 帯広市 自由が丘 (※町名まで) / 東京駅" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '0.6rem', border: '1px solid #7dd3fc', borderRadius: '4px', fontSize: '0.9rem', outline: 'none' }}
              />
              <button 
                type="submit" 
                disabled={isSearching}
                style={{ padding: '0 1rem', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: isSearching ? 'wait' : 'pointer', opacity: isSearching ? 0.7 : 1 }}
              >
                {isSearching ? '検索中...' : '検索'}
              </button>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', color: '#0284c7', opacity: 0.85, lineHeight: '1.4' }}>
              ※番地を含めず「市町村・町名」や「施設名」を入力すると精度が上がります。
            </p>
          </form>

          {/* 座標入力フォーム */}
          <form onSubmit={handleMoveToCoordinates} style={{ marginBottom: '2rem', backgroundColor: '#f8fafc', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#334155' }}>📍 赤の十字 (マーカー位置)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>緯度 (Latitude)</label>
                <button 
                  type="button" 
                  onClick={() => handleCopy(lat, setLatCopySuccess)}
                  style={{
                    position: 'absolute', top: '1.1rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '2px', color: latCopySuccess ? '#10b981' : '#94a3b8', transition: 'color 0.2s', zIndex: 1
                  }}
                  title="クリップボードにコピー"
                >
                  {latCopySuccess ? '✅' : '📋'}
                </button>
                <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: '100%', padding: '0.5rem 2.2rem 0.5rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: 'monospace', marginTop: '0.3rem', fontSize: '0.9rem' }} />
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>経度 (Longitude)</label>
                <button 
                  type="button" 
                  onClick={() => handleCopy(lng, setLngCopySuccess)}
                  style={{
                    position: 'absolute', top: '1.1rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '2px', color: lngCopySuccess ? '#10b981' : '#94a3b8', transition: 'color 0.2s', zIndex: 1
                  }}
                  title="クリップボードにコピー"
                >
                  {lngCopySuccess ? '✅' : '📋'}
                </button>
                <input type="text" value={lng} onChange={(e) => setLng(e.target.value)} style={{ width: '100%', padding: '0.5rem 2.2rem 0.5rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: 'monospace', marginTop: '0.3rem', fontSize: '0.9rem' }} />
              </div>
              
              <button type="submit" style={{ padding: '0.6rem', backgroundColor: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                座標から移動
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

          {/* 使い方ガイド */}
          <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.6', padding: '0 0.5rem' }}>
            <h3 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', color: '#334155' }}>📖 使い方</h3>
            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
              <li><strong>住所検索:</strong> 町名や施設名から大まかな座標を特定します。</li>
              <li><strong>シングルクリック:</strong> 赤十字 (マーカー) の移動と座標取得。</li>
              <li><strong>ダブルクリック:</strong> 中心位置の移動 (ズーム)。</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}