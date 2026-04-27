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
  quota: Quota | undefined;
}

// ─────────────────────────────────────────────
// エラーメッセージ翻訳 (Cloud Run の code:detail を日本語化)
// ─────────────────────────────────────────────
function translateError(raw: string): string {
  if (!raw) return '不明なエラーが発生しました';
  const map: Record<string, string> = {
    unsupported_format: '対応していないファイル形式です。MP3 / WAV / FLAC / M4A をお試しください',
    file_too_large: 'ファイルサイズが大きすぎます (50MB 以下にしてください)',
    duration_too_long: '曲が長すぎます (10 分以内にしてください)',
    unreadable_audio: '音源ファイルを読み込めませんでした。ファイルが破損していないかご確認ください',
    separation_failed: '音源分離に失敗しました。別の曲でお試しください',
    upload_failed: 'ステムのアップロードに失敗しました。もう一度お試しください',
    internal_error: 'サーバー側で予期しないエラーが発生しました。しばらく待ってから再試行してください',
    job_not_found: 'ジョブが見つかりません',
    auth_required: 'ログインが必要です',
    quota_exceeded: '今月のクォータを使い切りました',
    service_unavailable: 'サービスが一時的に利用できません',
    service_unreachable: 'サーバーに接続できません',
  };
  // raw が "code:メッセージ" 形式 (Cloud Run の HTTPException)
  if (raw.includes(':')) {
    return raw.split(':').slice(1).join(':').trim();
  }
  return map[raw] || raw;
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
  // ── 非同期化用 (Phase A: 絶対安定) ──
  const [jobStage, setJobStage] = useState<'idle' | 'queued' | 'separating' | 'uploading' | 'completed' | 'failed'>('idle');
  const [jobProgress, setJobProgress] = useState(0);
  const [jobEtaSec, setJobEtaSec] = useState<number | null>(null);
  const [jobElapsed, setJobElapsed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const pollStartTimeRef = useRef<number>(0);

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

  // ── Submit (非同期パターン: jobs 投稿 → ポーリング) ──
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setUpgradeInfo(null);
    setResult(null);
    setJobStage('queued');
    setJobProgress(0);
    setJobElapsed(0);
    pollStartTimeRef.current = Date.now();

    const formData = new FormData();
    formData.append('audio', file);

    try {
      // Step 1: ジョブ投入
      const submitRes = await fetch('/api/separator/jobs', {
        method: 'POST',
        body: formData,
      });

      if (submitRes.status === 429) {
        const payload = await submitRes.json() as QuotaExceededResponse;
        setUpgradeInfo(payload);
        setQuota({ plan: payload.plan, used: payload.used, limit: payload.limit, remaining: 0 });
        setIsProcessing(false);
        setJobStage('idle');
        return;
      }
      if (submitRes.status === 401) {
        setAuthRequired(true);
        setIsProcessing(false);
        setJobStage('idle');
        return;
      }
      if (!submitRes.ok) {
        const err = await submitRes.json().catch(() => ({ error: 'unknown' }));
        setError(translateError(err.detail || err.error || 'Submission failed'));
        setIsProcessing(false);
        setJobStage('failed');
        return;
      }

      const submitData = await submitRes.json() as {
        jobId: string;
        status: string;
        inputDurationSec?: number;
        estimatedProcessingSec?: number;
        quota?: Quota;
      };
      if (submitData.quota) setQuota(submitData.quota);
      if (submitData.estimatedProcessingSec) setJobEtaSec(submitData.estimatedProcessingSec);

      // Step 2: ポーリング (5 秒間隔)
      const jobId = submitData.jobId;
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 5;

      pollIntervalRef.current = window.setInterval(async () => {
        setJobElapsed(Math.floor((Date.now() - pollStartTimeRef.current) / 1000));
        try {
          const statusRes = await fetch(`/api/separator/jobs/${jobId}`);
          if (!statusRes.ok) {
            consecutiveErrors++;
            if (consecutiveErrors >= maxConsecutiveErrors) {
              stopPolling();
              setError('サーバーとの通信に失敗しました。少し待ってから再試行してください。');
              setIsProcessing(false);
              setJobStage('failed');
            }
            return;
          }
          consecutiveErrors = 0;
          const job = await statusRes.json() as {
            status: string;
            stage?: string;
            progress?: number;
            error?: string;
            detail?: string;
            urls?: Record<string, string>;
            model?: string;
            input_duration_sec?: number;
            processing_time_sec?: number;
            expires_in_sec?: number;
          };

          if (job.stage) setJobStage(job.stage as typeof jobStage);
          else setJobStage(job.status as typeof jobStage);
          if (typeof job.progress === 'number') setJobProgress(job.progress);

          if (job.status === 'completed' && job.urls) {
            stopPolling();
            setResult({
              jobId,
              model: job.model || 'htdemucs',
              inputDurationSec: job.input_duration_sec || 0,
              processingTimeSec: job.processing_time_sec || 0,
              urls: job.urls as SeparationResult['urls'],
              expiresInSec: job.expires_in_sec || 86400,
              quota: undefined,
            });
            setJobStage('completed');
            setJobProgress(100);
            setIsProcessing(false);
          } else if (job.status === 'failed') {
            stopPolling();
            setError(translateError(job.detail || job.error || 'Separation failed'));
            setIsProcessing(false);
            setJobStage('failed');
          }
        } catch (e) {
          consecutiveErrors++;
          if (consecutiveErrors >= maxConsecutiveErrors) {
            stopPolling();
            setError(`通信エラー: ${e instanceof Error ? e.message : String(e)}`);
            setIsProcessing(false);
            setJobStage('failed');
          }
        }
      }, 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setIsProcessing(false);
      setJobStage('failed');
    }
  };

  // クリーンアップ: ページ離脱時にポーリング停止
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleReset = () => {
    stopPolling();
    setFile(null);
    setResult(null);
    setError(null);
    setUpgradeInfo(null);
    setJobStage('idle');
    setJobProgress(0);
    setJobElapsed(0);
    setJobEtaSec(null);
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

          {/* IQ180 マルチトラックプレーヤー: ソロ/ミュート/同期再生 */}
          <MultitrackPlayer urls={result.urls} lang={lang} />


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

      {/* 進捗表示 (非同期処理中) */}
      {isProcessing && jobStage !== 'idle' && jobStage !== 'completed' && jobStage !== 'failed' && (
        <ProgressPanel
          stage={jobStage}
          progress={jobProgress}
          elapsed={jobElapsed}
          etaSec={jobEtaSec}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Multi-track Player (DAW 風: ソロ・ミュート・同期再生)
// IQ180 機能: 4 ステムを 1 つのトランスポートで操作
// ─────────────────────────────────────────────
type StemKey = 'drums' | 'bass' | 'vocals' | 'other';

function MultitrackPlayer({ urls, lang }: { urls: Record<string, string>; lang: Lang }) {
  const stems = (['drums', 'bass', 'vocals', 'other'] as const).filter((s) => urls[s]);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumes, setVolumes] = useState<Record<string, number>>(
    () => Object.fromEntries(stems.map((s) => [s, 0.85]))
  );
  const [muted, setMuted] = useState<Record<string, boolean>>(
    () => Object.fromEntries(stems.map((s) => [s, false]))
  );
  const [solo, setSolo] = useState<Record<string, boolean>>(
    () => Object.fromEntries(stems.map((s) => [s, false]))
  );

  // Effective mute (solo が 1 つ以上有効なら、solo してない trackを mute)
  const isAnySolo = Object.values(solo).some(Boolean);
  const effectiveMute = (s: string) => muted[s] || (isAnySolo && !solo[s]);

  // Volume と mute をリアルタイム反映
  useEffect(() => {
    for (const s of stems) {
      const audio = audioRefs.current[s];
      if (!audio) continue;
      audio.volume = volumes[s];
      audio.muted = effectiveMute(s);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volumes, muted, solo, isAnySolo]);

  // 全トラックの再生時間を取得 (1 つでも duration が出れば OK)
  useEffect(() => {
    const handler = () => {
      let maxDur = 0;
      for (const s of stems) {
        const audio = audioRefs.current[s];
        if (audio && !isNaN(audio.duration) && audio.duration > maxDur) {
          maxDur = audio.duration;
        }
      }
      if (maxDur > 0) setDuration(maxDur);
    };
    for (const s of stems) {
      const audio = audioRefs.current[s];
      if (audio) audio.addEventListener('loadedmetadata', handler);
    }
    return () => {
      for (const s of stems) {
        const audio = audioRefs.current[s];
        if (audio) audio.removeEventListener('loadedmetadata', handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 再生時間更新 (リーダートラックを基準)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      const leader = audioRefs.current[stems[0]];
      if (leader) setCurrentTime(leader.currentTime);
    }, 100);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // 全トラック同時再生・停止
  const handlePlayPause = async () => {
    if (isPlaying) {
      for (const s of stems) audioRefs.current[s]?.pause();
      setIsPlaying(false);
    } else {
      // 全部の currentTime を leader に合わせる
      const leader = audioRefs.current[stems[0]];
      const t = leader?.currentTime ?? 0;
      for (const s of stems) {
        const a = audioRefs.current[s];
        if (a) a.currentTime = t;
      }
      // 全部同時に再生開始
      const promises = stems.map((s) => audioRefs.current[s]?.play());
      await Promise.all(promises);
      setIsPlaying(true);
    }
  };

  // シーク (全トラック)
  const handleSeek = (newTime: number) => {
    for (const s of stems) {
      const a = audioRefs.current[s];
      if (a) a.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  // 終了したら停止
  useEffect(() => {
    const handler = () => setIsPlaying(false);
    for (const s of stems) {
      const a = audioRefs.current[s];
      if (a) a.addEventListener('ended', handler);
    }
    return () => {
      for (const s of stems) {
        const a = audioRefs.current[s];
        if (a) a.removeEventListener('ended', handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmtTime = (sec: number): string => {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const STEM_LABEL: Record<StemKey, string> = {
    drums:  lang === 'ja' ? 'ドラム'   : 'Drums',
    bass:   lang === 'ja' ? 'ベース'   : 'Bass',
    vocals: lang === 'ja' ? 'ボーカル' : 'Vocals',
    other:  lang === 'ja' ? 'その他'   : 'Other',
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 20,
      border: '1px solid #e2e8f0', marginBottom: 24,
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    }}>
      {/* マスター・トランスポート */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 16px', background: '#f8fafc',
        borderRadius: 10, marginBottom: 16, flexWrap: 'wrap',
      }}>
        <button
          onClick={handlePlayPause}
          style={{
            width: 50, height: 50, borderRadius: '50%',
            border: 'none', background: ACCENT, color: '#fff',
            fontSize: 22, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '■' : '▶'}
        </button>
        <span style={{ fontFamily: 'SF Mono, Consolas, monospace', fontSize: 13, color: '#475569', minWidth: 90 }}>
          {fmtTime(currentTime)} / {fmtTime(duration)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
          style={{ flex: 1, minWidth: 200, accentColor: ACCENT }}
        />
      </div>

      {/* トラック行 (各ステム) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stems.map((stem) => {
          const isMuted = effectiveMute(stem);
          const color = STEM_COLORS[stem] || ACCENT;
          return (
            <div key={stem} style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 100px) auto auto minmax(0, 1fr) auto',
              gap: 10, alignItems: 'center',
              padding: '10px 12px',
              background: isMuted ? '#f1f5f9' : '#fff',
              border: `1px solid ${isMuted ? '#cbd5e1' : color + '40'}`,
              borderRadius: 8, opacity: isMuted ? 0.55 : 1,
              transition: 'all 0.15s',
            }}>
              {/* ラベル */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, minWidth: 0,
              }}>
                <div style={{ width: 6, height: 24, background: color, borderRadius: 3 }} />
                <strong style={{ color, fontSize: 13 }}>{STEM_LABEL[stem]}</strong>
              </div>

              {/* Solo */}
              <button
                onClick={() => setSolo((sv) => ({ ...sv, [stem]: !sv[stem] }))}
                title="Solo"
                style={{
                  width: 32, height: 28, borderRadius: 5,
                  border: '1px solid ' + (solo[stem] ? color : '#cbd5e1'),
                  background: solo[stem] ? color : 'transparent',
                  color: solo[stem] ? '#fff' : '#64748b',
                  fontSize: 10, fontWeight: 700, cursor: 'pointer',
                }}
              >S</button>

              {/* Mute */}
              <button
                onClick={() => setMuted((mv) => ({ ...mv, [stem]: !mv[stem] }))}
                title="Mute"
                style={{
                  width: 32, height: 28, borderRadius: 5,
                  border: '1px solid ' + (muted[stem] ? '#ef4444' : '#cbd5e1'),
                  background: muted[stem] ? '#ef4444' : 'transparent',
                  color: muted[stem] ? '#fff' : '#64748b',
                  fontSize: 10, fontWeight: 700, cursor: 'pointer',
                }}
              >M</button>

              {/* Volume */}
              <input
                type="range" min={0} max={1} step={0.01}
                value={volumes[stem]}
                onChange={(e) => setVolumes((vv) => ({ ...vv, [stem]: parseFloat(e.target.value) }))}
                style={{ width: '100%', accentColor: color }}
                title={`Volume ${Math.round(volumes[stem] * 100)}%`}
              />

              {/* Download */}
              <a
                href={urls[stem]}
                download={`${stem}.wav`}
                style={{
                  padding: '4px 10px', background: color, color: '#fff',
                  borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: 'none',
                }}
              >⤓</a>

              {/* Hidden audio elements */}
              <audio
                ref={(el) => { audioRefs.current[stem] = el; }}
                src={urls[stem]}
                preload="auto"
                style={{ display: 'none' }}
              />
            </div>
          );
        })}
      </div>

      {/* ヘルプ */}
      <div style={{
        marginTop: 12, padding: '10px 12px',
        background: '#fef3c7', borderRadius: 6,
        fontSize: 11, color: '#92400e', lineHeight: 1.6,
      }}>
        💡 {lang === 'ja'
          ? 'S = Solo (そのトラックだけ聴く) ・ M = Mute (そのトラックだけ消す) ・ スライダーで音量調整。マイナスワン練習に: ボーカルを Mute / 自分の楽器パートを Solo'
          : 'S = Solo (hear only this track) · M = Mute · Slider for volume. For minus-one practice: Mute vocals / Solo a single instrument.'}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Progress Panel (非同期処理中の進捗表示)
// ─────────────────────────────────────────────
function ProgressPanel({
  stage, progress, elapsed, etaSec,
}: {
  stage: 'idle' | 'queued' | 'separating' | 'uploading' | 'completed' | 'failed';
  progress: number;
  elapsed: number;
  etaSec: number | null;
}) {
  const stageLabels: Record<typeof stage, string> = {
    idle: '',
    queued: '🎵 ジョブを受け付けました',
    separating: '🎛 AI が音源を分離中...',
    uploading: '☁️ 結果をアップロード中...',
    completed: '✅ 完了',
    failed: '❌ 失敗',
  };
  const fmtSec = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const remaining = etaSec ? Math.max(0, etaSec - elapsed) : null;

  return (
    <div style={{
      padding: '24px 20px', background: '#fff',
      border: '2px solid ' + ACCENT, borderRadius: 12,
      marginBottom: 24, boxShadow: '0 4px 24px rgba(124,58,237,0.15)',
    }}>
      <div style={{ fontSize: 16, color: ACCENT_DARK, marginBottom: 12, fontWeight: 600 }}>
        {stageLabels[stage]}
      </div>
      <div style={{
        background: '#f1f5f9', borderRadius: 999, height: 12, overflow: 'hidden',
        marginBottom: 10,
      }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK})`,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
        <span>経過 {fmtSec(elapsed)}</span>
        <span>{progress.toFixed(0)}%</span>
        {remaining !== null && <span>残り 約 {fmtSec(remaining)}</span>}
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
        💡 ブラウザを閉じても処理は続きます。後でまた開けば結果を確認できます。
      </div>
    </div>
  );
}
