'use client';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ja', label: 'JA' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
  { code: 'de', label: 'DE' },
];

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div
      className="kuon-lang-switcher"
      style={{
        display: 'flex', gap: '0.15rem',
        backgroundColor: 'rgba(0,0,0,0.04)',
        borderRadius: '50px', padding: '0.25rem 0.4rem',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          style={{
            background: lang === l.code ? '#0284c7' : 'transparent',
            color: lang === l.code ? '#fff' : '#9ca3af',
            border: 'none', cursor: 'pointer',
            fontSize: '0.65rem', fontWeight: '600',
            letterSpacing: '0.06em',
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            padding: '0.2rem 0.45rem',
            borderRadius: '20px',
            transition: 'all 0.2s',
            lineHeight: 1.4,
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
