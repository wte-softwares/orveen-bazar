import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Admin dashboard read logic — counts and a recent-items list scoped by
 * Row Level Security to whatever the calling user (platform admin or
 * org staff) can actually see. Centralized here for the same reason as
 * lib/queries/catalog.ts and lib/queries/brands.ts: if a future mobile
 * admin view needs the same numbers, it calls this function from its own
 * `/api/v1/admin/overview` route instead of re-deriving the counts.
 *
 * Deliberately excludes anything sales/order-shaped (no revenue, no order
 * counts) — see AGENTS.md, "What this project is explicitly NOT."
 */

export interface AdminOverviewStats {
  publishedItems: number;
  draftItems: number;
  categories: number;
  activeBanners: number;
}

export async function getAdminOverviewStats(
  supabase: SupabaseClient<Database>,
): Promise<AdminOverviewStats> {
  const [published, draft, categories, banners] = await Promise.all([
    supabase.from("catalog_items").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("catalog_items").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("banners").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return {
    publishedItems: published.count ?? 0,
    draftItems: draft.count ?? 0,
    categories: categories.count ?? 0,
    activeBanners: banners.count ?? 0,
  };
}

export interface AdminRecentItem {
  id: string;
  title: string;
  type: string;
  price: number;
  status: string;
  category: { name: string } | null;
  organization: { slug: string } | null;
}

export async function listRecentCatalogItemsForAdmin(
  supabase: SupabaseClient<Database>,
  limit = 8,
): Promise<AdminRecentItem[]> {
  const { data, error } = await supabase
    .from("catalog_items")
    .select("id, title, type, price, status, category:categories(name), organization:organizations(slug)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as AdminRecentItem[];
}

export interface AdminUserMembership {
  id: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  role: "staff";
  createdAt: string;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  displayName: string | null;
  isPlatformAdmin: boolean;
  status: "active" | "invited";
  invitedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string;
  memberships: AdminUserMembership[];
}

export interface AdminOrganizationOption {
  id: string;
  slug: string;
  name: string;
}

export async function listAdminOrganizations(
  supabase: SupabaseClient<Database>,
): Promise<AdminOrganizationOption[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, slug")
    .eq("is_active", true)
    .order("slug");

  if (error) throw error;
  const { getBrandConfig } = await import("@/lib/site-config");
  return (data ?? []).map((org) => ({
    id: org.id,
    slug: org.slug,
    name: getBrandConfig(org.slug)?.name ?? org.slug,
  }));
}

export async function listAdminUsers(): Promise<{
  users: AdminUserListItem[];
  memberships: Array<{
    id: string;
    user_id: string;
    role: string;
    email: string | null;
    organization: { id: string; slug: string; name: string } | null;
  }>;
  platformAdmins: Array<{ user_id: string; email: string | null }>;
}> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { getBrandConfig } = await import("@/lib/site-config");
  const admin = createAdminClient();

  const [
    { data: memberships, error: membershipsError },
    { data: admins, error: adminsError },
    { data: profiles, error: profilesError },
    { data: authUsers, error: authUsersError },
  ] = await Promise.all([
    admin
      .from("memberships")
      .select("id, user_id, role, created_at, organization:organizations(id, slug)"),
    admin.from("platform_admins").select("user_id, created_at"),
    admin.from("profiles").select("user_id, display_name"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (membershipsError) throw membershipsError;
  if (adminsError) throw adminsError;
  if (profilesError) throw profilesError;
  if (authUsersError) throw authUsersError;

  const authMap = new Map<
    string,
    {
      id: string;
      email: string;
      invitedAt: string | null;
      lastSignInAt: string | null;
      createdAt: string;
      displayName: string | null;
    }
  >();

  for (const user of authUsers.users) {
    authMap.set(user.id, {
      id: user.id,
      email: user.email ?? "",
      invitedAt: user.invited_at ?? null,
      lastSignInAt: user.last_sign_in_at ?? null,
      createdAt: user.created_at,
      displayName: (user.user_metadata?.display_name as string) ?? null,
    });
  }

  const profileNameById = new Map<string, string>();
  for (const p of profiles ?? []) {
    if (p.display_name) profileNameById.set(p.user_id, p.display_name);
  }

  const adminSet = new Set((admins ?? []).map((a) => a.user_id));
  const roleUserIds = new Set<string>();
  for (const a of admins ?? []) roleUserIds.add(a.user_id);
  for (const m of memberships ?? []) roleUserIds.add(m.user_id);

  const membershipsByUser = new Map<string, AdminUserMembership[]>();
  for (const m of memberships ?? []) {
    const orgSlug = (m.organization as { id: string; slug: string } | null)?.slug ?? "";
    const orgId = (m.organization as { id: string; slug: string } | null)?.id ?? "";
    const orgName = getBrandConfig(orgSlug)?.name ?? orgSlug;
    const list = membershipsByUser.get(m.user_id) ?? [];
    list.push({
      id: m.id,
      organizationId: orgId,
      organizationSlug: orgSlug,
      organizationName: orgName,
      role: "staff",
      createdAt: m.created_at,
    });
    membershipsByUser.set(m.user_id, list);
  }

  const users: AdminUserListItem[] = Array.from(roleUserIds).map((userId) => {
    const authData = authMap.get(userId);
    const displayName = profileNameById.get(userId) ?? authData?.displayName ?? null;
    const isPlatformAdmin = adminSet.has(userId);
    const userMemberships = membershipsByUser.get(userId) ?? [];
    const isInvited = Boolean(authData?.invitedAt && !authData?.lastSignInAt);

    return {
      id: userId,
      email: authData?.email ?? "",
      displayName,
      isPlatformAdmin,
      memberships: userMemberships,
      status: isInvited ? "invited" : "active",
      invitedAt: authData?.invitedAt ?? null,
      lastSignInAt: authData?.lastSignInAt ?? null,
      createdAt: authData?.createdAt ?? new Date().toISOString(),
    };
  });

  return {
    users,
    memberships: (memberships ?? []).map((m) => {
      const authData = authMap.get(m.user_id);
      const orgSlug = (m.organization as { id: string; slug: string } | null)?.slug ?? "";
      const orgId = (m.organization as { id: string; slug: string } | null)?.id ?? "";
      return {
        ...m,
        email: authData?.email ?? null,
        organization: m.organization
          ? { id: orgId, slug: orgSlug, name: getBrandConfig(orgSlug)?.name ?? orgSlug }
          : null,
      };
    }),
    platformAdmins: (admins ?? []).map((a) => ({
      ...a,
      email: authMap.get(a.user_id)?.email ?? null,
    })),
  };
}

export interface OrgStaffMember {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string | null;
  created_at: string;
}

export async function listOrgStaffMembers(
  organizationId: string,
): Promise<OrgStaffMember[]> {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const [
    { data: memberships, error: memError },
    { data: profiles, error: profError },
    { data: authUsers, error: authError },
  ] = await Promise.all([
    admin
      .from("memberships")
      .select("id, user_id, created_at")
      .eq("organization_id", organizationId)
      .eq("role", "staff")
      .order("created_at"),
    admin.from("profiles").select("user_id, display_name"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (memError) throw memError;
  if (profError) throw profError;
  if (authError) throw authError;

  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));
  const authMap = new Map(authUsers.users.map((u) => [u.id, u.email ?? ""]));

  return (memberships ?? []).map((m) => ({
    id: m.id,
    user_id: m.user_id,
    user_email: authMap.get(m.user_id) ?? "",
    user_full_name: profileMap.get(m.user_id) ?? null,
    created_at: m.created_at,
  }));
}

