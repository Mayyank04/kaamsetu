import { requireAdmin } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildInstitutionalRatification,
  transitionRatificationStatus,
  InstitutionCategory,
  InstrumentType,
  RatificationExecutionStatus,
  InstitutionalRatificationRecord,
} from "@/lib/governance/institutional-ratification-service";

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let query = supabase.from("institutional_ratification_records").select("*");
    if (category) {
      query = query.eq("category", category);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      ratifications: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch (authError) { return handleApiError(authError); }
  try {
    const body = await req.json();
    const {
      action,
      institutionCode,
      institutionName,
      category,
      legalEntityVerified,
      authorizedSignatoryVerified,
      instrumentType,
      status,
      instrumentReference,
      effectiveDate,
      expiryDate,
      productionKeyIdentifier,
      verificationMethod,
      limitations,
      currentRecord,
      targetStatus,
      requiredEvidence,
      operatorIdentity,
    } = body;

    const supabase = createAdminClient();

    if (action === "transition") {
      if (!currentRecord || !targetStatus || !requiredEvidence || !operatorIdentity) {
        return NextResponse.json(
          { error: "currentRecord, targetStatus, requiredEvidence, and operatorIdentity are required for transition" },
          { status: 400 }
        );
      }

      const transitionResult = transitionRatificationStatus({
        record: currentRecord as InstitutionalRatificationRecord,
        targetStatus,
        instrumentReference,
        productionKeyIdentifier,
        verificationMethod,
        limitations,
        notes: `${operatorIdentity}: ${requiredEvidence}`,
      });

      if (!transitionResult.allowed || !transitionResult.updatedRecord) {
        return NextResponse.json(
          { error: "Transition rejected by governance policy", reason: transitionResult.reason },
          { status: 422 }
        );
      }

      const { data, error } = await supabase
        .from("institutional_ratification_records")
        .update({
          status: transitionResult.updatedRecord.status,
          instrument_reference: transitionResult.updatedRecord.instrumentReference,
          production_key_identifier: transitionResult.updatedRecord.productionKeyIdentifier,
          verification_method: transitionResult.updatedRecord.verificationMethod,
          limitations: transitionResult.updatedRecord.limitations,
          evidence_sha256: transitionResult.updatedRecord.evidenceSha256,
          updated_at: transitionResult.updatedRecord.updatedAt,
        })
        .eq("institution_code", transitionResult.updatedRecord.institutionCode)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        transition: transitionResult,
        record: data,
      });
    }

    // Default: Create new ratification record
    if (!institutionCode || !institutionName || !category || !instrumentType) {
      return NextResponse.json(
        { error: "institutionCode, institutionName, category, and instrumentType are required" },
        { status: 400 }
      );
    }

    const ratification = buildInstitutionalRatification({
      institutionCode,
      institutionName,
      category: category as InstitutionCategory,
      legalEntityVerified: Boolean(legalEntityVerified),
      authorizedSignatoryVerified: Boolean(authorizedSignatoryVerified),
      instrumentType: instrumentType as InstrumentType,
      status: (status as RatificationExecutionStatus) || "drafting",
      instrumentReference: instrumentReference || undefined,
      effectiveDate: effectiveDate || undefined,
      expiryDate: expiryDate || undefined,
      productionKeyIdentifier: productionKeyIdentifier || undefined,
      verificationMethod: verificationMethod || "Initial documentation review",
      limitations: limitations || undefined,
    });

    const { data, error } = await supabase
      .from("institutional_ratification_records")
      .insert({
        institution_code: ratification.institutionCode,
        institution_name: ratification.institutionName,
        category: ratification.category,
        legal_entity_verified: ratification.legalEntityVerified,
        authorized_signatory_verified: ratification.authorizedSignatoryVerified,
        instrument_type: ratification.instrumentType,
        status: ratification.status,
        instrument_reference: ratification.instrumentReference,
        effective_date: ratification.effectiveDate,
        expiry_date: ratification.expiryDate,
        production_key_identifier: ratification.productionKeyIdentifier,
        verification_method: ratification.verificationMethod,
        limitations: ratification.limitations,
        evidence_sha256: ratification.evidenceSha256,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      ratification,
      record: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
