export type KaamScoreTierName =
  | "Sovereign Master"
  | "Institutional Verified"
  | "Apprentice Verified"
  | "Provisional";

export interface KaamScoreBreakdown {
  spokenAudioProof: number; // Max 150
  domainAIExtraction: number; // Max 150
  peerEndorsements: number; // Max 200
  completedJobs: number; // Max 250
  sovereignDigiLocker: number; // Max 150
}

export interface KaamScoreDetails {
  totalScore: number; // Scaled 300 - 900
  tier: KaamScoreTierName;
  level: 1 | 2 | 3 | 4;
  breakdown: KaamScoreBreakdown;
  percentileRank: number; // e.g. 96 (Top 4%)
  trajectory: "rising" | "stable" | "provisional";
  lastVerifiedDate: string;
}
