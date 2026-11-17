# DATABASE & RPC CONTRACT VALIDATION REPORT

**Document ID:** `KAAMSETU-DOC-39-6-07`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED LOCALLY`

---

## 1. Core RPC Functions & Signatures

The KAAMSETU identity and rate-limiting subsystem relies on 3 authoritative PostgreSQL RPC functions:

### 1. `check_and_increment_rate_limit`
- **Signature:** `(p_key_hash text, p_max_requests integer, p_window_seconds integer)`
- **Return Type:** `table(allowed boolean, current_count integer, retry_after_seconds integer)`
- **Security Privilege:** `SECURITY DEFINER`. Access is revoked from `anon` and `authenticated`; callable only by `service_role`.
- **Fail-Closed Contract:** In production, any database unavailability returns HTTP 503 instead of falling back to insecure in-memory mocks.

### 2. `verify_and_consume_otp`
- **Signature:** `(p_phone text, p_otp_code text, p_max_attempts integer)`
- **Return Type:** `table(success boolean, error_code text, remaining_attempts integer, user_id uuid, role text)`
- **Atomic Invariant:** Performs code comparison, attempt counter decrement, and single-use consumption in a single atomic transaction.

### 3. `register_user_account`
- **Signature:** `(p_phone text, p_full_name text, p_role text, p_terms_version text, p_privacy_version text)`
- **Return Type:** `table(user_id uuid, role text, is_new boolean)`
- **Duplicate Prevention:** Returns `ACCOUNT_ALREADY_EXISTS` (HTTP 409) if the phone number is already registered under an existing account.

---

## 2. RLS & Multitenant Policy Enforcement

- All tables (`worker_profiles`, `contractor_profiles`, `user_accounts`, `otp_challenges`, `consent_records`) enforce strict Row-Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- Read and update actions require matching session credentials or explicit institutional authorization tokens.
