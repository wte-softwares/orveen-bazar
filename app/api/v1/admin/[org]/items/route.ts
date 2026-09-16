import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccess } from "@/lib/api/org-guard";
import { assertCategoryInOrganization } from "@/lib/queries/catalog";
import { createItemSchema } from "@/lib/validation/item.schema";
import { parsePagination } from "@/lib/api/pagination";
import { ok } from "@/lib/api/response";
import { ApiError, ConflictError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";

const ADMIN_ITEM_LIST_COLUMNS =
  "id, slug, title, type, status, image_path, category:categories(id, slug, name)";

export const GET = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org } = await params;
    const organization = await requireOrgAccess(auth, org);

    const { searchParams } = new URL(request.url);
    const { page, pageSize, from, to } = parsePagination(searchParams);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("q");

    let query = auth.supabase
      .from("catalog_items")
      .select(ADMIN_ITEM_LIST_COLUMNS, { count: "exact" })
      .eq("organization_id", organization.id);

    if (type === "product" || type === "service") query = query.eq("type", type);
    if (status === "draft" || status === "published" || status === "archived") {
      query = query.eq("status", status);
    }
    if (search) query = query.ilike("title", `%${search}%`);

    const { data, error, count } = await query
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    return ok(data, { meta: { pagination: { page, pageSize, totalCount: count ?? 0 } } });
  },
);

export const POST = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org } = await params;
    const organization = await requireOrgAccess(auth, org);
    const body = createItemSchema.parse(await request.json());
    await assertCategoryInOrganization(auth.supabase, body.categoryId, organization.id);

    const { data: item, error } = await auth.supabase
      .from("catalog_items")
      .insert({
        organization_id: organization.id,
        category_id: body.categoryId,
        type: body.type,
        title: body.title,
        slug: body.slug,
        description: body.description ?? null,
        status: body.status,
        image_path: body.imagePath ?? null,
      })
      .select("id, slug, title, type, status")
      .single();

    if (error) {
      // Postgres unique_violation on (organization_id, slug) — a friendly
      // 409 instead of the raw constraint error.
      if (error.code === "23505") {
        throw new ConflictError("An item with this slug already exists for this brand.");
      }
      // 23514 (check_violation) is the enforce_item_category_same_organization
      // trigger's error code — the assertCategoryInOrganization() pre-check
      // above should always catch this first, but a race (the category
      // moves/deletes between the check and this insert) could still reach
      // the trigger directly, so map it to the same clean 422 as a backstop.
      if (error.code === "23514") {
        throw new ApiError(422, "invalid_category", "Choose a category that belongs to this brand.");
      }
      throw error;
    }

    if (body.variants.length > 0) {
      const { error: variantError } = await auth.supabase.from("item_variants").insert(
        body.variants.map((variant) => ({
          item_id: item.id,
          label: variant.label,
          value: variant.value,
          sort_order: variant.sortOrder,
        })),
      );
      if (variantError) throw variantError;
    }

    return ok(item, { status: 201 });
  },
);
