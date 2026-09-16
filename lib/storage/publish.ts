import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { ApiError } from "@/lib/api/errors";

/**
 * The single shared publish/unpublish pipeline for catalog items, banners,
 * and organization logos alike — one implementation, not one per screen
 * (see docs/ARCHITECTURE.md, "Storage strategy").
 *
 * Uses the service-role client (lib/supabase/admin.ts) because moving an
 * object between buckets on the caller's behalf is exactly the kind of
 * operation that should NOT run under the caller's own RLS-scoped
 * permissions. The calling Route Handler must have already run
 * `lib/api/org-guard.ts`'s `requireOrgAccess` (and, for organization
 * settings, `requirePlatformAdmin`) BEFORE calling either function here —
 * this module does not re-check authorization, it trusts its caller.
 */

/**
 * Copies an object from the private `org-drafts` bucket to the public
 * `org-public` bucket at the SAME path, then returns once the copy is
 * confirmed. Call this BEFORE flipping the owning row's status/is_active
 * flag to published/active — never after — so the object is guaranteed to
 * exist by the time anything can link to it publicly.
 *
 * Removes any existing object at the destination path first, so
 * republishing after an edit overwrites cleanly instead of failing on an
 * already-exists conflict or leaving a stale duplicate.
 */
export async function publishDraftAsset(adminClient: SupabaseClient<Database>, path: string): Promise<void> {
  // Best-effort cleanup of a previous publish at the same path — ignore
  // "not found," which is the expected case for a first-time publish.
  await adminClient.storage.from("org-public").remove([path]);

  const { error } = await adminClient.storage
    .from("org-drafts")
    .copy(path, path, { destinationBucket: "org-public" });

  if (error) {
    throw new ApiError(
      502,
      "publish_failed",
      "Could not publish the uploaded image. Please try again.",
    );
  }
}

/**
 * Removes an object from the public `org-public` bucket. Call this AFTER
 * flipping the owning row's status/is_active flag to unpublished/inactive
 * in the SAME request — never as a background job — so there is no window
 * where a now-private row's image is still fetchable by guessing its old
 * public URL. The draft copy in `org-drafts` is left untouched so the item
 * can be republished later without re-uploading.
 */
export async function unpublishAsset(adminClient: SupabaseClient<Database>, path: string): Promise<void> {
  const { error } = await adminClient.storage.from("org-public").remove([path]);
  if (error) {
    throw new ApiError(
      502,
      "unpublish_failed",
      "Could not remove the previously published image. Please try again.",
    );
  }
}

/** Public URL for an object already confirmed to be in `org-public`. */
export function getPublicAssetUrl(supabase: SupabaseClient<Database>, path: string): string {
  return supabase.storage.from("org-public").getPublicUrl(path).data.publicUrl;
}
