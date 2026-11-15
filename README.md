# KAAMSETU (कामसेतु)
## Vocational Digital Identity, Worker Protection & Trust Platform

> **"Every skill deserves to be seen, even without a degree."**  
> **"Your work. Your reputation. Your opportunities."**  
> Permanent Constitutional Invariant: `platform_commission_amount = 0.00` on worker wages.  
> Certified Operating Classification: `CLASS_B_CONTROLLED_ROLLOUT`  
> Authorized Operating Geography: Guwahati Urban (Kamrup Metro, Assam) & Shillong Urban (East Khasi Hills, Meghalaya).

---

## 1. Product Overview

KAAMSETU is an institutional digital identity and worker empowerment platform designed for skilled craftspeople and trade professionals. The platform allows vocational artisans to document hands-on expertise, build an unforgeable reputation, receive direct customer bookings, and retain 100% of their earnings with permanent zero platform commission.

---

## 2. Platform Architecture

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
   |   - Server-Side Role-Based Authorization & Tenant Isolation Layer                 |
   |   - Ed25519 W3C Verifiable Credentials & Scannable Offline QR Protocol            |
   |   - Permanent Zero-Commission Invariant Engine (platform_commission = 0.00)       |
   |   - Design System: Deep Forest Green (#1E3A2F), Warm Sand, Editorial Ivory        |
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
- **Contractor / Employer:** Project workforce staffing, crew management, zero-commission wage disbursement confirmations.
- **Institution (Skill Missions, ITIs):** Trainee cohort tracking, practical assessment logging, and privacy-preserving outcome exports.
- **Administrator / Moderator:** Non-partisan dispute resolution, review moderation appeal handling, and audit log inspection.

### Core Capabilities
1. **Multilingual Voice Onboarding:** Speak naturally in Hindi, Assamese, Bengali, Tamil, Telugu, Marathi, or English. Gemini AI extracts structured trade claims; skills remain `self_declared` or `voice_submitted` until independently confirmed.
2. **Permanent Zero Commission:** 100% of customer payments belong to the working artisan. Database triggers block clawbacks or retrospective deductions.
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

# 2. Checkout Phase 35 branch
git checkout phase-35-remediation-and-product-transformation

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

```bash
# Execute Phase 35 Security & Authorization Test Suite (33/33 Tests)
npm run test:phase35

# Execute Supabase Database & Security Verification Suite (275/275 Tests)
npm run verify:db

# Run TypeScript static type check (0 errors)
npx tsc --noEmit

# Execute Next.js Production Build (112/112 Routes compiled)
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
