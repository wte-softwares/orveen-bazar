"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import { WhatsAppIcon } from "@/components/ui/core";
import { company } from "@/data/company";
import { whatsappLink } from "@/lib/utils";

export function WhatsAppButton() {
  const { t, language } = useLanguage();
  const message = language === "bn" ? company.whatsappMessage.bn : company.whatsappMessage.en;

  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("contact.whatsappCta")}
      className="group fixed bottom-20 right-4 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] p-3.5 text-white shadow-lg shadow-[#16A34A]/30 transition hover:scale-105 hover:bg-[#1EBE5A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A] sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-[#16339B] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow transition group-hover:opacity-100 sm:block">
        {t("contact.whatsappCta")}
      </span>
    </a>
  );
}
