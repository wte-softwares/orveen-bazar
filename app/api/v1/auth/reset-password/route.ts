import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/validation/auth.schema";
import { ok } from "@/lib/api/response";
import { UnauthorizedError, withApiHandler } from "@/lib/api/errors";

// Requires the short-lived "recovery" session Supabase establishes in the
// browser after the user follows their emailed reset link — the reset-
// password page must have already exchanged that link before calling this.
export const POST = withApiHandler(async (request: Request) => {
  const body = resetPasswordSchema.parse(await request.json());
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new UnauthorizedError("Your reset link has expired. Request a new one.");
  }

  const { error } = await supabase.auth.updateUser({ password: body.password });
  if (error) {
    throw new UnauthorizedError("Could not update your password. Request a new reset link.");
  }

  return ok({ message: "Password updated." });
});
