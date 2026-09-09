"use client";

import Link from "next/link";
import { Eye, Heart, ShoppingCart, Zap } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCart, useToast, useUI, useWishlist } from "@/providers/StoreProvider";
import { ProductVisual } from "./ProductVisual";
import { Badge, RatingStars } from "@/components/ui/core";
import { cn, formatNumber, formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { t, pick, language } = useLanguage();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { push } = useToast();
  const { setQuickViewId, setCartOpen } = useUI();

  const out = product.stockStatus === "out";
  const wished = has(product.id);

  const addToCart = () => {
    add(product.id, 1);
    push(t("toasts.addedToCart"));
    setCartOpen(true);
  };

  const buyNow = () => {
    add(product.id, 1);
    window.location.href = "/checkout";
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-[#E2E8EA] bg-white transition hover:-translate-y-0.5 hover:border-[#1D4ED8]/30 hover:shadow-lg hover:shadow-[#16339B]/8",
        compact ? "p-2" : "p-2.5 sm:p-3",
      )}
    >
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="block overflow-hidden rounded-xl"
        >
          <ProductVisual
            product={product}
            className={cn(
              "aspect-square w-full transition duration-300 group-hover:scale-[1.03]",
              out && "opacity-60 saturate-50",
            )}
          />
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1">
          {product.discountPercentage > 0 ? (
            <Badge tone="amber">
              {formatNumber(product.discountPercentage, language)}% {t("common.off")}
            </Badge>
          ) : null}
          {product.newArrival ? <Badge tone="green">{t("common.new")}</Badge> : null}
          {product.bestSeller ? <Badge tone="teal">{t("common.bestSeller")}</Badge> : null}
        </div>

        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => {
              const added = toggle(product.id);
              push(added ? t("toasts.wishlistAdded") : t("toasts.wishlistRemoved"), added ? "success" : "info");
            }}
            aria-label={wished ? t("product.removeWishlist") : t("product.addWishlist")}
            aria-pressed={wished}
            className={cn(
              "rounded-full border p-1.5 shadow-sm transition focus-visible:outline-2 focus-visible:outline-[#1D4ED8]",
              wished
                ? "border-[#DC2626]/30 bg-[#DC2626] text-white"
                : "border-[#E2E8EA] bg-white text-[#66777D] hover:border-[#DC2626]/40 hover:text-[#DC2626]",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", wished && "fill-current")} />
          </button>
          <button
            type="button"
            onClick={() => setQuickViewId(product.id)}
            aria-label={t("product.quickView")}
            className="rounded-full border border-[#E2E8EA] bg-white p-1.5 text-[#66777D] shadow-sm transition hover:border-[#1D4ED8]/40 hover:text-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>

        {out ? (
          <span className="absolute bottom-2 left-2">
            <Badge tone="red">{t("product.outOfStock")}</Badge>
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-2.5">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-[#66777D]">
          {product.brand}
        </p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.4em] text-[13px] font-semibold leading-snug text-[#17242A] sm:text-[13.5px]">
          <Link href={`/product/${product.slug}`} className="transition hover:text-[#1D4ED8]">
            {pick(product.name)}
          </Link>
        </h3>
        <p className="mt-0.5 text-[11px] text-[#66777D]">
          {pick(product.unit)} • {product.weight}
        </p>
        <RatingStars rating={product.rating} className="mt-1" />

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[15px] font-bold text-[#1D4ED8] sm:text-base">
            {formatPrice(product.price, language)}
          </span>
          {product.comparePrice ? (
            <span className="text-[11.5px] text-[#66777D] line-through">
              {formatPrice(product.comparePrice, language)}
            </span>
          ) : null}
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={addToCart}
            disabled={out}
            className={cn(
              "flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11.5px] font-semibold transition focus-visible:outline-2 focus-visible:outline-[#1D4ED8]",
              out
                ? "cursor-not-allowed bg-[#E2E8EA]/60 text-[#66777D]"
                : "bg-[#1D4ED8] text-white hover:bg-[#16339B]",
            )}
          >
            <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t("product.addToCart")}</span>
          </button>
          <button
            type="button"
            onClick={buyNow}
            disabled={out}
            className={cn(
              "flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11.5px] font-semibold transition focus-visible:outline-2 focus-visible:outline-[#2E9E44]",
              out
                ? "cursor-not-allowed border-[#E2E8EA] text-[#66777D]/60"
                : "border-[#2E9E44] text-[#1F7A33] hover:bg-[#2E9E44] hover:text-white",
            )}
          >
            <Zap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t("product.buyNow")}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
