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
import en from "@/locales/en";
import bn from "@/locales/bn";
import { LS_KEYS, readLS, writeLS } from "@/lib/utils";
import type { Lang, LocalizedText } from "@/lib/types";

interface LanguageContextValue {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  toggleLanguage: () => void;
  /** translate a dot-notation key, e.g. t("nav.home") */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** pick the active language from a {bn,en} pair */
  pick: (text: LocalizedText | undefined) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const dictionaries: Record<Lang, Record<string, unknown>> = { en, bn };

function lookup(dict: Record<string, unknown>, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
  return typeof value === "string" ? value : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : match,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Lang>("bn");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readLS<Lang | null>(LS_KEYS.language, null);
    const initial: Lang = stored === "en" || stored === "bn" ? stored : "bn";
    setLanguageState(initial);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = language;
    writeLS(LS_KEYS.language, language);
  }, [language, hydrated]);

  const setLanguage = useCallback((lang: Lang) => setLanguageState(lang), []);
  const toggleLanguage = useCallback(
    () => setLanguageState((prev) => (prev === "bn" ? "en" : "bn")),
    [],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const template =
        lookup(dictionaries[language], key) ?? lookup(dictionaries.en, key) ?? key;
      return interpolate(template, vars);
    },
    [language],
  );

  const pick = useCallback(
    (text: LocalizedText | undefined) => {
      if (!text) return "";
      return text[language] || text.en || "";
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t, pick }),
    [language, setLanguage, toggleLanguage, t, pick],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}

/** Keeps document.title in sync with the active language (client-rendered pages). */
export function usePageTitle(bnTitle: string, enTitle: string): void {
  const { language } = useLanguage();
  useEffect(() => {
    document.title = language === "bn" ? bnTitle : enTitle;
  }, [language, bnTitle, enTitle]);
}
