import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Image, alt text, safe link, sort order, active state. Goes through the
// same publish pipeline as catalog items (lib/storage/publish.ts).
export default async function AdminBannersPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  return (
    <ScreenPlaceholder
      title={`Banners — ${org}`}
      route="/admin/[org]/banners"
      description="Image, alt text, safe link, sort order, active state."
    />
  );
}
