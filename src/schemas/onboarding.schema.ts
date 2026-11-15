import { z } from "zod";

export const supportedLanguageCodes = ["en", "hi", "as", "bn", "ta", "te", "mr"] as const;
export type SupportedLanguageCode = (typeof supportedLanguageCodes)[number];

export interface LanguageOption {
  code: SupportedLanguageCode;
  name: string; // e.g. "Hindi"
  nativeName: string; // e.g. "हिन्दी"
  greeting: string; // e.g. "नमस्ते"
  flagEmoji: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", greeting: "नमस्ते", flagEmoji: "🇮🇳" },
  { code: "en", name: "English", nativeName: "English", greeting: "Namaste / Welcome", flagEmoji: "🌐" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", greeting: "নমস্কার", flagEmoji: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", greeting: "नमस्कार", flagEmoji: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", greeting: "வணக்கம்", flagEmoji: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", greeting: "నమస్కారం", flagEmoji: "🇮🇳" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", greeting: "নমস্কাৰ", flagEmoji: "🇮🇳" },
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

// Zod output validation for structured worker extraction (Never invent information)
export const onboardingExtractedProfileSchema = z.object({
  fullName: z.string().min(2).default("Craftsperson"),
  occupation: z.string().min(2, "Occupation could not be determined"),
  category: z.string().min(2, "Trade category is required"),
  ncoCode: z.string().optional().default("NCO-2015 / NSQF Level 4"),
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
  missingFields: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1).default(0.95),
});

export type OnboardingExtractedProfile = z.infer<typeof onboardingExtractedProfileSchema>;

// Zod schema for final approved profile submission
export const approvedProfileSubmissionSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  occupation: z.string().min(2, "Occupation is required"),
  category: z.string().min(2, "Category is required"),
  yearsExperience: z.number().int().min(0).max(60).nullable().default(null),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Pincode must be 6 digits").optional(),
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
  isPublished: z.boolean().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export type ApprovedProfileSubmission = z.infer<typeof approvedProfileSubmissionSchema>;
