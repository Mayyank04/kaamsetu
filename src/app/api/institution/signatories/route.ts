import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import { registerAuthorizedSignatory } from "@/lib/institution/credential-interop-service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const institutionId = searchParams.get("institutionId");

  if (!institutionId) {
    return NextResponse.json({ error: "Missing institutionId parameter" }, { status: 400 });
  }

  if (!isConfigured.supabase) {
    return NextResponse.json({
      success: true,
      signatories: [
        {
          id: "sig-001",
          institution_id: institutionId,
          full_name: "Dr. Bhaben Dutta",
          designation: "Director of Skill Certification",
          signatory_key_fingerprint: "FPR-A1B2C3D4E5F60718293A4B5C6D7E8F90",
          is_active: true,
          authorized_from: new Date().toISOString(),
        },
      ],
    });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("institution_authorized_signatories")
    .select("*")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, signatories: data || [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.institutionId || !body.fullName || !body.designation) {
      return NextResponse.json(
        { error: "Missing required fields: institutionId, fullName, designation" },
        { status: 400 }
      );
    }

    const signatory = await registerAuthorizedSignatory({
      institutionId: body.institutionId,
      fullName: body.fullName,
      designation: body.designation,
      authorizedUntil: body.authorizedUntil,
    });

    return NextResponse.json({ success: true, signatory }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
