import { notImplemented } from "@/lib/api/response";

// POST — supabase.auth.resetPasswordForEmail(). Always returns the same
// success response whether or not the email exists, to avoid leaking account
// existence.
export async function POST() {
  return notImplemented("POST /api/v1/auth/forgot-password");
}
