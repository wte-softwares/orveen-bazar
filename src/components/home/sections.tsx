"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Headphones, ShieldCheck, Tag, Truck } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAdminStore } from "@/providers/AdminStoreProvider";
import { organizations, orgBySlug } from "@/data/organizations";
import { BrandCard, CatalogCard, CategoryCard } from "@/components/catalog/cards";
import { Banner } from "@/components/brand/bits";
import { Badge, SectionHeading } from "@/components/ui/core";
import { cn } from "@/lib/utils";

/* ---------------------------------- Hero ---------------------------------- */

export function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-[#0346A5]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, #79D318 0, transparent 34%), radial-gradient(circle at 88% 78%, #53B51B 0, transparent 36%)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-16">
        <div>
          <Badge tone="green" className="bg-white/10 text-[#B8E77E]">
            {t("home.heroKicker")}
          </Badge>
          <h1 className="mt-4 text-[30px] font-black leading-[1.25] text-white sm:text-[44px] lg:text-[54px] lg:leading-[1.16]">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/85 sm:text-base">
            {t("hero.desc")}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 rounded-xl bg-[#53B51B] px-5 py-3 text-[14px] font-bold text-white shadow-lg shadow-[#2D9819]/30 transition hover:bg-[#2D9819]"
            >
              {t("home.exploreBrands")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-[14px] font-bold text-white transition hover:bg-white/20"
            >
              {t("home.browseCatalog")}
            </Link>
          </div>
          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-semibold text-white/70">
            {organizations.map((org) => (
              <span key={org.slug}>{org.name}</span>
            ))}
          </p>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-white/15 shadow-2xl shadow-black/25">
            {/* Local SVG asset avoids a remote/optimizer dependency for the hero visual. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-staples.svg"
              alt="Everyday grocery staples — oil, rice, lentils and spices"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Trust bar -------------------------------- */

const trustIcons = [ShieldCheck, Tag, Truck, Headphones];

export function TrustBar() {
  const { t } = useLanguage();
  const keys = ["quality", "pricing", "supply", "support"] as const;
  return (
    <section className="border-b border-[#E2E8EA] bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-7 lg:grid-cols-4 lg:px-8">
        {keys.map((key, i) => {
          const Icon = trustIcons[i];
          return (
            <div key={key} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF9E8] text-[#2D9819]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold text-[#0346A5]">{t(`trust.${key}`)}</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-[#66777D]">
                  {t(`trust.${key}Desc`)}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------- Brand cards ------------------------------- */

export function BrandCardsSection() {
  const { t, pick } = useLanguage();
  const { settingsFor } = useAdminStore();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
      <SectionHeading title={t("home.brandsTitle")} subtitle={t("home.brandsSub")} />
      <div className="grid gap-4 md:grid-cols-3">
        {organizations.map((org) => (
          <BrandCard key={org.slug} org={org} intro={pick(settingsFor(org.slug).intro)} />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------- Featured categories ---------------------------- */

export function FeaturedCategoriesSection() {
  const { t } = useLanguage();
  const { state, publishedItems } = useAdminStore();
  const cats = state.categories.filter((c) => c.active).slice(0, 8);
  return (
    <section className="border-y border-[#E2E8EA] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
        <SectionHeading title={t("home.categoriesTitle")} subtitle={t("home.categoriesSub")} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cats.map((cat) => (
            <CategoryCard
              key={cat.slug}
              category={cat}
              count={publishedItems(cat.orgSlug).filter((i) => i.categorySlug === cat.slug).length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Featured items ------------------------------ */

export function FeaturedItemsSection() {
  const { t, pick } = useLanguage();
  const { publishedItems, state } = useAdminStore();
  const featured = publishedItems().filter((i) => i.featured).slice(0, 8);
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
      <SectionHeading
        title={t("home.featuredItems")}
        subtitle={t("home.featuredSub")}
        action={
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#075ED1] hover:underline"
          >
            {t("home.viewAll")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {featured.map((item) => (
          <CatalogCard
            key={item.id}
            item={item}
            orgName={orgBySlug(item.orgSlug)?.name ?? item.orgSlug}
            categoryName={pick(
              state.categories.find((c) => c.slug === item.categorySlug)?.name ?? { bn: "", en: "" },
            )}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ Banner carousel ------------------------------ */

export function BannerCarousel() {
  const { t } = useLanguage();
  const { state } = useAdminStore();
  const banners = state.banners.filter((banner) => banner.active).sort((a, b) => a.sortOrder - b.sortOrder);
  const [index, setIndex] = useState(0);
  if (banners.length === 0) return null;
  const safe = Math.min(index, banners.length - 1);
  return (
    <section className="border-y border-[#E2E8EA] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
        <SectionHeading title={t("home.bannerTitle")} />
        <div className="relative">
          <Banner banner={banners[safe]} />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1.5" role="tablist" aria-label={t("home.bannerTitle")}>
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  aria-selected={i === safe}
                  aria-label={`${t("home.bannerTitle")} ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === safe ? "w-6 bg-[#075ED1]" : "w-2 bg-[#E2E8EA] hover:bg-[#B0BEC5]",
                  )}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIndex((safe - 1 + banners.length) % banners.length)}
                aria-label={t("catalog.prev")}
                className="rounded-xl border border-[#E2E8EA] p-2 text-[#17242A] transition hover:bg-[#F7F9FA]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((safe + 1) % banners.length)}
                aria-label={t("catalog.next")}
                className="rounded-xl border border-[#E2E8EA] p-2 text-[#17242A] transition hover:bg-[#F7F9FA]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Brand overview ------------------------------ */

export function BrandOverviewSection() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:px-8">
      <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-10">
        <h2 className="text-[22px] font-bold text-[#0346A5] sm:text-[28px]">{t("home.overviewTitle")}</h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[#66777D]">
          {t("home.overviewBody")}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {organizations.map((org) => (
            <Link
              key={org.slug}
              href={`/brands/${org.slug}`}
              className="rounded-2xl border border-[#E2E8EA] p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ backgroundColor: org.tint }}
            >
              <span className="block text-[14px] font-black" style={{ color: org.deep }}>
                {org.name}
              </span>
              <span className="mt-1 block text-[12px] font-semibold" style={{ color: org.primary }}>
                {t("home.viewBrand")} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
