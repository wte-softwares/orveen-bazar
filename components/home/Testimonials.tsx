"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";
import { pickLocalized } from "@/lib/site-config";
import { testimonialToLocalizedText, type TestimonialRow } from "@/lib/testimonials";

export function Testimonials({ testimonials }: { testimonials: TestimonialRow[] }) {
  const { locale } = useLocale();
  const t = useTranslations("testimonials");

  if (testimonials.length === 0) return null;

  return (
    <section>
      <Container className="py-6 sm:py-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-bold leading-none text-[var(--text-primary)]">{t("heading")}</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)] sm:text-sm">{t("subheading")}</p>
          </div>
          <Link href="/testimonials" className="hidden shrink-0 items-center gap-1 rounded-lg border border-[var(--brand-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)] hover:text-white sm:inline-flex">
            {t("viewAll")} <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => {
            const { name, city, quote } = testimonialToLocalizedText(testimonial);
            const localizedName = pickLocalized(name, locale);
            return (
              <article key={testimonial.id} className="relative min-h-[124px] rounded-xl border border-white bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-sm)]">
                <Quote className="absolute top-3 right-3 size-5 fill-[var(--color-neutral-200)] text-[var(--color-neutral-200)]" aria-hidden="true" />
                <div className="flex items-center gap-3 pr-7">
                  <Image src={testimonial.avatar_path} alt={localizedName} width={48} height={48} className="h-12 w-12 shrink-0 rounded-full border-2 border-[var(--color-secondary-500)] object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--brand-primary)]">{localizedName}</p>
                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{pickLocalized(city, locale)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-5 text-[var(--text-secondary)]">{pickLocalized(quote, locale)}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
