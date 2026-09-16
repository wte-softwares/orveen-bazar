import { notImplemented } from "@/lib/api/response";

// DELETE — revoke a membership or platform-admin grant. PLATFORM ADMIN ONLY.
// Access is revoked on the user's very next request — membership is checked
// live via lib/api/org-guard.ts on every call, never cached in a JWT claim.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  await params;
  return notImplemented("DELETE /api/v1/admin/users/[userId]");
}
