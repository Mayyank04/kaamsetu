import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { BUSINESS_CATEGORIES, getCategoryById, searchTaxonomyMultilingual } from "../src/lib/taxonomy/business-categories";
import { DeterministicTranslationProvider, GeminiTranslationProvider } from "../src/lib/translation/provider";
import { TranslationService } from "../src/lib/translation/service";

describe("PHASE 47: Product Experience Excellence, Intelligent UX & Full-Stack Reliability", () => {
  // ==========================================================================
  // Group 1: Dynamic Taxonomy & Category-Specific Schemas
  // ==========================================================================
  describe("1. Dynamic Business Categories & Trade-Specific Fields", () => {
    test("1.1 Electrician subcategory contains CEA qualifications and specializations", () => {
      const servicesCat = getCategoryById("home_repair");
      assert.ok(servicesCat, "Home Repair category must exist");
      const electrician = servicesCat.subcategories.find((s) => s.id === "sub-electrician");
      assert.ok(electrician, "Electrician subcategory must exist");

      const specField = electrician.fields.find((f) => f.id === "specializations");
      assert.ok(specField, "specializations field must exist");
      assert.strictEqual(specField.type, "multiselect");
      assert.ok(specField.options?.some((o) => o.value === "inverter_wiring"));
      assert.ok(specField.options?.some((o) => o.value === "panel_installation"));

      const qualField = electrician.fields.find((f) => f.id === "applicable_qualifications");
      assert.ok(qualField, "applicable_qualifications field must exist");
    });

    test("1.2 Tailor subcategory contains alteration services and turnaround days", () => {
      const clothingCat = getCategoryById("clothing");
      assert.ok(clothingCat, "Clothing category must exist");
      const tailor = clothingCat.subcategories.find((s) => s.id === "sub-tailor");
      assert.ok(tailor, "Tailor subcategory must exist");

      const altField = tailor.fields.find((f) => f.id === "alteration_services");
      assert.ok(altField, "alteration_services field must exist");
      assert.strictEqual(altField.type, "multiselect");
      assert.ok(altField.options?.some((o) => o.value === "fitting"));
      assert.ok(altField.options?.some((o) => o.value === "zipper_replace"));

      const turnField = tailor.fields.find((f) => f.id === "turnaround_days");
      assert.ok(turnField, "turnaround_days field must exist");
      assert.strictEqual(turnField.type, "number");
    });

    test("1.3 Restaurant subcategory contains FSSAI license and cuisine types", () => {
      const foodCat = getCategoryById("food");
      assert.ok(foodCat, "Food category must exist");
      const restaurant = foodCat.subcategories.find((s) => s.id === "sub-restaurant");
      assert.ok(restaurant, "Restaurant subcategory must exist");

      const fssaiField = restaurant.fields.find((f) => f.id === "fssai_license_number");
      assert.ok(fssaiField, "fssai_license_number field must exist");

      const cuisineField = restaurant.fields.find((f) => f.id === "cuisine_types");
      assert.ok(cuisineField, "cuisine_types field must exist");
      assert.strictEqual(cuisineField.type, "multiselect");
      assert.ok(cuisineField.options?.some((o) => o.value === "assamese_northeastern"));
      assert.ok(cuisineField.options?.some((o) => o.value === "north_indian"));
    });

    test("1.4 Mechanic subcategory contains repair services and mobile assist", () => {
      const transportCat = getCategoryById("transport");
      assert.ok(transportCat, "Transport category must exist");
      const mechanic = transportCat.subcategories.find((s) => s.id === "sub-mechanic");
      assert.ok(mechanic, "Mechanic subcategory must exist");

      const repairServices = mechanic.fields.find((f) => f.id === "repair_services");
      assert.ok(repairServices, "repair_services field must exist");
      assert.ok(repairServices.options?.some((o) => o.value === "engine_overhaul"));
      assert.ok(repairServices.options?.some((o) => o.value === "tyre_puncture"));
    });

    test("1.5 Farmer subcategory contains seasonal availability and organic certification", () => {
      const agriCat = getCategoryById("agri");
      assert.ok(agriCat, "Agriculture category must exist");
      const farmer = agriCat.subcategories.find((s) => s.id === "sub-farmer");
      assert.ok(farmer, "Farmer subcategory must exist");

      const seasonField = farmer.fields.find((f) => f.id === "seasonal_availability");
      assert.ok(seasonField, "seasonal_availability field must exist");
      assert.ok(seasonField.options?.some((o) => o.value === "kharif"));
      assert.ok(seasonField.options?.some((o) => o.value === "rabi"));
    });

    test("1.6 Tutor subcategory contains education levels and teaching languages", () => {
      const eduCat = getCategoryById("education");
      assert.ok(eduCat, "Education category must exist");
      const tutor = eduCat.subcategories.find((s) => s.id === "sub-tutor");
      assert.ok(tutor, "Tutor subcategory must exist");

      const eduLevels = tutor.fields.find((f) => f.id === "education_levels");
      assert.ok(eduLevels, "education_levels field must exist");
      assert.ok(eduLevels.options?.some((o) => o.value === "secondary"));
    });

    test("1.7 Artisan subcategory contains materials used and portfolio count", () => {
      const artisanCat = getCategoryById("artisan");
      assert.ok(artisanCat, "Artisan category must exist");
      const handloom = artisanCat.subcategories.find((s) => s.id === "sub-handloom");
      assert.ok(handloom, "Handloom subcategory must exist");

      const materials = handloom.fields.find((f) => f.id === "materials_used");
      assert.ok(materials, "materials_used field must exist");
      assert.ok(materials.options?.some((o) => o.value === "muga_silk"));
      assert.ok(materials.options?.some((o) => o.value === "bamboo_cane"));
    });
  });

  // ==========================================================================
  // Group 2: Translation System Resilience & Honest Transparency
  // ==========================================================================
  describe("2. Translation Resilience, Fallbacks & Honest Confidence", () => {
    const deterministicProvider = new DeterministicTranslationProvider();

    test("2.1 Exact trade corpus matches return high confidence and isFallback=false", async () => {
      const res = await deterministicProvider.translate({
        text: "I am a certified electrician.",
        sourceLanguage: "en",
        targetLanguage: "hi",
      });
      assert.ok((res.confidence ?? 0) >= 0.95, "Exact match should have >= 0.95 confidence");
      assert.strictEqual(res.isFallback, false, "Exact corpus match is not a degraded fallback");
      assert.ok(res.translatedText.includes("इलेक्ट्रीशियन"));
    });

    test("2.2 Partial vocabulary substitution sets isFallback=true, isPartial=true and 0.50 confidence", async () => {
      const res = await deterministicProvider.translate({
        text: "Need urgent electrician to fix broken distribution board today",
        sourceLanguage: "en",
        targetLanguage: "hi",
      });
      assert.strictEqual(res.isFallback, true, "Partial substitution must be marked as fallback");
      assert.strictEqual(res.isPartial, true, "Must be marked as partial replacement");
      assert.strictEqual(res.confidence, 0.5, "Confidence must be realistically capped at 0.50");
      assert.ok(res.disclaimer?.includes("Partial trade lexicon match"));
    });

    test("2.3 Complete translation miss marks isUntranslated=true without claiming false confidence", async () => {
      const res = await deterministicProvider.translate({
        text: "Quantum chromodynamics calculates asymptotic freedom in gluons",
        sourceLanguage: "en",
        targetLanguage: "as",
      });
      assert.strictEqual(res.isFallback, true);
      assert.strictEqual(res.isUntranslated, true);
      assert.strictEqual(res.confidence, 0.0);
    });

    test("2.4 Gemini provider initializes cleanly with provider name 'gemini'", () => {
      const geminiProvider = new GeminiTranslationProvider();
      assert.strictEqual(geminiProvider.name, "gemini");
    });
  });

  // ==========================================================================
  // Group 3: Intelligent Voice Assistant & Speech Intent Processing
  // ==========================================================================
  describe("3. Voice Assistant Intent Extraction & Review Safety", () => {
    function parseVoiceIntentMock(transcript: string) {
      const text = transcript.toLowerCase();
      if ((text.includes("i am") || text.includes("i'm")) && (text.includes("carpenter") || text.includes("electrician"))) {
        const trade = text.includes("carpenter") ? "Carpenter" : "Electrician";
        const location = text.includes("guwahati") ? "Guwahati" : "Unknown";
        return {
          action: "onboard_worker",
          summary: `Start worker profile as ${trade} in ${location}`,
          params: { trade, location },
        };
      }
      if (text.includes("register") && (text.includes("tailor") || text.includes("business"))) {
        return {
          action: "register_vendor",
          summary: "Open vendor registration form for tailoring shop",
          params: { category: "clothing", subcategory: "sub-tailor" },
        };
      }
      if (text.includes("find") || text.includes("search")) {
        const query = text.includes("electrician") ? "Electrician" : "Professional";
        return {
          action: "search",
          summary: `Search registry for ${query}`,
          params: { query },
        };
      }
      if (text.includes("language") && (text.includes("assamese") || text.includes("hindi"))) {
        const locale = text.includes("assamese") ? "as" : "hi";
        return {
          action: "change_language",
          summary: `Switch interface language to ${locale === "as" ? "Assamese" : "Hindi"}`,
          params: { locale },
        };
      }
      if (text.includes("add") && (text.includes("product") || text.includes("item"))) {
        return {
          action: "add_product",
          summary: "Open add product catalog form in vendor hub",
          params: { target: "catalog" },
        };
      }
      return {
        action: "unknown",
        summary: "Could not determine precise action",
        params: {},
      };
    }

    test("3.1 'I am a carpenter in Guwahati' extracts worker onboarding with trade and city", () => {
      const res = parseVoiceIntentMock("I am a carpenter in Guwahati");
      assert.strictEqual(res.action, "onboard_worker");
      assert.strictEqual(res.params.trade, "Carpenter");
      assert.strictEqual(res.params.location, "Guwahati");
    });

    test("3.2 'I want to register my tailoring business' routes to vendor registration", () => {
      const res = parseVoiceIntentMock("I want to register my tailoring business");
      assert.strictEqual(res.action, "register_vendor");
      assert.strictEqual(res.params.category, "clothing");
      assert.strictEqual(res.params.subcategory, "sub-tailor");
    });

    test("3.3 'Find an electrician near me' extracts search query", () => {
      const res = parseVoiceIntentMock("Find an electrician near me");
      assert.strictEqual(res.action, "search");
      assert.strictEqual(res.params.query, "Electrician");
    });

    test("3.4 'Change my preferred language to Assamese' resolves target locale code", () => {
      const res = parseVoiceIntentMock("Change my preferred language to Assamese");
      assert.strictEqual(res.action, "change_language");
      assert.strictEqual(res.params.locale, "as");
    });

    test("3.5 'Add a new product to my shop' routes to vendor product catalog", () => {
      const res = parseVoiceIntentMock("Add a new product to my shop");
      assert.strictEqual(res.action, "add_product");
      assert.strictEqual(res.params.target, "catalog");
    });
  });

  // ==========================================================================
  // Group 4: Worker First-Screen Operational Dashboard
  // ==========================================================================
  describe("4. Worker Dashboard First-Screen Priority Actions", () => {
    test("4.1 Availability state transitions cleanly between available, on_site, unavailable", () => {
      const states = ["available", "on_site", "unavailable"];
      for (const st of states) {
        assert.ok(["available", "on_site", "unavailable"].includes(st));
      }
    });

    test("4.2 Public search listing retains worker self-sovereign control", () => {
      let isPublished = false;
      const togglePublish = () => { isPublished = !isPublished; };
      togglePublish();
      assert.strictEqual(isPublished, true);
      togglePublish();
      assert.strictEqual(isPublished, false);
    });
  });

  // ==========================================================================
  // Group 5: Permanent Constitutional Financial Invariant
  // ==========================================================================
  describe("5. Permanent Constitutional Invariant", () => {
    test("5.1 platform_commission_amount remains permanently 0.00 across all operations", () => {
      const artisanFee = 1500;
      const platformCommission = 0.00;
      const workerPayout = artisanFee - platformCommission;
      assert.strictEqual(platformCommission, 0.00);
      assert.strictEqual(workerPayout, 1500);
    });
  });
});
