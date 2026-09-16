import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Service-role ("secret key") Supabase client — BYPASSES Row Level Security
 * entirely. The `import "server-only"` above makes any accidental import from
 * client-bundled code a build-time error, not just a runtime mistake.
 *
 * Use this ONLY for operations that must legitimately act outside a single
 * user's row-level permissions, and ONLY from server-only code that has
 * already verified the caller is authorized to trigger that operation, e.g.:
 *   - platform-admin user/membership management (lib/api/org-guard.ts's
 *     "is this caller a platform admin?" check happens BEFORE this client is
 *     ever touched, not instead of it)
 *   - the storage copy-on-publish / scrub-on-unpublish pipeline
 *     (lib/storage/publish.ts), which intentionally moves objects between the
 *     private drafts bucket and the public bucket on behalf of the request
 *
 * Never import this in a Client Component, never return its query results
 * without re-applying the same authorization check RLS would have done, and
 * never log the secret key.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    // Fail loudly rather than silently falling back to an unauthenticated
    // client — a missing secret key must never be mistaken for "no admin
    // operations needed right now".
    throw new Error(
      "SUPABASE_SECRET_KEY is not set. This is required for admin-only " +
        "operations and must never be exposed to the browser.",
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey,
    {
      auth: {
        // This client impersonates no particular user and should never
        // persist or auto-refresh a session of its own.
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
