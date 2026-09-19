import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listAdminUsers, listAdminOrganizations } from "@/lib/queries/admin";
import { UserManagementContent } from "@/components/admin/UserManagementContent";

/**
 * Server Component for the User & Role Management screen.
 * Gated to Platform Administrators only — redirects any staff member
 * or unauthenticated user back to /admin.
 */
export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/users");
  }

  // Security gate: Platform admin access required
  const { data: isAdmin, error: adminCheckError } = await supabase.rpc(
    "is_platform_admin",
    { uid: user.id },
  );

  if (adminCheckError || !isAdmin) {
    redirect("/admin");
  }

  const [{ users }, organizations] = await Promise.all([
    listAdminUsers(),
    listAdminOrganizations(supabase),
  ]);

  return (
    <UserManagementContent
      initialUsers={users}
      organizations={organizations}
      currentUserId={user.id}
    />
  );
}
