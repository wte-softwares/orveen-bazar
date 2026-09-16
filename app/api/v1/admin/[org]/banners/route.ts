import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccess } from "@/lib/api/org-guard";
import { createBannerSchema } from "@/lib/validation/banner.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishDraftAsset } from "@/lib/storage/publish";
import { ok } from "@/lib/api/response";
import { UnauthorizedError, withApiHandler } from "@/lib/api/errors";

export const GET = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org } = await params;
    const organization = await requireOrgAccess(auth, org);

    const { data, error } = await auth.supabase
      .from("banners")
      .select("id, image_path, alt_text, target_url, sort_order, is_active")
      .eq("organization_id", organization.id)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return ok(data);
  },
);

export const POST = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org } = await params;
    const organization = await requireOrgAccess(auth, org);
    const body = createBannerSchema.parse(await request.json());

    // Banners have no separate draft-preview authoring state the way
    // catalog items do (the brief's editor rules describe "preview before
    // publish" for the item editor specifically) — an active banner's image
    // is published immediately on create, through the same shared pipeline
    // used by items, rather than a second, divergent implementation.
    if (body.isActive) {
      await publishDraftAsset(createAdminClient(), body.imagePath);
    }

    const { data, error } = await auth.supabase
      .from("banners")
      .insert({
        organization_id: organization.id,
        image_path: body.imagePath,
        alt_text: body.altText,
        target_url: body.targetUrl ?? null,
        sort_order: body.sortOrder,
        is_active: body.isActive,
      })
      .select("id, image_path, alt_text, target_url, sort_order, is_active")
      .single();

    if (error) throw error;
    return ok(data, { status: 201 });
  },
);
