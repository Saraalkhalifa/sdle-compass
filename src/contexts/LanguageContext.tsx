import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Lang = 'en' | 'ar';

interface LanguageContextValue {
  lang: Lang;
  isRTL: boolean;
  t: (en: string, ar: string) => string;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>');
  return ctx;
}

const STORAGE_KEY = 'sdle-lang';

function applyDir(l: Lang) {
  document.documentElement.dir  = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = l === 'ar' ? 'ar-SA' : 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'ar') return stored as Lang;
    } catch {
      // localStorage unavailable in SSR or sandboxed contexts
    }
    return 'en';
  });

  useEffect(() => { applyDir(lang); }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
    applyDir(l);
  }, []);

  const t = useCallback((en: string, ar: string) => lang === 'ar' ? ar : en, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, isRTL: lang === 'ar', t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
