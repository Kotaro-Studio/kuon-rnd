'use client';

/**
 * /theory-tutor — KUON THEORY TUTOR
 *
 * 音楽家のための AI 家庭教師。OMT v2 + Kuon Theory Suite を文脈に
 * Llama 3.3 70B が回答。出典必須・§49 哲学準拠。
 *
 * 機能:
 *   - チャット UI (ストリーミング表示)
 *   - 出典カード (OMT v2 ページ番号 + Kuon レッスンへのリンク)
 *   - 会話履歴 (KV 永続化)
 *   - 文脈継承 (直近 5 ターン)
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/AuthGate';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ──────────────────────────────────────────────────────────────────────────
// Tokens (CLAUDE.md §48 余白の知性)
// ──────────────────────────────────────────────────────────────────────────
const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE = '#d4d0c4';
const ACCENT = '#9c7c3a';
const ACCENT_DEEP = '#7a5e26';
const RED = '#dc2626';

// ──────────────────────────────────────────────────────────────────────────
// 型
// ──────────────────────────────────────────────────────────────────────────
type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

interface Citation {
  source: 'omt' | 'kuon';
  title: string;
  chapter?: string;
  page?: number;
  lessonId?: string;
  url?: string;
  snippet: string;
  score: number;
}

interface Turn {
  question: string;
  answer: string;
  citations: Citation[];
  isStreaming?: boolean;
}

interface ConversationListItem {
  id: string;
  title: string;
  updatedAt: string;
  turnCount: number;
}

const SUGGESTED_QUESTIONS_JA = [
  'ナポリの六について教えてください',
  '対位法の第 1 種から第 5 種までの違いは?',
  'フリギア旋法はどんな曲で使われていますか?',
  'V7 → I の解決でなぜ第 7 音は下行しなければならないのですか?',
  'シューベルトの転調はなぜ印象的なのですか?',
  '完全終止と偽終止の違いを Bach の例で教えて',
];
const SUGGESTED_QUESTIONS_EN = [
  'What is the Neapolitan sixth?',
  'Difference between species 1-5 in counterpoint?',
  'Where is the Phrygian mode used?',
  'Why must the seventh resolve down in V7→I?',
  "Why are Schubert's modulations so striking?",
  'Authentic vs deceptive cadence — Bach examples',
];

// ──────────────────────────────────────────────────────────────────────────
// メイン
// ──────────────────────────────────────────────────────────────────────────
export default function TheoryTutorPage() {
  return (
    <AuthGate appName="theory-tutor">
      <TutorApp />
    </AuthGate>
  );
}

function TutorApp() {
  const { lang } = useLang();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [archive, setArchive] = useState<ConversationListItem[]>([]);
  const [showArchive, setShowArchive] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  // アーカイブ取得
  const fetchArchive = useCallback(async () => {
    try {
      const res = await fetch('/api/theory-tutor/conversations');
      if (!res.ok) return;
      const data = await res.json();
      setArchive(data.conversations || []);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    void fetchArchive();
  }, [fetchArchive]);

  // ── 質問送信 (ストリーミング) ──
  const submit = useCallback(
    async (questionText: string) => {
      const q = questionText.trim();
      if (!q || submitting) return;

      setError(null);
      setSubmitting(true);

      const newTurn: Turn = { question: q, answer: '', citations: [], isStreaming: true };
      setTurns((prev) => [...prev, newTurn]);
      setInput('');

      try {
        const res = await fetch('/api/theory-tutor/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q,
            conversationId: conversationId || undefined,
            language: lang,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          if (errBody.code === 'QUOTA_EXCEEDED') {
            setError(
              t({
                ja: `今月の質問回数 (${errBody.limit} 回) を使い切りました。プランをアップグレードするか、来月までお待ちください。`,
                en: `You've used all ${errBody.limit} questions for this month. Upgrade or wait until next month.`,
              }, lang),
            );
          } else {
            setError(errBody.error || errBody.message || 'Question failed');
          }
          setTurns((prev) => prev.slice(0, -1));
          setSubmitting(false);
          return;
        }

        // SSE ストリーム読み出し
        if (!res.body) throw new Error('No stream body');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let citations: Citation[] = [];
        let answerText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (!payload) continue;
            try {
              const event = JSON.parse(payload);
              if (event.type === 'citations') {
                citations = event.citations || [];
                setTurns((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = { ...next[next.length - 1], citations };
                  return next;
                });
              } else if (event.type === 'token') {
                answerText += event.token;
                setTurns((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    ...next[next.length - 1],
                    answer: answerText,
                  };
                  return next;
                });
              } else if (event.type === 'done') {
                setTurns((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    ...next[next.length - 1],
                    isStreaming: false,
                  };
                  return next;
                });
              } else if (event.type === 'error') {
                throw new Error(event.message || 'Stream error');
              }
            } catch (e) {
              console.error('Parse error:', e, payload);
            }
          }
        }

        void fetchArchive();
      } catch (e) {
        console.error(e);
        setError(t({ ja: 'エラーが発生しました', en: 'An error occurred' }, lang));
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, conversationId, lang, fetchArchive],
  );

  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/theory-tutor/conversations/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const conv = data.conversation;
      if (!conv) return;
      setConversationId(id);
      setTurns(
        conv.turns.map((tt: any) => ({
          question: tt.question,
          answer: tt.answer,
          citations: tt.citations || [],
          isStreaming: false,
        })),
      );
      setShowArchive(false);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const newConversation = useCallback(() => {
    setConversationId(null);
    setTurns([]);
    setInput('');
    setError(null);
    setShowArchive(false);
    inputRef.current?.focus();
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      if (!confirm(t({ ja: 'この会話を削除しますか?', en: 'Delete this conversation?' }, lang))) return;
      await fetch(`/api/theory-tutor/conversations/${id}`, { method: 'DELETE' });
      void fetchArchive();
      if (conversationId === id) newConversation();
    },
    [lang, fetchArchive, conversationId, newConversation],
  );

  const suggestions = lang === 'ja' ? SUGGESTED_QUESTIONS_JA : SUGGESTED_QUESTIONS_EN;

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>
      {/* ヘッダー */}
      <header
        style={{
          padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem) clamp(1rem, 2vw, 1.5rem)',
          maxWidth: 980,
          margin: '0 auto',
          borderBottom: `1px solid ${STAFF_LINE}`,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: '0.7rem',
            color: INK_FAINT,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            marginBottom: '0.7rem',
          }}
        >
          KUON · Theory Tutor
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <h1
            style={{
              fontFamily: serif,
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              fontWeight: 400,
              letterSpacing: '0.04em',
              lineHeight: 1.4,
              margin: 0,
              color: INK,
            }}
          >
            {t(
              {
                ja: '音楽理論の、家庭教師。',
                en: 'Your music theory tutor.',
                es: 'Tu tutor de teoría musical.',
              },
              lang,
            )}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowArchive((v) => !v)}
              style={tabBtnStyle(showArchive)}
              type="button"
            >
              {t({ ja: '会話履歴', en: 'History', es: 'Historial' }, lang)} ({archive.length})
            </button>
            <button onClick={newConversation} style={tabBtnStyle(false)} type="button">
              + {t({ ja: '新しい会話', en: 'New', es: 'Nuevo' }, lang)}
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: 'clamp(1.5rem, 3vw, 2rem) clamp(1.5rem, 4vw, 3rem) clamp(2rem, 4vw, 3rem)',
        }}
      >
        {error && (
          <div
            style={{
              background: '#fff1f2',
              border: `1px solid ${RED}`,
              color: RED,
              padding: '1rem 1.2rem',
              borderRadius: 4,
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              fontFamily: sans,
              lineHeight: 1.7,
            }}
          >
            {error}
          </div>
        )}

        {/* アーカイブビュー */}
        {showArchive ? (
          <ArchiveView
            archive={archive}
            onLoad={loadConversation}
            onDelete={deleteConversation}
            lang={lang}
          />
        ) : (
          <>
            {/* チャット履歴 */}
            <div ref={scrollRef} style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              {turns.length === 0 ? (
                <EmptyState suggestions={suggestions} onClick={(q) => submit(q)} lang={lang} />
              ) : (
                <div style={{ display: 'grid', gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
                  {turns.map((turn, i) => (
                    <TurnView key={i} turn={turn} lang={lang} />
                  ))}
                </div>
              )}
            </div>

            {/* 入力欄 */}
            <InputBar
              input={input}
              setInput={setInput}
              onSubmit={() => submit(input)}
              submitting={submitting}
              inputRef={inputRef}
              lang={lang}
            />
          </>
        )}
      </main>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function EmptyState({
  suggestions,
  onClick,
  lang,
}: {
  suggestions: string[];
  onClick: (q: string) => void;
  lang: Lang;
}) {
  return (
    <div style={{ textAlign: 'center', padding: 'clamp(2rem, 5vw, 4rem) 0' }}>
      <p
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 'clamp(1rem, 1.7vw, 1.15rem)',
          color: INK_SOFT,
          lineHeight: 2,
          maxWidth: 640,
          margin: '0 auto 2.5rem',
          letterSpacing: '0.02em',
        }}
      >
        {t(
          {
            ja: '楽典・和声・対位法・音楽史 ── どんな質問でも、出典つきで答えます。教科書の正解と、Bach の選択と、あなたの選択肢を並べて。',
            en: 'Theory, harmony, counterpoint, history — any question, answered with citations. Textbook orthodoxy, Bach\'s choice, and your alternatives — side by side.',
          },
          lang,
        )}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.7rem',
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        {suggestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onClick(q)}
            type="button"
            style={{
              fontFamily: serif,
              fontSize: '0.9rem',
              color: INK,
              background: '#fff',
              border: `1px solid ${STAFF_LINE}`,
              borderRadius: 3,
              padding: '0.85rem 1rem',
              cursor: 'pointer',
              textAlign: 'left',
              lineHeight: 1.5,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = ACCENT;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = STAFF_LINE;
              e.currentTarget.style.transform = 'none';
            }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function TurnView({ turn, lang }: { turn: Turn; lang: Lang }) {
  return (
    <div style={{ display: 'grid', gap: '0.85rem' }}>
      {/* 質問 */}
      <div
        style={{
          background: PAPER_DEEP,
          padding: '1rem 1.2rem',
          borderRadius: 4,
          fontFamily: sans,
          fontSize: '0.95rem',
          lineHeight: 1.85,
          color: INK,
          borderLeft: `3px solid ${INK_SOFT}`,
        }}
      >
        {turn.question}
      </div>

      {/* 回答 */}
      <div
        style={{
          background: '#fff',
          border: `1px solid ${STAFF_LINE}`,
          borderRadius: 4,
          padding: 'clamp(1.2rem, 2.5vw, 1.6rem)',
        }}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: '1rem',
            lineHeight: 2,
            color: INK,
            whiteSpace: 'pre-wrap',
            letterSpacing: '0.01em',
          }}
        >
          {turn.answer}
          {turn.isStreaming && (
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '1em',
                background: ACCENT,
                marginLeft: '2px',
                animation: 'kuonTutorBlink 1s ease-in-out infinite',
                verticalAlign: 'baseline',
              }}
            />
          )}
        </div>

        {/* 出典 */}
        {turn.citations.length > 0 && (
          <div
            style={{
              marginTop: '1.4rem',
              paddingTop: '1rem',
              borderTop: `1px solid ${STAFF_LINE}`,
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: '0.65rem',
                color: INK_FAINT,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: '0.7rem',
              }}
            >
              {t({ ja: '出典', en: 'Sources', es: 'Fuentes' }, lang)} ({turn.citations.length})
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {turn.citations.map((c, i) => (
                <CitationCard key={i} index={i + 1} citation={c} lang={lang} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes kuonTutorBlink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function CitationCard({
  index,
  citation,
  lang,
}: {
  index: number;
  citation: Citation;
  lang: Lang;
}) {
  const isKuon = citation.source === 'kuon';
  const label = isKuon
    ? citation.title
    : `Open Music Theory v2 ${citation.page ? `· p.${citation.page}` : ''}${citation.chapter ? ` · ${citation.chapter}` : ''}`;

  const inner = (
    <>
      <div
        style={{
          display: 'flex',
          gap: '0.7rem',
          alignItems: 'baseline',
          marginBottom: '0.35rem',
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: '0.7rem',
            color: ACCENT,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          [{index}]
        </span>
        <span
          style={{
            fontFamily: serif,
            fontSize: '0.92rem',
            color: INK,
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: mono,
            fontSize: '0.65rem',
            color: INK_FAINT,
            marginLeft: 'auto',
            flexShrink: 0,
          }}
        >
          {(citation.score * 100).toFixed(0)}%
        </span>
      </div>
      <div
        style={{
          fontFamily: sans,
          fontSize: '0.82rem',
          color: INK_SOFT,
          lineHeight: 1.7,
          paddingLeft: '2rem',
        }}
      >
        {citation.snippet}
      </div>
      {citation.url && (
        <div
          style={{
            paddingLeft: '2rem',
            marginTop: '0.4rem',
            fontFamily: mono,
            fontSize: '0.7rem',
            color: ACCENT_DEEP,
          }}
        >
          → {t({ ja: '該当レッスンへ', en: 'Open lesson' }, lang)}
        </div>
      )}
    </>
  );

  if (citation.url) {
    return (
      <Link
        href={citation.url}
        style={{
          display: 'block',
          background: PAPER_DEEP,
          padding: '0.8rem 1rem',
          borderRadius: 3,
          textDecoration: 'none',
          color: INK,
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#eeeae0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = PAPER_DEEP;
        }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      style={{
        background: PAPER_DEEP,
        padding: '0.8rem 1rem',
        borderRadius: 3,
      }}
    >
      {inner}
    </div>
  );
}

function InputBar({
  input,
  setInput,
  onSubmit,
  submitting,
  inputRef,
  lang,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  lang: Lang;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${STAFF_LINE}`,
        borderRadius: 4,
        padding: '0.7rem',
        display: 'flex',
        gap: '0.6rem',
        alignItems: 'flex-end',
      }}
    >
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder={t(
          {
            ja: '音楽理論について何でも質問 (Enter で送信、Shift+Enter で改行)',
            en: 'Ask anything about music theory (Enter to send, Shift+Enter for newline)',
          },
          lang,
        )}
        disabled={submitting}
        rows={2}
        style={{
          flex: 1,
          fontFamily: serif,
          fontSize: '0.95rem',
          padding: '0.7rem 0.8rem',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          resize: 'none' as const,
          color: INK,
          lineHeight: 1.6,
        }}
      />
      <button
        onClick={onSubmit}
        disabled={submitting || !input.trim()}
        type="button"
        style={{
          background: submitting || !input.trim() ? STAFF_LINE : INK,
          color: PAPER,
          border: 'none',
          borderRadius: 3,
          padding: '0.7rem 1.4rem',
          cursor: submitting || !input.trim() ? 'not-allowed' : 'pointer',
          fontFamily: serif,
          fontSize: '0.9rem',
          letterSpacing: '0.08em',
          flexShrink: 0,
          alignSelf: 'flex-end',
          transition: 'all 0.2s ease',
        }}
      >
        {submitting
          ? t({ ja: '考え中…', en: 'Thinking…' }, lang)
          : t({ ja: '質問する', en: 'Ask' }, lang)}
      </button>
    </div>
  );
}

function ArchiveView({
  archive,
  onLoad,
  onDelete,
  lang,
}: {
  archive: ConversationListItem[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  lang: Lang;
}) {
  if (archive.length === 0) {
    return (
      <div
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: PAPER_DEEP,
          borderRadius: 4,
          fontFamily: serif,
          color: INK_SOFT,
          fontStyle: 'italic',
          lineHeight: 2,
        }}
      >
        {t({ ja: 'まだ会話がありません。最初の質問を送ってみましょう。', en: 'No conversations yet. Ask your first question.' }, lang)}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      {archive.map((c) => (
        <div
          key={c.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '0.7rem',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => onLoad(c.id)}
            type="button"
            style={{
              background: '#fff',
              border: `1px solid ${STAFF_LINE}`,
              borderRadius: 4,
              padding: '1rem 1.2rem',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = ACCENT;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = STAFF_LINE;
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '1rem',
              }}
            >
              <span
                style={{
                  fontFamily: serif,
                  fontSize: '0.95rem',
                  color: INK,
                  letterSpacing: '0.02em',
                }}
              >
                {c.title}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: '0.7rem',
                  color: INK_FAINT,
                  flexShrink: 0,
                }}
              >
                {new Date(c.updatedAt).toLocaleDateString(lang)}
              </span>
            </div>
            <div
              style={{
                fontFamily: sans,
                fontSize: '0.78rem',
                color: INK_SOFT,
                marginTop: '0.3rem',
              }}
            >
              {c.turnCount} {t({ ja: 'ターン', en: 'turns' }, lang)}
            </div>
          </button>
          <button
            onClick={() => onDelete(c.id)}
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: INK_FAINT,
              cursor: 'pointer',
              padding: '0.5rem',
              fontSize: '0.85rem',
            }}
            title={t({ ja: '削除', en: 'Delete' }, lang)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function tabBtnStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: sans,
    fontSize: '0.82rem',
    fontWeight: active ? 600 : 400,
    letterSpacing: '0.05em',
    background: active ? INK : 'transparent',
    color: active ? PAPER : INK,
    border: `1px solid ${active ? INK : STAFF_LINE}`,
    padding: '0.55rem 1rem',
    borderRadius: 3,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
}
