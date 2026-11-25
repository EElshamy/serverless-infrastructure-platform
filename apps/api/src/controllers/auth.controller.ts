import type { Context } from "hono";
import type { UserPublic } from "@devops-academy/shared";
import { loginSchema, registerSchema, userUpdateSchema } from "@devops-academy/shared/validators";
import { clearSessionCookie, setSessionCookie } from "../lib/auth.ts";
import { created, ok } from "../lib/response.ts";
import { loginUser, logoutSession, registerUser, updateOwnProfile } from "../services/auth.service.ts";
import { parseJsonBody } from "../validators/index.ts";

export async function registerHandler(c: Context) {
  const body = await parseJsonBody(c, registerSchema);
  const result = await registerUser(body);
  setSessionCookie(c, result.token, result.expiresAt);
  return created(c, { user: result.user });
}

export async function loginHandler(c: Context) {
  const body = await parseJsonBody(c, loginSchema);
  const result = await loginUser(body);
  setSessionCookie(c, result.token, result.expiresAt);
  return ok(c, { user: result.user });
}

export async function logoutHandler(c: Context) {
  const token = (c.get("sessionToken") as string | null | undefined) ?? null;
  await logoutSession(token);
  clearSessionCookie(c);
  return ok(c, { loggedOut: true });
}

export async function meHandler(c: Context) {
  const user = c.get("user") as UserPublic;
  return ok(c, { user });
}

export async function updateMeHandler(c: Context) {
  const user = c.get("user") as UserPublic;
  const body = await parseJsonBody(c, userUpdateSchema.omit({ role: true }));
  const updated = await updateOwnProfile(user.id, body);
  return ok(c, { user: updated });
}
