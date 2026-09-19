"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { useComingSoon } from "@/components/common/ComingSoon";
import { getBrandConfig } from "@/lib/site-config";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

export interface ProductCardItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  price: number;
  compare_at_price: number | null;
  organization: { slug: string };
  item_images: { image_path: string; alt_text: string | null }[];
}

/**
 * The catalog item card used across the homepage's per-brand product
 * sections. The cart button is visually real but intentionally inert (see
 * AGENTS.md) — it opens the shared "coming soon" dialog instead of adding
 * anything to a cart, which doesn't exist. The wishlist heart IS real: it
 * calls the wishlist API and sends a signed-out visitor to /login.
 */
export function ProductCard({ item }: { item: ProductCardItem }) {
  const router = useRouter();
  const { trigger } = useComingSoon();
  const t = useTranslations("productCard");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const cover = item.item_images[0];
  const href = `/brands/${item.organization.slug}/${item.slug}`;
  const brand = getBrandConfig(item.organization.slug);

  async function handleSaveToWishlist() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent("/")}`);
        return;
      }
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className="relative overflow-hidden rounded-xl bg-[var(--color-warning-100)]">
        <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-white/85 px-2 py-1 text-[10px] font-bold text-[var(--brand-primary)] shadow-sm">
          {item.type === "service" ? t("typeService") : t("typeProduct")}
        </span>
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleSaveToWishlist}
            aria-label={saved ? t("savedToWishlist") : t("saveToWishlist")}
            aria-pressed={saved}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-default)] bg-white/90 shadow-sm transition hover:bg-white"
          >
            <Heart
              className={cn("h-4 w-4", saved ? "fill-[var(--brand-secondary)] text-[var(--brand-secondary)]" : "text-[var(--text-secondary)]")}
            />
          </button>
          <Link
            href={href}
            aria-label={`${t("viewItem")}: ${item.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-default)] bg-white/90 text-[var(--text-secondary)] shadow-sm transition hover:bg-white hover:text-[var(--brand-primary)]"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
        <Link href={href} className="block">
        {cover ? (
          <Image
            src={publicAssetUrl(cover.image_path)}
            alt={cover.alt_text ?? item.title}
            width={480}
            height={500}
            className="aspect-[1/1.04] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex aspect-[1/1.04] w-full items-center justify-center text-xs text-[var(--text-muted)]">
            {t("noImage")}
          </div>
        )}
        </Link>
      </div>

      <p className="mt-3 text-[10px] font-bold tracking-wide text-[var(--text-secondary)] uppercase">
        {brand?.name ?? item.organization.slug}
      </p>
      <Link href={href} className="mt-1 min-h-10 text-sm leading-5 font-bold text-[var(--text-primary)] hover:text-[var(--brand-primary)] hover:underline">
        {item.title}
      </Link>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-heading text-lg font-extrabold text-[var(--brand-primary)]">
          ৳ {item.price.toLocaleString("en-BD")}
        </span>
        {item.compare_at_price ? (
          <span className="text-xs font-medium text-[var(--text-muted)] line-through">
            ৳ {item.compare_at_price.toLocaleString("en-BD")}
          </span>
        ) : null}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
        <button
          type="button"
          onClick={() => trigger("Add to cart")}
          aria-label="Add to cart (coming soon)"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-primary)] px-2 text-xs font-bold text-white transition hover:bg-[var(--brand-primary-hover)]"
        >
          <ShoppingCart className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">{t("addToCart")}</span>
        </button>
        <Link
          href={href}
          aria-label={`${t("details")}: ${item.title}`}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--brand-secondary)] px-2 text-xs font-bold text-[var(--brand-secondary)] transition hover:bg-[var(--color-secondary-50)]"
        >
          <Eye className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">{t("details")}</span>
        </Link>
      </div>
    </article>
  );
}
