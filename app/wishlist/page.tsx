"use client";

import Link from "next/link";
import { ArrowRight, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useCart, useToast, useWishlist } from "@/providers/StoreProvider";
import { products } from "@/data/products";
import { ProductVisual } from "@/components/product/ProductVisual";
import { Breadcrumb, EmptyState } from "@/components/ui/core";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { t, pick, language } = useLanguage();
  const { ids, remove } = useWishlist();
  const { add } = useCart();
  const { push } = useToast();
  usePageTitle(t("wishlist.title"), "Wishlist");

  const items = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb items={[{ label: t("common.home"), href: "/" }, { label: t("wishlist.title") }]} />
      <h1 className="mt-3 text-[22px] font-bold text-[#16339B] sm:text-[28px]">{t("wishlist.title")}</h1>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Heart}
            title={t("wishlist.empty")}
            description={t("wishlist.emptyDesc")}
            action={
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#16339B]"
              >
                {t("wishlist.browse")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => {
            const out = product.stockStatus === "out";
            return (
              <li
                key={product.id}
                className="flex gap-3 rounded-2xl border border-[#E2E8EA] bg-white p-3"
              >
                <Link href={`/product/${product.slug}`} className="shrink-0">
                  <ProductVisual product={product} className="h-20 w-20 rounded-xl" label={false} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/product/${product.slug}`}
                    className="line-clamp-2 text-[13px] font-semibold text-[#17242A] hover:text-[#1D4ED8]"
                  >
                    {pick(product.name)}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-[#66777D]">{product.weight}</p>
                  <p className="mt-1 text-[14px] font-bold text-[#1D4ED8]">
                    {formatPrice(product.price, language)}
                  </p>
                  <div className="mt-auto flex items-center gap-1.5 pt-2">
                    <button
                      type="button"
                      disabled={out}
                      onClick={() => {
                        add(product.id, 1);
                        push(t("toasts.addedToCart"));
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1D4ED8] px-2 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-[#16339B] disabled:cursor-not-allowed disabled:bg-[#E2E8EA] disabled:text-[#66777D]"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {t("wishlist.moveToCart")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        remove(product.id);
                        push(t("toasts.wishlistRemoved"), "info");
                      }}
                      aria-label={t("wishlist.remove")}
                      className="rounded-lg p-1.5 text-[#66777D] transition hover:bg-[#DC2626]/10 hover:text-[#DC2626]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
