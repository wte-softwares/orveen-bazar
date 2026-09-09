"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useCart, useToast } from "@/providers/StoreProvider";
import { ProductVisual } from "@/components/product/ProductVisual";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Breadcrumb, EmptyState, QuantitySelector } from "@/components/ui/core";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { t, pick, language } = useLanguage();
  const { lines, setQty, remove, clear, count } = useCart();
  const { push } = useToast();
  usePageTitle(t("cart.title"), "Your Cart");

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("cart.title") }]} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-bold text-[#16339B] sm:text-[28px]">
          {t("cart.title")}{" "}
          <span className="text-[15px] font-medium text-[#66777D]">
            ({t("cart.items", { count: count.toLocaleString(language === "bn" ? "bn-BD" : "en-US") })})
          </span>
        </h1>
        {lines.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              clear();
              push(t("toasts.cartCleared"), "info");
            }}
            className="text-[13px] font-semibold text-[#DC2626] hover:underline"
          >
            {t("cart.clearCart")}
          </button>
        ) : null}
      </div>

      {lines.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={ShoppingBag}
            title={t("cart.empty")}
            description={t("cart.emptyDesc")}
            action={
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#16339B]"
              >
                {t("cart.browse")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-[#E2E8EA] bg-white">
            {/* desktop header */}
            <div className="hidden grid-cols-[1fr_120px_140px_110px_44px] gap-3 border-b border-[#E2E8EA] bg-[#F5F8FE] px-4 py-2.5 text-[12px] font-bold uppercase tracking-wide text-[#66777D] md:grid">
              <span>{t("cart.product")}</span>
              <span>{t("cart.price")}</span>
              <span>{t("cart.quantity")}</span>
              <span className="text-right">{t("cart.total")}</span>
              <span />
            </div>
            <ul className="divide-y divide-[#E2E8EA]">
              {lines.map((line) => (
                <li
                  key={line.product.id}
                  className="grid grid-cols-[1fr_auto] gap-3 px-4 py-4 md:grid-cols-[1fr_120px_140px_110px_44px] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Link href={`/product/${line.product.slug}`} className="shrink-0">
                      <ProductVisual
                        product={line.product}
                        className="h-16 w-16 rounded-xl sm:h-20 sm:w-20"
                        label={false}
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/product/${line.product.slug}`}
                        className="line-clamp-2 text-[13.5px] font-semibold text-[#17242A] transition hover:text-[#1D4ED8]"
                      >
                        {pick(line.product.name)}
                      </Link>
                      <p className="mt-0.5 text-[11.5px] text-[#66777D]">
                        {line.product.brand} • {line.product.weight}
                      </p>
                      <p className="mt-1 text-[13px] font-bold text-[#1D4ED8] md:hidden">
                        {formatPrice(line.product.price * line.qty, language)}
                      </p>
                    </div>
                  </div>
                  <span className="hidden text-[13px] text-[#66777D] md:block">
                    {formatPrice(line.product.price, language)}
                  </span>
                  <div className="md:justify-self-start">
                    <QuantitySelector
                      value={line.qty}
                      max={Math.max(line.product.stock, 1)}
                      onChange={(next) => {
                        setQty(line.product.id, next);
                        push(t("toasts.qtyUpdated"), "info");
                      }}
                    />
                  </div>
                  <span className="hidden text-right text-[13.5px] font-bold text-[#17242A] md:block">
                    {formatPrice(line.product.price * line.qty, language)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      remove(line.product.id);
                      push(t("toasts.removedFromCart"), "info");
                    }}
                    aria-label={t("cart.remove")}
                    className="justify-self-end rounded-lg p-2 text-[#66777D] transition hover:bg-[#DC2626]/10 hover:text-[#DC2626]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <OrderSummary />
            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#2E9E44] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#1F7A33]"
            >
              {t("cart.checkout")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8EA] bg-white px-5 py-3 text-[14px] font-semibold text-[#17242A] transition hover:bg-[#F5F8FE]"
            >
              {t("cart.continue")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
