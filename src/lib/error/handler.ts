import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "./app-error";
import { ApiResponse } from "@/types/api";

export {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
};

export function handleApiError(error: unknown): NextResponse<ApiResponse<never>> {
  const timestamp = new Date().toISOString();

  // 1. Zod Validation Error
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
          message: "Request validation failed. Please check the submitted fields.",
          details: formattedErrors,
          timestamp,
        },
      },
      { status: 400 }
    );
  }

  // 2. Custom AppError or AuthError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp,
        },
      },
      { status: error.statusCode }
    );
  }

  // 2b. AuthError / duck-typed errors with statusCode
  if (error instanceof Error && ("statusCode" in error || error.name === "AuthError")) {
    const statusCode = (error as any).statusCode || 401;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: statusCode === 403 ? "FORBIDDEN" : "UNAUTHENTICATED",
          message: error.message,
          timestamp,
        },
      },
      { status: statusCode }
    );
  }

  // 3. Fallback generic error
  console.error("Unhandled API Error:", error);
  const isDev = process.env.NODE_ENV === "development";

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          isDev && error instanceof Error
            ? error.message
            : "An unexpected error occurred while processing your request.",
        timestamp,
      },
    },
    { status: 500 }
  );
}

export function createSuccessResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}
