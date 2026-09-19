import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBrandConfig } from "@/lib/site-config";
import { getAdminCatalogItem } from "@/lib/queries/catalog";
import { listAdminCategories } from "@/lib/queries/categories";
import { ItemEditorContent } from "@/components/admin/items/ItemEditorContent";

export default async function AdminItemEditorPage({
  params,
}: {
  params: Promise<{ org: string; id: string }>;
}) {
  const { org, id } = await params;
  const brand = getBrandConfig(org);
  if (!brand) {
    redirect("/admin");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/admin/${org}/items/${id}`);
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

  const categories = await listAdminCategories(supabase, organization.id);

  let initialItem = null;
  if (id !== "new") {
    initialItem = await getAdminCatalogItem(supabase, organization.id, id);
    if (!initialItem) {
      notFound();
    }
  }

  return (
    <ItemEditorContent
      key={initialItem?.id || "new"}
      initialItem={initialItem}
      categories={categories}
      orgSlug={org}
      organizationId={organization.id}
      brandName={brand.name}
    />
  );
}
