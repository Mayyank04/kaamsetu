/**
 * KAAMSETU Dynamic Pricing Engine & Feature Configuration
 *
 * Implements configuration-based pricing experiments, annual discount logic,
 * tax calculation (18% GST), and trial period parameters without requiring code rewrites.
 */

export type SubscriptionTier = "starter" | "pro" | "business";
export type BillingCycle = "monthly" | "annual";

export interface PricingPlanConfig {
  tier: SubscriptionTier;
  name: string;
  badge?: string;
  recommended?: boolean;
  maxRosterWorkers: number;
  priceMonthlyInr: number;
  priceAnnualInr: number; // 2 months free discount embedded
  trialDays: number;
  features: string[];
  complianceFeatures: string[];
  supportSla: string;
  isSelfServe: boolean;
}

export interface OrderBillingBreakdown {
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  baseAmount: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number; // 0.18
  gstAmount: number;
  totalAmount: number;
  currency: string;
  renewalDescription: string;
}

export const PRICING_PLANS: Record<SubscriptionTier, PricingPlanConfig> = {
  starter: {
    tier: "starter",
    name: "Contractor Starter",
    maxRosterWorkers: 5,
    priceMonthlyInr: 0,
    priceAnnualInr: 0,
    trialDays: 0,
    isSelfServe: true,
    supportSla: "Standard Email (48 hr SLA)",
    features: [
      "Up to 5 active workforce roster members",
      "Single project crew allocation",
      "Public QR skill card verification",
      "Standard worker association tracking",
    ],
    complianceFeatures: [
      "Basic online skill card view",
    ],
  },
  pro: {
    tier: "pro",
    name: "Contractor Pro",
    badge: "MOST POPULAR",
    recommended: true,
    maxRosterWorkers: 25,
    priceMonthlyInr: 999,
    priceAnnualInr: 9990, // Saves ₹1,998 (2 months free)
    trialDays: 14,
    isSelfServe: true,
    supportSla: "Priority WhatsApp & Phone Dispatch (4 hr SLA)",
    features: [
      "Up to 25 active workforce roster members",
      "Multi-project crew assignment & scheduling",
      "Cryptographic work record signing & batch verification",
      "Two-sided workforce invitation & consent workflow",
      "Exportable client compliance dossiers (PDF/Print)",
    ],
    complianceFeatures: [
      "Aadhaar privacy-masked verification badges",
      "Civic experience tier certificates",
      "Police verification status tracking",
    ],
  },
  business: {
    tier: "business",
    name: "Contractor Business",
    badge: "ENTERPRISE",
    maxRosterWorkers: 100,
    priceMonthlyInr: 2999,
    priceAnnualInr: 29990, // Saves ₹5,998 (2 months free)
    trialDays: 14,
    isSelfServe: true,
    supportSla: "Dedicated Enterprise Account Manager (1 hr SLA)",
    features: [
      "Up to 100 active workforce roster members",
      "Multi-supervisor site access & sub-contractor management",
      "Dispute-free daily wage settlement tracking & ledger",
      "Direct API integration for ERP & construction management",
      "On-site worker onboarding & QR card setup",
    ],
    complianceFeatures: [
      "Full DISCOM & PWD tender audit compliance bundle",
      "Batch worker cryptographic assertion ledger",
      "Custom SLA & indemnification reporting",
    ],
  },
};

/**
 * Calculates complete, tax-compliant invoice breakdown.
 * Enforces 18% GST (Goods and Services Tax, India).
 */
export function calculateBillingBreakdown(
  tier: SubscriptionTier,
  cycle: BillingCycle = "monthly"
): OrderBillingBreakdown {
  const plan = PRICING_PLANS[tier];
  if (!plan) {
    throw new Error(`Invalid plan tier: ${tier}`);
  }

  const isAnnual = cycle === "annual";
  const rawBase = isAnnual ? plan.priceAnnualInr : plan.priceMonthlyInr;

  // Annual discount savings (e.g. 12 * 999 - 9990 = 1998 discount)
  const fullYearNoDiscount = plan.priceMonthlyInr * 12;
  const discountAmount = isAnnual && plan.priceMonthlyInr > 0 ? fullYearNoDiscount - plan.priceAnnualInr : 0;

  const taxableAmount = rawBase;
  const gstRate = 0.18;
  const gstAmount = Math.round(taxableAmount * gstRate * 100) / 100;
  const totalAmount = Math.round((taxableAmount + gstAmount) * 100) / 100;

  const renewalDescription = isAnnual
    ? `Billed annually at ₹${totalAmount.toLocaleString("en-IN")} (incl. 18% GST). Renews automatically after 365 days.`
    : `Billed monthly at ₹${totalAmount.toLocaleString("en-IN")} (incl. 18% GST). Renews automatically every 30 days.`;

  return {
    tier,
    billingCycle: cycle,
    baseAmount: rawBase,
    discountAmount,
    taxableAmount,
    gstRate,
    gstAmount,
    totalAmount,
    currency: "INR",
    renewalDescription,
  };
}
