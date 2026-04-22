'use client';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';

const LANGS: { code: Lang; flag: string; name: string; nativeName: string }[] = [
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
  { code: 'en', flag: '🇬🇧', name: 'English', nativeName: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
  { code: 'ko', flag: '🇰🇷', name: 'Korean', nativeName: '한국어' },
  { code: 'pt', flag: '🇧🇷', name: 'Portuguese', nativeName: 'Português' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
];

const sans = '"Helvetica Neue", Arial, sans-serif';

export function LangSwitcher({ variant = 'inline' }: { variant?: 'inline' | 'stacked' }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGS.find(l => l.code === lang) ?? LANGS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Stacked variant — used in mobile overlay, keep simple pills
  if (variant === 'stacked') {
    return (
      <div style={{ display: 'inline-flex', gap: '0.3rem', padding: '0.4rem 0.6rem', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)' }}>
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            aria-label={`Switch language to ${l.name}`}
            aria-pressed={lang === l.code}
            style={{
              background: lang === l.code ? '#0284c7' : 'transparent',
              color: lang === l.code ? '#fff' : '#94a3b8',
              border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em',
              fontFamily: sans, padding: '0.55rem 1.1rem', borderRadius: '999px',
              transition: 'background 0.25s ease, color 0.25s ease', lineHeight: 1.2,
            }}
          >
            {l.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant — desktop header
  const triggerStyle: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    background: open ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '999px', padding: '0.32rem 0.7rem 0.32rem 0.55rem',
    cursor: 'pointer', fontFamily: sans, fontSize: '0.75rem',
    fontWeight: 500, letterSpacing: '0.08em', color: '#555',
    transition: 'background 0.2s ease, border-color 0.2s ease',
    lineHeight: 1.2, whiteSpace: 'nowrap' as const,
  };

  const dropdownStyle: CSSProperties = {
    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
    background: '#fff', borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
    padding: '0.35rem', minWidth: '180px', zIndex: 300,
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.97)',
    pointerEvents: open ? 'auto' as const : 'none' as const,
    transition: 'opacity 0.2s ease, transform 0.2s cubic-bezier(0.2,0.8,0.4,1)',
  };

  const itemStyle = (active: boolean, hovered: boolean): CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%',
    padding: '0.55rem 0.75rem', borderRadius: '8px',
    background: active ? 'rgba(2,132,199,0.08)' : hovered ? 'rgba(0,0,0,0.03)' : 'transparent',
    border: 'none', cursor: 'pointer', fontFamily: sans,
    fontSize: '0.8rem', fontWeight: active ? 600 : 400,
    color: active ? '#0284c7' : '#333', textAlign: 'left' as const,
    transition: 'background 0.15s ease',
    lineHeight: 1.3,
  });

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Switch language"
        aria-expanded={open}
        style={triggerStyle}
        onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="#888" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={dropdownStyle} role="listbox" aria-label="Language selection">
        {LANGS.map((l) => {
          const active = lang === l.code;
          return (
            <LangItem
              key={l.code}
              lang={l}
              active={active}
              itemStyle={itemStyle}
              onSelect={() => { setLang(l.code); setOpen(false); }}
            />
          );
        })}
      </div>
    </div>
  );
}

function LangItem({ lang: l, active, itemStyle, onSelect }: {
  lang: { code: Lang; flag: string; name: string; nativeName: string };
  active: boolean;
  itemStyle: (active: boolean, hovered: boolean) => CSSProperties;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      role="option"
      aria-selected={active}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={itemStyle(active, hovered)}
    >
      <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{l.flag}</span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block' }}>{l.nativeName}</span>
        <span style={{ display: 'block', fontSize: '0.68rem', color: '#999', fontWeight: 400, marginTop: '0.1rem' }}>{l.name}</span>
      </span>
      {active && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7L6 10L11 4" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
