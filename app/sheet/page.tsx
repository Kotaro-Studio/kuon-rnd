'use client';

/**
 * KUON SHEET — リードシートエディタ (v2: 視覚編集対応版)
 *
 * 機能:
 *   - クイック挿入パレット (コード・小節・歌詞行・スタイル例)
 *   - 譜面上のコード/歌詞をクリックで編集
 *   - ABC notation テキストエディタ + ライブプレビュー (両方利用可)
 *   - abcjs 内蔵 synth で MIDI 再生
 *   - 画像スキャン (Concerto+) → ABC 自動変換
 *   - クラウド保存 (Free 10 譜面・Concerto+ 無制限)
 *   - PDF / MIDI / ABC ダウンロード
 *   - ABC チートシート (開閉式)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/AuthGate';
import { useLang } from '@/context/LangContext';

const PAPER = '#fbfaf6';
const PAPER_DEEP = '#f0ece1';
const INK = '#1a1a1a';
const INK_FAINT = '#7a7575';
const ACCENT = '#3a5f7a';
const RULE = '#d8d2c2';
const HIGHLIGHT = '#fdf6e8';
const CHORD_BG = '#eef3f7';

const serif = '"Shippori Mincho", "Noto Serif JP", "Times New Roman", serif';
const sans = '"Helvetica Neue", "Inter", "Hiragino Sans", system-ui, sans-serif';
const mono = 'ui-monospace, "SF Mono", Consolas, "Liberation Mono", monospace';

type LyricsLang = 'ja' | 'en' | 'es' | 'de';

interface SheetMeta {
  id: string;
  title: string;
  updatedAt: string;
  lyricsLang: string;
}

// ─── ABC サンプル例 4 種類 ───
const SAMPLE_POP = `X:1
T:My New Song
C:
M:4/4
L:1/4
Q:1/4=120
K:C
"C"c2 "Am"e2 | "F"f2 "G"g2 | "C"c2 "Am"a2 | "F"f2 "G"g2 |
w: あ あ あ あ あ あ あ あ あ あ あ あ あ あ あ あ
"C"c4 |]
w: あ あ あ あ
`;

const SAMPLE_JAZZ = `X:1
T:Blue Mood
C:
M:4/4
L:1/4
Q:1/4=92
K:F
"Fmaj7"f2 "Dm7"a2 | "Gm7"g2 "C7"c'2 | "Fmaj7"f3 e | "Dm7"d2 c2 |
"Bbmaj7"B2 "A7"A2 | "Dm7"d2 "G7"g2 | "Cm7"c2 "F7"f2 | "Bbmaj7"B4 |]
`;

const SAMPLE_FOLK = `X:1
T:Morning Folk Song
C:
M:3/4
L:1/4
Q:1/4=110
K:G
"G"g2 a | "C"c'2 b | "G"g2 e | "D"d2 d |
w: ゆ う や み の な か で
"G"g2 a | "Em"b2 a | "C"c'2 a | "G"g3 |]
w: あ な た に お も い を
`;

const SAMPLE_BALLAD = `X:1
T:Quiet Ballad
C:
M:4/4
L:1/4
Q:1/4=72
K:Am
"Am"e2 a2 | "F"f3 e | "C"e2 c2 | "G"d4 |
w: 静 か な 夜 の 中 で
"Am"a2 c'2 | "F"b2 a2 | "Dm"f2 e2 | "E7"e4 |]
w: ひ と り う た う あ な た へ
`;

// ─── デフォルトコードパレット (リードシートで頻出) ───
const POPULAR_CHORDS = [
  'C', 'Cmaj7', 'C7', 'Dm', 'Dm7', 'D', 'D7',
  'Em', 'Em7', 'E', 'E7', 'F', 'Fmaj7', 'F7',
  'G', 'G7', 'Gmaj7', 'Am', 'Am7', 'A', 'A7',
  'Bm', 'Bm7', 'B7', 'Bbmaj7', 'Bb7',
];

const t = <T extends Record<string, string>>(map: T, lang: string): string => {
  const k = lang as keyof T;
  return (map[k] as string) || (map['ja'] as string) || (map['en'] as string) || '';
};

declare global {
  interface Window { ABCJS?: any; }
}

// ──────────────────────────────────────────────────────────────────────────
export default function SheetPage() {
  return (
    <AuthGate appName="sheet" strict={false}>
      <SheetEditor />
    </AuthGate>
  );
}

function SheetEditor() {
  const { lang } = useLang();

  const [abc, setAbc] = useState<string>(SAMPLE_POP);
  const [title, setTitle] = useState<string>('My New Song');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [lyricsLang, setLyricsLang] = useState<LyricsLang>('ja');

  const [abcjsReady, setAbcjsReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [sheets, setSheets] = useState<SheetMeta[]>([]);
  const [playing, setPlaying] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const renderRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const visualObjRef = useRef<any>(null);     // play 用に visualObj を保持
  const synthRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const abcRef = useRef<string>(abc);          // クリックハンドラ用に最新 ABC を参照
  abcRef.current = abc;

  // ── abcjs ロード ──
  useEffect(() => {
    if (window.ABCJS) {
      setAbcjsReady(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/abcjs@6.4.4/dist/abcjs-basic-min.min.js';
    s.async = true;
    s.onload = () => setAbcjsReady(true);
    s.onerror = () => setErrorMsg(t({ ja: 'abcjs ロード失敗', en: 'Failed to load abcjs' }, lang));
    document.body.appendChild(s);
  }, [lang]);

  // ── 譜面レンダリング + クリックハンドラ ──
  useEffect(() => {
    if (!abcjsReady || !renderRef.current || !window.ABCJS) return;
    try {
      const result = window.ABCJS.renderAbc(renderRef.current, abc, {
        responsive: 'resize',
        add_classes: true,
        staffwidth: 760,
        clickListener: handleScoreClick,
      });
      visualObjRef.current = result?.[0] || null;
    } catch (e) {
      console.warn('abcjs render error', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abc, abcjsReady]);

  // ── クリックハンドラ: コード/歌詞/音符を判別して編集 ──
  function handleScoreClick(abselem: any, _tuneNumber: number, classes: string[] | string) {
    if (!abselem) return;
    const classList = Array.isArray(classes)
      ? classes
      : typeof classes === 'string'
      ? classes.split(' ')
      : [];

    // コード (annotation) クリック
    const isChord =
      classList.includes('abcjs-annotation') ||
      (abselem.abcelem?.chord && abselem.abcelem.chord.length > 0);

    if (isChord) {
      const currentChord = abselem.abcelem?.chord?.[0]?.name || extractTextFromAbselem(abselem);
      const newChord = window.prompt(
        t({ ja: 'コード名を入力 (例: C, Am, F#m7, G7)', en: 'Chord name (e.g. C, Am, F#m7, G7)' }, lang),
        currentChord || '',
      );
      if (newChord !== null) {
        replaceChordInAbc(currentChord, newChord);
      }
      return;
    }

    // 歌詞 (lyric) クリック
    const isLyric = classList.some((c) => c.startsWith('abcjs-lyric') || c.startsWith('abcjs-l'));
    if (isLyric) {
      const currentLyric = extractTextFromAbselem(abselem) || abselem.abcelem?.text || '';
      const newLyric = window.prompt(
        t({ ja: '歌詞を編集 (空白で次の音節)', en: 'Edit lyric (space for next syllable)' }, lang),
        currentLyric,
      );
      if (newLyric !== null) {
        replaceLyricInAbc(currentLyric, newLyric);
      }
      return;
    }

    // 音符クリック → 移調メニュー
    if (abselem.abcelem?.pitches) {
      const action = window.prompt(
        t(
          {
            ja: '操作: + (半音上) / - (半音下) / 8 (1 オクターブ上) / 9 (1 オクターブ下) / 削除は d',
            en: 'Action: + (up half) / - (down half) / 8 (oct up) / 9 (oct down) / d (delete)',
          },
          lang,
        ),
        '',
      );
      if (!action) return;
      const startChar = abselem.abcelem.startChar;
      const endChar = abselem.abcelem.endChar;
      if (typeof startChar === 'number' && typeof endChar === 'number') {
        if (action === '+') transposeNoteInAbc(startChar, endChar, +1);
        else if (action === '-') transposeNoteInAbc(startChar, endChar, -1);
        else if (action === '8') transposeNoteInAbc(startChar, endChar, +12);
        else if (action === '9') transposeNoteInAbc(startChar, endChar, -12);
        else if (action === 'd') deleteNoteInAbc(startChar, endChar);
      }
    }
  }

  function extractTextFromAbselem(abselem: any): string {
    try {
      if (abselem?.abcelem?.text) return abselem.abcelem.text;
      const elements = abselem?.elemset || [];
      for (const el of elements) {
        if (el?.textContent) return el.textContent;
      }
      return '';
    } catch {
      return '';
    }
  }

  // コード置換 (シンプル: ABC 全体で最初に見つかる "name" を newName に)
  function replaceChordInAbc(oldChord: string, newChord: string) {
    if (!oldChord) {
      setErrorMsg(t({ ja: '元のコードを特定できませんでした', en: 'Could not identify the chord' }, lang));
      return;
    }
    const escaped = oldChord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`"${escaped}"`);
    const newAbc = abcRef.current.replace(re, `"${newChord}"`);
    if (newAbc === abcRef.current) {
      setErrorMsg(t({ ja: 'コードを置換できませんでした (テキストエディタで直接編集してください)', en: 'Could not replace chord (edit ABC text directly)' }, lang));
      return;
    }
    setAbc(newAbc);
  }

  // 歌詞置換 (w: 行内の最初に見つかる単語を)
  function replaceLyricInAbc(oldLyric: string, newLyric: string) {
    if (!oldLyric) return;
    const lines = abcRef.current.split('\n');
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('w:') && lines[i].includes(oldLyric)) {
        lines[i] = lines[i].replace(oldLyric, newLyric);
        changed = true;
        break;
      }
    }
    if (changed) setAbc(lines.join('\n'));
    else setErrorMsg(t({ ja: '歌詞を置換できませんでした', en: 'Could not replace lyric' }, lang));
  }

  // 音符の移調 (startChar..endChar の範囲を抽出して octave を変更)
  function transposeNoteInAbc(start: number, end: number, semitones: number) {
    const before = abcRef.current.slice(0, start);
    const note = abcRef.current.slice(start, end);
    const after = abcRef.current.slice(end);
    const transposed = transposeAbcNote(note, semitones);
    setAbc(before + transposed + after);
  }

  function deleteNoteInAbc(start: number, end: number) {
    const before = abcRef.current.slice(0, start);
    const after = abcRef.current.slice(end);
    setAbc(before + after);
  }

  // 簡易移調 (オクターブ変更のみ確実、半音変更は ABC 上では難しいので octave 単位を推奨)
  function transposeAbcNote(note: string, semitones: number): string {
    if (semitones === 12) {
      // オクターブ上: 大文字→小文字、小文字→アポストロフィ追加
      return note.replace(/^([A-Ga-g])/, (_, n) => {
        if (/[A-G]/.test(n)) return n.toLowerCase();
        return n + "'";
      });
    }
    if (semitones === -12) {
      // オクターブ下
      return note.replace(/^([a-g])('*)/, (_, n, apos) => {
        if (apos.length > 0) return n + apos.slice(0, -1);
        return n.toUpperCase();
      });
    }
    if (semitones === 1) {
      // 半音上: 単純に ^ プレフィックス追加 (シャープ)
      if (note.startsWith('^') || note.startsWith('_') || note.startsWith('=')) return note;
      return '^' + note;
    }
    if (semitones === -1) {
      if (note.startsWith('^') || note.startsWith('_') || note.startsWith('=')) return note;
      return '_' + note;
    }
    return note;
  }

  // ── テキストエディタにカーソル位置で挿入 ──
  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    if (!ta) {
      setAbc((prev) => prev + text);
      return;
    }
    const start = ta.selectionStart ?? abc.length;
    const end = ta.selectionEnd ?? abc.length;
    const newAbc = abc.slice(0, start) + text + abc.slice(end);
    setAbc(newAbc);
    // カーソル位置を挿入後の末尾に
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + text.length;
    }, 0);
  }

  // ── 譜面一覧ロード ──
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kuon_token') : null;
    if (!token) return;
    fetch('/api/sheet/list', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.sheets)) setSheets(d.sheets);
      })
      .catch(() => {});
  }, [successMsg]);

  // ── メッセージ自動消去 ──
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  // ── 画像スキャン ──
  const handleScan = useCallback(async (file: File) => {
    if (scanning) return;
    setScanning(true);
    setErrorMsg('');
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const token = localStorage.getItem('kuon_token');
      const res = await fetch('/api/sheet/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageBase64: base64, lyricsLang }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setErrorMsg(
            t(
              {
                ja: `今月のスキャンクォータを使い切りました (${data.used}/${data.quota})。Concerto プラン以上でご利用ください。`,
                en: `Monthly scan quota exceeded (${data.used}/${data.quota}). Upgrade to Concerto.`,
              },
              lang,
            ),
          );
        } else {
          setErrorMsg(data.error || data.message || 'Scan failed');
        }
        return;
      }
      setAbc(data.abc);
      const titleMatch = data.abc.match(/^T:\s*(.+)$/m);
      if (titleMatch) setTitle(titleMatch[1].trim());
      setCurrentId(null);
      setSuccessMsg(
        t(
          {
            ja: `スキャン完了 (信頼度: ${data.confidence}). エディタで校正してください。`,
            en: `Scan complete (${data.confidence}). Refine in editor.`,
          },
          lang,
        ),
      );
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setScanning(false);
    }
  }, [scanning, lyricsLang, lang]);

  // ── 保存 ──
  const handleSave = useCallback(async () => {
    if (saving) return;
    if (!title.trim() || !abc.trim()) {
      setErrorMsg(t({ ja: 'タイトルと譜面が必要です', en: 'Title and ABC required' }, lang));
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('kuon_token');
      const res = await fetch('/api/sheet/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: currentId, title, abc, lyricsLang }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.error === 'FREE_LIMIT_EXCEEDED') {
          setErrorMsg(data.message || t({ ja: 'Free 上限', en: 'Free limit' }, lang));
        } else {
          setErrorMsg(data.error || data.message || 'Save failed');
        }
        return;
      }
      setCurrentId(data.id);
      setSuccessMsg(t({ ja: '保存しました', en: 'Saved' }, lang));
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSaving(false);
    }
  }, [saving, currentId, title, abc, lyricsLang, lang]);

  const handleLoad = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('kuon_token');
      const res = await fetch(`/api/sheet/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Load failed'); return; }
      setAbc(data.sheet.abc);
      setTitle(data.sheet.title);
      setLyricsLang(data.sheet.lyricsLang);
      setCurrentId(data.sheet.id);
      setSuccessMsg(t({ ja: '読み込みました', en: 'Loaded' }, lang));
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    }
  }, [lang]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm(t({ ja: 'この譜面を削除しますか?', en: 'Delete this sheet?' }, lang))) return;
    try {
      const token = localStorage.getItem('kuon_token');
      const res = await fetch(`/api/sheet/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSheets((prev) => prev.filter((s) => s.id !== id));
        if (currentId === id) {
          setAbc(SAMPLE_POP);
          setTitle('My New Song');
          setCurrentId(null);
        }
        setSuccessMsg(t({ ja: '削除しました', en: 'Deleted' }, lang));
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    }
  }, [currentId, lang]);

  const handleNew = useCallback(() => {
    setAbc(SAMPLE_POP);
    setTitle('My New Song');
    setCurrentId(null);
    setSuccessMsg(t({ ja: '新しい譜面', en: 'New sheet' }, lang));
  }, [lang]);

  const handleLoadSample = useCallback((style: 'pop' | 'jazz' | 'folk' | 'ballad') => {
    const map = { pop: SAMPLE_POP, jazz: SAMPLE_JAZZ, folk: SAMPLE_FOLK, ballad: SAMPLE_BALLAD };
    setAbc(map[style]);
    setTitle({ pop: 'My New Song', jazz: 'Blue Mood', folk: 'Morning Folk Song', ballad: 'Quiet Ballad' }[style]);
    setCurrentId(null);
  }, []);

  // ── 再生 / 停止 (修正版) ──
  const handlePlay = useCallback(async () => {
    if (!abcjsReady || !window.ABCJS) {
      setErrorMsg(t({ ja: '譜面エンジン読み込み中', en: 'Score engine loading' }, lang));
      return;
    }
    if (playing && synthRef.current) {
      try { synthRef.current.stop(); } catch {}
      setPlaying(false);
      return;
    }
    try {
      // AudioContext は user gesture 後に作成
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      // suspended 状態なら resume
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      // 既にレンダリング済みの visualObj を使う (これが重要)
      const visualObj = visualObjRef.current;
      if (!visualObj) {
        setErrorMsg(t({ ja: '譜面が解析できません', en: 'Score not parsed' }, lang));
        return;
      }

      const synth = new window.ABCJS.synth.CreateSynth();
      await synth.init({
        audioContext: audioCtxRef.current,
        visualObj,
        millisecondsPerMeasure: 2000,
      });
      await synth.prime();
      synth.start();

      synthRef.current = synth;
      setPlaying(true);

      // 終了検知 (synth がコールバックを提供しないため、概算で停止表示)
      const visualObjDuration = visualObj.getTotalTime?.() || 0;
      if (visualObjDuration > 0) {
        setTimeout(() => setPlaying(false), visualObjDuration * 1000 + 500);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Playback failed';
      setErrorMsg(`${t({ ja: '再生エラー', en: 'Playback error' }, lang)}: ${msg}`);
    }
  }, [abcjsReady, playing, lang]);

  useEffect(() => {
    return () => {
      if (synthRef.current) { try { synthRef.current.stop(); } catch {} }
    };
  }, []);

  // ── PDF ── 印刷ダイアログ経由
  const handleDownloadPDF = useCallback(() => {
    if (!renderRef.current) return;
    const svg = renderRef.current.querySelector('svg');
    if (!svg) { setErrorMsg('SVG not ready'); return; }
    const win = window.open('', '_blank');
    if (!win) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    win.document.write(`<!DOCTYPE html>
<html><head><title>${title} — KUON SHEET</title>
<style>body{margin:24px;font-family:${serif};} h1{font-size:1.4rem;font-weight:400;margin:0 0 1rem;}</style>
</head><body><h1>${title}</h1>${svgData}
<script>setTimeout(()=>window.print(),300);</script>
</body></html>`);
    win.document.close();
  }, [title]);

  const handleDownloadABC = useCallback(() => {
    const blob = new Blob([abc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^\w一-龯぀-ゟ゠-ヿ -]/g, '_')}.abc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [abc, title]);

  const handleDownloadMIDI = useCallback(async () => {
    if (!abcjsReady || !window.ABCJS || !visualObjRef.current) return;
    try {
      const midi = window.ABCJS.synth.getMidiFile(visualObjRef.current, { generateInline: false });
      const blob = new Blob([midi], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^\w一-龯぀-ゟ゠-ヿ -]/g, '_')}.mid`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'MIDI export failed');
    }
  }, [abcjsReady, title]);

  // ──────────────────────────────────────────────────────────────────────
  return (
    <main style={{ background: PAPER, minHeight: '100vh', color: INK, fontFamily: serif }}>
      {/* HEADER */}
      <section style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 4vw, 3rem) 0.8rem', borderBottom: `1px solid ${RULE}`, maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 2.8vw, 2rem)', margin: 0, fontWeight: 400, letterSpacing: '0.04em' }}>
            {t({ ja: 'リードシート、思いついたままに。', en: 'Lead sheets, as they come to you.' }, lang)}
          </h1>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button onClick={() => setShowCheatSheet(!showCheatSheet)} style={btnSecondary()}>
              {showCheatSheet ? '✕' : '?'} {t({ ja: '記法早見表', en: 'Cheat sheet' }, lang)}
            </button>
            <Link href="/sheet-lp" style={{ ...btnSecondary(), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              {t({ ja: '使い方', en: 'How it works' }, lang)}
            </Link>
          </div>
        </div>
      </section>

      {/* 操作のヒント */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0.8rem clamp(1.5rem, 4vw, 3rem) 0' }}>
        <div style={{ background: HIGHLIGHT, padding: '0.7rem 1rem', borderRadius: 3, fontFamily: sans, fontSize: '0.82rem', color: INK, lineHeight: 1.7 }}>
          💡 {t(
            {
              ja: 'プレビュー上のコード・歌詞・音符をクリックすると編集できます。下のクイック挿入パレットでコードや小節を追加。手書きの楽譜は「📷 画像スキャン」で取り込めます。',
              en: 'Click chords, lyrics, or notes on the preview to edit them. Use Quick Insert below to add chords/measures. Scan handwritten sheets with "📷 Scan image".',
            },
            lang,
          )}
        </div>
      </section>

      {/* CHEAT SHEET (開閉) */}
      {showCheatSheet && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0.8rem clamp(1.5rem, 4vw, 3rem) 0' }}>
          <div style={{ background: PAPER_DEEP, padding: '1rem 1.2rem', borderRadius: 3, border: `1px solid ${RULE}`, fontFamily: sans, fontSize: '0.82rem', color: INK, lineHeight: 1.85 }}>
            <strong style={{ letterSpacing: '0.1em' }}>{t({ ja: 'ABC 記法 早見表', en: 'ABC Notation Quick Reference' }, lang)}</strong>
            <ul style={{ margin: '0.5rem 0 0', padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.4rem' }}>
              <li><code style={codeStyle()}>c d e f g a b</code> {t({ ja: '中音域 (4 オクターブ目)', en: 'middle octave' }, lang)}</li>
              <li><code style={codeStyle()}>C D E F G A B</code> {t({ ja: '低音域 (3 オクターブ目)', en: 'lower octave' }, lang)}</li>
              <li><code style={codeStyle()}>c'</code> {t({ ja: '高音域に↑ / アポストロフィ', en: 'higher (apostrophe)' }, lang)}</li>
              <li><code style={codeStyle()}>C,</code> {t({ ja: '低音域に↓ / カンマ', en: 'lower (comma)' }, lang)}</li>
              <li><code style={codeStyle()}>c2</code> {t({ ja: '2 拍 (二分音符)', en: 'half note (×2)' }, lang)}</li>
              <li><code style={codeStyle()}>c/2</code> {t({ ja: '半拍 (八分音符)', en: 'eighth note (÷2)' }, lang)}</li>
              <li><code style={codeStyle()}>z</code> {t({ ja: '休符', en: 'rest' }, lang)}</li>
              <li><code style={codeStyle()}>^c _c =c</code> {t({ ja: 'シャープ / フラット / ナチュラル', en: 'sharp / flat / natural' }, lang)}</li>
              <li><code style={codeStyle()}>"Cmaj7"c</code> {t({ ja: 'コード付きの音符', en: 'note with chord' }, lang)}</li>
              <li><code style={codeStyle()}>|</code> {t({ ja: '小節線', en: 'bar line' }, lang)}</li>
              <li><code style={codeStyle()}>|]</code> {t({ ja: '終止線', en: 'final bar' }, lang)}</li>
              <li><code style={codeStyle()}>|:...:|</code> {t({ ja: '反復記号', en: 'repeat' }, lang)}</li>
              <li><code style={codeStyle()}>w: La la la</code> {t({ ja: '歌詞行 (空白で次の音符へ)', en: 'lyrics line (space = next note)' }, lang)}</li>
              <li><code style={codeStyle()}>K:G</code> {t({ ja: '調 (G major)', en: 'key (G major)' }, lang)}</li>
              <li><code style={codeStyle()}>K:Am</code> {t({ ja: '調 (A minor)', en: 'key (A minor)' }, lang)}</li>
              <li><code style={codeStyle()}>M:3/4</code> {t({ ja: '拍子', en: 'time signature' }, lang)}</li>
              <li><code style={codeStyle()}>Q:1/4=120</code> {t({ ja: 'テンポ', en: 'tempo (BPM)' }, lang)}</li>
            </ul>
          </div>
        </section>
      )}

      {/* TOOLBAR */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem clamp(1.5rem, 4vw, 3rem) 0' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={handleNew} style={btnSecondary()}>{t({ ja: '+ 新規', en: '+ New' }, lang)}</button>
          <button onClick={handleSave} disabled={saving} style={btnPrimary(saving)}>
            {saving ? t({ ja: '保存中', en: 'Saving' }, lang) : t({ ja: '💾 保存', en: '💾 Save' }, lang)}
          </button>
          <button onClick={handlePlay} disabled={!abcjsReady} style={btnSecondary()}>
            {playing ? t({ ja: '⏸ 停止', en: '⏸ Stop' }, lang) : t({ ja: '▶ 再生', en: '▶ Play' }, lang)}
          </button>
          <ScanButton onScan={handleScan} scanning={scanning} lang={lang} />
          <button onClick={handleDownloadPDF} style={btnSecondary()}>{t({ ja: '📄 PDF', en: '📄 PDF' }, lang)}</button>
          <button onClick={handleDownloadMIDI} disabled={!abcjsReady} style={btnSecondary()}>{t({ ja: '🎹 MIDI', en: '🎹 MIDI' }, lang)}</button>
          <button onClick={handleDownloadABC} style={btnSecondary()}>{t({ ja: '📝 ABC', en: '📝 ABC' }, lang)}</button>
          <select value={lyricsLang} onChange={(e) => setLyricsLang(e.target.value as LyricsLang)} style={{ ...btnSecondary(), padding: '0.5rem 0.7rem' }}>
            <option value="ja">{t({ ja: '歌詞: 日本語', en: 'Lyrics: JA' }, lang)}</option>
            <option value="en">{t({ ja: '歌詞: 英語', en: 'Lyrics: EN' }, lang)}</option>
            <option value="es">{t({ ja: '歌詞: スペイン語', en: 'Lyrics: ES' }, lang)}</option>
            <option value="de">{t({ ja: '歌詞: ドイツ語', en: 'Lyrics: DE' }, lang)}</option>
          </select>
        </div>

        {/* スタイルロード */}
        <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {t({ ja: 'サンプル例:', en: 'Style example:' }, lang)}
          </span>
          <button onClick={() => handleLoadSample('pop')} style={btnTiny()}>{t({ ja: 'ポップス', en: 'Pop' }, lang)}</button>
          <button onClick={() => handleLoadSample('jazz')} style={btnTiny()}>{t({ ja: 'ジャズ', en: 'Jazz' }, lang)}</button>
          <button onClick={() => handleLoadSample('folk')} style={btnTiny()}>{t({ ja: 'フォーク', en: 'Folk' }, lang)}</button>
          <button onClick={() => handleLoadSample('ballad')} style={btnTiny()}>{t({ ja: 'バラード', en: 'Ballad' }, lang)}</button>
        </div>

        {errorMsg && (
          <div style={{ marginTop: '0.8rem', padding: '0.7rem 1rem', background: '#f8e6e0', color: '#7a2f1c', fontFamily: sans, fontSize: '0.85rem', borderRadius: 2 }}>{errorMsg}</div>
        )}
        {successMsg && (
          <div style={{ marginTop: '0.8rem', padding: '0.7rem 1rem', background: '#e6f0e0', color: '#2d5a1e', fontFamily: sans, fontSize: '0.85rem', borderRadius: 2 }}>{successMsg}</div>
        )}
      </section>

      {/* TITLE */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem clamp(1.5rem, 4vw, 3rem) 0' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t({ ja: '曲のタイトル', en: 'Song title' }, lang)}
          style={{
            width: '100%', padding: '0.6rem 0.8rem',
            fontFamily: serif, fontSize: '1.2rem',
            color: INK, background: 'transparent',
            border: 'none', borderBottom: `1px solid ${RULE}`,
            outline: 'none', letterSpacing: '0.02em',
          }}
        />
      </section>

      {/* QUICK INSERT PALETTE */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem clamp(1.5rem, 4vw, 3rem) 0' }}>
        <details open style={{ background: PAPER_DEEP, borderRadius: 3, padding: '0.9rem 1rem', border: `1px solid ${RULE}` }}>
          <summary style={{ cursor: 'pointer', fontFamily: serif, fontSize: '0.95rem', color: INK }}>
            ⚡ {t({ ja: 'クイック挿入 — クリックでカーソル位置に追加', en: 'Quick insert — click to add at cursor' }, lang)}
          </summary>

          <div style={{ marginTop: '0.8rem' }}>
            <Label>{t({ ja: 'コード', en: 'Chords' }, lang)}</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {POPULAR_CHORDS.map((ch) => (
                <button key={ch} onClick={() => insertAtCursor(`"${ch}"c2 `)} style={chordChip()}>
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '0.8rem' }}>
            <Label>{t({ ja: '譜面構造', en: 'Structure' }, lang)}</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              <button onClick={() => insertAtCursor(' | ')} style={btnTiny()}>| {t({ ja: '小節線', en: 'bar' }, lang)}</button>
              <button onClick={() => insertAtCursor(' |] ')} style={btnTiny()}>|] {t({ ja: '終止線', en: 'final' }, lang)}</button>
              <button onClick={() => insertAtCursor(' |: ')} style={btnTiny()}>|: {t({ ja: '反復開始', en: 'repeat start' }, lang)}</button>
              <button onClick={() => insertAtCursor(' :| ')} style={btnTiny()}>:| {t({ ja: '反復終了', en: 'repeat end' }, lang)}</button>
              <button onClick={() => insertAtCursor('\nw: ')} style={btnTiny()}>w: {t({ ja: '歌詞行', en: 'lyric line' }, lang)}</button>
              <button onClick={() => insertAtCursor('\n')} style={btnTiny()}>↵ {t({ ja: '改行', en: 'newline' }, lang)}</button>
            </div>
          </div>

          <div style={{ marginTop: '0.8rem' }}>
            <Label>{t({ ja: '音符 (中音域)', en: 'Notes (middle)' }, lang)}</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {['c', 'd', 'e', 'f', 'g', 'a', 'b'].map((n) => (
                <button key={n} onClick={() => insertAtCursor(`${n} `)} style={noteChip()}>{n}</button>
              ))}
              <button onClick={() => insertAtCursor('z ')} style={noteChip()}>z {t({ ja: '休符', en: 'rest' }, lang)}</button>
            </div>
          </div>

          <div style={{ marginTop: '0.8rem' }}>
            <Label>{t({ ja: '音価 (前の音符の後ろに付ける)', en: 'Durations' }, lang)}</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              <button onClick={() => insertAtCursor('2')} style={btnTiny()}>×2 {t({ ja: '二分', en: 'half' }, lang)}</button>
              <button onClick={() => insertAtCursor('4')} style={btnTiny()}>×4 {t({ ja: '全', en: 'whole' }, lang)}</button>
              <button onClick={() => insertAtCursor('/2')} style={btnTiny()}>÷2 {t({ ja: '八分', en: '8th' }, lang)}</button>
              <button onClick={() => insertAtCursor('/4')} style={btnTiny()}>÷4 {t({ ja: '十六分', en: '16th' }, lang)}</button>
              <button onClick={() => insertAtCursor('.')} style={btnTiny()}>. {t({ ja: '付点', en: 'dotted' }, lang)}</button>
            </div>
          </div>
        </details>
      </section>

      {/* MAIN: Editor + Preview */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem clamp(1.5rem, 4vw, 3rem) 2rem' }}>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
          <div>
            <Label>{t({ ja: 'ABC エディタ (テキスト編集)', en: 'ABC Editor (text)' }, lang)}</Label>
            <textarea
              ref={textareaRef}
              value={abc}
              onChange={(e) => setAbc(e.target.value)}
              spellCheck={false}
              rows={22}
              style={{
                width: '100%', padding: '1rem',
                fontFamily: mono, fontSize: '0.85rem', lineHeight: 1.7,
                color: INK, background: PAPER_DEEP,
                border: `1px solid ${RULE}`, borderRadius: 2,
                outline: 'none', resize: 'vertical',
              }}
            />
          </div>

          <div>
            <Label>{t({ ja: 'プレビュー — クリックで編集', en: 'Preview — click to edit' }, lang)}</Label>
            <div
              ref={renderRef}
              style={{
                width: '100%', minHeight: 460,
                padding: '1rem',
                background: '#ffffff',
                border: `1px solid ${RULE}`, borderRadius: 2,
                overflow: 'auto', cursor: 'pointer',
              }}
            >
              {!abcjsReady && (
                <p style={{ fontFamily: sans, fontSize: '0.82rem', color: INK_FAINT }}>
                  {t({ ja: '譜面エンジンを読み込み中...', en: 'Loading score engine...' }, lang)}
                </p>
              )}
            </div>
            <p style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, marginTop: '0.5rem', lineHeight: 1.7 }}>
              {t(
                {
                  ja: '🎼 コードや歌詞をクリックすると入力ダイアログが開きます。音符をクリックすると + (上行) / - (下降) / 8 (オクターブ上) / 9 (オクターブ下) / d (削除) で編集できます。',
                  en: '🎼 Click chords or lyrics to edit them. Click a note for + / - / 8 (oct up) / 9 (oct down) / d (delete).',
                },
                lang,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* SAVED SHEETS */}
      {sheets.length > 0 && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)', borderTop: `1px solid ${RULE}` }}>
          <h2 style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 400, margin: '0 0 1rem' }}>
            {t({ ja: '保存した譜面', en: 'Saved sheets' }, lang)} ({sheets.length})
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
            {sheets.map((s) => (
              <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: currentId === s.id ? HIGHLIGHT : PAPER_DEEP, border: `1px solid ${RULE}`, borderRadius: 2 }}>
                <button onClick={() => handleLoad(s.id)} style={{ flex: 1, textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: serif, fontSize: '0.95rem', color: INK }}>
                  {s.title}
                  <span style={{ fontFamily: sans, fontSize: '0.7rem', color: INK_FAINT, marginLeft: '0.7rem' }}>
                    {new Date(s.updatedAt).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US')}
                  </span>
                </button>
                <button onClick={() => handleDelete(s.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: sans, fontSize: '0.78rem', color: '#a05a4a' }}>
                  {t({ ja: '削除', en: 'Delete' }, lang)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function ScanButton({ onScan, scanning, lang }: { onScan: (file: File) => void; scanning: boolean; lang: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onScan(f);
          if (e.target) e.target.value = '';
        }}
        style={{ display: 'none' }}
      />
      <button onClick={() => inputRef.current?.click()} disabled={scanning} style={btnAccent(scanning)}>
        {scanning ? t({ ja: 'スキャン中', en: 'Scanning' }, lang) : t({ ja: '📷 画像スキャン', en: '📷 Scan image' }, lang)}
      </button>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: sans, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: '0.4rem' }}>
      {children}
    </div>
  );
}

function btnPrimary(disabled?: boolean): React.CSSProperties {
  return {
    padding: '0.5rem 1.1rem',
    background: disabled ? INK_FAINT : INK,
    color: PAPER,
    border: 'none', borderRadius: 2,
    fontFamily: serif, fontSize: '0.85rem',
    letterSpacing: '0.04em',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

function btnSecondary(): React.CSSProperties {
  return {
    padding: '0.5rem 0.9rem',
    background: 'transparent',
    color: INK,
    border: `1px solid ${RULE}`, borderRadius: 2,
    fontFamily: serif, fontSize: '0.85rem',
    cursor: 'pointer',
  };
}

function btnAccent(disabled?: boolean): React.CSSProperties {
  return {
    padding: '0.5rem 1.1rem',
    background: disabled ? '#9eb1c2' : ACCENT,
    color: PAPER,
    border: 'none', borderRadius: 2,
    fontFamily: serif, fontSize: '0.85rem',
    letterSpacing: '0.04em',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

function btnTiny(): React.CSSProperties {
  return {
    padding: '0.32rem 0.65rem',
    background: PAPER,
    color: INK,
    border: `1px solid ${RULE}`, borderRadius: 2,
    fontFamily: sans, fontSize: '0.75rem',
    cursor: 'pointer',
  };
}

function chordChip(): React.CSSProperties {
  return {
    padding: '0.32rem 0.7rem',
    background: CHORD_BG,
    color: ACCENT,
    border: `1px solid ${ACCENT}`, borderRadius: 2,
    fontFamily: serif, fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  };
}

function noteChip(): React.CSSProperties {
  return {
    padding: '0.32rem 0.7rem',
    background: PAPER,
    color: INK,
    border: `1px solid ${RULE}`, borderRadius: 2,
    fontFamily: mono, fontSize: '0.85rem',
    cursor: 'pointer',
  };
}

function codeStyle(): React.CSSProperties {
  return {
    fontFamily: mono,
    fontSize: '0.78rem',
    background: PAPER,
    padding: '0.1rem 0.4rem',
    borderRadius: 2,
    color: ACCENT,
  };
}
