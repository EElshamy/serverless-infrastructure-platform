import crypto from "node:crypto";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { env } from "./env.ts";

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return crypto.createHmac("sha256", env.sessionSecret).update(token).digest("hex");
}

export function getSessionTokenFromRequest(c: Context): string | null {
  const cookieToken = getCookie(c, env.cookieName);
  if (cookieToken) return cookieToken;

  const authHeader = c.req.header("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }

  return null;
}

function cookieDomainOption(): string | undefined {
  if (!env.cookieDomain || env.cookieDomain === "localhost") {
    return undefined;
  }
  return env.cookieDomain;
}

export function setSessionCookie(c: Context, token: string, expiresAt: Date): void {
  setCookie(c, env.cookieName, token, {
    path: "/",
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite === "none" ? "None" : env.cookieSameSite === "strict" ? "Strict" : "Lax",
    expires: expiresAt,
    domain: cookieDomainOption(),
  });
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, env.cookieName, {
    path: "/",
    domain: cookieDomainOption(),
  });
}
