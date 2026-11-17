# KAAMSETU — PHASE 39.3 SANDBOX OTP SECURITY & CRYPTOGRAPHIC INVARIANTS
## SECURE TELECOM ISOLATION, SINGLE-USE CHALLENGES & UNVERIFIED IDENTITY ENFORCEMENT

**Operating Mode:** Sandbox Authentication (`AUTH_VERIFICATION_MODE = "sandbox"`)  
**Component:** `src/lib/auth/otp-service.ts` & `src/app/api/auth/otp/`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban: 781001–781039, Shillong Urban: 793001–793022)  
**Constitutional Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Verification Date:** 17 November 2026  

---

## 1. Six Immutable Sandbox Security Invariants

| # | Invariant | Enforcement Mechanism | Verification |
| :---: | :--- | :--- | :--- |
| **1** | **Zero Real Telecom Dispatches** | No external SMS gateways (e.g. Twilio, MSG91) are called when `AUTH_VERIFICATION_MODE === "sandbox"`. | Verified: no external HTTP egress during OTP generation |
| **2** | **No Hardcoded Universal Backdoors** | Sandbox OTPs are generated using `crypto.randomInt(100000, 1000000)`. Predictable values like `'123456'` or `'000000'` are rejected unless randomly generated. | Verified in `test:incident-repair` Test 10 |
| **3** | **Single-Use Anti-Replay Guarantee** | OTPs are consumed atomically upon first verification (`consumed_at = now()`). Subsequent attempts with the same code fail immediately. | Verified in `test:incident-repair` Test 11 |
| **4** | **Unverified Phone Ownership Tagging** | Sessions created under sandbox mode explicitly record `phoneVerificationStatus: "unverified_sandbox"`. They cannot claim high-tier verification badges without real telecom verification. | Verified in `test:incident-repair` Test 13 |
| **5** | **Automatic Challenge Invalidation on Re-request** | Requesting a new code marks prior challenges for that phone number as superseded or consumed. | Verified in challenge query ordering |
| **6** | **Brute-Force Lockout** | 5 consecutive invalid code submissions lock out the verification challenge, preventing dictionary and enumeration attacks. | Verified in `test:incident-repair` Test 12 |

---

## 2. Phone Number Validation & Normalization Matrix

To eliminate false cooldowns and prevent garbage input from consuming rate-limiter resources, input is validated and normalized prior to any database or rate-limiter invocation.

### Validation Regex
Indian mobile numbers are validated strictly against the Telecom Regulatory Authority of India (TRAI) numbering plan:
```typescript
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
```

### 10-Number Validation Matrix
| Input Number | Classification | Expected Result | Reason |
| :--- | :--- | :---: | :--- |
| `9876543210` | Starts with 9 | **VALID** | Standard Indian mobile series |
| `8765432109` | Starts with 8 | **VALID** | Standard Indian mobile series |
| `7654321098` | Starts with 7 | **VALID** | Standard Indian mobile series |
| `6543210987` | Starts with 6 | **VALID** | Standard Indian mobile series (Reliance Jio / Airtel) |
| `5456565656` | Starts with 5 | **INVALID** | Invalid prefix (reproduction test case) |
| `1234567890` | Starts with 1 | **INVALID** | Non-telecom prefix |
| `0123456789` | Starts with 0 | **INVALID** | Landline / trunk dial prefix |
| `987654321` | 9 digits | **INVALID** | Insufficient length |
| `98765432109` | 11 digits | **INVALID** | Excessive length |
| `98765ABCD0` | Alphanumeric | **INVALID** | Non-digit characters |

### Normalization Logic
Prefixes such as `+91`, `91`, leading zeros, spaces, and hyphens are stripped prior to regex evaluation:
```typescript
export function normalizeIndianPhone(input: string): string {
  let cleaned = input.replace(/[\s\-\(\)\.]/g, "");
  if (cleaned.startsWith("+91")) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith("91") && cleaned.length === 12) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith("0") && cleaned.length === 11) cleaned = cleaned.slice(1);
  return cleaned;
}
```

---

## 3. Cryptographic Token & Dual-Secret Rotation

Upon successful verification, the API issues an HMAC-SHA256 session token containing the worker's verified or unverified metadata:

```typescript
export function issueSessionToken(payload: SessionPayload): string {
  const secret = getRateLimitHmacSecret();
  const serialized = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", secret).update(serialized).digest("base64url");
  return `${Buffer.from(serialized).toString("base64url")}.${signature}`;
}
```

### Zero-Downtime Key Rotation
To prevent mass user logout during production key rotation, `verifySessionToken` verifies signatures against both the active secret (`RATE_LIMIT_HMAC_SECRET`) and the previous secret (`RATE_LIMIT_HMAC_SECRET_PREVIOUS`):
```typescript
export function verifySessionToken(token: string): SessionPayload | null {
  const [dataPart, sigPart] = token.split(".");
  // 1. Verify against active key
  if (crypto.timingSafeEqual(Buffer.from(sigPart), Buffer.from(activeSig))) return payload;
  
  // 2. Fallback verify against previous key (if configured)
  if (previousSecret && crypto.timingSafeEqual(Buffer.from(sigPart), Buffer.from(prevSig))) return payload;

  return null;
}
```
Verified in `test:phase39.3` Section 9.
