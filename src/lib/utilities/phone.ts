/**
 * KAAMSETU — Centralized Indian Mobile Phone Utilities
 * Provides standard normalization, validation, masking, and formatting.
 */

export interface NormalizedPhone {
  valid: boolean;
  formatted: string;
  clean10: string;
}

/**
 * Normalizes any raw phone input to E.164 +91 format
 * Handles: 10 digits, +91 prefix, 91 prefix, 0 prefix, spaces, dashes.
 */
export function normalizeIndianPhone(rawPhone: string): NormalizedPhone {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { valid: false, formatted: "+91", clean10: "" };
  }

  const digits = rawPhone.replace(/\D/g, "");
  let clean10 = digits;

  if (digits.startsWith("91") && digits.length === 12) {
    clean10 = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    clean10 = digits.slice(1);
  }

  const valid = /^[6-9]\d{9}$/.test(clean10);

  return {
    valid,
    formatted: `+91${clean10}`,
    clean10,
  };
}

/**
 * Checks if a phone string is a valid Indian mobile number
 */
export function isValidIndianPhone(phone: string): boolean {
  return normalizeIndianPhone(phone).valid;
}

/**
 * Masks a phone number for safe display (e.g. +91 98*** ***10)
 */
export function maskPhoneNumber(phone: string): string {
  const { clean10 } = normalizeIndianPhone(phone);
  if (!clean10 || clean10.length < 10) return "+91 ***** *****";
  return `+91 ${clean10.slice(0, 2)}*** ***${clean10.slice(-2)}`;
}

/**
 * Formats a clean 10-digit number for spaced visual reading (+91 98765 43210)
 */
export function formatIndianPhoneDisplay(phone: string): string {
  const { valid, clean10 } = normalizeIndianPhone(phone);
  if (!valid) return phone;
  return `+91 ${clean10.slice(0, 5)} ${clean10.slice(5)}`;
}
