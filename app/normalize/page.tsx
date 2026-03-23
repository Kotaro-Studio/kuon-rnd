"use client";
import React, { useState, useRef } from 'react';

export default function NormalizeAppPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const SECRET_PASSWORD = "kuon"; 

  type AppStep = 'upload' | 'select' | 'processing' | 'done';
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processedFileName, setProcessedFileName] = useState<string>("");
  const [processLog, setProcessLog] = useState<string>("");
  
  // ★ 3つの魔法のスイッチ状態
  const [invertPhase, setInvertPhase] = useState(false);
  const [applyEq, setApplyEq] = useState(false);
  const [applyReverb, setApplyReverb] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SECRET_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("パスワードが異なります。マイクに同梱されたカードをご確認ください。");
      setPasswordInput("");
    }
  };

  const glassButtonStyle = {
    display: 'inline-block',
    textDecoration: 'none',
    color: '#fff',
    fontSize: '13px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    backgroundColor: 'var(--accent)',
    border: 'none',
    padding: '1.2rem 3rem',
    borderRadius: '50px',
    boxShadow: '0 5px 15px rgba(2, 132, 199, 0.2)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  } as const;

  // ============================================================================
  // アルゴリズム：2パス・レンダリング（EQ/Reverb -> Normalize/Loudness）
  // ============================================================================
  const processAudio = async (mode: 'peak' | 'loudness') => {
    if (!selectedFile) return;
    
    setCurrentStep('processing');
    setDownloadUrl(null);
    setProcessLog("音響空間を解析・構築中...");

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const originalBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const numChannels = originalBuffer.numberOfChannels;
      const length = originalBuffer.length;
      const sampleRate = originalBuffer.sampleRate;

      // 【STEP 0】 位相反転（メモリ上で直接反転）
      if (invertPhase) {
        for (let c = 0; c < numChannels; c++) {
          const data = originalBuffer.getChannelData(c);
          for (let i = 0; i < length; i++) {
            data[i] = data[i] * -1;
          }
        }
      }

      let bufferForDynamics = originalBuffer;

      // 【パス1】 トーン・シェイピング（EQ ＆ リバーブ）
      if (applyEq || applyReverb) {
        setProcessLog("朝比奈シグネチャー・サウンドを適用中...");
        const toneContext = new OfflineAudioContext(numChannels, length, sampleRate);
        const toneSource = toneContext.createBufferSource();
        toneSource.buffer = originalBuffer;
        
        let currentNode: AudioNode = toneSource;

        // ★ 朝比奈幸太郎のEQ（ほんのわずかな隠し味）
        if (applyEq) {
          const lowCut = toneContext.createBiquadFilter();
          lowCut.type = 'lowshelf';
          lowCut.frequency.value = 80;  // 80Hz以下を
          lowCut.gain.value = -1.0;     // -1.0dBだけわずかにスッキリさせる

          const highBoost = toneContext.createBiquadFilter();
          highBoost.type = 'highshelf';
          highBoost.frequency.value = 10000; // 10kHz以上を
          highBoost.gain.value = 1.2;        // +1.2dBだけわずかに空気感を足す

          currentNode.connect(lowCut);
          lowCut.connect(highBoost);
          currentNode = highBoost;
        }

        // ★ 魔法のリバーブ（合唱の余韻をほんのわずかにリッチに）
        if (applyReverb) {
          const dryGain = toneContext.createGain();
          dryGain.gain.value = 1.0;

          const wetGain = toneContext.createGain();
          wetGain.gain.value = 0.06; // ★ ウェット音はたった6%（素人には気づかれないレベルの絶妙な空間）

          const convolver = toneContext.createConvolver();
          convolver.buffer = createReverbIR(toneContext, 1.8, 2.5); // 1.8秒の自然な減衰

          currentNode.connect(dryGain);
          currentNode.connect(convolver);
          convolver.connect(wetGain);

          dryGain.connect(toneContext.destination);
          wetGain.connect(toneContext.destination);
        } else {
          currentNode.connect(toneContext.destination);
        }

        toneSource.start();
        // EQとリバーブがかかった状態の波形を仮生成
        bufferForDynamics = await toneContext.startRendering();
      }


      // 【パス2】 ダイナミクス処理（Peak / Loudness）
      setProcessLog(mode === 'peak' ? "ピュア・ノーマライズを実行中..." : "ラウドネス最適化を実行中...");
      
      const dynContext = new OfflineAudioContext(numChannels, length, sampleRate);
      const dynSource = dynContext.createBufferSource();
      dynSource.buffer = bufferForDynamics;
      const gainNode = dynContext.createGain();

      if (mode === 'peak') {
        let maxPeak = 0;
        for (let c = 0; c < numChannels; c++) {
          const data = bufferForDynamics.getChannelData(c);
          for (let i = 0; i < length; i++) {
            const abs = Math.abs(data[i]);
            if (abs > maxPeak) maxPeak = abs;
          }
        }
        const targetPeak = Math.pow(10, -0.1 / 20); 
        gainNode.gain.value = maxPeak > 0 ? targetPeak / maxPeak : 1;

        dynSource.connect(gainNode);
        gainNode.connect(dynContext.destination);

      } else {
        let totalSumSquares = 0;
        for (let c = 0; c < numChannels; c++) {
          const data = bufferForDynamics.getChannelData(c);
          for (let i = 0; i < length; i++) totalSumSquares += data[i] * data[i];
        }
        const rms = Math.sqrt(totalSumSquares / (numChannels * length));
        
        const targetRms = Math.pow(10, -14 / 20); 
        let multiplier = rms > 0 ? targetRms / rms : 1;
        if (multiplier > 15) multiplier = 15; 

        gainNode.gain.value = multiplier;

        const limiter = dynContext.createDynamicsCompressor();
        limiter.threshold.value = -1.0; 
        limiter.knee.value = 0.0;
        limiter.ratio.value = 20.0;     
        limiter.attack.value = 0.005;
        limiter.release.value = 0.05;

        dynSource.connect(gainNode);
        gainNode.connect(limiter);
        limiter.connect(dynContext.destination);
      }

      dynSource.start();
      const finalBuffer = await dynContext.startRendering();
      
      // WAV変換と書き出し
      const wavBlob = audioBufferToWav(finalBuffer);
      const url = URL.createObjectURL(wavBlob);

      let suffix = "";
      if (invertPhase) suffix += "_phs";
      if (applyEq) suffix += "_eq";
      if (applyReverb) suffix += "_rev";
      suffix += mode === 'peak' ? "_peak" : "_loudness";
      
      setDownloadUrl(url);
      setProcessedFileName(selectedFile.name.replace(/\.[^/.]+$/, "") + suffix + ".wav");
      setProcessLog("すべての処理が完了しました。");
      setCurrentStep('done');

    } catch (error) {
      console.error(error);
      setProcessLog("エラーが発生しました。有効な音声ファイルかご確認ください。");
      setCurrentStep('select');
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentStep('select'); 
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
  };
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) handleFileSelect(e.target.files[0]);
  };
  const resetApp = () => {
    setSelectedFile(null);
    setDownloadUrl(null);
    setCurrentStep('upload');
    setInvertPhase(false);
    setApplyEq(false);
    setApplyReverb(false);
  };

  // --- スイッチのUIコンポーネント ---
  const ToggleSwitch = ({ label, description, state, setState }: { label: string, description: string, state: boolean, setState: (val: boolean) => void }) => (
    <div 
      onClick={() => setState(!state)}
      style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        padding: '1.2rem 2rem', borderRadius: '12px',
        backgroundColor: state ? 'rgba(2, 132, 199, 0.03)' : 'rgba(255,255,255,0.6)',
        border: `1px solid ${state ? 'rgba(2, 132, 199, 0.3)' : 'rgba(0,0,0,0.05)'}`,
        cursor: 'pointer', transition: 'all 0.3s ease', textAlign: 'left',
        width: '100%', maxWidth: '600px', margin: '0 auto 1rem auto'
      }}
    >
      <div style={{
        width: '44px', height: '24px', borderRadius: '24px', flexShrink: 0,
        backgroundColor: state ? 'var(--accent)' : '#e5e7eb',
        position: 'relative', transition: 'all 0.3s ease'
      }}>
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff',
          position: 'absolute', top: '3px', left: state ? '23px' : '3px',
          transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </div>
      <div>
        <div style={{ color: state ? 'var(--accent)' : 'var(--text-main)', fontSize: '1rem', fontWeight: '500', letterSpacing: '0.05em', transition: 'all 0.3s ease' }}>{label}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem', letterSpacing: '0.05em' }}>{description}</div>
      </div>
    </div>
  );

  // ============================================================================
  // 【画面A】パスワード入力画面
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5%' }}>
        <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '4rem 3rem', textAlign: 'center', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1rem' }}>Exclusive Tool</h2>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '200', letterSpacing: '0.1em', margin: '0 0 2rem 0', color: 'var(--text-main)' }}>Kuon Normalize App</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.8', letterSpacing: '0.05em', marginBottom: '3rem' }}>
            このアプリケーションは、空音開発の無指向性マイクロフォンをご購入いただいた方限定の専用ツールです。<br />製品に同梱されているパスワードをご入力ください。
          </p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Password を入力" style={{ width: '100%', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em', outlineColor: 'var(--accent)' }} />
            {errorMessage && <p style={{ color: '#e11d48', fontSize: '0.8rem', margin: '0' }}>{errorMessage}</p>}
            <button type="submit" style={glassButtonStyle}>Unlock Application</button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 【画面B】アプリ本体画面
  // ============================================================================
  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: 'clamp(4rem, 8vw, 6rem) 5%' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        
        <h2 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1rem' }}>Audio Engineering Tool</h2>
        <h3 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '200', letterSpacing: '0.1em', margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Pure Normalize</h3>
        
        {currentStep === 'upload' && (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2', letterSpacing: '0.05em', marginBottom: '4rem' }}>
              処理したいWAVまたはMP3ファイルを、下のエリアにドロップしてください。
            </p>
            <input type="file" ref={fileInputRef} onChange={onFileInputChange} accept="audio/*" style={{ display: 'none' }} />
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} 
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }} 
              onDrop={onDrop} 
              onClick={() => fileInputRef.current?.click()}
              className="glass-card" 
              style={{ 
                padding: '5rem 2rem', borderRadius: '16px', 
                border: `2px dashed ${isDragging ? 'var(--accent)' : 'rgba(2, 132, 199, 0.3)'}`,
                backgroundColor: isDragging ? 'rgba(2, 132, 199, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer', transition: 'all 0.3s ease', transform: isDragging ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '1rem' }}>🎙️</div>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '0.1em', fontWeight: '300' }}>
                音声ファイルをここにドロップ<br />
                <span style={{ fontSize: '0.8rem', color: '#888' }}>またはクリックしてファイルを選択</span>
              </p>
            </div>
          </>
        )}

        {currentStep === 'select' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '2.rem' }}>
              選択されたファイル: <strong>{selectedFile?.name}</strong>
            </p>

            {/* ★ 3つの魔法のスイッチ（縦並びで美しく配置） */}
            <div style={{ marginBottom: '3rem' }}>
              <ToggleSwitch 
                state={invertPhase} setState={setInvertPhase} 
                label="位相を反転する（逆相 → 正相）" 
                description="録音時の波形を正しい向きに補正します。" 
              />
              <ToggleSwitch 
                state={applyEq} setState={setApplyEq} 
                label="朝比奈シグネチャー EQ" 
                description="濁りをわずかに取り除き、空気感と輝きを自然に付加します。" 
              />
              <ToggleSwitch 
                state={applyReverb} setState={setApplyReverb} 
                label="ナチュラル・ホールリバーブ" 
                description="合唱や楽器の録音に、気付かないほど微小で美しい余韻を足します。" 
              />
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>最後に、出力の目的を選択して処理を開始します。</p>
            
            <div className="flex-responsive" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '3rem' }}>
              <div 
                onClick={() => processAudio('loudness')}
                className="glass-card"
                style={{ flex: '1', padding: '3rem 2rem', cursor: 'pointer', borderRadius: '16px', transition: 'all 0.3s ease', border: '1px solid rgba(0,0,0,0.05)' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(2, 132, 199, 0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎬</div>
                <h4 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '0.1em' }}>YouTube / Podcast用</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                  配信に最適な音量へ自動調整し、<br />音割れを防ぐリミッター処理を行います。
                </p>
              </div>

              <div 
                onClick={() => processAudio('peak')}
                className="glass-card"
                style={{ flex: '1', padding: '3rem 2rem', cursor: 'pointer', borderRadius: '16px', transition: 'all 0.3s ease', border: '1px solid rgba(0,0,0,0.05)' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(2, 132, 199, 0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎵</div>
                <h4 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '0.1em' }}>音楽編集用 (Pure Peak)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                  波形の比率（ダイナミクス）を保ち、<br />全体の最大ピークを -0.1dB に最適化します。
                </p>
              </div>
            </div>
            
            <button onClick={resetApp} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>
              別のファイルを選ぶ
            </button>
          </div>
        )}

        {currentStep === 'processing' && (
          <div style={{ padding: '5rem 0', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>⚙️</div>
            <p style={{ fontSize: '1.2rem', color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: '1rem' }}>Processing...</p>
            <p style={{ color: 'var(--text-muted)' }}>{processLog}</p>
          </div>
        )}

        {currentStep === 'done' && (
          <div style={{ padding: '3rem 0', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '0.1em', marginBottom: '2rem' }}>{processLog}</p>
            
            {downloadUrl && (
              <a href={downloadUrl} download={processedFileName} style={{ ...glassButtonStyle, backgroundColor: '#10b981', boxShadow: '0 5px 15px rgba(16, 185, 129, 0.2)', marginBottom: '2rem' }}>
                処理済みファイルを保存
              </a>
            )}
            <br />
            <button onClick={resetApp} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem', marginTop: '1rem' }}>
              続けて別のファイルを処理する
            </button>
          </div>
        )}

        {currentStep !== 'processing' && (
          <p style={{ marginTop: '4rem', fontSize: '0.8rem', color: '#aaa', letterSpacing: '0.05em' }}>
            ※処理はすべてお使いのブラウザ内部で行われます。データが外部サーバーに送信されることはありません。
          </p>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}} />
      </div>
    </div>
  );
}

// ============================================================================
// 補助関数：高品質なシンセティック・リバーブ（IR）の生成
// ============================================================================
function createReverbIR(context: BaseAudioContext, duration: number, decay: number) {
  const sampleRate = context.sampleRate;
  const length = sampleRate * duration;
  const impulse = context.createBuffer(2, length, sampleRate);
  for (let i = 0; i < 2; i++) {
    const channelData = impulse.getChannelData(i);
    for (let j = 0; j < length; j++) {
      // 指数関数的な減衰を持つホワイトノイズで空間の響きをシミュレート
      channelData[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
    }
  }
  return impulse;
}

// ============================================================================
// 補助関数：AudioBuffer を WAV に変換
// ============================================================================
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; 
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const bufferLength = buffer.length;
  const byteRate = sampleRate * blockAlign;
  const dataSize = bufferLength * blockAlign;
  const totalSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const offset = 44;
  const channelData = [];
  for (let i = 0; i < numChannels; i++) channelData.push(buffer.getChannelData(i));

  let pos = offset;
  for (let i = 0; i < bufferLength; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = channelData[channel][i];
      sample = Math.max(-1, Math.min(1, sample));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}