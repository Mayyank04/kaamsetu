# KAAMSETU Phase 27 Cryptographic Key Custody & Rotation
## Key Management Inventory, Asymmetric Custody, Rotation Policies & Emergency Incident Procedures

**Evaluation Context:** November 2026  
**Security Level:** Production Assurance & Cryptographic Governance

---

## 1. Cryptographic Key Inventory

This inventory catalogs all cryptographic signing, verification, and encryption keys across KAAMSETU services without exposing private key material.

| Key ID | Algorithm | Purpose | Environment | Storage Mechanism | Creation Timestamp | Rotation Policy | Revocation Procedure | Owner Role | Exposure Status |
|---|---|---|---|---|---|---|---|---|---|
| `did:kaamsetu:issuer:kamrup-01#key-1` | Ed25519 (RFC 8032) | W3C Credential Signing | Staging / Pre-Prod | AWS KMS / Vault | 2026-10-01T00:00:00Z | Annual (365 days) | Flag status `rotated` in registry | Security Officer | None |
| `did:kaamsetu:issuer:kamrup-01#key-2` | Ed25519 (RFC 8032) | W3C Credential Signing | Staging / Pre-Prod | AWS KMS / Vault | 2026-11-15T00:00:00Z | Active | Set status `revoked` in registry | Security Officer | None |
| `did:kaamsetu:audit:checkpoint-key-1` | Ed25519 (RFC 8032) | Audit Chain Checkpoint Signing | Staging / Pre-Prod | Isolated Worker HSM | 2026-11-15T00:00:00Z | Semi-Annual | Emergency CRL update | Lead Architect | None |
| `did:kaamsetu:release:signer-phase27-01` | Ed25519 (RFC 8032) | Release Manifest Signing | Release Engineering | CI GPG/KMS Pipeline | 2026-11-15T18:00:00Z | Per Release Phase | Key revocation certificate | Release Engineer | None |
| `HMAC_KEY_V1` | HMAC-SHA256 (256-bit) | Offline QR Credential Signing | Staging / Local | Env Secret / Vault | 2026-06-01T00:00:00Z | Annual | `status = 'revoked'` in DB | Platform Admin | None |
| `HMAC_KEY_V2` | HMAC-SHA256 (256-bit) | Offline QR Credential Signing | Staging / Pre-Prod | Env Secret / Vault | 2026-11-15T00:00:00Z | Active | Rotate env secret | Platform Admin | None |
| `SUPABASE_SERVICE_ROLE_KEY` | HS256 JWT | Internal Database Backend Access | Backend Server | Server Environment Only | 2026-06-01T00:00:00Z | Controlled Rotation | Supabase Dashboard Reset | Database Admin | None |

---

## 2. Key Custody Invariants & Negative Auditing

An automated scan of all source code, test suites, and git history confirms:
1. **Zero Private Keys in Git History:** No PEM files, private keys, or unencrypted key blocks exist in any commit.
2. **Zero Signing Secrets in Client Bundles:** `NEXT_PUBLIC_*` environment variables never expose server secrets or private keys. The browser client bundles contain zero signing keys.
3. **Zero Production Credentials in Test Fixtures:** All test suites (`test:crypto`, `test:phase26`, `test:phase27`) use dynamically generated ephemeral in-memory keys or documented test vectors (`test-secret`).
4. **Zero Silent Fallback to Insecure Secrets:** Code asserts that in production environments, missing keys throw a fatal startup error rather than falling back to empty strings or default placeholders.

---

## 3. Key Compromise & Emergency Incident Procedures

### 3.1 Scenario 1: Suspected Private Key Compromise
1. **Detection:** Unauthorized credential reported, or private key suspected leaked.
2. **Immediate Action:** The Security Officer executes:
   ```sql
   UPDATE public.w3c_verifiable_credential_registry 
   SET status = 'suspended', revocation_reason = 'Key compromise containment'
   WHERE key_version = 'ed25519-v1';
   ```
3. **Public Registry Revocation:** The issuer DID document updates the verification method to `status: "revoked"`. All client verifications fail-closed immediately.
4. **Key Rollover:** Activate new key pair (`ed25519-v3`) in KMS and re-issue legitimate worker credentials via automated batch pipeline.

### 3.2 Scenario 2: Emergency HMAC Secret Invalidation
1. If an offline HMAC signing secret is leaked, update `KEY_RESOLUTION` in `credential-signer.ts` to flag version `v1` as `isRevoked: true`.
2. All online verification endpoints (`/verify/[registryId]`) immediately reject QR codes signed under `v1`.
3. Dispatch SMS alert to active workers instructing them to refresh their physical badge at the nearest district facilitation booth.
