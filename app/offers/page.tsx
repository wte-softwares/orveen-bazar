"use client";

import { Percent } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { products } from "@/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/ui/core";

export default function OffersPage() {
  const { t } = useLanguage();
  usePageTitle(t("nav.offers"), "Offers");
  const offers = products.filter((p) => p.discountPercentage > 0);

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("nav.offers") }]} />
      <div className="mt-4 rounded-3xl border border-[#FFC800]/40 bg-[#FFF8DC] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFC800] text-[#16339B]">
            <Percent className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-[22px] font-bold text-[#8A6400] sm:text-[28px]">{t("nav.offers")}</h1>
            <p className="mt-1 max-w-2xl text-[13px] text-[#8A6400]/80">{t("promo.body")}</p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <ProductGrid products={offers} />
      </div>
    </div>
  );
}
