import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Request a password-reset link. Wired to POST /api/v1/auth/forgot-password
// in Phase 2. Always show the same success message whether or not the email
// exists, to avoid leaking account existence.
export default function ForgotPasswordPage() {
  return (
    <ScreenPlaceholder
      title="Forgot password"
      route="/forgot-password"
      description="Request a password-reset link."
    />
  );
}
