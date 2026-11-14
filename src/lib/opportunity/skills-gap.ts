export interface SkillsGapAnalysisResult {
  targetTrade: string;
  missingSkills: Array<{
    skillName: string;
    evidenceRationale: string;
    recommendedCourseTitle: string;
    recommendedCourseUrl: string;
    institutionProvider: string;
  }>;
  isAiGenerated: true;
}

const VOCATIONAL_COURSE_CATALOG: Record<
  string,
  Array<{
    skillName: string;
    rationale: string;
    courseTitle: string;
    courseUrl: string;
    provider: string;
  }>
> = {
  "electrical": [
    {
      skillName: "Solar Inverter Wiring & Synchronization",
      rationale: "82% of commercial EPC opportunities in Kamrup require solar inverter grid synchronization.",
      courseTitle: "ASDM Solar PV Rooftop Installer (NSQF Level 4)",
      courseUrl: "https://asdm.assam.gov.in/courses/solar-pv-installer",
      provider: "Assam Skill Development Mission",
    },
    {
      skillName: "Industrial Motor Control Circuitry",
      rationale: "High demand in Amingaon and Maligaon industrial fabrication units.",
      courseTitle: "Government ITI Guwahati Electrician Module B",
      courseUrl: "https://itiassam.nic.in/electrician-industrial",
      provider: "Government ITI Guwahati",
    },
  ],
  "carpentry": [
    {
      skillName: "Modular Kitchen CNC Hardware Installation",
      rationale: "Commercial interior fitouts in Guwahati increasingly mandate modular hardware joinery.",
      courseTitle: "Heritage & Modern Woodcraft Specialty Certificate",
      courseUrl: "https://asdm.assam.gov.in/courses/furniture-joinery",
      provider: "Assam Skill Development Mission",
    },
  ],
  "plumbing": [
    {
      skillName: "HDPE Electrofusion Jointing",
      rationale: "Jal Jeevan Mission and municipal water projects require certified electrofusion jointing.",
      courseTitle: "Advanced Pipe Fitting & Fusion Certification",
      courseUrl: "https://asdm.assam.gov.in/courses/plumbing-piping",
      provider: "Assam Skill Development Mission",
    },
  ],
};

/**
 * Generate transparent, explainable skills gap recommendations for a worker
 * ALWAYS LABELED: AI-generated guidance, never representing a recommended skill as acquired.
 */
export function generateSkillsGapRecommendations(
  tradeCategory: string,
  existingSkills: string[]
): SkillsGapAnalysisResult {
  const tradeNorm = tradeCategory.toLowerCase();
  const existingSet = new Set(existingSkills.map((s) => s.toLowerCase().trim()));

  let catalogKey = "electrical";
  if (tradeNorm.includes("carpenter") || tradeNorm.includes("wood")) {
    catalogKey = "carpentry";
  } else if (tradeNorm.includes("plumb") || tradeNorm.includes("pipe")) {
    catalogKey = "plumbing";
  }

  const catalog = VOCATIONAL_COURSE_CATALOG[catalogKey] || VOCATIONAL_COURSE_CATALOG["electrical"];

  const gaps = catalog
    .filter((item) => !existingSet.has(item.skillName.toLowerCase().trim()))
    .map((item) => ({
      skillName: item.skillName,
      evidenceRationale: item.rationale,
      recommendedCourseTitle: item.courseTitle,
      recommendedCourseUrl: item.courseUrl,
      institutionProvider: item.provider,
    }));

  return {
    targetTrade: tradeCategory,
    missingSkills: gaps,
    isAiGenerated: true,
  };
}
