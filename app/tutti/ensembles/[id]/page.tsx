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
interface RehearsalEvent { id: string; ensembleId: string; title: string; description?: string; candidates: EventCandidate[]; status: 'polling'|'locked'|'cancelled'; lockedCandidateId?: string; createdAt: string; seriesId?: string; seriesIndex?: number; seriesTotal?: number; attendance?: 'all-required'|'sections'; requiredSections?: string[]; }

type L = Partial<Record<string, string>> & { en: string };
const t = (m: L, lang: string): string => (m[lang] as string) || m.en;

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
  const [eMode, setEMode] = useState<'single' | 'repeat'>('single');
  const [eTitle, setETitle] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eCandidates, setECandidates] = useState<Array<{ start: string; end: string; location: string }>>([{ start: '', end: '', location: '' }]);
  const [eRepeatPattern, setERepeatPattern] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [eRepeatCount, setERepeatCount] = useState<number>(8);
  const [eAttendance, setEAttendance] = useState<'all-required' | 'sections'>('all-required');
  const [eRequiredSections, setERequiredSections] = useState<string[]>([]);
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
    if (!eTitle.trim()) { setErrorMsg(t({ ja: 'タイトルは必須です', en: 'Title is required', es: 'El título es obligatorio', de: 'Titel erforderlich', ko: '제목이 필요합니다', pt: 'Título obrigatório' }, lang)); return; }
    const valid = eCandidates.filter((c) => c.start && c.end);
    if (valid.length === 0) { setErrorMsg(t({ ja: '少なくとも 1 つの候補日時が必要です', en: 'At least one candidate slot required', es: 'Se requiere al menos un horario candidato', de: 'Mindestens ein Termin erforderlich', ko: '최소 하나의 후보 시간이 필요합니다', pt: 'Pelo menos um horário candidato necessário' }, lang)); return; }
    if (eMode === 'repeat' && valid.length !== 1) { setErrorMsg(t({ ja: '繰り返しイベントは 1 つの開始時刻のみ指定してください', en: 'Repeating events need exactly one start time', es: 'Los eventos repetidos requieren un solo horario inicial', de: 'Wiederholungstermine benötigen eine Startzeit', ko: '반복 일정은 시작 시각 하나만 지정하세요', pt: 'Eventos repetidos precisam de um horário inicial' }, lang)); return; }
    if (eAttendance === 'sections' && eRequiredSections.length === 0) { setErrorMsg(t({ ja: 'セクション招集モードでは少なくとも 1 セクション選択が必要です', en: 'Select at least 1 section', es: 'Selecciona al menos 1 sección', de: 'Mindestens 1 Stimmgruppe wählen', ko: '최소 1개 섹션 선택', pt: 'Selecione ao menos 1 seção' }, lang)); return; }
    setSubmitting(true); setErrorMsg('');
    try {
      const token = localStorage.getItem('kuon_token');
      const payload: any = {
        ensembleId: id,
        title: eTitle,
        description: eDesc,
        candidates: valid.map((c) => ({ start: new Date(c.start).toISOString(), end: new Date(c.end).toISOString(), location: c.location || undefined })),
        attendance: eAttendance,
        requiredSections: eAttendance === 'sections' ? eRequiredSections : undefined,
      };
      if (eMode === 'repeat') {
        payload.repeat = { pattern: eRepeatPattern, count: eRepeatCount };
      }
      const res = await fetch('/api/tutti/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || data.message || 'Create failed'); return; }
      setShowCreateEvent(false);
      setEMode('single'); setETitle(''); setEDesc(''); setECandidates([{ start: '', end: '', location: '' }]);
      setEAttendance('all-required'); setERequiredSections([]); setERepeatCount(8);
      load();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  // 繰り返しの予定日プレビュー (UI のみ・サーバ生成と同じロジック)
  function generateRepeatPreview(): string[] {
    if (eMode !== 'repeat' || !eCandidates[0].start) return [];
    const baseStart = new Date(eCandidates[0].start);
    if (isNaN(baseStart.getTime())) return [];
    const intervalDays = eRepeatPattern === 'weekly' ? 7 : eRepeatPattern === 'biweekly' ? 14 : 30;
    const total = Math.min(Math.max(eRepeatCount, 2), 52);
    const localeDate = lang === 'ja' ? 'ja-JP' : lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : lang === 'ko' ? 'ko-KR' : lang === 'pt' ? 'pt-BR' : 'en-US';
    const dates: string[] = [];
    for (let i = 0; i < total; i++) {
      const d = new Date(baseStart.getTime() + intervalDays * i * 24 * 60 * 60 * 1000);
      dates.push(d.toLocaleString(localeDate, { month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }));
    }
    return dates;
  }

  if (loading) return <main style={{ background: PAPER, minHeight: '100vh', padding: '3rem', fontFamily: serif }}>Loading...</main>;
  if (!ensemble) return <main style={{ background: PAPER, minHeight: '100vh', padding: '3rem', fontFamily: serif }}>Ensemble not found</main>;

  return (
    <main style={{ background: PAPER, minHeight: '100vh', color: INK, fontFamily: serif }}>
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <Link href="/tutti" style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, textDecoration: 'none' }}>← {t({ ja: 'すべてのアンサンブル', en: 'All ensembles', es: 'Todos los conjuntos', de: 'Alle Ensembles', ko: '모든 앙상블', pt: 'Todos os conjuntos' }, lang)}</Link>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${RULE}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', margin: 0, fontWeight: 400, letterSpacing: '0.04em' }}>{ensemble.name}</h1>
            {ensemble.description && <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: '0.4rem 0 0' }}>{ensemble.description}</p>}
            <p style={{ fontFamily: sans, fontSize: '0.75rem', color: INK_FAINT, margin: '0.5rem 0 0' }}>
              {ensemble.members.length} {t({ ja: '名のメンバー', en: 'members', es: 'miembros', de: 'Mitglieder', ko: '명의 멤버', pt: 'membros' }, lang)}
            </p>
          </div>
          <button onClick={() => setShowCreateEvent(true)} style={btnPrimary()}>
            + {t({ ja: '新しい予約 (リハ・本番)', en: 'New event', es: 'Nuevo evento', de: 'Neuer Termin', ko: '새 일정', pt: 'Novo evento' }, lang)}
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
                          <span style={{ fontFamily: serif, fontSize: '1.02rem' }}>
                            {ev.title}
                            {ev.seriesId && ev.seriesIndex && ev.seriesTotal && (
                              <span style={{ marginLeft: '0.5rem', fontFamily: sans, fontSize: '0.7rem', color: ACCENT, padding: '0.15rem 0.5rem', background: PAPER, border: `1px solid ${ACCENT}33`, borderRadius: 999, letterSpacing: '0.04em' }}>
                                🔁 {ev.seriesIndex}/{ev.seriesTotal}
                              </span>
                            )}
                            {ev.attendance === 'sections' && ev.requiredSections && ev.requiredSections.length > 0 && (
                              <span style={{ marginLeft: '0.4rem', fontFamily: sans, fontSize: '0.68rem', color: '#7e22ce', padding: '0.15rem 0.5rem', background: '#f3e8ff', borderRadius: 999, letterSpacing: '0.04em' }}>
                                👥 {ev.requiredSections.slice(0, 2).join(', ')}{ev.requiredSections.length > 2 && '...'}
                              </span>
                            )}
                          </span>
                          <span style={{ fontFamily: sans, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: locked ? ACCENT : INK_FAINT }}>
                            {locked ? t({ ja: '確定', en: 'LOCKED', es: 'CONFIRMADO', de: 'BESTÄTIGT', ko: '확정', pt: 'CONFIRMADO' }, lang) : ev.status === 'cancelled' ? t({ ja: 'キャンセル', en: 'CANCELLED', es: 'CANCELADO', de: 'STORNIERT', ko: '취소', pt: 'CANCELADO' }, lang) : t({ ja: '投票中', en: 'POLLING', es: 'VOTANDO', de: 'ABSTIMMUNG', ko: '투표 중', pt: 'VOTANDO' }, lang)}
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

      {/* Create Event Modal — 美しいリデザイン版 */}
      {showCreateEvent && (
        <div onClick={() => setShowCreateEvent(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 12, 10, 0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(0.5rem, 2vw, 1.5rem)', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          `}</style>
          <div onClick={(e) => e.stopPropagation()}
            style={{
              background: PAPER, padding: 0, maxWidth: 720, width: '100%', maxHeight: '94vh',
              overflow: 'hidden', borderRadius: 6, boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
              display: 'flex', flexDirection: 'column', animation: 'slideUp 0.25s ease',
            }}>
            {/* Modal Header */}
            <div style={{ padding: '1.5rem 1.8rem 1rem', borderBottom: `1px solid ${RULE}` }}>
              <div style={{ fontFamily: sans, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: ACCENT, marginBottom: '0.4rem' }}>
                {ensemble?.name}
              </div>
              <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.25rem, 2.4vw, 1.55rem)', fontWeight: 400, margin: 0, letterSpacing: '0.04em' }}>
                {t({ ja: '新しい予約', en: 'New Event', es: 'Nuevo Evento', de: 'Neuer Termin', ko: '새 일정', pt: 'Novo Evento' }, lang)}
              </h2>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem 1.8rem', overflowY: 'auto', flex: 1 }}>
              {/* タブ: 単発 / 繰り返し */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${RULE}`, marginBottom: '1.5rem' }}>
                <ModalTab active={eMode === 'single'} onClick={() => setEMode('single')}>
                  📅 {t({ ja: '単発予約', en: 'Single Event', es: 'Evento Único', de: 'Einzeltermin', ko: '단발 일정', pt: 'Evento Único' }, lang)}
                </ModalTab>
                <ModalTab active={eMode === 'repeat'} onClick={() => setEMode('repeat')}>
                  🔁 {t({ ja: '繰り返し予約', en: 'Repeating Series', es: 'Serie Repetida', de: 'Wiederkehrende Serie', ko: '반복 일정', pt: 'Série Repetida' }, lang)}
                </ModalTab>
              </div>

              {/* タイトル + 説明 */}
              <FormRow label={t({ ja: 'タイトル', en: 'Title', es: 'Título', de: 'Titel', ko: '제목', pt: 'Título' }, lang)}>
                <input type="text" value={eTitle} onChange={(e) => setETitle(e.target.value)} style={inputStyle()}
                  placeholder={t({ ja: '例: 第 7 番ベートーヴェン リハーサル', en: 'e.g. Beethoven 7 Rehearsal', es: 'Ej: Ensayo Beethoven 7', de: 'z.B. Beethoven 7 Probe', ko: '예: 베토벤 7번 리허설', pt: 'ex: Ensaio Beethoven 7' }, lang)} />
              </FormRow>
              <FormRow label={t({ ja: '説明 (任意)', en: 'Description (optional)', es: 'Descripción', de: 'Beschreibung', ko: '설명', pt: 'Descrição' }, lang)}>
                <textarea value={eDesc} onChange={(e) => setEDesc(e.target.value)} rows={2} style={{ ...inputStyle(), fontFamily: serif }} />
              </FormRow>

              {/* 候補日時 (single モードでは複数候補・repeat モードでは初回のみ) */}
              <div style={{ marginTop: '1.2rem' }}>
                <div style={{ fontFamily: sans, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  {eMode === 'repeat'
                    ? t({ ja: '初回の日時 (以降は自動生成)', en: 'First occurrence (rest auto-generated)', es: 'Primer evento', de: 'Erster Termin', ko: '첫 일정', pt: 'Primeiro evento' }, lang)
                    : t({ ja: '候補日時 (複数 OK・メンバーが投票)', en: 'Candidate slots (members vote)', es: 'Horarios candidatos', de: 'Terminvorschläge', ko: '후보 시간', pt: 'Horários candidatos' }, lang)}
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {(eMode === 'repeat' ? eCandidates.slice(0, 1) : eCandidates).map((c, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: '0.4rem', alignItems: 'center', padding: '0.5rem', background: PAPER_DEEP, borderRadius: 3, border: `1px solid ${RULE}` }}>
                      <DateTimeField value={c.start} onChange={(v) => updateCandidate(i, 'start', v)} label={t({ ja: '開始', en: 'Start', es: 'Inicio', de: 'Start', ko: '시작', pt: 'Início' }, lang)} />
                      <DateTimeField value={c.end} onChange={(v) => updateCandidate(i, 'end', v)} label={t({ ja: '終了', en: 'End', es: 'Fin', de: 'Ende', ko: '종료', pt: 'Fim' }, lang)} />
                      <input type="text" value={c.location} onChange={(e) => updateCandidate(i, 'location', e.target.value)}
                        placeholder={t({ ja: '場所 (例: 渋谷スタジオ)', en: 'Location (e.g. Studio A)', es: 'Lugar', de: 'Ort', ko: '장소', pt: 'Local' }, lang)}
                        style={{ ...inputStyle(), padding: '0.5rem 0.7rem', fontSize: '0.85rem' }} />
                      {eMode === 'single' && eCandidates.length > 1 && (
                        <button onClick={() => removeCandidate(i)} title={t({ ja: '削除', en: 'Remove' }, lang)}
                          style={{ padding: '0.4rem 0.7rem', background: 'transparent', border: `1px solid ${RULE}`, cursor: 'pointer', borderRadius: 2, color: INK_FAINT }}>✕</button>
                      )}
                      {eMode === 'repeat' && <div style={{ width: 0 }}></div>}
                    </div>
                  ))}
                </div>
                {eMode === 'single' && (
                  <button onClick={addCandidate} style={{ ...btnSecondary(), marginTop: '0.6rem', width: '100%' }}>
                    + {t({ ja: '候補日時を追加', en: 'Add another candidate', es: 'Añadir candidato', de: 'Termin hinzufügen', ko: '후보 추가', pt: 'Adicionar candidato' }, lang)}
                  </button>
                )}
              </div>

              {/* 繰り返し設定 */}
              {eMode === 'repeat' && (
                <div style={{ marginTop: '1.5rem', padding: '1rem 1.1rem', background: HIGHLIGHT, border: `1px solid ${ACCENT}33`, borderRadius: 3 }}>
                  <div style={{ fontFamily: sans, fontSize: '0.7rem', color: ACCENT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
                    🔁 {t({ ja: '繰り返しパターン', en: 'Repeat pattern', es: 'Patrón de repetición', de: 'Wiederholungsmuster', ko: '반복 패턴', pt: 'Padrão de repetição' }, lang)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.6rem' }}>
                    <select value={eRepeatPattern} onChange={(e) => setERepeatPattern(e.target.value as any)} style={inputStyle()}>
                      <option value="weekly">{t({ ja: '毎週', en: 'Weekly', es: 'Semanal', de: 'Wöchentlich', ko: '매주', pt: 'Semanal' }, lang)}</option>
                      <option value="biweekly">{t({ ja: '隔週', en: 'Bi-weekly', es: 'Quincenal', de: 'Zweiwöchentlich', ko: '격주', pt: 'Quinzenal' }, lang)}</option>
                      <option value="monthly">{t({ ja: '毎月', en: 'Monthly', es: 'Mensual', de: 'Monatlich', ko: '매월', pt: 'Mensal' }, lang)}</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input type="number" min={2} max={52} value={eRepeatCount} onChange={(e) => setERepeatCount(parseInt(e.target.value) || 8)} style={{ ...inputStyle(), textAlign: 'center' }} />
                      <span style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, whiteSpace: 'nowrap' }}>
                        {t({ ja: '回', en: 'times', es: 'veces', de: 'mal', ko: '회', pt: 'vezes' }, lang)}
                      </span>
                    </div>
                  </div>
                  {/* プレビュー */}
                  {generateRepeatPreview().length > 0 && (
                    <div style={{ marginTop: '0.8rem', padding: '0.7rem 0.9rem', background: PAPER, borderRadius: 2, fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, lineHeight: 1.85, maxHeight: 140, overflowY: 'auto' }}>
                      <div style={{ fontWeight: 600, color: INK, marginBottom: '0.3rem' }}>
                        {t({ ja: '生成される予定:', en: 'Will generate:', es: 'Se generarán:', de: 'Wird erzeugen:', ko: '생성될 일정:', pt: 'Serão gerados:' }, lang)}
                      </div>
                      <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
                        {generateRepeatPreview().slice(0, 12).map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                        {generateRepeatPreview().length > 12 && (
                          <li style={{ listStyle: 'none', color: INK_FAINT, marginTop: '0.2rem' }}>... {t({ ja: 'ほか', en: 'and', es: 'y', de: 'und', ko: '외', pt: 'e' }, lang)} {generateRepeatPreview().length - 12} {t({ ja: '回', en: 'more', es: 'más', de: 'weitere', ko: '회', pt: 'mais' }, lang)}</li>
                        )}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {/* セクション招集モード */}
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontFamily: sans, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                  👥 {t({ ja: '招集対象', en: 'Attendance', es: 'Asistencia', de: 'Teilnahme', ko: '소집 대상', pt: 'Presença' }, lang)}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem' }}>
                  <SegBtn active={eAttendance === 'all-required'} onClick={() => setEAttendance('all-required')}>
                    {t({ ja: '全員', en: 'All members', es: 'Todos', de: 'Alle', ko: '전원', pt: 'Todos' }, lang)}
                  </SegBtn>
                  <SegBtn active={eAttendance === 'sections'} onClick={() => setEAttendance('sections')} disabled={!ensemble || ensemble.sections.length === 0}>
                    {t({ ja: 'セクション指定', en: 'By sections', es: 'Por secciones', de: 'Nach Stimmgruppen', ko: '섹션별', pt: 'Por seções' }, lang)}
                  </SegBtn>
                </div>
                {eAttendance === 'sections' && ensemble && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.7rem', background: PAPER_DEEP, borderRadius: 3 }}>
                    {ensemble.sections.length === 0 ? (
                      <span style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT }}>
                        {t({ ja: 'このアンサンブルにはセクションが登録されていません', en: 'No sections defined for this ensemble', es: 'No hay secciones definidas', de: 'Keine Stimmgruppen definiert', ko: '섹션이 정의되지 않았습니다', pt: 'Nenhuma seção definida' }, lang)}
                      </span>
                    ) : ensemble.sections.map((s) => {
                      const checked = eRequiredSections.includes(s);
                      return (
                        <button key={s} onClick={() => setERequiredSections(checked ? eRequiredSections.filter((x) => x !== s) : [...eRequiredSections, s])}
                          style={{
                            padding: '0.4rem 0.85rem',
                            background: checked ? ACCENT : 'transparent',
                            color: checked ? '#fff' : INK,
                            border: `1.5px solid ${checked ? ACCENT : RULE}`,
                            borderRadius: 999, cursor: 'pointer',
                            fontFamily: sans, fontSize: '0.82rem', fontWeight: checked ? 600 : 400,
                            transition: 'all 0.15s ease',
                          }}>
                          {checked && '✓ '}{s}
                        </button>
                      );
                    })}
                  </div>
                )}
                {eAttendance === 'sections' && eRequiredSections.length > 0 && (
                  <p style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, marginTop: '0.5rem', lineHeight: 1.7 }}>
                    {t({
                      ja: '上記セクションのメンバーのみが必須参加。それ以外のメンバーには通知が届きますが任意参加扱いです。',
                      en: 'Only members in the selected sections are required. Others are notified but optional.',
                      es: 'Solo los miembros de las secciones seleccionadas son obligatorios. Los demás son opcionales.',
                      de: 'Nur Mitglieder der gewählten Stimmgruppen sind erforderlich.',
                      ko: '선택된 섹션의 멤버만 필수 참석. 나머지는 선택 참석.',
                      pt: 'Apenas membros das seções selecionadas são obrigatórios.',
                    }, lang)}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.8rem 1.4rem', borderTop: `1px solid ${RULE}`, background: PAPER_DEEP, display: 'flex', gap: '0.6rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={() => setShowCreateEvent(false)} style={btnSecondary()}>
                {t({ ja: 'キャンセル', en: 'Cancel', es: 'Cancelar', de: 'Abbrechen', ko: '취소', pt: 'Cancelar' }, lang)}
              </button>
              <button onClick={handleCreateEvent} disabled={submitting} style={btnPrimary(submitting)}>
                {submitting
                  ? t({ ja: '送信中...', en: 'Sending...', es: 'Enviando...', de: 'Senden...', ko: '전송 중...', pt: 'Enviando...' }, lang)
                  : eMode === 'repeat'
                    ? `🔁 ${t({ ja: 'シリーズを作成', en: 'Create Series', es: 'Crear Serie', de: 'Serie erstellen', ko: '시리즈 생성', pt: 'Criar Série' }, lang)} (${eRepeatCount})`
                    : t({ ja: '作成して全員に通知', en: 'Create & notify all', es: 'Crear y notificar', de: 'Erstellen & benachrichtigen', ko: '생성 및 알림', pt: 'Criar e notificar' }, lang)}
              </button>
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

function ModalTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      style={{
        flex: 1, padding: '0.85rem 1rem',
        background: 'transparent',
        color: active ? INK : INK_FAINT,
        border: 'none',
        borderBottom: active ? `2.5px solid ${ACCENT}` : '2.5px solid transparent',
        marginBottom: '-1px',
        fontFamily: serif, fontSize: '0.95rem',
        letterSpacing: '0.04em',
        cursor: 'pointer', transition: 'all 0.15s ease',
      }}>
      {children}
    </button>
  );
}

function SegBtn({ active, onClick, disabled, children }: { active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        flex: 1, padding: '0.55rem 1rem',
        background: active ? INK : 'transparent',
        color: active ? PAPER : (disabled ? INK_FAINT : INK),
        border: `1px solid ${active ? INK : RULE}`,
        borderRadius: 3,
        fontFamily: serif, fontSize: '0.85rem', letterSpacing: '0.04em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
      }}>
      {children}
    </button>
  );
}

function DateTimeField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: sans, fontSize: '0.62rem', color: INK_FAINT, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>{label}</div>
      <input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '0.45rem 0.5rem', fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem', color: INK, background: PAPER, border: `1px solid ${RULE}`, borderRadius: 2, outline: 'none' }} />
    </div>
  );
}
function inputStyle(): React.CSSProperties { return { width: '100%', padding: '0.55rem 0.75rem', fontFamily: sans, fontSize: '0.88rem', color: INK, background: PAPER, border: `1px solid ${RULE}`, borderRadius: 2, outline: 'none' }; }
function btnPrimary(disabled?: boolean): React.CSSProperties { return { padding: '0.65rem 1.3rem', background: disabled ? INK_FAINT : INK, color: PAPER, border: 'none', borderRadius: 2, fontFamily: serif, fontSize: '0.9rem', letterSpacing: '0.05em', cursor: disabled ? 'not-allowed' : 'pointer' }; }
function btnSecondary(): React.CSSProperties { return { padding: '0.55rem 1rem', background: 'transparent', color: INK, border: `1px solid ${RULE}`, borderRadius: 2, fontFamily: serif, fontSize: '0.85rem', cursor: 'pointer' }; }
