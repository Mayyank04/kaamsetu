import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextRequest, NextResponse } from "next/server";
import { getPhase21ReconciledMetrics } from "@/lib/governance/operational-claim-reconciliation-service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const metricName = searchParams.get("metric");

    // Fetch from Supabase or default to canonical reconciliation records
    const { data: dbRecords } = await supabase
      .from("operational_claim_reconciliations")
      .select("*")
      .order("created_at", { ascending: false });

    let reconciliations = getPhase21ReconciledMetrics();
    if (metricName) {
      reconciliations = reconciliations.filter((r) =>
        r.metricName.toLowerCase().includes(metricName.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      count: reconciliations.length,
      reconciliations,
      dbSyncCount: dbRecords?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
