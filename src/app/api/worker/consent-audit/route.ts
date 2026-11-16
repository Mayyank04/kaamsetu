import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import {
  requireAuthenticatedUser,
  requireOwnedWorkerProfile,
  requireInstitution,
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
  purpose: z.string().min(3, "Consent purpose is required").default("job_opportunity_matching"),
  evidenceReference: z.string().optional().nullable(),
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
      } else if (user.role === "institution") {
        // Institutional users may only access trainees within authorized cohorts
        await requireInstitution();
        if (!user.isDemo) {
          const { data: cohortMembership } = await supabase
            .from("cohort_participants")
            .select("id, cohort:institutional_cohorts!inner(institution_id)")
            .eq("worker_profile_id", workerProfileId)
            .eq("cohort.institution_id", user.institutionId || "")
            .maybeSingle();

          if (!cohortMembership) {
            throw new AuthError("Forbidden: Institution does not have an authorized relationship with this worker.", 403);
          }
        }
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
    } else {
      // If no workerProfileId provided, workers view their own
      if (user.role === "worker" && user.workerProfileId) {
        const { data, error } = await supabase
          .from("worker_consent_audit_events")
          .select("*")
          .eq("worker_profile_id", user.workerProfileId)
          .order("created_at", { ascending: false });
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        auditEvents = data || [];
      } else if (user.role !== "admin") {
        return NextResponse.json({ error: "workerProfileId is required" }, { status: 400 });
      }
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
    const body = await req.json().catch(() => ({}));
    const parsed = recordConsentSchema.parse(body);

    // Contractors and customers CANNOT record arbitrary consent for workers
    if (user.role === "contractor" || user.role === "customer") {
      throw new AuthError("Forbidden: Contractors and customers cannot create or modify worker consent records.", 403);
    }

    // Workers can create consent records ONLY for their own identity
    if (user.role === "worker") {
      await requireOwnedWorkerProfile(parsed.workerProfileId);
    } else if (user.role === "institution") {
      // Institutions can only record consent if authorized
      await requireInstitution();
    } else if (user.role !== "admin") {
      throw new AuthError("Forbidden: Insufficient privileges to record consent events.", 403);
    }

    const supabase = createAdminClient();

    if (!isConfigured.supabase) {
      return NextResponse.json({
        success: true,
        eventId: `audit-evt-${Date.now()}`,
        action: parsed.action,
        recordedAt: new Date().toISOString(),
        actorId: user.id,
        immutableEvent: true,
      }, { status: 201 });
    }

    // Actor ID is strictly set from authenticated session user.id, never trusted from client
    const result = await recordWorkerConsentAudit(supabase, {
      workerProfileId: parsed.workerProfileId,
      recipientEntityType: parsed.recipientEntityType,
      recipientEntityId: parsed.recipientEntityId,
      action: parsed.action,
      disclosedFields: parsed.disclosedFields,
      policyVersion: parsed.policyVersion,
      actorId: user.id,
    });

    return NextResponse.json({
      ...result,
      action: parsed.action,
      recordedAt: new Date().toISOString(),
      actorId: user.id,
      immutableEvent: true,
    }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 422 });
    }
    const status = err.statusCode || (err.name === "AuthError" ? 403 : 400);
    return NextResponse.json({ error: err.message }, { status });
  }
}
