import { notImplemented } from "@/lib/api/response";

// POST — new password, requires the recovery session established by
// following the emailed reset link -> supabase.auth.updateUser().
export async function POST() {
  return notImplemented("POST /api/v1/auth/reset-password");
}
