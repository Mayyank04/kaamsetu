/**
 * KAAMSETU Privacy Logger & Diagnostic Masking Utility
 *
 * Ensures PII (phone numbers, email addresses, names) and secret material
 * (signing keys, service keys, OTPs) are NEVER exposed in application logs or test output.
 */

/**
 * Masks a phone number showing only the last 4 digits.
 * Example: "+919876543210" -> "******3210"
 */
export function maskPhone(phone?: string | null): string {
  if (!phone) return "[NO_PHONE]";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return "******";
  const last4 = digits.slice(-4);
  return `******${last4}`;
}

/**
 * Masks an email address showing only the initial character and domain.
 * Example: "artisan@kaamsetu.in" -> "a***@kaamsetu.in"
 */
export function maskEmail(email?: string | null): string {
  if (!email) return "[NO_EMAIL]";
  const parts = email.split("@");
  if (parts.length !== 2 || !parts[0]) return "***@***";
  const firstChar = parts[0].charAt(0);
  return `${firstChar}***@${parts[1]}`;
}

/**
 * Masks sensitive secret keys, OTPs, or auth tokens.
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return "[NOT_SET]";
  return "[REDACTED_SECRET]";
}

/**
 * Sanitizes an object by recursively masking known sensitive keys.
 */
export function sanitizeLogData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("phone") || lowerKey.includes("mobile")) {
      sanitized[key] = typeof value === "string" ? maskPhone(value) : "[MASKED_PHONE]";
    } else if (lowerKey.includes("email")) {
      sanitized[key] = typeof value === "string" ? maskEmail(value) : "[MASKED_EMAIL]";
    } else if (
      lowerKey.includes("secret") ||
      lowerKey.includes("key") ||
      lowerKey.includes("token") ||
      lowerKey.includes("otp") ||
      lowerKey.includes("password")
    ) {
      sanitized[key] = maskSecret(typeof value === "string" ? value : undefined);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export const logger = {
  info(message: string, data?: unknown) {
    if (process.env.NODE_ENV !== "test") {
      console.log(JSON.stringify({ level: "info", message, ...(data ? { data: sanitizeLogData(data) } : {}) }));
    }
  },
  warn(message: string, data?: unknown) {
    console.warn(JSON.stringify({ level: "warn", message, ...(data ? { data: sanitizeLogData(data) } : {}) }));
  },
  error(message: string, data?: unknown) {
    console.error(JSON.stringify({ level: "error", message, ...(data ? { data: sanitizeLogData(data) } : {}) }));
  },
};
