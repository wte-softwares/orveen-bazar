import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export interface AuthContext {
  user: User;
  /** A ready-to-use Supabase client scoped to this caller — RLS applies as this user, never elevated. */
  supabase: SupabaseClient<Database>;
  isPlatformAdmin: boolean;
  /** Organization ids this user has an active staff membership in. */
  membershipOrgIds: string[];
}

/**
 * Resolves the calling user for a Route Handler from EITHER:
 *   - the Supabase cookie session (the web app), or
 *   - an `Authorization: Bearer <access_token>` header (a future Android
 *     app, or any other client that isn't a browser holding our cookies)
 *
 * Every protected `/api/v1/*` route calls this once, at the top, and treats
 * a `null` return as "not signed in" (respond 401). This is also what makes
 * `is_platform_admin`/`has_org_membership` safe to call from application
 * code: platform_admins has zero client-readable RLS policies (see
 * docs/RLS_POLICIES.md), so the ONLY way to check admin status from here is
 * through the SECURITY DEFINER RPC function, never a direct table read.
 */
export async function getAuthContext(request: Request): Promise<AuthContext | null> {
  const bearerToken = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];

  // Bearer path: a plain client with no cookie plumbing, scoped to this one
  // token. Cookie path: the shared server client, which reads the session
  // from the request's cookies via next/headers.
  const supabase = bearerToken
    ? createSupabaseJsClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { global: { headers: { Authorization: `Bearer ${bearerToken}` } } },
      )
    : await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const [{ data: isAdmin }, { data: memberships }] = await Promise.all([
    supabase.rpc("is_platform_admin", { uid: user.id }),
    supabase.from("memberships").select("organization_id").eq("user_id", user.id),
  ]);

  return {
    user,
    supabase,
    isPlatformAdmin: Boolean(isAdmin),
    membershipOrgIds: (memberships ?? []).map((m) => m.organization_id as string),
  };
}
