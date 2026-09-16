import type { ReactNode } from "react";

/**
 * Shell for the entire protected admin area. Not a route group (unlike
 * `(public)`) because every admin page genuinely lives under the `/admin`
 * URL prefix, which also makes it trivial to exclude from the public site's
 * header/footer.
 *
 * PHASE 2: this layout must perform the server-side "is this user signed in
 * AND (platform admin OR has at least one active membership)?" check before
 * rendering anything, redirecting to /login?redirect=/admin otherwise. This
 * is a UX convenience only — the real authorization boundary for every
 * write is `lib/api/org-guard.ts` + Row Level Security, not this layout.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Phase 2 adds a sidebar here: org switcher + section nav. */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
