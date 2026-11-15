# KAAMSETU — PHASE 21 OPERATIONAL DASHBOARD SPECIFICATION
## Dual-View Architecture, Privacy Redaction & Real-Time Telemetry API

**Mission:** "Every skill deserves to be seen, even without a degree."  
**Service Endpoint:** `/api/governance/operations-dashboard`  
**Domain Service:** `src/lib/governance/operations-dashboard-service.ts`  
**Audit Date:** November 15, 2026  

---

### 1. Architectural Philosophy: The Dual-View Standard

To satisfy both public accountability and enterprise compliance without compromising worker privacy, KAAMSETU's Operations Dashboard implements a strict **Dual-View Architecture**:

```
                       ┌────────────────────────────────────────┐
                       │   /api/governance/operations-dashboard │
                       └───────────────────┬────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
             [ ?view=public (Default) ]              [ ?view=audit ]
             ┌─────────────────────────┐             ┌─────────────────────────┐
             │ • Worker PII Redacted   │             │ • Full Verification Log │
             │ • No Phone Numbers/PANs │             │ • Stamped Paper Refs    │
             │ • Regional Aggregates   │             │ • Council Key Statuses  │
             │ • 0.00% Commission Flag │             │ • Financial Ledger      │
             │ • Evidence SHA-256 Hash │             │ • Dual-Signatory Audits │
             └─────────────────────────┘             └─────────────────────────┘
```

---

### 2. Public View Specification (`?view=public`)

The public view is designed for workers, customers, civil society, and researchers. It provides transparent aggregate metrics while strictly stripping personally identifiable information:

#### JSON Response Schema:
```json
{
  "success": true,
  "view": "public",
  "dashboard": {
    "generatedAt": "2026-11-15T13:30:00.000Z",
    "platformClassification": "CLASS_B_NATIONAL_EXPANSION_READY_CONTROLLED_ROLLOUT",
    "constitutionalCommission": "0.00%",
    "regions": [
      {
        "regionCode": "IN-AS",
        "regionName": "Assam",
        "districtName": "Kamrup Metropolitan (Guwahati)",
        "operationalStatus": "active",
        "activeWorkersDiscoverable": 1200,
        "completedJobsCount": 395,
        "workerCommissionRate": "0.00%",
        "languagesSupported": ["Assamese", "Bodo", "Bengali", "Hindi", "English"],
        "lastAuditedAt": "2026-11-15T13:30:00.000Z"
      },
      {
        "regionCode": "IN-ML",
        "regionName": "Meghalaya",
        "districtName": "East Khasi Hills (Shillong)",
        "operationalStatus": "active",
        "activeWorkersDiscoverable": 350,
        "completedJobsCount": 138,
        "workerCommissionRate": "0.00%",
        "languagesSupported": ["Khasi", "Garo", "English"],
        "lastAuditedAt": "2026-11-15T13:30:00.000Z"
      },
      {
        "regionCode": "IN-WB-SIL",
        "regionName": "Siliguri Transit Corridor",
        "districtName": "Darjeeling / Jalpaiguri border",
        "operationalStatus": "conditionally_ready",
        "activeWorkersDiscoverable": 140,
        "completedJobsCount": 38,
        "workerCommissionRate": "0.00%",
        "languagesSupported": ["Bengali", "Nepali", "Hindi", "English"],
        "lastAuditedAt": "2026-11-15T13:30:00.000Z"
      },
      {
        "regionCode": "IN-TR",
        "regionName": "Tripura",
        "districtName": "West Tripura (Agartala)",
        "operationalStatus": "candidate",
        "activeWorkersDiscoverable": 30,
        "completedJobsCount": 4,
        "workerCommissionRate": "0.00%",
        "languagesSupported": ["Tripuri (Kokborok)", "Bengali", "English"],
        "lastAuditedAt": "2026-11-15T13:30:00.000Z"
      }
    ],
    "aggregateMetrics": {
      "totalDiscoverableWorkers": 1720,
      "totalCompletedJobs": 575,
      "totalPaidWorkCount": 562,
      "zeroCommissionVerified": true
    },
    "governanceSummary": {
      "activeDistrictsCount": 2,
      "conditionallyReadyCount": 1,
      "gatedResearchCount": 1,
      "openNetworkStatus": "STAGING_VALIDATED_AWAITING_PRODUCTION_KEY",
      "workerProtectionDeskActive": true
    },
    "evidenceHash": "89ab01fa89123048912039481209384109283401928340192834019283401928"
  }
}
```

---

### 3. Internal Audit View Specification (`?view=audit`)

The audit view contains unredacted verification details intended for certified third-party auditors, institutional counterparts, and regulatory authorities.

#### Key Telemetry Sections:
1. `regionsDetailed`: Full 14-step checklists and qualitative gate status for each district.
2. `enterpriseEngagements`: 11-stage state machine tracking for EPC contracts with stamped paper references.
3. `institutionalRatifications`: Legal entity verification, authorized signatory names, and production key ceremony IDs.
4. `financialReconciliation`: Invoiced B2B SaaS revenue, 18% GST reconciliation, and 0.00% wage commission confirmation.
5. `workerGrievanceAndSafety`: Active dispute counts, SLA compliance percentages, and review shielding status.
6. `classificationDefense`: Formal legal defense explaining why the platform is classified as Class B rather than unearned Class A.

---

### 4. Cryptographic Evidence Digest

Both views compute a deterministic SHA-256 evidence hash over canonical JSON representations of their respective payloads. Any alteration to district counts, commission percentages, or operational statuses invalidates the digest, providing tamper-evident verification.
