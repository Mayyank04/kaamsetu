import { NextRequest } from "next/server";
import { requireAuthenticatedUser, requireInstitution } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import {
  issueInstitutionalCredential,
  suspendInstitutionalCredential,
  revokeInstitutionalCredential,
} from "@/lib/institution/credential-service";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = await createServerSupabaseClient();
    const searchParams = req.nextUrl.searchParams;
    const workerProfileId = searchParams.get("workerProfileId");
    const institutionId = searchParams.get("institutionId");

    let query = supabase
      .from("institutional_credentials")
      .select(`
        *,
        institutions:institution_id (name, state, district),
        worker_profiles:worker_profile_id (full_name, primary_trade, slug)
      `)
      .order("created_at", { ascending: false });

    if (workerProfileId) {
      query = query.eq("worker_profile_id", workerProfileId);
    }

    if (institutionId) {
      query = query.eq("institution_id", institutionId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return createSuccessResponse({ credentials: data || [] });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireInstitution();
    const body = await req.json();

    const credential = await issueInstitutionalCredential({
      institutionId: body.institutionId,
      cohortId: body.cohortId,
      participantId: body.participantId,
      workerProfileId: body.workerProfileId,
      tradeTitle: body.tradeTitle,
      nsqfLevel: Number(body.nsqfLevel) || 4,
      assessmentReference: body.assessmentReference,
      authorizedIssuerName: body.authorizedIssuerName || user.fullName,
      authorizedIssuerRole: body.authorizedIssuerRole || "Certified Evaluator",
      learnerConsentObtained: body.learnerConsentObtained ?? true,
    });

    return createSuccessResponse({
      credential,
      message: "Institutional credential issued and cryptographically anchored successfully",
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireInstitution();
    const body = await req.json();
    const { credentialId, action, reason } = body;

    if (!credentialId || !action) {
      return handleApiError(new Error("credentialId and action are required"));
    }

    let updated;
    if (action === "suspend") {
      updated = await suspendInstitutionalCredential(credentialId, reason || "Administrative suspension");
    } else if (action === "revoke") {
      updated = await revokeInstitutionalCredential(credentialId, reason || "Institutional revocation");
    } else {
      return handleApiError(new Error(`Unknown action: ${action}`));
    }

    return createSuccessResponse({
      credential: updated,
      message: `Credential successfully ${action}ed`,
    });
  } catch (err: any) {
    return handleApiError(err);
  }
}
