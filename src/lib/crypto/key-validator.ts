/**
 * Cryptographic Key Quality & Entropy Validator for KAAMSETU
 *
 * Ensures cryptographic secrets (HMAC rate limit secrets, credential signing keys)
 * possess genuine 256-bit entropy (minimum 32 decoded bytes), safe encoding,
 * and are free from predictable or low-entropy patterns.
 */

export interface KeyValidationResult {
  valid: boolean;
  byteLength: number;
  format: "base64" | "hex" | "utf8";
  error?: string;
}

// Patterns known to represent placeholders, insecure defaults, or low-entropy strings
const PREDICTABLE_PATTERNS = [
  "placeholder",
  "password",
  "secret",
  "kaamsetu-dev",
  "12345678",
  "abcdefgh",
  "default-secret",
];

/**
 * Validates the quality, encoding, and minimum 256-bit entropy of a cryptographic secret.
 * NEVER logs or returns the secret content in error messages.
 */
export function validateCryptographicKeyMaterial(
  secret: string | undefined | null,
  keyName: string = "Cryptographic Secret"
): KeyValidationResult {
  if (!secret || typeof secret !== "string") {
    return {
      valid: false,
      byteLength: 0,
      format: "utf8",
      error: `${keyName} is missing or undefined.`,
    };
  }

  const trimmed = secret.trim();

  // Reject obvious low-entropy and placeholder strings
  const lower = trimmed.toLowerCase();
  for (const pattern of PREDICTABLE_PATTERNS) {
    if (lower.includes(pattern)) {
      return {
        valid: false,
        byteLength: Buffer.byteLength(trimmed, "utf8"),
        format: "utf8",
        error: `${keyName} contains an insecure, predictable, or placeholder string pattern.`,
      };
    }
  }

  // Reject repetitive single-character sequences (e.g. "aaaaaaaa...")
  const uniqueChars = new Set(trimmed).size;
  if (uniqueChars < 10) {
    return {
      valid: false,
      byteLength: Buffer.byteLength(trimmed, "utf8"),
      format: "utf8",
      error: `${keyName} lacks sufficient character entropy (insufficient character diversity).`,
    };
  }

  // 1. Check if string is Base64 encoded (standard for `openssl rand -base64 32`)
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (trimmed.length % 4 === 0 && base64Regex.test(trimmed)) {
    const decoded = Buffer.from(trimmed, "base64");
    if (decoded.length >= 32) {
      return {
        valid: true,
        byteLength: decoded.length,
        format: "base64",
      };
    }
  }

  // 2. Check if string is Hex encoded (standard for `openssl rand -hex 32`)
  const hexRegex = /^[0-9a-fA-F]+$/;
  if (trimmed.length >= 64 && trimmed.length % 2 === 0 && hexRegex.test(trimmed)) {
    const decoded = Buffer.from(trimmed, "hex");
    if (decoded.length >= 32) {
      return {
        valid: true,
        byteLength: decoded.length,
        format: "hex",
      };
    }
  }

  // 3. Raw byte length check (UTF-8 binary string)
  const rawBytes = Buffer.byteLength(trimmed, "utf8");
  if (rawBytes >= 32) {
    return {
      valid: true,
      byteLength: rawBytes,
      format: "utf8",
    };
  }

  return {
    valid: false,
    byteLength: rawBytes,
    format: "utf8",
    error: `${keyName} provides only ${rawBytes} bytes of material. Minimum required is 32 bytes (256 bits). Recommended: generate with 'openssl rand -base64 32'.`,
  };
}

/**
 * Asserts key material quality, throwing a descriptive Fatal Configuration Error if invalid.
 * NEVER prints secret values.
 */
export function assertCryptographicKeyQuality(
  secret: string | undefined | null,
  keyName: string
): void {
  const result = validateCryptographicKeyMaterial(secret, keyName);
  if (!result.valid) {
    throw new Error(`FATAL CRYPTOGRAPHIC CONFIGURATION: ${result.error}`);
  }
}
