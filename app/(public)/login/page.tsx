import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Email/password login, "forgot password" link, and return-to-intended-page
// support (?redirect=) for the guest-wishlist-through-login flow described
// in docs/ARCHITECTURE.md. Wired to POST /api/v1/auth/login in Phase 2.
export default function LoginPage() {
  return (
    <ScreenPlaceholder
      title="Log in"
      route="/login"
      description="Email/password, recover-password link, return to intended page."
    />
  );
}
