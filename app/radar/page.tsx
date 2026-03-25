"use client";
import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const WEATHER_API_KEY = "d19b041224aa52f1c3d7dc72ab434cfd";

export default function CatOneTacticalRadarV5() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const SECRET_PASSWORD = "1012";

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // ステート管理
  const [activeTab, setActiveTab] = useState<'search' | 'report'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [isIsochroneLoading, setIsIsochroneLoading] = useState(false);
  
  // [number, number] のタプル型を明示的に指定
  const [originPoint, setOriginPoint] = useState<[number, number] | null>(null);
  
  // 🧭 捜索パラメータ
  const [petType, setPetType] = useState<'cat' | 'dog'>('cat');
  const [temperament, setTemperament] = useState<'scared' | 'normal' | 'active'>('normal');
  const [searchTime, setSearchTime] = useState<number>(30);

  // ☁️ 環境データ
  const [envData, setEnvData] = useState<{ temp: number, windDeg: number, windSpeed: number, isDark: boolean } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // 地図初期化
  useEffect(() => {
    if (!mounted || !isAuthenticated || !mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      // as [number, number] を追加
      center: [135.5, 34.8] as [number, number],
      zoom: 11,
      pitch: 45,
      doubleClickZoom: false
    });

    map.current.on('load', () => {
      const m = map.current!;
      m.addSource('isochrone-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({ id: 'isochrone-fill', type: 'fill', source: 'isochrone-source', paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.25 } });
      m.addLayer({ id: 'isochrone-outline', type: 'line', source: 'isochrone-source', paint: { 'line-color': '#ef4444', 'line-width': 2 } });
      m.addSource('origin-point-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({ id: 'origin-point-circle', type: 'circle', source: 'origin-point-source', paint: { 'circle-radius': 10, 'circle-color': '#fff', 'circle-stroke-color': '#ef4444', 'circle-stroke-width': 3 } });
    });

    map.current.on('dblclick', (e) => {
      // as [number, number] を追加
      handleLocationSelect([e.lngLat.lng, e.lngLat.lat] as [number, number]);
    });

    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, [mounted, isAuthenticated]);

  // 地点確定時の環境取得ロジック
  // 引数の型を [number, number] に変更
  const handleLocationSelect = async (coords: [number, number]) => {
    setOriginPoint(coords);
    setIsLoading(true);

    try {
      // 1. Weather API
      const wRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords[1]}&lon=${coords[0]}&appid=${WEATHER_API_KEY}&units=metric`);
      const wData = await wRes.json();

      // 2. Sunrise Sunset API
      const sRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${coords[1]}&lng=${coords[0]}&formatted=0`);
      const sData = await sRes.json();
      const sunset = new Date(sData.results.sunset);
      const isDark = new Date() > sunset;

      setEnvData({
        temp: wData.main.temp,
        windDeg: wData.wind.deg,
        windSpeed: wData.wind.speed,
        isDark: isDark
      });

      if (map.current) {
        (map.current.getSource('origin-point-source') as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: coords }, properties: {} }]
        });
        map.current.flyTo({ center: coords, zoom: 15, duration: 1500 });
      }
    } catch (e) { console.error("Env data fetch error", e); }
    setIsLoading(false);
  };

  const calculateAdvancedIsochrone = async () => {
    if (!originPoint || !map.current) return;
    setIsIsochroneLoading(true);

    // 🧠 動物行動学ロジックの適用
    let baseMins = searchTime;
    
    // 性格バイアス
    if (temperament === 'scared') baseMins *= 0.6; // 臆病な場合は潜伏しやすい
    if (temperament === 'active') baseMins *= 1.4; // 活発な場合は遠征しやすい

    // 種別バイアス (猫は歩行速度設定をさらに絞る)
    if (petType === 'cat') baseMins *= 0.5;

    // 日没バイアス (夜間の猫は活動量が上がる)
    if (petType === 'cat' && envData?.isDark) baseMins *= 1.2;

    const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${originPoint[0]},${originPoint[1]}?contours_minutes=${Math.floor(baseMins)}&polygons=true&access_token=${mapboxgl.accessToken}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      
      // 風向きによる「範囲のオフセット」シミュレーション
      if (envData && petType === 'dog') {
        const windRad = (envData.windDeg - 180) * (Math.PI / 180); // 風上方向
        const shiftDistance = 0.001 * (envData.windSpeed / 5); // 風速に応じたシフト量
        if (data.features && data.features.length > 0) {
          data.features[0].geometry.coordinates[0] = data.features[0].geometry.coordinates[0].map((coord: number[]) => [
            coord[0] + Math.sin(windRad) * shiftDistance,
            coord[1] + Math.cos(windRad) * shiftDistance
          ]);
        }
      }

      (map.current.getSource('isochrone-source') as mapboxgl.GeoJSONSource).setData(data);
    } catch (e) { console.error(e); } finally { setIsIsochroneLoading(false); }
  };

  const btnStyle = (active: boolean, color = '#0284c7') => ({
    flex: 1, padding: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
    backgroundColor: active ? color : '#1e293b', color: active ? '#fff' : '#94a3b8', transition: 'all 0.2s'
  });

  if (!mounted) return null;
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={(e) => { e.preventDefault(); if (passwordInput === SECRET_PASSWORD) setIsAuthenticated(true); }} style={{ backgroundColor: '#1e293b', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }}>
          <h2 style={{ color: '#38bdf8', marginBottom: '2rem', letterSpacing: '0.1em' }}>CATONE RADAR V5</h2>
          {/* 🛠️ 修正: placeholder="Code: 1012" を削除し、空にしました */}
          <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Authorization Code" style={{ padding: '1rem', borderRadius: '6px', border: '1px solid #475569', width: '100%', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#0f172a', color: '#fff' }} />
          <button type="submit" style={{ width: '100%', padding: '1rem', backgroundColor: '#0284c7', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>ACCESS SYSTEM</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#000', fontFamily: 'monospace', color: '#fff' }}>
      <header style={{ backgroundColor: '#0f172a', padding: '1rem 2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#38bdf8', fontWeight: 'bold', letterSpacing: '0.1em' }}>CATONE COMMAND CENTER</span>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Powered by Sunrise Sunset API & OpenWeather</span>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

        {/* サイドパネル */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', width: '380px', backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', zIndex: 10 }}>
          <div style={{ display: 'flex' }}>
            <button onClick={() => setActiveTab('search')} style={{ flex: 1, padding: '1.2rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'search' ? '#0284c7' : '#1e293b', color: '#fff' }}>📡 捜索戦略</button>
            <button onClick={() => setActiveTab('report')} style={{ flex: 1, padding: '1.2rem', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'report' ? '#0284c7' : '#1e293b', color: '#fff' }}>📝 解析レポート</button>
          </div>

          <div style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
            {activeTab === 'search' && (
              <>
                <div style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                  地図をダブルクリックして地点を特定してください。
                </div>

                {/* 1. 環境モニタリング */}
                <section style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(56, 189, 248, 0.05)', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <h4 style={{ margin: '0 0 0.8rem 0', color: '#38bdf8', fontSize: '0.8rem' }}>環境データ(現在地)</h4>
                  {envData ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                      <div>🌡️ 気温: {envData.temp}°C</div>
                      <div>🌬️ 風速: {envData.windSpeed}m/s</div>
                      <div>🧭 風向: {envData.windDeg}°</div>
                      <div>🌙 状態: {envData.isDark ? '夜間モード' : '日中モード'}</div>
                    </div>
                  ) : <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>地点をダブルクリックして取得</p>}
                </section>

                {/* 2. 個体パラメータ */}
                <section style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>個体の性格・状態</p>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => setTemperament('scared')} style={btnStyle(temperament === 'scared', '#f59e0b')}>臆病/パニック</button>
                    <button onClick={() => setTemperament('normal')} style={btnStyle(temperament === 'normal')}>通常</button>
                    <button onClick={() => setTemperament('active')} style={btnStyle(temperament === 'active', '#10b981')}>活発/社交的</button>
                  </div>
                </section>

                <section style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>対象種別 & 経過時間</p>
                  <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <button onClick={() => setPetType('cat')} style={btnStyle(petType === 'cat')}>🐱 猫</button>
                    <button onClick={() => setPetType('dog')} style={btnStyle(petType === 'dog')}>🐶 犬</button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => setSearchTime(30)} style={btnStyle(searchTime === 30)}>30分</button>
                    <button onClick={() => setSearchTime(60)} style={btnStyle(searchTime === 60)}>1時間</button>
                    <button onClick={() => setSearchTime(120)} style={btnStyle(searchTime === 120)}>2時間</button>
                  </div>
                </section>

                <button onClick={calculateAdvancedIsochrone} disabled={!originPoint || isIsochroneLoading} style={{ width: '100%', padding: '1rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: originPoint ? 1 : 0.5 }}>
                  {isIsochroneLoading ? 'SIMULATING...' : 'AI予測範囲を展開'}
                </button>
                
                {envData && (
                   <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#0f172a', borderRadius: '6px', fontSize: '0.8rem', color: '#34d399', border: '1px solid #065f46', lineHeight: '1.5' }}>
                     <strong>💡 戦術アドバイス:</strong><br/>
                     {petType === 'dog' && envData.windSpeed > 3 ? "強風のため、風上の匂いを追っている可能性が極めて高いです。赤い範囲の風上側を重点捜索してください。" : 
                      envData.isDark && petType === 'cat' ? "日没しました。猫の行動半径が広がります。ライトで照らし、目の反射をターゲットにしてください。" : 
                      "標準的な捜索プロトコルを維持。物陰と高低差を優先してください。"}
                   </div>
                )}
              </>
            )}

            {activeTab === 'report' && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ color: '#64748b' }}>GPSログをドロップして解析を開始してください。</p>
                <div style={{ border: '2px dashed #334155', padding: '2rem', marginTop: '1rem', borderRadius: '8px', color: '#475569', fontWeight: 'bold' }}>NMEA LOG DROP</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}