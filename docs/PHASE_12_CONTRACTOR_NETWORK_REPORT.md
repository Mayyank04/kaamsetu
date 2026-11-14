# KAAMSETU — PHASE 12 CONTRACTOR NETWORK REPORT
## Multi-Region Contractor Network, Subscription SaaS & Workforce Management Infrastructure

**Protocol:** KAAMSETU Enterprise Contractor Infrastructure  
**Target Market:** Commercial Contractors, Infrastructure EPCs, Builders & Subcontractors  
**Date:** November 15, 2026  

---

### 1. Executive Summary & SaaS Operating Model

In India's informal construction, infrastructure, and facilities contracting markets, contractors struggle with high turnover, unverified worker capabilities, project delays, and fragmented crew scheduling across multiple project sites.

KAAMSETU provides commercial contractors with a structured **Workforce Management SaaS** built on three tiers:
- **Starter Plan (₹0/month):** Up to 5 crew members, local district discovery, basic verified skill checks.
- **Contractor Pro (₹2,499/month + 18% GST = ₹2,948.82):** Up to 25 crew members, multi-supervisor access, project crew scheduling, cross-region worker discovery, verified attendance logging.
- **Contractor Business (₹7,999/month + 18% GST = ₹9,438.82):** Unlimited crew members, interstate project staffing dispatch, dedicated compliance reporting, priority dispute resolution, direct API access.

---

### 2. Multi-Supervisor Team Roles & Least Privilege

Contractor organizations manage workforce operations across multiple sites using strictly scoped roles defined in `public.contractor_team_members`:

| Organization Role | Permissions & Scope | Restricted Operations |
|---|---|---|
| **Organization Owner** | Complete organization administration, subscription upgrades/cancellations, bank account details, and legal compliance. | Cannot alter or confiscate worker sovereign profiles. |
| **Site Supervisor** | Day-to-day crew scheduling, attendance check-in, daily wage attestation, safety feedback reporting. | Cannot view commercial invoicing or invite new contractors. |
| **Project Coordinator** | Multi-project crew allocation, cross-region staffing offer creation, equipment requisition. | Cannot modify subscription billing methods. |

---

### 3. Contractor Multi-Tenancy & Data Protection

Contractor data is strictly isolated within the database using PostgreSQL Row-Level Security:
- Contractor A cannot see the roster, active crew, wage rates, or project bids of Contractor B.
- When a worker departs from Contractor A's workforce, **100% of the worker's sovereign profile, reviews, and KaamScore remain under worker ownership**.
- A contractor cannot lock, hide, or delete a worker's account upon contract termination.

```sql
-- PostgreSQL Security Policy: Contractor Roster Isolation
CREATE POLICY "Contractors can only access their own organization workforce"
  ON public.contractor_workforce FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM public.contractor_organizations WHERE owner_id = auth.uid()
    )
  );
```

---

### 4. Contractor Churn Prevention & Health Scoring

The platform monitors contractor engagement using the 5-component `CustomerHealthScore` telemetry engine:
1. **Roster Utilization (30%):** Active crew deployed on projects vs. total plan quota.
2. **Project Activity (25%):** Ongoing verified projects with active daily logging.
3. **Payment Integrity (20%):** Prompt settlement of worker wages without non-payment disputes.
4. **Platform Usage (15%):** Regular app engagement by site supervisors.
5. **Worker Satisfaction (10%):** Worker safety ratings and feedback scores.

Contractors falling below a health score of 40 are automatically flagged for customer success intervention before renewal churn occurs.
