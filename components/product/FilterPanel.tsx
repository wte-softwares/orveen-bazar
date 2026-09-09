"use client";

import { Star, X } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { categories } from "@/data/categories";
import { SidePanel } from "@/components/ui/core";
import { cn, formatNumber } from "@/lib/utils";

export interface FilterState {
  cats: string[];
  brands: string[];
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  minRating: number;
  onSale: boolean;
}

export const emptyFilters: FilterState = {
  cats: [],
  brands: [],
  minPrice: "",
  maxPrice: "",
  inStock: false,
  minRating: 0,
  onSale: false,
};

export type SortKey = "popular" | "newest" | "priceAsc" | "priceDesc" | "discount";

export function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  const { t } = useLanguage();
  const options: { key: SortKey; label: string }[] = [
    { key: "popular", label: t("shop.sortPopular") },
    { key: "newest", label: t("shop.sortNewest") },
    { key: "priceAsc", label: t("shop.sortPriceAsc") },
    { key: "priceDesc", label: t("shop.sortPriceDesc") },
    { key: "discount", label: t("shop.sortDiscount") },
  ];
  return (
    <label className="flex items-center gap-2 text-[13px] font-medium text-[#66777D]">
      <span className="hidden shrink-0 sm:block">{t("shop.sort")}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="rounded-xl border border-[#E2E8EA] bg-white px-3 py-2 text-[13px] font-semibold text-[#17242A] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/15"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  right,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  right?: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-[13px] text-[#17242A] transition hover:bg-[#F5F8FE]">
      <span className="flex min-w-0 items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 shrink-0 rounded border-[#E2E8EA] accent-[#1D4ED8]"
        />
        <span className="truncate">{label}</span>
      </span>
      {right}
    </label>
  );
}

export function FilterControls({
  state,
  onChange,
  brands,
}: {
  state: FilterState;
  onChange: (next: FilterState) => void;
  brands: string[];
}) {
  const { t, pick, language } = useLanguage();
  const sellable = categories.filter((c) => !c.comingSoon);

  const toggleIn = (list: string[], value: string) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#66777D]">
          {t("shop.category")}
        </h3>
        <div className="max-h-56 space-y-0.5 overflow-y-auto pr-1">
          {sellable.map((cat) => (
            <CheckRow
              key={cat.slug}
              label={pick(cat.name)}
              checked={state.cats.includes(cat.slug)}
              onChange={() => onChange({ ...state, cats: toggleIn(state.cats, cat.slug) })}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#66777D]">
          {t("shop.price")}
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={state.minPrice}
            onChange={(e) => onChange({ ...state, minPrice: e.target.value })}
            placeholder={t("shop.min")}
            aria-label={t("shop.min")}
            className="w-full rounded-xl border border-[#E2E8EA] px-3 py-2 text-[13px] focus:border-[#1D4ED8] focus:outline-none"
          />
          <span className="text-[#66777D]">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={state.maxPrice}
            onChange={(e) => onChange({ ...state, maxPrice: e.target.value })}
            placeholder={t("shop.max")}
            aria-label={t("shop.max")}
            className="w-full rounded-xl border border-[#E2E8EA] px-3 py-2 text-[13px] focus:border-[#1D4ED8] focus:outline-none"
          />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#66777D]">
          {t("shop.availability")}
        </h3>
        <CheckRow
          label={t("shop.inStockOnly")}
          checked={state.inStock}
          onChange={() => onChange({ ...state, inStock: !state.inStock })}
        />
        <CheckRow
          label={t("shop.onSaleOnly")}
          checked={state.onSale}
          onChange={() => onChange({ ...state, onSale: !state.onSale })}
        />
      </section>

      <section>
        <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#66777D]">
          {t("shop.rating")}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ ...state, minRating: state.minRating === r ? 0 : r })}
              aria-pressed={state.minRating === r}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition",
                state.minRating === r
                  ? "border-[#1D4ED8] bg-[#1D4ED8] text-white"
                  : "border-[#E2E8EA] text-[#17242A] hover:border-[#1D4ED8]/40",
              )}
            >
              <Star className="h-3 w-3 fill-[#FFC800] text-[#FFC800]" />
              {formatNumber(r, language)}+ {t("shop.andUp")}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wider text-[#66777D]">
          {t("shop.brand")}
        </h3>
        <div className="space-y-0.5">
          {brands.map((brand) => (
            <CheckRow
              key={brand}
              label={brand}
              checked={state.brands.includes(brand)}
              onChange={() => onChange({ ...state, brands: toggleIn(state.brands, brand) })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function MobileFilterDrawer({
  open,
  onClose,
  state,
  onChange,
  brands,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  state: FilterState;
  onChange: (next: FilterState) => void;
  brands: string[];
  onClear: () => void;
}) {
  const { t } = useLanguage();
  return (
    <SidePanel open={open} onClose={onClose} label={t("shop.filters")} side="left">
      <div className="flex items-center justify-between border-b border-[#E2E8EA] px-4 py-3">
        <h2 className="text-base font-bold text-[#16339B]">{t("shop.filters")}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close")}
          className="rounded-full border border-[#E2E8EA] p-2 text-[#66777D]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <FilterControls state={state} onChange={onChange} brands={brands} />
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-[#E2E8EA] p-4">
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-[#E2E8EA] px-4 py-2.5 text-sm font-semibold text-[#17242A] transition hover:bg-[#F5F8FE]"
        >
          {t("shop.clearAll")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16339B]"
        >
          {t("common.close")}
        </button>
      </div>
    </SidePanel>
  );
}
