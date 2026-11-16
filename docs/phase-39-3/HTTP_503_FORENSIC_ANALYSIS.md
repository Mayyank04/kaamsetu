# KAAMSETU — PHASE 39.3 HTTP 503 & INFRASTRUCTURE FORENSIC ANALYSIS
## Forensic Deconstruction of Potential 503 Causes, Root Cause Confirmation & Graceful Resilience

**Date:** 17 November 2026  
**Document:** `docs/phase-39-3/HTTP_503_FORENSIC_ANALYSIS.md`  
**Classification:** Critical Infrastructure Audit  

---

## 1. Candidate Failure Mode Analysis

The master directive specified 12 distinct failure hypotheses for the generic error displayed in the screenshot:
*"We're temporarily unable to process this request. Please try again shortly."*

| Hypothesis # | Candidate Cause | Verification Finding | Verdict |
|--------------|-----------------|----------------------|---------|
| 1 | `check_and_increment_rate_limit` missing in remote DB (`PGRST202`) | Live test against Supabase confirmed RPC missing from schema cache | **ACTIVE CONTRIBUTOR** (when remote DB called) |
| 2 | `otp_challenges` missing in remote DB (`PGRST205`) | Live test against Supabase confirmed table missing from schema cache | **ACTIVE CONTRIBUTOR** (when remote DB called) |
| 3 | Route handler uncaught `ZodError` | `phoneAuthSchema.parse(json)` threw on invalid carrier prefix `5456565656`, crashing to catch block | **PRIMARY IMMEDIATE CAUSE OF USER SCREENSHOT** |
| 4 | Client UI accepting invalid mobile without carrier prefix guard | Client accepted `5456565656` and kept submit button enabled | **PRIMARY IMMEDIATE CAUSE OF USER SCREENSHOT** |
| 5 | HMAC key secret missing / mismatch | `RATE_LIMIT_HMAC_SECRET` is configured in `.env.local` | Not active (configured) |
| 6 | Twilio / Telecom credentials failure | `AUTH_VERIFICATION_MODE=sandbox` is isolated from telecom gateways | Not active (sandbox mode) |
| 7 | Next.js API route timeout | Endpoint responded within < 50ms | Not active |
| 8 | CORS / Origin rejection | Request is same-origin | Not active |
| 9 | CSP header blocking fetch | CSP headers allow `/api/*` | Not active |
| 10 | Middleware redirect loop | Auth routes exempt from middleware redirects | Not active |
| 11 | Cookie size / header overflow | No cookie overflow observed | Not active |
| 12 | Supabase connection pool exhaustion | Connection pool active | Not active |

---

## 2. Immediate Root Cause Identified

When the user entered `5456565656` on `/onboarding`:
1. The frontend did not validate the Indian carrier prefix `[6-9]`.
2. The user submitted `5456565656`.
3. `/api/auth/otp/send` called `phoneAuthSchema.parse(json)`.
4. `phoneAuthSchema` rejected the string, throwing a `ZodError`.
5. The route handler had no typed Zod error block; it caught the exception in generic `catch (err)` and responded with HTTP 500:
   `{ success: false, message: "We're temporarily unable to process this request. Please try again shortly." }`.
6. The client modal displayed the red alert box and changed the button to `Try Again`, blocking the user.

---

## 3. Structural Remediation

1. **Client-Side Validation:** The UI validates `validateIndianMobile` in real-time. If the number does not match `^[6-9]\d{9}$`, an inline error is displayed and the submission button is disabled.
2. **Server-Side Safe Parsing:** The route handler now uses `.safeParse()`. If invalid, it returns `HTTP 400 Bad Request` with `{ code: "INVALID_PHONE", message: issue.message }`. Zero backend rate-limit or database calls are initiated.
3. **Database Forward Migration:** Created migration `20261117000033_phase39_3_rate_limit_and_otp_infrastructure.sql` containing canonical definitions for `auth_rate_limits`, `check_and_increment_rate_limit`, `otp_challenges`, indexes, RLS, and `verify_and_consume_otp`.
4. **Resilient Offline/Sandbox Fallback:** Memory-backed rate limiting and challenge persistence provide seamless testing even when remote databases are temporarily unreachable.
5. **Reassuring Error Messaging:** In the event of an authentic 503 database outage, the user is informed:
   *"Verification is temporarily unavailable. Your profile draft has been saved. Please try again later."*
