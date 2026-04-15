'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'ja' | 'en' | 'es';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'ja',
  setLang: () => {},
});

const VALID_LANGS: Lang[] = ['ja', 'en', 'es'];

function detectLang(browserLang: string): Lang {
  const l = browserLang.toLowerCase();
  if (l.startsWith('ja')) return 'ja';
  if (l.startsWith('es')) return 'es';
  // Portuguese / Italian / French speakers get English as closest fallback
  return 'en';
}

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'ja';
  const saved = localStorage.getItem('kuon-lang') as Lang | null;
  if (saved && VALID_LANGS.includes(saved)) return saved;
  return detectLang(navigator.language || '');
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ja');

  useEffect(() => {
    setLangState(getInitialLang());
  }, []);

  const setLang = (l: Lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kuon-lang', l);
    }
    setLangState(l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
