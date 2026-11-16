/**
 * KAAMSETU — Contractor Enterprise Domain Service
 * Encapsulates enterprise crew management, project allocation, and subscription billing.
 */

import { ContractorRepository } from "../database/repositories/contractor.repository";
import {
  PRICING_PLANS,
  SubscriptionTier,
  BillingCycle,
  calculateBillingBreakdown,
  OrderBillingBreakdown,
} from "@/lib/config/pricing-plans";
import { ContractorOrganization, ContractorProject } from "@/types/database.types";
import { InsertContractorProject } from "@/lib/supabase/db/contractors";
import { WorkforceMemberWithDetails } from "@/types/contractor";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";

export class ContractorService {
  /**
   * Retrieves organization details for a user
   */
  public static async getOrganizationByUserId(userId: string): Promise<ContractorOrganization | null> {
    if (!userId) {
      throw new ValidationError("User ID is required", { field: "userId" });
    }
    return ContractorRepository.findByUserId(userId);
  }

  /**
   * Retrieves organization by its primary ID
   */
  public static async getOrganizationById(orgId: string): Promise<ContractorOrganization> {
    if (!orgId) {
      throw new ValidationError("Organization ID is required", { field: "orgId" });
    }
    return ContractorRepository.findById(orgId);
  }

  /**
   * Retrieves enterprise crew roster for an organization
   */
  public static async getWorkforceRoster(
    orgId: string
  ): Promise<WorkforceMemberWithDetails[]> {
    if (!orgId) {
      throw new ValidationError("Organization ID is required", { field: "orgId" });
    }
    return ContractorRepository.findWorkforce(orgId);
  }

  /**
   * Retrieves projects managed by a contractor organization
   */
  public static async getProjects(orgId: string): Promise<ContractorProject[]> {
    if (!orgId) {
      throw new ValidationError("Organization ID is required", { field: "orgId" });
    }
    return ContractorRepository.findProjects(orgId);
  }

  /**
   * Creates and registers a new project deployment
   */
  public static async createProject(
    orgId: string,
    project: Omit<InsertContractorProject, "id" | "organization_id" | "created_at" | "updated_at">
  ): Promise<ContractorProject> {
    if (!orgId) {
      throw new ValidationError("Organization ID is required", { field: "orgId" });
    }
    if (!project.title || project.title.trim().length === 0) {
      throw new ValidationError("Project title is required", { field: "title" });
    }
    return ContractorRepository.createProject(orgId, project);
  }

  /**
   * Calculates subscription billing breakdown with tax summary (18% GST)
   */
  public static getBillingBreakdown(
    tier: SubscriptionTier,
    cycle: BillingCycle = "monthly"
  ): OrderBillingBreakdown {
    if (!PRICING_PLANS[tier]) {
      throw new ValidationError(`Invalid subscription tier: ${tier}`, { field: "tier" });
    }
    return calculateBillingBreakdown(tier, cycle);
  }
}
