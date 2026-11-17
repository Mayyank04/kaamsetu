# KAAMSETU — PHASE 39.6 VERCEL DEPLOYMENT CONFIGURATION

**Target Domain:** `https://kaamsetu-neon.vercel.app`  
**Git Branch:** `phase-39-6-vercel-auth-infrastructure-recovery`  
**Framework:** Next.js (App Router)

---

## 1. Required Vercel Environment Variables Checklist

Configure these in the Vercel Project Settings (`Settings -> Environment Variables`):

| Variable Name | Environment Scope | Sensitivity | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Public | Remote Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Public | Anonymous client-side Supabase token |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | **Secret** | Admin service client token for RPC & rate limits |
| `RATE_LIMIT_HMAC_SECRET` | Production, Preview | **Secret** | 256-bit secret for rate-limit key hashing & session tokens |
| `AUTH_VERIFICATION_MODE` | Production, Preview | Plaintext | `sandbox` (or `twilio` when telephony is activated) |
| `GEMINI_API_KEY` | Production, Preview | **Secret** | Google Generative AI API key for voice extraction |
| `GEMINI_MODEL` | Production, Preview | Plaintext | `gemini-2.0-flash` (or candidate chain fallback) |

---

## 2. Critical Configuration Directives

1. **Do NOT enable `ENABLE_IN_MEMORY_RATE_LIMIT_MOCK` on Vercel:**
   - In-memory rate limiting violates multi-instance serverless concurrency contracts. In production, requests will fail closed if the database is unreachable, guaranteeing security against brute-force attacks.
2. **Secret Entropy Requirements:**
   - Ensure `RATE_LIMIT_HMAC_SECRET` is at least 32 characters of high-entropy random material (e.g. `openssl rand -hex 32`).
3. **Branch Protection:**
   - Deploy only after Supabase SQL migration `20261117_master_infrastructure_repair.sql` has been executed on the production database.
