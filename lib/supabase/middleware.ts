import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session cookie on every request and returns the
 * response that carries the refreshed cookie forward.
 *
 * This must run in `middleware.ts` (root) on every request that can read
 * auth state, because Server Components cannot write cookies themselves
 * (see the comment in lib/supabase/server.ts) — without this, sessions would
 * silently expire mid-visit even though the refresh token is still valid.
 *
 * IMPORTANT: do not add business logic here (route protection, role checks,
 * etc.). Keep this function limited to session refresh; page- and
 * route-level authorization lives in `app/admin/layout.tsx` and
 * `lib/api/org-guard.ts` respectively, where the checks can return a proper
 * redirect or JSON error instead of a middleware-level short-circuit.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Cookies must be set on both the incoming request (so later code
          // in this same request sees the refreshed session) and the
          // outgoing response (so the browser stores it).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touching getUser() is what actually triggers a token refresh when the
  // access token is expired but the refresh token is still valid.
  await supabase.auth.getUser();

  return supabaseResponse;
}
