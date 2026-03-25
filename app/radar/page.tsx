"use client";
import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function CatOneTacticalRadarRoom() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const SECRET_PASSWORD = "1012";

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // 🗂️ タブの状態管理（search = 捜索, report = レポート）
  const [activeTab, setActiveTab] = useState<'search' | 'report'>('search');

  const [isLoading, setIsLoading] = useState(false);
  const [isIsochroneLoading, setIsIsochroneLoading] = useState(false);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  
  const [rawCoordinates, setRawCoordinates] = useState<number[][] | null>(null);
  const [matchedRoute, setMatchedRoute] = useState<any>(null);
  
  const [originPoint, setOriginPoint] = useState<number[] | null>(null);
  const [inputLat, setInputLat] = useState<string>("");
  const [inputLng, setInputLng] = useState<string>("");
  
  const [petType, setPetType] = useState<string>('cat');
  const [searchTime, setSearchTime] = useState<number>(30);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SECRET_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("アクセス権限がありません。");
      setPasswordInput("");
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !mapContainer.current) return;
    if (map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [135.5, 34.8],
      zoom: 9,
      pitch: 45
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.current.doubleClickZoom.disable();
    
    map.current.on('dblclick', (e) => {
      if (activeTab === 'search') {
        updateOriginMarker([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    map.current.on('load', () => {
      map.current?.addSource('isochrone-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current?.addLayer({ id: 'isochrone-fill', type: 'fill', source: 'isochrone-source', paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.2 } });
      map.current?.addLayer({ id: 'isochrone-outline', type: 'line', source: 'isochrone-source', paint: { 'line-color': '#ef4444', 'line-width': 2, 'line-opacity': 0.5 } });

      map.current?.addSource('raw-trace-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current?.addLayer({ id: 'raw-trace-line', type: 'line', source: 'raw-trace-source', paint: { 'line-color': '#94a3b8', 'line-width': 2, 'line-opacity': 0.4, 'line-dasharray': [2, 1] } });

      map.current?.addSource('matched-trace-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current?.addLayer({ id: 'matched-trace-line', type: 'line', source: 'matched-trace-source', paint: { 'line-color': '#38bdf8', 'line-width': 4, 'line-opacity': 0.8 } });

      map.current?.addSource('origin-point-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current?.addLayer({ id: 'origin-point-circle', type: 'circle', source: 'origin-point-source', paint: { 'circle-radius': 8, 'circle-color': '#fff', 'circle-stroke-color': '#ef4444', 'circle-stroke-width': 3 } });
    });
  }, [isAuthenticated, activeTab]);

  const updateOriginMarker = (coords: number[]) => {
    setOriginPoint(coords);
    setInputLng(coords[0].toFixed(6));
    setInputLat(coords[1].toFixed(6));

    if (map.current && map.current.isStyleLoaded()) {
      const pointGeoJson: any = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: coords } }] };
      (map.current.getSource('origin-point-source') as mapboxgl.GeoJSONSource).setData(pointGeoJson);
      (map.current.getSource('isochrone-source') as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
      
      map.current.flyTo({ center: [coords[0], coords[1]], zoom: 16, pitch: 45, duration: 1500 });
    }
  };

  const handleCoordinateSubmit = () => {
    const lat = parseFloat(inputLat); const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng)) updateOriginMarker([lng, lat]);
    else alert("正しい緯度・経度を入力してください。");
  };

  const parseNmeaLog = (file: File) => {
    setIsLoading(true);
    setRawCoordinates(null);
    setMatchedRoute(null);
    
    if (map.current && map.current.isStyleLoaded()) {
      (map.current.getSource('raw-trace-source') as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
      (map.current.getSource('matched-trace-source') as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] } as any);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split('\n');
      const coordinates: number[][] = [];

      for (const line of lines) {
        if (line.startsWith('$GPGGA') || line.startsWith('$GNRMC')) { 
          const parts = line.split(',');
          let lat_raw, lon_raw, lat_dir, lon_dir;
          if (line.startsWith('$GPGGA') && parts.length > 5) { lat_raw = parts[2]; lat_dir = parts[3]; lon_raw = parts[4]; lon_dir = parts[5]; } 
          else if (line.startsWith('$GNRMC') && parts.length > 6) { lat_raw = parts[3]; lat_dir = parts[4]; lon_raw = parts[5]; lon_dir = parts[6]; }

          if (lat_raw && lon_raw) {
            const lat_deg = parseFloat(lat_raw.substring(0, 2)); const lat_min = parseFloat(lat_raw.substring(2)); let lat = lat_deg + lat_min / 60; if (lat_dir === 'S') lat *= -1;
            const lon_deg = parseFloat(lon_raw.substring(0, 3)); const lon_min = parseFloat(lon_raw.substring(3)); let lon = lon_deg + lon_min / 60; if (lon_dir === 'W') lon *= -1;
            coordinates.push([lon, lat]);
          }
        }
      }
      
      if (coordinates.length > 0 && map.current && map.current.isStyleLoaded()) {
          setRawCoordinates(coordinates);
          const traceGeoJson: any = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates } }] };
          (map.current.getSource('raw-trace-source') as mapboxgl.GeoJSONSource).setData(traceGeoJson);
          updateOriginMarker(coordinates[coordinates.length - 1]);
      } else {
          alert('有効なNMEAデータが見つかりませんでした。');
      }
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const calculateIsochrone = async () => {
    if (!originPoint || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN || !map.current) return;
    setIsIsochroneLoading(true);
    
    let calculatedMinutes = searchTime;
    if (petType === 'cat') calculatedMinutes = Math.floor(searchTime * 0.5); 
    else if (petType === 'dog') calculatedMinutes = Math.floor(searchTime * 1.0);
    
    const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${originPoint[0]},${originPoint[1]}?contours_minutes=${calculatedMinutes}&polygons=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      (map.current.getSource('isochrone-source') as mapboxgl.GeoJSONSource).setData(data);
      map.current.flyTo({ center: [originPoint[0], originPoint[1]], zoom: searchTime === 60 ? 12 : 13, pitch: 45 });
    } catch (error) { 
      console.error(error); alert('予測捜索範囲の計算に失敗しました。'); 
    } finally { 
      setIsIsochroneLoading(false); 
    }
  };

  const runMapMatching = async () => {
    if (!rawCoordinates || rawCoordinates.length < 2 || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN || !map.current) return;
    setIsMatchingLoading(true);
    setMatchedRoute(null);

    const MAX_POINTS = 90; 
    let thinnedCoords = rawCoordinates;
    if (rawCoordinates.length > MAX_POINTS) {
      const step = Math.ceil(rawCoordinates.length / MAX_POINTS);
      thinnedCoords = rawCoordinates.filter((_, index) => index % step === 0);
      if (thinnedCoords[thinnedCoords.length - 1] !== rawCoordinates[rawCoordinates.length - 1]) {
        thinnedCoords.push(rawCoordinates[rawCoordinates.length - 1]);
      }
    }
    
    const coordinatesString = thinnedCoords.map(coord => `${coord[0]},${coord[1]}`).join(';');
    const url = `https://api.mapbox.com/matching/v5/mapbox/walking/${coordinatesString}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Matching API Error');
      const data = await response.json();

      if (data.code === 'Ok' && data.matchings.length > 0) {
        setMatchedRoute(data);
        const matchedGeoJson: any = { type: 'FeatureCollection', features: data.matchings.map((m: any) => ({ type: 'Feature', geometry: m.geometry })) };
        (map.current.getSource('matched-trace-source') as mapboxgl.GeoJSONSource).setData(matchedGeoJson);
        
        const bounds = new mapboxgl.LngLatBounds();
        thinnedCoords.forEach(coord => bounds.extend([coord[0], coord[1]]));
        map.current.fitBounds(bounds, { padding: 50, pitch: 0, duration: 2000 });
      } else {
        alert('ルートのクリーンナップに失敗しました。データが道路から離れすぎています。');
      }
    } catch (error) { 
      console.error(error); alert('マップマッチングの実行中にエラーが発生しました。'); 
    } finally { 
      setIsMatchingLoading(false); 
    }
  };

  const generateCustomerReport = () => {
    if (!matchedRoute || !rawCoordinates) return;
    
    const rawDistanceKm = matchedRoute.matchings.reduce((sum: number, m: any) => sum + m.distance, 0) / 1000;
    const adjustedDistanceKm = petType === 'cat' ? rawDistanceKm * 0.7 : rawDistanceKm * 1.0;
    const totalMinutes = matchedRoute.matchings.reduce((sum: number, m: any) => sum + m.duration, 0) / 60;

    alert(`📜 顧客レポート（データ）を生成しました！\n\n・捜索種別: ${petType === 'cat' ? '🐈 猫' : '🐶 犬'}\n・捜索距離: ${adjustedDistanceKm.toFixed(2)} km（補正済）\n・捜索時間: 約${Math.round(totalMinutes)}分\n\n※このデータから「完璧な捜索証明書」がPDF化されます。`);
  };

  // 🎨 【UI改修】タブボタンを超・目立つデザインに変更
  const tabBtnStyle = (isActive: boolean) => ({
    flex: 1, 
    padding: '1.2rem', 
    border: 'none', 
    cursor: 'pointer', 
    fontWeight: '900', 
    fontSize: '1.1rem',
    backgroundColor: isActive ? '#0284c7' : '#1e293b', 
    color: isActive ? '#ffffff' : '#64748b', 
    transition: 'all 0.2s', 
    outline: 'none'
  });

  const btnStyle = (isActive: boolean) => ({
    flex: 1, padding: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
    backgroundColor: isActive ? '#0284c7' : '#1e293b', color: isActive ? '#fff' : '#94a3b8', transition: 'all 0.2s', outline: 'none'
  });

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
          <h2 style={{ color: '#38bdf8', letterSpacing: '0.2em', fontSize: '0.9rem', marginBottom: '1rem' }}>KUON R&D × CATONE</h2>
          <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '2rem', fontWeight: '300' }}>TACTICAL RADAR SYSTEM</h3>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Authorization Code" style={{ padding: '1rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', letterSpacing: '0.2em' }} />
            <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', padding: '1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '0.1em' }}>ENTER SYSTEM</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000', fontFamily: 'monospace' }}>
      <header style={{ backgroundColor: '#0f172a', padding: '1rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div>
          <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '0.1em' }}>CATONE COMMAND CENTER</span>
          <span style={{ color: '#64748b', marginLeft: '1rem', fontSize: '0.8rem' }}>Powered by Kuon R&D</span>
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

        {/* 🎛️ コントロールパネル本体 */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '8px', border: '1px solid #334155', backdropFilter: 'blur(8px)', width: '400px', maxHeight: '95vh', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          
          {/* 🔥 ここが巨大で目立つ「タブ切り替えボタン」です！ */}
          <div style={{ display: 'flex', borderBottom: '2px solid #0284c7' }}>
            <button onClick={() => setActiveTab('search')} style={tabBtnStyle(activeTab === 'search')}>📡 捜索モード</button>
            <button onClick={() => setActiveTab('report')} style={tabBtnStyle(activeTab === 'report')}>📝 レポート作成</button>
          </div>

          {/* コンテンツエリア */}
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>

            {/* =========================================
                タブ1: 捜索モード (SEARCH)
            ========================================= */}
            {activeTab === 'search' && (
              <>
                <section style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#e2e8f0', margin: '0 0 0.8rem 0', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>1. 基準点の設定</h3>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.8rem 0' }}>地図を直接ダブルクリックするか、ログをドロップしてください。</p>

                  <div onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) parseNmeaLog(file); }} onDragOver={(e) => e.preventDefault()} style={{ border: '1px dashed #475569', borderRadius: '4px', padding: '1.5rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.3)', cursor: 'pointer', marginBottom: '1rem' }}>
                     <p style={{ color: '#38bdf8', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>{isLoading ? '解析中...' : '📍 NMEA(.log)をここにドロップ'}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="text" placeholder="緯度 (Lat)" value={inputLat} onChange={e => setInputLat(e.target.value)} style={{ width: '40%', padding: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '0.8rem', borderRadius: '4px' }} />
                    <input type="text" placeholder="経度 (Lng)" value={inputLng} onChange={e => setInputLng(e.target.value)} style={{ width: '40%', padding: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '0.8rem', borderRadius: '4px' }} />
                    <button onClick={handleCoordinateSubmit} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#475569', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>SET</button>
                  </div>
                </section>

                <section style={{ opacity: originPoint ? 1 : 0.3, pointerEvents: originPoint ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                  <h3 style={{ color: '#e2e8f0', margin: '0 0 0.8rem 0', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>2. 予測捜索エリアの展開</h3>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>対象種別 (Target Type)</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setPetType('cat')} style={btnStyle(petType === 'cat')}>🐱 猫</button>
                      <button onClick={() => setPetType('dog')} style={btnStyle(petType === 'dog')}>🐶 犬</button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>経過時間 (Elapsed Time)</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setSearchTime(30)} style={btnStyle(searchTime === 30)}>30分</button>
                      <button onClick={() => setSearchTime(60)} style={btnStyle(searchTime === 60)}>1時間</button>
                    </div>
                  </div>

                  <button onClick={calculateIsochrone} disabled={isIsochroneLoading} style={{ width: '100%', backgroundColor: '#ef4444', color: '#fff', padding: '1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', border: 'none', opacity: isIsochroneLoading ? 0.5 : 1, boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}>
                    {isIsochroneLoading ? 'SCANNING AREA...' : '予測捜索範囲を展開'}
                  </button>
                </section>

                {/* 🔥 NMEAログが入った瞬間、レポート画面へ誘導する巨大ボタンが出現！ */}
                {rawCoordinates && (
                  <div style={{ marginTop: '2.5rem', padding: '1.5rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '2px solid #10b981', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ color: '#10b981', fontSize: '1rem', margin: '0 0 1rem 0', fontWeight: 'bold' }}>✅ ログデータが読み込まれました</p>
                    <button onClick={() => setActiveTab('report')} style={{ width: '100%', padding: '1rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '900', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                      レポートを作成しますか？ ➡️
                    </button>
                  </div>
                )}
              </>
            )}

            {/* =========================================
                タブ2: レポート作成モード (REPORT)
            ========================================= */}
            {activeTab === 'report' && (
              <>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#e2e8f0', margin: '0 0 0.8rem 0', fontSize: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>捜索ルートの証明・レポート化</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>現場のGPSデータから、顧客提出用の美しく信頼できる「捜索証明レポート」を作成します。</p>
                </div>

                {!rawCoordinates ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '2px dashed #475569' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📁</span>
                    <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: '0 0 1.5rem 0', fontWeight: 'bold' }}>レポート化するデータがありません。</p>
                    <button onClick={() => setActiveTab('search')} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#38bdf8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      戻ってログをドロップする
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid #334155' }}>
                      <p style={{ color: '#38bdf8', fontSize: '1rem', margin: '0 0 0.8rem 0', fontWeight: 'bold' }}>Step 1. 軌跡のクリーンナップ</p>
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1.5rem 0' }}>AIがギザギザのGPS軌跡を実際の道路網に吸着（スナップ）させ、美しいルートに修正します。</p>
                      
                      {matchedRoute ? (
                        <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '6px' }}>
                           <span>✅</span> 補正完了（地図上の青線をご確認ください）
                        </div>
                      ) : (
                        <button onClick={runMapMatching} disabled={isMatchingLoading} style={{ width: '100%', backgroundColor: '#38bdf8', color: '#fff', padding: '1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '1rem', opacity: isMatchingLoading ? 0.5 : 1, boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)' }}>
                          {isMatchingLoading ? '補正中...' : '軌跡の自動補正を実行'}
                        </button>
                      )}
                    </div>

                    <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid #334155', opacity: matchedRoute ? 1 : 0.4, pointerEvents: matchedRoute ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
                      <p style={{ color: '#e2e8f0', fontSize: '1rem', margin: '0 0 0.8rem 0', fontWeight: 'bold' }}>Step 2. レポートデータの生成</p>
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1.5rem 0' }}>動物行動学に基づき、顧客が納得する捜索距離や時間を自動計算し、証明書データを作成します。</p>
                      
                      <button onClick={generateCustomerReport} style={{ width: '100%', backgroundColor: '#fff', color: '#0f172a', padding: '1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '1rem', boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)' }}>
                        📄 顧客用レポートデータ(PDF)を出力
                      </button>
                    </div>

                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}