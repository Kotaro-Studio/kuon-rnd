// utils/audioDSP.ts

// 【堅牢版】様々なWAVフォーマット（16/24/32bit Float）を安全に読み込むパーサー
export function decodeWAV(arrayBuffer: ArrayBuffer) {
  const view = new DataView(arrayBuffer);
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (riff !== 'RIFF') throw new Error('WAVファイルではありません。');

  let offset = 12; 
  let fmtFound = false;
  let numChannels = 1, sampleRate = 44100, bitsPerSample = 16, audioFormat = 1;
  let dataOffset = 0, dataSize = 0;

  // チャンクのサイズが特殊なWAVでも正確に "fmt " と "data" を見つけ出す
  while (offset < view.byteLength) {
    const chunkId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset+1), view.getUint8(offset+2), view.getUint8(offset+3));
    const chunkSize = view.getUint32(offset + 4, true);
    
    if (chunkId === 'fmt ') {
      fmtFound = true;
      audioFormat = view.getUint16(offset + 8, true);
      numChannels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    } else if (chunkId === 'data') {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break; 
    }
    offset += 8 + chunkSize;
  }

  if (!fmtFound || dataOffset === 0) throw new Error('無効なWAVフォーマットです。');

  const bytesPerSample = bitsPerSample / 8;
  const numSamples = dataSize / (numChannels * bytesPerSample);
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(new Float32Array(numSamples));

  offset = dataOffset;
  if (audioFormat === 1 && bitsPerSample === 16) {
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        channels[c][i] = view.getInt16(offset, true) / 0x8000;
        offset += 2;
      }
    }
  } else if (audioFormat === 1 && bitsPerSample === 24) {
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        let int32 = (view.getUint8(offset+2) << 24) | (view.getUint8(offset+1) << 16) | (view.getUint8(offset) << 8);
        channels[c][i] = (int32 >> 8) / 0x800000;
        offset += 3;
      }
    }
  } else if (audioFormat === 3 && bitsPerSample === 32) { // 32bit Float
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        channels[c][i] = view.getFloat32(offset, true);
        offset += 4;
      }
    }
  } else {
    throw new Error(`未対応のフォーマットです: ${bitsPerSample}bit`);
  }
  return { channels, sampleRate, numChannels, totalSamples: numSamples };
}

// 【プロ仕様】劣化ゼロの 32bit Float WAV エンコーダー
export function encodeWAV(channels: Float32Array[], sampleRate: number): Blob {
  // 32bit Floatで書き出すため、限界値(1.0)を超えてもクリップしません。
  // そのため、オートノーマライズによるゲイン低下は不要になります（そのまま書き出します）。
  const numChannels = channels.length;
  const numSamples = channels[0].length;
  const bytesPerSample = 4; // 32bit Float = 4bytes
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numSamples * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 3, true); // 3: IEEE Float (プロ標準)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 32, true); // 32bit
  
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      // 復元したピークをそのままFloat32で書き込み
      view.setFloat32(offset, channels[channel][i], true);
      offset += 4;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

// パラボラ（ドーム）加算による確実なピーク復元
export function interpolateClip(data: Float32Array, start: number, end: number) {
  const length = end - start;
  if (length <= 0 || start < 2 || end > data.length - 2) return;

  const y0 = data[start - 1];
  const y1 = data[end];
  let slope = Math.abs(data[start - 1] - data[start - 2]);
  
  let archHeight = slope * (length / 2.5);
  if (archHeight > 0.4) archHeight = 0.4; 
  
  const sign = y0 > 0 ? 1 : -1; 

  for (let i = 0; i < length; i++) {
    const t = (i + 1) / (length + 1);
    const base = y0 + (y1 - y0) * t;
    const arch = Math.sin(t * Math.PI) * archHeight * sign;
    data[start + i] = base + arch;
  }
}
