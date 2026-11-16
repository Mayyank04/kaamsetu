/**
 * KAAMSETU — Institutional Domain Service
 * Encapsulates training partner cohort tracking, participant progress, and credential issuance.
 */

import { InstitutionRepository } from "../database/repositories/institution.repository";
import { Institution } from "@/types/database.types";
import { CohortWithMetrics, ParticipantWithWorkerDetail } from "@/types/institution";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";

export class InstitutionService {
  /**
   * Retrieves list of institutions, optionally filtered
   */
  public static async listInstitutions(district?: string, status?: string): Promise<Institution[]> {
    return InstitutionRepository.list(district, status);
  }

  /**
   * Retrieves training institute by primary ID
   */
  public static async getInstitutionById(institutionId: string): Promise<Institution> {
    if (!institutionId) {
      throw new ValidationError("Institution ID is required", { field: "institutionId" });
    }
    return InstitutionRepository.findById(institutionId);
  }

  /**
   * Retrieves active training cohorts for an institution
   */
  public static async getCohorts(institutionId: string): Promise<CohortWithMetrics[]> {
    if (!institutionId) {
      throw new ValidationError("Institution ID is required", { field: "institutionId" });
    }
    return InstitutionRepository.findCohorts(institutionId);
  }

  /**
   * Retrieves enrolled participants in a specific training cohort
   */
  public static async getCohortParticipants(cohortId: string): Promise<ParticipantWithWorkerDetail[]> {
    if (!cohortId) {
      throw new ValidationError("Cohort ID is required", { field: "cohortId" });
    }
    return InstitutionRepository.findParticipants(cohortId);
  }
}
