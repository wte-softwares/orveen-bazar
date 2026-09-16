import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use in Server Components, Route Handlers, and Server
 * Actions (we don't use Server Actions for data mutations per project
 * convention — see AGENTS.md — but this factory is still correct for any
 * server-side rendering path).
 *
 * Deliberately reads cookies() internally instead of accepting a cookie store
 * as a parameter: every call site just does `const supabase = await
 * createClient()` with no extra plumbing, matching Supabase's current
 * documented App Router pattern.
 *
 * Row Level Security is the real authorization boundary for every query made
 * through this client — it runs as the calling user, not as an elevated role.
 * For operations that must intentionally bypass RLS (e.g. platform-admin user
 * management), use `lib/supabase/admin.ts` instead, and only from trusted
 * server-only code.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `set` is called from a Server Component, which can't write
            // cookies. Safe to ignore here because `middleware.ts` refreshes
            // the session cookie on every request — see
            // lib/supabase/middleware.ts.
          }
        },
      },
    },
  );
}
