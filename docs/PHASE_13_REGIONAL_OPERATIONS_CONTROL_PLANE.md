# KAAMSETU — PHASE 13 REGIONAL OPERATIONS CONTROL PLANE
## Governance, Lifecycle State Machine, Incident Management & Cross-Region Data Isolation

**Protocol:** KAAMSETU National Sovereign Skill Identity Protocol  
**Repository:** `Mayyank04/kaamsetu`  
**Branch:** `phase-13-national-operations-scale`  
**Date:** November 15, 2026  
**Auditor:** Operations Strategist & Security Architecture Engineer  

---

### 1. Control Plane Architecture

The Regional Operations Control Plane provides centralized visibility, auditable lifecycle state progression, and decentralized operational autonomy across India's federal structure.

```
[ PROPOSED ] ---> [ RESEARCH_IN_PROGRESS ] ---> [ PARTNER_OUTREACH ]
                                                         |
[ READINESS_ASSESSMENT ] <--- [ FIELD_EVALUATION ] <-----+
            |
            v
[ APPROVED_FOR_LAUNCH ] ---> [ SOFT_LAUNCH ] ---> [ ACTIVE ] <---> [ SUSPENDED ]
                                                      |
                                                      v
                                                 [ ARCHIVED ]
```

Each operational territory is registered in `public.operational_regions` with ISO 3166-2 geographic identifiers, official language packs, local coordinator assignments, and readiness scores.

---

### 2. Formal 10-Stage State Machine

State transitions must be formally authorized by administrators with explicit audit rationale logged to `public.regional_launch_transitions`.

| Stage | Definition | Minimum Prerequisites | Entry Criteria | Exit Gate |
|---|---|---|---|---|
| **1. Proposed** | Exploratory assessment of market viability | Population > 250k, industrial or construction cluster | State desk approval | Preliminary market brief |
| **2. Research in Progress** | In-depth labor market survey and legal review | Assigned regional lead | Baseline survey protocol | Field research dataset |
| **3. Partner Outreach** | Identification of local skilling & contractor bodies | Target list of 5+ institutions | Local agency meetings | Executed Letter of Intent |
| **4. Field Evaluation** | Ground evaluation of connectivity & local trades | 20+ worker interviews conducted | Local language pack | Trade viability matrix |
| **5. Readiness Assessment** | Scoring against 12-milestone launch playbook | Scorecard evaluation initiated | Completed audit report | Readiness score $\ge 75$ |
| **6. Approved for Launch** | Executive sign-off on launch readiness | Readiness score $\ge 85$ + zero critical incidents | Executed Partner MoU | Board resolution |
| **7. Soft Launch** | Controlled rollout with invite-only cohort (20 workers) | Verified local coordinator on ground | Live infrastructure | 30 days zero defects |
| **8. Active** | General public availability and contractor matching | Passed 30-day soft launch review | Live partner support desk | Continuous SLA compliance |
| **9. Suspended** | Operational freeze due to compliance/safety incident | Incident report logged | Incident triage committee | Rectification sign-off |
| **10. Archived** | Formal decommissioning of regional presence | Complete data export & contract wind-down | Decommissioning order | Data retention archival |

---

### 3. Readiness Scorecard & Hard Safety Overrides

The readiness score is evaluated out of 100 points across 12 structured launch milestones. However, Phase 13 introduces **Mandatory Hard Safety Overrides** (`evaluateRegionalActivationGate`):

```typescript
export function evaluateRegionalActivationGate(input: {
  readinessScore: number;
  hasSignedMou: boolean;
  activeIncidentCount: number;
}): { allowed: boolean; blockingReasons: string[] }
```

Regardless of total points accumulated:
1. **Critical Incident Override**: If `activeIncidentCount > 0`, regional activation is **STRICTLY BLOCKED**. No region with unresolved safety, wage theft, or data privacy incidents may activate.
2. **Institutional MoU Override**: If `hasSignedMou === false`, regional activation is **STRICTLY BLOCKED**. Operational legitimacy requires an executed government or institutional partnership agreement.
3. **Threshold Gate**: Overall `readinessScore` must be $\ge 85$.

This triple gatekeeper was independently verified in Phase 13 Test 3:
- A region with a score of 92/100 was rejected when an unresolved incident was flagged.
- A region with a score of 88/100 was rejected when the MoU was missing.
- Only a region meeting all three criteria achieved `allowed: true`.

---

### 4. Regional Administrator Scoping & Role Boundaries

Regional autonomy is strictly bounded by PostgreSQL Row-Level Security policies on `public.regional_administrators`:
- Regional Coordinators are assigned to a single designated `region_id`.
- A coordinator for Assam Metro (`IN-AS-KMP-METRO`) cannot authorize state transitions, edit milestone playbooks, or access private grievance records for East Khasi Hills (`IN-ML-EKH`) or West Tripura (`IN-TR-WTR`).
- Super-administrators (`admin` role in `public.profiles`) hold national orchestration authority but all administrative actions require immutable database audit logging.

This privilege isolation was independently verified in Phase 13 Test 2 and Test 5.

---

### 5. Operational Incident Management & Emergency Suspension

The control plane provides immediate operational levers for risk containment:

#### 5.1 Incident Logging & Severity Matrix (`public.regional_operational_incidents`)
- **Critical (P0)**: Systemic wage non-payment, physical worker safety breach, cryptographic credential forgery, systemic data leakage. SLA: < 2 hours response, immediate suspension review.
- **High (P1)**: Contractor misclassification dispute, regional SMS gateway outage, delayed mediation SLA. SLA: < 12 hours response.
- **Medium (P2)**: Translation errors in vernacular voice prompts, minor discrepancy in QR rendering. SLA: < 48 hours response.
- **Low (P3)**: Minor UI label adjustments, general partner feedback. SLA: Scheduled sprint resolution.

#### 5.2 Emergency Suspension Workflow
In the event of an uncontained P0 incident:
1. Operator triggers `POST /api/regions/operations?action=suspend`.
2. Region status updates to `suspended` in `public.operational_regions`.
3. Outbound matching and cross-region staffing into the suspended territory are halted automatically.
4. Active workers receive SMS advisory via vernacular notifications.
5. Reactivation requires resolution of all open critical incidents and re-evaluation through the activation gatekeeper.

---

### 6. Empirical Status of Active & Candidate Regions

| Region Code | Name | State | Status | Readiness Score | Active Incidents | Signed MoU |
|---|---|---|---|---|---|---|
| `IN-AS-KMP-METRO` | Kamrup Metropolitan | Assam | `active` | 94.0 | 0 | Yes (ASDM) |
| `IN-ML-EKH` | East Khasi Hills | Meghalaya | `active` | 89.5 | 0 | Yes (MSSDS) |
| `IN-TR-WTR` | West Tripura | Tripura | `research_in_progress` | 45.0 | 0 | Under Negotiation |
| `IN-WB-DAR` | Darjeeling & Siliguri | West Bengal | `proposed` | 20.0 | 0 | Pending |
| `IN-NL-DIM` | Dimapur | Nagaland | `proposed` | 15.0 | 0 | Pending |

Candidate expansion regions remain strictly in research/proposed status, maintaining an uncompromised barrier between verified production operations and prospective markets.
