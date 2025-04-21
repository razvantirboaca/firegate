import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSavedLang, saveLang } from './langStorage';

const LangContext = createContext({ uiLang: 'en', setUiLang: () => {} });

export function LangProvider({ children }) {
  const [uiLang, setUiLangState] = useState('en');
  useEffect(() => {
    const lang = getSavedLang();
    if (lang) setUiLangState(lang);
  }, []);
  const setUiLang = (lang) => {
    saveLang(lang);
    setUiLangState(lang);
  };
  return (
    <LangContext.Provider value={{ uiLang, setUiLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}