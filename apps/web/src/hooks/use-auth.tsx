"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  fetchCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
} from "@/services/auth.service";
import type { UserPublic } from "@/types";

interface AuthContextValue {
  user: UserPublic | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserPublic>;
  register: (name: string, email: string, password: string) => Promise<UserPublic>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: UserPublic | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const current = await fetchCurrentUser();
    setUser(current);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void fetchCurrentUser()
      .then((current) => {
        if (active) setUser(current);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = await loginAccount({ email, password });
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const created = await registerAccount({ name, email, password });
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    await logoutAccount();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
