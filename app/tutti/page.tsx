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

// 多言語対応 (ja/en/es/de/ko/pt) — en は必須・他言語は省略時 en にフォールバック
type L = Partial<Record<string, string>> & { en: string };
const t = (m: L, lang: string): string => (m[lang] as string) || m.en;

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
              {t({
                ja: 'TUTTI ── みんなの予定を、ひとつに。',
                en: 'TUTTI — everyone\'s schedule, in one place.',
                es: 'TUTTI — el horario de todos, en un solo lugar.',
                de: 'TUTTI — alle Termine, an einem Ort.',
                ko: 'TUTTI — 모두의 일정을, 하나로.',
                pt: 'TUTTI — a agenda de todos, em um só lugar.',
              }, lang)}
            </h1>
            <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: '0.5rem 0 0' }}>
              {t({
                ja: 'リハーサル・本番・打合せの調整をスマートに',
                en: 'Smart scheduling for rehearsals, concerts, and meetings',
                es: 'Programación inteligente de ensayos, conciertos y reuniones',
                de: 'Intelligente Planung für Proben, Konzerte und Treffen',
                ko: '리허설·공연·미팅 일정을 스마트하게',
                pt: 'Agendamento inteligente para ensaios, concertos e reuniões',
              }, lang)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setShowCreate(true)} style={btnPrimary()}>
              + {t({ ja: '新しいアンサンブル', en: 'New Ensemble', es: 'Nuevo Conjunto', de: 'Neues Ensemble', ko: '새 앙상블', pt: 'Novo Conjunto' }, lang)}
            </button>
            <Link href="/tutti-lp" style={{ ...btnSecondary(), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              {t({ ja: '使い方', en: 'How it works', es: 'Cómo funciona', de: 'Anleitung', ko: '사용 방법', pt: 'Como funciona' }, lang)}
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.7rem 1rem', background: '#f8e6e0', color: '#7a2f1c', fontFamily: sans, fontSize: '0.85rem', borderRadius: 2, marginBottom: '1rem' }}>{errorMsg}</div>
        )}

        {loading ? (
          <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT }}>{t({ ja: '読み込み中...', en: 'Loading...', es: 'Cargando...', de: 'Lädt...', ko: '로딩 중...', pt: 'Carregando...' }, lang)}</p>
        ) : ensembles.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: PAPER_DEEP, borderRadius: 4, border: `1px solid ${RULE}` }}>
            <p style={{ fontFamily: serif, fontSize: '1.1rem', color: INK, margin: '0 0 0.5rem' }}>
              {t({ ja: 'まだアンサンブルがありません', en: 'No ensembles yet', es: 'Aún no hay conjuntos', de: 'Noch keine Ensembles', ko: '아직 앙상블이 없습니다', pt: 'Ainda não há conjuntos' }, lang)}
            </p>
            <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: '0 0 1.5rem' }}>
              {t({ ja: '上の「+ 新しいアンサンブル」から始めましょう', en: 'Click "+ New Ensemble" to begin', es: 'Haz clic en "+ Nuevo Conjunto" para empezar', de: 'Klicken Sie auf "+ Neues Ensemble" zum Starten', ko: '상단의 "+ 새 앙상블" 버튼으로 시작하세요', pt: 'Clique em "+ Novo Conjunto" para começar' }, lang)}
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
                  {e.members.length} {t({ ja: '名のメンバー', en: 'members', es: 'miembros', de: 'Mitglieder', ko: '명의 멤버', pt: 'membros' }, lang)}
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
              {t({ ja: 'アンサンブルを作成', en: 'Create Ensemble', es: 'Crear Conjunto', de: 'Ensemble erstellen', ko: '앙상블 생성', pt: 'Criar Conjunto' }, lang)}
            </h2>
            <Field label={t({ ja: 'アンサンブル名', en: 'Name', es: 'Nombre', de: 'Name', ko: '이름', pt: 'Nome' }, lang)}>
              <input type="text" value={fName} onChange={(e) => setFName(e.target.value)} style={inputStyle()} placeholder="e.g. Aoba Chamber Ensemble" />
            </Field>
            <Field label={t({ ja: '種別', en: 'Type', es: 'Tipo', de: 'Typ', ko: '종류', pt: 'Tipo' }, lang)}>
              <select value={fType} onChange={(e) => setFType(e.target.value as any)} style={inputStyle()}>
                <option value="orchestra">{t({ ja: 'オーケストラ', en: 'Orchestra', es: 'Orquesta', de: 'Orchester', ko: '오케스트라', pt: 'Orquestra' }, lang)}</option>
                <option value="chamber">{t({ ja: '室内楽', en: 'Chamber', es: 'Cámara', de: 'Kammermusik', ko: '실내악', pt: 'Câmara' }, lang)}</option>
                <option value="choir">{t({ ja: '合唱団', en: 'Choir', es: 'Coro', de: 'Chor', ko: '합창단', pt: 'Coro' }, lang)}</option>
                <option value="band">{t({ ja: 'バンド', en: 'Band', es: 'Banda', de: 'Band', ko: '밴드', pt: 'Banda' }, lang)}</option>
                <option value="duo">{t({ ja: 'デュオ', en: 'Duo', es: 'Dúo', de: 'Duo', ko: '듀오', pt: 'Duo' }, lang)}</option>
                <option value="recital">{t({ ja: 'リサイタル', en: 'Recital', es: 'Recital', de: 'Recital', ko: '독주회', pt: 'Recital' }, lang)}</option>
                <option value="other">{t({ ja: 'その他', en: 'Other', es: 'Otro', de: 'Andere', ko: '기타', pt: 'Outro' }, lang)}</option>
              </select>
            </Field>
            <Field label={t({ ja: '説明 (任意)', en: 'Description (optional)', es: 'Descripción (opcional)', de: 'Beschreibung (optional)', ko: '설명 (선택)', pt: 'Descrição (opcional)' }, lang)}>
              <textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} rows={2} style={{ ...inputStyle(), fontFamily: serif }} />
            </Field>
            <Field label={t({ ja: 'セクション (任意・カンマ or 改行区切り)', en: 'Sections (optional, comma or newline)', es: 'Secciones (opcional, coma o salto)', de: 'Stimmgruppen (optional, Komma)', ko: '섹션 (선택, 쉼표 구분)', pt: 'Seções (opcional, vírgula)' }, lang)}>
              <input type="text" value={fSections} onChange={(e) => setFSections(e.target.value)} style={inputStyle()} placeholder="1st violins, 2nd violins, violas, cellos" />
            </Field>
            <Field label={t({ ja: 'メンバー (1 行 1 名・「名前 | メール | セクション | 楽器」)', en: 'Members (one per line: "Name | email | section | instrument")', es: 'Miembros (uno por línea: "Nombre | email | sección | instrumento")', de: 'Mitglieder (eine pro Zeile: "Name | E-Mail | Stimmgruppe | Instrument")', ko: '멤버 (한 줄에 한 명: "이름 | 이메일 | 섹션 | 악기")', pt: 'Membros (um por linha: "Nome | email | seção | instrumento")' }, lang)}>
              <textarea value={fMembers} onChange={(e) => setFMembers(e.target.value)} rows={5} style={{ ...inputStyle(), fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem' }} placeholder={'Maria Schmidt | maria@example.com | 1st violins | violin\nJohn Sato | sato@example.com | violas | viola'} />
            </Field>
            <p style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, lineHeight: 1.7, marginTop: '0.5rem' }}>
              {t({
                ja: 'メンバーには招待メールが送信されます。アカウントが無くてもメールリンクから投票できます。',
                en: 'Invitation emails will be sent. Members can vote via email links without creating accounts.',
                es: 'Se enviarán emails de invitación. Los miembros pueden votar desde el enlace sin crear cuenta.',
                de: 'Einladungs-E-Mails werden gesendet. Mitglieder können ohne Konto abstimmen.',
                ko: '초대 이메일이 전송됩니다. 멤버는 계정 없이 메일 링크로 투표할 수 있습니다.',
                pt: 'Emails de convite serão enviados. Membros podem votar pelo link sem criar conta.',
              }, lang)}
            </p>
            <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.6rem' }}>
              <button onClick={handleCreate} disabled={submitting} style={btnPrimary(submitting)}>
                {submitting ? t({ ja: '作成中...', en: 'Creating...', es: 'Creando...', de: 'Erstelle...', ko: '생성 중...', pt: 'Criando...' }, lang) : t({ ja: '作成して招待', en: 'Create & Invite', es: 'Crear e Invitar', de: 'Erstellen & Einladen', ko: '생성 및 초대', pt: 'Criar e Convidar' }, lang)}
              </button>
              <button onClick={() => setShowCreate(false)} style={btnSecondary()}>
                {t({ ja: 'キャンセル', en: 'Cancel', es: 'Cancelar', de: 'Abbrechen', ko: '취소', pt: 'Cancelar' }, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ensembleTypeLabel(type: string, lang: string) {
  const m: Record<string, L> = {
    orchestra: { ja: 'オーケストラ', en: 'Orchestra', es: 'Orquesta', de: 'Orchester', ko: '오케스트라', pt: 'Orquestra' },
    chamber: { ja: '室内楽', en: 'Chamber', es: 'Cámara', de: 'Kammermusik', ko: '실내악', pt: 'Câmara' },
    choir: { ja: '合唱団', en: 'Choir', es: 'Coro', de: 'Chor', ko: '합창단', pt: 'Coro' },
    band: { ja: 'バンド', en: 'Band', es: 'Banda', de: 'Band', ko: '밴드', pt: 'Banda' },
    duo: { ja: 'デュオ', en: 'Duo', es: 'Dúo', de: 'Duo', ko: '듀오', pt: 'Duo' },
    recital: { ja: 'リサイタル', en: 'Recital', es: 'Recital', de: 'Recital', ko: '독주회', pt: 'Recital' },
    other: { ja: 'その他', en: 'Other', es: 'Otro', de: 'Andere', ko: '기타', pt: 'Outro' },
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
