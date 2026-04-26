// ─────────────────────────────────────────────
// KUON DRUM MACHINE — Kit Definitions
// ─────────────────────────────────────────────
// 各キットは 8 トラック (slot 0-7) に異なる打楽器を配置。
// パターンは slot index で打点を指定し、キット切替で同じパターンが
// 異なる楽器構成で鳴る (例: Standard の Kick → Jazz では Acoustic Kick)。
//
// MVP: 4 キット (Standard / Jazz / Funk / Trap)
// Phase 2-4 で 12 文化圏キットを追加 (Cuban / Brazilian / Argentinian /
//   Spanish / West African / Indian / Middle Eastern / Balkan / Jamaican /
//   Japanese / Korean / Gamelan)
// ─────────────────────────────────────────────

import type { VoiceFn, PlayParams } from './synth';
import {
  kickElectronic, kickAcoustic, kick808Sub,
  snareElectronic, snareBrush,
  hatClosed, hatOpen, hatRoll, ride, crash,
  clap, snap,
  tomLow, tomMid, tomHigh,
  cowbell, rim, tambourine,
  congaHigh, congaLow, clave,
} from './synth';
import type { Lang } from '@/context/LangContext';

export type L5 = Partial<Record<Lang, string>> & { en: string };

export type KitId = 'standard' | 'jazz' | 'funk' | 'trap'
  // Phase 2 以降
  | 'cuban' | 'brazilian' | 'argentinian' | 'spanish'
  | 'westafrican' | 'indian' | 'middleeastern' | 'balkan'
  | 'jamaican' | 'japanese' | 'korean' | 'gamelan';

export type Kit = {
  id: KitId;
  name: L5;
  emoji: string;            // UI 表示用
  voices: VoiceFn[];        // 8 ボイス
  voiceLabels: L5[];        // 各ボイスの表示名
  defaultParams: PlayParams[]; // 各ボイスのデフォルト
  available: boolean;       // false なら "Coming soon" 表示
};

// ─────────────────────────────────────────────
// 共通デフォルトパラメータ
// ─────────────────────────────────────────────
const dp = (
  tune = 1, decay = 0.4, volume = 0.8, pan = 0,
): PlayParams => ({ tune, decay, volume, pan });

// ─────────────────────────────────────────────
// MVP Kits (4 種・本番稼働)
// ─────────────────────────────────────────────
export const KITS: Record<KitId, Kit> = {
  standard: {
    id: 'standard', emoji: '🥁', available: true,
    name: { ja: 'スタンダード', en: 'Standard', es: 'Estándar', ko: '스탠다드', pt: 'Padrão', de: 'Standard' },
    voices: [
      kickElectronic, snareElectronic, hatClosed, hatOpen,
      clap, tomLow, cowbell, rim,
    ],
    voiceLabels: [
      { ja: 'キック', en: 'Kick', es: 'Bombo', ko: '킥', pt: 'Bumbo', de: 'Kick' },
      { ja: 'スネア', en: 'Snare', es: 'Caja', ko: '스네어', pt: 'Caixa', de: 'Snare' },
      { ja: 'クローズハット', en: 'Closed Hat', es: 'Hi-Hat Cerrado', ko: '클로즈드 햇', pt: 'Chimbal Fechado', de: 'Closed Hat' },
      { ja: 'オープンハット', en: 'Open Hat', es: 'Hi-Hat Abierto', ko: '오픈 햇', pt: 'Chimbal Aberto', de: 'Open Hat' },
      { ja: 'クラップ', en: 'Clap', es: 'Palmas', ko: '클랩', pt: 'Palmas', de: 'Clap' },
      { ja: 'タム (低)', en: 'Tom Low', es: 'Tom Bajo', ko: '톰 (저)', pt: 'Tom Grave', de: 'Tom (tief)' },
      { ja: 'カウベル', en: 'Cowbell', es: 'Cencerro', ko: '카우벨', pt: 'Cowbell', de: 'Cowbell' },
      { ja: 'リム', en: 'Rim', es: 'Aro', ko: '림', pt: 'Aro', de: 'Rim' },
    ],
    defaultParams: [
      dp(1, 0.5, 0.9), dp(1, 0.25, 0.85), dp(1, 0.05, 0.65), dp(1, 0.3, 0.6),
      dp(1, 0.18, 0.7), dp(1, 0.4, 0.7), dp(1, 0.22, 0.55), dp(1, 0.08, 0.6),
    ],
  },

  jazz: {
    id: 'jazz', emoji: '🎷', available: true,
    name: { ja: 'ジャズ', en: 'Jazz', es: 'Jazz', ko: '재즈', pt: 'Jazz', de: 'Jazz' },
    voices: [
      kickAcoustic, snareBrush, hatClosed, ride,
      crash, tomMid, tomLow, rim,
    ],
    voiceLabels: [
      { ja: 'キック (アコースティック)', en: 'Kick', es: 'Bombo', ko: '킥', pt: 'Bumbo', de: 'Kick' },
      { ja: 'ブラシ・スネア', en: 'Brush Snare', es: 'Caja Brush', ko: '브러시 스네어', pt: 'Caixa Vassoura', de: 'Brush Snare' },
      { ja: 'ハイハット', en: 'Hi-Hat', es: 'Hi-Hat', ko: '하이햇', pt: 'Chimbal', de: 'Hi-Hat' },
      { ja: 'ライドシンバル', en: 'Ride', es: 'Ride', ko: '라이드', pt: 'Prato Ride', de: 'Ride' },
      { ja: 'クラッシュ', en: 'Crash', es: 'Crash', ko: '크래시', pt: 'Prato Crash', de: 'Crash' },
      { ja: 'タム (中)', en: 'Tom Mid', es: 'Tom Medio', ko: '톰 (중)', pt: 'Tom Médio', de: 'Tom (mittel)' },
      { ja: 'タム (低)', en: 'Tom Low', es: 'Tom Bajo', ko: '톰 (저)', pt: 'Tom Grave', de: 'Tom (tief)' },
      { ja: 'クロスティック', en: 'Cross Stick', es: 'Aro', ko: '크로스 스틱', pt: 'Cross Stick', de: 'Cross Stick' },
    ],
    defaultParams: [
      dp(0.95, 0.5, 0.75), dp(1, 0.18, 0.6), dp(1, 0.05, 0.55), dp(1, 0.6, 0.7),
      dp(1, 1.2, 0.6), dp(1, 0.4, 0.65), dp(0.85, 0.45, 0.65), dp(1, 0.07, 0.55),
    ],
  },

  funk: {
    id: 'funk', emoji: '🎸', available: true,
    name: { ja: 'ファンク', en: 'Funk', es: 'Funk', ko: '펑크', pt: 'Funk', de: 'Funk' },
    voices: [
      kickElectronic, snareElectronic, hatClosed, hatOpen,
      tambourine, congaHigh, congaLow, cowbell,
    ],
    voiceLabels: [
      { ja: 'キック (パンチー)', en: 'Kick', es: 'Bombo', ko: '킥', pt: 'Bumbo', de: 'Kick' },
      { ja: 'スネア (シャープ)', en: 'Snare', es: 'Caja', ko: '스네어', pt: 'Caixa', de: 'Snare' },
      { ja: 'クローズハット', en: 'Closed Hat', es: 'Hi-Hat Cerrado', ko: '클로즈드 햇', pt: 'Chimbal Fechado', de: 'Closed Hat' },
      { ja: 'オープンハット', en: 'Open Hat', es: 'Hi-Hat Abierto', ko: '오픈 햇', pt: 'Chimbal Aberto', de: 'Open Hat' },
      { ja: 'タンバリン', en: 'Tambourine', es: 'Pandereta', ko: '탬버린', pt: 'Pandeireta', de: 'Tamburin' },
      { ja: 'コンガ (高)', en: 'Conga High', es: 'Conga Alta', ko: '콩가 (고)', pt: 'Conga Aguda', de: 'Conga (hoch)' },
      { ja: 'コンガ (低)', en: 'Conga Low', es: 'Conga Baja', ko: '콩가 (저)', pt: 'Conga Grave', de: 'Conga (tief)' },
      { ja: 'カウベル', en: 'Cowbell', es: 'Cencerro', ko: '카우벨', pt: 'Cowbell', de: 'Cowbell' },
    ],
    defaultParams: [
      dp(1.05, 0.4, 0.95), dp(1.05, 0.2, 0.9), dp(1, 0.05, 0.7), dp(1, 0.35, 0.65),
      dp(1, 0.12, 0.5), dp(1, 0.18, 0.6, 0.3), dp(1, 0.22, 0.6, -0.3), dp(1, 0.18, 0.55),
    ],
  },

  trap: {
    id: 'trap', emoji: '💥', available: true,
    name: { ja: 'トラップ', en: 'Trap', es: 'Trap', ko: '트랩', pt: 'Trap', de: 'Trap' },
    voices: [
      kick808Sub, snareElectronic, hatClosed, hatRoll,
      snap, hatOpen, crash, rim,
    ],
    voiceLabels: [
      { ja: '808 サブキック', en: '808 Sub', es: '808 Sub', ko: '808 서브', pt: '808 Sub', de: '808 Sub' },
      { ja: 'スネア (クラップ風)', en: 'Snare', es: 'Caja', ko: '스네어', pt: 'Caixa', de: 'Snare' },
      { ja: 'ハイハット 8 分', en: 'Hat 8th', es: 'Hi-Hat 8vo', ko: '햇 8분', pt: 'Chimbal 8as', de: 'Hat 8tel' },
      { ja: 'ハイハット 16 分ロール', en: 'Hat 16th Roll', es: 'Hi-Hat 16vo Roll', ko: '햇 16분 롤', pt: 'Chimbal 16 Roll', de: 'Hat 16tel Roll' },
      { ja: 'スナップ', en: 'Snap', es: 'Chasquido', ko: '스냅', pt: 'Estalo', de: 'Snap' },
      { ja: 'オープンハット', en: 'Open Hat', es: 'Hi-Hat Abierto', ko: '오픈 햇', pt: 'Chimbal Aberto', de: 'Open Hat' },
      { ja: 'クラッシュ', en: 'Crash', es: 'Crash', ko: '크래시', pt: 'Prato Crash', de: 'Crash' },
      { ja: 'リム', en: 'Rim', es: 'Aro', ko: '림', pt: 'Aro', de: 'Rim' },
    ],
    defaultParams: [
      dp(0.9, 0.8, 0.95), dp(1, 0.18, 0.85), dp(1.2, 0.05, 0.55), dp(1.2, 0.05, 0.5),
      dp(1, 0.07, 0.7), dp(1.1, 0.3, 0.5), dp(1, 1.0, 0.55), dp(1, 0.07, 0.55),
    ],
  },

  // ─── Phase 2-4 で実装予定 (現在はキューバキットだけ Coming soon UI 用に定義) ───
  cuban: {
    id: 'cuban', emoji: '🇨🇺', available: false,
    name: { ja: 'キューバ', en: 'Cuban', es: 'Cubano', ko: '쿠바', pt: 'Cubano', de: 'Kubanisch' },
    voices: [clave, congaLow, congaHigh, cowbell, rim, tomLow, tomHigh, tambourine],
    voiceLabels: [
      { ja: 'クラベ', en: 'Clave', es: 'Clave', ko: '클라베', pt: 'Clave', de: 'Clave' },
      { ja: 'コンガ (低)', en: 'Conga Low', es: 'Conga', ko: '콩가', pt: 'Conga', de: 'Conga' },
      { ja: 'コンガ (高)', en: 'Conga High', es: 'Conga Alta', ko: '콩가', pt: 'Conga', de: 'Conga' },
      { ja: 'カンパナ', en: 'Cowbell', es: 'Campana', ko: '카우벨', pt: 'Sino', de: 'Glocke' },
      { ja: 'ボンゴ', en: 'Bongo', es: 'Bongó', ko: '봉고', pt: 'Bongô', de: 'Bongo' },
      { ja: 'ティンバレス (低)', en: 'Timbales Low', es: 'Timbales', ko: '팀발레스', pt: 'Timbales', de: 'Timbales' },
      { ja: 'ティンバレス (高)', en: 'Timbales High', es: 'Timbales Altos', ko: '팀발레스', pt: 'Timbales', de: 'Timbales' },
      { ja: 'マラカス', en: 'Maracas', es: 'Maracas', ko: '마라카스', pt: 'Maracas', de: 'Maracas' },
    ],
    defaultParams: [dp(), dp(1, 0.22, 0.7, -0.2), dp(1, 0.2, 0.7, 0.2), dp(), dp(), dp(0.9), dp(1.1), dp()],
  },
  brazilian: { id: 'brazilian', emoji: '🇧🇷', available: false, name: { ja: 'ブラジル', en: 'Brazilian', es: 'Brasileño', ko: '브라질', pt: 'Brasileiro', de: 'Brasilianisch' }, voices: [], voiceLabels: [], defaultParams: [] },
  argentinian: { id: 'argentinian', emoji: '🇦🇷', available: false, name: { ja: 'アルゼンチン', en: 'Argentinian', es: 'Argentino', ko: '아르헨티나', pt: 'Argentino', de: 'Argentinisch' }, voices: [], voiceLabels: [], defaultParams: [] },
  spanish: { id: 'spanish', emoji: '🇪🇸', available: false, name: { ja: 'フラメンコ', en: 'Flamenco', es: 'Flamenco', ko: '플라멩코', pt: 'Flamenco', de: 'Flamenco' }, voices: [], voiceLabels: [], defaultParams: [] },
  westafrican: { id: 'westafrican', emoji: '🌍', available: false, name: { ja: '西アフリカ', en: 'West African', es: 'Africano Occidental', ko: '서아프리카', pt: 'Oeste Africano', de: 'Westafrikanisch' }, voices: [], voiceLabels: [], defaultParams: [] },
  indian: { id: 'indian', emoji: '🇮🇳', available: false, name: { ja: 'インド', en: 'Indian', es: 'Indio', ko: '인도', pt: 'Indiano', de: 'Indisch' }, voices: [], voiceLabels: [], defaultParams: [] },
  middleeastern: { id: 'middleeastern', emoji: '🕌', available: false, name: { ja: '中東', en: 'Middle Eastern', es: 'Medio Oriente', ko: '중동', pt: 'Oriente Médio', de: 'Nahöstlich' }, voices: [], voiceLabels: [], defaultParams: [] },
  balkan: { id: 'balkan', emoji: '🏔️', available: false, name: { ja: 'バルカン', en: 'Balkan', es: 'Balcánico', ko: '발칸', pt: 'Balcânico', de: 'Balkanisch' }, voices: [], voiceLabels: [], defaultParams: [] },
  jamaican: { id: 'jamaican', emoji: '🇯🇲', available: false, name: { ja: 'ジャマイカ', en: 'Jamaican', es: 'Jamaicano', ko: '자메이카', pt: 'Jamaicano', de: 'Jamaikanisch' }, voices: [], voiceLabels: [], defaultParams: [] },
  japanese: { id: 'japanese', emoji: '🎌', available: false, name: { ja: '和太鼓', en: 'Japanese', es: 'Japonés', ko: '일본', pt: 'Japonês', de: 'Japanisch' }, voices: [], voiceLabels: [], defaultParams: [] },
  korean: { id: 'korean', emoji: '🇰🇷', available: false, name: { ja: '韓国 (풍물)', en: 'Korean', es: 'Coreano', ko: '한국', pt: 'Coreano', de: 'Koreanisch' }, voices: [], voiceLabels: [], defaultParams: [] },
  gamelan: { id: 'gamelan', emoji: '🇮🇩', available: false, name: { ja: 'ガムラン', en: 'Gamelan', es: 'Gamelán', ko: '가믈란', pt: 'Gamelão', de: 'Gamelan' }, voices: [], voiceLabels: [], defaultParams: [] },
};

export const AVAILABLE_KITS: KitId[] = ['standard', 'jazz', 'funk', 'trap'];
export const COMING_SOON_KITS: KitId[] = ['cuban', 'brazilian', 'argentinian', 'spanish', 'westafrican', 'indian', 'middleeastern', 'balkan', 'jamaican', 'japanese', 'korean', 'gamelan'];
