/**
 * The storefront ships Bengali-first (matching the client's design and
 * customer base) with English as the secondary option for the language
 * switcher. Only header/footer chrome is translated so far — catalog data,
 * testimonials, and brand copy are still Bengali-only pending a real
 * translation pass (see AGENTS.md scope notes / project memory).
 */
export const LOCALES = ["bn", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "bn";
export const defaultLocale = DEFAULT_LOCALE;

export const LOCALE_LABELS: Record<Locale, { native: string; short: string }> = {
  bn: { native: "বাংলা", short: "BN" },
  en: { native: "English", short: "EN" },
};

export const LOCALE_COOKIE_NAME = "orveen_locale";
export const LOCALE_STORAGE_KEY = "orveen_locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
