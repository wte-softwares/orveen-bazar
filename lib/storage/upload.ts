import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { ApiError } from "@/lib/api/errors";

/** Must match the `allowed_mime_types` set on both buckets in the storage migration. */
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB — matches the buckets' file_size_limit.

export type DraftAssetKind = "items" | "banners" | "logos";

/**
 * Builds the object path every draft/publish operation for one asset agrees
 * on: `{organizationId}/{kind}/{ownerId}/{filename}`. Keeping this in one
 * function is what lets `lib/storage/publish.ts` copy the exact same path
 * into the public bucket, and lets republishing reuse it (`upsert: true`)
 * instead of accumulating orphaned old versions.
 */
export function buildDraftAssetPath(
  organizationId: string,
  kind: DraftAssetKind,
  ownerId: string,
  fileName: string,
) {
  // Strip anything that isn't a safe filename character — the original name
  // is only kept for readability in Storage, never trusted as a path.
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  return `${organizationId}/${kind}/${ownerId}/${safeName}`;
}

/**
 * Issues a short-lived signed upload URL into the private `org-drafts`
 * bucket. The caller must have already run `lib/api/org-guard.ts`'s
 * `requireOrgAccess` for `organizationId` — this function trusts that the
 * request is authorized and only handles the storage mechanics.
 */
export async function createSignedDraftUploadUrl(
  supabase: SupabaseClient<Database>,
  path: string,
  contentType: string,
  fileSizeBytes: number,
) {
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    throw new ApiError(422, "unsupported_file_type", "Only PNG, JPEG, and WebP images are allowed.");
  }
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new ApiError(422, "file_too_large", "Images must be 5 MB or smaller.");
  }

  const { data, error } = await supabase.storage
    .from("org-drafts")
    .createSignedUploadUrl(path, { upsert: true });

  if (error) {
    throw new ApiError(502, "upload_url_failed", "Could not prepare the upload. Please try again.");
  }

  return data;
}
