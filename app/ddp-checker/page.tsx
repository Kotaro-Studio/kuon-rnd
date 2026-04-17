'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type L3 = Record<Lang, string>;

interface DdpId {
  level: string;
  upcEan: string;
  masterId: string;
}

interface MapPacket {
  valid: boolean;
  dataStreamType: string;
  dataStreamPointer: string;
  dataStreamLength: number;
  dataStreamStart: number;
  subCodeDescriptor: string;
  cdMode: string;
  sourceStorageMode: string;
  trackNumber: string;
  indexNumber: string;
  isrc: string;
  dsi: string;
  // v2.00
  startingFileOffset: number;
}

interface PqPacket {
  valid: boolean;
  trackNumber: string;
  indexNumber: string;
  hours: number;
  minutes: number;
  seconds: number;
  frames: number;
  isrc: string;
  upcEan: string;
}

interface TrackInfo {
  number: number;
  title: string;
  startBytes: number;
  lengthBytes: number;
  durationSeconds: number;
  isrc: string;
  pregapSeconds: number;   // Index 00 → Index 01 gap (pre-gap / pause before track)
  gapSeconds: number;      // silence between previous track end and this track's Index 00
}

interface DdpData {
  ddpId: DdpId;
  mapPackets: MapPacket[];
  pqPackets: PqPacket[];
  tracks: TrackInfo[];
  audioFileName: string;
  audioFile: File | null;
  pqFileName: string;
  totalDuration: number;
  leadInSeconds: number;   // disc lead-in time
  fileCount: number;
  fileNames: string[];
}

type AppStatus = 'idle' | 'loading' | 'parsed' | 'error';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const BYTES_PER_SECTOR = 2352;
const DDPID_LEN = 128;
const DDPMS_PACKET_LEN = 128;
const PQ_PACKET_LEN = 64;
const SAMPLE_RATE = 44100;
const NUM_CHANNELS = 2;
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;
const BYTES_PER_FRAME = BYTES_PER_SAMPLE * NUM_CHANNELS; // 4

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  pageTitle: { ja: 'DDP チェッカー', en: 'DDP Checker', es: 'Verificador DDP' } as L3,
  pageSubtitle: {
    ja: 'DDPファイルセットの内容を確認し、トラックごとに試聴・ダウンロードできるブラウザ完結型ツール。',
    en: 'A browser-based tool to inspect DDP filesets and preview or download individual tracks.',
    es: 'Herramienta de navegador para inspeccionar conjuntos DDP y previsualizar o descargar pistas individuales.',
  } as L3,
  dropTitle: {
    ja: 'DDPフォルダをドロップ',
    en: 'Drop DDP Folder Here',
    es: 'Suelta la carpeta DDP aquí',
  } as L3,
  dropOr: { ja: 'または', en: 'or', es: 'o' } as L3,
  selectFolder: {
    ja: 'フォルダを選択',
    en: 'Select Folder',
    es: 'Seleccionar carpeta',
  } as L3,
  dropHint: {
    ja: 'DDPID、DDPMS、音声データファイルを含むフォルダ',
    en: 'Folder containing DDPID, DDPMS, and audio data files',
    es: 'Carpeta con DDPID, DDPMS y archivos de datos de audio',
  } as L3,
  secDdpInfo: { ja: 'DDP 情報', en: 'DDP Information', es: 'Información DDP' } as L3,
  secTrackList: { ja: 'トラックリスト', en: 'Track List', es: 'Lista de pistas' } as L3,
  secFileList: { ja: 'ファイル構成', en: 'File Structure', es: 'Estructura de archivos' } as L3,
  lblLevel: { ja: 'DDP バージョン', en: 'DDP Version', es: 'Versión DDP' } as L3,
  lblUpc: { ja: 'UPC / EAN', en: 'UPC / EAN', es: 'UPC / EAN' } as L3,
  lblMasterId: { ja: 'マスター ID', en: 'Master ID', es: 'Master ID' } as L3,
  lblAudioFile: { ja: '音声データ', en: 'Audio Data', es: 'Datos de audio' } as L3,
  lblPqFile: { ja: 'PQ 記述子', en: 'PQ Descriptor', es: 'Descriptor PQ' } as L3,
  lblTotalDuration: { ja: '総再生時間', en: 'Total Duration', es: 'Duración total' } as L3,
  lblTotalTracks: { ja: 'トラック数', en: 'Total Tracks', es: 'Total de pistas' } as L3,
  lblLeadIn: { ja: 'リードイン', en: 'Lead-in', es: 'Lead-in' } as L3,
  colTrack: { ja: '#', en: '#', es: '#' } as L3,
  colPregap: { ja: 'プリギャップ', en: 'Pre-gap', es: 'Pre-gap' } as L3,
  colGap: { ja: '曲間', en: 'Gap', es: 'Pausa' } as L3,
  colDuration: { ja: '再生時間', en: 'Duration', es: 'Duración' } as L3,
  colIsrc: { ja: 'ISRC', en: 'ISRC', es: 'ISRC' } as L3,
  colActions: { ja: '操作', en: 'Actions', es: 'Acciones' } as L3,
  btnPlay: { ja: '再生', en: 'Play', es: 'Reproducir' } as L3,
  btnStop: { ja: '停止', en: 'Stop', es: 'Detener' } as L3,
  btnDownload: { ja: 'WAV', en: 'WAV', es: 'WAV' } as L3,
  btnGapListen: { ja: '曲間を聴く', en: 'Gap Listen', es: 'Escuchar pausa' } as L3,
  btnGapListenTip: {
    ja: '前の曲の終わり15秒 → 曲間 → この曲の冒頭を連続再生',
    en: 'Plays last 15s of previous track → gap → start of this track',
    es: 'Reproduce los últimos 15s de la pista anterior → pausa → inicio de esta pista',
  } as L3,
  btnReset: { ja: '別のDDPを確認', en: 'Check Another DDP', es: 'Verificar otro DDP' } as L3,
  errNoDdpid: {
    ja: 'DDPIDファイルが見つかりません。DDPフォルダ全体を選択してください。',
    en: 'DDPID file not found. Please select the entire DDP folder.',
    es: 'No se encontró el archivo DDPID. Seleccione toda la carpeta DDP.',
  } as L3,
  errNoDdpms: {
    ja: 'DDPMSファイルが見つかりません。DDPフォルダ全体を選択してください。',
    en: 'DDPMS file not found. Please select the entire DDP folder.',
    es: 'No se encontró el archivo DDPMS. Seleccione toda la carpeta DDP.',
  } as L3,
  errNoAudio: {
    ja: '音声データファイルが見つかりません。',
    en: 'Audio data file not found.',
    es: 'No se encontró el archivo de datos de audio.',
  } as L3,
  errParseFailed: {
    ja: 'DDPの解析に失敗しました。ファイルが破損している可能性があります。',
    en: 'Failed to parse DDP. The fileset may be corrupted.',
    es: 'Error al analizar DDP. El conjunto de archivos puede estar dañado.',
  } as L3,
  statusValid: { ja: '有効', en: 'Valid', es: 'Válido' } as L3,
  statusInvalid: { ja: '無効', en: 'Invalid', es: 'Inválido' } as L3,
  privacyNote: {
    ja: 'すべての処理はブラウザ内で完結します。音声データがサーバーに送信されることはありません。',
    en: 'All processing happens in your browser. No audio data is sent to any server.',
    es: 'Todo el procesamiento ocurre en su navegador. No se envían datos de audio a ningún servidor.',
  } as L3,
  loadingMsg: {
    ja: 'DDPファイルを解析中…',
    en: 'Analyzing DDP fileset…',
    es: 'Analizando el conjunto DDP…',
  } as L3,
  noIsrc: { ja: '—', en: '—', es: '—' } as L3,
};

// ─────────────────────────────────────────────
// Parsers
// ─────────────────────────────────────────────

function readAscii(buf: ArrayBuffer, offset: number, length: number): string {
  const bytes = new Uint8Array(buf, offset, length);
  let str = '';
  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return str.trim();
}

function parseDdpId(buf: ArrayBuffer): DdpId {
  return {
    level: readAscii(buf, 0, 8),
    upcEan: readAscii(buf, 8, 13),
    masterId: readAscii(buf, 38, 48),
  };
}

function parseDdpMs(buf: ArrayBuffer): MapPacket[] {
  const packets: MapPacket[] = [];
  const count = Math.floor(buf.byteLength / DDPMS_PACKET_LEN);
  for (let i = 0; i < count; i++) {
    const off = i * DDPMS_PACKET_LEN;
    const validStr = readAscii(buf, off, 4);
    const dsiSize = parseInt(readAscii(buf, off + 71, 3), 10) || 0;
    const dsi = dsiSize > 0 ? readAscii(buf, off + 74, Math.min(dsiSize, DDPMS_PACKET_LEN - 74)) : '';

    // v2.00 startingFileOffset — if DSI ends before byte 96+n
    let startingFileOffset = 0;
    const v2OffBase = 74 + dsiSize;
    if (v2OffBase + 23 <= DDPMS_PACKET_LEN) {
      // v2.00: skip newOrange(1) + preGap1Next(4) + pauseBlocks(8) = 13 bytes
      const sfoStr = readAscii(buf, off + v2OffBase + 13, 9);
      const sfo = parseInt(sfoStr, 10);
      if (!isNaN(sfo)) startingFileOffset = sfo;
    }

    packets.push({
      valid: validStr === 'VVVM',
      dataStreamType: readAscii(buf, off + 4, 2),
      dataStreamPointer: readAscii(buf, off + 6, 8),
      dataStreamLength: parseInt(readAscii(buf, off + 14, 8), 10) || 0,
      dataStreamStart: parseInt(readAscii(buf, off + 22, 8), 10) || 0,
      subCodeDescriptor: readAscii(buf, off + 30, 8),
      cdMode: readAscii(buf, off + 38, 2),
      sourceStorageMode: readAscii(buf, off + 40, 1),
      trackNumber: readAscii(buf, off + 55, 2),
      indexNumber: readAscii(buf, off + 57, 2),
      isrc: readAscii(buf, off + 59, 12),
      dsi: dsi,
      startingFileOffset: startingFileOffset,
    });
  }
  return packets;
}

function parsePqDescr(buf: ArrayBuffer): PqPacket[] {
  const packets: PqPacket[] = [];
  const count = Math.floor(buf.byteLength / PQ_PACKET_LEN);
  for (let i = 0; i < count; i++) {
    const off = i * PQ_PACKET_LEN;
    const validStr = readAscii(buf, off, 4);
    packets.push({
      valid: validStr === 'VVVS',
      trackNumber: readAscii(buf, off + 4, 2),
      indexNumber: readAscii(buf, off + 6, 2),
      hours: parseInt(readAscii(buf, off + 8, 2), 10) || 0,
      minutes: parseInt(readAscii(buf, off + 10, 2), 10) || 0,
      seconds: parseInt(readAscii(buf, off + 12, 2), 10) || 0,
      frames: parseInt(readAscii(buf, off + 14, 2), 10) || 0,
      isrc: readAscii(buf, off + 20, 12),
      upcEan: readAscii(buf, off + 32, 13),
    });
  }
  return packets;
}

function pqToBytes(pq: PqPacket): number {
  const sectors = ((pq.hours * 3600 + pq.minutes * 60 + pq.seconds) * 75 + pq.frames);
  return sectors * BYTES_PER_SECTOR;
}

function pqToSeconds(pq: PqPacket): number {
  return pq.hours * 3600 + pq.minutes * 60 + pq.seconds + pq.frames / 75;
}

interface BuildResult {
  tracks: TrackInfo[];
  leadInSeconds: number;
}

function buildTrackList(pqPackets: PqPacket[], mapPackets: MapPacket[], audioFileSize: number): BuildResult {
  // Collect Index 00 (pre-gap start) and Index 01 (track audio start) for each track
  const index00Map = new Map<number, PqPacket>(); // trackNum → PQ with index 00
  const index01Map = new Map<number, PqPacket>(); // trackNum → PQ with index 01

  for (const p of pqPackets) {
    if (!p.valid) continue;
    const tn = parseInt(p.trackNumber, 10);
    if (tn < 1 || tn > 99) continue;
    if (p.indexNumber === '00') index00Map.set(tn, p);
    if (p.indexNumber === '01') index01Map.set(tn, p);
  }

  // Sort track numbers
  const trackNums = Array.from(index01Map.keys()).sort((a, b) => a - b);

  // Find dataStreamStart from DDPMS for offset correction
  const mainStream = mapPackets.find(mp =>
    mp.valid && mp.cdMode === 'DA' && mp.dataStreamType === 'DM'
  );
  const dsStartBytes = mainStream ? mainStream.dataStreamStart * BYTES_PER_SECTOR : 0;
  const fileOffset = mainStream ? mainStream.startingFileOffset : 0;

  // Lead-in: time from absolute 00:00:00.00 to the first track's earliest point
  let leadInSeconds = 0;
  if (trackNums.length > 0) {
    const firstTn = trackNums[0];
    const first00 = index00Map.get(firstTn);
    const first01 = index01Map.get(firstTn)!;
    const earliestPq = first00 || first01;
    leadInSeconds = pqToSeconds(earliestPq);
  }

  const tracks: TrackInfo[] = [];

  for (let i = 0; i < trackNums.length; i++) {
    const tn = trackNums[i];
    const pq01 = index01Map.get(tn)!;
    const pq00 = index00Map.get(tn);

    // Byte offsets for audio slicing (Index 01 based)
    const startBytes = pqToBytes(pq01) - dsStartBytes + fileOffset;
    const nextStartBytes = i < trackNums.length - 1
      ? pqToBytes(index01Map.get(trackNums[i + 1])!) - dsStartBytes + fileOffset
      : audioFileSize;
    const lengthBytes = Math.max(0, nextStartBytes - startBytes);
    const durationSeconds = lengthBytes / (SAMPLE_RATE * BYTES_PER_FRAME);

    // Pre-gap: Index 00 → Index 01 (silence/countdown before track audio starts)
    let pregapSeconds = 0;
    if (pq00) {
      pregapSeconds = Math.max(0, pqToSeconds(pq01) - pqToSeconds(pq00));
    }

    // Gap (inter-track silence): previous track's Index 01 end → this track's earliest point
    // "Previous track end" = this track's Index 01 start (in the continuous timeline)
    // "This track earliest" = Index 00 if present, else Index 01
    let gapSeconds = 0;
    if (i > 0) {
      const prevTn = trackNums[i - 1];
      const prevPq01 = index01Map.get(prevTn)!;
      const prevNextStart = pqToSeconds(pq01); // previous track's audio ends where this track's audio begins
      // Previous track's actual audio duration in absolute time
      const prevStart = pqToSeconds(prevPq01);
      const prevAudioEnd = prevStart + (pqToBytes(pq01) - pqToBytes(prevPq01)) / (SAMPLE_RATE * BYTES_PER_FRAME);
      // Gap = from previous Index 01 end to this track's Index 00 (or Index 01 if no 00)
      const thisEarliest = pq00 ? pqToSeconds(pq00) : pqToSeconds(pq01);
      // Simpler: gap = thisEarliest - prevNextStart (in absolute PQ time)
      // prevNextStart = the A-time of this track's Index 01
      // But actually: the previous track's audio ends at this track's Index 01 (since we slice Index01 to Index01)
      // So "silence between tracks" = this track's Index 00 time - previous track's Index 01 end time
      // Previous track ends at: this Index 01 in absolute time? No — previous track audio ends where the next index01 starts
      // Let me simplify: gap = time from previous track's Index 01 + previous track duration → this track's Index 00
      const prevEndAbsolute = pqToSeconds(pq01); // this is where prev track's audio data ends
      gapSeconds = Math.max(0, thisEarliest - prevEndAbsolute);
      // If no Index 00 for this track, pregap is 0 and gap captures the full inter-track space
      // If Index 00 exists, gap = prev_end → Index00, pregap = Index00 → Index01
    }

    // Find ISRC from map packets for this track
    const mapEntry = mapPackets.find(mp =>
      mp.valid && mp.trackNumber === pq01.trackNumber && mp.isrc.trim().length > 0
    );
    const isrc = mapEntry?.isrc || pq01.isrc || '';

    tracks.push({
      number: tn,
      title: `Track ${tn.toString().padStart(2, '0')}`,
      startBytes: Math.max(0, startBytes),
      lengthBytes,
      durationSeconds,
      isrc: isrc.trim(),
      pregapSeconds,
      gapSeconds,
    });
  }

  return { tracks, leadInSeconds };
}

function buildWavBlob(pcmData: ArrayBuffer): Blob {
  const dataLen = pcmData.byteLength;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF header
  view.setUint32(0, 0x52494646, false);  // "RIFF"
  view.setUint32(4, 36 + dataLen, true);
  view.setUint32(8, 0x57415645, false);   // "WAVE"
  // fmt chunk
  view.setUint32(12, 0x666D7420, false);  // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);            // PCM
  view.setUint16(22, NUM_CHANNELS, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * BYTES_PER_FRAME, true);
  view.setUint16(32, BYTES_PER_FRAME, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);
  // data chunk
  view.setUint32(36, 0x64617461, false);  // "data"
  view.setUint32(40, dataLen, true);

  return new Blob([header, pcmData], { type: 'audio/wav' });
}

// ─────────────────────────────────────────────
// Helper: find file case-insensitively
// ─────────────────────────────────────────────
function findFile(files: Map<string, File>, ...names: string[]): File | undefined {
  for (const name of names) {
    // Direct match
    const direct = files.get(name);
    if (direct) return direct;
    // Case-insensitive
    const lower = name.toLowerCase();
    for (const [key, file] of files) {
      if (key.toLowerCase() === lower) return file;
    }
  }
  return undefined;
}

// ─────────────────────────────────────────────
// Format helpers
// ─────────────────────────────────────────────
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatGap(seconds: number): string {
  if (seconds <= 0) return '—';
  const s = Math.floor(seconds);
  const f = Math.round((seconds - s) * 75); // remaining CD frames
  if (s === 0 && f === 0) return '—';
  return `${s}.${f.toString().padStart(2, '0')}s`;
}

function formatTotalDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function DdpCheckerPage() {
  const { lang } = useLang();
  const t = (l3: L3) => l3[lang] || l3.en;

  const [status, setStatus] = useState<AppStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [ddpData, setDdpData] = useState<DdpData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const [playingMode, setPlayingMode] = useState<'track' | 'gap' | null>(null);
  const [gapTrack, setGapTrack] = useState<number | null>(null); // which track's gap is being previewed

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      sourceRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, []);

  // ─── Parse DDP from file list ───
  const parseDdp = useCallback(async (fileList: FileList | File[]) => {
    setStatus('loading');
    setErrorMsg('');
    setDdpData(null);
    setPlayingTrack(null);
    setPlayingMode(null);
    setGapTrack(null);
    sourceRef.current?.stop();

    try {
      // Build filename -> File map (strip path prefix for folder uploads)
      const files = new Map<string, File>();
      const allFileNames: string[] = [];

      for (let i = 0; i < (fileList instanceof FileList ? fileList.length : fileList.length); i++) {
        const f = fileList instanceof FileList ? fileList[i] : fileList[i];
        // webkitRelativePath can be "folder/DDPID" — strip to just "DDPID"
        const path = (f as any).webkitRelativePath || f.name;
        const basename = path.split('/').pop() || f.name;
        files.set(basename, f);
        allFileNames.push(basename);
      }

      // 1. Parse DDPID
      const ddpidFile = findFile(files, 'DDPID');
      if (!ddpidFile) {
        setErrorMsg(t(T.errNoDdpid));
        setStatus('error');
        return;
      }
      const ddpidBuf = await ddpidFile.arrayBuffer();
      const ddpId = parseDdpId(ddpidBuf);

      // 2. Parse DDPMS
      const ddpmsFile = findFile(files, 'DDPMS');
      if (!ddpmsFile) {
        setErrorMsg(t(T.errNoDdpms));
        setStatus('error');
        return;
      }
      const ddpmsBuf = await ddpmsFile.arrayBuffer();
      const mapPackets = parseDdpMs(ddpmsBuf);

      // 3. Find audio file via DSI in DDPMS
      const mainDm = mapPackets.find(mp => mp.valid && (mp.dataStreamType === 'DM' || mp.cdMode === 'DA'));
      const audioFileName = mainDm?.dsi || 'IMAGE.DAT';
      const audioFile = findFile(files, audioFileName, 'IMAGE.DAT', 'image.dat');
      if (!audioFile) {
        setErrorMsg(t(T.errNoAudio));
        setStatus('error');
        return;
      }

      // 4. Find and parse PQ descriptor
      const pqDsi = mapPackets.find(mp =>
        mp.valid && (mp.subCodeDescriptor.includes('PQ') || mp.dataStreamType === 'S0' || mp.dataStreamType === 'S1')
      );
      const pqFileName = pqDsi?.dsi || 'PQDESCR';
      const pqFile = findFile(files, pqFileName, 'PQDESCR', 'SD');
      let pqPackets: PqPacket[] = [];
      if (pqFile) {
        const pqBuf = await pqFile.arrayBuffer();
        pqPackets = parsePqDescr(pqBuf);
      }

      // 5. Build track list
      const { tracks, leadInSeconds } = buildTrackList(pqPackets, mapPackets, audioFile.size);
      const totalDuration = tracks.reduce((sum, tr) => sum + tr.durationSeconds, 0);

      setDdpData({
        ddpId,
        mapPackets,
        pqPackets,
        tracks,
        audioFileName,
        audioFile,
        pqFileName: pqFile ? (pqDsi?.dsi || 'PQDESCR') : '',
        totalDuration,
        leadInSeconds,
        fileCount: allFileNames.length,
        fileNames: allFileNames.sort(),
      });
      setStatus('parsed');

    } catch (err) {
      console.error('DDP parse error:', err);
      setErrorMsg(t(T.errParseFailed));
      setStatus('error');
    }
  }, [lang]);

  // ─── Playback helpers ───
  const ensureAudioCtx = useCallback(async () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();
    return ctx;
  }, []);

  const pcmToAudioBuffer = (ctx: AudioContext, rawPcm: ArrayBuffer): AudioBuffer => {
    const sampleCount = Math.floor(rawPcm.byteLength / BYTES_PER_FRAME);
    const audioBuffer = ctx.createBuffer(NUM_CHANNELS, sampleCount, SAMPLE_RATE);
    const dataView = new DataView(rawPcm);
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    for (let i = 0; i < sampleCount; i++) {
      const byteOff = i * BYTES_PER_FRAME;
      left[i] = dataView.getInt16(byteOff, true) / 32768;
      right[i] = dataView.getInt16(byteOff + 2, true) / 32768;
    }
    return audioBuffer;
  };

  // ─── Normal track playback ───
  const playTrack = useCallback(async (track: TrackInfo) => {
    if (!ddpData?.audioFile) return;

    sourceRef.current?.stop();
    setPlayingTrack(track.number);
    setPlayingMode('track');
    setGapTrack(null);

    try {
      const ctx = await ensureAudioCtx();
      const rawSlice = await ddpData.audioFile.slice(track.startBytes, track.startBytes + track.lengthBytes).arrayBuffer();
      const audioBuffer = pcmToAudioBuffer(ctx, rawSlice);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => { setPlayingTrack(null); setPlayingMode(null); };
      source.start();
      sourceRef.current = source;
    } catch (err) {
      console.error('Playback error:', err);
      setPlayingTrack(null);
      setPlayingMode(null);
    }
  }, [ddpData, ensureAudioCtx]);

  // ─── Gap transition playback ───
  // Plays: previous track's last ~15 seconds → gap → current track's first ~5 seconds
  const playGapTransition = useCallback(async (trackIndex: number) => {
    if (!ddpData?.audioFile || trackIndex < 1) return;

    const prevTrack = ddpData.tracks[trackIndex - 1];
    const thisTrack = ddpData.tracks[trackIndex];
    if (!prevTrack || !thisTrack) return;

    sourceRef.current?.stop();
    setPlayingTrack(thisTrack.number);
    setPlayingMode('gap');
    setGapTrack(thisTrack.number);

    try {
      const ctx = await ensureAudioCtx();

      // Calculate byte ranges
      const TAIL_SECONDS = 15;
      const HEAD_SECONDS = 5;

      // Previous track: last 15 seconds (or full track if shorter)
      const prevTailBytes = Math.min(
        Math.floor(TAIL_SECONDS * SAMPLE_RATE * BYTES_PER_FRAME),
        prevTrack.lengthBytes
      );
      const prevStartByte = prevTrack.startBytes + prevTrack.lengthBytes - prevTailBytes;

      // This track: first 5 seconds (or full track if shorter)
      const thisHeadBytes = Math.min(
        Math.floor(HEAD_SECONDS * SAMPLE_RATE * BYTES_PER_FRAME),
        thisTrack.lengthBytes
      );

      // The "gap" is everything between prev track end and this track start in raw file
      const prevEndByte = prevTrack.startBytes + prevTrack.lengthBytes;
      const gapBytes = Math.max(0, thisTrack.startBytes - prevEndByte);

      // Total region: prevTail + gap + thisHead
      // Read as continuous region from the raw file for perfect continuity
      const totalStartByte = prevStartByte;
      const totalEndByte = thisTrack.startBytes + thisHeadBytes;
      const totalLength = totalEndByte - totalStartByte;

      const rawSlice = await ddpData.audioFile.slice(totalStartByte, totalEndByte).arrayBuffer();
      const audioBuffer = pcmToAudioBuffer(ctx, rawSlice);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setPlayingTrack(null);
        setPlayingMode(null);
        setGapTrack(null);
      };
      source.start();
      sourceRef.current = source;
    } catch (err) {
      console.error('Gap playback error:', err);
      setPlayingTrack(null);
      setPlayingMode(null);
      setGapTrack(null);
    }
  }, [ddpData, ensureAudioCtx]);

  const stopPlayback = useCallback(() => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setPlayingTrack(null);
    setPlayingMode(null);
    setGapTrack(null);
  }, []);

  // ─── WAV Download ───
  const downloadTrack = useCallback(async (track: TrackInfo) => {
    if (!ddpData?.audioFile) return;
    const rawSlice = await ddpData.audioFile.slice(track.startBytes, track.startBytes + track.lengthBytes).arrayBuffer();
    const wavBlob = buildWavBlob(rawSlice);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Track${track.number.toString().padStart(2, '0')}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [ddpData]);

  // ─── Reset ───
  const reset = useCallback(() => {
    sourceRef.current?.stop();
    setStatus('idle');
    setDdpData(null);
    setErrorMsg('');
    setPlayingTrack(null);
    setPlayingMode(null);
    setGapTrack(null);
  }, []);

  // ─── Drop handlers ───
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const allFiles: File[] = [];

    // Try to read as directory
    const entries: FileSystemEntry[] = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.();
      if (entry) entries.push(entry);
    }

    if (entries.length > 0) {
      for (const entry of entries) {
        if (entry.isDirectory) {
          const dirReader = (entry as FileSystemDirectoryEntry).createReader();
          const readAll = (): Promise<FileSystemEntry[]> => new Promise((resolve) => {
            const allEntries: FileSystemEntry[] = [];
            const readBatch = () => {
              dirReader.readEntries((batch) => {
                if (batch.length === 0) {
                  resolve(allEntries);
                } else {
                  allEntries.push(...batch);
                  readBatch();
                }
              });
            };
            readBatch();
          });
          const dirEntries = await readAll();
          for (const de of dirEntries) {
            if (de.isFile) {
              const file = await new Promise<File>((resolve) => {
                (de as FileSystemFileEntry).file(resolve);
              });
              allFiles.push(file);
            }
          }
        } else if (entry.isFile) {
          const file = await new Promise<File>((resolve) => {
            (entry as FileSystemFileEntry).file(resolve);
          });
          allFiles.push(file);
        }
      }
      if (allFiles.length > 0) {
        parseDdp(allFiles);
        return;
      }
    }

    // Fallback: plain files
    if (e.dataTransfer.files.length > 0) {
      parseDdp(e.dataTransfer.files);
    }
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      parseDdp(e.target.files);
    }
  };

  // ─── Styles ───
  const containerStyle: React.CSSProperties = {
    maxWidth: 960,
    margin: '0 auto',
    padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 40px)',
    fontFamily: sans,
  };

  const heroStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: 'clamp(32px, 6vw, 56px)',
  };

  const dropZoneStyle: React.CSSProperties = {
    border: isDragging ? '2px solid #0284c7' : '2px dashed rgba(0,0,0,0.15)',
    borderRadius: 20,
    padding: 'clamp(40px, 8vw, 80px) 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: isDragging ? 'rgba(2,132,199,0.04)' : 'rgba(255,255,255,0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  };

  const sectionCardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 'clamp(20px, 4vw, 32px)',
    marginBottom: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 'clamp(18px, 3vw, 22px)',
    fontWeight: 600,
    marginBottom: 20,
    color: '#111827',
    letterSpacing: '0.02em',
  };

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    fontSize: 'clamp(13px, 2vw, 15px)',
  };

  const labelStyle: React.CSSProperties = {
    color: '#6b7280',
    fontWeight: 500,
    minWidth: 120,
  };

  const valueStyle: React.CSSProperties = {
    color: '#111827',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    textAlign: 'right' as const,
    wordBreak: 'break-all' as const,
  };

  const btnPrimary: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 50,
    border: 'none',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#fff',
    background: '#0284c7',
  };

  const btnOutline: React.CSSProperties = {
    ...btnPrimary,
    color: '#0284c7',
    background: 'transparent',
    border: '1px solid #0284c7',
  };

  const btnSmall: React.CSSProperties = {
    padding: '5px 12px',
    fontSize: 12,
    borderRadius: 50,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: 500,
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div style={containerStyle}>
      {/* ── Hero ── */}
      <div style={heroStyle} className="hero-enter-1">
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          marginBottom: 12,
          background: 'linear-gradient(135deg, #111827, #0284c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {t(T.pageTitle)}
        </h1>
        <p style={{
          fontFamily: sans,
          fontSize: 'clamp(14px, 2.2vw, 17px)',
          color: '#6b7280',
          maxWidth: 640,
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          {t(T.pageSubtitle)}
        </p>
      </div>

      {/* ── Drop Zone (idle) ── */}
      {status === 'idle' && (
        <div
          className="hero-enter-2"
          style={dropZoneStyle}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📂</div>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(16px, 3vw, 20px)',
            fontWeight: 600,
            marginBottom: 12,
            color: '#111827',
          }}>
            {t(T.dropTitle)}
          </p>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
            {t(T.dropOr)}
          </p>
          <button style={btnPrimary} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            {t(T.selectFolder)}
          </button>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 20 }}>
            {t(T.dropHint)}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            // @ts-expect-error — webkitdirectory is not in React's type defs
            webkitdirectory=""
            directory=""
            multiple
            style={{ display: 'none' }}
            onChange={handleFolderSelect}
          />
        </div>
      )}

      {/* ── Loading ── */}
      {status === 'loading' && (
        <div style={{ ...sectionCardStyle, textAlign: 'center', padding: '60px 24px' }}>
          <div style={{
            display: 'inline-flex',
            gap: 4,
            height: 30,
            alignItems: 'flex-end',
            marginBottom: 16,
            color: '#0284c7',
          }}>
            {[0, 1, 2, 3, 4].map(i => (
              <span key={i} className="waveform-bar" style={{ height: 24 }} />
            ))}
          </div>
          <p style={{ color: '#6b7280', fontSize: 15 }}>{t(T.loadingMsg)}</p>
        </div>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <div style={{ ...sectionCardStyle, textAlign: 'center', borderColor: 'rgba(239,68,68,0.3)' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>⚠️</p>
          <p style={{ color: '#ef4444', fontSize: 15, marginBottom: 20 }}>{errorMsg}</p>
          <button style={btnPrimary} onClick={reset}>{t(T.btnReset)}</button>
        </div>
      )}

      {/* ── Results ── */}
      {status === 'parsed' && ddpData && (
        <>
          {/* DDP Info */}
          <div style={sectionCardStyle} className="hero-enter-1">
            <h2 style={sectionTitleStyle}>{t(T.secDdpInfo)}</h2>
            <div style={infoRowStyle}>
              <span style={labelStyle}>{t(T.lblLevel)}</span>
              <span style={valueStyle}>{ddpData.ddpId.level}</span>
            </div>
            {ddpData.ddpId.upcEan && (
              <div style={infoRowStyle}>
                <span style={labelStyle}>{t(T.lblUpc)}</span>
                <span style={valueStyle}>{ddpData.ddpId.upcEan}</span>
              </div>
            )}
            {ddpData.ddpId.masterId && (
              <div style={infoRowStyle}>
                <span style={labelStyle}>{t(T.lblMasterId)}</span>
                <span style={valueStyle}>{ddpData.ddpId.masterId}</span>
              </div>
            )}
            <div style={infoRowStyle}>
              <span style={labelStyle}>{t(T.lblAudioFile)}</span>
              <span style={valueStyle}>{ddpData.audioFileName}</span>
            </div>
            {ddpData.pqFileName && (
              <div style={infoRowStyle}>
                <span style={labelStyle}>{t(T.lblPqFile)}</span>
                <span style={valueStyle}>{ddpData.pqFileName}</span>
              </div>
            )}
            <div style={infoRowStyle}>
              <span style={labelStyle}>{t(T.lblTotalTracks)}</span>
              <span style={valueStyle}>{ddpData.tracks.length}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>{t(T.lblTotalDuration)}</span>
              <span style={valueStyle}>{formatTotalDuration(ddpData.totalDuration)}</span>
            </div>
            <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
              <span style={labelStyle}>{t(T.lblLeadIn)}</span>
              <span style={valueStyle}>{formatGap(ddpData.leadInSeconds)}</span>
            </div>
          </div>

          {/* Track List */}
          <div style={sectionCardStyle} className="hero-enter-2">
            <h2 style={sectionTitleStyle}>{t(T.secTrackList)}</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'clamp(12px, 2vw, 14px)',
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.08)' }}>
                    {[T.colTrack, T.colPregap, T.colGap, T.colDuration, T.colIsrc, T.colActions].map((col, i) => (
                      <th key={i} style={{
                        textAlign: i === 5 ? 'right' : 'left',
                        padding: '10px 8px',
                        color: '#6b7280',
                        fontWeight: 600,
                        fontSize: 12,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}>
                        {t(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ddpData.tracks.map((track, trackIdx) => {
                    const isPlaying = playingTrack === track.number;
                    const isGapMode = isPlaying && playingMode === 'gap';
                    const isTrackMode = isPlaying && playingMode === 'track';
                    const canGapListen = trackIdx > 0; // 2曲目以降のみ
                    return (
                      <tr key={track.number} style={{
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        background: isPlaying ? (isGapMode ? 'rgba(124,58,237,0.04)' : 'rgba(2,132,199,0.04)') : 'transparent',
                        transition: 'background 0.2s',
                      }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                          }}>
                            {isPlaying && (
                              <span style={{ display: 'inline-flex', gap: 2, height: 16, alignItems: 'flex-end', color: isGapMode ? '#7C3AED' : '#0284c7' }}>
                                {[0, 1, 2, 3].map(i => (
                                  <span key={i} className="waveform-bar" style={{ height: 12 }} />
                                ))}
                              </span>
                            )}
                            {track.number.toString().padStart(2, '0')}
                          </span>
                        </td>
                        <td style={{
                          padding: '12px 8px',
                          fontFamily: '"SF Mono", "Fira Code", monospace',
                          fontSize: 12,
                          color: track.pregapSeconds > 0 ? '#111827' : '#d1d5db',
                        }}>
                          {formatGap(track.pregapSeconds)}
                        </td>
                        <td style={{
                          padding: '12px 8px',
                          fontFamily: '"SF Mono", "Fira Code", monospace',
                          fontSize: 12,
                          color: track.gapSeconds > 0 ? '#111827' : '#d1d5db',
                        }}>
                          {track.number === 1 ? '—' : formatGap(track.gapSeconds)}
                        </td>
                        <td style={{ padding: '12px 8px', fontFamily: '"SF Mono", "Fira Code", monospace' }}>
                          {formatDuration(track.durationSeconds)}
                        </td>
                        <td style={{
                          padding: '12px 8px',
                          fontFamily: '"SF Mono", "Fira Code", monospace',
                          fontSize: 12,
                          color: track.isrc ? '#111827' : '#9ca3af',
                        }}>
                          {track.isrc || t(T.noIsrc)}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {/* Gap Listen button (track 2+) */}
                          {canGapListen && (
                            <button
                              title={t(T.btnGapListenTip)}
                              style={{
                                ...btnSmall,
                                color: isGapMode ? '#fff' : '#7C3AED',
                                background: isGapMode ? '#7C3AED' : 'rgba(124,58,237,0.08)',
                                marginRight: 6,
                              }}
                              onClick={() => isGapMode ? stopPlayback() : playGapTransition(trackIdx)}
                            >
                              {isGapMode ? '■ ' + t(T.btnStop) : '⏮ ' + t(T.btnGapListen)}
                            </button>
                          )}
                          <button
                            style={{
                              ...btnSmall,
                              color: isTrackMode ? '#fff' : '#0284c7',
                              background: isTrackMode ? '#0284c7' : 'rgba(2,132,199,0.08)',
                              marginRight: 6,
                            }}
                            onClick={() => isTrackMode ? stopPlayback() : playTrack(track)}
                          >
                            {isTrackMode ? '■ ' + t(T.btnStop) : '▶ ' + t(T.btnPlay)}
                          </button>
                          <button
                            style={{
                              ...btnSmall,
                              color: '#0284c7',
                              background: 'rgba(2,132,199,0.08)',
                            }}
                            onClick={() => downloadTrack(track)}
                          >
                            ↓ {t(T.btnDownload)}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* File Structure */}
          <div style={sectionCardStyle} className="hero-enter-3">
            <h2 style={sectionTitleStyle}>{t(T.secFileList)}</h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}>
              {ddpData.fileNames.map((fn) => {
                const isKey = ['DDPID', 'DDPMS'].includes(fn.toUpperCase()) || fn === ddpData.audioFileName;
                return (
                  <span key={fn} style={{
                    display: 'inline-block',
                    padding: '6px 14px',
                    borderRadius: 50,
                    fontSize: 13,
                    fontFamily: '"SF Mono", "Fira Code", monospace',
                    background: isKey ? 'rgba(2,132,199,0.08)' : 'rgba(0,0,0,0.03)',
                    color: isKey ? '#0284c7' : '#6b7280',
                    fontWeight: isKey ? 600 : 400,
                    border: isKey ? '1px solid rgba(2,132,199,0.2)' : '1px solid rgba(0,0,0,0.06)',
                  }}>
                    {fn}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Privacy note */}
          <p style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#9ca3af',
            marginBottom: 24,
          }}>
            🔒 {t(T.privacyNote)}
          </p>

          {/* Reset button */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button style={btnOutline} onClick={reset}>
              {t(T.btnReset)}
            </button>
          </div>
        </>
      )}

      {/* Privacy note on idle too */}
      {status === 'idle' && (
        <p className="hero-enter-3" style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#9ca3af',
          marginTop: 32,
        }}>
          🔒 {t(T.privacyNote)}
        </p>
      )}
    </div>
  );
}
