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

// ─── Units ───
// Reference voltages (sine wave assumed):
//   0 dBu  = 0.7746 V rms  (√(600Ω × 1 mW))
//   0 dBV  = 1.000  V rms
//   0 dBm  at 600Ω = 0.7746 V rms  (P = V²/R, so V at 1mW depends on Z; 0dBm|600 = 0.7746V)
// Peak / peak-to-peak for sine:
//   Vp   = Vrms × √2
//   Vpp  = 2 × Vp = 2√2 × Vrms

type Unit = 'dBu' | 'dBV' | 'dBm' | 'Vrms' | 'Vpp' | 'Vp';
const UNITS: Unit[] = ['dBu', 'dBV', 'dBm', 'Vrms', 'Vpp', 'Vp'];

const DBU_REF = 0.7745966692; // √(600e-3 × 1) but simpler: √(600 × 0.001) = 0.7746
const DBV_REF = 1.0;
// dBm reference power = 1 mW; Vrms ref depends on Z: Vref = sqrt(P × Z) = sqrt(0.001 × Z)
function dbmRef(zOhm: number) { return Math.sqrt(0.001 * zOhm); }

function toVrms(value: number, unit: Unit, zOhm: number): number {
  switch (unit) {
    case 'Vrms': return value;
    case 'Vp':   return value / Math.SQRT2;
    case 'Vpp':  return value / (2 * Math.SQRT2);
    case 'dBu':  return DBU_REF * Math.pow(10, value / 20);
    case 'dBV':  return DBV_REF * Math.pow(10, value / 20);
    case 'dBm':  return dbmRef(zOhm) * Math.pow(10, value / 20);
  }
}

function fromVrms(vrms: number, unit: Unit, zOhm: number): number {
  if (!isFinite(vrms) || vrms <= 0) return -Infinity;
  switch (unit) {
    case 'Vrms': return vrms;
    case 'Vp':   return vrms * Math.SQRT2;
    case 'Vpp':  return vrms * 2 * Math.SQRT2;
    case 'dBu':  return 20 * Math.log10(vrms / DBU_REF);
    case 'dBV':  return 20 * Math.log10(vrms / DBV_REF);
    case 'dBm':  return 20 * Math.log10(vrms / dbmRef(zOhm));
  }
}

interface Preset { label: string; unit: Unit; value: number; }
const PRESETS: Preset[] = [
  { label: '0 dBu',   unit: 'dBu', value: 0 },
  { label: '+4 dBu (pro line)',  unit: 'dBu', value: 4 },
  { label: '+6 dBu',   unit: 'dBu', value: 6 },
  { label: '−10 dBV (consumer)', unit: 'dBV', value: -10 },
  { label: '+24 dBu (SMPTE max)',unit: 'dBu', value: 24 },
  { label: '1 Vrms',   unit: 'Vrms', value: 1 },
];

const IMPEDANCES = [600, 150, 50];

const T = {
  back: { ja: '← Analog Tools', en: '← Analog Tools', ko: '← Analog Tools', pt: '← Analog Tools', es: '← Analog Tools' } as L5,
  heading: { ja: '電圧 ⇔ dB 変換機', en: 'Voltage ⇔ dB Converter', ko: '전압 ⇔ dB 변환기', pt: 'Conversor Tensão ⇔ dB', es: 'Conversor Voltaje ⇔ dB' } as L5,
  lead: {
    ja: 'dBu / dBV / dBm / Vrms / Vpp / Vp を相互変換。どの欄を更新しても他の5つが同期して更新されます。負荷インピーダンスはdBm計算のみに影響。',
    en: 'Bidirectional converter for dBu / dBV / dBm / Vrms / Vpp / Vp. Edit any field and the others update. Impedance affects dBm only.',
    ko: 'dBu / dBV / dBm / Vrms / Vpp / Vp 상호 변환. 어느 칸을 수정해도 나머지 5개가 동기화됩니다. 임피던스는 dBm에만 영향.',
    pt: 'Conversão bidirecional entre dBu / dBV / dBm / Vrms / Vpp / Vp. Edite qualquer campo — os outros atualizam. Impedância afeta apenas dBm.',
    es: 'Conversión bidireccional dBu / dBV / dBm / Vrms / Vpp / Vp. Edita cualquier campo — los demás se actualizan. La impedancia solo afecta dBm.',
  } as L5,
  impedance: { ja: '負荷インピーダンス (dBm計算用)', en: 'Load Impedance (for dBm)', ko: '부하 임피던스 (dBm용)', pt: 'Impedância de Carga (para dBm)', es: 'Impedancia de Carga (para dBm)' } as L5,
  presets: { ja: 'プリセット', en: 'Presets', ko: '프리셋', pt: 'Presets', es: 'Presets' } as L5,
  values: { ja: '相互変換テーブル', en: 'Conversion Table', ko: '변환 테이블', pt: 'Tabela de Conversão', es: 'Tabla de Conversión' } as L5,
  sinewave: { ja: '※ Vp / Vpp は正弦波前提', en: '※ Vp / Vpp assume sine wave', ko: '※ Vp/Vpp는 사인파 기준', pt: '※ Vp / Vpp assumem onda senoidal', es: '※ Vp / Vpp asumen onda sinusoidal' } as L5,
  footnote: {
    ja: '参考: 0 dBu = 0.7746 V rms（√(600Ω×1mW)基準）、0 dBV = 1 V rms、0 dBm = 1 mW（インピーダンス依存）。Vp = Vrms × √2、Vpp = 2Vp。',
    en: '0 dBu = 0.7746 V rms (√(600Ω×1mW)), 0 dBV = 1 V rms, 0 dBm = 1 mW (impedance-dependent). Vp = Vrms × √2, Vpp = 2Vp.',
    ko: '0 dBu = 0.7746 V rms, 0 dBV = 1 V rms, 0 dBm = 1 mW. Vp = Vrms × √2.',
    pt: '0 dBu = 0,7746 V rms, 0 dBV = 1 V rms, 0 dBm = 1 mW.',
    es: '0 dBu = 0,7746 V rms, 0 dBV = 1 V rms, 0 dBm = 1 mW.',
  } as L5,
};

function unitSuffix(u: Unit): string {
  if (u.startsWith('dB')) return ' dB';
  return u === 'Vrms' ? ' Vrms' : u === 'Vpp' ? ' Vpp' : ' Vp';
}

function formatDisplay(u: Unit, value: number): string {
  if (!isFinite(value)) return '—';
  if (u.startsWith('dB')) return value.toFixed(3);
  const abs = Math.abs(value);
  if (abs >= 10) return value.toFixed(3);
  if (abs >= 0.001) return value.toFixed(5);
  if (abs >= 1e-6) return (value * 1000).toFixed(3) + ' m';
  return value.toExponential(3);
}

export default function DbuVolt() {
  const { lang } = useLang();
  const t = (k: keyof typeof T) => T[k][lang];

  const [vrms, setVrms] = useState<number>(0.7746);
  const [zOhm, setZOhm] = useState<number>(600);
  const [editing, setEditing] = useState<Unit>('dBu');
  const [drafts, setDrafts] = useState<Record<Unit, string>>({ dBu: '', dBV: '', dBm: '', Vrms: '', Vpp: '', Vp: '' });

  // Computed values for each unit
  const values = useMemo(() => {
    const out: Record<Unit, number> = { dBu: 0, dBV: 0, dBm: 0, Vrms: 0, Vpp: 0, Vp: 0 };
    for (const u of UNITS) out[u] = fromVrms(vrms, u, zOhm);
    return out;
  }, [vrms, zOhm]);

  const onChange = (unit: Unit, text: string) => {
    setDrafts(prev => ({ ...prev, [unit]: text }));
    const parsed = parseFloat(text);
    if (!isFinite(parsed)) return;
    setEditing(unit);
    const newVrms = toVrms(parsed, unit, zOhm);
    if (isFinite(newVrms) && newVrms > 0) setVrms(newVrms);
  };

  const applyPreset = (p: Preset) => {
    setEditing(p.unit);
    setDrafts(prev => ({ ...prev, [p.unit]: String(p.value) }));
    setVrms(toVrms(p.value, p.unit, zOhm));
  };

  return (
    <div style={{ fontFamily: sans, backgroundColor: BG, minHeight: '100vh', color: '#1c1917', padding: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/analog-tools" style={{ display: 'inline-block', fontSize: 13, color: ACCENT_DEEP, textDecoration: 'none', marginBottom: 24, opacity: 0.7 }}>{t('back')}</Link>

        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 700, color: ACCENT_DEEP, margin: 0, letterSpacing: '-0.02em' }}>{t('heading')}</h1>
          <p style={{ fontFamily: serif, fontSize: 'clamp(14px, 2vw, 16px)', color: '#57534e', lineHeight: 1.75, marginTop: 12, maxWidth: 720 }}>{t('lead')}</p>
        </header>

        <section style={{ backgroundColor: '#fff', border: `1px solid rgba(217,119,6,0.18)`, borderRadius: 6, padding: 'clamp(20px, 3vw, 28px)', marginBottom: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>{t('impedance')}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {IMPEDANCES.map(z => (
                <button key={z} onClick={() => setZOhm(z)} style={{
                  padding: '8px 18px',
                  fontSize: 13,
                  border: zOhm === z ? `1px solid ${ACCENT}` : '1px solid #d6d3d1',
                  borderRadius: 20,
                  backgroundColor: zOhm === z ? ACCENT : '#fff',
                  color: zOhm === z ? '#fff' : ACCENT_DEEP,
                  cursor: 'pointer',
                  fontFamily: sans,
                  fontWeight: 600,
                }}>
                  {z} Ω
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t('presets')}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => applyPreset(p)} style={presetStyle}>{p.label}</button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#fff', border: `2px solid ${ACCENT}`, borderRadius: 6, padding: 'clamp(20px, 3vw, 28px)', marginBottom: 24 }}>
          <h2 style={{ fontFamily: serif, fontSize: 18, color: ACCENT_DEEP, margin: '0 0 20px 0' }}>{t('values')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {UNITS.map(u => {
              const isEditing = editing === u;
              const displayValue = isEditing && drafts[u] !== '' ? drafts[u] : formatDisplay(u, values[u]);
              return (
                <div key={u}>
                  <label style={{ ...labelStyle, color: u === 'dBu' ? ACCENT : ACCENT_DEEP }}>
                    {u}{unitSuffix(u).trim() && ` (${unitSuffix(u).trim()})`}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={displayValue}
                    onFocus={() => { setEditing(u); setDrafts(prev => ({ ...prev, [u]: formatDisplay(u, values[u]) })); }}
                    onChange={e => onChange(u, e.target.value)}
                    style={{
                      ...inputStyle,
                      width: '100%',
                      borderColor: isEditing ? ACCENT : '#d6d3d1',
                      fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: '#78716c' }}>{t('sinewave')}</div>
        </section>

        <p style={{ fontSize: 12, color: '#78716c', lineHeight: 1.75, maxWidth: 720, fontFamily: serif }}>{t('footnote')}</p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: ACCENT_DEEP, marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' };
const inputStyle: React.CSSProperties = { padding: '10px 12px', fontSize: 15, border: '1px solid #d6d3d1', borderRadius: 4, backgroundColor: '#fafaf9', fontFamily: sans, color: '#1c1917' };
const presetStyle: React.CSSProperties = { padding: '6px 14px', fontSize: 12, border: `1px solid rgba(217,119,6,0.3)`, borderRadius: 20, backgroundColor: '#fff', color: ACCENT_DEEP, cursor: 'pointer', fontFamily: sans, fontWeight: 600 };
