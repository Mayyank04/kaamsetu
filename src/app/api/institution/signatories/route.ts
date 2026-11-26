import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireInstitution } from "@/lib/auth/server";
import { handleApiError } from "@/lib/error/handler";
import { isConfigured } from "@/lib/env";
import { registerAuthorizedSignatory } from "@/lib/institution/credential-interop-service";

export async function GET(req: NextRequest) {
  try {
    const user = await requireInstitution();
    const { searchParams } = new URL(req.url);
    const requestedInstitutionId = searchParams.get("institutionId");
    const institutionId =
      user.role === "admin"
        ? requestedInstitutionId
        : user.institutionId || requestedInstitutionId;

    if (!institutionId) {
      return NextResponse.json({ error: "Missing institutionId parameter" }, { status: 400 });
    }
    if (user.role !== "admin" && user.institutionId && user.institutionId !== institutionId) {
      return NextResponse.json({ error: "Forbidden: Cross-institution signatory access denied" }, { status: 403 });
    }

    if (!isConfigured.supabase) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      return NextResponse.json({ success: true, signatories: [] });
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
  } catch (err: unknown) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireInstitution();
    const body = await req.json();

    if (!body.institutionId || !body.fullName || !body.designation) {
      return NextResponse.json(
        { error: "Missing required fields: institutionId, fullName, designation" },
        { status: 400 }
      );
    }
    if (user.role !== "admin" && user.institutionId && user.institutionId !== body.institutionId) {
      return NextResponse.json({ error: "Forbidden: Cross-institution signatory mutation denied" }, { status: 403 });
    }

    const signatory = await registerAuthorizedSignatory({
      institutionId: body.institutionId,
      fullName: body.fullName,
      designation: body.designation,
      authorizedUntil: body.authorizedUntil,
    });

    return NextResponse.json({ success: true, signatory }, { status: 201 });
  } catch (err: unknown) {
    return handleApiError(err);
  }
}
