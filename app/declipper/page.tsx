'use client';

import React, { useCallback, useRef, useState } from 'react';
import { decodeWAV, encodeWAV, interpolateClip } from '../../utils/audioDSP';

type ProcessStatus = 'idle' | 'ready' | 'processing' | 'done' | 'error';

export default function DeclipperApp() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  const [upperThresh, setUpperThresh] = useState<number>(0.85);
  const [lowerThresh, setLowerThresh] = useState<number>(-0.95);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => {
      const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
      return newLogs.slice(-100); 
    });
    setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.wav')) {
      setupFile(selectedFile);
    } else if (selectedFile) {
      setStatus('error');
      addLog('❌ エラー: WAVファイルを選択してください。');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.wav')) {
      setupFile(droppedFile);
    } else {
      setStatus('error');
      addLog('❌ エラー: WAVファイルをドロップしてください。');
    }
  };

  // ファイルセットアップ共通処理（500MBの安全制限を追加）
  const setupFile = (validFile: File) => {
    const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
    
    setLogs([]); // ログをリセット
    
    if (validFile.size > MAX_FILE_SIZE) {
      const sizeMB = (validFile.size / 1024 / 1024).toFixed(1);
      setStatus('error');
      addLog(`❌ エラー: ファイルサイズが大きすぎます (${sizeMB} MB)。`);
      addLog(`💡 ブラウザのメモリ制限のため、500MB以内の長さに分割（1曲ずつ等）してから読み込んでください。`);
      return;
    }

    setFile(validFile);
    setStatus('ready');
    setProgress(0);
    setDownloadUrl(null);
    addLog(`ファイル読み込み完了: ${validFile.name} (${(validFile.size / 1024 / 1024).toFixed(2)} MB)`);
  };

  const processAudio = async (autoMode: boolean = false) => {
    if (!file) return;
    setStatus('processing');
    addLog('Soraoto DSP Engine を初期化中...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      addLog('ピュアWAVデコーダーで解析中...');
      const { channels, sampleRate, numChannels, totalSamples } = decodeWAV(arrayBuffer);
      const channelsData = channels;

      addLog(`デコード完了: ${sampleRate}Hz, ${numChannels}ch`);

      let currentUpper = upperThresh;
      let currentLower = lowerThresh;

      if (autoMode) {
        addLog('🤖 自動解析アルゴリズムを実行中...');
        let maxVal = -1.0;
        let minVal = 1.0;

        for (let c = 0; c < numChannels; c++) {
          const data = channelsData[c];
          for (let i = 0; i < totalSamples; i++) {
            if (data[i] > maxVal) maxVal = data[i];
            if (data[i] < minVal) minVal = data[i];
          }
        }
        
        currentUpper = Math.max(0.1, maxVal - 0.04);
        currentLower = Math.min(-0.1, minVal + 0.04);
        
        setUpperThresh(parseFloat(currentUpper.toFixed(3)));
        setLowerThresh(parseFloat(currentLower.toFixed(3)));
        
        addLog(`📊 解析完了: 最大ピーク[+${maxVal.toFixed(3)}] / 最小ピーク[${minVal.toFixed(3)}]`);
      }

      const chunkSize = 48000 * 2; 
      let totalClipCount = 0;

      for (let c = 0; c < numChannels; c++) {
        addLog(`>> チャンネル ${c + 1} の修復を開始...`);
        const channelData = channelsData[c];
        let channelClipCount = 0;

        for (let i = 0; i < totalSamples; i += chunkSize) {
          const endIdx = Math.min(i + chunkSize, totalSamples);
          let inClip = false;
          let clipStart = 0;

          for (let j = i; j < endIdx; j++) {
            const val = channelData[j];
            if (!inClip && (val > currentUpper || val < currentLower)) {
              inClip = true;
              clipStart = j;
            } else if (inClip && (val <= currentUpper && val >= currentLower)) {
              inClip = false;
              interpolateClip(channelData, clipStart, j);
              channelClipCount++;
              totalClipCount++;
            }
          }

          const currentProgress = Math.floor(((c * totalSamples + endIdx) / (numChannels * totalSamples)) * 100);
          setProgress(currentProgress);
          
          if (currentProgress % 10 === 0 && currentProgress !== 0) {
             addLog(`全体進捗: ${currentProgress}% 完了 (修復累計: ${totalClipCount}箇所)`);
          }
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      addLog('処理完了。32bit Float エンコードを実行中...');
      const wavBlob = encodeWAV(channelsData, sampleRate);
      const url = URL.createObjectURL(wavBlob);
      setDownloadUrl(url);
      
      setStatus('done');
      if (totalClipCount === 0) {
        addLog(`⚠️ 修復箇所が0でした。`);
      } else {
        addLog(`✨ 全自動修復が完了しました！ 総修復箇所: ${totalClipCount} 箇所`);
      }

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      addLog(`❌ エラーが発生しました: ${err.message}`);
    }
  };

  /* --- メインコンテンツ用のスタイル --- */
  const styles = {
    container: { backgroundColor: '#ffffff', color: '#333333', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    mainContent: { maxWidth: '800px', margin: '0 auto', padding: '60px 20px' },
    titleArea: { textAlign: 'center' as const, marginBottom: '50px' },
    subTitle: { color: '#8ab4f8', fontSize: '0.85rem', letterSpacing: '3px', fontWeight: 'bold', marginBottom: '15px' },
    mainTitle: { color: '#333', fontSize: '3rem', fontWeight: 300, margin: '0 0 15px 0', letterSpacing: '1px' },
    description: { color: '#666', fontSize: '0.95rem' },

    dropZone: { border: '1px dashed #b3d4ff', borderRadius: '8px', padding: '80px 20px', textAlign: 'center' as const, backgroundColor: '#f9fcff', cursor: 'pointer', marginBottom: '20px', transition: 'background-color 0.2s' },
    icon: { fontSize: '2.5rem', marginBottom: '15px', color: '#555' },
    dropTitle: { fontSize: '1.2rem', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
    dropSub: { fontSize: '0.85rem', color: '#888' },
    note: { textAlign: 'center' as const, fontSize: '0.75rem', color: '#aaa', marginTop: '15px' },

    panel: { backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', padding: '40px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' },
    slider: { flex: 1, margin: '0 20px', accentColor: '#3498db' },
    
    btnAuto: { width: '100%', padding: '16px', backgroundColor: '#3498db', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', marginBottom: '15px', transition: 'opacity 0.2s' },
    btnManual: { width: '100%', padding: '14px', backgroundColor: 'transparent', color: '#3498db', fontWeight: 'bold', border: '1px solid #3498db', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem' },
    btnSuccess: { width: '100%', padding: '16px', backgroundColor: '#2ecc71', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', textAlign: 'center' as const, display: 'block', textDecoration: 'none' },
    
    terminal: { backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px', padding: '20px', height: '220px', overflowY: 'auto' as const, color: '#555', fontSize: '0.85rem', fontFamily: 'monospace', lineHeight: 1.6 },
    progressBg: { width: '100%', height: '4px', backgroundColor: '#f0f0f0', marginTop: '15px', borderRadius: '2px' },
    progressFill: { height: '100%', backgroundColor: '#3498db', width: `${progress}%`, transition: 'width 0.2s', borderRadius: '2px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        
        <div style={styles.titleArea}>
          <div style={styles.subTitle}>AUDIO ENGINEERING TOOL</div>
          <h1 style={styles.mainTitle}>Asymmetrical Restorer</h1>
          <p style={styles.description}>
            処理したいWAVファイルを、下のエリアにドロップするか選択してください。
          </p>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".wav" 
          onChange={handleFileChange} 
        />

        {/* アイドル状態の時のみドロップゾーンを表示 */}
        {status === 'idle' && (
          <div>
            <div 
              style={styles.dropZone} 
              onDragOver={(e) => e.preventDefault()} 
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()} 
            >
              <div style={styles.icon}>🎙️</div>
              <h3 style={styles.dropTitle}>音声ファイルをここにドロップ</h3>
              <p style={styles.dropSub}>またはクリックしてファイルを選択</p>
            </div>
            <p style={styles.note}>※処理はすべてお使いのブラウザ内部で行われます。データが外部サーバーに送信されることはありません。</p>
          </div>
        )}

        {status === 'ready' && (
          <div style={styles.panel}>
            <button style={styles.btnAuto} onClick={() => processAudio(true)} onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
              自動解析して修復する (Auto Repair)
            </button>
            
            <div style={{ textAlign: 'center', margin: '25px 0', color: '#aaa', fontSize: '0.85rem' }}>または手動で閾値を微調整</div>

            <div style={styles.row}>
              <span style={{ width: '130px', color: '#555', fontSize: '0.9rem' }}>Upper (プラス側)</span>
              <input type="range" min="0.1" max="1.0" step="0.001" value={upperThresh} onChange={(e) => setUpperThresh(parseFloat(e.target.value))} style={styles.slider} />
              <span style={{ color: '#3498db', fontWeight: 'bold' }}>+{upperThresh.toFixed(3)}</span>
            </div>
            <div style={styles.row}>
              <span style={{ width: '130px', color: '#555', fontSize: '0.9rem' }}>Lower (マイナス側)</span>
              <input type="range" min="-1.0" max="-0.1" step="0.001" value={lowerThresh} onChange={(e) => setLowerThresh(parseFloat(e.target.value))} style={styles.slider} />
              <span style={{ color: '#3498db', fontWeight: 'bold' }}>{lowerThresh.toFixed(3)}</span>
            </div>
            <button style={styles.btnManual} onClick={() => processAudio(false)}>手動設定で処理を開始</button>
          </div>
        )}

        {/* 処理中、完了、エラー時にターミナルを表示 */}
        {(status === 'processing' || status === 'done' || status === 'error') && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>
              <span>SYSTEM LOG</span><span>{status === 'error' ? 'ERROR' : `${progress}%`}</span>
            </div>
            <div style={styles.terminal}>
              {logs.map((log, i) => <div key={i}>{log}</div>)}
              <div ref={logsEndRef} />
            </div>
            {status === 'processing' && (
              <div style={styles.progressBg}><div style={styles.progressFill}></div></div>
            )}
          </div>
        )}

        {/* 完了時のアクション */}
        {status === 'done' && downloadUrl && (
          <div style={{ marginTop: '30px' }}>
            <a href={downloadUrl} download={`Kuon_Restored.wav`} style={styles.btnSuccess}>
              修復済みWAVをダウンロード
            </a>
            <button 
              onClick={() => { setStatus('idle'); setFile(null); setLogs([]); }} 
              style={{...styles.btnManual, marginTop: '15px', border: 'none', color: '#888'}}
            >
              別のファイルを処理する
            </button>
          </div>
        )}

        {/* エラー時のアクション（ファイルを選び直すボタン） */}
        {status === 'error' && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button 
              onClick={() => { setStatus('idle'); setFile(null); setLogs([]); }} 
              style={{...styles.btnManual, border: '1px solid #e74c3c', color: '#e74c3c'}}
            >
              ↩ ファイルを選び直す
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
