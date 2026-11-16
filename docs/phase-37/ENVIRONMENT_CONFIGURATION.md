# KAAMSETU — PHASE 37 ENVIRONMENT CONFIGURATION GUIDE

**Programme:** KAAMSETU Digital Identity & Worker Empowerment Platform  
**Workstream:** Phase 37 — Scalable Architecture & Environment Hardening  
**Document Reference:** `docs/phase-37/ENVIRONMENT_CONFIGURATION.md`  
**Date:** 16 November 2026  

---

## 1. Principles of Environment Security

1. **Strict Partitioning of Public vs Secret Tokens:** Variables prefixed with `NEXT_PUBLIC_` are bundled into browser client code. They must never contain service role keys, HMAC secrets, or private keys.
2. **Fail-Closed Security Barriers:** In production (`NODE_ENV === "production"`), missing cryptographic keys (`RATE_LIMIT_HMAC_SECRET`, `ED25519_ISSUER_PRIVATE_KEY_PEM`) immediately block initialization and reject unverified requests without leaking variable names.
3. **Zero Secrets in Version Control:** `.env.example` contains only structural placeholders. Real secrets are managed via Vercel Project Settings or secure environment managers.
4. **Permanent Invariant Anchoring:** `PLATFORM_COMMISSION_AMOUNT=0.00` and `OPERATING_CLASSIFICATION=CLASS_B_CONTROLLED_ROLLOUT` are validated on startup.

---

## 2. Environment Variable Inventory

### 2.1 Public Client Variables (Browser Accessible)
| Variable Name | Required | Type / Format | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | URL (`https://*.supabase.co`) | Public Supabase endpoint for client auth and subscriptions. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | JWT / Anon Key | Anonymous client key guarded by Row Level Security (RLS). |
| `NEXT_PUBLIC_APP_URL` | Yes | URL (`http://localhost:3000` or production domain) | Canonical platform URL for redirects and QR verification links. |
| `NEXT_PUBLIC_ENABLE_DEMO_AUTH` | Optional | Boolean string (`"true"` / `"false"`) | Enables demo persona switcher in local development/staging. Strictly false in production. |

### 2.2 Server-Only Secret Variables (Never Exposed to Browser)
| Variable Name | Required in Prod | Minimum Entropy | Description |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Secret JWT | Bypasses RLS strictly for server-side admin operations (e.g. OTP verification). |
| `DATABASE_URL` | Optional | PostgreSQL Connection URL | Direct database connection for backend verification scripts and migrations. |
| `RATE_LIMIT_HMAC_SECRET` | **Yes (P0)** | 32+ characters (256 bits) | High-entropy secret used to hash IP and phone keys for privacy-preserving rate limits. |
| `ED25519_ISSUER_PRIVATE_KEY_PEM` | Yes | 256-bit PKCS#8 PEM | Sovereign issuer private key for signing W3C Verifiable Credentials. |
| `ED25519_ISSUER_PUBLIC_KEY_PEM` | Yes | SPKI PEM | Public verification key paired with the issuer private key. |
| `ACTIVE_SIGNING_KEY_VERSION` | Yes | String (`v2026.1`) | Active cryptographic key version for key rotation management. |
| `REVOKED_SIGNING_KEY_VERSIONS` | Optional | Comma-delimited list | List of retired or compromised key versions rejected by verifiers. |
| `GEMINI_API_KEY` | Yes | Google GenAI API Key | Server-side key for multilingual voice transcription and skill extraction. |

### 2.3 Permanent Operational Constants
| Constant Name | Value | Purpose |
|---|---|---|
| `PLATFORM_COMMISSION_AMOUNT` | `"0.00"` | Permanent zero-commission invariant on worker wages. |
| `OPERATING_CLASSIFICATION` | `"CLASS_B_CONTROLLED_ROLLOUT"` | Restricts active dispatch to authorized urban pilot zones. |
| `PERMITTED_OPERATING_REGIONS` | `"Guwahati Urban (Kamrup Metro, Assam),Shillong Urban (East Khasi Hills, Meghalaya)"` | Authorized geographic pilot areas. |

---

## 3. Centralized Validation Architecture

Environment validation is centralized in `src/server/configuration/environment.ts`:
- Server startup invokes `envService.get()`.
- Rate-limiting calls `envService.getRateLimitSecret()`.
- In development/test mode, safe fallback values are provided so CI/CD unit tests run offline without mocking.
- In production, missing secrets throw `ConfigurationError` and fail closed safely.
