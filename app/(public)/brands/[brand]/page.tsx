import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { findActiveOrganizationBySlug, listActiveBanners } from "@/lib/queries/brands";
import { listPublishedCatalogItems } from "@/lib/queries/catalog";
import { listPublicCategories } from "@/lib/queries/categories";
import { Container } from "@/components/layout/Container";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductCard } from "@/components/home/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { translate } from "@/lib/i18n/translations";
import { defaultLocale } from "@/lib/i18n/config";
import { getBrandConfig } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const brand = getBrandConfig(brandSlug);
  if (!brand) return {};

  return {
    title: `${brand.name} · ORVEEN BAZAR`,
    description:
      brand.description.en ||
      `Browse the latest official catalog and collections from ${brand.name}.`,
    openGraph: {
      title: `${brand.name} · ORVEEN BAZAR`,
      description: brand.description.en,
    },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandSlug } = await params;
  const supabase = await createClient();

  const brandOrg = await findActiveOrganizationBySlug(supabase, brandSlug);
  if (!brandOrg) {
    notFound();
  }

  const [banners, categories, catalogResult] = await Promise.all([
    listActiveBanners(supabase, brandOrg.id),
    listPublicCategories(supabase),
    listPublishedCatalogItems(supabase, {
      organizationSlug: brandSlug,
      from: 0,
      to: 23,
    }),
  ]);

  // Scoped categories for this brand
  const brandCategories = categories.filter((c) => c.organization.slug === brandSlug);

  return (
    <div className="pb-16 space-y-8">
      {/* Brand Hero Banner */}
      {banners.length > 0 ? (
        <HeroBanner banners={banners} />
      ) : (
        <div
          className="relative py-12 px-6"
          style={{
            background: `linear-gradient(135deg, ${brandOrg.cardAccent}22, ${brandOrg.cardAccent}08)`,
          }}
        >
          <Container className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-36 bg-white p-2 rounded-xl shadow-xs border">
                <Image
                  src={brandOrg.logoSrc}
                  alt={brandOrg.name}
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  {brandOrg.name}
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
                  {brandOrg.description[defaultLocale]}
                </p>
              </div>
            </div>
          </Container>
        </div>
      )}

      <Container className="space-y-8">
        {/* Brand Header & Quick Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {brandOrg.name} — {translate("catalog", "catalogTitle", defaultLocale)}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {catalogResult.totalCount} {translate("catalog", "itemsFound", defaultLocale)}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/catalog?org=${brandSlug}`} />}
            className="gap-1.5 text-xs self-start sm:self-auto"
          >
            <span>{translate("productSection", "viewAll", defaultLocale)}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Brand Categories Bar */}
        {brandCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Link href={`/catalog?org=${brandSlug}`}>
              <Badge variant="secondary" className="px-3 py-1.5 text-xs cursor-pointer hover:bg-muted font-medium">
                All
              </Badge>
            </Link>
            {brandCategories.map((c) => (
              <Link key={c.slug} href={`/catalog?org=${brandSlug}&category=${c.slug}`}>
                <Badge
                  variant="outline"
                  className="px-3 py-1.5 text-xs cursor-pointer hover:bg-muted font-medium transition"
                >
                  {c.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Product / Service Catalog Grid */}
        {catalogResult.items.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] p-12 text-center">
            <p className="text-base font-semibold text-[var(--text-primary)]">
              {translate("catalog", "noItemsMatch", defaultLocale)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {catalogResult.items.map((item) => (
              <ProductCard
                key={item.id}
                item={{
                  id: item.id,
                  slug: item.slug,
                  title: item.title,
                  type: item.type,
                  price: item.price,
                  compare_at_price: item.compare_at_price,
                  organization: { slug: item.organization.slug },
                  item_images: item.item_images,
                }}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
