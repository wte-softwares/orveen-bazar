import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrandConfig } from "@/lib/site-config";
import { listAdminCategories } from "@/lib/queries/categories";
import { CategoryManagementContent } from "@/components/admin/categories/CategoryManagementContent";

export default async function AdminCategoriesPage({
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
    redirect(`/login?redirect=/admin/${org}/categories`);
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

  const initialCategories = await listAdminCategories(supabase, organization.id);

  return (
    <CategoryManagementContent
      initialCategories={initialCategories}
      orgSlug={org}
    />
  );
}
