import { createClient } from "@/lib/supabase/server";
import { findPublishedItemBySlug } from "@/lib/queries/catalog";
import { ok } from "@/lib/api/response";
import { NotFoundError, withApiHandler } from "@/lib/api/errors";

export const GET = withApiHandler(
  async (_request: Request, { params }: { params: Promise<{ org: string; item: string }> }) => {
    const { org, item } = await params;
    const supabase = await createClient();
    const catalogItem = await findPublishedItemBySlug(supabase, org, item);

    // Covers all three "not visible" cases at once: item missing, item not
    // published/archived, or the parent organization inactive — the query
    // in lib/queries/catalog.ts already filters on all of them, so a null
    // result here means "not found" regardless of which reason applied.
    if (!catalogItem) throw new NotFoundError("Item not found.");
    return ok(catalogItem);
  },
);
