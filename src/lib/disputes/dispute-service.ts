import { createAdminClient } from "@/lib/supabase/admin";

export type DisputeType =
  | "unpaid_wages"
  | "incorrect_work_record"
  | "false_review"
  | "unauthorized_sharing"
  | "credential_discrepancy"
  | "contractor_harassment"
  | "account_recovery";

export type DisputeStatus =
  | "submitted"
  | "under_review"
  | "in_mediation"
  | "resolved_worker_upheld"
  | "resolved_counterparty_upheld"
  | "dismissed"
  | "appealed";

export interface FileDisputeInput {
  workerProfileId: string;
  disputeType: DisputeType;
  counterpartyName: string;
  targetId?: string | null;
  evidenceNotes: string;
  claimedAmount?: number | null;
}

export interface ResolveDisputeInput {
  disputeId: string;
  status: DisputeStatus;
  resolutionSummary: string;
  assignedReviewerId?: string | null;
}

/**
 * Files a new worker grievance or dispute.
 * Free of charge, fail-safe, auditable.
 */
export async function fileWorkerDispute(input: FileDisputeInput) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  if (!input.workerProfileId) {
    throw new Error("workerProfileId is required to file a dispute");
  }

  if (!input.counterpartyName || input.counterpartyName.trim().length === 0) {
    throw new Error("counterpartyName is required");
  }

  if (!input.evidenceNotes || input.evidenceNotes.trim().length < 5) {
    throw new Error("evidenceNotes must contain at least 5 characters of factual detail");
  }

  const { data, error } = await supabase
    .from("worker_disputes")
    .insert({
      worker_profile_id: input.workerProfileId,
      dispute_type: input.disputeType,
      counterparty_name: input.counterpartyName.trim(),
      target_id: input.targetId || null,
      evidence_notes: input.evidenceNotes.trim(),
      claimed_amount: input.claimedAmount ?? null,
      status: "submitted",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit worker dispute: ${error.message}`);
  }

  return data;
}

/**
 * Retrieves all disputes filed by a specific worker.
 */
export async function getDisputesForWorker(workerProfileId: string) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("worker_disputes")
    .select("*")
    .eq("worker_profile_id", workerProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch disputes: ${error.message}`);
  }

  return data || [];
}

/**
 * Retrieves all disputes across the platform for administrative mediation.
 */
export async function getAllDisputes(options?: {
  status?: DisputeStatus;
  disputeType?: DisputeType;
  limit?: number;
}) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  let query = supabase
    .from("worker_disputes")
    .select(`
      *,
      worker_profiles:worker_profile_id (
        id,
        user_id,
        full_name,
        slug
      )
    `)
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.disputeType) {
    query = query.eq("dispute_type", options.disputeType);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch administrative disputes: ${error.message}`);
  }

  return data || [];
}

/**
 * Resolves or updates status of a dispute.
 */
export async function resolveDispute(input: ResolveDisputeInput) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const isTerminal =
    input.status === "resolved_worker_upheld" ||
    input.status === "resolved_counterparty_upheld" ||
    input.status === "dismissed";

  const { data, error } = await supabase
    .from("worker_disputes")
    .update({
      status: input.status,
      resolution_summary: input.resolutionSummary,
      assigned_reviewer_id: input.assignedReviewerId || null,
      resolved_at: isTerminal ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.disputeId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update dispute status: ${error.message}`);
  }

  return data;
}
