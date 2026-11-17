/**
 * KAAMSETU — Typed Authentication Error Contract
 * Standardized error codes, status mappings, and user-facing actionable messages.
 */

export type AuthErrorCode =
  | "INVALID_PHONE"
  | "RATE_LIMITED"
  | "ACTIVE_CHALLENGE_EXISTS"
  | "OTP_EXPIRED"
  | "OTP_INVALID"
  | "OTP_ATTEMPTS_EXCEEDED"
  | "AUTH_CONFIGURATION_ERROR"
  | "DATABASE_UNAVAILABLE"
  | "OTP_CHALLENGE_CREATION_FAILED"
  | "INTERNAL_SERVER_ERROR";

export interface AuthErrorDescriptor {
  code: AuthErrorCode;
  statusCode: number;
  message: string;
  userMessage: string;
}

export const AUTH_ERRORS: Record<AuthErrorCode, AuthErrorDescriptor> = {
  INVALID_PHONE: {
    code: "INVALID_PHONE",
    statusCode: 400,
    message: "Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8 or 9.",
    userMessage: "Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8 or 9.",
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    statusCode: 429,
    message: "Rate limit reached. Please wait before requesting another code.",
    userMessage: "You can request another code in {seconds} seconds.",
  },
  ACTIVE_CHALLENGE_EXISTS: {
    code: "ACTIVE_CHALLENGE_EXISTS",
    statusCode: 429,
    message: "You have an active verification code waiting.",
    userMessage: "You have an active verification code. You can enter it now or wait {seconds}s to resend.",
  },
  OTP_EXPIRED: {
    code: "OTP_EXPIRED",
    statusCode: 400,
    message: "Verification code has expired. Please request a new code.",
    userMessage: "Verification code has expired. Please request a new code.",
  },
  OTP_INVALID: {
    code: "OTP_INVALID",
    statusCode: 400,
    message: "Invalid verification code. Please check the code and try again.",
    userMessage: "Invalid verification code. Please check the code and try again.",
  },
  OTP_ATTEMPTS_EXCEEDED: {
    code: "OTP_ATTEMPTS_EXCEEDED",
    statusCode: 429,
    message: "Maximum verification attempts exceeded. Please request a new code.",
    userMessage: "Maximum verification attempts exceeded. Please request a new code.",
  },
  AUTH_CONFIGURATION_ERROR: {
    code: "AUTH_CONFIGURATION_ERROR",
    statusCode: 500,
    message: "Authentication service configuration issue.",
    userMessage: "Verification service is momentarily unavailable. Please retry shortly.",
  },
  DATABASE_UNAVAILABLE: {
    code: "DATABASE_UNAVAILABLE",
    statusCode: 503,
    message: "Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment.",
    userMessage: "Authentication rate limiter temporarily unavailable. Your profile draft has been saved. Please retry in a moment.",
  },
  OTP_CHALLENGE_CREATION_FAILED: {
    code: "OTP_CHALLENGE_CREATION_FAILED",
    statusCode: 500,
    message: "Failed to create verification challenge.",
    userMessage: "Unable to send verification code. Please try again shortly.",
  },
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    statusCode: 500,
    message: "Internal server error occurred.",
    userMessage: "We're temporarily unable to process this request. Please try again shortly.",
  },
};

export const AUTH_ERROR_CODES = {
  INVALID_PHONE: "INVALID_PHONE",
  RATE_LIMITED: "RATE_LIMITED",
  ACTIVE_CHALLENGE_EXISTS: "ACTIVE_CHALLENGE_EXISTS",
  OTP_EXPIRED: "OTP_EXPIRED",
  OTP_INVALID: "OTP_INVALID",
  OTP_ATTEMPTS_EXCEEDED: "OTP_ATTEMPTS_EXCEEDED",
  AUTH_CONFIGURATION_ERROR: "AUTH_CONFIGURATION_ERROR",
  DATABASE_UNAVAILABLE: "DATABASE_UNAVAILABLE",
  OTP_CHALLENGE_CREATION_FAILED: "OTP_CHALLENGE_CREATION_FAILED",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_PHONE: AUTH_ERRORS.INVALID_PHONE.userMessage,
  RATE_LIMITED: AUTH_ERRORS.RATE_LIMITED.userMessage,
  ACTIVE_CHALLENGE_EXISTS: AUTH_ERRORS.ACTIVE_CHALLENGE_EXISTS.userMessage,
  OTP_EXPIRED: AUTH_ERRORS.OTP_EXPIRED.userMessage,
  OTP_INVALID: AUTH_ERRORS.OTP_INVALID.userMessage,
  OTP_ATTEMPTS_EXCEEDED: AUTH_ERRORS.OTP_ATTEMPTS_EXCEEDED.userMessage,
  AUTH_CONFIGURATION_ERROR: AUTH_ERRORS.AUTH_CONFIGURATION_ERROR.userMessage,
  DATABASE_UNAVAILABLE: AUTH_ERRORS.DATABASE_UNAVAILABLE.userMessage,
  OTP_CHALLENGE_CREATION_FAILED: AUTH_ERRORS.OTP_CHALLENGE_CREATION_FAILED.userMessage,
  INTERNAL_SERVER_ERROR: AUTH_ERRORS.INTERNAL_SERVER_ERROR.userMessage,
};

export function getAuthErrorMessage(
  code: AuthErrorCode,
  interpolations?: Record<string, string | number>
): string {
  let msg = AUTH_ERRORS[code]?.userMessage || AUTH_ERRORS.INTERNAL_SERVER_ERROR.userMessage;
  if (interpolations) {
    for (const [k, v] of Object.entries(interpolations)) {
      msg = msg.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return msg;
}
