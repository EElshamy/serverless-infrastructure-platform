import type { Context } from "hono";
import { z } from "zod";
import { badRequest } from "../lib/errors.ts";

export * from "@devops-academy/shared/validators";

export async function parseJsonBody<T extends z.ZodTypeAny>(c: Context, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw badRequest("Request body must be valid JSON");
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw badRequest("Validation failed", parsed.error.flatten());
  }
  return parsed.data;
}

export function parseQueryParams<T extends z.ZodTypeAny>(c: Context, schema: T): z.infer<T> {
  const query = c.req.query();
  const parsed = schema.safeParse(query);
  if (!parsed.success) {
    throw badRequest("Invalid query parameters", parsed.error.flatten());
  }
  return parsed.data;
}

export const uuidParamSchema = z.string().uuid("Invalid UUID");

export function assertUuid(value: string | undefined, label = "ID"): string {
  const parsed = uuidParamSchema.safeParse(value);
  if (!parsed.success) {
    throw badRequest(`Invalid ${label}`);
  }
  return parsed.data;
}

export function assertSlug(value: string | undefined, label = "slug"): string {
  if (!value || !value.trim()) {
    throw badRequest(`Invalid ${label}`);
  }
  return value.trim();
}
