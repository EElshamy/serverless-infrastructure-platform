import type { MiddlewareHandler } from "hono";
import { env } from "../lib/env.ts";
import { fail } from "../lib/response.ts";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function clearRateLimitBuckets(): void {
  buckets.clear();
}

export function rateLimit(scope: string, maxRequests = env.rateLimitMax, windowMs = env.rateLimitWindowMs): MiddlewareHandler {
  return async (c, next) => {
    const forwarded = c.req.header("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || c.req.header("x-real-ip") || "local";
    const key = `${scope}:${ip}`;
    const now = Date.now();

    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (current.count >= maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      c.header("Retry-After", String(retryAfterSec));
      return fail(c, 429, "RATE_LIMITED", "Too many requests. Please try again shortly.");
    }

    current.count += 1;
    await next();
  };
}
