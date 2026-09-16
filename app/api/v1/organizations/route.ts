import { createClient } from "@/lib/supabase/server";
import { listActiveOrganizations } from "@/lib/queries/brands";
import { ok } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/errors";

export const GET = withApiHandler(async () => {
  const supabase = await createClient();
  const organizations = await listActiveOrganizations(supabase);
  return ok(organizations);
});
