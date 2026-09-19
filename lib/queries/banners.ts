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
