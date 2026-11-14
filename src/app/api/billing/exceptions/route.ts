import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordFinancialException } from "@/lib/billing/financial-audit-service";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase.from("financial_reconciliation_exceptions").select("*").order("created_at", { ascending: false });
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ exceptions: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();

    const result = await recordFinancialException(supabase, {
      ledgerEntryId: body.ledgerEntryId,
      invoiceNumber: body.invoiceNumber,
      exceptionType: body.exceptionType,
      amount: body.amount,
      resolutionNotes: body.resolutionNotes,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
