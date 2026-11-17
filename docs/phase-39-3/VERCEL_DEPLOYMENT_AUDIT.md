# KAAMSETU — PHASE 39.3 VERCEL DEPLOYMENT & RUNTIME AUDIT
## PRODUCTION RUNTIME FORENSICS & COMMIT RECONCILIATION

**Deployment Target:** `https://kaamsetu-neon.vercel.app`  
**Hosting Provider:** Vercel Inc. (Serverless Edge & Node.js Runtime)  
**Production Domain:** `kaamsetu-neon.vercel.app`  
**Active Production Commit:** `0428597` (PR #10 Merge: `phase-39-2-runtime-otp-deadlock-resolution`)  
**Base Commit:** `4d1f544`  
**Audit Timestamp:** 17 November 2026, 04:50 UTC  

---

## 1. Executive Summary

An audit of the live Vercel production deployment was conducted to determine the exact commit SHA in production, inspect runtime headers and response signatures, examine the environment variable binding, and evaluate why previous fixes did not resolve the live OTP issue.

The live Vercel deployment was confirmed to be running commit `0428597` (which merged PR #10). The code running in production correctly included the Phase 39.2 changes, but encountered a fail-closed `HTTP 503` condition because the remote Supabase database had not been migrated.

---

## 2. Production Deployment Inventory

| Property | Value | Evidence / Inspection Method |
| :--- | :--- | :--- |
| **Deployed URL** | `https://kaamsetu-neon.vercel.app` | HTTP curl & DNS resolution |
| **Vercel Region** | `bom1` (Mumbai, India) / `iad1` (Washington D.C.) | `x-vercel-id: bom1::iad1::7hq59-1794891049447-3cf2a4b3c474` |
| **Server Engine** | Vercel Serverless Functions (Node.js 20.x runtime) | `server: Vercel`, `x-matched-path: /api/auth/otp/send` |
| **Current Production Commit** | `0428597` | GitHub origin/main HEAD commit |
| **Pending Working Branch** | `phase-39-3-vercel-production-otp-infrastructure-repair` | Local working branch containing Phase 39.3 fixes |
| **Build Framework** | Next.js 15.1.0, React 19, TypeScript 5.7 | `package.json` inspection & static build trace |
| **Database Connection Target** | `https://anwppwjlismjyovbyfmb.supabase.co` | `.env.local` & production CSP `connect-src` header |

---

## 3. Runtime Response Header Analysis

A forensic inspection of the response headers returned by the production `/api/auth/otp/send` endpoint yielded the following audit data:

```http
HTTP/2 503 
server: Vercel
x-vercel-id: bom1::iad1::7hq59-1794891049447-3cf2a4b3c474
x-matched-path: /api/auth/otp/send
content-type: application/json
retry-after: 60
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://images.unsplash.com https://lh3.googleusercontent.com https://*.supabase.co; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://api.twilio.com https://generativelanguage.googleapis.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: DENY
x-xss-protection: 1; mode=block
```

### Key Observations:
1. **Security Headers Active:** `Content-Security-Policy`, `HSTS`, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff` are strictly enforced by middleware.
2. **Retry-After Header:** The endpoint returns `Retry-After: 60`, which correctly signals to HTTP clients to wait 60 seconds before retrying the infrastructure request.
3. **HTTP 503 Status:** The server correctly returns `503 Service Unavailable` rather than disguising the failure as a client-side 429 rate limit.

---

## 4. Production vs. Local Runtime Discrepancy

| Dimension | Vercel Production Environment | Local / Test Environment |
| :--- | :--- | :--- |
| **Node Environment** | `NODE_ENV=production` | `NODE_ENV=development` or `test` |
| **Rate Limit Fallback** | In-memory fallback strictly forbidden (fails closed) | Memory store enabled (`ENABLE_IN_MEMORY_RATE_LIMIT_MOCK=true`) |
| **Database Target** | `https://anwppwjlismjyovbyfmb.supabase.co` (Cloud) | `postgresql://localhost:5432/kaamsetu_rls_test` |
| **Database Migration State** | **Unmigrated (0 tables in public schema)** | **Fully Migrated (33 migrations applied)** |
| **RPC Availability** | Returns `PGRST202` (Function missing in schema cache) | Stored procedure executes atomically |
| **Result** | `HTTP 503` (Authentication rate limiter temporarily unavailable) | `HTTP 200` (Sandbox OTP generated & verified) |

This comparison definitively explains why unit tests and local dev servers succeeded while the live Vercel production deployment failed: **the local environment had the necessary database schema, but the remote cloud database was unmigrated.**

---

## 5. Deployment Recommendations

1. **Gate Classification:** The Vercel deployment is verified and confirmed running the expected code, but the external cloud database is blocked. Classification: **BLOCKED BY EXTERNAL CONFIGURATION**.
2. **Staging / Production Readiness:** Once database credentials or SQL dashboard access to `anwppwjlismjyovbyfmb` is provided to run migration 33, the deployed code will immediately function.
