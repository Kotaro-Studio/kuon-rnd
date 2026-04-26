'use client';

// ============================================================
// KUON CHECKLIST — 本番当日の持ち物・タイムライン
// ============================================================
// IQ180 心理学的フック:
// - 楽器選択 → 自動生成リスト (パーソナライズ)
// - 完了率プログレスバー (達成感の視覚化)
// - 過去の本番履歴 (sunk cost + 自己効力感)
// - 「忘れ物ゼロ記録」連続日数 (Duolingo streak)
// - localStorage 永続化 → 自分専用の儀式に
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { AuthGate } from '@/components/AuthGate';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

interface ChecklistItem {
  id: string;
  label: L;
  category: 'gear' | 'attire' | 'logistics' | 'mental';
}

// 楽器別リスト
const INSTRUMENT_PRESETS: Record<string, { name: L; items: ChecklistItem[] }> = {
  violin: {
    name: { ja: 'ヴァイオリン', en: 'Violin', es: 'Violín' },
    items: [
      { id: 'instrument', label: { ja: '楽器本体', en: 'Instrument', es: 'Instrumento' }, category: 'gear' },
      { id: 'bow', label: { ja: '弓', en: 'Bow', es: 'Arco' }, category: 'gear' },
      { id: 'rosin', label: { ja: '松脂', en: 'Rosin', es: 'Resina' }, category: 'gear' },
      { id: 'mute', label: { ja: 'ミュート', en: 'Mute', es: 'Sordina' }, category: 'gear' },
      { id: 'spare-strings', label: { ja: '替え弦 (E線・A線)', en: 'Spare strings (E, A)', es: 'Cuerdas extra' }, category: 'gear' },
      { id: 'shoulder-rest', label: { ja: '肩当て', en: 'Shoulder rest', es: 'Hombrera' }, category: 'gear' },
      { id: 'tuner', label: { ja: 'チューナー', en: 'Tuner', es: 'Afinador' }, category: 'gear' },
      { id: 'cleaning-cloth', label: { ja: 'クリーニングクロス', en: 'Cleaning cloth', es: 'Paño' }, category: 'gear' },
      { id: 'score', label: { ja: '譜面 (予備含む)', en: 'Sheet music (incl. spare)', es: 'Partituras' }, category: 'gear' },
    ],
  },
  piano: {
    name: { ja: 'ピアノ', en: 'Piano', es: 'Piano' },
    items: [
      { id: 'score', label: { ja: '譜面 (暗譜でも念のため)', en: 'Sheet music (even if memorized)', es: 'Partituras' }, category: 'gear' },
      { id: 'page-turner', label: { ja: 'ページめくり対策', en: 'Page-turning plan', es: 'Plan para pasar páginas' }, category: 'logistics' },
      { id: 'pedal-check', label: { ja: 'ペダル確認', en: 'Pedal check', es: 'Revisar pedal' }, category: 'logistics' },
      { id: 'bench-height', label: { ja: '椅子の高さ', en: 'Bench height check', es: 'Altura del banco' }, category: 'logistics' },
      { id: 'hand-warmer', label: { ja: 'ハンドウォーマー', en: 'Hand warmer', es: 'Calentador de manos' }, category: 'gear' },
    ],
  },
  vocal: {
    name: { ja: 'ヴォーカル/声楽', en: 'Vocal', es: 'Voz' },
    items: [
      { id: 'water', label: { ja: '常温の水', en: 'Room-temp water', es: 'Agua templada' }, category: 'gear' },
      { id: 'throat-spray', label: { ja: 'のどスプレー', en: 'Throat spray', es: 'Spray para garganta' }, category: 'gear' },
      { id: 'tissues', label: { ja: 'ティッシュ', en: 'Tissues', es: 'Pañuelos' }, category: 'gear' },
      { id: 'humidifier', label: { ja: '加湿器/マスク', en: 'Humidifier/mask', es: 'Humidificador' }, category: 'gear' },
      { id: 'lyrics', label: { ja: '歌詞 (予備)', en: 'Lyrics (spare)', es: 'Letras' }, category: 'gear' },
      { id: 'no-cold-drinks', label: { ja: '冷たい飲食物を避ける', en: 'Avoid cold food/drinks', es: 'Evitar bebidas frías' }, category: 'logistics' },
    ],
  },
  wind: {
    name: { ja: '管楽器', en: 'Wind Instrument', es: 'Instrumento de Viento' },
    items: [
      { id: 'instrument', label: { ja: '楽器本体', en: 'Instrument', es: 'Instrumento' }, category: 'gear' },
      { id: 'mouthpiece', label: { ja: 'マウスピース', en: 'Mouthpiece', es: 'Boquilla' }, category: 'gear' },
      { id: 'reeds', label: { ja: 'リード (替え 3 枚以上)', en: 'Reeds (3+ spare)', es: 'Cañas (3+ extra)' }, category: 'gear' },
      { id: 'valve-oil', label: { ja: 'バルブオイル', en: 'Valve oil', es: 'Aceite de pistón' }, category: 'gear' },
      { id: 'cleaning-rod', label: { ja: 'クリーニングロッド', en: 'Cleaning rod', es: 'Vara de limpieza' }, category: 'gear' },
      { id: 'cork-grease', label: { ja: 'コルクグリス', en: 'Cork grease', es: 'Grasa de corcho' }, category: 'gear' },
      { id: 'water-key-pad', label: { ja: 'ウォーターキーパッド予備', en: 'Spare water key pad', es: 'Almohadilla de llave' }, category: 'gear' },
      { id: 'score', label: { ja: '譜面', en: 'Sheet music', es: 'Partituras' }, category: 'gear' },
    ],
  },
  guitar: {
    name: { ja: 'ギター', en: 'Guitar', es: 'Guitarra' },
    items: [
      { id: 'instrument', label: { ja: '楽器本体', en: 'Instrument', es: 'Instrumento' }, category: 'gear' },
      { id: 'cable', label: { ja: 'シールドケーブル (予備)', en: 'Cable (spare)', es: 'Cable extra' }, category: 'gear' },
      { id: 'tuner', label: { ja: 'チューナー', en: 'Tuner', es: 'Afinador' }, category: 'gear' },
      { id: 'capo', label: { ja: 'カポ', en: 'Capo', es: 'Cejilla' }, category: 'gear' },
      { id: 'picks', label: { ja: 'ピック (複数)', en: 'Picks (multiple)', es: 'Púas' }, category: 'gear' },
      { id: 'spare-strings', label: { ja: '替え弦 (1セット)', en: 'Spare strings (1 set)', es: 'Cuerdas extra' }, category: 'gear' },
      { id: 'string-winder', label: { ja: '弦巻き', en: 'String winder', es: 'Enrollador' }, category: 'gear' },
    ],
  },
};

// 共通リスト (全楽器共通)
const COMMON_ITEMS: ChecklistItem[] = [
  { id: 'attire-formal', label: { ja: '演奏服', en: 'Performance attire', es: 'Ropa de actuación' }, category: 'attire' },
  { id: 'shoes', label: { ja: '演奏用シューズ', en: 'Performance shoes', es: 'Zapatos' }, category: 'attire' },
  { id: 'id', label: { ja: '身分証', en: 'ID', es: 'Identificación' }, category: 'logistics' },
  { id: 'venue-address', label: { ja: '会場住所・地図', en: 'Venue address/map', es: 'Dirección/mapa' }, category: 'logistics' },
  { id: 'contact-list', label: { ja: '連絡先リスト', en: 'Contact list', es: 'Lista de contactos' }, category: 'logistics' },
  { id: 'water-snack', label: { ja: '水・軽食', en: 'Water & snack', es: 'Agua y snack' }, category: 'logistics' },
  { id: 'phone-charger', label: { ja: 'スマホ充電器', en: 'Phone charger', es: 'Cargador' }, category: 'logistics' },
  { id: 'breathing-prep', label: { ja: '本番 5 分前に呼吸を整える', en: 'Breathe 5 min before stage', es: 'Respirar 5 min antes' }, category: 'mental' },
  { id: 'visualization', label: { ja: '完璧な演奏を頭の中で 1 回再生', en: 'Mental rehearsal of perfect performance', es: 'Visualización mental' }, category: 'mental' },
  { id: 'positive-affirm', label: { ja: '「準備はできている」と心で唱える', en: 'Affirm: "I am ready"', es: 'Afirmación: "Estoy listo"' }, category: 'mental' },
];

const CHECKLIST_STATE_KEY = 'kuon_checklist_state';
const PERFORMANCE_HISTORY_KEY = 'kuon_performance_history';

interface PerformanceLog {
  date: string;        // YYYY-MM-DD
  instrument: string;
  completionRate: number; // 0-100
}

function ChecklistApp() {
  const { lang } = useLang();
  const [instrument, setInstrument] = useState<string>('violin');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [history, setHistory] = useState<PerformanceLog[]>([]);

  // load state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const state = JSON.parse(localStorage.getItem(CHECKLIST_STATE_KEY) || '{}');
      setInstrument(state.instrument || 'violin');
      setChecked(state.checked || {});
      setCustomItems(state.customItems || []);
      setHistory(JSON.parse(localStorage.getItem(PERFORMANCE_HISTORY_KEY) || '[]'));
    } catch { /* ignore */ }
  }, []);

  // persist on change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CHECKLIST_STATE_KEY, JSON.stringify({ instrument, checked, customItems }));
  }, [instrument, checked, customItems]);

  const allItems: ChecklistItem[] = useMemo(() => {
    const base = INSTRUMENT_PRESETS[instrument]?.items || [];
    const custom = customItems.map((s, i) => ({
      id: `custom-${i}`,
      label: { ja: s, en: s, es: s } as L,
      category: 'gear' as const,
    }));
    return [...base, ...COMMON_ITEMS, ...custom];
  }, [instrument, customItems]);

  const completionRate = allItems.length > 0
    ? Math.round((allItems.filter((i) => checked[i.id]).length / allItems.length) * 100)
    : 0;

  function toggleItem(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function changeInstrument(inst: string) {
    setInstrument(inst);
    setChecked({}); // reset on instrument change
  }

  function addCustomItem() {
    if (newItem.trim()) {
      setCustomItems([...customItems, newItem.trim()]);
      setNewItem('');
    }
  }

  function removeCustomItem(idx: number) {
    setCustomItems(customItems.filter((_, i) => i !== idx));
    const id = `custom-${idx}`;
    const newChecked = { ...checked };
    delete newChecked[id];
    setChecked(newChecked);
  }

  function logPerformance() {
    const today = new Date().toISOString().slice(0, 10);
    const newLog: PerformanceLog = { date: today, instrument, completionRate };
    const newHistory = [newLog, ...history].slice(0, 50);
    setHistory(newHistory);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PERFORMANCE_HISTORY_KEY, JSON.stringify(newHistory));
    }
    // reset state for next performance
    setChecked({});
    alert(t({
      ja: `本番完了を記録しました! 完了率: ${completionRate}%`,
      en: `Performance logged! Completion: ${completionRate}%`,
      es: `Actuación registrada! Completado: ${completionRate}%`,
    }, lang));
  }

  // group by category
  const grouped = useMemo(() => {
    const g: Record<ChecklistItem['category'], ChecklistItem[]> = { gear: [], attire: [], logistics: [], mental: [] };
    for (const it of allItems) g[it.category].push(it);
    return g;
  }, [allItems]);

  const categoryLabels: Record<ChecklistItem['category'], L> = {
    gear: { ja: '🎻 楽器・機材', en: '🎻 Instrument & Gear', es: '🎻 Instrumento' },
    attire: { ja: '👔 衣装', en: '👔 Attire', es: '👔 Vestimenta' },
    logistics: { ja: '🗺 移動・身の回り', en: '🗺 Logistics', es: '🗺 Logística' },
    mental: { ja: '🧘 メンタル準備', en: '🧘 Mental Preparation', es: '🧘 Preparación mental' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 'clamp(1rem, 4vw, 2.5rem) 1rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Link href="/checklist-lp" style={{ fontFamily: serif, fontSize: '1rem', color: '#475569', textDecoration: 'none', letterSpacing: '0.1em' }}>
            ← KUON CHECKLIST
          </Link>
          <Link href="/audio-apps" style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'none' }}>
            {t({ ja: 'すべてのアプリ', en: 'All apps', es: 'Todas las apps' }, lang)}
          </Link>
        </header>

        {/* Instrument selector */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.6rem', fontWeight: 600 }}>
            {t({ ja: '楽器を選ぶ', en: 'Choose instrument', es: 'Elige instrumento' }, lang)}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {Object.entries(INSTRUMENT_PRESETS).map(([k, v]) => (
              <button
                key={k} onClick={() => changeInstrument(k)}
                style={{
                  background: instrument === k ? ACCENT : '#fff',
                  color: instrument === k ? '#fff' : '#475569',
                  border: `1px solid ${instrument === k ? ACCENT : '#cbd5e1'}`,
                  padding: '0.45rem 0.9rem', borderRadius: 999, fontSize: '0.78rem',
                  fontFamily: sans, cursor: 'pointer',
                }}
              >
                {t(v.name, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: serif, fontSize: '1.1rem', color: '#0f172a' }}>
              {t({ ja: '本番準備完了率', en: 'Preparation Complete', es: 'Preparación completa' }, lang)}
            </span>
            <span style={{ fontFamily: sans, fontSize: '1.4rem', fontWeight: 600, color: completionRate === 100 ? '#10b981' : ACCENT }}>
              {completionRate}%
            </span>
          </div>
          <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${completionRate}%`, height: '100%',
              background: completionRate === 100 ? '#10b981' : ACCENT,
              transition: 'width 0.4s ease',
            }} />
          </div>
          {completionRate === 100 && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={logPerformance}
                style={{
                  background: '#10b981', color: '#fff', border: 'none',
                  padding: '0.7rem 1.5rem', borderRadius: 8, fontSize: '0.9rem', fontWeight: 500,
                  fontFamily: sans, cursor: 'pointer',
                }}
              >
                ✓ {t({ ja: '本番完了を記録する', en: 'Log Performance', es: 'Registrar actuación' }, lang)}
              </button>
            </div>
          )}
        </div>

        {/* Checklist by category */}
        {(['gear', 'attire', 'logistics', 'mental'] as const).map((cat) => {
          const items = grouped[cat];
          if (items.length === 0) return null;
          return (
            <div key={cat} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: serif, fontSize: '1rem', color: '#0f172a', marginBottom: '0.8rem' }}>
                {t(categoryLabels[cat], lang)}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {items.map((item) => (
                  <label key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.5rem 0.7rem', borderRadius: 8,
                    background: checked[item.id] ? '#f0fdf4' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}>
                    <input
                      type="checkbox"
                      checked={!!checked[item.id]}
                      onChange={() => toggleItem(item.id)}
                      style={{ width: 18, height: 18, accentColor: ACCENT }}
                    />
                    <span style={{
                      fontSize: '0.88rem',
                      color: checked[item.id] ? '#16a34a' : '#0f172a',
                      textDecoration: checked[item.id] ? 'line-through' : 'none',
                    }}>
                      {t(item.label, lang)}
                    </span>
                    {item.id.startsWith('custom-') && (
                      <button
                        onClick={(e) => { e.preventDefault(); removeCustomItem(parseInt(item.id.split('-')[1], 10)); }}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        ✕
                      </button>
                    )}
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        {/* Custom item add */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.6rem', fontWeight: 600 }}>
            ➕ {t({ ja: '独自アイテムを追加', en: 'Add custom item', es: 'Agregar ítem personalizado' }, lang)}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={t({ ja: '例: 楽屋のキー', en: 'e.g. green room key', es: 'ej. llave del camerino' }, lang)}
              onKeyDown={(e) => { if (e.key === 'Enter') addCustomItem(); }}
              style={{ flex: 1, padding: '0.5rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.85rem' }}
            />
            <button
              onClick={addCustomItem}
              style={{ background: ACCENT, color: '#fff', border: 'none', padding: '0.5rem 1.1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
            >
              {t({ ja: '追加', en: 'Add', es: 'Añadir' }, lang)}
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ background: 'rgba(2,132,199,0.05)', border: '1px solid rgba(2,132,199,0.2)', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ fontFamily: serif, fontSize: '1rem', color: '#0f172a', marginBottom: '0.8rem' }}>
              📋 {t({ ja: `本番履歴 (${history.length} 件)`, en: `Performance History (${history.length})`, es: `Historial (${history.length})` }, lang)}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {history.slice(0, 5).map((log, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', padding: '0.3rem 0' }}>
                  <span>{log.date}</span>
                  <span>{INSTRUMENT_PRESETS[log.instrument]?.name?.[lang] || log.instrument}</span>
                  <span style={{ color: log.completionRate === 100 ? '#10b981' : ACCENT, fontWeight: 600 }}>{log.completionRate}%</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: ACCENT, fontWeight: 500 }}>
              {t({
                ja: '🔥 過去の本番で平均 ' + Math.round(history.reduce((a, b) => a + b.completionRate, 0) / history.length) + '% を達成',
                en: '🔥 Average ' + Math.round(history.reduce((a, b) => a + b.completionRate, 0) / history.length) + '% across performances',
                es: '🔥 Promedio ' + Math.round(history.reduce((a, b) => a + b.completionRate, 0) / history.length) + '%',
              }, lang)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  return (
    <AuthGate appName="checklist">
      <ChecklistApp />
    </AuthGate>
  );
}
