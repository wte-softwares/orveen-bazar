import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/validation/auth.schema";
import { ok } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/errors";

export const POST = withApiHandler(async (request: Request) => {
  const body = forgotPasswordSchema.parse(await request.json());
  const supabase = await createClient();

  // Intentionally ignore the result: resetPasswordForEmail already responds
  // the same way whether or not the address is registered, but we also
  // never branch on its error here — returning the identical response in
  // every case is what actually prevents account-existence enumeration via
  // this endpoint.
  // Routed through /auth/callback (not directly to /reset-password) because
  // the recovery link arrives as a PKCE `?code=`, which must be exchanged
  // for a session server-side (supabase.auth.exchangeCodeForSession) before
  // /reset-password's own POST /api/v1/auth/reset-password can see a signed-
  // in user — see app/auth/callback/route.ts.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";
  await supabase.auth.resetPasswordForEmail(body.email, {
    redirectTo: `${siteUrl}/auth/callback?redirect=${encodeURIComponent("/reset-password")}`,
  });

  return ok({ message: "If that email is registered, a reset link has been sent." });
});
