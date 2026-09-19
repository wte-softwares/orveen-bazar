import { getAuthContext } from "@/lib/api/auth";
import { requirePlatformAdmin } from "@/lib/api/org-guard";
import { grantAccessSchema } from "@/lib/validation/membership.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok } from "@/lib/api/response";
import { ApiError, ConflictError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";

import { listAdminUsers } from "@/lib/queries/admin";

export const GET = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();
  await requirePlatformAdmin(auth);

  const result = await listAdminUsers();
  return ok(result);
});

export const POST = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();
  await requirePlatformAdmin(auth);

  const body = grantAccessSchema.parse(await request.json());

  // Check if user already exists in auth.users
  const { data: existingUserId, error: lookupError } = await auth.supabase.rpc(
    "find_user_id_by_email",
    { lookup_email: body.email },
  );
  if (lookupError) throw lookupError;

  const admin = createAdminClient();

  if (existingUserId) {
    // User exists — grant requested role directly
    if (body.grantPlatformAdmin) {
      const { error } = await admin.from("platform_admins").insert({ user_id: existingUserId });
      if (error) {
        if (error.code === "23505") throw new ConflictError("This user is already a platform admin.");
        throw error;
      }
      return ok({ granted: "platform_admin", status: "assigned", userId: existingUserId }, { status: 201 });
    }

    if (!body.organizationId) {
      throw new ApiError(422, "validation_failed", "An organization is required for staff roles.");
    }

    const { error } = await admin
      .from("memberships")
      .insert({ user_id: existingUserId, organization_id: body.organizationId, role: "staff" });

    if (error) {
      if (error.code === "23505") throw new ConflictError("This user already has access to that organization.");
      throw error;
    }

    return ok(
      { granted: "membership", status: "assigned", userId: existingUserId, organizationId: body.organizationId },
      { status: 201 },
    );
  }

  // User does NOT exist — invite them via Supabase Auth Admin API
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";
  const displayName = body.displayName || body.email.split("@")[0];

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    body.email,
    {
      data: { display_name: displayName },
      redirectTo: `${siteUrl}/reset-password`,
    },
  );
  if (inviteError) throw inviteError;

  const newUserId = inviteData.user.id;

  // Populate profile display name
  await admin.from("profiles").upsert(
    { user_id: newUserId, display_name: displayName },
    { onConflict: "user_id" },
  );

  if (body.grantPlatformAdmin) {
    const { error: adminError } = await admin.from("platform_admins").insert({ user_id: newUserId });
    if (adminError) throw adminError;
    return ok({ granted: "platform_admin", status: "invited", userId: newUserId }, { status: 201 });
  }

  if (!body.organizationId) {
    throw new ApiError(422, "validation_failed", "An organization is required for staff roles.");
  }

  const { error: membershipError } = await admin
    .from("memberships")
    .insert({ user_id: newUserId, organization_id: body.organizationId, role: "staff" });
  if (membershipError) throw membershipError;

  return ok(
    { granted: "membership", status: "invited", userId: newUserId, organizationId: body.organizationId },
    { status: 201 },
  );
});
