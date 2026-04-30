'use client';

/**
 * Guest 投票ページ — アカウント不要・メールリンクからアクセス
 */
import { useState, useEffect, useCallback, use } from 'react';

const PAPER = '#fbfaf6';
const PAPER_DEEP = '#f0ece1';
const INK = '#1a1a1a';
const INK_FAINT = '#7a7575';
const ACCENT = '#7a3a4f';
const GREEN = '#2d5a1e';
const RULE = '#d8d2c2';
const serif = '"Shippori Mincho", "Noto Serif JP", "Times New Roman", serif';
const sans = '"Helvetica Neue", "Inter", "Hiragino Sans", system-ui, sans-serif';

type VoteResp = 'yes' | 'maybe' | 'no';
interface Cand { id: string; start: string; end: string; location?: string; }
interface Event { id: string; title: string; description?: string; candidates: Cand[]; status: string; }
interface Ensemble { name: string; type: string; }

export default function GuestVotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [ensemble, setEnsemble] = useState<Ensemble | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestName, setGuestName] = useState('');
  const [responses, setResponses] = useState<Record<string, VoteResp>>({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/tutti/guest-vote/${token}`);
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Token invalid or expired'); return; }
      setEvent(data.event);
      setEnsemble(data.ensemble);
      setGuestEmail(data.guestEmail);
      setGuestName(data.guestName);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function setResp(cid: string, val: VoteResp) {
    setResponses({ ...responses, [cid]: val });
  }

  async function submit() {
    setSaving(true); setErrorMsg('');
    try {
      const res = await fetch(`/api/tutti/guest-vote/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterName: guestName, responses, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Vote failed'); return; }
      setSuccess(true);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Wrapper><p style={{ color: INK_FAINT, fontFamily: sans }}>Loading...</p></Wrapper>;
  if (errorMsg && !event) return <Wrapper><p style={{ color: '#7a2f1c', fontFamily: sans }}>{errorMsg}</p></Wrapper>;
  if (!event || !ensemble) return <Wrapper><p style={{ fontFamily: sans }}>Not found</p></Wrapper>;
  if (event.status !== 'polling') return <Wrapper><p style={{ fontFamily: serif, fontSize: '1.1rem' }}>この投票は既に締め切られています。</p></Wrapper>;

  if (success) {
    return (
      <Wrapper>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '3rem' }}>✓</div>
          <h1 style={{ fontFamily: serif, fontSize: '1.4rem', fontWeight: 400, marginTop: '1rem' }}>回答ありがとうございました</h1>
          <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, marginTop: '0.5rem' }}>
            {ensemble.name} / {event.title}<br />
            最終確定が決まり次第メールでお知らせします。
          </p>
          <p style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, marginTop: '1.5rem' }}>
            <a href="/tutti-lp" style={{ color: ACCENT, textDecoration: 'underline' }}>KUON TUTTI について見る</a>
          </p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div style={{ fontFamily: sans, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: '0.5rem' }}>
        Guest 投票 · アカウント不要
      </div>
      <h1 style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 400, margin: '0 0 0.3rem' }}>{event.title}</h1>
      <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: '0 0 0.8rem' }}>{ensemble.name}</p>
      {event.description && <p style={{ fontFamily: serif, fontSize: '0.92rem', lineHeight: 1.7, padding: '0.7rem', background: PAPER_DEEP, borderRadius: 3 }}>{event.description}</p>}

      <p style={{ fontFamily: sans, fontSize: '0.85rem', marginTop: '1.5rem' }}>
        <strong>{guestName}</strong> 様 ({guestEmail})<br />
        以下の候補日時から、参加可能な時間帯にチェックしてください。
      </p>

      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.7rem' }}>
        {event.candidates.map((c) => {
          const r = responses[c.id];
          return (
            <div key={c.id} style={{ padding: '0.8rem 1rem', background: PAPER_DEEP, border: `1px solid ${RULE}`, borderRadius: 3 }}>
              <div style={{ fontFamily: serif, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                📅 {new Date(c.start).toLocaleString('ja-JP')}
                <span style={{ color: INK_FAINT, fontSize: '0.85rem', marginLeft: '0.4rem' }}>〜 {new Date(c.end).toLocaleString('ja-JP', { hour: 'numeric', minute: 'numeric' })}</span>
                {c.location && <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, marginTop: '0.2rem' }}>📍 {c.location}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <Btn active={r === 'yes'} onClick={() => setResp(c.id, 'yes')} color="#2d5a1e">✓ 参加</Btn>
                <Btn active={r === 'maybe'} onClick={() => setResp(c.id, 'maybe')} color="#a86b3e">△ 不確定</Btn>
                <Btn active={r === 'no'} onClick={() => setResp(c.id, 'no')} color="#9c2828">✗ 不可</Btn>
              </div>
            </div>
          );
        })}
      </div>

      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="コメント (任意)" style={{ width: '100%', padding: '0.6rem', marginTop: '1rem', fontFamily: serif, fontSize: '0.88rem', background: PAPER, border: `1px solid ${RULE}`, borderRadius: 2 }} />

      {errorMsg && <div style={{ padding: '0.7rem 1rem', background: '#f8e6e0', color: '#7a2f1c', fontFamily: sans, fontSize: '0.85rem', marginTop: '1rem' }}>{errorMsg}</div>}

      <div style={{ marginTop: '1.2rem' }}>
        <button onClick={submit} disabled={saving || Object.keys(responses).length === 0} style={{ padding: '0.8rem 2rem', background: (saving || Object.keys(responses).length === 0) ? INK_FAINT : INK, color: PAPER, border: 'none', borderRadius: 2, fontFamily: serif, fontSize: '1rem', letterSpacing: '0.06em', cursor: (saving || Object.keys(responses).length === 0) ? 'not-allowed' : 'pointer' }}>
          {saving ? '送信中...' : '回答を送信'}
        </button>
      </div>

      <p style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, lineHeight: 1.7, marginTop: '2rem', borderTop: `1px solid ${RULE}`, paddingTop: '0.8rem' }}>
        🎻 KUON TUTTI カレンダー — 音楽家のためのリハーサル予約 / 空音開発<br />
        アカウントを作成すれば、複数のアンサンブルを管理できます。<br />
        <a href="/tutti-lp" style={{ color: ACCENT, textDecoration: 'underline' }}>KUON TUTTI について見る</a>
      </p>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ background: PAPER, minHeight: '100vh', color: INK, fontFamily: serif }}>
      <section style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 4vw, 3rem)' }}>
        {children}
      </section>
    </main>
  );
}

function Btn({ active, onClick, color, children }: { active: boolean; onClick: () => void; color: string; children: React.ReactNode }) {
  return <button onClick={onClick} style={{ flex: 1, padding: '0.6rem 0.7rem', background: active ? color : 'transparent', color: active ? '#fff' : color, border: `1.5px solid ${color}`, borderRadius: 2, fontFamily: serif, fontSize: '0.92rem', cursor: 'pointer' }}>{children}</button>;
}
