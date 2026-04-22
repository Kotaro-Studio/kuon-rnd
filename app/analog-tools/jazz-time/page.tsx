'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L5 = Record<Lang, string>;

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#d97706';
const ACCENT_DEEP = '#78350f';
const BG = '#fefbf6';

interface TimeSig { id: string; label: string; beatsPerBar: number; beatNote: number; }
// beatsPerBar = number of beats counted per bar; beatNote = 4 means quarter = 1 beat, 8 means eighth = 1 beat
const TIME_SIGS: TimeSig[] = [
  { id: '44',  label: '4/4',  beatsPerBar: 4, beatNote: 4 },
  { id: '34',  label: '3/4',  beatsPerBar: 3, beatNote: 4 },
  { id: '24',  label: '2/4',  beatsPerBar: 2, beatNote: 4 },
  { id: '54',  label: '5/4',  beatsPerBar: 5, beatNote: 4 },
  { id: '74',  label: '7/4',  beatsPerBar: 7, beatNote: 4 },
  { id: '68',  label: '6/8',  beatsPerBar: 6, beatNote: 8 },
  { id: '78',  label: '7/8',  beatsPerBar: 7, beatNote: 8 },
  { id: '98',  label: '9/8',  beatsPerBar: 9, beatNote: 8 },
  { id: '128', label: '12/8', beatsPerBar: 12, beatNote: 8 },
];

interface Section {
  id: string;
  name: string;
  bpm: number;
  timeSigId: string;
  bars: number;
  repeats: number;
}

const DEFAULT_SECTIONS: Section[] = [
  { id: 's1', name: 'Intro',   bpm: 120, timeSigId: '44', bars: 4,  repeats: 1 },
  { id: 's2', name: 'Theme',   bpm: 120, timeSigId: '44', bars: 32, repeats: 1 },
  { id: 's3', name: 'Solo',    bpm: 120, timeSigId: '44', bars: 32, repeats: 3 },
  { id: 's4', name: 'Ending',  bpm: 120, timeSigId: '44', bars: 8,  repeats: 1 },
];

const T = {
  back: { ja: '← Analog Tools', en: '← Analog Tools', ko: '← Analog Tools', pt: '← Analog Tools', es: '← Analog Tools' } as L5,
  heading: { ja: '演奏時間計算機', en: 'Performance Time Calculator', ko: '연주 시간 계산기', pt: 'Calculadora de Tempo de Performance', es: 'Calculadora de Tiempo de Actuación' } as L5,
  lead: {
    ja: 'BPM・拍子・小節数・繰り返し回数から、正確な演奏時間を算出します。ジャズのソロ回し、クラシックの楽章、変拍子曲にも対応。',
    en: 'Compute exact performance time from BPM, time signature, bar count, and repeat count. Handles jazz choruses, classical movements, and odd meters.',
    ko: 'BPM·박자·마디 수·반복 횟수로 정확한 연주 시간을 계산합니다.',
    pt: 'Calcule o tempo exato a partir de BPM, fórmula de compasso, número de compassos e repetições.',
    es: 'Calcula el tiempo exacto a partir de BPM, compás, número de compases y repeticiones.',
  } as L5,
  sections: { ja: 'セクション', en: 'Sections', ko: '섹션', pt: 'Seções', es: 'Secciones' } as L5,
  name: { ja: '名称', en: 'Name', ko: '이름', pt: 'Nome', es: 'Nombre' } as L5,
  bpm: { ja: 'BPM', en: 'BPM', ko: 'BPM', pt: 'BPM', es: 'BPM' } as L5,
  timeSig: { ja: '拍子', en: 'Time Sig', ko: '박자', pt: 'Compasso', es: 'Compás' } as L5,
  bars: { ja: '小節数', en: 'Bars', ko: '마디 수', pt: 'Compassos', es: 'Compases' } as L5,
  repeats: { ja: '繰り返し', en: 'Repeats', ko: '반복', pt: 'Repetições', es: 'Repeticiones' } as L5,
  duration: { ja: '時間', en: 'Time', ko: '시간', pt: 'Tempo', es: 'Tiempo' } as L5,
  addSection: { ja: '+ セクション追加', en: '+ Add section', ko: '+ 섹션 추가', pt: '+ Adicionar seção', es: '+ Añadir sección' } as L5,
  total: { ja: '合計演奏時間', en: 'Total Performance Time', ko: '총 연주 시간', pt: 'Tempo Total', es: 'Tiempo Total' } as L5,
  tapeLimit: { ja: 'テープ残量チェック', en: 'Tape Budget Check', ko: '테이프 예산 체크', pt: 'Verificação de Fita', es: 'Verificación de Cinta' } as L5,
  availMin: { ja: '使えるテープ (分)', en: 'Available tape (min)', ko: '사용 가능 (분)', pt: 'Disponível (min)', es: 'Disponible (min)' } as L5,
  fits: { ja: '✓ 収まります', en: '✓ Fits', ko: '✓ 들어감', pt: '✓ Cabe', es: '✓ Cabe' } as L5,
  over: { ja: '⚠ テープを超過', en: '⚠ Exceeds tape', ko: '⚠ 테이프 초과', pt: '⚠ Excede a fita', es: '⚠ Excede la cinta' } as L5,
  remaining: { ja: '余裕', en: 'Remaining', ko: '여유', pt: 'Restante', es: 'Restante' } as L5,
  shortBy: { ja: '不足', en: 'Short by', ko: '부족', pt: 'Faltam', es: 'Faltan' } as L5,
  footnote: {
    ja: '計算式: 1小節の秒数 = (60 / BPM) × (拍数 × 4 / 拍の基準音符)。8分音符基準の場合でもBPMは8分音符単位として計算します。',
    en: 'Formula: bar duration = (60 / BPM) × (beats × 4 / beat-note). BPM is taken as beat-note per minute.',
    ko: '공식: 마디 길이 = (60 / BPM) × (박수 × 4 / 박자 기준).',
    pt: 'Fórmula: duração do compasso = (60 / BPM) × (batidas × 4 / nota-base).',
    es: 'Fórmula: duración del compás = (60 / BPM) × (pulsos × 4 / nota-base).',
  } as L5,
};

function barSeconds(bpm: number, ts: TimeSig): number {
  // BPM = beats per minute where one beat = beatNote.
  // bar duration (sec) = beatsPerBar * (60 / BPM)
  return ts.beatsPerBar * (60 / bpm);
}

function fmt(s: number): string {
  if (!isFinite(s) || s < 0) return '—';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60), ms = Math.floor((s - Math.floor(s)) * 1000);
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(sec)}`;
  return `${m}:${pad(sec)}.${pad(ms, 3).slice(0, 2)}`;
}

export default function JazzTime() {
  const { lang } = useLang();
  const t = (k: keyof typeof T) => T[k][lang];

  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [tapeLimitMin, setTapeLimitMin] = useState('30');

  const update = (id: string, patch: Partial<Section>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };
  const remove = (id: string) => setSections(prev => prev.filter(s => s.id !== id));
  const add = () => setSections(prev => [...prev, { id: `s${Date.now()}`, name: `Section ${prev.length + 1}`, bpm: 120, timeSigId: '44', bars: 8, repeats: 1 }]);

  const perSection = useMemo(() => sections.map(s => {
    const ts = TIME_SIGS.find(x => x.id === s.timeSigId) || TIME_SIGS[0];
    const secOneRepeat = barSeconds(s.bpm, ts) * s.bars;
    const total = secOneRepeat * s.repeats;
    return { id: s.id, seconds: total };
  }), [sections]);

  const totalSec = perSection.reduce((a, b) => a + b.seconds, 0);

  const limitSec = (parseFloat(tapeLimitMin) || 0) * 60;
  const overBudget = totalSec > limitSec && limitSec > 0;

  return (
    <div style={{ fontFamily: sans, backgroundColor: BG, minHeight: '100vh', color: '#1c1917', padding: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Link href="/analog-tools" style={{ display: 'inline-block', fontSize: 13, color: ACCENT_DEEP, textDecoration: 'none', marginBottom: 24, opacity: 0.7 }}>{t('back')}</Link>

        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 700, color: ACCENT_DEEP, margin: 0, letterSpacing: '-0.02em' }}>{t('heading')}</h1>
          <p style={{ fontFamily: serif, fontSize: 'clamp(14px, 2vw, 16px)', color: '#57534e', lineHeight: 1.75, marginTop: 12, maxWidth: 720 }}>{t('lead')}</p>
        </header>

        <section style={{ backgroundColor: '#fff', border: `1px solid rgba(217,119,6,0.18)`, borderRadius: 6, padding: 'clamp(20px, 3vw, 28px)', marginBottom: 24 }}>
          <h2 style={{ fontFamily: serif, fontSize: 18, color: ACCENT_DEEP, margin: '0 0 20px 0', borderBottom: `2px solid ${ACCENT}`, paddingBottom: 8 }}>{t('sections')}</h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid rgba(120,53,15,0.15)` }}>
                  <th style={thStyle}>{t('name')}</th>
                  <th style={thStyle}>{t('bpm')}</th>
                  <th style={thStyle}>{t('timeSig')}</th>
                  <th style={thStyle}>{t('bars')}</th>
                  <th style={thStyle}>{t('repeats')}</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>{t('duration')}</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s, i) => {
                  const dur = perSection[i]?.seconds || 0;
                  return (
                    <tr key={s.id} style={{ borderBottom: `1px solid rgba(120,53,15,0.06)` }}>
                      <td style={tdStyle}>
                        <input type="text" value={s.name} onChange={e => update(s.id, { name: e.target.value })} style={{ ...tableInputStyle, width: 120 }} />
                      </td>
                      <td style={tdStyle}>
                        <input type="number" value={s.bpm} onChange={e => update(s.id, { bpm: parseFloat(e.target.value) || 0 })} step="0.1" min={1} style={{ ...tableInputStyle, width: 70 }} />
                      </td>
                      <td style={tdStyle}>
                        <select value={s.timeSigId} onChange={e => update(s.id, { timeSigId: e.target.value })} style={{ ...tableInputStyle, width: 80, cursor: 'pointer' }}>
                          {TIME_SIGS.map(ts => <option key={ts.id} value={ts.id}>{ts.label}</option>)}
                        </select>
                      </td>
                      <td style={tdStyle}>
                        <input type="number" value={s.bars} onChange={e => update(s.id, { bars: parseFloat(e.target.value) || 0 })} step="1" min={0} style={{ ...tableInputStyle, width: 70 }} />
                      </td>
                      <td style={tdStyle}>
                        <input type="number" value={s.repeats} onChange={e => update(s.id, { repeats: parseFloat(e.target.value) || 0 })} step="1" min={0} style={{ ...tableInputStyle, width: 70 }} />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: serif, fontWeight: 600, color: ACCENT_DEEP }}>{fmt(dur)}</td>
                      <td style={tdStyle}>
                        <button onClick={() => remove(s.id)} style={removeBtnStyle} aria-label="remove">×</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button onClick={add} style={addBtnStyle}>{t('addSection')}</button>
        </section>

        <section style={{ backgroundColor: '#fff', border: `2px solid ${ACCENT}`, borderRadius: 6, padding: 'clamp(24px, 4vw, 36px)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontSize: 12, color: ACCENT_DEEP, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{t('total')}</div>
            <div style={{ fontFamily: serif, fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 700, color: '#1c1917', lineHeight: 1 }}>{fmt(totalSec)}</div>
          </div>
        </section>

        <section style={{ backgroundColor: '#fff', border: `1px solid rgba(217,119,6,0.18)`, borderRadius: 6, padding: 'clamp(20px, 3vw, 28px)', marginBottom: 32 }}>
          <h2 style={{ fontFamily: serif, fontSize: 16, color: ACCENT_DEEP, margin: '0 0 16px 0' }}>{t('tapeLimit')}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <label style={labelStyle}>{t('availMin')}</label>
              <input type="number" value={tapeLimitMin} onChange={e => setTapeLimitMin(e.target.value)} step="0.1" min={0} style={{ ...inputStyle, width: 120 }} />
            </div>
            {limitSec > 0 && (
              <div style={{ padding: '12px 16px', borderRadius: 4, backgroundColor: overBudget ? 'rgba(185,28,28,0.08)' : 'rgba(21,128,61,0.08)', border: `1px solid ${overBudget ? 'rgba(185,28,28,0.25)' : 'rgba(21,128,61,0.25)'}`, color: overBudget ? '#b91c1c' : '#15803d', fontSize: 14, fontWeight: 600 }}>
                {overBudget ? `${t('over')} — ${t('shortBy')} ${fmt(totalSec - limitSec)}` : `${t('fits')} — ${t('remaining')} ${fmt(limitSec - totalSec)}`}
              </div>
            )}
          </div>
        </section>

        <p style={{ fontSize: 12, color: '#78716c', lineHeight: 1.75, maxWidth: 720, fontFamily: serif }}>{t('footnote')}</p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: ACCENT_DEEP, marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' };
const inputStyle: React.CSSProperties = { padding: '10px 12px', fontSize: 15, border: '1px solid #d6d3d1', borderRadius: 4, backgroundColor: '#fafaf9', fontFamily: sans, color: '#1c1917' };
const tableInputStyle: React.CSSProperties = { padding: '6px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 4, backgroundColor: '#fafaf9', fontFamily: sans, color: '#1c1917' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 8px', fontSize: 11, color: ACCENT_DEEP, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 };
const tdStyle: React.CSSProperties = { padding: '8px 8px', fontSize: 13 };
const addBtnStyle: React.CSSProperties = { marginTop: 16, padding: '8px 16px', fontSize: 13, border: `1px dashed ${ACCENT}`, borderRadius: 4, backgroundColor: 'transparent', color: ACCENT, cursor: 'pointer', fontFamily: sans, fontWeight: 600 };
const removeBtnStyle: React.CSSProperties = { width: 26, height: 26, border: 'none', borderRadius: '50%', backgroundColor: 'rgba(185,28,28,0.08)', color: '#b91c1c', cursor: 'pointer', fontSize: 16, lineHeight: 1 };
