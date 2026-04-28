'use client';

/**
 * KUON CLASSICAL ANALYSIS — ScoreViewer (Phase A 完全版)
 * =========================================================
 * MusicXML を OSMD でレンダリング + Tone.js + @tonejs/midi で再生統合。
 *
 * 機能:
 *   - macro view: zoom 0.65 で全体俯瞰しやすく
 *   - 楽譜描画: タイトル・作曲者・全声部表示
 *   - MIDI 再生: pieceId からサーバーで MIDI 生成 → ブラウザで再生
 *   - パート別ミュート/ソロ: 各トラックを自由に消したり聞いたり
 *   - テンポ制御: 25%-200%
 *   - 小節クリック → その位置から再生 (Roman Track / OSMD カーソル両方)
 *   - 再生中はカーソルが音符を追う
 *   - 転調タイムライン
 *   - 凡例 + 機能色分け
 *   - 小節詳細ポップオーバー
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

const ACCENT = '#5b21b6';
const GOLD = '#b45309';
const PLAY_GREEN = '#059669';
const PAUSE_AMBER = '#d97706';

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
  pieceId?: string;     // 再生用：MIDI を /api/classical/midi/{pieceId} から取得
  musicxml: string;
  chords: ChordData[];
  cadences: CadenceData[];
  modulations: ModulationData[];
  labels?: {
    rendering: string;
    renderError: string;
    cadenceLegend: string;
    modulationLegend: string;
    romanTrack: string;
    measure: string;
    cadenceTypes: { authentic: string; plagal: string; deceptive: string; half: string };
    functions: { tonic: string; predominant: string; dominant: string; other: string; unknown: string };
    playback?: {
      title: string;
      play: string;
      pause: string;
      restart: string;
      tempo: string;
      voices: string;
      loadingMidi: string;
      midiError: string;
      mute: string;
      solo: string;
    };
  };
}

const CADENCE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  authentic: { bg: '#ede9fe', border: '#7c3aed', label: 'Authentic (V→I)' },
  plagal: { bg: '#dbeafe', border: '#2563eb', label: 'Plagal (IV→I)' },
  deceptive: { bg: '#fed7aa', border: '#ea580c', label: 'Deceptive (V→vi)' },
  half: { bg: '#e2e8f0', border: '#64748b', label: 'Half (→V)' },
};

const FUNCTION_DOTS: Record<string, string> = {
  tonic: '#10b981',
  predominant: '#f59e0b',
  dominant: '#ef4444',
  other: '#94a3b8',
  unknown: '#cbd5e1',
};

// OSMD インスタンス型 (loose - libraryのバージョン互換のため any を許容)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OSMDInstance = any;

export default function ScoreViewer({ pieceId, musicxml, chords, cadences, modulations, labels }: ScoreViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OSMDInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeasure, setSelectedMeasure] = useState<number | null>(null);
  const [maxMeasure, setMaxMeasure] = useState<number>(0);
  const [osmdReady, setOsmdReady] = useState(false);

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

  const playbackLabels = L.playback ?? {
    title: 'Playback',
    play: 'Play',
    pause: 'Pause',
    restart: 'Restart',
    tempo: 'Tempo',
    voices: 'Voices',
    loadingMidi: 'Loading MIDI…',
    midiError: 'MIDI playback unavailable',
    mute: 'Mute',
    solo: 'Solo',
  };

  // OSMD レンダリング (macro view: zoom 0.65)
  useEffect(() => {
    if (!containerRef.current || !musicxml) return;

    let osmdInstance: OSMDInstance | null = null;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        setOsmdReady(false);
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
          drawingParameters: 'compacttight',  // より密に詰めて全体俯瞰
        });
        osmdInstance = osmd;
        osmdRef.current = osmd;

        await osmd.load(musicxml);
        if (cancelled) return;

        // macro view: zoom 0.65 でデフォルトより約 35% 縮小
        try {
          osmd.zoom = 0.65;
        } catch {}

        osmd.render();

        // カーソルを最初の音符に表示（再生時に追従用）
        try {
          osmd.cursor?.show();
          osmd.cursor?.reset();
        } catch {}

        // 全小節数を取得
        try {
          const sheet = osmd.Sheet;
          if (sheet?.SourceMeasures) {
            setMaxMeasure(sheet.SourceMeasures.length);
          } else {
            const m = chords.reduce((acc, c) => Math.max(acc, c.measure), 0);
            setMaxMeasure(m);
          }
        } catch {
          const m = chords.reduce((acc, c) => Math.max(acc, c.measure), 0);
          setMaxMeasure(m);
        }

        setLoading(false);
        setOsmdReady(true);
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

  const cadenceByMeasure: Record<number, CadenceData> = {};
  for (const cad of cadences) {
    cadenceByMeasure[cad.measure] = cad;
  }

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

      {modulations.length > 1 && (
        <ModulationTimeline modulations={modulations} maxMeasure={maxMeasure} legend={L.modulationLegend} />
      )}

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

      {/* 再生コントロール (pieceId が渡されている場合のみ) */}
      {pieceId && osmdReady && (
        <PlaybackPanel
          pieceId={pieceId}
          osmd={osmdRef.current}
          labels={playbackLabels}
        />
      )}

      {/* OSMD 楽譜描画コンテナ (macro view) */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: 'clamp(1rem, 2vw, 1.5rem)',
        border: '1px solid #e2e8f0', minHeight: 200, overflowX: 'auto', overflowY: 'auto',
        position: 'relative', maxHeight: '70vh',
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
// PlaybackPanel — Tone.js + @tonejs/midi 再生エンジン + UI
// ──────────────────────────────────────────────────────

interface MidiTrackInfo {
  index: number;
  name: string;
  noteCount: number;
  midiProgram?: number;
}

function PlaybackPanel({
  pieceId,
  osmd,
  labels,
}: {
  pieceId: string;
  osmd: OSMDInstance | null;
  labels: NonNullable<NonNullable<ScoreViewerProps['labels']>['playback']>;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tempoMultiplier, setTempoMultiplier] = useState(1.0);
  const [tracks, setTracks] = useState<MidiTrackInfo[]>([]);
  const [mutedTracks, setMutedTracks] = useState<Set<number>>(new Set());
  const [soloTrack, setSoloTrack] = useState<number | null>(null);

  // Tone.js 関連の参照（再レンダで失わないように useRef）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toneRef = useRef<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const midiRef = useRef<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synthsRef = useRef<Record<number, any>>({});
  const eventIdsRef = useRef<number[]>([]);
  const cursorEventIdsRef = useRef<number[]>([]);
  const baseBpmRef = useRef<number>(120);

  // MIDI のロード
  useEffect(() => {
    if (!pieceId) return;
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setErrorMsg(null);
      setReady(false);
      try {
        const Tone = await import('tone');
        const { Midi } = await import('@tonejs/midi');
        if (cancelled) return;

        toneRef.current = Tone;

        // 既存スケジュールを全クリア
        Tone.Transport.stop();
        Tone.Transport.cancel(0);
        eventIdsRef.current = [];
        cursorEventIdsRef.current = [];

        // 既存 synth 破棄
        Object.values(synthsRef.current).forEach((s) => {
          try { s.dispose(); } catch {}
        });
        synthsRef.current = {};

        // MIDI を取得
        const res = await fetch(`/api/classical/midi/${pieceId}`);
        if (!res.ok) throw new Error(`MIDI fetch failed: ${res.status}`);
        const buffer = await res.arrayBuffer();
        const midi = new Midi(buffer);
        midiRef.current = midi;

        // ベース BPM を保存（テンポ調整時に乗算する基準）
        const tempo = midi.header.tempos?.[0]?.bpm ?? 120;
        baseBpmRef.current = tempo;
        Tone.Transport.bpm.value = tempo * tempoMultiplier;

        // トラック情報を抽出
        const trackInfos: MidiTrackInfo[] = midi.tracks
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((track: any, idx: number): MidiTrackInfo | null => {
            if (!track.notes || track.notes.length === 0) return null;
            return {
              index: idx,
              name: track.name || track.instrument?.name || `Voice ${idx + 1}`,
              noteCount: track.notes.length,
              midiProgram: track.instrument?.number,
            };
          })
          .filter((t: MidiTrackInfo | null): t is MidiTrackInfo => t !== null);
        setTracks(trackInfos);

        // 各トラックに synth を作成（声楽風 triangle + 緩やかなエンベロープ）
        trackInfos.forEach((info) => {
          const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.04, decay: 0.15, sustain: 0.55, release: 0.4 },
            volume: -10,
          }).toDestination();
          synthsRef.current[info.index] = synth;
        });

        // 全ノートをスケジュール
        trackInfos.forEach((info) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const track = midi.tracks[info.index] as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          track.notes.forEach((note: any) => {
            const id = Tone.Transport.schedule((time: number) => {
              const synth = synthsRef.current[info.index];
              if (!synth) return;
              // ミュート/ソロのチェックは scheduled time で評価したいが、
              // useState は再レンダ時に新しい closure を作ってしまうので
              // ref-based なミュート判定にする（下の updateMute で synth.volume を変えているのでここでは何もしない）
              synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
            }, note.time);
            eventIdsRef.current.push(id);
          });
        });

        // カーソル進行用：unique onset times を取得
        const onsetSet = new Set<number>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        midi.tracks.forEach((t: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          t.notes?.forEach((n: any) => onsetSet.add(n.time));
        });
        const onsetTimes = Array.from(onsetSet).sort((a, b) => a - b);

        // 最初の onset 後の各時刻でカーソルを進める
        onsetTimes.slice(1).forEach((time) => {
          const id = Tone.Transport.schedule((scheduledTime: number) => {
            Tone.Draw.schedule(() => {
              try { osmd?.cursor?.next(); } catch {}
            }, scheduledTime);
          }, time);
          cursorEventIdsRef.current.push(id);
        });

        // 終端で停止コールバック
        Tone.Transport.scheduleOnce(() => {
          Tone.Draw.schedule(() => {
            setIsPlaying(false);
            try { osmd?.cursor?.reset(); } catch {}
            Tone.Transport.stop();
            Tone.Transport.position = 0;
          }, 0);
        }, midi.duration + 0.5);

        setReady(true);
        setIsLoading(false);
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : 'Unknown error');
          setIsLoading(false);
          setReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      const Tone = toneRef.current;
      if (Tone) {
        try {
          Tone.Transport.stop();
          Tone.Transport.cancel(0);
        } catch {}
      }
      Object.values(synthsRef.current).forEach((s) => {
        try { s.dispose(); } catch {}
      });
      synthsRef.current = {};
      try { osmd?.cursor?.reset(); } catch {}
    };
  }, [pieceId, osmd]); // tempoMultiplier 変更は別 effect で扱う

  // テンポ変更
  useEffect(() => {
    const Tone = toneRef.current;
    if (!Tone || !ready) return;
    Tone.Transport.bpm.value = baseBpmRef.current * tempoMultiplier;
  }, [tempoMultiplier, ready]);

  // ミュート/ソロ → synth volume 制御
  useEffect(() => {
    Object.entries(synthsRef.current).forEach(([idxStr, synth]) => {
      const idx = parseInt(idxStr, 10);
      const isMuted = mutedTracks.has(idx);
      const isSoloed = soloTrack !== null && soloTrack !== idx;
      const shouldSilence = isMuted || isSoloed;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (synth as any).volume.value = shouldSilence ? -Infinity : -10;
      } catch {}
    });
  }, [mutedTracks, soloTrack]);

  const handlePlayPause = useCallback(async () => {
    const Tone = toneRef.current;
    if (!Tone || !ready) return;
    try {
      if (!isPlaying) {
        await Tone.start(); // user-gesture でAudioContext 起動
        Tone.Transport.start();
        setIsPlaying(true);
      } else {
        Tone.Transport.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Playback failed');
    }
  }, [isPlaying, ready]);

  const handleRestart = useCallback(async () => {
    const Tone = toneRef.current;
    if (!Tone || !ready) return;
    try {
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      try { osmd?.cursor?.reset(); } catch {}
      await Tone.start();
      Tone.Transport.start();
      setIsPlaying(true);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Restart failed');
    }
  }, [ready, osmd]);

  const toggleMute = useCallback((trackIdx: number) => {
    setMutedTracks((prev) => {
      const next = new Set(prev);
      if (next.has(trackIdx)) next.delete(trackIdx);
      else next.add(trackIdx);
      return next;
    });
  }, []);

  const toggleSolo = useCallback((trackIdx: number) => {
    setSoloTrack((prev) => (prev === trackIdx ? null : trackIdx));
  }, []);

  if (errorMsg) {
    return (
      <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 10, padding: '0.9rem 1.2rem', fontSize: '0.85rem', color: '#92400e' }}>
        ⚠️ {labels.midiError}: {errorMsg}
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1.2rem 1.4rem', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: ready ? '1rem' : 0 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          🎧 {labels.title}
        </div>

        {isLoading && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#94a3b8' }}>
            <span style={{ width: 14, height: 14, border: '2px solid #e2e8f0', borderTopColor: ACCENT, borderRadius: '50%', display: 'inline-block', animation: 'pb-spin 0.8s linear infinite' }} />
            <style>{`@keyframes pb-spin { to { transform: rotate(360deg); } }`}</style>
            {labels.loadingMidi}
          </div>
        )}

        {ready && (
          <>
            <button
              onClick={handlePlayPause}
              style={{
                padding: '0.5rem 1.2rem',
                background: isPlaying ? PAUSE_AMBER : PLAY_GREEN,
                color: '#fff', border: 'none', borderRadius: 999,
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: sans, display: 'inline-flex', alignItems: 'center', gap: 6,
                minWidth: 100, justifyContent: 'center',
              }}
            >
              {isPlaying ? '⏸' : '▶'} {isPlaying ? labels.pause : labels.play}
            </button>

            <button
              onClick={handleRestart}
              style={{
                padding: '0.5rem 1rem', background: 'transparent', color: '#475569',
                border: '1px solid #cbd5e1', borderRadius: 999, fontSize: '0.8rem',
                cursor: 'pointer', fontFamily: sans,
              }}
            >
              ⏮ {labels.restart}
            </button>

            {/* Tempo */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
              <span style={{ color: '#64748b' }}>{labels.tempo}:</span>
              <input
                type="range"
                min="0.25" max="2" step="0.05"
                value={tempoMultiplier}
                onChange={(e) => setTempoMultiplier(parseFloat(e.target.value))}
                style={{ width: 110 }}
              />
              <span style={{ fontFamily: mono, color: '#0f172a', fontWeight: 600, minWidth: 50 }}>
                {Math.round(tempoMultiplier * 100)}%
              </span>
            </div>
          </>
        )}
      </div>

      {ready && tracks.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {labels.voices}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tracks.map((track) => {
              const isMuted = mutedTracks.has(track.index);
              const isSoloed = soloTrack === track.index;
              const isOtherSoloed = soloTrack !== null && soloTrack !== track.index;
              const silenced = isMuted || isOtherSoloed;
              return (
                <div key={track.index} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 999,
                  background: silenced ? '#f1f5f9' : (isSoloed ? '#fef3c7' : '#f8fafc'),
                  border: `1px solid ${isSoloed ? GOLD : (silenced ? '#cbd5e1' : '#e2e8f0')}`,
                  opacity: silenced && !isSoloed ? 0.6 : 1,
                  fontSize: '0.78rem',
                }}>
                  <span style={{
                    fontFamily: serif, color: silenced ? '#94a3b8' : '#0f172a',
                    fontWeight: 500, textDecoration: isMuted ? 'line-through' : 'none',
                  }}>
                    {track.name}
                  </span>
                  <button
                    onClick={() => toggleMute(track.index)}
                    title={labels.mute}
                    style={{
                      padding: '1px 6px', background: isMuted ? '#fee2e2' : 'transparent',
                      border: '1px solid #cbd5e1', borderRadius: 4,
                      color: isMuted ? '#991b1b' : '#64748b',
                      fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', fontFamily: sans,
                    }}
                  >
                    M
                  </button>
                  <button
                    onClick={() => toggleSolo(track.index)}
                    title={labels.solo}
                    style={{
                      padding: '1px 6px', background: isSoloed ? '#fef3c7' : 'transparent',
                      border: `1px solid ${isSoloed ? GOLD : '#cbd5e1'}`, borderRadius: 4,
                      color: isSoloed ? GOLD : '#64748b',
                      fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer', fontFamily: sans,
                    }}
                  >
                    S
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────
// ModulationTimeline
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
// RomanTrack
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
// MeasureDetail
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
