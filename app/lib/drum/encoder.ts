// ─────────────────────────────────────────────
// KUON DRUM MACHINE — URL Hash Encoder
// ─────────────────────────────────────────────
// パターン全体を URL に圧縮 → Twitter / LINE で一発共有。
// 8 voices × 16 steps = 128 bits = 24 文字 Base64 で十分。
// ─────────────────────────────────────────────

import type { KitId } from './kits';

export type SharedState = {
  kitId: KitId;
  bpm: number;             // 40-220
  swing: number;           // 0-75
  steps: number;           // 12, 14, 16, 20 等
  tracks: boolean[][];     // 8 voices × steps
  accents?: boolean[][];
};

// ─────────────────────────────────────────────
// boolean[][] → bits → Base64URL
// ─────────────────────────────────────────────

function boolsToBytes(bools: boolean[][]): Uint8Array {
  const flat = bools.flat();
  const byteLen = Math.ceil(flat.length / 8);
  const bytes = new Uint8Array(byteLen);
  for (let i = 0; i < flat.length; i++) {
    if (flat[i]) bytes[i >> 3] |= 1 << (i & 7);
  }
  return bytes;
}

function bytesToBools(bytes: Uint8Array, voices: number, steps: number): boolean[][] {
  const tracks: boolean[][] = Array.from({ length: voices }, () => Array(steps).fill(false));
  for (let v = 0; v < voices; v++) {
    for (let s = 0; s < steps; s++) {
      const i = v * steps + s;
      if (bytes[i >> 3] & (1 << (i & 7))) tracks[v][s] = true;
    }
  }
  return tracks;
}

// Base64URL safe (- _ なし) エンコード
function bytesToBase64Url(bytes: Uint8Array): string {
  const bin = String.fromCharCode(...bytes);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

export function encodeShare(state: SharedState): string {
  // Format: v1.{kit}.{bpm}.{swing}.{steps}.{tracksB64}[.{accentsB64}]
  const tracksBytes = boolsToBytes(state.tracks);
  const tracksB64 = bytesToBase64Url(tracksBytes);
  const parts = [
    'v1', state.kitId,
    String(state.bpm), String(state.swing), String(state.steps),
    tracksB64,
  ];
  if (state.accents && state.accents.some((row) => row.some(Boolean))) {
    const accBytes = boolsToBytes(state.accents);
    parts.push(bytesToBase64Url(accBytes));
  }
  return parts.join('.');
}

export function decodeShare(s: string): SharedState | null {
  try {
    const parts = s.split('.');
    if (parts[0] !== 'v1' || parts.length < 6) return null;
    const [, kitId, bpmStr, swingStr, stepsStr, tracksB64, accentsB64] = parts;
    const steps = parseInt(stepsStr, 10);
    const bpm = parseInt(bpmStr, 10);
    const swing = parseInt(swingStr, 10);
    if (!Number.isFinite(steps) || !Number.isFinite(bpm)) return null;
    const tracks = bytesToBools(base64UrlToBytes(tracksB64), 8, steps);
    const accents = accentsB64 ? bytesToBools(base64UrlToBytes(accentsB64), 8, steps) : undefined;
    return { kitId: kitId as KitId, bpm, swing, steps, tracks, accents };
  } catch {
    return null;
  }
}
