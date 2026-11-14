export interface ExplainableMatchInput {
  opportunity: {
    id: string;
    tradeCategory: string;
    requiredSkills: string[];
    locationDistrict: string;
    dailyWageRangeMin?: number | null;
    dailyWageRangeMax?: number | null;
    isInterstate?: boolean;
  };
  worker: {
    id: string;
    primaryTrade: string;
    skills: string[];
    locationDistrict: string;
    kaamScore: number;
    travelWillingness: "same_district" | "adjacent_districts" | "interstate" | "remote_only";
    isAvailable: boolean;
    demographics?: {
      religion?: string;
      caste?: string;
      gender?: string;
    };
  };
}

export interface ExplainableMatchScore {
  totalScore: number;
  tradeScore: number;
  skillScore: number;
  locationScore: number;
  kaamScoreWeight: number;
  explanation: {
    tradeMatch: boolean;
    matchedSkills: string[];
    missingSkills: string[];
    locationFit: "same_district" | "adjacent_district" | "interstate_willing" | "location_mismatch";
    demographicsExcludedFromScoring: boolean;
  };
  isEligible: boolean;
  disqualificationReason?: string;
}

/**
 * Deterministic, explainable matching engine with mathematical fairness invariants
 */
export function evaluateExplainableMatch(input: ExplainableMatchInput): ExplainableMatchScore {
  const { opportunity, worker } = input;

  // Hard gate 1: Availability
  if (!worker.isAvailable) {
    return {
      totalScore: 0,
      tradeScore: 0,
      skillScore: 0,
      locationScore: 0,
      kaamScoreWeight: 0,
      explanation: {
        tradeMatch: false,
        matchedSkills: [],
        missingSkills: opportunity.requiredSkills,
        locationFit: "location_mismatch",
        demographicsExcludedFromScoring: true,
      },
      isEligible: false,
      disqualificationReason: "Worker is currently marked unavailable",
    };
  }

  // 1. Trade Alignment Score (40% weight)
  const oppTrade = opportunity.tradeCategory.toLowerCase().trim();
  const workerTrade = worker.primaryTrade.toLowerCase().trim();
  const tradeMatch =
    oppTrade === workerTrade ||
    oppTrade.includes(workerTrade) ||
    workerTrade.includes(oppTrade);
  const tradeScore = tradeMatch ? 40 : 10;

  // 2. Skill Overlap Score (30% weight)
  const workerSkillsLower = worker.skills.map((s) => s.toLowerCase().trim());
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const reqSkill of opportunity.requiredSkills) {
    const reqLower = reqSkill.toLowerCase().trim();
    if (workerSkillsLower.some((ws) => ws.includes(reqLower) || reqLower.includes(ws))) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  const skillRatio =
    opportunity.requiredSkills.length > 0
      ? matchedSkills.length / opportunity.requiredSkills.length
      : 1.0;
  const skillScore = Math.round(skillRatio * 30);

  // 3. Location & Mobility Fit Score (15% weight)
  let locationFit: "same_district" | "adjacent_district" | "interstate_willing" | "location_mismatch" =
    "location_mismatch";
  let locationScore = 0;

  const sameDistrict =
    opportunity.locationDistrict.toLowerCase().trim() ===
    worker.locationDistrict.toLowerCase().trim();

  if (sameDistrict) {
    locationFit = "same_district";
    locationScore = 15;
  } else if (
    opportunity.isInterstate &&
    worker.travelWillingness === "interstate"
  ) {
    locationFit = "interstate_willing";
    locationScore = 12;
  } else if (
    !opportunity.isInterstate &&
    (worker.travelWillingness === "adjacent_districts" ||
      worker.travelWillingness === "interstate")
  ) {
    locationFit = "adjacent_district";
    locationScore = 10;
  } else {
    locationFit = "location_mismatch";
    locationScore = 0;
  }

  // If worker strictly refuses to travel outside district and project is cross-district
  if (!sameDistrict && worker.travelWillingness === "same_district") {
    return {
      totalScore: 0,
      tradeScore,
      skillScore,
      locationScore: 0,
      kaamScoreWeight: 0,
      explanation: {
        tradeMatch,
        matchedSkills,
        missingSkills,
        locationFit: "location_mismatch",
        demographicsExcludedFromScoring: true,
      },
      isEligible: false,
      disqualificationReason:
        "Worker mobility preference is strictly 'same_district'; project location requires travel",
    };
  }

  // 4. KaamScore & Credibility Weight (15% weight)
  // Normalized 300..900 -> 0..15
  const normalizedKaam = Math.min(15, Math.max(0, ((worker.kaamScore - 300) / 600) * 15));
  const kaamScoreWeight = Math.round(normalizedKaam);

  // Total Score (0-100)
  const totalScore = tradeScore + skillScore + locationScore + kaamScoreWeight;

  return {
    totalScore,
    tradeScore,
    skillScore,
    locationScore,
    kaamScoreWeight,
    explanation: {
      tradeMatch,
      matchedSkills,
      missingSkills,
      locationFit,
      demographicsExcludedFromScoring: true, // Mathematically ignores religion, caste, gender
    },
    isEligible: totalScore >= 50,
  };
}

/**
 * Worker contact disclosure guard.
 * STRICTLY withholds phone and unmasked contact details unless worker explicitly consented.
 */
export function getContactDisclosurePayload(options: {
  workerFullName: string;
  workerPhone: string;
  workerConsentGiven: boolean;
}): {
  name: string;
  phone: string;
  contactUnlocked: boolean;
} {
  if (!options.workerConsentGiven) {
    return {
      name: options.workerFullName,
      phone: "+91-XXXXX-XXXXX",
      contactUnlocked: false,
    };
  }

  return {
    name: options.workerFullName,
    phone: options.workerPhone,
    contactUnlocked: true,
  };
}
