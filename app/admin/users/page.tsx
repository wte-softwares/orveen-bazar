import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Admin-only staff assignment and access removal. No unrestricted permission
// builder — the only role this screen ever grants/revokes is org-scoped
// "staff" membership (see docs/DATA_MODEL.md).
export default function AdminUsersPage() {
  return (
    <ScreenPlaceholder
      title="Users"
      route="/admin/users"
      description="Admin-only staff assignment and access removal."
    />
  );
}
