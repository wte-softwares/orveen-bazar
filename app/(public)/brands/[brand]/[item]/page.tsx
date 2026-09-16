import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Item details — image, title, description, category, descriptive variants,
// wishlist toggle. Must call notFound() for missing/archived/unpublished
// items AND for items whose parent organization is inactive (Phase 2, via
// lib/queries/catalog.ts) — never just check item.status alone.
export default async function ItemDetailsPage({
  params,
}: {
  params: Promise<{ brand: string; item: string }>;
}) {
  const { brand, item } = await params;
  return (
    <ScreenPlaceholder
      title={`Item: ${item}`}
      route="/brands/[brand]/[item]"
      description={`Details for an item under ${brand} — variants and a wishlist toggle, no price or purchase controls.`}
    />
  );
}
