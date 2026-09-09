"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WhatsAppIcon } from "@/components/ui/core";
import { company } from "@/data/company";

export function TopBar() {
  const { t } = useLanguage();

  return (
    <div className="hidden bg-[#16339B] text-white md:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <p className="truncate text-[11.5px] font-medium tracking-wide text-white/90">
          {t("topbar.tagline")}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={`https://wa.me/8801335189426`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-white/90 transition hover:text-white"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 text-[#2E9E44]" />
            {t("topbar.whatsapp")}
          </a>
          <span className="h-3.5 w-px bg-white/25" aria-hidden="true" />
          <LanguageSwitcher />
          <span className="hidden text-[11px] text-white/60 lg:inline">
            {company.platform}
          </span>
        </div>
      </div>
    </div>
  );
}
