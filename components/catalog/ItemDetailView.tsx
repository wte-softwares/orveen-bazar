"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  PhoneCall,
  Share2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  ZoomIn,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { useComingSoon } from "@/components/common/ComingSoon";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { ProductImagePlaceholder } from "@/components/catalog/ProductImagePlaceholder";
import type { BrandConfig } from "@/lib/site-config";

export interface DetailCatalogItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: "product" | "service";
  price: number;
  compare_at_price: number | null;
  organization: { slug: string; is_active: boolean };
  category: { slug: string; name: string };
  item_images: Array<{
    image_path: string;
    alt_text: string | null;
    sort_order: number;
  }>;
  item_variants: Array<{
    id: string;
    label: string;
    value: string;
    sort_order: number;
  }>;
}

interface ItemDetailViewProps {
  item: DetailCatalogItem;
  brand: BrandConfig;
}

export function ItemDetailView({ item, brand }: ItemDetailViewProps) {
  const router = useRouter();
  const { trigger } = useComingSoon();
  const tCatalog = useTranslations("catalog");
  const tDetails = useTranslations("itemDetails");
  const tCard = useTranslations("productCard");

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    item.item_variants[0]?.id ?? null
  );
  const [savedWishlist, setSavedWishlist] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const images = item.item_images.length > 0 ? item.item_images : [];
  const currentImage = images[selectedImageIndex] ?? null;

  async function handleToggleWishlist() {
    if (savingWishlist) return;
    setSavingWishlist(true);
    try {
      const res = await fetch("/api/v1/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      if (res.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(`/brands/${brand.slug}/${item.slug}`)}`);
        return;
      }
      if (res.ok) {
        setSavedWishlist(true);
      }
    } finally {
      setSavingWishlist(false);
    }
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  // Discount percentage calculation for display
  const hasDiscount = Boolean(item.compare_at_price && item.compare_at_price > item.price);
  const discountPercent = hasDiscount
    ? Math.round((((item.compare_at_price! - item.price) / item.compare_at_price!) * 100))
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalog" className="hover:text-foreground">
          {tCatalog("catalogTitle")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/brands/${brand.slug}`} className="hover:text-foreground font-medium text-foreground">
          {brand.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-muted-foreground truncate max-w-[200px]">{item.title}</span>
      </nav>

      {/* Main Product / Service Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Cover Display */}
          <div className="group relative aspect-square w-full rounded-2xl border border-[var(--border-default)] bg-muted/40 overflow-hidden shadow-xs">
            {currentImage ? (
              <>
                <Image
                  src={publicAssetUrl(currentImage.image_path)}
                  alt={currentImage.alt_text || item.title}
                  fill
                  priority
                  className="object-cover transition duration-300 group-hover:scale-105"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 dark:bg-zinc-900/90 text-foreground shadow-sm transition opacity-0 group-hover:opacity-100 hover:scale-110 focus-visible:opacity-100"
                  aria-label="Zoom image"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </>
            ) : (
              <ProductImagePlaceholder />
            )}

            {/* Type badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary" className="bg-white/90 dark:bg-zinc-900/90 shadow-xs font-semibold">
                {item.type === "service" ? tCard("typeService") : tCard("typeProduct")}
              </Badge>
            </div>

            {/* Discount badge */}
            {hasDiscount && (
              <div className="absolute top-3 right-3 z-10">
                <Badge className="bg-destructive text-destructive-foreground font-bold shadow-xs">
                  {discountPercent}% {tDetails("discountBadge")}
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.image_path}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-16 w-16 rounded-xl border overflow-hidden shrink-0 transition ${
                    selectedImageIndex === idx
                      ? "ring-2 ring-[var(--brand-primary)] border-transparent"
                      : "opacity-70 hover:opacity-100 border-[var(--border-default)]"
                  }`}
                >
                  <Image
                    src={publicAssetUrl(img.image_path)}
                    alt={img.alt_text || `Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}

          {/* Full-screen Image Lightbox Modal */}
          {isZoomOpen && currentImage && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
              onClick={() => setIsZoomOpen(false)}
            >
              <div
                className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-zinc-950 p-2 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/40"
                  aria-label="Close zoom preview"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="relative h-[70vh] w-[70vw] max-w-4xl">
                  <Image
                    src={publicAssetUrl(currentImage.image_path)}
                    alt={currentImage.alt_text || item.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>

                {images.length > 1 && (
                  <div className="flex items-center justify-between p-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex((prev) => (prev - 1 >= 0 ? prev - 1 : images.length - 1))
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-xs text-zinc-400 font-medium">
                      {selectedImageIndex + 1} / {images.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex((prev) => (prev + 1 < images.length ? prev + 1 : 0))
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Product Details Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Brand Link & Category Tag */}
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/brands/${brand.slug}`}
                className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1"
              >
                <span>{brand.name}</span>
              </Link>
              <Badge variant="outline" className="text-xs font-medium">
                {item.category.name}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {item.title}
            </h1>

            {/* Price Display */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold font-heading text-[var(--brand-primary)]">
                ৳ {item.price.toLocaleString("en-BD")}
              </span>
              {item.compare_at_price ? (
                <span className="text-base sm:text-lg font-medium text-[var(--text-muted)] line-through">
                  ৳ {item.compare_at_price.toLocaleString("en-BD")}
                </span>
              ) : null}
            </div>

            {/* Descriptive Variants (e.g. Size = 500ml) */}
            {item.item_variants.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--border-default)]">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {tDetails("variants")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {item.item_variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                        selectedVariantId === v.id
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold"
                          : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-muted/50 text-[var(--text-primary)]"
                      }`}
                    >
                      {v.label}: {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Short Description preview — falls back to generic brand copy
                so an item with no description text never leaves this area
                empty. */}
            <div className="pt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              <p>
                {item.description ||
                  (item.type === "service"
                    ? tDetails("fallbackDescriptionService")
                    : tDetails("fallbackDescriptionProduct"))}
              </p>
            </div>
          </div>

          {/* Actions & Scope Boundary buttons */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-default)]">
            <div className="flex flex-wrap items-center gap-3">
              {/* Add to cart / Inquire button (Intentionally inert per AGENTS.md) */}
              <Button
                type="button"
                onClick={() => trigger(item.type === "service" ? "Inquire Service" : "Add to cart")}
                className="flex-1 h-12 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold gap-2 shadow-sm"
              >
                {item.type === "service" ? (
                  <>
                    <PhoneCall className="h-4 w-4" />
                    <span>{tDetails("inquireService")}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>{tCard("addToCart")}</span>
                  </>
                )}
              </Button>

              {/* Wishlist Heart Toggle (Active functional behavior) */}
              <Button
                type="button"
                variant="outline"
                data-testid="wishlist-toggle-btn"
                onClick={handleToggleWishlist}
                disabled={savingWishlist}
                className={`h-12 w-12 rounded-xl border-[var(--border-default)] ${
                  savedWishlist ? "text-destructive border-destructive/40 bg-destructive/5" : ""
                }`}
                aria-label={savedWishlist ? tCard("savedToWishlist") : tCard("saveToWishlist")}
              >
                <Heart
                  className={`h-5 w-5 transition ${
                    savedWishlist ? "fill-destructive text-destructive" : "text-muted-foreground"
                  }`}
                />
              </Button>

              {/* Share link button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleShare}
                className="h-12 px-4 rounded-xl border-[var(--border-default)] gap-1.5 text-xs"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{tDetails("linkCopied")}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    <span>{tDetails("shareItem")}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Trust and Policy highlights (visual per client language) */}
            <div className="grid grid-cols-3 gap-3 pt-3 text-center">
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-muted/20 border border-[var(--border-default)]">
                <ShieldCheck className="h-4 w-4 text-[var(--brand-primary)] mb-1" />
                <span className="text-[11px] font-medium text-foreground">100% Authentic</span>
              </div>
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-muted/20 border border-[var(--border-default)]">
                <Truck className="h-4 w-4 text-[var(--brand-primary)] mb-1" />
                <span className="text-[11px] font-medium text-foreground">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-muted/20 border border-[var(--border-default)]">
                <RotateCcw className="h-4 w-4 text-[var(--brand-primary)] mb-1" />
                <span className="text-[11px] font-medium text-foreground">Easy Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
