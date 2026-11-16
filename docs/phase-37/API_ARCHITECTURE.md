# KAAMSETU — API ARCHITECTURE SPECIFICATION

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Phase:** 37 — Scalable Architecture, Codebase Restructuring & Technical Debt Elimination  
**Status:** Certified & Grounded in Repository

---

## 1. Architectural Principles

KAAMSETU's API layer is built on the Next.js App Router (`src/app/api/`) and adheres to the following principles:

1. **Lightweight HTTP Controllers:** Route handlers (`route.ts`) act solely as controllers that parse requests, validate authentication/authorization, delegate business logic to the Domain Service layer (`src/server/services/`), and format the response envelope.
2. **Unified Response Envelope:** All successful and error responses adhere to the standard `ApiResponse<T>` contract.
3. **Fail-Closed Security:** Routes require explicit authentication (`requireAuth()`) and role verification (`requireUserRole()`). Unauthenticated or unauthorized callers receive immediate `401` or `403` responses.
4. **Permanent Constitutional Invariants:** Commission deductions on worker earnings are rejected at both API and Service boundaries.

---

## 2. Standard Response Envelope (`ApiResponse<T>`)

### 2.1 Successful Response Schema

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "message": "Resource retrieved successfully",
    "requestId": "req_1710582000000_abc123",
    "timestamp": "2026-11-16T12:00:00.000Z",
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### 2.2 Error Response Schema

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid Indian mobile phone number",
    "requestId": "req_1710582000000_abc123",
    "timestamp": "2026-11-16T12:00:00.000Z",
    "details": {
      "field": "phone",
      "received": "12345"
    }
  }
}
```

---

## 3. Error Classification & HTTP Status Codes

| Error Class | Error Code | HTTP Status | Description |
| :--- | :--- | :--- | :--- |
| `ValidationError` | `VALIDATION_ERROR` | `400` | Invalid request payload, schema validation failure, or malformed parameters |
| `AuthenticationError` | `UNAUTHENTICATED` | `401` | Missing, expired, or invalid session cookie or credentials |
| `AuthorizationError` | `FORBIDDEN` | `403` | Authenticated user lacks required role or ownership permissions |
| `NotFoundError` | `NOT_FOUND` | `404` | Requested database record, worker profile, or endpoint not found |
| `ConflictError` | `CONFLICT` | `409` | Resource already exists or unique constraint violation (e.g. duplicate slug) |
| `RateLimitError` | `RATE_LIMITED` | `429` | Request threshold exceeded; client must back off |
| `ExternalServiceError` | `EXTERNAL_SERVICE_ERROR` | `502` | Downstream dependency failure (e.g. SMS provider, DigiLocker OAuth) |
| `DatabaseError` | `DATABASE_ERROR` | `500` | Unrecoverable database transaction or query error |
| `ConfigurationError` | `CONFIGURATION_ERROR` | `500` | Critical server environment variable missing or invalid in production |

---

## 4. Standard Route Handler Pattern

Every API route handler must follow this declarative pattern:

```typescript
import { NextRequest } from "next/server";
import { handleApiError, createSuccessResponse } from "@/lib/errors";
import { requireAuth, requireUserRole } from "@/server/auth";
import { WorkerIdentityService } from "@/server/services/worker-identity.service";
import { z } from "zod";

const requestSchema = z.object({
  slug: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Session verification (if protected)
    const user = await requireAuth();

    // 2. Request parsing & schema validation
    const { searchParams } = new URL(request.url);
    const { slug } = requestSchema.parse({ slug: searchParams.get("slug") });

    // 3. Delegate to domain service
    const profile = await WorkerIdentityService.getProfileBySlug(slug);

    // 4. Return standard response envelope
    return createSuccessResponse(profile, {
      message: "Profile retrieved successfully",
    });
  } catch (error) {
    // 5. Centralized error handling
    return handleApiError(error, request);
  }
}
```

---

## 5. Security & Invariant Enforcement

1. **Correlation IDs:** Every request receives a unique `requestId` via header `x-request-id` or generated timestamp prefix, propagated through logs and responses for traceability.
2. **Sanitized Errors in Production:** Stack traces and internal database errors are logged privately via `StructuredLogger` and sanitized before reaching client responses.
3. **Fail-Closed Secret Validation:** `RATE_LIMIT_HMAC_SECRET` is verified at startup via `envService.getRateLimitSecret()` to ensure rate limiters never fail open in production.
