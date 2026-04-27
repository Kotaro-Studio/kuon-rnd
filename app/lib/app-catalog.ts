// ============================================================
// APP_CATALOG — マスターデータ
// ============================================================
//
// 空音開発の全アプリのメタデータを一元管理。
// /audio-apps と /mypage の両方で再利用される。
//
// 設計思想:
//   - LP (href) と launch URL (launchHref) を分離
//     例: separator は LP=/separator-lp、実アプリ=/separator
//   - カテゴリ × プラン × クォータ × バッジで自由に絞り込める
//   - FREE_NO_LOGIN_APPS (pricing-display.ts) と整合
//
// 2026-04-26 初版
// ============================================================

import type { Lang } from '../../context/LangContext';
import type { PlanTier } from './pricing-display';

type L = Partial<Record<Lang, string>> & { en: string };

export type AppCategory =
  | 'learning'    // 🎓 学習・練習系 (毎日の楽器練習)
  | 'composition' // 🎼 作曲・理論系 (和声・対位法・移調)
  | 'recording'   // 🎛 録音・編集系 (マイク特典・ノイズ除去等)
  | 'production'  // 🎚 制作・スタジオ系 (コンピング・マルチトラック・スタジオ機能)
  | 'analysis'    // 🔬 分析・プロ系 (マスター・DDP・DSD)
  | 'sharing'     // 🌍 共有・コミュニティ系
  | 'mental'      // 🧘 メンタル・本番準備 (呼吸・チェックリスト・周波数)
  | 'ai';         // 🤖 AI 処理系 (Pro 限定)

export type Badge = 'NEW' | 'PRO' | 'BETA' | 'COMING_SOON' | 'POPULAR' | 'MIC_OWNER';

export type MinPlan = 'free' | 'free-with-login' | 'prelude' | 'concerto' | 'symphony' | 'opus';

export interface CatalogApp {
  id: string;
  name: L;
  tagline: L;
  href: string;
  launchHref: string;
  emoji: string;
  category: AppCategory;
  noLogin: boolean;
  serverApp: boolean;
  quotaKey: 'separator' | 'transcribe' | 'intonation' | null;
  badges: Badge[];
  minPlan: MinPlan;
}

export const APP_CATALOG: CatalogApp[] = [
  // ============================================================
  // 🎓 学習・練習系
  // ============================================================
  {
    id: 'tuner',
    name: { ja: 'TUNER', en: 'TUNER', es: 'TUNER' },
    tagline: { ja: '高精度クロマチックチューナー', en: 'High-precision chromatic tuner', es: 'Afinador cromático de alta precisión' },
    href: '/tuner-lp',
    launchHref: '/tuner',
    emoji: '🎯',
    category: 'learning',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'metronome',
    name: { ja: 'METRONOME', en: 'METRONOME', es: 'METRONOME' },
    tagline: { ja: 'プロ仕様メトロノーム', en: 'Professional metronome', es: 'Metrónomo profesional' },
    href: '/metronome-lp',
    launchHref: '/metronome',
    emoji: '🎵',
    category: 'learning',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'ear-training',
    name: { ja: 'EAR TRAINING', en: 'EAR TRAINING', es: 'EAR TRAINING' },
    tagline: { ja: '音程・和音の聴音訓練', en: 'Interval & chord ear training', es: 'Entrenamiento auditivo' },
    href: '/ear-training-lp',
    launchHref: '/ear-training',
    emoji: '👂',
    category: 'learning',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: ['POPULAR'],
    minPlan: 'free',
  },
  {
    id: 'chord-quiz',
    name: { ja: 'CHORD QUIZ', en: 'CHORD QUIZ', es: 'CHORD QUIZ' },
    tagline: { ja: '和音認識クイズ', en: 'Chord recognition quiz', es: 'Quiz de acordes' },
    href: '/chord-quiz-lp',
    launchHref: '/chord-quiz',
    emoji: '🎼',
    category: 'learning',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free',
  },
  {
    id: 'sight-reading',
    name: { ja: 'SIGHT READING', en: 'SIGHT READING', es: 'SIGHT READING' },
    tagline: { ja: '初見視奏トレーニング', en: 'Sight-reading practice', es: 'Lectura a primera vista' },
    href: '/sight-reading-lp',
    launchHref: '/sight-reading',
    emoji: '📖',
    category: 'learning',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free',
  },
  {
    id: 'interval-speed',
    name: { ja: 'INTERVAL SPEED', en: 'INTERVAL SPEED', es: 'INTERVAL SPEED' },
    tagline: { ja: '音程速読トレーニング', en: 'Speed interval drill', es: 'Velocidad de intervalos' },
    href: '/interval-speed-lp',
    launchHref: '/interval-speed',
    emoji: '⚡',
    category: 'learning',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },

  // ============================================================
  // 🎼 作曲・理論系
  // ============================================================
  {
    id: 'harmony',
    name: { ja: 'HARMONY', en: 'HARMONY', es: 'HARMONY' },
    tagline: { ja: '和声学トレーナー', en: 'Harmony trainer', es: 'Entrenador de armonía' },
    href: '/harmony-lp',
    launchHref: '/harmony',
    emoji: '🎻',
    category: 'composition',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'counterpoint',
    name: { ja: 'COUNTERPOINT', en: 'COUNTERPOINT', es: 'COUNTERPOINT' },
    tagline: { ja: '対位法トレーナー', en: 'Counterpoint trainer', es: 'Entrenador de contrapunto' },
    href: '/counterpoint-lp',
    launchHref: '/counterpoint',
    emoji: '🎶',
    category: 'composition',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'transposer',
    name: { ja: 'TRANSPOSER', en: 'TRANSPOSER', es: 'TRANSPOSER' },
    tagline: { ja: '楽譜・コード移調', en: 'Score & chord transposer', es: 'Transpositor de partituras' },
    href: '/transposer-lp',
    launchHref: '/transposer',
    emoji: '🔄',
    category: 'composition',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'slowdown',
    name: { ja: 'SLOWDOWN', en: 'SLOWDOWN', es: 'SLOWDOWN' },
    tagline: { ja: 'ピッチ維持テンポ変更', en: 'Tempo change without pitch shift', es: 'Cambio de tempo sin alterar tono' },
    href: '/slowdown-lp',
    launchHref: '/slowdown',
    emoji: '🐢',
    category: 'composition',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: ['POPULAR'],
    minPlan: 'free',
  },

  // ============================================================
  // 🎛 録音・編集系
  // ============================================================
  {
    id: 'normalize',
    name: { ja: 'NORMALIZE', en: 'NORMALIZE', es: 'NORMALIZE' },
    tagline: { ja: 'マイク購入者特典・ラウドネス調整', en: 'Mic owner perk · loudness normalization', es: 'Beneficio para dueños de micro' },
    href: '/normalize-lp',
    launchHref: '/normalize',
    emoji: '🎚',
    category: 'recording',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: ['MIC_OWNER'],
    minPlan: 'free',
  },
  {
    id: 'declipper',
    name: { ja: 'DECLIPPER', en: 'DECLIPPER', es: 'DECLIPPER' },
    tagline: { ja: 'クリップ修復', en: 'Audio clip repair', es: 'Reparación de clipping' },
    href: '/declipper',
    launchHref: '/declipper',
    emoji: '🩹',
    category: 'recording',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'noise-reduction',
    name: { ja: 'NOISE REDUCTION', en: 'NOISE REDUCTION', es: 'NOISE REDUCTION' },
    tagline: { ja: 'ノイズ除去', en: 'Noise reduction', es: 'Reducción de ruido' },
    href: '/noise-reduction',
    launchHref: '/noise-reduction',
    emoji: '🔇',
    category: 'recording',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'dual-mono',
    name: { ja: 'DUAL MONO', en: 'DUAL MONO', es: 'DUAL MONO' },
    tagline: { ja: 'デュアルモノ変換', en: 'Dual-mono conversion', es: 'Conversión dual-mono' },
    href: '/dual-mono',
    launchHref: '/dual-mono',
    emoji: '🎙',
    category: 'recording',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'piano-declipper',
    name: { ja: 'PIANO DECLIPPER', en: 'PIANO DECLIPPER', es: 'PIANO DECLIPPER' },
    tagline: { ja: 'ピアノ録音特化リペア', en: 'Piano recording specialized repair', es: 'Reparación piano específica' },
    href: '/piano-declipper',
    launchHref: '/piano-declipper',
    emoji: '🎹',
    category: 'recording',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'revox',
    name: { ja: 'REVOX', en: 'REVOX', es: 'REVOX' },
    tagline: { ja: 'ボーカル整音', en: 'Vocal cleanup', es: 'Limpieza vocal' },
    href: '/revox',
    launchHref: '/revox',
    emoji: '🎤',
    category: 'recording',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },

  // ============================================================
  // 🔬 分析・プロ系
  // ============================================================
  {
    id: 'master-check',
    name: { ja: 'MASTER CHECK', en: 'MASTER CHECK', es: 'MASTER CHECK' },
    tagline: { ja: 'プラットフォーム別ラウドネス検証', en: 'Platform loudness verification', es: 'Verificación de loudness' },
    href: '/master-check-lp',
    launchHref: '/master-check',
    emoji: '✅',
    category: 'analysis',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: ['POPULAR'],
    minPlan: 'free',
  },
  {
    id: 'ddp-checker',
    name: { ja: 'DDP CHECKER', en: 'DDP CHECKER', es: 'DDP CHECKER' },
    tagline: { ja: 'CD マスターの DDP 検証', en: 'CD master DDP verification', es: 'Verificación DDP de CD' },
    href: '/ddp-checker-lp',
    launchHref: '/ddp-checker',
    emoji: '💿',
    category: 'analysis',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free',
  },
  {
    id: 'dsd',
    name: { ja: 'DSD CONVERTER', en: 'DSD CONVERTER', es: 'DSD CONVERTER' },
    tagline: { ja: '世界初ブラウザ DSD プレーヤー', en: 'World-first browser DSD player', es: 'Primer reproductor DSD del navegador' },
    href: '/dsd-lp',
    launchHref: '/dsd',
    emoji: '🎧',
    category: 'analysis',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: ['POPULAR'],
    minPlan: 'free',
  },
  {
    id: 'analyzer',
    name: { ja: 'ANALYZER', en: 'ANALYZER', es: 'ANALYZER' },
    tagline: { ja: 'スペクトラム解析', en: 'Spectrum analyzer', es: 'Analizador de espectro' },
    href: '/analyzer-lp',
    launchHref: '/analyzer',
    emoji: '📊',
    category: 'analysis',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'resampler',
    name: { ja: 'RESAMPLER', en: 'RESAMPLER', es: 'RESAMPLER' },
    tagline: { ja: '高精度サンプルレート変換', en: 'High-quality resampler', es: 'Conversor de tasa de muestreo' },
    href: '/resampler-lp',
    launchHref: '/resampler',
    emoji: '🎯',
    category: 'analysis',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'converter',
    name: { ja: 'CONVERTER', en: 'CONVERTER', es: 'CONVERTER' },
    tagline: { ja: 'WAV/MP3/FLAC 形式変換', en: 'WAV/MP3/FLAC converter', es: 'Conversor de formato' },
    href: '/converter',
    launchHref: '/converter',
    emoji: '🔁',
    category: 'analysis',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free',
  },
  {
    id: 'analog-tools',
    name: { ja: 'ANALOG TOOLS', en: 'ANALOG TOOLS', es: 'ANALOG TOOLS' },
    tagline: { ja: 'アナログ機器計算機 5 種', en: 'Analog gear calculators (5 tools)', es: '5 calculadoras analógicas' },
    href: '/analog-tools',
    launchHref: '/analog-tools',
    emoji: '📻',
    category: 'analysis',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free',
  },

  // ============================================================
  // 🌍 共有・コミュニティ系
  // ============================================================
  {
    id: 'player',
    name: { ja: 'KUON PLAYER', en: 'KUON PLAYER', es: 'KUON PLAYER' },
    tagline: { ja: '24 時間で消える MP3 共有', en: '24-hour disposable MP3 sharing', es: 'Compartir MP3 que expira en 24 horas' },
    href: '/player-lp',
    launchHref: '/player/upload',
    emoji: '🔗',
    category: 'sharing',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'soundmap',
    name: { ja: '地球音マップ', en: 'Sound Map', es: 'Mapa de Sonidos' },
    tagline: { ja: '世界中の音風景を探索', en: 'Explore soundscapes worldwide', es: 'Explora paisajes sonoros' },
    href: '/soundmap',
    launchHref: '/soundmap',
    emoji: '🌍',
    category: 'sharing',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free-with-login',
  },
  {
    id: 'events',
    name: { ja: 'ライブ情報', en: "Today's Live", es: 'Eventos en Vivo' },
    tagline: { ja: '近くのコンサート発見', en: 'Find concerts near you', es: 'Encuentra conciertos cercanos' },
    href: '/events-lp',
    launchHref: '/events',
    emoji: '🎪',
    category: 'sharing',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free',
  },
  {
    id: 'gallery',
    name: { ja: 'GALLERY', en: 'GALLERY', es: 'GALLERY' },
    tagline: { ja: 'P-86S オーナーの録音集', en: 'P-86S owners recordings', es: 'Grabaciones P-86S' },
    href: '/gallery',
    launchHref: '/gallery',
    emoji: '🖼',
    category: 'sharing',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: [],
    minPlan: 'free',
  },

  // ============================================================
  // 🎚 制作・スタジオ系 (2026-04-26 追加)
  // ============================================================
  {
    id: 'daw',
    name: { ja: 'DAW', en: 'DAW', es: 'DAW' },
    tagline: { ja: 'マルチトラック録音 + 編集 + マスタリング', en: 'Multi-track recorder + editor + mastering', es: 'Multipista + editor + masterización' },
    href: '/daw-lp',
    launchHref: '/daw',
    emoji: '🎚',
    category: 'production',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: ['NEW'],
    minPlan: 'free-with-login',
  },
  {
    id: 'comping',
    name: { ja: 'COMPING', en: 'COMPING', es: 'COMPING' },
    tagline: { ja: 'マルチテイク録音 + ベスト合成', en: 'Multi-take recording + best take comping', es: 'Grabación multitoma + comping' },
    href: '/comping-lp',
    launchHref: '/comping',
    emoji: '🎙',
    category: 'production',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: ['NEW'],
    minPlan: 'free-with-login',
  },
  // 2026-04-26 開発保留: DRUM MACHINE
  //   理由: 28 パターンが専門家 transcribe 不在の近似版だったため公開前に保留。
  //   URL (/drum, /drum-lp) は残存・直リンクで動作。サイト導線からは完全除外。
  //   再開時はオーナー (ボサノバ・ジャズ専門) 監修でパターン再構築の後カタログに復帰。
  // {
  //   id: 'drum', name: { ja: 'DRUM MACHINE', ... }, ...
  // },

  // ============================================================
  // 🧘 メンタル・本番準備系 (2026-04-26 追加)
  // ============================================================
  {
    id: 'breath',
    name: { ja: 'BREATH', en: 'BREATH', es: 'BREATH' },
    tagline: { ja: '本番前の呼吸法ガイド', en: 'Pre-performance breathing guide', es: 'Respiración antes del show' },
    href: '/breath-lp',
    launchHref: '/breath',
    emoji: '🌬',
    category: 'mental',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: ['NEW'],
    minPlan: 'free',
  },
  {
    id: 'checklist',
    name: { ja: 'CHECKLIST', en: 'CHECKLIST', es: 'CHECKLIST' },
    tagline: { ja: '本番当日の持ち物・タイムライン', en: 'Performance day checklist & timeline', es: 'Lista del día del concierto' },
    href: '/checklist-lp',
    launchHref: '/checklist',
    emoji: '✅',
    category: 'mental',
    noLogin: false,
    serverApp: false,
    quotaKey: null,
    badges: ['NEW'],
    minPlan: 'free-with-login',
  },
  {
    id: 'frequency',
    name: { ja: 'FREQUENCY', en: 'FREQUENCY', es: 'FREQUENCY' },
    tagline: { ja: 'ソルフェジオ周波数サイン波プレーヤー', en: 'Solfeggio frequency sine wave player', es: 'Reproductor de frecuencias solfeggio' },
    href: '/frequency-lp',
    launchHref: '/frequency',
    emoji: '🔊',
    category: 'mental',
    noLogin: true,
    serverApp: false,
    quotaKey: null,
    badges: ['NEW'],
    minPlan: 'free',
  },

  // ============================================================
  // 🤖 AI 処理系 (有料プラン専用)
  // ============================================================
  // 2026-04-27 公開停止: SEPARATOR
  // Cloud Run CPU 単体での Demucs 運用が長尺ファイルで不安定なため、サイト掲載を停止。
  // 将来 Replicate API 等の専業サービスへ乗せ替え後に再公開予定。
  // /separator-lp および /separator の URL は残存するが、カタログ・ホーム・サイトマップには
  // 一切露出させない (CLAUDE.md §43 付近に方針記載)。
  // {
  //   id: 'separator',
  //   name: { ja: 'SEPARATOR', en: 'SEPARATOR', es: 'SEPARATOR' },
  //   tagline: { ja: 'AI 音源分離 (vocals/drums/bass/others)', en: 'AI stem separation (vocals/drums/bass/others)', es: 'Separación de pistas con IA' },
  //   href: '/separator-lp',
  //   launchHref: '/separator',
  //   emoji: '🎛',
  //   category: 'ai',
  //   noLogin: false,
  //   serverApp: true,
  //   quotaKey: 'separator',
  //   badges: ['NEW', 'PRO'],
  //   minPlan: 'prelude',
  // },
  {
    id: 'transcribe',
    name: { ja: 'TRANSCRIBER', en: 'TRANSCRIBER', es: 'TRANSCRIBER' },
    tagline: { ja: 'AI 楽譜起こし (近日公開)', en: 'AI music transcription (coming soon)', es: 'Transcripción musical IA (próximamente)' },
    href: '/transcribe-lp',
    launchHref: '/transcribe',
    emoji: '📝',
    category: 'ai',
    noLogin: false,
    serverApp: true,
    quotaKey: 'transcribe',
    badges: ['COMING_SOON', 'PRO'],
    minPlan: 'prelude',
  },
  {
    id: 'intonation',
    name: { ja: 'INTONATION ANALYZER', en: 'INTONATION ANALYZER', es: 'INTONATION ANALYZER' },
    tagline: { ja: 'セント精度ピッチ分析 (近日公開)', en: 'Cent-precision pitch analysis (coming soon)', es: 'Análisis tonal de centavos' },
    href: '/intonation-lp',
    launchHref: '/intonation',
    emoji: '📐',
    category: 'ai',
    noLogin: false,
    serverApp: true,
    quotaKey: 'intonation',
    badges: ['COMING_SOON', 'PRO'],
    minPlan: 'prelude',
  },
];

// ============================================================
// カテゴリメタデータ
// ============================================================

export interface CategoryMeta {
  id: AppCategory;
  emoji: string;
  label: L;
  desc: L;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'learning',
    emoji: '🎓',
    label: { ja: '学習・練習', en: 'Learning & Practice', es: 'Aprendizaje y Práctica' },
    desc: { ja: '毎日の楽器練習・聴音・楽典', en: 'Daily instrument practice, ear training, theory', es: 'Práctica diaria, entrenamiento auditivo' },
  },
  {
    id: 'composition',
    emoji: '🎼',
    label: { ja: '作曲・理論', en: 'Composition & Theory', es: 'Composición y Teoría' },
    desc: { ja: '和声・対位法・移調・テンポ操作', en: 'Harmony, counterpoint, transposition, tempo', es: 'Armonía, contrapunto, transposición' },
  },
  {
    id: 'recording',
    emoji: '🎛',
    label: { ja: '録音・編集', en: 'Recording & Editing', es: 'Grabación y Edición' },
    desc: { ja: 'ノイズ除去・修復・整音', en: 'Noise reduction, repair, cleanup', es: 'Reducción de ruido, reparación' },
  },
  {
    id: 'analysis',
    emoji: '🔬',
    label: { ja: '分析・プロ', en: 'Analysis & Pro Tools', es: 'Análisis y Herramientas Pro' },
    desc: { ja: 'マスタリング検証・DDP・DSD・スペクトラム', en: 'Mastering verification, DDP, DSD, spectrum', es: 'Verificación de masterización' },
  },
  {
    id: 'production',
    emoji: '🎚',
    label: { ja: '制作・スタジオ', en: 'Production & Studio', es: 'Producción y Estudio' },
    desc: { ja: 'コンピング・マルチトラック・スタジオ機能', en: 'Comping, multi-track, studio tools', es: 'Comping, multipista, herramientas estudio' },
  },
  {
    id: 'sharing',
    emoji: '🌍',
    label: { ja: '共有・コミュニティ', en: 'Sharing & Community', es: 'Compartir y Comunidad' },
    desc: { ja: '音源共有・ライブ情報・サウンドマップ', en: 'Audio sharing, live events, sound map', es: 'Compartir audio, eventos' },
  },
  {
    id: 'mental',
    emoji: '🧘',
    label: { ja: 'メンタル・本番準備', en: 'Mental & Pre-Performance', es: 'Mental y Pre-actuación' },
    desc: { ja: '呼吸法・チェックリスト・周波数・本番直前の儀式', en: 'Breathing, checklist, frequency, pre-stage rituals', es: 'Respiración, lista, frecuencia, rituales' },
  },
  {
    id: 'ai',
    emoji: '🤖',
    label: { ja: 'AI 処理 (Pro)', en: 'AI Processing (Pro)', es: 'Procesamiento IA (Pro)' },
    desc: { ja: 'AI 音源分離・譜起こし・ピッチ分析', en: 'AI separation, transcription, pitch analysis', es: 'Separación IA, transcripción' },
  },
];

// ============================================================
// プラン階層 (上位プランは下位プランで使えるアプリも全て使える)
// ============================================================

const PLAN_HIERARCHY: Record<MinPlan, number> = {
  'free': 0,
  'free-with-login': 1,
  'prelude': 2,
  'concerto': 3,
  'symphony': 4,
  'opus': 5,
};

/**
 * ユーザーの現在プランで指定アプリが使えるか
 * 未ログインユーザー: noLogin=true のアプリのみ
 * ログイン済 Free: minPlan が 'free' or 'free-with-login' のもの
 * 有料: 該当プラン以上の階層
 */
export function canUseApp(
  app: CatalogApp,
  userPlan: PlanTier | 'free' | null,
  isLoggedIn: boolean,
): boolean {
  // 未ログイン: noLogin の太っ腹アプリのみ
  if (!isLoggedIn) return app.noLogin;

  // ログイン済 Free: 'free' と 'free-with-login' OK
  // (server app は全部 minPlan='prelude' 以上なので不可)
  if (!userPlan || userPlan === 'free') {
    const userLevel = PLAN_HIERARCHY['free-with-login']; // ログイン済なら 'free-with-login' レベル
    return PLAN_HIERARCHY[app.minPlan] <= userLevel;
  }

  // 有料: プラン階層比較
  const userLevel = PLAN_HIERARCHY[userPlan as MinPlan] ?? 0;
  return PLAN_HIERARCHY[app.minPlan] <= userLevel;
}

// ============================================================
// ヘルパー関数
// ============================================================

/** ユーザープランで使えるアプリ一覧 */
export function appsForPlan(
  userPlan: PlanTier | 'free' | null,
  isLoggedIn: boolean,
): CatalogApp[] {
  return APP_CATALOG.filter((app) => canUseApp(app, userPlan, isLoggedIn));
}

/** カテゴリ別アプリ一覧 */
export function appsByCategory(category: AppCategory): CatalogApp[] {
  return APP_CATALOG.filter((app) => app.category === category);
}

/** 上位プランで解放されるアプリ (アップセル用) */
export function appsLockedFor(
  userPlan: PlanTier | 'free' | null,
  isLoggedIn: boolean,
): CatalogApp[] {
  return APP_CATALOG.filter((app) => !canUseApp(app, userPlan, isLoggedIn));
}

/** 「今日のおすすめ」をプランで使えるアプリから 1 つ選ぶ */
export function recommendedAppOfDay(
  userPlan: PlanTier | 'free' | null,
  isLoggedIn: boolean,
  excludeIds: string[] = [],
): CatalogApp | null {
  const available = appsForPlan(userPlan, isLoggedIn).filter((a) => !excludeIds.includes(a.id));
  if (available.length === 0) return null;
  // 日付ベースで決定論的に選択 (同じ日には同じおすすめ)
  const dayIdx = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % available.length;
  return available[dayIdx];
}

/** 全アプリ件数 (Free with login で使える全部) */
export function totalAppCount(): number {
  return APP_CATALOG.length;
}

/** Free no-login アプリ件数 (登録不要) */
export function noLoginAppCount(): number {
  return APP_CATALOG.filter((a) => a.noLogin).length;
}
