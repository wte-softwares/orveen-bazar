/**
 * PHASE 2 MODULE — not implemented yet.
 *
 * Zod schema for creating/editing a banner (image, alt text, target URL,
 * sort_order, is_active). `target_url` must be validated as a safe relative
 * path or same-origin/https URL — never allow arbitrary scheme values
 * (e.g. `javascript:`) since banner links render as-is on the public site.
 */
export {};
