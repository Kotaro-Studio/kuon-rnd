'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Typography / Colors
// ─────────────────────────────────────────────
type L3 = Record<Lang, string>;
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const mono  = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#059669';
const ACCENT_DARK = '#047857';

const WORKER_BASE = 'https://kuon-rnd-player-worker.369-1d5.workers.dev';

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  pageTitle: { ja: 'KUON PLAYER', en: 'KUON PLAYER', es: 'KUON PLAYER' } as L3,
  loading: { ja: '読み込み中...', en: 'Loading...', es: 'Cargando...' } as L3,
  notFound: { ja: 'この音声は存在しないか、期限切れで削除されました。', en: 'This audio does not exist or has expired and been deleted.', es: 'Este audio no existe o ha expirado y fue eliminado.' } as L3,
  expired: { ja: 'この音声は24時間の有効期限を過ぎたため、自動削除されました。', en: 'This audio has been automatically deleted after the 24-hour expiry.', es: 'Este audio fue eliminado automáticamente tras expirar las 24 horas.' } as L3,
  sharedBy: { ja: '共有者', en: 'Shared by', es: 'Compartido por' } as L3,
  track: { ja: '曲名', en: 'Track', es: 'Pista' } as L3,
  fileSize: { ja: 'ファイルサイズ', en: 'File Size', es: 'Tamaño' } as L3,
  passwordLabel: { ja: 'パスワードを入力', en: 'Enter Password', es: 'Introducir contraseña' } as L3,
  playBtn: { ja: '再生する', en: 'Play', es: 'Reproducir' } as L3,
  wrongPassword: { ja: 'パスワードが違います', en: 'Wrong password', es: 'Contraseña incorrecta' } as L3,
  remainingTime: { ja: '残り時間', en: 'Time Remaining', es: 'Tiempo restante' } as L3,
  hours: { ja: '時間', en: 'h', es: 'h' } as L3,
  minutes: { ja: '分', en: 'm', es: 'm' } as L3,
  seconds: { ja: '秒', en: 's', es: 's' } as L3,
  deleteBtn: { ja: 'この音声を削除', en: 'Delete This Audio', es: 'Eliminar este audio' } as L3,
  deleteConfirm: { ja: '本当に削除しますか？この操作は取り消せません。', en: 'Are you sure? This cannot be undone.', es: '¿Estás seguro? Esta acción no se puede deshacer.' } as L3,
  deleted: { ja: '音声が削除されました', en: 'Audio has been deleted', es: 'El audio ha sido eliminado' } as L3,
  deleting: { ja: '削除中...', en: 'Deleting...', es: 'Eliminando...' } as L3,
  firstPlayNote: {
    ja: '再生を開始すると、24時間のカウントダウンが始まります。',
    en: 'The 24-hour countdown starts when you press play.',
    es: 'La cuenta regresiva de 24 horas comienza al reproducir.',
  } as L3,
  backToUpload: { ja: '自分もアップロードする', en: 'Upload Your Own', es: 'Sube el tuyo' } as L3,
};

// ─────────────────────────────────────────────
// Helper: SHA-256
// ─────────────────────────────────────────────
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─────────────────────────────────────────────
// Helper: format remaining time
// ─────────────────────────────────────────────
function formatRemaining(ms: number, lang: Lang): string {
  if (ms <= 0) return '0:00';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h}${T.hours[lang]} ${m.toString().padStart(2, '0')}${T.minutes[lang]} ${s.toString().padStart(2, '0')}${T.seconds[lang]}`;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface TrackPublicMeta {
  name: string;
  title: string;
  createdAt: string;
  firstPlayedAt: string | null;
  size: number;
  originalName: string;
  expiresAt: string | null;
}

type PageStatus = 'loading' | 'not-found' | 'expired' | 'auth' | 'playing' | 'deleted';

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function PlayerPage() {
  const { lang } = useLang();
  const t = (obj: L3) => obj[lang];
  const params = useParams();
  const id = params.id as string;

  const [pageStatus, setPageStatus] = useState<PageStatus>('loading');
  const [meta, setMeta] = useState<TrackPublicMeta | null>(null);
  const [password, setPassword] = useState('');
  const [passwordHash, setPasswordHash] = useState('');
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [deleting, setDeleting] = useState(false);

  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const rafRef = useRef<number>(0);

  // ─── Fetch meta on mount ───
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/player/meta/${id}`);
        if (res.status === 404) { setPageStatus('not-found'); return; }
        if (res.status === 410) { setPageStatus('expired'); return; }
        const data = await res.json();
        setMeta(data);
        if (data.expiresAt) {
          setExpiresAt(new Date(data.expiresAt));
        }
        setPageStatus('auth');
      } catch {
        setPageStatus('not-found');
      }
    })();
  }, [id]);

  // ─── Countdown timer ───
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) {
        setRemaining(0);
        setPageStatus('expired');
        clearInterval(interval);
      } else {
        setRemaining(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // ─── Audio time update ───
  const updateTime = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
    rafRef.current = requestAnimationFrame(updateTime);
  }, []);

  // ─── Handle play (auth + start) ───
  const handlePlay = async () => {
    if (!password.trim()) return;
    setError('');

    const hash = await sha256(password.trim());

    try {
      const res = await fetch(`/api/player/play/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordHash: hash }),
      });

      if (res.status === 403) {
        setError(t(T.wrongPassword));
        return;
      }
      if (res.status === 410) {
        setPageStatus('expired');
        return;
      }

      const data = await res.json();
      setPasswordHash(hash);
      setExpiresAt(new Date(data.expiresAt));

      // Create audio element
      const streamUrl = `${WORKER_BASE}/api/stream/${id}?h=${hash}`;
      const audio = new Audio(streamUrl);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        cancelAnimationFrame(rafRef.current);
      });

      await audio.play();
      setIsPlaying(true);
      setPageStatus('playing');
      rafRef.current = requestAnimationFrame(updateTime);
    } catch {
      setError(t(T.wrongPassword));
    }
  };

  // ─── Play / Pause toggle ───
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(updateTime);
    }
  };

  // ─── Seek ───
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * duration;
    setCurrentTime(audioRef.current.currentTime);
  };

  // ─── Delete ───
  const handleDelete = async () => {
    if (!confirm(t(T.deleteConfirm))) return;
    setDeleting(true);

    const hash = passwordHash || await sha256(password.trim());

    try {
      const res = await fetch(`/api/player/delete/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordHash: hash }),
      });

      if (res.ok) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setPageStatus('deleted');
      } else {
        const data = await res.json();
        setError(data.error || 'Delete failed');
        setDeleting(false);
      }
    } catch {
      setError('Delete failed');
      setDeleting(false);
    }
  };

  // ─── Cleanup ───
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5', padding: 'clamp(16px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)' }}>
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.4rem, 4vw, 2rem)',
            fontWeight: 300,
            letterSpacing: '0.15em',
            color: ACCENT,
            marginBottom: 4,
          }}>
            {t(T.pageTitle)}
          </h1>
        </div>

        {/* Loading */}
        {pageStatus === 'loading' && (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p style={{ color: '#999', fontFamily: sans }}>{t(T.loading)}</p>
          </div>
        )}

        {/* Not Found */}
        {pageStatus === 'not-found' && (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(32px, 6vw, 60px)',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>&#x1F50D;</div>
            <p style={{ color: '#999', fontFamily: sans, lineHeight: 1.7 }}>{t(T.notFound)}</p>
          </div>
        )}

        {/* Expired */}
        {pageStatus === 'expired' && (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(32px, 6vw, 60px)',
            background: 'rgba(239,68,68,0.06)',
            borderRadius: 16,
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>&#x23F0;</div>
            <p style={{ color: '#ef4444', fontFamily: sans, lineHeight: 1.7 }}>{t(T.expired)}</p>
          </div>
        )}

        {/* Deleted */}
        {pageStatus === 'deleted' && (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(32px, 6vw, 60px)',
            background: 'rgba(5,150,105,0.06)',
            borderRadius: 16,
            border: '1px solid rgba(5,150,105,0.2)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>&#x2705;</div>
            <p style={{ color: ACCENT, fontFamily: sans, lineHeight: 1.7 }}>{t(T.deleted)}</p>
          </div>
        )}

        {/* Auth (password input) */}
        {pageStatus === 'auth' && meta && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 'clamp(24px, 5vw, 36px)',
          }}>
            {/* Track Info */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                <span style={{ fontSize: '0.8rem', color: '#777', fontFamily: sans }}>{t(T.sharedBy)}</span>
                <span style={{ fontSize: '0.9rem', color: '#ccc', fontFamily: sans }}>{meta.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                <span style={{ fontSize: '0.8rem', color: '#777', fontFamily: sans }}>{t(T.track)}</span>
                <span style={{ fontSize: '0.9rem', color: '#e5e5e5', fontFamily: serif }}>{meta.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ fontSize: '0.8rem', color: '#777', fontFamily: sans }}>{t(T.fileSize)}</span>
                <span style={{ fontSize: '0.85rem', color: '#999', fontFamily: mono }}>{(meta.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            </div>

            {!meta.firstPlayedAt && (
              <p style={{
                fontSize: '0.78rem', color: '#999', textAlign: 'center',
                marginBottom: 20, padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)', borderRadius: 6,
                lineHeight: 1.5,
              }}>
                &#x23F1; {t(T.firstPlayNote)}
              </p>
            )}

            {/* Password Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: sans, fontSize: '0.85rem', color: '#999', marginBottom: 6 }}>
                {t(T.passwordLabel)}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handlePlay(); }}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: '0.95rem',
                  color: '#e5e5e5',
                  fontFamily: sans,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12, textAlign: 'center' }}>{error}</p>
            )}

            <button
              onClick={handlePlay}
              disabled={!password.trim()}
              style={{
                width: '100%',
                background: password.trim() ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` : 'rgba(255,255,255,0.08)',
                color: password.trim() ? '#fff' : '#666',
                border: 'none',
                borderRadius: 10,
                padding: '14px 24px',
                fontSize: '1rem',
                fontFamily: sans,
                fontWeight: 600,
                cursor: password.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              &#x25B6;&#xFE0F; {t(T.playBtn)}
            </button>
          </div>
        )}

        {/* Playing State */}
        {pageStatus === 'playing' && meta && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 'clamp(24px, 5vw, 36px)',
          }}>
            {/* Track Info */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ fontFamily: sans, fontSize: '0.8rem', color: '#777', marginBottom: 4 }}>{meta.name}</p>
              <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 400, color: '#e5e5e5' }}>
                {meta.title}
              </h2>
            </div>

            {/* Seek Bar */}
            <div
              onClick={handleSeek}
              style={{
                width: '100%',
                height: 6,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 3,
                cursor: 'pointer',
                position: 'relative',
                marginBottom: 8,
              }}
            >
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK})`,
                borderRadius: 3,
                transition: 'width 0.1s linear',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: `${progress}%`,
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#fff',
                boxShadow: '0 0 6px rgba(0,0,0,0.4)',
              }} />
            </div>

            {/* Time */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontFamily: mono, fontSize: '0.8rem', color: '#999' }}>{formatTime(currentTime)}</span>
              <span style={{ fontFamily: mono, fontSize: '0.8rem', color: '#999' }}>{formatTime(duration)}</span>
            </div>

            {/* Play / Pause */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <button
                onClick={togglePlay}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})`,
                  color: '#fff',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
            </div>

            {/* Remaining Time */}
            {expiresAt && (
              <div style={{
                textAlign: 'center',
                padding: '12px 16px',
                background: remaining < 3600000
                  ? 'rgba(239,68,68,0.08)'
                  : 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                marginBottom: 24,
                border: remaining < 3600000
                  ? '1px solid rgba(239,68,68,0.2)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}>
                <p style={{ fontSize: '0.78rem', color: '#999', marginBottom: 4, fontFamily: sans }}>
                  {t(T.remainingTime)}
                </p>
                <p style={{
                  fontSize: '1.3rem',
                  fontFamily: mono,
                  color: remaining < 3600000 ? '#ef4444' : ACCENT,
                  fontWeight: 600,
                }}>
                  {formatRemaining(remaining, lang)}
                </p>
              </div>
            )}

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                width: '100%',
                background: 'transparent',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: '0.85rem',
                fontFamily: sans,
                cursor: deleting ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {deleting ? t(T.deleting) : t(T.deleteBtn)}
            </button>
          </div>
        )}

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a
            href="/player/upload"
            style={{ color: ACCENT, fontFamily: sans, fontSize: '0.85rem', textDecoration: 'none' }}
          >
            {t(T.backToUpload)} &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
