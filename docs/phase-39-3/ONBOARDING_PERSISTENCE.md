# KAAMSETU — PHASE 39.3 ONBOARDING DRAFT PERSISTENCE & FAULT RECOVERY
## Client Storage Synchronization, Modal Reopen Resilience & Zero Data Loss Invariants

**Date:** 17 November 2026  
**Document:** `docs/phase-39-3/ONBOARDING_PERSISTENCE.md`  
**Storage Keys:**  
- `kaamsetu_onboarding_draft` (`localStorage`): Unfinished worker testimony and structured trade profile  
- `kaamsetu_otp_session` (`sessionStorage`): OTP cooldown timer, active challenge recovery, and verification step  

---

## 1. Storage Architecture

Informal sector workers frequently operate on unstable 3G/4G connections or face intermittent interruptions (incoming phone calls, app switching, low battery). KAAMSETU guarantees zero loss of craft attestation data through dual-tier client storage:

```
[User Input: Voice / Text Testimony]
           │
           ▼
[localStorage: "kaamsetu_onboarding_draft"]
  - currentStep: 1 | 2 | 3
  - language: "hi" | "en" | "bn" | "as" | "ta" | "te" | "mr"
  - inputMode: "voice" | "text"
  - transcript: Full spoken worker testimony string
  - extractedProfile: Structured trade, skills, equipment, rates
           │
           ▼ (Approve -> Trigger Auth Modal)
[sessionStorage: "kaamsetu_otp_session"]
  - phone: Normalized phone string
  - step: 1 (phone) | 2 (otp entry)
  - targetTimestamp: Absolute epoch ms for cooldown
  - hasActiveChallenge: boolean
  - sandboxCode: 6-digit test PIN (sandbox only)
```

---

## 2. Fault Recovery Scenarios

| Failure Event | System Behavior | Data Preservation Guarantee |
|---------------|-----------------|-----------------------------|
| **User Enters Invalid Phone (`5456565656`)** | Inline validation prevents submission; button disabled | Draft remains in `localStorage`; no reload required |
| **User Closes Verification Modal** | Modal unmounts; `pendingSubmission` preserved in memory | User can reopen modal anytime; no re-attestation needed |
| **HTTP 503 Database Outage** | Reassuring alert displayed informing user draft is saved | Profile draft intact; user can click "Try Again" when ready |
| **Browser Tab Accidental Refresh** | Page reloads; `useEffect` reads `kaamsetu_onboarding_draft` | Wizard mounts immediately at Step 3 with restored skills |
| **Rate Limit Cooldown Active** | `sessionStorage` tracks `targetTimestamp` | Countdown resumes accurately without resetting or extending |

---

## 3. Post-Minting Clean Storage Transition

When the worker's sovereign credential is successfully minted (`currentStep === 4`):
1. `localStorage.removeItem("kaamsetu_onboarding_draft")` cleans the draft from disk.
2. `sessionStorage.removeItem("kaamsetu_otp_session")` clears the challenge state.
3. The newly minted credential (`IN-AS-2026-XXXX-KS`) is displayed with QR verification and permanent DigiLocker compatibility.
