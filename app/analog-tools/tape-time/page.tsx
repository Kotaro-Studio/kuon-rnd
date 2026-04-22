'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L5 = Partial<Record<Lang, string>> & { en: string };

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#d97706';
const ACCENT_DEEP = '#78350f';
const BG = '#fefbf6';

type Unit = 'ft' | 'm' | 'cm';
const UNITS: { id: Unit; label: string }[] = [
  { id: 'ft', label: 'ft' },
  { id: 'm', label: 'm' },
  { id: 'cm', label: 'cm' },
];

interface Preset { label: string; ft: number; }
const PRESETS: Preset[] = [
  { label: '600 ft (7")', ft: 600 },
  { label: '1200 ft (7")', ft: 1200 },
  { label: '1800 ft (10.5")', ft: 1800 },
  { label: '2500 ft (10.5")', ft: 2500 },
  { label: '3600 ft (10.5" LP)', ft: 3600 },
  { label: '4800 ft (10.5" DP)', ft: 4800 },
];

const SPEEDS = [
  { id: 's76',  label: '76 cm/s (30 ips)', cmps: 76.2 },
  { id: 's38',  label: '38 cm/s (15 ips)', cmps: 38.1 },
  { id: 's19',  label: '19 cm/s (7.5 ips)', cmps: 19.05 },
  { id: 's95',  label: '9.5 cm/s (3.75 ips)', cmps: 9.525 },
  { id: 's475', label: '4.75 cm/s (1.875 ips)', cmps: 4.7625 },
];

const T = {
  back: { ja: '← Analog Tools', en: '← Analog Tools', ko: '← Analog Tools', pt: '← Analog Tools', es: '← Analog Tools' } as L5,
  heading: { ja: 'テープ録音時間計算機', en: 'Tape Recording Time', ko: '테이프 녹음 시간 계산기', pt: 'Tempo de Gravação em Fita', es: 'Tiempo de Grabación en Cinta' } as L5,
  lead: {
    ja: 'テープ長と速度から、録音可能時間を瞬時に計算します。両面使用（ステレオ／モノ）の合計時間も表示。',
    en: 'Length × speed → recording time. Includes double-sided (quarter-track) totals.',
    ko: '테이프 길이와 속도로 녹음 가능 시간을 계산합니다. 양면 사용(스테레오/모노) 합계도 표시.',
    pt: 'Comprimento × velocidade → tempo de gravação. Inclui totais de duplo sentido.',
    es: 'Longitud × velocidad → tiempo de grabación. Incluye totales a doble sentido.',
  } as L5,
  inputs: { ja: '入力', en: 'Inputs', ko: '입력', pt: 'Entradas', es: 'Entradas' } as L5,
  length: { ja: 'テープ長', en: 'Tape Length', ko: '테이프 길이', pt: 'Comprimento da Fita', es: 'Longitud de la Cinta' } as L5,
  unit: { ja: '単位', en: 'Unit', ko: '단위', pt: 'Unidade', es: 'Unidad' } as L5,
  presets: { ja: 'プリセット', en: 'Presets', ko: '프리셋', pt: 'Presets', es: 'Presets' } as L5,
  speed: { ja: 'テープ速度', en: 'Tape Speed', ko: '테이프 속도', pt: 'Velocidade da Fita', es: 'Velocidad' } as L5,
  results: { ja: '結果', en: 'Results', ko: '결과', pt: 'Resultados', es: 'Resultados' } as L5,
  oneWay: { ja: '片道（1/2トラック）', en: 'One Way (1/2 track)', ko: '편도 (1/2 트랙)', pt: 'Um lado (1/2 trilha)', es: 'Un lado (1/2 pista)' } as L5,
  twoWay: { ja: '両面合計（1/4トラック）', en: 'Double-sided (1/4 track)', ko: '양면 합계 (1/4 트랙)', pt: 'Ambos os lados (1/4 trilha)', es: 'Ambos lados (1/4 pista)' } as L5,
  meters: { ja: 'メートル換算', en: 'In Meters', ko: '미터 환산', pt: 'Em Metros', es: 'En Metros' } as L5,
  feet: { ja: 'フィート換算', en: 'In Feet', ko: '피트 환산', pt: 'Em Pés', es: 'En Pies' } as L5,
  footnote: {
    ja: '1/2トラック＝片面フル録音。1/4トラック＝両面でトラック分割して録音（時間×2）。1 ft = 30.48 cm。',
    en: '1/2 track = full reel recording. 1/4 track = two-sided (time × 2). 1 ft = 30.48 cm.',
    ko: '1/2 트랙 = 편면 전체 녹음. 1/4 트랙 = 양면 (시간 × 2). 1 ft = 30.48 cm.',
    pt: '1/2 trilha = gravação completa de um lado. 1/4 trilha = dois lados (tempo × 2).',
    es: '1/2 pista = grabación completa de un lado. 1/4 pista = dos lados (tiempo × 2).',
  } as L5,
};

function toMeters(value: number, unit: Unit): number {
  switch (unit) { case 'ft': return value * 0.3048; case 'm': return value; case 'cm': return value / 100; }
}
function format(s: number): string {
  if (!isFinite(s) || s < 0) return '—';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

export default function TapeTime() {
  const { lang } = useLang();
  const t = (k: keyof typeof T): string => T[k][lang] ?? T[k].en;

  const [len, setLen] = useState('1800');
  const [unit, setUnit] = useState<Unit>('ft');
  const [speedId, setSpeedId] = useState('s19');
  const speed = SPEEDS.find(s => s.id === speedId)!;

  const result = useMemo(() => {
    const v = parseFloat(len);
    if (!isFinite(v) || v <= 0) return null;
    const meters = toMeters(v, unit);
    const feet = meters / 0.3048;
    const timeSec = (meters * 100) / speed.cmps;
    return { meters, feet, timeSec };
  }, [len, unit, speed.cmps]);

  return (
    <div style={{ fontFamily: sans, backgroundColor: BG, minHeight: '100vh', color: '#1c1917', padding: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Link href="/analog-tools" style={{ display: 'inline-block', fontSize: 13, color: ACCENT_DEEP, textDecoration: 'none', marginBottom: 24, opacity: 0.7 }}>{t('back')}</Link>
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 700, color: ACCENT_DEEP, margin: 0, letterSpacing: '-0.02em' }}>{t('heading')}</h1>
          <p style={{ fontFamily: serif, fontSize: 'clamp(14px, 2vw, 16px)', color: '#57534e', lineHeight: 1.75, marginTop: 12, maxWidth: 640 }}>{t('lead')}</p>
        </header>

        <section style={{ backgroundColor: '#fff', border: `1px solid rgba(217,119,6,0.18)`, borderRadius: 6, padding: 'clamp(20px, 3vw, 28px)', marginBottom: 24 }}>
          <h2 style={{ fontFamily: serif, fontSize: 18, color: ACCENT_DEEP, margin: '0 0 20px 0', borderBottom: `2px solid ${ACCENT}`, paddingBottom: 8 }}>{t('inputs')}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>{t('length')}</label>
              <input type="number" value={len} onChange={e => setLen(e.target.value)} step="1" min={0} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('unit')}</label>
              <select value={unit} onChange={e => setUnit(e.target.value as Unit)} style={selectStyle}>
                {UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('speed')}</label>
              <select value={speedId} onChange={e => setSpeedId(e.target.value)} style={selectStyle}>
                {SPEEDS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t('presets')}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => { setLen(String(p.ft)); setUnit('ft'); }} style={presetStyle}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#fff', border: `2px solid ${ACCENT}`, borderRadius: 6, padding: 'clamp(24px, 4vw, 36px)', marginBottom: 32 }}>
          <h2 style={{ fontFamily: serif, fontSize: 20, color: ACCENT_DEEP, margin: '0 0 24px 0' }}>{t('results')}</h2>
          {result ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
              <ResultCell label={t('oneWay')} value={format(result.timeSec)} big />
              <ResultCell label={t('twoWay')} value={format(result.timeSec * 2)} big />
              <ResultCell label={t('meters')} value={`${result.meters.toFixed(1)} m`} />
              <ResultCell label={t('feet')} value={`${result.feet.toFixed(0)} ft`} />
            </div>
          ) : <p style={{ color: '#b91c1c', fontSize: 14, margin: 0 }}>—</p>}
        </section>

        <p style={{ fontSize: 12, color: '#78716c', lineHeight: 1.75, maxWidth: 720, fontFamily: serif }}>{t('footnote')}</p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: ACCENT_DEEP, marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 15, border: '1px solid #d6d3d1', borderRadius: 4, backgroundColor: '#fafaf9', fontFamily: sans, color: '#1c1917' };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };
const presetStyle: React.CSSProperties = { padding: '6px 12px', fontSize: 12, border: `1px solid rgba(217,119,6,0.3)`, borderRadius: 20, backgroundColor: '#fff', color: ACCENT_DEEP, cursor: 'pointer', fontFamily: sans, fontWeight: 600 };

function ResultCell({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: ACCENT_DEEP, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: serif, fontSize: big ? 'clamp(22px, 3.5vw, 32px)' : 'clamp(18px, 2.5vw, 22px)', fontWeight: 700, color: '#1c1917', lineHeight: 1.2 }}>{value}</div>
    </div>
  );
}
