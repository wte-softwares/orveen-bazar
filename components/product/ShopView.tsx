"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { products, searchProducts } from "@/data/products";
import { categoryBySlug } from "@/data/categories";
import { ProductGrid } from "./ProductGrid";
import {
  emptyFilters,
  FilterControls,
  MobileFilterDrawer,
  SortDropdown,
  type FilterState,
  type SortKey,
} from "./FilterPanel";
import { Breadcrumb, EmptyState } from "@/components/ui/core";
import type { Product } from "@/lib/types";

function sortList(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  switch (sort) {
    case "priceAsc":
      return copy.sort((a, b) => a.price - b.price);
    case "priceDesc":
      return copy.sort((a, b) => b.price - a.price);
    case "discount":
      return copy.sort((a, b) => b.discountPercentage - a.discountPercentage);
    case "newest":
      return copy.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    default:
      return copy.sort(
        (a, b) =>
          Number(b.bestSeller) + Number(b.featured) - (Number(a.bestSeller) + Number(a.featured)) ||
          b.rating - a.rating,
      );
  }
}

export function ShopView({ categorySlug }: { categorySlug?: string }) {
  const { t, pick, language } = useLanguage();
  const params = useSearchParams();
  const query = params.get("q") ?? "";

  const fixedCategory = categorySlug ? categoryBySlug(categorySlug) : undefined;

  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [sort, setSort] = useState<SortKey>("popular");
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* keep the fixed category selected when navigating between category pages */
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      cats: categorySlug ? [categorySlug] : prev.cats,
    }));
  }, [categorySlug]);

  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    let list = query ? searchProducts(query) : [...products];

    if (fixedCategory?.comingSoon) list = [];
    else if (filters.cats.length) list = list.filter((p) => filters.cats.includes(p.categorySlug));
    if (filters.brands.length) list = list.filter((p) => filters.brands.includes(p.brand));
    const min = parseFloat(filters.minPrice);
    const max = parseFloat(filters.maxPrice);
    if (!Number.isNaN(min)) list = list.filter((p) => p.price >= min);
    if (!Number.isNaN(max)) list = list.filter((p) => p.price <= max);
    if (filters.inStock) list = list.filter((p) => p.stockStatus === "in");
    if (filters.onSale) list = list.filter((p) => p.discountPercentage > 0);
    if (filters.minRating) list = list.filter((p) => p.rating >= filters.minRating);

    return sortList(list, sort);
  }, [query, filters, sort, fixedCategory]);

  const activeCount =
    filters.cats.length +
    filters.brands.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.minRating ? 1 : 0);

  const title = fixedCategory ? pick(fixedCategory.name) : query ? t("shop.heading") : t("shop.heading");

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb
        items={[
          { label: t("common.home"), href: "/" },
          ...(fixedCategory
            ? [{ label: t("nav.categories"), href: "/shop" }, { label: title }]
            : [{ label: title }]),
        ]}
      />

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold text-[#16339B] sm:text-[28px]">{title}</h1>
          <p className="mt-1 text-[13px] text-[#66777D]">
            {query
              ? t("shop.searchResultsFor", { query })
              : fixedCategory
                ? pick(fixedCategory.description)
                : t("shop.sub")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-[#E2E8EA] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#17242A] transition hover:bg-[#F5F8FE] lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("shop.mobileFilters")}
            {activeCount > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1D4ED8] px-1 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            ) : null}
          </button>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      <p className="mt-3 text-[13px] font-medium text-[#66777D]" aria-live="polite">
        {t("shop.results", { count: filtered.length.toLocaleString(language === "bn" ? "bn-BD" : "en-US") })}
      </p>

      <div className="mt-4 grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block" aria-label={t("shop.filters")}>
          <div className="sticky top-32 rounded-2xl border border-[#E2E8EA] bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#16339B]">{t("shop.filters")}</h2>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    setFilters({ ...emptyFilters, cats: categorySlug ? [categorySlug] : [] })
                  }
                  className="text-[12px] font-semibold text-[#1D4ED8] hover:underline"
                >
                  {t("shop.clearAll")}
                </button>
              ) : null}
            </div>
            <FilterControls state={filters} onChange={setFilters} brands={brands} />
          </div>
        </aside>

        <div className="min-w-0">
          {fixedCategory?.comingSoon ? (
            <EmptyState
              icon={PackageSearch}
              title={`${pick(fixedCategory.name)} — ${t("categories.comingSoon")}`}
              description={t("empty.defaultDesc")}
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title={t("shop.empty")}
              description={t("shop.emptyDesc")}
            />
          ) : (
            <ProductGrid products={filtered} />
          )}
        </div>
      </div>

      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        state={filters}
        onChange={setFilters}
        brands={brands}
        onClear={() => setFilters({ ...emptyFilters, cats: categorySlug ? [categorySlug] : [] })}
      />
    </div>
  );
}
