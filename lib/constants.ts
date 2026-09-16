/**
 * App-wide constants that don't belong to any one module. Keep this file
 * small — a constant used by exactly one feature belongs next to that
 * feature, not here.
 */

/** Default and maximum page size for any paginated `/api/v1/*` list endpoint. */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

/** The three organizations this platform serves, keyed by their route slug. */
export const ORGANIZATION_SLUGS = ["orveen-bazar", "eco-fast-bd", "reliable-multi-products"] as const;

export type OrganizationSlug = (typeof ORGANIZATION_SLUGS)[number];
