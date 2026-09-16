import { createClient } from "@/lib/supabase/server";
import { listPublishedCatalogItems } from "@/lib/queries/catalog";
import { parsePagination } from "@/lib/api/pagination";
import { ok } from "@/lib/api/response";
import { withApiHandler } from "@/lib/api/errors";

const VALID_TYPES = new Set(["product", "service"]);

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, from, to } = parsePagination(searchParams);

  const typeParam = searchParams.get("type");
  const supabase = await createClient();

  const { items, totalCount } = await listPublishedCatalogItems(supabase, {
    organizationSlug: searchParams.get("org") ?? undefined,
    categorySlug: searchParams.get("category") ?? undefined,
    type: typeParam && VALID_TYPES.has(typeParam) ? (typeParam as "product" | "service") : undefined,
    search: searchParams.get("q") ?? undefined,
    from,
    to,
  });

  return ok(items, { meta: { pagination: { page, pageSize, totalCount } } });
});
