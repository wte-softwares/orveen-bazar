"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAdminStore } from "@/providers/AdminStoreProvider";
import { organizations, orgBySlug } from "@/data/organizations";
import { categoriesByOrg, categoryBySlug } from "@/data/categories";
import { searchItems, type CatalogItem } from "@/data/items";
import { CatalogCard } from "./cards";
import { EmptyState, ProductCardSkeleton, SidePanel } from "@/components/ui/core";
import { ErrorState } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

export interface CatalogFilters {
  search: string;
  brand: string;
  category: string;
  type: string;
  page: number;
}

function readFilters(sp: URLSearchParams): CatalogFilters {
  return {
    search: sp.get("search") ?? "",
    brand: sp.get("brand") ?? "",
    category: sp.get("category") ?? "",
    type: sp.get("type") ?? "",
    page: Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1),
  };
}

function toQuery(f: CatalogFilters): string {
  const params = new URLSearchParams();
  if (f.search) params.set("search", f.search);
  if (f.brand) params.set("brand", f.brand);
  if (f.category) params.set("category", f.category);
  if (f.type) params.set("type", f.type);
  if (f.page > 1) params.set("page", String(f.page));
  const str = params.toString();
  return str ? `?${str}` : "";
}

/* --------------------------------- Controls --------------------------------- */

function FilterControls({
  filters,
  onChange,
}: {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
}) {
  const { t, pick } = useLanguage();
  const { state } = useAdminStore();

  const categoryOptions = filters.brand
    ? state.categories.filter((c) => c.orgSlug === filters.brand)
    : state.categories;

  const selectClass =
    "w-full rounded-xl border border-[#E2E8EA] bg-white px-3 py-2.5 text-[13px] font-semibold text-[#17242A] focus:border-[#075ED1] focus:outline-none focus:ring-2 focus:ring-[#075ED1]/15";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="f-brand" className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#66777D]">
          {t("catalog.brand")}
        </label>
        <select
          id="f-brand"
          className={selectClass}
          value={filters.brand}
          onChange={(e) => onChange({ ...filters, brand: e.target.value, category: "", page: 1 })}
        >
          <option value="">{t("catalog.allBrands")}</option>
          {organizations.map((org) => (
            <option key={org.slug} value={org.slug}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-category" className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#66777D]">
          {t("catalog.category")}
        </label>
        <select
          id="f-category"
          className={selectClass}
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value, page: 1 })}
        >
          <option value="">{t("catalog.allCategories")}</option>
          {categoryOptions.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {pick(cat.name)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-type" className="mb-1.5 block text-[12px] font-bold uppercase tracking-wider text-[#66777D]">
          {t("catalog.type")}
        </label>
        <select
          id="f-type"
          className={selectClass}
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value, page: 1 })}
        >
          <option value="">{t("catalog.allTypes")}</option>
          <option value="product">{t("catalog.product")}</option>
          <option value="service">{t("catalog.service")}</option>
        </select>
      </div>
    </div>
  );
}

export function FilterChips({
  filters,
  onChange,
}: {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
}) {
  const { t, pick } = useLanguage();
  const { state } = useAdminStore();
  const chips: { label: string; clear: () => void }[] = [];
  if (filters.search)
    chips.push({ label: `“${filters.search}”`, clear: () => onChange({ ...filters, search: "", page: 1 }) });
  if (filters.brand)
    chips.push({
      label: orgBySlug(filters.brand)?.name ?? filters.brand,
      clear: () => onChange({ ...filters, brand: "", category: "", page: 1 }),
    });
  if (filters.category) {
    const matchedCategory = state.categories.find((c) => c.slug === filters.category) ?? categoryBySlug(filters.category);
    chips.push({
      label: pick(matchedCategory?.name ?? { bn: filters.category, en: filters.category }),
      clear: () => onChange({ ...filters, category: "", page: 1 }),
    });
  }
  if (filters.type)
    chips.push({
      label: filters.type === "product" ? t("catalog.product") : t("catalog.service"),
      clear: () => onChange({ ...filters, type: "", page: 1 }),
    });
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, i) => (
        <button
          key={i}
          type="button"
          onClick={chip.clear}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF3FE] px-3 py-1.5 text-[12px] font-semibold text-[#075ED1] transition hover:bg-[#075ED1] hover:text-white"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange({ search: "", brand: "", category: "", type: "", page: 1 })}
        className="text-[12px] font-semibold text-[#66777D] underline-offset-2 hover:text-[#075ED1] hover:underline"
      >
        {t("catalog.clear")}
      </button>
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={t("catalog.page")} className="mt-8 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label={t("catalog.prev")}
        className="rounded-xl border border-[#E2E8EA] p-2 text-[#17242A] transition hover:bg-[#EAF3FE] disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          aria-current={page === i + 1 ? "page" : undefined}
          className={cn(
            "min-w-9 rounded-xl px-3 py-2 text-[13px] font-semibold transition",
            page === i + 1
              ? "bg-[#075ED1] text-white"
              : "border border-[#E2E8EA] text-[#17242A] hover:bg-[#EAF3FE]",
          )}
        >
          {i + 1}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label={t("catalog.next")}
        className="rounded-xl border border-[#E2E8EA] p-2 text-[#17242A] transition hover:bg-[#EAF3FE] disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

/* -------------------------------- Catalog view ------------------------------- */

export function CatalogView() {
  const { t, pick, language } = useLanguage();
  const { publishedItems, state } = useAdminStore();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(() => readFilters(params), [params]);
  const [prevFilters, setPrevFilters] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (prevFilters !== filters) {
    setPrevFilters(filters);
    setLoading(true);
    setError(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 300);
    return () => window.clearTimeout(timer);
  }, [filters]);

  const retry = () => {
    setLoading(true);
    setError(false);
    window.setTimeout(() => setLoading(false), 300);
  };

  const apply = (next: CatalogFilters) => {
    router.push(`${pathname}${toQuery(next)}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    let list: CatalogItem[] = publishedItems();
    if (filters.brand) list = list.filter((i) => i.orgSlug === filters.brand);
    if (filters.category) list = list.filter((i) => i.categorySlug === filters.category);
    if (filters.type) list = list.filter((i) => i.type === filters.type);
    list = searchItems(list, filters.search);
    return list;
  }, [filters, publishedItems]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(filters.page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const nameFor = (item: CatalogItem) => ({
    org: orgBySlug(item.orgSlug)?.name ?? item.orgSlug,
    cat: pick(state.categories.find((c) => c.slug === item.categorySlug)?.name ?? { bn: "", en: "" }),
  });

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#0346A5] sm:text-[28px]">{t("catalog.heading")}</h1>
          <p className="mt-1 text-[13px] text-[#66777D]">{t("catalog.sub")}</p>
        </div>
        <p className="text-[13px] font-medium text-[#66777D]" aria-live="polite">
          {t("catalog.results", {
            count: filtered.length.toLocaleString(language === "bn" ? "bn-BD" : "en-US"),
          })}
        </p>
      </div>

      <div className="mt-4">
        <FilterChips filters={filters} onChange={apply} />
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label={t("catalog.filters")}>
          <div className="sticky top-40 rounded-2xl border border-[#E2E8EA] bg-white p-4">
            <h2 className="mb-3 text-sm font-bold text-[#0346A5]">{t("catalog.filters")}</h2>
            <FilterControls filters={filters} onChange={apply} />
          </div>
        </aside>

        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="mb-3 flex items-center gap-2 rounded-xl border border-[#E2E8EA] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#17242A] transition hover:bg-[#F7F9FA] lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("catalog.filters")}
          </button>

          {filtered.length > 0 ? (
            <p className="mb-3 text-[12.5px] font-medium text-[#66777D]">
              {t("catalog.showing", {
                from: ((safePage - 1) * PAGE_SIZE + 1).toLocaleString(language === "bn" ? "bn-BD" : "en-US"),
                to: Math.min(safePage * PAGE_SIZE, filtered.length).toLocaleString(
                  language === "bn" ? "bn-BD" : "en-US",
                ),
                count: filtered.length.toLocaleString(language === "bn" ? "bn-BD" : "en-US"),
              })}
            </p>
          ) : null}

          {error ? (
            <ErrorState title={t("errors.errorTitle")} description={t("errors.errorDesc")} onRetry={retry} />
          ) : loading ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title={t("catalog.empty")}
              description={t("catalog.emptyDesc")}
              action={
                <button
                  type="button"
                  onClick={() => apply({ search: "", brand: "", category: "", type: "", page: 1 })}
                  className="rounded-xl bg-[#075ED1] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0346A5]"
                >
                  {t("catalog.clear")}
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {pageItems.map((item) => {
                  const names = nameFor(item);
                  return (
                    <CatalogCard
                      key={item.id}
                      item={item}
                      orgName={names.org}
                      categoryName={names.cat}
                    />
                  );
                })}
              </div>
              <Pagination
                page={safePage}
                totalPages={totalPages}
                onChange={(p) => apply({ ...filters, page: p })}
              />
            </>
          )}
        </div>
      </div>

      <SidePanel open={drawerOpen} onClose={() => setDrawerOpen(false)} label={t("catalog.filters")} side="left">
        <div className="flex items-center justify-between border-b border-[#E2E8EA] px-4 py-3">
          <h2 className="text-base font-bold text-[#0346A5]">{t("catalog.filters")}</h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label={t("common.close")}
            className="rounded-full border border-[#E2E8EA] p-2 text-[#66777D]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <FilterControls filters={filters} onChange={apply} />
        </div>
        <div className="space-y-2 border-t border-[#E2E8EA] p-4">
          <p className="text-center text-[12.5px] font-medium text-[#66777D]">
            {t("catalog.results", {
              count: filtered.length.toLocaleString(language === "bn" ? "bn-BD" : "en-US"),
            })}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => apply({ search: "", brand: "", category: "", type: "", page: 1 })}
              className="rounded-xl border border-[#E2E8EA] px-4 py-2.5 text-[13px] font-semibold text-[#17242A] transition hover:bg-[#F7F9FA]"
            >
              {t("catalog.clear")}
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-xl bg-[#075ED1] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#0346A5]"
            >
              {t("catalog.apply")}
            </button>
          </div>
        </div>
      </SidePanel>
    </div>
  );
}

export { categoriesByOrg };
