/**
 * KAAMSETU — Intelligent Voice Selection & Quality Ranking Engine
 * Phase 50.4 Specification
 * 
 * Provides:
 * 1. Honest Voice Resolution (NEVER fabricates non-existent browser voices)
 * 2. Natural Voice Quality Scoring (Neural/Natural vs. Compact/Robotic)
 * 3. Script vs. Language Identification integration
 * 4. Cross-dialect fallback transparency (explicitly labeled, never silent)
 * 5. Voice Preview capability
 */

import { VoiceInfo, AudioChannel } from "./types";
import { getSpeechBCP47Tag } from "../translation/speech";
import { identifyTextLanguage, LanguageIdentificationResult } from "./language-identification";

/**
 * Returns canonical BCP-47 language tag for a given language code
 */
export function getLanguageBCP47(langCode: string): string {
  return getSpeechBCP47Tag(langCode) || "en-IN";
}

/**
 * Detects the probable language from Unicode character ranges and linguistic morphemes.
 * Backwards-compatible wrapper around identifyTextLanguage.
 */
export function detectScriptLanguage(text: string, userSelectedLang?: string): string {
  const result = identifyTextLanguage(text, userSelectedLang);
  return result.detectedLanguage;
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

  // 1. Modern Neural / Enhanced voice indicators (+35 points)
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

  // 2. Indian regional voice identifiers (+15 points)
  if (
    name.includes("india") ||
    name.includes("hindi") ||
    name.includes("bengali") ||
    name.includes("tamil") ||
    name.includes("telugu") ||
    name.includes("marathi") ||
    name.includes("veena") ||
    name.includes("swara") ||
    name.includes("aditi") ||
    name.includes("lekha") ||
    name.includes("rishi") ||
    (targetBcp47 && lang.startsWith(targetBcp47.toLowerCase().split("-")[0]))
  ) {
    score += 15;
  }

  // 3. Penalize legacy robotic synthesizers (-30 points)
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
 * NEVER returns fabricated voice records. Accepts optional custom voice list for testing.
 */
export function getAvailableVoices(customVoices?: any[]): VoiceInfo[] {
  if (customVoices && customVoices.length > 0) {
    return customVoices.map((v) => {
      const { score, isNatural } = calculateVoiceQualityScore(v);
      return {
        id: v.voiceURI || `${v.name}-${v.lang}`,
        name: v.name,
        lang: v.lang,
        bcp47: v.lang,
        isNatural,
        isDefault: v.default ?? false,
        isRemote: !v.localService,
        provider: "browser",
        qualityScore: score,
        isInstalledInBrowser: true,
      };
    });
  }

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
      id: v.voiceURI || `${v.name}-${v.lang}`,
      name: v.name,
      lang: v.lang,
      bcp47: v.lang,
      isNatural,
      isDefault: v.default,
      isRemote: !v.localService,
      provider: "browser",
      qualityScore: score,
      isInstalledInBrowser: true,
    };
  });
}

/**
 * Finds all candidate voices genuinely matching a given language code in the browser,
 * sorted by quality score.
 * NEVER generates synthetic fake voice objects when 0 voices are installed.
 */
export function getVoicesForLanguage(
  langCode: string,
  sampleText?: string,
  channel: AudioChannel = "original",
  userSelectedLang?: string,
  customVoices?: any[]
): VoiceInfo[] {
  // If channel is transliteration, we MUST use English/Latin voice
  if (channel === "transliteration") {
    return getVoicesForLanguage("en", undefined, "original", undefined, customVoices);
  }

  // Identify language (user-selected takes highest priority)
  const identification = identifyTextLanguage(sampleText || "", userSelectedLang || langCode);
  const resolvedLang = identification.detectedLanguage;

  const bcp47 = getSpeechBCP47Tag(resolvedLang) || "en-IN";
  const prefix = bcp47.toLowerCase().split("-")[0]; // e.g. 'hi' from 'hi-IN'

  const allVoices = getAvailableVoices(customVoices);

  // 1. Exact BCP-47 matches (e.g. 'hi-IN')
  const exactMatches = allVoices.filter(
    (v) =>
      v.lang.toLowerCase() === bcp47.toLowerCase() ||
      v.lang.toLowerCase().replace("_", "-") === bcp47.toLowerCase()
  );

  // 2. Base language prefix matches (e.g. 'hi-US' or 'hi')
  const prefixMatches = allVoices.filter(
    (v) =>
      !exactMatches.some((e) => e.id === v.id) &&
      (v.lang.toLowerCase().startsWith(prefix) ||
        v.lang.toLowerCase().startsWith(`${prefix}-`) ||
        v.lang.toLowerCase().startsWith(`${prefix}_`))
  );

  const combined = [...exactMatches, ...prefixMatches];

  // Return real matching voices sorted descending by quality score
  return combined.sort((a, b) => b.qualityScore - a.qualityScore);
}

export interface VoiceResolutionResult {
  voice: VoiceInfo | null;
  hasNativeVoice: boolean;
  isCrossDialectFallback: boolean;
  fallbackNote?: string;
  bcp47: string;
  resolvedLanguage: string;
  identification: LanguageIdentificationResult;
}

/**
 * Resolves the best voice for a language channel.
 * Enforces:
 * 1. User selection priority
 * 2. Real browser voice lookup (never fabricated)
 * 3. Transparent cross-dialect fallback if exact native voice is missing
 */
export function resolveBestVoice(
  langCode: string,
  sampleText?: string,
  channel: AudioChannel = "original",
  preferredVoiceId?: string,
  userSelectedLang?: string,
  customVoices?: any[]
): VoiceResolutionResult {
  // If channel is transliteration, strictly force English phonetic voice
  const effectiveChannel = channel === "transliteration";
  const identification = effectiveChannel
    ? identifyTextLanguage("hello", "en")
    : identifyTextLanguage(sampleText || "", userSelectedLang || langCode);

  const resolvedLanguage = effectiveChannel ? "en" : identification.detectedLanguage;
  const bcp47 = getSpeechBCP47Tag(resolvedLanguage) || "en-IN";

  const candidates = getVoicesForLanguage(resolvedLanguage, sampleText, channel, userSelectedLang, customVoices);

  // 1. If preferred voice exists and is among candidates
  if (preferredVoiceId && candidates.length > 0) {
    const preferred = candidates.find((c) => c.id === preferredVoiceId);
    if (preferred) {
      return {
        voice: preferred,
        hasNativeVoice: true,
        isCrossDialectFallback: false,
        bcp47,
        resolvedLanguage,
        identification,
      };
    }
  }

  // 2. Exact native candidate voice found in browser
  if (candidates.length > 0) {
    return {
      voice: candidates[0],
      hasNativeVoice: true,
      isCrossDialectFallback: false,
      bcp47,
      resolvedLanguage,
      identification,
    };
  }

  // 3. No exact native voice found: Check compatible cross-dialect fallback
  // E.g. Marathi (mr) -> Hindi (hi) voice
  // Assamese (as) -> Bengali (bn) or Hindi (hi) voice
  // Nepali (ne) -> Hindi (hi) voice
  const allVoices = getAvailableVoices(customVoices);
  let fallbackVoice: VoiceInfo | null = null;
  let fallbackNote: string | undefined = undefined;

  if (resolvedLanguage === "mr" || resolvedLanguage === "ne" || resolvedLanguage === "sa") {
    // Look for Hindi Devanagari voice
    const hiVoice = allVoices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) {
      fallbackVoice = {
        ...hiVoice,
        isFallback: true,
        fallbackNote: `Native ${resolvedLanguage.toUpperCase()} voice not installed. Using Hindi regional voice as dialect fallback.`,
      };
      fallbackNote = fallbackVoice.fallbackNote;
    }
  } else if (resolvedLanguage === "as") {
    // Look for Bengali or Hindi voice
    const bnVoice = allVoices.find((v) => v.lang.toLowerCase().startsWith("bn"));
    const hiVoice = allVoices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    const selected = bnVoice || hiVoice;
    if (selected) {
      fallbackVoice = {
        ...selected,
        isFallback: true,
        fallbackNote: `Native Assamese voice not installed in browser. Using ${selected.lang.toUpperCase()} voice fallback.`,
      };
      fallbackNote = fallbackVoice.fallbackNote;
    }
  }

  return {
    voice: fallbackVoice,
    hasNativeVoice: false,
    isCrossDialectFallback: Boolean(fallbackVoice),
    fallbackNote:
      fallbackNote ||
      `No speech synthesis voice installed for ${bcp47} in this browser. Audio playback requires OS voice package or cloud TTS.`,
    bcp47,
    resolvedLanguage,
    identification,
  };
}

/**
 * Genuine Voice Preview: Speaks a representative word in the target voice
 */
export function previewVoice(
  voice: VoiceInfo | null | undefined,
  sampleText?: string,
  speed: number = 1.0
): { stop: () => void; success: boolean; error?: string } {
  if (!voice) {
    return {
      stop: () => {},
      success: false,
      error: "No voice provided for preview",
    };
  }

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { stop: () => {}, success: true };
  }

  window.speechSynthesis.cancel();

  // Representative preview greeting by language
  const defaultPreviews: Record<string, string> = {
    hi: "नमस्ते",
    as: "নমস্কাৰ",
    bn: "নমস্কার",
    ta: "வணக்கம்",
    te: "నమస్కారం",
    mr: "नमस्कार",
    kn: "ನಮಸ್ಕಾರ",
    ml: "നമസ്കാരം",
    gu: "નમસ્તે",
    pa: "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ",
    ur: "سلام",
    en: "Hello, this is a voice preview.",
  };

  const prefix = voice.bcp47.split("-")[0].toLowerCase();
  const textToSpeak = sampleText || defaultPreviews[prefix] || "Hello";

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = voice.bcp47;
  utterance.rate = speed;

  const rawVoices = window.speechSynthesis.getVoices();
  const raw = rawVoices.find((v) => v.name === voice.name && v.lang === voice.lang);
  if (raw) {
    utterance.voice = raw;
  }

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    },
    success: true,
  };
}
