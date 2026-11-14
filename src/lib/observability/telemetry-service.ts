import { createAdminClient } from "@/lib/supabase/admin";
import { isConfigured } from "@/lib/env";

export interface LogEventInput {
  correlationId?: string;
  component: string;
  action: string;
  level?: "info" | "warn" | "error" | "critical";
  metadata?: Record<string, any>;
}

/**
 * Redacts PII, credentials, OTPs, and keys from log payloads
 */
export function sanitizeLogMetadata(metadata: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, val] of Object.entries(metadata)) {
    const keyLower = key.toLowerCase();

    // Check for secret keys, OTPs, passwords
    if (
      keyLower.includes("secret") ||
      keyLower.includes("password") ||
      keyLower.includes("token") ||
      keyLower.includes("api_key") ||
      keyLower.includes("otp") ||
      keyLower.includes("signing_key")
    ) {
      sanitized[key] = "[REDACTED_SECRET]";
      continue;
    }

    // Check for Aadhaar
    if (keyLower.includes("aadhaar") || keyLower.includes("uid")) {
      if (typeof val === "string" && val.replace(/\D/g, "").length >= 12) {
        const digits = val.replace(/\D/g, "");
        sanitized[key] = `XXXX-XXXX-${digits.slice(-4)}`;
      } else {
        sanitized[key] = "[REDACTED_AADHAAR]";
      }
      continue;
    }

    // Check for Phone numbers
    if (keyLower.includes("phone") || keyLower.includes("mobile")) {
      if (typeof val === "string" && val.length >= 10) {
        sanitized[key] = `+91-XXXXXX-${val.slice(-4)}`;
      } else {
        sanitized[key] = "[REDACTED_PHONE]";
      }
      continue;
    }

    // Recursively sanitize nested objects
    if (val && typeof val === "object" && !Array.isArray(val)) {
      sanitized[key] = sanitizeLogMetadata(val);
      continue;
    }

    sanitized[key] = val;
  }

  return sanitized;
}

/**
 * Emits a structured telemetry log with correlation tracking
 */
export function emitStructuredLog(input: LogEventInput) {
  const correlationId = input.correlationId || crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const sanitizedMeta = input.metadata ? sanitizeLogMetadata(input.metadata) : {};

  const structuredPayload = {
    timestamp,
    correlationId,
    component: input.component,
    action: input.action,
    level: input.level || "info",
    metadata: sanitizedMeta,
  };

  // Structured stdout for log collectors
  if (input.level === "error" || input.level === "critical") {
    console.error(JSON.stringify(structuredPayload));
  } else {
    console.log(JSON.stringify(structuredPayload));
  }

  return structuredPayload;
}

/**
 * Records regional service telemetry with explicit simulation demarcation
 */
export async function recordRegionalTelemetry(options: {
  regionId: string;
  metricName: string;
  metricValue: number;
  dimensionTags?: Record<string, any>;
  isSimulated?: boolean;
}) {
  if (!isConfigured.supabase) {
    return {
      id: crypto.randomUUID(),
      region_id: options.regionId,
      metric_name: options.metricName,
      metric_value: options.metricValue,
      dimension_tags: options.dimensionTags || {},
      is_simulated: Boolean(options.isSimulated),
      measured_at: new Date().toISOString(),
    };
  }

  const supabase = createAdminClient();
  if (!supabase) throw new Error("Database client unavailable");

  const { data, error } = await supabase
    .from("regional_service_telemetry")
    .insert({
      region_id: options.regionId,
      metric_name: options.metricName,
      metric_value: options.metricValue,
      dimension_tags: (options.dimensionTags || {}) as any,
      is_simulated: Boolean(options.isSimulated),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record service telemetry: ${error.message}`);
  }

  return data;
}
