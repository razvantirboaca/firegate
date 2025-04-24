import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { Locale } from '@shared/types/I18n';

interface LangContextValue {
  uiLang: Locale;
  setUiLang: (lang: Locale) => void;
}

const LangContext = createContext<LangContextValue>({ uiLang: 'en', setUiLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [uiLang, setUiLangState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('uiLang') as Locale | null;
    if (saved) setUiLangState(saved);
  }, []);

  const setUiLang = (lang: Locale) => {
    localStorage.setItem('uiLang', lang);
    setUiLangState(lang);
  };

  return <LangContext.Provider value={{ uiLang, setUiLang }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
