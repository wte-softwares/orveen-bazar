import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Public category menu data is read through this shared query so the
 * storefront header and mobile clients see the same active categories.
 * RLS still limits this to categories belonging to active organizations.
 */
export async function listPublicCategories(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, sort_order, organization:organizations!inner(slug, is_active)")
    .eq("is_active", true)
    .eq("organization.is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export interface AdminCategoryItem {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  item_count: number;
}

/**
 * Admin categories read logic.
 * Returns all categories (both active and inactive) for a specific organization,
 * along with the exact count of catalog items referencing each category.
 */
export async function listAdminCategories(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<AdminCategoryItem[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, organization_id, name, slug, sort_order, is_active, created_at, updated_at, catalog_items(count)"
    )
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const rawCount = row.catalog_items as unknown as Array<{ count: number }> | null;
    const itemCount = rawCount?.[0]?.count ?? 0;

    return {
      id: row.id,
      organization_id: row.organization_id,
      name: row.name,
      slug: row.slug,
      sort_order: row.sort_order,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      item_count: itemCount,
    };
  });
}
