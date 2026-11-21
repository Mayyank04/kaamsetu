/**
 * KAAMSETU — Service Coverage & Operational Capability Registry
 * Decouples account and profile access from localized commercial dispatch.
 * 
 * Invariant: Permanent zero commission on artisan wages (platform_commission_amount = 0.00).
 * Governance Classification: CLASS_B_CONTROLLED_ROLLOUT.
 */

export interface GeographicCapabilities {
  account_access: boolean;    // Can user create/manage an account? (Always true nationwide)
  profile_access: boolean;    // Can worker create/maintain public trade profile? (Always true nationwide)
  discovery_access: boolean;  // Can customer/contractor discover worker profiles? (Always true nationwide)
  booking_access: boolean;    // Is on-demand customer booking service active in this zone?
  dispatch_access: boolean;   // Can jobs/crews be dispatched physically in this zone?
  payment_access: boolean;    // Are local payment and direct bank settlement rails active?
}

export interface ServiceCoverageArea {
  geographyId: string;
  name: string;
  urbanCenter: string;
  state: string;
  district: string;
  minPin: number;
  maxPin: number;
  allowedCities: string[];
  supportedServiceCategories: string[];
  capabilities: GeographicCapabilities;
  operationalTeam: string;
  activationStatus: "ACTIVE_VERIFIED" | "EVALUATION" | "PLANNED";
  evidenceReference: string;
  lastReviewedTimestamp: string;
}

/**
 * Authoritative Service Coverage Areas under CLASS_B_CONTROLLED_ROLLOUT
 */
export const VERIFIED_SERVICE_AREAS: ServiceCoverageArea[] = [
  {
    geographyId: "ZONE-AS-01",
    name: "Guwahati Urban Cluster",
    urbanCenter: "Guwahati Urban",
    state: "Assam",
    district: "Kamrup Metropolitan",
    minPin: 781001,
    maxPin: 781039,
    allowedCities: ["guwahati", "kamrup", "dispur", "panbazar", "paltan", "chandmari", "jalukbari"],
    supportedServiceCategories: [
      "electrical-solar",
      "carpentry-joinery",
      "plumbing-sanitation",
      "construction-civil",
      "handloom-textiles",
      "automotive-ev",
      "sustainable-agritech",
      "hvac-refrigeration",
    ],
    capabilities: {
      account_access: true,
      profile_access: true,
      discovery_access: true,
      booking_access: true,
      dispatch_access: true,
      payment_access: true,
    },
    operationalTeam: "Northeast Regional Operations Desk (Guwahati)",
    activationStatus: "ACTIVE_VERIFIED",
    evidenceReference: "CLASS_B_RATIFICATION_KAMRUP_METRO_2026",
    lastReviewedTimestamp: "2026-11-18T00:00:00.000Z",
  },
  {
    geographyId: "ZONE-ML-01",
    name: "Shillong Urban Cluster",
    urbanCenter: "Shillong Urban",
    state: "Meghalaya",
    district: "East Khasi Hills",
    minPin: 793001,
    maxPin: 793022,
    allowedCities: ["shillong", "east khasi hills", "khasi", "police bazar", "laitumkhrah", "mawkhar", "laban"],
    supportedServiceCategories: [
      "electrical-solar",
      "carpentry-joinery",
      "plumbing-sanitation",
      "construction-civil",
      "handloom-textiles",
      "automotive-ev",
      "sustainable-agritech",
      "hvac-refrigeration",
    ],
    capabilities: {
      account_access: true,
      profile_access: true,
      discovery_access: true,
      booking_access: true,
      dispatch_access: true,
      payment_access: true,
    },
    operationalTeam: "Shillong Municipal Field Operations Desk",
    activationStatus: "ACTIVE_VERIFIED",
    evidenceReference: "CLASS_B_RATIFICATION_EAST_KHASI_2026",
    lastReviewedTimestamp: "2026-11-18T00:00:00.000Z",
  },
  {
    geographyId: "ZONE-WB-01",
    name: "Siliguri Northern Hub (Readiness Pilot)",
    urbanCenter: "Siliguri Urban",
    state: "West Bengal",
    district: "Darjeeling",
    minPin: 734001,
    maxPin: 734014,
    allowedCities: ["siliguri", "matigara", "pradhan nagar", "hakim para"],
    supportedServiceCategories: ["electrical-solar", "construction-civil", "transport-logistics"],
    capabilities: {
      account_access: true,
      profile_access: true,
      discovery_access: true,
      booking_access: false, // Conditional readiness only
      dispatch_access: false,
      payment_access: false,
    },
    operationalTeam: "North Bengal Pilot Review Committee",
    activationStatus: "EVALUATION",
    evidenceReference: "SILIGURI_PILOT_CONDITIONAL_MOU_2026",
    lastReviewedTimestamp: "2026-11-15T00:00:00.000Z",
  },
];

/**
 * Default nationwide capabilities for regions outside active commercial dispatch clusters.
 * Every worker throughout all 28 states and 8 UTs can register, create, edit and discover profiles.
 */
export const NATIONWIDE_DEFAULT_CAPABILITIES: GeographicCapabilities = {
  account_access: true,
  profile_access: true,
  discovery_access: true,
  booking_access: false,
  dispatch_access: false,
  payment_access: false,
};

export class ServiceCoverageRegistry {
  /**
   * Helper to fetch capabilities for a region
   */
  public static getCapabilities(state?: string, district?: string, pincode?: string): GeographicCapabilities {
    return this.resolveCapabilities({ state, district, pincode }).capabilities;
  }

  /**
   * Resolves capabilities for any Indian location based on state, district, and PIN.
   */
  public static resolveCapabilities(params: {
    state?: string;
    district?: string;
    city?: string;
    pincode?: string;
  }): {
    capabilities: GeographicCapabilities;
    area: ServiceCoverageArea | null;
    coverageZoneDescription: string;
  } {
    const pin = (params.pincode || "").replace(/\D/g, "");
    const pinInt = pin.length === 6 ? parseInt(pin, 10) : 0;
    const cityLower = (params.city || "").toLowerCase().trim();

    // Check verified operational service areas
    for (const area of VERIFIED_SERVICE_AREAS) {
      const pinMatches = pinInt >= area.minPin && pinInt <= area.maxPin;
      const cityMatches = area.allowedCities.some((c) => cityLower.includes(c));

      if (pinMatches || (cityMatches && pinInt === 0)) {
        return {
          capabilities: area.capabilities,
          area,
          coverageZoneDescription: `${area.name} (${area.activationStatus})`,
        };
      }
    }

    return {
      capabilities: NATIONWIDE_DEFAULT_CAPABILITIES,
      area: null,
      coverageZoneDescription: "National Digital Skill Registry (Nationwide Profile & Discovery Active; Commercial Dispatch Pending Regional Cluster Launch)",
    };
  }

  public static isDispatchEligible(pincode: string): boolean {
    const pin = pincode.replace(/\D/g, "");
    if (pin.length !== 6) return false;
    const pinInt = parseInt(pin, 10);
    return VERIFIED_SERVICE_AREAS.some(
      (a) => a.capabilities.dispatch_access && pinInt >= a.minPin && pinInt <= a.maxPin
    );
  }

  public static isBookingEligible(pincode: string): boolean {
    const pin = pincode.replace(/\D/g, "");
    if (pin.length !== 6) return false;
    const pinInt = parseInt(pin, 10);
    return VERIFIED_SERVICE_AREAS.some(
      (a) => a.capabilities.booking_access && pinInt >= a.minPin && pinInt <= a.maxPin
    );
  }
}
