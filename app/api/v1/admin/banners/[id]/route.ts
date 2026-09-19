import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccessById } from "@/lib/api/org-guard";
import { updateBannerSchema } from "@/lib/validation/banner.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishDraftAsset, unpublishAsset } from "@/lib/storage/publish";
import { ok } from "@/lib/api/response";
import { NotFoundError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";
import type { Database } from "@/types/database.types";

type BannerUpdate = Database["public"]["Tables"]["banners"]["Update"];

export const PATCH = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { id } = await params;
    const body = updateBannerSchema.parse(await request.json());

    const { data: existing, error: fetchError } = await auth.supabase
      .from("banners")
      .select("id, organization_id, image_path, is_active")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundError("Banner not found.");

    // Security check: must have access to existing banner's organization
    await requireOrgAccessById(auth, existing.organization_id);

    // If changing organization_id, must have access to new organization as well
    if (body.organizationId && body.organizationId !== existing.organization_id) {
      await requireOrgAccessById(auth, body.organizationId);
    }

    const updates: BannerUpdate = {};
    if (body.organizationId !== undefined) updates.organization_id = body.organizationId;
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
      .select("id, organization_id, image_path, alt_text, target_url, sort_order, is_active, created_at, updated_at, organization:organizations(id, slug)")
      .single();

    if (error) throw error;

    if (isDeactivating && existing.image_path) {
      await unpublishAsset(createAdminClient(), existing.image_path);
    }

    return ok(updated);
  },
);

export const DELETE = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { id } = await params;

    const { data: existing, error: fetchError } = await auth.supabase
      .from("banners")
      .select("id, organization_id, image_path, is_active")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) throw new NotFoundError("Banner not found.");

    await requireOrgAccessById(auth, existing.organization_id);

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
