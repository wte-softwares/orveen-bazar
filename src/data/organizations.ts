import type { LocalizedText } from "@/lib/types";

export type OrgSlug = "orveen" | "reliable" | "ecofast";

/**
 * Brand theme tokens. ORVEEN / RELIABLE palettes are inspired by the supplied
 * billboard references. ECO FAST BD has NO confirmed artwork, so it uses the
 * neutral family palette and a text-only placeholder identity that can be
 * swapped for official assets later without touching component code.
 */
export interface Organization {
  slug: OrgSlug;
  name: string;
  legalName: string;
  tagline: LocalizedText;
  intro: LocalizedText;
  contactText: LocalizedText;
  whatsapp: string;
  email: string;
  website: string;
  address: LocalizedText;
  primary: string;
  deep: string;
  accent: string;
  tint: string;
  /** how the brand mark renders: official asset w/ vector fallback | vector | text placeholder */
  logo: "asset" | "leaf" | "text";
  /** optional public asset path — drop the exact uploaded file here later */
  logoSrc?: string;
}

const L = (bn: string, en: string): LocalizedText => ({ bn, en });

export const organizations: Organization[] = [
  {
    slug: "orveen",
    name: "ORVEEN BAZZAR.COM",
    legalName: "ORVEEN BAZZAR.COM",
    tagline: L("নিত্যপ্রয়োজনীয় পণ্যের নির্ভরযোগ্য ঠিকানা", "Your trusted address for daily essentials"),
    intro: L(
      "ORVEEN BAZZAR.COM একটি বাংলাদেশভিত্তিক অনলাইন ক্যাটালগ প্ল্যাটফর্ম, যেখানে খাদ্যপণ্য, ভোজ্য তেল, পানীয় ও গৃহস্থালি পণ্যের পরিচিতি একসাথে পাওয়া যায়।",
      "ORVEEN BAZZAR.COM is a Bangladesh-based online catalog platform presenting food, edible oil, beverage and household products in one place.",
    ),
    contactText: L(
      "পণ্যের পরিচিতি বা সহযোগিতার জন্য হোয়াটসঅ্যাপ বা ইমেইলে যোগাযোগ করুন।",
      "Contact us on WhatsApp or email for product information or assistance.",
    ),
    whatsapp: "01335189426",
    email: "orveenbazzar@gmail.com",
    website: "www.orveenbazzar.com",
    address: L("আটি বাজার, বসিলা, মোহাম্মদপুর, ঢাকা", "Ati Bazar, Bosila, Mohammadpur, Dhaka"),
    primary: "#075ED1",
    deep: "#0346A5",
    accent: "#53B51B",
    tint: "#EDF9E8",
    logo: "asset",
  },
  {
    slug: "reliable",
    name: "RELIABLE MULTI PRODUCTS",
    legalName: "RELIABLE MULTI PRODUCTS",
    tagline: L(
      "নির্ভরযোগ্য মান • বিশ্বস্ত সেবা • সমৃদ্ধ ভবিষ্যৎ",
      "Reliable Quality • Trusted Service • Prosperous Future",
    ),
    intro: L(
      "RELIABLE MULTI PRODUCTS একটি বাংলাদেশভিত্তিক FMCG ও নিত্যপ্রয়োজনীয় পণ্য বাজারজাতকারী প্রতিষ্ঠান, যা ORVEEN BAZZAR.COM ও ECO FAST BD পরিচালনা করে।",
      "RELIABLE MULTI PRODUCTS is a Bangladesh-based FMCG and daily essentials marketing company operating ORVEEN BAZZAR.COM and ECO FAST BD.",
    ),
    contactText: L(
      "ডিলারশিপ, ডিস্ট্রিবিউশন ও কর্পোরেট সাপ্লাই সংক্রান্ত তথ্যের জন্য যোগাযোগ করুন।",
      "Contact us for dealership, distribution and corporate supply information.",
    ),
    whatsapp: "01335189426",
    email: "orveenbazzar@gmail.com",
    website: "www.orveenbazzar.com",
    address: L("আটি বাজার, বসিলা, মোহাম্মদপুর, ঢাকা", "Ati Bazar, Bosila, Mohammadpur, Dhaka"),
    primary: "#169B37",
    deep: "#08752B",
    accent: "#79D318",
    tint: "#F2FAED",
    logo: "leaf",
  },
  {
    slug: "ecofast",
    name: "ECO FAST BD",
    legalName: "ECO FAST BD",
    tagline: L("পরিচ্ছন্নতায় নির্ভরযোগ্য সহযোগী", "A reliable partner for everyday hygiene"),
    intro: L(
      "ECO FAST BD গৃহস্থালি পরিচ্ছন্নতা পণ্যের ব্র্যান্ড — ডিটারজেন্ট, ডিশওয়াশ লিকুইড, ফ্লোর ক্লিনার ও মশার কয়েল সহ পরিচ্ছন্নতা সমাধান।",
      "ECO FAST BD is a household hygiene brand offering detergent, dishwash liquid, floor cleaner and mosquito coil solutions.",
    ),
    contactText: L(
      "পরিচ্ছন্নতা পণ্যের ক্যাটালগ ও সহযোগিতার জন্য আমাদের সাথে যোগাযোগ করুন।",
      "Reach us for hygiene product catalogs and assistance.",
    ),
    whatsapp: "01335189426",
    email: "orveenbazzar@gmail.com",
    website: "www.orveenbazzar.com",
    address: L("সানারপাড়, সিদ্ধিরগঞ্জ, নারায়ণগঞ্জ", "Sanarpar, Siddhirganj, Narayanganj"),
    /* Neutral family palette until official ECO FAST BD branding is supplied. */
    primary: "#66777D",
    deep: "#37474F",
    accent: "#B0BEC5",
    tint: "#F7F9FA",
    logo: "text",
  },
];

export function orgBySlug(slug: string | undefined): Organization | undefined {
  return organizations.find((o) => o.slug === slug);
}
