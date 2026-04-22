'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Lang = 'ja' | 'en' | 'ko' | 'pt' | 'es' | 'de';

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'ja',
  setLang: () => {},
});

const VALID_LANGS: Lang[] = ['ja', 'en', 'ko', 'pt', 'es', 'de'];

function detectLang(browserLang: string): Lang {
  const l = browserLang.toLowerCase();
  if (l.startsWith('ja')) return 'ja';
  if (l.startsWith('ko')) return 'ko';
  if (l.startsWith('pt')) return 'pt';
  if (l.startsWith('es')) return 'es';
  if (l.startsWith('de')) return 'de';
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
 * 全6言語（ja/en/ko/pt/es/de）を持つオブジェクトから現在の言語のテキストを返す。
 * 未定義の場合は en にフォールバック。
 * 段階的な de 追加を許容するため Partial + en 必須 にしてある。
 */
export type L5 = Partial<Record<Lang, string>> & { en: string };

/** 3言語 → 6言語変換（未指定は en にフォールバック） */
export function l(ja: string, en: string, ko?: string, pt?: string, es?: string, de?: string): L5 {
  return { ja, en, ko: ko ?? en, pt: pt ?? en, es: es ?? en, de: de ?? en };
}
