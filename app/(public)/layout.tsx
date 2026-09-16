import type { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

/**
 * Shared shell for every public-facing route (family homepage, brand pages,
 * catalog, auth, account). Grouped under `(public)` — a route group, so it
 * adds no `/public` prefix to any URL — specifically so it can apply one
 * header/footer to several unrelated top-level paths without also wrapping
 * the admin area, which gets its own dashboard shell in `app/admin/layout.tsx`.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
