# KAAMSETU — PHASE 39.4 SUPABASE CONTRACT & VERIFICATION AUDIT

**Environment Target:** Production Supabase Database & Local Emulation  
**Target Schema:** `public`  
**Migration:** `20261117000034_phase39_4_account_lifecycle_and_persistence.sql`  
**Status:** IMPLEMENTED BUT NOT VERIFIED (REMOTE CLOUD DB) / VERIFIED WORKING LOCALLY (LOCAL CODE)

---

## 1. Schema Extensions & Migrations

The Phase 39.4 migration file `supabase/migrations/20261117000034_phase39_4_account_lifecycle_and_persistence.sql` provides the database contracts required for full lifecycle persistence:

### 1.1 `public.profiles` Column Alterations
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '2026.1',
ADD COLUMN IF NOT EXISTS privacy_version TEXT DEFAULT '2026.1',
ADD COLUMN IF NOT EXISTS consent_purpose TEXT DEFAULT 'workforce_identity_registration';
```

### 1.2 `public.user_consents` Immutable Ledger Table
```sql
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone_hash TEXT NOT NULL,
  terms_version TEXT NOT NULL DEFAULT '2026.1',
  privacy_version TEXT NOT NULL DEFAULT '2026.1',
  purpose TEXT NOT NULL DEFAULT 'workforce_identity_registration',
  intent TEXT NOT NULL DEFAULT 'registration',
  ip_hash TEXT,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_phone_hash ON public.user_consents(phone_hash);
```

### 1.3 `register_user_account` Stored Procedure Updates
```sql
CREATE OR REPLACE FUNCTION public.register_user_account(
  p_phone TEXT,
  p_role TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_terms_version TEXT DEFAULT '2026.1',
  p_privacy_version TEXT DEFAULT '2026.1',
  p_consent_purpose TEXT DEFAULT 'workforce_identity_registration'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
...
$$;
```

---

## 2. Remote Production Database Verification Status

- **Migration Applied to Source:** YES (`supabase/migrations/20261117000034_phase39_4_account_lifecycle_and_persistence.sql`).
- **Local Application Verification:** `VERIFIED WORKING LOCALLY`. All test assertions verify that profiles and consent records are persisted and queried accurately.
- **Remote Supabase Direct Connection:** `IMPLEMENTED BUT NOT VERIFIED`. Direct remote SQL execution requires project administrator privileges or execution of migration `20261117000034` in the Supabase SQL Editor.
- **Fail-Closed Boundary Invariant:** In production, if Supabase is unreachable or unconfigured, the system fails closed with HTTP 503 rather than allowing unauthorized account creation or unrecorded legal consent.
