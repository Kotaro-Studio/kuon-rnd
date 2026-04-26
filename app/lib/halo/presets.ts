// ─────────────────────────────────────────────
// KUON HALO v2 — Healing Presets (Spiritual Women / Law of Attraction)
// ─────────────────────────────────────────────
// ターゲット: うつ・悩みを抱える女性、引き寄せの法則を実践するスピリチュアル系女性。
// Hiroshi Yoshimura / Joep Beving / Nils Frahm / Max Richter『Sleep』系の
// 暖かい・透明・天上的なアンビエント。1 コード 30-60 秒の超低速進行。
// ─────────────────────────────────────────────

import type { PadType } from './pads';
import type { Brainwave } from './frequencies';
import type { ReverbPreset } from './reverb';
import type { TextureType } from './synth';
import type { Mode } from './chord-engine';

export type HaloPreset = {
  id: string;
  title: { ja: string; en: string };
  subtitle: { ja: string; en: string };
  description: { ja: string; en: string };
  category: 'manifestation' | 'sleep' | 'meditation' | 'depression-healing' | 'self-love' | 'morning-rise' | 'pregnancy' | 'menopause';

  // ─── 楽曲構造 ───
  // キー (F メジャー = 'F', etc.) — UI 表示・後方互換用
  key: string;
  tuning: 432 | 440;       // 後方互換 (実際は baseSolfeggioHz を優先)
  baseSolfeggioHz?: number; // ヒーリング用ソルフェジオ軸周波数 (174-963)
  mode: Mode;
  progressionId: string;   // chord-engine の Progression を参照

  // ─── レイヤー構成 ───
  // 各層の音色・音量・パン
  bassLayer: { padType: PadType; volume: number; bassOctaveOffset?: number } | null;
  padLayer: { padType: PadType; volume: number };
  shimmerLayer: { padType: PadType; volume: number } | null;

  // フェルトピアノ層 (コード変化時に 1 度ヒット)
  pianoOnChange: { enabled: boolean; volume: number };

  // ─── エフェクト ───
  reverb: { preset: ReverbPreset; wetMix: number };
  texture: { enabled: boolean; type: TextureType; volume: number };

  // ─── バイノーラル (オプション) ───
  binaural: {
    enabled: boolean;
    brainwave: Brainwave['id'];
    customBeatHz?: number;
    carrierHz?: number;
    volume: number;
  };

  // ─── 推奨時間 ───
  recommendedDurationMin: 30 | 60 | 90 | 120;

  filenameTemplate: string;
};

// ─────────────────────────────────────────────
// 8 プリセット (引き寄せ層 / うつ・悩み層 / 妊娠・更年期層)
// ─────────────────────────────────────────────

export const HALO_PRESETS: HaloPreset[] = [
  // ═════════════ MANIFESTATION (引き寄せの法則) ═════════════
  {
    id: 'manifestation-morning',
    title: { ja: 'マニフェステーション・モーニング', en: 'Manifestation Morning' },
    subtitle: { ja: '人生が動き出す朝のヴィジュアライゼーション', en: 'Morning visualization for life transformation' },
    description: {
      ja: '「I → iii → vi → IV」の上昇する黄金進行。F メジャーの暖かさが胸を開き、ストリングスとウォームパッドが「私の人生は今、好転している」という感覚を体に染み込ませます。引き寄せワーク・アファメーション・朝のジャーナリングの BGM に。',
      en: 'Uplifting "I → iii → vi → IV" golden progression. F major\'s warmth opens the heart while strings and warm pads embody the feeling "my life is transforming now." For manifestation work, affirmations, morning journaling.',
    },
    category: 'manifestation',
    key: 'F', tuning: 432, mode: 'ionian',
    progressionId: 'manifestation',
    bassLayer:    { padType: 'warm-analog',     volume: 0.5, bassOctaveOffset: -1 },
    padLayer:     { padType: 'warm-analog',     volume: 0.55 },
    shimmerLayer: { padType: 'glass-pad',       volume: 0.18 },
    pianoOnChange: { enabled: true, volume: 0.25 },
    reverb: { preset: 'crystal-hall', wetMix: 0.45 },
    texture: { enabled: false, type: 'water', volume: 0 },
    binaural: { enabled: true, brainwave: 'alpha', customBeatHz: 10, carrierHz: 174.5, volume: 0.08 },
    recommendedDurationMin: 30,
    filenameTemplate: 'ManifestationMorning_F432_{idx}',
  },
  {
    id: 'abundance-visualization',
    title: { ja: 'アバンダンス・ヴィジュアライゼーション', en: 'Abundance Visualization' },
    subtitle: { ja: '豊かさを受け取る器を整える音響', en: 'Sound that prepares your vessel for abundance' },
    description: {
      ja: '8 つのコードが豊かに展開するバラード進行。F メジャーのストリングス・アンサンブルが「私はあらゆる豊かさを受け取る価値がある」という確信を体に伝えます。お金・愛・健康・成功——あらゆる豊かさのヴィジュアライゼーション瞑想に。',
      en: 'Rich 8-chord balladic progression. String ensemble in F major instills "I am worthy of receiving all abundance." For visualizing money, love, health, success.',
    },
    category: 'manifestation',
    key: 'F', tuning: 432, mode: 'ionian',
    progressionId: 'abundance',
    bassLayer:    { padType: 'warm-analog',     volume: 0.55, bassOctaveOffset: -1 },
    padLayer:     { padType: 'string-ensemble', volume: 0.6 },
    shimmerLayer: { padType: 'glass-pad',       volume: 0.2 },
    pianoOnChange: { enabled: true, volume: 0.3 },
    reverb: { preset: 'crystal-hall', wetMix: 0.55 },
    texture: { enabled: false, type: 'water', volume: 0 },
    binaural: { enabled: true, brainwave: 'alpha', customBeatHz: 10, carrierHz: 174.5, volume: 0.08 },
    recommendedDurationMin: 60,
    filenameTemplate: 'Abundance_F432_{idx}',
  },
  {
    id: 'inner-light-pineal',
    title: { ja: 'インナー・ライト', en: 'Inner Light' },
    subtitle: { ja: '内なる光を呼び覚ます瞑想', en: 'Awaken the light within' },
    description: {
      ja: 'リディアン旋法の浮遊感で松果体を活性化。グラスパッドのきらめきが第三の目を開き、ガンマ波 40Hz が高次意識への扉となる。直観・閃き・スピリチュアルな目覚めを求める時に。',
      en: 'Lydian floating activates the pineal gland. Glass pad shimmer opens the third eye, gamma 40Hz is the gateway to higher consciousness.',
    },
    category: 'meditation',
    key: 'F', tuning: 432, mode: 'lydian',
    progressionId: 'inner-light',
    bassLayer:    { padType: 'warm-analog',     volume: 0.45, bassOctaveOffset: -1 },
    padLayer:     { padType: 'glass-pad',       volume: 0.55 },
    shimmerLayer: { padType: 'glass-pad',       volume: 0.25 },
    pianoOnChange: { enabled: false, volume: 0 },
    reverb: { preset: 'cosmos', wetMix: 0.65 },
    texture: { enabled: true, type: 'cosmos', volume: 0.06 },
    binaural: { enabled: true, brainwave: 'gamma', customBeatHz: 40, carrierHz: 174.5, volume: 0.1 },
    recommendedDurationMin: 30,
    filenameTemplate: 'InnerLight_F432_Lydian_{idx}',
  },

  // ═════════════ SLEEP ═════════════
  {
    id: 'sleep-cycle-warm',
    title: { ja: 'スリープ・サイクル', en: 'Sleep Cycle' },
    subtitle: { ja: '深い眠りへ導く 4 コードの温もり', en: 'Four warm chords guiding deep sleep' },
    description: {
      ja: '「I → vi → IV → V」黄金進行の超低速版。脳が「また始まる」と認識する瞬間に深い安心感が訪れる。デルタ波バイノーラルとウォームパッドの組み合わせが、心配ごとを抱えた夜にも眠りを連れてくる。',
      en: 'Slowed golden progression. The brain senses safety in its predictable return. Delta binaural + warm pads bring sleep even on anxious nights.',
    },
    category: 'sleep',
    key: 'F', tuning: 432, mode: 'ionian',
    progressionId: 'sleep-cycle',
    bassLayer:    { padType: 'warm-analog',     volume: 0.55, bassOctaveOffset: -1 },
    padLayer:     { padType: 'warm-analog',     volume: 0.5 },
    shimmerLayer: null,
    pianoOnChange: { enabled: false, volume: 0 },
    reverb: { preset: 'cathedral', wetMix: 0.55 },
    texture: { enabled: false, type: 'water', volume: 0 },
    binaural: { enabled: true, brainwave: 'delta', customBeatHz: 2.5, carrierHz: 174.5, volume: 0.09 },
    recommendedDurationMin: 60,
    filenameTemplate: 'SleepCycle_F432_Delta_{idx}',
  },
  {
    id: 'eno-floating',
    title: { ja: 'フローティング', en: 'Floating' },
    subtitle: { ja: 'I と IV だけの永遠', en: 'Eternal — just I and IV' },
    description: {
      ja: 'I と IV のコードを 60 秒ずつ交替する Brian Eno『Music for Airports』方式。時間の感覚が消える。眠れない夜・不安で胸がざわつく時に、思考を緩やかに止める音響。',
      en: 'Just I and IV alternating every 60 seconds — Brian Eno "Music for Airports" approach. Time itself dissolves. For sleepless nights and anxious thoughts.',
    },
    category: 'sleep',
    key: 'F', tuning: 432, mode: 'ionian',
    progressionId: 'eno-floating',
    bassLayer:    { padType: 'warm-analog',     volume: 0.5, bassOctaveOffset: -1 },
    padLayer:     { padType: 'warm-analog',     volume: 0.55 },
    shimmerLayer: { padType: 'voice-pad',       volume: 0.2 },
    pianoOnChange: { enabled: false, volume: 0 },
    reverb: { preset: 'cathedral', wetMix: 0.6 },
    texture: { enabled: false, type: 'water', volume: 0 },
    binaural: { enabled: true, brainwave: 'theta', customBeatHz: 5, carrierHz: 174.5, volume: 0.08 },
    recommendedDurationMin: 90,
    filenameTemplate: 'Floating_F432_Theta_{idx}',
  },

  // ═════════════ DEPRESSION HEALING (うつ・悩み) ═════════════
  {
    id: 'self-worth-healing',
    title: { ja: 'セルフ・ワース・ヒーリング', en: 'Self-Worth Healing' },
    subtitle: { ja: '自分を許し、抱きしめる音', en: 'The sound of forgiving and embracing yourself' },
    description: {
      ja: '4 つのコードだけで、自分を抱きしめるような優しさ。IV (温もりの始まり) → I (帰る場所) → vi (悲しみと癒し) → V (希望)。うつ・自己否定・どうしようもない孤独に静かに寄り添う。「あなたはここにいるだけで価値がある」と伝える音響。',
      en: 'Four chords, gentle as a self-embrace. IV→I→vi→V — the path of warmth, return, healing, hope. For depression, self-criticism, loneliness. The sound saying "you have value just being here."',
    },
    category: 'depression-healing',
    key: 'F', tuning: 432, mode: 'ionian',
    progressionId: 'self-worth',
    bassLayer:    { padType: 'warm-analog',     volume: 0.5, bassOctaveOffset: -1 },
    padLayer:     { padType: 'string-ensemble', volume: 0.55 },
    shimmerLayer: { padType: 'voice-pad',       volume: 0.18 },
    pianoOnChange: { enabled: true, volume: 0.25 },
    reverb: { preset: 'cathedral', wetMix: 0.6 },
    texture: { enabled: false, type: 'water', volume: 0 },
    binaural: { enabled: true, brainwave: 'theta', customBeatHz: 6, carrierHz: 174.5, volume: 0.08 },
    recommendedDurationMin: 60,
    filenameTemplate: 'SelfWorth_F432_{idx}',
  },
  {
    id: 'mystical-protection',
    title: { ja: '神秘の守り', en: 'Mystical Protection' },
    subtitle: { ja: '大いなるものに守られている感覚', en: 'Held by something greater' },
    description: {
      ja: 'フリジアン旋法の神秘的な揺らぎ。i → bII → i → bII の繰り返しが「目に見えない守り」を体感させる。困難な時期、人生の転換期、大切な決断の前に。',
      en: 'Phrygian mode\'s mystical rocking. i → bII alternation embodies "unseen protection." For difficult times, life transitions, and important decisions.',
    },
    category: 'meditation',
    key: 'F', tuning: 432, mode: 'phrygian',
    progressionId: 'mystical-phrygian',
    bassLayer:    { padType: 'warm-analog',     volume: 0.5, bassOctaveOffset: -1 },
    padLayer:     { padType: 'string-ensemble', volume: 0.55 },
    shimmerLayer: { padType: 'voice-pad',       volume: 0.18 },
    pianoOnChange: { enabled: false, volume: 0 },
    reverb: { preset: 'cave', wetMix: 0.6 },
    texture: { enabled: true, type: 'wind', volume: 0.05 },
    binaural: { enabled: true, brainwave: 'theta', customBeatHz: 7, carrierHz: 174.5, volume: 0.09 },
    recommendedDurationMin: 60,
    filenameTemplate: 'MysticalProtection_F432_Phrygian_{idx}',
  },
  {
    id: 'divine-embrace',
    title: { ja: 'ディヴァイン・エンブレイス', en: 'Divine Embrace' },
    subtitle: { ja: '宇宙に抱かれる長尺アンビエント', en: 'Long-form ambient embraced by the cosmos' },
    description: {
      ja: '7 つのコードがゆったりと帰結する穏やかなピース。「守られている」「全ては完璧に流れている」と全身で感じる音響。ヨガ・スパ・産後のセルフケア・更年期の心の支えに。',
      en: 'Seven chords resolving peacefully. The body feels "I am held," "everything flows perfectly." For yoga, spa, postpartum self-care, menopausal support.',
    },
    category: 'self-love',
    key: 'F', tuning: 432, mode: 'ionian',
    progressionId: 'divine-embrace',
    bassLayer:    { padType: 'warm-analog',     volume: 0.55, bassOctaveOffset: -1 },
    padLayer:     { padType: 'string-ensemble', volume: 0.6 },
    shimmerLayer: { padType: 'glass-pad',       volume: 0.2 },
    pianoOnChange: { enabled: true, volume: 0.25 },
    reverb: { preset: 'cathedral', wetMix: 0.6 },
    texture: { enabled: false, type: 'water', volume: 0 },
    binaural: { enabled: true, brainwave: 'alpha', customBeatHz: 10, carrierHz: 174.5, volume: 0.08 },
    recommendedDurationMin: 90,
    filenameTemplate: 'DivineEmbrace_F432_{idx}',
  },
];

export function getPresetById(id: string): HaloPreset | undefined {
  return HALO_PRESETS.find((p) => p.id === id);
}

export const PRESET_CATEGORIES = [
  { id: 'all', label: { ja: 'すべて', en: 'All' } },
  { id: 'manifestation', label: { ja: '引き寄せ', en: 'Manifestation' } },
  { id: 'sleep', label: { ja: '睡眠', en: 'Sleep' } },
  { id: 'meditation', label: { ja: '瞑想', en: 'Meditation' } },
  { id: 'depression-healing', label: { ja: 'うつ・癒し', en: 'Depression Healing' } },
  { id: 'self-love', label: { ja: 'セルフラブ', en: 'Self Love' } },
];
