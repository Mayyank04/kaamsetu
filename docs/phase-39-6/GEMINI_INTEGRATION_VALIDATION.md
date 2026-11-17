# GEMINI INTEGRATION & RESILIENCE VALIDATION

**Document ID:** `KAAMSETU-DOC-39-6-06`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`

---

## 1. Upstream Incident Context

Earlier phases suffered from two runtime failures with Google Gemini:
1. **HTTP 404 (`NOT_FOUND`):** The model string `models/gemini-1.5-flash` was rejected on v1 API endpoints.
2. **HTTP 503 (`UNAVAILABLE`):** Live demand spikes on Gemini endpoints threw unhandled errors, crashing onboarding extractions.

---

## 2. Multi-Candidate Model Fallback Chain

`src/lib/gemini/onboarding-extractor.ts` implements a dynamic candidate chain:

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

---

## 3. Circuit Breaker & Error Handling

- **8-Second Circuit Breaker:** Each generation attempt is bound by `generateWithTimeout(ai, model, prompt, 8000)`. If the request exceeds 8 seconds, it rejects cleanly without hanging the client.
- **Fail-Fast on HTTP 404:** Non-existent model versions fail immediately to the next candidate model in the chain.
- **Single-Retry on HTTP 503:** If a model returns 503 (`UNAVAILABLE`), the system performs exactly 1 retry after a 750ms backoff before stepping to the next candidate.
- **Zero-Hallucination Fallback:** When all live API candidates fail or when `GEMINI_API_KEY` is not present, the system engages `extractDeterministicFallback()`. This parser extracts authentic trades, experience, tools, and rates directly from the worker's words without inventing surnames or fabricating fictional profiles.
