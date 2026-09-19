"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { translate, type TranslationKey, type TranslationNamespace } from "@/lib/i18n/translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Locale is a client-only preference (no `/[locale]` routing exists), so it
 * starts at the Bengali default on every server render and syncs to
 * whatever the visitor picked last on mount — a one-frame flash to their
 * saved language, not a hydration mismatch, since the server-rendered
 * markup is never conditioned on it.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      // localStorage can throw in a locked-down browser context — default stands.
    }
    // One-time sync from an external store (localStorage) on mount, after
    // the server-rendered default has already hydrated — not a derived
    // value recomputed on every render, so this is the legitimate case an
    // effect exists for.
    if (isLocale(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Best-effort persistence only.
    }
    // A cookie (not just localStorage) lets a future Server Component read
    // the preference for SSR-rendered copy without waiting on hydration.
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within a LocaleProvider");
  return context;
}

/** Scoped translator for one namespace, e.g. `const t = useTranslations("header")`. */
export function useTranslations<N extends TranslationNamespace>(namespace: N) {
  const { locale } = useLocale();
  return useCallback((key: TranslationKey<N>) => translate(namespace, key, locale), [namespace, locale]);
}
