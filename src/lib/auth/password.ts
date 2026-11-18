/**
 * KAAMSETU — Cryptographic Password Security Service
 * Implements OWASP/NIST-aligned scrypt password hashing and constant-time verification.
 * Zero external native dependencies; fully portable across Node.js and Vercel Serverless.
 */

import * as crypto from "crypto";

export interface PasswordHashResult {
  hash: string;
  salt: string;
}

export interface PasswordStrengthResult {
  valid: boolean;
  errors: string[];
}

// Scrypt parameter configuration (OWASP recommended baseline)
const SCRYPT_CONFIG: crypto.ScryptOptions = {
  N: 16384, // CPU/memory cost parameter (2^14)
  r: 8,     // Block size parameter
  p: 1,     // Parallelization parameter
  maxmem: 32 * 1024 * 1024, // 32MB max memory
};

const DERIVED_KEY_LENGTH = 64; // 512-bit key
const SALT_BYTE_LENGTH = 16;   // 128-bit salt

/**
 * Validates password strength according to institutional security standards.
 * Minimum 8 characters; requires at least one letter and one number or special character.
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = [];

  if (!password || typeof password !== "string") {
    return { valid: false, errors: ["Password is required."] };
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters.");
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Password must contain at least one letter.");
  }

  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one number or special symbol.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates an OWASP-compliant scrypt password hash with a cryptographically secure random salt.
 * Never stores or returns plaintext passwords.
 */
export function hashPassword(password: string, existingSalt?: string): PasswordHashResult {
  if (!password) {
    throw new Error("Password cannot be empty.");
  }

  const salt = existingSalt || crypto.randomBytes(SALT_BYTE_LENGTH).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, DERIVED_KEY_LENGTH, SCRYPT_CONFIG);

  return {
    hash: derivedKey.toString("hex"),
    salt,
  };
}

/**
 * Constant-time password verification to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  if (!password || !storedHash || !storedSalt) {
    return false;
  }

  try {
    const { hash } = hashPassword(password, storedSalt);
    const calculatedBuffer = Buffer.from(hash, "hex");
    const storedBuffer = Buffer.from(storedHash, "hex");

    if (calculatedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(calculatedBuffer, storedBuffer);
  } catch {
    return false;
  }
}
