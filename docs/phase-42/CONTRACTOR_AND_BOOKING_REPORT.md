# KAAMSETU — PHASE 42 AUDIT DOSSIER 07
# CONTRACTOR AND BOOKING REPORT

**Classification:** `CLASS_B_CONTROLLED_ROLLOUT`  
**Commercial Dispatch Clusters:** Guwahati Urban & Shillong Urban  
**Permanent Financial Invariant:** `platform_commission_amount = 0.00` on artisan wages  
**Status:** `VERIFIED WORKING`  

---

## 1. Commercial Booking Policy under Class B Rollout

While account registration, profile creation, and skill discovery operate nationwide across all 36 States and Union Territories, physical on-demand customer bookings and crew dispatch are intentionally restricted to verified operational zones:

- **Guwahati Urban Pilot Cluster (`ZONE-AS-01`):** Assam, Kamrup Metropolitan, PIN 781001–781039.
- **Shillong Urban Pilot Cluster (`ZONE-ML-01`):** Meghalaya, East Khasi Hills, PIN 793001–793022.

### Invariant Enforcement Mechanism

1. **API Validation Gate (`POST /api/bookings`):**
   - The booking endpoint validates the destination PIN code against `ServiceCoverageRegistry.isBookingEligible(pincode)`.
   - If the requested booking location is outside an authorized operational cluster, the request is rejected with `HTTP 403 OUT_OF_BOUNDS`, informing the customer that commercial dispatch is pending regional launch in their area.
2. **Database Trigger Guard (`trg_check_worker_booking_eligibility`):**
   - A PostgreSQL database trigger checks that `worker_profiles.is_dispatch_eligible = true` before allowing an insert into `public.bookings`.
   - Any attempt to bypass the API and insert a dispatch booking for an out-of-bounds artisan is aborted at the database engine level.

---

## 2. Contractor Opportunities & Workforce Rostering

Contractors and small technical infrastructure firms use KAAMSETU Pro SaaS tools to post workforce opportunities and mobilize verified crews:

### Workforce Opportunity Lifecycle

1. **Posting an Opportunity (`POST /api/contractor/opportunities`):**
   - Inputs: Project Title, Region ID, Trade Category, Required Skills, Location District, Postal PIN Code, Expected Duration (days), Daily Wage Range (Min/Max), Direct Payment Terms.
   - Ownership Isolation: Automatically bound to authenticated contractor's `organization_id`.
2. **Algorithmic Opportunity Matching:**
   - Candidate workers are evaluated via `evaluateOpportunityMatch` based on trade match, skill overlap, location district proximity, and KaamScore reputation.
   - Workers receive personalized match scores with clear match rationale.
3. **Worker Applications (`POST /api/worker/opportunities`):**
   - Workers apply directly with their sovereign profile, providing verified work records without paper resumes.

---

## 3. Financial Invariant: Zero Commission on Artisan Wages

```sql
-- Architectural Invariant Verified
platform_commission_amount = 0.00;
artisan_net_payout = artisan_gross_earnings;
```

KAAMSETU operates on a SaaS subscription model for commercial contractors and institutional program fees for vocational bodies. Under no circumstances is a commission deducted from the daily wages or earnings of craftspeople.
