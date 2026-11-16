import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";
import {
  requireAuthenticatedUser,
  requireWorker,
  requireOwnedWorkerProfile,
  requireModerator,
  AuthError,
} from "@/lib/auth/server";
import {
  submitWorkerGrievance,
  resolveGrievanceWithRestitution,
} from "@/lib/disputes/grievance-service";
import { validateGrievanceRateLimit } from "@/lib/security/rate-limiter";

const submitGrievanceSchema = z.object({
  workerProfileId: z.string().min(1, "workerProfileId is required"),
  disputeType: z.enum([
    "unpaid_wages",
    "incorrect_work_record",
    "false_review",
    "unauthorized_sharing",
    "credential_discrepancy",
    "contractor_harassment",
    "account_recovery",
  ]),
  counterpartyName: z.string().min(1, "counterpartyName is required"),
  evidenceNotes: z.string().min(5, "evidenceNotes must be at least 5 characters"),
  claimedAmount: z.number().nonnegative().optional(),
  confidentialEvidenceUrls: z.array(z.string().url()).optional(),
  isRetaliatorySuspected: z.boolean().optional(),
});

const resolveGrievanceSchema = z.object({
  disputeId: z.string().min(1, "disputeId is required"),
  resolutionStatus: z.enum(["resolved_worker_upheld", "resolved_counterparty_upheld", "dismissed"]),
  resolutionSummary: z.string().min(5, "resolutionSummary must be at least 5 characters"),
  restitutionUtr: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get("workerProfileId");

    if (!workerProfileId) {
      return NextResponse.json({ error: "Missing workerProfileId" }, { status: 400 });
    }

    // Authorization: Worker can only access their own grievances; moderators/admins can access any
    if (user.role === "worker") {
      await requireOwnedWorkerProfile(workerProfileId);
    } else if (user.role !== "admin" && (user.role as string) !== "moderator" && (user.role as string) !== "ombudsperson") {
      throw new AuthError("Access denied: You do not have permission to view these grievances.", 403);
    }

    if (!isConfigured.supabase) {
      return NextResponse.json({
        success: true,
        grievances: [],
      });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("worker_disputes")
      .select("*")
      .eq("worker_profile_id", workerProfileId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, grievances: data || [] });
  } catch (err: any) {
    const status = err.statusCode || (err.name === "AuthError" ? 401 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireWorker();

    // Rate limit check: max 3 grievance submissions per hour per worker/IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateLimit = await validateGrievanceRateLimit(user.id, clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.reason, remainingSeconds: rateLimit.remainingSeconds },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = submitGrievanceSchema.parse(body);

    // Verify worker ownership of the profile
    await requireOwnedWorkerProfile(parsed.workerProfileId);

    const grievance = await submitWorkerGrievance({
      workerProfileId: parsed.workerProfileId,
      disputeType: parsed.disputeType,
      counterpartyName: parsed.counterpartyName,
      evidenceNotes: parsed.evidenceNotes,
      claimedAmount: parsed.claimedAmount,
      confidentialEvidenceUrls: parsed.confidentialEvidenceUrls,
      isRetaliatorySuspected: parsed.isRetaliatorySuspected,
    });

    return NextResponse.json({ success: true, grievance }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 422 });
    }
    const status = err.statusCode || (err.name === "AuthError" ? 403 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Only moderators, ombudspersons, or administrators can resolve grievances
    const moderator = await requireModerator();
    const body = await req.json();
    const parsed = resolveGrievanceSchema.parse(body);

    // Reviewer identity must be bound to the authenticated moderator, never client-supplied
    const resolved = await resolveGrievanceWithRestitution({
      disputeId: parsed.disputeId,
      reviewerId: moderator.id,
      resolutionStatus: parsed.resolutionStatus,
      resolutionSummary: parsed.resolutionSummary,
      restitutionUtr: parsed.restitutionUtr || undefined,
    });

    return NextResponse.json({ success: true, dispute: resolved });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 422 });
    }
    const status = err.statusCode || (err.name === "AuthError" ? 403 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}
