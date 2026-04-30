'use client';

/**
 * KUON TUTTI カレンダー — メインハブ
 * 自分が所属するアンサンブル一覧 + 新規作成
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/AuthGate';
import { useLang } from '@/context/LangContext';

const PAPER = '#fbfaf6';
const PAPER_DEEP = '#f0ece1';
const INK = '#1a1a1a';
const INK_FAINT = '#7a7575';
const ACCENT = '#7a3a4f';      // ワインレッド (オーケストラホールの座席色)
const RULE = '#d8d2c2';
const HIGHLIGHT = '#fdf6e8';

const serif = '"Shippori Mincho", "Noto Serif JP", "Times New Roman", serif';
const sans = '"Helvetica Neue", "Inter", "Hiragino Sans", system-ui, sans-serif';

interface Ensemble {
  id: string;
  name: string;
  type: string;
  description?: string;
  ownerEmail: string;
  members: Array<{ email: string; name: string; role: string; section?: string; instrument?: string }>;
  sections: string[];
  createdAt: string;
  updatedAt: string;
}

const t = <T extends Record<string, string>>(m: T, lang: string): string => {
  const k = lang as keyof T;
  return (m[k] as string) || (m['ja'] as string) || (m['en'] as string) || '';
};

export default function TuttiPage() {
  return (
    <AuthGate appName="tutti" strict={false}>
      <TuttiHub />
    </AuthGate>
  );
}

function TuttiHub() {
  const { lang } = useLang();
  const [ensembles, setEnsembles] = useState<Ensemble[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [fName, setFName] = useState('');
  const [fType, setFType] = useState<'orchestra' | 'chamber' | 'choir' | 'band' | 'duo' | 'recital' | 'other'>('chamber');
  const [fDesc, setFDesc] = useState('');
  const [fSections, setFSections] = useState('');
  const [fMembers, setFMembers] = useState(''); // 改行区切り「name | email | section | instrument」
  const [submitting, setSubmitting] = useState(false);

  const loadEnsembles = useCallback(async () => {
    try {
      const token = localStorage.getItem('kuon_token');
      if (!token) return;
      const res = await fetch('/api/tutti/ensembles', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.ok) setEnsembles(data.ensembles || []);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEnsembles(); }, [loadEnsembles]);

  async function handleCreate() {
    if (!fName.trim()) {
      setErrorMsg(t({ ja: 'アンサンブル名は必須です', en: 'Name required' }, lang));
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const sections = fSections.split(/[,、\n]/).map((s) => s.trim()).filter(Boolean);
      const members = fMembers.split('\n').map((line) => {
        const [name, email, section, instrument] = line.split('|').map((s) => s.trim());
        if (!email || !name) return null;
        return { name, email, section, instrument };
      }).filter(Boolean) as Array<{ name: string; email: string; section?: string; instrument?: string }>;

      const token = localStorage.getItem('kuon_token');
      const res = await fetch('/api/tutti/ensembles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: fName, type: fType, description: fDesc, sections, members }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.error === 'FREE_ENSEMBLE_LIMIT_EXCEEDED') {
          setErrorMsg(data.message);
        } else {
          setErrorMsg(data.error || data.message || 'Create failed');
        }
        return;
      }
      setShowCreate(false);
      setFName(''); setFDesc(''); setFSections(''); setFMembers('');
      loadEnsembles();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ background: PAPER, minHeight: '100vh', color: INK, fontFamily: serif }}>
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${RULE}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', margin: 0, fontWeight: 400, letterSpacing: '0.04em' }}>
              {t({ ja: 'TUTTI ── みんなの予定を、ひとつに。', en: 'TUTTI — everyone\'s schedule, in one place.' }, lang)}
            </h1>
            <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: '0.5rem 0 0' }}>
              {t({ ja: 'リハーサル・本番・打合せの調整をスマートに', en: 'Smart scheduling for rehearsals, concerts, and meetings' }, lang)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setShowCreate(true)} style={btnPrimary()}>
              + {t({ ja: '新しいアンサンブル', en: 'New Ensemble' }, lang)}
            </button>
            <Link href="/tutti-lp" style={{ ...btnSecondary(), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              {t({ ja: '使い方', en: 'How it works' }, lang)}
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.7rem 1rem', background: '#f8e6e0', color: '#7a2f1c', fontFamily: sans, fontSize: '0.85rem', borderRadius: 2, marginBottom: '1rem' }}>{errorMsg}</div>
        )}

        {loading ? (
          <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT }}>{t({ ja: '読み込み中...', en: 'Loading...' }, lang)}</p>
        ) : ensembles.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: PAPER_DEEP, borderRadius: 4, border: `1px solid ${RULE}` }}>
            <p style={{ fontFamily: serif, fontSize: '1.1rem', color: INK, margin: '0 0 0.5rem' }}>
              {t({ ja: 'まだアンサンブルがありません', en: 'No ensembles yet' }, lang)}
            </p>
            <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: '0 0 1.5rem' }}>
              {t({ ja: '上の「+ 新しいアンサンブル」から始めましょう', en: 'Click "+ New Ensemble" to begin' }, lang)}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {ensembles.map((e) => (
              <Link
                key={e.id}
                href={`/tutti/ensembles/${e.id}`}
                style={{ display: 'block', padding: '1.2rem', background: PAPER_DEEP, border: `1px solid ${RULE}`, borderLeft: `3px solid ${ACCENT}`, borderRadius: 3, textDecoration: 'none', color: INK, transition: 'background 0.2s' }}
              >
                <div style={{ fontFamily: sans, fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT, marginBottom: '0.3rem' }}>
                  {ensembleTypeLabel(e.type, lang)}
                </div>
                <div style={{ fontFamily: serif, fontSize: '1.15rem', fontWeight: 400 }}>{e.name}</div>
                {e.description && (
                  <div style={{ fontFamily: sans, fontSize: '0.8rem', color: INK_FAINT, marginTop: '0.3rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {e.description}
                  </div>
                )}
                <div style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, marginTop: '0.6rem' }}>
                  {e.members.length} {t({ ja: '名のメンバー', en: 'members' }, lang)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Create Modal */}
      {showCreate && (
        <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 12, 10, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: PAPER, padding: 'clamp(1.5rem, 3vw, 2rem)', maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto', borderRadius: 4 }}>
            <h2 style={{ fontFamily: serif, fontSize: '1.3rem', fontWeight: 400, margin: '0 0 1.2rem' }}>
              {t({ ja: 'アンサンブルを作成', en: 'Create Ensemble' }, lang)}
            </h2>
            <Field label={t({ ja: 'アンサンブル名', en: 'Name' }, lang)}>
              <input type="text" value={fName} onChange={(e) => setFName(e.target.value)} style={inputStyle()} placeholder="例: 青葉室内合奏団" />
            </Field>
            <Field label={t({ ja: '種別', en: 'Type' }, lang)}>
              <select value={fType} onChange={(e) => setFType(e.target.value as any)} style={inputStyle()}>
                <option value="orchestra">{t({ ja: 'オーケストラ', en: 'Orchestra' }, lang)}</option>
                <option value="chamber">{t({ ja: '室内楽', en: 'Chamber' }, lang)}</option>
                <option value="choir">{t({ ja: '合唱団', en: 'Choir' }, lang)}</option>
                <option value="band">{t({ ja: 'バンド', en: 'Band' }, lang)}</option>
                <option value="duo">{t({ ja: 'デュオ', en: 'Duo' }, lang)}</option>
                <option value="recital">{t({ ja: 'リサイタル', en: 'Recital' }, lang)}</option>
                <option value="other">{t({ ja: 'その他', en: 'Other' }, lang)}</option>
              </select>
            </Field>
            <Field label={t({ ja: '説明 (任意)', en: 'Description (optional)' }, lang)}>
              <textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} rows={2} style={{ ...inputStyle(), fontFamily: serif }} />
            </Field>
            <Field label={t({ ja: 'セクション (任意・カンマ or 改行区切り)', en: 'Sections (optional, comma or newline)' }, lang)}>
              <input type="text" value={fSections} onChange={(e) => setFSections(e.target.value)} style={inputStyle()} placeholder="例: 1st violins, 2nd violins, violas, cellos" />
            </Field>
            <Field label={t({ ja: 'メンバー (1 行 1 名・「名前 | メール | セクション | 楽器」)', en: 'Members (one per line: "Name | email | section | instrument")' }, lang)}>
              <textarea value={fMembers} onChange={(e) => setFMembers(e.target.value)} rows={5} style={{ ...inputStyle(), fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem' }} placeholder={'山田太郎 | yamada@example.com | 1st violins | violin\n佐藤花子 | sato@example.com | violas | viola'} />
            </Field>
            <p style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, lineHeight: 1.7, marginTop: '0.5rem' }}>
              {t({ ja: 'メンバーには招待メールが送信されます。アカウントが無くてもメールリンクから投票できます。', en: 'Invitation emails will be sent. Members can vote via email links without creating accounts.' }, lang)}
            </p>
            <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.6rem' }}>
              <button onClick={handleCreate} disabled={submitting} style={btnPrimary(submitting)}>
                {submitting ? t({ ja: '作成中...', en: 'Creating...' }, lang) : t({ ja: '作成して招待', en: 'Create & Invite' }, lang)}
              </button>
              <button onClick={() => setShowCreate(false)} style={btnSecondary()}>
                {t({ ja: 'キャンセル', en: 'Cancel' }, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ensembleTypeLabel(type: string, lang: string) {
  const m: Record<string, { ja: string; en: string }> = {
    orchestra: { ja: 'オーケストラ', en: 'Orchestra' },
    chamber: { ja: '室内楽', en: 'Chamber' },
    choir: { ja: '合唱団', en: 'Choir' },
    band: { ja: 'バンド', en: 'Band' },
    duo: { ja: 'デュオ', en: 'Duo' },
    recital: { ja: 'リサイタル', en: 'Recital' },
    other: { ja: 'その他', en: 'Other' },
  };
  return t(m[type] || m.other, lang);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: '0.8rem' }}>
      <div style={{ fontFamily: sans, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{label}</div>
      {children}
    </label>
  );
}
function inputStyle(): React.CSSProperties {
  return { width: '100%', padding: '0.6rem 0.8rem', fontFamily: sans, fontSize: '0.92rem', color: INK, background: PAPER, border: `1px solid ${RULE}`, borderRadius: 2, outline: 'none' };
}
function btnPrimary(disabled?: boolean): React.CSSProperties {
  return { padding: '0.7rem 1.4rem', background: disabled ? INK_FAINT : INK, color: PAPER, border: 'none', borderRadius: 2, fontFamily: serif, fontSize: '0.92rem', letterSpacing: '0.06em', cursor: disabled ? 'not-allowed' : 'pointer' };
}
function btnSecondary(): React.CSSProperties {
  return { padding: '0.65rem 1.2rem', background: 'transparent', color: INK, border: `1px solid ${RULE}`, borderRadius: 2, fontFamily: serif, fontSize: '0.88rem', cursor: 'pointer' };
}
