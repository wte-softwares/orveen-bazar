import { getAuthContext } from "@/lib/api/auth";
import { requirePlatformAdmin } from "@/lib/api/org-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok } from "@/lib/api/response";
import { NotFoundError, UnauthorizedError, withApiHandler } from "@/lib/api/errors";

export const POST = withApiHandler(
  async (request: Request, { params }: { params: Promise<{ userId: string }> }) => {
    const auth = await getAuthContext(request);
    if (!auth) throw new UnauthorizedError();
    await requirePlatformAdmin(auth);

    const { userId } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user || !data.user.email) {
      throw new NotFoundError("User not found.");
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";
    const displayName = (data.user.user_metadata?.display_name as string) || data.user.email.split("@")[0];

    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(data.user.email, {
      data: { display_name: displayName },
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (inviteError) throw inviteError;

    return ok({ resent: true, email: data.user.email });
  },
);
