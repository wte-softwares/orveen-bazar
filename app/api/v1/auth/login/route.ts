import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth.schema";
import { ok } from "@/lib/api/response";
import { ApiError, withApiHandler } from "@/lib/api/errors";

export const POST = withApiHandler(async (request: Request) => {
  const body = loginSchema.parse(await request.json());
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  if (error) {
    // Deliberately the same generic message whether the email doesn't exist
    // or the password is wrong — distinguishing the two would let an
    // attacker enumerate registered emails via this endpoint.
    throw new ApiError(401, "invalid_credentials", "Incorrect email or password.");
  }

  return ok({ userId: data.user.id });
});
