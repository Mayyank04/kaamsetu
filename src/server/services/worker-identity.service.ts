/**
 * KAAMSETU — Worker Identity Service
 * Orchestrates worker profile lookups, visibility controls, and trust score computation.
 */

import { WorkerRepository } from "../database/repositories/worker.repository";
import { WorkerProfile } from "@/types/database.types";
import { WorkerProfileWithRelations, WorkerFilterParams } from "@/lib/supabase/db/profiles";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { calculateKaamScore, ScoreInputs, KaamScoreBreakdown } from "@/lib/scoring/kaamscore";

export class WorkerIdentityService {
  /**
   * Retrieves public artisan profile by URL slug
   */
  public static async getProfileBySlug(slug: string): Promise<WorkerProfileWithRelations> {
    if (!slug) {
      throw new ValidationError("Slug parameter is required", { field: "slug" });
    }
    return WorkerRepository.findBySlug(slug);
  }

  /**
   * Retrieves artisan profile by authenticated user ID
   */
  public static async getProfileByUserId(userId: string): Promise<WorkerProfile | null> {
    if (!userId) {
      throw new ValidationError("User ID is required", { field: "userId" });
    }
    return WorkerRepository.findByUserId(userId);
  }

  /**
   * Lists published profiles matching search filter criteria
   */
  public static async searchProfiles(filters: WorkerFilterParams = {}): Promise<WorkerProfile[]> {
    return WorkerRepository.findPublished(filters);
  }

  /**
   * Updates artisan profile visibility mode
   */
  public static async setProfileVisibility(
    workerProfileId: string,
    isPublished: boolean
  ): Promise<WorkerProfile> {
    return WorkerRepository.setPublished(workerProfileId, isPublished);
  }

  /**
   * Evaluates trust score from evidence dimensions
   */
  public static evaluateScore(params: {
    hasVoiceAttestation: boolean;
    workerConfirmedVoice: boolean;
    yearsExperience: number | null;
    verifiedSkillsCount?: number;
    completedBookingsCount?: number;
    peerEndorsementsCount?: number;
    officialGovVerified?: boolean;
    languageUsed?: string;
  }): KaamScoreBreakdown {
    const inputs: ScoreInputs = {
      hasVoiceAttestation: Boolean(params.hasVoiceAttestation),
      workerConfirmedVoice: Boolean(params.workerConfirmedVoice),
      yearsExperience: params.yearsExperience,
      verifiedSkillsCount: params.verifiedSkillsCount ?? 0,
      completedBookingsCount: params.completedBookingsCount ?? 0,
      peerEndorsementsCount: params.peerEndorsementsCount ?? 0,
      officialGovVerified: Boolean(params.officialGovVerified),
      languageUsed: params.languageUsed,
    };
    return calculateKaamScore(inputs);
  }
}
