# KAAMSETU — PHASE 50.1: TRANSLATION PROVIDER STATUS & CAPABILITY REPORT

**Project:** KAAMSETU — India's Skill Identity and Workforce Platform  
**Target Branch:** `phase-50.1-universal-translator-rebuild`  
**Date:** November 24, 2026  
**Auditor:** Translation Systems Architect & DevOps Lead  

---

## 1. Provider Health & Operational Matrix

| Provider Name | Type | Configuration Status | Health Status | Primary Capabilities | Latency SLA |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gemini Neural Engine** | Cloud LLM (`@google/genai`) | `GEMINI_API_KEY` Configured | **`OPERATIONAL`** | 39 Indian languages, deep cultural context, trade terminology | ~1.4s (Flash Lite) |
| **Deterministic Offline Corpus** | In-Memory Lexicon | Embedded in source | **`OPERATIONAL`** | Instant trade glossary, zero network cost, infallible fallback | < 1ms |
| **Google Cloud Translate** | Cloud REST API (v2) | `GOOGLE_TRANSLATE_API_KEY` (Optional) | **`NOT_CONFIGURED`** | Falls back cleanly to Gemini or Deterministic without error | N/A |
| **Azure Translator** | Cognitive Services REST (v3) | `AZURE_TRANSLATOR_KEY` (Optional) | **`NOT_CONFIGURED`** | Falls back cleanly to Gemini or Deterministic without error | N/A |
| **Bhashini / ULCA** | Government of India Models | `BHASHINI_API_KEY` (Optional) | **`NOT_CONFIGURED`** | Falls back cleanly to Gemini or Deterministic without error | N/A |

---

## 2. Multi-Tier Fallback Cascade Architecture

When an end-user or API consumer initiates a translation request:
```
Client Request
      │
      ▼
Check Cryptographic Cache (SHA-256 Key)
      │── [Hit & Not Private] ──► Return Cached Result (< 2ms)
      │
      ▼
Attempt Primary Configured Provider (Gemini Flash Lite)
      │── [Success] ────────────► Return Live Neural Translation
      │
      ▼ (Timeout > 8s / 503 / 429)
Attempt Next Configured Cloud Provider (Google / Azure / Bhashini)
      │── [Unconfigured / Error]
      ▼
Cascade to Deterministic Offline Corpus
      │── [Exact / Partial Match] ──► Return Verified Translation + Translit + Meaning (status: 'fallback_limited')
      │
      ▼ (Total Miss)
Return Original Input + Transparent Limitation Notice (status: 'fallback_limited', confidence: 0.0)
```

---

## 3. Sensitive Data & Privacy Invariants

1. **Entity Protection (`protectEntities`):**
   - Automatically masks Indian phone numbers (`+91 98765 43210`), PIN codes (`781001`), monetary amounts (`₹1500`, `1500 টকা`), registry IDs, URLs, and masked identity tokens (`XXXX-XXXX-1234`).
   - Placeholders (`[[ENTITY_PHONE_0]]`) are preserved intact through neural translation and restored byte-for-byte in the output.
2. **Private Cache Isolation:**
   - Any translation flagged with `isPrivate: true` (such as direct worker-customer booking instructions or private customer enquiries) is **NEVER** stored in memory or distributed caches.
3. **No Audio Retention:**
   - Speech recognition utilizes the client's browser engine directly. No audio recordings are recorded, uploaded, or persisted to platform storage or databases.
