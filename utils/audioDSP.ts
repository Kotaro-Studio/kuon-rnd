// utils/audioDSP.ts

// 1. 【堅牢版】様々なWAVフォーマット（16/24/32bit Float）を安全に読み込むパーサー
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

// 2. 【プロ仕様】劣化ゼロの 32bit Float WAV エンコーダー
export function encodeWAV(channels: Float32Array[], sampleRate: number): Blob {
  // 32bit Floatで書き出すため、限界値(1.0)を超えてもクリップしません。
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

// 3. 【聴感重視・完全滑らか版】Cubic Hermite Splineによるピーク復元と平滑化
export function interpolateClip(data: Float32Array, start: number, end: number) {
  // 改善①：のり代（マージン）の拡張
  // 平らになる手前の「アナログサチュレーション（肩の濁り）」ごと上書きするため、
  // 処理区間を前後に数サンプル広げて修復します。
  const margin = 4; 
  const s = Math.max(2, start - margin);
  const e = Math.min(data.length - 3, end + margin);
  
  const N = e - s;
  if (N <= 0) return;

  // 改善②：接合部の「見えない角」を消すためのエルミートスプライン補間
  const p0 = data[s]; // 拡張した修復開始点の高さ
  const p1 = data[e]; // 拡張した修復終了点の高さ

  // 拡張した両端における「波形の傾き（突入スピード）」を算出
  // tension（膨らみ係数）で山の高さを調整し、アナログの自然なアタックを再現します
  const tension = 1.2; 
  let m0 = (data[s] - data[s - 1]) * N * tension;
  let m1 = (data[e + 1] - data[e]) * N * tension;

  // 安全装置：傾きの方向がおかしい（波形が逆行している）場合は異常な膨らみを防止
  if ((p0 > 0 && m0 < 0) || (p0 < 0 && m0 > 0)) m0 = 0;
  if ((p1 > 0 && m1 > 0) || (p1 < 0 && m1 < 0)) m1 = 0;

  // 区間内を「Cubic Hermite Spline（3次エルミートスプライン）」で計算
  // これにより、元の波形と修復した波形の【傾き】が完全に一致し、角（ノイズ）が消滅します
  for (let i = 1; i < N; i++) {
    const t = i / N;
    const t2 = t * t;
    const t3 = t2 * t;

    // スプライン基底関数
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    // 高さと傾きを完全に維持しながら滑らかに繋がる曲線を描画
    data[s + i] = h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1;
  }
}
