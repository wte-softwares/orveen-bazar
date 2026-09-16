import { notImplemented } from "@/lib/api/response";

// GET   — one item's full editor data (any status), staff-of-:org or admin.
// PATCH — update fields and/or publish status; the category, if changed,
//         must belong to :org (enforced by both a Zod pre-check and a DB
//         trigger — see docs/DATA_MODEL.md). Publishing routes through
//         lib/storage/publish.ts's copy-then-flip sequence.
// DELETE — archives (status = 'archived'), never a hard delete.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ org: string; id: string }> },
) {
  await params;
  return notImplemented("GET /api/v1/admin/[org]/items/[id]");
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ org: string; id: string }> },
) {
  await params;
  return notImplemented("PATCH /api/v1/admin/[org]/items/[id]");
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ org: string; id: string }> },
) {
  await params;
  return notImplemented("DELETE /api/v1/admin/[org]/items/[id]");
}
