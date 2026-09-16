import { notImplemented } from "@/lib/api/response";

// GET  — items in :org (any status), staff-of-:org or platform-admin only.
// POST — create an item in :org; validated by lib/validation/item.schema.ts,
// authorized by lib/api/org-guard.ts before touching the DB.
//
// Every handler in this admin/[org]/** family must call org-guard first —
// a forged :org in the URL must fail here AND be independently blocked by
// Row Level Security (see docs/RLS_POLICIES.md).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ org: string }> },
) {
  await params;
  return notImplemented("GET /api/v1/admin/[org]/items");
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ org: string }> },
) {
  await params;
  return notImplemented("POST /api/v1/admin/[org]/items");
}
