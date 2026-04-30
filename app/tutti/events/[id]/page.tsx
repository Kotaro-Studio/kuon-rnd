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
const GREEN = '#2d5a1e';
const RULE = '#d8d2c2';
const HIGHLIGHT = '#fdf6e8';
const serif = '"Shippori Mincho", "Noto Serif JP", "Times New Roman", serif';
const sans = '"Helvetica Neue", "Inter", "Hiragino Sans", system-ui, sans-serif';

type VoteResp = 'yes' | 'maybe' | 'no';
interface Member { email: string; name: string; role: string; section?: string; instrument?: string; }
interface Ensemble { id: string; name: string; type: string; members: Member[]; ownerEmail: string; }
interface Cand { id: string; start: string; end: string; location?: string; notes?: string; }
interface Event { id: string; ensembleId: string; title: string; description?: string; candidates: Cand[]; status: string; lockedCandidateId?: string; createdBy: string; }
interface Vote { voterId: string; voterName: string; voterEmail: string; isGuest: boolean; responses: Record<string, VoteResp>; comment?: string; }

const t = <T extends Record<string, string>>(m: T, lang: string): string => (m[lang as keyof T] as string) || (m['ja'] as string) || (m['en'] as string) || '';

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AuthGate appName="tutti" strict={false}><EventView id={id} /></AuthGate>;
}

function EventView({ id }: { id: string }) {
  const { lang } = useLang();
  const [event, setEvent] = useState<Event | null>(null);
  const [ensemble, setEnsemble] = useState<Ensemble | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [myEmail, setMyEmail] = useState('');
  const [myResponses, setMyResponses] = useState<Record<string, VoteResp>>({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem('kuon_token');
      const userRaw = localStorage.getItem('kuon_user');
      if (userRaw) {
        try { setMyEmail(JSON.parse(userRaw).email || ''); } catch {}
      }
      const res = await fetch(`/api/tutti/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Load failed'); return; }
      setEvent(data.event);
      setEnsemble(data.ensemble);
      setVotes(data.votes || []);
      // 既存投票の復元
      const existing = (data.votes || []).find((v: Vote) => v.voterEmail === myEmail);
      if (existing) {
        setMyResponses(existing.responses);
        setComment(existing.comment || '');
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [id, myEmail]);

  useEffect(() => { load(); }, [load]);

  function setResp(candId: string, val: VoteResp) {
    setMyResponses({ ...myResponses, [candId]: val });
  }

  async function submitVote() {
    if (!event) return;
    setSaving(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const token = localStorage.getItem('kuon_token');
      const res = await fetch(`/api/tutti/events/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ responses: myResponses, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Vote failed'); return; }
      setSuccessMsg(t({ ja: '回答を送信しました', en: 'Vote submitted' }, lang));
      load();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSaving(false);
    }
  }

  async function lockCandidate(candidateId: string) {
    if (!confirm(t({ ja: 'この時刻で確定しますか? 全員に通知が送信されます。', en: 'Lock this slot and notify all members?' }, lang))) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('kuon_token');
      const res = await fetch(`/api/tutti/events/${id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Lock failed'); return; }
      setSuccessMsg(t({ ja: '確定しました。全員に通知済み。', en: 'Locked! All members notified.' }, lang));
      load();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main style={{ background: PAPER, minHeight: '100vh', padding: '3rem', fontFamily: serif }}>Loading...</main>;
  if (!event || !ensemble) return <main style={{ background: PAPER, minHeight: '100vh', padding: '3rem', fontFamily: serif }}>Not found</main>;

  const me = ensemble.members.find((m) => m.email === myEmail);
  const isOwnerOrManager = me?.role === 'owner' || me?.role === 'manager';
  const lockedC = event.lockedCandidateId ? event.candidates.find((c) => c.id === event.lockedCandidateId) : null;
  const tally = computeTally(event.candidates, votes);

  return (
    <main style={{ background: PAPER, minHeight: '100vh', color: INK, fontFamily: serif }}>
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <Link href={`/tutti/ensembles/${event.ensembleId}`} style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, textDecoration: 'none' }}>← {ensemble.name}</Link>
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 2.8vw, 2rem)', margin: '0 0 0.4rem', fontWeight: 400, letterSpacing: '0.04em' }}>{event.title}</h1>
        {event.description && <p style={{ fontFamily: sans, fontSize: '0.9rem', color: INK_FAINT, margin: '0 0 1.5rem', lineHeight: 1.7 }}>{event.description}</p>}

        {errorMsg && <div style={{ padding: '0.7rem 1rem', background: '#f8e6e0', color: '#7a2f1c', fontFamily: sans, fontSize: '0.85rem', marginBottom: '1rem' }}>{errorMsg}</div>}
        {successMsg && <div style={{ padding: '0.7rem 1rem', background: '#e6f0e0', color: GREEN, fontFamily: sans, fontSize: '0.85rem', marginBottom: '1rem' }}>{successMsg}</div>}

        {/* Locked banner */}
        {lockedC && (
          <div style={{ padding: '1.2rem 1.4rem', background: HIGHLIGHT, border: `2px solid ${ACCENT}`, borderRadius: 4, marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: sans, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: '0.4rem' }}>
              ✓ {t({ ja: '確定済み', en: 'Locked' }, lang)}
            </div>
            <div style={{ fontFamily: serif, fontSize: '1.2rem', marginBottom: '0.3rem' }}>
              📅 {new Date(lockedC.start).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US')}
              <span style={{ color: INK_FAINT, marginLeft: '0.5rem' }}>〜 {new Date(lockedC.end).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US', { hour: 'numeric', minute: 'numeric' })}</span>
            </div>
            {lockedC.location && <div style={{ fontFamily: sans, fontSize: '0.9rem', color: INK_FAINT }}>📍 {lockedC.location}</div>}
            <a href={`/api/tutti/events/${event.id}/ical`} download style={{ display: 'inline-block', marginTop: '0.7rem', fontFamily: sans, fontSize: '0.85rem', color: ACCENT, textDecoration: 'underline' }}>
              📅 {t({ ja: 'カレンダーに追加 (.ics)', en: 'Add to calendar (.ics)' }, lang)}
            </a>
          </div>
        )}

        {/* Voting matrix */}
        {event.status === 'polling' && (
          <>
            <h2 style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 400, marginTop: '1rem', borderBottom: `1px solid ${RULE}`, paddingBottom: '0.5rem' }}>
              {t({ ja: 'あなたの参加可否', en: 'Your availability' }, lang)}
            </h2>
            <div style={{ display: 'grid', gap: '0.7rem', marginTop: '1rem' }}>
              {event.candidates.map((c) => {
                const ta = tally[c.id] || { yes: 0, maybe: 0, no: 0 };
                const myResp = myResponses[c.id];
                return (
                  <div key={c.id} style={{ padding: '0.9rem 1rem', background: PAPER_DEEP, border: `1px solid ${RULE}`, borderRadius: 3, display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: serif, fontSize: '0.98rem' }}>
                        📅 {new Date(c.start).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US')}
                        <span style={{ color: INK_FAINT, fontSize: '0.85rem', marginLeft: '0.4rem' }}>〜 {new Date(c.end).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US', { hour: 'numeric', minute: 'numeric' })}</span>
                      </div>
                      {c.location && <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, marginTop: '0.2rem' }}>📍 {c.location}</div>}
                      <div style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, marginTop: '0.3rem' }}>
                        ✓ {ta.yes} / △ {ta.maybe} / ✗ {ta.no}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <VoteBtn active={myResp === 'yes'} onClick={() => setResp(c.id, 'yes')} color="#2d5a1e" label="✓" />
                      <VoteBtn active={myResp === 'maybe'} onClick={() => setResp(c.id, 'maybe')} color="#a86b3e" label="△" />
                      <VoteBtn active={myResp === 'no'} onClick={() => setResp(c.id, 'no')} color="#9c2828" label="✗" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder={t({ ja: 'コメント (任意・例: 19 時以降なら OK)', en: 'Comment (optional)' }, lang)} style={{ width: '100%', padding: '0.6rem', fontFamily: serif, fontSize: '0.88rem', background: PAPER, border: `1px solid ${RULE}`, borderRadius: 2 }} />
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem' }}>
              <button onClick={submitVote} disabled={saving} style={{ padding: '0.7rem 1.6rem', background: saving ? INK_FAINT : INK, color: PAPER, border: 'none', borderRadius: 2, fontFamily: serif, fontSize: '0.92rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? t({ ja: '送信中...', en: 'Saving...' }, lang) : t({ ja: '回答を送信', en: 'Submit vote' }, lang)}
              </button>
            </div>
          </>
        )}

        {/* Owner/Manager: lock */}
        {event.status === 'polling' && isOwnerOrManager && (
          <div style={{ marginTop: '2.5rem', padding: '1.2rem', background: PAPER_DEEP, border: `1px solid ${RULE}`, borderRadius: 3 }}>
            <div style={{ fontFamily: sans, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: '0.6rem' }}>
              👑 {t({ ja: 'オーナー操作 — 最終確定', en: 'Owner action — Lock final' }, lang)}
            </div>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              {event.candidates
                .map((c) => ({ c, score: (tally[c.id]?.yes || 0) * 2 + (tally[c.id]?.maybe || 0) }))
                .sort((a, b) => b.score - a.score)
                .map(({ c }) => {
                  const ta = tally[c.id] || { yes: 0, maybe: 0, no: 0 };
                  return (
                    <button key={c.id} onClick={() => lockCandidate(c.id)} style={{ textAlign: 'left', padding: '0.6rem 0.9rem', background: PAPER, border: `1px solid ${RULE}`, borderRadius: 2, cursor: 'pointer', fontFamily: serif, fontSize: '0.9rem' }}>
                      ✓ {ta.yes} / △ {ta.maybe} / ✗ {ta.no} ── {new Date(c.start).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-US')}
                      {c.location && <span style={{ color: INK_FAINT, fontSize: '0.8rem', marginLeft: '0.5rem' }}>({c.location})</span>}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Vote summary */}
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 400, borderBottom: `1px solid ${RULE}`, paddingBottom: '0.4rem' }}>
            {t({ ja: '回答状況', en: 'Responses' }, lang)} ({votes.length} / {ensemble.members.length})
          </h2>
          <div style={{ overflowX: 'auto', marginTop: '0.7rem' }}>
            <table style={{ borderCollapse: 'collapse', fontFamily: sans, fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.4rem 0.6rem', borderBottom: `1px solid ${RULE}` }}>{t({ ja: 'メンバー', en: 'Member' }, lang)}</th>
                  {event.candidates.map((c) => (
                    <th key={c.id} style={{ padding: '0.4rem 0.6rem', borderBottom: `1px solid ${RULE}`, fontWeight: 400, color: INK_FAINT, fontSize: '0.7rem' }}>
                      {new Date(c.start).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', { month: 'numeric', day: 'numeric' })}<br />
                      {new Date(c.start).toLocaleTimeString(lang === 'ja' ? 'ja-JP' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ensemble.members.map((m) => {
                  const v = votes.find((vv) => vv.voterEmail === m.email);
                  return (
                    <tr key={m.email}>
                      <td style={{ padding: '0.4rem 0.6rem', borderBottom: `1px dotted ${RULE}` }}>{m.name}{v?.isGuest && <span style={{ color: INK_FAINT, fontSize: '0.7rem' }}> (Guest)</span>}</td>
                      {event.candidates.map((c) => {
                        const r = v?.responses[c.id];
                        return <td key={c.id} style={{ padding: '0.4rem 0.6rem', borderBottom: `1px dotted ${RULE}`, textAlign: 'center', color: r === 'yes' ? GREEN : r === 'no' ? '#9c2828' : r === 'maybe' ? '#a86b3e' : INK_FAINT }}>{r === 'yes' ? '✓' : r === 'maybe' ? '△' : r === 'no' ? '✗' : '—'}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function computeTally(candidates: Cand[], votes: Vote[]): Record<string, { yes: number; maybe: number; no: number }> {
  const t: Record<string, { yes: number; maybe: number; no: number }> = {};
  candidates.forEach((c) => { t[c.id] = { yes: 0, maybe: 0, no: 0 }; });
  votes.forEach((v) => {
    Object.entries(v.responses).forEach(([cid, r]) => {
      if (t[cid] && (r === 'yes' || r === 'maybe' || r === 'no')) t[cid][r]++;
    });
  });
  return t;
}

function VoteBtn({ active, onClick, color, label }: { active: boolean; onClick: () => void; color: string; label: string }) {
  return (
    <button onClick={onClick} style={{ padding: '0.6rem 0.9rem', background: active ? color : 'transparent', color: active ? '#fff' : color, border: `1.5px solid ${color}`, borderRadius: 2, fontFamily: serif, fontSize: '1rem', fontWeight: 600, cursor: 'pointer', minWidth: 44 }}>{label}</button>
  );
}
