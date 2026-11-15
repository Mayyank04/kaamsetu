import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireAuthenticatedUser,
  requireOwnedWorkerProfile,
  AuthError,
} from "@/lib/auth/server";
import { recordWorkerConsentAudit, getWorkerPrivacyExplanation } from "@/lib/worker/worker-trust-service";

const recordConsentSchema = z.object({
  workerProfileId: z.string().min(1, "workerProfileId is required"),
  recipientEntityType: z.enum(["contractor", "institution", "verifier", "public", "system"]),
  recipientEntityId: z.string().min(1, "recipientEntityId is required"),
  action: z.enum(["granted", "renewed", "expired", "revoked", "modified"]),
  disclosedFields: z.array(z.string()).default([]),
  policyVersion: z.string().default("v2026.1"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get("workerProfileId");
    const lang = (searchParams.get("lang") as "en" | "hi" | "as") || "en";

    const explanation = getWorkerPrivacyExplanation(lang);

    let auditEvents: any[] = [];
    if (workerProfileId) {
      // Authorization check: Worker can only access their own consent audit history
      if (user.role === "worker") {
        await requireOwnedWorkerProfile(workerProfileId);
      } else if (user.role !== "admin") {
        throw new AuthError("Access denied: You do not have permission to view this consent history.", 403);
      }

      const { data, error } = await supabase
        .from("worker_consent_audit_events")
        .select("*")
        .eq("worker_profile_id", workerProfileId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      auditEvents = data || [];
    }

    return NextResponse.json({
      privacyExplanation: explanation,
      consentHistory: auditEvents,
    });
  } catch (err: any) {
    const status = err.statusCode || (err.name === "AuthError" ? 401 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json();
    const parsed = recordConsentSchema.parse(body);

    // If caller is worker, enforce ownership
    if (user.role === "worker") {
      await requireOwnedWorkerProfile(parsed.workerProfileId);
    }

    const supabase = createAdminClient();

    // Actor ID is strictly set from authenticated session user.id, never client-supplied
    const result = await recordWorkerConsentAudit(supabase, {
      workerProfileId: parsed.workerProfileId,
      recipientEntityType: parsed.recipientEntityType,
      recipientEntityId: parsed.recipientEntityId,
      action: parsed.action,
      disclosedFields: parsed.disclosedFields,
      policyVersion: parsed.policyVersion,
      actorId: user.id,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 422 });
    }
    const status = err.statusCode || (err.name === "AuthError" ? 403 : 400);
    return NextResponse.json({ error: err.message }, { status });
  }
}
