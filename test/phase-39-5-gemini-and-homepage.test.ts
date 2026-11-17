import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractDeterministicFallback,
  getGeminiModelCandidates,
  extractOnboardingProfile,
} from "@/lib/gemini/onboarding-extractor";
import { extractSkillsFromTranscript } from "@/lib/gemini/client";
import { onboardingExtractedProfileSchema } from "@/schemas/onboarding.schema";

describe("PHASE 39.5: GEMINI MODEL COMPATIBILITY & EXTRACTION ROBUSTNESS", () => {
  it("Resolves prioritized model candidate chain starting with configured or gemini-3.8-flash", () => {
    const candidates = getGeminiModelCandidates();
    assert.ok(candidates.length >= 3, "Must have at least 3 fallback candidate models");
    assert.ok(candidates.includes("gemini-3.8-flash"), "Must include gemini-3.8-flash");
    assert.ok(candidates.includes("gemini-3.5-flash"), "Must include gemini-3.5-flash");
    assert.equal(candidates[0], "gemini-3.8-flash", "Primary candidate should be gemini-3.8-flash");
  });

  it("Deterministic parser extracts trade, experience and location without fabricating surnames", () => {
    const transcript = "Mera naam Dipak hai, main Guwahati mein pichhle 8 saal se plumbing aur pipe fitting ka kaam karta hoon.";
    const result = extractDeterministicFallback(transcript, "hi");

    assert.equal(result.fullName, "Dipak");
    assert.equal(result.occupation, "Master Sanitary Engineer & High-Pressure Piping Specialist");
    assert.equal(result.category, "Plumbing & Sanitation");
    assert.equal(result.experienceYears, 8);
    assert.equal(result.city, "Guwahati");
    assert.equal(result.state, "Assam");
    assert.equal(result.extractionMethod, "deterministic_parser");
    assert.ok(result.skills.length >= 1);
    assert.ok(result.confidenceScore <= 0.85, "Confidence score must be honest, not inflated 0.99");
  });

  it("Deterministic parser respects unmentioned fields and populates missingFields", () => {
    const transcript = "Main electrician hoon, solar wiring karta hoon.";
    const result = extractDeterministicFallback(transcript, "hi");

    assert.equal(result.experienceYears, null, "Must not invent experience if unmentioned");
    assert.ok(result.missingFields.includes("Years of Trade Experience"));
    assert.ok(result.missingFields.includes("Daily Rate Expectations (₹ / day)"));
    assert.ok(result.missingFields.includes("Operating City & Primary District"));
  });

  it("extractOnboardingProfile schema validates structured profile output", () => {
    const validProfile = {
      fullName: "Bipul",
      occupation: "Carpenter & Joiner",
      category: "Carpentry & Joinery",
      experienceYears: 5,
      employmentType: "self_employed",
      skills: ["Teak Joinery", "Furniture Framing"],
      equipmentHandled: ["Circular Saw"],
      servicesOffered: [{ title: "Custom Woodwork" }],
      headline: "Carpenter & Joiner with 5 Years Stated Mastery",
      bio: "Bipul is an experienced carpenter working in Guwahati.",
      city: "Guwahati",
      state: "Assam",
      missingFields: [],
      confidenceScore: 0.8,
      extractionMethod: "deterministic_parser",
    };

    const parsed = onboardingExtractedProfileSchema.safeParse(validProfile);
    assert.equal(parsed.success, true, "Valid profile structure passes Zod schema");
  });

  it("extractSkillsFromTranscript returns faithful profile without hardcoded demo personas", async () => {
    const transcript = "Main solar panels lagata hoon aur commercial wiring karta hoon.";
    const result = await extractSkillsFromTranscript(transcript);

    assert.ok(result.primaryTrade.toLowerCase().includes("electric") || result.primaryTrade.toLowerCase().includes("solar"));
    assert.ok(result.confidenceScore <= 0.90, "Confidence score must be realistic");
    assert.notEqual(result.name, "Rameshwar Sharma", "Must NOT return hardcoded legacy demo persona");
  });
});
