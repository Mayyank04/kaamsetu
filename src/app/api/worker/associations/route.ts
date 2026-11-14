import { NextRequest } from "next/server";
import { requireWorker } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { workerLeaveOrganization, updateWorkerRosterVisibility } from "@/lib/supabase/db/invitations";
import { recordWorkerAssociationEvent } from "@/lib/billing/payment-service";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";

export async function GET() {
  try {
    const user = await requireWorker();

    if (!isConfigured.supabase) {
      return createSuccessResponse({
        associations: [
          {
            id: "assoc-demo-1",
            organizationId: "org-demo-aarav-001",
            companyName: "Aarav Builders & Construction",
            projectRole: "Lead Carpenter",
            dailyWageRate: 1400,
            isPublicOnRoster: true,
            status: "active",
            joinedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
          },
        ],
      });
    }

    const supabase = await createServerSupabaseClient();
    const { data: wp } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!wp) {
      return createSuccessResponse({ associations: [] });
    }

    const { data, error } = await supabase
      .from("contractor_workforce")
      .select(`
        id,
        organization_id,
        project_role,
        daily_wage_rate,
        is_public_on_roster,
        status,
        joined_at,
        contractor_organizations (
          id,
          company_name,
          operating_city,
          operating_state
        )
      `)
      .eq("worker_profile_id", wp.id);

    if (error) throw error;

    const associations = (data || []).map((row: any) => ({
      id: row.id,
      organizationId: row.organization_id,
      companyName: row.contractor_organizations?.company_name || "Enterprise Contractor",
      city: row.contractor_organizations?.operating_city,
      state: row.contractor_organizations?.operating_state,
      projectRole: row.project_role,
      dailyWageRate: row.daily_wage_rate,
      isPublicOnRoster: row.is_public_on_roster,
      status: row.status,
      joinedAt: row.joined_at,
    }));

    return createSuccessResponse({ associations });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireWorker();
    const body = await req.json();
    const { action, organizationId, workforceId, isPublic, reason } = body;

    const supabase = await createServerSupabaseClient();
    const { data: wp } = await supabase
      .from("worker_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!wp) {
      return handleApiError(new Error("Worker profile not found"));
    }

    if (action === "toggle_visibility") {
      if (!workforceId || typeof isPublic !== "boolean") {
        return handleApiError(new Error("workforceId and isPublic boolean required"));
      }
      await updateWorkerRosterVisibility(workforceId, user.id, isPublic);
      await recordWorkerAssociationEvent({
        workerId: wp.id,
        organizationId,
        action: isPublic ? "made_public" : "hidden",
        actorUserId: user.id,
        reason: reason || "Worker adjusted public roster visibility preference",
      });
      return createSuccessResponse({ success: true, isPublic });
    }

    if (action === "withdraw") {
      if (!organizationId) {
        return handleApiError(new Error("organizationId required to withdraw"));
      }
      await workerLeaveOrganization(organizationId, wp.id, user.id);
      await recordWorkerAssociationEvent({
        workerId: wp.id,
        organizationId,
        action: "withdrawn",
        actorUserId: user.id,
        reason: reason || "Worker voluntarily withdrew from contractor roster",
      });
      return createSuccessResponse({ success: true, withdrawn: true });
    }

    return handleApiError(new Error("Invalid action. Supported: 'toggle_visibility', 'withdraw'"));
  } catch (error) {
    return handleApiError(error);
  }
}
