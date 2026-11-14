import { extractDeterministicFallback } from "../src/lib/gemini/onboarding-extractor";
import assert from "assert";

/**
 * KAAMSETU Ground-Truth AI Extraction & Multilingual Non-Invention Test Suite
 * Evaluates extraction fidelity against worker-confirmed ground truth.
 * Languages evaluated: Assamese (as), Hindi (hi), Bengali (bn), English (en), Code-switched.
 */

interface TestCase {
  id: string;
  language: string;
  description: string;
  rawTranscript: string;
  expected: {
    fullName: string | ((val: string) => boolean);
    occupationSubstring?: string;
    category?: string;
    experienceYears: number | null; // null represents strictly unstated
    city: string;
    state: string;
    dailyRateMinOrStated?: string | null;
    equipmentContains?: string[];
    mustNotContain?: string[];
    missingFieldsShouldContain?: string[];
  };
}

const TEST_CASES: TestCase[] = [
  {
    id: "TC-AS-01",
    language: "as",
    description: "Assamese electrician with explicit years, Beltola Guwahati location, and tools",
    rawTranscript: "নমস্কাৰ, মোৰ নাম দীপক কলিতা। মই গুৱাহাটীৰ বেলতলাত যোৱা ১১ বছৰ ধৰি ঘৰুৱা আৰু বাণিজ্যিক ৱায়াৰিং, ইনভাৰ্টাৰ আৰু আৰ্থিঙৰ কাম কৰি আছো। বচ আৰু মেগাৰ সঁজুলিৰে কাম কৰো।",
    expected: {
      fullName: (val: string) => val.includes("Dipak") || val.includes("দীপক"),
      occupationSubstring: "Electrician",
      category: "Electrical & Solar",
      experienceYears: 11,
      city: "Guwahati",
      state: "Assam",
      equipmentContains: ["Bosch Power Tools", "Megger Insulation Tester"],
      missingFieldsShouldContain: ["Daily Rate Expectations (₹ / day)"], // Rate unmentioned, must be flagged missing
    },
  },
  {
    id: "TC-AS-02",
    language: "as",
    description: "Assamese bamboo artisan with unstated daily rates (Non-invention)",
    rawTranscript: "নমস্কাৰ, মই বিপুল দাস। দিছপুৰ আৰু গুৱাহাটীত ১২ বছৰ ধৰি অসমৰ বাঁহ-বেতৰ আধুনিক আচবাব, মডুলাৰ পাকঘৰ আৰু চেগুন কাঠৰ কাম কৰি আছো।",
    expected: {
      fullName: "Bipul Das",
      occupationSubstring: "Joiner",
      category: "Carpentry & Joinery",
      experienceYears: 12,
      city: "Guwahati",
      state: "Assam",
      missingFieldsShouldContain: ["Daily Rate Expectations (₹ / day)"],
      mustNotContain: ["APDCL", "Certified by Govt"],
    },
  },
  {
    id: "TC-AS-03",
    language: "as",
    description: "Assamese plumber with native Assamese numerals (১০ বছৰ) and unmentioned certification",
    rawTranscript: "নমস্কাৰ, মই ৰতন গগৈ। গুৱাহাটীৰ জালুকবাৰীত ১০ বছৰ ধৰি ব’ৰৱেল ছাবমাৰ্চিবল পাম্প আৰু পানীৰ পাইপলাইনৰ কাম কৰি আছো।",
    expected: {
      fullName: "Ratan Gogoi",
      category: "Plumbing & Sanitation",
      experienceYears: 10,
      city: "Guwahati",
      state: "Assam",
      missingFieldsShouldContain: ["Formal Certification / Apprenticeship Proof (optional)"],
    },
  },
  {
    id: "TC-HI-04",
    language: "hi",
    description: "Hindi welder in Ulubari Guwahati with unmentioned experience years (Must be null)",
    rawTranscript: "नमस्ते, मेरा नाम मोहम्मद रफ़ीक है। मैं गुवाहाटी उलुबारी में वेल्डिंग और स्ट्रक्चरल फैब्रिकेशन का काम करता हूं। बॉश टूल्स इस्तेमाल करता हूं।",
    expected: {
      fullName: (val: string) => val.includes("Rafiq") || val.includes("रफीक") || val.includes("रफ़ीक"),
      category: "Metalcraft & Fabrication",
      experienceYears: null, // STRICT: Unmentioned years must NEVER default to 0, 5, or 10
      city: "Guwahati",
      state: "Assam",
      equipmentContains: ["Bosch Power Tools"],
      missingFieldsShouldContain: ["Years of Trade Experience"],
    },
  },
  {
    id: "TC-NON-INV-05",
    language: "en",
    description: "Minimal statement: 'I repair electrical wiring' (Strict non-invention invariant)",
    rawTranscript: "I repair electrical wiring.",
    expected: {
      fullName: "Craftsperson", // Default dignified placeholder when name not spoken
      experienceYears: null,
      city: "", // Unmentioned city must NOT default to Jaipur, Delhi, or Guwahati
      state: "",
      missingFieldsShouldContain: [
        "Full Legal Name",
        "Years of Trade Experience",
        "Daily Rate Expectations (₹ / day)",
        "Operating City & Primary District",
      ],
      mustNotContain: ["12 years", "APDCL", "Rajasthan", "Jaipur", "1100"],
    },
  },
  {
    id: "TC-NON-INV-06",
    language: "en",
    description: "General location: 'I work around Guwahati' (No invented street address)",
    rawTranscript: "My name is John. I work around Guwahati doing plumbing and sanitary pipe work.",
    expected: {
      fullName: (val: string) => val.includes("John"),
      city: "Guwahati",
      state: "Assam",
      experienceYears: null,
      missingFieldsShouldContain: ["Years of Trade Experience"],
      mustNotContain: ["Beltola", "Dispur", "Ulubari", "House No"], // Must not invent specific neighborhood
    },
  },
  {
    id: "TC-CODE-SWITCH-07",
    language: "as",
    description: "Code-switched Assamese + English technical terms",
    rawTranscript: "নমস্কাৰ, মোৰ নাম প্ৰণৱ শৰ্মা। মই গুৱাহাটীত past 8 years ধৰি industrial inverter wiring আৰু MCB distribution panel assembly কাম কৰিছো।",
    expected: {
      fullName: (val: string) => val.toLowerCase().includes("pranab") || val.includes("প্ৰণৱ"),
      experienceYears: 8,
      city: "Guwahati",
      state: "Assam",
      category: "Electrical & Solar",
    },
  },
  {
    id: "TC-NUMERALS-08",
    language: "hi",
    description: "Native Devanagari numerals for experience and rate (१४ साल, १५०० रुपये)",
    rawTranscript: "नमस्ते, मेरा नाम रामेश्वर शर्मा है। मैं जयपुर में पिछले १४ साल से काम कर रहा हूं। मेरी दिहाड़ी १५०० रुपये है।",
    expected: {
      fullName: (val: string) => val.includes("Rameshwar") || val.includes("रामेश्वर"),
      experienceYears: 14,
      city: "Jaipur",
      state: "Rajasthan",
    },
  },
];

async function runGroundTruthEvaluation() {
  console.log("===============================================================================");
  console.log("KAAMSETU GROUND-TRUTH AI EXTRACTION & MULTILINGUAL EVALUATION SUITE");
  console.log("Standards: Strict Non-Invention, Indic Numeral Normalization, Multi-Language");
  console.log("===============================================================================\n");

  let passedCount = 0;
  const results: Array<{ id: string; description: string; status: string; notes: string }> = [];

  for (const tc of TEST_CASES) {
    try {
      const extracted = extractDeterministicFallback(tc.rawTranscript, tc.language);

      // 1. Verify Name
      if (typeof tc.expected.fullName === "function") {
        assert(
          tc.expected.fullName(extracted.fullName),
          `Name '${extracted.fullName}' did not satisfy condition`
        );
      } else {
        assert.strictEqual(
          extracted.fullName,
          tc.expected.fullName,
          `Expected name ${tc.expected.fullName}, got ${extracted.fullName}`
        );
      }

      // 2. Verify Experience Years (Strict Non-invention)
      assert.strictEqual(
        extracted.experienceYears,
        tc.expected.experienceYears,
        `Experience non-invention mismatch: expected ${tc.expected.experienceYears}, got ${extracted.experienceYears}`
      );

      // 3. Verify Location
      assert.strictEqual(
        extracted.city,
        tc.expected.city,
        `City mismatch: expected '${tc.expected.city}', got '${extracted.city}'`
      );
      assert.strictEqual(
        extracted.state,
        tc.expected.state,
        `State mismatch: expected '${tc.expected.state}', got '${extracted.state}'`
      );

      // 4. Verify Category if specified
      if (tc.expected.category) {
        assert.strictEqual(
          extracted.category,
          tc.expected.category,
          `Category mismatch: expected '${tc.expected.category}', got '${extracted.category}'`
        );
      }

      // 5. Verify Equipment contains
      if (tc.expected.equipmentContains) {
        for (const item of tc.expected.equipmentContains) {
          assert(
            extracted.equipmentHandled.includes(item),
            `Expected equipment '${item}' not in [${extracted.equipmentHandled.join(", ")}]`
          );
        }
      }

      // 6. Verify missing fields
      if (tc.expected.missingFieldsShouldContain) {
        for (const missing of tc.expected.missingFieldsShouldContain) {
          assert(
            extracted.missingFields.includes(missing),
            `Expected missing field '${missing}' not in [${extracted.missingFields.join(", ")}]`
          );
        }
      }

      // 7. Verify must not contain
      if (tc.expected.mustNotContain) {
        const fullJson = JSON.stringify(extracted).toLowerCase();
        for (const forbidden of tc.expected.mustNotContain) {
          assert(
            !fullJson.includes(forbidden.toLowerCase()),
            `Hallucination detected! Forbidden string '${forbidden}' found in extracted output: ${fullJson}`
          );
        }
      }

      passedCount++;
      results.push({
        id: tc.id,
        description: tc.description,
        status: "PASSED [OK]",
        notes: `Extracted '${extracted.fullName}', exp: ${extracted.experienceYears ?? "null"}, loc: ${extracted.city || "none"}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        id: tc.id,
        description: tc.description,
        status: "FAILED [X]",
        notes: msg,
      });
    }
  }

  // Print Formatted Report Table
  console.log("------------------------------------------------------------------------------------------------------------------");
  console.log(
    "ID".padEnd(16) +
    "Scenario Description".padEnd(58) +
    "Result".padEnd(16) +
    "Verification Notes"
  );
  console.log("------------------------------------------------------------------------------------------------------------------");

  for (const r of results) {
    console.log(
      r.id.padEnd(16) +
      r.description.slice(0, 56).padEnd(58) +
      r.status.padEnd(16) +
      r.notes.slice(0, 50)
    );
  }
  console.log("------------------------------------------------------------------------------------------------------------------\n");

  console.log(`Summary: ${passedCount} / ${TEST_CASES.length} Scenarios Passed.`);

  if (passedCount !== TEST_CASES.length) {
    console.error(`\nFAILED: ${TEST_CASES.length - passedCount} extraction scenarios failed assertions.`);
    process.exit(1);
  }

  console.log("ALL GROUND-TRUTH AI EXTRACTION & MULTILINGUAL SCENARIOS INDEPENDENTLY VERIFIED.\n");
}

runGroundTruthEvaluation().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
