"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "orveen_admin_theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** The class genuinely goes on `<html>` — see the provider doc comment for why. */
function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * Dark/light mode for the admin dashboard ONLY — but the `dark` class is
 * applied to `<html>`, not some inner wrapper. That's a deliberate
 * second attempt: scoping it to a `#admin-shell` div (this component's
 * first version) broke every Base UI portal-based component (dropdown
 * menus, dialogs, popovers) — Base UI portals mount their content as a
 * sibling of `<body>`, not a descendant of whatever wrapper rendered the
 * trigger, so a class on an inner div never reached them and menus/dialogs
 * stayed light. It also left `color` (an inherited property) resolving
 * from the light-mode `<body>` for anything without its own explicit text
 * color class, which is why icons went invisible.
 *
 * Scoping instead by MOUNT LIFETIME achieves the same "storefront never
 * sees dark mode" goal without breaking portals: this provider only ever
 * mounts inside `app/admin/layout.tsx`, so the class is added when a
 * visitor enters `/admin` and removed the moment this component unmounts
 * (leaving the admin section, in-app-router navigation or otherwise) —
 * see the cleanup in the effect below.
 */
export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Best-effort read only.
    }
    const initial: Theme =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    // One-time sync from localStorage/system preference on mount, after the
    // server-rendered "light" default has already hydrated.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
    applyTheme(initial);

    // Leaving the admin section (this provider unmounting) must never leave
    // `<html>` stuck in dark mode for the storefront.
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Best-effort persistence only.
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAdminTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAdminTheme must be used within an AdminThemeProvider");
  return context;
}
