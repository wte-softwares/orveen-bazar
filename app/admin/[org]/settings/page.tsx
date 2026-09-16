import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Logo, brand name, introduction, contact text. ADMIN-ONLY writes per the
// brief — staff with a membership in :org can still view this screen but
// must not be able to submit changes; enforce both server-side (Phase 2)
// and by disabling the form for non-admins in the UI.
export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  return (
    <ScreenPlaceholder
      title={`Brand settings — ${org}`}
      route="/admin/[org]/settings"
      description="Logo, brand name, introduction, contact text — admin-only writes."
    />
  );
}
