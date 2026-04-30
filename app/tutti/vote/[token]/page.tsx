'use client';

/**
 * Guest 投票ページ — アカウント不要・メールリンクからアクセス
 * 多言語対応 (ja/en/es/de/ko/pt) — メンバーが各国語で投票できる
 */
import { useState, useEffect, useCallback, use } from 'react';
import { useLang } from '@/context/LangContext';

const PAPER = '#fbfaf6';
const PAPER_DEEP = '#f0ece1';
const INK = '#1a1a1a';
const INK_FAINT = '#7a7575';
const ACCENT = '#7a3a4f';
const RULE = '#d8d2c2';
const serif = '"Shippori Mincho", "Noto Serif JP", "Times New Roman", serif';
const sans = '"Helvetica Neue", "Inter", "Hiragino Sans", system-ui, sans-serif';

type VoteResp = 'yes' | 'maybe' | 'no';
interface Cand { id: string; start: string; end: string; location?: string; }
interface Event { id: string; title: string; description?: string; candidates: Cand[]; status: string; }
interface Ensemble { name: string; type: string; }

type L = Partial<Record<string, string>> & { en: string };
const t = (m: L, lang: string): string => (m[lang] as string) || m.en;

export default function GuestVotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { lang } = useLang();
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

  const localeForDate = lang === 'ja' ? 'ja-JP' : lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : lang === 'ko' ? 'ko-KR' : lang === 'pt' ? 'pt-BR' : 'en-US';

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/tutti/guest-vote/${token}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || t({ ja: 'リンクが無効か期限切れです', en: 'Token invalid or expired', es: 'Enlace inválido o caducado', de: 'Link ungültig oder abgelaufen', ko: '링크가 유효하지 않거나 만료되었습니다', pt: 'Link inválido ou expirado' }, lang));
        return;
      }
      setEvent(data.event);
      setEnsemble(data.ensemble);
      setGuestEmail(data.guestEmail);
      setGuestName(data.guestName);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [token, lang]);

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
      if (!res.ok) {
        setErrorMsg(data.error || t({ ja: '送信に失敗しました', en: 'Submission failed', es: 'Error al enviar', de: 'Senden fehlgeschlagen', ko: '제출 실패', pt: 'Falha no envio' }, lang));
        return;
      }
      setSuccess(true);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Wrapper><p style={{ color: INK_FAINT, fontFamily: sans }}>{t({ ja: '読み込み中...', en: 'Loading...', es: 'Cargando...', de: 'Lädt...', ko: '로딩 중...', pt: 'Carregando...' }, lang)}</p></Wrapper>;
  if (errorMsg && !event) return <Wrapper><p style={{ color: '#7a2f1c', fontFamily: sans }}>{errorMsg}</p></Wrapper>;
  if (!event || !ensemble) return <Wrapper><p style={{ fontFamily: sans }}>Not found</p></Wrapper>;
  if (event.status !== 'polling') return <Wrapper><p style={{ fontFamily: serif, fontSize: '1.1rem' }}>{t({
    ja: 'この投票は既に締め切られています。',
    en: 'This poll has been closed.',
    es: 'Esta votación ya ha sido cerrada.',
    de: 'Diese Umfrage ist bereits geschlossen.',
    ko: '이 투표는 이미 마감되었습니다.',
    pt: 'Esta votação já foi encerrada.',
  }, lang)}</p></Wrapper>;

  if (success) {
    return (
      <Wrapper>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '3rem' }}>✓</div>
          <h1 style={{ fontFamily: serif, fontSize: '1.4rem', fontWeight: 400, marginTop: '1rem' }}>
            {t({ ja: '回答ありがとうございました', en: 'Thank you for your response', es: 'Gracias por su respuesta', de: 'Vielen Dank für Ihre Antwort', ko: '응답해 주셔서 감사합니다', pt: 'Obrigado pela sua resposta' }, lang)}
          </h1>
          <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, marginTop: '0.5rem' }}>
            {ensemble.name} / {event.title}<br />
            {t({
              ja: '最終確定が決まり次第メールでお知らせします。',
              en: 'You\'ll receive an email when the final time is locked.',
              es: 'Recibirá un email cuando se confirme la hora final.',
              de: 'Sie erhalten eine E-Mail, sobald die finale Zeit festgelegt ist.',
              ko: '최종 일정이 확정되면 이메일로 알려드립니다.',
              pt: 'Você receberá um email quando o horário final for confirmado.',
            }, lang)}
          </p>
          <p style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, marginTop: '1.5rem' }}>
            <a href="/tutti-lp" style={{ color: ACCENT, textDecoration: 'underline' }}>{t({ ja: 'KUON TUTTI について見る', en: 'About KUON TUTTI', es: 'Sobre KUON TUTTI', de: 'Über KUON TUTTI', ko: 'KUON TUTTI 정보', pt: 'Sobre KUON TUTTI' }, lang)}</a>
          </p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div style={{ fontFamily: sans, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: '0.5rem' }}>
        {t({ ja: 'Guest 投票 · アカウント不要', en: 'Guest Voting · No Account Required', es: 'Votación Invitado · Sin Cuenta', de: 'Gast-Abstimmung · Kein Konto Nötig', ko: '게스트 투표 · 계정 불필요', pt: 'Votação Convidado · Sem Conta' }, lang)}
      </div>
      <h1 style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 400, margin: '0 0 0.3rem' }}>{event.title}</h1>
      <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: '0 0 0.8rem' }}>{ensemble.name}</p>
      {event.description && <p style={{ fontFamily: serif, fontSize: '0.92rem', lineHeight: 1.7, padding: '0.7rem', background: PAPER_DEEP, borderRadius: 3 }}>{event.description}</p>}

      <p style={{ fontFamily: sans, fontSize: '0.85rem', marginTop: '1.5rem' }}>
        <strong>{guestName}</strong> ({guestEmail})<br />
        {t({
          ja: '以下の候補日時から、参加可能な時間帯にチェックしてください。',
          en: 'Please mark the slots when you can attend.',
          es: 'Por favor marque los horarios en los que puede asistir.',
          de: 'Bitte markieren Sie die Zeitfenster, an denen Sie teilnehmen können.',
          ko: '참석 가능한 시간대를 표시해 주세요.',
          pt: 'Marque os horários em que você pode participar.',
        }, lang)}
      </p>

      <div style={{ marginTop: '1.5rem', display: 'grid', gap: '0.7rem' }}>
        {event.candidates.map((c) => {
          const r = responses[c.id];
          return (
            <div key={c.id} style={{ padding: '0.8rem 1rem', background: PAPER_DEEP, border: `1px solid ${RULE}`, borderRadius: 3 }}>
              <div style={{ fontFamily: serif, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                📅 {new Date(c.start).toLocaleString(localeForDate)}
                <span style={{ color: INK_FAINT, fontSize: '0.85rem', marginLeft: '0.4rem' }}>〜 {new Date(c.end).toLocaleString(localeForDate, { hour: 'numeric', minute: 'numeric' })}</span>
                {c.location && <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, marginTop: '0.2rem' }}>📍 {c.location}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <Btn active={r === 'yes'} onClick={() => setResp(c.id, 'yes')} color="#2d5a1e">✓ {t({ ja: '参加', en: 'Yes', es: 'Sí', de: 'Ja', ko: '참석', pt: 'Sim' }, lang)}</Btn>
                <Btn active={r === 'maybe'} onClick={() => setResp(c.id, 'maybe')} color="#a86b3e">△ {t({ ja: '不確定', en: 'Maybe', es: 'Tal vez', de: 'Vielleicht', ko: '미정', pt: 'Talvez' }, lang)}</Btn>
                <Btn active={r === 'no'} onClick={() => setResp(c.id, 'no')} color="#9c2828">✗ {t({ ja: '不可', en: 'No', es: 'No', de: 'Nein', ko: '불가', pt: 'Não' }, lang)}</Btn>
              </div>
            </div>
          );
        })}
      </div>

      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
        placeholder={t({ ja: 'コメント (任意)', en: 'Comment (optional)', es: 'Comentario (opcional)', de: 'Kommentar (optional)', ko: '코멘트 (선택)', pt: 'Comentário (opcional)' }, lang)}
        style={{ width: '100%', padding: '0.6rem', marginTop: '1rem', fontFamily: serif, fontSize: '0.88rem', background: PAPER, border: `1px solid ${RULE}`, borderRadius: 2 }} />

      {errorMsg && <div style={{ padding: '0.7rem 1rem', background: '#f8e6e0', color: '#7a2f1c', fontFamily: sans, fontSize: '0.85rem', marginTop: '1rem' }}>{errorMsg}</div>}

      <div style={{ marginTop: '1.2rem' }}>
        <button onClick={submit} disabled={saving || Object.keys(responses).length === 0} style={{ padding: '0.8rem 2rem', background: (saving || Object.keys(responses).length === 0) ? INK_FAINT : INK, color: PAPER, border: 'none', borderRadius: 2, fontFamily: serif, fontSize: '1rem', letterSpacing: '0.06em', cursor: (saving || Object.keys(responses).length === 0) ? 'not-allowed' : 'pointer' }}>
          {saving ? t({ ja: '送信中...', en: 'Submitting...', es: 'Enviando...', de: 'Senden...', ko: '제출 중...', pt: 'Enviando...' }, lang) : t({ ja: '回答を送信', en: 'Submit response', es: 'Enviar respuesta', de: 'Antwort senden', ko: '응답 제출', pt: 'Enviar resposta' }, lang)}
        </button>
      </div>

      <p style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, lineHeight: 1.7, marginTop: '2rem', borderTop: `1px solid ${RULE}`, paddingTop: '0.8rem' }}>
        🎻 KUON TUTTI {t({ ja: 'カレンダー — 音楽家のためのリハ予約 / 空音開発', en: 'Calendar — Rehearsal scheduling for musicians / KUON R&D', es: 'Calendar — Programación de ensayos / KUON R&D', de: 'Calendar — Probenplanung für Musiker / KUON R&D', ko: 'Calendar — 음악가를 위한 리허설 일정 / KUON R&D', pt: 'Calendar — Agendamento para músicos / KUON R&D' }, lang)}<br />
        {t({
          ja: 'アカウントを作成すれば、複数のアンサンブルを管理できます。',
          en: 'Create an account to manage multiple ensembles.',
          es: 'Cree una cuenta para gestionar varios conjuntos.',
          de: 'Erstellen Sie ein Konto, um mehrere Ensembles zu verwalten.',
          ko: '계정을 만들면 여러 앙상블을 관리할 수 있습니다.',
          pt: 'Crie uma conta para gerenciar vários conjuntos.',
        }, lang)}<br />
        <a href="/tutti-lp" style={{ color: ACCENT, textDecoration: 'underline' }}>{t({ ja: 'KUON TUTTI について見る', en: 'About KUON TUTTI', es: 'Sobre KUON TUTTI', de: 'Über KUON TUTTI', ko: 'KUON TUTTI 정보', pt: 'Sobre KUON TUTTI' }, lang)}</a>
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
