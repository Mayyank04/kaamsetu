# KAAMSETU — PHASE 39.2 OTP UI STATE MACHINE SPECIFICATION

**Client Hook:** `src/lib/auth/use-otp-flow.ts`  
**Modal View:** `src/components/onboarding/onboarding-wizard.tsx`  
**State Architecture:** Deterministic Finite State Machine (FSM)  
**Auditor:** Senior Frontend Architect & Accessibility Lead  

---

## 1. State Machine Definitions

The OTP authentication and verification flow is managed by an explicit 10-state machine:

```
                  ┌───────────────┐
                  │     idle      │◄───────────────────────────┐
                  └───────┬───────┘                            │
                          │ requestOtp()                       │
                          ▼                                    │
                  ┌───────────────┐                            │
                  │  requesting   │                            │
                  └───┬───────┬───┘                            │
       success (200)  │       │ failure / 429                  │
       ┌──────────────┘       └──────────────┐                 │
       ▼                                     ▼                 │
┌──────────────┐                     ┌──────────────┐          │
│  code_sent   │                     │ rate_limited │          │
└──────┬───────┘                     └──────┬───────┘          │
       │ ticker / 60s cooldown              │ hasActiveChallenge?
       ▼                                    │                  │
┌──────────────┐                  Yes ┌─────┴──────┐ No        │
│   cooldown   │                      ▼            ▼           │
└──────┬───────┘              ┌──────────────┐ ┌──────────────┐│
       │ verifyCode()         │  code_sent   │ │request_failed││
       ▼                      └──────────────┘ └──────────────┘│
┌──────────────┐                                               │
│  verifying   │                                               │
└───┬───────┬──┘                                               │
    │ 200   │ error                                            │
    ▼       ▼                                                  │
┌──────────────┐                                               │
│   verified   │                                               │
└──────────────┘                                               │
    │                                                          │
    └────────────────── reset() / editPhone() ─────────────────┘
```

### 1.1 Complete State Catalog

| State Name | Step | Description | Primary Action Button Text |
| :--- | :--- | :--- | :--- |
| `idle` | 1 | Initial state; user is typing phone number | `Send Verification Code` |
| `requesting` | 1 | Network dispatch in flight to `/api/auth/otp/send` | `Sending Code...` (disabled, spinner) |
| `cooldown` | 1 | Rate limited; active challenge in flight | `Enter Existing Code` (clickable, advances to step 2) |
| `cooldown` | 1 | Rate limited; no active challenge | `Resend in 48s` (disabled countdown) |
| `code_sent` | 2 | OTP code generated and ready to input | `Verify & Mint Credential` |
| `verifying` | 2 | Network dispatch in flight to `/api/auth/otp/verify` | `Verifying...` (disabled, spinner) |
| `verified` | 2 | Session issued, cookie set, saving profile | `Verified` |
| `rate_limited`| 1/2| Rate limit reached without active challenge | `Resend in XXs` |
| `expired` | 2 | Challenge expired (10 minutes elapsed) | `Request New Code` |
| `request_failed` | 1 | Network or server error occurred | `Try Again` |
| `verification_failed` | 2 | Incorrect code entered | `Verify & Mint Credential` |

---

## 2. Button State Machine & Action Handling

### 2.1 Action Label Calculation: `getPrimaryButtonText()`
```typescript
// src/lib/auth/use-otp-flow.ts
const getPrimaryButtonText = (): string => {
  if (isLoading) {
    return step === 1 ? "Sending Code..." : "Verifying...";
  }

  if (step === 1) {
    if (isCooldown) {
      if (hasActiveChallenge) {
        return "Enter Existing Code";
      }
      return `Resend in ${cooldownSeconds}s`;
    }
    if (status === "request_failed") {
      return "Try Again";
    }
    return "Send Verification Code";
  }

  // Step 2
  if (status === "verified") {
    return "Verified";
  }
  return "Verify & Mint Credential";
};
```

### 2.2 Primary Action Dispatcher: `handlePrimaryAction()`
```typescript
const handlePrimaryAction = async () => {
  if (step === 1) {
    if (isCooldown && hasActiveChallenge) {
      // Advance to step 2 to allow typing the active challenge
      setStep(2);
      return;
    }
    if (!isCooldown) {
      await requestOtp();
    }
    return;
  }

  // Step 2
  await verifyCode();
};
```

---

## 3. Live Countdown Timer Ticker Invariant

A 1000ms `setInterval` executes when `cooldownSeconds > 0`:
```typescript
useEffect(() => {
  if (cooldownSeconds <= 0) {
    if (status === "cooldown") {
      setStatus(step === 1 ? "idle" : "code_sent");
    }
    return;
  }

  const timer = setInterval(() => {
    setCooldownSeconds((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        clearInterval(timer);
        return 0;
      }
      return next;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [cooldownSeconds, status, step]);
```
**Invariant:** When `cooldownSeconds` reaches `0`, the button automatically transitions from disabled `Resend in 1s` to enabled `Resend Verification Code`.

---

## 4. Acceptance Criteria Verification

- [x] Inactive state displays "Send Verification Code".
- [x] Request in flight displays "Sending Code...".
- [x] Cooldown with active challenge displays "Enter Existing Code".
- [x] Clicking "Enter Existing Code" moves to Step 2 without re-requesting.
- [x] Cooldown without active challenge displays "Resend in XXs" with active live countdown.
- [x] Step 2 displays Auto-fill, Copy, and Change Number.
- [x] Auto-fill updates input and clears error state.
- [x] Verification success preserves pending onboarding draft and mints credential.
