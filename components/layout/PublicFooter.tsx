"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useComingSoon } from "@/components/common/ComingSoon";
import { Container } from "@/components/layout/Container";
import { BRANDS, PRIMARY_BRAND_LOGO_SRC, SITE_CONFIG } from "@/lib/site-config";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

/**
 * Ported from the client's design. Links to screens that don't exist yet
 * (FAQ, return/delivery policy, privacy, terms, contact, social) open the
 * shared "coming soon" dialog instead of 404ing — see AGENTS.md.
 */
export function PublicFooter() {
  const { trigger } = useComingSoon();
  const t = useTranslations("footer");

  return (
    <footer className="bg-[var(--color-neutral-900)] text-white/80">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src={PRIMARY_BRAND_LOGO_SRC}
            alt="ORVEEN BAZAR.COM"
            width={180}
            height={64}
            className="h-12 w-auto object-contain"
          />
          <p className="mt-2 text-sm leading-relaxed">{t("tagline")}</p>
          <div className="mt-4 flex gap-3">
            {SITE_CONFIG.socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.label === "Email" ? undefined : "_blank"}
                rel={social.label === "Email" ? undefined : "noreferrer"}
                aria-label={social.label}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold transition hover:bg-white/20"
              >
                {social.label === "WhatsApp" ? (
                  <MessageCircle className="h-4 w-4" />
                ) : social.label === "Email" ? (
                  <Mail className="h-4 w-4" />
                ) : social.label === "Website" ? (
                  <Globe className="h-4 w-4" />
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                    <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.4-.1-1.2-.2-2.2-.2-2.2 0-3.7 1.3-3.7 3.8V10H8.5v3h2.6v8h2.6Z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{t("brandsHeading")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {BRANDS.map((brand) => (
              <li key={brand.slug}>
                <Link href={`/brands/${brand.slug}`} className="hover:text-white">
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{t("supportHeading")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <button type="button" onClick={() => trigger("FAQ")} className="hover:text-white">
                {t("faq")}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => trigger("Return policy")} className="hover:text-white">
                {t("returnPolicy")}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => trigger("Delivery information")} className="hover:text-white">
                {t("deliveryInfo")}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => trigger("Contact page")} className="hover:text-white">
                {t("contactUs")}
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">{t("contactHeading")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {SITE_CONFIG.contact.address}
            </li>
            <li>
              <a href={SITE_CONFIG.contact.whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
                <Phone className="h-4 w-4 shrink-0" /> {SITE_CONFIG.contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE_CONFIG.contact.email}`} className="flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4 shrink-0" /> {SITE_CONFIG.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-4">
        <Container className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Orveen Bazaar. {t("copyright")}</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => trigger("Privacy policy")} className="hover:text-white">
              {t("privacyPolicy")}
            </button>
            <button type="button" onClick={() => trigger("Terms of use")} className="hover:text-white">
              {t("termsOfUse")}
            </button>
          </div>
        </Container>
      </div>
    </footer>
  );
}
