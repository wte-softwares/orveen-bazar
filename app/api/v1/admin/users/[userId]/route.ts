import { getAuthContext } from "@/lib/api/auth";
import { requirePlatformAdmin } from "@/lib/api/org-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok } from "@/lib/api/response";
import { NotFoundError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";

// ?organizationId=<uuid> revokes that one org membership; omitted revokes
// platform-admin status. Two different grants, two different targets — a
// single implicit "delete this user's access" would be ambiguous for a
// platform admin who ALSO happens to hold a staff membership somewhere.
export const DELETE = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ userId: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();
    await requirePlatformAdmin(auth);

    const { userId } = await params;
    const organizationId = new URL(request.url).searchParams.get("organizationId");

    // Writes go through the service-role client: memberships/platform_admins
    // have no client-writable RLS policies at all (see
    // docs/RLS_POLICIES.md) — the requirePlatformAdmin() check above is what
    // authorizes this, not RLS, which is intentionally impossible to satisfy
    // as any client role here.
    const admin = createAdminClient();

    if (organizationId) {
      const { error, count } = await admin
        .from("memberships")
        .delete({ count: "exact" })
        .eq("user_id", userId)
        .eq("organization_id", organizationId);
      if (error) throw error;
      if (!count) throw new NotFoundError("Membership not found.");
      return ok({ revoked: "membership" });
    }

    const { error, count } = await admin
      .from("platform_admins")
      .delete({ count: "exact" })
      .eq("user_id", userId);
    if (error) throw error;
    if (!count) throw new NotFoundError("Platform admin grant not found.");
    return ok({ revoked: "platform_admin" });
  },
);
