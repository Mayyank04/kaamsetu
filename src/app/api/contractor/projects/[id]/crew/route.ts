import { NextRequest } from "next/server";
import { requireContractor } from "@/lib/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";
import { handleApiError, createSuccessResponse } from "@/lib/error/handler";
import { logger } from "@/lib/security/privacy-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireContractor();
    const { id: projectId } = await params;

    if (!isConfigured.supabase) {
      return createSuccessResponse({
        projectId,
        crew: [
          {
            assignmentId: "crew-demo-1",
            workforceId: "wf-demo-1",
            workerName: "Rameshwar Sharma",
            trade: "Master Teak Wood Carpenter",
            assignedRole: "Site Carpenter Lead",
            status: "active",
            startDate: "2026-11-01",
          },
        ],
      });
    }

    const supabase = await createServerSupabaseClient();

    // Verify contractor ownership of project
    const { data: project } = await supabase
      .from("contractor_projects")
      .select("id, organization_id, contractor_organizations!inner(owner_id)")
      .eq("id", projectId)
      .single();

    if (!project) {
      return handleApiError(new Error("Project not found or unauthorized."));
    }

    const { data: assignments, error } = await supabase
      .from("project_crew_assignments")
      .select(`
        id,
        project_id,
        workforce_id,
        assigned_role,
        start_date,
        end_date,
        status,
        contractor_workforce!inner (
          id,
          project_role,
          worker_profiles (
            id,
            registry_id,
            headline,
            kaamscore,
            profiles (full_name, phone)
          )
        )
      `)
      .eq("project_id", projectId);

    if (error) throw error;
    return createSuccessResponse({ projectId, crew: assignments || [] });
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireContractor();
    const { id: projectId } = await params;
    const body = await request.json();
    const { workforceId, assignedRole, startDate, endDate } = body;

    if (!workforceId || !assignedRole) {
      return handleApiError(new Error("workforceId and assignedRole are required fields."));
    }

    if (!isConfigured.supabase) {
      return createSuccessResponse({
        id: `assign-demo-${Date.now()}`,
        projectId,
        workforceId,
        assignedRole,
        startDate: startDate || new Date().toISOString().split("T")[0],
        status: "active",
      });
    }

    const supabase = await createServerSupabaseClient();

    // Verify contractor owns the project
    const { data: project } = await supabase
      .from("contractor_projects")
      .select("id, organization_id, contractor_organizations!inner(owner_id)")
      .eq("id", projectId)
      .single();

    if (!project) {
      return handleApiError(new Error("Project not found or unauthorized."));
    }

    const { data: assignment, error } = await supabase
      .from("project_crew_assignments")
      .insert({
        project_id: projectId,
        workforce_id: workforceId,
        assigned_by: user.id,
        assigned_role: assignedRole,
        start_date: startDate || new Date().toISOString().split("T")[0],
        end_date: endDate || null,
        status: "active",
      })
      .select("*")
      .single();

    if (error) {
      logger.error("Failed to assign worker to project crew", { error: String(error) });
      throw error;
    }

    return createSuccessResponse(assignment);
  } catch (err: any) {
    return handleApiError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireContractor();
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return handleApiError(new Error("assignmentId query parameter required."));
    }

    if (!isConfigured.supabase) {
      return createSuccessResponse({ success: true, released: true });
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("project_crew_assignments")
      .delete()
      .eq("id", assignmentId)
      .eq("project_id", projectId);

    if (error) throw error;
    return createSuccessResponse({ success: true, released: true });
  } catch (err: any) {
    return handleApiError(err);
  }
}
