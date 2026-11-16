/**
 * KAAMSETU — Centralized Typed Application Errors
 * Standardized error hierarchy for domain, authorization, database, and configuration failures.
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required. Please sign in.") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to access this resource.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' was not found.`
      : `${resource} not found.`;
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "The requested operation conflicts with current resource state.", details?: unknown) {
    super(message, 409, "CONFLICT", details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please wait before retrying.", details?: unknown) {
    super(message, 429, "RATE_LIMIT_EXCEEDED", details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: "Supabase" | "Gemini" | "DigiLocker" | "PaymentGateway" | "SmsGateway", originalError?: unknown) {
    super(
      `External service error occurred while communicating with ${service}.`,
      502,
      `${service.toUpperCase()}_GATEWAY_ERROR`,
      originalError
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message = "A database operation failed.", details?: unknown) {
    super(message, 500, "DATABASE_ERROR", details);
  }
}

export class ConfigurationError extends AppError {
  constructor(message = "A critical system configuration error occurred.", details?: unknown) {
    super(message, 500, "CONFIGURATION_ERROR", details);
  }
}
