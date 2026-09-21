"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Grid2X2,
  Heart,
  Home,
  List,
  Lock,
  LogIn,
  Menu,
  Percent,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useComingSoon } from "@/components/common/ComingSoon";
import { Container } from "@/components/layout/Container";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { BRANDS, PRIMARY_BRAND_LOGO_SRC } from "@/lib/site-config";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  id: string;
  slug: string;
  title: string;
  type: "product" | "service";
  price: number;
  organization: { slug: string };
  item_images: { image_path: string; alt_text: string | null }[];
}

interface NavigationCategory {
  slug: string;
  name: string;
  organization: { slug: string };
}

/**
 * Ported from the client's design (colors/spacing/typography match the
 * design system tokens), with the transactional pieces (cart, delivery
 * messaging is display-only and harmless, but the cart control itself)
 * wired to the shared "coming soon" dialog instead of real behaviour — see
 * AGENTS.md.
 */
export function PublicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { trigger } = useComingSoon();
  const t = useTranslations("header");
  const [query, setQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState<number | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isOfferActive, setIsOfferActive] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categories, setCategories] = useState<NavigationCategory[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/auth/session")
      .then((response) => {
        if (!cancelled) setIsSignedIn(response.ok);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncOfferState = () => setIsOfferActive(new URLSearchParams(window.location.search).get("offer") === "true");
    syncOfferState();
    // Automatically close any open drawers or popovers on route change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileNavOpen(false);
    setIsCategoryMenuOpen(false);
    setIsSearchFocused(false);
    window.addEventListener("popstate", syncOfferState);
    return () => window.removeEventListener("popstate", syncOfferState);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/categories")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!cancelled && Array.isArray(body?.data)) setCategories(body.data as NavigationCategory[]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const searchTerm = query.trim();

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (!searchTerm) {
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
        return;
      }
      try {
        const response = await fetch(`/api/v1/catalog?q=${encodeURIComponent(searchTerm)}&pageSize=5`, {
          signal: controller.signal,
        });
        const body = (await response.json()) as { data?: SearchSuggestion[] };
        if (response.ok) {
          setSuggestions(body.data ?? []);
          setActiveSuggestionIndex(-1);
        }
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          setSuggestions([]);
          setActiveSuggestionIndex(-1);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
      openSuggestion(suggestions[activeSuggestionIndex]);
      return;
    }
    const trimmed = query.trim();
    router.push(trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : "/catalog");
    setIsSearchFocused(false);
    setMobileNavOpen(false);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isSearchFocused || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1 < suggestions.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev - 1 >= 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Escape") {
      setIsSearchFocused(false);
      setActiveSuggestionIndex(-1);
    }
  }

  function openSuggestion(item: SearchSuggestion) {
    setIsSearchFocused(false);
    setActiveSuggestionIndex(-1);
    router.push(`/brands/${item.organization.slug}/${item.slug}`);
  }

  // Shared by the desktop dropdown and the mobile drawer so both surfaces
  // show the same realtime results from one fetch.
  function renderSuggestionRows() {
    return (
          suggestions.length ? suggestions.map((item, idx) => {
            const cover = item.item_images[0];
            const isSelected = activeSuggestionIndex === idx;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveSuggestionIndex(idx)}
                onMouseDown={() => openSuggestion(item)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left transition",
                  isSelected
                    ? "bg-[var(--color-primary-50)] text-[var(--brand-primary)]"
                    : "hover:bg-[var(--color-primary-50)]/60"
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[var(--color-warning-100)]">
                  {cover ? <Image src={publicAssetUrl(cover.image_path)} alt="" width={40} height={40} className="h-full w-full object-cover" /> : <Search className="h-4 w-4 text-[var(--text-muted)]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{item.title}</span>
                  <span className="block text-xs text-[var(--text-secondary)]">{item.type === "service" ? t("typeService") : t("typeProduct")}</span>
                </span>
                <span className="shrink-0 text-sm font-bold text-[var(--brand-primary)]">৳{new Intl.NumberFormat("bn-BD").format(item.price)}</span>
              </button>
            );
          }) : <p className="px-4 py-5 text-sm text-[var(--text-secondary)]">{t("suggestionsEmpty")}</p>
    );
  }

  const navLinks = [
    { href: "/", label: t("navHome"), key: "home", icon: Home, isActive: pathname === "/" },
    { href: "/#brands", label: t("navBrands"), key: "brands", icon: Grid2X2, isActive: pathname.startsWith("/brands") },
    { href: "/catalog", label: t("navCatalog"), key: "catalog", icon: List, isActive: pathname === "/catalog" && !isOfferActive },
    { href: "/catalog?offer=true", label: t("navOffers"), key: "offers", icon: Percent, isActive: pathname === "/catalog" && isOfferActive },
  ];
  // Cart remains intentionally inert in this phase (AGENTS.md), so its
  // display count is zero until a future, explicitly scoped cart feature.
  const cartCount = 0;

  const categoriesByBrand = BRANDS.map((brand) => ({
    brand,
    categories: categories.filter((category) => category.organization.slug === brand.slug),
  }));

  return (
    <>
      {/* A quiet trust layer preserves the reference's information hierarchy
          without competing with the brand and search controls below. */}
      <div className="hidden bg-[var(--brand-primary)] text-xs text-white sm:block">
        <Container className="flex h-8 items-center justify-between gap-4">
          <span>{t("trustMessage")}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-white/75" /> {t("trustReliable")}</span>
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-white/75" /> {t("trustFastDelivery")}</span>
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-white/75" /> {t("trustSecure")}</span>
          </div>
        </Container>
      </div>

      <header className="sticky top-0 z-30 border-b border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]">
        <Container className="flex min-h-[68px] items-center justify-between gap-3 py-2 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-6">
          <Link href="/" className="flex shrink-0 items-center" aria-label="ORVEEN BAZAR.COM home">
            <Image
              src={PRIMARY_BRAND_LOGO_SRC}
              alt="ORVEEN BAZAR.COM"
              width={194}
              height={64}
              priority
              className="h-11 w-auto object-contain sm:h-12"
            />
          </Link>

          <div className="relative hidden w-full max-w-[680px] justify-self-center md:block">
            <form onSubmit={handleSearch} role="search" className="flex min-w-0 rounded-xl border border-[var(--border-default)] bg-[var(--color-neutral-100)] p-1 transition focus-within:border-[var(--brand-primary)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--brand-primary)_28%,transparent)]">
              <Search className="ml-3 h-5 w-5 shrink-0 self-center text-[var(--text-muted)]" aria-hidden="true" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 150)}
                placeholder={t("searchPlaceholder")}
                aria-label="Search products"
                aria-autocomplete="list"
                aria-expanded={isSearchFocused && suggestions.length > 0}
                className="h-10 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
              />
              {query ? (
                <button type="button" onClick={() => { setQuery(""); setSuggestions([]); setActiveSuggestionIndex(-1); }} className="mr-1 flex h-10 w-8 items-center justify-center text-[var(--text-muted)] transition hover:text-[var(--text-primary)]" aria-label={t("searchClear")}>
                  <X className="h-4 w-4" />
                </button>
              ) : null}
              <Button type="submit" className="h-10 rounded-lg bg-[var(--brand-secondary)] px-4 text-sm font-bold hover:bg-[var(--brand-secondary-hover)]" aria-label="Search">{t("searchButton")}</Button>
            </form>

            {isSearchFocused && query.trim() ? (
              <div role="listbox" aria-label="Suggested products" className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]">
                <p className="border-b border-[var(--border-default)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]">{t("suggestionsHeading")}</p>
                {renderSuggestionRows()}
              </div>
            ) : null}
          </div>

          <div className="ml-auto hidden shrink-0 items-center gap-1 sm:flex">
            <LanguageSwitcher />

            <Button variant="ghost" size="sm" className="h-14 min-w-16 flex-col gap-1 px-2 text-[var(--brand-primary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--brand-primary)]" nativeButton={false} render={<Link href="/account/wishlist" aria-label="Wishlist" />}>
              <span className="relative inline-flex">
                <Heart className="size-5" />
                {wishlistCount ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-secondary)] px-1 text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                ) : null}
              </span>
              <span className="text-[10px] leading-none font-bold">{t("wishlist")}</span>
            </Button>

            {/* Cart is display-only — see AGENTS.md. */}
            <Button variant="ghost" size="sm" className="h-14 min-w-16 flex-col gap-1 px-2 text-[var(--brand-primary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--brand-primary)]" aria-label="Cart (coming soon)" onClick={() => trigger("Cart")}>
              <span className="relative inline-flex">
                <ShoppingCart className="size-5" />
                {cartCount > 0 ? <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-secondary)] px-1 text-[10px] font-bold text-white">{cartCount}</span> : null}
              </span>
              <span className="text-[10px] leading-none font-bold">{t("cart")}</span>
            </Button>

            {isSignedIn ? (
              <Button variant="ghost" size="sm" className="h-14 min-w-16 flex-col gap-1 px-2 text-[var(--brand-primary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--brand-primary)]" nativeButton={false} render={<Link href="/account" aria-label="Account" />}>
                <UserRound className="size-5" />
                <span className="text-[10px] leading-none font-bold">{t("account")}</span>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="h-14 min-w-16 flex-col gap-1 px-2 text-[var(--brand-primary)] hover:bg-[var(--color-primary-50)] hover:text-[var(--brand-primary)]" nativeButton={false} render={<Link href="/login" aria-label="Log in" />}>
                <LogIn className="size-5" />
                <span className="text-[10px] leading-none font-bold">{t("login")}</span>
              </Button>
            )}
          </div>

          {/* Language toggle stays in the bar on mobile so it's always reachable without opening the drawer. */}
          <div className="ml-auto flex items-center gap-1 sm:hidden">
            <LanguageSwitcher compact />
            <Button
              variant="ghost"
              size="icon"
              className="text-[var(--text-primary)] hover:bg-[var(--color-primary-50)]"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={mobileNavOpen ? t("closeNav") : t("openNav")}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </Container>
      </header>

      <nav aria-label="Primary navigation" className="hidden bg-[var(--bg-surface)] md:block">
        <Container className="relative flex h-11 items-stretch gap-6 text-sm font-semibold text-[var(--text-primary)]">
          <div className="relative flex items-stretch" onBlur={() => window.setTimeout(() => setIsCategoryMenuOpen(false), 150)}>
            <button
              type="button"
              onClick={() => setIsCategoryMenuOpen((open) => !open)}
              aria-expanded={isCategoryMenuOpen}
              aria-haspopup="menu"
              className={`inline-flex items-center gap-1.5 border-b-2 px-1 transition-colors hover:text-[var(--brand-secondary)] ${isCategoryMenuOpen ? "border-[var(--brand-secondary)] text-[var(--brand-secondary)]" : "border-transparent"}`}
            >
              <Grid2X2 className="size-4" />
              {t("navAllCategories")}
              <ChevronDown className={`size-3.5 transition-transform ${isCategoryMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isCategoryMenuOpen ? (
              <div role="menu" className="absolute top-[calc(100%+1px)] left-0 z-40 grid w-[min(760px,calc(100vw-3rem))] grid-cols-3 gap-5 rounded-b-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-lg)]">
                {categoriesByBrand.map(({ brand, categories: brandCategories }) => (
                  <div key={brand.slug} className="min-w-0">
                    <Link href={`/brands/${brand.slug}`} onClick={() => setIsCategoryMenuOpen(false)} className="block border-b border-[var(--border-default)] pb-2 text-sm font-bold" style={{ color: brand.cardAccent }}>
                      {brand.name}
                    </Link>
                    <div className="mt-2 space-y-1">
                      {brandCategories.length ? brandCategories.map((category) => (
                        <Link key={category.slug} role="menuitem" href={`/catalog?org=${brand.slug}&category=${category.slug}`} onClick={() => setIsCategoryMenuOpen(false)} className="block rounded-md px-2 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--color-primary-50)] hover:text-[var(--brand-primary)]">
                          {category.name}
                        </Link>
                      )) : <p className="px-2 py-1.5 text-xs text-[var(--text-muted)]">{t("categoriesEmpty")}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setIsOfferActive(link.key === "offers")}
              className={`inline-flex items-center gap-1.5 border-b-2 px-1 transition-colors hover:text-[var(--brand-secondary)] ${link.isActive ? "border-[var(--brand-secondary)] text-[var(--brand-secondary)]" : "border-transparent"}`}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
          <button type="button" onClick={() => trigger("Contact page")} className="inline-flex items-center gap-1.5 border-b-2 border-transparent px-1 transition-colors hover:text-[var(--brand-secondary)]">
            <Phone className="size-4" />
            {t("navContact")}
          </button>
        </Container>
      </nav>

      {/* Mobile Top Drawer & Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden",
          mobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          "fixed inset-x-0 top-[68px] z-25 max-h-[calc(100vh-68px)] overflow-y-auto border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-[var(--container-pad)] py-4 shadow-xl transition-all duration-300 ease-out md:hidden",
          mobileNavOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <nav aria-label="Mobile navigation">
          <form onSubmit={handleSearch} role="search" className="mb-3 flex">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label="Search products"
              className="h-10 rounded-r-none border-r-0 bg-[var(--color-neutral-100)]"
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-11 rounded-l-none bg-[var(--brand-secondary)] hover:bg-[var(--brand-secondary-hover)]"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
          {query.trim() ? (
            <div role="listbox" aria-label="Suggested products" className="mb-3 overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
              <p className="border-b border-[var(--border-default)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)]">{t("suggestionsHeading")}</p>
              {renderSuggestionRows()}
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => {
                  setIsOfferActive(link.key === "offers");
                  setMobileNavOpen(false);
                }}
                className={`rounded-md px-3 py-2.5 text-sm font-semibold transition hover:bg-[var(--color-primary-50)] hover:text-[var(--brand-primary)] ${
                  link.isActive
                    ? "bg-[var(--color-primary-50)] text-[var(--brand-primary)]"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                trigger("Contact page");
              }}
              className="rounded-md px-3 py-2.5 text-left text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--color-primary-50)] hover:text-[var(--brand-primary)]"
            >
              {t("navContact")}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
