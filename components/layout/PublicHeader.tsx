"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Lock, ShieldCheck, ShoppingCart, Truck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useComingSoon } from "@/components/common/ComingSoon";

/**
 * Ported from the client's design (colors/spacing/typography match the
 * design system tokens), with the transactional pieces (cart, delivery
 * messaging is display-only and harmless, but the cart control itself)
 * wired to the shared "coming soon" dialog instead of real behaviour — see
 * AGENTS.md.
 */
export function PublicHeader() {
  const router = useRouter();
  const { trigger } = useComingSoon();
  const [query, setQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState<number | null>(null);

  // Best-effort — a signed-out visitor gets a 401 and the badge just stays
  // hidden, which is the correct behaviour, not an error to surface.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!cancelled && Array.isArray(body?.data)) setWishlistCount(body.data.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : "/catalog");
  }

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-surface)]">
      {/* Trust bar — static marketing copy, not a feature surface. */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 bg-[var(--color-primary-50)] px-[5vw] py-1.5 text-xs text-[var(--text-secondary)]">
        <span>Bangladesh&rsquo;s trusted online shopping platform</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-secondary)]" /> Reliable products
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-[var(--brand-secondary)]" /> Fast delivery
          </span>
          <span className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-[var(--brand-secondary)]" /> Secure shopping
          </span>
        </div>
      </div>

      {/* Main row: wordmark, search, language, wishlist, cart, account. */}
      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border-default)] px-[5vw] py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="font-heading text-lg font-extrabold text-[var(--brand-primary)]">
            ORVEEN <span className="text-[var(--brand-secondary)]">BAZAR</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} role="search" className="order-last flex min-w-0 flex-1 basis-full gap-2 sm:order-none sm:basis-auto">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products… (e.g. soybean oil, sugar, detergent)"
            aria-label="Search products"
          />
          <Button type="submit">Search</Button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => trigger("English language")}
            aria-label="Switch language"
          >
            বাংলা / EN
          </Button>

          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/account/wishlist" aria-label="Wishlist" />}>
            <span className="relative inline-flex">
              <Heart className="h-5 w-5" />
              {wishlistCount ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-secondary)] px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              ) : null}
            </span>
          </Button>

          {/* Cart is display-only — see AGENTS.md. */}
          <Button variant="ghost" size="icon" aria-label="Cart (coming soon)" onClick={() => trigger("Cart")}>
            <span className="relative inline-flex">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 text-[10px] font-bold text-white">
                0
              </span>
            </span>
          </Button>

          <Button variant="outline" nativeButton={false} render={<Link href="/login"><UserRound className="h-4 w-4" />Log in</Link>} />
        </div>
      </div>

      {/* Primary nav. */}
      <nav className="flex flex-wrap items-center gap-1 px-[5vw] py-2 text-sm font-medium">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/">Home</Link>} />
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/#brands">Brands</Link>} />
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/catalog">Catalog</Link>} />
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/catalog">Offers</Link>} />
        <Button variant="ghost" size="sm" onClick={() => trigger("Contact page")}>
          Contact
        </Button>
      </nav>
    </header>
  );
}
