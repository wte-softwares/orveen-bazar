"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Truck,
  Package,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useCart, useRecent, useToast, useWishlist } from "@/providers/StoreProvider";
import { productBySlug, products } from "@/data/products";
import { ProductVisual } from "@/components/product/ProductVisual";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  Breadcrumb,
  Badge,
  QuantitySelector,
  RatingStars,
  SectionHeading,
  WhatsAppIcon,
} from "@/components/ui/core";
import { cn, formatNumber, formatPrice, whatsappLink } from "@/lib/utils";

const tabs = ["description", "specs", "delivery", "reviews"] as const;
type TabKey = (typeof tabs)[number];

export function ProductPageClient({ slug }: { slug: string }) {
  const { t, pick, language } = useLanguage();
  const product = productBySlug(slug);
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { push } = useToast();
  const { push: pushRecent } = useRecent();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<TabKey>("description");

  usePageTitle(
    product ? `${pick(product.name)} | ORVEEN BAZZAR` : "Product | ORVEEN BAZZAR",
    product ? `${product.name.en} | ORVEEN BAZZAR` : "Product | ORVEEN BAZZAR",
  );

  const recentIds = useRecentIdsExcept(product?.id ?? "");

  useEffect(() => {
    if (product) pushRecent(product.id);
  }, [product, pushRecent]);

  if (!product) {
    notFound();
    return null;
  }

  const out = product.stockStatus === "out";
  const wished = has(product.id);
  const related = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);
  const addToCart = () => {
    add(product.id, qty);
    push(t("toasts.addedToCart"));
  };

  const buyNow = () => {
    add(product.id, qty);
    window.location.href = "/checkout";
  };

  const tabLabels: Record<TabKey, string> = {
    description: t("product.description"),
    specs: t("product.specifications"),
    delivery: t("product.deliveryInfo"),
    reviews: t("product.reviewsTab"),
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <Breadcrumb
        items={[
          { label: t("common.home"), href: "/" },
          { label: t("nav.categories"), href: "/shop" },
          { label: pick(product.category), href: `/category/${product.categorySlug}` },
          { label: pick(product.name) },
        ]}
      />

      <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:gap-10">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-[#E2E8EA] bg-white">
            <ProductVisual product={product} className="aspect-square w-full" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <ProductVisual
                key={i}
                product={product}
                label={i === 0}
                className={cn(
                  "aspect-square rounded-xl border border-[#E2E8EA]",
                  i !== 0 && "opacity-80",
                )}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#66777D]">
            {product.brand}
          </p>
          <h1 className="mt-1 text-[22px] font-bold leading-snug text-[#16339B] sm:text-[28px]">
            {pick(product.name)}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <RatingStars rating={product.rating} count={product.reviewCount} />
            <span className="text-[12px] text-[#66777D]">
              {t("product.sku")}: {product.sku}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
            <span className="text-[30px] font-extrabold text-[#1D4ED8]">
              {formatPrice(product.price, language)}
            </span>
            {product.comparePrice ? (
              <span className="text-base text-[#66777D] line-through">
                {formatPrice(product.comparePrice, language)}
              </span>
            ) : null}
            {product.discountPercentage > 0 ? (
              <Badge tone="amber">
                {formatNumber(product.discountPercentage, language)}% {t("common.off")}
              </Badge>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {out ? (
              <Badge tone="red">{t("product.outOfStock")}</Badge>
            ) : (
              <>
                <Badge tone="green">{t("product.inStock")}</Badge>
                {product.stock <= 5 ? (
                  <Badge tone="amber">
                    {t("product.stockLeft", { count: formatNumber(product.stock, language) })}
                  </Badge>
                ) : null}
              </>
            )}
            <Badge tone="teal">{pick(product.category)}</Badge>
          </div>

          <p className="mt-4 text-[14px] leading-relaxed text-[#66777D]">
            {pick(product.shortDescription)}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-semibold text-[#17242A]">{t("product.quantity")}</span>
            <QuantitySelector value={qty} onChange={setQty} max={Math.max(product.stock, 1)} />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={addToCart}
              disabled={out}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#16339B] disabled:cursor-not-allowed disabled:bg-[#E2E8EA] disabled:text-[#66777D]"
            >
              <ShoppingCart className="h-4 w-4" />
              {t("product.addToCart")}
            </button>
            <button
              type="button"
              onClick={buyNow}
              disabled={out}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#2E9E44] px-5 py-3 text-[14px] font-bold text-white transition hover:bg-[#1F7A33] disabled:cursor-not-allowed disabled:bg-[#E2E8EA] disabled:text-[#66777D]"
            >
              <Zap className="h-4 w-4" />
              {t("product.buyNow")}
            </button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                const added = toggle(product.id);
                push(added ? t("toasts.wishlistAdded") : t("toasts.wishlistRemoved"), added ? "success" : "info");
              }}
              aria-pressed={wished}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-[13.5px] font-semibold transition",
                wished
                  ? "border-[#DC2626] bg-[#DC2626]/10 text-[#B91C1C]"
                  : "border-[#E2E8EA] text-[#17242A] hover:border-[#DC2626]/40 hover:text-[#DC2626]",
              )}
            >
              <Heart className={cn("h-4 w-4", wished && "fill-current")} />
              {wished ? t("product.removeWishlist") : t("product.addWishlist")}
            </button>
            <a
              href={whatsappLink(
                language === "bn"
                  ? `আসসালামু আলাইকুম, আমি "${product.name.bn}" পণ্যটি সম্পর্কে জানতে চাই।`
                  : `Hello, I would like to know more about "${product.name.en}".`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#2E9E44]/50 bg-[#2E9E44]/10 px-5 py-2.5 text-[13.5px] font-semibold text-[#1F7A33] transition hover:bg-[#2E9E44]/20"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t("product.whatsappAsk")}
            </a>
          </div>

          <ul className="mt-5 grid gap-2 rounded-2xl border border-[#E2E8EA] bg-white p-4 text-[12.5px] text-[#66777D] sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#1D4ED8]" />
              {t("trust.quality")}
            </li>
            <li className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#1D4ED8]" />
              {pick(product.unit)} • {product.weight}
            </li>
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#1D4ED8]" />
              {t("order.deliveryTbd")}
            </li>
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <section className="mt-10">
        <div role="tablist" aria-label={t("product.description")} className="flex flex-wrap gap-1.5 border-b border-[#E2E8EA]">
          {tabs.map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "-mb-px rounded-t-xl border-b-2 px-4 py-2.5 text-[13.5px] font-semibold transition",
                tab === key
                  ? "border-[#1D4ED8] bg-[#E8F0FE] text-[#1D4ED8]"
                  : "border-transparent text-[#66777D] hover:text-[#1D4ED8]",
              )}
            >
              {tabLabels[key]}
            </button>
          ))}
        </div>
        <div className="rounded-b-2xl rounded-tr-2xl border border-t-0 border-[#E2E8EA] bg-white p-5">
          {tab === "description" ? (
            <p className="max-w-3xl text-[14px] leading-relaxed text-[#17242A]">
              {pick(product.description)}
            </p>
          ) : null}
          {tab === "specs" ? (
            <dl className="grid max-w-2xl gap-x-8 gap-y-2.5 text-[13.5px] sm:grid-cols-2">
              {[
                [t("product.brand"), product.brand],
                [t("product.category"), pick(product.category)],
                [t("product.unit"), `${pick(product.unit)} (${product.weight})`],
                [t("product.sku"), product.sku],
                [t("product.price"), formatPrice(product.price, language)],
                [
                  t("shop.availability"),
                  out ? t("product.outOfStock") : t("product.inStock"),
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-dashed border-[#E2E8EA] pb-2">
                  <dt className="text-[#66777D]">{label}</dt>
                  <dd className="font-semibold text-[#17242A]">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {tab === "delivery" ? (
            <div className="max-w-2xl space-y-2 text-[13.5px] leading-relaxed text-[#66777D]">
              <p>{t("product.deliveryNote")}</p>
              <ul className="list-inside list-disc space-y-1">
                <li>{t("checkout.insideDhaka")}</li>
                <li>{t("checkout.outsideDhaka")}</li>
              </ul>
            </div>
          ) : null}
          {tab === "reviews" ? (
            <div className="max-w-2xl">
              <p className="text-[14px] font-semibold text-[#17242A]">{t("product.noReviews")}</p>
              <p className="mt-1 text-[13px] text-[#66777D]">{t("product.noReviewsDesc")}</p>
            </div>
          ) : null}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-12">
          <SectionHeading title={t("product.related")} />
          <ProductGrid products={related} />
        </section>
      ) : null}

      {recentIds.length > 0 ? (
        <section className="mt-12">
          <SectionHeading title={t("product.recentlyViewed")} />
          <ProductGrid
            products={recentIds
              .map((id) => products.find((p) => p.id === id))
              .filter((p): p is NonNullable<typeof p> => Boolean(p))
              .slice(0, 4)}
          />
        </section>
      ) : null}
    </div>
  );
}

/* small helper hook kept outside render flow */
import { useRecent as useRecentStore } from "@/providers/StoreProvider";
function useRecentIdsExcept(id: string): string[] {
  const { ids } = useRecentStore();
  return ids.filter((x) => x !== id);
}
