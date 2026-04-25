'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { AuthGate } from '@/components/AuthGate';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Temperament = 'equal' | 'just' | 'pythagorean';
type Instrument = 'c' | 'bb' | 'eb' | 'f' | 'a';
type L5 = Partial<Record<Lang, string>> & { en: string };

interface SessionStats {
  duration: number;
  inTuneCount: number;
  totalNotes: number;
  bestStreak: number;
  sessionNotes: Note[];
}

interface Note {
  name: string;
  octave: number;
  frequency: number;
  cents: number;
  timestamp: number;
}

interface Achievement {
  id: string;
  name: L5;
  description: L5;
  unlocked: boolean;
  unlockedAt?: number;
}

interface SessionHistory {
  date: string;
  duration: number;
  accuracy: number;
  bestStreak: number;
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

// Note frequencies for A4 = 440Hz
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BASE_FREQUENCY = 440; // A4
const BASE_NOTE_INDEX = 57; // C-1 to A4 is 57 semitones

// Transposition semitones
const TRANSPOSITION_MAP: Record<Instrument, number> = {
  c: 0,    // Concert Pitch
  bb: -2,  // Bb instruments (down 2 semitones)
  eb: -3,  // Eb instruments (down 3 semitones)
  f: 5,    // F instruments (up 5 semitones)
  a: -3,   // A instruments (down 3 semitones)
};

// YIN algorithm threshold
const YIN_THRESHOLD = 0.1;

// ============================================================================
// TRANSLATIONS
// ============================================================================

const T: Record<string, Partial<Record<Lang, string>> & { en: string }> = {
  title: { ja: 'KUON TUNER PRO', en: 'KUON TUNER PRO', ko: 'KUON TUNER PRO', pt: 'KUON TUNER PRO', es: 'KUON TUNER PRO' },
  subtitle: { ja: '高精度クロマチックチューナー', en: 'High-Precision Chromatic Tuner', ko: '고정밀 색음 튜너', pt: 'Afinador Cromático de Alta Precisão', es: 'Afinador Cromático de Alta Precisión' },
  startMic: { ja: 'マイクを起動', en: 'Start Microphone', ko: '마이크 시작', pt: 'Iniciar Microfone', es: 'Iniciar Micrófono' },
  stopMic: { ja: 'マイクを停止', en: 'Stop Microphone', ko: '마이크 중지', pt: 'Parar Microfone', es: 'Detener Micrófono' },
  waitingForSound: { ja: '音を入力してください...', en: 'Waiting for sound...', ko: '소리를 입력하세요...', pt: 'Aguardando som...', es: 'Esperando sonido...' },
  perfect: { ja: '完璧！', en: 'PERFECT!', ko: '완벽!', pt: 'PERFEITO!', es: '¡PERFECTO!' },
  hz: { ja: 'Hz', en: 'Hz', ko: 'Hz', pt: 'Hz', es: 'Hz' },
  cents: { ja: '¢', en: '¢', ko: '¢', pt: '¢', es: '¢' },
  streak: { ja: 'コンボ', en: 'Streak', ko: '연계', pt: 'Sequência', es: 'Racha' },
  sessionStats: { ja: 'セッション統計', en: 'Session Stats', ko: '세션 통계', pt: 'Estatísticas da Sessão', es: 'Estadísticas de Sesión' },
  accuracy: { ja: '精度', en: 'Accuracy', ko: '정확성', pt: 'Precisão', es: 'Precisión' },
  avgDeviation: { ja: '平均偏差', en: 'Avg Deviation', ko: '평균 편차', pt: 'Desvio Médio', es: 'Desviación Promedio' },
  bestStreak: { ja: '最高コンボ', en: 'Best Streak', ko: '최고 연계', pt: 'Melhor Sequência', es: 'Mejor Racha' },
  duration: { ja: '演奏時間', en: 'Duration', ko: '연주 시간', pt: 'Duração', es: 'Duración' },
  achievements: { ja: 'アチーブメント', en: 'Achievements', ko: '업적', pt: 'Conquistas', es: 'Logros' },
  settings: { ja: '設定', en: 'Settings', ko: '설정', pt: 'Configurações', es: 'Configuración' },
  referenceA: { ja: '基準周波数（A4）', en: 'Reference Pitch (A4)', ko: '기준 음정 (A4)', pt: 'Tom de Referência (A4)', es: 'Tono de Referencia (A4)' },
  instrument: { ja: '楽器', en: 'Instrument', ko: '악기', pt: 'Instrumento', es: 'Instrumento' },
  temperament: { ja: 'テンペラメント', en: 'Temperament', ko: '음률', pt: 'Temperamento', es: 'Temperamento' },
  playReference: { ja: '基準音を再生', en: 'Play Reference', ko: '기준음 재생', pt: 'Reproduzir Tom de Referência', es: 'Reproducir Tono de Referencia' },
  concertPitch: { ja: 'Concert Pitch (C)', en: 'Concert Pitch (C)', ko: 'Concert Pitch (C)', pt: 'Tom de Concerto (C)', es: 'Tono de Concierto (C)' },
  bbInstrument: { ja: 'Bb楽器', en: 'Bb Instruments', ko: 'Bb 악기', pt: 'Instrumentos Bb', es: 'Instrumentos Bb' },
  ebInstrument: { ja: 'Eb楽器', en: 'Eb Instruments', ko: 'Eb 악기', pt: 'Instrumentos Eb', es: 'Instrumentos Eb' },
  fInstrument: { ja: 'F楽器', en: 'F Instruments', ko: 'F 악기', pt: 'Instrumentos F', es: 'Instrumentos F' },
  aInstrument: { ja: 'A楽器', en: 'A Instruments', ko: 'A 악기', pt: 'Instrumentos A', es: 'Instrumentos A' },
  equal: { ja: '平均律', en: 'Equal', ko: '평균율', pt: 'Igual', es: 'Igual' },
  just: { ja: 'Just Intonation', en: 'Just Intonation', ko: 'Just Intonation', pt: 'Just Intonation', es: 'Just Intonation' },
  pythagorean: { ja: 'ピタゴラス音律', en: 'Pythagorean', ko: 'Pythagorean', pt: 'Pitagórico', es: 'Pitagórico' },
  standard440: { ja: '440 Hz', en: '440 Hz', ko: '440 Hz', pt: '440 Hz', es: '440 Hz' },
  orchestral442: { ja: '442 Hz (Orchestra)', en: '442 Hz (Orchestra)', ko: '442 Hz (Orchestra)', pt: '442 Hz (Orchestra)', es: '442 Hz (Orchestra)' },
  baroque415: { ja: '415 Hz (Baroque)', en: '415 Hz (Baroque)', ko: '415 Hz (Baroque)', pt: '415 Hz (Baroque)', es: '415 Hz (Baroque)' },
  noteHistory: { ja: '音階履歴', en: 'Note History', ko: '음계 이력', pt: 'Histórico de Notas', es: 'Historial de Notas' },
  pastSessions: { ja: '過去のセッション', en: 'Past Sessions', ko: '과거 세션', pt: 'Sessões Anteriores', es: 'Sesiones Anteriores' },
  beatYourRecord: { ja: '記録を更新しよう！', en: 'Beat your record!', ko: '기록을 깨보세요!', pt: 'Quebre seu recorde!', es: '¡Bate tu récord!' },
};

const ACHIEVEMENTS_DATA: Achievement[] = [
  {
    id: 'first-perfect',
    name: { ja: '最初の完璧な音', en: 'First Perfect Note', ko: '첫 번째 완벽한 음', pt: 'Primeira Nota Perfeita', es: 'Primera Nota Perfecta' },
    description: { ja: '±1セント以内で初めて音を出す', en: 'Play your first note within ±1 cent', ko: '±1세트 이내에서 처음 음을 낼 때', pt: 'Toque sua primeira nota dentro de ±1 cent', es: 'Toca tu primera nota dentro de ±1 cent' },
    unlocked: false,
  },
  {
    id: 'streak-10',
    name: { ja: '10コンボ達成', en: '10 Streak', ko: '10 연계 달성', pt: '10 Sequências', es: '10 Racha' },
    description: { ja: '10個の連続した正確な音を演奏', en: '10 consecutive in-tune notes', ko: '10개의 연속된 정확한 음을 연주', pt: '10 notas afinadas consecutivas', es: '10 notas afinadas consecutivas' },
    unlocked: false,
  },
  {
    id: 'streak-25',
    name: { ja: '25コンボ達成', en: '25 Streak', ko: '25 연계 달성', pt: '25 Sequências', es: '25 Racha' },
    description: { ja: '25個の連続した正確な音を演奏', en: '25 consecutive in-tune notes', ko: '25개의 연속된 정확한 음을 연주', pt: '25 notas afinadas consecutivas', es: '25 notas afinadas consecutivas' },
    unlocked: false,
  },
  {
    id: 'accuracy-90',
    name: { ja: '90%精度', en: 'Pitch Master', ko: '90% 정확성', pt: '90% Precisão', es: '90% Precisión' },
    description: { ja: 'セッション中に90%以上の精度を達成', en: '90%+ accuracy in a session', ko: '세션 중 90% 이상의 정확성 달성', pt: '90%+ precisão em uma sessão', es: '90%+ precisión en una sesión' },
    unlocked: false,
  },
  {
    id: 'minute-perfection',
    name: { ja: '1分の完璧さ', en: 'Minute of Perfection', ko: '1분의 완벽함', pt: 'Minuto de Perfeição', es: 'Minuto de Perfección' },
    description: { ja: '60秒間、±3セント以内を維持', en: '60 seconds within ±3 cents', ko: '60초 동안 ±3세트 이내 유지', pt: '60 segundos dentro de ±3 cents', es: '60 segundos dentro de ±3 cents' },
    unlocked: false,
  },
  {
    id: 'daily-devotion',
    name: { ja: '毎日の習慣', en: 'Daily Devotion', ko: '일일 헌신', pt: 'Dedicação Diária', es: 'Dedicación Diaria' },
    description: { ja: '7日間連続でチューナーを使用', en: 'Use tuner for 7 consecutive days', ko: '7일 연속 튜너 사용', pt: '7 dias consecutivos usando o tuner', es: '7 días consecutivos usando el afinador' },
    unlocked: false,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function frequencyToNote(freq: number, refA4: number): { name: string; octave: number; cents: number } {
  const A4_CENTS = 69 * 100;
  const noteFreqCents = 12 * 100 * Math.log2(freq / refA4) + A4_CENTS;
  const noteIndex = Math.round(noteFreqCents / 100);
  const noteNameIndex = ((noteIndex - 12) % 12 + 12) % 12;
  const octave = Math.floor((noteIndex - 12) / 12);
  const cents = Math.round((noteFreqCents / 100 - noteIndex) * 100);

  return {
    name: NOTE_NAMES[noteNameIndex],
    octave,
    cents,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function detectPitchYIN(buffer: any, sampleRate: number): number | null {
  const bufLen = buffer.length;
  if (bufLen < 200) return null;

  // Check if there's enough signal (avoid processing silence)
  let rms = 0;
  for (let i = 0; i < bufLen; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / bufLen);
  if (rms < 0.005) return null; // Too quiet — skip

  // Limit maxLag: min detectable frequency = sampleRate / maxLag
  // maxLag = sampleRate / 50 gives us 50Hz minimum (enough for bass instruments)
  const maxLag = Math.min(Math.floor(sampleRate / 50), Math.floor(bufLen / 2));
  const difference = new Float32Array(maxLag);

  // Step 1: Compute difference function
  for (let lag = 1; lag < maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < maxLag; i++) {
      const delta = buffer[i] - buffer[i + lag];
      sum += delta * delta;
    }
    difference[lag] = sum;
  }

  // Step 2: Cumulative mean normalized difference
  let cumulativeSum = 0;
  difference[0] = 1;
  for (let lag = 1; lag < maxLag; lag++) {
    cumulativeSum += difference[lag];
    difference[lag] = difference[lag] * lag / (cumulativeSum || 1);
  }

  // Step 3: Find first lag below threshold (absolute threshold)
  let foundLag = -1;
  for (let lag = 2; lag < maxLag; lag++) {
    if (difference[lag] < YIN_THRESHOLD) {
      // Find the minimum in this dip
      while (lag + 1 < maxLag && difference[lag + 1] < difference[lag]) {
        lag++;
      }
      foundLag = lag;
      break;
    }
  }

  if (foundLag === -1) return null;

  // Step 4: Parabolic interpolation for sub-sample accuracy
  const lag = foundLag;
  const x0 = lag > 0 ? difference[lag - 1] : difference[lag];
  const x1 = difference[lag];
  const x2 = lag < maxLag - 1 ? difference[lag + 1] : difference[lag];

  const denom = 2 * (2 * x1 - x2 - x0);
  const shift = denom !== 0 ? (x0 - x2) / denom : 0;
  const adjustedLag = lag + shift;

  if (adjustedLag <= 0) return null;
  return sampleRate / adjustedLag;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TunerPage() {
  const { lang } = useLang();
  const t = (key: string) => T[key]?.[lang] ?? T[key]?.['en'] ?? key;

  // State
  const [isListening, setIsListening] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    duration: 0,
    inTuneCount: 0,
    totalNotes: 0,
    bestStreak: 0,
    sessionNotes: [],
  });
  const [refA4, setRefA4] = useState(442);
  const [instrument, setInstrument] = useState<Instrument>('c');
  const [temperament, setTemperament] = useState<Temperament>('equal');
  const [showSettings, setShowSettings] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS_DATA);
  const [noteHistory, setNoteHistory] = useState<Note[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [lastUnlockedAchievement, setLastUnlockedAchievement] = useState<string | null>(null);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataArrayRef = useRef<any>(null);
  const sessionStartRef = useRef<number | null>(null);
  const lastNoteTimeRef = useRef<number>(0);
  const lastPerfectTimeRef = useRef<number>(0);
  const isListeningRef = useRef(false);

  // Load localStorage data on mount
  useEffect(() => {
    const savedAchievements = localStorage.getItem('kuon-tuner-achievements');
    const savedSessionHistory = localStorage.getItem('kuon-tuner-history');

    if (savedAchievements) {
      try {
        setAchievements(JSON.parse(savedAchievements));
      } catch (e) {
        // Fallback to default
      }
    }

    if (savedSessionHistory) {
      try {
        setSessionHistory(JSON.parse(savedSessionHistory));
      } catch (e) {
        // Fallback to default
      }
    }
  }, []);

  // Save achievements to localStorage when they change
  useEffect(() => {
    localStorage.setItem('kuon-tuner-achievements', JSON.stringify(achievements));
  }, [achievements]);

  // Save session history to localStorage
  useEffect(() => {
    localStorage.setItem('kuon-tuner-history', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  // Check for achievements
  const checkAchievements = useCallback((notes: Note[], streak: number, stats: SessionStats) => {
    const newAchievements = [...achievements];
    let newUnlocked: string | null = null;

    // First Perfect Note (±1 cent)
    if (!achievements.find(a => a.id === 'first-perfect')?.unlocked && notes.some(n => Math.abs(n.cents) <= 1)) {
      const idx = newAchievements.findIndex(a => a.id === 'first-perfect');
      if (idx !== -1) {
        newAchievements[idx] = { ...newAchievements[idx], unlocked: true, unlockedAt: Date.now() };
        newUnlocked = 'first-perfect';
      }
    }

    // 10 Streak
    if (!achievements.find(a => a.id === 'streak-10')?.unlocked && streak >= 10) {
      const idx = newAchievements.findIndex(a => a.id === 'streak-10');
      if (idx !== -1) {
        newAchievements[idx] = { ...newAchievements[idx], unlocked: true, unlockedAt: Date.now() };
        newUnlocked = 'streak-10';
      }
    }

    // 25 Streak
    if (!achievements.find(a => a.id === 'streak-25')?.unlocked && streak >= 25) {
      const idx = newAchievements.findIndex(a => a.id === 'streak-25');
      if (idx !== -1) {
        newAchievements[idx] = { ...newAchievements[idx], unlocked: true, unlockedAt: Date.now() };
        newUnlocked = 'streak-25';
      }
    }

    // 90% Accuracy
    if (!achievements.find(a => a.id === 'accuracy-90')?.unlocked && stats.totalNotes > 0) {
      const accuracy = (stats.inTuneCount / stats.totalNotes) * 100;
      if (accuracy >= 90) {
        const idx = newAchievements.findIndex(a => a.id === 'accuracy-90');
        if (idx !== -1) {
          newAchievements[idx] = { ...newAchievements[idx], unlocked: true, unlockedAt: Date.now() };
          newUnlocked = 'accuracy-90';
        }
      }
    }

    // Minute of Perfection (60 seconds within ±3 cents)
    if (!achievements.find(a => a.id === 'minute-perfection')?.unlocked && lastPerfectTimeRef.current > 0) {
      if (Date.now() - lastPerfectTimeRef.current > 60000) {
        const idx = newAchievements.findIndex(a => a.id === 'minute-perfection');
        if (idx !== -1) {
          newAchievements[idx] = { ...newAchievements[idx], unlocked: true, unlockedAt: Date.now() };
          newUnlocked = 'minute-perfection';
        }
      }
    }

    if (newUnlocked) {
      setLastUnlockedAchievement(newUnlocked);
      setTimeout(() => setLastUnlockedAchievement(null), 3000);
    }

    if (JSON.stringify(newAchievements) !== JSON.stringify(achievements)) {
      setAchievements(newAchievements);
    }
  }, [achievements]);

  // Refs for latest values (avoids stale closure in rAF loop)
  const refA4Ref = useRef(refA4);
  const instrumentRef = useRef(instrument);
  useEffect(() => { refA4Ref.current = refA4; }, [refA4]);
  useEffect(() => { instrumentRef.current = instrument; }, [instrument]);

  // Pitch detection loop — uses refs to avoid stale closure issues
  const detectPitch = useCallback(() => {
    if (!isListeningRef.current) return;
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getFloatTimeDomainData(dataArrayRef.current);

    const sampleRate = audioContextRef.current?.sampleRate ?? 44100;
    const detectedFreq = detectPitchYIN(dataArrayRef.current, sampleRate);

    if (detectedFreq && detectedFreq > 50 && detectedFreq < 2000) {
      const now = Date.now();
      if (now - lastNoteTimeRef.current > 80) {
        lastNoteTimeRef.current = now;

        const currentRefA4 = refA4Ref.current;
        const transpositionSemitones = TRANSPOSITION_MAP[instrumentRef.current];
        const transposedFreq = detectedFreq * Math.pow(2, transpositionSemitones / 12);
        const noteInfo = frequencyToNote(transposedFreq, currentRefA4);

        const note: Note = {
          name: noteInfo.name,
          octave: noteInfo.octave,
          frequency: detectedFreq,
          cents: noteInfo.cents,
          timestamp: now,
        };

        setCurrentNote(note);

        setSessionStats(prev => {
          const newStats = {
            ...prev,
            totalNotes: prev.totalNotes + 1,
            sessionNotes: [...prev.sessionNotes, note],
          };

          const inTune = Math.abs(noteInfo.cents) <= 5;
          if (inTune) {
            newStats.inTuneCount += 1;
            setCurrentStreak(s => {
              const newStreak = s + 1;
              newStats.bestStreak = Math.max(newStats.bestStreak, newStreak);
              return newStreak;
            });

            if (Math.abs(noteInfo.cents) <= 3) {
              if (lastPerfectTimeRef.current === 0) {
                lastPerfectTimeRef.current = now;
              }
            }
          } else {
            setCurrentStreak(0);
            lastPerfectTimeRef.current = 0;
          }

          checkAchievements(newStats.sessionNotes, newStats.bestStreak, newStats);
          return newStats;
        });

        setNoteHistory(prev => {
          const recent = prev.filter(n => now - n.timestamp < 30000);
          return [...recent, note];
        });
      }
    }

    // Schedule next frame — uses ref, not state
    if (isListeningRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectPitch);
    }
  }, [checkAchievements]);

  // Start microphone
  const startMicrophone = useCallback(async () => {
    // Pre-flight: getUserMedia requires a secure context. Fail fast with a clear message.
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = lang === 'ja'
        ? 'このブラウザはマイク入力に対応していません。最新のChrome / Safari / Firefox でHTTPS接続からアクセスしてください。'
        : 'This browser does not support microphone input. Please use a recent Chrome / Safari / Firefox over HTTPS.';
      alert(msg);
      return;
    }

    try {
      // NOTE: use "ideal" (not strict booleans) so browsers/devices that cannot
      // disable AEC/NS/AGC (common on iOS Safari and many Android devices) still
      // return a stream instead of throwing OverconstrainedError. The raw signal
      // is still preferred when available; YIN is robust to mild processing.
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: { ideal: false },
            noiseSuppression: { ideal: false },
            autoGainControl: { ideal: false },
          },
        });
      } catch (primaryErr) {
        // Last-resort fallback: plain { audio: true }. Some very old / locked-down
        // devices reject even advanced-optional constraints.
        console.warn('[tuner] advanced constraints failed, falling back to { audio: true }:', primaryErr);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      streamRef.current = stream;

      // Close previous context if it exists (e.g., from reference tone)
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      const audioContext = audioContextRef.current;

      // iOS Safari + Chrome autoplay policy: AudioContext often starts in 'suspended'
      // even when created inside a user gesture. Explicitly resume so the analyser
      // actually receives audio frames.
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch (resumeErr) {
          console.warn('[tuner] AudioContext.resume() failed:', resumeErr);
        }
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;

      source.connect(analyser);
      analyserRef.current = analyser;
      dataArrayRef.current = new Float32Array(analyser.fftSize);

      sessionStartRef.current = Date.now();
      lastNoteTimeRef.current = 0;
      lastPerfectTimeRef.current = 0;

      // Set ref BEFORE state so the rAF loop starts immediately
      isListeningRef.current = true;
      setIsListening(true);
      setSessionStats({
        duration: 0,
        inTuneCount: 0,
        totalNotes: 0,
        bestStreak: 0,
        sessionNotes: [],
      });
      setCurrentStreak(0);
      setCurrentNote(null);
      setNoteHistory([]);

      // Kick off the detection loop
      animationFrameRef.current = requestAnimationFrame(detectPitch);
    } catch (err) {
      // Differentiate error types so users get actionable feedback instead of a
      // generic "access denied" that hides hardware / constraint problems.
      const e = err as { name?: string; message?: string };
      console.error('[tuner] getUserMedia failed:', e?.name, e?.message, err);

      let msg: string;
      if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') {
        msg = lang === 'ja'
          ? 'マイクへのアクセスが許可されませんでした。ブラウザのアドレスバー左のサイト設定からマイクを許可してください。'
          : 'Microphone permission was denied. Please allow microphone access in your browser site settings.';
      } else if (e?.name === 'NotFoundError' || e?.name === 'OverconstrainedError') {
        msg = lang === 'ja'
          ? '利用可能なマイクが見つかりませんでした。マイクが接続されているか確認してください。'
          : 'No usable microphone found. Please check that a microphone is connected.';
      } else if (e?.name === 'NotReadableError') {
        msg = lang === 'ja'
          ? 'マイクは他のアプリで使用中です。他のアプリ（Zoom等）を終了してから再度お試しください。'
          : 'The microphone is in use by another application. Please close other apps (Zoom etc.) and retry.';
      } else {
        msg = lang === 'ja'
          ? `マイクの起動に失敗しました: ${e?.name ?? 'UnknownError'}`
          : `Failed to start microphone: ${e?.name ?? 'UnknownError'}`;
      }
      alert(msg);
    }
  }, [detectPitch, lang]);

  // Stop microphone
  const stopMicrophone = useCallback(() => {
    // Stop the rAF loop immediately via ref
    isListeningRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;

    setIsListening(false);

    // Save session to history
    if (sessionStartRef.current) {
      const duration = Date.now() - sessionStartRef.current;
      const accuracy = sessionStats.totalNotes > 0 ? (sessionStats.inTuneCount / sessionStats.totalNotes) * 100 : 0;

      const historyEntry: SessionHistory = {
        date: new Date().toISOString().split('T')[0],
        duration: Math.floor(duration / 1000),
        accuracy: Math.round(accuracy),
        bestStreak: sessionStats.bestStreak,
      };

      setSessionHistory(prev => [...prev, historyEntry]);
      sessionStartRef.current = null;
    }
  }, [sessionStats]);

  // Update session duration
  useEffect(() => {
    if (!isListening) return;

    const interval = setInterval(() => {
      if (sessionStartRef.current) {
        const duration = Date.now() - sessionStartRef.current;
        setSessionStats(prev => ({ ...prev, duration }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  // Play reference tone (uses a separate AudioContext so it doesn't interfere with mic)
  const playReferenceTone = useCallback(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = refA4;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2);

    // Clean up after playback
    osc.onended = () => ctx.close();
  }, [refA4]);

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 60000) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Accuracy percentage
  const accuracy = sessionStats.totalNotes > 0 ? (sessionStats.inTuneCount / sessionStats.totalNotes) * 100 : 0;

  // Average deviation
  const avgDeviation = sessionStats.sessionNotes.length > 0
    ? (sessionStats.sessionNotes.reduce((sum, n) => sum + Math.abs(n.cents), 0) / sessionStats.sessionNotes.length).toFixed(1)
    : '0.0';

  // Cents deviation styling
  const centsValue = currentNote?.cents ?? 0;
  const isInTune = Math.abs(centsValue) <= 5;
  const isPerfect = Math.abs(centsValue) <= 2;

  return (
    <AuthGate appName="tuner">
    <div style={{
      fontFamily: sans,
      backgroundColor: '#0a0a0a',
      backgroundImage: 'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)',
      minHeight: '100vh',
      color: '#e5e5e5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 'clamp(16px, 5%, 32px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '900px',
        marginBottom: 'clamp(24px, 5%, 48px)',
      }}>
        <div>
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 'bold',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            {t('title')}
          </h1>
          <p style={{
            fontSize: 'clamp(12px, 2vw, 14px)',
            color: '#a0a0a0',
            margin: '4px 0 0 0',
          }}>
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: 'transparent',
            border: `2px solid ${ACCENT}`,
            color: ACCENT,
            width: 'clamp(44px, 10%, 56px)',
            height: 'clamp(44px, 10%, 56px)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.backgroundColor = ACCENT;
            (e.target as HTMLElement).style.color = '#0a0a0a';
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.backgroundColor = 'transparent';
            (e.target as HTMLElement).style.color = ACCENT;
          }}
        >
          ⚙️
        </button>
      </div>

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div style={{
          width: '100%',
          maxWidth: '900px',
          marginBottom: '32px',
          padding: 'clamp(16px, 4%, 24px)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: `1px solid rgba(${ACCENT.match(/\d+/g)?.join(', ')} , 0.2)`,
          animation: 'slideDown 0.3s ease-out',
        }}>
          {/* REFERENCE PITCH */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              {t('referenceA')}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              gap: '8px',
              marginBottom: '12px',
            }}>
              {[415, 440, 441, 442, 443, 466].map(freq => (
                <button
                  key={freq}
                  onClick={() => setRefA4(freq)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: refA4 === freq ? ACCENT : 'rgba(255, 255, 255, 0.1)',
                    color: refA4 === freq ? '#0a0a0a' : '#e5e5e5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (refA4 !== freq) (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={e => {
                    if (refA4 !== freq) (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  {freq}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="400"
              max="500"
              value={refA4}
              onChange={e => setRefA4(parseInt(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: `linear-gradient(to right, ${ACCENT}, ${ACCENT})`,
                outline: 'none',
              }}
            />
            <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '8px 0 0 0' }}>
              {refA4} Hz
            </p>
          </div>

          {/* INSTRUMENT */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              {t('instrument')}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '8px',
            }}>
              {[
                { key: 'c' as Instrument, label: t('concertPitch') },
                { key: 'bb' as Instrument, label: t('bbInstrument') },
                { key: 'eb' as Instrument, label: t('ebInstrument') },
                { key: 'f' as Instrument, label: t('fInstrument') },
                { key: 'a' as Instrument, label: t('aInstrument') },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setInstrument(key)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: instrument === key ? ACCENT : 'rgba(255, 255, 255, 0.1)',
                    color: instrument === key ? '#0a0a0a' : '#e5e5e5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (instrument !== key) (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={e => {
                    if (instrument !== key) (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* TEMPERAMENT */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              {t('temperament')}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '8px',
            }}>
              {[
                { key: 'equal' as Temperament, label: t('equal') },
                { key: 'just' as Temperament, label: t('just') },
                { key: 'pythagorean' as Temperament, label: t('pythagorean') },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTemperament(key)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: temperament === key ? ACCENT : 'rgba(255, 255, 255, 0.1)',
                    color: temperament === key ? '#0a0a0a' : '#e5e5e5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (temperament !== key) (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={e => {
                    if (temperament !== key) (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* PLAY REFERENCE */}
          <button
            onClick={playReferenceTone}
            style={{
              width: '100%',
              padding: 'clamp(8px, 2%, 12px)',
              backgroundColor: ACCENT,
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 'clamp(12px, 2vw, 14px)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.opacity = '0.8';
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.opacity = '1';
            }}
          >
            🔊 {t('playReference')}
          </button>
        </div>
      )}

      {/* MAIN GAUGE */}
      <div style={{
        width: 'clamp(200px, 80vw, 400px)',
        height: 'clamp(200px, 80vw, 400px)',
        position: 'relative',
        marginBottom: 'clamp(24px, 5%, 40px)',
        animation: isListening ? 'pulse-ready 2s ease-in-out infinite' : 'none',
      }}>
        {/* Gauge circle */}
        <svg
          viewBox="0 0 400 400"
          style={{
            width: '100%',
            height: '100%',
            filter: isInTune && currentNote ? 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))' : 'drop-shadow(0 0 10px rgba(2, 132, 199, 0.3))',
            transition: 'filter 0.2s',
          }}
        >
          {/* Background circle */}
          <circle cx="200" cy="200" r="180" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2" />

          {/* Tuning zones */}
          <defs>
            <linearGradient id="perfGrad" x1="0%" y1="0%" x2="100%">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.2)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0.1)" />
            </linearGradient>
          </defs>

          {/* Perfect zone (-2 to +2) */}
          <path
            d="M 200 20 A 180 180 0 0 1 208 20.08"
            fill="none"
            stroke="rgba(34, 197, 94, 0.3)"
            strokeWidth="8"
            opacity="0.5"
          />

          {/* Acceptable zone (-5 to +5) */}
          <path
            d="M 200 20 A 180 180 0 0 1 223 21.5"
            fill="none"
            stroke="rgba(234, 179, 8, 0.2)"
            strokeWidth="6"
            opacity="0.3"
          />

          {/* Needle base */}
          <circle cx="200" cy="200" r="12" fill={isPerfect ? '#22c55e' : isInTune ? '#eab308' : '#ef4444'} />

          {/* Needle */}
          {currentNote && (
            <g transform={`rotate(${(centsValue / 50) * 90} 200 200)`}>
              <line
                x1="200"
                y1="200"
                x2="200"
                y2="60"
                stroke={isPerfect ? '#22c55e' : isInTune ? '#eab308' : '#ef4444'}
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.9"
                style={{
                  transition: 'stroke 0.1s, opacity 0.1s',
                }}
              />
            </g>
          )}

          {/* Center indicator */}
          <line x1="200" y1="80" x2="200" y2="100" stroke="#0284c7" strokeWidth="2" />
          <circle cx="200" cy="200" r="8" fill="#0a0a0a" stroke="#0284c7" strokeWidth="2" />
        </svg>

        {/* Center text overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          {isPerfect && (
            <div style={{
              fontFamily: serif,
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 'bold',
              color: '#22c55e',
              animation: 'pulse-perfect 0.6s ease-out',
              marginBottom: '8px',
            }}>
              {t('perfect')}
            </div>
          )}
          <div style={{
            fontFamily: serif,
            fontSize: 'clamp(48px, 12vw, 80px)',
            fontWeight: 'bold',
            color: currentNote ? '#e5e5e5' : '#707070',
            letterSpacing: '-0.05em',
          }}>
            {currentNote ? `${currentNote.name}${currentNote.octave}` : '—'}
          </div>
          <div style={{
            fontSize: 'clamp(12px, 3vw, 16px)',
            color: '#a0a0a0',
            marginTop: '4px',
          }}>
            {currentNote ? `${currentNote.frequency.toFixed(1)} ${t('hz')}` : t('waitingForSound')}
          </div>
          {currentNote && (
            <div style={{
              fontSize: 'clamp(14px, 3vw, 18px)',
              color: isPerfect ? '#22c55e' : isInTune ? '#eab308' : '#ef4444',
              marginTop: '8px',
              fontWeight: 'bold',
              fontFamily: sans,
            }}>
              {centsValue > 0 ? '+' : ''}{centsValue}{t('cents')}
            </div>
          )}
        </div>
      </div>

      {/* MICROPHONE BUTTON */}
      <button
        onClick={isListening ? stopMicrophone : startMicrophone}
        style={{
          padding: 'clamp(12px, 3%, 16px) clamp(24px, 5%, 32px)',
          fontSize: 'clamp(14px, 2.5vw, 18px)',
          fontWeight: 'bold',
          backgroundColor: isListening ? '#ef4444' : ACCENT,
          color: '#0a0a0a',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: 'clamp(24px, 5%, 40px)',
          transition: 'all 0.2s',
          boxShadow: isListening ? '0 0 20px rgba(239, 68, 68, 0.5)' : `0 0 20px rgba(2, 132, 199, 0.3)`,
        }}
        onMouseEnter={e => {
          (e.target as HTMLElement).style.transform = 'scale(1.05)';
        }}
        onMouseLeave={e => {
          (e.target as HTMLElement).style.transform = 'scale(1)';
        }}
      >
        {isListening ? '⏹️ ' : '🎤 '}{isListening ? t('stopMic') : t('startMic')}
      </button>

      {/* STREAK DISPLAY */}
      {currentStreak > 0 && (
        <div style={{
          fontSize: 'clamp(20px, 4vw, 32px)',
          fontWeight: 'bold',
          color: '#ef9f0f',
          marginBottom: '16px',
          animation: 'pulse-streak 0.5s ease-out',
          textShadow: '0 0 10px rgba(239, 159, 15, 0.5)',
        }}>
          🔥 {currentStreak}
        </div>
      )}

      {/* NOTE HISTORY STRIP */}
      {noteHistory.length > 0 && (
        <div style={{
          width: '100%',
          maxWidth: '900px',
          padding: 'clamp(12px, 3%, 16px)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          marginBottom: 'clamp(20px, 4%, 32px)',
          overflowX: 'auto',
          display: 'flex',
          gap: '4px',
          scrollBehavior: 'smooth',
        }}>
          {noteHistory.map((n, i) => {
            const isInTuneN = Math.abs(n.cents) <= 5;
            const isPerfectN = Math.abs(n.cents) <= 2;
            const color = isPerfectN ? '#22c55e' : isInTuneN ? '#eab308' : '#ef4444';
            return (
              <div
                key={i}
                style={{
                  minWidth: '12px',
                  height: '40px',
                  backgroundColor: color,
                  borderRadius: '2px',
                  opacity: 0.8,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title={`${n.name}${n.octave} (${n.cents > 0 ? '+' : ''}${n.cents}¢)`}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.opacity = '1';
                  (e.target as HTMLElement).style.transform = 'scaleY(1.2)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.opacity = '0.8';
                  (e.target as HTMLElement).style.transform = 'scaleY(1)';
                }}
              />
            );
          })}
        </div>
      )}

      {/* SESSION STATS */}
      {isListening && sessionStats.totalNotes > 0 && (
        <div style={{
          width: '100%',
          maxWidth: '900px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'clamp(12px, 3%, 16px)',
          marginBottom: 'clamp(20px, 4%, 32px)',
        }}>
          <div style={{
            padding: 'clamp(12px, 3%, 16px)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>{t('accuracy')}</div>
            <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 'bold', color: '#22c55e' }}>
              {accuracy.toFixed(0)}%
            </div>
          </div>
          <div style={{
            padding: 'clamp(12px, 3%, 16px)',
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>{t('avgDeviation')}</div>
            <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 'bold', color: '#eab308' }}>
              {avgDeviation}{t('cents')}
            </div>
          </div>
          <div style={{
            padding: 'clamp(12px, 3%, 16px)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>{t('bestStreak')}</div>
            <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 'bold', color: '#ef4444' }}>
              {sessionStats.bestStreak}
            </div>
          </div>
          <div style={{
            padding: 'clamp(12px, 3%, 16px)',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(2, 132, 199, 0.3)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '4px' }}>{t('duration')}</div>
            <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 'bold', color: ACCENT }}>
              {formatTime(sessionStats.duration)}
            </div>
          </div>
        </div>
      )}

      {/* ACHIEVEMENT BADGES */}
      {achievements.some(a => a.unlocked) && (
        <div style={{
          width: '100%',
          maxWidth: '900px',
          marginBottom: 'clamp(20px, 4%, 32px)',
        }}>
          <h3 style={{
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: '#a0a0a0',
          }}>
            {t('achievements')}
          </h3>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            {achievements.map(ach => (
              <div
                key={ach.id}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: ach.unlocked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: ach.unlocked ? '2px solid #22c55e' : '2px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: ach.unlocked ? 1 : 0.4,
                  animation: lastUnlockedAchievement === ach.id ? 'bounce 0.6s ease-out' : 'none',
                }}
                title={ach.name[lang]}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.transform = 'scale(1.1)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.transform = 'scale(1)';
                }}
              >
                {ach.unlocked ? '✨' : '🔒'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        @keyframes pulse-ready {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes pulse-perfect {
          0% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-streak {
          0% { transform: scale(0.8); }
          100% { transform: scale(1); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        input[type="range"] {
          cursor: pointer;
          accent-color: ${ACCENT};
        }
      `}</style>
    </div>
    </AuthGate>
  );
}
