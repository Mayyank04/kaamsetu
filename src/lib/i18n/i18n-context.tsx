"use client";

import * as React from "react";
import {
  AppLocale,
  APP_TRANSLATIONS,
  TranslationDictionary,
  DEFAULT_LOCALE,
  TextDirection,
  SUPPORTED_LOCALES,
} from "./translations";

interface I18nContextType {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  direction: TextDirection;
  isRTL: boolean;
  textSize: "normal" | "large";
  setTextSize: (size: "normal" | "large") => void;
  t: TranslationDictionary;
}

const STORAGE_LOCALE_KEY = "kaamsetu_user_locale";
const STORAGE_TEXT_SIZE_KEY = "kaamsetu_text_size";

const I18nContext = React.createContext<I18nContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  direction: "ltr",
  isRTL: false,
  textSize: "normal",
  setTextSize: () => {},
  t: APP_TRANSLATIONS.en,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<AppLocale>(DEFAULT_LOCALE);
  const [textSize, setTextSizeState] = React.useState<"normal" | "large">("normal");

  // Restore preferences from localStorage on mount
  React.useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(STORAGE_LOCALE_KEY) as AppLocale | null;
      if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale) && APP_TRANSLATIONS[savedLocale]) {
        setLocaleState(savedLocale);
      }
      const savedSize = localStorage.getItem(STORAGE_TEXT_SIZE_KEY) as "normal" | "large" | null;
      if (savedSize === "normal" || savedSize === "large") {
        setTextSizeState(savedSize);
      }
    } catch {
      // LocalStorage unavailable in SSR or sandboxed environments
    }
  }, []);

  const activeTranslation = React.useMemo(() => {
    return APP_TRANSLATIONS[locale] || APP_TRANSLATIONS.en;
  }, [locale]);

  const direction: TextDirection = activeTranslation.direction || "ltr";
  const isRTL = direction === "rtl";

  // Synchronize documentElement language, direction, and typography scaling
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;

    if (textSize === "large") {
      document.documentElement.classList.add("text-size-large");
    } else {
      document.documentElement.classList.remove("text-size-large");
    }
  }, [locale, direction, textSize]);

  const setLocale = React.useCallback((newLocale: AppLocale) => {
    if (APP_TRANSLATIONS[newLocale]) {
      setLocaleState(newLocale);
      try {
        localStorage.setItem(STORAGE_LOCALE_KEY, newLocale);
      } catch {
        // LocalStorage write failed
      }
    }
  }, []);

  const setTextSize = React.useCallback((newSize: "normal" | "large") => {
    setTextSizeState(newSize);
    try {
      localStorage.setItem(STORAGE_TEXT_SIZE_KEY, newSize);
    } catch {
      // LocalStorage write failed
    }
  }, []);

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      direction,
      isRTL,
      textSize,
      setTextSize,
      t: activeTranslation,
    }),
    [locale, setLocale, direction, isRTL, textSize, setTextSize, activeTranslation]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = React.useContext(I18nContext);
  return context;
}
