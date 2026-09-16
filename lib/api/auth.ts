/**
 * PHASE 2 MODULE — not implemented yet.
 *
 * Will resolve the calling user for a Route Handler from EITHER:
 *   - the Supabase cookie session (web client), or
 *   - an `Authorization: Bearer <access_token>` header, verified via
 *     `supabase.auth.getUser(token)` (future Android app / other clients)
 *
 * Exports to add here: `getAuthContext(request)` returning something like
 * `{ user, isPlatformAdmin, membershipOrgIds } | null`, used by every
 * protected Route Handler and by `lib/api/org-guard.ts`.
 *
 * See docs/ARCHITECTURE.md and AGENTS.md for the full design.
 */
export {};
