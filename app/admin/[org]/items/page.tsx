import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Type filter, search, status, add/edit/archive actions. Every render of
// this screen must re-verify (server-side, via lib/api/org-guard.ts's page
// equivalent) that the signed-in user actually has access to :org — a
// forged/typed-in org slug in the URL must never leak another brand's items.
export default async function AdminItemsPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  return (
    <ScreenPlaceholder
      title={`Items — ${org}`}
      route="/admin/[org]/items"
      description="Type filter, search, status, add/edit, and archive actions."
    />
  );
}
