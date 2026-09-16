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
  "id, organization_id, category_id, type, title, slug, description, status, image_path, item_variants(id, label, value, sort_order)";

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
      .select("id, status, image_path")
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
    if (body.imagePath !== undefined) updates.image_path = body.imagePath;

    // Use the incoming image_path when this same request also changes it
    // (e.g. the editor uploads a new image and hits publish together), not
    // just the row's previous one.
    const nextImagePath = body.imagePath !== undefined ? body.imagePath : existing.image_path;

    // Publish pipeline: copy the draft image to the public bucket BEFORE
    // the row's status flips to 'published', so the object is guaranteed to
    // exist by the time anything can link to it publicly. Unpublish is the
    // mirror: flip the row first (below), then scrub the public copy in
    // this same request. See lib/storage/publish.ts.
    const isPublishing = body.status === "published" && existing.status !== "published";
    const isUnpublishing = body.status && body.status !== "published" && existing.status === "published";
    const adminClient = isPublishing || isUnpublishing ? createAdminClient() : null;

    // Copy-then-flip: the draft image must exist in the public bucket
    // BEFORE the row's status changes, so nothing can ever link to a
    // "published" row whose public image doesn't exist yet.
    if (isPublishing && nextImagePath && adminClient) {
      await publishDraftAsset(adminClient, nextImagePath);
    }

    const { data: updated, error: updateError } = await auth.supabase
      .from("catalog_items")
      .update(updates)
      .eq("id", id)
      .select("id, slug, title, type, status")
      .single();

    if (updateError) {
      if (updateError.code === "23505") {
        throw new ConflictError("An item with this slug already exists for this brand.");
      }
      // Backstop for the cross-tenant category trigger — see the identical
      // comment in ../route.ts's POST handler.
      if (updateError.code === "23514") {
        throw new ApiError(422, "invalid_category", "Choose a category that belongs to this brand.");
      }
      throw updateError;
    }

    // Flip-then-delete: the row is already non-public by the time the
    // object is scrubbed, in this same request — no background job, no
    // window where a now-private item's image is still publicly fetchable.
    if (isUnpublishing && existing.image_path && adminClient) {
      await unpublishAsset(adminClient, existing.image_path);
    }

    // Variants are replaced wholesale when provided, rather than diffed —
    // simple and correct for a list that's at most a handful of rows per
    // item. Delete-then-insert instead of upsert so removed variants are
    // actually removed, not just left stale.
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
      .select("id, status, image_path")
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

    if (existing.status === "published" && existing.image_path) {
      await unpublishAsset(createAdminClient(), existing.image_path);
    }

    return ok({ archived: true });
  },
);
