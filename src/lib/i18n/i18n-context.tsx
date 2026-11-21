"use client";

import * as React from "react";
import { AppLocale, APP_TRANSLATIONS, TranslationDictionary } from "./translations";

interface I18nContextType {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: TranslationDictionary;
}

const I18nContext = React.createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: APP_TRANSLATIONS.en,
});

const STORAGE_LOCALE_KEY = "kaamsetu_user_locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<AppLocale>("en");

  React.useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(STORAGE_LOCALE_KEY) as AppLocale | null;
      if (savedLocale && APP_TRANSLATIONS[savedLocale]) {
        setLocaleState(savedLocale);
      }
    } catch {
      // LocalStorage unavailable in SSR or sandboxed environments
    }
  }, []);

  const setLocale = React.useCallback((newLocale: AppLocale) => {
    if (APP_TRANSLATIONS[newLocale]) {
      setLocaleState(newLocale);
      try {
        localStorage.setItem(STORAGE_LOCALE_KEY, newLocale);
      } catch {
        // LocalStorage unavailable
      }
    }
  }, []);

  const value = React.useMemo(() => ({
    locale,
    setLocale,
    t: APP_TRANSLATIONS[locale] || APP_TRANSLATIONS.en,
  }), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = React.useContext(I18nContext);
  return context;
}
