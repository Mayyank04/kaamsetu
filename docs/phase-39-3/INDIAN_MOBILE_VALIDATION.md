# KAAMSETU — PHASE 39.3 INDIAN MOBILE NUMBER VALIDATION
## Standardized Validation Specification, E.164 Normalization & Client/Server Symmetry

**Date:** 17 November 2026  
**Document:** `docs/phase-39-3/INDIAN_MOBILE_VALIDATION.md`  
**Standard:** Telecom Regulatory Authority of India (TRAI) National Numbering Plan  
**Target Invariant:** Clean 10-digit format starting with `[6-9]`, formatted to E.164 `+91XXXXXXXXXX`  

---

## 1. Specification & Invariants

Under Indian telecommunications numbering conventions managed by TRAI and the Department of Telecommunications (DoT):
- **Carrier Allocated Prefixes:** Mobile service allocation bands strictly use digits `6`, `7`, `8`, and `9`.
- **Restricted/Invalid Prefixes:** Digits `0` (STD trunk prefix), `1` (special emergency/operator services), `2`, `3`, `4`, `5` (fixed-line PSTN / reserve bands) are never valid mobile carrier prefixes.
- **Length Constraint:** Exactly 10 significant digits.
- **Character Invariant:** No alphabetic characters or symbols permitted.

---

## 2. Standardized Rejection Message

When an invalid number is entered (e.g. `5456565656` from the incident screenshot):
> **"Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8 or 9."**

---

## 3. The 10-Number Validation Test Matrix

| # | Test Phone Input | Carrier Prefix | Validation Status | Result / Error Behavior |
|---|------------------|----------------|-------------------|--------------------------|
| 1 | `9876543210` | 9 | **PASS** | Valid; formats to `+919876543210` |
| 2 | `8765432109` | 8 | **PASS** | Valid; formats to `+918765432109` |
| 3 | `7654321098` | 7 | **PASS** | Valid; formats to `+917654321098` |
| 4 | `6543210987` | 6 | **PASS** | Valid; formats to `+916543210987` |
| 5 | `5456565656` | 5 | **FAIL** | *Reproduction Incident:* Rejection message displayed; button disabled; 400 Bad Request on server |
| 6 | `1234567890` | 1 | **FAIL** | Rejection message displayed; button disabled |
| 7 | `0123456789` | 0 | **FAIL** | Rejection message displayed; button disabled |
| 8 | `987654321` | 9 (9 digits) | **FAIL** | Rejection message displayed (incomplete length) |
| 9 | `98765432109` | 9 (11 digits) | **FAIL** | Rejection message displayed (exceeds length) |
| 10 | `98765ABCD0` | Alphanumeric | **FAIL** | Rejection message displayed (invalid characters) |

---

## 4. Normalization Rules

Users often paste numbers in various domestic formats:
1. `+919876543210` -> Strips `+91`, verifies 10 digits `9876543210`, outputs `+919876543210`.
2. `919876543210` -> Strips prefix `91`, verifies 10 digits `9876543210`, outputs `+919876543210`.
3. `09876543210` -> Strips leading `0`, verifies 10 digits `9876543210`, outputs `+919876543210`.
4. `+91 98765 43210` -> Strips whitespace, verifies 10 digits `9876543210`, outputs `+919876543210`.

---

## 5. Architectural Implementation

### 1. Centralized Utility (`src/lib/utilities/phone.ts`)
```typescript
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
export const INVALID_PHONE_MESSAGE =
  "Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8 or 9.";

export function validateIndianMobile(rawPhone: string): NormalizedPhone { ... }
```

### 2. Zod Schema Guard (`src/schemas/auth.schema.ts`)
```typescript
export const phoneAuthSchema = z.object({
  phone: z.string().transform((val) => val.trim()).superRefine((val, ctx) => {
    const res = validateIndianMobile(val);
    if (!res.valid) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_PHONE_MESSAGE });
    }
  }), ...
});
```

### 3. API Early Rejection (`src/app/api/auth/otp/send/route.ts`)
```typescript
const parseResult = phoneAuthSchema.safeParse(json);
if (!parseResult.success) {
  return NextResponse.json(
    {
      success: false,
      code: "INVALID_PHONE",
      challengeCreated: false,
      hasActiveChallenge: false,
      message: issue?.message || INVALID_PHONE_MESSAGE,
    },
    { status: 400 }
  );
}
```
*Zero database or rate-limiter calls are made for invalid phone numbers.*

### 4. Client State Machine Guard (`src/lib/auth/use-otp-flow.ts`)
```typescript
const isPhoneValid = phoneValidation.isValid;
// Button disabled when !isPhoneValid
// requestOtp rejects invalid phone before fetch
```
