'use client';

import React, { useCallback, useRef, useState } from 'react';

/* ─── THEME ─── */
const C = {
  bg:          '#fafafa',
  bgCard:      'rgba(255,255,255,0.8)',
  border:      'rgba(0,0,0,0.07)',
  accent:      '#0284c7',
  accentLight: 'rgba(2,132,199,0.08)',
  accentGlow:  'rgba(2,132,199,0.25)',
  ink:         '#1a202c',
  inkMid:      '#4a5568',
  inkMuted:    '#94a3b8',
  green:       '#10b981',
  red:         '#ef4444',
  white:       '#ffffff',
};

type Step = 'upload' | 'select' | 'processing' | 'done';
type Mode = 'dual' | 'pseudo';

/* ─── WAV EXPORT ─── */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate  = buffer.sampleRate;
  const bitDepth    = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign  = numChannels * bytesPerSample;
  const dataSize    = buffer.length * blockAlign;
  const ab          = new ArrayBuffer(44 + dataSize);
  const view        = new DataView(ab);
  const ws = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  ws(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
  ws(8, 'WAVE'); ws(12, 'fmt ');
  view.setUint32(16, 16, true);   view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true); view.setUint16(34, bitDepth, true);
  ws(36, 'data'); view.setUint32(40, dataSize, true);
  let pos = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      pos += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

/* ─── CONVERSION FUNCTIONS ─── */

// モード①: 完全なデュアルモノ（L=R=同一信号）
function convertDualMono(input: AudioBuffer): AudioBuffer {
  const sr  = input.sampleRate;
  const len = input.length;
  const mono = input.getChannelData(0);
  const out = new AudioBuffer({ numberOfChannels: 2, length: len, sampleRate: sr });
  out.copyToChannel(new Float32Array(mono), 0);
  out.copyToChannel(new Float32Array(mono), 1);
  return out;
}

// モード②: 擬似ステレオ（Haas効果 + 位相差）
function convertPseudoStereo(input: AudioBuffer, width: number): AudioBuffer {
  const sr     = input.sampleRate;
  const len    = input.length;
  const mono   = input.getChannelData(0);

  // Haas効果: 右チャンネルに最大30msの遅延
  const maxDelaySamples = Math.floor(sr * 0.03 * width);

  const left  = new Float32Array(len);
  const right = new Float32Array(len);

  for (let i = 0; i < len; i++) {
    left[i] = mono[i];
    // 右チャンネルは遅延 + わずかな位相回転
    const delayedIdx = i - maxDelaySamples;
    const delayedSample = delayedIdx >= 0 ? mono[delayedIdx] : 0;
    // 位相回転（コム効果を避けるため小さく）
    const phaseShift = Math.sin(i * 0.0001 * width);
    right[i] = delayedSample * (1 - width * 0.1) + phaseShift * mono[i] * width * 0.05;
  }

  // widthに応じてMid/Side比率を調整
  const midGain = 1.0;
  const sideGain = width * 0.7;
  const outLeft  = new Float32Array(len);
  const outRight = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const mid  = (left[i] + right[i]) / 2;
    const side = (left[i] - right[i]) / 2;
    outLeft[i]  = mid * midGain + side * sideGain;
    outRight[i] = mid * midGain - side * sideGain;
  }

  const out = new AudioBuffer({ numberOfChannels: 2, length: len, sampleRate: sr });
  out.copyToChannel(outLeft,  0);
  out.copyToChannel(outRight, 1);
  return out;
}

/* ─── MAIN COMPONENT ─── */
export default function DualMonoPage() {
  const [step,       setStep]       = useState<Step>('upload');
  const [file,       setFile]       = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [warning,    setWarning]    = useState('');
  const [audioBuffer,setAudioBuffer]= useState<AudioBuffer | null>(null);
  const [mode,       setMode]       = useState<Mode | null>(null);
  const [width,      setWidth]      = useState(0.5);
  const [isPlaying,  setIsPlaying]  = useState(false);
  const [downloadUrl,setDownloadUrl]= useState('');
  const [outName,    setOutName]    = useState('');

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const fontStack = '"Space Grotesk","Noto Sans JP","Helvetica Neue",Arial,sans-serif';

  /* ── file handler ── */
  const handleFile = useCallback(async (f: File) => {
    setWarning('');
    const arr     = await f.arrayBuffer();
    const tmpCtx  = new AudioContext();
    const decoded = await tmpCtx.decodeAudioData(arr);
    await tmpCtx.close();

    if (decoded.numberOfChannels > 1) {
      setWarning('ステレオファイルが検出されました。モノラルファイルのみ対応しています。');
      return;
    }

    setFile(f);
    setAudioBuffer(decoded);
    setStep('select');
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  /* ── preview ── */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }
    if (!audioBuffer) return;
    const ctx = new AudioContext();
    const src = ctx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(ctx.destination);
    src.start();
    src.onended = () => setIsPlaying(false);
    audioSourceRef.current = src;
    setIsPlaying(true);
  }, [isPlaying, audioBuffer]);

  /* ── process ── */
  const process = useCallback(async () => {
    if (!audioBuffer || !mode) return;
    setStep('processing');
    await new Promise(r => setTimeout(r, 50));

    const result = mode === 'dual'
      ? convertDualMono(audioBuffer)
      : convertPseudoStereo(audioBuffer, width);

    const blob = audioBufferToWav(result);
    const url  = URL.createObjectURL(blob);
    const base = file?.name.replace(/\.[^.]+$/, '') ?? 'output';
    const suffix = mode === 'dual' ? '_dual-mono' : `_pseudo-stereo_w${Math.round(width * 100)}`;
    setDownloadUrl(url);
    setOutName(`${base}${suffix}.wav`);
    setStep('done');
  }, [audioBuffer, mode, width, file]);

  /* ── reset ── */
  const reset = useCallback(() => {
    setStep('upload');
    setFile(null);
    setAudioBuffer(null);
    setMode(null);
    setWidth(0.5);
    setDownloadUrl('');
    setOutName('');
    setWarning('');
  }, []);

  /* ── card style ── */
  const card: React.CSSProperties = {
    background:   C.bgCard,
    border:       `1px solid ${C.border}`,
    borderRadius: '16px',
    padding:      '2rem',
  };

  const sliderStyle: React.CSSProperties = {
    width:      '100%',
    appearance: 'none' as const,
    height:     '4px',
    borderRadius: '2px',
    background: `linear-gradient(to right, ${C.accent} ${width * 100}%, #e2e8f0 ${width * 100}%)`,
    outline:    'none',
    cursor:     'pointer',
  };

  /* ── render ── */
  return (
    <div style={{ backgroundColor: C.bg, minHeight: '100vh', fontFamily: fontStack, padding: 'clamp(2rem,6vw,4rem) 5%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: ${C.accent};
          cursor: pointer;
          box-shadow: 0 2px 6px ${C.accentGlow};
        }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-2px); }
        .mode-card:hover { border-color: ${C.accent} !important; background: ${C.accentLight} !important; }
        .mode-card.selected { border-color: ${C.accent} !important; background: ${C.accentLight} !important; }
        .btn-ghost:hover { background: ${C.accentLight} !important; color: ${C.accent} !important; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '4px', color: C.accent, textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 500 }}>
            Kuon R&D — Audio Tool
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, letterSpacing: '-1.5px', color: C.ink, margin: '0 0 0.5rem' }}>
            Dual Mono Converter
          </h1>
          <p style={{ color: C.inkMuted, fontSize: '0.95rem', margin: 0 }}>
            モノラル音声をデュアルモノ / 擬似ステレオに変換
          </p>
        </div>

        {/* ── UPLOAD ── */}
        {step === 'upload' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <input ref={fileInputRef} type="file" accept="audio/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                ...card,
                padding:    '6rem 2rem',
                textAlign:  'center',
                border:     `2px dashed ${isDragging ? C.accent : 'rgba(2,132,199,0.3)'}`,
                background: isDragging ? C.accentLight : C.bgCard,
                cursor:     'pointer',
                transition: 'all 0.2s',
                transform:  isDragging ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
              <div style={{ fontWeight: 600, color: C.ink, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                モノラル音声ファイルをドロップ
              </div>
              <div style={{ color: C.inkMuted, fontSize: '0.85rem' }}>
                WAV / MP3 — またはクリックして選択
              </div>
            </div>

            {/* warning */}
            {warning && (
              <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: `1px solid rgba(239,68,68,0.25)`, color: C.red, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>⚠️</span><span>{warning}</span>
              </div>
            )}

            <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: C.inkMuted }}>
              ※ 処理はすべてブラウザ内で完結します。音声データが外部に送信されることはありません。
            </p>
          </div>
        )}

        {/* ── SELECT MODE ── */}
        {step === 'select' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>

            {/* file info */}
            <div style={{ ...card, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🎵</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: C.ink, fontSize: '0.95rem' }}>{file?.name}</div>
                <div style={{ color: C.inkMuted, fontSize: '0.78rem', marginTop: '2px' }}>
                  モノラル · {audioBuffer ? (audioBuffer.sampleRate / 1000).toFixed(1) : '--'} kHz
                </div>
              </div>
              <button onClick={togglePlay} className="btn-ghost"
                style={{ padding: '8px 18px', borderRadius: '100px', border: `1px solid ${C.border}`, background: C.white, color: C.inkMid, cursor: 'pointer', fontSize: '0.85rem', fontFamily: fontStack, transition: 'all 0.2s' }}>
                {isPlaying ? '⏸ 停止' : '▶ 再生'}
              </button>
              <button onClick={reset} className="btn-ghost"
                style={{ padding: '8px 12px', borderRadius: '100px', border: `1px solid ${C.border}`, background: C.white, color: C.inkMuted, cursor: 'pointer', fontSize: '0.85rem', fontFamily: fontStack, transition: 'all 0.2s' }}>
                ✕
              </button>
            </div>

            {/* mode cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

              {/* Dual Mono */}
              <div
                className={`mode-card${mode === 'dual' ? ' selected' : ''}`}
                onClick={() => setMode('dual')}
                style={{
                  ...card,
                  cursor:     'pointer',
                  transition: 'all 0.2s',
                  borderColor: mode === 'dual' ? C.accent : C.border,
                  background:  mode === 'dual' ? C.accentLight : C.bgCard,
                  position:   'relative',
                }}
              >
                {mode === 'dual' && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '20px', height: '20px', borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: C.white }}>✓</div>
                )}
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔊</div>
                <div style={{ fontWeight: 700, color: C.ink, fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Dual Mono
                </div>
                <div style={{ color: C.inkMuted, fontSize: '0.8rem', lineHeight: 1.6 }}>
                  L・R両チャンネルに同一の信号を配置します。位相は完全に一致します。
                </div>
                <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.03)', fontSize: '0.72rem', color: C.inkMuted, fontFamily: 'monospace' }}>
                  L = mono<br />R = mono
                </div>
              </div>

              {/* Pseudo Stereo */}
              <div
                className={`mode-card${mode === 'pseudo' ? ' selected' : ''}`}
                onClick={() => setMode('pseudo')}
                style={{
                  ...card,
                  cursor:     'pointer',
                  transition: 'all 0.2s',
                  borderColor: mode === 'pseudo' ? C.accent : C.border,
                  background:  mode === 'pseudo' ? C.accentLight : C.bgCard,
                  position:   'relative',
                }}
              >
                {mode === 'pseudo' && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: '20px', height: '20px', borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: C.white }}>✓</div>
                )}
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎧</div>
                <div style={{ fontWeight: 700, color: C.ink, fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Pseudo Stereo
                </div>
                <div style={{ color: C.inkMuted, fontSize: '0.8rem', lineHeight: 1.6 }}>
                  Haas効果とMS処理でステレオ感を演出します。広がりの強さを調整できます。
                </div>
                <div style={{ marginTop: '1rem', padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(0,0,0,0.03)', fontSize: '0.72rem', color: C.inkMuted, fontFamily: 'monospace' }}>
                  L = mono<br />R = mono + delay + phase
                </div>
              </div>
            </div>

            {/* width slider — pseudo stereo only */}
            {mode === 'pseudo' && (
              <div style={{ ...card, marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: C.ink, fontSize: '0.95rem' }}>ステレオ幅</div>
                    <div style={{ color: C.inkMuted, fontSize: '0.78rem', marginTop: '2px' }}>
                      値が大きいほど広がりが強くなります。やりすぎると不自然になります。
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: C.accent, fontSize: '1.1rem', flexShrink: 0, marginLeft: '1rem' }}>
                    {Math.round(width * 100)}%
                  </div>
                </div>
                <input type="range" min={0.1} max={1} step={0.01} value={width}
                  onChange={e => setWidth(Number(e.target.value))}
                  style={sliderStyle} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: C.inkMuted, marginTop: '4px' }}>
                  <span>狭い</span><span>広い</span>
                </div>
              </div>
            )}

            {/* process button */}
            <button
              onClick={process}
              disabled={!mode}
              className="btn-primary"
              style={{
                width:        '100%',
                padding:      '1.1rem',
                borderRadius: '12px',
                border:       'none',
                background:   mode ? C.accent : '#e2e8f0',
                color:        mode ? C.white : C.inkMuted,
                fontWeight:   700,
                fontSize:     '1rem',
                cursor:       mode ? 'pointer' : 'not-allowed',
                fontFamily:   fontStack,
                letterSpacing:'0.5px',
                transition:   'all 0.2s',
              }}
            >
              {mode === 'dual'   ? 'Dual Mono に変換'       :
               mode === 'pseudo' ? 'Pseudo Stereo に変換'   :
               'モードを選択してください'}
            </button>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '6rem 0', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ width: '40px', height: '40px', border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
            <div style={{ color: C.ink, fontWeight: 600 }}>変換処理中...</div>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ ...card, textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: C.ink, marginBottom: '0.5rem' }}>変換完了</div>
              <div style={{ color: C.inkMuted, fontSize: '0.85rem', marginBottom: '1.5rem' }}>{outName}</div>
              <a href={downloadUrl} download={outName} className="btn-primary"
                style={{ display: 'inline-block', padding: '0.9rem 2.5rem', borderRadius: '100px', background: C.green, color: C.white, fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem', transition: 'all 0.2s' }}>
                ⬇ WAVをダウンロード
              </a>
            </div>

            <button onClick={() => { setStep('select'); setDownloadUrl(''); }}
              style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1px solid ${C.border}`, background: C.white, color: C.inkMid, cursor: 'pointer', fontSize: '0.9rem', fontFamily: fontStack, marginBottom: '0.5rem', transition: 'all 0.2s' }}>
              モードを変えて再変換
            </button>
            <button onClick={reset}
              style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'none', color: C.inkMuted, cursor: 'pointer', fontSize: '0.85rem', fontFamily: fontStack, transition: 'all 0.2s' }}>
              別のファイルを変換する
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
