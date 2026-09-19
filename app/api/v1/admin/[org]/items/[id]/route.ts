import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccess } from "@/lib/api/org-guard";
import { assertCategoryInOrganization } from "@/lib/queries/catalog";
import { updateItemSchema } from "@/lib/validation/item.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishDraftAsset, unpublishAsset } from "@/lib/storage/publish";
import { ok } from "@/lib/api/response";
import { ApiError, ConflictError, NotFoundError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";
import type { Database } from "@/types/database.types";

type CatalogItemUpdate = Database["public"]["Tables"]["catalog_items"]["Update"];

const ITEM_EDITOR_COLUMNS =
  "id, organization_id, category_id, type, title, slug, description, status, price, compare_at_price, item_images(id, image_path, alt_text, sort_order), item_variants(id, label, value, sort_order)";

export const GET = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string; id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org, id } = await params;
    const organization = await requireOrgAccess(auth, org);

    const { data: item, error } = await auth.supabase
      .from("catalog_items")
      .select(ITEM_EDITOR_COLUMNS)
      .eq("id", id)
      .eq("organization_id", organization.id)
      .order("sort_order", { referencedTable: "item_variants" })
      .order("sort_order", { referencedTable: "item_images" })
      .maybeSingle();

    if (error) throw error;
    if (!item) throw new NotFoundError("Item not found.");
    return ok(item);
  },
);

export const PATCH = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string; id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org, id } = await params;
    const organization = await requireOrgAccess(auth, org);
    const body = updateItemSchema.parse(await request.json());

    const { data: existing, error: fetchError } = await auth.supabase
      .from("catalog_items")
      .select("id, status, item_images(image_path)")
      .eq("id", id)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundError("Item not found.");

    const updates: CatalogItemUpdate = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.type !== undefined) updates.type = body.type;
    if (body.description !== undefined) updates.description = body.description;
    if (body.categoryId !== undefined) {
      await assertCategoryInOrganization(auth.supabase, body.categoryId, organization.id);
      updates.category_id = body.categoryId;
    }
    if (body.status !== undefined) updates.status = body.status;
    if (body.price !== undefined) updates.price = body.price;
    if (body.compareAtPrice !== undefined) updates.compare_at_price = body.compareAtPrice;

    // Use the incoming image set when this same request also replaces it
    // (e.g. the editor uploads new photos and hits publish together), not
    // just the row's previous gallery.
    const existingPaths = (existing.item_images ?? []).map((image) => image.image_path);
    const nextImagePaths = body.images !== undefined ? body.images.map((image) => image.path) : existingPaths;

    // Publish pipeline: copy every draft image to the public bucket BEFORE
    // the row's status flips to 'published', so every object is guaranteed
    // to exist by the time anything can link to it publicly. Unpublish is
    // the mirror: flip the row first (below), then scrub the public copies
    // in this same request. See lib/storage/publish.ts.
    const isPublishing = body.status === "published" && existing.status !== "published";
    const isUnpublishing = body.status && body.status !== "published" && existing.status === "published";
    const currentOrNewStatus = body.status ?? existing.status;
    const adminClient = isPublishing || isUnpublishing || (currentOrNewStatus === "published" && body.images !== undefined) ? createAdminClient() : null;

    if (adminClient && (isPublishing || (currentOrNewStatus === "published" && body.images !== undefined))) {
      for (const imagePath of nextImagePaths) {
        await publishDraftAsset(adminClient, imagePath);
      }
    }

    const { data: updated, error: updateError } = await auth.supabase
      .from("catalog_items")
      .update(updates)
      .eq("id", id)
      .select("id, slug, title, type, status, price, compare_at_price")
      .single();

    if (updateError) {
      if (updateError.code === "23505") {
        throw new ConflictError("An item with this slug already exists for this brand.");
      }
      // Backstop for the cross-tenant category trigger AND the compare-at-
      // price check constraint — see the identical comment in ../route.ts's
      // POST handler.
      if (updateError.code === "23514") {
        throw new ApiError(422, "invalid_item", "Check the category and price fields and try again.");
      }
      throw updateError;
    }

    // Flip-then-delete: the row is already non-public by the time each
    // object is scrubbed, in this same request — no background job, no
    // window where a now-private item's images are still publicly fetchable.
    if (isUnpublishing && adminClient) {
      for (const imagePath of existingPaths) {
        await unpublishAsset(adminClient, imagePath);
      }
    }

    // Variants and images are each replaced wholesale when provided, rather
    // than diffed — simple and correct for lists that are at most a handful
    // of rows per item. Delete-then-insert instead of upsert so removed
    // rows are actually removed, not just left stale.
    if (body.variants !== undefined) {
      const { error: deleteError } = await auth.supabase
        .from("item_variants")
        .delete()
        .eq("item_id", id);
      if (deleteError) throw deleteError;

      if (body.variants.length > 0) {
        const { error: insertError } = await auth.supabase.from("item_variants").insert(
          body.variants.map((variant) => ({
            item_id: id,
            label: variant.label,
            value: variant.value,
            sort_order: variant.sortOrder,
          })),
        );
        if (insertError) throw insertError;
      }
    }

    if (body.images !== undefined) {
      const { error: deleteError } = await auth.supabase.from("item_images").delete().eq("item_id", id);
      if (deleteError) throw deleteError;

      if (body.images.length > 0) {
        const { error: insertError } = await auth.supabase.from("item_images").insert(
          body.images.map((image, index) => ({
            item_id: id,
            image_path: image.path,
            alt_text: image.altText ?? null,
            sort_order: image.sortOrder ?? index,
          })),
        );
        if (insertError) throw insertError;
      }
    }

    return ok(updated);
  },
);

// Archives rather than hard-deleting, per the brief ("archive with
// confirmation instead of destructive deletion").
export const DELETE = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string; id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org, id } = await params;
    const organization = await requireOrgAccess(auth, org);

    const { data: existing, error: fetchError } = await auth.supabase
      .from("catalog_items")
      .select("id, status, item_images(image_path)")
      .eq("id", id)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundError("Item not found.");

    const { error: updateError } = await auth.supabase
      .from("catalog_items")
      .update({ status: "archived" })
      .eq("id", id);

    if (updateError) throw updateError;

    if (existing.status === "published" && existing.item_images?.length) {
      const adminClient = createAdminClient();
      for (const image of existing.item_images) {
        await unpublishAsset(adminClient, image.image_path);
      }
    }

    return ok({ archived: true });
  },
);
