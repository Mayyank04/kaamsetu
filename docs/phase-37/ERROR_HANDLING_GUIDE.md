# KAAMSETU — PHASE 37 ERROR HANDLING GUIDE

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 37 — Centralized Error Architecture & API Reliability  
**Document Reference:** `docs/phase-37/ERROR_HANDLING_GUIDE.md`  
**Date:** 16 November 2026  

---

## 1. Principles of Error Governance

1. **Zero Secret & Internals Leakage:** Never expose database error strings, table names, SQL queries, stack traces, or environment variable names in client responses.
2. **Standardized Response Envelope:** Every API route returns an `ApiResponse<T>` with a consistent schema, correlation `requestId`, and ISO timestamp.
3. **Structured Server Logging:** Detailed technical stack traces and unhandled exceptions are logged server-side via `src/server/logging/logger.ts` with automatic redaction of sensitive tokens and OTPs.
4. **Idempotency Safeguard:** Never automatically retry non-idempotent financial transactions or payout disbursements without explicit counterparty reconciliation.

---

## 2. Typed Error Classification Matrix

| Error Class | HTTP Status | Code | Usage Context |
|---|---|---|---|
| `ValidationError` | 400 | `VALIDATION_ERROR` | Schema validation failures (Zod parsing, invalid phone format). |
| `AuthenticationError` | 401 | `UNAUTHENTICATED` | Missing session token, expired OTP, invalid mobile challenge. |
| `AuthorizationError` | 403 | `FORBIDDEN` | Role mismatch (worker accessing contractor data), out-of-bounds geographic requests. |
| `NotFoundError` | 404 | `NOT_FOUND` | Profile, booking, cohort, or project record does not exist. |
| `ConflictError` | 409 | `CONFLICT` | Concurrent state transition conflict (e.g. payout already finalized). |
| `RateLimitError` | 429 | `RATE_LIMIT_EXCEEDED` | Request rate exceeded; includes remaining lockout seconds. |
| `ExternalServiceError` | 502 | `GATEWAY_ERROR` | Upstream failure communicating with Gemini, SMS gateway, or DigiLocker. |
| `DatabaseError` | 500 | `DATABASE_ERROR` | Database connection or transaction failure. |
| `ConfigurationError` | 500 | `CONFIGURATION_ERROR` | Missing server secret key in production (fails closed). |

---

## 3. Implementation Code Patterns

### 3.1 Standard Route Handler Pattern
```typescript
import { NextResponse } from "next/server";
import { handleApiError, createSuccessResponse } from "@/lib/errors";
import { myRequestSchema } from "@/schemas/my-feature.schema";
import { MyDomainService } from "@/server/services/my-domain.service";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const validated = myRequestSchema.parse(json);
    
    const result = await MyDomainService.execute(validated);
    return createSuccessResponse(result, undefined, 201);
  } catch (error) {
    return handleApiError(error, req);
  }
}
```

### 3.2 Client Error Handling Pattern
```typescript
const response = await fetch("/api/worker/onboarding/save", { ... });
const result: ApiResponse<SavedProfile> = await response.json();

if (!result.success) {
  // Access typed error payload safely
  const { code, message, details } = result.error;
  toast.error(message);
  return;
}

// Access typed data safely
const profile = result.data;
```
