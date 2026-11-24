/**
 * KAAMSETU — Universal Translation Service
 * Central facade orchestrating language detection, entity protection,
 * multi-provider routing (Gemini / Bhashini / Google / Deterministic),
 * cryptographic caching, and user privacy isolation.
 */

import {
  TranslationRequest,
  TranslationResult,
  LanguageDetectionResult,
  TranslationProviderType,
  TranslationFeedback,
} from "./types";
import {
  isPairSupported,
  isLanguageSupported,
  getLanguageCapability,
} from "./registry";
import {
  TranslationProvider,
  GeminiTranslationProvider,
  DeterministicTranslationProvider,
  BhashiniTranslationProvider,
  GoogleCloudTranslationProvider,
  AzureTranslationProvider,
} from "./provider";
import { detectLanguage } from "./detection";
import {
  generateCacheKey,
  getCachedTranslation,
  setCachedTranslation,
} from "./cache";
import { transliterateToLatin } from "./transliteration";
import { resolveEnglishMeaning } from "./meaning";

export class TranslationService {
  private static instance: TranslationService;

  private providers: Map<TranslationProviderType, TranslationProvider> = new Map();
  private defaultProviderType: TranslationProviderType = "gemini";

  private constructor() {
    this.providers.set("gemini", new GeminiTranslationProvider());
    this.providers.set("deterministic", new DeterministicTranslationProvider());
    this.providers.set("bhashini", new BhashiniTranslationProvider());
    this.providers.set("google_cloud", new GoogleCloudTranslationProvider());
    this.providers.set("azure", new AzureTranslationProvider());
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  /**
   * Translates content between any supported source and target languages.
   */
  public async translate(req: TranslationRequest): Promise<TranslationResult> {
    if (!req.text || req.text.trim().length === 0) {
      throw new Error("Cannot translate empty or whitespace text.");
    }

    if (req.text.length > 5000) {
      throw new Error("Text exceeds maximum permissible translation limit of 5,000 characters.");
    }

    if (!isLanguageSupported(req.targetLanguage)) {
      throw new Error(`Target language '${req.targetLanguage}' is not registered in KAAMSETU.`);
    }

    // 1. Detect Source Language if auto or not provided
    let source = req.sourceLanguage;
    if (!source || source === "auto") {
      const detection = await this.detectLanguage(req.text);
      source = detection.detectedLanguage;
    }

    if (!isLanguageSupported(source)) {
      throw new Error(`Source language '${source}' is not registered in KAAMSETU.`);
    }

    // 2. Identity / Same-Language Shortcut
    if (source === req.targetLanguage) {
      const transliteration = transliterateToLatin(req.text, req.targetLanguage);
      const meaningResult = resolveEnglishMeaning(req.text, req.targetLanguage, source, req.text);
      return {
        translatedText: req.text,
        detectedSourceLanguage: source,
        targetLanguage: req.targetLanguage,
        provider: "deterministic",
        cached: false,
        status: "same_language",
        confidence: 1.0,
        characterCount: req.text.length,
        preservedEntitiesCount: 0,
        transliteration,
        englishMeaning: meaningResult.englishMeaning,
        transliterationAvailable: Boolean(transliteration && (transliteration !== req.text || req.targetLanguage === "en")),
        englishMeaningAvailable: meaningResult.isAvailable,
        disclaimer: "Original and target language are identical.",
      };
    }

    // 3. Verify language pair support
    if (!isPairSupported(source, req.targetLanguage)) {
      throw new Error(
        `Translation pair '${source}' → '${req.targetLanguage}' is currently not supported.`
      );
    }

    // 4. Check Cache
    const providerToUse = req.provider || this.defaultProviderType;
    const cacheKey = generateCacheKey(req.text, source, req.targetLanguage, providerToUse);
    const cached = await getCachedTranslation(cacheKey, req.isPrivate);
    if (cached) {
      if (!cached.transliteration) {
        cached.transliteration = transliterateToLatin(cached.translatedText, req.targetLanguage);
        cached.transliterationAvailable = Boolean(
          cached.transliteration && (cached.transliteration !== cached.translatedText || req.targetLanguage === "en")
        );
      }
      if (!cached.englishMeaning) {
        const meaning = resolveEnglishMeaning(cached.translatedText, req.targetLanguage, source, req.text);
        cached.englishMeaning = meaning.englishMeaning;
        cached.englishMeaningAvailable = meaning.isAvailable;
      }
      return cached;
    }

    // 5. Execute Translation with Fallback Cascade
    let result: TranslationResult | null = null;
    const provider = this.providers.get(providerToUse);

    if (provider && (await provider.isHealthy())) {
      try {
        result = await provider.translate({
          ...req,
          sourceLanguage: source,
        });
      } catch (err) {
        console.warn(`[TranslationService] Provider '${providerToUse}' failed; falling back:`, err);
      }
    }

    // Fallback to Deterministic Corpus Provider if primary failed or was unhealthy
    if (!result) {
      const fallbackProvider = this.providers.get("deterministic")!;
      result = await fallbackProvider.translate({
        ...req,
        sourceLanguage: source,
      });
      if (providerToUse !== "deterministic") {
        result.isFallback = true;
        result.fallbackReason =
          result.fallbackReason ||
          `Primary provider '${providerToUse}' was unavailable or timed out; served from verified offline lexicon.`;
      }
    }

    // Enrich with Roman transliteration and English meaning
    if (result) {
      if (!result.transliteration) {
        result.transliteration = transliterateToLatin(result.translatedText, req.targetLanguage);
        result.transliterationAvailable = Boolean(
          result.transliteration && (result.transliteration !== result.translatedText || req.targetLanguage === "en")
        );
      }
      if (!result.englishMeaning) {
        const meaning = resolveEnglishMeaning(result.translatedText, req.targetLanguage, source, req.text);
        result.englishMeaning = meaning.englishMeaning;
        result.englishMeaningAvailable = meaning.isAvailable;
      }
    }

    // 6. Cache Result (if not private)
    if (!req.isPrivate && result) {
      await setCachedTranslation(cacheKey, result, req.isPrivate);
    }

    return result;
  }

  /**
   * Fast, reliable language detection.
   */
  public async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    return detectLanguage(text);
  }

  /**
   * Logs translation quality feedback.
   */
  public async submitFeedback(feedback: TranslationFeedback): Promise<{ success: boolean; id: string }> {
    const feedbackId = `tf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    // Log for model fine-tuning and quality audits
    console.log(`[TranslationFeedback] Received feedback ${feedbackId}:`, {
      pair: `${feedback.sourceLanguage} -> ${feedback.targetLanguage}`,
      rating: feedback.rating,
      hasCorrection: Boolean(feedback.suggestedCorrection),
    });
    return { success: true, id: feedbackId };
  }
}

export const translationService = TranslationService.getInstance();
