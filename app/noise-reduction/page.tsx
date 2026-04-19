'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AuthGate } from '@/components/AuthGate';

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
  yellow:      '#f59e0b',
  white:       '#ffffff',
};

/* ─── TYPES ─── */
type Step = 'upload' | 'analyze' | 'adjust' | 'processing' | 'done';

/* ─── HELPERS ─── */
function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatHz(hz: number): string {
  return hz >= 1000 ? `${(hz / 1000).toFixed(1)}k` : `${Math.round(hz)}`;
}

/* ─── SPECTRUM ANALYZER ─── */
function drawSpectrum(
  canvas: HTMLCanvasElement,
  magnitudes: Float32Array,
  noiseFloor: Float32Array,
  sampleRate: number,
  strength: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);

  // grid lines
  const freqLabels = [100, 500, 1000, 5000, 10000, 20000];
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  freqLabels.forEach(freq => {
    const x = freqToX(freq, sampleRate, W);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px monospace';
    ctx.fillText(formatHz(freq), x + 2, H - 4);
  });

  // dB grid
  for (let db = -80; db <= 0; db += 20) {
    const y = dbToY(db, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '10px monospace';
    ctx.fillText(`${db}dB`, 2, y - 2);
  }

  const binCount = magnitudes.length;

  // noise floor area (removed zone)
  ctx.beginPath();
  for (let i = 0; i < binCount; i++) {
    const x = binToX(i, binCount, sampleRate, W);
    const noiseDb = noiseFloor[i];
    const threshold = noiseDb + strength * 30;
    const y = dbToY(Math.min(0, threshold), H);
    if (i === 0) ctx.moveTo(x, H);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = 'rgba(239,68,68,0.12)';
  ctx.fill();

  // noise floor line
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(239,68,68,0.6)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < binCount; i++) {
    const x = binToX(i, binCount, sampleRate, W);
    const noiseDb = noiseFloor[i];
    const threshold = noiseDb + strength * 30;
    const y = dbToY(Math.min(0, threshold), H);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // spectrum (original)
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(2,132,199,0.9)');
  grad.addColorStop(0.5, 'rgba(2,132,199,0.6)');
  grad.addColorStop(1, 'rgba(2,132,199,0.2)');

  ctx.beginPath();
  for (let i = 0; i < binCount; i++) {
    const x = binToX(i, binCount, sampleRate, W);
    const y = dbToY(magnitudes[i], H);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // spectrum line
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(2,132,199,1)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < binCount; i++) {
    const x = binToX(i, binCount, sampleRate, W);
    const y = dbToY(magnitudes[i], H);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function freqToX(freq: number, sampleRate: number, W: number): number {
  const nyquist = sampleRate / 2;
  return (Math.log10(freq) - Math.log10(20)) / (Math.log10(nyquist) - Math.log10(20)) * W;
}

function binToX(bin: number, binCount: number, sampleRate: number, W: number): number {
  const nyquist = sampleRate / 2;
  const freq = Math.max(20, (bin / binCount) * nyquist);
  return freqToX(freq, sampleRate, W);
}

function dbToY(db: number, H: number): number {
  const minDb = -90;
  const maxDb = 0;
  return H - ((db - minDb) / (maxDb - minDb)) * H;
}

/* ─── SPECTRAL SUBTRACTION ─── */
function applySpectralSubtraction(
  inputBuffer: AudioBuffer,
  noiseFloor: Float32Array,
  strength: number,
  smoothing: number
): AudioBuffer {
  const numChannels = inputBuffer.numberOfChannels;
  const sampleRate = inputBuffer.sampleRate;
  const frameSize = 2048;
  const hopSize = frameSize / 4;
  const outputBuffer = new AudioBuffer({
    numberOfChannels: numChannels,
    length: inputBuffer.length,
    sampleRate,
  });

  for (let ch = 0; ch < numChannels; ch++) {
    const input = inputBuffer.getChannelData(ch);
    const output = new Float32Array(input.length);
    const overlap = new Float32Array(input.length);

    // Hann window
    const window = new Float32Array(frameSize);
    for (let i = 0; i < frameSize; i++) {
      window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / frameSize));
    }

    let prevMag = new Float32Array(frameSize / 2 + 1);

    for (let pos = 0; pos < input.length; pos += hopSize) {
      const frame = new Float32Array(frameSize);
      for (let i = 0; i < frameSize; i++) {
        frame[i] = (pos + i < input.length ? input[pos + i] : 0) * window[i];
      }

      // FFT
      const fftSize = frameSize;
      const re = new Float32Array(fftSize);
      const im = new Float32Array(fftSize);
      for (let i = 0; i < fftSize; i++) { re[i] = frame[i]; im[i] = 0; }
      fft(re, im, false);

      const halfSize = fftSize / 2 + 1;
      const mag = new Float32Array(halfSize);
      const phase = new Float32Array(halfSize);
      for (let i = 0; i < halfSize; i++) {
        mag[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
        phase[i] = Math.atan2(im[i], re[i]);
      }

      // Spectral subtraction with smoothing
      const newMag = new Float32Array(halfSize);
      for (let i = 0; i < halfSize; i++) {
        const noiseEst = Math.pow(10, noiseFloor[i] / 20) * (1 + strength * 2);
        const subtracted = Math.max(
          mag[i] - noiseEst * strength,
          mag[i] * (1 - strength) * 0.1
        );
        newMag[i] = smoothing * prevMag[i] + (1 - smoothing) * subtracted;
      }
      prevMag = newMag;

      // Reconstruct
      const outRe = new Float32Array(fftSize);
      const outIm = new Float32Array(fftSize);
      for (let i = 0; i < halfSize; i++) {
        outRe[i] = newMag[i] * Math.cos(phase[i]);
        outIm[i] = newMag[i] * Math.sin(phase[i]);
        if (i > 0 && i < halfSize - 1) {
          outRe[fftSize - i] = outRe[i];
          outIm[fftSize - i] = -outIm[i];
        }
      }
      fft(outRe, outIm, true);

      // Overlap-add
      for (let i = 0; i < frameSize && pos + i < output.length; i++) {
        overlap[pos + i] += outRe[i] * window[i];
      }
    }

    // Normalize overlap-add
    const windowSum = new Float32Array(input.length);
    for (let pos = 0; pos < input.length; pos += hopSize) {
      for (let i = 0; i < frameSize && pos + i < input.length; i++) {
        windowSum[pos + i] += window[i] * window[i];
      }
    }
    for (let i = 0; i < output.length; i++) {
      output[i] = windowSum[i] > 1e-8 ? overlap[i] / windowSum[i] : 0;
    }

    outputBuffer.copyToChannel(output, ch);
  }
  return outputBuffer;
}

/* ─── FFT (Cooley-Tukey) ─── */
function fft(re: Float32Array, im: Float32Array, inverse: boolean) {
  const n = re.length;
  // bit reversal
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (2 * Math.PI) / len * (inverse ? -1 : 1);
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1, curIm = 0;
      for (let j = 0; j < len / 2; j++) {
        const uRe = re[i + j];
        const uIm = im[i + j];
        const vRe = re[i + j + len / 2] * curRe - im[i + j + len / 2] * curIm;
        const vIm = re[i + j + len / 2] * curIm + im[i + j + len / 2] * curRe;
        re[i + j] = uRe + vRe;
        im[i + j] = uIm + vIm;
        re[i + j + len / 2] = uRe - vRe;
        im[i + j + len / 2] = uIm - vIm;
        const newCurRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = newCurRe;
      }
    }
  }
  if (inverse) {
    for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }
}

/* ─── WAV EXPORT ─── */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = buffer.length * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const ws = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
  ws(8, 'WAVE'); ws(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true); ws(36, 'data'); view.setUint32(40, dataSize, true);
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

/* ─── MAIN COMPONENT ─── */
export default function NoiseReductionPage() {
  const [step, setStep]               = useState<Step>('upload');
  const [file, setFile]               = useState<File | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [noiseFloor, setNoiseFloor]   = useState<Float32Array | null>(null);
  const [magnitudes, setMagnitudes]   = useState<Float32Array | null>(null);
  const [sampleRate, setSampleRate]   = useState(44100);
  const [duration, setDuration]       = useState(0);
  const [strength, setStrength]       = useState(0.5);
  const [smoothing, setSmoothing]     = useState(0.5);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [outName, setOutName]         = useState('');
  const [log, setLog]                 = useState('');

  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef    = useRef<AudioContext | null>(null);

  const fontStack = '"Space Grotesk","Noto Sans JP","Helvetica Neue",Arial,sans-serif';

  /* ── analyze ── */
  const analyzeFile = useCallback(async (f: File) => {
    setLog('解析中...');
    setStep('analyze');
    const arr = await f.arrayBuffer();
    const tmpCtx = new AudioContext();
    const decoded = await tmpCtx.decodeAudioData(arr);
    await tmpCtx.close();

    setAudioBuffer(decoded);
    setSampleRate(decoded.sampleRate);
    setDuration(decoded.duration);

    // compute average magnitude spectrum (mono mix)
    const fftSize = 2048;
    const halfSize = fftSize / 2 + 1;
    const avgMag = new Float32Array(halfSize);
    const ch0 = decoded.getChannelData(0);
    const ch1 = decoded.numberOfChannels > 1 ? decoded.getChannelData(1) : ch0;
    let frameCount = 0;

    for (let pos = 0; pos + fftSize < ch0.length; pos += fftSize) {
      const re = new Float32Array(fftSize);
      const im = new Float32Array(fftSize);
      for (let i = 0; i < fftSize; i++) {
        re[i] = (ch0[pos + i] + ch1[pos + i]) / 2 *
          (0.5 * (1 - Math.cos((2 * Math.PI * i) / fftSize)));
      }
      fft(re, im, false);
      for (let i = 0; i < halfSize; i++) {
        const m = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
        avgMag[i] += m;
      }
      frameCount++;
    }

    // to dB
    const magDb = new Float32Array(halfSize);
    for (let i = 0; i < halfSize; i++) {
      const m = frameCount > 0 ? avgMag[i] / frameCount : 0;
      magDb[i] = m > 1e-10 ? 20 * Math.log10(m) : -90;
    }

    // noise floor: estimate from quietest 10% of frames
    const frameSize2 = 2048;
    const frameEnergies: { energy: number; pos: number }[] = [];
    for (let pos = 0; pos + frameSize2 < ch0.length; pos += frameSize2) {
      let e = 0;
      for (let i = 0; i < frameSize2; i++) {
        const s = (ch0[pos + i] + ch1[pos + i]) / 2;
        e += s * s;
      }
      frameEnergies.push({ energy: e, pos });
    }
    frameEnergies.sort((a, b) => a.energy - b.energy);
    const noiseFrameCount = Math.max(1, Math.floor(frameEnergies.length * 0.1));
    const noiseFloorArr = new Float32Array(halfSize);

    for (let k = 0; k < noiseFrameCount; k++) {
      const pos = frameEnergies[k].pos;
      const re = new Float32Array(fftSize);
      const im = new Float32Array(fftSize);
      for (let i = 0; i < fftSize; i++) {
        re[i] = (ch0[pos + i] + ch1[pos + i]) / 2 *
          (0.5 * (1 - Math.cos((2 * Math.PI * i) / fftSize)));
      }
      fft(re, im, false);
      for (let i = 0; i < halfSize; i++) {
        const m = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
        noiseFloorArr[i] += m;
      }
    }
    for (let i = 0; i < halfSize; i++) {
      const m = noiseFloorArr[i] / noiseFrameCount;
      noiseFloorArr[i] = m > 1e-10 ? 20 * Math.log10(m) : -90;
    }

    setMagnitudes(magDb);
    setNoiseFloor(noiseFloorArr);
    setStep('adjust');
    setLog('');
  }, []);

  /* ── draw canvas ── */
  useEffect(() => {
    if (!canvasRef.current || !magnitudes || !noiseFloor) return;
    drawSpectrum(canvasRef.current, magnitudes, noiseFloor, sampleRate, strength);
  }, [magnitudes, noiseFloor, sampleRate, strength]);

  /* ── preview play ── */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }
    if (!audioBuffer) return;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
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
    if (!audioBuffer || !noiseFloor) return;
    setStep('processing');
    setLog('スペクトル減算を実行中...');
    await new Promise(r => setTimeout(r, 50));
    const result = applySpectralSubtraction(audioBuffer, noiseFloor, strength, smoothing);
    setLog('WAVファイルを生成中...');
    await new Promise(r => setTimeout(r, 50));
    const blob = audioBufferToWav(result);
    const url = URL.createObjectURL(blob);
    const base = file?.name.replace(/\.[^.]+$/, '') ?? 'output';
    setDownloadUrl(url);
    setOutName(`${base}_nr_s${Math.round(strength * 100)}.wav`);
    setStep('done');
    setLog('完了しました');
  }, [audioBuffer, noiseFloor, strength, smoothing, file]);

  /* ── file handler ── */
  const handleFile = useCallback((f: File) => {
    setFile(f);
    analyzeFile(f);
  }, [analyzeFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  /* ── styles ── */
  const card: React.CSSProperties = {
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: '16px',
    padding: '2rem',
  };

  const sliderStyle: React.CSSProperties = {
    width: '100%',
    appearance: 'none' as const,
    height: '4px',
    borderRadius: '2px',
    background: `linear-gradient(to right, ${C.accent} ${strength * 100}%, #e2e8f0 ${strength * 100}%)`,
    outline: 'none',
    cursor: 'pointer',
  };

  const smoothSliderStyle: React.CSSProperties = {
    width: '100%',
    appearance: 'none' as const,
    height: '4px',
    borderRadius: '2px',
    background: `linear-gradient(to right, ${C.accent} ${smoothing * 100}%, #e2e8f0 ${smoothing * 100}%)`,
    outline: 'none',
    cursor: 'pointer',
  };

  /* ── render ── */
  return (
    <AuthGate appName="noise-reduction">
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
        .btn-primary { transition: all 0.2s; }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-2px); }
        .btn-ghost:hover { background: ${C.accentLight} !important; color: ${C.accent} !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '4px', color: C.accent, textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 500 }}>
            Kuon R&D — Audio Tool
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, letterSpacing: '-1.5px', color: C.ink, margin: '0 0 0.5rem' }}>
            Noise Reduction
          </h1>
          <p style={{ color: C.inkMuted, fontSize: '0.95rem', margin: 0 }}>
            スペクトル減算法によるブラウザ内ノイズ除去
          </p>
        </div>

        {/* UPLOAD */}
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
                padding: '6rem 2rem',
                textAlign: 'center',
                border: `2px dashed ${isDragging ? C.accent : 'rgba(2,132,199,0.3)'}`,
                background: isDragging ? C.accentLight : C.bgCard,
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: isDragging ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
              <div style={{ fontWeight: 600, color: C.ink, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                音声ファイルをドロップ
              </div>
              <div style={{ color: C.inkMuted, fontSize: '0.85rem' }}>WAV / MP3 — またはクリックして選択</div>
            </div>
          </div>
        )}

        {/* ANALYZING */}
        {step === 'analyze' && (
          <div style={{ textAlign: 'center', padding: '6rem 0', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ width: '40px', height: '40px', border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
            <div style={{ color: C.ink, fontWeight: 600 }}>周波数スペクトルを解析中...</div>
          </div>
        )}

        {/* ADJUST */}
        {step === 'adjust' && magnitudes && noiseFloor && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>

            {/* file info bar */}
            <div style={{ ...card, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🎵</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: C.ink, fontSize: '0.95rem' }}>{file?.name}</div>
                <div style={{ color: C.inkMuted, fontSize: '0.78rem', marginTop: '2px' }}>
                  {formatTime(duration)} · {(sampleRate / 1000).toFixed(1)} kHz
                </div>
              </div>
              <button onClick={togglePlay} className="btn-ghost"
                style={{ padding: '8px 18px', borderRadius: '100px', border: `1px solid ${C.border}`, background: C.white, color: C.inkMid, cursor: 'pointer', fontSize: '0.85rem', fontFamily: fontStack }}>
                {isPlaying ? '⏸ 停止' : '▶ 再生'}
              </button>
              <button onClick={() => { setStep('upload'); setFile(null); setAudioBuffer(null); }} className="btn-ghost"
                style={{ padding: '8px 12px', borderRadius: '100px', border: `1px solid ${C.border}`, background: C.white, color: C.inkMuted, cursor: 'pointer', fontSize: '0.85rem', fontFamily: fontStack }}>
                ✕
              </button>
            </div>

            {/* spectrum canvas */}
            <div style={{ ...card, padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '3px', color: C.inkMuted, marginBottom: '0.75rem', fontWeight: 500 }}>
                SPECTRUM ANALYZER
              </div>
              <canvas ref={canvasRef} width={820} height={220}
                style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }} />
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.75rem', color: C.inkMuted }}>
                <span><span style={{ color: C.accent }}>━</span> 音声スペクトル</span>
                <span><span style={{ color: C.red }}>━</span> ノイズ除去しきい値（赤線以下を除去）</span>
              </div>
            </div>

            {/* sliders */}
            <div style={{ ...card, marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: C.ink, fontSize: '0.95rem' }}>除去強度</div>
                    <div style={{ color: C.inkMuted, fontSize: '0.78rem', marginTop: '2px' }}>
                      強いほどノイズを積極的に除去します。やりすぎると音質が劣化します。
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: C.accent, fontSize: '1.1rem', flexShrink: 0, marginLeft: '1rem' }}>
                    {Math.round(strength * 100)}%
                  </div>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={strength}
                  onChange={e => setStrength(Number(e.target.value))}
                  style={sliderStyle} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: C.inkMuted, marginTop: '4px' }}>
                  <span>自然さ優先</span><span>除去優先</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: C.ink, fontSize: '0.95rem' }}>スムージング</div>
                    <div style={{ color: C.inkMuted, fontSize: '0.78rem', marginTop: '2px' }}>
                      フレーム間の滑らかさを調整します。高いほど音の変化が滑らかになります。
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: C.accent, fontSize: '1.1rem', flexShrink: 0, marginLeft: '1rem' }}>
                    {Math.round(smoothing * 100)}%
                  </div>
                </div>
                <input type="range" min={0} max={0.95} step={0.01} value={smoothing}
                  onChange={e => setSmoothing(Number(e.target.value))}
                  style={smoothSliderStyle} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: C.inkMuted, marginTop: '4px' }}>
                  <span>シャープ</span><span>スムース</span>
                </div>
              </div>
            </div>

            {/* process button */}
            <button onClick={process} className="btn-primary"
              style={{ width: '100%', padding: '1.1rem', borderRadius: '12px', border: 'none', background: C.accent, color: C.white, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: fontStack, letterSpacing: '0.5px' }}>
              ノイズ除去を実行
            </button>
          </div>
        )}

        {/* PROCESSING */}
        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '6rem 0', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ width: '40px', height: '40px', border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1.5rem' }} />
            <div style={{ color: C.ink, fontWeight: 600, marginBottom: '0.5rem' }}>処理中...</div>
            <div style={{ color: C.inkMuted, fontSize: '0.85rem' }}>{log}</div>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ ...card, textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: C.ink, marginBottom: '0.5rem' }}>処理完了</div>
              <div style={{ color: C.inkMuted, fontSize: '0.85rem', marginBottom: '1.5rem' }}>{outName}</div>
              <a href={downloadUrl} download={outName} className="btn-primary"
                style={{ display: 'inline-block', padding: '0.9rem 2.5rem', borderRadius: '100px', background: C.green, color: C.white, fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
                ⬇ WAVをダウンロード
              </a>
            </div>
            <button onClick={() => { setStep('adjust'); setDownloadUrl(''); }}
              style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: `1px solid ${C.border}`, background: C.white, color: C.inkMid, cursor: 'pointer', fontSize: '0.9rem', fontFamily: fontStack }}>
              パラメーターを変えて再処理
            </button>
            <button onClick={() => { setStep('upload'); setFile(null); setAudioBuffer(null); setMagnitudes(null); setNoiseFloor(null); setDownloadUrl(''); }}
              style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'none', color: C.inkMuted, cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.5rem', fontFamily: fontStack }}>
              別のファイルを処理する
            </button>
          </div>
        )}

        {/* footer note */}
        {step !== 'processing' && step !== 'analyze' && (
          <p style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.75rem', color: C.inkMuted }}>
            ※ 処理はすべてブラウザ内で完結します。音声データが外部に送信されることはありません。
          </p>
        )}
      </div>
    </div>
    </AuthGate>
  );
}
