import type { LocalizedText } from "@/lib/types";
import type { OrgSlug } from "./organizations";

export interface Banner {
  id: string;
  orgSlug: OrgSlug;
  title: LocalizedText;
  subtitle: LocalizedText;
  alt: LocalizedText;
  targetUrl: string;
  sortOrder: number;
  active: boolean;
  /** visual style key used by the Banner component */
  style: "blue" | "green" | "navy" | "yellow";
  image?: string;
}

const L = (bn: string, en: string): LocalizedText => ({ bn, en });

export const banners: Banner[] = [
  {
    id: "ban-01",
    orgSlug: "orveen",
    title: L("নিত্যপ্রয়োজনীয় পণ্যের সম্পূর্ণ ক্যাটালগ", "The complete essentials catalog"),
    subtitle: L("তেল, চাল, ডাল ও পানীয় — এক প্ল্যাটফর্মে", "Oil, rice, lentils and beverages — one platform"),
    alt: L("ORVEEN BAZZAR ক্যাটালগ ব্যানার", "ORVEEN BAZZAR catalog banner"),
    targetUrl: "/catalog?brand=orveen",
    sortOrder: 1,
    active: true,
    style: "blue",
    image: "/images/hero-staples.svg",
  },
  {
    id: "ban-02",
    orgSlug: "ecofast",
    title: L("পরিচ্ছন্নতার সম্পূর্ণ সমাধান", "Complete cleanliness solutions"),
    subtitle: L("ডিটারজেন্ট থেকে ফ্লোর ক্লিনার পর্যন্ত", "From detergent to floor cleaner"),
    alt: L("ECO FAST BD পরিচ্ছন্নতা ব্যানার", "ECO FAST BD hygiene banner"),
    targetUrl: "/catalog?brand=ecofast",
    sortOrder: 2,
    active: true,
    style: "green",
  },
  {
    id: "ban-03",
    orgSlug: "reliable",
    title: L("ব্যবসায়িক অংশীদার হোন", "Become a business partner"),
    subtitle: L("ডিলার, ডিস্ট্রিবিউটর ও কর্পোরেট সাপ্লাই", "Dealer, distributor and corporate supply"),
    alt: L("RELIABLE MULTI PRODUCTS পার্টনারশিপ ব্যানার", "RELIABLE MULTI PRODUCTS partnership banner"),
    targetUrl: "/brands/reliable",
    sortOrder: 3,
    active: true,
    style: "navy",
    image: "/images/warehouse.jpg",
  },
  {
    id: "ban-04",
    orgSlug: "orveen",
    title: L("তিনটি ব্র্যান্ড, একটি বিশ্বস্ত প্ল্যাটফর্ম", "Three brands, one trusted platform"),
    subtitle: L("ORVEEN • ECO FAST • RELIABLE", "ORVEEN • ECO FAST • RELIABLE"),
    alt: L("প্ল্যাটফর্ম ব্র্যান্ড ব্যানার", "Platform brands banner"),
    targetUrl: "/brands",
    sortOrder: 4,
    active: true,
    style: "yellow",
  },
  {
    id: "ban-05",
    orgSlug: "ecofast",
    title: L("ঘরের যত্নে ECO FAST", "ECO FAST for home care"),
    subtitle: L("হোম হাইজিন পণ্যের পরিচিতি", "Introduction to home hygiene products"),
    alt: L("ECO FAST হোম কেয়ার ব্যানার", "ECO FAST home care banner"),
    targetUrl: "/catalog?brand=ecofast&category=home-hygiene",
    sortOrder: 5,
    active: true,
    style: "green",
    image: "/images/dealer-shop.jpg",
  },
  {
    id: "ban-06",
    orgSlug: "reliable",
    title: L("দেশব্যাপী সম্প্রসারণ পরিকল্পনা", "Nationwide expansion plan"),
    subtitle: L("ধাপে ধাপে ৬৪ জেলায় নেটওয়ার্ক", "A phased network across 64 districts"),
    alt: L("RELIABLE সম্প্রসারণ ব্যানার", "RELIABLE expansion banner"),
    targetUrl: "/about",
    sortOrder: 6,
    active: false,
    style: "navy",
  },
];

export function bannersByOrg(orgSlug: string, activeOnly = true): Banner[] {
  return banners
    .filter((b) => b.orgSlug === orgSlug && (!activeOnly || b.active))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function activeBanners(): Banner[] {
  return banners.filter((b) => b.active).sort((a, b) => a.sortOrder - b.sortOrder);
}
