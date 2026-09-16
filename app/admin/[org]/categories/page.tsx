import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Name, slug, sort order, active state. Deleting a category that's still
// referenced by an item must be blocked with a clear message, not a raw
// foreign-key error (Phase 2).
export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  return (
    <ScreenPlaceholder
      title={`Categories — ${org}`}
      route="/admin/[org]/categories"
      description="Name, slug, sort order, active state; blocks deletion while referenced."
    />
  );
}
