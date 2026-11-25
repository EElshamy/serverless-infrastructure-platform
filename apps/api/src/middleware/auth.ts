import { and, eq, gt } from "drizzle-orm";
import type { Context, MiddlewareHandler } from "hono";
import { db, sessions, users } from "@devops-academy/database";
import type { UserPublic } from "@devops-academy/shared";
import { getSessionTokenFromRequest } from "../lib/auth.ts";
import { hashSessionToken } from "../lib/auth.ts";
import { forbidden, unauthorized } from "../lib/errors.ts";

export interface AuthContextVariables {
  user: UserPublic | null;
  sessionToken: string | null;
}

export function toUserPublic(row: typeof users.$inferSelect): UserPublic {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    bio: row.bio ?? null,
    avatarUrl: row.avatarUrl ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

async function resolveAuthenticatedUser(c: Context): Promise<{ user: UserPublic; token: string } | null> {
  const token = getSessionTokenFromRequest(c);
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const now = new Date();

  const [record] = await db
    .select({
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  if (!record) return null;
  return { user: toUserPublic(record.user), token };
}

export const optionalAuth: MiddlewareHandler = async (c, next) => {
  const resolved = await resolveAuthenticatedUser(c);
  c.set("user", resolved?.user ?? null);
  c.set("sessionToken", resolved?.token ?? null);
  await next();
};

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const resolved = await resolveAuthenticatedUser(c);
  if (!resolved) {
    throw unauthorized("Please sign in to continue");
  }
  c.set("user", resolved.user);
  c.set("sessionToken", resolved.token);
  await next();
};

export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const user = c.get("user") as UserPublic | null | undefined;
  if (!user) {
    throw unauthorized("Please sign in to continue");
  }
  if (user.role !== "admin") {
    throw forbidden("Administrator access is required");
  }
  await next();
};
