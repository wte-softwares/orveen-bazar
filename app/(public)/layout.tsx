import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ComingSoonProvider } from "@/components/common/ComingSoon";

/**
 * Shared shell for every public-facing route (family homepage, brand pages,
 * catalog, auth, account). Grouped under `(public)` — a route group, so it
 * adds no `/public` prefix to any URL — specifically so it can apply one
 * header/footer to several unrelated top-level paths without also wrapping
 * the admin area, which gets its own dashboard shell in `app/admin/layout.tsx`.
 *
 * ComingSoonProvider is mounted here (not in the root layout) because only
 * the public site currently has controls that need it — see AGENTS.md.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ComingSoonProvider>
      <div className="flex min-h-screen flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </ComingSoonProvider>
  );
}
