import { getAuthContext } from "@/lib/api/auth";
import { requireOrgAccess, requirePlatformAdmin } from "@/lib/api/org-guard";
import { updateOrganizationSettingsSchema } from "@/lib/validation/organization.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishDraftAsset } from "@/lib/storage/publish";
import { ok } from "@/lib/api/response";
import { UnauthorizedError, withApiHandler } from "@/lib/api/errors";
import type { Database } from "@/types/database.types";

type OrganizationUpdate = Database["public"]["Tables"]["organizations"]["Update"];

export const GET = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org } = await params;
    // Readable by any staff member of this org, or a platform admin — the
    // stricter admin-only check applies to writes below, not reads.
    const organization = await requireOrgAccess(auth, org);
    return ok(organization);
  },
);

export const PATCH = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ org: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();

    const { org } = await params;
    const organization = await requireOrgAccess(auth, org);
    // Brand settings are platform-admin-only writes, even for staff who
    // otherwise manage this org's items/categories/banners — see
    // docs/RLS_POLICIES.md. This check runs BEFORE the database write for a
    // clean 403; RLS enforces the identical rule independently underneath.
    await requirePlatformAdmin(auth);

    const body = updateOrganizationSettingsSchema.parse(await request.json());

    if (body.logoPath) {
      await publishDraftAsset(createAdminClient(), body.logoPath);
    }

    const updates: OrganizationUpdate = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.contactText !== undefined) updates.contact_text = body.contactText;
    if (body.logoPath !== undefined) updates.logo_path = body.logoPath;

    const { data, error } = await auth.supabase
      .from("organizations")
      .update(updates)
      .eq("id", organization.id)
      .select("id, slug, name, description, logo_path, contact_text")
      .single();

    if (error) throw error;
    return ok(data);
  },
);
