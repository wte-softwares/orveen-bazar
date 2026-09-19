"use client";

import { Container } from "@/components/layout/Container";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";
import { pickLocalized, type LocalizedText } from "@/lib/site-config";

export interface BrandCardOrg {
  slug: string;
  name: string;
  description: LocalizedText;
  logoSrc: string;
  cardBackgroundSrc: string;
  cardDescription: LocalizedText;
  cardAccent: string;
}

/** Client Component so the brand blurbs can switch language without a page reload. */
export function BrandCards({
  organizations,
}: {
  organizations: BrandCardOrg[];
}) {
  const { locale } = useLocale();
  const t = useTranslations("brandCards");

  return (
    <section id="brands">
      <Container className="py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold">{t("heading")}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("subheading")}</p>
          </div>
          <Link
            href="/catalog"
            className="hidden shrink-0 items-center gap-1 rounded-lg border border-[var(--brand-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)] hover:text-white sm:inline-flex"
          >
            {t("viewAll")} <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {organizations.map((org) => (
            <div
              key={org.slug}
              className="group relative min-h-64 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <Image
                src={org.cardBackgroundSrc}
                alt=""
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="relative z-10 flex h-full max-w-[70%] flex-col items-start p-5 sm:p-4 lg:p-5">
                <Image
                  src={org.logoSrc}
                  alt={`${org.name} logo`}
                  width={169}
                  height={104}
                  className="h-20 w-auto max-w-full object-contain object-left"
                />
                <p
                  style={{ color: org.cardAccent }}
                  className="mt-2 font-heading text-base font-extrabold tracking-tight"
                >
                  {org.name}
                </p>
                <p className="mt-2 text-sm leading-5 font-medium text-[var(--text-primary)]">
                  {pickLocalized(org.cardDescription, locale)}
                </p>
                <Link
                  href={`/brands/${org.slug}`}
                  style={{ backgroundColor: org.cardAccent }}
                  className="mt-auto inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)]"
                >
                  {t("viewBrand")} <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
