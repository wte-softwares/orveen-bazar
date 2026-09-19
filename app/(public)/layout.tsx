import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ComingSoonProvider } from "@/components/common/ComingSoon";

/**
 * Shared shell for every public-facing route (family homepage, brand pages,
 * catalog, account). Grouped under `(public)` — a route group, so it adds no
 * `/public` prefix to any URL — specifically so it can apply one
 * header/footer to several unrelated top-level paths without also wrapping
 * the admin area (its own shell in `app/admin/layout.tsx`) or the
 * standalone auth pages (`app/login`, `app/register` — full-bleed, no site
 * chrome, outside this group on purpose).
 *
 * ComingSoonProvider is mounted here (not the root layout) because only the
 * public site currently has controls that need it — see AGENTS.md.
 * `LocaleProvider` now lives in the root layout instead, since the admin
 * area and the auth pages need the language switcher too.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ComingSoonProvider>
      <div className="flex min-h-screen flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
        <PublicHeader />
        <main className="flex-1 pb-16 sm:pb-0">{children}</main>
        <PublicFooter />
        <MobileBottomNav />
      </div>
    </ComingSoonProvider>
  );
}

