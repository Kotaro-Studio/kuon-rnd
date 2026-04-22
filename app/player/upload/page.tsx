'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Typography / Colors
// ─────────────────────────────────────────────
type L3 = Partial<Record<Lang, string>> & { en: string };
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#059669';       // emerald-600
const ACCENT_DARK = '#047857';  // emerald-700

const MAX_SIZE = 99 * 1024 * 1024;

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  pageTitle: { ja: 'KUON PLAYER', en: 'KUON PLAYER', es: 'KUON PLAYER' } as L3,
  pageSubtitle: {
    ja: '24時間で消える、安全なMP3共有',
    en: '24-Hour Self-Destructing MP3 Sharing',
    es: 'Compartir MP3 que se autodestruye en 24 horas',
  } as L3,
  nameLabel: { ja: 'お名前', en: 'Your Name', es: 'Tu nombre' } as L3,
  namePlaceholder: { ja: '朝比奈 幸太郎', en: 'Kotaro Asahina', es: 'Kotaro Asahina' } as L3,
  titleLabel: { ja: '曲名 / タイトル', en: 'Track Title', es: 'Título de la pista' } as L3,
  titlePlaceholder: { ja: 'ショパン ノクターン Op.9 No.2', en: 'Chopin Nocturne Op.9 No.2', es: 'Chopin Nocturno Op.9 No.2' } as L3,
  passwordLabel: { ja: 'パスワード', en: 'Password', es: 'Contraseña' } as L3,
  passwordHint: {
    ja: '共有相手がこのパスワードで再生します。忘れないでください。',
    en: 'The recipient will use this password to play. Don\'t forget it.',
    es: 'El destinatario usará esta contraseña para reproducir. No la olvides.',
  } as L3,
  dropTitle: {
    ja: 'MP3 ファイルをドロップ',
    en: 'Drop Your MP3 File Here',
    es: 'Suelta tu archivo MP3 aquí',
  } as L3,
  dropOr: { ja: 'または', en: 'or', es: 'o' } as L3,
  selectFile: { ja: 'ファイルを選択', en: 'Select File', es: 'Seleccionar archivo' } as L3,
  dropHint: {
    ja: 'MP3 のみ・最大 99MB',
    en: 'MP3 only — max 99MB',
    es: 'Solo MP3 — máx. 99MB',
  } as L3,
  uploadBtn: { ja: 'アップロードして共有リンクを生成', en: 'Upload & Generate Share Link', es: 'Subir y generar enlace' } as L3,
  uploading: { ja: 'アップロード中...', en: 'Uploading...', es: 'Subiendo...' } as L3,
  successTitle: { ja: '共有リンクが生成されました', en: 'Share Link Generated!', es: '¡Enlace generado!' } as L3,
  copyBtn: { ja: 'リンクをコピー', en: 'Copy Link', es: 'Copiar enlace' } as L3,
  copied: { ja: 'コピーしました！', en: 'Copied!', es: '¡Copiado!' } as L3,
  newUpload: { ja: '新しいファイルをアップロード', en: 'Upload Another File', es: 'Subir otro archivo' } as L3,
  shareNote: {
    ja: 'このリンクとパスワードを共有相手に送信してください。\n再生開始から24時間で自動削除されます。',
    en: 'Send this link and the password to your recipient.\nAudio will be automatically deleted 24 hours after first play.',
    es: 'Envía este enlace y la contraseña al destinatario.\nEl audio se eliminará automáticamente 24 horas después de la primera reproducción.',
  } as L3,
  errorGeneric: { ja: 'アップロードに失敗しました', en: 'Upload failed', es: 'Error al subir' } as L3,
  securityNote: {
    ja: 'ファイルはサーバーに一時保存されますが、再生開始から24時間で完全削除されます。パスワードを知っている人だけが再生・削除できます。',
    en: 'Files are temporarily stored on the server but completely deleted 24 hours after first play. Only people who know the password can play or delete.',
    es: 'Los archivos se almacenan temporalmente pero se eliminan completamente 24 horas después de la primera reproducción. Solo quienes conozcan la contraseña pueden reproducir o eliminar.',
  } as L3,
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function PlayerUploadPage() {
  const { lang } = useLang();
  const t = (obj: L3) => obj[lang] ?? obj.en;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.mp3') && f.type !== 'audio/mpeg') {
      setErrorMsg('MP3 only');
      return;
    }
    if (f.size > MAX_SIZE) {
      setErrorMsg('Max 99MB');
      return;
    }
    setFile(f);
    setErrorMsg('');
    if (!title) setTitle(f.name.replace(/\.mp3$/i, ''));
  }, [title]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file || !name.trim() || !title.trim() || !password.trim()) return;
    setStatus('uploading');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name.trim());
      formData.append('title', title.trim());
      formData.append('password', password.trim());

      const res = await fetch('/api/player/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error || t(T.errorGeneric));
        return;
      }

      const origin = window.location.origin;
      setShareUrl(`${origin}/player/${data.id}`);
      setStatus('done');
    } catch {
      setStatus('error');
      setErrorMsg(t(T.errorGeneric));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setFile(null);
    setName('');
    setTitle('');
    setPassword('');
    setStatus('idle');
    setShareUrl('');
    setErrorMsg('');
  };

  const canUpload = file && name.trim() && title.trim() && password.trim() && status !== 'uploading';

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5', padding: 'clamp(16px, 4vw, 40px)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 48px)' }}>
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
            fontWeight: 300,
            letterSpacing: '0.15em',
            color: ACCENT,
            marginBottom: 8,
          }}>
            {t(T.pageTitle)}
          </h1>
          <p style={{
            fontFamily: sans,
            fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
            color: '#999',
            lineHeight: 1.7,
          }}>
            {t(T.pageSubtitle)}
          </p>
        </div>

        {/* Success State */}
        {status === 'done' ? (
          <div style={{
            background: 'rgba(5,150,105,0.08)',
            border: '1px solid rgba(5,150,105,0.3)',
            borderRadius: 16,
            padding: 'clamp(20px, 4vw, 32px)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>&#x2705;</div>
            <h2 style={{ fontFamily: serif, fontSize: '1.3rem', fontWeight: 400, color: ACCENT, marginBottom: 16 }}>
              {t(T.successTitle)}
            </h2>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 16,
              wordBreak: 'break-all',
              fontFamily: '"SF Mono", "Fira Code", monospace',
              fontSize: '0.85rem',
              color: '#d4d4d4',
            }}>
              {shareUrl}
            </div>

            <button
              onClick={handleCopy}
              style={{
                background: copied ? '#065f46' : ACCENT,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 32px',
                fontSize: '1rem',
                fontFamily: sans,
                cursor: 'pointer',
                marginBottom: 16,
                transition: 'background 0.2s',
              }}
            >
              {copied ? t(T.copied) : t(T.copyBtn)}
            </button>

            <p style={{
              fontSize: '0.85rem',
              color: '#999',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
              marginBottom: 24,
            }}>
              {t(T.shareNote)}
            </p>

            <button
              onClick={reset}
              style={{
                background: 'transparent',
                color: ACCENT,
                border: `1px solid ${ACCENT}`,
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: '0.9rem',
                fontFamily: sans,
                cursor: 'pointer',
              }}
            >
              {t(T.newUpload)}
            </button>
          </div>
        ) : (
          /* Upload Form */
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 'clamp(20px, 4vw, 32px)',
          }}>
            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: sans, fontSize: '0.85rem', color: '#999', marginBottom: 6 }}>
                {t(T.nameLabel)}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t(T.namePlaceholder)}
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

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: sans, fontSize: '0.85rem', color: '#999', marginBottom: 6 }}>
                {t(T.titleLabel)}
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t(T.titlePlaceholder)}
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

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: sans, fontSize: '0.85rem', color: '#999', marginBottom: 6 }}>
                {t(T.passwordLabel)}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              <p style={{ fontSize: '0.78rem', color: '#777', marginTop: 6, lineHeight: 1.5 }}>
                {t(T.passwordHint)}
              </p>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? ACCENT : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 12,
                padding: 'clamp(24px, 4vw, 40px)',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'rgba(5,150,105,0.06)' : 'transparent',
                transition: 'all 0.2s',
                marginBottom: 24,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,audio/mpeg"
                onChange={e => handleFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
              {file ? (
                <div>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>&#x1F3B5;</div>
                  <p style={{ fontFamily: sans, fontSize: '0.95rem', color: '#e5e5e5', marginBottom: 4 }}>
                    {file.name}
                  </p>
                  <p style={{ fontFamily: sans, fontSize: '0.8rem', color: '#999' }}>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: 8, opacity: 0.4 }}>&#x1F4E4;</div>
                  <p style={{ fontFamily: sans, fontSize: '0.95rem', color: '#ccc', marginBottom: 4 }}>
                    {t(T.dropTitle)}
                  </p>
                  <p style={{ fontFamily: sans, fontSize: '0.8rem', color: '#777' }}>
                    {t(T.dropOr)} <span style={{ color: ACCENT, textDecoration: 'underline' }}>{t(T.selectFile)}</span>
                  </p>
                  <p style={{ fontFamily: sans, fontSize: '0.75rem', color: '#666', marginTop: 8 }}>
                    {t(T.dropHint)}
                  </p>
                </div>
              )}
            </div>

            {/* Error */}
            {errorMsg && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 16, textAlign: 'center' }}>
                {errorMsg}
              </p>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!canUpload}
              style={{
                width: '100%',
                background: canUpload ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` : 'rgba(255,255,255,0.08)',
                color: canUpload ? '#fff' : '#666',
                border: 'none',
                borderRadius: 10,
                padding: '14px 24px',
                fontSize: '1rem',
                fontFamily: sans,
                fontWeight: 600,
                cursor: canUpload ? 'pointer' : 'default',
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              {status === 'uploading' ? t(T.uploading) : t(T.uploadBtn)}
            </button>

            {/* Security Note */}
            <div style={{
              marginTop: 24,
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ fontSize: '0.75rem', color: '#777', lineHeight: 1.6 }}>
                &#x1F512; {t(T.securityNote)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
