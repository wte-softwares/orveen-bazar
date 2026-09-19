import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccessById } from "@/lib/api/org-guard";
import { createBannerSchema } from "@/lib/validation/banner.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishDraftAsset } from "@/lib/storage/publish";
import { listAllAdminBanners } from "@/lib/queries/banners";
import { ok } from "@/lib/api/response";
import { ApiError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";

export const GET = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();

  const url = new URL(request.url);
  const orgParam = url.searchParams.get("org");

  if (orgParam) {
    let query = auth.supabase
      .from("banners")
      .select("id, organization_id, image_path, alt_text, target_url, sort_order, is_active, created_at, updated_at, organization:organizations(id, slug)")
      .order("sort_order", { ascending: true });

    // Filter by organization slug or ID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgParam)) {
      query = query.eq("organization_id", orgParam);
    } else {
      const { data: org } = await auth.supabase
        .from("organizations")
        .select("id")
        .eq("slug", orgParam)
        .maybeSingle();
      if (org) {
        query = query.eq("organization_id", org.id);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return ok(data);
  }

  // List all banners across all orgs (RLS scoped for staff, all for platform admins)
  const banners = await listAllAdminBanners(auth.supabase);
  return ok(banners);
});

export const POST = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();

  const body = createBannerSchema.parse(await request.json());

  if (!body.organizationId) {
    throw new ApiError(422, "validation_failed", "organizationId is required to create a banner.");
  }

  // Security gate: verify user has access to target organization or is platform admin
  await requireOrgAccessById(auth, body.organizationId);

  if (body.isActive) {
    await publishDraftAsset(createAdminClient(), body.imagePath);
  }

  const { data, error } = await auth.supabase
    .from("banners")
    .insert({
      organization_id: body.organizationId,
      image_path: body.imagePath,
      alt_text: body.altText,
      target_url: body.targetUrl ?? null,
      sort_order: body.sortOrder,
      is_active: body.isActive,
    })
    .select("id, organization_id, image_path, alt_text, target_url, sort_order, is_active, created_at, updated_at, organization:organizations(id, slug)")
    .single();

  if (error) throw error;
  return ok(data, { status: 201 });
});
