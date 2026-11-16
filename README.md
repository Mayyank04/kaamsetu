# KAAMSETU (कामसेतु)
## Vocational Digital Identity, Worker Protection & Trust Platform

> **"Every skill deserves to be seen, even without a degree."**  
> **"Your work. Your reputation. Your opportunities."**  
> Permanent Constitutional Invariant: `platform_commission_amount = 0.00` on artisan wages.  
> Certified Operating Classification: `CLASS_B_CONTROLLED_ROLLOUT`  
> Authorized Operating Geography: Guwahati Urban (Kamrup Metro, Assam) & Shillong Urban (East Khasi Hills, Meghalaya).

---

## 1. Product Overview

KAAMSETU is an institutional digital identity and worker empowerment platform designed for skilled craftspeople and trade professionals. The platform allows vocational artisans to document hands-on expertise, build an unforgeable reputation, receive direct customer bookings, and retain 100% of their earnings with permanent zero platform commission.

---

## 2. Platform Architecture (Phase 37 Modular Monolith)

KAAMSETU utilizes a strict, layered modular monolith architecture with domain-driven feature boundaries:

```text
                                  KAAMSETU SYSTEM ARCHITECTURE
                                  
   +--------------------+     +------------------------+     +-------------------------+
   |   Skilled Worker   |     |  Customer / Employer   |     |  Institutional Partner  |
   | (Voice/Web Profile)|     |  (Direct Booking/Hire) |     | (Skill Mission/Polytech)|
   +---------+----------+     +-----------+------------+     +------------+------------+
             |                            |                               |
             v                            v                               v
   +--------------------+     +------------------------+     +-------------------------+
   | Multilingual Voice |     | Geo-Fenced Discovery   |     | Cohort Management       |
   | Skill Extraction   |     | Guwahati & Shillong    |     | Outcome Verification    |
   +---------+----------+     +-----------+------------+     +------------+------------+
             |                            |                               |
             +----------------------------+-------------------------------+
                                          |
                                          v
   +-----------------------------------------------------------------------------------+
   |                             Next.js 15 App Router                                 |
   |   - Thin HTTP Route Handlers with Unified ApiResponse<T> Envelopes                |
   |   - Structured JSON Logging with Sensitive Secret & PII Redaction                 |
   |   - Fail-Closed Server Environment Validation (RATE_LIMIT_HMAC_SECRET)            |
   +--------------------------------------+--------------------------------------------+
                                          |
                                          v
   +-----------------------------------------------------------------------------------+
   |                          Modular Monolith Core Architecture                       |
   |   - Feature Modules (src/features/): Onboarding, Worker Identity, Bookings, Auth  |
   |   - Domain Services (src/server/services/): Business logic & invariant validation  |
   |   - Data Repositories (src/server/database/repositories/): Isolated DB access      |
   |   - Cryptographic Engine (src/lib/crypto/): Ed25519 W3C Verifiable Credentials   |
   |   - Permanent Zero-Commission Invariant Engine (platform_commission = 0.00)       |
   |   - Design System: Deep Forest Green (#153E35), Warm Sand, Warm Ivory (#F7F5F0)  |
   +--------------------------------------+--------------------------------------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
                   v                                             v
   +-------------------------------+             +-------------------------------------+
   |       Google Gemini AI        |             |        Supabase PostgreSQL          |
   |  - Multilingual AI Extraction |             |  - 100 Relational Tables            |
   |  - 7 Indian Languages         |             |  - 100% Row Level Security (RLS)    |
   |  - Transparent KaamScore      |             |  - Immutable Ledger & Consent Logs  |
   +-------------------------------+             +-------------------------------------+
```

### Directory Structure

```
src/
├── app/                        # Next.js App Router (UI Pages & Thin API Route Handlers)
│   ├── api/                    # Thin HTTP controllers delegating to Domain Services
│   └── (routes)/               # Role-based pages and layouts
├── components/                 # Presentation Layer (Design System & Tactile UI)
├── features/                   # Domain Feature Modules (Vertical Slice Architecture)
│   ├── authentication/         # Auth state, OTP lifecycle, and session verification
│   ├── bookings/               # Direct service bookings and zero commission state
│   ├── contractors/            # Enterprise roster management & billing calculations
│   ├── onboarding/             # Vernacular voice intake schemas & draft persistence
│   └── worker-identity/        # Sovereign credentials and public artisan discovery
├── lib/                        # Cross-Cutting Shared Libraries
│   ├── errors/                 # Centralized typed error hierarchy & API envelopes
│   ├── utilities/              # Indian phone normalization & shared utilities
│   ├── crypto/                 # Ed25519 asymmetric signing & JCS canonicalization
│   └── geo/                    # Controlled rollout geographic authorization
├── server/                     # Backend Architecture (Modular Monolith Core)
│   ├── auth/                   # Server session verification & RBAC guards
│   ├── configuration/          # Fail-closed environment validation
│   ├── database/               # Data Access Layer & Repositories
│   │   └── repositories/       # Worker, Booking, Contractor, Institution Repositories
│   ├── logging/                # Structured JSON logger with sensitive data redaction
│   └── services/               # Core Domain Services
└── types/                      # TypeScript definitions & Supabase DB types
```

For complete technical specifications, see [ARCHITECTURE.md](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/ARCHITECTURE.md) and [docs/phase-37/](file:///Users/mayankgautam/Desktop/stitch_kaamsetu_digital_identity_platform/docs/phase-37/).

---

## 3. Technology Stack

Verified against repository dependencies:

| Layer | Component | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `15.1.7` | Server Components, Route Handlers, SSR |
| **Runtime** | React / Node.js | `19.0.0` / Node `20+` | User interface and async runtime |
| **Styling** | Tailwind CSS | `3.4.17` | Editorial design system tokens |
| **Database** | PostgreSQL via Supabase | `15.x` | 100 tables, 100% RLS coverage |
| **Cryptography** | Node Crypto (Ed25519) | Native | W3C Verifiable Credentials, RFC 8785 JSON |
| **AI / Voice** | Google GenAI SDK | `^3.3.0` | Voice transcription & skill extraction |
| **QR Protocol** | QRCode Engine | `1.5.4` | High-density camera-scannable offline tokens |
| **Validation** | Zod | `3.24.2` | Runtime request body and schema validation |

---

## 4. Key Capabilities & User Roles

### User Roles
- **Worker / Artisan:** Voice-assisted onboarding, skill documentation, work portfolio, direct bookings, transparent payout timeline, grievance reporting, and zero-penalty workplace safety withdrawal.
- **Customer:** Regional search and discovery within authorized boundaries, credential inspection via scannable QR, booking lifecycle management, and verified review submission.
- **Contractor / Employer:** Project workforce staffing, crew management, enterprise billing breakdown with 18% GST, and zero-commission wage disbursement confirmations.
- **Institution (Skill Missions, ITIs):** Trainee cohort tracking, practical assessment logging, and privacy-preserving outcome exports.
- **Administrator / Moderator:** Non-partisan dispute resolution, review moderation appeal handling, and audit log inspection.

### Core Capabilities
1. **Multilingual Voice Onboarding:** Speak naturally in Hindi, Assamese, Bengali, Tamil, Telugu, Marathi, or English. Gemini AI extracts structured trade claims; skills remain `self_declared` or `voice_submitted` until independently confirmed.
2. **Permanent Zero Commission:** 100% of customer payments belong to the working artisan (`platform_commission_amount = 0.00`). Database triggers and server repositories reject commission deductions.
3. **W3C Verifiable Credentials:** Ed25519-signed credentials with status list revocation and 72-hour offline validity window.
4. **Strict Regional Geofencing:** Operations are confined to authorized Class B zones: **Guwahati Urban** (Assam) and **Shillong Urban** (Meghalaya). Out-of-bounds requests are rejected with HTTP 403.
5. **Worker Retaliation Shield:** 1-star reviews submitted during open wage disputes are automatically quarantined to prevent customer coercion.

---

## 5. Prerequisites & Local Setup

### Prerequisites
- Node.js `20.x` or `22.x` LTS
- npm `10.x`
- PostgreSQL 15+ (optional for local mock evaluation)

### Quickstart
```bash
# 1. Clone repository
git clone https://github.com/Mayyank04/kaamsetu.git
cd kaamsetu

# 2. Checkout Phase 37 branch
git checkout phase-37-architecture-modernization

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env.local

# 5. Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 6. Testing & Quality Verification

KAAMSETU maintains a multi-tier automated test suite:

```bash
# Execute Phase 37 Architecture & Service Modernization Suite
npm run test:phase37

# Execute Phase 36.1 Anti-AI Design & Human-Centred UI Suite
npm run test:phase36.1

# Execute Phase 35.2 Production Remediation & Auth Incident Suite
npm run test:phase35.2

# Execute Phase 35.1 Addendum OTP & Onboarding Reliability Suite
npm run test:phase35.1:addendum

# Execute Phase 35.1 Core Security & Layered Protection Suite
npm run test:phase35.1

# Run TypeScript static type check (0 errors)
npx tsc --noEmit

# Execute Next.js Production Build
npm run build
```

---

## 7. Operational Status & External Gates

| Institutional Gate | Status | Operational Bound | Standard Required to Unblock |
| :--- | :---: | :---: | :--- |
| **TSDM (Tripura)** | `UNDER_REVIEW` | Tripura **BLOCKED** | State Cabinet notification & bilateral MoU |
| **ONDC / ONest** | `APPROVED_PENDING_EXECUTION` | BPP Broadcast **BLOCKED** | Dual-control air-gapped Ed25519 root key ceremony |
| **EPC Tripartite** | `UNDER_REVIEW` | Heavy Construction **FROZEN** | General counsel contract execution & underwritten indemnity |
| **Direct Bank Settlement** | `UNVERIFIED` | Bank Settlement **UNVERIFIED** | Live production bank API clearing credentials |
| **Production DR Failover** | `UNVERIFIED` | Production DR **UNVERIFIED** | Scheduled CAB-approved live maintenance failover drill |

Certified Operating Classification: **`CLASS_B_CONTROLLED_ROLLOUT`** (Class A National Production promotion objectively disallowed).

---

## 8. License & Governance

KAAMSETU is governed under strict anti-masking and worker protection protocols.  
All worker wage entitlements are non-commissionable and inviolable.
