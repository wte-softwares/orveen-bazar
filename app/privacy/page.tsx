"use client";

import { FileWarning, ShieldQuestion } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { privacySections } from "@/data/content";
import { Breadcrumb } from "@/components/ui/core";

export default function PrivacyPage() {
  const { t, pick } = useLanguage();
  usePageTitle(t("privacy.heading"), "Privacy Policy");

  return (
    <div className="mx-auto max-w-3xl px-3 py-5 sm:px-4 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("privacy.heading") }]} />
      <h1 className="mt-3 text-[24px] font-black text-[#16339B] sm:text-[30px]">
        {t("privacy.heading")}
      </h1>
      <p className="mt-1.5 text-[13.5px] text-[#66777D]">{t("privacy.sub")}</p>
      <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#FFC800]/40 bg-[#FFC800]/10 px-4 py-3 text-[12.5px] font-medium text-[#8A6400]">
        <FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
        {t("privacy.reviewNote")}
      </p>
      <div className="mt-6 space-y-5">
        {privacySections.map((section, i) => (
          <section key={i} className="rounded-2xl border border-[#E2E8EA] bg-white p-5">
            <h2 className="flex items-center gap-2 text-[15.5px] font-bold text-[#16339B]">
              <ShieldQuestion className="h-4 w-4 text-[#1D4ED8]" />
              {pick(section.title)}
            </h2>
            <div className="mt-2 space-y-2 text-[13.5px] leading-relaxed text-[#66777D]">
              {section.body.map((para, j) => (
                <p key={j}>{pick(para)}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
