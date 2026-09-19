import { ok } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/errors";
import { listPublicCategories } from "@/lib/queries/categories";
import { createClient } from "@/lib/supabase/server";

/** Active category menu data for all storefront clients. */
export const GET = withApiHandler(async () => {
  const supabase = await createClient();
  return ok(await listPublicCategories(supabase));
});
