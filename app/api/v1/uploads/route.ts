import { notImplemented } from "@/lib/api/response";

// POST — issues a short-lived signed upload URL into the private
// `org-drafts` Supabase Storage bucket, scoped by organization membership
// (lib/api/org-guard.ts) and validated file type/size, via
// lib/storage/upload.ts. The uploaded object only becomes publicly
// reachable once the owning item/banner/logo is published — see
// lib/storage/publish.ts and docs/ARCHITECTURE.md ("Storage strategy").
export async function POST() {
  return notImplemented("POST /api/v1/uploads");
}
