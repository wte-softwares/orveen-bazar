/**
 * PHASE 2 MODULE — not implemented yet.
 *
 * Issues short-lived signed upload URLs into the private `org-drafts`
 * Supabase Storage bucket, scoped to `{organization_id}/{type}/{id}/...` and
 * gated by the same org-membership check as `lib/api/org-guard.ts`. Backs the
 * `/api/v1/uploads` route.
 *
 * Exports to add here: `createSignedDraftUploadUrl({ organizationId, kind,
 * ownerId, fileName, contentType })`.
 *
 * See docs/ARCHITECTURE.md ("Storage strategy") for the full design.
 */
export {};
