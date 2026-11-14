import { KaamScoreDetails } from "./kaamscore";

export interface SkillBadge {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  verificationProofUrl?: string;
  level: "Foundation" | "Advanced" | "Master Craftsman";
  category: string;
  verifiedByDigiLocker: boolean;
}

export interface WorkExperience {
  id: string;
  projectTitle: string;
  clientOrContractor: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  verifiedByClient: boolean;
  rating?: number; // 1 to 5 stars
  description?: string;
}

export interface PeerEndorsement {
  id: string;
  endorserName: string;
  endorserTrade: string;
  endorserRegistryId: string;
  endorserScore: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface WorkerProfile {
  id: string;
  registryId: string; // e.g. "IN-DL-2026-8942-KS"
  fullName: string;
  avatarUrl?: string;
  primaryTrade: string;
  subTrades: string[];
  yearsExperience: number;
  location: {
    city: string;
    state: string;
    pincode: string;
  };
  languages: string[];
  aadhaarVerified: boolean;
  digiLockerLinked: boolean;
  kaamScore: KaamScoreDetails;
  badges: SkillBadge[];
  experience: WorkExperience[];
  endorsements: PeerEndorsement[];
  voiceDeclarationTranscript?: string;
  voiceDeclarationAudioUrl?: string;
  qrVerificationUrl: string;
  dailyRateEstimate?: {
    min: number;
    max: number;
  };
  availabilityStatus: "available" | "on_site" | "booked";
  createdAt: string;
  updatedAt: string;
}

export interface TradeCategory {
  id: string;
  title: string;
  slug: string;
  iconName: string;
  workerCount: number;
  description: string;
  popularSkills: string[];
}
