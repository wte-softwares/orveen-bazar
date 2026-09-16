import { notImplemented } from "@/lib/api/response";

// GET — one active organization's public profile by slug, 404 if inactive
// or missing, via lib/queries/brands.ts.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  await params;
  return notImplemented("GET /api/v1/organizations/[slug]");
}
