# ONBOARDING & PROFILE PERSISTENCE ARCHITECTURE

**Document ID:** `KAAMSETU-DOC-39-6-05`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`

---

## 1. 4-Step Sovereign Onboarding Wizard Flow

The worker onboarding lifecycle follows a progressive, trust-building sequence:

1. **Step 1: Language & Input Mode Selection**
   - Supports 7 vernacular Indian languages: Hindi (`hi`), Bengali (`bn`), Marathi (`mr`), Tamil (`ta`), Telugu (`te`), Assamese (`as`), and English (`en`).
   - Choice of Voice Audio Attestation or Vernacular Text Input.
2. **Step 2: Craft Testimony Recording & AI Skill Extraction**
   - Direct audio recording or multi-paragraph text entry.
   - Dispatches payload to `/api/worker/onboarding/extract` for structured trade analysis.
3. **Step 3: Skill Verification & Inline Phone Attestation**
   - Artisan reviews extracted trade, skills, equipment, and indicative rate.
   - Missing fields are surfaced with high priority.
   - If artisan is unauthenticated, clicking "Approve" triggers the inline verification modal.
   - Upon valid OTP entry, account creation/login and profile persistence execute automatically.
4. **Step 4: Sovereign Credential Issuance**
   - Displays official cryptographic sovereign identity card (`SovereignSuccessCard`).
   - Generates scannable verification QR code linking to `/verify/[registryId]`.

---

## 2. Session Resumption & Local Storage Safeguards

- **Draft State Key:** `kaamsetu_onboarding_draft`.
- Preserves `currentStep`, `language`, `inputMode`, `transcript`, and `extractedProfile`.
- If a user accidentally refreshes or navigates away before completing Step 4, the session is seamlessly restored on return with a visible resumption notice.
- Upon successful credential issuance in Step 4, the draft key is automatically cleared to ensure clean state.
