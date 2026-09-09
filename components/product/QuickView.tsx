"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCart, useToast, useUI } from "@/providers/StoreProvider";
import { productById } from "@/data/products";
import { Modal, QuantitySelector, Badge, RatingStars } from "@/components/ui/core";
import { ProductVisual } from "./ProductVisual";
import { formatNumber, formatPrice } from "@/lib/utils";

export function QuickView() {
  const { t, pick, language } = useLanguage();
  const { quickViewId, setQuickViewId } = useUI();
  const { add } = useCart();
  const { push } = useToast();
  const [qty, setQty] = useState(1);

  const product = quickViewId ? productById(quickViewId) : undefined;

  const close = () => {
    setQuickViewId(null);
    setQty(1);
  };

  if (!product) return null;
  const out = product.stockStatus === "out";

  return (
    <Modal open={Boolean(product)} onClose={close} label={pick(product.name)} size="lg">
      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        <ProductVisual product={product} className="aspect-square w-full rounded-2xl" />
        <div className="flex flex-col">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#66777D]">
            {product.brand}
          </p>
          <h2 className="mt-1 pr-8 text-lg font-bold leading-snug text-[#16339B]">
            {pick(product.name)}
          </h2>
          <RatingStars rating={product.rating} count={product.reviewCount} className="mt-1.5" />

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#1D4ED8]">
              {formatPrice(product.price, language)}
            </span>
            {product.comparePrice ? (
              <span className="text-sm text-[#66777D] line-through">
                {formatPrice(product.comparePrice, language)}
              </span>
            ) : null}
            {product.discountPercentage > 0 ? (
              <Badge tone="amber">
                {formatNumber(product.discountPercentage, language)}% {t("common.off")}
              </Badge>
            ) : null}
          </div>

          <p className="mt-2">
            {out ? (
              <Badge tone="red">{t("product.outOfStock")}</Badge>
            ) : (
              <Badge tone="green">{t("product.inStock")}</Badge>
            )}
          </p>

          <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-[#66777D]">
            {pick(product.shortDescription)}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-[13px] font-semibold text-[#17242A]">
              {t("product.quantity")}
            </span>
            <QuantitySelector value={qty} onChange={setQty} max={Math.max(product.stock, 1)} />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              disabled={out}
              onClick={() => {
                add(product.id, qty);
                push(t("toasts.addedToCart"));
                close();
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16339B] disabled:cursor-not-allowed disabled:bg-[#E2E8EA] disabled:text-[#66777D]"
            >
              <ShoppingCart className="h-4 w-4" />
              {t("product.addToCart")}
            </button>
            <Link
              href={`/product/${product.slug}`}
              onClick={close}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8EA] px-4 py-2.5 text-sm font-semibold text-[#1D4ED8] transition hover:bg-[#E8F0FE]"
            >
              {t("product.viewDetails")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
