/**
 * PHASE 2 MODULE — not implemented yet.
 *
 * Zod schemas for the auth Route Handlers: register, login, forgot-password,
 * reset-password. Every mutating request body is validated against a schema
 * here BEFORE it reaches Supabase, so bad input returns a clean 422 with
 * field-level messages instead of a raw Supabase/Postgres error.
 */
export {};
