import type { Lang, LocalizedText } from "./types";

/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Locale aware number formatting (Bengali digits for bn). */
export function formatNumber(value: number, lang: Lang): string {
  return value.toLocaleString(lang === "bn" ? "bn-BD" : "en-US", {
    maximumFractionDigits: 0,
  });
}

/** BDT price formatting, e.g. ৳১৬৫ / ৳165 */
export function formatPrice(value: number, lang: Lang): string {
  return `৳${formatNumber(value, lang)}`;
}

export function pick<T>(text: LocalizedText | undefined, lang: Lang): T | string {
  if (!text) return "";
  return (text[lang] as T) ?? text.en;
}

export function pickText(text: LocalizedText | undefined, lang: Lang): string {
  if (!text) return "";
  return text[lang] || text.en || "";
}

export function discountPercentage(price: number, comparePrice?: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/* ---------- localStorage helpers (SSR safe) ---------- */

export function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLS(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function removeLS(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const LS_KEYS = {
  language: "orveen-language",
  cart: "orveen-cart",
  wishlist: "orveen-wishlist",
  recent: "orveen-recently-viewed",
  orders: "orveen-orders",
  lastOrder: "orveen-last-order",
  session: "orveen-session",
  addresses: "orveen-addresses",
} as const;

/** Build a wa.me link with a prefilled message. */
export function whatsappLink(message: string): string {
  return `https://wa.me/8801335189426?text=${encodeURIComponent(message)}`;
}

export function orderRef(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `ORV-${stamp}${rand}`;
}
