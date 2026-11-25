import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, sessions, users } from "@devops-academy/database";
import type { UserPublic } from "@devops-academy/shared";
import { generateSessionToken, hashSessionToken } from "../lib/auth.ts";
import { env } from "../lib/env.ts";
import { conflict, notFound, unauthorized } from "../lib/errors.ts";
import { toUserPublic } from "../middleware/auth.ts";

export interface AuthSessionResult {
  user: UserPublic;
  token: string;
  expiresAt: Date;
}

async function createSessionForUser(userRow: typeof users.$inferSelect): Promise<AuthSessionResult> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + env.sessionTtlDays * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId: userRow.id,
    tokenHash,
    expiresAt,
  });

  return {
    user: toUserPublic(userRow),
    token,
    expiresAt,
  };
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthSessionResult> {
  const email = input.email.trim().toLowerCase();
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    throw conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const [created] = await db
    .insert(users)
    .values({
      name: input.name.trim(),
      email,
      passwordHash,
      role: "user",
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create user");
  }

  return createSessionForUser(created);
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthSessionResult> {
  const email = input.email.trim().toLowerCase();
  const [userRow] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!userRow) {
    throw unauthorized("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, userRow.passwordHash);
  if (!valid) {
    throw unauthorized("Invalid email or password");
  }

  return createSessionForUser(userRow);
}

export async function logoutSession(token: string | null): Promise<void> {
  if (!token) return;
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function updateOwnProfile(
  userId: string,
  input: { name?: string; bio?: string | null; avatarUrl?: string | null },
): Promise<UserPublic> {
  const [updated] = await db
    .update(users)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) {
    throw notFound("User not found");
  }

  return toUserPublic(updated);
}
