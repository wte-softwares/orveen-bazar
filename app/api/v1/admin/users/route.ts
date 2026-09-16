import { getAuthContext } from "@/lib/api/auth";
import { requirePlatformAdmin } from "@/lib/api/org-guard";
import { grantAccessSchema } from "@/lib/validation/membership.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok } from "@/lib/api/response";
import { ApiError, ConflictError, NotFoundError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";

/**
 * Looks up every user's email via the admin API and returns a Map keyed by
 * id. Fine for this MVP's small admin/staff headcount (the brief's whole
 * premise is ~a handful of staff across 3 brands) — listUsers() has no
 * server-side email filter, so this doesn't scale to a large user base
 * without a dedicated lookup (see find_user_id_by_email for the
 * single-user equivalent used by POST below).
 */
async function loadUserEmails(userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;

  const emailById = new Map<string, string>();
  for (const user of data.users) {
    if (userIds.includes(user.id)) emailById.set(user.id, user.email ?? "");
  }
  return emailById;
}

export const GET = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();
  await requirePlatformAdmin(auth);

  const [{ data: memberships, error: membershipsError }, { data: admins, error: adminsError }] =
    await Promise.all([
      auth.supabase
        .from("memberships")
        .select("id, user_id, role, organization:organizations(id, slug, name)"),
      auth.supabase.from("platform_admins").select("user_id"),
    ]);

  if (membershipsError) throw membershipsError;
  if (adminsError) throw adminsError;

  const allUserIds = [
    ...(memberships ?? []).map((m) => m.user_id),
    ...(admins ?? []).map((a) => a.user_id),
  ];
  const emailById = await loadUserEmails(allUserIds);

  return ok({
    memberships: (memberships ?? []).map((m) => ({ ...m, email: emailById.get(m.user_id) ?? null })),
    platformAdmins: (admins ?? []).map((a) => ({ ...a, email: emailById.get(a.user_id) ?? null })),
  });
});

export const POST = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();
  await requirePlatformAdmin(auth);

  const body = grantAccessSchema.parse(await request.json());

  const { data: userId, error: lookupError } = await auth.supabase.rpc(
    "find_user_id_by_email",
    { lookup_email: body.email },
  );
  if (lookupError) throw lookupError;
  if (!userId) {
    throw new NotFoundError("No account found with that email. They must register first.");
  }

  const admin = createAdminClient();

  if (body.grantPlatformAdmin) {
    const { error } = await admin.from("platform_admins").insert({ user_id: userId });
    if (error) {
      if (error.code === "23505") throw new ConflictError("This user is already a platform admin.");
      throw error;
    }
    return ok({ granted: "platform_admin", userId }, { status: 201 });
  }

  if (!body.organizationId) {
    // Guarded by the schema's refine(), but keeps TypeScript honest below.
    throw new ApiError(422, "validation_failed", "An organization is required.");
  }

  const { error } = await admin
    .from("memberships")
    .insert({ user_id: userId, organization_id: body.organizationId, role: "staff" });

  if (error) {
    if (error.code === "23505") throw new ConflictError("This user already has access to that organization.");
    throw error;
  }

  return ok({ granted: "membership", userId, organizationId: body.organizationId }, { status: 201 });
});
