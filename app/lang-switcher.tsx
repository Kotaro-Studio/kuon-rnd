'use client';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import type { CSSProperties } from 'react';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ja', label: 'JA' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export function LangSwitcher({ variant = 'inline' }: { variant?: 'inline' | 'stacked' }) {
  const { lang, setLang } = useLang();

  const wrap: CSSProperties = variant === 'inline'
    ? {
        display: 'inline-flex', gap: '0.15rem',
        backgroundColor: 'rgba(0,0,0,0.04)',
        borderRadius: '999px', padding: '0.22rem 0.32rem',
        border: '1px solid rgba(0,0,0,0.06)',
      }
    : {
        display: 'inline-flex', gap: '0.3rem',
        padding: '0.4rem 0.6rem',
        borderRadius: '999px',
        backgroundColor: 'rgba(255,255,255,0.8)',
        border: '1px solid rgba(0,0,0,0.08)',
      };

  const pill = (active: boolean): CSSProperties => ({
    background: active ? '#0284c7' : 'transparent',
    color: active ? '#fff' : '#94a3b8',
    border: 'none', cursor: 'pointer',
    fontSize: variant === 'stacked' ? '0.85rem' : '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    padding: variant === 'stacked' ? '0.55rem 1.1rem' : '0.28rem 0.55rem',
    borderRadius: '999px',
    transition: 'background 0.25s ease, color 0.25s ease',
    lineHeight: 1.2,
  });

  return (
    <div className="kuon-lang-switcher" style={wrap}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-label={`Switch language to ${l.label}`}
          aria-pressed={lang === l.code}
          style={pill(lang === l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
