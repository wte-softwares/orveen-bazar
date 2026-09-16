"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, Search, UserRound, X } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useUI, useWishlist } from "@/providers/StoreProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SearchBar } from "./SearchBar";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "@/components/ui/core";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", key: "nav.home" },
  { href: "/brands", key: "nav2.brands" },
  { href: "/catalog", key: "nav2.catalog" },
  { href: "/account/wishlist", key: "wishlist.title" },
  { href: "/about", key: "nav.about" },
  { href: "/dealer", key: "nav.dealer" },
  { href: "/corporate", key: "nav.corporate" },
  { href: "/contact", key: "nav.contact" },
  { href: "/faq", key: "faq.heading" },
] as const;

export function MobileNavigation() {
  const { t } = useLanguage();
  const { menuOpen, setMenuOpen, searchOpen, setSearchOpen } = useUI();
  const { ids } = useWishlist();
  const { user } = useAuth();
  const pathname = usePathname();
  const accountHref = user?.role === "customer" ? "/account" : "/admin";

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname, setMenuOpen, setSearchOpen]);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen, setMenuOpen, setSearchOpen]);

  return (
    <>
      {menuOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="anim-fade absolute inset-0 bg-[#0346A5]/50 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("header.menu")}
            className="anim-slide-right absolute left-0 top-0 flex h-full w-[85vw] max-w-xs flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8EA] px-4 py-3">
              <Logo compact />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t("header.close")}
                className="rounded-full border border-[#E2E8EA] p-2 text-[#66777D] transition hover:bg-[#EAF3FE]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
              <ul className="space-y-1">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={cn(
                        "block rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition",
                        pathname === link.href
                          ? "bg-[#EAF3FE] text-[#075ED1]"
                          : "text-[#17242A] hover:bg-[#F7F9FA]",
                      )}
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={user ? accountHref : "/login"}
                    className={cn(
                      "block rounded-xl px-3.5 py-2.5 text-[14px] font-semibold transition",
                      pathname.startsWith("/account") || pathname === "/login"
                        ? "bg-[#EAF3FE] text-[#075ED1]"
                        : "text-[#17242A] hover:bg-[#F7F9FA]",
                    )}
                  >
                    {user ? t("account.title") : t("auth.loginTitle")}
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="space-y-3 border-t border-[#E2E8EA] px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#66777D]">
                {t("common.language")}
              </p>
              <LanguageSwitcher variant="block" />
              <a
                href="https://wa.me/8801335189426"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#2D9819] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#238014]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                01335189426
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {searchOpen ? (
        <div className="fixed inset-x-0 top-0 z-[65] border-b border-[#E2E8EA] bg-white p-3 shadow-xl lg:hidden">
          <div className="flex items-center gap-2">
            <SearchBar autoFocus onSubmitted={() => setSearchOpen(false)} className="flex-1" />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label={t("header.close")}
              className="rounded-xl border border-[#E2E8EA] p-2.5 text-[#66777D]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Quick"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8EA] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {[
            { href: "/", label: t("nav.home"), icon: Home, badge: 0 },
            { href: "/catalog", label: t("nav2.catalog"), icon: LayoutGrid, badge: 0 },
            { action: "search", label: t("catalog.search"), icon: Search, badge: 0 },
            { href: "/account/wishlist", label: t("wishlist.title"), icon: Heart, badge: ids.length },
            { href: user ? accountHref : "/login", label: user ? t("account.title") : t("auth.loginTitle"), icon: UserRound, badge: 0 },
          ].map((item) => {
            const active = item.href ? pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) : false;
            const cls = cn(
              "relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition",
              active ? "text-[#075ED1]" : "text-[#66777D]",
            );
            const icon = (
              <span className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge > 0 ? (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2D9819] px-1 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </span>
            );
            return (
              <li key={item.label}>
                {item.href ? (
                  <Link href={item.href} className={cls} aria-current={active ? "page" : undefined}>
                    {icon}
                    <span className="max-w-full truncate px-1">{item.label}</span>
                  </Link>
                ) : (
                  <button type="button" onClick={() => setSearchOpen(true)} className={cls}>
                    {icon}
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
