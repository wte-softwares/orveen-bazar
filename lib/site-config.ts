import type { Locale } from "@/lib/i18n/config";

/** Any static copy that needs both storefront languages — see lib/i18n/. */
export type LocalizedText = Record<Locale, string>;

export function pickLocalized(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

/**
 * Public brand identity is deliberately application configuration, not
 * tenant-managed content. These are three fixed sibling brands, so keeping
 * their logos and contact details in the repository prevents an admin edit
 * from silently changing the storefront's core identity. `description` and
 * `cardDescription` carry both languages so the homepage can switch without
 * a database round-trip.
 */
export const BRANDS = [
  {
    slug: "orveen-bazar",
    name: "ORVEEN BAZAR.COM",
    description: {
      bn: "দৈনন্দিন জীবনের নিত্যপ্রয়োজনীয় পণ্য — তেল, চাল, ডাল, মসলা এবং সংসারের প্রয়োজনীয় জিনিসপত্র।",
      en: "Everyday FMCG staples — oil, rice, lentils, spices, and household essentials.",
    },
    logoSrc: "/logo/orveen logo.png",
    cardBackgroundSrc: "/brand-backgrounds/orveen-card.png",
    cardDescription: {
      bn: "দৈনন্দিন জীবনের সব প্রয়োজনীয় পণ্য এক জায়গায় — সহজে, আপনার হাতের কাছে।",
      en: "Everything you need for daily life, in one place — simple and within reach.",
    },
    cardAccent: "#0067bf",
  },
  {
    slug: "eco-fast-bd",
    name: "ECO FAST BD",
    description: {
      bn: "পরিবেশবান্ধব পরিষ্কারক ও সাংসারিক পণ্য।",
      en: "Eco-friendly cleaning and household products.",
    },
    logoSrc: "/logo/ecofast logo.png",
    cardBackgroundSrc: "/brand-backgrounds/ecofast-card.png",
    cardDescription: {
      bn: "প্রকৃতির ছোঁয়া, স্বাস্থ্যকর এবং পরিবেশবান্ধব পণ্যের সম্ভার।",
      en: "A touch of nature — a healthy, eco-friendly range of products.",
    },
    cardAccent: "#078d99",
  },
  {
    slug: "reliable-multi-products",
    name: "RELIABLE MULTI PRODUCTS",
    description: {
      bn: "সাধারণ ব্যবসা ও বহু-বিভাগীয় ভোক্তা পণ্য।",
      en: "General trading and multi-category consumer goods.",
    },
    logoSrc: "/logo/reliable logo.png",
    cardBackgroundSrc: "/brand-backgrounds/reliable-card.png",
    cardDescription: {
      bn: "পরিবারের জন্য নির্ভরযোগ্য নিত্যপ্রয়োজনীয় পণ্য, মানে নিশ্চিন্ত পছন্দ।",
      en: "Reliable everyday essentials for your family — a choice you can trust.",
    },
    cardAccent: "#13833d",
  },
] as const;

/** The horizontal lockup is reserved for the shared storefront chrome. */
export const PRIMARY_BRAND_LOGO_SRC = "/logo/orveen logo horizontal.png";

export type OrganizationSlug = (typeof BRANDS)[number]["slug"];
export type BrandConfig = (typeof BRANDS)[number];

export const ORGANIZATION_SLUGS = BRANDS.map((brand) => brand.slug) as OrganizationSlug[];

export function getBrandConfig(slug: string): BrandConfig | undefined {
  return BRANDS.find((brand) => brand.slug === slug);
}

export const SITE_CONFIG = {
  contact: {
    address: "#954, Usha Tara Kunja (4th Floor), C & B Road, Barishal",
    phone: "01335189426",
    whatsappHref: "https://wa.me/8801335189426",
    email: "info@orveenbazzar.com",
  },
  socialLinks: [
    { label: "WhatsApp", href: "https://wa.me/8801335189426" },
    { label: "Email", href: "mailto:orveenbazzar@gmail.com" },
    { label: "Website", href: "http://www.orveenbazzar.com" },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61594505662829" },
  ],
} as const;
