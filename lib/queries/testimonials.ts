import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Shared "active testimonials" read logic — used by the family homepage
 * grid, the standalone /testimonials page, and the login/signup pages'
 * feedback panel, so all three read the same platform-wide content instead
 * of each hardcoding its own copy. See docs/ARCHITECTURE.md, "Read path,"
 * and supabase/migrations/20260101000018_testimonials.sql.
 */

const TESTIMONIAL_COLUMNS =
  "id, quote_bn, quote_en, name_bn, name_en, city_bn, city_en, avatar_path";

export interface TestimonialRow {
  id: string;
  quote_bn: string;
  quote_en: string;
  name_bn: string;
  name_en: string;
  city_bn: string;
  city_en: string;
  avatar_path: string;
}

export interface AdminTestimonialItem {
  id: string;
  quote_bn: string;
  quote_en: string;
  name_bn: string;
  name_en: string;
  city_bn: string;
  city_en: string;
  avatar_path: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function listActiveTestimonials(
  supabase: SupabaseClient<Database>,
): Promise<TestimonialRow[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select(TESTIMONIAL_COLUMNS)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Platform admin read logic — returns all testimonials (active and inactive),
 * ordered by sort_order ascending.
 */
export async function listAdminTestimonials(
  supabase: SupabaseClient<Database>,
): Promise<AdminTestimonialItem[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, quote_bn, quote_en, name_bn, name_en, city_bn, city_en, avatar_path, sort_order, is_active, created_at, updated_at")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as AdminTestimonialItem[];
}
