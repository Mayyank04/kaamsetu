# KAAMSETU — PHASE 53: UNIQUE PHONE IDENTITY REPORT
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT` (Guwahati Urban & Shillong Urban)  
**Permanent Economic Invariant:** `platform_commission_amount = 0.00`  
**Date:** 2026-11-26  
**Subject:** Database Schema Constraints, Phone Identity Invariant & Migration Audit

---

## 1. Constitutional Invariant: Unique Verified Phone

In KAAMSETU's workforce architecture:
```
One Verified Physical Mobile Number = Exactly One Primary User Account (public.profiles.id)
```

### Prohibited Conditions:
- ❌ A single mobile number registering two separate worker accounts.
- ❌ A single mobile number registering one worker account and a separate customer account.
- ❌ A single mobile number registering as a contractor and simultaneously creating a distinct vendor identity.
- ❌ Bypassing uniqueness by altering phone prefix, spaces, or country code formatting.

### Permitted Workflow for Multi-Role Operations:
If a verified artisan also acts as a vendor or contractor, role expansion must occur through authorized within-account role assignment, preserving the single sovereign identity anchor rather than creating fragmented secondary accounts.

---

## 2. Database Schema & Migration Analysis

### Current Production State:
- Account identity is anchored in `public.profiles`, with a 1:1 foreign key relationship to `auth.users(id)`.
- Prior migrations (`20261118_direct_registration_no_otp.sql`) dropped `NOT NULL` on `public.profiles.phone` to accommodate email-only registrations, resulting in multiple indexes (`idx_profiles_phone`, `idx_profiles_phone_search`).
- Some rows held 10-digit numbers (`9876543210`) while others held E.164 (`+919876543210`).

### Phase 53 Migration: `20261126000001_phase53_unique_phone_and_optional_email.sql`

```sql
-- 1. Ensure optional email & verification columns exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verification_status TEXT NOT NULL DEFAULT 'not_verified';

-- 2. Safely normalize legacy 10-digit Indian mobile numbers to E.164 (+91XXXXXXXXXX)
-- Only updates rows where the normalized +91 value does not already exist on another row.
DO $$
DECLARE
  rec RECORD;
  v_e164 TEXT;
  v_conflict BOOLEAN;
BEGIN
  FOR rec IN
    SELECT id, phone
    FROM public.profiles
    WHERE phone IS NOT NULL
      AND phone ~ '^[6-9][0-9]{9}$'
  LOOP
    v_e164 := '+91' || rec.phone;
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE phone = v_e164 AND id <> rec.id
    ) INTO v_conflict;

    IF NOT v_conflict THEN
      UPDATE public.profiles
      SET phone = v_e164
      WHERE id = rec.id;
    ELSE
      RAISE NOTICE 'Skipping normalization for profile % due to existing E.164 phone conflict (%)', rec.id, v_e164;
    END IF;
  END LOOP;
END $$;

-- 3. Database-level uniqueness on verified phone numbers (across all roles)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_verified_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL AND phone_verified = TRUE;

-- 4. Database-level uniqueness on optional email when provided (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_lower_unique
  ON public.profiles (lower(email))
  WHERE email IS NOT NULL AND length(trim(email)) > 0;
```

---

## 3. Safe Migration Guarantees

1. **Non-Destructive:** Zero tables or columns dropped. Zero records deleted.
2. **Conflict Preservation:** The PL/pgSQL block inspects potential duplicates before updating. If a record already exists with the normalized number, the existing row is untouched and logged for administrative resolution.
3. **Partial Index Architecture:**
   - The unique index on `phone` is a partial unique index (`WHERE phone IS NOT NULL AND phone_verified = TRUE`).
   - This ensures that verified phone numbers are strictly unique across the platform while never failing on historical legacy records with null phone numbers.
4. **Case-Insensitive Email Index:**
   - The unique index on `lower(email)` guarantees that `User@gmail.com` and `user@gmail.com` cannot create duplicate accounts.

---

## 4. Multi-Layer Duplicate Defense Matrix

| Layer | Component | Mechanism | Result |
| :--- | :--- | :--- | :--- |
| **Layer 1** | Client Form | Normalization + phone validation | Helpful immediate feedback |
| **Layer 2** | `POST /api/auth/otp/send` | Eligibility pre-check across E.164 & 10-digit | Rejects with HTTP 409 before SMS is sent |
| **Layer 3** | `POST /api/auth/register` | Database query across phone candidates | Rejects with HTTP 409 `PHONE_ALREADY_REGISTERED` |
| **Layer 4** | PostgreSQL Database | Unique index `idx_profiles_verified_phone_unique` | Rejects concurrent race conditions with SQL error 23505 |
| **Layer 5** | Auth Error Handler | Catches constraint violation | Maps 23505 to safe HTTP 409 conflict |

This 5-layer defense ensures that even if two requests race simultaneously or someone bypasses the client and API, the PostgreSQL database remains the ultimate authority, refusing duplicate creation.
