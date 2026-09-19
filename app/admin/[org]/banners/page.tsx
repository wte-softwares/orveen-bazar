import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrandConfig } from "@/lib/site-config";
import { listAdminBanners } from "@/lib/queries/banners";
import { BannerManagementContent } from "@/components/admin/banners/BannerManagementContent";

export default async function AdminBannersPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  const brand = getBrandConfig(org);
  if (!brand) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/admin/${org}/banners`);
  }

  // Security gate: Verify access to this specific organization (Platform Admin OR staff membership)
  const [{ data: isAdmin }, { data: organization }] = await Promise.all([
    supabase.rpc("is_platform_admin", { uid: user.id }),
    supabase.from("organizations").select("id, slug, is_active").eq("slug", org).maybeSingle(),
  ]);

  if (!organization) {
    redirect("/admin");
  }

  if (!isAdmin) {
    const { data: membership } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (!membership) {
      redirect("/admin");
    }
  }

  const initialBanners = await listAdminBanners(supabase, organization.id);

  return (
    <BannerManagementContent
      initialBanners={initialBanners}
      organizationId={organization.id}
      orgSlug={org}
      brandName={brand.name}
    />
  );
}
