import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findPublishedItemBySlug, listRelatedCatalogItems } from "@/lib/queries/catalog";
import { getBrandConfig } from "@/lib/site-config";
import { Container } from "@/components/layout/Container";
import { ItemDetailView, type DetailCatalogItem } from "@/components/catalog/ItemDetailView";
import { RelatedProducts } from "@/components/catalog/RelatedProducts";
import { publicAssetUrl } from "@/lib/storage/public-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; item: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug, item: itemSlug } = await params;
  const brand = getBrandConfig(brandSlug);
  if (!brand) return {};

  const supabase = await createClient();
  const catalogItem = await findPublishedItemBySlug(supabase, brandSlug, itemSlug);
  if (!catalogItem) return {};

  const cover = catalogItem.item_images?.[0];
  const ogImageUrl = cover ? publicAssetUrl(cover.image_path) : undefined;

  return {
    title: `${catalogItem.title} | ${brand.name}`,
    description:
      catalogItem.description ||
      `Explore ${catalogItem.title} from ${brand.name} at ORVEEN BAZAR.`,
    openGraph: {
      title: `${catalogItem.title} | ${brand.name}`,
      description: catalogItem.description || undefined,
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title: `${catalogItem.title} | ${brand.name}`,
      description: catalogItem.description || undefined,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

export default async function ItemDetailsPage({
  params,
}: {
  params: Promise<{ brand: string; item: string }>;
}) {
  const { brand: brandSlug, item: itemSlug } = await params;
  const brand = getBrandConfig(brandSlug);
  if (!brand) {
    notFound();
  }

  const supabase = await createClient();
  const catalogItem = await findPublishedItemBySlug(supabase, brandSlug, itemSlug);

  // findPublishedItemBySlug filters on:
  // 1. slug = itemSlug
  // 2. organization.slug = brandSlug
  // 3. status = 'published'
  // 4. organization.is_active = true
  // If any condition fails, catalogItem will be null.
  if (!catalogItem) {
    notFound();
  }

  const relatedItems = await listRelatedCatalogItems(supabase, {
    organizationSlug: brandSlug,
    categorySlug: catalogItem.category.slug,
    excludeItemId: catalogItem.id,
  });

  return (
    <Container className="py-8">
      <ItemDetailView
        item={catalogItem as unknown as DetailCatalogItem}
        brand={brand}
      />
      <RelatedProducts items={relatedItems} itemType={catalogItem.type as "product" | "service"} />
    </Container>
  );
}
