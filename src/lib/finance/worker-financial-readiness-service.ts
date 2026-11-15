/**
 * Responsible Worker Financial Readiness Service
 * Pillar D: Implements consent-driven financial readiness assessment and data portability
 * for RBI-regulated NBFC and banking partners WITHOUT acting as a credit bureau or lender.
 *
 * MISSION INVARIANT: "Every skill deserves to be seen, even without a degree."
 * CONSTITUTIONAL INVARIANT: 0.00% commission on worker wages.
 */

export interface FinancialReadinessInput {
  workerId: string;
  completedJobsCount: number;
  totalVerifiedEarnings: number;
  monthlyEarningsHistory: number[]; // Last 3-12 months of verified payouts
  verifiedCredentialsCount: number;
  lastJobCompletionDaysAgo: number;
  hasActiveConsent: boolean;
  consentedCategories: string[];
}

export interface FinancialReadinessProfile {
  workerId: string;
  readinessIndicators: {
    incomeEvidenceCompleteness: number; // 0.0 - 1.0
    earningsConsistency: number; // 0.0 - 1.0 (inverse coefficient of variation)
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

export class WorkerFinancialReadinessService {
  private static readonly DISCLAIMER =
    "This Financial Readiness Profile is an objective evidence summary of platform-recorded vocational activities. " +
    "KAAMSETU is NOT a credit bureau, lender, or loan broker. This summary does not constitute a credit score, " +
    "loan underwriting decision, or credit guarantee. Any credit decision is solely the statutory responsibility " +
    "of an RBI-regulated bank or NBFC.";

  /**
   * Computes a transparent, explainable financial readiness profile
   * strictly adhering to zero-demographic penalization and non-credit scoring rules.
   */
  public static computeReadinessProfile(input: FinancialReadinessInput): FinancialReadinessProfile {
    // 1. Consent verification
    if (!input.hasActiveConsent) {
      return {
        workerId: input.workerId,
        readinessIndicators: {
          incomeEvidenceCompleteness: 0,
          earningsConsistency: 0,
          workHistoryCompleteness: 0,
          credentialEvidenceStrength: 0,
          dataFreshness: 0,
        },
        qualitativeSummary: {
          incomeReliability: "unavailable",
          consistencyTier: "insufficient_data",
          freshnessTier: "stale",
        },
        consentMetadata: {
          isConsented: false,
          sharedCategories: [],
          disclaimer: this.DISCLAIMER,
        },
        limitations: ["Worker has not granted active consent for financial readiness sharing."],
      };
    }

    const limitations: string[] = [];

    // 2. Income Evidence Completeness
    // Based on ratio of verified jobs and total verified income
    let incomeEvidence = 0;
    if (input.totalVerifiedEarnings >= 50000) {
      incomeEvidence = 1.0;
    } else if (input.totalVerifiedEarnings >= 20000) {
      incomeEvidence = 0.75;
    } else if (input.totalVerifiedEarnings > 0) {
      incomeEvidence = 0.5;
    } else {
      limitations.push("No direct payment-record-backed earnings recorded on platform yet.");
    }

    // 3. Earnings Consistency (Coefficient of Variation)
    let consistency = 0;
    if (input.monthlyEarningsHistory.length >= 3) {
      const mean =
        input.monthlyEarningsHistory.reduce((a, b) => a + b, 0) / input.monthlyEarningsHistory.length;
      if (mean > 0) {
        const variance =
          input.monthlyEarningsHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          input.monthlyEarningsHistory.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean;
        // Low CV (<= 0.3) -> High consistency (1.0), CV >= 1.0 -> 0.2
        consistency = Math.max(0.1, Math.min(1.0, 1.0 - cv * 0.7));
      }
    } else {
      limitations.push("Less than 3 months of longitudinal payout history available.");
    }

    // 4. Work History Completeness
    const workHistory = Math.min(1.0, input.completedJobsCount / 20.0); // 20+ completed jobs = 1.0

    // 5. Credential Evidence Strength
    const credentialStrength = Math.min(1.0, input.verifiedCredentialsCount * 0.35);

    // 6. Data Freshness
    let dataFreshness = 0.2;
    if (input.lastJobCompletionDaysAgo <= 14) {
      dataFreshness = 1.0;
    } else if (input.lastJobCompletionDaysAgo <= 30) {
      dataFreshness = 0.8;
    } else if (input.lastJobCompletionDaysAgo <= 60) {
      dataFreshness = 0.5;
    } else {
      limitations.push("Last recorded work activity exceeds 60 days.");
    }

    // Qualitative descriptors
    const incomeReliability =
      incomeEvidence >= 0.75 ? "high_evidence" : incomeEvidence > 0 ? "moderate_evidence" : "early_stage";

    const consistencyTier =
      consistency >= 0.75
        ? "highly_consistent"
        : consistency >= 0.5
        ? "moderate"
        : consistency > 0
        ? "variable"
        : "insufficient_data";

    const freshnessTier = dataFreshness >= 0.8 ? "current" : dataFreshness >= 0.5 ? "recent" : "stale";

    return {
      workerId: input.workerId,
      readinessIndicators: {
        incomeEvidenceCompleteness: Number(incomeEvidence.toFixed(2)),
        earningsConsistency: Number(consistency.toFixed(2)),
        workHistoryCompleteness: Number(workHistory.toFixed(2)),
        credentialEvidenceStrength: Number(credentialStrength.toFixed(2)),
        dataFreshness: Number(dataFreshness.toFixed(2)),
      },
      qualitativeSummary: {
        incomeReliability,
        consistencyTier,
        freshnessTier,
      },
      consentMetadata: {
        isConsented: true,
        sharedCategories: input.consentedCategories,
        disclaimer: this.DISCLAIMER,
      },
      limitations,
    };
  }

  /**
   * Enforces strict prohibited practices defenses:
   * Throws error if any external integration attempts to request or compute
   * a discriminatory or predatory score.
   */
  public static assertProhibitedPracticeDefense(request: {
    requestedAction: string;
    targetEntity: string;
    levyWorkerCommission?: boolean;
    useDemographicFilter?: boolean;
  }): void {
    if (request.levyWorkerCommission === true) {
      throw new Error(
        "FATAL SECURITY VIOLATION: Platform commission on worker wages is strictly prohibited (0.00% invariant)."
      );
    }

    if (request.useDemographicFilter === true) {
      throw new Error(
        "PROHIBITED DISCRIMINATION: Filtering or scoring by demographic attributes (caste, religion, gender, age) is strictly blocked."
      );
    }

    const forbiddenActions = ["calculate_credit_score", "predict_default_risk", "sell_worker_lead"];
    if (forbiddenActions.includes(request.requestedAction)) {
      throw new Error(
        `PROHIBITED FINANCIAL ACTION: Action '${request.requestedAction}' is prohibited. KAAMSETU does not act as a credit rating agency or lead broker.`
      );
    }
  }
}
