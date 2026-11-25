import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import { AppError } from "../lib/errors.ts";
import { fail } from "../lib/response.ts";

interface PgLikeError {
  code?: string;
  detail?: string;
  constraint?: string;
}

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return fail(c, err.status as ContentfulStatusCode, err.code, err.message, err.details);
  }

  if (err instanceof ZodError) {
    return fail(c, 400, "VALIDATION_ERROR", "Invalid request payload", err.flatten());
  }

  const pgErr = err as PgLikeError;
  if (pgErr?.code === "23505") {
    return fail(c, 409, "CONFLICT", "A record with this unique value already exists");
  }
  if (pgErr?.code === "23503") {
    return fail(c, 400, "INVALID_REFERENCE", "Referenced resource does not exist");
  }
  if (pgErr?.code === "22P02") {
    return fail(c, 400, "INVALID_IDENTIFIER", "Invalid identifier format");
  }

  console.error("Unhandled API error:", err);
  return fail(c, 500, "INTERNAL_ERROR", "An unexpected error occurred");
};
