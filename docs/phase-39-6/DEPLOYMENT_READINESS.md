# PRODUCTION DEPLOYMENT READINESS AUDIT

**Document ID:** `KAAMSETU-DOC-39-6-11`  
**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Target Domain:** `https://kaamsetu-neon.vercel.app`  
**Status:** `IMPLEMENTED — NOT REMOTELY VERIFIED`

---

## 1. Pre-Deployment Configuration Checklist

Before certifying deployment on Vercel and remote Supabase instances, ensure the following environment variables are properly configured in Vercel project settings:

```env
# Database & Remote Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE-ROLE-KEY]

# Cryptographic Rate-Limiter Secret (Must be >= 256 bits)
RATE_LIMIT_HMAC_SECRET=[MIN-32-CHAR-CRYPTOGRAPHIC-SECRET]

# Operating Verification Mode
AUTH_VERIFICATION_MODE=sandbox

# Gemini AI Extraction Model
GEMINI_API_KEY=[GOOGLE-AI-STUDIO-KEY]
GEMINI_MODEL=gemini-3.8-flash
```

---

## 2. Supabase Migration Verification

Ensure the following SQL migrations are applied in the remote Supabase database:
- `supabase/migrations/20261117_check_and_increment_rate_limit.sql`
- `supabase/migrations/20261117_verify_and_consume_otp.sql`
- `supabase/migrations/20261117_register_user_account.sql`

RPC functions must have privileges granted to `service_role` and strictly revoked from `anon` and `authenticated`.
