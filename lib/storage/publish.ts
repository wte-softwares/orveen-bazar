/**
 * PHASE 2 MODULE — not implemented yet.
 *
 * The single shared publish/unpublish pipeline reused by catalog items,
 * banners, and organization logos alike (one implementation, not one per
 * screen) — see docs/ARCHITECTURE.md ("Storage strategy") for why this needs
 * to be one module.
 *
 * Ordering is the whole point of this module, to close a real race
 * condition:
 *   - publish:   copy the object into the public `org-public` bucket FIRST,
 *                then flip the row's status/is_active flag — guarantees the
 *                image exists before anything can link to it publicly.
 *   - unpublish: flip the row's status/is_active flag FIRST, then delete the
 *                object from `org-public` in the SAME request — no window
 *                where a no-longer-public row's image is still fetchable by
 *                URL guess.
 *   - republish: reuse the same object path with `upsert: true` so an edited
 *                image doesn't leave the previous public copy orphaned.
 *
 * This module uses `lib/supabase/admin.ts` for the cross-bucket copy step,
 * because moving an object between buckets on the caller's behalf is exactly
 * the kind of operation that should NOT run under the caller's own RLS-scoped
 * permissions — the org-guard check happens in the calling Route Handler
 * BEFORE this module is ever invoked, not instead of it.
 *
 * Exports to add here: `publishDraftAsset(...)`, `unpublishAsset(...)`.
 */
export {};
