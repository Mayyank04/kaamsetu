import { z } from "zod";

export const supportedLanguageCodes = [
  "en",
  "hi",
  "as",
  "bn",
  "or",
  "pa",
  "gu",
  "mr",
  "ur",
  "ta",
  "te",
  "kn",
  "ml",
  "ne",
  "brx",
  "mni",
  "ks",
  "sa",
] as const;
export type SupportedLanguageCode = (typeof supportedLanguageCodes)[number];

export interface LanguageOption {
  code: SupportedLanguageCode;
  name: string; // e.g. "Hindi"
  nativeName: string; // e.g. "हिन्दी"
  greeting: string; // e.g. "नमस्ते"
  flagEmoji: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", greeting: "Welcome", flagEmoji: "🌐" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", greeting: "नमस्ते", flagEmoji: "🇮🇳" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", greeting: "নমস্কাৰ", flagEmoji: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", greeting: "নমস্কার", flagEmoji: "🇮🇳" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", greeting: "ନମସ୍କାର", flagEmoji: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", flagEmoji: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", greeting: "નમસ્તે", flagEmoji: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", greeting: "नमस्कार", flagEmoji: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", greeting: "آداب / سلام", flagEmoji: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", greeting: "வணக்கம்", flagEmoji: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", greeting: "నమస్కారం", flagEmoji: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", greeting: "ನಮಸ್ಕಾರ", flagEmoji: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", greeting: "നമസ്കാരം", flagEmoji: "🇮🇳" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", greeting: "नमस्ते", flagEmoji: "🇮🇳" },
  { code: "brx", name: "Bodo", nativeName: "बड़ो", greeting: "खुलुमबाय", flagEmoji: "🇮🇳" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্", greeting: "খুরুমজরি", flagEmoji: "🇮🇳" },
  { code: "ks", name: "Kashmiri", nativeName: "کٲشُر", greeting: "سلام / نمسکار", flagEmoji: "🇮🇳" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", greeting: "नमो नमः", flagEmoji: "🇮🇳" },
];

// Zod input validation for onboarding extraction
export const onboardingExtractionRequestSchema = z.object({
  transcript: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters describing your trade experience.")
    .max(5000, "Spoken claim transcript exceeds maximum character limit."),
  language: z.enum(supportedLanguageCodes).default("hi"),
  inputMode: z.enum(["voice", "text"]).default("voice"),
});

export type OnboardingExtractionRequest = z.infer<typeof onboardingExtractionRequestSchema>;

// Vendor product schema
export const vendorProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Product name is required"),
  name_vernacular: z.string().optional(),
  category: z.string().default("General"),
  price: z.number().min(0),
  unit: z.string().default("unit"),
  in_stock: z.boolean().default(true),
  description: z.string().optional(),
});
export type VendorProductInput = z.infer<typeof vendorProductSchema>;

// Zod output validation for structured worker extraction (Never invent information)
export const onboardingExtractedProfileSchema = z.object({
  fullName: z.string().min(2).default("Craftsperson"),
  occupation: z.string().min(2, "Occupation could not be determined"),
  category: z.string().min(2, "Trade category is required"),
  ncoCode: z.string().optional().default("NCO-2015 / NSQF Level 4"),
  profileType: z.enum(["service_professional", "goods_vendor", "hybrid_artisan"]).optional(),
  businessName: z.string().optional(),
  vendorType: z.string().optional(),
  stallType: z.enum(["mobile_cart", "fixed_stall", "home_workshop", "kiosk", "retail_shop", "other"]).optional(),
  operatingHours: z.string().optional(),
  productCatalog: z.array(vendorProductSchema).optional(),
  deliveryAvailable: z.boolean().optional(),
  contactPreference: z.enum(["phone", "whatsapp", "in_person", "any"]).optional(),
  experienceYears: z.number().int().min(0).max(60).nullable().default(null),
  employmentType: z.enum(["self_employed", "contract_worker", "salaried", "guild_master"]).default("self_employed"),
  skills: z.array(z.string()).min(1, "At least one skill must be identified"),
  equipmentHandled: z.array(z.string()).default([]),
  servicesOffered: z.array(
    z.object({
      title: z.string(),
      indicativeRate: z.string().optional(),
    })
  ).default([]),
  headline: z.string().min(5),
  bio: z.string().min(20),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  district: z.string().optional().default(""),
  locality: z.string().optional().default(""),
  missingFields: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1).default(0.95),
  extractionMethod: z.enum(["gemini_ai", "deterministic_parser"]).default("deterministic_parser"),
});

export type OnboardingExtractedProfile = z.infer<typeof onboardingExtractedProfileSchema>;

// Zod schema for final approved profile submission
export const approvedProfileSubmissionSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  occupation: z.string().min(2, "Occupation is required"),
  category: z.string().min(2, "Category is required"),
  profileType: z.enum(["service_professional", "goods_vendor", "hybrid_artisan"]).optional(),
  businessName: z.string().optional(),
  vendorType: z.string().optional(),
  stallType: z.enum(["mobile_cart", "fixed_stall", "home_workshop", "kiosk", "retail_shop", "other"]).optional(),
  operatingHours: z.string().optional(),
  productCatalog: z.array(vendorProductSchema).optional(),
  deliveryAvailable: z.boolean().optional(),
  contactPreference: z.enum(["phone", "whatsapp", "in_person", "any"]).optional(),
  yearsExperience: z.number().int().min(0).max(60).nullable().default(null),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().optional(),
  locality: z.string().optional(),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Pincode must be 6 digits")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  ncoCode: z.string().optional(),
  skills: z.array(z.string()).min(1, "Include at least one validated skill"),
  equipmentHandled: z.array(z.string()).default([]),
  dailyRateMin: z.number().int().positive().nullable().optional(),
  dailyRateMax: z.number().int().positive().nullable().optional(),
  headline: z.string().min(5),
  bio: z.string().min(10),
  languages: z.array(z.string()).min(1),
  voiceTranscript: z.string().optional(),
  audioStoragePath: z.string().optional().nullable(),
  audioRecordingId: z.string().optional().nullable(),
  hasVoiceAttestation: z.boolean().optional(),
  workerConfirmedVoice: z.boolean().optional(),
  allowNonDispatchProfile: z.boolean().optional().default(true),
  isPublished: z.boolean().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export type ApprovedProfileSubmission = z.infer<typeof approvedProfileSubmissionSchema>;
