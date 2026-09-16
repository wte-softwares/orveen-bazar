import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validation/auth.schema";
import { ok } from "@/lib/api/response";
import { ApiError, withApiHandler } from "@/lib/api/errors";

export const POST = withApiHandler(async (request: Request) => {
  const body = registerSchema.parse(await request.json());
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: { display_name: body.displayName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
    },
  });

  // Note: with auth.email.enable_confirmations = true (see
  // supabase/config.toml), Supabase automatically returns an obfuscated
  // success response instead of an error when the email already belongs to
  // a confirmed account — this is Supabase's own built-in defense against
  // account-enumeration via the register form, not something this route
  // needs to reimplement. Any `error` reaching here is a genuine failure
  // (weak password, rate limit, etc.) safe to surface.
  if (error) {
    throw new ApiError(400, "sign_up_failed", error.message);
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
