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

// ── Hub diameters (mm) ──
interface Hub { id: string; labelJa: string; labelEn: string; dia: number; }
const HUBS: Hub[] = [
  { id: 'nab10', labelJa: 'NAB 10号 (114.3mm)', labelEn: 'NAB 10.5" (114.3mm)', dia: 114.3 },
  { id: 'nab7',  labelJa: 'NAB 7号 (73mm)',     labelEn: 'NAB 7" (73mm)',       dia: 73 },
  { id: 'ccir10', labelJa: 'CCIR/DIN 10号 (100mm)', labelEn: 'CCIR/DIN 10.5" (100mm)', dia: 100 },
  { id: 'ccir7', labelJa: 'CCIR 7号 (62mm)',    labelEn: 'CCIR 7" (62mm)',      dia: 62 },
  { id: 'small', labelJa: 'Small Hub (63.5mm)', labelEn: 'Small Hub (63.5mm)',  dia: 63.5 },
];

// ── Tape thicknesses (μm = 0.001mm) ──
interface Thick { id: string; labelJa: string; labelEn: string; um: number; }
const THICKS: Thick[] = [
  { id: 'std',    labelJa: 'Standard (50μm)', labelEn: 'Standard (50μm)', um: 50 },
  { id: 'lp',     labelJa: 'LP (35μm)',       labelEn: 'Long Play (35μm)', um: 35 },
  { id: 'dp',     labelJa: 'DP (26μm)',       labelEn: 'Double Play (26μm)', um: 26 },
  { id: 'triple', labelJa: 'Triple (18μm)',   labelEn: 'Triple Play (18μm)', um: 18 },
  { id: 'msa',    labelJa: 'Maxell MSA/XLI (52μm)', labelEn: 'Maxell MSA/XLI (52μm)', um: 52 },
];

// ── Speeds (cm/s) ──
const SPEEDS = [
  { id: 's38', label: '38 cm/s (15 ips)', cmps: 38.1 },
  { id: 's19', label: '19 cm/s (7.5 ips)', cmps: 19.05 },
  { id: 's95', label: '9.5 cm/s (3.75 ips)', cmps: 9.525 },
  { id: 's475', label: '4.75 cm/s (1.875 ips)', cmps: 4.7625 },
  { id: 's76', label: '76 cm/s (30 ips)', cmps: 76.2 },
];

const T = {
  back: { ja: '← Analog Tools', en: '← Analog Tools', ko: '← Analog Tools', pt: '← Analog Tools', es: '← Analog Tools' } as L5,
  heading: { ja: 'リール残量計算機', en: 'Reel Remaining Calculator', ko: '릴 잔량 계산기', pt: 'Calculadora de Fita Restante', es: 'Calculadora de Cinta Restante' } as L5,
  lead: {
    ja: '巻いてあるテープの外径を実測すれば、残りの長さと録音時間がわかります。',
    en: 'Measure the outer diameter of the wound tape and compute remaining length and recording time.',
    ko: '감긴 테이프의 외경을 측정하면 남은 길이와 녹음 시간을 알 수 있습니다.',
    pt: 'Meça o diâmetro externo da fita enrolada para obter o comprimento e o tempo restantes.',
    es: 'Mide el diámetro exterior de la cinta enrollada para obtener la longitud y el tiempo restantes.',
  } as L5,
  inputs: { ja: '入力', en: 'Inputs', ko: '입력', pt: 'Entradas', es: 'Entradas' } as L5,
  hub: { ja: 'ハブ径', en: 'Hub Diameter', ko: '허브 직경', pt: 'Diâmetro do Cubo', es: 'Diámetro del Cubo' } as L5,
  outerDia: { ja: '外径 (mm)', en: 'Outer Diameter (mm)', ko: '외경 (mm)', pt: 'Diâmetro Externo (mm)', es: 'Diámetro Exterior (mm)' } as L5,
  outerDiaHint: {
    ja: 'ノギスでテープの巻きの一番外側を実測してください。',
    en: 'Measure the outermost wind with calipers.',
    ko: '캘리퍼스로 가장 바깥쪽 권선을 측정하세요.',
    pt: 'Meça a camada mais externa com um paquímetro.',
    es: 'Mide la capa más externa con un calibre.',
  } as L5,
  thick: { ja: 'テープ厚み', en: 'Tape Thickness', ko: '테이프 두께', pt: 'Espessura da Fita', es: 'Grosor de la Cinta' } as L5,
  speed: { ja: 'テープ速度', en: 'Tape Speed', ko: '테이프 속도', pt: 'Velocidade da Fita', es: 'Velocidad de la Cinta' } as L5,
  results: { ja: '結果', en: 'Results', ko: '결과', pt: 'Resultados', es: 'Resultados' } as L5,
  windDepth: { ja: '巻き厚', en: 'Wind Depth', ko: '감긴 두께', pt: 'Profundidade do Rolo', es: 'Profundidad del Rollo' } as L5,
  xArea: { ja: '断面積', en: 'Cross-section Area', ko: '단면적', pt: 'Área da Seção', es: 'Área de la Sección' } as L5,
  length: { ja: '残りの長さ', en: 'Remaining Length', ko: '남은 길이', pt: 'Comprimento Restante', es: 'Longitud Restante' } as L5,
  time: { ja: '残り録音時間', en: 'Remaining Time', ko: '남은 녹음 시간', pt: 'Tempo Restante', es: 'Tiempo Restante' } as L5,
  invalid: { ja: '外径はハブ径より大きい値を入力してください。', en: 'Outer diameter must be greater than the hub diameter.', ko: '외경은 허브 직경보다 커야 합니다.', pt: 'O diâmetro externo deve ser maior que o diâmetro do cubo.', es: 'El diámetro exterior debe ser mayor que el diámetro del cubo.' } as L5,
  section: { ja: '断面ビュー', en: 'Cross-Section View', ko: '단면 뷰', pt: 'Vista em Seção', es: 'Vista de Sección' } as L5,
  footnote: {
    ja: '計算式: A = π(r_outer² − r_hub²)、残り長 = A ÷ 厚み、残り時間 = 長さ ÷ 速度。巻きの緩みや空気層は考慮されません。',
    en: 'Formula: A = π(r_outer² − r_hub²), length = A ÷ thickness, time = length ÷ speed. Does not account for loose wind or air gaps.',
    ko: '공식: A = π(r_outer² − r_hub²), 길이 = A ÷ 두께, 시간 = 길이 ÷ 속도. 느슨한 권선이나 공기층은 고려되지 않습니다.',
    pt: 'Fórmula: A = π(r_ext² − r_cubo²), comprimento = A ÷ espessura, tempo = comprimento ÷ velocidade. Não considera enrolamento solto.',
    es: 'Fórmula: A = π(r_ext² − r_cubo²), longitud = A ÷ grosor, tiempo = longitud ÷ velocidad. No considera enrollado suelto.',
  } as L5,
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function label(hub: { labelJa: string; labelEn: string }, lang: Lang) {
  return lang === 'ja' ? hub.labelJa : hub.labelEn;
}

export default function TapeRemaining() {
  const { lang } = useLang();
  const t = (k: keyof typeof T) => T[k][lang];

  const [hubId, setHubId] = useState('nab10');
  const [outerDia, setOuterDia] = useState('260');
  const [thickId, setThickId] = useState('std');
  const [speedId, setSpeedId] = useState('s19');

  const hub = HUBS.find(h => h.id === hubId)!;
  const thick = THICKS.find(x => x.id === thickId)!;
  const speed = SPEEDS.find(s => s.id === speedId)!;

  const outer = parseFloat(outerDia) || 0;
  const valid = outer > hub.dia;

  const result = useMemo(() => {
    if (!valid) return null;
    const rOut = outer / 2;       // mm
    const rHub = hub.dia / 2;     // mm
    const windDepth = rOut - rHub; // mm
    const areaMM2 = Math.PI * (rOut * rOut - rHub * rHub);
    const thickMM = thick.um / 1000;                       // mm
    const lengthMM = areaMM2 / thickMM;
    const lengthM = lengthMM / 1000;
    const lengthFt = lengthM * 3.28084;
    const speedMMPS = speed.cmps * 10;
    const timeSec = lengthMM / speedMMPS;
    return { windDepth, areaMM2, lengthM, lengthFt, timeSec, rOut, rHub };
  }, [valid, outer, hub.dia, thick.um, speed.cmps]);

  // SVG layout
  const SVG_SIZE = 280;
  const MAX_REEL_MM = 320; // 10.5" reel is ~267mm; add margin
  const scale = (SVG_SIZE * 0.9) / MAX_REEL_MM; // mm→px

  return (
    <div style={{ fontFamily: sans, backgroundColor: BG, minHeight: '100vh', color: '#1c1917', padding: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Link href="/analog-tools" style={{ display: 'inline-block', fontSize: 13, color: ACCENT_DEEP, textDecoration: 'none', marginBottom: 24, opacity: 0.7 }}>
          {t('back')}
        </Link>

        <header style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 700, color: ACCENT_DEEP, margin: 0, letterSpacing: '-0.02em' }}>
            {t('heading')}
          </h1>
          <p style={{ fontFamily: serif, fontSize: 'clamp(14px, 2vw, 16px)', color: '#57534e', lineHeight: 1.75, marginTop: 12, maxWidth: 640 }}>
            {t('lead')}
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(20px, 3vw, 32px)', marginBottom: 40 }}>

          {/* INPUTS */}
          <section style={{ backgroundColor: '#fff', border: `1px solid rgba(217,119,6,0.18)`, borderRadius: 6, padding: 'clamp(20px, 3vw, 28px)' }}>
            <h2 style={{ fontFamily: serif, fontSize: 18, color: ACCENT_DEEP, margin: '0 0 20px 0', borderBottom: `2px solid ${ACCENT}`, paddingBottom: 8 }}>
              {t('inputs')}
            </h2>

            <Field label={t('hub')}>
              <select value={hubId} onChange={e => setHubId(e.target.value)} style={selectStyle}>
                {HUBS.map(h => <option key={h.id} value={h.id}>{label(h, lang)}</option>)}
              </select>
            </Field>

            <Field label={t('outerDia')} hint={t('outerDiaHint')}>
              <input type="number" value={outerDia} onChange={e => setOuterDia(e.target.value)} min={0} step="0.1" style={inputStyle} />
            </Field>

            <Field label={t('thick')}>
              <select value={thickId} onChange={e => setThickId(e.target.value)} style={selectStyle}>
                {THICKS.map(x => <option key={x.id} value={x.id}>{label(x, lang)}</option>)}
              </select>
            </Field>

            <Field label={t('speed')}>
              <select value={speedId} onChange={e => setSpeedId(e.target.value)} style={selectStyle}>
                {SPEEDS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          </section>

          {/* SVG CROSS-SECTION */}
          <section style={{ backgroundColor: '#fff', border: `1px solid rgba(217,119,6,0.18)`, borderRadius: 6, padding: 'clamp(20px, 3vw, 28px)' }}>
            <h2 style={{ fontFamily: serif, fontSize: 18, color: ACCENT_DEEP, margin: '0 0 20px 0', borderBottom: `2px solid ${ACCENT}`, paddingBottom: 8 }}>
              {t('section')}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
                {/* reel flange outline (reference, fixed to 267mm = 10.5") */}
                <circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={(267 / 2) * scale} fill="none" stroke="#e7e5e4" strokeWidth={1} strokeDasharray="3 3" />
                {/* tape wind */}
                {valid && result && (
                  <circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={result.rOut * scale} fill="rgba(217,119,6,0.22)" stroke={ACCENT} strokeWidth={1.5} />
                )}
                {/* hub */}
                <circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={hub.dia / 2 * scale} fill="#292524" />
                {/* hub label */}
                <text x={SVG_SIZE / 2} y={SVG_SIZE / 2 + 4} textAnchor="middle" fontSize={10} fill="#fef3c7" fontFamily={sans}>{hub.dia}mm</text>
                {/* outer dia marker */}
                {valid && (
                  <>
                    <line x1={SVG_SIZE / 2} y1={SVG_SIZE / 2 - (outer / 2) * scale} x2={SVG_SIZE / 2 + 30} y2={SVG_SIZE / 2 - (outer / 2) * scale} stroke={ACCENT_DEEP} strokeWidth={0.5} />
                    <text x={SVG_SIZE / 2 + 34} y={SVG_SIZE / 2 - (outer / 2) * scale + 4} fontSize={11} fill={ACCENT_DEEP} fontFamily={sans}>{outer.toFixed(1)}mm</text>
                  </>
                )}
              </svg>
            </div>
          </section>
        </div>

        {/* RESULTS */}
        <section style={{ backgroundColor: '#fff', border: `2px solid ${ACCENT}`, borderRadius: 6, padding: 'clamp(24px, 4vw, 36px)', marginBottom: 40 }}>
          <h2 style={{ fontFamily: serif, fontSize: 20, color: ACCENT_DEEP, margin: '0 0 24px 0' }}>
            {t('results')}
          </h2>
          {!valid ? (
            <p style={{ color: '#b91c1c', fontSize: 14, margin: 0 }}>{t('invalid')}</p>
          ) : result && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
              <ResultCell label={t('windDepth')} value={`${result.windDepth.toFixed(2)} mm`} />
              <ResultCell label={t('xArea')} value={`${result.areaMM2.toFixed(0)} mm²`} />
              <ResultCell label={t('length')} value={`${result.lengthM.toFixed(1)} m`} sub={`${result.lengthFt.toFixed(0)} ft`} big />
              <ResultCell label={t('time')} value={formatTime(result.timeSec)} big />
            </div>
          )}
        </section>

        <p style={{ fontSize: 12, color: '#78716c', lineHeight: 1.75, maxWidth: 720, fontFamily: serif }}>
          {t('footnote')}
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 15,
  border: '1px solid #d6d3d1',
  borderRadius: 4,
  backgroundColor: '#fafaf9',
  fontFamily: sans,
  color: '#1c1917',
};
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, color: ACCENT_DEEP, marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#78716c', marginTop: 6, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  );
}

function ResultCell({ label, value, sub, big }: { label: string; value: string; sub?: string; big?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: ACCENT_DEEP, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: serif, fontSize: big ? 'clamp(22px, 3.5vw, 32px)' : 'clamp(18px, 2.5vw, 22px)', fontWeight: 700, color: '#1c1917', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#78716c', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
