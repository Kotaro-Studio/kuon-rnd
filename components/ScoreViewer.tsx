'use client';

/**
 * KUON CLASSICAL ANALYSIS — ScoreViewer
 * =========================================================
 * MusicXML を OSMD (OpenSheetMusicDisplay) で SVG 楽譜描画し、
 * その下にローマ数字トラック・カデンツマーカー・転調タイムラインを重ねるコンポーネント。
 *
 * 設計方針 (CLAUDE.md §44.11 安全領域):
 *   - OSMD は client-only。next/dynamic で SSR 無効化された状態で読み込まれる。
 *   - OSMD 内部座標を直接いじって SVG にテキスト注入するのは脆い (バージョンで変わる)
 *     のでやらない。代わりに：
 *     (1) 楽譜は OSMD でそのまま描く (信頼性高い)
 *     (2) 楽譜の下に独自の「小節 → ローマ数字」トラックを HTML で構築
 *     (3) カデンツ箇所は色マーカーでハイライト
 *     (4) 転調はタイムラインバナーで上部に表示
 *   - これにより OSMD のバージョン更新で壊れない。長期運用向き。
 *
 * IQ190 機能:
 *   - 楽譜上の小節クリックで該当小節のローマ数字トラックがハイライト
 *   - ローマ数字トラックの小節クリックで、その箇所の和声機能・進行を popover 表示
 *   - 転調区間を視覚的に色分け
 *   - レスポンシブ：スマホでは楽譜とトラックを縦並びに自動切替
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

const ACCENT = '#5b21b6';
const GOLD = '#b45309';

interface ChordData {
  measure: number;
  beat: number;
  chord: string;
  roman: string;
  function: string;
}

interface CadenceData {
  measure: number;
  beat: number;
  type: string;
  progression: string[];
}

interface ModulationData {
  from_measure: number;
  to_measure: number;
  key: string;
}

export interface ScoreViewerProps {
  musicxml: string;
  chords: ChordData[];
  cadences: CadenceData[];
  modulations: ModulationData[];
  /** UI 文言のローカライゼーション（呼出側から注入） */
  labels?: {
    rendering: string;
    renderError: string;
    cadenceLegend: string;
    modulationLegend: string;
    romanTrack: string;
    measure: string;
    cadenceTypes: { authentic: string; plagal: string; deceptive: string; half: string };
    functions: { tonic: string; predominant: string; dominant: string; other: string; unknown: string };
  };
}

/** カデンツタイプ → 色 (UI で凡例も提供) */
const CADENCE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  authentic: { bg: '#ede9fe', border: '#7c3aed', label: 'Authentic (V→I)' },
  plagal: { bg: '#dbeafe', border: '#2563eb', label: 'Plagal (IV→I)' },
  deceptive: { bg: '#fed7aa', border: '#ea580c', label: 'Deceptive (V→vi)' },
  half: { bg: '#e2e8f0', border: '#64748b', label: 'Half (→V)' },
};

const FUNCTION_DOTS: Record<string, string> = {
  tonic: '#10b981',         // 緑 — 安定
  predominant: '#f59e0b',   // 琥珀 — 動き
  dominant: '#ef4444',      // 赤 — 緊張
  other: '#94a3b8',
  unknown: '#cbd5e1',
};

export default function ScoreViewer({ musicxml, chords, cadences, modulations, labels }: ScoreViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeasure, setSelectedMeasure] = useState<number | null>(null);
  const [maxMeasure, setMaxMeasure] = useState<number>(0);

  const L = labels ?? {
    rendering: 'Rendering score…',
    renderError: 'Score rendering failed',
    cadenceLegend: 'Cadences',
    modulationLegend: 'Key changes',
    romanTrack: 'Roman numeral track',
    measure: 'M.',
    cadenceTypes: { authentic: 'Authentic', plagal: 'Plagal', deceptive: 'Deceptive', half: 'Half' },
    functions: { tonic: 'Tonic', predominant: 'Pre-dom', dominant: 'Dominant', other: 'Other', unknown: '?' },
  };

  useEffect(() => {
    if (!containerRef.current || !musicxml) return;

    let osmdInstance: { clear: () => void } | null = null;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const mod = await import('opensheetmusicdisplay');
        const { OpenSheetMusicDisplay } = mod;

        if (cancelled || !containerRef.current) return;

        const osmd = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          drawTitle: true,
          drawSubtitle: false,
          drawComposer: true,
          drawCredits: false,
          drawLyricist: false,
          drawingParameters: 'default',
        });
        osmdInstance = osmd as unknown as { clear: () => void };

        await osmd.load(musicxml);
        if (cancelled) return;
        osmd.render();

        // 全小節数を取得（小節トラック生成用）
        try {
          const sheet = (osmd as unknown as { Sheet?: { SourceMeasures?: unknown[] } }).Sheet;
          if (sheet?.SourceMeasures) {
            setMaxMeasure(sheet.SourceMeasures.length);
          } else {
            // フォールバック：chords から最大小節を抽出
            const m = chords.reduce((acc, c) => Math.max(acc, c.measure), 0);
            setMaxMeasure(m);
          }
        } catch {
          const m = chords.reduce((acc, c) => Math.max(acc, c.measure), 0);
          setMaxMeasure(m);
        }

        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unknown error');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        osmdInstance?.clear?.();
      } catch {}
    };
  }, [musicxml, chords]);

  // 小節別にコードを集約
  const chordsByMeasure: Record<number, ChordData[]> = {};
  for (const c of chords) {
    if (!chordsByMeasure[c.measure]) chordsByMeasure[c.measure] = [];
    chordsByMeasure[c.measure].push(c);
  }

  // 小節別にカデンツ
  const cadenceByMeasure: Record<number, CadenceData> = {};
  for (const cad of cadences) {
    cadenceByMeasure[cad.measure] = cad;
  }

  // 小節 → 局所キー（転調マップ）
  const keyByMeasure = (m: number): string | null => {
    for (const mod of modulations) {
      if (m >= mod.from_measure && m <= mod.to_measure) return mod.key;
    }
    return null;
  };

  const handleMeasureClick = useCallback((measure: number) => {
    setSelectedMeasure(measure === selectedMeasure ? null : measure);
  }, [selectedMeasure]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

      {/* 転調タイムライン (上部バナー) */}
      {modulations.length > 1 && (
        <ModulationTimeline modulations={modulations} maxMeasure={maxMeasure} legend={L.modulationLegend} />
      )}

      {/* 凡例 */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center',
        padding: '0.7rem 1rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0',
        fontSize: '0.78rem',
      }}>
        <span style={{ fontWeight: 600, color: '#475569', marginRight: '0.4rem' }}>{L.cadenceLegend}:</span>
        {Object.entries(CADENCE_COLORS).map(([type, color]) => (
          <span key={type} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '2px 10px', borderRadius: 999,
            background: color.bg, border: `1px solid ${color.border}`,
            color: color.border, fontWeight: 500,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: color.border }} />
            {type === 'authentic' ? L.cadenceTypes.authentic
              : type === 'plagal' ? L.cadenceTypes.plagal
              : type === 'deceptive' ? L.cadenceTypes.deceptive
              : L.cadenceTypes.half}
          </span>
        ))}
        <span style={{ marginLeft: 12, color: '#94a3b8' }}>·</span>
        <span style={{ fontWeight: 600, color: '#475569' }}>Functions:</span>
        {Object.entries(FUNCTION_DOTS).filter(([k]) => k !== 'unknown' && k !== 'other').map(([fn, color]) => (
          <span key={fn} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
            {fn === 'tonic' ? L.functions.tonic : fn === 'predominant' ? L.functions.predominant : L.functions.dominant}
          </span>
        ))}
      </div>

      {/* OSMD 楽譜描画コンテナ */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: 'clamp(1rem, 2vw, 1.5rem)',
        border: '1px solid #e2e8f0', minHeight: 200, overflowX: 'auto',
        position: 'relative',
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem', fontFamily: sans }}>
            <div style={{ width: 32, height: 32, margin: '0 auto 0.8rem', border: '3px solid #e2e8f0', borderTopColor: ACCENT, borderRadius: '50%', animation: 'sv-spin 0.8s linear infinite' }} />
            <style>{`@keyframes sv-spin { to { transform: rotate(360deg); } }`}</style>
            {L.rendering}
          </div>
        )}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', padding: '1rem', borderRadius: 8, fontSize: '0.85rem' }}>
            ⚠️ {L.renderError}: {error}
          </div>
        )}
        <div ref={containerRef} style={{ display: loading || error ? 'none' : 'block' }} />
      </div>

      {/* ローマ数字トラック (楽譜の下) */}
      {!loading && !error && maxMeasure > 0 && (
        <RomanTrack
          maxMeasure={maxMeasure}
          chordsByMeasure={chordsByMeasure}
          cadenceByMeasure={cadenceByMeasure}
          keyByMeasure={keyByMeasure}
          selectedMeasure={selectedMeasure}
          onMeasureClick={handleMeasureClick}
          labels={L}
        />
      )}

      {/* 選択された小節の詳細ポップオーバー */}
      {selectedMeasure !== null && chordsByMeasure[selectedMeasure] && (
        <MeasureDetail
          measure={selectedMeasure}
          chords={chordsByMeasure[selectedMeasure]}
          cadence={cadenceByMeasure[selectedMeasure]}
          localKey={keyByMeasure(selectedMeasure)}
          onClose={() => setSelectedMeasure(null)}
          labels={L}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────
// ModulationTimeline — 転調タイムラインバナー
// ──────────────────────────────────────────────────────

function ModulationTimeline({
  modulations,
  maxMeasure,
  legend,
}: {
  modulations: ModulationData[];
  maxMeasure: number;
  legend: string;
}) {
  if (maxMeasure === 0) return null;

  // 転調区間ごとに色を割り当て (最大 8 種類)
  const palette = ['#5b21b6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];
  const uniqueKeys = Array.from(new Set(modulations.map(m => m.key)));
  const keyColor: Record<string, string> = {};
  uniqueKeys.forEach((k, i) => { keyColor[k] = palette[i % palette.length]; });

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.2rem', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: '0.7rem', textTransform: 'uppercase' }}>
        🔀 {legend}
      </div>
      <div style={{ position: 'relative', height: 36, background: '#f8fafc', borderRadius: 6, overflow: 'hidden' }}>
        {modulations.map((m, i) => {
          const start = (m.from_measure - 1) / maxMeasure * 100;
          const width = (m.to_measure - m.from_measure + 1) / maxMeasure * 100;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${start}%`,
              width: `${width}%`,
              top: 0, bottom: 0,
              background: keyColor[m.key],
              borderRight: i < modulations.length - 1 ? '2px solid #fff' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: serif, fontSize: '0.7rem', fontWeight: 600, color: '#fff',
              overflow: 'hidden', whiteSpace: 'nowrap',
              cursor: 'help',
            }} title={`Measures ${m.from_measure}–${m.to_measure}: ${m.key}`}>
              {width > 8 ? m.key : ''}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', fontFamily: mono, marginTop: 4 }}>
        <span>M. 1</span>
        <span>M. {maxMeasure}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// RomanTrack — 小節別ローマ数字トラック
// ──────────────────────────────────────────────────────

function RomanTrack({
  maxMeasure,
  chordsByMeasure,
  cadenceByMeasure,
  keyByMeasure,
  selectedMeasure,
  onMeasureClick,
  labels,
}: {
  maxMeasure: number;
  chordsByMeasure: Record<number, ChordData[]>;
  cadenceByMeasure: Record<number, CadenceData>;
  keyByMeasure: (m: number) => string | null;
  selectedMeasure: number | null;
  onMeasureClick: (m: number) => void;
  labels: NonNullable<ScoreViewerProps['labels']>;
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1.2rem', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
        🎼 {labels.romanTrack}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${maxMeasure}, minmax(60px, 1fr))`,
        gap: 4,
        minWidth: maxMeasure * 60,
      }}>
        {Array.from({ length: maxMeasure }, (_, i) => i + 1).map((m) => {
          const measureChords = chordsByMeasure[m] || [];
          const cadence = cadenceByMeasure[m];
          const cadColor = cadence ? CADENCE_COLORS[cadence.type] : null;
          const localKey = keyByMeasure(m);
          const isSelected = selectedMeasure === m;

          return (
            <button
              key={m}
              onClick={() => onMeasureClick(m)}
              style={{
                background: isSelected ? '#fef3c7' : (cadColor ? cadColor.bg : '#f8fafc'),
                border: isSelected
                  ? `2px solid ${GOLD}`
                  : (cadColor ? `2px solid ${cadColor.border}` : '1px solid #e2e8f0'),
                borderRadius: 6,
                padding: '0.4rem 0.2rem',
                cursor: 'pointer',
                fontFamily: sans,
                textAlign: 'center',
                minHeight: 70,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
              title={cadence ? `${labels.cadenceTypes[cadence.type as keyof typeof labels.cadenceTypes] || cadence.type} cadence` : undefined}
            >
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontFamily: mono, fontWeight: 600 }}>
                {labels.measure}{m}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                {measureChords.length === 0 && (
                  <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>—</span>
                )}
                {measureChords.map((ch, i) => (
                  <span key={i} style={{
                    fontFamily: serif, fontSize: '0.85rem', fontWeight: 600,
                    color: ACCENT,
                    display: 'inline-flex', alignItems: 'center', gap: 2,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: FUNCTION_DOTS[ch.function] || FUNCTION_DOTS.unknown }} />
                    {ch.roman}
                  </span>
                ))}
              </div>
              {localKey && (
                <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontFamily: mono, marginTop: 2 }}>
                  {localKey.replace(' major', '+').replace(' minor', '−')}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// MeasureDetail — 選択した小節のポップオーバー
// ──────────────────────────────────────────────────────

function MeasureDetail({
  measure,
  chords,
  cadence,
  localKey,
  onClose,
  labels,
}: {
  measure: number;
  chords: ChordData[];
  cadence?: CadenceData;
  localKey: string | null;
  onClose: () => void;
  labels: NonNullable<ScoreViewerProps['labels']>;
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '1.2rem 1.5rem',
      border: `2px solid ${GOLD}`, boxShadow: '0 4px 20px rgba(180, 83, 9, 0.1)',
      position: 'relative',
    }}>
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: 10, right: 12, background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8', padding: 0, lineHeight: 1 }}
        aria-label="Close"
      >×</button>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: GOLD, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
        {labels.measure}{measure} DETAIL
      </div>
      {localKey && (
        <div style={{ fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.8rem' }}>
          <strong>Key:</strong> <span style={{ fontFamily: serif, color: ACCENT }}>{localKey}</span>
        </div>
      )}
      {cadence && (
        <div style={{ marginBottom: '0.8rem', padding: '0.6rem 0.9rem', background: CADENCE_COLORS[cadence.type]?.bg || '#f8fafc', border: `1px solid ${CADENCE_COLORS[cadence.type]?.border || '#94a3b8'}`, borderRadius: 6 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: CADENCE_COLORS[cadence.type]?.border || '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {labels.cadenceTypes[cadence.type as keyof typeof labels.cadenceTypes] || cadence.type} cadence
          </div>
          <div style={{ fontFamily: mono, fontSize: '0.85rem', color: '#0f172a', marginTop: 4 }}>
            {cadence.progression.join(' → ')}
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
        {chords.map((c, i) => (
          <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.5rem 0.7rem' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontFamily: mono }}>
              Beat {c.beat}
            </div>
            <div style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 600, color: ACCENT, lineHeight: 1.2 }}>
              {c.roman}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: FUNCTION_DOTS[c.function] || FUNCTION_DOTS.unknown }} />
              {labels.functions[c.function as keyof typeof labels.functions] || c.function}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{c.chord}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
