/**
 * KAAMSETU — Centralized Privacy-Preserving Structured Logger
 * Enforces redaction of sensitive tokens, OTPs, Aadhaar numbers, and private keys.
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogContext {
  requestId?: string;
  userId?: string;
  role?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEYS = new Set([
  "otp",
  "plainotp",
  "token",
  "sessiontoken",
  "secret",
  "hmacsecret",
  "privatekey",
  "password",
  "aadhaar",
  "authorization",
  "cookie",
  "key",
]);

/**
 * Recursively redacts sensitive keys from log payloads
 */
function redact(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => redact(item));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z]/g, "");
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = redact(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export class Logger {
  private defaultContext: LogContext;

  public static sanitize(data: unknown): unknown {
    return redact(data);
  }

  constructor(defaultContext: LogContext = {}) {
    this.defaultContext = defaultContext;
  }

  public withContext(context: LogContext): Logger {
    return new Logger({ ...this.defaultContext, ...context });
  }

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.defaultContext,
      ...(meta ? (redact(meta) as Record<string, unknown>) : {}),
    };

    const serialized = JSON.stringify(entry);

    if (level === "error" || level === "fatal") {
      console.error(serialized);
    } else if (level === "warn") {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      this.write("debug", message, meta);
    }
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.write("info", message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.write("warn", message, meta);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    this.write("error", message, meta);
  }

  public fatal(message: string, meta?: Record<string, unknown>): void {
    this.write("fatal", message, meta);
  }
}

export const logger = new Logger();
export { Logger as StructuredLogger };
