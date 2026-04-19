'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'ja' | 'en' | 'ko' | 'pt' | 'es';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'ja',
  setLang: () => {},
});

const VALID_LANGS: Lang[] = ['ja', 'en', 'ko', 'pt', 'es'];

function detectLang(browserLang: string): Lang {
  const l = browserLang.toLowerCase();
  if (l.startsWith('ja')) return 'ja';
  if (l.startsWith('ko')) return 'ko';
  if (l.startsWith('pt')) return 'pt';
  if (l.startsWith('es')) return 'es';
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

/**
 * 多言語テキストヘルパー
 * 全5言語を持つオブジェクトから現在の言語のテキストを返す。
 * ko/pt が未定義の場合は en にフォールバック。
 */
export type L5 = Record<Lang, string>;

/** 3言語 → 5言語変換（ko/pt は en にフォールバック） */
export function l(ja: string, en: string, ko?: string, pt?: string, es?: string): L5 {
  return { ja, en, ko: ko ?? en, pt: pt ?? en, es: es ?? en };
}
