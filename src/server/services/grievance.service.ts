/**
 * KAAMSETU — Grievance Domain Service
 * Handles artisan and client grievances with mandatory 7-day mediation SLA,
 * retaliatory review quarantine, and restitution verification.
 */

import {
  submitWorkerGrievance,
  evaluateRetaliatoryReviewQuarantine,
  resolveGrievanceWithRestitution,
  SubmitGrievanceInput,
} from "@/lib/disputes/grievance-service";
import { ValidationError } from "@/lib/errors/app-error";

export class GrievanceService {
  /**
   * Submits a worker grievance with automated 7-day mediation SLA
   */
  public static async submitGrievance(input: SubmitGrievanceInput) {
    if (!input.workerProfileId) {
      throw new ValidationError("Worker profile ID is required", { field: "workerProfileId" });
    }
    if (!input.disputeType) {
      throw new ValidationError("Dispute type is required", { field: "disputeType" });
    }
    if (!input.counterpartyName || input.counterpartyName.trim().length === 0) {
      throw new ValidationError("Counterparty name is required", { field: "counterpartyName" });
    }
    if (!input.evidenceNotes || input.evidenceNotes.trim().length === 0) {
      throw new ValidationError("Evidence description is required", { field: "evidenceNotes" });
    }

    return submitWorkerGrievance(input);
  }

  /**
   * Evaluates whether a client review should be quarantined due to an active dispute
   */
  public static evaluateRetaliatoryReview(options: {
    reviewRating: number;
    hasActiveDisputeWithReviewer: boolean;
    daysSinceDisputeOpened: number;
  }) {
    return evaluateRetaliatoryReviewQuarantine(options);
  }

  /**
   * Resolves a grievance with verified restitution evidence (e.g. Bank UTR / UPI Ref)
   */
  public static async resolveGrievance(options: {
    disputeId: string;
    reviewerId: string;
    resolutionStatus: "resolved_worker_upheld" | "resolved_counterparty_upheld" | "dismissed";
    resolutionSummary: string;
    restitutionUtr?: string;
  }) {
    if (!options.disputeId) {
      throw new ValidationError("Dispute ID is required", { field: "disputeId" });
    }
    if (!options.resolutionSummary || options.resolutionSummary.trim().length === 0) {
      throw new ValidationError("Resolution summary is required", { field: "resolutionSummary" });
    }
    if (options.resolutionStatus === "resolved_worker_upheld" && !options.restitutionUtr) {
      throw new ValidationError(
        "Bank UTR or UPI payment reference is mandatory when upholding a worker wage dispute",
        { field: "restitutionUtr" }
      );
    }

    return resolveGrievanceWithRestitution(options);
  }
}
