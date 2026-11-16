/**
 * KAAMSETU — Standardized API Response & Error Handling Utilities
 * Provides consistent response envelopes, correlation IDs, and fail-closed error mapping.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import crypto from "node:crypto";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  DatabaseError,
  ConfigurationError,
} from "./app-error";

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
  timestamp: string;
}

export type ApiResponse<T = unknown> =
  | {
      success: true;
      data: T;
      meta?: {
        page?: number;
        pageSize?: number;
        total?: number;
        requestId?: string;
        timestamp: string;
        [key: string]: unknown;
      };
      metadata?: {
        page?: number;
        pageSize?: number;
        total?: number;
        requestId?: string;
        timestamp: string;
        [key: string]: unknown;
      };
    }
  | {
      success: false;
      error: ApiErrorPayload;
    };

/**
 * Creates a standard JSON success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200,
  requestId?: string
): NextResponse<ApiResponse<T>> {
  const timestamp = new Date().toISOString();
  const resolvedRequestId =
    requestId || `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const metaObj = {
    ...meta,
    requestId: resolvedRequestId,
    timestamp,
  };

  return NextResponse.json(
    {
      success: true,
      data,
      meta: metaObj,
      metadata: metaObj,
    },
    { status }
  );
}

/**
 * Creates a standard JSON error response from an AppError or unknown error
 */
export function handleApiError(
  error: unknown,
  req?: Request | { headers?: Headers }
): NextResponse<ApiResponse<never>> {
  const timestamp = new Date().toISOString();
  const rawId = req && "headers" in req && req.headers?.get("x-request-id");
  const requestId =
    rawId || `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  // 1. Zod Validation Errors (HTTP 400)
  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed. Please review submitted fields.",
          details: formattedErrors,
          requestId,
          timestamp,
        },
      },
      { status: 400 }
    );
  }

  // 2. Custom AppError instances (Typed HTTP Status Codes)
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId,
          timestamp,
        },
      },
      { status: error.statusCode }
    );
  }

  // 3. Duck-typed AuthError or errors with statusCode
  if (error instanceof Error && ("statusCode" in error || error.name === "AuthError")) {
    const statusCode = (error as unknown as { statusCode: number }).statusCode || 401;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: statusCode === 403 ? "FORBIDDEN" : "UNAUTHENTICATED",
          message: error.message,
          requestId,
          timestamp,
        },
      },
      { status: statusCode }
    );
  }

  // 4. Fallback Generic Error (Fail-Closed, HTTP 500)
  const isProduction = process.env.NODE_ENV === "production";
  const message = isProduction
    ? "An internal server error occurred. Please try again later."
    : error instanceof Error
    ? error.message
    : "Unknown internal error";

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message,
        requestId,
        timestamp,
      },
    },
    { status: 500 }
  );
}
