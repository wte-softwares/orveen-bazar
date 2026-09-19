import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrandConfig } from "@/lib/site-config";
import { listAdminCatalogItems } from "@/lib/queries/catalog";
import { listAdminCategories } from "@/lib/queries/categories";
import { ItemManagementContent } from "@/components/admin/items/ItemManagementContent";

export default async function AdminItemsPage({
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
    redirect(`/login?redirect=/admin/${org}/items`);
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

  const [initialItems, categories] = await Promise.all([
    listAdminCatalogItems(supabase, organization.id),
    listAdminCategories(supabase, organization.id),
  ]);

  return (
    <ItemManagementContent
      initialItems={initialItems}
      categories={categories}
      orgSlug={org}
      brandName={brand.name}
    />
  );
}
