import { notImplemented } from "@/lib/api/response";

// GET   — :org's brand settings, readable by staff-of-:org or admin.
// PATCH — update logo/name/intro/contact text — PLATFORM ADMIN ONLY, even
// for staff who otherwise manage :org's items/categories/banners (per the
// brief's role rules). lib/api/org-guard.ts must distinguish "has org
// membership" from "is platform admin" for this one route.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ org: string }> },
) {
  await params;
  return notImplemented("GET /api/v1/admin/[org]/settings");
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ org: string }> },
) {
  await params;
  return notImplemented("PATCH /api/v1/admin/[org]/settings");
}
