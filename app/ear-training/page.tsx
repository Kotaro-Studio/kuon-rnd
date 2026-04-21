'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { RegistrationNudge, useRegistrationNudge } from '@/components/RegistrationNudge';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Mode = 'intervals' | 'chords' | 'scales' | 'melody';
type L5 = Record<Lang, string>;

interface Question {
  type: Mode;
  notes: number[];       // MIDI note numbers
  answer: string;        // correct answer key
  options: string[];     // answer choices
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
}

interface SessionEntry {
  date: string;
  mode: Mode;
  correct: number;
  total: number;
  accuracy: number;
  duration: number;
}

interface Achievement {
  id: string;
  name: L5;
  description: L5;
  icon: string;
  check: (stats: UserStats, session: SessionState) => boolean;
}

interface SessionState {
  mode: Mode;
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
  startTime: number;
  consecutivePerfect: number;
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

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// XP per correct answer, bonus for streaks
const XP_PER_CORRECT = 10;
const XP_STREAK_BONUS = 5; // per streak milestone (every 5)
const XP_PER_LEVEL = 100;  // XP needed to level up (scales with level)

function xpForLevel(level: number): number {
  return Math.floor(XP_PER_LEVEL * (1 + (level - 1) * 0.15));
}

// ============================================================================
// INTERVAL DEFINITIONS
// ============================================================================

interface IntervalDef {
  semitones: number;
  key: string;
  name: L5;
  minLevel: number;
}

const INTERVALS: IntervalDef[] = [
  { semitones: 1,  key: 'm2',  name: { ja: '短2度', en: 'Minor 2nd', ko: '단2도', pt: '2ª menor', es: '2ª menor' }, minLevel: 1 },
  { semitones: 2,  key: 'M2',  name: { ja: '長2度', en: 'Major 2nd', ko: '장2도', pt: '2ª maior', es: '2ª mayor' }, minLevel: 1 },
  { semitones: 3,  key: 'm3',  name: { ja: '短3度', en: 'Minor 3rd', ko: '단3도', pt: '3ª menor', es: '3ª menor' }, minLevel: 1 },
  { semitones: 4,  key: 'M3',  name: { ja: '長3度', en: 'Major 3rd', ko: '장3도', pt: '3ª maior', es: '3ª mayor' }, minLevel: 1 },
  { semitones: 5,  key: 'P4',  name: { ja: '完全4度', en: 'Perfect 4th', ko: '완전4도', pt: '4ª justa', es: '4ª justa' }, minLevel: 2 },
  { semitones: 6,  key: 'TT',  name: { ja: '三全音', en: 'Tritone', ko: '삼전음', pt: 'Trítono', es: 'Tritono' }, minLevel: 5 },
  { semitones: 7,  key: 'P5',  name: { ja: '完全5度', en: 'Perfect 5th', ko: '완전5도', pt: '5ª justa', es: '5ª justa' }, minLevel: 2 },
  { semitones: 8,  key: 'm6',  name: { ja: '短6度', en: 'Minor 6th', ko: '단6도', pt: '6ª menor', es: '6ª menor' }, minLevel: 4 },
  { semitones: 9,  key: 'M6',  name: { ja: '長6度', en: 'Major 6th', ko: '장6도', pt: '6ª maior', es: '6ª mayor' }, minLevel: 4 },
  { semitones: 10, key: 'm7',  name: { ja: '短7度', en: 'Minor 7th', ko: '단7도', pt: '7ª menor', es: '7ª menor' }, minLevel: 6 },
  { semitones: 11, key: 'M7',  name: { ja: '長7度', en: 'Major 7th', ko: '장7도', pt: '7ª maior', es: '7ª mayor' }, minLevel: 6 },
  { semitones: 12, key: 'P8',  name: { ja: 'オクターブ', en: 'Octave', ko: '옥타브', pt: 'Oitava', es: 'Octava' }, minLevel: 3 },
];

// ============================================================================
// CHORD DEFINITIONS
// ============================================================================

interface ChordDef {
  intervals: number[];
  key: string;
  name: L5;
  minLevel: number;
}

const CHORDS: ChordDef[] = [
  { intervals: [0, 4, 7],     key: 'major',   name: { ja: 'メジャー', en: 'Major', ko: '장', pt: 'Maior', es: 'Mayor' }, minLevel: 1 },
  { intervals: [0, 3, 7],     key: 'minor',   name: { ja: 'マイナー', en: 'Minor', ko: '단', pt: 'Menor', es: 'Menor' }, minLevel: 1 },
  { intervals: [0, 3, 6],     key: 'dim',     name: { ja: 'ディミニッシュ', en: 'Diminished', ko: '감', pt: 'Diminuto', es: 'Disminuido' }, minLevel: 3 },
  { intervals: [0, 4, 8],     key: 'aug',     name: { ja: 'オーグメント', en: 'Augmented', ko: '증', pt: 'Aumentado', es: 'Aumentado' }, minLevel: 3 },
  { intervals: [0, 4, 7, 10], key: 'dom7',    name: { ja: '属7', en: 'Dominant 7th', ko: '속7', pt: '7ª Dominante', es: '7ª Dominante' }, minLevel: 5 },
  { intervals: [0, 4, 7, 11], key: 'maj7',    name: { ja: 'メジャー7', en: 'Major 7th', ko: '장7', pt: '7ª Maior', es: '7ª Mayor' }, minLevel: 5 },
  { intervals: [0, 3, 7, 10], key: 'min7',    name: { ja: 'マイナー7', en: 'Minor 7th', ko: '단7', pt: '7ª Menor', es: '7ª Menor' }, minLevel: 5 },
  { intervals: [0, 3, 6, 10], key: 'hdim7',   name: { ja: '半減7', en: 'Half-dim 7th', ko: '반감7', pt: '7ª Meio-dim', es: '7ª Semi-dis' }, minLevel: 8 },
  { intervals: [0, 3, 6, 9],  key: 'dim7',    name: { ja: '減7', en: 'Diminished 7th', ko: '감7', pt: '7ª Diminuta', es: '7ª Disminuida' }, minLevel: 8 },
  { intervals: [0, 4, 8, 11], key: 'aug7',    name: { ja: '増7', en: 'Augmented 7th', ko: '증7', pt: '7ª Aumentada', es: '7ª Aumentada' }, minLevel: 10 },
  { intervals: [0, 2, 7],     key: 'sus2',    name: { ja: 'sus2', en: 'Sus2', ko: 'sus2', pt: 'Sus2', es: 'Sus2' }, minLevel: 7 },
  { intervals: [0, 5, 7],     key: 'sus4',    name: { ja: 'sus4', en: 'Sus4', ko: 'sus4', pt: 'Sus4', es: 'Sus4' }, minLevel: 7 },
];

// ============================================================================
// SCALE DEFINITIONS
// ============================================================================

interface ScaleDef {
  intervals: number[];
  key: string;
  name: L5;
  minLevel: number;
}

const SCALES: ScaleDef[] = [
  { intervals: [0,2,4,5,7,9,11,12], key: 'major',     name: { ja: '長音階', en: 'Major', ko: '장음계', pt: 'Maior', es: 'Mayor' }, minLevel: 1 },
  { intervals: [0,2,3,5,7,8,10,12], key: 'nat-minor',  name: { ja: '自然短音階', en: 'Natural Minor', ko: '자연단음계', pt: 'Menor Natural', es: 'Menor Natural' }, minLevel: 1 },
  { intervals: [0,2,3,5,7,8,11,12], key: 'harm-minor', name: { ja: '和声短音階', en: 'Harmonic Minor', ko: '화성단음계', pt: 'Menor Harmônica', es: 'Menor Armónica' }, minLevel: 3 },
  { intervals: [0,2,3,5,7,9,11,12], key: 'mel-minor',  name: { ja: '旋律短音階', en: 'Melodic Minor', ko: '선율단음계', pt: 'Menor Melódica', es: 'Menor Melódica' }, minLevel: 3 },
  { intervals: [0,2,4,7,9,12],      key: 'penta-maj',  name: { ja: '五音音階(長)', en: 'Major Pentatonic', ko: '5음음계(장)', pt: 'Pentatônica Maior', es: 'Pentatónica Mayor' }, minLevel: 2 },
  { intervals: [0,3,5,7,10,12],     key: 'penta-min',  name: { ja: '五音音階(短)', en: 'Minor Pentatonic', ko: '5음음계(단)', pt: 'Pentatônica Menor', es: 'Pentatónica Menor' }, minLevel: 2 },
  { intervals: [0,2,4,6,8,10,12],   key: 'whole-tone', name: { ja: '全音音階', en: 'Whole Tone', ko: '전음음계', pt: 'Tons Inteiros', es: 'Tonos Enteros' }, minLevel: 6 },
  { intervals: [0,1,3,4,6,7,9,10,12], key: 'dim-scale', name: { ja: 'ディミニッシュスケール', en: 'Diminished', ko: '감음계', pt: 'Diminuta', es: 'Disminuida' }, minLevel: 8 },
  { intervals: [0,2,3,5,6,8,9,11,12], key: 'oct-scale', name: { ja: 'オクタトニックスケール', en: 'Octatonic', ko: '옥타토닉', pt: 'Octatônica', es: 'Octatónica' }, minLevel: 10 },
  { intervals: [0,1,4,5,7,8,11,12], key: 'hung-minor', name: { ja: 'ハンガリー短音階', en: 'Hungarian Minor', ko: '헝가리단음계', pt: 'Menor Húngara', es: 'Menor Húngara' }, minLevel: 12 },
];

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

const ACHIEVEMENTS_DATA: Achievement[] = [
  {
    id: 'first-correct', icon: '🎵',
    name: { ja: '最初の正解', en: 'First Correct', ko: '첫 번째 정답', pt: 'Primeiro Acerto', es: 'Primer Acierto' },
    description: { ja: '初めて正解する', en: 'Get your first correct answer', ko: '처음으로 정답 맞추기', pt: 'Acertar pela primeira vez', es: 'Tu primera respuesta correcta' },
    check: (s) => s.totalCorrect >= 1,
  },
  {
    id: 'streak-10', icon: '🔥',
    name: { ja: '10連続正解', en: '10 Streak', ko: '10연속 정답', pt: '10 Sequência', es: '10 Racha' },
    description: { ja: '10問連続で正解する', en: '10 correct answers in a row', ko: '10문제 연속 정답', pt: '10 respostas corretas seguidas', es: '10 respuestas correctas seguidas' },
    check: (s) => s.bestStreak >= 10,
  },
  {
    id: 'streak-25', icon: '⚡',
    name: { ja: '25連続正解', en: '25 Streak', ko: '25연속 정답', pt: '25 Sequência', es: '25 Racha' },
    description: { ja: '25問連続で正解する', en: '25 correct answers in a row', ko: '25문제 연속 정답', pt: '25 respostas corretas seguidas', es: '25 respuestas correctas seguidas' },
    check: (s) => s.bestStreak >= 25,
  },
  {
    id: 'level-10', icon: '⭐',
    name: { ja: 'レベル10到達', en: 'Level 10', ko: '레벨 10 달성', pt: 'Nível 10', es: 'Nivel 10' },
    description: { ja: 'レベル10に到達する', en: 'Reach level 10', ko: '레벨 10에 도달', pt: 'Alcançar nível 10', es: 'Alcanzar nivel 10' },
    check: (s) => s.level >= 10,
  },
  {
    id: 'accuracy-90', icon: '🎯',
    name: { ja: '正解率90%', en: '90% Accuracy', ko: '정답률 90%', pt: '90% Precisão', es: '90% Precisión' },
    description: { ja: 'セッションで正答率90%以上', en: '90%+ accuracy in a session', ko: '세션에서 정답률 90% 이상', pt: '90%+ de precisão em uma sessão', es: '90%+ de precisión en una sesión' },
    check: (_s, ses) => ses.total >= 10 && (ses.correct / ses.total) >= 0.9,
  },
  {
    id: 'daily-7', icon: '📅',
    name: { ja: '7日連続', en: '7-Day Streak', ko: '7일 연속', pt: '7 Dias Seguidos', es: '7 Días Seguidos' },
    description: { ja: '7日間連続で練習する', en: 'Practice for 7 consecutive days', ko: '7일 연속 연습', pt: 'Praticar por 7 dias consecutivos', es: 'Practicar 7 días consecutivos' },
    check: (s) => s.dailyStreak >= 7,
  },
  {
    id: 'all-intervals', icon: '🏆',
    name: { ja: '全音程制覇', en: 'All Intervals', ko: '전음정 정복', pt: 'Todos os Intervalos', es: 'Todos los Intervalos' },
    description: { ja: '全ての音程を正しく判定する', en: 'Identify all interval types correctly', ko: '모든 음정을 올바르게 판단', pt: 'Identificar todos os intervalos corretamente', es: 'Identificar todos los intervalos correctamente' },
    check: (s) => s.level >= 7,
  },
  {
    id: 'chord-master', icon: '🎹',
    name: { ja: '和音マスター', en: 'Chord Master', ko: '화음 마스터', pt: 'Mestre de Acordes', es: 'Maestro de Acordes' },
    description: { ja: 'レベル15に到達（7th和音解禁）', en: 'Reach level 15 (7th chords unlocked)', ko: '레벨 15 도달 (7th 화음 해금)', pt: 'Alcançar nível 15 (acordes 7ª desbloqueados)', es: 'Alcanzar nivel 15 (acordes 7ª desbloqueados)' },
    check: (s) => s.level >= 15,
  },
];

// ============================================================================
// TRANSLATIONS
// ============================================================================

const T: Record<string, L5> = {
  title: { ja: 'KUON EAR TRAINING', en: 'KUON EAR TRAINING', ko: 'KUON EAR TRAINING', pt: 'KUON EAR TRAINING', es: 'KUON EAR TRAINING' },
  subtitle: { ja: '音感トレーニング', en: 'Ear Training', ko: '청음 훈련', pt: 'Treinamento Auditivo', es: 'Entrenamiento Auditivo' },
  intervals: { ja: '音程', en: 'Intervals', ko: '음정', pt: 'Intervalos', es: 'Intervalos' },
  chords: { ja: '和音', en: 'Chords', ko: '화음', pt: 'Acordes', es: 'Acordes' },
  scales: { ja: '音階', en: 'Scales', ko: '음계', pt: 'Escalas', es: 'Escalas' },
  melody: { ja: '聴音', en: 'Melody', ko: '청음', pt: 'Melodia', es: 'Melodía' },
  play: { ja: '再生', en: 'Play', ko: '재생', pt: 'Reproduzir', es: 'Reproducir' },
  replay: { ja: 'もう一度聴く', en: 'Listen Again', ko: '다시 듣기', pt: 'Ouvir Novamente', es: 'Escuchar de Nuevo' },
  correct: { ja: '正解！', en: 'Correct!', ko: '정답!', pt: 'Correto!', es: '¡Correcto!' },
  wrong: { ja: '不正解', en: 'Wrong', ko: '오답', pt: 'Errado', es: 'Incorrecto' },
  next: { ja: '次の問題', en: 'Next', ko: '다음', pt: 'Próximo', es: 'Siguiente' },
  start: { ja: 'スタート', en: 'Start', ko: '시작', pt: 'Iniciar', es: 'Empezar' },
  level: { ja: 'Lv.', en: 'Lv.', ko: 'Lv.', pt: 'Nv.', es: 'Nv.' },
  streak: { ja: 'コンボ', en: 'Streak', ko: '연계', pt: 'Sequência', es: 'Racha' },
  bestStreak: { ja: '最高記録', en: 'Best', ko: '최고', pt: 'Melhor', es: 'Mejor' },
  accuracy: { ja: '正答率', en: 'Accuracy', ko: '정답률', pt: 'Precisão', es: 'Precisión' },
  achievements: { ja: 'アチーブメント', en: 'Achievements', ko: '업적', pt: 'Conquistas', es: 'Logros' },
  sessionStats: { ja: 'セッション結果', en: 'Session Results', ko: '세션 결과', pt: 'Resultado da Sessão', es: 'Resultado de Sesión' },
  totalQuestions: { ja: '出題数', en: 'Questions', ko: '문제 수', pt: 'Questões', es: 'Preguntas' },
  correctCount: { ja: '正解数', en: 'Correct', ko: '정답 수', pt: 'Acertos', es: 'Aciertos' },
  duration: { ja: '所要時間', en: 'Duration', ko: '소요 시간', pt: 'Duração', es: 'Duración' },
  newRecord: { ja: '🎉 新記録！', en: '🎉 New Record!', ko: '🎉 신기록!', pt: '🎉 Novo Recorde!', es: '🎉 ¡Nuevo Récord!' },
  ascending: { ja: '上行', en: 'Ascending', ko: '상행', pt: 'Ascendente', es: 'Ascendente' },
  descending: { ja: '下行', en: 'Descending', ko: '하행', pt: 'Descendente', es: 'Descendente' },
  harmonic: { ja: '同時', en: 'Harmonic', ko: '동시', pt: 'Harmônico', es: 'Armónico' },
  melodic: { ja: '分散', en: 'Melodic', ko: '분산', pt: 'Melódico', es: 'Melódico' },
  settings: { ja: '設定', en: 'Settings', ko: '설정', pt: 'Configurações', es: 'Configuración' },
  playStyle: { ja: '出題方式', en: 'Play Style', ko: '출제 방식', pt: 'Estilo de Reprodução', es: 'Estilo de Reproducción' },
  history: { ja: '履歴', en: 'History', ko: '기록', pt: 'Histórico', es: 'Historial' },
  noHistory: { ja: 'まだ履歴がありません', en: 'No history yet', ko: '아직 기록이 없습니다', pt: 'Sem histórico ainda', es: 'Sin historial aún' },
  dailyStreak: { ja: '連続日数', en: 'Daily Streak', ko: '연속 일수', pt: 'Dias Seguidos', es: 'Días Seguidos' },
  xpGained: { ja: 'XP獲得', en: 'XP Gained', ko: 'XP 획득', pt: 'XP Ganho', es: 'XP Ganado' },
  levelUp: { ja: 'レベルアップ！', en: 'LEVEL UP!', ko: '레벨 업!', pt: 'NÍVEL ACIMA!', es: '¡NIVEL ARRIBA!' },
  unlockedNew: { ja: '新しい音がアンロックされました！', en: 'New sounds unlocked!', ko: '새로운 소리가 해금되었습니다!', pt: 'Novos sons desbloqueados!', es: '¡Nuevos sonidos desbloqueados!' },
  tapToStart: { ja: 'タップしてスタート', en: 'Tap to Start', ko: '탭하여 시작', pt: 'Toque para Iniciar', es: 'Toca para Empezar' },
  questionsAnswered: { ja: '問', en: 'Q', ko: '문', pt: 'P', es: 'P' },
};

// ============================================================================
// AUDIO ENGINE
// ============================================================================

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, type: OscillatorType = 'sine'): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
  gain.gain.setValueAtTime(0.3, startTime + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playChordTones(ctx: AudioContext, midiNotes: number[], startTime: number, duration: number): void {
  midiNotes.forEach(n => playTone(ctx, midiToFreq(n), startTime, duration));
}

function playMelodicSequence(ctx: AudioContext, midiNotes: number[], startTime: number, noteDur: number, gap: number): void {
  midiNotes.forEach((n, i) => {
    playTone(ctx, midiToFreq(n), startTime + i * (noteDur + gap), noteDur);
  });
}

// ============================================================================
// QUESTION GENERATORS
// ============================================================================

function getAvailableIntervals(level: number): IntervalDef[] {
  return INTERVALS.filter(i => i.minLevel <= level);
}

function getAvailableChords(level: number): ChordDef[] {
  return CHORDS.filter(c => c.minLevel <= level);
}

function getAvailableScales(level: number): ScaleDef[] {
  return SCALES.filter(s => s.minLevel <= level);
}

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

function generateIntervalQuestion(level: number): Question {
  const available = getAvailableIntervals(level);
  const chosen = available[randInt(0, available.length - 1)];
  const root = randInt(48, 72); // C3 to C5
  const notes = [root, root + chosen.semitones];
  const wrongOptions = shuffle(available.filter(i => i.key !== chosen.key)).slice(0, 3);
  const options = shuffle([chosen, ...wrongOptions]).map(i => i.key);
  return { type: 'intervals', notes, answer: chosen.key, options };
}

function generateChordQuestion(level: number): Question {
  const available = getAvailableChords(level);
  const chosen = available[randInt(0, available.length - 1)];
  const root = randInt(48, 65); // C3 to F4
  const notes = chosen.intervals.map(i => root + i);
  const wrongOptions = shuffle(available.filter(c => c.key !== chosen.key)).slice(0, 3);
  const options = shuffle([chosen, ...wrongOptions]).map(c => c.key);
  return { type: 'chords', notes, answer: chosen.key, options };
}

function generateScaleQuestion(level: number): Question {
  const available = getAvailableScales(level);
  const chosen = available[randInt(0, available.length - 1)];
  const root = randInt(55, 67); // G3 to G4
  const notes = chosen.intervals.map(i => root + i);
  const wrongOptions = shuffle(available.filter(s => s.key !== chosen.key)).slice(0, 3);
  const options = shuffle([chosen, ...wrongOptions]).map(s => s.key);
  return { type: 'scales', notes, answer: chosen.key, options };
}

function generateMelodyQuestion(level: number): Question {
  // Generate a short random melody (3-5 notes depending on level)
  const len = Math.min(3 + Math.floor(level / 5), 7);
  const root = randInt(60, 67); // C4 to G4
  const scaleNotes = [0, 2, 4, 5, 7, 9, 11]; // major scale
  const melody: number[] = [root];
  for (let i = 1; i < len; i++) {
    const step = scaleNotes[randInt(0, scaleNotes.length - 1)];
    melody.push(root + step);
  }
  // Answer is the sequence of note names
  const answer = melody.map(m => NOTE_NAMES[m % 12]).join('-');
  // Generate wrong options by altering 1-2 notes
  const options: string[] = [answer];
  for (let i = 0; i < 3; i++) {
    const wrong = [...melody];
    const idx = randInt(1, wrong.length - 1);
    wrong[idx] = wrong[idx] + (Math.random() > 0.5 ? 1 : -1);
    options.push(wrong.map(m => NOTE_NAMES[((m % 12) + 12) % 12]).join('-'));
  }
  return { type: 'melody', notes: melody, answer, options: shuffle(options) };
}

function generateQuestion(mode: Mode, level: number): Question {
  switch (mode) {
    case 'intervals': return generateIntervalQuestion(level);
    case 'chords': return generateChordQuestion(level);
    case 'scales': return generateScaleQuestion(level);
    case 'melody': return generateMelodyQuestion(level);
  }
}

// ============================================================================
// HELPER: Get display name for an answer key
// ============================================================================

function getAnswerName(mode: Mode, key: string, lang: Lang): string {
  if (mode === 'intervals') {
    const found = INTERVALS.find(i => i.key === key);
    return found ? found.name[lang] : key;
  }
  if (mode === 'chords') {
    const found = CHORDS.find(c => c.key === key);
    return found ? found.name[lang] : key;
  }
  if (mode === 'scales') {
    const found = SCALES.find(s => s.key === key);
    return found ? found.name[lang] : key;
  }
  // melody: show note sequence
  return key.replace(/-/g, ' → ');
}

// ============================================================================
// LOAD / SAVE STATS
// ============================================================================

const STORAGE_KEY = 'kuon-ear-training';

function loadStats(): UserStats {
  if (typeof window === 'undefined') return defaultStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultStats(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultStats();
}

function saveStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch { /* ignore */ }
}

function defaultStats(): UserStats {
  return {
    level: 1,
    xp: 0,
    totalCorrect: 0,
    totalAttempted: 0,
    streak: 0,
    bestStreak: 0,
    achievements: [],
    sessionHistory: [],
    dailyStreak: 0,
    lastPlayDate: '',
  };
}

function updateDailyStreak(stats: UserStats): UserStats {
  const today = new Date().toISOString().slice(0, 10);
  if (stats.lastPlayDate === today) return stats;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = stats.lastPlayDate === yesterday ? stats.dailyStreak + 1 : 1;
  return { ...stats, dailyStreak: newStreak, lastPlayDate: today };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EarTrainingPage() {
  const { lang } = useLang();
  const { guardAction, showNudge, setShowNudge } = useRegistrationNudge();
  const nudgeShownRef = useRef(false);

  // User persistent stats
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [statsLoaded, setStatsLoaded] = useState(false);

  // Session state
  const [mode, setMode] = useState<Mode>('intervals');
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [session, setSession] = useState<SessionState>({
    mode: 'intervals', correct: 0, total: 0, streak: 0, bestStreak: 0, startTime: 0, consecutivePerfect: 0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [playStyle, setPlayStyle] = useState<'ascending' | 'descending' | 'harmonic'>('ascending');
  const [levelUpMsg, setLevelUpMsg] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [xpGained, setXpGained] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load stats on mount
  useEffect(() => {
    const s = loadStats();
    setStats(updateDailyStreak(s));
    setStatsLoaded(true);
  }, []);

  // Save stats when they change
  useEffect(() => {
    if (statsLoaded) saveStats(stats);
  }, [stats, statsLoaded]);

  // Ensure AudioContext
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Play the question's audio
  const playQuestion = useCallback((q: Question) => {
    const ctx = getAudioCtx();
    const now = ctx.currentTime + 0.05;
    if (q.type === 'chords') {
      if (playStyle === 'harmonic') {
        playChordTones(ctx, q.notes, now, 1.5);
      } else {
        const dir = playStyle === 'descending' ? [...q.notes].reverse() : q.notes;
        playMelodicSequence(ctx, dir, now, 0.4, 0.05);
      }
    } else if (q.type === 'intervals') {
      if (playStyle === 'harmonic') {
        playChordTones(ctx, q.notes, now, 1.5);
      } else {
        const dir = playStyle === 'descending' ? [...q.notes].reverse() : q.notes;
        playMelodicSequence(ctx, dir, now, 0.6, 0.1);
      }
    } else if (q.type === 'scales' || q.type === 'melody') {
      const dur = q.type === 'scales' ? 0.25 : 0.4;
      playMelodicSequence(ctx, q.notes, now, dur, 0.03);
    }
  }, [getAudioCtx, playStyle]);

  // Start session
  const startSession = useCallback(() => {
    setStarted(true);
    setSession({ mode, correct: 0, total: 0, streak: 0, bestStreak: 0, startTime: Date.now(), consecutivePerfect: 0 });
    const q = generateQuestion(mode, stats.level);
    setQuestion(q);
    setSelected(null);
    setShowResult(false);
    setTimeout(() => playQuestion(q), 300);
  }, [mode, stats.level, playQuestion]);

  // Handle answer
  const handleAnswer = useCallback((key: string) => {
    if (showResult || !question) return;
    setSelected(key);
    setShowResult(true);

    const isCorrect = key === question.answer;

    setSession(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      return {
        ...prev,
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
    });

    if (isCorrect) {
      // Calculate XP
      const streakBonus = (session.streak + 1) % 5 === 0 ? XP_STREAK_BONUS : 0;
      const earned = XP_PER_CORRECT + streakBonus;
      setXpGained(earned);

      setStats(prev => {
        let updated = { ...prev };
        updated.totalCorrect += 1;
        updated.totalAttempted += 1;
        updated.streak = prev.streak + 1;
        updated.bestStreak = Math.max(updated.bestStreak, updated.streak);
        updated.xp += earned;

        // Level up check
        const needed = xpForLevel(updated.level);
        if (updated.xp >= needed) {
          updated.xp -= needed;
          updated.level += 1;
          setTimeout(() => setLevelUpMsg(true), 400);
          setTimeout(() => setLevelUpMsg(false), 2500);
        }

        // Check achievements
        const currentSession: SessionState = {
          ...session,
          correct: session.correct + 1,
          total: session.total + 1,
          streak: session.streak + 1,
          bestStreak: Math.max(session.bestStreak, session.streak + 1),
          consecutivePerfect: session.consecutivePerfect,
        };

        for (const ach of ACHIEVEMENTS_DATA) {
          if (!updated.achievements.includes(ach.id) && ach.check(updated, currentSession)) {
            updated.achievements = [...updated.achievements, ach.id];
            setTimeout(() => setNewAchievement(ach), 600);
            setTimeout(() => setNewAchievement(null), 3000);
          }
        }

        return updated;
      });

      // Play correct sound
      try {
        const ctx = getAudioCtx();
        const now = ctx.currentTime;
        playTone(ctx, 880, now, 0.1);
        playTone(ctx, 1108.73, now + 0.1, 0.15);
      } catch { /* ignore */ }
    } else {
      setStats(prev => ({
        ...prev,
        totalAttempted: prev.totalAttempted + 1,
        streak: 0,
      }));

      // Play wrong sound
      try {
        const ctx = getAudioCtx();
        const now = ctx.currentTime;
        playTone(ctx, 200, now, 0.3, 'sawtooth');
      } catch { /* ignore */ }
    }
  }, [showResult, question, session, getAudioCtx]);

  // Next question
  const nextQuestion = useCallback(() => {
    // Check if nudge should be shown (after 3rd round)
    if (session.total >= 2 && !nudgeShownRef.current) {
      nudgeShownRef.current = true;
      if (guardAction()) return;
    }

    const q = generateQuestion(mode, stats.level);
    setQuestion(q);
    setSelected(null);
    setShowResult(false);
    setXpGained(0);
    setTimeout(() => playQuestion(q), 300);
  }, [mode, stats.level, playQuestion, session.total, guardAction]);

  // End session
  const endSession = useCallback(() => {
    if (session.total > 0) {
      const entry: SessionEntry = {
        date: new Date().toISOString().slice(0, 10),
        mode: session.mode,
        correct: session.correct,
        total: session.total,
        accuracy: Math.round((session.correct / session.total) * 100),
        duration: Math.round((Date.now() - session.startTime) / 1000),
      };
      setStats(prev => ({
        ...prev,
        sessionHistory: [entry, ...prev.sessionHistory].slice(0, 50),
      }));
    }
    setStarted(false);
    setQuestion(null);
    setShowResult(false);
    setSelected(null);
  }, [session]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const accuracy = session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0;
  const xpNeeded = xpForLevel(stats.level);
  const xpPercent = Math.min((stats.xp / xpNeeded) * 100, 100);

  return (
    <>
    <RegistrationNudge show={showNudge} onClose={() => setShowNudge(false)} feature="history" />
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: '#e2e8f0',
      fontFamily: sans,
      paddingBottom: 80,
    }}>
      {/* ─── Header ─── */}
      <div style={{
        textAlign: 'center',
        padding: '32px 16px 20px',
      }}>
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          margin: 0,
          background: `linear-gradient(135deg, ${ACCENT}, #38bdf8)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {T.title[lang]}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0', fontFamily: serif }}>
          {T.subtitle[lang]}
        </p>
      </div>

      {/* ─── Level & XP Bar ─── */}
      <div style={{
        maxWidth: 600, margin: '0 auto', padding: '0 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: GOLD }}>
            {T.level[lang]}{stats.level}
          </span>
          <div style={{ flex: 1, height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden', border: '1px solid #334155' }}>
            <div style={{
              width: `${xpPercent}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${GOLD}, #fbbf24)`,
              borderRadius: 4,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{stats.xp}/{xpNeeded} XP</span>
        </div>

        {/* Daily streak */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: '0.8rem', color: '#94a3b8', marginBottom: 16 }}>
          <span>🔥 {T.dailyStreak[lang]}: {stats.dailyStreak}</span>
          <span>🏆 {T.bestStreak[lang]}: {stats.bestStreak}</span>
          <span>🎯 {stats.totalCorrect}/{stats.totalAttempted}</span>
        </div>
      </div>

      {/* ─── Mode Not Started: Mode Selection ─── */}
      {!started && (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>
          {/* Mode Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginBottom: 20,
          }}>
            {(['intervals', 'chords', 'scales', 'melody'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '14px 8px',
                  border: mode === m ? `2px solid ${ACCENT}` : '2px solid #334155',
                  borderRadius: 12,
                  background: mode === m ? `${ACCENT}15` : '#1e293b',
                  color: mode === m ? '#e2e8f0' : '#94a3b8',
                  cursor: 'pointer',
                  fontFamily: sans,
                  fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>
                  {m === 'intervals' ? '↕️' : m === 'chords' ? '🎹' : m === 'scales' ? '🎼' : '🎵'}
                </div>
                {T[m][lang]}
              </button>
            ))}
          </div>

          {/* Mode description */}
          <div style={{
            background: '#1e293b',
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            border: '1px solid #334155',
          }}>
            <ModeDescription mode={mode} lang={lang} level={stats.level} />
          </div>

          {/* Play style selector */}
          {(mode === 'intervals' || mode === 'chords') && (
            <div style={{
              background: '#1e293b',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              border: '1px solid #334155',
            }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 8 }}>{T.playStyle[lang]}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['ascending', 'descending', 'harmonic'] as const).map(ps => (
                  <button
                    key={ps}
                    onClick={() => setPlayStyle(ps)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      border: playStyle === ps ? `2px solid ${ACCENT}` : '1px solid #334155',
                      borderRadius: 8,
                      background: playStyle === ps ? `${ACCENT}20` : 'transparent',
                      color: playStyle === ps ? '#e2e8f0' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontFamily: sans,
                    }}
                  >
                    {T[ps][lang]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={startSession}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              border: 'none',
              background: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`,
              color: '#fff',
              fontFamily: sans,
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
              marginBottom: 20,
            }}
          >
            {T.start[lang]}
          </button>

          {/* Bottom buttons: achievements, history */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={() => setShowAchievements(!showAchievements)} style={bottomBtnStyle(showAchievements)}>
              🏅 {T.achievements[lang]}
            </button>
            <button onClick={() => setShowHistory(!showHistory)} style={bottomBtnStyle(showHistory)}>
              📊 {T.history[lang]}
            </button>
          </div>

          {/* Achievements panel */}
          {showAchievements && (
            <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #334155' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {ACHIEVEMENTS_DATA.map(a => {
                  const unlocked = stats.achievements.includes(a.id);
                  return (
                    <div key={a.id} style={{
                      padding: 12,
                      borderRadius: 10,
                      background: unlocked ? `${GOLD}15` : '#0f172a',
                      border: unlocked ? `1px solid ${GOLD}` : '1px solid #334155',
                      opacity: unlocked ? 1 : 0.5,
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{a.icon}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: unlocked ? GOLD : '#64748b' }}>
                        {a.name[lang]}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>
                        {a.description[lang]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* History panel */}
          {showHistory && (
            <div style={{ background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #334155' }}>
              {stats.sessionHistory.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>{T.noHistory[lang]}</div>
              ) : (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {stats.sessionHistory.slice(0, 20).map((h, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: i < stats.sessionHistory.length - 1 ? '1px solid #334155' : 'none',
                      fontSize: '0.8rem',
                    }}>
                      <span style={{ color: '#94a3b8' }}>{h.date}</span>
                      <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{h.mode}</span>
                      <span style={{ fontWeight: 600, color: h.accuracy >= 80 ? GREEN : h.accuracy >= 50 ? GOLD : RED }}>
                        {h.accuracy}% ({h.correct}/{h.total})
                      </span>
                      <span style={{ color: '#64748b' }}>{Math.floor(h.duration / 60)}:{String(h.duration % 60).padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Quiz Active ─── */}
      {started && question && (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>
          {/* Session bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 16px',
            background: '#1e293b',
            borderRadius: 12,
            marginBottom: 16,
            border: '1px solid #334155',
          }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {T[mode][lang]} · {session.total + (showResult ? 0 : 0)}{T.questionsAnswered[lang]}
            </span>
            <span style={{ fontWeight: 700, color: accuracy >= 80 ? GREEN : accuracy >= 50 ? GOLD : RED }}>
              {accuracy}%
            </span>
            <span style={{ fontSize: '0.85rem' }}>
              {session.streak > 0 && <>🔥 {session.streak}</>}
            </span>
            <button
              onClick={endSession}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid #ef4444',
                background: 'transparent',
                color: '#ef4444',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: sans,
              }}
            >
              ✕
            </button>
          </div>

          {/* Question area */}
          <div style={{
            background: '#1e293b',
            borderRadius: 16,
            padding: 'clamp(20px, 5vw, 32px)',
            marginBottom: 16,
            border: '1px solid #334155',
            textAlign: 'center',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {/* Visual indicator */}
            <div style={{
              width: 80, height: 80,
              borderRadius: '50%',
              background: showResult
                ? (selected === question.answer ? `${GREEN}30` : `${RED}30`)
                : `${ACCENT}20`,
              border: `3px solid ${showResult ? (selected === question.answer ? GREEN : RED) : ACCENT}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: 16,
              transition: 'all 0.3s',
            }}>
              {showResult ? (selected === question.answer ? '✓' : '✗') : (
                mode === 'intervals' ? '↕️' : mode === 'chords' ? '🎹' : mode === 'scales' ? '🎼' : '🎵'
              )}
            </div>

            {/* Replay button */}
            <button
              onClick={() => playQuestion(question)}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: `2px solid ${ACCENT}`,
                background: `${ACCENT}15`,
                color: '#e2e8f0',
                fontFamily: sans,
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 16,
              }}
            >
              🔊 {T.replay[lang]}
            </button>

            {/* Show correct answer if wrong */}
            {showResult && selected !== question.answer && (
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: `${GREEN}15`,
                border: `1px solid ${GREEN}40`,
                fontSize: '0.9rem',
                color: GREEN,
                marginBottom: 12,
              }}>
                → {getAnswerName(mode, question.answer, lang)}
              </div>
            )}

            {/* XP gained */}
            {showResult && selected === question.answer && xpGained > 0 && (
              <div style={{
                fontSize: '0.85rem',
                color: GOLD,
                fontWeight: 700,
                marginBottom: 8,
                animation: 'fadeInUp 0.3s ease',
              }}>
                +{xpGained} XP
              </div>
            )}
          </div>

          {/* Answer options */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: mode === 'melody' ? '1fr' : 'repeat(2, 1fr)',
            gap: 10,
            marginBottom: 16,
          }}>
            {question.options.map((opt, i) => {
              const isCorrectAnswer = opt === question.answer;
              const isSelected = opt === selected;
              let bg = '#1e293b';
              let border = '#334155';
              let color = '#e2e8f0';

              if (showResult) {
                if (isCorrectAnswer) { bg = `${GREEN}20`; border = GREEN; color = GREEN; }
                else if (isSelected) { bg = `${RED}20`; border = RED; color = RED; }
                else { bg = '#0f172a'; color = '#475569'; }
              }

              return (
                <button
                  key={`${opt}-${i}`}
                  onClick={() => handleAnswer(opt)}
                  disabled={showResult}
                  style={{
                    padding: mode === 'melody' ? '14px 16px' : '16px 12px',
                    borderRadius: 12,
                    border: `2px solid ${border}`,
                    background: bg,
                    color,
                    fontFamily: sans,
                    fontSize: mode === 'melody' ? '0.8rem' : 'clamp(0.75rem, 2.5vw, 0.95rem)',
                    fontWeight: 600,
                    cursor: showResult ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    letterSpacing: mode === 'melody' ? '0.1em' : '0',
                  }}
                >
                  {getAnswerName(mode, opt, lang)}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          {showResult && (
            <button
              onClick={nextQuestion}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`,
                color: '#fff',
                fontFamily: sans,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {T.next[lang]} →
            </button>
          )}
        </div>
      )}

      {/* ─── Level Up Toast ─── */}
      {levelUpMsg && (
        <div style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: `3px solid ${GOLD}`,
          borderRadius: 20,
          padding: '32px 48px',
          textAlign: 'center',
          zIndex: 1000,
          animation: 'fadeInUp 0.4s ease',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>⭐</div>
          <div style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 700, color: GOLD }}>
            {T.levelUp[lang]}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', marginTop: 8 }}>
            {T.level[lang]}{stats.level}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 8 }}>
            {T.unlockedNew[lang]}
          </div>
        </div>
      )}

      {/* ─── Achievement Toast ─── */}
      {newAchievement && (
        <div style={{
          position: 'fixed',
          bottom: 80, left: '50%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(135deg, #0f172a, #1e293b)`,
          border: `2px solid ${GOLD}`,
          borderRadius: 16,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          zIndex: 1000,
          animation: 'fadeInUp 0.4s ease',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: '1.8rem' }}>{newAchievement.icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: GOLD, fontSize: '0.9rem' }}>{newAchievement.name[lang]}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{newAchievement.description[lang]}</div>
          </div>
        </div>
      )}

      {/* ─── CSS Animations ─── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
    </>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ModeDescription({ mode, lang, level }: { mode: Mode; lang: Lang; level: number }) {
  const descriptions: Record<Mode, L5> = {
    intervals: {
      ja: '2つの音を聴いて、音程（インターバル）を当てましょう。レベルが上がると、より難しい音程が解禁されます。',
      en: 'Listen to two notes and identify the interval. Higher levels unlock more challenging intervals.',
      ko: '두 음을 듣고 음정을 맞추세요. 레벨이 올라가면 더 어려운 음정이 해금됩니다.',
      pt: 'Ouça duas notas e identifique o intervalo. Níveis mais altos desbloqueiam intervalos mais desafiadores.',
      es: 'Escucha dos notas e identifica el intervalo. Los niveles más altos desbloquean intervalos más difíciles.',
    },
    chords: {
      ja: '和音を聴いて、その種類を当てましょう。メジャー・マイナーから始まり、7th和音やsusコードが解禁されていきます。',
      en: 'Listen to a chord and identify its type. Start with major/minor and unlock 7th chords and sus chords.',
      ko: '화음을 듣고 그 종류를 맞추세요. 장/단에서 시작하여 7th 화음과 sus 코드가 해금됩니다.',
      pt: 'Ouça um acorde e identifique seu tipo. Comece com maior/menor e desbloqueie acordes de 7ª e sus.',
      es: 'Escucha un acorde e identifica su tipo. Comienza con mayor/menor y desbloquea acordes de 7ª y sus.',
    },
    scales: {
      ja: '音階を聴いて、その種類を当てましょう。長音階・自然短音階から始まり、特殊な音階が解禁されます。',
      en: 'Listen to a scale and identify its type. Start with major/natural minor and unlock exotic scales.',
      ko: '음계를 듣고 그 종류를 맞추세요. 장음계/자연단음계에서 시작하여 특수한 음계가 해금됩니다.',
      pt: 'Ouça uma escala e identifique seu tipo. Comece com maior/menor natural e desbloqueie escalas exóticas.',
      es: 'Escucha una escala e identifica su tipo. Comienza con mayor/menor natural y desbloquea escalas exóticas.',
    },
    melody: {
      ja: '短いメロディを聴いて、正しい音の並びを選びましょう。聴音書取の基礎トレーニングです。',
      en: 'Listen to a short melody and choose the correct note sequence. Core dictation training.',
      ko: '짧은 멜로디를 듣고 올바른 음의 배열을 선택하세요. 청음 받아쓰기 기초 훈련입니다.',
      pt: 'Ouça uma melodia curta e escolha a sequência correta. Treinamento fundamental de ditado.',
      es: 'Escucha una melodía corta y elige la secuencia correcta. Entrenamiento fundamental de dictado.',
    },
  };

  const unlocked: Record<Mode, string> = {
    intervals: (() => {
      const avail = getAvailableIntervals(level);
      return avail.map(i => i.name[lang]).join(', ');
    })(),
    chords: (() => {
      const avail = getAvailableChords(level);
      return avail.map(c => c.name[lang]).join(', ');
    })(),
    scales: (() => {
      const avail = getAvailableScales(level);
      return avail.map(s => s.name[lang]).join(', ');
    })(),
    melody: '',
  };

  const unlockedLabel: L5 = {
    ja: '解禁済み',
    en: 'Unlocked',
    ko: '해금됨',
    pt: 'Desbloqueado',
    es: 'Desbloqueado',
  };

  return (
    <>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.6 }}>
        {descriptions[mode][lang]}
      </p>
      {unlocked[mode] && (
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          <span style={{ color: GREEN, fontWeight: 600 }}>✓ {unlockedLabel[lang]}: </span>
          {unlocked[mode]}
        </div>
      )}
    </>
  );
}

function bottomBtnStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '10px',
    borderRadius: 10,
    border: active ? `2px solid ${ACCENT}` : '1px solid #334155',
    background: active ? `${ACCENT}15` : '#1e293b',
    color: active ? '#e2e8f0' : '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
  };
}
