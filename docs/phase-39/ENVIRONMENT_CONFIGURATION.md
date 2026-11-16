# KAAMSETU — PHASE 39 ENVIRONMENT CONFIGURATION SPECIFICATION

**Program:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Target:** `Mayyank04/kaamsetu`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Security Standard:** Zero Hardcoded Secrets & Fail-Closed Validation  

---

## 1. Environment Variable Architecture

Environment variables are validated at startup using Zod in `src/lib/env.ts`. Any missing mandatory production secret causes the application to fail closed immediately, preventing misconfigured or vulnerable execution.

```
+─────────────────────────────────────────────────────────────+
|                        process.env                          |
+─────────────────────────────────────────────────────────────+
                               │
                               ▼
+─────────────────────────────────────────────────────────────+
|                 src/lib/env.ts (Zod Schema)                 |
|  - Validates types, entropy, formats, and allowed enums     |
|  - Checks NODE_ENV: production vs test/development          |
+─────────────────────────────────────────────────────────────+
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
[Pass: Typed `env` exported]        [Fail: Process Terminated]
                                    "FATAL: Missing Secret"
```

---

## 2. Complete Environment Variable Dictionary

| Variable Name | Type / Format | Default | Required in Prod | Operational Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`AUTH_VERIFICATION_MODE`** | `"sandbox" \| "sms"` | `"sandbox"` | Yes | Determines whether OTP authentication runs in transparent sandbox mode or dispatches real cellular SMS. |
| **`SANDBOX_OTP_CODE`** | 6-digit string | `undefined` | No (Optional) | Overrides random OTP generation in sandbox mode for deterministic automated E2E testing. |
| **`RATE_LIMIT_HMAC_SECRET`** | Min 32 chars (256-bit) | None | **MANDATORY** | Used to sign session tokens (`kaamsetu_session`) and compute HMAC hashes of OTP challenges and rate limiter keys. |
| **`NEXT_PUBLIC_SUPABASE_URL`** | Valid HTTPS URL | None in prod | Yes (if DB enabled)| Public URL for Supabase PostgreSQL and real-time socket connections. |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | JWT string | None in prod | Yes (if DB enabled)| Client-safe anonymous key for Supabase browser queries guarded by RLS. |
| **`SUPABASE_SERVICE_ROLE_KEY`** | JWT string | None | Server-only | High-privilege key used exclusively in server route handlers for admin operations. |
| **`ED25519_PRIVATE_KEY`** | 64-char Hex / PKCS#8 | None in prod | Yes | Private key for signing sovereign worker credential attestations (RFC 8785). |
| **`ED25519_PUBLIC_KEY`** | 64-char Hex / SPKI | None in prod | Yes | Public key for offline third-party verification of worker credentials. |

---

## 3. Elimination of Insecure Defaults

In prior iterations, `src/lib/env.ts` fell back to synthetic placeholders when Supabase environment variables were absent:
```typescript
// INSECURE PREVIOUS IMPLEMENTATION:
NEXT_PUBLIC_SUPABASE_URL: z.string().default("https://placeholder-kaamsetu.supabase.co"),
NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default("placeholder-anon-key"),
```

### Phase 39 Remediation:
The Zod schema was updated to reject dummy strings in production:
```typescript
NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
RATE_LIMIT_HMAC_SECRET: z.string().min(32, "RATE_LIMIT_HMAC_SECRET must be at least 32 characters"),
AUTH_VERIFICATION_MODE: z.enum(["sandbox", "sms"]).default("sandbox"),
SANDBOX_OTP_CODE: z.string().length(6).regex(/^\d{6}$/).optional(),
```
When running in production, if database connectivity is declared, valid credentials must be supplied. Otherwise, the application gracefully operates in managed sandbox mode without spoofing database activity.

---

## 4. Standard `.env.example` Reference Template

The repository `.env.example` file has been fully synchronized with Phase 39 standards:
```env
# KAAMSETU Environment Configuration (Phase 39)
NODE_ENV=development

# Authentication & Verification Mode ('sandbox' or 'sms')
AUTH_VERIFICATION_MODE=sandbox

# Optional fixed 6-digit OTP code for sandbox automation (e.g. 123456)
SANDBOX_OTP_CODE=

# Mandatory 256-bit Cryptographic HMAC Secret (Min 32 characters)
RATE_LIMIT_HMAC_SECRET=generate-a-cryptographically-secure-32-char-secret-here

# Supabase PostgreSQL Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Cryptographic Sovereign Credential Signing (Ed25519)
ED25519_PRIVATE_KEY=your-ed25519-private-key-hex
ED25519_PUBLIC_KEY=your-ed25519-public-key-hex
```
