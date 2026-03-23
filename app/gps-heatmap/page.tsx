"use client";
import React, { useState, useRef, useEffect } from 'react';

type Coordinate = [number, number];

export default function GpsHeatmapPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logInfo, setLogInfo] = useState<{ name: string, points: number } | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // ============================================================================
  // アルゴリズム：NMEAのパース
  // ============================================================================
  const processNmeaLog = (file: File) => {
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const parsedCoords: Coordinate[] = [];

      lines.forEach(line => {
        if (line.startsWith('$GPRMC') || line.startsWith('$GPGGA')) {
          const parts = line.split(',');
          let latStr = "", ns = "", lonStr = "", ew = "";

          if (line.startsWith('$GPGGA') && parts.length > 5) {
            latStr = parts[2]; ns = parts[3]; lonStr = parts[4]; ew = parts[5];
          } else if (line.startsWith('$GPRMC') && parts[2] === 'A' && parts.length > 6) {
            latStr = parts[3]; ns = parts[4]; lonStr = parts[5]; ew = parts[6];
          }

          if (latStr && lonStr) {
            const latDeg = parseInt(latStr.substring(0, 2), 10);
            const latMin = parseFloat(latStr.substring(2));
            let lat = latDeg + (latMin / 60);
            if (ns === 'S') lat = -lat;

            const lonDeg = parseInt(lonStr.substring(0, 3), 10);
            const lonMin = parseFloat(lonStr.substring(3));
            let lon = lonDeg + (lonMin / 60);
            if (ew === 'W') lon = -lon;

            if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
              parsedCoords.push([lat, lon]);
            }
          }
        }
      });

      setCoordinates(parsedCoords);
      setLogInfo({ name: file.name, points: parsedCoords.length });
      setIsProcessing(false);
    };

    reader.onerror = () => {
      alert("ファイルの読み込みに失敗しました。");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processNmeaLog(e.dataTransfer.files[0]);
  };
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processNmeaLog(e.target.files[0]);
  };
  const resetApp = () => {
    setCoordinates([]);
    setLogInfo(null);
  };

  // ============================================================================
  // 地図の描画（クリーンな白地図 ＆ ヒートマップ・レンダリング）
  // ============================================================================
  useEffect(() => {
    if (coordinates.length > 0 && mapRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      import('leaflet').then((L) => {
        const map = L.map(mapRef.current!).setView(coordinates[0], 16);
        mapInstanceRef.current = map;

        // 空音開発の世界観に合う、クリーンで明るい「Voyager」タイルを読み込み
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        // 1. 移動経路を示す「極細の青い線（透明度高め）」を描画
        const polyline = L.polyline(coordinates, { color: '#0284c7', weight: 2, opacity: 0.15 }).addTo(map);

        // 2. 滞在時間（Dwell Time）を視覚化するヒートマップ処理
        // ※背景が白くなったため、赤い円がより鮮明に浮かび上がります
        coordinates.forEach(coord => {
          L.circleMarker(coord, {
            radius: 8,                    
            fillColor: '#ef4444',         // 燃えるような赤色
            color: 'transparent',         
            fillOpacity: 0.05             // 透明度を5%に設定（重なると濃い赤になる）
          }).addTo(map);
        });

        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates]);

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: 'clamp(4rem, 8vw, 6rem) 5%' }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        
        <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1rem' }}>Pet Detective Solutions</h2>
        <h3 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '200', letterSpacing: '0.1em', margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Dwell Time Analyzer</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2', letterSpacing: '0.05em', marginBottom: '3rem' }}>
          GPSログの密度を計算し、対象が長時間滞在（潜伏）していた「ホットスポット」を可視化します。
        </p>

        {coordinates.length === 0 && (
          <>
            <input type="file" ref={fileInputRef} onChange={onFileInputChange} accept=".log,.txt" style={{ display: 'none' }} />
            <div 
              onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
              className="glass-card" 
              style={{ 
                padding: '5rem 2rem', borderRadius: '16px', 
                border: `2px dashed ${isDragging ? 'var(--accent)' : 'rgba(2, 132, 199, 0.3)'}`,
                backgroundColor: isDragging ? 'rgba(2, 132, 199, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer', transition: 'all 0.3s ease', transform: isDragging ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              {isProcessing ? (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>🐾</div>
                  <p style={{ fontSize: '1.2rem', color: 'var(--accent)', letterSpacing: '0.1em' }}>Analyzing Hotspots...</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}>🔥</div>
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '0.1em', fontWeight: '300' }}>
                    NMEAログファイル (.log) をここにドロップ<br />
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>またはクリックしてファイルを選択</span>
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {coordinates.length > 0 && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem', textAlign: 'left' }}>
              <div>
                <p style={{ color: 'var(--text-main)', fontSize: '1rem', margin: '0 0 0.5rem 0' }}>
                  対象ファイル: <strong style={{ color: 'var(--accent)' }}>{logInfo?.name}</strong> 
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%', marginRight: '8px', opacity: 0.8 }}></span>
                  赤く強く発光している場所ほど、滞在時間（潜伏時間）が長いことを示します。
                </p>
              </div>
              <button onClick={resetApp} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', padding: '0.5rem 1.5rem', borderRadius: '50px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.3s ease' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = 'var(--text-main)'; }}>
                別のログを解析
              </button>
            </div>

            <div 
              ref={mapRef} 
              className="glass-card"
              style={{ width: '100%', height: '650px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', zIndex: 1 }}
            />
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          /* LeafletのコントロールUIを空音開発のトーンに合わせる微調整 */
          .leaflet-control-zoom a { color: var(--text-main) !important; background: rgba(255,255,255,0.8) !important; backdrop-filter: blur(5px); }
        `}} />
      </div>
    </div>
  );
}