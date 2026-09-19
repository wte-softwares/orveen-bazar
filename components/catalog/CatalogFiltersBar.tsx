"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search, X, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface BrandOption {
  slug: string;
  name: string;
}

interface CategoryOption {
  slug: string;
  name: string;
}

interface CatalogFiltersBarProps {
  brands: BrandOption[];
  categories: CategoryOption[];
  currentOrg?: string;
  currentCategory?: string;
  currentType?: string;
  currentSearch?: string;
  currentOffer?: boolean;
}

export function CatalogFiltersBar({
  brands,
  categories,
  currentOrg,
  currentCategory,
  currentType,
  currentSearch = "",
  currentOffer = false,
}: CatalogFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("catalog");

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  // Update a URL query parameter and reset page to 1
  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Always reset page when changing a filter
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    updateParam("q", searchTerm.trim() || null);
  }

  function handleClearFilters() {
    setSearchTerm("");
    router.push(pathname);
  }

  const hasActiveFilters = Boolean(
    currentOrg || currentCategory || currentType || currentSearch || currentOffer
  );

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchPlaceholder")}
            data-testid="catalog-search-input"
            className="pl-10 h-10 rounded-xl bg-[var(--bg-base)] border-[var(--border-default)]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                updateParam("q", null);
              }}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          className="h-10 px-5 rounded-xl bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] font-medium"
        >
          Search
        </Button>
      </form>

      {/* Select Filters & Offers Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-default)]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Brand Selector */}
          <select
            value={currentOrg || "all"}
            onChange={(e) => updateParam("org", e.target.value)}
            className="h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            aria-label={t("filterByBrand")}
          >
            <option value="all">{t("allBrands")}</option>
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Category Selector */}
          <select
            value={currentCategory || "all"}
            onChange={(e) => updateParam("category", e.target.value)}
            className="h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            aria-label={t("filterByCategory")}
          >
            <option value="all">{t("allCategories")}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Type Selector */}
          <select
            value={currentType || "all"}
            onChange={(e) => updateParam("type", e.target.value)}
            className="h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            aria-label={t("filterByType")}
          >
            <option value="all">{t("allTypes")}</option>
            <option value="product">{t("productsOnly")}</option>
            <option value="service">{t("servicesOnly")}</option>
          </select>

          {/* Offers Button */}
          <Button
            type="button"
            variant={currentOffer ? "default" : "outline"}
            size="sm"
            onClick={() => updateParam("offer", currentOffer ? null : "true")}
            className={`h-9 text-xs rounded-lg gap-1.5 ${
              currentOffer
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "border-[var(--border-default)] text-[var(--text-primary)] hover:bg-muted"
            }`}
          >
            <Percent className="h-3.5 w-3.5" />
            <span>{t("offersOnly")}</span>
          </Button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-9 text-xs text-destructive hover:bg-destructive/10 gap-1"
          >
            <X className="h-3.5 w-3.5" />
            <span>{t("clearFilters")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
