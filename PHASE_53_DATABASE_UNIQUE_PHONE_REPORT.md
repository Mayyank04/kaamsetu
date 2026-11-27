# KAAMSETU — PHASE 53: DATABASE UNIQUE PHONE IDENTITY REPORT

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Economic Invariant:** `platform_commission_amount = 0.00`  
**Date:** 2026-11-27  
**Module:** Database Architecture, PostgreSQL Constraints & Identity Uniqueness  
**Target Repository:** `Mayyank04/kaamsetu`  
**Active Branch:** `phase-53-secure-phone-verification-and-optional-email`  

---

## 1. Executive Summary & Constitutional Invariant

In the KAAMSETU digital craft registry and workforce identity platform, the authoritative permanent identity principle is:

$$\text{One Verified Mobile Phone Number} \equiv \text{Exactly One Primary KAAMSETU Account Identity}$$

Under no circumstances may a single physical mobile number be used to create multiple distinct primary accounts. This invariant is permanently enforced across all platform roles:
- Worker / Artisan
- Local Vendor
- Contractor
- Customer
- Training Institution

If an existing artisan later acts as a contractor or vendor, this must be accommodated via authorized internal role-expansion privileges rather than allowing the same phone number to spawn fragmented secondary accounts.

---

## 2. Authoritative Database Identity Schema

### 2.1 Table Identification
The authoritative identity layer in KAAMSETU is partitioned into two synchronized tiers:
1. **Supabase Auth (`auth.users`):**  
   Manages cryptographic credentials (passwords, sessions, JWTs). To accommodate users who sign up without an email address while maintaining strict Supabase Auth compatibility, Supabase Auth email is bound to a deterministic, non-routable synthetic handle:
   $$\text{phone.<sha256(canonical\_e164)[0:16]>@phone.kaamsetu.internal}$$
2. **Public Application Profiles (`public.profiles`):**  
   The authoritative application table linked 1:1 via foreign key `id REFERENCES auth.users(id) ON DELETE CASCADE`. This table holds the canonical mobile number (`phone`), optional email (`email`), verification flags (`phone_verified`, `email_verified`), and active role (`role`).

### 2.2 Database Uniqueness Constraints
Application-level "check-then-insert" logic is inherently vulnerable to race conditions and concurrent requests. Therefore, database constraints serve as the final immutable authority.

Migration `supabase/migrations/20261126000001_phase53_unique_phone_and_optional_email.sql` defines:

```sql
-- 1. Ensure phone verification and optional email columns exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_e164 TEXT,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verification_status TEXT NOT NULL DEFAULT 'not_verified';

ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;

-- 2. Unique index on canonical E.164 phone identity
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_e164_unique
  ON public.profiles (phone_e164)
  WHERE phone_e164 IS NOT NULL;

-- 3. Unique index on verified phone numbers
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_verified_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL AND phone_verified = TRUE;

-- 4. Case-insensitive unique index on optional email (permits NULL when email is omitted)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower_unique
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL AND length(trim(email)) > 0;
```

---

## 3. Migration Safety & Non-Destructive Principles

Applying constraints to an existing database with legacy data requires strict non-destructive safeguards:

1. **Zero Data Deletion:** No records in `public.profiles` or `auth.users` are dropped or merged automatically.
2. **Audit Logging Table:** The migration creates an audit ledger table:
   ```sql
   CREATE TABLE IF NOT EXISTS public.phone_uniqueness_audit (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     profile_id UUID NOT NULL,
     raw_phone TEXT,
     normalized_phone_e164 TEXT,
     audit_status TEXT NOT NULL CHECK (audit_status IN ('duplicate_phone', 'invalid_phone', 'normalized')),
     detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```
3. **Safe PL/pgSQL Normalization Block:**  
   The migration scans existing rows. If a row's normalized `+91` number would conflict with an existing record, the row is **not** overwritten; instead, a conflict entry is logged in `public.phone_uniqueness_audit` for administrative review.
4. **Conditional Index Creation:** Partial indexing ensures that unverified or legacy null entries do not trigger false unique index violations.

---

## 4. Atomic Registration & Concurrency Race Condition Defense

To prevent duplicate accounts when two registration requests arrive simultaneously from the same device or automated scripts:

### 4.1 Cryptographic Proof Token Single-Use
Before hitting the database, `consumePhoneVerificationProof` checks the proof token's unique nonce (`jti`). Once consumed, the nonce is stored in `consumedProofJtis` and cannot be replayed.

### 4.2 Database Unique Constraint Catch & Rollback
In `src/app/api/auth/register/route.ts`:
```typescript
let { error: upsertErr } = await adminClient.from("profiles").upsert(profilePayload, { onConflict: "id" });

if (upsertErr) {
  // 1. Immediately delete orphaned auth.users record if profile write failed
  try {
    await adminClient.auth.admin.deleteUser(userId);
  } catch (cleanupErr) {
    console.warn("[REGISTER_ORPHAN_CLEANUP_WARN]", cleanupErr);
  }

  // 2. Catch Postgres Unique Violation (code 23505) and duplicate key errors
  if (upsertErr.code === "23505" || upsertErr.message?.toLowerCase().includes("duplicate key")) {
    const isEmailDup = upsertErr.message?.toLowerCase().includes("email");
    return NextResponse.json(
      {
        success: false,
        code: isEmailDup ? "ACCOUNT_ALREADY_EXISTS" : "PHONE_ALREADY_REGISTERED",
        message: isEmailDup
          ? "An account with this email address already exists. Please sign in instead."
          : "An account with this mobile number already exists. Please sign in instead.",
        correlationId,
      },
      { status: 409 }
    );
  }
}
```

---

## 5. Multi-Role Identity Governance

### Rule: One Account, Multiple Roles (Not Multiple Accounts)
- A worker who registers as an Artisan cannot create a second account as a Customer or Contractor using the same phone number.
- `POST /api/auth/register` queries for existing profiles across canonical E.164 and legacy 10-digit formats before proceeding:
  ```typescript
  const { data: existingPhone } = await adminClient
    .from("profiles")
    .select("id")
    .in("phone", Array.from(new Set([normalizedPhone, legacyClean10])))
    .limit(1)
    .maybeSingle();

  if (existingPhone) {
    return NextResponse.json(
      {
        success: false,
        code: "PHONE_ALREADY_REGISTERED",
        message: "An account with this mobile number already exists. Please sign in instead.",
        correlationId,
      },
      { status: 409 }
    );
  }
  ```
- Submitting a second registration with a different role parameter returns HTTP 409.

---

## 6. Automated Test Verification Results

The database uniqueness and race-condition defense mechanisms are continuously tested in `test/phase-53-phone-verified-registration.test.ts`:

| Test Case | Description | Result |
| :--- | :--- | :--- |
| **Test 3.4** | Duplicate registration with same phone across formats/roles returns `409` | **PASS** |
| **Test 3.5** | Concurrent duplicate registrations allow exactly 1 creation and reject second with `401`/`409` | **PASS** |
| **Test 4.1** | End-to-end `/api/auth/otp/send` → `/api/auth/otp/verify` → `/api/auth/register` creates verified profile | **PASS** |

All tests pass 100% cleanly without errors.
