import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrandConfig } from "@/lib/site-config";
import { listOrgStaffMembers } from "@/lib/queries/admin";
import { BrandSettingsContent } from "@/components/admin/settings/BrandSettingsContent";

export default async function AdminSettingsPage({
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
    redirect(`/login?redirect=/admin/${org}/settings`);
  }

  // Security gate: Verify access to this specific organization (Platform Admin OR staff membership)
  const [{ data: isAdmin }, { data: organization }] = await Promise.all([
    supabase.rpc("is_platform_admin", { uid: user.id }),
    supabase.from("organizations").select("id, slug, is_active, created_at").eq("slug", org).maybeSingle(),
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

  const staffMembers = await listOrgStaffMembers(organization.id);

  return (
    <BrandSettingsContent
      brand={brand}
      organization={organization}
      staffMembers={staffMembers}
    />
  );
}
