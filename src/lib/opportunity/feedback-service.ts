import { createAdminClient } from "@/lib/supabase/admin";

export type OpportunityReportType =
  | "misleading_terms"
  | "unpaid_wages"
  | "unsafe_conditions"
  | "fake_opportunity"
  | "discriminatory_treatment";

export interface SubmitFeedbackInput {
  opportunityId: string;
  reporterProfileId: string;
  reportType: OpportunityReportType;
  details: string;
}

/**
 * Submits feedback or abuse reports against a workforce opportunity
 */
export async function submitOpportunityFeedback(input: SubmitFeedbackInput) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  if (!input.opportunityId) {
    throw new Error("opportunityId is required");
  }

  if (!input.details || input.details.trim().length < 5) {
    throw new Error("details must be at least 5 characters long");
  }

  const { data, error } = await supabase
    .from("opportunity_feedback_reports")
    .insert({
      opportunity_id: input.opportunityId,
      reporter_profile_id: input.reporterProfileId,
      report_type: input.reportType,
      details: input.details.trim(),
      status: "submitted",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit opportunity feedback: ${error.message}`);
  }

  return data;
}

/**
 * Gets feedback reports for a specific opportunity (for moderation)
 */
export async function getOpportunityFeedback(opportunityId: string) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("opportunity_feedback_reports")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch feedback reports: ${error.message}`);
  }

  return data || [];
}

/**
 * Updates moderation status of an opportunity feedback report
 */
export async function moderateOpportunityFeedback(
  reportId: string,
  status: "investigating" | "action_taken" | "dismissed",
  actionTaken?: string
) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("opportunity_feedback_reports")
    .update({
      status,
      action_taken: actionTaken || null,
    })
    .eq("id", reportId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to moderate feedback: ${error.message}`);
  }

  return data;
}
