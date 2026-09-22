"use client";

import { ProductCard, type ProductCardItem } from "@/components/home/ProductCard";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

/**
 * "Related products" strip below the item detail view — same category
 * first, backfilled with other published items from the same brand (see
 * lib/queries/catalog.ts listRelatedCatalogItems), so it only disappears
 * when the brand genuinely has nothing else to show.
 */
export function RelatedProducts({
  items,
  itemType,
}: {
  items: ProductCardItem[];
  itemType: "product" | "service";
}) {
  const t = useTranslations("itemDetails");

  if (items.length === 0) return null;

  return (
    <section className="mt-12 border-t border-[var(--border-default)] pt-8">
      <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">
        {itemType === "service" ? t("relatedServices") : t("relatedProducts")}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
