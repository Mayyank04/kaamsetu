# KAAMSETU — PHASE 53.1: OPTIONAL EMAIL REPORT & CREDENTIAL ARCHITECTURE

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Economic Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Date:** 2026-11-27  
**Module:** Optional Email Handling, Schema Validation & Dual-Login Support  
**Target Branch:** `phase-53.1-signup-ui-and-sandbox-otp`  

---

## 1. Visual Presentation & Form Placement

The optional email field is rendered visibly on `src/app/auth/register/page.tsx` directly beneath the mobile number section:

- **Label:** `Email address (optional)`
- **Placeholder:** `Enter your email address`
- **Helper Text:** `Optional — add an email for account recovery and important updates.`
- **Design Tokens:** Follows standard 44px (`h-11`) tactile input height, `bg-surface` background, `border-forest/20` hairline border, focus ring `focus:ring-forest`, with responsive spacing across viewports.

---

## 2. Validation & Preprocessing (`src/schemas/auth.schema.ts`)

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

### Verified Behaviors:
1. **Omitted / Left Blank:** When empty (`""` or whitespace), it transforms to `null`. Signup succeeds without email or validation error.
2. **Whitespace Trimming:** Inputs like `"  user@gmail.com  "` are trimmed and lowercased to `"user@gmail.com"`.
3. **Invalid Syntax:** Malformed inputs (e.g., `"user@"`, `"not-an-email"`) fail closed with HTTP 400 `VALIDATION_ERROR`.
4. **Provider Support:** Seamlessly supports Gmail (`@gmail.com`), institutional domains (`@iitg.ac.in`), and standard corporate email domains.

---

## 3. Database Persistence & Verification Honesty

### 3.1 Schema & Columns
In `public.profiles`:
- `email TEXT`: Nullable column holding the user's optional email.
- `email_verified BOOLEAN NOT NULL DEFAULT FALSE`: Accurately indicates whether the email address has been verified.
- Unique Index: `idx_profiles_email_lower_unique` on `lower(email)` where `email IS NOT NULL AND length(trim(email)) > 0`.

### 3.2 Verification Honesty Principles
- An optional email is **never** automatically marked verified upon registration. It is saved with `email_verified = false`.
- The platform never makes ungrounded claims that a verification email was sent unless a configured transactional provider confirms dispatch.
- An unverified email is never used as an unverified recovery credential.

---

## 4. Dual Sign-In Capability (`src/app/api/auth/login/route.ts`)

Users who register can authenticate seamlessly via either credential path:
1. **Login with Verified Mobile Number:**  
   User enters their mobile number (`9876543210` or `+919876543210`) and password. The system resolves the user profile by normalized phone, looks up the internal authentication credential, and signs in.
2. **Login with Optional Email:**  
   User enters their email (`user@gmail.com`) and password. The system resolves the user profile by `profiles.email`, retrieves the credential handle, and validates credentials.
3. Both methods issue secure HTTP-only `kaamsetu_session` cookies with 14-day validity.
