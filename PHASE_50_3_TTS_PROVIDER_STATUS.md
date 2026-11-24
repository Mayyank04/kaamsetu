# KAAMSETU — PHASE 50.3 TTS PROVIDER STATUS & ARCHITECTURE AUDIT

**Project:** KAAMSETU — India's Skill Identity and Workforce Platform  
**Phase:** 50.3 — Translator Experience & Voice Engine Rebuild  
**Endpoint:** `/api/voice/tts`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`

---

## 1. Provider Configuration & Truthful Status Matrix

KAAMSETU enforces a strict constitutional invariant: **Never claim a cloud service is operational or fabricate speech audio when credentials are unconfigured.**

Below is the verified audit of all four speech synthesis providers managed by `TTSProviderService` (`src/lib/voice/tts-provider.ts`):

| Provider | Engine Type | Credentials Required | Current Status | Supported Indian Languages | Operational Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Cloud TTS** | Cloud REST API (`v1/text:synthesize`) | `GOOGLE_CLOUD_TTS_API_KEY` | `NOT_CONFIGURED` (Truthful) | 12 Indian Languages (hi, as, bn, ta, te, mr, gu, pa, kn, ml, ur, en) | Primary Cloud Neural Synthesizer when API key is provisioned. |
| **Azure Cognitive Speech** | Cloud REST API (`cognitiveservices/v1`) | `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION` | `NOT_CONFIGURED` (Truthful) | 12 Indian Languages (hi, as, bn, ta, te, mr, gu, pa, kn, ml, ur, en) | High-fidelity SSML Cloud Neural Synthesizer when keys are provisioned. |
| **Bhashini ULCA TTS** | GoI Open Speech Pipeline (`services/inference/pipeline`) | `BHASHINI_API_KEY`, `BHASHINI_USER_ID` | `NOT_CONFIGURED` (Truthful) | 12 Indian Languages (hi, as, bn, ta, te, mr, gu, pa, kn, ml, ur, en) | Government of India open-source model pipeline when credentials are provided. |
| **Browser SpeechSynthesis** | Web Speech API (`window.speechSynthesis`) | Client-side native | `OPERATIONAL` | All browser-installed Indic locales (`as-IN`, `hi-IN`, `bn-IN`, `ta-IN`, etc.) | High-speed, zero-cost, privacy-preserving offline speech engine with script routing. |

---

## 2. API Route Specification (`/api/voice/tts`)

### 1. GET `/api/voice/tts`
Inspects all speech providers and returns their honest operational readiness:
- **Response HTTP 200:**
  ```json
  {
    "success": true,
    "timestamp": "2026-11-24T07:37:14.969Z",
    "providers": [
      {
        "name": "google_cloud",
        "status": "NOT_CONFIGURED",
        "supportedLanguages": ["hi", "as", "bn", "ta", "te", "mr", "gu", "pa", "kn", "ml", "ur", "en"],
        "message": "GOOGLE_CLOUD_TTS_API_KEY not set. Falling back to local browser synthesis."
      },
      {
        "name": "azure",
        "status": "NOT_CONFIGURED",
        "supportedLanguages": ["hi", "as", "bn", "ta", "te", "mr", "gu", "pa", "kn", "ml", "ur", "en"],
        "message": "AZURE_SPEECH_KEY or AZURE_SPEECH_REGION not set."
      },
      {
        "name": "bhashini",
        "status": "NOT_CONFIGURED",
        "supportedLanguages": ["hi", "as", "bn", "ta", "te", "mr", "gu", "pa", "kn", "ml", "ur", "en"],
        "message": "BHASHINI_API_KEY or BHASHINI_USER_ID not set."
      },
      {
        "name": "browser",
        "status": "OPERATIONAL",
        "supportedLanguages": ["hi", "as", "bn", "ta", "te", "mr", "gu", "pa", "kn", "ml", "ur", "en"],
        "message": "Native Browser SpeechSynthesis active with Indic language routing."
      }
    ]
  }
  ```

### 2. POST `/api/voice/tts`
Synthesizes speech server-side if cloud keys are present; otherwise returns truthful fallback instructions:
- **Request Body:**
  ```json
  {
    "text": "মই গুৱাহাটীত এটা সৰু দৰ্জীৰ দোকান চলাওঁ।",
    "language": "as",
    "speed": 0.75,
    "channel": "original"
  }
  ```
- **Response HTTP 200 (When Cloud Keys Missing):**
  ```json
  {
    "success": true,
    "timestamp": "2026-11-24T07:40:00.000Z",
    "provider": "browser",
    "fallbackToBrowser": true,
    "message": "Cloud TTS not configured or unavailable. Routed to enhanced browser speech synthesis."
  }
  ```
- **Response HTTP 400 (Validation Failure):**
  ```json
  {
    "success": false,
    "error": "Text parameter is required for speech synthesis"
  }
  ```

---

## 3. Client-Side Fallback Resilience
When `/api/voice/tts` returns `fallbackToBrowser: true`, the frontend `PlaybackController` immediately takes over using client-side `window.speechSynthesis`. This guarantees:
1. **Zero Silent Failures:** The user always gets audio playback.
2. **Zero Inappropriate Latency:** Local browser synthesis speaks instantly without waiting for cloud round-trips.
3. **Bandwidth Savings:** Crucial for low-connectivity 2G/3G mobile networks across Northeast India.
