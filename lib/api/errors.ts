/**
 * PHASE 2 MODULE — not implemented yet.
 *
 * Will define typed `ApiError` subclasses (e.g. `UnauthorizedError`,
 * `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`) and a
 * `withApiHandler()` wrapper that every Route Handler uses to:
 *   - catch thrown `ApiError`s and map them to the right HTTP status via
 *     `lib/api/response.ts`'s `fail()`
 *   - catch Zod validation errors and return 422 with field-level messages
 *   - catch anything unexpected, log it server-side, and return a generic
 *     500 (never leak internals to the client)
 *
 * See docs/ARCHITECTURE.md and AGENTS.md for the full design.
 */
export {};
