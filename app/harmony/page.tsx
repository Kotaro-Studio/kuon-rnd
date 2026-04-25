'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { AuthGate } from '@/components/AuthGate';

// ============================================================================
// TYPES
// ============================================================================

type L5 = Partial<Record<Lang, string>> & { en: string };

interface HNote {
  letter: number;     // 0=C,1=D,2=E,3=F,4=G,5=A,6=B
  accidental: number; // -1=flat, 0=natural, 1=sharp
  octave: number;
}

interface ChordSlot { s: string; a: string; t: string; b: string; }

interface HError {
  type: string;
  severity: 'error' | 'warning';
  ci: number;
  ci2?: number;
  voices: string[];
  msg: L5;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LETTERS = ['C','D','E','F','G','A','B'];
const SEMI = [0,2,4,5,7,9,11];

const VOICE_KEYS: ('s'|'a'|'t'|'b')[] = ['s','a','t','b'];
const RANGES: Record<string, [number,number]> = {
  s: [60,79], a: [53,74], t: [48,67], b: [40,62],
};
const RANGE_LABELS: Record<string, string> = { s:'C4–G5', a:'F3–D5', t:'C3–G4', b:'E2–D4' };

const VN: Record<string, L5> = {
  s: { ja:'ソプラノ', en:'Soprano', ko:'소프라노', pt:'Soprano', es:'Soprano' },
  a: { ja:'アルト', en:'Alto', ko:'알토', pt:'Contralto', es:'Contralto' },
  t: { ja:'テノール', en:'Tenor', ko:'테너', pt:'Tenor', es:'Tenor' },
  b: { ja:'バス', en:'Bass', ko:'베이스', pt:'Baixo', es:'Bajo' },
};

interface KeyDef {
  label: string;
  tonic: number; // midi mod 12
  mode: 'M' | 'm';
  sig: number;   // positive=sharps, negative=flats
}

const KEYS: KeyDef[] = [
  { label:'C Major', tonic:0, mode:'M', sig:0 },
  { label:'G Major', tonic:7, mode:'M', sig:1 },
  { label:'D Major', tonic:2, mode:'M', sig:2 },
  { label:'A Major', tonic:9, mode:'M', sig:3 },
  { label:'E Major', tonic:4, mode:'M', sig:4 },
  { label:'B Major', tonic:11, mode:'M', sig:5 },
  { label:'F Major', tonic:5, mode:'M', sig:-1 },
  { label:'Bb Major', tonic:10, mode:'M', sig:-2 },
  { label:'Eb Major', tonic:3, mode:'M', sig:-3 },
  { label:'Ab Major', tonic:8, mode:'M', sig:-4 },
  { label:'Db Major', tonic:1, mode:'M', sig:-5 },
  { label:'A minor', tonic:9, mode:'m', sig:0 },
  { label:'E minor', tonic:4, mode:'m', sig:1 },
  { label:'B minor', tonic:11, mode:'m', sig:2 },
  { label:'F# minor', tonic:6, mode:'m', sig:3 },
  { label:'C# minor', tonic:1, mode:'m', sig:4 },
  { label:'D minor', tonic:2, mode:'m', sig:-1 },
  { label:'G minor', tonic:7, mode:'m', sig:-2 },
  { label:'C minor', tonic:0, mode:'m', sig:-3 },
  { label:'F minor', tonic:5, mode:'m', sig:-4 },
  { label:'Bb minor', tonic:10, mode:'m', sig:-5 },
];

const MAJOR_SCALE = [0,2,4,5,7,9,11];
const HARM_MINOR  = [0,2,3,5,7,8,11];

// ============================================================================
// NOTE UTILITIES
// ============================================================================

function midi(n: HNote): number { return (n.octave+1)*12 + SEMI[n.letter] + n.accidental; }
function staffPos(n: HNote): number { return n.octave*7 + n.letter; }
function noteStr(n: HNote): string {
  const a = n.accidental===1?'#':n.accidental===-1?'b':'';
  return `${LETTERS[n.letter]}${a}${n.octave}`;
}

function parseNote(s: string): HNote | null {
  const m = s.trim().match(/^([A-Ga-g])([#b♯♭]?)(\d)$/);
  if (!m) return null;
  const letter = LETTERS.indexOf(m[1].toUpperCase());
  if (letter < 0) return null;
  const acc = (m[2]==='#'||m[2]==='♯') ? 1 : (m[2]==='b'||m[2]==='♭') ? -1 : 0;
  const oct = parseInt(m[3]);
  if (oct < 1 || oct > 7) return null;
  return { letter, accidental: acc, octave: oct };
}

// ============================================================================
// INTERVAL & THEORY ENGINE
// ============================================================================

function simpleInterval(a: HNote, b: HNote) {
  const ld = ((b.letter - a.letter) % 7 + 7) % 7;
  const sd = ((midi(b) - midi(a)) % 12 + 12) % 12;
  const generic = ld + 1;
  const expected = SEMI[ld];
  const diff = sd - expected;
  const isPerfType = [0,3,4].includes(ld);
  let q = '?';
  if (isPerfType) {
    if (diff===0) q='P'; else if (diff===1) q='A'; else if (diff===-1) q='d';
    else if (diff===2) q='AA'; else if (diff===-2) q='dd';
  } else {
    if (diff===0) q='M'; else if (diff===-1) q='m'; else if (diff===1) q='A';
    else if (diff===-2) q='d'; else if (diff===2) q='AA';
  }
  return { generic, semitones: sd, quality: q };
}

function isP5(a: HNote, b: HNote) {
  const i = simpleInterval(a,b);
  return i.quality==='P' && i.generic===5;
}
function isP8orUnison(a: HNote, b: HNote) {
  return ((midi(b)-midi(a))%12+12)%12 === 0;
}

// ============================================================================
// VOICE LEADING CHECKER
// ============================================================================

function checkAll(
  chords: (Record<string, HNote|null>)[],
  keyDef: KeyDef,
  lang: Lang
): HError[] {
  const errs: HError[] = [];
  const t = (m: L5) => m;

  const pairs: [string,string][] = [['s','a'],['s','t'],['s','b'],['a','t'],['a','b'],['t','b']];

  for (let ci = 0; ci < chords.length; ci++) {
    const c = chords[ci];
    const notes = VOICE_KEYS.map(v => c[v]).filter(Boolean) as HNote[];
    if (notes.length < 2) continue;

    // --- Single-chord checks ---

    // 1. Voice crossing
    for (let i = 0; i < VOICE_KEYS.length - 1; i++) {
      for (let j = i + 1; j < VOICE_KEYS.length; j++) {
        const upper = c[VOICE_KEYS[i]], lower = c[VOICE_KEYS[j]];
        if (upper && lower && midi(upper) < midi(lower)) {
          errs.push({ type:'crossing', severity:'error', ci, voices:[VOICE_KEYS[i],VOICE_KEYS[j]],
            msg: t({
              ja:`和音${ci+1}: ${VN[VOICE_KEYS[i]].ja}(${noteStr(upper)})が${VN[VOICE_KEYS[j]].ja}(${noteStr(lower)})より低い — 声部交差`,
              en:`Chord ${ci+1}: ${VN[VOICE_KEYS[i]].en}(${noteStr(upper)}) is below ${VN[VOICE_KEYS[j]].en}(${noteStr(lower)}) — voice crossing`,
              ko:`화음${ci+1}: ${VN[VOICE_KEYS[i]].ko}(${noteStr(upper)})이/가 ${VN[VOICE_KEYS[j]].ko}(${noteStr(lower)})보다 낮음 — 성부교차`,
              pt:`Acorde ${ci+1}: ${VN[VOICE_KEYS[i]].pt}(${noteStr(upper)}) abaixo de ${VN[VOICE_KEYS[j]].pt}(${noteStr(lower)}) — cruzamento`,
              es:`Acorde ${ci+1}: ${VN[VOICE_KEYS[i]].es}(${noteStr(upper)}) debajo de ${VN[VOICE_KEYS[j]].es}(${noteStr(lower)}) — cruce de voces`,
            })
          });
        }
      }
    }

    // 2. Spacing: S-A ≤ 8ve, A-T ≤ 8ve
    for (const [hi,lo] of [['s','a'],['a','t']] as [string,string][]) {
      const h = c[hi], l = c[lo];
      if (h && l && midi(h) - midi(l) > 12) {
        errs.push({ type:'spacing', severity:'error', ci, voices:[hi,lo],
          msg: t({
            ja:`和音${ci+1}: ${VN[hi].ja}と${VN[lo].ja}の間隔が1オクターブを超過`,
            en:`Chord ${ci+1}: ${VN[hi].en}–${VN[lo].en} spacing exceeds one octave`,
            ko:`화음${ci+1}: ${VN[hi].ko}–${VN[lo].ko} 간격 1옥타브 초과`,
            pt:`Acorde ${ci+1}: Espaçamento ${VN[hi].pt}–${VN[lo].pt} excede uma oitava`,
            es:`Acorde ${ci+1}: Espaciado ${VN[hi].es}–${VN[lo].es} excede una octava`,
          })
        });
      }
    }

    // 3. Range check
    for (const v of VOICE_KEYS) {
      const n = c[v];
      if (!n) continue;
      const m = midi(n);
      const [lo,hi] = RANGES[v];
      if (m < lo || m > hi) {
        errs.push({ type:'range', severity:'warning', ci, voices:[v],
          msg: t({
            ja:`和音${ci+1}: ${VN[v].ja}(${noteStr(n)})が標準音域外 (${RANGE_LABELS[v]})`,
            en:`Chord ${ci+1}: ${VN[v].en}(${noteStr(n)}) out of range (${RANGE_LABELS[v]})`,
            ko:`화음${ci+1}: ${VN[v].ko}(${noteStr(n)}) 음역 초과 (${RANGE_LABELS[v]})`,
            pt:`Acorde ${ci+1}: ${VN[v].pt}(${noteStr(n)}) fora da extensão (${RANGE_LABELS[v]})`,
            es:`Acorde ${ci+1}: ${VN[v].es}(${noteStr(n)}) fuera del rango (${RANGE_LABELS[v]})`,
          })
        });
      }
    }

    // 4. Doubled leading tone
    const scale = keyDef.mode === 'M' ? MAJOR_SCALE : HARM_MINOR;
    const leadingTone = (keyDef.tonic + scale[6]) % 12;
    const ltCount = notes.filter(n => ((midi(n))%12+12)%12 === leadingTone).length;
    if (ltCount >= 2) {
      errs.push({ type:'doubled-lt', severity:'error', ci, voices:['s','a','t','b'],
        msg: t({
          ja:`和音${ci+1}: 導音が重複しています`,
          en:`Chord ${ci+1}: Leading tone is doubled`,
          ko:`화음${ci+1}: 이끔음이 중복됨`,
          pt:`Acorde ${ci+1}: Sensível duplicada`,
          es:`Acorde ${ci+1}: Sensible duplicada`,
        })
      });
    }

    // --- Two-chord checks ---
    if (ci === 0) continue;
    const prev = chords[ci-1];
    const prevNotes = VOICE_KEYS.map(v => prev[v]).filter(Boolean) as HNote[];
    if (prevNotes.length < 2) continue;

    for (const [v1, v2] of pairs) {
      const pa = prev[v1], pb = prev[v2], ca = c[v1], cb = c[v2];
      if (!pa || !pb || !ca || !cb) continue;

      // 5. Parallel 5ths
      if (isP5(pa,pb) && isP5(ca,cb) && (midi(pa)!==midi(ca) || midi(pb)!==midi(cb))) {
        errs.push({ type:'parallel-5', severity:'error', ci, ci2:ci-1, voices:[v1,v2],
          msg: t({
            ja:`和音${ci}→${ci+1}: ${VN[v1].ja}と${VN[v2].ja}の間で並達5度`,
            en:`Chord ${ci}→${ci+1}: Parallel 5ths between ${VN[v1].en} and ${VN[v2].en}`,
            ko:`화음${ci}→${ci+1}: ${VN[v1].ko}와 ${VN[v2].ko} 사이 병행 5도`,
            pt:`Acorde ${ci}→${ci+1}: Quintas paralelas entre ${VN[v1].pt} e ${VN[v2].pt}`,
            es:`Acorde ${ci}→${ci+1}: Quintas paralelas entre ${VN[v1].es} y ${VN[v2].es}`,
          })
        });
      }

      // 6. Parallel octaves / unisons
      if (isP8orUnison(pa,pb) && isP8orUnison(ca,cb) && (midi(pa)!==midi(ca) || midi(pb)!==midi(cb))) {
        errs.push({ type:'parallel-8', severity:'error', ci, ci2:ci-1, voices:[v1,v2],
          msg: t({
            ja:`和音${ci}→${ci+1}: ${VN[v1].ja}と${VN[v2].ja}の間で並達8度（1度）`,
            en:`Chord ${ci}→${ci+1}: Parallel octaves between ${VN[v1].en} and ${VN[v2].en}`,
            ko:`화음${ci}→${ci+1}: ${VN[v1].ko}와 ${VN[v2].ko} 사이 병행 8도`,
            pt:`Acorde ${ci}→${ci+1}: Oitavas paralelas entre ${VN[v1].pt} e ${VN[v2].pt}`,
            es:`Acorde ${ci}→${ci+1}: Octavas paralelas entre ${VN[v1].es} y ${VN[v2].es}`,
          })
        });
      }

      // 7. Hidden/direct 5ths and 8ths (outer voices only: S & B)
      if (v1==='s' && v2==='b') {
        const dir1 = Math.sign(midi(ca) - midi(pa));
        const dir2 = Math.sign(midi(cb) - midi(pb));
        if (dir1 !== 0 && dir1 === dir2) {
          // Similar motion to P5
          if (isP5(ca,cb) && !isP5(pa,pb)) {
            const sopStep = Math.abs(midi(ca) - midi(pa));
            if (sopStep > 2) { // not stepwise
              errs.push({ type:'hidden-5', severity:'warning', ci, ci2:ci-1, voices:['s','b'],
                msg: t({
                  ja:`和音${ci}→${ci+1}: 外声の隠伏5度（ソプラノが跳躍）`,
                  en:`Chord ${ci}→${ci+1}: Hidden 5ths in outer voices (soprano leaps)`,
                  ko:`화음${ci}→${ci+1}: 외성 은복 5도 (소프라노 도약)`,
                  pt:`Acorde ${ci}→${ci+1}: Quintas ocultas nas vozes externas`,
                  es:`Acorde ${ci}→${ci+1}: Quintas ocultas en voces externas`,
                })
              });
            }
          }
          // Similar motion to P8
          if (isP8orUnison(ca,cb) && !isP8orUnison(pa,pb)) {
            const sopStep = Math.abs(midi(ca) - midi(pa));
            if (sopStep > 2) {
              errs.push({ type:'hidden-8', severity:'warning', ci, ci2:ci-1, voices:['s','b'],
                msg: t({
                  ja:`和音${ci}→${ci+1}: 外声の隠伏8度（ソプラノが跳躍）`,
                  en:`Chord ${ci}→${ci+1}: Hidden octaves in outer voices (soprano leaps)`,
                  ko:`화음${ci}→${ci+1}: 외성 은복 8도 (소프라노 도약)`,
                  pt:`Acorde ${ci}→${ci+1}: Oitavas ocultas nas vozes externas`,
                  es:`Acorde ${ci}→${ci+1}: Octavas ocultas en voces externas`,
                })
              });
            }
          }
        }
      }
    }

    // 8. Voice overlap
    for (let vi = 0; vi < VOICE_KEYS.length - 1; vi++) {
      const upper = VOICE_KEYS[vi], lower = VOICE_KEYS[vi+1];
      const prevUpper = prev[upper], curLower = c[lower];
      const prevLower = prev[lower], curUpper = c[upper];
      if (prevUpper && curLower && midi(curLower) > midi(prevUpper)) {
        errs.push({ type:'overlap', severity:'warning', ci, ci2:ci-1, voices:[upper,lower],
          msg: t({
            ja:`和音${ci}→${ci+1}: ${VN[lower].ja}が前の${VN[upper].ja}を超越（声部超越）`,
            en:`Chord ${ci}→${ci+1}: ${VN[lower].en} overlaps previous ${VN[upper].en}`,
            ko:`화음${ci}→${ci+1}: ${VN[lower].ko}이/가 이전 ${VN[upper].ko}를 초과`,
            pt:`Acorde ${ci}→${ci+1}: ${VN[lower].pt} ultrapassa ${VN[upper].pt} anterior`,
            es:`Acorde ${ci}→${ci+1}: ${VN[lower].es} supera ${VN[upper].es} anterior`,
          })
        });
      }
      if (prevLower && curUpper && midi(curUpper) < midi(prevLower)) {
        errs.push({ type:'overlap', severity:'warning', ci, ci2:ci-1, voices:[upper,lower],
          msg: t({
            ja:`和音${ci}→${ci+1}: ${VN[upper].ja}が前の${VN[lower].ja}の下に（声部超越）`,
            en:`Chord ${ci}→${ci+1}: ${VN[upper].en} drops below previous ${VN[lower].en}`,
            ko:`화음${ci}→${ci+1}: ${VN[upper].ko}이/가 이전 ${VN[lower].ko} 아래로`,
            pt:`Acorde ${ci}→${ci+1}: ${VN[upper].pt} cai abaixo de ${VN[lower].pt} anterior`,
            es:`Acorde ${ci}→${ci+1}: ${VN[upper].es} cae debajo de ${VN[lower].es} anterior`,
          })
        });
      }
    }

    // 9. Augmented 2nd in melodic motion
    for (const v of VOICE_KEYS) {
      const pn = prev[v], cn = c[v];
      if (!pn || !cn) continue;
      const semis = Math.abs(midi(cn) - midi(pn));
      const letDist = Math.abs(cn.letter - pn.letter);
      if (semis === 3 && (letDist === 1 || letDist === 6)) {
        errs.push({ type:'aug2', severity:'warning', ci, ci2:ci-1, voices:[v],
          msg: t({
            ja:`和音${ci}→${ci+1}: ${VN[v].ja}に旋律的増2度 (${noteStr(pn)}→${noteStr(cn)})`,
            en:`Chord ${ci}→${ci+1}: Augmented 2nd in ${VN[v].en} (${noteStr(pn)}→${noteStr(cn)})`,
            ko:`화음${ci}→${ci+1}: ${VN[v].ko}에서 증2도 (${noteStr(pn)}→${noteStr(cn)})`,
            pt:`Acorde ${ci}→${ci+1}: 2ª aumentada em ${VN[v].pt} (${noteStr(pn)}→${noteStr(cn)})`,
            es:`Acorde ${ci}→${ci+1}: 2ª aumentada en ${VN[v].es} (${noteStr(pn)}→${noteStr(cn)})`,
          })
        });
      }
    }

    // 10. Unresolved leading tone (soprano)
    const prevS = prev['s'];
    const curS = c['s'];
    if (prevS && curS) {
      const prevPC = ((midi(prevS))%12+12)%12;
      if (prevPC === leadingTone) {
        const tonicPC = keyDef.tonic;
        const curPC = ((midi(curS))%12+12)%12;
        if (curPC !== tonicPC) {
          errs.push({ type:'lt-resolve', severity:'warning', ci, ci2:ci-1, voices:['s'],
            msg: t({
              ja:`和音${ci}→${ci+1}: ソプラノの導音(${noteStr(prevS)})が主音に解決していない`,
              en:`Chord ${ci}→${ci+1}: Leading tone in soprano (${noteStr(prevS)}) doesn't resolve to tonic`,
              ko:`화음${ci}→${ci+1}: 소프라노의 이끔음(${noteStr(prevS)})이 으뜸음으로 해결되지 않음`,
              pt:`Acorde ${ci}→${ci+1}: Sensível no soprano (${noteStr(prevS)}) não resolve à tônica`,
              es:`Acorde ${ci}→${ci+1}: Sensible en soprano (${noteStr(prevS)}) no resuelve a tónica`,
            })
          });
        }
      }
    }
  }

  return errs;
}

// ============================================================================
// CHORD IDENTIFIER
// ============================================================================

function identifyChord(notes: HNote[], keyDef: KeyDef): string {
  if (notes.length < 3) return '?';
  const pcs = [...new Set(notes.map(n => ((midi(n))%12+12)%12))].sort((a,b)=>a-b);
  if (pcs.length < 3) return '?';

  const bassPC = ((midi(notes[notes.length-1]))%12+12)%12;
  const scale = keyDef.mode === 'M' ? MAJOR_SCALE : HARM_MINOR;
  const degreeNames = keyDef.mode === 'M'
    ? ['I','ii','iii','IV','V','vi','vii°']
    : ['i','ii°','III','iv','V','VI','vii°'];

  // try each pc as root
  for (const root of pcs) {
    const intervals = pcs.map(pc => ((pc - root)%12+12)%12).sort((a,b)=>a-b);
    const setStr = intervals.join(',');
    let quality = '';
    if (setStr.includes('0,4,7')) quality = 'M';
    else if (setStr.includes('0,3,7')) quality = 'm';
    else if (setStr.includes('0,3,6')) quality = 'dim';
    else if (setStr.includes('0,4,8')) quality = 'aug';
    else continue;

    const has7 = intervals.includes(10) ? '7' : intervals.includes(11) ? 'M7' : intervals.includes(9) ? '6' : '';

    const degree = scale.findIndex(s => ((keyDef.tonic + s) % 12) === root);
    if (degree < 0) {
      const noteNames = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
      const inv = root !== bassPC ? '/'+noteNames[bassPC] : '';
      return noteNames[root] + (quality==='m'?'m':quality==='dim'?'°':quality==='aug'?'+':'') + has7 + inv;
    }

    const roman = degreeNames[degree];
    const inv = root !== bassPC ? (() => {
      const bassIdx = scale.findIndex(s => ((keyDef.tonic + s) % 12) === bassPC);
      if (bassIdx >= 0) {
        const intFromRoot = ((bassPC - root)%12+12)%12;
        if (intFromRoot === 3 || intFromRoot === 4) return has7 ? '⁶₅' : '⁶';
        if (intFromRoot === 7) return has7 ? '⁴₃' : '⁶₄';
        if (intFromRoot === 10 || intFromRoot === 11) return '⁴₂';
      }
      return '';
    })() : (has7 ? '⁷' : '');

    return roman + inv;
  }
  return '?';
}

// ============================================================================
// CANVAS STAFF RENDERER
// ============================================================================

const LS = 9;   // line spacing
const STEP = LS / 2;
const TREBLE_BOT_Y = 80;
const BASS_BOT_Y = 165;
const TREBLE_BOT_POS = 30; // E4
const BASS_BOT_POS = 18;   // G2
const NOTE_RX = 5.5, NOTE_RY = 4;
const LEFT_M = 50;

function drawStaff(
  ctx: CanvasRenderingContext2D,
  w: number,
  chords: (Record<string, HNote|null>)[],
  errors: HError[],
  activeCol: number,
) {
  const h = 230;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, w, h);

  // Draw staves
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    const ty = TREBLE_BOT_Y - i * LS;
    const by = BASS_BOT_Y - i * LS;
    ctx.beginPath(); ctx.moveTo(LEFT_M - 10, ty); ctx.lineTo(w - 10, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(LEFT_M - 10, by); ctx.lineTo(w - 10, by); ctx.stroke();
  }

  // Clef labels
  ctx.font = '28px serif';
  ctx.fillStyle = '#555';
  ctx.fillText('𝄞', LEFT_M - 40, TREBLE_BOT_Y - LS + 4);
  ctx.fillText('𝄢', LEFT_M - 40, BASS_BOT_Y - LS + 4);

  if (chords.length === 0) return;

  const usable = w - LEFT_M - 20;
  const colW = Math.min(usable / chords.length, 80);

  // Error sets for coloring
  const errSet = new Set<string>();
  errors.forEach(e => {
    if (e.severity === 'error') {
      e.voices.forEach(v => { errSet.add(`${e.ci}-${v}`); if (e.ci2 !== undefined) errSet.add(`${e.ci2}-${v}`); });
    }
  });

  for (let ci = 0; ci < chords.length; ci++) {
    const cx = LEFT_M + ci * colW + colW / 2;
    const c = chords[ci];

    // Active column highlight
    if (ci === activeCol) {
      ctx.fillStyle = 'rgba(236,72,153,0.06)';
      ctx.fillRect(cx - colW/2 + 2, 0, colW - 4, h);
    }

    // Chord number
    ctx.fillStyle = '#bbb';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`${ci+1}`, cx, h - 5);

    // Draw notes
    const drawNote = (n: HNote, voice: string) => {
      const isTreble = voice === 's' || voice === 'a';
      const refY = isTreble ? TREBLE_BOT_Y : BASS_BOT_Y;
      const refPos = isTreble ? TREBLE_BOT_POS : BASS_BOT_POS;
      const sp = staffPos(n);
      const ny = refY - (sp - refPos) * STEP;

      // Ledger lines
      const staffTop = refY - 4 * LS;
      const staffBot = refY;
      if (ny > staffBot) {
        for (let ly = staffBot + LS; ly <= ny + 1; ly += LS) {
          ctx.strokeStyle = '#999'; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(cx - 8, ly); ctx.lineTo(cx + 8, ly); ctx.stroke();
        }
      }
      if (ny < staffTop) {
        for (let ly = staffTop - LS; ly >= ny - 1; ly -= LS) {
          ctx.strokeStyle = '#999'; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(cx - 8, ly); ctx.lineTo(cx + 8, ly); ctx.stroke();
        }
      }

      // Note head
      const hasErr = errSet.has(`${ci}-${voice}`);
      ctx.fillStyle = hasErr ? '#ef4444' : (voice === 's' || voice === 't') ? '#1e293b' : '#6366f1';
      ctx.beginPath();
      ctx.ellipse(cx, ny, NOTE_RX, NOTE_RY, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      const stemUp = voice === 's' || voice === 't';
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (stemUp) { ctx.moveTo(cx + NOTE_RX - 0.5, ny); ctx.lineTo(cx + NOTE_RX - 0.5, ny - 28); }
      else { ctx.moveTo(cx - NOTE_RX + 0.5, ny); ctx.lineTo(cx - NOTE_RX + 0.5, ny + 28); }
      ctx.stroke();

      // Accidental
      if (n.accidental !== 0) {
        ctx.fillStyle = hasErr ? '#ef4444' : '#555';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(n.accidental === 1 ? '♯' : '♭', cx - NOTE_RX - 2, ny + 4);
      }
    };

    for (const v of VOICE_KEYS) {
      const n = c[v];
      if (n) drawNote(n, v);
    }

    // Draw parallel error lines
    errors.filter(e => (e.type === 'parallel-5' || e.type === 'parallel-8') && e.ci === ci && e.ci2 !== undefined).forEach(e => {
      const pcx = LEFT_M + e.ci2! * colW + colW / 2;
      e.voices.forEach(v => {
        const pn = chords[e.ci2!][v], cn = c[v];
        if (!pn || !cn) return;
        const isTr = v === 's' || v === 'a';
        const ref = isTr ? TREBLE_BOT_Y : BASS_BOT_Y;
        const refP = isTr ? TREBLE_BOT_POS : BASS_BOT_POS;
        const py = ref - (staffPos(pn) - refP) * STEP;
        const cy = ref - (staffPos(cn) - refP) * STEP;
        ctx.strokeStyle = 'rgba(239,68,68,0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(pcx, py); ctx.lineTo(cx, cy); ctx.stroke();
        ctx.setLineDash([]);
      });
    });
  }
  ctx.textAlign = 'start';
}

// ============================================================================
// STYLES
// ============================================================================

const ACCENT = '#ec4899';
const BG = '#fafafa';

const containerStyle: React.CSSProperties = {
  maxWidth: 1100, margin: '0 auto', padding: 'clamp(16px,4vw,32px)',
  fontFamily: '"Helvetica Neue",Arial,sans-serif', color: '#1e293b', background: BG, minHeight: '100vh',
};
const headerStyle: React.CSSProperties = {
  textAlign: 'center', marginBottom: 32,
};
const titleStyle: React.CSSProperties = {
  fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700, letterSpacing: 2,
  background: `linear-gradient(135deg, ${ACCENT}, #be185d)`,
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
};
const badgeStyle: React.CSSProperties = {
  display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
  padding: '3px 10px', borderRadius: 4, background: '#fdf2f8', color: ACCENT, marginBottom: 8,
};
const controlRow: React.CSSProperties = {
  display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16,
};
const selectStyle: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, background: '#fff',
};
const btnStyle: React.CSSProperties = {
  padding: '6px 16px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600,
  cursor: 'pointer', background: ACCENT, color: '#fff',
};
const btnOutline: React.CSSProperties = {
  ...btnStyle, background: 'transparent', color: ACCENT, border: `1px solid ${ACCENT}`,
};
const gridWrap: React.CSSProperties = {
  overflowX: 'auto', marginBottom: 16,
};
const cellInput: React.CSSProperties = {
  width: 56, padding: '4px 6px', fontSize: 13, fontFamily: 'monospace',
  border: '1px solid #ddd', borderRadius: 4, textAlign: 'center', outline: 'none',
};
const errPanel: React.CSSProperties = {
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
  padding: 16, maxHeight: 260, overflowY: 'auto',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HarmonyPage() {
  const { lang } = useLang();
  const t = (m: L5) => m[lang] ?? m.en;

  const [keyIdx, setKeyIdx] = useState(0);
  const [chords, setChords] = useState<ChordSlot[]>([
    { s:'', a:'', t:'', b:'' },
    { s:'', a:'', t:'', b:'' },
    { s:'', a:'', t:'', b:'' },
    { s:'', a:'', t:'', b:'' },
  ]);
  const [activeCol, setActiveCol] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parse all chords
  const parsed: (Record<string, HNote|null>)[] = chords.map(c => ({
    s: parseNote(c.s), a: parseNote(c.a), t: parseNote(c.t), b: parseNote(c.b),
  }));

  // Run checks
  const errors = checkAll(parsed, KEYS[keyIdx], lang);

  // Chord labels
  const chordLabels = parsed.map(c => {
    const notes = VOICE_KEYS.map(v => c[v]).filter(Boolean) as HNote[];
    return notes.length >= 3 ? identifyChord(notes, KEYS[keyIdx]) : '';
  });

  // Canvas rendering
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = cvs.getBoundingClientRect();
    cvs.width = rect.width * dpr;
    cvs.height = 230 * dpr;
    ctx.scale(dpr, dpr);
    drawStaff(ctx, rect.width, parsed, errors, activeCol);
  }, [parsed, errors, activeCol]);

  // Handlers
  const updateCell = useCallback((ci: number, v: string, val: string) => {
    setChords(prev => {
      const next = [...prev];
      next[ci] = { ...next[ci], [v]: val };
      return next;
    });
  }, []);

  const addChord = () => {
    if (chords.length >= 24) return;
    setChords(prev => [...prev, { s:'', a:'', t:'', b:'' }]);
  };
  const removeChord = () => {
    if (chords.length <= 1) return;
    setChords(prev => prev.slice(0, -1));
    if (activeCol >= chords.length - 1) setActiveCol(Math.max(0, chords.length - 2));
  };
  const clearAll = () => {
    setChords([{ s:'', a:'', t:'', b:'' },{ s:'', a:'', t:'', b:'' },{ s:'', a:'', t:'', b:'' },{ s:'', a:'', t:'', b:'' }]);
    setActiveCol(0);
  };

  const errCount = errors.filter(e => e.severity === 'error').length;
  const warnCount = errors.filter(e => e.severity === 'warning').length;

  return (
    <AuthGate appName="harmony">
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={badgeStyle}>VOICE LEADING CHECKER</div>
        <h1 style={titleStyle}>KUON HARMONY</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
          {t({
            ja: '四声体和声のリアルタイムチェッカー。並達5度・8度、声部交差、音域逸脱などを即座に検出。',
            en: 'Real-time SATB voice leading checker. Detects parallel 5ths/8ths, voice crossing, range violations instantly.',
            ko: '4성부 화성 실시간 체커. 병행 5도/8도, 성부교차, 음역 초과를 즉시 검출.',
            pt: 'Verificador em tempo real de condução de vozes SATB. Detecta quintas/oitavas paralelas, cruzamento e extensão.',
            es: 'Verificador en tiempo real de conducción de voces SATB. Detecta quintas/octavas paralelas, cruces y extensión.',
          })}
        </p>
      </header>

      {/* Controls */}
      <div style={controlRow}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          {t({ ja:'調', en:'Key', ko:'조', pt:'Tonalidade', es:'Tonalidad' })}:
        </label>
        <select style={selectStyle} value={keyIdx} onChange={e => setKeyIdx(Number(e.target.value))}>
          {KEYS.map((k, i) => <option key={i} value={i}>{k.label}</option>)}
        </select>
        <button style={btnStyle} onClick={addChord}>
          + {t({ ja:'和音追加', en:'Add Chord', ko:'화음 추가', pt:'Adicionar', es:'Añadir' })}
        </button>
        <button style={btnOutline} onClick={removeChord}>
          − {t({ ja:'削除', en:'Remove', ko:'삭제', pt:'Remover', es:'Eliminar' })}
        </button>
        <button style={{ ...btnOutline, color: '#94a3b8', borderColor: '#cbd5e1' }} onClick={clearAll}>
          {t({ ja:'リセット', en:'Reset', ko:'초기화', pt:'Resetar', es:'Resetear' })}
        </button>
      </div>

      {/* Staff Canvas */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '12px 8px', marginBottom: 16 }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: 230, display: 'block' }}
        />
      </div>

      {/* Input Grid */}
      <div style={gridWrap}>
        <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 8px', fontSize: 11, color: '#94a3b8', textAlign: 'left' }}></th>
              {chords.map((_, ci) => (
                <th key={ci} style={{
                  padding: '4px 6px', fontSize: 11, fontWeight: 600,
                  color: ci === activeCol ? ACCENT : '#94a3b8', textAlign: 'center',
                  borderBottom: ci === activeCol ? `2px solid ${ACCENT}` : '2px solid transparent',
                  cursor: 'pointer',
                }} onClick={() => setActiveCol(ci)}>
                  {ci + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VOICE_KEYS.map(v => (
              <tr key={v}>
                <td style={{
                  padding: '3px 8px', fontWeight: 700, fontSize: 12,
                  color: v === 's' || v === 't' ? '#1e293b' : '#6366f1',
                  whiteSpace: 'nowrap',
                }}>
                  {VN[v][lang]}
                  <span style={{ fontWeight: 400, fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>
                    {RANGE_LABELS[v]}
                  </span>
                </td>
                {chords.map((c, ci) => {
                  const hasErr = errors.some(e => e.severity === 'error' && e.ci === ci && e.voices.includes(v));
                  const hasWarn = !hasErr && errors.some(e => e.severity === 'warning' && e.ci === ci && e.voices.includes(v));
                  const note = parsed[ci][v];
                  return (
                    <td key={ci} style={{ padding: 2 }}>
                      <input
                        style={{
                          ...cellInput,
                          borderColor: hasErr ? '#ef4444' : hasWarn ? '#f59e0b' : ci === activeCol ? ACCENT : '#ddd',
                          background: hasErr ? '#fef2f2' : hasWarn ? '#fffbeb' : note ? '#f0fdf4' : '#fff',
                        }}
                        value={c[v]}
                        placeholder={v === 's' ? 'C5' : v === 'a' ? 'E4' : v === 't' ? 'G3' : 'C3'}
                        onChange={e => updateCell(ci, v, e.target.value)}
                        onFocus={() => setActiveCol(ci)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Chord label row */}
            <tr>
              <td style={{ padding: '3px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                {t({ ja:'和音', en:'Chord', ko:'화음', pt:'Acorde', es:'Acorde' })}
              </td>
              {chordLabels.map((lbl, ci) => (
                <td key={ci} style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#1e293b', padding: '4px 2px' }}>
                  {lbl}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Input Help */}
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
        {t({
          ja: '入力形式: C4, Eb3, F#5, Bb2 など（音名＋臨時記号＋オクターブ）。Tab キーで次のセルへ。',
          en: 'Format: C4, Eb3, F#5, Bb2 (note + accidental + octave). Tab to move between cells.',
          ko: '입력 형식: C4, Eb3, F#5, Bb2 (음이름 + 임시표 + 옥타브). Tab으로 이동.',
          pt: 'Formato: C4, Eb3, F#5, Bb2 (nota + acidente + oitava). Tab para mover.',
          es: 'Formato: C4, Eb3, F#5, Bb2 (nota + accidental + octava). Tab para mover.',
        })}
      </div>

      {/* Error Panel */}
      <div style={errPanel}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: errCount > 0 ? '#ef4444' : '#22c55e' }}>
            {errCount > 0
              ? `${errCount} ${t({ ja:'エラー', en:'error(s)', ko:'오류', pt:'erro(s)', es:'error(es)' })}`
              : t({ ja:'エラーなし', en:'No errors', ko:'오류 없음', pt:'Sem erros', es:'Sin errores' })
            }
          </span>
          {warnCount > 0 && (
            <span style={{ color: '#f59e0b' }}>
              {warnCount} {t({ ja:'警告', en:'warning(s)', ko:'경고', pt:'aviso(s)', es:'advertencia(s)' })}
            </span>
          )}
        </div>
        {errors.length === 0 && parsed.some(c => VOICE_KEYS.some(v => c[v])) && (
          <p style={{ color: '#22c55e', fontSize: 14 }}>
            ✓ {t({
              ja: '検出された問題はありません。',
              en: 'No voice leading issues detected.',
              ko: '검출된 문제가 없습니다.',
              pt: 'Nenhum problema de condução de vozes detectado.',
              es: 'No se detectaron problemas de conducción de voces.',
            })}
          </p>
        )}
        {errors.map((e, i) => (
          <div key={i} style={{
            padding: '6px 10px', marginBottom: 4, borderRadius: 6, fontSize: 13,
            background: e.severity === 'error' ? '#fef2f2' : '#fffbeb',
            borderLeft: `3px solid ${e.severity === 'error' ? '#ef4444' : '#f59e0b'}`,
          }}>
            <span style={{ fontWeight: 600, color: e.severity === 'error' ? '#ef4444' : '#f59e0b', marginRight: 6 }}>
              {e.severity === 'error' ? '✕' : '⚠'}
            </span>
            {e.msg[lang]}
          </div>
        ))}
      </div>

      {/* Rules Reference */}
      <details style={{ marginTop: 24 }}>
        <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#64748b' }}>
          {t({
            ja: '検出ルール一覧（10項目）',
            en: 'Detection Rules (10 items)',
            ko: '검출 규칙 목록 (10항목)',
            pt: 'Regras de Detecção (10 itens)',
            es: 'Reglas de Detección (10 elementos)',
          })}
        </summary>
        <div style={{ marginTop: 12, fontSize: 13, color: '#475569', lineHeight: 2 }}>
          {[
            { ja:'並達5度（Parallel 5ths）', en:'Parallel perfect 5ths', ko:'병행 완전5도', pt:'Quintas paralelas', es:'Quintas paralelas' },
            { ja:'並達8度・1度（Parallel 8ves / unisons）', en:'Parallel octaves / unisons', ko:'병행 8도 / 1도', pt:'Oitavas paralelas', es:'Octavas paralelas' },
            { ja:'隠伏5度・8度（Hidden 5ths/8ves）— 外声のみ', en:'Hidden 5ths/8ves — outer voices only', ko:'은복 5도/8도 — 외성만', pt:'5ªs/8ªs ocultas — vozes externas', es:'5ªs/8ªs ocultas — voces externas' },
            { ja:'声部交差（Voice crossing）', en:'Voice crossing', ko:'성부교차', pt:'Cruzamento de vozes', es:'Cruce de voces' },
            { ja:'声部超越（Voice overlap）', en:'Voice overlap', ko:'성부초월', pt:'Sobreposição de vozes', es:'Superposición de voces' },
            { ja:'声部間隔超過（S-A, A-T > 8ve）', en:'Spacing violation (S-A, A-T > octave)', ko:'성부 간격 초과', pt:'Espaçamento excessivo', es:'Espaciado excesivo' },
            { ja:'音域逸脱', en:'Voice range violation', ko:'음역 초과', pt:'Extensão excedida', es:'Extensión excedida' },
            { ja:'導音重複（Doubled leading tone）', en:'Doubled leading tone', ko:'이끔음 중복', pt:'Sensível duplicada', es:'Sensible duplicada' },
            { ja:'旋律的増2度（Augmented 2nd）', en:'Melodic augmented 2nd', ko:'선율적 증2도', pt:'2ª aumentada melódica', es:'2ª aumentada melódica' },
            { ja:'導音未解決（ソプラノ）', en:'Unresolved leading tone (soprano)', ko:'이끔음 미해결 (소프라노)', pt:'Sensível não resolvida (soprano)', es:'Sensible no resuelta (soprano)' },
          ].map((rule, i) => (
            <div key={i}>
              <span style={{ fontWeight: 600, color: ACCENT, marginRight: 6 }}>{i+1}.</span>
              {(rule as Record<string, string>)[lang] ?? rule.en}
            </div>
          ))}
        </div>
      </details>

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: 40, paddingTop: 20, borderTop: '1px solid #e5e7eb', color: '#94a3b8', fontSize: 12 }}>
        KUON HARMONY — 空音開発 Kuon R&D
      </footer>
    </div>
    </AuthGate>
  );
}
