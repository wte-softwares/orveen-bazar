"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, UserRound } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useUI, useWishlist } from "@/providers/StoreProvider";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/brands", key: "nav2.brands" },
  { href: "/catalog", key: "nav2.catalog" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
] as const;

export function Header() {
  const { t } = useLanguage();
  const { ids } = useWishlist();
  const { user } = useAuth();
  const { setMenuOpen } = useUI();
  const pathname = usePathname();
  const accountHref = user?.role === "customer" ? "/account" : "/admin";

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8EA] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 lg:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t("header.menu")}
          className="rounded-xl border border-[#E2E8EA] p-2 text-[#0346A5] transition hover:bg-[#EAF3FE] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Logo compact />

        <SearchBar className="mx-auto hidden w-full max-w-2xl md:block" />

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <span className="mr-1 hidden md:block">
            <LanguageSwitcher tone="dark" />
          </span>
          <Link
            href="/account/wishlist"
            aria-label={t("wishlist.title")}
            className="relative flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[#0346A5] transition hover:bg-[#EAF3FE]"
          >
            <span className="relative inline-flex">
              <Heart className="h-5 w-5" />
              {ids.length > 0 ? (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2D9819] px-1 text-[10px] font-bold text-white">
                  {ids.length}
                </span>
              ) : null}
            </span>
            <span className="hidden text-[11px] font-medium lg:block">{t("wishlist.title")}</span>
          </Link>
          <Link
            href={user ? accountHref : "/login"}
            aria-label={user ? t("account.title") : t("auth.loginTitle")}
            className="flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[#0346A5] transition hover:bg-[#EAF3FE]"
          >
            <UserRound className="h-5 w-5" />
            <span className="hidden max-w-24 truncate text-[11px] font-medium lg:block">
              {user ? user.name.split(" ")[0] : t("auth.loginTitle")}
            </span>
          </Link>
        </div>
      </div>

      <div className="border-t border-[#E2E8EA]/70 px-3 pb-2.5 pt-2 md:hidden">
        <SearchBar />
      </div>

      <nav aria-label="Main" className="hidden border-t border-[#E2E8EA] bg-white lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 px-4 lg:px-8">
          {navLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block px-3.5 py-2.5 text-[13.5px] font-semibold transition",
                    active
                      ? "border-b-2 border-[#2D9819] text-[#075ED1]"
                      : "text-[#17242A] hover:bg-[#EAF3FE] hover:text-[#075ED1]",
                  )}
                >
                  {t(link.key)}
                </Link>
              </li>
            );
          })}
          <li className="ml-auto">
            <Link
              href="/dealer"
              className="block px-3.5 py-2.5 text-[13.5px] font-semibold text-[#17242A] transition hover:bg-[#EAF3FE] hover:text-[#075ED1]"
            >
              {t("nav.dealer")}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
