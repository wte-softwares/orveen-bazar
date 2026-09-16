import { getAuthContext } from "@/lib/api/auth";
import { ok } from "@/lib/api/response";
import { UnauthorizedError, withApiHandler } from "@/lib/api/errors";

// The bootstrap call a web page or a future Android client makes on launch
// to check for an existing session — supports both the cookie session and a
// Bearer token (see lib/api/auth.ts).
export const GET = withApiHandler(async (request: Request) => {
  const auth = await getAuthContext(request);
  if (!auth) throw new UnauthorizedError();

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  return ok({
    userId: auth.user.id,
    email: auth.user.email,
    displayName: profile?.display_name ?? null,
    isPlatformAdmin: auth.isPlatformAdmin,
    membershipOrgIds: auth.membershipOrgIds,
  });
});
