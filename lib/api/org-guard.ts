/**
 * PHASE 2 MODULE — not implemented yet.
 *
 * The single shared helper every `admin/[org]/**` Route Handler calls to
 * answer "is the caller a platform admin, or an active staff member of
 * :org?" — returning a clean 403 before the DB is ever touched.
 *
 * This exists so every admin route enforces organization membership the same
 * way instead of each route hand-rolling the check (which is how the
 * forged-organization-ID class of bug creeps in). Row Level Security still
 * enforces the same rule independently at the database layer — this helper
 * is defense-in-depth for a clean error response, not a substitute for RLS.
 *
 * Exports to add here: `requireOrgAccess(request, organizationSlugOrId)`.
 *
 * See docs/RLS_POLICIES.md and AGENTS.md for the full design.
 */
export {};
