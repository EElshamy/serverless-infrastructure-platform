import { apiRequest } from "@/lib/api";
import type { UserPublic } from "@/types";

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserPublic> {
  const { data } = await apiRequest<{ user: UserPublic }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.user;
}

export async function loginAccount(input: { email: string; password: string }): Promise<UserPublic> {
  const { data } = await apiRequest<{ user: UserPublic }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.user;
}

export async function logoutAccount(): Promise<void> {
  await apiRequest<{ loggedOut: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function fetchCurrentUser(): Promise<UserPublic | null> {
  try {
    const { data } = await apiRequest<{ user: UserPublic }>("/api/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export async function updateProfile(input: {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}): Promise<UserPublic> {
  const { data } = await apiRequest<{ user: UserPublic }>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.user;
}
