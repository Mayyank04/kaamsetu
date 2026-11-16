/**
 * KAAMSETU — Institution Repository
 * Encapsulates database access for training institutes, cohorts, and participants.
 */

import {
  getInstitutions,
  getInstitutionById,
  getInstitutionCohorts,
  getCohortParticipants,
} from "@/lib/supabase/db/institutions";
import { CohortWithMetrics, ParticipantWithWorkerDetail } from "@/types/institution";
import { Institution } from "@/types/database.types";
import { NotFoundError } from "@/lib/errors/app-error";

export class InstitutionRepository {
  /**
   * Lists training institutes, optionally filtered by district and partner status
   */
  public static async list(district?: string, status?: string): Promise<Institution[]> {
    return getInstitutions(district, status);
  }

  /**
   * Retrieves training institute by ID
   */
  public static async findById(id: string): Promise<Institution> {
    const institution = await getInstitutionById(id);
    if (!institution) {
      throw new NotFoundError("Institution", id);
    }
    return institution;
  }

  /**
   * Retrieves training cohorts for an institute
   */
  public static async findCohorts(
    institutionId: string
  ): Promise<CohortWithMetrics[]> {
    return getInstitutionCohorts(institutionId);
  }

  /**
   * Retrieves enrolled participants in a cohort
   */
  public static async findParticipants(
    cohortId: string
  ): Promise<ParticipantWithWorkerDetail[]> {
    return getCohortParticipants(cohortId);
  }
}
