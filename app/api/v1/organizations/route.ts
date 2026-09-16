import { notImplemented } from "@/lib/api/response";

// GET — public list of active organizations, via lib/queries/brands.ts
// (the same module the family homepage Server Component uses).
export async function GET() {
  return notImplemented("GET /api/v1/organizations");
}
