import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminThemeProvider } from "@/lib/theme/AdminThemeProvider";

/**
 * Shell for the entire protected admin area — sidebar-07's layout, adapted
 * with a brand switcher instead of a team switcher (see components/
 * app-sidebar.tsx). Redirects a signed-out visitor, or one with no admin/
 * staff access at all, before rendering anything.
 *
 * This is a UX convenience only — the real authorization boundary for every
 * write is `lib/api/org-guard.ts` + Row Level Security, not this layout. A
 * platform admin or staff member with access to at least one organization
 * passes this gate; per-organization/per-route access is still checked
 * further down (org-guard.ts on every API route, and eventually this
 * layout's own page-level checks for a forged `:org` in the URL — tracked
 * as a Phase 2 follow-up, not yet wired into every admin page).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const [{ data: isAdmin }, { data: memberships }, { data: profile }] = await Promise.all([
    supabase.rpc("is_platform_admin", { uid: user.id }),
    supabase.from("memberships").select("organization_id").eq("user_id", user.id),
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
  ]);

  const hasAdminAccess = Boolean(isAdmin) || (memberships?.length ?? 0) > 0;
  if (!hasAdminAccess) redirect("/");

  const adminUser = {
    name: profile?.display_name ?? user.email ?? "Account",
    email: user.email ?? "",
  };

  return (
    <AdminThemeProvider>
      <SidebarProvider>
        <AppSidebar user={adminUser} isPlatformAdmin={Boolean(isAdmin)} />
        <SidebarInset>
          <AdminHeader />
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AdminThemeProvider>
  );
}
