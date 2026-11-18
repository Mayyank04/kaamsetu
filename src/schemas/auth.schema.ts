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
  termsAccepted: z.boolean().optional(),
  privacyAccepted: z.boolean().optional(),
  termsVersion: z.string().optional().default("2026.1"),
  privacyVersion: z.string().optional().default("2026.1"),
  intent: z.enum(["registration", "login"]).default("login"),
});

export const registrationInputSchema = phoneAuthSchema.extend({
  fullName: z
    .string({ required_error: "Full name is required for registration" })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Please accept the Terms of Service and Privacy Policy to continue." }),
  }),
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
  termsAccepted: z.boolean().optional(),
  privacyAccepted: z.boolean().optional(),
  termsVersion: z.string().optional(),
  privacyVersion: z.string().optional(),
});

export type PhoneAuthInput = z.infer<typeof phoneAuthSchema>;
export type RegistrationInput = z.infer<typeof registrationInputSchema>;
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;

export const directRegistrationSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters"),
  email: z
    .string({ required_error: "Email address is required" })
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters"),
  confirmPassword: z
    .string({ required_error: "Please confirm your password" })
    .min(8, "Confirm password must be at least 8 characters long"),
  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || validateIndianMobile(val).valid, {
      message: INVALID_PHONE_MESSAGE,
    })
    .transform((val) => (val && validateIndianMobile(val).valid ? validateIndianMobile(val).clean10 : undefined)),
  role: z
    .enum(["worker", "contractor", "customer", "institution"])
    .default("worker"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Please accept the Terms of Service and Privacy Policy to continue." }),
  }),
  privacyAccepted: z.boolean().optional().default(true),
  termsVersion: z.string().optional().default("2026.1"),
  privacyVersion: z.string().optional().default("2026.1"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const directLoginSchema = z.object({
  identifier: z
    .string({ required_error: "Email address or mobile number is required" })
    .trim()
    .min(1, "Please enter your email or mobile number"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
  role: z
    .enum(["worker", "contractor", "customer", "institution"])
    .optional(),
});

export type DirectRegistrationInput = z.infer<typeof directRegistrationSchema>;
export type DirectLoginInput = z.infer<typeof directLoginSchema>;

