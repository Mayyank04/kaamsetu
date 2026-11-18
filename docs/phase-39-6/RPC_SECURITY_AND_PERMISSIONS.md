# KAAMSETU — PHASE 39.6 RPC SECURITY & PRIVILEGE BOUNDARIES

**Document ID:** `KAAMSETU-39-6-RPC-SECURITY`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Status:** `VERIFIED_LOCALLY`

---

## 1. Least-Privilege Execution Model

Privileged authentication operations (rate limit increment, OTP consumption, account provisioning) operate under strict privilege boundaries:

| RPC Function | Signature | `SECURITY DEFINER` | `search_path` | Granted Roles | Revoked Roles |
|---|---|---|---|---|---|
| `check_and_increment_rate_limit` | `(text, int, int, int)` | Yes | `public, pg_temp` | `service_role` | `PUBLIC`, `anon`, `authenticated` |
| `get_rate_limit_status` | `(text)` | Yes | `public, pg_temp` | `service_role` | `PUBLIC`, `anon`, `authenticated` |
| `verify_and_consume_otp` | `(text, text)` | Yes | `public, pg_temp` | `service_role` | `PUBLIC`, `anon`, `authenticated` |
| `register_user_account` | `(text, text, text, text, text, boolean)` | Yes | `public, pg_temp` | `service_role` | `PUBLIC`, `anon`, `authenticated` |

---

## 2. Threat Vector Mitigations

1. **Direct Public Invocation via PostgREST:**
   - Unauthenticated attackers calling `/rest/v1/rpc/check_and_increment_rate_limit` using the public `anon` key are rejected with `401 Unauthorized` / `42501 Permission Denied`.
2. **`search_path` Hijacking:**
   - Explicit `SET search_path = public, pg_temp` prevents malicious user schemas or temporary objects from intercepting function execution.
3. **Parameter Validation:**
   - Functions validate inputs (`p_key IS NOT NULL`, `p_max_attempts > 0`, etc.) before executing database operations, throwing explicit PL/pgSQL exceptions upon malformed calls.
4. **Row-Level Locking Concurrency Protection:**
   - All rate-limit and OTP checks use `SELECT ... FOR UPDATE` to serialize concurrent requests, preventing race condition bypasses.
