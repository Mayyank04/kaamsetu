# KAAMSETU — PHASE 39 PROFILE PERSISTENCE AUDIT & SCHEMA REGISTER

**Program:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Target:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Engine:** Supabase / PostgreSQL 15  

---

## 1. Relational Schema Architecture

KAAMSETU relies on a normalized relational schema designed for strict sovereign identity ownership, data sovereignty, and auditability.

```
       +──────────────────────────────────+
       |             profiles             |
       +──────────────────────────────────+
       | id (UUID, PK)                    |
       | full_name (TEXT)                 |
       | phone (TEXT, UNIQUE)             |
       | role (TEXT: worker/contractor/.) |
       | account_status (TEXT)            |
       | phone_verification_status (TEXT) |
       | verification_method (TEXT)       |
       | phone_verified (BOOLEAN)         |
       | created_at, updated_at           |
       +──────────────────────────────────+
                        │ 1
                        │
                        │ 1
       +──────────────────────────────────+
       |         worker_profiles          |
       +──────────────────────────────────+
       | id (UUID, PK)                    |
       | user_id (UUID, FK -> profiles)   |
       | registry_id (TEXT, UNIQUE)       |
       | slug (TEXT, UNIQUE)              |
       | primary_trade (TEXT)             |
       | experience_years (INT)           |
       | daily_rate (NUMERIC)             |
       | pincode (TEXT)                   |
       | city (TEXT), state (TEXT)        |
       | voice_attestation_url (TEXT)     |
       | verification_score (INT)         |
       +──────────────────────────────────+
                        │ 1
                        │
                        │ N
       +──────────────────────────────────+
       |          worker_skills           |
       +──────────────────────────────────+
       | id (UUID, PK)                    |
       | worker_id (UUID, FK)             |
       | skill_name (TEXT)                |
       | endorsement_count (INT)          |
       +──────────────────────────────────+
```

---

## 2. Phase 39 Database Migration (`20261116000032`)

The Phase 39 migration was authored to support honest sandbox verification and account statuses:

```sql
-- Migration: 20261116000032_phase39_sandbox_account_and_verification_status.sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending_deletion'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_verification_status TEXT DEFAULT 'sandbox_unverified' 
CHECK (phone_verification_status IN ('unverified', 'sandbox_unverified', 'carrier_verified', 'institutional_verified'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'sandbox' 
CHECK (verification_method IN ('sandbox', 'sms_otp', 'institution_attested', 'biometric'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Add tracking columns to otp_challenges
ALTER TABLE public.otp_challenges
ADD COLUMN IF NOT EXISTS intent TEXT DEFAULT 'login' CHECK (intent IN ('login', 'registration', 'phone_update'));

ALTER TABLE public.otp_challenges
ADD COLUMN IF NOT EXISTS verification_mode TEXT DEFAULT 'sandbox' CHECK (verification_mode IN ('sandbox', 'sms'));
```

---

## 3. Row Level Security (RLS) Policy Governance

PostgreSQL RLS ensures complete isolation between workers, contractors, institutions, and the public:

| Table | Policy | Operation | Rule Definition |
| :--- | :--- | :--- | :--- |
| **`profiles`** | `profiles_select_own` | `SELECT` | `auth.uid() = id OR public.has_role('admin')` |
| **`profiles`** | `profiles_update_own` | `UPDATE` | `auth.uid() = id` |
| **`worker_profiles`**| `worker_profiles_public_read` | `SELECT` | `status = 'active'` (Public discovery permitted) |
| **`worker_profiles`**| `worker_profiles_modify_own` | `UPDATE/INSERT` | `auth.uid() = user_id` |
| **`otp_challenges`** | `otp_challenges_service_only`| `ALL` | `auth.role() = 'service_role'` (Strict server-only) |

---

## 4. Elimination of Mock Fallbacks in Production

Prior to Phase 39, `src/lib/supabase/db/profiles.ts` contained a fallback that returned synthetic worker profiles (`FEATURED_PROFESSIONALS`) when a database query returned no results.

### Remediation Applied:
- The fallback logic now verifies environment context.
- In production (`process.env.NODE_ENV === "production"`), requests fail closed with a typed `DatabaseConnectionError` rather than returning ungrounded mock artisans.
- Synthetic fixtures are strictly isolated to test runners (`test/*.test.ts`) and offline development harnesses.
