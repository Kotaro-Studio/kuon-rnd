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

// Standard speeds each machine supports (cm/s).
interface Machine {
  id: string;
  name: string;
  maker: string;
  speeds: number[];   // cm/s
  notes: L5;
}

const MACHINES: Machine[] = [
  { id: 'b77',    name: 'Revox B77',   maker: 'Revox',  speeds: [19.05, 38.1], notes: { ja: '38/19 2速。水晶ロック・クオーツ制御モデルあり。', en: '38/19 dual-speed. Quartz-locked option available.', ko: '38/19 2속. 수정 잠금 모델 있음.', pt: 'Duas velocidades 38/19. Opção de travamento por cristal.', es: 'Dos velocidades 38/19. Opción de bloqueo por cristal.' } },
  { id: 'a77',    name: 'Revox A77',   maker: 'Revox',  speeds: [9.525, 19.05, 38.1], notes: { ja: '9.5/19/38対応モデル多数。', en: 'Multi-speed 9.5/19/38 variants.', ko: '9.5/19/38 다양한 변종.', pt: 'Variantes 9.5/19/38.', es: 'Variantes 9.5/19/38.' } },
  { id: 'pr99',   name: 'Revox PR99',  maker: 'Revox',  speeds: [19.05, 38.1], notes: { ja: 'プロ仕様。Mk.II/Mk.III世代あり。', en: 'Pro version. Mk.II/Mk.III revisions.', ko: '프로 버전. Mk.II/Mk.III 리비전.', pt: 'Versão pro.', es: 'Versión pro.' } },
  { id: 'a700',   name: 'Revox A700',  maker: 'Revox',  speeds: [9.525, 19.05, 38.1], notes: { ja: 'DCサーボ・3モーター機。', en: 'DC servo, 3-motor deck.', ko: 'DC 서보, 3-모터 데크.', pt: 'Servo DC, 3 motores.', es: 'Servo DC, 3 motores.' } },
  { id: 'a80',    name: 'Studer A80',  maker: 'Studer', speeds: [19.05, 38.1, 76.2], notes: { ja: 'スタジオ標準機。76cm/s対応。', en: 'Studio standard. 30 ips capable.', ko: '스튜디오 표준. 76cm/s 대응.', pt: 'Padrão de estúdio. 30 ips.', es: 'Estándar de estudio. 30 ips.' } },
  { id: 'a810',   name: 'Studer A810', maker: 'Studer', speeds: [9.525, 19.05, 38.1], notes: { ja: 'SMPTEシンクロ対応。', en: 'SMPTE sync capable.', ko: 'SMPTE 싱크 가능.', pt: 'Com sincronização SMPTE.', es: 'Con sincronización SMPTE.' } },
  { id: 'mx5050', name: 'Otari MX-5050', maker: 'Otari', speeds: [9.525, 19.05, 38.1], notes: { ja: '放送・スタジオ定番。Bシリーズ以降。', en: 'Broadcast/studio workhorse. B-series onwards.', ko: '방송·스튜디오 표준.', pt: 'Cavalo de batalha de estúdio.', es: 'Caballo de batalla de estudio.' } },
  { id: 'tascam38', name: 'Tascam 38-2', maker: 'Tascam', speeds: [19.05, 38.1], notes: { ja: '8トラック1/2インチ。MTR定番。', en: '8-track 1/2 inch. MTR classic.', ko: '8트랙 1/2인치. MTR 클래식.', pt: '8 faixas 1/2 polegada.', es: '8 pistas 1/2 pulgada.' } },
];

// Reference test tones commonly used for speed calibration
const TEST_TONES = [
  { id: 't3150', hz: 3150, label: '3150 Hz (CCIR / DIN flutter)' },
  { id: 't1000', hz: 1000, label: '1000 Hz (general reference)' },
  { id: 't9500', hz: 9500, label: '9500 Hz (Ampex older standard)' },
];

const T = {
  back: { ja: '← Analog Tools', en: '← Analog Tools', ko: '← Analog Tools', pt: '← Analog Tools', es: '← Analog Tools' } as L5,
  heading: { ja: 'アナログ機キャリブレーション', en: 'Analog Machine Speed Calibration', ko: '아날로그기 속도 교정', pt: 'Calibração de Velocidade', es: 'Calibración de Velocidad' } as L5,
  lead: {
    ja: '校正テープ（CCIR/DIN 3150Hz等）を再生し、周波数カウンターで実測した値を入力すれば、キャプスタン速度の誤差を%で算出します。',
    en: 'Play a calibration tape (CCIR/DIN 3150 Hz etc.) and input the measured frequency. The tool computes capstan speed deviation in %.',
    ko: '교정 테이프(CCIR/DIN 3150Hz 등)를 재생하고 주파수 카운터로 측정한 값을 입력하면 캡스탄 속도 오차를 %로 산출합니다.',
    pt: 'Reproduza uma fita de calibração (CCIR/DIN 3150 Hz etc.) e insira a frequência medida. Calcula o desvio de velocidade em %.',
    es: 'Reproduce una cinta de calibración (CCIR/DIN 3150 Hz etc.) e introduce la frecuencia medida. Calcula la desviación de velocidad en %.',
  } as L5,
  machine: { ja: '機種', en: 'Machine', ko: '기종', pt: 'Máquina', es: 'Máquina' } as L5,
  speed: { ja: '速度', en: 'Speed', ko: '속도', pt: 'Velocidade', es: 'Velocidad' } as L5,
  tone: { ja: 'テストトーン', en: 'Test Tone', ko: '테스트 톤', pt: 'Tom de Teste', es: 'Tono de Prueba' } as L5,
  measFreq: { ja: '実測周波数 (Hz)', en: 'Measured Frequency (Hz)', ko: '측정 주파수 (Hz)', pt: 'Frequência Medida (Hz)', es: 'Frecuencia Medida (Hz)' } as L5,
  measPeriod: { ja: '実測周期 (μs) — どちらか一方', en: 'Measured Period (μs) — either/or', ko: '측정 주기 (μs) — 둘 중 하나', pt: 'Período Medido (μs) — um ou outro', es: 'Período Medido (μs) — uno u otro' } as L5,
  results: { ja: '結果', en: 'Results', ko: '결과', pt: 'Resultados', es: 'Resultados' } as L5,
  nominalHz: { ja: '公称周波数', en: 'Nominal Frequency', ko: '공칭 주파수', pt: 'Frequência Nominal', es: 'Frecuencia Nominal' } as L5,
  nominalPeriod: { ja: '公称周期', en: 'Nominal Period', ko: '공칭 주기', pt: 'Período Nominal', es: 'Período Nominal' } as L5,
  deviation: { ja: '速度誤差', en: 'Speed Deviation', ko: '속도 편차', pt: 'Desvio de Velocidade', es: 'Desviación de Velocidad' } as L5,
  centsOff: { ja: 'ピッチ誤差 (cents)', en: 'Pitch Deviation (cents)', ko: '음정 편차 (cents)', pt: 'Desvio de Afinação (cents)', es: 'Desviación de Afinación (cents)' } as L5,
  fast: { ja: '速い', en: 'fast', ko: '빠름', pt: 'rápido', es: 'rápido' } as L5,
  slow: { ja: '遅い', en: 'slow', ko: '느림', pt: 'lento', es: 'lento' } as L5,
  within: { ja: '許容範囲内 (±0.2%)', en: 'Within tolerance (±0.2%)', ko: '허용 범위 (±0.2%)', pt: 'Dentro da tolerância (±0.2%)', es: 'Dentro de la tolerancia (±0.2%)' } as L5,
  footnote: {
    ja: '計算式: deviation[%] = (f_measured / f_nominal − 1) × 100。1%のピッチシフトは約17セントです。CCIR/DIN規格では±0.2%が目安。',
    en: 'Formula: deviation[%] = (f_measured / f_nominal − 1) × 100. 1% pitch shift ≈ 17 cents. CCIR/DIN tolerance is ±0.2%.',
    ko: '공식: 편차[%] = (f_측정 / f_공칭 − 1) × 100. 1% 피치 시프트 ≈ 17센트. CCIR/DIN 허용 오차는 ±0.2%.',
    pt: 'Fórmula: desvio[%] = (f_medida / f_nominal − 1) × 100. 1% ≈ 17 cents.',
    es: 'Fórmula: desviación[%] = (f_medida / f_nominal − 1) × 100. 1% ≈ 17 cents.',
  } as L5,
};

export default function SpeedCal() {
  const { lang } = useLang();
  const t = (k: keyof typeof T) => T[k][lang];

  const [machineId, setMachineId] = useState('b77');
  const machine = MACHINES.find(m => m.id === machineId)!;
  const [speedIdx, setSpeedIdx] = useState(machine.speeds.length - 1);
  const [toneId, setToneId] = useState('t3150');
  const tone = TEST_TONES.find(tt => tt.id === toneId)!;
  const [measFreq, setMeasFreq] = useState('');
  const [measPeriod, setMeasPeriod] = useState('');

  // Ensure valid speedIdx when machine changes
  const effectiveSpeedIdx = Math.min(speedIdx, machine.speeds.length - 1);
  const currentSpeed = machine.speeds[effectiveSpeedIdx];

  const nominal = tone.hz; // calibration tape tone plays at same Hz if speed correct
  const nominalPeriodUs = 1_000_000 / nominal;

  const result = useMemo(() => {
    let fMeas = parseFloat(measFreq);
    if ((!isFinite(fMeas) || fMeas <= 0) && measPeriod) {
      const p = parseFloat(measPeriod);
      if (isFinite(p) && p > 0) fMeas = 1_000_000 / p;
    }
    if (!isFinite(fMeas) || fMeas <= 0) return null;
    const dev = (fMeas / nominal - 1) * 100;
    const cents = 1200 * Math.log2(fMeas / nominal);
    return { fMeas, dev, cents };
  }, [measFreq, measPeriod, nominal]);

  const inTolerance = result && Math.abs(result.dev) <= 0.2;

  return (
    <div style={{ fontFamily: sans, backgroundColor: BG, minHeight: '100vh', color: '#1c1917', padding: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <Link href="/analog-tools" style={{ display: 'inline-block', fontSize: 13, color: ACCENT_DEEP, textDecoration: 'none', marginBottom: 24, opacity: 0.7 }}>{t('back')}</Link>

        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 700, color: ACCENT_DEEP, margin: 0, letterSpacing: '-0.02em' }}>{t('heading')}</h1>
          <p style={{ fontFamily: serif, fontSize: 'clamp(14px, 2vw, 16px)', color: '#57534e', lineHeight: 1.75, marginTop: 12, maxWidth: 720 }}>{t('lead')}</p>
        </header>

        <section style={{ backgroundColor: '#fff', border: `1px solid rgba(217,119,6,0.18)`, borderRadius: 6, padding: 'clamp(20px, 3vw, 28px)', marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div>
              <label style={labelStyle}>{t('machine')}</label>
              <select value={machineId} onChange={e => { setMachineId(e.target.value); setSpeedIdx(0); }} style={selectStyle}>
                {MACHINES.map(m => <option key={m.id} value={m.id}>{m.maker} — {m.name}</option>)}
              </select>
              <div style={{ fontSize: 11, color: '#78716c', marginTop: 6, lineHeight: 1.5 }}>{machine.notes[lang]}</div>
            </div>

            <div>
              <label style={labelStyle}>{t('speed')}</label>
              <select value={effectiveSpeedIdx} onChange={e => setSpeedIdx(parseInt(e.target.value, 10))} style={selectStyle}>
                {machine.speeds.map((s, i) => (
                  <option key={i} value={i}>{s} cm/s ({(s / 2.54).toFixed(2)} ips)</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>{t('tone')}</label>
              <select value={toneId} onChange={e => setToneId(e.target.value)} style={selectStyle}>
                {TEST_TONES.map(tt => <option key={tt.id} value={tt.id}>{tt.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 20 }}>
            <div>
              <label style={labelStyle}>{t('measFreq')}</label>
              <input type="number" value={measFreq} onChange={e => { setMeasFreq(e.target.value); setMeasPeriod(''); }} step="0.001" style={inputStyle} placeholder={nominal.toString()} />
            </div>
            <div>
              <label style={labelStyle}>{t('measPeriod')}</label>
              <input type="number" value={measPeriod} onChange={e => { setMeasPeriod(e.target.value); setMeasFreq(''); }} step="0.01" style={inputStyle} placeholder={nominalPeriodUs.toFixed(2)} />
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#fff', border: `2px solid ${ACCENT}`, borderRadius: 6, padding: 'clamp(24px, 4vw, 36px)', marginBottom: 32 }}>
          <h2 style={{ fontFamily: serif, fontSize: 20, color: ACCENT_DEEP, margin: '0 0 24px 0' }}>
            {t('results')} — {machine.name} @ {currentSpeed} cm/s
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            <ResultCell label={t('nominalHz')} value={`${nominal.toFixed(2)} Hz`} />
            <ResultCell label={t('nominalPeriod')} value={`${nominalPeriodUs.toFixed(2)} μs`} />
            {result && (
              <>
                <ResultCell
                  label={t('deviation')}
                  value={`${result.dev >= 0 ? '+' : ''}${result.dev.toFixed(3)} %`}
                  color={inTolerance ? '#15803d' : result.dev > 0 ? '#b91c1c' : '#1d4ed8'}
                  sub={result.dev >= 0 ? t('fast') : t('slow')}
                  big
                />
                <ResultCell
                  label={t('centsOff')}
                  value={`${result.cents >= 0 ? '+' : ''}${result.cents.toFixed(1)} ¢`}
                  color={Math.abs(result.cents) <= 4 ? '#15803d' : '#b91c1c'}
                  big
                />
              </>
            )}
          </div>
          {result && inTolerance && (
            <div style={{ marginTop: 18, padding: 12, backgroundColor: 'rgba(21,128,61,0.08)', border: '1px solid rgba(21,128,61,0.25)', borderRadius: 4, color: '#15803d', fontSize: 13, fontWeight: 600 }}>
              ✓ {t('within')}
            </div>
          )}
        </section>

        <p style={{ fontSize: 12, color: '#78716c', lineHeight: 1.75, maxWidth: 720, fontFamily: serif }}>{t('footnote')}</p>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, color: ACCENT_DEEP, marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 15, border: '1px solid #d6d3d1', borderRadius: 4, backgroundColor: '#fafaf9', fontFamily: sans, color: '#1c1917' };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

function ResultCell({ label, value, sub, color, big }: { label: string; value: string; sub?: string; color?: string; big?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: ACCENT_DEEP, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: serif, fontSize: big ? 'clamp(22px, 3.5vw, 32px)' : 'clamp(18px, 2.5vw, 22px)', fontWeight: 700, color: color || '#1c1917', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#78716c', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
