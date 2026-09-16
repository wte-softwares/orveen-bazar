import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccess } from "@/lib/api/org-guard";
import { updateBannerSchema } from "@/lib/validation/banner.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishDraftAsset, unpublishAsset } from "@/lib/storage/publish";
import { ok } from "@/lib/api/response";
import { NotFoundError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";
import type { Database } from "@/types/database.types";

type BannerUpdate = Database["public"]["Tables"]["banners"]["Update"];

export const PATCH = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string; id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org, id } = await params;
    const organization = await requireOrgAccess(auth, org);
    const body = updateBannerSchema.parse(await request.json());

    const { data: existing, error: fetchError } = await auth.supabase
      .from("banners")
      .select("id, image_path, is_active")
      .eq("id", id)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundError("Banner not found.");

    const updates: BannerUpdate = {};
    if (body.imagePath !== undefined) updates.image_path = body.imagePath;
    if (body.altText !== undefined) updates.alt_text = body.altText;
    if (body.targetUrl !== undefined) updates.target_url = body.targetUrl;
    if (body.sortOrder !== undefined) updates.sort_order = body.sortOrder;
    if (body.isActive !== undefined) updates.is_active = body.isActive;

    const nextImagePath = (updates.image_path as string | undefined) ?? existing.image_path;
    const isActivating = body.isActive === true && !existing.is_active;
    const isDeactivating = body.isActive === false && existing.is_active;

    if (isActivating && nextImagePath) {
      await publishDraftAsset(createAdminClient(), nextImagePath);
    }

    const { data: updated, error } = await auth.supabase
      .from("banners")
      .update(updates)
      .eq("id", id)
      .select("id, image_path, alt_text, target_url, sort_order, is_active")
      .single();

    if (error) throw error;

    if (isDeactivating && existing.image_path) {
      await unpublishAsset(createAdminClient(), existing.image_path);
    }

    return ok(updated);
  },
);

// Deactivates rather than hard-deleting, matching the item editor's
// archive-with-confirmation pattern.
export const DELETE = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string; id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org, id } = await params;
    const organization = await requireOrgAccess(auth, org);

    const { data: existing, error: fetchError } = await auth.supabase
      .from("banners")
      .select("id, image_path, is_active")
      .eq("id", id)
      .eq("organization_id", organization.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundError("Banner not found.");

    const { error } = await auth.supabase
      .from("banners")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;

    if (existing.is_active && existing.image_path) {
      await unpublishAsset(createAdminClient(), existing.image_path);
    }

    return ok({ deactivated: true });
  },
);
