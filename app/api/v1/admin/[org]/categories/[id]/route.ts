import { notImplemented } from "@/lib/api/response";

// PATCH  — update a category's fields.
// DELETE — blocked (409/422, not a raw FK error) while any catalog_items
// row still references it — `ON DELETE RESTRICT` is the real guarantee,
// this is the friendly pre-check in front of it (see docs/DATA_MODEL.md).
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ org: string; id: string }> },
) {
  await params;
  return notImplemented("PATCH /api/v1/admin/[org]/categories/[id]");
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ org: string; id: string }> },
) {
  await params;
  return notImplemented("DELETE /api/v1/admin/[org]/categories/[id]");
}
