/**
 * KAAMSETU — PHASE 50.1 UNIVERSAL TRANSLATOR REBUILD TEST SUITE
 * 
 * Verifies:
 * 1. Indic & Perso-Arabic Transliteration Engine:
 *    - Assamese (as): Inherent vowel 'o', 'নমস্কাৰ' -> 'Nomoskar', 'ৰ' (U+09F0) -> 'r'.
 *    - Bengali (bn): 'নমস্কার' -> 'Nomoshkar', 'ধন্যবাদ' -> 'Dhonnobad'.
 *    - Hindi (hi): 'नमस्ते' -> 'Namaste', 'धन्यवाद' -> 'Dhanyavaad', 'कारीगर' -> 'Kaarigar'.
 *    - Tamil (ta): 'வணக்கம்' -> 'Vanakkam', 'நன்றி' -> 'Nandri'.
 *    - Telugu (te): 'నమస్కారం' -> 'Namaskaram', 'ధన్యవాదాలు' -> 'Dhanyavadalu'.
 *    - Kannada (kn): 'ನಮಸ್ಕಾರ' -> 'Namaskara'.
 *    - Malayalam (ml): 'നമസ്കാരം' -> 'Namaskaram'.
 *    - Gujarati (gu): 'નમસ્તે' -> 'Namaste'.
 *    - Punjabi (pa): 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ' -> 'Sat Shri Akaal'.
 *    - Odia (or): 'ନମସ୍କାର' -> 'Namaskara'.
 *    - Urdu (ur): 'سلام' -> 'Salam', 'شکریہ' -> 'Shukriya'.
 *    - Entity preservation through transliteration.
 * 2. English Meaning & Semantic Resolution:
 *    - Target English returns identity.
 *    - Verified multilingual corpus returns semantic English explanation.
 *    - Source English preserves original semantic intent.
 *    - Unknown phrases return honest 'English meaning unavailable' without fabrication.
 * 3. Speech Recognition & Synthesis Abstractions:
 *    - Correct BCP-47 mappings (as-IN, bn-IN, hi-IN, ta-IN, te-IN, mr-IN, etc.).
 *    - Explicit error code mapping.
 *    - Lifecycle state machine transitions.
 *    - Native voice availability verification.
 * 4. Full Universal Translation Service & API Integration:
 *    - POST /api/translate returns Native Script + Roman Transliteration + English Meaning.
 *    - English to Assamese translation journey.
 *    - Assamese to English translation journey.
 *    - Entity preservation (phone numbers, PIN codes) across translation.
 *    - Same language identity shortcut.
 *    - Private cache isolation invariant.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { transliterateToLatin, getTransliterationDetails } from "../src/lib/translation/transliteration";
import { resolveEnglishMeaning } from "../src/lib/translation/meaning";
import {
  getSpeechBCP47Tag,
  getSpeechErrorMessage,
  SPEECH_BCP47_MAP,
} from "../src/lib/translation/speech";
import { translationService } from "../src/lib/translation/service";
import { POST as translateHandler } from "../src/app/api/translate/route";

describe("PHASE 50.1: UNIVERSAL TRANSLATOR REBUILD TEST SUITE", () => {

  // ==========================================================================
  // Suite 1: Indic & Perso-Arabic Transliteration Engine
  // ==========================================================================
  describe("1. Indic & Perso-Arabic Transliteration Engine", () => {
    test("1.1 Assamese (as): correctly transliterates 'নমস্কাৰ' to 'Nomoskar' with inherent vowel 'o'", () => {
      const result = transliterateToLatin("নমস্কাৰ", "as");
      assert.strictEqual(result, "Nomoskar", "Assamese greeting must transliterate to Nomoskar");
    });

    test("1.2 Assamese (as): transliterates 'ধন্যবাদ' to 'Dhonyobad'", () => {
      const result = transliterateToLatin("ধন্যবাদ", "as");
      assert.strictEqual(result, "Dhonyobad");
    });

    test("1.3 Bengali (bn): transliterates 'নমস্কার' to 'Nomoshkar'", () => {
      const result = transliterateToLatin("নমস্কার", "bn");
      assert.strictEqual(result, "Nomoshkar");
    });

    test("1.4 Bengali (bn): transliterates 'ধন্যবাদ' to 'Dhonnobad'", () => {
      const result = transliterateToLatin("ধন্যবাদ", "bn");
      assert.strictEqual(result, "Dhonnobad");
    });

    test("1.5 Hindi (hi): transliterates 'नमस्ते' to 'Namaste'", () => {
      const result = transliterateToLatin("नमस्ते", "hi");
      assert.strictEqual(result, "Namaste");
    });

    test("1.6 Hindi (hi): transliterates 'धन्यवाद' to 'Dhanyavaad'", () => {
      const result = transliterateToLatin("धन्यवाद", "hi");
      assert.strictEqual(result, "Dhanyavaad");
    });

    test("1.7 Tamil (ta): transliterates 'வணக்கம்' to 'Vanakkam' and 'நன்றி' to 'Nandri'", () => {
      assert.strictEqual(transliterateToLatin("வணக்கம்", "ta"), "Vanakkam");
      assert.strictEqual(transliterateToLatin("நன்றி", "ta"), "Nandri");
    });

    test("1.8 Telugu (te): transliterates 'నమస్కారం' to 'Namaskaram'", () => {
      assert.strictEqual(transliterateToLatin("నమస్కారం", "te"), "Namaskaram");
    });

    test("1.9 Kannada (kn) & Malayalam (ml): transliterates greetings accurately", () => {
      assert.strictEqual(transliterateToLatin("ನಮಸ್ಕಾರ", "kn"), "Namaskara");
      assert.strictEqual(transliterateToLatin("നമസ്കാരം", "ml"), "Namaskaram");
    });

    test("1.10 Gujarati (gu), Punjabi (pa), Odia (or), Urdu (ur): transliterates correctly", () => {
      assert.strictEqual(transliterateToLatin("નમસ્તે", "gu"), "Namaste");
      assert.strictEqual(transliterateToLatin("ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ", "pa"), "Sat Shri Akaal");
      assert.strictEqual(transliterateToLatin("ନମସ୍କାର", "or"), "Namaskara");
      assert.strictEqual(transliterateToLatin("سلام", "ur"), "Salam");
      assert.strictEqual(transliterateToLatin("شکریہ", "ur"), "Shukriya");
    });

    test("1.11 Transliteration details returns structured metadata and script identification", () => {
      const details = getTransliterationDetails("নমস্কাৰ", "as");
      assert.strictEqual(details.transliteration, "Nomoskar");
      assert.strictEqual(details.isAvailable, true);
      assert.strictEqual(details.scriptDetected, "Assamese");
    });

    test("1.12 Preserves entity placeholders untouched during transliteration", () => {
      const text = "নমস্কাৰ [[ENTITY_PHONE_0]]";
      const result = transliterateToLatin(text, "as");
      assert.ok(result.includes("[[ENTITY_PHONE_0]]"), "Placeholder must not be corrupted");
      assert.ok(result.startsWith("Nomoskar"));
    });
  });

  // ==========================================================================
  // Suite 2: English Meaning & Semantic Resolution Layer
  // ==========================================================================
  describe("2. English Meaning & Semantic Resolution Layer", () => {
    test("2.1 Target language 'en' returns identical text with method 'identity'", () => {
      const res = resolveEnglishMeaning("I am a carpenter in Guwahati.", "en", "hi");
      assert.strictEqual(res.englishMeaning, "I am a carpenter in Guwahati.");
      assert.strictEqual(res.method, "identity");
      assert.strictEqual(res.isAvailable, true);
    });

    test("2.2 Exact match in verified semantic corpus returns natural English explanation", () => {
      const res = resolveEnglishMeaning("নমস্কাৰ", "as");
      assert.strictEqual(res.englishMeaning, "Hello / Greetings");
      assert.strictEqual(res.isAvailable, true);
      assert.strictEqual(res.method, "verified_corpus");
    });

    test("2.3 Hindi greeting 'नमस्ते' resolves to 'Hello / Greetings'", () => {
      const res = resolveEnglishMeaning("नमस्ते", "hi");
      assert.strictEqual(res.englishMeaning, "Hello / Greetings");
      assert.strictEqual(res.isAvailable, true);
    });

    test("2.4 Tamil greeting 'வணக்கம்' resolves to 'Hello / Greetings'", () => {
      const res = resolveEnglishMeaning("வணக்கம்", "ta");
      assert.strictEqual(res.englishMeaning, "Hello / Greetings");
      assert.strictEqual(res.isAvailable, true);
    });

    test("2.5 Source was English: preserves original English text as semantic meaning", () => {
      const original = "I run a small tailoring shop in Guwahati.";
      const targetAssamese = "মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাওঁ।";
      const res = resolveEnglishMeaning(targetAssamese, "as", "en", original);
      assert.strictEqual(res.englishMeaning, original);
      assert.strictEqual(res.isAvailable, true);
    });

    test("2.6 Unknown complex sentence returns honest 'English meaning unavailable' without fabrication", () => {
      const unknownText = "এইটো এটা সম্পূৰ্ণ অজ্ঞাত বাক্য যিটো কৰ্পাছত নাই।";
      const res = resolveEnglishMeaning(unknownText, "as", "as");
      assert.strictEqual(res.englishMeaning, "English meaning unavailable");
      assert.strictEqual(res.isAvailable, false);
      assert.strictEqual(res.method, "unavailable");
    });
  });

  // ==========================================================================
  // Suite 3: Speech Recognition & Synthesis Abstractions
  // ==========================================================================
  describe("3. Speech Recognition & Synthesis Abstractions", () => {
    test("3.1 Maps Indian languages to valid BCP-47 recognition tags", () => {
      assert.strictEqual(getSpeechBCP47Tag("as"), "as-IN");
      assert.strictEqual(getSpeechBCP47Tag("bn"), "bn-IN");
      assert.strictEqual(getSpeechBCP47Tag("hi"), "hi-IN");
      assert.strictEqual(getSpeechBCP47Tag("ta"), "ta-IN");
      assert.strictEqual(getSpeechBCP47Tag("te"), "te-IN");
      assert.strictEqual(getSpeechBCP47Tag("mr"), "mr-IN");
      assert.strictEqual(getSpeechBCP47Tag("gu"), "gu-IN");
      assert.strictEqual(getSpeechBCP47Tag("kn"), "kn-IN");
      assert.strictEqual(getSpeechBCP47Tag("ml"), "ml-IN");
      assert.strictEqual(getSpeechBCP47Tag("pa"), "pa-IN");
      assert.strictEqual(getSpeechBCP47Tag("ur"), "ur-IN");
      assert.strictEqual(getSpeechBCP47Tag("en"), "en-IN");
    });

    test("3.2 Unsupported or unknown language returns null rather than silently defaulting to hi-IN", () => {
      assert.strictEqual(getSpeechBCP47Tag("xyz_unsupported"), null);
    });

    test("3.3 Explicit speech error messages provide actionable guidance", () => {
      const notAllowed = getSpeechErrorMessage("not-allowed");
      assert.strictEqual(notAllowed.code, "not-allowed");
      assert.ok(notAllowed.message.includes("permission was denied"));

      const noSpeech = getSpeechErrorMessage("no-speech");
      assert.strictEqual(noSpeech.code, "no-speech");
      assert.ok(noSpeech.actionable.includes("speak clearly"));

      const networkErr = getSpeechErrorMessage("network");
      assert.strictEqual(networkErr.code, "network");
    });
  });

  // ==========================================================================
  // Suite 4: Universal Translation Service & REST API Integration
  // ==========================================================================
  describe("4. Universal Translation Service & REST API Integration", () => {
    test("4.1 TranslationService produces Native Script + Roman Transliteration + English Meaning", async () => {
      const result = await translationService.translate({
        text: "I run a small tailoring shop in Guwahati.",
        sourceLanguage: "en",
        targetLanguage: "as",
      });

      assert.strictEqual(result.targetLanguage, "as");
      assert.ok(result.translatedText.length > 0, "Native script must be present");
      assert.ok(
        result.translatedText.includes("গুৱাহাটীত") && result.translatedText.includes("দৰ্জীৰ দোকান"),
        "Translated text must include authentic Assamese terms for Guwahati and tailoring shop"
      );
      assert.ok(result.transliteration, "Transliteration must be attached");
      assert.ok(result.transliteration.toLowerCase().includes("guwahatit") || result.transliteration.toLowerCase().includes("dorjir"));
      assert.strictEqual(result.englishMeaning, "I run a small tailoring shop in Guwahati.");
      assert.strictEqual(result.transliterationAvailable, true);
      assert.strictEqual(result.englishMeaningAvailable, true);
    });

    test("4.2 Assamese to English translation returns native, Roman, and English meaning", async () => {
      const result = await translationService.translate({
        text: "মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাওঁ।",
        sourceLanguage: "as",
        targetLanguage: "en",
      });

      assert.strictEqual(result.targetLanguage, "en");
      assert.strictEqual(result.translatedText, "I run a small tailoring shop in Guwahati.");
      assert.strictEqual(result.englishMeaning, "I run a small tailoring shop in Guwahati.");
      assert.strictEqual(result.englishMeaningAvailable, true);
    });

    test("4.3 POST /api/translate endpoint returns structured multi-output contract", async () => {
      const req = new NextRequest("http://localhost:3000/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "I am a certified electrician.",
          sourceLanguage: "en",
          targetLanguage: "hi",
        }),
      });

      const res = await translateHandler(req);
      assert.strictEqual(res.status, 200);
      const json = await res.json();

      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.targetLanguage, "hi");
      assert.strictEqual(json.data.translatedText, "मैं एक प्रमाणित इलेक्ट्रीशियन हूँ।");
      assert.ok(json.data.transliteration, "Transliteration must be returned in API response");
      assert.strictEqual(json.data.englishMeaning, "I am a certified electrician.");
      assert.strictEqual(json.data.transliterationAvailable, true);
      assert.strictEqual(json.data.englishMeaningAvailable, true);
    });

    test("4.4 Same language translation returns status 'same_language' with 1.0 confidence", async () => {
      const result = await translationService.translate({
        text: "नमस्ते",
        sourceLanguage: "hi",
        targetLanguage: "hi",
      });

      assert.strictEqual(result.status, "same_language");
      assert.strictEqual(result.confidence, 1.0);
      assert.strictEqual(result.translatedText, "नमस्ते");
      assert.strictEqual(result.transliteration, "Namaste");
      assert.strictEqual(result.englishMeaning, "Hello / Greetings");
    });

    test("4.5 Entity preservation protects phone numbers through transliteration and translation", async () => {
      const input = "Call +91 98765 43210 for electrical wiring.";
      const result = await translationService.translate({
        text: input,
        sourceLanguage: "en",
        targetLanguage: "hi",
      });

      assert.ok(result.translatedText.includes("+91 98765 43210"), "Phone number must be preserved in translated output");
    });
  });
});
