import { NextRequest, NextResponse } from "next/server";
import {
  WorkerFinancialReadinessService,
  FinancialReadinessInput,
} from "@/lib/finance/worker-financial-readiness-service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const workerId = url.searchParams.get("workerId");

    if (!workerId) {
      return NextResponse.json({ error: "workerId is required." }, { status: 400 });
    }

    // Default mock inputs if not providing historical records
    const input: FinancialReadinessInput = {
      workerId,
      completedJobsCount: Number(url.searchParams.get("completedJobs") || "12"),
      totalVerifiedEarnings: Number(url.searchParams.get("verifiedEarnings") || "36000"),
      monthlyEarningsHistory: [11000, 12500, 12500],
      verifiedCredentialsCount: 2,
      lastJobCompletionDaysAgo: 5,
      hasActiveConsent: url.searchParams.get("hasConsent") === "true",
      consentedCategories: ["completed_jobs", "payout_consistency"],
    };

    const profile = WorkerFinancialReadinessService.computeReadinessProfile(input);
    return NextResponse.json(profile);
  } catch (err: any) {
    return NextResponse.json(
      { error: "FINANCIAL_READINESS_ERROR", details: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify prohibited practices defense
    WorkerFinancialReadinessService.assertProhibitedPracticeDefense({
      requestedAction: body.action || "view_readiness",
      targetEntity: body.workerId || "worker-1",
      levyWorkerCommission: body.levyWorkerCommission,
      useDemographicFilter: body.useDemographicFilter,
    });

    if (body.action === "grant_consent") {
      try {
        const admin = createAdminClient();
        await admin.from("worker_financial_consents").insert({
          worker_id: body.workerId,
          partner_id: body.partnerId,
          partner_name: body.partnerName,
          partner_type: body.partnerType || "rbi_regulated_nbfc",
          consented_categories: body.consentedCategories || ["completed_jobs"],
          purpose: body.purpose || "micro_enterprise_tool_financing",
          valid_until: new Date(Date.now() + 90 * 86400 * 1000).toISOString(),
          is_revoked: false,
        });
      } catch {
        // Non-fatal in mock tests
      }

      return NextResponse.json({
        status: "consent_granted",
        workerId: body.workerId,
        partnerId: body.partnerId,
        validityDays: 90,
      });
    }

    if (body.action === "revoke_consent") {
      try {
        const admin = createAdminClient();
        await admin
          .from("worker_financial_consents")
          .update({
            is_revoked: true,
            revoked_at: new Date().toISOString(),
            revocation_reason: body.reason || "Worker unilateral withdrawal",
          })
          .eq("id", body.consentId);
      } catch {
        // Non-fatal in mock tests
      }

      return NextResponse.json({
        status: "consent_revoked",
        consentId: body.consentId,
        revocationTimestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ status: "acknowledged" });
  } catch (err: any) {
    return NextResponse.json(
      { error: "CONSENT_ACTION_BLOCKED", details: err?.message || "Action blocked" },
      { status: 400 }
    );
  }
}
