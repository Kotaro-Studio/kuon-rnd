'use client';

/**
 * /theory — Music Theory Suite Hub (Norton Critical Edition aesthetic)
 * =========================================================
 * 16 モジュールの総合目次。すべてのレッスンへの入口。
 *
 * 設計原則 (CLAUDE.md §47, §48, §49):
 *   - Norton Critical Edition / Casa BRUTUS / The Gentlewoman 風
 *   - Mincho 主体、Helvetica 補助
 *   - 章番号 (M0-M15) を明朝で控えめに
 *   - キャラクター・マスコット禁止
 *   - 「すごい」「Great」式の励まし禁止
 *   - 全レッスン固定 URL でいつでも復習可能
 *
 * MVP 段階 (2026-04-29 OMT v2 章順準拠に再番号化):
 *   - M0-01「五線と音名」(Kuon オリジナル M0)
 *   - M1-40「三和音の基本形と転回形」(OMT v2 Part I 第 17+19 章)
 *   - M4-01「カデンツの種類」(OMT v2 Part IV 第 1 章)
 *   - 他のレッスンは「準備中」表示
 *   - 診断テストはプレースホルダー (Phase 2)
 */

import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE = '#d4d0c4';
const ACCENT_INDIGO = '#3a3a5e';
const ACCENT_GOLD = '#9c7c3a';
const ACCENT_VINE = '#475569';

type L6 = { ja?: string; en: string; es?: string; ko?: string; pt?: string; de?: string };
const t = (m: L6, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

interface ModuleDef {
  id: string;
  num: string;
  title: L6;
  desc: L6;
  lessonCount: number;
  level: 'foundation' | 'intermediate' | 'advanced' | 'graduate';
  // 2026-04-29 改修 #2: 全 553 レッスンの目次を表示するため、
  //                     ALL lessons を含む配列に拡張。published=true のものだけクリック可能。
  lessons: { id: string; title: L6; published?: boolean }[];
}

const MODULES: ModuleDef[] = [
  {
    id: 'm0', num: 'M0',
    title: { ja: '音楽との最初の出会い', en: 'First Encounter with Music', es: 'Primer encuentro con la música', ko: '음악과의 첫 만남', pt: 'Primeiro encontro com a música', de: 'Erste Begegnung mit Musik' },
    desc: { ja: '譜面を読まずに音楽そのものに触れる入門。音とは何か・リズム・声・楽器・世界の音楽システム。', en: 'A pre-notational introduction. What sound is, rhythm, voice, instruments, world music systems — touch music itself before reading any staff.', es: 'Introducción pre-notacional. Qué es el sonido, ritmo, voz, instrumentos, sistemas musicales del mundo.', ko: '기보를 읽지 않고 음악 자체에 닿는 입문. 소리란 무엇인가·리듬·목소리·악기·세계 음악.', pt: 'Introdução pré-notacional. O que é o som, ritmo, voz, instrumentos, sistemas musicais do mundo.', de: 'Vornotationale Einführung. Was Klang ist, Rhythmus, Stimme, Instrumente, Weltmusiksysteme.' },
    lessonCount: 15, level: 'foundation',
    lessons: [
      { id: 'l01', title: { ja: '音とは何か', en: 'What is Sound?', es: '¿Qué es el sonido?', ko: '소리란 무엇인가', pt: 'O que é o som?', de: 'Was ist Klang?' }, published: true },
      { id: 'l02', title: { ja: 'リズムを身体で感じる', en: 'Feel Rhythm in the Body' } },
      { id: 'l03', title: { ja: '高さの直感', en: 'Pitch Intuition' } },
      { id: 'l04', title: { ja: '強弱と色合い', en: 'Dynamics and Timbre' } },
      { id: 'l05', title: { ja: '速さの感覚', en: 'Tempo Sensation' } },
      { id: 'l06', title: { ja: '沈黙の役割', en: "The Role of Silence (Cage's 4'33\")" } },
      { id: 'l07', title: { ja: 'メロディーとは', en: 'What is Melody?' } },
      { id: 'l08', title: { ja: 'ハーモニーとは', en: 'What is Harmony?' } },
      { id: 'l09', title: { ja: '楽器の家族', en: 'Families of Instruments' } },
      { id: 'l10', title: { ja: '声の仕組み', en: 'How the Voice Works' } },
      { id: 'l11', title: { ja: '世界の音楽システム', en: 'World Music Systems' } },
      { id: 'l12', title: { ja: '音楽史の地図', en: 'A Map of Music History' } },
      { id: 'l13', title: { ja: '音楽と感情', en: 'Music and Emotion' } },
      { id: 'l14', title: { ja: '音楽と数学', en: 'Music and Mathematics' } },
      { id: 'l15', title: { ja: '楽典への橋渡し', en: 'Bridge to Music Theory' } },
    ],
  },
  {
    id: 'm1', num: 'M1',
    title: { ja: '楽典基礎', en: 'Fundamentals', es: 'Fundamentos', ko: '악전 기초', pt: 'Fundamentos', de: 'Grundlagen' },
    desc: { ja: '記譜法・音程・音階・三和音・七の和音・ローマ数字・SATB・テクスチャ', en: 'Notation, intervals, scales, triads, seventh chords, Roman numerals, SATB, texture.', es: 'Notación, intervalos, escalas, tríadas, séptimas, cifrado romano, SATB.', ko: '기보법·음정·음계·삼화음·칠화음·로마숫자·SATB.', pt: 'Notação, intervalos, escalas, tríades, sétimas, cifras romanas, SATB.', de: 'Notation, Intervalle, Skalen, Dreiklänge, Septakkorde, Stufenanalyse, Vierstimmigkeit.' },
    lessonCount: 60, level: 'foundation',
    lessons: [
      { id: 'l01', title: { ja: '西洋音楽記譜法の導入', en: 'Introduction to Western Notation', es: 'Introducción a la notación', ko: '서양 기보법의 도입', pt: 'Introdução à notação', de: 'Einführung in die Notation' }, published: true },
      { id: 'l02', title: { ja: '音符の記譜と五線', en: 'Notation of Notes and the Staff', es: 'Notación de las notas y el pentagrama', ko: '음표의 기보와 오선', pt: 'Notação das notas e a pauta', de: 'Notenschrift und das System' }, published: true },
      { id: 'l03', title: { ja: '符尾・連桁・2 度の書き方', en: 'Stems, Beams, and Drawing Seconds' } },
      { id: 'l04', title: { ja: '音部記号の描き方と加線', en: 'Drawing Clefs and Ledger Lines' } },
      { id: 'l05', title: { ja: 'ト音記号とヘ音記号を読む', en: 'Reading Treble and Bass Clefs' } },
      { id: 'l06', title: { ja: 'ハ音記号 (アルト・テナー) を読む', en: 'Reading Alto and Tenor Clefs' } },
      { id: 'l07', title: { ja: 'ピアノ鍵盤と白鍵の音名', en: 'The Piano Keyboard and White-Key Names' } },
      { id: 'l08', title: { ja: 'グランドステーブと両手譜', en: 'The Grand Staff' } },
      { id: 'l09', title: { ja: '一般音程 (ジェネリック・インターバル)', en: 'Generic Intervals' } },
      { id: 'l10', title: { ja: '全音と半音', en: 'Whole and Half Steps' } },
      { id: 'l11', title: { ja: 'シャープ・フラット・ナチュラル + 異名同音', en: 'Sharps, Flats, Naturals, Enharmonic Equivalence' } },
      { id: 'l12', title: { ja: 'アメリカ標準音名 (ASPN) — 概念', en: 'ASPN — Concept' } },
      { id: 'l13', title: { ja: 'ASPN — オクターブ番号と譜面上の表記', en: 'ASPN — Octave Numbering and Staff' } },
      { id: 'l14', title: { ja: '強弱記号とアーティキュレーション', en: 'Dynamics and Articulations' } },
      { id: 'l15', title: { ja: 'テンポ・構造記号・様式の時代', en: 'Tempo, Structural Features, Stylistic Periods' } },
      { id: 'l16', title: { ja: '音価 (note values) と休符', en: 'Note Values and Rests' } },
      { id: 'l17', title: { ja: '付点・タイ', en: 'Dots and Ties' } },
      { id: 'l18', title: { ja: '単純拍子 — 概念と聴き方', en: 'Simple Meter — Concept and Listening' } },
      { id: 'l19', title: { ja: '単純拍子 — 拍子記号と数え方', en: 'Simple Meter — Time Signatures and Counting' } },
      { id: 'l20', title: { ja: '単純拍子 — 連桁規則と多小節休符', en: 'Simple Meter — Beaming and Multi-Measure Rests' } },
      { id: 'l21', title: { ja: '複合拍子 — 概念と聴き方', en: 'Compound Meter — Concept and Listening' } },
      { id: 'l22', title: { ja: '複合拍子 — 拍子記号・数え方・連桁', en: 'Compound Meter — Time Signatures, Counting, Beaming' } },
      { id: 'l23', title: { ja: '借用分割と三連符', en: 'Borrowed Divisions and Triplets' } },
      { id: 'l24', title: { ja: 'ハイパーメーターとシンコペーション', en: 'Hypermeter and Syncopation' } },
      { id: 'l25', title: { ja: '長音階の構成', en: 'Construction of Major Scales' } },
      { id: 'l26', title: { ja: '音度と階名 (do-re-mi/ラベル)', en: 'Scale Degrees and Solfège Names' } },
      { id: 'l27', title: { ja: '長調の調号と五度圏', en: 'Major Key Signatures and Circle of Fifths' } },
      { id: 'l28', title: { ja: '自然短音階', en: 'Natural Minor Scale' } },
      { id: 'l29', title: { ja: '和声的短音階', en: 'Harmonic Minor Scale' } },
      { id: 'l30', title: { ja: '旋律的短音階・短音階の階名', en: 'Melodic Minor and Minor Solfège' } },
      { id: 'l31', title: { ja: '平行調と同主調・短調の調号・五度圏', en: 'Parallel/Relative Keys and Minor Circle of Fifths' } },
      { id: 'l32', title: { ja: '教会旋法 — ドリア・フリギア・リディア・ミクソリディア', en: 'Diatonic Modes — Dorian, Phrygian, Lydian, Mixolydian' } },
      { id: 'l33', title: { ja: '半音階 (chromatic scale) と調性外の音', en: 'The Chromatic Scale' } },
      { id: 'l34', title: { ja: '視唱の戦略', en: 'Strategies for Sight-Singing' } },
      { id: 'l35', title: { ja: '聴音の戦略とプロトノーテーション', en: 'Dictation Strategies and Protonotation' } },
      { id: 'l36', title: { ja: '音程の大きさ (ジェネリック・サイズ)', en: 'Interval Size' } },
      { id: 'l37', title: { ja: '完全・長・短音程', en: 'Perfect, Major, and Minor Intervals' } },
      { id: 'l38', title: { ja: '増音程・減音程', en: 'Augmented and Diminished Intervals' } },
      { id: 'l39', title: { ja: '複音程・転回音程・協和不協和', en: 'Compound Intervals, Inversion, Consonance' } },
      { id: 'l40', title: { ja: '三和音の基本形と転回形', en: 'Triads in Root Position and Inversions', es: 'La tríada y sus inversiones', ko: '삼화음의 기본형과 전회', pt: 'A tríade e suas inversões', de: 'Dreiklänge in Grundstellung und Umkehrungen' }, published: true },
      { id: 'l41', title: { ja: '三和音の質 — 長・短・増・減', en: 'Triad Qualities — Major, Minor, Augmented, Diminished' } },
      { id: 'l42', title: { ja: '三和音の聴き分けと配置・倍音', en: 'Identifying Triads — Doubling and Spacing' } },
      { id: 'l43', title: { ja: '七の和音の概念と質', en: 'Seventh Chords — Concept and Qualities' } },
      { id: 'l44', title: { ja: '七の和音 — メジャーキー/マイナーキー', en: 'Seventh Chord Qualities in Major and Minor' } },
      { id: 'l45', title: { ja: '七の和音の聴き分けと配置', en: 'Identifying Seventh Chords' } },
      { id: 'l46', title: { ja: '七の和音の転回と数字付き低音', en: 'Seventh Chord Inversion and Figured Bass' } },
      { id: 'l47', title: { ja: '数字付き低音記号の総合', en: 'Figured Bass Symbols — Comprehensive' } },
      { id: 'l48', title: { ja: 'ローマ数字記法の基礎', en: 'Roman Numerals — Basics' } },
      { id: 'l49', title: { ja: 'ローマ数字 — 三和音の質', en: 'Roman Numerals and Triad Quality' } },
      { id: 'l50', title: { ja: 'ローマ数字 — 七の和音の質', en: 'Roman Numerals and Seventh Chord Quality' } },
      { id: 'l51', title: { ja: 'ローマ数字 — 転回表記', en: 'Roman Numerals — Inversions' } },
      { id: 'l52', title: { ja: 'ローマ数字分析の方法', en: 'Roman Numeral Analysis Method' } },
      { id: 'l53', title: { ja: 'SATB の書き方 — 音域と配置', en: 'SATB — Ranges and Placement' } },
      { id: 'l54', title: { ja: 'SATB の書き方 — 倍音と空間', en: 'SATB — Doubling and Spacing' } },
      { id: 'l55', title: { ja: 'SATB の書き方 — 声部交差と平行五度', en: 'SATB — Voice Crossing and Parallel Fifths' } },
      { id: 'l56', title: { ja: '音楽のテクスチャ — モノフォニー', en: 'Texture — Monophony' } },
      { id: 'l57', title: { ja: '音楽のテクスチャ — ヘテロフォニー', en: 'Texture — Heterophony' } },
      { id: 'l58', title: { ja: '音楽のテクスチャ — ホモフォニー', en: 'Texture — Homophony' } },
      { id: 'l59', title: { ja: '音楽のテクスチャ — ポリフォニー', en: 'Texture — Polyphony' } },
      { id: 'l60', title: { ja: 'M1 総合演習・M2 への橋渡し', en: 'M1 Summary and Bridge to M2' } },
    ],
  },
  {
    id: 'm2', num: 'M2',
    title: { ja: '対位法とガラント様式', en: 'Counterpoint & Galant Schemas', es: 'Contrapunto y esquemas galantes', ko: '대위법과 갈란트 양식', pt: 'Contraponto e esquemas galantes', de: 'Kontrapunkt & Galante Schemata' },
    desc: { ja: '1-5 種対位法・16 世紀様式・フーガ・グランドベース', en: 'Species 1-5, 16th-century style, fugue, ground bass.', es: 'Especies 1-5, estilo del s. XVI, fuga, bajo continuo.', ko: '1-5종 대위법·16세기 양식·푸가.', pt: 'Espécies 1-5, estilo do séc. XVI, fuga.', de: 'Spezies 1-5, 16.-Jh.-Stil, Fuge, Grundbass.' },
    lessonCount: 35, level: 'intermediate',
    lessons: [
      { id: 'l01', title: { ja: '対位法序論・協和不協和', en: 'Intro to Counterpoint — Consonance and Dissonance' } },
      { id: 'l02', title: { ja: '対位法の運動の種類', en: 'Types of Motion' } },
      { id: 'l03', title: { ja: 'カントゥス・フィルムスの作曲', en: 'Composing a Cantus Firmus' } },
      { id: 'l04', title: { ja: '旋律的・和声的書法の規則', en: 'Rules for Melodic and Harmonic Writing' } },
      { id: 'l05', title: { ja: '対位法の心理学', en: 'The Psychology of Counterpoint' } },
      { id: 'l06', title: { ja: '第 1 種対位法 — 線の独立', en: 'First Species — Independence of Lines' } },
      { id: 'l07', title: { ja: '第 1 種対位法 — 開始と終了', en: 'First Species — Beginning and Ending' } },
      { id: 'l08', title: { ja: '第 1 種対位法 — 音程と運動', en: 'First Species — Intervals and Motion' } },
      { id: 'l09', title: { ja: '第 2 種対位法 — 強拍', en: 'Second Species — Strong Beats' } },
      { id: 'l10', title: { ja: '第 2 種対位法 — 弱拍とパッシング・トーン', en: 'Second Species — Weak Beats and Passing Tones' } },
      { id: 'l11', title: { ja: '第 3 種対位法 — 第 3 音への進行', en: 'Third Species — Progression to the Third' } },
      { id: 'l12', title: { ja: '第 3 種対位法 — 不協和の扱い', en: 'Third Species — Dissonance Treatment' } },
      { id: 'l13', title: { ja: '第 4 種対位法 — サスペンション', en: 'Fourth Species — The Suspension' } },
      { id: 'l14', title: { ja: '第 4 種対位法 — 4 度・7 度の解決', en: 'Fourth Species — Resolution of 4ths and 7ths' } },
      { id: 'l15', title: { ja: '第 5 種対位法 — 装飾', en: 'Fifth Species — Embellishments' } },
      { id: 'l16', title: { ja: '第 5 種対位法 — 自由な書法', en: 'Fifth Species — Free Writing' } },
      { id: 'l17', title: { ja: 'グラドゥス・アド・パルナッスム例題 1', en: 'Gradus ad Parnassum — Example 1' } },
      { id: 'l18', title: { ja: 'グラドゥス・アド・パルナッスム例題 2', en: 'Gradus ad Parnassum — Example 2' } },
      { id: 'l19', title: { ja: 'グラドゥス・アド・パルナッスム例題 3', en: 'Gradus ad Parnassum — Example 3' } },
      { id: 'l20', title: { ja: '16 世紀対位法 — 模倣', en: '16th-Century Style — Imitation' } },
      { id: 'l21', title: { ja: '16 世紀対位法 — 旋律・リズム・拍子', en: '16th-Century — Melody, Rhythm, Meter' } },
      { id: 'l22', title: { ja: '16 世紀対位法 — 歌詞付け・テクスチャ・和声', en: '16th-Century — Text, Texture, Harmony' } },
      { id: 'l23', title: { ja: 'バロック・フーガ序論', en: 'Baroque Fugue Introduction' } },
      { id: 'l24', title: { ja: 'フーガ — 主題と応答', en: 'Fugue — Subject and Answer' } },
      { id: 'l25', title: { ja: 'フーガ — 対主題と自由対位法', en: 'Fugue — Countersubject and Free Counterpoint' } },
      { id: 'l26', title: { ja: 'フーガ — リンクと全体構成', en: 'Fugue — Links and Overall Structure' } },
      { id: 'l27', title: { ja: 'グラウンド・ベース', en: 'Ground Bass' } },
      { id: 'l28', title: { ja: 'パーセル ソナタ ト短調分析', en: 'Purcell Sonata in G Minor Analysis' } },
      { id: 'l29', title: { ja: 'ガラント・スキーマ序論 — マイヤー', en: 'Galant Schemas — Meyer' } },
      { id: 'l30', title: { ja: 'ガラント・スキーマ — プリンナー', en: 'Galant Schemas — Prinner' } },
      { id: 'l31', title: { ja: 'ガラント・スキーマ — その他の主要型', en: 'Galant Schemas — Other Types' } },
      { id: 'l32', title: { ja: 'ガラント・スキーマ総覧', en: 'Galant Schemas — Summary' } },
      { id: 'l33', title: { ja: '8 度のルールとシークェンス', en: 'Rule of the Octave and Sequences' } },
      { id: 'l34', title: { ja: 'スケールのシークェンスでの和声付け', en: 'Harmonizing Scales with Sequences' } },
      { id: 'l35', title: { ja: 'M2 総合演習・M3 への橋渡し', en: 'M2 Summary and Bridge to M3' } },
    ],
  },
  {
    id: 'm3', num: 'M3',
    title: { ja: '楽式論', en: 'Form', es: 'Forma musical', ko: '악곡 형식', pt: 'Forma musical', de: 'Formenlehre' },
    desc: { ja: '楽句・ピリオド・二部・三部・ソナタ・ロンド形式', en: 'Phrases, periods, binary, ternary, sonata, rondo.', es: 'Frases, períodos, binaria, ternaria, sonata, rondó.', ko: '악구·이부·삼부·소나타·론도.', pt: 'Frases, períodos, binária, ternária, sonata, rondó.', de: 'Phrasen, Perioden, Sonate, Rondo.' },
    lessonCount: 25, level: 'intermediate',
    lessons: [
      { id: 'l01', title: { ja: '楽句レベルの基礎概念 — 階層', en: 'Foundational Concepts — Hierarchy' } },
      { id: 'l02', title: { ja: 'モチーフ・楽想・楽句・分節分析', en: 'Motives, Ideas, Phrases, Segmentation' } },
      { id: 'l03', title: { ja: '楽句・アーキタイプ・固有形式', en: 'The Phrase, Archetypes, Unique Forms' } },
      { id: 'l04', title: { ja: 'アーキタイプ 1 — センテンス', en: 'Archetype 1 — The Sentence' } },
      { id: 'l05', title: { ja: 'アーキタイプ 2 — ピリオド', en: 'Archetype 2 — The Period' } },
      { id: 'l06', title: { ja: '反復楽句と複合楽句', en: 'Repeated and Compound Phrases' } },
      { id: 'l07', title: { ja: '混合楽句形式 — 概念', en: 'Hybrid Phrase Forms — Concept' } },
      { id: 'l08', title: { ja: '混合楽句形式 — 例と聴き分け', en: 'Hybrid Phrase Forms — Examples' } },
      { id: 'l09', title: { ja: '楽句の拡張・収縮 — 内的拡張', en: 'Phrase Expansion/Contraction — Internal' } },
      { id: 'l10', title: { ja: '楽句の拡張・収縮 — 外的拡張・収縮', en: 'External Expansion and Contraction' } },
      { id: 'l11', title: { ja: '楽式の各セクション概観', en: 'Formal Sections Overview' } },
      { id: 'l12', title: { ja: '中核セクションと補助セクション', en: 'Core and Auxiliary Sections' } },
      { id: 'l13', title: { ja: '接続セクションと外的セクション', en: 'Connective and External Sections' } },
      { id: 'l14', title: { ja: '二部形式 — 反復構造と種類', en: 'Binary Form — Repeats and Types' } },
      { id: 'l15', title: { ja: '二部形式 — 単純二部・ロンド型', en: 'Binary — Simple and Rounded' } },
      { id: 'l16', title: { ja: '二部形式 — 和声的期待', en: 'Binary — Harmonic Expectations' } },
      { id: 'l17', title: { ja: '三部形式 — 単純と複合', en: 'Ternary — Simple and Compound' } },
      { id: 'l18', title: { ja: '三部形式 — B 節の対比', en: 'Ternary — B Section Contrast' } },
      { id: 'l19', title: { ja: '三部形式 — 例題分析', en: 'Ternary — Example Analyses' } },
      { id: 'l20', title: { ja: 'ソナタ形式 — 提示部', en: 'Sonata Form — Exposition' } },
      { id: 'l21', title: { ja: 'ソナタ形式 — 展開部', en: 'Sonata Form — Development' } },
      { id: 'l22', title: { ja: 'ソナタ形式 — 再現部・MC・EEC・ESC', en: 'Sonata — Recap, MC, EEC, ESC' } },
      { id: 'l23', title: { ja: 'ソナタ形式 — 序奏と終結部・例題分析', en: 'Sonata — Intro, Coda, Examples' } },
      { id: 'l24', title: { ja: 'ロンド形式 — リフレインとエピソード', en: 'Rondo — Refrains and Episodes' } },
      { id: 'l25', title: { ja: 'ロンド形式 — 5 部ロンドとソナタ・ロンド', en: 'Rondo — Five-Part and Sonata-Rondo' } },
    ],
  },
  {
    id: 'm4', num: 'M4',
    title: { ja: '機能和声', en: 'Diatonic Harmony', es: 'Armonía diatónica', ko: '기능 화성', pt: 'Harmonia diatônica', de: 'Diatonische Harmonik' },
    desc: { ja: 'カデンツ・V7・属前和音・装飾音・トニカイゼーション・転調', en: 'Cadences, V7, predominants, embellishing tones, tonicization, modulation.', es: 'Cadencias, V7, predominantes, ornamentos, tonicización, modulación.', ko: '카덴츠·V7·속전화음·장식음·전조.', pt: 'Cadências, V7, predominantes, ornamentos, tonicização.', de: 'Kadenzen, V7, Subdominanten, Verzierungen, Modulation.' },
    lessonCount: 55, level: 'intermediate',
    lessons: [
      { id: 'l01', title: { ja: 'カデンツの種類', en: 'Types of Cadence', es: 'Tipos de cadencia', ko: '카덴츠의 종류', pt: 'Tipos de cadência', de: 'Arten der Kadenz' }, published: true },
      { id: 'l02', title: { ja: 'V7 で終止を強める', en: 'Strengthening Endings with V7' } },
      { id: 'l03', title: { ja: 'V7 の代替解決', en: 'Alternative Resolutions of V7' } },
      { id: 'l04', title: { ja: '強い前置和音 — ii6', en: 'Strong Predominants — ii6' } },
      { id: 'l05', title: { ja: '強い前置和音 — IV と組合せ', en: 'Predominants — IV and Combinations' } },
      { id: 'l06', title: { ja: '装飾音 — 概要', en: 'Embellishing Tones — Overview' } },
      { id: 'l07', title: { ja: '装飾音 — 段階・跳躍・静止音', en: 'Embellishing Tones — Step/Leap/Static' } },
      { id: 'l08', title: { ja: 'カデンシャル 6/4 — 表記', en: 'Cadential 6/4 — Notation' } },
      { id: 'l09', title: { ja: 'カデンシャル 6/4 — 書き方', en: 'Cadential 6/4 — Writing' } },
      { id: 'l10', title: { ja: 'V6 と転回 V7 によるトニック延長', en: 'Tonic Prolongation with V6 and Inverted V7s' } },
      { id: 'l11', title: { ja: 'トニック延長の書き方', en: 'Writing Tonic Prolongations' } },
      { id: 'l12', title: { ja: '進行の組合せとベースライン要約', en: 'Combining Progressions and Bass Lines' } },
      { id: 'l13', title: { ja: '楽句モデルによる和声分析 — 概観', en: 'Phrase Model Harmonic Analysis — Overview' } },
      { id: 'l14', title: { ja: '楽句モデルの実践', en: 'Phrase Model in Practice' } },
      { id: 'l15', title: { ja: 'リーディング・トーン和音による延長 — 概観', en: 'Leading-Tone Chord Prolongation — Overview' } },
      { id: 'l16', title: { ja: 'viio4/2 などの代用', en: 'Substituting viio4/2' } },
      { id: 'l17', title: { ja: '半減七のリーディング・トーン和音', en: 'Half-Diminished Leading-Tone Chord' } },
      { id: 'l18', title: { ja: '6/4 和音の延長機能 — 種類', en: '6/4 Chords for Prolongation — Types' } },
      { id: 'l19', title: { ja: '6/4 和音の延長機能 — 用例', en: '6/4 Chords — Use Cases' } },
      { id: 'l20', title: { ja: 'プラガル進行による延長 — カデンツ後', en: 'Plagal Motion — After Cadence' } },
      { id: 'l21', title: { ja: 'プラガル進行による延長 — 楽句冒頭', en: 'Plagal Motion — Phrase Beginnings' } },
      { id: 'l22', title: { ja: 'バスの la (第 6 度) — 概観', en: 'La in the Bass — Overview' } },
      { id: 'l23', title: { ja: 'バスの la — 楽句冒頭・中央', en: 'La in the Bass — Beginnings and Middles' } },
      { id: 'l24', title: { ja: 'バスの la — 楽句末', en: 'La in the Bass — Endings' } },
      { id: 'l25', title: { ja: '中音和音 (iii) で mi を和声化', en: 'Mediant Chord (iii) — Harmonizing Mi' } },
      { id: 'l26', title: { ja: 'iii の書き方と進行', en: 'Writing iii in Progressions' } },
      { id: 'l27', title: { ja: '前置七の和音 — ii に第 7 を加える', en: 'Predominant Sevenths — ii7' } },
      { id: 'l28', title: { ja: '前置七の和音 — その他', en: 'Predominant Sevenths — Others' } },
      { id: 'l29', title: { ja: '前置七の和音 — 用例集', en: 'Predominant Sevenths — Examples' } },
      { id: 'l30', title: { ja: 'トニカイゼーション — 概念', en: 'Tonicization — Concept' } },
      { id: 'l31', title: { ja: 'V を強調するトニカイゼーション', en: 'Tonicizing V' } },
      { id: 'l32', title: { ja: 'V 以外の和音のトニカイゼーション', en: 'Tonicizing Chords Other than V' } },
      { id: 'l33', title: { ja: '偽終止におけるトニカイゼーション', en: 'Tonicized Deceptive Motion' } },
      { id: 'l34', title: { ja: 'ダイアトニック進行への組込み', en: 'Adding Tonicization to Diatonic Progressions' } },
      { id: 'l35', title: { ja: '副属和音と変化音', en: 'Secondary Dominants as Altered Diatonic' } },
      { id: 'l36', title: { ja: 'トニカイゼーション 総合演習 1', en: 'Tonicization — Practice 1' } },
      { id: 'l37', title: { ja: 'トニカイゼーション 総合演習 2', en: 'Tonicization — Practice 2' } },
      { id: 'l38', title: { ja: 'トニカイゼーション 総合演習 3', en: 'Tonicization — Practice 3' } },
      { id: 'l39', title: { ja: 'トニカイゼーション 総合演習 4', en: 'Tonicization — Practice 4' } },
      { id: 'l40', title: { ja: '拡張トニカイゼーション — 概念', en: 'Extended Tonicization — Concept' } },
      { id: 'l41', title: { ja: '近親調への転調 — 分析', en: 'Modulation to Closely Related Keys — Analysis' } },
      { id: 'l42', title: { ja: 'ピボット和音による転調', en: 'Modulation with Pivot Chords' } },
      { id: 'l43', title: { ja: 'トニカイゼーションと転調の境界', en: 'Tonicization vs Modulation' } },
      { id: 'l44', title: { ja: '平行調・同主調への転調', en: 'Modulation to Parallel/Relative Keys' } },
      { id: 'l45', title: { ja: '関係調 (V, vi, IV) への転調', en: 'Modulation to Related Keys (V, vi, IV)' } },
      { id: 'l46', title: { ja: '例題分析 — Bach コラール', en: 'Example Analysis — Bach Chorale' } },
      { id: 'l47', title: { ja: '例題分析 — Mozart ソナタ', en: 'Example Analysis — Mozart Sonata' } },
      { id: 'l48', title: { ja: '例題分析 — Beethoven ソナタ', en: 'Example Analysis — Beethoven Sonata' } },
      { id: 'l49', title: { ja: '例題分析 — Schubert 歌曲', en: 'Example Analysis — Schubert Lied' } },
      { id: 'l50', title: { ja: '例題分析 — Chopin 小品', en: 'Example Analysis — Chopin Miniature' } },
      { id: 'l51', title: { ja: '例題分析 — Brahms 歌曲', en: 'Example Analysis — Brahms Lied' } },
      { id: 'l52', title: { ja: '機能和声の総合 1 — 楽句構築', en: 'Diatonic Harmony Synthesis 1 — Phrase Construction' } },
      { id: 'l53', title: { ja: '機能和声の総合 2 — 転調を含む楽句', en: 'Synthesis 2 — Phrases with Modulation' } },
      { id: 'l54', title: { ja: '機能和声の総合 3 — 4 声体作曲', en: 'Synthesis 3 — Four-Voice Composition' } },
      { id: 'l55', title: { ja: 'M4 総合演習・M5 への橋渡し', en: 'M4 Summary and Bridge to M5' } },
    ],
  },
  {
    id: 'm5', num: 'M5',
    title: { ja: '半音階法', en: 'Chromaticism', es: 'Cromatismo', ko: '반음계법', pt: 'Cromatismo', de: 'Chromatik' },
    desc: { ja: 'モーダルミクスチャ・ナポリ・増六・共通音・ネオ・リーマン', en: 'Modal mixture, Neapolitan, augmented sixths, common-tone, neo-Riemannian.', es: 'Mezcla modal, napolitana, sextas aumentadas, neo-riemanniano.', ko: '모달 믹스처·나폴리탄·신리만.', pt: 'Mistura modal, napolitana, sextas aumentadas.', de: 'Modale Mischung, Neapolitaner, neoriemannianisch.' },
    lessonCount: 35, level: 'advanced',
    lessons: [
      { id: 'l01', title: { ja: 'モーダル・ミクスチャ — 概念', en: 'Modal Mixture — Concept' } },
      { id: 'l02', title: { ja: 'モーダル・ミクスチャ — 共通進行', en: 'Modal Mixture — Common Progressions' } },
      { id: 'l03', title: { ja: 'ピカルディの三度', en: 'Picardy Third' } },
      { id: 'l04', title: { ja: '大規模なモーダル・ミクスチャ', en: 'Large-Scale Modal Mixture' } },
      { id: 'l05', title: { ja: 'ナポリの 6 (♭II6) — 文脈', en: 'Neapolitan 6 — Context' } },
      { id: 'l06', title: { ja: 'ナポリの 6 — 声部進行と進行', en: 'Neapolitan 6 — Voice Leading' } },
      { id: 'l07', title: { ja: '増 6 度の和音 — 概観', en: 'Augmented 6th — Overview' } },
      { id: 'l08', title: { ja: '増 6 度 — 嘆きのバス進行との接続', en: 'Augmented 6th — Lament Bass' } },
      { id: 'l09', title: { ja: '増 6 度 — ドイツの減 3 度', en: 'Augmented 6th — German Diminished 3rd' } },
      { id: 'l10', title: { ja: '共通音和音 (CTo7) — 隣接音から導く', en: 'Common-Tone (CTo7) — From Neighbors' } },
      { id: 'l11', title: { ja: '共通音和音 — V7 への解決', en: 'Common-Tone — Resolution to V7' } },
      { id: 'l12', title: { ja: '共通音 +6 (CT+6)', en: 'Common-Tone +6 (CT+6)' } },
      { id: 'l13', title: { ja: '和声的省略 — 文脈', en: 'Harmonic Elision — Context' } },
      { id: 'l14', title: { ja: '和声的省略 — 上昇主音省略', en: 'Harmonic Elision — Raised-Root' } },
      { id: 'l15', title: { ja: '半音階的転調 — 概観', en: 'Chromatic Modulation — Overview' } },
      { id: 'l16', title: { ja: '減七和音の再解釈', en: 'Reinterpreting Diminished Sevenths' } },
      { id: 'l17', title: { ja: '増 6 度を主和音に再解釈', en: 'Reinterpreting Augmented 6ths' } },
      { id: 'l18', title: { ja: '増和音の選択肢', en: 'Augmented Options' } },
      { id: 'l19', title: { ja: 'オクターブの等分割', en: 'Equal Divisions of the Octave' } },
      { id: 'l20', title: { ja: '半音階シークェンス — 下降 5 度', en: 'Chromatic Sequence — Descending 5ths' } },
      { id: 'l21', title: { ja: '半音階シークェンス — 上昇 5-6', en: 'Chromatic Sequence — Ascending 5-6' } },
      { id: 'l22', title: { ja: '半音階シークェンス — 下降 5-6', en: 'Chromatic Sequence — Descending 5-6' } },
      { id: 'l23', title: { ja: '平行 6/3 和音', en: 'Parallel 6/3 Chords' } },
      { id: 'l24', title: { ja: '平行属和音', en: 'Parallel Dominant Chords' } },
      { id: 'l25', title: { ja: '平行増三和音', en: 'Parallel Augmented Triads' } },
      { id: 'l26', title: { ja: 'オムニバス進行', en: 'The Omnibus Progression' } },
      { id: 'l27', title: { ja: '変化された属和音', en: 'Altered Dominant Chords' } },
      { id: 'l28', title: { ja: '拡張された属和音 (V9, V11, V13)', en: 'Extended Dominants (V9, V11, V13)' } },
      { id: 'l29', title: { ja: 'ネオ・リーマン理論 — 概念', en: 'Neo-Riemannian Theory — Concept' } },
      { id: 'l30', title: { ja: 'P, L, R 変換', en: 'P, L, R Transformations' } },
      { id: 'l31', title: { ja: 'トンネッツ', en: 'The Tonnetz' } },
      { id: 'l32', title: { ja: '変換の連鎖と循環', en: 'Chains and Cycles of Transformations' } },
      { id: 'l33', title: { ja: 'その他の変換', en: 'Other Transformations' } },
      { id: 'l34', title: { ja: 'ネオ・リーマン・ネットワーク分析', en: 'Neo-Riemannian Network Analysis' } },
      { id: 'l35', title: { ja: 'M5 総合演習・M6 への橋渡し', en: 'M5 Summary and Bridge to M6' } },
    ],
  },
  {
    id: 'm6', num: 'M6',
    title: { ja: 'ジャズ理論', en: 'Jazz', es: 'Jazz', ko: '재즈 이론', pt: 'Jazz', de: 'Jazz' },
    desc: { ja: 'スウィング・ヴォイシング・ii-V-I・コード・スケール・ブルース', en: 'Swing, voicings, ii-V-I, chord-scales, blues.', es: 'Swing, voicings, ii-V-I, escalas-acorde, blues.', ko: '스윙·보이싱·ii-V-I·블루스.', pt: 'Swing, voicings, ii-V-I, blues.', de: 'Swing, Voicings, ii-V-I, Bluestonleiter.' },
    lessonCount: 35, level: 'advanced',
    lessons: [
      { id: 'l01', title: { ja: 'スウィング・リズム — 基本グルーヴ', en: 'Swing Rhythms — Basic Groove' } },
      { id: 'l02', title: { ja: 'スウィング — シンコペーション', en: 'Swing — Syncopation' } },
      { id: 'l03', title: { ja: 'コードシンボル — 基礎', en: 'Chord Symbols — Basics' } },
      { id: 'l04', title: { ja: 'コードシンボル — 拡張音', en: 'Chord Symbols — Extensions' } },
      { id: 'l05', title: { ja: 'コードシンボル — add, sus', en: 'Chord Symbols — add, sus' } },
      { id: 'l06', title: { ja: 'コードシンボル vs ローマ数字', en: 'Chord Symbols vs Roman Numerals' } },
      { id: 'l07', title: { ja: 'ジャズ・ヴォイシング — 配置', en: 'Jazz Voicings — Spacing' } },
      { id: 'l08', title: { ja: 'ジャズ・ヴォイシング — 倍音と省略', en: 'Jazz Voicings — Doubling and Omitting' } },
      { id: 'l09', title: { ja: 'ジャズ・ヴォイシング — 滑らかな声部進行', en: 'Jazz Voicings — Smooth Voice Leading' } },
      { id: 'l10', title: { ja: 'ジャズ・ヴォイシング — パラダイム', en: 'Jazz Voicings — Paradigms' } },
      { id: 'l11', title: { ja: 'ii-V-I — 基本スキーマ', en: 'ii-V-I — Basic Schema' } },
      { id: 'l12', title: { ja: 'ii-V-I — 副 ii-V', en: 'ii-V-I — Applied ii-Vs' } },
      { id: 'l13', title: { ja: 'ii-V-I — ターンアラウンド', en: 'ii-V-I — Turnarounds' } },
      { id: 'l14', title: { ja: '装飾和音 — 副和音の装飾', en: 'Embellishing Chords — Applied' } },
      { id: 'l15', title: { ja: '装飾和音 — 共通音減七', en: 'Embellishing — Common-Tone Diminished 7' } },
      { id: 'l16', title: { ja: '装飾和音 — リードシートでの読み', en: 'Embellishing in Lead Sheets' } },
      { id: 'l17', title: { ja: '代理 — 副和音による代理', en: 'Substitutions — Applied Chord' } },
      { id: 'l18', title: { ja: '代理 — モード・ミクスチャ', en: 'Substitutions — Mode Mixture' } },
      { id: 'l19', title: { ja: '代理 — トライトーン代理', en: 'Substitutions — Tritone' } },
      { id: 'l20', title: { ja: '代理 — リードシート分析', en: 'Substitutions in Lead Sheets' } },
      { id: 'l21', title: { ja: 'コード・スケール理論 — 基本対応', en: 'Chord-Scale Theory — Basics' } },
      { id: 'l22', title: { ja: 'コード・スケール — 長調キー', en: 'Chord-Scales in Major Keys' } },
      { id: 'l23', title: { ja: 'コード・スケール — 進行への適用', en: 'Chord-Scales Applied to Progressions' } },
      { id: 'l24', title: { ja: 'コード・スケール理論の限界', en: 'Limitations of Chord-Scale Theory' } },
      { id: 'l25', title: { ja: 'ブルース和声 — 12 小節ブルース', en: 'Blues Harmony — 12-Bar' } },
      { id: 'l26', title: { ja: 'ジャズ・ブルース', en: 'Jazz Blues' } },
      { id: 'l27', title: { ja: 'ブルースのバリエーション', en: 'Blues Variations' } },
      { id: 'l28', title: { ja: 'ブルース旋律 — 楽句と歌詞構造', en: 'Blues Melodies — Phrase and Lyrics' } },
      { id: 'l29', title: { ja: 'ブルース・スケール', en: 'The Blues Scale' } },
      { id: 'l30', title: { ja: 'ジャズ・スタンダード分析 1 — 「枯葉」', en: 'Standard Analysis 1 — Autumn Leaves' } },
      { id: 'l31', title: { ja: 'ジャズ・スタンダード分析 2 — 「枯葉」続き', en: 'Standard Analysis 2 — Autumn Leaves Cont.' } },
      { id: 'l32', title: { ja: 'ジャズ・スタンダード分析 3 — Coltrane', en: 'Standard Analysis 3 — Coltrane' } },
      { id: 'l33', title: { ja: 'ジャズ・スタンダード分析 4 — Bill Evans', en: 'Standard Analysis 4 — Bill Evans' } },
      { id: 'l34', title: { ja: 'ジャズ・スタンダード分析 5 — Wayne Shorter', en: 'Standard Analysis 5 — Wayne Shorter' } },
      { id: 'l35', title: { ja: 'M6 総合演習・M7 への橋渡し', en: 'M6 Summary and Bridge to M7' } },
    ],
  },
  {
    id: 'm7', num: 'M7',
    title: { ja: 'ポピュラー音楽理論', en: 'Popular Music', es: 'Música popular', ko: '팝 음악 이론', pt: 'Música popular', de: 'Popmusik' },
    desc: { ja: 'ポップ和声スキーマ・Doo-wop・AABA・Verse-Chorus', en: 'Pop schemas, doo-wop, AABA, verse-chorus, modal.', es: 'Esquemas pop, doo-wop, AABA, modal.', ko: '팝 화성·두왑·AABA.', pt: 'Esquemas pop, doo-wop, AABA, modal.', de: 'Pop-Harmonik, Doo-Wop, AABA, modal.' },
    lessonCount: 30, level: 'advanced',
    lessons: [
      { id: 'l01', title: { ja: 'ポップのリズム・拍子 — ストレート・シンコペーション', en: 'Pop Rhythm — Straight Syncopation' } },
      { id: 'l02', title: { ja: 'トレシージョ', en: 'Tresillo' } },
      { id: 'l03', title: { ja: '旋律と楽句 — 2 部構成', en: 'Melody and Phrasing — Two-Part' } },
      { id: 'l04', title: { ja: '旋律と楽句 — 3 部構成', en: 'Melody and Phrasing — Three-Part' } },
      { id: 'l05', title: { ja: '旋律と楽句 — 4 部構成', en: 'Melody and Phrasing — Four-Part' } },
      { id: 'l06', title: { ja: 'ポップ形式 — セクションと用語', en: 'Pop Form — Sections and Terminology' } },
      { id: 'l07', title: { ja: 'ポップ形式 — 分析記法', en: 'Pop Form — Analytical Notation' } },
      { id: 'l08', title: { ja: 'ストロフィック形式', en: 'Strophic Form' } },
      { id: 'l09', title: { ja: 'AABA (32 小節歌曲)', en: '32-Bar Song Form (AABA)' } },
      { id: 'l10', title: { ja: 'AABA — リフレイン', en: 'AABA — Refrains' } },
      { id: 'l11', title: { ja: 'ヴァース・コーラス形式 — 構造', en: 'Verse-Chorus — Structure' } },
      { id: 'l12', title: { ja: 'ヴァース・コーラス — 際立つ歌詞', en: 'Verse-Chorus — Standout Lyrics' } },
      { id: 'l13', title: { ja: 'ポップの和声スキーマ — 概観', en: 'Pop Harmonic Schemas — Overview' } },
      { id: 'l14', title: { ja: 'ブルース系スキーマ — プラガル進行', en: 'Blues Schemas — Plagal Motion' } },
      { id: 'l15', title: { ja: 'ブルース系スキーマ — マイナー iv', en: 'Blues Schemas — Minor iv' } },
      { id: 'l16', title: { ja: 'ブルース系スキーマ — ダブル/拡張プラガル', en: 'Blues Schemas — Double/Extended Plagal' } },
      { id: 'l17', title: { ja: '4 コード・スキーマ — Doo-wop', en: 'Four-Chord — Doo-wop' } },
      { id: 'l18', title: { ja: '4 コード・スキーマ — シンガーソングライター', en: 'Four-Chord — Singer/Songwriter' } },
      { id: 'l19', title: { ja: '4 コード・スキーマ — Hopscotch', en: 'Four-Chord — Hopscotch' } },
      { id: 'l20', title: { ja: '4 コード・スキーマ — 耳での識別', en: 'Four-Chord — Recognizing by Ear' } },
      { id: 'l21', title: { ja: 'クラシカル・スキーマ — Lament', en: 'Classical Schemas — Lament' } },
      { id: 'l22', title: { ja: 'クラシカル・スキーマ — 5 度循環', en: 'Classical Schemas — Circle of Fifths' } },
      { id: 'l23', title: { ja: 'Puff スキーマ — I-III♯-IV', en: 'Puff Schemas — I-III♯-IV' } },
      { id: 'l24', title: { ja: 'Puff スキーマ — III♯-IV を偽終止として', en: 'Puff — Deceptive Motion' } },
      { id: 'l25', title: { ja: 'モーダル・スキーマ — ミクソリディアン', en: 'Modal — Mixolydian' } },
      { id: 'l26', title: { ja: 'モーダル・スキーマ — エオリアン', en: 'Modal — Aeolian' } },
      { id: 'l27', title: { ja: 'モーダル・スキーマ — ドリアン・リディアン', en: 'Modal — Dorian, Lydian' } },
      { id: 'l28', title: { ja: 'ペンタトニック和声', en: 'Pentatonic Harmony' } },
      { id: 'l29', title: { ja: '脆弱・不在・湧出するトニック', en: 'Fragile, Absent, Emergent Tonics' } },
      { id: 'l30', title: { ja: 'M7 総合演習・M8 への橋渡し', en: 'M7 Summary and Bridge to M8' } },
    ],
  },
  {
    id: 'm8', num: 'M8',
    title: { ja: '20-21 世紀の技法', en: '20th/21st Century', es: 'Técnicas s. XX-XXI', ko: '20-21세기 기법', pt: 'Técnicas séc. XX-XXI', de: 'Techniken 20./21. Jh.' },
    desc: { ja: 'ピッチクラス集合論・整数表記・Forte 番号・教会旋法', en: 'Pitch-class set theory, integer notation, Forte numbers, church modes.', es: 'Teoría de conjuntos, notación entera, modos eclesiásticos.', ko: '피치 클래스 집합론·교회 선법.', pt: 'Teoria de conjuntos, modos eclesiásticos.', de: 'Tonklassenmengen, Forte-Nummern, Kirchentonarten.' },
    lessonCount: 25, level: 'graduate',
    lessons: [
      { id: 'l01', title: { ja: 'ピッチ vs ピッチクラス', en: 'Pitch vs Pitch Class' } },
      { id: 'l02', title: { ja: '整数表記 (integer notation)', en: 'Integer Notation' } },
      { id: 'l03', title: { ja: '整数表記の音程 — 順序付き/順序なし', en: 'Pitch Intervals — Ordered/Unordered' } },
      { id: 'l04', title: { ja: 'インターバル・クラス (IC)', en: 'Interval Classes (IC)' } },
      { id: 'l05', title: { ja: 'ピッチクラス集合 — 概念', en: 'Pitch-Class Sets — Concept' } },
      { id: 'l06', title: { ja: 'ノーマル・オーダー', en: 'Normal Order' } },
      { id: 'l07', title: { ja: '移調 (Tn)', en: 'Transposition (Tn)' } },
      { id: 'l08', title: { ja: '反転 (TnI)', en: 'Inversion (TnI)' } },
      { id: 'l09', title: { ja: '時計面を使った移調・反転', en: 'Clock Face for Transposition/Inversion' } },
      { id: 'l10', title: { ja: '集合クラス', en: 'Set Class' } },
      { id: 'l11', title: { ja: 'プライム・フォーム', en: 'Prime Form' } },
      { id: 'l12', title: { ja: '集合クラス表', en: 'The Set Class Table' } },
      { id: 'l13', title: { ja: '集合論で分析する — 分節', en: 'Set Theory Analysis — Segmentation' } },
      { id: 'l14', title: { ja: '集合間の関係', en: 'Relationships Between Sets' } },
      { id: 'l15', title: { ja: '集合論の限界', en: 'Limitations of Set Theory' } },
      { id: 'l16', title: { ja: '教会旋法 (再訪)', en: 'Church Modes Revisited' } },
      { id: 'l17', title: { ja: '20-21 世紀の旋法', en: 'Modes in 20th-21st Century' } },
      { id: 'l18', title: { ja: 'グローバル・モード', en: 'Modes in Global Context' } },
      { id: 'l19', title: { ja: 'コレクション — ダイアトニック・パンダイアトニック', en: 'Collections — Diatonic, Pandiatonic' } },
      { id: 'l20', title: { ja: 'コレクション — ペンタトニック・全音音階', en: 'Collections — Pentatonic, Whole-Tone' } },
      { id: 'l21', title: { ja: 'コレクション — 八音音階', en: 'Collections — Octatonic' } },
      { id: 'l22', title: { ja: 'コレクション — ヘキサトニック', en: 'Collections — Hexatonic' } },
      { id: 'l23', title: { ja: 'コレクション — アコースティック', en: 'Collections — Acoustic' } },
      { id: 'l24', title: { ja: '旋法・スケール・コレクションで分析', en: 'Analyzing with Modes/Scales/Collections' } },
      { id: 'l25', title: { ja: 'M8 総合演習・M9 への橋渡し', en: 'M8 Summary and Bridge to M9' } },
    ],
  },
  {
    id: 'm9', num: 'M9',
    title: { ja: '12 音音楽', en: 'Twelve-Tone', es: 'Dodecafonía', ko: '12음 기법', pt: 'Dodecafonia', de: 'Zwölftonmusik' },
    desc: { ja: '12 音技法・行操作・マトリックス・ヴェーベルン分析', en: 'Twelve-tone, row operations, matrices, Webern analysis.', es: 'Dodecafonismo, operaciones de serie, Webern.', ko: '12음·매트릭스·베베른.', pt: 'Dodecafonia, matrizes, Webern.', de: 'Zwölftontechnik, Matrizen, Webern.' },
    lessonCount: 18, level: 'graduate',
    lessons: [
      { id: 'l01', title: { ja: '12 音理論の基礎 — 行', en: 'Twelve-Tone Basics — Rows' } },
      { id: 'l02', title: { ja: '行操作 (P, R, I, RI)', en: 'Row Operations (P, R, I, RI)' } },
      { id: 'l03', title: { ja: 'マトリックス', en: 'The Matrix' } },
      { id: 'l04', title: { ja: '理論から実践へ', en: 'From Theory to Practice' } },
      { id: 'l05', title: { ja: '行の命名規則 — ピッチ', en: 'Naming Conventions — Pitch' } },
      { id: 'l06', title: { ja: '行の命名規則 — マトリックス', en: 'Naming Conventions — Matrices' } },
      { id: 'l07', title: { ja: '行の特性 — 重なる分節', en: 'Row Properties — Overlapping Segments' } },
      { id: 'l08', title: { ja: '全インターバル行', en: 'The All-Interval Row' } },
      { id: 'l09', title: { ja: '派生行 (derived rows)', en: 'Derived Rows' } },
      { id: 'l10', title: { ja: '分節的不変性', en: 'Segmental Invariance' } },
      { id: 'l11', title: { ja: 'ヘキサコード・部分順序集合', en: 'Hexachords and Partially-Ordered Sets' } },
      { id: 'l12', title: { ja: '分析 — Webern Op. 21 (1928)', en: 'Analysis — Webern Op. 21' } },
      { id: 'l13', title: { ja: '分析 — Webern Op. 24 (1934)', en: 'Analysis — Webern Op. 24' } },
      { id: 'l14', title: { ja: '12 音で作曲 — 行の選択', en: 'Composing with Twelve Tones — Choosing Rows' } },
      { id: 'l15', title: { ja: '12 音作曲例 1', en: 'Twelve-Tone Composition Example 1' } },
      { id: 'l16', title: { ja: '12 音作曲例 2', en: 'Twelve-Tone Composition Example 2' } },
      { id: 'l17', title: { ja: 'セリアリズムの歴史と背景', en: 'History and Context of Serialism' } },
      { id: 'l18', title: { ja: 'M9 総合演習・M10 への橋渡し', en: 'M9 Summary and Bridge to M10' } },
    ],
  },
  {
    id: 'm10', num: 'M10',
    title: { ja: 'オーケストレーション', en: 'Orchestration', es: 'Orquestación', ko: '오케스트레이션', pt: 'Orquestração', de: 'Orchestration' },
    desc: { ja: 'オーケストレーションの核心原則・音色変化・ピアノからの編曲', en: 'Core orchestration principles, timbral change, arranging from piano.', es: 'Principios de orquestación, arreglo desde piano.', ko: '오케스트레이션 핵심·피아노 편곡.', pt: 'Princípios de orquestração, arranjo do piano.', de: 'Orchestrierung Kernprinzipien, Klavierübertragung.' },
    lessonCount: 15, level: 'advanced',
    lessons: [
      { id: 'l01', title: { ja: 'オーケストレーション核心原則 — 縦の組合せ', en: 'Core Principles — Vertical Combinations' } },
      { id: 'l02', title: { ja: 'オーケストレーション核心原則 — 横の組合せ', en: 'Core Principles — Horizontal Combinations' } },
      { id: 'l03', title: { ja: '微妙な音色変化 — 音色的カデンツ', en: 'Subtle Color — Timbral Cadence' } },
      { id: 'l04', title: { ja: '微妙な音色変化 — 構造境界の整え方', en: 'Subtle Color — Structural Boundaries' } },
      { id: 'l05', title: { ja: '微妙な音色変化 — アタック・サステイン (共鳴) 効果', en: 'Subtle Color — Attack-Sustain Resonance' } },
      { id: 'l06', title: { ja: '微妙な音色変化 — 滑らかなクレッシェンド', en: 'Subtle Color — Seamless Crescendo' } },
      { id: 'l07', title: { ja: '微妙な音色変化 — 音色的に陰影を付けた旋律', en: 'Subtle Color — Timbral Nuances in Melody' } },
      { id: 'l08', title: { ja: 'ピアノからの編曲 — 基本原則', en: 'Transcription from Piano — Basic Principles' } },
      { id: 'l09', title: { ja: 'ピアノからの編曲 — 譜例研究 1 (Schubert)', en: 'Transcription Case Study 1 — Schubert' } },
      { id: 'l10', title: { ja: 'ピアノからの編曲 — 譜例研究 2 (Brahms)', en: 'Transcription Case Study 2 — Brahms' } },
      { id: 'l11', title: { ja: 'ピアノからの編曲 — 譜例研究 3 (Debussy)', en: 'Transcription Case Study 3 — Debussy' } },
      { id: 'l12', title: { ja: '弦楽器のオーケストレーション', en: 'Orchestrating Strings' } },
      { id: 'l13', title: { ja: '木管楽器のオーケストレーション', en: 'Orchestrating Woodwinds' } },
      { id: 'l14', title: { ja: '金管楽器・打楽器のオーケストレーション', en: 'Orchestrating Brass and Percussion' } },
      { id: 'l15', title: { ja: 'M10 総合演習・編曲課題', en: 'M10 Summary — Arrangement Project' } },
    ],
  },
  {
    id: 'm11', num: 'M11',
    title: { ja: 'コールユーブンゲンと聴音', en: 'Coleübungen & Ear Training', es: 'Coleübungen y entrenamiento auditivo', ko: '콜러뷔붕겐과 청음', pt: 'Coleübungen e percepção', de: 'Coleübungen & Gehörbildung' },
    desc: { ja: 'コールユーブンゲン全 87 番完全インタラクティブ化・聴音・内的聴覚訓練', en: 'All 87 Coleübungen interactively. Dictation, inner hearing.', es: 'Las 87 Coleübungen interactivas, dictado, audición interna.', ko: '콜러뷔붕겐 전 87번·청음·내적 청각.', pt: 'As 87 Coleübungen interativas, ditado, audição interna.', de: 'Alle 87 Coleübungen interaktiv, Diktat.' },
    lessonCount: 90, level: 'foundation',
    lessons: [
      { id: 'l01', title: { ja: 'コールユーブンゲン序論 — 視唱の哲学', en: 'Coleübungen Intro — Philosophy of Sight-Singing' } },
      { id: 'l02', title: { ja: 'コールユーブンゲン No.1-5', en: 'Coleübungen No.1-5' } },
      { id: 'l03', title: { ja: 'コールユーブンゲン No.6-10', en: 'Coleübungen No.6-10' } },
      { id: 'l04', title: { ja: 'コールユーブンゲン No.11-15', en: 'Coleübungen No.11-15' } },
      { id: 'l05', title: { ja: 'コールユーブンゲン No.16-20', en: 'Coleübungen No.16-20' } },
      { id: 'l06', title: { ja: 'コールユーブンゲン No.21-25', en: 'Coleübungen No.21-25' } },
      { id: 'l07', title: { ja: 'コールユーブンゲン No.26-30', en: 'Coleübungen No.26-30' } },
      { id: 'l08', title: { ja: 'コールユーブンゲン No.31-35', en: 'Coleübungen No.31-35' } },
      { id: 'l09', title: { ja: 'コールユーブンゲン No.36-40', en: 'Coleübungen No.36-40' } },
      { id: 'l10', title: { ja: 'コールユーブンゲン No.41-45', en: 'Coleübungen No.41-45' } },
      { id: 'l11', title: { ja: 'コールユーブンゲン No.46-50', en: 'Coleübungen No.46-50' } },
      { id: 'l12', title: { ja: 'コールユーブンゲン No.51-55', en: 'Coleübungen No.51-55' } },
      { id: 'l13', title: { ja: 'コールユーブンゲン No.56-60', en: 'Coleübungen No.56-60' } },
      { id: 'l14', title: { ja: 'コールユーブンゲン No.61-65', en: 'Coleübungen No.61-65' } },
      { id: 'l15', title: { ja: 'コールユーブンゲン No.66-70', en: 'Coleübungen No.66-70' } },
      { id: 'l16', title: { ja: 'コールユーブンゲン No.71-75', en: 'Coleübungen No.71-75' } },
      { id: 'l17', title: { ja: 'コールユーブンゲン No.76-80', en: 'Coleübungen No.76-80' } },
      { id: 'l18', title: { ja: 'コールユーブンゲン No.81-87 (完結)', en: 'Coleübungen No.81-87 (Final)' } },
      { id: 'l19', title: { ja: '音程聴音 — 純粋音程 (P5, P4, P8)', en: 'Interval Dictation — Perfect Intervals' } },
      { id: 'l20', title: { ja: '音程聴音 — 長/短 3 度', en: 'Interval Dictation — Major/Minor 3rds' } },
      { id: 'l21', title: { ja: '音程聴音 — 長/短 6 度', en: 'Interval Dictation — Major/Minor 6ths' } },
      { id: 'l22', title: { ja: '音程聴音 — 長/短 2 度', en: 'Interval Dictation — Major/Minor 2nds' } },
      { id: 'l23', title: { ja: '音程聴音 — 長/短 7 度', en: 'Interval Dictation — Major/Minor 7ths' } },
      { id: 'l24', title: { ja: '音程聴音 — 増 4 度・減 5 度 (トライトーン)', en: 'Interval Dictation — Tritone' } },
      { id: 'l25', title: { ja: '音程聴音 — 上行・下行・両方向', en: 'Interval Dictation — Asc/Desc/Both' } },
      { id: 'l26', title: { ja: '音程聴音 — 隣接音とジャンプ音', en: 'Interval Dictation — Stepwise vs Leaps' } },
      { id: 'l27', title: { ja: '音程聴音 総合演習', en: 'Interval Dictation — Practice' } },
      { id: 'l28', title: { ja: '和音聴音 — 長三和音', en: 'Chord Dictation — Major Triad' } },
      { id: 'l29', title: { ja: '和音聴音 — 短三和音', en: 'Chord Dictation — Minor Triad' } },
      { id: 'l30', title: { ja: '和音聴音 — 増三和音', en: 'Chord Dictation — Augmented Triad' } },
      { id: 'l31', title: { ja: '和音聴音 — 減三和音', en: 'Chord Dictation — Diminished Triad' } },
      { id: 'l32', title: { ja: '和音聴音 — 4 種の三和音識別', en: 'Chord Dictation — Identifying 4 Triads' } },
      { id: 'l33', title: { ja: '和音聴音 — 七の和音 (V7, ii7, iv7 等)', en: 'Chord Dictation — Seventh Chords' } },
      { id: 'l34', title: { ja: '和音聴音 — 転回形の識別', en: 'Chord Dictation — Identifying Inversions' } },
      { id: 'l35', title: { ja: '和音聴音 総合演習', en: 'Chord Dictation — Practice' } },
      { id: 'l36', title: { ja: 'カデンツ聴音 — 完全終止 (PAC)', en: 'Cadence Dictation — PAC' } },
      { id: 'l37', title: { ja: 'カデンツ聴音 — 不完全終止 (IAC)', en: 'Cadence Dictation — IAC' } },
      { id: 'l38', title: { ja: 'カデンツ聴音 — 半終止 (HC)', en: 'Cadence Dictation — Half Cadence' } },
      { id: 'l39', title: { ja: 'カデンツ聴音 — 偽終止', en: 'Cadence Dictation — Deceptive' } },
      { id: 'l40', title: { ja: 'カデンツ聴音 — 4 種総合', en: 'Cadence Dictation — Practice' } },
      { id: 'l41', title: { ja: 'リズム聴音 — 単純拍子 4 小節', en: 'Rhythm Dictation — Simple Meter 4 Bars' } },
      { id: 'l42', title: { ja: 'リズム聴音 — 複合拍子 4 小節', en: 'Rhythm Dictation — Compound 4 Bars' } },
      { id: 'l43', title: { ja: 'リズム聴音 — 付点・タイ含む', en: 'Rhythm Dictation — Dots and Ties' } },
      { id: 'l44', title: { ja: 'リズム聴音 — シンコペーション含む', en: 'Rhythm Dictation — Syncopation' } },
      { id: 'l45', title: { ja: 'リズム聴音 — 三連符・五連符', en: 'Rhythm Dictation — Triplets/Quintuplets' } },
      { id: 'l46', title: { ja: 'リズム聴音 — 8 小節への拡張', en: 'Rhythm Dictation — 8 Bars' } },
      { id: 'l47', title: { ja: 'リズム聴音 総合演習', en: 'Rhythm Dictation — Practice' } },
      { id: 'l48', title: { ja: '旋律聴音 — 長調・4 小節', en: 'Melodic Dictation — Major 4 Bars' } },
      { id: 'l49', title: { ja: '旋律聴音 — 短調・4 小節', en: 'Melodic Dictation — Minor 4 Bars' } },
      { id: 'l50', title: { ja: '旋律聴音 — 跳躍を含む', en: 'Melodic Dictation — With Leaps' } },
      { id: 'l51', title: { ja: '旋律聴音 — 半音階を含む', en: 'Melodic Dictation — Chromatic' } },
      { id: 'l52', title: { ja: '旋律聴音 — 8 小節', en: 'Melodic Dictation — 8 Bars' } },
      { id: 'l53', title: { ja: '旋律聴音 — 16 小節', en: 'Melodic Dictation — 16 Bars' } },
      { id: 'l54', title: { ja: '旋律聴音 — 転調を含む', en: 'Melodic Dictation — With Modulation' } },
      { id: 'l55', title: { ja: '旋律聴音 総合演習', en: 'Melodic Dictation — Practice' } },
      { id: 'l56', title: { ja: '和声聴音 — I-IV-V-I 進行', en: 'Harmonic Dictation — I-IV-V-I' } },
      { id: 'l57', title: { ja: '和声聴音 — I-vi-IV-V (Doo-wop)', en: 'Harmonic Dictation — I-vi-IV-V' } },
      { id: 'l58', title: { ja: '和声聴音 — ii-V-I (ジャズ)', en: 'Harmonic Dictation — ii-V-I' } },
      { id: 'l59', title: { ja: '和声聴音 — 借用和音を含む', en: 'Harmonic Dictation — With Borrowed Chords' } },
      { id: 'l60', title: { ja: '和声聴音 — 副属和音を含む', en: 'Harmonic Dictation — With Secondary Dominants' } },
      { id: 'l61', title: { ja: '和声聴音 — 偽終止を含む', en: 'Harmonic Dictation — With Deceptive' } },
      { id: 'l62', title: { ja: '和声聴音 — 転調を含む', en: 'Harmonic Dictation — With Modulation' } },
      { id: 'l63', title: { ja: '和声聴音 総合演習', en: 'Harmonic Dictation — Practice' } },
      { id: 'l64', title: { ja: '4 声聴音 — SATB 短い楽句', en: '4-Voice Dictation — Short SATB Phrase' } },
      { id: 'l65', title: { ja: '4 声聴音 — Bach コラール風 4 小節', en: '4-Voice Dictation — Bach-style 4 Bars' } },
      { id: 'l66', title: { ja: '4 声聴音 — Bach コラール風 8 小節', en: '4-Voice Dictation — Bach-style 8 Bars' } },
      { id: 'l67', title: { ja: '4 声聴音 — 全声部書き取り', en: '4-Voice Dictation — All Voices' } },
      { id: 'l68', title: { ja: '4 声聴音 総合演習', en: '4-Voice Dictation — Practice' } },
      { id: 'l69', title: { ja: '移調聴音 — シ♭ クラリネット', en: 'Transposed Dictation — B♭ Clarinet' } },
      { id: 'l70', title: { ja: '移調聴音 — ファ ホルン', en: 'Transposed Dictation — F Horn' } },
      { id: 'l71', title: { ja: '移調聴音 — その他の移調楽器', en: 'Transposed Dictation — Other Instruments' } },
      { id: 'l72', title: { ja: '内的聴覚訓練 — 譜面を見て歌わずに聴く', en: 'Inner Hearing — Read Without Singing' } },
      { id: 'l73', title: { ja: '内的聴覚訓練 — 旋律を頭の中で完成させる', en: 'Inner Hearing — Complete Melodies Mentally' } },
      { id: 'l74', title: { ja: '内的聴覚訓練 — 和声を頭の中で組み立てる', en: 'Inner Hearing — Build Harmony Mentally' } },
      { id: 'l75', title: { ja: '内的聴覚訓練 — 楽譜から実演奏を予測', en: 'Inner Hearing — Predict from Score' } },
      { id: 'l76', title: { ja: '模擬入試対策 1 — 東京藝大 過去問風', en: 'Mock Exam 1 — Tokyo Geidai Style' } },
      { id: 'l77', title: { ja: '模擬入試対策 2 — 東京藝大 過去問風', en: 'Mock Exam 2 — Tokyo Geidai Style' } },
      { id: 'l78', title: { ja: '模擬入試対策 3 — 桐朋学園 過去問風', en: 'Mock Exam 3 — Toho Gakuen Style' } },
      { id: 'l79', title: { ja: '模擬入試対策 4 — 国立音大 過去問風', en: 'Mock Exam 4 — Kunitachi Style' } },
      { id: 'l80', title: { ja: '模擬入試対策 5 — 武蔵野音大 過去問風', en: 'Mock Exam 5 — Musashino Style' } },
      { id: 'l81', title: { ja: '模擬入試対策 6 — ABRSM Grade 8 風', en: 'Mock Exam 6 — ABRSM Grade 8' } },
      { id: 'l82', title: { ja: '模擬入試対策 7 — AP Music Theory 風', en: 'Mock Exam 7 — AP Music Theory' } },
      { id: 'l83', title: { ja: '模擬入試対策 8 — Berklee オーディション風', en: 'Mock Exam 8 — Berklee Audition' } },
      { id: 'l84', title: { ja: '模擬入試対策 9 — Conservatoire de Paris 風', en: 'Mock Exam 9 — Paris Conservatoire' } },
      { id: 'l85', title: { ja: '模擬入試対策 10 — Berlin Hochschule 風', en: 'Mock Exam 10 — Berlin Hochschule' } },
      { id: 'l86', title: { ja: '模擬入試対策 11 — 韓国芸術総合学校 風', en: 'Mock Exam 11 — Korea Nat\'l University of Arts' } },
      { id: 'l87', title: { ja: '模擬入試対策 12 — 中央音楽学院北京 風', en: 'Mock Exam 12 — Central Conservatory Beijing' } },
      { id: 'l88', title: { ja: '模擬入試対策 13 — Juilliard 風', en: 'Mock Exam 13 — Juilliard' } },
      { id: 'l89', title: { ja: '模擬入試対策 14 — Manhattan School 風', en: 'Mock Exam 14 — Manhattan School' } },
      { id: 'l90', title: { ja: 'M11 総合演習・聴覚力認定試験', en: 'M11 Summary — Aural Skills Certification' } },
    ],
  },
  {
    id: 'm12', num: 'M12',
    title: { ja: 'ソルフェージュと視唱', en: 'Solfège & Sight Singing', es: 'Solfeo y lectura cantada', ko: '솔페지오와 시창', pt: 'Solfejo e leitura cantada', de: 'Solfège & Blattsingen' },
    desc: { ja: '階名唱法 (移動ド・固定ド両対応)・Pozzoli・Bona・コダーイ', en: 'Solfège (movable & fixed do). Pozzoli, Bona, Hindemith, Kodály.', es: 'Solfeo (do móvil y fijo). Pozzoli, Kodály.', ko: '솔페지오 (이동도·고정도). 포졸리·코다이.', pt: 'Solfejo (dó móvel e fixo). Pozzoli, Kodály.', de: 'Solmisation (bewegliches/festes do). Pozzoli, Kodály.' },
    lessonCount: 70, level: 'intermediate',
    lessons: [
      { id: 'l01', title: { ja: 'ソルフェージュ序論 — 移動ドと固定ド', en: 'Intro to Solfège — Movable vs Fixed Do' } },
      { id: 'l02', title: { ja: '移動ドの哲学 — 機能関係を歌う', en: 'Philosophy of Movable Do — Singing Function' } },
      { id: 'l03', title: { ja: '固定ドの哲学 — 絶対音名を歌う', en: 'Philosophy of Fixed Do — Singing Absolute Names' } },
      { id: 'l04', title: { ja: '長調の階名 (do-re-mi-fa-sol-la-ti)', en: 'Major Scale Solfège Syllables' } },
      { id: 'l05', title: { ja: '短調の階名 (la-based)', en: 'Minor Scale Solfège (la-based)' } },
      { id: 'l06', title: { ja: '半音階の階名 (di, ri, fi, si, li, te, le)', en: 'Chromatic Solfège Syllables' } },
      { id: 'l07', title: { ja: 'コダーイ・ハンドサイン', en: 'Kodály Hand Signs' } },
      { id: 'l08', title: { ja: '初歩の音程 — 順次進行', en: 'Beginning Intervals — Stepwise' } },
      { id: 'l09', title: { ja: '初歩の音程 — 3 度', en: 'Beginning Intervals — Thirds' } },
      { id: 'l10', title: { ja: '初歩の音程 — 4 度・5 度', en: 'Beginning Intervals — 4ths and 5ths' } },
      { id: 'l11', title: { ja: '主和音のアルペジオ視唱', en: 'Tonic Triad Arpeggio Sight-Singing' } },
      { id: 'l12', title: { ja: '属和音のアルペジオ視唱', en: 'Dominant Triad Arpeggio Sight-Singing' } },
      { id: 'l13', title: { ja: '下属和音のアルペジオ視唱', en: 'Subdominant Triad Arpeggio Sight-Singing' } },
      { id: 'l14', title: { ja: 'I-IV-V-I 進行を歌う', en: 'Singing I-IV-V-I Progressions' } },
      { id: 'l15', title: { ja: '長調の旋律 — 4 小節', en: 'Major Melodies — 4 Bars' } },
      { id: 'l16', title: { ja: 'Bona 第 1 部 — 単純拍子の練習', en: 'Bona Part 1 — Simple Meter Exercises' } },
      { id: 'l17', title: { ja: 'Bona 第 2 部 — 複合拍子', en: 'Bona Part 2 — Compound Meter' } },
      { id: 'l18', title: { ja: 'Bona 第 3 部 — 変拍子', en: 'Bona Part 3 — Mixed Meter' } },
      { id: 'l19', title: { ja: 'Bona 第 4 部 — 装飾音と即興的な装飾', en: 'Bona Part 4 — Ornaments' } },
      { id: 'l20', title: { ja: 'Bona 総合演習', en: 'Bona Synthesis' } },
      { id: 'l21', title: { ja: 'Pozzoli 第 1 巻 — 入門', en: 'Pozzoli Volume 1 — Introduction' } },
      { id: 'l22', title: { ja: 'Pozzoli 第 1 巻 — 短調の旋律', en: 'Pozzoli Vol 1 — Minor Melodies' } },
      { id: 'l23', title: { ja: 'Pozzoli 第 2 巻 — 中級', en: 'Pozzoli Volume 2 — Intermediate' } },
      { id: 'l24', title: { ja: 'Pozzoli 第 2 巻 — 半音階', en: 'Pozzoli Vol 2 — Chromaticism' } },
      { id: 'l25', title: { ja: 'Pozzoli 第 3 巻 — 上級', en: 'Pozzoli Volume 3 — Advanced' } },
      { id: 'l26', title: { ja: 'Pozzoli 第 3 巻 — 転調を含む', en: 'Pozzoli Vol 3 — With Modulation' } },
      { id: 'l27', title: { ja: 'Pozzoli — リズム視唱 第 1 巻', en: 'Pozzoli — Rhythm Vol 1' } },
      { id: 'l28', title: { ja: 'Pozzoli — リズム視唱 第 2 巻', en: 'Pozzoli — Rhythm Vol 2' } },
      { id: 'l29', title: { ja: 'Hindemith 上級ソルフェージュ — 概観', en: 'Hindemith Advanced — Overview' } },
      { id: 'l30', title: { ja: 'Hindemith — 跳躍を含む旋律', en: 'Hindemith — Melodies with Leaps' } },
      { id: 'l31', title: { ja: 'Hindemith — 半音階旋律', en: 'Hindemith — Chromatic Melodies' } },
      { id: 'l32', title: { ja: 'Hindemith — 無調旋律への橋渡し', en: 'Hindemith — Bridge to Atonal' } },
      { id: 'l33', title: { ja: 'コダーイ・メソッド — 概観', en: 'Kodály Method — Overview' } },
      { id: 'l34', title: { ja: 'コダーイ — ペンタトニック旋律', en: 'Kodály — Pentatonic Melodies' } },
      { id: 'l35', title: { ja: 'コダーイ — 民謡を歌う', en: 'Kodály — Singing Folk Songs' } },
      { id: 'l36', title: { ja: 'コダーイ — 旋法旋律', en: 'Kodály — Modal Melodies' } },
      { id: 'l37', title: { ja: '視唱の戦略 — 譜面を一目で読む', en: 'Sight-Singing Strategy — Reading at a Glance' } },
      { id: 'l38', title: { ja: '視唱の戦略 — 拍を保つ', en: 'Sight-Singing Strategy — Keeping Pulse' } },
      { id: 'l39', title: { ja: '視唱の戦略 — 音程を予測する', en: 'Sight-Singing Strategy — Predicting Intervals' } },
      { id: 'l40', title: { ja: '視唱の戦略 — 跳躍を音程で歌う', en: 'Sight-Singing — Singing Leaps as Intervals' } },
      { id: 'l41', title: { ja: '視唱 — 長調 8 小節旋律', en: 'Sight-Singing — Major 8-Bar Melodies' } },
      { id: 'l42', title: { ja: '視唱 — 短調 8 小節旋律', en: 'Sight-Singing — Minor 8-Bar Melodies' } },
      { id: 'l43', title: { ja: '視唱 — 移調を含む', en: 'Sight-Singing — With Modulation' } },
      { id: 'l44', title: { ja: '視唱 — 半音階を含む', en: 'Sight-Singing — With Chromaticism' } },
      { id: 'l45', title: { ja: '視唱 — 16 小節旋律', en: 'Sight-Singing — 16-Bar Melodies' } },
      { id: 'l46', title: { ja: '2 声視唱 — カノン形式', en: 'Two-Voice Sight-Singing — Canon' } },
      { id: 'l47', title: { ja: '2 声視唱 — 自由対位法', en: 'Two-Voice Sight-Singing — Free Counterpoint' } },
      { id: 'l48', title: { ja: '3 声視唱 — トリオ', en: 'Three-Voice Sight-Singing — Trio' } },
      { id: 'l49', title: { ja: '4 声視唱 — SATB コラール', en: 'Four-Voice Sight-Singing — SATB Chorale' } },
      { id: 'l50', title: { ja: '4 声視唱 — Bach コラール風', en: 'Four-Voice Sight-Singing — Bach Style' } },
      { id: 'l51', title: { ja: 'グレゴリオ聖歌の視唱', en: 'Sight-Singing Gregorian Chant' } },
      { id: 'l52', title: { ja: 'パレストリーナ風の旋律', en: 'Palestrina-Style Melodies' } },
      { id: 'l53', title: { ja: 'バロック旋律 — Bach', en: 'Baroque Melodies — Bach' } },
      { id: 'l54', title: { ja: 'バロック旋律 — Handel', en: 'Baroque Melodies — Handel' } },
      { id: 'l55', title: { ja: '古典派旋律 — Mozart', en: 'Classical Melodies — Mozart' } },
      { id: 'l56', title: { ja: '古典派旋律 — Haydn', en: 'Classical Melodies — Haydn' } },
      { id: 'l57', title: { ja: 'ロマン派旋律 — Schubert', en: 'Romantic Melodies — Schubert' } },
      { id: 'l58', title: { ja: 'ロマン派旋律 — Schumann', en: 'Romantic Melodies — Schumann' } },
      { id: 'l59', title: { ja: 'ロマン派旋律 — Brahms', en: 'Romantic Melodies — Brahms' } },
      { id: 'l60', title: { ja: '近代旋律 — Debussy', en: 'Modern Melodies — Debussy' } },
      { id: 'l61', title: { ja: '近代旋律 — Ravel', en: 'Modern Melodies — Ravel' } },
      { id: 'l62', title: { ja: '20 世紀旋律 — Bartók', en: '20th Century — Bartók' } },
      { id: 'l63', title: { ja: '20 世紀旋律 — Stravinsky', en: '20th Century — Stravinsky' } },
      { id: 'l64', title: { ja: '無調旋律の歌い方', en: 'Singing Atonal Melodies' } },
      { id: 'l65', title: { ja: '12 音旋律の歌い方', en: 'Singing Twelve-Tone Melodies' } },
      { id: 'l66', title: { ja: '視唱と移調楽器 — シ♭ クラリネット', en: 'Sight-Singing for Transposing Instruments — Clarinet' } },
      { id: 'l67', title: { ja: '視唱と移調楽器 — ファ ホルン', en: 'Sight-Singing for Transposing Instruments — Horn' } },
      { id: 'l68', title: { ja: '視唱と楽譜の指揮', en: 'Sight-Singing While Conducting' } },
      { id: 'l69', title: { ja: '模擬入試視唱 — 主要音大過去問', en: 'Mock Exam Sight-Singing — Major Conservatories' } },
      { id: 'l70', title: { ja: 'M12 総合演習・M13 への橋渡し', en: 'M12 Summary and Bridge to M13' } },
    ],
  },
  {
    id: 'm13', num: 'M13',
    title: { ja: '音楽史と様式', en: 'Music History', es: 'Historia musical', ko: '음악사', pt: 'História musical', de: 'Musikgeschichte' },
    desc: { ja: 'スタイル時代・主要作曲家・演奏実践・楽器史・記譜法進化', en: 'Style periods, composers, historical performance practice.', es: 'Períodos estilísticos, compositores, práctica histórica.', ko: '시대 양식·주요 작곡가·역사적 연주.', pt: 'Períodos, compositores, prática histórica.', de: 'Stilepochen, Komponisten, historische Aufführungspraxis.' },
    lessonCount: 20, level: 'advanced',
    lessons: [
      { id: 'l01', title: { ja: '音楽史の地図 — 時代区分', en: 'A Map of Music History — Periods' } },
      { id: 'l02', title: { ja: '中世音楽 — グレゴリオ聖歌から多声音楽へ', en: 'Medieval — From Chant to Polyphony' } },
      { id: 'l03', title: { ja: 'ルネサンス — Josquin と Palestrina', en: 'Renaissance — Josquin and Palestrina' } },
      { id: 'l04', title: { ja: 'バロック前期 — Monteverdi と Schütz', en: 'Early Baroque — Monteverdi and Schütz' } },
      { id: 'l05', title: { ja: 'バロック後期 — Bach と Handel', en: 'Late Baroque — Bach and Handel' } },
      { id: 'l06', title: { ja: '古典派 — Haydn・Mozart・初期 Beethoven', en: 'Classical — Haydn, Mozart, Early Beethoven' } },
      { id: 'l07', title: { ja: 'ロマン派前期 — Schubert と Schumann', en: 'Early Romantic — Schubert and Schumann' } },
      { id: 'l08', title: { ja: 'ロマン派中期 — Chopin・Liszt・Mendelssohn', en: 'Mid-Romantic — Chopin, Liszt, Mendelssohn' } },
      { id: 'l09', title: { ja: 'ロマン派後期 — Brahms・Wagner・Mahler', en: 'Late Romantic — Brahms, Wagner, Mahler' } },
      { id: 'l10', title: { ja: '印象主義 — Debussy と Ravel', en: 'Impressionism — Debussy and Ravel' } },
      { id: 'l11', title: { ja: '20 世紀前半 — Bartók・Stravinsky・Schoenberg', en: 'Early 20th — Bartók, Stravinsky, Schoenberg' } },
      { id: 'l12', title: { ja: '20 世紀後半 — Boulez・Stockhausen・Cage', en: 'Late 20th — Boulez, Stockhausen, Cage' } },
      { id: 'l13', title: { ja: '21 世紀の音楽 — 多元性', en: '21st Century — Pluralism' } },
      { id: 'l14', title: { ja: '日本の作曲家 — 武満徹・細川俊夫', en: 'Japanese Composers — Takemitsu, Hosokawa' } },
      { id: 'l15', title: { ja: '演奏実践 — HIP (古楽演奏)', en: 'Performance Practice — HIP' } },
      { id: 'l16', title: { ja: '演奏実践 — モダン解釈', en: 'Performance Practice — Modern Interpretation' } },
      { id: 'l17', title: { ja: '楽器史 — 鍵盤楽器の進化', en: 'Instrument History — Keyboards' } },
      { id: 'l18', title: { ja: '楽器史 — 弦楽器・管楽器の進化', en: 'Instrument History — Strings and Winds' } },
      { id: 'l19', title: { ja: '記譜法の進化 — ネウマから現代記譜法へ', en: 'Notation Evolution — From Neumes to Modern' } },
      { id: 'l20', title: { ja: 'M13 総合演習・M14 への橋渡し', en: 'M13 Summary and Bridge to M14' } },
    ],
  },
  {
    id: 'm14', num: 'M14',
    title: { ja: '上級理論', en: 'Advanced Theory', es: 'Teoría avanzada', ko: '고급 이론', pt: 'Teoria avançada', de: 'Vertiefte Theorie' },
    desc: { ja: 'シェンカー分析・Caplin 形式機能・Riemann 機能和声・微分音', en: 'Schenkerian analysis, Caplin formal functions, Riemannian, microtonality.', es: 'Schenker, Caplin, Riemann, microtonalidad.', ko: '쉔커·카플린·미분음.', pt: 'Schenker, Caplin, Riemann, microtonalidade.', de: 'Schenker, Caplin, Riemann, Mikrotonalität.' },
    lessonCount: 30, level: 'graduate',
    lessons: [
      { id: 'l01', title: { ja: 'シェンカー分析序論 — 構造の階層', en: 'Schenkerian Analysis — Hierarchy of Structure' } },
      { id: 'l02', title: { ja: 'シェンカー — Ursatz (基本構造)', en: 'Schenker — The Ursatz' } },
      { id: 'l03', title: { ja: 'シェンカー — Urlinie (基本旋律線)', en: 'Schenker — The Urlinie' } },
      { id: 'l04', title: { ja: 'シェンカー — Bassbrechung (基本低音線)', en: 'Schenker — Bassbrechung' } },
      { id: 'l05', title: { ja: 'シェンカー — 中景・前景・背景', en: 'Schenker — Foreground, Middleground, Background' } },
      { id: 'l06', title: { ja: 'シェンカー — Prolongation (持続)', en: 'Schenker — Prolongation' } },
      { id: 'l07', title: { ja: 'シェンカー — Voice Leading の還元', en: 'Schenker — Voice Leading Reduction' } },
      { id: 'l08', title: { ja: 'シェンカー分析 — 分析例 1 (Bach)', en: 'Schenker Analysis Example 1 — Bach' } },
      { id: 'l09', title: { ja: 'シェンカー分析 — 分析例 2 (Mozart)', en: 'Schenker Analysis Example 2 — Mozart' } },
      { id: 'l10', title: { ja: 'シェンカー分析 — 分析例 3 (Chopin)', en: 'Schenker Analysis Example 3 — Chopin' } },
      { id: 'l11', title: { ja: 'Caplin 形式機能 — 概観', en: 'Caplin Formal Functions — Overview' } },
      { id: 'l12', title: { ja: 'Caplin — 主題的機能と過渡的機能', en: 'Caplin — Thematic and Transitional Functions' } },
      { id: 'l13', title: { ja: 'Caplin — Tight-Knit と Loose-Knit', en: 'Caplin — Tight-Knit and Loose-Knit' } },
      { id: 'l14', title: { ja: 'Caplin — 古典派ソナタ形式の機能分析', en: 'Caplin — Functional Analysis of Sonata Form' } },
      { id: 'l15', title: { ja: 'Riemann 機能和声論 — 概念', en: 'Riemann Functional Theory — Concept' } },
      { id: 'l16', title: { ja: 'Riemann — T・S・D 機能', en: 'Riemann — T, S, D Functions' } },
      { id: 'l17', title: { ja: 'Riemann — 二重機能と代理', en: 'Riemann — Dual Functions and Substitutions' } },
      { id: 'l18', title: { ja: '比較分析 — シェンカー vs ローマ数字 vs Riemann', en: 'Comparative Analysis — Schenker vs Roman vs Riemann' } },
      { id: 'l19', title: { ja: '微分音 — 概念と歴史', en: 'Microtonality — Concept and History' } },
      { id: 'l20', title: { ja: '微分音 — Partch・Carrillo・Wyschnegradsky', en: 'Microtonality — Partch, Carrillo, Wyschnegradsky' } },
      { id: 'l21', title: { ja: '世界の音律 — 平均律以前', en: 'World Tunings — Pre-Equal Temperament' } },
      { id: 'l22', title: { ja: '世界の音律 — 純正律', en: 'World Tunings — Just Intonation' } },
      { id: 'l23', title: { ja: '世界の音律 — ピタゴラス律・ミーントーン', en: 'World Tunings — Pythagorean and Meantone' } },
      { id: 'l24', title: { ja: '非西洋音楽 — インド古典音楽の理論', en: 'Non-Western — Indian Classical Theory' } },
      { id: 'l25', title: { ja: '非西洋音楽 — アラブ音楽のマカーム', en: 'Non-Western — Arabic Maqam' } },
      { id: 'l26', title: { ja: '非西洋音楽 — 日本の伝統音楽', en: 'Non-Western — Traditional Japanese Music' } },
      { id: 'l27', title: { ja: 'スペクトル音楽 — 概念', en: 'Spectral Music — Concept' } },
      { id: 'l28', title: { ja: 'スペクトル音楽 — Grisey と Murail', en: 'Spectral — Grisey and Murail' } },
      { id: 'l29', title: { ja: 'コンピュータ音楽 — アルゴリズム作曲', en: 'Computer Music — Algorithmic Composition' } },
      { id: 'l30', title: { ja: 'M14 総合演習・M15 への橋渡し', en: 'M14 Summary and Bridge to M15' } },
    ],
  },
  {
    id: 'm15', num: 'M15',
    title: { ja: '作曲実技', en: 'Composition Practice', es: 'Composición', ko: '작곡 실기', pt: 'Composição', de: 'Kompositorische Praxis' },
    desc: { ja: '4 声体コラール・弦楽四重奏・リート・ピアノ小品・編曲', en: '4-part chorale, string quartet, art song, piano miniature.', es: 'Coral a 4 voces, cuarteto, lied, miniatura.', ko: '4성부 코랄·현악 사중주·리트·소품.', pt: 'Coral a 4 vozes, quarteto, lied, miniatura.', de: 'Vierstimmiger Choral, Streichquartett, Lied.' },
    lessonCount: 25, level: 'graduate',
    lessons: [
      { id: 'l01', title: { ja: '作曲序論 — 何を書くべきか', en: 'Composition Intro — What to Write' } },
      { id: 'l02', title: { ja: 'モチーフから楽句へ', en: 'From Motive to Phrase' } },
      { id: 'l03', title: { ja: '4 声体コラール — 旋律の選び方', en: '4-Voice Chorale — Choosing a Melody' } },
      { id: 'l04', title: { ja: '4 声体コラール — 和声付け 1', en: '4-Voice Chorale — Harmonization 1' } },
      { id: 'l05', title: { ja: '4 声体コラール — 和声付け 2 (転調を含む)', en: '4-Voice Chorale — Harmonization 2 (with Modulation)' } },
      { id: 'l06', title: { ja: '4 声体コラール — Bach 様式での作曲', en: '4-Voice Chorale — Composing in Bach Style' } },
      { id: 'l07', title: { ja: 'ピアノ小品 — 二部形式の小曲', en: 'Piano Miniature — Binary Form' } },
      { id: 'l08', title: { ja: 'ピアノ小品 — 三部形式の小曲', en: 'Piano Miniature — Ternary Form' } },
      { id: 'l09', title: { ja: 'ピアノ小品 — Schumann 風キャラクターピース', en: 'Piano Miniature — Schumann Character Piece' } },
      { id: 'l10', title: { ja: 'ピアノ小品 — Chopin 風マズルカ', en: 'Piano Miniature — Chopin Mazurka' } },
      { id: 'l11', title: { ja: 'リート (歌曲) — 詩の選び方', en: 'Art Song (Lied) — Choosing Text' } },
      { id: 'l12', title: { ja: 'リート — 旋律と詩の関係', en: 'Art Song — Melody and Text Relation' } },
      { id: 'l13', title: { ja: 'リート — ピアノ伴奏の書き方', en: 'Art Song — Writing Piano Accompaniment' } },
      { id: 'l14', title: { ja: 'リート — Schubert 様式での作曲', en: 'Art Song — Composing in Schubert Style' } },
      { id: 'l15', title: { ja: '弦楽四重奏 — 各楽器の音域・奏法', en: 'String Quartet — Ranges and Techniques' } },
      { id: 'l16', title: { ja: '弦楽四重奏 — 4 声テクスチャの設計', en: 'String Quartet — Designing 4-Voice Texture' } },
      { id: 'l17', title: { ja: '弦楽四重奏 — 第 1 楽章の構築', en: 'String Quartet — Building the First Movement' } },
      { id: 'l18', title: { ja: '弦楽四重奏 — Haydn 様式での作曲', en: 'String Quartet — Composing in Haydn Style' } },
      { id: 'l19', title: { ja: '編曲 — ピアノからアンサンブルへ', en: 'Arrangement — From Piano to Ensemble' } },
      { id: 'l20', title: { ja: '編曲 — オーケストラ編曲の基礎', en: 'Arrangement — Orchestral Arrangement Basics' } },
      { id: 'l21', title: { ja: 'フリーコンポジション — 自分の言葉を見つける', en: 'Free Composition — Finding Your Voice' } },
      { id: 'l22', title: { ja: 'フリーコンポジション — 現代的アプローチ', en: 'Free Composition — Contemporary Approach' } },
      { id: 'l23', title: { ja: '即興演奏と作曲の境界', en: 'The Border Between Improvisation and Composition' } },
      { id: 'l24', title: { ja: '作曲家としての自己認識 — 何が独自性か', en: 'Self-Awareness as Composer — What is Originality?' } },
      { id: 'l25', title: { ja: 'M15 総合演習 — 自由作曲課題', en: 'M15 Summary — Free Composition Assignment' } },
    ],
  },
];

const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessonCount, 0);
const AVAILABLE_LESSONS = MODULES.reduce(
  (sum, m) => sum + m.lessons.filter(l => l.published).length,
  0,
);

// ─────────────────────────────────────────
// メインページ
// ─────────────────────────────────────────
export default function TheoryHubPage() {
  const { lang } = useLang();

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>

      {/* ═══════ HUB HEADER ═══════ */}
      <header style={{
        padding: 'clamp(3rem, 7vw, 5.5rem) clamp(1.5rem, 4vw, 3rem) clamp(2rem, 4vw, 3rem)',
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <div style={{
          fontFamily: mono,
          fontSize: '0.7rem',
          color: INK_FAINT,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}>
          KUON · Music Theory Suite
        </div>
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 400,
          letterSpacing: '0.04em',
          lineHeight: 1.4,
          margin: 0,
          color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '音楽理論の、目次。',
            en: 'A table of contents for music theory.',
            es: 'Un índice de la teoría musical.',
            ko: '음악 이론의 목차.',
            pt: 'Um índice da teoria musical.',
            de: 'Ein Inhaltsverzeichnis der Musiktheorie.',
          }, lang)}
        </h1>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
          color: INK_SOFT,
          lineHeight: 2,
          marginTop: '1.4rem',
          maxWidth: 720,
          letterSpacing: '0.02em',
        }}>
          {t({
            ja: `16 のモジュール、${TOTAL_LESSONS} のレッスン。譜表の最初の一線から、シェンカー分析まで。あなたが今いる場所から、自由に始め、自由に進めます。`,
            en: `16 modules, ${TOTAL_LESSONS} lessons. From the first line of the staff to Schenkerian analysis. Begin where you are. Move at your own pace.`,
            es: `16 módulos, ${TOTAL_LESSONS} lecciones. Desde la primera línea del pentagrama hasta Schenker. Comienza donde estés.`,
            ko: `16 모듈, ${TOTAL_LESSONS} 레슨. 오선의 첫 줄부터 쉔커 분석까지. 지금 있는 곳에서 자유롭게 시작하세요.`,
            pt: `16 módulos, ${TOTAL_LESSONS} lições. Da primeira linha da pauta à análise Schenker. Comece de onde está.`,
            de: `16 Module, ${TOTAL_LESSONS} Lektionen. Von der ersten Notenlinie bis zur Schenker-Analyse. Beginnen Sie, wo Sie stehen.`,
          }, lang)}
        </p>
      </header>

      {/* ═══════ STATUS BAR (MVP 進捗) ═══════ */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 clamp(1.5rem, 4vw, 3rem)',
        marginBottom: 'clamp(2rem, 5vw, 4rem)',
      }}>
        <div style={{
          background: '#fff',
          border: `1px solid ${STAFF_LINE}`,
          borderRadius: 4,
          padding: 'clamp(1.4rem, 3vw, 2rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'clamp(1.2rem, 2.5vw, 2rem)',
        }}>
          <StatusItem
            label={t({ ja: '本日のおすすめ', en: 'Today', es: 'Hoy', ko: '오늘', pt: 'Hoje', de: 'Heute' }, lang)}
            value={t({
              ja: 'M0-01 音とは何か',
              en: 'M0-01 What is Sound?',
              es: 'M0-01 ¿Qué es el sonido?',
              ko: 'M0-01 소리란 무엇인가',
              pt: 'M0-01 O que é o som?',
              de: 'M0-01 Was ist Klang?',
            }, lang)}
            href="/theory/m0/l01"
            cta
          />
          <StatusItem
            label={t({ ja: 'AI 家庭教師', en: 'AI Tutor', es: 'Tutor IA', ko: 'AI 튜터', pt: 'Tutor IA', de: 'KI-Tutor' }, lang)}
            value={t({ ja: '質問する', en: 'Ask now', es: 'Pregunta', ko: '질문', pt: 'Pergunte', de: 'Fragen' }, lang)}
            href="/theory-tutor"
            cta
          />
          <StatusItem
            label={t({ ja: '復習待ち (SRS)', en: 'Review due (SRS)', es: 'Repaso pendiente', ko: '복습 대기', pt: 'Revisão pendente', de: 'Wiederholung' }, lang)}
            value="0"
            unit={t({ ja: '枚', en: 'cards', es: 'tarjetas', ko: '장', pt: 'cartões', de: 'Karten' }, lang)}
          />
          <StatusItem
            label={t({ ja: '公開済みレッスン', en: 'Lessons available', es: 'Lecciones disponibles', ko: '공개 레슨', pt: 'Lições disponíveis', de: 'Verfügbare Lektionen' }, lang)}
            value={`${AVAILABLE_LESSONS} / ${TOTAL_LESSONS}`}
          />
        </div>
      </div>

      {/* ═══════ TABLE OF CONTENTS — 16 MODULES ═══════ */}
      <main style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 4vw, 3rem) clamp(4rem, 8vw, 6rem)',
      }}>
        {/* Foundation */}
        <ModuleGroup
          label={t({ ja: '基礎', en: 'Foundation', es: 'Fundamento', ko: '기초', pt: 'Fundamento', de: 'Grundlage' }, lang)}
          color={ACCENT_INDIGO}
        >
          {MODULES.filter(m => m.level === 'foundation').map(m => (
            <ModuleCard key={m.id} module={m} lang={lang} />
          ))}
        </ModuleGroup>

        {/* Intermediate */}
        <ModuleGroup
          label={t({ ja: '中級', en: 'Intermediate', es: 'Intermedio', ko: '중급', pt: 'Intermediário', de: 'Mittelstufe' }, lang)}
          color={ACCENT_VINE}
        >
          {MODULES.filter(m => m.level === 'intermediate').map(m => (
            <ModuleCard key={m.id} module={m} lang={lang} />
          ))}
        </ModuleGroup>

        {/* Advanced */}
        <ModuleGroup
          label={t({ ja: '上級', en: 'Advanced', es: 'Avanzado', ko: '고급', pt: 'Avançado', de: 'Fortgeschritten' }, lang)}
          color={ACCENT_GOLD}
        >
          {MODULES.filter(m => m.level === 'advanced').map(m => (
            <ModuleCard key={m.id} module={m} lang={lang} />
          ))}
        </ModuleGroup>

        {/* Graduate */}
        <ModuleGroup
          label={t({ ja: '大学院', en: 'Graduate', es: 'Posgrado', ko: '대학원', pt: 'Pós-graduação', de: 'Hochschulstufe' }, lang)}
          color={INK}
        >
          {MODULES.filter(m => m.level === 'graduate').map(m => (
            <ModuleCard key={m.id} module={m} lang={lang} />
          ))}
        </ModuleGroup>

        {/* Footer note */}
        <div style={{
          marginTop: 'clamp(4rem, 8vw, 6rem)',
          paddingTop: 'clamp(2rem, 4vw, 3rem)',
          borderTop: `1px solid ${STAFF_LINE}`,
          textAlign: 'center' as const,
        }}>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: '0.9rem',
            color: INK_FAINT,
            lineHeight: 1.85,
            margin: 0,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
            letterSpacing: '0.02em',
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: 'Open Music Theory v2 (Cambridge / GMU 等 7 名共著・CC BY-SA 4.0) を骨格とし、空音開発が独自の M0・M11・M12・M13・M15 を加えて完成させた構成です。',
              en: 'Built on Open Music Theory v2 (CC BY-SA 4.0, by faculty at Cambridge, GMU, and 5 others), with proprietary modules M0, M11, M12, M13, M15 added by Kuon R&D.',
              es: 'Sobre Open Music Theory v2 (CC BY-SA 4.0), con módulos M0, M11, M12, M13, M15 añadidos por Kuon R&D.',
              ko: 'Open Music Theory v2 (CC BY-SA 4.0) 를 기반으로, 공음개발이 M0·M11·M12·M13·M15 를 추가.',
              pt: 'Baseado em Open Music Theory v2 (CC BY-SA 4.0), com módulos M0, M11, M12, M13, M15 acrescentados pela Kuon R&D.',
              de: 'Auf Basis von Open Music Theory v2 (CC BY-SA 4.0), mit Modulen M0, M11, M12, M13, M15 von Kuon R&D ergänzt.',
            }, lang)}
          </p>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// サブコンポーネント
// ─────────────────────────────────────────
function StatusItem({
  label, value, unit, href, cta, disabled,
}: { label: string; value: string; unit?: string; href?: string; cta?: boolean; disabled?: boolean }) {
  const inner = (
    <div style={{ opacity: disabled ? 0.45 : 1 }}>
      <div style={{
        fontFamily: sans,
        fontSize: '0.66rem',
        color: INK_FAINT,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        marginBottom: '0.55rem',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontFamily: serif,
          fontSize: 'clamp(1rem, 1.7vw, 1.15rem)',
          fontWeight: 400,
          color: cta ? ACCENT_INDIGO : INK,
          letterSpacing: '0.02em',
          lineHeight: 1.4,
          wordBreak: 'keep-all' as const,
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, letterSpacing: '0.04em' }}>
            {unit}
          </span>
        )}
      </div>
      {cta && (
        <div style={{
          fontFamily: sans,
          fontSize: '0.7rem',
          color: ACCENT_INDIGO,
          marginTop: '0.6rem',
          letterSpacing: '0.04em',
        }}>
          →
        </div>
      )}
    </div>
  );
  if (href && !disabled) {
    return (
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

function ModuleGroup({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '1rem',
        marginBottom: 'clamp(1.2rem, 2.5vw, 1.8rem)',
        paddingBottom: '0.7rem',
        borderBottom: `1px solid ${STAFF_LINE}`,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color, display: 'inline-block', flexShrink: 0,
        }} />
        <h2 style={{
          fontFamily: sans,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: INK_SOFT,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          {label}
        </h2>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 'clamp(1rem, 2vw, 1.4rem)',
      }}>
        {children}
      </div>
    </section>
  );
}

function ModuleCard({ module: m, lang }: { module: ModuleDef; lang: Lang }) {
  // 2026-04-29 改修 #2: 全 553 レッスン目次を表示。
  //   - published=true のレッスンは <Link> でクリック可能 (本文の色＋ホバー)
  //   - それ以外は <span> で非クリック (薄字＋準備中ラベル)
  //   - レッスン数が多くてもスクロールせず一覧できるように高密度レイアウト
  const publishedCount = m.lessons.filter(l => l.published).length;

  return (
    <article style={{
      background: '#fff',
      border: `1px solid ${STAFF_LINE}`,
      borderRadius: 4,
      padding: 'clamp(1.4rem, 2.5vw, 1.8rem)',
      transition: 'border-color 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.9rem' }}>
        <span style={{
          fontFamily: serif,
          fontSize: 'clamp(1.6rem, 3vw, 2rem)',
          fontWeight: 400,
          color: INK,
          letterSpacing: '0.05em',
          lineHeight: 1,
        }}>
          {m.num}
        </span>
        <span style={{
          fontFamily: sans,
          fontSize: '0.66rem',
          color: INK_FAINT,
          letterSpacing: '0.1em',
        }}>
          {publishedCount > 0 && (
            <span style={{ color: ACCENT_GOLD, marginRight: '0.5em' }}>
              {publishedCount}/{m.lessonCount}
            </span>
          )}
          {publishedCount === 0 && (
            <>{m.lessonCount} {t({ ja: 'レッスン', en: 'lessons', es: 'lecciones', ko: '레슨', pt: 'lições', de: 'Lektionen' }, lang)}</>
          )}
          {publishedCount > 0 && (
            <>{t({ ja: '公開', en: 'available', es: 'dispon.', ko: '공개', pt: 'dispon.', de: 'verfügb.' }, lang)}</>
          )}
        </span>
      </div>
      <h3 style={{
        fontFamily: serif,
        fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
        fontWeight: 500,
        color: INK,
        margin: '0 0 0.7rem 0',
        letterSpacing: '0.03em',
        lineHeight: 1.4,
        wordBreak: 'keep-all' as const,
      }}>
        {t(m.title, lang)}
      </h3>
      <p style={{
        fontFamily: sans,
        fontSize: '0.85rem',
        color: INK_SOFT,
        lineHeight: 1.7,
        margin: 0,
        letterSpacing: '0.01em',
      }}>
        {t(m.desc, lang)}
      </p>

      {/* 全レッスンの目次 (公開: クリック可能 / 未公開: 準備中) */}
      <div style={{
        marginTop: 'clamp(1rem, 2vw, 1.4rem)',
        paddingTop: '0.85rem',
        borderTop: `1px solid ${STAFF_LINE}`,
        flex: 1,
      }}>
        <div style={{
          fontFamily: sans,
          fontSize: '0.62rem',
          color: INK_FAINT,
          letterSpacing: '0.14em',
          textTransform: 'uppercase' as const,
          marginBottom: '0.5rem',
        }}>
          {t({
            ja: '目次',
            en: 'Contents',
            es: 'Índice',
            ko: '목차',
            pt: 'Índice',
            de: 'Inhalt',
          }, lang)}
        </div>
        <ul style={{
          listStyle: 'none' as const,
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '0.15rem',
        }}>
          {m.lessons.map(lesson => {
            const isPublished = lesson.published === true;
            const itemStyle = {
              display: 'flex',
              justifyContent: 'space-between' as const,
              alignItems: 'baseline' as const,
              padding: '0.32rem 0.5rem',
              borderRadius: 3,
              fontFamily: serif,
              fontSize: 'clamp(0.78rem, 1.2vw, 0.88rem)',
              letterSpacing: '0.01em',
              lineHeight: 1.45,
              gap: '0.5rem',
            };
            const idStyle = {
              fontFamily: mono,
              fontSize: '0.65rem',
              letterSpacing: '0.05em',
              flexShrink: 0,
              textTransform: 'uppercase' as const,
              minWidth: '2.4em',
            };
            const titleSpan = (
              <span style={{
                display: 'flex',
                alignItems: 'baseline' as const,
                gap: '0.55rem',
                flex: 1,
                minWidth: 0,
                wordBreak: 'keep-all' as const,
              }}>
                <span style={{ ...idStyle, color: isPublished ? ACCENT_GOLD : INK_FAINT }}>
                  {lesson.id}
                </span>
                <span style={{
                  color: isPublished ? INK : INK_FAINT,
                  flex: 1,
                }}>
                  {t(lesson.title, lang)}
                </span>
              </span>
            );

            if (isPublished) {
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/theory/${m.id}/${lesson.id}`}
                    style={{
                      ...itemStyle,
                      textDecoration: 'none',
                      color: INK,
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = PAPER_DEEP; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {titleSpan}
                    <span style={{ color: ACCENT_GOLD, fontSize: '0.85em', flexShrink: 0 }}>→</span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={lesson.id}>
                <span
                  style={{
                    ...itemStyle,
                    cursor: 'default' as const,
                  }}
                  aria-disabled="true"
                >
                  {titleSpan}
                  <span style={{
                    color: INK_FAINT,
                    fontSize: '0.62rem',
                    fontFamily: sans,
                    letterSpacing: '0.06em',
                    flexShrink: 0,
                    fontStyle: 'italic' as const,
                  }}>
                    {t({
                      ja: '準備中',
                      en: 'soon',
                      es: 'pronto',
                      ko: '준비',
                      pt: 'breve',
                      de: 'bald',
                    }, lang)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
