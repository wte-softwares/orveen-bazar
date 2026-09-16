import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// View email, edit display name, sign out. Email change is out of scope per
// the brief. Requires an authenticated session — Phase 2 adds the redirect-
// to-login-if-signed-out check here.
export default function AccountPage() {
  return (
    <ScreenPlaceholder
      title="Account"
      route="/account"
      description="View email, edit display name, sign out."
    />
  );
}
