import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Name, email, password, validation, and email-confirmation state. Wired to
// POST /api/v1/auth/register in Phase 2; confirmation emails land in local
// Inbucket during development (see docs/SETUP.md).
export default function RegisterPage() {
  return (
    <ScreenPlaceholder
      title="Register"
      route="/register"
      description="Name, email, password, inline validation, and email-confirmation state."
    />
  );
}
