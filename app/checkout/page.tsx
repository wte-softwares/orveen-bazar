"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useCart } from "@/providers/StoreProvider";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Breadcrumb, EmptyState } from "@/components/ui/core";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { lines } = useCart();
  usePageTitle(t("checkout.title"), "Checkout");

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("cart.title"), href: "/cart" }, { label: t("checkout.title") }]} />
      <h1 className="mt-3 text-[22px] font-bold text-[#16339B] sm:text-[28px]">{t("checkout.title")}</h1>
      <p className="mt-1 text-[13px] text-[#66777D]">{t("checkout.sub")}</p>

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
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <CheckoutForm />
          <div className="space-y-3 lg:sticky lg:top-32">
            <OrderSummary />
            <Link
              href="/cart"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8EA] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#17242A] transition hover:bg-[#F5F8FE]"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("checkout.backToCart")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
