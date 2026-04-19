'use client';

import { useEffect, useRef, useCallback } from 'react';
import type L_Type from 'leaflet';
import type { Lang } from '@/context/LangContext';

const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

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
  const months: Record<string, string[]> = {
    ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  };
  const m = months[lang] || months.en;
  return `${m[d.getMonth()]} ${d.getDate()}`;
}

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

interface EventsMapViewProps {
  events: EventData[];
  lang: Lang;
  loading: boolean;
}

export default function EventsMapView({ events, lang, loading }: EventsMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L_Type.Map | null>(null);
  const markersRef = useRef<L_Type.LayerGroup | null>(null);
  const leafletRef = useRef<typeof L_Type | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    (async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      leafletRef.current = L.default || L;
      const Lf = leafletRef.current;

      const map = Lf.map(mapRef.current!, {
        center: [35.68, 139.76],
        zoom: 5,
        zoomControl: true,
        attributionControl: true,
      });

      Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      markersRef.current = Lf.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    })();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when events change
  const updateMarkers = useCallback(() => {
    const Lf = leafletRef.current;
    if (!Lf || !markersRef.current || !mapInstanceRef.current) return;
    markersRef.current.clearLayers();

    events.forEach((ev) => {
      const typeInfo = EVENT_TYPES.find(t => t.id === ev.eventType);
      const emoji = typeInfo?.emoji || '📌';

      const icon = Lf.divIcon({
        html: `<div style="
          background: #fff;
          border: 2px solid ${ACCENT};
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          cursor: pointer;
        ">${emoji}</div>`,
        className: '',
        iconSize: [36, 36] as [number, number],
        iconAnchor: [18, 18] as [number, number],
      });

      const marker = Lf.marker([ev.lat, ev.lng], { icon });
      const genreLabel = GENRES.find(g => g.id === ev.genre);

      marker.bindPopup(`
        <div style="font-family: ${sans}; min-width: 200px; max-width: 280px;">
          <div style="font-size: 0.7rem; color: #999; margin-bottom: 4px;">
            ${emoji} ${typeInfo ? t3(typeInfo.label, lang) : ev.eventType}
            ${genreLabel ? ' / ' + t3(genreLabel.label, lang) : ''}
          </div>
          <div style="font-size: 1rem; font-weight: 600; color: #111; margin-bottom: 4px;">${ev.title}</div>
          <div style="font-size: 0.8rem; color: #555; margin-bottom: 4px;">
            ${formatDateDisplay(ev.date, lang)} ${ev.startTime}${ev.endTime ? ' - ' + ev.endTime : ''}
          </div>
          <div style="font-size: 0.8rem; color: #555; margin-bottom: 4px;">
            📍 ${ev.venueName}
          </div>
          ${ev.price ? `<div style="font-size: 0.8rem; color: #059669; font-weight: 600; margin-bottom: 4px;">${ev.price}</div>` : ''}
          ${ev.performers.length > 0 ? `<div style="font-size: 0.75rem; color: #777; margin-bottom: 6px;">
            ${ev.performers.map(p => p.name).join(', ')}
          </div>` : ''}
          <div style="display: flex; gap: 6px; align-items: center;">
            <span style="font-size: 0.7rem; color: #999;">❤️ ${ev.interestedCount}</span>
            <a href="/events/${ev.id}" style="font-size: 0.75rem; color: ${ACCENT}; text-decoration: none;">
              ${t3({ ja: '詳細', en: 'Details', es: 'Detalles' }, lang)} →
            </a>
          </div>
        </div>
      `, { maxWidth: 300 });

      marker.addTo(markersRef.current!);
    });

    if (events.length > 0 && mapInstanceRef.current) {
      const bounds = Lf.latLngBounds(events.map(e => [e.lat, e.lng] as [number, number]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [events, lang]);

  useEffect(() => { updateMarkers(); }, [updateMarkers]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: 'calc(100vh - 220px)', minHeight: 400 }} />
      <div style={{
        position: 'absolute', bottom: 20, left: 20, zIndex: 1000,
        background: '#fff', borderRadius: 8, padding: '0.5rem 1rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)', fontFamily: sans, fontSize: '0.8rem',
      }}>
        <span style={{ fontWeight: 600, color: ACCENT }}>{events.length}</span>
        <span style={{ color: '#666', marginLeft: 4 }}>
          {t3({ ja: '件のイベント', en: 'events', es: 'eventos' }, lang)}
        </span>
        {loading && <span style={{ color: '#999', marginLeft: 8 }}>...</span>}
      </div>
    </div>
  );
}
