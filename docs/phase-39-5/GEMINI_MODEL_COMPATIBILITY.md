# KAAMSETU — PHASE 39.5 GEMINI MODEL COMPATIBILITY & RECOVERY SPECIFICATION

**SDK Version:** `@google/genai` v3.3.0  
**Affected Service:** Voice & Transcript Onboarding Extraction (`src/lib/gemini/`)  
**Status:** VERIFIED LOCALLY & VERIFIED AGAINST REMOTE SERVICE

---

## 1. Problem Description & Forensic Finding

The live terminal output logged:
```
models/gemini-1.5-flash is not found for API version v1, or is not supported for generateContent.
Call ModelService.ListModels to see the list of available models and their supported methods.
```

### Root Cause
1. On the Google GenAI v1 API endpoint in November 2026, legacy model identifiers `gemini-1.5-flash` and `gemini-2.0-flash` were deprecated and returned HTTP 404 / `NOT_FOUND`.
2. Inspecting `ai.models.list()` revealed supported models:
   - `gemini-3.8-flash`
   - `gemini-3.5-flash`
   - `gemini-2.5-flash`
3. Under rapid or high-demand conditions, Gemini API endpoints return transient HTTP 503 (`UNAVAILABLE: This model is currently experiencing high demand`).
4. The previous code had a hardcoded two-step fallback (`gemini-2.0-flash` -> `gemini-1.5-flash`) that both failed with 404.
5. In `src/lib/gemini/client.ts`, fallback returned a hardcoded synthetic persona ("Rameshwar Sharma"), violating DPDP and non-invention rules.

---

## 2. Technical Remediation

### 2.1 Configurable Model with Progressive Fallback Chain
In `src/lib/gemini/onboarding-extractor.ts`:
```typescript
export function getGeminiModelCandidates(): string[] {
  const configured = env.GEMINI_MODEL || process.env.GEMINI_MODEL;
  const candidates = [
    configured,
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ].filter(Boolean) as string[];
  return Array.from(new Set(candidates));
}
```

### 2.2 Circuit Breaker & Error Discrimination
- **HTTP 404 (Model Not Found):** Immediately advances to next candidate model without retrying.
- **HTTP 400 / 401 / 403 (Client / Auth Error):** Aborts live model calls to prevent waste.
- **HTTP 429 / 503 / Timeout:** 8-second execution timeout via `Promise.race`; applies bounded 1-retry with 750ms backoff before candidate shift.
- **Zod Schema Validation:** Strictly parses output with `onboardingExtractedProfileSchema`.

### 2.3 Elimination of Fabricated Data in Fallback
- Completely eliminated hardcoded "Rameshwar Sharma" profiles.
- If live AI calls fail, `extractDeterministicFallback` parses actual spoken tokens from the worker's testimony.
- If only a single name is mentioned, does not inject fabricated surnames; flags `missingFields`.
- Sets `extractionMethod: "deterministic_parser"` and honest confidence score (0.65–0.75).
