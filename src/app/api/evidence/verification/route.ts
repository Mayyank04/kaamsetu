import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createMetricEvidenceRecord,
  filterProductionMetrics,
  MetricEvidenceRecordInput,
} from "@/lib/evidence/evidence-verification-service";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get("identifier");

    let query = supabase.from("metric_evidence_records").select("*");
    if (identifier) {
      query = query.eq("metric_identifier", identifier);
    }

    const { data, error } = await query.order("last_updated_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { productionRecords, excludedSyntheticCount } = filterProductionMetrics(data || []);

    return NextResponse.json({
      success: true,
      records: productionRecords,
      totalCount: productionRecords.length,
      excludedSyntheticCount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const body: MetricEvidenceRecordInput = await req.json();
    const validated = createMetricEvidenceRecord(body);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("metric_evidence_records")
      .insert({
        metric_identifier: validated.metricIdentifier,
        reporting_period: validated.reportingPeriod,
        data_source: validated.dataSource,
        calculation_method: validated.calculationMethod,
        verification_status: validated.verificationStatus,
        metric_value: validated.metricValue,
        raw_evidence_hash: validated.rawEvidenceHash,
        verified_by: validated.verifiedBy,
        verification_notes: validated.verificationNotes,
        is_simulated: validated.isSimulated,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, record: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
