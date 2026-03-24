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

  const [isLoading, setIsLoading] = useState(false);
  const [isIsochroneLoading, setIsIsochroneLoading] = useState(false);
  
  const [originPoint, setOriginPoint] = useState<number[] | null>(null);
  const [inputLat, setInputLat] = useState<string>("");
  const [inputLng, setInputLng] = useState<string>("");
  
  // 🛠️ ここを修正！ 厳しすぎる型指定を緩めました
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
      const coords = [e.lngLat.lng, e.lngLat.lat];
      updateOriginMarker(coords);
    });

    map.current.on('load', () => {
      map.current?.addSource('isochrone-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current?.addLayer({ id: 'isochrone-fill', type: 'fill', source: 'isochrone-source', paint: { 'fill-color': '#ef4444', 'fill-opacity': 0.2 } });
      map.current?.addLayer({ id: 'isochrone-outline', type: 'line', source: 'isochrone-source', paint: { 'line-color': '#ef4444', 'line-width': 2, 'line-opacity': 0.5 } });

      map.current?.addSource('trace-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current?.addLayer({ id: 'trace-line', type: 'line', source: 'trace-source', paint: { 'line-color': '#38bdf8', 'line-width': 3, 'line-opacity': 0.8 } });

      map.current?.addSource('origin-point-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.current?.addLayer({ id: 'origin-point-circle', type: 'circle', source: 'origin-point-source', paint: { 'circle-radius': 8, 'circle-color': '#fff', 'circle-stroke-color': '#ef4444', 'circle-stroke-width': 3 } });
    });
  }, [isAuthenticated]);

  const updateOriginMarker = (coords: number[]) => {
    setOriginPoint(coords);
    setInputLng(coords[0].toFixed(6));
    setInputLat(coords[1].toFixed(6));

    if (map.current && map.current.isStyleLoaded()) {
      const pointGeoJson: any = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: coords } }] };
      (map.current.getSource('origin-point-source') as mapboxgl.GeoJSONSource).setData(pointGeoJson);
      
      (map.current.getSource('isochrone-source') as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] });
      (map.current.getSource('trace-source') as mapboxgl.GeoJSONSource).setData({ type: 'FeatureCollection', features: [] });

      map.current.flyTo({ center: [coords[0], coords[1]], zoom: 16, pitch: 45, duration: 1500 });
    }
  };

  const handleCoordinateSubmit = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      updateOriginMarker([lng, lat]);
    } else {
      alert("正しい緯度・経度を入力してください。");
    }
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
          const traceGeoJson: any = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates } }] };
          (map.current.getSource('trace-source') as mapboxgl.GeoJSONSource).setData(traceGeoJson);
          updateOriginMarker(coordinates[coordinates.length - 1]);
      } else {
          alert('有効なNMEAデータが見つかりませんでした。');
      }
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.log') || file.name.endsWith('.txt'))) { parseNmeaLog(file); }
  };

  const calculateIsochrone = async () => {
    if (!originPoint || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN || !map.current) return;
    setIsIsochroneLoading(true);
    
    let calculatedMinutes = searchTime;
    if (petType === 'cat') {
      calculatedMinutes = Math.floor(searchTime * 0.5); 
    } else if (petType === 'dog') {
      calculatedMinutes = Math.floor(searchTime * 1.0);
    }
    
    const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${originPoint[0]},${originPoint[1]}?contours_minutes=${calculatedMinutes}&polygons=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      
      (map.current.getSource('isochrone-source') as mapboxgl.GeoJSONSource).setData(data);
      
      const zoomLevel = searchTime === 60 ? 12 : 13;
      map.current.flyTo({ center: [originPoint[0], originPoint[1]], zoom: zoomLevel, pitch: 45 });
    } catch (error) {
      console.error(error);
      alert('予測捜索範囲の計算に失敗しました。');
    } finally {
      setIsIsochroneLoading(false);
    }
  };

  const btnStyle = (isActive: boolean) => ({
    flex: 1, padding: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
    backgroundColor: isActive ? '#0284c7' : '#1e293b', color: isActive ? '#fff' : '#94a3b8', transition: 'all 0.2s'
  });

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: '3rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }}>
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
          <span style={{ color: '#64748b', marginLeft: '1rem', fontSize: '0.8rem' }}>Powered by Kuon R&D Edge Network</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
          <span style={{ color: '#10b981', fontSize: '0.9rem' }}>SYSTEM ONLINE</span>
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', backgroundColor: 'rgba(15, 23, 42, 0.95)', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155', backdropFilter: 'blur(8px)', width: '340px', maxHeight: '90vh', overflowY: 'auto' }}>
          
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#e2e8f0', margin: '0 0 0.8rem 0', fontSize: '0.9rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>1. 基準点の設定 (ORIGIN)</span>
            </h3>
            
            <p style={{ color: '#10b981', fontSize: '0.75rem', margin: '0 0 0.8rem 0' }}>💡 地図上をダブルクリックで即座に設定可能</p>

            <div 
              onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()}
              style={{ border: '1px dashed #475569', borderRadius: '4px', padding: '1rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.3)', cursor: 'pointer', marginBottom: '0.8rem' }}
            >
               <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.8rem' }}>{isLoading ? '解析中...' : 'NMEA(.log)をここにドロップ'}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="text" placeholder="緯度 (Lat)" value={inputLat} onChange={e => setInputLat(e.target.value)} style={{ width: '40%', padding: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '0.8rem', borderRadius: '4px' }} />
              <input type="text" placeholder="経度 (Lng)" value={inputLng} onChange={e => setInputLng(e.target.value)} style={{ width: '40%', padding: '0.5rem', backgroundColor: '#0f172a', border: '1px solid #475569', color: '#fff', fontSize: '0.8rem', borderRadius: '4px' }} />
              <button onClick={handleCoordinateSubmit} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#475569', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>SET</button>
            </div>
          </section>

          <section style={{ opacity: originPoint ? 1 : 0.3, pointerEvents: originPoint ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
            <h3 style={{ color: '#e2e8f0', margin: '0 0 0.8rem 0', fontSize: '0.9rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>2. 捜索パラメータ (PARAMETERS)</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>対象種別 (Target Type)</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setPetType('cat')} style={btnStyle(petType === 'cat')}>🐱 猫 (Cat)</button>
                <button onClick={() => setPetType('dog')} style={btnStyle(petType === 'dog')}>🐶 犬 (Dog)</button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 0.4rem 0' }}>経過時間 (Elapsed Time)</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setSearchTime(30)} style={btnStyle(searchTime === 30)}>30分</button>
                <button onClick={() => setSearchTime(60)} style={btnStyle(searchTime === 60)}>1時間</button>
              </div>
            </div>

            <button
                onClick={calculateIsochrone}
                disabled={isIsochroneLoading}
                style={{ width: '100%', backgroundColor: '#ef4444', color: '#fff', padding: '1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '0.1em', opacity: isIsochroneLoading ? 0.5 : 1, boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}
            >
                {isIsochroneLoading ? 'SCANNING AREA...' : '予測捜索範囲を展開'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}