import { z } from "zod";

export const peerEndorsementSchema = z.object({
  workerRegistryId: z
    .string()
    .min(5, "Worker Registry ID is required"),
  endorserRegistryId: z
    .string()
    .min(5, "Endorser Registry ID is required"),
  skillsEndorsed: z
    .array(z.string())
    .min(1, "Please endorse at least one skill"),
  rating: z
    .number()
    .int()
    .min(1)
    .max(5, "Rating must be between 1 and 5 stars"),
  comment: z
    .string()
    .min(10, "Endorsement commentary must be at least 10 characters")
    .max(500, "Commentary cannot exceed 500 characters"),
});

export const workAttestationSchema = z.object({
  workerRegistryId: z.string().min(5),
  projectTitle: z.string().min(3),
  completionDate: z.string(),
  qualityRating: z.number().int().min(1).max(5),
  onTimePunctuality: z.boolean().default(true),
  feedbackNote: z.string().max(1000).optional(),
});

export type PeerEndorsementInput = z.infer<typeof peerEndorsementSchema>;
export type WorkAttestationInput = z.infer<typeof workAttestationSchema>;
