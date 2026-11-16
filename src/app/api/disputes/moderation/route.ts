import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireAuthenticatedUser,
  requireOwnedWorkerProfile,
  requireModerator,
  AuthError,
} from "@/lib/auth/server";
import { resolveReviewModerationAppeal } from "@/lib/disputes/review-integrity-service";

const createAppealSchema = z.object({
  reviewId: z.string().min(1, "reviewId is required"),
  workerProfileId: z.string().min(1, "workerProfileId is required"),
  contractorOrganizationId: z.string().optional().nullable(),
  disputeId: z.string().optional().nullable(),
  originalRating: z.number().int().min(1).max(5),
  quarantineReason: z.string().min(5, "quarantineReason must be at least 5 characters"),
  submittedEvidence: z.array(z.string()).default([]),
});

const resolveAppealSchema = z.object({
  appealId: z.string().min(1, "appealId is required"),
  newStatus: z.enum(["restored_valid", "suppressed_retaliatory", "dismissed"]),
  resolutionNotes: z.string().min(5, "resolutionNotes must be at least 5 characters"),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const supabase = createAdminClient();
    const { searchParams } = new URL(req.url);
    const workerProfileId = searchParams.get("workerProfileId");

    // Authorization: Worker can only view their own appeals
    if (user.role === "worker") {
      const targetWorkerId = workerProfileId || user.workerProfileId;
      if (!targetWorkerId) {
        return NextResponse.json({ error: "workerProfileId is required for workers" }, { status: 400 });
      }
      await requireOwnedWorkerProfile(targetWorkerId);
    } else if (user.role !== "admin" && (user.role as string) !== "moderator" && (user.role as string) !== "ombudsperson") {
      throw new AuthError("Access denied: You do not have permission to view moderation appeals.", 403);
    }

    let query = supabase.from("review_moderation_appeals").select("*").order("created_at", { ascending: false });
    if (workerProfileId) {
      query = query.eq("worker_profile_id", workerProfileId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ appeals: data });
  } catch (err: any) {
    const status = err.statusCode || (err.name === "AuthError" ? 401 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    const body = await req.json().catch(() => ({}));
    const parsed = createAppealSchema.parse(body);

    const supabase = createAdminClient();

    // 1. Role verification: Workers can appeal only reviews on their own profile
    if (user.role === "worker") {
      await requireOwnedWorkerProfile(parsed.workerProfileId);
    } else if (user.role !== "admin") {
      throw new AuthError("Forbidden: Only the profile owner or an administrator can submit a review appeal.", 403);
    }

    // 2. Relationship validation: Verify review exists and belongs to the claimed worker
    if (!user.isDemo) {
      const { data: review, error: rErr } = await supabase
        .from("reviews")
        .select("id, worker_profile_id, booking_id, rating")
        .eq("id", parsed.reviewId)
        .maybeSingle();

      if (rErr || !review) {
        return NextResponse.json({ error: "Target review not found." }, { status: 404 });
      }

      if (review.worker_profile_id !== parsed.workerProfileId) {
        return NextResponse.json(
          { error: "Forbidden: Review does not belong to the declared worker profile." },
          { status: 403 }
        );
      }

      // 3. Replay prevention: Check if an active appeal already exists for this review
      const { data: existingAppeal } = await supabase
        .from("review_moderation_appeals")
        .select("id, moderation_status")
        .eq("review_id", parsed.reviewId)
        .in("moderation_status", ["quarantined", "under_review", "pending"])
        .maybeSingle();

      if (existingAppeal) {
        return NextResponse.json(
          { error: "Conflict: An active moderation appeal is already pending for this review.", appealId: existingAppeal.id },
          { status: 409 }
        );
      }
    }

    // 4. Record new appeal
    const { data, error } = await supabase
      .from("review_moderation_appeals")
      .insert({
        review_id: parsed.reviewId,
        worker_profile_id: parsed.workerProfileId,
        contractor_organization_id: parsed.contractorOrganizationId || null,
        dispute_id: parsed.disputeId || null,
        original_rating: parsed.originalRating,
        quarantine_reason: parsed.quarantineReason,
        submitted_evidence: parsed.submittedEvidence,
        moderation_status: "quarantined",
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, appealId: data.id, moderationStatus: "quarantined" }, { status: 201 });
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
    const moderator = await requireModerator();
    const body = await req.json().catch(() => ({}));
    const parsed = resolveAppealSchema.parse(body);

    const supabase = createAdminClient();

    // Moderator ID is strictly set from authenticated session, never client-supplied
    const result = await resolveReviewModerationAppeal(supabase, parsed.appealId, {
      moderatorId: moderator.id,
      newStatus: parsed.newStatus,
      resolutionNotes: parsed.resolutionNotes,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 422 });
    }
    const status = err.statusCode || (err.name === "AuthError" ? 403 : 500);
    return NextResponse.json({ error: err.message }, { status });
  }
}
