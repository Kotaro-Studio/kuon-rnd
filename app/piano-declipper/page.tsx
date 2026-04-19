'use client';

import React, { useCallback, useRef, useState } from 'react';
import { decodeWAV, encodeWAV, interpolatePianoClip } from '../../utils/audioDSP_piano';
import { AuthGate } from '@/components/AuthGate';

type ProcessStatus = 'idle' | 'ready' | 'processing' | 'done' | 'error';

export default function PianoDeclipperApp() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  // スレッショルド
  const [upperThresh, setUpperThresh] = useState<number>(0.85);
  const [lowerThresh, setLowerThresh] = useState<number>(-0.95);
  
  // 【新機能】ピアノ専用パラメーター
  const [attackEnhance, setAttackEnhance] = useState<number>(1.1); // 1.0 = 標準, 1.1 = やや強調
  const [analogWarmth, setAnalogWarmth] = useState<number>(20); // 0〜100%

  const logsEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`].slice(-100));
    setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.wav')) setupFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.toLowerCase().endsWith('.wav')) setupFile(droppedFile);
  };

  const setupFile = (validFile: File) => {
    if (validFile.size > 500 * 1024 * 1024) {
      setStatus('error');
      addLog(`❌ エラー: ファイルが大きすぎます。500MB以内に分割してください。`);
      return;
    }
    setFile(validFile);
    setStatus('ready');
    setLogs([]);
    setProgress(0);
    setDownloadUrl(null);
    addLog(`ファイル読み込み完了: ${validFile.name}`);
  };

  const processAudio = async (autoMode: boolean = false) => {
    if (!file) return;
    setStatus('processing');
    addLog('🎹 Soraoto Pro - Piano DSP Engine を起動中...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { channels, sampleRate, numChannels, totalSamples } = decodeWAV(arrayBuffer);
      
      let currentUpper = upperThresh;
      let currentLower = lowerThresh;

      if (autoMode) {
        addLog('🤖 限界ピークを自動スキャン中...');
        let maxVal = -1.0, minVal = 1.0;
        for (let c = 0; c < numChannels; c++) {
          for (let i = 0; i < totalSamples; i++) {
            if (channels[c][i] > maxVal) maxVal = channels[c][i];
            if (channels[c][i] < minVal) minVal = channels[c][i];
          }
        }
        currentUpper = Math.max(0.1, maxVal - 0.04);
        currentLower = Math.min(-0.1, minVal + 0.04);
        setUpperThresh(parseFloat(currentUpper.toFixed(3)));
        setLowerThresh(parseFloat(currentLower.toFixed(3)));
        addLog(`👉 スレッショルド自動設定: Upper +${currentUpper.toFixed(3)}, Lower ${currentLower.toFixed(3)}`);
      }

      addLog(`🎛️ 適用パラメーター: Attack x${attackEnhance.toFixed(2)}, Warmth ${analogWarmth}%`);
      const warmthValue = analogWarmth / 100; // 0.0 ~ 1.0に変換

      const chunkSize = 48000 * 2; 
      let totalClipCount = 0;

      for (let c = 0; c < numChannels; c++) {
        addLog(`>> チャンネル ${c + 1}: 修復処理を開始...`);
        const channelData = channels[c];

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
              // ★ ピアノ専用アルゴリズムに全パラメーターを渡す
              interpolatePianoClip(channelData, clipStart, j, attackEnhance, warmthValue);
              totalClipCount++;
            }
          }
          setProgress(Math.floor(((c * totalSamples + endIdx) / (numChannels * totalSamples)) * 100));
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      addLog('処理完了。32bit Float エンコードを実行中...');
      const url = URL.createObjectURL(encodeWAV(channels, sampleRate));
      setDownloadUrl(url);
      setStatus('done');
      addLog(`✨ ピアノ専用修復が完了しました！ (修復箇所: ${totalClipCount})`);

    } catch (err: any) {
      setStatus('error');
      addLog(`❌ エラー: ${err.message}`);
    }
  };

  const styles = {
    container: { backgroundColor: '#ffffff', color: '#333333', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    mainContent: { maxWidth: '800px', margin: '0 auto', padding: '60px 20px' },
    titleArea: { textAlign: 'center' as const, marginBottom: '40px' },
    subTitle: { color: '#c9a063', fontSize: '0.85rem', letterSpacing: '3px', fontWeight: 'bold', marginBottom: '15px' },
    mainTitle: { color: '#333', fontSize: '2.8rem', fontWeight: 300, margin: '0 0 15px 0', letterSpacing: '1px' },
    description: { color: '#666', fontSize: '0.95rem' },
    dropZone: { border: '1px dashed #c9a063', borderRadius: '8px', padding: '60px 20px', textAlign: 'center' as const, backgroundColor: '#fffdf8', cursor: 'pointer', marginBottom: '20px' },
    
    // パネルデザイン
    panel: { backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', padding: '35px', marginBottom: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
    sectionTitle: { fontSize: '1rem', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '20px' },
    row: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
    slider: { flex: 1, margin: '0 20px', accentColor: '#c9a063' },
    label: { width: '150px', color: '#555', fontSize: '0.9rem' },
    valueBox: { width: '60px', textAlign: 'right' as const, color: '#c9a063', fontWeight: 'bold', fontSize: '0.95rem' },
    
    btnAuto: { width: '100%', padding: '16px', backgroundColor: '#1a2a3a', color: '#c9a063', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', marginBottom: '15px' },
    btnManual: { width: '100%', padding: '14px', backgroundColor: 'transparent', color: '#1a2a3a', fontWeight: 'bold', border: '1px solid #1a2a3a', borderRadius: '6px', cursor: 'pointer', fontSize: '0.95rem' },
    btnSuccess: { width: '100%', padding: '16px', backgroundColor: '#c9a063', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', textAlign: 'center' as const, display: 'block', textDecoration: 'none' },
    terminal: { backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px', padding: '20px', height: '200px', overflowY: 'auto' as const, color: '#555', fontSize: '0.85rem', fontFamily: 'monospace' },
    progressBg: { width: '100%', height: '4px', backgroundColor: '#f0f0f0', marginTop: '15px' },
    progressFill: { height: '100%', backgroundColor: '#c9a063', width: `${progress}%`, transition: 'width 0.2s' }
  };

  return (
    <AuthGate appName="piano-declipper">
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <div style={styles.titleArea}>
          <div style={styles.subTitle}>SORAOTO PRO - PIANO EDITION</div>
          <h1 style={styles.mainTitle}>Piano Declipper</h1>
          <p style={styles.description}>打鍵感の復元とアナログ倍音マスキングを搭載した、ピアノ特化の波形修復ツール。</p>
        </div>

        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".wav" onChange={handleFileChange} />

        {status === 'idle' && (
          <div style={styles.dropZone} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎹</div>
            <h3 style={{ fontSize: '1.2rem', color: '#333', margin: '0 0 8px 0' }}>音声ファイルをここにドロップ</h3>
          </div>
        )}

        {status === 'ready' && (
          <div style={styles.panel}>
            <div style={styles.sectionTitle}>1. ピアノ専用マスタリング調整</div>
            
            <div style={styles.row}>
              <span style={styles.label}>打鍵感の復元 (Attack)</span>
              <input type="range" min="0.8" max="2.0" step="0.05" value={attackEnhance} onChange={(e) => setAttackEnhance(parseFloat(e.target.value))} style={styles.slider} />
              <span style={styles.valueBox}>x{attackEnhance.toFixed(2)}</span>
            </div>
            
            <div style={styles.row}>
              <span style={styles.label}>倍音付加 (Warmth)</span>
              <input type="range" min="0" max="100" step="1" value={analogWarmth} onChange={(e) => setAnalogWarmth(parseFloat(e.target.value))} style={styles.slider} />
              <span style={styles.valueBox}>{analogWarmth}%</span>
            </div>

            <div style={{...styles.sectionTitle, marginTop: '40px'}}>2. 修復範囲（スレッショルド）</div>

            <button style={styles.btnAuto} onClick={() => processAudio(true)}>
              🤖 自動解析 ＆ 修復を実行
            </button>
            <div style={{ textAlign: 'center', margin: '15px 0', color: '#aaa', fontSize: '0.85rem' }}>または手動で閾値を微調整</div>
            <div style={styles.row}>
              <span style={styles.label}>Upper (プラス側)</span>
              <input type="range" min="0.1" max="1.0" step="0.001" value={upperThresh} onChange={(e) => setUpperThresh(parseFloat(e.target.value))} style={styles.slider} />
              <span style={styles.valueBox}>+{upperThresh.toFixed(3)}</span>
            </div>
            <div style={styles.row}>
              <span style={styles.label}>Lower (マイナス側)</span>
              <input type="range" min="-1.0" max="-0.1" step="0.001" value={lowerThresh} onChange={(e) => setLowerThresh(parseFloat(e.target.value))} style={styles.slider} />
              <span style={styles.valueBox}>{lowerThresh.toFixed(3)}</span>
            </div>
            <button style={styles.btnManual} onClick={() => processAudio(false)}>手動設定で処理を開始</button>
          </div>
        )}

        {(status === 'processing' || status === 'done' || status === 'error') && (
          <div>
            <div style={styles.terminal}>
              {logs.map((log, i) => <div key={i}>{log}</div>)}
              <div ref={logsEndRef} />
            </div>
            {status === 'processing' && (
              <div style={styles.progressBg}><div style={styles.progressFill}></div></div>
            )}
          </div>
        )}

        {status === 'done' && downloadUrl && (
          <div style={{ marginTop: '30px' }}>
            <a href={downloadUrl} download={`SoraotoPro_Piano.wav`} style={styles.btnSuccess}>修復済みWAVをダウンロード</a>
            <button onClick={() => { setStatus('idle'); setFile(null); setLogs([]); }} style={{...styles.btnManual, marginTop: '15px', border: 'none', color: '#888'}}>別のファイルを処理する</button>
          </div>
        )}
      </div>
    </div>
    </AuthGate>
  );
}
