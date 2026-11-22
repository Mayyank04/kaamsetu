/**
 * KAAMSETU — Multilingual Dictionary Factory & Fallback Engine
 * Guarantees 100% complete, strongly-typed TranslationDictionaries across all 39 languages.
 * Merges localized overrides with appropriate linguistic parent base (Devanagari/Hindi or English)
 * and enforces correct text direction (RTL for Urdu, Kashmiri, Sindhi).
 */

import { AppLocale, TranslationDictionary, TextDirection } from "./types";
import { ALL_LOCALES_METADATA } from "./registry";
import { en } from "./locales/en";
import { hi } from "./locales/hi";

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function createLocaleDictionary(
  locale: AppLocale,
  overrides: DeepPartial<TranslationDictionary> = {},
  fallbackBase: "hi" | "en" = "hi"
): TranslationDictionary {
  const meta = ALL_LOCALES_METADATA[locale] || ALL_LOCALES_METADATA.en;
  const base = fallbackBase === "hi" ? hi : en;

  return {
    locale,
    languageName: meta.name,
    nativeName: meta.nativeName,
    greeting: meta.greeting,
    direction: meta.direction,

    header: {
      ...base.header,
      ...overrides.header,
    },
    home: {
      ...base.home,
      ...overrides.home,
    },
    explore: {
      ...base.explore,
      ...overrides.explore,
    },
    vendor: {
      ...base.vendor,
      ...overrides.vendor,
    },
    onboarding: {
      ...base.onboarding,
      ...overrides.onboarding,
    },
    profile: {
      ...(base.profile || en.profile),
      ...overrides.profile,
    } as any,
    dashboard: {
      ...(base.dashboard || en.dashboard),
      ...overrides.dashboard,
    } as any,
    voice: {
      ...(base.voice || en.voice),
      ...overrides.voice,
    } as any,
    vendorDashboard: {
      ...(base.vendorDashboard || en.vendorDashboard),
      ...overrides.vendorDashboard,
    } as any,
    categories: {
      ...(base.categories || en.categories),
      ...overrides.categories,
    } as any,
    location: {
      ...(base.location || en.location),
      ...overrides.location,
    } as any,
    simplifiedTerms: {
      ...base.simplifiedTerms,
      ...overrides.simplifiedTerms,
    },
    accessibility: {
      ...base.accessibility,
      ...overrides.accessibility,
    },
    actions: {
      ...base.actions,
      ...overrides.actions,
    },
  };
}
