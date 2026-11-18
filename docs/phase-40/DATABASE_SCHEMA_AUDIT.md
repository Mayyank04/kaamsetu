# KAAMSETU — PHASE 40: DATABASE SCHEMA & INFRASTRUCTURE AUDIT

**Migration Baseline:** `supabase/migrations/20261118000001_phase40_root_cause_master_schema.sql`  
**Target PostgreSQL Version:** PostgreSQL 15+ / Supabase  
**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  

---

## 1. Schema Architecture & Entity Relationship Graph

The KAAMSETU data architecture is structured around sovereign workforce identity, institutional credential assurance, and strict tenant isolation. Every worker profile is cryptographically linked to their sovereign identity in `auth.users`.

```
                    ┌────────────────────────┐
                    │       auth.users       │
                    │   (Supabase Auth Core) │
                    └───────────┬────────────┘
                                │ 1:1
                                │ ON DELETE CASCADE
                                ▼
                    ┌────────────────────────┐
                    │    public.profiles     │
                    │  (Sovereign Identity)  │
                    └─────┬────────────┬─────┘
                          │ 1:1        │ 1:N
                          │ CASCADE    │ CASCADE
                          ▼            ▼
             ┌─────────────────────┐ ┌─────────────────────┐
             │public.worker_profile│ │public.user_consents │
             │  (Artisan Record)   │ │  (Audit Ledger)     │
             └──────────┬──────────┘ └─────────────────────┘
                        │ 1:N
                        │ CASCADE
                        ▼
             ┌─────────────────────┐       ┌─────────────────────┐
             │public.worker_skills │──────▶│    public.skills    │
             │  (Competencies)     │ N:1   └──────────┬──────────┘
             └─────────────────────┘                  │ N:1
                                                      ▼
                                           ┌─────────────────────┐
                                           │ public.occupations  │
                                           │   (NSQF Trades)     │
                                           └─────────────────────┘
```

---

## 2. Table-by-Table Technical Audit

### 2.1 `public.profiles`
- **Primary Key:** `id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
- **Purpose:** Core sovereign identity record containing personal information, role, verification status, and consent metadata.
- **Mandatory Columns:**
  - `id` (UUID PK)
  - `role` (`public.app_role`: worker, customer, contractor, admin, institution)
  - `full_name` (TEXT)
  - `email` (TEXT)
  - `phone` (TEXT, 10-digit clean mobile)
  - `account_status` (TEXT: active, suspended, pending)
  - `phone_verified` (BOOLEAN, default: false)
  - `phone_verification_status` (TEXT, default: 'not_verified')
  - `verification_method` (TEXT, default: 'none')
  - `terms_accepted_at`, `privacy_accepted_at` (TIMESTAMPTZ)
  - `terms_version`, `privacy_version` (TEXT)
- **Security Rule:** Plaintext passwords and custom hash columns are strictly prohibited. Password handling is delegated natively to `auth.users`.
- **Indexes:**
  - `idx_profiles_email_lower` ON `LOWER(email)`
  - `idx_profiles_phone` ON `phone`
  - `idx_profiles_role` ON `role`

### 2.2 `public.occupations`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Purpose:** National trade classifications aligned with the National Skills Qualifications Framework (NSQF).
- **Core Trades Seeded:**
  1. `Electrical & Solar` (NSQF 4, icon: Zap)
  2. `Carpentry & Joinery` (NSQF 4, icon: Hammer)
  3. `Plumbing & Sanitation` (NSQF 4, icon: Wrench)
  4. `Masonry & Construction` (NSQF 3, icon: Building)
  5. `Painting & Finishing` (NSQF 3, icon: Paintbrush)
  6. `Welding & Fabrication` (NSQF 4, icon: Flame)
  7. `HVAC & Refrigeration` (NSQF 4, icon: Wind)
  8. `Automobile Mechanics` (NSQF 4, icon: Car)

### 2.3 `public.skills`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Foreign Key:** `occupation_id UUID REFERENCES public.occupations(id) ON DELETE CASCADE`
- **Purpose:** Granular trade competencies linked to specific vocational classifications.

### 2.4 `public.worker_profiles`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Foreign Key:** `user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE`
- **Unique Constraints:** `UNIQUE (user_id)`, `UNIQUE (registry_id)`, `UNIQUE (slug)`
- **Key Columns:**
  - `registry_id` (Collision-resistant national credential identifier: e.g. `IN-AS-2026-XXXX-KS`)
  - `slug` (Search-engine and QR-verification URL slug)
  - `occupation_id` (UUID references occupations)
  - `headline`, `bio`, `years_experience`
  - `city`, `state`, `pincode` (Class B rollout verification)
  - `kaamscore`, `kaamscore_level`
  - `is_dispatch_eligible`, `dispatch_status`
  - `is_published` (Boolean visibility flag)

### 2.5 `public.worker_skills`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Foreign Keys:**
  - `worker_profile_id UUID REFERENCES public.worker_profiles(id) ON DELETE CASCADE`
  - `skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE`
- **Unique Constraint:** `UNIQUE (worker_profile_id, skill_id)`
- **Key Columns:**
  - `verification_type` ('self_declared', 'voice_submitted', 'institution_certified')
  - `is_primary` (BOOLEAN)
  - `years_practiced` (INT)

### 2.6 `public.user_consents`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Foreign Key:** `user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE`
- **Purpose:** Immutable audit ledger recording statutory consent compliance (DPDP Act & IT Act 2000).
- **Key Columns:**
  - `consent_type` ('terms_of_service', 'privacy_policy', 'vernacular_voice_processing')
  - `consent_version` ('2026.1')
  - `granted` (BOOLEAN)
  - `granted_at` (TIMESTAMPTZ)
  - `context_metadata` (JSONB storing IP address, user agent, and registration method)

### 2.7 `public.contractor_organizations`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Foreign Key:** `owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE`
- **Unique Constraint:** `UNIQUE (owner_id)`
- **Key Columns:** `company_name`, `verification_status`

### 2.8 `public.auth_rate_limits`
- **Primary Key:** `key TEXT`
- **Purpose:** High-performance, atomic rate limiting table preventing credential stuffing and brute-force attacks across serverless instances.
- **Key Columns:** `attempt_count`, `first_attempt_at`, `blocked_until`, `updated_at`

### 2.9 `public.otp_challenges`
- **Primary Key:** `id UUID DEFAULT gen_random_uuid()`
- **Purpose:** Preserved table for optional telecom-integrated multi-factor features.
- **Key Columns:** `phone_hash`, `otp_hash`, `attempts`, `max_attempts`, `consumed`, `expires_at`

---

## 3. Automation Triggers & Stored Procedures

### 3.1 Trigger: `on_auth_user_created`
- **Source:** `AFTER INSERT ON auth.users`
- **Procedure:** `public.handle_new_user()`
- **Execution:** Runs with `SECURITY DEFINER` privileges. Whenever a user is registered via Supabase Auth Admin API, this trigger automatically scaffolds a corresponding row in `public.profiles` using user metadata (`full_name`, `role`, `phone`).

### 3.2 Stored Procedure: `check_and_increment_rate_limit`
- **Parameters:** `p_key text, p_max_attempts integer, p_window_seconds integer, p_block_seconds integer`
- **Returns:** `allowed boolean, remaining_attempts integer, retry_after_seconds integer, blocked boolean`
- **Execution:** Atomic `FOR UPDATE` lock ensuring zero race conditions across concurrent Vercel serverless functions. Revoked from `PUBLIC` and granted strictly to `service_role`.

### 3.3 Stored Procedure: `get_rate_limit_status`
- **Parameters:** `p_key text`
- **Returns:** `exists boolean, attempt_count integer, remaining_seconds integer, is_blocked boolean`
- **Execution:** Read-only inspection of rate limiter status without mutating attempt counts.

---

## 4. Row Level Security (RLS) Policy Audit

| Table | Policy Name | Command | Access Rule |
| :--- | :--- | :--- | :--- |
| `profiles` | Profiles are viewable by owner and public | `SELECT` | `true` |
| `profiles` | Profiles can be updated by owner | `UPDATE` | `auth.uid() = id` |
| `profiles` | Profiles can be inserted by owner | `INSERT` | `auth.uid() = id` |
| `occupations` | Occupations are viewable by everyone | `SELECT` | `true` |
| `skills` | Skills are viewable by everyone | `SELECT` | `true` |
| `worker_profiles` | Worker profiles viewable by public or owner | `SELECT` | `is_published = true OR auth.uid() = user_id` |
| `worker_profiles` | Worker profiles manageable by owner | `ALL` | `auth.uid() = user_id` |
| `worker_skills` | Worker skills viewable by everyone | `SELECT` | `true` |
| `worker_skills` | Worker skills manageable by worker owner | `ALL` | Owner check via `worker_profiles.user_id = auth.uid()` |
| `user_consents` | Consents viewable and insertable by owner | `ALL` | `auth.uid() = user_id` |
| `auth_rate_limits` | Service role only | `ALL` | Revoked from public; service_role only |
