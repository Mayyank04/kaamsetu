/**
 * KAAMSETU — PHASE 49: INDEPENDENT TRANSLATION ACCEPTANCE TEST SUITE
 * 
 * Verifies:
 * 1. Provider availability and operational status (Google, Azure, Bhashini, Gemini, Deterministic).
 * 2. Distinction between genuine translation, dictionary substitution, and unchanged text.
 * 3. Status handling: 'translated', 'same_language', 'partial_translation', 'fallback_limited', 'provider_unavailable'.
 * 4. Entity protection & restoration (phones, prices, PINs, registry IDs, URLs).
 * 5. Private message cache isolation (isPrivate: true NEVER writes to shared cache).
 * 6. Provider latency measurements and failure handling.
 */

import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import {
  DeterministicTranslationProvider,
  GeminiTranslationProvider,
  BhashiniTranslationProvider,
  GoogleCloudTranslationProvider,
  AzureTranslationProvider,
} from "../src/lib/translation/provider";
import { TranslationService } from "../src/lib/translation/service";
import {
  protectEntities,
  restoreEntities,
  getTranslationDisclaimer,
} from "../src/lib/translation/validation";
import {
  generateCacheKey,
  getCachedTranslation,
  setCachedTranslation,
  clearTranslationCache,
  getCacheStats,
} from "../src/lib/translation/cache";
import { detectLanguage } from "../src/lib/translation/detection";

describe("PHASE 49: TRANSLATION ACCEPTANCE & PROVIDER VERIFICATION", () => {
  const service = TranslationService.getInstance();

  // ==========================================================================
  // Suite 1: Provider Operational Classification & Health Status
  // ==========================================================================
  describe("1. Provider Operational Classification & Health Status", () => {
    test("1.1 Deterministic offline corpus provider is fully operational", async () => {
      const provider = new DeterministicTranslationProvider();
      const isHealthy = await provider.isHealthy();
      assert.strictEqual(isHealthy, true, "Deterministic provider must always report healthy");
      assert.strictEqual(provider.name, "deterministic");
    });

    test("1.2 Gemini provider reflects environment configuration", async () => {
      const provider = new GeminiTranslationProvider();
      const isHealthy = await provider.isHealthy();
      const hasApiKey = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("placeholder"));
      assert.strictEqual(isHealthy, hasApiKey, "Gemini health must truthfully match GEMINI_API_KEY availability");
    });

    test("1.3 External providers without credentials report unavailable truthfully", async () => {
      const google = new GoogleCloudTranslationProvider();
      const azure = new AzureTranslationProvider();
      const bhashini = new BhashiniTranslationProvider();

      const googleHealthy = await google.isHealthy();
      const azureHealthy = await azure.isHealthy();
      const bhashiniHealthy = await bhashini.isHealthy();

      // Based on .env.local, these keys are unconfigured
      assert.strictEqual(googleHealthy, Boolean(process.env.GOOGLE_TRANSLATE_API_KEY), "Google health check");
      assert.strictEqual(azureHealthy, Boolean(process.env.AZURE_TRANSLATOR_KEY), "Azure health check");
      assert.strictEqual(bhashiniHealthy, Boolean(process.env.BHASHINI_API_KEY), "Bhashini health check");
    });

    test("1.4 Direct translation calls to unconfigured providers throw clear errors", async () => {
      const google = new GoogleCloudTranslationProvider();
      if (!(await google.isHealthy())) {
        await assert.rejects(
          async () => {
            await google.translate({ text: "Hello", targetLanguage: "hi" });
          },
          /GOOGLE_TRANSLATE_API_KEY is not configured/
        );
      }

      const azure = new AzureTranslationProvider();
      if (!(await azure.isHealthy())) {
        await assert.rejects(
          async () => {
            await azure.translate({ text: "Hello", targetLanguage: "hi" });
          },
          /AZURE_TRANSLATOR_KEY/
        );
      }

      const bhashini = new BhashiniTranslationProvider();
      if (!(await bhashini.isHealthy())) {
        await assert.rejects(
          async () => {
            await bhashini.translate({ text: "Hello", targetLanguage: "hi" });
          },
          /Bhashini credentials/
        );
      }
    });
  });

  // ==========================================================================
  // Suite 2: Status Discrimination (Genuine vs Dictionary vs Unchanged)
  // ==========================================================================
  describe("2. Status Discrimination & Qualitative Truthfulness", () => {
    const provider = new DeterministicTranslationProvider();

    test("2.1 Same-language input returns status 'same_language' and confidence 1.0", async () => {
      const res = await provider.translate({
        text: "नमस्ते मुझे काम चाहिए",
        sourceLanguage: "hi",
        targetLanguage: "hi",
      });
      assert.strictEqual(res.status, "same_language");
      assert.strictEqual(res.confidence, 1.0);
      assert.strictEqual(res.translatedText, "नमस्ते मुझे काम चाहिए");
      assert.strictEqual(res.isFallback, undefined);
    });

    test("2.2 Exact corpus sentence returns status 'translated' and high confidence", async () => {
      const res = await provider.translate({
        text: "I run a small tailoring shop in Guwahati.",
        sourceLanguage: "en",
        targetLanguage: "hi",
      });
      assert.strictEqual(res.status, "translated");
      assert.ok((res.confidence ?? 0) >= 0.95);
      assert.strictEqual(res.isFallback, false);
      assert.strictEqual(res.isPartial, false);
      assert.strictEqual(res.translatedText, "मैं गुवाहाटी में एक छोटी दर्जी की दुकान चलाता हूँ।");
    });

    test("2.3 Vocabulary keyword replacement returns status 'partial_translation'", async () => {
      const res = await provider.translate({
        text: "tailor and electrician daily services",
        sourceLanguage: "en",
        targetLanguage: "hi",
      });
      assert.strictEqual(res.status, "partial_translation");
      assert.strictEqual(res.isPartial, true);
      assert.strictEqual(res.isFallback, true);
      assert.ok((res.confidence ?? 1) <= 0.60);
      assert.ok(res.translatedText.includes("दर्जी"));
      assert.ok(res.translatedText.includes("इलेक्ट्रीशियन"));
    });

    test("2.4 Completely unknown sentence returns status 'fallback_limited' and 0 confidence", async () => {
      const res = await provider.translate({
        text: "xyz obscure unmapped phrase 99999",
        sourceLanguage: "en",
        targetLanguage: "hi",
      });
      assert.strictEqual(res.status, "fallback_limited");
      assert.strictEqual(res.isUntranslated, true);
      assert.strictEqual(res.confidence, 0.0);
      assert.ok(res.fallbackReason?.includes("not found in offline dictionary"));
    });
  });

  // ==========================================================================
  // Suite 3: Entity Masking & Zero-Loss Restoration
  // ==========================================================================
  describe("3. Entity Protection & Restoration", () => {
    test("3.1 Protects phone numbers, currency, PIN codes, URLs, and registry IDs", () => {
      const original = "Call 9876543210 or visit https://kaamsetu.org at PIN 781001. Rate is ₹1,500. Reg KS-AS-781001.";
      const { maskedText, entities } = protectEntities(original);

      assert.strictEqual(entities.length, 5, "Must identify all 5 distinct entities");
      assert.ok(maskedText.includes("[[ENTITY_PHONE_"), "Phone must be masked");
      assert.ok(maskedText.includes("[[ENTITY_URL_"), "URL must be masked");
      assert.ok(maskedText.includes("[[ENTITY_PIN_"), "PIN must be masked");
      assert.ok(maskedText.includes("[[ENTITY_CURRENCY_"), "Currency must be masked");
      assert.ok(maskedText.includes("[[ENTITY_REGISTRY_"), "Registry ID must be masked");

      const { restoredText, preservedCount } = restoreEntities(maskedText, entities);
      assert.strictEqual(preservedCount, 5);
      assert.strictEqual(restoredText, original, "Restored text must match original exactly");
    });

    test("3.2 Preserves entities through translation pipeline", async () => {
      const input = "I run a small tailoring shop in Guwahati. Call 9876543210 for rates starting at ₹500.";
      const res = await service.translate({
        text: input,
        sourceLanguage: "en",
        targetLanguage: "hi",
        provider: "deterministic",
      });

      assert.ok(res.translatedText.includes("9876543210"), "Phone must be preserved in translated text");
      assert.ok(res.translatedText.includes("₹500"), "Currency must be preserved in translated text");
      assert.ok(res.preservedEntitiesCount >= 2, "Must report preserved entities count");
    });
  });

  // ==========================================================================
  // Suite 4: Privacy Invariant — Strictly No Caching for Private Messages
  // ==========================================================================
  describe("4. Privacy Invariant & Cryptographic Cache Isolation", () => {
    test("4.1 Public translation is safely cached", async () => {
      clearTranslationCache();
      const initialStats = getCacheStats();

      const text = "I am a certified electrician.";
      const res1 = await service.translate({
        text,
        sourceLanguage: "en",
        targetLanguage: "hi",
        provider: "deterministic",
        isPrivate: false,
      });

      assert.strictEqual(res1.cached, false);
      const afterStats = getCacheStats();
      assert.strictEqual(afterStats.size, initialStats.size + 1, "Cache size should increase by 1");

      const res2 = await service.translate({
        text,
        sourceLanguage: "en",
        targetLanguage: "hi",
        provider: "deterministic",
        isPrivate: false,
      });
      assert.strictEqual(res2.cached, true, "Second lookup must be served from cache");
    });

    test("4.2 Private communications (isPrivate: true) are NEVER cached", async () => {
      clearTranslationCache();
      const statsBefore = getCacheStats();

      const privateText = "Confidential customer enquiry: please send quote to PIN 781001";
      const key = generateCacheKey(privateText, "en", "hi", "deterministic");

      // Attempt to cache with isPrivate: true
      await setCachedTranslation(key, {
        translatedText: "Private translated message",
        detectedSourceLanguage: "en",
        targetLanguage: "hi",
        provider: "deterministic",
        cached: false,
        status: "translated",
        confidence: 0.99,
        characterCount: 26,
        preservedEntitiesCount: 0,
      }, true);

      const statsAfter = getCacheStats();
      assert.strictEqual(statsAfter.size, statsBefore.size, "Cache size must not change when isPrivate is true");

      const lookup = await getCachedTranslation(key, true);
      assert.strictEqual(lookup, null, "Cache lookup with isPrivate must return null");

      // Now run through service with isPrivate: true
      const serviceRes = await service.translate({
        text: "I run a small tailoring shop in Guwahati.",
        sourceLanguage: "en",
        targetLanguage: "hi",
        provider: "deterministic",
        isPrivate: true,
      });
      assert.strictEqual(serviceRes.cached, false);

      const statsAfterService = getCacheStats();
      assert.strictEqual(statsAfterService.size, statsBefore.size, "Service must not populate cache for private messages");
    });
  });

  // ==========================================================================
  // Suite 5: Fallback Cascade & Resilient Routing
  // ==========================================================================
  describe("5. Fallback Cascade & Resilient Multi-Provider Routing", () => {
    test("5.1 Requesting unconfigured provider (Google) cascades cleanly to Deterministic", async () => {
      const startTime = Date.now();
      const res = await service.translate({
        text: "I run a small tailoring shop in Guwahati.",
        sourceLanguage: "en",
        targetLanguage: "hi",
        provider: "google_cloud",
      });
      const durationMs = Date.now() - startTime;

      assert.ok(res.translatedText.includes("दर्जी की दुकान"));
      assert.strictEqual(res.isFallback, true, "Must flag as fallback when primary provider is unavailable");
      assert.ok(res.fallbackReason?.includes("google_cloud"), "Must state primary provider in fallback reason");
      assert.ok(durationMs < 1000, `Fallback should be fast (took ${durationMs}ms)`);
    });

    test("5.2 Requesting unconfigured provider (Bhashini) cascades cleanly to Deterministic", async () => {
      const res = await service.translate({
        text: "I run a small tailoring shop in Guwahati.",
        sourceLanguage: "en",
        targetLanguage: "hi",
        provider: "bhashini",
      });
      assert.strictEqual(res.isFallback, true);
      assert.ok(res.fallbackReason?.includes("bhashini"));
    });

    test("5.3 Requesting unconfigured provider (Azure) cascades cleanly to Deterministic", async () => {
      const res = await service.translate({
        text: "I run a small tailoring shop in Guwahati.",
        sourceLanguage: "en",
        targetLanguage: "hi",
        provider: "azure",
      });
      assert.strictEqual(res.isFallback, true);
      assert.ok(res.fallbackReason?.includes("azure"));
    });
  });

  // ==========================================================================
  // Suite 6: Live Gemini Translation (if configured)
  // ==========================================================================
  describe("6. Live Gemini Provider Acceptance", () => {
    const gemini = new GeminiTranslationProvider();

    test("6.1 Live Gemini translation executes with high quality and latency tracking", async (t) => {
      const isConfigured = await gemini.isHealthy();
      if (!isConfigured) {
        t.skip("GEMINI_API_KEY not configured in environment");
        return;
      }

      const start = Date.now();
      const res = await gemini.translate({
        text: "I am a skilled carpenter in Guwahati. Call +91 98765 43210 for furniture repair.",
        sourceLanguage: "en",
        targetLanguage: "hi",
      });
      const elapsed = Date.now() - start;

      assert.strictEqual(res.status, "translated");
      assert.strictEqual(res.provider, "gemini");
      assert.strictEqual(res.isFallback, false);
      assert.ok((res.confidence ?? 0) >= 0.90);
      assert.ok(res.translatedText.includes("+91 98765 43210"), "Phone must be preserved in Gemini translation");
      assert.ok(elapsed > 0 && elapsed < 8000, `Gemini latency must be reasonable (${elapsed}ms)`);
    });
  });

  after(() => {
    setTimeout(() => process.exit(0), 100);
  });
});
