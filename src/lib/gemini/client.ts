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
export async function extractSkillsFromTranscript(
  transcript: string
): Promise<VoiceSkillExtractionResult> {
  // If not configured with a live key, return a deterministic high-fidelity mock profile
  if (!isConfigured.gemini) {
    return {
      name: "Rameshwar Sharma",
      primaryTrade: "Master Teak Wood Carpenter & Joiner",
      secondarySkills: [
        "Modular Kitchen Assembly",
        "Antique Wood Restoration",
        "CAD Blueprint Reading",
        "HVAC Duct Framing",
      ],
      yearsOfExperience: 14,
      spokenLanguages: ["Hindi", "Hinglish", "Marwari"],
      equipmentHandled: [
        "Bosch GKS 190 Circular Saw",
        "Makita Plunge Router",
        "DeWalt Laser Measure",
      ],
      recentProjectsSummary:
        "Led 8-person crew on 12 luxury residential apartments in Gurugram and restored heritage colonial furniture in Jaipur.",
      recommendedCertifications: [
        "NSDC Level 4 Master Carpenter",
        "Hettich Certified Hardware Specialist",
      ],
      confidenceScore: 0.96,
    };
  }

  const ai = getGeminiClient();

  const prompt = `${SKILL_EXTRACTOR_SYSTEM_PROMPT}\n\nSpoken Worker Testimony:\n"${transcript}"\n\nProvide the response strictly as a JSON object matching the VoiceSkillExtractionResult interface.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text || "{}";
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?|```/g, "").trim();
  return JSON.parse(cleaned) as VoiceSkillExtractionResult;
}
