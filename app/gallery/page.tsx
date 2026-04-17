"use client";

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import recordings from '@/data/recordings.json';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const AUDIO_BASE = 'https://kuon-rnd-audio-worker.369-1d5.workers.dev/api/audio';
const ACCENT = '#0284c7';
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Recording {
  id: string;
  name: string;
  instrument: string;
  title: string;
  comment: string;
  file: string;
  mic: string;
  mastered: boolean;
  date: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function GalleryPage() {
  const { lang } = useLang();
  const t = (...args: string[]) => {
    const idx = lang === 'ja' ? 0 : lang === 'en' ? 1 : 2;
    return args[idx] || args[0];
  };

  const items: Recording[] = [...recordings].reverse(); // 新しい順

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(170deg, #f8fafc 0%, #e8f4f8 40%, #f0f9ff 100%)' }}>
      {/* ── Hero ── */}
      <section style={{ padding: 'clamp(5rem,10vw,10rem) 5% clamp(3rem,6vw,5rem)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.68rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: ACCENT, marginBottom: '1.5rem', fontFamily: sans }}>
          Owner&apos;s Gallery
        </p>
        <h1 style={{ fontSize: 'clamp(1.5rem,3.5vw,2.8rem)', fontWeight: '200', letterSpacing: '0.07em', lineHeight: '1.75', fontFamily: serif, wordBreak: 'keep-all', maxWidth: '700px', margin: '0 auto 1rem' }}>
          {t('オーナーの録音ギャラリー', 'Owner\'s Recording Gallery', 'Galería de Grabaciones')}
        </h1>
        <p style={{ fontSize: 'clamp(0.85rem,1.2vw,0.95rem)', lineHeight: '2', color: '#555', fontFamily: sans, maxWidth: '600px', margin: '0 auto' }}>
          {t(
            'P-86S / X-86S オーナーの皆さまによる録音作品をご紹介します。',
            'Featuring recordings by P-86S / X-86S owners.',
            'Presentamos grabaciones de los propietarios de P-86S / X-86S.'
          )}
        </p>
      </section>

      {/* ── Grid ── */}
      <section style={{ padding: '0 5% clamp(5rem,10vw,8rem)', maxWidth: '1100px', margin: '0 auto' }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontFamily: sans, fontSize: '0.95rem' }}>
            {t('まだ掲載された録音はありません。', 'No recordings featured yet.', 'Aún no hay grabaciones.')}
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'clamp(1.2rem,2.5vw,1.8rem)' }}>
            {items.map((r) => (
              <article key={r.id} style={{
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                padding: 'clamp(1.2rem,2.5vw,1.8rem)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}>
                {/* Header: avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0c4a6e, #0284c7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '1.1rem', fontWeight: 600, flexShrink: 0,
                  }}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0c4a6e', fontFamily: sans }}>
                      {r.name} {t('様', '', '')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.05em', fontFamily: sans }}>
                      {r.instrument} — {r.mic}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 500, marginBottom: '0.5rem', color: '#1e293b', lineHeight: 1.5 }}>
                  {r.title}
                </h3>

                {/* Comment */}
                {r.comment && (
                  <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.7, marginBottom: '1rem', fontFamily: sans }}>
                    {r.comment}
                  </p>
                )}

                {/* Audio Player */}
                <audio
                  controls
                  preload="none"
                  style={{ width: '100%', height: '40px', borderRadius: '8px', marginBottom: '0.6rem' }}
                >
                  <source src={`${AUDIO_BASE}/${r.file}`} type="audio/mpeg" />
                </audio>

                {/* Badge */}
                {r.mastered ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.7rem', color: '#b45309', background: 'rgba(180,83,9,0.08)',
                    padding: '0.3rem 0.8rem', borderRadius: '20px', letterSpacing: '0.05em', fontFamily: sans,
                  }}>
                    ✦ Mastered by 朝比奈幸太郎
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.7rem', color: ACCENT, background: 'rgba(2,132,199,0.08)',
                    padding: '0.3rem 0.8rem', borderRadius: '20px', letterSpacing: '0.05em', fontFamily: sans,
                  }}>
                    {r.mic} Recording
                  </span>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(3rem,6vw,5rem) 5%', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <p style={{ fontSize: 'clamp(0.9rem,1.3vw,1rem)', color: '#555', lineHeight: 2, fontFamily: sans, marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          {t(
            'あなたの録音も掲載しませんか？',
            'Want to feature your recording?',
            '¿Quieres publicar tu grabación?'
          )}
        </p>
        <Link href="/microphone#gallery-submit" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none', color: '#fff', fontFamily: sans, backgroundColor: ACCENT,
          fontSize: '0.9rem', letterSpacing: '0.12em', padding: '1.1rem 3rem',
          borderRadius: '50px', boxShadow: '0 8px 28px rgba(2,132,199,0.3)',
          transition: 'all 0.3s ease',
        }}>
          {t('録音を投稿する', 'Submit a Recording', 'Enviar una Grabación')}
        </Link>
      </section>
    </div>
  );
}
