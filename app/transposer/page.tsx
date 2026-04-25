'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { RegistrationNudge, useRegistrationNudge } from '@/components/RegistrationNudge';
import { AuthGate } from '@/components/AuthGate';

// ─── Design Tokens ───
const serif = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif';
const sans  = '"Helvetica Neue",Arial,sans-serif';
const mono  = '"SF Mono","Fira Code",Consolas,monospace';
const ACCENT = '#ea580c';
const BG     = '#fffbf7';

type L5 = Partial<Record<Lang, string>> & { en: string };
const t5 = (m: Partial<Record<Lang,string>> & {en:string}, lang: Lang) => m[lang] ?? m.en;

// ─── Music Theory Constants ───
const SEMI = [0,2,4,5,7,9,11]; // C D E F G A B
const LETTERS = ['C','D','E','F','G','A','B'];

interface HNote { letter: number; accidental: number; octave: number; }

const midi = (n: HNote) => (n.octave+1)*12 + SEMI[n.letter] + n.accidental;

function parseNote(s: string): HNote | null {
  const m = s.trim().match(/^([A-Ga-g])(#{1,2}|b{1,2}|♯|♭|x)?(\d)$/);
  if (!m) return null;
  const letter = 'CDEFGAB'.indexOf(m[1].toUpperCase());
  if (letter < 0) return null;
  const as = m[2] || '';
  const acc = as==='#'||as==='♯'?1 : as==='##'||as==='x'?2 : as==='b'||as==='♭'?-1 : as==='bb'?-2 : 0;
  return { letter, accidental: acc, octave: parseInt(m[3]) };
}

function accStr(a: number): string {
  return a===2?'𝄪' : a===1?'♯' : a===-1?'♭' : a===-2?'𝄫' : '';
}
function noteName(n: HNote, withOct = true): string {
  return LETTERS[n.letter] + accStr(n.accidental) + (withOct ? n.octave : '');
}

// Respell double accidentals
function respell(n: HNote): HNote {
  if (n.accidental >= -1 && n.accidental <= 1) return n;
  if (n.accidental === 2) {
    const nl = (n.letter+1) % 7;
    const no = n.octave + (n.letter === 6 ? 1 : 0);
    const diff = SEMI[nl] - SEMI[n.letter];
    const d = diff <= 0 ? diff + 12 : diff;
    return respell({ letter: nl, accidental: 2 - d, octave: no });
  }
  if (n.accidental === -2) {
    const nl = ((n.letter-1) % 7 + 7) % 7;
    const no = n.octave - (n.letter === 0 ? 1 : 0);
    const diff = SEMI[n.letter] - SEMI[nl];
    const d = diff <= 0 ? diff + 12 : diff;
    return respell({ letter: nl, accidental: -2 + d, octave: no });
  }
  return n;
}

// ─── Instrument Definitions ───
interface Instrument {
  id: string; name: L5; family: string; key: string;
  dSteps: number; semitones: number; clef: 'treble'|'bass';
}

const FAMILIES: { id: string; label: L5 }[] = [
  { id:'ref', label:{ja:'基準',en:'Reference',ko:'기준',pt:'Referência',es:'Referencia'} },
  { id:'ww',  label:{ja:'木管楽器',en:'Woodwinds',ko:'목관악기',pt:'Madeiras',es:'Maderas'} },
  { id:'sax', label:{ja:'サクソフォン',en:'Saxophones',ko:'색소폰',pt:'Saxofones',es:'Saxofones'} },
  { id:'br',  label:{ja:'金管楽器',en:'Brass',ko:'금관악기',pt:'Metais',es:'Metales'} },
  { id:'pc',  label:{ja:'打楽器',en:'Percussion',ko:'타악기',pt:'Percussão',es:'Percusión'} },
  { id:'st',  label:{ja:'弦楽器',en:'Strings',ko:'현악기',pt:'Cordas',es:'Cuerdas'} },
];

const INSTRUMENTS: Instrument[] = [
  // Reference
  { id:'concert', name:{ja:'実音（Concert Pitch）',en:'Concert Pitch (C)',ko:'실음 (C)',pt:'Altura Real (C)',es:'Altura Real (C)'}, family:'ref', key:'C', dSteps:0, semitones:0, clef:'treble' },
  // Woodwinds
  { id:'piccolo', name:{ja:'ピッコロ',en:'Piccolo',ko:'피콜로',pt:'Piccolo',es:'Piccolo'}, family:'ww', key:'C 8va', dSteps:-7, semitones:-12, clef:'treble' },
  { id:'flute', name:{ja:'フルート',en:'Flute',ko:'플루트',pt:'Flauta',es:'Flauta'}, family:'ww', key:'C', dSteps:0, semitones:0, clef:'treble' },
  { id:'oboe', name:{ja:'オーボエ',en:'Oboe',ko:'오보에',pt:'Oboé',es:'Oboe'}, family:'ww', key:'C', dSteps:0, semitones:0, clef:'treble' },
  { id:'english-horn', name:{ja:'イングリッシュホルン',en:'English Horn',ko:'잉글리시 호른',pt:'Corne Inglês',es:'Corno Inglés'}, family:'ww', key:'F', dSteps:4, semitones:7, clef:'treble' },
  { id:'eb-clarinet', name:{ja:'E♭クラリネット',en:'E♭ Clarinet',ko:'E♭ 클라리넷',pt:'Clarinete E♭',es:'Clarinete E♭'}, family:'ww', key:'E♭', dSteps:-2, semitones:-3, clef:'treble' },
  { id:'bb-clarinet', name:{ja:'B♭クラリネット',en:'B♭ Clarinet',ko:'B♭ 클라리넷',pt:'Clarinete B♭',es:'Clarinete B♭'}, family:'ww', key:'B♭', dSteps:1, semitones:2, clef:'treble' },
  { id:'a-clarinet', name:{ja:'Aクラリネット',en:'A Clarinet',ko:'A 클라리넷',pt:'Clarinete A',es:'Clarinete A'}, family:'ww', key:'A', dSteps:2, semitones:3, clef:'treble' },
  { id:'bass-clarinet', name:{ja:'バスクラリネット',en:'Bass Clarinet',ko:'베이스 클라리넷',pt:'Clarinete Baixo',es:'Clarinete Bajo'}, family:'ww', key:'B♭', dSteps:8, semitones:14, clef:'treble' },
  { id:'bassoon', name:{ja:'ファゴット',en:'Bassoon',ko:'바순',pt:'Fagote',es:'Fagot'}, family:'ww', key:'C', dSteps:0, semitones:0, clef:'bass' },
  { id:'contrabassoon', name:{ja:'コントラファゴット',en:'Contrabassoon',ko:'콘트라바순',pt:'Contrafagote',es:'Contrafagot'}, family:'ww', key:'C 8vb', dSteps:7, semitones:12, clef:'bass' },
  // Saxophones
  { id:'soprano-sax', name:{ja:'ソプラノサックス',en:'Soprano Sax',ko:'소프라노 색소폰',pt:'Sax Soprano',es:'Sax Soprano'}, family:'sax', key:'B♭', dSteps:1, semitones:2, clef:'treble' },
  { id:'alto-sax', name:{ja:'アルトサックス',en:'Alto Sax',ko:'알토 색소폰',pt:'Sax Alto',es:'Sax Alto'}, family:'sax', key:'E♭', dSteps:5, semitones:9, clef:'treble' },
  { id:'tenor-sax', name:{ja:'テナーサックス',en:'Tenor Sax',ko:'테너 색소폰',pt:'Sax Tenor',es:'Sax Tenor'}, family:'sax', key:'B♭', dSteps:8, semitones:14, clef:'treble' },
  { id:'baritone-sax', name:{ja:'バリトンサックス',en:'Baritone Sax',ko:'바리톤 색소폰',pt:'Sax Barítono',es:'Sax Barítono'}, family:'sax', key:'E♭', dSteps:12, semitones:21, clef:'treble' },
  // Brass
  { id:'bb-trumpet', name:{ja:'B♭トランペット',en:'B♭ Trumpet',ko:'B♭ 트럼펫',pt:'Trompete B♭',es:'Trompeta B♭'}, family:'br', key:'B♭', dSteps:1, semitones:2, clef:'treble' },
  { id:'c-trumpet', name:{ja:'Cトランペット',en:'C Trumpet',ko:'C 트럼펫',pt:'Trompete C',es:'Trompeta C'}, family:'br', key:'C', dSteps:0, semitones:0, clef:'treble' },
  { id:'bb-cornet', name:{ja:'コルネット',en:'B♭ Cornet',ko:'코넷',pt:'Corneta B♭',es:'Corneta B♭'}, family:'br', key:'B♭', dSteps:1, semitones:2, clef:'treble' },
  { id:'flugelhorn', name:{ja:'フリューゲルホルン',en:'Flugelhorn',ko:'플뤼겔호른',pt:'Fliscorne',es:'Fiscorno'}, family:'br', key:'B♭', dSteps:1, semitones:2, clef:'treble' },
  { id:'f-horn', name:{ja:'ホルン（F管）',en:'Horn in F',ko:'F 호른',pt:'Trompa F',es:'Corno F'}, family:'br', key:'F', dSteps:4, semitones:7, clef:'treble' },
  { id:'trombone', name:{ja:'トロンボーン',en:'Trombone',ko:'트롬본',pt:'Trombone',es:'Trombón'}, family:'br', key:'C', dSteps:0, semitones:0, clef:'bass' },
  { id:'euphonium-c', name:{ja:'ユーフォニアム（実音）',en:'Euphonium (C)',ko:'유포니움 (C)',pt:'Eufônio (C)',es:'Bombardino (C)'}, family:'br', key:'C', dSteps:0, semitones:0, clef:'bass' },
  { id:'euphonium-bb', name:{ja:'ユーフォニアム（B♭ト音）',en:'Euphonium (B♭ TC)',ko:'유포니움 (B♭)',pt:'Eufônio (B♭)',es:'Bombardino (B♭)'}, family:'br', key:'B♭', dSteps:8, semitones:14, clef:'treble' },
  { id:'tuba', name:{ja:'チューバ',en:'Tuba',ko:'튜바',pt:'Tuba',es:'Tuba'}, family:'br', key:'C', dSteps:0, semitones:0, clef:'bass' },
  // Percussion
  { id:'glockenspiel', name:{ja:'グロッケンシュピール',en:'Glockenspiel',ko:'글로켄슈필',pt:'Glockenspiel',es:'Glockenspiel'}, family:'pc', key:'C 15ma', dSteps:-14, semitones:-24, clef:'treble' },
  { id:'xylophone', name:{ja:'シロフォン',en:'Xylophone',ko:'실로폰',pt:'Xilofone',es:'Xilófono'}, family:'pc', key:'C 8va', dSteps:-7, semitones:-12, clef:'treble' },
  // Strings
  { id:'violin', name:{ja:'ヴァイオリン',en:'Violin',ko:'바이올린',pt:'Violino',es:'Violín'}, family:'st', key:'C', dSteps:0, semitones:0, clef:'treble' },
  { id:'viola', name:{ja:'ヴィオラ',en:'Viola',ko:'비올라',pt:'Viola',es:'Viola'}, family:'st', key:'C', dSteps:0, semitones:0, clef:'treble' },
  { id:'cello', name:{ja:'チェロ',en:'Cello',ko:'첼로',pt:'Violoncelo',es:'Violonchelo'}, family:'st', key:'C', dSteps:0, semitones:0, clef:'bass' },
  { id:'contrabass', name:{ja:'コントラバス',en:'Contrabass',ko:'콘트라베이스',pt:'Contrabaixo',es:'Contrabajo'}, family:'st', key:'C 8vb', dSteps:7, semitones:12, clef:'bass' },
];

const instById = (id: string) => INSTRUMENTS.find(i => i.id === id)!;

// ─── Transposition Engine ───
function transposeNote(note: HNote, from: Instrument, to: Instrument): HNote {
  const concertStaff = note.octave * 7 + note.letter - from.dSteps;
  const concertMidi  = midi(note) - from.semitones;
  const targetStaff  = concertStaff + to.dSteps;
  const targetMidi   = concertMidi + to.semitones;
  const nl = ((targetStaff % 7) + 7) % 7;
  const no = Math.floor(targetStaff / 7);
  const expected = (no+1)*12 + SEMI[nl];
  return respell({ letter: nl, accidental: targetMidi - expected, octave: no });
}

// ─── Key Signatures ───
interface KeySig {
  letter: number; acc: number; name: string;
  nameJa: string; nameKo: string;
  sharps: number; flats: number; relMinor: string; relMinorJa: string;
}

const KEYS: KeySig[] = [
  { letter:0, acc:0,  name:'C',  nameJa:'ハ長調', nameKo:'다장조', sharps:0, flats:0, relMinor:'Am',  relMinorJa:'イ短調' },
  { letter:4, acc:0,  name:'G',  nameJa:'ト長調', nameKo:'사장조', sharps:1, flats:0, relMinor:'Em',  relMinorJa:'ホ短調' },
  { letter:1, acc:0,  name:'D',  nameJa:'ニ長調', nameKo:'라장조', sharps:2, flats:0, relMinor:'Bm',  relMinorJa:'ロ短調' },
  { letter:5, acc:0,  name:'A',  nameJa:'イ長調', nameKo:'가장조', sharps:3, flats:0, relMinor:'F♯m', relMinorJa:'嬰ヘ短調' },
  { letter:2, acc:0,  name:'E',  nameJa:'ホ長調', nameKo:'마장조', sharps:4, flats:0, relMinor:'C♯m', relMinorJa:'嬰ハ短調' },
  { letter:6, acc:0,  name:'B',  nameJa:'ロ長調', nameKo:'나장조', sharps:5, flats:0, relMinor:'G♯m', relMinorJa:'嬰ト短調' },
  { letter:3, acc:1,  name:'F♯', nameJa:'嬰ヘ長調', nameKo:'올림바장조', sharps:6, flats:0, relMinor:'D♯m', relMinorJa:'嬰ニ短調' },
  { letter:0, acc:1,  name:'C♯', nameJa:'嬰ハ長調', nameKo:'올림다장조', sharps:7, flats:0, relMinor:'A♯m', relMinorJa:'嬰イ短調' },
  { letter:3, acc:0,  name:'F',  nameJa:'ヘ長調', nameKo:'바장조', sharps:0, flats:1, relMinor:'Dm',  relMinorJa:'ニ短調' },
  { letter:6, acc:-1, name:'B♭', nameJa:'変ロ長調', nameKo:'내림나장조', sharps:0, flats:2, relMinor:'Gm',  relMinorJa:'ト短調' },
  { letter:2, acc:-1, name:'E♭', nameJa:'変ホ長調', nameKo:'내림마장조', sharps:0, flats:3, relMinor:'Cm',  relMinorJa:'ハ短調' },
  { letter:5, acc:-1, name:'A♭', nameJa:'変イ長調', nameKo:'내림가장조', sharps:0, flats:4, relMinor:'Fm',  relMinorJa:'ヘ短調' },
  { letter:1, acc:-1, name:'D♭', nameJa:'変ニ長調', nameKo:'내림라장조', sharps:0, flats:5, relMinor:'B♭m', relMinorJa:'変ロ短調' },
  { letter:4, acc:-1, name:'G♭', nameJa:'変ト長調', nameKo:'내림사장조', sharps:0, flats:6, relMinor:'E♭m', relMinorJa:'変ホ短調' },
  { letter:0, acc:-1, name:'C♭', nameJa:'変ハ長調', nameKo:'내림다장조', sharps:0, flats:7, relMinor:'A♭m', relMinorJa:'変イ短調' },
];

function findKey(letter: number, acc: number): KeySig {
  const exact = KEYS.find(k => k.letter === letter && k.acc === acc);
  if (exact) return exact;
  const pc = ((SEMI[letter] + acc) % 12 + 12) % 12;
  return KEYS.find(k => ((SEMI[k.letter] + k.acc) % 12 + 12) % 12 === pc) || KEYS[0];
}

function transposeKey(srcKey: KeySig, from: Instrument, to: Instrument): KeySig {
  const tonic: HNote = { letter: srcKey.letter, accidental: srcKey.acc, octave: 4 };
  const t = transposeNote(tonic, from, to);
  return findKey(t.letter, t.accidental);
}

function keySigDisplay(k: KeySig, lang: Lang): string {
  const name = lang === 'ja' ? k.nameJa : lang === 'ko' ? k.nameKo : `${k.name} major`;
  const sf = k.sharps > 0 ? `${k.sharps}♯` : k.flats > 0 ? `${k.flats}♭` : '♮';
  return `${name}（${sf}）`;
}

// ─── Reference Chart Data ───
const CHART_NOTES: HNote[] = [
  {letter:0,accidental:0,octave:4},  // C
  {letter:0,accidental:1,octave:4},  // C#
  {letter:1,accidental:0,octave:4},  // D
  {letter:2,accidental:-1,octave:4}, // Eb
  {letter:2,accidental:0,octave:4},  // E
  {letter:3,accidental:0,octave:4},  // F
  {letter:3,accidental:1,octave:4},  // F#
  {letter:4,accidental:0,octave:4},  // G
  {letter:5,accidental:-1,octave:4}, // Ab
  {letter:5,accidental:0,octave:4},  // A
  {letter:6,accidental:-1,octave:4}, // Bb
  {letter:6,accidental:0,octave:4},  // B
];

const CHART_GROUPS: { label: L5; inst: Instrument; instruments: L5 }[] = [
  { label:{ja:'in B♭（長2度↑）',en:'in B♭ (M2 up)',ko:'in B♭ (장2도↑)',pt:'in B♭ (2ªM↑)',es:'in B♭ (2ªM↑)'},
    inst: instById('bb-clarinet'),
    instruments:{ja:'B♭クラリネット / B♭トランペット / ソプラノサックス / コルネット',en:'B♭ Clarinet / B♭ Trumpet / Soprano Sax / Cornet',ko:'B♭ 클라리넷 / B♭ 트럼펫 / 소프라노 색소폰',pt:'Clarinete B♭ / Trompete B♭ / Sax Soprano',es:'Clarinete B♭ / Trompeta B♭ / Sax Soprano'} },
  { label:{ja:'in A（短3度↑）',en:'in A (m3 up)',ko:'in A (단3도↑)',pt:'in A (3ªm↑)',es:'in A (3ªm↑)'},
    inst: instById('a-clarinet'),
    instruments:{ja:'Aクラリネット',en:'A Clarinet',ko:'A 클라리넷',pt:'Clarinete A',es:'Clarinete A'} },
  { label:{ja:'in E♭（長6度↑）',en:'in E♭ (M6 up)',ko:'in E♭ (장6도↑)',pt:'in E♭ (6ªM↑)',es:'in E♭ (6ªM↑)'},
    inst: instById('alto-sax'),
    instruments:{ja:'アルトサックス / バリトンサックス / E♭クラリネット',en:'Alto Sax / Baritone Sax / E♭ Clarinet',ko:'알토 색소폰 / 바리톤 색소폰 / E♭ 클라리넷',pt:'Sax Alto / Sax Barítono / Clarinete E♭',es:'Sax Alto / Sax Barítono / Clarinete E♭'} },
  { label:{ja:'in F（完全5度↑）',en:'in F (P5 up)',ko:'in F (완전5도↑)',pt:'in F (5ªJ↑)',es:'in F (5ªJ↑)'},
    inst: instById('f-horn'),
    instruments:{ja:'ホルン（F管） / イングリッシュホルン',en:'Horn in F / English Horn',ko:'F 호른 / 잉글리시 호른',pt:'Trompa F / Corne Inglês',es:'Corno F / Corno Inglés'} },
];

// ─── Text Dictionary ───
const T: Record<string, L5> = {
  title:     {ja:'KUON TRANSPOSER',en:'KUON TRANSPOSER',ko:'KUON TRANSPOSER',pt:'KUON TRANSPOSER',es:'KUON TRANSPOSER'},
  subtitle:  {ja:'移調ヘルパー',en:'Transposition Helper',ko:'이조 헬퍼',pt:'Auxiliar de Transposição',es:'Auxiliar de Transposición'},
  tagline:   {ja:'移調楽器の「記譜音⇄実音」変換を、一瞬で。',en:'Instantly convert between written and concert pitch.',ko:'기보음과 실음 변환을 즉시.',pt:'Converta entre altura escrita e real instantaneamente.',es:'Convierte entre altura escrita y real al instante.'},
  from:      {ja:'移調元の楽器',en:'From instrument',ko:'원래 악기',pt:'Instrumento de origem',es:'Instrumento de origen'},
  to:        {ja:'移調先の楽器',en:'To instrument',ko:'목표 악기',pt:'Instrumento de destino',es:'Instrumento de destino'},
  swap:      {ja:'入れ替え',en:'Swap',ko:'교환',pt:'Trocar',es:'Intercambiar'},
  keyTitle:  {ja:'調号の移調',en:'Key Signature Transposition',ko:'조표 이조',pt:'Transposição de Armadura',es:'Transposición de Armadura'},
  keySelect: {ja:'実音の調（Concert Key）',en:'Concert Key',ko:'실음 조',pt:'Tonalidade Real',es:'Tonalidad Real'},
  srcReads:  {ja:'が読む調',en:'reads',ko:'가 읽는 조',pt:'lê',es:'lee'},
  tgtReads:  {ja:'が読む調',en:'reads',ko:'가 읽는 조',pt:'lê',es:'lee'},
  noteTitle: {ja:'音符の移調',en:'Note Transposition',ko:'음표 이조',pt:'Transposição de Notas',es:'Transposición de Notas'},
  notePh:    {ja:'例: C4 D4 Eb4 F4 G4（スペース区切り）',en:'e.g. C4 D4 Eb4 F4 G4 (space-separated)',ko:'예: C4 D4 Eb4 F4 G4 (공백 구분)',pt:'ex: C4 D4 Eb4 F4 G4 (separados por espaço)',es:'ej: C4 D4 Eb4 F4 G4 (separados por espacio)'},
  srcNotes:  {ja:'入力（移調元）',en:'Input (source)',ko:'입력 (원래)',pt:'Entrada (origem)',es:'Entrada (origen)'},
  tgtNotes:  {ja:'出力（移調先）',en:'Output (target)',ko:'출력 (목표)',pt:'Saída (destino)',es:'Salida (destino)'},
  chartTitle:{ja:'移調早見表',en:'Transposition Reference Chart',ko:'이조 조견표',pt:'Tabela de Transposição',es:'Tabla de Transposición'},
  chartDesc: {ja:'実音（Concert Pitch）に対する各管の記譜音。音名のみ表示（オクターブは楽器により異なる）。',en:'Written pitch for each instrument key, relative to concert pitch. Note names only (octave varies by instrument).',ko:'실음에 대한 각 관의 기보음. 음이름만 표시 (옥타브는 악기에 따라 다름).',pt:'Altura escrita para cada instrumento, relativa à altura real. Apenas nomes de notas.',es:'Altura escrita para cada instrumento, relativa a la altura real. Solo nombres de notas.'},
  concert:   {ja:'実音',en:'Concert',ko:'실음',pt:'Real',es:'Real'},
  allInst:   {ja:'全楽器の調号一覧',en:'Key signatures for all instruments',ko:'전 악기 조표 목록',pt:'Armaduras para todos os instrumentos',es:'Armaduras para todos los instrumentos'},
  showAll:   {ja:'全楽器を表示',en:'Show all instruments',ko:'전 악기 표시',pt:'Mostrar todos',es:'Mostrar todos'},
  hideAll:   {ja:'折りたたむ',en:'Collapse',ko:'접기',pt:'Recolher',es:'Contraer'},
  scale:     {ja:'スケールで試す',en:'Try with scale',ko:'스케일로 시도',pt:'Testar com escala',es:'Probar con escala'},
  clear:     {ja:'クリア',en:'Clear',ko:'지우기',pt:'Limpar',es:'Limpiar'},
  about:     {ja:'移調楽器とは',en:'About Transposing Instruments',ko:'이조 악기란',pt:'Sobre Instrumentos Transpositores',es:'Sobre Instrumentos Transpositores'},
  aboutText: {ja:'移調楽器とは、楽譜上の「ド」を演奏したときに実際に鳴る音がC（ハ）以外の音になる楽器のことです。例えばB♭クラリネットで楽譜の「ド」を吹くと、実際にはB♭（変ロ）の音が鳴ります。\n\n吹奏楽やオーケストラでは、異なる調の楽器が共演するため、ある楽器のパート譜を別の楽器で演奏する際に「移調」が必要になります。KUON TRANSPOSERは、この煩雑な計算を一瞬で解決します。',en:'A transposing instrument is one where playing a written C produces a pitch other than concert C. For example, when a B♭ clarinet plays a written C, the actual sound is B♭.\n\nIn wind bands and orchestras, instruments in different keys play together, requiring transposition when sharing parts between instruments. KUON TRANSPOSER solves this calculation instantly.',ko:'이조 악기란 악보상의 "도"를 연주했을 때 실제로 나는 소리가 C(다) 이외의 음이 되는 악기를 말합니다.\n\nKUON TRANSPOSER는 이 복잡한 계산을 즉시 해결합니다.',pt:'Um instrumento transpositor é aquele em que tocar um Dó escrito produz uma nota diferente do Dó real.\n\nKUON TRANSPOSER resolve esse cálculo instantaneamente.',es:'Un instrumento transpositor es aquel en el que tocar un Do escrito produce una nota diferente del Do real.\n\nKUON TRANSPOSER resuelve este cálculo al instante.'},
};

// ─── Styles ───
const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: '#fff', borderRadius: 16, padding: 'clamp(16px,4vw,32px)',
  boxShadow: '0 1px 4px rgba(0,0,0,.06)', ...extra,
});

const sectionTitle = (lang: Lang): React.CSSProperties => ({
  fontFamily: serif, fontSize: 'clamp(18px,4vw,24px)', fontWeight: 700,
  color: '#1e293b', margin: '0 0 12px', letterSpacing: '.02em',
});

// ─── Main Page ───
export default function TransposerPage() {
  const { lang } = useLang();
  const t = (k: string) => T[k]?.[lang] ?? T[k]?.en ?? '';
  const { guardAction, showNudge, setShowNudge } = useRegistrationNudge();

  const [fromId, setFromId] = useState('bb-clarinet');
  const [toId, setToId]     = useState('concert');
  const [keyIdx, setKeyIdx] = useState(0); // index into KEYS
  const [input, setInput]   = useState('');
  const [showAll, setShowAll] = useState(false);

  const fromInst = instById(fromId);
  const toInst   = instById(toId);

  // Key transposition
  const srcKey = useMemo(() => transposeKey(KEYS[keyIdx], instById('concert'), fromInst), [keyIdx, fromId]);
  const tgtKey = useMemo(() => transposeKey(KEYS[keyIdx], instById('concert'), toInst), [keyIdx, toId]);

  // Note transposition
  const transposed = useMemo(() => {
    if (!input.trim()) return [];
    return input.trim().split(/[\s,]+/).map(s => {
      const n = parseNote(s);
      if (!n) return { src: s, dst: null, dstNote: null };
      const d = transposeNote(n, fromInst, toInst);
      return { src: noteName(n), dst: noteName(d), dstNote: d };
    });
  }, [input, fromId, toId]);

  // Reference chart
  const chartData = useMemo(() =>
    CHART_NOTES.map(n => ({
      concert: noteName(n, false),
      cols: CHART_GROUPS.map(g => {
        const r = transposeNote(n, instById('concert'), g.inst);
        return noteName(r, false);
      }),
    })),
  []);

  // All-instrument key list
  const allInstKeys = useMemo(() =>
    INSTRUMENTS.filter(i => i.id !== 'concert').map(i => ({
      inst: i,
      key: transposeKey(KEYS[keyIdx], instById('concert'), i),
    })),
  [keyIdx]);

  const fillScale = () => {
    const k = KEYS[keyIdx];
    const scaleSteps = [0,2,4,5,7,9,11]; // major scale intervals
    const baseMidi = (4+1)*12 + SEMI[k.letter] + k.acc;
    const notes = scaleSteps.map(s => {
      const m = baseMidi + s;
      // find best note name using diatonic approach
      const deg = scaleSteps.indexOf(s);
      const nl = (k.letter + deg) % 7;
      const no = 4 + Math.floor((k.letter + deg) / 7);
      const expected = (no+1)*12 + SEMI[nl];
      const acc = m - expected;
      return noteName({ letter: nl, accidental: acc, octave: no });
    });
    // Add tonic an octave up
    const topNote = noteName({ letter: k.letter, accidental: k.acc, octave: 5 });
    setInput([...notes, topNote].join(' '));
  };

  const swap = () => { setFromId(toId); setToId(fromId); };

  const handleSaveSettings = () => {
    if (guardAction()) return;
    // If not logged in, the nudge is shown by guardAction
  };

  // ─── Instrument selector grouped by family ───
  const InstSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <div style={{ flex: 1, minWidth: 200 }}>
      <label style={{ display: 'block', fontFamily: sans, fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '2px solid #e2e8f0', fontFamily: sans, fontSize: 15, background: '#fff', color: '#1e293b', cursor: 'pointer', appearance: 'auto' }}>
        {FAMILIES.map(f => {
          const items = INSTRUMENTS.filter(i => i.family === f.id);
          if (!items.length) return null;
          return (
            <optgroup key={f.id} label={t5(f.label, lang)}>
              {items.map(i => (
                <option key={i.id} value={i.id}>
                  {t5(i.name, lang)} — {i.key}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
    </div>
  );

  return (
    <AuthGate appName="transposer">
    <RegistrationNudge show={showNudge} onClose={() => setShowNudge(false)} feature="presets" />
    <main style={{ background: BG, minHeight: '100vh', fontFamily: sans, color: '#1e293b' }}>
      {/* ─── Hero ─── */}
      <section style={{ textAlign: 'center', padding: 'clamp(40px,8vw,80px) clamp(16px,4vw,32px) clamp(20px,4vw,40px)' }}>
        <div style={{ display: 'inline-block', background: `linear-gradient(135deg,${ACCENT},#f97316)`, color: '#fff', fontFamily: mono, fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20, letterSpacing: '.1em', marginBottom: 16 }}>TRANSPOSER</div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(28px,6vw,48px)', fontWeight: 800, margin: '0 0 8px', letterSpacing: '.02em', color: '#1e293b' }}>
          {t('title')}
        </h1>
        <p style={{ fontFamily: serif, fontSize: 'clamp(14px,3vw,18px)', color: '#64748b', margin: '0 0 4px' }}>{t('subtitle')}</p>
        <p style={{ fontSize: 'clamp(13px,2.5vw,16px)', color: '#94a3b8', maxWidth: 540, margin: '8px auto 0' }}>{t('tagline')}</p>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 clamp(12px,3vw,24px) clamp(40px,6vw,80px)', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ─── Instrument Selection ─── */}
        <div style={card()}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <InstSelect value={fromId} onChange={setFromId} label={t('from')} />
            <button onClick={swap} style={{ padding: '10px 16px', borderRadius: 10, border: `2px solid ${ACCENT}`, background: 'transparent', color: ACCENT, fontWeight: 700, fontSize: 18, cursor: 'pointer', marginBottom: 1, flexShrink: 0, lineHeight: 1 }} title={t('swap')}>⇄</button>
            <InstSelect value={toId} onChange={setToId} label={t('to')} />
          </div>
          {/* Quick info */}
          {fromInst.semitones !== toInst.semitones && (
            <div style={{ marginTop: 16, padding: '10px 16px', background: `${ACCENT}0a`, borderRadius: 10, borderLeft: `4px solid ${ACCENT}`, fontSize: 14, color: '#78350f' }}>
              {(() => {
                const diff = toInst.semitones - fromInst.semitones;
                const absDiff = Math.abs(((diff % 12) + 12) % 12);
                const dir = lang === 'ja' ? (diff > 0 ? '↑' : '↓') : (diff > 0 ? 'up' : 'down');
                return lang === 'ja'
                  ? `移調元 → 移調先: ${Math.abs(diff)}半音 ${dir}（音名は ${absDiff <= 6 ? absDiff : 12 - absDiff} 半音差）`
                  : `Source → Target: ${Math.abs(diff)} semitones ${dir} (pitch class: ${absDiff <= 6 ? absDiff : 12 - absDiff} semitones)`;
              })()}
            </div>
          )}
        </div>

        {/* ─── Key Signature Transposition ─── */}
        <div style={card()}>
          <h2 style={sectionTitle(lang)}>{t('keyTitle')}</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600, letterSpacing: '.05em' }}>{t('keySelect')}</label>
            <select value={keyIdx} onChange={e => setKeyIdx(Number(e.target.value))}
              style={{ padding: '10px 14px', borderRadius: 10, border: '2px solid #e2e8f0', fontFamily: sans, fontSize: 15, background: '#fff', minWidth: 200 }}>
              {KEYS.map((k, i) => (
                <option key={i} value={i}>{k.name} major / {k.relMinor} — {k.sharps ? `${k.sharps}♯` : k.flats ? `${k.flats}♭` : '♮'}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
            {[
              { inst: fromInst, key: srcKey, color: '#475569' },
              { inst: toInst, key: tgtKey, color: ACCENT },
            ].map(({ inst, key, color }, i) => (
              <div key={i} style={{ padding: '14px 18px', borderRadius: 12, border: `2px solid ${color}22`, background: `${color}08` }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{t5(inst.name, lang)} {t(i === 0 ? 'srcReads' : 'tgtReads')}</div>
                <div style={{ fontFamily: serif, fontSize: 'clamp(20px,4vw,28px)', fontWeight: 700, color }}>
                  {key.name} major
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
                  {lang === 'ja' ? key.nameJa : lang === 'ko' ? key.nameKo : `${key.relMinor}`} — {key.sharps ? `${key.sharps}♯` : key.flats ? `${key.flats}♭` : '♮'}
                </div>
              </div>
            ))}
          </div>

          {/* Expand: all instruments */}
          <div style={{ marginTop: 16 }}>
            <button onClick={() => setShowAll(!showAll)}
              style={{ background: 'none', border: 'none', color: ACCENT, cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: 0 }}>
              {showAll ? `▼ ${t('hideAll')}` : `▶ ${t('showAll')}`}
            </button>
            {showAll && (
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 8 }}>
                {allInstKeys.map(({ inst, key }) => (
                  <div key={inst.id} style={{ padding: '8px 12px', borderRadius: 8, background: '#f8fafc', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>{t5(inst.name, lang)}</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{key.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Note Transposition ─── */}
        <div style={card()}>
          <h2 style={sectionTitle(lang)}>{t('noteTitle')}</h2>
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('notePh')}
              style={{ flex: 1, minWidth: 200, padding: '12px 14px', borderRadius: 10, border: '2px solid #e2e8f0', fontFamily: mono, fontSize: 15, background: '#fff' }}
            />
            <button onClick={fillScale} style={{ padding: '10px 16px', borderRadius: 10, border: `2px solid ${ACCENT}`, background: `${ACCENT}0a`, color: ACCENT, fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t('scale')}
            </button>
            <button onClick={() => setInput('')} style={{ padding: '10px 14px', borderRadius: 10, border: '2px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              {t('clear')}
            </button>
            <button onClick={handleSaveSettings} title={lang === 'ja' ? 'この設定を保存する' : 'Save these settings'} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', background: '#f3f4f6', color: '#6b7280', fontWeight: 500, fontSize: 13, cursor: 'pointer' }}>
              {lang === 'ja' ? '💾 保存' : '💾 Save'}
            </button>
          </div>

          {transposed.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {transposed.map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 56 }}>
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: '#f1f5f9', fontFamily: mono, fontSize: 15, fontWeight: 600, color: '#475569', textAlign: 'center', minWidth: 48 }}>
                    {item.src}
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: 16, lineHeight: 1 }}>↓</div>
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: item.dst ? `${ACCENT}12` : '#fef2f2', fontFamily: mono, fontSize: 15, fontWeight: 700, color: item.dst ? ACCENT : '#ef4444', textAlign: 'center', minWidth: 48, border: item.dst ? `2px solid ${ACCENT}33` : '2px solid #fecaca' }}>
                    {item.dst || '?'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {transposed.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: '#cbd5e1', fontSize: 14 }}>
              {lang === 'ja' ? '音名を入力すると移調結果が表示されます' : 'Enter note names to see transposition results'}
            </div>
          )}
        </div>

        {/* ─── Reference Chart ─── */}
        <div style={card()}>
          <h2 style={sectionTitle(lang)}>{t('chartTitle')}</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.6 }}>{t('chartDesc')}</p>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono, fontSize: 'clamp(13px,2.5vw,15px)', minWidth: 500 }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: `3px solid ${ACCENT}`, fontFamily: sans, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
                    {t('concert')}
                  </th>
                  {CHART_GROUPS.map((g, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'center', borderBottom: `3px solid ${ACCENT}`, fontFamily: sans, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
                      <div>{t5(g.label, lang)}</div>
                      <div style={{ fontSize: 10, fontWeight: 400, color: '#94a3b8', marginTop: 2, whiteSpace: 'normal', maxWidth: 160 }}>{t5(g.instruments, lang)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#fafafa' }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${ACCENT}08`)}
                    onMouseLeave={e => (e.currentTarget.style.background = ri % 2 === 0 ? '#fff' : '#fafafa')}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>{row.concert}</td>
                    {row.cols.map((c, ci) => (
                      <td key={ci} style={{ padding: '10px 12px', textAlign: 'center', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── About (SEO) ─── */}
        <div style={card()}>
          <h2 style={sectionTitle(lang)}>{t('about')}</h2>
          {t('aboutText').split('\n\n').map((p, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.8, color: '#475569', margin: i === 0 ? 0 : '12px 0 0' }}>{p}</p>
          ))}
        </div>

        {/* ─── JSON-LD ─── */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "KUON TRANSPOSER",
          "url": "https://kuon-rnd.com/transposer",
          "applicationCategory": "MusicApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY" },
          "description": "Free browser-based transposition helper for all instruments. Instant key and note transposition with comprehensive reference chart.",
          "creator": { "@type": "Organization", "name": "空音開発 Kuon R&D", "url": "https://kuon-rnd.com" },
        }) }} />

      </div>
    </main>
    </AuthGate>
  );
}
