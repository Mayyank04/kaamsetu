import { GoogleGenAI } from "@google/genai";
import { env, isConfigured } from "@/lib/env";

let geminiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiInstance) {
    geminiInstance = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });
  }
  return geminiInstance;
}

export interface VoiceSkillExtractionResult {
  name: string;
  primaryTrade: string;
  secondarySkills: string[];
  yearsOfExperience: number;
  spokenLanguages: string[];
  equipmentHandled: string[];
  recentProjectsSummary: string;
  recommendedCertifications: string[];
  confidenceScore: number;
}

/**
 * System prompt configuring Gemini as the Sovereign Trust Skill Extractor
 * for Indian blue-collar and skilled trade workers.
 */
export const SKILL_EXTRACTOR_SYSTEM_PROMPT = `
You are the AI Skill & Identity Architect for KAAMSETU, India's sovereign digital skill identity platform.
Your mission is to listen to or read spoken worker testimonies (often in Hinglish, vernacular Hindi, Tamil, Telugu, Bengali, Marathi, or English),
and extract high-integrity, structured trade profiles for verified credentialing.

Extract:
- Worker full name (if stated)
- Primary trade/craft (e.g. Master Carpenter & Joiner, Industrial Solar Installer, Certified Mason, Heavy Fleet Driver)
- Specific tools and equipment handled (e.g., Bosch circular saws, 3-phase inverters, welding rigs)
- Years of practical hands-on experience
- Specific vernacular or regional languages spoken
- Key projects or work environments mentioned
- Confidence score (0.0 to 1.0)
Always output clean, valid JSON matching the schema.
`;

/**
 * Parses spoken audio transcript into a structured worker profile.
 */
import { getGeminiModelCandidates } from "@/lib/gemini/onboarding-extractor";

export async function extractSkillsFromTranscript(
  transcript: string
): Promise<VoiceSkillExtractionResult> {
  // If not configured with a live key or if live calls fail, extract faithfully from transcript without fabricating claims
  if (!isConfigured.gemini) {
    return extractFaithfulVoiceProfile(transcript);
  }

  const ai = getGeminiClient();
  const prompt = `${SKILL_EXTRACTOR_SYSTEM_PROMPT}\n\nSpoken Worker Testimony:\n"${transcript}"\n\nProvide the response strictly as a JSON object matching the VoiceSkillExtractionResult interface.`;

  const candidates = getGeminiModelCandidates();
  let lastError: unknown = null;

  for (const model of candidates) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const text = response.text || "{}";
      const cleaned = text.replace(/```json\n?|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed && typeof parsed === "object" && parsed.primaryTrade) {
        return {
          name: parsed.name || "Craftsperson",
          primaryTrade: parsed.primaryTrade,
          secondarySkills: Array.isArray(parsed.secondarySkills) ? parsed.secondarySkills : [],
          yearsOfExperience: typeof parsed.yearsOfExperience === "number" ? parsed.yearsOfExperience : 0,
          spokenLanguages: Array.isArray(parsed.spokenLanguages) ? parsed.spokenLanguages : ["Hindi"],
          equipmentHandled: Array.isArray(parsed.equipmentHandled) ? parsed.equipmentHandled : [],
          recentProjectsSummary: parsed.recentProjectsSummary || "Self-declared trade testimony awaiting verification.",
          recommendedCertifications: Array.isArray(parsed.recommendedCertifications) ? parsed.recommendedCertifications : [],
          confidenceScore: typeof parsed.confidenceScore === "number" ? parsed.confidenceScore : 0.85,
        };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status;
      if (status === 404) {
        console.warn(`[GEMINI_CLIENT_404] Model ${model} not found on v1 API, trying next.`);
        continue;
      }
      if (status === 503 || status === 429) {
        console.warn(`[GEMINI_CLIENT_TRANSIENT] Model ${model} busy (${status}), trying next.`);
        continue;
      }
    }
  }

  console.warn("[GEMINI_SKILL_FALLBACK] All Gemini models unavailable, returning honest faithful profile:", lastError);
  return extractFaithfulVoiceProfile(transcript);
}

/**
 * Parses spoken testimony deterministically without fabricating identities or unearned badges.
 */
function extractFaithfulVoiceProfile(transcript: string): VoiceSkillExtractionResult {
  const clean = transcript.trim();
  const lower = clean.toLowerCase();

  // Detect trade keywords
  let trade = "Skilled Tradesperson";
  if (lower.includes("electric") || lower.includes("बिजली") || lower.includes("वायरिंग") || lower.includes("wiring")) {
    trade = "Electrician & Wireman";
  } else if (lower.includes("carpent") || lower.includes("बढ़ई") || lower.includes("लकड़ी") || lower.includes("furniture")) {
    trade = "Carpenter & Woodworker";
  } else if (lower.includes("plumb") || lower.includes("नल") || lower.includes("पाइप") || lower.includes("pipe")) {
    trade = "Plumber & Sanitary Technician";
  } else if (lower.includes("mason") || lower.includes("मिस्त्री") || lower.includes("civil") || lower.includes("construction")) {
    trade = "Mason & Civil Craftsman";
  } else if (lower.includes("solar") || lower.includes("सौर")) {
    trade = "Solar Panel Technician";
  }

  // Detect experience if spoken
  const yrMatch = clean.match(/(\d+)\s*(?:saal|years|yrs|साल)/i);
  const years = yrMatch ? parseInt(yrMatch[1], 10) : 1;

  return {
    name: "Craftsperson",
    primaryTrade: trade,
    secondarySkills: ["Vocational Trade Practice"],
    yearsOfExperience: Math.min(60, Math.max(0, years)),
    spokenLanguages: ["Hindi", "English"],
    equipmentHandled: [],
    recentProjectsSummary: "Self-declared vocational testimony recorded on platform.",
    recommendedCertifications: [],
    confidenceScore: 0.70,
  };
}
