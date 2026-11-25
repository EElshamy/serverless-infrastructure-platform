import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiError, ApiSuccess, PaginationMeta } from "@devops-academy/shared";

export function ok<T>(c: Context, data: T, meta?: PaginationMeta, status: ContentfulStatusCode = 200) {
  const payload: ApiSuccess<T> = meta ? { success: true, data, meta } : { success: true, data };
  return c.json(payload, status);
}

export function created<T>(c: Context, data: T) {
  return ok(c, data, undefined, 201);
}

export function fail(
  c: Context,
  status: ContentfulStatusCode,
  code: string,
  message: string,
  details?: unknown,
) {
  const payload: ApiError = {
    success: false,
    error: details === undefined ? { code, message } : { code, message, details },
  };
  return c.json(payload, status);
}
