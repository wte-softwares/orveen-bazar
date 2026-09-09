"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Store,
  Tag,
  Truck,
  Mail,
} from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useToast } from "@/providers/StoreProvider";
import { marketingImages } from "@/lib/images";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { trustItems, whyItems } from "@/data/content";
import { company } from "@/data/company";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading, Badge, TextInput } from "@/components/ui/core";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  tag: Tag,
  truck: Truck,
  headphones: Headphones,
  handshake: Store,
  users: Building2,
  heart: CheckCircle2,
  map: Truck,
};

/* ---------------------------------- Hero ---------------------------------- */

export function HeroSection() {
  const { t, pick } = useLanguage();
  const heroProducts = products.filter((p) => p.featured).slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-[#1E40AF]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, #FFC800 0, transparent 32%), radial-gradient(circle at 85% 75%, #2E9E44 0, transparent 36%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-16">
        <div>
          <Badge tone="green" className="bg-white/10 text-[#8ED060]">
            {t("hero.kicker")}
          </Badge>
          <h1 className="mt-4 text-[30px] font-black leading-[1.25] text-white sm:text-[42px] lg:text-[52px] lg:leading-[1.18]">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/80 sm:text-base">
            {t("hero.desc")}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FFC800] px-5 py-3 text-[14px] font-bold text-[#16339B] shadow-lg shadow-[#FFC800]/25 transition hover:bg-[#E6B400]"
            >
              {t("hero.cta1")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-[14px] font-bold text-white transition hover:bg-white/20"
            >
              {t("hero.cta2")}
            </Link>
            <Link
              href="/dealer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#FFC800]/50 bg-[#FFC800]/15 px-5 py-3 text-[14px] font-bold text-[#FFD200] transition hover:bg-[#FFC800]/25"
            >
              {t("hero.cta3")}
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 shadow-2xl shadow-black/25">
            <Image
              src={marketingImages.heroStaples.src}
              alt="Everyday grocery staples — oil, rice, lentils and spices"
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 45vw, 100vw"
              placeholder="blur"
              blurDataURL={marketingImages.heroStaples.blurDataURL}
              className="object-cover"
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {heroProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur transition hover:bg-white/20"
              >
                <span className="block truncate text-[11px] font-semibold text-white">
                  {pick(p.name)}
                </span>
                <span className="block text-[10.5px] text-white/70">{p.weight}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Trust bar -------------------------------- */

export function TrustBar() {
  const { t } = useLanguage();
  return (
    <section className="border-b border-[#E2E8EA] bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-7 lg:grid-cols-4 lg:px-8">
        {trustItems.map((item) => {
          const Icon = iconMap[item.icon] ?? ShieldCheck;
          return (
            <div key={item.key} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1D4ED8]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold text-[#16339B]">
                  {t(`trust.${item.key}`)}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-[#66777D]">
                  {t(`trust.${item.key}Desc`)}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------- Category showcase ----------------------------- */

export function CategoryShowcase() {
  const { t, pick } = useLanguage();
  const groups: { key: "food" | "household" | "beverages" | "future"; label: string }[] = [
    { key: "food", label: t("categories.food") },
    { key: "household", label: t("categories.household") },
    { key: "beverages", label: t("categories.beverages") },
    { key: "future", label: t("categories.future") },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
      <SectionHeading title={t("categories.heading")} subtitle={t("categories.sub")} />
      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-[#66777D]">
              {group.label}
            </h3>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
              {categories
                .filter((c) => c.group === group.key)
                .map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    aria-disabled={cat.comingSoon}
                    className={cn(
                      "group flex flex-col items-center gap-2 rounded-2xl border border-[#E2E8EA] bg-white p-3 text-center transition",
                      cat.comingSoon
                        ? "border-dashed opacity-80"
                        : "hover:-translate-y-0.5 hover:border-[#1D4ED8]/40 hover:shadow-md hover:shadow-[#16339B]/8",
                    )}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black"
                      style={{ backgroundColor: cat.tint, color: cat.pack }}
                    >
                      {pick(cat.name).charAt(0)}
                    </span>
                    <span className="line-clamp-2 text-[11.5px] font-semibold leading-snug text-[#17242A]">
                      {pick(cat.name)}
                    </span>
                    {cat.comingSoon ? (
                      <Badge tone="amber" className="text-[9.5px]">
                        {t("categories.comingSoon")}
                      </Badge>
                    ) : (
                      <span className="text-[10px] font-medium text-[#1D4ED8] opacity-0 transition group-hover:opacity-100">
                        {t("categories.viewProducts")}
                      </span>
                    )}
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Featured tabs ------------------------------ */

export function FeaturedProducts() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"popular" | "new" | "offers">("popular");

  const list =
    tab === "popular"
      ? products.filter((p) => p.bestSeller || p.featured).slice(0, 8)
      : tab === "new"
        ? products.filter((p) => p.newArrival).slice(0, 8)
        : products.filter((p) => p.discountPercentage > 0).slice(0, 8);

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "popular", label: t("featured.tabPopular") },
    { key: "new", label: t("featured.tabNew") },
    { key: "offers", label: t("featured.tabOffers") },
  ];

  return (
    <section className="border-y border-[#E2E8EA] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
        <SectionHeading
          title={t("featured.heading")}
          subtitle={t("featured.sub")}
          action={
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#1D4ED8] hover:underline"
            >
              {t("featured.viewAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div role="tablist" aria-label={t("featured.heading")} className="mb-5 flex gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              role="tab"
              aria-selected={tab === item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-semibold transition",
                tab === item.key
                  ? "bg-[#1D4ED8] text-white shadow-sm"
                  : "border border-[#E2E8EA] bg-white text-[#17242A] hover:border-[#1D4ED8]/40 hover:bg-[#E8F0FE]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <ProductGrid products={list} />
      </div>
    </section>
  );
}

/* ------------------------------- Why choose us ------------------------------- */

export function WhyChooseUs() {
  const { t, pick } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
      <SectionHeading title={t("why.heading")} subtitle={t("why.sub")} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {whyItems.map((item) => {
          const Icon = iconMap[item.icon] ?? ShieldCheck;
          return (
            <div
              key={item.title.en}
              className="rounded-2xl border border-[#E2E8EA] bg-white p-4 transition hover:border-[#1D4ED8]/30 hover:shadow-md hover:shadow-[#16339B]/8"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1D4ED8]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-[14px] font-bold text-[#16339B]">{pick(item.title)}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#66777D]">{pick(item.desc)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------- About preview ------------------------------- */

export function AboutPreview() {
  const { t } = useLanguage();
  return (
    <section className="border-y border-[#E2E8EA] bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:py-14 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <Badge>{t("aboutPreview.kicker")}</Badge>
          <h2 className="mt-3 text-[24px] font-bold leading-snug text-[#16339B] sm:text-[30px]">
            {t("aboutPreview.heading")}
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-[#17242A]">{t("aboutPreview.body1")}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-[#66777D]">{t("aboutPreview.body2")}</p>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-[13.5px] font-bold text-white transition hover:bg-[#16339B]"
          >
            {t("aboutPreview.cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-[#E2E8EA]">
          <Image
            src={marketingImages.warehouse.src}
            alt="Organised warehouse with carton boxes"
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 45vw, 100vw"
            placeholder="blur"
            blurDataURL={marketingImages.warehouse.blurDataURL}
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- CTAs ---------------------------------- */

export function DealerCTA() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-[#1D4ED8] p-6 sm:p-8">
          <Store className="absolute -right-6 -top-6 h-32 w-32 text-white/10" />
          <h2 className="text-[20px] font-bold text-white sm:text-[24px]">{t("dealerCta.heading")}</h2>
          <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-white/80">{t("dealerCta.body")}</p>
          <Link
            href="/dealer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#1D4ED8] transition hover:bg-[#E8F0FE]"
          >
            {t("dealerCta.cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-[#2E9E44] p-6 sm:p-8">
          <Building2 className="absolute -right-6 -top-6 h-32 w-32 text-white/10" />
          <h2 className="text-[20px] font-bold text-white sm:text-[24px]">
            {t("corporateCta.heading")}
          </h2>
          <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-white/85">
            {t("corporateCta.body")}
          </p>
          <Link
            href="/corporate"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#1F7A33] transition hover:bg-[#EAF7EC]"
          >
            {t("corporateCta.cta")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function PromoBanner() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-[#FFC800]/40 bg-[#FFF8DC] p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="text-[19px] font-bold text-[#8A6400] sm:text-[22px]">{t("promo.heading")}</h2>
          <p className="mt-1.5 max-w-xl text-[13px] text-[#8A6400]/80">{t("promo.body")}</p>
        </div>
        <Link
          href="/offers"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#FFC800] px-5 py-3 text-[13.5px] font-bold text-[#16339B] transition hover:bg-[#E6B400]"
        >
          {t("promo.cta")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/* -------------------------------- Newsletter -------------------------------- */

export function Newsletter() {
  const { t } = useLanguage();
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t("validation.invalidEmail"));
      return;
    }
    setError("");
    setEmail("");
    push(t("toasts.newsletter"));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-8">
      <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-[19px] font-bold text-[#16339B]">
              <Mail className="h-5 w-5 text-[#1D4ED8]" />
              {t("newsletter.heading")}
            </h2>
            <p className="mt-1.5 text-[13px] text-[#66777D]">{t("newsletter.body")}</p>
          </div>
          <form onSubmit={submit} noValidate className="flex w-full flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                {t("newsletter.placeholder")}
              </label>
              <TextInput
                id="newsletter-email"
                type="email"
                value={email}
                invalid={Boolean(error)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder={t("newsletter.placeholder")}
              />
              {error ? (
                <p role="alert" className="mt-1 text-xs font-medium text-[#DC2626]">
                  {error}
                </p>
              ) : null}
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-[#1D4ED8] px-6 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[#16339B]"
            >
              {t("newsletter.cta")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export { company };
