import { Institution, InstitutionalCohort, CohortParticipant } from "./database.types";

export type { Institution, InstitutionalCohort, CohortParticipant };

export type InstitutionType = "state_mission" | "vocational_iti" | "polytechnic" | "ngo" | "industry_association";

export type PartnerStatus =
  | "identified"
  | "contacted"
  | "in_discussion"
  | "pilot_proposal"
  | "agreement_signed"
  | "operational";

export interface CohortWithMetrics extends InstitutionalCohort {
  enrolledCount: number;
  consentedCount: number;
  completedCount: number;
  credentialsIssuedCount: number;
  institutionName?: string;
}

export interface InstitutionalAggregateMetrics {
  totalInstitutions: number;
  operationalPartners: number;
  activeCohorts: number;
  totalEnrolledWorkers: number;
  totalConsentedWorkers: number;
  credentialsIssued: number;
  districtsCovered: string[];
  tradesCovered: string[];
}

export interface ParticipantWithWorkerDetail extends CohortParticipant {
  worker: {
    id: string;
    fullName: string;
    phoneMasked: string;
    trade: string;
    city: string;
    kaamscore: number;
    aadhaarVerified: boolean;
    slug: string;
  };
}

export interface InstitutionDashboardData {
  institution: Institution;
  cohorts: CohortWithMetrics[];
  aggregateMetrics: {
    totalTrained: number;
    activeEnrollments: number;
    credentialRate: number;
    consentRate: number;
  };
}
