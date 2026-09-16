import { notImplemented } from "@/lib/api/response";

// GET  — banners in :org, staff-of-:org or platform-admin only.
// POST — create a banner in :org; validated by
// lib/validation/banner.schema.ts, authorized by lib/api/org-guard.ts.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ org: string }> },
) {
  await params;
  return notImplemented("GET /api/v1/admin/[org]/banners");
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ org: string }> },
) {
  await params;
  return notImplemented("POST /api/v1/admin/[org]/banners");
}
