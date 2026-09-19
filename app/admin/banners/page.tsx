import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listAllAdminBanners } from "@/lib/queries/banners";
import { listAdminOrganizations } from "@/lib/queries/admin";
import { AllBannerManagementContent } from "@/components/admin/banners/AllBannerManagementContent";

/**
 * Server Component for the Platform-Wide Banners screen (Shared Application).
 * Accessible by Platform Admins and authorized staff.
 */
export default async function AdminBannersSharedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/banners");
  }

  const [{ data: isAdmin }, { data: memberships }] = await Promise.all([
    supabase.rpc("is_platform_admin", { uid: user.id }),
    supabase.from("memberships").select("organization_id").eq("user_id", user.id),
  ]);

  if (!isAdmin && (!memberships || memberships.length === 0)) {
    redirect("/admin");
  }

  const [initialBanners, organizations] = await Promise.all([
    listAllAdminBanners(supabase),
    listAdminOrganizations(supabase),
  ]);

  return (
    <AllBannerManagementContent
      initialBanners={initialBanners}
      organizations={organizations}
    />
  );
}
