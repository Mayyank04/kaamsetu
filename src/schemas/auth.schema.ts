import { z } from "zod";

export const indianMobileRegex = /^[6-9]\d{9}$/;

export const phoneAuthSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[^\d]/g, ""))
    .refine(
      (val) => {
        // Strip 91 prefix if included
        const clean = val.startsWith("91") && val.length === 12 ? val.slice(2) : val;
        return indianMobileRegex.test(clean);
      },
      {
        message: "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)",
      }
    ),
  role: z.enum(["worker", "contractor", "employer", "verifier", "customer", "admin", "institution"]).default("worker"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .optional(),
  intent: z.enum(["registration", "login"]).default("login"),
});

export const otpVerificationSchema = z.object({
  phone: z.string().min(10),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Verification code must be exactly 6 digits"),
  role: z.enum(["worker", "contractor", "employer", "verifier", "customer", "admin", "institution"]).default("worker"),
  fullName: z.string().optional(),
  intent: z.enum(["registration", "login"]).optional(),
});

export type PhoneAuthInput = z.infer<typeof phoneAuthSchema>;
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;
