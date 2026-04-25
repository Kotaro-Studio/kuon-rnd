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
  letter: number;     // 0=C..6=B
  accidental: number; // -1 flat, 0 natural, 1 sharp
  octave: number;
}

interface CPError {
  type: string;
  severity: 'error' | 'warning';
  idx: number;
  idx2?: number;
  msg: L5;
}

type Species = 1 | 2 | 3 | 4;
type CFPosition = 'lower' | 'upper';

// ============================================================================
// CONSTANTS
// ============================================================================

const LETTERS = ['C','D','E','F','G','A','B'];
const SEMI = [0,2,4,5,7,9,11];

const SPECIES_LABELS: Record<Species, L5> = {
  1: { ja:'第1類（1:1）', en:'1st Species (1:1)', ko:'제1류 (1:1)', pt:'1ª Espécie (1:1)', es:'1ª Especie (1:1)' },
  2: { ja:'第2類（2:1）', en:'2nd Species (2:1)', ko:'제2류 (2:1)', pt:'2ª Espécie (2:1)', es:'2ª Especie (2:1)' },
  3: { ja:'第3類（4:1）', en:'3rd Species (4:1)', ko:'제3류 (4:1)', pt:'3ª Espécie (4:1)', es:'3ª Especie (4:1)' },
  4: { ja:'第4類（掛留）', en:'4th Species (Sync.)', ko:'제4류 (걸류)', pt:'4ª Espécie (Síncope)', es:'4ª Especie (Síncopa)' },
};

// Intervals classified
// P consonances: P1(0), P5(7), P8(12)
// Imperfect consonances: m3(3), M3(4), m6(8), M6(9)
// Dissonances: m2(1), M2(2), P4(5), A4/d5(6), m7(10), M7(11)

function isConsonant(semi: number): boolean {
  const s = ((semi % 12) + 12) % 12;
  return [0,3,4,7,8,9].includes(s);
}
function isPerfectCons(semi: number): boolean {
  const s = ((semi % 12) + 12) % 12;
  return [0,7].includes(s); // P1, P5 (P8 = 0 mod 12)
}
function isImperfectCons(semi: number): boolean {
  const s = ((semi % 12) + 12) % 12;
  return [3,4,8,9].includes(s);
}

function intervalName(semi: number, lang: Lang): string {
  const s = ((semi % 12) + 12) % 12;
  const names: Record<number, L5> = {
    0: { ja:'完全1度', en:'P1', ko:'완전1도', pt:'1ªJ', es:'1ªJ' },
    1: { ja:'短2度', en:'m2', ko:'단2도', pt:'2ªm', es:'2ªm' },
    2: { ja:'長2度', en:'M2', ko:'장2도', pt:'2ªM', es:'2ªM' },
    3: { ja:'短3度', en:'m3', ko:'단3도', pt:'3ªm', es:'3ªm' },
    4: { ja:'長3度', en:'M3', ko:'장3도', pt:'3ªM', es:'3ªM' },
    5: { ja:'完全4度', en:'P4', ko:'완전4도', pt:'4ªJ', es:'4ªJ' },
    6: { ja:'三全音', en:'TT', ko:'삼전음', pt:'TT', es:'TT' },
    7: { ja:'完全5度', en:'P5', ko:'완전5도', pt:'5ªJ', es:'5ªJ' },
    8: { ja:'短6度', en:'m6', ko:'단6도', pt:'6ªm', es:'6ªm' },
    9: { ja:'長6度', en:'M6', ko:'장6도', pt:'6ªM', es:'6ªM' },
    10:{ ja:'短7度', en:'m7', ko:'단7도', pt:'7ªm', es:'7ªm' },
    11:{ ja:'長7度', en:'M7', ko:'장7도', pt:'7ªM', es:'7ªM' },
  };
  const name = names[s] || names[0];
  return (name as Record<string, string>)[lang] ?? name.en;
}

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
// MOTION TYPE
// ============================================================================

type Motion = 'contrary' | 'similar' | 'parallel' | 'oblique';

function getMotion(cf1: HNote, cf2: HNote, cp1: HNote, cp2: HNote): Motion {
  const cfDir = Math.sign(midi(cf2) - midi(cf1));
  const cpDir = Math.sign(midi(cp2) - midi(cp1));
  if (cfDir === 0 && cpDir === 0) return 'oblique';
  if (cfDir === 0 || cpDir === 0) return 'oblique';
  if (cfDir === cpDir) {
    const int1 = ((midi(cp1) - midi(cf1)) % 12 + 12) % 12;
    const int2 = ((midi(cp2) - midi(cf2)) % 12 + 12) % 12;
    return int1 === int2 ? 'parallel' : 'similar';
  }
  return 'contrary';
}

// ============================================================================
// SPECIES COUNTERPOINT CHECKER
// ============================================================================

function checkFirstSpecies(
  cf: HNote[], cp: HNote[], cfPos: CFPosition, lang: Lang
): CPError[] {
  const errs: CPError[] = [];
  const n = Math.min(cf.length, cp.length);
  if (n < 2) return errs;

  for (let i = 0; i < n; i++) {
    const lower = cfPos === 'lower' ? cf[i] : cp[i];
    const upper = cfPos === 'lower' ? cp[i] : cf[i];
    const interval = midi(upper) - midi(lower);
    const simpleSemi = ((interval % 12) + 12) % 12;

    // 1. Voice crossing
    if (interval < 0) {
      errs.push({ type:'crossing', severity:'error', idx:i,
        msg: {
          ja:`位置${i+1}: 声部交差（${noteStr(upper)}が${noteStr(lower)}より低い）`,
          en:`Beat ${i+1}: Voice crossing (${noteStr(upper)} below ${noteStr(lower)})`,
          ko:`위치${i+1}: 성부교차`, pt:`Pos.${i+1}: Cruzamento`, es:`Pos.${i+1}: Cruce de voces`,
        }
      });
    }

    // 2. Consonance check
    if (!isConsonant(simpleSemi)) {
      errs.push({ type:'dissonance', severity:'error', idx:i,
        msg: {
          ja:`位置${i+1}: 不協和音程 ${intervalName(simpleSemi, 'ja')}（第1類では協和音程のみ）`,
          en:`Beat ${i+1}: Dissonance ${intervalName(simpleSemi, 'en')} (1st species: consonances only)`,
          ko:`위치${i+1}: 불협화음정 ${intervalName(simpleSemi, 'ko')}`,
          pt:`Pos.${i+1}: Dissonância ${intervalName(simpleSemi, 'pt')}`,
          es:`Pos.${i+1}: Disonancia ${intervalName(simpleSemi, 'es')}`,
        }
      });
    }

    // 3. Beginning: P1, P5, or P8
    if (i === 0 && !isPerfectCons(simpleSemi)) {
      errs.push({ type:'begin', severity:'error', idx:i,
        msg: {
          ja:`開始: 完全協和音程（P1/P5/P8）で始めてください（現在: ${intervalName(simpleSemi, 'ja')}）`,
          en:`Beginning: Must start with P1/P5/P8 (current: ${intervalName(simpleSemi, 'en')})`,
          ko:`시작: 완전 협화음정(P1/P5/P8)으로 시작해야 함`,
          pt:`Início: Deve começar com P1/P5/P8`, es:`Inicio: Debe empezar con P1/P5/P8`,
        }
      });
    }

    // 4. Ending: P1 or P8
    if (i === n - 1 && simpleSemi !== 0) {
      errs.push({ type:'end', severity:'error', idx:i,
        msg: {
          ja:`終止: 完全1度または8度で終わってください（現在: ${intervalName(simpleSemi, 'ja')}）`,
          en:`Ending: Must end with P1 or P8 (current: ${intervalName(simpleSemi, 'en')})`,
          ko:`종지: P1 또는 P8로 끝나야 함`, pt:`Final: Deve terminar com P1 ou P8`, es:`Final: Debe terminar con P1 u P8`,
        }
      });
    }

    // Two-beat checks
    if (i === 0) continue;

    const prevLower = cfPos === 'lower' ? cf[i-1] : cp[i-1];
    const prevUpper = cfPos === 'lower' ? cp[i-1] : cf[i-1];
    const prevSemi = ((midi(prevUpper) - midi(prevLower)) % 12 + 12) % 12;
    const motion = getMotion(cf[i-1], cf[i], cp[i-1], cp[i]);

    // 5. Parallel perfect consonances
    if (isPerfectCons(simpleSemi) && isPerfectCons(prevSemi) && simpleSemi === prevSemi && motion === 'parallel') {
      const name = simpleSemi === 7 ? '5' : (simpleSemi === 0 ? '8(1)' : '?');
      errs.push({ type:'parallel-perf', severity:'error', idx:i, idx2:i-1,
        msg: {
          ja:`位置${i}→${i+1}: 並達完全${name}度`,
          en:`Beat ${i}→${i+1}: Parallel perfect ${name === '5' ? '5ths' : 'octaves/unisons'}`,
          ko:`위치${i}→${i+1}: 병행 완전${name}도`,
          pt:`Pos.${i}→${i+1}: ${name === '5' ? 'Quintas' : 'Oitavas'} paralelas`,
          es:`Pos.${i}→${i+1}: ${name === '5' ? 'Quintas' : 'Octavas'} paralelas`,
        }
      });
    }

    // 6. Hidden/direct perfect consonances (similar motion to perfect)
    if (isPerfectCons(simpleSemi) && motion === 'similar') {
      errs.push({ type:'hidden-perf', severity:'warning', idx:i, idx2:i-1,
        msg: {
          ja:`位置${i}→${i+1}: 隠伏完全協和音程（同方向進行で完全音程に到達）`,
          en:`Beat ${i}→${i+1}: Hidden perfect consonance (similar motion to perfect interval)`,
          ko:`위치${i}→${i+1}: 은복 완전 협화음정`, pt:`Pos.${i}→${i+1}: Consonância perfeita oculta`,
          es:`Pos.${i}→${i+1}: Consonancia perfecta oculta`,
        }
      });
    }

    // 7. Consecutive 3rds or 6ths (warn if > 3)
    if (i >= 3) {
      let consec3or6 = 0;
      for (let j = i; j >= 0 && j > i - 5; j--) {
        const lo = cfPos === 'lower' ? cf[j] : cp[j];
        const up = cfPos === 'lower' ? cp[j] : cf[j];
        const s = ((midi(up) - midi(lo)) % 12 + 12) % 12;
        if (isImperfectCons(s)) consec3or6++; else break;
      }
      if (consec3or6 > 3) {
        errs.push({ type:'consec-imp', severity:'warning', idx:i,
          msg: {
            ja:`位置${i+1}: 不完全協和音程が${consec3or6}回連続（3回以内推奨）`,
            en:`Beat ${i+1}: ${consec3or6} consecutive imperfect consonances (max 3 recommended)`,
            ko:`위치${i+1}: 불완전 협화음정 ${consec3or6}회 연속`,
            pt:`Pos.${i+1}: ${consec3or6} consonâncias imperfeitas consecutivas`,
            es:`Pos.${i+1}: ${consec3or6} consonancias imperfectas consecutivas`,
          }
        });
      }
    }

    // 8. Melodic checks on counterpoint
    const cpPrev = cp[i-1], cpCur = cp[i];
    const melInterval = Math.abs(midi(cpCur) - midi(cpPrev));
    // Avoid augmented intervals
    if (melInterval === 6) { // tritone
      errs.push({ type:'mel-tritone', severity:'warning', idx:i, idx2:i-1,
        msg: {
          ja:`CP位置${i}→${i+1}: 三全音の跳躍（${noteStr(cpPrev)}→${noteStr(cpCur)}）`,
          en:`CP Beat ${i}→${i+1}: Tritone leap (${noteStr(cpPrev)}→${noteStr(cpCur)})`,
          ko:`CP위치${i}→${i+1}: 삼전음 도약`, pt:`CP Pos.${i}→${i+1}: Salto de trítono`,
          es:`CP Pos.${i}→${i+1}: Salto de trítono`,
        }
      });
    }
    // Large leaps (> octave)
    if (melInterval > 12) {
      errs.push({ type:'mel-large', severity:'error', idx:i, idx2:i-1,
        msg: {
          ja:`CP位置${i}→${i+1}: 1オクターブを超える跳躍は禁止`,
          en:`CP Beat ${i}→${i+1}: Leap exceeding one octave is forbidden`,
          ko:`CP위치${i}→${i+1}: 1옥타브 초과 도약 금지`, pt:`CP Pos.${i}→${i+1}: Salto > 8ª proibido`,
          es:`CP Pos.${i}→${i+1}: Salto > 8ª prohibido`,
        }
      });
    }

    // 9. Approach final by contrary stepwise motion
    if (i === n - 1) {
      if (motion !== 'contrary') {
        errs.push({ type:'end-motion', severity:'warning', idx:i,
          msg: {
            ja:`終止: 反行で終止に到達してください`,
            en:`Ending: Approach the final by contrary motion`,
            ko:`종지: 반행으로 종지에 도달해야 함`, pt:`Final: Aproxime-se por movimento contrário`,
            es:`Final: Acérquese por movimiento contrario`,
          }
        });
      }
      const cpStep = Math.abs(midi(cpCur) - midi(cpPrev));
      if (cpStep > 2) {
        errs.push({ type:'end-step', severity:'warning', idx:i,
          msg: {
            ja:`終止: 対旋律は順次進行（2度）で終止に到達してください`,
            en:`Ending: Counterpoint should approach final by step`,
            ko:`종지: 대선율은 순차진행으로 종지에 도달해야 함`,
            pt:`Final: Contraponto deve chegar por grau conjunto`, es:`Final: Contrapunto debe llegar por grado conjunto`,
          }
        });
      }
    }
  }

  // 10. Motion variety
  if (n >= 4) {
    let contrary = 0, total = 0;
    for (let i = 1; i < n; i++) {
      const m = getMotion(cf[i-1], cf[i], cp[i-1], cp[i]);
      total++;
      if (m === 'contrary') contrary++;
    }
    if (total > 0 && contrary / total < 0.25) {
      errs.push({ type:'motion-variety', severity:'warning', idx: 0,
        msg: {
          ja:`反行が少なすぎます（${contrary}/${total}回 = ${Math.round(contrary/total*100)}%）。もっと反行を使ってください。`,
          en:`Too little contrary motion (${contrary}/${total} = ${Math.round(contrary/total*100)}%). Use more contrary motion.`,
          ko:`반행이 너무 적습니다 (${contrary}/${total}). 더 많은 반행을 사용하세요.`,
          pt:`Pouco movimento contrário (${contrary}/${total}). Use mais movimento contrário.`,
          es:`Poco movimiento contrario (${contrary}/${total}). Use más movimiento contrario.`,
        }
      });
    }
  }

  return errs;
}

// --- Second Species additional checks ---
function checkSecondSpecies(
  cf: HNote[], cp: HNote[], cfPos: CFPosition, lang: Lang
): CPError[] {
  // For 2nd species, cp has 2× notes. cp[0],cp[1] against cf[0], cp[2],cp[3] against cf[1], etc.
  const errs: CPError[] = [];
  const cfLen = cf.length;
  const cpLen = cp.length;

  for (let ci = 0; ci < cfLen; ci++) {
    const strongIdx = ci * 2;
    const weakIdx = ci * 2 + 1;
    if (strongIdx >= cpLen) break;

    const lower = cfPos === 'lower' ? cf[ci] : cp[strongIdx];
    const upper = cfPos === 'lower' ? cp[strongIdx] : cf[ci];
    const strongSemi = ((midi(upper) - midi(lower)) % 12 + 12) % 12;

    // Strong beat: must be consonant
    if (!isConsonant(strongSemi)) {
      errs.push({ type:'s2-strong-diss', severity:'error', idx: strongIdx,
        msg: {
          ja:`強拍${ci+1}: 不協和音程 ${intervalName(strongSemi, 'ja')}（強拍は協和音程のみ）`,
          en:`Strong beat ${ci+1}: Dissonance ${intervalName(strongSemi, 'en')} (strong beats: consonances only)`,
          ko:`강박${ci+1}: 불협화음정`, pt:`Tempo forte ${ci+1}: Dissonância`, es:`Tiempo fuerte ${ci+1}: Disonancia`,
        }
      });
    }

    // Beginning / ending
    if (ci === 0 && !isPerfectCons(strongSemi)) {
      errs.push({ type:'s2-begin', severity:'error', idx:0,
        msg: { ja:'開始: P1/P5/P8で', en:'Start with P1/P5/P8', ko:'시작: P1/P5/P8', pt:'Início: P1/P5/P8', es:'Inicio: P1/P5/P8' },
      });
    }
    if (ci === cfLen - 1 && strongSemi !== 0) {
      errs.push({ type:'s2-end', severity:'error', idx: strongIdx,
        msg: { ja:'終止: P1/P8で', en:'End with P1/P8', ko:'종지: P1/P8', pt:'Final: P1/P8', es:'Final: P1/P8' },
      });
    }

    // Weak beat check
    if (weakIdx < cpLen) {
      const weakLower = cfPos === 'lower' ? cf[ci] : cp[weakIdx];
      const weakUpper = cfPos === 'lower' ? cp[weakIdx] : cf[ci];
      const weakSemi = ((midi(weakUpper) - midi(weakLower)) % 12 + 12) % 12;

      if (!isConsonant(weakSemi)) {
        // Must be a passing tone: stepwise from both sides
        const fromPrev = strongIdx < cpLen ? Math.abs(midi(cp[weakIdx]) - midi(cp[strongIdx])) : 99;
        const toNext = (weakIdx + 1 < cpLen) ? Math.abs(midi(cp[weakIdx + 1]) - midi(cp[weakIdx])) : 99;
        const dirPrev = Math.sign(midi(cp[weakIdx]) - midi(cp[strongIdx]));
        const dirNext = (weakIdx + 1 < cpLen) ? Math.sign(midi(cp[weakIdx + 1]) - midi(cp[weakIdx])) : 0;

        if (fromPrev > 2 || toNext > 2 || dirPrev !== dirNext) {
          errs.push({ type:'s2-weak-diss', severity:'error', idx: weakIdx,
            msg: {
              ja:`弱拍${ci+1}: 不協和音は経過音のみ許可（順次進行で通過すること）`,
              en:`Weak beat ${ci+1}: Dissonance allowed only as passing tone (stepwise through)`,
              ko:`약박${ci+1}: 불협화음은 경과음만 허용`, pt:`Tempo fraco ${ci+1}: Dissonância só como nota de passagem`,
              es:`Tiempo débil ${ci+1}: Disonancia solo como nota de paso`,
            }
          });
        }
      }
    }

    // Parallel P5/P8 on consecutive strong beats
    if (ci > 0) {
      const prevStrongIdx = (ci-1) * 2;
      if (prevStrongIdx < cpLen) {
        const prevLo = cfPos === 'lower' ? cf[ci-1] : cp[prevStrongIdx];
        const prevUp = cfPos === 'lower' ? cp[prevStrongIdx] : cf[ci-1];
        const prevS = ((midi(prevUp) - midi(prevLo)) % 12 + 12) % 12;
        if (isPerfectCons(strongSemi) && isPerfectCons(prevS) && strongSemi === prevS) {
          const m = getMotion(cf[ci-1], cf[ci], cp[prevStrongIdx], cp[strongIdx]);
          if (m === 'parallel') {
            errs.push({ type:'s2-parallel', severity:'error', idx: strongIdx, idx2: prevStrongIdx,
              msg: {
                ja:`強拍${ci}→${ci+1}: 連続強拍間で並達完全音程`,
                en:`Strong beat ${ci}→${ci+1}: Parallel perfect consonances between strong beats`,
                ko:`강박${ci}→${ci+1}: 연속 강박 간 병행 완전음정`,
                pt:`Tempo forte ${ci}→${ci+1}: Consonâncias perfeitas paralelas`,
                es:`Tiempo fuerte ${ci}→${ci+1}: Consonancias perfectas paralelas`,
              }
            });
          }
        }
      }
    }
  }

  return errs;
}

// ============================================================================
// CANVAS RENDERER
// ============================================================================

const LS = 9, STEP_Y = LS / 2;
const STAFF_TOP = 30;
const CF_BOT_Y = 70;   // CF staff bottom line
const CP_BOT_Y = 155;  // CP staff bottom line
const LEFT_M = 50;

function drawCP(
  ctx: CanvasRenderingContext2D, w: number,
  cf: (HNote|null)[], cp: (HNote|null)[],
  errors: CPError[], cfPos: CFPosition, species: Species,
  activeIdx: number,
) {
  const h = 220;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, w, h);

  // Upper and lower staff
  const upperLabel = cfPos === 'upper' ? 'CF' : 'CP';
  const lowerLabel = cfPos === 'lower' ? 'CF' : 'CP';
  const upperBotY = STAFF_TOP + 4 * LS;
  const lowerBotY = upperBotY + 60;

  ctx.strokeStyle = '#999'; ctx.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    const uy = upperBotY - i * LS;
    const ly = lowerBotY - i * LS;
    ctx.beginPath(); ctx.moveTo(LEFT_M - 10, uy); ctx.lineTo(w - 10, uy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(LEFT_M - 10, ly); ctx.lineTo(w - 10, ly); ctx.stroke();
  }

  // Labels
  ctx.font = '10px system-ui'; ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'right';
  ctx.fillText(upperLabel, LEFT_M - 14, upperBotY - 2 * LS + 3);
  ctx.fillText(lowerLabel, LEFT_M - 14, lowerBotY - 2 * LS + 3);

  // Clefs
  ctx.font = '26px serif'; ctx.fillStyle = '#555'; ctx.textAlign = 'left';
  ctx.fillText('𝄞', LEFT_M - 42, upperBotY - LS + 3);
  ctx.fillText('𝄢', LEFT_M - 42, lowerBotY - LS + 3);

  // Note count: for species 2/3, CP has more notes
  const displayLen = Math.max(cf.length, cp.length);
  if (displayLen === 0) return;
  const usable = w - LEFT_M - 20;
  const colW = Math.min(usable / displayLen, 60);

  const errIdxSet = new Set<string>();
  errors.filter(e => e.severity === 'error').forEach(e => { errIdxSet.add(`${e.idx}`); if (e.idx2 !== undefined) errIdxSet.add(`${e.idx2}`); });

  const drawNote = (n: HNote, x: number, staffBotY: number, refPos: number, hasErr: boolean, isCF: boolean) => {
    const sp = staffPos(n);
    const ny = staffBotY - (sp - refPos) * STEP_Y;
    // Ledger lines
    const staffTop = staffBotY - 4 * LS;
    if (ny > staffBotY) {
      for (let ly = staffBotY + LS; ly <= ny + 1; ly += LS) {
        ctx.strokeStyle = '#999'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(x - 8, ly); ctx.lineTo(x + 8, ly); ctx.stroke();
      }
    }
    if (ny < staffTop) {
      for (let ly = staffTop - LS; ly >= ny - 1; ly -= LS) {
        ctx.strokeStyle = '#999'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(x - 8, ly); ctx.lineTo(x + 8, ly); ctx.stroke();
      }
    }
    ctx.fillStyle = hasErr ? '#ef4444' : isCF ? '#64748b' : '#0891b2';
    ctx.beginPath(); ctx.ellipse(x, ny, 5.5, 4, -0.2, 0, Math.PI * 2); ctx.fill();
    // Stem
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x + 5, ny); ctx.lineTo(x + 5, ny - 26); ctx.stroke();
    // Accidental
    if (n.accidental !== 0) {
      ctx.fillStyle = hasErr ? '#ef4444' : '#555';
      ctx.font = '11px system-ui'; ctx.textAlign = 'right';
      ctx.fillText(n.accidental === 1 ? '♯' : '♭', x - 7, ny + 4);
    }
  };

  // Determine which staff is upper (treble E4=30) and lower (bass G2=18)
  const upperRefPos = 30; // E4
  const lowerRefPos = 18; // G2

  const cfStaffBotY = cfPos === 'lower' ? lowerBotY : upperBotY;
  const cfRefPos = cfPos === 'lower' ? lowerRefPos : upperRefPos;
  const cpStaffBotY = cfPos === 'lower' ? upperBotY : lowerBotY;
  const cpRefPos = cfPos === 'lower' ? upperRefPos : lowerRefPos;

  // Draw CF notes
  for (let i = 0; i < cf.length; i++) {
    if (!cf[i]) continue;
    const ratio = species === 1 || cfPos === 'lower' ? 1 : 1;
    const x = LEFT_M + i * colW * (species > 1 && cfPos === 'lower' ? species : 1) + colW / 2;
    // For species > 1 with CF lower, each CF note spans multiple columns
    const cx = species > 1 && cfPos === 'lower'
      ? LEFT_M + i * species * colW + (species * colW) / 2
      : LEFT_M + i * colW + colW / 2;
    drawNote(cf[i]!, cx, cfStaffBotY, cfRefPos, false, true);
  }

  // Draw CP notes
  for (let i = 0; i < cp.length; i++) {
    if (!cp[i]) continue;
    const cx = LEFT_M + i * colW + colW / 2;
    const hasErr = errIdxSet.has(`${i}`);
    drawNote(cp[i]!, cx, cpStaffBotY, cpRefPos, hasErr, false);

    // Active highlight
    if (i === activeIdx) {
      ctx.fillStyle = 'rgba(8,145,178,0.08)';
      ctx.fillRect(cx - colW/2 + 1, 0, colW - 2, h);
    }
  }

  ctx.textAlign = 'start';
}

// ============================================================================
// STYLES
// ============================================================================

const ACCENT = '#0891b2';
const BG = '#fafafa';

const containerStyle: React.CSSProperties = {
  maxWidth: 1100, margin: '0 auto', padding: 'clamp(16px,4vw,32px)',
  fontFamily: '"Helvetica Neue",Arial,sans-serif', color: '#1e293b', background: BG, minHeight: '100vh',
};
const titleStyle: React.CSSProperties = {
  fontSize: 'clamp(22px,4vw,32px)', fontWeight: 700, letterSpacing: 2, textAlign: 'center',
  background: `linear-gradient(135deg, ${ACCENT}, #0e7490)`,
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
};
const badgeStyle: React.CSSProperties = {
  display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
  padding: '3px 10px', borderRadius: 4, background: '#ecfeff', color: ACCENT, marginBottom: 8,
};
const controlRow: React.CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 };
const selStyle: React.CSSProperties = { padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, background: '#fff' };
const btnPrimary: React.CSSProperties = { padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: ACCENT, color: '#fff' };
const btnOutline: React.CSSProperties = { ...btnPrimary, background: 'transparent', color: ACCENT, border: `1px solid ${ACCENT}` };
const cellInput: React.CSSProperties = { width: 54, padding: '4px 5px', fontSize: 13, fontFamily: 'monospace', border: '1px solid #ddd', borderRadius: 4, textAlign: 'center', outline: 'none' };
const errPanel: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, maxHeight: 260, overflowY: 'auto' };

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CounterpointPage() {
  const { lang } = useLang();
  const t = (m: L5) => m[lang] ?? m.en;

  const [species, setSpecies] = useState<Species>(1);
  const [cfPos, setCfPos] = useState<CFPosition>('lower');
  const [cfInputs, setCfInputs] = useState<string[]>(Array(8).fill(''));
  const [cpInputs, setCpInputs] = useState<string[]>(Array(8).fill(''));
  const [activeIdx, setActiveIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Adjust CP length for species
  const cpPerCF = species === 1 ? 1 : species === 2 ? 2 : species === 3 ? 4 : 1;

  const cfNotes = cfInputs.map(parseNote);
  const cpNotes = cpInputs.map(parseNote);

  // Run checks
  const cfValid = cfNotes.filter(Boolean) as HNote[];
  const cpValid = cpNotes.filter(Boolean) as HNote[];

  let errors: CPError[] = [];
  if (cfValid.length >= 2 && cpValid.length >= 2) {
    if (species === 1 || species === 4) {
      errors = checkFirstSpecies(cfValid, cpValid, cfPos, lang);
    } else {
      errors = checkSecondSpecies(cfValid, cpValid, cfPos, lang);
    }
  }

  // Interval display
  const intervals: string[] = [];
  for (let i = 0; i < Math.min(cfNotes.length, species === 1 ? cpNotes.length : Math.ceil(cpNotes.length / cpPerCF)); i++) {
    const cfN = cfNotes[i];
    const cpIdx = species === 1 ? i : i * cpPerCF;
    const cpN = cpIdx < cpNotes.length ? cpNotes[cpIdx] : null;
    if (cfN && cpN) {
      const lower = cfPos === 'lower' ? cfN : cpN;
      const upper = cfPos === 'lower' ? cpN : cfN;
      const s = ((midi(upper) - midi(lower)) % 12 + 12) % 12;
      intervals.push(intervalName(s, lang));
    } else {
      intervals.push('');
    }
  }

  // Canvas
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = cvs.getBoundingClientRect();
    cvs.width = rect.width * dpr;
    cvs.height = 220 * dpr;
    ctx.scale(dpr, dpr);
    drawCP(ctx, rect.width, cfNotes, cpNotes, errors, cfPos, species, activeIdx);
  }, [cfNotes, cpNotes, errors, cfPos, species, activeIdx]);

  const updateCF = useCallback((i: number, val: string) => {
    setCfInputs(prev => { const n = [...prev]; n[i] = val; return n; });
  }, []);
  const updateCP = useCallback((i: number, val: string) => {
    setCpInputs(prev => { const n = [...prev]; n[i] = val; return n; });
  }, []);

  const addNote = () => {
    if (cfInputs.length >= 20) return;
    setCfInputs(prev => [...prev, '']);
    const add = cpPerCF;
    setCpInputs(prev => [...prev, ...Array(add).fill('')]);
  };
  const removeNote = () => {
    if (cfInputs.length <= 2) return;
    setCfInputs(prev => prev.slice(0, -1));
    setCpInputs(prev => prev.slice(0, -cpPerCF));
  };
  const clearAll = () => {
    setCfInputs(Array(8).fill(''));
    setCpInputs(Array(8 * cpPerCF).fill(''));
    setActiveIdx(0);
  };

  // When species changes, adjust CP array length
  const handleSpeciesChange = (s: Species) => {
    setSpecies(s);
    const newPerCF = s === 1 ? 1 : s === 2 ? 2 : s === 3 ? 4 : 1;
    setCpInputs(Array(cfInputs.length * newPerCF).fill(''));
  };

  const errCount = errors.filter(e => e.severity === 'error').length;
  const warnCount = errors.filter(e => e.severity === 'warning').length;

  return (
    <AuthGate appName="counterpoint">
    <div style={containerStyle}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={badgeStyle}>SPECIES COUNTERPOINT CHECKER</div>
        <h1 style={titleStyle}>KUON COUNTERPOINT</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>
          {t({
            ja: '厳格対位法（第1類〜第4類）のリアルタイムチェッカー。並達5度・不協和音の扱い・進行規則を即座に検出。',
            en: 'Real-time species counterpoint checker (1st–4th). Parallel 5ths, dissonance treatment, and motion rules detected instantly.',
            ko: '엄격 대위법(제1류~제4류) 실시간 체커. 병행 5도, 불협화음 처리, 진행 규칙을 즉시 검출.',
            pt: 'Verificador de contraponto por espécies em tempo real (1ª–4ª). Quintas paralelas, dissonâncias e regras de movimento.',
            es: 'Verificador de contrapunto por especies en tiempo real (1ª–4ª). Quintas paralelas, disonancias y reglas de movimiento.',
          })}
        </p>
      </header>

      {/* Controls */}
      <div style={controlRow}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          {t({ ja:'類', en:'Species', ko:'류', pt:'Espécie', es:'Especie' })}:
        </label>
        <select style={selStyle} value={species} onChange={e => handleSpeciesChange(Number(e.target.value) as Species)}>
          {([1,2,3,4] as Species[]).map(s => (
            <option key={s} value={s}>{SPECIES_LABELS[s][lang]}</option>
          ))}
        </select>

        <label style={{ fontSize: 13, fontWeight: 600, marginLeft: 8 }}>
          CF:
        </label>
        <select style={selStyle} value={cfPos} onChange={e => setCfPos(e.target.value as CFPosition)}>
          <option value="lower">{t({ ja:'下声', en:'Lower', ko:'하성', pt:'Inferior', es:'Inferior' })}</option>
          <option value="upper">{t({ ja:'上声', en:'Upper', ko:'상성', pt:'Superior', es:'Superior' })}</option>
        </select>

        <button style={btnPrimary} onClick={addNote}>
          + {t({ ja:'拍追加', en:'Add Beat', ko:'박 추가', pt:'Adicionar', es:'Añadir' })}
        </button>
        <button style={btnOutline} onClick={removeNote}>−</button>
        <button style={{ ...btnOutline, color: '#94a3b8', borderColor: '#cbd5e1' }} onClick={clearAll}>
          {t({ ja:'リセット', en:'Reset', ko:'초기화', pt:'Resetar', es:'Resetear' })}
        </button>
      </div>

      {/* Canvas */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '12px 8px', marginBottom: 14 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 220, display: 'block' }} />
      </div>

      {/* Input Grid */}
      <div style={{ overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 8px', fontSize: 11, color: '#94a3b8', textAlign: 'left' }}></th>
              {cfInputs.map((_, i) => (
                <th key={i} colSpan={cpPerCF} style={{
                  padding: '3px 4px', fontSize: 11, fontWeight: 600, textAlign: 'center',
                  color: '#94a3b8', borderBottom: '1px solid #e5e7eb',
                }}>{i+1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* CF Row */}
            <tr>
              <td style={{ padding: '3px 8px', fontWeight: 700, fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                CF {cfPos === 'lower'
                  ? t({ ja:'(下声)', en:'(Lower)', ko:'(하성)', pt:'(Inf.)', es:'(Inf.)' })
                  : t({ ja:'(上声)', en:'(Upper)', ko:'(상성)', pt:'(Sup.)', es:'(Sup.)' })
                }
              </td>
              {cfInputs.map((v, i) => (
                <td key={i} colSpan={cpPerCF} style={{ padding: 2, textAlign: 'center' }}>
                  <input
                    style={{ ...cellInput, borderColor: '#ccc', background: cfNotes[i] ? '#f1f5f9' : '#fff' }}
                    value={v}
                    placeholder={cfPos === 'lower' ? 'C3' : 'C5'}
                    onChange={e => updateCF(i, e.target.value)}
                  />
                </td>
              ))}
            </tr>
            {/* CP Row */}
            <tr>
              <td style={{ padding: '3px 8px', fontWeight: 700, fontSize: 12, color: ACCENT, whiteSpace: 'nowrap' }}>
                CP {cfPos === 'lower'
                  ? t({ ja:'(上声)', en:'(Upper)', ko:'(상성)', pt:'(Sup.)', es:'(Sup.)' })
                  : t({ ja:'(下声)', en:'(Lower)', ko:'(하성)', pt:'(Inf.)', es:'(Inf.)' })
                }
              </td>
              {cpInputs.map((v, i) => {
                const hasErr = errors.some(e => e.severity === 'error' && e.idx === i);
                const hasWarn = !hasErr && errors.some(e => e.severity === 'warning' && e.idx === i);
                return (
                  <td key={i} style={{ padding: 2 }}>
                    <input
                      style={{
                        ...cellInput,
                        borderColor: hasErr ? '#ef4444' : hasWarn ? '#f59e0b' : cpNotes[i] ? ACCENT : '#ddd',
                        background: hasErr ? '#fef2f2' : hasWarn ? '#fffbeb' : cpNotes[i] ? '#ecfeff' : '#fff',
                      }}
                      value={v}
                      placeholder={cfPos === 'lower' ? 'E5' : 'G2'}
                      onChange={e => updateCP(i, e.target.value)}
                      onFocus={() => setActiveIdx(i)}
                    />
                  </td>
                );
              })}
            </tr>
            {/* Interval row (species 1 only) */}
            {species === 1 && (
              <tr>
                <td style={{ padding: '3px 8px', fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                  {t({ ja:'音程', en:'Interval', ko:'음정', pt:'Intervalo', es:'Intervalo' })}
                </td>
                {intervals.map((iv, i) => (
                  <td key={i} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#1e293b', padding: '3px 2px' }}>
                    {iv}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Input help */}
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
        {t({
          ja: '入力形式: C4, Eb3, F#5 など。第2類ではCF 1音に対しCP 2音入力。第3類では4音入力。',
          en: 'Format: C4, Eb3, F#5. In 2nd species enter 2 CP notes per CF note. 3rd species: 4 per CF note.',
          ko: '입력: C4, Eb3, F#5. 제2류는 CF 1음당 CP 2음, 제3류는 4음.',
          pt: 'Formato: C4, Eb3, F#5. 2ª espécie: 2 notas CP por CF. 3ª: 4 por CF.',
          es: 'Formato: C4, Eb3, F#5. 2ª especie: 2 notas CP por CF. 3ª: 4 por CF.',
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
        {errors.length === 0 && cpValid.length >= 2 && (
          <p style={{ color: '#22c55e', fontSize: 14 }}>
            ✓ {t({
              ja: '対位法の禁則は検出されませんでした。',
              en: 'No counterpoint rule violations detected.',
              ko: '대위법 금칙이 검출되지 않았습니다.',
              pt: 'Nenhuma violação de contraponto detectada.',
              es: 'No se detectaron violaciones de contrapunto.',
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
          {t({ ja:'検出ルール一覧', en:'Detection Rules', ko:'검출 규칙 목록', pt:'Regras de Detecção', es:'Reglas de Detección' })}
        </summary>
        <div style={{ marginTop: 12, fontSize: 13, color: '#475569', lineHeight: 2 }}>
          {[
            { ja:'協和音程チェック（第1類: 協和音程のみ）', en:'Consonance check (1st species: consonances only)', ko:'협화음정 체크', pt:'Verificação de consonância', es:'Verificación de consonancia' },
            { ja:'並達完全協和音程（並行P5/P8/P1）', en:'Parallel perfect consonances (P5/P8/P1)', ko:'병행 완전 협화음정', pt:'Consonâncias perfeitas paralelas', es:'Consonancias perfectas paralelas' },
            { ja:'隠伏完全協和音程（同方向進行→完全音程）', en:'Hidden perfect consonances (similar motion → perfect)', ko:'은복 완전 협화음정', pt:'Consonâncias perfeitas ocultas', es:'Consonancias perfectas ocultas' },
            { ja:'声部交差', en:'Voice crossing', ko:'성부교차', pt:'Cruzamento de vozes', es:'Cruce de voces' },
            { ja:'開始規則（P1/P5/P8で開始）', en:'Beginning rule (start with P1/P5/P8)', ko:'시작 규칙', pt:'Regra de início', es:'Regla de inicio' },
            { ja:'終止規則（P1/P8で終止 + 反行順次進行）', en:'Ending rule (P1/P8 + contrary stepwise)', ko:'종지 규칙', pt:'Regra de final', es:'Regla de final' },
            { ja:'連続不完全協和音程の制限（3回以内）', en:'Consecutive imperfect consonances limit (max 3)', ko:'연속 불완전 협화음정 제한', pt:'Limite de consonâncias imperfeitas', es:'Límite de consonancias imperfectas' },
            { ja:'旋律的三全音の跳躍', en:'Melodic tritone leap', ko:'선율적 삼전음 도약', pt:'Salto melódico de trítono', es:'Salto melódico de trítono' },
            { ja:'1オクターブ超の跳躍禁止', en:'Leap exceeding one octave', ko:'1옥타브 초과 도약 금지', pt:'Salto > 8ª proibido', es:'Salto > 8ª prohibido' },
            { ja:'進行の多様性（反行不足の警告）', en:'Motion variety (insufficient contrary motion)', ko:'진행 다양성', pt:'Variedade de movimento', es:'Variedad de movimiento' },
            { ja:'第2類: 強拍の協和音程チェック', en:'2nd species: Strong beat consonance', ko:'제2류: 강박 협화음정 체크', pt:'2ª espécie: Consonância no tempo forte', es:'2ª especie: Consonancia en tiempo fuerte' },
            { ja:'第2類: 弱拍の不協和音は経過音のみ', en:'2nd species: Weak beat dissonance as passing tone only', ko:'제2류: 약박 불협화음은 경과음만', pt:'2ª espécie: Dissonância como nota de passagem', es:'2ª especie: Disonancia como nota de paso' },
          ].map((r, i) => (
            <div key={i}>
              <span style={{ fontWeight: 600, color: ACCENT, marginRight: 6 }}>{i+1}.</span>
              {(r as Record<string, string>)[lang] ?? r.en}
            </div>
          ))}
        </div>
      </details>

      <footer style={{ textAlign: 'center', marginTop: 40, paddingTop: 20, borderTop: '1px solid #e5e7eb', color: '#94a3b8', fontSize: 12 }}>
        KUON COUNTERPOINT — 空音開発 Kuon R&D
      </footer>
    </div>
    </AuthGate>
  );
}
