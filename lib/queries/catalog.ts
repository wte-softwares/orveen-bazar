import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { ApiError } from "@/lib/api/errors";

/**
 * Shared "published catalog content" read logic — called by BOTH the public
 * /catalog and /brands/[brand]/[item] Server Components and the matching
 * `/api/v1/catalog*` Route Handlers. One place decides what "a visible
 * catalog item" means; RLS is the authorization boundary underneath either
 * way. See docs/ARCHITECTURE.md, "Read path".
 */

const ITEM_LIST_COLUMNS =
  "id, slug, title, description, type, image_path, organization:organizations!inner(slug, name, is_active), category:categories!inner(slug, name)";

const ITEM_DETAIL_COLUMNS = `${ITEM_LIST_COLUMNS}, item_variants(id, label, value, sort_order)`;

export interface CatalogFilters {
  organizationSlug?: string;
  categorySlug?: string;
  type?: "product" | "service";
  /** Case-insensitive title match — no fuzzy search, matching the brief. */
  search?: string;
  from: number;
  to: number;
}

export async function listPublishedCatalogItems(
  supabase: SupabaseClient<Database>,
  filters: CatalogFilters,
) {
  let query = supabase
    .from("catalog_items")
    .select(ITEM_LIST_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .eq("organization.is_active", true);

  if (filters.organizationSlug) {
    query = query.eq("organization.slug", filters.organizationSlug);
  }
  if (filters.categorySlug) {
    query = query.eq("category.slug", filters.categorySlug);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(filters.from, filters.to);

  if (error) throw error;
  return { items: data ?? [], totalCount: count ?? 0 };
}

/**
 * Friendly pre-check for the cross-tenant integrity rule enforced as a hard
 * guarantee by the `enforce_item_category_same_organization` DB trigger
 * (supabase/migrations/20260101000007_catalog_items.sql). This is what
 * turns "assigned a category from another brand" into a clean 422 instead
 * of the trigger's raw exception reaching the client — the trigger remains
 * the actual guarantee and still fires even if this check is ever skipped.
 */
export async function assertCategoryInOrganization(
  supabase: SupabaseClient<Database>,
  categoryId: string,
  organizationId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("categories")
    .select("organization_id")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) throw error;
  if (!data || data.organization_id !== organizationId) {
    throw new ApiError(422, "invalid_category", "Choose a category that belongs to this brand.");
  }
}

export async function findPublishedItemBySlug(
  supabase: SupabaseClient<Database>,
  organizationSlug: string,
  itemSlug: string,
) {
  const { data, error } = await supabase
    .from("catalog_items")
    .select(ITEM_DETAIL_COLUMNS)
    .eq("slug", itemSlug)
    .eq("organization.slug", organizationSlug)
    .eq("status", "published")
    .eq("organization.is_active", true)
    .order("sort_order", { referencedTable: "item_variants" })
    .maybeSingle();

  if (error) throw error;
  return data;
}
