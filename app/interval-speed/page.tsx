'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { RegistrationNudge, useRegistrationNudge } from '@/components/RegistrationNudge';

// ============================================================================
// TYPES
// ============================================================================

type L5 = Record<Lang, string>;
type Difficulty = 'easy' | 'medium' | 'hard';
type Direction = 'ascending' | 'descending' | 'harmonic';

interface IntervalDef {
  semitones: number;
  key: string;
  name: L5;
  abbr: string;
}

interface RoundResult {
  interval: string;
  correct: boolean;
  reactionMs: number;
}

interface GameState {
  difficulty: Difficulty;
  direction: Direction;
  rounds: RoundResult[];
  currentInterval: IntervalDef | null;
  currentNotes: number[];
  questionTime: number;      // timestamp when question was played
  answered: boolean;
  selectedKey: string | null;
  roundCount: number;        // total rounds in this game (20)
  gameOver: boolean;
  score: number;
}

interface BestRecord {
  easy: number;
  medium: number;
  hard: number;
}

interface UserStats {
  totalGames: number;
  totalCorrect: number;
  totalAttempted: number;
  bestRecords: BestRecord;
  avgReaction: number;       // running average reaction time (ms)
  fastestReaction: number;
  dailyStreak: number;
  lastPlayDate: string;
  achievements: string[];
  history: HistoryEntry[];
}

interface HistoryEntry {
  date: string;
  difficulty: Difficulty;
  score: number;
  accuracy: number;
  avgReaction: number;
}

interface Achievement {
  id: string;
  name: L5;
  icon: string;
  description: L5;
  check: (s: UserStats, game: GameState) => boolean;
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

const ROUNDS_PER_GAME = 20;

// Score = base points × speed multiplier
// Speed multiplier: <1s = 3×, <2s = 2×, <3s = 1.5×, <5s = 1×, >5s = 0.5×
function calcScore(correct: boolean, reactionMs: number): number {
  if (!correct) return 0;
  const base = 100;
  const sec = reactionMs / 1000;
  let mult = 0.5;
  if (sec < 1) mult = 3;
  else if (sec < 2) mult = 2;
  else if (sec < 3) mult = 1.5;
  else if (sec < 5) mult = 1;
  return Math.round(base * mult);
}

// ============================================================================
// INTERVAL DEFINITIONS
// ============================================================================

const ALL_INTERVALS: IntervalDef[] = [
  { semitones: 1,  key: 'm2',  abbr: 'm2',  name: { ja: '短2度', en: 'Minor 2nd', ko: '단2도', pt: '2ª menor', es: '2ª menor' } },
  { semitones: 2,  key: 'M2',  abbr: 'M2',  name: { ja: '長2度', en: 'Major 2nd', ko: '장2도', pt: '2ª maior', es: '2ª mayor' } },
  { semitones: 3,  key: 'm3',  abbr: 'm3',  name: { ja: '短3度', en: 'Minor 3rd', ko: '단3도', pt: '3ª menor', es: '3ª menor' } },
  { semitones: 4,  key: 'M3',  abbr: 'M3',  name: { ja: '長3度', en: 'Major 3rd', ko: '장3도', pt: '3ª maior', es: '3ª mayor' } },
  { semitones: 5,  key: 'P4',  abbr: 'P4',  name: { ja: '完全4度', en: 'Perfect 4th', ko: '완전4도', pt: '4ª justa', es: '4ª justa' } },
  { semitones: 6,  key: 'TT',  abbr: 'TT',  name: { ja: '三全音', en: 'Tritone', ko: '삼전음', pt: 'Trítono', es: 'Tritono' } },
  { semitones: 7,  key: 'P5',  abbr: 'P5',  name: { ja: '完全5度', en: 'Perfect 5th', ko: '완전5도', pt: '5ª justa', es: '5ª justa' } },
  { semitones: 8,  key: 'm6',  abbr: 'm6',  name: { ja: '短6度', en: 'Minor 6th', ko: '단6도', pt: '6ª menor', es: '6ª menor' } },
  { semitones: 9,  key: 'M6',  abbr: 'M6',  name: { ja: '長6度', en: 'Major 6th', ko: '장6도', pt: '6ª maior', es: '6ª mayor' } },
  { semitones: 10, key: 'm7',  abbr: 'm7',  name: { ja: '短7度', en: 'Minor 7th', ko: '단7도', pt: '7ª menor', es: '7ª menor' } },
  { semitones: 11, key: 'M7',  abbr: 'M7',  name: { ja: '長7度', en: 'Major 7th', ko: '장7도', pt: '7ª maior', es: '7ª mayor' } },
  { semitones: 12, key: 'P8',  abbr: 'P8',  name: { ja: 'オクターブ', en: 'Octave', ko: '옥타브', pt: 'Oitava', es: 'Octava' } },
];

function getIntervalPool(difficulty: Difficulty): IntervalDef[] {
  switch (difficulty) {
    case 'easy':   return ALL_INTERVALS.filter(i => [3,4,5,7,12].includes(i.semitones)); // m3,M3,P4,P5,P8
    case 'medium': return ALL_INTERVALS.filter(i => [1,2,3,4,5,7,8,9,12].includes(i.semitones)); // +m2,M2,m6,M6
    case 'hard':   return ALL_INTERVALS; // all 12
  }
}

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

const ACHIEVEMENTS_DATA: Achievement[] = [
  { id: 'first-game', icon: '🎮', name: { ja: '初ゲーム', en: 'First Game', ko: '첫 게임', pt: 'Primeiro Jogo', es: 'Primer Juego' }, description: { ja: 'ゲームを1回完了', en: 'Complete your first game', ko: '게임 1회 완료', pt: 'Complete seu primeiro jogo', es: 'Completa tu primer juego' }, check: (s) => s.totalGames >= 1 },
  { id: 'speed-demon', icon: '⚡', name: { ja: 'スピードデーモン', en: 'Speed Demon', ko: '스피드 데몬', pt: 'Demônio da Velocidade', es: 'Demonio de Velocidad' }, description: { ja: '1秒以内に10問正解', en: '10 correct answers under 1 second', ko: '1초 이내에 10문제 정답', pt: '10 respostas corretas em menos de 1 segundo', es: '10 respuestas correctas en menos de 1 segundo' }, check: (_s, g) => g.rounds.filter(r => r.correct && r.reactionMs < 1000).length >= 10 },
  { id: 'perfect-20', icon: '💎', name: { ja: 'パーフェクトゲーム', en: 'Perfect Game', ko: '퍼펙트 게임', pt: 'Jogo Perfeito', es: 'Juego Perfecto' }, description: { ja: '20問全問正解', en: 'All 20 correct in one game', ko: '20문제 전부 정답', pt: 'Todas 20 corretas em um jogo', es: 'Las 20 correctas en un juego' }, check: (_s, g) => g.gameOver && g.rounds.length === 20 && g.rounds.every(r => r.correct) },
  { id: 'score-5000', icon: '🏆', name: { ja: 'スコア5000', en: 'Score 5000', ko: '스코어 5000', pt: 'Pontuação 5000', es: 'Puntuación 5000' }, description: { ja: '1ゲームで5000点以上', en: 'Score 5000+ in one game', ko: '1게임에서 5000점 이상', pt: '5000+ pontos em um jogo', es: '5000+ puntos en un juego' }, check: (_s, g) => g.gameOver && g.score >= 5000 },
  { id: 'daily-3', icon: '📅', name: { ja: '3日連続', en: '3-Day Streak', ko: '3일 연속', pt: '3 Dias Seguidos', es: '3 Días Seguidos' }, description: { ja: '3日連続でプレイ', en: 'Play for 3 consecutive days', ko: '3일 연속 플레이', pt: 'Jogue 3 dias consecutivos', es: 'Juega 3 días consecutivos' }, check: (s) => s.dailyStreak >= 3 },
  { id: 'sub-500ms', icon: '🚀', name: { ja: '超反射', en: 'Lightning Reflexes', ko: '초반사', pt: 'Reflexos Rápidos', es: 'Reflejos Rayo' }, description: { ja: '0.5秒以内に正解', en: 'Correct answer in under 500ms', ko: '0.5초 이내에 정답', pt: 'Resposta correta em menos de 500ms', es: 'Respuesta correcta en menos de 500ms' }, check: (s) => s.fastestReaction > 0 && s.fastestReaction < 500 },
  { id: 'hard-4000', icon: '👑', name: { ja: 'ハードマスター', en: 'Hard Master', ko: '하드 마스터', pt: 'Mestre Difícil', es: 'Maestro Difícil' }, description: { ja: 'ハードで4000点以上', en: '4000+ on Hard mode', ko: '하드에서 4000점 이상', pt: '4000+ no modo Difícil', es: '4000+ en modo Difícil' }, check: (_s, g) => g.gameOver && g.difficulty === 'hard' && g.score >= 4000 },
  { id: 'games-50', icon: '🎖️', name: { ja: '50ゲーム達成', en: '50 Games', ko: '50게임 달성', pt: '50 Jogos', es: '50 Juegos' }, description: { ja: '累計50ゲームプレイ', en: 'Play 50 total games', ko: '누적 50게임 플레이', pt: 'Jogue 50 jogos no total', es: 'Juega 50 juegos en total' }, check: (s) => s.totalGames >= 50 },
];

// ============================================================================
// TRANSLATIONS
// ============================================================================

const T: Record<string, L5> = {
  title: { ja: 'KUON INTERVAL SPEED', en: 'KUON INTERVAL SPEED', ko: 'KUON INTERVAL SPEED', pt: 'KUON INTERVAL SPEED', es: 'KUON INTERVAL SPEED' },
  subtitle: { ja: '音程スピードチャレンジ', en: 'Interval Speed Challenge', ko: '음정 스피드 챌린지', pt: 'Desafio de Velocidade de Intervalos', es: 'Desafío de Velocidad de Intervalos' },
  easy: { ja: 'イージー', en: 'Easy', ko: '이지', pt: 'Fácil', es: 'Fácil' },
  medium: { ja: 'ミディアム', en: 'Medium', ko: '미디엄', pt: 'Médio', es: 'Medio' },
  hard: { ja: 'ハード', en: 'Hard', ko: '하드', pt: 'Difícil', es: 'Difícil' },
  ascending: { ja: '上行', en: 'Ascending', ko: '상행', pt: 'Ascendente', es: 'Ascendente' },
  descending: { ja: '下行', en: 'Descending', ko: '하행', pt: 'Descendente', es: 'Descendente' },
  harmonic: { ja: '同時', en: 'Harmonic', ko: '동시', pt: 'Harmônico', es: 'Armónico' },
  start: { ja: 'スタート', en: 'START', ko: '시작', pt: 'INICIAR', es: 'EMPEZAR' },
  score: { ja: 'スコア', en: 'Score', ko: '스코어', pt: 'Pontuação', es: 'Puntuación' },
  best: { ja: '自己ベスト', en: 'Personal Best', ko: '자기 최고', pt: 'Recorde Pessoal', es: 'Récord Personal' },
  newBest: { ja: '🎉 新記録！', en: '🎉 New Record!', ko: '🎉 신기록!', pt: '🎉 Novo Recorde!', es: '🎉 ¡Nuevo Récord!' },
  round: { ja: 'ラウンド', en: 'Round', ko: '라운드', pt: 'Rodada', es: 'Ronda' },
  correct: { ja: '正解！', en: 'Correct!', ko: '정답!', pt: 'Correto!', es: '¡Correcto!' },
  wrong: { ja: '不正解', en: 'Wrong', ko: '오답', pt: 'Errado', es: 'Incorrecto' },
  gameOver: { ja: 'ゲーム終了', en: 'Game Over', ko: '게임 종료', pt: 'Fim de Jogo', es: 'Fin del Juego' },
  playAgain: { ja: 'もう一度', en: 'Play Again', ko: '다시', pt: 'Jogar Novamente', es: 'Jugar de Nuevo' },
  accuracy: { ja: '正答率', en: 'Accuracy', ko: '정답률', pt: 'Precisão', es: 'Precisión' },
  avgTime: { ja: '平均反応時間', en: 'Avg Reaction', ko: '평균 반응 시간', pt: 'Reação Média', es: 'Reacción Promedio' },
  fastest: { ja: '最速', en: 'Fastest', ko: '최속', pt: 'Mais Rápido', es: 'Más Rápido' },
  achievements: { ja: 'アチーブメント', en: 'Achievements', ko: '업적', pt: 'Conquistas', es: 'Logros' },
  history: { ja: '履歴', en: 'History', ko: '기록', pt: 'Histórico', es: 'Historial' },
  noHistory: { ja: 'まだ履歴がありません', en: 'No history yet', ko: '아직 기록이 없습니다', pt: 'Sem histórico', es: 'Sin historial' },
  dailyStreak: { ja: '連続日数', en: 'Daily Streak', ko: '연속 일수', pt: 'Dias Seguidos', es: 'Días Seguidos' },
  easyDesc: { ja: '5音程 (m3, M3, P4, P5, P8)', en: '5 intervals (m3, M3, P4, P5, P8)', ko: '5음정 (m3, M3, P4, P5, P8)', pt: '5 intervalos', es: '5 intervalos' },
  mediumDesc: { ja: '9音程 (+m2, M2, m6, M6)', en: '9 intervals (+m2, M2, m6, M6)', ko: '9음정 (+m2, M2, m6, M6)', pt: '9 intervalos', es: '9 intervalos' },
  hardDesc: { ja: '全12音程', en: 'All 12 intervals', ko: '전 12음정', pt: 'Todos os 12 intervalos', es: 'Los 12 intervalos' },
  replay: { ja: 'もう一度聴く', en: 'Replay', ko: '다시 듣기', pt: 'Repetir', es: 'Repetir' },
  speedBonus: { ja: 'スピードボーナス', en: 'Speed Bonus', ko: '스피드 보너스', pt: 'Bônus de Velocidade', es: 'Bono de Velocidad' },
  changeDifficulty: { ja: '難易度を変更', en: 'Change Difficulty', ko: '난이도 변경', pt: 'Mudar Dificuldade', es: 'Cambiar Dificultad' },
  quit: { ja: '中断して戻る', en: 'Quit', ko: '중단하고 돌아가기', pt: 'Desistir', es: 'Abandonar' },
};

// ============================================================================
// AUDIO
// ============================================================================

function midiToFreq(m: number): number { return 440 * Math.pow(2, (m - 69) / 12); }

function playTone(ctx: AudioContext, freq: number, start: number, dur: number): void {
  const harmonics = [1, 2, 3, 4];
  const amps = [1, 0.4, 0.15, 0.05];
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.2, start);
  master.gain.exponentialRampToValueAtTime(0.001, start + dur);
  master.connect(ctx.destination);
  harmonics.forEach((h, i) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = freq * h;
    g.gain.setValueAtTime(amps[i] * 0.12, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur * (1 - i * 0.15));
    osc.connect(g); g.connect(master);
    osc.start(start); osc.stop(start + dur);
  });
}

function playInterval(ctx: AudioContext, notes: number[], dir: Direction): void {
  const now = ctx.currentTime + 0.05;
  if (dir === 'harmonic') {
    notes.forEach(n => playTone(ctx, midiToFreq(n), now, 1.2));
  } else {
    const ordered = dir === 'descending' ? [...notes].reverse() : notes;
    ordered.forEach((n, i) => playTone(ctx, midiToFreq(n), now + i * 0.5, 0.8));
  }
}

function playCorrect(ctx: AudioContext): void {
  const now = ctx.currentTime;
  [660, 880].forEach((f, i) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.12, now + i * 0.07);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.15);
    o.connect(g); g.connect(ctx.destination);
    o.start(now + i * 0.07); o.stop(now + 0.3);
  });
}

function playWrong(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = 'sawtooth'; o.frequency.value = 160;
  g.gain.setValueAtTime(0.06, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.3);
}

// ============================================================================
// STORAGE
// ============================================================================

const STORAGE_KEY = 'kuon-interval-speed';

function defaultStats(): UserStats {
  return { totalGames: 0, totalCorrect: 0, totalAttempted: 0, bestRecords: { easy: 0, medium: 0, hard: 0 }, avgReaction: 0, fastestReaction: 0, dailyStreak: 0, lastPlayDate: '', achievements: [], history: [] };
}

function loadStats(): UserStats {
  if (typeof window === 'undefined') return defaultStats();
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return { ...defaultStats(), ...JSON.parse(r) }; } catch {} return defaultStats();
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
// HELPERS
// ============================================================================

function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function speedLabel(ms: number, lang: Lang): string {
  const sec = ms / 1000;
  if (sec < 1) return { ja: '⚡ 超速', en: '⚡ Lightning', ko: '⚡ 초속', pt: '⚡ Relâmpago', es: '⚡ Relámpago' }[lang];
  if (sec < 2) return { ja: '🔥 速い', en: '🔥 Fast', ko: '🔥 빠름', pt: '🔥 Rápido', es: '🔥 Rápido' }[lang];
  if (sec < 3) return { ja: '👍 良い', en: '👍 Good', ko: '👍 좋음', pt: '👍 Bom', es: '👍 Bien' }[lang];
  return { ja: '🐢 ゆっくり', en: '🐢 Slow', ko: '🐢 느림', pt: '🐢 Lento', es: '🐢 Lento' }[lang];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function IntervalSpeedPage() {
  const { lang } = useLang();
  const { guardAction, showNudge, setShowNudge } = useRegistrationNudge();
  const nudgeShownRef = useRef(false);

  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [direction, setDirection] = useState<Direction>('ascending');
  const [showAchievements, setShowAchievements] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [roundScore, setRoundScore] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => { const s = loadStats(); setStats(updateDailyStreak(s)); setStatsLoaded(true); }, []);
  useEffect(() => { if (statsLoaded) saveStats(stats); }, [stats, statsLoaded]);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  // Generate next question
  const nextRound = useCallback((g: GameState): GameState => {
    // Check if nudge should be shown (after 3rd round)
    if (g.rounds.length >= 2 && !nudgeShownRef.current) {
      nudgeShownRef.current = true;
      if (guardAction()) {
        return g; // Return unchanged state if nudge was shown
      }
    }

    const pool = getIntervalPool(g.difficulty);
    const interval = pool[randInt(0, pool.length - 1)];
    const root = randInt(48, 72);
    const notes = [root, root + interval.semitones];
    return { ...g, currentInterval: interval, currentNotes: notes, questionTime: Date.now(), answered: false, selectedKey: null };
  }, [guardAction, nudgeShownRef]);

  const startGame = useCallback(() => {
    const g: GameState = {
      difficulty, direction,
      rounds: [], currentInterval: null, currentNotes: [],
      questionTime: 0, answered: false, selectedKey: null,
      roundCount: ROUNDS_PER_GAME, gameOver: false, score: 0,
    };
    const first = nextRound(g);
    setGame(first);
    setIsNewBest(false);
    setRoundScore(0);
    setTimeout(() => {
      try { playInterval(getCtx(), first.currentNotes, first.direction); } catch {}
    }, 400);
  }, [difficulty, direction, nextRound, getCtx]);

  const handleAnswer = useCallback((key: string) => {
    if (!game || game.answered || game.gameOver) return;
    const reactionMs = Date.now() - game.questionTime;
    const correct = key === game.currentInterval!.key;
    const pts = calcScore(correct, reactionMs);
    setRoundScore(pts);

    try { correct ? playCorrect(getCtx()) : playWrong(getCtx()); } catch {}

    const result: RoundResult = { interval: game.currentInterval!.key, correct, reactionMs };
    const newRounds = [...game.rounds, result];
    const newScore = game.score + pts;
    const isLast = newRounds.length >= game.roundCount;

    const updated: GameState = {
      ...game,
      rounds: newRounds,
      score: newScore,
      answered: true,
      selectedKey: key,
      gameOver: isLast,
    };
    setGame(updated);

    if (isLast) {
      // Game over — update stats
      const correctCount = newRounds.filter(r => r.correct).length;
      const reactionTimes = newRounds.filter(r => r.correct).map(r => r.reactionMs);
      const avgR = reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0;
      const fastR = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0;

      setStats(prev => {
        let u = { ...prev };
        u.totalGames += 1;
        u.totalCorrect += correctCount;
        u.totalAttempted += newRounds.length;
        u.avgReaction = avgR;
        if (fastR > 0 && (u.fastestReaction === 0 || fastR < u.fastestReaction)) u.fastestReaction = fastR;

        // Best record
        const br = { ...u.bestRecords };
        if (newScore > br[difficulty]) {
          br[difficulty] = newScore;
          u.bestRecords = br;
          setIsNewBest(true);
        }

        // History
        u.history = [{
          date: new Date().toISOString().slice(0, 10),
          difficulty, score: newScore,
          accuracy: Math.round((correctCount / newRounds.length) * 100),
          avgReaction: avgR,
        }, ...u.history].slice(0, 50);

        // Achievements
        for (const a of ACHIEVEMENTS_DATA) {
          if (!u.achievements.includes(a.id) && a.check(u, updated)) {
            u.achievements = [...u.achievements, a.id];
            setTimeout(() => setNewAchievement(a), 500);
            setTimeout(() => setNewAchievement(null), 3000);
          }
        }
        return u;
      });
    } else {
      // Auto-advance after 1.2s
      setTimeout(() => {
        setGame(prev => {
          if (!prev) return null;
          const n = nextRound(prev);
          setTimeout(() => {
            try { playInterval(getCtx(), n.currentNotes, n.direction); } catch {}
          }, 200);
          return n;
        });
        setRoundScore(0);
      }, 1200);
    }
  }, [game, getCtx, nextRound, difficulty]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 16,
    padding: 'clamp(16px, 4vw, 24px)',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  const pool = getIntervalPool(difficulty);
  const currentBest = stats.bestRecords[difficulty];

  return (
    <>
    <RegistrationNudge show={showNudge} onClose={() => setShowNudge(false)} feature="history" />
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: sans, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '28px 16px 12px' }}>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 700, letterSpacing: '0.06em', margin: 0, color: '#0f172a' }}>
          {T.title[lang]}
        </h1>
        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0', fontFamily: serif }}>{T.subtitle[lang]}</p>
      </div>

      {/* Stats bar */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: '0.75rem', color: '#94a3b8', marginBottom: 16 }}>
          <span>🔥 {stats.dailyStreak}{lang === 'ja' ? '日' : lang === 'ko' ? '일' : 'd'}</span>
          <span>🏆 {T.best[lang]}: {currentBest}</span>
          <span>⚡ {stats.fastestReaction > 0 ? formatMs(stats.fastestReaction) : '—'}</span>
        </div>
      </div>

      {/* ═══ NOT PLAYING ═══ */}
      {!game && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
          {/* Difficulty */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                padding: '14px 8px', borderRadius: 14,
                border: difficulty === d ? `2px solid ${d === 'easy' ? GREEN : d === 'medium' ? GOLD : RED}` : '1px solid #e2e8f0',
                background: difficulty === d ? `${d === 'easy' ? GREEN : d === 'medium' ? GOLD : RED}08` : '#fff',
                color: difficulty === d ? '#0f172a' : '#94a3b8',
                cursor: 'pointer', fontFamily: sans, fontSize: '0.82rem', fontWeight: 600,
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 2 }}>
                  {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'}
                </div>
                {T[d][lang]}
                <div style={{ fontSize: '0.6rem', fontWeight: 400, marginTop: 2, color: '#94a3b8' }}>
                  {T[`${d}Desc`][lang]}
                </div>
              </button>
            ))}
          </div>

          {/* Direction */}
          <div style={{ ...card, padding: '12px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['ascending', 'descending', 'harmonic'] as Direction[]).map(dir => (
                <button key={dir} onClick={() => setDirection(dir)} style={{
                  flex: 1, padding: '8px', borderRadius: 10,
                  border: direction === dir ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
                  background: direction === dir ? `${ACCENT}08` : '#fff',
                  color: direction === dir ? '#0f172a' : '#94a3b8',
                  cursor: 'pointer', fontSize: '0.78rem', fontFamily: sans, fontWeight: 500,
                }}>
                  {T[dir][lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Score to beat */}
          {currentBest > 0 && (
            <div style={{ ...card, textAlign: 'center', marginBottom: 14, padding: '14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{T.best[lang]}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: GOLD }}>{currentBest}</div>
            </div>
          )}

          {/* Start */}
          <button onClick={startGame} style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg, ${PURPLE}, #a855f7)`, color: '#fff',
            fontFamily: sans, fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer',
            letterSpacing: '0.1em', marginBottom: 20,
            boxShadow: `0 4px 16px ${PURPLE}30`,
          }}>
            {T.start[lang]}
          </button>

          {/* Achievement & history */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={() => { setShowAchievements(!showAchievements); setShowHistory(false); }} style={pillStyle(showAchievements)}>
              🏅 {T.achievements[lang]}
            </button>
            <button onClick={() => { setShowHistory(!showHistory); setShowAchievements(false); }} style={pillStyle(showHistory)}>
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
                      <div style={{ fontSize: '1.2rem' }}>{a.icon}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: ok ? GOLD : '#94a3b8', marginTop: 2 }}>{a.name[lang]}</div>
                      <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: 1 }}>{a.description[lang]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {showHistory && (
            <div style={{ ...card, marginBottom: 16 }}>
              {stats.history.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>{T.noHistory[lang]}</div>
              ) : (
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {stats.history.slice(0, 20).map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.76rem' }}>
                      <span style={{ color: '#64748b' }}>{h.date}</span>
                      <span style={{ textTransform: 'capitalize', color: '#94a3b8', fontSize: '0.68rem' }}>{h.difficulty}</span>
                      <span style={{ fontWeight: 700, color: PURPLE }}>{h.score}</span>
                      <span style={{ color: h.accuracy >= 80 ? GREEN : h.accuracy >= 50 ? GOLD : RED }}>{h.accuracy}%</span>
                      <span style={{ color: '#94a3b8' }}>{formatMs(h.avgReaction)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ PLAYING ═══ */}
      {game && !game.gameOver && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
          {/* Quit / back button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
            <button onClick={() => setGame(null)} style={{
              padding: '5px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#fff', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer',
              fontFamily: sans, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              ← {T.changeDifficulty[lang]}
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              {game.rounds.length}/{game.roundCount}
            </span>
            <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${(game.rounds.length / game.roundCount) * 100}%`, height: '100%', background: `linear-gradient(90deg, ${PURPLE}, #a855f7)`, borderRadius: 3, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontWeight: 700, color: PURPLE, fontSize: '0.9rem' }}>{game.score}</span>
          </div>

          {/* Question card */}
          <div style={{
            ...card, textAlign: 'center', marginBottom: 14, minHeight: 160,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          }}>
            {/* Result flash */}
            {game.answered && (
              <div style={{ marginBottom: 10 }}>
                <div style={{
                  fontSize: '1.1rem', fontWeight: 700,
                  color: game.selectedKey === game.currentInterval!.key ? GREEN : RED,
                }}>
                  {game.selectedKey === game.currentInterval!.key ? T.correct[lang] : T.wrong[lang]}
                </div>
                {game.selectedKey !== game.currentInterval!.key && (
                  <div style={{ fontSize: '0.82rem', color: GREEN, marginTop: 4 }}>
                    → {game.currentInterval!.name[lang]}
                  </div>
                )}
                {game.selectedKey === game.currentInterval!.key && (
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                    {formatMs(game.rounds[game.rounds.length - 1].reactionMs)} · {speedLabel(game.rounds[game.rounds.length - 1].reactionMs, lang)} · +{roundScore}
                  </div>
                )}
              </div>
            )}

            {!game.answered && (
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `${PURPLE}10`, border: `2px solid ${PURPLE}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', marginBottom: 10,
              }}>↕️</div>
            )}

            {/* Replay */}
            <button onClick={() => { try { playInterval(getCtx(), game.currentNotes, game.direction); } catch {} }} style={{
              padding: '7px 18px', borderRadius: 8, border: `1px solid ${ACCENT}40`,
              background: `${ACCENT}06`, color: ACCENT, fontSize: '0.8rem', cursor: 'pointer', fontFamily: sans,
            }}>
              🔊 {T.replay[lang]}
            </button>
          </div>

          {/* Answer buttons — compact grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: pool.length <= 6 ? `repeat(${Math.min(pool.length, 3)}, 1fr)` : 'repeat(4, 1fr)',
            gap: 6, marginBottom: 14,
          }}>
            {pool.map(iv => {
              let bg = '#fff', border = '#e2e8f0', color = '#1e293b';
              if (game.answered) {
                if (iv.key === game.currentInterval!.key) { bg = `${GREEN}10`; border = GREEN; color = GREEN; }
                else if (iv.key === game.selectedKey) { bg = `${RED}08`; border = RED; color = RED; }
                else { bg = '#f8fafc'; color = '#cbd5e1'; }
              }
              return (
                <button key={iv.key} onClick={() => handleAnswer(iv.key)} disabled={game.answered} style={{
                  padding: '12px 6px', borderRadius: 12,
                  border: `1.5px solid ${border}`, background: bg, color,
                  fontFamily: sans, fontSize: 'clamp(0.68rem, 2vw, 0.82rem)', fontWeight: 600,
                  cursor: game.answered ? 'default' : 'pointer',
                  transition: 'all 0.15s', textAlign: 'center',
                  boxShadow: !game.answered ? '0 1px 2px rgba(0,0,0,0.03)' : 'none',
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: 1 }}>{iv.abbr}</div>
                  {iv.name[lang]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ GAME OVER ═══ */}
      {game && game.gameOver && (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ ...card, textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: serif, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              {T.gameOver[lang]}
            </div>

            {isNewBest && (
              <div style={{ fontSize: '1rem', fontWeight: 700, color: GOLD, marginBottom: 8 }}>{T.newBest[lang]}</div>
            )}

            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: PURPLE, marginBottom: 16 }}>
              {game.score}
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {(() => {
                const correctRounds = game.rounds.filter(r => r.correct);
                const acc = Math.round((correctRounds.length / game.rounds.length) * 100);
                const avg = correctRounds.length > 0 ? Math.round(correctRounds.reduce((a, r) => a + r.reactionMs, 0) / correctRounds.length) : 0;
                const fastest = correctRounds.length > 0 ? Math.min(...correctRounds.map(r => r.reactionMs)) : 0;
                return [
                  { label: T.accuracy[lang], value: `${acc}%`, color: acc >= 80 ? GREEN : acc >= 50 ? GOLD : RED },
                  { label: T.avgTime[lang], value: avg > 0 ? formatMs(avg) : '—', color: ACCENT },
                  { label: T.fastest[lang], value: fastest > 0 ? formatMs(fastest) : '—', color: PURPLE },
                ];
              })().map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{s.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Round history mini */}
            <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              {game.rounds.map((r, i) => (
                <div key={i} style={{
                  width: 20, height: 20, borderRadius: 4,
                  background: r.correct ? `${GREEN}20` : `${RED}15`,
                  border: `1px solid ${r.correct ? GREEN : RED}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5rem', fontWeight: 700,
                  color: r.correct ? GREEN : RED,
                }}>
                  {r.correct ? '✓' : '✗'}
                </div>
              ))}
            </div>

            <button onClick={() => { setGame(null); startGame(); }} style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${PURPLE}, #a855f7)`, color: '#fff',
              fontFamily: sans, fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 4px 16px ${PURPLE}30`, marginBottom: 8,
            }}>
              {T.playAgain[lang]}
            </button>
            <button onClick={() => setGame(null)} style={{
              width: '100%', padding: '12px', borderRadius: 14,
              border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b',
              fontFamily: sans, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
            }}>
              ← {T.changeDifficulty[lang]}
            </button>
          </div>
        </div>
      )}

      {/* Achievement toast */}
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
    </>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '9px', borderRadius: 10,
    border: active ? '1.5px solid #8b5cf6' : '1px solid #e2e8f0',
    background: active ? '#8b5cf608' : '#fff', color: active ? '#0f172a' : '#94a3b8',
    cursor: 'pointer', fontSize: '0.78rem',
    fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 500,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  };
}
