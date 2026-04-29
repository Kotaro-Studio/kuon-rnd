'use client';

/**
 * LessonRecordsCard — マイページ用 KUON LESSON RECORDER アーカイブカード
 *
 * 役割: 過去のレッスン記録の最新 5 件をマイページに表示し、
 *       /lesson-recorder のアーカイブへのアクセスを最短化する。
 *       Theory Suite との並列導線として、§48「余白の知性」美学に準拠。
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, monospace';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const STAFF_LINE = '#d4d0c4';
const ACCENT = '#9c7c3a';
const GREEN = '#15803d';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

interface LessonMeta {
  id: string;
  title: string;
  instrument?: string;
  teacher?: string;
  language: string;
  duration: number;
  createdAt: string;
  hasSummary: boolean;
}

const MAX_DISPLAY = 5;

export function LessonRecordsCard() {
  const { lang } = useLang();
  const [lessons, setLessons] = useState<LessonMeta[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/lesson-recorder/lessons');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setLessons(data.lessons?.slice(0, MAX_DISPLAY) ?? []);
          setTotal(data.total ?? data.lessons?.length ?? 0);
        }
      } catch {
        // silent fail (Worker 未起動時等)
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ローディング中は控えめに表示
  if (loading) {
    return (
      <div style={cardStyle()}>
        <Header lang={lang} total={0} />
        <div style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, textAlign: 'center', padding: '1rem 0' }}>
          ...
        </div>
      </div>
    );
  }

  // データなし時は LP への誘導カード
  if (lessons.length === 0) {
    return (
      <div style={cardStyle()}>
        <Header lang={lang} total={0} />
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.95rem', color: INK_SOFT, lineHeight: 1.95, margin: '0 0 1.2rem 0' }}>
            {t({
              ja: '今日のレッスンを録音して、AI に書き起こし・要約させましょう。話者を教師/生徒に推定、音楽専門用語を理解します。',
              en: 'Record today\'s lesson and let AI transcribe + summarize. Detects teacher/student, understands music terms.',
              es: 'Graba la clase de hoy y deja que la IA la transcriba y resuma.',
              ko: '오늘 레슨을 녹음하고 AI에게 받아쓰고 요약하게 하세요.',
              pt: 'Grave a aula de hoje e deixe a IA transcrever e resumir.',
              de: 'Nimm die heutige Stunde auf — KI transkribiert und fasst zusammen.',
            }, lang)}
          </p>
          <Link href="/lesson-recorder" style={primaryBtn()}>
            {t({
              ja: '最初のレッスンを録音 →',
              en: 'Record your first lesson →',
              es: 'Graba tu primera clase →',
              ko: '첫 레슨 녹음 →',
              pt: 'Grave sua primeira aula →',
              de: 'Erste Lektion aufnehmen →',
            }, lang)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle()}>
      <Header lang={lang} total={total} />
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
        {lessons.map((l) => (
          <li key={l.id}>
            <Link
              href={`/lesson-recorder?id=${l.id}`}
              style={{
                display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'baseline',
                gap: '0.7rem', padding: '0.7rem 0.85rem', borderRadius: 3,
                textDecoration: 'none', color: INK,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f4ed'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: serif, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.title}
                </div>
                <div style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, marginTop: '0.25rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {l.instrument && <span>{l.instrument}</span>}
                  {l.teacher && <span>· {l.teacher}</span>}
                  <span>· {Math.floor(l.duration / 60)}:{String(Math.floor(l.duration % 60)).padStart(2, '0')}</span>
                  {l.hasSummary && <span style={{ color: GREEN }}>· {t({ ja: '要約済', en: 'Summarized' }, lang)}</span>}
                </div>
              </div>
              <span style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, flexShrink: 0 }}>
                {new Date(l.createdAt).toLocaleDateString(lang)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.8rem', borderTop: `1px solid ${STAFF_LINE}` }}>
        <Link href="/lesson-recorder" style={{ fontFamily: sans, fontSize: '0.78rem', color: ACCENT, textDecoration: 'none', letterSpacing: '0.04em' }}>
          {t({ ja: '新しいレッスンを録音', en: 'Record new lesson' }, lang)}
        </Link>
        {total > MAX_DISPLAY && (
          <Link href="/lesson-recorder" style={{ fontFamily: sans, fontSize: '0.75rem', color: INK_FAINT, textDecoration: 'none' }}>
            {t({ ja: 'すべて見る', en: 'See all' }, lang)} ({total}) →
          </Link>
        )}
      </div>
    </div>
  );
}

function Header({ lang, total }: { lang: Lang; total: number }) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ fontFamily: mono, fontSize: '0.65rem', color: INK_FAINT, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
        KUON · LESSON RECORDER {total > 0 && <span style={{ marginLeft: '0.6rem', color: ACCENT }}>{total}</span>}
      </div>
      <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.15rem, 2.5vw, 1.4rem)', fontWeight: 400, color: INK, margin: 0, letterSpacing: '0.03em' }}>
        {t({
          ja: 'レッスン記録',
          en: 'Lesson Records',
          es: 'Registros de clases',
          ko: '레슨 기록',
          pt: 'Registros de aulas',
          de: 'Stundenaufzeichnungen',
        }, lang)}
      </h2>
    </div>
  );
}

function cardStyle(): React.CSSProperties {
  return {
    background: '#fff',
    border: `1px solid ${STAFF_LINE}`,
    borderRadius: 4,
    padding: 'clamp(1.4rem, 2.5vw, 1.8rem)',
    marginBottom: '1.5rem',
  };
}

function primaryBtn(): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: INK,
    color: '#fafaf7',
    padding: '0.75rem 1.4rem',
    borderRadius: 3,
    fontFamily: serif,
    fontSize: '0.92rem',
    textDecoration: 'none',
    letterSpacing: '0.08em',
    transition: 'background 0.2s ease',
  };
}
