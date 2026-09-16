/**
 * Hand-written request/response contract types for `/api/v1/*`, shared
 * between Route Handlers and any client code (web fetch wrappers, and later
 * a reference for the Android app's own models).
 *
 * Deliberately separate from `types/database.types.ts`: that file is
 * regenerated from the schema and would silently clobber anything defined
 * here. API shapes are allowed to differ from raw table rows (e.g. omitting
 * internal columns, renaming for clarity, nesting a joined relation) — this
 * file is where that shaping is declared.
 *
 * PHASE 2: populate with per-resource request/response types as each Route
 * Handler is built (e.g. `CatalogListResponse`, `CreateItemRequest`).
 */
export {};
