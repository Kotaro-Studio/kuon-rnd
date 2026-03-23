"use client";
import React, { useState, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type ElevationData = {
  time: string;
  elevation: number;
};

export default function GpsElevationPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logInfo, setLogInfo] = useState<{ name: string, points: number, max: number, min: number } | null>(null);
  const [chartData, setChartData] = useState<ElevationData[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // アルゴリズム：NMEA 0183 ($GPGGA) から標高データのみをエッジ抽出
  // ============================================================================
  const processNmeaLog = (file: File) => {
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const parsedData: ElevationData[] = [];
      let maxElev = -Infinity;
      let minElev = Infinity;

      lines.forEach(line => {
        // 標高（Z軸）データが含まれるのは $GPGGA センテンスのみ
        if (line.startsWith('$GPGGA')) {
          const parts = line.split(',');
          // $GPGGAの10番目(index 9)が海抜高度（メートル）
          if (parts.length > 9 && parts[9] !== '') {
            const timeRaw = parts[1]; // hhmmss.ss
            const elevation = parseFloat(parts[9]);

            if (!isNaN(elevation) && timeRaw.length >= 6) {
              // 時間を hh:mm:ss 形式に整形
              const formattedTime = `${timeRaw.substring(0,2)}:${timeRaw.substring(2,4)}:${timeRaw.substring(4,6)}`;
              
              parsedData.push({ time: formattedTime, elevation });
              
              if (elevation > maxElev) maxElev = elevation;
              if (elevation < minElev) minElev = elevation;
            }
          }
        }
      });

      // データを時間順にセット
      setChartData(parsedData);
      setLogInfo({ 
        name: file.name, 
        points: parsedData.length,
        max: maxElev !== -Infinity ? parseFloat(maxElev.toFixed(3)) : 0,
        min: minElev !== Infinity ? parseFloat(minElev.toFixed(3)) : 0
      });
      setIsProcessing(false);
    };

    reader.onerror = () => {
      alert("ファイルの読み込みに失敗しました。");
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  // --- ドラッグ＆ドロップイベント ---
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
    setChartData([]);
    setLogInfo(null);
  };

  // グラフのTooltipを美しくカスタマイズ
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '1rem', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', backdropFilter: 'blur(5px)' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>時刻: {label}</p>
          <p style={{ margin: 0, color: 'var(--accent)', fontSize: '1.2rem', fontWeight: '500' }}>
            標高 {payload[0].value.toFixed(3)} <span style={{ fontSize: '0.8rem' }}>m</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: 'clamp(4rem, 8vw, 6rem) 5%' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        
        <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1rem' }}>RTK GNSS Analysis</h2>
        <h3 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '200', letterSpacing: '0.1em', margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Z-Axis Micro Profiler</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2', letterSpacing: '0.05em', marginBottom: '3rem' }}>
          RTK測位の圧倒的な精度を可視化します。<br />NMEAログからZ軸（標高）データのみを抽出し、数センチ単位の起伏を断面図としてエッジレンダリングします。
        </p>

        {/* --- アップロードエリア --- */}
        {chartData.length === 0 && (
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
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>🏔️</div>
                  <p style={{ fontSize: '1.2rem', color: 'var(--accent)', letterSpacing: '0.1em' }}>Extracting Z-Axis...</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '1rem' }}>📈</div>
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '0.1em', fontWeight: '300' }}>
                    NMEAログファイル (.log) をここにドロップ<br />
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>またはクリックしてファイルを選択</span>
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* --- グラフ描画エリア --- */}
        {chartData.length > 0 && logInfo && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', padding: '0 1rem', textAlign: 'left' }}>
              <div>
                <p style={{ color: 'var(--text-main)', fontSize: '1rem', margin: '0 0 0.5rem 0' }}>
                  解析ファイル: <strong style={{ color: 'var(--accent)' }}>{logInfo.name}</strong>
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>データ数: <strong>{logInfo.points.toLocaleString()}</strong> point</span>
                  <span>最高標高: <strong>{logInfo.max}</strong> m</span>
                  <span>最低標高: <strong>{logInfo.min}</strong> m</span>
                  <span>標高差 (ΔZ): <strong style={{ color: 'var(--accent)' }}>{(logInfo.max - logInfo.min).toFixed(3)}</strong> m</span>
                </div>
              </div>
              <button onClick={resetApp} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', padding: '0.6rem 1.5rem', borderRadius: '50px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.3s ease' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = 'var(--text-main)'; }}>
                別のログを解析
              </button>
            </div>

            {/* Rechartsによる美しいエリアグラフ */}
            <div className="glass-card" style={{ padding: '2rem 1rem 1rem 0', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.8)' }}>
              <ResponsiveContainer width="100%" height={500}>
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: '#888' }} 
                    tickMargin={10} 
                    minTickGap={50} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    domain={['dataMin - 0.5', 'dataMax + 0.5']} // 変化を強調するために上下の余白を狭く設定
                    tick={{ fontSize: 12, fill: '#888' }} 
                    tickFormatter={(value) => value.toFixed(1)}
                    axisLine={false} 
                    tickLine={false} 
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="elevation" 
                    stroke="#0284c7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorElevation)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#0284c7' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#aaa', letterSpacing: '0.05em', textAlign: 'right' }}>
              ※表示されている高さは、NMEA $GPGGAセンテンスより抽出されたアンテナの海抜高度（Orthometric height）です。
            </p>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}} />
      </div>
    </div>
  );
}