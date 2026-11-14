/**
 * KAAMSETU Two-Sided Workforce Invitation & Worker Consent Service
 *
 * Enforces Worker Self-Sovereignty:
 * Contractors CANNOT unilaterally add workers to their roster.
 * A worker MUST explicitly accept an invitation to join an organization's crew.
 * Workers retain the right to hide their association or leave at any time.
 */

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import {
  WorkforceInvitation,
  ContractorWorkforce,
  Database,
} from "@/types/database.types";
import { getContractorOrganization } from "./contractors";
import { logger } from "@/lib/security/privacy-logger";

export interface InvitationWithDetails extends WorkforceInvitation {
  organizationName: string;
  organizationCity: string;
  workerName: string;
  workerTrade: string;
}

/**
 * Creates a new workforce invitation sent to a verified worker.
 * Enforces organization roster quota before issuing invitation.
 */
export async function createWorkforceInvitation(params: {
  organizationId: string;
  workerProfileId: string;
  invitedBy: string;
  proposedRole?: string;
  proposedDailyWage?: number;
  message?: string;
}): Promise<WorkforceInvitation> {
  const role = params.proposedRole || "Crew Specialist";

  if (!isConfigured.supabase) {
    return {
      id: `inv-${Date.now()}`,
      organization_id: params.organizationId,
      worker_profile_id: params.workerProfileId,
      invited_by: params.invitedBy,
      proposed_role: role,
      proposed_daily_wage: params.proposedDailyWage || null,
      message: params.message || null,
      status: "pending",
      token: `tok_${Date.now()}`,
      expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      responded_at: null,
      created_at: new Date().toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();

  // 1. Quota check: Verify organization has remaining roster capacity
  const { data: org, error: orgErr } = await supabase
    .from("contractor_organizations")
    .select("max_roster_workers, subscription_tier")
    .eq("id", params.organizationId)
    .single();

  if (orgErr || !org) {
    throw new Error("Contractor organization not found.");
  }

  const { count: activeCount } = await supabase
    .from("contractor_workforce")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", params.organizationId)
    .eq("status", "active");

  if ((activeCount || 0) >= org.max_roster_workers) {
    throw new Error(
      `Roster limit reached (${org.max_roster_workers} workers on ${org.subscription_tier} plan). Please upgrade your subscription to invite more crew members.`
    );
  }

  // 2. Check if worker is already on the roster
  const { data: existingMember } = await supabase
    .from("contractor_workforce")
    .select("id")
    .eq("organization_id", params.organizationId)
    .eq("worker_profile_id", params.workerProfileId)
    .maybeSingle();

  if (existingMember) {
    throw new Error("Worker is already an active member of this organization's workforce roster.");
  }

  // 3. Create invitation
  const { data: invitation, error } = await supabase
    .from("workforce_invitations")
    .insert({
      organization_id: params.organizationId,
      worker_profile_id: params.workerProfileId,
      invited_by: params.invitedBy,
      proposed_role: role,
      proposed_daily_wage: params.proposedDailyWage || null,
      message: params.message || null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    logger.error("Error creating workforce invitation", { error: String(error) });
    throw error;
  }

  return invitation;
}

/**
 * Retrieves all invitations issued by an organization.
 */
export async function getOrganizationInvitations(
  organizationId: string
): Promise<InvitationWithDetails[]> {
  if (!isConfigured.supabase) {
    return [];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workforce_invitations")
    .select(`
      *,
      worker_profiles:worker_profile_id (
        id,
        occupations:occupation_id ( name ),
        profiles:user_id ( full_name )
      ),
      contractor_organizations:organization_id ( company_name, operating_city )
    `)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    organization_id: row.organization_id,
    worker_profile_id: row.worker_profile_id,
    invited_by: row.invited_by,
    proposed_role: row.proposed_role,
    proposed_daily_wage: row.proposed_daily_wage,
    message: row.message,
    status: row.status,
    token: row.token,
    expires_at: row.expires_at,
    responded_at: row.responded_at,
    created_at: row.created_at,
    organizationName: row.contractor_organizations?.company_name || "Contracting Firm",
    organizationCity: row.contractor_organizations?.operating_city || "Assam",
    workerName: row.worker_profiles?.profiles?.full_name || "Verified Worker",
    workerTrade: row.worker_profiles?.occupations?.name || "Tradesperson",
  }));
}

/**
 * Retrieves pending invitations for an authenticated worker.
 */
export async function getWorkerPendingInvitations(
  workerProfileId: string
): Promise<InvitationWithDetails[]> {
  if (!isConfigured.supabase) {
    return [
      {
        id: "inv-demo-1",
        organization_id: "org-demo-aarav-001",
        worker_profile_id: workerProfileId,
        invited_by: "22222222-2222-2222-2222-222222220001",
        proposed_role: "Lead Solar Electrician",
        proposed_daily_wage: 1600,
        message: "We would like to add you to our solar installations crew in Guwahati.",
        status: "pending",
        token: "tok_demo_inv_1",
        expires_at: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        responded_at: null,
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        organizationName: "Mehta Infra & Solar Engineering",
        organizationCity: "Guwahati",
        workerName: "Rameshwar Sharma",
        workerTrade: "Electrical & Solar",
      },
    ];
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workforce_invitations")
    .select(`
      *,
      contractor_organizations:organization_id ( company_name, operating_city ),
      worker_profiles:worker_profile_id (
        id,
        occupations:occupation_id ( name ),
        profiles:user_id ( full_name )
      )
    `)
    .eq("worker_profile_id", workerProfileId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    organization_id: row.organization_id,
    worker_profile_id: row.worker_profile_id,
    invited_by: row.invited_by,
    proposed_role: row.proposed_role,
    proposed_daily_wage: row.proposed_daily_wage,
    message: row.message,
    status: row.status,
    token: row.token,
    expires_at: row.expires_at,
    responded_at: row.responded_at,
    created_at: row.created_at,
    organizationName: row.contractor_organizations?.company_name || "Contracting Firm",
    organizationCity: row.contractor_organizations?.operating_city || "Assam",
    workerName: row.worker_profiles?.profiles?.full_name || "Verified Worker",
    workerTrade: row.worker_profiles?.occupations?.name || "Tradesperson",
  }));
}

/**
 * Worker accepts or rejects an invitation.
 * Upon acceptance, worker is enrolled into `contractor_workforce`.
 */
export async function respondToWorkforceInvitation(params: {
  invitationId: string;
  workerUserId: string;
  action: "accept" | "reject";
}): Promise<{
  invitation: WorkforceInvitation;
  workforceMember?: ContractorWorkforce;
}> {
  if (!isConfigured.supabase) {
    const mockInv: WorkforceInvitation = {
      id: params.invitationId,
      organization_id: "org-demo-aarav-001",
      worker_profile_id: "55555555-5555-5555-5555-555555550001",
      invited_by: "demo-contractor",
      proposed_role: "Lead Solar Electrician",
      proposed_daily_wage: 1600,
      message: null,
      status: params.action === "accept" ? "accepted" : "rejected",
      token: "tok_demo",
      expires_at: new Date().toISOString(),
      responded_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    return { invitation: mockInv };
  }

  const supabase = await createServerSupabaseClient();

  // 1. Fetch invitation and verify worker owns the target profile
  const { data: inv, error: invError } = await supabase
    .from("workforce_invitations")
    .select(`
      *,
      worker_profiles:worker_profile_id ( id, user_id )
    `)
    .eq("id", params.invitationId)
    .single();

  if (invError || !inv) {
    throw new Error("Invitation not found.");
  }

  if ((inv as any).worker_profiles?.user_id !== params.workerUserId) {
    throw new Error("Forbidden: You do not have permission to respond to this invitation.");
  }

  if (inv.status !== "pending") {
    throw new Error(`Invitation has already been ${inv.status}.`);
  }

  const newStatus = params.action === "accept" ? "accepted" : "rejected";
  const now = new Date().toISOString();

  // 2. Update invitation status
  const { data: updatedInv, error: updateInvError } = await supabase
    .from("workforce_invitations")
    .update({
      status: newStatus,
      responded_at: now,
    })
    .eq("id", params.invitationId)
    .select("*")
    .single();

  if (updateInvError || !updatedInv) {
    throw updateInvError;
  }

  // 3. If accepted, add worker to contractor_workforce
  let workforceMember: ContractorWorkforce | undefined;
  if (params.action === "accept") {
    const { data: member, error: memberError } = await supabase
      .from("contractor_workforce")
      .insert({
        organization_id: inv.organization_id,
        worker_profile_id: inv.worker_profile_id,
        project_role: inv.proposed_role,
        daily_wage_rate: inv.proposed_daily_wage,
        status: "active",
        invitation_id: inv.id,
        is_public_on_roster: true,
      })
      .select("*")
      .single();

    if (memberError) {
      logger.error("Failed to add worker to workforce after invitation acceptance", { error: String(memberError) });
      throw memberError;
    }
    workforceMember = member;
  }

  return { invitation: updatedInv, workforceMember };
}

/**
 * Worker updates their association visibility on the contractor roster.
 */
export async function updateWorkerRosterVisibility(
  workforceId: string,
  workerUserId: string,
  isPublic: boolean
): Promise<void> {
  if (!isConfigured.supabase) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("contractor_workforce")
    .update({ is_public_on_roster: isPublic })
    .eq("id", workforceId);

  if (error) throw error;
}

/**
 * Worker leaves an organization at will.
 * Worker self-sovereignty invariant: An organization cannot hold a worker hostage.
 */
export async function workerLeaveOrganization(
  organizationId: string,
  workerProfileId: string,
  workerUserId: string
): Promise<void> {
  if (!isConfigured.supabase) return;

  const supabase = await createServerSupabaseClient();

  // Verify ownership
  const { data: wp } = await supabase
    .from("worker_profiles")
    .select("id, user_id")
    .eq("id", workerProfileId)
    .single();

  if (!wp || wp.user_id !== workerUserId) {
    throw new Error("Forbidden: You can only remove yourself from an organization.");
  }

  const { error } = await supabase
    .from("contractor_workforce")
    .delete()
    .eq("organization_id", organizationId)
    .eq("worker_profile_id", workerProfileId);

  if (error) throw error;
}
