# KAAMSETU — PHASE 53: OPTIONAL EMAIL IMPLEMENTATION REPORT

## 1. Signup UX & Preserved Design

- Updated `src/app/auth/register/page.tsx` (`/signup` and `/auth/register`) while preserving the existing Deep Forest Green (`#153E35`), Warm Ivory (`#F7F5F0`), Warm Sand (`#E8C999`), typography, card spacing, and 5-role selector grid.
- Added field:
  - **Label:** `Email address (optional)`
  - **Helper Copy:** `Add your email for account recovery and important updates. You can skip this.`

## 2. Schema & Validation Behavior (`src/schemas/auth.schema.ts`)

- `directRegistrationSchema.email` preprocesses strings with `.trim().toLowerCase()` and treats `""`, `null`, and `undefined` as `null` (omitted).
- Any non-empty email string is validated against strict email syntax (`z.string().email(...)`); malformed values (e.g., `"not-an-email"`) fail closed with HTTP `400 VALIDATION_ERROR`.
- Supports Gmail and any valid standard email domain.

## 3. Storage, Verification Honesty & Auth Compatibility

- When `email` is omitted (`null`), `POST /api/auth/register` binds Supabase Auth's internal login handle to a deterministic phone-derived identifier (`phone.<sha256_prefix>@phone.kaamsetu.internal`) with `email: null` and `email_verified: false` stored in `public.profiles`.
- When an optional `email` is supplied:
  - Duplicate check runs against `public.profiles.email` (`409 ACCOUNT_ALREADY_EXISTS` if already in use).
  - Saved in `public.profiles.email` with `email_verified: false` (never marked verified automatically; no false email-sent claims).
  - Supabase Auth user continues using the synthetic verified-phone handle so unconfirmed real emails neither receive false `email_confirm: true` status nor block password login.
- **Sign-In (`src/app/api/auth/login/route.ts`):** Supports signing in via either verified mobile number (normalized across E.164 / 10-digit formats) or the user's supplied optional email by resolving the linked `auth.users(id)` credential handle.
