# KAAMSETU — PHASE 39 WORKER ONBOARDING VERIFICATION REPORT

**Program:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Target:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Constitutional Invariant:** `platform_commission_amount = 0.00` permanently on worker wages  

---

## 1. Onboarding Pipeline Overview

Worker onboarding is the core empowerment engine of KAAMSETU. It transforms an informal artisan's self-declared trade experience into a sovereign, cryptographically attestable digital identity without requiring formal academic credentials.

```
+─────────────────────────────────────────────────────────────────────────────+
|                    Step 1: Trade & Personal Information                     |
|  - Full Name, Primary Trade (e.g. Electrical, Masonry, Handloom Weaving)     |
|  - Experience in Years, Daily Expected Wage (INR)                           |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                       Step 2: Micro-Skills Inventory                        |
|  - Specific domain competencies (e.g., Conduit Wiring, Three-Phase DB)       |
|  - Tools Owned / Equipment Proficiency                                       |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|               Step 3: Controlled Rollout Geographic Bounding                |
|  - Pincode verification against Class B urban clusters:                      |
|      * Guwahati Urban: 781001 – 781039 (Kamrup Metropolitan)                 |
|      * Shillong Urban: 793001 – 793022 (East Khasi Hills)                    |
+─────────────────────────────────────────────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                  Step 4: Voice Attestation & Final Review                   |
|  - Spoken trade affirmation in native language (Assamese / Hindi / English) |
|  - Generation of unique Sovereign Registry ID (e.g., KSTU-AS-2026-XXXX)     |
|  - PostgreSQL direct persistence (`profiles`, `worker_profiles`)            |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Remediation of Profile Persistence Bypass

### Prior Architecture Vulnerability
In previous releases, `src/server/services/onboarding.service.ts` contained a conditional block:
```typescript
if (isConfigured.supabase && !user.isDemo) {
  // Save to database
} else {
  // Return mocked in-memory object
}
```
Because sandbox or simulated users were flagged as `isDemo: true`, database persistence was bypassed. Onboarding data evaporated upon page reload.

### Phase 39 Remediation
The bypass has been completely excised. In `src/server/services/onboarding.service.ts`:
```typescript
// Unconditionally persist to PostgreSQL whenever Supabase is configured
if (isConfigured.supabase) {
  await this.profileRepo.upsertWorkerProfile({
    userId: user.id,
    fullName: draft.fullName,
    primaryTrade: draft.primaryTrade,
    experienceYears: draft.experienceYears,
    dailyRate: draft.dailyRate,
    pincode: draft.pincode,
    city: draft.city,
    state: draft.state,
    skills: draft.skills,
    voiceAttestationUri: draft.voiceAttestationUri,
    status: "active",
  });
}
```

---

## 3. Constitutional Wage Invariant Verification

Throughout the entire onboarding and wage declaration lifecycle, KAAMSETU enforces:
$$\text{platform\_commission\_amount} = 0.00$$

Every daily wage entered by an artisan (e.g., ₹850/day) is preserved without any deduction, platform skimming, or commission fee. The booking and payout repositories verify that:
$$\text{worker\_net\_payable} = \text{gross\_booking\_amount}$$

---

## 4. Controlled Rollout Geographic Bounding

In compliance with operating classification `CLASS_B_CONTROLLED_ROLLOUT`, onboarding strictly enforces pincode boundaries during Step 3:
- **Assam Region:** Kamrup Metropolitan (Guwahati Urban): 781001 through 781039.
- **Meghalaya Region:** East Khasi Hills (Shillong Urban): 793001 through 793022.

Any submission outside these defined zones is cleanly halted with an informative explanation:
> *"KAAMSETU is currently in a controlled rollout operating exclusively in Guwahati Urban and Shillong Urban. We look forward to expanding to your district soon."*
