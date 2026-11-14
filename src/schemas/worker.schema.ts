import { z } from "zod";

export const workerProfileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name cannot exceed 80 characters"),
  primaryTrade: z
    .string()
    .min(2, "Primary trade is required"),
  subTrades: z
    .array(z.string())
    .min(1, "Please specify at least one skill or sub-trade")
    .max(10),
  yearsExperience: z
    .number()
    .int()
    .min(0, "Years of experience cannot be negative")
    .max(60, "Years of experience must be 60 or less"),
  location: z.object({
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be a valid 6-digit Indian postal code"),
  }),
  languages: z
    .array(z.string())
    .min(1, "Specify at least one working language"),
  dailyRateEstimate: z
    .object({
      min: z.number().int().positive(),
      max: z.number().int().positive(),
    })
    .refine((data) => data.max >= data.min, {
      message: "Maximum rate must be greater than or equal to minimum rate",
    })
    .optional(),
  availabilityStatus: z
    .enum(["available", "on_site", "booked"])
    .default("available"),
});

export type WorkerProfileUpdateInput = z.infer<typeof workerProfileUpdateSchema>;
