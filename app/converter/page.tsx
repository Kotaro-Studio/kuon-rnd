'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { AuthGate } from '@/components/AuthGate';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type L3 = Record<Lang, string>;

type Bitrate = 160 | 320;
type ConvertStatus = 'idle' | 'decoding' | 'encoding' | 'done' | 'error';

interface FileInfo {
  name: string;
  size: number;
  sampleRate: number;
  channels: number;
  duration: number;
  bitDepth: number;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#0284c7';
const ACCENT_DARK = '#0369a1';

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  pageTitle: { ja: 'KUON CONVERTER', en: 'KUON CONVERTER', es: 'KUON CONVERTER' } as L3,
  pageSubtitle: {
    ja: 'WAV ファイルを高品質 MP3 に変換。\nブラウザだけで完結。サーバー送信なし。',
    en: 'Convert WAV to high-quality MP3.\nEntirely in your browser. No server upload.',
    es: 'Convierte WAV a MP3 de alta calidad.\nTodo en tu navegador. Sin subir al servidor.',
  } as L3,
  dropTitle: {
    ja: 'WAV ファイルをドロップ',
    en: 'Drop Your WAV File Here',
    es: 'Suelta tu archivo WAV aquí',
  } as L3,
  dropOr: { ja: 'または', en: 'or', es: 'o' } as L3,
  selectFile: { ja: 'ファイルを選択', en: 'Select File', es: 'Seleccionar archivo' } as L3,
  dropHint: {
    ja: 'WAV ファイル対応（16bit / 24bit / 32bit float）',
    en: 'WAV files supported (16bit / 24bit / 32bit float)',
    es: 'Archivos WAV compatibles (16bit / 24bit / 32bit float)',
  } as L3,
  bitrateLabel: { ja: 'ビットレート', en: 'Bitrate', es: 'Tasa de bits' } as L3,
  bitrateHigh: {
    ja: '320 kbps — 最高品質（マスタリング・配信向け）',
    en: '320 kbps — Highest quality (mastering / distribution)',
    es: '320 kbps — Máxima calidad (masterización / distribución)',
  } as L3,
  bitrateStandard: {
    ja: '160 kbps — 標準品質（データ確認・ラフミックス向け）',
    en: '160 kbps — Standard quality (review / rough mix)',
    es: '160 kbps — Calidad estándar (revisión / mezcla preliminar)',
  } as L3,
  convertBtn: {
    ja: 'MP3 に変換',
    en: 'Convert to MP3',
    es: 'Convertir a MP3',
  } as L3,
  decoding: {
    ja: 'デコード中…',
    en: 'Decoding…',
    es: 'Decodificando…',
  } as L3,
  encoding: {
    ja: 'エンコード中… {progress}%',
    en: 'Encoding… {progress}%',
    es: 'Codificando… {progress}%',
  } as L3,
  done: {
    ja: '変換完了',
    en: 'Conversion Complete',
    es: 'Conversión completada',
  } as L3,
  downloadBtn: {
    ja: 'MP3 をダウンロード',
    en: 'Download MP3',
    es: 'Descargar MP3',
  } as L3,
  convertAnother: {
    ja: '別のファイルを変換',
    en: 'Convert Another File',
    es: 'Convertir otro archivo',
  } as L3,
  errorGeneric: {
    ja: 'エラーが発生しました。WAV ファイルか確認してください。',
    en: 'An error occurred. Please verify the file is a valid WAV.',
    es: 'Ocurrió un error. Verifique que el archivo sea un WAV válido.',
  } as L3,
  errorNotWav: {
    ja: 'WAV ファイルのみ対応しています。',
    en: 'Only WAV files are supported.',
    es: 'Solo se admiten archivos WAV.',
  } as L3,
  fileInfo: { ja: 'ファイル情報', en: 'File Info', es: 'Info del archivo' } as L3,
  lblSampleRate: { ja: 'サンプルレート', en: 'Sample Rate', es: 'Frecuencia de muestreo' } as L3,
  lblChannels: { ja: 'チャンネル', en: 'Channels', es: 'Canales' } as L3,
  lblDuration: { ja: '再生時間', en: 'Duration', es: 'Duración' } as L3,
  lblFileSize: { ja: 'ファイルサイズ', en: 'File Size', es: 'Tamaño del archivo' } as L3,
  lblBitDepth: { ja: 'ビット深度', en: 'Bit Depth', es: 'Profundidad de bits' } as L3,
  lblOutputSize: { ja: '出力サイズ（推定）', en: 'Output Size (est.)', es: 'Tamaño de salida (est.)' } as L3,
  privacy: {
    ja: 'すべての処理はブラウザ内で完結します。音声データがサーバーに送信されることはありません。',
    en: 'All processing happens in your browser. Audio data is never sent to a server.',
    es: 'Todo el procesamiento ocurre en tu navegador. Los datos de audio nunca se envían a un servidor.',
  } as L3,
  poweredBy: {
    ja: 'Powered by 空音開発 Kuon R&D',
    en: 'Powered by Kuon R&D',
    es: 'Desarrollado por Kuon R&D',
  } as L3,
};

// ─────────────────────────────────────────────
// lamejs loader (avoids Turbopack ESM breakage)
// ─────────────────────────────────────────────
interface LameJsApi {
  Mp3Encoder: new (channels: number, sampleRate: number, kbps: number) => {
    encodeBuffer(left: Int16Array, right?: Int16Array): Int8Array;
    flush(): Int8Array;
  };
}

let _lamejsCache: LameJsApi | null = null;

function loadLamejs(): Promise<LameJsApi> {
  if (_lamejsCache) return Promise.resolve(_lamejsCache);

  return new Promise((resolve, reject) => {
    // Check if already loaded via a previous script tag
    const win = window as unknown as Record<string, unknown>;
    if (win._lamejs) {
      _lamejsCache = win._lamejs as LameJsApi;
      return resolve(_lamejsCache);
    }

    const script = document.createElement('script');
    script.src = '/lamejs/lame.all.js';
    script.onload = () => {
      // lame.all.js exposes lamejs on the global scope after calling lamejs()
      // It attaches Mp3Encoder and WavHeader to the lamejs function object
      const ljs = win.lamejs as LameJsApi | undefined;
      if (ljs && ljs.Mp3Encoder) {
        _lamejsCache = ljs;
        win._lamejs = ljs;
        resolve(ljs);
      } else {
        reject(new Error('lamejs failed to initialize'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load lamejs script'));
    document.head.appendChild(script);
  });
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function estimateOutputSize(durationSec: number, kbps: number): string {
  const bytes = (kbps * 1000 / 8) * durationSec;
  return formatSize(bytes);
}

/** Read WAV header to extract bit depth before Web Audio decodes to float32 */
function readWavBitDepth(arrayBuffer: ArrayBuffer): number {
  try {
    const view = new DataView(arrayBuffer);
    // RIFF header: bytes 0-3 = "RIFF", 8-11 = "WAVE"
    // fmt chunk starts at byte 12
    let offset = 12;
    while (offset < view.byteLength - 8) {
      const chunkId = String.fromCharCode(
        view.getUint8(offset), view.getUint8(offset + 1),
        view.getUint8(offset + 2), view.getUint8(offset + 3)
      );
      const chunkSize = view.getUint32(offset + 4, true);
      if (chunkId === 'fmt ') {
        // bitsPerSample at offset + 22 from chunk start
        return view.getUint16(offset + 22, true);
      }
      offset += 8 + chunkSize;
      if (chunkSize % 2 !== 0) offset++; // padding byte
    }
  } catch {
    // ignore parse errors
  }
  return 0;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ConverterPage() {
  const { lang } = useLang();
  const t = (obj: L3) => obj[lang] || obj.en;

  // State
  const [status, setStatus] = useState<ConvertStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [bitrate, setBitrate] = useState<Bitrate>(320);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rawArrayBufferRef = useRef<ArrayBuffer | null>(null);

  // ─── File selection ────────────────────────
  const handleFile = useCallback(async (file: File) => {
    // Reset
    setStatus('idle');
    setProgress(0);
    setDownloadUrl(null);
    setErrorMsg('');

    // Validate WAV
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext !== 'wav' && ext !== 'wave') {
      setErrorMsg(t(T.errorNotWav));
      return;
    }

    setSelectedFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      rawArrayBufferRef.current = arrayBuffer;

      const bitDepth = readWavBitDepth(arrayBuffer);

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
      await audioCtx.close();

      setFileInfo({
        name: file.name,
        size: file.size,
        sampleRate: decoded.sampleRate,
        channels: decoded.numberOfChannels,
        duration: decoded.duration,
        bitDepth: bitDepth || 16,
      });
    } catch {
      setErrorMsg(t(T.errorGeneric));
      setSelectedFile(null);
    }
  }, [lang]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ─── Conversion ────────────────────────────
  const convert = useCallback(async () => {
    if (!selectedFile || !rawArrayBufferRef.current) return;

    setStatus('decoding');
    setProgress(0);
    setDownloadUrl(null);
    setErrorMsg('');

    try {
      // Decode audio
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(rawArrayBufferRef.current.slice(0));
      await audioCtx.close();

      setStatus('encoding');

      // lamejs's src/js split files break under Turbopack ESM transform (MPEGMode not defined).
      // Use the self-contained lame.all.js bundle instead via a script-injected global.
      const LameJs = await loadLamejs();
      const channels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const mp3Encoder = new LameJs.Mp3Encoder(channels, sampleRate, bitrate);

      // Get channel data and convert float32 → int16
      const leftFloat = audioBuffer.getChannelData(0);
      const rightFloat = channels > 1 ? audioBuffer.getChannelData(1) : leftFloat;

      const totalSamples = leftFloat.length;
      const BLOCK_SIZE = 1152; // MP3 frame size
      const mp3Chunks: Int8Array[] = [];

      const floatToInt16 = (float32: Float32Array, start: number, length: number): Int16Array => {
        const int16 = new Int16Array(length);
        for (let i = 0; i < length; i++) {
          const s = float32[start + i];
          // Clamp and convert
          int16[i] = s < -1 ? -32768 : s > 1 ? 32767 : Math.round(s * 32767);
        }
        return int16;
      };

      // Encode in blocks
      for (let offset = 0; offset < totalSamples; offset += BLOCK_SIZE) {
        const remaining = Math.min(BLOCK_SIZE, totalSamples - offset);
        const leftChunk = floatToInt16(leftFloat, offset, remaining);
        const rightChunk = channels > 1 ? floatToInt16(rightFloat, offset, remaining) : leftChunk;

        const mp3buf = channels > 1
          ? mp3Encoder.encodeBuffer(leftChunk, rightChunk)
          : mp3Encoder.encodeBuffer(leftChunk);

        if (mp3buf.length > 0) {
          mp3Chunks.push(mp3buf);
        }

        // Update progress every ~50 blocks
        if (offset % (BLOCK_SIZE * 50) === 0 || offset + BLOCK_SIZE >= totalSamples) {
          const pct = Math.min(100, Math.round((offset / totalSamples) * 100));
          setProgress(pct);
          // Yield to UI thread
          await new Promise(r => setTimeout(r, 0));
        }
      }

      // Flush remaining
      const flushBuf = mp3Encoder.flush();
      if (flushBuf.length > 0) {
        mp3Chunks.push(flushBuf);
      }

      setProgress(100);

      // Combine chunks into single Uint8Array
      const totalLength = mp3Chunks.reduce((acc, c) => acc + c.length, 0);
      const mp3Data = new Uint8Array(totalLength);
      let writeOffset = 0;
      for (const chunk of mp3Chunks) {
        mp3Data.set(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), writeOffset);
        writeOffset += chunk.length;
      }

      // Create download blob
      const blob = new Blob([mp3Data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      const baseName = selectedFile.name.replace(/\.(wav|wave)$/i, '');
      setDownloadName(`${baseName}_${bitrate}kbps.mp3`);
      setDownloadUrl(url);
      setStatus('done');
    } catch (err) {
      console.error('Conversion error:', err);
      setErrorMsg(t(T.errorGeneric));
      setStatus('error');
    }
  }, [selectedFile, bitrate, lang]);

  // ─── Reset ─────────────────────────────────
  const reset = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setStatus('idle');
    setSelectedFile(null);
    setFileInfo(null);
    setProgress(0);
    setDownloadUrl(null);
    setDownloadName('');
    setErrorMsg('');
    rawArrayBufferRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [downloadUrl]);

  // ─── Styles ────────────────────────────────
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#fafafa',
    fontFamily: sans,
    color: '#1e293b',
  };

  const heroStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem) clamp(1.5rem, 3vw, 2.5rem)',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
    borderBottom: '1px solid #e2e8f0',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: '#0f172a',
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: sans,
    fontSize: 'clamp(0.85rem, 2vw, 1rem)',
    color: '#64748b',
    marginTop: '0.75rem',
    lineHeight: 1.7,
    whiteSpace: 'pre-line',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 680,
    margin: '0 auto',
    padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 1.5rem)',
  };

  const dropZoneStyle: React.CSSProperties = {
    border: `2px dashed ${isDragging ? ACCENT : '#cbd5e1'}`,
    borderRadius: 16,
    padding: 'clamp(2rem, 5vw, 3rem) 1.5rem',
    textAlign: 'center',
    background: isDragging ? '#f0f9ff' : '#fff',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: sans,
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: ACCENT,
    border: 'none',
    padding: '0.9rem 2.2rem',
    borderRadius: 50,
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(2,132,199,0.2)',
  };

  const btnOutline: React.CSSProperties = {
    ...btnPrimary,
    backgroundColor: 'transparent',
    color: ACCENT,
    border: `2px solid ${ACCENT}`,
    boxShadow: 'none',
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    marginTop: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: sans,
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '0.5rem',
  };

  const radioGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem',
  };

  const isProcessing = status === 'decoding' || status === 'encoding';

  // ─── Render ────────────────────────────────
  return (
    <AuthGate appName="converter">
    <div style={pageStyle}>
      {/* Hero */}
      <div style={heroStyle}>
        <h1 style={titleStyle}>{t(T.pageTitle)}</h1>
        <p style={subtitleStyle}>{t(T.pageSubtitle)}</p>
      </div>

      <div style={containerStyle}>

        {/* Drop zone — show when no file or want to re-upload */}
        {!selectedFile && (
          <div
            style={dropZoneStyle}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>🎵</div>
            <p style={{ fontFamily: serif, fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 600, color: '#334155', margin: '0 0 0.5rem' }}>
              {t(T.dropTitle)}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 1rem' }}>{t(T.dropOr)}</p>
            <span style={{ ...btnOutline, display: 'inline-block', padding: '0.6rem 1.8rem', fontSize: '0.85rem' }}>
              {t(T.selectFile)}
            </span>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '1rem' }}>{t(T.dropHint)}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".wav,.wave"
              style={{ display: 'none' }}
              onChange={onFileInput}
            />
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div style={{ ...cardStyle, borderColor: '#fca5a5', background: '#fef2f2' }}>
            <p style={{ color: '#dc2626', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>⚠ {errorMsg}</p>
          </div>
        )}

        {/* File info + settings */}
        {selectedFile && fileInfo && (
          <>
            {/* File info card */}
            <div style={cardStyle}>
              <p style={labelStyle}>{t(T.fileInfo)}</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem 1.5rem',
              }}>
                {[
                  [t(T.lblSampleRate), `${fileInfo.sampleRate.toLocaleString()} Hz`],
                  [t(T.lblBitDepth), `${fileInfo.bitDepth} bit`],
                  [t(T.lblChannels), fileInfo.channels === 1 ? 'Mono' : fileInfo.channels === 2 ? 'Stereo' : `${fileInfo.channels}ch`],
                  [t(T.lblDuration), formatDuration(fileInfo.duration)],
                  [t(T.lblFileSize), formatSize(fileInfo.size)],
                  [t(T.lblOutputSize), estimateOutputSize(fileInfo.duration, bitrate)],
                ].map(([label, value], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{label}</span>
                    <span style={{ fontSize: '0.82rem', fontFamily: mono, fontWeight: 600, color: '#334155' }}>{value}</span>
                  </div>
                ))}
              </div>
              <p style={{
                fontSize: '0.78rem',
                color: '#94a3b8',
                marginTop: '0.75rem',
                fontFamily: mono,
                wordBreak: 'break-all',
              }}>
                📄 {fileInfo.name}
              </p>
            </div>

            {/* Bitrate selection */}
            <div style={cardStyle}>
              <p style={labelStyle}>{t(T.bitrateLabel)}</p>
              <div style={radioGroupStyle}>
                {([320, 160] as Bitrate[]).map((br) => {
                  const isSelected = bitrate === br;
                  return (
                    <label
                      key={br}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.85rem 1rem',
                        borderRadius: 10,
                        border: `2px solid ${isSelected ? ACCENT : '#e2e8f0'}`,
                        background: isSelected ? '#f0f9ff' : '#fff',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isProcessing ? 0.6 : 1,
                      }}
                    >
                      <input
                        type="radio"
                        name="bitrate"
                        value={br}
                        checked={isSelected}
                        onChange={() => setBitrate(br)}
                        disabled={isProcessing}
                        style={{ accentColor: ACCENT, width: 18, height: 18 }}
                      />
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? ACCENT_DARK : '#334155' }}>
                          {br} kbps
                        </span>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                          {br === 320 ? t(T.bitrateHigh) : t(T.bitrateStandard)}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Convert button / Progress / Done */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              {status === 'idle' && (
                <button
                  style={btnPrimary}
                  onClick={convert}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = ACCENT_DARK)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
                >
                  🔄 {t(T.convertBtn)}
                </button>
              )}

              {isProcessing && (
                <div style={cardStyle}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#334155', margin: '0 0 1rem' }}>
                    {status === 'decoding'
                      ? t(T.decoding)
                      : t(T.encoding).replace('{progress}', String(progress))}
                  </p>
                  {/* Progress bar */}
                  <div style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    background: '#e2e8f0',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${status === 'decoding' ? 5 : progress}%`,
                      background: `linear-gradient(90deg, ${ACCENT}, #38bdf8)`,
                      borderRadius: 4,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              )}

              {status === 'done' && downloadUrl && (
                <div style={{ ...cardStyle, borderColor: '#86efac', background: '#f0fdf4' }}>
                  <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#16a34a', margin: '0 0 0.5rem' }}>
                    ✓ {t(T.done)}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', fontFamily: mono, margin: '0 0 1.25rem' }}>
                    {downloadName} — {estimateOutputSize(fileInfo.duration, bitrate)}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a
                      href={downloadUrl}
                      download={downloadName}
                      style={{ ...btnPrimary, textDecoration: 'none', background: '#16a34a' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#15803d')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
                    >
                      ⬇ {t(T.downloadBtn)}
                    </a>
                    <button
                      style={btnOutline}
                      onClick={reset}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = ACCENT; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = ACCENT; }}
                    >
                      {t(T.convertAnother)}
                    </button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <button
                  style={btnOutline}
                  onClick={reset}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = ACCENT; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = ACCENT; }}
                >
                  {t(T.convertAnother)}
                </button>
              )}
            </div>
          </>
        )}

        {/* Privacy note */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#94a3b8',
          marginTop: '2.5rem',
          padding: '1rem',
          borderTop: '1px solid #f1f5f9',
          lineHeight: 1.6,
        }}>
          🔒 {t(T.privacy)}
        </p>

        <p style={{
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#cbd5e1',
          marginTop: '0.5rem',
          fontFamily: serif,
          letterSpacing: '0.1em',
        }}>
          {t(T.poweredBy)}
        </p>
      </div>
    </div>
    </AuthGate>
  );
}
