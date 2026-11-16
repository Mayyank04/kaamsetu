import { z } from "zod";
import {
  INDIAN_MOBILE_REGEX,
  INVALID_PHONE_MESSAGE,
  validateIndianMobile,
} from "@/lib/utilities/phone";

export const indianMobileRegex = INDIAN_MOBILE_REGEX;

export const phoneAuthSchema = z.object({
  phone: z
    .string({ required_error: "Mobile number is required" })
    .trim()
    .refine(
      (val) => validateIndianMobile(val).valid,
      {
        message: INVALID_PHONE_MESSAGE,
      }
    )
    .transform((val) => validateIndianMobile(val).clean10),
  role: z
    .enum([
      "worker",
      "contractor",
      "employer",
      "verifier",
      "customer",
      "admin",
      "institution",
    ])
    .default("worker"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .optional(),
  intent: z.enum(["registration", "login"]).default("login"),
});

export const otpVerificationSchema = z.object({
  phone: z
    .string({ required_error: "Mobile number is required" })
    .trim()
    .refine(
      (val) => validateIndianMobile(val).valid,
      {
        message: INVALID_PHONE_MESSAGE,
      }
    )
    .transform((val) => validateIndianMobile(val).clean10),
  otp: z
    .string({ required_error: "Verification code is required" })
    .trim()
    .regex(/^\d{6}$/, "Verification code must be exactly 6 digits"),
  role: z
    .enum([
      "worker",
      "contractor",
      "employer",
      "verifier",
      "customer",
      "admin",
      "institution",
    ])
    .default("worker"),
  fullName: z.string().optional(),
  intent: z.enum(["registration", "login"]).optional(),
});

export type PhoneAuthInput = z.infer<typeof phoneAuthSchema>;
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;
