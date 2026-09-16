import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccess } from "@/lib/api/org-guard";
import { assertCategoryInOrganization } from "@/lib/queries/catalog";
import { createItemSchema } from "@/lib/validation/item.schema";
import { parsePagination } from "@/lib/api/pagination";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishDraftAsset } from "@/lib/storage/publish";
import { ok } from "@/lib/api/response";
import { ApiError, ConflictError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";

// price/compare_at_price are display-only (see AGENTS.md). item_images is
// the item's gallery — index 0 is the cover image by convention.
const ADMIN_ITEM_LIST_COLUMNS =
  "id, slug, title, type, status, price, compare_at_price, item_images(image_path, sort_order), category:categories(id, slug, name)";

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
      .order("sort_order", { referencedTable: "item_images" })
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
        price: body.price,
        compare_at_price: body.compareAtPrice ?? null,
      })
      .select("id, slug, title, type, status")
      .single();

    if (error) {
      // Postgres unique_violation on (organization_id, slug) — a friendly
      // 409 instead of the raw constraint error.
      if (error.code === "23505") {
        throw new ConflictError("An item with this slug already exists for this brand.");
      }
      // 23514 (check_violation) covers both the enforce_item_category_same_
      // organization trigger AND the compare-at-price check constraint —
      // the pre-checks above (and the Zod refine) should always catch these
      // first, but a race could still reach the database directly, so map
      // either to a clean 422 as a backstop rather than a raw 500.
      if (error.code === "23514") {
        throw new ApiError(422, "invalid_item", "Check the category and price fields and try again.");
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

    if (body.images.length > 0) {
      const { error: imageError } = await auth.supabase.from("item_images").insert(
        body.images.map((image, index) => ({
          item_id: item.id,
          image_path: image.path,
          alt_text: image.altText ?? null,
          sort_order: image.sortOrder ?? index,
        })),
      );
      if (imageError) throw imageError;

      // Creating an item as already-published (one-step create-and-publish)
      // still goes through the copy-then-flip pipeline — the row above is
      // already 'published' by the time we get here, but the images must
      // exist in the public bucket regardless of insert order, so publish
      // them now rather than leaving a published row with private images.
      if (body.status === "published") {
        const adminClient = createAdminClient();
        for (const image of body.images) {
          await publishDraftAsset(adminClient, image.path);
        }
      }
    }

    return ok(item, { status: 201 });
  },
);
