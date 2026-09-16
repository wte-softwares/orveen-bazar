import { notImplemented } from "@/lib/api/response";

// GET — returns the current user + profile (or 401), via lib/api/auth.ts's
// dual cookie/bearer-token resolution. This is the bootstrap call a future
// Android client makes on launch to check for an existing session.
export async function GET() {
  return notImplemented("GET /api/v1/auth/session");
}
