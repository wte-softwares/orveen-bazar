import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Shared PKCE code-exchange landing page for every Supabase Auth email/OAuth
 * link that redirects back into the app: Google/Facebook sign-in (see
 * components/login-form.tsx), magic-link sign-in, email confirmation after
 * registration, and password-recovery links (see
 * app/api/v1/auth/{register,forgot-password}/route.ts) — all of them arrive
 * here with a `?code=` that must be exchanged for a session server-side
 * before the destination page can see a signed-in user.
 *
 * Staff/platform-admin accounts land in the dashboard regardless of the
 * `redirect` param the caller asked for — same rule as the email/password
 * path in login-form.tsx, kept here too since every non-password sign-in
 * method goes through this route instead of that client-side code. The one
 * exception is a password-recovery link: overriding its destination would
 * send an admin who forgot their password to /admin instead of
 * /reset-password, without ever letting them set the new one.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectTo = url.searchParams.get("redirect") || "/account";
  const isRecovery = redirectTo === "/reset-password";

  let destination = redirectTo;

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data.user;

    if (user && !isRecovery) {
      const [{ data: isAdmin }, { data: memberships }] = await Promise.all([
        supabase.rpc("is_platform_admin", { uid: user.id }),
        supabase.from("memberships").select("organization_id").eq("user_id", user.id),
      ]);
      const hasAdminAccess = Boolean(isAdmin) || (memberships?.length ?? 0) > 0;
      if (hasAdminAccess) destination = "/admin";
    }
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
