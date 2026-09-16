import type { AuthContext } from "@/lib/api/auth";
import { ForbiddenError, NotFoundError } from "@/lib/api/errors";

export interface OrganizationRow {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
}

/**
 * The single check every `admin/[org]/**` Route Handler calls to answer
 * "does this caller have access to :org?" — looked up by slug, since that's
 * what appears in the URL.
 *
 * This exists so a forged or mistyped `:org` in the URL fails the same way,
 * with a clean typed error, on every one of the ~15 admin routes that take
 * an `:org` param — instead of each route hand-rolling a slightly different
 * version of this check (which is exactly how the class of bug where a
 * staff member from org A reaches org B's data creeps in).
 *
 * Row Level Security enforces the identical rule independently at the
 * database layer (see docs/RLS_POLICIES.md) — this function is
 * defense-in-depth for a clean 403/404, never the only thing standing
 * between a request and unauthorized access.
 */
export async function requireOrgAccess(
  auth: AuthContext,
  orgSlug: string,
): Promise<OrganizationRow> {
  const { data: organization, error } = await auth.supabase
    .from("organizations")
    .select("id, slug, name, is_active")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (error || !organization) {
    // Same response whether the slug doesn't exist or RLS hid it — an
    // attacker probing for valid org slugs learns nothing either way.
    throw new NotFoundError("Organization not found.");
  }

  const hasAccess =
    auth.isPlatformAdmin || auth.membershipOrgIds.includes(organization.id);

  if (!hasAccess) {
    throw new ForbiddenError("You don't have access to this organization.");
  }

  return organization;
}

/**
 * Same check as `requireOrgAccess`, but by id instead of slug — for the one
 * or two call sites (e.g. the uploads route) that already have the id in
 * scope and shouldn't do an extra slug round-trip just to reuse the other
 * function's signature.
 */
export async function requireOrgAccessById(
  auth: AuthContext,
  organizationId: string,
): Promise<OrganizationRow> {
  const { data: organization, error } = await auth.supabase
    .from("organizations")
    .select("id, slug, name, is_active")
    .eq("id", organizationId)
    .maybeSingle();

  if (error || !organization) {
    throw new NotFoundError("Organization not found.");
  }

  const hasAccess =
    auth.isPlatformAdmin || auth.membershipOrgIds.includes(organization.id);

  if (!hasAccess) {
    throw new ForbiddenError("You don't have access to this organization.");
  }

  return organization;
}

/**
 * Stricter variant for the one screen that's platform-admin-only even for
 * staff who otherwise manage this org's content: brand settings
 * (organizations table writes — see docs/RLS_POLICIES.md).
 */
export async function requirePlatformAdmin(auth: AuthContext): Promise<void> {
  if (!auth.isPlatformAdmin) {
    throw new ForbiddenError("This action requires a platform administrator.");
  }
}
