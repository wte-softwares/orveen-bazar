import { createClient } from "@/lib/supabase/server";
import { ok } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/errors";

export const POST = withApiHandler(async () => {
  const supabase = await createClient();
  // No error handling needed beyond letting withApiHandler catch anything
  // unexpected — signing out an already-signed-out session is a harmless
  // no-op, not an error worth surfacing.
  await supabase.auth.signOut();
  return ok({ signedOut: true });
});
