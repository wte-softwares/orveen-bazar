"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { useComingSoon } from "@/components/common/ComingSoon";

export interface ProductCardItem {
  id: string;
  slug: string;
  title: string;
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
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const cover = item.item_images[0];
  const href = `/brands/${item.organization.slug}/${item.slug}`;

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
    <div className="group relative flex flex-col gap-2.5 rounded-[var(--radius-lg,14px)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5 transition hover:shadow-[var(--shadow-md)]">
      <button
        type="button"
        onClick={handleSaveToWishlist}
        aria-label={saved ? "Saved to wishlist" : "Save to wishlist"}
        aria-pressed={saved}
        disabled={saving}
        className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]"
      >
        <Heart
          className={cn("h-3.5 w-3.5", saved ? "fill-[var(--brand-secondary)] text-[var(--brand-secondary)]" : "text-[var(--text-secondary)]")}
        />
      </button>

      <Link href={href} className="block overflow-hidden rounded-[10px] bg-[var(--bg-subtle)]">
        {cover ? (
          <Image
            src={publicAssetUrl(cover.image_path)}
            alt={cover.alt_text ?? item.title}
            width={300}
            height={300}
            className="aspect-square w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center text-xs text-[var(--text-muted)]">
            No image
          </div>
        )}
      </Link>

      <Link href={href} className="min-h-8.5 text-[13px] leading-tight font-semibold hover:underline">
        {item.title}
      </Link>

      <div className="mt-0.5 flex items-center justify-between">
        <span className="font-heading text-[15px] font-bold">
          ৳ {item.price.toLocaleString("en-BD")}
          {item.compare_at_price ? (
            <span className="ml-1.5 text-xs font-normal text-[var(--text-muted)] line-through">
              ৳ {item.compare_at_price.toLocaleString("en-BD")}
            </span>
          ) : null}
        </span>
        <button
          type="button"
          onClick={() => trigger("Add to cart")}
          aria-label="Add to cart (coming soon)"
          className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white transition hover:bg-[var(--brand-primary-hover)]"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
