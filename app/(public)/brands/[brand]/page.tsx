import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Brand page — logo, introduction, banner, items, category links for one
// organization. Must call notFound() when the org doesn't exist or
// is_active = false (Phase 2, via lib/queries/brands.ts).
export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;
  return (
    <ScreenPlaceholder
      title={`Brand: ${brand}`}
      route="/brands/[brand]"
      description="Brand logo, introduction, banner, items, and category links."
    />
  );
}
