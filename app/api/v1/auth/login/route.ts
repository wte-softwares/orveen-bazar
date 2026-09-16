import { notImplemented } from "@/lib/api/response";

// POST — email, password -> supabase.auth.signInWithPassword(), sets the
// session cookie via lib/supabase/server.ts.
export async function POST() {
  return notImplemented("POST /api/v1/auth/login");
}
