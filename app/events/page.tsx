'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const EventsMapView = dynamic(() => import('@/components/EventsMapView'), { ssr: false });

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface EventPerformer {
  name: string;
  role: string;
  email: string;
  userName?: string;
  hasAvatar?: boolean;
}

interface EventData {
  id: string;
  creatorEmail: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  lat: number;
  lng: number;
  price: string;
  eventType: string;
  genre: string;
  performers: EventPerformer[];
  interestedCount: number;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const EVENT_TYPES: { id: string; label: L3; emoji: string }[] = [
  { id: 'concert', label: { ja: 'コンサート', en: 'Concert', es: 'Concierto' }, emoji: '🎵' },
  { id: 'recital', label: { ja: 'リサイタル', en: 'Recital', es: 'Recital' }, emoji: '🎹' },
  { id: 'jam-session', label: { ja: 'ジャムセッション', en: 'Jam Session', es: 'Jam Session' }, emoji: '🎷' },
  { id: 'workshop', label: { ja: 'ワークショップ', en: 'Workshop', es: 'Taller' }, emoji: '🎓' },
  { id: 'festival', label: { ja: 'フェスティバル', en: 'Festival', es: 'Festival' }, emoji: '🎪' },
  { id: 'recital-exam', label: { ja: '発表会', en: 'Student Recital', es: 'Audición' }, emoji: '🎓' },
  { id: 'open-mic', label: { ja: 'オープンマイク', en: 'Open Mic', es: 'Micrófono abierto' }, emoji: '🎤' },
  { id: 'other', label: { ja: 'その他', en: 'Other', es: 'Otro' }, emoji: '📌' },
];

const GENRES: { id: string; label: L3 }[] = [
  { id: 'classical', label: { ja: 'クラシック', en: 'Classical', es: 'Clásica' } },
  { id: 'jazz', label: { ja: 'ジャズ', en: 'Jazz', es: 'Jazz' } },
  { id: 'pop', label: { ja: 'ポップス', en: 'Pop', es: 'Pop' } },
  { id: 'folk', label: { ja: 'フォーク', en: 'Folk', es: 'Folk' } },
  { id: 'world', label: { ja: 'ワールド', en: 'World', es: 'Mundo' } },
  { id: 'chamber', label: { ja: '室内楽', en: 'Chamber', es: 'Cámara' } },
  { id: 'orchestra', label: { ja: 'オーケストラ', en: 'Orchestra', es: 'Orquesta' } },
  { id: 'choir', label: { ja: '合唱', en: 'Choir', es: 'Coro' } },
  { id: 'brass-band', label: { ja: '吹奏楽', en: 'Brass Band', es: 'Banda' } },
  { id: 'other', label: { ja: 'その他', en: 'Other', es: 'Otro' } },
];

function formatDateDisplay(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr + 'T00:00:00');
  const months: Record<Lang, string[]> = {
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    pt: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  };
  const m = (months[lang] || months.en);
  return `${m[d.getMonth()]} ${d.getDate()}`;
}

function generateICalEvent(ev: EventData): string {
  const dtStart = ev.date.replace(/-/g, '') + (ev.startTime ? 'T' + ev.startTime.replace(':', '') + '00' : '');
  const dtEnd = ev.endTime ? ev.date.replace(/-/g, '') + 'T' + ev.endTime.replace(':', '') + '00' : '';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kuon R&D//Events//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    dtEnd ? `DTEND:${dtEnd}` : '',
    `SUMMARY:${ev.title}`,
    `LOCATION:${ev.venueName}${ev.venueAddress ? ', ' + ev.venueAddress : ''}`,
    `DESCRIPTION:${ev.description || ev.title}`,
    `URL:https://kuon-rnd.com/events/${ev.id}`,
    `GEO:${ev.lat};${ev.lng}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  return lines.join('\r\n');
}

function downloadICal(ev: EventData) {
  const ical = generateICalEvent(ev);
  const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${ev.title.replace(/[^a-zA-Z0-9\u3000-\u9FFF]/g, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function EventsPage() {
  const { lang } = useLang();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [dateRange, setDateRange] = useState(7);
  const [genreFilter, setGenreFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [listMode, setListMode] = useState(false);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        range: String(dateRange),
        ...(genreFilter && { genre: genreFilter }),
        ...(typeFilter && { eventType: typeFilter }),
      });
      const res = await fetch(`/api/auth/events?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [selectedDate, dateRange, genreFilter, typeFilter]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Date navigation
  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  };

  const isToday = selectedDate === (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const pillStyle = (active: boolean) => ({
    padding: '0.35rem 0.8rem', borderRadius: 20, fontSize: '0.75rem', fontFamily: sans,
    cursor: 'pointer', border: active ? `2px solid ${ACCENT}` : '1px solid #ddd',
    background: active ? '#eff6ff' : '#fff', color: active ? ACCENT : '#666',
    fontWeight: active ? 600 : 400 as number,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* ─── Header Bar ─── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0.8rem 1rem',
        position: 'sticky', top: 0, zIndex: 1000,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
              <h1 style={{ fontFamily: serif, fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', fontWeight: 400, color: '#111', letterSpacing: '0.08em', margin: 0 }}>
                {t3({ ja: "Today's Live", en: "Today's Live", es: "En Vivo Hoy" }, lang)}
              </h1>
              <span style={{ fontFamily: sans, fontSize: '0.7rem', color: '#999' }}>
                {t3({ ja: '空音開発', en: 'Kuon R&D', es: 'Kuon R&D' }, lang)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button onClick={() => setListMode(!listMode)} style={{
                fontFamily: sans, fontSize: '0.75rem', color: '#666', background: '#f1f5f9',
                border: 'none', borderRadius: 6, padding: '0.35rem 0.7rem', cursor: 'pointer',
              }}>
                {listMode
                  ? t3({ ja: '地図表示', en: 'Map', es: 'Mapa' }, lang)
                  : t3({ ja: 'リスト表示', en: 'List', es: 'Lista' }, lang)}
              </button>
              <Link href="/" style={{ fontFamily: sans, fontSize: '0.7rem', color: '#999', textDecoration: 'none' }}>
                {t3({ ja: 'トップ', en: 'Home', es: 'Inicio' }, lang)}
              </Link>
            </div>
          </div>

          {/* Date navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            <button onClick={() => shiftDate(-1)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>←</button>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              style={{ fontFamily: sans, fontSize: '0.8rem', border: '1px solid #ddd', borderRadius: 6, padding: '0.3rem 0.5rem' }} />
            <button onClick={() => shiftDate(1)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>→</button>
            {!isToday && (
              <button onClick={() => { const d = new Date(); setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`); }}
                style={{ fontFamily: sans, fontSize: '0.7rem', color: ACCENT, background: 'none', border: `1px solid ${ACCENT}`, borderRadius: 20, padding: '0.25rem 0.6rem', cursor: 'pointer' }}>
                {t3({ ja: '今日', en: 'Today', es: 'Hoy' }, lang)}
              </button>
            )}
            <select value={dateRange} onChange={e => setDateRange(Number(e.target.value))}
              style={{ fontFamily: sans, fontSize: '0.75rem', border: '1px solid #ddd', borderRadius: 6, padding: '0.3rem 0.4rem', color: '#666' }}>
              <option value={1}>{t3({ ja: '1日', en: '1 Day', es: '1 Día' }, lang)}</option>
              <option value={7}>{t3({ ja: '7日間', en: '7 Days', es: '7 Días' }, lang)}</option>
              <option value={14}>{t3({ ja: '14日間', en: '14 Days', es: '14 Días' }, lang)}</option>
              <option value={30}>{t3({ ja: '30日間', en: '30 Days', es: '30 Días' }, lang)}</option>
            </select>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            <button onClick={() => setTypeFilter('')} style={pillStyle(typeFilter === '')}>
              {t3({ ja: '全タイプ', en: 'All Types', es: 'Todos' }, lang)}
            </button>
            {EVENT_TYPES.filter(t => t.id !== 'other').map(t => (
              <button key={t.id} onClick={() => setTypeFilter(typeFilter === t.id ? '' : t.id)} style={pillStyle(typeFilter === t.id)}>
                {t.emoji} {t3(t.label, lang)}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
            <button onClick={() => setGenreFilter('')} style={pillStyle(genreFilter === '')}>
              {t3({ ja: '全ジャンル', en: 'All Genres', es: 'Todos' }, lang)}
            </button>
            {GENRES.filter(g => g.id !== 'other').map(g => (
              <button key={g.id} onClick={() => setGenreFilter(genreFilter === g.id ? '' : g.id)} style={pillStyle(genreFilter === g.id)}>
                {t3(g.label, lang)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div style={{ position: 'relative' }}>
        {/* Map */}
        {!listMode && (
          <EventsMapView events={events} lang={lang} loading={loading} />
        )}

        {/* List Mode */}
        {listMode && (
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 1rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#999', fontFamily: sans }}>
                {t3({ ja: '読み込み中...', en: 'Loading...', es: 'Cargando...' }, lang)}
              </div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎵</div>
                <p style={{ fontFamily: sans, color: '#999', fontSize: '0.9rem' }}>
                  {t3({
                    ja: 'この期間にイベントはまだありません。Pro会員ならイベントを投稿できます。',
                    en: 'No events found for this period. Pro members can post events.',
                    es: 'No hay eventos en este período. Los miembros Pro pueden publicar eventos.',
                  }, lang)}
                </p>
                <Link href="/mypage" style={{
                  display: 'inline-block', marginTop: '1rem', fontFamily: sans, fontSize: '0.85rem',
                  color: ACCENT, textDecoration: 'none', border: `1px solid ${ACCENT}`,
                  borderRadius: 20, padding: '0.5rem 1.2rem',
                }}>
                  {t3({ ja: 'マイページへ', en: 'Go to My Page', es: 'Ir a Mi Página' }, lang)}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {events.map(ev => {
                  const typeInfo = EVENT_TYPES.find(t => t.id === ev.eventType);
                  const genreInfo = GENRES.find(g => g.id === ev.genre);
                  return (
                    <div key={ev.id} style={{
                      background: '#fff', borderRadius: 12, padding: '1.2rem',
                      boxShadow: '0 1px 8px rgba(0,0,0,0.06)', cursor: 'pointer',
                      border: selectedEvent?.id === ev.id ? `2px solid ${ACCENT}` : '1px solid transparent',
                    }} onClick={() => setSelectedEvent(ev)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontFamily: sans, fontSize: '0.7rem', color: '#999', marginBottom: 4 }}>
                            {typeInfo?.emoji} {typeInfo ? t3(typeInfo.label, lang) : ev.eventType}
                            {genreInfo && ` / ${t3(genreInfo.label, lang)}`}
                          </div>
                          <h3 style={{ fontFamily: sans, fontSize: '1rem', fontWeight: 600, color: '#111', margin: 0 }}>{ev.title}</h3>
                        </div>
                        <div style={{ fontFamily: sans, fontSize: '0.8rem', color: ACCENT, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatDateDisplay(ev.date, lang)} {ev.startTime}
                        </div>
                      </div>
                      <div style={{ fontFamily: sans, fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                        📍 {ev.venueName}{ev.venueAddress && ` — ${ev.venueAddress}`}
                      </div>
                      {ev.performers.length > 0 && (
                        <div style={{ fontFamily: sans, fontSize: '0.8rem', color: '#777', marginTop: '0.3rem' }}>
                          🎵 {ev.performers.map(p => p.name).join(', ')}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.6rem' }}>
                        {ev.price && <span style={{ fontFamily: sans, fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>{ev.price}</span>}
                        <span style={{ fontFamily: sans, fontSize: '0.75rem', color: '#999' }}>❤️ {ev.interestedCount}</span>
                        <Link href={`/events/${ev.id}`} onClick={e => e.stopPropagation()}
                          style={{ fontFamily: sans, fontSize: '0.75rem', color: ACCENT, textDecoration: 'none', marginLeft: 'auto' }}>
                          {t3({ ja: '詳細 →', en: 'Details →', es: 'Detalles →' }, lang)}
                        </Link>
                        <button onClick={(e) => { e.stopPropagation(); downloadICal(ev); }}
                          style={{ fontFamily: sans, fontSize: '0.7rem', color: '#888', background: '#f1f5f9', border: 'none', borderRadius: 4, padding: '0.2rem 0.5rem', cursor: 'pointer' }}>
                          📅 iCal
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ─── Bottom CTA ─── */}
      <div style={{
        textAlign: 'center', padding: '2rem 1rem', background: '#fff',
        borderTop: '1px solid #e2e8f0',
      }}>
        <p style={{ fontFamily: sans, fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
          {t3({
            ja: 'Pro会員なら、あなたのライブ情報を世界中に発信できます。',
            en: 'Pro members can share their live events with the world.',
            es: 'Los miembros Pro pueden compartir sus eventos en vivo con el mundo.',
          }, lang)}
        </p>
        <Link href="/mypage" style={{
          display: 'inline-block', fontFamily: sans, fontSize: '0.9rem',
          color: '#fff', background: ACCENT, textDecoration: 'none',
          borderRadius: 50, padding: '0.7rem 2rem',
        }}>
          {t3({ ja: 'イベントを投稿する', en: 'Post an Event', es: 'Publicar Evento' }, lang)}
        </Link>
      </div>
    </div>
  );
}
