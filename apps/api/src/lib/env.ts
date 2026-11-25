import { fileURLToPath } from "node:url";
import { config } from "dotenv";

config({ path: fileURLToPath(new URL("../../../../.env", import.meta.url)) });

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function parseNumber(value: string | undefined, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

const sameSiteRaw = (process.env.COOKIE_SAME_SITE ?? "lax").toLowerCase();
const cookieSameSite: "lax" | "strict" | "none" =
  sameSiteRaw === "strict" || sameSiteRaw === "none" ? sameSiteRaw : "lax";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  apiPort: parseNumber(process.env.API_PORT, 4000),
  webUrl: process.env.WEB_URL ?? "http://localhost:3000",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  sessionSecret: process.env.SESSION_SECRET ?? "dev-only-insecure-session-secret-change-me",
  cookieName: process.env.COOKIE_NAME ?? "devops_academy_session",
  cookieDomain: process.env.COOKIE_DOMAIN ?? "localhost",
  cookieSecure: parseBoolean(process.env.COOKIE_SECURE, false),
  cookieSameSite,
  sessionTtlDays: parseNumber(process.env.SESSION_TTL_DAYS, 7),
  rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: parseNumber(process.env.RATE_LIMIT_MAX, 10),
};
