import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listPublishedCatalogItems } from "@/lib/queries/catalog";
import { listActiveOrganizations } from "@/lib/queries/brands";
import { listPublicCategories } from "@/lib/queries/categories";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/home/ProductCard";
import { CatalogFiltersBar } from "@/components/catalog/CatalogFiltersBar";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { translate } from "@/lib/i18n/translations";
import { defaultLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Explore our complete multi-brand product catalog, household essentials, personal care, and services across ORVEEN BAZAR, ECO FAST BD, and RELIABLE MULTI PRODUCTS.",
};

const PAGE_SIZE = 12;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const orgParam = typeof params.org === "string" ? params.org : undefined;
  const categoryParam = typeof params.category === "string" ? params.category : undefined;
  const typeParam =
    params.type === "product" || params.type === "service" ? params.type : undefined;
  const qParam = typeof params.q === "string" ? params.q.trim() : undefined;
  const offerParam = params.offer === "true";
  const pageParam = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const [organizations, categoriesData, catalogResult] = await Promise.all([
    listActiveOrganizations(supabase),
    listPublicCategories(supabase),
    listPublishedCatalogItems(supabase, {
      organizationSlug: orgParam,
      categorySlug: categoryParam,
      type: typeParam,
      search: qParam,
      from,
      to,
    }),
  ]);

  // If "offer" filter is toggled, filter items that have compare_at_price > price
  let displayItems = catalogResult.items;
  if (offerParam) {
    displayItems = displayItems.filter(
      (item) => item.compare_at_price != null && item.compare_at_price > item.price
    );
  }

  const totalCount = offerParam ? displayItems.length : catalogResult.totalCount;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Deduplicate categories by slug for the filter dropdown
  const uniqueCategories = Array.from(
    new Map(categoriesData.map((c) => [c.slug, { slug: c.slug, name: c.name }])).values()
  );

  return (
    <Container className="py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {translate("catalog", "catalogTitle", defaultLocale)}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {translate("catalog", "catalogSubtitle", defaultLocale)}
        </p>
      </div>

      {/* Filter Bar */}
      <CatalogFiltersBar
        brands={organizations.map((o) => ({ slug: o.slug, name: o.name }))}
        categories={uniqueCategories}
        currentOrg={orgParam}
        currentCategory={categoryParam}
        currentType={typeParam}
        currentSearch={qParam}
        currentOffer={offerParam}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>
          <strong className="text-foreground">{totalCount}</strong>{" "}
          {translate("catalog", "itemsFound", defaultLocale)}
        </span>
      </div>

      {/* Catalog Grid */}
      {displayItems.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] p-12 text-center">
          <p className="text-base font-semibold text-[var(--text-primary)]">
            {translate("catalog", "noItemsMatch", defaultLocale)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search terms or clearing your selected filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {displayItems.map((item) => (
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

      {/* Pagination */}
      <CatalogPagination currentPage={currentPage} totalPages={totalPages} />
    </Container>
  );
}
