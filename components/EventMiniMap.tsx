'use client';

import { useEffect, useRef } from 'react';

const ACCENT = '#0284c7';

interface EventMiniMapProps {
  lat: number;
  lng: number;
}

export default function EventMiniMap({ lat, lng }: EventMiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    let mapInstance: { remove: () => void } | null = null;

    (async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      const Lf = L.default || L;
      if (!mapRef.current) return;

      const map = Lf.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
      });
      mapInstance = map;

      Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OSM',
        maxZoom: 18,
      }).addTo(map);

      const icon = Lf.divIcon({
        html: `<div style="background:${ACCENT};width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        className: '',
        iconSize: [16, 16] as [number, number],
        iconAnchor: [8, 8] as [number, number],
      });
      Lf.marker([lat, lng], { icon }).addTo(map);
    })();

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, [lat, lng]);

  return <div ref={mapRef} style={{ width: '100%', height: 250, borderRadius: 8, overflow: 'hidden' }} />;
}
