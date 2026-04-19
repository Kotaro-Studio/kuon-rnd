'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import spotsData from '@/data/soundmap.json';
import { AuthGate } from '@/components/AuthGate';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const MAPBOX_TOKEN = 'pk.eyJ1Ijoia290YXJvYXNhaGluYSIsImEiOiJjbW41Nnp2YXEwODZiMnJzNDhzbThyc2lhIn0.jCJovLADR9sMKYPlSoKgRg';
const AUDIO_BASE = 'https://kuon-rnd-audio-worker.369-1d5.workers.dev/api/audio';
const ACCENT = '#bda678';
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';

type L3 = Partial<Record<Lang, string>> & { en: string };

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface SoundSpot {
  id: string;
  name: string;
  location: string;
  locationEn: string;
  locationEs: string;
  lat: number;
  lng: number;
  description: string;
  descriptionEn: string;
  descriptionEs: string;
  file: string;
  mic: string;
  country: string;
  tags: string[];
  date: string;
  url: string;
  approved: boolean;
}

// ─────────────────────────────────────────────
// Sun position calculation
// ─────────────────────────────────────────────
function getSunPosition(): [number, number] {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  // Solar declination (approximate)
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));

  // Hour angle: sun is at longitude based on UTC time
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const sunLng = (12 - utcHours) * 15; // 15 degrees per hour

  return [sunLng, declination];
}

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T: Record<string, L3> = {
  pageTitle: {
    ja: '地球の音マップ',
    en: 'Sounds of the Earth',
    es: 'Sonidos de la Tierra',
  },
  pageSubtitle: {
    ja: '世界中のフィールド録音を、地図で聴く。',
    en: 'Listen to field recordings from around the world.',
    es: 'Escucha grabaciones de campo de todo el mundo.',
  },
  spots: {
    ja: '録音スポット',
    en: 'Recording Spots',
    es: 'Puntos de Grabación',
  },
  countries: {
    ja: 'ヶ国',
    en: ' Countries',
    es: ' Países',
  },
  listenHint: {
    ja: 'ピンをクリックして再生',
    en: 'Click a pin to play',
    es: 'Haz clic en un pin para reproducir',
  },
  nowPlaying: {
    ja: '再生中',
    en: 'Now Playing',
    es: 'Reproduciendo',
  },
  recBy: { ja: '録音: ', en: 'Rec: ', es: 'Grab: ' },
  stopBtn: { ja: '停止', en: 'Stop', es: 'Detener' },

  // Submit
  submitTitle: {
    ja: 'あなたの録音を投稿する',
    en: 'Submit Your Recording',
    es: 'Envía Tu Grabación',
  },
  submitDesc: {
    ja: '世界のどこかで録音した音を、地球の音マップに追加しませんか？\nフィールド録音、環境音、自然音 — あなただけが聴いた音を世界と共有しましょう。',
    en: 'Share your recording with the world on the Sounds of the Earth map.\nField recordings, ambient sounds, nature — share the sounds only you have heard.',
    es: 'Comparte tu grabación con el mundo en el mapa de Sonidos de la Tierra.\nGrabaciones de campo, sonidos ambientales — comparte los sonidos que solo tú has escuchado.',
  },
  fieldName: { ja: 'お名前', en: 'Your Name', es: 'Tu Nombre' },
  fieldEmail: { ja: 'メールアドレス', en: 'Email', es: 'Correo Electrónico' },
  fieldLocation: { ja: '録音場所', en: 'Recording Location', es: 'Ubicación de Grabación' },
  fieldLocationHint: { ja: '例: 北海道広尾町 フンベの滝', en: 'e.g. Trinity Beach, Queensland', es: 'ej. Playa Trinity, Queensland' },
  fieldDescription: { ja: '録音の説明', en: 'Description', es: 'Descripción' },
  fieldDescriptionHint: { ja: 'どんな音が聴こえますか？', en: 'What sounds can you hear?', es: '¿Qué sonidos puedes escuchar?' },
  fieldCoords: { ja: '座標（緯度, 経度）', en: 'Coordinates (Lat, Lng)', es: 'Coordenadas (Lat, Lng)' },
  fieldCoordsHint: { ja: '地図をクリックして座標を取得できます', en: 'Click the map to get coordinates', es: 'Haz clic en el mapa para obtener coordenadas' },
  fieldFile: { ja: 'MP3 ファイル（20MB以下）', en: 'MP3 File (max 20MB)', es: 'Archivo MP3 (máx. 20MB)' },
  fieldMic: { ja: '使用マイク（任意）', en: 'Microphone Used (optional)', es: 'Micrófono Usado (opcional)' },
  fieldUrl: { ja: 'あなたのサイト / SNS（任意）', en: 'Your Website / SNS (optional)', es: 'Tu Sitio Web / SNS (opcional)' },
  fieldPassword: { ja: '投稿パスワード', en: 'Submission Password', es: 'Contraseña de Envío' },
  fieldPasswordHint: { ja: '現在はマイクご購入者のみ投稿いただけます', en: 'Currently limited to microphone purchasers', es: 'Actualmente limitado a compradores de micrófonos' },
  submit: { ja: '投稿する', en: 'Submit', es: 'Enviar' },
  submitting: { ja: '送信中...', en: 'Submitting...', es: 'Enviando...' },
  submitSuccess: { ja: '投稿ありがとうございます！確認後に掲載いたします。', en: 'Thank you! Your recording will be published after review.', es: '¡Gracias! Tu grabación se publicará después de la revisión.' },
  submitError: { ja: '送信に失敗しました。もう一度お試しください。', en: 'Submission failed. Please try again.', es: 'Error al enviar. Inténtalo de nuevo.' },
  mapClickSet: { ja: '座標をセットしました', en: 'Coordinates set', es: 'Coordenadas establecidas' },
};

// ─────────────────────────────────────────────
// CSS injected
// ─────────────────────────────────────────────
const injectCSS = `
  @keyframes soundPulse {
    0% { box-shadow: 0 0 0 0 rgba(189,166,120,0.5); }
    70% { box-shadow: 0 0 0 16px rgba(189,166,120,0); }
    100% { box-shadow: 0 0 0 0 rgba(189,166,120,0); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .sound-pin {
    width: 20px; height: 20px; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #d4b98a, #bda678);
    border: 2.5px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  .sound-pin:hover { transform: scale(1.35); }
  .sound-pin.playing {
    animation: soundPulse 1.5s infinite;
    background: radial-gradient(circle at 35% 35%, #e8d5a8, #bda678);
  }
  .mapboxgl-popup-content {
    background: rgba(255,255,255,0.95) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(0,0,0,0.06) !important;
    border-radius: 14px !important;
    padding: 0 !important;
    box-shadow: 0 12px 48px rgba(0,0,0,0.12) !important;
    color: #1e293b !important;
    min-width: 260px;
    max-width: 320px;
  }
  .mapboxgl-popup-tip {
    border-top-color: rgba(255,255,255,0.95) !important;
  }
  .mapboxgl-popup-close-button {
    color: #94a3b8 !important; font-size: 18px !important;
    padding: 6px 10px !important; right: 2px !important; top: 2px !important;
  }
  .mapboxgl-popup-close-button:hover { color: #1e293b !important; background: transparent !important; }
  .sm-input {
    width: 100%; padding: 13px 16px; border-radius: 10px;
    border: 1px solid rgba(0,0,0,0.1); background: #fff;
    color: #1e293b; font-size: 0.9rem; font-family: ${sans};
    outline: none; transition: border-color 0.3s, box-shadow 0.3s;
  }
  .sm-input:focus { border-color: ${ACCENT}; box-shadow: 0 0 0 3px rgba(189,166,120,0.15); }
  .sm-input::placeholder { color: #94a3b8; }
`;

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function SoundMapPage() {
  const { lang } = useLang();
  const t = (key: string) => T[key]?.[lang] || T[key]?.ja || '';

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SoundSpot | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Form
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [coordMsg, setCoordMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const spots: SoundSpot[] = spotsData.filter((s: SoundSpot) => s.approved);
  const uniqueCountries = new Set(spots.map(s => s.country));

  const getLocation = useCallback((s: SoundSpot) => {
    if (lang === 'en') return s.locationEn || s.location;
    if (lang === 'es') return s.locationEs || s.location;
    return s.location;
  }, [lang]);

  const getDescription = useCallback((s: SoundSpot) => {
    if (lang === 'en') return s.descriptionEn || s.description;
    if (lang === 'es') return s.descriptionEs || s.description;
    return s.description;
  }, [lang]);

  // Play / stop
  const playSpot = useCallback((spot: SoundSpot) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (playingId === spot.id) { setPlayingId(null); setSelectedSpot(null); return; }
    const audio = new Audio(`${AUDIO_BASE}/${spot.file}`);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => { setPlayingId(null); setSelectedSpot(null); });
    audioRef.current = audio;
    setPlayingId(spot.id);
    setSelectedSpot(spot);
  }, [playingId]);

  // ── Init map ──
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const [sunLng, sunLat] = getSunPosition();

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [sunLng, sunLat],
      zoom: 1.8,
      projection: 'globe',
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('style.load', () => {
      // Atmosphere: realistic sky
      map.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6,
      });

      // Sun-based directional lighting for day/night
      const [sLng, sLat] = getSunPosition();
      map.setLight({
        anchor: 'map',
        position: [1.5, sLng, sLat],
        intensity: 0.4,
        color: '#fff',
      });

      setMapReady(true);
    });

    // Update sun position every minute
    const sunInterval = setInterval(() => {
      if (!mapRef.current) return;
      const [sLng, sLat] = getSunPosition();
      mapRef.current.setLight({
        anchor: 'map',
        position: [1.5, sLng, sLat],
        intensity: 0.4,
        color: '#fff',
      });
    }, 60000);

    // Click for coords
    map.on('click', (e) => {
      setFormLat(e.lngLat.lat.toFixed(4));
      setFormLng(e.lngLat.lng.toFixed(4));
      setCoordMsg(`${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}`);
      setTimeout(() => setCoordMsg(''), 3000);
    });

    mapRef.current = map;
    return () => { clearInterval(sunInterval); map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Markers ──
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    spots.forEach(spot => {
      const el = document.createElement('div');
      el.className = 'sound-pin';
      el.title = getLocation(spot);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        playSpot(spot);
        mapRef.current?.flyTo({ center: [spot.lng, spot.lat], zoom: 6, duration: 2000 });
        if (popupRef.current) popupRef.current.remove();
        const popup = new mapboxgl.Popup({ offset: 14, closeOnClick: true, maxWidth: '320px' })
          .setLngLat([spot.lng, spot.lat])
          .setHTML(`
            <div style="padding:18px;">
              <p style="font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;color:${ACCENT};margin:0 0 8px;font-family:${sans};">${spot.country}</p>
              <h3 style="font-size:1rem;font-weight:500;margin:0 0 6px;font-family:${serif};line-height:1.5;">${lang === 'en' ? (spot.locationEn || spot.location) : lang === 'es' ? (spot.locationEs || spot.location) : spot.location}</h3>
              <p style="font-size:0.78rem;color:#64748b;line-height:1.7;margin:0 0 12px;font-family:${sans};">${lang === 'en' ? (spot.descriptionEn || spot.description) : lang === 'es' ? (spot.descriptionEs || spot.description) : spot.description}</p>
              <div style="display:flex;align-items:center;gap:8px;font-size:0.68rem;color:#94a3b8;font-family:${sans};">
                <span style="background:rgba(189,166,120,0.12);color:${ACCENT};padding:3px 10px;border-radius:16px;font-size:0.65rem;">${spot.mic}</span>
                <span>${spot.name}</span>
              </div>
            </div>
          `)
          .addTo(mapRef.current!);
        popupRef.current = popup;
      });

      const marker = new mapboxgl.Marker({ element: el }).setLngLat([spot.lng, spot.lat]).addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [mapReady, spots, lang, playSpot, getLocation]);

  // Playing indicator
  useEffect(() => {
    document.querySelectorAll('.sound-pin').forEach(m => m.classList.remove('playing'));
    if (playingId) {
      const idx = spots.findIndex(s => s.id === playingId);
      const pins = document.querySelectorAll('.sound-pin');
      if (idx >= 0 && pins[idx]) pins[idx].classList.add('playing');
    }
  }, [playingId, spots]);

  useEffect(() => { return () => { if (audioRef.current) audioRef.current.pause(); }; }, []);

  // Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true); setSubmitResult(null);
    const fd = new FormData(e.currentTarget);
    fd.set('lat', formLat); fd.set('lng', formLng);
    try {
      const res = await fetch('/api/submit-sound', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) { setSubmitResult({ ok: true, msg: t('submitSuccess') }); (e.target as HTMLFormElement).reset(); setFormLat(''); setFormLng(''); }
      else setSubmitResult({ ok: false, msg: data.error || t('submitError') });
    } catch { setSubmitResult({ ok: false, msg: t('submitError') }); }
    finally { setSubmitting(false); }
  };

  return (
    <AuthGate appName="soundmap">
    <>
      <style dangerouslySetInnerHTML={{ __html: injectCSS }} />
      <div style={{ minHeight: '100vh', background: '#fafafa', color: '#1e293b' }}>

        {/* ── Title Bar ── */}
        <section style={{
          padding: 'clamp(6rem,10vw,9rem) 5% clamp(1.5rem,3vw,2.5rem)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.62rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: ACCENT, marginBottom: '1.2rem', fontFamily: sans }}>
            Sounds of the Earth
          </p>
          <h1 style={{
            fontSize: 'clamp(1.8rem,4.5vw,3rem)', fontWeight: '200',
            letterSpacing: '0.1em', lineHeight: '1.5',
            fontFamily: serif, wordBreak: 'keep-all',
            margin: '0 auto 0.8rem', maxWidth: '600px',
          }}>
            {t('pageTitle')}
          </h1>
          <p style={{
            fontSize: 'clamp(0.82rem,1.2vw,0.95rem)', lineHeight: '2',
            color: '#666', fontFamily: sans, maxWidth: '500px', margin: '0 auto 2rem',
          }}>
            {t('pageSubtitle')}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(2.5rem,6vw,5rem)' }}>
            <div>
              <div style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: '200', color: ACCENT, fontFamily: sans }}>{spots.length}</div>
              <div style={{ fontSize: '0.68rem', color: '#999', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: sans }}>{t('spots')}</div>
            </div>
            <div>
              <div style={{ fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: '200', color: ACCENT, fontFamily: sans }}>{uniqueCountries.size}</div>
              <div style={{ fontSize: '0.68rem', color: '#999', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: sans }}>{t('countries')}</div>
            </div>
          </div>
        </section>

        {/* ── Map (full-width, tall) ── */}
        <section style={{ position: 'relative' }}>
          <div
            ref={mapContainer}
            style={{
              width: '100%',
              height: 'max(75vh, 500px)',
              borderTop: '1px solid rgba(0,0,0,0.06)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          />

          {/* Hint pill */}
          {!playingId && (
            <div style={{
              position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '30px', padding: '10px 22px',
              fontSize: '0.75rem', color: '#666', fontFamily: sans,
              display: 'flex', alignItems: 'center', gap: '8px',
              border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              pointerEvents: 'none',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ACCENT }} />
              {t('listenHint')}
            </div>
          )}

          {/* Coord feedback */}
          {coordMsg && (
            <div style={{
              position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
              background: ACCENT, borderRadius: '24px', padding: '8px 20px',
              fontSize: '0.78rem', color: '#fff', fontFamily: sans,
              animation: 'fadeSlideUp 0.3s ease',
            }}>
              {t('mapClickSet')}: {coordMsg}
            </div>
          )}
        </section>

        {/* ── Now Playing ── */}
        {selectedSpot && (
          <section style={{
            maxWidth: '680px', margin: '-24px auto 0', padding: '0 20px',
            position: 'relative', zIndex: 10, animation: 'fadeSlideUp 0.4s ease',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px', padding: 'clamp(16px,3vw,24px)',
              border: '1px solid rgba(189,166,120,0.25)',
              boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'flex-start', gap: 'clamp(12px,2vw,20px)',
            }}>
              {/* Pulsing indicator */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, #d4b98a, ${ACCENT})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'soundPulse 1.5s infinite', marginTop: '2px',
              }}>
                <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>&#9654;</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT, margin: '0 0 4px', fontFamily: sans }}>
                  {t('nowPlaying')}
                </p>
                <h3 style={{ fontSize: 'clamp(0.95rem,1.5vw,1.15rem)', fontWeight: '400', fontFamily: serif, margin: '0 0 4px', lineHeight: '1.5' }}>
                  {getLocation(selectedSpot)}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: '1.6', margin: '0 0 8px', fontFamily: sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getDescription(selectedSpot)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.68rem', color: '#999', fontFamily: sans }}>
                  <span style={{ background: 'rgba(189,166,120,0.12)', color: ACCENT, padding: '3px 10px', borderRadius: '16px', fontSize: '0.65rem' }}>
                    {selectedSpot.mic}
                  </span>
                  <span>{t('recBy')}{selectedSpot.name}</span>
                </div>
              </div>

              {/* Stop */}
              <button
                onClick={() => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } setPlayingId(null); setSelectedSpot(null); }}
                style={{
                  background: 'rgba(0,0,0,0.05)', border: 'none', color: '#666', cursor: 'pointer',
                  padding: '8px 16px', borderRadius: '8px', fontSize: '0.72rem', fontFamily: sans,
                  letterSpacing: '0.08em', transition: 'all 0.2s', flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
              >
                &#9632; {t('stopBtn')}
              </button>
            </div>
          </section>
        )}

        {/* ── Spot List ── */}
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(2.5rem,5vw,4rem) 5%' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'clamp(1rem,2vw,1.5rem)',
          }}>
            {spots.map(spot => (
              <div
                key={spot.id}
                onClick={() => { playSpot(spot); mapRef.current?.flyTo({ center: [spot.lng, spot.lat], zoom: 6, duration: 2000 }); }}
                style={{
                  background: playingId === spot.id ? 'rgba(189,166,120,0.08)' : '#fff',
                  border: playingId === spot.id ? `1px solid rgba(189,166,120,0.3)` : '1px solid rgba(0,0,0,0.05)',
                  borderRadius: '14px', padding: 'clamp(16px,3vw,22px)',
                  cursor: 'pointer', transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={e => { if (playingId !== spot.id) { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                onMouseLeave={e => { if (playingId !== spot.id) { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {playingId === spot.id
                    ? <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ACCENT, animation: 'soundPulse 1.5s infinite' }} />
                    : <div style={{ width: '0', height: '0', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `8px solid ${ACCENT}` }} />
                  }
                  <span style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa', fontFamily: sans }}>{spot.country}</span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '400', fontFamily: serif, margin: '0 0 6px', lineHeight: '1.5', color: '#1e293b' }}>
                  {getLocation(spot)}
                </h4>
                <p style={{
                  fontSize: '0.78rem', color: '#888', lineHeight: '1.6', fontFamily: sans, margin: '0 0 10px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {getDescription(spot)}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: '#bbb', fontFamily: sans }}>
                  <span>{spot.mic}</span>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <span>{spot.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Submit Section ── */}
        <section id="submit" style={{
          maxWidth: '560px', margin: '0 auto',
          padding: 'clamp(2rem,5vw,4rem) 5% clamp(4rem,8vw,6rem)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem,3vw,2.5rem)' }}>
            <p style={{ fontSize: '0.62rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: ACCENT, marginBottom: '1rem', fontFamily: sans }}>
              Contribute
            </p>
            <h2 style={{
              fontSize: 'clamp(1.2rem,2.5vw,1.8rem)', fontWeight: '200',
              fontFamily: serif, lineHeight: '1.6', margin: '0 0 1rem', wordBreak: 'keep-all',
            }}>
              {t('submitTitle')}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#888', lineHeight: '2', fontFamily: sans, whiteSpace: 'pre-line' }}>
              {t('submitDesc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{
            background: '#fff', border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: '16px', padding: 'clamp(20px,4vw,32px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}>
            <label style={lbl}>{t('fieldName')} <span style={{ color: ACCENT }}>*</span></label>
            <input name="name" required className="sm-input" placeholder={t('fieldName')} />

            <label style={lbl}>{t('fieldEmail')} <span style={{ color: ACCENT }}>*</span></label>
            <input name="email" type="email" required className="sm-input" placeholder="you@example.com" />

            <label style={lbl}>{t('fieldLocation')} <span style={{ color: ACCENT }}>*</span></label>
            <input name="location" required className="sm-input" placeholder={t('fieldLocationHint')} />

            <label style={lbl}>{t('fieldCoords')} <span style={{ color: ACCENT }}>*</span></label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}>
              <input name="lat" value={formLat} onChange={e => setFormLat(e.target.value)} required className="sm-input" placeholder="Lat" style={{ flex: 1 }} />
              <input name="lng" value={formLng} onChange={e => setFormLng(e.target.value)} required className="sm-input" placeholder="Lng" style={{ flex: 1 }} />
            </div>
            <p style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '16px', fontFamily: sans }}>{t('fieldCoordsHint')}</p>

            <label style={lbl}>{t('fieldDescription')}</label>
            <textarea name="description" rows={3} className="sm-input" placeholder={t('fieldDescriptionHint')} style={{ resize: 'vertical' }} />

            <label style={{ ...lbl, marginTop: '16px' }}>{t('fieldFile')} <span style={{ color: ACCENT }}>*</span></label>
            <input name="file" type="file" accept=".mp3,audio/mpeg" required
              style={{
                width: '100%', padding: '12px', border: '1px dashed rgba(0,0,0,0.12)',
                borderRadius: '10px', background: '#fafafa', color: '#666',
                fontSize: '0.85rem', fontFamily: sans, marginBottom: '16px',
              }}
            />

            <label style={lbl}>{t('fieldMic')}</label>
            <input name="mic" className="sm-input" placeholder="e.g. P-86S" />

            <label style={lbl}>{t('fieldUrl')}</label>
            <input name="url" type="url" className="sm-input" placeholder="https://" />

            <label style={lbl}>{t('fieldPassword')} <span style={{ color: ACCENT }}>*</span></label>
            <input name="password" required className="sm-input" placeholder="Password" />
            <p style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '6px', marginBottom: '20px', fontFamily: sans }}>{t('fieldPasswordHint')}</p>

            <button type="submit" disabled={submitting} style={{
              width: '100%', padding: '15px', background: submitting ? '#d4c5a5' : `linear-gradient(135deg, #d4b98a, ${ACCENT})`,
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '0.92rem', fontFamily: sans, letterSpacing: '0.1em',
              cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
              boxShadow: submitting ? 'none' : '0 6px 24px rgba(189,166,120,0.3)',
            }}>
              {submitting ? t('submitting') : t('submit')}
            </button>

            {submitResult && (
              <p style={{
                marginTop: '14px', padding: '12px', borderRadius: '10px', fontSize: '0.82rem',
                fontFamily: sans, textAlign: 'center',
                background: submitResult.ok ? 'rgba(189,166,120,0.08)' : 'rgba(239,68,68,0.08)',
                color: submitResult.ok ? ACCENT : '#ef4444',
                border: `1px solid ${submitResult.ok ? 'rgba(189,166,120,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                {submitResult.msg}
              </p>
            )}
          </form>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          textAlign: 'center', padding: '3rem 5%',
          borderTop: '1px solid rgba(0,0,0,0.04)',
          fontFamily: sans, fontSize: '0.7rem', color: '#bbb', letterSpacing: '0.1em',
        }}>
          Sounds of the Earth — {lang === 'ja' ? '空音開発' : 'Kuon R&D'} GPS × Audio
        </footer>
      </div>
    </>
    </AuthGate>
  );
}

// ─────────────────────────────────────────────
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', color: '#666',
  marginBottom: '5px', marginTop: '16px',
  letterSpacing: '0.05em', fontFamily: '"Helvetica Neue", Arial, sans-serif',
};
