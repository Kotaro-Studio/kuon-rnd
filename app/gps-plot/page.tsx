"use client";
import React, { useState, useRef, useEffect } from 'react';

// 地図の描画状態を管理するための型
type Coordinate = [number, number]; // [緯度, 経度]

export default function GpsPlotPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logInfo, setLogInfo] = useState<{ name: string, points: number } | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // Leafletマップのインスタンス保持用

  // ============================================================================
  // アルゴリズム：NMEA 0183 フォーマットのエッジ・パース処理
  // ============================================================================
  const processNmeaLog = (file: File) => {
    setIsProcessing(true);
    
    // ブラウザのメモリ上でテキストファイルを読み込む（サーバー送信ゼロ）
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const parsedCoords: Coordinate[] = [];

      lines.forEach(line => {
        // $GPRMC または $GPGGA センテンスから緯度経度を抽出
        if (line.startsWith('$GPRMC') || line.startsWith('$GPGGA')) {
          const parts = line.split(',');
          let latStr = "", ns = "", lonStr = "", ew = "";

          if (line.startsWith('$GPGGA') && parts.length > 5) {
            latStr = parts[2]; ns = parts[3]; lonStr = parts[4]; ew = parts[5];
          } else if (line.startsWith('$GPRMC') && parts[2] === 'A' && parts.length > 6) {
            // 'A' はデータ有効(Active)を示す
            latStr = parts[3]; ns = parts[4]; lonStr = parts[5]; ew = parts[6];
          }

          if (latStr && lonStr) {
            // NMEAの緯度経度（ddmm.mmmm）を10進数の度（dd.dddd）に数学的に変換
            const latDeg = parseInt(latStr.substring(0, 2), 10);
            const latMin = parseFloat(latStr.substring(2));
            let lat = latDeg + (latMin / 60);
            if (ns === 'S') lat = -lat;

            const lonDeg = parseInt(lonStr.substring(0, 3), 10);
            const lonMin = parseFloat(lonStr.substring(3));
            let lon = lonDeg + (lonMin / 60);
            if (ew === 'W') lon = -lon;

            // 異常値弾き（0度の場合はスキップ）
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

    reader.readAsText(file); // テキストとして展開
  };

  // --- ドラッグ＆ドロップイベント ---
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processNmeaLog(e.dataTransfer.files[0]);
    }
  };
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processNmeaLog(e.target.files[0]);
    }
  };
  const resetApp = () => {
    setCoordinates([]);
    setLogInfo(null);
  };

  // ============================================================================
  // 地図の描画（Leafletの動的読み込み）
  // ============================================================================
  useEffect(() => {
    if (coordinates.length > 0 && mapRef.current) {
      // 既存のマップがあればリセット
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Leafletを動的にインポートして描画（Next.jsのSSR回避のため）
      import('leaflet').then((L) => {
        const map = L.map(mapRef.current!).setView(coordinates[0], 15);
        mapInstanceRef.current = map;

        // OpenStreetMapの美しいタイルを読み込み
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        // 軌跡をシアンブルーで描画
        const polyline = L.polyline(coordinates, { color: '#0284c7', weight: 4, opacity: 0.8 }).addTo(map);

        // 軌跡の全体が見えるように自動ズーム調整
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      });
    }

    // クリーンアップ関数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates]);

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: 'clamp(4rem, 8vw, 6rem) 5%' }}>
      {/* LeafletのCSSを読み込み */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        
        <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1rem' }}>RTK GNSS Analysis</h2>
        <h3 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '200', letterSpacing: '0.1em', margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Edge Log Visualizer</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2', letterSpacing: '0.05em', marginBottom: '3rem' }}>
          NMEAフォーマットのGPSログ（.log / .txt）を解析し、ブラウザ上で軌跡を可視化します。<br />
        </p>

        {/* --- 専門家向け：セキュリティとエッジ処理の解説（リクエスト実装） --- */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid rgba(2, 132, 199, 0.2)', backgroundColor: 'rgba(255,255,255,0.7)', textAlign: 'left', marginBottom: '4rem' }}>
          <h4 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🔐</span> 究極のプライバシー保護設計（Edge-Parsed NMEA）
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.8', margin: 0 }}>
            測位ログは、対象者の移動経路を示す極めて機密性の高い情報です。本アプリケーションは、アップロードされたログを<strong>外部サーバーへ一切送信しません。</strong><br />
            HTML5の <code>FileReader API</code> を用いてユーザーのローカルメモリ上でテキストを展開し、ブラウザ（エッジ）内部のJavaScriptエンジンのみでNMEAセンテンスのデコードと座標変換を実行します。<br />
            これにより、通信傍受やサーバーでのデータ保存といった情報漏洩のリスクを物理的にゼロに抑え、高度なセキュリティ要件が求められるプロジェクトにおいても安全に軌跡の確認が可能です。
          </p>
        </div>

        {/* --- アップロードエリア --- */}
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
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>🛰️</div>
                  <p style={{ fontSize: '1.2rem', color: 'var(--accent)', letterSpacing: '0.1em' }}>NMEA Analyzing...</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '1rem' }}>📍</div>
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '0.1em', fontWeight: '300' }}>
                    NMEAログファイル (.log) をここにドロップ<br />
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>またはクリックしてファイルを選択</span>
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* --- 地図描画エリア --- */}
        {coordinates.length > 0 && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
              <p style={{ color: 'var(--text-main)', fontSize: '1rem', margin: 0 }}>
                ファイル: <strong style={{ color: 'var(--accent)' }}>{logInfo?.name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '1rem' }}>({logInfo?.points.toLocaleString()} プロット)</span>
              </p>
              <button onClick={resetApp} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', padding: '0.5rem 1.5rem', borderRadius: '50px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.3s ease' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = 'var(--text-main)'; }}>
                別のログを解析
              </button>
            </div>

            {/* ここに地図がレンダリングされます */}
            <div 
              ref={mapRef} 
              className="glass-card"
              style={{ width: '100%', height: '600px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', zIndex: 1 }}
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