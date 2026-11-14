import { SupportedLanguageCode } from "@/schemas/onboarding.schema";

export type RecruitmentChannel =
  | "independent_chowk"
  | "trade_referral"
  | "local_contractor"
  | "vocational_network";

export type AssistanceLevel =
  | "independent"
  | "assisted"
  | "facilitator_guided";

export type AudioClarityRating =
  | "clear"
  | "moderate_noise"
  | "heavy_noise";

export interface PilotConsentRecord {
  status: "consented" | "declined" | "pending";
  type: "verbal_audio" | "written_paper";
  timestamp: string;
  allowsPublicListing: boolean; // If false, worker chooses private QR-only identity
  understandsCryptographicVsRealProof: boolean;
  notes?: string;
}

export interface PilotOnboardingMetrics {
  startedAt?: string;
  completedAt?: string;
  mode: "voice" | "text";
  audioDurationSeconds?: number;
  audioClarity: AudioClarityRating;
  fieldsStatedCount: number;
  fieldsUnstatedCount: number; // Experience or rate left unknown / unmentioned
  correctionsCount: number;
  timeSpentSeconds?: number;
  assistanceLevel: AssistanceLevel;
  status: "completed" | "in_progress" | "abandoned";
  dropOffStage?: string;
}

export interface PilotCredentialRecord {
  registryId?: string;
  qrGenerated: boolean;
  qrScannedSuccessfully: boolean;
  scannedDevicesCount: number;
}

export interface PilotCustomerValidationMetrics {
  enquiriesReceived: number;
  bookingsRequested: number;
  bookingsAccepted: number;
  bookingsCompleted: number;
  reviewsReceived: number;
}

export interface PilotWorkerFeedback {
  comprehendsQR: boolean;
  comprehendsTrustScore: boolean;
  satisfactionRating: 1 | 2 | 3 | 4 | 5;
  primaryFeedbackNote: string;
  reportedUsabilityIssues: string[];
}

export interface PilotParticipant {
  id: string; // Pseudonymous, e.g. PILOT-AS-001
  cohort: "guwahati_pilot_v1";
  occupation: string;
  tradeCategory: string;
  preferredLanguage: SupportedLanguageCode;
  recruitmentChannel: RecruitmentChannel;
  location: {
    city: string;
    area: string; // e.g. Beltola, Ulubari, Jalukbari, Dispur
    state: string;
  };
  consent: PilotConsentRecord;
  onboarding: PilotOnboardingMetrics;
  credential: PilotCredentialRecord;
  customerValidation: PilotCustomerValidationMetrics;
  feedback?: PilotWorkerFeedback;
  createdAt: string;
  updatedAt: string;
}

export interface PilotAggregateMetrics {
  cohortId: string;
  location: string;
  periodStart: string;
  periodEnd: string;
  targetParticipants: number;
  recruitedCount: number;
  consentedCount: number;
  declinedCount: number;
  completedOnboardingCount: number;
  voiceOnboardingCount: number;
  textOnboardingCount: number;
  qrGeneratedCount: number;
  qrScansVerifiedCount: number;
  avgOnboardingDurationSeconds: number;
  avgCorrectionsCount: number;
  customerEnquiriesTotal: number;
  bookingRequestsTotal: number;
  bookingsCompletedTotal: number;
  reviewsLoggedTotal: number;
  aiExtractionAccuracy: {
    nameAccuracyPercent: number;
    tradeAccuracyPercent: number;
    experienceNonInventionPercent: number;
    ratesNonInventionPercent: number;
    toolsAccuracyPercent: number;
    overallAccuracyPercent: number;
  };
  trustComprehensionRatePercent: number;
  satisfactionAverage: number;
}
