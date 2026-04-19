'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

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

const EVENT_TYPE_MAP: Record<string, { label: L3; emoji: string }> = {
  concert:      { label: { ja: 'コンサート',       en: 'Concert',        es: 'Concierto'          }, emoji: '🎵' },
  recital:      { label: { ja: 'リサイタル',       en: 'Recital',        es: 'Recital'            }, emoji: '🎹' },
  'jam-session': { label: { ja: 'ジャムセッション', en: 'Jam Session',    es: 'Jam Session'        }, emoji: '🎷' },
  workshop:     { label: { ja: 'ワークショップ',   en: 'Workshop',       es: 'Taller'             }, emoji: '🎓' },
  festival:     { label: { ja: 'フェスティバル',   en: 'Festival',       es: 'Festival'           }, emoji: '🎪' },
  'recital-exam': { label: { ja: '発表会',         en: 'Student Recital', es: 'Audición'          }, emoji: '🎓' },
  'open-mic':   { label: { ja: 'オープンマイク',   en: 'Open Mic',       es: 'Micrófono abierto'  }, emoji: '🎤' },
  other:        { label: { ja: 'その他',           en: 'Other',          es: 'Otro'               }, emoji: '📌' },
};

const GENRE_MAP: Record<string, L3> = {
  classical: { ja: 'クラシック', en: 'Classical', es: 'Clásica' },
  jazz:      { ja: 'ジャズ',     en: 'Jazz',      es: 'Jazz' },
  pop:       { ja: 'ポップス',   en: 'Pop',       es: 'Pop' },
  folk:      { ja: 'フォーク',   en: 'Folk',      es: 'Folk' },
  world:     { ja: 'ワールド',   en: 'World',     es: 'Mundo' },
  chamber:   { ja: '室内楽',     en: 'Chamber',   es: 'Cámara' },
  orchestra: { ja: 'オーケストラ', en: 'Orchestra', es: 'Orquesta' },
  choir:     { ja: '合唱',       en: 'Choir',     es: 'Coro' },
  'brass-band': { ja: '吹奏楽', en: 'Brass Band', es: 'Banda' },
  other:     { ja: 'その他',     en: 'Other',     es: 'Otro' },
};

function generateICalEvent(ev: EventData): string {
  const dtStart = ev.date.replace(/-/g, '') + (ev.startTime ? 'T' + ev.startTime.replace(':', '') + '00' : '');
  const dtEnd = ev.endTime ? ev.date.replace(/-/g, '') + 'T' + ev.endTime.replace(':', '') + '00' : '';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kuon R&D//Events//EN',
    'BEGIN:VEVENT', `DTSTART:${dtStart}`, dtEnd ? `DTEND:${dtEnd}` : '',
    `SUMMARY:${ev.title}`, `LOCATION:${ev.venueName}`,
    `DESCRIPTION:${ev.description || ev.title}`,
    `URL:https://kuon-rnd.com/events/${ev.id}`, `GEO:${ev.lat};${ev.lng}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

export default function EventDetailPage() {
  const { lang } = useLang();
  const params = useParams();
  const id = params.id as string;
  const mapRef = useRef<HTMLDivElement>(null);
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [interested, setInterested] = useState(false);
  const [intCount, setIntCount] = useState(0);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/auth/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data.event);
          setIntCount(data.event.interestedCount || 0);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [id]);

  // Mini map (dynamic import to avoid SSR window error)
  useEffect(() => {
    if (!mapRef.current || !event) return;
    let mapInstance: { remove: () => void } | null = null;

    (async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      const Lf = L.default || L;
      if (!mapRef.current) return;

      const map = Lf.map(mapRef.current, { center: [event.lat, event.lng], zoom: 15, zoomControl: false, dragging: false, scrollWheelZoom: false });
      mapInstance = map;
      Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OSM', maxZoom: 18,
      }).addTo(map);

      const icon = Lf.divIcon({
        html: `<div style="background:${ACCENT};width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        className: '', iconSize: [16, 16] as [number, number], iconAnchor: [8, 8] as [number, number],
      });
      Lf.marker([event.lat, event.lng], { icon }).addTo(map);
    })();

    return () => { if (mapInstance) mapInstance.remove(); };
  }, [event]);

  const handleInterested = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/auth/events/${id}/interested`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setInterested(data.interested);
        setIntCount(data.count);
      }
    } catch { /* user not logged in — redirect */ }
    setToggling(false);
  };

  const handleDownloadICal = () => {
    if (!event) return;
    const ical = generateICalEvent(event);
    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-zA-Z0-9\u3000-\u9FFF]/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: sans }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🎵</p>
        <p style={{ color: '#999' }}>{t3({ ja: 'イベントが見つかりません', en: 'Event not found', es: 'Evento no encontrado' }, lang)}</p>
        <Link href="/events" style={{ color: ACCENT, marginTop: '1rem', textDecoration: 'none' }}>
          ← {t3({ ja: 'イベント一覧', en: 'All Events', es: 'Todos los eventos' }, lang)}
        </Link>
      </div>
    );
  }

  const typeInfo = EVENT_TYPE_MAP[event.eventType] || EVENT_TYPE_MAP.other;
  const genreLabel = GENRE_MAP[event.genre];

  const cardStyle = { background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: '1.5rem' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 'clamp(1.5rem, 4vw, 3rem) 1rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Back link */}
        <Link href="/events" style={{ fontFamily: sans, fontSize: '0.8rem', color: '#999', textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
          ← {t3({ ja: 'イベント一覧', en: 'All Events', es: 'Todos los eventos' }, lang)}
        </Link>

        {/* Main card */}
        <div style={cardStyle}>
          {/* Type & Genre tags */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: sans, fontSize: '0.7rem', color: ACCENT, background: '#eff6ff', padding: '3px 10px', borderRadius: 20 }}>
              {typeInfo.emoji} {t3(typeInfo.label, lang)}
            </span>
            {genreLabel && (
              <span style={{ fontFamily: sans, fontSize: '0.7rem', color: '#7c3aed', background: '#f5f3ff', padding: '3px 10px', borderRadius: 20 }}>
                {t3(genreLabel, lang)}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 3.5vw, 1.8rem)', fontWeight: 400, color: '#111', letterSpacing: '0.05em', marginBottom: '1rem', lineHeight: 1.4 }}>
            {event.title}
          </h1>

          {/* Date & Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
            <span style={{ fontFamily: sans, fontSize: '1rem', fontWeight: 600, color: ACCENT }}>
              {event.date}
            </span>
            <span style={{ fontFamily: sans, fontSize: '0.9rem', color: '#555' }}>
              {event.startTime}{event.endTime && ` - ${event.endTime}`}
            </span>
          </div>

          {/* Venue */}
          <div style={{ fontFamily: sans, fontSize: '0.9rem', color: '#333', marginBottom: '0.3rem' }}>
            📍 {event.venueName}
          </div>
          {event.venueAddress && (
            <div style={{ fontFamily: sans, fontSize: '0.8rem', color: '#888', marginBottom: '0.8rem' }}>
              {event.venueAddress}
            </div>
          )}

          {/* Price */}
          {event.price && (
            <div style={{ fontFamily: sans, fontSize: '1rem', fontWeight: 600, color: '#059669', marginBottom: '0.8rem' }}>
              {event.price}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <p style={{ fontFamily: sans, fontSize: '0.9rem', color: '#555', lineHeight: 1.8, marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
              {event.description}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button onClick={handleInterested} disabled={toggling}
              style={{
                fontFamily: sans, fontSize: '0.85rem', cursor: toggling ? 'wait' : 'pointer',
                color: interested ? '#fff' : '#dc2626', background: interested ? '#dc2626' : '#fff',
                border: '2px solid #dc2626', borderRadius: 50, padding: '0.5rem 1.2rem', fontWeight: 600,
              }}>
              ❤️ {interested
                ? t3({ ja: '気になる取消', en: 'Not interested', es: 'No interesado' }, lang)
                : t3({ ja: '気になる', en: 'Interested', es: 'Me interesa' }, lang)
              } ({intCount})
            </button>
            <button onClick={handleDownloadICal}
              style={{
                fontFamily: sans, fontSize: '0.85rem', cursor: 'pointer',
                color: '#666', background: '#f1f5f9', border: '1px solid #ddd',
                borderRadius: 50, padding: '0.5rem 1.2rem',
              }}>
              📅 {t3({ ja: 'カレンダーに追加', en: 'Add to Calendar', es: 'Agregar al calendario' }, lang)}
            </button>
          </div>
        </div>

        {/* Performers card */}
        {event.performers.length > 0 && (
          <div style={cardStyle}>
            <h2 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, color: '#111', marginBottom: '1rem' }}>
              {t3({ ja: '出演者', en: 'Performers', es: 'Artistas' }, lang)}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {event.performers.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  {p.email && p.hasAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/auth/avatar/${encodeURIComponent(p.email)}`} alt=""
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                  ) : (
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: sans, fontSize: '1rem', color: '#94a3b8',
                    }}>
                      {(p.name || '?')[0]}
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: sans, fontSize: '0.9rem', fontWeight: 600, color: '#111' }}>
                      {p.userName || p.name}
                    </div>
                    {p.role && <div style={{ fontFamily: sans, fontSize: '0.75rem', color: '#999' }}>{p.role}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map card */}
        <div style={cardStyle}>
          <h2 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, color: '#111', marginBottom: '1rem' }}>
            {t3({ ja: '会場', en: 'Venue', es: 'Lugar' }, lang)}
          </h2>
          <div ref={mapRef} style={{ width: '100%', height: 250, borderRadius: 8, overflow: 'hidden' }} />
          <a href={`https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`}
            target="_blank" rel="noopener"
            style={{ display: 'inline-block', marginTop: '0.8rem', fontFamily: sans, fontSize: '0.8rem', color: ACCENT, textDecoration: 'none' }}>
            {t3({ ja: 'Google マップで開く →', en: 'Open in Google Maps →', es: 'Abrir en Google Maps →' }, lang)}
          </a>
        </div>

        {/* Share section */}
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ fontFamily: sans, fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem' }}>
            {t3({ ja: 'このイベントをシェア', en: 'Share this event', es: 'Compartir este evento' }, lang)}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(`https://kuon-rnd.com/events/${event.id}`)}`}
              target="_blank" rel="noopener"
              style={{ fontFamily: sans, fontSize: '0.8rem', color: '#fff', background: '#000', borderRadius: 8, padding: '0.4rem 1rem', textDecoration: 'none' }}>
              X
            </a>
            <button onClick={() => { navigator.clipboard.writeText(`https://kuon-rnd.com/events/${event.id}`); }}
              style={{ fontFamily: sans, fontSize: '0.8rem', color: '#666', background: '#f1f5f9', border: '1px solid #ddd', borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer' }}>
              {t3({ ja: 'URLコピー', en: 'Copy URL', es: 'Copiar URL' }, lang)}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
