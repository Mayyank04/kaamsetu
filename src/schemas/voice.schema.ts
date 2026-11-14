import { z } from "zod";

export const voiceClaimSubmissionSchema = z.object({
  transcript: z
    .string()
    .min(10, "Spoken claim transcript must contain at least 10 characters")
    .max(5000, "Transcript cannot exceed 5000 characters"),
  language: z.string().default("hi-IN"),
  audioDurationSeconds: z.number().nonnegative().optional(),
  workerId: z.string().uuid().optional(),
});

export const extractedSkillProfileSchema = z.object({
  name: z.string().min(2),
  primaryTrade: z.string().min(2),
  secondarySkills: z.array(z.string()).default([]),
  yearsOfExperience: z.number().int().min(0).max(60),
  spokenLanguages: z.array(z.string()).default(["Hindi"]),
  equipmentHandled: z.array(z.string()).default([]),
  recentProjectsSummary: z.string().default(""),
  recommendedCertifications: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1),
});

export type VoiceClaimSubmissionInput = z.infer<typeof voiceClaimSubmissionSchema>;
export type ExtractedSkillProfile = z.infer<typeof extractedSkillProfileSchema>;
