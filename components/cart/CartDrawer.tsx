"use client";

import Link from "next/link";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCart, useToast, useUI } from "@/providers/StoreProvider";
import { SidePanel, QuantitySelector, EmptyState } from "@/components/ui/core";
import { ProductVisual } from "@/components/product/ProductVisual";
import { X, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { t, pick, language } = useLanguage();
  const { cartOpen, setCartOpen } = useUI();
  const { lines, subtotal, setQty, remove, count } = useCart();
  const { push } = useToast();

  return (
    <SidePanel open={cartOpen} onClose={() => setCartOpen(false)} label={t("cart.title")}>
      <div className="flex items-center justify-between border-b border-[#E2E8EA] px-4 py-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#16339B]">
          <ShoppingBag className="h-4 w-4" />
          {t("cart.title")}
          <span className="text-[13px] font-medium text-[#66777D]">
            ({t("cart.items", { count: count.toLocaleString(language === "bn" ? "bn-BD" : "en-US") })})
          </span>
        </h2>
        <button
          type="button"
          onClick={() => setCartOpen(false)}
          aria-label={t("common.close")}
          className="rounded-full border border-[#E2E8EA] p-2 text-[#66777D] transition hover:bg-[#E8F0FE]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            icon={ShoppingBag}
            title={t("cart.empty")}
            description={t("cart.emptyDesc")}
            action={
              <Link
                href="/shop"
                onClick={() => setCartOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16339B]"
              >
                {t("cart.browse")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-[#E2E8EA] overflow-y-auto px-4">
            {lines.map((line) => (
              <li key={line.product.id} className="flex gap-3 py-3.5">
                <Link href={`/product/${line.product.slug}`} onClick={() => setCartOpen(false)}>
                  <ProductVisual
                    product={line.product}
                    className="h-16 w-16 shrink-0 rounded-xl"
                    label={false}
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13px] font-semibold text-[#17242A]">
                    {pick(line.product.name)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#66777D]">
                    {formatPrice(line.product.price, language)} • {line.product.weight}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantitySelector
                      compact
                      value={line.qty}
                      max={Math.max(line.product.stock, 1)}
                      onChange={(next) => {
                        setQty(line.product.id, next);
                        push(t("toasts.qtyUpdated"), "info");
                      }}
                    />
                    <span className="text-[13px] font-bold text-[#1D4ED8]">
                      {formatPrice(line.product.price * line.qty, language)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        remove(line.product.id);
                        push(t("toasts.removedFromCart"), "info");
                      }}
                      aria-label={t("cart.remove")}
                      className="rounded-lg p-1.5 text-[#66777D] transition hover:bg-[#DC2626]/10 hover:text-[#DC2626]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-3 border-t border-[#E2E8EA] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#66777D]">{t("cart.subtotal")}</span>
              <span className="text-base font-extrabold text-[#16339B]">
                {formatPrice(subtotal, language)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/cart"
                onClick={() => setCartOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8EA] px-3 py-2.5 text-[13px] font-semibold text-[#17242A] transition hover:bg-[#F5F8FE]"
              >
                {t("header.viewCart")}
              </Link>
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-3 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#16339B]"
              >
                <ShoppingCart className="h-4 w-4" />
                {t("header.checkout")}
              </Link>
            </div>
          </div>
        </>
      )}
    </SidePanel>
  );
}
