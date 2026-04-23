'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// KUON SEPARATOR — ステム分離アプリ（Demucs v4）
//
// フロー:
//   1. ページ読込時にクォータ取得 → 残り回数を表示
//   2. ユーザーが MP3/WAV をドロップ
//   3. POST /api/separator/run → (Auth Worker クォータ消費) → Cloud Run
//   4. 4 ステム（drums/bass/vocals/other）の署名付き URL を受信
//   5. ブラウザで再生プレビュー + ダウンロード
//
// クォータ超過時は 429 が返り、アップグレード CTA を表示する。
// ─────────────────────────────────────────────

type L3 = Partial<Record<Lang, string>> & { en: string };
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#7c3aed';        // violet-600
const ACCENT_DARK = '#6d28d9';   // violet-700
const MAX_SIZE = 50 * 1024 * 1024;  // 50MB
const MAX_DURATION_SEC = 600;        // 10 min

const STEM_COLORS: Record<string, string> = {
  drums:  '#ef4444',  // red
  bass:   '#f59e0b',  // amber
  vocals: '#10b981',  // emerald
  other:  '#3b82f6',  // blue
};

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  pageTitle:    { ja: 'KUON SEPARATOR', en: 'KUON SEPARATOR', es: 'KUON SEPARATOR' } as L3,
  pageSubtitle: {
    ja: 'ボーカル・ドラム・ベース・その他を AI で分離',
    en: 'AI-powered vocal / drums / bass / other stem separation',
    es: 'Separación de pistas por IA: voz / batería / bajo / otros',
  } as L3,
  quotaLabel: { ja: '今月の残り', en: 'Remaining this month', es: 'Restantes este mes' } as L3,
  quotaOf:    { ja: '/', en: 'of', es: 'de' } as L3,
  dropTitle:  {
    ja: '音源ファイルをドロップ',
    en: 'Drop audio file here',
    es: 'Suelta el archivo de audio aquí',
  } as L3,
  dropOr:     { ja: 'または', en: 'or', es: 'o' } as L3,
  selectFile: { ja: 'ファイルを選択', en: 'Select file', es: 'Seleccionar archivo' } as L3,
  dropHint:   {
    ja: 'MP3 / WAV / FLAC / M4A・最大 50MB・10 分以内',
    en: 'MP3 / WAV / FLAC / M4A · max 50MB · up to 10 min',
    es: 'MP3 / WAV / FLAC / M4A · máx. 50MB · hasta 10 min',
  } as L3,
  startBtn:    { ja: '分離を開始', en: 'Start separation', es: 'Iniciar separación' } as L3,
  processing:  { ja: '処理中 (4-6 分かかります)...', en: 'Processing (takes 4-6 min)...', es: 'Procesando (tarda 4-6 min)...' } as L3,
  successTitle:{ ja: '分離完了', en: 'Separation complete', es: 'Separación completa' } as L3,
  download:    { ja: 'ダウンロード', en: 'Download', es: 'Descargar' } as L3,
  newJob:      { ja: '新しい音源を分離', en: 'Separate another track', es: 'Separar otra pista' } as L3,
  expiresIn:   {
    ja: 'リンクは 24 時間有効',
    en: 'Links expire in 24 hours',
    es: 'Los enlaces expiran en 24 horas',
  } as L3,
  errorTitle:  { ja: 'エラー', en: 'Error', es: 'Error' } as L3,
  loginRequired: {
    ja: 'ログインが必要です',
    en: 'Login required',
    es: 'Se requiere inicio de sesión',
  } as L3,
  loginCta: { ja: 'ログインする', en: 'Sign in', es: 'Iniciar sesión' } as L3,
  quotaExceeded: {
    ja: '今月のクォータを使い切りました',
    en: "You've used this month's quota",
    es: 'Has usado la cuota de este mes',
  } as L3,
  upgradeTo:  { ja: 'アップグレード:', en: 'Upgrade to', es: 'Actualizar a' } as L3,
  perMonth:   { ja: '/月', en: '/month', es: '/mes' } as L3,
  timesPerMonth: { ja: '回 / 月', en: 'uses / month', es: 'usos / mes' } as L3,
  stems: {
    drums:  { ja: 'ドラム', en: 'Drums', es: 'Batería' } as L3,
    bass:   { ja: 'ベース', en: 'Bass', es: 'Bajo' } as L3,
    vocals: { ja: 'ボーカル', en: 'Vocals', es: 'Voz' } as L3,
    other:  { ja: 'その他', en: 'Other', es: 'Otros' } as L3,
  },
};

function t(lang: Lang, key: L3): string {
  return key[lang] || key.en;
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Quota {
  plan: 'free' | 'student' | 'pro';
  used: number;
  limit: number;
  remaining: number;
}

interface QuotaExceededResponse {
  error: 'quota_exceeded';
  plan: 'free' | 'student' | 'pro';
  used: number;
  limit: number;
  upgradeOptions: Array<{ plan: 'student' | 'pro'; price: number; limit: number }>;
}

interface SeparationResult {
  jobId: string;
  model: string;
  inputDurationSec: number;
  processingTimeSec: number;
  urls: Record<string, string>;  // { drums, bass, vocals, other }
  expiresInSec: number;
  quota: Quota;
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function SeparatorPage() {
  const { lang } = useLang();

  const [quota, setQuota] = useState<Quota | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SeparationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeInfo, setUpgradeInfo] = useState<QuotaExceededResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch quota on mount ──
  useEffect(() => {
    let mounted = true;
    fetch('/api/separator/quota')
      .then(async (r) => {
        if (r.status === 401) {
          if (mounted) setAuthRequired(true);
          return null;
        }
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (!mounted || !data) return;
        if (data.plan) {
          setQuota({
            plan: data.plan,
            used: data.used,
            limit: data.limit,
            remaining: data.remaining,
          });
        }
      })
      .catch(() => void 0);
    return () => { mounted = false; };
  }, []);

  // ── File handlers ──
  const handleFileSelect = useCallback((f: File) => {
    setError(null);
    if (f.size > MAX_SIZE) {
      setError(`File too large (${(f.size / 1024 / 1024).toFixed(1)}MB > 50MB)`);
      return;
    }
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!['mp3', 'wav', 'flac', 'm4a', 'ogg'].includes(ext)) {
      setError(`Unsupported format: ${ext}`);
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setUpgradeInfo(null);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await fetch('/api/separator/run', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 429) {
        const payload = await res.json() as QuotaExceededResponse;
        setUpgradeInfo(payload);
        setQuota({ plan: payload.plan, used: payload.used, limit: payload.limit, remaining: 0 });
        return;
      }
      if (res.status === 401) {
        setAuthRequired(true);
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'unknown' }));
        setError(err.detail || err.error || 'Separation failed');
        return;
      }

      const data = await res.json() as SeparationResult;
      setResult(data);
      if (data.quota) setQuota(data.quota);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setUpgradeInfo(null);
  };

  // ── Render ──
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 'clamp(24px, 5vw, 64px) 16px',
        fontFamily: sans,
        color: '#0f172a',
        maxWidth: 980,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 6vw, 64px)' }}>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            fontWeight: 500,
            letterSpacing: '0.02em',
            margin: 0,
            color: ACCENT,
          }}
        >
          {t(lang, T.pageTitle)}
        </h1>
        <p style={{ color: '#64748b', marginTop: 8, fontSize: '0.95rem' }}>
          {t(lang, T.pageSubtitle)}
        </p>
      </div>

      {/* Auth required */}
      {authRequired && (
        <div style={{
          padding: '2rem',
          background: '#f1f5f9',
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, color: '#475569' }}>{t(lang, T.loginRequired)}</p>
          <a
            href="/auth/login?redirect=/separator"
            style={{
              display: 'inline-block',
              marginTop: 16,
              padding: '0.7rem 2rem',
              background: ACCENT,
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            {t(lang, T.loginCta)}
          </a>
        </div>
      )}

      {/* Quota badge */}
      {!authRequired && quota && !result && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '0.7rem 1.2rem',
          background: quota.remaining > 0 ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${quota.remaining > 0 ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: 999,
          marginBottom: 24,
          fontSize: '0.88rem',
          width: 'fit-content',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <span style={{
            padding: '2px 10px',
            background: quota.plan === 'pro' ? '#7c3aed' : quota.plan === 'student' ? '#3b82f6' : '#64748b',
            color: '#fff',
            borderRadius: 999,
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}>{quota.plan}</span>
          <span style={{ color: '#475569' }}>
            {t(lang, T.quotaLabel)}: <strong>{quota.remaining}</strong> {t(lang, T.quotaOf)} {quota.limit}
          </span>
        </div>
      )}

      {/* Upgrade nudge */}
      {upgradeInfo && (
        <div style={{
          padding: '1.5rem',
          background: '#fefce8',
          border: '2px solid #facc15',
          borderRadius: 12,
          marginBottom: 24,
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#713f12' }}>
            {t(lang, T.quotaExceeded)} ({upgradeInfo.used}/{upgradeInfo.limit})
          </p>
          {upgradeInfo.upgradeOptions.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ color: '#713f12', fontSize: '0.9rem' }}>{t(lang, T.upgradeTo)}:</span>
              {upgradeInfo.upgradeOptions.map((opt) => (
                <a
                  key={opt.plan}
                  href={`/pricing#${opt.plan}`}
                  style={{
                    padding: '0.5rem 1rem',
                    background: ACCENT,
                    color: '#fff',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {opt.plan.toUpperCase()} ¥{opt.price}{t(lang, T.perMonth)} ({opt.limit} {t(lang, T.timesPerMonth)})
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drop zone or result */}
      {!result && !authRequired && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            padding: 'clamp(32px, 6vw, 64px)',
            border: `2px dashed ${dragActive ? ACCENT : '#cbd5e1'}`,
            borderRadius: 16,
            background: dragActive ? '#f5f3ff' : '#f8fafc',
            textAlign: 'center',
            transition: 'all 0.2s',
          }}
        >
          {!file ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>♪</div>
              <h2 style={{ fontFamily: serif, fontSize: '1.3rem', margin: 0, color: '#0f172a' }}>
                {t(lang, T.dropTitle)}
              </h2>
              <p style={{ color: '#64748b', margin: '8px 0 16px', fontSize: '0.88rem' }}>
                {t(lang, T.dropOr)}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.7rem 2rem',
                  background: ACCENT,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t(lang, T.selectFile)}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 20 }}>
                {t(lang, T.dropHint)}
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: '1rem', color: '#0f172a', margin: 0, wordBreak: 'break-all' }}>
                <strong>{file.name}</strong>
              </p>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 20px' }}>
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
              <button
                onClick={handleSubmit}
                disabled={isProcessing || (quota?.remaining === 0)}
                style={{
                  padding: '0.85rem 2.5rem',
                  background: isProcessing ? '#94a3b8' : ACCENT,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  marginRight: 8,
                }}
              >
                {isProcessing ? t(lang, T.processing) : t(lang, T.startBtn)}
              </button>
              {!isProcessing && (
                <button
                  onClick={() => setFile(null)}
                  style={{
                    padding: '0.85rem 1.5rem',
                    background: 'transparent',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16,
          padding: '1rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          color: '#991b1b',
          fontSize: '0.9rem',
        }}>
          <strong>{t(lang, T.errorTitle)}:</strong> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          <h2 style={{
            fontFamily: serif,
            fontSize: '1.5rem',
            color: ACCENT_DARK,
            marginBottom: 8,
            textAlign: 'center',
          }}>
            {t(lang, T.successTitle)}
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.85rem',
            marginBottom: 24,
          }}>
            {result.processingTimeSec.toFixed(1)}s · {t(lang, T.expiresIn)}
          </p>

          <div style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            marginBottom: 24,
          }}>
            {Object.entries(result.urls).map(([stem, url]) => (
              <div
                key={stem}
                style={{
                  padding: '1rem',
                  background: '#fff',
                  border: `2px solid ${STEM_COLORS[stem] || '#cbd5e1'}`,
                  borderRadius: 12,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}>
                  <strong style={{
                    color: STEM_COLORS[stem] || '#0f172a',
                    fontSize: '0.95rem',
                  }}>
                    {t(lang, T.stems[stem as keyof typeof T.stems])}
                  </strong>
                  <a
                    href={url}
                    download={`${stem}.wav`}
                    style={{
                      padding: '0.35rem 0.8rem',
                      background: STEM_COLORS[stem] || ACCENT,
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {t(lang, T.download)}
                  </a>
                </div>
                <audio controls src={url} style={{ width: '100%', height: 40 }} />
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleReset}
              style={{
                padding: '0.7rem 1.8rem',
                background: 'transparent',
                color: ACCENT,
                border: `2px solid ${ACCENT}`,
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t(lang, T.newJob)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
