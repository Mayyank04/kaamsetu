# KAAMSETU — CONTRACTOR PRO SAAS SPECIFICATION
## Enterprise Multi-Tenancy, Workforce Management & Non-Extractive Monetisation

---

## 1. Executive Philosophy & The Zero-Commission Mandate

In the Indian informal labor economy, traditional gig aggregators (such as Urban Company, helper portals, or labor middlemen) extract **15% to 30% commission** from worker wages. This extractive model penalizes the skilled worker, incentivizes off-platform evasion, creates mutual distrust, and fails to foster long-term professional identity.

**KAAMSETU breaks this paradigm completely:**
- **Workers Pay Zero**: Creating, maintaining, and sharing a verified digital skill card is 100% free forever.
- **Customers Pay Zero Booking Commission**: Direct job discovery and booking between customer and worker incurs no percentage cut.
- **Contractors Pay for Enterprise SaaS Software**: Infrastructure contractors, MEP firms, interior design firms, and facility management companies pay for software that solves their primary operational bottlenecks: **crew verification, site compliance, dispute-free daily wage settlement, and workforce retention.**

---

## 2. Subscription Tiers & Feature Matrix

| Feature | Starter Tier (Free) | Contractor Pro (₹999 / mo) | Contractor Business (₹2,999 / mo) |
| :--- | :--- | :--- | :--- |
| **Target User** | Individual master craftsmen with small helper crew | Small-to-medium electrical/construction contractors (10–30 workers) | Large infrastructure, facility management & engineering firms (30–100+ workers) |
| **Pricing** | ₹0 | ₹999/mo (₹9,990/yr with 2 mo free) | ₹2,999/mo (₹29,990/yr with 2 mo free) |
| **Max Roster Workers** | **5 Active Workers** | **25 Active Workers** | **100 Active Workers** (Custom addons available) |
| **Workforce Allocation** | Single project assignment | Multi-project crew scheduling | Cross-site supervisor & crew matrix |
| **Compliance Dossiers** | Basic profile view | Downloadable PDF Compliance Dossiers (Aadhaar & Police check verification) | Batch DISCOM / PWD Audit Compliance Bundles |
| **Work Record Signing** | Standard individual sign | Cryptographic Batch Verification for client billing | Automated Disputed-Free Daily Wage Settlement export |
| **Support SLA** | Community & FAQ | Priority WhatsApp & Phone dispatch (4 hr SLA) | Dedicated Enterprise Account Manager + on-site crew onboarding |

---

## 3. Database Schema & Multi-Tenant Isolation

### 3.1 Entities
1. `contractor_organizations`:
   - `id`: UUID Primary Key
   - `owner_id`: UUID References `profiles(id)`
   - `company_name`: Business trading name
   - `gstin`: GST Identification Number (Optional)
   - `subscription_tier`: `'starter' | 'pro' | 'business'`
   - `max_roster_workers`: Enforced ceiling (5, 25, 100)
2. `contractor_workforce`:
   - `organization_id`: UUID References `contractor_organizations(id)`
   - `worker_profile_id`: UUID References `worker_profiles(id)`
   - `project_role`: e.g. "Lead Solar Electrician", "Shuttering Carpenter"
   - `daily_wage_rate`: Enterprise agreed wage in INR
   - `status`: `'active' | 'inactive' | 'on_leave'`
3. `contractor_projects`:
   - `organization_id`: UUID References `contractor_organizations(id)`
   - `title`: Project / site title
   - `client_name`: Client / Department name
   - `location`: Site address
   - `budget`: Budget in INR
   - `status`: `'planning' | 'in_progress' | 'completed' | 'on_hold'`

### 3.2 Row Level Security (RLS) Invariants
- **Organization Tenant Isolation**:
  ```sql
  CREATE POLICY "Contractors can view their own organization"
    ON public.contractor_organizations FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());
  ```
- **Workforce Roster Isolation**:
  ```sql
  CREATE POLICY "Contractors can view their own workforce"
    ON public.contractor_workforce FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.contractor_organizations org
        WHERE org.id = organization_id AND org.owner_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.worker_profiles wp
        WHERE wp.id = worker_profile_id AND wp.user_id = auth.uid()
      )
    );
  ```
- **Worker Profile Sovereignty**:
  Contractors have **ZERO** write privileges on `public.worker_profiles`. Even if a worker is enrolled on Contractor A's workforce roster, Contractor A cannot modify the worker's skills, bio, phone, or KAAMSCORE. Profile edits must originate from the worker's own authenticated session.

---

## 4. API Endpoints

### `GET /api/contractor/organization`
Retrieves authenticated contractor's organization details, active subscription tier, current roster count, and project summary.

### `POST /api/contractor/workforce`
Adds a verified worker to the contractor's roster.
- Validates that current active roster count < `organization.max_roster_workers`.
- Returns HTTP 400 with upgrade prompt if quota is exceeded.

### `DELETE /api/contractor/workforce?workerProfileId=UUID`
Removes a worker from the contractor's active roster. Does not delete or harm the worker's sovereign profile in any way.

### `POST /api/contractor/subscription`
Upgrades or modifies the contractor subscription tier.
- Validates tier selection.
- Adjusts `max_roster_workers` atomically.
- Records subscription state transition in database.

---

## 5. User Experience & Dashboard Features

The Contractor Dashboard (`/contractor/dashboard`) includes:
1. **Organization Header**: Displays company name, verified badge, operating city, GSTIN, and current subscription tier badge.
2. **Quota Usage Gauge**: Visual meter tracking active workers against plan limits (e.g., "12 of 25 workers used - 48% Quota Utilized").
3. **Crew Roster Management**: Clean tabular view of workers, trade competencies, verified phone numbers (masked), assigned enterprise roles, and direct links to public verification skill cards.
4. **Project Deployments**: Timeline, location, client name, and budget tracking for ongoing site contracts.
5. **Upgrade Modal**: Interactive plan selection modal highlighting feature differentiators and annual discounts.
