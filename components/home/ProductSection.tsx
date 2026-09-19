"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, type ProductCardItem } from "@/components/home/ProductCard";
import { Container } from "@/components/layout/Container";
import { useLocale, useTranslations } from "@/lib/i18n/LocaleProvider";
import { pickLocalized, type LocalizedText } from "@/lib/site-config";

/** One brand's "popular products" strip on the family homepage. Client Component so the heading/tagline/CTA can switch language. */
export function ProductSection({
  orgSlug,
  orgName,
  tagline,
  items,
}: {
  orgSlug: string;
  orgName: string;
  tagline: LocalizedText;
  items: ProductCardItem[];
}) {
  const { locale } = useLocale();
  const t = useTranslations("productSection");

  if (items.length === 0) return null;

  return (
    <section>
      <Container className="py-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-bold">
              {orgName}
              {t("popularProductsSuffix")}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{pickLocalized(tagline, locale)}</p>
          </div>
          <Link
            href={`/catalog?org=${orgSlug}`}
            className="hidden shrink-0 items-center gap-1 rounded-lg border border-[var(--brand-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)] transition hover:bg-[var(--brand-primary)] hover:text-white sm:inline-flex"
          >
            {t("viewAll")} <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
