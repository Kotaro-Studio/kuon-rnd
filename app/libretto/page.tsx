'use client';

/**
 * KUON LIBRETTO TRANSLATOR — メインアプリ
 *
 * 機能:
 *   - 6 つのサンプルアリアから選択 → 即座に対訳表示 (Mozart 3 / Verdi 1 / Puccini 1 / Bizet 1)
 *   - 任意のリブレットテキストを貼り付け → AI 翻訳
 *   - 5 段並列表示: 原文 / IPA / 直訳 / 歌唱訳 / 文学訳
 *   - 行ごとに「この行を解釈する」→ AI 解釈チャット
 *   - 会話履歴 (最大 50 件)
 *
 * Concerto 以上限定。Free / Prelude は LP 経由でアップグレード誘導。
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AuthGate from '@/components/AuthGate';
import { useLang } from '@/context/LangContext';
import { SAMPLE_ARIAS, type SampleAria, type SampleAriaLine } from '@/app/lib/libretto-catalog';

// ─── 余白の知性 (§48) スタイルトークン ───
const PAPER = '#fbf8f1';
const PAPER_DEEP = '#f3eee0';
const INK = '#1a1a1a';
const INK_SOFT = '#3a3a3a';
const INK_FAINT = '#7a7575';
const ACCENT = '#7a4d2c'; // オペラの幕の色
const ACCENT_SOFT = '#a86b3e';
const RULE = '#d8d2c2';

const serif = '"Shippori Mincho", "Noto Serif JP", "Times New Roman", serif';
const sans = '"Helvetica Neue", "Inter", "Hiragino Sans", system-ui, sans-serif';

// ─── 翻訳結果の型 ───
interface TranslateLine {
  num: number;
  source: string;
  ipa: string;
  literal: string;
  singing: string;
  literary: string;
  notes?: string[];
}

interface TranslateResult {
  ariaTitle?: string;
  composer?: string;
  opera?: string;
  character?: string;
  sourceLang: 'it' | 'de' | 'fr';
  targetLang: 'ja' | 'en';
  lines: TranslateLine[];
  citations?: Array<{ source: string; snippet: string; score: number }>;
}

interface ExplainResult {
  question: string;
  answer: string;
  citations: Array<{ source: string; snippet: string; score: number }>;
}

const t = <T extends Record<string, string>>(map: T, lang: string): string => {
  const k = lang as keyof T;
  return (map[k] as string) || (map['ja'] as string) || (map['en'] as string) || '';
};

// ──────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────
export default function LibrettoPage() {
  return (
    <AuthGate appName="libretto">
      <LibrettoApp />
    </AuthGate>
  );
}

function LibrettoApp() {
  const { lang } = useLang();

  // 翻訳の状態
  const [mode, setMode] = useState<'sample' | 'paste'>('sample');
  const [selectedAriaId, setSelectedAriaId] = useState<string>(SAMPLE_ARIAS[0].id);
  const [pasteText, setPasteText] = useState<string>('');
  const [pasteLang, setPasteLang] = useState<'it' | 'de' | 'fr'>('it');
  const [pasteOpera, setPasteOpera] = useState<string>('');
  const [pasteAriaTitle, setPasteAriaTitle] = useState<string>('');
  const [pasteCharacter, setPasteCharacter] = useState<string>('');
  const [targetLang, setTargetLang] = useState<'ja' | 'en'>(lang === 'en' ? 'en' : 'ja');

  const [result, setResult] = useState<TranslateResult | null>(null);
  const [translating, setTranslating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 解釈チャットの状態
  const [explainOpen, setExplainOpen] = useState<{ lineNum: number; lineText: string } | null>(null);
  const [explainQuestion, setExplainQuestion] = useState('');
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null);
  const [explaining, setExplaining] = useState(false);

  // 会話履歴
  const [conversations, setConversations] = useState<Array<{ id: string; title: string; updatedAt: string; turnCount: number }>>([]);

  // サンプルアリアを選択時、即時に表示用データを生成 (AI 呼ばずカタログから直接)
  const selectedAria: SampleAria | undefined = useMemo(
    () => SAMPLE_ARIAS.find((a) => a.id === selectedAriaId),
    [selectedAriaId],
  );

  const sampleResult: TranslateResult | null = useMemo(() => {
    if (mode !== 'sample' || !selectedAria) return null;
    return {
      ariaTitle: selectedAria.title,
      composer: selectedAria.composer,
      opera: selectedAria.opera,
      character: selectedAria.character,
      sourceLang: selectedAria.language,
      targetLang,
      lines: selectedAria.lines.map<TranslateLine>((ln: SampleAriaLine) => ({
        num: ln.num,
        source: ln.source,
        ipa: ln.ipa,
        literal: targetLang === 'ja' ? ln.literalJa : ln.literalEn,
        singing: targetLang === 'ja' ? ln.singingJa : ln.singingEn,
        literary: targetLang === 'ja' ? ln.literaryJa : ln.literaryEn,
        notes: ln.notes,
      })),
    };
  }, [mode, selectedAria, targetLang]);

  const displayResult = mode === 'sample' ? sampleResult : result;

  // ── 会話履歴ロード ──
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kuon_token') : null;
    if (!token) return;
    fetch('/api/libretto/conversations', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
      })
      .catch(() => {});
  }, []);

  // ── 翻訳実行 (paste モードのみ) ──
  async function handleTranslate() {
    if (translating) return;
    if (!pasteText.trim()) {
      setErrorMsg(t({ ja: 'リブレットを入力してください', en: 'Please enter libretto text' }, lang));
      return;
    }
    setTranslating(true);
    setErrorMsg('');
    setResult(null);
    try {
      const token = localStorage.getItem('kuon_token');
      const res = await fetch('/api/libretto/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: pasteText,
          sourceLang: pasteLang,
          targetLang,
          ariaContext: {
            opera: pasteOpera || undefined,
            title: pasteAriaTitle || undefined,
            character: pasteCharacter || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setErrorMsg(
            t(
              {
                ja: `今月のクォータを使い切りました (${data.used}/${data.quota})。プランをアップグレードしてください。`,
                en: `Monthly quota exceeded (${data.used}/${data.quota}). Please upgrade.`,
              },
              lang,
            ),
          );
        } else {
          setErrorMsg(data.error || data.message || 'Translate failed');
        }
        return;
      }
      setResult(data);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setTranslating(false);
    }
  }

  // ── 行解釈 ──
  async function handleExplain() {
    if (!explainOpen || !explainQuestion.trim() || explaining) return;
    setExplaining(true);
    setExplainResult(null);
    try {
      const token = localStorage.getItem('kuon_token');
      const ctx = mode === 'sample' && selectedAria
        ? {
            opera: selectedAria.opera,
            title: selectedAria.title,
            character: selectedAria.character,
            voiceType: selectedAria.voiceType,
            composer: selectedAria.composer,
          }
        : {
            opera: pasteOpera || undefined,
            title: pasteAriaTitle || undefined,
            character: pasteCharacter || undefined,
          };

      const res = await fetch('/api/libretto/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: explainQuestion,
          lineText: explainOpen.lineText,
          ariaContext: ctx,
          targetLang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setExplainResult({
            question: explainQuestion,
            answer:
              t(
                {
                  ja: `今月のクォータを使い切りました (${data.used}/${data.quota})。プランをアップグレードしてください。`,
                  en: `Monthly quota exceeded (${data.used}/${data.quota}). Please upgrade.`,
                },
                lang,
              ),
            citations: [],
          });
        } else {
          setExplainResult({
            question: explainQuestion,
            answer: data.error || data.message || 'Explain failed',
            citations: [],
          });
        }
        return;
      }
      setExplainResult(data);
    } catch (e) {
      setExplainResult({
        question: explainQuestion,
        answer: e instanceof Error ? e.message : 'Network error',
        citations: [],
      });
    } finally {
      setExplaining(false);
    }
  }

  return (
    <main style={{ background: PAPER, minHeight: '100vh', color: INK, fontFamily: serif }}>
      {/* ── HEADER ── */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem) 1.5rem', borderBottom: `1px solid ${RULE}`, maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', margin: 0, fontWeight: 400, letterSpacing: '0.04em' }}>
            {t({ ja: 'オペラリブレット、5 段で読む。', en: 'Opera libretti — read in five layers.' }, lang)}
          </h1>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <Link
              href="/libretto-lp"
              style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, textDecoration: 'none', padding: '0.5rem 0.9rem', border: `1px solid ${RULE}`, borderRadius: 2 }}
            >
              {t({ ja: '使い方を読む', en: 'How it works' }, lang)}
            </Link>
          </div>
        </div>
        <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: '1rem 0 0', lineHeight: 1.85 }}>
          {t(
            {
              ja: '伊・独・仏のオペラリブレットを、原文 / IPA / 直訳 / 歌唱訳 / 文学訳の 5 段並列で表示。Mozart 3 / Verdi 1 / Puccini 1 / Bizet 1 のサンプル収録。任意のリブレットも貼り付けて翻訳可能。',
              en: 'Italian/German/French opera libretti in 5-layer parallel: source / IPA / literal / singing / literary. Sample arias: Mozart 3 / Verdi 1 / Puccini 1 / Bizet 1. Paste any libretto for AI translation.',
            },
            lang,
          )}
        </p>
      </section>

      {/* ── MODE TABS ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(1.5rem, 3vw, 2rem) clamp(1.5rem, 4vw, 3rem) 0' }}>
        <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${RULE}` }}>
          <ModeTab active={mode === 'sample'} onClick={() => setMode('sample')}>
            {t({ ja: 'サンプル・アリアから選ぶ', en: 'Sample arias' }, lang)}
          </ModeTab>
          <ModeTab active={mode === 'paste'} onClick={() => setMode('paste')}>
            {t({ ja: 'リブレットを貼り付ける', en: 'Paste your own' }, lang)}
          </ModeTab>
        </div>
      </section>

      {/* ── SAMPLE MODE ── */}
      {mode === 'sample' && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(1.5rem, 3vw, 2rem) clamp(1.5rem, 4vw, 3rem)' }}>
          <div style={{ display: 'grid', gap: '0.6rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {SAMPLE_ARIAS.map((aria) => (
              <button
                key={aria.id}
                onClick={() => setSelectedAriaId(aria.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.9rem 1rem',
                  background: selectedAriaId === aria.id ? INK : PAPER_DEEP,
                  color: selectedAriaId === aria.id ? PAPER : INK,
                  border: `1px solid ${selectedAriaId === aria.id ? INK : RULE}`,
                  borderRadius: 3,
                  fontFamily: serif,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '0.72rem', fontFamily: sans, color: selectedAriaId === aria.id ? '#cbcab9' : INK_FAINT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {aria.composer.split(' ').slice(-1)[0]} · {aria.opera}
                </div>
                <div style={{ fontSize: '0.95rem', marginTop: '0.3rem', fontStyle: 'italic' }}>
                  {aria.title}
                </div>
                <div style={{ fontSize: '0.72rem', fontFamily: sans, color: selectedAriaId === aria.id ? '#cbcab9' : INK_FAINT, marginTop: '0.4rem' }}>
                  {aria.character} ({aria.voiceType}) · {aria.language.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
          {selectedAria && (
            <div style={{ marginTop: '1.5rem', padding: '1rem 1.2rem', background: PAPER_DEEP, borderLeft: `3px solid ${ACCENT}`, fontFamily: sans, fontSize: '0.85rem', lineHeight: 1.85, color: INK_SOFT }}>
              {targetLang === 'ja' ? selectedAria.contextJa : selectedAria.contextEn}
              {selectedAria.imslpUrl && (
                <a href={selectedAria.imslpUrl} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: '0.5rem', color: ACCENT, fontSize: '0.78rem' }}>
                  {t({ ja: 'IMSLP で楽譜を見る →', en: 'View score on IMSLP →' }, lang)}
                </a>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── PASTE MODE ── */}
      {mode === 'paste' && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(1.5rem, 3vw, 2rem) clamp(1.5rem, 4vw, 3rem)' }}>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1rem' }}>
            <Field label={t({ ja: '原文の言語', en: 'Source language' }, lang)}>
              <select
                value={pasteLang}
                onChange={(e) => setPasteLang(e.target.value as any)}
                style={inputStyle()}
              >
                <option value="it">{t({ ja: 'イタリア語', en: 'Italian' }, lang)}</option>
                <option value="de">{t({ ja: 'ドイツ語', en: 'German' }, lang)}</option>
                <option value="fr">{t({ ja: 'フランス語', en: 'French' }, lang)}</option>
              </select>
            </Field>
            <Field label={t({ ja: 'オペラ名 (任意)', en: 'Opera (optional)' }, lang)}>
              <input
                type="text"
                value={pasteOpera}
                onChange={(e) => setPasteOpera(e.target.value)}
                placeholder={t({ ja: '例: Tosca', en: 'e.g. Tosca' }, lang)}
                style={inputStyle()}
              />
            </Field>
            <Field label={t({ ja: 'アリア・場面 (任意)', en: 'Aria/scene (optional)' }, lang)}>
              <input
                type="text"
                value={pasteAriaTitle}
                onChange={(e) => setPasteAriaTitle(e.target.value)}
                placeholder={t({ ja: '例: Vissi d\'arte', en: 'e.g. Vissi d\'arte' }, lang)}
                style={inputStyle()}
              />
            </Field>
            <Field label={t({ ja: '登場人物 (任意)', en: 'Character (optional)' }, lang)}>
              <input
                type="text"
                value={pasteCharacter}
                onChange={(e) => setPasteCharacter(e.target.value)}
                placeholder={t({ ja: '例: Floria Tosca', en: 'e.g. Floria Tosca' }, lang)}
                style={inputStyle()}
              />
            </Field>
          </div>
          <Field label={t({ ja: 'リブレット (1 行 = 1 行で貼り付け、最大 30 行)', en: 'Libretto (one line per row, max 30 lines)' }, lang)}>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={10}
              placeholder={t(
                {
                  ja: 'Vissi d\'arte, vissi d\'amore,\nnon feci mai male ad anima viva!\n...',
                  en: 'Vissi d\'arte, vissi d\'amore,\nnon feci mai male ad anima viva!\n...',
                },
                lang,
              )}
              style={{ ...inputStyle(), fontFamily: serif, fontSize: '0.95rem', lineHeight: 1.85 }}
            />
          </Field>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleTranslate}
              disabled={translating || !pasteText.trim()}
              style={{
                padding: '0.85rem 2rem',
                background: translating ? INK_FAINT : INK,
                color: PAPER,
                border: 'none',
                borderRadius: 2,
                fontFamily: serif,
                fontSize: '0.95rem',
                letterSpacing: '0.08em',
                cursor: translating || !pasteText.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {translating
                ? t({ ja: '翻訳しています...', en: 'Translating...' }, lang)
                : t({ ja: '5 段で翻訳する', en: 'Translate in 5 layers' }, lang)}
            </button>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as any)}
              style={{ ...inputStyle(), maxWidth: 180 }}
            >
              <option value="ja">{t({ ja: '日本語に翻訳', en: 'Translate to Japanese' }, lang)}</option>
              <option value="en">{t({ ja: '英語に翻訳', en: 'Translate to English' }, lang)}</option>
            </select>
          </div>
          {errorMsg && (
            <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: '#f8e6e0', color: '#7a2f1c', fontFamily: sans, fontSize: '0.85rem', borderRadius: 2 }}>
              {errorMsg}
            </div>
          )}
        </section>
      )}

      {/* ── TARGET LANG SWITCHER (sample mode 時のみ右上に表示) ── */}
      {mode === 'sample' && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)', textAlign: 'right' }}>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as any)}
            style={{ ...inputStyle(), maxWidth: 180, display: 'inline-block' }}
          >
            <option value="ja">{t({ ja: '訳: 日本語', en: 'Translation: Japanese' }, lang)}</option>
            <option value="en">{t({ ja: '訳: 英語', en: 'Translation: English' }, lang)}</option>
          </select>
        </section>
      )}

      {/* ── RESULT (5-LAYER PARALLEL DISPLAY) ── */}
      {displayResult && displayResult.lines.length > 0 && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)' }}>
          <h2 style={{ fontFamily: serif, fontSize: '1.4rem', fontWeight: 400, margin: '0 0 1.5rem', borderBottom: `2px solid ${ACCENT}`, paddingBottom: '0.6rem', display: 'inline-block' }}>
            {displayResult.composer && displayResult.opera ? (
              <>
                <span style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }}>
                  {displayResult.composer} · {displayResult.opera}
                </span>
                <span style={{ fontStyle: 'italic' }}>{displayResult.ariaTitle}</span>
              </>
            ) : (
              t({ ja: '翻訳結果', en: 'Translation Result' }, lang)
            )}
          </h2>

          <div style={{ display: 'grid', gap: '1.2rem' }}>
            {displayResult.lines.map((ln) => (
              <LineCard
                key={ln.num}
                line={ln}
                lang={lang}
                onExplain={() => setExplainOpen({ lineNum: ln.num, lineText: ln.source })}
              />
            ))}
          </div>

          {displayResult.citations && displayResult.citations.length > 0 && (
            <div style={{ marginTop: '2rem', padding: '1rem 1.2rem', background: PAPER_DEEP, fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT }}>
              <strong style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {t({ ja: '参照', en: 'References' }, lang)} ({displayResult.citations.length})
              </strong>
              <ul style={{ margin: '0.5rem 0 0', padding: 0, listStyle: 'none' }}>
                {displayResult.citations.slice(0, 5).map((c, i) => (
                  <li key={i} style={{ padding: '0.4rem 0', borderBottom: `1px dotted ${RULE}` }}>
                    [{i + 1}] {c.source} — <em style={{ color: INK_FAINT }}>{c.snippet.slice(0, 100)}...</em>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ── EXPLAIN MODAL ── */}
      {explainOpen && (
        <div
          onClick={() => {
            setExplainOpen(null);
            setExplainResult(null);
            setExplainQuestion('');
          }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 12, 10, 0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: PAPER, padding: 'clamp(1.5rem, 3vw, 2rem)',
              maxWidth: 720, width: '100%', maxHeight: '85vh', overflow: 'auto',
              borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {t({ ja: 'この行を解釈する', en: 'Interpret this line' }, lang)}
            </div>
            <div style={{ fontFamily: serif, fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1.5rem', borderLeft: `3px solid ${ACCENT}`, paddingLeft: '0.8rem' }}>
              {explainOpen.lineText}
            </div>
            <Field label={t({ ja: '質問', en: 'Your question' }, lang)}>
              <textarea
                value={explainQuestion}
                onChange={(e) => setExplainQuestion(e.target.value)}
                rows={3}
                placeholder={t(
                  {
                    ja: '例: この行の和声的意味は? Pavarotti はここでどう歌った? 母音の発音で気をつけることは?',
                    en: 'e.g. What\'s the harmonic meaning here? How did Pavarotti sing this? Vowel modification tips?',
                  },
                  lang,
                )}
                style={{ ...inputStyle(), fontFamily: serif }}
              />
            </Field>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={handleExplain}
                disabled={explaining || !explainQuestion.trim()}
                style={{
                  padding: '0.7rem 1.6rem', background: explaining ? INK_FAINT : INK,
                  color: PAPER, border: 'none', borderRadius: 2,
                  fontFamily: serif, fontSize: '0.9rem', letterSpacing: '0.08em',
                  cursor: explaining || !explainQuestion.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {explaining
                  ? t({ ja: '考えています...', en: 'Thinking...' }, lang)
                  : t({ ja: '質問する', en: 'Ask' }, lang)}
              </button>
              <button
                onClick={() => {
                  setExplainOpen(null);
                  setExplainResult(null);
                  setExplainQuestion('');
                }}
                style={{
                  padding: '0.7rem 1.4rem', background: 'transparent', color: INK_FAINT,
                  border: `1px solid ${RULE}`, borderRadius: 2, fontFamily: serif,
                  fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                {t({ ja: '閉じる', en: 'Close' }, lang)}
              </button>
            </div>

            {explainResult && (
              <div style={{ marginTop: '2rem', borderTop: `1px solid ${RULE}`, paddingTop: '1.5rem' }}>
                <div style={{ fontFamily: serif, fontSize: '0.95rem', lineHeight: 2, color: INK, whiteSpace: 'pre-wrap' }}>
                  {explainResult.answer}
                </div>
                {explainResult.citations.length > 0 && (
                  <div style={{ marginTop: '1.2rem', fontFamily: sans, fontSize: '0.75rem', color: INK_FAINT }}>
                    <strong style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {t({ ja: '参照', en: 'References' }, lang)}
                    </strong>
                    <ul style={{ margin: '0.5rem 0 0', padding: 0, listStyle: 'none' }}>
                      {explainResult.citations.slice(0, 4).map((c, i) => (
                        <li key={i} style={{ padding: '0.3rem 0' }}>
                          [{i + 1}] {c.source}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CONVERSATION HISTORY (footer) ── */}
      {conversations.length > 0 && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)', borderTop: `1px solid ${RULE}` }}>
          <h2 style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 400, margin: '0 0 1rem' }}>
            {t({ ja: '最近の翻訳・解釈', en: 'Recent translations & interpretations' }, lang)}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
            {conversations.slice(0, 10).map((c) => (
              <li key={c.id} style={{ padding: '0.5rem 0', borderBottom: `1px dotted ${RULE}`, fontFamily: sans, fontSize: '0.85rem', color: INK_SOFT, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                <span style={{ color: INK_FAINT, fontSize: '0.72rem', marginLeft: '1rem', whiteSpace: 'nowrap' }}>
                  {new Date(c.updatedAt).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// 5 段並列表示の 1 行カード
// ──────────────────────────────────────────────────────────────────────────
function LineCard({ line, lang, onExplain }: { line: TranslateLine; lang: string; onExplain: () => void }) {
  return (
    <article style={{ padding: '1.2rem 1.4rem', background: PAPER_DEEP, borderLeft: `3px solid ${ACCENT_SOFT}`, borderRadius: 2, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '0.8rem' }}>
        <span style={{ fontFamily: sans, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.1em' }}>
          {String(line.num).padStart(2, '0')}
        </span>
        <button
          onClick={onExplain}
          style={{
            marginLeft: 'auto', fontFamily: sans, fontSize: '0.72rem',
            color: ACCENT, background: 'transparent', border: 'none',
            cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          {t({ ja: 'この行を解釈する →', en: 'Interpret this line →' }, lang)}
        </button>
      </div>

      {/* 5 段 (グリッド or スタック) */}
      <div style={{ display: 'grid', gap: '0.8rem' }}>
        <Layer label={t({ ja: '原文', en: 'Source' }, lang)} value={line.source} accent serif italic />
        <Layer label="IPA" value={line.ipa} mono accent />
        <Layer label={t({ ja: '直訳', en: 'Literal' }, lang)} value={line.literal} />
        <Layer label={t({ ja: '歌唱訳', en: 'Singing' }, lang)} value={line.singing} highlight />
        <Layer label={t({ ja: '文学訳', en: 'Literary' }, lang)} value={line.literary} italic />
      </div>

      {line.notes && line.notes.length > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.7rem 0.9rem', background: PAPER, fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, borderRadius: 2, lineHeight: 1.85 }}>
          <strong style={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT, fontSize: '0.7rem' }}>
            {t({ ja: '注釈', en: 'Notes' }, lang)}
          </strong>
          <ul style={{ margin: '0.4rem 0 0', padding: 0, listStyle: 'none' }}>
            {line.notes.map((n, i) => (
              <li key={i} style={{ padding: '0.2rem 0', position: 'relative', paddingLeft: '1rem' }}>
                <span style={{ position: 'absolute', left: 0, color: ACCENT_SOFT }}>·</span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

function Layer({ label, value, mono, italic, serif: useSerif, highlight, accent }: {
  label: string;
  value: string;
  mono?: boolean;
  italic?: boolean;
  serif?: boolean;
  highlight?: boolean;
  accent?: boolean;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.8rem', alignItems: 'baseline' }}>
      <span style={{
        fontFamily: sans, fontSize: '0.68rem', color: accent ? ACCENT : INK_FAINT,
        letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'right',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? 'ui-monospace, "SF Mono", Consolas, monospace' : useSerif !== false ? serif : sans,
        fontSize: mono ? '0.85rem' : '1.02rem',
        fontStyle: italic ? 'italic' : 'normal',
        lineHeight: 1.7,
        color: highlight ? ACCENT : INK,
        background: highlight ? '#fdf6e8' : 'transparent',
        padding: highlight ? '0.2rem 0.5rem' : 0,
        borderRadius: highlight ? 2 : 0,
        wordBreak: 'break-word',
      }}>
        {value}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// UI Helpers
// ──────────────────────────────────────────────────────────────────────────
function ModeTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.85rem 1.4rem',
        background: 'transparent',
        color: active ? INK : INK_FAINT,
        border: 'none',
        borderBottom: active ? `2px solid ${INK}` : '2px solid transparent',
        marginBottom: '-1px',
        fontFamily: serif,
        fontSize: '0.95rem',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
        {label}
      </div>
      {children}
    </label>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    padding: '0.6rem 0.8rem',
    fontFamily: sans,
    fontSize: '0.92rem',
    color: INK,
    background: PAPER,
    border: `1px solid ${RULE}`,
    borderRadius: 2,
    outline: 'none',
  };
}
