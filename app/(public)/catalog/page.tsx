import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Combined catalog — search + brand/category/type filters, result count,
// pagination, clear filters. Filters must live in the URL (searchParams) so
// refresh/back preserve them, and pagination resets whenever a filter
// changes (Phase 2, via lib/queries/catalog.ts).
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await searchParams;
  return (
    <ScreenPlaceholder
      title="Catalog"
      route="/catalog"
      description="Search + brand/category/type filters, pagination, clear filters — all reflected in the URL."
    />
  );
}
