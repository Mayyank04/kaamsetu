# KAAMSETU — PHASE 17 FINANCIAL READINESS DATA MODEL
## Open Evidence Indicators, Qualitative Tiers & Limitation Caveats

---

## 1. Schema Definition & Indicators

The Financial Readiness Profile is computed dynamically by `WorkerFinancialReadinessService`:

```typescript
export interface FinancialReadinessProfile {
  workerId: string;
  readinessIndicators: {
    incomeEvidenceCompleteness: number; // 0.0 - 1.0
    earningsConsistency: number; // 0.0 - 1.0 (inverse CV)
    workHistoryCompleteness: number; // 0.0 - 1.0
    credentialEvidenceStrength: number; // 0.0 - 1.0
    dataFreshness: number; // 0.0 - 1.0
  };
  qualitativeSummary: {
    incomeReliability: "high_evidence" | "moderate_evidence" | "early_stage" | "unavailable";
    consistencyTier: "highly_consistent" | "moderate" | "variable" | "insufficient_data";
    freshnessTier: "current" | "recent" | "stale";
  };
  consentMetadata: {
    isConsented: boolean;
    sharedCategories: string[];
    disclaimer: string;
  };
  limitations: string[];
}
```

---

## 2. Mathematical Indicator Formulations

### 1. Income Evidence Completeness ($I_{ev}$)
Measures whether platform transactions have bank-verified payout records:
$$I_{ev} = \begin{cases} 
1.0 & \text{if } \text{Total Verified Earnings} \ge ₹50,000 \\ 
0.75 & \text{if } ₹20,000 \le \text{Total Verified Earnings} < ₹50,000 \\ 
0.50 & \text{if } ₹1 \le \text{Total Verified Earnings} < ₹20,000 \\ 
0.00 & \text{if unrecorded / zero} 
\end{cases}$$

### 2. Longitudinal Payout Consistency ($C_{earn}$)
Evaluates income volatility over a 3- to 12-month period using the coefficient of variation ($CV = \sigma / \mu$):
$$C_{earn} = \max(0.10, \min(1.0, 1.0 - 0.7 \times CV))$$
- Low variance ($CV \le 0.3$) yields $C_{earn} \ge 0.79$ (`highly_consistent`).
- High seasonal swings yield $C_{earn} \le 0.40$ (`variable`).

### 3. Work History Completeness ($W_{hist}$)
Evaluates verified job completions against an entry benchmark of 20 projects:
$$W_{hist} = \min\left(1.0, \frac{\text{Completed Jobs}}{20}\right)$$

### 4. Credential Evidence Strength ($S_{cred}$)
Evaluates third-party verified trade credentials (e.g. ASDM, NCVET):
$$S_{cred} = \min(1.0, \text{Verified Credentials Count} \times 0.35)$$

### 5. Data Freshness ($F_{data}$)
Reflects recency of active on-platform labor:
$$F_{data} = \begin{cases} 
1.0 & \text{if } \text{Days Since Last Completion} \le 14 \\ 
0.8 & \text{if } 15 \le \text{Days} \le 30 \\ 
0.5 & \text{if } 31 \le \text{Days} \le 60 \\ 
0.2 & \text{if } > 60 \text{ days} 
\end{cases}$$

---

## 3. Transparent Limitations Engine
When a worker is new to the platform, the service explicitly emits qualitative caveats rather than penalizing the worker:
- `"Less than 3 months of longitudinal payout history available."`
- `"Last recorded work activity exceeds 60 days."`
- `"No direct payment-record-backed earnings recorded on platform yet."`

This ensures that financial partners understand evidence boundaries without penalizing the worker.
