/**
 * KAAMSETU — Universal Translation Providers
 * Implements provider-independent adapters for Gemini, Bhashini, Google Cloud,
 * Azure Translator, and Deterministic Offline Corpus.
 */

import {
  TranslationProviderType,
  TranslationRequest,
  TranslationResult,
  LanguageDetectionResult,
} from "./types";
import { ALL_TRANSLATION_CAPABILITIES, isPairSupported } from "./registry";
import { detectLanguage } from "./detection";
import { protectEntities, restoreEntities, getTranslationDisclaimer } from "./validation";
import { getGeminiClient } from "../gemini/client";
import { getGeminiModelCandidates } from "../gemini/onboarding-extractor";
import { isConfigured } from "../env";

export interface TranslationProvider {
  name: TranslationProviderType;
  translate(req: TranslationRequest): Promise<TranslationResult>;
  detect(text: string): Promise<LanguageDetectionResult>;
  isHealthy(): Promise<boolean>;
}

// ============================================================================
// 1. DETERMINISTIC OFFLINE CORPUS PROVIDER (Reliable, fast, zero network cost)
// ============================================================================
export class DeterministicTranslationProvider implements TranslationProvider {
  name: TranslationProviderType = "deterministic";

  private corpus: Record<string, Record<string, string>> = {
    // Assamese
    "মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাওঁ।": {
      hi: "मैं गुवाहाटी में एक छोटी दर्जी की दुकान चलाता हूँ।",
      en: "I run a small tailoring shop in Guwahati.",
      bn: "আমি গুয়াহাটিতে একটি ছোট দর্জির দোকান চালাই।",
      ta: "நான் குவஹாத்தியில் ஒரு சிறிய தையல் கடை நடத்தி வருகிறேன்.",
    },
    "নমস্কাৰ, আপোনাৰ কামটো কিমান দিনত সম্পূৰ্ণ হ'ব?": {
      hi: "नमस्ते, आपका काम कितने दिनों में पूरा होगा?",
      en: "Hello, in how many days will your work be completed?",
      bn: "নমস্কার, আপনার কাজটি কত দিনে সম্পূর্ণ হবে?",
    },
    // Hindi
    "मैं गुवाहाटी में एक छोटी दर्जी की दुकान चलाता हूँ।": {
      as: "মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাওঁ।",
      en: "I run a small tailoring shop in Guwahati.",
      bn: "আমি গুয়াহাটিতে একটি ছোট দর্জির দোকান চালাই।",
      ta: "நான் குவஹாத்தியில் ஒரு சிறிய தையல் கடை நடத்தி வருகிறேன்.",
      te: "నేను గౌహతిలో ఒక చిన్న టైలరింగ్ దుకాణం నడుపుతున్నాను.",
    },
    "नमस्ते, मुझे घर की वायरिंग और स्विच बोर्ड ठीक करवाना है।": {
      as: "নমস্কাৰ, মোক ঘৰৰ ৱায়াৰিং আৰু চুইচ ব'ৰ্ড মেৰামতি কৰাব লাগে।",
      en: "Hello, I need home wiring and switchboards repaired.",
      bn: "নমস্কার, আমাকে বাড়ির ওয়্যারিং এবং সুইচ বোর্ড মেরামত করাতে হবে।",
      ta: "வணக்கம், எனக்கு வீட்டு வயரிங் மற்றும் சுவிட்ச் போர்டுகளை சரி செய்ய வேண்டும்.",
      te: "నమస్కారం, నాకు ఇంటి వైరింగ్ మరియు స్విచ్ బోర్డులు బాగు చేయించాలి.",
    },
    // English
    "I run a small tailoring shop in Guwahati.": {
      hi: "मैं गुवाहाटी में एक छोटी दर्जी की दुकान चलाता हूँ।",
      as: "মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাওঁ।",
      bn: "আমি গুয়াহাটিতে একটি ছোট দর্জির দোকান চালাই।",
      ta: "நான் குவஹாத்தியில் ஒரு சிறிய தையல் கடை நடத்தி வருகிறேன்.",
      mr: "मी गुवाहाटीमध्ये एक लहान शिंप्याचे दुकान चालवतो.",
      gu: "હું ગુવાહાટીમાં એક નાની દરજીની દુકાન ચલાવું છું.",
      pa: "ਮੈਂ ਗੁਵਾਹਾਟੀ ਵਿੱਚ ਇੱਕ ਛੋਟੀ ਦਰਜ਼ੀ ਦੀ ਦੁਕਾਨ ਚਲਾਉਂਦਾ ਹਾਂ।",
    },
    "I am a certified electrician.": {
      hi: "मैं एक प्रमाणित इलेक्ट्रीशियन हूँ।",
      as: "মই এজন প্ৰমাণিত ইলেক্ট্ৰিচিয়ান।",
      bn: "আমি একজন প্রত্যয়িত ইলেকট্রিশিয়ান।",
      ta: "நான் ஒரு சான்றளிக்கப்பட்ட எலக்ட்ரீஷியன்.",
      te: "నేను సర్టిఫైడ్ ఎలక్ట్రీషియన్‌ని.",
    },
    "Verified master artisan with 15 years experience in handloom weaving.": {
      hi: "हथकरघा बुनाई में 15 वर्षों के अनुभव के साथ सत्यापित कुशल कारीगर।",
      as: "তাঁতশাল বোৱাত ১৫ বছৰৰ অভিজ্ঞতা থকা প্ৰত্যায়িত ওস্তাদ শিল্পী।",
      bn: "হাঁততাঁত বোনায় ১৫ বছরের অভিজ্ঞতা সম্পন্ন যাচাইকৃত মাস্টার কারিগর।",
      ta: "கைத்தறி நெசவில் 15 வருட அனுபவமுள்ள சரிபார்க்கப்பட்ட கைவினைஞர்.",
    },
  };

  // Common word-level substitutions for vendor/artisan vocabulary
  private vocabulary: Record<string, Record<string, string>> = {
    tailor: { hi: "दर्जी", as: "দৰ্জী", bn: "দর্জি", ta: "தையல்காரர்", te: "దర్జీ" },
    electrician: { hi: "इलेक्ट्रीशियन", as: "ইলেক্ট্ৰিচিয়ান", bn: "ইলেকট্রিশিয়ান", ta: "மின்சார வல்லுநர்", te: "ఎలక్ట్రీషియన్" },
    carpenter: { hi: "बढ़ई", as: "বাঢ়ৈ", bn: "ছুতোর", ta: "தச்சர்", te: "వడ్రంగి" },
    plumber: { hi: "नलकार / प्लम्बर", as: "প্লাম্বাৰ", bn: "প্লাম্বার", ta: "குழாய் பழுதுபார்ப்பவர்", te: "ప్లంబర్" },
    produce: { hi: "सब्जी व फल", as: "শাক-পাচলি", bn: "শাকসবজি", ta: "காய்கறிகள்", te: "కూరగాయలు" },
    shop: { hi: "दुकान", as: "দোকান", bn: "দোকান", ta: "கடை", te: "దుకాణం" },
  };

  async isHealthy(): Promise<boolean> {
    return true;
  }

  async detect(text: string): Promise<LanguageDetectionResult> {
    return detectLanguage(text);
  }

  async translate(req: TranslationRequest): Promise<TranslationResult> {
    const source =
      !req.sourceLanguage || req.sourceLanguage === "auto"
        ? (await this.detect(req.text)).detectedLanguage
        : req.sourceLanguage;

    if (source === req.targetLanguage) {
      return {
        translatedText: req.text,
        detectedSourceLanguage: source,
        targetLanguage: req.targetLanguage,
        provider: this.name,
        cached: false,
        status: "same_language",
        confidence: 1.0,
        characterCount: req.text.length,
        preservedEntitiesCount: 0,
        disclaimer: getTranslationDisclaimer(req.contentType, req.text),
      };
    }

    const { maskedText, entities } = protectEntities(req.text);

    // 1. Direct corpus match
    const match = this.corpus[req.text]?.[req.targetLanguage];
    if (match) {
      const { restoredText, preservedCount } = restoreEntities(match, entities);
      return {
        translatedText: restoredText,
        detectedSourceLanguage: source,
        targetLanguage: req.targetLanguage,
        provider: this.name,
        cached: false,
        status: "translated",
        confidence: 0.98,
        isFallback: false,
        isPartial: false,
        characterCount: restoredText.length,
        preservedEntitiesCount: preservedCount,
        disclaimer: getTranslationDisclaimer(req.contentType, req.text),
      };
    }

    // 2. Synthesize translation for common trade profiles using vernacular vocabulary
    const targetCap = ALL_TRANSLATION_CAPABILITIES[req.targetLanguage];
    const sourceCap = ALL_TRANSLATION_CAPABILITIES[source];

    // Build respectful readable translation using vocabulary mapping
    let translated = maskedText;
    let substitutionsCount = 0;
    for (const [engWord, maps] of Object.entries(this.vocabulary)) {
      if (maps[req.targetLanguage]) {
        const wordRegex = new RegExp(`\\b${engWord}\\b`, "gi");
        if (wordRegex.test(translated)) {
          translated = translated.replace(wordRegex, maps[req.targetLanguage]);
          substitutionsCount++;
        }
      }
    }

    // If target is Hindi and source was English/vernacular
    if (req.targetLanguage === "hi" && source === "en") {
      const initial = translated;
      translated = translated
        .replace(/I am a/gi, "मैं हूँ एक")
        .replace(/Shop/gi, "दुकान")
        .replace(/Services/gi, "सेवाएं")
        .replace(/Daily/gi, "दैनिक")
        .replace(/Experience/gi, "अनुभव");
      if (translated !== initial) substitutionsCount++;
    }

    const { restoredText, preservedCount } = restoreEntities(translated, entities);
    const hasChanged = translated !== maskedText;

    return {
      translatedText: restoredText,
      detectedSourceLanguage: source,
      targetLanguage: req.targetLanguage,
      provider: this.name,
      cached: false,
      status: hasChanged ? "partial_translation" : "fallback_limited",
      confidence: hasChanged ? 0.50 : 0.0,
      isFallback: true,
      isPartial: hasChanged,
      isUntranslated: !hasChanged,
      fallbackReason: hasChanged
        ? "Deterministic trade vocabulary approximation; full sentence translation was unavailable."
        : "Sentence not found in offline dictionary; preserved original text.",
      characterCount: restoredText.length,
      preservedEntitiesCount: preservedCount,
      disclaimer: hasChanged
        ? "Partial trade lexicon match. Please verify exact requirements with the worker."
        : "Translation unavailable in offline dictionary. Original text retained.",
    };
  }
}

// ============================================================================
// 2. GEMINI LLM TRANSLATION PROVIDER (Deep cultural context, entity-safe)
// ============================================================================
export class GeminiTranslationProvider implements TranslationProvider {
  name: TranslationProviderType = "gemini";
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
  }

  async isHealthy(): Promise<boolean> {
    return Boolean(isConfigured.gemini);
  }

  async detect(text: string): Promise<LanguageDetectionResult> {
    // Use deterministic detector for zero-latency detection
    return detectLanguage(text);
  }

  async translate(req: TranslationRequest): Promise<TranslationResult> {
    if (!isConfigured.gemini) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const source =
      !req.sourceLanguage || req.sourceLanguage === "auto"
        ? (await this.detect(req.text)).detectedLanguage
        : req.sourceLanguage;

    if (source === req.targetLanguage) {
      return {
        translatedText: req.text,
        detectedSourceLanguage: source,
        targetLanguage: req.targetLanguage,
        provider: this.name,
        cached: false,
        status: "same_language",
        confidence: 1.0,
        characterCount: req.text.length,
        preservedEntitiesCount: 0,
        disclaimer: getTranslationDisclaimer(req.contentType, req.text),
      };
    }

    const { maskedText, entities } = protectEntities(req.text);

    const sourceName = ALL_TRANSLATION_CAPABILITIES[source as any]?.name || source;
    const targetName =
      ALL_TRANSLATION_CAPABILITIES[req.targetLanguage as any]?.name || req.targetLanguage;

    const prompt = `You are KAAMSETU's Indian workforce translation engine.
Translate the following user text from ${sourceName} (${source}) into ${targetName} (${req.targetLanguage}).

CRITICAL INSTRUCTIONS:
1. Preserve all placeholders like [[ENTITY_PHONE_0]], [[ENTITY_CURRENCY_1]], [[ENTITY_PIN_2]], [[ENTITY_URL_3]], etc. EXACTLY as written without altering or translating them.
2. Use respectful, natural, human phrasing suitable for Indian artisans, informal workers, small vendors, and customers.
3. Keep product names, personal names, shop names, and addresses phonetically accurate in the target script.
4. Return ONLY the translated text without commentary, quotes, or markdown wrappers.

TEXT TO TRANSLATE:
${maskedText}`;

    const ai = getGeminiClient();
    const candidates = getGeminiModelCandidates();
    let rawResult = "";
    let lastError: any = null;

    for (const model of candidates) {
      let timer: NodeJS.Timeout | null = null;
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Timeout on model ${model}`)), 8000);
          timer?.unref?.();
        });
        const callPromise = ai.models
          .generateContent({
            model,
            contents: prompt,
          })
          .then((res: any) => res.text?.trim() || "");

        rawResult = await Promise.race([callPromise, timeoutPromise]);
        if (timer) clearTimeout(timer);
        if (rawResult) break;
      } catch (err: any) {
        if (timer) clearTimeout(timer);
        lastError = err;
      }
    }

    if (!rawResult) {
      throw new Error(lastError?.message || "Empty translation returned by Gemini API.");
    }

    const { restoredText, preservedCount } = restoreEntities(rawResult, entities);

    return {
      translatedText: restoredText,
      detectedSourceLanguage: source,
      targetLanguage: req.targetLanguage,
      provider: this.name,
      cached: false,
      status: "translated",
      confidence: 0.95,
      isFallback: false,
      isPartial: false,
      characterCount: restoredText.length,
      preservedEntitiesCount: preservedCount,
      disclaimer: getTranslationDisclaimer(req.contentType, req.text),
    };
  }
}

// ============================================================================
// 3. BHASHINI / ULCA PROVIDER (Government of India open models)
// ============================================================================
export class BhashiniTranslationProvider implements TranslationProvider {
  name: TranslationProviderType = "bhashini";
  private apiKey?: string;
  private userId?: string;

  constructor() {
    this.apiKey = process.env.BHASHINI_API_KEY;
    this.userId = process.env.BHASHINI_USER_ID;
  }

  async isHealthy(): Promise<boolean> {
    return Boolean(
      this.apiKey &&
      this.userId &&
      !this.apiKey.includes("placeholder") &&
      !this.userId.includes("placeholder")
    );
  }

  async detect(text: string): Promise<LanguageDetectionResult> {
    return detectLanguage(text);
  }

  async translate(req: TranslationRequest): Promise<TranslationResult> {
    if (!this.apiKey || !this.userId || this.apiKey.includes("placeholder")) {
      throw new Error("Bhashini credentials (BHASHINI_API_KEY / BHASHINI_USER_ID) are not configured.");
    }

    const source =
      !req.sourceLanguage || req.sourceLanguage === "auto"
        ? (await this.detect(req.text)).detectedLanguage
        : req.sourceLanguage;

    if (source === req.targetLanguage) {
      return {
        translatedText: req.text,
        detectedSourceLanguage: source,
        targetLanguage: req.targetLanguage,
        provider: this.name,
        cached: false,
        status: "same_language",
        confidence: 1.0,
        characterCount: req.text.length,
        preservedEntitiesCount: 0,
        disclaimer: getTranslationDisclaimer(req.contentType, req.text),
      };
    }

    const { maskedText, entities } = protectEntities(req.text);

    // Call Bhashini ULCA pipeline API
    const response = await fetch("https://dhruva-api.bhashini.gov.in/services/inference/pipeline", {
      method: "POST",
      headers: {
        Authorization: this.apiKey,
        userID: this.userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: "translation",
            config: {
              language: {
                sourceLanguage: source,
                targetLanguage: req.targetLanguage,
              },
            },
          },
        ],
        inputData: {
          input: [{ source: maskedText }],
        },
      }),
      signal: AbortSignal.timeout(7000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Bhashini API responded with HTTP ${response.status}: ${errText.slice(0, 150)}`);
    }

    const json = await response.json();
    const rawResult =
      json?.pipelineResponse?.[0]?.output?.[0]?.target ||
      json?.output?.[0]?.target;

    if (!rawResult || typeof rawResult !== "string") {
      throw new Error("Invalid or empty response format from Bhashini pipeline.");
    }

    const { restoredText, preservedCount } = restoreEntities(rawResult, entities);

    return {
      translatedText: restoredText,
      detectedSourceLanguage: source,
      targetLanguage: req.targetLanguage,
      provider: this.name,
      cached: false,
      status: "translated",
      confidence: 0.92,
      isFallback: false,
      isPartial: false,
      characterCount: restoredText.length,
      preservedEntitiesCount: preservedCount,
      disclaimer: getTranslationDisclaimer(req.contentType, req.text),
    };
  }
}

// ============================================================================
// 4. GOOGLE CLOUD TRANSLATION PROVIDER
// ============================================================================
export class GoogleCloudTranslationProvider implements TranslationProvider {
  name: TranslationProviderType = "google_cloud";
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  }

  async isHealthy(): Promise<boolean> {
    return Boolean(this.apiKey && !this.apiKey.includes("placeholder"));
  }

  async detect(text: string): Promise<LanguageDetectionResult> {
    return detectLanguage(text);
  }

  async translate(req: TranslationRequest): Promise<TranslationResult> {
    if (!this.apiKey || this.apiKey.includes("placeholder")) {
      throw new Error("GOOGLE_TRANSLATE_API_KEY is not configured.");
    }

    const source =
      !req.sourceLanguage || req.sourceLanguage === "auto"
        ? (await this.detect(req.text)).detectedLanguage
        : req.sourceLanguage;

    if (source === req.targetLanguage) {
      return {
        translatedText: req.text,
        detectedSourceLanguage: source,
        targetLanguage: req.targetLanguage,
        provider: this.name,
        cached: false,
        status: "same_language",
        confidence: 1.0,
        characterCount: req.text.length,
        preservedEntitiesCount: 0,
        disclaimer: getTranslationDisclaimer(req.contentType, req.text),
      };
    }

    const { maskedText, entities } = protectEntities(req.text);

    // Call Google Cloud Translate v2 REST API
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(this.apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: maskedText,
          target: req.targetLanguage,
          source: source && source !== "auto" ? source : undefined,
          format: "text",
        }),
        signal: AbortSignal.timeout(6000),
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Google Cloud Translate error (HTTP ${response.status}): ${errText.slice(0, 150)}`);
    }

    const json = await response.json();
    const rawResult = json?.data?.translations?.[0]?.translatedText;

    if (!rawResult || typeof rawResult !== "string") {
      throw new Error("Invalid or empty response format from Google Cloud Translation API.");
    }

    const { restoredText, preservedCount } = restoreEntities(rawResult, entities);

    return {
      translatedText: restoredText,
      detectedSourceLanguage: source,
      targetLanguage: req.targetLanguage,
      provider: this.name,
      cached: false,
      status: "translated",
      confidence: 0.94,
      isFallback: false,
      isPartial: false,
      characterCount: restoredText.length,
      preservedEntitiesCount: preservedCount,
      disclaimer: getTranslationDisclaimer(req.contentType, req.text),
    };
  }
}

// ============================================================================
// 5. AZURE TRANSLATOR PROVIDER
// ============================================================================
export class AzureTranslationProvider implements TranslationProvider {
  name: TranslationProviderType = "azure";
  private key?: string;
  private region?: string;

  constructor() {
    this.key = process.env.AZURE_TRANSLATOR_KEY;
    this.region = process.env.AZURE_TRANSLATOR_REGION;
  }

  async isHealthy(): Promise<boolean> {
    return Boolean(
      this.key &&
      this.region &&
      !this.key.includes("placeholder") &&
      !this.region.includes("placeholder")
    );
  }

  async detect(text: string): Promise<LanguageDetectionResult> {
    return detectLanguage(text);
  }

  async translate(req: TranslationRequest): Promise<TranslationResult> {
    if (!this.key || !this.region || this.key.includes("placeholder")) {
      throw new Error("AZURE_TRANSLATOR_KEY or AZURE_TRANSLATOR_REGION is not configured.");
    }

    const source =
      !req.sourceLanguage || req.sourceLanguage === "auto"
        ? (await this.detect(req.text)).detectedLanguage
        : req.sourceLanguage;

    if (source === req.targetLanguage) {
      return {
        translatedText: req.text,
        detectedSourceLanguage: source,
        targetLanguage: req.targetLanguage,
        provider: this.name,
        cached: false,
        status: "same_language",
        confidence: 1.0,
        characterCount: req.text.length,
        preservedEntitiesCount: 0,
        disclaimer: getTranslationDisclaimer(req.contentType, req.text),
      };
    }

    const { maskedText, entities } = protectEntities(req.text);

    const fromQuery = source && source !== "auto" ? `&from=${encodeURIComponent(source)}` : "";
    const endpoint = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${encodeURIComponent(
      req.targetLanguage
    )}${fromQuery}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": this.key,
        "Ocp-Apim-Subscription-Region": this.region,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ Text: maskedText }]),
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Azure Translator error (HTTP ${response.status}): ${errText.slice(0, 150)}`);
    }

    const json = await response.json();
    const rawResult = json?.[0]?.translations?.[0]?.text;

    if (!rawResult || typeof rawResult !== "string") {
      throw new Error("Invalid or empty response format from Azure Translator API.");
    }

    const { restoredText, preservedCount } = restoreEntities(rawResult, entities);

    return {
      translatedText: restoredText,
      detectedSourceLanguage: source,
      targetLanguage: req.targetLanguage,
      provider: this.name,
      cached: false,
      status: "translated",
      confidence: 0.93,
      isFallback: false,
      isPartial: false,
      characterCount: restoredText.length,
      preservedEntitiesCount: preservedCount,
      disclaimer: getTranslationDisclaimer(req.contentType, req.text),
    };
  }
}
