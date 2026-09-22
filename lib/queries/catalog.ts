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

// price/compare_at_price are display-only (see AGENTS.md) — selected here
// purely to render, never to compute with. item_images is ordered by
// sort_order so callers can treat index 0 as the cover image by convention.
const ITEM_LIST_COLUMNS =
  "id, slug, title, description, type, price, compare_at_price, item_images(image_path, alt_text, sort_order), organization:organizations!inner(slug, is_active), category:categories!inner(slug, name)";

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
    .order("sort_order", { referencedTable: "item_images" })
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
    .order("sort_order", { referencedTable: "item_images" })
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Same-category, same-brand items for the "related products" strip on the
 * item detail page. Falls back to other published items from the same
 * organization when the category has nothing else to show, so the section
 * only disappears when the whole brand has no other published items.
 */
export async function listRelatedCatalogItems(
  supabase: SupabaseClient<Database>,
  params: { organizationSlug: string; categorySlug: string; excludeItemId: string; limit?: number },
) {
  const limit = params.limit ?? 8;

  const { data: sameCategory, error: sameCategoryError } = await supabase
    .from("catalog_items")
    .select(ITEM_LIST_COLUMNS)
    .eq("status", "published")
    .eq("organization.is_active", true)
    .eq("organization.slug", params.organizationSlug)
    .eq("category.slug", params.categorySlug)
    .neq("id", params.excludeItemId)
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "item_images" })
    .limit(limit);

  if (sameCategoryError) throw sameCategoryError;
  if (sameCategory && sameCategory.length >= limit) return sameCategory;

  const { data: sameBrand, error: sameBrandError } = await supabase
    .from("catalog_items")
    .select(ITEM_LIST_COLUMNS)
    .eq("status", "published")
    .eq("organization.is_active", true)
    .eq("organization.slug", params.organizationSlug)
    .neq("id", params.excludeItemId)
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "item_images" })
    .limit(limit);

  if (sameBrandError) throw sameBrandError;

  const seen = new Set((sameCategory ?? []).map((item) => item.id));
  const merged = [...(sameCategory ?? [])];
  for (const item of sameBrand ?? []) {
    if (merged.length >= limit) break;
    if (!seen.has(item.id)) {
      merged.push(item);
      seen.add(item.id);
    }
  }
  return merged;
}

export interface AdminCatalogItemSummary {
  id: string;
  slug: string;
  title: string;
  type: "product" | "service";
  status: "draft" | "published" | "archived";
  price: number;
  compare_at_price: number | null;
  created_at: string;
  updated_at: string;
  item_images: Array<{ image_path: string; sort_order: number }>;
  category: { id: string; slug: string; name: string } | null;
}

export interface AdminCatalogFilters {
  type?: "product" | "service";
  status?: "draft" | "published" | "archived";
  search?: string;
  categoryId?: string;
}

export async function listAdminCatalogItems(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  filters?: AdminCatalogFilters,
): Promise<AdminCatalogItemSummary[]> {
  let query = supabase
    .from("catalog_items")
    .select(
      "id, slug, title, type, status, price, compare_at_price, created_at, updated_at, item_images(image_path, sort_order), category:categories(id, slug, name)"
    )
    .eq("organization_id", organizationId);

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .order("sort_order", { referencedTable: "item_images" });

  if (error) throw error;
  return (data as unknown as AdminCatalogItemSummary[]) ?? [];
}

export interface AdminCatalogItemDetail {
  id: string;
  organization_id: string;
  category_id: string;
  type: "product" | "service";
  title: string;
  slug: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  price: number;
  compare_at_price: number | null;
  created_at: string;
  updated_at: string;
  item_images: Array<{
    id: string;
    image_path: string;
    alt_text: string | null;
    sort_order: number;
  }>;
  item_variants: Array<{
    id: string;
    label: string;
    value: string;
    sort_order: number;
  }>;
  category?: { id: string; slug: string; name: string } | null;
}

export async function getAdminCatalogItem(
  supabase: SupabaseClient<Database>,
  organizationId: string,
  itemId: string,
): Promise<AdminCatalogItemDetail | null> {
  const { data, error } = await supabase
    .from("catalog_items")
    .select(
      "id, organization_id, category_id, type, title, slug, description, status, price, compare_at_price, created_at, updated_at, item_images(id, image_path, alt_text, sort_order), item_variants(id, label, value, sort_order), category:categories(id, slug, name)"
    )
    .eq("id", itemId)
    .eq("organization_id", organizationId)
    .order("sort_order", { referencedTable: "item_variants" })
    .order("sort_order", { referencedTable: "item_images" })
    .maybeSingle();

  if (error) throw error;
  return (data as unknown as AdminCatalogItemDetail) ?? null;
}

