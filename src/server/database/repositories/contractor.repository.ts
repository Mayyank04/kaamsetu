/**
 * KAAMSETU — Contractor Repository
 * Encapsulates database access for contractor enterprises, projects, and workforce rosters.
 */

import {
  getContractorOrganization,
  getContractorWorkforce,
  getContractorProjects,
  createContractorProject,
  InsertContractorProject,
} from "@/lib/supabase/db/contractors";
import { WorkforceMemberWithDetails } from "@/types/contractor";
import { ContractorOrganization, ContractorProject } from "@/types/database.types";
import { NotFoundError } from "@/lib/errors/app-error";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isConfigured } from "@/lib/env";

export class ContractorRepository {
  /**
   * Retrieves contractor enterprise by user ID
   */
  public static async findByUserId(userId: string): Promise<ContractorOrganization | null> {
    return getContractorOrganization(userId);
  }

  /**
   * Retrieves contractor enterprise by organization ID
   */
  public static async findById(id: string): Promise<ContractorOrganization> {
    if (!isConfigured.supabase) {
      const org = await getContractorOrganization("owner-demo");
      if (org) return { ...org, id };
    }
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("contractor_organizations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      throw new NotFoundError("Contractor organization", id);
    }
    return data;
  }

  /**
   * Retrieves workforce crew roster for an organization
   */
  public static async findWorkforce(
    orgId: string
  ): Promise<WorkforceMemberWithDetails[]> {
    return getContractorWorkforce(orgId);
  }

  /**
   * Retrieves active projects for an organization
   */
  public static async findProjects(orgId: string): Promise<ContractorProject[]> {
    return getContractorProjects(orgId);
  }

  /**
   * Creates a new project deployment
   */
  public static async createProject(
    orgId: string,
    project: Omit<InsertContractorProject, "id" | "organization_id" | "created_at" | "updated_at">
  ): Promise<ContractorProject> {
    return createContractorProject(orgId, project);
  }
}
