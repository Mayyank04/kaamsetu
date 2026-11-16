/**
 * KAAMSETU — Centralized Indian Mobile Phone Utilities
 * Provides standard normalization, validation, masking, and formatting.
 */

export interface NormalizedPhone {
  valid: boolean;
  isValid: boolean;
  formatted: string;
  e164: string;
  clean10: string;
  error?: string;
}

export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export const INVALID_PHONE_MESSAGE =
  "Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8 or 9.";

/**
 * Validates and normalizes raw Indian mobile phone input.
 * Invariants:
 * - Accept exactly 10 digits
 * - Accept mobile numbers beginning with 6, 7, 8 or 9
 * - Reject numbers beginning with 0, 1, 2, 3, 4 or 5
 * - Reject alphabetic characters and malformed input
 * - Normalize consistently to E.164 format: +91XXXXXXXXXX
 */
export function validateIndianMobile(rawPhone: string): NormalizedPhone {
  if (!rawPhone || typeof rawPhone !== "string") {
    return {
      valid: false,
      isValid: false,
      formatted: "",
      e164: "",
      clean10: "",
      error: INVALID_PHONE_MESSAGE,
    };
  }

  const trimmed = rawPhone.trim();

  // Reject alphabetic characters anywhere in the input
  if (/[a-zA-Z]/.test(trimmed)) {
    return {
      valid: false,
      isValid: false,
      formatted: "",
      e164: "",
      clean10: "",
      error: INVALID_PHONE_MESSAGE,
    };
  }

  // Extract all digits
  const digits = trimmed.replace(/\D/g, "");
  let clean10 = digits;

  // Handle +91 or 91 country code prefix (12 digits)
  if (digits.startsWith("91") && digits.length === 12) {
    clean10 = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    // Domestic STD 0-prefix (11 digits)
    clean10 = digits.slice(1);
  }

  // Must be exactly 10 digits
  if (clean10.length !== 10) {
    return {
      valid: false,
      isValid: false,
      formatted: "",
      e164: "",
      clean10,
      error: INVALID_PHONE_MESSAGE,
    };
  }

  // Must begin with 6, 7, 8 or 9
  if (!INDIAN_MOBILE_REGEX.test(clean10)) {
    return {
      valid: false,
      isValid: false,
      formatted: "",
      e164: "",
      clean10,
      error: INVALID_PHONE_MESSAGE,
    };
  }

  const e164 = `+91${clean10}`;
  return {
    valid: true,
    isValid: true,
    formatted: e164,
    e164,
    clean10,
  };
}

/**
 * Normalizes any raw phone input to E.164 +91 format
 */
export function normalizeIndianPhone(rawPhone: string): NormalizedPhone {
  return validateIndianMobile(rawPhone);
}

/**
 * Checks if a phone string is a valid Indian mobile number
 */
export function isValidIndianPhone(phone: string): boolean {
  return validateIndianMobile(phone).valid;
}

/**
 * Masks a phone number for safe display (e.g. +91 98*** ***10)
 */
export function maskPhoneNumber(phone: string): string {
  const { clean10, valid } = validateIndianMobile(phone);
  if (!valid || !clean10 || clean10.length < 10) return "+91 ***** *****";
  return `+91 ${clean10.slice(0, 2)}*** ***${clean10.slice(-2)}`;
}

/**
 * Formats a clean 10-digit number for spaced visual reading (+91 98765 43210)
 */
export function formatIndianPhoneDisplay(phone: string): string {
  const { valid, clean10 } = validateIndianMobile(phone);
  if (!valid) return phone;
  return `+91 ${clean10.slice(0, 5)} ${clean10.slice(5)}`;
}
