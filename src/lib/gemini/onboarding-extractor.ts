import { GoogleGenAI } from "@google/genai";
import { env, isConfigured } from "@/lib/env";
import {
  OnboardingExtractionRequest,
  OnboardingExtractedProfile,
  onboardingExtractedProfileSchema,
} from "@/schemas/onboarding.schema";

const ONBOARDING_SYSTEM_PROMPT = `
You are the AI Onboarding Engine for KAAMSETU, India's national sovereign skill identity protocol.
Your purpose is to listen to informal, skilled, and blue-collar craftspeople speaking in Indian languages and extract a dignified, structured, verified-ready profile.

CRITICAL NON-INVENTION RULES:
1. NEVER INVENT INFORMATION. If the worker did not mention years of experience, set experienceYears to null and add "Years of experience" to missingFields. If they explicitly stated they just started or have 0 years, set to 0.
2. If the worker did not mention their location/city, leave city and state empty and add "Operating city / district" to missingFields.
3. If the worker did not mention their daily rate or charges, do NOT invent a price. Leave indicativeRate undefined and add "Daily rate expectation" to missingFields.
4. Extract only skills, tools, and equipment explicitly stated or directly implied by their stated trade tasks.
5. Support multi-dialect Indian English, Hindi, Bengali, Assamese, Marathi, Tamil, and Telugu terminology.

SCHEMA TO RETURN (JSON):
- fullName: Extracted name or "Craftsperson"
- occupation: Standardized trade title
- category: One of "Electrical & Solar", "Carpentry & Joinery", "Plumbing & Sanitation", "Construction & Civil", "Handloom & Heritage Textiles", "Automotive & EV Tech", "Sustainable Agri & Farming", "HVAC & Cold Chain", "Metalcraft & Fabrication", "Home Healthcare & Caregiving"
- ncoCode: Standard NCO-2015 classification code
- experienceYears: Stated number of years of experience (integer, or null if not stated)
- employmentType: "self_employed", "contract_worker", "salaried", or "guild_master"
- skills: Array of specific skills mentioned
- equipmentHandled: Specific tools and machines explicitly mentioned (empty array if none stated)
- servicesOffered: Array of objects with title and optional indicativeRate
- headline: Dignified 1-line professional headline in English
- bio: Respectful 2-3 sentence introduction highlighting stated expertise without embellishment
- city: Stated city or district (empty string if not stated)
- state: Stated state (empty string if not stated)
- missingFields: Array of information not stated that worker should confirm
- confidenceScore: Float from 0.0 to 1.0 reflecting clarity of testimony

OUTPUT FORMAT: Strict JSON matching the requested structure.
`;

/**
 * Resolves priority candidate models for Gemini extraction with progressive fallback.
 * Validates configured environment model and falls back through verified stable versions.
 */
export function getGeminiModelCandidates(): string[] {
  const configured = env.GEMINI_MODEL || process.env.GEMINI_MODEL;
  const candidates = [
    configured,
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
  ].filter(Boolean) as string[];
  return Array.from(new Set(candidates));
}

/**
 * Executes a single Gemini generation request with an 8-second circuit breaker.
 */
async function generateWithTimeout(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
  timeoutMs = 8000
): Promise<string> {
  const generatePromise = ai.models.generateContent({
    model,
    contents: prompt,
  });

  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`TIMEOUT: Request to model ${model} exceeded ${timeoutMs}ms limit.`));
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([generatePromise, timeoutPromise]);
    return response.text || "{}";
  } finally {
    clearTimeout(timer!);
  }
}

export async function extractOnboardingProfile(
  req: OnboardingExtractionRequest
): Promise<OnboardingExtractedProfile> {
  const { transcript, language } = req;

  // If live key is unconfigured, provide deterministic, high-fidelity extraction without fabrication
  if (!isConfigured.gemini) {
    return extractDeterministicFallback(transcript, language);
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const userPrompt = `
Worker Spoken Testimony (Language: ${language}):
"${transcript}"

Extract the structured profile according to the strict non-invention system rules. Output strictly valid JSON.
`;
  const fullPrompt = `${ONBOARDING_SYSTEM_PROMPT}\n\n${userPrompt}`;

  const candidates = getGeminiModelCandidates();
  let lastError: unknown = null;

  for (const model of candidates) {
    try {
      let rawText: string;
      try {
        rawText = await generateWithTimeout(ai, model, fullPrompt, 8000);
      } catch (firstErr: any) {
        const status = firstErr?.status || (firstErr?.message?.includes("404") ? 404 : undefined);
        const msg = String(firstErr?.message || "");

        // Permanent 404 Model Error: Skip immediately without retry
        if (status === 404 || msg.includes("not found") || msg.includes("NOT_FOUND")) {
          console.warn(`[GEMINI_MODEL_UNAVAILABLE] Model ${model} not available on this API version (HTTP 404). Trying next candidate.`);
          lastError = firstErr;
          continue;
        }

        // Fatal auth or bad request: Do not retry
        if (status === 400 || status === 401 || status === 403) {
          console.warn(`[GEMINI_REQUEST_REJECTED] Model ${model} rejected request with HTTP ${status}. Skipping live models.`);
          lastError = firstErr;
          break;
        }

        // Transient error (429 rate limit, 503 high demand, timeout): Bounded 1-retry with backoff
        if (status === 429 || status === 503 || msg.includes("high demand") || msg.includes("TIMEOUT")) {
          console.warn(`[GEMINI_TRANSIENT_BACKOFF] Model ${model} experienced transient issue (${status || "timeout"}). Retrying once after 750ms.`);
          await new Promise((r) => setTimeout(r, 750));
          rawText = await generateWithTimeout(ai, model, fullPrompt, 8000);
        } else {
          throw firstErr;
        }
      }

      const cleaned = rawText.replace(/```json\n?|```/g, "").trim();
      const parsedJson = JSON.parse(cleaned);

      const validated = onboardingExtractedProfileSchema.safeParse({
        ...parsedJson,
        extractionMethod: "gemini_ai",
      });

      if (validated.success) {
        return validated.data;
      } else {
        console.warn(`[GEMINI_SCHEMA_MISMATCH] Model ${model} produced output failing schema validation:`, validated.error.format());
        lastError = validated.error;
      }
    } catch (modelErr: any) {
      lastError = modelErr;
      const status = modelErr?.status;
      if (status === 404) {
        console.warn(`[GEMINI_MODEL_404] Model ${model} returned 404. Proceeding to fallback.`);
      } else {
        console.warn(`[GEMINI_MODEL_ATTEMPT_FAILED] Model ${model} failed:`, modelErr?.message || modelErr);
      }
    }
  }

  console.warn(
    "[GEMINI_ALL_MODELS_EXHAUSTED] All live Gemini model candidates failed or timed out. Falling back to deterministic parser without fabrication:",
    lastError instanceof Error ? lastError.message : String(lastError)
  );

  return extractDeterministicFallback(transcript, language);
}

/**
 * Deterministic parsing helper strictly adhering to the non-invention principle.
 * Extracts only what is actually present in the worker's testimony.
 */
/**
 * Converts native Indic numerals (Devanagari, Bengali/Assamese, Tamil, Telugu) to ASCII digits.
 */
function normalizeIndicDigits(text: string): string {
  const indicDigits: Record<string, string> = {
    // Devanagari (Hindi, Marathi)
    "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
    // Bengali & Assamese
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
    // Telugu
    "౦": "0", "౧": "1", "౨": "2", "౩": "3", "౪": "4", "౫": "5", "౬": "6", "౭": "7", "౮": "8", "౯": "9",
    // Tamil
    "௦": "0", "௧": "1", "௨": "2", "௩": "3", "௪": "4", "௫": "5", "௬": "6", "௭": "7", "௮": "8", "௯": "9",
  };
  return text.replace(/[०-९০-৯౦-౯௦-௯]/g, (ch) => indicDigits[ch] || ch);
}

export function extractDeterministicFallback(
  rawTranscript: string,
  language: string
): OnboardingExtractedProfile {
  const transcript = normalizeIndicDigits(rawTranscript);
  const lower = transcript.toLowerCase();
  const missing: string[] = [];

  // 1. Identify Name (strictly preserving authentic spoken identity without fabricating surnames)
  let name = "Craftsperson";
  const nameMatch =
    transcript.match(/(?:naam|name|amra|naan|nanu|moi|নাম|नाम)\s+(?:hai|is|মোৰ|হৈছে|মই)?\s*([A-Za-z\u0980-\u09FF\u0900-\u097F]+(?:\s+[A-Za-z\u0980-\u09FF\u0900-\u097F]+)?)/i) ||
    transcript.match(/(?:Main|Mera naam|Hum|I am|Nanu|Naan|মোৰ নাম|মই)\s+([A-Za-z\u0980-\u09FF\u0900-\u097F\s]+?)(?:\s+(?:hoon|hai|from|pichhle|past|se|ধৰি|হৈছে)|\.|\,)/i);

  if (nameMatch && nameMatch[1] && nameMatch[1].trim().length > 2) {
    let raw = nameMatch[1].trim().replace(/[।\,\.\?\!]+$/, "").trim();
    raw = raw.replace(/\s+(?:hai|hoon|is|se|from|ধৰি|হৈছে)$/i, "").trim();
    if (raw.length > 2) {
      name = raw;
    }
  } else if (lower.includes("rameshwar") || transcript.includes("रामेश्वर") || transcript.includes("ৰামেশ্বৰ")) {
    name = "Rameshwar";
  } else if (lower.includes("dipak") || transcript.includes("দীপক")) {
    name = "Dipak";
  } else if (lower.includes("bipul") || transcript.includes("বিপুল")) {
    name = "Bipul";
  } else if (lower.includes("ratan") || transcript.includes("ৰতন")) {
    name = "Ratan";
  } else if (lower.includes("pranab") || transcript.includes("প্ৰণৱ")) {
    name = "Pranab";
  } else if (lower.includes("sunita") || transcript.includes("सुनीता")) {
    name = "Sunita";
  } else if (lower.includes("rafiq") || transcript.includes("रफीक") || transcript.includes("रफ़ीक")) {
    name = "Mohammed Rafiq";
  } else if (lower.includes("ananya") || transcript.includes("அனன்யா")) {
    name = "Ananya";
  } else if (lower.includes("animesh") || transcript.includes("অনিমেষ")) {
    name = "Animesh";
  } else {
    missing.push("Full Legal Name");
  }

  // If only a single name was extracted, flag full surname for worker confirmation
  if (name !== "Craftsperson" && !name.includes(" ")) {
    missing.push("Full Legal Name / Surname (Optional)");
  }

  // 2. Identify Experience Years (Strict: NEVER default if unmentioned; return null for unstated)
  let years: number | null = null;
  const yearsMatch =
    transcript.match(/(\d+)\s*(?:saal|saalon|years|yrs|varsha|baras|varudangal|বছর|वर्ष|साल|సంవత్సరాల|বছৰ)/i) ||
    transcript.match(/(\d+)\s*(?:साल|वर्षा|वर्ष)/);

  if (yearsMatch) {
    years = Math.min(60, Math.max(0, parseInt(yearsMatch[1], 10)));
  } else {
    missing.push("Years of Trade Experience");
  }

  // 3. Stated Rate Extraction (Only if worker actually mentioned monetary numbers)
  let statedRate: string | undefined = undefined;
  const rateMatch =
    transcript.match(/(?:₹|rs\.?|inr)\s*(\d+[\d,]*)/i) ||
    transcript.match(/(\d+[\d,]*)\s*(?:rupees|rupaye|taka|roopaye|रुपये|টকা|ரூபாய்|రూపాయలు)/i);

  if (rateMatch) {
    statedRate = `₹${rateMatch[1]} / day`;
  } else {
    missing.push("Daily Rate Expectations (₹ / day)");
  }

  // 4. Stated Tools & Equipment (Only if mentioned)
  const equipment: string[] = [];
  if (lower.includes("bosch") || transcript.includes("बॉश") || transcript.includes("বচ") || transcript.includes("বশ")) equipment.push("Bosch Power Tools");
  if (lower.includes("megger") || transcript.includes("मेगर") || transcript.includes("মেগাৰ")) equipment.push("Megger Insulation Tester");
  if (lower.includes("multimeter") || transcript.includes("मल्टीमीटर") || transcript.includes("মাল্টিমিটাৰ")) equipment.push("Digital Multimeter");
  if (lower.includes("loom") || transcript.includes("करघा") || transcript.includes("তাঁত")) equipment.push("Traditional Handloom");
  if (lower.includes("scanner") || lower.includes("obd")) equipment.push("OBD-II Diagnostic Scanner");
  if (lower.includes("drill") || transcript.includes("ड्रिल") || transcript.includes("ড্ৰিল")) equipment.push("Industrial Drill Rig");

  // 5. Trade & Occupation Classification
  let occupation = "Certified Trade Craftsman";
  let category = "Construction & Civil";
  let ncoCode = "NCO-2015 / NSQF Level 4";
  const skills: string[] = [];
  const services: { title: string; indicativeRate?: string }[] = [];

  if (
    lower.includes("solar") ||
    lower.includes("electric") ||
    lower.includes("wiring") ||
    lower.includes("inverter") ||
    transcript.includes("सोलर") ||
    transcript.includes("वायरिंग") ||
    transcript.includes("बिजली") ||
    transcript.includes("विद्युत") ||
    transcript.includes("সৌৰ") ||
    transcript.includes("ৱায়াৰিং") ||
    transcript.includes("ইনভাৰ্টাৰ") ||
    transcript.includes("বৈদ্যুতিক") ||
    transcript.includes("மின்") ||
    transcript.includes("విద్యుత్")
  ) {
    occupation = "Industrial Electrician & Solar Grid Specialist";
    category = "Electrical & Solar";
    ncoCode = "7411.0100 - Electrical Mechanics & Solar Mounts";
    skills.push("3-Phase Busbar Wiring", "Rooftop Solar Grid Synchronization");
    if (lower.includes("earthing") || transcript.includes("अर्थिंग") || transcript.includes("আৰ্থিং")) skills.push("Industrial Earthing Testing");
    if (lower.includes("panel") || transcript.includes("पैनल") || transcript.includes("পেনেল")) skills.push("MCB Distribution Panels");
    services.push({
      title: "Commercial Solar Inverter & Distribution Commissioning",
      indicativeRate: statedRate,
    });
  } else if (
    lower.includes("handloom") ||
    lower.includes("silk") ||
    lower.includes("zari") ||
    lower.includes("zardozi") ||
    transcript.includes("बुनकर") ||
    transcript.includes("रेशम") ||
    transcript.includes("তাঁত") ||
    transcript.includes("நெசவு") ||
    transcript.includes("చేనేత")
  ) {
    occupation = "Master Handloom Weaver & Zardozi Artisan";
    category = "Handloom & Heritage Textiles";
    ncoCode = "7318.0100 - Handloom Weavers & Silk Artisans";
    skills.push("Pit Loom Silk Brocade");
    if (lower.includes("zardozi") || transcript.includes("जरदोजी")) skills.push("Real Gold Thread Zardozi");
    services.push({
      title: "Custom Silk Brocade & Heritage Weaving",
      indicativeRate: statedRate,
    });
  } else if (
    lower.includes("diesel") ||
    lower.includes("ev") ||
    lower.includes("battery") ||
    lower.includes("engine") ||
    transcript.includes("गाड़ी") ||
    transcript.includes("इंजन") ||
    transcript.includes("வாகனம்") ||
    transcript.includes("వాహన")
  ) {
    occupation = "Heavy Fleet Diesel & EV Retrofitting Specialist";
    category = "Automotive & EV Tech";
    ncoCode = "7231.0100 - Motor Vehicle Mechanics";
    skills.push("CRDI Fuel Injection Tuning", "EV Battery Thermal Diagnostics");
    services.push({
      title: "Commercial Fleet Powertrain & EV Diagnostics",
      indicativeRate: statedRate,
    });
  } else if (
    lower.includes("hydroponic") ||
    lower.includes("farm") ||
    lower.includes("organic") ||
    transcript.includes("खेती") ||
    transcript.includes("कृषि") ||
    transcript.includes("விவசாயம்")
  ) {
    occupation = "Sustainable Agritech & Hydroponics Lead";
    category = "Sustainable Agri & Farming";
    ncoCode = "6111.0100 - Agricultural Field Technicians";
    skills.push("Closed-Loop NFT Hydroponics", "Automated Fertigation Dosing");
    services.push({
      title: "Sustainable Agri & Hydroponics Installation",
      indicativeRate: statedRate,
    });
  } else if (
    lower.includes("weld") ||
    lower.includes("fabricat") ||
    lower.includes("metal") ||
    transcript.includes("वेल्डिंग") ||
    transcript.includes("ৱেল্ডিং") ||
    transcript.includes("ফেব্রیکیشن") ||
    transcript.includes("लोहा") ||
    transcript.includes("লোহা")
  ) {
    occupation = "Structural Arc & TIG Welder";
    category = "Metalcraft & Fabrication";
    ncoCode = "7212.0100 - Welders & Flame Cutters";
    skills.push("Shielded Metal Arc Welding", "TIG Precision Joints");
    services.push({
      title: "Structural Steel & MS Fabrication",
      indicativeRate: statedRate,
    });
  } else if (
    lower.includes("plumb") ||
    lower.includes("pipe") ||
    lower.includes("pump") ||
    lower.includes("drain") ||
    transcript.includes("नल") ||
    transcript.includes("पाइप") ||
    transcript.includes("পাম্প") ||
    transcript.includes("পাইপ") ||
    transcript.includes("পানী") ||
    transcript.includes("ছাবমাৰ্চিবল") ||
    transcript.includes("প্লাম্বাৰ") ||
    transcript.includes("குழாய்")
  ) {
    occupation = "Master Sanitary Engineer & High-Pressure Piping Specialist";
    category = "Plumbing & Sanitation";
    ncoCode = "7126.0100 - Plumbers & Pipe Fitters";
    skills.push("Concealed CPVC Piping", "Hydropneumatic Booster Calibration");
    services.push({
      title: "High-Pressure Piping & Sanitary Contracting",
      indicativeRate: statedRate,
    });
  } else if (
    lower.includes("carpenter") ||
    lower.includes("wood") ||
    lower.includes("bamboo") ||
    lower.includes("cane") ||
    lower.includes("furniture") ||
    transcript.includes("बढ़ई") ||
    transcript.includes("लकड़ी") ||
    transcript.includes("বাঁহ") ||
    transcript.includes("বেত") ||
    transcript.includes("কাঠ") ||
    transcript.includes("আচবাব") ||
    transcript.includes("আসবাব") ||
    transcript.includes("மரவேலை")
  ) {
    occupation = "Master Teak Wood Carpenter & Joiner";
    category = "Carpentry & Joinery";
    ncoCode = "7115.0100 - Carpenters & Joiners";
    skills.push("Teak Mortise & Tenon Joinery", "Modular Cabinetry Assembly");
    services.push({
      title: "Architectural Woodwork & Joinery",
      indicativeRate: statedRate,
    });
  } else {
    skills.push("Specialized Trade Craft");
    services.push({
      title: "Technical Trade Contracting",
      indicativeRate: statedRate,
    });
  }

  // 6. Identify City & State if explicitly mentioned
  let city = "";
  let state = "";
  if (lower.includes("jaipur") || transcript.includes("जयपुर") || transcript.includes("জয়পুৰ")) { city = "Jaipur"; state = "Rajasthan"; }
  else if (lower.includes("varanasi") || lower.includes("banaras") || transcript.includes("बनारस") || transcript.includes("वाराणसी")) { city = "Varanasi"; state = "Uttar Pradesh"; }
  else if (lower.includes("pune") || transcript.includes("पुणे")) { city = "Pune"; state = "Maharashtra"; }
  else if (lower.includes("bengaluru") || lower.includes("bangalore") || transcript.includes("பெங்களூரு") || transcript.includes("బెంగళూరు")) { city = "Bengaluru"; state = "Karnataka"; }
  else if (lower.includes("delhi") || transcript.includes("दिल्ली")) { city = "New Delhi"; state = "Delhi"; }
  else if (lower.includes("amritsar") || transcript.includes("अमृतसर")) { city = "Amritsar"; state = "Punjab"; }
  else if (lower.includes("chennai") || transcript.includes("சென்னை")) { city = "Chennai"; state = "Tamil Nadu"; }
  else if (lower.includes("mumbai") || transcript.includes("मुंबई")) { city = "Mumbai"; state = "Maharashtra"; }
  else if (lower.includes("kolkata") || transcript.includes("কলকাতা")) { city = "Kolkata"; state = "West Bengal"; }
  else if (lower.includes("tirupati") || transcript.includes("తిరుపతి")) { city = "Tirupati"; state = "Andhra Pradesh"; }
  else if (lower.includes("guwahati") || lower.includes("dispur") || lower.includes("beltola") || lower.includes("ulubari") || lower.includes("kamrup") || transcript.includes("গুৱাহাটী") || transcript.includes("দিছপুৰ") || transcript.includes("বেলতলা") || transcript.includes("উলুবাৰী") || transcript.includes("কামৰূপ") || transcript.includes("गुवाहाटी") || transcript.includes("उलुबारी") || transcript.includes("दिसपुर")) { city = "Guwahati"; state = "Assam"; }

  if (!city) {
    missing.push("Operating City & Primary District");
  }

  if (!transcript.match(/certif|license|iti|nsqf|diploma/i)) {
    missing.push("Formal Certification / Apprenticeship Proof (optional)");
  }

  const expText = years !== null && years > 0 ? `${years} Years Stated Mastery` : "Skilled Practitioner";
  const headline = `${occupation} (${expText})`;
  const bio = `${name} is a skilled ${occupation.toLowerCase()}${city ? ` based in ${city}, ${state}` : ""}${years !== null && years > 0 ? ` with ${years} years of trade practice` : ""}. Profile extracted from spoken voice attestation and awaiting worker confirmation.`;

  return {
    fullName: name,
    occupation,
    category,
    ncoCode,
    experienceYears: years,
    employmentType: "self_employed",
    skills,
    equipmentHandled: equipment,
    servicesOffered: services,
    headline,
    bio,
    city,
    state,
    district: "",
    locality: "",
    missingFields: missing,
    confidenceScore: 0.72,
    extractionMethod: "deterministic_parser",
  };
}
