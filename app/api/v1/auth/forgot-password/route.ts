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
  await supabase.auth.resetPasswordForEmail(body.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  return ok({ message: "If that email is registered, a reset link has been sent." });
});
