"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { searchProducts } from "@/data/products";
import { ProductVisual } from "@/components/product/ProductVisual";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function SearchBar({
  autoFocus = false,
  onSubmitted,
  className,
}: {
  autoFocus?: boolean;
  onSubmitted?: () => void;
  className?: string;
}) {
  const { t, pick, language } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = query.trim().length >= 2 ? searchProducts(query).slice(0, 6) : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (value: string) => {
    const q = value.trim();
    setOpen(false);
    onSubmitted?.();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <div ref={boxRef} className={cn("relative min-w-0", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
      >
        <label htmlFor="site-search" className="sr-only">
          {t("header.searchLabel")}
        </label>
        <div className="flex items-center overflow-hidden rounded-xl border border-[#E2E8EA] bg-[#F5F8FE] transition focus-within:border-[#1D4ED8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1D4ED8]/15">
          <Search className="ml-3 h-4 w-4 shrink-0 text-[#66777D]" aria-hidden="true" />
          <input
            id="site-search"
            ref={inputRef}
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t("header.searchPlaceholder")}
            className="w-full bg-transparent px-2.5 py-2.5 text-[14px] text-[#17242A] placeholder:text-[#66777D]/70 focus:outline-none sm:text-[15px]"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label={t("common.close")}
              className="mr-1 rounded-full p-1.5 text-[#66777D] transition hover:bg-[#E2E8EA]/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="submit"
            className="hidden shrink-0 bg-[#1D4ED8] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#16339B] sm:block"
          >
            {t("header.searchButton")}
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 ? (
        <div className="anim-fade absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-[#E2E8EA] bg-white shadow-xl shadow-[#16339B]/10">
          <p className="border-b border-[#E2E8EA] bg-[#F5F8FE] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#66777D]">
            {t("header.searchSuggestions")}
          </p>
          <ul>
            {suggestions.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                    onSubmitted?.();
                    router.push(`/product/${p.slug}`);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-[#E8F0FE]"
                >
                  <ProductVisual product={p} className="h-10 w-10 shrink-0 rounded-lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-[#17242A]">
                      {pick(p.name)}
                    </span>
                    <span className="block text-[11px] text-[#66777D]">
                      {pick(p.category)} • {p.weight}
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] font-bold text-[#1D4ED8]">
                    {formatPrice(p.price, language)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
