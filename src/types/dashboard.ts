import {
  AvailabilityState,
  ProfileType,
  StallType,
  ContactPreference,
  VendorProduct,
} from "@/types/database.types";

export type SkillVerificationType =
  | "self_declared"
  | "ai_extracted"
  | "worker_confirmed"
  | "voice_attested"
  | "customer_confirmed"
  | "peer_confirmed"
  | "peer_endorsed"
  | "third_party_verified"
  | "official_government_verified"
  | "digilocker_verified";

export interface DashboardSkill {
  id: string;
  name: string;
  category?: string;
  isPrimary: boolean;
  verificationType: SkillVerificationType;
  verifiedCount?: number;
  yearsPracticed?: number;
  declaredAt?: string;
}

export interface DashboardPortfolioItem {
  id: string;
  workerProfileId: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string | null;
  projectDate: string | null;
  clientTestimony: string | null;
  createdAt: string;
}

export interface DashboardBooking {
  id: string;
  bookingReference: string;
  clientName: string;
  clientPhone?: string;
  serviceTitle: string;
  description: string | null;
  locationAddress: string;
  locationCity: string;
  scheduledStart: string;
  scheduledEnd?: string | null;
  estimatedCost: number | null;
  status: "requested" | "confirmed" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
}

export interface DashboardWorkRecord {
  id: string;
  projectTitle: string;
  contractorOrClient: string;
  location: string;
  startDate: string;
  endDate: string | null;
  hoursLogged: number | null;
  tradeCategory: string;
  verifiedByContractor: boolean;
  verificationHash: string | null;
}

export interface DashboardReview {
  id: string;
  customerName: string;
  rating: number;
  qualityRating: number | null;
  punctualityRating: number | null;
  comment: string;
  contractorSigned: boolean;
  createdAt: string;
}

export interface DashboardWorkerProfile {
  id: string;
  userId: string;
  registryId: string;
  slug: string;
  fullName: string;
  avatarUrl?: string | null;
  occupation: string;
  occupationSlug: string;
  category: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  hourlyRate: number | null;
  dailyRateMin: number;
  dailyRateMax: number;
  city: string;
  state: string;
  pincode: string;
  serviceRadiusKm: number;
  languages: string[];
  kaamScore: {
    totalScore: number;
    level: number;
    tier: string;
    percentile: number;
  };
  aadhaarVerified: boolean;
  digiLockerLinked: boolean;
  isPublished: boolean;
  availabilityStatus: AvailabilityState;
  profileType?: ProfileType;
  businessName?: string;
  vendorType?: string;
  stallType?: StallType;
  operatingHours?: string;
  productCatalog?: VendorProduct[];
  deliveryAvailable?: boolean;
  contactPreference?: ContactPreference;
  phoneVerificationStatus?: "sms_verified" | "sandbox_verified" | "not_verified" | string;
  categorySlug?: string;
  subcategories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardCompletionTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  impactScore: number;
}

export interface DashboardAnalytics {
  profileViewsThisWeek: number;
  totalProfileViews: number;
  cardScans: number;
  inquiriesCount: number;
  completionPercentage: number;
  completionTasks: DashboardCompletionTask[];
}

export interface WorkerDashboardData {
  profile: DashboardWorkerProfile;
  skills: DashboardSkill[];
  portfolio: DashboardPortfolioItem[];
  bookings: DashboardBooking[];
  workRecords: DashboardWorkRecord[];
  reviews: DashboardReview[];
  analytics: DashboardAnalytics;
}
