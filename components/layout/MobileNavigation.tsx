"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Home,
  LayoutGrid,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCart, useUI, useWishlist } from "@/providers/StoreProvider";
import { categories } from "@/data/categories";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SearchBar } from "./SearchBar";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "@/components/ui/core";
import { company } from "@/data/company";
import { cn, formatNumber } from "@/lib/utils";

const links = [
  { href: "/", key: "nav.home" },
  { href: "/shop", key: "nav.shop" },
  { href: "/offers", key: "nav.offers" },
  { href: "/dealer", key: "nav.dealer" },
  { href: "/corporate", key: "nav.corporate" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
  { href: "/faq", key: "faq.heading" },
  { href: "/account", key: "header.account" },
] as const;

export function MobileNavigation() {
  const { t, pick, language } = useLanguage();
  const { menuOpen, setMenuOpen, searchOpen, setSearchOpen } = useUI();
  const { count } = useCart();
  const { ids } = useWishlist();
  const pathname = usePathname();
  const [catsOpen, setCatsOpen] = useState(false);

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
      {/* Slide-in menu */}
      {menuOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="anim-fade absolute inset-0 bg-[#16339B]/50 backdrop-blur-[2px]"
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
                className="rounded-full border border-[#E2E8EA] p-2 text-[#66777D] transition hover:bg-[#E8F0FE]"
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
                          ? "bg-[#E8F0FE] text-[#1D4ED8]"
                          : "text-[#17242A] hover:bg-[#F5F8FE]",
                      )}
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => setCatsOpen((v) => !v)}
                    aria-expanded={catsOpen}
                    className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[14px] font-semibold text-[#17242A] transition hover:bg-[#F5F8FE]"
                  >
                    {t("nav.categories")}
                    <ChevronDown className={cn("h-4 w-4 transition", catsOpen && "rotate-180")} />
                  </button>
                  {catsOpen ? (
                    <ul className="mt-1 space-y-0.5 border-l-2 border-[#E8F0FE] pl-3">
                      {categories.map((cat) => (
                        <li key={cat.slug}>
                          <Link
                            href={`/category/${cat.slug}`}
                            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] text-[#17242A] transition hover:bg-[#E8F0FE]"
                          >
                            <span className="truncate">{pick(cat.name)}</span>
                            {cat.comingSoon ? (
                              <span className="shrink-0 text-[10px] font-semibold text-[#8A6400]">
                                {t("categories.comingSoon")}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
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
                className="flex items-center justify-center gap-2 rounded-xl bg-[#2E9E44] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#1F7A33]"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {company.whatsappLocal}
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {/* Search overlay */}
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

      {/* Bottom navigation */}
      <nav
        aria-label="Quick"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8EA] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {[
            { href: "/", label: t("nav.home"), icon: Home, badge: 0 },
            { href: "/shop", label: t("nav.categories"), icon: LayoutGrid, badge: 0 },
            { action: "search", label: t("common.search"), icon: Search, badge: 0 },
            { href: "/wishlist", label: t("header.wishlist"), icon: Heart, badge: ids.length },
            { action: "cart", label: t("header.cart"), icon: ShoppingCart, badge: count },
          ].map((item) => {
            const active = item.href ? pathname === item.href : false;
            const cls = cn(
              "relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition",
              active ? "text-[#1D4ED8]" : "text-[#66777D]",
            );
            const icon = (
              <span className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge > 0 ? (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2E9E44] px-1 text-[9px] font-bold text-white">
                    {formatNumber(item.badge, language)}
                  </span>
                ) : null}
              </span>
            );
            return (
              <li key={item.label}>
                {item.href ? (
                  <Link href={item.href} className={cls} aria-current={active ? "page" : undefined}>
                    {icon}
                    {item.label}
                  </Link>
                ) : item.action === "search" ? (
                  <button type="button" onClick={() => setSearchOpen(true)} className={cls}>
                    {icon}
                    {item.label}
                  </button>
                ) : (
                  <Link href="/cart" className={cls}>
                    {icon}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
