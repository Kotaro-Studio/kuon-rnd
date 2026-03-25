"use client";
import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const WEATHER_API_KEY = "d19b041224aa52f1c3d7dc72ab434cfd";

export default function CatOneTacticalRadarV5() {
  // 🚨 Hydrationエラーの原因だった mounted ステートを完全に削除しました
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const SECRET_PASSWORD = "1012";

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [activeTab, setActiveTab] = useState<'search' | 'report'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [isIsochroneLoading, setIsIsochroneLoading] = useState(false);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  
  const [rawCoordinates, setRawCoordinates] = useState<number[][] | null>(null);
  const [matchedRoute, setMatchedRoute] = useState<any>(null);
  const [originPoint, setOriginPoint] = useState<[number, number] | null>(null);
  
  const [petType, setPetType] = useState<'cat' | 'dog'>('cat');
  const [temperament, setTemperament] = useState<'scared' | 'normal' | 'active'>('normal');
  const [searchTime, setSearchTime] = useState<number>(30);
  const [envData, setEnvData] = useState<{ temp: number, windDeg: number, windSpeed: number, isDark: boolean } | null>(null);

  // 地図初期化（ログイン完了後にのみ実行されるため安全）
  useEffect(() => {
    if (!isAuthenticated || !mapContainer.current || map.current) return;

    // トークンの読み込みをコンポーネント内に移動し、エラーを防止
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
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
        
        m.addSource('raw-trace-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        m.addLayer({ id: 'raw-trace-line', type: 'line', source: 'raw-trace-source', paint: { 'line-color': '#94a3b8', 'line-width': 2, 'line-dasharray': [2, 1] } });
        
        m.addSource('matched-trace-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        m.addLayer({ id: 'matched-trace-line', type: 'line', source: 'matched-trace-source', paint: { 'line-color': '#38bdf8', 'line-width': 4 } });
        
        m.addSource('origin-point-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        m.addLayer({ id: 'origin-point-circle', type: 'circle', source: 'origin-point-source', paint: { 'circle-radius': 10, 'circle-color': '#fff', 'circle-stroke-color': '#ef4444', 'circle-stroke-width': 3 } });
      });

      map.current.on('dblclick', (e) => {
        handleLocationSelect([e.lngLat.lng, e.lngLat.lat] as [number, number]);
      });
    } catch (error) {
      console.error("Mapbox initialization failed:", error);
    }

    return () => { if (map.current) { map.current.remove(); map.current = null; } };
  }, [isAuthenticated]);

  const handleLocationSelect = async (coords: [number, number]) => {
    setOriginPoint(coords);
    setIsLoading(true);

    try {
      const wRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords[1]}&lon=${coords[0]}&appid=${WEATHER_API_KEY}&units=metric`);
      if (wRes.ok) {
        const wData = await wRes.json();
        const sRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${coords[1]}&lng=${coords[0]}&formatted=0`);
        const sData = await sRes.json();
        const sunset = new Date(sData.results.sunset);
        const isDark = new Date() > sunset;

        setEnvData({ temp: wData.main.temp, windDeg: wData.wind.deg, windSpeed: wData.wind.speed, isDark: isDark });
      }

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

    let baseMins = searchTime;
    if (temperament === 'scared') baseMins *= 0.6;
    if (temperament === 'active') baseMins *= 1.4;
    if (petType === 'cat') baseMins *= 0.5;
    if (petType === 'cat' && envData?.isDark) baseMins *= 1.2;

    const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${originPoint[0]},${originPoint[1]}?contours_minutes=${Math.floor(baseMins)}&polygons=true&access_token=${mapboxgl.accessToken}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      
      if (envData && petType === 'dog') {
        const windRad = (envData.windDeg - 180) * (Math.PI / 180);
        const shiftDistance = 0.001 * (envData.windSpeed / 5);
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

  const parseNmeaLog = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split('\n');
      const coordinates: number[][] = [];
      for (const line of lines) {
        if (line.startsWith('$GPGGA') || line.startsWith('$GNRMC')) {
          const p = line.split(',');
          let lat_raw, lon_raw, lat_dir, lon_dir;
          if (line.startsWith('$GPGGA') && p.length > 5) { lat_raw = p[2]; lat_dir = p[3]; lon_raw = p[4]; lon_dir = p[5]; }
          else if (line.startsWith('$GNRMC') && p.length > 6) { lat_raw = p[3]; lat_dir = p[4]; lon_raw = p[5]; lon_dir = p[6]; }
          if (lat_raw && lon_raw) {
            const lat = (parseFloat(lat_raw.substring(0, 2)) + parseFloat(lat_raw.substring(2)) / 60) * (lat_dir === 'S' ? -1 : 1);
            const lon = (parseFloat(lon_raw.substring(0, 3)) + parseFloat(lon_raw.substring(3)) / 60) * (lon_dir === 'W' ? -1 : 1);
            coordinates.push([lon, lat]);
          }
        }
      }
      if (coordinates.length > 0) {
        setRawCoordinates(coordinates);
        if (map.current) {
          (map.current.getSource('raw-trace-source') as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates }, properties: {} }] });
          handleLocationSelect(coordinates[coordinates.length - 1] as [number, number]);
        }
      }
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const btnStyle = (active: boolean, color = '#0284c7') => ({
    flex: 1, padding: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
    backgroundColor: active ? color : '#1e293b', color: active ? '#fff' : '#94a3b8', transition: 'all 0.2s'
  });

  // ログイン画面（サーバーでもクライアントでも同一のHTMLを出力し、エラーを防ぐ）
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={(e) => { e.preventDefault(); if (passwordInput === SECRET_PASSWORD) setIsAuthenticated(true); }} style={{ backgroundColor: '#1e293b', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }}>
          <h2 style={{ color: '#38bdf8', marginBottom: '2rem', letterSpacing: '0.1em' }}>CATONE RADAR V5</h2>
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
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1rem' }}>GPSログをドロップして解析を開始してください。</p>
                
                {/* 🛠️ 修正: レポートタブでもNMEAログをドロップできるように復元しました */}
                <div 
                  onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) parseNmeaLog(file); }} 
                  onDragOver={(e) => e.preventDefault()} 
                  style={{ border: '2px dashed #38bdf8', padding: '2rem', borderRadius: '8px', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', backgroundColor: 'rgba(56, 189, 248, 0.05)' }}>
                  {isLoading ? '解析中...' : '📍 NMEA LOG DROP'}
                </div>

                {rawCoordinates && (
                  <div style={{ marginTop: '2rem' }}>
                    <button onClick={async () => {
                      setIsMatchingLoading(true);
                      const step = Math.ceil((rawCoordinates?.length || 0) / 90);
                      const thinned = rawCoordinates?.filter((_, i) => i % step === 0);
                      const coordsStr = thinned?.map(c => `${c[0]},${c[1]}`).join(';');
                      const url = `https://api.mapbox.com/matching/v5/mapbox/walking/${coordsStr}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
                      try {
                        const res = await fetch(url);
                        const data = await res.json();
                        if (data.code === 'Ok') {
                          setMatchedRoute(data);
                          (map.current?.getSource('matched-trace-source') as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features: data.matchings.map((m: any) => ({ type: 'Feature', geometry: m.geometry })) });
                        }
                      } catch (e) { console.error(e); } finally { setIsMatchingLoading(false); }
                    }} style={{ width: '100%', backgroundColor: '#38bdf8', color: '#fff', padding: '1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', border: 'none', marginBottom: '1rem' }}>
                      {isMatchingLoading ? '補正中...' : '軌跡の自動補正を実行'}
                    </button>
                    <button disabled={!matchedRoute} style={{ width: '100%', backgroundColor: matchedRoute ? '#fff' : '#334155', color: '#0f172a', padding: '1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', border: 'none', opacity: matchedRoute ? 1 : 0.5 }}>📄 PDFレポート出力</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}