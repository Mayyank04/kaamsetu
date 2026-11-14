export interface OpportunityRequirement {
  id: string;
  title: string;
  tradeCategory: string;
  requiredSkills: string[];
  locationDistrict: string;
  locationPincode?: string | null;
  dailyWageMin?: number | null;
  dailyWageMax?: number | null;
}

export interface WorkerCandidateProfile {
  id: string;
  primaryTrade: string;
  skills: string[];
  operatingDistrict: string;
  availability: "available" | "on_site" | "unavailable";
  kaamscore?: number;
  experienceYears?: number | null;
}

export interface MatchEvaluationResult {
  opportunityId: string;
  workerProfileId: string;
  matchScore: number; // 0 to 100
  isRecommended: boolean; // matchScore >= 60
  matchReasons: string[];
  missingSkills: string[];
}

/**
 * Transparent, explainable opportunity matching engine.
 * STRICT FAIRNESS GUARANTEE:
 * - Never considers caste, religion, gender, disability, or age.
 * - Never penalizes workers for lacking degrees, smartphones, DigiLocker, or reviews.
 */
export function evaluateOpportunityMatch(
  opportunity: OpportunityRequirement,
  worker: WorkerCandidateProfile
): MatchEvaluationResult {
  let score = 0;
  const reasons: string[] = [];
  const missingSkills: string[] = [];

  // 1. Trade Match (40 pts)
  const oppTradeNorm = opportunity.tradeCategory.toLowerCase().trim();
  const workerTradeNorm = worker.primaryTrade.toLowerCase().trim();

  if (oppTradeNorm === workerTradeNorm || workerTradeNorm.includes(oppTradeNorm) || oppTradeNorm.includes(workerTradeNorm)) {
    score += 40;
    reasons.push(`Core trade aligned: ${worker.primaryTrade} matches ${opportunity.tradeCategory}`);
  } else {
    // Partial cross-trade relevance (e.g. electrical vs solar)
    const relatedTrades: Record<string, string[]> = {
      "electrical": ["solar", "wireman", "electrician"],
      "carpentry": ["furniture", "woodwork", "joinery"],
      "plumbing": ["pipefitting", "sanitaryware"],
      "welding": ["fabrication", "metalwork"],
    };

    let related = false;
    for (const [key, group] of Object.entries(relatedTrades)) {
      if (
        (oppTradeNorm.includes(key) || group.some((g) => oppTradeNorm.includes(g))) &&
        (workerTradeNorm.includes(key) || group.some((g) => workerTradeNorm.includes(g)))
      ) {
        score += 25;
        reasons.push(`Related trade experience recognized across ${worker.primaryTrade} and ${opportunity.tradeCategory}`);
        related = true;
        break;
      }
    }

    if (!related) {
      reasons.push(`Trade mismatch between ${worker.primaryTrade} and ${opportunity.tradeCategory}`);
    }
  }

  // 2. Skill Overlap (30 pts)
  const reqSkills = opportunity.requiredSkills || [];
  if (reqSkills.length === 0) {
    score += 30;
    reasons.push("No specialized prerequisites required for this project");
  } else {
    const workerSkillSet = new Set(worker.skills.map((s) => s.toLowerCase().trim()));
    let matchedCount = 0;

    for (const req of reqSkills) {
      const reqNorm = req.toLowerCase().trim();
      const hasSkill = Array.from(workerSkillSet).some(
        (ws) => ws.includes(reqNorm) || reqNorm.includes(ws)
      );

      if (hasSkill) {
        matchedCount++;
      } else {
        missingSkills.push(req);
      }
    }

    const skillScore = Math.round((matchedCount / reqSkills.length) * 30);
    score += skillScore;

    if (matchedCount > 0) {
      reasons.push(`Possesses ${matchedCount} of ${reqSkills.length} required technical skills`);
    }
    if (missingSkills.length > 0) {
      reasons.push(`Missing technical competencies: ${missingSkills.join(", ")}`);
    }
  }

  // 3. Location & Regional Proximity (20 pts)
  const oppDistNorm = opportunity.locationDistrict.toLowerCase().trim();
  const workerDistNorm = worker.operatingDistrict.toLowerCase().trim();

  if (oppDistNorm === workerDistNorm) {
    score += 20;
    reasons.push(`Location proximity match within ${worker.operatingDistrict}`);
  } else if (
    (oppDistNorm.includes("kamrup") && workerDistNorm.includes("kamrup")) ||
    (oppDistNorm.includes("guwahati") && workerDistNorm.includes("guwahati"))
  ) {
    score += 15;
    reasons.push(`Adjacent metropolitan district corridor: ${worker.operatingDistrict} to ${opportunity.locationDistrict}`);
  } else {
    score += 5;
    reasons.push(`Inter-district commute required: ${worker.operatingDistrict} to ${opportunity.locationDistrict}`);
  }

  // 4. Availability State (10 pts)
  if (worker.availability === "available") {
    score += 10;
    reasons.push("Worker is currently available for immediate site deployment");
  } else if (worker.availability === "on_site") {
    score += 5;
    reasons.push("Worker is currently active on site, available for upcoming rotation");
  } else {
    reasons.push("Worker has temporarily paused incoming opportunity dispatches");
  }

  // Non-Penalization invariant verification:
  // Ensure score never deducts for missing reviews, missing smartphone, or lack of degree.

  return {
    opportunityId: opportunity.id,
    workerProfileId: worker.id,
    matchScore: Math.min(100, Math.max(0, score)),
    isRecommended: score >= 60,
    matchReasons: reasons,
    missingSkills,
  };
}
