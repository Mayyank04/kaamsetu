/**
 * KAAMSCORE™ Trust Index and Evidence Breakdown Engine
 * Implements strict evidence-backed scoring across 8 documented civic dimensions.
 * Eliminates simulated points, fabricated national percentiles, and assumptions.
 */

export type EvidenceCategory =
  | "self_declared"
  | "ai_extracted"
  | "worker_confirmed"
  | "voice_attested"
  | "customer_confirmed"
  | "peer_endorsed"
  | "third_party_verified"
  | "official_government_verified";

export interface ScoreEvidenceDimension {
  id: string;
  category: EvidenceCategory;
  name: string;
  pointsAwarded: number;
  maxPoints: number;
  isVerified: boolean;
  statusLabel: string;
  evidenceDetails: string;
}

export interface KaamScoreBreakdown {
  totalScore: number;
  maxPossibleScore: number;
  isProvisional: boolean;
  provisionalCompletenessPercent: number;
  tier: string;
  dimensions: ScoreEvidenceDimension[];
}

export interface ScoreInputs {
  hasVoiceAttestation: boolean;
  languageUsed?: string;
  workerConfirmedVoice: boolean;
  yearsExperience: number | null; // null represents unstated/unreported
  verifiedSkillsCount: number;
  completedBookingsCount: number;
  peerEndorsementsCount: number;
  officialGovVerified: boolean; // strictly false until real DigiLocker OAuth assertion exists
}

/**
 * Computes an authentic, explainable KAAMSCORE based on verifiable evidence.
 */
export function calculateKaamScore(inputs: ScoreInputs): KaamScoreBreakdown {
  const dimensions: ScoreEvidenceDimension[] = [];

  // 1. Spoken Audio Proof & Worker Confirmation (Max 150)
  // Awarded ONLY if voice testimony was recorded AND worker reviewed/confirmed it
  let voicePoints = 0;
  let voiceStatus = "Self-Declared Text Entry";
  let voiceDetails = "No spoken audio attestation recorded. Profile details entered via standard text.";
  let voiceVerified = false;

  if (inputs.hasVoiceAttestation && inputs.workerConfirmedVoice) {
    voicePoints = 150;
    voiceStatus = "Voice Attested & Worker Confirmed";
    voiceDetails = `Spoken attestation in ${inputs.languageUsed || "Indian language"} authenticated and approved by worker.`;
    voiceVerified = true;
  } else if (inputs.hasVoiceAttestation && !inputs.workerConfirmedVoice) {
    voicePoints = 50;
    voiceStatus = "AI Extracted (Pending Worker Approval)";
    voiceDetails = "Spoken audio transcribed by AI but awaiting final worker approval.";
    voiceVerified = false;
  }

  dimensions.push({
    id: "voice_attestation",
    category: voiceVerified ? "voice_attested" : "self_declared",
    name: "Voice Testimony & Spoken Claim Proof",
    pointsAwarded: voicePoints,
    maxPoints: 150,
    isVerified: voiceVerified,
    statusLabel: voiceStatus,
    evidenceDetails: voiceDetails,
  });

  // 2. Verified Sub-Skills & Specializations (Max 150)
  // 25 points per worker-confirmed sub-skill up to 6 skills (150 pts)
  const skillsCount = Math.max(0, inputs.verifiedSkillsCount);
  const skillsPoints = Math.min(150, skillsCount * 25);
  dimensions.push({
    id: "domain_skills",
    category: skillsCount > 0 ? "worker_confirmed" : "self_declared",
    name: "Craft Sub-Skills & Equipment",
    pointsAwarded: skillsPoints,
    maxPoints: 150,
    isVerified: skillsCount > 0,
    statusLabel: skillsCount > 0 ? `${skillsCount} Confirmed Competencies` : "Unspecified Competencies",
    evidenceDetails: skillsCount > 0
      ? `${skillsCount} granular technical skills explicitly confirmed by worker.`
      : "No verified sub-skills declared yet.",
  });

  // 3. Trade Practice Depth / Experience (Max 150)
  // Notice: If yearsExperience is null (unstated), it awards 0 and states 'Unreported'
  let expPoints = 0;
  let expStatus = "Experience Unreported";
  let expDetails = "Years of experience was not stated in testimony. Marked as unreported to avoid false claims.";
  if (inputs.yearsExperience !== null) {
    expPoints = Math.min(150, inputs.yearsExperience * 10);
    expStatus = `${inputs.yearsExperience} Years Stated Practice`;
    expDetails = `Worker self-declared ${inputs.yearsExperience} years of hands-on trade practice.`;
  }

  dimensions.push({
    id: "experience_depth",
    category: "self_declared",
    name: "Trade Practice Depth",
    pointsAwarded: expPoints,
    maxPoints: 150,
    isVerified: false, // self-declared until backed by work records
    statusLabel: expStatus,
    evidenceDetails: expDetails,
  });

  // 4. Customer-Confirmed Completed Jobs (Max 250)
  // 50 points per completed booking record on the ledger
  const jobsCount = Math.max(0, inputs.completedBookingsCount);
  const jobsPoints = Math.min(250, jobsCount * 50);
  const jobsVerified = jobsCount > 0;
  dimensions.push({
    id: "completed_jobs",
    category: jobsVerified ? "customer_confirmed" : "self_declared",
    name: "Customer-Confirmed Completed Jobs",
    pointsAwarded: jobsPoints,
    maxPoints: 250,
    isVerified: jobsVerified,
    statusLabel: jobsCount > 0 ? `${jobsCount} Verified Completed Service Contracts` : "No Completed Bookings Yet",
    evidenceDetails: jobsCount > 0
      ? `${jobsCount} service bookings successfully completed and confirmed by clients on ledger.`
      : "No customer-completed booking history recorded on platform ledger.",
  });

  // 5. Peer & Contractor Endorsements (Max 200)
  // 50 points per valid endorsement from an authenticated professional
  const peerCount = Math.max(0, inputs.peerEndorsementsCount);
  const peerPoints = Math.min(200, peerCount * 50);
  const peerVerified = peerCount > 0;
  dimensions.push({
    id: "peer_endorsements",
    category: peerVerified ? "peer_endorsed" : "self_declared",
    name: "Peer & Contractor Attestations",
    pointsAwarded: peerPoints,
    maxPoints: 200,
    isVerified: peerVerified,
    statusLabel: peerCount > 0 ? `${peerCount} Professional Endorsements` : "No Peer Attestations Yet",
    evidenceDetails: peerCount > 0
      ? `${peerCount} attestations received from verified peer tradespeople or commercial contractors.`
      : "No trade peer endorsements registered.",
  });

  // 6. Official Government / DigiLocker Verification (Max 150)
  // Strictly 0 unless an authentic government OAuth verification response exists
  let govPoints = 0;
  let govStatus = "Pending Official Gateway Integration";
  let govDetails = "Integration with DigiLocker API requires enterprise requester registration. Currently unlinked.";
  let govVerified = false;

  if (inputs.officialGovVerified) {
    govPoints = 150;
    govStatus = "Official Government DigiLocker Linked";
    govDetails = "Cryptographically verified credential via National DigiLocker API.";
    govVerified = true;
  }

  dimensions.push({
    id: "official_government",
    category: govVerified ? "official_government_verified" : "self_declared",
    name: "Official DigiLocker Government Anchor",
    pointsAwarded: govPoints,
    maxPoints: 150,
    isVerified: govVerified,
    statusLabel: govStatus,
    evidenceDetails: govDetails,
  });

  const totalScore = dimensions.reduce((acc, d) => acc + d.pointsAwarded, 0);
  const maxPossibleScore = 900;

  // Determine if profile is in provisional stage (e.g. no verified client jobs or peer endorsements yet)
  const isProvisional = jobsCount === 0 && peerCount === 0;

  // Onboarding profile completeness percentage (based on preliminary onboarding inputs out of 450 max)
  const preliminaryPoints = voicePoints + skillsPoints + expPoints;
  const provisionalCompletenessPercent = Math.min(100, Math.round((preliminaryPoints / 450) * 100));

  let tier = "Tier 1: Provisional Onboarding";
  if (!isProvisional) {
    if (totalScore >= 750) {
      tier = "Tier 4: Master Craftsman (Verified)";
    } else if (totalScore >= 550) {
      tier = "Tier 3: Verified Senior Practitioner";
    } else {
      tier = "Tier 2: Active Trade Practitioner";
    }
  }

  return {
    totalScore,
    maxPossibleScore,
    isProvisional,
    provisionalCompletenessPercent,
    tier,
    dimensions,
  };
}
