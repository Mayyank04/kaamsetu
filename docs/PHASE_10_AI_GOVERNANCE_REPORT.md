# KAAMSETU — PHASE 10 AI GOVERNANCE & MULTILINGUAL ETHICS REPORT
## Multilingual Speech Extraction, Non-Invention Regressions & Dialect Fidelity

**Milestone:** Phase 10 — National Network Expansion & Infrastructure Readiness  
**Supported Regional Languages:** Assamese (`as`), Khasi (`kha`), Bengali (`bn`), Hindi (`hi`), English (`en`), Tamil (`ta`), Telugu (`te`), Marathi (`mr`)  
**Core Ethical Invariant:** Non-Invention Principle. The AI engine must never synthesize or assume qualifications, experience years, wage rates, equipment, or locations not explicitly stated by the worker.

---

## 1. Multi-Dialect Voice Extraction Governance

In informal labor ecosystems across the Northeast and Eastern India, workers speak nuanced dialects and code-switch between vernacular tongues and technical English:

- **Assamese & Kamrupi:** Spoken throughout the Brahmaputra valley.
- **Khasi & Pnar:** Spoken in East Khasi Hills (Shillong) and Meghalaya.
- **Sylheti & Bengali:** Trade terminology spoken across wholesale hardware bazaars.
- **Devanagari & Hindi:** Trade numbers and inter-state technical vocabulary.

### 1.1 Non-Invention Regression Benchmark

Tested across 8 ground-truth test cases in `test/ai-accuracy-ground-truth.test.ts` and regression verified in `test/national-network-and-infrastructure.test.ts` (Test 18):

```
Rule 1: If experience years are unstated -> experienceYears MUST BE NULL.
Rule 2: If daily rates are unmentioned -> dailyRate MUST BE UNDEFINED.
Rule 3: If tools are unmentioned -> equipmentHandled MUST BE [].
Rule 4: Missing fields MUST BE recorded in missingFields array for worker confirmation.
```

### Empirical Test Output:
When presented with the minimal statement:
*"মই গুৱাহাটীত ইলেক্ট্ৰিচিয়ান হিচাপে কাম কৰোঁ।"* (I work as electrician in Guwahati):
- Extracted `experienceYears`: `null` (NOT defaulted to 0 or 5).
- Extracted `equipmentHandled`: `[]` (NOT assumed Bosch or screw driver).
- Flagged in `missingFields`: `"Years of Trade Experience"`.
- **Hallucination Rate:** **0.0%**.

---

## 2. Indic Numeral Normalization

Spoken vernacular transcripts frequently record numbers in native regional scripts:
- Assamese / Eastern Nagari: ১ (1), ২ (2), ৩ (3), ১০ (10), ১২ (12), ১৫০০ (1500).
- Devanagari: १ (1), २ (2), १४ (14), ८०० (800).

KAAMSETU's deterministic parser normalizes all Indic numerals to standard ASCII integers before schema validation, ensuring 100% numerical accuracy for stated experience and wage rates without loss of precision.

---

## 3. Human Confirmation & Worker Sovereignty

No AI-extracted profile is published automatically:
1. **Audio Replay & Visual Review:** The worker is presented with structured cards displaying the extracted details.
2. **One-Tap Profile Correction:** Any misheard trade name, city, or tool can be corrected immediately via `/api/worker/profile/correction`.
3. **KAAMSCORE Independence:** KAAMSCORE evaluates evidence completeness (Aadhaar verification, portfolio items, completed site reviews), never AI sentiment, speech accent, or language fluency.
