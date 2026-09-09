"use client";

import Link from "next/link";
import { Mail, MapPin, Factory } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { Logo, LogoMark } from "./Logo";
import { WhatsAppIcon } from "@/components/ui/core";
import { company } from "@/data/company";

export function Footer() {
  const { t, pick } = useLanguage();

  const quickLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/shop", label: t("nav.shop") },
    { href: "/offers", label: t("nav.offers") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/faq", label: t("faq.heading") },
  ];

  const businessLinks = [
    { href: "/dealer", label: t("footer.dealer") },
    { href: "/dealer", label: t("footer.distributor") },
    { href: "/corporate", label: t("footer.corporate") },
    { href: "/offers", label: t("footer.offers") },
  ];

  return (
    <footer className="mt-16 bg-[#16339B] text-white">
      {/* trust lead-in */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center lg:px-8">
          <LogoMark className="h-10 w-10 text-white" />
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-white/85">
            {t("footer.tagline")}
          </p>
          <p className="max-w-2xl text-[13px] text-white/60">{pick(company.brandMessage)}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo light />
          <p className="mt-4 text-[13px] leading-relaxed text-white/70">{t("footer.aboutBlurb")}</p>
        </div>

        <nav aria-label={t("footer.quickLinks")}>
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-[#FFC800]">
            {t("footer.quickLinks")}
          </h3>
          <ul className="space-y-2.5">
            {quickLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="text-[13.5px] text-white/75 transition hover:text-white hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("footer.business")}>
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-[#FFC800]">
            {t("footer.business")}
          </h3>
          <ul className="space-y-2.5">
            {businessLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-[13.5px] text-white/75 transition hover:text-white hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/terms" className="text-[13.5px] text-white/75 transition hover:text-white hover:underline">
                {t("terms.heading")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-[13.5px] text-white/75 transition hover:text-white hover:underline">
                {t("privacy.heading")}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-[#FFC800]">
            {t("footer.contact")}
          </h3>
          <ul className="space-y-3 text-[13.5px] text-white/75">
            <li>
              <a
                href="https://wa.me/8801335189426"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 transition hover:text-white"
              >
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#2E9E44]" />
                {company.whatsappLocal}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className="flex items-start gap-2 transition hover:text-white">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#FFC800]" />
                {company.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FFC800]" />
              <span>
                <span className="block text-[11px] uppercase tracking-wide text-white/50">
                  {t("footer.location")}
                </span>
                {pick(company.businessAddress)}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Factory className="mt-0.5 h-4 w-4 shrink-0 text-[#FFC800]" />
              <span>
                <span className="block text-[11px] uppercase tracking-wide text-white/50">
                  {t("footer.production")}
                </span>
                {pick(company.productionAddress)}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:text-left lg:px-8">
          <p className="text-[12px] text-white/60">
            © {new Date().getFullYear()} {t("footer.company")} {t("footer.rights")}
          </p>
          <p className="text-[12px] text-white/50">
            {company.name} • {company.platform} • {company.associatedBrand}
          </p>
        </div>
      </div>
    </footer>
  );
}
