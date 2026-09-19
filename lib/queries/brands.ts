import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { BRANDS, getBrandConfig } from "@/lib/site-config";

/**
 * Shared "active organizations" read logic — called by BOTH the family
 * homepage / brand page Server Components and the `/api/v1/organizations`
 * Route Handlers, so the two transports can never quietly disagree about
 * what "an active brand" means. See docs/ARCHITECTURE.md, "Read path".
 *
 * Takes an already-created Supabase client rather than creating its own:
 * the caller (a Server Component or a Route Handler) knows whether it needs
 * the cookie-bound server client or an auth-resolved one, this module
 * doesn't need to care.
 */

const ORGANIZATION_COLUMNS = "id, slug, is_active";

function withBrandConfig<T extends { slug: string }>(organization: T) {
  const brand = getBrandConfig(organization.slug);
  if (!brand) throw new Error(`No static configuration exists for organization: ${organization.slug}`);
  return { ...organization, ...brand };
}

export async function listActiveOrganizations(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("organizations")
    .select(ORGANIZATION_COLUMNS)
    .eq("is_active", true)
    .in("slug", BRANDS.map((brand) => brand.slug));

  if (error) throw error;
  return (data ?? [])
    .map(withBrandConfig)
    .sort((a, b) => BRANDS.findIndex((brand) => brand.slug === a.slug) - BRANDS.findIndex((brand) => brand.slug === b.slug));
}

export async function findActiveOrganizationBySlug(
  supabase: SupabaseClient<Database>,
  slug: string,
) {
  const { data, error } = await supabase
    .from("organizations")
    .select(ORGANIZATION_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data ? withBrandConfig(data) : null;
}

/**
 * Active banners across every active organization, for the family homepage
 * hero — "approved banners" per the brief's screen map for `/`. Scoped to
 * one organization's brand page instead by passing `organizationId`.
 */
export async function listActiveBanners(
  supabase: SupabaseClient<Database>,
  organizationId?: string,
) {
  let query = supabase
    .from("banners")
    .select(
      "id, image_path, alt_text, target_url, sort_order, organization:organizations!inner(slug, is_active)",
    )
    .eq("is_active", true)
    .eq("organization.is_active", true);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  const { data, error } = await query.order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}
