'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ============================================================================
// TYPES
// ============================================================================

type L5 = Record<Lang, string>;
type Mode = 'note' | 'keysig' | 'clef' | 'convert';
type ClefType = 'treble' | 'bass' | 'alto' | 'tenor';
type NotationSystem = 'deutsch' | 'english' | 'japanese';

interface StaffNote { name: string; octave: number; midi: number; pos: number; }

type Question =
  | { type: 'staff'; clef: ClefType; staffY: number; accidental?: 'sharp' | 'flat'; correctAnswer: string; choices: string[] }
  | { type: 'keysig'; sharps: number; flats: number; correctAnswer: string; choices: string[] }
  | { type: 'convert'; sourceSystem: NotationSystem; sourceText: string; correctAnswer: string; choices: string[] };

interface UserStats {
  level: number; xp: number; totalCorrect: number; totalAttempted: number;
  dailyStreak: number; lastPlayDate: string; achievements: string[];
  modeStats: Record<Mode, { correct: number; total: number }>;
  bestStreak: number; history: { date: string; mode: Mode; correct: boolean; detail: string }[];
}

interface Achievement { id: string; name: L5; icon: string; description: L5; check: (s: UserStats) => boolean; }

// ============================================================================
// CONSTANTS & DESIGN
// ============================================================================

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#8b5cf6'; const GREEN = '#22c55e'; const RED = '#ef4444'; const GOLD = '#f59e0b';
function xpForLevel(lv: number) { return Math.floor(100 * (1 + (lv - 1) * 0.15)); }

// ============================================================================
// NOTATION SYSTEM — THE CORE
// ============================================================================
// Internal representation uses English letters: C D E F G A B
// German: H = B-natural, B = B-flat. Helmholtz octave (case + primes).
// English: Scientific pitch notation (C4, F#4).
// Japanese: イロハ system (ハ=C, ニ=D, ホ=E, ヘ=F, ト=G, イ=A, ロ=B).

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const JA_MAP: Record<string, string> = { C: 'ハ', D: 'ニ', E: 'ホ', F: 'ヘ', G: 'ト', A: 'イ', B: 'ロ' };

function getGermanRoot(letter: string, acc?: 'sharp' | 'flat'): string {
  if (letter === 'B') {
    if (acc === 'flat') return 'B\u266D';  // Bb = B♭ in German (with ♭ to distinguish from H)
    if (acc === 'sharp') return 'His';  // B# = His
    return 'H';                          // B-natural = H
  }
  if (!acc) return letter;
  if (acc === 'sharp') return letter + 'is';
  // Flat special forms
  if (letter === 'E') return 'Es';
  if (letter === 'A') return 'As';
  return letter + 'es'; // Ces, Des, Fes, Ges
}

function formatNote(letter: string, octave: number, acc: 'sharp' | 'flat' | undefined, sys: NotationSystem): string {
  if (sys === 'japanese') {
    const base = JA_MAP[letter] || letter;
    if (acc === 'sharp') return '\u5D4E' + base; // 嬰
    if (acc === 'flat') return '\u5909' + base;   // 変
    return base;
  }
  if (sys === 'english') {
    const a = acc === 'sharp' ? '#' : acc === 'flat' ? 'b' : '';
    return `${letter}${a}${octave}`;
  }
  // Deutsch — Helmholtz notation
  const root = getGermanRoot(letter, acc);
  if (octave <= 1) {
    const base = root.charAt(0).toUpperCase() + root.slice(1).toLowerCase();
    return octave === 1 ? base : base + '\u2081'; // subscript 1 for contra
  }
  if (octave === 2) return root.charAt(0).toUpperCase() + root.slice(1).toLowerCase();
  if (octave === 3) return root.toLowerCase();
  return root.toLowerCase() + "'".repeat(octave - 3);
}

function formatNoteNameOnly(letter: string, acc: 'sharp' | 'flat' | undefined, sys: NotationSystem): string {
  if (sys === 'japanese') return formatNote(letter, 0, acc, 'japanese');
  if (sys === 'english') {
    const a = acc === 'sharp' ? '#' : acc === 'flat' ? 'b' : '';
    return `${letter}${a}`;
  }
  // Deutsch: citation form (uppercase)
  const root = getGermanRoot(letter, acc);
  return root.charAt(0).toUpperCase() + root.slice(1).toLowerCase();
}

// ============================================================================
// KEY SIGNATURE DATA — All 15 keys × 3 notation systems
// ============================================================================
// [sharps, flats, de-major, de-minor, en-major, en-minor, ja-major, ja-minor]

const KS_RAW: [number, number, string, string, string, string, string, string][] = [
  [0, 0, 'C-dur',   'a-moll',   'C major',  'A minor',  'ハ長調',   'イ短調'],
  [1, 0, 'G-dur',   'e-moll',   'G major',  'E minor',  'ト長調',   'ホ短調'],
  [2, 0, 'D-dur',   'h-moll',   'D major',  'B minor',  'ニ長調',   'ロ短調'],
  [3, 0, 'A-dur',   'fis-moll', 'A major',  'F# minor', 'イ長調',   '嬰ヘ短調'],
  [4, 0, 'E-dur',   'cis-moll', 'E major',  'C# minor', 'ホ長調',   '嬰ハ短調'],
  [5, 0, 'H-dur',   'gis-moll', 'B major',  'G# minor', 'ロ長調',   '嬰ト短調'],
  [6, 0, 'Fis-dur', 'dis-moll', 'F# major', 'D# minor', '嬰ヘ長調', '嬰ニ短調'],
  [7, 0, 'Cis-dur', 'ais-moll', 'C# major', 'A# minor', '嬰ハ長調', '嬰イ短調'],
  [0, 1, 'F-dur',   'd-moll',   'F major',  'D minor',  'ヘ長調',   'ニ短調'],
  [0, 2, 'B\u266D-dur', 'g-moll',   'Bb major', 'G minor',  '変ロ長調', 'ト短調'],
  [0, 3, 'Es-dur',  'c-moll',   'Eb major', 'C minor',  '変ホ長調', 'ハ短調'],
  [0, 4, 'As-dur',  'f-moll',   'Ab major', 'F minor',  '変イ長調', 'ヘ短調'],
  [0, 5, 'Des-dur', 'b\u266D-moll', 'Db major', 'Bb minor', '変ニ長調', '変ロ短調'],
  [0, 6, 'Ges-dur', 'es-moll',  'Gb major', 'Eb minor', '変ト長調', '変ホ短調'],
  [0, 7, 'Ces-dur', 'as-moll',  'Cb major', 'Ab minor', '変ハ長調', '変イ短調'],
];

interface KeySigDef {
  sharps: number; flats: number;
  names: Record<NotationSystem, { major: string; minor: string }>;
}
const KEY_SIGS: KeySigDef[] = KS_RAW.map(([s, f, dm, dn, em, en, jm, jn]) => ({
  sharps: s, flats: f,
  names: { deutsch: { major: dm, minor: dn }, english: { major: em, minor: en }, japanese: { major: jm, minor: jn } },
}));

// ============================================================================
// STAFF NOTE GENERATION (fixed Helmholtz-correct mapping)
// ============================================================================
// pos 0 = bottom line, pos 8 = top line of 5-line staff
// startNote is the note at pos -4 (2 ledger lines below)

function buildStaffNotes(clef: ClefType): StaffNote[] {
  const notes: StaffNote[] = [];
  const start = clef === 'treble' ? { name: 'A', oct: 3, midi: 57 }
    : clef === 'bass' ? { name: 'C', oct: 2, midi: 36 }
    : clef === 'alto' ? { name: 'B', oct: 2, midi: 47 }
    : /* tenor */ { name: 'G', oct: 2, midi: 43 };

  let ni = NOTE_NAMES.indexOf(start.name), oct = start.oct, midi = start.midi;
  for (let pos = -4; pos <= 12; pos++) {
    notes.push({ name: NOTE_NAMES[ni], octave: oct, midi, pos });
    const prev = NOTE_NAMES[ni];
    ni++; if (ni >= 7) { ni = 0; oct++; }
    midi += (prev === 'E' || prev === 'B') ? 1 : 2;
  }
  return notes;
}

// Level-gated content
function getNoteLevelRange(lv: number): { min: number; max: number; clefs: ClefType[] } {
  if (lv <= 2) return { min: 0, max: 8, clefs: ['treble'] };
  if (lv <= 4) return { min: -2, max: 10, clefs: ['treble'] };
  if (lv <= 6) return { min: -2, max: 10, clefs: ['treble', 'bass'] };
  if (lv <= 8) return { min: -4, max: 12, clefs: ['treble', 'bass'] };
  return { min: -4, max: 12, clefs: ['treble', 'bass', 'alto', 'tenor'] };
}
function getKSMaxAcc(lv: number) { return lv <= 2 ? 2 : lv <= 4 ? 4 : lv <= 6 ? 5 : 7; }

// ============================================================================
// CONVERSION MODE DATA — 12 standard chromatic notes
// ============================================================================

const CONV_NOTES: { letter: string; acc?: 'sharp' | 'flat' }[] = [
  { letter: 'C' }, { letter: 'C', acc: 'sharp' }, { letter: 'D' },
  { letter: 'E', acc: 'flat' }, { letter: 'E' }, { letter: 'F' },
  { letter: 'F', acc: 'sharp' }, { letter: 'G' },
  { letter: 'A', acc: 'flat' }, { letter: 'A' },
  { letter: 'B', acc: 'flat' }, { letter: 'B' },
];

// ============================================================================
// QUESTION GENERATORS
// ============================================================================

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function genNoteQ(lv: number, sys: NotationSystem): Question {
  const { min, max, clefs } = getNoteLevelRange(lv);
  const clef = pick(clefs);
  const notes = buildStaffNotes(clef).filter(n => n.pos >= min && n.pos <= max);
  const note = pick(notes);

  let acc: 'sharp' | 'flat' | undefined;
  if (lv >= 3 && Math.random() < 0.3) acc = Math.random() < 0.5 ? 'sharp' : 'flat';

  const answer = formatNoteNameOnly(note.name, acc, sys);

  // Generate wrong choices (note name only, no octave — octave is obvious from the staff position)
  const pool: string[] = [];
  // Use unique note names from nearby positions
  const seen = new Set<string>([answer]);
  const nearby = notes.filter(n => Math.abs(n.pos - note.pos) <= 4 && n.name !== note.name);
  for (const n of nearby) { const s = formatNoteNameOnly(n.name, undefined, sys); if (!seen.has(s)) { pool.push(s); seen.add(s); } }
  if (acc) {
    const noAcc = formatNoteNameOnly(note.name, undefined, sys);
    if (!seen.has(noAcc)) { pool.push(noAcc); seen.add(noAcc); } // same note without accidental
    for (const n of nearby.slice(0, 2)) { const s = formatNoteNameOnly(n.name, acc, sys); if (!seen.has(s)) { pool.push(s); seen.add(s); } }
  }
  const wrongs = shuffle(pool).slice(0, 3);
  // Fallback if not enough
  if (wrongs.length < 3) {
    for (const n of NOTE_NAMES) { if (wrongs.length >= 3) break; const s = formatNoteNameOnly(n, undefined, sys); if (!seen.has(s)) { wrongs.push(s); seen.add(s); } }
  }

  return { type: 'staff', clef, staffY: note.pos, accidental: acc, correctAnswer: answer, choices: shuffle([answer, ...wrongs.slice(0, 3)]) };
}

function genKeySigQ(lv: number, sys: NotationSystem): Question {
  const maxAcc = getKSMaxAcc(lv);
  const pool = KEY_SIGS.filter(k => k.sharps <= maxAcc && k.flats <= maxAcc);
  const ks = pick(pool);
  const isMajor = lv < 4 ? true : Math.random() < 0.5;
  const answer = isMajor ? ks.names[sys].major : ks.names[sys].minor;

  const wrongPool = pool.filter(k => k !== ks).map(k => isMajor ? k.names[sys].major : k.names[sys].minor);
  const wrongs = shuffle([...new Set(wrongPool)].filter(w => w !== answer)).slice(0, 3);
  return { type: 'keysig', sharps: ks.sharps, flats: ks.flats, correctAnswer: answer, choices: shuffle([answer, ...wrongs]) };
}

function genClefQ(lv: number, sys: NotationSystem): Question {
  const clefs: ClefType[] = lv < 5 ? ['treble', 'bass'] : ['treble', 'bass', 'alto', 'tenor'];
  const clef = pick(clefs);
  const notes = buildStaffNotes(clef).filter(n => n.pos >= -2 && n.pos <= 10);
  const note = pick(notes);

  let acc: 'sharp' | 'flat' | undefined;
  if (lv >= 4 && Math.random() < 0.25) acc = Math.random() < 0.5 ? 'sharp' : 'flat';

  const answer = formatNoteNameOnly(note.name, acc, sys);
  const pool: string[] = [];
  const seen = new Set<string>([answer]);
  const nearby = notes.filter(n => Math.abs(n.pos - note.pos) <= 4 && n.name !== note.name);
  for (const n of nearby) { const s = formatNoteNameOnly(n.name, undefined, sys); if (!seen.has(s)) { pool.push(s); seen.add(s); } }
  if (acc) {
    const noAcc = formatNoteNameOnly(note.name, undefined, sys);
    if (!seen.has(noAcc)) { pool.push(noAcc); seen.add(noAcc); }
    for (const n of nearby.slice(0, 2)) { const s = formatNoteNameOnly(n.name, acc, sys); if (!seen.has(s)) { pool.push(s); seen.add(s); } }
  }
  const wrongs = shuffle(pool).slice(0, 3);
  if (wrongs.length < 3) {
    for (const n of NOTE_NAMES) { if (wrongs.length >= 3) break; const s = formatNoteNameOnly(n, undefined, sys); if (!seen.has(s)) { wrongs.push(s); seen.add(s); } }
  }
  return { type: 'staff', clef, staffY: note.pos, accidental: acc, correctAnswer: answer, choices: shuffle([answer, ...wrongs.slice(0, 3)]) };
}

function genConvertQ(lv: number, sys: NotationSystem): Question {
  const otherSystems: NotationSystem[] = (['deutsch', 'english', 'japanese'] as NotationSystem[]).filter(s => s !== sys);
  const srcSys = pick(otherSystems);
  const isKey = lv >= 3 && Math.random() < 0.4;

  if (isKey) {
    const maxAcc = getKSMaxAcc(lv);
    const pool = KEY_SIGS.filter(k => k.sharps <= maxAcc && k.flats <= maxAcc);
    const ks = pick(pool);
    const isMajor = lv < 4 ? true : Math.random() < 0.5;
    const srcText = isMajor ? ks.names[srcSys].major : ks.names[srcSys].minor;
    const answer = isMajor ? ks.names[sys].major : ks.names[sys].minor;
    const wrongPool = pool.filter(k => k !== ks).map(k => isMajor ? k.names[sys].major : k.names[sys].minor);
    const wrongs = shuffle([...new Set(wrongPool)].filter(w => w !== answer)).slice(0, 3);
    return { type: 'convert', sourceSystem: srcSys, sourceText: srcText, correctAnswer: answer, choices: shuffle([answer, ...wrongs]) };
  }

  // Note name conversion
  const notePool = lv < 3 ? CONV_NOTES.filter(n => !n.acc) : CONV_NOTES;
  const n = pick(notePool);
  const srcText = formatNoteNameOnly(n.letter, n.acc, srcSys);
  const answer = formatNoteNameOnly(n.letter, n.acc, sys);
  const wrongPool = notePool.filter(cn => cn !== n).map(cn => formatNoteNameOnly(cn.letter, cn.acc, sys));
  const wrongs = shuffle([...new Set(wrongPool)].filter(w => w !== answer)).slice(0, 3);
  return { type: 'convert', sourceSystem: srcSys, sourceText: srcText, correctAnswer: answer, choices: shuffle([answer, ...wrongs]) };
}

// ============================================================================
// CANVAS DRAWING
// ============================================================================

const SG = 14; // staff line gap
const ST = 60; // staff top Y
const SL = 80; // staff left X

function drawStaff(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) {
    const y = ST + i * SG;
    ctx.beginPath(); ctx.moveTo(SL - 10, y); ctx.lineTo(340, y); ctx.stroke();
  }
}

function drawClefLabel(ctx: CanvasRenderingContext2D, clef: ClefType) {
  ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const cx = SL + 16;
  if (clef === 'treble') {
    // Treble clef: 𝄞 U+1D11E — centered on G line (pos 2, 2nd line from bottom)
    ctx.font = '72px "Times New Roman", "Noto Music", serif';
    ctx.fillText('\u{1D11E}', cx, ST + SG * 1.6);
  } else if (clef === 'bass') {
    // Bass clef: 𝄢 U+1D122 — centered on F line (pos 6, 4th line)
    ctx.font = '52px "Times New Roman", "Noto Music", serif';
    ctx.fillText('\u{1D122}', cx, ST + SG * 1.2);
  } else {
    // C clef: 𝄡 U+1D121 — alto: center line (pos 4), tenor: 4th line (pos 6)
    ctx.font = '52px "Times New Roman", "Noto Music", serif';
    const cy = clef === 'alto' ? ST + SG * 2 : ST + SG * 1;
    ctx.fillText('\u{1D121}', cx, cy);
  }
  ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
}

function posToY(pos: number) { return ST + (4 - pos / 2) * SG; }

function drawNoteOnStaff(ctx: CanvasRenderingContext2D, pos: number, acc?: 'sharp' | 'flat', color?: string) {
  const y = posToY(pos), x = 220, r = SG * 0.42;
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.2;
  // Ledger lines
  if (pos < 0) for (let p = -2; p >= pos; p -= 2) { const ly = posToY(p); ctx.beginPath(); ctx.moveTo(x - 18, ly); ctx.lineTo(x + 18, ly); ctx.stroke(); }
  if (pos > 8) for (let p = 10; p <= pos; p += 2) { const ly = posToY(p); ctx.beginPath(); ctx.moveTo(x - 18, ly); ctx.lineTo(x + 18, ly); ctx.stroke(); }
  // Notehead
  ctx.fillStyle = color || '#1e293b';
  ctx.beginPath(); ctx.ellipse(x, y, r * 1.3, r, -0.3, 0, Math.PI * 2); ctx.fill();
  // Stem
  ctx.strokeStyle = color || '#1e293b'; ctx.lineWidth = 1.8;
  if (pos < 4) { ctx.beginPath(); ctx.moveTo(x + r * 1.2, y); ctx.lineTo(x + r * 1.2, y - SG * 3.5); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(x - r * 1.2, y); ctx.lineTo(x - r * 1.2, y + SG * 3.5); ctx.stroke(); }
  // Accidental
  if (acc) {
    ctx.font = 'bold 20px serif'; ctx.fillStyle = color || '#1e293b';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(acc === 'sharp' ? '\u266F' : '\u266D', x - r * 1.6 - 4, y);
    ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
  }
}

// Key sig sharp/flat positions on treble staff
const SHARP_POS = [8, 5, 9, 6, 3, 7, 4]; // F C G D A E B
const FLAT_POS = [4, 7, 3, 6, 2, 5, 1];  // B E A D G C F

function drawKeySigOnStaff(ctx: CanvasRenderingContext2D, sharps: number, flats: number) {
  drawStaff(ctx); drawClefLabel(ctx, 'treble');
  ctx.font = 'bold 22px serif'; ctx.fillStyle = '#1e293b';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const sx = SL + 50;
  if (sharps > 0) for (let i = 0; i < sharps; i++) ctx.fillText('\u266F', sx + i * 16, posToY(SHARP_POS[i]));
  else if (flats > 0) for (let i = 0; i < flats; i++) ctx.fillText('\u266D', sx + i * 16, posToY(FLAT_POS[i]));
  ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', icon: '👁️', name: { ja: 'ファーストサイト', en: 'First Sight', ko: '첫 시선', pt: 'Primeira Vista', es: 'Primera Vista' }, description: { ja: '初めての正解', en: 'First correct', ko: '첫 정답', pt: 'Primeira correta', es: 'Primera correcta' }, check: s => s.totalCorrect >= 1 },
  { id: 'r10', icon: '🎯', name: { ja: '10問正解', en: '10 Correct', ko: '10문제 정답', pt: '10 Corretas', es: '10 Correctas' }, description: { ja: '累計10問', en: '10 total', ko: '누적 10문제', pt: '10 no total', es: '10 en total' }, check: s => s.totalCorrect >= 10 },
  { id: 'r50', icon: '🏆', name: { ja: '50問達成', en: '50 Correct', ko: '50문제 달성', pt: '50 Corretas', es: '50 Correctas' }, description: { ja: '累計50問', en: '50 total', ko: '누적 50문제', pt: '50 no total', es: '50 en total' }, check: s => s.totalCorrect >= 50 },
  { id: 'lv5', icon: '⭐', name: { ja: 'Lv.5', en: 'Lv.5', ko: 'Lv.5', pt: 'Nv.5', es: 'Nv.5' }, description: { ja: 'レベル5到達', en: 'Reach Lv.5', ko: '레벨 5 도달', pt: 'Alcance Nv.5', es: 'Alcanza Nv.5' }, check: s => s.level >= 5 },
  { id: 'str3', icon: '🔥', name: { ja: '3日連続', en: '3-Day Streak', ko: '3일 연속', pt: '3 Dias', es: '3 Dias' }, description: { ja: '3日連続プレイ', en: '3 days in a row', ko: '3일 연속 플레이', pt: '3 dias seguidos', es: '3 dias seguidos' }, check: s => s.dailyStreak >= 3 },
  { id: 'all', icon: '🎵', name: { ja: '全モード制覇', en: 'All Modes', ko: '전 모드 정복', pt: 'Todos Modos', es: 'Todos Modos' }, description: { ja: '4モード全正解', en: 'All 4 modes', ko: '4모드 전부 정답', pt: 'Todos os 4 modos', es: 'Los 4 modos' }, check: s => s.modeStats.note.correct > 0 && s.modeStats.keysig.correct > 0 && s.modeStats.clef.correct > 0 && s.modeStats.convert.correct > 0 },
  { id: 'st10', icon: '💎', name: { ja: '10連続正解', en: '10 in a Row', ko: '10연속 정답', pt: '10 Seguidas', es: '10 Seguidas' }, description: { ja: '10問連続', en: '10 streak', ko: '10문제 연속', pt: '10 seguidas', es: '10 seguidas' }, check: s => s.bestStreak >= 10 },
  { id: 'lv10', icon: '👑', name: { ja: 'Lv.10', en: 'Lv.10', ko: 'Lv.10', pt: 'Nv.10', es: 'Nv.10' }, description: { ja: 'レベル10到達', en: 'Reach Lv.10', ko: '레벨 10 도달', pt: 'Alcance Nv.10', es: 'Alcanza Nv.10' }, check: s => s.level >= 10 },
];

// ============================================================================
// STORAGE
// ============================================================================

const SK = 'kuon-sight-reading-stats';
const NK = 'kuon-sight-reading-notation';

function defStats(): UserStats {
  return { level: 1, xp: 0, totalCorrect: 0, totalAttempted: 0, dailyStreak: 0, lastPlayDate: '', achievements: [],
    modeStats: { note: { correct: 0, total: 0 }, keysig: { correct: 0, total: 0 }, clef: { correct: 0, total: 0 }, convert: { correct: 0, total: 0 } },
    bestStreak: 0, history: [] };
}
function loadStats(): UserStats {
  try {
    const r = localStorage.getItem(SK);
    if (!r) return defStats();
    const parsed = JSON.parse(r);
    const d = defStats();
    const merged = { ...d, ...parsed };
    // Deep-merge modeStats to handle migration from 3-mode to 4-mode
    merged.modeStats = { ...d.modeStats, ...(parsed.modeStats || {}) };
    return merged;
  } catch { return defStats(); }
}
function saveStats(s: UserStats) { try { localStorage.setItem(SK, JSON.stringify(s)); } catch { /* */ } }
function loadNotation(): NotationSystem { try { const r = localStorage.getItem(NK); return (r === 'english' || r === 'japanese') ? r : 'deutsch'; } catch { return 'deutsch'; } }
function saveNotation(n: NotationSystem) { try { localStorage.setItem(NK, n); } catch { /* */ } }

// ============================================================================
// TRANSLATIONS (UI only — notation names are handled by the notation system)
// ============================================================================

const T: Record<string, L5> = {
  title: { ja: 'KUON SIGHT READING', en: 'KUON SIGHT READING', ko: 'KUON SIGHT READING', pt: 'KUON SIGHT READING', es: 'KUON SIGHT READING' },
  subtitle: { ja: '譜面を読む力を、鍛える。', en: 'Train your music reading skills.', ko: '악보 읽는 힘을 기르자.', pt: 'Treine sua leitura musical.', es: 'Entrena tu lectura musical.' },
  notationSys: { ja: '記譜法', en: 'Notation System', ko: '기보법', pt: 'Sistema de Notacao', es: 'Sistema de Notacion' },
  deTip: { ja: 'H=シ♮ / B=シ♭（クラシック国際標準）', en: 'H=B-natural / B=B-flat (Classical standard)', ko: 'H=시♮ / B=시♭ (클래식 국제 표준)', pt: 'H=Si♮ / B=Sib (Padrao classico)', es: 'H=Si♮ / B=Sib (Estandar clasico)' },
  enTip: { ja: 'B=シ♮（ジャズ・ポップス標準）', en: 'B=B-natural (Jazz/Pop standard)', ko: 'B=시♮ (재즈/팝 표준)', pt: 'B=Si♮ (Padrao Jazz/Pop)', es: 'B=Si♮ (Estandar Jazz/Pop)' },
  jaTip: { ja: 'イロハニホヘト（楽典試験）', en: 'Iroha system (Japanese theory exam)', ko: '이로하니호헤토 (악전 시험)', pt: 'Sistema Iroha (exame japones)', es: 'Sistema Iroha (examen japones)' },
  noteMode: { ja: '音名読み', en: 'Note Reading', ko: '음이름 읽기', pt: 'Leitura de Notas', es: 'Lectura de Notas' },
  keysigMode: { ja: '調号判定', en: 'Key Signature', ko: '조표 판정', pt: 'Armadura', es: 'Armadura' },
  clefMode: { ja: '音部記号', en: 'Clef Reading', ko: '음자리표', pt: 'Claves', es: 'Claves' },
  convertMode: { ja: '記譜変換', en: 'Notation Conversion', ko: '기보 변환', pt: 'Conversao', es: 'Conversion' },
  noteDesc: { ja: '五線譜上の音名を答える', en: 'Identify notes on the staff', ko: '오선보 위의 음이름을 답하기', pt: 'Identifique notas na pauta', es: 'Identifica notas en el pentagrama' },
  keysigDesc: { ja: '調号から調を判定', en: 'Identify key from signature', ko: '조표로 조를 판정', pt: 'Identifique o tom', es: 'Identifica el tono' },
  clefDesc: { ja: '異なる音部記号で読む', en: 'Read in different clefs', ko: '다른 음자리표에서 읽기', pt: 'Leia em diferentes claves', es: 'Lee en diferentes claves' },
  convertDesc: { ja: 'Deutsch/English/日本語を変換', en: 'Convert between notation systems', ko: 'Deutsch/English/일본어 변환', pt: 'Converta entre sistemas', es: 'Convierte entre sistemas' },
  correct: { ja: '正解！', en: 'Correct!', ko: '정답!', pt: 'Correto!', es: 'Correcto!' },
  wrong: { ja: '不正解', en: 'Wrong', ko: '오답', pt: 'Errado', es: 'Incorrecto' },
  next: { ja: '次の問題', en: 'Next', ko: '다음 문제', pt: 'Proximo', es: 'Siguiente' },
  streak: { ja: '連続', en: 'Streak', ko: '연속', pt: 'Seguidas', es: 'Seguidas' },
  achievements: { ja: 'アチーブメント', en: 'Achievements', ko: '업적', pt: 'Conquistas', es: 'Logros' },
  history: { ja: '履歴', en: 'History', ko: '기록', pt: 'Historico', es: 'Historial' },
  accuracy: { ja: '正答率', en: 'Accuracy', ko: '정답률', pt: 'Precisao', es: 'Precision' },
  back: { ja: '← モード選択', en: '← Modes', ko: '← 모드 선택', pt: '← Modos', es: '← Modos' },
  levelUp: { ja: 'レベルアップ！', en: 'Level Up!', ko: '레벨 업!', pt: 'Nivel Acima!', es: 'Nivel Arriba!' },
  newAch: { ja: '新アチーブメント！', en: 'New Achievement!', ko: '새 업적!', pt: 'Nova Conquista!', es: 'Nuevo Logro!' },
  answerIs: { ja: '正解は', en: 'Answer:', ko: '정답은', pt: 'Resposta:', es: 'Respuesta:' },
  treble: { ja: 'ト音記号', en: 'Treble', ko: '높은음자리표', pt: 'Sol', es: 'Sol' },
  bass: { ja: 'ヘ音記号', en: 'Bass', ko: '낮은음자리표', pt: 'Fa', es: 'Fa' },
  alto: { ja: 'アルト記号', en: 'Alto', ko: '알토', pt: 'Do (Alto)', es: 'Do (Alto)' },
  tenor: { ja: 'テノール記号', en: 'Tenor', ko: '테너', pt: 'Do (Tenor)', es: 'Do (Tenor)' },
  prompt_note: { ja: 'この音は？', en: 'What note?', ko: '이 음은?', pt: 'Qual nota?', es: 'Que nota?' },
  prompt_ks: { ja: 'この調は？', en: 'What key?', ko: '이 조는?', pt: 'Qual tom?', es: 'Que tono?' },
  prompt_clef: { ja: 'この音部記号での音名は？', en: 'What note in this clef?', ko: '이 음자리표에서 음이름은?', pt: 'Qual nota nesta clave?', es: 'Que nota en esta clave?' },
  prompt_conv: { ja: '同じものを選んでください。', en: 'Select the equivalent.', ko: '같은 것을 선택하세요.', pt: 'Selecione o equivalente.', es: 'Selecciona el equivalente.' },
  from: { ja: '出題', en: 'From', ko: '출제', pt: 'De', es: 'De' },
};

const NOTATION_LABELS: Record<NotationSystem, string> = { deutsch: 'Deutsch', english: 'English', japanese: '日本語' };

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SightReadingPage() {
  const { lang } = useLang();
  const [stats, setStats] = useState<UserStats>(defStats);
  const [notation, setNotation] = useState<NotationSystem>('deutsch');
  const [mode, setMode] = useState<Mode | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newAch, setNewAch] = useState<Achievement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); setStats(loadStats()); setNotation(loadNotation()); }, []);

  // Canvas rendering
  useEffect(() => {
    if (!question || !canvasRef.current) return;
    if (question.type === 'convert') return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvasRef.current.width = 380 * dpr; canvasRef.current.height = 160 * dpr;
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, 380, 160);
    if (question.type === 'keysig') { drawKeySigOnStaff(ctx, question.sharps, question.flats); }
    else { drawStaff(ctx); drawClefLabel(ctx, question.clef); const c = isCorrect === null ? '#1e293b' : isCorrect ? GREEN : RED; drawNoteOnStaff(ctx, question.staffY, question.accidental, c); }
  }, [question, isCorrect]);

  const genQ = useCallback((m: Mode) => {
    setSelected(null); setIsCorrect(null);
    switch (m) {
      case 'note': setQuestion(genNoteQ(stats.level, notation)); break;
      case 'keysig': setQuestion(genKeySigQ(stats.level, notation)); break;
      case 'clef': setQuestion(genClefQ(stats.level, notation)); break;
      case 'convert': setQuestion(genConvertQ(stats.level, notation)); break;
    }
  }, [stats.level, notation]);

  const startMode = useCallback((m: Mode) => { setMode(m); setCurrentStreak(0); setTimeout(() => genQ(m), 50); }, [genQ]);

  const changeNotation = useCallback((n: NotationSystem) => {
    setNotation(n); saveNotation(n);
    if (mode) { setSelected(null); setIsCorrect(null); setQuestion(null); setTimeout(() => setMode(null), 0); }
  }, [mode]);

  const handleAnswer = useCallback((answer: string) => {
    if (!question || selected !== null) return;
    setSelected(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    const today = new Date().toISOString().slice(0, 10);
    setStats(prev => {
      const next = { ...prev }; next.totalAttempted++;
      if (mode) { next.modeStats = { ...next.modeStats }; const prev = next.modeStats[mode] || { correct: 0, total: 0 }; next.modeStats[mode] = { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }; }
      if (correct) {
        next.totalCorrect++;
        const ns = currentStreak + 1; setCurrentStreak(ns);
        if (ns > next.bestStreak) next.bestStreak = ns;
        next.xp += 25;
        if (next.xp >= xpForLevel(next.level)) { next.xp -= xpForLevel(next.level); next.level++; setShowLevelUp(true); setTimeout(() => setShowLevelUp(false), 2000); }
      } else { setCurrentStreak(0); }
      if (next.lastPlayDate !== today) { const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10); next.dailyStreak = next.lastPlayDate === y ? next.dailyStreak + 1 : 1; next.lastPlayDate = today; }
      next.history = [{ date: today, mode: mode!, correct, detail: question.correctAnswer }, ...next.history.slice(0, 49)];
      const na: Achievement[] = [];
      for (const a of ACHIEVEMENTS) { if (!next.achievements.includes(a.id) && a.check(next)) { next.achievements = [...next.achievements, a.id]; na.push(a); } }
      if (na.length) { setNewAch(na); setTimeout(() => setNewAch([]), 3000); }
      saveStats(next); return next;
    });
  }, [question, selected, mode, currentStreak]);

  if (!mounted) return null;

  // ─── Styles ───
  const wrap: React.CSSProperties = { minHeight: '100vh', background: '#f8fafc', fontFamily: sans, color: '#1e293b', padding: 'clamp(16px,4vw,32px)', paddingTop: 'clamp(80px,12vw,120px)' };
  const card: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: 'clamp(20px,4vw,32px)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', maxWidth: 520, margin: '0 auto' };
  const ghost: React.CSSProperties = { padding: '8px 16px', background: 'transparent', color: '#64748b', border: 'none', fontFamily: sans, fontSize: 14, cursor: 'pointer' };
  const accentBtn: React.CSSProperties = { padding: '10px 24px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 10, fontFamily: sans, fontSize: 15, fontWeight: 600, cursor: 'pointer' };

  const choiceStyle = (c: string): React.CSSProperties => {
    let bg = '#fff', border = '#e2e8f0', color = '#1e293b';
    if (selected !== null) {
      if (c === question?.correctAnswer) { bg = `${GREEN}15`; border = GREEN; color = GREEN; }
      else if (c === selected && !isCorrect) { bg = `${RED}15`; border = RED; color = RED; }
    }
    return { padding: 'clamp(10px,2vw,14px) clamp(14px,3vw,20px)', border: `2px solid ${border}`, borderRadius: 10, background: bg, color, fontFamily: sans, fontSize: 'clamp(14px,3.5vw,17px)', fontWeight: 600, cursor: selected ? 'default' : 'pointer', transition: 'all 0.15s', minWidth: 0 };
  };

  // ─── MODE SELECT ───
  if (!mode) {
    const acc = stats.totalAttempted > 0 ? Math.round(stats.totalCorrect / stats.totalAttempted * 100) : 0;
    return (
      <div style={wrap}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontFamily: serif, fontSize: 'clamp(22px,5vw,30px)', fontWeight: 700, margin: 0 }}>{T.title[lang]}</h1>
            <p style={{ color: '#64748b', fontSize: 'clamp(13px,3vw,15px)', marginTop: 6 }}>{T.subtitle[lang]}</p>
          </div>

          {/* Notation System Selector */}
          <div style={{ ...card, marginBottom: 20, padding: '16px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{T.notationSys[lang]}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['deutsch', 'english', 'japanese'] as NotationSystem[]).map(n => (
                <button key={n} onClick={() => changeNotation(n)} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 10, border: `2px solid ${notation === n ? ACCENT : '#e2e8f0'}`,
                  background: notation === n ? `${ACCENT}10` : '#fff', color: notation === n ? ACCENT : '#475569',
                  fontFamily: sans, fontSize: 'clamp(12px,2.8vw,14px)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                }}>{NOTATION_LABELS[n]}</button>
              ))}
            </div>
            <div style={{ fontSize: 'clamp(11px,2.5vw,13px)', color: '#94a3b8', marginTop: 8, lineHeight: 1.5 }}>
              {notation === 'deutsch' ? T.deTip[lang] : notation === 'english' ? T.enTip[lang] : T.jaTip[lang]}
            </div>
          </div>

          {/* Stats */}
          <div style={{ ...card, marginBottom: 16, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontWeight: 700, color: ACCENT }}>Lv.{stats.level}</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>XP {stats.xp}/{xpForLevel(stats.level)}</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>{T.accuracy[lang]} {acc}%</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>{T.streak[lang]} {stats.dailyStreak}d</span>
          </div>
          <div style={{ height: 5, background: '#e2e8f0', borderRadius: 3, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: ACCENT, borderRadius: 3, width: `${(stats.xp / xpForLevel(stats.level)) * 100}%`, transition: 'width 0.3s' }} />
          </div>

          {/* Mode cards */}
          <div style={{ display: 'grid', gap: 10 }}>
            {([
              { m: 'note' as Mode, icon: '🎼', name: T.noteMode, desc: T.noteDesc },
              { m: 'keysig' as Mode, icon: '🔑', name: T.keysigMode, desc: T.keysigDesc },
              { m: 'clef' as Mode, icon: '🎻', name: T.clefMode, desc: T.clefDesc },
              { m: 'convert' as Mode, icon: '🔄', name: T.convertMode, desc: T.convertDesc },
            ]).map(({ m, icon, name, desc }) => (
              <div key={m} onClick={() => startMode(m)} style={{
                background: '#fff', border: '2px solid #e2e8f0', borderRadius: 14,
                padding: 'clamp(14px,3vw,20px)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = ACCENT; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: 'clamp(14px,3.2vw,16px)' }}>{name[lang]}</div>
                <div style={{ fontSize: 'clamp(11px,2.5vw,13px)', color: '#64748b', marginTop: 4 }}>{desc[lang]}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{(stats.modeStats[m]?.correct ?? 0)}/{(stats.modeStats[m]?.total ?? 0)}</div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div style={{ ...card, marginTop: 16 }}>
            <h3 style={{ fontFamily: serif, fontSize: 15, margin: '0 0 10px' }}>{T.achievements[lang]}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ACHIEVEMENTS.map(a => {
                const earned = stats.achievements.includes(a.id);
                return <div key={a.id} title={`${a.name[lang]}: ${a.description[lang]}`} style={{
                  width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, background: earned ? `${GOLD}20` : '#f1f5f9', opacity: earned ? 1 : 0.35,
                  border: earned ? `2px solid ${GOLD}` : '2px solid transparent',
                }}>{a.icon}</div>;
              })}
            </div>
          </div>

          {/* History */}
          {stats.history.length > 0 && (
            <div style={{ ...card, marginTop: 12 }}>
              <h3 style={{ fontFamily: serif, fontSize: 15, margin: '0 0 10px' }}>{T.history[lang]}</h3>
              <div style={{ maxHeight: 140, overflowY: 'auto' }}>
                {stats.history.slice(0, 10).map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', padding: '2px 0' }}>
                    <span>{h.correct ? '✓' : '✗'} {h.detail}</span>
                    <span style={{ color: '#94a3b8' }}>{h.mode}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── GAME SCREEN ───
  const promptText = mode === 'note' ? T.prompt_note[lang] : mode === 'keysig' ? T.prompt_ks[lang] : mode === 'clef' ? T.prompt_clef[lang] : T.prompt_conv[lang];
  const clefLabel = question && question.type === 'staff' ? T[question.clef]?.[lang] || '' : '';

  return (
    <div style={wrap}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button style={ghost} onClick={() => setMode(null)}>{T.back[lang]}</button>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, background: `${ACCENT}10`, padding: '3px 8px', borderRadius: 6 }}>{NOTATION_LABELS[notation]}</span>
          <span style={{ fontWeight: 700, color: ACCENT, fontSize: 14 }}>Lv.{stats.level}</span>
        </div>
        <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: ACCENT, borderRadius: 2, width: `${(stats.xp / xpForLevel(stats.level)) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        {/* Streak */}
        {currentStreak > 0 && <div style={{ textAlign: 'center', fontSize: 13, color: GOLD, fontWeight: 700, marginBottom: 8 }}>{currentStreak} {T.streak[lang]} 🔥</div>}

        {/* Question card */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
              {mode === 'note' ? T.noteMode[lang] : mode === 'keysig' ? T.keysigMode[lang] : mode === 'clef' ? T.clefMode[lang] : T.convertMode[lang]}
            </span>
            {clefLabel && <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>{clefLabel}</span>}
          </div>

          {/* Visual: Canvas for staff modes, text for convert */}
          {question && question.type === 'convert' ? (
            <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{T.from[lang]}: {NOTATION_LABELS[question.sourceSystem]}</div>
              <div style={{ fontSize: 'clamp(28px,7vw,40px)', fontWeight: 700, color: '#1e293b', fontFamily: serif, margin: '8px 0' }}>{question.sourceText}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 12px' }}>
              <canvas ref={canvasRef} style={{ width: 380, height: 160, maxWidth: '100%' }} />
            </div>
          )}

          <p style={{ textAlign: 'center', fontFamily: serif, fontSize: 'clamp(14px,3.2vw,17px)', fontWeight: 600, margin: '0 0 14px', color: '#334155' }}>{promptText}</p>

          {/* Choices */}
          {question && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {question.choices.map(c => (
                <button key={c} style={choiceStyle(c)} onClick={() => handleAnswer(c)} disabled={selected !== null}>{c}</button>
              ))}
            </div>
          )}

          {/* Feedback */}
          {selected !== null && (
            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <div style={{
                display: 'inline-block', padding: '5px 14px', borderRadius: 8,
                background: isCorrect ? `${GREEN}15` : `${RED}15`, color: isCorrect ? GREEN : RED, fontWeight: 700, fontSize: 14,
              }}>
                {isCorrect ? T.correct[lang] : `${T.wrong[lang]} — ${T.answerIs[lang]} ${question?.correctAnswer}`}
              </div>
              <div style={{ marginTop: 12 }}>
                <button style={accentBtn} onClick={() => mode && genQ(mode)}>{T.next[lang]}</button>
              </div>
            </div>
          )}
        </div>

        {/* Level Up overlay */}
        {showLevelUp && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', zIndex: 1000 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: '32px 48px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'srFadeIn 0.3s' }}>
              <div style={{ fontSize: 48 }}>🎉</div>
              <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: ACCENT }}>{T.levelUp[lang]}</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>Lv.{stats.level}</div>
            </div>
          </div>
        )}
        {newAch.length > 0 && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1001 }}>
            {newAch.map(a => (
              <div key={a.id} style={{
                background: '#fff', borderRadius: 14, padding: '10px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                display: 'flex', alignItems: 'center', gap: 10, border: `2px solid ${GOLD}`, marginBottom: 8, animation: 'srFadeIn 0.3s',
              }}>
                <span style={{ fontSize: 26 }}>{a.icon}</span>
                <div><div style={{ fontSize: 11, color: GOLD, fontWeight: 700 }}>{T.newAch[lang]}</div><div style={{ fontWeight: 700, fontSize: 14 }}>{a.name[lang]}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes srFadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
