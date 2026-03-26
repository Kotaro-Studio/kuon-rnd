// utils/audioDSP_piano.ts

export function decodeWAV(arrayBuffer: ArrayBuffer) {
  const view = new DataView(arrayBuffer);
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (riff !== 'RIFF') throw new Error('WAVファイルではありません。');

  let offset = 12; 
  let fmtFound = false;
  let numChannels = 1, sampleRate = 44100, bitsPerSample = 16, audioFormat = 1;
  let dataOffset = 0, dataSize = 0;

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
  } else if (audioFormat === 3 && bitsPerSample === 32) {
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

export function encodeWAV(channels: Float32Array[], sampleRate: number): Blob {
  const numChannels = channels.length;
  const numSamples = channels[0].length;
  const bytesPerSample = 4; // 32bit Float
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
  view.setUint16(20, 3, true); 
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 32, true); 
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      view.setFloat32(offset, channels[channel][i], true);
      offset += 4;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
}

// 【究極ピアノ版】Cubic Hermite Spline ＋ トランジェント強調 ＋ 倍音マスキング
export function interpolatePianoClip(
  data: Float32Array, start: number, end: number, 
  attackEnhance: number, analogWarmth: number
) {
  const margin = 4; 
  const s = Math.max(2, start - margin);
  const e = Math.min(data.length - 3, end + margin);
  
  const N = e - s;
  if (N <= 0) return;

  const p0 = data[s]; 
  const p1 = data[e]; 

  const tension = 1.2; 
  let m0 = (data[s] - data[s - 1]) * N * tension;
  let m1 = (data[e + 1] - data[e]) * N * tension;

  if ((p0 > 0 && m0 < 0) || (p0 < 0 && m0 > 0)) m0 = 0;
  if ((p1 > 0 && m1 > 0) || (p1 < 0 && m1 < 0)) m1 = 0;

  for (let i = 1; i < N; i++) {
    const t = i / N;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    // 基礎となる滑らかなスプライン曲線
    let y = h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;

    // --- 機能1：トランジェント（打鍵感）の復元 ---
    // 直線（ベースライン）からの「膨らみ（アーチ）」部分だけを抽出し、指定倍率で強調する
    const baseLine = p0 + (p1 - p0) * t;
    let arch = y - baseLine;
    arch = arch * attackEnhance; 
    y = baseLine + arch;

    // --- 機能2：アナログ倍音の付加（マスキング） ---
    // 描画した曲線に対して、微小な2次関数（真空管のような非線形歪み）を乗せてデジタル臭さを消す
    if (analogWarmth > 0) {
      const warmthAmount = analogWarmth * 0.2; // 調整用スケール
      y = y + warmthAmount * y * y * (y > 0 ? 1 : -1);
    }

    data[s + i] = y;
  }
}
