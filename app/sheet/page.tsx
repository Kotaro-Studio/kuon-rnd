'use client';

/**
 * KUON SHEET — リードシートエディタ
 *
 * ブラウザ完結のリードシート (メロディ + コードネーム + 歌詞) エディタ。
 *
 * 機能:
 *   - ABC notation テキストエディタ + abcjs ライブプレビュー
 *   - Tone.js 風 (abcjs 内蔵 synth) で MIDI 再生
 *   - 画像スキャン (手書き/印刷リードシート → ABC 自動変換) [Concerto+]
 *   - クラウド保存 (Free 10 譜面まで・Concerto+ 無制限)
 *   - PDF / SVG / MIDI ダウンロード
 *
 * abcjs は CDN から動的ロード (Cloudflare Pages のバンドルサイズを抑える)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/AuthGate';
import { useLang } from '@/context/LangContext';

// ─── §48 余白の知性 + 現代的編集ツール用パレット ───
const PAPER = '#fbfaf6';
const PAPER_DEEP = '#f0ece1';
const INK = '#1a1a1a';
const INK_SOFT = '#3a3a3a';
const INK_FAINT = '#7a7575';
const ACCENT = '#3a5f7a';   // ペン色
const ACCENT_SOFT = '#6b8aa3';
const RULE = '#d8d2c2';
const HIGHLIGHT = '#fdf6e8';

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

// ─── サンプル ABC (新規譜面のスタート点) ───
const SAMPLE_ABC = `X:1
T:My New Song
C:
M:4/4
L:1/4
Q:1/4=120
K:C
"C"c2 "Am"e2 | "F"f2 "G7"g2 | "C"c2 "Am"a2 | "G7"g2 "C"c2 |
w: La la la la la la la la la la la la la la la la
"F"f2 "C"c2 | "Dm"d2 "G7"g2 | "C"c4 |]
w: La la la la la la la la la la la la la
`;

const t = <T extends Record<string, string>>(map: T, lang: string): string => {
  const k = lang as keyof T;
  return (map[k] as string) || (map['ja'] as string) || (map['en'] as string) || '';
};

// abcjs の型 (CDN 動的ロード)
declare global {
  interface Window {
    ABCJS?: any;
  }
}

// ──────────────────────────────────────────────────────────────────────────
export default function SheetPage() {
  return (
    <AuthGate appName="sheet" strict={false}>
      <SheetEditor />
    </AuthGate>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function SheetEditor() {
  const { lang } = useLang();

  // 譜面データ
  const [abc, setAbc] = useState<string>(SAMPLE_ABC);
  const [title, setTitle] = useState<string>('My New Song');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [lyricsLang, setLyricsLang] = useState<LyricsLang>('ja');

  // UI 状態
  const [abcjsReady, setAbcjsReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [sheets, setSheets] = useState<SheetMeta[]>([]);
  const [playing, setPlaying] = useState(false);

  const renderRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ── abcjs を CDN から動的ロード ──
  useEffect(() => {
    if (window.ABCJS) {
      setAbcjsReady(true);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/abcjs@6.4.4/dist/abcjs-basic-min.min.js';
    s.async = true;
    s.onload = () => setAbcjsReady(true);
    s.onerror = () => setErrorMsg(t({ ja: 'abcjs ライブラリのロードに失敗しました', en: 'Failed to load abcjs library' }, lang));
    document.body.appendChild(s);
    return () => {
      // CSP 安全のため remove はしない
    };
  }, [lang]);

  // ── ABC を解析してプレビューにレンダリング ──
  useEffect(() => {
    if (!abcjsReady || !renderRef.current || !window.ABCJS) return;
    try {
      window.ABCJS.renderAbc(renderRef.current, abc, {
        responsive: 'resize',
        add_classes: true,
        staffwidth: 760,
      });
    } catch (e) {
      // 無効な ABC でも UI を壊さない
      console.warn('abcjs render error', e);
    }
  }, [abc, abcjsReady]);

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
  }, [successMsg]); // 保存成功時に再読み込み

  // ── 自動メッセージ消去 ──
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      // タイトルを ABC から抽出
      const titleMatch = data.abc.match(/^T:\s*(.+)$/m);
      if (titleMatch) setTitle(titleMatch[1].trim());
      setCurrentId(null); // スキャン直後は新規扱い
      setSuccessMsg(
        t(
          {
            ja: `スキャン完了 (信頼度: ${data.confidence}). エディタで校正してください。`,
            en: `Scan complete (confidence: ${data.confidence}). Please review in the editor.`,
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
      setErrorMsg(t({ ja: 'タイトルと譜面が必要です', en: 'Title and ABC are required' }, lang));
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
          setErrorMsg(data.message || t({ ja: 'Free プラン上限に達しました', en: 'Free plan limit reached' }, lang));
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

  // ── 譜面ロード ──
  const handleLoad = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('kuon_token');
      const res = await fetch(`/api/sheet/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Load failed');
        return;
      }
      setAbc(data.sheet.abc);
      setTitle(data.sheet.title);
      setLyricsLang(data.sheet.lyricsLang);
      setCurrentId(data.sheet.id);
      setSuccessMsg(t({ ja: '読み込みました', en: 'Loaded' }, lang));
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    }
  }, [lang]);

  // ── 削除 ──
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
          setAbc(SAMPLE_ABC);
          setTitle('My New Song');
          setCurrentId(null);
        }
        setSuccessMsg(t({ ja: '削除しました', en: 'Deleted' }, lang));
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    }
  }, [currentId, lang]);

  // ── 新規 ──
  const handleNew = useCallback(() => {
    setAbc(SAMPLE_ABC);
    setTitle('My New Song');
    setCurrentId(null);
    setSuccessMsg(t({ ja: '新しい譜面', en: 'New sheet' }, lang));
  }, [lang]);

  // ── 再生 / 停止 ──
  const handlePlay = useCallback(async () => {
    if (!abcjsReady || !window.ABCJS) return;
    if (playing && synthRef.current) {
      synthRef.current.stop();
      setPlaying(false);
      return;
    }
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const visualObj = window.ABCJS.renderAbc('*', abc, {})[0];
      const synth = new window.ABCJS.synth.CreateSynth();
      await synth.init({ audioContext: audioCtxRef.current, visualObj });
      await synth.prime();
      synth.start();
      synthRef.current = synth;
      setPlaying(true);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Playback failed');
    }
  }, [abc, abcjsReady, playing]);

  // ── 再生停止クリーンアップ ──
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        try {
          synthRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // ── PDF / SVG ダウンロード ──
  const handleDownloadPDF = useCallback(() => {
    if (!renderRef.current) return;
    const svg = renderRef.current.querySelector('svg');
    if (!svg) {
      setErrorMsg('SVG not ready');
      return;
    }
    // 簡易 PDF: SVG をブラウザの印刷ダイアログ経由で PDF に
    const win = window.open('', '_blank');
    if (!win) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    win.document.write(`<!DOCTYPE html>
<html><head><title>${title} — KUON SHEET</title>
<style>body{margin:24px;font-family:${serif};} h1{font-size:1.4rem;font-weight:400;margin:0 0 1rem;}</style>
</head><body>
<h1>${title}</h1>
${svgData}
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
    if (!abcjsReady || !window.ABCJS) return;
    try {
      const visualObj = window.ABCJS.renderAbc('*', abc, {})[0];
      const midi = window.ABCJS.synth.getMidiFile(visualObj, { generateInline: false });
      // midi は Uint8Array
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
  }, [abc, abcjsReady, title]);

  // ──────────────────────────────────────────────────────────────────────
  return (
    <main style={{ background: PAPER, minHeight: '100vh', color: INK, fontFamily: serif }}>
      {/* HEADER */}
      <section style={{ padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) 1rem', borderBottom: `1px solid ${RULE}`, maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', margin: 0, fontWeight: 400, letterSpacing: '0.04em' }}>
            {t({ ja: 'リードシート、思いついたままに。', en: 'Lead sheets, as they come to you.' }, lang)}
          </h1>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link href="/sheet-lp" style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, textDecoration: 'none', padding: '0.5rem 0.9rem', border: `1px solid ${RULE}`, borderRadius: 2 }}>
              {t({ ja: '使い方', en: 'How it works' }, lang)}
            </Link>
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem clamp(1.5rem, 4vw, 3rem) 0' }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={handleNew} style={btnSecondary()}>{t({ ja: '+ 新規', en: '+ New' }, lang)}</button>
          <button onClick={handleSave} disabled={saving} style={btnPrimary(saving)}>
            {saving ? t({ ja: '保存中...', en: 'Saving...' }, lang) : t({ ja: '💾 保存', en: '💾 Save' }, lang)}
          </button>
          <button onClick={handlePlay} disabled={!abcjsReady} style={btnSecondary()}>
            {playing ? t({ ja: '⏸ 停止', en: '⏸ Stop' }, lang) : t({ ja: '▶ 再生', en: '▶ Play' }, lang)}
          </button>
          <ScanButton onScan={handleScan} scanning={scanning} lang={lang} />
          <button onClick={handleDownloadPDF} style={btnSecondary()}>{t({ ja: '📄 PDF', en: '📄 PDF' }, lang)}</button>
          <button onClick={handleDownloadMIDI} disabled={!abcjsReady} style={btnSecondary()}>{t({ ja: '🎹 MIDI', en: '🎹 MIDI' }, lang)}</button>
          <button onClick={handleDownloadABC} style={btnSecondary()}>{t({ ja: '📝 ABC', en: '📝 ABC' }, lang)}</button>
          <select value={lyricsLang} onChange={(e) => setLyricsLang(e.target.value as LyricsLang)} style={{ ...btnSecondary(), padding: '0.5rem 0.8rem' }}>
            <option value="ja">{t({ ja: '歌詞: 日本語', en: 'Lyrics: Japanese' }, lang)}</option>
            <option value="en">{t({ ja: '歌詞: 英語', en: 'Lyrics: English' }, lang)}</option>
            <option value="es">{t({ ja: '歌詞: スペイン語', en: 'Lyrics: Spanish' }, lang)}</option>
            <option value="de">{t({ ja: '歌詞: ドイツ語', en: 'Lyrics: German' }, lang)}</option>
          </select>
        </div>

        {/* メッセージ */}
        {errorMsg && (
          <div style={{ marginTop: '0.8rem', padding: '0.7rem 1rem', background: '#f8e6e0', color: '#7a2f1c', fontFamily: sans, fontSize: '0.85rem', borderRadius: 2 }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ marginTop: '0.8rem', padding: '0.7rem 1rem', background: '#e6f0e0', color: '#2d5a1e', fontFamily: sans, fontSize: '0.85rem', borderRadius: 2 }}>
            {successMsg}
          </div>
        )}
      </section>

      {/* TITLE INPUT */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem clamp(1.5rem, 4vw, 3rem)' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t({ ja: '曲のタイトル', en: 'Song title' }, lang)}
          style={{
            width: '100%', padding: '0.7rem 0.9rem',
            fontFamily: serif, fontSize: '1.25rem',
            color: INK, background: 'transparent',
            border: 'none', borderBottom: `1px solid ${RULE}`,
            outline: 'none', letterSpacing: '0.02em',
          }}
        />
      </section>

      {/* MAIN: Editor + Preview */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem clamp(1.5rem, 4vw, 3rem) 2rem' }}>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
          {/* ABC エディタ */}
          <div>
            <Label>{t({ ja: 'ABC エディタ', en: 'ABC Editor' }, lang)}</Label>
            <textarea
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
            <p style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, marginTop: '0.5rem', lineHeight: 1.7 }}>
              {t(
                {
                  ja: 'ABC notation 形式。c d e f g a b (低オクターブは大文字)、"Cmaj7"c でコード、w: で歌詞行。',
                  en: 'ABC notation. c d e f g a b (uppercase = lower octave), "Cmaj7"c for chords, w: for lyrics line.',
                },
                lang,
              )}
              {' '}
              <a href="https://abcnotation.com/wiki/abc:standard:v2.1" target="_blank" rel="noreferrer" style={{ color: ACCENT }}>
                ABC 仕様書 →
              </a>
            </p>
          </div>

          {/* プレビュー */}
          <div>
            <Label>{t({ ja: 'プレビュー (ライブ)', en: 'Preview (live)' }, lang)}</Label>
            <div
              ref={renderRef}
              style={{
                width: '100%', minHeight: 460,
                padding: '1rem',
                background: '#ffffff',
                border: `1px solid ${RULE}`, borderRadius: 2,
                overflow: 'auto',
              }}
            >
              {!abcjsReady && (
                <p style={{ fontFamily: sans, fontSize: '0.82rem', color: INK_FAINT }}>
                  {t({ ja: '譜面エンジンを読み込み中...', en: 'Loading score engine...' }, lang)}
                </p>
              )}
            </div>
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
          if (e.target) e.target.value = ''; // 同じファイル再選択を許可
        }}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={scanning}
        style={btnAccent(scanning)}
      >
        {scanning
          ? t({ ja: 'スキャン中...', en: 'Scanning...' }, lang)
          : t({ ja: '📷 画像スキャン', en: '📷 Scan image' }, lang)}
      </button>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// UI Helpers
// ──────────────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: sans, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: '0.5rem' }}>
      {children}
    </div>
  );
}

function btnPrimary(disabled?: boolean): React.CSSProperties {
  return {
    padding: '0.55rem 1.2rem',
    background: disabled ? INK_FAINT : INK,
    color: PAPER,
    border: 'none',
    borderRadius: 2,
    fontFamily: serif,
    fontSize: '0.88rem',
    letterSpacing: '0.04em',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

function btnSecondary(): React.CSSProperties {
  return {
    padding: '0.55rem 1rem',
    background: 'transparent',
    color: INK,
    border: `1px solid ${RULE}`,
    borderRadius: 2,
    fontFamily: serif,
    fontSize: '0.88rem',
    cursor: 'pointer',
  };
}

function btnAccent(disabled?: boolean): React.CSSProperties {
  return {
    padding: '0.55rem 1.2rem',
    background: disabled ? '#9eb1c2' : ACCENT,
    color: PAPER,
    border: 'none',
    borderRadius: 2,
    fontFamily: serif,
    fontSize: '0.88rem',
    letterSpacing: '0.04em',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
