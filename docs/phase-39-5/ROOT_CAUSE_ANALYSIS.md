# KAAMSETU — PHASE 39.5 ROOT CAUSE FORENSIC REPORT

**Target:** `http://localhost:3001` & `https://kaamsetu-neon.vercel.app`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00`  
**Operating Area:** Guwahati Urban (`781001–781039`) & Shillong Urban (`793001–793022`)  
**Status:** ROOT CAUSES IDENTIFIED AND REMEDIATED

---

## 1. Master Root-Cause Forensic Table

| Observed Failure | Reproduction Steps | Affected Source Files | Confirmed Root Cause | Implemented Correction | Regression Test |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Blurred Image on Homepage** | Open `http://localhost:3001/` in browser; portrait thumbnail stretches across unconstrained container. | `src/components/identity/professional-card.tsx`, `tailwind.config.ts`, `public/` | Non-standard classes `h-18 w-18` omitted from default Tailwind scale; parent container resolved with 0px width/height causing `<Image fill sizes="72px">` to break out and stretch to card/screen bounds. Missing `public/` directory caused asset fallback issues. | Added `13` and `18` to `theme.extend.spacing` in `tailwind.config.ts`; enforced explicit `min-w-[72px] min-h-[72px]` on portrait container; scaffolded `public/favicon.ico`. | `npm run test:phase39.5` + Next.js 114-route production build. |
| **Gemini Model 404 / NOT_FOUND** | Trigger voice or transcript extraction in onboarding with live key; terminal logs `models/gemini-1.5-flash is not found for API version v1`. | `src/lib/gemini/onboarding-extractor.ts`, `src/lib/gemini/client.ts`, `src/lib/env.ts` | Deprecated hardcoded model identifiers (`gemini-1.5-flash`, `gemini-2.0-flash`) unsupported on Google GenAI SDK v3.3.0 `v1` endpoint in November 2026. Rapid calls trigger 503 high demand spikes. | Added configurable `env.GEMINI_MODEL` (defaulting to verified `gemini-3.8-flash`) and fallback chain (`gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-2.5-flash`); immediate non-retry candidate shift on 404; bounded 750ms backoff on 503/timeout; reliable non-inventing deterministic fallback. | `npm run test:phase39.5` + live extraction integration test. |
| **Fabricated Demo Identity in Fallback** | AI extraction fails or unconfigured; returns hardcoded "Rameshwar Sharma" with fake certifications and inflated 0.96 confidence. | `src/lib/gemini/client.ts`, `src/lib/gemini/onboarding-extractor.ts` | Legacy hackathon demo stub embedded in error catch blocks. | Replaced with authentic parser extracting only spoken trade terms; removed synthetic surnames; enforced honest confidence scores (0.65–0.75). | `test/phase-39-5-gemini-and-homepage.test.ts`. |
| **OTP Consent Modal Deadlock** | Open `/onboarding`, click "Send Verification Code" in modal; returns "Please accept Terms of Service" with no checkbox. | `src/components/onboarding/onboarding-wizard.tsx`, `src/lib/auth/use-otp-flow.ts`, `src/app/api/auth/otp/send/route.ts` | Inline modal rendered zero checkbox controls while client hook and server endpoint enforced mandatory consent. | Added accessible, unchecked-by-default legal consent control with clickable `/terms` and `/privacy` links, synchronized state machine, and server audit logging. | `npm run test:phase39.4` (Section 9). |
| **Port Conflict & Dual Next.js Server** | Port 3000 occupied by separate application (`/Users/mayankgautam/Desktop/nexbus`), forcing Kaamsetu to port 3001. | Environment / Port Assignment | Two concurrent Next.js processes running on macOS. | Verified port 3001 hosting Kaamsetu Next.js 15.5.29 cleanly with isolated environment variables. | Verified `lsof -i :3001` and curl response. |

---

## 2. Invariant Governance Sign-Off

1. **Financial Invariant:** `platform_commission_amount = 0.00` verified permanently.
2. **Geographical Rollout:** `CLASS_B_CONTROLLED_ROLLOUT` restricted to Guwahati Urban (`781001–781039`) and Shillong Urban (`793001–793022`).
3. **Data Protection & Consent:** Explicit affirmative consent recorded with version `2026.1` and purpose `workforce_identity_registration`.
