# KAAMSETU (कामसेतु)
### India's Universal Sovereign Digital Skill Identity Platform

> **"Every skill deserves to be seen, verified, and honored."**  
> KAAMSETU is an institutional digital identity and trust protocol designed for India's 450M+ skilled blue-collar, trade, and informal craftspeople. By combining multilingual voice attestation powered by Google Gemini, DigiLocker / Aadhaar identity anchors, a transparent **KAAMSCORE™** trust index, and cryptographically verified customer contracting records, KAAMSETU transforms informal craft mastery into a universally portable, sovereign credential.

---

## Table of Contents
1. [Core Features & Architecture](#core-features--architecture)
2. [Tech Stack](#tech-stack)
3. [Prerequisites & Quickstart](#prerequisites--quickstart)
4. [Environment Variables](#environment-variables)
5. [Database Architecture & Migrations](#database-architecture--migrations)
6. [Security & Row Level Security (RLS)](#security--row-level-security-rls)
7. [Hackathon Demo Walkthrough (For Evaluators)](#hackathon-demo-walkthrough-for-evaluators)
8. [Verification Test Suite](#verification-test-suite)
9. [Limitations & Production Roadmap](#limitations--production-roadmap)

---

## Core Features & Architecture

```
                                  KAAMSETU PLATFORM ARCHITECTURE
                                  
   +--------------------+     +------------------------+     +-------------------------+
   |  Skilled Worker    |     |  Customer / Contractor |     |  Public / Verification  |
   |  (Voice / Mobile)  |     |   (Direct Booking)     |     |   (Sovereign QR Code)   |
   +---------+----------+     +-----------+------------+     +------------+------------+
             |                            |                               |
             v                            v                               v
   +--------------------+     +------------------------+     +-------------------------+
   | Voice Onboarding   |     | Professional Discovery |     |  Public Worker Profile  |
   | Multilingual AI    |     | Live DB Search/Filters |     |  Cryptographic Proofs   |
   +---------+----------+     +-----------+------------+     +------------+------------+
             |                            |                               |
             +----------------------------+-------------------------------+
                                          |
                                          v
   +-----------------------------------------------------------------------------------+
   |                             Next.js 15 App Router                                 |
   |   - Route Handlers (/api/workers, /api/bookings, /api/reviews, /api/auth)          |
   |   - Server Actions & Database Data Access Layer (src/lib/supabase/db/)            |
   |   - Design System: Deep Forest Green (#153E35), Warm Sand (#E8C999), Warm Ivory   |
   +--------------------------------------+--------------------------------------------+
                                          |
                   +----------------------+----------------------+
                   |                                             |
                   v                                             v
   +-------------------------------+             +-------------------------------------+
   |       Google Gemini AI        |             |        Supabase PostgreSQL          |
   |  - Gemini 2.5 Flash           |             |  - 9 Relational Tables              |
   |  - 7 Indian Languages         |             |  - Strict Row Level Security (RLS)  |
   |  - NSQF & Trade Extraction    |             |  - Tamper-Evident Work Records      |
   +-------------------------------+             +-------------------------------------+
```

### 1. Multilingual Voice-First Onboarding
- **Zero Literacy Barrier**: Craftspeople speak naturally in their native dialect or tongue.
- **Languages Supported**: Hindi (हिन्दी), English, Bengali (বাংলা), Tamil (தமிழ்), Telugu (తెలుగు), Marathi (मराठी), and Assamese (অসমীয়া).
- **Fallback**: Works seamlessly with text input when microphone is unavailable.
- **Server-Side Gemini 2.5 Flash**: Analyzes spoken audio or transcript into:
  - Primary Occupation & Trade Category (mapped to National Classification of Occupations NCO-2015).
  - Years of Hands-on Experience.
  - Granular Technical Sub-Skills & Equipment Handled.
  - Commercial Services & Indicative Rate Estimates (₹ / day).
  - Missing details guidance and professional biography.
- **Worker Approval**: Every extracted parameter is fully editable before final sovereign anchoring.

### 2. Self-Sovereign Worker Dashboard & Identity Card
- **Sovereign Privacy Switch**: Workers have one-click control to publish or unpublish their profile (`is_published = false` immediately hides profile from public view via RLS).
- **Verified vs. Self-Declared Separation**: Rigorously distinguishes between self-declared claims and DigiLocker / voice / peer-verified attestations.
- **Portfolio Management**: Upload project photos to Supabase Storage with before/after comparisons and technical notes.
- **Real-Time Booking Management**: Accept, decline, or complete service requests from clients.

### 3. Customer Discovery & Search Engine
- **Search Engine**: Direct search across name, trade, sub-skills, bio, and city.
- **Multi-Dimensional Filters**:
  - **Trade Classification**: Electrical & Solar, Handloom & Textiles, Automotive EV, Construction, Agritech, Precision Plumbing, etc.
  - **Skill Filter**: Specific technical proficiencies (e.g., *Rooftop Solar Array*, *3-Phase Inverters*, *Zardozi Gold Thread*).
  - **Location Filter**: District/city level filtering (Jaipur, Varanasi, Pune, Bengaluru, New Delhi, Kolkata, Chennai, Amritsar).
  - **Experience**: 3+, 5+, 10+, 15+ years.
  - **Availability**: Immediately Available, In Service, On Leave.

### 4. End-to-End Booking Lifecycle & Verified Reviews
- **Status Stepper**: `Requested (Pending) ➔ Confirmed (Accepted) ➔ In Progress ➔ Completed (or Cancelled)`.
- **Review Eligibility Security**: RLS and database triggers ensure **only** customers with a completed service record can submit a rating and review for an artisan.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15.5.29 (App Router, Server Components, Route Handlers) |
| **Runtime** | Node.js 18+ / React 19 |
| **Styling** | Tailwind CSS v4, Custom Sovereign Theme Tokens |
| **Design Language** | Deep Forest Green (`#153E35`), Warm Sand (`#E8C999`), Editorial Ivory (`#F7F5F0`) |
| **Icons & UI Primitives** | Lucide React, Radix UI (Dialog, Dropdown, Slider, Switch, Tabs) |
| **Database** | PostgreSQL via Supabase (9 tables, full foreign keys, RLS enabled) |
| **Storage** | Supabase Storage (`portfolio-images` bucket with offline data URL fallback) |
| **AI Extraction** | Google Gemini 2.5 Flash SDK (`@google/genai`) |
| **Validation** | Zod v3 schemas on all client & server boundaries |
| **Testing** | Custom Backend Verification Suite (`tsx src/lib/supabase/db/verify-backend.ts`) |

---

## Prerequisites & Quickstart

### Prerequisites
- Node.js 18.18 or higher (Node 20+ recommended)
- npm or pnpm

### 1. Clone & Install
```bash
git clone https://github.com/Mayyank04/kaamsetu.git
cd stitch_kaamsetu_digital_identity_platform
npm install
```

### 2. Configure Environment (Optional for Demo Mode)
Copy the example environment file:
```bash
cp .env.example .env.local
```
> **Note**: KAAMSETU features an **integrated offline simulation mode**. If Supabase and Gemini keys are not provided, the application runs out of the box using verified demo seed datasets and algorithmic rule-based extraction.

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Start
```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Your Supabase project URL (`https://your-project.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase public anon key for client-side queries. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase service-role key for backend admin operations (**NEVER exposed to frontend**). |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for live voice audio & transcript analysis. |
| `NEXT_PUBLIC_APP_URL` | Optional | Base URL of the deployment (default: `http://localhost:3000`). |

---

## Database Architecture & Migrations

The database schema is defined across versioned SQL migrations in `supabase/migrations/`:

### 1. `20261114000001_initial_schema.sql`
Creates the 9 core relational tables:
1. `public.occupations`: Standardized trade catalog with NSQF levels and Hindi translations.
2. `public.skills`: Granular technical proficiencies linked to occupations.
3. `public.profiles`: Core user identities with role partitioning (`worker`, `customer`, `admin`).
4. `public.worker_profiles`: Sovereign workforce profiles with slug, registry ID, hourly/daily rates, KaamScore, and published status.
5. `public.worker_skills`: Junction table with verification types (`voice_attested`, `digilocker_verified`, `peer_confirmed`, `self_declared`).
6. `public.portfolio`: Project showcases with title, description, category, and storage image URLs.
7. `public.bookings`: Service contracts with status (`requested`, `confirmed`, `in_progress`, `completed`, `cancelled`).
8. `public.reviews`: Customer ratings, technical quality scores, and reviews.
9. `public.work_records`: Cryptographically hashed work completion ledger.

### 2. `20261114000002_row_level_security.sql`
Applies PostgreSQL Row Level Security (RLS) policies:
- **Public Visibility Gating**: Unauthenticated/public users can only query profiles where `is_published = true`.
- **Worker Self-Sovereignty**: Workers can only insert, update, or unpublish their own records.
- **Customer Privacy**: Bookings are strictly restricted to the customer who created them and the assigned worker.
- **Review Integrity Rule**: Customers can **only** submit a review if they have at least one booking with `status = 'completed'` for that worker.

### 3. `20261114000003_storage_and_worker_controls.sql`
Configures the Supabase Storage bucket `portfolio-images` and worker asset policies.

### 4. Running Migrations & Seeding
Using the Supabase CLI:
```bash
supabase db push
# Or seed database:
supabase db reset
```

---

## Security & Row Level Security (RLS)

- **Browser Secret Isolation**: Frontend code never imports or references `SUPABASE_SERVICE_ROLE_KEY`. Verified by static check in test suite.
- **Unique Profile Slugs**: Enforced with automated slug generation trigger to prevent collision.
- **Tamper-Evident Ledger**: Work records contain SHA-256 cryptographic hashes chaining work completion certificates.
- **Aadhaar / DigiLocker Verification**: Pre-configured verification flags ensure clear visual trust markers on sovereign identity cards.

---

## Hackathon Demo Walkthrough (For Evaluators)

Follow these steps to evaluate the full end-to-end functionality of KAAMSETU:

### Step 1: 1-Click Persona Sign In
1. Navigate to `/login` (or click **Sign In** in the top navigation).
2. On the **Hackathon Quick-Sign In** tab, select one of the three pre-configured personas:
   - **Rameshwar Sharma**: Master Industrial Electrician & Solar Grid Specialist (`worker` role) $\to$ Redirects to `/dashboard`.
   - **Sunita Devi**: Master Handloom Weaver & Zardozi Artisan (`worker` role) $\to$ Redirects to `/dashboard`.
   - **Aarav Mehta**: Commercial Facility Manager & Contractor (`contractor` role) $\to$ Redirects to `/customer/bookings`.

### Step 2: AI Voice Worker Onboarding
1. Navigate to `/onboarding`.
2. **Step 1 (Language & Mode)**: Select **हिन्दी (Hindi)** or your preferred language, and choose **Voice Mode** (or Text Mode).
3. **Step 2 (Voice Testimony)**: Click the microphone or use the sample text button to load a realistic trade description.
4. **Step 3 (AI Analysis)**: Click **Analyze Craft Testimony**. Google Gemini extracts the occupation, years of experience, NSQF category, sub-skills, daily rates, and generates an editorial bio.
5. **Step 4 (Approve & Mint)**: Edit any field, review the confidence score, and click **Approve & Mint Sovereign ID**.
6. **Result**: An authentic Sovereign Skill Credential is minted with a unique Registry ID (e.g., `IN-RJ-2026-4029-KS`), verifiable QR code, and KAAMSCORE™.

### Step 3: Self-Sovereign Worker Dashboard
1. Navigate to `/dashboard`.
2. **Profile Completion**: Review the 5-point Sovereign Trust Index.
3. **Sovereignty Switch**: Toggle the **Published / Private Profile** switch in the top right to verify immediate privacy control.
4. **Skills Manager**: Add a new skill and view its verification badge (`voice_attested` vs `self_declared`).
5. **Portfolio Manager**: Upload a project photo with technical notes and project date.
6. **Job Requests**: Review incoming bookings, with options to **Accept** or **Decline**.

### Step 4: Professional Discovery & Database Search
1. Navigate to `/explore`.
2. Search for `"solar"` in the search bar.
3. Test combinations of **Profession Filter**, **Location Filter** (*Jaipur*, *Varanasi*, *Pune*), **Experience** (*10+ years*), and **Availability** (*Available*).
4. Notice real-time dynamic query resolution.
5. Click **View Sovereign Profile** on any worker card to view their public profile.

### Step 5: Direct Booking & Status Lifecycle
1. On any worker profile (e.g., `/profile/rameshwar-sharma-jaipur`), click **Book Verified Service**.
2. Fill in project scope, site address, and scheduled date, then click **Submit Booking Request**.
3. Navigate to `/customer/bookings`.
4. Observe the live status progression stepper:
   $$\text{Requested} \longrightarrow \text{Confirmed} \longrightarrow \text{In Progress} \longrightarrow \text{Completed}$$
5. Click **Mark In Progress** and then **Mark Completed**.

### Step 6: Verified Customer Review
1. Once a booking is marked `completed`, click **Write Verified Review**.
2. Select 5 stars, technical quality rating, punctuality rating, and write a testimonial.
3. Click **Submit Verified Review** — the review is anchored to the worker's permanent reputation ledger.

---

## Verification Test Suite

KAAMSETU includes an automated 42-point backend and RLS verification test suite.

Run the test suite:
```bash
npm run verify:db
```

### Expected Output:
```
=================================================================
KAAMSETU SUPABASE BACKEND VERIFICATION SUITE
=================================================================
VERIFICATION SUMMARY: 42/42 TESTS PASSED (0 FAILED)
=================================================================
✓ PASS [1. SQL Migrations] Migration 01 (Initial Schema) exists
✓ PASS [1. SQL Migrations] Migration 02 (Row Level Security) exists
✓ PASS [1. SQL Migrations] Seed SQL data exists
✓ PASS [1. SQL Migrations] Table public.occupations defined in schema
...
✓ PASS [2. Row Level Security] Public read access STRICTLY gated to published profiles
✓ PASS [2. Row Level Security] Customer review eligibility: ONLY completed booking can review
...
✓ PASS [5. Security Invariant] Browser client NEVER references or exposes SUPABASE_SERVICE_ROLE_KEY
✓ PASS [5. Security Invariant] Service role key is NOT exposed via NEXT_PUBLIC prefix
```

---

## Limitations & Production Roadmap

1. **DigiLocker Integration**: In hackathon demo simulation, DigiLocker credentials are verified via simulated sandbox responses. For live production, an official DigiLocker Requester API gateway registration is required.
2. **SMS Gateway**: OTP verification utilizes the demo bypass code `123456` in offline mode. Live deployment supports Supabase Twilio / Gupshup SMS provider integration.
3. **Smart Physical NFC Cards**: Public profile QR codes link directly to `/verify/[registryId]`. Production roadmap includes issuing physical ISO/IEC 14443 NFC cards for on-site contactless tapping.

---

## License & Credits

- Built for the **National Digital Identity & Inclusive Technology Hackathon**.
- Designed to honor the master craftspeople, technicians, and artisans building modern India.
