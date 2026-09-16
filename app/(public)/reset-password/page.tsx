import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Set a new password after a verified recovery link. Wired to
// POST /api/v1/auth/reset-password in Phase 2.
export default function ResetPasswordPage() {
  return (
    <ScreenPlaceholder
      title="Reset password"
      route="/reset-password"
      description="Set a new password after a verified recovery link."
    />
  );
}
