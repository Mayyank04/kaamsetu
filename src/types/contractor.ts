import { ContractorOrganization, ContractorWorkforce, ContractorProject } from "./database.types";

export type SubscriptionTier = "starter" | "pro" | "business";

export interface PlanFeature {
  name: string;
  included: boolean;
  notes?: string;
}

export interface SubscriptionPlanDetails {
  tier: SubscriptionTier;
  name: string;
  priceMonthlyInr: number;
  priceAnnualInr: number;
  maxRosterWorkers: number;
  features: string[];
  recommended?: boolean;
}

export const CONTRACTOR_PLANS: Record<SubscriptionTier, SubscriptionPlanDetails> = {
  starter: {
    tier: "starter",
    name: "Contractor Starter",
    priceMonthlyInr: 0,
    priceAnnualInr: 0,
    maxRosterWorkers: 5,
    features: [
      "Up to 5 active workforce roster members",
      "Basic project management & worker allocation",
      "Public worker credential verification",
      "Standard email support",
    ],
  },
  pro: {
    tier: "pro",
    name: "Contractor Pro",
    priceMonthlyInr: 999,
    priceAnnualInr: 9990,
    maxRosterWorkers: 25,
    recommended: true,
    features: [
      "Up to 25 active workforce roster members",
      "Multi-project crew assignment & scheduling",
      "Cryptographic work record signing & batch verification",
      "Exportable workforce compliance dossiers (PDF)",
      "Priority WhatsApp & phone contractor dispatch support",
    ],
  },
  business: {
    tier: "business",
    name: "Contractor Business",
    priceMonthlyInr: 2999,
    priceAnnualInr: 29990,
    maxRosterWorkers: 100,
    features: [
      "Up to 100 active workforce roster members",
      "Multi-supervisor role access & sub-contractor management",
      "Dispute-free daily wage settlement tracking",
      "Direct API integration for ERP & construction management",
      "Dedicated account manager & on-site worker onboarding",
    ],
  },
};

export interface WorkforceMemberWithDetails extends ContractorWorkforce {
  worker: {
    id: string;
    fullName: string;
    phoneMasked: string;
    trade: string;
    city: string;
    kaamscore: number;
    kaamscoreLevel: number;
    aadhaarVerified: boolean;
    digilockerLinked: boolean;
    avatarUrl?: string | null;
    slug: string;
  };
}

export interface ContractorDashboardData {
  organization: ContractorOrganization;
  plan: SubscriptionPlanDetails;
  workforceCount: number;
  activeProjectsCount: number;
  rosterUsagePercent: number;
  workforce: WorkforceMemberWithDetails[];
  projects: ContractorProject[];
}
