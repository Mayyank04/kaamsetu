/**
 * KAAMSETU — Universal Translation System Types
 * Defines provider-independent contracts, language capabilities,
 * detection results, caching tokens, and user translation preferences.
 */

import { AppLocale, TextDirection } from "../i18n/types";

export type TranslationProviderType =
  | "gemini"
  | "bhashini"
  | "google_cloud"
  | "azure"
  | "deterministic";

export type TranslationContentType =
  | "public_profile"
  | "product_catalog"
  | "service_description"
  | "booking_instruction"
  | "customer_enquiry"
  | "portfolio_item"
  | "voice_transcript"
  | "general";

export type TranslationStatus =
  | "translated"
  | "same_language"
  | "partial_translation"
  | "fallback_limited"
  | "provider_unavailable"
  | "unsupported_language_pair"
  | "translation_failed";

export interface LanguageCapability {
  code: AppLocale;
  name: string;
  nativeName: string;
  script: string;
  direction: TextDirection;
  sourceSupported: boolean;
  targetSupported: boolean;
  detectionSupported: boolean;
  transliterationSupported: boolean;
  voiceSupported: boolean;
  ttsSupported: boolean;
  supportedProviders: TranslationProviderType[];
  knownLimitations?: string;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage?: string | "auto";
  targetLanguage: string;
  provider?: TranslationProviderType;
  contentType?: TranslationContentType;
  isPrivate?: boolean;
  preserveEntities?: boolean;
  includeTransliteration?: boolean;
  includeEnglishMeaning?: boolean;
}

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage: string;
  targetLanguage: string;
  provider: TranslationProviderType;
  cached: boolean;
  transliteration?: string;
  englishMeaning?: string;
  transliterationAvailable?: boolean;
  englishMeaningAvailable?: boolean;
  status?: TranslationStatus;
  confidence?: number;
  characterCount: number;
  preservedEntitiesCount: number;
  disclaimer?: string;
  modelTimestamp?: string;
  isFallback?: boolean;
  isPartial?: boolean;
  isUntranslated?: boolean;
  fallbackReason?: string;
}

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  isReliable: boolean;
  scriptDetected: string;
  alternativeLanguages?: { language: string; confidence: number }[];
}

export interface TranslationFeedback {
  id?: string;
  userId?: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: TranslationProviderType;
  rating: "accurate" | "minor_errors" | "inaccurate" | "offensive";
  suggestedCorrection?: string;
  comments?: string;
  createdAt?: string;
}

export interface UserTranslationPreferences {
  userId: string;
  preferredAppLanguage: AppLocale;
  preferredTranslationLanguage: AppLocale;
  autoDetectSource: boolean;
  showOriginalByDefault: boolean;
  enableVoicePlayback: boolean;
  updatedAt?: string;
}

export interface ProtectedEntity {
  placeholder: string;
  originalValue: string;
  type: "phone" | "pincode" | "currency" | "url" | "registry_id" | "time" | "email";
}
