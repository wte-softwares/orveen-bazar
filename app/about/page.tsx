"use client";

import Image from "next/image";
import { marketingImages } from "@/lib/images";
import {
  Building2,
  Compass,
  Factory,
  Flag,
  Gem,
  MapPin,
  Megaphone,
  Route,
  Target,
  UserRound,
} from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import {
  aboutIntro,
  commitmentText,
  coreValues,
  dealerLevels,
  founderMessage,
  marketingStrategy,
  missionPoints,
  roadmap,
  visionText,
} from "@/data/content";
import { company } from "@/data/company";
import { Breadcrumb, Badge, SectionHeading } from "@/components/ui/core";

export default function AboutPage() {
  const { t, pick } = useLanguage();
  usePageTitle(t("nav.about"), "About Us");

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("nav.about") }]} />

      {/* intro */}
      <section className="mt-4 grid gap-8 rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <Badge>{t("about.kicker")}</Badge>
          <h1 className="mt-3 text-[26px] font-black text-[#16339B] sm:text-[34px]">
            {t("about.heading")}
          </h1>
          <p className="mt-2 text-[13px] font-semibold text-[#2E9E44]">{company.brandMessage && pick(company.brandMessage)}</p>
          <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-[#17242A]">
            {aboutIntro.map((para, i) => (
              <p key={i} className={i > 0 ? "text-[#66777D]" : undefined}>
                {pick(para)}
              </p>
            ))}
          </div>
        </div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-[#E2E8EA]">
          <Image
            src={marketingImages.dealerShop.src}
            alt="Neat neighbourhood grocery shop shelves"
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            placeholder="blur"
            blurDataURL={marketingImages.dealerShop.blurDataURL}
            className="object-cover"
          />
        </div>
      </section>

      {/* founder */}
      <section className="mt-8 rounded-3xl bg-[#1E40AF] p-6 text-white sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
          <div className="flex flex-col items-center text-center">
            <span
              className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-3xl font-black text-[#FFC800]"
              aria-label={company.founder.name}
            >
              MI
            </span>
            <p className="mt-3 text-[15px] font-bold">{company.founder.name}</p>
            <p className="text-[12.5px] text-[#FFC800]">{pick(company.founder.role)}</p>
            <p className="mt-2 max-w-[220px] text-[11px] leading-relaxed text-white/60">
              {t("about.founderIdentity1")}
              <br />
              {t("about.founderIdentity2")}
            </p>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-[20px] font-bold sm:text-[24px]">
              <UserRound className="h-5 w-5 text-[#FFC800]" />
              {t("about.founderHeading")}
            </h2>
            <div className="mt-4 space-y-3 border-l-2 border-[#2E9E44]/60 pl-4 text-[14px] leading-relaxed text-white/85">
              {founderMessage.map((para, i) => (
                <p key={i}>{pick(para)}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* vision & mission */}
      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-[19px] font-bold text-[#16339B]">
            <Compass className="h-5 w-5 text-[#1D4ED8]" />
            {t("about.visionHeading")}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#66777D]">{pick(visionText)}</p>
        </div>
        <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-[19px] font-bold text-[#16339B]">
            <Target className="h-5 w-5 text-[#1D4ED8]" />
            {t("about.missionHeading")}
          </h2>
          <ul className="mt-3 space-y-2">
            {missionPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[#66777D]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2E9E44]" />
                {pick(point)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* values */}
      <section className="mt-10">
        <SectionHeading title={t("about.valuesHeading")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {coreValues.map((value) => (
            <div
              key={value.title.en}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[#E2E8EA] bg-white p-4 text-center transition hover:border-[#1D4ED8]/30 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FE] text-[#1D4ED8]">
                <Gem className="h-4.5 w-4.5" />
              </span>
              <span className="text-[13px] font-bold text-[#16339B]">{pick(value.title)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* business model */}
      <section className="mt-10">
        <SectionHeading title={t("about.modelHeading")} subtitle={t("dealer.modelSub")} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dealerLevels.map((level, i) => (
            <div
              key={level.level.en + i}
              className="flex items-center gap-3 rounded-2xl border border-[#E2E8EA] bg-white p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D4ED8] text-[13px] font-black text-white">
                {i + 1}
              </span>
              <span>
                <span className="block text-[13.5px] font-bold text-[#16339B]">{pick(level.level)}</span>
                <span className="block text-[12.5px] text-[#66777D]">→ {pick(level.role)}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* marketing strategy */}
      <section className="mt-10">
        <SectionHeading title={t("about.strategyHeading")} />
        <div className="flex flex-wrap gap-2">
          {marketingStrategy.map((item) => (
            <span
              key={item.en}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8EA] bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#17242A]"
            >
              <Megaphone className="h-3.5 w-3.5 text-[#1D4ED8]" />
              {pick(item)}
            </span>
          ))}
        </div>
      </section>

      {/* roadmap */}
      <section className="mt-10">
        <SectionHeading title={t("about.roadmapHeading")} subtitle={t("about.roadmapSub")} />
        <ol className="relative space-y-6 border-l-2 border-[#1D4ED8]/20 pl-6">
          {roadmap.map((step) => (
            <li key={step.year} className="relative">
              <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#1D4ED8] bg-white">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1D4ED8]" />
              </span>
              <div className="rounded-2xl border border-[#E2E8EA] bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{t("about.year")} {step.year}</Badge>
                  <Badge tone="muted">
                    <Route className="h-3 w-3" />
                    {t("about.roadmapSub").split("—")[0].trim()}
                  </Badge>
                </div>
                <ul className="mt-2.5 space-y-1.5">
                  {step.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-[#17242A]">
                      <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2E9E44]" />
                      {pick(point)}
                    </li>
                  ))}
                </ul>
                {step.target ? (
                  <p className="mt-2.5 text-[12.5px] font-bold text-[#8A6400]">
                    {t("about.target")}: {pick(step.target)}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* locations + commitment */}
      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#E2E8EA] bg-white p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-[19px] font-bold text-[#16339B]">
            <MapPin className="h-5 w-5 text-[#1D4ED8]" />
            {t("about.locationsHeading")}
          </h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1D4ED8]" />
              <div>
                <p className="text-[13px] font-bold text-[#16339B]">{t("about.businessLocation")}</p>
                <p className="mt-0.5 text-[13.5px] text-[#66777D]">{pick(company.businessAddress)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Factory className="mt-0.5 h-5 w-5 shrink-0 text-[#1D4ED8]" />
              <div>
                <p className="text-[13px] font-bold text-[#16339B]">{t("about.productionLocation")}</p>
                <p className="mt-0.5 text-[13.5px] text-[#66777D]">{pick(company.productionAddress)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-[#2E9E44] p-6 text-white sm:p-8">
          <h2 className="text-[19px] font-bold">{t("about.commitmentHeading")}</h2>
          <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-white/90">
            {commitmentText.map((para, i) => (
              <p key={i}>{pick(para)}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
