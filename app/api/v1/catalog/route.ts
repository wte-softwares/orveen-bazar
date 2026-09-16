import { notImplemented } from "@/lib/api/response";

// GET — filtered, paginated list of published catalog items across all
// active organizations (brand/category/type filters, case-insensitive title
// search, ?page/?pageSize), via lib/queries/catalog.ts — the same module the
// public /catalog Server Component uses, so behaviour never drifts between
// the web page and this API (which the Android app will also call).
export async function GET() {
  return notImplemented("GET /api/v1/catalog");
}
