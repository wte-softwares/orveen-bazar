import { notImplemented } from "@/lib/api/response";

// GET — one published item's public details + variants, 404 if unpublished,
// archived, or the parent organization is inactive, via lib/queries/catalog.ts.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ org: string; item: string }> },
) {
  await params;
  return notImplemented("GET /api/v1/catalog/[org]/[item]");
}
