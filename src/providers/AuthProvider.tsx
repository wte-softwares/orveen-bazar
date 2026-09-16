"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { readLS, writeLS, removeLS } from "@/lib/utils";
import { demoAccounts, mockUsers, type AdminUser, type UserRole } from "@/data/users";
import type { OrgSlug } from "@/data/organizations";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgs: OrgSlug[] | "all";
}

interface RegisteredUser {
  name: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; user?: SessionUser }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateName: (name: string) => void;
  resetPassword: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/*
 * FRONTEND-ONLY demo session storage.
 * Production integration point: replace login/register/logout below with a
 * real AuthService (see src/lib/repositories.ts) backed by database auth.
 */
const SESSION_KEY = "orveen-demo-session";
const USERS_KEY = "orveen-demo-users";
const ADMIN_DATA_KEY = "orveen-demo-admin-data";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function sessionFor(email: string, registered: RegisteredUser[]): SessionUser | null {
  const demo = demoAccounts.find((d) => d.email === email);
  if (demo) {
    const storedAdminData = readLS<{ users?: AdminUser[] } | null>(ADMIN_DATA_KEY, null);
    const mock = storedAdminData?.users?.find((u) => u.email === demo.email) ?? mockUsers.find((u) => u.email === demo.email);
    if (!mock || mock.status !== "active") return null;
    return {
      id: mock.id,
      name: mock.name,
      email: demo.email,
      role: mock.role,
      orgs: mock.orgs,
    };
  }
  const reg = registered.find((r) => r.email === email);
  if (reg) {
    return { id: `reg-${reg.email}`, name: reg.name, email: reg.email, role: "customer", orgs: [] };
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readLS<SessionUser | null>(SESSION_KEY, null);
    if (stored && stored.email && stored.role) {
      const registered = readLS<RegisteredUser[]>(USERS_KEY, []);
      setUser(sessionFor(stored.email, registered));
    }
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await wait(600);
    const normalized = email.trim().toLowerCase();
    const demo = demoAccounts.find((d) => d.email === normalized);
    const registered = readLS<RegisteredUser[]>(USERS_KEY, []);
    const reg = registered.find((r) => r.email.toLowerCase() === normalized);
    const expected = reg?.password ?? demo?.password;
    if (!expected || expected !== password) {
      return { ok: false, error: "invalid" };
    }
    const session = sessionFor(normalized, registered);
    if (!session) return { ok: false, error: "invalid" };
    setUser(session);
    writeLS(SESSION_KEY, session);
    return { ok: true, user: session };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await wait(700);
    const normalized = email.trim().toLowerCase();
    const registered = readLS<RegisteredUser[]>(USERS_KEY, []);
    if (
      demoAccounts.some((account) => account.email === normalized) ||
      registered.some((r) => r.email.toLowerCase() === normalized)
    ) {
      return { ok: false, error: "exists" };
    }
    const next = [...registered, { name: name.trim(), email: normalized, password }];
    writeLS(USERS_KEY, next);
    const session: SessionUser = {
      id: `reg-${normalized}`,
      name: name.trim(),
      email: normalized,
      role: "customer",
      orgs: [],
    };
    setUser(session);
    writeLS(SESSION_KEY, session);
    return { ok: true };
  }, []);

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    await wait(600);
    const normalized = email.trim().toLowerCase();
    const demo = demoAccounts.find((d) => d.email === normalized);
    const registered = readLS<RegisteredUser[]>(USERS_KEY, []);
    const regIndex = registered.findIndex((r) => r.email.toLowerCase() === normalized);

    if (regIndex !== -1) {
      const next = [...registered];
      next[regIndex] = { ...next[regIndex], password: newPassword };
      writeLS(USERS_KEY, next);
      return { ok: true };
    } else if (demo) {
      const mockUser = mockUsers.find((u) => u.email === normalized);
      const name = mockUser?.name ?? demo.email.split("@")[0];
      const next = [...registered, { name, email: demo.email, password: newPassword }];
      writeLS(USERS_KEY, next);
      return { ok: true };
    }
    return { ok: false, error: "notFound" };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeLS(SESSION_KEY);
  }, []);

  const updateName = useCallback((name: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, name };
      writeLS(SESSION_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout, updateName, resetPassword }),
    [user, ready, login, register, logout, updateName, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
