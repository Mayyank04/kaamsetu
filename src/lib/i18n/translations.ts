import { AppLocale, LocaleMetadata, TranslationDictionary } from "./types";
import { en } from "./locales/en";
import { hi } from "./locales/hi";
import { as } from "./locales/as";
import { bn } from "./locales/bn";
import { or } from "./locales/or";
import { pa } from "./locales/pa";
import { gu } from "./locales/gu";
import { mr } from "./locales/mr";
import { ur } from "./locales/ur";
import { ta } from "./locales/ta";
import { te } from "./locales/te";
import { kn } from "./locales/kn";
import { ml } from "./locales/ml";
import { ne } from "./locales/ne";
import { brx } from "./locales/brx";
import { mni } from "./locales/mni";
import { ks } from "./locales/ks";
import { sa } from "./locales/sa";

export * from "./types";

export const APP_TRANSLATIONS: Record<AppLocale, TranslationDictionary> = {
  en,
  hi,
  as,
  bn,
  or,
  pa,
  gu,
  mr,
  ur,
  ta,
  te,
  kn,
  ml,
  ne,
  brx,
  mni,
  ks,
  sa,
};

export const SUPPORTED_LOCALES_METADATA: LocaleMetadata[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    greeting: "Welcome",
    direction: "ltr",
    script: "Latin",
    region: "Pan-India / Global",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    greeting: "नमस्ते",
    direction: "ltr",
    script: "Devanagari",
    region: "North & Central India",
  },
  {
    code: "as",
    name: "Assamese",
    nativeName: "অসমীয়া",
    greeting: "নমস্কাৰ",
    direction: "ltr",
    script: "Bengali-Assamese",
    region: "Assam / Northeast",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    greeting: "নমস্কার",
    direction: "ltr",
    script: "Bengali",
    region: "West Bengal / Northeast",
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    greeting: "ନମସ୍କାର",
    direction: "ltr",
    script: "Odia",
    region: "Odisha / Eastern India",
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ",
    direction: "ltr",
    script: "Gurmukhi",
    region: "Punjab / Northern India",
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    greeting: "નમસ્તે",
    direction: "ltr",
    script: "Gujarati",
    region: "Gujarat / Western India",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    greeting: "नमस्कार",
    direction: "ltr",
    script: "Devanagari",
    region: "Maharashtra / Western India",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    greeting: "آداب / سلام",
    direction: "rtl",
    script: "Nastaliq / Perso-Arabic",
    region: "Pan-India / Northern / Deccan",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    greeting: "வணக்கம்",
    direction: "ltr",
    script: "Tamil",
    region: "Tamil Nadu / Southern India",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    greeting: "నమస్కారం",
    direction: "ltr",
    script: "Telugu",
    region: "Andhra Pradesh & Telangana",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    greeting: "ನಮಸ್ಕಾರ",
    direction: "ltr",
    script: "Kannada",
    region: "Karnataka / Southern India",
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    greeting: "നമസ്കാരം",
    direction: "ltr",
    script: "Malayalam",
    region: "Kerala / Southern India",
  },
  {
    code: "ne",
    name: "Nepali",
    nativeName: "नेपाली",
    greeting: "नमस्ते",
    direction: "ltr",
    script: "Devanagari",
    region: "Sikkim / North Bengal / Himalayan",
  },
  {
    code: "brx",
    name: "Bodo",
    nativeName: "बड़ो",
    greeting: "खुलुमबाय",
    direction: "ltr",
    script: "Devanagari",
    region: "Bodoland / Assam",
  },
  {
    code: "mni",
    name: "Manipuri",
    nativeName: "মৈতৈলোন্",
    greeting: "খুরুমজরি",
    direction: "ltr",
    script: "Bengali / Meitei Mayek",
    region: "Manipur / Northeast",
  },
  {
    code: "ks",
    name: "Kashmiri",
    nativeName: "کٲشُر",
    greeting: "سلام / نمسکار",
    direction: "rtl",
    script: "Perso-Arabic",
    region: "Jammu & Kashmir",
  },
  {
    code: "sa",
    name: "Sanskrit",
    nativeName: "संस्कृतम्",
    greeting: "नमो नमः",
    direction: "ltr",
    script: "Devanagari",
    region: "Pan-India Classical",
  },
];

export const DEFAULT_LOCALE: AppLocale = "en";
export const FALLBACK_LOCALES: AppLocale[] = ["en", "hi"];

/**
 * Resilient translation resolver with fallback to Hindi and English
 */
export function getTranslation(locale: string | null | undefined): TranslationDictionary {
  if (locale && (locale as AppLocale) in APP_TRANSLATIONS) {
    return APP_TRANSLATIONS[locale as AppLocale];
  }
  return APP_TRANSLATIONS.en;
}
