import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Minimal placeholder header for the public site shell. Intentionally plain —
 * real navigation, brand switcher, and mobile menu are built once the
 * client's UI/UX designs arrive (see AGENTS.md, "what NOT to build yet").
 * Keeps every public page under a shared, consistent shell in the meantime.
 */
export function PublicHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          ORVEEN BAZAR
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" render={<Link href="/catalog">Catalog</Link>} />
          <Button
            variant="ghost"
            render={<Link href="/account/wishlist">Wishlist</Link>}
          />
          <Button variant="outline" render={<Link href="/login">Log in</Link>} />
        </nav>
      </div>
    </header>
  );
}
