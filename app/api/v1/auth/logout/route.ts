import { notImplemented } from "@/lib/api/response";

// POST — supabase.auth.signOut(), clears the session cookie.
export async function POST() {
  return notImplemented("POST /api/v1/auth/logout");
}
