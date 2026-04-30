'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/AuthGate';
import { useLang } from '@/context/LangContext';

const PAPER = '#fbfaf6';
const PAPER_DEEP = '#f0ece1';
const INK = '#1a1a1a';
const INK_FAINT = '#7a7575';
const ACCENT = '#7a3a4f';
const RULE = '#d8d2c2';
const HIGHLIGHT = '#fdf6e8';
const serif = '"Shippori Mincho", "Noto Serif JP", "Times New Roman", serif';
const sans = '"Helvetica Neue", "Inter", "Hiragino Sans", system-ui, sans-serif';

interface Member { email: string; name: string; role: string; section?: string; instrument?: string; }
interface Ensemble { id: string; name: string; type: string; description?: string; ownerEmail: string; members: Member[]; sections: string[]; }
interface EventCandidate { id: string; start: string; end: string; location?: string; notes?: string; }
interface RehearsalEvent { id: string; ensembleId: string; title: string; description?: string; candidates: EventCandidate[]; status: 'polling'|'locked'|'cancelled'; lockedCandidateId?: string; createdAt: string; }

const t = <T extends Record<string, string>>(m: T, lang: string): string => (m[lang as keyof T] as string) || (m['ja'] as string) || (m['en'] as string) || '';

export default function EnsembleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGate appName="tutti" strict={false}>
      <EnsembleView id={id} />
    </AuthGate>
  );
}

function EnsembleView({ id }: { id: string }) {
  const { lang } = useLang();
  const [ensemble, setEnsemble] = useState<Ensemble | null>(null);
  const [events, setEvents] = useState<RehearsalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  // Event creation form
  const [eTitle, setETitle] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eCandidates, setECandidates] = useState<Array<{ start: string; end: string; location: string }>>([{ start: '', end: '', location: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem('kuon_token');
      const [eRes, evRes] = await Promise.all([
        fetch(`/api/tutti/ensembles/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/tutti/ensembles/${id}/events`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const eData = await eRes.json();
      const evData = await evRes.json();
      if (eData.ok) setEnsemble(eData.ensemble);
      if (evData.ok) setEvents(evData.events || []);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function addCandidate() { setECandidates([...eCandidates, { start: '', end: '', location: '' }]); }
  function removeCandidate(i: number) { setECandidates(eCandidates.filter((_, idx) => idx !== i)); }
  function updateCandidate(i: number, key: 'start'|'end'|'location', val: string) {
    setECandidates(eCandidates.map((c, idx) => idx === i ? { ...c, [key]: val } : c));
  }

  async function handleCreateEvent() {
    if (!eTitle.trim()) { setErrorMsg('タイトル必須'); return; }
    const valid = eCandidates.filter((c) => c.start && c.end);
    if (valid.length === 0) { setErrorMsg('少なくとも 1 つの候補日時が必要です'); return; }
    setSubmitting(true); setErrorMsg('');
    try {
      const token = localStorage.getItem('kuon_token');
      const res = await fetch('/api/tutti/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ensembleId: id,
          title: eTitle,
          description: eDesc,
          candidates: valid.map((c) => ({ start: new Date(c.start).toISOString(), end: new Date(c.end).toISOString(), location: c.location || undefined })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || data.message || 'Create failed'); return; }
      setShowCreateEvent(false);
      setETitle(''); setEDesc(''); setECandidates([{ start: '', end: '', location: '' }]);
      load();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main style={{ background: PAPER, minHeight: '100vh', padding: '3rem', fontFamily: serif }}>Loading...</main>;
  if (!ensemble) return <main style={{ background: PAPER, minHeight: '100vh', padding: '3rem', fontFamily: serif }}>Ensemble not found</main>;

  return (
    <main style={{ background: PAPER, minHeight: '100vh', color: INK, fontFamily: serif }}>
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <Link href="/tutti" style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, textDecoration: 'none' }}>← {t({ ja: 'すべてのアンサンブル', en: 'All ensembles' }, lang)}</Link>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${RULE}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', margin: 0, fontWeight: 400, letterSpacing: '0.04em' }}>{ensemble.name}</h1>
            {ensemble.description && <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: '0.4rem 0 0' }}>{ensemble.description}</p>}
            <p style={{ fontFamily: sans, fontSize: '0.75rem', color: INK_FAINT, margin: '0.5rem 0 0' }}>
              {ensemble.members.length} {t({ ja: '名のメンバー', en: 'members' }, lang)}
            </p>
          </div>
          <button onClick={() => setShowCreateEvent(true)} style={btnPrimary()}>
            + {t({ ja: '新しい予約 (リハ・本番)', en: 'New event' }, lang)}
          </button>
        </div>

        {errorMsg && <div style={{ padding: '0.7rem 1rem', background: '#f8e6e0', color: '#7a2f1c', fontFamily: sans, fontSize: '0.85rem', marginBottom: '1rem' }}>{errorMsg}</div>}

        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
          {/* Events */}
          <div>
            <h2 style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 400, marginTop: 0, borderBottom: `1px solid ${RULE}`, paddingBottom: '0.5rem' }}>
              {t({ ja: '予約一覧', en: 'Events' }, lang)} ({events.length})
            </h2>
            {events.length === 0 ? (
              <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT }}>
                {t({ ja: 'まだ予約がありません。「+ 新しい予約」から候補日を提示しましょう。', en: 'No events. Click "+ New event" to propose candidates.' }, lang)}
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.6rem' }}>
                {events.map((ev) => {
                  const locked = ev.status === 'locked' && ev.lockedCandidateId;
                  const lockedC = locked ? ev.candidates.find((c) => c.id === ev.lockedCandidateId) : null;
                  return (
                    <li key={ev.id}>
                      <Link href={`/tutti/events/${ev.id}`} style={{ display: 'block', padding: '0.9rem 1.1rem', background: locked ? HIGHLIGHT : PAPER_DEEP, border: `1px solid ${RULE}`, borderLeft: `3px solid ${locked ? ACCENT : INK_FAINT}`, borderRadius: 3, textDecoration: 'none', color: INK }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: serif, fontSize: '1.02rem' }}>{ev.title}</span>
                          <span style={{ fontFamily: sans, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: locked ? ACCENT : INK_FAINT }}>
                            {locked ? t({ ja: '確定', en: 'LOCKED' }, lang) : ev.status === 'cancelled' ? t({ ja: 'キャンセル', en: 'CANCELLED' }, lang) : t({ ja: '投票中', en: 'POLLING' }, lang)}
                          </span>
                        </div>
                        {lockedC && (
                          <div style={{ fontFamily: sans, fontSize: '0.8rem', color: INK_FAINT, marginTop: '0.3rem' }}>
                            📅 {new Date(lockedC.start).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US')}
                            {lockedC.location && <span style={{ marginLeft: '0.6rem' }}>📍 {lockedC.location}</span>}
                          </div>
                        )}
                        {!locked && (
                          <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, marginTop: '0.3rem' }}>
                            {ev.candidates.length} {t({ ja: '候補日時', en: 'candidate slots' }, lang)}
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Members */}
          <div>
            <h2 style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 400, marginTop: 0, borderBottom: `1px solid ${RULE}`, paddingBottom: '0.5rem' }}>
              {t({ ja: 'メンバー', en: 'Members' }, lang)}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
              {ensemble.members.map((m) => (
                <li key={m.email} style={{ padding: '0.5rem 0.7rem', background: PAPER_DEEP, fontFamily: sans, fontSize: '0.82rem', borderRadius: 2 }}>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div style={{ color: INK_FAINT, fontSize: '0.72rem' }}>
                    {m.role === 'owner' && '👑 '}
                    {m.role === 'manager' && '📋 '}
                    {m.section || '—'} {m.instrument && `· ${m.instrument}`}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div onClick={() => setShowCreateEvent(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 12, 10, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: PAPER, padding: '1.8rem', maxWidth: 700, width: '100%', maxHeight: '90vh', overflow: 'auto', borderRadius: 4 }}>
            <h2 style={{ fontFamily: serif, fontSize: '1.3rem', fontWeight: 400, margin: '0 0 1rem' }}>{t({ ja: '新しい予約 — 候補日時を提示', en: 'New event — propose candidate slots' }, lang)}</h2>
            <FormRow label={t({ ja: 'タイトル', en: 'Title' }, lang)}>
              <input type="text" value={eTitle} onChange={(e) => setETitle(e.target.value)} style={inputStyle()} placeholder="例: ベートーヴェン交響曲第7番リハ" />
            </FormRow>
            <FormRow label={t({ ja: '説明 (任意)', en: 'Description (optional)' }, lang)}>
              <textarea value={eDesc} onChange={(e) => setEDesc(e.target.value)} rows={2} style={{ ...inputStyle(), fontFamily: serif }} />
            </FormRow>
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontFamily: sans, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{t({ ja: '候補日時', en: 'Candidates' }, lang)}</div>
              {eCandidates.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <input type="datetime-local" value={c.start} onChange={(e) => updateCandidate(i, 'start', e.target.value)} style={inputStyle()} />
                  <input type="datetime-local" value={c.end} onChange={(e) => updateCandidate(i, 'end', e.target.value)} style={inputStyle()} />
                  <input type="text" value={c.location} onChange={(e) => updateCandidate(i, 'location', e.target.value)} placeholder={t({ ja: '場所', en: 'Location' }, lang)} style={inputStyle()} />
                  <button onClick={() => removeCandidate(i)} style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: `1px solid ${RULE}`, cursor: 'pointer', borderRadius: 2 }}>✕</button>
                </div>
              ))}
              <button onClick={addCandidate} style={{ ...btnSecondary(), marginTop: '0.4rem' }}>+ {t({ ja: '候補追加', en: 'Add candidate' }, lang)}</button>
            </div>
            <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCreateEvent} disabled={submitting} style={btnPrimary(submitting)}>
                {submitting ? t({ ja: '送信中...', en: 'Sending...' }, lang) : t({ ja: '作成して全員に通知', en: 'Create & notify all' }, lang)}
              </button>
              <button onClick={() => setShowCreateEvent(false)} style={btnSecondary()}>{t({ ja: 'キャンセル', en: 'Cancel' }, lang)}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: '0.7rem' }}>
      <div style={{ fontFamily: sans, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{label}</div>
      {children}
    </label>
  );
}
function inputStyle(): React.CSSProperties { return { width: '100%', padding: '0.55rem 0.75rem', fontFamily: sans, fontSize: '0.88rem', color: INK, background: PAPER, border: `1px solid ${RULE}`, borderRadius: 2, outline: 'none' }; }
function btnPrimary(disabled?: boolean): React.CSSProperties { return { padding: '0.65rem 1.3rem', background: disabled ? INK_FAINT : INK, color: PAPER, border: 'none', borderRadius: 2, fontFamily: serif, fontSize: '0.9rem', letterSpacing: '0.05em', cursor: disabled ? 'not-allowed' : 'pointer' }; }
function btnSecondary(): React.CSSProperties { return { padding: '0.55rem 1rem', background: 'transparent', color: INK, border: `1px solid ${RULE}`, borderRadius: 2, fontFamily: serif, fontSize: '0.85rem', cursor: 'pointer' }; }
