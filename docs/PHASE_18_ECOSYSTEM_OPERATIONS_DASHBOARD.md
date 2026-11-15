# KAAMSETU — PHASE 18: ECOSYSTEM OPERATIONS DASHBOARD

**Generated:** 2026-11-15T11:50:25+05:30  
**Status Classification:** `operational`  
**Endpoint:** `/api/observability/ecosystem-dashboard`

---

## 1. 12-State Canonical Lifecycle Framework

KAAMSETU monitors every external connector, partner integration, and protocol gateway across 12 standardized lifecycle states:

```
[1. not_started] -> [2. research] -> [3. prepared] -> [4. submitted] -> [5. awaiting_approval]
                                                                                |
[8. pre_prod_validated] <- [7. sandbox_validated] <- [6. sandbox_active] <-----+
         |
[9. production_approved] -> [10. production_active] <---> [11. suspended]
                                    |
                            [12. failed]
```

---

## 2. Active Connectors Health Status Matrix

| Connector ID | Name | Category | Lifecycle State | P95 Latency | Error Rate | Replay Blocks | Health |
|---|---|---|---|---|---|---|---|
| `ondc-bpp-gateway` | ONDC Beckn Gateway | Digital Public Good | `sandbox_validated` | 340ms | 0.8% | 14 | `healthy` |
| `onest-dsep-provider` | ONest DSEP Gateway | Digital Public Good | `sandbox_validated` | 290ms | 0.2% | 3 | `healthy` |
| `sap-successfactors-odata` | SAP OData Roster Sync | Enterprise ERP | `sandbox_validated` | 480ms | 1.2% | 0 | `healthy` |
| `gem-form-b-compliance` | GeM Form B Exporter | Public Procurement | `sandbox_validated` | 180ms | 0.0% | 0 | `healthy` |
| `nbfc-micro-tool-finance` | NBFC Tool Financing | Responsible Finance | `sandbox_tested` | 220ms | 0.0% | 0 | `healthy` |

---

## 3. Operational Telemetry & Alerting Thresholds

1. **Latency SLA**: P95 latency > 1,000ms triggers `degraded` warning; > 2,500ms triggers automated `failing` alarm.
2. **Error Rate SLA**: Error rate > 5.0% triggers `degraded` alert; > 15.0% triggers automated connector circuit breaker.
3. **Replay Attack Alarm**: > 10 blocked replay attempts within 5 minutes triggers automated IP rate-limiting block.
