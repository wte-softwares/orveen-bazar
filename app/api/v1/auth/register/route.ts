import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validation/auth.schema";
import { ok } from "@/lib/api/response";
import { ApiError, ConflictError, withApiHandler } from "@/lib/api/errors";

export const POST = withApiHandler(async (request: Request) => {
  const body = registerSchema.parse(await request.json());
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";
  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: { display_name: body.displayName },
      // Through /auth/callback, not straight to /login — the confirmation
      // link carries a PKCE `?code=` that needs exchanging for a session
      // server-side before the visitor is actually signed in (see that
      // route); landing on /login unauthenticated would otherwise make them
      // enter their password a second time right after confirming.
      emailRedirectTo: `${siteUrl}/auth/callback?redirect=${encodeURIComponent("/login")}`,
    },
  });

  // Any `error` reaching here is a genuine failure (weak password, rate
  // limit, etc.) safe to surface.
  if (error) {
    throw new ApiError(400, "sign_up_failed", error.message);
  }

  // With auth.email.enable_confirmations = true (see supabase/config.toml),
  // Supabase doesn't return an `error` when the email already belongs to a
  // confirmed account — it returns a 200 with a *fake* user object instead,
  // as its own built-in defense against account-enumeration via this form.
  // The one reliable signal that it's the fake object: `identities` is an
  // empty array (a brand-new signup always has exactly one identity). The
  // client explicitly wants a clear "account already exists" message here
  // over that anti-enumeration protection, so this route surfaces it.
  if (data.user && data.user.identities?.length === 0) {
    throw new ConflictError("An account already exists with this email address. Try signing in instead.");
  }

  return ok(
    {
      userId: data.user?.id ?? null,
      // No session means email confirmation is pending — the UI should show
      // a "check your email" state rather than treating this as logged in.
      needsEmailConfirmation: data.session === null,
    },
    { status: 201 },
  );
});
