"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart, AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { getBrandConfig } from "@/lib/site-config";

export interface WishlistRow {
  created_at: string;
  unavailable: boolean;
  item: {
    id: string;
    slug: string;
    title: string;
    price: number;
    compare_at_price: number | null;
    status: string;
    item_images: Array<{
      image_path: string;
      sort_order: number;
    }>;
    organization: {
      slug: string;
      is_active: boolean;
    };
  } | null;
}

interface WishlistGridProps {
  initialItems: WishlistRow[];
}

export function WishlistGrid({ initialItems }: WishlistGridProps) {
  const t = useTranslations("account");
  const [items, setItems] = useState<WishlistRow[]>(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(itemId: string) {
    if (removingId) return;
    setRemovingId(itemId);

    // Optimistically update local list
    const previousItems = items;
    setItems((curr) => curr.filter((row) => row.item?.id !== itemId));

    try {
      const res = await fetch(`/api/v1/wishlist/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        // Rollback on failure
        setItems(previousItems);
      }
    } catch {
      setItems(previousItems);
    } finally {
      setRemovingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] p-12 text-center bg-[var(--bg-surface)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-4">
          <Heart className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          {t("wishlistEmpty")}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          {t("wishlistEmptyHelp")}
        </p>
        <div className="mt-6">
          <Button
            nativeButton={false}
            render={<Link href="/catalog" />}
            className="rounded-xl bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] font-semibold text-xs px-5 h-10 gap-2 shadow-xs"
          >
            <span>{t("browseCatalog")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <strong className="text-foreground">{items.length}</strong> {t("totalSavedItems")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((row) => {
          const item = row.item;
          if (!item) return null;

          const coverImage = item.item_images?.[0];
          const brandConfig = getBrandConfig(item.organization?.slug ?? "");
          const isUnavailable = row.unavailable;

          return (
            <div
              key={item.id}
              data-testid={`wishlist-card-${item.id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-2xs transition hover:shadow-sm"
            >
              <div>
                {/* Image / Thumbnail Container */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/40 border border-[var(--border-default)]">
                  {coverImage ? (
                    <Image
                      src={publicAssetUrl(coverImage.image_path)}
                      alt={item.title}
                      fill
                      className={`object-cover transition duration-300 group-hover:scale-105 ${
                        isUnavailable ? "grayscale opacity-50" : ""
                      }`}
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}

                  {/* Unavailable Badge */}
                  {isUnavailable && (
                    <div className="absolute inset-x-2 top-2 z-10">
                      <Badge
                        variant="secondary"
                        className="w-full justify-center bg-amber-500/90 text-white font-semibold text-[10px] gap-1 shadow-xs"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        <span>{t("itemUnavailable")}</span>
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Info Container */}
                <div className="pt-3 space-y-1.5">
                  {/* Brand Tag */}
                  {brandConfig && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                      {brandConfig.name}
                    </span>
                  )}

                  {/* Title */}
                  <h4 className="line-clamp-2 text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition">
                    {item.title}
                  </h4>

                  {/* Price (display-only per AGENTS.md) */}
                  <div className="pt-0.5">
                    <span className="text-sm font-bold font-heading text-[var(--brand-primary)]">
                      ৳ {item.price.toLocaleString("en-BD")}
                    </span>
                    {item.compare_at_price && item.compare_at_price > item.price ? (
                      <span className="ml-2 text-xs text-muted-foreground line-through">
                        ৳ {item.compare_at_price.toLocaleString("en-BD")}
                      </span>
                    ) : null}
                  </div>

                  {isUnavailable && (
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 pt-1 leading-tight">
                      {t("itemUnavailableHelp")}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-3 border-t border-[var(--border-default)] flex items-center justify-between gap-2">
                {!isUnavailable ? (
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={
                      <Link
                        href={`/brands/${item.organization.slug}/${item.slug}`}
                        aria-label={`View ${item.title}`}
                      />
                    }
                    className="h-8 flex-1 rounded-lg text-xs font-semibold gap-1"
                  >
                    <span>{t("viewItem")}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}

                <Button
                  size="icon-sm"
                  variant="outline"
                  data-testid={`wishlist-remove-btn-${item.id}`}
                  onClick={() => handleRemove(item.id)}
                  disabled={removingId === item.id}
                  className="h-8 w-8 rounded-lg border-destructive/20 text-destructive hover:bg-destructive/10"
                  aria-label={t("removeItem")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
