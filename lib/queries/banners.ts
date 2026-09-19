import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";


export interface AdminBannerItem {
  id: string;
  organization_id: string;
  image_path: string;
  alt_text: string;
  target_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    slug: string;
    name: string;
  } | null;
}

/**
 * Shared banners read logic for admin screens.
 * Returns all banners (both active and inactive) for a specific organization,
 * ordered by sort_order ascending.
 */
export async function listAdminBanners(
  supabase: SupabaseClient<Database>,
  organizationId: string,
): Promise<AdminBannerItem[]> {
  const { data, error } = await supabase
    .from("banners")
    .select("id, organization_id, image_path, alt_text, target_url, sort_order, is_active, created_at, updated_at")
    .eq("organization_id", organizationId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminBannerItem[];
}

/**
 * Platform-wide banners read logic — returns all banners across all organizations
 * ordered by organization_id then sort_order ascending.
 */
export async function listAllAdminBanners(
  supabase: SupabaseClient<Database>,
): Promise<AdminBannerItem[]> {
  const { data, error } = await supabase
    .from("banners")
    .select("id, organization_id, image_path, alt_text, target_url, sort_order, is_active, created_at, updated_at, organization:organizations(id, slug)")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  const { getBrandConfig } = await import("@/lib/site-config");
  return (data ?? []).map((b) => ({
    ...b,
    organization: b.organization
      ? {
          id: b.organization.id,
          slug: b.organization.slug,
          name: getBrandConfig(b.organization.slug)?.name ?? b.organization.slug,
        }
      : null,
  })) as AdminBannerItem[];
}
