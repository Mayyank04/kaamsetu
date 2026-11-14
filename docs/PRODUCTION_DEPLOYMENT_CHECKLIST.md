# KAAMSETU — Production Deployment & Infrastructure Checklist

**Application:** KAAMSETU — Voice-First Multilingual Digital Skill Identity Platform  
**Target Environment:** Node.js 20 LTS / Next.js 15 SSR / Supabase PostgreSQL 15  
**Security Standard:** RFC 8785 Canonical JSON, HMAC-SHA256 non-repudiation, fail-closed access control

---

## 1. Environment Configuration Matrix

The following environment variables are required for a production deployment. The application employs strict fail-closed startup validation; any missing secret will halt boot.

| Variable Name | Required | Min Entropy | Purpose & Production Constraint |
|---|---|---|---|
| `NODE_ENV` | Yes | N/A | Must be set to `production`. |
| `NEXT_PUBLIC_APP_URL` | Yes | N/A | Full canonical public URL (e.g. `https://kaamsetu.in`). Never `localhost` in production. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | N/A | Supabase project API gateway endpoint (`https://<project-ref>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | JWT | Public anonymous client key with RLS enforcement. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | JWT | Privileged backend secret. **NEVER expose via `NEXT_PUBLIC_` or commit to git.** |
| `CREDENTIAL_SIGNING_SECRET` | Yes | 256 bits (32 bytes) | Cryptographic master key for RFC 8785 HMAC-SHA256 credential signatures. |
| `CREDENTIAL_KEY_VERSION` | Yes | N/A | Active key version indicator (e.g. `v1`). |
| `RATE_LIMIT_HMAC_SECRET` | Yes | 256 bits (32 bytes) | Secret used to salt and hash phone numbers and client identifiers in rate limiting. |
| `GEMINI_API_KEY` | Yes | High | Google Gemini 2.5 Flash API key for voice attestation extraction. |
| `SMS_GATEWAY_PROVIDER` | Yes | N/A | `twilio` or `msg91` for real SMS OTP delivery in India. |
| `SMS_GATEWAY_API_KEY` | Yes | High | Production API key for the SMS gateway. |
| `SMS_GATEWAY_SENDER_ID` | Optional | 6 chars | DLT-registered 6-character sender ID for Indian telecom compliance (e.g. `KAMSTU`). |

---

## 2. Cryptographic Secret Generation Guide

Generate cryptographically secure 256-bit secrets using OpenSSL before deploying:

```bash
# 1. Generate CREDENTIAL_SIGNING_SECRET (32-byte hex string)
openssl rand -hex 32

# 2. Generate RATE_LIMIT_HMAC_SECRET (32-byte hex string)
openssl rand -hex 32

# 3. Verify entropy
# The secret must be at least 32 bytes (64 hex characters) and completely unpredictable.
```

> **Security Guardrail:** The system rejects any secret containing common strings (`dev`, `test`, `secret`, `123456`, `placeholder`) or less than 32 characters in production mode.

---

## 3. PostgreSQL Database Migrations (Supabase)

All 6 migrations must be applied in strict numerical sequence to initialize schema, security policies, triggers, and functions:

| Sequence | Migration File | Core Functionality |
|---|---|---|
| **01** | `20261114000001_initial_schema.sql` | Occupations, skills, profiles, worker_profiles, bookings, reviews, work_records schema. |
| **02** | `20261114000002_rls_policies.sql` | Row Level Security policies for published discovery, booking participant isolation, and review controls. |
| **03** | `20261114000003_storage_policies.sql` | Supabase Storage bucket configurations and path-isolated worker upload policies. |
| **04** | `20261114000004_security_hardening.sql` | Rate limiting RPCs, credential registry, public profile sanitization views, and phone number masking. |
| **05** | `20261114000005_persistent_rate_limiter.sql` | Atomic PostgreSQL `check_and_increment_rate_limit` and `clear_rate_limit` RPCs with fail-closed locking. |
| **06** | `20261114000006_fix_function_search_paths.sql` | Security hardening: explicit `search_path = public, auth` on all `SECURITY DEFINER` functions to prevent search path hijacking. |

### Verification Command
Run the database verification suite against the target production database:
```bash
npm run verify:db
```
All 71 checks must report `PASS`.

---

## 4. SMS Gateway & OTP Delivery (India DLT Compliance)

In production, user authentication relies on mobile phone number verification via OTP:

1. **DLT Registration**: In accordance with TRAI regulations, register the KAAMSETU principal entity and SMS header (e.g., `KAMSTU`) on Vilpower / Jio DLT.
2. **Template Approval**: Register the transactional OTP template:
   `"Your KAAMSETU verification code is {#var#}. Valid for 10 minutes. Do not share this code with anyone. - KAAMSETU"`
3. **Gateway Configuration**:
   - For Twilio: Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
   - For MSG91: Set `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, and `MSG91_OTP_TEMPLATE_ID`.
4. **Rate Limiting Guard**: Persistent database rate limiting prevents OTP flooding:
   - Maximum 3 OTP requests per phone number per hour.
   - 60-second cooldown between consecutive requests.
   - 5 failed verification attempts triggers a 15-minute persistent lockout.

---

## 5. Automated Health Checks & Structured Monitoring

KAAMSETU provides a dedicated health check endpoint at `/api/health`:

### HTTP Endpoint: `GET /api/health`
- **Success Response (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-14T19:55:00.000Z",
  "environment": "production",
  "services": {
    "database": "connected",
    "rateLimiter": "operational",
    "crypto": "operational",
    "gemini": "configured"
  }
}
```
- **Failure Response (503 Service Unavailable)**: Returned if the PostgreSQL database connection fails or critical crypto keys are missing.

### Recommended Uptime Monitors
Configure external uptime probes (e.g. BetterStack, Pingdom, or Cloudflare Health Checks) to poll `/api/health` every 60 seconds with an alert threshold of 2 consecutive failures.

---

## 6. Disaster Recovery & Backup Strategy

1. **Automated Daily Backups**: Enable Supabase point-in-time recovery (PITR) with minimum 7-day retention.
2. **Credential Immutability**: All issued Sovereign Credentials are permanently recorded in `public.credential_registry` with their SHA-256 canonical payload hash. Even if worker profiles are updated, the cryptographic audit trail remains immutable.
3. **Key Rotation Protocol**:
   - To rotate the signing key, generate a new 256-bit secret and deploy as `CREDENTIAL_SIGNING_SECRET_V2`.
   - Update `CREDENTIAL_KEY_VERSION` to `v2`.
   - Existing credentials signed with `v1` continue to verify seamlessly via the multi-version key resolver until explicitly revoked.
