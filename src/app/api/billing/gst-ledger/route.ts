import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import {
  calculateGstInvoice,
  recordGstInvoice,
} from "@/lib/billing/financial-reconciliation-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json({ error: "Missing organizationId" }, { status: 400 });
  }

  if (!isConfigured.supabase) {
    const demo = calculateGstInvoice({
      organizationId,
      taxableAmount: 2499.0,
      contractorStateCode: "18", // Assam intra-state
    });
    return NextResponse.json({
      success: true,
      invoices: [demo],
    });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("financial_gst_ledger")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, invoices: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.organizationId || !body.taxableAmount || !body.contractorStateCode) {
      return NextResponse.json(
        { error: "Missing required fields: organizationId, taxableAmount, contractorStateCode" },
        { status: 400 }
      );
    }

    const invoice = await recordGstInvoice({
      organizationId: body.organizationId,
      regionId: body.regionId,
      taxableAmount: body.taxableAmount,
      contractorStateCode: body.contractorStateCode,
      platformStateCode: body.platformStateCode,
    });

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
