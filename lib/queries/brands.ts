import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

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

const ORGANIZATION_COLUMNS = "id, slug, name, description, logo_path, contact_text";

export async function listActiveOrganizations(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("organizations")
    .select(ORGANIZATION_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
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
  return data;
}
