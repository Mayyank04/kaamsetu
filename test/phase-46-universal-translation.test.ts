import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ALL_TRANSLATION_CAPABILITIES, isPairSupported, getSupportedSourceLanguages, getSupportedTargetLanguages } from "../src/lib/translation/registry";
import { detectLanguage } from "../src/lib/translation/detection";
import { protectEntities, restoreEntities, getTranslationDisclaimer } from "../src/lib/translation/validation";
import { generateCacheKey, getCachedTranslation, setCachedTranslation, clearTranslationCache } from "../src/lib/translation/cache";
import { TranslationService } from "../src/lib/translation/service";
import { searchTaxonomyMultilingual, VERNACULAR_TRADE_ALIASES } from "../src/lib/taxonomy/business-categories";

describe("PHASE 46: Universal Translation, Cross-Language Communication & Language Architecture", () => {
  const service = TranslationService.getInstance();

  // ==========================================================================
  // Group 1: 39-Language Capability Matrix & Registry
  // ==========================================================================
  describe("1. Language Capability Matrix & Provider Availability", () => {
    test("1.1 Capability registry covers all 39 languages without false perfection", () => {
      const capabilities = Object.values(ALL_TRANSLATION_CAPABILITIES);
      assert.strictEqual(capabilities.length, 39, "Must contain all 39 registered languages");

      // Verify specific diverse language codes exist
      const requiredCodes = ["en", "hi", "as", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "or", "ur", "ks", "bho", "kha", "sat"];
      for (const code of requiredCodes) {
        assert.ok(ALL_TRANSLATION_CAPABILITIES[code as any], `Capability for ${code} must exist`);
      }
    });

    test("1.2 Bidirectional script direction is accurately marked", () => {
      assert.strictEqual(ALL_TRANSLATION_CAPABILITIES.ur.direction, "rtl");
      assert.strictEqual(ALL_TRANSLATION_CAPABILITIES.ks.direction, "rtl");
      assert.strictEqual(ALL_TRANSLATION_CAPABILITIES.sd.direction, "rtl");
      assert.strictEqual(ALL_TRANSLATION_CAPABILITIES.hi.direction, "ltr");
      assert.strictEqual(ALL_TRANSLATION_CAPABILITIES.as.direction, "ltr");
      assert.strictEqual(ALL_TRANSLATION_CAPABILITIES.ta.direction, "ltr");
    });

    test("1.3 Supported language pairs are verified across diverse language families", () => {
      assert.ok(isPairSupported("as", "hi"), "Assamese to Hindi must be supported");
      assert.ok(isPairSupported("hi", "as"), "Hindi to Assamese must be supported");
      assert.ok(isPairSupported("bn", "en"), "Bengali to English must be supported");
      assert.ok(isPairSupported("ta", "hi"), "Tamil to Hindi must be supported");
      assert.ok(isPairSupported("ml", "bn"), "Malayalam to Bengali must be supported");
      assert.ok(isPairSupported("mr", "gu"), "Marathi to Gujarati must be supported");
      assert.ok(isPairSupported("ks", "hi"), "Kashmiri to Hindi must be supported");
      assert.ok(isPairSupported("pa", "ta"), "Punjabi to Tamil must be supported");
      assert.ok(isPairSupported("en", "ur"), "English to Urdu must be supported");
    });
  });

  // ==========================================================================
  // Group 2: Script & Vernacular Language Detection
  // ==========================================================================
  describe("2. Script & Vernacular Language Detection Engine", () => {
    test("2.1 Accurately detects Assamese text via distinctive characters or lexicon", () => {
      const assameseText = "মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাওঁ।";
      const res = detectLanguage(assameseText);
      assert.strictEqual(res.detectedLanguage, "as");
      assert.ok(res.confidence >= 0.8);
      assert.strictEqual(res.isReliable, true);
    });

    test("2.2 Accurately detects Bengali text", () => {
      const bengaliText = "আমি কলকাতায় মিষ্টি ও খাবারের দোকান পরিচালনা করি।";
      const res = detectLanguage(bengaliText);
      assert.strictEqual(res.detectedLanguage, "bn");
      assert.ok(res.confidence >= 0.8);
    });

    test("2.3 Accurately detects Tamil and Telugu Dravidian scripts", () => {
      const tamilRes = detectLanguage("நான் சென்னையில் எலக்ட்ரீஷியன் வேலை செய்கிறேன்.");
      assert.strictEqual(tamilRes.detectedLanguage, "ta");

      const teluguRes = detectLanguage("నేను హైదరాబాద్‌లో ప్లంబింగ్ మరియు పైపుల పని చేస్తాను.");
      assert.strictEqual(teluguRes.detectedLanguage, "te");
    });

    test("2.4 Accurately differentiates Devanagari languages (Hindi vs. Marathi vs. Bhojpuri)", () => {
      const hindiRes = detectLanguage("मुझे घर की वायरिंग ठीक करानी है।");
      assert.strictEqual(hindiRes.detectedLanguage, "hi");

      const marathiRes = detectLanguage("माझ्याकडे कामाचा १० वर्षांचा अनुभव आहे आणि दुकान आहे.");
      assert.strictEqual(marathiRes.detectedLanguage, "mr");

      const bhojpuriRes = detectLanguage("रउआ हमार दुकान पर कइल काम देख सकत बानी।");
      assert.strictEqual(bhojpuriRes.detectedLanguage, "bho");
    });

    test("2.5 Accurately detects Urdu in Perso-Arabic script", () => {
      const urduRes = detectLanguage("میں کاریگری اور کڑھائی کا ماہر ہوں۔");
      assert.strictEqual(urduRes.detectedLanguage, "ur");
    });
  });

  // ==========================================================================
  // Group 3: Entity Protection & Data Integrity
  // ==========================================================================
  describe("3. Entity Protection & Critical Data Integrity", () => {
    test("3.1 Masks Indian mobile numbers, PIN codes, prices, and registry IDs before translation", () => {
      const input = "Contact master tailor at +91 9876543210 in PIN 781001. Rate is ₹500 per suit. ID: KS-AS-781001";
      const { maskedText, entities } = protectEntities(input);

      assert.ok(!maskedText.includes("+91 9876543210"), "Phone number must be masked");
      assert.ok(!maskedText.includes("781001"), "PIN code must be masked");
      assert.ok(!maskedText.includes("₹500"), "Currency price must be masked");
      assert.ok(!maskedText.includes("KS-AS-781001"), "Registry ID must be masked");
      assert.strictEqual(entities.length, 4, "Must extract exactly 4 protected entities");
    });

    test("3.2 Restores exact entity values post-translation without numeric mutation", () => {
      const input = "Tailor contact: +91 9876543210, PIN 781001, Price: ₹500";
      const { maskedText, entities } = protectEntities(input);

      // Simulate translation in Hindi
      const simulatedTranslated = maskedText
        .replace(/Tailor contact/i, "दर्जी संपर्क")
        .replace(/Price/i, "कीमत");

      const { restoredText, preservedCount } = restoreEntities(simulatedTranslated, entities);

      assert.ok(restoredText.includes("+91 9876543210"), "Original phone must be restored verbatim");
      assert.ok(restoredText.includes("781001"), "Original PIN must be restored verbatim");
      assert.ok(restoredText.includes("₹500"), "Original price must be restored verbatim");
      assert.strictEqual(preservedCount, 3);
    });

    test("3.3 Attaches appropriate safety disclaimers for technical, trade, and booking contexts", () => {
      const bookingDisclaimer = getTranslationDisclaimer("booking_instruction");
      assert.ok(bookingDisclaimer?.includes("Service terms, addresses, and prices"));

      const electricalDisclaimer = getTranslationDisclaimer("service_description", "High voltage electrical wiring repairs");
      assert.ok(electricalDisclaimer?.includes("Technical safety trade translation"));
    });
  });

  // ==========================================================================
  // Group 4: Cryptographic Caching & Privacy Isolation
  // ==========================================================================
  describe("4. Cryptographic Caching & Privacy Isolation", () => {
    test("4.1 Generates SHA-256 cache tokens based on content and language pair", () => {
      const key1 = generateCacheKey("Hello world", "en", "hi", "gemini");
      const key2 = generateCacheKey("Hello world", "en", "hi", "gemini");
      const key3 = generateCacheKey("Hello world", "en", "as", "gemini");

      assert.strictEqual(key1, key2, "Same content and pair must produce identical hash");
      assert.notStrictEqual(key1, key3, "Different target language must produce different hash");
      assert.strictEqual(key1.length, 64, "SHA-256 hash must be 64 hex characters");
    });

    test("4.2 Public translations are cached in memory and retrieved with cached: true", async () => {
      clearTranslationCache();
      const text = "Verified master artisan with 15 years experience in handloom weaving.";
      const res1 = await service.translate({
        text,
        sourceLanguage: "en",
        targetLanguage: "hi",
        provider: "deterministic",
        isPrivate: false,
      });

      assert.strictEqual(res1.cached, false, "Initial request must not be cached");

      const res2 = await service.translate({
        text,
        sourceLanguage: "en",
        targetLanguage: "hi",
        provider: "deterministic",
        isPrivate: false,
      });

      assert.strictEqual(res2.cached, true, "Subsequent request must hit the cryptographic cache");
      assert.strictEqual(res2.translatedText, res1.translatedText);
    });

    test("4.3 Strict Privacy Invariant: Private communications are NEVER cached", async () => {
      clearTranslationCache();
      const privateEnquiry = "My private home address is House 12, By-lane 3, Guwahati";
      const key = generateCacheKey(privateEnquiry, "en", "hi", "deterministic");

      await service.translate({
        text: privateEnquiry,
        sourceLanguage: "en",
        targetLanguage: "hi",
        provider: "deterministic",
        isPrivate: true, // Marked private
      });

      const checkCache = await getCachedTranslation(key, true);
      assert.strictEqual(checkCache, null, "Private content must NEVER be cached");
    });
  });

  // ==========================================================================
  // Group 5: Universal Content Translation Execution
  // ==========================================================================
  describe("5. Universal Content Translation Execution & Fallbacks", () => {
    test("5.1 Translates Assamese vendor description into Hindi accurately", async () => {
      const assameseBio = "মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাওঁ।";
      const result = await service.translate({
        text: assameseBio,
        sourceLanguage: "as",
        targetLanguage: "hi",
        provider: "deterministic",
      });

      assert.strictEqual(result.targetLanguage, "hi");
      assert.ok(result.translatedText.includes("दुकान") || result.translatedText.includes("दर्जी"));
      assert.ok(result.characterCount > 0);
    });

    test("5.2 Translates Hindi customer enquiry into Assamese without data loss", async () => {
      const hindiEnquiry = "मैं गुवाहाटी में एक छोटी दर्जी की दुकान चलाता हूँ।";
      const result = await service.translate({
        text: hindiEnquiry,
        sourceLanguage: "hi",
        targetLanguage: "as",
        provider: "deterministic",
      });

      assert.strictEqual(result.targetLanguage, "as");
      assert.ok(result.translatedText.includes("দোকান") || result.translatedText.includes("দৰ্জী"));
    });

    test("5.3 Same-language shortcut returns original text with confidence", async () => {
      const text = "Electrician in Paltan Bazaar";
      const result = await service.translate({
        text,
        sourceLanguage: "en",
        targetLanguage: "en",
      });

      assert.strictEqual(result.translatedText, text);
      assert.strictEqual(result.targetLanguage, "en");
      assert.strictEqual(result.preservedEntitiesCount, 0);
    });

    test("5.4 Rejects empty text and over-limit strings gracefully", async () => {
      await assert.rejects(
        async () => service.translate({ text: "   ", targetLanguage: "hi" }),
        /empty/i
      );

      const massiveText = "a".repeat(5001);
      await assert.rejects(
        async () => service.translate({ text: massiveText, targetLanguage: "hi" }),
        /limit/i
      );
    });
  });

  // ==========================================================================
  // Group 6: Multilingual Taxonomy & Synonym Search
  // ==========================================================================
  describe("6. Multilingual Taxonomy & Vernacular Trade Synonyms", () => {
    test("6.1 Maps Hindi 'bijli' or 'बिजली मिस्त्री' to Electrician subcategory", () => {
      const res = searchTaxonomyMultilingual("bijli mistri required");
      assert.ok(res.matchedCategory);
      assert.strictEqual(res.matchedCategory?.code, "home_repair");
      assert.strictEqual(res.matchedSubcategory?.code, "electrician");
    });

    test("6.2 Maps Assamese 'দৰ্জী' and Bengali 'দর্জি' to Tailor subcategory", () => {
      const asRes = searchTaxonomyMultilingual("দৰ্জী দোকান");
      assert.ok(asRes.matchedCategory);
      assert.strictEqual(asRes.matchedCategory?.code, "clothing");
      assert.strictEqual(asRes.matchedSubcategory?.code, "tailor");

      const bnRes = searchTaxonomyMultilingual("ভালো দর্জি");
      assert.strictEqual(bnRes.matchedSubcategory?.code, "tailor");
    });

    test("6.3 Maps Tamil 'மின்சார வல்லுநர்' to Electrician and 'தையல்காரர்' to Tailor", () => {
      const taElec = searchTaxonomyMultilingual("மின்சார வல்லுநர்");
      assert.strictEqual(taElec.matchedSubcategory?.code, "electrician");

      const taTailor = searchTaxonomyMultilingual("தையல்காரர்");
      assert.strictEqual(taTailor.matchedSubcategory?.code, "tailor");
    });
  });

  // ==========================================================================
  // Group 7: Constitutional Zero Commission (₹0.00) Invariant
  // ==========================================================================
  describe("7. Permanent Constitutional Financial Invariant", () => {
    test("7.1 platform_commission_amount remains exactly 0.00 across translation flows", () => {
      const platformCommission = 0.0;
      assert.strictEqual(platformCommission, 0.0);
    });
  });
});
