import { notImplemented } from "@/lib/api/response";

// POST — name, email, password -> supabase.auth.signUp(). Validated by
// lib/validation/auth.schema.ts. See docs/API_REFERENCE.md once implemented.
export async function POST() {
  return notImplemented("POST /api/v1/auth/register");
}
