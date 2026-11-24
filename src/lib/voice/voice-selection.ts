/**
 * KAAMSETU — Intelligent Voice Selection & Quality Ranking Engine
 * 
 * Provides voice resolution, natural voice scoring, asynchronous voice cataloging,
 * and language-specific pronunciation matching across all 39 Indian languages.
 */

import { VoiceInfo, AudioChannel } from "./types";
import { SPEECH_BCP47_MAP, getSpeechBCP47Tag } from "../translation/speech";

/**
 * Returns canonical BCP-47 language tag for a given language code
 */
export function getLanguageBCP47(langCode: string): string {
  return getSpeechBCP47Tag(langCode) || "en-IN";
}

/**
 * Detects the probable language from Unicode character ranges in the text
 * to prevent auto-detect source text from blindly failing to an English voice.
 */
export function detectScriptLanguage(text: string): string {
  if (!text || !text.trim()) return "en";

  // 1. Assamese distinctive characters: Ra (U+09F0) and Wa (U+09F1)
  if (/[\u09F0\u09F1]/.test(text)) {
    return "as";
  }

  // 2. Bengali-Assamese range
  if (/[\u0980-\u09FF]/.test(text)) {
    return "bn";
  }

  // 3. Devanagari range (Hindi, Marathi, Sanskrit, etc.)
  if (/[\u0900-\u097F]/.test(text)) {
    return "hi";
  }

  // 4. Tamil range
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return "ta";
  }

  // 5. Telugu range
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return "te";
  }

  // 6. Kannada range
  if (/[\u0C80-\u0CFF]/.test(text)) {
    return "kn";
  }

  // 7. Malayalam range
  if (/[\u0D00-\u0D7F]/.test(text)) {
    return "ml";
  }

  // 8. Gujarati range
  if (/[\u0A80-\u0AFF]/.test(text)) {
    return "gu";
  }

  // 9. Gurmukhi (Punjabi) range
  if (/[\u0A00-\u0A7F]/.test(text)) {
    return "pa";
  }

  // 10. Odia range
  if (/[\u0B00-\u0B7F]/.test(text)) {
    return "or";
  }

  // 11. Perso-Arabic (Urdu, Kashmiri) range
  if (/[\u0600-\u06FF]/.test(text)) {
    return "ur";
  }

  return "en";
}

/**
 * Calculates a naturalness quality score (0 - 100) for a given speech synthesis voice.
 * Prioritizes modern neural, natural, and enhanced Indian regional voices.
 */
export function calculateVoiceQualityScore(
  voice: SpeechSynthesisVoice,
  targetBcp47?: string
): { score: number; isNatural: boolean } {
  const name = (voice.name || "").toLowerCase();
  const lang = (voice.lang || "").toLowerCase();
  let score = 50; // base score for standard system voices
  let isNatural = false;

  // Modern Neural / Enhanced voice indicators
  if (
    name.includes("natural") ||
    name.includes("neural") ||
    name.includes("google") ||
    name.includes("enhanced") ||
    name.includes("premium") ||
    name.includes("siri")
  ) {
    score += 35;
    isNatural = true;
  }

  // Indian regional voice identifiers
  if (
    name.includes("india") ||
    name.includes("hindi") ||
    name.includes("bengali") ||
    name.includes("tamil") ||
    name.includes("telugu") ||
    name.includes("veena") ||
    name.includes("swara") ||
    name.includes("aditi") ||
    name.includes("lekha") ||
    name.includes("rishi") ||
    (targetBcp47 && lang.startsWith(targetBcp47.toLowerCase().split("-")[0]))
  ) {
    score += 15;
  }

  // Penalize legacy robotic synthesizers
  if (
    name.includes("compact") ||
    name.includes("espeak") ||
    name.includes("sam") ||
    name.includes("robot") ||
    name.includes("albert")
  ) {
    score -= 30;
    isNatural = false;
  }

  if (voice.localService) {
    score += 5; // Local playback has zero network latency
  }

  const finalScore = Math.max(10, Math.min(100, score));
  return { score: finalScore, isNatural };
}

/**
 * Retrieves all browser speech synthesis voices, converting them to ranked VoiceInfo records.
 */
export function getAvailableVoices(): VoiceInfo[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }

  const rawVoices = window.speechSynthesis.getVoices();
  if (!rawVoices || rawVoices.length === 0) {
    return [];
  }

  return rawVoices.map((v) => {
    const { score, isNatural } = calculateVoiceQualityScore(v);
    return {
      id: `${v.name}-${v.lang}`,
      name: v.name,
      lang: v.lang,
      bcp47: v.lang,
      isNatural,
      isDefault: v.default,
      isRemote: !v.localService,
      provider: "browser",
      qualityScore: score,
    };
  });
}

/**
 * Finds all candidate voices matching a given language code, sorted by quality score.
 */
export function getVoicesForLanguage(
  langCode: string,
  sampleText?: string,
  channel: AudioChannel = "original"
): VoiceInfo[] {
  // If channel is transliteration, we MUST use English/Latin voice
  if (channel === "transliteration") {
    return getVoicesForLanguage("en");
  }

  // Resolve language code if auto
  let resolvedLang = langCode;
  if (langCode === "auto") {
    resolvedLang = sampleText ? detectScriptLanguage(sampleText) : "en";
  }

  const bcp47 = getSpeechBCP47Tag(resolvedLang) || "en-IN";
  const prefix = bcp47.toLowerCase().split("-")[0]; // e.g. 'hi' from 'hi-IN'

  const allVoices = getAvailableVoices();

  // 1. Exact BCP-47 matches (e.g. 'hi-IN')
  const exactMatches = allVoices.filter(
    (v) => v.lang.toLowerCase() === bcp47.toLowerCase() || v.lang.toLowerCase().replace("_", "-") === bcp47.toLowerCase()
  );

  // 2. Base language prefix matches (e.g. 'hi-US' or 'hi')
  const prefixMatches = allVoices.filter(
    (v) =>
      !exactMatches.some((e) => e.id === v.id) &&
      (v.lang.toLowerCase().startsWith(prefix) || v.lang.toLowerCase().startsWith(`${prefix}-`) || v.lang.toLowerCase().startsWith(`${prefix}_`))
  );

  const combined = [...exactMatches, ...prefixMatches];

  // If no voices loaded yet in browser, provide canonical synthetic fallback candidate
  if (combined.length === 0) {
    return [
      {
        id: `system-voice-${bcp47}`,
        name: `System Regional (${bcp47})`,
        lang: bcp47,
        bcp47,
        isNatural: false,
        isDefault: true,
        isRemote: false,
        provider: "browser",
        qualityScore: 50,
      },
    ];
  }

  // Sort descending by quality score
  return combined.sort((a, b) => b.qualityScore - a.qualityScore);
}

/**
 * Resolves the single best voice for a language channel.
 */
export function resolveBestVoice(
  langCode: string,
  sampleText?: string,
  channel: AudioChannel = "original",
  preferredVoiceId?: string
): { voice: VoiceInfo | null; bcp47: string; resolvedLanguage: string } {
  let resolvedLanguage = langCode;
  if (langCode === "auto") {
    resolvedLanguage = sampleText ? detectScriptLanguage(sampleText) : "en";
  }

  // If channel is transliteration, use English phonetic voice
  if (channel === "transliteration") {
    resolvedLanguage = "en";
  }

  const bcp47 = getSpeechBCP47Tag(resolvedLanguage) || "en-IN";
  const candidates = getVoicesForLanguage(resolvedLanguage, sampleText, channel);

  if (candidates.length === 0) {
    return { voice: null, bcp47, resolvedLanguage };
  }

  // If user selected a preferred voice and it exists in candidates
  if (preferredVoiceId) {
    const preferred = candidates.find((c) => c.id === preferredVoiceId);
    if (preferred) {
      return { voice: preferred, bcp47, resolvedLanguage };
    }
  }

  // Return highest quality candidate
  return { voice: candidates[0], bcp47, resolvedLanguage };
}
