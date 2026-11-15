# KAAMSETU — PHASE 28 PRODUCTION BOUNDARY REGISTER
## Infrastructure Classification, Network Segregation & Environment Protection

**Evaluation Context:** December 2026  
**Auditor:** Principal Infrastructure & Cloud Reliability Engineer  
**Service Implementation:** `src/lib/infrastructure/production-boundary-service.ts`

---

## 1. Environment Segregation Architecture

KAAMSETU enforces strict physical, logical, and cryptographic boundaries between its operating environments. Staging testbeds, local development sandboxes, and production clusters do not share data, credentials, network routes, or encryption keys.

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     LOCAL / CI SANDBOX          │       │      STAGING SIMULATION         │
│  - Mock DB & In-Memory Secrets  │       │  - AWS Mumbai ap-south-1        │
│  - Ephemeral Test Keys          │       │  - Staging ONDC / Test Gateway  │
│  - Synthetic Fixtures           │       │  - Quarterly DR Drills Executed │
└─────────────────────────────────┘       └─────────────────────────────────┘
                                                           ▲
                                                           │ (STRICT BOUNDARY GATE)
                                                           ▼
                                          ┌─────────────────────────────────┐
                                          │      PRODUCTION CLUSTER         │
                                          │  - Dedicated VPC & Multi-AZ RDS │
                                          │  - CloudHSM Ed25519 Keys        │
                                          │  - Live Banking Webhooks        │
                                          │  - Status: UNVERIFIED LIVE DR   │
                                          └─────────────────────────────────┘
```

---

## 2. Component-by-Component Classification

| Infrastructure Component | Environment | Region / Provider | Data Classification | Security Boundary |
| :--- | :--- | :--- | :--- | :--- |
| **Application Hosting** | Production | AWS Mumbai (`ap-south-1`) | Confidential | Auto-scaling ECS Fargate cluster in private subnets |
| **Database (PostgreSQL)** | Production | AWS RDS Multi-AZ (`ap-south-1`)| Restricted / PII | 100 base tables with 100% RLS enabled; encrypted at rest (AES-256) |
| **Blob Storage (S3)** | Production | AWS S3 (`ap-south-1`) | Restricted (KYC/Dossier)| Private buckets with KMS SSE; public access 100% blocked |
| **Authentication Service** | Production | Supabase Auth (Private VPC) | Confidential | JWT with RS256; short-lived access tokens (15m expiry) |
| **Key Management (KMS)** | Production | AWS CloudHSM / KMS | Secret | Dedicated production root keys; staging keys prohibited ([TEST 77]) |
| **Payment Gateway** | Production | Razorpay Production Gateway | Financial Sensitive | Webhook IP allowlisting + SHA-256 HMAC signature verification |
| **DNS & Edge CDN** | Production | Cloudflare Enterprise | Public Edge | Strict TLS 1.3 only; WAF rules defending against DDOS/botnets |
| **Staging DR Testbed** | Staging | AWS Mumbai (`ap-south-1`) | Synthetic / Sanitized | Strictly segregated testbed; drill code `DR-DRILL-2026-Q4-STG` |

---

## 3. Strict Boundary Enforcements

As verified in [TEST 75] and [TEST 76] of `test:phase28`:
- **Change Advisory Board (CAB) Gate:** Running a production disaster recovery drill without a signed CAB approval code and designated downtime window is hard-blocked by software policy.
- **Cross-Environment Key Prohibition:** Staging private keys cannot be used to sign production credentials or presentations.
- **Sensitive Field Redaction:** In all environments, raw 12-digit Aadhaar numbers and private bank account numbers are redacted in test logs, traces, and public views ([TEST 78], [TEST 91]).
