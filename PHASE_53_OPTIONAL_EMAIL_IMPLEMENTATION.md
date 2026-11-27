# KAAMSETU — PHASE 53: OPTIONAL EMAIL IMPLEMENTATION REPORT

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Economic Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Date:** 2026-11-27  
**Module:** User Experience, Optional Email Handling & Credential Architecture  
**Target Branch:** `phase-53-secure-phone-verification-and-optional-email`  

---

## 1. User Experience & Preserved Design

The signup page UI (`src/app/auth/register/page.tsx` and `/signup`) strictly preserves the established design system tokens and visual hierarchy:
- **Canvas & Primary Colors:** Warm Ivory (`#F7F5F0`), Deep Forest Green (`#153E35`), Warm Sand (`#E8C999`), Deep Charcoal (`#171D1A`).
- **Layout & Spacing:** Centered single-column card with 1px hairline border (`border-forest/15`), tactile role selector grid (5 roles: Artisan/Worker, Local Vendor, Contractor, Customer, Institution).
- **Optional Email Field:**
  - **Label:** `Email address (optional)`
  - **Placeholder:** `ramesh@gmail.com`
  - **Helper Copy:** `Add your email for account recovery and important updates. You can skip this.`
  - **Field Behavior:** Positioned directly beneath the mandatory Mobile Number input.

---

## 2. Schema Validation Rules (`src/schemas/auth.schema.ts`)

In `directRegistrationSchema`:
```typescript
email: z
  .string()
  .trim()
  .toLowerCase()
  .optional()
  .nullable()
  .transform((val) => (val && val.length > 0 ? val : null))
  .refine(
    (val) => val === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: "Please enter a valid email address, or leave this blank." }
  )
```

### Key Behaviors:
1. **Omitted / Empty String:** `""`, `null`, `undefined`, or whitespace-only inputs are transformed into `null`. Validation succeeds with zero errors.
2. **Standard & Gmail Support:** Supports `@gmail.com`, institutional domains, and custom company domains.
3. **Whitespace Trimming:** Leading and trailing whitespace is stripped before validation or persistence.
4. **Invalid Syntax Rejection:** Malformed strings (e.g. `"not-an-email"`, `"missing@domain"`) fail closed with HTTP 400 `VALIDATION_ERROR`.

---

## 3. Storage, Verification Honesty & Credential Architecture

When an account is created via `POST /api/auth/register`:

### 3.1 Case A: Email Omitted (`email: null`)
- **Profile Record:** `public.profiles.email` is stored as `NULL`; `public.profiles.email_verified` is set to `FALSE`.
- **Supabase Auth Credential Anchor:** Supabase Auth requires an internal email identifier for password-based logins (`signInWithPassword`). The system binds the user to a deterministic synthetic handle:
  $$\text{phone.<sha256(canonical\_e164)[0:16]>@phone.kaamsetu.internal}$$
  with `email_confirm: true` applied **only** to this internal non-routable handle.
- **Login Behavior:** The user logs in seamlessly using their verified mobile number and password.

### 3.2 Case B: Valid Email Provided (`email: "user@example.com"`)
- **Duplicate Check:** Queries `public.profiles.email`. If already in use, registration returns HTTP 409 `ACCOUNT_ALREADY_EXISTS`.
- **Profile Record:** Stored in `public.profiles.email` in lowercase; `public.profiles.email_verified` is set to `FALSE`.
- **Verification Honesty:** KAAMSETU **never** marks an unverified email as verified. It does **not** make fake claims that a verification email was sent unless a configured transactional provider confirms dispatch.
- **Login Behavior:** The user can log in using either:
  1. Their verified mobile number.
  2. Their optional email address (`src/app/api/auth/login/route.ts` resolves the profile by email, retrieves the credential handle, and validates the password).

---

## 4. Test Verification Summary

| Test Case | Description | Result |
| :--- | :--- | :--- |
| **Test 3.2** | Registration succeeds with empty email; sets `email: null`, `emailVerified: false`, and allows phone login | **PASS** |
| **Test 3.3** | Registration with valid Gmail trims whitespace and persists with `emailVerified: false` | **PASS** |
| **Test 3.4** | Malformed email rejected with HTTP 400 `VALIDATION_ERROR` | **PASS** |
| **E2E Step 6** | Live browser registration without email creates active worker profile | **PASS** |
| **E2E Step 9 & 10** | Live browser registration with optional Gmail succeeds and authenticates via email | **PASS** |
