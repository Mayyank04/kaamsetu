# KAAMSETU — PHASE 39.1 ONBOARDING RECOVERY EVIDENCE
## Verification Flow, Draft Isolation, and Sovereign Card Minting

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Component:** `src/components/onboarding/onboarding-wizard.tsx`  
**Deployment:** `https://kaamsetu-neon.vercel.app`  

---

## 1. Onboarding Flow Walkthrough

The artisan onboarding journey consists of four continuous, resilient steps:

1. **Step 1: Language & Voice Mode Selection**
   - User chooses language (Assamese, Hindi, Bengali, English).
   - User chooses input modality (Interactive Voice, Dictation, or Manual Form).

2. **Step 2: Voice Audio Attestation & Extraction**
   - Artisan records their work history in plain conversational language.
   - Example transcript: *"I have been doing carpentry work in Guwahati Urban for 8 years, specializing in modular kitchens and wood polishing."*
   - Real-time AI extraction constructs skills, experience years, and geographic location without requiring formal certificates.

3. **Step 3: Interactive Skills & Wage Review**
   - Artisan reviews structured skills, hourly/daily wages, and trade categories.
   - Clicking "Approve & Save Profile" evaluates authentication status.
   - If unauthenticated, the inline mobile verification modal opens seamlessly without page redirects.

4. **Step 4: Sovereign Cryptographic Credential Minting**
   - Once verified, the profile is unconditionally saved to PostgreSQL.
   - Cryptographic sovereign identity card is minted (`SovereignSuccessCard`).
   - Draft is automatically purged from `localStorage`.

---

## 2. Onboarding Modal Recovery Proof

| State | Previous Failure Mode | Remediated Behavior |
| :--- | :--- | :--- |
| **Phone Submission** | If 429 cooldown occurred, modal showed static red error and remained stuck on Step 1. | If 429 returns with active challenge or sandbox code, modal advances to Step 2 with active challenge pre-loaded. |
| **Countdown Timer** | Text read `Please wait 60 seconds` indefinitely. | Dynamic, ticking clock counts down second-by-second (`Resend code in 47s`). |
| **Resend Action** | User had no way to resend without guessing when cooldown expired. | Button auto-enables at `0s`: "Resend Verification Code". |
| **Sandbox Code** | Hidden from user due to missing `isDemo` property check. | Prominently displayed in high-contrast box with "Auto-fill" and "Copy" actions. |
| **Modal Dismissal** | Closing modal cleared phone state or caused state drift. | `sessionStorage` tracks target timestamp so timer remains synchronized upon reopening. |
| **Draft Safety** | Risk of losing voice transcript and approved skills. | Onboarding draft in `localStorage` is completely decoupled and persists indefinitely. |

---

## 3. Profile Persistence Verification

```sql
SELECT 
    id, 
    phone, 
    full_name, 
    role, 
    phone_verification_status, 
    verification_method, 
    phone_verified,
    account_status
FROM profiles 
WHERE phone = '+919876543210';
```
**Output:**
```
id                        | 3b82194c-e87f-412e-9d21-f09b27814a6e
phone                     | +919876543210
full_name                 | Suresh Boro
role                      | worker
phone_verification_status | sandbox_unverified
verification_method       | sandbox
phone_verified            | false
account_status            | active
```
Profile persists with complete data fidelity, accurate trade details, and zero unearned verification badges.
