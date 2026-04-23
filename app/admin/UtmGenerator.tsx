'use client';

import { useMemo, useState } from 'react';

/**
 * UTM link generator — admin-only helper.
 *
 * Builds kuon-rnd.com URLs with utm_source / utm_medium / utm_campaign params
 * for attribution tracking. Purely client-side; no network calls.
 *
 * Styled to match admin dark theme (bg #1e293b, border #334155, text #e2e8f0,
 * accent #38bdf8 / #a78bfa). Mounted at the bottom of /admin.
 */

const BASE_URL = 'https://kuon-rnd.com';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

const DESTINATIONS: Array<{ value: string; label: string }> = [
  { value: '/',              label: '/ (トップ)' },
  { value: '/microphone',    label: '/microphone (マイク販売LP)' },
  { value: '/audio-apps',    label: '/audio-apps (アプリ一覧)' },
  { value: '/soundmap',      label: '/soundmap (地球音マップ)' },
  { value: '/events',        label: '/events (ライブマップ)' },
  { value: '/events-lp',     label: '/events-lp (ライブLP)' },
  { value: '/analog-tools',  label: '/analog-tools (アナログ機材)' },
  { value: '/auth/login',    label: '/auth/login (ログイン)' },
  { value: '/mypage',        label: '/mypage (マイページ)' },
  { value: '/how-it-works/dsd', label: '/how-it-works/dsd' },
  { value: '/how-it-works/ddp', label: '/how-it-works/ddp' },
];

const SOURCE_PRESETS = [
  'instagram', 'twitter', 'threads', 'facebook', 'youtube', 'tiktok',
  'line', 'newsletter', 'blog', 'podcast', 'qr',
];

const MEDIUM_PRESETS = [
  'social', 'email', 'referral', 'cpc', 'banner', 'bio', 'story',
  'post', 'qr-print', 'video-desc',
];

export default function UtmGenerator() {
  const [path, setPath] = useState<string>('/');
  const [source, setSource] = useState<string>('');
  const [medium, setMedium] = useState<string>('');
  const [campaign, setCampaign] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generated = useMemo(() => {
    if (!source.trim()) return '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(cleanPath, BASE_URL);
    url.searchParams.set('utm_source', source.trim());
    if (medium.trim()) url.searchParams.set('utm_medium', medium.trim());
    if (campaign.trim()) url.searchParams.set('utm_campaign', campaign.trim());
    return url.toString();
  }, [path, source, medium, campaign]);

  const handleCopy = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Fallback: select + copy via temporary textarea
      const ta = document.createElement('textarea');
      ta.value = generated;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* noop */ }
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  const fieldLabel: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#94a3b8',
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontFamily: sans,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.55rem 0.75rem',
    border: '1px solid #334155',
    borderRadius: 8,
    fontSize: '0.85rem',
    fontFamily: mono,
    outline: 'none',
    background: '#0f172a',
    color: '#e2e8f0',
    boxSizing: 'border-box',
  };
  const presetChip = (selected: boolean): React.CSSProperties => ({
    padding: '3px 9px',
    border: selected ? '1px solid #38bdf8' : '1px solid #334155',
    borderRadius: 999,
    background: selected ? 'rgba(56,189,248,0.1)' : '#0f172a',
    color: selected ? '#38bdf8' : '#94a3b8',
    fontSize: '0.7rem',
    cursor: 'pointer',
    fontFamily: sans,
    fontWeight: selected ? 600 : 400,
    whiteSpace: 'nowrap',
  });

  return (
    <div
      className="admin-card"
      style={{
        background: '#1e293b',
        borderRadius: 12,
        padding: '1.3rem 1.4rem',
        border: '1px solid #334155',
        marginTop: '1.5rem',
        animationDelay: '.3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#e2e8f0',
            margin: 0,
            fontFamily: sans,
            letterSpacing: '0.01em',
          }}
        >
          UTM リンク生成
        </h3>
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: sans }}>
          SNS / メール / QR などに貼るリンクに計測パラメータを付与
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.9rem',
          marginBottom: '1rem',
        }}
      >
        {/* Destination */}
        <div>
          <label style={fieldLabel}>遷移先</label>
          <select
            value={path}
            onChange={(e) => setPath(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {DESTINATIONS.map((d) => (
              <option key={d.value} value={d.value} style={{ background: '#0f172a', color: '#e2e8f0' }}>
                {d.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/custom/path"
            style={{ ...inputStyle, marginTop: 6, fontSize: '0.75rem' }}
          />
        </div>

        {/* Source */}
        <div>
          <label style={fieldLabel}>utm_source (必須)</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="instagram, newsletter..."
            style={inputStyle}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {SOURCE_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSource(p)}
                style={presetChip(source === p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Medium */}
        <div>
          <label style={fieldLabel}>utm_medium</label>
          <input
            type="text"
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            placeholder="social, email, cpc..."
            style={inputStyle}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {MEDIUM_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setMedium(p)}
                style={presetChip(medium === p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign */}
        <div>
          <label style={fieldLabel}>utm_campaign</label>
          <input
            type="text"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="spring-launch, p86s-promo..."
            style={inputStyle}
          />
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 6, fontFamily: sans }}>
            任意。キャンペーン単位で集計したい時に入力。
          </div>
        </div>
      </div>

      {/* Generated URL */}
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 8,
          padding: '0.85rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.68rem',
              color: '#64748b',
              marginBottom: 4,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontFamily: sans,
            }}
          >
            生成されたリンク
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: '0.82rem',
              color: generated ? '#e2e8f0' : '#475569',
              wordBreak: 'break-all',
              lineHeight: 1.4,
            }}
          >
            {generated || 'utm_source を入力してください...'}
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!generated}
          style={{
            padding: '0.5rem 1rem',
            background: !generated
              ? '#334155'
              : copied
                ? '#a78bfa'
                : '#38bdf8',
            color: !generated ? '#64748b' : '#0f172a',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: !generated ? 'not-allowed' : 'pointer',
            fontFamily: sans,
            whiteSpace: 'nowrap',
            transition: 'background .15s',
          }}
        >
          {copied ? 'コピー済み ✓' : 'コピー'}
        </button>
      </div>
    </div>
  );
}
