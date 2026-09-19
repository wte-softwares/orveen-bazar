/**
 * App-wide constants that don't belong to any one module. Keep this file
 * small — a constant used by exactly one feature belongs next to that
 * feature, not here.
 */

/** Default and maximum page size for any paginated `/api/v1/*` list endpoint. */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

export { ORGANIZATION_SLUGS, type OrganizationSlug } from "@/lib/site-config";
