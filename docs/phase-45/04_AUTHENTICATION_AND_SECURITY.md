# KAAMSETU — PHASE 45 AUDIT DOSSIER 04
# AUTHENTICATION & APPLICATION SECURITY DIRECTIVE

**Operating Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Authentication Policy:** Direct Account Creation (Zero OTP / SMS Dependency)  
**Security Standard:** OWASP Top 10 Web Application Compliance + Ed25519 Cryptographic Signatures  
**Status:** `VERIFIED WORKING`

---

## 1. Authentication Lifecycle & Zero-OTP Architecture

Phase 39.7 and Phase 40 eliminated the brittle SMS OTP architecture that caused persistent HTTP 503 errors on Vercel production:
- **Direct Registration (`/auth/register`):** Users create an account using phone number or email and a secure password.
- **Direct Login (`/auth/login`):** Users sign in with their registered credentials.
- **Session Tokens:** Sessions are maintained via cryptographically signed JWTs stored in secure, HttpOnly, SameSite cookies.
- **Phone Verification Disclosure:** Phones registered without SMS OTP are explicitly flagged in `profiles` as `phone_verification_status = 'not_verified'`. Unverified phones are never falsely represented as verified.

---

## 2. Row Level Security (RLS) Policy Audit

PostgreSQL Row-Level Security protects all tables against unauthorized access:

| Table | Policy Name | Permitted Operations | Security Boundary |
| :--- | :--- | :--- | :--- |
| `public.profiles` | `profiles_owner_access` | `SELECT, UPDATE` | User can only read and mutate their own profile record (`auth.uid() = id`). |
| `public.profiles` | `profiles_public_read` | `SELECT` | Public directory lookup for active accounts. |
| `public.worker_profiles` | `worker_profiles_public_read` | `SELECT` | Anyone can discover published workers (`is_published = true`). |
| `public.worker_profiles` | `worker_profiles_owner_write` | `ALL` | Full mutation restricted to profile owner (`auth.uid() = user_id`). |
| `public.credential_registry` | `credential_registry_public_read` | `SELECT` | Public verification permitted via tamper-evident `registry_id`. |
| `public.bookings` | `bookings_customer_manage` | `ALL` | Customers manage only their own initiated service bookings. |
| `public.bookings` | `bookings_worker_view` | `SELECT` | Workers can view bookings assigned to their profile. |
| `public.contractor_jobs` | `contractor_jobs_owner_manage` | `ALL` | Contractors manage only jobs they have authored. |

---

## 3. Cryptographic Invariants & Key Management

- **Asymmetric Signature Algorithm:** Ed25519 elliptic-curve digital signatures.
- **Private Key Isolation:** `CREDENTIAL_SIGNING_KEY` is maintained exclusively in server-side environment variables (`.env.local`), never bundled into client-side JavaScript or exposed in API responses.
- **Public Credential Verification:** Verification at `/verify/[registryId]` computes SHA-256 hash over canonical credential fields and validates the Ed25519 signature in real time.
