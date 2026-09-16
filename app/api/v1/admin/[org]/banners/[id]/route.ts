import { notImplemented } from "@/lib/api/response";

// PATCH  — update a banner's fields / active state; active transitions go
// through lib/storage/publish.ts like catalog items.
// DELETE — archives/deactivates rather than a hard delete.
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ org: string; id: string }> },
) {
  await params;
  return notImplemented("PATCH /api/v1/admin/[org]/banners/[id]");
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ org: string; id: string }> },
) {
  await params;
  return notImplemented("DELETE /api/v1/admin/[org]/banners/[id]");
}
