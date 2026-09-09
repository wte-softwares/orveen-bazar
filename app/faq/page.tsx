"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { faqItems } from "@/data/content";
import { company } from "@/data/company";
import { Breadcrumb, Badge, WhatsAppIcon } from "@/components/ui/core";
import { cn, whatsappLink } from "@/lib/utils";

export default function FaqPage() {
  const { t, pick, language } = useLanguage();
  const [open, setOpen] = useState<number | null>(0);
  usePageTitle(t("faq.heading"), "FAQ");

  return (
    <div className="mx-auto max-w-4xl px-3 py-5 sm:px-4 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("faq.heading") }]} />
      <h1 className="mt-3 text-[24px] font-black text-[#16339B] sm:text-[32px]">{t("faq.heading")}</h1>
      <p className="mt-1.5 text-[13.5px] text-[#66777D]">{t("faq.sub")}</p>

      <ul className="mt-6 space-y-2.5">
        {faqItems.map((item, i) => {
          const isOpen = open === i;
          return (
            <li key={item.q.en} className="overflow-hidden rounded-2xl border border-[#E2E8EA] bg-white">
              <h2>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-[#F5F8FE] sm:px-5"
                >
                  <span className="min-w-0">
                    <Badge tone="teal" className="mb-1">{pick(item.tag)}</Badge>
                    <span className="block text-[14px] font-semibold text-[#17242A]">{pick(item.q)}</span>
                  </span>
                  <ChevronDown
                    className={cn("h-4 w-4 shrink-0 text-[#1D4ED8] transition", isOpen && "rotate-180")}
                  />
                </button>
              </h2>
              {isOpen ? (
                <p className="anim-fade border-t border-[#E2E8EA] bg-[#F5F8FE] px-4 py-3.5 text-[13.5px] leading-relaxed text-[#66777D] sm:px-5">
                  {pick(item.a)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <section className="mt-8 rounded-3xl bg-[#1D4ED8] p-6 text-center text-white sm:p-8">
        <MessageCircleQuestion className="mx-auto h-8 w-8 text-[#FFC800]" />
        <h2 className="mt-2 text-[18px] font-bold">{t("faq.ctaHeading")}</h2>
        <p className="mx-auto mt-1.5 max-w-md text-[13px] text-white/80">{t("faq.ctaBody")}</p>
        <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row">
          <a
            href={whatsappLink(language === "bn" ? company.whatsappMessage.bn : company.whatsappMessage.en)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2E9E44] px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[#1F7A33]"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {company.whatsappLocal}
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-white/20"
          >
            {t("nav.contact")}
          </Link>
        </div>
      </section>
    </div>
  );
}
