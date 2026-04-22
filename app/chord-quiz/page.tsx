'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { RegistrationNudge, useRegistrationNudge } from '@/components/RegistrationNudge';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type QuizMode = 'identify' | 'inversions' | 'progressions';
type L5 = Partial<Record<Lang, string>> & { en: string };

interface ChordDef {
  intervals: number[];
  key: string;
  name: L5;
  symbol: string;
  minLevel: number;
}

interface InversionDef {
  key: string;
  name: L5;
  shift: number; // how many notes to rotate up
  minLevel: number;
}

interface ProgressionDef {
  degrees: number[];
  key: string;
  name: L5;
  label: string;
  minLevel: number;
}

interface Question {
  mode: QuizMode;
  notes: number[][];    // array of chord note arrays
  answer: string;
  options: string[];
  displayNotes?: number[]; // for keyboard highlight
}

interface UserStats {
  level: number;
  xp: number;
  totalCorrect: number;
  totalAttempted: number;
  streak: number;
  bestStreak: number;
  achievements: string[];
  sessionHistory: SessionEntry[];
  dailyStreak: number;
  lastPlayDate: string;
  modeStats: Record<QuizMode, { correct: number; total: number }>;
}

interface SessionEntry {
  date: string;
  mode: QuizMode;
  correct: number;
  total: number;
  accuracy: number;
  duration: number;
}

interface SessionState {
  mode: QuizMode;
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
  startTime: number;
}

interface Achievement {
  id: string;
  name: L5;
  description: L5;
  icon: string;
  check: (stats: UserStats, session: SessionState) => boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';
const GREEN = '#22c55e';
const RED = '#ef4444';
const GOLD = '#f59e0b';
const PURPLE = '#8b5cf6';

const XP_PER_CORRECT = 12;
const XP_STREAK_BONUS = 6;
const XP_PER_LEVEL = 100;

function xpForLevel(level: number): number {
  return Math.floor(XP_PER_LEVEL * (1 + (level - 1) * 0.15));
}

// ============================================================================
// CHORD DEFINITIONS (expanded with inversions)
// ============================================================================

const CHORDS: ChordDef[] = [
  { intervals: [0, 4, 7],     key: 'major',   symbol: '',     name: { ja: 'メジャー', en: 'Major', ko: '장', pt: 'Maior', es: 'Mayor' }, minLevel: 1 },
  { intervals: [0, 3, 7],     key: 'minor',   symbol: 'm',    name: { ja: 'マイナー', en: 'Minor', ko: '단', pt: 'Menor', es: 'Menor' }, minLevel: 1 },
  { intervals: [0, 3, 6],     key: 'dim',     symbol: 'dim',  name: { ja: 'ディミニッシュ', en: 'Diminished', ko: '감', pt: 'Diminuto', es: 'Disminuido' }, minLevel: 3 },
  { intervals: [0, 4, 8],     key: 'aug',     symbol: 'aug',  name: { ja: 'オーグメント', en: 'Augmented', ko: '증', pt: 'Aumentado', es: 'Aumentado' }, minLevel: 3 },
  { intervals: [0, 4, 7, 10], key: 'dom7',    symbol: '7',    name: { ja: '属七', en: 'Dominant 7th', ko: '속7', pt: '7ª Dom.', es: '7ª Dom.' }, minLevel: 5 },
  { intervals: [0, 4, 7, 11], key: 'maj7',    symbol: 'M7',   name: { ja: '長七', en: 'Major 7th', ko: '장7', pt: '7ª Maior', es: '7ª Mayor' }, minLevel: 5 },
  { intervals: [0, 3, 7, 10], key: 'min7',    symbol: 'm7',   name: { ja: '短七', en: 'Minor 7th', ko: '단7', pt: '7ª Menor', es: '7ª Menor' }, minLevel: 5 },
  { intervals: [0, 3, 6, 10], key: 'hdim7',   symbol: 'ø7',   name: { ja: '半減七', en: 'Half-dim 7th', ko: '반감7', pt: '7ª Meio-dim', es: '7ª Semi-dis' }, minLevel: 8 },
  { intervals: [0, 3, 6, 9],  key: 'dim7',    symbol: 'o7',   name: { ja: '減七', en: 'Dim 7th', ko: '감7', pt: '7ª Dim', es: '7ª Dis' }, minLevel: 8 },
  { intervals: [0, 4, 8, 11], key: 'augM7',   symbol: '+M7',  name: { ja: '増長七', en: 'Aug Maj 7th', ko: '증장7', pt: 'Aug 7ª Maior', es: 'Aug 7ª Mayor' }, minLevel: 12 },
  { intervals: [0, 2, 7],     key: 'sus2',    symbol: 'sus2', name: { ja: 'sus2', en: 'Sus2', ko: 'sus2', pt: 'Sus2', es: 'Sus2' }, minLevel: 7 },
  { intervals: [0, 5, 7],     key: 'sus4',    symbol: 'sus4', name: { ja: 'sus4', en: 'Sus4', ko: 'sus4', pt: 'Sus4', es: 'Sus4' }, minLevel: 7 },
  { intervals: [0, 4, 7, 14], key: 'add9',    symbol: 'add9', name: { ja: 'add9', en: 'Add9', ko: 'add9', pt: 'Add9', es: 'Add9' }, minLevel: 10 },
  { intervals: [0, 4, 7, 10, 14], key: '9th', symbol: '9',    name: { ja: 'ナインス', en: '9th', ko: '9th', pt: '9ª', es: '9ª' }, minLevel: 14 },
];

const INVERSIONS: InversionDef[] = [
  { key: 'root',  shift: 0, name: { ja: '基本位置', en: 'Root Position', ko: '기본 위치', pt: 'Posição Fundamental', es: 'Posición Fundamental' }, minLevel: 1 },
  { key: '1st',   shift: 1, name: { ja: '第1転回形', en: '1st Inversion', ko: '제1전위', pt: '1ª Inversão', es: '1ª Inversión' }, minLevel: 1 },
  { key: '2nd',   shift: 2, name: { ja: '第2転回形', en: '2nd Inversion', ko: '제2전위', pt: '2ª Inversão', es: '2ª Inversión' }, minLevel: 3 },
  { key: '3rd',   shift: 3, name: { ja: '第3転回形', en: '3rd Inversion', ko: '제3전위', pt: '3ª Inversão', es: '3ª Inversión' }, minLevel: 6 },
];

// Progressions using scale degrees (0=I, semitones from root)
const MAJOR_DEGREES: Record<string, number> = { I: 0, ii: 2, iii: 4, IV: 5, V: 7, vi: 9, viio: 11 };
const DEGREE_CHORDS: Record<string, ChordDef> = {
  I:    CHORDS[0], // major
  ii:   CHORDS[1], // minor
  iii:  CHORDS[1], // minor
  IV:   CHORDS[0], // major
  V:    CHORDS[0], // major
  vi:   CHORDS[1], // minor
  viio: CHORDS[2], // dim
};

const PROGRESSIONS: ProgressionDef[] = [
  { degrees: [0, 5, 7, 0],    key: 'I-IV-V-I',    label: 'I – IV – V – I',     name: { ja: 'I-IV-V-I（基本進行）', en: 'I-IV-V-I (Basic)', ko: 'I-IV-V-I (기본)', pt: 'I-IV-V-I (Básica)', es: 'I-IV-V-I (Básica)' }, minLevel: 1 },
  { degrees: [0, 7, 9, 5],    key: 'I-V-vi-IV',   label: 'I – V – vi – IV',    name: { ja: 'I-V-vi-IV（ポップ進行）', en: 'I-V-vi-IV (Pop)', ko: 'I-V-vi-IV (팝)', pt: 'I-V-vi-IV (Pop)', es: 'I-V-vi-IV (Pop)' }, minLevel: 1 },
  { degrees: [0, 5, 2, 7],    key: 'I-IV-ii-V',   label: 'I – IV – ii – V',    name: { ja: 'I-IV-ii-V', en: 'I-IV-ii-V', ko: 'I-IV-ii-V', pt: 'I-IV-ii-V', es: 'I-IV-ii-V' }, minLevel: 3 },
  { degrees: [9, 5, 0, 7],    key: 'vi-IV-I-V',   label: 'vi – IV – I – V',    name: { ja: 'vi-IV-I-V', en: 'vi-IV-I-V', ko: 'vi-IV-I-V', pt: 'vi-IV-I-V', es: 'vi-IV-I-V' }, minLevel: 5 },
  { degrees: [0, 9, 5, 7],    key: 'I-vi-IV-V',   label: 'I – vi – IV – V',    name: { ja: 'I-vi-IV-V（50年代進行）', en: 'I-vi-IV-V (50s)', ko: 'I-vi-IV-V (50년대)', pt: 'I-vi-IV-V (Anos 50)', es: 'I-vi-IV-V (Años 50)' }, minLevel: 7 },
  { degrees: [2, 7, 0],       key: 'ii-V-I',      label: 'ii – V – I',         name: { ja: 'ii-V-I（ジャズ基本）', en: 'ii-V-I (Jazz)', ko: 'ii-V-I (재즈)', pt: 'ii-V-I (Jazz)', es: 'ii-V-I (Jazz)' }, minLevel: 9 },
];

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

const ACHIEVEMENTS_DATA: Achievement[] = [
  { id: 'first-chord', icon: '🎹', name: { ja: '最初の和音', en: 'First Chord', ko: '첫 번째 화음', pt: 'Primeiro Acorde', es: 'Primer Acorde' }, description: { ja: '初めて正解する', en: 'Get your first correct answer', ko: '처음으로 정답', pt: 'Primeiro acerto', es: 'Primer acierto' }, check: (s) => s.totalCorrect >= 1 },
  { id: 'streak-10', icon: '🔥', name: { ja: '10連続正解', en: '10 Streak', ko: '10연속 정답', pt: '10 Sequência', es: '10 Racha' }, description: { ja: '10問連続正解', en: '10 correct in a row', ko: '10문제 연속 정답', pt: '10 acertos seguidos', es: '10 aciertos seguidos' }, check: (s) => s.bestStreak >= 10 },
  { id: 'streak-30', icon: '⚡', name: { ja: '30連続正解', en: '30 Streak', ko: '30연속 정답', pt: '30 Sequência', es: '30 Racha' }, description: { ja: '30問連続正解', en: '30 correct in a row', ko: '30문제 연속 정답', pt: '30 acertos seguidos', es: '30 aciertos seguidos' }, check: (s) => s.bestStreak >= 30 },
  { id: 'level-10', icon: '⭐', name: { ja: 'レベル10', en: 'Level 10', ko: '레벨 10', pt: 'Nível 10', es: 'Nivel 10' }, description: { ja: 'Lv.10到達', en: 'Reach Lv.10', ko: 'Lv.10 도달', pt: 'Alcançar Nv.10', es: 'Alcanzar Nv.10' }, check: (s) => s.level >= 10 },
  { id: 'accuracy-95', icon: '🎯', name: { ja: '95%精度', en: '95% Accuracy', ko: '95% 정확도', pt: '95% Precisão', es: '95% Precisión' }, description: { ja: 'セッションで95%以上（10問以上）', en: '95%+ in a session (10+ questions)', ko: '세션에서 95% 이상 (10문제 이상)', pt: '95%+ em uma sessão (10+)', es: '95%+ en una sesión (10+)' }, check: (_s, ses) => ses.total >= 10 && (ses.correct / ses.total) >= 0.95 },
  { id: 'daily-7', icon: '📅', name: { ja: '7日連続', en: '7-Day Streak', ko: '7일 연속', pt: '7 Dias Seguidos', es: '7 Días Seguidos' }, description: { ja: '7日間連続で練習', en: 'Practice 7 days in a row', ko: '7일 연속 연습', pt: '7 dias consecutivos', es: '7 días consecutivos' }, check: (s) => s.dailyStreak >= 7 },
  { id: 'inversion-master', icon: '🔄', name: { ja: '転回形マスター', en: 'Inversion Master', ko: '전위 마스터', pt: 'Mestre de Inversões', es: 'Maestro de Inversiones' }, description: { ja: '転回形モードで20問正解', en: '20 correct in inversions mode', ko: '전위 모드에서 20문제 정답', pt: '20 acertos no modo inversões', es: '20 aciertos en modo inversiones' }, check: (s) => (s.modeStats.inversions?.correct ?? 0) >= 20 },
  { id: 'progression-ear', icon: '🎼', name: { ja: '進行の耳', en: 'Progression Ear', ko: '진행의 귀', pt: 'Ouvido de Progressão', es: 'Oído de Progresión' }, description: { ja: '進行モードで15問正解', en: '15 correct in progressions mode', ko: '진행 모드에서 15문제 정답', pt: '15 acertos no modo progressões', es: '15 aciertos en modo progresiones' }, check: (s) => (s.modeStats.progressions?.correct ?? 0) >= 15 },
];

// ============================================================================
// TRANSLATIONS
// ============================================================================

const T: Record<string, L5> = {
  title: { ja: 'KUON CHORD QUIZ', en: 'KUON CHORD QUIZ', ko: 'KUON CHORD QUIZ', pt: 'KUON CHORD QUIZ', es: 'KUON CHORD QUIZ' },
  subtitle: { ja: '和音トレーニング', en: 'Chord Training', ko: '화음 훈련', pt: 'Treino de Acordes', es: 'Entrenamiento de Acordes' },
  identify: { ja: '和音判定', en: 'Identify', ko: '화음 판별', pt: 'Identificar', es: 'Identificar' },
  inversions: { ja: '転回形', en: 'Inversions', ko: '전위', pt: 'Inversões', es: 'Inversiones' },
  progressions: { ja: 'コード進行', en: 'Progressions', ko: '코드 진행', pt: 'Progressões', es: 'Progresiones' },
  play: { ja: '再生', en: 'Play', ko: '재생', pt: 'Reproduzir', es: 'Reproducir' },
  replay: { ja: 'もう一度', en: 'Replay', ko: '다시', pt: 'Repetir', es: 'Repetir' },
  correct: { ja: '正解！', en: 'Correct!', ko: '정답!', pt: 'Correto!', es: '¡Correcto!' },
  wrong: { ja: '不正解', en: 'Wrong', ko: '오답', pt: 'Errado', es: 'Incorrecto' },
  next: { ja: '次へ', en: 'Next', ko: '다음', pt: 'Próximo', es: 'Siguiente' },
  start: { ja: 'スタート', en: 'Start', ko: '시작', pt: 'Iniciar', es: 'Empezar' },
  end: { ja: '終了', en: 'End', ko: '종료', pt: 'Terminar', es: 'Terminar' },
  level: { ja: 'Lv.', en: 'Lv.', ko: 'Lv.', pt: 'Nv.', es: 'Nv.' },
  streak: { ja: 'コンボ', en: 'Streak', ko: '연계', pt: 'Sequência', es: 'Racha' },
  best: { ja: '最高', en: 'Best', ko: '최고', pt: 'Melhor', es: 'Mejor' },
  accuracy: { ja: '正答率', en: 'Accuracy', ko: '정답률', pt: 'Precisão', es: 'Precisión' },
  achievements: { ja: 'アチーブメント', en: 'Achievements', ko: '업적', pt: 'Conquistas', es: 'Logros' },
  history: { ja: '履歴', en: 'History', ko: '기록', pt: 'Histórico', es: 'Historial' },
  noHistory: { ja: 'まだ履歴がありません', en: 'No history yet', ko: '아직 기록이 없습니다', pt: 'Sem histórico', es: 'Sin historial' },
  dailyStreak: { ja: '連続日数', en: 'Daily Streak', ko: '연속 일수', pt: 'Dias Seguidos', es: 'Días Seguidos' },
  levelUp: { ja: 'レベルアップ！', en: 'LEVEL UP!', ko: '레벨 업!', pt: 'NÍVEL ACIMA!', es: '¡NIVEL ARRIBA!' },
  unlocked: { ja: '解禁済み', en: 'Unlocked', ko: '해금됨', pt: 'Desbloqueado', es: 'Desbloqueado' },
  blocked: { ja: '分散', en: 'Broken', ko: '분산', pt: 'Quebrado', es: 'Quebrado' },
  block: { ja: '同時', en: 'Block', ko: '동시', pt: 'Bloco', es: 'Bloque' },
  questions: { ja: '問', en: 'Q', ko: '문', pt: 'P', es: 'P' },
  keyboardHint: { ja: '鍵盤で構成音を確認', en: 'See the notes on the keyboard', ko: '건반에서 구성음 확인', pt: 'Veja as notas no teclado', es: 'Ve las notas en el teclado' },
};

const MODE_DESCS: Record<QuizMode, L5> = {
  identify: {
    ja: '和音を聴いて種類を判定。メジャー/マイナーから始まり、7th、sus、add9まで段階的に解禁。',
    en: 'Hear a chord, identify its type. Starts with major/minor, unlocks 7ths, sus, add9 progressively.',
    ko: '화음을 듣고 종류를 판별. 장/단부터 시작하여 7th, sus, add9까지 단계적 해금.',
    pt: 'Ouça um acorde, identifique o tipo. De maior/menor a 7ªs, sus, add9 progressivamente.',
    es: 'Escucha un acorde, identifica su tipo. De mayor/menor a 7ªs, sus, add9 progresivamente.',
  },
  inversions: {
    ja: 'メジャー/マイナーの転回形を聴き分ける。基本位置、第1〜第3転回形。和声課題の基礎。',
    en: 'Distinguish chord inversions — root position through 3rd inversion. Foundation of harmony exercises.',
    ko: '장/단 전위를 구별. 기본 위치, 제1~제3전위. 화성 과제의 기초.',
    pt: 'Distinga inversões — posição fundamental até 3ª inversão. Base dos exercícios de harmonia.',
    es: 'Distingue inversiones — posición fundamental hasta 3ª inversión. Base de ejercicios de armonía.',
  },
  progressions: {
    ja: 'コード進行を聴いて、ディグリーネームを当てる。I-IV-V-I からジャズの ii-V-I まで。',
    en: 'Hear a chord progression, identify the degree names. From I-IV-V-I to jazz ii-V-I.',
    ko: '코드 진행을 듣고 디그리 네임을 맞추기. I-IV-V-I부터 재즈 ii-V-I까지.',
    pt: 'Ouça uma progressão, identifique os graus. De I-IV-V-I a ii-V-I de jazz.',
    es: 'Escucha una progresión, identifica los grados. De I-IV-V-I a ii-V-I de jazz.',
  },
};

// ============================================================================
// AUDIO ENGINE — Piano-like tone with harmonics
// ============================================================================

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playPianoTone(ctx: AudioContext, freq: number, startTime: number, duration: number): void {
  // Fundamental + harmonics for piano-like timbre
  const harmonics = [1, 2, 3, 4, 5, 6];
  const amplitudes = [1, 0.5, 0.25, 0.12, 0.06, 0.03];
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.18, startTime);
  masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  masterGain.connect(ctx.destination);

  harmonics.forEach((h, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * h, startTime);
    g.gain.setValueAtTime(amplitudes[i] * 0.15, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * (1 - i * 0.1));
    osc.connect(g);
    g.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

function playChordBlock(ctx: AudioContext, midiNotes: number[], startTime: number, duration: number): void {
  midiNotes.forEach(n => playPianoTone(ctx, midiToFreq(n), startTime, duration));
}

function playChordBroken(ctx: AudioContext, midiNotes: number[], startTime: number, noteDur: number): void {
  midiNotes.forEach((n, i) => playPianoTone(ctx, midiToFreq(n), startTime + i * 0.15, noteDur));
}

function playCorrectSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99].forEach((f, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.15, now + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.3);
  });
}

function playWrongSound(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 180;
  g.gain.setValueAtTime(0.08, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.4);
}

// ============================================================================
// QUESTION GENERATORS
// ============================================================================

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getAvailableChords(level: number): ChordDef[] {
  return CHORDS.filter(c => c.minLevel <= level);
}

function getAvailableInversions(level: number): InversionDef[] {
  return INVERSIONS.filter(iv => iv.minLevel <= level);
}

function getAvailableProgressions(level: number): ProgressionDef[] {
  return PROGRESSIONS.filter(p => p.minLevel <= level);
}

function applyInversion(intervals: number[], shift: number): number[] {
  const notes = [...intervals];
  for (let i = 0; i < shift && i < notes.length - 1; i++) {
    notes.push(notes.shift()! + 12);
  }
  return notes;
}

function generateIdentifyQuestion(level: number): Question {
  const available = getAvailableChords(level);
  const chosen = available[randInt(0, available.length - 1)];
  const root = randInt(48, 67);
  const notes = chosen.intervals.map(i => root + i);
  const wrongs = shuffle(available.filter(c => c.key !== chosen.key)).slice(0, 3);
  const options = shuffle([chosen, ...wrongs]).map(c => c.key);
  return { mode: 'identify', notes: [notes], answer: chosen.key, options, displayNotes: notes };
}

function generateInversionsQuestion(level: number): Question {
  // Use 7th chords at higher levels for 3rd inversion availability
  const useSeventhChord = level >= 6 && Math.random() > 0.5;
  const chord = useSeventhChord
    ? CHORDS[4] // dom7 (4 notes, enables 3rd inversion)
    : (Math.random() > 0.5 ? CHORDS[0] : CHORDS[1]); // major or minor (3 notes)
  const avail = getAvailableInversions(level).filter(iv => iv.shift < chord.intervals.length);
  if (avail.length < 2) {
    // Fallback: use all inversions that fit
    const fallback = INVERSIONS.filter(iv => iv.shift < chord.intervals.length);
    const chosen = fallback[randInt(0, fallback.length - 1)];
    const root = randInt(48, 64);
    const notes = applyInversion(chord.intervals, chosen.shift).map(i => root + i);
    const wrongs = shuffle(fallback.filter(iv => iv.key !== chosen.key)).slice(0, 3);
    const options = shuffle([chosen, ...wrongs]).map(iv => iv.key);
    return { mode: 'inversions', notes: [notes], answer: chosen.key, options, displayNotes: notes };
  }
  const chosen = avail[randInt(0, avail.length - 1)];
  const root = randInt(48, 64);
  const notes = applyInversion(chord.intervals, chosen.shift).map(i => root + i);
  const wrongs = shuffle(avail.filter(iv => iv.key !== chosen.key)).slice(0, 3);
  const options = shuffle([chosen, ...wrongs]).map(iv => iv.key);
  return { mode: 'inversions', notes: [notes], answer: chosen.key, options, displayNotes: notes };
}

function generateProgressionsQuestion(level: number): Question {
  // Always have at least 2 progressions available
  const available = getAvailableProgressions(level);
  const pool = available.length >= 2 ? available : PROGRESSIONS.slice(0, 2);
  const chosen = pool[randInt(0, pool.length - 1)];
  const root = randInt(48, 60);
  const chordNotes: number[][] = chosen.degrees.map(deg => {
    const chordRoot = root + deg;
    // Simple: major for I, IV, V; minor for ii, iii, vi
    const isMajorDeg = [0, 5, 7].includes(deg);
    const intervals = isMajorDeg ? [0, 4, 7] : [0, 3, 7];
    return intervals.map(i => chordRoot + i);
  });
  const wrongs = shuffle(pool.filter(p => p.key !== chosen.key)).slice(0, Math.min(3, pool.length - 1));
  const options = shuffle([chosen, ...wrongs]).map(p => p.key);
  return { mode: 'progressions', notes: chordNotes, answer: chosen.key, options };
}

function generateQuestion(mode: QuizMode, level: number): Question {
  switch (mode) {
    case 'identify': return generateIdentifyQuestion(level);
    case 'inversions': return generateInversionsQuestion(level);
    case 'progressions': return generateProgressionsQuestion(level);
  }
}

function getAnswerName(mode: QuizMode, key: string, lang: Lang): string {
  if (mode === 'identify') return CHORDS.find(c => c.key === key)?.name[lang] ?? key;
  if (mode === 'inversions') return INVERSIONS.find(iv => iv.key === key)?.name[lang] ?? key;
  if (mode === 'progressions') return PROGRESSIONS.find(p => p.key === key)?.label ?? key;
  return key;
}

// ============================================================================
// STORAGE
// ============================================================================

const STORAGE_KEY = 'kuon-chord-quiz';

function defaultStats(): UserStats {
  return {
    level: 1, xp: 0, totalCorrect: 0, totalAttempted: 0,
    streak: 0, bestStreak: 0, achievements: [],
    sessionHistory: [], dailyStreak: 0, lastPlayDate: '',
    modeStats: {
      identify: { correct: 0, total: 0 },
      inversions: { correct: 0, total: 0 },
      progressions: { correct: 0, total: 0 },
    },
  };
}

function loadStats(): UserStats {
  if (typeof window === 'undefined') return defaultStats();
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return { ...defaultStats(), ...JSON.parse(r) }; } catch {}
  return defaultStats();
}

function saveStats(s: UserStats): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function updateDailyStreak(s: UserStats): UserStats {
  const today = new Date().toISOString().slice(0, 10);
  if (s.lastPlayDate === today) return s;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  return { ...s, dailyStreak: s.lastPlayDate === yesterday ? s.dailyStreak + 1 : 1, lastPlayDate: today };
}

// ============================================================================
// MINI KEYBOARD COMPONENT
// ============================================================================

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]);

function MiniKeyboard({ highlightNotes, show }: { highlightNotes: number[]; show: boolean }) {
  // Show 2 octaves (24 keys) starting from C3 (MIDI 48)
  const startMidi = 48;
  const keys = Array.from({ length: 25 }, (_, i) => startMidi + i);
  const highlightSet = new Set(highlightNotes);

  if (!show) return null;

  return (
    <div style={{ margin: '16px auto', maxWidth: 480, padding: '0 8px' }}>
      <div style={{
        position: 'relative', height: 90,
        display: 'flex', overflow: 'hidden', borderRadius: 8,
        border: '1px solid #e2e8f0',
      }}>
        {/* White keys */}
        {keys.filter(k => !BLACK_KEYS.has(k % 12)).map(k => (
          <div key={k} style={{
            flex: 1, height: '100%',
            background: highlightSet.has(k) ? `${ACCENT}20` : '#fff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: 4, fontSize: '0.55rem', color: highlightSet.has(k) ? ACCENT : '#cbd5e1',
            fontWeight: highlightSet.has(k) ? 700 : 400,
            position: 'relative',
          }}>
            {highlightSet.has(k) && (
              <div style={{
                position: 'absolute', bottom: 18,
                width: 8, height: 8, borderRadius: '50%',
                background: ACCENT,
              }} />
            )}
            {NOTE_NAMES[k % 12]}
          </div>
        ))}
        {/* Black keys overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 55, display: 'flex', pointerEvents: 'none' }}>
          {keys.filter(k => !BLACK_KEYS.has(k % 12)).map((k, i, whites) => {
            const nextSemitone = k + 1;
            if (!BLACK_KEYS.has(nextSemitone % 12) || i >= whites.length - 1) return null;
            const w = 100 / whites.length;
            const left = w * (i + 1) - w * 0.3;
            return (
              <div key={nextSemitone} style={{
                position: 'absolute',
                left: `${left}%`, width: `${w * 0.6}%`,
                height: '100%',
                background: highlightSet.has(nextSemitone) ? '#1e3a5f' : '#1e293b',
                borderRadius: '0 0 4px 4px',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                paddingBottom: 2,
              }}>
                {highlightSet.has(nextSemitone) && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', marginBottom: 2 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', marginTop: 6 }}>
        {T.keyboardHint.ja && ''}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ChordQuizPage() {
  const { lang } = useLang();
  const { guardAction, showNudge, setShowNudge } = useRegistrationNudge();
  const nudgeShownRef = useRef(false);

  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [mode, setMode] = useState<QuizMode>('identify');
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [session, setSession] = useState<SessionState>({ mode: 'identify', correct: 0, total: 0, streak: 0, bestStreak: 0, startTime: 0 });
  const [showAchievements, setShowAchievements] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [playMode, setPlayMode] = useState<'block' | 'broken'>('block');
  const [levelUpMsg, setLevelUpMsg] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [xpGained, setXpGained] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => { const s = loadStats(); setStats(updateDailyStreak(s)); setStatsLoaded(true); }, []);
  useEffect(() => { if (statsLoaded) saveStats(stats); }, [stats, statsLoaded]);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const playQ = useCallback((q: Question) => {
    const ctx = getCtx();
    const now = ctx.currentTime + 0.05;
    if (q.mode === 'progressions') {
      q.notes.forEach((chord, i) => {
        if (playMode === 'broken') playChordBroken(ctx, chord, now + i * 1.0, 0.8);
        else playChordBlock(ctx, chord, now + i * 1.0, 0.9);
      });
    } else {
      if (playMode === 'broken') playChordBroken(ctx, q.notes[0], now, 1.2);
      else playChordBlock(ctx, q.notes[0], now, 1.5);
    }
  }, [getCtx, playMode]);

  const startSession = useCallback(() => {
    setStarted(true);
    setSession({ mode, correct: 0, total: 0, streak: 0, bestStreak: 0, startTime: Date.now() });
    const q = generateQuestion(mode, stats.level);
    setQuestion(q); setSelected(null); setShowResult(false);
    setTimeout(() => playQ(q), 300);
  }, [mode, stats.level, playQ]);

  const handleAnswer = useCallback((key: string) => {
    if (showResult || !question) return;
    setSelected(key); setShowResult(true);
    const isCorrect = key === question.answer;

    setSession(prev => {
      const ns = isCorrect ? prev.streak + 1 : 0;
      return { ...prev, correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1, streak: ns, bestStreak: Math.max(prev.bestStreak, ns) };
    });

    if (isCorrect) {
      const bonus = (session.streak + 1) % 5 === 0 ? XP_STREAK_BONUS : 0;
      const earned = XP_PER_CORRECT + bonus;
      setXpGained(earned);
      try { playCorrectSound(getCtx()); } catch {}

      setStats(prev => {
        let u = { ...prev, totalCorrect: prev.totalCorrect + 1, totalAttempted: prev.totalAttempted + 1, streak: prev.streak + 1, bestStreak: Math.max(prev.bestStreak, prev.streak + 1), xp: prev.xp + earned };
        // mode stats
        const ms = { ...u.modeStats };
        const m = ms[question.mode] ?? { correct: 0, total: 0 };
        ms[question.mode] = { correct: m.correct + 1, total: m.total + 1 };
        u.modeStats = ms;
        // level up
        const needed = xpForLevel(u.level);
        if (u.xp >= needed) { u.xp -= needed; u.level += 1; setTimeout(() => setLevelUpMsg(true), 400); setTimeout(() => setLevelUpMsg(false), 2500); }
        // achievements
        const ses: SessionState = { ...session, correct: session.correct + 1, total: session.total + 1, streak: session.streak + 1, bestStreak: Math.max(session.bestStreak, session.streak + 1) };
        for (const a of ACHIEVEMENTS_DATA) {
          if (!u.achievements.includes(a.id) && a.check(u, ses)) {
            u.achievements = [...u.achievements, a.id];
            setTimeout(() => setNewAchievement(a), 600);
            setTimeout(() => setNewAchievement(null), 3000);
          }
        }
        return u;
      });
    } else {
      try { playWrongSound(getCtx()); } catch {}
      setStats(prev => {
        const ms = { ...prev.modeStats };
        const m = ms[question.mode] ?? { correct: 0, total: 0 };
        ms[question.mode] = { correct: m.correct, total: m.total + 1 };
        return { ...prev, totalAttempted: prev.totalAttempted + 1, streak: 0, modeStats: ms };
      });
    }
  }, [showResult, question, session, getCtx]);

  const nextQuestion = useCallback(() => {
    // Check if nudge should be shown (after 3rd round)
    if (session.total >= 2 && !nudgeShownRef.current) {
      nudgeShownRef.current = true;
      if (guardAction()) return;
    }

    const q = generateQuestion(mode, stats.level);
    setQuestion(q); setSelected(null); setShowResult(false); setXpGained(0);
    setTimeout(() => playQ(q), 300);
  }, [mode, stats.level, playQ, session.total, guardAction]);

  const endSession = useCallback(() => {
    if (session.total > 0) {
      const entry: SessionEntry = { date: new Date().toISOString().slice(0, 10), mode: session.mode, correct: session.correct, total: session.total, accuracy: Math.round((session.correct / session.total) * 100), duration: Math.round((Date.now() - session.startTime) / 1000) };
      setStats(prev => ({ ...prev, sessionHistory: [entry, ...prev.sessionHistory].slice(0, 50) }));
    }
    setStarted(false); setQuestion(null); setShowResult(false); setSelected(null);
  }, [session]);

  const accuracy = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
  const xpNeeded = xpForLevel(stats.level);
  const xpPct = Math.min((stats.xp / xpNeeded) * 100, 100);

  // ─── CARD STYLE (white base) ───
  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    padding: 'clamp(16px, 4vw, 24px)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  return (
    <>
    <RegistrationNudge show={showNudge} onClose={() => setShowNudge(false)} feature="history" />
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#1e293b',
      fontFamily: sans,
      paddingBottom: 80,
    }}>
      {/* ─── Header ─── */}
      <div style={{ textAlign: 'center', padding: '32px 16px 16px' }}>
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.4rem, 4vw, 2rem)',
          fontWeight: 700, letterSpacing: '0.06em',
          margin: 0, color: '#0f172a',
        }}>
          {T.title[lang]}
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0', fontFamily: serif }}>
          {T.subtitle[lang]}
        </p>
      </div>

      {/* ─── Level & XP ─── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: ACCENT }}>{T.level[lang]}{stats.level}</span>
          <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${xpPct}%`, height: '100%', background: `linear-gradient(90deg, ${ACCENT}, #38bdf8)`, borderRadius: 3, transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{stats.xp}/{xpNeeded}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: '0.75rem', color: '#94a3b8', marginBottom: 16 }}>
          <span>🔥 {stats.dailyStreak}{lang === 'ja' ? '日' : lang === 'ko' ? '일' : 'd'}</span>
          <span>🏆 {stats.bestStreak}</span>
          <span>🎯 {stats.totalCorrect}/{stats.totalAttempted}</span>
        </div>
      </div>

      {/* ═══ MODE SELECTION (not started) ═══ */}
      {!started && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
          {/* Mode tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            {(['identify', 'inversions', 'progressions'] as QuizMode[]).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                padding: '14px 8px', borderRadius: 14,
                border: mode === m ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
                background: mode === m ? `${ACCENT}08` : '#fff',
                color: mode === m ? '#0f172a' : '#64748b',
                cursor: 'pointer', fontFamily: sans, fontSize: 'clamp(0.7rem, 2.5vw, 0.82rem)', fontWeight: 600,
                transition: 'all 0.2s',
                boxShadow: mode === m ? `0 2px 8px ${ACCENT}15` : 'none',
              }}>
                <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>
                  {m === 'identify' ? '🎹' : m === 'inversions' ? '🔄' : '🎼'}
                </div>
                {T[m][lang]}
              </button>
            ))}
          </div>

          {/* Description */}
          <div style={{ ...card, marginBottom: 12 }}>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.7, margin: 0 }}>
              {MODE_DESCS[mode][lang]}
            </p>
            {mode !== 'progressions' && (() => {
              const items = mode === 'identify'
                ? getAvailableChords(stats.level).map(c => c.name[lang])
                : getAvailableInversions(stats.level).map(iv => iv.name[lang]);
              return (
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 10 }}>
                  <span style={{ color: GREEN, fontWeight: 600 }}>✓ {T.unlocked[lang]}: </span>
                  {items.join('、')}
                </div>
              );
            })()}
          </div>

          {/* Play style (block vs broken) */}
          <div style={{ ...card, marginBottom: 16, padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['block', 'broken'] as const).map(ps => (
                <button key={ps} onClick={() => setPlayMode(ps)} style={{
                  flex: 1, padding: '8px', borderRadius: 10,
                  border: playMode === ps ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
                  background: playMode === ps ? `${ACCENT}08` : '#fff',
                  color: playMode === ps ? '#0f172a' : '#94a3b8',
                  cursor: 'pointer', fontSize: '0.78rem', fontFamily: sans, fontWeight: 500,
                }}>
                  {ps === 'block' ? T.block[lang] : T.blocked[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Start */}
          <button onClick={startSession} style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`, color: '#fff',
            fontFamily: sans, fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
            letterSpacing: '0.04em', marginBottom: 20,
            boxShadow: `0 4px 16px ${ACCENT}30`,
          }}>
            {T.start[lang]}
          </button>

          {/* Achievement & history buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={() => { setShowAchievements(!showAchievements); setShowHistory(false); }} style={pillBtn(showAchievements)}>
              🏅 {T.achievements[lang]}
            </button>
            <button onClick={() => { setShowHistory(!showHistory); setShowAchievements(false); }} style={pillBtn(showHistory)}>
              📊 {T.history[lang]}
            </button>
          </div>

          {showAchievements && (
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
                {ACHIEVEMENTS_DATA.map(a => {
                  const ok = stats.achievements.includes(a.id);
                  return (
                    <div key={a.id} style={{
                      padding: 10, borderRadius: 12, textAlign: 'center',
                      background: ok ? `${GOLD}10` : '#f8fafc',
                      border: ok ? `1px solid ${GOLD}40` : '1px solid #e2e8f0',
                      opacity: ok ? 1 : 0.5,
                    }}>
                      <div style={{ fontSize: '1.3rem' }}>{a.icon}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: ok ? GOLD : '#94a3b8', marginTop: 2 }}>{a.name[lang]}</div>
                      <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: 1 }}>{a.description[lang]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showHistory && (
            <div style={{ ...card, marginBottom: 16 }}>
              {stats.sessionHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>{T.noHistory[lang]}</div>
              ) : (
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {stats.sessionHistory.slice(0, 20).map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.78rem' }}>
                      <span style={{ color: '#64748b' }}>{h.date}</span>
                      <span style={{ color: '#94a3b8', textTransform: 'capitalize', fontSize: '0.7rem' }}>{h.mode}</span>
                      <span style={{ fontWeight: 600, color: h.accuracy >= 80 ? GREEN : h.accuracy >= 50 ? GOLD : RED }}>{h.accuracy}%</span>
                      <span style={{ color: '#94a3b8' }}>{h.correct}/{h.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ QUIZ ACTIVE ═══ */}
      {started && question && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
          {/* Session bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 14px', ...card, marginBottom: 14,
          }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {T[mode][lang]} · {session.total}{T.questions[lang]}
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: accuracy >= 80 ? GREEN : accuracy >= 50 ? GOLD : RED }}>
              {accuracy}%
            </span>
            {session.streak > 0 && <span style={{ fontSize: '0.85rem' }}>🔥 {session.streak}</span>}
            <button onClick={endSession} style={{
              padding: '5px 12px', borderRadius: 8, border: `1px solid ${RED}40`,
              background: `${RED}08`, color: RED, fontSize: '0.72rem', cursor: 'pointer', fontFamily: sans,
            }}>
              {T.end[lang]}
            </button>
          </div>

          {/* Question card */}
          <div style={{
            ...card, marginBottom: 14, textAlign: 'center',
            minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          }}>
            {/* Result indicator */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: showResult ? (selected === question.answer ? `${GREEN}12` : `${RED}12`) : `${ACCENT}08`,
              border: `2.5px solid ${showResult ? (selected === question.answer ? GREEN : RED) : '#e2e8f0'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', marginBottom: 14, transition: 'all 0.3s',
            }}>
              {showResult ? (selected === question.answer ? '✓' : '✗') : (
                mode === 'identify' ? '🎹' : mode === 'inversions' ? '🔄' : '🎼'
              )}
            </div>

            {/* Replay */}
            <button onClick={() => playQ(question)} style={{
              padding: '8px 20px', borderRadius: 10,
              border: `1.5px solid ${ACCENT}`, background: `${ACCENT}06`,
              color: ACCENT, fontFamily: sans, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              marginBottom: 12,
            }}>
              🔊 {T.replay[lang]}
            </button>

            {/* Correct answer display when wrong */}
            {showResult && selected !== question.answer && (
              <div style={{
                padding: '6px 14px', borderRadius: 8,
                background: `${GREEN}08`, border: `1px solid ${GREEN}30`,
                fontSize: '0.85rem', color: GREEN, marginBottom: 8,
              }}>
                → {getAnswerName(mode, question.answer, lang)}
              </div>
            )}

            {showResult && selected === question.answer && xpGained > 0 && (
              <div style={{ fontSize: '0.82rem', color: GOLD, fontWeight: 700 }}>+{xpGained} XP</div>
            )}
          </div>

          {/* Keyboard highlight (identify & inversions) */}
          {question.displayNotes && (
            <MiniKeyboard highlightNotes={showResult ? question.displayNotes : []} show={showResult} />
          )}

          {/* Options */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: question.options.length <= 3 ? `repeat(${question.options.length}, 1fr)` : 'repeat(2, 1fr)',
            gap: 8, marginBottom: 14,
          }}>
            {question.options.map((opt, i) => {
              const isCorrectOpt = opt === question.answer;
              const isSel = opt === selected;
              let bg = '#fff', border = '#e2e8f0', color = '#1e293b';
              if (showResult) {
                if (isCorrectOpt) { bg = `${GREEN}10`; border = GREEN; color = GREEN; }
                else if (isSel) { bg = `${RED}08`; border = RED; color = RED; }
                else { bg = '#f8fafc'; color = '#cbd5e1'; }
              }
              return (
                <button key={`${opt}-${i}`} onClick={() => handleAnswer(opt)} disabled={showResult} style={{
                  padding: '14px 10px', borderRadius: 12,
                  border: `1.5px solid ${border}`, background: bg, color,
                  fontFamily: sans, fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', fontWeight: 600,
                  cursor: showResult ? 'default' : 'pointer',
                  transition: 'all 0.2s', textAlign: 'center',
                  boxShadow: !showResult ? '0 1px 3px rgba(0,0,0,0.03)' : 'none',
                }}>
                  {getAnswerName(mode, opt, lang)}
                </button>
              );
            })}
          </div>

          {/* Next */}
          {showResult && (
            <button onClick={nextQuestion} style={{
              width: '100%', padding: '13px', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`, color: '#fff',
              fontFamily: sans, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 4px 16px ${ACCENT}30`,
            }}>
              {T.next[lang]} →
            </button>
          )}
        </div>
      )}

      {/* ─── Level Up ─── */}
      {levelUpMsg && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: '#fff', border: `2px solid ${GOLD}`, borderRadius: 20,
          padding: '28px 44px', textAlign: 'center', zIndex: 1000,
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          animation: 'popIn 0.35s ease',
        }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 6 }}>⭐</div>
          <div style={{ fontFamily: serif, fontSize: '1.3rem', fontWeight: 700, color: GOLD }}>{T.levelUp[lang]}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: 6 }}>{T.level[lang]}{stats.level}</div>
        </div>
      )}

      {/* ─── Achievement toast ─── */}
      {newAchievement && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#fff', border: `1.5px solid ${GOLD}`, borderRadius: 14,
          padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10,
          zIndex: 1000, boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          animation: 'slideUp 0.35s ease', whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: '1.5rem' }}>{newAchievement.icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: GOLD, fontSize: '0.82rem' }}>{newAchievement.name[lang]}</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{newAchievement.description[lang]}</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
    </>
  );
}

// ─── Helper ───
function pillBtn(active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '9px', borderRadius: 10,
    border: active ? `1.5px solid #0284c7` : '1px solid #e2e8f0',
    background: active ? '#0284c708' : '#fff',
    color: active ? '#0f172a' : '#94a3b8',
    cursor: 'pointer', fontSize: '0.78rem',
    fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 500,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  };
}
